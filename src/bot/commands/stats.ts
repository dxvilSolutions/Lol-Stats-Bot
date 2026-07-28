import type { ChatInputCommandInteraction } from "discord.js";
import { queueLabel, resolveQueue } from "../../config/queues.js";
import { resolveRegion } from "../../config/regions.js";
import { t } from "../../i18n/locales.js";
import { buildPlayerRecentStats } from "../../stats/player.js";
import { parseRiotId } from "../../utils/riot-id.js";
import { buildStatsEmbed } from "../embeds/stats-embed.js";
import { formatBotError } from "../format-error.js";
import {
  getGamesOption,
  getModeOption,
  replyLoading,
} from "../interaction-utils.js";
import type { CommandContext } from "./types.js";

export async function executeStats(
  interaction: ChatInputCommandInteraction,
  ctx: CommandContext,
): Promise<void> {
  const locale = await ctx.resolveLocale(interaction.guildId);
  await replyLoading(interaction, locale);

  const riotIdRaw = interaction.options.getString("riot_id", true);
  const regionRaw = interaction.options.getString("region");
  const modoRaw = getModeOption(interaction);
  const matchCount = getGamesOption(interaction, 12);

  try {
    const { gameName, tagLine } = parseRiotId(riotIdRaw, locale);
    const region = regionRaw
      ? resolveRegion(regionRaw, locale)
      : ctx.defaultRegion;
    const queue = resolveQueue(modoRaw, locale);

    const maxOpponentLookups = queue.opponentElo
      ? Math.min(20, Math.max(8, matchCount + 3))
      : 0;

    const stats = await buildPlayerRecentStats(
      ctx.riot,
      region,
      gameName,
      tagLine,
      {
        matchCount,
        maxOpponentLookups,
        queue,
      },
    );

    if (stats.sampleSize === 0) {
      await interaction.editReply({
        content: t(locale, "error.no_stats", {
          mode: queueLabel(locale, queue),
          riotId: stats.riotId,
          region: stats.region.label,
        }),
        embeds: [],
      });
      return;
    }

    const embed = await buildStatsEmbed(stats, locale);
    await interaction.editReply({ content: null, embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      content: formatBotError(err, locale),
      embeds: [],
    });
  }
}
