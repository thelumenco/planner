// My routines: a noticeboard on the wall of Mel's room. Two kinds of routine:
//   checklist: a list ticked off each day (morning routine), fresh every morning
//   weekly:    one step per weekday (beauty routine), today's step up top
// A private per-user doc ("routines"): lists merge by id (newest change wins, a removed list stays as a marker),
// ticks are kept per day and per item with a timestamp, so two devices never undo each other.
import { esc, plain, dayKey } from "../util.js";

const KEY = "fox.routines";
export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_NAMES = {mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday"};
// Mel's beauty week (from her)
const BEAUTY = {mon: "Pore extraction", tue: "Retinol", wed: "Hair mask", thu: "Nail care", fri: "Pore pad or lactic acid", sat: "Body scrub", sun: "Air shot micro-needling + face mask"};
const uid = p => p + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36);
const seed = () => ({lists: [
  {id: "morning", name: "Morning routine", kind: "checklist", at: 1, items: ["Big glass of water", "Make the bed", "Wash face and skincare", "Get dressed (peek at the wardrobe)", "Vitamins"].map((t, i) => ({id: "m" + i, text: t}))},
  {id: "beauty", name: "Beauty routine", kind: "weekly", at: 1, days: BEAUTY}
], ticks: {}, updatedAt: 0});
const load = () => { try { const r = JSON.parse(localStorage.getItem(KEY)); return r && Array.isArray(r.lists) ? Object.assign({ticks: {}}, r) : seed(); } catch { return seed(); } };
let R = load(), ref = null, chain = Promise.resolve(), onChange = () => {};
const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(R)); } catch {} };
function merge(a, b){
  if (!b) return a;
  const m = new Map(); [...(a.lists || []), ...(b.lists || [])].forEach(l => { if (!l || !l.id) return; const o = m.get(l.id); if (!o || (l.at || 0) > (o.at || 0)) m.set(l.id, l); });
  const ticks = {}, days = [...new Set([...Object.keys(a.ticks || {}), ...Object.keys(b.ticks || {})])].sort().slice(-14);
  days.forEach(d => { const x = (a.ticks || {})[d] || {}, y = (b.ticks || {})[d] || {}; ticks[d] = {};
    new Set([...Object.keys(x), ...Object.keys(y)]).forEach(k => { const p = x[k], q = y[k]; ticks[d][k] = !p ? q : !q ? p : (q.at || 0) > (p.at || 0) ? q : p; }); });
  return {lists: [...m.values()], ticks, updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0), beautyFilled: !!(a.beautyFilled || b.beautyFilled)};
}
export function attachRoutines(col, changed){
  onChange = changed; ref = col.doc("routines");
  ref.onSnapshot(snap => { if (!snap.exists) { push(); return; } R = merge(R, JSON.parse(JSON.stringify(snap.data() || {}))); keep(); fillBeauty(); onChange(); }, () => {});
}
// one time: the board was first seeded with an empty beauty routine; fill in Mel's week (never over her own edits)
function fillBeauty(){
  if (R.beautyFilled) return; const b = R.lists.find(l => l.id === "beauty" && !l.deleted);
  R.beautyFilled = true;
  if (b && b.kind === "weekly" && !Object.keys(b.days || {}).length) { b.days = {...BEAUTY}; b.at = Date.now(); }
  commit();
}
function push(){ if (!ref) return; chain = chain.then(async () => { try { const cur = await ref.get(); if (cur.exists) R = merge(R, JSON.parse(JSON.stringify(cur.data() || {}))); await ref.set(JSON.parse(JSON.stringify(R))); } catch {} }); }
const commit = () => { R.updatedAt = Date.now(); keep(); push(); onChange(); };

