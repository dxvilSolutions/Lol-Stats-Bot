import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { queueDiscordChoices, resolveQueue } from "../../config/queues.js";
import {
  regionDiscordChoices,
  resolveRegion,
} from "../../config/regions.js";
import { buildMatchHistory } from "../../stats/history.js";
import { parseRiotId } from "../../utils/riot-id.js";
import { buildHistoryEmbed } from "../embeds/history-embed.js";
import { formatBotError } from "../format-error.js";
import type { BotCommand } from "./types.js";

export const historialCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("historial")
    .setDescription(
      "Lista partida a partida: Solo, Flex, ARAM, Normales, Arena…",
    )
    .addStringOption((opt) =>
      opt
        .setName("riot_id")
        .setDescription('Riot ID, ej. "Nombre#TAG"')
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("modo")
        .setDescription("Modo de juego (por defecto: Solo/Duo)")
        .setRequired(false)
        .addChoices(...queueDiscordChoices()),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("partidas")
        .setDescription("Cuántas partidas listar (1–15). Default: 10")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(15),
    )
    .addStringOption((opt) =>
      opt
        .setName("region")
        .setDescription("Región del invocador (por defecto: LAN)")
        .setRequired(false)
        .addChoices(...regionDiscordChoices().slice(0, 25)),
    ),

  async execute(interaction: ChatInputCommandInteraction, ctx) {
    await interaction.deferReply();

    const riotIdRaw = interaction.options.getString("riot_id", true);
    const regionRaw = interaction.options.getString("region");
    const modoRaw = interaction.options.getString("modo");
    const matchCount = interaction.options.getInteger("partidas") ?? 10;

    try {
      const { gameName, tagLine } = parseRiotId(riotIdRaw);
      const region = regionRaw
        ? resolveRegion(regionRaw)
        : ctx.defaultRegion;
      const queue = resolveQueue(modoRaw);

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
          content: `No encontré partidas de **${queue.label}** para **${history.riotId}** (${history.region.label}).`,
        });
        return;
      }

      const embed = await buildHistoryEmbed(history);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: formatBotError(err) });
    }
  },
};
