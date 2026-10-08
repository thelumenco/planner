// The Scoop Shack: Mel's ice cream shop on the bay, north of the foreshore. Open 10am to 8pm.
//   ingredients  stocked into the kitchen fridge from the backpack, or straight off Ma Ma's farm shop shelves
//                (fruit and flower stems); milk from Mel's goats or Hana's market
//   discovery    at the mixing bench, any 1 to 4 ingredients make a flavour, and every combination is a new one
//                (never a bad recipe). The first tub is made there and then. With milk it's a gelato, without a
//                (dairy-free) sorbet
//   batches      Tomo, the cook, makes tubs (20 scoops) on his shifts from whatever Mel picks for the day (or,
//                if she hasn't picked, the flavours running lowest), as long as the fridge has the ingredients
//   sales        customers buy cups, cones, floats and waffles while it's open; the takings come to Mel. Prices
//                are set per type, and a flavour marked special costs a little more
//   for Mel      a free one at the counter (and one for Evan), or one to take away and give
import { esc, dayKey, sgHM, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";
import { TREES, FLOWERS } from "../data/orchard.js";

export const OPEN = 10*60, CLOSE = 20*60, TUB = 20, BATCH_MIN = 45, MAX_BATCHES = 4;
export const COOK = "tomo", SERVER = "sofia";
export const FORMATS = {cup: {n: "Cup", p: 4}, cone: {n: "Cone", p: 4}, float: {n: "Float", p: 6}, waffle: {n: "Waffle", p: 7}};
const FMT_W = [["cup", .34], ["cone", .4], ["float", .1], ["waffle", .16]];

// What can go into a flavour: [display name, the word used in flavour names, colour]
const FRUIT_COL = {cherry: "#C2334D", lemon: "#F3E27A", peach: "#F5B08A", mango: "#F3B33A", apple: "#B9D98A", pear: "#D9E39A", fig: "#8C5A7A", orange: "#F39A3A", persimmon: "#E8823A"};
export const INGR = {
  milk: ["Milk", "Milk", "#FFFBEF"], honey: ["Honey", "Honey", "#F3C969"], egg: ["Egg", "Custard", "#F6E3A1"], olives: ["Olives", "Olive", "#9DAF6A"],
  strawberry: ["Strawberries", "Strawberry", "#E8566C"], blueberry: ["Blueberries", "Blueberry", "#5E6EB8"], pumpkin: ["Pumpkin", "Pumpkin", "#E8913A"],
  corn: ["Sweetcorn", "Sweetcorn", "#F3D34A"], carrot: ["Carrots", "Carrot", "#F28C3A"], tomato: ["Tomatoes", "Tomato", "#E05A44"],
  ...Object.fromEntries(Object.values(TREES).map(t => [t.fruit, [t.fruit[0].toUpperCase() + t.fruit.slice(1), t.fruit[0].toUpperCase() + t.fruit.slice(1), FRUIT_COL[t.fruit] || "#F3C969"]])),
  ...Object.fromEntries(Object.entries(FLOWERS).map(([id, f]) => ["fl_" + id, [f.n, f.n.replace(/s$/, "").replace(/ie$/, "y").replace("Sweet pea", "Sweet Pea"), f.col || "#F4C7CF"]]))
};
export const isIngr = id => id in INGR;
const word = id => INGR[id][1];

export function scoopState(F){
  F.scoop = F.scoop || {};
  const s = F.scoop;
  s.name = s.name || "The Scoop Shack"; s.fridge = s.fridge || {}; s.recipes = s.recipes || []; s.tubs = s.tubs || {};
  s.prices = Object.assign({cup: 4, cone: 4, float: 6, waffle: 7, special: 2}, s.prices || {});
  s.plan = s.plan && s.plan.day === dayKey() ? s.plan : {day: dayKey(), ids: []};
  s.made = s.made || {}; s.sold = s.sold || {}; s.log = s.log || [];
  return s;
}
export const recipeOf = (s, id) => s.recipes.find(r => r.id === id);
export const flavourName = r => r ? r.name : "a flavour";
export const scoopsLeft = s => Object.values(s.tubs).reduce((a, b) => a + b, 0);
export const openNow = hm => hm >= OPEN && hm < CLOSE;
export const cookOn = (day, hm) => { const d = new Date(day + "T00:00:00Z").getUTCDay(); return d !== 0 && hm >= 8*60 && hm < 16*60 && !(hm >= 12*60 && hm < 12*60 + 45); };

/* ---------- discovering flavours ---------- */
const GELATO = ["Gelato", "Cream", "Swirl", "Ripple", "Velvet", "Dream"], SORBET = ["Sorbet", "Sorbetto", "Ice", "Frost"];
const POETIC = ["Dolphin Bay", "Jetty Sunset", "Ma Ma's Garden", "Lantern Night", "Sea Breeze", "Sunday Picnic", "Orchard Morning", "First Light", "Evan's Dream", "Maple's Secret", "Night Market", "Low Tide", "Paddleboard", "Golden Hour", "Rainy Window", "Swan Lake", "Wildflower", "Porch Swing"];
export function nameFor(ings){
  const dairy = ings.includes("milk"), flav = ings.filter(i => i !== "milk"), h = hash(ings.join("+"));
  if (!flav.length) return "Fior di Latte";
  const style = (dairy ? GELATO : SORBET)[h % (dairy ? GELATO.length : SORBET.length)];
  if (flav.length === 1) return `${word(flav[0])} ${style}`;
  if (flav.length === 2) return `${word(flav[0])} & ${word(flav[1])} ${style}`;
  return `${POETIC[h % POETIC.length]} ${style}`;
}
const blend = ings => { const cs = ings.map(i => INGR[i][2]).filter(c => c !== "#FFFBEF"); if (!cs.length) return "#FFF6DC";
  const rgb = cs.map(c => [1, 3, 5].map(k => parseInt(c.slice(k, k + 2), 16))), avg = [0, 1, 2].map(k => Math.round(rgb.reduce((a, r) => a + r[k], 0)/rgb.length));
  const soft = ings.includes("milk") ? .45 : .15;   // milk makes it paler and creamier
  return "#" + avg.map(v => Math.round(v + (255 - v)*soft).toString(16).padStart(2, "0")).join(""); };
const keyOf = ings => [...new Set(ings)].sort().join("+");
export const knownRecipe = (s, ings) => s.recipes.find(r => r.id === keyOf(ings));
const hasAll = (s, ings) => ings.every(i => (s.fridge[i] || 0) >= 1);
const useAll = (s, ings) => ings.forEach(i => { s.fridge[i]--; if (s.fridge[i] <= 0) delete s.fridge[i]; });
// mix up to 4 ingredients from the fridge: a new flavour (and its first tub), or the one already known
export function discover(F, ings){
  const s = scoopState(F); ings = [...new Set(ings)].filter(isIngr).slice(0, 4);
  if (!ings.length) return {msg: "Pick something from the fridge to mix."};
  const known = knownRecipe(s, ings); if (known) return {known, msg: `You already know this one: ${known.name}. Add it to today's batches on the board.`};
  if (!hasAll(s, ings)) return {msg: "The fridge is missing some of that."};
  useAll(s, ings);
  const r = {id: keyOf(ings), ings: [...ings].sort(), name: nameFor([...ings].sort()), col: blend(ings), dairy: ings.includes("milk"), special: false, found: Date.now()};
  s.recipes.push(r); s.tubs[r.id] = (s.tubs[r.id] || 0) + TUB; registerItems(F);
  return {recipe: r, msg: `A new flavour: ${r.name}! The first tub's in the display.`};
}

/* ---------- the kitchen fridge ---------- */
export const backpackIngr = F => Object.keys(F.inv || {}).filter(id => isIngr(id) && F.inv[id] > 0);
export function stockFridge(F, id, n, from, orch){
  const s = scoopState(F);
  if (from === "bag") { const have = (F.inv || {})[id] || 0; n = Math.min(n, have); if (n <= 0) return 0; F.inv[id] -= n; if (F.inv[id] <= 0) delete F.inv[id]; }
  else { const key = id.startsWith("fl_") ? "stem:" + id.slice(3) : id, have = orch.stock[key] || 0; n = Math.min(n, have); if (n <= 0) return 0; orch.stock[key] -= n; if (orch.stock[key] <= 0) delete orch.stock[key]; }
  s.fridge[id] = (s.fridge[id] || 0) + n; return n;
}
// what Ma Ma's farm shop has on its shelves that could go in the fridge (fruit, and flower stems)
export const farmShelf = orch => Object.keys(orch.stock || {}).filter(k => orch.stock[k] > 0).map(k => k.startsWith("stem:") ? "fl_" + k.slice(5) : k).filter(isIngr);

/* ---------- Tomo's batches ---------- */
export const canMake = (s, r) => r && hasAll(s, r.ings);
// today's queue: what Mel picked, or (if she hasn't) the flavours running lowest that the fridge can make
export function todaysQueue(s){
  if (s.plan.ids.length) return s.plan.ids.map(id => recipeOf(s, id)).filter(Boolean);
  return [...s.recipes].filter(r => (s.tubs[r.id] || 0) < TUB).sort((a, b) => (s.tubs[a.id] || 0) - (s.tubs[b.id] || 0)).slice(0, 3);
}
function kitchenMinute(s, day, hm, at){
  if (s.batch && at >= s.batch.done) { s.tubs[s.batch.id] = (s.tubs[s.batch.id] || 0) + TUB; s.made[day] = (s.made[day] || 0) + 1;
    s.log = [`${(recipeOf(s, s.batch.id) || {}).name || "A flavour"}: a fresh tub`, ...s.log].slice(0, 6); s.batch = null; }
  if (s.batch || !cookOn(day, hm) || (s.made[day] || 0) >= MAX_BATCHES) return;
  const done = s.doneToday && s.doneToday.day === day ? s.doneToday.ids : [];
  const next = todaysQueue(s).find(r => !done.includes(r.id) && canMake(s, r));
  if (!next) return;
  useAll(s, next.ings); s.batch = {id: next.id, done: at + BATCH_MIN*60000};
  s.doneToday = {day, ids: [...done, next.id]};
}

/* ---------- customers ---------- */
export const priceOf = (s, fmt, r) => s.prices[fmt] + (r && r.special ? s.prices.special : 0);
const DEFAULT = 4 + 4 + 6 + 7;
function saleMinute(s, day, hm, opts){
  if (!openNow(hm)) return null;
  const stocked = s.recipes.filter(r => (s.tubs[r.id] || 0) > 0); if (!stocked.length) return null;
  const d = new Date(day + "T00:00:00Z").getUTCDay(), we = d === 0 || d === 6, night = (d === 2 || d === 4) && hm >= 18*60;
  const price = s.prices.cup + s.prices.cone + s.prices.float + s.prices.waffle, pf = Math.pow(DEFAULT/Math.max(4, price), 1.3);
  const p = .035*(we ? 1.5 : 1)*(night ? 1.4 : 1)*(hm >= 14*60 && hm < 17*60 ? 1.25 : 1)*pf*(opts.serving ? 1.5 : 1);
  if (Math.random() >= p) return null;
  let x = Math.random(), fmt = "cone"; for (const [f, w] of FMT_W) { if ((x -= w) < 0) { fmt = f; break; } }
  const r = stocked[Math.floor(Math.random()*stocked.length)];
  s.tubs[r.id]--; if (s.tubs[r.id] <= 0) delete s.tubs[r.id];
  const coins = priceOf(s, fmt, r), t = s.sold[day] = s.sold[day] || {n: 0, coins: 0};
  t.n++; t.coins += coins; return {coins, fmt, r};
}
// catch up minute by minute since the last tick (at most two days): the kitchen, then the counter
export function scoopTick(F, opts = {}){
  const s = scoopState(F), now = Date.now() + (globalThis.__mapleOffset || 0), from = Math.max(s.at || now, now - 2*864e5);
  const out = {coins: 0, n: 0, mins: 0};
  for (let at = from + 60000; at <= now; at += 60000) {
    const sg = new Date(at + 8*3600e3), day = sg.toISOString().slice(0, 10), hm = sg.getUTCHours()*60 + sg.getUTCMinutes();
    kitchenMinute(s, day, hm, at);
    const sale = saleMinute(s, day, hm, opts); if (sale) { out.coins += sale.coins; out.n++; }
    out.mins++;
  }
  if (out.mins || !s.at) s.at = from + out.mins*60000;
  if (out.coins) F.coins += out.coins;
  return out;
}

/* ---------- gifts: an ice cream to take away ---------- */
// every flavour in each type becomes a backpack gift ("Mango Sorbet cone"); sorbets suit everyone, gelato everyone
// but Marcus (lactose intolerant)
const NO_DAIRY = ["evan", "darren", "mama", "gonggong", "mum", "dad", "angelina"];
export const giftId = (r, fmt) => `gel_${fmt}_${r.id.replace(/[^a-z0-9]+/g, "-")}`;
export function registerItems(F){
  scoopState(F).recipes.forEach(r => Object.keys(FORMATS).forEach(fmt => { const id = giftId(r, fmt);
    ITEMS[id] = {n: `${r.name} ${FORMATS[fmt].n.toLowerCase()}`, kind: "gift", to: r.dairy ? NO_DAIRY : "family", tab: "scoop", ico: "ic_" + fmt, gel: true,
      say: `Ice cream! ${r.name}? Ooh, I've never had that one.`, says: {evan: "ICE CREAM!! *happy dance*", marcus: "A sorbet, so no tummy trouble. Nice one, Zeh.", mama: "Ice cream for Ma Ma? Aiyo, so cold! So nice.", dad: "Ah Gong loves ice cream. Don't tell your mum."}}; }));
}
export function takeAway(F, rid, fmt){
  const s = scoopState(F), r = recipeOf(s, rid); if (!r || !(s.tubs[rid] > 0) || !FORMATS[fmt]) return null;
  s.tubs[rid]--; if (s.tubs[rid] <= 0) delete s.tubs[rid]; registerItems(F);
  const id = giftId(r, fmt); F.inv[id] = (F.inv[id] || 0) + 1; return ITEMS[id];
}
export function eatOne(F, rid){
  const s = scoopState(F), r = recipeOf(s, rid); if (!r || !(s.tubs[rid] > 0)) return null;
  s.tubs[rid]--; if (s.tubs[rid] <= 0) delete s.tubs[rid]; return r;
}

/* ---------- panels ---------- */
const coin = () => icon("coin", 13);
const dot = c => `<span class="gdot" style="background:${c}"></span>`;
const ingPic = id => id.startsWith("fl_") ? icon("bq_" + id.slice(3), 26) : icon(id, 26);
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const tubList = s => s.recipes.filter(r => s.tubs[r.id] > 0);
export function counterPanel(F, st){
  const s = scoopState(F), hm = sgHM(), t = s.sold[dayKey()] || {n: 0, coins: 0}, tubs = tubList(s);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(s.name)}</h2><p class="sub">${openNow(hm) ? "Open till 8pm." : "Closed: open 10am to 8pm."} ${t.n ? `Sold today: ${t.n} (${t.coins} ${coin()}).` : "Nothing sold yet today."}${st.server ? " Sofia's behind the counter." : ""}</p>`;
  if (!tubs.length) return h + `<p class="muted">The display's empty. Discover a flavour at the mixing bench in the kitchen (through the door on the west wall), and Tomo will keep the tubs topped up.</p>` + shut;
  const pick = st.pick && s.tubs[st.pick] > 0 ? recipeOf(s, st.pick) : null;
  if (pick) return h + `<div class="gpick"><p class="olabel">${dot(pick.col)} ${esc(pick.name)}${pick.dairy ? "" : ' <span class="hbadge">dairy-free</span>'}</p><p class="muted">${esc(pick.ings.map(i => INGR[i][0]).join(", "))} · ${s.tubs[pick.id]} scoops left</p>
    <p class="eyebrow" style="margin:10px 0 6px">For you (free)</p><div class="actions"><button class="btn primary" data-geat="${esc(pick.id)}">Have one now${st.evan ? ", and one for Evan" : ""}</button></div>
    <p class="eyebrow" style="margin:12px 0 6px">To give someone</p><div class="actions">${Object.keys(FORMATS).map(f => `<button class="btn small alt" data-gtake="${f}">${FORMATS[f].n}</button>`).join("")}</div>
    <div class="actions"><button class="btn alt small" data-gback="1">Back</button><button class="btn alt small" data-close="1">Close</button></div></div>`;
  h += `<ul class="hlist wlist">${tubs.map(r => `<li><span class="wpic">${dot(r.col)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${s.tubs[r.id]} scoops${r.dairy ? "" : " · dairy-free"}${r.special ? " · special" : ""}</small></span><button class="btn small primary" data-gpick="${esc(r.id)}">Choose</button></li>`).join("")}</ul>`;
  return h + `<p class="muted">Yours are free. Customers pay what's on the chalkboard menu.</p>` + shut;
}
export function menuPanel(F, st){
  const s = scoopState(F), step = k => `<span class="gstep"><button class="btn small alt" data-gprice="${k}:-1" aria-label="Cheaper">−</button><b>${s.prices[k]}</b><button class="btn small alt" data-gprice="${k}:1" aria-label="Dearer">+</button></span>`;
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The menu</h2><p class="sub">Prices by type. A flavour marked special costs a little extra.</p>
    <ul class="hlist wlist gprices">${Object.keys(FORMATS).map(f => `<li><span class="wtxt"><b>${FORMATS[f].n}</b><small>${f === "float" ? "a scoop in a fizzy float" : f === "waffle" ? "a scoop on a warm waffle" : "one scoop"}</small></span>${step(f)}</li>`).join("")}
    <li><span class="wtxt"><b>Special surcharge</b><small>added to anything in a special flavour</small></span>${step("special")}</li></ul>`;
  h += s.recipes.length ? `<p class="eyebrow" style="margin:12px 0 6px">Flavours</p><ul class="hlist wlist gflav">${s.recipes.map(r => `<li><span class="wpic">${dot(r.col)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${s.tubs[r.id] ? s.tubs[r.id] + " scoops" : "sold out"}</small></span><label class="gspec"><input type="checkbox" data-gspecial="${esc(r.id)}" ${r.special ? "checked" : ""}> special</label></li>`).join("")}</ul>` : `<p class="muted">No flavours yet: discover some at the mixing bench in the kitchen.</p>`;
  h += `<form class="row hadd" data-gname="1"><label class="sr" for="gName">Shop name</label><input id="gName" name="n" maxlength="30" value="${esc(s.name)}"><button class="btn small alt">Rename</button></form>`;
  return h + shut;
}
export function fridgePanel(F, orch){
  const s = scoopState(F), inF = Object.keys(s.fridge).filter(id => s.fridge[id] > 0), bag = backpackIngr(F), shelf = farmShelf(orch);
  const cell = (id, n, extra) => `<li><span class="wpic">${ingPic(id)}</span><span class="wtxt"><b>${esc(INGR[id][0])}</b><small>${n}</small></span>${extra || ""}</li>`;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The fridge</h2><p class="sub">What Tomo makes the gelato from. Each batch uses one of each of a flavour's ingredients.</p>`;
  h += inF.length ? `<ul class="hlist wlist">${inF.map(id => cell(id, `${s.fridge[id]} in the fridge`)).join("")}</ul>` : `<p class="muted">Empty. Add fruit, berries, flowers, milk, honey...</p>`;
  if (bag.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From your backpack</p><ul class="hlist wlist">${bag.map(id => cell(id, `${F.inv[id]} with you`, `<span class="orbtns"><button class="btn small primary" data-gfill="bag:${id}:1">Add 1</button><button class="btn small alt" data-gfill="bag:${id}:99">All</button></span>`)).join("")}</ul>`;
  if (shelf.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From Ma Ma's farm shop</p><ul class="hlist wlist">${shelf.map(id => { const n = orch.stock[id.startsWith("fl_") ? "stem:" + id.slice(3) : id];
    return cell(id, `${n} on her shelf`, `<span class="orbtns"><button class="btn small primary" data-gfill="farm:${id}:1">Add 1</button><button class="btn small alt" data-gfill="farm:${id}:99">All</button></span>`); }).join("")}</ul>`;
  if (!bag.length && !shelf.length) h += `<p class="muted">Nothing to add right now. Milk comes from your goats or Hana's market; fruit and flowers from the orchard.</p>`;
  return h + shut;
}
export function benchPanel(F, st){
  const s = scoopState(F), inF = Object.keys(s.fridge).filter(id => s.fridge[id] > 0), sel = (st.sel || []).filter(id => inF.includes(id));
  const known = sel.length ? knownRecipe(s, sel) : null;
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The mixing bench</h2><p class="sub">Pick up to four things from the fridge and mix. Every combination makes a new flavour; there's no such thing as a bad one. ${s.recipes.length} discovered so far.</p>`;
  if (!inF.length) return h + `<p class="muted">The fridge is empty. Stock it first.</p>` + shut;
  h += `<div class="gchips">${inF.map(id => `<button class="gchip${sel.includes(id) ? " on" : ""}" data-gsel="${id}" aria-pressed="${sel.includes(id)}" ${!sel.includes(id) && sel.length >= 4 ? "disabled" : ""}>${ingPic(id)}<span>${esc(INGR[id][0])}</span></button>`).join("")}</div>`;
  h += `<p class="muted">${sel.length ? known ? `You know this one: <b>${esc(known.name)}</b>.` : `${sel.length} picked. ${sel.includes("milk") ? "With milk: a gelato." : "No milk: a dairy-free sorbet."} Something new!` : "Nothing picked yet."}</p>`;
  return h + `<div class="actions"><button class="btn primary" data-gmix="1" ${!sel.length || known ? "disabled" : ""}>Mix it</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function batchPanel(F, st){
  const s = scoopState(F), day = dayKey(), hm = sgHM(), q = todaysQueue(s), b = s.batch && recipeOf(s, s.batch.id);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Today's batches</h2><p class="sub">${b ? `Tomo's making ${esc(b.name)} now. ` : cookOn(day, hm) ? "Tomo's in the kitchen. " : "Tomo's not in right now (he works 8am to 4pm, Monday to Saturday). "}Up to ${MAX_BATCHES} tubs a day; ${s.made[day] || 0} made so far.</p>`;
  if (!s.recipes.length) return h + `<p class="muted">No flavours yet. Discover one at the mixing bench.</p>` + shut;
  h += `<ul class="hlist">${s.recipes.map(r => `<li><label><input type="checkbox" data-gplan="${esc(r.id)}" ${s.plan.ids.includes(r.id) ? "checked" : ""}><span>${dot(r.col)} ${esc(r.name)} <small>${s.tubs[r.id] || 0} scoops left · ${canMake(s, r) ? "fridge has it" : "missing: " + esc(r.ings.filter(i => !(s.fridge[i] > 0)).map(i => INGR[i][0]).join(", "))}</small></span></label></li>`).join("")}</ul>`;
  h += `<p class="muted">${s.plan.ids.length ? "Tomo will make the ticked ones, in order, while the fridge has what they need." : "Nothing ticked: Tomo tops up whichever flavours are running lowest (" + (q.map(r => esc(r.name)).join(", ") || "all full") + ")."}</p>`;
  if (s.log.length) h += `<p class="eyebrow" style="margin:12px 0 6px">Lately</p><ul class="hlist">${s.log.map(l => `<li><small>${esc(l)}</small></li>`).join("")}</ul>`;
  return h + shut;
}
export function freezerPanel(F){
  const s = scoopState(F), tubs = tubList(s);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The freezer</h2><p class="sub">Tubs keep frozen until they're sold. ${scoopsLeft(s)} scoops in all.</p>`
    + (tubs.length ? `<ul class="hlist wlist">${tubs.map(r => `<li><span class="wpic">${dot(r.col)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${s.tubs[r.id]} scoops · ${esc(r.ings.map(i => INGR[i][0]).join(", "))}</small></span></li>`).join("")}</ul>` : `<p class="muted">Empty for now.</p>`) + shut;
}
export const RENO_LINE = "Boarded up for now, with scaffolding out front. The sign says: \"Coming soon: a craft brewery? A chocolatier?\" Someone's pencilled \"both!!\" underneath.";
