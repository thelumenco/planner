// The coach party you can see (round 317). A coach party (game/happen.js) used to triple a shop's sales
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
// where they go, in scene units: [x, y, sit?, faces (1 right, -1 left)]; round 320:
// never where a villager stands or sits (the tasting-room tables, the deck's bench, Marco by the wine shop door); the shop queues start a step back from the
// counter, so nobody stands under it
export const CROWD_AT = {
  wineshop: [[70, 432], [120, 448], [178, 430], [228, 456], [302, 448], [352, 432], [406, 452], [456, 434], [110, 604], [176, 612], [350, 612], [420, 604]].map(([x, y], i) => [x, y, false, i % 2 ? -1 : 1]),
  terrace: [...[329, 373, 417, 461, 505, 549].map(y => [214, y + 12, true, 1]), ...[329, 373, 417, 461, 505, 549].map(y => [306, y + 12, true, -1])],
  vineyard: [[350, 262, false, 1], [420, 302, false, -1], [434, 258, false, -1], [312, 280, false, 1], [462, 284, false, -1], [372, 296, false, 1]],   // waiting by the wine shop's door (no terrace yet)
  scoopshop: [[232, 404, false, 1], [272, 408, false, -1], [312, 404, false, 1], [352, 408, false, -1], [204, 454, false, 1], [254, 458, false, 1], [306, 454, false, -1], [362, 458, false, -1], [412, 454, false, -1], [92, 506, true, 1], [150, 506, true, -1], [386, 506, true, 1], [444, 506, true, -1]],
  cocoa: [[238, 404, false, 1], [278, 408, false, -1], [318, 404, false, 1], [358, 408, false, -1], [214, 454, false, 1], [266, 458, false, 1], [318, 454, false, -1], [372, 458, false, -1], [92, 506, true, 1], [150, 506, true, -1], [386, 506, true, 1], [444, 506, true, -1]],
  giftshop: [[96, 322, false, 1], [150, 336, false, -1], [214, 320, false, 1], [268, 334, false, -1], [330, 322, false, 1], [408, 336, false, -1], [196, 404, false, 1], [228, 520, false, 1], [300, 532, false, -1], [440, 488, false, -1]],   // round 318: browsing the cases and the shelves
  bay: [[382, 290, false, -1], [362, 302, false, -1], [342, 314, false, -1], [322, 326, false, -1], [302, 338, false, -1], [284, 352, false, -1], [138, 338, true, 1], [210, 404, true, -1], [186, 414, true, 1], [148, 400, true, 1]]
};
// which rooms fill, in order, for each place the coach goes
export const CROWD_ORDER = {vineyard: ["wineshop", "giftshop", "terrace"], bay: ["scoopshop", "cocoa", "bay"]};
// how full the place is: 0 before and after, rising over 12 minutes, falling over the last 15
export function crowdLevel(win, hm){
  if (!win) return 0; const [a, b] = win;
  if (hm < a || hm >= b) return 0; if (hm < a + 12) return (hm - a + 1)/12; if (hm >= b - 15) return (b - hm)/15; return 1;
}
// how many people are in each room right now: rooms fill in order; with no terrace, the winery's overflow waits outside
export function crowdSplit(place, level, o = {}){
  const rooms = CROWD_ORDER[place] || [], out = {};
  const use = rooms.map(r => r === "terrace" && !o.terrace ? "vineyard" : r).filter(r => (r !== "cocoa" || o.cocoa) && (r !== "giftshop" || o.gift));
  const total = use.reduce((a, r) => a + CROWD_AT[r].length, 0); let left = Math.round(total*level);
  use.forEach(r => { const n = Math.min(left, CROWD_AT[r].length); out[r] = n; left -= n; });
  return out;
}
// the people in one room, back to front. Round 318: tourists are excited, so standing ones bob and talk with their
// hands (or sip), now and then one hops with excitement; a few stroll about and back; seated ones sip and chat. Each
// gets its own timing (--d) so they don't move in step. core.js adds their chatter (CHAT) in little bubbles.
export function crowdArt(room, n, seed = 1){
  const at = (CROWD_AT[room] || []).slice(0, n), extra = room === "wineshop" || room === "terrace" || room === "vineyard" ? "wineglass" : room === "scoopshop" || room === "bay" ? "cone" : null;
  return at.map((p, i) => ({p, i})).sort((a, b) => a.p[1] - b.p[1]).map(({p: [x, y, sit, dir], i}) => {
    const lk = look(seed*31 + i*7 + room.length, i % 3 === 2 ? null : extra), d = `--d:-${((i*0.73 + seed*0.11) % 3).toFixed(2)}s`;
    const stroll = !sit && i % 6 === 1, hop = !sit && !stroll && i % 5 === 3, holds = lk.extra === "wineglass" || lk.extra === "cone" ? " holds" : "";   // round 319: fewer strollers; a hand holding a glass or a cone stays still
    if (stroll) return `<g class="ch npc crowd stroll${holds}" transform="translate(${x} ${y})" style="${d}" pointer-events="none"><g class="strollw">${personArt(lk, false)}</g></g>`;
    return `<g class="ch npc crowd${sit ? " act-sit" : ""}${hop ? " hop" : ""}${holds}" transform="translate(${x} ${y})" style="${d}" pointer-events="none"><g class="cb"><g transform="scale(${dir} 1)">${personArt(lk, false)}</g></g></g>`;
  }).join("");
}
// what they say (British spelling, no dashes), room by room
export const CHAT = {
  wineshop: ["Ooh, try the rosé!", "Cheers!", "Can we take a bottle home?", "This is gorgeous!", "Another glass?", "Smell that!", "Who's driving? Not me!"],
  terrace: ["Look at that view!", "Cheers, everyone!", "Photo! Squeeze in!", "Lavender for miles!", "I could stay all day.", "Pass the olives!", "To us!"],
  vineyard: ["Is it our turn yet?", "Look, real vines!", "Photo by the barrels!", "I can smell the grapes!"],
  giftshop: ["Perfect for my nan!", "Ooh, look at this!", "Can you wrap it?", "Handmade? Lovely!", "One for me, one for my sister."],
  scoopshop: ["Two scoops, please!", "What's the pink one?", "Ooh, a waffle cone!", "Best gelato ever!", "Can I try the mango?"],
  cocoa: ["Smell the chocolate!", "A box for Gran!", "Is that made here?", "Ooh, salted caramel!", "Just one more..."],
  bay: ["Ice cream by the sea!", "Look, a dolphin!", "Mind the drips!", "Is the queue moving?", "Photo on the deck!"]
};
export function chatBubble(x, y, text){
  const w = Math.round(text.length*5.3 + 16), cx = Math.max(w/2 + 4, Math.min(516 - w/2, x)), top = y - 92;
  return `<g class="crowdsay" pointer-events="none"><rect x="${(cx - w/2).toFixed(1)}" y="${top}" width="${w}" height="19" rx="9" fill="#FFFDF6" stroke="#3b3530" stroke-width="1"/><path d="M${x - 4} ${top + 19} l4 6 l4 -6" fill="#FFFDF6" stroke="#3b3530" stroke-width="1"/><rect x="${x - 4.5}" y="${top + 17.5}" width="9" height="2.5" fill="#FFFDF6"/><text x="${cx.toFixed(1)}" y="${top + 13}" text-anchor="middle" font-family="Klee One,serif" font-size="10" fill="#3b3530">${text}</text></g>`;
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
