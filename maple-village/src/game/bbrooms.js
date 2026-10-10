// Bellbird Valley's rooms (round 142): every room at the six Vines stops has a panel when Mel taps its middle. The
// shops sell TOWN_GOODS (bought with the shared data-rbuy buttons); the cafés have things to eat or drink there and
// then (data-bb="treat:<room>:<k>"); a few rooms are just for looking (the platypus window, the noticeboard). The op
// shop's treasures change every day: four out of the box at a time. The chocolaterie has a free tasting once a day.
// The things to join in with (the balloon, riddling, dipping, the joeys, the canoe: bbacts.js) open from here too.
// State: F.bellbird.{treats, choc (day of the last free tasting), platypus (sightings), lunch (day)}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWNS, TOWN_GOODS } from "../data/towns.js";
import { BB_OPSHOP } from "../data/bellbird.js";
import { bbState } from "./bellbird.js";

const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const head = (room, sub, tape = "gingham") => `<span class="tape ${tape}" aria-hidden="true"></span><h2>${esc(TOWNS[Object.keys(TOWNS).find(t => TOWNS[t].rooms && TOWNS[t].rooms[room])].rooms[room].n)}</h2><p class="sub">${sub}</p>`;
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : g.keep ? " · give it, or keep it" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const listOf = (F, ids, title) => ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : "";
export const shopGoods = room => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === room && !TOWN_GOODS[id].op);

// the op shop: four treasures out each day, chosen by the date (the same four all day)
const hash = s => [...s].reduce((a, c) => (a*31 + c.charCodeAt(0)) >>> 0, 7);
export function opshopToday(day = dayKey()){ const pool = [...BB_OPSHOP], out = []; let h = hash(day); while (out.length < 4 && pool.length) { out.push(pool.splice(h % pool.length, 1)[0]); h = (h*1103515245 + 12345) >>> 0; } return out; }

// things to eat or drink in the room: [name, price, what it's like]
export const TREATS = {
  bv_store: {freddo: ["A Freddo Frog", 1, "A little chocolate frog from the jar by the till. Mrs Dunn says they were 20 cents when she was a girl."], vslice: ["A vanilla slice", 3, "Wobbly custard between two sheets of pastry, pink icing on top. Impossible to eat tidily."]},
  bv_shed: {apple: ["An apple from the honesty box", 1, "A crisp Pink Lady, cold from the crate. Coin in the tin, apple in your hand."]},
  bv_coffee: {flatwhite: ["A flat white", 4, "Silky, strong, a little fern drawn in the milk. In a cup with a balloon on it."], babycino: ["A babycino", 1, "Warm frothy milk with chocolate on top, and a marshmallow on the saucer."], anzac: ["An Anzac biscuit", 2, "Oats, golden syrup, coconut. Chewy in the middle, crunchy round the edge."]},
  bv_gallery: {scone: ["Wattleseed scones", 4, "Warm, nutty, a little like coffee, with jam and a cloud of cream."], myrtle: ["A pot of lemon myrtle tea", 3, "Pale gold, and so lemony you check there isn't a lemon in it."]},
  bv_tasting: {flight: ["A tasting flight", 6, "Three little glasses: the Chardonnay (peaches, toast), the Pinot (cherries, a bit of earth), and the sparkling, cold and fizzy. Kel tells you about each one like they're his kids."]},
  bv_restaurant: {lunch: ["The long lunch", 18, "Bread, olive oil, a salad from the garden, slow-roasted lamb with rosemary, and a pavlova to share. Everyone talks at once. It takes two hours. Nobody minds."]},
  bv_berrycafe: {scones: ["Scones with jam and cream", 4, "Jam first, then cream. Or cream first. The Berry Barn takes no sides."], smoothie: ["A berry smoothie", 4, "Strawberries, raspberries, blueberries and yoghurt, bright pink, with a paper straw."], pav: ["A slice of pavlova", 5, "Crisp outside, marshmallowy inside, heaped with cream and berries."]},
  bv_choc: {hotchoc: ["A hot chocolate", 4, "Thick, dark, in a little cup with a spoon, because it's nearly pudding."], rocky: ["Rocky road", 3, "Chocolate, marshmallows, raspberry lollies, coconut. Glorious chaos."]},
  bv_visitor: {pie: ["A pie with sauce", 4, "A meat pie from the warmer, tomato sauce on top. You eat it out of the paper bag."]},
  bv_campstore: {icypole: ["An icy pole", 2, "A raspberry one, already melting down your wrist."]}
};
export function treat(F, room, k){ const t = (TREATS[room] || {})[k]; if (!t || F.coins < t[1]) return null; F.coins -= t[1]; const s = bbState(F); s.treats = (s.treats || 0) + 1; return t; }
const treats = (F, room, title = "Here and now") => { const m = TREATS[room]; return m ? `<h3 class="ph3">${esc(title)}</h3><ul class="hlist wlist">${Object.entries(m).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-bb="treat:${room}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>` : ""; };

