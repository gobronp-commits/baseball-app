// Resolves each game in data/games.json to its official MLB gamePk (via the
// public MLB Stats API schedule endpoint, matched by date + team ids), then
// fetches and condenses the box score / line score / play-by-play into
// data/mlb/<gamePk>.json. Full pitch-level detail is dropped to keep the
// per-game file small (~50-150KB) - only what a readable game log needs.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const API = "https://statsapi.mlb.com/api";

const teams = JSON.parse(readFileSync(path.join(root, "data/teams.json"), "utf8"));

const ALIASES = {
  "oakland athletics": "Athletics",
  "athletics": "Athletics",
  "cleveland guardians": "Cleveland Guardians",
};

function findTeamId(name) {
  const key = name.trim().toLowerCase();
  const aliased = ALIASES[key];
  const target = aliased ?? name;
  const match = teams.find((t) => t.name.toLowerCase() === target.toLowerCase());
  if (!match) throw new Error(`No MLB team id found for "${name}"`);
  return match.id;
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function resolveGamePk(game) {
  const awayId = findTeamId(game.awayTeam);
  const homeId = findTeamId(game.homeTeam);
  const url = `${API}/v1/schedule?sportId=1&date=${game.date}&teamId=${awayId}`;
  const data = await getJSON(url);
  const allGames = (data.dates ?? []).flatMap((d) => d.games ?? []);
  const matches = allGames.filter(
    (g) => g.teams.away.team.id === awayId && g.teams.home.team.id === homeId
  );
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    // Doubleheader: disambiguate using the score tallied on the scorecard
    // rather than assuming gameNumber 1, since either game could be "the"
    // one that was scored by hand.
    const scoreMatch = matches.find(
      (g) =>
        g.teams.away.score === game.scorecardAwayScore &&
        g.teams.home.score === game.scorecardHomeScore
    );
    if (scoreMatch) return scoreMatch.gamePk;
    console.warn(
      `  ${matches.length} matches for ${game.id}, none matched scorecard score ${game.scorecardAwayScore}-${game.scorecardHomeScore} - using gameNumber 1`
    );
    matches.sort((a, b) => a.gameNumber - b.gameNumber);
  }
  return matches[0].gamePk;
}

function condensePlays(allPlays) {
  return (allPlays ?? []).map((p) => ({
    inning: p.about.inning,
    half: p.about.halfInning,
    batter: p.matchup?.batter?.fullName,
    pitcher: p.matchup?.pitcher?.fullName,
    event: p.result?.event,
    description: p.result?.description,
    rbi: p.result?.rbi,
    awayScore: p.result?.awayScore,
    homeScore: p.result?.homeScore,
    isScoringPlay: !!p.about?.isScoringPlay,
  }));
}

function condenseBoxscoreTeam(team) {
  const players = Object.values(team.players ?? {});
  const batters = players
    .filter((p) => (p.stats?.batting?.atBats ?? p.stats?.batting?.plateAppearances) != null && p.position?.abbreviation !== "P")
    .map((p) => ({
      name: p.person.fullName,
      position: p.position?.abbreviation,
      battingOrder: p.battingOrder ?? null,
      stats: p.stats.batting,
    }));
  const pitchers = (team.pitchers ?? [])
    .map((id) => team.players[`ID${id}`])
    .filter(Boolean)
    .map((p) => ({
      name: p.person.fullName,
      stats: p.stats.pitching,
    }));
  return {
    teamName: team.team.name,
    teamStats: team.teamStats,
    batters,
    pitchers,
    note: (team.note ?? []).map((n) => n.label + (n.value ? `: ${n.value}` : "")),
  };
}

async function fetchAndCondense(gamePk) {
  const feed = await getJSON(`${API}/v1.1/game/${gamePk}/feed/live`);
  const { gameData, liveData } = feed;
  return {
    gamePk,
    date: gameData.datetime?.officialDate,
    venue: gameData.venue?.name,
    weather: gameData.weather,
    officials: (gameData.officials ?? []).map((o) => `${o.official?.fullName} (${o.officialType})`),
    probablePitchers: {
      away: gameData.probablePitchers?.away?.fullName ?? null,
      home: gameData.probablePitchers?.home?.fullName ?? null,
    },
    decisions: liveData.decisions
      ? {
          winner: liveData.decisions.winner?.fullName ?? null,
          loser: liveData.decisions.loser?.fullName ?? null,
          save: liveData.decisions.save?.fullName ?? null,
        }
      : null,
    linescore: {
      innings: liveData.linescore.innings.map((i) => ({
        num: i.num,
        away: i.away?.runs ?? null,
        home: i.home?.runs ?? null,
      })),
      totals: {
        away: liveData.linescore.teams.away,
        home: liveData.linescore.teams.home,
      },
    },
    boxscore: {
      away: condenseBoxscoreTeam(liveData.boxscore.teams.away),
      home: condenseBoxscoreTeam(liveData.boxscore.teams.home),
    },
    plays: condensePlays(liveData.plays.allPlays),
  };
}

async function main() {
  const gamesPath = path.join(root, "data/games.json");
  const games = JSON.parse(readFileSync(gamesPath, "utf8"));
  mkdirSync(path.join(root, "data/mlb"), { recursive: true });

  const unresolved = [];
  for (const game of games) {
    process.stdout.write(`${game.id} ... `);
    try {
      const gamePk = game.gamePk ?? (await resolveGamePk(game));
      if (!gamePk) {
        console.log("NOT FOUND");
        unresolved.push(game.id);
        continue;
      }
      game.gamePk = gamePk;
      const outFile = path.join(root, "data/mlb", `${gamePk}.json`);
      let condensed;
      if (existsSync(outFile)) {
        condensed = JSON.parse(readFileSync(outFile, "utf8"));
      } else {
        condensed = await fetchAndCondense(gamePk);
        writeFileSync(outFile, JSON.stringify(condensed, null, 2));
      }
      game.officialAwayScore = condensed.linescore.totals.away.runs;
      game.officialHomeScore = condensed.linescore.totals.home.runs;
      console.log(`gamePk ${gamePk}`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      unresolved.push(game.id);
    }
    // Be polite to the public API.
    await new Promise((r) => setTimeout(r, 250));
  }

  writeFileSync(gamesPath, JSON.stringify(games, null, 2));

  if (unresolved.length) {
    console.log(`\n${unresolved.length} game(s) need manual review:`);
    for (const id of unresolved) console.log(`  - ${id}`);
  } else {
    console.log(`\nAll ${games.length} games resolved.`);
  }
}

main();
