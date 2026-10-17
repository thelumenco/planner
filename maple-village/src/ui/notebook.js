// The notebook overlay: a big washi-taped notebook page for letters (and the village paper), and the little pages
// for keying in today's water and steps.
import { $, esc, LOC } from "../util.js";
import { icon, progressBar } from "../art/icons.js";
import { sfx } from "../game/audio.js";

let api = null;        // from core: markRead(item), agentName(from), paperName(), windDown(), water(), steps(), addWater(ml), setWater(ml), setSteps(n), onClose()
let open = null;       // {kind:"mail", item} | {kind:"tracker", which}
let lastFocus = null;

export function initNotebook(a){
  api = a;
  const root = $("notebook");
  root.addEventListener("click", ev => {
    if (ev.target === root) return closeNotebook();
    const b = ev.target.closest("[data-nb]"); if (!b) return;
    const k = b.dataset.nb;
    if (k === "close") return closeNotebook();
    if (k === "pond") { closeNotebook(); api.windDown(); return; }
    if (k === "thanks") { closeNotebook(); return; }
    if (open && open.kind === "tracker") return trackerAct(k, b);
  });
  root.addEventListener("keydown", ev => {
    if (ev.key === "Escape") closeNotebook();
    if (ev.key === "Enter" && ev.target.id === "nbTrack") { ev.preventDefault(); trackerAct(open.which === "water" ? "wset" : "sset"); }
    if (ev.key === "Tab") trap(ev);
  });
}
export const notebookOpen = () => !!open;

