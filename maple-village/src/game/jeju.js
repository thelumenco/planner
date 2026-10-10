// Jeju's rooms and things to join in with (rounds 128–129). The shops sell TOWN_GOODS (bought through ronda.js buyGood,
// the same data-rbuy buttons as Ronda's and Kyoto's). Three things to take part in, each more than a speech bubble:
//   the divers' breath song with Halmang Kim (dive, hold, and come up whistling while the depth is in the green;
//   three dives), sorting tangerines with Mr Ko (small, medium or large, against his clock), and dyeing a scarf with
//   green persimmons at Mr Moon's (four steps in order; then it hangs on Mel's own washing line at home and darkens
//   in the sun over three days). Evan joins in each. Also: the café's drinks, abalone porridge at the divers' house,
//   and the slow-post box at the market (a postcard to yourself that arrives two weeks later).
// State: F.jeju = {dives, diveDay, sorts, sortDay, dye: {from}, dyes, treats, juk, shell, sapling, post: [{id, at, to, line}]}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";

export function jejuState(F){ F.jeju = F.jeju || {}; return F.jeju; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : g.keep ? " · give it, or keep it" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const daysBetween = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z"))/864e5);

/* ---------- the breath song (the divers' house) ---------- */
// Dive: the depth gauge fills over DIVE.MS. Come up (the whistle, sumbisori) while it's in the green: not too soon
// (nothing found), not too late (out of breath; Halmang shakes her head, kindly). Three dives; two good ones and she
// gives you an abalone (once a day).
export const DIVE = {MS: 3200, LO: .62, HI: .9, N: 3, FINDS: ["a sea urchin", "a turban shell", "an abalone", "a little octopus (you let it go)"]};
export const diveStart = () => ({n: 0, good: 0, t0: 0, last: null, done: false});
export const descend = (st, now = Date.now()) => { if (st.done || st.t0) return false; st.t0 = now; return true; };
export const depth = (st, now = Date.now()) => st.t0 ? Math.min(1.2, (now - st.t0)/DIVE.MS) : 0;
export function surface(st, now = Date.now()){
  if (!st.t0 || st.done) return null;
  const d = depth(st, now), r = d < DIVE.LO ? "soon" : d > DIVE.HI ? "late" : "ok";
  st.n++; st.t0 = 0; if (r === "ok") st.good++; st.last = r === "ok" ? DIVE.FINDS[(st.n + st.good) % DIVE.FINDS.length] : r; if (st.n >= DIVE.N) st.done = true; return r;
}
export function diveReward(F, st, addInv, day = dayKey()){
  const j = jejuState(F); j.dives = (j.dives || 0) + 1; if (st.good < 2 || j.diveDay === day) return false;
  j.diveDay = day; addInv("abalone", 1); return true;
}
export const JUK = 9;   // a bowl of abalone porridge
export function haenyeoPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The divers' house</h2><p class="sub">Halmang Kim is seventy-four and has been diving since she was fifteen. She pats the cushion by the window. "Breathe like the sea. Then whistle when you come up. Everyone will know you're safe."</p>`;
  if (st) {
    if (!st.done) {
      const going = !!st.t0;
      h += `<h3 class="ph3">The breath song · dive ${Math.min(st.n + 1, DIVE.N)} of ${DIVE.N}</h3><p class="muted">${going ? "Down, down... come up while the depth is in the green, and whistle." : st.last ? (st.last === "soon" ? "Up too soon: nothing in your net. Try going a little deeper." : st.last === "late" ? "Out of breath! Halmang shakes her head, smiling. \"Not so long. The sea will wait.\"" : `Fweee! You come up whistling with ${esc(st.last)}.`) : "Take a big breath, then dive."}</p>
        <div class="jjdepth${going ? " on" : ""}"><span class="jjzone" style="left:${DIVE.LO*100}%;width:${((DIVE.HI - DIVE.LO)*100).toFixed(0)}%"></span>${going ? `<span class="jjfill" style="animation-duration:${DIVE.MS}ms;animation-delay:-${Date.now() - st.t0}ms"></span>` : ""}</div>
        <div class="actions">${going ? `<button class="btn primary big" data-jj="up">Come up and whistle</button>` : `<button class="btn primary" data-jj="down">Breathe in, and dive</button>`}</div>`;
      return h;
    }
    h += `<p class="sub">${st.good >= 2 ? `Three dives, ${st.good} good ones. Halmang laughs and taps the window: "Next year you come diving with us." She gives you an abalone from today's catch.` : `"Good try. It took me ten years," says Halmang, and pours you a cup of barley tea.`}${evan ? " Evan's been practising the whistle the whole time. Fweee! Fweeeee!" : ""}</p><div class="actions"><button class="btn alt" data-jj="again">Dive again</button></div>`;
  } else h += `<h3 class="ph3">The breath song</h3><p class="muted">Three practice dives with Halmang Kim. Free.${evan ? " Evan gets a little whistle of his own." : ""}</p><div class="actions"><button class="btn primary" data-jj="dive">Sit with Halmang</button></div>`;
  h += `<h3 class="ph3">A bowl of abalone porridge · ${JUK} ${coin()}</h3><p class="muted">Green from the abalone, sesame oil on top, kimchi on the side. What the divers eat after a dive.</p><div class="actions"><button class="btn alt" data-jj="juk" ${F.coins >= JUK ? "" : "disabled"}>A bowl, please</button></div>`;
  return h + list(F, "jj_haenyeo", "From the divers") + shut;
}

