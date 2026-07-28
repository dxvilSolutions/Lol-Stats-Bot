import type {
  ChatInputCommandInteraction,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandBuilder,
} from "discord.js";
import type { RegionConfig } from "../../config/regions.js";
import type { Locale } from "../../i18n/locales.js";
import type { RiotClient } from "../../riot/client.js";

export interface CommandContext {
  riot: RiotClient;
  defaultRegion: RegionConfig;
  defaultLocale: Locale;
  resolveLocale: (guildId: string | null | undefined) => Promise<Locale>;
}

export interface BotCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (
    interaction: ChatInputCommandInteraction,
    ctx: CommandContext,
  ) => Promise<void>;
}
