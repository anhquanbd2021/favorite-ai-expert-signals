// report.mjs — rank the sample feed in the terminal, every hit itemized.
// Usage: node scripts/report.mjs [feed.json]
import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreFeed } from "../public/signals.mjs";

const feedPath = process.argv[2]
  ? resolve(process.argv[2])
  : join(dirname(fileURLToPath(import.meta.url)), "..", "examples", "sample-feed.json");
const feed = JSON.parse(readFileSync(feedPath, "utf8"));

for (const [i, p] of scoreFeed(feed).entries()) {
  console.log(`\n#${i + 1}  ${p.author}  score ${p.score} — ${p.verdict}`);
  console.log(`   "${p.text.slice(0, 90)}${p.text.length > 90 ? "…" : ""}"`);
  for (const h of p.hits) console.log(`   ${h.pts > 0 ? "+" : ""}${h.pts}  ${h.kind} — ${h.why}`);
}
