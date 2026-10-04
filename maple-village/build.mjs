// Builds the game into ONE self-contained HTML file for publishing as a claude.ai artifact.
//   npm run build  -> dist/maple-village.html  (publish this one)
//   npm run dev    -> dist/dev.html with a local window.claude stub, served at http://localhost:5173 and rebuilt on change (--once: build only)
import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, watch } from "node:fs";
import { createServer } from "node:http";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dev = process.argv.includes("--dev");
const serve = dev && !process.argv.includes("--once");
const STYLE_ORDER = ["base.css", "notebook.css", "npcs.css", "game-ui.css"];

async function build() {
  const js = await esbuild.build({
    entryPoints: [join(root, "src/main.js")],
    bundle: true, format: "iife", write: false, target: "es2020",
    legalComments: "none", charset: "utf8"
  });
  const script = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
  const styleFiles = readdirSync(join(root, "src/styles")).sort((a, b) => rank(a) - rank(b));
  const css = styleFiles.map(f => readFileSync(join(root, "src/styles", f), "utf8")).join("\n");
  const stub = dev ? `<script>${readFileSync(join(root, "dev/claude-stub.js"), "utf8")}</script>` : "";
  const html = readFileSync(join(root, "src/index.html"), "utf8")
    .replace("/*STYLES*/", () => css)
    .replace("<!--DEVSTUB-->", () => stub)
    .replace("/*SCRIPT*/", () => script);
  mkdirSync(join(root, "dist"), { recursive: true });
  const out = join(root, "dist", dev ? "dev.html" : "maple-village.html");
  writeFileSync(out, html);
  console.log(`built ${out.replace(root + "/", "")} (${(html.length / 1024).toFixed(0)} KB)`);
}
const rank = f => { const i = STYLE_ORDER.indexOf(f); return i < 0 ? 99 : i; };

try { await build(); } catch (e) { console.error(e.message); if (!serve) process.exit(1); }

if (serve) {
  let t;
  for (const dir of ["src", "dev"]) watch(join(root, dir), { recursive: true }, () => { clearTimeout(t); t = setTimeout(() => build().catch(e => console.error(e.message)), 80); });
  createServer((req, res) => {
    try { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(readFileSync(join(root, "dist/dev.html"))); }
    catch { res.writeHead(500); res.end("build failed, see terminal"); }
  }).listen(5173, () => console.log("dev server on http://localhost:5173  (add ?seed=1 for a demo day)"));
}
