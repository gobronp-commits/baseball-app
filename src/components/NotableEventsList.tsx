import Link from "next/link";
import TeamLogo from "./TeamLogo";
import type { NotableEvent } from "@/lib/games";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NotableEventsList({ events }: { events: NotableEvent[] }) {
  return (
    <div>
      <h3 className="font-heading text-sm uppercase tracking-wide text-[var(--accent)] mb-3 pb-1 border-b-2 border-[var(--accent)]/25">
        Notable Events
      </h3>
      {events.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">Nothing yet.</p>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <Link
              key={e.gameId + e.description}
              href={`/games/${e.gameId}`}
              className="block rounded-lg border border-black/10 dark:border-white/15 p-4 hover:border-[var(--accent)]/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50 mb-1.5">
                <span className="inline-block rounded-full bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 font-semibold uppercase tracking-wide">
                  {e.category}
                </span>
                <span>{formatDate(e.gameDate)}</span>
                <span>·</span>
                <TeamLogo team={e.gameLabel.split(" @ ")[1]} size={14} />
                <span>{e.gameLabel}</span>
              </div>
              <p className="text-sm">{e.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
