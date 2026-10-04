// Hestia at home: Mel's household app, rebuilt inside the village. Not quests: when the house shows a hearth badge,
// walk home and open the cleaning cupboard (chores: daily, weekly, this week's zone, plus a tidy timer that deals
// tasks one at a time) or the fridge (pantry stock and the shopping list).
// Same data shape as Hestia (mise) so a Hestia export imports straight in. Stored in the per-user "hestia" doc.
import { esc, $, dayKey } from "../util.js";
import { icon } from "../art/icons.js";

const DEFAULT_ZONES = [
  {id: 1, name: "Living Room & Balcony", icon: "living", tasks: [
    {text: "Wipe TV console and surfaces", effort: 1}, {text: "Vacuum/mop floor", effort: 2}, {text: "Clean window grilles", effort: 3},
    {text: "Dust ceiling fan", effort: 2}, {text: "Wipe down sofa", effort: 2}, {text: "Tidy balcony plants", effort: 1}, {text: "Clean balcony floor", effort: 2}]},
  {id: 2, name: "Kitchen", icon: "kitchen", tasks: [
    {text: "Deep clean stove & hood", effort: 3}, {text: "Wipe down cabinets", effort: 2}, {text: "Clean inside fridge", effort: 3},
    {text: "Scrub sink thoroughly", effort: 2}, {text: "Wipe appliances", effort: 1}, {text: "Clean floor & drain", effort: 2}, {text: "Organize dry goods", effort: 1}]},
  {id: 3, name: "Master Bedroom", icon: "master", tasks: [
    {text: "Change bed linens", effort: 2}, {text: "Vacuum mattress", effort: 2}, {text: "Clean wardrobe surfaces", effort: 1},
    {text: "Wipe window sills", effort: 1}, {text: "Dust bedside tables", effort: 1}, {text: "Organize dresser", effort: 2}, {text: "Mop floor under bed", effort: 3}]},
  {id: 4, name: "Common Bedroom", icon: "bedroom", tasks: [
    {text: "Change bed linens", effort: 2}, {text: "Vacuum under furniture", effort: 2}, {text: "Wipe desk & shelves", effort: 1},
    {text: "Organize storage", effort: 2}, {text: "Clean window grilles", effort: 2}, {text: "Dust surfaces", effort: 1}, {text: "Mop floor", effort: 2}]},
  {id: 5, name: "Bathrooms", icon: "bathroom", tasks: [
    {text: "Scrub toilet bowl", effort: 2}, {text: "Clean shower area", effort: 2}, {text: "Wipe mirror & basin", effort: 1},
    {text: "Descale taps & showerhead", effort: 3}, {text: "Clean floor & drain", effort: 2}, {text: "Wash bathroom mats", effort: 2}, {text: "Wipe cabinet surfaces", effort: 1}]}
];
const DEFAULT_DAILY = [
  {id: "d1", text: "Clear dining table", effort: 1, timeOfDay: null}, {id: "d2", text: "Wipe dining table", effort: 1, timeOfDay: "evening"},
  {id: "d3", text: "Wipe high chair", effort: 1, timeOfDay: "evening"}, {id: "d4", text: "Pick up toys", effort: 2, timeOfDay: "evening"},
  {id: "d5", text: "Prep bag for next day", effort: 2, timeOfDay: "evening"}, {id: "d6", text: "Load laundry", effort: 1, timeOfDay: "morning"}];
const DEFAULT_WEEKLY = [
  {id: "w1", text: "Change bed linens", effort: 2}, {id: "w2", text: "Clean mirrors", effort: 1}, {id: "w3", text: "Vacuum floors", effort: 2},
  {id: "w4", text: "Mop floors", effort: 2}, {id: "w5", text: "Empty all trash bins", effort: 1}];
const DEFAULT_CATS = [{id: "food", name: "Food"}, {id: "household", name: "Household"}, {id: "personal", name: "Personal Care"}];
const DEFAULT_LOCS = [{id: "supermarket", name: "Supermarket"}, {id: "online", name: "Online"}, {id: "wetmarket", name: "Wet Market"}, {id: "pharmacy", name: "Pharmacy"}];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KEY = "fox.hestia";

