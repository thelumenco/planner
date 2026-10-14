// The quest board (phase 2 of the public edition). Two kinds of quest, side by side:
//   your tasks      real-life things you type in, one-off or daily. Ticking one pays TASK_PAY coins, but only the first
//                   PAID_PER_DAY ticks of a day pay (add and tick as many as you like). Daily tasks come back fresh each
//                   morning; one-offs stay until ticked (then they're crossed off for the rest of that day) or removed.
//   village requests  notes from villagers ("Hazel needs 3 bottles of olive oil by Friday"). At most MAX_REQ up at once,
//                   a new one most days. They only ask for things you can already grow or make, and pay a little more
//                   than the market would, but never more than a shop's own price for the same thing. Hand them over
//                   to the villager in person. A missed deadline just takes the note down: no penalty.
// Finishing a villager's request adds a heart (up to five, never lost). Hearts bring a thank-you letter, a small gift
// and the next chapter of their story (stories.js storyReady reads boostedStory).
// State lives in F.board: {tasks:[{id, title, daily, at, doneDay}], paid:{day, ids:[]}, counted:{day, ids:[]},
//   reqs:[{id, who, item, n, each, posted, due}], lastPost, hearts:{who: n}, seen:{item: true}, letters:[...], story:{who: day}}
import { esc, dayKey, prevDay, hash } from "../util.js";
import { ITEMS, CROPS, seasonOf } from "../data/items.js";

export const TASK_PAY = 3, PAID_PER_DAY = 10, MAX_REQ = 3, MAX_HEARTS = 5;
const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const addDays = (k, n) => new Date(Date.parse(k + "T00:00:00Z") + n*864e5).toISOString().slice(0, 10);
const dow = k => new Date(k + "T00:00:00Z").getUTCDay();

export function board(F){
  const b = F.board = F.board || {};
  if (!Array.isArray(b.tasks)) b.tasks = [];
  if (!Array.isArray(b.reqs)) b.reqs = [];
  if (!Array.isArray(b.letters)) b.letters = [];
  ["hearts", "seen", "story"].forEach(k => { if (!b[k] || typeof b[k] !== "object") b[k] = {}; });
  ["paid", "counted"].forEach(k => { if (!b[k] || b[k].day !== dayKey()) b[k] = {day: dayKey(), ids: []}; });
  return b;
}

/* ---------- your tasks ---------- */
export const isDone = (t, day = dayKey()) => t.doneDay === day;
// what the board shows today: every daily task, and one-offs not yet done (or done today, crossed off)
export const myTasks = (F, day = dayKey()) => board(F).tasks.filter(t => t.daily || !t.doneDay || t.doneDay === day);
export const tasksLeft = F => myTasks(F).filter(t => !isDone(t)).length;
export const paidToday = F => board(F).paid.ids.length;
export function addTask(F, title, daily){
  title = String(title || "").replace(/\s+/g, " ").trim().slice(0, 120); if (!title) return null;
  const t = {id: "t" + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36), title, daily: !!daily, at: Date.now()};
  board(F).tasks.push(t); return t;
}
export function removeTask(F, id){
  const b = board(F), i = b.tasks.findIndex(t => t.id === id); if (i < 0) return null;
  const [t] = b.tasks.splice(i, 1); return {t, i};
}
export function restoreTask(F, r){ const b = board(F); if (r && r.t && !b.tasks.some(t => t.id === r.t.id)) b.tasks.splice(Math.min(r.i, b.tasks.length), 0, r.t); }
// -> {coins, first} : coins to pay (0 once today's paid ticks are used up), first: the first time this task counted today
export function tickTask(F, id){
  const b = board(F), t = b.tasks.find(x => x.id === id); if (!t || isDone(t)) return null;
  t.doneDay = dayKey();
  const pays = b.paid.ids.length < PAID_PER_DAY && !b.paid.ids.includes(id);
  if (pays) b.paid.ids.push(id);
  const first = !b.counted.ids.includes(id); if (first) b.counted.ids.push(id);
  return {coins: pays ? TASK_PAY : 0, first, t};
}
// -> coins to take back (a tick undone gives back what it paid)
export function untickTask(F, id){
  const b = board(F), t = b.tasks.find(x => x.id === id); if (!t || !isDone(t)) return 0;
  delete t.doneDay;
  const i = b.paid.ids.indexOf(id); if (i < 0) return 0;
  b.paid.ids.splice(i, 1); return TASK_PAY;
}

