import {
  Locale as DiscordLocale,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { isLocale, t, type Locale } from "../../i18n/locales.js";
import { setGuildLocale } from "../../storage/guild-settings.js";
import type { BotCommand } from "./types.js";

export const languageCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("language")
    .setNameLocalizations({
      [DiscordLocale.SpanishES]: "idioma",
      [DiscordLocale.EnglishUS]: "language",
    })
    .setDescription("Set this server's bot language")
    .setDescriptionLocalizations({
      [DiscordLocale.SpanishES]:
        "Configura el idioma del bot en este servidor",
      [DiscordLocale.EnglishUS]: "Set this server's bot language",
    })
    .addStringOption((opt) =>
      opt
        .setName("locale")
        .setNameLocalizations({
          [DiscordLocale.SpanishES]: "idioma",
          [DiscordLocale.EnglishUS]: "language",
        })
        .setDescription("Spanish or English")
        .setDescriptionLocalizations({
          [DiscordLocale.SpanishES]: "Español o English",
          [DiscordLocale.EnglishUS]: "Spanish or English",
        })
        .setRequired(true)
        .addChoices(
          {
            name: "Español",
            name_localizations: {
              "es-ES": "Español",
              "en-US": "Spanish",
            },
            value: "es",
          },
          {
            name: "English",
            name_localizations: {
              "es-ES": "English",
              "en-US": "English",
            },
            value: "en",
          },
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: ChatInputCommandInteraction, ctx) {
    const locale = await ctx.resolveLocale(interaction.guildId);

    if (!interaction.guildId) {
      await interaction.reply({
        content: t(locale, "lang.dm"),
        ephemeral: true,
      });
      return;
    }

    const canManage =
      interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ??
      false;

    if (!canManage) {
      await interaction.reply({
        content: t(locale, "lang.need_perm"),
        ephemeral: true,
      });
      return;
    }

    const chosen = interaction.options.getString("locale", true);
    if (!isLocale(chosen)) {
      await interaction.reply({
        content: t(locale, "error.unexpected"),
        ephemeral: true,
      });
      return;
    }

    const next = chosen as Locale;
    const current = await ctx.resolveLocale(interaction.guildId);

    if (current === next) {
      await interaction.reply({
        content: t(next, "lang.already"),
        ephemeral: true,
      });
      return;
    }

    await setGuildLocale(interaction.guildId, next);
    await interaction.reply({
      content: t(next, "lang.set"),
      ephemeral: true,
    });
  },
};
