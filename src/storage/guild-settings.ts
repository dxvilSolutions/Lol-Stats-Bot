import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "../i18n/locales.js";
import { isLocale } from "../i18n/locales.js";

interface GuildSettingsFile {
  guilds: Record<string, { locale?: Locale }>;
}

function dataDir(): string {
  const fromEnv = process.env.DATA_DIR?.trim();
  return fromEnv && fromEnv.length > 0
    ? path.resolve(fromEnv)
    : path.join(process.cwd(), "data");
}

function settingsPath(): string {
  return path.join(dataDir(), "guild-settings.json");
}

let cache: GuildSettingsFile | null = null;

async function load(): Promise<GuildSettingsFile> {
  if (cache) return cache;
  try {
    const raw = await readFile(settingsPath(), "utf8");
    const parsed = JSON.parse(raw) as GuildSettingsFile;
    cache = { guilds: parsed.guilds ?? {} };
  } catch {
    cache = { guilds: {} };
  }
  return cache;
}

async function save(data: GuildSettingsFile): Promise<void> {
  const dir = dataDir();
  await mkdir(dir, { recursive: true });
  await writeFile(settingsPath(), JSON.stringify(data, null, 2), "utf8");
  cache = data;
}

/** Ensure the data directory exists and log where settings live. */
export async function initGuildSettingsStore(): Promise<string> {
  const dir = dataDir();
  await mkdir(dir, { recursive: true });
  // Warm cache from disk if present
  await load();
  console.log(`Guild settings path: ${settingsPath()}`);
  return settingsPath();
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
