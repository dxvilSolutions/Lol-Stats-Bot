import type { QueueConfig } from "../config/queues.js";
import { QUEUES } from "../config/queues.js";
import type { RegionConfig } from "../config/regions.js";
import type { RiotClient } from "../riot/client.js";
import { RiotApiError } from "../riot/types.js";
import type { LeagueEntry, MatchDto, MatchParticipant } from "../riot/types.js";
import {
  approxRankFromScore,
  approxRankPartsFromScore,
  formatRank,
  rankScore,
} from "./rank.js";

/** @deprecated use queues config — kept for any leftover imports */
export const QUEUE_RANKED_SOLO = 420;

export interface ChampionUsage {
  champion: string;
  games: number;
  wins: number;
  winrate: number;
  avgKda: string;
}

export interface RankSnapshot {
  tier: string;
  division: string;
  lp: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  formatted: string;
}

export interface RecentStats {
  riotId: string;
  region: RegionConfig;
  queue: QueueConfig;
  level: number;
  profileIconId: number;
  /** Rank for this mode when ranked (Solo or Flex). */
  modeRank: RankSnapshot | null;
  sampleSize: number;
  wins: number;
  losses: number;
  winrate: number;
  avgKda: number;
  avgKdaText: string;
  topChampions: ChampionUsage[];
  avgOpponentRank: string | null;
  avgOpponentTier: string | null;
  opponentsSampled: number;
}

export interface BuildStatsOptions {
  matchCount?: number;
  maxOpponentLookups?: number;
  queue: QueueConfig;
}

export async function buildPlayerRecentStats(
  client: RiotClient,
  region: RegionConfig,
  gameName: string,
  tagLine: string,
  options: BuildStatsOptions,
): Promise<RecentStats> {
  const matchCount = options.matchCount ?? 12;
  const queue = options.queue;
  const maxOpponentLookups = queue.opponentElo
    ? (options.maxOpponentLookups ?? 20)
    : 0;

  const account = await client.getAccountByRiotId(region, gameName, tagLine);
  const summoner = await client.getSummonerByPuuid(region, account.puuid);

  let modeRank: RankSnapshot | null = null;
  if (queue.leagueQueueType) {
    const leagues = await client.getLeagueEntriesByPuuid(region, account.puuid);
    const entry = leagues.find((e) => e.queueType === queue.leagueQueueType);
    if (entry) {
      modeRank = {
        tier: entry.tier,
        division: entry.rank,
        lp: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        hotStreak: Boolean(entry.hotStreak),
        formatted: formatRank(entry.tier, entry.rank, entry.leaguePoints),
      };
    }
  }

  const matches = await fetchMatchesForQueue(
    client,
    region,
    account.puuid,
    queue,
    matchCount,
  );

  const selfGames = matches
    .map((m) => m.info.participants.find((p) => p.puuid === account.puuid))
    .filter((p): p is MatchParticipant => p != null);

  const wins = selfGames.filter((p) => p.win).length;
  const losses = selfGames.length - wins;
  const winrate = selfGames.length
    ? Math.round((wins / selfGames.length) * 1000) / 10
    : 0;

  const avgKda = averageKda(selfGames);
  const topChampions = computeTopChampions(selfGames, 3);

  let avgOpponentRank: string | null = null;
  let avgOpponentTier: string | null = null;
  let opponentsSampled = 0;

  if (maxOpponentLookups > 0 && selfGames.length > 0) {
    const result = await averageOpponentRank(
      client,
      region,
      account.puuid,
      matches,
      maxOpponentLookups,
      queue.leagueQueueType ?? "RANKED_SOLO_5x5",
    );
    avgOpponentRank = result.label;
    avgOpponentTier = result.tier;
    opponentsSampled = result.sampled;
  }

  return {
    riotId: `${account.gameName}#${account.tagLine}`,
    region,
    queue,
    level: summoner.summonerLevel,
    profileIconId: summoner.profileIconId,
    modeRank,
    sampleSize: selfGames.length,
    wins,
    losses,
    winrate,
    avgKda,
    avgKdaText: formatKda(avgKda),
    topChampions,
    avgOpponentRank,
    avgOpponentTier,
    opponentsSampled,
  };
}

export async function fetchMatchesForQueue(
  client: RiotClient,
  region: RegionConfig,
  puuid: string,
  queue: QueueConfig,
  count: number,
): Promise<MatchDto[]> {
  const matchIds = await collectMatchIds(client, region, puuid, queue, count);
  const matches: MatchDto[] = [];
  let blocked = 0;

  for (const id of matchIds) {
    if (matches.length >= count) break;
    try {
      const match = await client.getMatch(region, id);
      if (queue.queueIds && queue.queueIds.length > 1) {
        if (!queue.queueIds.includes(match.info.queueId)) continue;
      }
      matches.push(match);
    } catch (err) {
      if (err instanceof RiotApiError && (err.status === 403 || err.status === 404)) {
        blocked += 1;
        continue;
      }
      throw err;
    }
  }

  if (
    matches.length === 0 &&
    blocked > 0 &&
    (queue.detailsOftenPrivate || blocked === matchIds.length)
  ) {
    throw new ModeDetailsPrivateError(queue.alias);
  }

  return matches;
}

