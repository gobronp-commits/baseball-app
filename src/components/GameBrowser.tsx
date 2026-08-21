"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Game } from "@/lib/types";
import GameCard from "./GameCard";

export default function GameBrowser({
  games,
  filterLabel,
}: {
  games: Game[];
  filterLabel?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>("all");

  const years = useMemo(
    () => Array.from(new Set(games.map((g) => g.date.slice(0, 4)))).sort(),
    [games]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((g) => {
      if (year !== "all" && !g.date.startsWith(year)) return false;
      if (!q) return true;
      return (
        g.awayTeam.toLowerCase().includes(q) ||
        g.homeTeam.toLowerCase().includes(q) ||
        g.date.includes(q) ||
        g.location.toLowerCase().includes(q)
      );
    });
  }, [games, query, year]);

  return (
    <div>
      {filterLabel && (
        <div className="flex items-center gap-2 mb-4 text-sm rounded-md border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2">
          <span>
            Showing games featuring <strong>{filterLabel}</strong>
          </span>
          <Link href="/games" className="ml-auto text-xs underline underline-offset-2">
            Clear
          </Link>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by team, date, or park…"
          className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-black/50 dark:text-white/50 mb-4">
        {filtered.length} game{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </div>
  );
}
