import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { queueDiscordChoices } from "../config/queues.js";
import { regionDiscordChoices } from "../config/regions.js";
import type { Locale } from "../i18n/locales.js";
import { t } from "../i18n/locales.js";

/**
 * Build slash commands for a fixed server language.
 * Option names/descriptions match that language (not Discord client locale).
 */
export function buildSlashCommandsForLocale(
  locale: Locale,
): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
  const modeOpt = t(locale, "opt.modo");
  const gamesOpt = t(locale, "opt.partidas");
  const historyName = t(locale, "cmd.historial.name");
  const languageName = t(locale, "cmd.language.name");
  const localeOpt = t(locale, "cmd.language.opt.lang");

  const stats = new SlashCommandBuilder()
    .setName("stats")
    .setDescription(t(locale, "cmd.stats.desc"))
    .addStringOption((opt) =>
      opt
        .setName("riot_id")
        .setDescription(t(locale, "opt.riot_id.desc"))
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName(modeOpt)
        .setDescription(t(locale, "opt.modo.desc"))
        .setRequired(false)
        .addChoices(...queueDiscordChoices(locale)),
    )
    .addIntegerOption((opt) =>
      opt
        .setName(gamesOpt)
        .setDescription(t(locale, "opt.partidas.stats"))
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20),
    )
    .addStringOption((opt) =>
      opt
        .setName("region")
        .setDescription(t(locale, "opt.region.desc"))
        .setRequired(false)
        .addChoices(...regionDiscordChoices().slice(0, 25)),
    );

  const history = new SlashCommandBuilder()
    .setName(historyName)
    .setDescription(t(locale, "cmd.historial.desc"))
    .addStringOption((opt) =>
      opt
        .setName("riot_id")
        .setDescription(t(locale, "opt.riot_id.desc"))
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName(modeOpt)
        .setDescription(t(locale, "opt.modo.desc"))
        .setRequired(false)
        .addChoices(...queueDiscordChoices(locale)),
    )
    .addIntegerOption((opt) =>
      opt
        .setName(gamesOpt)
        .setDescription(t(locale, "opt.partidas.historial"))
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(15),
    )
    .addStringOption((opt) =>
      opt
        .setName("region")
        .setDescription(t(locale, "opt.region.desc"))
        .setRequired(false)
        .addChoices(...regionDiscordChoices().slice(0, 25)),
    );

  const language = new SlashCommandBuilder()
    .setName(languageName)
    .setDescription(t(locale, "cmd.language.desc"))
    .addStringOption((opt) =>
      opt
        .setName(localeOpt)
        .setDescription(t(locale, "cmd.language.opt.lang.desc"))
        .setRequired(true)
        .addChoices(
          { name: t(locale, "lang.choice.es"), value: "es" },
          { name: t(locale, "lang.choice.en"), value: "en" },
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

  return [stats.toJSON(), history.toJSON(), language.toJSON()];
}
