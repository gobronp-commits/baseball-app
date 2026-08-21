import type { MlbGameData } from "@/lib/types";

function num(v: unknown): string {
  return typeof v === "number" ? String(v) : "-";
}

export default function LineScore({
  data,
  awayTeam,
  homeTeam,
}: {
  data: MlbGameData;
  awayTeam: string;
  homeTeam: string;
}) {
  const { innings, totals } = data.linescore;
  const awayTotals = totals.away as { runs?: number; hits?: number; errors?: number };
  const homeTotals = totals.home as { runs?: number; hits?: number; errors?: number };

  return (
    <div className="overflow-x-auto">
      <table className="text-sm border-collapse w-full">
        <thead>
          <tr className="text-black/50 dark:text-white/50">
            <th className="text-left font-normal pr-4 py-1">Team</th>
            {innings.map((i) => (
              <th key={i.num} className="w-7 text-center font-normal">
                {i.num}
              </th>
            ))}
            <th className="w-8 text-center font-semibold pl-2">R</th>
            <th className="w-8 text-center font-semibold">H</th>
            <th className="w-8 text-center font-semibold">E</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-black/10 dark:border-white/10">
            <td className="pr-4 py-1">{awayTeam}</td>
            {innings.map((i) => (
              <td key={i.num} className="text-center tabular-nums">
                {num(i.away)}
              </td>
            ))}
            <td className="text-center font-semibold tabular-nums pl-2">
              {num(awayTotals?.runs)}
            </td>
            <td className="text-center tabular-nums">{num(awayTotals?.hits)}</td>
            <td className="text-center tabular-nums">{num(awayTotals?.errors)}</td>
          </tr>
          <tr className="border-t border-black/10 dark:border-white/10">
            <td className="pr-4 py-1">{homeTeam}</td>
            {innings.map((i) => (
              <td key={i.num} className="text-center tabular-nums">
                {num(i.home)}
              </td>
            ))}
            <td className="text-center font-semibold tabular-nums pl-2">
              {num(homeTotals?.runs)}
            </td>
            <td className="text-center tabular-nums">{num(homeTotals?.hits)}</td>
            <td className="text-center tabular-nums">{num(homeTotals?.errors)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
