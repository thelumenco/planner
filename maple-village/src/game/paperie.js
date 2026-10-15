// The paperie in Montrose (round 183: "I want handmade paper, like deckled paper... you have to shred it, then
// there's a paper slurry, and then you got to press it, and then you got to dry it... I also want seeded paper...
// as I add each item, the look changes"). A goal (1,500 coins), bought at the empty shopfront in Montrose's lanes
// (Lavender Hills, a van day trip). The player makes every sheet herself in the back room, one batch at a time:
//   scraps   bundles of scrap paper: wine labels, chocolate wrappers, receipts. Each of the player's shops at home puts one
//            aside a day (up to 12 wait), and they ride up in the van when she visits; or buy a bundle here (3 coins)
//   soak     two bundles torn into the tub of water: soft in 15 minutes
//   beat     into pulp in the vat, in a colour: natural (free), blush or sage (2 coins of pigment), ink blue (3)
//   add-in   one, if she likes: lavender, rose petals, wildflower petals, tea leaves, gold flecks, wildflower seeds
//            (seeded paper: plant it and wildflowers come up, round 3). Lavender and roses can come from her backpack
//   pull     the mould and deckle through the vat: six wet sheets, couched onto felts
//   press    the screw press squeezes the water out: 5 minutes
//   dry      pegged on the line: dry by the same time tomorrow (so they're ready next visit). Torn deckle edges.
// Dry sheets go on the shop's shelves, or into the backpack (they're gifts too). Round 1: the shop sells while the player's
// in Montrose (she turns the sign round); a keeper, the class and the seasonal rushes come later.
// State: F.paperie = {scraps, scrapDay, soak: {done}, soaked, pulp: {col, add}, wet: {col, add, n}, press: {col, add,
// n, done}, line: [{col, add, n, done}], stock: {id: n}, sold: {day: {n, coins}}, at, made}
import { ITEMS, CROPS } from "../data/items.js";
import { esc, LOC } from "../util.js";
import { icon } from "../art/icons.js";

export const COLOURS = {
  natural: {n: "Natural", col: "#EFE6D2", cost: 0},
  blush: {n: "Blush", col: "#F2C4C4", cost: 2},
  sage: {n: "Sage", col: "#C6D6B2", cost: 2},
  ink: {n: "Ink blue", col: "#9DB4D0", cost: 3}
};
export const ADDS = {
  none: {n: "Plain", cost: 0, bonus: 0},
  lavender: {n: "Lavender", cost: 2, bonus: 1, inv: "bq_lavender", word: "with lavender"},
  rose: {n: "Rose petals", cost: 2, bonus: 1, inv: "bq_rose", word: "with rose petals"},
  petals: {n: "Wildflower petals", cost: 2, bonus: 1, word: "with wildflower petals"},
  tea: {n: "Tea leaves", cost: 1, bonus: 1, word: "with tea leaves"},
  gold: {n: "Gold flecks", cost: 5, bonus: 3, word: "with gold flecks"},
  seeds: {n: "Wildflower seeds", cost: 4, bonus: 2, word: "seeded"}
};
export const BATCH = 6, SOAK = 2, SCRAP_PRICE = 3, SOAK_MIN = 15, PRESS_MIN = 5, DRY_MS = 864e5, LINE = 4, SCRAP_CAP = 12, BASE = 5;
const M = 60000;
const now = () => Date.now() + (globalThis.__hbOffset || 0);

export const sheetId = (col, add) => `pp_${col}_${add}`;
export const sheetName = (col, add) => add === "seeds" ? `Seeded ${COLOURS[col].n.toLowerCase()} paper` : `${COLOURS[col].n} handmade paper${add === "none" ? "" : " " + ADDS[add].word}`;
export const sheetPrice = (col, add) => BASE + ADDS[add].bonus + (col === "ink" ? 1 : 0);
// every sheet the player can make is an item (a gift, or stock for the shelves)
for (const col of Object.keys(COLOURS)) for (const add of Object.keys(ADDS)) ITEMS[sheetId(col, add)] = {n: sheetName(col, add), kind: "gift", to: ["hana", "posy", "farid", "tomi"], price: sheetPrice(col, add), ico: sheetId(col, add), paper: true,
  what: "A deckled sheet, made by hand in Montrose.", say: add === "seeds" ? "Paper with seeds in it? I can plant this? I'm planting this." : "Handmade paper! Look at the edges. I'm going to write you a proper letter on this."};

