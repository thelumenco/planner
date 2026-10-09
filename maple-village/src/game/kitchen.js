// The kitchen behind the wine shop. Ingredients come from the backpack (send them to the kitchen from the backpack,
// or bring them over at the larder): garden crops, eggs and goat's milk from the animal run, olives from the olive
// tree, and flour, cheese and olives from Hana's deli shelf.
//   Oven: 1 flour bakes 2 loaves in an hour.   Cheese press: 2 milk make a cheese in 3 hours.
//   Stove: small plates for the tasting room (bread, olives, cheese boards, market treats), and the tapas of the day:
//   Mel picks one garden dish a day and cooks batches of it. At closing (10pm) any leftover tapas go to the staff for
//   dinner, and they leave something for the larder by way of thanks.
// State: F.kitchen = {larder: {id: n}, oven: {start, dur} | null, press: {start, dur} | null}; plates live in F.vine
// (v.menu for small plates, v.tapas = {day, id, plates} for today's tapas, v.staffNote for the last staff dinner).
import { esc, H } from "../util.js";
import { vineState } from "./vineyard.js";
import { dishArt } from "../art/wine.js";
import { icon } from "../art/icons.js";
import { seasonOf, SEASONS } from "../data/items.js";

export const GOODS = {
  carrot: ["carrot", "carrots"], corn: ["corn cob", "corn cobs"], strawberry: ["strawberry", "strawberries"], blueberry: ["blueberry", "blueberries"],
  tomato: ["tomato", "tomatoes"], potato: ["potato", "potatoes"], pepper: ["pepper", "peppers"], egg: ["egg", "eggs"], milk: ["milk", "milk"],
  flour: ["bag of flour", "bags of flour"], cheese: ["cheese", "cheeses"], olives: ["jar of olives", "jars of olives"], loaf: ["loaf", "loaves"],
  apple: ["apple", "apples"], dumpling: ["dumpling", "dumplings"], fish: ["fish", "fish"], toast: ["honey toast", "honey toasts"],
  pea: ["handful of peas", "handfuls of peas"], pumpkin: ["pumpkin", "pumpkins"], leek: ["leek", "leeks"],
  trout: ["rainbow trout", "rainbow trout"], crayfish: ["crayfish", "crayfish"], sardine: ["sardine", "sardines"], mackerel: ["mackerel", "mackerel"],
  seabream: ["sea bream", "sea bream"], squid: ["squid", "squid"], octopus: ["octopus", "octopuses"]};
export const isGood = id => id in GOODS;   // (loaves are only ever baked in the oven, but one taken out can go back in)
const nm = (id, n) => GOODS[id] ? GOODS[id][n === 1 ? 0 : 1] : id;
export const needText = need => Object.entries(need).map(([k, n]) => `${n} ${nm(k, n)}`).join(" + ");

// small plates for the tasting room, cooked at the stove
export const DISHES = {
  bread: {n: "Bread and butter", need: {loaf: 1}, plates: 4, price: 3},
  olives: {n: "Bowl of olives", need: {olives: 1}, plates: 4, price: 4},
  cheese: {n: "Cheese board", need: {cheese: 1, loaf: 1}, plates: 4, price: 8},
  dumplings: {n: "Dumplings", need: {dumpling: 2}, plates: 4, price: 6},
  honeytoast: {n: "Honey toast soldiers", need: {toast: 1}, plates: 3, price: 7},
  fish: {n: "Grilled fish", need: {fish: 1}, plates: 3, price: 8},
  apples: {n: "Apple slices", need: {apple: 2}, plates: 4, price: 3}};
