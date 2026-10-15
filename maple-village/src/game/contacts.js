// The address book (round 190): people you meet on your travels can go in a contact list, so you can post them gifts
// and letters. They write back a thank-you note in their own voice.
// Anyone you've met on a trip (F.met), but not the day-trippers (tourist: true), can go in the book if you like; the
// campervan neighbours too. From the gift chooser you post a gift ("By post"): parcels cost postage by how far
// (POSTAGE), letters are free. A reply comes back in a day or three, in that person's own voice (data/pen-*.js), and now
// and then with a little something from their stop tucked in. Someone with no voice written yet writes a plain thank-you
// with a P.S. from their own lines.
// State: F.book = {ids: {id: dayAdded}, sent: [{id, to, item, open, text, at, back, got}]}
import { esc, now, hash } from "../util.js";
import { ITEMS } from "../data/items.js";
import { NPCS } from "../data/npcs.js";
import { BB_PEOPLE } from "../data/bb-people.js";
import { CR_PEOPLE } from "../data/cr-people.js";
import { TL_PEOPLE } from "../data/tl-people.js";
import { LV_PEOPLE } from "../data/lv-people.js";
import { PEN_LV } from "../data/pen-lv.js";
import { PEN_BB } from "../data/pen-bb.js";
import { PEN_CR } from "../data/pen-cr.js";
import { PEN_TL } from "../data/pen-tl.js";
import { PEN_OD } from "../data/pen-od.js";
import { PEN_RK } from "../data/pen-rk.js";
import { PEN_JC } from "../data/pen-jc.js";

const D = 24*60*60*1000;
export const PEN = {...PEN_LV, ...PEN_BB, ...PEN_CR, ...PEN_TL, ...PEN_OD, ...PEN_RK, ...PEN_JC};   // round 192: Ronda, Kyoto, Jeju, Cinque Terre   // round 191: the Coast Road and the Tablelands
export const REGIONS = {bellbird: "Bellbird Valley", coast: "the Coast Road", tablelands: "the Tablelands", lavender: "the Lavender Hills", ronda: "Ronda", kyoto: "Kyoto", jeju: "Jeju", cinque: "Cinque Terre"};
// what a parcel costs to post, and how many days the reply takes (a letter's free)
export const POSTAGE = {bellbird: 2, coast: 2, tablelands: 4, lavender: 4, ronda: 8, kyoto: 8, jeju: 8, cinque: 8};
const DAYS = {2: 1, 4: 2, 8: 3};
const HELD = [];   // anyone held back from the book (nobody, now)
const REGION = {};
[[BB_PEOPLE, "bellbird"], [CR_PEOPLE, "coast"], [TL_PEOPLE, "tablelands"], [LV_PEOPLE, "lavender"]].forEach(([list, r]) => list.forEach(p => { REGION[p.id] = r; }));
NPCS.forEach(p => { if (["ronda", "kyoto", "jeju", "cinque"].includes(p.local)) REGION[p.id] = p.local; });
const DEF = {}; NPCS.forEach(p => { if (REGION[p.id]) DEF[p.id] = p; });
export const person = id => DEF[id];
export const regionOf = id => REGION[id];
// who can go in the book: met on a trip, not a day-tripper
export const canAdd = (F, id) => !!(DEF[id] && (F.met || {})[id] && !DEF[id].tourist && !HELD.includes(id));
export const bookState = F => { F.book = F.book || {}; F.book.ids = F.book.ids || {}; F.book.sent = F.book.sent || []; return F.book; };
export const inBook = (F, id) => !!bookState(F).ids[id];
export function addContact(F, id, day){ if (!canAdd(F, id) || inBook(F, id)) return false; bookState(F).ids[id] = day; return true; }
export function removeContact(F, id){ const b = bookState(F); if (!b.ids[id]) return false; delete b.ids[id]; return true; }
export const contacts = F => Object.keys(bookState(F).ids).filter(id => DEF[id]).sort((a, b) => Object.keys(REGIONS).indexOf(REGION[a]) - Object.keys(REGIONS).indexOf(REGION[b]) || DEF[a].name.localeCompare(DEF[b].name));
// people met on trips who could be added (for the book's "met on your travels" list)
export const addable = F => Object.keys(F.met || {}).filter(id => canAdd(F, id) && !inBook(F, id));
export const postage = id => POSTAGE[REGION[id]] || 4;
export const postable = it => !!it && (it.kind === "gift" || it.kind === "bouquet" || (it.kind === "keepsake" && !!it.to));

