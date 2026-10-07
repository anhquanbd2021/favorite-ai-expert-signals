import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const serverPath = join(dirname(fileURLToPath(import.meta.url)), "..", "app", "server.js");
const PORT = 39118;
const base = `http://localhost:${PORT}`;

let proc;
async function ready() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`${base}/health`); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 120));
  }
  throw new Error("server did not start");
}

test.before(async () => {
  proc = spawn(process.execPath, [serverPath], { env: { ...process.env, PORT: String(PORT) } });
  await ready();
});
test.after(() => proc?.kill());

test("/health returns ok", async () => {
  assert.equal(await (await fetch(`${base}/health`)).text(), "ok");
});

test("/api/feed ranks the sample feed", async () => {
  const j = await (await fetch(`${base}/api/feed`)).json();
  assert.equal(j.length, 5);
  assert.equal(j[0].author, "@debug_diary");
  assert.equal(j.at(-1).author, "@thoughtleader_ai");
});

test("/api/score scores posted text", async () => {
  const r = await fetch(`${base}/api/score`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "p95 dropped 300ms, repro in the repo" }),
  });
  const j = await r.json();
  assert.ok(j.score > 0);
  assert.equal(r.status, 200);
});

test("/api/score rejects missing text", async () => {
  const r = await fetch(`${base}/api/score`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(r.status, 400);
});