export function paperState(F){ const p = F.paperie = F.paperie || {}; p.scraps = p.scraps || 0; p.line = p.line || []; p.stock = p.stock || {}; p.sold = p.sold || {}; return p; }

// scraps from home: one bundle a day from each shop the player runs, waiting till she drives up (12 at most)
export function homeShops(F){ const g = F.goals || {}; return [F.scoop && "the Scoop Shack", g.cocoa && "the Cocoa Room", F.vine && F.vine.shelf && "the wine shop", g.mill && "the mill", g.giftshop && "the gift shop"].filter(Boolean); }
export function scrapsWaiting(F, day){
  const p = paperState(F); if (!p.scrapDay) return 0;
  const days = Math.max(0, Math.round((Date.parse(day) - Date.parse(p.scrapDay))/864e5));
  return Math.min(SCRAP_CAP, days*homeShops(F).length);
}
export function collectScraps(F, day){ const p = paperState(F), n = scrapsWaiting(F, day); p.scrapDay = day; p.scraps += n; return n; }
export function buyScraps(F, n = 1){ const p = paperState(F); if (F.coins < n*SCRAP_PRICE) return 0; F.coins -= n*SCRAP_PRICE; p.scraps += n; return n; }

// what's happening at each station, for the panels and the art
export function stage(F, t = now()){
  const p = paperState(F);
  return {soaking: !!p.soak && p.soak.done > t, soaked: !!p.soak && p.soak.done <= t, pulp: p.pulp || null, wet: p.wet || null,
    pressing: !!p.press && p.press.done > t, pressed: !!p.press && p.press.done <= t, line: p.line.map(s => ({...s, dry: s.done <= t}))};
}
export function startSoak(F, t = now()){ const p = paperState(F); if (p.soak || p.pulp || p.scraps < SOAK) return false; p.scraps -= SOAK; p.soak = {done: t + SOAK_MIN*M}; return true; }
export function beat(F, col, t = now()){
  const p = paperState(F), c = COLOURS[col]; if (!c || !p.soak || p.soak.done > t || p.pulp || F.coins < c.cost) return false;
  F.coins -= c.cost; p.soak = null; p.pulp = {col, add: "none"}; return true;
}
// one add-in stirred into the vat: from the backpack if she has it (lavender, roses), else bought from the jars
export function addIn(F, add){
  const p = paperState(F), a = ADDS[add]; if (!a || add === "none" || !p.pulp || p.pulp.add !== "none") return null;
  if (a.inv && (F.inv || {})[a.inv] > 0) { F.inv[a.inv]--; if (F.inv[a.inv] <= 0) delete F.inv[a.inv]; p.pulp.add = add; return "bag"; }
  if (F.coins < a.cost) return null; F.coins -= a.cost; p.pulp.add = add; return "jar";
}
export function pull(F){ const p = paperState(F); if (!p.pulp || p.wet) return false; p.wet = {...p.pulp, n: BATCH}; p.pulp = null; return true; }
export function startPress(F, t = now()){ const p = paperState(F); if (!p.wet || p.press) return false; p.press = {...p.wet, done: t + PRESS_MIN*M}; p.wet = null; return true; }
export function hang(F, t = now()){ const p = paperState(F); if (!p.press || p.press.done > t || p.line.length >= LINE) return false; p.line.push({col: p.press.col, add: p.press.add, n: p.press.n, done: t + DRY_MS}); p.press = null; return true; }
// take the dry sheets down: onto the shop's shelves -> how many
export function takeDown(F, t = now()){
  const p = paperState(F), dry = p.line.filter(s => s.done <= t); if (!dry.length) return 0;
  p.line = p.line.filter(s => s.done > t); let n = 0;
  dry.forEach(s => { const id = sheetId(s.col, s.add); p.stock[id] = (p.stock[id] || 0) + s.n; n += s.n; }); p.made = (p.made || 0) + n; return n;
}
export function toBag(F, id, n = 1){ const p = paperState(F), k = Math.min(n, p.stock[id] || 0); if (!k) return 0; p.stock[id] -= k; if (!p.stock[id]) delete p.stock[id]; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + k; return k; }
export function toShelf(F, id, n = 99){ const p = paperState(F), k = Math.min(n, (F.inv || {})[id] || 0); if (!k || !ITEMS[id] || !ITEMS[id].paper) return 0; F.inv[id] -= k; if (F.inv[id] <= 0) delete F.inv[id]; p.stock[id] = (p.stock[id] || 0) + k; return k; }

