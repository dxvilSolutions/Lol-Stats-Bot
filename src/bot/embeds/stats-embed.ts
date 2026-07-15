import { EmbedBuilder } from "discord.js";
import {
  championSplashUrl,
  getDDragonVersion,
  profileIconUrl,
  rankedEmblemUrl,
  rankedMiniCrestUrl,
} from "../../assets/cdn.js";
import type { RecentStats } from "../../stats/player.js";
import {
  colorFromWinrate,
  kdaEmoji,
  kdaLabel,
  progressBar,
  winrateLabel,
  wrEmoji,
} from "./style.js";

export async function buildStatsEmbed(stats: RecentStats): Promise<EmbedBuilder> {
  const version = await getDDragonVersion();
  const tier = stats.soloRank?.tier ?? "unranked";
  const kda = stats.avgKda;

  const rankLine = stats.soloRank
    ? `**${stats.soloRank.formatted}**${stats.soloRank.hotStreak ? " · 🔥 Hot streak" : ""}`
    : "**Unranked** en Solo/Duo";

  const seasonWr =
    stats.soloRank && stats.soloRank.wins + stats.soloRank.losses > 0
      ? Math.round(
          (stats.soloRank.wins /
            (stats.soloRank.wins + stats.soloRank.losses)) *
            1000,
        ) / 10
      : null;

  const champs = stats.topChampions
    .map((c, i) => {
      const medal = ["🥇", "🥈", "🥉"][i] ?? "•";
      return `${medal} **${c.champion}** · ${c.games}p · ${c.winrate}% WR · KDA ${c.avgKda}`;
    })
    .join("\n");

  const opponentLine = stats.avgOpponentRank
    ? `~**${stats.avgOpponentRank}** · sample ${stats.opponentsSampled} rivales`
    : "No disponible";

  const embed = new EmbedBuilder()
    .setColor(colorFromWinrate(stats.winrate))
    .setAuthor({
      name: stats.riotId,
      iconURL: profileIconUrl(version, stats.profileIconId),
    })
    .setTitle(`${stats.region.label} · Nivel ${stats.level}`)
    .setDescription(
      [
        rankLine,
        seasonWr != null && stats.soloRank
          ? `Temporada Solo/Duo: **${stats.soloRank.wins}W / ${stats.soloRank.losses}L** (${seasonWr}% WR)`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .setThumbnail(rankedEmblemUrl(tier))
    .addFields(
      {
        name: `${wrEmoji(stats.winrate)} Winrate · ${winrateLabel(stats.winrate)}`,
        value: [
          `**${stats.winrate}%** (${stats.wins}W – ${stats.losses}L)`,
          `\`${progressBar(stats.winrate)}\``,
        ].join("\n"),
        inline: true,
      },
      {
        name: `${kdaEmoji(kda)} KDA · ${kdaLabel(kda)}`,
        value: `**${stats.avgKdaText}**\npromedio en el sample`,
        inline: true,
      },
      {
        name: "🎯 Sample",
        value: `**${stats.sampleSize}** ranked Solo`,
        inline: true,
      },
      {
        name: "⚔️ ELO medio de rivales",
        value: opponentLine,
        inline: false,
      },
      {
        name: "🗡️ Campeones más usados",
        value: champs || "—",
        inline: false,
      },
    )
    .setFooter({
      text: `${stats.region.label} · Riot API · rivales ≈ rank actual`,
      iconURL: rankedMiniCrestUrl(stats.avgOpponentTier ?? tier),
    })
    .setTimestamp();

  const topChamp = stats.topChampions[0]?.champion;
  if (topChamp) {
    embed.setImage(championSplashUrl(topChamp));
  }

  return embed;
}