/* ---------- village requests ---------- */
// Who asks, what they'd most like (item ids, in order; anything else they can use comes after) and why.
export const ASKERS = {
  hana:    {likes: ["carrot", "tomato", "potato", "corn", "pea", "pepper", "leek", "pumpkin", "egg"], why: ["for the market stall", "my regulars keep asking", "the stall looks bare without them"]},
  hazel:   {likes: ["oliveoil", "goatmilk", "rosemary", "thyme", "mint", "sunflower"], why: ["for the Mill Shop", "I've an order to fill", "I'm trying something new"]},
  juniper: {likes: ["tulip", "sunflower", "wildflower", "strawberry", "blueberry"], why: ["for the library", "for the poetry evening", "a little treat for the reading hour"]},
  bo:      {likes: ["corn", "potato", "egg", "pumpkin", "loaf"], why: ["I'm building all week", "for the workshop", "it's been a long week at the bench"]},
  lin:     {likes: ["strawberry", "blueberry", "raspberry", "tomato", "pumpkin", "pea"], why: ["to see if yours beat mine", "for a recipe I'm testing", "I want to taste your soil"]},
  okada:   {likes: ["egg", "potato", "leek", "carrot", "apple", "pear"], why: ["for my Sunday soup", "my pantry's looking thin", "an old friend's coming to stay"]},
  theo:    {likes: ["sunflower", "tulip", "strawberry", "loaf", "egg"], why: ["for the town hall", "a little something for the clerks", "the records office needs cheering up"]},
  opal:    {likes: ["strawberry", "blueberry", "peach", "fig", "tulip"], why: ["for the bank's front desk", "a treat for the end of the month", "the counter needs some colour"]},
  posy:    {likes: ["tulip", "sunflower", "wildflower", "raspberry", "strawberry"], why: ["for the gift shop", "to tuck into a hamper", "a customer's asked for them"]},
  celeste: {likes: ["grape_red", "grape_white", "strawberry", "fig", "cherry", "loaf"], why: ["for the wine shop", "the regulars love them", "for a little tasting evening"]},
  marco:   {likes: ["egg", "loaf", "tomato", "potato", "corn"], why: ["for the vineyard crew", "for a picnic in the rows", "we've a long day of pruning"]},
  felix:   {likes: ["sunflower", "tulip", "wildflower", "blueberry", "raspberry"], why: ["for the farm stand", "the bees would approve", "for the hives' garden"]},
  elena:   {likes: ["carrot", "pumpkin", "pea", "corn", "apple"], why: ["for the dairy", "a treat for the goats", "for the farm kitchen"]},
  noor:    {likes: ["carrot", "pea", "pumpkin", "egg", "corn"], why: ["for the rescue animals", "for the shelter", "the rabbits deserve a treat"]},
  ada:     {likes: ["tulip", "sunflower", "wildflower", "strawberry", "raspberry"], why: ["for the shop window", "to press for a pattern", "the counter wants cheering up"]},
  idris:   {likes: ["apple", "pear", "egg", "loaf", "fig"], why: ["for my lunch at the bench", "I forget to eat when I'm hemming", "a long day of buttonholes"]}
};
const KINDS = ["food", "ingredient", "flower"];
// in-season garden crops (their seeds are always at Hana's) count as things you can grow, even before your first harvest
function inSeasonCrops(day){
  const s = seasonOf(day);
  return Object.values(ITEMS).filter(it => it.kind === "seed" && it.crop && it.tab === "seeds" && !it.greenhouse && !it.visited && (it.seasons || []).includes(s) && ITEMS[it.crop]).map(it => it.crop);
}
// the things a request may ask for: in-season crops, plus anything you've had in your backpack that's yours to make
// (a sell value, food/ingredient/flower, and not something Hana sells over the counter)
export function canAsk(F, day = dayKey()){
  const seen = Object.keys(board(F).seen).filter(id => { const it = ITEMS[id]; return it && it.sell > 0 && KINDS.includes(it.kind) && !it.tab && it.kind !== "gift"; });
  return [...new Set([...inSeasonCrops(day), ...seen])];
}
// coins for each one: a bit more than selling it at market, never more than a shop's own price for it
export const payEach = id => { const it = ITEMS[id] || {}, s = it.sell || 1, p = Math.max(s + 1, Math.round(s*1.4)); return it.price ? Math.min(p, it.price) : p; };
export const howMany = id => Math.max(1, Math.min(5, Math.ceil(12/((ITEMS[id] || {}).sell || 3))));
const NAMES = {goatmilk: ["bottle of goat's milk", "bottles of goat's milk"], milk: ["bottle of milk", "bottles of milk"], oliveoil: ["bottle of olive oil", "bottles of olive oil"],
  loaf: ["loaf of bread", "loaves of bread"], egg: ["fresh egg", "fresh eggs"], peach: ["peach", "peaches"], cherry: ["cherry", "cherries"]};
