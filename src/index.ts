import { loadConfig } from "./config/env.js";
import { createBot } from "./bot/client.js";
import { RiotClient } from "./riot/client.js";

async function main() {
  const config = loadConfig();
  const riot = new RiotClient(config.riotApiKey);
  const bot = createBot(riot, config.defaultRegion);
  await bot.login(config.discordToken);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
