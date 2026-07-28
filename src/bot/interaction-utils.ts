import type { ChatInputCommandInteraction } from "discord.js";
import type { Locale } from "../i18n/locales.js";
import { t } from "../i18n/locales.js";

/** Reply with a localized loading line (replaces Discord's client-language "thinking"). */
export async function replyLoading(
  interaction: ChatInputCommandInteraction,
  locale: Locale,
): Promise<void> {
  await interaction.reply({ content: t(locale, "loading") });
}

export function getModeOption(
  interaction: ChatInputCommandInteraction,
): string | null {
  return (
    interaction.options.getString("modo") ??
    interaction.options.getString("mode")
  );
}

export function getGamesOption(
  interaction: ChatInputCommandInteraction,
  fallback: number,
): number {
  return (
    interaction.options.getInteger("partidas") ??
    interaction.options.getInteger("games") ??
    fallback
  );
}

export function getLocaleOption(
  interaction: ChatInputCommandInteraction,
): string | null {
  return (
    interaction.options.getString("idioma") ??
    interaction.options.getString("language") ??
    interaction.options.getString("locale")
  );
}
