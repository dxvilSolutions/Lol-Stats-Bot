import {
  Locale as DiscordLocale,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import {
  queueDiscordChoices,
  queueLabel,
  resolveQueue,
} from "../../config/queues.js";
import {
  regionDiscordChoices,
  resolveRegion,
} from "../../config/regions.js";
import { t } from "../../i18n/locales.js";
import { buildMatchHistory } from "../../stats/history.js";
import { parseRiotId } from "../../utils/riot-id.js";
import { buildHistoryEmbed } from "../embeds/history-embed.js";
import { formatBotError } from "../format-error.js";
import type { BotCommand, CommandContext } from "./types.js";

async function executeHistory(
  interaction: ChatInputCommandInteraction,
  ctx: CommandContext,
): Promise<void> {
  await interaction.deferReply();
  const locale = await ctx.resolveLocale(interaction.guildId);

  const riotIdRaw = interaction.options.getString("riot_id", true);
  const regionRaw = interaction.options.getString("region");
  const modoRaw =
    interaction.options.getString("modo") ??
    interaction.options.getString("mode");
  const matchCount =
    interaction.options.getInteger("partidas") ??
    interaction.options.getInteger("games") ??
    10;

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
      });
      return;
    }

    const embed = await buildHistoryEmbed(history, locale);
    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({ content: formatBotError(err, locale) });
  }
}

/** Spanish command name — `/historial` */
export const historialCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("historial")
    .setDescription(
      "Lista partida a partida: Solo, Flex, ARAM, Normales, Arena…",
    )
    .setDescriptionLocalizations({
      [DiscordLocale.SpanishES]:
        "Lista partida a partida: Solo, Flex, ARAM, Normales, Arena…",
      [DiscordLocale.EnglishUS]:
        "Match-by-match list: Solo, Flex, ARAM, Normals, Arena…",
    })
    .addStringOption((opt) =>
      opt
        .setName("riot_id")
        .setDescription('Riot ID, ej. "Nombre#TAG"')
        .setDescriptionLocalizations({
          [DiscordLocale.SpanishES]: 'Riot ID, ej. "Nombre#TAG"',
          [DiscordLocale.EnglishUS]: 'Riot ID, e.g. "Name#TAG"',
        })
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("modo")
        .setDescription("Modo de juego (por defecto: Solo/Duo)")
        .setDescriptionLocalizations({
          [DiscordLocale.SpanishES]: "Modo de juego (por defecto: Solo/Duo)",
          [DiscordLocale.EnglishUS]: "Game mode (default: Solo/Duo)",
        })
        .setRequired(false)
        .addChoices(...queueDiscordChoices()),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("partidas")
        .setDescription("Cuántas partidas listar (1–15). Default: 10")
        .setDescriptionLocalizations({
          [DiscordLocale.SpanishES]:
            "Cuántas partidas listar (1–15). Default: 10",
          [DiscordLocale.EnglishUS]:
            "How many games to list (1–15). Default: 10",
        })
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(15),
    )
    .addStringOption((opt) =>
      opt
        .setName("region")
        .setDescription("Región del invocador (por defecto: LAN)")
        .setDescriptionLocalizations({
          [DiscordLocale.SpanishES]: "Región del invocador (por defecto: LAN)",
          [DiscordLocale.EnglishUS]: "Summoner region (default: LAN)",
        })
        .setRequired(false)
        .addChoices(...regionDiscordChoices().slice(0, 25)),
    ),

  execute: executeHistory,
};

/** English command name — `/history` */
export const historyCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription(
      "Match-by-match list: Solo, Flex, ARAM, Normals, Arena…",
    )
    .setDescriptionLocalizations({
      [DiscordLocale.SpanishES]:
        "Lista partida a partida: Solo, Flex, ARAM, Normales, Arena…",
      [DiscordLocale.EnglishUS]:
        "Match-by-match list: Solo, Flex, ARAM, Normals, Arena…",
    })
    .addStringOption((opt) =>
      opt
        .setName("riot_id")
        .setDescription('Riot ID, e.g. "Name#TAG"')
        .setDescriptionLocalizations({
          [DiscordLocale.SpanishES]: 'Riot ID, ej. "Nombre#TAG"',
          [DiscordLocale.EnglishUS]: 'Riot ID, e.g. "Name#TAG"',
        })
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("mode")
        .setDescription("Game mode (default: Solo/Duo)")
        .setDescriptionLocalizations({
          [DiscordLocale.SpanishES]: "Modo de juego (por defecto: Solo/Duo)",
          [DiscordLocale.EnglishUS]: "Game mode (default: Solo/Duo)",
        })
        .setRequired(false)
        .addChoices(...queueDiscordChoices()),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("games")
        .setDescription("How many games to list (1–15). Default: 10")
        .setDescriptionLocalizations({
          [DiscordLocale.SpanishES]:
            "Cuántas partidas listar (1–15). Default: 10",
          [DiscordLocale.EnglishUS]:
            "How many games to list (1–15). Default: 10",
        })
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(15),
    )
    .addStringOption((opt) =>
      opt
        .setName("region")
        .setDescription("Summoner region (default: LAN)")
        .setDescriptionLocalizations({
          [DiscordLocale.SpanishES]: "Región del invocador (por defecto: LAN)",
          [DiscordLocale.EnglishUS]: "Summoner region (default: LAN)",
        })
        .setRequired(false)
        .addChoices(...regionDiscordChoices().slice(0, 25)),
    ),

  execute: executeHistory,
};
