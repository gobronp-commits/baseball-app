import type { Play } from "@/lib/types";

function groupPlays(plays: Play[]) {
  const groups: { key: string; inning: number; half: string; plays: Play[] }[] = [];
  for (const p of plays) {
    const key = `${p.inning}-${p.half}`;
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, inning: p.inning, half: p.half, plays: [] };
      groups.push(group);
    }
    group.plays.push(p);
  }
  return groups;
}

export default function PlayByPlay({ plays }: { plays: Play[] }) {
  const groups = groupPlays(plays);
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.key}>
          <h4 className="text-sm font-semibold mb-2">
            {g.half === "top" ? "Top" : "Bottom"} {g.inning}
          </h4>
          <ul className="space-y-1.5">
            {g.plays.map((p, idx) => (
              <li
                key={idx}
                className={
                  "text-sm pl-3 border-l-2 " +
                  (p.isScoringPlay
                    ? "border-amber-500 font-medium"
                    : "border-black/10 dark:border-white/10 text-black/70 dark:text-white/70")
                }
              >
                {p.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
