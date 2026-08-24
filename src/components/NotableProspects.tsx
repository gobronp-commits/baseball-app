import Link from "next/link";
import TeamLogo from "./TeamLogo";
import type { NotableProspect } from "@/lib/games";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NotableProspects({ prospects }: { prospects: NotableProspect[] }) {
  return (
    <div>
      <h3 className="font-heading text-sm uppercase tracking-wide text-[var(--accent)] mb-3 pb-1 border-b-2 border-[var(--accent)]/25">
        Future MLB Players Seen in the Minors &amp; Cape League
      </h3>
      {prospects.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">Nothing yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {prospects.map((p) => (
            <div key={`${p.gameId}-${p.name}`} className="text-sm">
              <div className="flex items-center gap-1.5 font-semibold">
                <TeamLogo team={p.team} size={16} />
                <span>{p.name}</span>
              </div>
              <p className="text-black/60 dark:text-white/60 mt-0.5">{p.note}</p>
              <Link
                href={`/games/${p.gameId}`}
                className="text-xs text-black/40 dark:text-white/40 hover:underline underline-offset-2"
              >
                Seen {formatDate(p.gameDate)} · {p.gameLabel}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
