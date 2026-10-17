// Elena's cottages: Bluebell and Fig Tree, buying them at five hearts with Elena, the catalogue, the nightly rate and
// the stars, bookings, the welcome, Hettie, and the garden (data/lets.js, game/lets.js, PUBLIC.md).
import { TIERS, COLOURS, CATS, ESSENTIAL, COTTAGES, EXTRAS, BOOK, WELCOME, FRIDGE, UNTIDY, KEEPER, STAY, REVIEWS, floorOf, catOf } from "../../src/data/lets.js";
import { OFFER_HEARTS } from "../../src/game/lets.js";
import { ITEMS } from "../../src/data/items.js";
import { esc, table, ico, itemIcon, coin, lede } from "../lib.mjs";

const IDS = Object.keys(COTTAGES);
const slotsOf = id => Object.keys(COTTAGES[id].slots);
const FLOOR = {down: "Downstairs", up: "Upstairs", bath: "The bathroom"};
const n = x => x.toLocaleString("en-GB");
// the game's own sums (game/lets.js scoreOf, rateOf, starsOf), for a cottage with every slot at one tier, or only the essentials
function sums(id, filled, tierSum, capAdd = 0){
  const all = slotsOf(id).length, complete = filled/all, quality = filled ? tierSum/(filled*3) : 0, score = .5*complete + .5*quality;
  return {rate: Math.round((COTTAGES[id].cap + capAdd)*(.3 + .7*score)), stars: Math.max(1, Math.min(5, 1 + Math.round(4*score))), score};
}
const stars = k => `<span aria-label="${k} stars">${"★".repeat(k)}${"☆".repeat(5 - k)}</span>`;
const priceAll = (id, t) => slotsOf(id).reduce((a, s) => a + CATS[catOf(id, s)].prices[t - 1], 0);
const extrasAdd = Object.values(EXTRAS).reduce((a, x) => a + x.add, 0), extrasCost = Object.values(EXTRAS).reduce((a, x) => a + x.price, 0);
const essentialSlots = id => ESSENTIAL.map(cat => slotsOf(id).find(s => catOf(id, s) === cat));
const swatch = c => `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c[1]};border:1px solid rgba(0,0,0,.25);vertical-align:-2px;margin-right:6px"></span>`;
const IDLE_TEXT = BOOK.idle.map((d, k) => [k, d]).slice(1);

