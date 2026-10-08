// The Cocoa Room: Mel's chocolate shop on the bay (in the shopfront that was under renovation; opened as a big goal,
// goals.js "cocoa"). Mel makes everything herself, bean to bar:
//   beans   a sack of cacao beans from the sacks in the kitchen (10 coins a sack)
//   roast   a sack at a time in the roaster: ready in 10 minutes
//   grind   roasted beans in the stone grinder, as milk, dark or white chocolate: ready in 2 hours
//   temper  the ground pot on the marble slab: 30 pieces of chocolate, ready to use
//   mould   10 pieces make 10 bars in the moulds, onto the bar wall
//   bonbons a shell (6 pieces of milk, dark or white) and one or two fillings from the kitchen's fillings shelf make
//           a tray of 12 bonbons. Every new combination is a discovery with its own name; known ones make another tray.
//           Up to 6 flavours sit in the shop's display case (customers buy 2-4 at a time); Mel can have one, or pack a
//           gift box of 4 or 9 from what's on display.
// The shop is open 11am to 8pm, Tuesday to Sunday. Amara serves at the counter; customers buy bars off the wall (more
// often while Mel's serving too). Takings go straight to Mel. Mel can have a bar or take one to give.
import { esc, dayKey, sgHM, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { INGR, farmShelf } from "./scoop.js";

export const OPEN = 11*60, CLOSE = 20*60, ROAST_MIN = 10, GRIND_MIN = 120, POT = 30, MOULD = 10, SACK = 10;
export const KINDS = {milk: {n: "Milk chocolate", col: "#8A5A3A"}, dark: {n: "Dark chocolate", col: "#4A2E22"}, white: {n: "White chocolate", col: "#F3E7C9"}};
export const BAR_ID = k => "bar_" + k;
const now = () => Date.now() + (globalThis.__mapleOffset || 0);
export const openOn = (day, hm) => new Date(day + "T00:00:00Z").getUTCDay() !== 1 && hm >= OPEN && hm < CLOSE;

export function cocoaState(F){
  F.cocoa = F.cocoa || {};
  const c = F.cocoa;
  c.name = c.name || "The Cocoa Room"; c.beans = c.beans || 0; c.roasted = c.roasted || 0; c.roast = c.roast || null; c.grind = c.grind || null;
  c.ground = c.ground || null; c.choc = Object.assign({milk: 0, dark: 0, white: 0}, c.choc || {}); c.bars = Object.assign({milk: 0, dark: 0, white: 0}, c.bars || {});
  c.prices = Object.assign({bar: 6, bonbon: 3}, c.prices || {}); c.sold = c.sold || {}; c.made = c.made || 0;
  c.pantry = c.pantry || {}; c.bonbons = c.bonbons || []; c.trays = c.trays || {};
  return c;
}
const left = t => { const m = Math.max(0, Math.ceil((t - now())/60000)); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m} min`; };

/* ---------- making ---------- */
export function buyBeans(F, n = 1){ const c = cocoaState(F), cost = SACK*n; if (F.coins < cost) return false; F.coins -= cost; c.beans += n; return true; }
export function startRoast(F){ const c = cocoaState(F); if (c.roast || c.beans < 1) return false; c.beans--; c.roast = {done: now() + ROAST_MIN*60000}; return true; }
export function startGrind(F, kind){ const c = cocoaState(F); if (c.grind || c.ground || c.roasted < 1 || !KINDS[kind]) return false; c.roasted--; c.grind = {kind, done: now() + GRIND_MIN*60000}; return true; }
export function temper(F){ const c = cocoaState(F); if (!c.ground) return null; const k = c.ground; c.choc[k] += POT; c.ground = null; return k; }
export function mould(F, kind){ const c = cocoaState(F); if (!KINDS[kind] || c.choc[kind] < MOULD) return false; c.choc[kind] -= MOULD; c.bars[kind] += MOULD; c.made += MOULD; return true; }
// the timers finishing: roasted beans out of the roaster, a pot out of the grinder (waiting to be tempered)
function finish(c){
  const t = now(); let out = null;
  if (c.roast && t >= c.roast.done) { c.roasted++; c.roast = null; out = "roast"; }
  if (c.grind && t >= c.grind.done && !c.ground) { c.ground = c.grind.kind; c.grind = null; out = out || "grind"; }
  return out;
}

/* ---------- bonbons ---------- */
export const SHELL = 6, TRAY = 12, CASE = 6;
// what can go in a bonbon: the gelato fridge's ingredients, minus the savoury ones
const NOT_FILLING = ["milk", "egg", "olives", "corn", "carrot", "tomato"];
export const isFilling = id => id in INGR && !NOT_FILLING.includes(id);
export const fillName = id => INGR[id][0];
const STYLE = ["Truffle", "Bonbon", "Praline", "Ganache", "Heart"], POETIC = ["Jetty Sunset", "Lantern Night", "Ma Ma's Garden", "Sea Breeze", "First Light", "Golden Hour", "Low Tide", "Porch Swing", "Maple's Secret", "Night Market"];
const keyOf = (shell, fills) => [shell, ...[...new Set(fills)].sort()].join("+");
export function bonbonName(shell, fills){
  const f = [...new Set(fills)].sort(), h = hash(keyOf(shell, f)), style = STYLE[h % STYLE.length], sh = shell[0].toUpperCase() + shell.slice(1);
  if (f.length === 1) return `${sh} ${INGR[f[0]][1]} ${style}`;
  if (h % 3 === 0) return `${POETIC[h % POETIC.length]} ${style}`;
  return `${INGR[f[0]][1]} & ${INGR[f[1]][1]} ${style}`;
}
export const recipeOf = (c, id) => c.bonbons.find(b => b.id === id);
export const knownBonbon = (c, shell, fills) => recipeOf(c, keyOf(shell, fills));
export const canMakeBonbon = (c, shell, fills) => c.choc[shell] >= SHELL && fills.length >= 1 && fills.every(f => (c.pantry[f] || 0) >= 1);
// a tray of 12: discovers a new bonbon, or makes another tray of a known one
export function makeBonbons(F, shell, fills){
  const c = cocoaState(F); fills = [...new Set(fills)].filter(isFilling).slice(0, 2);
  if (!KINDS[shell] || !fills.length || !canMakeBonbon(c, shell, fills)) return null;
  c.choc[shell] -= SHELL; fills.forEach(f => { c.pantry[f]--; if (c.pantry[f] <= 0) delete c.pantry[f]; });
  let r = knownBonbon(c, shell, fills), isNew = false;
  if (!r) { isNew = true; r = {id: keyOf(shell, fills), shell, fills: [...fills].sort(), name: bonbonName(shell, fills), col: INGR[[...fills].sort()[0]][2], found: Date.now()}; c.bonbons.push(r);
    if (Array.isArray(c.display) && c.display.length < CASE) c.display = [...c.display, r.id]; }
  c.trays[r.id] = (c.trays[r.id] || 0) + TRAY;
  return {r, isNew};
}
// the display case: up to 6 flavours (auto-filled from stock until Mel arranges it)
export const displayIds = c => (Array.isArray(c.display) ? c.display.filter(id => recipeOf(c, id)) : c.bonbons.filter(b => c.trays[b.id] > 0).map(b => b.id)).slice(0, CASE);
export const onDisplay = c => displayIds(c).map(id => recipeOf(c, id)).filter(b => c.trays[b.id] > 0);
export function toggleDisplay(c, id){
  const ids = displayIds(c); if (!recipeOf(c, id)) return false;
  if (ids.includes(id)) { c.display = ids.filter(x => x !== id); return true; }
  if (ids.length >= CASE) return false; c.display = [...ids, id]; return true;
}
// the fillings shelf, stocked from the backpack or Ma Ma's farm shop shelves (like the gelato fridge)
export const backpackFillings = F => Object.keys(F.inv || {}).filter(id => isFilling(id) && F.inv[id] > 0);
export const farmFillings = orch => farmShelf(orch).filter(isFilling);
export function stockPantry(F, id, n, from, orch){
  const c = cocoaState(F); if (!isFilling(id)) return 0;
  if (from === "bag") { n = Math.min(n, (F.inv || {})[id] || 0); if (n <= 0) return 0; F.inv[id] -= n; if (F.inv[id] <= 0) delete F.inv[id]; }
  else { const key = id.startsWith("fl_") ? "stem:" + id.slice(3) : id; n = Math.min(n, orch.stock[key] || 0); if (n <= 0) return 0; orch.stock[key] -= n; if (orch.stock[key] <= 0) delete orch.stock[key]; }
  c.pantry[id] = (c.pantry[id] || 0) + n; return n;
}
// gift boxes from what's on display: 4 or 9 bonbons, packed in turn from each flavour. All dark shells (dairy-free)
// makes a box Marcus can have too
export function packBox(F, size){
  const c = cocoaState(F), shown = onDisplay(c), have = shown.reduce((a, b) => a + c.trays[b.id], 0); if (have < size) return null;
  let i = 0, dark = true; for (let k = 0; k < size; i++) { const b = shown[i % shown.length]; if (!(c.trays[b.id] > 0)) continue; c.trays[b.id]--; if (b.shell !== "dark") dark = false; k++; if (i > 200) break; }
  const id = `box${size}${dark ? "d" : ""}`; F.inv[id] = (F.inv[id] || 0) + 1; return id;
}
export function eatBonbon(F, id){ const c = cocoaState(F), b = recipeOf(c, id); if (!b || !(c.trays[id] > 0)) return null; c.trays[id]--; return b; }

/* ---------- selling ---------- */
// catch up minute by minute (at most two days): customers buy a bar or two of whatever's on the wall
export function cocoaTick(F, opts = {}){
  const c = cocoaState(F), t = now(), from = Math.max(c.at || t, t - 2*864e5), out = {coins: 0, n: 0, mins: 0, done: finish(c)};
  for (let at = from + 60000; at <= t; at += 60000) {
    const sg = new Date(at + 8*3600e3), day = sg.toISOString().slice(0, 10), hm = sg.getUTCHours()*60 + sg.getUTCMinutes();
    out.mins++;
    if (!openOn(day, hm)) continue;
    const stocked = Object.keys(KINDS).filter(k => c.bars[k] > 0), shown = onDisplay(c); if (!stocked.length && !shown.length) continue;
    const d = sg.getUTCDay(), we = d === 0 || d === 6, pf = Math.pow(6/Math.max(2, c.prices.bar), 1.3);
    if (Math.random() >= .03*(we ? 1.4 : 1)*(hm >= 15*60 && hm < 18*60 ? 1.2 : 1)*(opts.serving ? 1.5 : 1)*pf) continue;
    const s = c.sold[day] = c.sold[day] || {n: 0, coins: 0, bonbons: 0};
    if (shown.length && (!stocked.length || Math.random() < .5)) {   // a few bonbons from the display case
      const b = shown[Math.floor(Math.random()*shown.length)], n = Math.min(c.trays[b.id], 2 + Math.floor(Math.random()*3)), coins = n*c.prices.bonbon;
      c.trays[b.id] -= n; s.bonbons = (s.bonbons || 0) + n; s.coins += coins; out.coins += coins; out.bonbons = (out.bonbons || 0) + n; continue; }
    const k = stocked[Math.floor(Math.random()*stocked.length)], n = Math.min(c.bars[k], Math.random() < .3 ? 2 : 1);
    c.bars[k] -= n; const coins = n*c.prices.bar; s.n += n; s.coins += coins; out.coins += coins; out.n += n;
  }
  c.at = from + out.mins*60000; if (out.coins) F.coins += out.coins;
  return out;
}
// a bar for Mel: eaten now, or into the backpack to give (a gift item, bar_<kind>)
export function takeBar(F, kind, give){ const c = cocoaState(F); if (!(c.bars[kind] > 0)) return false; c.bars[kind]--; if (give) F.inv[BAR_ID(kind)] = (F.inv[BAR_ID(kind)] || 0) + 1; return true; }

/* ---------- panels ---------- */
const coin = () => icon("coin", 13), shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const dot = c => `<span class="gdot" style="background:${c}"></span>`;
export function counterPanel(F, st){
  const c = cocoaState(F), day = dayKey(), hm = sgHM(), t = c.sold[day] || {n: 0, coins: 0};
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(c.name)}</h2><p class="sub">${openOn(day, hm) ? "Open till 8pm." : "Closed: open 11am to 8pm, Tuesday to Sunday."} ${t.n || t.bonbons ? `Sold today: ${t.n} bar${t.n === 1 ? "" : "s"}${t.bonbons ? ` and ${t.bonbons} bonbon${t.bonbons === 1 ? "" : "s"}` : ""} (${t.coins} ${coin()}).` : "Nothing sold yet today."}${st.server ? " Amara's behind the counter." : ""}</p>`;
  h += `<ul class="hlist wlist">${Object.entries(KINDS).map(([k, d]) => `<li><span class="wpic">${icon(BAR_ID(k), 26)}</span><span class="wtxt"><b>${d.n} bars</b><small>${c.bars[k]} on the wall · ${c.prices.bar} ${coin()} each</small></span><span class="orbtns"><button class="btn small primary" data-cc="eat" data-k="${k}" ${c.bars[k] ? "" : "disabled"}>Have one</button><button class="btn small alt" data-cc="give" data-k="${k}" ${c.bars[k] ? "" : "disabled"}>To give</button></span></li>`).join("")}</ul>`;
  h += `<div class="row gprices"><span>Price of a bar</span><span class="gstep"><button class="btn small alt" data-cc="price" data-n="-1" aria-label="Cheaper">−</button><b>${c.prices.bar}</b><button class="btn small alt" data-cc="price" data-n="1" aria-label="Dearer">+</button></span></div>`;
  h += `<form class="row hadd" data-ccname="1"><label class="sr" for="ccName">Shop name</label><input id="ccName" maxlength="30" value="${esc(c.name)}"><button class="btn small alt">Rename</button></form>`;
  return h + counterBonbons(F) + `<p class="muted">Yours are free. Tap a bonbon to have one. Customers buy bars and bonbons while the shop's open, more often while you're here.</p>` + shut;
}
export function barWallPanel(F){
  const c = cocoaState(F);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The bar wall</h2><p class="sub">Wrapped bars, ready to sell. ${c.made} made so far.</p>
    <ul class="hlist wlist">${Object.entries(KINDS).map(([k, d]) => `<li><span class="wpic">${icon(BAR_ID(k), 26)}</span><span class="wtxt"><b>${d.n}</b><small>${c.bars[k]} bars</small></span></li>`).join("")}</ul>
    <p class="muted">${Object.values(c.bars).some(n => n) ? "Make more in the kitchen when it runs low." : "Empty! Beans to bars happens in the kitchen, through the door on the west wall."}</p>` + shut;
}
export function kitchenPanel(F, which){
  const c = cocoaState(F); finish(c);
  const steps = `<p class="muted">Beans ${c.beans} · roasted ${c.roasted} · chocolate ${Object.entries(c.choc).map(([k, n]) => `${KINDS[k].n.split(" ")[0].toLowerCase()} ${n}`).join(", ")}</p>`;
  if (which === "sacks") return `<span class="tape gingham" aria-hidden="true"></span><h2>Bean sacks</h2><p class="sub">Cacao beans, ${SACK} ${coin()} a sack. A sack makes a pot of chocolate: 30 pieces.</p>
    <p class="olabel">${c.beans} sack${c.beans === 1 ? "" : "s"} in the kitchen</p><div class="actions"><button class="btn primary" data-cc="beans" data-n="1" ${F.coins < SACK ? "disabled" : ""}>Buy a sack (${SACK} ${coin()})</button><button class="btn alt" data-cc="beans" data-n="3" ${F.coins < SACK*3 ? "disabled" : ""}>Three (${SACK*3} ${coin()})</button></div>${steps}` + shut;
  if (which === "roaster") return `<span class="tape stripe" aria-hidden="true"></span><h2>The roaster</h2><p class="sub">${c.roast ? `Roasting a sack: ready in ${left(c.roast.done)}.` : "Roast a sack of beans. Ten minutes, and the whole kitchen smells amazing."}</p>
    <div class="actions"><button class="btn primary" data-cc="roast" ${c.roast || c.beans < 1 ? "disabled" : ""}>${c.beans < 1 ? "No beans: buy a sack" : "Roast a sack"}</button></div>${steps}` + shut;
  if (which === "grinder") return `<span class="tape gingham" aria-hidden="true"></span><h2>The stone grinder</h2><p class="sub">${c.grind ? `Grinding ${KINDS[c.grind.kind].n.toLowerCase()}: ready in ${left(c.grind.done)}.` : c.ground ? `A pot of ${KINDS[c.ground].n.toLowerCase()} is ready: temper it on the marble slab.` : "Roasted beans in, chocolate out. It takes two hours."}</p>
    ${c.grind || c.ground ? "" : `<div class="actions">${Object.entries(KINDS).map(([k, d]) => `<button class="btn ${k === "milk" ? "primary" : "alt"}" data-cc="grind" data-k="${k}" ${c.roasted < 1 ? "disabled" : ""}>${dot(d.col)} ${d.n}</button>`).join("")}</div>${c.roasted < 1 ? `<p class="muted">Roast some beans first.</p>` : ""}`}${steps}` + shut;
  if (which === "slab") return `<span class="tape stripe" aria-hidden="true"></span><h2>The marble slab</h2><p class="sub">${c.ground ? `Temper the ${KINDS[c.ground].n.toLowerCase()}: spread, scrape, fold, until it shines.` : "Tempering makes chocolate snap and shine. Bring a pot from the grinder."}</p>
    <div class="actions"><button class="btn primary" data-cc="temper" ${c.ground ? "" : "disabled"}>Temper it (${POT} pieces)</button></div>${steps}` + shut;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The moulds</h2><p class="sub">${MOULD} pieces of tempered chocolate make ${MOULD} bars, straight onto the bar wall.</p>
    <ul class="hlist wlist">${Object.entries(KINDS).map(([k, d]) => `<li><span class="wpic">${dot(d.col)}</span><span class="wtxt"><b>${d.n}</b><small>${c.choc[k]} pieces</small></span><button class="btn small primary" data-cc="mould" data-k="${k}" ${c.choc[k] < MOULD ? "disabled" : ""}>Mould ${MOULD} bars</button></li>`).join("")}</ul>${steps}` + shut;
}

