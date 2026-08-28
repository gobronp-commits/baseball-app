import { getDb } from "./db";

export type Comment = {
  id: number;
  author: string;
  body: string;
  photoPath: string | null;
  createdAt: string;
};

export function getCommentsForGame(gameId: string): Comment[] {
  return getDb()
    .prepare(
      "SELECT id, author, body, photo_path as photoPath, created_at as createdAt FROM comments WHERE game_id = ? ORDER BY created_at ASC, id ASC"
    )
    .all(gameId) as Comment[];
}

export function addComment(
  gameId: string,
  author: string,
  body: string,
  photoPath: string | null,
  gameLabel: string
) {
  const db = getDb();
  const insertComment = db.prepare(
    "INSERT INTO comments (game_id, author, body, photo_path) VALUES (?, ?, ?, ?)"
  );
  const insertActivity = db.prepare(
    "INSERT INTO activity (type, game_id, summary) VALUES ('comment', ?, ?)"
  );
  const summary = photoPath
    ? `${author} commented on ${gameLabel} (with a photo)`
    : `${author} commented on ${gameLabel}`;
  db.transaction(() => {
    insertComment.run(gameId, author, body, photoPath);
    insertActivity.run(gameId, summary);
  })();
}
