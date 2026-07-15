import { REST, Routes } from "discord.js";
import { loadConfig } from "../config/env.js";
import { commands } from "./commands/index.js";

async function main() {
  const config = loadConfig();
  const body = commands.map((c) => c.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(config.discordToken);

  if (config.discordGuildId) {
    await rest.put(
      Routes.applicationGuildCommands(
        config.discordClientId,
        config.discordGuildId,
      ),
      { body },
    );
    console.log(
      `Deployed ${body.length} guild command(s) to ${config.discordGuildId}`,
    );
  } else {
    await rest.put(Routes.applicationCommands(config.discordClientId), {
      body,
    });
    console.log(`Deployed ${body.length} global command(s)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
