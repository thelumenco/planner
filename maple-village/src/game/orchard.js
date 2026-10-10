// Ma Ma's orchard and flower farm (logic and panels). Mel buys and plants; Ma Ma tends and picks what's ripe between
// 7am and 7pm into the farm shop. Villagers buy from the shop while it's open (9am to 6pm), and Ma Ma keeps the takings
// in a tin she hands to Mel when she visits. Mel can take fruit, bouquets and potted flowers from the shop for herself
// (free: only what her own trees and flowers have given). Saplings, bushes and seedlings are bought on the shop's
// Plant tab (or by tapping a spot). Trees and flowers belong to their seasons: when the season turns, they fade and
// the spot is replanted. See data/orchard.js for the catalogue and timings.
// State: F.orch = {trees[12], beds[12], bushes[4]: {k, at, next} | null, stock: {fruit|stem id: n}, tin, lastTick,
// today: {day, sold, coins}, tea}; potted flowers placed around the village live in F.pots {spot: flower id}.
import { esc, H, now, hash } from "../util.js";
import { ITEMS, seasonOf, SEASONS } from "../data/items.js";
import { TREES, treeOpen, FLOWERS, TREE_GROW, TREE_FIRST, TREE_AGAIN, BED_GROW, BED_AGAIN, BUSH_GROW, BUSH_AGAIN, BED_YIELD, BUSH_YIELD,
  BOUQUET_STEMS, POT_STEMS, STEM_PRICE, BOUQUET_PRICE, POT_PRICE, POT_SPOTS } from "../data/orchard.js";
import { icon } from "../art/icons.js";
import { treePic, flowerPic } from "../art/orchard.js";
import { toursOn, TOUR_FEE, fmtTime, TOURISTS, eventNow } from "./tours.js";
import { NPCS } from "../data/npcs.js";

export function orchState(F){
  F.orch = F.orch || {}; const o = F.orch;
  o.trees = o.trees || Array(12).fill(null); o.beds = o.beds || Array(12).fill(null); o.bushes = o.bushes || Array(4).fill(null);
  o.stock = o.stock || {}; o.tin = o.tin || 0; o.lastTick = o.lastTick || Date.now(); o.today = o.today || {day: "", sold: 0, coins: 0};
  F.pots = F.pots || {};
  return o;
}
const SPOTS = {tree: "trees", bed: "beds", bush: "bushes"};
const cat = where => where === "tree" ? TREES : FLOWERS;
const timing = where => where === "tree" ? [TREE_GROW, TREE_FIRST, TREE_AGAIN] : where === "bed" ? [BED_GROW, 0, BED_AGAIN] : [BUSH_GROW, 0, BUSH_AGAIN];
const hrs = ms => { const m = Math.ceil(ms/60000); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60 ? (m % 60) + "m" : ""}`.trim() : `${m}m`; };
export const nameOf = (where, id) => where === "tree" ? TREES[id].n : FLOWERS[id].n;
const stemName = (id, n) => `${n} ${n === 1 ? FLOWERS[id].one : FLOWERS[id].one + (/s$/.test(FLOWERS[id].one) ? "" : "s")}`;

// How a planted spot is doing. -> {stage: "empty"|"growing"|"budding"|"ripe"|"faded", g (0-1 towards the next stage), left (ms)}
export function stateOf(where, p, today){
  if (!p) return {stage: "empty", g: 0, left: 0};
  const C = cat(where)[p.k]; if (!C || !C.seasons.includes(seasonOf(today))) return {stage: "faded", g: 0, left: 0};
  const t = Date.now(), [grow] = timing(where);
  if (t < p.at + grow) return {stage: "growing", g: (t - p.at)/grow, left: p.at + grow - t};
  if (t < p.next) { const from = p.picked || p.at + grow; return {stage: "budding", g: Math.min(1, (t - from)/Math.max(1, p.next - from)), left: p.next - t}; }
  return {stage: "ripe", g: 1, left: 0};
}
// Plant in a spot (an empty one, or one whose plant has faded with the season). -> line for Maple, or null
export function plant(F, where, i, id, today){
  const o = orchState(F), list = o[SPOTS[where]], C = cat(where)[id];
  if (!C || !list || i < 0 || i >= list.length || !C.seasons.includes(seasonOf(today)) || (where === "tree" && !treeOpen(F, C))) return null;
  if (where !== "tree" && !!C.bush !== (where === "bush")) return null;
  const st = stateOf(where, list[i], today); if (st.stage !== "empty" && st.stage !== "faded") return null;
  if (F.coins < C.price) return null;
  F.coins -= C.price; const [grow, first] = timing(where), t = Date.now();
  list[i] = {k: id, at: t, next: t + grow + first};
  return where === "tree" ? `A little ${C.n.toLowerCase().replace(" tree", "")} sapling, in the ground. Ma Ma will water it. Fruit in about ${Math.round((grow + first)/H)} hours.`
    : `${C.n} ${where === "bush" ? "bush" : "seedlings"}, planted. Ma Ma's already fussing over them. Flowers in about ${Math.round(grow/H)} hours.`;
}

