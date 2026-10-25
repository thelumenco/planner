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
// Round 295 (Mel: "Go ahead with round 2"): four secret recipes found by trying things together at the mixing table,
// like the bonbon table (berry tarts, pear and honey cake, honey and oat bread, a Priory Red fruit loaf with a bottle
// from the wine shop's shelf); hot cross buns for Easter and mince pies for Christmas; a busier shop while the cricket,
// the band or the car boot are on; farmhouse loaves sent to the wine shop kitchen's larder; Tomo's delivery bike
// taking bags of bakes round; and a pastry box of six to give.
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";
import { xmasOn } from "./tours.js";
import { cricketNow, bandNow, bootNow } from "./south.js";
import { bikeOwned, DELIVERY, deliveryHours } from "./scoop.js";
import { kitchenState } from "./kitchen.js";

export const OPEN = 7*60, CLOSE = 17*60, PROVE = 60, BAKE = 30, TRAY = 6, PROOF_SLOTS = 3, FLOUR = 3, OATS = 2, BOX = 6, BAKE_DELIV = .03;
const now = () => Date.now() + (globalThis.__mapleOffset || 0);
const M = 60e3;
// recipe -> ingredients (an id, or "cheese"/"herb" for any of a kind) and the price of one
export const RECIPES = {
  loaf: {n: "Farmhouse loaf", one: "farmhouse loaf", price: 5, needs: {flour: 2, milk: 1}, col: "#C98A4A", say: "Still warm. The crust crackles when you squeeze it."},
  croissant: {n: "Butter croissants", one: "butter croissant", price: 6, needs: {flour: 2, butter: 2, egg: 1}, col: "#E3A857", say: "Flaky, buttery, a hundred layers. Crumbs everywhere."},
  cinnabun: {n: "Cinnamon buns", one: "cinnamon bun", price: 5, needs: {flour: 2, butter: 1, sp_cinnamon: 1, honey: 1}, col: "#B8743E", say: "Sticky with honey, swirled with cinnamon. Lick your fingers."},
  turnover: {n: "Apple turnovers", one: "apple turnover", price: 5, needs: {flour: 1, butter: 1, apple: 3}, col: "#E8B86A", say: "Golden pastry, hot apple inside. Careful, it's lava."},
  scone: {n: "Cheese scones", one: "cheese scone", price: 5, needs: {flour: 2, butter: 1, milk: 1, cheese: 1}, col: "#E6C27A", say: "Crumbly and savoury, with your own cheese melted through."},
  focaccia: {n: "Sage focaccia", one: "slab of focaccia", price: 6, needs: {flour: 2, oliveoil: 1, herb: 1}, col: "#D9B060", say: "Dimpled, glossy with your mill's oil, herbs pressed into the top."},
  // round 295: found at the table by trying (secret), and two for their seasons
  berrytart: {n: "Berry tarts", one: "berry tart", price: 6, needs: {flour: 1, butter: 1, berry: 3}, col: "#C8506A", secret: true, pastry: true, clue: "Summer berries in a thin buttery crust.", say: "A crisp little tart heaped with berries, glossy on top."},
  pearcake: {n: "Pear and honey cake", one: "slice of pear and honey cake", price: 7, needs: {flour: 2, egg: 1, pear: 2, honey: 1}, col: "#D8B26A", secret: true, pastry: true, clue: "Pears, honey and an egg, folded into flour.", say: "Soft and golden, with slices of pear sunk into the top."},
  oatbread: {n: "Honey and oat bread", one: "honey and oat loaf", price: 6, needs: {flour: 1, oats: 2, milk: 1, honey: 1}, col: "#C9A06A", secret: true, clue: "Oats soaked in milk, sweetened with honey, and a little flour to hold it.", say: "Nutty and a little sweet, oats scattered over the crust."},
  prioryloaf: {n: "Priory Red fruit loaf", one: "slice of Priory Red fruit loaf", price: 8, needs: {flour: 2, cherry: 2, priory: 1}, col: "#6E2A3E", secret: true, clue: "The brothers' fruit bread: cherries, soaked in a splash of their own red.", say: "Dark and rich, the cherries soaked in Priory Red. The brothers would approve."},
  hotcross: {n: "Hot cross buns", one: "hot cross bun", price: 5, needs: {flour: 2, butter: 1, sp_cinnamon: 1, orange: 1}, col: "#C98A4A", season: "easter", pastry: true, say: "Spiced and sticky, with a cross on top. Best toasted, with butter."},
  mincepie: {n: "Mince pies", one: "mince pie", price: 6, needs: {flour: 1, butter: 1, apple: 2, orange: 1, sp_cinnamon: 1}, col: "#B8743E", season: "xmas", pastry: true, say: "A star on the lid and spiced fruit inside. It's Christmas now, officially."}
};
["croissant", "cinnabun", "turnover", "scone"].forEach(r => { RECIPES[r].pastry = true; });
const ANY = {cheese: id => id === "cheese" || /^chz_/.test(id), herb: id => id === "sage" || id === "rosemary", berry: id => ["strawberry", "raspberry", "blueberry"].includes(id)};
const ANY_N = {cheese: "any cheese", herb: "sage or rosemary", berry: "berries", flour: "flour", milk: "milk", butter: "butter", egg: "egg", sp_cinnamon: "cinnamon", honey: "honey", apple: "apples", oliveoil: "olive oil",
  oats: "oats", pear: "pears", cherry: "cherries", orange: "orange", priory: "bottle of Priory Red"};
