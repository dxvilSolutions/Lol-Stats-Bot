import type { QueueConfig } from "../config/queues.js";
import type { RegionConfig } from "../config/regions.js";
import type { RiotClient } from "../riot/client.js";
import type { MatchDto, MatchParticipant } from "../riot/types.js";
import { fetchMatchesForQueue } from "./player.js";

export interface HistoryMatchRow {
  matchId: string;
  queueId: number;
  win: boolean;
  champion: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  durationSec: number;
  createdAt: number;
  placement: number | null;
  cs: number;
}

export interface MatchHistory {
  riotId: string;
  region: RegionConfig;
  queue: QueueConfig;
  level: number;
  profileIconId: number;
  wins: number;
  losses: number;
  winrate: number;
  matches: HistoryMatchRow[];
}

export async function buildMatchHistory(
  client: RiotClient,
  region: RegionConfig,
  gameName: string,
  tagLine: string,
  queue: QueueConfig,
  matchCount: number,
): Promise<MatchHistory> {
  const account = await client.getAccountByRiotId(region, gameName, tagLine);
  const summoner = await client.getSummonerByPuuid(region, account.puuid);

  const matches = await fetchMatchesForQueue(
    client,
    region,
    account.puuid,
    queue,
    matchCount,
  );

  const rows: HistoryMatchRow[] = [];
  for (const match of matches) {
    const self = match.info.participants.find((p) => p.puuid === account.puuid);
    if (!self) continue;
    rows.push(toRow(match, self));
  }

  const wins = rows.filter((r) => r.win).length;
  const losses = rows.length - wins;

  return {
    riotId: `${account.gameName}#${account.tagLine}`,
    region,
    queue,
    level: summoner.summonerLevel,
    profileIconId: summoner.profileIconId,
    wins,
    losses,
    winrate: rows.length
      ? Math.round((wins / rows.length) * 1000) / 10
      : 0,
    matches: rows,
  };
}

function toRow(match: MatchDto, self: MatchParticipant): HistoryMatchRow {
  const deaths = Math.max(self.deaths, 1);
  const kda = ((self.kills + self.assists) / deaths).toFixed(2);
  return {
    matchId: match.metadata.matchId,
    queueId: match.info.queueId,
    win: self.win,
    champion: self.championName,
    kills: self.kills,
    deaths: self.deaths,
    assists: self.assists,
    kda,
    durationSec: match.info.gameDuration,
    createdAt: match.info.gameCreation,
    placement: self.placement ?? null,
    cs: self.totalMinionsKilled + self.neutralMinionsKilled,
  };
}
