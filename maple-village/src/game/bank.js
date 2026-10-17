// The bank (round 227): your own real-life savings, kept as five tall glass vault jars along the back wall that
// fill with jewels. Each jar has a label, a goal, markers every N and a jewel colour you pick. Add savings and
// jewels pour in, take some out, empty it (Undo) or remove the vault (Undo). These are your own savings, not game
// coins: pick your currency once (it's shared by every vault, and you can change it in the passbook).
// State: F.vaults = {cur, jars: [{id, slot, label, goal, step, color, amount, log: [{at, amt, emptied?}], fills, fullAt}]}.
import { esc, plain, now } from "../util.js";

export const SLOTS = 5;
export const JEWELS = [["ruby", "Ruby", "#D9485F"], ["sapphire", "Sapphire", "#3F6FD1"], ["emerald", "Emerald", "#2E9E6B"], ["amethyst", "Amethyst", "#9363C8"],
  ["topaz", "Topaz", "#F2A33A"], ["rose", "Rose quartz", "#F29BB8"], ["citrine", "Citrine", "#F2CF3A"], ["diamond", "Diamond", "#BFE3F2"]];
export const CURRENCIES = [["£", "£ Pounds"], ["$", "$ Dollars"], ["€", "€ Euros"], ["¥", "¥ Yen or yuan"], ["S$", "S$ Dollars"], ["A$", "A$ Dollars"], ["₹", "₹ Rupees"], ["", "No symbol"]];
export const STEPS = [10, 20, 50, 100, 200, 500, 1000, 5000];
export const colOf = k => (JEWELS.find(j => j[0] === k) || JEWELS[0])[2];
const r2 = n => Math.round((Number(n) || 0)*100)/100;

export function vaultState(F){ const V = F.vaults = (F.vaults && typeof F.vaults === "object") ? F.vaults : {};
  V.jars = Array.isArray(V.jars) ? V.jars : []; if (typeof V.cur !== "string") V.cur = "£"; return V; }
export const currency = F => vaultState(F).cur;
export const curChosen = F => !!vaultState(F).curSet;
export function setCurrency(F, cur){ const V = vaultState(F); if (!CURRENCIES.some(c => c[0] === cur)) return false; V.cur = cur; V.curSet = 1; return true; }
export const jarAt = (F, slot) => vaultState(F).jars.find(j => j.slot === slot) || null;
export const allJars = F => vaultState(F).jars.slice().sort((a, b) => a.slot - b.slot);
export const fillOf = j => j && j.goal > 0 ? Math.max(0, Math.min(1, (j.amount || 0)/j.goal)) : 0;
export const isFull = j => !!j && j.goal > 0 && (j.amount || 0) >= j.goal;
export const total = F => r2(allJars(F).reduce((s, j) => s + (j.amount || 0), 0));
export const money = (n, cur = "£") => { const v = r2(n), a = Math.abs(v), s = a.toLocaleString("en-GB", {minimumFractionDigits: a % 1 ? 2 : 0, maximumFractionDigits: 2});
  return `${v < 0 ? "-" : ""}${cur}${s}`; };
export function setupJar(F, slot, f){
  if (!(slot >= 0 && slot < SLOTS)) return null; const goal = r2(f.goal); if (!(goal > 0)) return null;
  const V = vaultState(F); let j = jarAt(F, slot);
  if (!j) { j = {id: "v" + now().toString(36) + slot, slot, amount: 0, log: [], fills: 0}; V.jars.push(j); }
  j.label = plain(String(f.label || "")).trim().slice(0, 24) || "Savings"; j.goal = goal; j.step = Math.max(1, Math.round(Number(f.step) || 100));
  j.color = JEWELS.some(x => x[0] === f.color) ? f.color : JEWELS[slot % JEWELS.length][0];
  if (f.cur != null) setCurrency(F, f.cur);
  return j;
}
// add (or, with a negative number, take out: never below zero). Returns {jar, nowFull, amt}
export function deposit(F, slot, amt, at = now()){
  const j = jarAt(F, slot); if (!j) return null; amt = r2(amt);
  if (amt < 0) amt = -Math.min(-amt, j.amount || 0);
  if (!amt) return {jar: j, nowFull: false, amt: 0};
  const was = isFull(j); j.amount = r2(Math.max(0, (j.amount || 0) + amt)); j.log = [...(j.log || []), {at, amt}].slice(-60);
  const nowFull = !was && isFull(j); if (nowFull) { j.fills = (j.fills || 0) + 1; j.fullAt = at; }
  return {jar: j, nowFull, amt};
}
// empty a jar; returns restore() for Undo
export function emptyJar(F, slot, at = now()){
  const j = jarAt(F, slot); if (!j || !j.amount) return null; const before = {amount: j.amount, log: (j.log || []).slice()};
  j.log = [...(j.log || []), {at, amt: -j.amount, emptied: true}].slice(-60); j.amount = 0;
  return () => { const k = jarAt(F, slot); if (k && k.id === j.id) { k.amount = before.amount; k.log = before.log; } };
}
// remove a vault altogether; returns restore() for Undo
export function removeJar(F, slot){
  const V = vaultState(F), i = V.jars.findIndex(j => j.slot === slot); if (i < 0) return null; const [gone] = V.jars.splice(i, 1);
  return () => { const W = vaultState(F); if (!W.jars.some(j => j.slot === gone.slot)) W.jars.push(gone); };
}

