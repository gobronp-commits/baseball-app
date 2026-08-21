import type { Game, MlbGameData } from "./types";

export function gamesForTeam(games: Game[], team: string): Game[] {
  return games.filter((g) => g.awayTeam === team || g.homeTeam === team);
}

export function gamesForScorer(games: Game[], scorer: string): Game[] {
  return games.filter((g) => g.scorers.includes(scorer));
}

export function gamesForPlayer(
  games: Game[],
  getMlb: (game: Game) => MlbGameData | null,
  player: string
): Game[] {
  return games.filter((g) => {
    const mlb = getMlb(g);
    if (!mlb) return false;
    const names = [
      ...mlb.boxscore.away.batters,
      ...mlb.boxscore.away.pitchers,
      ...mlb.boxscore.home.batters,
      ...mlb.boxscore.home.pitchers,
    ].map((p) => p.name);
    return names.includes(player);
  });
}
