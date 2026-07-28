import { REST, Routes } from "discord.js";
import type { Locale } from "../i18n/locales.js";
import { buildSlashCommandsForLocale } from "./slash-builders.js";

export function createDiscordRest(token: string): REST {
  return new REST({ version: "10" }).setToken(token);
}

/** Remove global commands (avoids duplicate /stats with guild commands). */
export async function clearGlobalCommands(
  rest: REST,
  clientId: string,
): Promise<void> {
  await rest.put(Routes.applicationCommands(clientId), { body: [] });
  console.log("Cleared global application commands");
}

export async function clearGuildCommands(
  rest: REST,
  clientId: string,
  guildId: string,
): Promise<void> {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: [],
  });
  console.log(`Cleared guild commands for ${guildId}`);
}

/** Register locale-specific slash commands for one guild. */
export async function deployGuildCommands(
  rest: REST,
  clientId: string,
  guildId: string,
  locale: Locale,
): Promise<number> {
  const body = buildSlashCommandsForLocale(locale);
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body,
  });
  console.log(
    `Deployed ${body.length} guild command(s) to ${guildId} [${locale}]`,
  );
  return body.length;
}
