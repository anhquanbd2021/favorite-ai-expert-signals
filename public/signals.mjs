// signals.mjs — score a feed post for "receipts" vs "hot take".
// Heuristic stand-in for the article's filter: specificity, numbers with
// units, shipped artifacts, admitted failure raise the score; unfalsifiable
// buzz and stakeless prediction sink it. Pure module — shared by server,
// browser UI, and tests.

const RECEIPTS = [
  { re: /\$[\d,.]+|\d+\s?(ms|s|ms|qps|rpm|gb|mb|tb|%|points|times|x)\b/i, pts: 3, why: "a number with a unit" },
  { re: /\b(repo|github\.com|demo|trace|postmortem|flame ?graph|run it|repro)\b/i, pts: 3, why: "a runnable artifact or evidence" },
  { re: /\b(I was wrong|turns out|mistake|fixed|failed|broke|postmortem|root cause)\b/i, pts: 3, why: "admitted failure — costs the author something" },
  { re: /\b(our|we) (added|built|shipped|deployed|dropped|saw|measured|spent)\b/i, pts: 2, why: "first-person operation" },
  { re: /\bfor our (workload|traffic|use case|team)\b/i, pts: 2, why: "scoped claim" },
];

const NOISE = [
  { re: /\b(is dead|the future is now|aren't ready|game.?chang|10x|revolutioni[sz]e|replace \d+%)\b/i, pts: -3, why: "unfalsifiable claim" },
  { re: /\b(leverage|synergy|agentic .*(synergy|paradigm)|paradigm shift)\b/i, pts: -2, why: "vocabulary that never resolves to a decision" },
  { re: /\bwill (replace|change everything|obsolete)\b/i, pts: -2, why: "prediction with no stakes" },
];

export function scorePost(text) {
  const hits = [];
  let score = 0;
  for (const r of RECEIPTS) if (r.re.test(text)) { hits.push({ kind: "receipt", pts: r.pts, why: r.why }); score += r.pts; }
  for (const n of NOISE) if (n.re.test(text)) { hits.push({ kind: "noise", pts: n.pts, why: n.why }); score += n.pts; }
  // emoji-heavy hype with no substance reads as noise
  const emoji = (text.match(/[🚀🔥💯⚡🤯]/g) || []).length;
  if (emoji >= 2 && hits.every((h) => h.kind === "noise")) {
    hits.push({ kind: "noise", pts: -1, why: "hype emoji, no payload" });
    score -= 1;
  }
  const verdict = score >= 5 ? "operator" : score >= 2 ? "probably reads docs" : score >= 0 ? "unclear" : "commentator";
  return { score, verdict, hits };
}

export function scoreFeed(feed) {
  return feed.map((p) => ({ ...p, ...scorePost(p.text) }))
    .sort((a, b) => b.score - a.score);
}