/* ---------- bonbon panels ---------- */
const ingPic = id => id.startsWith("fl_") ? icon("bq_" + id.slice(3), 26) : icon(id, 26);
const bonbonPic = (shell, col) => `<svg class="gscoop" viewBox="0 0 44 44" aria-hidden="true"><rect x="8" y="12" width="28" height="24" rx="7" fill="${KINDS[shell].col}" stroke="#3A2E28" stroke-width="1.2"/><path d="M12 20 q5 -6 10 0 q5 6 10 0" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/><circle cx="15" cy="16" r="2" fill="#fff" opacity=".5"/></svg>`;
const card = (shell, col, name, line, made) => `<div class="gresult${made ? " made" : ""}">${bonbonPic(shell, col)}<span><b>${esc(name)}</b><small>${esc(line)}</small></span></div>`;
export function pantryPanel(F, orch){
  const c = cocoaState(F), inS = Object.keys(c.pantry).filter(id => c.pantry[id] > 0), bag = backpackFillings(F), shelf = farmFillings(orch);
  const cell = (id, n, extra) => `<li><span class="wpic">${ingPic(id)}</span><span class="wtxt"><b>${esc(fillName(id))}</b><small>${n}</small></span>${extra || ""}</li>`;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The fillings shelf</h2><p class="sub">What goes inside the bonbons: fruit, flowers, honey, pandan, coffee, nuts... A tray uses one of each filling.</p>`;
  h += inS.length ? `<ul class="hlist wlist">${inS.map(id => cell(id, `${c.pantry[id]} on the shelf`)).join("")}</ul>` : `<p class="muted">Empty for now.</p>`;
  if (bag.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From your backpack</p><ul class="hlist wlist">${bag.map(id => cell(id, `${F.inv[id]} with you`, `<span class="orbtns"><button class="btn small primary" data-cc="fill" data-src="bag" data-k="${id}" data-n="1">Add 1</button><button class="btn small alt" data-cc="fill" data-src="bag" data-k="${id}" data-n="99">All</button></span>`)).join("")}</ul>`;
  if (shelf.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From Ma Ma's farm shop</p><ul class="hlist wlist">${shelf.map(id => cell(id, `${orch.stock[id.startsWith("fl_") ? "stem:" + id.slice(3) : id]} on her shelf`, `<span class="orbtns"><button class="btn small primary" data-cc="fill" data-src="farm" data-k="${id}" data-n="1">Add 1</button><button class="btn small alt" data-cc="fill" data-src="farm" data-k="${id}" data-n="99">All</button></span>`)).join("")}</ul>`;
  if (!bag.length && !shelf.length) h += `<p class="muted">Nothing to add right now. Hana's deli has honey, pandan, coffee, nuts and more; Ma Ma's farm shop has fruit and flowers.</p>`;
  return h + shut;
}
export function bonbonPanel(F, st){
  const c = cocoaState(F), inS = Object.keys(c.pantry).filter(id => c.pantry[id] > 0 && isFilling(id)), sel = (st.sel || []).filter(id => inS.includes(id)), shell = KINDS[st.shell] ? st.shell : "dark";
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The bonbon table</h2><p class="sub">A shell (${SHELL} pieces of chocolate) and one or two fillings make a tray of ${TRAY}. Every new pairing is a new bonbon. ${c.bonbons.length} discovered so far.</p>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">Shell</p><div class="gchips">${Object.entries(KINDS).map(([k, d]) => `<button class="gchip${k === shell ? " on" : ""}" data-cc="shell" data-k="${k}" aria-pressed="${k === shell}">${dot(d.col)}<span>${d.n.split(" ")[0]} (${c.choc[k]})</span></button>`).join("")}</div>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">Fillings</p>` + (inS.length ? `<div class="gchips">${inS.map(id => `<button class="gchip${sel.includes(id) ? " on" : ""}" data-cc="sel" data-k="${id}" aria-pressed="${sel.includes(id)}" ${!sel.includes(id) && sel.length >= 2 ? "disabled" : ""}>${ingPic(id)}<span>${esc(fillName(id))}</span></button>`).join("")}</div>` : `<p class="muted">The fillings shelf is empty. Stock it first.</p>`);
  const made = st.made && recipeOf(c, st.made), known = sel.length ? knownBonbon(c, shell, sel) : null;
  if (made && !sel.length) h += card(made.shell, made.col, made.name, st.isNew ? "A new bonbon! The first tray's ready for the display case." : "Another tray of twelve, ready for the display case.", true);
  else if (sel.length) h += card(shell, INGR[[...sel].sort()[0]][2], known ? known.name : bonbonName(shell, sel), known ? "You know this one. Make another tray?" : "Something new!");
  const ok = sel.length && canMakeBonbon(c, shell, sel);
  h += `<div class="actions"><button class="btn primary" data-cc="bonbon" ${ok ? "" : "disabled"}>${known ? "Make another tray" : "Make it"}</button><button class="btn alt small" data-close="1">Close</button></div>`;
  if (sel.length && c.choc[shell] < SHELL) h += `<p class="muted">Not enough ${KINDS[shell].n.toLowerCase()}: temper some more first.</p>`;
  if (c.bonbons.length) h += `<p class="eyebrow" style="margin:12px 0 6px">Your bonbons</p><ul class="hlist wlist">${c.bonbons.map(b => `<li><span class="wpic">${dot(KINDS[b.shell].col)}</span><span class="wtxt"><b>${esc(b.name)}</b><small>${c.trays[b.id] || 0} made · ${KINDS[b.shell].n.split(" ")[0].toLowerCase()} shell, ${esc(b.fills.map(fillName).join(" and ").toLowerCase())}</small></span><button class="btn small alt" data-cc="again" data-k="${esc(b.id)}" ${canMakeBonbon(c, b.shell, b.fills) ? "" : "disabled"}>Another tray</button></li>`).join("")}</ul>`;
  return h;
}
export function casePanel(F){
  const c = cocoaState(F), ids = displayIds(c), shown = ids.map(id => recipeOf(c, id)), rest = c.bonbons.filter(b => !ids.includes(b.id) && c.trays[b.id] > 0);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The display case</h2><p class="sub">Up to ${CASE} flavours of bonbons, ${c.prices.bonbon} ${coin()} each. Customers pick two to four.</p>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">In the case (${shown.length} of ${CASE})</p>` + (shown.length ? `<ul class="hlist wlist">${shown.map(b => `<li><span class="wpic">${dot(KINDS[b.shell].col)}</span><span class="wtxt"><b>${esc(b.name)}</b><small>${c.trays[b.id] ? c.trays[b.id] + " left" : "sold out"}</small></span><button class="btn small alt" data-cc="case" data-k="${esc(b.id)}">Take out</button></li>`).join("")}</ul>` : `<p class="muted">Empty. Make bonbons at the bonbon table in the kitchen.</p>`);
  if (rest.length) h += `<p class="eyebrow" style="margin:12px 0 6px">Waiting in the kitchen</p><ul class="hlist wlist">${rest.map(b => `<li><span class="wpic">${dot(KINDS[b.shell].col)}</span><span class="wtxt"><b>${esc(b.name)}</b><small>${c.trays[b.id]} made</small></span><button class="btn small primary" data-cc="case" data-k="${esc(b.id)}" ${ids.length >= CASE ? "disabled" : ""}>Put in</button></li>`).join("")}</ul>`;
  h += `<div class="row gprices"><span>Price of a bonbon</span><span class="gstep"><button class="btn small alt" data-cc="bprice" data-n="-1" aria-label="Cheaper">−</button><b>${c.prices.bonbon}</b><button class="btn small alt" data-cc="bprice" data-n="1" aria-label="Dearer">+</button></span></div>`;
  return h + shut;
}
// the counter's bonbon part: have one from the case, or pack a gift box of 4 or 9
export function counterBonbons(F){
  const c = cocoaState(F), shown = onDisplay(c), have = shown.reduce((a, b) => a + c.trays[b.id], 0); if (!c.bonbons.length) return "";
  return `<p class="eyebrow" style="margin:12px 0 6px">Bonbons</p>${shown.length ? `<div class="gchips">${shown.map(b => `<button class="gchip" data-cc="eatbb" data-k="${esc(b.id)}">${dot(KINDS[b.shell].col)}<span>${esc(b.name)}</span></button>`).join("")}</div>` : `<p class="muted">The display case is empty.</p>`}
    <div class="actions"><button class="btn small alt" data-cc="box" data-n="4" ${have >= 4 ? "" : "disabled"}>Gift box of 4</button><button class="btn small alt" data-cc="box" data-n="9" ${have >= 9 ? "" : "disabled"}>Gift box of 9</button></div>`;
}
