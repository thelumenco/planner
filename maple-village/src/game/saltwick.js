// Saltwick Harbour's rooms and things to join in with (rounds 207 to 209). The shops sell TOWN_GOODS (bought through
// ronda.js buyGood, the shared data-rbuy buttons). Three things to take part in, each more than a speech bubble:
//   polishing a piece of jet with Priya (rub it on the sandstone, buff it on the leather, until it shines: a jet charm
//   for your bracelet), the shanty by the fire at the Fisherman's Arms with Billy and Alf (2 till 5: sing the lines
//   and HEAVE on the heaves; the words to keep, written out by Billy), and crabbing off the quay (a line and a bit of
//   bacon from the chandlery, drop it, wait, pull up, count them, and let them all go). Evan joins in each.
// The charm bracelet (round 209): six jet charms, each for something done in Saltwick (anchor: polish jet with Priya;
// lobster: buy one at the fish market; lighthouse: walk out on the pier; abbey: visit the ruins; gull: a sit on the
// clifftop lawn; bridge: be there when the swing bridge opens for a boat). All six: Priya threads them on a chain.
// State: F.saltwick = {charms: {anchor: day, ...}, bracelet, polished, shanty, crabs, best, treats}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";

export function swState(F){ F.saltwick = F.saltwick || {}; F.saltwick.charms = F.saltwick.charms || {}; return F.saltwick; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const treats = (F, menu, act) => `<ul class="hlist wlist">${Object.entries(menu).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-sw="${act}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;
export function treat(F, menu, k){ const t = menu[k]; if (!t || F.coins < t[1]) return null; F.coins -= t[1]; const c = swState(F); c.treats = (c.treats || 0) + 1; return t; }

/* ---------- the charm bracelet ---------- */
export const CHARMS = {anchor: ["Anchor", "polish a piece of jet with Priya"], lobster: ["Lobster", "buy a lobster at the fish market"], lighthouse: ["Lighthouse", "walk out on the pier"],
  abbey: ["Abbey arch", "visit the abbey ruins"], gull: ["Gull", "sit a while on the clifftop lawn"], bridge: ["Swing bridge", "be there when the swing bridge opens for a boat"]};
// a charm earned -> its name the first time (null if she has it already); the sixth also makes the bracelet
export function earnCharm(F, k, addInv){ const c = swState(F); if (!CHARMS[k] || c.charms[k]) return null; c.charms[k] = dayKey();
  const all = Object.keys(CHARMS).every(x => c.charms[x]); if (all && !c.bracelet) { c.bracelet = dayKey(); addInv("sw_bracelet", 1); }
  return {name: CHARMS[k][0], all}; }
export const charmCount = F => Object.keys(swState(F).charms).filter(k => CHARMS[k]).length;
export function charmsPanel(F){
  const c = swState(F), n = charmCount(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The charm board</h2><p class="sub">Priya's cork board of little jet charms, each one a bit of Saltwick. "Earn them," she says, "and I'll thread you a bracelet. That's the rule. I made it up, but it's the rule."</p>
    <ul class="hlist wlist">${Object.entries(CHARMS).map(([k, [nm, how]]) => `<li><span class="wtxt"><b>${c.charms[k] ? "✓ " : ""}${esc(nm)}</b><small>${c.charms[k] ? "Yours." : `To earn it: ${esc(how)}.`}</small></span></li>`).join("")}</ul>
    <p class="muted">${c.bracelet ? "All six, on a silver chain: your bracelet's in your backpack (a keepsake for a shelf)." : `${n} of 6.`}</p>` + shut;
}

/* ---------- the swing bridge ---------- */
// It swings open for a boat every two hours, at half past (10:30, 12:30, 14:30, 16:30), for five minutes
export const bridgeOpen = hm => [10*60 + 30, 12*60 + 30, 14*60 + 30, 16*60 + 30].some(t => hm >= t && hm < t + 5);

