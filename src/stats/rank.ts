/** Map Riot tier+division to a comparable score (approx LP ladder position). */
const TIER_BASE: Record<string, number> = {
  IRON: 0,
  BRONZE: 400,
  SILVER: 800,
  GOLD: 1200,
  PLATINUM: 1600,
  EMERALD: 2000,
  DIAMOND: 2400,
  MASTER: 2800,
  GRANDMASTER: 3200,
  CHALLENGER: 3600,
};

const DIVISION_BONUS: Record<string, number> = {
  IV: 0,
  III: 100,
  II: 200,
  I: 300,
};

export function rankScore(tier: string, rank: string, lp = 0): number {
  const tierKey = tier.toUpperCase();
  const base = TIER_BASE[tierKey];
  if (base == null) return 0;

  // Master+ use LP directly on top of tier base
  if (tierKey === "MASTER" || tierKey === "GRANDMASTER" || tierKey === "CHALLENGER") {
    return base + Math.max(0, lp);
  }

  const div = DIVISION_BONUS[rank.toUpperCase()] ?? 0;
  return base + div + Math.max(0, Math.min(lp, 100));
}

export function formatRank(tier: string, rank: string, lp: number): string {
  const t = tier.charAt(0) + tier.slice(1).toLowerCase();
  if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier.toUpperCase())) {
    return `${t} ${lp} LP`;
  }
  return `${t} ${rank} (${lp} LP)`;
}

/** Reverse a score into a rough display label (for averages). */
export function approxRankFromScore(score: number): string {
  const tiers = Object.entries(TIER_BASE).sort((a, b) => b[1] - a[1]);
  for (const [tier, base] of tiers) {
    if (score >= base) {
      if (tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER") {
        const lp = Math.round(score - base);
        return formatRank(tier, "I", lp);
      }
      const within = score - base;
      let division = "IV";
      if (within >= 300) division = "I";
      else if (within >= 200) division = "II";
      else if (within >= 100) division = "III";
      const lp = Math.round(within % 100);
      return formatRank(tier, division, lp);
    }
  }
  return "Unranked";
}
