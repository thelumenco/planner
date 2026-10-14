// Shoppers you can see (round 181: browsing customers at the gift shop and mill shop too). The
// Cocoa Room and the gift shop always sold in the background, with nobody walking in; now a shopper comes through the
// door every so often while the shop's open: looks at the case, looks at the shelf, goes to the counter, and walks out
// with a little paper bag. If the shelves are bare they look, shrug, and leave empty-handed (a hint to restock).
// Never more than a pair at once, to keep the screen calm. The mill's upstairs shop has its own visitors (millcraft.js).
import { hash } from "../util.js";

const VISIT = 14, EVERY = 25;   // a visit takes 14 minutes; one may start every 25 (so visits never overlap)
export const BROWSE = {
  cocoa: {door: [300, 586], look: [[430, 362], [130, 330], [380, 350], [170, 340]], till: [[300, 410], [258, 418]]},
  giftshop: {door: [478, 476], look: [[120, 330], [262, 330], [414, 330], [180, 520]], till: [[300, 540], [256, 548]]}
};
// the visits on a day for one shop, during its open hours [from, to): [{from, ids, look, look2}]
export function browseVisits(shop, day, from, to, pool){
  const out = [];
  for (let t = from + 5, k = 0; t + VISIT <= to; t += EVERY, k++) {
    const h = hash(shop + day + k); if (h % 10 >= 6) continue;   // about three windows in five
    const n = h % 7 === 0 ? 2 : 1, ids = []; for (let i = 0; ids.length < n && i < pool.length; i++) { const id = pool[(h + i*5) % pool.length]; if (!ids.includes(id)) ids.push(id); }
    out.push({from: t, ids, look: h % 4, look2: (h >> 3) % 4});
  }
  return out;
}
// where one person is: walk in, look, look again, the counter, out with a bag (stock) or without (none) -> slot or null
export function browseSlot(id, day, hm, o){
  const sh = BROWSE[o.shop]; if (!sh || !o.open) return null;
  const v = browseVisits(o.shop, day, o.from, o.to, o.pool).find(x => x.ids.includes(id) && hm >= x.from && hm < x.from + VISIT); if (!v) return null;
  const j = v.ids.indexOf(id), m = hm - v.from, base = {scene: o.shop, glide: true, browse: true};
  if (m < 1) return {...base, from: v.from, to: v.from + 1, at: sh.door};
  if (m < 6) return {...base, from: v.from + 1, to: v.from + 6, at: sh.look[(v.look + j) % sh.look.length], dir: -1};
  if (m < 10) return {...base, from: v.from + 6, to: v.from + 10, at: sh.look[(v.look2 + j + 1) % sh.look.length], dir: 1};
  if (!o.stock) return {...base, from: v.from + 10, to: v.from + VISIT, at: sh.door};   // nothing to buy: out they go
  if (m < 13) return {...base, from: v.from + 10, to: v.from + 13, at: sh.till[j % sh.till.length], dir: -1};
  return {...base, from: v.from + 13, to: v.from + VISIT, at: sh.door, act: "shopbag"};
}