const fresh = () => ({zones: DEFAULT_ZONES, dailyTasks: DEFAULT_DAILY, weeklyTasks: DEFAULT_WEEKLY, currentZoneIndex: 0, weekStartDate: null,
  dailyLog: {}, weeklyLog: {}, zoneLog: {}, lastWeekKey: null, streak: 0, lastActiveDate: null, cleaningMinutes: {}, paid: {},
  pantryItems: [], shoppingList: [], pantryCategories: DEFAULT_CATS, whereToBuyLocations: DEFAULT_LOCS, timerMinutes: 20, chimeEnabled: true, chimeInterval: 5});
let H = (() => { try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch { return fresh(); } })();
let api = null, ref = null, pushT = null, view = {tab: "daily", fridge: "stock", loc: "all"}, focus = null;
let timer = null;   // {endAt, total, pausedLeft, lastMin}

export function initHestia(a){ api = a; tidy(); setInterval(tick, 1000); }
export function attachHestiaDb(docRef){
  ref = docRef;
  ref.onSnapshot(snap => {
    if (!snap.exists) { save(); return; }
    const remote = snap.data() || {};
    if ((remote.updatedAt || 0) > (H.updatedAt || 0)) { H = Object.assign(fresh(), remote); tidy(); local(); api.changed(); }
    else if ((remote.updatedAt || 0) < (H.updatedAt || 0)) save();
  }, () => {});
}
const local = () => { try { localStorage.setItem(KEY, JSON.stringify(H)); } catch {} };
function save(){ H.updatedAt = Date.now(); local(); if (!ref) return; clearTimeout(pushT); pushT = setTimeout(() => { ref.set(JSON.parse(JSON.stringify(H))).catch(() => {}); }, 500); }

/* ---------- dates: daily by village day, weekly by the Sunday-start week, zones by the Monday-start week ---------- */
const today = () => dayKey();
const dow = () => new Date(today() + "T00:00:00Z").getUTCDay();
const shift = (k, d) => new Date(Date.parse(k + "T00:00:00Z") + d*864e5).toISOString().slice(0, 10);
const weekKey = () => shift(today(), -dow());
const mondayKey = () => shift(today(), -((dow() + 6) % 7));
function tidy(){
  if (!Array.isArray(H.zones) || !H.zones.length) H.zones = DEFAULT_ZONES;
  if (!H.pantryCategories || !H.pantryCategories.length) H.pantryCategories = DEFAULT_CATS;
  if (!H.whereToBuyLocations || !H.whereToBuyLocations.length) H.whereToBuyLocations = DEFAULT_LOCS;
  ["dailyLog", "weeklyLog", "zoneLog", "cleaningMinutes", "paid"].forEach(k => { if (!H[k] || typeof H[k] !== "object") H[k] = {}; });
  if (H.lastWeekKey !== weekKey()) { H.weeklyLog = {}; H.lastWeekKey = weekKey(); }
  if (!H.weekStartDate) H.weekStartDate = mondayKey();
  H.currentZoneIndex = Math.min(H.currentZoneIndex || 0, H.zones.length - 1);
  Object.keys(H.dailyLog).sort().slice(0, -45).forEach(k => delete H.dailyLog[k]);
  Object.keys(H.paid).filter(k => !k.startsWith(today()) && !k.startsWith("w" + weekKey())).forEach(k => delete H.paid[k]);
}
const zone = () => H.zones[H.currentZoneIndex] || H.zones[0];
const dayDone = id => !!((H.dailyLog[today()] || {}).daily || {})[id];
const weekDone = id => !!(H.weeklyLog[weekKey()] || {})[id];
const zoneDone = i => !!H.zoneLog[`z${H.currentZoneIndex}_${i}`];

// What the house badge counts: today's daily chores, weekly ones set for today, and the shopping list.
export function hestiaCounts(){
  tidy();
  const daily = (H.dailyTasks || []).filter(t => !dayDone(t.id)).length;
  const weeklyToday = (H.weeklyTasks || []).filter(t => t.weekday === dow() && !weekDone(t.id)).length;
  const shop = (H.shoppingList || []).filter(s => !s.purchased).length;
  return {chores: daily + weeklyToday, shop, zoneLeft: (zone().tasks || []).filter((_, i) => !zoneDone(i)).length};
}

