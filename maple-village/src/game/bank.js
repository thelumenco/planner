// The bank: Mel's savings goals as five tall glass vault jars that fill with jewels. Each jar has a label, a goal,
// money markers every N (e.g. $100), and a jewel colour she picks. Deposits pour jewels in (with a tinkle), then
// the jar is capped and goes back in the vault. A full jar sparkles and Maple says so. Private per-user doc "vaults",
// merged by jar id (newest edit wins), with a local copy.
import { esc, plain } from "../util.js";

export const SLOTS = 5;
export const JEWELS = [["ruby", "Ruby", "#D9485F"], ["sapphire", "Sapphire", "#3F6FD1"], ["emerald", "Emerald", "#2E9E6B"], ["amethyst", "Amethyst", "#9363C8"],
  ["topaz", "Topaz", "#F2A33A"], ["rose", "Rose quartz", "#F29BB8"], ["citrine", "Citrine", "#F2CF3A"], ["diamond", "Diamond", "#BFE3F2"]];
const colOf = k => (JEWELS.find(j => j[0] === k) || JEWELS[0])[2];
const KEY = "fox.vaults";
const load = () => { try { return Object.assign({jars: [], updatedAt: 0}, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { return {jars: [], updatedAt: 0}; } };
let V = load(), ref = null, chain = Promise.resolve(), onChange = () => {};
const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(V)); } catch {} };
function merge(a, b){
  const m = new Map(); [...(a.jars || []), ...((b && b.jars) || [])].forEach(j => { if (!j || !j.id) return; const o = m.get(j.id); if (!o || (j.u || 0) > (o.u || 0)) m.set(j.id, j); });
  return {jars: [...m.values()], updatedAt: Math.max(a.updatedAt || 0, (b && b.updatedAt) || 0)};
}
export function attachVaults(col, changed){
  onChange = changed; ref = col.doc("vaults");
  ref.onSnapshot(snap => { if (!snap.exists) { if (V.jars.length) push(); return; } V = merge(V, JSON.parse(JSON.stringify(snap.data() || {}))); keep(); onChange(); }, () => {});
}
function push(){ if (!ref) return; chain = chain.then(async () => { try { const cur = await ref.get(); if (cur.exists) V = merge(V, JSON.parse(JSON.stringify(cur.data() || {}))); await ref.set(JSON.parse(JSON.stringify(V))); } catch {} }); }
const touch = j => { j.u = Date.now(); V.updatedAt = Date.now(); keep(); push(); onChange(); };

export const jarAt = slot => V.jars.find(j => j.slot === slot && !j.deleted) || null;
export const allJars = () => V.jars.filter(j => !j.deleted).sort((a, b) => a.slot - b.slot);
export const fillOf = j => j && j.goal > 0 ? Math.max(0, Math.min(1, (j.amount || 0)/j.goal)) : 0;
export const isFull = j => !!j && j.goal > 0 && (j.amount || 0) >= j.goal;
export const money = (n, cur = "$") => `${cur}${Math.round(Number(n) || 0).toLocaleString("en-GB")}`;
export function setupJar(slot, f){
  let j = jarAt(slot); if (!j) { j = {id: "v" + Date.now().toString(36), slot, amount: 0, log: [], fills: 0}; V.jars.push(j); }
  j.label = plain(String(f.label || "Savings")).trim().slice(0, 24) || "Savings"; j.goal = Math.max(1, Math.round(Number(f.goal) || 0)); j.step = Math.max(1, Math.round(Number(f.step) || 100));
  j.color = JEWELS.some(x => x[0] === f.color) ? f.color : "ruby"; j.cur = String(f.cur || "$").slice(0, 3); j.deleted = false; touch(j); return j;
}
// add (or, with a negative number, take out). Returns {jar, nowFull}
export function deposit(slot, amt){
  const j = jarAt(slot); if (!j) return null; amt = Math.round(Number(amt) || 0); if (!amt) return {jar: j, nowFull: false};
  const was = isFull(j); j.amount = Math.max(0, (j.amount || 0) + amt); j.log = [...(j.log || []), {at: Date.now(), amt}].slice(-60);
  const nowFull = !was && isFull(j); if (nowFull) { j.fills = (j.fills || 0) + 1; j.fullAt = Date.now(); } touch(j); return {jar: j, nowFull};
}
// empty a jar (Undo restores it); returns restore()
export function emptyJar(slot){
  const j = jarAt(slot); if (!j) return null; const before = {amount: j.amount, log: j.log};
  j.amount = 0; j.log = [...(j.log || []), {at: Date.now(), amt: -before.amount, emptied: true}].slice(-60); touch(j);
  return () => { j.amount = before.amount; j.log = before.log; touch(j); };
}
export function removeJar(slot){ const j = jarAt(slot); if (!j) return null; const copy = JSON.parse(JSON.stringify(j)); j.deleted = true; touch(j); return () => { Object.assign(j, copy, {deleted: false}); touch(j); }; }
export const fullCounts = () => allJars().map(j => ({id: j.id, label: j.label, fills: j.fills || 0}));
// chat: find a vault by (part of) its label
export const jarByLabel = q => { const n = String(q || "").toLowerCase().trim(); return allJars().find(j => j.label.toLowerCase() === n) || allJars().find(j => n && (j.label.toLowerCase().includes(n) || n.includes(j.label.toLowerCase()))) || null; };

