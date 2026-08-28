// Shared SQLite helper for scripts that need to log activity-log entries
// (e.g. build-games-manifest.mjs noting a new or corrected scorecard).
// Schema is duplicated from src/lib/db.ts since plain node scripts can't
// import the app's TS path-aliased modules directly.
import Database from "better-sqlite3";
import path from "path";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_comments_game_id ON comments(game_id);

  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    game_id TEXT,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export function openActivityDb(root) {
  const db = new Database(path.join(root, "data", "app.db"));
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  return db;
}

export function logActivity(db, type, summary, gameId = null) {
  db.prepare(
    "INSERT INTO activity (type, game_id, summary) VALUES (?, ?, ?)"
  ).run(type, gameId, summary);
}