// round 3 (round 186): Lise keeps the shop when the player's away (10 to 5, closed Mondays; a goal, "paperkeeper"), for a wage
// each day she opens. She takes dry sheets off the line onto the shelves too. Saturdays 2 to 4 there's a card-making
// class (four people, four sheets off the shelves, 8 coins each) if Lise or the player is there to run it. And the shop's
// busier in the gift seasons: the fortnight before Valentine's, early May (Mother's Day) and December.
export const KEEP = {from: 10*60, to: 17*60, closed: [1]}, WAGE = 12, CLASS = {dow: 6, from: 14*60, to: 16*60, size: 4, fee: 8};
const dowOf = day => new Date(day + "T00:00:00Z").getUTCDay();
export const keeperHired = F => !!(F.goals && F.goals.paperkeeper);
export const keeperIn = (day, hm) => hm >= KEEP.from && hm < KEEP.to && !KEEP.closed.includes(dowOf(day));
export const paperSeason = day => { const md = day.slice(5); return (md >= "02-01" && md <= "02-14") || (md >= "05-01" && md <= "05-14") || (md >= "12-01" && md <= "12-24"); };
export const classOn = (day, hm) => dowOf(day) === CLASS.dow && hm >= CLASS.from && hm < CLASS.to;
const sheetsIn = p => Object.values(p.stock).reduce((a, n) => a + n, 0);
function takeSheets(p, n){ let k = 0; while (k < n) { const ids = Object.keys(p.stock).filter(id => p.stock[id] > 0); if (!ids.length) break; const id = ids[k % ids.length]; p.stock[id]--; if (!p.stock[id]) delete p.stock[id]; k++; } return k; }

// minute by minute since the last look (at most two days): here = the player's in Montrose
export function paperTick(F, here, t = now()){
  const p = paperState(F), out = {n: 0, coins: 0, wage: 0, cls: 0, down: 0}, kept = keeperHired(F);
  if (!p.at || (!here && !kept)) { p.at = t; return out; }
  for (let at = Math.max(p.at, t - 2*864e5) + M; at <= t; at += M) {
    const sg = new Date(at + LOC()), day = sg.toISOString().slice(0, 10), hm = sg.getUTCHours()*60 + sg.getUTCMinutes();
    const lise = kept && keeperIn(day, hm), open = here || lise, s = () => (p.sold[day] = p.sold[day] || {n: 0, coins: 0});
    if (lise && p.wageDay !== day) { p.wageDay = day; F.coins -= WAGE; s().wage = WAGE; out.wage += WAGE; }
    if (lise) { const d = takeDown(F, at); if (d) out.down += d; }
    if (open && dowOf(day) === CLASS.dow && hm === CLASS.to - 1 && p.classDay !== day && sheetsIn(p) >= CLASS.size) {   // the class finishes: four cards made, four fees
      p.classDay = day; takeSheets(p, CLASS.size); const fee = CLASS.size*CLASS.fee; s().cls = fee; s().coins += fee; out.coins += fee; out.cls += fee; }
    if (!open) continue;
    const ids = Object.keys(p.stock).filter(id => p.stock[id] > 0); if (!ids.length || Math.random() >= (here ? .05 : .03)*(paperSeason(day) ? 2 : 1)) continue;
    const id = ids[Math.floor(Math.random()*ids.length)], k = Math.min(p.stock[id], Math.random() < .3 ? 2 : 1), coins = k*ITEMS[id].price;
    p.stock[id] -= k; if (!p.stock[id]) delete p.stock[id]; s().n += k; s().coins += coins; out.n += k; out.coins += coins;
  }
  p.at = t; F.coins += out.coins; return out;
}

// seeded paper grows: a seeded sheet or tag planted in a garden plot comes up as wildflowers in two days
CROPS.wildflower = {n: "Wildflowers", ns: "bunches of wildflowers", dur: 48*3600e3, yield: 3, ico: "wildflower"};
ITEMS.wildflower = {n: "Wildflowers", kind: "flower", sell: 3, ico: "wildflower", say: "Wildflowers! Cornflowers, poppies, a daisy. From the seed paper?"};
for (const col of Object.keys(COLOURS)) Object.assign(ITEMS[sheetId(col, "seeds")], {crop: "wildflower", plantable: true});
// and friends who get a gift with a seeded tag plant it: two days later, a letter about the flowers
export function bloomFor(F, id, who, at = now()){ const it = ITEMS[id]; if (!it || !it.wrapped) return false;
  const w = (paperState(F).wraps || []).find(r => r.id === id); if (!w || w.tag !== "seeded") return false;
  const p = paperState(F); p.blooms = [...(p.blooms || []), {who, at: at + 2*864e5, id: `bloom-${who}-${at}`}].slice(-20); return true; }
