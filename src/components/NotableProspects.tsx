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

function ProspectGrid({
  prospects,
  linkPrefix,
}: {
  prospects: NotableProspect[];
  linkPrefix: string;
}) {
  return (
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
            {linkPrefix} {formatDate(p.gameDate)} · {p.gameLabel}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function NotableProspects({ prospects }: { prospects: NotableProspect[] }) {
  const seen = prospects.filter((p) => p.seenInGame);
  const notSeen = prospects.filter((p) => !p.seenInGame);

  return (
    <div>
      <h3 className="font-heading text-sm uppercase tracking-wide text-[var(--accent)] mb-3 pb-1 border-b-2 border-[var(--accent)]/25">
        Future MLB Players Seen in the Minors &amp; Cape League
      </h3>
      {prospects.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">Nothing yet.</p>
      ) : (
        <>
          <ProspectGrid prospects={seen} linkPrefix="Seen" />
          {notSeen.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50 mb-3">
                On the Roster, But Not in This Game
              </h4>
              <ProspectGrid prospects={notSeen} linkPrefix="Team's game:" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
