// Hokkaido's rooms and things to join in with (rounds 223 to 225). The shops sell TOWN_GOODS (the shared data-rbuy
// buttons). Things to take part in, each more than a speech bubble:
//   a seafood rice bowl at Haruko's counter (pick three toppings, then a dab of wasabi or none);
//   blowing your own glass float with Kenta (gather, blow, a colour, turn it round, into the cooling oven): a keepsake;
//   the onsen done properly at Mrs Sato's (wash, rinse, soak, then a yukata and tea): a mark on the seasons scroll;
//   skiing at Niseko with Ben in winter (hire, a three-step lesson, then a green run or, after the lesson, a red),
//   or a walk with him the rest of the year;
//   Kumiko's seeds (poppies, lupins, salvia, marigolds) to grow at home, and her rainbow rows.
// The seasons scroll (round 225): a visit in spring, summer, autumn and winter, a ski and a bath: all six, a keepsake.
// State: F.hokkaido = {seeds: {id: day}, rainbow, scroll: {spring, summer, autumn, winter, ski, bath}, myfloat, bowls,
//   skis, lesson (day), baths, walks, treats}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";
import { FLOWERS } from "../data/orchard.js";
import { hkSeason } from "../data/hokkaido.js";

export function hkState(F){ F.hokkaido = F.hokkaido || {}; const c = F.hokkaido; c.seeds = c.seeds || {}; c.scroll = c.scroll || {}; return c; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop && (!TOWN_GOODS[id].months || TOWN_GOODS[id].months.includes(+dayKey().slice(5, 7))));   // seasonal goods (the summer cherries) only in their months
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const treats = (F, menu, act) => `<ul class="hlist wlist">${Object.entries(menu).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-hk="${act}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;
export function treat(F, menu, k){ const t = menu[k]; if (!t || F.coins < t[1]) return null; F.coins -= t[1]; const c = hkState(F); c.treats = (c.treats || 0) + 1; return t; }

/* ---------- the seasons scroll ---------- */
export const SCROLL = {spring: "Spring: the sakura", summer: "Summer: the flower stripes", autumn: "Autumn: the golden birches", winter: "Winter: the snow", ski: "A run at Niseko", bath: "A bath at the ryokan"};
export const scrollSeason = day => ({sakura: "spring", spring: "spring", summer: "summer", autumn: "autumn", winter: "winter"})[hkSeason(day)];
// mark the scroll -> {k, name, all} the first time, else null
export function markScroll(F, k, addInv){
  const c = hkState(F); if (!SCROLL[k] || c.scroll[k]) return null; c.scroll[k] = dayKey();
  const all = Object.keys(SCROLL).every(x => c.scroll[x]); if (all && !c.scrollDone) { c.scrollDone = dayKey(); addInv("hk_scroll", 1); }
  return {k, name: SCROLL[k], all, n: Object.keys(SCROLL).filter(x => c.scroll[x]).length};
}
const scrollLine = F => { const c = hkState(F), n = Object.keys(SCROLL).filter(x => c.scroll[x]).length;
  return `<p class="muted">Mrs Sato's seasons scroll for you: ${Object.keys(SCROLL).map(k => `${c.scroll[k] ? "✓" : "○"} ${esc(SCROLL[k])}`).join(" · ")}${c.scrollDone ? ". Finished, and in your backpack." : ` (${n} of 6)`}</p>`; };

/* ---------- a seafood rice bowl at Haruko's counter ---------- */
export const DON = {price: 7, PICK: 3, tops: {uni: "Sea urchin", ikura: "Salmon roe", crab: "King crab", scallop: "Scallop", salmon: "Salmon", tamago: "Sweet omelette"}};
export const donStart = () => ({picks: [], wasabi: null});
export function donStep(st, what, v){
  if (what === "top") { if (!DON.tops[v] || st.picks.includes(v) || st.picks.length >= DON.PICK) return false; st.picks.push(v); return true; }
  if (what === "wasabi") { if (st.picks.length < DON.PICK || st.wasabi !== null) return false; st.wasabi = v === "yes"; return true; }
  return false; }
