import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "app.db");

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

declare global {
  var __appDb: Database.Database | undefined;
}

function migrate(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(comments)").all() as {
    name: string;
  }[];
  if (!columns.some((c) => c.name === "photo_path")) {
    db.exec("ALTER TABLE comments ADD COLUMN photo_path TEXT");
  }
}

function createDb() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

// Cached on globalThis so dev-mode hot reloads reuse the same connection
// instead of re-opening the file on every module re-evaluation.
export function getDb() {
  if (!globalThis.__appDb) {
    globalThis.__appDb = createDb();
  }
  return globalThis.__appDb;
}
