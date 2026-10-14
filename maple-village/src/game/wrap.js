// Wrapping (paperie round 2, round 185; Mel: "as I add each item, the icon, the look changes"). Wrap any gift from
// the backpack in a sheet of Mel's own handmade paper, then (if she likes) stamp it, tie a ribbon and add a tag; the
// parcel's picture builds up with every choice (art/paper-icons.js wrapIcon). Supplies come from the ribbon rack at the
// paperie in Montrose: ribbon reels (4 bows each), a set of rubber stamps (once), and tags cut from her own sheets (a
// seeded sheet makes seeded tags). She wraps at the ribbon rack, or at the wrapping table in the gift shop, where
// wrapped gifts can also go out on the table to sell (a few coins more than unwrapped: the paper, ribbon and tag).
// A wrapped gift is its own item ("wr_<n>", registered from F.paperie.wraps on load) that remembers what's inside;
// family love the wrapping, and a seeded tag gets planted (round 3: it grows).
// State: F.paperie.{stamps (owned), wrapN, wraps: [{id, inner, col, add, stamp, ribbon, tag}]}; F.giftshop.wrapped: [ids]
import { ITEMS } from "../data/items.js";
import { esc } from "../util.js";
import { icon } from "../art/icons.js";
import { paperState, COLOURS, ADDS } from "./paperie.js";

export const RIBBONS = {gingham: {n: "Gingham ribbon", price: 4}, velvet: {n: "Velvet ribbon", price: 6}, twine: {n: "Garden twine", price: 2}};
export const REEL = 4, STAMP_SET = 40, TAGS_PER_SHEET = 4;
export const STAMPS = {bee: "Bees", grape: "Grapes", olive: "Olive sprigs", star: "Stars", heart: "Hearts"};
ITEMS.tag_plain = {n: "Paper gift tag", kind: "use", ico: "tag_plain", what: "Cut from your own handmade paper."};
ITEMS.tag_seeded = {n: "Seeded gift tag", kind: "use", ico: "tag_seeded", crop: "wildflower", plantable: true, what: "Cut from seeded paper: plant it and wildflowers come up."};
for (const [k, r] of Object.entries(RIBBONS)) ITEMS["rb_" + k] = {n: `${r.n} (one bow)`, kind: "use", ico: "rb_" + k, what: "Enough for one bow."};

// round 188 (Mel: "there is no gift wrapping until I have my paperie"): shop-bought wrapping paper, from the gift shop's
// wrapping table (or the paperie's rack): kraft, gold, red and green, a sheet at a time. Handmade paper is worth more.
export const STORE_PAPER = {kraft: {n: "Kraft", price: 1}, red: {n: "Red", price: 2}, green: {n: "Green", price: 2}, gold: {n: "Gold", price: 3}};
for (const [k, p] of Object.entries(STORE_PAPER)) ITEMS["gw_" + k] = {n: `A sheet of ${p.n.toLowerCase()} wrapping paper`, kind: "use", wrapPaper: true, ico: "gw_" + k, price: p.price, what: "Shop-bought wrapping paper, for wrapping a gift."};
export const isPaper = id => !!ITEMS[id] && !!(ITEMS[id].paper || ITEMS[id].wrapPaper);
const paperOf = id => /^gw_/.test(id) ? {col: id.slice(3), add: "none", store: true} : (([, col, add]) => ({col, add}))(id.split("_"));
const paperN = col => (COLOURS[col] || STORE_PAPER[col] || {n: col}).n.toLowerCase();
export function buyPaper(F, k, n = 1){ const p = STORE_PAPER[k]; if (!p || F.coins < p.price*n) return 0; F.coins -= p.price*n; F.inv = F.inv || {}; F.inv["gw_" + k] = (F.inv["gw_" + k] || 0) + n; return n; }
export const TAG_PACK = {n: 4, price: 2};
export function buyTags(F){ if (F.coins < TAG_PACK.price) return 0; F.coins -= TAG_PACK.price; F.inv = F.inv || {}; F.inv.tag_plain = (F.inv.tag_plain || 0) + TAG_PACK.n; return TAG_PACK.n; }
export const wrappable = id => { const it = ITEMS[id]; return !!it && it.kind === "gift" && !it.wrapped && !it.paper; };
export const wrapIco = w => `wrp_${w.col || "natural"}_${w.add || "none"}_${w.stamp || "none"}_${w.ribbon || "none"}_${w.tag || "none"}`;
// the parcel's picture so far: the gift itself until it's in paper
export const previewIco = (F, w) => { if (!w.paper) return w.item ? (ITEMS[w.item].ico || w.item) : "wrp_natural_none_none_none_none"; const {col, add} = paperOf(w.paper); return wrapIco({...w, col, add}); };