// the ready-made openings for a letter (you can add your own lines below)
export const OPENINGS = ["Thinking of you", "Thank you for the day", "I keep thinking about your", "Guess what happened at home", "Just saying hello"];
const OPEN_TXT = {"Thinking of you": "I was thinking of you today, and wanted to say hello.", "Thank you for the day": "Thank you for such a lovely day when I visited.",
  "I keep thinking about your": "I keep thinking about your little corner of the world.", "Guess what happened at home": "I've got news from home to tell you.", "Just saying hello": "Just a little note to say hello."};
export const openingText = o => OPEN_TXT[o] || "";

// post a gift (item) or a letter (item null, with an opening and/or your own words). Returns the entry, or a reason.
export function postTo(F, to, {item = null, open = "", text = ""} = {}, at = now()){
  if (!inBook(F, to)) return {err: "Not in your address book."};
  const it = item && ITEMS[item];
  if (item) {
    if (!postable(it) || !((F.inv || {})[item] > 0)) return {err: "That can't go in the post."};
    if (it.gel) return {err: "It'd melt on the way."};
    const cost = postage(to); if ((F.coins || 0) < cost) return {err: `Postage is ${cost} coins.`};
    F.coins -= cost; F.inv[item]--; if (F.inv[item] <= 0) delete F.inv[item];
  } else if (!open && !String(text).trim()) return {err: "Write a few words first."};
  const days = DAYS[postage(to)] || 2, p = PEN[to], b = bookState(F), h = hash(to + at + b.sent.length);
  const e = {id: `post-${to}-${at}-${b.sent.length}`, to, item: item || null, open, text: String(text).trim().slice(0, 400), at: at + days*D,
    back: item && p && p.back && ITEMS[p.back] && h % 5 === 0 ? p.back : null};   // about one parcel in five comes back with a little something
  // round 198: after a few posts, a friend with something of their own to sell offers to send some for the gift shop
  const imp = importable(to);
  if (imp && (F.goals || {}).giftshop && !(b.offers || {})[to] && !(b.lines || {})[to] && b.sent.filter(x => x.to === to).length >= 2) { b.offers = b.offers || {}; b.offers[to] = {item: imp, at: e.at}; e.offer = imp; }
  b.sent = [...b.sent, e].slice(-60); return e;
}
// what kind of thing a gift is, for which thank-you line they write
export function giftKind(id){
  const it = ITEMS[id] || {}; if (it.wrapped && it.inner) return giftKind(it.inner);
  if (it.kind === "bouquet") return "flower";
  if (it.wine || /^(wb_|wine|bottle|mulled|cider|sparkl)/.test(id)) return "drink";
  if (/^(pp_|tag_|card|soap|oil|lotion|balm_|lipoil|candle|sachet|wrp_|bath|scrub)/.test(id) || /soap|oil|lotion|balm|candle|paper|card/i.test(it.n || "")) return "made";
  if (/^(box|bar_|bonbon|choc|honey|jam|cake|cookie|tart|biscuit|pairbox|hamper)/.test(id) || /chocolate|bonbon|honey|jam|cake|biscuit|cookie|tart|nougat|fudge|bread|cheese|pie/i.test(it.n || "")) return "food";
  return "other";
}
// the gift's name, lower-cased to sit mid-sentence, but not a place name ("Cinque Terre white", "Provence soap")
const nm = id => { const it = ITEMS[id]; if (!it) return "present"; const n = it.n.replace(/^(A|An|The) /, ""); return /^\S+ [A-Z]/.test(n) ? n : n.replace(/^./, c => c.toLowerCase()); };
// the reply, in their own voice
export function replyBody(e){
  const d = DEF[e.to], p = PEN[e.to], h = hash(e.id), first = (d.name || "").split(" ")[0];
  const fill = s => String(s || "").replace(/\{it\}/g, e.item ? nm(e.item) : "letter");
  let body;
  if (p && p.own) {   // round 192: Ornella writes long letters: an opening, her own lines, two bits of news, a P.S.
    const two = [p.news[h % p.news.length], p.news[(h + 1 + (h >> 3) % (p.news.length - 1)) % p.news.length]];
    body = `${p.dear || "Dear friend,"}\n\n${p.open[h % p.open.length]}\n\n${fill(e.item ? (p[giftKind(e.item)] || p.other) : p.letter)}\n\n${two.join("\n\n")}`;
    if (e.back && ITEMS[e.back]) body += `\n\n${p.backNote}`;
    if (e.offer && ITEMS[e.offer]) body += `\n\n${offerLine(e.to, e.offer)}`;
    return `${body}\n\n${p.sign}\n\n${p.ps[(h >> 2) % p.ps.length]}`;
  }
  if (e.item) {
    const k = giftKind(e.item), line = p ? fill(p[k] || p.other) : "";
    body = `Dear friend,\n\nThank you for the ${nm(e.item)}! ${line || "It made my whole week, truly."}`;
  } else body = `Dear friend,\n\n${p ? fill(p.letter) : "Your letter came this morning, and I read it twice."}`;
  if (p && p.news && p.news.length) body += `\n\n${p.news[h % p.news.length]}`;
  else if (d.lines && d.lines.length) body += `\n\nP.S. ${d.lines[h % d.lines.length]}`;
  if (e.back && ITEMS[e.back]) body += `\n\n${p.backNote || `I've tucked in a little ${nm(e.back)}.`}`;
  if (e.offer && ITEMS[e.offer]) body += `\n\n${offerLine(e.to, e.offer)}`;
  return `${body}\n\n${p ? p.sign : `Warmly, ${first}`}`;
}
export const bookMail = (F, t = now()) => bookState(F).sent.filter(e => e.at <= t && DEF[e.to]).map(e => ({id: e.id, from: "postie", at: e.at,
  title: `${e.item ? "Thank you" : "A letter"} from ${DEF[e.to].name}${e.back && ITEMS[e.back] ? " (with something tucked in)" : ""}`, body: replyBody(e)}));
