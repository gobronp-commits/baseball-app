import type { Game, MlbGameData } from "./types";
import { displayScore } from "./score";

const YOUR_TEAM = "Boston Red Sox";
const TOP_N = 10;

export type TeamRecord = {
  team: string;
  gamesSeen: number;
  // Only meaningful when this team actually played the Red Sox at least
  // once - redSoxWins + redSoxLosses === 0 means no such record exists
  // (e.g. non-Red-Sox games like the All-Star Game or minor/independent
  // league games), not that the record is literally 0-0 (impossible in
  // baseball - there are no ties).
  redSoxWins: number;
  redSoxLosses: number;
};

export type PlayerStat = {
  name: string;
  team: string;
  gamesSeen: number;
  homeRuns: number;
  strikeOuts: number;
  hits: number;
  rbi: number;
  stolenBases: number;
};

export type ErrorStat = {
  name: string;
  team: string;
  gamesSeen: number;
  errors: number;
};

export type PitcherStat = {
  name: string;
  team: string;
  gamesSeen: number;
  wins: number;
  losses: number;
  strikeOuts: number;
  outs: number;
  earnedRuns: number;
};

export type EraStat = {
  name: string;
  team: string;
  gamesSeen: number;
  era: number;
  outs: number;
};

export type ScorerStat = {
  name: string;
  gamesSeen: number;
};

export type HomeTeamRecord = {
  team: string;
  venue: string;
  gamesSeen: number;
  wins: number;
  losses: number;
};

export type Summary = {
  totalGames: number;
  firstDate: string;
  lastDate: string;
  redSoxRecord: { wins: number; losses: number };
  totalRedSoxOpponents: number;
  homeTeams: HomeTeamRecord[];
  teams: TeamRecord[];
  mostSeenPlayers: PlayerStat[];
  homeRunLeaders: PlayerStat[];
  hitLeaders: PlayerStat[];
  rbiLeaders: PlayerStat[];
  stolenBaseLeaders: PlayerStat[];
  mostSeenPitchers: PitcherStat[];
  strikeoutPitchers: PitcherStat[];
  strikeoutBatters: PlayerStat[];
  eraLeaders: EraStat[];
  errorLeaders: ErrorStat[];
  scorers: ScorerStat[];
};

function num(v: unknown): number {
  return typeof v === "number" ? v : 0;
}

// Baseball innings notation: .1 and .2 mean one/two thirds of an inning,
// not tenths - e.g. 19 outs is "6.1" innings, not "6.3".
export function formatInnings(outs: number): string {
  return `${Math.floor(outs / 3)}.${outs % 3}`;
}