export function itemName(id, n){
  if (NAMES[id]) return NAMES[id][n === 1 ? 0 : 1];
  const c = CROPS[id]; if (c) return n === 1 ? c.n.toLowerCase() : (c.ns || c.n.toLowerCase() + "s");
  const nm = ((ITEMS[id] || {}).n || id).replace(/^(A|An) /, "").toLowerCase();   // "A block of beeswax" -> "block of beeswax"
  if (n === 1) return nm;
  const m = /^(\w+) of (.+)$/.exec(nm); if (m) return `${m[1]}s of ${m[2]}`;
  return /s$/.test(nm) ? nm : nm + "s";
}
export const reqLine = r => `${r.n} ${itemName(r.item, r.n)}`;
export const dueLine = (r, day = dayKey()) => r.due === day ? "today" : r.due === addDays(day, 1) ? "tomorrow" : `by ${WEEKDAY[dow(r.due)]}`;

// Notes come down when they're past their day; a new one goes up most days (two on the very first day).
// people: [{id, name}] of who could ask (met villagers, say); -> the requests posted just now
export function refreshRequests(F, people, day = dayKey()){
  const b = board(F);
  b.reqs = b.reqs.filter(r => r.due >= day);
  if (b.lastPost === day) return [];
  const want = b.lastPost ? (hash(day + "req") % 5 === 0 ? 0 : 1) : 2;   // a quiet day now and then
  b.lastPost = day;
  const out = [];
  for (let k = 0; k < want && b.reqs.length < MAX_REQ; k++) { const r = newRequest(F, people, day, k); if (!r) break; b.reqs.push(r); out.push(r); }
  return out;
}
function newRequest(F, people, day, k){
  const b = board(F), pool = canAsk(F, day); if (!pool.length) return null;
  const busy = new Set(b.reqs.map(r => r.who)), who = people.filter(p => ASKERS[p.id] && !busy.has(p.id));
  if (!who.length) return null;
  const p = who[hash(day + ":" + k + ":" + b.reqs.length) % who.length], likes = ASKERS[p.id].likes.filter(id => pool.includes(id));
  const choice = likes.length ? likes : pool, item = choice[hash(p.id + day + k) % Math.min(choice.length, 3)], n = howMany(item);
  return {id: "r" + day.replace(/-/g, "") + k + p.id, who: p.id, name: p.name, item, n, each: payEach(item), posted: day, due: addDays(day, 2 + hash(p.id + day) % 3),
    why: ASKERS[p.id].why[hash(day + p.id) % ASKERS[p.id].why.length]};
}
export const requestFrom = (F, who) => board(F).reqs.find(r => r.who === who) || null;
export const hearts = (F, who) => Math.min(MAX_HEARTS, board(F).hearts[who] || 0);
// Hand a request over: the items leave the backpack, coins and a heart come in. -> {coins, hearts, gift?, letter?} or null
export function handOver(F, who, takeInv, giveInv, day = dayKey()){
  const b = board(F), r = requestFrom(F, who); if (!r || (F.inv[r.item] || 0) < r.n) return null;
  takeInv(r.item, r.n); b.reqs = b.reqs.filter(x => x !== r);
  const before = hearts(F, who); b.hearts[who] = Math.min(MAX_HEARTS, (b.hearts[who] || 0) + 1); const now = hearts(F, who);
  b.story[who] = day;   // their next story chapter is ready today (stories.js)
  b.done = (b.done || 0) + 1;
  const out = {coins: r.n*r.each, hearts: now, r};
  out.giveInv = giveInv; if (now > before) milestone(F, r, now, out, day); delete out.giveInv;
  return out;
}
// Gifts (phase 4): anyone in the village can be given something, once a day each (in person, or sent round). A
// favourite (something they'd ask for, or a gift that suits them) is worth a heart; anything else, half a heart.
// Hearts from gifts bring the same letters as hearts from requests. -> {fav, hearts, half, gift?, letter?} or null
export const giftedToday = (F, who, day = dayKey()) => ((board(F).gifted || {})[who]) === day;
export function giveTo(F, who, name, item, fav, giveInv, day = dayKey()){
  const b = board(F); b.gifted = b.gifted || {}; b.giftPts = b.giftPts || {};
  if (b.gifted[who] === day) return null;
  b.gifted[who] = day;
  const before = hearts(F, who); b.giftPts[who] = (b.giftPts[who] || 0) + (fav ? 2 : 1);
  while (b.giftPts[who] >= 2 && (b.hearts[who] || 0) < MAX_HEARTS) { b.giftPts[who] -= 2; b.hearts[who] = (b.hearts[who] || 0) + 1; }
  const now = hearts(F, who); if (now >= MAX_HEARTS) b.giftPts[who] = 0;
  const out = {fav, hearts: now, half: now < MAX_HEARTS && b.giftPts[who] === 1, giveInv}, r = {who, name, item, n: 1};
  for (let h = before + 1; h <= now; h++) milestone(F, r, h, out, day);
  delete out.giveInv;
  return out;
}
function milestone(F, r, h, out, day){
  if (h === 2) out.letter = letter(F, r, "thanks");
  if (h === 4) { const g = giftFor(F, day); out.giveInv && out.giveInv(g.id, g.n); out.gift = g; out.letter = letter(F, r, "gift", g); }
  if (h === 5) out.letter = letter(F, r, "friends");
}
function giftFor(F, day){ const crops = inSeasonCrops(day), c = crops[hash(day) % Math.max(1, crops.length)] || "tulip"; const seed = Object.keys(ITEMS).find(k => ITEMS[k].crop === c && ITEMS[k].kind === "seed") || "tulip_seed"; return {id: seed, n: 3}; }
const LETTERS = {
  thanks: (r) => ({title: `Thank you, from ${r.name}`, body: `I just wanted to say thank you for the ${itemName(r.item, r.n)}, and for being so kind lately. It made my week. Come and say hello any time.\n\n${r.name}`}),
  gift: (r, g) => ({title: `A little something from ${r.name}`, body: `You've been such a help lately. I've tucked ${g.n} ${(ITEMS[g.id] || {}).n ? ITEMS[g.id].n.toLowerCase() : "seed packets"} in with this note, for your garden.\n\n${r.name}`}),
  friends: (r) => ({title: `${r.name} says: friends for life`, body: `Five hearts' worth of kindness, and every bit of it with a smile. I'm so glad you live in Honeybrook. My door's always open.\n\n${r.name}`})
};
function letter(F, r, kind, g){ const l = Object.assign({id: `vl-${r.who}-${kind}`, from: r.name, at: Date.now()}, LETTERS[kind](r, g)); board(F).letters = [l, ...board(F).letters.filter(x => x.id !== l.id)].slice(0, 40); return l; }
export const villageLetters = F => board(F).letters;
// stories.js: a villager whose request you finished today tells their next chapter today
export const boostedStory = (F, who, day = dayKey()) => !!(F.board && F.board.story && F.board.story[who] === day);
// note what's in the backpack, so requests can ask for things you've made before
export function noteSeen(F){ const s = board(F).seen; for (const [id, n] of Object.entries(F.inv || {})) if (n > 0 && !s[id]) s[id] = true; }

