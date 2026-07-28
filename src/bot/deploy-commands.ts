import { loadConfig } from "../config/env.js";
import { createLocaleResolver } from "../i18n/index.js";
import {
  clearGlobalCommands,
  createDiscordRest,
  deployGuildCommands,
} from "./register-commands.js";

/**
 * Clears leftover global commands and syncs guild slash commands.
 * Prefer letting the running bot sync on ready; use this for one-off fixes.
 */
async function main() {
  const config = loadConfig();
  const rest = createDiscordRest(config.discordToken);
  const locales = createLocaleResolver(config.defaultLocale);

  await clearGlobalCommands(rest, config.discordClientId);

  if (config.discordGuildId) {
    const locale = await locales.resolve(config.discordGuildId);
    await deployGuildCommands(
      rest,
      config.discordClientId,
      config.discordGuildId,
      locale,
    );
  } else {
    console.log(
      "No DISCORD_GUILD_ID set. Global commands cleared; the running bot will sync each guild on startup.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