export function computeSummary(
  games: Game[],
  getMlb: (game: Game) => MlbGameData | null
): Summary {
  const teamMap = new Map<string, TeamRecord>();
  const homeTeamMap = new Map<string, HomeTeamRecord>();
  const playerMap = new Map<string, PlayerStat>();
  const pitcherMap = new Map<string, PitcherStat>();
  const errorMap = new Map<string, ErrorStat>();
  const scorerMap = new Map<string, ScorerStat>();

  let redSoxWins = 0;
  let redSoxLosses = 0;

  const sorted = [...games].sort((a, b) => a.date.localeCompare(b.date));

  for (const game of sorted) {
    const redSoxSide: "home" | "away" | null =
      game.homeTeam === YOUR_TEAM ? "home" : game.awayTeam === YOUR_TEAM ? "away" : null;

    const score = displayScore(game);
    let won = false;
    if (redSoxSide) {
      const redSoxScore = redSoxSide === "home" ? score.home : score.away;
      const oppScore = redSoxSide === "home" ? score.away : score.home;
      won = redSoxScore > oppScore;
      if (won) redSoxWins++;
      else redSoxLosses++;
    }

    const homeRecord = homeTeamMap.get(game.homeTeam) ?? {
      team: game.homeTeam,
      venue: game.location,
      gamesSeen: 0,
      wins: 0,
      losses: 0,
    };
    homeRecord.gamesSeen++;
    if (score.home > score.away) homeRecord.wins++;
    else homeRecord.losses++;
    homeTeamMap.set(game.homeTeam, homeRecord);

    // Every non-Red-Sox team that appears in this game gets logged as
    // "seen" - for a Red Sox game that's just the opponent; for a game
    // the Red Sox aren't part of (All-Star Game, minor/independent
    // league games) it's both teams.
    const teamsInGame = [game.awayTeam, game.homeTeam].filter((t) => t !== YOUR_TEAM);
    for (const teamName of teamsInGame) {
      const team = teamMap.get(teamName) ?? {
        team: teamName,
        gamesSeen: 0,
        redSoxWins: 0,
        redSoxLosses: 0,
      };
      team.gamesSeen++;
      if (redSoxSide) {
        if (won) team.redSoxWins++;
        else team.redSoxLosses++;
      }
      teamMap.set(teamName, team);
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
          hits: 0,
          rbi: 0,
          stolenBases: 0,
        };
        existing.team = side.teamName;
        existing.gamesSeen++;
        existing.homeRuns += num(stats.homeRuns);
        existing.strikeOuts += num(stats.strikeOuts);
        existing.hits += num(stats.hits);
        existing.rbi += num(stats.rbi);
        existing.stolenBases += num(stats.stolenBases);
        playerMap.set(batter.name, existing);

        const errRecord = errorMap.get(batter.name) ?? {
          name: batter.name,
          team: side.teamName,
          gamesSeen: 0,
          errors: 0,
        };
        errRecord.team = side.teamName;
        errRecord.gamesSeen++;
        errRecord.errors += num(stats.errors);
        errorMap.set(batter.name, errRecord);
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
          outs: 0,
          earnedRuns: 0,
        };
        existing.team = side.teamName;
        existing.gamesSeen++;
        existing.wins += num(stats.wins);
        existing.losses += num(stats.losses);
        existing.strikeOuts += num(stats.strikeOuts);
        existing.outs += num(stats.outs);
        existing.earnedRuns += num(stats.earnedRuns);
        pitcherMap.set(pitcher.name, existing);

        const errRecord = errorMap.get(pitcher.name) ?? {
          name: pitcher.name,
          team: side.teamName,
          gamesSeen: 0,
          errors: 0,
        };
        errRecord.team = side.teamName;
        errRecord.gamesSeen++;
        errRecord.errors += num(stats.errors);
        errorMap.set(pitcher.name, errRecord);
      }
    }
  }

  const allTeams = [...teamMap.values()].sort((a, b) => b.gamesSeen - a.gamesSeen);
  const players = [...playerMap.values()];
  const pitchers = [...pitcherMap.values()];

  return {
    totalGames: games.length,
    firstDate: sorted[0]?.date ?? "",
    lastDate: sorted[sorted.length - 1]?.date ?? "",
    redSoxRecord: { wins: redSoxWins, losses: redSoxLosses },
    totalRedSoxOpponents: allTeams.filter((t) => t.redSoxWins + t.redSoxLosses > 0).length,
    homeTeams: [...homeTeamMap.values()]
      .sort((a, b) => b.gamesSeen - a.gamesSeen)
      .slice(0, TOP_N),
    teams: allTeams,
    mostSeenPlayers: [...players]
      .sort((a, b) => b.gamesSeen - a.gamesSeen || b.homeRuns - a.homeRuns)
      .slice(0, TOP_N),
    homeRunLeaders: [...players]
      .filter((p) => p.homeRuns > 0)
      .sort((a, b) => b.homeRuns - a.homeRuns || b.gamesSeen - a.gamesSeen)
      .slice(0, TOP_N),
    hitLeaders: [...players]
      .filter((p) => p.hits > 0)
      .sort((a, b) => b.hits - a.hits || b.gamesSeen - a.gamesSeen)
      .slice(0, TOP_N),
    rbiLeaders: [...players]
      .filter((p) => p.rbi > 0)
      .sort((a, b) => b.rbi - a.rbi || b.gamesSeen - a.gamesSeen)
      .slice(0, TOP_N),
    stolenBaseLeaders: [...players]
      .filter((p) => p.stolenBases > 0)
      .sort((a, b) => b.stolenBases - a.stolenBases || b.gamesSeen - a.gamesSeen)
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
    eraLeaders: pitchers
      .filter((p) => p.outs >= 27) // 9+ innings pitched
      .map((p) => ({
        name: p.name,
        team: p.team,
        gamesSeen: p.gamesSeen,
        era: (p.earnedRuns * 27) / p.outs,
        outs: p.outs,
      }))
      .sort((a, b) => b.era - a.era)
      .slice(0, TOP_N),
    errorLeaders: [...errorMap.values()]
      .filter((p) => p.errors > 0)
      .sort((a, b) => b.errors - a.errors || b.gamesSeen - a.gamesSeen)
      .slice(0, TOP_N),
    scorers: [...scorerMap.values()]
      .sort((a, b) => b.gamesSeen - a.gamesSeen)
      .slice(0, TOP_N),
  };
}