// Easter Sunday (the Gregorian computus) -> "YYYY-MM-DD"; hot cross buns from a fortnight before to Easter Monday
export function easterOf(y){ const a = y % 19, b = Math.floor(y/100), c = y % 100, d = Math.floor(b/4), e = b % 4, f = Math.floor((b + 8)/25), g = Math.floor((b - f + 1)/3), h = (19*a + b - d - g + 15) % 30, i = Math.floor(c/4), k = c % 4, l = (32 + 2*e + 2*i - h - k) % 7, m = Math.floor((a + 11*h + 22*l)/451), mo = Math.floor((h + l - 7*m + 114)/31), da = (h + l - 7*m + 114) % 31 + 1;
  return `${y}-${String(mo).padStart(2, "0")}-${String(da).padStart(2, "0")}`; }
export const easterOn = day => { const e = Date.parse(easterOf(+day.slice(0, 4)) + "T00:00:00Z"), t = Date.parse(day + "T00:00:00Z"); return t >= e - 14*864e5 && t <= e + 864e5; };
export const seasonOn = (r, day) => { const s = RECIPES[r].season; return !s || (s === "easter" ? easterOn(day) : xmasOn(day)); };
// the ones on the mixing table today: the six, the secrets she's found, and whatever's in season
export const onTable = (F, day = dayKey()) => Object.keys(RECIPES).filter(r => (!RECIPES[r].secret || bakeryState(F).known[r]) && seasonOn(r, day));
export const itemOf = r => "bk_" + r;
// the baked goods as items, to eat or give (a present for any of the family)
Object.entries(RECIPES).forEach(([r, x]) => { ITEMS[itemOf(r)] = {n: x.one.charAt(0).toUpperCase() + x.one.slice(1), kind: "gift", to: "family", sell: 2, say: x.say}; });
ITEMS.oats = {n: "Bag of oats", kind: "ingredient", sell: 1, what: "from the sacks at the bakehouse, 2 coins a bag"};
ITEMS.bk_box = {n: "Pastry box", kind: "gift", to: "family", sell: 12, say: "A whole box of pastries! Who's putting the kettle on?"};
ITEMS.butter = {n: "Pat of butter", kind: "ingredient", sell: 2, what: "churned at the bakehouse from two milk: for croissants, buns, turnovers and scones"};