/* ---------- polishing jet with Priya ---------- */
// Three rubs on the sandstone, three buffs on the leather: a dull grey lump turns glossy black. 8 coins (the jet's
// Priya's). The first time, she makes it into the anchor charm; after that, a little piece to keep or give (a pendant).
export const POLISH = {price: 8, RUB: 3, BUFF: 3};
export const polishStart = () => ({rub: 0, buff: 0});
export function polishStep(st, what){ if (what === "rub" && st.rub < POLISH.RUB) { st.rub++; return true; } if (what === "buff" && st.rub >= POLISH.RUB && st.buff < POLISH.BUFF) { st.buff++; return true; } return false; }
export const polishDone = st => st.rub >= POLISH.RUB && st.buff >= POLISH.BUFF;
export function finishPolish(F, addInv){ if (F.coins < POLISH.price) return null; F.coins -= POLISH.price; const c = swState(F); c.polished = (c.polished || 0) + 1;
  const charm = earnCharm(F, "anchor", addInv); if (!charm) addInv("sw_jetpend", 1); return {charm}; }
export function jetPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The jet workshop</h2><p class="sub">Priya's bench by the window: a grey sandstone slab, a strip of leather, a lamp, and a little heap of rough jet that looks like coal until it doesn't.</p>`;
  h += `<h3 class="ph3">Polish a piece of jet with Priya · ${POLISH.price} ${coin()}</h3>`;
  if (!st) h += `<p class="muted">Rub it on the stone, then buff it on the leather, until it shines. ${swState(F).charms.anchor ? "She'll set it as a little pendant for you." : "She'll make your first one into an anchor charm, for a bracelet."}${evan ? " Evan gets a tiny piece and a scrap of leather all of his own." : ""}</p><div class="actions"><button class="btn primary" data-sw="polish" ${F.coins >= POLISH.price ? "" : "disabled"}>Sit at the bench</button></div>`;
  else if (!polishDone(st)) {
    const onStone = st.rub < POLISH.RUB;
    h += `<p class="muted">${onStone ? `Rub it on the sandstone, round and round: ${st.rub}/${POLISH.RUB}. The grey wears away.` : `Now the leather, quick and light: ${st.buff}/${POLISH.BUFF}. It's starting to gleam.`}</p>
      <div class="ctmortar"><span style="height:${(st.rub + st.buff)*100/(POLISH.RUB + POLISH.BUFF)}%;background:#1E1E22"></span></div>
      <div class="actions"><button class="btn primary big" data-sw="${onStone ? "rub" : "buff"}">${onStone ? "Rub" : "Buff"}</button></div>`;
  } else h += `<p class="muted">Black as a winter night and shining like wet stone. Priya holds it to the lamp. "Look at that. A hundred and eighty million years, and you're the first to see it shine."</p><div class="actions"><button class="btn primary" data-sw="polished" ${F.coins >= POLISH.price ? "" : "disabled"}>Thank Priya · ${POLISH.price} ${coin()}</button></div>`;
  return h + list(F, "sw_jet", "In the glass case") + `<div class="actions"><button class="btn alt" data-sw="charms">The charm board</button></div>` + shut;
}

/* ---------- the shanty at the Fisherman's Arms ---------- */
// Billy sings the lines, Alf squeezes the box, the whole pub stamps; Mel sings along, and on the HEAVEs she heaves
// (the right button for each line). The first time through, Billy writes out the words for her to keep.
export const SHANTY = {from: 14*60, to: 17*60, lines: [
  ["Oh, the Margaret Ann sailed out at dawn", "sing"], ["With the cold wind in her sail", "sing"], ["HEAVE, my lads, and haul away", "heave"],
  ["There's herring in the bay!", "sing"], ["Oh, the gulls they cried and the tide ran high", "sing"], ["And we'll all be home by tea", "sing"],
  ["HEAVE, my lads, and haul away", "heave"], ["For Saltwick and the sea!", "sing"]]};
export const shantyOn = hm => hm >= SHANTY.from && hm < SHANTY.to;
export const shantyStart = () => ({i: 0, right: 0});
export function shantyPress(st, what){ if (st.i >= SHANTY.lines.length) return null; const ok = SHANTY.lines[st.i][1] === what; if (ok) st.right++; st.i++; return ok; }
export const shantyDone = st => st.i >= SHANTY.lines.length;
export function finishShanty(F, addInv){ const c = swState(F); const first = !c.shanty; c.shanty = (c.shanty || 0) + 1; if (first) addInv("sw_song", 1); return {first}; }
export function shantyPanel(F, st, {hm, evan, here}){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The shanty</h2><p class="sub">The corner by the fire: two stools, a squeezebox, and a pint of tea for each of them. Every afternoon from two till five, Billy and Alf sing, and the whole pub joins in.</p>`;
  if (!shantyOn(hm) || !here) return h + `<p class="muted">${shantyOn(hm) ? "Billy and Alf aren't in yet. Any minute." : "The singers come in at two o'clock and sing till five. Come back then."}</p>` + shut;
  if (!st) return h + `<h3 class="ph3">Join in</h3><p class="muted">Billy sings a line, everyone sings it back, and on the HEAVEs you all heave on an imaginary rope. Free: Ged says singing's on the house.${evan ? " Evan's been handed a spoon and a tin tray. This will be loud." : ""}</p><div class="actions"><button class="btn primary" data-sw="shanty">Pull up a stool</button></div>` + shut;
  if (!shantyDone(st)) { const [line] = SHANTY.lines[st.i];
    return h + `<p class="muted">Alf squeezes out a chord, Billy taps his boot... ${st.i ? `(${st.right} of ${st.i} spot on)` : ""}</p><p style="font-family:'Klee One',serif;font-size:1.15rem;text-align:center;margin:12px 0"><b>"${esc(line)}"</b></p>
      <div class="actions"><button class="btn primary big" data-sw="sing">Sing it</button><button class="btn primary big" data-sw="heave">HEAVE!</button></div>`; }
  return h + `<p class="muted">The last line, and the whole pub roars it. Glasses rattle. Somebody's dog howls along. ${st.right === SHANTY.lines.length ? "Billy points at you: \"She's a natural!\"" : "Billy grins: \"Not bad for a landlubber.\""}</p><div class="actions"><button class="btn primary" data-sw="shantydone">Cheer</button></div>` + shut;
}