export const donDone = st => st.picks.length >= DON.PICK && st.wasabi !== null;
export function finishDon(F, st){ if (!donDone(st) || F.coins < DON.price) return null; F.coins -= DON.price; const c = hkState(F); c.bowls = (c.bowls || 0) + 1;
  const names = st.picks.map(k => DON.tops[k].toLowerCase()), three = `${names[0]}, ${names[1]} and ${names[2]}`;
  return st.picks.includes("uni") && st.picks.includes("ikura") ? `Haruko builds it: rice still warm, ${three}, glistening. "Uni and ikura together," she says. "The fishermen's favourite. Good choice."${st.wasabi ? " A little green dab of wasabi on the side." : ""}`
    : `Haruko builds it: rice still warm, then ${three}, a shiso leaf and a slice of lemon.${st.wasabi ? " A dab of fresh wasabi, grated on sharkskin." : " No wasabi: she nods. \"Taste the sea.\""}`; }
export function donPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Haruko's counter</h2><p class="sub">Steam from the rice pot, trays of glistening orange and gold, and Haruko wiping the counter with a flourish. "Sit, sit. Build your bowl."</p>`;
  if (!st) return h + `<p class="muted">Warm rice and three toppings of your choice, straight off this morning's boats. ${DON.price} coins.${evan ? " Evan gets a little bowl of rice with sweet omelette and a fishcake shaped like a flower." : ""}</p><div class="actions"><button class="btn primary" data-hk="don" ${F.coins >= DON.price ? "" : "disabled"}>Sit at the counter</button></div>` + shut;
  if (st.picks.length < DON.PICK) return h + `<p class="muted">Pick ${DON.PICK - st.picks.length} more topping${DON.PICK - st.picks.length > 1 ? "s" : ""}${st.picks.length ? ` (so far: ${st.picks.map(k => esc(DON.tops[k].toLowerCase())).join(", ")})` : ""}.</p><div class="gchips">${Object.entries(DON.tops).map(([k, n]) => `<button class="gchip${st.picks.includes(k) ? " on" : ""}" data-hk="top:${k}" ${st.picks.includes(k) ? "disabled" : ""}><span>${esc(n)}</span></button>`).join("")}</div>` + shut;
  if (st.wasabi === null) return h + `<p class="muted">Haruko holds up a fresh wasabi root and the little grater. "Wasabi?"</p><div class="actions"><button class="btn primary" data-hk="wasabi:yes">A little, please</button><button class="btn alt" data-hk="wasabi:no">No, thank you</button></div>` + shut;
  return h + `<p class="muted">Your bowl is ready.</p><div class="actions"><button class="btn primary" data-hk="dondone" ${F.coins >= DON.price ? "" : "disabled"}>Itadakimasu · ${DON.price} ${coin()}</button></div>` + shut;
}

/* ---------- blowing a glass float with Kenta ---------- */
export const GLASS = {price: 12, GATHER: 2, BLOW: 3, TURN: 2, colours: {blue: "Sea blue", green: "Bottle green", amber: "Amber", rose: "Rose pink"}};
export const blowStart = () => ({gather: 0, blow: 0, colour: null, turn: 0});
export function blowStep(st, what, v){
  if (what === "gather") { if (st.gather >= GLASS.GATHER) return false; st.gather++; return true; }
  if (what === "blow") { if (st.gather < GLASS.GATHER || st.blow >= GLASS.BLOW) return false; st.blow++; return true; }
  if (what === "colour") { if (st.blow < GLASS.BLOW || st.colour || !GLASS.colours[v]) return false; st.colour = v; return true; }
  if (what === "turn") { if (!st.colour || st.turn >= GLASS.TURN) return false; st.turn++; return true; }
  return false; }
