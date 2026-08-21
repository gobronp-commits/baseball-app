// Downloads each team's logo SVG from MLB's static asset CDN into
// public/logos/<teamId>.svg, so the app doesn't hotlink external images.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const teams = JSON.parse(readFileSync(path.join(root, "data/teams.json"), "utf8"));
const outDir = path.join(root, "public/logos");
mkdirSync(outDir, { recursive: true });

for (const team of teams) {
  const outFile = path.join(outDir, `${team.id}.svg`);
  if (existsSync(outFile)) continue;
  const res = await fetch(`https://www.mlbstatic.com/team-logos/${team.id}.svg`);
  if (!res.ok) {
    console.log(`FAILED ${team.name}: ${res.status}`);
    continue;
  }
  writeFileSync(outFile, await res.text());
  console.log(`saved ${team.name}`);
}
