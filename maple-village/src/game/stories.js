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

export function storyState(F){ F.story = F.story || {}; const s = F.story; s.heard = s.heard || {}; s.day = s.day || {}; s.log = s.log || []; s.flags = s.flags || {}; return s; }
const owns = (F, k) => !!(F.goals && F.goals[k]);
function gateOk(F, g){
  const s = storyState(F), m = /^(\w+):(\d+)$/.exec(g);
  if (m) return (s.heard[m[1]] || 0) >= +m[2];
  if (g === "cocoa" || g === "cellar") return owns(F, g);
  if (g === "trust1") return ((F.hfarm && F.hfarm.trust) || 0) >= 40;
  if (g === "fish5") return Object.keys((F.fish && F.fish.caught) || {}).length >= 5;
  if (g === "ronda2") return ((F.ronda && F.ronda.days) || []).length >= 2;   // a second day in Ronda
  if (g === "tiles4") return Object.keys((F.ronda && F.ronda.tiles) || {}).length >= 4;
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
const LOCALS = ["carmen", "rafael", "lucia", "manolo"];
export function storyReady(F, id, day = dayKey()){
  if (F.storyDay !== day && !LOCALS.includes(id)) return null;
  const s = storyState(F), told = Object.keys(s.day).filter(x => s.day[x] === day).length, left = TELLERS_PER_DAY - told;
  if (left <= 0) return null;
  const r = eligible(F, id, day); if (!r) return null;
  const today = Object.keys(STORIES).filter(x => (F.storyDay === day || LOCALS.includes(x)) && eligible(F, x, day)).sort((a, b) => order(day, a) - order(day, b)).slice(0, left);
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
  pastry: F => { storyState(F).flags.pastry = true; applyFlags(F); return "Farid's honey and pistachio pastries, on the tapas menu"; }
};
// flags that change the game: the koi tip, Farid's pastries on the menu
export function applyFlags(F){
  const f = storyState(F).flags;
  if (f.koi && FISH.koi) FISH.koi.w = 7;
  if (f.pastry && !TAPAS.pasteles) TAPAS.pasteles = {n: "Farid's honey and pistachio pastries", need: {honey: 1, flour: 1}, price: 9};
}
// tell the chapter: marks it heard, applies the reward -> {lines, reward}
export function tellStory(F, id, addInv, day = dayKey()){
  const r = storyReady(F, id, day); if (!r) return null;
  const s = storyState(F); s.heard = {...s.heard, [id]: r.k + 1}; s.day = {...s.day, [id]: day}; s.log = [...s.log, {id, k: r.k, day}].slice(-200);
  const reward = r.ch.reward && REWARDS[r.ch.reward] ? REWARDS[r.ch.reward](F, addInv) : "";
  return {lines: r.ch.lines, reward, done: r.k + 1 >= STORIES[id].length};
}
// the friendship view's "Stories so far": who's told what, in order (names from NPCS)
export function storiesHTML(F, names){
  const s = storyState(F), ids = Object.keys(STORIES).filter(id => s.heard[id]);
  if (!ids.length) return `<h3 class="ph3">Stories so far</h3><p class="muted">Everyone in Honeybrook has a story. Chat to people on days you've done a quest, and they'll tell you theirs, a little at a time. Look for the "…" over their heads.</p>`;
  return `<h3 class="ph3">Stories so far</h3>` + ids.map(id => `<details class="storylog"><summary><b>${esc(names[id] || id)}</b> <small>${s.heard[id]} of ${STORIES[id].length}${s.heard[id] >= STORIES[id].length ? " · the whole story" : ""}</small></summary>${STORIES[id].slice(0, s.heard[id]).map(ch => `<p>${ch.lines.map(esc).join(" ")}</p>`).join("")}</details>`).join("");
}
