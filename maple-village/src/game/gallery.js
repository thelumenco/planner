// The gift shop's gallery wall and makers' shelf (round 196: "the paintings, I do want them to be for sale, but
// the money, maybe they just pay me like a token 10 coins... the money goes to the person who made it and then the
// following week they could... write a letter to say thank you, I'm so excited about selling my painting").
// Gallery: four frames on the back wall, between the round windows. Local painters (Theo from the sip and paint, Juniper,
// Mr Okada, Mei) bring a new painting on Mondays to fill an empty frame. When one sells the player keeps a token TOKEN coins and
// the rest goes to the painter, who writes to her about it a week later. The player can hang her own sip-and-paint paintings
// there too: never for sale, and they come down again whenever she likes.
// Makers' shelf: villagers' small handmade things on consignment (about a fifth, CUT, to the player; the rest to the maker).
// They top it up on Mondays. The player can buy one herself at the full price (it all goes to the maker).
// State: F.giftshop.gallery = {frames: [{by, t, price} | {own: itemId} | null] x4, sold: [{by, t, at}], filled: day}
//        F.giftshop.makers = {stock: {itemId: n}, filled: day, week: {maker: coins}}
import { esc } from "../util.js";
import { ITEMS } from "../data/items.js";
import { icon } from "../art/icons.js";
import { PAINTINGS } from "../data/terrace-people.js";
import { lines, person, tradeOf } from "./contacts.js";
import { dearMe } from "./me.js";