export const blowDone = st => st.turn >= GLASS.TURN;
export function finishBlow(F, st, addInv){ if (!blowDone(st) || F.coins < GLASS.price || hkState(F).myfloat) return null; F.coins -= GLASS.price; const c = hkState(F); c.myfloat = st.colour; addInv("hk_myfloat", 1); return GLASS.colours[st.colour]; }
export function blowPanel(F, st, {evan, here}){
  const c = hkState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The furnace</h2><p class="sub">An orange roar behind a little door, blowpipes in a rack, and Kenta in a headband, sleeves rolled up.</p>`;
  if (c.myfloat) return h + `<p class="muted">Your ${esc(GLASS.colours[c.myfloat].toLowerCase())} float is safe at home. Kenta lets you watch him make a whole net of them, turning, turning, never hurrying.</p>` + shut;
  if (!here) return h + `<p class="muted">The furnace is ticking over, but Kenta's not here just now. He'll be back.</p>` + shut;
  if (!st) return h + `<p class="muted">Kenta makes the glass floats the fishermen used to use, and he'll help you make one of your own to keep. ${GLASS.price} coins.${evan ? " Evan is given safety goggles and the job of saying when." : ""}</p><div class="actions"><button class="btn primary" data-hk="blowstart" ${F.coins >= GLASS.price ? "" : "disabled"}>Roll up your sleeves</button></div>` + shut;
  if (st.gather < GLASS.GATHER) return h + `<p class="muted">Dip the end of the pipe into the furnace and turn it to gather a honey-bright blob of glass: ${st.gather}/${GLASS.GATHER}.</p><div class="actions"><button class="btn primary big" data-hk="gather">Gather</button></div>` + shut;
  if (st.blow < GLASS.BLOW) return h + `<p class="muted">Now blow, gently, like cooling soup. The blob swells into a bubble: ${st.blow}/${GLASS.BLOW}.</p><div class="actions"><button class="btn primary big" data-hk="blow">Blow gently</button></div>` + shut;
  if (!st.colour) return h + `<p class="muted">Roll it through the coloured glass chips. Which colour?</p><div class="gchips">${Object.entries(GLASS.colours).map(([k, n]) => `<button class="gchip" data-hk="colour:${k}"><span>${esc(n)}</span></button>`).join("")}</div>` + shut;
  if (st.turn < GLASS.TURN) return h + `<p class="muted">Back in the heat, and turn, turn, turn on the bench to keep it round: ${st.turn}/${GLASS.TURN}.</p><div class="actions"><button class="btn primary big" data-hk="turn">Turn</button></div>` + shut;
  return h + `<p class="muted">Kenta taps it off the pipe with one clean knock. "Into the cooling oven. Tomorrow it'll be ready. I'll wrap it for you now, actually, look, it's fine."</p><div class="actions"><button class="btn primary" data-hk="blowdone" ${F.coins >= GLASS.price ? "" : "disabled"}>Keep your glass float · ${GLASS.price} ${coin()}</button></div>` + shut;
}

/* ---------- the onsen, done properly, at Mrs Sato's ---------- */
export const BATH = {price: 6, SOAK: 3};
export const bathStart = () => ({wash: false, rinse: false, soak: 0, tea: false});
export function bathStep(st, what){
  if (what === "wash") { if (st.wash) return false; st.wash = true; return true; }
  if (what === "rinse") { if (!st.wash || st.rinse) return false; st.rinse = true; return true; }
  if (what === "soak") { if (!st.rinse || st.soak >= BATH.SOAK) return false; st.soak++; return true; }
  if (what === "tea") { if (st.soak < BATH.SOAK || st.tea) return false; st.tea = true; return true; }
  return false; }
export const bathDone = st => st.tea;
export function finishBath(F, st){ if (!bathDone(st) || F.coins < BATH.price) return null; F.coins -= BATH.price; const c = hkState(F); c.baths = (c.baths || 0) + 1; return c.baths; }
export function bathPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The outdoor bath</h2><p class="sub">A stone pool in the garden, steam curling up into the maples, and the sound of hot water trickling in from a bamboo spout.</p>`;
  if (!st) return h + `<p class="muted">Mrs Sato shows you how it's done: wash first, sitting on the little stool; rinse; then into the water, slowly. A yukata and tea after. ${BATH.price} coins.${evan ? " Evan has the little family bath with a wooden duck." : ""}</p><div class="actions"><button class="btn primary" data-hk="bath" ${F.coins >= BATH.price ? "" : "disabled"}>Take a towel</button></div>` + scrollLine(F) + shut;
  if (!st.wash) return h + `<p class="muted">First, sit on the little wooden stool at the washing place and wash, properly, all over. Nobody gets in the bath unwashed.</p><div class="actions"><button class="btn primary big" data-hk="wash">Wash</button></div>` + shut;
  if (!st.rinse) return h + `<p class="muted">Now rinse every bubble away with the wooden bucket.</p><div class="actions"><button class="btn primary big" data-hk="rinse">Rinse</button></div>` + shut;
  if (st.soak < BATH.SOAK) return h + `<p class="muted">Into the water, slowly. It's hot. Breathe out${st.soak ? `: ${"ahh ".repeat(st.soak).trim()}` : ""}. The little towel goes on your head, never in the water.</p><div class="actions"><button class="btn primary big" data-hk="soak">Breathe out</button></div>` + shut;
  if (!st.tea) return h + `<p class="muted">Pink and floppy and perfectly happy, you climb out. A cotton yukata is folded ready.</p><div class="actions"><button class="btn primary big" data-hk="tea">A yukata and tea</button></div>` + shut;
  return h + `<p class="muted">Mrs Sato pours green tea and sets down a little sweet. "Now you have done the onsen properly. My grandmother would approve."</p><div class="actions"><button class="btn primary" data-hk="bathdone" ${F.coins >= BATH.price ? "" : "disabled"}>Thank Mrs Sato · ${BATH.price} ${coin()}</button></div>` + shut;
}

