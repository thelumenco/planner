// The villagers' backstories (round 104, data/stories.js): told a chapter at a time in their speech bubbles.
// When: at most one new chapter per villager per day, only on a day Mel has finished at least one real-life quest
// (F.storyDay, set in core.js countQuest), and only once its gates are met. A villager with a chapter ready shows a
// little "…" over their head; tap them to hear it. What's been heard is kept in F.story and listed in the friendship
// view ("Stories so far").
// State: F.story = {heard: {npc: n}, day: {npc: lastDay}, log: [{id, k, day}], flags: {}}
import { STORIES } from "../data/stories.js";
import { esc, dayKey } from "../util.js";
import { FISH } from "./fishing.js";
import { TAPAS } from "./kitchen.js";
import { addCuttings } from "./vineyard.js";

export function storyState(F){ F.story = F.story || {}; const s = F.story; s.heard = s.heard || {}; s.day = s.day || {}; s.log = s.log || []; s.flags = s.flags || {}; return s; }
const owns = (F, k) => !!(F.goals && F.goals[k]);
function gateOk(F, g){
  const s = storyState(F), m = /^(\w+):(\d+)$/.exec(g);
  if (m) return (s.heard[m[1]] || 0) >= +m[2];
  if (g === "cocoa" || g === "cellar") return owns(F, g);
  if (g === "trust1") return ((F.hfarm && F.hfarm.trust) || 0) >= 40;
  if (g === "fish5") return Object.keys((F.fish && F.fish.caught) || {}).length >= 5;
  if (g === "mill") return owns(F, "mill");
  if (g === "oil") return ((F.mill && F.mill.made) || 0) > 0;   // the first bottle pressed at the old mill
  if (g === "ronda2") return ((F.ronda && F.ronda.days) || []).length >= 2;   // a second day in Ronda
  if (g === "tiles4") return Object.keys((F.ronda && F.ronda.tiles) || {}).length >= 4;
  if (g === "cave") return !!(F.secret && F.secret.step >= 5);   // round 245: the secret passage found
  // rounds 272 to 275: the bottom row's threads
  if (g === "lowertrellis") return !!(F.vine && (F.vine.rows || []).slice(3).some(r => r && r.trellis));
  if (g === "pebble5") return ((((F.south || {}).ponies || {}).pebble || {}).trust || 0) >= 5;
  if (g === "flask") return !!(F.south && F.south.flask);
  if (["tin", "seal", "railkey", "notebook"].includes(g)) return !!(F.south && F.south.finds && F.south.finds[g]);
  if (g === "bouquet") return Object.keys(F.inv || {}).some(id => /^bq_/.test(id) && F.inv[id] > 0);
  return false;
}
// a chapter that could be told today (gates met, villager met, not told today) -> {k, ch} or null
function eligible(F, id, day){
  const list = STORIES[id]; if (!list) return null;
  const s = storyState(F), k = s.heard[id] || 0, ch = list[k];
  if (!ch || s.day[id] === day || !(F.met && F.met[id])) return null;
  return (ch.needs || []).every(g => gateOk(F, g)) ? {k, ch} : null;
}
// At most two villagers tell Mel a chapter each day (Mel asked: not everyone at once). Today's tellers are picked from
// those with a chapter ready, in an order that changes day to day; once two have told theirs, that's it till tomorrow.
export const TELLERS_PER_DAY = 2;
const order = (day, id) => { let h = 0; for (const c of day + id) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
// Ronda's locals tell theirs on a day trip, quest or no quest (Mel's on holiday); the two-a-day limit still holds
const LOCALS = ["carmen", "rafael", "lucia", "manolo", "sachiko", "joshin", "tanaka", "jason", "nanstorr", "tomhawsker", "priyajet", "pvrosa", "ilario", "bianca", "morwenna", "pifinn", "piivy", "bawayan", "bamade", "baketut", "hkharuko", "hkkenta", "hksato", "fmtoni", "fmmargalida", "fmrainbow"];   // Ronda's, Kyoto's, Saltwick's, Portovenere's, Puffin Isle's, Bali's, Hokkaido's and Formentera's, and Jason in Cinque Terre
export function storyReady(F, id, day = dayKey()){
  if (id === "jason") return eligible(F, id, day);   // Jason (Mel's friend) tells his whenever she visits, a chapter a day, outside the two-a-day limit
  if (F.storyDay !== day && !LOCALS.includes(id)) return null;
  const s = storyState(F), told = Object.keys(s.day).filter(x => s.day[x] === day && x !== "jason").length, left = TELLERS_PER_DAY - told;
  if (left <= 0) return null;
  const r = eligible(F, id, day); if (!r) return null;
  const today = Object.keys(STORIES).filter(x => x !== "jason" && (F.storyDay === day || LOCALS.includes(x)) && eligible(F, x, day)).sort((a, b) => order(day, a) - order(day, b)).slice(0, left);
  return today.includes(id) ? r : null;
}
// the chapter's rewards, applied once when it's told; addInv adds to the backpack; -> a line for the flash, or ""
const REWARDS = {
  henri: (F, addInv) => { addInv("s_recipebook", 1); addInv("s_praline", 2); return "Henri's recipe book (a keepsake) and two boxes of his hazelnut pralines"; },
  margaux: F => { F.vine = F.vine || {}; F.vine.cellar = F.vine.cellar || []; F.vine.cellar.push({id: "wmargaux", name: "Margaux 1984", type: "red", n: 1}); return "a bottle of Margaux 1984, in your cellar"; },
  label: (F, addInv) => { addInv("s_label", 1); return "Dad's Marchand label (a keepsake for a shelf)"; },
  blossom: (F, addInv) => { addInv("honey_blossom", 1); return "a jar of orchard blossom honey"; },
  toast: (F, addInv) => { addInv("s_toast", 2); return "two Postman's toasts"; },
  sign: F => { storyState(F).flags.sign = true; return "the old Marchand & Fille sign, back over the Cocoa Room door"; },
  koi: F => { storyState(F).flags.koi = true; applyFlags(F); return "a ranger's tip: golden koi bite more often at dusk"; },
  bouquet: F => { const id = Object.keys(F.inv || {}).find(x => /^bq_/.test(x) && F.inv[x] > 0); if (id) { F.inv[id]--; if (!F.inv[id]) delete F.inv[id]; } return ""; },
  nonna: (F, addInv) => { addInv("s_nonna", 2); return "two cups of Nonna's fior di latte"; },
  carmen: (F, addInv) => { addInv("yemas", 2); return "two boxes of Doña Carmen's yemas (one's for Pilar)"; },
  pastry: F => { storyState(F).flags.pastry = true; applyFlags(F); return "Farid's honey and pistachio pastries, on the tapas menu"; },
  chashaku: () => "Okada's grandmother's bamboo tea scoop, to take home to him",
  spoon: (F, addInv) => { addInv("s_spoon", 1); return "Tomás's olive-wood spoon (a keepsake)"; },
  poem: (F, addInv) => { addInv("s_poem", 1); return "a poem from Jason, in his neat handwriting (a keepsake)"; },
  oilcake: F => { storyState(F).flags.oilcake = true; applyFlags(F); return "Ines's abuela's olive oil cake, on the tapas menu"; },
  // Saltwick Harbour's locals
  storrhat: (F, addInv) => { addInv("sw_hat", 1); return "Jack Storr's old oilskin hat, from Nan"; },
  kittiwake: (F, addInv) => { addInv("sw_ship", 1); return "the Kittiwake in a bottle, made by Tom (a keepsake)"; },
  jetear: (F, addInv) => { addInv("sw_jetear", 1); return "a pair of Priya's jet earrings"; },
  // Portovenere's locals
  pvshellbox: (F, addInv) => { addInv("pv_shellbox", 1); return "one of Lia's shell-covered boxes, from Rosa (a keepsake, to keep your luck in)"; },
  pvpandolce: (F, addInv) => { addInv("pv_pandolce", 1); return "a pandolce from Rosa's harvest party on the quay"; },
  pvcoaster: (F, addInv) => { addInv("pv_coaster", 1); return "a portoro marble coaster, cut from Ilario's swift (a keepsake)"; },
  pvpoems: (F, addInv) => { addInv("pv_poems", 1); return "a little book of the Gulf's poets, from Signora Bianca"; },
  // Puffin Isle's locals
  pihoney: (F, addInv) => { addInv("pi_honey", 1); return "a jar of Bryn's thyme honey, from Morwenna's cupboard (Gwilym keeps bringing them)"; },
  pialmanac: (F, addInv) => { addInv("pi_almanac", 1); return "Morwenna's island almanac, with her tide notes pencilled in"; },
  pipostcard: (F, addInv) => { addInv("pi_postcard", 1); return "a puffin-stamp postcard from Finn, with Captain Pebbles' logbook entry on the back"; },
  pipuffin: (F, addInv) => { addInv("pi_puffin", 1); return "a knitted puffin from Finn, to celebrate Little Pebble fledging (he's named it)"; },
  pisuncatcher: (F, addInv) => { addInv("pi_suncatcher", 1); return "a sea-glass suncatcher from Ivy, a twin of the red one in the lamp room (a keepsake)"; },
  // Bali's locals
  basarong: (F, addInv) => { addInv("ba_sarong", 1); return "a sarong from Ibu Wayan, for the temple festival (wear a sash with it)"; },
  bavanilla: (F, addInv) => { addInv("ba_vanilla", 3); return "three Bali vanilla pods from Kadek's vine, pollinated by hand"; },
  bacoffee: (F, addInv) => { addInv("ba_coffee", 1); return "a bag of Kintamani coffee from Made's uncle, for late rehearsals"; },
  bakite: (F, addInv) => { addInv("ba_kite", 1); return "a Balinese kite with a hummer, from the gamelan boys on the beach"; },
  basilverear: (F, addInv) => { addInv("ba_silverear", 1); return "a pair of Ketut's silver filigree earrings, made from his mistake flowers"; },
  bagaruda: (F, addInv) => { addInv("ba_garuda", 1); return "a little carved Garuda from Gede's wedding, for good luck (a keepsake)"; },
  // Hokkaido's locals
  hkuni: (F, addInv) => { addInv("unikura", 1); return "a tray of sea urchin and salmon roe from Haruko's counter"; },
  hkcrab: (F, addInv) => { addInv("kingcrab", 2); return "two packs of king crab legs from Haruko's fortieth year breakfast (Takeshi brought far too much)"; },
  hkfloat: (F, addInv) => { addInv("hk_float", 1); return "one of Kenta's glass floats, made the way his grandfather made them (a keepsake)"; },
  hkmusicbox: (F, addInv) => { addInv("hk_musicbox", 1); return "a glass music box from Kenta that plays the old herring song"; },
  hksalts: (F, addInv) => { addInv("hk_bathsalts", 1); return "a jar of Mrs Sato's bath salts, from the ryokan's own spring"; },
  hkyukata: (F, addInv) => { addInv("hk_yukata", 1); return "a cotton yukata from Mrs Sato, chosen for you by Yui"; },
  // Formentera's locals
  fmflor: (F, addInv) => { addInv("flordesal", 1); return "a jar of flor de sal from Toni, skimmed off the pans on a still afternoon"; },
  fmherbsalt: (F, addInv) => { addInv("fm_herbsalt", 1); return "a jar of herb salt from this year's harvest, the rosemary mixed in by Toni's son Biel"; },
  fmfig: (F, addInv) => { addInv("fm_fig", 2); return "two bags of dried figs from the old tree behind Margalida's bakery"; },
  fmbiscuits: (F, addInv) => { addInv("fm_biscuits", 1); return "a bag of almond biscuits baked by Margalida's niece Aina"; },
  fmbracelet: (F, addInv) => { addInv("fm_bracelet", 1); return "a turquoise bead bracelet from Rainbow's blanket at La Mola market"; },
  priory: F => { addCuttings(F, "priory", 3); return "three cuttings of the monks' own grape, Priory Red, for your trellises"; },
  seacave: F => { storyState(F).flags.seacave = true; return "Bram's directions to the sea door below the lighthouse (low tide only)"; },
  ponypoem: (F, addInv) => { addInv("s_ponypoem", 1); return "a copy of Juniper's poem, 'The Grey Pony' (a keepsake)"; },
  fmring: (F, addInv) => { addInv("fm_ring", 1); return "a silver ring Rainbow made for you, with a tiny wave stamped inside (a keepsake)"; }
};
// flags that change the game: the koi tip, Farid's pastries on the menu
export function applyFlags(F){
  const f = storyState(F).flags;
  if (f.koi && FISH.koi) FISH.koi.w = 7;
  if (f.oilcake && !TAPAS.tortaaceite) TAPAS.tortaaceite = {n: "Ines's abuela's olive oil cake", need: {oliveoil: 1, flour: 1, egg: 1}, price: 12};
  if (f.pastry && !TAPAS.pasteles) TAPAS.pasteles = {n: "Farid's honey and pistachio pastries", need: {honey: 1, flour: 1}, price: 9};
}
// tell the chapter: marks it heard, applies the reward -> {lines, reward}
export function tellStory(F, id, addInv, day = dayKey()){
  const r = storyReady(F, id, day); if (!r) return null;
  const s = storyState(F); s.heard = {...s.heard, [id]: r.k + 1}; s.day = {...s.day, [id]: day}; s.log = [...s.log, {id, k: r.k, day}].slice(-200);
  const reward = r.ch.reward && REWARDS[r.ch.reward] ? REWARDS[r.ch.reward](F, addInv) : "";
  // round 203 (Mel: "I have no context for what they're saying"): from the second chapter on, they first remind Mel where they'd got to
  return {lines: r.k > 0 && r.ch.recap ? [r.ch.recap, ...r.ch.lines] : r.ch.lines, reward, done: r.k + 1 >= STORIES[id].length};
}
// the friendship view's "Stories so far": who's told what, in order (names from NPCS)
export function storiesHTML(F, names){
  const s = storyState(F), ids = Object.keys(STORIES).filter(id => s.heard[id]);
  if (!ids.length) return `<h3 class="ph3">Stories so far</h3><p class="muted">Everyone in Honeybrook has a story. Chat to people on days you've done a quest, and they'll tell you theirs, a little at a time. Look for the "…" over their heads.</p>`;
  return `<h3 class="ph3">Stories so far</h3>` + ids.map(id => `<details class="storylog"><summary><b>${esc(names[id] || id)}</b> <small>${s.heard[id]} of ${STORIES[id].length}${s.heard[id] >= STORIES[id].length ? " · the whole story" : ""}</small></summary>${STORIES[id].slice(0, s.heard[id]).map(ch => `<p>${ch.lines.map(esc).join(" ")}</p>`).join("")}</details>`).join("");
}
