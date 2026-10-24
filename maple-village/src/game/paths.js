// Walking around things outdoors: Mel goes round buildings, the pond, the garden fence and so on instead of
// straight through them. Each outdoor scene has a list of blocked rectangles; a coarse grid of open points is
// searched with A*, then the route is pulled tight so she walks in natural straight runs.
import { TOWN_OBST } from "../data/towns.js";
const OBST = {
  village: [[100, 40, 240, 172], [322, 64, 438, 168], [27, 246, 143, 350], [377, 380, 493, 484],
    [334, 304, 390, 336], [178, 368, 214, 404], [230, 284, 290, 326], [314, 548, 354, 568], [62, 436, 118, 476]],
  vineyard: [[52, 126, 172, 226], [318, 80, 462, 212], [58, 388, 122, 440], [228, 200, 272, 252]],
  lowervine: [[64, 262, 156, 358]],   // round 261: the old press (the stream's crossed by the footbridge)
  green: [[58, 420, 242, 520], [322, 110, 438, 256], [40, 112, 166, 198], [174, 124, 244, 190]],   // pond, bandstand, allotments, shed
  stables: [[194, 116, 446, 232], [18, 128, 150, 230], [154, 192, 198, 224], [230, 380, 500, 600], [32, 452, 188, 548], [56, 386, 106, 416]],
  lighthouse: [[0, 0, 62, 320], [0, 320, 75, 440], [0, 440, 55, 550], [0, 550, 110, 640], [110, 592, 520, 640], [52, 340, 176, 500], [295, 176, 483, 232], [394, 400, 466, 490]],
  flowers: [[462, 454, 514, 494], [0, 262, 30, 640]],
  orchard: [[64, 96, 200, 222], [350, 156, 480, 236]],
  field: [[80, 220, 340, 340], [326, 290, 400, 430], [346, 430, 400, 640]],
  shore: [[290, 120, 432, 212], [330, 364, 472, 456], [196, 446, 236, 474]],
  lane: [[85, 150, 205, 254], [322, 160, 438, 264], [106, 450, 214, 526], [308, 450, 416, 526]],
  hlane: [[50, 140, 170, 264], [50, 310, 170, 434], [280, 136, 396, 260], [280, 310, 396, 434], [430, 200, 490, 340], [172, 394, 224, 436], [396, 446, 476, 494], [166, 228, 192, 260]],
  hwoods: [[190, 92, 340, 186], [188, 196, 336, 248], [364, 186, 474, 282], [432, 372, 492, 494], [84, 522, 180, 554], [420, 0, 520, 116]],
  hfarm: [[30, 110, 180, 238], [326, 104, 476, 242], [188, 156, 312, 244], [52, 334, 218, 472], [302, 334, 468, 472], [96, 512, 164, 554], [194, 570, 252, 596]],
  base: [[198, 176, 322, 294], [314, 232, 348, 294], [394, 198, 470, 272], [50, 262, 98, 306], [32, 396, 184, 480],
    [336, 534, 480, 598], [300, 540, 336, 554], [36, 494, 184, 594]]
};
Object.assign(OBST, TOWN_OBST);   // the towns' screens (towns.js)
// round 235 (Mel: she and Evan could walk on the sea): the bay's water. The deck stands out over it, so that stays open.
// A tap out on the water walks you to the water's edge instead.
const WATER = {bay: [[0, 0, 154, 308], [0, 428, 154, 640], [0, 308, 100, 428]]};
for (const [k, w] of Object.entries(WATER)) OBST[k] = [...(OBST[k] || []), ...w];
export function offWater(scene, x, y){
  const r = (WATER[scene] || []).find(r => x > r[0] - 6 && x < r[2] + 6 && y > r[1] - 6 && y < r[3] + 6);
  return r ? [r[2] + 8, y] : [x, y];
}
const PAD = 5, STEP = 24;
const inside = (x, y, r, p) => x > r[0] - p && x < r[2] + p && y > r[1] - p && y < r[3] + p;
export const blocked = (scene, x, y) => (OBST[scene] || []).some(r => inside(x, y, r, 0));
// round 228: extra things Tomo's delivery bike mustn't ride through (screens with no walking obstacles of their own):
// the bay's sea, the deck, the Scoop Shack and the shopfront next door, the trees
const RIDE = {
  hwoods: [[0, 60, 200, 112], [128, 100, 204, 200], [88, 190, 172, 300], [48, 290, 132, 400], [22, 390, 98, 500], [0, 490, 64, 640]],   // round 230: the river
  vineyard: [[0, 0, 32, 640]], lane: [[0, 0, 28, 640], [94, 388, 228, 452], [292, 400, 432, 452]],   // the stream down the left; the cottage roofs
  bay: [[0, 0, 156, 640], [104, 308, 248, 428], [296, 60, 474, 304], [312, 380, 480, 520], [270, 60, 330, 150], [470, 60, 520, 150], [370, 556, 520, 640]]};
