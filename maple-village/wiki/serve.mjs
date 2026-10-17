// A tiny local server for the built wiki (clean URLs like Firebase Hosting): node wiki/serve.mjs [port]
import { createServer } from "node:http"; import { readFileSync, existsSync, statSync } from "node:fs"; import { join, dirname, extname } from "node:path"; import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "wiki"), port = +process.argv[2] || 8123;
const TYPES = {".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json"};
createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index";
  let f = join(root, p); if (!existsSync(f) || statSync(f).isDirectory()) f = join(root, p + ".html"); if (!existsSync(f)) { res.writeHead(404, {"content-type": TYPES[".html"]}); return res.end(readFileSync(join(root, "404.html"))); }
  res.writeHead(200, {"content-type": TYPES[extname(f)] || "application/octet-stream"}); res.end(readFileSync(f)); }).listen(port, () => console.log("wiki on http://localhost:" + port));
