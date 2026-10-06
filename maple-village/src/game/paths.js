// Walking around things outdoors: Mel goes round buildings, the pond, the garden fence and so on instead of
// straight through them. Each outdoor scene has a list of blocked rectangles; a coarse grid of open points is
// searched with A*, then the route is pulled tight so she walks in natural straight runs.
const OBST = {
  village: [[100, 40, 240, 172], [322, 64, 438, 168], [27, 246, 143, 350], [377, 380, 493, 484],
    [334, 304, 390, 336], [178, 368, 214, 404], [230, 284, 290, 326], [314, 548, 354, 568], [62, 436, 118, 476]],
  vineyard: [[52, 126, 172, 226], [318, 80, 462, 212], [58, 388, 122, 440], [228, 200, 272, 252]],
  orchard: [[64, 96, 200, 222], [350, 156, 480, 236]],
  flowers: [[16, 454, 68, 494]],
  lane: [[85, 150, 205, 254], [322, 160, 438, 264], [106, 450, 214, 526], [308, 450, 416, 526]],
  base: [[198, 176, 322, 294], [314, 232, 348, 294], [394, 198, 470, 272], [50, 262, 98, 306], [32, 396, 184, 480],
    [336, 534, 480, 598], [300, 540, 336, 554], [36, 494, 184, 594]]
};
const PAD = 5, STEP = 24;
const inside = (x, y, r, p) => x > r[0] - p && x < r[2] + p && y > r[1] - p && y < r[3] + p;
export const blocked = (scene, x, y) => (OBST[scene] || []).some(r => inside(x, y, r, 0));

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
