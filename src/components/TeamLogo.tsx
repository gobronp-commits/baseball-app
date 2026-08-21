import { findTeamByName } from "@/lib/teams";

export default function TeamLogo({
  team,
  size = 20,
}: {
  team: string;
  size?: number;
}) {
  const match = findTeamByName(team);
  if (!match) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/${match.id}.svg`}
      alt=""
      width={size}
      height={size}
      className="inline-block shrink-0 align-middle"
    />
  );
}
