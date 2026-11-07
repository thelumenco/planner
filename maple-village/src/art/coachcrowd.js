// The coach party you can see (round 317, Mel: "When the coach ... comes in, do I get a lot more people? On the terrace
// as well because not enough room in the winery itself"). A coach party (game/happen.js) used to triple a shop's sales
// for two hours and nothing more; now its visitors are drawn. They arrive over the first twelve minutes, fill the shop
// first, then spill out (the winery's overflow sits out on the terrace, or waits by the door if there's no terrace yet;
// the bay's queue runs out of the Scoop Shack and onto the deck), and drift away over the last quarter of an hour.
// Drawn into the scene art (static figures, no taps). The coach itself parks in the vineyard's open ground.
import { personArt } from "./people.js";

const SKIN = ["#F2D3B8", "#E8C4A0", "#D9A877", "#B9835A", "#8A5A3C", "#F6DCC6"];
const HAIR = ["#2F2B28", "#5A3A26", "#B5562E", "#D9B36A", "#8A8279", "#E8E1D6", "#3B2A20"];
const TOP = ["#6E9FD6", "#E8899A", "#F3C969", "#7FB86A", "#C9A6E0", "#F08A5C", "#5E8C8A", "#FFFDF6", "#D9534F"];
const BOTTOM = ["#5E5A55", "#3E4E6B", "#C9B48E", "#6B5444", "#2F2B28"];
const STYLES = ["short", "long", "bun", "bob", "curly", "short", "long"];
// a stable stranger for each seat, so the same people stay put between redraws
function look(seed, extra){
  const r = i => { const x = Math.sin(seed*97.13 + i*13.7)*43758.5453; return x - Math.floor(x); };
  const p = a => a[Math.floor(r(a.length)*a.length) % a.length];
  const l = {skin: p(SKIN), hair: p(HAIR), hairStyle: p(STYLES), top: p(TOP), bottom: p(BOTTOM)};
  if (extra) l.extra = extra; else if (r(9) < .25) l.extra = "camera";
  if (r(11) < .2) l.hat = "sunhat";
  return l;
}
// where they go, in scene units: [x, y, sit?, faces (1 right, -1 left)]; the shop queues start a step back from the
// counter (Mel: "Some people are under the counter in the shop")
export const CROWD_AT = {
  wineshop: [[70, 432], [120, 448], [178, 430], [228, 456], [302, 448], [352, 432], [406, 452], [456, 434], [92, 548], [190, 540], [338, 540], [450, 548]].map(([x, y], i) => [x, y, false, i % 2 ? -1 : 1]),
  terrace: [...[329, 373, 417, 461, 505, 549].map(y => [214, y + 12, true, 1]), ...[329, 373, 417, 461, 505, 549].map(y => [306, y + 12, true, -1])],
  vineyard: [[350, 262, false, 1], [392, 270, false, -1], [434, 258, false, -1], [312, 280, false, 1], [462, 284, false, -1], [372, 296, false, 1]],   // waiting by the wine shop's door (no terrace yet)
  scoopshop: [[232, 404, false, 1], [272, 408, false, -1], [312, 404, false, 1], [352, 408, false, -1], [204, 454, false, 1], [254, 458, false, 1], [306, 454, false, -1], [362, 458, false, -1], [412, 454, false, -1], [92, 506, true, 1], [150, 506, true, -1], [386, 506, true, 1], [444, 506, true, -1]],
  cocoa: [[238, 404, false, 1], [278, 408, false, -1], [318, 404, false, 1], [358, 408, false, -1], [214, 454, false, 1], [266, 458, false, 1], [318, 454, false, -1], [372, 458, false, -1], [92, 506, true, 1], [150, 506, true, -1], [386, 506, true, 1], [444, 506, true, -1]],
  bay: [[382, 290, false, -1], [362, 302, false, -1], [342, 314, false, -1], [322, 326, false, -1], [302, 338, false, -1], [284, 352, false, -1], [138, 338, true, 1], [226, 360, true, -1], [186, 414, true, 1], [148, 400, true, 1]]
};
// which rooms fill, in order, for each place the coach goes
export const CROWD_ORDER = {vineyard: ["wineshop", "terrace"], bay: ["scoopshop", "cocoa", "bay"]};
// how full the place is: 0 before and after, rising over 12 minutes, falling over the last 15
export function crowdLevel(win, hm){
  if (!win) return 0; const [a, b] = win;
  if (hm < a || hm >= b) return 0; if (hm < a + 12) return (hm - a + 1)/12; if (hm >= b - 15) return (b - hm)/15; return 1;
}
// how many people are in each room right now: rooms fill in order; with no terrace, the winery's overflow waits outside
export function crowdSplit(place, level, o = {}){
  const rooms = CROWD_ORDER[place] || [], out = {};
  const use = rooms.map(r => r === "terrace" && !o.terrace ? "vineyard" : r).filter(r => r !== "cocoa" || o.cocoa);
  const total = use.reduce((a, r) => a + CROWD_AT[r].length, 0); let left = Math.round(total*level);
  use.forEach(r => { const n = Math.min(left, CROWD_AT[r].length); out[r] = n; left -= n; });
  return out;
}
// the people in one room, back to front
export function crowdArt(room, n, seed = 1){
  const at = (CROWD_AT[room] || []).slice(0, n), extra = room === "wineshop" || room === "terrace" || room === "vineyard" ? "wineglass" : room === "scoopshop" || room === "bay" ? "cone" : null;
  return at.map((p, i) => ({p, i})).sort((a, b) => a.p[1] - b.p[1]).map(({p: [x, y, sit, dir], i}) =>
    `<g class="ch npc crowd${sit ? " act-sit" : ""}" transform="translate(${x} ${y})" pointer-events="none"><g transform="scale(${dir} 1)">${personArt(look(seed*31 + i*7 + room.length, i % 3 === 2 ? null : extra), false)}</g></g>`).join("");
}
// the coach, parked on the open ground by the stall
export function coachArt(x = 60, y = 456){
  const L = `stroke="#3b3530" stroke-width="1.4" stroke-linejoin="round"`;
  return `<g class="coach" pointer-events="none" transform="translate(${x} ${y})"><ellipse cx="62" cy="50" rx="64" ry="6" fill="#00000018"/>
    <rect x="0" y="0" width="124" height="44" rx="9" fill="#FFFDF6" ${L}/><rect x="0" y="26" width="124" height="9" fill="#5E8C8A"/><path d="M0 26 H124 M0 35 H124" ${L} fill="none"/>
    ${[10, 32, 54, 76].map(wx => `<rect x="${wx}" y="6" width="18" height="15" rx="3" fill="#BFD8E2" ${L}/>`).join("")}<rect x="100" y="6" width="18" height="30" rx="3" fill="#BFD8E2" ${L}/>
    <text x="50" y="33" text-anchor="middle" font-family="Klee One,serif" font-size="7" font-weight="700" fill="#FFFDF6">HOLIDAY TOURS</text>
    ${[24, 98].map(cx => `<circle cx="${cx}" cy="44" r="8" fill="#3b3530"/><circle cx="${cx}" cy="44" r="3.4" fill="#C9C2B6"/>`).join("")}</g>`;
}