/* ---------- the board's HTML (the quests panel) ---------- */
const heartRow = n => `<span class="hearts" aria-label="${n} of ${MAX_HEARTS} hearts">${Array.from({length: MAX_HEARTS}, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span>`;
export function taskRows(F){
  const list = myTasks(F);
  if (!list.length) return `<li class="empty"><span class="muted">Nothing on your list yet. Add something you'd like to get done today, big or small.</span></li>`;
  return list.map(t => { const dn = isDone(t);
    return `<li class="task${dn ? " done" : ""}"><button class="tick" data-tick="${esc(t.id)}" aria-pressed="${dn}" aria-label="${dn ? "Not done yet" : "Done"}: ${esc(t.title)}"></button><span><b>${esc(t.title)}</b><small>${t.daily ? "daily" : "one-off"}</small></span><button class="drop" data-tdel="${esc(t.id)}" aria-label="Remove ${esc(t.title)}">remove</button></li>`; }).join("");
}
export function requestRows(F, have, where){
  const reqs = board(F).reqs;
  if (!reqs.length) return `<li class="empty"><span class="muted">No requests pinned up right now. Villagers post new ones most mornings.</span></li>`;
  return reqs.map(r => { const got = Math.min(r.n, have(r.item)), w = where(r.who);
    return `<li class="req"><span><b>${esc(r.name)} needs ${esc(reqLine(r))} ${esc(dueLine(r))}</b><small>${esc(r.why[0].toUpperCase() + r.why.slice(1))}. ${r.n*r.each} coins and a heart. You have ${got} of ${r.n}.</small>${heartRow(hearts(F, r.who))}</span>
      ${w ? `<button class="next" data-find="${esc(r.who)}">${got >= r.n ? "hand over" : "find " + esc(r.name)}</button>` : `<span class="hbadge">at home</span>`}</li>`; }).join("");
}
export const payLine = F => { const n = paidToday(F); return n >= PAID_PER_DAY ? `You've had today's ${PAID_PER_DAY} paid ticks. Keep ticking for the joy of it.` : `Each task you tick pays ${TASK_PAY} coins (${PAID_PER_DAY - n} more paid ticks today).`; };