/* ---------- sorting tangerines (the packing shed) ---------- */
// Mr Ko holds up a tangerine: small, medium or large? Tap its crate. Eight of them before his clock runs out; six
// right and he gives you a bag of tangerines (once a day).
export const SORT = {N: 8, MS: 30000, SIZES: {small: "Small", medium: "Medium", large: "Large"}};
export const sortStart = (rng = Math.random, now = Date.now()) => ({t0: now, sizes: Array.from({length: SORT.N}, () => ["small", "medium", "large"][Math.floor(rng()*3)]), i: 0, good: 0, done: false});
export function sortTap(st, crate, now = Date.now()){
  if (st.done) return null; if (now - st.t0 > SORT.MS) { st.done = true; st.late = true; return "time"; }
  const ok = st.sizes[st.i] === crate; st.i++; if (ok) st.good++; if (st.i >= SORT.N) st.done = true; return ok ? "ok" : "off";
}
export function sortReward(F, st, addInv, day = dayKey()){
  const j = jejuState(F); j.sorts = (j.sorts || 0) + 1; if (st.good < 6 || j.sortDay === day) return 0;
  j.sortDay = day; const n = 3 + (st.good >= 8 ? 1 : 0); addInv("tangerine", n); return n;
}
const tangPic = size => { const r = size === "small" ? 10 : size === "medium" ? 15 : 21; return `<svg viewBox="0 0 60 60" width="66" height="66" aria-hidden="true"><circle cx="30" cy="${34}" r="${r}" fill="#F29A2E" stroke="#3b3530" stroke-width="1.4"/><path d="M30 ${34 - r} q5 -7 11 -6" fill="none" stroke="#4E7A3A" stroke-width="2.4"/>${size === "large" ? `<circle cx="30" cy="${34 - r}" r="4" fill="#F28C28" stroke="#3b3530" stroke-width="1"/>` : ""}</svg>`; };
export function shedPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The packing shed</h2><p class="sub">Mr Ko's family have grown tangerines here for four generations. The radio's on, the crates are piling up, and he looks at you hopefully.</p>`;
  if (st && !st.done) {
    const left = Math.max(0, Math.ceil((SORT.MS - (Date.now() - st.t0))/1000)), size = st.sizes[st.i];
    return h + `<h3 class="ph3">Sorting · ${st.i + 1} of ${SORT.N} · ${left}s on Mr Ko's clock</h3><div class="jjtang" data-size="${size}">${tangPic(size)}</div>
      <div class="actions">${Object.entries(SORT.SIZES).map(([k, n]) => `<button class="btn primary" data-jj="crate:${k}">${n}</button>`).join("")}</div>${evan ? `<p class="muted">Evan's sorting too: all of his go in the "eat now" crate.</p>` : ""}`;
  }
  if (st && st.done) h += `<p class="sub">${st.late ? "Time's up! " : ""}${st.good} of ${SORT.N} in the right crates. ${st.good >= 6 ? "\"You can come back next winter,\" says Mr Ko, very seriously, and fills a bag for you." : "\"Fine, fine. The big ones are tricky,\" says Mr Ko, and gives you one to eat."}</p><div class="actions"><button class="btn alt" data-jj="sort">Sort again</button></div>`;
  else h += `<h3 class="ph3">Sort the tangerines with Mr Ko</h3><p class="muted">Small, medium or large: eight of them, against his clock. Do well and he'll fill you a bag.</p><div class="actions"><button class="btn primary" data-jj="sort">Start sorting</button></div>`;
  return h + list(F, "jj_shed", "From the shed") + shut;
}

