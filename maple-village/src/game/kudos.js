// Kind words (round 227): the corkboard on the courtyard wall, where you pin up the nice things people have said to
// you, to reread whenever you need a lift. Never a quest spot: it's just for you.
// State: F.kudos = [{id, text, from, at}], newest last. Saved with the rest of the game.
import { esc, plain, now } from "../util.js";

export const MAX_TEXT = 500, MAX_FROM = 60;
const uid = () => "k" + now().toString(36) + Math.floor(Math.random()*1e4).toString(36);
const list0 = F => (F.kudos = Array.isArray(F.kudos) ? F.kudos : []);
// newest first
export const kudosList = F => list0(F).slice().sort((a, b) => (b.at || 0) - (a.at || 0));
export const kudosCount = F => list0(F).length;
export function addKudos(F, text, from, at = now()){
  text = plain(String(text || "")).trim().slice(0, MAX_TEXT); if (!text) return null;
  const e = {id: uid(), text, from: plain(String(from || "")).trim().slice(0, MAX_FROM), at};
  list0(F).push(e); return e;
}
// take one down; returns restore() for Undo (it goes back where it was)
export function removeKudos(F, id){
  const L = list0(F), i = L.findIndex(e => e.id === id); if (i < 0) return null;
  const [gone] = L.splice(i, 1);
  return () => { const M = list0(F); if (!M.some(e => e.id === gone.id)) M.splice(Math.min(i, M.length), 0, gone); };
}

/* ---------- the board's panel ---------- */
const COLS = ["#FFF3B8", "#FAD4DC", "#D6E8F7", "#DCEFD2", "#F7DCC4", "#E6DAF5"];
const tilt = id => { let h = 0; for (const c of String(id)) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const when = ms => new Date(ms).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});
export const freshView = () => ({mode: "board", pick: null, draft: "", from: ""});
export function kudosPanel(F, kv){
  const list = kudosList(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Kind words</h2>`;
  if (kv.mode === "add") return h + `<p class="sub">Pin up something lovely someone said to you. Copy it in word for word if you can.</p>
    <form id="kForm"><label class="sr" for="kText">What they said</label><textarea id="kText" class="jnote" rows="4" maxlength="${MAX_TEXT}" placeholder="What did they say?">${esc(kv.draft)}</textarea>
    <label class="sr" for="kFrom">Who said it</label><input id="kFrom" class="kfrom" maxlength="${MAX_FROM}" placeholder="Who said it (optional)" value="${esc(kv.from)}" autocomplete="off">
    <div class="actions"><button class="btn primary" type="submit">Pin it up</button><button class="btn alt small" type="button" data-kd="board">Back to the board</button></div></form>`;
  if (kv.mode === "read") {
    const e = list.find(x => x.id === kv.pick) || list[0];
    if (!e) { kv.mode = "board"; return kudosPanel(F, kv); }
    return h + `<div class="kread" style="background:${COLS[tilt(e.id) % COLS.length]}"><p class="ktext">“${esc(e.text)}”</p><p class="kwho">${e.from ? "From " + esc(e.from) + ", " : ""}${esc(when(e.at))}</p></div>
      <div class="actions">${list.length > 1 ? `<button class="btn primary" data-kd="another">Another one</button>` : ""}<button class="btn alt small" data-kd="board">See them all</button></div>`;
  }
  h += `<p class="sub">${list.length ? `${list.length} kind word${list.length === 1 ? "" : "s"}, pinned up for whenever you need them.` : "Nothing pinned up yet. When someone says something lovely to you, pin it here."}</p>
    <div class="actions"><button class="btn primary" data-kd="add">Pin up something kind</button>${list.length ? `<button class="btn alt" data-kd="random">Read me one</button>` : ""}</div>`;
  if (list.length) h += `<div class="kboard">${list.map(e => `<figure class="knote" style="background:${COLS[tilt(e.id) % COLS.length]};transform:rotate(${(tilt(e.id) % 7) - 3}deg)"><button class="kopen" data-kd="open" data-id="${esc(e.id)}" aria-label="Read this one"><blockquote>${esc(e.text.length > 160 ? e.text.slice(0, 157) + "..." : e.text)}</blockquote>${e.from ? `<figcaption>${esc(e.from)}</figcaption>` : ""}</button><button class="kdel" data-kd="del" data-id="${esc(e.id)}" aria-label="Take this one down">×</button></figure>`).join("")}</div>`;
  return h;
}
const rand = (list, not) => { const pool = list.length > 1 ? list.filter(e => e.id !== not) : list; return pool[Math.floor(Math.random()*pool.length)]; };
// api: {rerender, save, undoable, done(entry)}
export function wireKudos(root, F, kv, api){
  const t = root.querySelector("#kText"), f = root.querySelector("#kFrom");
  if (t) { t.oninput = () => { kv.draft = t.value; }; if (!kv.draft) setTimeout(() => t.focus(), 60); }
  if (f) f.oninput = () => { kv.from = f.value; };
  const form = root.querySelector("#kForm");
  if (form) form.onsubmit = ev => { ev.preventDefault(); const e = addKudos(F, t.value, f.value); if (!e) { t.focus(); return; }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    kv.draft = ""; kv.from = ""; kv.mode = "board"; api.done(e); api.save(); };
  root.querySelectorAll("[data-kd]").forEach(b => b.onclick = () => {
    const k = b.dataset.kd, list = kudosList(F);
    if (k === "add") kv.mode = "add";
    else if (k === "board") kv.mode = "board";
    else if (k === "random" || k === "another") { const e = rand(list, kv.pick); kv.pick = e && e.id; kv.mode = "read"; }
    else if (k === "open") { kv.pick = b.dataset.id; kv.mode = "read"; }
    else if (k === "del") { const r = removeKudos(F, b.dataset.id); if (r) { api.save(); api.undoable("Kind words taken down", () => { r(); api.save(); }); } return; }
    api.rerender();
  });
}
