# LoL Discord Bot

Bot de Discord en **TypeScript** + **discord.js** que consulta estadísticas de League of Legends con la **Riot Games API**.

Región por defecto: **LAN** (`la1`). El comando `/stats` acepta cualquier región soportada.

## Qué hace hoy (MVP)

`/stats riot_id:Nombre#TAG [region] [partidas]`

Sobre las últimas N ranked Solo/Duo (default 12):

- Winrate y KDA
- Campeones más usados
- Rank Solo actual
- Aproximación del ELO medio de rivales (rank actual de un sample de oponentes)

## Requisitos

- Node.js 20+
- [Discord Application](https://discord.com/developers/applications) (bot token + client id)
- [Riot API key](https://developer.riotgames.com/) (las keys de desarrollo caducan cada 24h)

## Setup

```bash
npm install
cp .env.example .env
```

Completa `.env`:

```env
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_GUILD_ID=...   # opcional, recomendado en desarrollo
RIOT_API_KEY=...
DEFAULT_REGION=lan
```

Invita el bot a tu servidor con el scope `bot` + `applications.commands`.

Registra los slash commands:

```bash
npm run deploy-commands
```

Arranca en modo desarrollo:

```bash
npm run dev
```

## Arquitectura

```
src/
  config/     # env + mapa de regiones (platform → cluster Riot)
  riot/       # cliente HTTP Riot (account, summoner, league, match)
  stats/      # métricas derivadas (WR, KDA, top champs, avg rank)
  bot/        # discord.js + comandos
  utils/
```

### Escalado multi-región

Cada alias (`lan`, `euw`, `kr`…) mapea a:

| Campo | Ejemplo LAN | Uso |
|-------|-------------|-----|
| `platformId` | `la1` | Summoner / League |
| `cluster` | `americas` | Account / Match-v5 |

Añadir una región nueva = una entrada en `src/config/regions.ts`.

## Despliegue 24/7 (varios servidores)

Para que el bot esté siempre online **sin tu PC** y funcione en **cualquier servidor** donde lo inviten:

1. **Comandos globales** — en `.env` deja `DISCORD_GUILD_ID` vacío y ejecuta `npm run deploy-commands` una vez. Los slash commands pueden tardar hasta ~1 hora la primera vez.
2. **Key de Riot estable** — la Development Key caduca cada 24h. Para 24/7 pide una [Personal API Key](https://developer.riotgames.com/) (Register Product → Personal).
3. **Hosting** — sube el bot a un servicio (recomendado para empezar: [Railway](https://railway.app) o [Render](https://render.com)). Configura las mismas variables del `.env` en el panel del hosting. **Start command:** `npm start` (tras `npm run build`).
4. **Invite link** (cámbiale el Client ID):

```text
https://discord.com/oauth2/authorize?client_id=TU_CLIENT_ID&permissions=18432&scope=bot+applications.commands
```

Guía detallada: ver sección más abajo en este README o el flujo Railway/Render.

### Railway (resumen)

1. Sube el repo a GitHub (sin `.env`).
2. Railway → New Project → Deploy from GitHub.
3. Variables: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `RIOT_API_KEY`, `DEFAULT_REGION=lan` (sin Guild ID).
4. Build: `npm install && npm run build` · Start: `npm start`.

### Render (resumen)

1. New → Web Service (o Background Worker si está disponible) desde GitHub.
2. Build: `npm install && npm run build` · Start: `npm start`.
3. Añade las mismas env vars. En plan free, un “web service” puede dormir; para bots conviene plan que no duerma o un worker siempre activo.

## Roadmap sugerido

1. Caché (SQLite/Redis) de matches y ranks → menos rate limit
2. Más comandos: `/live`, `/mastery`, `/compare`
3. Capa de agente IA (function calling) encima de las mismas tools
4. Riot Personal/Production API key + hosting 24/7

## Notas

- El ELO medio de rivales usa el **rank actual** de los oponentes, no el que tenían en la partida (Riot no lo incluye en Match-v5).
- Las keys personales tienen rate limits bajos; el cliente reintenta en `429`.
