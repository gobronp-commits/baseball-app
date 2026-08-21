import type { Game } from "./types";

// The official MLB record is the source of truth for final scores; the
// handwritten tally is kept as a footnote and only shown when it differs
// (paper scorecards occasionally miss a late run).
export function displayScore(game: Game): { away: number; home: number } {
  return {
    away: game.officialAwayScore ?? game.scorecardAwayScore,
    home: game.officialHomeScore ?? game.scorecardHomeScore,
  };
}

export function scoreDiffersFromScorecard(game: Game): boolean {
  return (
    game.officialAwayScore !== null &&
    game.officialHomeScore !== null &&
    (game.officialAwayScore !== game.scorecardAwayScore ||
      game.officialHomeScore !== game.scorecardHomeScore)
  );
}