/* ---------- skiing at Niseko with Ben (winter), or a walk with him ---------- */
export const SKI = {price: 8, steps: [["plough", "Make a pizza with your skis (snowplough)"], ["turn", "Lean and turn"], ["stop", "Stop without falling over"]]};
export const skiOn = day => hkSeason(day) === "winter";
export const skiStart = () => ({lesson: 0, run: null});
export function skiStep(F, st, what, v){
  if (what === "learn") { if (st.lesson >= SKI.steps.length) return false; st.lesson++; if (st.lesson === SKI.steps.length) hkState(F).lesson = dayKey(); return true; }
  if (what === "run") { if (v === "red" && hkState(F).lesson !== dayKey()) return false; if (!["green", "red"].includes(v) || st.run) return false; st.run = v; return true; }
  return false; }
export function finishSki(F, st){ if (!st.run || F.coins < SKI.price) return null; F.coins -= SKI.price; const c = hkState(F); c.skis = (c.skis || 0) + 1; return st.run; }
export const WALKS = {yotei: ["The Mount Yotei lookout", "Ben takes you up the trail to the lookout. Yotei stands across the valley like a child's drawing of a mountain, perfectly round, the top of it in a cloud. \"The locals call it Ezo Fuji,\" Ben says. \"Twelve years and I still stop every time.\""],
  birch: ["The birch trail", "A path through white birches, the ground soft with leaves. Ben points out a woodpecker's holes, deer prints and a red squirrel who tells you both off from a branch."]};
export function lodgePanel(F, st, {day, evan}){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The ski lodge</h2><p class="sub">Beams, a roaring stone fireplace, a rack of skis and a row of boots drying. Ben waves from the desk. "G'day! Konnichiwa! Both!"</p>`;
  if (!skiOn(day)) { h += `<h3 class="ph3">A walk with Ben</h3><p class="muted">No snow till December${evan ? ", sorry Evan" : ""}. The lifts are resting, but Ben guides walks the rest of the year. Where to?</p><div class="gchips">${Object.entries(WALKS).map(([k, [n]]) => `<button class="gchip" data-hk="walk:${k}"><span>${esc(n)}</span></button>`).join("")}</div>`; return h + list(F, "hk_lodge") + shut; }
  const c = hkState(F), lessoned = c.lesson === day;
  if (!st) return h + `<h3 class="ph3">Hit the slopes</h3><p class="muted">Ski hire for the day, ${SKI.price} coins. Ben will give you a lesson first if you like; you'll need it for the red run.${evan ? " Evan is taken off for sledging with the ski school's tiny ones." : ""}</p><div class="actions"><button class="btn primary" data-hk="ski" ${F.coins >= SKI.price ? "" : "disabled"}>Hire skis</button></div>` + list(F, "hk_lodge") + shut;
  if (!st.run && st.lesson < SKI.steps.length && !lessoned) return h + `<p class="muted">The nursery slope. Ben: "${esc(SKI.steps[st.lesson][1])}."${st.lesson ? ` (${st.lesson} of ${SKI.steps.length})` : ""}</p><div class="actions"><button class="btn primary big" data-hk="learn">Try it</button><button class="btn alt" data-hk="run:green">Skip to the green run</button></div>` + shut;
  if (!st.run) return h + `<p class="muted">Up the lift you go, the snow squeaking under the chair. Which run?</p><div class="actions"><button class="btn primary" data-hk="run:green">The gentle green</button><button class="btn primary" data-hk="run:red" ${lessoned ? "" : "disabled"}>The brave red</button></div>` + shut;
  return h + `<p class="muted">${st.run === "red" ? "Powder to your knees, the whole valley below you, and Mount Yotei watching. You fall over once, beautifully, and laugh all the way down." : "Soft snow, gentle turns, birches going by. You make it all the way to the bottom without stopping, and Ben whoops."}</p><div class="actions"><button class="btn primary" data-hk="skidone" ${F.coins >= SKI.price ? "" : "disabled"}>Back to the lodge · ${SKI.price} ${coin()}</button></div>` + shut;
}

