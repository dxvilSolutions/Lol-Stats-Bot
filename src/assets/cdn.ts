let cachedVersion: string | null = null;

/** Latest Data Dragon patch (cached in process). */
export async function getDDragonVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;
  try {
    const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    if (!res.ok) throw new Error(`versions ${res.status}`);
    const versions = (await res.json()) as string[];
    cachedVersion = versions[0] ?? "14.12.1";
  } catch {
    cachedVersion = "14.12.1";
  }
  return cachedVersion;
}

export function profileIconUrl(version: string, iconId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;
}

export function championIconUrl(version: string, championId: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`;
}

export function championSplashUrl(championId: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
}

/**
 * Ranked emblem art (Community Dragon).
 * tier examples: IRON, GOLD, EMERALD, CHALLENGER
 */
export function rankedEmblemUrl(tier: string | null | undefined): string {
  const key = (tier ?? "unranked").toLowerCase();
  const safe = [
    "iron",
    "bronze",
    "silver",
    "gold",
    "platinum",
    "emerald",
    "diamond",
    "master",
    "grandmaster",
    "challenger",
  ].includes(key)
    ? key
    : "unranked";

  if (safe === "unranked") {
    return "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/unranked.png";
  }

  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblem/emblem-${safe}.png`;
}

export function rankedMiniCrestUrl(tier: string | null | undefined): string {
  const key = (tier ?? "unranked").toLowerCase();
  const safe = [
    "iron",
    "bronze",
    "silver",
    "gold",
    "platinum",
    "emerald",
    "diamond",
    "master",
    "grandmaster",
    "challenger",
    "unranked",
  ].includes(key)
    ? key
    : "unranked";

  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${safe}.png`;
}