// Ma Ma's day in the orchard: she picks anything ripe (7am to 7pm), and villagers buy from the farm shop (9am to 6pm)
// for the minutes since the last tick (up to 12 hours back). Takings go in her tin. -> {picked: {id: n}, sold, coins} or null
export function orchTick(F, today){
  const o = orchState(F), t = Date.now(), off = now() - t, hm = (ms) => { const d = new Date(ms + off + 8*H); return d.getUTCHours()*60 + d.getUTCMinutes(); };
  const out = {picked: {}, sold: 0, coins: 0}; let any = false;
  if (hm(t) >= 7*60 && hm(t) < 19*60) for (const where of ["tree", "bed", "bush"]) o[SPOTS[where]].forEach(p => {
    if (stateOf(where, p, today).stage !== "ripe") return;
    const C = cat(where)[p.k], id = where === "tree" ? C.fruit : "stem:" + p.k, n = where === "tree" ? C.yield : where === "bed" ? BED_YIELD : BUSH_YIELD;
    o.stock[id] = (o.stock[id] || 0) + n; out.picked[id] = (out.picked[id] || 0) + n; p.picked = t; p.next = t + timing(where)[2]; any = true;
  });
  const mins = Math.min(1440, Math.floor((t - o.lastTick)/60000));
  if (mins >= 1) {
    if (t - o.lastTick > 1440*60000) o.lastTick = t - 1440*60000;
    o.lastTick += mins*60000;
    for (let k = mins; k > 0; k--) {
      const at = t - k*60000, m = hm(at), d = new Date(at + off + 8*H), we = [0, 6].includes(d.getUTCDay());
      // Sunday market mornings Ma Ma sells from her stall at the field instead (busier, from the same shelves)
      const mkt = eventNow(d.toISOString().slice(0, 10), m); if (!(mkt && mkt.kind === "market") && (m < 9*60 || m >= 18*60)) continue;
      const ids = Object.keys(o.stock).filter(x => o.stock[x] > 0); if (!ids.length) break;
      if (Math.random() < (mkt && mkt.kind === "market" ? .02 : .008*(we ? 1.5 : 1))) { const id = ids[Math.floor(Math.random()*ids.length)];
        o.stock[id]--; if (!o.stock[id]) delete o.stock[id];
        const price = id.startsWith("stem:") ? STEM_PRICE : (ITEMS[id] && ITEMS[id].sell) || 3; out.sold++; out.coins += price; }
    }
  }
  // tours that finished today pay into the tin, once there's something to show (three or more things planted)
  const shown = [...o.trees, ...o.beds, ...o.bushes].filter(Boolean).length, nowM = hm(t);
  if (!o.toursPaid || o.toursPaid.day !== today) o.toursPaid = {day: today, done: []};
  for (const tr of toursOn(today)) if (tr.to <= nowM && !o.toursPaid.done.includes(tr.i)) { o.toursPaid.done.push(tr.i); any = true;
    if (shown >= 3) { let fee = TOUR_FEE*tr.group.length;
      // the out-of-towners each buy something from the farm shop on their way out (if there's anything on the shelf)
      tr.group.filter(g => TOURISTS.includes(g)).forEach(() => { const ids = Object.keys(o.stock).filter(x => o.stock[x] > 0); if (!ids.length) return;
        const id = ids[Math.floor(Math.random()*ids.length)]; o.stock[id]--; if (!o.stock[id]) delete o.stock[id];
        fee += id.startsWith("stem:") ? STEM_PRICE*BOUQUET_STEMS : (ITEMS[id] && ITEMS[id].sell) || 3; o.today.sold = (o.today.sold || 0) + 1; });
      o.tin += fee; out.tours = (out.tours || []).concat({guide: tr.guide, n: tr.group.length, fee});
      if (o.today.day !== today) o.today = {day: today, sold: 0, coins: 0}; o.today.coins += fee; o.today.tours = (o.today.tours || 0) + 1; } }
  if (out.coins) { o.tin += out.coins; if (o.today.day !== today) o.today = {day: today, sold: 0, coins: 0}; o.today.sold += out.sold; o.today.coins += out.coins; any = true; }
  return any ? out : null;
}
// Ma Ma hands over the tin when Mel visits. -> coins
export function handTin(F){ const o = orchState(F), n = o.tin; if (!n) return 0; F.coins += n; o.tin = 0; return n; }
export const stemsOf = (o, id) => o.stock["stem:" + id] || 0;