const BLOOM = {hana: "Dear friend,\n\nThat little seed tag! I planted it by the front step like you said, and look: cornflowers and two poppies, already. Theo waters them every morning and pretends he isn't.\n\nLove, Hana xx",
  theo: "Dear friend,\n\nThe tag came up. Poppies. I have sketched them twice and entered them, officially, in the garden register.\n\nTheo", tomi: "Hey!\n\nPosy planted your seed tag in the window box. It's a tiny meadow now. The neighbours are jealous.\n\nTomi",
  posy: "Hi!\n\nThe seed tag grew!! Little blue flowers in my window box. I read that talking to plants helps, so I talk to them every morning.\n\nLove, Posy", grands: "Dear friend,\n\nMei planted the paper with the seeds next to the herbs by the cottage door. Now there are flowers! Mei sings to them in the mornings, and I have baked a cake to celebrate. Two cakes, actually.\n\nFarid (and Mei)",
  bo: "Dear friend,\n\nThe seed tag from the present came up by the workshop door. Wildflowers. I didn't kill them. Proud of me?\n\nBo"};
export const bloomMail = (F, t = now()) => (paperState(F).blooms || []).filter(b => b.at <= t).map(b => ({id: b.id, from: "postie", at: b.at, title: "The seed tag came up", body: BLOOM[b.who] || BLOOM.hana}));

/* ---------- panels ---------- */
const coin = () => icon("coin", 13), shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const left = (done, t) => { const m = Math.max(1, Math.ceil((done - t)/M)); return m >= 60 ? `${Math.round(m/60)} hour${Math.round(m/60) === 1 ? "" : "s"}` : `${m} minute${m === 1 ? "" : "s"}`; };
const btn = (a, label, on = true, k = "", cls = "primary") => `<button class="btn small ${cls}" data-pp="${a}"${k ? ` data-k="${k}"` : ""} ${on ? "" : "disabled"}>${label}</button>`;
const STEPS = [["pp_scrap", "Scraps"], ["pp_soak", "Soak"], ["pp_vat", "Pulp"], ["pp_adds", "Add-in"], ["pp_vat", "Pull"], ["pp_press", "Press"], ["pp_line", "Dry"]];
// where the batch is up to (0-6), for the strip of steps along the top of every panel
export function stepNow(F, t = now()){ const st = stage(F, t); return st.pressed || st.pressing ? 5 : st.wet ? 5 : st.pulp ? (st.pulp.add === "none" ? 3 : 4) : st.soaked ? 2 : st.soaking ? 1 : 0; }
// the batch's own picture, changing at every step
export function batchIcon(F, t = now()){
  const st = stage(F, t);
  if (st.pressing || st.pressed) return `pppress_${(paperState(F).press).col}_${paperState(F).press.add}`;
  if (st.wet) return `ppwet_${st.wet.col}_${st.wet.add}`;
  if (st.pulp) return `ppulp_${st.pulp.col}_${st.pulp.add}`;
  if (st.soaking || st.soaked) return "ppsoak";
  return "ppscraps";
}
function strip(F, t){
  const k = stepNow(F, t);
  return `<div class="ppstrip" aria-label="The steps">${STEPS.map(([, n], i) => `<span class="ppstep${i < k ? " done" : i === k ? " now" : ""}">${i + 1}. ${n}</span>`).join("")}</div>`;
}
const head = (title, sub, F, t, tape = "gingham") => `<span class="tape ${tape}" aria-hidden="true"></span><h2>${title}</h2><p class="sub">${sub}</p>${strip(F, t)}<div class="ppbatch">${icon(batchIcon(F, t), 64)}</div>`;

