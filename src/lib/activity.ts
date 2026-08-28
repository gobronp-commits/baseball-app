import { getDb } from "./db";

export type ActivityEntry = {
  id: number;
  type: string;
  gameId: string | null;
  summary: string;
  createdAt: string;
};

export function getRecentActivity(limit = 200): ActivityEntry[] {
  return getDb()
    .prepare(
      "SELECT id, type, game_id as gameId, summary, created_at as createdAt FROM activity ORDER BY created_at DESC, id DESC LIMIT ?"
    )
    .all(limit) as ActivityEntry[];
}
