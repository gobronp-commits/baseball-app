import { getAllGames } from "@/lib/games";
import GameBrowser from "@/components/GameBrowser";

export default function GamesPage() {
  const games = getAllGames();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">All Games</h1>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        Games scored by hand at the ballpark, matched up with the official
        record.
      </p>
      <GameBrowser games={games} />
    </div>
  );
}