/* ---------- the jar drawing (shared by the bank floor and the modal) ---------- */
const rnd = (seed, i) => { let h = 2166136261; for (const ch of seed + ":" + i) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000)/1000; };
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(f > 0 ? v + (255 - v)*f : v*(1 + f))); return "#" + c.map(v => v.toString(16).padStart(2, "0")).join(""); };
// a flat little jewel (2D facets, no gloss)
const gem = (x, y, s, c, seed, i) => { const k = rnd(seed, i) < .5, lt = shade(c, .28), dk = shade(c, -.18);
  return k ? `<path d="M${x - s} ${y} l${s*.5} ${-s*.7} h${s} l${s*.5} ${s*.7} l${-s} ${s*.9}z" fill="${c}"/><path d="M${x - s} ${y} h${s*2} l${-s} ${s*.9}z" fill="${dk}"/><path d="M${x - s*.5} ${y - s*.7} h${s} l${-s*.5} ${s*.7}z" fill="${lt}"/>`
    : `<path d="M${x} ${y - s} l${s*.8} ${s} l${-s*.8} ${s*.8} l${-s*.8} ${-s*.8}z" fill="${c}"/><path d="M${x} ${y - s} l${s*.8} ${s} h${-s*.8}z" fill="${lt}"/><path d="M${x - s*.8} ${y} h${s*.8} v${s*.8}z" fill="${dk}"/>`; };
