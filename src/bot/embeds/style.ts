/** Discord embed color from winrate (%). */
export function colorFromWinrate(wr: number): number {
  if (wr >= 60) return 0x2ecc71; // green
  if (wr >= 52) return 0x1abc9c; // teal
  if (wr >= 48) return 0xf1c40f; // yellow
  if (wr >= 40) return 0xe67e22; // orange
  return 0xe74c3c; // red
}

/** Accent label for WR. */
export function winrateLabel(wr: number): string {
  if (wr >= 60) return "Excelente";
  if (wr >= 52) return "Bueno";
  if (wr >= 48) return "Equilibrado";
  if (wr >= 40) return "Bajo";
  return "Crítico";
}

export function kdaLabel(kda: number): string {
  if (kda >= 4) return "Destacado";
  if (kda >= 3) return "Muy bueno";
  if (kda >= 2.2) return "Sólido";
  if (kda >= 1.5) return "Promedio";
  return "Bajo";
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

/** Visual bar 0–100, 10 segments. */
export function progressBar(percent: number, size = 10): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * size);
  const empty = size - filled;
  return `${"▰".repeat(filled)}${"▱".repeat(empty)}`;
}
