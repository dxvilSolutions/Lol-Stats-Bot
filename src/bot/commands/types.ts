import type {
  ChatInputCommandInteraction,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import type { RegionConfig } from "../../config/regions.js";
import type { RiotClient } from "../../riot/client.js";

export interface CommandContext {
  riot: RiotClient;
  defaultRegion: RegionConfig;
}

export interface BotCommand {
  data: SlashCommandOptionsOnlyBuilder;
  execute: (
    interaction: ChatInputCommandInteraction,
    ctx: CommandContext,
  ) => Promise<void>;
}
