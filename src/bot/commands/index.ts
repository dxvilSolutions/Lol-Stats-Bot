import type { BotCommand } from "./types.js";
import { historialCommand } from "./historial.js";
import { statsCommand } from "./stats.js";

export type { BotCommand, CommandContext } from "./types.js";

export const commands: BotCommand[] = [statsCommand, historialCommand];