async function collectMatchIds(
  client: RiotClient,
  region: RegionConfig,
  puuid: string,
  queue: QueueConfig,
  count: number,
): Promise<string[]> {
  const multi = queue.queueIds && queue.queueIds.length > 1;

  if (!multi) {
    return client.getMatchIdsByPuuid(region, puuid, {
      count,
      queue: queue.queueId,
    });
  }

  if (queue.matchType) {
    return client.getMatchIdsByPuuid(region, puuid, {
      count: Math.min(100, Math.max(count * 3, count + 10)),
      type: queue.matchType,
    });
  }

  // Multiple queue IDs without a match type (e.g. ARAM: Mayhem variants)
  const seen = new Set<string>();
  const ids: string[] = [];
  const perQueue = Math.min(20, Math.max(count, Math.ceil(count / 2) + 2));

  for (const qid of queue.queueIds!) {
    const batch = await client.getMatchIdsByPuuid(region, puuid, {
      count: perQueue,
      queue: qid,
    });
    for (const id of batch) {
      if (seen.has(id)) continue;
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

/** Thrown when Riot blocks match detail payloads for a mode (often 403). */
export class ModeDetailsPrivateError extends Error {
  readonly alias: string;

  constructor(alias: string) {
    super(`Mode details private: ${alias}`);
    this.name = "ModeDetailsPrivateError";
    this.alias = alias;
  }
}

function averageKda(games: MatchParticipant[]): number {
  if (games.length === 0) return 0;
  const total = games.reduce((sum, g) => {
    const deaths = Math.max(g.deaths, 1);
    return sum + (g.kills + g.assists) / deaths;
  }, 0);
  return total / games.length;
}

function formatKda(value: number): string {
  return value.toFixed(2);
}

function computeTopChampions(
  games: MatchParticipant[],
  limit: number,
): ChampionUsage[] {
  const map = new Map<
    string,
    { games: number; wins: number; kdaSum: number }
  >();

  for (const g of games) {
    const cur = map.get(g.championName) ?? { games: 0, wins: 0, kdaSum: 0 };
    cur.games += 1;
    cur.wins += g.win ? 1 : 0;
    cur.kdaSum += (g.kills + g.assists) / Math.max(g.deaths, 1);
    map.set(g.championName, cur);
  }

  return [...map.entries()]
    .map(([champion, s]) => ({
      champion,
      games: s.games,
      wins: s.wins,
      winrate: Math.round((s.wins / s.games) * 1000) / 10,
      avgKda: formatKda(s.kdaSum / s.games),
    }))
    .sort((a, b) => b.games - a.games || b.winrate - a.winrate)
    .slice(0, limit);
}

async function averageOpponentRank(
  client: RiotClient,
  region: RegionConfig,
  selfPuuid: string,
  matches: MatchDto[],
  maxLookups: number,
  preferredQueue: string,
): Promise<{ label: string | null; tier: string | null; sampled: number }> {
  const opponents = new Set<string>();

  for (const match of matches) {
    const self = match.info.participants.find((p) => p.puuid === selfPuuid);
    if (!self) continue;
    for (const p of match.info.participants) {
      if (p.teamId !== self.teamId) opponents.add(p.puuid);
    }
  }

  const sample = [...opponents].slice(0, maxLookups);
  const scores: number[] = [];

  for (const puuid of sample) {
    try {
      const entries = await client.getLeagueEntriesByPuuid(region, puuid);
      const solo = pickBestEntry(entries, preferredQueue);
      if (solo) {
        scores.push(rankScore(solo.tier, solo.rank, solo.leaguePoints));
      }
    } catch (err) {
      if (!(err instanceof RiotApiError)) throw err;
    }
  }

  if (scores.length === 0) {
    return { label: null, tier: null, sampled: 0 };
  }

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const parts = approxRankPartsFromScore(avg);
  return {
    label: approxRankFromScore(avg),
    tier: parts?.tier ?? null,
    sampled: scores.length,
  };
}

function pickBestEntry(
  entries: LeagueEntry[],
  preferredQueue: string,
): LeagueEntry | undefined {
  return (
    entries.find((e) => e.queueType === preferredQueue) ??
    entries.find((e) => e.queueType === "RANKED_SOLO_5x5") ??
    entries.find((e) => e.queueType === "RANKED_FLEX_SR")
  );
}

/** Resolve default solo queue without circular imports in old call sites. */
export function defaultSoloQueue(): QueueConfig {
  return QUEUES[0]!;
}
