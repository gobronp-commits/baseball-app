import type { Game, MlbGameData } from "./types";
import { displayScore } from "./score";

const YOUR_TEAM = "Boston Red Sox";
const TOP_N = 10;

export type TeamRecord = {
  team: string;
  gamesSeen: number;
  redSoxWins: number;
  redSoxLosses: number;
};

export type PlayerStat = {
  name: string;
  team: string;
  gamesSeen: number;
  homeRuns: number;
  strikeOuts: number;
};

export type PitcherStat = {
  name: string;
  team: string;
  gamesSeen: number;
  wins: number;
  losses: number;
  strikeOuts: number;
};

export type ScorerStat = {
  name: string;
  gamesSeen: number;
};

export type Summary = {
  totalGames: number;
  firstDate: string;
  lastDate: string;
  redSoxRecord: { wins: number; losses: number };
  teams: TeamRecord[];
  mostSeenPlayers: PlayerStat[];
  homeRunLeaders: PlayerStat[];
  mostSeenPitchers: PitcherStat[];
  strikeoutPitchers: PitcherStat[];
  strikeoutBatters: PlayerStat[];
  scorers: ScorerStat[];
};

function num(v: unknown): number {
  return typeof v === "number" ? v : 0;
}

export function computeSummary(
  games: Game[],
  getMlb: (game: Game) => MlbGameData | null
): Summary {
  const teamMap = new Map<string, TeamRecord>();
  const playerMap = new Map<string, PlayerStat>();
  const pitcherMap = new Map<string, PitcherStat>();
  const scorerMap = new Map<string, ScorerStat>();

  let redSoxWins = 0;
  let redSoxLosses = 0;

  const sorted = [...games].sort((a, b) => a.date.localeCompare(b.date));

  for (const game of sorted) {
    const opponent = game.homeTeam === YOUR_TEAM ? game.awayTeam : game.homeTeam;
    const redSoxSide: "home" | "away" | null =
      game.homeTeam === YOUR_TEAM ? "home" : game.awayTeam === YOUR_TEAM ? "away" : null;

    const score = displayScore(game);
    if (redSoxSide) {
      const redSoxScore = redSoxSide === "home" ? score.home : score.away;
      const oppScore = redSoxSide === "home" ? score.away : score.home;
      const won = redSoxScore > oppScore;
      if (won) redSoxWins++;
      else redSoxLosses++;

      const team = teamMap.get(opponent) ?? {
        team: opponent,
        gamesSeen: 0,
        redSoxWins: 0,
        redSoxLosses: 0,
      };
      team.gamesSeen++;
      if (won) team.redSoxWins++;
      else team.redSoxLosses++;
      teamMap.set(opponent, team);
    }

    for (const scorer of game.scorers) {
      const existing = scorerMap.get(scorer) ?? { name: scorer, gamesSeen: 0 };
      existing.gamesSeen++;
      scorerMap.set(scorer, existing);
    }

    const mlbData = getMlb(game);
    if (!mlbData) continue;

    for (const side of [mlbData.boxscore.away, mlbData.boxscore.home]) {
      for (const batter of side.batters) {
        const stats = batter.stats as Record<string, unknown>;
        const existing = playerMap.get(batter.name) ?? {
          name: batter.name,
          team: side.teamName,
          gamesSeen: 0,
          homeRuns: 0,
          strikeOuts: 0,
        };
        existing.team = side.teamName;
        existing.gamesSeen++;
        existing.homeRuns += num(stats.homeRuns);
        existing.strikeOuts += num(stats.strikeOuts);
        playerMap.set(batter.name, existing);
      }

      for (const pitcher of side.pitchers) {
        const stats = pitcher.stats as Record<string, unknown>;
        const existing = pitcherMap.get(pitcher.name) ?? {
          name: pitcher.name,
          team: side.teamName,
          gamesSeen: 0,
          wins: 0,
          losses: 0,
          strikeOuts: 0,
        };
        existing.team = side.teamName;
        existing.gamesSeen++;
        existing.wins += num(stats.wins);
        existing.losses += num(stats.losses);
        existing.strikeOuts += num(stats.strikeOuts);
        pitcherMap.set(pitcher.name, existing);
      }
    }
  }

  const teams = [...teamMap.values()].sort((a, b) => b.gamesSeen - a.gamesSeen);
  const players = [...playerMap.values()];
  const pitchers = [...pitcherMap.values()];

  return {
    totalGames: games.length,
    firstDate: sorted[0]?.date ?? "",
    lastDate: sorted[sorted.length - 1]?.date ?? "",
    redSoxRecord: { wins: redSoxWins, losses: redSoxLosses },
    teams,
    mostSeenPlayers: [...players]
      .sort((a, b) => b.gamesSeen - a.gamesSeen || b.homeRuns - a.homeRuns)
      .slice(0, TOP_N),
    homeRunLeaders: [...players]
      .filter((p) => p.homeRuns > 0)
      .sort((a, b) => b.homeRuns - a.homeRuns || b.gamesSeen - a.gamesSeen)
      .slice(0, TOP_N),
    mostSeenPitchers: [...pitchers]
      .sort((a, b) => b.gamesSeen - a.gamesSeen || b.strikeOuts - a.strikeOuts)
      .slice(0, TOP_N),
    strikeoutPitchers: [...pitchers]
      .filter((p) => p.strikeOuts > 0)
      .sort((a, b) => b.strikeOuts - a.strikeOuts)
      .slice(0, TOP_N),
    strikeoutBatters: [...players]
      .filter((p) => p.strikeOuts > 0)
      .sort((a, b) => b.strikeOuts - a.strikeOuts)
      .slice(0, TOP_N),
    scorers: [...scorerMap.values()].sort((a, b) => b.gamesSeen - a.gamesSeen),
  };
}
