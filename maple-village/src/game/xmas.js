// The Christmas market (round 172, Mel: "let's do Christmas markets and gift hampers"). Every evening 5 to 9 from 20
// November to Christmas Eve on the field (game/tours.js XMAS, eventsOn). This file: the treats eaten on the spot, the
// mulled wine stall, the tree (lit at 5:30; the very first night, the village counts it down), and Mel's own stall and
// the hampers (round 173).
// State: F.xmas = {lit: {year: true}, treats: n}
import { esc } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";
import { XMAS_LIT, xmasOn, carolsNow, grottoOn, grottoNow, lanternWalkNow, GROTTO } from "./tours.js";
import { hash } from "../util.js";

export function xmasState(F){ F.xmas = F.xmas || {}; const x = F.xmas; x.lit = x.lit || {}; x.treats = x.treats || 0; return x; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;

// treats: bought and eaten (or drunk) right there, a cone or a cup for Evan too when he's along
export const TREATS = {
  xm_chestnut: {n: "A cone of roast chestnuts", price: 3, say: ["Hot chestnuts in a paper cone. You peel one and burn your fingers, every single time. Worth it.", "Sweet, smoky, a bit floury. Christmas in a paper cone."], evan: ["hot hot hot!", "more nuts Mama!"]},
  xm_hotchoc: {n: "Hot chocolate", price: 3, say: ["Thick hot chocolate from the Scoop Shack's winter stand. Both hands round the cup.", "Rich and not too sweet. Sofia used the Cocoa Room's dark."], evan: ["chocolate moustache!", "yummy!"]},
  xm_hotchoc_m: {n: "Hot chocolate with marshmallows", price: 4, say: ["A mountain of marshmallows, slowly melting into the chocolate. Sofia doesn't do half measures.", "Marshmallows first, then the chocolate. That's the rule."], evan: ["MARSHMALLOWS!", "I got the pink one!"]}
};
export const treatsHTML = (st, coins) => (st.treats || []).length ? `<div class="actions">${st.treats.map(id => { const t = TREATS[id];
  return `<button class="btn ${coins >= t.price ? "primary" : "alt"}" data-xtreat="${id}" ${coins >= t.price ? "" : "disabled"}>${icon(id, 18)} ${esc(t.n)} · ${t.price} ${icon("coin", 13)}</button>`; }).join("")}</div>` : "";

// the mulled wine stall: cups from Mel's own pot in the wine shop kitchen
export function mulledStallPanel(F, o = {}){
  const m = F.mull || {}, r = (m.recipes || []).find(x => x.id === m.cupId);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Mulled wine</h2>`;
  if (!(m.cups > 0)) return h + `<p class="sub">${o.keeper ? `Celeste's got the urn and a stack of cups, and nothing to pour. "Your pot's empty, boss. Mull another and I'll ladle it."` : "The urn's empty and nobody's minding it."} The pot's in the wine shop kitchen: a bottle of your red and two or three things to mull it with.</p>` + shut;
  h += `<p class="sub">${o.keeper ? `Celeste ladles ${esc(r ? r.name : "mulled wine")} into paper cups, a slice of orange on each. "Mind, it's hot!"` : `An urn of ${esc(r ? r.name : "mulled wine")}, and an honesty tin.`} ${m.cups} cup${m.cups === 1 ? "" : "s"} left, ${m.price || 5} coins a cup. It sells faster here than at the shop: everyone's cold hands want one.</p>`;
  return h + `<div class="actions"><button class="btn primary" data-xtreat="mulled">${icon("xm_mulled", 18)} A cup for you (on the house)</button></div>` + shut;
}

// the tree: dark before half past five, lit after
export const firstNight = day => day.slice(5) === "11-20";
// (the very first night it stays dark till the village has counted it down, or five minutes after if Mel's not there)
export const treeLit = (day, hm, F) => xmasOn(day) && hm >= XMAS_LIT && hm < 23*60 && (!firstNight(day) || hm >= XMAS_LIT + 5 || !!(F && F.xmas && F.xmas.lit && F.xmas.lit[day.slice(0, 4)]));
// the countdown's due: the first night, Mel on the field, between 5:28 and 5:35, not yet done this year
export const countdownDue = (F, day, hm) => firstNight(day) && hm >= XMAS_LIT - 2 && hm < XMAS_LIT + 5 && !xmasState(F).lit[day.slice(0, 4)];
export function treePanel(F, day, hm){
  const lit = treeLit(day, hm, F), x = xmasState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The Christmas tree</h2>`;
  if (carolsNow(day, hm)) return h + `<p class="sub">Carols by the tree. Everyone's got a song sheet and a cup of something warm; Hana's leading, a bit flat, very loud. Pick the next one.</p>
    <div class="actions">${CAROL_SONGS.map((c, i) => `<button class="btn ${x.sung && x.sung[day] && x.sung[day].includes(i) ? "alt" : "primary"}" data-xcarol="${i}">${esc(c.n)}</button>`).join("")}</div>` + shut;
  if (lanternWalkNow(day, hm)) return h + `<p class="sub">Christmas Eve. The whole village is lining up with paper lanterns for the walk round the field, the last thing before the market closes for the year.</p><div class="actions"><button class="btn primary" data-xlwalk="1">Take a lantern and join in</button></div>` + shut;
  h += `<p class="sub">${lit ? "The big tree on the football pitch, lit up: hundreds of warm white lights, Hana's straw stars, and a gold star on top that Gong Gong insists is crooked." : firstNight(day) ? "The big tree on the football pitch, dark for now. At half past five the whole village counts down and the lights go on for the first time this year." : "The big tree on the football pitch. The lights come on at half past five, every evening till Christmas Eve."}</p>`;
  return h + shut;
}

/* ---------- round 173: Mel's own stall (place 2) ---------- */
// Up to six kinds of things she's made: mill oils, soaps and lotions, honey from the hives, her cheeses, Cocoa Room bars
// and boxes, hampers, and bottles off the wine shop's shelves. They sell at their sell price (never above what they
// cost to buy), faster while she stands behind it. With the Mill Shop open, Hazel minds it while she's away;
// otherwise it's an honesty tin and goes slowly. Unsold things wait in the stall's crate for the next evening.
// F.xmas.stall = {goods: {id: n}, wine: {shelfId: {name, type, price, n}}}, F.xmas.sold = {day: {n, coins}}
export const STALL_KINDS = 6;
const HONEYS = ["honey", "honey_lav", "honey_blossom", "honey_cream", "honeycomb"];
export const stallGood = id => !!ITEMS[id] && (!!ITEMS[id].mill || !!ITEMS[id].hamper || /^chz_/.test(id) || HONEYS.includes(id) || /^bar_(milk|dark|white)$|^box(4|9|16)d?$/.test(id));
export const worth = id => { const it = ITEMS[id]; return !it ? 0 : Math.min(it.price || 0, it.sell != null ? it.sell : Math.round((it.price || 0)*.8)); };
function stallState(F){ const x = xmasState(F); x.stall = x.stall || {}; x.stall.goods = x.stall.goods || {}; x.stall.wine = x.stall.wine || {}; x.sold = x.sold || {}; return x.stall; }
const kindsOut = st => Object.keys(st.goods).filter(id => st.goods[id] > 0).length + Object.keys(st.wine).filter(id => st.wine[id].n > 0).length;
export function putOut(F, id, n = 99){ const st = stallState(F), have = (F.inv || {})[id] || 0, k = Math.min(n, have);
  if (!k || !stallGood(id) || (!(st.goods[id] > 0) && kindsOut(st) >= STALL_KINDS)) return 0; F.inv[id] -= k; if (F.inv[id] <= 0) delete F.inv[id]; st.goods[id] = (st.goods[id] || 0) + k; return k; }
export function takeBack(F, id){ const st = stallState(F), k = st.goods[id] || 0; if (!k) return 0; delete st.goods[id]; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + k; return k; }
// v = vineState(F): a bottle at a time off the shelves
export function putWine(F, v, shelfId){ const st = stallState(F), b = v.shelf.find(x => x.id === shelfId); if (!b || !(b.n > 0) || (!(st.wine[shelfId] && st.wine[shelfId].n > 0) && kindsOut(st) >= STALL_KINDS)) return 0;
  b.n--; const w = st.wine[shelfId] = st.wine[shelfId] || {name: b.name, type: b.type, price: b.price, n: 0}; w.n++; return 1; }
export function takeWine(F, v, shelfId){ const st = stallState(F), w = st.wine[shelfId]; if (!w || !w.n) return 0; const b = v.shelf.find(x => x.id === shelfId), k = w.n;
  if (b) b.n += k; else v.shelf.push({id: shelfId, name: w.name, type: w.type, n: k, price: w.price, open: 0}); delete st.wine[shelfId]; return k; }
// one minute of the market: mode "mel" (she's behind it), "hazel" (minding it), "tin" (the honesty tin) -> coins
export function stallSellMinute(F, day, mode){
  const st = stallState(F), ids = Object.keys(st.goods).filter(id => st.goods[id] > 0 && ITEMS[id]), wines = Object.keys(st.wine).filter(id => st.wine[id].n > 0);
  if (!ids.length && !wines.length) return 0; const p = mode === "mel" ? .1 : mode === "hazel" ? .05 : .02; if (Math.random() >= p) return 0;
  const all = [...ids.map(id => ["g", id]), ...wines.map(id => ["w", id])], [k, id] = all[Math.floor(Math.random()*all.length)];
  let coins; if (k === "g") { coins = worth(id); st.goods[id]--; if (!st.goods[id]) delete st.goods[id]; } else { coins = st.wine[id].price; st.wine[id].n--; if (!st.wine[id].n) delete st.wine[id]; }
  const s = xmasState(F).sold[day] = xmasState(F).sold[day] || {n: 0, coins: 0}; s.n++; s.coins += coins; return coins; }
export function myStallPanel(F, v, o = {}){
  const st = stallState(F), day = o.day, s = xmasState(F).sold[day] || {n: 0, coins: 0}, full = kindsOut(st) >= STALL_KINDS;
  const on = Object.keys(st.goods).filter(id => st.goods[id] > 0 && ITEMS[id]), wines = Object.keys(st.wine).filter(id => st.wine[id].n > 0);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Your stall</h2><p class="sub">${o.here ? "You're behind your own stall, garland and all. Shoppers stop more while you're here." : o.hazel ? "Hazel's minding it for you, in her good red scarf: \"Go on, have a wander. I've got it.\"" : "Nobody's behind it just now, so it's on the honesty tin: it sells, but slowly."} ${s.n ? `Sold tonight: ${s.n}, for ${s.coins} coins.` : "Nothing sold yet tonight."}</p>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">On the stall (${kindsOut(st)} of ${STALL_KINDS})</p>`;
  h += on.length || wines.length ? `<ul class="hlist wlist">${on.map(id => `<li><span class="wpic">${icon(ITEMS[id].ico || id, 28)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${st.goods[id]} out · ${worth(id)} each</small></span><button class="btn small alt" data-xst="take:${id}">Take back</button></li>`).join("")}${wines.map(id => `<li><span class="wpic">${icon("wine_" + (["red", "rose", "white", "sparkling"].includes(st.wine[id].type) ? st.wine[id].type : "red"), 28)}</span><span class="wtxt"><b>${esc(st.wine[id].name)}</b><small>${st.wine[id].n} bottle${st.wine[id].n === 1 ? "" : "s"} · ${st.wine[id].price} each</small></span><button class="btn small alt" data-xst="unwine:${id}">Back to the shelves</button></li>`).join("")}</ul>` : `<p class="muted">Nothing out yet. Put out up to six kinds of things you've made.</p>`;
  const bag = Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && stallGood(id) && (!full || st.goods[id] > 0));
  if (bag.length) h += `<p class="eyebrow" style="margin:10px 0 6px">From your backpack</p><ul class="hlist wlist orflowers">${bag.map(id => `<li><span class="wpic">${icon(ITEMS[id].ico || id, 28)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${F.inv[id]} with you · sells for ${worth(id)}</small></span><span class="orbtns"><button class="btn small primary" data-xst="put:${id}:1">Put out 1</button><button class="btn small alt" data-xst="put:${id}:99">All</button></span></li>`).join("")}</ul>`;
  const reds = (v.shelf || []).filter(b => b.n > 0 && (!full || (st.wine[b.id] && st.wine[b.id].n > 0)));
  if (reds.length) h += `<p class="eyebrow" style="margin:10px 0 6px">From the wine shop's shelves</p><div class="actions">${reds.map(b => `<button class="btn small alt" data-xst="wine:${b.id}">A bottle of ${esc(b.name)} (${b.n})</button>`).join("")}</div>`;
  if (!bag.length && !reds.length && !full) h += `<p class="muted">Nothing in your backpack for the stall: soaps, oils and lotions from the mill, honey, your cheeses, Cocoa Room bars and boxes, or a hamper from the post office.</p>`;
  if (full) h += `<p class="muted">Six kinds is all the stall holds. Take something back to make room.</p>`;
  return h + shut;
}

/* ---------- round 173: hampers, packed at the post office ---------- */
// A wicker basket from Penny's hamper table (small: three things, big: six), filled with things Mel's made (the same
// goods as the stall, plus a bottle off the wine shelves). Each packed hamper is its own item, named after what's in
// it. It's worth what its contents fetch plus the basket, and never more than they'd cost to buy.
// F.xmas.hampers = [{id, size, items: [id | {wine, type, price}], name}]; F.xmas.pack = {size, items}
export const BASKETS = {small: {n: "Small basket", holds: 3, price: 4}, big: {n: "Big basket", holds: 6, price: 8}};
const catOf = x => typeof x === "object" ? "wine" : /^chz_/.test(x) ? "cheese" : HONEYS.includes(x) || /^bar_|^box/.test(x) ? "sweet" : ITEMS[x] && ITEMS[x].mill === "oil" ? "oil" : ITEMS[x] && ITEMS[x].mill ? "pamper" : "other";
export function hamperName(items, size){
  const cats = [...new Set(items.map(catOf))];
  if (size === "big" && cats.length >= 4) return "The Grand Honeybrook";
  if (cats.length === 1) return {cheese: "The Cheese Lover's", sweet: "Sweet Tooth", oil: "The Olive Grove", pamper: "The Pamper", wine: "The Cellar Door"}[cats[0]] || "The Honeybrook";
  if (cats.length === 2 && cats.includes("wine") && cats.includes("cheese")) return "Wine and Cheese";
  if (cats.length === 2 && cats.includes("sweet") && cats.includes("pamper")) return "Treat Yourself";
  if (cats.length === 2 && cats.includes("oil") && cats.includes("cheese")) return "The Mediterranean";
  return "The Honeybrook";
}
const itemPrice = x => typeof x === "object" ? x.price : (ITEMS[x] || {}).price || 0, itemSell = x => typeof x === "object" ? x.price : worth(x);
export const hamperValue = (items, size) => { const b = BASKETS[size].price, buy = items.reduce((a, x) => a + itemPrice(x), 0) + b; return {price: buy, sell: Math.min(buy, items.reduce((a, x) => a + itemSell(x), 0) + b)}; };
export const hamperGood = id => stallGood(id) && !(ITEMS[id] && ITEMS[id].hamper);
const xname = x => typeof x === "object" ? `a bottle of ${x.wine}` : (ITEMS[x] ? ITEMS[x].n : x);
export function registerHampers(F){ (xmasState(F).hampers || []).forEach(hp => { const v = hamperValue(hp.items, hp.size);
  ITEMS[hp.id] = {n: `${hp.name} hamper`, kind: "gift", to: "family", hamper: true, price: v.price, sell: v.sell, ico: hp.size === "big" ? "hamper_big" : "hamper_small",
    what: hp.items.map(xname).join(", "), say: `A hamper! ${hp.items.length === 3 ? "Three" : "Six"} things you made, tied up with a ribbon. Look at all this!`}; }); }
// the basket being packed: choose a size, add things from the backpack (or a bottle off the shelves), then tie it up
export function packStart(F, size){ if (!BASKETS[size] || F.coins < BASKETS[size].price) return false; const x = xmasState(F); if (x.pack) return false; F.coins -= BASKETS[size].price; x.pack = {size, items: []}; return true; }
export function packAdd(F, id){ const x = xmasState(F), pk = x.pack; if (!pk || pk.items.length >= BASKETS[pk.size].holds || !hamperGood(id) || !((F.inv || {})[id] > 0)) return false; F.inv[id]--; if (F.inv[id] <= 0) delete F.inv[id]; pk.items.push(id); return true; }
export function packWine(F, v, shelfId){ const x = xmasState(F), pk = x.pack, b = v.shelf.find(s => s.id === shelfId); if (!pk || pk.items.length >= BASKETS[pk.size].holds || !b || !(b.n > 0)) return false; b.n--; pk.items.push({wine: b.name, type: b.type, price: b.price, shelf: b.id}); return true; }
export function packRemove(F, v, i){ const x = xmasState(F), pk = x.pack; if (!pk || !pk.items[i]) return false; const it = pk.items.splice(i, 1)[0];
  if (typeof it === "object") { const b = v.shelf.find(s => s.id === it.shelf); if (b) b.n++; else v.shelf.push({id: it.shelf, name: it.wine, type: it.type, n: 1, price: it.price, open: 0}); } else { F.inv = F.inv || {}; F.inv[it] = (F.inv[it] || 0) + 1; } return true; }
export function packTie(F){ const x = xmasState(F), pk = x.pack; if (!pk || pk.items.length !== BASKETS[pk.size].holds) return null;
  x.hampers = x.hampers || []; x.made = (x.made || 0) + 1; const hp = {id: "hamper_" + x.made, size: pk.size, items: pk.items, name: hamperName(pk.items, pk.size)}; x.hampers.push(hp); x.pack = null;
  registerHampers(F); F.inv = F.inv || {}; F.inv[hp.id] = 1; return hp; }
export function hamperPanel(F, v, o = {}){
  const x = xmasState(F), pk = x.pack;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The hamper table</h2>`;
  if (!pk) return h + `<p class="sub">Penny's set up a table by the window: wicker baskets, straw, red ribbon and gift tags. "Pick a basket, fill it with things you've made, and I'll tie the bow."</p>
    <div class="actions">${Object.entries(BASKETS).map(([k, b]) => `<button class="btn ${F.coins >= b.price ? "primary" : "alt"}" data-xh="start:${k}" ${F.coins >= b.price ? "" : "disabled"}>${esc(b.n)}: ${b.holds} things · ${b.price} ${icon("coin", 13)}</button>`).join("")}</div>
    <p class="muted">A packed hamper makes a lovely gift, sells from your stall at the Christmas market, and Penny will post one for you.</p>` + postHTML(F, o) + shut;
  const holds = BASKETS[pk.size].holds, val = hamperValue(pk.items, pk.size);
  h += `<p class="sub">${esc(BASKETS[pk.size].n)}: ${pk.items.length} of ${holds} in.${pk.items.length ? ` So far it's shaping up as ${esc(hamperName(pk.items, pk.size))}, worth ${val.sell} coins.` : ""}</p>`;
  if (pk.items.length) h += `<ul class="hlist wlist">${pk.items.map((it, i) => `<li><span class="wpic">${icon(typeof it === "object" ? "wine_" + (["red", "rose", "white", "sparkling"].includes(it.type) ? it.type : "red") : (ITEMS[it] || {}).ico || it, 28)}</span><span class="wtxt"><b>${esc(typeof it === "object" ? it.wine : ITEMS[it].n)}</b></span><button class="btn small alt" data-xh="out:${i}">Take out</button></li>`).join("")}</ul>`;
  if (pk.items.length < holds) { const bag = Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && hamperGood(id)), bottles = (v.shelf || []).filter(b => b.n > 0);
    h += bag.length || bottles.length ? `<p class="eyebrow" style="margin:10px 0 6px">Add from your backpack</p><div class="actions">${bag.map(id => `<button class="btn small alt" data-xh="add:${id}">${icon(ITEMS[id].ico || id, 16)} ${esc(ITEMS[id].n)} (${F.inv[id]})</button>`).join("")}${bottles.map(b => `<button class="btn small alt" data-xh="wine:${b.id}">A bottle of ${esc(b.name)} (${b.n})</button>`).join("")}</div>`
      : `<p class="muted">Nothing in your backpack for a hamper: soaps, oils and lotions from the mill, honey, your cheeses, Cocoa Room bars and boxes. Or a bottle off the wine shelves.</p>`; }
  return h + `<div class="actions">${pk.items.length === holds ? `<button class="btn primary" data-xh="tie">Tie the bow</button>` : ""}</div>` + shut;
}


/* ---------- round 174: carols, the grotto, the lantern walk ---------- */
// carols (all old enough to be everyone's): pick one, everybody sings
export const CAROL_SONGS = [
  {n: "Silent Night", a: "Silent night, holy night...", b: "All is calm, all is bright..."},
  {n: "Deck the Halls", a: "Deck the halls with boughs of holly...", b: "Fa la la la la, la la la la!"},
  {n: "Jingle Bells", a: "Dashing through the snow...", b: "Jingle bells, jingle bells, jingle all the way!"},
  {n: "O Christmas Tree", a: "O Christmas tree, O Christmas tree...", b: "How lovely are thy branches!"},
  {n: "The Holly and the Ivy", a: "The holly and the ivy, when they are both full grown...", b: "Of all the trees that are in the wood, the holly bears the crown."},
  {n: "We Wish You a Merry Christmas", a: "We wish you a merry Christmas...", b: "And a happy new year!"}];
export function singCarol(F, day, i){ const x = xmasState(F); x.sung = x.sung || {}; x.sung[day] = x.sung[day] || []; const fresh = !x.sung[day].includes(i); if (fresh) x.sung[day].push(i); x.carols = (x.carols || 0) + 1; return {song: CAROL_SONGS[i], fresh}; }
// the lantern walk: once a year Mel gets to keep her lantern
export function lanternWalk(F, day){ const x = xmasState(F); x.walk = x.walk || {}; const yr = day.slice(0, 4), first = !x.walk[yr]; x.walk[yr] = true; return first; }

// Santa's grotto: weekend evenings 5 to 8, by the picnic spot. Evan whispers his wish, gets a little present, and the
// first visit each Christmas, a photo with Santa to keep
export const WISHES = ["a red fire truck. A BIG one.", "a dinosaur that roars for real.", "snow. Just some snow, please.", "a puppy. Or two puppies.", "a rocket to the moon, for him and Maple.", "that Mama and Papa get a present too."];
export const GIFTS = [["xm_ginger", "a gingerbread person"], ["xm_yoyo", "a painted yo-yo"], ["xm_star", "a little straw star"]];
export function grottoPanel(F, day, hm, o = {}){
  const x = xmasState(F); let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Santa's grotto</h2>`;
  if (!grottoOn(day)) return h + `<p class="sub">A little wooden hut with snow painted on the roof and a sign: "Santa's grotto. Saturday and Sunday evenings, 5 till 8." It's shut till the weekend.</p>` + shut;
  if (!grottoNow(day, hm)) return h + `<p class="sub">The grotto's ${hm < GROTTO[0] ? "not open yet: Santa comes at 5" : "shut for tonight. Santa's gone home for his tea"}.</p>` + shut;
  if ((x.grotto || {})[day]) return h + `<p class="sub">Santa waves through the window. "Evan's been already tonight! I've written his wish in my book, don't you worry."</p>` + shut;
  if (!o.evan) return h + `<p class="sub">Santa in his big chair, a sack of little parcels beside him, the elf (it's Pip) checking names on a clipboard. "Is there a young man called Evan coming tonight?"</p><p class="muted">Bring Evan along.</p>` + shut;
  return h + `<p class="sub">Santa in his big chair, a sack of little parcels beside him. Pip, as the elf, is checking names on a clipboard. Evan's gone very quiet and is holding your hand tight.</p><div class="actions"><button class="btn primary" data-xgrotto="1">Evan goes in to see Santa</button></div>` + shut;
}
export function grottoVisit(F, day){
  const x = xmasState(F); x.grotto = x.grotto || {}; if (x.grotto[day]) return null; x.grotto[day] = true;
  const wish = WISHES[hash(day + "w") % WISHES.length], g = GIFTS[hash(day + "g") % GIFTS.length], yr = day.slice(0, 4); x.photo = x.photo || {};
  const photo = !x.photo[yr]; x.photo[yr] = true; return {wish, gift: g[0], giftN: g[1], photo};
}

/* ---------- round 174: posting hampers, and orders ---------- */
// Penny posts a hamper to the family, a villager, or a friend from the campervan trips (once Mel's met them there).
// The family write back (ten minutes), villagers (half an hour; now and then they want one for someone else), friends
// far away the next day, with a postcard and a little something from where they live.
export const RECIPS = [
  {id: "mumdad", n: "Mum and Dad", kind: "family"}, {id: "mamagg", n: "Ma Ma and Gong Gong", kind: "family"}, {id: "marcusang", n: "Marcus and Angellina", kind: "family"},
  {id: "hana", n: "Hana", kind: "village"}, {id: "okada", n: "Mr Okada", kind: "village"}, {id: "juniper", n: "Juniper", kind: "village"}, {id: "opal", n: "Opal", kind: "village"}, {id: "celeste", n: "Celeste", kind: "village"}, {id: "lin", n: "Lin", kind: "village"},
  {id: "bvkel", n: "Kel at the Cellar Door", kind: "friend", stop: "bv_cellar", gift: "b_print", sign: "Cheers, Kel", body: i => `G'day Mel,\n\nYour hamper made it all the way to the Cellar Door! The ${i} went down a treat with the team at smoko. I've popped a print of the valley in the post, so you don't forget us.`},
  {id: "crwin", n: "Win at the lighthouse", kind: "friend", stop: "bv_lighthouse", gift: "b_chime", sign: "Warmly, Win", body: i => `Dear Mel,\n\nThe postman carried your hamper up the lighthouse steps, puffing all the way. The ${i} is on the tearoom counter for everyone to admire. Here's a little shell wind chime for your window.`},
  {id: "tlkirra", n: "Kirra at Misty Falls", kind: "friend", stop: "bv_falls", gift: "b_seedpod", sign: "Kirra", body: i => `Hey Mel,\n\nHamper landed at the ranger station! Shared it round at lunch and the ${i} was gone in minutes. Here's a seed pod from the falls track. Plant it somewhere warm.`},
  {id: "lvarnaud", n: "Madame Arnaud at Rosehill", kind: "friend", stop: "bv_perfume", gift: "b_lavbunch", sign: "Avec affection, Madame Arnaud", body: i => `Chère Mel,\n\nYour hamper arrived at Rosehill. The ${i}: magnifique. I send you a bunch of our lavender, dried in the old barn. Put it under your pillow.`}];
export const recipsFor = F => RECIPS.filter(r => r.kind !== "friend" || !!(F.bellbird && F.bellbird.stamps && F.bellbird.stamps[r.stop]));
const FAM_NOTE = {
  mumdad: (i, hp) => `Dear Mel,\n\nThe hamper came this morning! Dad had the ${i} open before I'd even read the tag. We're saving the rest for Christmas Eve, if he lets us.\n\nLove, Mum and Dad xx`,
  mamagg: (i, hp) => `Ah girl,\n\nSo big, the basket! Gong Gong carried it in like a trophy. Ma Ma is keeping the ${i} for when you all come over. You work too hard, you know. Thank you, thank you.\n\nMa Ma (and Gong Gong)`,
  marcusang: (i, hp) => `Zeh!\n\nThe ${hp.name} hamper arrived. Angie has claimed the ${i}${hp.items.some(x => /^chz_/.test(x)) ? " (and the cheese, obviously, she says it's for my own good)" : ""}. I've claimed the basket. Thank you, seriously.\n\nMarcus and Angellina`};
const firstName = hp => { const it = hp.items.find(x => typeof x === "string") || hp.items[0]; return (typeof it === "object" ? `bottle of ${it.wine}` : (ITEMS[it] || {n: "treats"}).n).replace(/^(A|An) /, "").toLowerCase(); };
export function sendHamper(F, id, to, now){
  const r = RECIPS.find(x => x.id === to), hp = (xmasState(F).hampers || []).find(h => h.id === id); if (!r || !hp || !((F.inv || {})[id] > 0)) return null;
  F.inv[id]--; if (F.inv[id] <= 0) delete F.inv[id];
  const x = xmasState(F), M = 60000, at = now + (r.kind === "family" ? 10*M : r.kind === "village" ? 30*M : 864e5);
  x.replies = [...(x.replies || []), {id: `hreply-${to}-${now}`, to, hamper: id, at, order: r.kind === "village" && hash(id + to) % 2 === 0}].slice(-40);
  x.sent = (x.sent || 0) + 1; return {r, hp};
}
export function hamperMail(F, now){
  return (xmasState(F).replies || []).filter(p => p.at <= now).map(p => { const r = RECIPS.find(x => x.id === p.to) || {n: "someone"}, hp = (xmasState(F).hampers || []).find(h => h.id === p.hamper) || {name: "Honeybrook", items: []}, i = firstName(hp);
    const body = r.kind === "family" ? FAM_NOTE[r.id](i, hp) : r.kind === "friend" ? `${r.body(i)}\n\n${r.sign}` : `Dear Mel,\n\nWhat a lovely surprise on my doorstep! The ${i} is already open. Merry Christmas to you and yours!${p.order ? "\n\nP.S. Could you make one for my sister? I've pinned a note up at the post office." : ""}\n\n${r.n}`;
    return {id: p.id, from: "postie", at: p.at, title: r.kind === "friend" ? `A postcard from ${r.n.replace(/ at .*$/, "")}` : `Thank you from ${r.n}`, body}; });
}
// arrived replies whose little something (friends) or new order (villagers) hasn't been handed over yet
export function collectReplies(F, now){ const x = xmasState(F), out = [];
  (x.replies || []).filter(p => p.at <= now && !p.done).forEach(p => { p.done = true; const r = RECIPS.find(y => y.id === p.to) || {};
    if (r.gift) { F.inv = F.inv || {}; F.inv[r.gift] = (F.inv[r.gift] || 0) + 1; out.push({gift: r.gift, from: r.n}); }
    if (p.order) { x.orders = [...(x.orders || []), mkOrder(p.id, r.n.replace(/^Mr /, "Mr ") + "'s sister", hash(p.id))]; out.push({order: true, from: r.n}); } });
  return out; }
// orders, from the 1st of December: two a day pinned up by the hamper table (and any a villager asks for)
const WANT = {cheese: "something cheesy", sweet: "something sweet", wine: "something to drink", pamper: "something for the bath", oil: "a good olive oil"};
const ORDER_FOLK = ["Opal's book club", "the Okadas next door", "Juniper's mum", "Bo's teacher", "Lin's grandparents", "Theo's new neighbours", "the library volunteers", "Hana's landlord"];
function mkOrder(id, who, h){ const cats = Object.keys(WANT), a = cats[h % cats.length], b = cats[(h >> 3) % cats.length], big = (h >> 6) % 3 === 0;
  return {id, who, wants: a === b ? [a] : [a, b], size: big ? "big" : "small"}; }
export function ordersOn(F, day){ if (!xmasOn(day) || day.slice(5) < "12-01") return []; const x = xmasState(F), filled = x.filled || {};
  return [0, 1].map(k => mkOrder(`${day}:${k}`, ORDER_FOLK[hash(day + ":o" + k) % ORDER_FOLK.length], hash(day + ":" + k))).concat(x.orders || []).filter(o => !filled[o.id]); }
export const orderText = o => `${o.who}: a ${o.size} hamper with ${o.wants.map(w => WANT[w]).join(" and ")}`;
export const fits = (hp, o) => hp && hp.size === o.size && o.wants.every(w => hp.items.some(i => catOf(i) === w));
export function fillOrder(F, oid, hid, day){ const o = ordersOn(F, day).find(x => x.id === oid), hp = (xmasState(F).hampers || []).find(h => h.id === hid);
  if (!o || !fits(hp, o) || !((F.inv || {})[hid] > 0)) return 0; const pay = hamperValue(hp.items, hp.size).price; F.inv[hid]--; if (F.inv[hid] <= 0) delete F.inv[hid];
  const x = xmasState(F); x.filled = x.filled || {}; x.filled[oid] = true; x.orders = (x.orders || []).filter(y => y.id !== oid); F.coins += pay; return pay; }

function postHTML(F, o){
  const mine = (xmasState(F).hampers || []).filter(hp => (F.inv || {})[hp.id] > 0), pick = o.pick && mine.find(hp => hp.id === o.pick), orders = ordersOn(F, o.day || "");
  let h = "";
  if (orders.length) h += `<p class="eyebrow" style="margin:12px 0 6px">Orders pinned up by the table</p><ul class="hlist wlist">${orders.map(od => { const fit = mine.find(hp => fits(hp, od));
    return `<li><span class="wtxt"><b>${esc(orderText(od))}</b><small>${fit ? `Your ${esc(fit.name.replace(/^The /, ""))} hamper would do` : "Nothing packed that fits yet"}</small></span>${fit ? `<button class="btn small primary" data-xh="fill:${od.id}|${fit.id}">Fill it</button>` : ""}</li>`; }).join("")}</ul>`;
  if (!mine.length) return h;
  h += `<p class="eyebrow" style="margin:12px 0 6px">Post a hamper</p><div class="actions">${mine.map(hp => `<button class="btn small ${pick && pick.id === hp.id ? "primary" : "alt"}" data-xh="pick:${hp.id}">${icon(hp.size === "big" ? "hamper_big" : "hamper_small", 16)} ${esc(hp.name)}</button>`).join("")}</div>`;
  if (pick) h += `<p class="muted">Where to? Penny weighs it and sticks on the stamps.</p><div class="actions">${recipsFor(F).map(r => `<button class="btn small alt" data-xh="send:${r.id}">${esc(r.n)}</button>`).join("")}</div>`;
  return h;
}
