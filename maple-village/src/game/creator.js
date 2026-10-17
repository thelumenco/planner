// round 228: a surprise bouquet from Honeybrook's creator, every week or two (8 to 13 days apart, the first about a
// week into the game). The postie brings it in the daytime: a note with the bouquet and 50 coins tucked in, handed
// over when the note is opened. The bouquet is a real one, to give to a villager (it counts as a gift) or sell at Hana's.
// Kept in F.creator: {next, sent: [{id, at, given, special?}], specials: {id: true}}.
//
// SPECIALS are the ones the creator sends on purpose (a hello, a sorry for bugs, Christmas): each has its own dates
// (from and until, as YYYY-MM-DD in the player's own day) and its own title, note and coins. Everyone who plays
// between those dates gets it once, in the daytime, on top of the regular ones (the next regular one waits at least
// three days after it, so two never land together).
// To send one: add a line here and push.
import { ITEMS } from "../data/items.js";

export const GIFT = {coins: 50, item: "cr_bouquet", first: [6, 9], gap: [8, 13]};
const DAY = 864e5, SIGN = "From the creator, Mel";
ITEMS.cr_bouquet = {n: "Surprise bouquet", kind: "bouquet", sell: 12, ico: "cr_bouquet",
  say: "Roses, sweet peas and a sprig of lavender, tied with a ribbon. They came in the post with a note."};
const NOTE = "Hello,\n\nThank you for playing Honeybrook! I hope it's brought you a few slow, happy moments. Here are some flowers, and a little something for your purse.\n\nKeep the bouquet, give it to a villager, or sell it at Hana's. It's yours.";
export const SPECIALS = [
  {id: "hello-2026-10", from: "2026-10-17", until: "2026-10-31", title: "Flowers for you", note: NOTE}
];

const span = ([a, b], r) => (a + Math.floor(r*(b - a + 1)))*DAY;
export function creatorState(F, now, rnd = Math.random){
  F.creator = F.creator || {}; const c = F.creator; c.sent = c.sent || []; c.specials = c.specials || {};
  if (!c.next) c.next = now + span(GIFT.first, rnd());
  return c;
}
// in the daytime (8am to 8pm where the player is): a special that's on and not yet had, or else the regular one if
// it's due (and the next one booked)
export function creatorPost(F, now, hm, day, rnd = Math.random, specials = SPECIALS){
  const c = creatorState(F, now, rnd); if (hm < 8*60 || hm >= 20*60) return null;
  const sp = specials.find(s => day >= s.from && day <= s.until && !c.specials[s.id]);
  if (sp) { c.specials[sp.id] = true; c.next = Math.max(c.next, now + 3*DAY); const g = {id: "creator-" + sp.id, at: now, special: sp.id}; c.sent = [...c.sent, g].slice(-12); return g; }
  if (now < c.next) return null;
  const g = {id: "creator-" + now, at: now}; c.sent = [...c.sent, g].slice(-12); c.next = now + span(GIFT.gap, rnd()); return g;
}
const specialOf = (g, specials = SPECIALS) => (g.special && specials.find(s => s.id === g.special)) || {};
const coinsOf = (g, specials) => specialOf(g, specials).coins != null ? specialOf(g, specials).coins : GIFT.coins;
// hand over what came with a note (once): the bouquet to the backpack, the coins to the purse (all of them without an id)
export function collectCreator(F, id){
  const c = F.creator || {}, got = (c.sent || []).filter(g => !g.given && (!id || g.id === id)); if (!got.length) return 0;
  got.forEach(g => { g.given = true; F.inv = F.inv || {}; F.inv[GIFT.item] = (F.inv[GIFT.item] || 0) + 1; F.coins = (F.coins || 0) + coinsOf(g); });
  return got.reduce((n, g) => n + coinsOf(g), 0) || got.length;
}
export const creatorMail = (F, specials = SPECIALS) => ((F.creator || {}).sent || []).map(g => { const s = specialOf(g, specials), coins = coinsOf(g, specials);
  return {id: g.id, from: "creator", at: g.at, title: s.title || "Flowers for you", body: `${s.note || NOTE}\n\nWith love,\n${SIGN}`,
    hello: "Flowers for you! And a note, with something tucked inside.", given: !!g.given,
    enclosed: [{ico: "cr_bouquet", n: ITEMS[GIFT.item].n}, ...(coins ? [{ico: "coin", n: `${coins} coins`}] : [])]}; });
