// Happenings (round 303, Mel: "I need more random events and setbacks in the game. Now have bought everything and am
// bored"; she picked storm night, the wine, a food critic, a coach party, big orders with deadlines and upkeep).
// Part one: storms, the critic, coach parties (and, in vineyard.js, the vinegar barrel and the birds at harvest).
// A morning roll (hapDaily) now and then brings one: a note in the mailbox (hapMail) says what's happened. Setbacks
// cost time and a few coins, never what she's built up: a storm breaks one thing until it's mended (a "Storm damage"
// label on it, tap to mend); a critic tries one of her shops and, if it's well stocked, writes it up (a busier week);
// a coach party fills one place for two hours. Nothing rolls while she's away on a trip. State: F.hap.
export const hapState = F => { const h = F.hap = F.hap || {}; for (const [k, v] of Object.entries({day: "", repairs: [], boosts: [], log: [], critic: null, lastCritic: "", lastCoach: ""})) if (h[k] === undefined) h[k] = v; return h; };

const addDays = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n*864e5).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z"))/864e5);
const note = (h, day, title, body) => { h.log = [{id: "hap-" + day + "-" + h.log.length, at: Date.parse(day + "T01:00:00Z") + h.log.length, title, body}, ...h.log].slice(0, 20); };
export const SHOP_N = {scoop: "the Scoop Shack", cocoa: "the Cocoa Room", wine: "the wine shop"};

/* ---------- storm damage ---------- */
// what a storm can break: {cost, scene, at: [x, y] for the label, what (for the note), mended (the line)}
export const REPAIR = {
  boat: {cost: 60, scene: "shore", at: [150, 470], what: "A branch came down across your boat at the jetty: the rail's cracked. No sailing until it's mended.", mended: "You and Bram fix the rail with a new length of oak and a lot of screws. She's ready to sail again."},
  trellis: {cost: 40, what: "The wind brought a trellis down on the vineyard: that row won't fruit until it's back up.", mended: "New posts, the wires pulled tight again, and the vines tied back on. They look relieved."},
  awning: {cost: 30, scene: "bay", at: [176, 282], what: "The Scoop Shack's striped awning tore in the wind. The deck's a bit sorry-looking, and quieter, until it's mended.", mended: "A new striped awning, snapping in the breeze. The deck looks like itself again."},
  bunting: {cost: 10, scene: "green", at: [380, 222], what: "The bunting on the bandstand was ripped to rags in the night.", mended: "You and Hana string up new bunting round the bandstand. It flutters like it's showing off."}
};
export function repairAt(F, id){ const r = hapState(F).repairs.find(x => x.id === id); if (!r) return null;
  if (r.kind === "trellis") { const row = r.row; return {scene: row < 3 ? "vineyard" : "lowervine", at: [340, (row < 3 ? [370, 420, 470][row] : [252, 334, 416, 498][row - 3]) - 34]}; }
  return {scene: REPAIR[r.kind].scene, at: REPAIR[r.kind].at}; }
export const broken = (F, kind) => hapState(F).repairs.some(r => r.kind === kind);
export function mend(F, id){
  const h = hapState(F), r = h.repairs.find(x => x.id === id); if (!r) return null; const R = REPAIR[r.kind];
  if ((F.coins || 0) < R.cost) return {line: `Mending it will cost ${R.cost} coins.`};
  F.coins -= R.cost; h.repairs = h.repairs.filter(x => x !== r);
  if (r.kind === "trellis" && F.vine && F.vine.rows && F.vine.rows[r.row]) delete F.vine.rows[r.row].down;
  return {ok: true, line: R.mended + ` (${R.cost} coins)`};
}
function storm(F, day, own, rnd){
  const h = hapState(F), can = [];
  if (own.boat && !broken(F, "boat")) can.push("boat");
  const rows = ((F.vine && F.vine.rows) || []).map((r, i) => r && r.trellis && !r.down && r.vines && r.vines.some(Boolean) ? i : -1).filter(i => i >= 0);
  if (rows.length) can.push("trellis");
  if (own.awning && !broken(F, "awning")) can.push("awning");
  if (!broken(F, "bunting")) can.push("bunting");
  const kind = can[Math.floor(rnd()*can.length)]; if (!kind) return null;
  const r = {id: kind + "-" + day, kind, day};
  if (kind === "trellis") { r.row = rows[Math.floor(rnd()*rows.length)]; F.vine.rows[r.row].down = true; }
  h.repairs.push(r);
  note(h, day, "Storm damage in the night", `${REPAIR[kind].what} Look for the "storm damage" label on it, and tap it to mend it (${REPAIR[kind].cost} coins).`);
  return r;
}

