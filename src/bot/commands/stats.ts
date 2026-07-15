import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import {
  regionDiscordChoices,
  resolveRegion,
} from "../../config/regions.js";
import { RiotApiError } from "../../riot/types.js";
import { buildPlayerRecentStats } from "../../stats/player.js";
import { parseRiotId } from "../../utils/riot-id.js";
import { buildStatsEmbed } from "../embeds/stats-embed.js";
import type { BotCommand } from "./types.js";

export const statsCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription(
      "Estadísticas ranked Solo: WR, KDA, campeones y ELO de rivales.",
    )
    .addStringOption((opt) =>
      opt
        .setName("riot_id")
        .setDescription('Riot ID, ej. "Nombre#TAG"')
        .setRequired(true),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("partidas")
        .setDescription(
          "Cuántas ranked Solo recientes usar (1–20). Por defecto: 12",
        )
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20),
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
    const matchCount = interaction.options.getInteger("partidas") ?? 12;

    try {
      const { gameName, tagLine } = parseRiotId(riotIdRaw);
      const region = regionRaw
        ? resolveRegion(regionRaw)
        : ctx.defaultRegion;

      // Scale opponent lookups lightly with sample size (rate-limit friendly)
      const maxOpponentLookups = Math.min(20, Math.max(8, matchCount + 3));

      const stats = await buildPlayerRecentStats(
        ctx.riot,
        region,
        gameName,
        tagLine,
        {
          matchCount,
          maxOpponentLookups,
        },
      );

      if (stats.sampleSize === 0) {
        await interaction.editReply({
          content: `No encontré ranked Solo recientes para **${stats.riotId}** (${stats.region.label}).`,
        });
        return;
      }

      const embed = await buildStatsEmbed(stats);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: formatError(err) });
    }
  },
};

function formatError(err: unknown): string {
  if (err instanceof RiotApiError) {
    if (err.status === 404) {
      return "No encontré ese invocador. Revisa Riot ID y región.";
    }
    if (err.status === 401 || err.status === 403) {
      return "La API key de Riot rechazó la petición (¿expiró la key de desarrollo?).";
    }
    if (err.status === 429) {
      return "Rate limit de Riot. Espera un momento e inténtalo de nuevo.";
    }
    return `Error de Riot API (${err.status}).`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Error inesperado.";
}
