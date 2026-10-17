// round 228: a surprise bouquet from Honeybrook's creator, every week or two (8 to 13 days apart, the first about a
// week into the game). It comes by post in the daytime with a note and 50 coins; the bouquet is a real one, to give
// to a villager (it counts as a gift) or sell at Hana's. Kept in F.creator: {next, sent: [{id, at, given}]}.
import { ITEMS } from "../data/items.js";

export const GIFT = {coins: 50, item: "cr_bouquet", first: [6, 9], gap: [8, 13]};
const DAY = 864e5;
ITEMS.cr_bouquet = {n: "Surprise bouquet", kind: "bouquet", sell: 12, ico: "cr_bouquet",
  say: "Roses, sweet peas and a sprig of lavender, tied with a ribbon. They came in the post with a note."};
const NOTE = "Hello,\n\nThank you for playing Honeybrook! I hope it's brought you a few slow, happy moments. Here are some flowers, and a little something for your purse.\n\nKeep the bouquet, give it to a villager, or sell it at Hana's. It's yours.\n\nWith love,\nFrom the creator, Mel";

const span = ([a, b], r) => (a + Math.floor(r*(b - a + 1)))*DAY;
export function creatorState(F, now, rnd = Math.random){
  F.creator = F.creator || {}; const c = F.creator; c.sent = c.sent || [];
  if (!c.next) c.next = now + span(GIFT.first, rnd());
  return c;
}
// due and daytime (8am to 8pm where the player is): a new bouquet in the post, and the next one booked
export function creatorPost(F, now, hm, rnd = Math.random){
  const c = creatorState(F, now, rnd); if (now < c.next || hm < 8*60 || hm >= 20*60) return null;
  const g = {id: "creator-" + now, at: now}; c.sent = [...c.sent, g].slice(-12); c.next = now + span(GIFT.gap, rnd()); return g;
}
// hand over what's arrived (once each): the bouquet to the backpack, the coins to the purse
export function collectCreator(F){
  const c = F.creator || {}, got = (c.sent || []).filter(g => !g.given); if (!got.length) return 0;
  got.forEach(g => { g.given = true; F.inv = F.inv || {}; F.inv[GIFT.item] = (F.inv[GIFT.item] || 0) + 1; F.coins = (F.coins || 0) + GIFT.coins; });
  return got.length;
}
export const creatorMail = F => ((F.creator || {}).sent || []).map(g => ({id: g.id, from: "creator", at: g.at, title: "Flowers for you", body: NOTE}));
