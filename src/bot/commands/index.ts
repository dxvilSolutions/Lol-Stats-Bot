import type { BotCommand } from "./types.js";
import { statsCommand } from "./stats.js";

export type { BotCommand, CommandContext } from "./types.js";

export const commands: BotCommand[] = [statsCommand];
