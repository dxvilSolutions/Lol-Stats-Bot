import type { ChatInputCommandInteraction } from "discord.js";
import { queueLabel, resolveQueue } from "../../config/queues.js";
import { resolveRegion } from "../../config/regions.js";
import { t } from "../../i18n/locales.js";
import { buildMatchHistory } from "../../stats/history.js";
import { parseRiotId } from "../../utils/riot-id.js";
import { buildHistoryEmbed } from "../embeds/history-embed.js";
import { formatBotError } from "../format-error.js";
import {
  getGamesOption,
  getModeOption,
  replyLoading,
} from "../interaction-utils.js";
import type { CommandContext } from "./types.js";

export async function executeHistory(
  interaction: ChatInputCommandInteraction,
  ctx: CommandContext,
): Promise<void> {
  const locale = await ctx.resolveLocale(interaction.guildId);
  await replyLoading(interaction, locale);

  const riotIdRaw = interaction.options.getString("riot_id", true);
  const regionRaw = interaction.options.getString("region");
  const modoRaw = getModeOption(interaction);
  const matchCount = getGamesOption(interaction, 10);

  try {
    const { gameName, tagLine } = parseRiotId(riotIdRaw, locale);
    const region = regionRaw
      ? resolveRegion(regionRaw, locale)
      : ctx.defaultRegion;
    const queue = resolveQueue(modoRaw, locale);

    const history = await buildMatchHistory(
      ctx.riot,
      region,
      gameName,
      tagLine,
      queue,
      matchCount,
    );

    if (history.matches.length === 0) {
      await interaction.editReply({
        content: t(locale, "error.no_history", {
          mode: queueLabel(locale, queue),
          riotId: history.riotId,
          region: history.region.label,
        }),
        embeds: [],
      });
      return;
    }

    const embed = await buildHistoryEmbed(history, locale);
    await interaction.editReply({ content: null, embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      content: formatBotError(err, locale),
      embeds: [],
    });
  }
}
