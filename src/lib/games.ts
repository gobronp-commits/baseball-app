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
