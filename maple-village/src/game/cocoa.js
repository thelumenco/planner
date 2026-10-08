// The Cocoa Room: Mel's chocolate shop on the bay (in the shopfront that was under renovation; opened as a big goal,
// goals.js "cocoa"). Mel makes everything herself, bean to bar:
//   beans   a sack of cacao beans from the sacks in the kitchen (10 coins a sack)
//   roast   a sack at a time in the roaster: ready in 10 minutes
//   grind   roasted beans in the stone grinder, as milk, dark or white chocolate: ready in 2 hours
//   temper  the ground pot on the marble slab: 30 pieces of chocolate, ready to use
//   mould   10 pieces make 10 bars in the moulds, onto the bar wall
// The shop is open 11am to 8pm, Tuesday to Sunday. Amara serves at the counter; customers buy bars off the wall (more
// often while Mel's serving too). Takings go straight to Mel. Mel can have a bar or take one to give.
import { esc, dayKey, sgHM } from "../util.js";
import { icon } from "../art/icons.js";

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
  c.prices = Object.assign({bar: 6}, c.prices || {}); c.sold = c.sold || {}; c.made = c.made || 0;
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

/* ---------- selling ---------- */
// catch up minute by minute (at most two days): customers buy a bar or two of whatever's on the wall
export function cocoaTick(F, opts = {}){
  const c = cocoaState(F), t = now(), from = Math.max(c.at || t, t - 2*864e5), out = {coins: 0, n: 0, mins: 0, done: finish(c)};
  for (let at = from + 60000; at <= t; at += 60000) {
    const sg = new Date(at + 8*3600e3), day = sg.toISOString().slice(0, 10), hm = sg.getUTCHours()*60 + sg.getUTCMinutes();
    out.mins++;
    if (!openOn(day, hm)) continue;
    const stocked = Object.keys(KINDS).filter(k => c.bars[k] > 0); if (!stocked.length) continue;
    const d = sg.getUTCDay(), we = d === 0 || d === 6, pf = Math.pow(6/Math.max(2, c.prices.bar), 1.3);
    if (Math.random() >= .03*(we ? 1.4 : 1)*(hm >= 15*60 && hm < 18*60 ? 1.2 : 1)*(opts.serving ? 1.5 : 1)*pf) continue;
    const k = stocked[Math.floor(Math.random()*stocked.length)], n = Math.min(c.bars[k], Math.random() < .3 ? 2 : 1);
    c.bars[k] -= n; const coins = n*c.prices.bar, s = c.sold[day] = c.sold[day] || {n: 0, coins: 0}; s.n += n; s.coins += coins; out.coins += coins; out.n += n;
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
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(c.name)}</h2><p class="sub">${openOn(day, hm) ? "Open till 8pm." : "Closed: open 11am to 8pm, Tuesday to Sunday."} ${t.n ? `Sold today: ${t.n} bar${t.n > 1 ? "s" : ""} (${t.coins} ${coin()}).` : "Nothing sold yet today."}${st.server ? " Amara's behind the counter." : ""}</p>`;
  h += `<ul class="hlist wlist">${Object.entries(KINDS).map(([k, d]) => `<li><span class="wpic">${icon(BAR_ID(k), 26)}</span><span class="wtxt"><b>${d.n} bars</b><small>${c.bars[k]} on the wall · ${c.prices.bar} ${coin()} each</small></span><span class="orbtns"><button class="btn small primary" data-cc="eat" data-k="${k}" ${c.bars[k] ? "" : "disabled"}>Have one</button><button class="btn small alt" data-cc="give" data-k="${k}" ${c.bars[k] ? "" : "disabled"}>To give</button></span></li>`).join("")}</ul>`;
  h += `<div class="row gprices"><span>Price of a bar</span><span class="gstep"><button class="btn small alt" data-cc="price" data-n="-1" aria-label="Cheaper">−</button><b>${c.prices.bar}</b><button class="btn small alt" data-cc="price" data-n="1" aria-label="Dearer">+</button></span></div>`;
  h += `<form class="row hadd" data-ccname="1"><label class="sr" for="ccName">Shop name</label><input id="ccName" maxlength="30" value="${esc(c.name)}"><button class="btn small alt">Rename</button></form>`;
  return h + `<p class="muted">Yours are free. Customers buy bars off the wall while the shop's open, more often while you're here.</p>` + shut;
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
