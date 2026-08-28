/**
 * Static server for the built site, used by the Playwright suite.
 *
 * Serves _site under the same base path GitHub Pages uses, because the pages
 * reference their assets with absolute, baseurl-prefixed URLs. Serving at the
 * root would 404 every stylesheet and script, and the tests would pass against
 * a page that never loads its own JavaScript.
 *
 * No dependency: a static file server that has to be installed is one more
 * thing that can differ between a laptop and CI.
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("_site");
const BASE = process.env.BASE_PATH ?? "/github-pages-docs-test";
const PORT = Number(process.env.PORT ?? 4321);

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = createServer(async (request, response) => {
  let pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  if (BASE && pathname.startsWith(BASE)) pathname = pathname.slice(BASE.length);
  if (pathname === "") pathname = "/";

  let file = path.join(ROOT, pathname);
  if (!file.startsWith(ROOT)) {
    response.writeHead(403, { "content-type": "text/plain" });
    response.end("Forbidden");
    return;
  }

  try {
    const info = await stat(file);
    if (info.isDirectory()) file = path.join(file, "index.html");
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type": CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain" });
    response.end("Not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Serving _site at http://127.0.0.1:${PORT}${BASE}/`);
});
