// The bin (round 255, Mel: "I've accumulated too many keepsakes. I want to be able to throw something but have it go
// into the bin that I can retrieve things from in case I threw by mistake. They stay in the bin for 24 hours, then
// disappear"). Anything in the backpack can be thrown away, one at a time; it waits in the bin for a day, and can be
// taken back out until then. State: F.bin = [{id, n, at}] (at: when it was thrown; one entry per item and minute).
export const BIN_KEEP = 24*3600e3;
export const binState = F => { F.bin = Array.isArray(F.bin) ? F.bin : []; return F.bin; };
// drop anything that's been in the bin a day or more
export function purgeBin(F, t = Date.now()){ const b = binState(F), keep = b.filter(e => e && e.n > 0 && t - e.at < BIN_KEEP); const gone = b.length - keep.length; F.bin = keep; return gone; }
// throw one (or n) of an item away -> true, or false if there's none in the backpack
export function throwAway(F, id, n = 1, t = Date.now()){
  const inv = F.inv || {}; n = Math.min(n, inv[id] || 0); if (n <= 0) return false;
  inv[id] -= n; if (inv[id] <= 0) delete inv[id];
  const b = binState(F), last = b.find(e => e.id === id && t - e.at < 60e3);
  if (last) { last.n += n; last.at = t; } else b.push({id, n, at: t});
  return true;
}
// take an entry back out of the bin, into the backpack -> the item id, or null
export function takeBack(F, i, t = Date.now()){
  purgeBin(F, t); const b = binState(F), e = b[i]; if (!e) return null;
  F.inv = F.inv || {}; F.inv[e.id] = (F.inv[e.id] || 0) + e.n; b.splice(i, 1); return e.id;
}
// how long until an entry's gone, as words
export const binLeft = (e, t = Date.now()) => { const ms = Math.max(0, e.at + BIN_KEEP - t), h = Math.floor(ms/3600e3);
  return h >= 1 ? `${h} hour${h === 1 ? "" : "s"} left` : `${Math.max(1, Math.ceil(ms/60e3))} min left`; };
