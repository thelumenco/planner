// Letters, written at the writing desk in Mel's room:
//   Dear Universe: a pen pal Mel never sees, who always writes back (warm, loving, everything is working out for
//     her). Replies are written by Claude and arrive in her letterbox a little later, like real post.
//   Dear future me: sealed until the date she picks, then delivered to the letterbox.
// Any letter can be copied into her journal. Private per-user doc "letters", merged by id (newest edit wins).
import { esc, plain, dayKey } from "../util.js";

const KEY = "fox.letters";
const load = () => { try { return Object.assign({items: [], updatedAt: 0}, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { return {items: [], updatedAt: 0}; } };
let L = load(), ref = null, chain = Promise.resolve(), onChange = () => {};
const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(L)); } catch {} };
function merge(a, b){
  const m = new Map(); [...(a.items || []), ...((b && b.items) || [])].forEach(e => { if (!e || !e.id) return; const o = m.get(e.id); if (!o || (e.u || 0) > (o.u || 0)) m.set(e.id, e); });
  return {items: [...m.values()].sort((x, y) => x.at - y.at).slice(-300), updatedAt: Math.max(a.updatedAt || 0, (b && b.updatedAt) || 0)};
}
export function attachLetters(col, changed){
  onChange = changed; ref = col.doc("letters");
  ref.onSnapshot(snap => { if (!snap.exists) { if (L.items.length) push(); return; } L = merge(L, JSON.parse(JSON.stringify(snap.data() || {}))); keep(); onChange(); }, () => {});
}
function push(){ if (!ref) return; chain = chain.then(async () => { try { const cur = await ref.get(); if (cur.exists) L = merge(L, JSON.parse(JSON.stringify(cur.data() || {}))); await ref.set(JSON.parse(JSON.stringify(L))); } catch {} }); }
const commit = () => { L.updatedAt = Date.now(); keep(); push(); onChange(); };
const touch = e => { e.u = Date.now(); commit(); };

const universe = () => L.items.filter(e => e.kind === "universe");
const future = () => L.items.filter(e => e.kind === "future");
// letters that have arrived and haven't been opened: universe replies past their time, future letters on/after their day
export const arrived = () => [...universe().filter(e => e.reply && e.reply.due <= Date.now() && !e.reply.read), ...future().filter(e => e.deliver <= dayKey() && !e.read)];
// mark newly arrived letters as announced; returns them (Maple says so)
export function announce(){ const out = arrived().filter(e => !(e.kind === "universe" ? e.reply.told : e.told)); out.forEach(e => { if (e.kind === "universe") e.reply.told = true; else e.told = true; e.u = Date.now(); }); if (out.length) commit(); return out; }

// the universe writes back. sample: the page's sample(); runs for any letter still waiting on a reply
const UNIVERSE = `You are the Universe, writing back to Mel, your pen pal. You are never seen, but you always write back. You are warm, encouraging and loving, and you always tell her that anything is possible. When she is afraid or worried, you tell her she is in the right place at the right time, and that you are removing obstacles, preventing disasters and opening doors for her, even when it doesn't look like it. Things are always working out for her. Answer what she actually wrote, specifically and tenderly, in 120 to 200 words. Begin "Dear Mel," and sign off "Always, the Universe". Plain letter prose: no emoji, no headings, no lists. Never mention being an AI.`;
let replying = false;
export async function writeReplies(sample){
  if (replying || !sample) return; const waiting = universe().filter(e => !e.reply); if (!waiting.length) return;
  replying = true;
  for (const e of waiting) {
    const before = universe().filter(x => x.at < e.at && x.reply).slice(-3).map(x => `Mel wrote: ${x.text.slice(0, 600)}\nYou replied: ${x.reply.text.slice(0, 600)}`).join("\n\n");
    try {
      const r = await sample(`${UNIVERSE}${before ? `\n\nYour letters so far (most recent last):\n${before}` : ""}\n\nHer new letter:\n${e.text}`, {modelTier: "default", cache: false});
      const text = plain(String((r && r.text) || "")).trim();
      if (text) { e.reply = {text: text.slice(0, 3000), due: Date.now() + (15 + Math.random()*30)*60e3}; touch(e); }
    } catch (err) { if (err && err.code === "not_granted") break; }
  }
  replying = false;
}