const wrapLine = w => w.tag === "seeded" ? "And a seed tag! I'm planting it in the garden." : w.stamp ? "And the paper! Did you stamp this yourself?" : "And the paper! Did you make this?";
function defineWrap(r){
  const inner = ITEMS[r.inner]; if (!inner) return;
  const extra = (r.store ? 1 : 2) + (r.ribbon ? 1 : 0) + (r.tag ? 1 : 0) + (r.stamp ? 1 : 0);
  ITEMS[r.id] = {n: `${inner.n.replace(/^(A|An) /, "")}, wrapped in ${paperN(r.col)} paper`, kind: "gift", wrapped: true, inner: r.inner, to: inner.to, price: (inner.price || 5) + extra,
    ico: wrapIco(r), what: `${inner.n}, in ${r.store ? "" : "your own "}${paperN(r.col)} paper${r.add !== "none" ? ` ${ADDS[r.add].word}` : ""}${r.stamp ? `, stamped with ${STAMPS[r.stamp].toLowerCase()}` : ""}${r.ribbon ? `, a ${RIBBONS[r.ribbon].n.toLowerCase()} bow` : ""}${r.tag ? `, a ${r.tag} tag` : ""}.`,
    say: `${inner.say || "For me? Thank you!"} ${wrapLine(r)}`, ...(inner.says ? {says: Object.fromEntries(Object.entries(inner.says).map(([k, v]) => [k, `${v} ${wrapLine(r)}`]))} : {})};
}
export function registerWraps(F){ (paperState(F).wraps || []).forEach(defineWrap); }

// wrap it: w = {item, paper (a sheet id), stamp, ribbon, tag} -> the new item id, or null
export function wrapIt(F, w){
  const p = paperState(F), inv = F.inv || {};
  if (!w.item || !wrappable(w.item) || !(inv[w.item] > 0) || !w.paper || !(inv[w.paper] > 0) || !isPaper(w.paper)) return null;
  if (w.stamp && (!p.stamps || !STAMPS[w.stamp])) return null;
  if (w.ribbon && !(inv["rb_" + w.ribbon] > 0)) return null;
  if (w.tag && !(inv["tag_" + w.tag] > 0)) return null;
  const use = id => { inv[id]--; if (inv[id] <= 0) delete inv[id]; };
  use(w.item); use(w.paper); if (w.ribbon) use("rb_" + w.ribbon); if (w.tag) use("tag_" + w.tag);
  const {col, add, store} = paperOf(w.paper), id = "wr_" + (p.wrapN = (p.wrapN || 0) + 1);
  const r = {id, inner: w.item, col, add, ...(store ? {store: true} : {}), stamp: w.stamp || null, ribbon: w.ribbon || null, tag: w.tag || null};
  p.wraps = [...(p.wraps || []), r]; defineWrap(r); inv[id] = 1; F.inv = inv; return id;
}
// the ribbon rack: reels, the stamp set, tags cut from a sheet
export function buyReel(F, k){ const r = RIBBONS[k]; if (!r || F.coins < r.price) return false; F.coins -= r.price; F.inv = F.inv || {}; F.inv["rb_" + k] = (F.inv["rb_" + k] || 0) + REEL; return true; }
export function buyStamps(F){ const p = paperState(F); if (p.stamps || F.coins < STAMP_SET) return false; F.coins -= STAMP_SET; p.stamps = true; return true; }
export function cutTags(F, sheet){ const inv = F.inv || {}; if (!(inv[sheet] > 0) || !ITEMS[sheet] || !ITEMS[sheet].paper) return 0;
  inv[sheet]--; if (inv[sheet] <= 0) delete inv[sheet]; const k = /_seeds$/.test(sheet) ? "tag_seeded" : "tag_plain"; inv[k] = (inv[k] || 0) + TAGS_PER_SHEET; return TAGS_PER_SHEET; }

