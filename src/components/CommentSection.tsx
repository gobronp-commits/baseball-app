import { addCommentAction } from "@/app/games/[id]/actions";
import type { Comment } from "@/lib/comments";

function formatTimestamp(sqliteUtc: string) {
  return new Date(`${sqliteUtc.replace(" ", "T")}Z`).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CommentSection({
  gameId,
  comments,
}: {
  gameId: string;
  comments: Comment[];
}) {
  const action = addCommentAction.bind(null, gameId);

  return (
    <section className="mt-10">
      <h2 className="font-heading text-sm uppercase tracking-wide text-[var(--accent)] mb-3 pb-1 border-b-2 border-[var(--accent)]/25">
        Comments{comments.length > 0 && ` (${comments.length})`}
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50 mb-6">
          No comments yet.
        </p>
      ) : (
        <ul className="space-y-4 mb-6">
          {comments.map((c) => (
            <li
              key={c.id}
              className="pl-3 border-l-2 border-black/10 dark:border-white/10"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{c.author}</span>
                <span className="text-xs text-black/40 dark:text-white/40">
                  {formatTimestamp(c.createdAt)}
                </span>
              </div>
              {c.body && (
                <p className="text-sm text-black/80 dark:text-white/80 mt-0.5 whitespace-pre-wrap">
                  {c.body}
                </p>
              )}
              {c.photoPath && (
                <a href={c.photoPath} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.photoPath}
                    alt=""
                    className="mt-2 max-w-full sm:max-w-xs rounded border border-black/10 dark:border-white/10"
                  />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        action={action}
        encType="multipart/form-data"
        className="space-y-2 max-w-md"
      >
        <input
          type="text"
          name="author"
          placeholder="Your name"
          required
          maxLength={60}
          className="w-full rounded border border-black/15 dark:border-white/15 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
        <textarea
          name="body"
          placeholder="Add a comment..."
          maxLength={2000}
          rows={3}
          className="w-full rounded border border-black/15 dark:border-white/15 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="w-full text-sm text-black/60 dark:text-white/60 file:mr-3 file:rounded file:border-0 file:bg-black/5 dark:file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-black/80 dark:file:text-white/80 hover:file:bg-black/10 dark:hover:file:bg-white/20"
        />
        <button
          type="submit"
          className="rounded bg-[var(--accent)] text-white text-sm px-4 py-1.5 hover:opacity-90 transition-opacity"
        >
          Post Comment
        </button>
      </form>
    </section>
  );
}
