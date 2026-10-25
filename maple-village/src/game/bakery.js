// The Honeybrook Bakehouse (round 294, Mel: "Own and run it, on the green"): Mel's own bakery in the old baker's shop
// in the top corner of Honeybrook Green (a big goal, goals.js "bakery"). Two rooms: the shop (bread shelves, the
// counter with its honesty tin, a window seat) and, through the door on its west wall, the bakehouse:
//   mix     at the mixing table, a recipe's ingredients make a tray of dough, onto the proving shelf (3 at a time)
//   prove   an hour on the shelf
//   bake    into the wood oven, one tray at a time: half an hour, then out onto the cooling rack on its own
//   carry   the cooled trays through to the shop shelves (6 a tray)
//   churn   two milk make a pat of butter at the churn; flour from the sacks (3 coins a bag, same as Hana's)
// The shop is open 7am to 5pm. Customers come most in the morning (7 to 11) and at weekends. With Mel behind the
// counter they come twice as often and pay her; otherwise they leave the money in the honesty tin, to collect.
// Mel can take one of anything off the shelves to eat or give. Nothing here comes cheap: every tray costs its flour,
// butter and the rest. State: F.bakery.
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";

export const OPEN = 7*60, CLOSE = 17*60, PROVE = 60, BAKE = 30, TRAY = 6, PROOF_SLOTS = 3, FLOUR = 3;
const now = () => Date.now() + (globalThis.__mapleOffset || 0);
const M = 60e3;
// recipe -> ingredients (an id, or "cheese"/"herb" for any of a kind) and the price of one
export const RECIPES = {
  loaf: {n: "Farmhouse loaf", one: "farmhouse loaf", price: 5, needs: {flour: 2, milk: 1}, col: "#C98A4A", say: "Still warm. The crust crackles when you squeeze it."},
  croissant: {n: "Butter croissants", one: "butter croissant", price: 6, needs: {flour: 2, butter: 2, egg: 1}, col: "#E3A857", say: "Flaky, buttery, a hundred layers. Crumbs everywhere."},
  cinnabun: {n: "Cinnamon buns", one: "cinnamon bun", price: 5, needs: {flour: 2, butter: 1, sp_cinnamon: 1, honey: 1}, col: "#B8743E", say: "Sticky with honey, swirled with cinnamon. Lick your fingers."},
  turnover: {n: "Apple turnovers", one: "apple turnover", price: 5, needs: {flour: 1, butter: 1, apple: 3}, col: "#E8B86A", say: "Golden pastry, hot apple inside. Careful, it's lava."},
  scone: {n: "Cheese scones", one: "cheese scone", price: 5, needs: {flour: 2, butter: 1, milk: 1, cheese: 1}, col: "#E6C27A", say: "Crumbly and savoury, with your own cheese melted through."},
  focaccia: {n: "Sage focaccia", one: "slab of focaccia", price: 6, needs: {flour: 2, oliveoil: 1, herb: 1}, col: "#D9B060", say: "Dimpled, glossy with your mill's oil, herbs pressed into the top."}
};
const ANY = {cheese: id => id === "cheese" || /^chz_/.test(id), herb: id => id === "sage" || id === "rosemary"};
const ANY_N = {cheese: "any cheese", herb: "sage or rosemary", flour: "flour", milk: "milk", butter: "butter", egg: "egg", sp_cinnamon: "cinnamon", honey: "honey", apple: "apples", oliveoil: "olive oil"};
export const itemOf = r => "bk_" + r;
// the baked goods as items, to eat or give (a present for any of the family)
Object.entries(RECIPES).forEach(([r, x]) => { ITEMS[itemOf(r)] = {n: x.one.charAt(0).toUpperCase() + x.one.slice(1), kind: "gift", to: "family", sell: 2, say: x.say}; });
ITEMS.butter = {n: "Pat of butter", kind: "ingredient", sell: 2, what: "churned at the bakehouse from two milk: for croissants, buns, turnovers and scones"};