// the tapas of the day: garden dishes, one chosen each day, 6 plates a batch
export const TAPAS = {
  patatas: {n: "Patatas bravas", need: {potato: 2, tomato: 1}, price: 8, seasons: ["autumn"]},
  tortilla: {n: "Tortilla española", need: {potato: 2, egg: 2}, price: 9, seasons: ["spring", "autumn", "winter"]},
  pancon: {n: "Pan con tomate", need: {loaf: 1, tomato: 2}, price: 7, seasons: ["summer", "autumn"]},
  pimientos: {n: "Pimientos asados", need: {pepper: 3}, price: 7, seasons: ["summer"]},
  fritters: {n: "Corn fritters", need: {corn: 2, egg: 1}, price: 7, seasons: ["summer", "autumn"]},
  carrots: {n: "Carrots with olives", need: {carrot: 2, olives: 1}, price: 6, seasons: ["spring", "autumn", "winter"]},
  crema: {n: "Strawberry crema", need: {strawberry: 2, milk: 1}, price: 9, seasons: ["spring"]},
  tostas: {n: "Tomato and cheese tostas", need: {loaf: 1, tomato: 1, cheese: 1}, price: 10, seasons: ["summer", "autumn"]},
  rellenos: {n: "Stuffed peppers", need: {pepper: 2, cheese: 1}, price: 10, seasons: ["summer"]},
  guisantes: {n: "Peas with mint and cheese", need: {pea: 2, cheese: 1}, price: 8, seasons: ["spring"]},
  croquetas: {n: "Pumpkin croquetas", need: {pumpkin: 1, egg: 1, loaf: 1}, price: 10, seasons: ["autumn", "winter"]},
  calabaza: {n: "Roast pumpkin with olives", need: {pumpkin: 1, olives: 1}, price: 8, seasons: ["autumn", "winter"]},
  puerros: {n: "Leek and potato soup cups", need: {leek: 2, potato: 1}, price: 8, seasons: ["winter"]},
  // from the fishing spots, all year round
  sardinas: {n: "Grilled sardines", need: {sardine: 3}, price: 8},
  escabeche: {n: "Mackerel escabeche", need: {mackerel: 2, pepper: 1}, price: 10},
  calamares: {n: "Fried calamari", need: {squid: 2, flour: 1}, price: 11},
  pulpo: {n: "Pulpo a la gallega", need: {octopus: 1, potato: 2}, price: 12},
  dorada: {n: "Sea bream with olives", need: {seabream: 1, olives: 1}, price: 11},
  trucha: {n: "Trout with almond butter", need: {trout: 2, milk: 1}, price: 10},
  cangrejos: {n: "Garlic crayfish on toast", need: {crayfish: 4, loaf: 1}, price: 10}};
export const inSeason = (id, season) => !TAPAS[id].seasons || TAPAS[id].seasons.includes(season);
export const TAPAS_PLATES = 6;
const OVEN = 1*H, PRESS = 3*H;