// Take something from the farm shop (free from the harvest), or buy it when the shop's out. -> line or null
export function takeFruit(F, id, all){
  const o = orchState(F), n = Math.min(o.stock[id] || 0, all ? 99 : 1); if (!n) return null;
  o.stock[id] -= n; if (!o.stock[id]) delete o.stock[id]; F.inv[id] = (F.inv[id] || 0) + n;
  return `${n} ${n === 1 ? fruitName(id, 1) : fruitName(id, 2)} into your backpack.`;
}
const fruitName = (id, n) => { const t = Object.values(TREES).find(x => x.fruit === id); return t ? t.fn[n === 1 ? 0 : 1] : id; };
export function makeFlowers(F, kind, id){
  const o = orchState(F), need = kind === "bouquet" ? BOUQUET_STEMS : POT_STEMS; if (stemsOf(o, id) < need) return null;
  o.stock["stem:" + id] -= need; if (!o.stock["stem:" + id]) delete o.stock["stem:" + id];
  const item = (kind === "bouquet" ? "bq_" : "pot_") + id; F.inv[item] = (F.inv[item] || 0) + 1;
  return kind === "bouquet" ? `Ma Ma ties ${stemName(id, need)} with ribbon. A bouquet, into your backpack.` : `Ma Ma pots up ${stemName(id, need)}. Into your backpack, ready to place.`;
}
// Set a potted flower in one of the village's pot spots (replacing whatever was there). -> line or null
export function placePot(F, item, spot){
  const it = ITEMS[item]; if (!it || it.kind !== "pot" || !(F.inv[item] > 0) || !POT_SPOTS[spot]) return null;
  orchState(F); F.inv[item]--; if (!F.inv[item]) delete F.inv[item]; F.pots[spot] = it.flower;
  return `${FLOWERS[it.flower].n} in ${POT_SPOTS[spot].n}. So pretty.`;
}

