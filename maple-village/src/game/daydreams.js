// The daydream jar (round 231, in the treehouse): write down something you'd like to do one day, fold it up and pop it
// in the jar. Take one out at random when you need a nudge; when you've done one, it moves to the Done side with the
// date. Never a quest and never coins: it's just for you.
// State: F.dreams = [{id, text, at, done (ms or 0)}], oldest first. Saved with the rest of the game.
import { esc, plain, now } from "../util.js";

export const MAX_TEXT = 300, MAX_DREAMS = 60;
const uid = () => "d" + now().toString(36) + Math.floor(Math.random()*1e4).toString(36);
const list0 = F => (F.dreams = Array.isArray(F.dreams) ? F.dreams : []);
export const waiting = F => list0(F).filter(d => !d.done);
export const doneOnes = F => list0(F).filter(d => d.done).sort((a, b) => b.done - a.done);
export function addDream(F, text, at = now()){
  text = plain(String(text || "")).trim().slice(0, MAX_TEXT); if (!text || waiting(F).length >= MAX_DREAMS) return null;
  const d = {id: uid(), text, at, done: 0}; list0(F).push(d); return d;
}
// done it -> restore() for Undo
export function markDone(F, id, at = now()){ const d = list0(F).find(x => x.id === id && !x.done); if (!d) return null; d.done = at; return () => { d.done = 0; }; }
// let it go -> restore() for Undo (back where it was)
export function letGo(F, id){
  const L = list0(F), i = L.findIndex(x => x.id === id); if (i < 0) return null; const [gone] = L.splice(i, 1);
  return () => { const M = list0(F); if (!M.some(x => x.id === gone.id)) M.splice(Math.min(i, M.length), 0, gone); };
}
const rand = (list, not) => { const pool = list.length > 1 ? list.filter(d => d.id !== not) : list; return pool[Math.floor(Math.random()*pool.length)]; };

/* ---------- the jar's panel ---------- */
const COLS = ["#FFF3B8", "#FAD4DC", "#D6E8F7", "#DCEFD2", "#F7DCC4", "#E6DAF5"];
const tint = id => { let h = 0; for (const c of String(id)) h = (h*31 + c.charCodeAt(0)) | 0; return COLS[Math.abs(h) % COLS.length]; };
const when = ms => new Date(ms).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});
// a little glass jar with a folded paper for each daydream waiting in it
function jarArt(n){
  const papers = Array.from({length: Math.min(n, 14)}, (_, i) => { const x = 22 + (i*13) % 46, y = 92 - Math.floor(i/4)*12 - (i % 2)*3;
    return `<rect x="${x}" y="${y}" width="14" height="9" rx="2" transform="rotate(${(i*37) % 40 - 20} ${x + 7} ${y + 4})" fill="${COLS[i % COLS.length]}" stroke="rgba(58,46,40,.5)" stroke-width=".8"/>`; }).join("");
  return `<svg class="ddjar" viewBox="0 0 100 112" width="88" height="98" aria-hidden="true"><rect x="30" y="4" width="40" height="10" rx="3" fill="#C9A3E0" stroke="var(--line,#3b3530)" stroke-width="1.4"/>
    <path d="M24 16 h52 q6 0 6 8 v70 q0 12 -12 12 h-40 q-12 0 -12 -12 v-70 q0 -8 6 -8z" fill="#EAF4F7" fill-opacity=".7" stroke="var(--line,#3b3530)" stroke-width="1.4"/>${papers}
    <path d="M28 28 v50" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>`;
}
export const freshView = () => ({mode: "jar", pick: null, draft: ""});
export function dreamsPanel(F, dv){
  const w = waiting(F), d = doneOnes(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The daydream jar</h2>`;
  if (dv.mode === "add") return h + `<p class="sub">Something you'd like to do one day. Big or small: learn the cello, see the northern lights, finally fix that drawer.</p>
    <form id="ddForm"><label class="sr" for="ddText">Your daydream</label><textarea id="ddText" class="jnote" rows="3" maxlength="${MAX_TEXT}" placeholder="One day, I'd like to...">${esc(dv.draft)}</textarea>
    <div class="actions"><button class="btn primary" type="submit">Fold it up and pop it in</button><button class="btn alt small" type="button" data-dd="jar">Back to the jar</button></div></form>`;
  if (dv.mode === "read") {
    const e = w.find(x => x.id === dv.pick) || w[0];
    if (!e) { dv.mode = "jar"; return dreamsPanel(F, dv); }
    return h + `<div class="kread" style="background:${tint(e.id)}"><p class="ktext">${esc(e.text)}</p><p class="kwho">In the jar since ${esc(when(e.at))}</p></div>
      <div class="actions"><button class="btn primary" data-dd="done" data-id="${esc(e.id)}">I've done it!</button>${w.length > 1 ? `<button class="btn alt" data-dd="another">Another one</button>` : ""}<button class="btn alt small" data-dd="jar">Back in the jar</button></div>`;
  }
  h += `<div class="ddtop">${jarArt(w.length)}<p class="sub">${w.length ? `${w.length} daydream${w.length === 1 ? "" : "s"} folded up in the jar.` : "The jar's empty. What would you like to do, one day?"}${d.length ? ` ${d.length} done already.` : ""}</p></div>
    <div class="actions"><button class="btn primary" data-dd="add">Add a daydream</button>${w.length ? `<button class="btn alt" data-dd="random">Take one out</button>` : ""}</div>`;
  if (w.length) h += `<p class="sulabel">In the jar</p><ul class="ddlist">${w.slice().reverse().map(e => `<li style="background:${tint(e.id)}"><span>${esc(e.text)}</span>
      <span class="ddbtns"><button class="btn small" data-dd="done" data-id="${esc(e.id)}">Done it</button><button class="ttx" data-dd="go" data-id="${esc(e.id)}">let it go</button></span></li>`).join("")}</ul>`;
  if (d.length) h += `<p class="sulabel">Done</p><ul class="ddlist done">${d.map(e => `<li><span>${esc(e.text)}</span><small>${esc(when(e.done))}</small></li>`).join("")}</ul>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// api: {rerender, save, undoable, added(d), did(d)}
export function wireDreams(root, F, dv, api){
  const t = root.querySelector("#ddText");
  if (t) { t.oninput = () => { dv.draft = t.value; }; if (!dv.draft) setTimeout(() => t.focus(), 60); }
  const form = root.querySelector("#ddForm");
  if (form) form.onsubmit = ev => { ev.preventDefault(); const d = addDream(F, t.value); if (!d) { t.focus(); return; }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    dv.draft = ""; dv.mode = "jar"; api.added(d); api.save(); };
  root.querySelectorAll("[data-dd]").forEach(b => b.onclick = ev => { ev.stopPropagation();
    const k = b.dataset.dd, w = waiting(F);
    if (k === "add") dv.mode = "add";
    else if (k === "jar") dv.mode = "jar";
    else if (k === "random" || k === "another") { const e = rand(w, dv.pick); dv.pick = e && e.id; dv.mode = "read"; }
    else if (k === "done") { const d = w.find(x => x.id === b.dataset.id), r = markDone(F, b.dataset.id); if (r) { dv.mode = "jar"; api.save(); api.did(d); api.undoable("Marked done", () => { r(); api.save(); api.rerender(); }); } }
    else if (k === "go") { const r = letGo(F, b.dataset.id); if (r) { api.save(); api.undoable("Daydream let go", () => { r(); api.save(); api.rerender(); }); } }
    api.rerender();
  });
}
