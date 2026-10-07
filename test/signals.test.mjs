import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scorePost, scoreFeed } from "../public/signals.mjs";

const FEED = JSON.parse(readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "examples", "sample-feed.json"), "utf8"));

test("posts with receipts outrank hot takes in the feed", () => {
  const ranked = scoreFeed(FEED);
  assert.equal(ranked[0].author, "@debug_diary"); // admitted wrong + a number with a unit
  assert.equal(ranked[ranked.length - 1].author, "@thoughtleader_ai");
});

test("specific numbers raise the score", () => {
  const r = scorePost("we added a reranker and p95 dropped 300ms on our eval set");
  assert.ok(r.score >= 5, `expected operator, got ${r.score}`);
  assert.equal(r.verdict, "operator");
});

test("unfalsifiable predictions sink the score", () => {
  const r = scorePost("AI will replace 90% of knowledge work. The future is now. 🚀🔥");
  assert.ok(r.score < 0);
  assert.equal(r.verdict, "commentator");
});

test("admitting failure is a receipt", () => {
  const r = scorePost("I was wrong — the bottleneck was JSON parsing, not the index");
  assert.ok(r.hits.some((h) => h.kind === "receipt" && /admitted failure/.test(h.why)));
});

test("a bare opinion scores near zero", () => {
  const r = scorePost("interesting thread");
  assert.equal(r.score, 0);
  assert.equal(r.verdict, "unclear");
});

test("scoring is deterministic and feed covers all samples", () => {
  const t = FEED[0].text;
  assert.deepEqual(scorePost(t), scorePost(t));
  assert.equal(scoreFeed(FEED).length, FEED.length);
});
