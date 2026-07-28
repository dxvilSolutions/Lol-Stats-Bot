import type { Locale } from "../../i18n/locales.js";
import { t } from "../../i18n/locales.js";

/** Discord embed color from winrate (%). */
export function colorFromWinrate(wr: number): number {
  if (wr >= 60) return 0x2ecc71;
  if (wr >= 52) return 0x1abc9c;
  if (wr >= 48) return 0xf1c40f;
  if (wr >= 40) return 0xe67e22;
  return 0xe74c3c;
}

export function winrateLabel(wr: number, locale: Locale): string {
  if (wr >= 60) return t(locale, "wr.excellent");
  if (wr >= 52) return t(locale, "wr.good");
  if (wr >= 48) return t(locale, "wr.balanced");
  if (wr >= 40) return t(locale, "wr.low");
  return t(locale, "wr.critical");
}

export function kdaLabel(kda: number, locale: Locale): string {
  if (kda >= 4) return t(locale, "kda.outstanding");
  if (kda >= 3) return t(locale, "kda.great");
  if (kda >= 2.2) return t(locale, "kda.solid");
  if (kda >= 1.5) return t(locale, "kda.average");
  return t(locale, "kda.low");
}

export function kdaEmoji(kda: number): string {
  if (kda >= 4) return "🔥";
  if (kda >= 3) return "✨";
  if (kda >= 2.2) return "👍";
  if (kda >= 1.5) return "➖";
  return "❄️";
}

export function wrEmoji(wr: number): string {
  if (wr >= 60) return "🏆";
  if (wr >= 52) return "✅";
  if (wr >= 48) return "⚖️";
  if (wr >= 40) return "⚠️";
  return "📉";
}

export function progressBar(percent: number, size = 10): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * size);
  const empty = size - filled;
  return `${"▰".repeat(filled)}${"▱".repeat(empty)}`;
}
