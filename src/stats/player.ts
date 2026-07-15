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

/** Ranked Solo/Duo queue id */
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
  level: number;
  profileIconId: number;
  soloRank: RankSnapshot | null;
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
  /** How many recent ranked matches to analyze. */
  matchCount?: number;
  /**
   * Cap unique opponents to look up for average rank (rate-limit friendly).
   * Set to 0 to skip opponent rank calculation.
   */
  maxOpponentLookups?: number;
}

export async function buildPlayerRecentStats(
  client: RiotClient,
  region: RegionConfig,
  gameName: string,
  tagLine: string,
  options: BuildStatsOptions = {},
): Promise<RecentStats> {
  const matchCount = options.matchCount ?? 12;
  const maxOpponentLookups = options.maxOpponentLookups ?? 20;

  const account = await client.getAccountByRiotId(region, gameName, tagLine);
  const summoner = await client.getSummonerByPuuid(region, account.puuid);

  const leagues = await client.getLeagueEntriesByPuuid(region, account.puuid);
  const solo = leagues.find((e) => e.queueType === "RANKED_SOLO_5x5");

  const matchIds = await client.getMatchIdsByPuuid(region, account.puuid, {
    count: matchCount,
    queue: QUEUE_RANKED_SOLO,
  });

  const matches: MatchDto[] = [];
  for (const id of matchIds) {
    matches.push(await client.getMatch(region, id));
  }

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
    );
    avgOpponentRank = result.label;
    avgOpponentTier = result.tier;
    opponentsSampled = result.sampled;
  }

  return {
    riotId: `${account.gameName}#${account.tagLine}`,
    region,
    level: summoner.summonerLevel,
    profileIconId: summoner.profileIconId,
    soloRank: solo
      ? {
          tier: solo.tier,
          division: solo.rank,
          lp: solo.leaguePoints,
          wins: solo.wins,
          losses: solo.losses,
          hotStreak: Boolean(solo.hotStreak),
          formatted: formatRank(solo.tier, solo.rank, solo.leaguePoints),
        }
      : null,
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
      const solo = pickBestSoloEntry(entries);
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

function pickBestSoloEntry(entries: LeagueEntry[]): LeagueEntry | undefined {
  return (
    entries.find((e) => e.queueType === "RANKED_SOLO_5x5") ??
    entries.find((e) => e.queueType === "RANKED_FLEX_SR")
  );
}