// jar in a box w x h (top-left 0,0). opts: {fill (0..1, overrides), seed, cap (bool), sparkle, markers (bool), id}
export function jarArt(j, w, h, opts = {}){
  const c = colOf(j && j.color), f = opts.fill != null ? opts.fill : fillOf(j), seed = (j && j.id) || "new";
  const L = w*.1, R = w*.9, T = h*.09, B = h*.97, inner = [L + 3, R - 3], topY = T + 10, fillTop = B - 6 - (B - 6 - topY)*f;
  const body = `M${L + 2} ${T + 6} q-3 ${h*.04} -2.4 ${h*.1} q1 ${(B - T)*.38} -.4 ${(B - T)*.78} q.4 ${h*.05} ${w*.08} ${h*.06} q${(R - L)*.42} 1.2 ${(R - L)*.84 - w*.16} -.2 q${w*.07} -.6 ${w*.07} ${-h*.06} q-.9 ${-(B - T)*.4} .3 ${-(B - T)*.8} q.2 ${-h*.06} -2.4 ${-h*.09}z`;
  // jewels: rows from the bottom up to the fill line
  let gems = ""; const s = Math.max(4, w*.075), rowH = s*1.35, cols = Math.max(3, Math.floor((inner[1] - inner[0])/(s*1.9)));
  for (let r = 0, y = B - 8; y > fillTop + s*.3; r++, y -= rowH) for (let i = 0; i < cols; i++) {
    const x = inner[0] + s + (i + (r % 2)*.5)*((inner[1] - inner[0] - s*2)/(cols - .5)) + (rnd(seed, r*31 + i) - .5)*s*.5;
    if (x > inner[1] - s*.6) continue; const tone = [c, shade(c, .15), shade(c, -.1)][Math.floor(rnd(seed, r*7 + i*3)*3)];
    gems += gem(x, y + (rnd(seed, r*13 + i) - .5)*s*.4, s, tone, seed, r*17 + i);
  }
  // money markers up the side
  let marks = "";
  if (opts.markers !== false && j && j.goal > 0 && j.step > 0) { const n = Math.floor(j.goal/j.step), every = Math.max(1, Math.ceil(n/(h > 200 ? 12 : 6)));
    for (let k = 1; k <= n; k++) { if (k % every && k !== n) continue; const y = B - 6 - (B - 6 - topY)*(k*j.step/j.goal);
      marks += `<path d="M${R - 2} ${y.toFixed(1)} h${-w*.12}" stroke="#3b3530" stroke-width="1" opacity=".55"/>${h > 160 ? `<text x="${R + 2}" y="${(y + 3).toFixed(1)}" font-size="${Math.max(7, w*.11)}" font-family="Mulish, sans-serif" font-weight="700" fill="#5E5650">${esc(money(k*j.step, j.cur))}</text>` : ""}`; } }
  const cap = opts.cap === false ? "" : `<g class="vcap"><path d="M${L + 1} ${T - 2} q${(R - L)/2 - 1} -4 ${R - L - 2} 0 l.6 ${h*.06} q${-(R - L)/2} 3 ${-(R - L) + 1} 0z" fill="#C9A227" stroke="#3b3530" stroke-width="1.3" stroke-linejoin="round"/><path d="M${L + 4} ${T + h*.025} h${R - L - 8}" stroke="#8B6B12" stroke-width="1" opacity=".6"/></g>`;
  const clip = `vclip-${esc(opts.id || seed)}`;
  return `<defs><clipPath id="${clip}"><path d="${body}"/></clipPath></defs>
    <path d="${body}" fill="rgba(220,235,245,.4)" stroke="#3b3530" stroke-width="1.5" stroke-linejoin="round"/>
    <g clip-path="url(#${clip})"><g class="vgems">${gems}</g></g>${marks}
    <path d="M${L + 7} ${T + 16} q-1 ${(B - T)*.4} .4 ${(B - T)*.72}" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2.2" stroke-linecap="round"/>${cap}
    ${opts.sparkle ? [[.3, .2], [.7, .35], [.45, .6], [.8, .75], [.2, .85]].map(([fx, fy], i) => `<path class="vspark" style="animation-delay:-${(i*.4).toFixed(1)}s" d="M${(L + (R - L)*fx).toFixed(1)} ${(T + (B - T)*fy - 5).toFixed(1)} l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z" fill="#FFF6C2" stroke="#C9A227" stroke-width=".8"/>`).join("") : ""}`;
}

