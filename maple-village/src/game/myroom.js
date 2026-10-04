// Mel's own things: the journal (writing desk in her room) and the scratchpad (the town hall whiteboard).
// Each is its own private doc in the per-user collection ("journal", "scratch"), separate from the game save so
// typing never races the save. A browser copy in localStorage keeps them when the db isn't reachable.
import { esc, plain, dayKey } from "../util.js";

const JKEY = "fox.journal", SKEY = "fox.scratch";
const load = (k, f) => { try { return Object.assign(f(), JSON.parse(localStorage.getItem(k)) || {}); } catch { return f(); } };
let J = load(JKEY, () => ({entries: [], updatedAt: 0})), SC = load(SKEY, () => ({text: "", updatedAt: 0}));
let jref = null, sref = null, onChange = () => {}, jChain = Promise.resolve(), sT = null;
const keepJ = () => { try { localStorage.setItem(JKEY, JSON.stringify(J)); } catch {} };
const keepS = () => { try { localStorage.setItem(SKEY, JSON.stringify(SC)); } catch {} };

// Entries merge by id across devices; a deleted entry stays as a {id, deleted, at} marker so it doesn't come back
// (an undo writes the entry back with a newer `at`).
function mergeJ(a, b){
  const m = new Map();
  [...(a.entries || []), ...((b && b.entries) || [])].forEach(e => { if (!e || !e.id) return; const o = m.get(e.id); if (!o || (e.at || 0) > (o.at || 0)) m.set(e.id, e); });   // newest change wins: a tear-out, or an undo of one
  return {entries: [...m.values()].sort((x, y) => (y.at || 0) - (x.at || 0)).slice(0, 400), updatedAt: Math.max(a.updatedAt || 0, (b && b.updatedAt) || 0)};
}
export function attachMyDocs(col, changed){
  onChange = changed; jref = col.doc("journal"); sref = col.doc("scratch");
  jref.onSnapshot(snap => { if (!snap.exists) { if (J.entries.length) pushJ(); return; } J = mergeJ(J, JSON.parse(JSON.stringify(snap.data() || {}))); keepJ(); onChange("journal"); }, () => {});
  sref.onSnapshot(snap => {
    if (!snap.exists) { if (SC.text) pushS(); return; }
    const r = snap.data() || {};
    if ((r.updatedAt || 0) > (SC.updatedAt || 0)) { SC = {text: String(r.text || "").slice(0, 20000), updatedAt: r.updatedAt}; keepS(); onChange("scratch"); }
  }, () => {});
}
// one write at a time; re-read first so another device's entries are kept
function pushJ(){ if (!jref) return; jChain = jChain.then(async () => { try { const cur = await jref.get(); if (cur.exists) J = mergeJ(J, cur.data() || {}); await jref.set(JSON.parse(JSON.stringify(J))); } catch {} }); }
function pushS(){ if (!sref) return; clearTimeout(sT); sT = setTimeout(() => { sref.set({text: SC.text, updatedAt: SC.updatedAt}).catch(() => {}); }, 900); }

/* ---------- journal ---------- */
const PROMPTS = ["What's one thing that went well today?", "What's taking up space in your head right now?", "Three things you're grateful for.",
  "What would make tomorrow feel lighter?", "Something Evan did that made you smile.", "What did you learn this week?",
  "What are you proud of, even if it's small?", "What do you need more of? Less of?", "Describe today in five words.", "A worry, written down so it can stop circling."];
export const journalPrompt = () => PROMPTS[Math.floor(Date.parse(dayKey() + "T00:00:00Z")/864e5) % PROMPTS.length];
const live = () => J.entries.filter(e => !e.deleted);
let draft = "";
export function addEntry(text, kind){
  text = String(text || "").trim().slice(0, 8000); if (!text) return null;
  const e = {id: "j" + Date.now().toString(36), at: Date.now(), day: dayKey(), text, kind: kind || "page"};
  J = {entries: [e, ...J.entries].slice(0, 400), updatedAt: Date.now()}; keepJ(); pushJ(); return e;
}
function delEntry(id){ J = {entries: J.entries.map(e => e.id === id ? {id, deleted: true, at: Date.now()} : e), updatedAt: Date.now()}; keepJ(); pushJ(); }
const when = e => new Date(e.at).toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Singapore"});
export function journalPanel(decompress){
  const list = live().slice(0, 12);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>My journal</h2>
    <p class="sub">${decompress ? "Three quick points from that call or moment. Then let it go." : esc(journalPrompt())}</p>
    <form id="jForm" class="jform"><label class="sr" for="jText">Journal entry</label><textarea id="jText" rows="6" maxlength="8000" placeholder="${decompress ? "1.\n2.\n3." : "Write anything..."}">${esc(draft)}</textarea>
    <div class="actions"><button class="btn primary small" type="submit">Keep this page</button></div></form>`;
  if (list.length) h += `<p class="eyebrow" style="margin:14px 0 6px">Earlier pages</p><div class="jlist">${list.map(e => `<details><summary><b>${when(e)}</b> ${esc(plain(e.text).split("\n")[0].slice(0, 70))}</summary><p>${esc(e.text).replace(/\n/g, "<br>")}</p><button class="drop" data-jdel="${esc(e.id)}">tear out</button></details>`).join("")}</div>`;
  return h;
}
export function wireJournal(root, undoable, done){
  const ta = root.querySelector("#jText"); if (!ta) return;
  ta.oninput = () => { draft = ta.value; };
  root.querySelector("#jForm").onsubmit = ev => { ev.preventDefault(); const e = addEntry(ta.value); if (e) { draft = ""; done(e); } };
  root.querySelectorAll("[data-jdel]").forEach(b => b.onclick = ev => { ev.preventDefault(); const id = b.dataset.jdel, e = J.entries.find(x => x.id === id); if (!e) return;
    delEntry(id); done(null); undoable("Page torn out", () => { J = {entries: J.entries.map(x => x.id === id ? Object.assign({}, e, {at: Date.now()}) : x), updatedAt: Date.now()}; keepJ(); pushJ(); done(null); }); });
}
export const journalCount = () => live().length;

/* ---------- scratchpad (town hall whiteboard) ---------- */
export function scratchPanel(){
  const ago = SC.updatedAt ? Math.round((Date.now() - SC.updatedAt)/60000) : null;
  return `<span class="tape stripe" aria-hidden="true"></span><h2>Scratchpad</h2><p class="sub">Jot anything down. It saves as you type, and it's only yours.</p>
    <label class="sr" for="scratchText">Scratchpad</label><textarea id="scratchText" class="scratch" rows="12" maxlength="20000" placeholder="Ideas, numbers, a to-do, a thought for later...">${esc(SC.text)}</textarea>
    <div class="actions"><span class="muted" id="scratchSaved">${ago == null ? "" : ago < 1 ? "Saved just now" : `Saved ${ago} min ago`}</span><button class="btn alt small" data-scratch="clear">Wipe the board</button></div>`;
}
export function wireScratch(root, undoable, rerender){
  const ta = root.querySelector("#scratchText"); if (!ta) return;
  const save = () => { SC = {text: ta.value.slice(0, 20000), updatedAt: Date.now()}; keepS(); pushS(); const s = root.querySelector("#scratchSaved"); if (s) s.textContent = "Saved just now"; };
  ta.oninput = save;
  const b = root.querySelector('[data-scratch="clear"]');
  b.onclick = () => { const was = ta.value; if (!was) return; ta.value = ""; save(); undoable("Board wiped", () => { SC = {text: was, updatedAt: Date.now()}; keepS(); pushS(); rerender(); }); };
}
export const scratchText = () => SC.text;
