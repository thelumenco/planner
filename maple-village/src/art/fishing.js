// Fishing spots: a little post with a fish sign and a coiled net by the water, and (at home) the golden koi in the pond.
import { sk, tapeLabel } from "./scenes.js";

const AT = {base: {x: 430, y: 108, side: 1, label: [436, 138]}, field: {x: 112, y: 352, side: 1, label: [112, 382]}, shore: {x: 234, y: 368, side: -1, label: [236, 336]}, hwoods: {x: 348, y: 264, side: -1, label: [300, 294]}, bay: {x: 172, y: 252, side: -1, label: [172, 280], text: "Sunset fishing"}};
const PLACE = {base: "fishriver", field: "fishlake", shore: "fishsea", hwoods: "fishpool", bay: "fishbay"};
// open: false hides a spot that's only there some of the time (the bay's sunset fishing, Friday 5 to 8)
export function fishSpotArt(scene, open = true){
  const a = AT[scene]; if (!a || !open) return "";
  const {x, y} = a, s = a.side;
  const post = `<rect x="${x - 2}" y="${y - 30}" width="4" height="30" rx="1" style="fill:#A8754F"/><path d="M${x - 11} ${y - 30} q11 -8 22 0 q-11 8 -22 0z" style="fill:#9FC0C8"/><path d="M${x + 11*s} ${y - 30} l${4*s} -4 v8z" style="fill:#9FC0C8"/>`;
  const lines = `<rect x="${x - 2}" y="${y - 30}" width="4" height="30" rx="1"/><path d="M${x - 11} ${y - 30} q11 -8 22 0 q-11 8 -22 0z M${x + 11*s} ${y - 30} l${4*s} -4 v8z"/><circle cx="${x - 6*s}" cy="${y - 31}" r=".8"/>`;
  const bucket = `<path d="M${x - 16*s - 5} ${y - 9} h10 l-1.4 9 h-7.2z" style="fill:#BFD3E2"/>`, bl = `<path d="M${x - 16*s - 5} ${y - 9} h10 l-1.4 9 h-7.2z M${x - 16*s - 5} ${y - 9} q5 -6 10 0"/>`;
  return `<g data-place="${PLACE[scene]}" aria-label="Fishing spot"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="26" ry="8" style="fill:var(--butter)"/>${sk(post + bucket, lines + bl)}${tapeLabel(a.label[0], a.label[1], a.text || "Fishing", a.text ? "#F6D3B4" : "#DCEBF6", 9)}</g>`;
}
// up to three golden koi drifting round the home pond (round 100)
export function koiArt(n){
  if (!n) return "";
  const P = [[372, 566, 0], [418, 576, 1.3], [446, 560, 2.6]];
  return `<g pointer-events="none" filter="url(#wob)">${P.slice(0, n).map(([x, y, d]) => `<g transform="translate(${x} ${y})"><g class="koi" style="animation-delay:-${d}s"><path d="M-7 0 q7 -5 13 0 q-6 5 -13 0z M6 0 l5 -3 v6z" style="fill:#F3B23A;stroke:var(--line)" stroke-width=".8"/><circle cx="-1" cy="-1" r="1.4" style="fill:#FFFDF6"/></g></g>`).join("")}</g>`;
}