export const rideBlocked = (scene, x, y) => blocked(scene, x, y) || (RIDE[scene] || []).some(r => inside(x, y, r, 0));

// Obstacles that already contain an end point (a door tucked against a wall) don't count for that segment.
function clear(obs, a, b){
  const skip = obs.filter(r => inside(a[0], a[1], r, PAD) || inside(b[0], b[1], r, PAD));
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(d/5));
  for (let i = 1; i < n; i++) { const t = i/n, x = a[0] + (b[0] - a[0])*t, y = a[1] + (b[1] - a[1])*t;
    for (const r of obs) if (!skip.includes(r) && inside(x, y, r, PAD)) return false; }
  return true;
}
const grids = {};
function grid(scene, b){
  const key = scene + b.join(",");
  if (grids[key]) return grids[key];
  const obs = OBST[scene], pts = [];
  for (let y = b[1]; y <= b[3]; y += STEP) for (let x = b[0]; x <= b[2]; x += STEP) if (!obs.some(r => inside(x, y, r, PAD + 2))) pts.push([x, y]);
  const nb = pts.map((p, i) => pts.map((q, j) => j !== i && Math.abs(q[0] - p[0]) <= STEP && Math.abs(q[1] - p[1]) <= STEP && clear(obs, p, q) ? j : -1).filter(j => j >= 0));
  return (grids[key] = {pts, nb});
}
// -> list of waypoints ending at `to` (never includes `from`)
export function findPath(scene, from, to, bounds){
  const obs = OBST[scene];
  if (!obs || clear(obs, from, to)) return [to];
  const {pts, nb} = grid(scene, bounds), dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const near = p => pts.map((q, i) => [i, dist(p, q)]).filter(([, d]) => d < STEP*3).sort((a, b) => a[1] - b[1]).filter(([i]) => clear(obs, p, pts[i])).slice(0, 6);
  const starts = near(from), ends = new Map(near(to).map(([i, d]) => [i, d]));
  if (!starts.length || !ends.size) return [to];
  const g = new Map(), prev = new Map(), open = new Set();
  starts.forEach(([i, d]) => { g.set(i, d); open.add(i); });
  let best = null, bestCost = Infinity;
  while (open.size) {
    let cur = null, cf = Infinity;
    for (const i of open) { const f = g.get(i) + dist(pts[i], to); if (f < cf) { cf = f; cur = i; } }
    if (cf >= bestCost) break;
    open.delete(cur);
    if (ends.has(cur)) { const c = g.get(cur) + ends.get(cur); if (c < bestCost) { bestCost = c; best = cur; } }
    for (const j of nb[cur]) { const c = g.get(cur) + dist(pts[cur], pts[j]); if (c < (g.get(j) ?? Infinity)) { g.set(j, c); prev.set(j, cur); open.add(j); } }
  }
  if (best == null) return [to];
  const raw = [to]; for (let i = best; i != null; i = prev.get(i)) raw.unshift(pts[i]);
  // pull the route tight: from each point, jump to the furthest point still in a clear straight line
  const out = []; let at = from, k = 0;
  while (k < raw.length) { let j = raw.length - 1; while (j > k && !clear(obs, at, raw[j])) j--; out.push(raw[j]); at = raw[j]; k = j + 1; }
  return out;
}
