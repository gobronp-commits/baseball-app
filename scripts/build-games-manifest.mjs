// Merges the per-image extraction JSON (data-raw/<year>-extracted.json) into
// a single per-game manifest (data/games.json) that the app and the MLB
// ingestion script both read. Re-run whenever data-raw files change.
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { openActivityDb, logActivity } from "./activity-db.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const gamesPath = path.join(root, "data", "games.json");
const previousGames = existsSync(gamesPath)
  ? JSON.parse(readFileSync(gamesPath, "utf8"))
  : [];
const years = [
  "1998",
  "1999",
  "2001",
  "2003",
  "2004",
  "2007",
  "2008",
  "2009",
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2021",
  "2024",
  "2025",
];

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function fieldChanges(oldG, newG) {
  const parts = [];
  if (oldG.location !== newG.location) {
    parts.push(`location changed to ${newG.location}`);
  }
  if (
    oldG.scorecardAwayScore !== newG.scorecardAwayScore ||
    oldG.scorecardHomeScore !== newG.scorecardHomeScore
  ) {
    parts.push(
      `scorecard tally changed to ${newG.scorecardAwayScore}-${newG.scorecardHomeScore}`
    );
  }
  if (oldG.scorecardImages.length !== newG.scorecardImages.length) {
    parts.push(
      `scorecard images ${oldG.scorecardImages.length} -> ${newG.scorecardImages.length}`
    );
  }
  if (JSON.stringify(oldG.notes) !== JSON.stringify(newG.notes)) {
    parts.push("notes updated");
  }
  if (JSON.stringify(oldG.scorers) !== JSON.stringify(newG.scorers)) {
    parts.push("scorers updated");
  }
  return parts;
}

// Diffs the manifest against its previous state and records what changed
// to the activity log. A date correction (this scorecard's id encodes its
// date) looks like a removed id + an added id, so we first try to match
// added/removed pairs by team + scorecard tally and log those as a single
// "corrected" update rather than a spurious add/remove.
function logGameChanges(previous, current) {
  const oldById = new Map(previous.map((g) => [g.id, g]));
  const newById = new Map(current.map((g) => [g.id, g]));
  const addedIds = [...newById.keys()].filter((id) => !oldById.has(id));
  const removedIds = new Set(
    [...oldById.keys()].filter((id) => !newById.has(id))
  );

  const db = openActivityDb(root);

  for (const id of addedIds) {
    const g = newById.get(id);
    const renamedFrom = [...removedIds]
      .map((rid) => oldById.get(rid))
      .find(
        (og) =>
          og.awayTeam === g.awayTeam &&
          og.homeTeam === g.homeTeam &&
          og.scorecardAwayScore === g.scorecardAwayScore &&
          og.scorecardHomeScore === g.scorecardHomeScore
      );

    if (renamedFrom) {
      removedIds.delete(renamedFrom.id);
      logActivity(
        db,
        "game_updated",
        `Corrected date for ${g.awayTeam} @ ${g.homeTeam} from ${renamedFrom.date} to ${g.date}`,
        g.id
      );
    } else {
      logActivity(
        db,
        "game_added",
        `Added scorecard: ${g.awayTeam} @ ${g.homeTeam} on ${g.date}`,
        g.id
      );
    }
  }

  for (const id of removedIds) {
    const og = oldById.get(id);
    logActivity(
      db,
      "game_removed",
      `Removed scorecard: ${og.awayTeam} @ ${og.homeTeam} on ${og.date}`
    );
  }

  for (const [id, g] of newById) {
    const og = oldById.get(id);
    if (!og) continue;
    const changes = fieldChanges(og, g);
    if (changes.length > 0) {
      logActivity(
        db,
        "game_updated",
        `${g.awayTeam} @ ${g.homeTeam} (${g.date}): ${changes.join(", ")}`,
        g.id
      );
    }
  }

  db.close();
}

const games = new Map(); // key: date|away|home -> game

for (const year of years) {
  const file = path.join(root, "data-raw", `${year}-extracted.json`);
  if (!existsSync(file)) {
    console.warn(`skip ${year}: ${file} not found`);
    continue;
  }
  const records = JSON.parse(readFileSync(file, "utf8"));
  for (const r of records) {
    const key = `${r.date}|${r.awayTeam}|${r.homeTeam}`;
    if (!games.has(key)) {
      games.set(key, {
        id: `${r.date}-${slug(r.awayTeam)}-at-${slug(r.homeTeam)}`,
        date: r.date,
        awayTeam: r.awayTeam,
        homeTeam: r.homeTeam,
        location: r.location,
        // As tallied by hand on the scorecard. May occasionally differ from
        // the official MLB record (data/mlb/<gamePk>.json) due to a scoring
        // slip - officialAwayScore/officialHomeScore (added by
        // fetch-mlb-data.mjs) is the source of truth for display/sorting.
        scorecardAwayScore: r.awayScore,
        scorecardHomeScore: r.homeScore,
        officialAwayScore: null,
        officialHomeScore: null,
        scorecardImages: [],
        scorers: [],
        notes: [],
        gamePk: null,
      });
    }
    const g = games.get(key);
    const side = r.lineupTeam === r.awayTeam ? "away" : "home";
    g.scorecardImages.push({
      side,
      team: r.lineupTeam,
      src: `/scorecards/${year}/${r.file}`,
    });
    if (r.notes) g.notes.push(r.notes);
  }
}

for (const year of years) {
  const file = path.join(root, "data-raw", `${year}-scorers.json`);
  if (!existsSync(file)) {
    console.warn(`skip ${year} scorers: ${file} not found`);
    continue;
  }
  const records = JSON.parse(readFileSync(file, "utf8"));
  for (const r of records) {
    const key = `${r.date}|${r.awayTeam}|${r.homeTeam}`;
    const g = games.get(key);
    if (!g) {
      console.warn(`scorer record has no matching game: ${key}`);
      continue;
    }
    g.scorers = (r.scorerRaw ?? "")
      .split(",")
      .map((s) => s.trim())
      // A bare "Laura" and "Laura 2" elsewhere always refer to the same
      // person, displayed as "Laura" - "Laura 1" is someone else who
      // shares the name.
      .map((s) => (s === "Laura 2" ? "Laura" : s))
      .filter(Boolean);
  }
}

// Sort each game's images away-then-home, and sort games by date ascending.
const list = [...games.values()]
  .map((g) => ({
    ...g,
    scorecardImages: g.scorecardImages.sort((a, b) =>
      a.side === b.side ? 0 : a.side === "away" ? -1 : 1
    ),
    notes: [...new Set(g.notes)],
  }))
  .sort((a, b) => a.date.localeCompare(b.date));

logGameChanges(previousGames, list);

writeFileSync(gamesPath, JSON.stringify(list, null, 2));

console.log(`wrote ${list.length} games to data/games.json`);
for (const g of list) {
  if (g.scorecardImages.length !== 2) {
    console.log(
      `  note: ${g.id} has ${g.scorecardImages.length} scorecard image(s)`
    );
  }
  if (g.scorers.length === 0) {
    console.log(`  note: ${g.id} has no scorers recorded`);
  }
}
