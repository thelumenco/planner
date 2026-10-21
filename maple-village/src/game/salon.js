// Mika's (round 231, the creator: "a home hair salon in one of the cottages on Makers' Lane... a third villager who
// happens to share the house... one chair and one salon mirror... a little hair dryer... she's in an apron... clicks on
// the chair... choose their hair colour and the hairstyle... 5 coins for a haircut, 10 coins for a colour change").
// Mika, Mr Okada's granddaughter, cuts hair in the corner of his front room, 10am to 5pm, Tuesday to Saturday. Tap the
// chair, pick a style and a colour, see it on you, and have it done: a new style is 5 coins, a new colour 10, both 15.
// Nothing changed, nothing to pay. Her last story chapter makes your next visit free.
// State: F.salon = {free: 0 | 1, visits}
import { esc } from "../util.js";
import { STYLES, HAIRS, lookOf } from "./look.js";

export const SALON = {from: 10*60, to: 17*60, closed: [0, 1]};   // closed Sundays and Mondays
export const PRICE = {style: 5, colour: 10};
export const salonOpen = (day, hm) => !SALON.closed.includes(new Date(day + "T00:00:00Z").getUTCDay()) && hm >= SALON.from && hm < SALON.to;
export const salonState = F => (F.salon = F.salon || {free: 0, visits: 0});
// what a change would cost -> {style, colour, total, free}
export function quote(F, pick){
  const L = lookOf(F), s = pick.style && pick.style !== L.style ? PRICE.style : 0, c = pick.hair && pick.hair !== L.hair ? PRICE.colour : 0, free = !!salonState(F).free && !!(s || c);
  return {style: s, colour: c, total: free ? 0 : s + c, free};
}
// have it done -> {cost, q} or {err}
export function haveItDone(F, pick){
  const q = quote(F, pick); if (!q.style && !q.colour) return {err: "That's how it is now. Pick something new and Mika will get the scissors."};
  if (F.coins < q.total) return {err: `That's ${q.total} coins, and you have ${F.coins}.`};
  const L = lookOf(F), st = salonState(F); F.coins -= q.total; if (q.free) st.free = 0; st.visits = (st.visits || 0) + 1;
  F.me = {...(F.me || {}), look: {...L, style: q.style ? pick.style : L.style, hair: q.colour ? pick.hair : L.hair}};
  return {cost: q.total, q};
}

const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const chip = (val, on, label) => `<button type="button" class="gchip${on ? " on" : ""}" data-salon="style:${val}" aria-pressed="${on}"><span>${esc(label)}</span></button>`;
const swatch = (col, on, i) => `<button type="button" class="sw${on ? " on" : ""}" data-salon="hair:${col}" aria-pressed="${on}" aria-label="Hair colour ${i + 1}" style="background:${col}"></button>`;
export function salonHTML(F, st, open){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Mika's</h2>`;
  if (!open) return h + `<p class="sub">Mika's is closed just now. She cuts hair 10am to 5pm, Tuesday to Saturday. The chair's waiting, with a towel folded over the back.</p>` + shut;
  const L = lookOf(F), pick = {style: st.style || L.style, hair: st.hair || L.hair}, q = quote(F, pick);
  h += `<p class="sub">One chair, one mirror, a little hairdryer on the trolley, and Mika in her apron. A new style is ${PRICE.style} coins, a new colour ${PRICE.colour}, both ${PRICE.style + PRICE.colour}. You have ${F.coins} coins.</p>`;
  if (salonState(F).free) h += `<p class="muted">Your next visit's on Mika.</p>`;
  h += `<div class="sulook"><svg class="suprev" viewBox="-22 -70 44 74" width="110" height="185" aria-label="A preview of your new hair"><g id="slFig"></g></svg><div class="suopts">
      <p class="sulabel">Style</p><div class="gchips" role="radiogroup">${STYLES.map(([k, n]) => chip(k, k === pick.style, n)).join("")}</div>
      <p class="sulabel">Colour</p><div class="swatches" role="radiogroup" aria-label="Hair colour">${HAIRS.map((c, i) => swatch(c, c === pick.hair, i)).join("")}</div></div></div>`;
  const what = q.style && q.colour ? "A new style and colour" : q.style ? "A new style" : q.colour ? "A new colour" : "";
  return h + `<div class="actions"><button class="btn small" data-salon="do"${what ? "" : " disabled"}>${what ? `${what}: ${q.free ? "free" : `${q.total} coins`}` : "Pick something new"}</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
