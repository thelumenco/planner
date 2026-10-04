// Kind words: the corkboard on the town hall's back wall, where Mel pins compliments people have given her, to
// reread when she needs a lift. A private doc ("kudos") in her per-user collection, merged by id across devices
// like the journal (a removed note stays as a marker so it doesn't come back; Undo writes it back newer).
import { esc, plain } from "../util.js";

const KEY = "fox.kudos";
const load = () => { try { return Object.assign({items: [], updatedAt: 0}, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { return {items: [], updatedAt: 0}; } };
let K = load(), ref = null, chain = Promise.resolve(), onChange = () => {};
const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(K)); } catch {} };
function merge(a, b){
  const m = new Map();
  [...(a.items || []), ...((b && b.items) || [])].forEach(e => { if (!e || !e.id) return; const o = m.get(e.id); if (!o || (e.at || 0) > (o.at || 0)) m.set(e.id, e); });
  return {items: [...m.values()].slice(-500), updatedAt: Math.max(a.updatedAt || 0, (b && b.updatedAt) || 0)};
}
export function attachKudos(col, changed){
  onChange = changed; ref = col.doc("kudos");
  ref.onSnapshot(snap => { if (!snap.exists) { if (K.items.length) push(); return; } K = merge(K, JSON.parse(JSON.stringify(snap.data() || {}))); keep(); onChange(); }, () => {});
}
function push(){ if (!ref) return; chain = chain.then(async () => { try { const cur = await ref.get(); if (cur.exists) K = merge(K, JSON.parse(JSON.stringify(cur.data() || {}))); await ref.set(JSON.parse(JSON.stringify(K))); } catch {} }); }
const commit = () => { K.updatedAt = Date.now(); keep(); push(); onChange(); };

export const kudos = () => K.items.filter(e => !e.deleted).sort((a, b) => (b.made || b.at || 0) - (a.made || a.at || 0));
export const kudosCount = () => kudos().length;
export function addKudos(text, from){
  text = plain(String(text || "")).trim().slice(0, 500); if (!text) return null;
  const e = {id: "k" + Date.now().toString(36) + Math.floor(Math.random()*1e3), text, from: plain(String(from || "")).trim().slice(0, 60), at: Date.now(), made: Date.now()};
  K.items.push(e); commit(); return e;
}
// remove one; returns restore() for Undo
export function removeKudos(id){
  const e = K.items.find(x => x.id === id && !x.deleted); if (!e) return null;
  const copy = {...e}; K.items = K.items.filter(x => x.id !== id); K.items.push({id, deleted: true, at: Date.now()}); commit();
  return () => { K.items = K.items.filter(x => x.id !== id); K.items.push({...copy, at: Date.now()}); commit(); };
}

/* ---------- the board's panel ---------- */
const COLS = ["#FFF3B8", "#FAD4DC", "#D6E8F7", "#DCEFD2", "#F7DCC4", "#E6DAF5"];
const tilt = id => { let h = 0; for (const c of id) h = (h*31 + c.charCodeAt(0)) | 0; return h; };
const when = ms => new Date(ms).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore"});
export const kv = {mode: "board", pick: null, draft: "", from: ""};
export function kudosPanel(){
  const list = kudos();
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Kind words</h2>`;
  if (kv.mode === "add") return h + `<p class="sub">Pin up something nice someone said. Copy it in word for word if you can.</p>
    <form id="kForm"><label class="sr" for="kText">The compliment</label><textarea id="kText" class="jnote" rows="4" maxlength="500" placeholder="What did they say?">${esc(kv.draft)}</textarea>
    <label class="sr" for="kFrom">Who said it</label><input id="kFrom" class="kfrom" maxlength="60" placeholder="Who said it (optional)" value="${esc(kv.from)}" autocomplete="off">
    <div class="actions"><button class="btn primary" type="submit">Pin it up</button><button class="btn alt small" type="button" data-kd="board">Back to the board</button></div></form>`;
  if (kv.mode === "read") {
    const e = list.find(x => x.id === kv.pick) || list[0];
    if (!e) { kv.mode = "board"; return kudosPanel(); }
    return h + `<div class="kread" style="background:${COLS[Math.abs(tilt(e.id)) % COLS.length]}"><p class="ktext">“${esc(e.text)}”</p><p class="kwho">${e.from ? "— " + esc(e.from) + ", " : ""}${esc(when(e.made || e.at))}</p></div>
      <div class="actions">${list.length > 1 ? `<button class="btn primary" data-kd="another">Another one</button>` : ""}<button class="btn alt small" data-kd="board">See them all</button></div>`;
  }
  h += `<p class="sub">${list.length ? `${list.length} kind word${list.length === 1 ? "" : "s"}, pinned up for whenever you need them.` : "Nothing pinned yet. When someone says something lovely, pin it here."}</p>
    <div class="actions"><button class="btn primary" data-kd="add">Pin up a compliment</button>${list.length ? `<button class="btn alt" data-kd="random">Read me one</button>` : ""}</div>`;
  if (list.length) h += `<div class="kboard">${list.map(e => `<figure class="knote" style="background:${COLS[Math.abs(tilt(e.id)) % COLS.length]};transform:rotate(${(Math.abs(tilt(e.id)) % 7) - 3}deg)"><button class="kopen" data-kd="open" data-id="${esc(e.id)}" aria-label="Read this one"><blockquote>${esc(e.text.length > 160 ? e.text.slice(0, 157) + "…" : e.text)}</blockquote>${e.from ? `<figcaption>${esc(e.from)}</figcaption>` : ""}</button><button class="kdel" data-kd="del" data-id="${esc(e.id)}" aria-label="Take this one down">×</button></figure>`).join("")}</div>`;
  return h;
}
const rand = (list, not) => { const pool = list.length > 1 ? list.filter(e => e.id !== not) : list; return pool[Math.floor(Math.random()*pool.length)]; };
// api: {rerender, undoable, done(entry)}
export function wireKudos(root, api){
  const t = root.querySelector("#kText"), f = root.querySelector("#kFrom");
  if (t) { t.oninput = () => { kv.draft = t.value; }; if (!kv.draft) setTimeout(() => t.focus(), 60); }
  if (f) f.oninput = () => { kv.from = f.value; };
  const form = root.querySelector("#kForm");
  if (form) form.onsubmit = ev => { ev.preventDefault(); const e = addKudos(t.value, f.value); if (!e) { t.focus(); return; } kv.draft = ""; kv.from = ""; kv.mode = "board"; api.done(e); api.rerender(); };
  root.querySelectorAll("[data-kd]").forEach(b => b.onclick = () => {
    const k = b.dataset.kd, list = kudos();
    if (k === "add") kv.mode = "add";
    else if (k === "board") kv.mode = "board";
    else if (k === "random" || k === "another") { const e = rand(list, kv.pick); kv.pick = e && e.id; kv.mode = "read"; }
    else if (k === "open") { kv.pick = b.dataset.id; kv.mode = "read"; }
    else if (k === "del") { const r = removeKudos(b.dataset.id); if (r) api.undoable("Compliment taken down", () => { r(); api.rerender(); }); }
    api.rerender();
  });
}