export const lists = () => R.lists.filter(l => !l.deleted).sort((a, b) => (a.kind === "checklist" ? 0 : 1) - (b.kind === "checklist" ? 0 : 1) || (a.made || 0) - (b.made || 0));
const listById = id => R.lists.find(l => l.id === id && !l.deleted);
export const todayKey = () => DAYS[(new Date(dayKey() + "T00:00:00Z").getUTCDay() + 6) % 7];
const tickOf = (listId, itemId, day = dayKey()) => { const t = ((R.ticks || {})[day] || {})[listId + ":" + itemId]; return !!(t && t.on); };
function setTick(listId, itemId, on){ const d = dayKey(); R.ticks = R.ticks || {}; R.ticks[d] = R.ticks[d] || {}; R.ticks[d][listId + ":" + itemId] = {on, at: Date.now()}; commit(); }
const touch = l => { l.at = Date.now(); commit(); };
// today's beauty-style step (for Maple's morning mention): [{list, text, done}]
export function todaysSteps(){ const k = todayKey(); return lists().filter(l => l.kind === "weekly" && l.days && l.days[k]).map(l => ({name: l.name, text: l.days[k], done: tickOf(l.id, k)})); }
export const checklistLeft = () => lists().filter(l => l.kind === "checklist").reduce((n, l) => n + l.items.filter(i => !tickOf(l.id, i.id)).length, 0);

// For the weekly review: per routine, which of the given days were kept. Checklists count a day when every item
// was ticked; weekly routines count the days that had a step and it was ticked. -> [{name, kind, days: [true|false|null]}]
// (null: nothing due that day, or the day hasn't come yet)
export function weekRoutines(dayKeys){
  const today = dayKey();
  return lists().map(l => ({name: l.name, kind: l.kind, days: dayKeys.map(d => {
    if (d > today) return null;
    if (l.kind === "checklist") return l.items.length ? l.items.every(i => tickOf(l.id, i.id, d)) : null;
    const k = DAYS[(new Date(d + "T00:00:00Z").getUTCDay() + 6) % 7];
    return l.days && l.days[k] ? tickOf(l.id, k, d) : null; })}));
}
// "Mon: exfoliate" / "Monday - hair mask" / "Tues. sheet mask" lines -> {mon: "...", ...}
export function parseWeek(text){
  const out = {}; String(text || "").split(/\n|;/).forEach(line => {
    const m = /^\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s*[:\-–—.)]?\s*(.+)$/i.exec(line.trim()); if (m && m[2].trim()) out[m[1].toLowerCase()] = plain(m[2]).trim().slice(0, 160); });
  return out;
}
// from chat: {name, kind?, items?:[...], days?:{mon..}} -> makes or replaces the routine with that name
export function setRoutine(a){
  const name = plain(String(a && a.name || "")).trim().slice(0, 40); if (!name) return null;
  const days = a.days && typeof a.days === "object" ? Object.fromEntries(DAYS.filter(d => a.days[d]).map(d => [d, plain(String(a.days[d])).trim().slice(0, 160)])) : null;
  const items = Array.isArray(a.items) ? a.items.map(t => plain(String(t)).trim().slice(0, 120)).filter(Boolean).slice(0, 20) : null;
  const kind = days && Object.keys(days).length ? "weekly" : items && items.length ? "checklist" : (a.kind === "weekly" ? "weekly" : "checklist");
  let l = lists().find(x => x.name.toLowerCase() === name.toLowerCase());
  if (!l) { l = {id: uid("r"), name, kind, made: Date.now(), at: Date.now(), items: [], days: {}}; R.lists.push(l); }
  l.kind = kind; if (kind === "weekly") l.days = Object.assign({}, l.days || {}, days || {}); else if (items) l.items = items.map(t => ({id: uid("i"), text: t}));
  touch(l); return l;
}