/* ---------- panels ---------- */
const close = `<button class="btn alt small" data-close="1">Close</button>`;
export function spotPanel(F, where, i, today){
  const o = orchState(F), p = o[SPOTS[where]][i], st = stateOf(where, p, today), season = seasonOf(today);
  const title = where === "tree" ? `Tree ${i + 1}` : where === "bush" ? `Bush ${i + 1}` : `Flower bed ${i + 1}`;
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>${title}</h2>`;
  const pic = p ? (where === "tree" ? treePic(p.k, st.stage, 120) : flowerPic(p.k, st.stage, where === "bush", 120)) : "";
  if (st.stage === "empty" || st.stage === "faded") {
    const opts = Object.keys(cat(where)).filter(id => cat(where)[id].seasons.includes(season) && (where === "tree" ? treeOpen(F, cat(where)[id]) : !!cat(where)[id].bush === (where === "bush")));
    h += (st.stage === "faded" ? `<div class="orpic">${pic}</div><p class="sub">The ${nameOf(where, p.k).toLowerCase()} ${where === "tree" ? "has" : "have"} had their season. Plant something for ${SEASONS[season].n.toLowerCase()}.</p>`
      : `<p class="sub">An empty spot. What shall we plant? ${SEASONS[season].n} ${where === "tree" ? "saplings" : where === "bush" ? "bushes" : "seedlings"}, from Ma Ma's stall:</p>`);
    h += `<div class="items shop">${opts.map(id => { const C = cat(where)[id], off = F.coins < C.price;
      return `<button class="item" data-or="plant" data-k="${id}" ${off ? "disabled" : ""}><span class="e">${where === "tree" ? treePic(id, "ripe", 44, off) : flowerPic(id, "ripe", where === "bush", 44, off)}</span><span class="n">${esc(C.n)}</span><span class="c"><b>${C.price}</b> ${icon("coin", 13)}</span><span class="d">${where === "tree" ? `${C.yield} ${C.fn[1]} a day` : `${where === "bush" ? BUSH_YIELD : BED_YIELD} stems a picking`}</span></button>`; }).join("")}</div>`;
    h += `<p class="muted">You have ${F.coins} coins. Ma Ma does the watering and the picking.</p>`;
    return h + `<div class="actions">${close}</div>`;
  }
  const C = cat(where)[p.k];
  h += `<div class="orpic">${pic}</div><p class="sub">${esc(nameOf(where, p.k))}. ${st.stage === "growing" ? `Still growing: ${where === "tree" ? "fruit" : "flowers"} in about ${hrs(st.left + (where === "tree" ? TREE_FIRST : 0))}.`
    : st.stage === "budding" ? `${where === "tree" ? "Fruit ripening" : "In bud"}: ready in about ${hrs(st.left)}.` : `${where === "tree" ? "Ripe fruit" : "In full bloom"}! Ma Ma will pick ${where === "tree" ? "it" : "them"} for the farm shop.`}</p>
    <span class="clbar"><i style="width:${Math.round(st.g*100)}%"></i></span>
    <p class="muted">${where === "tree" ? `${C.yield} ${C.fn[1]} a day once it's fruiting.` : `${where === "bush" ? BUSH_YIELD : BED_YIELD} stems each picking.`} In season: ${C.seasons.map(s => SEASONS[s].n.toLowerCase()).join(", ")}.</p>`;
  return h + `<div class="actions">${close}</div>`;
}
// The farm shop's tabs: Plant (saplings, bushes and seedlings, bought and planted in the first free spot), Fruit and
// Flowers (only what Ma Ma has picked from Mel's own trees and beds: free for Mel to take)
// Bouquet orders: most days (not one in seven) someone in the village asks Ma Ma for a bouquet for an occasion. Hand
// over any bouquet from the backpack (make one here from the stems) for ORDER_PAY coins. One order a day.
const OCCASIONS = ["a birthday", "an anniversary dinner", "a new baby next door", "a get-well visit", "a thank-you for a neighbour", "a first date", "the café tables", "a housewarming"];
const ORDER_FROM = ["Rosa", "Bastien", "Noor", "Lila", "Celeste", "Felix", "Elena", "Mateo"];
export const ORDER_PAY = 25;
export function orderOf(today){ const h = hash(today + "bouquet"); return h % 7 === 0 ? null : {who: ORDER_FROM[(h >> 3) % ORDER_FROM.length], why: OCCASIONS[(h >> 6) % OCCASIONS.length]}; }
const bouquetIn = F => Object.keys(F.inv || {}).find(id => /^bq_/.test(id) && F.inv[id] > 0);
export function fillOrder(F, today){
  const o = orchState(F), q = orderOf(today), bq = bouquetIn(F); if (!q || o.orderDay === today || !bq) return null;
  F.inv[bq]--; if (!F.inv[bq]) delete F.inv[bq]; o.orderDay = today; F.coins += ORDER_PAY;
  return `Ma Ma wraps it in paper for ${q.who}: for ${q.why}. ${ORDER_PAY} coins in the tin for you!`;
}
function orderHtml(F, today){
  const o = orchState(F), q = orderOf(today); if (!q) return "";
  if (o.orderDay === today) return `<p class="krequest">${icon("heart", 16)} Today's bouquet order for ${esc(q.who)} is done. Ma Ma says thank you!</p>`;
  const bq = bouquetIn(F);
  return `<p class="krequest">${icon("heart", 16)} <b>Bouquet order:</b> ${esc(q.who)} would like a bouquet for ${esc(q.why)}. Pays ${ORDER_PAY} ${icon("coin", 13)}. <button class="btn small ${bq ? "primary" : "alt"}" data-or="order" ${bq ? "" : "disabled"}>${bq ? "Hand over a bouquet" : "Make a bouquet first"}</button></p>`;
}
export function shopPanel(F, today, tab, market){
  const o = orchState(F), fruit = Object.values(TREES).map(t => t.fruit).filter((x, i, a) => a.indexOf(x) === i), season = seasonOf(today);
  const anyPlanted = o.trees.some(Boolean) || o.beds.some(Boolean) || o.bushes.some(Boolean);
  tab = tab || (anyPlanted || market ? "fruit" : "plant"); if (market && tab === "plant") tab = "fruit";
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${market ? "Ma Ma's market stall" : "Ma Ma's farm shop"}</h2>`;
  h += `<p class="sub">${market ? `Ma Ma brought the farm shop's shelves to the Sunday market: fruit and flowers only. Still free for you; shoppers pay into the tin.${o.today.day === today && o.today.sold ? ` She's sold ${o.today.sold} thing${o.today.sold === 1 ? "" : "s"} today.` : ""}` : tab === "plant" ? `Saplings, bushes and seedlings for ${SEASONS[season].n.toLowerCase()}. Pick one and Ma Ma plants it in the next free spot (or tap a spot in the orchard or flower farm).`
    : `What Ma Ma picks from your trees and flowers goes on these shelves: free for you to take. Villagers buy the rest while it's open (9am to 6pm).${o.today.day === today && o.today.sold ? ` Today she's sold ${o.today.sold} thing${o.today.sold === 1 ? "" : "s"}.` : ""}`}</p>`;
  if (!market) h += tourLine(o, today) + orderHtml(F, today);
  h += `<div class="tabs" role="tablist">${[["plant", "Plant"], ["fruit", "Fruit"], ["flowers", "Flowers"]].filter(([k]) => !market || k !== "plant").map(([k, n]) => `<button role="tab" data-or="tab" data-k="${k}" aria-selected="${tab === k}">${n}</button>`).join("")}</div>`;
  if (tab === "plant") {
    for (const where of ["tree", "bush", "bed"]) {
      const free = o[SPOTS[where]].filter(p => { const st = stateOf(where, p, today).stage; return st === "empty" || st === "faded"; }).length;
      const opts = Object.keys(cat(where)).filter(id => cat(where)[id].seasons.includes(season) && (where === "tree" ? treeOpen(F, cat(where)[id]) : !!cat(where)[id].bush === (where === "bush")));
      h += `<h3 class="ph3">${where === "tree" ? "Fruit trees" : where === "bush" ? "Flower bushes" : "Flower seedlings"} <small class="muted">${free} free spot${free === 1 ? "" : "s"}${where === "tree" ? " in the orchard" : " at the flower farm"}</small></h3>`;
      h += `<div class="items shop">${opts.map(id => { const C = cat(where)[id], off = !free || F.coins < C.price;
        return `<button class="item" data-or="plantany" data-where="${where}" data-k="${id}" ${off ? "disabled" : ""}><span class="e">${where === "tree" ? treePic(id, "ripe", 44, off) : flowerPic(id, "ripe", where === "bush", 44, off)}</span><span class="n">${esc(C.n)}</span><span class="c"><b>${C.price}</b> ${icon("coin", 13)}</span><span class="d">${where === "tree" ? `${C.yield} ${C.fn[1]} a day` : `${where === "bush" ? BUSH_YIELD : BED_YIELD} stems a picking`}</span></button>`; }).join("")}</div>`;
    }
    h += `<p class="muted">You have ${F.coins} coins. Ma Ma does the watering and the picking. Trees and flowers last for their seasons, then the spot needs replanting.</p>`;
  } else if (tab === "fruit") {
    const have = fruit.filter(id => o.stock[id] > 0);
    h += have.length ? `<ul class="hlist wlist">${have.map(id => `<li><span class="wpic">${icon(id, 36)}</span><span class="wtxt"><b>${esc(fruitName(id, 2)[0].toUpperCase() + fruitName(id, 2).slice(1))}</b><small>${o.stock[id]} on the shelf</small></span><button class="btn small primary" data-or="take" data-k="${id}">Take one</button>${o.stock[id] > 1 ? `<button class="btn small alt" data-or="takeall" data-k="${id}">All</button>` : ""}</li>`).join("")}</ul>`
      : `<p class="muted">${o.trees.some(Boolean) ? "Nothing picked yet. Ma Ma picks the fruit as soon as it's ripe." : "No fruit yet. Plant some trees (the Plant tab) and Ma Ma will pick the fruit once it's ripe."}</p>`;
    h += `<p class="muted">Fruit can go to the wine shop's fruit crate, or to Maple.</p>`;
  } else {
    const ids = Object.keys(FLOWERS).filter(id => stemsOf(o, id) > 0);
    h += ids.length ? `<ul class="hlist wlist orflowers">${ids.map(id => { const s = stemsOf(o, id);
      return `<li><span class="wpic">${icon("bq_" + id, 36)}</span><span class="wtxt"><b>${esc(FLOWERS[id].n)}</b><small>${s} stem${s === 1 ? "" : "s"} picked</small></span>
        <span class="orbtns"><button class="btn small ${s >= BOUQUET_STEMS ? "primary" : "alt"}" data-or="make" data-kind="bouquet" data-k="${id}" ${s >= BOUQUET_STEMS ? "" : "disabled"}>Bouquet</button><button class="btn small ${s >= POT_STEMS ? "primary" : "alt"}" data-or="make" data-kind="pot" data-k="${id}" ${s >= POT_STEMS ? "" : "disabled"}>Pot</button></span></li>`; }).join("")}</ul>`
      : `<p class="muted">${o.beds.some(Boolean) || o.bushes.some(Boolean) ? "No flowers picked yet. Ma Ma cuts them as soon as they bloom." : "No flowers yet. Plant seedlings or bushes (the Plant tab) and Ma Ma will cut them when they bloom."}</p>`;
    h += `<p class="muted">A bouquet takes ${BOUQUET_STEMS} stems, a pot ${POT_STEMS}. Give bouquets to anyone in the village; set pots at home, outside the wine shop, or in your room (tap them in your backpack).</p>`;
  }
  return h + `<div class="actions">${close}</div>`;
}
// The tour board by the path: today's tours (or the next day there are some) and who's signed up for each
export function tourBoard(F, today, hmNow){
  const o = orchState(F), shown = [...o.trees, ...o.beds, ...o.bushes].filter(Boolean).length;
  const who = t => `<b>${esc(nm(t.guide))}</b> guiding. Signed up: ${t.group.map(g => esc(nm(g)) + (TOURISTS.includes(g) ? ` <small class="muted">(visiting)</small>` : "")).join(", ")}`;
  const row = (t, day) => { const st = day !== today ? "" : hmNow >= t.to ? "done" : hmNow >= t.from ? "on now" : "";
    return `<li><span class="wtxt"><b>${fmtTime(t.from)} to ${fmtTime(t.to)}</b>${st ? ` <small class="muted">${st}</small>` : ""}<small>${who(t)}</small><small>${t.group.length} × ${TOUR_FEE} coins = ${t.group.length*TOUR_FEE} coins</small></span></li>`; };
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Farm tours</h2>`;
  const todays = toursOn(today), left = todays.filter(t => t.to > hmNow);
  if (left.length) h += `<p class="sub">${left[0].from > hmNow ? `Next tour today at ${fmtTime(left[0].from)}.` : "A tour's going round right now."} Weekends at 10am, 11:30, 2pm and 4pm; Darren's on Tuesday and Thursday evenings.</p><ul class="hlist wlist">${todays.map(t => row(t, today)).join("")}</ul>`;
  else { let day = today, tours = [];
    for (let k = 1; k <= 7 && !tours.length; k++) { day = new Date(Date.parse(today + "T00:00:00Z") + k*864e5).toISOString().slice(0, 10); tours = toursOn(day); }
    const dn = new Date(day + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "long", timeZone: "UTC"});
    h += `<p class="sub">${todays.length ? "Today's tours are done. " : "No tours today. "}Next: ${Date.parse(day) - Date.parse(today) === 864e5 ? "tomorrow" : dn}, ${tours.map(t => fmtTime(t.from)).join(", ")}.</p><ul class="hlist wlist">${tours.map(t => row(t, day)).join("")}</ul>`; }
  if (o.today.day === today && o.today.tours) h += `<p class="muted">${o.today.tours} tour${o.today.tours === 1 ? "" : "s"} paid into Ma Ma's tin today.</p>`;
  if (shown < 3) h += `<p class="muted">Tours only pay once there's something to see: plant at least three trees or flowers (${shown} so far).</p>`;
  return h + `<div class="actions">${close}</div>`;
}
// Today's tours (and what they've brought in), or when the next ones are
const nm = id => (NPCS.find(n => n.id === id) || {name: id}).name;
function tourLine(o, today){
  const tours = toursOn(today), shown = [...o.trees, ...o.beds, ...o.bushes].filter(Boolean).length;
  const paid = o.today.day === today && o.today.tours ? ` ${o.today.tours} done so far today.` : "";
  if (!tours.length) return `<p class="muted ortour">Farm tours: weekends at 10am, 11:30, 2pm and 4pm, and Darren's on Tuesday and Thursday evenings. ${TOUR_FEE} coins a person, paid into Ma Ma's tin.</p>`;
  return `<p class="muted ortour">Tours today: ${tours.map(t => `${fmtTime(t.from)} with ${nm(t.guide)}`).join(", ")}. ${TOUR_FEE} coins a person.${paid}${shown < 3 ? " (Plant a few more things first: nobody pays to see bare ground.)" : ""}</p>`;
}
// Plant from the farm shop: the first empty (or faded) spot of that kind. -> line or null
export function plantAny(F, where, id, today){
  const o = orchState(F), i = o[SPOTS[where]].findIndex(p => { const st = stateOf(where, p, today).stage; return st === "empty" || st === "faded"; });
  return i < 0 ? null : plant(F, where, i, id, today);
}
export function potPanel(F, item){
  const it = ITEMS[item]; orchState(F);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>${esc(it ? it.n : "A pot")}</h2><p class="sub">Where shall it go?</p>
    <div class="vhelp">${Object.keys(POT_SPOTS).map(s => `<button class="vhelpi orspot" data-or="place" data-k="${s}"><span><b>${esc(POT_SPOTS[s].n[0].toUpperCase() + POT_SPOTS[s].n.slice(1))}</b><small>${F.pots[s] ? `${FLOWERS[F.pots[s]].n} there now` : "empty"}</small></span></button>`).join("")}</div>
    <div class="actions">${close}</div>`;
}
export function teaPanel(F, today, home){
  const o = orchState(F), had = o.tea === today;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Tea with Ma Ma</h2>
    <p class="sub">${!home ? "Ma Ma's out in the garden. The kettle's still warm, and there's cake under the cloth." : had ? "You've had tea today. Ma Ma's already wrapping a slice of cake for you to take home." : "Ma Ma's put the kettle on. There's pandan chiffon cake, and your favourite cup."}</p>
    <div class="actions">${home && !had ? `<button class="btn primary" data-or="tea">Have tea and cake</button>` : ""}${close}</div>`;
}
// api: {save, rerender, say, sfx, today, where, i, item, tab(k), tea()}
export function wireOrchard(root, F, api){
  root.querySelectorAll("[data-or]").forEach(b => b.onclick = () => {
    const k = b.dataset.or, id = b.dataset.k; let line = null, snd = "chime";
    if (k === "plant") { line = plant(F, api.where, api.i, id, api.today); snd = "coin"; }
    else if (k === "tab") { api.tab(id); return; }
    else if (k === "take") line = takeFruit(F, id); else if (k === "takeall") line = takeFruit(F, id, true);
    else if (k === "make") line = makeFlowers(F, b.dataset.kind, id);
    else if (k === "order") { line = fillOrder(F, api.today); snd = "coin"; }
    else if (k === "plantany") { line = plantAny(F, b.dataset.where, id, api.today); snd = "coin"; }
    else if (k === "place") { line = placePot(F, api.item, id); if (line) { api.sfx("chime"); api.say(line); api.save(); api.placed(); return; } }
    else if (k === "tea") { api.tea(); return; }
    if (line) { api.sfx(snd); api.say(line); api.save(); }
    api.rerender();
  });
}