/* ---------- crabbing off the quay ---------- */
// A line and a scrap of bacon (2 coins, from the chandlery's bucket by the door), drop it in, wait, pull up slowly:
// nought to four little green crabs. Count them into the bucket, then tip them all gently back.
export const CRAB = {price: 2, WAITS: 3};
export const crabStart = () => ({wait: 0, caught: null});
export function crabWait(st){ if (st.caught != null || st.wait >= CRAB.WAITS) return false; st.wait++; return true; }
export function crabPull(st, rng = Math.random){ if (st.wait < CRAB.WAITS || st.caught != null) return null; const r = rng(); st.caught = r < .1 ? 0 : r < .35 ? 1 : r < .65 ? 2 : r < .9 ? 3 : 4; return st.caught; }
export function finishCrab(F, n){ const c = swState(F); c.crabs = (c.crabs || 0) + n; c.best = Math.max(c.best || 0, n); return c; }
export function crabPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Crabbing off the quay</h2><p class="sub">Everyone does it: a line over the harbour wall, a bit of bacon in a net bag on the end, and a bucket of seawater to count them into. Then you tip them all back.</p>`;
  const c = swState(F);
  if (!st) return h + `<p class="muted">A line and bacon from the chandlery's bucket by the door: ${CRAB.price} ${coin()}.${c.best ? ` Your best: ${c.best} at once.` : ""}${evan ? " Evan's in charge of the bucket. He takes this very seriously." : ""}</p><div class="actions"><button class="btn primary" data-sw="crab" ${F.coins >= CRAB.price ? "" : "disabled"}>Drop a line · ${CRAB.price} ${coin()}</button></div>` + shut;
  if (st.caught == null) return h + `<p class="muted">${st.wait < CRAB.WAITS ? ["The line goes down into the green water... down... down.", "Wait. Keep still. Something's nibbling?", "A little tug. And another!"][st.wait] : "Now! Pull it up, slowly, slowly..."}</p>
    <div class="actions">${st.wait < CRAB.WAITS ? `<button class="btn primary big" data-sw="cwait">Wait...</button>` : `<button class="btn primary big" data-sw="cpull">Pull up, slowly</button>`}</div>`;
  return h + `<p class="muted">${st.caught ? `${st.caught} little green crab${st.caught > 1 ? "s" : ""} clinging to the bacon, waving their claws at you. Into the bucket they go${evan ? ", and Evan counts them, twice" : ""}.` : "Just the bacon, nibbled. The crabs have had a lovely lunch."}</p><div class="actions"><button class="btn primary" data-sw="crabdone">Tip them gently back</button></div>` + shut;
}

