export type Locale = "es" | "en";

export const LOCALES: readonly Locale[] = ["es", "en"] as const;

export function isLocale(value: string): value is Locale {
  return value === "es" || value === "en";
}

type Dict = Record<string, string>;

const es: Dict = {
  // Commands
  "cmd.stats.name": "stats",
  "cmd.stats.desc":
    "Resumen (WR, KDA, champs) de un modo: Solo, Flex, ARAM, Arena…",
  "cmd.historial.name": "historial",
  "cmd.historial.desc":
    "Lista partida a partida: Solo, Flex, ARAM, Normales, Arena…",
  "cmd.language.name": "idioma",
  "cmd.language.desc": "Configura el idioma del bot en este servidor",
  "cmd.language.opt.lang": "idioma",
  "cmd.language.opt.lang.desc": "Español o English",
  "opt.riot_id": "riot_id",
  "opt.riot_id.desc": 'Riot ID, ej. "Nombre#TAG"',
  "opt.modo": "modo",
  "opt.modo.desc": "Modo de juego (por defecto: Solo/Duo)",
  "opt.partidas": "partidas",
  "opt.partidas.stats": "Cuántas partidas recientes usar (1–20). Default: 12",
  "opt.partidas.historial": "Cuántas partidas listar (1–15). Default: 10",
  "opt.region": "region",
  "opt.region.desc": "Región del invocador (por defecto: LAN)",

  // Language command
  "lang.set": "✅ Idioma del servidor configurado a **Español**.",
  "lang.already": "ℹ️ Este servidor ya está en **Español**.",
  "lang.need_perm":
    "Necesitas el permiso **Administrar servidor** para cambiar el idioma.",
  "lang.dm": "Este comando solo funciona dentro de un servidor.",
  "lang.choice.es": "Español",
  "lang.choice.en": "English",
  "lang.sync_ok":
    "✅ Idioma del servidor: **Español**. Las opciones de los comandos se actualizaron.",
  "lang.syncing": "Actualizando comandos del servidor…",
  "loading": "⏳ Consultando Riot API…",

  // Generic errors
  "error.generic": "Hubo un error al ejecutar el comando.",
  "error.unexpected": "Error inesperado.",
  "error.not_found": "No encontré ese invocador. Revisa Riot ID y región.",
  "error.api_key": "La API key de Riot rechazó la petición (¿expiró la key?).",
  "error.rate_limit":
    "Rate limit de Riot. Espera un momento e inténtalo de nuevo.",
  "error.riot_status": "Error de Riot API ({status}).",
  "error.riot_id":
    'Formato inválido. Usa Riot ID como "Nombre#TAG" (ej. Faker#KR1).',
  "error.unknown_mode": 'Modo desconocido: "{input}". Usa uno de: {known}',
  "error.unknown_region": 'Región desconocida: "{input}". Usa una de: {known}',
  "error.no_stats":
    "No encontré partidas recientes de **{mode}** para **{riotId}** ({region}).",
  "error.no_history":
    "No encontré partidas de **{mode}** para **{riotId}** ({region}).",

  // Style labels
  "wr.excellent": "Excelente",
  "wr.good": "Bueno",
  "wr.balanced": "Equilibrado",
  "wr.low": "Bajo",
  "wr.critical": "Crítico",
  "kda.outstanding": "Destacado",
  "kda.great": "Muy bueno",
  "kda.solid": "Sólido",
  "kda.average": "Promedio",
  "kda.low": "Bajo",

  // Stats embed
  "stats.unranked": "**Unranked** en {mode}",
  "stats.no_ladder": "{emoji} **{mode}** · sin ladder",
  "stats.hot_streak": " · 🔥 Hot streak",
  "stats.season": "Temporada {mode}: **{wins}W / {losses}L** ({wr}% WR)",
  "stats.wr_field": "{emoji} Winrate · {label}",
  "stats.wr_value": "**{wr}%** ({wins}W – {losses}L)",
  "stats.kda_field": "{emoji} KDA · {label}",
  "stats.kda_value": "**{kda}**\npromedio en el sample",
  "stats.sample_field": "🎯 Sample",
  "stats.sample_value": "**{count}** · {mode}",
  "stats.opp_field": "⚔️ ELO medio de rivales",
  "stats.opp_value": "~**{rank}** · sample {n} rivales",
  "stats.opp_na": "No disponible",
  "stats.champs_field": "🗡️ Campeones más usados",
  "stats.title": "{emoji} {mode} · {region} · Nv. {level}",
  "stats.footer_ranked": "{region} · Riot API · rivales ≈ rank actual",
  "stats.footer": "{region} · Riot API · {mode}",
  "stats.champ_line":
    "{medal} **{champion}** · {games}p · {wr}% WR · KDA {kda}",

  // History embed
  "history.title": "{emoji} Historial · {mode} · {region}",
  "history.summary":
    "{emoji} **{wr}%** WR · {wins}W – {losses}L · {count} partidas",
  "history.field": "Partidas recientes",
  "history.empty": "Sin partidas",
  "history.footer": "{region} · {mode} · Riot API",
  "history.line":
    "**{n}.** {result} **{champion}**{place}{subMode}\n└ {kills}/{deaths}/{assists} · KDA {kda} · {duration} · CS {cs} · {when}",

  // Queue labels
  "queue.solo": "Ranked Solo/Duo",
  "queue.solo.short": "Solo/Duo",
  "queue.flex": "Ranked Flex",
  "queue.flex.short": "Flex",
  "queue.aram": "ARAM",
  "queue.aram.short": "ARAM",
  "queue.mayhem": "ARAM Caos (Mayhem)",
  "queue.mayhem.short": "ARAM Caos",
  "queue.normal": "Normales",
  "queue.normal.short": "Normal",
  "queue.draft": "Normal Draft",
  "queue.draft.short": "Draft",
  "queue.blind": "Normal Blind",
  "queue.blind.short": "Blind",
  "queue.quickplay": "Quickplay",
  "queue.quickplay.short": "Quickplay",
  "queue.arena": "Arena 2 jugadores",
  "queue.arena.short": "Arena 2v2",
  "queue.arena3": "Arena 3 jugadores",
  "queue.arena3.short": "Arena 3v3",
  "queue.urf": "URF",
  "queue.urf.short": "URF",
  "queue.ofa": "One for All",
  "queue.ofa.short": "OFA",
  "queue.nexus": "Nexus Blitz",
  "queue.nexus.short": "Nexus Blitz",
  "queue.cola": "Cola {id}",
  "error.mode_private":
    "Riot no publica los detalles de partidas de **{mode}** vía API (solo aparecen en el cliente). No puedo mostrar stats/historial de ese modo.",
  "lang.name.es": "Español",
  "lang.name.en": "English",
};