// the chocolaterie's free tasting (once a day)
export const chocFree = F => bbState(F).choc !== dayKey();
export function chocTaste(F){ if (!chocFree(F)) return false; bbState(F).choc = dayKey(); return true; }
// the platypus window: sometimes she's there, sometimes not (likelier at dawn and dusk)
export const platypusOdds = hm => hm < 9*60 || hm >= 17*60 ? .7 : .35;
export function watchWater(F, hm, rng = Math.random){ const seen = rng() < platypusOdds(hm); if (seen) { const s = bbState(F); s.platypus = (s.platypus || 0) + 1; } return seen; }
// the camp kitchen's noticeboard: notes from other campers
export const NOTES = ["LOST: one blue thong, left foot. If found, keep it, I've given up. — Ron (site 4)", "Free to a good home: half a bag of charcoal and a very good tea towel.", "Kids' cricket on the oval, 4pm, everyone welcome. Bring a bat if you've got one, we've only got the one.",
  "To whoever left the lemon cake on the table: you're a legend. — the Nguyens", "Saw a platypus at the bend upstream, 6am, two days running! — Hanne", "Bev's doing scones Saturday. Biscuit the dog is NOT allowed any more scones.", "Firewood's at the store, $5 a bag. Please don't take the fence.", "Rope swing is OPEN. Rope swing is FUN. Rope swing is not for adults over 90kg. — management"];

