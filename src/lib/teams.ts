import teamsData from "../../data/teams.json";

export type Team = {
  id: number;
  name: string;
  abbr: string;
  venue: string | null;
  logoExt?: string;
};

export const teams = teamsData as Team[];

// Handles team names/nicknames that have changed since 2024, plus common
// shorthand a scorekeeper might write, so lookups still resolve to the
// current MLB team id (schedule/boxscore data is keyed by id, not name).
const ALIASES: Record<string, string> = {
  "oakland athletics": "Athletics",
  "athletics": "Athletics",
  "a's": "Athletics",
  "cleveland guardians": "Cleveland Guardians",
  "d-backs": "Arizona Diamondbacks",
  "diamondbacks": "Arizona Diamondbacks",
  "rays": "Tampa Bay Rays",
  "red sox": "Boston Red Sox",
  "blue jays": "Toronto Blue Jays",
  "jays": "Toronto Blue Jays",
  "white sox": "Chicago White Sox",
  "cubs": "Chicago Cubs",
  "yankees": "New York Yankees",
  "mets": "New York Mets",
  "guardians": "Cleveland Guardians",
};

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findTeamByName(name: string): Team | undefined {
  const key = normalize(name);
  const aliased = ALIASES[key];
  if (aliased) {
    const match = teams.find((t) => t.name === aliased);
    if (match) return match;
  }
  return teams.find((t) => normalize(t.name) === key || normalize(t.abbr) === key);
}

export function getTeamById(id: number): Team | undefined {
  return teams.find((t) => t.id === id);
}
