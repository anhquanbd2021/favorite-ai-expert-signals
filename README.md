# Signal Checker — companion demo

Interactive lab for the article *Everyone's an AI Expert. The Receipts Are What
Matter.* Paste a post — or run the bundled sample feed — and watch the
article's filter score it: numbers with units, runnable artifacts, admitted
failures, and scoped claims raise the score; unfalsifiable predictions and
buzzword density sink it.

Zero dependencies — Node 20+ only. `public/signals.mjs` is the heuristic
scorer, shared by the server, the browser UI, the report script, and the tests.

## The filter

| Signal | Direction |
|---|---|
| `$400`, `300ms`, `9 points` | +3 — a number with a unit |
| repo, trace, postmortem | +3 — a runnable artifact |
| "I was wrong" | +3 — a claim that cost the author something |
| "is dead", "the future is now" | −3 — unfalsifiable |
| leverage / synergy / 10x | −2 — vocabulary without a decision |

## Run it

```text
npm start                    # checker on :3000
npm test                     # scoring + API surface
node scripts/report.mjs      # ranked sample feed, every hit itemized
node scripts/report.mjs my-feed.json   # rank your own feed
```

`examples/sample-feed.json` is the five-post feed the UI and report rank.