export function openMail(item){ open = {kind: "mail", item}; api.markRead(item); show(); }
export function openTracker(which){ open = {kind: "tracker", which}; show(); setTimeout(() => $("nbTrack") && $("nbTrack").focus(), 50); }
export function closeNotebook(){
  if (!open) return;
  open = null; sfx("paper");
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

// Called by core on every render; keeps the page in sync with the game.
export function refreshNotebook(focus){
  if (!open) return;
  const page = $("nbPage");
  if (open.kind === "tracker") {   // keep a half-typed water or steps total (and the cursor) when the game redraws round it
    const keep = $("nbTrack") ? $("nbTrack").value : "", typing = document.activeElement && document.activeElement.id === "nbTrack";
    page.innerHTML = trackerPage(open.which);
    if ($("nbTrack") && keep) $("nbTrack").value = keep; if (typing && $("nbTrack")) { $("nbTrack").focus(); focus = false; }
  } else page.innerHTML = mailPage(open.item);
  page.className = "nbpage" + (open.kind === "mail" && open.item.from === "crier" ? " news" : open.kind === "tracker" ? " mini" : "");
  if (focus) (page.querySelector("[data-nb]:not([data-nb=close])") || page.querySelector("[data-nb]"))?.focus({preventScroll: true});
}

/* ---------- pages ---------- */
// Links show as small named chips ("example.com ↗") instead of long raw addresses. A line that is just
// "Label: https://…" becomes one chip named after its label.
const chipName = u => u.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0];
const chip = (u, name) => `<a class="lchip" href="${u}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a>`;
const URL_RE = /https?:\/\/[^\s<]+[^\s<.,;:!?)]/g;
const linkify = s => { const m = /^\s*([A-Za-z][\w '’-]{0,30}):\s*(https?:\/\/\S+)\s*$/.exec(s);
  if (m) return chip(esc(m[2]), m[1]);
  return esc(s).replace(URL_RE, u => chip(u, chipName(u.replace(/&amp;/g, "&")))); };
function notesHTML(text){
  const lines = String(text || "").split(/\r?\n/);
  let out = "", list = false, gap = false;   // round 195: a blank line leaves one ruled line empty, so letters breathe
  for (const ln of lines) {
    const m = ln.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/);
    if (m) { if (!list) { out += "<ul>"; list = true; } out += `<li>${linkify(m[1])}</li>`; gap = false; continue; }
    if (list) { out += "</ul>"; list = false; }
    if (!ln.trim()) { gap = !!out; continue; }
    out += `<p${gap ? ' class="gap"' : ""}>${linkify(ln)}</p>`; gap = false;
  }
  return out + (list ? "</ul>" : "");
}

// Optional `sections: [{heading, lines:[...]}]` on a letter renders as headed lists. The town crier's paper gets a
// little village-newspaper masthead.
const sectionsHTML = secs => (Array.isArray(secs) ? secs : []).filter(x => x && (x.heading || (x.lines || []).length)).map(x =>
  `<section class="nbsec">${x.heading ? `<h3>${esc(x.heading)}</h3>` : ""}<ul>${(x.lines || []).map(l => `<li>${linkify(l)}</li>`).join("")}</ul></section>`).join("");
const timeOf = at => at ? new Date(at).toLocaleTimeString("en-GB", {hour: "numeric", minute: "2-digit"}) : "";
function mailPage(item){
  if (item.from === "crier") return newsPage(item);
  return `<button class="nbx" data-nb="close" aria-label="Close note">✕</button>
    <p class="nbmeta">a note from ${esc(api.agentName(item.from))}${item.at ? ` · ${timeOf(item.at)}` : ""}</p>
    <h2 id="nbTitle">${esc(item.title || "A note for you")}</h2>
    <div class="nbbody">${item.body ? `<div class="nbnotes">${notesHTML(item.body)}</div>` : ""}${sectionsHTML(item.sections)}
    ${(item.enclosed || []).length ? `<div class="nbenc"><p class="nbmeta">Tucked in with the note</p><div class="nbencrow">${item.enclosed.map(e => `<span class="nbencit">${icon(e.ico, 44)}<small>${esc(e.n)}</small></span>`).join("")}</div><p class="muted nbencnote">In your backpack and your purse now.</p></div>` : ""}
    ${safeUrl(item.link) ? `<div class="nbrow"><a class="btn primary small" href="${esc(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer">Open the full thing ↗</a></div>` : ""}</div>
    <div class="nbactions">${(item.pond = item.pond || item.from === "winddown") ? `<button class="btn primary" data-nb="pond">Walk to the pond</button>` : ""}<button class="btn ${item.pond ? "alt" : "yes"}" data-nb="thanks">${item.pond ? "Later" : "Thanks!"}</button></div>`;
}
// The weekend paper. The first section is the front-page story.
function newsPage(item){
  const d = new Date(item.at || Date.now());
  const sg = new Date(d.getTime() + LOC());
  const no = Math.floor((sg - Date.UTC(sg.getUTCFullYear(), 0, 0)) / 864e5);
  const date = d.toLocaleDateString("en-GB", {weekday: "long", day: "numeric", month: "long", year: "numeric"});
  const secs = (Array.isArray(item.sections) ? item.sections : []).filter(x => x && (x.heading || (x.lines || []).length));
  const lead = secs[0], rest = secs.slice(1);
  const story = x => `<section class="nsec"><h3>${esc(x.heading || "")}</h3><ul>${(x.lines || []).map(l => `<li>${linkify(l)}</li>`).join("")}</ul></section>`;
  return `<button class="nbx" data-nb="close" aria-label="Close the paper">✕</button>
    <header class="nhead">
      <div class="nears"><span>Vol. I · No. ${no}</span><span>Price: one smile</span></div>
      <p class="nmast" id="nbTitle">${esc(api.paperName())}</p>
      <div class="nline"><span>${esc(date)}${item.edition ? " · " + esc(item.edition) : ""}</span><span>Delivered by ${esc(api.agentName(item.from))}</span></div>
    </header>
    <div class="nbbody">
      <h2 class="nheadline">${esc(item.title || "Good news from the village")}</h2>
      ${item.body ? `<div class="nlede">${notesHTML(item.body)}</div>` : ""}
      ${lead ? `<div class="nfront">${story(lead)}</div>` : ""}
      ${rest.length ? `<div class="ncols">${rest.map(story).join("")}</div>` : ""}
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
const safeUrl = u => (typeof u === "string" && /^https?:\/\//i.test(u)) ? u : null;

function trap(ev){
  const f = [...$("notebook").querySelectorAll("button:not([disabled]),a[href],input:not([disabled])")];
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
  else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
}
