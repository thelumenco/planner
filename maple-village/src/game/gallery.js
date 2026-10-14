// The gift shop's gallery wall and makers' shelf (round 196, Mel: "the paintings, I do want them to be for sale, but
// the money, maybe they just pay me like a token 10 coins... the money goes to the person who made it and then the
// following week they could... write a letter to say thank you, I'm so excited about selling my painting").
// Gallery: four frames on the back wall, between the round windows. Local painters (Dad from the sip and paint, Juniper,
// Mr Okada, Mei) bring a new painting on Mondays to fill an empty frame. When one sells Mel keeps a token TOKEN coins and
// the rest goes to the painter, who writes to her about it a week later. Mel can hang her own sip-and-paint paintings
// there too: never for sale, and they come down again whenever she likes.
// Makers' shelf: villagers' small handmade things on consignment (about a fifth, CUT, to Mel; the rest to the maker).
// They top it up on Mondays. Mel can buy one herself at the full price (it all goes to the maker).
// State: F.giftshop.gallery = {frames: [{by, t, price} | {own: itemId} | null] x4, sold: [{by, t, at}], filled: day}
//        F.giftshop.makers = {stock: {itemId: n}, filled: day, week: {maker: coins}}
import { esc } from "../util.js";
import { ITEMS } from "../data/items.js";
import { icon } from "../art/icons.js";
import { PAINTINGS } from "../data/terrace-people.js";

export const TOKEN = 10, CUT = .2, FRAMES = 4;
const D = 864e5;
// the painters, what they paint (title, price, two colours for the little picture on the wall), and how they write
export const PAINTERS = {
  dad: {name: "Dad", what: "Sip-and-paint landscapes", sign: "Love, Dad",
    works: [["The terrace at dusk", 48, "#E9A87A", "#5A6B8C"], ["Vines in October", 44, "#C98A3A", "#7A8C4A"], ["The jetty, early", 40, "#9FC3D9", "#E8D3A6"], ["Lavender rows", 46, "#A68FCB", "#F3DDB0"], ["Ma Ma's orchard", 42, "#7FA35A", "#F3C969"]],
    note: ["Mel! Somebody bought my painting. A real person, with real money. I've told everyone at the class. Twice.", "Posy rang to say '{t}' sold. I had to sit down. Your mother says I'm insufferable now. She's right.", "'{t}' has gone to a good home, Posy says. I hope they hang it where the light's kind. I've already started the next one."]},
  juniper: {name: "Juniper", what: "Watercolours from the library garden", sign: "With love, Juniper (from behind the returns desk)",
    works: [["Rain on the reading room", 32, "#BFD6E6", "#8A8279"], ["Wisteria by the steps", 36, "#C3A9E0", "#9EBE8C"], ["The library cat, asleep", 28, "#E8C49A", "#5A4A3E"], ["Autumn, through the window", 34, "#D98A4A", "#F3E7C8"]],
    note: ["I've been grinning at the date stamp all morning. '{t}' sold! I may frame the receipt.", "Thank you for giving my little watercolours a wall. '{t}' found a home, and I found I can't stop telling the regulars.", "Someone bought '{t}'. I keep imagining it on their wall, getting rained on in a painted sort of way."]},
  okada: {name: "Mr Okada", what: "Ink-brush landscapes", sign: "With thanks, K. Okada",
    works: [["The well, in mist", 52, "#E6E2DA", "#2F2B28"], ["Two herons", 56, "#F3EFE6", "#3A4A5A"], ["Pine on the headland", 50, "#E9E4D6", "#2E3A2E"], ["Bridge in snow", 54, "#F6F3EE", "#4A4A4A"]],
    note: ["I am told '{t}' has been sold. Forty years of sorting other people's letters, and now one of my brushes has travelled further than I ever did. Thank you.", "Ink is patient. So, it seems, was the person who bought '{t}'. I am very quietly delighted.", "A small note to say thank you. '{t}' sold, and I have bought myself a new brush to celebrate. A modest one."]},
  mei: {name: "Mei", what: "Botanical paintings from the flower farm", sign: "Mei, from the flower farm",
    works: [["Sweet peas, in a jar", 30, "#F4C7CF", "#7FA35A"], ["Dahlia study", 34, "#D9534F", "#5E8A3A"], ["Cosmos in the wind", 28, "#F3B6D0", "#9EBE8C"], ["The first rose", 32, "#E8566C", "#6A8A4A"]],
    note: ["'{t}' sold! I've been telling the dahlias. They're very proud.", "I painted '{t}' between waterings and never thought anyone would want it. Thank you for hanging it up.", "Posy says '{t}' went to a lady who smelled it first. That's the nicest thing anyone's ever done to one of my paintings."]}
};
// the makers and their things (kind "gift", so Mel can buy one to give)
export const MAKERS = {
  lin: {name: "Auntie Lin", item: "mk_cards"}, bo: {name: "Bo", item: "mk_spoon"}, noor: {name: "Noor", item: "mk_pettoy"},
  wren: {name: "Wren", item: "mk_bird"}, hana: {name: "Hana", item: "mk_honeybutter"}, felix: {name: "Felix", item: "mk_wraps"}
};
Object.assign(ITEMS, {
  mk_cards: {n: "Pressed-flower cards", kind: "gift", to: "family", price: 6, art: ["tile", "#FFFDF6", "#F4C7CF"], maker: "lin", say: "Auntie Lin's pressed-flower cards! Too pretty to write in. I'll write in one anyway."},
  mk_spoon: {n: "A carved wooden spoon", kind: "gift", to: ["mum", "mama", "dad", "darren"], price: 9, art: ["disc", "#C9A27E", "#8A5A3A"], maker: "bo", say: "A wooden spoon Bo carved by hand! It's too nice for porridge. It's getting porridge."},
  mk_pettoy: {n: "A knitted mouse for a pet", kind: "gift", to: ["evan", "angelina"], price: 5, art: ["tile", "#C3CDEE", "#F4C7CF"], maker: "noor", say: "A little knitted mouse from Noor's rescue! Every cat in the street will want it."},
  mk_bird: {n: "A whittled wren", kind: "gift", to: ["dad", "gonggong", "evan"], price: 8, art: ["bird", "#C9A27E"], maker: "wren", say: "A little wooden wren, whittled by the ranger! It's sitting on the windowsill, looking out."},
  mk_honeybutter: {n: "Hana's honey butter", kind: "gift", to: "family", price: 6, art: ["jar", "#F3D98A", "#FFFDF6"], maker: "hana", say: "Hana's honey butter, the one from her toast! On everything. On everything."},
  mk_wraps: {n: "Beeswax food wraps", kind: "gift", to: ["mum", "mama", "angelina"], price: 7, art: ["cloth", "#F6E3A1", "#9EBE8C"], maker: "felix", say: "Beeswax wraps from Felix's bees! No more cling film. The kitchen smells like honey."}
});
export const MAKER_ITEMS = Object.values(MAKERS).map(m => m.item);
const STOCK = 3;   // each maker tops their spot up to this on Mondays