export function kitchenState(F){ F.kitchen = F.kitchen || {}; const k = F.kitchen; k.larder = k.larder || {}; if (!("oven" in k)) k.oven = null; if (!("press" in k)) k.press = null; return k; }
const has = (k, need) => Object.entries(need).every(([id, n]) => (k.larder[id] || 0) >= n);
const use = (k, need) => Object.entries(need).forEach(([id, n]) => { k.larder[id] -= n; if (k.larder[id] <= 0) delete k.larder[id]; });
const add = (k, id, n) => { k.larder[id] = (k.larder[id] || 0) + n; };
const left = t => t ? Math.max(0, t.start + t.dur - Date.now()) : 0;
const hrs = ms => { const m = Math.ceil(ms/60000); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m}m`; };

/* ---------- moving things in ---------- */
// from the backpack (F.inv) into the larder. n: how many (default all). -> how many moved
export function sendToKitchen(F, id, n){
  if (!isGood(id) || !(F.inv && F.inv[id] > 0)) return 0; const k = kitchenState(F), m = Math.min(F.inv[id], n || F.inv[id]);
  F.inv[id] -= m; if (F.inv[id] <= 0) delete F.inv[id]; add(k, id, m); return m;
}
export const backpackGoods = F => Object.keys(F.inv || {}).filter(id => isGood(id) && F.inv[id] > 0);

/* ---------- oven, press, stove ---------- */
export function bake(F){ const k = kitchenState(F); if (k.oven || !has(k, {flour: 1})) return null; use(k, {flour: 1}); k.oven = {start: Date.now(), dur: OVEN}; return "Loaves in the oven. Ready in an hour."; }
export function takeLoaves(F){ const k = kitchenState(F); if (!k.oven || left(k.oven)) return null; k.oven = null; add(k, "loaf", 2); return "Two warm loaves, into the larder. Smells amazing."; }
export function pressCheese(F){ const k = kitchenState(F); if (k.press || !has(k, {milk: 2})) return null; use(k, {milk: 2}); k.press = {start: Date.now(), dur: PRESS}; return "Milk in the press. Cheese in about three hours."; }
export function takeCheese(F){ const k = kitchenState(F); if (!k.press || left(k.press)) return null; k.press = null; add(k, "cheese", 1); return "A little round of cheese, into the larder."; }
export function cookDish(F, id){ const k = kitchenState(F), d = DISHES[id], v = vineState(F); if (!d || !has(k, d.need)) return null; use(k, d.need); v.menu[id] = (v.menu[id] || 0) + d.plates; return `${d.plates} plates of ${d.n.toLowerCase()}, out to the tasting room.`; }
export const tapasToday = (F, today) => { const v = vineState(F); return v.tapas && v.tapas.day === today ? v.tapas : null; };
// choose today's tapas (can change it until a batch is cooked)
export function chooseTapas(F, id, today){ const v = vineState(F), t = tapasToday(F, today); if (!TAPAS[id] || !inSeason(id, seasonOf(today)) || (t && t.cooked)) return null; v.tapas = {day: today, id, plates: 0, cooked: 0}; return `Today's tapas: ${TAPAS[id].n}. It's on the chalkboard.`; }
export function cookTapas(F, today){ const k = kitchenState(F), t = tapasToday(F, today); if (!t || !has(k, TAPAS[t.id].need)) return null; use(k, TAPAS[t.id].need); t.plates += TAPAS_PLATES; t.cooked++; return `${TAPAS_PLATES} plates of ${TAPAS[t.id].n.toLowerCase()}! Out they go.`; }
// At closing (or the next day), leftover tapas feed the staff, who leave something for the larder. -> note or null
const THANKS = [["olives", "Marco"], ["egg", "Ines"], ["flour", "Celeste"]];
export function staffDinner(F, today, hm){
  const v = vineState(F), t = v.tapas; if (!t || !t.plates || (t.day === today && hm < 22*60)) return null;
  const k = kitchenState(F), plates = t.plates, gifts = {};
  for (let i = 0; i < Math.ceil(plates/2); i++) { const [id] = THANKS[i % 3]; add(k, id, 1); gifts[id] = (gifts[id] || 0) + 1; }
  t.plates = 0; v.staffNote = {day: t.day, plates, dish: TAPAS[t.id] ? TAPAS[t.id].n : "tapas", gifts, seen: false};
  return v.staffNote;
}
export const staffLine = n => `Leftover ${n.dish.toLowerCase()} (${n.plates} plate${n.plates === 1 ? "" : "s"}) went to Marco, Ines and Celeste for dinner. They left ${Object.entries(n.gifts).map(([id, c]) => `${c} ${nm(id, c)}`).join(", ")} in the larder to say thanks.`;

/* ---------- Pilar, the cook ---------- */
// While she's on shift (and Mel hasn't sent her home in the staff card at the shop counter) Pilar runs the kitchen:
// takes out finished loaves and cheese, keeps the oven and press going, picks a tapas of the day if Mel hasn't
// (the dearest one the larder can make), cooks more when the last plates are going, and keeps small plates topped
// up with whatever's left. She never touches the backpack unless Mel ticks "fetch". -> list of things done
export const COOK = "pilar";
const cookLog = (k, line) => { k.log = [line, ...(k.log || [])].slice(0, 4); };
export function cookTick(F, today){
  const k = kitchenState(F), v = vineState(F), help = v.help || {}, done = [];
  if (help.cook === false) return done;
  if (help.fetch) { const moved = backpackGoods(F).map(x => [x, sendToKitchen(F, x)]).filter(([, n]) => n); if (moved.length) done.push(`brought in ${moved.map(([x, n]) => `${n} ${nm(x, n)}`).join(", ")} from your backpack`); }
  if (k.oven && !left(k.oven)) { takeLoaves(F); done.push("took two loaves out of the oven"); }
  if (k.press && !left(k.press)) { takeCheese(F); done.push("unwrapped a new cheese"); }
  if (!k.press && pressCheese(F)) done.push("started a cheese in the press");
  if (!k.oven && (k.larder.loaf || 0) < 3 && bake(F)) done.push("put bread in the oven");
  let t = tapasToday(F, today);
  if (!t) { const best = Object.keys(TAPAS).filter(id => inSeason(id, seasonOf(today)) && has(k, TAPAS[id].need)).sort((a, b) => TAPAS[b].price - TAPAS[a].price)[0];
    if (best) { chooseTapas(F, best, today); t = tapasToday(F, today); done.push(`chose ${TAPAS[best].n.toLowerCase()} for the tapas of the day`); } }
  if (t && t.plates < 2 && cookTapas(F, today)) done.push(`cooked ${TAPAS_PLATES} plates of ${TAPAS[t.id].n.toLowerCase()}`);
  // small plates from what's left, keeping back one more batch of the tapas
  const keep = t ? TAPAS[t.id].need : {};
  for (const id of Object.keys(DISHES)) { const d = DISHES[id]; if ((v.menu[id] || 0) >= 2) continue;
    const spare = Object.entries(d.need).every(([g, n]) => (k.larder[g] || 0) - (keep[g] || 0) >= n); if (spare && cookDish(F, id)) done.push(`made ${d.n.toLowerCase()}`); }
  if (done.length) { k.cookAt = Date.now(); cookLog(k, done.join(", ")); }
  return done;
}
export const cookLine = done => `Pilar ${done.length > 1 ? done.slice(0, -1).join(", ") + " and " + done[done.length - 1] : done[0]}.`;

/* ---------- panels ---------- */
const pic = (id, s = 34) => icon(id, s);
const larderGrid = k => { const ids = Object.keys(k.larder).filter(id => k.larder[id] > 0);
  return ids.length ? `<div class="kgoods">${ids.map(id => `<button class="kgood kbtn" data-k="take" data-id="${id}">${pic(id)}<b>${k.larder[id]}</b><small>${esc(nm(id, k.larder[id]))}</small><em>Take one</em></button>`).join("")}</div><p class="muted">Tap one to take it back to your backpack (for the Scoop Shack, or a gift).</p>` : `<p class="muted">Empty. Send ingredients here from your backpack.</p>`; };
const needList = (k, need) => Object.entries(need).map(([id, n]) => `<span class="kneed ${(k.larder[id] || 0) >= n ? "ok" : ""}">${pic(id, 22)}${n} ${esc(nm(id, n))} <small>(${k.larder[id] || 0})</small></span>`).join("");
export function larderPanel(F){
  const k = kitchenState(F), bag = backpackGoods(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The larder</h2>${larderGrid(k)}
    <h3 class="ph3">In your backpack</h3>${bag.length ? `<div class="kgoods">${bag.map(id => `<button class="kgood kbtn" data-k="send" data-id="${id}">${pic(id)}<b>${F.inv[id]}</b><small>${esc(nm(id, F.inv[id]))}</small><em>Bring in</em></button>`).join("")}</div>
    <div class="actions"><button class="btn primary small" data-k="sendall">Bring everything in</button></div>` : `<p class="muted">Nothing for the kitchen in your backpack right now. Crops from the garden, eggs and milk from the animal run, olives from the olive tree, and Hana's deli shelf all help.</p>`}
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function ovenPanel(F){
  const k = kitchenState(F), l = left(k.oven);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The oven</h2><p class="sub">One bag of flour bakes two loaves in an hour. Flour: ${k.larder.flour || 0} · loaves in the larder: ${k.larder.loaf || 0}.</p>
    ${k.oven ? (l ? `<p>Baking: ready in ${hrs(l)}.</p><span class="clbar"><i style="width:${Math.round(100*(1 - l/k.oven.dur))}%"></i></span>` : `<p>The loaves are ready!</p>`) : `<p class="muted">The oven's warm and empty.</p>`}
    <div class="actions">${k.oven ? (l ? "" : `<button class="btn primary" data-k="loaves">Take out the loaves</button>`) : `<button class="btn primary" data-k="bake" ${(k.larder.flour || 0) >= 1 ? "" : "disabled"}>Bake bread</button>`}<button class="btn alt small" data-close="1">Close</button></div>
    ${!(k.larder.flour) && !k.oven ? `<p class="muted">No flour in the larder. Hana's deli shelf has it.</p>` : ""}`;
}
export function pressPanel(F){
  const k = kitchenState(F), l = left(k.press);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The cheese press</h2><p class="sub">Two bottles of goat's milk make a little round of cheese in three hours. Milk: ${k.larder.milk || 0} · cheese in the larder: ${k.larder.cheese || 0}.</p>
    ${k.press ? (l ? `<p>Pressing: ready in ${hrs(l)}.</p><span class="clbar"><i style="width:${Math.round(100*(1 - l/k.press.dur))}%"></i></span>` : `<p>The cheese is ready!</p>`) : `<p class="muted">Empty.</p>`}
    <div class="actions">${k.press ? (l ? "" : `<button class="btn primary" data-k="cheese">Take out the cheese</button>`) : `<button class="btn primary" data-k="press" ${(k.larder.milk || 0) >= 2 ? "" : "disabled"}>Press cheese</button>`}<button class="btn alt small" data-close="1">Close</button></div>
    ${(k.larder.milk || 0) < 2 && !k.press ? `<p class="muted">Milk comes from a goat in the animal run at home (the market's Animals tab), or buy cheese ready-made on Hana's deli shelf.</p>` : ""}`;
}
export function stovePanel(F, today){
  const k = kitchenState(F), t = tapasToday(F, today), T = t && TAPAS[t.id];
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The stove</h2>`;
  const v = vineState(F), on = !v.help || v.help.cook !== false;
  h += `<p class="sub kcook">${on ? `Pilar runs the kitchen on her shifts (10am to 2:30pm, 4 to 9:30pm). You can still cook anything yourself.` : `Pilar's off for now. Turn her back on in the staff card at the shop counter.`}</p>${on && k.log && k.log.length ? `<ul class="klog">${k.log.map(l => `<li>${esc(l[0].toUpperCase() + l.slice(1))}.</li>`).join("")}</ul>` : ""}`;
  h += `<section class="ktapas"><h3 class="ph3">Tapas of the day</h3>`;
  if (t) h += `<div class="kdish chosen">${dishArt("tapas:" + t.id, 52)}<span><b>${esc(T.n)}</b><small>${t.plates} plate${t.plates === 1 ? "" : "s"} on the menu · ${T.price} coins each · needs ${needText(T.need)}</small><span class="kneeds">${needList(k, T.need)}</span></span></div>
      <div class="actions"><button class="btn primary" data-k="cooktapas" ${has(k, T.need) ? "" : "disabled"}>Cook a batch (${TAPAS_PLATES} plates)</button>${!t.cooked ? `<button class="btn alt small" data-k="untapas">Pick a different dish</button>` : ""}</div>
      <p class="muted">Leftovers at closing time (10pm) go to the staff for dinner.</p>`;
  else h += `<p class="sub">Pick today's dish. It goes on the chalkboard, sells for more than the small plates and brings extra people in. <b>${SEASONS[seasonOf(today)].n}</b> menu: ${SEASONS[seasonOf(today)].line.toLowerCase()}.</p><div class="kdishes">${Object.keys(TAPAS).filter(id => inSeason(id, seasonOf(today))).map(id => { const d = TAPAS[id], ok = has(k, d.need);
      return `<button class="kdish ${ok ? "ok" : ""}" data-k="tapas" data-id="${id}">${dishArt("tapas:" + id, 46)}<span><b>${esc(d.n)}</b><small>${d.price} coins a plate</small><span class="kneeds">${needList(k, d.need)}</span></span></button>`; }).join("")}</div>`;
  h += `</section><h3 class="ph3">Small plates</h3><div class="items shop dishes">${Object.keys(DISHES).map(id => { const d = DISHES[id], ok = has(k, d.need);
    return `<button class="item" data-k="dish" data-dish="${id}" ${ok ? "" : "disabled"}><span class="e">${dishArt(id, 44, !ok)}</span><span class="n">${esc(d.n)}</span><span class="c">${esc(needText(d.need))}</span><span class="d">${d.plates} plates · ${d.price} coins each</span></button>`; }).join("")}</div>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// api: {save, rerender, say, sfx, today}
