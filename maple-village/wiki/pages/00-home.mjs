// The main page: a welcome, then every section with its pages
import { SECTIONS, esc, ico, scene } from "../lib.mjs";
const ICON = {start: "sparkle", village: "base", people: "heart", farming: "sprout", making: "chocolate", outdoors: "fish", trips: "kite", cottages: "bed", items: "bag", calendar: "calendar", collections: "lantern"};
export const pages = () => [{slug: "index", title: "Honeybrook Wiki", section: "start", hide: true,
  fill: all => `<div class="banner">${scene()}</div><div><h1 style="margin:.6em 0 .2em">Honeybrook Wiki</h1><p class="lede">Everything about Honeybrook: the villagers, the places, what to grow and make, the trips and islands, and Elena's cottages. Built from the game itself, so it's always up to date.</p></div>
  ${SECTIONS.map(([k, n]) => { const ps = all.filter(p => p.section === k && !p.hide); return ps.length ? `<h2>${ico(ICON[k] || "sparkle", 22)} ${esc(n)}</h2><div class="cards">${ps.map(p => `<a class="card" href="/${p.slug}"><span><b>${esc(p.navTitle || p.title)}</b>${p.blurb ? `<small>${esc(p.blurb)}</small>` : ""}</span></a>`).join("")}</div>` : ""; }).join("")}`}];
