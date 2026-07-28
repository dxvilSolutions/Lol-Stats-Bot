import type {
  ChatInputCommandInteraction,
} from "discord.js";
import type { RegionConfig } from "../../config/regions.js";
import type { Locale } from "../../i18n/locales.js";
import type { RiotClient } from "../../riot/client.js";

export interface CommandContext {
  riot: RiotClient;
  defaultRegion: RegionConfig;
  defaultLocale: Locale;
  resolveLocale: (guildId: string | null | undefined) => Promise<Locale>;
  /** Re-register slash commands for a guild in a given language. */
  syncGuildCommands?: (guildId: string, locale: Locale) => Promise<void>;
}

export type CommandExecute = (
  interaction: ChatInputCommandInteraction,
  ctx: CommandContext,
) => Promise<void>;
