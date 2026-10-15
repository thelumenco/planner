// The villagers' backstories (round 104, data/stories.js): told a chapter at a time in their speech bubbles.
// When: at most one new chapter per villager per day, only on a day you've finished at least one real-life quest
// (F.storyDay, set in core.js countQuest), and only once its gates are met. A villager with a chapter ready shows a
// little "…" over their head; tap them to hear it. What's been heard is kept in F.story and listed in the friendship
// view ("Stories so far").
// State: F.story = {heard: {npc: n}, day: {npc: lastDay}, log: [{id, k, day}], flags: {}}
import { boostedStory, hearts, MAX_HEARTS } from "./quests.js";
import { STORIES } from "../data/stories.js";
import { NPCS } from "../data/npcs.js";
import { esc, dayKey } from "../util.js";
import { FISH } from "./fishing.js";
import { TAPAS } from "./kitchen.js";

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
  if (g === "bouquet") return Object.keys(F.inv || {}).some(id => /^bq_/.test(id) && F.inv[id] > 0);
  return false;
}
// a chapter that could be told today (gates met, villager met, not told today) -> {k, ch} or null
// Honeybrook villagers open up as their hearts grow (quests.js: from requests and gifts): the first chapter once
// you've met, the last at five hearts, the ones between spread evenly. Travel locals keep the trip-day rules.
export const heartsFor = (k, n) => k === 0 ? 0 : k >= n - 1 ? MAX_HEARTS : Math.max(1, Math.round(k*(MAX_HEARTS - 1)/(n - 1)));
const isLocal = id => LOCALS.includes(id) || !!(NPCS.find(x => x.id === id) || {}).local;
export const nextHearts = (F, id) => { const list = STORIES[id], k = storyState(F).heard[id] || 0; return !list || k >= list.length || isLocal(id) ? null : heartsFor(k, list.length); };
function eligible(F, id, day){
  const list = STORIES[id]; if (!list) return null;
  const s = storyState(F), k = s.heard[id] || 0, ch = list[k];
  if (!ch || s.day[id] === day || !(F.met && F.met[id])) return null;
  if (!isLocal(id) && hearts(F, id) < heartsFor(k, list.length)) return null;
  return (ch.needs || []).every(g => gateOk(F, g)) ? {k, ch} : null;
}
// At most two villagers tell you a chapter each day (not everyone at once). Today's tellers are picked from
// those with a chapter ready, in an order that changes day to day; once two have told theirs, that's it till tomorrow.
export const TELLERS_PER_DAY = 2;
const order = (day, id) => { let h = 0; for (const c of day + id) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
// Ronda's locals tell theirs on a day trip, quest or no quest (you're on holiday); the two-a-day limit still holds
const LOCALS = ["carmen", "rafael", "lucia", "manolo", "sachiko", "joshin", "tanaka", "ornella"];   // Ronda's and Kyoto's, and Ornella in Cinque Terre
export function storyReady(F, id, day = dayKey()){
  if (!isLocal(id)) return eligible(F, id, day);   // a villager in Honeybrook: whenever their hearts allow, a chapter a day
  if (id === "ornella") return eligible(F, id, day);   // Ornella (your pen pal) tells hers whenever you visit, a chapter a day, outside the two-a-day limit
  if (boostedStory(F, id, day)) return eligible(F, id, day);   // their request was finished today: their next chapter's ready, outside the two-a-day limit
  if (F.storyDay !== day && !LOCALS.includes(id)) return null;
  const s = storyState(F), told = Object.keys(s.day).filter(x => s.day[x] === day && x !== "ornella").length, left = TELLERS_PER_DAY - told;
  if (left <= 0) return null;
  const r = eligible(F, id, day); if (!r) return null;
  const today = Object.keys(STORIES).filter(x => x !== "ornella" && (F.storyDay === day || LOCALS.includes(x)) && eligible(F, x, day)).sort((a, b) => order(day, a) - order(day, b)).slice(0, left);
  return today.includes(id) ? r : null;
}
// the chapter's rewards, applied once when it's told; addInv adds to the backpack; -> a line for the flash, or ""
const REWARDS = {
  henri: (F, addInv) => { addInv("s_recipebook", 1); addInv("s_praline", 2); return "Henri's recipe book (a keepsake) and two boxes of his hazelnut pralines"; },
  margaux: F => { F.vine = F.vine || {}; F.vine.cellar = F.vine.cellar || []; F.vine.cellar.push({id: "wmargaux", name: "Margaux 1984", type: "red", n: 1}); return "a bottle of Margaux 1984, in your cellar"; },
  label: (F, addInv) => { addInv("s_label", 1); return "Theo's Marchand label (a keepsake for a shelf)"; },
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
  poem: (F, addInv) => { addInv("s_poem", 1); return "a verse from Ornella, in her big sloping hand (a keepsake)"; },
  linseeds: (F, addInv) => { addInv("tomato_seed", 3); return "three packets of Lin's tomato seeds (with a poem on the back)"; },
  seabutton: (F, addInv) => { const b = (F.sew = F.sew || {}).buttons = (F.sew.buttons || {}); b.brass = (b.brass || 0) + 1; return "the sea captain's brass button, in your sewing basket"; },
  oilcake: F => { storyState(F).flags.oilcake = true; applyFlags(F); return "Ines's abuela's olive oil cake, on the tapas menu"; }
};
// has the chapter with this reward been told? (reads what's been heard, so saves from before it was asked work too).
// The loves round: once it has, Hana sells Postman's toast ("toast"), the Cocoa Room makes Henri's pralines ("henri")
// and the Scoop Shack makes Nonna's fior di latte ("nonna")
export const storyGiven = (F, reward) => { const s = storyState(F); return Object.entries(STORIES).some(([id, list]) => list.some((ch, k) => ch.reward === reward && (s.heard[id] || 0) > k)); };
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
  return {lines: r.ch.lines, reward, done: r.k + 1 >= STORIES[id].length};
}
// the friendship view's "Stories so far": a record to look back on, one card per teller (in the order you first heard
// them, the latest teller's card open), headed with their name and job (from NPCS; `names` from core.js wins for the
// name), each chapter numbered and in order, with its bubbles as they were said
const PLACES = {ronda: "Ronda", kyoto: "Kyoto", cinque: "Cinque Terre"};
export function storiesHTML(F, names){
  const s = storyState(F), ids = Object.keys(STORIES).filter(id => s.heard[id]);
  if (!ids.length) return `<h3 class="ph3">Stories so far</h3><p class="muted">Everyone in Honeybrook has a story. Help your neighbours and bring them gifts: as their hearts grow, they'll tell you theirs, a little at a time. Look for the "…" over their heads.</p>`;
  const first = {}, last = {};
  s.log.forEach((e, i) => { if (!(e.id in first)) first[e.id] = i; last[e.id] = i; });
  const pos = id => id in first ? first[id] : 1e6 + Object.keys(STORIES).indexOf(id);
  ids.sort((a, b) => pos(a) - pos(b));
  const latest = ids.reduce((m, id) => (last[id] ?? -1) > (last[m] ?? -1) ? id : m, ids[0]);
  const card = id => {
    const n = NPCS.find(x => x.id === id) || {}, heard = Math.min(s.heard[id], STORIES[id].length), all = STORIES[id].length;
    const where = n.local && PLACES[n.local] ? ` · ${PLACES[n.local]}` : "";
    const chapters = STORIES[id].slice(0, heard).map((ch, k) =>
      `<p><small style="display:block;color:#8A8279;font-size:.75rem;letter-spacing:.04em;text-transform:uppercase">Chapter ${k + 1}</small>${ch.lines.map(l => esc(l)).join(" ")}</p>`).join("");
    const more = heard >= all ? `<p><small style="color:#8A8279">The whole story.</small></p>` : `<p><small style="color:#8A8279">More to come, ${all - heard} chapter${all - heard === 1 ? "" : "s"} left.${nextHearts(F, id) != null && hearts(F, id) < nextHearts(F, id) ? ` The next one at ${nextHearts(F, id)} heart${nextHearts(F, id) === 1 ? "" : "s"}.` : ` Look for the "…" over their head.`}</small></p>`;
    const job = n.job ? esc(n.job) + (where && !n.job.includes(PLACES[n.local]) ? where : "") : where.slice(3);
    return `<details class="storylog"${id === latest ? " open" : ""}><summary><span style="display:block;flex:1;min-width:0"><b style="display:block">${esc(names[id] || n.name || id)}</b>${job ? `<small style="display:block">${job}</small>` : ""}<small style="display:block;color:#8A8279">${heard} of ${all} chapters heard</small></span></summary>${chapters}${more}</details>`;
  };
  return `<h3 class="ph3">Stories so far</h3><p class="muted">Every chapter you've been told, by who told it, in order. Tap a name to open their story.</p>` + ids.map(card).join("");
}
