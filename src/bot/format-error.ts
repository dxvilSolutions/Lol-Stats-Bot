import { queueLabel, resolveQueue } from "../config/queues.js";
import type { Locale } from "../i18n/locales.js";
import { t } from "../i18n/locales.js";
import { RiotApiError } from "../riot/types.js";
import { ModeDetailsPrivateError } from "../stats/player.js";

export function formatBotError(err: unknown, locale: Locale): string {
  if (err instanceof ModeDetailsPrivateError) {
    const queue = resolveQueue(err.alias, locale);
    return t(locale, "error.mode_private", {
      mode: queueLabel(locale, queue),
    });
  }
  if (err instanceof RiotApiError) {
    if (err.status === 404) return t(locale, "error.not_found");
    if (err.status === 401 || err.status === 403) {
      return t(locale, "error.api_key");
    }
    if (err.status === 429) return t(locale, "error.rate_limit");
    return t(locale, "error.riot_status", { status: err.status });
  }
  if (err instanceof Error) return err.message;
  return t(locale, "error.unexpected");
}
