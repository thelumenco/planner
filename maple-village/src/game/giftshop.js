// The gift shop behind the wine shop (round 178, Mel: "a gift shop... a display case of bonbons, shelves of whatever was
// produced in the mill... it sells from the same stock lah"). Inspired by a Yarra Valley cellar door with tea, cheese,
// chocolates and a gift corner. A goal (800 coins), through a new door in the wine shop's bottom-left corner. Posy keeps
// it, 10 to 6, every day but Monday. Everything on its shelves is shared stock: the Cocoa Room's display case and bar
// wall, the mill's shelves, the wine shop's bottles. A sale here is one fewer there.
// State: F.gift = {sold: {day: {n, coins, bonbon, bar, mill, wine}}}
import { esc } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";

export const GIFT_HOURS = {from: 10*60, to: 18*60, closed: [1]};
export const giftState = F => { F.gift = F.gift || {}; F.gift.sold = F.gift.sold || {}; return F.gift; };
const dowOf = day => new Date(day + "T00:00:00Z").getUTCDay();
export const keeperOn = (day, hm) => hm >= GIFT_HOURS.from && hm < GIFT_HOURS.to && !GIFT_HOURS.closed.includes(dowOf(day));
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;

// what's on the shelves right now, from the other shops: c = cocoaState(F) or null, store = the mill's (craftState(F).store), v = vineState(F)
export function stockOf(o){
  const c = o.cocoa, bon = c ? (o.onDisplay(c) || []).filter(b => c.trays[b.id] > 0) : [], bars = c ? Object.keys(c.bars).filter(k => c.bars[k] > 0) : [];
  const mill = Object.keys(o.store || {}).filter(id => o.store[id] > 0 && ITEMS[id]), wine = ((o.v || {}).shelf || []).filter(b => b.n > 0);
  return {bon, bars, mill, wine};
}
// one minute of trade: mode "mel" (she's at the till), "keeper" (Posy's in), else shut -> coins
export function giftSellMinute(F, day, hm, mode, o){
  if (!mode) return 0; const p = mode === "mel" ? .08 : .05; if (Math.random() >= p) return 0;
  const s = stockOf(o), kinds = [s.bon.length && "bonbon", s.bars.length && "bar", s.mill.length && "mill", s.wine.length && "wine"].filter(Boolean); if (!kinds.length) return 0;
  const k = kinds[Math.floor(Math.random()*kinds.length)], any = a => a[Math.floor(Math.random()*a.length)]; let coins = 0;
  if (k === "bonbon") { const b = any(s.bon), n = Math.min(c2(o).trays[b.id], 2 + Math.floor(Math.random()*3)); o.cocoa.trays[b.id] -= n; coins = n*o.cocoa.prices.bonbon; }
  else if (k === "bar") { const kk = any(s.bars); o.cocoa.bars[kk]--; coins = o.cocoa.prices.bar; }
  else if (k === "mill") { const id = any(s.mill); o.store[id]--; if (!o.store[id]) delete o.store[id]; coins = ITEMS[id].price; }
  else { const b = any(s.wine); b.n--; coins = b.price; }
  const t = giftState(F).sold[day] = giftState(F).sold[day] || {n: 0, coins: 0}; t.n++; t.coins += coins; t[k] = (t[k] || 0) + 1; return coins;
}
const c2 = o => o.cocoa;

const PANEL = {
  gcase: o => { const s = stockOf(o); return `<h2>The bonbon case</h2><p class="sub">A little glass case on the counter end, filled from the Cocoa Room's own display: the same trays, so what sells here is gone there too.${o.cocoa ? ` ${o.cocoa.prices.bonbon} coins a bonbon.` : ""}</p>`
    + (!o.cocoa ? `<p class="muted">Empty: there's no Cocoa Room to fill it from yet.</p>` : s.bon.length ? `<ul class="hlist wlist">${s.bon.map(b => `<li><span class="wtxt"><b>${esc(b.name)}</b><small>${o.cocoa.trays[b.id]} left in the trays</small></span></li>`).join("")}</ul>` : `<p class="muted">Nothing in the Cocoa Room's display case right now. Make a tray at the bonbon table.</p>`); },
  gbars: o => { const s = stockOf(o); return `<h2>The chocolate shelf</h2><p class="sub">Bars from the Cocoa Room's wall, stood up in a row.${o.cocoa ? ` ${o.cocoa.prices.bar} coins a bar.` : ""}</p>`
    + (!o.cocoa ? `<p class="muted">Empty: no Cocoa Room yet.</p>` : s.bars.length ? `<ul class="hlist wlist">${s.bars.map(k => `<li><span class="wpic">${icon("bar_" + k, 26)}</span><span class="wtxt"><b>${esc(k[0].toUpperCase() + k.slice(1))} chocolate</b><small>${o.cocoa.bars[k]} on the wall</small></span></li>`).join("")}</ul>` : `<p class="muted">The bar wall's bare. Mateo moulds more on his shifts.</p>`); },
  gmill: o => { const s = stockOf(o); return `<h2>From the mill</h2><p class="sub">Oils, soaps and lotions, off the same shelves as the mill.</p>`
    + (s.mill.length ? `<ul class="hlist wlist">${s.mill.map(id => `<li><span class="wpic">${icon(ITEMS[id].ico || id, 26)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${o.store[id]} on the shelves · ${ITEMS[id].price} each</small></span></li>`).join("")}</ul>` : `<p class="muted">Nothing on the mill's shelves just now. Make some at the workbench upstairs at the mill.</p>`); },
  gwine: o => { const s = stockOf(o); return `<h2>The wine corner</h2><p class="sub">A few of your bottles, from the wine shop's own shelves, for people who want one to take home.</p>`
    + (s.wine.length ? `<ul class="hlist wlist">${s.wine.map(b => `<li><span class="wtxt"><b>${esc(b.name)}</b><small>${b.n} on the shelves · ${b.price} each</small></span></li>`).join("")}</ul>` : `<p class="muted">The wine shelves are empty.</p>`); }
};
export function giftPanel(F, spot, o){
  const day = o.day, t = giftState(F).sold[day] || {n: 0, coins: 0};
  if (PANEL[spot]) return `<span class="tape gingham" aria-hidden="true"></span>` + PANEL[spot](o) + shut;
  // the till
  const open = keeperOn(day, o.hm);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The gift shop</h2><p class="sub">${o.here ? "You're behind the till. People browse longer when you're chatting." : o.keeper ? `Posy's at the till, rearranging the bonbon case for the third time today.` : open ? "Nobody's at the till." : "Shut for now: Posy opens 10 till 6, every day but Monday. Stand behind the till yourself and it's open."}</p>
    <p class="muted">${t.n ? `Sold today: ${t.n}, for ${t.coins} coins (${["bonbon", "bar", "mill", "wine"].filter(k => t[k]).map(k => `${t[k]} ${{bonbon: "bonbon boxes", bar: "bars", mill: "from the mill", wine: "bottles"}[k]}`).join(", ")}).` : "Nothing sold yet today."} Everything here is shared stock: the Cocoa Room's display case and bar wall, the mill's shelves, the wine shop's bottles.</p>` + shut;
}
