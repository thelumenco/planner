// The bin (round 231, the creator: "there's no trash button... I kept collecting keepsakes and there was nowhere to throw
// something away. A trash button, with an undo, and a trash tab to go back and retrieve it. Otherwise it gets deleted
// after 24 hours."). From the backpack, one thing at a time goes in the bin; it waits there for a day, when it can be
// taken back, and then it's gone. Tools (the pet's brush, ball and yarn) never go in the bin.
// State: F.bin = [{id, at}] (one entry per thing thrown away, oldest first)
import { ITEMS } from "../data/items.js";

export const BIN_KEEP = 24*3600e3;
export const binnable = id => !!(ITEMS[id] && ITEMS[id].kind !== "tool");
const list = F => (F.bin = Array.isArray(F.bin) ? F.bin : []);
// anything thrown away more than a day ago is gone for good
export function purgeBin(F, now = Date.now()){ const b = list(F), keep = b.filter(e => now - e.at < BIN_KEEP && ITEMS[e.id]); if (keep.length !== b.length) F.bin = keep; return F.bin; }
// one of id from the backpack into the bin -> the bin entry, or null
export function binItem(F, id, now = Date.now()){
  if (!binnable(id) || !((F.inv || {})[id] > 0)) return null;
  F.inv[id]--; if (F.inv[id] <= 0) delete F.inv[id];
  const e = {id, at: now}; list(F).push(e); return e;
}
// take the newest one of id back out of the bin -> true, or false
export function unbin(F, id, now = Date.now()){
  const b = purgeBin(F, now); for (let i = b.length - 1; i >= 0; i--) if (b[i].id === id) { b.splice(i, 1); F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1; return true; }
  return false;
}
// what's in the bin, by thing: [{id, n, left (ms until the oldest one of it goes)}], newest first
export function binContents(F, now = Date.now()){
  const by = {}; purgeBin(F, now).forEach(e => { const r = by[e.id] = by[e.id] || {id: e.id, n: 0, first: e.at, last: e.at}; r.n++; r.first = Math.min(r.first, e.at); r.last = Math.max(r.last, e.at); });
  return Object.values(by).sort((a, b) => b.last - a.last).map(r => ({id: r.id, n: r.n, left: r.first + BIN_KEEP - now}));
}
