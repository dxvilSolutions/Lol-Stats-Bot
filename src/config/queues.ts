import type { Locale } from "../i18n/locales.js";
import { t } from "../i18n/locales.js";

/**
 * League queue / mode presets for Match-v5 filters.
 * @see https://static.developer.riotgames.com/docs/lol/queues.json
 */

export type QueueAlias =
  | "solo"
  | "flex"
  | "aram"
  | "mayhem"
  | "normal"
  | "draft"
  | "blind"
  | "quickplay"
  | "arena"
  | "arena3"
  | "urf"
  | "ofa"
  | "nexus";

export interface QueueConfig {
  alias: QueueAlias;
  /** Fallback English-ish label (prefer localized helpers). */
  label: string;
  shortLabel: string;
  description: string;
  queueId: number;
  queueIds?: number[];
  matchType?: "ranked" | "normal" | "tourney" | "tutorial";
  ranked: boolean;
  leagueQueueType?: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";
  opponentElo: boolean;
  emoji: string;
  /**
   * Riot may list match IDs but block match details (403), e.g. ARAM: Mayhem.
   */
  detailsOftenPrivate?: boolean;
}

export const QUEUES: readonly QueueConfig[] = [
  {
    alias: "solo",
    label: "Ranked Solo/Duo",
    shortLabel: "Solo/Duo",
    description: "Ranked Solo/Duo",
    queueId: 420,
    ranked: true,
    leagueQueueType: "RANKED_SOLO_5x5",
    opponentElo: true,
    emoji: "🎖️",
  },
  {
    alias: "flex",
    label: "Ranked Flex",
    shortLabel: "Flex",
    description: "Ranked Flex",
    queueId: 440,
    ranked: true,
    leagueQueueType: "RANKED_FLEX_SR",
    opponentElo: true,
    emoji: "👥",
  },
  {
    alias: "aram",
    label: "ARAM",
    shortLabel: "ARAM",
    description: "Howling Abyss (ARAM)",
    queueId: 450,
    ranked: false,
    opponentElo: false,
    emoji: "❄️",
  },
  {
    alias: "mayhem",
    label: "ARAM: Mayhem",
    shortLabel: "Mayhem",
    description: "ARAM: Mayhem / Chaos",
    queueId: 2400,
    queueIds: [2400, 2401, 2403, 2405],
    ranked: false,
    opponentElo: false,
    emoji: "🌪️",
    detailsOftenPrivate: true,
  },
  {
    alias: "normal",
    label: "Normals",
    shortLabel: "Normal",
    description: "Draft, Blind and Quickplay",
    queueId: 490,
    queueIds: [400, 430, 490],
    matchType: "normal",
    ranked: false,
    opponentElo: false,
    emoji: "🎮",
  },
  {
    alias: "draft",
    label: "Normal Draft",
    shortLabel: "Draft",
    description: "Normal draft",
    queueId: 400,
    ranked: false,
    opponentElo: false,
    emoji: "📝",
  },
  {
    alias: "blind",
    label: "Normal Blind",
    shortLabel: "Blind",
    description: "Normal blind pick",
    queueId: 430,
    ranked: false,
    opponentElo: false,
    emoji: "🙈",
  },
  {
    alias: "quickplay",
    label: "Quickplay",
    shortLabel: "Quickplay",
    description: "Quickplay normals",
    queueId: 490,
    ranked: false,
    opponentElo: false,
    emoji: "⚡",
  },
  {
    alias: "arena",
    label: "Arena 2v2",
    shortLabel: "Arena 2v2",
    description: "Arena 2v2v2v2",
    queueId: 1700,
    ranked: false,
    opponentElo: false,
    emoji: "🏟️",
  },
  {
    alias: "arena3",
    label: "Arena 3v3",
    shortLabel: "Arena 3v3",
    description: "Arena 3x6 (3 players per team)",
    queueId: 1750,
    ranked: false,
    opponentElo: false,
    emoji: "🏟️",
  },
  {
    alias: "urf",
    label: "URF",
    shortLabel: "URF",
    description: "Ultra Rapid Fire",
    queueId: 900,
    ranked: false,
    opponentElo: false,
    emoji: "🐇",
  },
  {
    alias: "ofa",
    label: "One for All",
    shortLabel: "OFA",
    description: "One for All",
    queueId: 1020,
    ranked: false,
    opponentElo: false,
    emoji: "👯",
  },
  {
    alias: "nexus",
    label: "Nexus Blitz",
    shortLabel: "Nexus Blitz",
    description: "Nexus Blitz",
    queueId: 1300,
    ranked: false,
    opponentElo: false,
    emoji: "💥",
  },
] as const;

const byAlias = new Map(QUEUES.map((q) => [q.alias, q]));

export function queueLabel(locale: Locale, queue: QueueConfig): string {
  return t(locale, `queue.${queue.alias}`);
}

export function queueShortLabel(locale: Locale, queue: QueueConfig): string {
  return t(locale, `queue.${queue.alias}.short`);
}

export function resolveQueue(
  input?: string | null,
  locale: Locale = "en",
): QueueConfig {
  const key = (input ?? "solo").trim().toLowerCase();
  const queue = byAlias.get(key as QueueAlias);
  if (!queue) {
    const known = QUEUES.map((q) => q.alias).join(", ");
    throw new Error(
      t(locale, "error.unknown_mode", { input: String(input), known }),
    );
  }
  return queue;
}

export function queueDiscordChoices(locale: Locale = "en"): {
  name: string;
  value: string;
}[] {
  return QUEUES.map((q) => ({
    name: t(locale, `queue.${q.alias}`),
    value: q.alias,
  }));
}

export function labelForQueueId(queueId: number, locale: Locale = "en"): string {
  const known = QUEUES.find(
    (q) => q.queueId === queueId || q.queueIds?.includes(queueId),
  );
  if (known?.queueIds && known.queueIds.length > 1) {
    if (queueId === 400) return t(locale, "queue.draft.short");
    if (queueId === 430) return t(locale, "queue.blind.short");
    if (queueId === 490) return t(locale, "queue.quickplay.short");
  }
  if (known) return queueShortLabel(locale, known);
  return t(locale, "queue.cola", { id: queueId });
}
