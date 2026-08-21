// Merges the per-image extraction JSON (data-raw/<year>-extracted.json) into
// a single per-game manifest (data/games.json) that the app and the MLB
// ingestion script both read. Re-run whenever data-raw files change.
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const years = ["2024", "2025"];

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
      // A bare "Laura" always refers to the same person as "Laura 2"
      // elsewhere - "Laura 1" is someone else who shares the name.
      .map((s) => (s === "Laura" ? "Laura 2" : s))
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

writeFileSync(
  path.join(root, "data", "games.json"),
  JSON.stringify(list, null, 2)
);

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
