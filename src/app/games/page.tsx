import { getAllGames, getMlbData } from "@/lib/games";
import { gamesForTeam, gamesForPlayer } from "@/lib/filters";
import GameBrowser from "@/components/GameBrowser";

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string; player?: string }>;
}) {
  const { team, player } = await searchParams;
  const allGames = getAllGames();

  let games = allGames;
  let filterLabel: string | null = null;
  if (team) {
    games = gamesForTeam(allGames, team);
    filterLabel = team;
  } else if (player) {
    games = gamesForPlayer(allGames, getMlbData, player);
    filterLabel = player;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl uppercase tracking-wide mb-1">All Games</h1>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        Games scored by hand at the ballpark, matched up with the official
        record.
      </p>
      <GameBrowser games={games} filterLabel={filterLabel} />
    </div>
  );
}
