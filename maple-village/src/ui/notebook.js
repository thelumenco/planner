// "Do task" notebook overlay: a big washi-taped notebook page with the quest's notes, progress buttons that drive the
// quest, an email block for inbox quests, and "talk to the note" via the sample capability. Also shows agent mail.
import { $, esc, plain } from "../util.js";
import { icon, progressBar } from "../art/icons.js";
import { sfx } from "../game/audio.js";

let api = null;        // from core: task(), S(), F(), fs(t), act(kind, t), timerLeft(), sayNow(), sample(), placeLabel(t), markRead(item), agentName(from)
let open = null;       // {kind:"task", id} | {kind:"mail", item} | {kind:"digest", item} | {kind:"tracker", which}
const chats = {};      // task id -> [{role, content}]  (memory only)
let busy = null;       // AbortController while Claude is answering
let lastFocus = null;

export function initNotebook(a){
  api = a;
  const root = $("notebook");
  root.addEventListener("click", ev => {
    if (ev.target === root) return closeNotebook();
    const b = ev.target.closest("[data-nb]"); if (!b) return;
    const k = b.dataset.nb;
    if (k === "close") return closeNotebook();
    if (k === "ask") return ask();
    if (k === "copy") return copyDraft(b);
    if (k === "sayb") return api.sayButton(+b.dataset.i);
    if (k === "pond") { const it = open && open.item; closeNotebook(); api.windDown(it); return; }
    if (open && open.kind !== "task" && k === "thanks") { closeNotebook(); return; }
    if (open && open.kind === "tracker") return trackerAct(k, b);
    const t = api.task(); if (!t || !open || open.kind !== "task") return;
    api.act(k, t);
  });
  root.addEventListener("keydown", ev => {
    if (ev.key === "Escape") closeNotebook();
    if (ev.key === "Enter" && ev.target.id === "nbAsk" && !ev.shiftKey) { ev.preventDefault(); ask(); }
    if (ev.key === "Enter" && ev.target.id === "nbTrack") { ev.preventDefault(); trackerAct(open.which === "water" ? "wset" : "sset"); }
    if (ev.key === "Tab") trap(ev);
  });
}
export const notebookOpen = () => !!open;

export function openTask(t){ open = {kind: "task", id: t.id}; show(); }
export function openMail(item){ open = {kind: "mail", item}; api.markRead(item); show(); }
export function openDigest(item){ open = {kind: "digest", item}; show(); }
export function openTracker(which){ open = {kind: "tracker", which}; show(); setTimeout(() => $("nbTrack") && $("nbTrack").focus(), 50); }
export function closeNotebook(){
  if (!open) return;
  open = null; busy && busy.abort(); busy = null; sfx("paper");
  const root = $("notebook"); root.hidden = true; document.body.classList.remove("nb-open");
  api.onClose && api.onClose();
  lastFocus && lastFocus.focus && lastFocus.focus();
}
function show(){
  const root = $("notebook");
  if (root.hidden) { lastFocus = document.activeElement; sfx("paper"); }
  root.hidden = false; document.body.classList.add("nb-open");
  refreshNotebook(true);
}

// Called by core on every render; keeps the page in sync with quest state. Closes itself if the quest moved on.
export function refreshNotebook(focus){
  if (!open) return;
  const page = $("nbPage");
  if (open.kind === "task") {
    const t = api.task();
    if (!t || t.id !== open.id) { closeNotebook(); return; }
    const keep = $("nbAsk") ? $("nbAsk").value : "", typing = document.activeElement && document.activeElement.id === "nbAsk";
    page.innerHTML = taskPage(t);
    if ($("nbAsk")) { $("nbAsk").value = keep; if (typing) $("nbAsk").focus(); }
  } else page.innerHTML = open.kind === "tracker" ? trackerPage(open.which) : open.kind === "digest" ? digestPage(open.item) : mailPage(open.item);
  page.className = "nbpage" + (open.kind === "mail" && open.item.from === "crier" ? " news" : open.kind === "tracker" ? " mini" : "");
  const log = page.querySelector(".nbchat"); if (log) log.scrollTop = log.scrollHeight;
  if (focus) (page.querySelector("[data-nb]:not([data-nb=close])") || page.querySelector("[data-nb]"))?.focus({preventScroll: true});
}