// a reply's tucked-in thing goes into the backpack once it's arrived
export function collectBack(F, t = now()){
  const got = []; bookState(F).sent.forEach(e => { if (e.back && !e.got && e.at <= t && ITEMS[e.back]) { e.got = 1; F.inv = F.inv || {}; F.inv[e.back] = (F.inv[e.back] || 0) + 1; got.push({who: DEF[e.to] ? DEF[e.to].name : "", item: e.back}); } });
  return got;
}
export const onTheWay = (F, t = now()) => bookState(F).sent.filter(e => e.at > t).length;
/* ---------- from our travels (round 198) ---------- */
// A friend whose own goods would sit on a shop shelf (their PEN `back`, a gift) offers, after your third post, to send
// a few each week. You say yes or no in the address book. Each week's box costs you TRADE of the price (you pay on
// arrival; no coins, no box that week), and it sells at their own price in the gift shop: a small margin, never more.
// State: F.book.offers {id: {item, at}}, F.book.lines {id: {item, next}}, F.giftshop.travel {item: n}
export const BOX = 4, TRADE = .8, MAX_LINES = 5;
export const importable = id => { const p = PEN[id], it = p && p.back && ITEMS[p.back]; return it && it.kind === "gift" && it.price > 0 ? p.back : null; };
export const tradeOf = item => Math.max(1, Math.round((ITEMS[item] || {price: 0}).price*TRADE));
const offerLine = (to, item) => `P.S. ${DEF[to] && DEF[to].name === "Ornella" ? "I hear you keep a gift shop now. Should you ever want a little cargo of mine for the shelves" : "I hear you've a gift shop now. If you ever wanted some of mine for the shelves"}, I could send ${BOX} a week (${nm(item)}), for a little under what I charge here. Just say the word.`;
export const offersOpen = (F, t = now()) => Object.entries(bookState(F).offers || {}).filter(([id, o]) => o.at <= t && !o.no && !(bookState(F).lines || {})[id] && DEF[id]).map(([id, o]) => ({id, item: o.item}));
export const lines = F => Object.entries(bookState(F).lines || {}).filter(([id]) => DEF[id]).map(([id, l]) => ({id, ...l}));
export function acceptOffer(F, id, t = now()){ const b = bookState(F), o = (b.offers || {})[id]; if (!o || o.no || lines(F).length >= MAX_LINES) return false;
  b.lines = b.lines || {}; b.lines[id] = {item: o.item, next: t + D}; return true; }
export function declineOffer(F, id){ const o = (bookState(F).offers || {})[id]; if (!o) return false; o.no = 1; return true; }
export function stopLine(F, id){ const b = bookState(F); if (!(b.lines || {})[id]) return false; delete b.lines[id]; if (b.offers && b.offers[id]) b.offers[id].no = 1; return true; }
// boxes due: at most one each per call (a long time away is still just one box), paid for on arrival
export function travelTick(F, t = now()){
  const got = [], skip = []; F.giftshop = F.giftshop || {}; const tr = F.giftshop.travel = F.giftshop.travel || {};
  lines(F).forEach(l => { const L = bookState(F).lines[l.id]; if (L.next > t) return; L.next = Math.max(L.next + 7*D, t + D);
    const cost = BOX*tradeOf(l.item); if ((F.coins || 0) < cost) { skip.push({who: DEF[l.id].name, item: l.item, cost}); return; }
    F.coins -= cost; tr[l.item] = (tr[l.item] || 0) + BOX; got.push({who: DEF[l.id].name, item: l.item, cost}); });
  return {got, skip};
}
const lastTo = (F, id) => { const s = bookState(F).sent.filter(e => e.to === id); return s[s.length - 1]; };