export const bakeryState = F => { const b = F.bakery = F.bakery || {}; for (const [k, v] of Object.entries({stock: {}, proof: [], oven: null, rack: [], tin: 0, sold: 0, lastTick: 0, day: "", today: 0})) if (b[k] === undefined) b[k] = v; return b; };
const have = (F, id) => (F.inv || {})[id] || 0;
const take = (F, id, n) => { F.inv[id] -= n; if (F.inv[id] <= 0) delete F.inv[id]; };
// which item covers an ingredient (for "cheese" and "herb", whichever she has most of)
const pickFor = (F, k) => ANY[k] ? Object.keys(F.inv || {}).filter(id => ANY[k](id) && F.inv[id] > 0).sort((a, b) => F.inv[b] - F.inv[a])[0] || null : k;
export function missing(F, r){
  const need = RECIPES[r].needs, out = [];
  for (const [k, n] of Object.entries(need)) { const id = pickFor(F, k), got = id ? have(F, id) : 0; if (got < n) out.push(`${n - got} ${ANY_N[k] || (ITEMS[k] ? ITEMS[k].n.toLowerCase() : k)}`); }
  return out;
}
export function mix(F, r, at = now()){
  const b = bakeryState(F), x = RECIPES[r]; if (!x) return null;
  if (b.proof.length >= PROOF_SLOTS) return {line: "The proving shelf's full: three trays rising already. Bake one first."};
  const miss = missing(F, r); if (miss.length) return {line: `For ${x.n.toLowerCase()} you still need ${miss.join(", ")}.`};
  for (const [k, n] of Object.entries(x.needs)) take(F, pickFor(F, k), n);
  b.proof.push({r, at}); return {ok: true, line: `A tray of ${x.n.toLowerCase()}, shaped and onto the proving shelf under a cloth. An hour to rise.`};
}
export const proved = (d, at = now()) => at - d.at >= PROVE*M;
export function bake(F, at = now()){
  const b = bakeryState(F); if (b.oven) return {line: "The oven's busy. A little while yet."};
  const i = b.proof.findIndex(d => proved(d, at)); if (i < 0) return {line: b.proof.length ? "Nothing's risen enough yet. Give it time." : "Nothing on the proving shelf. Mix something first."};
  const [d] = b.proof.splice(i, 1); b.oven = {r: d.r, at}; return {ok: true, line: `Into the wood oven. ${RECIPES[d.r].n} in half an hour.`};
}
export function carry(F){
  const b = bakeryState(F); if (!b.rack.length) return {line: "The cooling rack's empty."};
  const n = b.rack.length; b.rack.forEach(r => { b.stock[r] = (b.stock[r] || 0) + TRAY; }); b.rack = [];
  return {ok: true, line: `${n} tray${n > 1 ? "s" : ""} carried through and onto the shelves. The whole shop smells of it.`};
}
export function churn(F){
  if (have(F, "milk") < 2) return {line: "The churn needs two milk for a pat of butter."};
  take(F, "milk", 2); F.inv.butter = (F.inv.butter || 0) + 1; return {ok: true, line: "Ten minutes of churning, and there it is: a pat of pale gold butter."};
}
export function buyFlour(F){
  if ((F.coins || 0) < FLOUR) return {line: `A bag of flour is ${FLOUR} coins.`};
  F.coins -= FLOUR; F.inv = F.inv || {}; F.inv.flour = (F.inv.flour || 0) + 1; return {ok: true, line: "A bag of flour, off the stack."};
}
export function takeOne(F, r){
  const b = bakeryState(F); if (!(b.stock[r] > 0)) return null;
  b.stock[r]--; F.inv = F.inv || {}; F.inv[itemOf(r)] = (F.inv[itemOf(r)] || 0) + 1; return {ok: true, line: `One ${RECIPES[r].one}, wrapped in paper, into your backpack.`};
}
export function collectTin(F){ const b = bakeryState(F), c = b.tin; if (!c) return null; b.tin = 0; F.coins = (F.coins || 0) + c; return c; }
export const openNow = hm => hm >= OPEN && hm < CLOSE;
export const shelfCount = b => Object.values(b.stock).reduce((a, n) => a + n, 0);

// minutes since the last tick: the oven, and customers in opening hours. opts.serving: Mel's behind the counter
export function bakeryTick(F, opts = {}){
  const b = bakeryState(F), t = now(); if (!b.lastTick) b.lastTick = t;
  const mins = Math.min(1440, Math.floor((t - b.lastTick)/M)), out = {mins, coins: 0, tin: 0, n: 0, baked: null}; if (mins < 1) return out;
  b.lastTick += mins*M;
  for (let k = mins; k > 0; k--) {
    const at = t - k*M, d = new Date(at + 8*36e5), hm = d.getUTCHours()*60 + d.getUTCMinutes(), we = [0, 6].includes(d.getUTCDay()), day = d.toISOString().slice(0, 10);
    if (b.oven && at - b.oven.at >= BAKE*M) { b.rack.push(b.oven.r); out.baked = b.oven.r; b.oven = null; }
    if (!openNow(hm)) continue;
    if (b.day !== day) { b.day = day; b.today = 0; }
    const p = (hm < 11*60 ? 1/6 : 1/14)*(we ? 1.5 : 1)*(opts.serving && k === 1 ? 2 : 1);
    const ids = Object.keys(b.stock).filter(r => b.stock[r] > 0 && RECIPES[r]); if (!ids.length || Math.random() >= p) continue;
    const tot = ids.reduce((a, r) => a + b.stock[r], 0); let x = Math.random()*tot, r = ids[0];
    for (const id of ids) { if (x < b.stock[id]) { r = id; break; } x -= b.stock[id]; }
    b.stock[r]--; b.sold++; b.today += RECIPES[r].price; out.n++;
    if (opts.serving && k === 1) { F.coins = (F.coins || 0) + RECIPES[r].price; out.coins += RECIPES[r].price; } else { b.tin += RECIPES[r].price; out.tin += RECIPES[r].price; }
  }
  return out;
}

