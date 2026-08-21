import type { BoxscoreTeam } from "@/lib/types";

function s(stats: Record<string, unknown>, key: string): string {
  const v = stats?.[key];
  if (v === undefined || v === null || v === "") return "-";
  return String(v);
}

function TeamBox({ team }: { team: BoxscoreTeam }) {
  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-2">{team.teamName}</h3>

      <div className="overflow-x-auto mb-3">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="text-black/50 dark:text-white/50 border-b border-black/10 dark:border-white/10">
              <th className="text-left font-normal py-1 pr-2">Batting</th>
              <th className="text-left font-normal px-1">Pos</th>
              <th className="w-8 text-center font-normal">AB</th>
              <th className="w-8 text-center font-normal">R</th>
              <th className="w-8 text-center font-normal">H</th>
              <th className="w-8 text-center font-normal">RBI</th>
              <th className="w-8 text-center font-normal">BB</th>
              <th className="w-8 text-center font-normal">SO</th>
              <th className="w-10 text-center font-normal">AVG</th>
            </tr>
          </thead>
          <tbody>
            {team.batters.map((b, idx) => (
              <tr key={idx} className="border-b border-black/5 dark:border-white/5">
                <td className="py-1 pr-2">{b.name}</td>
                <td className="px-1 text-black/60 dark:text-white/60">{b.position}</td>
                <td className="text-center tabular-nums">{s(b.stats, "atBats")}</td>
                <td className="text-center tabular-nums">{s(b.stats, "runs")}</td>
                <td className="text-center tabular-nums">{s(b.stats, "hits")}</td>
                <td className="text-center tabular-nums">{s(b.stats, "rbi")}</td>
                <td className="text-center tabular-nums">{s(b.stats, "baseOnBalls")}</td>
                <td className="text-center tabular-nums">{s(b.stats, "strikeOuts")}</td>
                <td className="text-center tabular-nums">{s(b.stats, "avg")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="text-black/50 dark:text-white/50 border-b border-black/10 dark:border-white/10">
              <th className="text-left font-normal py-1 pr-2">Pitching</th>
              <th className="w-10 text-center font-normal">IP</th>
              <th className="w-8 text-center font-normal">H</th>
              <th className="w-8 text-center font-normal">R</th>
              <th className="w-8 text-center font-normal">ER</th>
              <th className="w-8 text-center font-normal">BB</th>
              <th className="w-8 text-center font-normal">SO</th>
              <th className="w-10 text-center font-normal">ERA</th>
            </tr>
          </thead>
          <tbody>
            {team.pitchers.map((p, idx) => (
              <tr key={idx} className="border-b border-black/5 dark:border-white/5">
                <td className="py-1 pr-2">{p.name}</td>
                <td className="text-center tabular-nums">{s(p.stats, "inningsPitched")}</td>
                <td className="text-center tabular-nums">{s(p.stats, "hits")}</td>
                <td className="text-center tabular-nums">{s(p.stats, "runs")}</td>
                <td className="text-center tabular-nums">{s(p.stats, "earnedRuns")}</td>
                <td className="text-center tabular-nums">{s(p.stats, "baseOnBalls")}</td>
                <td className="text-center tabular-nums">{s(p.stats, "strikeOuts")}</td>
                <td className="text-center tabular-nums">{s(p.stats, "era")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {team.note.length > 0 && (
        <ul className="mt-2 text-xs text-black/50 dark:text-white/50 space-y-0.5">
          {team.note.map((n, idx) => (
            <li key={idx}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BoxScore({
  away,
  home,
}: {
  away: BoxscoreTeam;
  home: BoxscoreTeam;
}) {
  return (
    <div>
      <TeamBox team={away} />
      <TeamBox team={home} />
    </div>
  );
}