// each room's panel
export function bbRoomPanel(F, room, o = {}){
  const evan = !!o.evan;
  switch (room) {
    case "bv_store": return head(room, `Mrs Dunn has run the store for forty years. There's a post office counter, a jar of Freddos, and a fly screen door that bangs.`) + treats(F, room) + listOf(F, shopGoods(room), "Off the shelves") + (evan ? `<p class="muted">Mrs Dunn keeps an eye on the little one and the Freddo jar.</p>` : "") + shut;
    case "bv_shed": return head(room, `No one minds the shed: everything has a price on a bit of cardboard, and the money goes in the honesty tin. Mel counts out the right coins, carefully.`) + treats(F, room, "From the honesty box") + listOf(F, shopGoods(room), "To take home") + shut;
    case "bv_opshop": { const today = opshopToday();
      return head(room, `Joan and Marg run the op shop on Tuesdays and every other day they feel like it. The money goes to the bush fire brigade. New things come in every day.`, "stripe") + listOf(F, today, "Today's treasures") + `<p class="muted">Different things tomorrow. "You never know what's coming in," says Marg. "Last week, a canoe."</p>` + shut; }
    case "bv_coffee": return head(room, `Rosie's coffee caravan opens at dawn for the balloon crowd. The chalkboard has three things on it, and they're all good.`) + treats(F, room) + listOf(F, shopGoods(room), "To take home") + shut;
    case "bv_balloonshed": return head(room, `Rosie's dad Gus flies the balloons: dawn, and the golden hour before sunset. The baskets are taller than Evan.`, "stripe") + `<div class="actions"><button class="btn primary" data-bba="open:balloon">A balloon ride</button></div>` + listOf(F, shopGoods(room), "From the shop") + shut;
    case "bv_gallery": return head(room, `Paintings of the valley by local artists, a long window over the real thing, and scones that come out every twenty minutes.`) + treats(F, room) + listOf(F, shopGoods(room), "To take home") + shut;
    case "bv_tasting": return head(room, `Kel's family have grown grapes here for three generations. Pinot the cellar dog is asleep under the bar, as usual.`, "stripe") + treats(F, room, "A tasting") + listOf(F, shopGoods(room), "Bottles to take home") + shut;
    case "bv_cave": return head(room, `The barrel cave, dug into the hill. Racks of sparkling wine stand tilted neck-down in the cool, waiting for someone to give each bottle a little turn.`, "stripe") + `<div class="actions"><button class="btn primary" data-bba="open:riddle">Help Jono turn the bottles</button></div>` + shut;
    case "bv_restaurant": { const t = TREATS[room].lunch, done = bbState(F).lunch === dayKey();
      return head(room, `One long table for everyone, under the window onto the vines. No menu: whatever's good today.`) + `<h3 class="ph3">${esc(t[0])} · ${t[1]} ${coin()}</h3><p class="muted">${esc(t[2])}${o.party ? " Everyone you came with squeezes in." : ""}</p><div class="actions"><button class="btn primary" data-bb="treat:${room}:lunch" ${F.coins >= t[1] && !done ? "" : "disabled"}>${done ? "You've had lunch here today" : "A long lunch, please"}</button></div>` + shut; }
    case "bv_berrycafe": return head(room, `Gingham everywhere, jam on every table, and a queue for scones that goes out of the door on Sundays.`) + treats(F, room) + shut;
    case "bv_jam": return head(room, `Shaz stirs the copper pots with a paddle as long as an oar. The jars cool on the windowsill, lids popping one by one.`) + listOf(F, shopGoods(room), "From the jam kitchen") + shut;
    case "bv_choc": { const free = chocFree(F);
      return head(room, `Sophie runs the chocolaterie. The fountain never stops. Neither do the free tastings.`, "stripe") + `<h3 class="ph3">Free tasting</h3><p class="muted">${free ? "A little dish of buttons: dark, milk, white, and one with wattleseed." : "You've had your free tasting today. (Sophie pretends not to notice you looking.)"}</p><div class="actions"><button class="btn primary" data-bb="choc" ${free ? "" : "disabled"}>A free tasting</button><button class="btn alt" data-bba="open:dip">Dip strawberries</button></div>` + treats(F, room) + listOf(F, shopGoods(room), "To take home") + shut; }
    case "bv_visitor": return head(room, `The visitor centre at Gum Creek: a café counter, a wall of photos of every animal they've saved, and a shelf of soft toys.`) + treats(F, room) + listOf(F, shopGoods(room), "The gift shop") + shut;
    case "bv_hospital": return head(room, `Dr Mira and her nurses look after the animals that come in hurt: hit by cars, caught in fences, fallen out of pouches. Most of them go home to the bush.`) + `<div class="actions"><button class="btn primary" data-bba="open:joey">Help feed a joey</button></div>` + listOf(F, shopGoods(room), "Help a joey") + `<p class="muted">The money buys milk, pouches and the vet's time.</p>` + shut;
    case "bv_campstore": return head(room, `The camp store sells everything a camper forgot: firewood, ice, thongs, marshmallows. An old kelpie is asleep across the doorway.`) + treats(F, room) + listOf(F, shopGoods(room), "Off the shelves") + shut;
    case "bv_canoe": return head(room, `Canoes for hire, paddles on hooks, and life jackets in every size down to "very small".`, "stripe") + `<div class="actions"><button class="btn primary" data-bba="open:canoe">Take a canoe out</button></div>` + shut;
    default: return "";
  }
}
