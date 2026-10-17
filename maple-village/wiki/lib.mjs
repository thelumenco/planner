// The Honeybrook Wiki (round 224): shared bits for every page. The wiki is built from the game's own data
// (src/data, src/game), so it never drifts from the game: `node wiki/build-wiki.mjs` writes dist/wiki/.
// Pages live in wiki/pages/*.mjs; each exports `pages(ctx)` -> [{slug, title, section, html, blurb?, search?: [{t, d, a}]}].
import { icon as gameIcon } from "../src/art/icons.js";
import { itemIco, ITEMS } from "../src/data/items.js";
import { VILLAGE, ROOMS } from "../src/data/world.js";
import { personArt } from "../src/art/people.js";

export const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const slugify = s => String(s).toLowerCase().replace(/&/g, "and").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// an icon from the game (the hand-drawn look comes from the filters in the page's <svg> defs)
export const ico = (name, size = 24) => gameIcon(name, size, "wico");
export const itemIcon = (id, size = 24) => ico(ITEMS[id] ? (ITEMS[id].ico || itemIco(id)) : id, size);
export const coin = n => `<span class="coin">${ico("coin", 15)}${typeof n === "number" ? n.toLocaleString("en-GB") : esc(n)}</span>`;
// minutes since midnight -> "9:30am"
export const hm = m => { const h = Math.floor(m/60) % 24, mm = m % 60; return `${h % 12 || 12}${mm ? ":" + String(mm).padStart(2, "0") : ""}${h < 12 ? "am" : "pm"}`; };
export const DAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
export const daysText = dow => { if (!dow || dow.length === 7) return "every day"; const s = [...dow].sort();
  if (s.join() === "1,2,3,4,5") return "weekdays"; if (s.join() === "0,6") return "weekends"; return s.map(d => DAYS[d]).join(", "); };
// a place in the village, by scene id
const OUT = {base: "Home (outside)", village: "Town square", lane: "Makers' Lane", vineyard: "The vineyard", orchard: "The orchard", flowers: "The flower farm", field: "The field",
  shore: "The foreshore", bay: "The bay", hfarm: "Wildflower Farm", hlane: "Honeybrook station", hwoods: "Honeybrook Woods", farm: "The garden", greenhouse: "The greenhouse",
  mill: "The old mill", millup: "The old mill, upstairs", terrace: "The terrace", home: "Your house", room: "Your room"};
export const placeName = sc => OUT[sc] || (ROOMS[sc] && ROOMS[sc].name) || (VILLAGE[sc] && VILLAGE[sc].name) || sc;
// a <table>; rows are arrays of cells (already html)
export const table = (head, rows, cls = "") => rows.length ? `<div class="tw"><table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<p class="muted">Nothing here yet.</p>`;
// a spoiler, folded away until tapped
export const spoiler = (label, html) => `<details class="spoil"><summary>${esc(label)} <span class="muted">(tap to reveal)</span></summary>${html}</details>`;
export const link = (slug, text) => `<a href="/${slug === "index" ? "" : slug}">${text}</a>`;
export const card = (slug, title, sub, iconName) => `<a class="card" href="/${slug}">${iconName ? ico(iconName, 30) : ""}<span><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</span></a>`;
// a villager, drawn by the game's own art (personArt), standing on a little circle
export const portrait = (look, size = 64) => `<svg class="face" viewBox="-26 -72 52 78" width="${size*52/78}" height="${size}" aria-hidden="true">${personArt(look || {})}</svg>`;
export const lede = t => `<p class="lede">${t}</p>`;

// the contents menu: sections in order (each page names its section)
export const SECTIONS = [
  ["start", "Getting started"], ["village", "The village"], ["people", "Villagers"], ["farming", "Farming"],
  ["making", "Making things"], ["outdoors", "Out and about"], ["trips", "Trips and islands"], ["cottages", "Elena's cottages"],
  ["items", "Items"], ["calendar", "Calendar"], ["collections", "Collections"]
];

// the page itself
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<filter id="wob" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter>
<filter id="wobS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale=".7"/></filter>
<filter id="markerS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="2" seed="9" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale=".9" result="d"/><feTurbulence type="fractalNoise" baseFrequency="2.4 .3" numOctaves="2" seed="2" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 .35  0 0 0 0 .16  0 0 0 0 .06  0 0 0 1.1 -.5" result="ga"/><feComposite in="ga" in2="d" operator="in" result="streaks"/><feMerge><feMergeNode in="d"/><feMergeNode in="streaks"/></feMerge></filter>
</defs></svg>`;
export function layout(p, nav){
  const title = p.slug === "index" ? "Honeybrook Wiki" : `${p.title} · Honeybrook Wiki`;
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(p.blurb || "The Honeybrook Wiki: villagers, places, recipes, trips and everything in the game.")}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&family=Mulish:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/wiki.css"><link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#F3C969"/><path d="M8 13q4 4 8 0" stroke="#3A2E28" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>')}"></head>
<body>${DEFS}
<header class="top"><button class="menu" id="menuBtn" aria-label="Contents" aria-expanded="false">☰</button><a class="brand" href="/">${ico("sparkle", 22)}<span>Honeybrook Wiki</span></a>
<div class="search"><input id="q" type="search" placeholder="Search the wiki" autocomplete="off" aria-label="Search the wiki"><ul id="hits" hidden></ul></div></header>
<div class="shell"><nav class="side" id="side" aria-label="Contents">${nav}<p class="play"><a href="https://honey-brook.web.app">Play Honeybrook →</a></p></nav>
<main class="main">${p.slug === "index" ? "" : `<p class="crumb">${link("index", "Wiki")} › ${esc((SECTIONS.find(s => s[0] === p.section) || [, ""])[1])}</p><h1>${esc(p.title)}</h1>`}${p.html}
<footer class="foot">Built from the game itself, so it's always up to date. <a href="https://honey-brook.web.app">Play Honeybrook</a></footer></main></div>
<script src="/wiki.js" defer></script></body></html>`;
}
