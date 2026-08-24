import Link from "next/link";
import { getAllGames, getMlbData } from "@/lib/games";
import { computeSummary, formatInnings } from "@/lib/stats";
import Leaderboard from "@/components/Leaderboard";
import TeamLink from "@/components/TeamLink";
import PlayerLink from "@/components/PlayerLink";
import TeamLogo from "@/components/TeamLogo";
import ScorerLink from "@/components/ScorerLink";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Home() {
  const games = getAllGames();
  const summary = computeSummary(games, getMlbData);

  return (
    <div>
      <h1 className="font-heading text-3xl uppercase tracking-wide mb-1">
        Dave Gobron&apos;s Scorecard Archive
      </h1>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        A summary of every game scored by hand at the ballpark.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
          <div className="font-heading text-3xl text-[var(--accent)]">
            {summary.totalGames}
          </div>
          <div className="text-xs text-black/50 dark:text-white/50">Games attended</div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
          <div className="font-heading text-3xl text-[var(--accent)]">
            {summary.redSoxRecord.wins}-{summary.redSoxRecord.losses}
          </div>
          <div className="text-xs text-black/50 dark:text-white/50">Red Sox record</div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
          <div className="font-heading text-3xl text-[var(--accent)]">
            {summary.totalRedSoxOpponents}
          </div>
          <div className="text-xs text-black/50 dark:text-white/50">Red Sox opponents seen</div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
          <div className="font-heading text-3xl text-[var(--accent)]">
            {summary.teams.length}
          </div>
          <div className="text-xs text-black/50 dark:text-white/50">Teams seen</div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
          <div className="text-sm font-semibold">
            {formatDate(summary.firstDate)} – {formatDate(summary.lastDate)}
          </div>
          <div className="text-xs text-black/50 dark:text-white/50">Date range</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-10 mb-10">
        <Leaderboard
          title="Scorers"
          rows={summary.scorers}
          rowKey={(r) => r.name}
          rowHeightClass="h-[72px]"
          columns={[
            { header: "Scorer", render: (r) => <ScorerLink name={r.name} /> },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
          ]}
        />
        <Leaderboard
          title="Home Teams"
          rows={summary.homeTeams}
          rowKey={(r) => r.team}
          rowHeightClass="h-[72px]"
          columns={[
            {
              header: "Team",
              render: (r) => (
                <Link
                  href={`/games?team=${encodeURIComponent(r.team)}`}
                  className="inline-flex items-center gap-2 hover:underline underline-offset-2"
                >
                  <TeamLogo team={r.team} size={20} />
                  <span>{r.team}</span>
                </Link>
              ),
            },
            {
              header: "Venue",
              render: (r) => <span className="text-black/60 dark:text-white/60">{r.venue}</span>,
            },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
            {
              header: "Record",
              align: "right",
              render: (r) => `${r.wins}-${r.losses}`,
            },
          ]}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-10 mb-10">
        <Leaderboard
          title="Most Seen Players"
          rows={summary.mostSeenPlayers}
          rowKey={(r) => r.name}
          columns={[
            { header: "Player", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
            { header: "HR", align: "right", render: (r) => r.homeRuns },
          ]}
        />
        <Leaderboard
          title="Home Run Leaders"
          rows={summary.homeRunLeaders}
          rowKey={(r) => r.name}
          columns={[
            { header: "Player", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "HR", align: "right", render: (r) => r.homeRuns },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
          ]}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-10 mb-10">
        <Leaderboard
          title="Hits Leaders"
          rows={summary.hitLeaders}
          rowKey={(r) => r.name}
          columns={[
            { header: "Player", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "H", align: "right", render: (r) => r.hits },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
          ]}
        />
        <Leaderboard
          title="RBI Leaders"
          rows={summary.rbiLeaders}
          rowKey={(r) => r.name}
          columns={[
            { header: "Player", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "RBI", align: "right", render: (r) => r.rbi },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
          ]}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-10 mb-10">
        <Leaderboard
          title="Stolen Base Leaders"
          rows={summary.stolenBaseLeaders}
          rowKey={(r) => r.name}
          columns={[
            { header: "Player", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "SB", align: "right", render: (r) => r.stolenBases },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
          ]}
        />
        <Leaderboard
          title="Strikeout Leaders (Batters)"
          rows={summary.strikeoutBatters}
          rowKey={(r) => r.name}
          columns={[
            { header: "Batter", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "K", align: "right", render: (r) => r.strikeOuts },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
          ]}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-10 mb-10">
        <Leaderboard
          title="Most Seen Pitchers"
          rows={summary.mostSeenPitchers}
          rowKey={(r) => r.name}
          columns={[
            { header: "Pitcher", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
            {
              header: "Record",
              align: "right",
              render: (r) => `${r.wins}-${r.losses}`,
            },
            { header: "K", align: "right", render: (r) => r.strikeOuts },
          ]}
        />
        <Leaderboard
          title="Strikeout Leaders (Pitchers)"
          rows={summary.strikeoutPitchers}
          rowKey={(r) => r.name}
          columns={[
            { header: "Pitcher", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "K", align: "right", render: (r) => r.strikeOuts },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
          ]}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-10 mb-10">
        <Leaderboard
          title="ERA Leaders (9+ IP)"
          rows={summary.eraLeaders}
          rowKey={(r) => r.name}
          columns={[
            { header: "Pitcher", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "ERA", align: "right", render: (r) => r.era.toFixed(2) },
            { header: "IP", align: "right", render: (r) => formatInnings(r.outs) },
          ]}
        />
        <Leaderboard
          title="Error Leaders"
          rows={summary.errorLeaders}
          rowKey={(r) => r.name}
          columns={[
            { header: "Player", render: (r) => <PlayerLink name={r.name} /> },
            { header: "Team", render: (r) => <TeamLink team={r.team} /> },
            { header: "E", align: "right", render: (r) => r.errors },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
          ]}
        />
      </div>

      <div className="mb-10">
        <Leaderboard
          title="Red Sox Opponents"
          rows={summary.teams.filter((r) => r.redSoxWins + r.redSoxLosses > 0)}
          rowKey={(r) => r.team}
          columns={[
            {
              header: "Team",
              render: (r) => (
                <Link
                  href={`/games?team=${encodeURIComponent(r.team)}`}
                  className="inline-flex items-center gap-2 hover:underline underline-offset-2"
                >
                  <TeamLogo team={r.team} size={20} />
                  <span>{r.team}</span>
                </Link>
              ),
            },
            { header: "Games", align: "right", render: (r) => r.gamesSeen },
            {
              header: "Red Sox Record",
              align: "right",
              render: (r) => `${r.redSoxWins}-${r.redSoxLosses}`,
            },
          ]}
        />
      </div>

      <Link
        href="/games"
        className="inline-block text-sm border border-[var(--accent)] text-[var(--accent)] rounded-md px-4 py-2 hover:bg-[var(--accent)] hover:text-white transition-colors font-medium"
      >
        Browse all games →
      </Link>
    </div>
  );
}
