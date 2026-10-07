import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { scorePost, scoreFeed } from "../public/signals.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");
const FEED_PATH = join(__dirname, "..", "examples", "sample-feed.json");
const PORT = process.env.PORT ?? 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type });
  res.end(body);
}
const json = (res, data) => send(res, 200, JSON.stringify(data));

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = "";
    req.on("data", (c) => { b += c; if (b.length > 2e5) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch (e) { reject(e); } });
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;

  if (path === "/health") return send(res, 200, "ok", "text/plain");
  if (path === "/api/feed") {
    const feed = JSON.parse(await readFile(FEED_PATH, "utf8"));
    return json(res, scoreFeed(feed));
  }
  if (path === "/api/score" && req.method === "POST") {
    const { text } = await readBody(req);
    if (typeof text !== "string" || !text.trim()) {
      return send(res, 400, JSON.stringify({ error: "text required" }));
    }
    return json(res, scorePost(text));
  }

  let filePath = join(PUBLIC_DIR, path === "/" ? "index.html" : path);
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, "forbidden", "text/plain");
  filePath = normalize(filePath);
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, "forbidden", "text/plain");

  try {
    const body = await readFile(filePath);
    send(res, 200, body, MIME[extname(filePath)] ?? "application/octet-stream");
  } catch {
    send(res, 404, "not found", "text/plain");
  }
});

server.listen(PORT, () => {
  console.log(`demo listening on http://localhost:${PORT}`);
});