/* ---------- panels ---------- */
export const bv = {mode: "jar", slot: 0, amt: "", form: null, pouring: false};
export function vaultPanel(){
  const j = jarAt(bv.slot), h = `<span class="tape gingham" aria-hidden="true"></span>`;
  if (!j || bv.mode === "setup") {
    const f = bv.form || {label: j ? j.label : "", goal: j ? j.goal : "", step: j ? j.step : 100, color: j ? j.color : JEWELS[bv.slot % JEWELS.length][0], cur: j ? j.cur : "$"};
    return h + `<h2>${j ? "Change this vault" : "Set up vault " + (bv.slot + 1)}</h2><p class="sub">A savings goal, kept as jewels.</p>
      <form id="vForm" class="vform"><label class="muted" for="vLabel">Label</label><input id="vLabel" maxlength="24" placeholder="e.g. Japan trip" value="${esc(f.label)}">
      <div class="vrow"><span><label class="muted" for="vGoal">Goal</label><input id="vGoal" type="number" inputmode="numeric" min="1" step="1" placeholder="2000" value="${esc(String(f.goal))}"></span>
      <span><label class="muted" for="vStep">Markers every</label><select id="vStep">${[10, 20, 50, 100, 200, 500, 1000].map(v => `<option value="${v}"${+f.step === v ? " selected" : ""}>${v}</option>`).join("")}</select></span></div>
      <p class="muted" style="margin:8px 0 4px">Jewels</p><div class="vswatch" role="radiogroup" aria-label="Jewel colour">${JEWELS.map(([k, n, c]) => `<button type="button" class="vsw${f.color === k ? " on" : ""}" data-vcol="${k}" role="radio" aria-checked="${f.color === k}" aria-label="${n}" title="${n}"><svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true">${gem(10, 9, 7, c, k, 1)}</svg></button>`).join("")}</div>
      <div class="actions"><button class="btn primary" type="submit">${j ? "Save" : "Set it up"}</button><button class="btn alt small" type="button" data-vb="${j ? "back" : "close"}">${j ? "Back" : "Not now"}</button>${j ? `<button class="btn alt small" type="button" data-vb="remove">Remove this vault</button>` : ""}</div></form>`;
  }
  const full = isFull(j);
  return h + `<h2>${esc(j.label)}</h2><p class="sub">${esc(money(j.amount, j.cur))} of ${esc(money(j.goal, j.cur))}${full ? " · full!" : ` · ${esc(money(Math.max(0, j.goal - j.amount), j.cur))} to go`}</p>
    <div class="vbig${bv.pouring ? " pouring" : ""}${full ? " full" : ""}" id="vBig"><svg viewBox="0 0 160 300" width="160" height="300" aria-hidden="true">${jarArt(j, 120, 290, {id: "big", sparkle: full, cap: !bv.pouring})}</svg><div class="vpour" id="vPour"></div></div>
    <form id="vAdd" class="row vadd"><label class="sr" for="vAmt">Amount to add</label><span class="vcur">${esc(j.cur)}</span><input id="vAmt" type="number" inputmode="decimal" step="1" placeholder="Amount" value="${esc(bv.amt)}"><button class="btn primary" type="submit" ${bv.pouring ? "disabled" : ""}>Add jewels</button></form>
    <div class="actions"><button class="btn alt small" data-vb="out">Take some out</button><button class="btn alt small" data-vb="setup">Change</button><button class="btn alt small" data-vb="empty" ${j.amount ? "" : "disabled"}>Empty the jar</button><button class="btn alt small" data-close="1">Back to the vault</button></div>
    ${(j.log || []).length ? `<details class="vlog"><summary>History</summary><ul>${j.log.slice().reverse().slice(0, 12).map(x => `<li><span>${new Date(x.at).toLocaleDateString("en-GB", {day: "numeric", month: "short", timeZone: "Asia/Singapore"})}</span><b>${x.emptied ? "emptied" : (x.amt > 0 ? "+" : "") + esc(money(x.amt, j.cur))}</b></li>`).join("")}</ul></details>` : ""}`;
}
export function bankOverview(bankerHere){
  const js = allJars(), total = js.reduce((s, j) => s + (j.amount || 0), 0);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The bank</h2><p class="sub">${bankerHere ? "Opal slides your passbook across the counter." : "Opal's passbook is on the counter."} Every vault at a glance.</p>
    ${js.length ? `<ul class="hlist vlist">${js.map(j => `<li data-vopen="${j.slot}" role="button" tabindex="0"><span><b>${esc(j.label)}</b><small>${esc(money(j.amount, j.cur))} of ${esc(money(j.goal, j.cur))}</small></span><span class="clbar"><i style="width:${Math.round(fillOf(j)*100)}%;background:${colOf(j.color)}"></i></span>${isFull(j) ? `<span class="hbadge now">full</span>` : ""}</li>`).join("")}</ul>
      <p class="muted">Saved across every vault: <b>${esc(money(total, (js[0] && js[0].cur) || "$"))}</b></p>` : `<p class="muted">No vaults set up yet. Tap any empty jar along the back wall to start one.</p>`}
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// api: {rerender, undoable, poured(jar, nowFull), sfx}
export function wireVault(root, api){
  root.querySelectorAll("[data-vcol]").forEach(b => b.onclick = () => { bv.form = readForm(root); bv.form.color = b.dataset.vcol; api.rerender(); });
  const form = root.querySelector("#vForm");
  if (form) form.onsubmit = ev => { ev.preventDefault(); const f = readForm(root); if (!(Number(f.goal) > 0)) { root.querySelector("#vGoal").focus(); return; } setupJar(bv.slot, f); bv.form = null; bv.mode = "jar"; api.sfx("chime"); api.rerender(); };
  const amt = root.querySelector("#vAmt"); if (amt) amt.oninput = () => { bv.amt = amt.value; };
  const add = root.querySelector("#vAdd");
  if (add) add.onsubmit = ev => { ev.preventDefault(); const n = Math.round(Number(amt.value) || 0); if (!n || bv.pouring) { amt.focus(); return; } pour(root, n, api); };
  root.querySelectorAll("[data-vb]").forEach(b => b.onclick = () => {
    const k = b.dataset.vb;
    if (k === "setup") { bv.mode = "setup"; bv.form = null; }
    else if (k === "back") { bv.mode = "jar"; bv.form = null; }
    else if (k === "out") { const n = Math.round(Number(prompt("How much are you taking out?") || 0)); if (n > 0) { deposit(bv.slot, -n); api.sfx("paper"); } }
    else if (k === "empty") { const r = emptyJar(bv.slot); if (r) { api.sfx("pop"); api.undoable("Jar emptied", () => { r(); api.rerender(); }); } }
    else if (k === "remove") { const r = removeJar(bv.slot); bv.mode = "jar"; if (r) api.undoable("Vault removed", () => { r(); api.rerender(); }); return api.close(); }
    else if (k === "close") return api.close();
    api.rerender();
  });
}
const readForm = root => ({label: root.querySelector("#vLabel").value, goal: root.querySelector("#vGoal").value, step: root.querySelector("#vStep").value, color: (bv.form && bv.form.color) || (root.querySelector(".vsw.on") || {}).dataset?.vcol || "ruby", cur: (jarAt(bv.slot) || {}).cur || "$"});
// the pour: jewels tumble from above into the open jar, the level rises, then the cap drops on
function pour(root, n, api){
  const j = jarAt(bv.slot); if (!j) return;
  bv.pouring = true; bv.amt = "";
  const big = root.querySelector("#vBig"), from = fillOf(j), res = deposit(bv.slot, n), to = fillOf(res.jar), c = colOf(j.color);
  big.classList.add("pouring"); const svg = big.querySelector("svg");
  const capEl = svg.querySelector(".vcap"); if (capEl) capEl.classList.add("lift");
  const drops = Math.min(24, 6 + Math.round(Math.abs(n)/Math.max(1, j.step)*3)), box = big.querySelector("#vPour");
  for (let i = 0; i < drops; i++) { const d = document.createElement("span"); d.className = "vdrop"; d.style.left = (44 + Math.random()*52) + "px"; d.style.animationDelay = (i*0.07).toFixed(2) + "s";
    d.innerHTML = `<svg viewBox="0 0 20 20" width="14" height="14">${gem(10, 9, 7, [c, shade(c, .15), shade(c, -.1)][i % 3], j.id, i)}</svg>`; box.appendChild(d); }
  api.sfx("jewels");
  const steps = 18; let k = 0;
  const grow = setInterval(() => { k++; const f = from + (to - from)*(k/steps); svg.innerHTML = jarArt(res.jar, 120, 290, {id: "big", fill: f, cap: false});
    if (k >= steps) { clearInterval(grow); setTimeout(() => { svg.innerHTML = jarArt(res.jar, 120, 290, {id: "big", sparkle: isFull(res.jar)}); const cp = svg.querySelector(".vcap"); if (cp) cp.classList.add("drop"); api.sfx("cap");
      setTimeout(() => { bv.pouring = false; box.innerHTML = ""; api.poured(res.jar, res.nowFull); api.rerender(); }, 650); }, 250); } }, 70);
}