/* ---------- Kumiko's seeds for home, and her rainbow rows ---------- */
export const SEEDS = {poppy: 12, lupin: 12, salvia: 12, marigold: 12};
export function buySeed(F, id){ const c = hkState(F), p = SEEDS[id]; if (!p || c.seeds[id] || F.coins < p) return null; F.coins -= p; c.seeds[id] = dayKey(); const first = !c.rainbow; c.rainbow = true; return {name: FLOWERS[id].n, first}; }
export function seedsPanel(F){
  const c = hkState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Kumiko's seed rack</h2><p class="sub">Little paper packets with hand-drawn flowers, the same ones that make the stripes on the hill. "For your farm at home," says Kumiko. "Ma Ma can plant them in your beds."</p>`;
  h += `<ul class="hlist wlist">${Object.entries(SEEDS).map(([id, p]) => { const f = FLOWERS[id], got = c.seeds[id];
    return `<li><span class="wpic">${icon("bq_" + id, 28)}</span><span class="wtxt"><b>${esc(f.n)}</b><small>${got ? "Yours: in Ma Ma's seedling list at home" : `Flowers in ${f.seasons.join(" and ")}`}</small></span>${got ? "" : `<button class="btn small primary" data-hk="seed:${id}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button>`}</li>`; }).join("")}</ul>`;
  h += c.rainbow ? `<p class="muted">Kumiko's tip: plant four different flowers along one row of beds at home and you'll have a rainbow row, like her stripes. Ma Ma picks an extra stem from each.</p>` : "";
  return h + shut;
}

/* ---------- treats ---------- */
export const CAFE = {softserve: ["Hokkaido milk soft-serve", 3, "Tall, white and so creamy it tastes of fresh milk and summer grass. Eat it fast."],
  melon: ["A slice of Yubari melon", 4, "Orange, juicy, so sweet it's almost honey. Kumiko cuts it into a perfect crescent."],
  hotmilk: ["Hot Hokkaido milk", 2, "A mug of hot milk with a little honey. Cosy all the way down."]};
export const EGGS = ["Onsen eggs", 2, "Two eggs cooked in the hot spring in a string basket: the whites soft as custard, the yolks just set, with a pinch of salt."];

export function hokkaidoPanel(F, view, st = {}){
  return view === "hkdon" ? donPanel(F, st.don, st.evan)
    : view === "hk_hall" ? `<span class="tape gingham" aria-hidden="true"></span><h2>The market hall</h2><p class="sub">Tanks of king crab, wooden trays of sea urchin like little gold tongues, salmon roe like jewels, and Haruko calling out prices.</p>` + list(F, "hk_hall") + `<p class="muted">King crab, the sea urchin and roe tray and kombu make three Hokkaido specials at the kitchen at home.</p><div class="actions"><button class="btn primary" data-hk="donopen">Haruko's counter: build a bowl</button></div>` + shut
    : view === "hkblow" ? blowPanel(F, st.blow, st)
    : view === "hk_glass" ? `<span class="tape gingham" aria-hidden="true"></span><h2>Kenta's glassworks</h2><p class="sub">An old stone warehouse on the canal: glass floats in fishing nets, shelves of bright glass catching the light, and a corner of music boxes all playing different tunes.</p>` + list(F, "hk_glass") + shut
    : view === "hkbath" ? bathPanel(F, st.bath, st.evan)
    : view === "hk_ryokan" ? `<span class="tape gingham" aria-hidden="true"></span><h2>Mrs Sato's ryokan</h2><p class="sub">Tatami, paper screens, the smell of cedar and tea. Mrs Sato bows. "Welcome. Please, take off your shoes."</p>` + list(F, "hk_ryokan") + scrollLine(F) + `<div class="actions"><button class="btn primary" data-hk="bathopen">The outdoor bath</button></div>` + shut
    : view === "hk_lodge" ? lodgePanel(F, st.ski, st)
    : view === "hkseeds" ? seedsPanel(F)
    : view === "hk_cafe" ? `<span class="tape gingham" aria-hidden="true"></span><h2>The farm café</h2><p class="sub">A red-roofed café at the top of the stripes: a soft-serve machine humming, melons in a row, and jars of pressed flowers in the window.</p>` + treats(F, CAFE, "cafe") + list(F, "hk_cafe") + `<div class="actions"><button class="btn primary" data-hk="seedsopen">Kumiko's seed rack</button></div>` + shut
    : "";
}
