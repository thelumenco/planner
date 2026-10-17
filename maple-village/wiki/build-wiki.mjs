// Builds the Honeybrook Wiki into dist/wiki/ (served at honeybrookwiki.web.app): every page module in wiki/pages,
// the contents menu, search.json, and the css and js. Run: node wiki/build-wiki.mjs
// Pages are made from the game's own data, so the wiki stays in step with the game; the leak check covers it too.
import { mkdirSync, writeFileSync, readdirSync, copyFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { layout, SECTIONS, esc } from "./lib.mjs";

const here = dirname(fileURLToPath(import.meta.url)), out = join(here, "..", "dist", "wiki");
const mods = readdirSync(join(here, "pages")).filter(f => f.endsWith(".mjs")).sort();
const pages = [];
for (const f of mods) { const m = await import(pathToFileURL(join(here, "pages", f)).href); pages.push(...(await m.pages({}))); }
// a page can fill itself in once every page is known (the main page lists them all)
for (const p of pages) if (p.fill) p.html = p.fill(pages);
// no two pages may share a slug
const seen = new Set(); for (const p of pages) { if (seen.has(p.slug)) throw new Error("two wiki pages are called " + p.slug); seen.add(p.slug); }
// the contents menu: each section's pages, in the order they were given (pages with `hide` stay out of the menu)
const nav = SECTIONS.map(([k, n]) => { const ps = pages.filter(p => p.section === k && !p.hide); return ps.length ? `<h4>${esc(n)}</h4><ul>${ps.map(p => `<li><a href="/${p.slug}">${esc(p.navTitle || p.title)}</a></li>`).join("")}</ul>` : ""; }).join("");
rmSync(out, {recursive: true, force: true}); mkdirSync(out, {recursive: true});
for (const p of pages) { const file = join(out, (p.slug === "index" ? "index" : p.slug) + ".html"); mkdirSync(dirname(file), {recursive: true}); writeFileSync(file, layout(p, `<ul><li><a href="/">Main page</a></li></ul>` + nav)); }
// search: every page, plus whatever each page adds (villagers, items, places...)
const index = pages.flatMap(p => [{t: p.title, d: (SECTIONS.find(s => s[0] === p.section) || [, ""])[1], a: "/" + (p.slug === "index" ? "" : p.slug), p: 1}, ...(p.search || [])]);
writeFileSync(join(out, "search.json"), JSON.stringify(index));
copyFileSync(join(here, "wiki.css"), join(out, "wiki.css")); copyFileSync(join(here, "wiki.js"), join(out, "wiki.js"));
writeFileSync(join(out, "404.html"), layout({slug: "404", title: "Page not found", section: "start", html: `<p>That page isn't here. Try the search box, or the <a href="/">main page</a>.</p>`}, nav));
console.log(`built dist/wiki (${pages.length} pages, ${index.length} search entries)`);