/* ---------- pages ---------- */
const linkify = s => esc(s).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, u => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u.replace(/^https?:\/\//, "").slice(0, 48)}${u.length > 56 ? "…" : ""} ↗</a>`);
function notesHTML(text){
  const lines = String(text || "").split(/\r?\n/);
  let out = "", list = false;
  for (const ln of lines) {
    const m = ln.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/);
    if (m) { if (!list) { out += "<ul>"; list = true; } out += `<li>${linkify(m[1])}</li>`; continue; }
    if (list) { out += "</ul>"; list = false; }
    if (ln.trim()) out += `<p>${linkify(ln)}</p>`;
  }
  return out + (list ? "</ul>" : "");
}

function taskPage(t){
  const S = api.S(), fs = api.fs(t), left = api.timerLeft(t), say = api.sayNow();
  const tread = api.onTread(t);
  const em = t.email || null;
  let h = `<button class="nbx" data-nb="close" aria-label="Close notebook">✕</button>
    <p class="nbmeta">${esc(api.placeLabel(t))}${t.at ? ` · at ${esc(t.at)}` : ""}</p>
    <h2 id="nbTitle">${esc(t.title)}</h2>`;
  if (left != null) h += `<p class="nbtimer"><span data-tleft>${left}</span> <small>${S.timer && S.timer.pausedLeft != null ? "paused" : tread ? "walking at 1.2" : "left on the time box"}</small>${api.timerBtns ? api.timerBtns() : ""}</p>`;
  h += `<div class="nbbody">`;
  h += `<p class="nbfirst"><span class="hl">First step:</span> ${esc(t.firstStep || "open whatever you need for it. Just open it.")}${fs ? " <b>✓</b>" : ""}</p>`;
  if (t.notes) h += `<div class="nbnotes">${notesHTML(t.notes)}</div>`;
  else h += `<p class="nbnone">No notes from Sunsama on this one. Ask chat to add some, or talk it through below.</p>`;
  if (em) {
    h += `<div class="nbmail"><p class="nblbl">Email</p>
      ${em.who ? `<p><b>To / from:</b> ${esc(em.who)}</p>` : ""}${em.subject ? `<p><b>Subject:</b> ${esc(em.subject)}</p>` : ""}
      ${em.draft ? `<p class="nblbl">Draft from chat</p><pre class="nbdraft" id="nbDraft">${esc(em.draft)}</pre>` : ""}
      <div class="nbrow"><a class="btn primary small" href="${esc(safeUrl(em.link) || "https://mail.google.com/mail/u/0/#inbox")}" target="_blank" rel="noopener noreferrer">Open in Gmail ↗</a>
      ${em.draft ? `<button class="btn alt small" data-nb="copy">Copy draft</button>` : ""}</div>
      <p class="nbhint">Sending stays with you in Gmail. Tell chat if you'd like the draft changed.</p></div>`;
  }
  if (t.pep) h += `<p class="nbpep">♡ ${esc(t.pep)}</p>`;
  if (say && say.line) h += `<div class="nbsay"><p>${icon("fox", 22)} ${esc(plain(say.line))}</p>${say.buttons ? `<div class="nbrow">${say.buttons.map((b, i) => `<button class="btn alt small" data-nb="sayb" data-i="${i}">${esc(b[0])}</button>`).join("")}</div>` : ""}</div>`;
  const chat = chats[t.id] || [];
  if (api.sample() !== null || chat.length) {
    h += `<div class="nbtalk"><p class="nblbl">Talk to the note</p>
      ${chat.length ? `<div class="nbchat" aria-live="polite">${chat.map(m => `<p class="${m.role}">${m.role === "user" ? "" : icon("fox", 18) + " "}${esc(m.content)}</p>`).join("")}</div>` : ""}
      ${api.sample() ? `<div class="nbrow nbask"><label class="sr" for="nbAsk">Ask about this quest</label><input id="nbAsk" placeholder="${chat.length ? "reply…" : "stuck? ask anything about this quest"}" autocomplete="off" ${busy ? "disabled" : ""}>
      <button class="btn small" data-nb="ask" ${busy ? "disabled" : ""}>${busy ? "…" : "Ask"}</button></div>` : `<p class="nbhint">Talking to the note isn't available here.</p>`}</div>`;
  }
  h += `</div><div class="nbactions">
    ${!fs ? `<button class="btn primary" data-nb="started">Started</button>` : `<button class="btn alt" data-nb="halfway">Halfway</button>`}
    <button class="btn alt" data-nb="stuck">Stuck</button>
    ${fs ? `<button class="btn alt" data-nb="more">Need more time</button>` : ""}
    ${t.treadmill && !tread ? `<button class="btn alt" data-nb="treadmill">${icon("walker", 18)} Do it on the treadmill</button>` : ""}
    ${fs ? `<button class="btn yes" data-nb="done">Done</button>` : ""}
  </div>`;
  return h;
}

