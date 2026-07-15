import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import type { RegionConfig } from "../config/regions.js";
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
): BotClient {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  }) as BotClient;

  client.commands = new Collection();
  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }

  const ctx: CommandContext = { riot, defaultRegion };

  client.once(Events.ClientReady, (ready) => {
    console.log(`Logged in as ${ready.user.tag}`);
    console.log(
      `Default region: ${defaultRegion.label} (${defaultRegion.platformId})`,
    );
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, ctx);
    } catch (err) {
      console.error(`Command /${interaction.commandName} failed`, err);
      const message = {
        content: "Hubo un error al ejecutar el comando.",
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
