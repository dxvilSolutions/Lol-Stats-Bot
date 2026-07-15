export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface RiotSummoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export type RankedQueueType =
  | "RANKED_SOLO_5x5"
  | "RANKED_FLEX_SR"
  | "RANKED_FLEX_TT"
  | string;

export interface LeagueEntry {
  leagueId?: string;
  queueType: RankedQueueType;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak?: boolean;
  veteran?: boolean;
  freshBlood?: boolean;
  inactive?: boolean;
  summonerId?: string;
  puuid?: string;
}

export interface MatchParticipant {
  puuid: string;
  summonerName?: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  championName: string;
  championId: number;
  teamId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  individualPosition?: string;
  teamPosition?: string;
}

export interface MatchInfo {
  gameId: number;
  queueId: number;
  gameMode: string;
  gameType: string;
  gameDuration: number;
  gameCreation: number;
  participants: MatchParticipant[];
}

export interface MatchDto {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: MatchInfo;
}

export class RiotApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: string,
  ) {
    super(message);
    this.name = "RiotApiError";
  }
}