/* ---------- panels ---------- */
const coin = () => icon("coin", 13), shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const chip = (on, data, ico, label, dis = false) => `<button class="gchip${on ? " on" : ""}" data-wr="${data}" aria-pressed="${on}" ${dis ? "disabled" : ""}>${ico ? icon(ico, 20) : ""}<span>${esc(label)}</span></button>`;
const bagOf = (F, f) => Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && ITEMS[id] && f(id));
export function rackPanel(F){
  const p = paperState(F), sheets = bagOf(F, id => ITEMS[id].paper);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The ribbon rack</h2><p class="sub">Spools of ribbon on a wooden rack, a tray of rubber stamps, and a guillotine for cutting tags.</p>
    <ul class="hlist wlist">${Object.entries(RIBBONS).map(([k, r]) => `<li><span class="wpic">${icon("rb_" + k, 28)}</span><span class="wtxt"><b>${esc(r.n)}</b><small>A reel: ${REEL} bows · ${r.price} ${coin()}${(F.inv || {})["rb_" + k] ? ` · ${F.inv["rb_" + k]} bows in your backpack` : ""}</small></span><span class="orbtns"><button class="btn small alt" data-wr="reel:${k}" ${F.coins >= r.price ? "" : "disabled"}>Buy a reel</button></span></li>`).join("")}
      <li><span class="wpic">${icon("stamp_bee", 28)}</span><span class="wtxt"><b>Rubber stamps</b><small>${p.stamps ? "Yours: bees, grapes, olive sprigs, stars and hearts" : `Bees, grapes, olive sprigs, stars, hearts · ${STAMP_SET} ${coin()}, once`}</small></span><span class="orbtns">${p.stamps ? "" : `<button class="btn small alt" data-wr="stamps" ${F.coins >= STAMP_SET ? "" : "disabled"}>Buy the set</button>`}</span></li></ul>
    <p class="eyebrow" style="margin:12px 0 6px">Cut gift tags (${TAGS_PER_SHEET} from a sheet)</p>${sheets.length ? `<div class="gchips">${sheets.map(id => chip(false, "tags:" + id, id, `${ITEMS[id].n} (${F.inv[id]})`)).join("")}</div>` : `<p class="muted">Take a sheet off your shelves to cut tags from it. Seeded paper makes seeded tags.</p>`}
    <div class="actions"><button class="btn primary small" data-wr="open">Wrap a gift</button></div>` + shut;
}
export function wrapPanel(F, w, o = {}){
  const p = paperState(F), gifts = bagOf(F, wrappable), sheets = bagOf(F, isPaper);
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>${o.where === "giftshop" ? "The wrapping table" : "Wrap a gift"}</h2><p class="sub">Pick the gift, then your paper, a stamp, a ribbon and a tag. The parcel changes as you go.</p>
    <div class="ppbatch">${icon(previewIco(F, w), 84)}</div>`;
  h += `<p class="eyebrow" style="margin:8px 0 6px">1. The gift</p>${gifts.length ? `<div class="gchips">${gifts.map(id => chip(w.item === id, "item:" + id, ITEMS[id].ico || id, ITEMS[id].n)).join("")}</div>` : `<p class="muted">Nothing to wrap in your backpack: bonbon boxes, pairing boxes, hampers, bars, soaps, cheeses...</p>`}`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">2. Paper</p>${sheets.length ? `<div class="gchips">${sheets.map(id => chip(w.paper === id, "paper:" + id, id, ITEMS[id].n)).join("")}</div>` : `<p class="muted">No paper with you: buy a sheet below${o.where === "giftshop" ? "" : ", or take handmade sheets off the paperie's shelves"}.</p>`}`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">3. A stamp</p>${p.stamps ? `<div class="gchips">${chip(!w.stamp, "stamp:", "", "None")}${Object.entries(STAMPS).map(([k, n]) => chip(w.stamp === k, "stamp:" + k, "stamp_" + k, n)).join("")}</div>` : `<p class="muted">No stamps yet: a set's on the ribbon rack at the paperie.</p>`}`;
  const rb = Object.keys(RIBBONS).filter(k => (F.inv || {})["rb_" + k] > 0);
  h += `<p class="eyebrow" style="margin:10px 0 6px">4. A ribbon</p><div class="gchips">${chip(!w.ribbon, "ribbon:", "", "None")}${rb.map(k => chip(w.ribbon === k, "ribbon:" + k, "rb_" + k, `${RIBBONS[k].n} (${F.inv["rb_" + k]})`)).join("")}</div>`;
  const tg = ["plain", "seeded"].filter(k => (F.inv || {})["tag_" + k] > 0);
  h += `<p class="eyebrow" style="margin:10px 0 6px">5. A tag</p><div class="gchips">${chip(!w.tag, "tag:", "", "None")}${tg.map(k => chip(w.tag === k, "tag:" + k, "tag_" + k, `${k === "seeded" ? "Seeded" : "Paper"} tag (${F.inv["tag_" + k]})`)).join("")}</div>`;
  h += `<div class="actions"><button class="btn primary" data-wr="go" ${w.item && w.paper ? "" : "disabled"}>Wrap it</button>${o.where === "paperie" ? `<button class="btn small alt" data-wr="rack">Back to the ribbon rack</button>` : ""}</div>`;
  if (o.where === "giftshop" || o.where === "paperie") h += `<p class="eyebrow" style="margin:12px 0 6px">Wrapping supplies</p><ul class="hlist wlist">${Object.entries(STORE_PAPER).map(([k, sp]) => `<li><span class="wpic">${icon("gw_" + k, 26)}</span><span class="wtxt"><b>${sp.n} wrapping paper</b><small>${sp.price} ${coin()} a sheet${(F.inv || {})["gw_" + k] ? ` · ${F.inv["gw_" + k]} with you` : ""}</small></span><span class="orbtns"><button class="btn small alt" data-wr="paperbuy:${k}" ${F.coins >= sp.price ? "" : "disabled"}>Buy a sheet</button></span></li>`).join("")}
    ${o.where === "giftshop" ? Object.entries(RIBBONS).map(([k, r]) => `<li><span class="wpic">${icon("rb_" + k, 26)}</span><span class="wtxt"><b>${esc(r.n)}</b><small>A reel: ${REEL} bows · ${r.price} ${coin()}</small></span><span class="orbtns"><button class="btn small alt" data-wr="reel:${k}" ${F.coins >= r.price ? "" : "disabled"}>Buy a reel</button></span></li>`).join("") + `<li><span class="wpic">${icon("tag_plain", 26)}</span><span class="wtxt"><b>Gift tags</b><small>A pack of ${TAG_PACK.n} · ${TAG_PACK.price} ${coin()}</small></span><span class="orbtns"><button class="btn small alt" data-wr="tagbuy" ${F.coins >= TAG_PACK.price ? "" : "disabled"}>Buy a pack</button></span></li>` : ""}</ul>`;
  if (o.where === "giftshop") { const out = o.table || [];   // round 202: what's out for sale lives in the gift basket beside the table now
    h += `<p class="muted" style="margin-top:12px">Wrapped gifts to sell go in the gift basket, just beside this table${out.length ? ` (${out.length} in it now)` : ""}.</p>`; }
  return h + shut;
}