export const galleryState = F => { F.giftshop = F.giftshop || {}; const g = F.giftshop.gallery = F.giftshop.gallery || {};
  g.frames = g.frames || Array(FRAMES).fill(null); g.sold = g.sold || []; return g; };
export const makersState = F => { F.giftshop = F.giftshop || {}; const m = F.giftshop.makers = F.giftshop.makers || {};
  m.stock = m.stock || {}; m.week = m.week || {}; return m; };
const dow = day => new Date(day + "T00:00:00Z").getUTCDay();
const hashS = s => { let h = 0; for (const c of String(s)) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
// Mondays (and the very first time): painters fill empty frames, makers top up their spots
export function stockUp(F, day){
  const g = galleryState(F), m = makersState(F); let n = 0;
  if (!g.filled || (dow(day) === 1 && g.filled !== day)) {
    g.filled = day; const hung = new Set(g.frames.filter(f => f && f.by).map(f => f.by));
    const queue = Object.keys(PAINTERS).filter(p => !hung.has(p)).sort((a, b) => hashS(day + a) - hashS(day + b));
    // while Mel has a painting of her own (in her backpack or already up), the painters leave one frame for her
    const mine = ownPaintings(F).length || g.frames.some(f => f && f.own); let room = (mine ? FRAMES - 1 : FRAMES) - g.frames.filter(f => f && f.by).length;
    g.frames = g.frames.map(f => { if (f || !queue.length || room <= 0) return f; room--; const by = queue.shift(), done = new Set(g.sold.filter(s => s.by === by).map(s => s.t)), w = PAINTERS[by].works, pick = w.find(x => !done.has(x[0])) || w[hashS(day + by) % w.length]; n++;
      return {by, t: pick[0], price: pick[1], c1: pick[2], c2: pick[3]}; });
  }
  if (!m.filled || (dow(day) === 1 && m.filled !== day)) { m.filled = day; m.week = {}; MAKER_ITEMS.forEach(id => { if ((m.stock[id] || 0) < STOCK) { m.stock[id] = STOCK; n++; } }); }
  return n;
}
export const forSale = F => galleryState(F).frames.filter(f => f && f.by);
// a shopper buys a painting: Mel keeps the token, the painter's letter comes a week later
export function sellPainting(F, i, at){
  const g = galleryState(F), f = g.frames[i]; if (!f || !f.by) return 0;
  g.frames[i] = null; g.sold = [...g.sold, {by: f.by, t: f.t, price: f.price, at: at + 7*D, id: `gal-${f.by}-${at}`}].slice(-40); return Math.min(TOKEN, f.price);
}
// a shopper (or Mel) buys from the makers' shelf: Mel's cut, or nothing when she buys it herself
export function sellMade(F, id){ const m = makersState(F); if (!(m.stock[id] > 0)) return 0; m.stock[id]--; const it = ITEMS[id];
  m.week[it.maker] = (m.week[it.maker] || 0) + it.price; return Math.max(1, Math.round(it.price*CUT)); }
export function buyMade(F, id){ const it = ITEMS[id]; if (!it || !(makersState(F).stock[id] > 0) || (F.coins || 0) < it.price) return false;
  F.coins -= it.price; sellMade(F, id); F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1; return true; }
// Mel's own paintings (the sip-and-paint keepsakes): up on the wall, never for sale
export const ownPaintings = F => Object.keys(F.inv || {}).filter(id => /^p_/.test(id) && F.inv[id] > 0 && ITEMS[id]);
export function hangOwn(F, id){ const g = galleryState(F), i = g.frames.indexOf(null); if (i < 0 || !(F.inv[id] > 0)) return false;
  F.inv[id]--; if (!F.inv[id]) delete F.inv[id]; const a = (PAINTINGS[id] || {}).art || [0, "#A68FCB", "#F3DDB0"]; g.frames[i] = {own: id, c1: a[1], c2: a[2]}; return true; }
export function takeDown(F, i){ const g = galleryState(F), f = g.frames[i]; if (!f || !f.own) return false; g.frames[i] = null; F.inv[f.own] = (F.inv[f.own] || 0) + 1; return true; }
// the painters' letters, a week after a sale
export const galleryMail = (F, t) => galleryState(F).sold.filter(s => s.at <= t && PAINTERS[s.by]).map(s => { const p = PAINTERS[s.by], line = p.note[hashS(s.id) % p.note.length].replace(/\{t\}/g, s.t);
  return {id: s.id, from: "postie", at: s.at, title: `${p.name}'s painting sold`, body: `${s.by === "dad" ? "Hello love" : "Dear Mel"},\n\n${line}\n\n${p.sign}`}; });

/* ---------- panels ---------- */
const swatch = (c1, c2) => `<span class="wpic"><svg width="30" height="30" viewBox="0 0 30 30"><rect x="2" y="3" width="26" height="24" rx="2" fill="#8A5A3A"/><rect x="5" y="6" width="20" height="18" fill="${c1}"/><path d="M5 18 Q12 12 18 17 T25 15 V24 H5z" fill="${c2}"/></svg></span>`;
export function galleryPanel(F){
  const g = galleryState(F), own = ownPaintings(F), free = g.frames.filter(f => !f).length;
  let h = `<h2>The gallery wall</h2><p class="sub">Four frames between the windows. Local painters hang their work here; when one sells you keep ${TOKEN} coins and the rest goes to the painter. They bring new ones on Mondays.</p><ul class="hlist wlist">`;
  h += g.frames.map((f, i) => !f ? `<li><span class="wtxt"><b>An empty frame</b><small>${own.length ? "Hang one of yours, or a painter will fill it on Monday" : "A painter will fill it on Monday"}</small></span></li>`
    : f.own ? `<li>${swatch(f.c1 || "#A68FCB", f.c2 || "#F3DDB0")}<span class="wtxt"><b>${esc(ITEMS[f.own].n.replace(/^Your painting: /, "").replace(/^./, c => c.toUpperCase()))}</b><small>Yours · not for sale</small></span><span class="orbtns"><button class="btn small alt" data-gg="down:${i}">Take it down</button></span></li>`
    : `<li>${swatch(f.c1, f.c2)}<span class="wtxt"><b>${esc(f.t)}</b><small>${esc(PAINTERS[f.by].name)} · ${esc(PAINTERS[f.by].what.toLowerCase())} · ${f.price} coins</small></span></li>`).join("") + `</ul>`;
  if (own.length && free) h += `<p class="eyebrow" style="margin:12px 0 6px">Hang one of yours</p><div class="actions">${own.map(id => `<button class="btn small alt" data-gg="hang:${id}">${esc(ITEMS[id].n.replace(/^Your painting: /, ""))}</button>`).join("")}</div>`;
  const recent = g.sold.slice(-3).reverse();
  if (recent.length) h += `<p class="muted">Sold lately: ${recent.map(s => `"${esc(s.t)}" by ${esc(PAINTERS[s.by].name)}`).join(", ")}.</p>`;
  return h;
}
export function makersPanel(F){
  const m = makersState(F), wk = Object.entries(m.week).filter(([, c]) => c > 0);
  let h = `<h2>The makers' shelf</h2><p class="sub">Little handmade things from around Honeybrook, on consignment: when one sells, the maker gets the money and you keep about a fifth. They top it up on Mondays.</p><ul class="hlist wlist">`;
  h += Object.entries(MAKERS).map(([k, mk]) => { const it = ITEMS[mk.item], n = m.stock[mk.item] || 0;
    return `<li><span class="wpic">${icon(mk.item, 28)}</span><span class="wtxt"><b>${esc(it.n)}</b><small>${esc(mk.name)} · ${it.price} coins · ${n ? `${n} on the shelf` : "sold out till Monday"}</small></span><span class="orbtns"><button class="btn small alt" data-gg="buy:${mk.item}" ${n && (F.coins || 0) >= it.price ? "" : "disabled"}>Buy one</button></span></li>`; }).join("") + `</ul>`;
  if (wk.length) h += `<p class="muted">This week the makers have taken home ${wk.map(([k, c]) => `${esc(MAKERS[k].name)} ${c}`).join(", ")} coins.</p>`;
  return h;
}