/* ---------- the jar drawing (shared by the bank floor and the panel) ---------- */
const rnd = (seed, i) => { let h = 2166136261; for (const ch of seed + ":" + i) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000)/1000; };
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(f > 0 ? v + (255 - v)*f : v*(1 + f))); return "#" + c.map(v => v.toString(16).padStart(2, "0")).join(""); };
// a flat little jewel (2D facets, no gloss)
export const gem = (x, y, s, c, seed, i) => { const k = rnd(seed, i) < .5, lt = shade(c, .28), dk = shade(c, -.18);
  return k ? `<path d="M${x - s} ${y} l${s*.5} ${-s*.7} h${s} l${s*.5} ${s*.7} l${-s} ${s*.9}z" fill="${c}"/><path d="M${x - s} ${y} h${s*2} l${-s} ${s*.9}z" fill="${dk}"/><path d="M${x - s*.5} ${y - s*.7} h${s} l${-s*.5} ${s*.7}z" fill="${lt}"/>`
    : `<path d="M${x} ${y - s} l${s*.8} ${s} l${-s*.8} ${s*.8} l${-s*.8} ${-s*.8}z" fill="${c}"/><path d="M${x} ${y - s} l${s*.8} ${s} h${-s*.8}z" fill="${lt}"/><path d="M${x - s*.8} ${y} h${s*.8} v${s*.8}z" fill="${dk}"/>`; };
