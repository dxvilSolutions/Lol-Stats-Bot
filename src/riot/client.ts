import {
  platformHost,
  regionalHost,
  type RegionConfig,
} from "../config/regions.js";
import {
  RiotApiError,
  type LeagueEntry,
  type MatchDto,
  type RiotAccount,
  type RiotSummoner,
} from "./types.js";

const DEFAULT_RETRIES = 3;

export class RiotClient {
  constructor(private readonly apiKey: string) {}

  async getAccountByRiotId(
    region: RegionConfig,
    gameName: string,
    tagLine: string,
  ): Promise<RiotAccount> {
    const path = `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    return this.request<RiotAccount>(regionalHost(region.cluster), path);
  }

  async getSummonerByPuuid(
    region: RegionConfig,
    puuid: string,
  ): Promise<RiotSummoner> {
    const path = `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
    return this.request<RiotSummoner>(platformHost(region.platformId), path);
  }

  async getLeagueEntriesByPuuid(
    region: RegionConfig,
    puuid: string,
  ): Promise<LeagueEntry[]> {
    const path = `/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`;
    return this.request<LeagueEntry[]>(platformHost(region.platformId), path);
  }

  async getMatchIdsByPuuid(
    region: RegionConfig,
    puuid: string,
    options: {
      count?: number;
      start?: number;
      queue?: number;
      type?: "ranked" | "normal" | "tourney" | "tutorial";
    } = {},
  ): Promise<string[]> {
    const params = new URLSearchParams();
    if (options.count != null) params.set("count", String(options.count));
    if (options.start != null) params.set("start", String(options.start));
    if (options.queue != null) params.set("queue", String(options.queue));
    if (options.type != null) params.set("type", options.type);

    const query = params.toString();
    const path = `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids${query ? `?${query}` : ""}`;
    return this.request<string[]>(regionalHost(region.cluster), path);
  }

  async getMatch(region: RegionConfig, matchId: string): Promise<MatchDto> {
    const path = `/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
    return this.request<MatchDto>(regionalHost(region.cluster), path);
  }

  private async request<T>(
    host: string,
    path: string,
    attempt = 1,
  ): Promise<T> {
    const url = `${host}${path}`;
    const response = await fetch(url, {
      headers: {
        "X-Riot-Token": this.apiKey,
        Accept: "application/json",
      },
    });

    if (response.status === 429 && attempt <= DEFAULT_RETRIES) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
      const waitMs = Math.max(1, retryAfter) * 1000;
      await sleep(waitMs);
      return this.request<T>(host, path, attempt + 1);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => undefined);
      throw new RiotApiError(
        `Riot API ${response.status} for ${path}`,
        response.status,
        body,
      );
    }

    return (await response.json()) as T;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
