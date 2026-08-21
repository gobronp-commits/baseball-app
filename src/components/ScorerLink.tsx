import Link from "next/link";

export default function ScorerLink({ name }: { name: string }) {
  return (
    <Link
      href={`/games?scorer=${encodeURIComponent(name)}`}
      className="hover:underline underline-offset-2"
    >
      {name}
    </Link>
  );
}
