import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllGames, getGameById, getMlbData } from "@/lib/games";
import { displayScore, scoreDiffersFromScorecard } from "@/lib/score";
import { getCommentsForGame } from "@/lib/comments";
import ScorecardViewer from "@/components/ScorecardViewer";
import GameTabs from "@/components/GameTabs";
import CommentSection from "@/components/CommentSection";

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
  const comments = getCommentsForGame(game.id);

  return (
    <div>
      <Link
        href="/games"
        className="text-sm text-black/50 dark:text-white/50 hover:text-[var(--accent)]"
      >
        ← All games
      </Link>

      <h1 className="font-heading text-2xl uppercase tracking-wide mt-2">
        {game.awayTeam} @ {game.homeTeam}
      </h1>
      <p className="text-sm text-black/60 dark:text-white/60 mt-1">
        {formatDate(game.date)} · {game.location}
      </p>
      <p className="font-heading text-4xl text-[var(--accent)] mt-3">
        {score.away}–{score.home}
      </p>
      {differs && (
        <p className="text-xs text-black/50 dark:text-white/50 mt-1">
          Scorecard tally reads {game.scorecardAwayScore}–{game.scorecardHomeScore};
          shown score is the official MLB record.
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-heading text-sm uppercase tracking-wide text-[var(--accent)] mb-3 pb-1 border-b-2 border-[var(--accent)]/25">
          Scorecard
        </h2>
        <ScorecardViewer images={game.scorecardImages} />
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-sm uppercase tracking-wide text-[var(--accent)] mb-3 pb-1 border-b-2 border-[var(--accent)]/25">
          Game Log
        </h2>
        {mlbData ? (
          <GameTabs game={game} mlbData={mlbData} />
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-black/50 dark:text-white/50">
              No official game data linked yet for this game.
            </p>
            {game.notes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">From the scorecard</h4>
                <ul className="space-y-1.5 text-sm text-black/70 dark:text-white/70">
                  {game.notes.map((n, idx) => (
                    <li key={idx} className="pl-3 border-l-2 border-black/10 dark:border-white/10">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <CommentSection gameId={game.id} comments={comments} />
    </div>
  );
}