/* ---------- the letters panel ---------- */
export const lv = {mode: "home", id: null, draft: "", date: ""};
const longDate = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"});
const shortWhen = ms => new Date(ms).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore"});
const inMonths = n => { const d = new Date(dayKey() + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); };
const tomorrow = () => new Date(Date.parse(dayKey() + "T00:00:00Z") + 864e5).toISOString().slice(0, 10);
const para = t => esc(t).split(/\n+/).map(p => `<p>${p}</p>`).join("");
export function lettersPanel(canReply){
  let h = `<span class="tape sky" aria-hidden="true"></span>`;
  if (lv.mode === "universe") return h + `<h2>Dear Universe,</h2><p class="sub">Write whatever's on your heart. The universe always writes back${canReply ? "" : " (once Claude is reachable from this view)"}.</p>
    <label class="sr" for="ltText">Your letter</label><textarea id="ltText" class="jnote lpaper" rows="8" maxlength="4000" placeholder="Dear Universe,">${esc(lv.draft)}</textarea>
    <div class="actions"><button class="btn primary" data-lt="senduni">Post it</button><button class="btn alt small" data-lt="home">Back</button></div>`;
  if (lv.mode === "future") return h + `<h2>Dear future me,</h2><p class="sub">Sealed until the day you choose, then it comes to your letterbox.</p>
    <label class="sr" for="ltText">Your letter</label><textarea id="ltText" class="jnote lpaper" rows="8" maxlength="4000" placeholder="Dear future me,">${esc(lv.draft)}</textarea>
    <div class="row ldate"><label for="ltDate">Deliver on</label><input id="ltDate" type="date" min="${tomorrow()}" value="${esc(lv.date || inMonths(3))}"></div>
    <div class="actions"><button class="btn primary" data-lt="sendfut">Seal it</button><button class="btn alt small" data-lt="home">Back</button></div>`;
  if (lv.mode === "read") {
    const e = L.items.find(x => x.id === lv.id); if (!e) { lv.mode = "home"; return lettersPanel(canReply); }
    if (e.kind === "universe") { const r = e.reply && e.reply.due <= Date.now() ? e.reply : null;
      return h + `<h2>Your letter, ${esc(shortWhen(e.at))}</h2><div class="lletter mine">${para(e.text)}</div>
        ${r ? `<p class="eyebrow">The universe wrote back</p><div class="lletter uni">${para(r.text)}</div>` : `<p class="muted">On its way. The universe takes its time, but it always writes back.</p>`}
        <div class="actions">${r ? `<button class="btn primary small" data-lt="universe">Write back</button>` : ""}<button class="btn alt small" data-lt="journal" data-id="${esc(e.id)}" ${e.journaled ? "disabled" : ""}>${e.journaled ? "In your journal" : "Save to my journal"}</button><button class="btn alt small" data-lt="home">Back</button></div>`; }
    const open = e.deliver <= dayKey();
    return h + `<h2>${open ? `From you, ${esc(shortWhen(e.at))}` : "A sealed letter"}</h2>${open ? `<div class="lletter mine">${para(e.text)}</div>` : `<p class="muted">Sealed until ${esc(longDate(e.deliver))}. No peeking.</p>`}
      <div class="actions">${open ? `<button class="btn alt small" data-lt="journal" data-id="${esc(e.id)}" ${e.journaled ? "disabled" : ""}>${e.journaled ? "In your journal" : "Save to my journal"}</button>` : ""}<button class="btn alt small" data-lt="home">Back</button></div>`;
  }
  const u = universe(), f = future(), now = Date.now(), news = arrived();
  h += `<h2>Letters</h2><p class="sub">Write to the universe, or to the you of later on.</p>
    <div class="vmenu"><button class="btn primary" data-lt="universe">Dear Universe…</button><button class="btn alt" data-lt="future">Dear future me…</button></div>`;
  if (news.length) h += `<p class="eyebrow" style="margin-top:14px">Arrived</p><ul class="hlist lnew">${news.map(e => `<li data-lt="open" data-id="${esc(e.id)}" role="button" tabindex="0"><span><b>${e.kind === "universe" ? "A letter from the universe" : "A letter from your past self"}</b><small>${e.kind === "universe" ? "in reply to " + esc(shortWhen(e.at)) : "written " + esc(shortWhen(e.at))}</small></span><span class="hbadge now">new</span></li>`).join("")}</ul>`;
  if (u.length) h += `<p class="eyebrow" style="margin-top:14px">Pen pals with the universe</p><ul class="hlist">${u.slice().reverse().slice(0, 12).map(e => `<li data-lt="open" data-id="${esc(e.id)}" role="button" tabindex="0"><span><b>${esc(e.text.split("\n")[0].slice(0, 60))}</b><small>${esc(shortWhen(e.at))} · ${e.reply && e.reply.due <= now ? "answered" : "on its way"}</small></span></li>`).join("")}</ul>`;
  if (f.length) h += `<p class="eyebrow" style="margin-top:14px">To future me</p><ul class="hlist">${f.slice().reverse().map(e => `<li data-lt="open" data-id="${esc(e.id)}" role="button" tabindex="0"><span><b>${e.deliver <= dayKey() ? esc(e.text.split("\n")[0].slice(0, 60)) : "Sealed"}</b><small>written ${esc(shortWhen(e.at))} · ${e.deliver <= dayKey() ? "arrived " : "arrives "}${esc(longDate(e.deliver))}</small></span></li>`).join("")}</ul>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// api: {rerender, toJournal(text) -> bool, sent(kind), sample}
export function wireLetters(root, api){
  const ta = root.querySelector("#ltText"), dt = root.querySelector("#ltDate");
  if (ta) { ta.oninput = () => { lv.draft = ta.value; }; setTimeout(() => ta.focus(), 60); }
  if (dt) dt.onchange = () => { lv.date = dt.value; };
  root.querySelectorAll("[data-lt]").forEach(b => { const go = () => {
    const k = b.dataset.lt, id = b.dataset.id;
    if (k === "home") lv.mode = "home";
    else if (k === "universe" || k === "future") { lv.mode = k; lv.draft = ""; }
    else if (k === "open") { lv.mode = "read"; lv.id = id; const e = L.items.find(x => x.id === id);
      if (e && e.kind === "universe" && e.reply && e.reply.due <= Date.now() && !e.reply.read) { e.reply.read = true; touch(e); }
      if (e && e.kind === "future" && e.deliver <= dayKey() && !e.read) { e.read = true; touch(e); } }
    else if (k === "senduni") { const text = plain(lv.draft).trim(); if (!text) { if (ta) ta.focus(); return; }
      const e = {id: "l" + Date.now().toString(36), kind: "universe", text: text.slice(0, 4000), at: Date.now(), u: Date.now()}; L.items.push(e); commit();
      lv.draft = ""; lv.mode = "home"; api.sent("universe"); writeReplies(api.sample); }
    else if (k === "sendfut") { const text = plain(lv.draft).trim(), d = (dt && dt.value) || inMonths(3); if (!text) { if (ta) ta.focus(); return; }
      const e = {id: "l" + Date.now().toString(36), kind: "future", text: text.slice(0, 4000), at: Date.now(), deliver: d < tomorrow() ? tomorrow() : d, u: Date.now()}; L.items.push(e); commit();
      lv.draft = ""; lv.date = ""; lv.mode = "home"; api.sent("future", e.deliver); }
    else if (k === "journal") { const e = L.items.find(x => x.id === id); if (!e || e.journaled) return;
      const text = e.kind === "universe" ? `Dear Universe,\n\n${e.text}${e.reply && e.reply.due <= Date.now() ? `\n\n— The universe wrote back —\n\n${e.reply.text}` : ""}` : `A letter to future me (written ${shortWhen(e.at)})\n\n${e.text}`;
      if (api.toJournal(text)) { e.journaled = true; touch(e); } }
    api.rerender(); };
    b.onclick = go; if (b.getAttribute("role") === "button") b.onkeydown = ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); } };
  });
}