/* ---------- the critic and the coach party ---------- */
const CRITIC_HINT = ["A stranger with a notebook was in the village yesterday, asking about opening hours.", "Hana says a well-dressed visitor was asking which shops are worth a detour round here.", "Someone's booked a room above the pub for one night and asked the landlord which shops to try. They had a fountain pen."];
// stock: shop -> how much is on show; WELL: how much counts as "well stocked"
export const WELL = {scoop: 20, cocoa: 20, wine: 12};
function critic(F, day, own, rnd){
  const h = hapState(F), shops = Object.keys(SHOP_N).filter(k => own[k]); if (!shops.length) return null;
  const shop = shops[Math.floor(rnd()*shops.length)], hm = 11*60 + Math.floor(rnd()*5)*60;
  h.critic = {shop, day, hm}; h.lastCritic = day;
  note(h, day, "Word in the village", `${CRITIC_HINT[Math.floor(rnd()*CRITIC_HINT.length)]} The talk is they'll be trying ${SHOP_N[shop]} today, around ${hm/60 > 12 ? hm/60 - 12 + "pm" : hm/60 === 12 ? "midday" : hm/60 + "am"}. Make sure it's well stocked.`);
  return h.critic;
}
// the critic's visit, once its hour has come (or the day has gone): well stocked -> a good review and a busier week
export function judge(F, day, hm, stockOf){
  const h = hapState(F), c = h.critic; if (!c || c.done || (day === c.day && hm < c.hm) || day < c.day) return null;
  const n = stockOf(c.shop), good = n >= WELL[c.shop]; c.done = true;
  if (good) { h.boosts.push({shop: c.shop, from: addDays(c.day, 1), to: addDays(c.day, 7), x: 1.3, why: "review"});
    note(h, c.day, `A review in the Honeybrook Gazette: ${SHOP_N[c.shop]}`, `"An absolute find. The shelves were full, the welcome was warm, and I'd go back tomorrow." The critic, it turns out, was the stranger with the notebook. Expect ${SHOP_N[c.shop]} to be busier all week.`); }
  else note(h, c.day, `A review in the Honeybrook Gazette: ${SHOP_N[c.shop]}`, `"Charming, but the shelves were looking a little bare when I called in. One to watch." A lukewarm write-up: no harm done, but a chance missed. A fuller shop next time.`);
  h.critic = null; return {good, shop: c.shop};
}
const COACH = {bay: {shops: ["scoop", "cocoa"], n: "the bay"}, vineyard: {shops: ["wine"], n: "the vineyard"}};
function coach(F, day, own, rnd){
  const h = hapState(F), places = Object.keys(COACH).filter(p => COACH[p].shops.some(s => own[s])); if (!places.length) return null;
  const p = places[Math.floor(rnd()*places.length)], from = rnd() < .5 ? 11*60 : 14*60;
  COACH[p].shops.filter(s => own[s]).forEach(s => h.boosts.push({shop: s, from: day, to: day, hm: [from, from + 120], x: 3, why: "coach"}));
  h.lastCoach = day;
  note(h, day, "A coach party today", `A coach is booked in at ${COACH[p].n} at ${from === 11*60 ? "11am" : "2pm"}: forty people, all hungry and in holiday mood, for two hours. ${COACH[p].shops.filter(s => own[s]).map(s => SHOP_N[s]).join(" and ").replace(/^./, x => x.toUpperCase())} will be rushed off ${COACH[p].shops.filter(s => own[s]).length > 1 ? "their" : "its"} feet: stock up beforehand.`);
  return p;
}

/* ---------- the morning roll ---------- */
// own: {scoop, cocoa, wine, boat, awning}; o: {stormy (last night), away (on a trip), rnd}
export function hapDaily(F, day, own, o = {}){
  const h = hapState(F); if (h.day === day) return []; const first = !h.day; h.day = day;
  h.boosts = h.boosts.filter(b => b.to >= day);
  if (first || o.away) return [];
  const rnd = o.rnd || Math.random, out = [];
  if (o.stormy && rnd() < .6) { const r = storm(F, day, own, rnd); if (r) out.push("storm"); }
  // harvest weeks: the starlings, unless the vines are netted
  if (o.harvest && o.birds && rnd() < .5) { const n = o.birds(rnd); if (n) { out.push("birds");
    note(h, day, "Starlings in the vineyard", `A cloud of starlings came down on the ripe grapes at first light: ${n} vine${n > 1 ? "s" : ""} picked clean before anyone could shoo them off. Water ${n > 1 ? "them" : "it"} again and ${n > 1 ? "they'll" : "it'll"} fruit again. Bird netting from the vineyard shop keeps them off for good.`); } }
  if (!h.critic && (!h.lastCritic || daysBetween(h.lastCritic, day) >= 14) && rnd() < 1/20) { if (critic(F, day, own, rnd)) out.push("critic"); }
  else if ((!h.lastCoach || daysBetween(h.lastCoach, day) >= 5) && rnd() < 1/10) { if (coach(F, day, own, rnd)) out.push("coach"); }
  return out;
}
// how much busier a shop is right now (a good review, a coach party; a torn awning makes the deck quieter)
export function boost(F, shop, day, hm){
  const h = F && F.hap; if (!h) return 1; let f = 1;
  for (const b of h.boosts) if (b.shop === shop && day >= b.from && day <= b.to && (!b.hm || (hm >= b.hm[0] && hm < b.hm[1]))) f *= b.x;
  if (shop === "scoop" && h.repairs.some(r => r.kind === "awning")) f *= .85;
  return f;
}
export const hapMail = F => ((F.hap && F.hap.log) || []).map(n => ({id: n.id, from: "postie", at: n.at, title: n.title, body: n.body}));
