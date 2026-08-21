"use client";

import { useState } from "react";
import type { Game, MlbGameData } from "@/lib/types";
import LineScore from "./LineScore";
import BoxScore from "./BoxScore";
import PlayByPlay from "./PlayByPlay";

const TABS = ["Summary", "Box Score", "Play-by-Play"] as const;

export default function GameTabs({
  game,
  mlbData,
}: {
  game: Game;
  mlbData: MlbGameData;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Summary");

  return (
    <div>
      <div className="flex gap-1 border-b border-black/10 dark:border-white/10 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-3 py-2 text-sm -mb-px border-b-2 transition-colors " +
              (tab === t
                ? "border-[var(--accent)] text-[var(--accent)] font-medium"
                : "border-transparent text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Summary" && (
        <div className="space-y-6">
          <LineScore data={mlbData} awayTeam={game.awayTeam} homeTeam={game.homeTeam} />

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {mlbData.decisions?.winner && (
              <div>
                <dt className="text-black/50 dark:text-white/50">Win</dt>
                <dd>{mlbData.decisions.winner}</dd>
              </div>
            )}
            {mlbData.decisions?.loser && (
              <div>
                <dt className="text-black/50 dark:text-white/50">Loss</dt>
                <dd>{mlbData.decisions.loser}</dd>
              </div>
            )}
            {mlbData.decisions?.save && (
              <div>
                <dt className="text-black/50 dark:text-white/50">Save</dt>
                <dd>{mlbData.decisions.save}</dd>
              </div>
            )}
            {mlbData.venue && (
              <div>
                <dt className="text-black/50 dark:text-white/50">Venue</dt>
                <dd>{mlbData.venue}</dd>
              </div>
            )}
          </dl>

          {mlbData.officials.length > 0 && (
            <div className="text-sm">
              <dt className="text-black/50 dark:text-white/50 mb-1">Umpires</dt>
              <dd>{mlbData.officials.join(" · ")}</dd>
            </div>
          )}

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

      {tab === "Box Score" && (
        <BoxScore away={mlbData.boxscore.away} home={mlbData.boxscore.home} />
      )}

      {tab === "Play-by-Play" && <PlayByPlay plays={mlbData.plays} />}
    </div>
  );
}
