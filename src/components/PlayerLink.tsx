import Link from "next/link";

export default function PlayerLink({ name }: { name: string }) {
  return (
    <Link
      href={`/games?player=${encodeURIComponent(name)}`}
      className="hover:underline underline-offset-2"
    >
      {name}
    </Link>
  );
}
