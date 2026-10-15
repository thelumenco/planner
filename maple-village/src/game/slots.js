// The three save slots (phase 5 of the public edition). The game always plays from the "fox.*" keys in this browser's
// storage; a slot that isn't being played is kept whole under "hb.slot.N" (every fox.* key except this device's own
// settings, which every slot shares). Switching puts the playing slot away, takes the chosen one out, and the page
// reloads into it. A save from before slots existed simply becomes slot 1.
export const SLOTS = 3;
const DEVICE = ["fox.sound", "fox.zoom"];   // sound and zoom belong to the device, not to a game
const isGame = k => k.startsWith("fox.") && !DEVICE.includes(k);
const ls = () => { try { return window.localStorage; } catch { return null; } };
export const activeSlot = () => { const n = +((ls() && ls().getItem("hb.active")) || 1); return n >= 1 && n <= SLOTS ? n : 1; };
const gameKeys = () => { const s = ls(); return s ? Object.keys(s).filter(isGame) : []; };
const pack = () => Object.fromEntries(gameKeys().map(k => [k, ls().getItem(k)]));
// the playing game's keys (and, in dev builds, the stand-in cloud's copies of them) cleared away
function clearPlaying(){ const s = ls(); if (!s) return; gameKeys().forEach(k => s.removeItem(k)); Object.keys(s).filter(k => k.startsWith("stub:")).forEach(k => s.removeItem(k)); }
const stored = n => { try { return JSON.parse(ls().getItem("hb.slot." + n)) || null; } catch { return null; } };
export const slotData = n => n === activeSlot() ? pack() : stored(n);

// what a slot card shows -> null for an empty slot (or one that never got past the setup card)
export function summary(n){
  const d = slotData(n); let f = null; try { f = d && d["fox.fox"] ? JSON.parse(d["fox.fox"]) : null; } catch {}
  if (!f || !f.me || !f.pet) return null;
  const h = Object.entries((f.board && f.board.hearts) || {}).sort((a, b) => b[1] - a[1])[0];
  return {name: f.me.name || "You", pet: f.pet, petName: f.name || "", days: f.days || 0, coins: f.coins || 0, best: h && h[1] > 0 ? {id: h[0], hearts: Math.min(5, h[1])} : null, at: f.updatedAt || 0};
}
// play another slot (empty or not): -> true when the page should reload into it
export function switchTo(n){
  const s = ls(), a = activeSlot(); if (!s || n === a || n < 1 || n > SLOTS) return false;
  s.setItem("hb.slot." + a, JSON.stringify(pack())); clearPlaying();
  Object.entries(stored(n) || {}).forEach(([k, v]) => s.setItem(k, v)); s.removeItem("hb.slot." + n);
  s.setItem("hb.active", String(n)); return true;
}
// delete a slot's game for good (the playing one too: its keys go, and it starts empty)
export function wipe(n){ const s = ls(); if (!s) return; if (n === activeSlot()) clearPlaying(); else s.removeItem("hb.slot." + n); }
