import Link from "next/link";
import type { Game } from "@/lib/types";
import { displayScore } from "@/lib/score";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GameCard({ game }: { game: Game }) {
  const score = displayScore(game);
  const awayWon = score.away > score.home;
  return (
    <Link
      href={`/games/${game.id}`}
      className="block rounded-lg border border-black/10 dark:border-white/15 p-4 hover:border-black/30 dark:hover:border-white/40 transition-colors"
    >
      <div className="text-xs text-black/50 dark:text-white/50">
        {formatDate(game.date)} · {game.location}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={awayWon ? "font-semibold" : ""}>{game.awayTeam}</span>
        <span className={awayWon ? "font-semibold tabular-nums" : "tabular-nums"}>
          {score.away}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className={!awayWon ? "font-semibold" : ""}>{game.homeTeam}</span>
        <span className={!awayWon ? "font-semibold tabular-nums" : "tabular-nums"}>
          {score.home}
        </span>
      </div>
    </Link>
  );
}