const en: Dict = {
  "cmd.stats.name": "stats",
  "cmd.stats.desc":
    "Summary (WR, KDA, champs) for a mode: Solo, Flex, ARAM, Arena…",
  "cmd.historial.name": "history",
  "cmd.historial.desc":
    "Match-by-match list: Solo, Flex, ARAM, Normals, Arena…",
  "cmd.language.name": "language",
  "cmd.language.desc": "Set this server's bot language",
  "cmd.language.opt.lang": "language",
  "cmd.language.opt.lang.desc": "Spanish or English",
  "opt.riot_id": "riot_id",
  "opt.riot_id.desc": 'Riot ID, e.g. "Name#TAG"',
  "opt.modo": "mode",
  "opt.modo.desc": "Game mode (default: Solo/Duo)",
  "opt.partidas": "games",
  "opt.partidas.stats": "How many recent games to use (1–20). Default: 12",
  "opt.partidas.historial": "How many games to list (1–15). Default: 10",
  "opt.region": "region",
  "opt.region.desc": "Summoner region (default: LAN)",

  "lang.set": "✅ Server language set to **English**.",
  "lang.already": "ℹ️ This server is already set to **English**.",
  "lang.need_perm":
    "You need the **Manage Server** permission to change the language.",
  "lang.dm": "This command only works inside a server.",
  "lang.choice.es": "Español",
  "lang.choice.en": "English",
  "lang.sync_ok":
    "✅ Server language: **English**. Slash command options were updated.",
  "lang.syncing": "Updating server commands…",
  "loading": "⏳ Fetching from Riot API…",

  "error.generic": "Something went wrong while running that command.",
  "error.unexpected": "Unexpected error.",
  "error.not_found": "Summoner not found. Check Riot ID and region.",
  "error.api_key": "Riot API key was rejected (did the key expire?).",
  "error.rate_limit": "Riot rate limit hit. Wait a moment and try again.",
  "error.riot_status": "Riot API error ({status}).",
  "error.riot_id":
    'Invalid format. Use a Riot ID like "Name#TAG" (e.g. Faker#KR1).',
  "error.unknown_mode": 'Unknown mode: "{input}". Use one of: {known}',
  "error.unknown_region": 'Unknown region: "{input}". Use one of: {known}',
  "error.no_stats":
    "No recent **{mode}** games found for **{riotId}** ({region}).",
  "error.no_history":
    "No **{mode}** games found for **{riotId}** ({region}).",

  "wr.excellent": "Excellent",
  "wr.good": "Good",
  "wr.balanced": "Balanced",
  "wr.low": "Low",
  "wr.critical": "Critical",
  "kda.outstanding": "Outstanding",
  "kda.great": "Great",
  "kda.solid": "Solid",
  "kda.average": "Average",
  "kda.low": "Low",

  "stats.unranked": "**Unranked** in {mode}",
  "stats.no_ladder": "{emoji} **{mode}** · no ladder",
  "stats.hot_streak": " · 🔥 Hot streak",
  "stats.season": "Season {mode}: **{wins}W / {losses}L** ({wr}% WR)",
  "stats.wr_field": "{emoji} Winrate · {label}",
  "stats.wr_value": "**{wr}%** ({wins}W – {losses}L)",
  "stats.kda_field": "{emoji} KDA · {label}",
  "stats.kda_value": "**{kda}**\nsample average",
  "stats.sample_field": "🎯 Sample",
  "stats.sample_value": "**{count}** · {mode}",
  "stats.opp_field": "⚔️ Avg opponent ELO",
  "stats.opp_value": "~**{rank}** · sample {n} opponents",
  "stats.opp_na": "Not available",
  "stats.champs_field": "🗡️ Most played champions",
  "stats.title": "{emoji} {mode} · {region} · Lv. {level}",
  "stats.footer_ranked": "{region} · Riot API · opponents ≈ current rank",
  "stats.footer": "{region} · Riot API · {mode}",
  "stats.champ_line":
    "{medal} **{champion}** · {games}g · {wr}% WR · KDA {kda}",

  "history.title": "{emoji} History · {mode} · {region}",
  "history.summary":
    "{emoji} **{wr}%** WR · {wins}W – {losses}L · {count} games",
  "history.field": "Recent games",
  "history.empty": "No games",
  "history.footer": "{region} · {mode} · Riot API",
  "history.line":
    "**{n}.** {result} **{champion}**{place}{subMode}\n└ {kills}/{deaths}/{assists} · KDA {kda} · {duration} · CS {cs} · {when}",

  "queue.solo": "Ranked Solo/Duo",
  "queue.solo.short": "Solo/Duo",
  "queue.flex": "Ranked Flex",
  "queue.flex.short": "Flex",
  "queue.aram": "ARAM",
  "queue.aram.short": "ARAM",
  "queue.mayhem": "ARAM: Mayhem",
  "queue.mayhem.short": "Mayhem",
  "queue.normal": "Normals",
  "queue.normal.short": "Normal",
  "queue.draft": "Normal Draft",
  "queue.draft.short": "Draft",
  "queue.blind": "Normal Blind",
  "queue.blind.short": "Blind",
  "queue.quickplay": "Quickplay",
  "queue.quickplay.short": "Quickplay",
  "queue.arena": "Arena (2 players)",
  "queue.arena.short": "Arena 2v2",
  "queue.arena3": "Arena (3 players)",
  "queue.arena3.short": "Arena 3v3",
  "queue.urf": "URF",
  "queue.urf.short": "URF",
  "queue.ofa": "One for All",
  "queue.ofa.short": "OFA",
  "queue.nexus": "Nexus Blitz",
  "queue.nexus.short": "Nexus Blitz",
  "queue.cola": "Queue {id}",
  "error.mode_private":
    "Riot does not expose **{mode}** match details via the public API (client-only). I can't show stats/history for that mode.",
  "lang.name.es": "Español",
  "lang.name.en": "English",
};

const catalogs: Record<Locale, Dict> = { es, en };

export type Interp = Record<string, string | number>;

export function t(locale: Locale, key: string, vars?: Interp): string {
  const raw = catalogs[locale][key] ?? catalogs.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`,
  );
}
