import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "../i18n/locales.js";
import { isLocale } from "../i18n/locales.js";

interface GuildSettingsFile {
  guilds: Record<string, { locale?: Locale }>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(DATA_DIR, "guild-settings.json");

let cache: GuildSettingsFile | null = null;

async function load(): Promise<GuildSettingsFile> {
  if (cache) return cache;
  try {
    const raw = await readFile(SETTINGS_PATH, "utf8");
    const parsed = JSON.parse(raw) as GuildSettingsFile;
    cache = { guilds: parsed.guilds ?? {} };
  } catch {
    cache = { guilds: {} };
  }
  return cache;
}

async function save(data: GuildSettingsFile): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SETTINGS_PATH, JSON.stringify(data, null, 2), "utf8");
  cache = data;
}

export async function getGuildLocale(
  guildId: string,
): Promise<Locale | undefined> {
  const data = await load();
  const locale = data.guilds[guildId]?.locale;
  return locale && isLocale(locale) ? locale : undefined;
}

export async function setGuildLocale(
  guildId: string,
  locale: Locale,
): Promise<void> {
  const data = await load();
  data.guilds[guildId] = { ...data.guilds[guildId], locale };
  await save(data);
}
