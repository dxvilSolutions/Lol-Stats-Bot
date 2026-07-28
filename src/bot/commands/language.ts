import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { isLocale, t, type Locale } from "../../i18n/locales.js";
import { setGuildLocale } from "../../storage/guild-settings.js";
import { getLocaleOption } from "../interaction-utils.js";
import type { CommandContext } from "./types.js";

export async function executeLanguage(
  interaction: ChatInputCommandInteraction,
  ctx: CommandContext,
): Promise<void> {
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

  const chosen = getLocaleOption(interaction);
  if (!chosen || !isLocale(chosen)) {
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

  await interaction.reply({
    content: t(next, "lang.syncing"),
    ephemeral: true,
  });

  await setGuildLocale(interaction.guildId, next);

  if (ctx.syncGuildCommands) {
    try {
      await ctx.syncGuildCommands(interaction.guildId, next);
    } catch (err) {
      console.error("Failed to sync guild commands after language change", err);
      await interaction.editReply({
        content: `${t(next, "lang.sync_ok")}\n_(Command UI sync failed; try again later.)_`,
      });
      return;
    }
  }

  await interaction.editReply({ content: t(next, "lang.sync_ok") });
}