// jar in a box w x h (top-left 0,0). opts: {fill (0..1, overrides), cap (bool), sparkle, markers (bool), id, cur}
export function jarArt(j, w, h, opts = {}){
  const c = colOf(j && j.color), f = opts.fill != null ? opts.fill : fillOf(j), seed = (j && j.id) || "new";
  const L = w*.1, R = w*.9, T = h*.09, B = h*.97, inner = [L + 3, R - 3], topY = T + 10, fillTop = B - 6 - (B - 6 - topY)*f;
  const body = `M${L + 2} ${T + 6} q-3 ${h*.04} -2.4 ${h*.1} q1 ${(B - T)*.38} -.4 ${(B - T)*.78} q.4 ${h*.05} ${w*.08} ${h*.06} q${(R - L)*.42} 1.2 ${(R - L)*.84 - w*.16} -.2 q${w*.07} -.6 ${w*.07} ${-h*.06} q-.9 ${-(B - T)*.4} .3 ${-(B - T)*.8} q.2 ${-h*.06} -2.4 ${-h*.09}z`;
  // jewels: rows from the bottom up to the fill line
  let gems = ""; const s = Math.max(4, w*.075), rowH = s*1.35, cols = Math.max(3, Math.floor((inner[1] - inner[0])/(s*1.9)));
  if (f > 0) for (let r = 0, y = B - 8; y > fillTop + s*.3 || (r === 0 && f > 0); r++, y -= rowH) for (let i = 0; i < cols; i++) {
    const x = inner[0] + s + (i + (r % 2)*.5)*((inner[1] - inner[0] - s*2)/(cols - .5)) + (rnd(seed, r*31 + i) - .5)*s*.5;
    if (x > inner[1] - s*.6) continue; const tone = [c, shade(c, .15), shade(c, -.1)][Math.floor(rnd(seed, r*7 + i*3)*3)];
    gems += gem(x, y + (rnd(seed, r*13 + i) - .5)*s*.4, s, tone, seed, r*17 + i);
  }
  // money markers up the side
  let marks = "";
  if (opts.markers !== false && j && j.goal > 0 && j.step > 0) { const n = Math.floor(j.goal/j.step), every = Math.max(1, Math.ceil(n/(h > 200 ? 12 : 6)));
    for (let k = 1; k <= n; k++) { if ((k % every && k !== n) || (k !== n && (n - k)*j.step/j.goal < (h > 200 ? .07 : .12))) continue; const y = B - 6 - (B - 6 - topY)*(k*j.step/j.goal);
      marks += `<path d="M${R - 2} ${y.toFixed(1)} h${-w*.12}" stroke="#3b3530" stroke-width="1" opacity=".55"/>${h > 160 ? `<text x="${R + 2}" y="${(y + 3).toFixed(1)}" font-size="${Math.max(7, w*.11)}" font-family="Mulish, sans-serif" font-weight="700" fill="#5E5650">${esc(money(k*j.step, opts.cur == null ? "" : opts.cur))}</text>` : ""}`; } }
  // the cap sits centred on the glass
  const bodyR = L + 2 + (R - L)*.84 - w*.01, cL = L - 1, cW = bodyR + 1 - cL;
  const cap = opts.cap === false ? "" : `<g class="vcap"><path d="M${cL} ${T - 2} q${cW/2} -4 ${cW} 0 l.6 ${h*.06} q${-cW/2 - .6} 3 ${-cW - .6} 0z" fill="#C9A227" stroke="#3b3530" stroke-width="1.3" stroke-linejoin="round"/><path d="M${cL + 3} ${T + h*.025} h${cW - 6}" stroke="#8B6B12" stroke-width="1" opacity=".6"/></g>`;
  const clip = `vclip-${esc(opts.id || seed)}`;
  return `<defs><clipPath id="${clip}"><path d="${body}"/></clipPath></defs>
    <path d="${body}" fill="rgba(220,235,245,.4)" stroke="#3b3530" stroke-width="1.5" stroke-linejoin="round"/>
    <g clip-path="url(#${clip})"><g class="vgems">${gems}</g></g>${marks}
    <path d="M${L + 7} ${T + 16} q-1 ${(B - T)*.4} .4 ${(B - T)*.72}" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2.2" stroke-linecap="round"/>${cap}
    ${opts.sparkle ? [[.3, .2], [.7, .35], [.45, .6], [.8, .75], [.2, .85]].map(([fx, fy], i) => `<path class="vspark" style="animation-delay:-${(i*.4).toFixed(1)}s" d="M${(L + (R - L)*fx).toFixed(1)} ${(T + (B - T)*fy - 5).toFixed(1)} l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z" fill="#FFF6C2" stroke="#C9A227" stroke-width=".8"/>`).join("") : ""}`;
}

