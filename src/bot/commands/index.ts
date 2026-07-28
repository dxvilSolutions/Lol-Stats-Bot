import type { CommandExecute } from "./types.js";
import { executeHistory } from "./historial.js";
import { executeLanguage } from "./language.js";
import { executeStats } from "./stats.js";

export type { CommandContext, CommandExecute } from "./types.js";

/**
 * Map every registered slash name → handler.
 * ES and EN use different names for history/language.
 */
export const commandHandlers: Record<string, CommandExecute> = {
  stats: executeStats,
  historial: executeHistory,
  history: executeHistory,
  language: executeLanguage,
  idioma: executeLanguage,
};
