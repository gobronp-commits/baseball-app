import Link from "next/link";
import TeamLogo from "./TeamLogo";

export default function TeamLink({
  team,
  showLogo = true,
}: {
  team: string;
  showLogo?: boolean;
}) {
  return (
    <Link
      href={`/games?team=${encodeURIComponent(team)}`}
      className="inline-flex items-center gap-1.5 hover:underline underline-offset-2"
    >
      {showLogo && <TeamLogo team={team} />}
      <span>{team}</span>
    </Link>
  );
}