// Optional `sections: [{heading, lines:[...]}]` on a note renders as headed lists. Notes from the town crier
// (the morning briefing) get a little village-newspaper masthead.
const sectionsHTML = secs => (Array.isArray(secs) ? secs : []).filter(x => x && (x.heading || (x.lines || []).length)).map(x =>
  `<section class="nbsec">${x.heading ? `<h3>${esc(x.heading)}</h3>` : ""}<ul>${(x.lines || []).map(l => `<li>${linkify(l)}</li>`).join("")}</ul></section>`).join("");
const timeOf = at => at ? new Date(at).toLocaleTimeString("en-GB", {hour: "numeric", minute: "2-digit", timeZone: "Asia/Singapore"}) : "";
function mailPage(item){
  if (item.from === "crier") return newsPage(item);
  return `<button class="nbx" data-nb="close" aria-label="Close note">✕</button>
    <p class="nbmeta">a note from ${esc(api.agentName(item.from))}${item.at ? ` · ${timeOf(item.at)}` : ""}</p>
    <h2 id="nbTitle">${esc(item.title || "A note for you")}</h2>
    <div class="nbbody">${item.body ? `<div class="nbnotes">${notesHTML(item.body)}</div>` : ""}${sectionsHTML(item.sections)}
    ${safeUrl(item.link) ? `<div class="nbrow"><a class="btn primary small" href="${esc(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer">Open the full thing ↗</a></div>` : ""}</div>
    <div class="nbactions">${(item.pond = item.pond || item.from === "winddown") ? `<button class="btn primary" data-nb="pond">Walk to the pond</button>` : ""}<button class="btn ${item.pond ? "alt" : "yes"}" data-nb="thanks">${item.pond ? "Later" : "Thanks!"}</button></div>`;
}
// The morning briefing, printed as the village newspaper. The first section is the front-page story.
function newsPage(item){
  const d = new Date(item.at || Date.now());
  const sg = new Date(d.getTime() + 8*3600e3);
  const no = Math.floor((sg - Date.UTC(sg.getUTCFullYear(), 0, 0)) / 864e5);
  const date = d.toLocaleDateString("en-GB", {weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Singapore"});
  const secs = (Array.isArray(item.sections) ? item.sections : []).filter(x => x && (x.heading || (x.lines || []).length));
  const lead = secs[0], rest = secs.slice(1);
  const story = x => `<section class="nsec"><h3>${esc(x.heading || "")}</h3><ul>${(x.lines || []).map(l => `<li>${linkify(l)}</li>`).join("")}</ul></section>`;
  return `<button class="nbx" data-nb="close" aria-label="Close the paper">✕</button>
    <header class="nhead">
      <div class="nears"><span>Vol. I · No. ${no}</span><span>Price: one wet wipe</span></div>
      <p class="nmast" id="nbTitle">${esc(api.paperName())}</p>
      <div class="nline"><span>${esc(date)}${item.edition ? " · " + esc(item.edition) : ""}</span><span>Delivered by ${esc(api.agentName(item.from))}</span></div>
    </header>
    <div class="nbbody">
      <h2 class="nheadline">${esc(item.title || "Good morning, village")}</h2>
      ${item.body ? `<div class="nlede">${notesHTML(item.body)}</div>` : ""}
      ${lead ? `<div class="nfront">${story(lead)}</div>` : ""}
      ${rest.length ? `<div class="ncols">${rest.map(story).join("")}</div>` : ""}
      ${safeUrl(item.link) ? `<p class="nmore"><a href="${esc(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer">Full briefing ↗</a></p>` : ""}
    </div>
    <div class="nbactions"><button class="btn yes" data-nb="thanks">Fold the paper, let's go</button></div>`;
}
// Water / steps: a small notebook page to key in how much.
function trackerPage(which){
  if (which === "water") {
    const w = api.water(), L = ml => (ml/1000).toLocaleString("en-GB", {maximumFractionDigits: 2});
    return `<button class="nbx" data-nb="close" aria-label="Close">✕</button>
      <p class="nbmeta">${icon("drop", 16)} today's water</p>
      <h2 id="nbTitle">${L(w.ml)} L <small class="nbby">of ${L(w.goal)} L</small></h2>
      <div class="trbar">${progressBar(w.ml/w.goal, "#9CC3E0", 8)}</div>
      <div class="nbbody">
        <p class="nblbl">Add</p>
        <div class="nbrow">${[[w.glass, "a glass"], [500, "a bottle"], [750, "a big bottle"]].map(([ml, n]) => `<button class="btn alt small" data-nb="w" data-ml="${ml}">+ ${n} <small>${ml} ml</small></button>`).join("")}</div>
        <p class="nblbl">Or set today's total</p>
        <div class="nbrow nbask"><label class="sr" for="nbTrack">Total water today in ml</label><input id="nbTrack" type="number" inputmode="numeric" min="0" step="50" placeholder="${w.ml || 1000} ml"><button class="btn small" data-nb="wset">Save</button></div>
        <p class="nbhint">Every 250 ml, up to a litre, earns a coin. The well in the village adds a glass too.</p>
      </div>
      <div class="nbactions"><button class="btn yes" data-nb="thanks">Done</button></div>`;
  }
  const st = api.steps();
  return `<button class="nbx" data-nb="close" aria-label="Close">✕</button>
    <p class="nbmeta">${icon("steps", 16)} today's steps</p>
    <h2 id="nbTitle">${st.n.toLocaleString()} <small class="nbby">of ${st.goal.toLocaleString()}</small></h2>
    <div class="trbar">${progressBar(st.n/st.goal, "var(--sage)", 5)}</div>
    <div class="nbbody">
      <p class="nblbl">Steps showing now</p>
      <div class="nbrow nbask"><label class="sr" for="nbTrack">Steps showing now</label><input id="nbTrack" type="number" inputmode="numeric" min="0" placeholder="${st.n || 2000}"><button class="btn primary small" data-nb="sset">Save</button></div>
      <p class="nbhint">Type the total from your watch or the treadmill. Every 1,000 earns 2 coins.</p>
    </div>
    <div class="nbactions"><button class="btn yes" data-nb="thanks">Done</button></div>`;
}
function trackerAct(k, b){
  const v = $("nbTrack") ? parseInt($("nbTrack").value, 10) : NaN;
  if (k === "w") { api.addWater(+b.dataset.ml); refreshNotebook(); return; }
  if (k === "wset") { if (v >= 0) api.setWater(v); closeNotebook(); return; }
  if (k === "sset") { if (v >= 0) api.setSteps(v); closeNotebook(); return; }
}
function digestPage(item){
  return `<button class="nbx" data-nb="close" aria-label="Close digest">✕</button>
    <p class="nbmeta">book digest · from Juniper's shelf${item.gen ? " · picked by Juniper" : ""}</p>
    <h2 id="nbTitle">${esc(item.title || "A book")}${item.author ? `<small class="nbby">by ${esc(item.author)}</small>` : ""}</h2>
    <div class="nbbody">${item.body ? `<div class="nbnotes">${notesHTML(item.body)}</div>` : ""}${sectionsHTML(item.sections)}
    ${item.try ? `<p class="nbpep">♡ Try today: ${esc(item.try)}</p>` : ""}
    ${safeUrl(item.link) ? `<div class="nbrow"><a class="btn primary small" href="${esc(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer">Read more ↗</a></div>` : ""}</div>
    <div class="nbactions"><button class="btn yes" data-nb="thanks">Back on the shelf</button></div>`;
}
const safeUrl = u => (typeof u === "string" && /^https?:\/\//i.test(u)) ? u : null;

/* ---------- talk to the note ---------- */
async function ask(){
  const input = $("nbAsk"), sample = api.sample(), t = api.task();
  if (!input || !sample || !t || busy) return;
  const q = input.value.trim(); if (!q) return;
  const log = chats[t.id] = chats[t.id] || [];
  log.push({role: "user", content: q}, {role: "assistant", content: "…"});
  input.value = ""; busy = new AbortController(); refreshNotebook();
  const S = api.S(), left = api.timerLeft(t);
  const brief = `You are Maple, a tiny fox who coaches Mel through her work day inside a cosy village game. Warm, direct, short sentences, never guilt, no lectures.
Reply in at most 3 short sentences and end with exactly one tiny physical next action. Plain text, no markdown, at most one emoji.
If the task involves pricing, remind her to price on the value delivered, not on what the buyer can afford.
Never claim to have done anything outside this conversation (you can't send emails, tick tasks or set timers).
Quest: ${t.title}
First step: ${t.firstStep || "(none given)"}
Time box: ${t.minutes || 25} minutes${left ? `, ${left} left` : ""}${api.fs(t) ? ", first step done" : ", not started yet"}
Notes: ${t.notes || "(none)"}${t.email ? `\nEmail: ${JSON.stringify(t.email)}` : ""}
Quests finished today: ${S.doneIds.length}`;
  const turns = log.slice(0, -1).map((m, i) => i === 0 ? {role: "user", content: brief + "\n\nMel says: " + m.content} : m);
  try {
    const res = await sample(turns, {signal: busy.signal, cache: false, modelTier: "quick",
      onText: ({text}) => { log[log.length - 1].content = text; const el = document.querySelector(".nbchat p:last-child"); if (el) el.innerHTML = icon("fox", 18) + " " + esc(text); }});
    log[log.length - 1].content = res.text.trim() || "Hmm, I lost my words. Try again?";
  } catch (e) {
    const msg = {not_granted: "No worries, we'll keep it to buttons. Talking needs your OK first.", rate_limited: "I need a little breather. Try again in a minute.", cancelled: null}[e && e.code];
    if (e && e.code === "cancelled") log.splice(-2); else log[log.length - 1].content = e && e.text ? e.text : (msg || "I couldn't reach Claude just now. Buttons still work!");
    if (e && e.code === "not_granted") api.sampleDenied();
  }
  busy = null; refreshNotebook(); $("nbAsk")?.focus();
}

async function copyDraft(btn){
  const t = api.task(); const d = t && t.email && t.email.draft; if (!d) return;
  try { await navigator.clipboard.writeText(d); btn.textContent = "Copied ✓"; }
  catch { const r = document.createRange(); r.selectNodeContents($("nbDraft")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Selected, now copy"; }
}

function trap(ev){
  const f = [...$("notebook").querySelectorAll("button:not([disabled]),a[href],input:not([disabled])")];
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
  else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
}