export function wireKitchen(root, F, api){
  root.querySelectorAll("[data-k]").forEach(b => b.onclick = () => {
    const k = b.dataset.k, id = b.dataset.dish || b.dataset.id; let line = null;   // (dish buttons avoid data-id: the market claims .item[data-id])
    if (k === "send") { const n = sendToKitchen(F, id); if (n) line = `${n} ${nm(id, n)} into the larder.`; }
    else if (k === "take") { const kk = kitchenState(F); if ((kk.larder[id] || 0) > 0) { kk.larder[id]--; if (kk.larder[id] <= 0) delete kk.larder[id]; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1; line = `One ${nm(id, 1)} back in your backpack.`; } }
    else if (k === "sendall") { const moved = backpackGoods(F).map(x => [x, sendToKitchen(F, x)]).filter(([, n]) => n); if (moved.length) line = `Brought in ${moved.map(([x, n]) => `${n} ${nm(x, n)}`).join(", ")}.`; }
    else if (k === "bake") line = bake(F); else if (k === "loaves") line = takeLoaves(F);
    else if (k === "press") line = pressCheese(F); else if (k === "cheese") line = takeCheese(F);
    else if (k === "dish") line = cookDish(F, id);
    else if (k === "tapas") line = chooseTapas(F, id, api.today);
    else if (k === "untapas") { const v = vineState(F); if (v.tapas && !v.tapas.cooked) { v.tapas = null; line = "Okay, pick another."; } }
    else if (k === "cooktapas") line = cookTapas(F, api.today);
    if (line) { api.sfx(k === "send" || k === "sendall" ? "paper" : "chime"); api.say(line); api.save(); }
    api.rerender();
  });
}
