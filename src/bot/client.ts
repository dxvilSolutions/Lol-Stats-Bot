import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import type { RegionConfig } from "../config/regions.js";
import { createLocaleResolver, type Locale } from "../i18n/index.js";
import { t } from "../i18n/locales.js";
import type { RiotClient } from "../riot/client.js";
import {
  commands,
  type BotCommand,
  type CommandContext,
} from "./commands/index.js";

export type BotClient = Client & {
  commands: Collection<string, BotCommand>;
};

export function createBot(
  riot: RiotClient,
  defaultRegion: RegionConfig,
  defaultLocale: Locale,
): BotClient {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  }) as BotClient;

  client.commands = new Collection();
  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }

  const locales = createLocaleResolver(defaultLocale);
  const ctx: CommandContext = {
    riot,
    defaultRegion,
    defaultLocale,
    resolveLocale: (guildId) => locales.resolve(guildId),
  };

  client.once(Events.ClientReady, (ready) => {
    console.log(`Logged in as ${ready.user.tag}`);
    console.log(
      `Default region: ${defaultRegion.label} (${defaultRegion.platformId})`,
    );
    console.log(`Default locale: ${defaultLocale}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, ctx);
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