export const TOKEN = 10, CUT = .2, FRAMES = 4;
const D = 864e5;
// the painters, what they paint (title, price, two colours for the little picture on the wall), and how they write
export const PAINTERS = {
  theo: {name: "Theo", what: "Landscapes, sketched by the water", sign: "Yours, officially, Theo",
    works: [["The terrace at dusk", 48, "#E9A87A", "#5A6B8C", "dusk"], ["Vines in October", 44, "#C98A3A", "#7A8C4A", "vines"], ["The jetty, early", 40, "#9FC3D9", "#E8D3A6", "jetty"], ["Lavender rows", 46, "#A68FCB", "#F3DDB0", "rows"], ["The orchard", 42, "#7FA35A", "#F3C969", "orchard"]],
    note: ["Somebody bought my painting. A real person, with real money. I have told everyone at the town hall. Twice.", "Posy rang to say '{t}' sold. I had to sit down. Hana says I'm insufferable now. She's right.", "'{t}' has gone to a good home, Posy says. I hope they hang it where the light's kind. I've already started the next one."]},
  juniper: {name: "Juniper", what: "Watercolours from the library garden", sign: "With love, Juniper (from behind the returns desk)",
    works: [["Rain on the reading room", 32, "#BFD6E6", "#8A8279", "rain"], ["Wisteria by the steps", 36, "#C3A9E0", "#9EBE8C", "wisteria"], ["The library cat, asleep", 28, "#E8C49A", "#5A4A3E", "cat"], ["Autumn, through the window", 34, "#D98A4A", "#F3E7C8", "window"]],
    note: ["I've been grinning at the date stamp all morning. '{t}' sold! I may frame the receipt.", "Thank you for giving my little watercolours a wall. '{t}' found a home, and I found I can't stop telling the regulars.", "Someone bought '{t}'. I keep imagining it on their wall, getting rained on in a painted sort of way."]},
  okada: {name: "Mr Okada", what: "Ink-brush landscapes", sign: "With thanks, K. Okada",
    works: [["The well, in mist", 52, "#E6E2DA", "#2F2B28", "well"], ["Two herons", 56, "#F3EFE6", "#3A4A5A", "herons"], ["Pine on the headland", 50, "#E9E4D6", "#2E3A2E", "pine"], ["Bridge in snow", 54, "#F6F3EE", "#4A4A4A", "bridge"]],
    note: ["I am told '{t}' has been sold. Forty years of sorting other people's letters, and now one of my brushes has travelled further than I ever did. Thank you.", "Ink is patient. So, it seems, was the person who bought '{t}'. I am very quietly delighted.", "A small note to say thank you. '{t}' sold, and I have bought myself a new brush to celebrate. A modest one."]},
  mei: {name: "Mei", what: "Botanical paintings from the flower farm", sign: "Mei, from the flower farm",
    works: [["Sweet peas, in a jar", 30, "#F4C7CF", "#7FA35A", "jar"], ["Dahlia study", 34, "#D9534F", "#5E8A3A", "dahlia"], ["Cosmos in the wind", 28, "#F3B6D0", "#9EBE8C", "cosmos"], ["The first rose", 32, "#E8566C", "#6A8A4A", "rose"]],
    note: ["'{t}' sold! I've been telling the dahlias. They're very proud.", "I painted '{t}' between waterings and never thought anyone would want it. Thank you for hanging it up.", "Posy says '{t}' went to a lady who smelled it first. That's the nicest thing anyone's ever done to one of my paintings."]}
};
// the makers and their things (kind "gift", so the player can buy one to give)
export const MAKERS = {
  lin: {name: "Auntie Lin", item: "mk_cards"}, bo: {name: "Bo", item: "mk_spoon"}, noor: {name: "Noor", item: "mk_pettoy"},
  wren: {name: "Wren", item: "mk_bird"}, hana: {name: "Hana", item: "mk_honeybutter"}, felix: {name: "Felix", item: "mk_wraps"}
};
Object.assign(ITEMS, {
  mk_cards: {n: "Pressed-flower cards", kind: "gift", to: "family", price: 6, art: ["tile", "#FFFDF6", "#F4C7CF"], maker: "lin", say: "Auntie Lin's pressed-flower cards! Too pretty to write in. I'll write in one anyway."},
  mk_spoon: {n: "A carved wooden spoon", kind: "gift", to: ["hana", "farid", "theo", "bo"], price: 9, art: ["disc", "#C9A27E", "#8A5A3A"], maker: "bo", say: "A wooden spoon Bo carved by hand! It's too nice for porridge. It's getting porridge."},
  mk_pettoy: {n: "A knitted mouse for a pet", kind: "gift", to: ["posy"], price: 5, art: ["tile", "#C3CDEE", "#F4C7CF"], maker: "noor", say: "A little knitted mouse from Noor's rescue! Every cat in the street will want it."},
  mk_bird: {n: "A whittled wren", kind: "gift", to: ["theo", "mei"], price: 8, art: ["bird", "#C9A27E"], maker: "wren", say: "A little wooden wren, whittled by the ranger! It's sitting on the windowsill, looking out."},
  mk_honeybutter: {n: "Hana's honey butter", kind: "gift", to: "family", price: 6, art: ["jar", "#F3D98A", "#FFFDF6"], maker: "hana", say: "Hana's honey butter, the one from her toast! On everything. On everything."},
  mk_wraps: {n: "Beeswax food wraps", kind: "gift", to: ["hana", "farid", "posy"], price: 7, art: ["cloth", "#F6E3A1", "#9EBE8C"], maker: "felix", say: "Beeswax wraps from Felix's bees! No more cling film. The kitchen smells like honey."}
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
    // while the player has a painting of her own (in her backpack or already up), the painters leave one frame for her
    const mine = ownPaintings(F).length || g.frames.some(f => f && f.own); let room = (mine ? FRAMES - 1 : FRAMES) - g.frames.filter(f => f && f.by).length;
    g.frames = g.frames.map(f => { if (f || !queue.length || room <= 0) return f; room--; const by = queue.shift(), done = new Set(g.sold.filter(s => s.by === by).map(s => s.t)), w = PAINTERS[by].works, pick = w.find(x => !done.has(x[0])) || w[hashS(day + by) % w.length]; n++;
      return {by, t: pick[0], price: pick[1], c1: pick[2], c2: pick[3], m: pick[4]}; });
  }
  if (!m.filled || (dow(day) === 1 && m.filled !== day)) { m.filled = day; m.week = {}; MAKER_ITEMS.forEach(id => { if ((m.stock[id] || 0) < STOCK) { m.stock[id] = STOCK; n++; } }); }
  return n;
}
// frames hung before round 197 learn their motif from the title
const motifOf = f => { if (f.m || !f.by) return f.m || OWN_MOTIF[f.own]; const w = (PAINTERS[f.by] || {works: []}).works.find(x => x[0] === f.t); return w && w[4]; };
export const framesNow = F => galleryState(F).frames.map(f => f && !f.m ? {...f, m: motifOf(f)} : f);
export const forSale = F => galleryState(F).frames.filter(f => f && f.by);
// a shopper buys a painting: The player keeps the token, the painter's letter comes a week later
export function sellPainting(F, i, at){
  const g = galleryState(F), f = g.frames[i]; if (!f || !f.by) return 0;
  g.frames[i] = null; g.sold = [...g.sold, {by: f.by, t: f.t, price: f.price, at: at + 7*D, id: `gal-${f.by}-${at}`}].slice(-40); return Math.min(TOKEN, f.price);
}
// a shopper (or the player) buys from the makers' shelf: The player's cut, or nothing when she buys it herself
export function sellMade(F, id){ const m = makersState(F); if (!(m.stock[id] > 0)) return 0; m.stock[id]--; const it = ITEMS[id];
  m.week[it.maker] = (m.week[it.maker] || 0) + it.price; return Math.max(1, Math.round(it.price*CUT)); }
