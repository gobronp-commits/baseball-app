import Link from "next/link";
import { getRecentActivity } from "@/lib/activity";
import { getGameById } from "@/lib/games";

// Data changes are logged straight into SQLite by offline scripts
// (scripts/build-games-manifest.mjs), outside of Next's request/cache
// lifecycle, so this page can't rely on on-demand revalidation to stay
// fresh - it has to read the DB on every request.
export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  comment: "Comment",
  game_added: "Game Added",
  game_updated: "Game Updated",
  game_removed: "Game Removed",
};

function formatTimestamp(sqliteUtc: string) {
  return new Date(`${sqliteUtc.replace(" ", "T")}Z`).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ActivityPage() {
  const entries = getRecentActivity();

  return (
    <div>
      <h1 className="font-heading text-2xl uppercase tracking-wide">
        Activity Log
      </h1>
      <p className="text-sm text-black/60 dark:text-white/60 mt-1">
        Comments, new scorecards, and corrections across the archive.
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50 mt-8">
          Nothing here yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {entries.map((e) => {
            const game = e.gameId ? getGameById(e.gameId) : undefined;
            const content = (
              <>
                <span className="inline-block text-[10px] uppercase tracking-wide font-semibold text-[var(--accent)] mr-2 align-middle">
                  {TYPE_LABELS[e.type] ?? e.type}
                </span>
                <span className="text-sm align-middle">{e.summary}</span>
              </>
            );
            return (
              <li
                key={e.id}
                className="pl-3 border-l-2 border-black/10 dark:border-white/10"
              >
                <div className="text-xs text-black/40 dark:text-white/40">
                  {formatTimestamp(e.createdAt)}
                </div>
                {game ? (
                  <Link
                    href={`/games/${game.id}`}
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  <div>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