/* ---------- the book, in the mail tab ---------- */
const ROW = "display:flex;align-items:center;gap:10px";
// st = {open: id being written to, letter: {open, text}, more: show the met list}
export function bookHTML(F, st, t = now()){
  const list = contacts(F), add = addable(F), way = onTheWay(F, t);
  let h = `<h2 style="margin-top:18px">Address book</h2><p class="muted">People you've met on your travels. Post them a letter (free) or a gift from your backpack (tap it there, then "By post"). Replies come back in a day or three.${way ? ` ${way} on the way.` : ""}</p>`;
  h += list.length ? `<ul class="qlist book">${list.map(id => { const d = DEF[id], l = lastTo(F, id);
    const off = offersOpen(F, t).find(o => o.id === id), ln = (bookState(F).lines || {})[id];
    const tradeRow = off ? `<li style="${ROW}"><span class="wtxt" style="flex:1"><small>Offers a weekly box for the gift shop: ${BOX} × ${esc(nm(off.item))}, ${BOX*tradeOf(off.item)} coins a box. They sell for ${ITEMS[off.item].price} each.</small></span><span class="orbtns" style="display:flex;gap:6px;flex-shrink:0"><button class="btn small primary" data-bk="yes:${id}" ${lines(F).length < MAX_LINES ? "" : "disabled"}>Yes please</button><button class="btn small alt" data-bk="no:${id}">No thanks</button></span></li>`
      : ln ? `<li style="${ROW}"><span class="wtxt" style="flex:1"><small>Sends a weekly box to the gift shop: ${BOX} × ${esc(nm(ln.item))}, ${BOX*tradeOf(ln.item)} coins a box.</small></span><span class="orbtns" style="flex-shrink:0"><button class="btn small alt" data-bk="stop:${id}">Stop</button></span></li>` : "";
    return `<li style="${ROW}"><span class="wtxt" style="flex:1"><b>${esc(d.name)}</b><small>${esc(d.job || "")} · ${REGIONS[REGION[id]]}${l ? ` · last: ${l.item ? nm(l.item) : "a letter"}` : ""}</small></span><span class="orbtns" style="display:flex;gap:6px;flex-shrink:0"><button class="btn small alt" data-bk="write:${id}">Write</button><button class="btn small alt" data-bk="del:${id}" aria-label="Take ${esc(d.name)} out of your address book">×</button></span></li>`
      + tradeRow + (st.open === id ? writeHTML(id, st.letter || {}) : ""); }).join("")}</ul>` : `<p class="muted">Nobody yet.</p>`;
  if (add.length) h += st.more ? `<p class="eyebrow" style="margin:12px 0 6px">Met on your travels</p><ul class="qlist book">${add.sort((a, b) => DEF[a].name.localeCompare(DEF[b].name)).map(id => `<li style="${ROW}"><span class="wtxt" style="flex:1"><b>${esc(DEF[id].name)}</b><small>${esc(DEF[id].job || "")} · ${REGIONS[REGION[id]]}</small></span><span class="orbtns" style="flex-shrink:0"><button class="btn small alt" data-bk="add:${id}">Add</button></span></li>`).join("")}</ul><div class="actions"><button class="btn small alt" data-bk="less">Hide</button></div>`
    : `<div class="actions"><button class="btn small alt" data-bk="more">Add someone you've met (${add.length})</button></div>`;
  return h;
}
function writeHTML(id, l){
  return `<li class="bkwrite" style="display:block"><div><p class="muted">A letter to ${esc(DEF[id].name)}. Start with one of these, add your own words, or both.</p>
    <div class="gchips">${OPENINGS.map(o => `<button class="gchip${l.open === o ? " on" : ""}" data-bk="open:${esc(o)}">${esc(o)}</button>`).join("")}</div>
    <textarea id="bkText" maxlength="400" rows="3" placeholder="Your own words (optional)" style="width:100%;margin-top:8px">${esc(l.text || "")}</textarea>
    <div class="actions"><button class="btn small primary" data-bk="send:${id}">Post it (free)</button><button class="btn small alt" data-bk="cancel">Cancel</button></div></div></li>`;
}
