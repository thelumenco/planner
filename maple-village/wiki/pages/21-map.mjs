// Round 231 (the creator: "a mini version of the map... where you are and where certain landmarks are", and the same
// map on the wiki): Honeybrook's twelve outdoor screens and how their gates join up, drawn by src/game/minimap.js (the
// same map as the one in the game's backpack), with what's on each screen and its neighbours.
import { TILES, PATHS, mapSVG, landmarksOf } from "../../src/game/minimap.js";
import { esc, table, ico, lede } from "../lib.mjs";

const PLACES = {base: "home", village: "town-square", lane: "makers-lane", vineyard: "the-vineyard", orchard: "the-orchard", flowers: "the-flower-farm",
  field: "the-field", shore: "the-foreshore", bay: "the-bay", hfarm: "wildflower-farm", hlane: "the-cottage-lane", hwoods: "honeybrook-woods"};
const tile = s => TILES.find(t => t[0] === s);
// which way a neighbour lies, from the grid
const dir = (a, b) => { const A = tile(a), B = tile(b); return B[3] < A[3] ? "north" : B[3] > A[3] ? "south" : B[2] < A[2] ? "west" : "east"; };
const next = s => PATHS.filter(p => p.includes(s)).map(p => p[0] === s ? p[1] : p[0]).map(o => `${esc(tile(o)[1])} <small class="muted">(${dir(s, o)})</small>`).join(", ");

function html(){
  const rows = TILES.map(([s, n]) => [`<a href="/places#${PLACES[s]}"><b>${esc(n)}</b></a>`,
    landmarksOf(null, s).map(l => `${ico(l.ico, 18)} ${esc(l.n)}${l.note ? ` <small class="muted">(${esc(l.note)})</small>` : ""}`).join("<br>"), next(s)]);
  return lede("Honeybrook is twelve outdoor screens, joined by gates and paths. This is the same map you'll find in the game: open your backpack and tap Map. There, a red dot shows where you are, and tapping a place lists what's there.")
    + `<div class="mapfig">${mapSVG(null, {})}</div>`
    + `<p>Home is at the bottom, with the town square just north of it through the gate. Walk through a screen's gates to reach the next one. Things you haven't built or bought yet, like the olive mill, the treehouse and the Cocoa Room, only appear on the game's map once you have them.</p>`
    + `<h2 id="screens">${ico("map", 22)} Every screen</h2>` + table(["Screen", "What's there", "Next door"], rows);
}
export const pages = () => [{slug: "map", title: "Map of Honeybrook", section: "village", blurb: "The twelve screens of Honeybrook, what's on each, and how they join up", html: html(),
  search: [{t: "Map", d: "Map of Honeybrook: every screen and how they join up", a: "/map"}, {t: "Mini map", d: "In the game: open your backpack and tap Map", a: "/map"}]}];
