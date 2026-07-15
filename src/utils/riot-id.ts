export interface ParsedRiotId {
  gameName: string;
  tagLine: string;
}

/**
 * Accepts "Name#TAG" or "Name-TAG" (common Discord-friendly form).
 */
export function parseRiotId(input: string): ParsedRiotId {
  const trimmed = input.trim();
  const hash = trimmed.lastIndexOf("#");
  const dash = trimmed.lastIndexOf("-");

  let gameName: string;
  let tagLine: string;

  if (hash > 0) {
    gameName = trimmed.slice(0, hash).trim();
    tagLine = trimmed.slice(hash + 1).trim();
  } else if (dash > 0) {
    gameName = trimmed.slice(0, dash).trim();
    tagLine = trimmed.slice(dash + 1).trim();
  } else {
    throw new Error(
      'Formato inválido. Usa Riot ID como "Nombre#TAG" (ej. Faker#KR1).',
    );
  }

  if (!gameName || !tagLine) {
    throw new Error(
      'Formato inválido. Usa Riot ID como "Nombre#TAG" (ej. Faker#KR1).',
    );
  }

  return { gameName, tagLine };
}
