/**
 * Riot API routing.
 *
 * - Platform hosts: summoner, league, spectator, etc.
 * - Regional hosts: account-v1, match-v5
 *
 * User-facing aliases (lan, euw…) map to both so we can scale regions without
 * scattering platform IDs across the bot.
 */

export type RegionalCluster = "americas" | "europe" | "asia" | "sea";

export type PlatformId =
  | "br1"
  | "eun1"
  | "euw1"
  | "jp1"
  | "kr"
  | "la1"
  | "la2"
  | "na1"
  | "oc1"
  | "tr1"
  | "ru"
  | "ph2"
  | "sg2"
  | "th2"
  | "tw2"
  | "vn2"
  | "me1";

export interface RegionConfig {
  /** Short alias used in Discord options and env (e.g. "lan"). */
  alias: string;
  /** Display label for embeds. */
  label: string;
  platformId: PlatformId;
  cluster: RegionalCluster;
}

export const REGIONS: readonly RegionConfig[] = [
  { alias: "lan", label: "LAN", platformId: "la1", cluster: "americas" },
  { alias: "las", label: "LAS", platformId: "la2", cluster: "americas" },
  { alias: "na", label: "NA", platformId: "na1", cluster: "americas" },
  { alias: "br", label: "BR", platformId: "br1", cluster: "americas" },
  { alias: "euw", label: "EUW", platformId: "euw1", cluster: "europe" },
  { alias: "eune", label: "EUNE", platformId: "eun1", cluster: "europe" },
  { alias: "tr", label: "TR", platformId: "tr1", cluster: "europe" },
  { alias: "ru", label: "RU", platformId: "ru", cluster: "europe" },
  { alias: "me", label: "ME", platformId: "me1", cluster: "europe" },
  { alias: "jp", label: "JP", platformId: "jp1", cluster: "asia" },
  { alias: "kr", label: "KR", platformId: "kr", cluster: "asia" },
  { alias: "oce", label: "OCE", platformId: "oc1", cluster: "sea" },
  { alias: "ph", label: "PH", platformId: "ph2", cluster: "sea" },
  { alias: "sg", label: "SG", platformId: "sg2", cluster: "sea" },
  { alias: "th", label: "TH", platformId: "th2", cluster: "sea" },
  { alias: "tw", label: "TW", platformId: "tw2", cluster: "sea" },
  { alias: "vn", label: "VN", platformId: "vn2", cluster: "sea" },
] as const;

const byAlias = new Map(
  REGIONS.flatMap((region) => [
    [region.alias, region],
    [region.platformId, region],
    [region.label.toLowerCase(), region],
  ]),
);

export const DEFAULT_REGION_ALIAS = "lan";

export function resolveRegion(input?: string | null): RegionConfig {
  const key = (input ?? DEFAULT_REGION_ALIAS).trim().toLowerCase();
  const region = byAlias.get(key);
  if (!region) {
    const known = REGIONS.map((r) => r.alias).join(", ");
    throw new Error(`Región desconocida: "${input}". Usa una de: ${known}`);
  }
  return region;
}

export function platformHost(platformId: PlatformId): string {
  return `https://${platformId}.api.riotgames.com`;
}

export function regionalHost(cluster: RegionalCluster): string {
  return `https://${cluster}.api.riotgames.com`;
}

/** Choices for Discord slash-command options. */
export function regionDiscordChoices(): { name: string; value: string }[] {
  return REGIONS.map((r) => ({ name: r.label, value: r.alias }));
}
