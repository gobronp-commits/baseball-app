import { getDb } from "./db";

export type Comment = {
  id: number;
  author: string;
  body: string;
  createdAt: string;
};

export function getCommentsForGame(gameId: string): Comment[] {
  return getDb()
    .prepare(
      "SELECT id, author, body, created_at as createdAt FROM comments WHERE game_id = ? ORDER BY created_at ASC, id ASC"
    )
    .all(gameId) as Comment[];
}

export function addComment(
  gameId: string,
  author: string,
  body: string,
  gameLabel: string
) {
  const db = getDb();
  const insertComment = db.prepare(
    "INSERT INTO comments (game_id, author, body) VALUES (?, ?, ?)"
  );
  const insertActivity = db.prepare(
    "INSERT INTO activity (type, game_id, summary) VALUES ('comment', ?, ?)"
  );
  db.transaction(() => {
    insertComment.run(gameId, author, body);
    insertActivity.run(gameId, `${author} commented on ${gameLabel}`);
  })();
}