/* ---------- the café ---------- */
export const CAFE = {ade: ["Hallabong ade", 5, "Fizzy, cold and sharp, with a slice of hallabong floating on top. Like biting a tangerine in the sun."],
  latte: ["Tangerine latte", 5, "Milky and warm, with tangerine zest on the foam. Strange. Wonderful."],
  omija: ["Omija tea", 4, "Pink and clear: sweet, sour, salty, bitter and a little spicy all at once. Five flavours in one cup."],
  roll: ["Green tea roll cake", 6, "A soft green sponge rolled round cream, from the tea fields under the mountain."]};
export function cafeTreat(F, k){ const c = CAFE[k]; if (!c || F.coins < c[1]) return null; F.coins -= c[1]; const j = jejuState(F); j.treats = (j.treats || 0) + 1; return c; }
export function cafePanel(F, evan){
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The stone-house café</h2><p class="sub">Ha-eun's grandmother lived in this house. Now there's a coffee machine where the kitchen was, and the window looks straight out to sea.</p>
    <h3 class="ph3">Sit down with something</h3><ul class="hlist wlist">${Object.entries(CAFE).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-jj="cafe:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>
    ${evan ? `<p class="muted">Evan gets a tangerine juice with a straw, on the house.</p>` : ""}` + list(F, "jj_cafe", "To take home") + shut;
}

/* ---------- the market hall, and the slow-post box ---------- */
// A postcard to yourself (or the family) that the post office keeps for two weeks, then delivers (core.js slowMail).
export const POST = {price: 2, days: 14};
export function slowPost(F, to, day = dayKey()){
  if (F.coins < POST.price) return null; F.coins -= POST.price; const j = jejuState(F);
  const at = new Date(Date.parse(day + "T00:00:00Z") + POST.days*864e5).toISOString().slice(0, 10);
  j.post = [...(j.post || []), {id: `slowpost-${day}-${(j.post || []).length}`, from: day, at, to}].slice(-12); return at;
}
export function marketPanel(F){
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The market hall</h2><p class="sub">Mi-ok at the tangerine stall gives everyone a tangerine. Seaweed hangs in long black sheets; the black pork sizzles; a grandmother sells omija by the scoop.</p>`
    + list(F, "jj_market") + `<p class="muted">By the door there's an orange slow-post box: write a postcard now, and it's delivered in two weeks.</p>` + shut;
}
export function postPanel(F){
  const j = jejuState(F), waiting = (j.post || []).filter(p => p.at > dayKey());
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The slow-post box</h2><p class="sub">Write a postcard of the crater and the sea, drop it in, and the post office keeps it for two weeks before it's delivered. A little Jeju, arriving when you've almost forgotten.</p>
    ${waiting.length ? `<p class="muted">${waiting.length} on the way: the next one arrives ${esc(waiting[0].at)}.</p>` : ""}
    <div class="actions"><button class="btn primary" data-jj="post:me" ${F.coins >= POST.price ? "" : "disabled"}>To myself · ${POST.price} ${coin()}</button><button class="btn alt" data-jj="post:family" ${F.coins >= POST.price ? "" : "disabled"}>To the family · ${POST.price} ${coin()}</button></div>` + shut;
}
const POST_LINES = {me: "Dear me,\n\nYou're in Jeju as you write this. The wind is enormous and everything smells of tangerines. Remember the divers whistling as they came up? Remember the black stone walls? Go and have a cup of tea. You've earned it.\n\nLove, me (two weeks ago)",
  family: "Dear everyone,\n\nGreetings from Jeju! Black rocks, orange tangerines, green crater, very blue sea. Evan says hello (he says FWEEEE, which is how the divers say hello).\n\nLove, Mel xx"};
// the postcards that have arrived (core.js adds them to the mailbox)
export const slowMail = (F, day = dayKey()) => ((F.jeju && F.jeju.post) || []).filter(p => p.at <= day).map(p => ({id: p.id, from: "postie", at: Date.parse(p.at + "T08:00:00+08:00"), title: p.to === "family" ? "A postcard from Jeju (it took its time)" : "A postcard from you, two weeks ago", body: POST_LINES[p.to] || POST_LINES.me}));

/* ---------- dyeing with green persimmons (the dye workshop) ---------- */
// Four steps in order (Mr Moon puts your hand right if you go wrong). Then the cloth comes home and hangs on Mel's own
// washing line; it darkens in the sun over three days (art/jeju-rooms.js dyeCloth) and then it's a keepsake (j_scarf).
export const DYE = {price: 12, DAYS: 3, steps: ["Crush the green persimmons", "Soak the cloth in the juice", "Wring it out", "Lay it in the sun"]};
export const dyeDays = (F, day = dayKey()) => { const d = jejuState(F).dye; return d ? Math.max(0, daysBetween(d.from, day)) : -1; };
export function dyeScarf(F, day = dayKey()){ const j = jejuState(F); if (F.coins < DYE.price || j.dye) return null; F.coins -= DYE.price; j.dye = {from: day}; j.dyes = (j.dyes || 0) + 1; return true; }
// take it off the line at home -> "ready" (a keepsake now), "drying" (days left), or null
export function takeDye(F, addInv, day = dayKey()){ const n = dyeDays(F, day); if (n < 0) return null; if (n < DYE.DAYS) return {left: DYE.DAYS - n}; jejuState(F).dye = null; addInv("j_scarf", 1); return {ready: true}; }
export function dyePanel(F, st = {}, evan){
  const j = jejuState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The dye workshop</h2><p class="sub">Mr Moon's hands are orange to the wrist. "Galot," he says, holding up a shirt the colour of rust. "Farmers wore it. Cool, strong, never shows the dirt. The sun does the work."</p>`;
  h += `<h3 class="ph3">Dye a scarf with green persimmons · ${DYE.price} ${coin()}</h3>`;
  if (j.dye) h += `<p class="muted">Your scarf's drying on the washing line at home: ${dyeDays(F) >= DYE.DAYS ? "it's ready to take down!" : `${DYE.DAYS - dyeDays(F)} more day${DYE.DAYS - dyeDays(F) === 1 ? "" : "s"} of sun.`}</p>`;
  else if (st.step == null) h += `<p class="muted">Four steps, then you take it home: it hangs on your own washing line and darkens in the sun over three days, from pale green to deep rust.${evan ? " Evan gets to squish the persimmons." : ""}</p><div class="actions"><button class="btn primary" data-jj="dyego" ${F.coins >= DYE.price ? "" : "disabled"}>Start</button></div>`;
  else if (st.step < 4) h += `<p class="muted">${st.step ? `${esc(DYE.steps[st.step - 1])}: done. ` : ""}Next: tap the right step.${st.oops ? " (Mr Moon steers your hands: not that one yet.)" : ""}</p><div class="gchips">${[2, 0, 3, 1].map(i => `<button class="gchip" data-jj="dstep:${i}"><span>${esc(DYE.steps[i])}</span></button>`).join("")}</div>`;
  else h += `<p class="muted">The scarf's pale and green-ish and smells like unripe fruit. "Now the sun," says Mr Moon. "Three days. Every day it changes."</p><div class="actions"><button class="btn primary" data-jj="dyedone" ${F.coins >= DYE.price ? "" : "disabled"}>Take it home to dry · ${DYE.price} ${coin()}</button></div>`;
  return h + list(F, "jj_dye", "From the workshop") + shut;
}

// the room spots and the panel for each
export function jejuPanel(F, view, st = {}){
  return view === "jj_haenyeo" ? haenyeoPanel(F, st.dive, st.evan) : view === "jj_shed" ? shedPanel(F, st.sort, st.evan) : view === "jj_cafe" ? cafePanel(F, st.evan)
    : view === "jj_market" ? marketPanel(F) : view === "jjpost" ? postPanel(F) : view === "jj_dye" ? dyePanel(F, st.dye || {}, st.evan) : "";
}