export function buyMade(F, id){ const it = ITEMS[id]; if (!it || !(makersState(F).stock[id] > 0) || (F.coins || 0) < it.price) return false;
  F.coins -= it.price; sellMade(F, id); F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1; return true; }
// round 198: one of the travel boxes' things, into the player's backpack (she's already paid for it)
export function takeTravel(F, id){ const tr = (F.giftshop || {}).travel || {}; if (!(tr[id] > 0)) return false; tr[id]--; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1; return true; }
// The player's own paintings (the sip-and-paint keepsakes): up on the wall, never for sale
export const ownPaintings = F => Object.keys(F.inv || {}).filter(id => /^p_/.test(id) && F.inv[id] > 0 && ITEMS[id]);
export function hangOwn(F, id){ const g = galleryState(F), i = g.frames.indexOf(null); if (i < 0 || !(F.inv[id] > 0)) return false;
  F.inv[id]--; if (!F.inv[id]) delete F.inv[id]; const a = (PAINTINGS[id] || {}).art || [0, "#A68FCB", "#F3DDB0"]; g.frames[i] = {own: id, c1: a[1], c2: a[2], m: OWN_MOTIF[id] || "rows"}; return true; }
const OWN_MOTIF = {p_view: "rows", p_cypress: "cypress", p_still: "still"};
export function takeDown(F, i){ const g = galleryState(F), f = g.frames[i]; if (!f || !f.own) return false; g.frames[i] = null; F.inv[f.own] = (F.inv[f.own] || 0) + 1; return true; }
// the painters' letters, a week after a sale
export const galleryMail = (F, t) => galleryState(F).sold.filter(s => s.at <= t && PAINTERS[s.by]).map(s => { const p = PAINTERS[s.by], line = p.note[hashS(s.id) % p.note.length].replace(/\{t\}/g, s.t);
  return {id: s.id, from: "postie", at: s.at, title: `${p.name}'s painting sold`, body: `${dearMe(F)},\n\n${line}\n\n${p.sign}`}; });