export const bakeryState = F => { const b = F.bakery = F.bakery || {}; for (const [k, v] of Object.entries({stock: {}, proof: [], oven: null, rack: [], tin: 0, sold: 0, lastTick: 0, day: "", today: 0, known: {}, pick: [], deliv: {day: "", n: 0}})) if (b[k] === undefined) b[k] = v; return b; };
// "priory" is a bottle of Priory Red off the wine shop's shelf; everything else comes from the backpack
const priory = F => ((F.vine && F.vine.shelf) || []).filter(x => x.type === "priory" && x.n > 0);
const have = (F, id) => id === "priory" ? priory(F).reduce((a, x) => a + x.n, 0) : (F.inv || {})[id] || 0;
const take = (F, id, n) => { if (id === "priory") { for (const x of priory(F)) { const k = Math.min(n, x.n); x.n -= k; n -= k; if (!n) break; } return; } F.inv[id] -= n; if (F.inv[id] <= 0) delete F.inv[id]; };
// which item covers an ingredient (for "cheese" and "herb", whichever she has most of)
const pickFor = (F, k) => ANY[k] ? Object.keys(F.inv || {}).filter(id => ANY[k](id) && F.inv[id] > 0).sort((a, b) => F.inv[b] - F.inv[a])[0] || null : k;
// how many of a kind (all the berries, cheeses or herbs together), and using them up, most-of first
const haveK = (F, k) => ANY[k] ? Object.keys(F.inv || {}).filter(id => ANY[k](id)).reduce((a, id) => a + (F.inv[id] || 0), 0) : have(F, k);
const takeK = (F, k, n) => { if (!ANY[k]) return take(F, k, n); while (n > 0) { const id = pickFor(F, k); if (!id) return; const m = Math.min(n, F.inv[id]); take(F, id, m); n -= m; } };
export function missing(F, r){
  const need = RECIPES[r].needs, out = [];
  for (const [k, n] of Object.entries(need)) { const got = haveK(F, k); if (got < n) out.push(`${n - got} ${ANY_N[k] || (ITEMS[k] ? ITEMS[k].n.toLowerCase() : k)}`); }
  return out;
}
export function mix(F, r, at = now()){
  const b = bakeryState(F), x = RECIPES[r]; if (!x || !onTable(F).includes(r)) return null;
  if (b.proof.length >= PROOF_SLOTS) return {line: "The proving shelf's full: three trays rising already. Bake one first."};
  const miss = missing(F, r); if (miss.length) return {line: `For ${x.n.toLowerCase()} you still need ${miss.join(", ")}.`};
  for (const [k, n] of Object.entries(x.needs)) takeK(F, k, n);
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
export function buyFlour(F, what = "flour"){
  const cost = what === "oats" ? OATS : FLOUR, nm = what === "oats" ? "oats" : "flour";
  if ((F.coins || 0) < cost) return {line: `A bag of ${nm} is ${cost} coins.`};
  F.coins -= cost; F.inv = F.inv || {}; F.inv[what] = (F.inv[what] || 0) + 1; return {ok: true, line: `A bag of ${nm}, off the stack.`};
}

/* ---------- round 295: trying something new at the table ---------- */
// what she can put on the table: one of each kind she has (berries, cheese and herbs count as one kind each)
export const TRY_KINDS = ["flour", "oats", "milk", "butter", "egg", "honey", "sp_cinnamon", "apple", "pear", "cherry", "berry", "orange", "cheese", "herb", "oliveoil", "priory"];
export const tryable = F => TRY_KINDS.filter(k => haveK(F, k) > 0);
export function togglePick(F, k){
  const b = bakeryState(F); if (!TRY_KINDS.includes(k)) return;
  b.pick = b.pick.includes(k) ? b.pick.filter(x => x !== k) : [...b.pick, k].slice(-5);
}
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
const NOPE = ["You fold it all together and it just won't come right. You put everything back, no harm done.", "Hmm. It's a sort of grey paste. Juniper would call it 'brave'. Everything goes back on the shelf.", "Nearly something, but not quite. You tip it back and wipe the table down."];
export function tryBake(F, at = now()){
  const b = bakeryState(F), pk = b.pick.filter(k => tryable(F).includes(k)); if (pk.length < 2) return {line: "Pick two or more things to try together."};
  const r = Object.keys(RECIPES).find(id => !RECIPES[id].season && sameSet(Object.keys(RECIPES[id].needs), pk));
  if (!r) return {line: NOPE[Math.floor(Math.random()*NOPE.length)]};
  const x = RECIPES[r];
  if (!x.secret || b.known[r]) return {line: `That's a ${x.one}: it's on your list already.`};
  const miss = missing(F, r); if (miss.length) return {line: `Ooh, that's nearly something! It wants a bit more, though: ${miss.join(", ")}.`};
  b.known[r] = at; b.pick = [];
  const m = mix(F, r, at);
  return {ok: true, found: r, line: `${x.n}! You write it on a card and pin it above the table. ${m && m.ok ? "The first tray's onto the proving shelf." : "The proving shelf's full, so the first tray will have to wait."}`};
}

/* ---------- round 295: loaves for the kitchen, the pastry box ---------- */
export function sendLoaves(F){
  const b = bakeryState(F), n = b.stock.loaf || 0; if (!n || !F.vine) return null;
  const k = kitchenState(F); k.larder.loaf = (k.larder.loaf || 0) + n; delete b.stock.loaf;
  return {ok: true, n, line: `${n} farmhouse loa${n > 1 ? "ves" : "f"} in a basket, off to the wine shop kitchen's larder. Pilar will be pleased.`};
}
export const pastryCount = b => Object.keys(b.stock).filter(r => RECIPES[r] && RECIPES[r].pastry).reduce((a, r) => a + b.stock[r], 0);
// six pastries off the shelves, as many different ones as there are
export function packBox(F){
  const b = bakeryState(F); if (pastryCount(b) < BOX) return null;
  for (let n = 0; n < BOX;) for (const r of Object.keys(b.stock).filter(r => RECIPES[r] && RECIPES[r].pastry && b.stock[r] > 0).sort((p, q) => b.stock[q] - b.stock[p])) { if (n >= BOX) break; b.stock[r]--; n++; }
  Object.keys(b.stock).forEach(r => { if (!b.stock[r]) delete b.stock[r]; });
  F.inv = F.inv || {}; F.inv.bk_box = (F.inv.bk_box || 0) + 1; return {ok: true, line: "Six pastries into a white box, tied with string. A present for someone."};
}
export function takeOne(F, r){
  const b = bakeryState(F); if (!(b.stock[r] > 0)) return null;
  b.stock[r]--; F.inv = F.inv || {}; F.inv[itemOf(r)] = (F.inv[itemOf(r)] || 0) + 1; return {ok: true, line: `One ${RECIPES[r].one}, wrapped in paper, into your backpack.`};
}
export function collectTin(F){ const b = bakeryState(F), c = b.tin; if (!c) return null; b.tin = 0; F.coins = (F.coins || 0) + c; return c; }
export const openNow = hm => hm >= OPEN && hm < CLOSE;
export const shelfCount = b => Object.values(b.stock).reduce((a, n) => a + n, 0);

// one thing off the shelves, more likely whatever there's most of -> its recipe
function sellOne(b){
  const ids = Object.keys(b.stock).filter(r => b.stock[r] > 0 && RECIPES[r]), tot = ids.reduce((a, r) => a + b.stock[r], 0); let x = Math.random()*tot, r = ids[0];
  for (const id of ids) { if (x < b.stock[id]) { r = id; break; } x -= b.stock[id]; }
  b.stock[r]--; b.sold++; return r;
}
const plural = one => /^(slice|slab) of /.test(one) ? one.replace(/^(slice|slab)/, "$1s") : /loaf$/.test(one) ? one.replace(/loaf$/, "loaves") : one + "s";
const WORDS = ["", "a", "two", "three"];
export const bagOf = got => { const c = {}; got.forEach(r => { c[r] = (c[r] || 0) + 1; }); const bits = Object.entries(c).map(([r, n]) => `${WORDS[n] || n} ${n > 1 ? plural(RECIPES[r].one) : RECIPES[r].one}`);
  return bits.length > 1 ? bits.slice(0, -1).join(", ") + " and " + bits[bits.length - 1] : bits[0]; };
// minutes since the last tick: the oven, and customers in opening hours. opts.serving: Mel's behind the counter
export function bakeryTick(F, opts = {}){
  const b = bakeryState(F), t = now(); if (!b.lastTick) b.lastTick = t;
  const mins = Math.min(1440, Math.floor((t - b.lastTick)/M)), out = {mins, coins: 0, tin: 0, n: 0, baked: null}; if (mins < 1) return out;
  b.lastTick += mins*M; const bike = opts.bike ?? bikeOwned(F);
  for (let k = mins; k > 0; k--) {
    const at = t - k*M, d = new Date(at + 8*36e5), hm = d.getUTCHours()*60 + d.getUTCMinutes(), we = [0, 6].includes(d.getUTCDay()), day = d.toISOString().slice(0, 10);
    if (b.oven && at - b.oven.at >= BAKE*M) { b.rack.push(b.oven.r); out.baked = b.oven.r; b.oven = null; }
    if (!openNow(hm)) continue;
    if (b.day !== day) { b.day = day; b.today = 0; }
    if (!shelfCount(b)) continue;
    // round 295: Tomo on the bike, with a bag of bakes for someone's door (the money in the tin)
    if (bike && deliveryHours(hm) && Math.random() < BAKE_DELIV) { const got = [];
      for (let j = 0; j < 3 && shelfCount(b); j++) { const r = sellOne(b); got.push(r); }
      const coins = got.reduce((a, r) => a + RECIPES[r].price, 0) + DELIVERY.fee; b.tin += coins; out.tin += coins; b.today += coins; out.n += got.length;
      if (b.deliv.day !== day) b.deliv = {day, n: 0}; b.deliv.n++; (out.orders = out.orders || []).push({shop: "bakery", coins, what: bagOf(got)}); continue; }
    // the busy times: mornings, weekends, and while the cricket, the band or the car boot are on (round 295)
    const crowd = cricketNow(day, hm) || bandNow(day, hm) || bootNow(day, hm) ? 1.6 : easterOn(day) || xmasOn(day) ? 1.2 : 1;
    const p = (hm < 11*60 ? 1/6 : 1/14)*(we ? 1.5 : 1)*crowd*(opts.serving && k === 1 ? 2 : 1);
    if (Math.random() >= p) continue;
    const r = sellOne(b); b.today += RECIPES[r].price; out.n++;
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
    + `<ul class="hlist wlist">${onTable(F).map(r => { const x = RECIPES[r], miss = missing(F, r), tag = x.season ? (x.season === "easter" ? " (for Easter)" : " (for Christmas)") : x.secret ? " (your own)" : "";
      return `<li><span class="wpic">${icon(itemOf(r), 28)}</span><span class="wtxt"><b>${esc(x.n)}${tag}</b><small>${esc(needLine(r))}${miss.length ? ` · still need ${esc(miss.join(", "))}` : ""}</small></span><button class="btn small ${miss.length ? "alt" : "primary"}" data-bk="mix:${r}"${miss.length || b.proof.length >= PROOF_SLOTS ? " disabled" : ""}>Mix</button></li>`; }).join("")}</ul>`
    + `<div class="actions"><button class="btn alt" data-bk="view:try">Try something new</button></div>` + close;
  if (view === "try") { const ks = tryable(F), left = Object.keys(RECIPES).filter(r => RECIPES[r].secret && !b.known[r]);
    return head("Try something new", "Put a few things on the table together and see what comes of it. If it doesn't work, it all goes back.")
      + (ks.length ? `<div class="vbtns">${ks.map(k => `<button class="btn small ${b.pick.includes(k) ? "primary" : "alt"}" data-bk="pick:${k}" aria-pressed="${b.pick.includes(k)}">${esc(ANY_N[k] || k)}</button>`).join("")}</div>` : `<p class="muted">Nothing to bake with in your backpack.</p>`)
      + `<div class="actions"><button class="btn primary" data-bk="try"${b.pick.filter(k => ks.includes(k)).length < 2 ? " disabled" : ""}>Mix it and see</button><button class="btn alt small" data-bk="view:mix">Back to the recipes</button></div>`
      + (left.length ? `<p class="eyebrow">Pencilled in the margin of the old baker's book</p><ul class="hlist">${left.map(r => `<li><span class="wtxt"><small>${esc(RECIPES[r].clue)}</small></span></li>`).join("")}</ul>` : `<p class="muted">You've found every recipe in the old baker's book.</p>`) + close; }
  if (view === "proof") return head("The proving shelf", "Trays of dough under cloths, rising for an hour.")
    + (b.proof.length ? `<ul class="hlist wlist">${b.proof.map(d => `<li><span class="wtxt"><b>${esc(RECIPES[d.r].n)}</b><small>${proved(d, at) ? "Risen. Ready for the oven." : `rising: ${hrs(PROVE*M - (at - d.at))} to go`}</small></span></li>`).join("")}</ul>` : `<p class="muted">Empty. Mix something at the table.</p>`)
    + `<div class="actions"><button class="btn primary" data-bk="bake"${b.oven || !b.proof.some(d => proved(d, at)) ? " disabled" : ""}>Into the oven</button></div>` + close;
  if (view === "oven") return head("The wood oven", b.oven ? `${RECIPES[b.oven.r].n} inside: ${hrs(BAKE*M - (at - b.oven.at))} to go. It comes out onto the rack on its own.` : "Hot and waiting.")
    + `<div class="actions"><button class="btn primary" data-bk="bake"${b.oven || !b.proof.some(d => proved(d, at)) ? " disabled" : ""}>Bake the next risen tray</button></div>` + close;
  if (view === "rack") return head("The cooling rack", b.rack.length ? b.rack.map(r => RECIPES[r].n).join(", ") + ", cooling." : "Empty for now.")
    + `<div class="actions"><button class="btn primary" data-bk="carry"${b.rack.length ? "" : " disabled"}>Carry through to the shop</button></div>` + close;
  if (view === "churn") return head("The butter churn", `Two milk make a pat of butter. You have ${have(F, "milk")} milk and ${have(F, "butter")} butter.`)
    + `<div class="actions"><button class="btn primary" data-bk="churn"${have(F, "milk") < 2 ? " disabled" : ""}>Churn some butter</button></div>` + close;
  if (view === "flour") return head("Flour and oat sacks", `Flour ${FLOUR} coins a bag, same as Hana's; oats ${OATS}. You have ${have(F, "flour")} flour and ${have(F, "oats")} oats.`)
    + `<div class="actions"><button class="btn primary" data-bk="flour"${(F.coins || 0) < FLOUR ? " disabled" : ""}>Buy a bag of flour (${FLOUR} coins)</button><button class="btn alt" data-bk="flour:oats"${(F.coins || 0) < OATS ? " disabled" : ""}>Buy a bag of oats (${OATS} coins)</button></div>` + close;
  if (view === "shelves") { const ids = Object.keys(RECIPES).filter(r => b.stock[r] > 0);
    return head("The bread shelves", ids.length ? "Take one to eat, or to give." : "Empty. Bake something and carry it through.")
      + (ids.length ? `<ul class="hlist wlist">${ids.map(r => `<li><span class="wpic">${icon(itemOf(r), 28)}</span><span class="wtxt"><b>${esc(RECIPES[r].n)}</b><small>${b.stock[r]} on the shelf · ${RECIPES[r].price} coins each</small></span><button class="btn small alt" data-bk="take:${r}">Take one</button></li>`).join("")}</ul>` : "")
      + (ids.length ? `<div class="actions"><button class="btn alt" data-bk="box"${pastryCount(b) < BOX ? " disabled" : ""}>Pack a pastry box (${BOX} pastries)</button>${F.vine && b.stock.loaf ? `<button class="btn alt" data-bk="loaves">Send ${b.stock.loaf} loa${b.stock.loaf > 1 ? "ves" : "f"} to the wine shop kitchen</button>` : ""}</div>` : "") + close; }
  if (view === "counter") return head(esc(opts.name || "The Honeybrook Bakehouse"), `${openNow(hm) ? "Open till 5." : "Closed: open 7am to 5pm."} ${shelfCount(b)} things on the shelves. Customers come most in the mornings, at weekends and when something's on at the green; while you're behind the counter, twice as often.`)
    + `<p class="sub">The honesty tin: <b>${b.tin}</b> coins. Today so far: ${b.day === dayKey() ? b.today : 0} coins${bikeOwned(F) && b.deliv.day === dayKey() && b.deliv.n ? `, with ${b.deliv.n} order${b.deliv.n > 1 ? "s" : ""} out on Tomo's bike` : ""}.</p><div class="actions"><button class="btn primary" data-bk="tin"${b.tin ? "" : " disabled"}>Empty the tin</button></div>` + close;
  return "";
}
