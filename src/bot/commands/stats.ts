import {
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import {
  regionDiscordChoices,
  resolveRegion,
} from "../../config/regions.js";
import { RiotApiError } from "../../riot/types.js";
import { buildPlayerRecentStats } from "../../stats/player.js";
import { parseRiotId } from "../../utils/riot-id.js";
import type { BotCommand } from "./types.js";

export const statsCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription(
      "Winrate, KDA, campeones y ELO medio de rivales (últimas ranked Solo).",
    )
    .addStringOption((opt) =>
      opt
        .setName("riot_id")
        .setDescription('Riot ID, ej. "Nombre#TAG"')
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("region")
        .setDescription("Región del invocador (default: LAN)")
        .setRequired(false)
        .addChoices(...regionDiscordChoices().slice(0, 25)),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("partidas")
        .setDescription("Cuántas ranked recientes analizar (1–20, default 12)")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20),
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

      const stats = await buildPlayerRecentStats(
        ctx.riot,
        region,
        gameName,
        tagLine,
        {
          matchCount,
          maxOpponentLookups: 15,
        },
      );

      if (stats.sampleSize === 0) {
        await interaction.editReply({
          content: `No encontré ranked Solo recientes para **${stats.riotId}** (${stats.region.label}).`,
        });
        return;
      }

      const champs = stats.topChampions
        .map(
          (c) =>
            `• **${c.champion}** — ${c.games}p, ${c.winrate}% WR, KDA ${c.avgKda}`,
        )
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor(0x0ac8b9)
        .setTitle(stats.riotId)
        .setDescription(
          `Región **${stats.region.label}** · Nivel ${stats.level}` +
            (stats.currentSoloRank
              ? ` · Solo/Duo **${stats.currentSoloRank}**`
              : " · Sin rank Solo visible"),
        )
        .addFields(
          {
            name: `Últimas ${stats.sampleSize} ranked`,
            value: [
              `**WR** ${stats.winrate}% (${stats.wins}W / ${stats.losses}L)`,
              `**KDA** ${stats.avgKda}`,
              stats.avgOpponentRank
                ? `**ELO medio rivales** ~${stats.avgOpponentRank} (${stats.opponentsSampled} sampled)`
                : "**ELO medio rivales** no disponible",
            ].join("\n"),
            inline: false,
          },
          {
            name: "Campeones más usados",
            value: champs || "—",
            inline: false,
          },
        )
        .setFooter({
          text: "Datos via Riot API · ELO de rivales es aproximación del rank actual",
        })
        .setTimestamp();

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