/* ---------- ticking chores off ---------- */
function setDone(kind, id, on){
  if (kind === "daily") { const d = H.dailyLog[today()] = H.dailyLog[today()] || {daily: {}, zone: {}}; d.daily[id] = on; }
  else if (kind === "weekly") { const w = H.weeklyLog[weekKey()] = H.weeklyLog[weekKey()] || {}; w[id] = on ? today() : false; }
  else H.zoneLog[`z${H.currentZoneIndex}_${id}`] = on;
  const pk = (kind === "weekly" ? "w" + weekKey() : kind === "zone" ? "w" + weekKey() + "z" + H.currentZoneIndex : today()) + ":" + kind + ":" + id;
  if (!on && H.paid[pk]) { delete H.paid[pk]; api.refund(1, "chore unticked"); }   // ticked by mistake: the coin goes back
  if (on) {
    if (!H.paid[pk]) { H.paid[pk] = 1; api.earn(1, "home chore"); }
    if (H.lastActiveDate !== today()) { H.streak = H.lastActiveDate === shift(today(), -1) ? (H.streak || 0) + 1 : 1; H.lastActiveDate = today(); api.speak(`Home streak: ${H.streak} day${H.streak > 1 ? "s" : ""}. The house feels lighter.`, 4000); }
    api.sfx("chime");
  }
  save(); api.changed();
}

/* ---------- the tidy timer (Hestia's focus mode: 10, 20 or 30 minutes, a soft bowl every few minutes) ---------- */
const left = () => !timer ? 0 : timer.pausedLeft != null ? timer.pausedLeft : Math.max(0, timer.endAt - Date.now());
const mmss = ms => `${Math.floor(ms/60000)}:${String(Math.floor(ms/1000) % 60).padStart(2, "0")}`;
function startTimer(min){ H.timerMinutes = min; timer = {endAt: Date.now() + min*60000, total: min*60000, pausedLeft: null, lastMin: min}; api.speak(`${min} minutes of tidying. Go gently.`, 3500); save(); api.changed(); }
function tick(){
  if (!timer || timer.pausedLeft != null) return;
  const l = left(), m = Math.ceil(l/60000);
  if (m < timer.lastMin) {           // a minute of tidying done
    timer.lastMin = m; H.cleaningMinutes[today()] = (H.cleaningMinutes[today()] || 0) + 1; save();
    const elapsed = Math.round((timer.total - l)/60000);
    if (H.chimeEnabled && l > 0 && elapsed % (H.chimeInterval || 5) === 0) api.sfx("bowl");
  }
  document.querySelectorAll("[data-htleft]").forEach(e => e.textContent = mmss(l));
  if (!l) { timer = null; api.alarm(); api.speak("Time's up! Amazing work. Put the cloth down.", 5000); api.changed(); }
}
function dealCards(){
  const cards = [];
  (H.dailyTasks || []).forEach(t => { if (!dayDone(t.id)) cards.push({kind: "daily", id: t.id, text: t.text, group: "Daily"}); });
  (H.weeklyTasks || []).forEach(t => { if (!weekDone(t.id)) cards.push({kind: "weekly", id: t.id, text: t.text, group: "Weekly"}); });
  (zone().tasks || []).forEach((t, i) => { if (!zoneDone(i)) cards.push({kind: "zone", id: i, text: t.text, group: zone().name}); });
  return cards;
}