/* ---------- the noticeboard panel ---------- */
export const rv = {sel: null, edit: false, paste: ""};
export function routinesPanel(){
  const all = lists(); if (!all.length) rv.sel = null; else if (!all.find(l => l.id === rv.sel)) rv.sel = all[0].id;
  const l = all.find(x => x.id === rv.sel), tk = todayKey();
  let h = `<span class="tape dots" aria-hidden="true"></span><h2>My routines</h2>
    <div class="tabs rtabs" role="tablist">${all.map(x => `<button role="tab" data-rt="sel" data-id="${esc(x.id)}" aria-selected="${x.id === rv.sel}">${esc(x.name)}</button>`).join("")}<button data-rt="new" aria-label="New routine">+ New</button></div>`;
  if (!l) return h + `<p class="sub">No routines yet. Add one with + New.</p>`;
  if (rv.edit) {
    h += `<form id="rtForm" class="rtedit"><label class="muted" for="rtName">Name</label><input id="rtName" maxlength="40" value="${esc(l.name)}">
      <div class="rkind"><label><input type="radio" name="rtKind" value="checklist" ${l.kind === "checklist" ? "checked" : ""}> A checklist, every day</label><label><input type="radio" name="rtKind" value="weekly" ${l.kind === "weekly" ? "checked" : ""}> One step each weekday</label></div>`;
    if (l.kind === "weekly") h += DAYS.map(d => `<label class="rday"><span>${DAY_NAMES[d].slice(0, 3)}</span><input data-day="${d}" maxlength="160" value="${esc((l.days || {})[d] || "")}" placeholder="Nothing on ${DAY_NAMES[d]}"></label>`).join("")
      + `<details class="rpaste"${Object.keys(l.days || {}).length ? "" : " open"}><summary>Paste your whole week</summary><textarea id="rtPaste" rows="5" placeholder="Mon: double cleanse&#10;Tue: hair mask&#10;Wed: exfoliate…">${esc(rv.paste)}</textarea><button type="button" class="btn alt small" data-rt="paste">Fill in the days</button></details>`;
    else h += `<ul class="redit">${l.items.map(i => `<li><input data-item="${esc(i.id)}" maxlength="120" value="${esc(i.text)}"><button type="button" class="kdel" data-rt="delitem" data-id="${esc(i.id)}" aria-label="Remove this step">×</button></li>`).join("")}</ul>
      <div class="row"><label class="sr" for="rtNew">New step</label><input id="rtNew" maxlength="120" placeholder="Add a step" autocomplete="off"><button type="button" class="btn small" data-rt="additem">Add</button></div>`;
    return h + `<div class="actions"><button class="btn primary" type="submit">Done</button><button type="button" class="btn alt small" data-rt="dellist">Remove this routine</button></div></form>`;
  }
  if (l.kind === "weekly") {
    const step = (l.days || {})[tk], done = tickOf(l.id, tk);
    h += step ? `<p class="eyebrow">Today · ${DAY_NAMES[tk]}</p><button class="rtoday${done ? " done" : ""}" data-rt="tickday" aria-pressed="${done}"><span class="rbox${done ? " on" : ""}" aria-hidden="true"></span><span>${esc(step)}</span></button>`
      : `<p class="sub">${Object.keys(l.days || {}).length ? `Nothing on ${DAY_NAMES[tk]}. A rest day.` : "No steps yet. Tap Edit and paste your week in."}</p>`;
    h += `<ul class="rweek">${DAYS.map(d => `<li class="${d === tk ? "now" : ""}"><b>${DAY_NAMES[d].slice(0, 3)}</b><span>${esc((l.days || {})[d] || "—")}</span></li>`).join("")}</ul>`;
  } else {
    const left = l.items.filter(i => !tickOf(l.id, i.id)).length;
    h += `<p class="sub">${l.items.length ? (left ? `${left} to go today.` : "All done today. Lovely start.") : "No steps yet. Tap Edit to add some."} Fresh every morning.</p>
      <ul class="rcheck">${l.items.map(i => { const on = tickOf(l.id, i.id); return `<li class="${on ? "on" : ""}" data-rt="tick" data-id="${esc(i.id)}" role="checkbox" aria-checked="${on}" tabindex="0"><span class="rbox${on ? " on" : ""}" aria-hidden="true"></span><span>${esc(i.text)}</span></li>`; }).join("")}</ul>`;
  }
  return h + `<div class="actions"><button class="btn alt small" data-rt="edit">Edit</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
// api: {rerender, undoable, done(text)}
export function wireRoutines(root, api){
  const l = listById(rv.sel), form = root.querySelector("#rtForm");
  const saveForm = () => { if (!l || !form) return; const n = plain(form.querySelector("#rtName").value).trim(); if (n) l.name = n.slice(0, 40);
    form.querySelectorAll("[data-day]").forEach(i => { const v = plain(i.value).trim().slice(0, 160); l.days = l.days || {}; if (v) l.days[i.dataset.day] = v; else delete l.days[i.dataset.day]; });
    form.querySelectorAll("[data-item]").forEach(i => { const it = l.items.find(x => x.id === i.dataset.item), v = plain(i.value).trim().slice(0, 120); if (it && v) it.text = v; });
    touch(l); };
  if (form) {
    form.onsubmit = ev => { ev.preventDefault(); saveForm(); rv.edit = false; api.rerender(); };
    form.querySelectorAll('[name="rtKind"]').forEach(r => r.onchange = () => { saveForm(); l.kind = r.value; l.items = l.items || []; l.days = l.days || {}; touch(l); api.rerender(); });
    const nw = form.querySelector("#rtNew"); if (nw) nw.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); form.querySelector('[data-rt="additem"]').click(); } };
    const pt = form.querySelector("#rtPaste"); if (pt) pt.oninput = () => { rv.paste = pt.value; };
  }
  root.querySelectorAll("[data-rt]").forEach(b => { const go = () => {
    const k = b.dataset.rt, id = b.dataset.id;
    if (k === "sel") { if (rv.edit) saveForm(); rv.sel = id; rv.edit = false; }
    else if (k === "new") { const n = {id: uid("r"), name: "New routine", kind: "checklist", made: Date.now(), at: Date.now(), items: [], days: {}}; R.lists.push(n); commit(); rv.sel = n.id; rv.edit = true; }
    else if (k === "edit") rv.edit = true;
    else if (k === "tick") { const on = !tickOf(l.id, id); setTick(l.id, id, on); if (on) api.done({list: l.id, item: id, name: l.name, complete: l.items.every(i => tickOf(l.id, i.id))}); }
    else if (k === "tickday") { const tk = todayKey(), on = !tickOf(l.id, tk); setTick(l.id, tk, on); if (on) api.done({list: l.id, item: tk, name: l.name, complete: true, weekly: true}); }
    else if (k === "additem") { saveForm(); const v = plain(root.querySelector("#rtNew").value).trim().slice(0, 120); if (!v) return; l.items.push({id: uid("i"), text: v}); touch(l); }
    else if (k === "delitem") { saveForm(); const idx = l.items.findIndex(x => x.id === id); if (idx < 0) return; const [gone] = l.items.splice(idx, 1); touch(l);
      api.undoable("Step removed", () => { l.items.splice(Math.min(idx, l.items.length), 0, gone); touch(l); api.rerender(); }); }
    else if (k === "paste") { const wk = parseWeek(root.querySelector("#rtPaste").value); if (!Object.keys(wk).length) return; saveForm(); l.days = Object.assign({}, l.days || {}, wk); rv.paste = ""; touch(l); }
    else if (k === "dellist") { const copy = JSON.parse(JSON.stringify(l)); l.deleted = true; touch(l); rv.edit = false; rv.sel = null;
      api.undoable(`Removed “${copy.name}”`, () => { const x = R.lists.find(y => y.id === copy.id); Object.assign(x, copy, {deleted: false, at: Date.now()}); commit(); rv.sel = copy.id; api.rerender(); }); }
    api.rerender(); };
    b.onclick = go; if (b.getAttribute("role") === "checkbox") b.onkeydown = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); go(); } };
  });
}
