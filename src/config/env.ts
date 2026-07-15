import "dotenv/config";
import { DEFAULT_REGION_ALIAS, resolveRegion, type RegionConfig } from "./regions.js";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export interface AppConfig {
  discordToken: string;
  discordClientId: string;
  discordGuildId?: string;
  riotApiKey: string;
  defaultRegion: RegionConfig;
}

export function loadConfig(): AppConfig {
  const defaultAlias = process.env.DEFAULT_REGION?.trim() || DEFAULT_REGION_ALIAS;

  return {
    discordToken: requireEnv("DISCORD_TOKEN"),
    discordClientId: requireEnv("DISCORD_CLIENT_ID"),
    discordGuildId: process.env.DISCORD_GUILD_ID?.trim() || undefined,
    riotApiKey: requireEnv("RIOT_API_KEY"),
    defaultRegion: resolveRegion(defaultAlias),
  };
}
