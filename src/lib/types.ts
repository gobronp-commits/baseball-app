export type ScorecardImage = {
  side: "away" | "home";
  team: string;
  src: string;
};

export type Game = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  awayTeam: string;
  homeTeam: string;
  location: string;
  scorecardAwayScore: number;
  scorecardHomeScore: number;
  officialAwayScore: number | null;
  officialHomeScore: number | null;
  scorecardImages: ScorecardImage[];
  scorers: string[];
  notes: string[];
  gamePk: number | null;
};

export type BattingLine = {
  name: string;
  position?: string;
  battingOrder: string | null;
  stats: Record<string, unknown>;
};

export type PitchingLine = {
  name: string;
  stats: Record<string, unknown>;
};

export type BoxscoreTeam = {
  teamName: string;
  teamStats: unknown;
  batters: BattingLine[];
  pitchers: PitchingLine[];
  note: string[];
};

export type Play = {
  inning: number;
  half: "top" | "bottom";
  batter?: string;
  pitcher?: string;
  event?: string;
  description?: string;
  rbi?: number;
  awayScore?: number;
  homeScore?: number;
  isScoringPlay: boolean;
};

export type MlbGameData = {
  gamePk: number;
  date: string;
  venue: string;
  weather: unknown;
  officials: string[];
  probablePitchers: { away: string | null; home: string | null };
  decisions: { winner: string | null; loser: string | null; save: string | null } | null;
  linescore: {
    innings: { num: number; away: number | null; home: number | null }[];
    totals: { away: unknown; home: unknown };
  };
  boxscore: { away: BoxscoreTeam; home: BoxscoreTeam };
  plays: Play[];
};
