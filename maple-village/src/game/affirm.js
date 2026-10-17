// The affirmations board (round 227) on the courtyard wall: five affirmations a day from a warm, general list, plus
// any you write yourself (they join the daily rotation). Tap the heart to keep one: "Ones you kept" stays on the
// board until you let it go.
// State: F.affirm = {kept: [text], own: [{id, text, at}]}. Saved with the rest of the game.
import { esc, plain, dayKey, now } from "../util.js";

export const AFFIRMATIONS = [
  "I am allowed to take up space.", "I can do hard things and still be gentle with myself.", "Small steps every day add up.",
  "Rest is part of the work, and I deserve it.", "My ideas are worth sharing.", "I don't have to do it all today. Just the next thing.",
  "Progress, not perfection.", "I trust myself to figure it out.", "My voice matters.", "I'm proud of how far I've come.",
  "Today I choose calm over rush.", "Good things are on their way to me.", "I keep the promises I make to myself.",
  "I am creative, capable and kind.", "I celebrate my wins, even the tiny ones.", "I am learning, and that is enough.",
  "It's okay to ask for help.", "I can let go of what I can't control.", "I am exactly where I need to be today.",
  "My feelings are welcome here.", "I treat myself the way I'd treat a good friend.", "I am worthy of good things.",
  "Every day is a fresh page.", "I bring something good to the people around me.", "I am stronger than I think.",
  "I can begin again, as many times as I need.", "There is enough time for what matters.", "I am growing at my own pace.",
  "I notice the good in today.", "I am kind to my body, and it carries me through."];
export const PER_DAY = 5, MAX_OWN = 60, MAX_KEPT = 40, MAX_LEN = 140;

export function affirmState(F){ const A = F.affirm = (F.affirm && typeof F.affirm === "object") ? F.affirm : {};
  A.kept = Array.isArray(A.kept) ? A.kept : []; A.own = Array.isArray(A.own) ? A.own : []; delete A.day; delete A.items; return A; }
const dayNum = day => Math.floor(Date.parse(day + "T00:00:00Z")/864e5);
// today's five: up to two of your own (taking turns day by day), the rest from the built-in list
export function dailyAffirmations(F, day = dayKey()){
  const A = affirmState(F), n = dayNum(day), own = A.own.map(o => o.text), out = [];
  const mine = Math.min(own.length, 2);
  for (let i = 0; out.length < mine; i++) { const a = own[(n*mine + i) % own.length]; if (!out.includes(a)) out.push(a); else if (i > own.length*2) break; }
  for (let i = 0; out.length < PER_DAY && i < AFFIRMATIONS.length*3; i++) { const a = AFFIRMATIONS[(n*7 + i*3) % AFFIRMATIONS.length]; if (!out.includes(a)) out.push(a); }
  return out;
}
const clean = t => plain(String(t || "")).replace(/\s+/g, " ").trim().slice(0, MAX_LEN);
// keep (or, if it's already kept, let go of) one
export function toggleKeep(F, text){
  const A = affirmState(F); text = clean(text); if (!text) return false;
  if (A.kept.includes(text)) { A.kept = A.kept.filter(x => x !== text); return false; }
  A.kept.unshift(text); A.kept = A.kept.slice(0, MAX_KEPT); return true;
}
export const isKept = (F, text) => affirmState(F).kept.includes(text);
// let a kept one go; returns restore() for Undo
export function unkeep(F, i){
  const A = affirmState(F); if (!(i >= 0 && i < A.kept.length)) return null; const [gone] = A.kept.splice(i, 1);
  return () => { const B = affirmState(F); if (!B.kept.includes(gone)) B.kept.splice(Math.min(i, B.kept.length), 0, gone); };
}
export function addOwn(F, text, at = now()){
  const A = affirmState(F); text = clean(text); if (!text || A.own.length >= MAX_OWN) return null;
  if (A.own.some(o => o.text.toLowerCase() === text.toLowerCase())) return A.own.find(o => o.text.toLowerCase() === text.toLowerCase());
  const o = {id: "a" + at.toString(36) + Math.floor(Math.random()*1e4).toString(36), text, at}; A.own.push(o); return o;
}
// remove one of your own; returns restore() for Undo
export function removeOwn(F, id){
  const A = affirmState(F), i = A.own.findIndex(o => o.id === id); if (i < 0) return null; const [gone] = A.own.splice(i, 1);
  return () => { const B = affirmState(F); if (!B.own.some(o => o.id === gone.id)) B.own.splice(Math.min(i, B.own.length), 0, gone); };
}

/* ---------- the panel ---------- */
export const freshView = () => ({draft: "", adding: false});
export function affirmPanel(F, av, day = dayKey()){
  const A = affirmState(F), list = dailyAffirmations(F, day), own = new Set(A.own.map(o => o.text));
  return `<span class="tape dots" aria-hidden="true"></span><h2>Affirmations</h2><p class="sub">Today's five, fresh every morning. Read one out loud.</p>
    <ul class="taff">${list.map((a, i) => `<li${own.has(a) ? ` class="mine"` : ""}><span>${esc(a)}</span><button class="kdel tkeep${A.kept.includes(a) ? " on" : ""}" data-af="keep" data-i="${i}" aria-pressed="${A.kept.includes(a)}" aria-label="${A.kept.includes(a) ? "Kept. Tap to let it go" : "Keep this one"}">${A.kept.includes(a) ? "♥" : "♡"}</button></li>`).join("")}</ul>
    ${A.kept.length ? `<p class="eyebrow" style="margin-top:14px">Ones you kept</p><ul class="taff kept">${A.kept.map((a, i) => `<li><span>${esc(a)}</span><button class="kdel" data-af="unkeep" data-i="${i}" aria-label="Let this one go">×</button></li>`).join("")}</ul>` : ""}
    <p class="eyebrow" style="margin-top:14px">Your own</p>
    ${A.own.length ? `<ul class="taff own">${A.own.map(o => `<li><span>${esc(o.text)}</span><button class="kdel" data-af="unown" data-id="${esc(o.id)}" aria-label="Remove this one">×</button></li>`).join("")}</ul>` : `<p class="muted">Write your own and they'll take turns on the board with the others.</p>`}
    <form id="afForm" class="row afadd"><label class="sr" for="afText">Your own affirmation</label><input id="afText" maxlength="${MAX_LEN}" placeholder="I am..." value="${esc(av.draft)}" autocomplete="off" enterkeyhint="done"><button class="btn small" type="submit">Add</button></form>`;
}
// api: {rerender, save, undoable, kept(bool)}
export function wireAffirm(root, F, av, api, day = dayKey()){
  const list = dailyAffirmations(F, day), inp = root.querySelector("#afText");
  if (inp) inp.oninput = () => { av.draft = inp.value; };
  const form = root.querySelector("#afForm");
  if (form) form.onsubmit = ev => { ev.preventDefault(); const o = addOwn(F, inp.value); if (!o) { inp.focus(); return; }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); av.draft = ""; api.added(o); api.save(); };
  root.querySelectorAll("[data-af]").forEach(b => b.onclick = () => {
    const k = b.dataset.af;
    if (k === "keep") { const on = toggleKeep(F, list[+b.dataset.i]); api.kept(on); api.save(); }
    else if (k === "unkeep") { const r = unkeep(F, +b.dataset.i); if (r) { api.save(); api.undoable("Affirmation let go", () => { r(); api.save(); }); } }
    else if (k === "unown") { const r = removeOwn(F, b.dataset.id); if (r) { api.save(); api.undoable("Affirmation removed", () => { r(); api.save(); }); } }
  });
}
