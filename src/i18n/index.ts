import type { Locale } from "./locales.js";
import { isLocale, t, type Interp } from "./locales.js";
import { getGuildLocale } from "../storage/guild-settings.js";

export type { Locale, Interp } from "./locales.js";
export { LOCALES, isLocale, t } from "./locales.js";

export type LocaleResolver = {
  defaultLocale: Locale;
  resolve: (guildId: string | null | undefined) => Promise<Locale>;
};

export function createLocaleResolver(defaultLocale: Locale): LocaleResolver {
  return {
    defaultLocale,
    async resolve(guildId) {
      if (!guildId) return defaultLocale;
      const stored = await getGuildLocale(guildId);
      return stored ?? defaultLocale;
    },
  };
}

/** Map Discord client locale hints to our Locale. */
export function fromDiscordLocale(discordLocale?: string | null): Locale | null {
  if (!discordLocale) return null;
  const lower = discordLocale.toLowerCase();
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("en")) return "en";
  return null;
}

export function localize(
  locale: Locale,
  key: string,
  vars?: Interp,
): string {
  return t(locale, key, vars);
}

export function assertLocale(value: string): Locale {
  if (!isLocale(value)) {
    throw new Error(`Unsupported locale: ${value}`);
  }
  return value;
}
