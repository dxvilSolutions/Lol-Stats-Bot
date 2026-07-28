import { EmbedBuilder } from "discord.js";
import {
  championSplashUrl,
  getDDragonVersion,
  profileIconUrl,
} from "../../assets/cdn.js";
import {
  labelForQueueId,
  queueLabel,
  queueShortLabel,
} from "../../config/queues.js";
import type { Locale } from "../../i18n/locales.js";
import { t } from "../../i18n/locales.js";
import type { MatchHistory } from "../../stats/history.js";
import { colorFromWinrate, progressBar, wrEmoji } from "./style.js";

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function buildHistoryEmbed(
  history: MatchHistory,
  locale: Locale,
): Promise<EmbedBuilder> {
  const version = await getDDragonVersion();
  const queue = history.queue;
  const mode = queueShortLabel(locale, queue);
  const modeFull = queueLabel(locale, queue);

  const lines = history.matches.map((m, i) => {
    const result = m.win ? "✅" : "❌";
    const when = `<t:${Math.floor(m.createdAt / 1000)}:R>`;
    const place = m.placement != null ? ` · #${m.placement}` : "";
    const qLabel = labelForQueueId(m.queueId, locale);
    const subMode =
      queue.alias === "normal" && qLabel !== mode ? ` · ${qLabel}` : "";

    return t(locale, "history.line", {
      n: i + 1,
      result,
      champion: m.champion,
      place,
      subMode,
      kills: m.kills,
      deaths: m.deaths,
      assists: m.assists,
      kda: m.kda,
      duration: formatDuration(m.durationSec),
      cs: m.cs,
      when,
    });
  });

  let body = lines.join("\n");
  if (body.length > 1000) {
    body = lines.slice(0, 8).join("\n");
    if (body.length > 1000) body = `${body.slice(0, 990)}…`;
  }

  const embed = new EmbedBuilder()
    .setColor(colorFromWinrate(history.winrate))
    .setAuthor({
      name: history.riotId,
      iconURL: profileIconUrl(version, history.profileIconId),
    })
    .setTitle(
      t(locale, "history.title", {
        emoji: queue.emoji,
        mode,
        region: history.region.label,
      }),
    )
    .setDescription(
      [
        t(locale, "history.summary", {
          emoji: wrEmoji(history.winrate),
          wr: history.winrate,
          wins: history.wins,
          losses: history.losses,
          count: history.matches.length,
        }),
        `\`${progressBar(history.winrate)}\``,
      ].join("\n"),
    )
    .addFields({
      name: t(locale, "history.field"),
      value: body || t(locale, "history.empty"),
      inline: false,
    })
    .setThumbnail(profileIconUrl(version, history.profileIconId))
    .setFooter({
      text: t(locale, "history.footer", {
        region: history.region.label,
        mode: modeFull,
      }),
    })
    .setTimestamp();

  const topChamp = history.matches[0]?.champion;
  if (topChamp) {
    embed.setImage(championSplashUrl(topChamp));
  }

  return embed;
}