function html(){
  const floors = IDS.map(id => { const C = COTTAGES[id], by = {down: [], up: [], bath: []};
    slotsOf(id).forEach(s => by[floorOf(id, s)].push(CATS[catOf(id, s)].n));
    const list = l => [...new Set(l)].map(x => { const k = l.filter(y => y === x).length; return k > 1 ? `${x} (${k})` : x; }).join(", ");
    return `<h3>${esc(C.n)}</h3>${table(["Floor", "Places for"], Object.entries(by).filter(([, l]) => l.length).map(([f, l]) => [`<b>${FLOOR[f]}</b>`, esc(list(l))]))}`; }).join("");
  const examples = IDS.map(id => { const C = COTTAGES[id], all = slotsOf(id).length, ess = essentialSlots(id).length;
    const rows = [["Just a bed, linen and a bath, all simple", sums(id, ess, ess)], ...[1, 2, 3].map(t => [`Every place filled, all ${TIERS[t].n.toLowerCase()}`, sums(id, all, all*t)]), ["Every place fine, and every garden extra", sums(id, all, all*3, extrasAdd)]];
    return `<h3>${esc(C.n)}</h3>${table(["Furnished with", "A night", "Stars"], rows.map(([w, s]) => [esc(w), coin(s.rate), stars(s.stars)]))}`; }).join("");
  const welcomeItems = FRIDGE.filter(id => ITEMS[id]);
  return lede(`Bluebell and Fig Tree, the two holiday cottages on the cottage lane by the station, are Elena's. Make friends with her and she'll sell them to you: then they're yours to furnish and let, a little landlord business of your own.`)
  + `<h2>${ico("heart", 22)} Buying them</h2>
    <p>Until you reach ${OFFER_HEARTS} hearts with <a href="/villagers/elena">Elena</a> they're her holiday lets, with guests out on the porch mornings and evenings. At ${OFFER_HEARTS} hearts she writes to say she'd rather sell them to a friend than a stranger off the train, and knocking on either door brings up her offer.</p>
    ${table(["Cottage", "Price", "Sleeps", "Most a night", "Places for furniture"], IDS.map(id => { const C = COTTAGES[id]; return [`${ico("home", 22)}<b>${esc(C.n)}</b><br><small class="muted">${esc(C.line)}</small>`, coin(C.price), C.sleeps, coin(C.cap), slotsOf(id).length]; }))}
    <p class="muted">"Most a night" is before the garden: each garden extra raises it (see below).</p>
  <h2>${ico("steps", 22)} The floors and rooms</h2>
    <p>Each cottage has two floors, like the old mill: the sitting room and table downstairs, with stairs up the left wall; the bed (or beds) and the little touches upstairs; and a bathroom through a door in the bedroom. The hall table downstairs is where it's all run: the catalogue, the parcels to unpack, the spares and the guest book. The garden is out of the back door.</p>
    ${floors}
  <h2>${ico("bed", 22)} The catalogue</h2>
    <p>Order at the hall table. Every piece comes in three tiers and five colours. Nothing is instant: an order comes on the next day's train, as a parcel in the hall, to unpack into its place. Swapping a piece out puts the old one in the spare room, to put back later or use in the other cottage.</p>
    ${table(["Piece", "Simple", "Good", "Fine"], Object.values(CATS).map(c => [`<b>${esc(c.n)}</b><br><small class="muted">${c.tiers.map((t, i) => `${TIERS[i + 1].n}: ${esc((x => x[0].toUpperCase() + x.slice(1))(t.replace(/^(A|An) /, "")))}`).join("<br>")}</small>`, ...c.prices.map(x => coin(x))]))}
    <p><b>Colours:</b> ${Object.values(COLOURS).map(c => `<span style="white-space:nowrap;margin-right:12px">${swatch(c)}${esc(c[0])}</span>`).join(" ")}</p>
    ${table(["Cottage", "Every place simple", "Every place good", "Every place fine"], IDS.map(id => [`<b>${esc(COTTAGES[id].n)}</b>`, coin(priceAll(id, 1)), coin(priceAll(id, 2)), coin(priceAll(id, 3))]))}
  <h2>${ico("coin", 22)} The nightly rate and the stars</h2>
    <p>The game sets the rent, from how complete the cottage is and how fine the furniture is. A cottage won't let at all without ${esc(ESSENTIAL.map(c => CATS[c].n.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1"))}.</p>
    <div class="box"><p style="margin:0"><b>Complete</b> = places filled ÷ all the places<br><b>Fine</b> = the average tier ÷ 3 (simple 1, good 2, fine 3)<br><b>Score</b> = half complete + half fine (0 to 1)<br><b>A night</b> = most a night × (0.3 + 0.7 × score), rounded<br><b>Stars</b> = 1 + 4 × score, rounded</p></div>
    ${examples}
  <h2>${ico("calendar", 22)} Bookings and the calendar</h2>
    <ul class="plain"><li>Guests book ${BOOK.lead[0]} to ${BOOK.lead[1]} days ahead, never more than ${Math.round(BOOK.horizon/7)} weeks ahead, for ${STAY.min} to ${STAY.max} nights. They come off the morning train, and pay when they leave.</li>
      <li>The calendar is a tab at the hall table. Tap a free day to close it (or reopen it); a booked day can't be closed. <b>Pause new bookings</b> stops new ones altogether: stays already booked still come.</li>
      <li>Between stays there are changeover days: ${BOOK.buffers.join(", ").replace(/, ([^,]*)$/, " or $1")}, your choice. The day the guests leave counts as the first.</li>
      <li>The better the last review, the sooner the next booking comes after a changeover: ${IDLE_TEXT.map(([k, d]) => `${k} star${k === 1 ? "" : "s"}, ${d} extra day${d === 1 ? "" : "s"}`).join("; ")}.</li>
      <li>If a cottage can't let any more when its guests arrive (the bed, linen or bath taken out), the booking is cancelled.</li>
      <li>Away for a while, the cottages run on, for up to the last 60 days: guests come, stay and pay, but with nobody tidying the reviews suffer.</li></ul>
  <h2>${ico("fridge", 22)} The welcome and the changeover</h2>
    <p>On a changeover day, go in, tidy up and make the beds (another tab at the hall table), then fill the fruit basket and the fridge from your backpack.</p>
    ${table(["", "Holds", "What can go in"], [[`${ico("apple", 22)}<b>Fruit basket</b>`, `Up to ${WELCOME.fruit}`, esc(Object.entries(ITEMS).filter(([, i]) => i.fruit).map(([, i]) => i.n).join(", "))], [`${ico("fridge", 22)}<b>The fridge</b>`, `Up to ${WELCOME.fridge}`, `Your own wine, and: ${welcomeItems.map(id => `<span style="white-space:nowrap">${itemIcon(id, 18)}${esc(ITEMS[id].n)}</span>`).join(", ")}`]])}
    <ul class="plain"><li><b>A good welcome</b> (tidy, with ${WELCOME.need} or more in the basket and ${WELCOME.need} or more in the fridge): the guests add a star to their review, and leave a tip of ${coin(WELCOME.tip)} for every thing you left.</li>
      <li><b>An untidy cottage</b> when they arrive takes ${UNTIDY} stars off. Either way they come, and they pay when they leave.</li>
      <li>Reviews are from 1 to 5 stars: the cottage's own stars, one more for a good welcome, ${UNTIDY} fewer if it wasn't tidy. They go in the guest book.</li></ul>
    ${table(["Stars", "The kind of thing guests write"], [5, 4, 3, 2, 1].map(k => [stars(k), `<span class="muted">"${esc(REVIEWS[k][0])}"</span>`]))}
  <h2>${ico("broom", 22)} Hettie, the housekeeper</h2>
    <p><a href="/villagers/hettie">Hettie</a> keeps house for the cottages on the lane, and does changeovers if you hire her: ${IDS.map(id => `${coin(KEEPER.fee[id])} a time at ${esc(COTTAGES[id].n)}`).join(", ")}, paid on the day the guests leave. She tidies, then fills the basket and the fridge from a pantry cupboard you keep stocked with fruit and treats. If you haven't the coins for her fee that day, she can't do it. On her changeover mornings she's at the cottage from 10. Let her go any time.</p>
  <h2>${ico("sprout", 22)} The garden</h2>
    <p>Out of the back door downstairs. The builders bring each thing the next day, and each raises the most the cottage can charge a night.</p>
    ${table(["Extra", "Price", "Adds to the most a night"], Object.values(EXTRAS).map(x => [`<b>${esc(x.n)}</b><br><small class="muted">${esc(x.line)}</small>`, coin(x.price), `+${coin(x.add)}`]))}
    <p>All of them together cost ${coin(extrasCost)} a cottage and add ${coin(extrasAdd)}: ${IDS.map(id => `${esc(COTTAGES[id].n)} up to ${coin(COTTAGES[id].cap + extrasAdd)} a night`).join(", ")}.</p>`;
}
export const pages = () => [{slug: "elenas-cottages", title: "Elena's cottages", section: "cottages", blurb: "Buying Bluebell and Fig Tree, furnishing them, the nightly rate, bookings, the welcome, Hettie and the garden", html: html(),
  search: [{t: "Bluebell", d: "One of Elena's cottages", a: "/elenas-cottages"}, {t: "Fig Tree", d: "One of Elena's cottages", a: "/elenas-cottages"}, {t: "Holiday lets", d: "Elena's cottages", a: "/elenas-cottages"},
    {t: "Hettie (housekeeper)", d: "Changeovers at Elena's cottages", a: "/elenas-cottages"}, {t: "Furniture catalogue", d: "Elena's cottages", a: "/elenas-cottages"}, {t: "Nightly rate and stars", d: "Elena's cottages", a: "/elenas-cottages"},
    ...Object.values(EXTRAS).map(x => ({t: x.n, d: "A garden extra for the cottages", a: "/elenas-cottages"}))]}];