/* ---------- the pictures (round 197: "the paintings all look the same") ---------- */
// what's painted inside a frame's canvas (x, y, w, h): each work its own little scene, in its two colours
const SKY = "#F6F1E8", INK = "#2F2B28";
export function paintSVG(x, y, w, h, f){
  const c1 = f.c1 || "#A68FCB", c2 = f.c2 || "#F3DDB0", X = v => (x + v*w).toFixed(1), Y = v => (y + v*h).toFixed(1), R = v => (v*w).toFixed(1);
  const bg = c => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  switch (f.m) {
    case "dusk": return bg(c1) + `<circle cx="${X(.65)}" cy="${Y(.45)}" r="${R(.16)}" fill="#F6E3A1"/><rect x="${x}" y="${Y(.62)}" width="${w}" height="${(h*.38).toFixed(1)}" fill="${c2}"/>${[.15, .35, .55, .75, .95].map(v => `<rect x="${X(v - .03)}" y="${Y(.52)}" width="${R(.05)}" height="${(h*.12).toFixed(1)}" fill="${INK}"/>`).join("")}<rect x="${x}" y="${Y(.52)}" width="${w}" height="${(h*.03).toFixed(1)}" fill="${INK}"/>`;
    case "vines": return bg("#F3DDB0") + [.2, .45, .7, .95].map((v, i) => `<path d="M${x} ${Y(v)} Q${X(.5)} ${Y(v - .12)} ${X(1)} ${Y(v)}" stroke="${i % 2 ? c1 : c2}" stroke-width="${(h*.07).toFixed(1)}" fill="none"/>`).join("");
    case "jetty": return bg(c1) + `<rect x="${x}" y="${Y(.55)}" width="${w}" height="${(h*.45).toFixed(1)}" fill="#7FA8C8"/><path d="M${X(.2)} ${Y(1)} L${X(.42)} ${Y(.5)} L${X(.52)} ${Y(.5)} L${X(.5)} ${Y(1)}z" fill="${c2}"/><circle cx="${X(.8)}" cy="${Y(.25)}" r="${R(.1)}" fill="#FFFDF6"/>`;
    case "rows": return bg("#BFD6E6") + `<rect x="${x}" y="${Y(.4)}" width="${w}" height="${(h*.6).toFixed(1)}" fill="${c2}"/>${[-.4, -.1, .2, .5, .8, 1.1, 1.4].map(v => `<path d="M${X(.5)} ${Y(.4)} L${X(v)} ${Y(1)}" stroke="${c1}" stroke-width="${(w*.08).toFixed(1)}"/>`).join("")}`;
    case "orchard": return bg("#DDEBF2") + `<rect x="${x}" y="${Y(.7)}" width="${w}" height="${(h*.3).toFixed(1)}" fill="${c1}"/>${[.25, .72].map(v => `<rect x="${X(v - .03)}" y="${Y(.5)}" width="${R(.06)}" height="${(h*.25).toFixed(1)}" fill="#8A5A3A"/><circle cx="${X(v)}" cy="${Y(.42)}" r="${R(.2)}" fill="${c1}"/><circle cx="${X(v - .06)}" cy="${Y(.38)}" r="${R(.04)}" fill="${c2}"/><circle cx="${X(v + .07)}" cy="${Y(.47)}" r="${R(.04)}" fill="${c2}"/>`).join("")}`;
    case "rain": return bg(c1) + `<rect x="${X(.15)}" y="${Y(.1)}" width="${R(.7)}" height="${(h*.7).toFixed(1)}" fill="#E6EEF3" stroke="${c2}" stroke-width="1.5"/><path d="M${X(.5)} ${Y(.1)} V${Y(.8)} M${X(.15)} ${Y(.45)} H${X(.85)}" stroke="${c2}" stroke-width="1.2"/>${[.25, .4, .62, .75].map((v, i) => `<path d="M${X(v)} ${Y(.18 + i*.05)} l-1 4" stroke="#7FA8C8" stroke-width="1"/>`).join("")}<rect x="${x}" y="${Y(.85)}" width="${w}" height="${(h*.15).toFixed(1)}" fill="${c2}"/>`;
    case "wisteria": return bg("#F6F1E8") + `<path d="M${x} ${Y(.12)} H${X(1)}" stroke="#8A5A3A" stroke-width="2"/>${[.15, .38, .62, .85].map((v, i) => `<ellipse cx="${X(v)}" cy="${Y(.38 + (i % 2)*.1)}" rx="${R(.08)}" ry="${(h*.2).toFixed(1)}" fill="${c1}"/>`).join("")}<rect x="${x}" y="${Y(.8)}" width="${w}" height="${(h*.2).toFixed(1)}" fill="${c2}"/>`;
    case "cat": return bg(c1) + `<rect x="${x}" y="${Y(.72)}" width="${w}" height="${(h*.28).toFixed(1)}" fill="#C9A27E"/><ellipse cx="${X(.5)}" cy="${Y(.66)}" rx="${R(.3)}" ry="${(h*.12).toFixed(1)}" fill="${c2}"/><circle cx="${X(.72)}" cy="${Y(.58)}" r="${R(.1)}" fill="${c2}"/><path d="M${X(.66)} ${Y(.51)} l2 -4 l2 4 M${X(.74)} ${Y(.51)} l2 -4 l2 4" fill="${c2}" stroke="${c2}"/><path d="M${X(.22)} ${Y(.7)} q-4 -6 2 -9" stroke="${c2}" stroke-width="2" fill="none"/>`;
    case "window": return bg(c2) + `<rect x="${X(.12)}" y="${Y(.1)}" width="${R(.76)}" height="${(h*.8).toFixed(1)}" fill="#F3E7C8" stroke="#8A5A3A" stroke-width="1.5"/><circle cx="${X(.5)}" cy="${Y(.45)}" r="${R(.22)}" fill="${c1}"/><rect x="${X(.48)}" y="${Y(.55)}" width="${R(.04)}" height="${(h*.3).toFixed(1)}" fill="#8A5A3A"/>${[[.3, .7], [.7, .3], [.62, .72]].map(([a, b]) => `<ellipse cx="${X(a)}" cy="${Y(b)}" rx="2" ry="1.3" fill="${c1}"/>`).join("")}`;
    case "well": return bg(c1) + `<rect x="${X(.3)}" y="${Y(.55)}" width="${R(.4)}" height="${(h*.3).toFixed(1)}" fill="none" stroke="${c2}" stroke-width="1.5"/><path d="M${X(.25)} ${Y(.35)} L${X(.5)} ${Y(.22)} L${X(.75)} ${Y(.35)} M${X(.32)} ${Y(.35)} V${Y(.55)} M${X(.68)} ${Y(.35)} V${Y(.55)}" stroke="${c2}" stroke-width="1.5" fill="none"/><path d="M${x} ${Y(.9)} H${X(1)}" stroke="${c2}" stroke-width="1" opacity=".5"/>`;
    case "herons": return bg(c1) + [.33, .68].map((v, i) => `<path d="M${X(v)} ${Y(.82)} V${Y(.5)} q0 -10 ${i ? 5 : -5} -12 M${X(v)} ${Y(.55)} q${i ? -8 : 8} -2 ${i ? -10 : 10} 6" stroke="${c2}" stroke-width="1.6" fill="none"/>`).join("") + `<path d="M${x} ${Y(.85)} H${X(1)}" stroke="${c2}" stroke-width="1" opacity=".5"/>`;
    case "pine": return bg(c1) + `<path d="M${x} ${Y(1)} L${X(.6)} ${Y(.62)} L${X(1)} ${Y(.75)} V${Y(1)}z" fill="${c2}" opacity=".5"/><path d="M${X(.45)} ${Y(.72)} V${Y(.25)} M${X(.45)} ${Y(.3)} q-10 4 -12 10 M${X(.45)} ${Y(.42)} q12 2 14 8 M${X(.45)} ${Y(.55)} q-8 2 -10 7" stroke="${c2}" stroke-width="2" fill="none"/>`;
    case "bridge": return bg(c1) + `<path d="M${x} ${Y(.75)} Q${X(.5)} ${Y(.3)} ${X(1)} ${Y(.75)}" stroke="${c2}" stroke-width="2.4" fill="none"/>${[.2, .35, .5, .65, .8].map(v => `<path d="M${X(v)} ${Y(.75 - Math.sin(v*Math.PI)*.42)} v-5" stroke="${c2}" stroke-width="1"/>`).join("")}${[[.15, .2], [.8, .15], [.45, .1], [.6, .9]].map(([a, b]) => `<circle cx="${X(a)}" cy="${Y(b)}" r="1" fill="#C9C3BA"/>`).join("")}`;
    case "jar": return bg("#F6F1E8") + `<rect x="${X(.32)}" y="${Y(.6)}" width="${R(.36)}" height="${(h*.32).toFixed(1)}" rx="3" fill="#CFE3EA" stroke="#9FB8C2"/>${[[.3, .3], [.5, .2], [.7, .32], [.42, .42], [.6, .45]].map(([a, b]) => `<path d="M${X(.5)} ${Y(.62)} L${X(a)} ${Y(b)}" stroke="${c2}" stroke-width="1"/><circle cx="${X(a)}" cy="${Y(b)}" r="${R(.07)}" fill="${c1}"/>`).join("")}`;
    case "dahlia": return bg("#F6F1E8") + `<path d="M${X(.5)} ${Y(1)} V${Y(.55)}" stroke="${c2}" stroke-width="2"/>${Array.from({length: 10}, (_, i) => `<ellipse cx="${X(.5)}" cy="${Y(.32)}" rx="${R(.07)}" ry="${R(.22)}" fill="${c1}" transform="rotate(${i*36} ${X(.5)} ${Y(.4)})"/>`).join("")}<circle cx="${X(.5)}" cy="${Y(.4)}" r="${R(.08)}" fill="#F3C969"/>`;
    case "cosmos": return bg("#E8F0E2") + [[.25, .35], [.55, .2], [.75, .45], [.4, .55]].map(([a, b]) => `<path d="M${X(a)} ${Y(b)} Q${X(a + .05)} ${Y(.75)} ${X(.5)} ${Y(1)}" stroke="${c2}" stroke-width="1" fill="none"/><circle cx="${X(a)}" cy="${Y(b)}" r="${R(.09)}" fill="${c1}"/><circle cx="${X(a)}" cy="${Y(b)}" r="${R(.03)}" fill="#F3C969"/>`).join("");
    case "rose": return bg("#F6F1E8") + `<path d="M${X(.5)} ${Y(1)} V${Y(.45)}" stroke="${c2}" stroke-width="2"/><ellipse cx="${X(.62)}" cy="${Y(.65)}" rx="${R(.12)}" ry="${R(.06)}" fill="${c2}"/><circle cx="${X(.5)}" cy="${Y(.36)}" r="${R(.17)}" fill="${c1}"/><path d="M${X(.42)} ${Y(.36)} q4 -6 8 0 q-4 5 -8 0" stroke="#FFFDF6" stroke-width=".8" fill="none"/>`;
    case "cypress": return bg(c2) + `<rect x="${x}" y="${Y(.8)}" width="${w}" height="${(h*.2).toFixed(1)}" fill="#9EBE8C"/>${[.3, .5, .7].map((v, i) => `<ellipse cx="${X(v)}" cy="${Y(.55 - (i % 2)*.06)}" rx="${R(.07)}" ry="${(h*.28).toFixed(1)}" fill="${c1}"/>`).join("")}`;
    case "still": return bg(c2) + `<rect x="${x}" y="${Y(.78)}" width="${w}" height="${(h*.22).toFixed(1)}" fill="#C9A27E"/><rect x="${X(.25)}" y="${Y(.35)}" width="${R(.16)}" height="${(h*.45).toFixed(1)}" rx="2" fill="${c1}"/><rect x="${X(.29)}" y="${Y(.2)}" width="${R(.08)}" height="${(h*.16).toFixed(1)}" fill="${c1}"/><path d="M${X(.58)} ${Y(.5)} h${R(.16)} l-2 6 h${(-(w*.16) + 4).toFixed(1)}z M${X(.66)} ${Y(.62)} v${(h*.15).toFixed(1)}" stroke="${INK}" stroke-width=".8" fill="#F3E7C8"/><circle cx="${X(.84)}" cy="${Y(.72)}" r="${R(.06)}" fill="#E8566C"/>`;
    default: return bg(c1) + `<path d="M${x} ${Y(.65)} Q${X(.35)} ${Y(.45)} ${X(.6)} ${Y(.6)} T${X(1)} ${Y(.55)} V${Y(1)} H${x}z" fill="${c2}"/>`;
  }
}

