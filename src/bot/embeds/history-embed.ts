import { EmbedBuilder } from "discord.js";
import {
  championSplashUrl,
  getDDragonVersion,
  profileIconUrl,
} from "../../assets/cdn.js";
import type { MatchHistory } from "../../stats/history.js";
import { colorFromWinrate, progressBar, wrEmoji } from "./style.js";

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function buildHistoryEmbed(
  history: MatchHistory,
): Promise<EmbedBuilder> {
  const version = await getDDragonVersion();
  const queue = history.queue;

  const lines = history.matches.map((m, i) => {
    const result = m.win ? "✅" : "❌";
    const when = `<t:${Math.floor(m.createdAt / 1000)}:R>`;
    const place =
      m.placement != null ? ` · #${m.placement}` : "";
    const subMode =
      queue.alias === "normal" && m.queueLabel !== queue.shortLabel
        ? ` · ${m.queueLabel}`
        : "";

    return (
      `**${i + 1}.** ${result} **${m.champion}**${place}${subMode}\n` +
      `└ ${m.kills}/${m.deaths}/${m.assists} · KDA ${m.kda} · ${formatDuration(m.durationSec)} · CS ${m.cs} · ${when}`
    );
  });

  // Discord embed field value max ~1024; keep lists compact
  let body = lines.join("\n");
  if (body.length > 1000) {
    body = `${lines.slice(0, Math.max(1, lines.length - 1)).join("\n")}\n…`;
    if (body.length > 1000) {
      body = lines.slice(0, 8).join("\n");
      if (body.length > 1000) body = `${body.slice(0, 990)}…`;
    }
  }

  const embed = new EmbedBuilder()
    .setColor(colorFromWinrate(history.winrate))
    .setAuthor({
      name: history.riotId,
      iconURL: profileIconUrl(version, history.profileIconId),
    })
    .setTitle(
      `${queue.emoji} Historial · ${queue.shortLabel} · ${history.region.label}`,
    )
    .setDescription(
      [
        `${wrEmoji(history.winrate)} **${history.winrate}%** WR · ${history.wins}W – ${history.losses}L · ${history.matches.length} partidas`,
        `\`${progressBar(history.winrate)}\``,
      ].join("\n"),
    )
    .addFields({
      name: "Partidas recientes",
      value: body || "Sin partidas",
      inline: false,
    })
    .setThumbnail(profileIconUrl(version, history.profileIconId))
    .setFooter({
      text: `${history.region.label} · ${queue.label} · Riot API`,
    })
    .setTimestamp();

  const topChamp = history.matches[0]?.champion;
  if (topChamp) {
    embed.setImage(championSplashUrl(topChamp));
  }

  return embed;
}
