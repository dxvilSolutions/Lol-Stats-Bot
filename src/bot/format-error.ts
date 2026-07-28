import { RiotApiError } from "../riot/types.js";

export function formatBotError(err: unknown): string {
  if (err instanceof RiotApiError) {
    if (err.status === 404) {
      return "No encontré ese invocador. Revisa Riot ID y región.";
    }
    if (err.status === 401 || err.status === 403) {
      return "La API key de Riot rechazó la petición (¿expiró la key?).";
    }
    if (err.status === 429) {
      return "Rate limit de Riot. Espera un momento e inténtalo de nuevo.";
    }
    return `Error de Riot API (${err.status}).`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Error inesperado.";
}