/* ---------- panels ---------- */
export const freshView = (slot = 0) => ({mode: "jar", slot, amt: "", form: null, pouring: false});
const when = at => new Date(at).toLocaleDateString("en-GB", {day: "numeric", month: "short"});
const curPick = (F, sel) => `<select id="vCur">${CURRENCIES.map(([k, n]) => `<option value="${esc(k)}"${sel === k ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
export function vaultPanel(F, bv){
  const j = jarAt(F, bv.slot), cur = currency(F), h = `<span class="tape gingham" aria-hidden="true"></span>`;
  if (!j || bv.mode === "setup") {
    const f = bv.form || {label: j ? j.label : "", goal: j ? j.goal : "", step: j ? j.step : 100, color: j ? j.color : JEWELS[bv.slot % JEWELS.length][0], cur};
    return h + `<h2>${j ? "Change this vault" : "Set up vault " + (bv.slot + 1)}</h2><p class="sub">Something you're saving up for in real life, kept as jewels. Add to it whenever you put money by.</p>
      <form id="vForm" class="vform"><label class="muted" for="vLabel">What it's for</label><input id="vLabel" maxlength="24" placeholder="e.g. A holiday" value="${esc(f.label)}" autocomplete="off">
      <div class="vrow"><span><label class="muted" for="vGoal">Goal</label><input id="vGoal" type="number" inputmode="decimal" min="1" step="any" placeholder="2000" value="${esc(String(f.goal))}"></span>
      <span><label class="muted" for="vStep">Markers every</label><select id="vStep">${STEPS.map(v => `<option value="${v}"${+f.step === v ? " selected" : ""}>${v.toLocaleString("en-GB")}</option>`).join("")}</select></span></div>
      <div class="vrow vcurrow"><span><label class="muted" for="vCur">Currency${curChosen(F) ? "" : " (for all your vaults)"}</label>${curPick(F, f.cur)}</span></div>
      <p class="muted" style="margin:8px 0 4px">Jewels</p><div class="vswatch" role="radiogroup" aria-label="Jewel colour">${JEWELS.map(([k, n, c]) => `<button type="button" class="vsw${f.color === k ? " on" : ""}" data-vcol="${k}" role="radio" aria-checked="${f.color === k}" aria-label="${n}" title="${n}"><svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true">${gem(10, 9, 7, c, k, 1)}</svg></button>`).join("")}</div>
      <div class="actions"><button class="btn primary" type="submit">${j ? "Save" : "Set it up"}</button><button class="btn alt small" type="button" data-vb="${j ? "back" : "close"}">${j ? "Back" : "Not now"}</button>${j ? `<button class="btn alt small" type="button" data-vb="remove">Remove this vault</button>` : ""}</div></form>`;
  }
  const full = isFull(j), log = j.log || [];
  return h + `<h2>${esc(j.label)}</h2><p class="sub">${esc(money(j.amount, cur))} of ${esc(money(j.goal, cur))}${full ? ". Full!" : `, ${esc(money(Math.max(0, j.goal - j.amount), cur))} to go`}</p>
    <div class="vbig${bv.pouring ? " pouring" : ""}${full ? " full" : ""}" id="vBig"><svg viewBox="0 0 160 300" width="160" height="300" aria-hidden="true">${jarArt(j, 120, 290, {id: "big", sparkle: full, cap: !bv.pouring, cur})}</svg><div class="vpour" id="vPour"></div></div>
    <form id="vAdd" class="row vadd"><label class="sr" for="vAmt">Amount</label>${cur ? `<span class="vcur">${esc(cur)}</span>` : ""}<input id="vAmt" type="number" inputmode="decimal" min="0" step="any" placeholder="Amount" value="${esc(bv.amt)}"><button class="btn primary" type="submit" ${bv.pouring ? "disabled" : ""}>Add savings</button></form>
    <div class="actions"><button class="btn alt small" data-vb="out" ${j.amount ? "" : "disabled"}>Take some out</button><button class="btn alt small" data-vb="setup">Change</button><button class="btn alt small" data-vb="empty" ${j.amount ? "" : "disabled"}>Empty the jar</button><button class="btn alt small" data-close="1">Back to the vault</button></div>
    ${log.length ? `<details class="vlog"><summary>History</summary><ul>${log.slice().reverse().slice(0, 12).map(x => `<li><span>${esc(when(x.at))}</span><b>${x.emptied ? "emptied" : (x.amt > 0 ? "+" : "") + esc(money(x.amt, cur))}</b></li>`).join("")}</ul></details>` : ""}`;
}
// Opal's counter: every vault at a glance, with a total
export function bankOverview(F, bankerHere){
  const js = allJars(F), cur = currency(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Your passbook</h2><p class="sub">${bankerHere ? "Opal slides your passbook across the counter." : "Your passbook's on the counter."} Every vault at a glance.</p>
    ${js.length ? `<ul class="hlist vlist">${js.map(j => `<li data-vopen="${j.slot}" role="button" tabindex="0"><span><b>${esc(j.label)}</b><small>${esc(money(j.amount, cur))} of ${esc(money(j.goal, cur))}</small></span><span class="clbar"><i style="width:${Math.round(fillOf(j)*100)}%;background:${colOf(j.color)}"></i></span>${isFull(j) ? `<span class="hbadge now">full</span>` : "<span></span>"}</li>`).join("")}</ul>
      <p class="muted">Saved across every vault: <b>${esc(money(total(F), cur))}</b></p>` : `<p class="muted">No vaults set up yet. Tap any empty jar along the back wall to start one.</p>`}
    <div class="vform vcurrow"><label class="muted" for="vCur">Currency</label>${curPick(F, cur)}</div>`;
}
const readForm = (root, F, bv) => ({label: root.querySelector("#vLabel").value, goal: root.querySelector("#vGoal").value, step: root.querySelector("#vStep").value,
  color: (bv.form && bv.form.color) || ((root.querySelector(".vsw.on") || {}).dataset || {}).vcol || "ruby", cur: (root.querySelector("#vCur") || {}).value ?? currency(F)});
// api: {rerender, save, undoable, poured(jar, nowFull), sfx, close}
export function wireVault(root, F, bv, api){
  const cs = root.querySelector("#vCur");
  if (cs && !root.querySelector("#vForm")) cs.onchange = () => { setCurrency(F, cs.value); api.save(); };   // the passbook's own picker
  if (cs && root.querySelector("#vForm")) cs.onchange = () => { bv.form = readForm(root, F, bv); api.rerender(); };
  root.querySelectorAll("[data-vopen]").forEach(el => { const go = () => { bv.slot = +el.dataset.vopen; bv.mode = "jar"; api.open(); }; el.onclick = go; el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }; });
  root.querySelectorAll("[data-vcol]").forEach(b => b.onclick = () => { bv.form = readForm(root, F, bv); bv.form.color = b.dataset.vcol; api.rerender(); });
  const form = root.querySelector("#vForm");
  if (form) form.onsubmit = ev => { ev.preventDefault(); const f = readForm(root, F, bv); if (!(Number(f.goal) > 0)) { root.querySelector("#vGoal").focus(); return; }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    setupJar(F, bv.slot, f); bv.form = null; bv.mode = "jar"; api.sfx("chime"); api.save(); };
  const amt = root.querySelector("#vAmt"); if (amt) amt.oninput = () => { bv.amt = amt.value; };
  const add = root.querySelector("#vAdd");
  if (add) add.onsubmit = ev => { ev.preventDefault(); const n = r2(amt.value); if (!(n > 0) || bv.pouring) { amt.focus(); return; } if (amt.blur) amt.blur(); pour(root, F, bv, n, api); };
  root.querySelectorAll("[data-vb]").forEach(b => b.onclick = () => {
    const k = b.dataset.vb;
    if (k === "setup") { bv.mode = "setup"; bv.form = null; }
    else if (k === "back") { bv.mode = "jar"; bv.form = null; }
    // takes out the amount typed in the box
    else if (k === "out") { const a = root.querySelector("#vAmt"), n = r2(a && a.value); if (!(n > 0)) { if (a) { a.placeholder = "How much to take out?"; a.focus(); } return; }
      const r = deposit(F, bv.slot, -n); bv.amt = ""; api.sfx("paper"); if (r && r.amt) api.took(r.jar, -r.amt); return api.save(); }
    else if (k === "empty") { const r = emptyJar(F, bv.slot); if (r) { api.sfx("pop"); api.save(); api.undoable("Jar emptied", () => { r(); api.save(); }); } return; }
    else if (k === "remove") { const r = removeJar(F, bv.slot); bv.mode = "jar"; if (r) { api.save(); api.undoable("Vault removed", () => { r(); api.save(); }); } return api.close(); }
    else if (k === "close") return api.close();
    api.rerender();
  });
}
// the pour: jewels tumble from above into the open jar, the level rises, then the cap drops on
function pour(root, F, bv, n, api){
  const j = jarAt(F, bv.slot); if (!j) return;
  const big = root.querySelector("#vBig"), svg = big && big.querySelector("svg"), from = fillOf(j), res = deposit(F, bv.slot, n), to = fillOf(res.jar), c = colOf(j.color), cur = currency(F);
  bv.amt = ""; bv.pouring = true; api.save(true);   // saved straight away (the panel holds still while the jewels pour)
  if (!svg || (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches)) { bv.pouring = false; api.poured(res.jar, res.nowFull); api.rerender(); return; }
  big.classList.add("pouring");
  const capEl = svg.querySelector(".vcap"); if (capEl) capEl.classList.add("lift");
  const drops = Math.min(24, 6 + Math.round(n/Math.max(1, j.step)*3)), box = big.querySelector("#vPour");
  for (let i = 0; i < drops; i++) { const d = document.createElement("span"); d.className = "vdrop"; d.style.left = (44 + Math.random()*52) + "px"; d.style.animationDelay = (i*0.07).toFixed(2) + "s";
    d.innerHTML = `<svg viewBox="0 0 20 20" width="14" height="14">${gem(10, 9, 7, [c, shade(c, .15), shade(c, -.1)][i % 3], j.id, i)}</svg>`; box.appendChild(d); }
  api.sfx("jewels");
  const steps = 18; let k = 0;
  const grow = setInterval(() => { k++; const f = from + (to - from)*(k/steps); svg.innerHTML = jarArt(res.jar, 120, 290, {id: "big", fill: f, cap: false, cur});
    if (k >= steps) { clearInterval(grow); setTimeout(() => { svg.innerHTML = jarArt(res.jar, 120, 290, {id: "big", sparkle: isFull(res.jar), cur}); const cp = svg.querySelector(".vcap"); if (cp) cp.classList.add("drop"); api.sfx("cap");
      setTimeout(() => { bv.pouring = false; box.innerHTML = ""; api.poured(res.jar, res.nowFull); api.rerender(); }, 650); }, 250); } }, 70);
}
