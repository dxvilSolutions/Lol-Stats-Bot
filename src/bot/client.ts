import { Client, Events, GatewayIntentBits } from "discord.js";
import type { RegionConfig } from "../config/regions.js";
import { createLocaleResolver, type Locale } from "../i18n/index.js";
import { t } from "../i18n/locales.js";
import type { RiotClient } from "../riot/client.js";
import { commandHandlers, type CommandContext } from "./commands/index.js";
import {
  clearGlobalCommands,
  createDiscordRest,
  deployGuildCommands,
} from "./register-commands.js";

export type BotClient = Client;

export function createBot(
  riot: RiotClient,
  defaultRegion: RegionConfig,
  defaultLocale: Locale,
  discordToken: string,
  discordClientId: string,
): BotClient {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  const rest = createDiscordRest(discordToken);
  const locales = createLocaleResolver(defaultLocale);

  const syncGuildCommands = async (guildId: string, locale: Locale) => {
    await deployGuildCommands(rest, discordClientId, guildId, locale);
  };

  const ctx: CommandContext = {
    riot,
    defaultRegion,
    defaultLocale,
    resolveLocale: (guildId) => locales.resolve(guildId),
    syncGuildCommands,
  };

  client.once(Events.ClientReady, async (ready) => {
    console.log(`Logged in as ${ready.user.tag}`);
    console.log(
      `Default region: ${defaultRegion.label} (${defaultRegion.platformId})`,
    );
    console.log(`Default locale: ${defaultLocale}`);

    try {
      // Prevent global+guild duplicates (e.g. two /stats)
      await clearGlobalCommands(rest, discordClientId);
    } catch (err) {
      console.error("Failed to clear global commands", err);
    }

    for (const guild of ready.guilds.cache.values()) {
      const locale = await locales.resolve(guild.id);
      try {
        await syncGuildCommands(guild.id, locale);
      } catch (err) {
        console.error(`Failed to sync commands for guild ${guild.id}`, err);
      }
    }
  });

  client.on(Events.GuildCreate, async (guild) => {
    const locale = await locales.resolve(guild.id);
    try {
      await syncGuildCommands(guild.id, locale);
      console.log(`Synced commands for new guild ${guild.id} [${locale}]`);
    } catch (err) {
      console.error(`Failed to sync commands for new guild ${guild.id}`, err);
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const handler = commandHandlers[interaction.commandName];
    if (!handler) return;

    try {
      await handler(interaction, ctx);
    } catch (err) {
      console.error(`Command /${interaction.commandName} failed`, err);
      const locale = await ctx.resolveLocale(interaction.guildId);
      const message = {
        content: t(locale, "error.generic"),
        ephemeral: true as const,
      };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(message);
      } else {
        await interaction.reply(message);
      }
    }
  });

  return client;
}