export function paperPanel(F, spot, o = {}){
  const p = paperState(F), t = o.t || now(), st = stage(F, t);
  if (spot === "pp_scrap") {
    return head("The scrap bin", "Wine labels, chocolate wrappers, receipts and old brown paper: everything gets a second life here.", F, t)
      + `<p class="olabel">${icon("ppscraps", 22)} ${p.scraps} bundle${p.scraps === 1 ? "" : "s"} of scraps</p>${o.came ? `<p class="muted">${o.came} came up in the van today, from ${esc(homeShops(F).join(", "))}.</p>` : `<p class="muted">Each of your shops puts a bundle aside every day (${homeShops(F).length} a day now); they ride up in the van when you visit.</p>`}
      <div class="actions">${btn("tear", `Tear and soak ${SOAK} bundles`, p.scraps >= SOAK && !p.soak && !p.pulp)}${btn("scraps", `Buy a bundle (${SCRAP_PRICE} ${coin()})`, F.coins >= SCRAP_PRICE, "", "alt")}</div>
      ${p.soak || p.pulp ? `<p class="muted">The tub's busy: one batch at a time.</p>` : ""}` + shut;
  }
  if (spot === "pp_soak") {
    return head("The soaking tub", st.soaking ? `Torn scraps going soft in the water: ready in ${left(p.soak.done, t)}. Swish them about if you like.` : st.soaked ? "Soft and floppy, falling apart in your fingers: ready to beat into pulp at the vat." : "Empty. Tear some scraps in at the scrap bin.", F, t)
      + (st.soaked ? `<div class="actions">${btn("go", "Over to the vat", true, "pp_vat")}</div>` : "") + shut;
  }
  if (spot === "pp_vat") {
    if (st.soaked && !st.pulp) return head("The vat", "Beat the soaked scraps into a slurry. Pick a colour: a pinch of pigment in the beater.", F, t)
      + `<ul class="hlist wlist">${Object.entries(COLOURS).map(([k, c]) => `<li><span class="wpic">${icon(`ppulp_${k}_none`, 30)}</span><span class="wtxt"><b>${c.n}</b><small>${c.cost ? `${c.cost} ${coin()} of pigment` : "As it comes: oatmeal, with flecks of old print"}</small></span><span class="orbtns">${btn("beat", "Beat it", F.coins >= c.cost, k)}</span></li>`).join("")}</ul>` + shut;
    if (st.pulp) return head("The vat", `${COLOURS[st.pulp.col].n} pulp${st.pulp.add === "none" ? "" : `, with ${ADDS[st.pulp.add].n.toLowerCase()} stirred through`}. ${st.pulp.add === "none" ? "Stir in an add-in from the jars, or pull it plain." : "Ready to pull."}`, F, t)
      + `<div class="actions">${st.pulp.add === "none" ? btn("go", "The add-in jars", true, "pp_adds", "alt") : ""}${btn("pull", `Pull ${BATCH} sheets`, !st.wet)}</div>${st.wet ? `<p class="muted">The last sheets are still on the felts: press them first.</p>` : ""}` + shut;
    return head("The vat", st.wet ? "Six wet sheets lie on their felts, shining. Over to the press." : st.soaking ? "Waiting for the scraps to soften in the tub." : "Empty. Start with scraps in the tub.", F, t)
      + (st.wet ? `<div class="actions">${btn("go", "To the press", true, "pp_press")}</div>` : "") + shut;
  }
  if (spot === "pp_adds") {
    const can = st.pulp && st.pulp.add === "none";
    return head("The add-in jars", can ? "One add-in for this batch, stirred through the vat. Lavender and roses can come from your backpack." : "Jars of lavender, petals, tea, gold leaf and seeds. They go in when there's plain pulp in the vat.", F, t)
      + `<ul class="hlist wlist">${Object.entries(ADDS).filter(([k]) => k !== "none").map(([k, a]) => { const bag = a.inv && (F.inv || {})[a.inv] > 0;
        return `<li><span class="wpic">${icon(`pp_natural_${k}`, 30)}</span><span class="wtxt"><b>${a.n}</b><small>${bag ? "One from your backpack" : `${a.cost} ${coin()}`} · sheets sell for ${a.bonus} more${k === "seeds" ? " · plant it and wildflowers grow" : ""}</small></span><span class="orbtns">${btn("add", "Stir in", can && (bag || F.coins >= a.cost), k)}</span></li>`; }).join("")}</ul>` + shut;
  }
  if (spot === "pp_press") {
    return head("The screw press", st.pressing ? `Squeezing the water out: ${left(p.press.done, t)}.` : st.pressed ? "Pressed: firm, damp sheets, ready for the line." : st.wet ? "Six wet sheets on their felts. Into the press, and wind it down." : "Empty, the big iron screw wound right up.", F, t)
      + `<div class="actions">${st.wet ? btn("press", "Wind it down") : ""}${st.pressed ? btn("hang", "Hang them on the line", p.line.length < LINE) : ""}</div>${st.pressed && p.line.length >= LINE ? `<p class="muted">The line's full: take the dry ones down first.</p>` : ""}` + shut;
  }
  if (spot === "pp_line") {
    const dry = st.line.filter(s => s.dry).reduce((a, s) => a + s.n, 0);
    return head("The drying line", st.line.length ? "Sheets pegged up across the back room, the deckled edges curling a little as they dry." : "An empty line and a row of pegs.", F, t, "stripe")
      + (st.line.length ? `<ul class="hlist wlist">${st.line.map(s => `<li><span class="wpic">${icon(s.dry ? sheetId(s.col, s.add) : `pppress_${s.col}_${s.add}`, 30)}</span><span class="wtxt"><b>${esc(sheetName(s.col, s.add))}</b><small>${s.n} sheets · ${s.dry ? "dry!" : `dry in ${left(s.done, t)}`}</small></span></li>`).join("")}</ul>` : "")
      + `<div class="actions">${btn("down", `Take down the dry ones${dry ? ` (${dry})` : ""}`, dry > 0)}</div>` + shut;
  }
  if (spot === "pp_shelf") {
    const ids = Object.keys(p.stock).filter(id => p.stock[id] > 0), bag = Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && ITEMS[id] && ITEMS[id].paper);
    return `<span class="tape gingham" aria-hidden="true"></span><h2>The paper shelves</h2><p class="sub">Your sheets, stacked by colour, a little card under each with its price.</p>`
      + (ids.length ? `<ul class="hlist wlist">${ids.map(id => `<li><span class="wpic">${icon(id, 30)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${p.stock[id]} on the shelf · ${ITEMS[id].price} ${coin()} a sheet</small></span><span class="orbtns">${btn("bag", "Take 1", true, id, "alt")}</span></li>`).join("")}</ul>` : `<p class="muted">Bare shelves. Sheets come off the drying line the day after you make them.</p>`)
      + (bag.length ? `<p class="eyebrow" style="margin:12px 0 6px">In your backpack</p><ul class="hlist wlist">${bag.map(id => `<li><span class="wpic">${icon(id, 30)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${F.inv[id]} with you</small></span><span class="orbtns">${btn("shelf", "Put back", true, id, "alt")}</span></li>`).join("")}</ul>` : "") + shut;
  }
  // the till
  const d = o.day && p.sold[o.day], kept = keeperHired(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The paperie</h2><p class="sub">${o.lise ? "Lise's at the till, folding a stack of tissue into little fans." : kept ? "Lise keeps the shop 10 till 5 (closed Mondays) and takes the dry sheets off the line." : "The sign on the door says <i>ouvert</i> while you're in Montrose. Browsers come in off the lane and take a sheet or two."}</p>
    <p class="muted">${d ? `Today: ${d.n} sheet${d.n === 1 ? "" : "s"} sold${d.cls ? `, the card class (${d.cls} coins)` : ""}, ${d.coins} coins${d.wage ? `; Lise's wage ${d.wage}` : ""}.` : "Nothing sold yet today."} ${p.made ? `${p.made} sheets made so far.` : ""}</p>
    ${paperSeason(o.day || "") ? `<p class="muted">It's a gift season: people are buying paper for cards and wrapping, twice as many as usual.</p>` : ""}
    <p class="eyebrow" style="margin:12px 0 6px">Saturday card class</p><p class="muted">Saturdays 2 to 4: four people make cards at the big table, ${CLASS.fee} ${coin()} each, with four of your sheets. It runs if ${kept ? "Lise" : "you"}${kept ? " (or you)" : ""} ${kept ? "is" : "are"} here and there are four sheets on the shelves.</p>
    ${kept ? "" : `<p class="eyebrow" style="margin:12px 0 6px">A keeper</p><p class="muted">Lise from the lanes could keep the shop while you're home: 10 till 5, closed Mondays, ${WAGE} ${coin()} for each day she opens. She'll sell slower than you, but she'll sell.</p><div class="actions"><button class="btn small primary" data-goal="paperkeeper" ${F.coins >= 600 ? "" : "disabled"}>Hire Lise (600 ${coin()})</button></div>`}` + shut;
}
