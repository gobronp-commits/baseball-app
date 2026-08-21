import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllGames, getGameById, getMlbData } from "@/lib/games";
import { displayScore, scoreDiffersFromScorecard } from "@/lib/score";
import ScorecardViewer from "@/components/ScorecardViewer";
import GameTabs from "@/components/GameTabs";

export function generateStaticParams() {
  return getAllGames().map((g) => ({ id: g.id }));
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = getGameById(id);
  if (!game) notFound();

  const mlbData = getMlbData(game);
  const score = displayScore(game);
  const differs = scoreDiffersFromScorecard(game);

  return (
    <div>
      <Link
        href="/"
        className="text-sm text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80"
      >
        ← All games
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight mt-2">
        {game.awayTeam} @ {game.homeTeam}
      </h1>
      <p className="text-sm text-black/60 dark:text-white/60 mt-1">
        {formatDate(game.date)} · {game.location}
      </p>
      <p className="text-3xl font-semibold tabular-nums mt-3">
        {score.away}–{score.home}
      </p>
      {differs && (
        <p className="text-xs text-black/50 dark:text-white/50 mt-1">
          Scorecard tally reads {game.scorecardAwayScore}–{game.scorecardHomeScore};
          shown score is the official MLB record.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50 mb-3">
          Scorecard
        </h2>
        <ScorecardViewer images={game.scorecardImages} />
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50 mb-3">
          Game Log
        </h2>
        {mlbData ? (
          <GameTabs game={game} mlbData={mlbData} />
        ) : (
          <p className="text-sm text-black/50 dark:text-white/50">
            No official game data linked yet for this game.
          </p>
        )}
      </section>
    </div>
  );
}