/* ---------- panels ---------- */
const close = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const hrs = ms => { const m = Math.max(1, Math.ceil(ms/M)); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60 ? (m % 60) + "m" : ""}`.trim() : `${m} min`; };
const needLine = r => Object.entries(RECIPES[r].needs).map(([k, n]) => `${n} ${ANY_N[k] || (ITEMS[k] ? ITEMS[k].n.toLowerCase() : k)}`).join(", ");
export function bakeryPanel(F, view, opts = {}){
  const b = bakeryState(F), at = now(), hm = opts.hm || 0;
  const head = (t, s) => `<span class="tape gingham" aria-hidden="true"></span><h2>${t}</h2>${s ? `<p class="sub">${s}</p>` : ""}`;
  if (view === "mix") return head("The mixing table", `Flour on everything. A tray makes ${TRAY}. Proving shelf: ${b.proof.length} of ${PROOF_SLOTS}.`)
    + `<ul class="hlist wlist">${Object.entries(RECIPES).map(([r, x]) => { const miss = missing(F, r);
      return `<li><span class="wpic">${icon(itemOf(r), 28)}</span><span class="wtxt"><b>${esc(x.n)}</b><small>${esc(needLine(r))}${miss.length ? ` · still need ${esc(miss.join(", "))}` : ""}</small></span><button class="btn small ${miss.length ? "alt" : "primary"}" data-bk="mix:${r}"${miss.length || b.proof.length >= PROOF_SLOTS ? " disabled" : ""}>Mix</button></li>`; }).join("")}</ul>` + close;
  if (view === "proof") return head("The proving shelf", "Trays of dough under cloths, rising for an hour.")
    + (b.proof.length ? `<ul class="hlist wlist">${b.proof.map(d => `<li><span class="wtxt"><b>${esc(RECIPES[d.r].n)}</b><small>${proved(d, at) ? "Risen. Ready for the oven." : `rising: ${hrs(PROVE*M - (at - d.at))} to go`}</small></span></li>`).join("")}</ul>` : `<p class="muted">Empty. Mix something at the table.</p>`)
    + `<div class="actions"><button class="btn primary" data-bk="bake"${b.oven || !b.proof.some(d => proved(d, at)) ? " disabled" : ""}>Into the oven</button></div>` + close;
  if (view === "oven") return head("The wood oven", b.oven ? `${RECIPES[b.oven.r].n} inside: ${hrs(BAKE*M - (at - b.oven.at))} to go. It comes out onto the rack on its own.` : "Hot and waiting.")
    + `<div class="actions"><button class="btn primary" data-bk="bake"${b.oven || !b.proof.some(d => proved(d, at)) ? " disabled" : ""}>Bake the next risen tray</button></div>` + close;
  if (view === "rack") return head("The cooling rack", b.rack.length ? b.rack.map(r => RECIPES[r].n).join(", ") + ", cooling." : "Empty for now.")
    + `<div class="actions"><button class="btn primary" data-bk="carry"${b.rack.length ? "" : " disabled"}>Carry through to the shop</button></div>` + close;
  if (view === "churn") return head("The butter churn", `Two milk make a pat of butter. You have ${have(F, "milk")} milk and ${have(F, "butter")} butter.`)
    + `<div class="actions"><button class="btn primary" data-bk="churn"${have(F, "milk") < 2 ? " disabled" : ""}>Churn some butter</button></div>` + close;
  if (view === "flour") return head("Flour sacks", `${FLOUR} coins a bag, same as Hana's. You have ${have(F, "flour")}.`)
    + `<div class="actions"><button class="btn primary" data-bk="flour"${(F.coins || 0) < FLOUR ? " disabled" : ""}>Buy a bag of flour (${FLOUR} coins)</button></div>` + close;
  if (view === "shelves") { const ids = Object.keys(RECIPES).filter(r => b.stock[r] > 0);
    return head("The bread shelves", ids.length ? "Take one to eat, or to give." : "Empty. Bake something and carry it through.")
      + (ids.length ? `<ul class="hlist wlist">${ids.map(r => `<li><span class="wpic">${icon(itemOf(r), 28)}</span><span class="wtxt"><b>${esc(RECIPES[r].n)}</b><small>${b.stock[r]} on the shelf · ${RECIPES[r].price} coins each</small></span><button class="btn small alt" data-bk="take:${r}">Take one</button></li>`).join("")}</ul>` : "") + close; }
  if (view === "counter") return head(esc(opts.name || "The Honeybrook Bakehouse"), `${openNow(hm) ? "Open till 5." : "Closed: open 7am to 5pm."} ${shelfCount(b)} things on the shelves. Customers come most in the mornings and at weekends; while you're behind the counter, twice as often.`)
    + `<p class="sub">The honesty tin: <b>${b.tin}</b> coins. Today so far: ${b.day === dayKey() ? b.today : 0} coins.</p><div class="actions"><button class="btn primary" data-bk="tin"${b.tin ? "" : " disabled"}>Empty the tin</button></div>` + close;
  return "";
}
