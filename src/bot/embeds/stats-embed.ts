import { EmbedBuilder } from "discord.js";
import {
  championSplashUrl,
  getDDragonVersion,
  profileIconUrl,
  rankedEmblemUrl,
  rankedMiniCrestUrl,
} from "../../assets/cdn.js";
import {
  queueLabel,
  queueShortLabel,
} from "../../config/queues.js";
import type { Locale } from "../../i18n/locales.js";
import { t } from "../../i18n/locales.js";
import type { RecentStats } from "../../stats/player.js";
import {
  colorFromWinrate,
  kdaEmoji,
  kdaLabel,
  progressBar,
  winrateLabel,
  wrEmoji,
} from "./style.js";

export async function buildStatsEmbed(
  stats: RecentStats,
  locale: Locale,
): Promise<EmbedBuilder> {
  const version = await getDDragonVersion();
  const queue = stats.queue;
  const mode = queueShortLabel(locale, queue);
  const modeFull = queueLabel(locale, queue);
  const tier = stats.modeRank?.tier ?? "unranked";
  const kda = stats.avgKda;

  const rankLine = stats.modeRank
    ? `**${stats.modeRank.formatted}**${
        stats.modeRank.hotStreak ? t(locale, "stats.hot_streak") : ""
      }`
    : queue.ranked
      ? t(locale, "stats.unranked", { mode })
      : t(locale, "stats.no_ladder", { emoji: queue.emoji, mode: modeFull });

  const seasonWr =
    stats.modeRank && stats.modeRank.wins + stats.modeRank.losses > 0
      ? Math.round(
          (stats.modeRank.wins /
            (stats.modeRank.wins + stats.modeRank.losses)) *
            1000,
        ) / 10
      : null;

  const medals = ["🥇", "🥈", "🥉"];
  const champs = stats.topChampions
    .map((c, i) =>
      t(locale, "stats.champ_line", {
        medal: medals[i] ?? "•",
        champion: c.champion,
        games: c.games,
        wr: c.winrate,
        kda: c.avgKda,
      }),
    )
    .join("\n");

  const fields = [
    {
      name: t(locale, "stats.wr_field", {
        emoji: wrEmoji(stats.winrate),
        label: winrateLabel(stats.winrate, locale),
      }),
      value: [
        t(locale, "stats.wr_value", {
          wr: stats.winrate,
          wins: stats.wins,
          losses: stats.losses,
        }),
        `\`${progressBar(stats.winrate)}\``,
      ].join("\n"),
      inline: true,
    },
    {
      name: t(locale, "stats.kda_field", {
        emoji: kdaEmoji(kda),
        label: kdaLabel(kda, locale),
      }),
      value: t(locale, "stats.kda_value", { kda: stats.avgKdaText }),
      inline: true,
    },
    {
      name: t(locale, "stats.sample_field"),
      value: t(locale, "stats.sample_value", {
        count: stats.sampleSize,
        mode,
      }),
      inline: true,
    },
  ];

  if (queue.opponentElo) {
    fields.push({
      name: t(locale, "stats.opp_field"),
      value: stats.avgOpponentRank
        ? t(locale, "stats.opp_value", {
            rank: stats.avgOpponentRank,
            n: stats.opponentsSampled,
          })
        : t(locale, "stats.opp_na"),
      inline: false,
    });
  }

  fields.push({
    name: t(locale, "stats.champs_field"),
    value: champs || "—",
    inline: false,
  });

  const embed = new EmbedBuilder()
    .setColor(colorFromWinrate(stats.winrate))
    .setAuthor({
      name: stats.riotId,
      iconURL: profileIconUrl(version, stats.profileIconId),
    })
    .setTitle(
      t(locale, "stats.title", {
        emoji: queue.emoji,
        mode,
        region: stats.region.label,
        level: stats.level,
      }),
    )
    .setDescription(
      [
        rankLine,
        seasonWr != null && stats.modeRank
          ? t(locale, "stats.season", {
              mode,
              wins: stats.modeRank.wins,
              losses: stats.modeRank.losses,
              wr: seasonWr,
            })
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .addFields(fields)
    .setFooter({
      text: queue.opponentElo
        ? t(locale, "stats.footer_ranked", { region: stats.region.label })
        : t(locale, "stats.footer", {
            region: stats.region.label,
            mode: modeFull,
          }),
      iconURL: queue.ranked
        ? rankedMiniCrestUrl(stats.avgOpponentTier ?? tier)
        : profileIconUrl(version, stats.profileIconId),
    })
    .setTimestamp();

  if (queue.ranked) {
    embed.setThumbnail(rankedEmblemUrl(tier));
  } else {
    embed.setThumbnail(profileIconUrl(version, stats.profileIconId));
  }

  const topChamp = stats.topChampions[0]?.champion;
  if (topChamp) {
    embed.setImage(championSplashUrl(topChamp));
  }

  return embed;
}