/* ---------- panels ---------- */
const swatch = f => `<span class="wpic"><svg width="30" height="30" viewBox="0 0 30 30"><rect x="2" y="3" width="26" height="24" rx="2" fill="#8A5A3A"/><svg x="5" y="6" width="20" height="18" overflow="hidden">${paintSVG(0, 0, 20, 18, f)}</svg></svg></span>`;
export function galleryPanel(F){
  const g = galleryState(F), own = ownPaintings(F), free = g.frames.filter(f => !f).length;
  let h = `<h2>The gallery wall</h2><p class="sub">Four frames between the windows. Local painters hang their work here; when one sells you keep ${TOKEN} coins and the rest goes to the painter. They bring new ones on Mondays.</p><ul class="hlist wlist">`;
  h += framesNow(F).map((f, i) => !f ? `<li><span class="wtxt"><b>An empty frame</b><small>${own.length ? "Hang one of yours, or a painter will fill it on Monday" : "A painter will fill it on Monday"}</small></span></li>`
    : f.own ? `<li>${swatch(f)}<span class="wtxt"><b>${esc(ITEMS[f.own].n.replace(/^Your painting: /, "").replace(/^./, c => c.toUpperCase()))}</b><small>Yours · not for sale</small></span><span class="orbtns"><button class="btn small alt" data-gg="down:${i}">Take it down</button></span></li>`
    : `<li>${swatch(f)}<span class="wtxt"><b>${esc(f.t)}</b><small>${esc(PAINTERS[f.by].name)} · ${esc(PAINTERS[f.by].what.toLowerCase())} · ${f.price} coins</small></span></li>`).join("") + `</ul>`;
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
  // round 198: from our travels: friends' own goods, in weekly boxes the player has paid for (so the takings are all hers)
  const tr = (F.giftshop || {}).travel || {}, ls = lines(F), ids = [...new Set([...ls.map(l => l.item), ...Object.keys(tr).filter(id => tr[id] > 0)])].filter(id => ITEMS[id]);
  h += `<p class="eyebrow" style="margin:14px 0 6px">From our travels</p>`;
  h += ids.length ? `<ul class="hlist wlist">${ids.map(id => { const l = ls.find(x => x.item === id), who = l && person(l.id) ? person(l.id).name : "a friend", n = tr[id] || 0;
      return `<li><span class="wpic">${icon(ITEMS[id].ico || id, 28)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>From ${esc(who)} · ${ITEMS[id].price} each (${tradeOf(id)} to you) · ${n ? `${n} on the shelf` : "next box on its way"}</small></span><span class="orbtns"><button class="btn small alt" data-gg="take:${id}" ${n ? "" : "disabled"}>Take one</button></span></li>`; }).join("")}</ul>`
    : `<p class="muted">Write to the friends you've made on your travels. After a few letters, some of them offer to send a little of their own for this shelf.</p>`;
  if (wk.length) h += `<p class="muted">This week the makers have taken home ${wk.map(([k, c]) => `${esc(MAKERS[k].name)} ${c}`).join(", ")} coins.</p>`;
  return h;
}
