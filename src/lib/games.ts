import fs from "fs";
import path from "path";
import type { Game, MlbGameData } from "./types";

const dataDir = path.join(process.cwd(), "data");

let cachedGames: Game[] | null = null;

export function getAllGames(): Game[] {
  if (!cachedGames) {
    const raw = fs.readFileSync(path.join(dataDir, "games.json"), "utf8");
    cachedGames = (JSON.parse(raw) as Game[]).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }
  return cachedGames;
}

export function getGameById(id: string): Game | undefined {
  return getAllGames().find((g) => g.id === id);
}

export function getMlbData(game: Game): MlbGameData | null {
  if (!game.gamePk) return null;
  const file = path.join(dataDir, "mlb", `${game.gamePk}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as MlbGameData;
}

export type NotableProspect = {
  name: string;
  team: string;
  note: string;
  gameId: string;
  gameDate: string;
  gameLabel: string;
};

// Cape Cod League / minor-league games have no MLB box score, so there's no
// player data to derive this from - it's hand-curated from web research into
// data/notable-prospects.json and joined here with each game's date/matchup
// for display and linking.
export function getNotableProspects(): NotableProspect[] {
  const raw = fs.readFileSync(path.join(dataDir, "notable-prospects.json"), "utf8");
  const entries = JSON.parse(raw) as {
    gameId: string;
    players: { name: string; team: string; note: string }[];
  }[];
  const games = getAllGames();

  const prospects: NotableProspect[] = [];
  for (const entry of entries) {
    const game = games.find((g) => g.id === entry.gameId);
    if (!game) continue;
    for (const p of entry.players) {
      prospects.push({
        ...p,
        gameId: game.id,
        gameDate: game.date,
        gameLabel: `${game.awayTeam} @ ${game.homeTeam}`,
      });
    }
  }
  return prospects.sort((a, b) => a.gameDate.localeCompare(b.gameDate));
}

export type NotableEvent = {
  category: string;
  description: string;
  gameId: string;
  gameDate: string;
  gameLabel: string;
};

// Hand-curated highlights (ejections, milestones, quirky plays) pulled from
// game notes into data/notable-events.json, joined here for display/linking.
export function getNotableEvents(): NotableEvent[] {
  const raw = fs.readFileSync(path.join(dataDir, "notable-events.json"), "utf8");
  const entries = JSON.parse(raw) as {
    gameId: string;
    category: string;
    description: string;
  }[];
  const games = getAllGames();

  const events: NotableEvent[] = [];
  for (const entry of entries) {
    const game = games.find((g) => g.id === entry.gameId);
    if (!game) continue;
    events.push({
      category: entry.category,
      description: entry.description,
      gameId: game.id,
      gameDate: game.date,
      gameLabel: `${game.awayTeam} @ ${game.homeTeam}`,
    });
  }
  return events.sort((a, b) => b.gameDate.localeCompare(a.gameDate));
}
