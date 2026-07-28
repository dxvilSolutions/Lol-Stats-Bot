/**
 * League queue / mode presets for Match-v5 filters.
 * @see https://static.developer.riotgames.com/docs/lol/queues.json
 */

export type QueueAlias =
  | "solo"
  | "flex"
  | "aram"
  | "normal"
  | "draft"
  | "blind"
  | "quickplay"
  | "arena"
  | "urf"
  | "ofa"
  | "nexus";

export interface QueueConfig {
  alias: QueueAlias;
  label: string;
  /** Short label for embed titles */
  shortLabel: string;
  description: string;
  /** Primary Riot queue id (used when `queueIds` has one entry). */
  queueId: number;
  /** If set, fetch without a single queue and keep matches in this set. */
  queueIds?: number[];
  /** Match-v5 `type` filter when not using a single queue id. */
  matchType?: "ranked" | "normal" | "tourney" | "tutorial";
  /** Whether this mode has a ranked ladder entry. */
  ranked: boolean;
  /** League-v4 queueType to show season rank, if any. */
  leagueQueueType?: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";
  /** Lookup opponent ranks (rate-limit heavy; ranked only). */
  opponentElo: boolean;
  emoji: string;
}

export const QUEUES: readonly QueueConfig[] = [
  {
    alias: "solo",
    label: "Ranked Solo/Duo",
    shortLabel: "Solo/Duo",
    description: "Clasificatoria Solo/Duo",
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
    description: "Clasificatoria Flexible",
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
    alias: "normal",
    label: "Normales",
    shortLabel: "Normal",
    description: "Draft, Blind y Quickplay",
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
    description: "Partidas normales (draft)",
    queueId: 400,
    ranked: false,
    opponentElo: false,
    emoji: "📝",
  },
  {
    alias: "blind",
    label: "Normal Blind",
    shortLabel: "Blind",
    description: "Partidas normales (blind pick)",
    queueId: 430,
    ranked: false,
    opponentElo: false,
    emoji: "🙈",
  },
  {
    alias: "quickplay",
    label: "Quickplay",
    shortLabel: "Quickplay",
    description: "Cola rápida (normales)",
    queueId: 490,
    ranked: false,
    opponentElo: false,
    emoji: "⚡",
  },
  {
    alias: "arena",
    label: "Arena",
    shortLabel: "Arena",
    description: "Arena 2v2v2v2",
    queueId: 1700,
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
    description: "Uno para todos",
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

export function resolveQueue(input?: string | null): QueueConfig {
  const key = (input ?? "solo").trim().toLowerCase();
  const queue = byAlias.get(key as QueueAlias);
  if (!queue) {
    const known = QUEUES.map((q) => q.alias).join(", ");
    throw new Error(`Modo desconocido: "${input}". Usa uno de: ${known}`);
  }
  return queue;
}

export function queueDiscordChoices(): { name: string; value: string }[] {
  return QUEUES.map((q) => ({
    name: `${q.emoji} ${q.label}`,
    value: q.alias,
  }));
}

/** Human label for a raw queue id (history lines). */
export function labelForQueueId(queueId: number): string {
  const known = QUEUES.find(
    (q) => q.queueId === queueId || q.queueIds?.includes(queueId),
  );
  if (known?.queueIds && known.queueIds.length > 1) {
    if (queueId === 400) return "Draft";
    if (queueId === 430) return "Blind";
    if (queueId === 490) return "Quickplay";
  }
  return known?.shortLabel ?? `Cola ${queueId}`;
}