/* ---------- panels ---------- */
const effort = n => `<span class="heff" title="${["", "Low", "Medium", "High"][n || 1]} effort">${"●".repeat(n || 1)}<i>${"●".repeat(3 - (n || 1))}</i></span>`;
function row(kind, id, t, done, badge){
  return `<li class="${done ? "done" : ""}"><label><input type="checkbox" data-hdone="${kind}:${id}" ${done ? "checked" : ""}><span>${esc(t.text)}</span></label>${badge || ""}${effort(t.effort)}${kind !== "zone" ? `<button class="hx" data-hdel="${kind}:${id}" aria-label="Remove this chore">✕</button>` : ""}</li>`;
}
function timerBlock(){
  if (!timer) return `<div class="htimer"><span>${icon("clock", 18)} Tidy timer</span>${[10, 20, 30].map(m => `<button class="btn small ${m === H.timerMinutes ? "primary" : "alt"}" data-htimer="${m}">${m} min</button>`).join("")}</div>`;
  return `<div class="htimer on"><b data-htleft>${mmss(left())}</b><small>${timer.pausedLeft != null ? "paused" : "time to tidy"}</small>
    <button class="tbtn" data-htctl="${timer.pausedLeft != null ? "play" : "pause"}" aria-label="${timer.pausedLeft != null ? "Resume" : "Pause"}">${icon(timer.pausedLeft != null ? "play" : "pause", 18)}</button>
    <button class="tbtn" data-htctl="stop" aria-label="Stop the timer">${icon("reset", 18)}</button></div>`;
}
export function hestiaPanel(which){
  tidy();
  if (which === "fridge") return fridgePanel();
  if (focus) return focusPanel();
  const tabs = [["daily", "Daily"], ["weekly", "Weekly"], ["zone", "This week's zone"]];
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The cleaning cupboard</h2>
    <p class="sub">Hestia's chores. ${H.streak ? `Home streak: ${H.streak} day${H.streak > 1 ? "s" : ""}. ` : ""}${H.cleaningMinutes[today()] ? `${H.cleaningMinutes[today()]} minutes tidied today.` : "A little every day keeps the house kind to you."}</p>
    ${timerBlock()}<div class="actions"><button class="btn small yes" data-hfocus="1">One at a time</button></div>
    <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" data-htab="${k}" aria-selected="${view.tab === k}">${n}</button>`).join("")}</div><ul class="hlist">`;
  if (view.tab === "daily") {
    const order = t => (dayDone(t.id) ? 10 : 0) + (t.timeOfDay === "morning" ? 0 : t.timeOfDay === "evening" ? 2 : 1);
    h += [...(H.dailyTasks || [])].sort((a, b) => order(a) - order(b)).map(t => row("daily", t.id, t, dayDone(t.id), t.timeOfDay ? `<span class="hbadge">${t.timeOfDay}</span>` : "")).join("");
  } else if (view.tab === "weekly") {
    const order = t => (weekDone(t.id) ? 10 : 0) + (t.weekday === dow() ? 0 : 1);
    h += [...(H.weeklyTasks || [])].sort((a, b) => order(a) - order(b)).map(t => row("weekly", t.id, t, weekDone(t.id), t.weekday != null ? `<span class="hbadge${t.weekday === dow() ? " now" : ""}">${t.weekday === dow() ? "today" : DAYS[t.weekday]}</span>` : "")).join("");
  } else {
    const z = zone(), n = (z.tasks || []).length, d = (z.tasks || []).filter((_, i) => zoneDone(i)).length;
    h += `<li class="hzone"><b>${esc(z.name)}</b> <small>week ${H.currentZoneIndex + 1} of ${H.zones.length} · ${d}/${n} done</small></li>`
      + (z.tasks || []).map((t, i) => row("zone", i, t, zoneDone(i))).join("");
  }
  h += `</ul>${view.tab !== "zone" ? `<form class="row hadd" data-hadd="${view.tab}"><input name="t" maxlength="80" placeholder="add a ${view.tab} chore"><button class="btn small alt">Add</button></form>`
    : `<div class="actions"><button class="btn small alt" data-hnextzone="1">Move on to ${esc(H.zones[(H.currentZoneIndex + 1) % H.zones.length].name)}</button></div>`}`;
  return h;
}
function focusPanel(){
  const c = focus.cards[focus.i];
  if (!c) { focus = null; return `<span class="tape gingham" aria-hidden="true"></span><h2>All done</h2><p class="sub">Every chore on today's list is ticked or skipped. That's the house sorted.</p>${timerBlock()}<div class="actions"><button class="btn small alt" data-hback="1">Back to the cupboard</button></div>`; }
  return `<span class="tape gingham" aria-hidden="true"></span><p class="eyebrow">${esc(c.group)} · ${focus.i + 1} of ${focus.cards.length}</p><h2 class="hcard">${esc(c.text)}</h2>
    ${timerBlock()}<div class="actions"><button class="btn yes" data-hcard="done">Done</button><button class="btn alt" data-hcard="skip">Skip</button><button class="btn alt small" data-hback="1">Exit</button></div>`;
}
function fridgePanel(){
  const cats = H.pantryCategories, locs = H.whereToBuyLocations, items = H.pantryItems || [];
  const shop = (H.shoppingList || []).filter(s => !s.purchased).map(s => items.find(i => i.id === s.id)).filter(Boolean);
  const locName = id => (locs.find(l => l.id === id) || {}).name || "";
  const wh = it => (Array.isArray(it.whereToBuy) ? it.whereToBuy : it.whereToBuy ? [it.whereToBuy] : []);
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The fridge</h2>
    <div class="tabs" role="tablist"><button role="tab" data-hfr="stock" aria-selected="${view.fridge === "stock"}">What we have</button><button role="tab" data-hfr="shop" aria-selected="${view.fridge === "shop"}">Shopping list${shop.length ? ` (${shop.length})` : ""}</button></div>`;
  if (view.fridge === "stock") {
    h += items.length ? cats.map(c => { const list = items.filter(i => i.category === c.id); if (!list.length) return "";
      return `<p class="eyebrow">${esc(c.name)} · ${list.filter(i => i.inStock).length}/${list.length}</p><ul class="hlist">${list.map(i => `<li class="${i.inStock ? "" : "out"}"><label><input type="checkbox" data-hstock="${i.id}" ${i.inStock ? "checked" : ""}><span>${esc(i.name)}${i.notes ? ` <small>${esc(i.notes)}</small>` : ""}</span></label>${i.inStock ? "" : `<span class="hbadge now">to buy</span>`}<button class="hx" data-hitemdel="${i.id}" aria-label="Remove ${esc(i.name)}">✕</button></li>`).join("")}</ul>`; }).join("")
      : `<p class="muted">The fridge is empty. Add what you keep at home, or import your Hestia lists in Settings.</p>`;
    h += `<p class="muted">Untick something when it runs out: it goes on the shopping list.</p>`;
  } else {
    const shown = view.loc === "all" ? shop : shop.filter(i => wh(i).includes(view.loc));
    h += `<div class="row"><select data-hloc>${[["all", "Everywhere"], ...locs.map(l => [l.id, l.name])].map(([v, n]) => `<option value="${v}" ${view.loc === v ? "selected" : ""}>${esc(n)}</option>`).join("")}</select><button class="btn small alt" data-hcopy="1">Copy list</button></div>`;
    h += shown.length ? `<ul class="hlist">${shown.map(i => `<li><label><input type="checkbox" data-hbuy="${i.id}"><span>${esc(i.name)} <small>${esc(wh(i).map(locName).join(", "))}</small></span></label></li>`).join("")}</ul>`
      : `<p class="muted">Nothing to buy${view.loc === "all" ? "" : " there"}. Untick things in "What we have" when they run out.</p>`;
  }
  h += `<form class="row hadd" data-hitem="${view.fridge}"><input name="t" maxlength="60" placeholder="${view.fridge === "shop" ? "add to the shopping list" : "add something we keep"}">
    <select name="c">${cats.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>
    <select name="w">${locs.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join("")}</select><button class="btn small alt">Add</button></form>`;
  return h;
}

export function wireHestia(root, which){
  const on = (sel, ev, fn) => root.querySelectorAll(sel).forEach(el => el.addEventListener(ev, e => { e.stopPropagation(); fn(el, e); }));
  on("[data-htab]", "click", el => { view.tab = el.dataset.htab; api.changed(); });
  on("[data-hdone]", "change", el => { const [k, id] = el.dataset.hdone.split(":"); setDone(k, k === "zone" ? +id : id, el.checked); });
  on("[data-hdel]", "click", el => { const [k, id] = el.dataset.hdel.split(":"); const key = k === "daily" ? "dailyTasks" : "weeklyTasks"; H[key] = H[key].filter(t => t.id !== id); save(); api.changed(); });
  on("form[data-hadd]", "submit", (el, e) => { e.preventDefault(); const v = el.t.value.trim(); if (!v) return; const k = el.dataset.hadd;
    (k === "daily" ? H.dailyTasks : H.weeklyTasks).push(k === "daily" ? {id: "d" + Date.now(), text: v, effort: 1, timeOfDay: null} : {id: "w" + Date.now(), text: v, effort: 1, weekday: null}); save(); api.changed(); });
  on("[data-hnextzone]", "click", () => { H.currentZoneIndex = (H.currentZoneIndex + 1) % H.zones.length; H.zoneLog = {}; H.weekStartDate = mondayKey(); api.speak(`This week's zone: ${zone().name}.`, 3500); save(); api.changed(); });
  on("[data-htimer]", "click", el => startTimer(+el.dataset.htimer));
  on("[data-htctl]", "click", el => { const k = el.dataset.htctl;
    if (k === "pause" && timer) timer.pausedLeft = left(); else if (k === "play" && timer) { timer.endAt = Date.now() + timer.pausedLeft; timer.pausedLeft = null; } else timer = null; api.changed(); });
  on("[data-hfocus]", "click", () => { focus = {cards: dealCards(), i: 0}; if (!timer) startTimer(H.timerMinutes || 20); api.changed(); });
  on("[data-hcard]", "click", el => { const c = focus && focus.cards[focus.i]; if (!c) return; if (el.dataset.hcard === "done") setDone(c.kind, c.id, true); focus.i++; api.changed(); });
  on("[data-hback]", "click", () => { focus = null; api.changed(); });
  // fridge
  on("[data-hfr]", "click", el => { view.fridge = el.dataset.hfr; api.changed(); });
  on("[data-hstock]", "change", el => { const it = H.pantryItems.find(i => String(i.id) === el.dataset.hstock); if (!it) return; it.inStock = el.checked;
    H.shoppingList = (H.shoppingList || []).filter(s => s.id !== it.id); if (!it.inStock) { H.shoppingList.push({id: it.id, purchased: false}); api.flash(`${it.name} is on the shopping list`); } save(); api.changed(); });
  on("[data-hitemdel]", "click", el => { const id = el.dataset.hitemdel; H.pantryItems = H.pantryItems.filter(i => String(i.id) !== id); H.shoppingList = (H.shoppingList || []).filter(s => String(s.id) !== id); save(); api.changed(); });
  on("[data-hbuy]", "change", el => { const it = H.pantryItems.find(i => String(i.id) === el.dataset.hbuy); if (!it) return; it.inStock = true; H.shoppingList = H.shoppingList.filter(s => s.id !== it.id); api.sfx("coin"); api.flash(`Got ${it.name.toLowerCase()}!`); save(); api.changed(); });
  on("[data-hloc]", "change", el => { view.loc = el.value; api.changed(); });
  on("[data-hcopy]", "click", () => { const shop = (H.shoppingList || []).map(s => H.pantryItems.find(i => i.id === s.id)).filter(Boolean).filter(i => view.loc === "all" || (Array.isArray(i.whereToBuy) ? i.whereToBuy : [i.whereToBuy]).includes(view.loc));
    const text = "Shopping list\n" + shop.map(i => "- " + i.name).join("\n"); try { navigator.clipboard.writeText(text).then(() => api.flash("Shopping list copied")); } catch { api.flash("Couldn't copy here"); } });
  on("form[data-hitem]", "submit", (el, e) => { e.preventDefault(); const v = el.t.value.trim(); if (!v) return; const toShop = el.dataset.hitem === "shop";
    const it = {id: Date.now(), name: v, category: el.c.value, whereToBuy: [el.w.value], notes: "", inStock: !toShop}; H.pantryItems.push(it); if (toShop) H.shoppingList.push({id: it.id, purchased: false}); save(); api.changed(); });
}

// A Hestia export (Settings > Export in Hestia) is its whole state object.
export function importHestia(text){
  let d; try { d = JSON.parse(text); } catch { return "That file isn't a Hestia export (not JSON)."; }
  if (d && d.state && d.state.zones) d = d.state;
  if (!d || !Array.isArray(d.zones) || !Array.isArray(d.dailyTasks)) return "That doesn't look like a Hestia export (no zones or daily tasks).";
  const keep = ["zones", "dailyTasks", "weeklyTasks", "currentZoneIndex", "weekStartDate", "dailyLog", "weeklyLog", "zoneLog", "lastWeekKey", "streak", "lastActiveDate",
    "cleaningMinutes", "pantryItems", "shoppingList", "pantryCategories", "whereToBuyLocations", "timerMinutes", "chimeEnabled", "chimeInterval"];
  keep.forEach(k => { if (d[k] != null) H[k] = d[k]; });
  tidy(); save(); api.changed();
  return `Imported: ${H.dailyTasks.length} daily, ${(H.weeklyTasks || []).length} weekly, ${H.zones.length} zones, ${(H.pantryItems || []).length} pantry items.`;
}
export const hestiaTimerOn = () => !!timer;