/* ---------- the rooms ---------- */
export const KETTLE = {tea: ["A pot of tea", 2, "Strong, hot, in a brown pot with a knitted cosy. Maud brings a jug of milk without asking."], curd: ["A slice of curd tart", 3, "Crumbly pastry, sweet curd, currants and a dusting of nutmeg. Maud watches you take the first bite."],
  crab: ["A crab sandwich", 4, "Nan Storr's crab on Maud's brown bread, with a little pot of salad. The taste of the coast."], scone: ["A scone with jam and cream", 3, "Still warm. Jam first, then cream, as Maud insists."]};
export const BAR = {ginger: ["A ginger beer", 2, "Fizzy and fiery in a stone bottle. Ged says it's what the lifeboat crew drink, which is a lie."], pie: ["A fish pie", 5, "Haddock and prawns under a crust of mash, bubbling, brought to your table by the fire."],
  cocoa: ["A hot chocolate by the fire", 2, "In a tankard, of course. Marshmallows bobbing like little lifebuoys."]};
export function kettlePanel(F, evan){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The Copper Kettle</h2><p class="sub">Maud's tearoom: every table a gingham cloth, every window steamed up, every cake under a glass dome. "Sit yourself down, pet."</p>${treats(F, KETTLE, "kettle")}${evan ? `<p class="muted">Evan's gets a gingerbread man on the side. Maud says it's from the gingerbread man's cousin in Leeds.</p>` : ""}` + list(F, "sw_kettle", "To take home") + shut; }
export function pubPanel(F, evan, hm){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The Fisherman's Arms</h2><p class="sub">Ged polishes a tankard that's already polished. The fire crackles. ${shantyOn(hm) ? "Over in the corner, Billy and Alf are singing." : "The chalkboard says SHANTY SINGERS EVERY AFTERNOON 2 TILL 5."}</p>${treats(F, BAR, "bar")}${evan ? `<p class="muted">Evan's ginger beer comes with a straw and a paper umbrella. "Don't tell the lifeboat lads," says Ged.</p>` : ""}<div class="actions"><button class="btn alt" data-sw="shantyopen">The shanty corner</button></div>` + shut; }
export function marketPanel(F){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The fish market</h2><p class="sub">Nan Storr wipes her hands on her apron. "Now then. What'll it be? Lobster's lovely, crab's lovely, and the sea salt's from the pans up the coast."</p>` + list(F, "sw_market") + `<p class="muted">The lobster, crab and onions make three Saltwick specials at the kitchen at home; sea salt and dulse go into gelato and bonbons.</p>` + shut; }
export function chandleryPanel(F){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The chandlery</h2><p class="sub">Tom Hawsker leans on the counter. "If it goes on a boat, I've got it. If it doesn't, I've probably got that too." By the door: a bucket of crab lines and a box of bacon scraps.</p>` + list(F, "sw_chandlery") + shut; }

export function saltwickPanel(F, view, st = {}){
  return view === "sw_market" ? marketPanel(F) : view === "sw_chandlery" ? chandleryPanel(F) : view === "sw_kettle" ? kettlePanel(F, st.evan)
    : view === "sw_jet" || view === "swpolish" ? jetPanel(F, st.polish, st.evan) : view === "swcharms" ? charmsPanel(F)
    : view === "sw_pub" ? pubPanel(F, st.evan, st.hm) : view === "swshanty" ? shantyPanel(F, st.shanty, st) : view === "swcrab" ? crabPanel(F, st.crab, st.evan) : "";
}
