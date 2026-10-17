// Emotion jars (round 227), on the shelf in your own room: fill a jar with up to 10 blobs from up to 4 feelings,
// add a short note if you like, and keep it on the shelf (two rows of five) to look back on. A jar can be taken off
// the shelf again (Undo puts it back). Add your own feelings, each with its own colour.
// State: F.jars = {jars: [{id, at, slot, blobs: [feeling id], note, colors: {id: {name, color}}}], custom: [{id, name, color, at}]}.
// Colours are picked so every pair is distinct; names always show beside them. Blobs are flat and soft: no outline.
import { esc, plain, now } from "../util.js";

export const EMOTIONS = [
  {id: "joy", name: "Joy", color: "#f7cf1d"}, {id: "sad", name: "Sadness", color: "#2a78d6"},
  {id: "anger", name: "Anger", color: "#c42b3a"}, {id: "fear", name: "Fear", color: "#4a3aa7"},
  {id: "disgust", name: "Disgust", color: "#008300"}, {id: "calm", name: "Calm", color: "#1baf7a"},
  {id: "love", name: "Love", color: "#f08fb4"}, {id: "anxious", name: "Anxious", color: "#ea6a1f"},
  {id: "tired", name: "Tired", color: "#8a8a93"}, {id: "proud", name: "Proud", color: "#7a4a1e"}];
export const CUSTOM_COLOURS = ["#0e6b73", "#7d2d6b", "#7fb8e8", "#a6c832", "#e0a46b", "#3b3b44", "#c9a3e8", "#5c8a3a"];
export const MAX_BLOBS = 10, MAX_KINDS = 4, SLOTS = 10, MAX_CUSTOM = 24;

export function jarsState(F){ const D = F.jars = (F.jars && typeof F.jars === "object" && !Array.isArray(F.jars)) ? F.jars : {};
  D.jars = Array.isArray(D.jars) ? D.jars : []; D.custom = Array.isArray(D.custom) ? D.custom : []; return D; }
export const palette = F => [...EMOTIONS, ...jarsState(F).custom.map(c => ({id: c.id, name: c.name, color: c.color, custom: true}))];
export const emo = (F, id) => palette(F).find(e => e.id === id) || {id, name: "Feeling", color: "#B9B0A4"};
export const shelf = F => { const s = Array(SLOTS).fill(null); jarsState(F).jars.forEach(j => { if (j.slot >= 0 && j.slot < SLOTS && !s[j.slot]) s[j.slot] = j; }); return s; };
export const jarById = (F, id) => jarsState(F).jars.find(j => j.id === id) || null;
export const freeSlot = F => shelf(F).findIndex(x => !x);
export function addCustom(F, name, color, at = now()){
  const D = jarsState(F); name = plain(String(name || "")).trim().slice(0, 20); if (!name || D.custom.length >= MAX_CUSTOM) return null;
  const same = palette(F).find(e => e.name.toLowerCase() === name.toLowerCase()); if (same) return same;
  const c = {id: "c" + at.toString(36) + Math.floor(Math.random()*1e3).toString(36), name: name[0].toUpperCase() + name.slice(1), color: CUSTOM_COLOURS.includes(color) ? color : CUSTOM_COLOURS[0], at};
  D.custom.push(c); return c;
}
// can this feeling go in (with these blobs already in)?
export const canDrop = (blobs, id) => blobs.length < MAX_BLOBS && (blobs.includes(id) || new Set(blobs).size < MAX_KINDS);
export function makeJar(F, blobs, note, at = now()){
  const slot = freeSlot(F); blobs = (blobs || []).filter(Boolean).slice(0, MAX_BLOBS);
  if (slot < 0 || !blobs.length || new Set(blobs).size > MAX_KINDS) return null;
  const j = {id: "j" + at.toString(36) + Math.floor(Math.random()*1e3).toString(36), at, slot, blobs, note: plain(String(note || "")).trim().slice(0, 280),
    colors: Object.fromEntries([...new Set(blobs)].map(id => { const e = emo(F, id); return [id, {name: e.name, color: e.color}]; }))};
  jarsState(F).jars.push(j); return j;
}
// take a jar off the shelf; returns restore() for Undo (back in its place, or the next free one)
export function removeJar(F, id){
  const D = jarsState(F), i = D.jars.findIndex(j => j.id === id); if (i < 0) return null; const [gone] = D.jars.splice(i, 1);
  return () => { const E = jarsState(F); if (E.jars.some(j => j.id === gone.id)) return; if (shelf(F)[gone.slot]) { const s = freeSlot(F); if (s < 0) return; gone.slot = s; } E.jars.push(gone); };
}

/* ---------- drawing ---------- */
const rnd = (seed, i) => { let h = 2166136261; for (const ch of seed + ":" + i) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000)/1000; };
// A soft, flat blob: a slightly lumpy shape (each one its own, from the seed) in one flat colour. No shine or outline.
export const softBlob = (x, y, r, color, sq = 1.12, seed = "") => {
  const n = 9, pts = Array.from({length: n}, (_, i) => { const a = i/n*Math.PI*2, k = 1 + (rnd(seed + "b", i) - .5)*.22; return [x + Math.cos(a)*r*sq*k, y + Math.sin(a)*r*k]; });
  const mid = (p, q) => [(p[0] + q[0])/2, (p[1] + q[1])/2], f = v => v.toFixed(1);
  let d = `M${mid(pts[n - 1], pts[0]).map(f).join(" ")}`; pts.forEach((p, i) => { const m = mid(p, pts[(i + 1) % n]); d += ` Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`; });
  return `<path d="${d}z" fill="${color}" opacity=".88"/>`;
};
// A jar in a 60 x 80 box: hand-drawn glass, a cork lid, the blobs. `look(id)` gives {color} for a feeling id.
export function jarArt(jar, opts = {}, look){
  const blobs = (jar && jar.blobs) || [], col = id => (jar && jar.colors && jar.colors[id]) || (look ? look(id) : null) || {color: "#B9B0A4"}, seed = (jar && jar.id) || "new";
  // rows of 3 and 2, nested like real blobs settling: ten blobs fill the jar to the shoulder
  const pos = []; for (let i = 0, row = 0, k = 0; i < blobs.length; i++) { const per = row % 2 ? 2 : 3; pos.push([14 + (k + (row % 2 ? .5 : 0))*16 + (rnd(seed, i) - .5)*3, 68 - row*12.5 + (rnd(seed, i + 50) - .5)*2]); if (++k >= per) { k = 0; row++; } }
  const b = blobs.map((id, i) => { const c = col(id), [x, y] = pos[i], r = 7.6 + rnd(seed, i + 9)*.9; return `<g class="${opts.anim && i === blobs.length - 1 ? "blobdrop" : ""}">${softBlob(x, y, r, c.color, 1.1, seed + i)}</g>`; }).join("");
  const glow = blobs.length ? `<ellipse cx="30" cy="62" rx="24" ry="20" fill="${col(blobs[blobs.length - 1]).color}" opacity=".12"/>` : "";
  return `<g class="jar">${glow}<path d="M8.5 20 q-4 4.6 -3.6 10.8 q.9 19.5 -.2 39.4 q.3 7.1 7.4 7.3 q18.4 .9 36.6 -.4 q6.6 -.4 6.7 -7.2 q-.9 -20.2 .3 -40.1 q-.3 -6.1 -3.4 -10z" fill="rgba(220,235,245,.42)" stroke="var(--line, #3b3530)" stroke-width="1.4" stroke-linejoin="round"/>${b}
    <path d="M10.5 25 q-.8 19 .2 38" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2.2" stroke-linecap="round"/><path d="M10.2 12.6 q20 -1.4 39.8 .6 l.4 8.2 q-20 1 -40.4 -.4z" fill="#C9A27E" stroke="var(--line, #3b3530)" stroke-width="1.3" stroke-linejoin="round"/><path d="M14 16.8 q16 -.8 32 .2" fill="none" stroke="rgba(47,43,40,.25)" stroke-width="1"/></g>`;
}
const jarSVG = (F, jar, size = 60, opts) => `<svg class="jarsvg" viewBox="0 0 60 80" width="${size}" height="${Math.round(size*4/3)}" aria-hidden="true">${jarArt(jar, opts, id => emo(F, id))}</svg>`;
export const jarLabel = (F, j) => [...new Set(j.blobs)].map(id => { const n = j.blobs.filter(x => x === id).length, e = (j.colors && j.colors[id]) || emo(F, id); return `${e.name}${n > 1 ? " ×" + n : ""}`; }).join(", ");
const when = at => new Date(at).toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short"});
const short = at => new Date(at).toLocaleDateString("en-GB", {day: "numeric", month: "short"});

/* ---------- panels ---------- */
// view: {mode: "shelf"|"make"|"jar", id, blobs:[], note, adding, customName, customColor, customWarn, added}
export const freshView = () => ({mode: "shelf", blobs: [], note: ""});
export function jarsPanel(F, v){
  const s = shelf(F), full = freeSlot(F) < 0, tape = `<span class="tape gingham" aria-hidden="true"></span>`;
  if (v.mode === "make") {
    const kinds = [...new Set(v.blobs)], pal = palette(F);
    return tape + `<h2>Make a jar</h2><p class="sub">Tap a feeling to drop a blob in. Up to ${MAX_BLOBS} blobs, from up to ${MAX_KINDS} feelings.</p>
      <div class="jarmake"><div class="jarbig">${jarSVG(F, {id: "new", blobs: v.blobs}, 120, {anim: true})}<p class="muted">${v.blobs.length}/${MAX_BLOBS}${v.blobs.length ? ": " + esc(jarLabel(F, {blobs: v.blobs})) : ""}</p>${v.blobs.length ? `<button class="btn alt small" data-jar="unblob">Undo last blob</button>` : ""}</div>
      <div class="emos">${pal.map(e => `<button class="emo" data-emo="${esc(e.id)}" ${canDrop(v.blobs, e.id) ? "" : "disabled"}><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">${softBlob(12, 12, 8.6, e.color, 1.06, e.id)}</svg><span>${esc(e.name)}</span></button>`).join("")}
        <button class="emo add${v.adding ? " on" : ""}" data-jar="custom" aria-expanded="${!!v.adding}"><span class="plus">+</span><span>Your own</span></button></div></div>
      ${kinds.length >= MAX_KINDS && v.blobs.length < MAX_BLOBS ? `<p class="jhint">This jar has ${MAX_KINDS} feelings, the most it holds, so the others are resting. Tap one of these four for more, or undo a blob to swap one out.</p>` : v.blobs.length >= MAX_BLOBS ? `<p class="jhint">The jar's full. Put it on the shelf, or undo a blob to change it.</p>` : ""}
      ${v.added ? `<p class="jhint">${esc(v.added)} is one of your feelings now. Tap it to drop a blob in.</p>` : ""}
      ${v.adding ? (() => { const name = String(v.customName || "").trim(), col = v.customColor || "", ready = !!(name && col);
        return `<form class="jcustom" id="jcForm" novalidate><p class="eyebrow">Your own feeling</p>
        <div class="jcrow"><span class="jcprev" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30">${col ? softBlob(12, 12, 8.6, col, 1.06, col) : `<circle cx="12" cy="12" r="8.6" fill="none" stroke="#B9B0A4" stroke-width="1.2" stroke-dasharray="2.5 2.5"/>`}</svg></span>
          <label class="sr" for="jcName">1. Name it</label><input id="jcName" maxlength="20" placeholder="1. Name it, e.g. Hopeful" value="${esc(v.customName || "")}" enterkeyhint="next" autocomplete="off"></div>
        <p class="muted jcstep">2. Pick its colour</p><div class="swatches" role="radiogroup" aria-label="Colour">${CUSTOM_COLOURS.map((c, i) => `<button type="button" class="sw${col === c ? " on" : ""}" data-sw="${c}" style="background:${c}" role="radio" aria-checked="${col === c}" aria-label="Colour ${i + 1}"></button>`).join("")}</div>
        ${v.customWarn ? `<p class="jhint">${esc(v.customWarn)}</p>` : ""}
        <div class="actions"><button class="btn small" type="submit" ${ready ? "" : "aria-disabled=\"true\""}>Add feeling</button><button class="btn alt small" type="button" data-jar="custom">Cancel</button></div></form>`; })() : ""}
      <label class="sr" for="jNote">A short note</label><textarea id="jNote" class="jnote" rows="2" maxlength="280" placeholder="A short note, if you like: what happened, what you need...">${esc(v.note || "")}</textarea>
      <div class="actions"><button class="btn primary" data-jar="place" ${v.blobs.length && !full ? "" : "disabled"}>Put it on the shelf</button><button class="btn alt small" data-jar="shelf">Back to the shelf</button></div>
      ${full ? `<p class="muted">The shelf's full. Take a jar down first.</p>` : ""}`;
  }
  if (v.mode === "jar") {
    const j = jarById(F, v.id); if (!j) return jarsPanel(F, {mode: "shelf", blobs: []});
    const mine = shelf(F).filter(Boolean).sort((a, b) => a.at - b.at), i = mine.findIndex(x => x.id === j.id);
    return tape + `<h2>${esc(when(j.at))}</h2>
      <div class="jardetail">${jarSVG(F, j, 110)}<div><p class="sub">${esc(jarLabel(F, j))}</p>${j.note ? `<p class="jnotecard">${esc(j.note)}</p>` : `<p class="muted">No note in this one.</p>`}</div></div>
      <div class="actions">${mine.length > 1 ? `<button class="btn alt small" data-jar="prev" data-id="${esc(mine[(i - 1 + mine.length) % mine.length].id)}">Older</button><button class="btn alt small" data-jar="next" data-id="${esc(mine[(i + 1) % mine.length].id)}">Newer</button>` : ""}<button class="btn alt small" data-jar="remove" data-id="${esc(j.id)}">Take it off the shelf</button><button class="btn alt small" data-jar="shelf">Back to the shelf</button></div>`;
  }
  // the shelf
  const row = r => `<div class="jrow">${s.slice(r*5, r*5 + 5).map(j => j ? `<button class="jslot" data-jarid="${esc(j.id)}" aria-label="Jar from ${esc(when(j.at))}: ${esc(jarLabel(F, j))}">${jarSVG(F, j, 52)}<small>${esc(short(j.at))}</small></button>` : `<span class="jslot empty" aria-hidden="true"><svg viewBox="0 0 60 80" width="52" height="69"><ellipse cx="30" cy="74" rx="18" ry="3" fill="rgba(120,104,84,.15)"/></svg><small>&nbsp;</small></span>`).join("")}</div>`;
  return tape + `<h2>Emotion shelf</h2><p class="sub">${s.filter(Boolean).length ? "Tap a jar to look back at it." : "Feelings, kept safe in jars. Make your first one."}</p>
    <div class="jshelf">${row(0)}<div class="jplank"></div>${row(1)}<div class="jplank"></div></div>
    <div class="actions"><button class="btn primary" data-jar="make" ${full ? "disabled" : ""}>${full ? "Make a jar (the shelf's full)" : "Make a jar"}</button></div>
    ${full ? `<p class="muted">The shelf's full. Tap a jar to take it down, then make a new one.</p>` : ""}`;
}
// api: {rerender, save, undoable, sfx, placed(jar)}
export function wireJars(c, F, v, api){
  const set = o => { Object.keys(v).forEach(k => delete v[k]); Object.assign(v, o); };
  const note = c.querySelector("#jNote"); if (note) note.oninput = () => { v.note = note.value; };
  c.querySelectorAll("[data-emo]").forEach(b => b.onclick = () => { const id = b.dataset.emo; if (!canDrop(v.blobs, id)) return; if (note) v.note = note.value; v.blobs.push(id); v.added = ""; api.sfx("tap"); api.rerender(); });
  c.querySelectorAll("[data-jarid]").forEach(b => b.onclick = () => { set({mode: "jar", id: b.dataset.jarid, blobs: [], note: ""}); api.sfx("paper"); api.rerender(); });
  const jn = c.querySelector("#jcName"); if (jn) jn.oninput = () => { v.customName = jn.value; v.customWarn = ""; };
  if (jn) jn.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); const f = c.querySelector("#jcForm"); if (f) f.requestSubmit ? f.requestSubmit() : f.onsubmit(e); } };
  c.querySelectorAll("[data-sw]").forEach(b => b.onclick = () => { if (jn) v.customName = jn.value; v.customColor = b.dataset.sw; v.customWarn = ""; api.rerender(); });
  // adding a feeling never drops a blob in: it joins the picker, to tap like any other
  const cf = c.querySelector("#jcForm"); if (cf) cf.onsubmit = ev => { ev.preventDefault(); if (jn) v.customName = jn.value;
    const name = String(v.customName || "").trim();
    if (!name) { v.customWarn = "Give it a name first."; api.rerender(); const n = c.querySelector("#jcName"); if (n) n.focus(); return; }
    if (!v.customColor) { if (jn) jn.blur(); v.customWarn = "Now pick a colour for it."; api.rerender(); return; }
    const e = addCustom(F, name, v.customColor); if (e) { if (jn) jn.blur(); v.adding = false; v.customName = ""; v.customColor = ""; v.customWarn = ""; v.added = e.name; api.sfx("tap"); api.save(); } };
  c.querySelectorAll("[data-jar]").forEach(b => b.onclick = () => {
    const k = b.dataset.jar, id = b.dataset.id;
    if (note) v.note = note.value;
    if (k === "make") set({mode: "make", blobs: [], note: ""});
    else if (k === "shelf") set({mode: "shelf", blobs: [], note: ""});
    else if (k === "prev" || k === "next") set({mode: "jar", id, blobs: [], note: ""});
    else if (k === "unblob") v.blobs.pop();
    else if (k === "custom") { v.adding = !v.adding; v.customWarn = ""; v.added = ""; if (v.adding) setTimeout(() => { const f = c.querySelector("#jcForm"); if (f && f.scrollIntoView) f.scrollIntoView({block: "nearest", behavior: "smooth"}); }, 30); }
    else if (k === "place") { const j = makeJar(F, v.blobs, v.note); if (!j) return; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); set({mode: "shelf", blobs: [], note: ""}); api.placed(j); return api.save(); }
    else if (k === "remove") { const r = removeJar(F, id); if (r) { set({mode: "shelf", blobs: [], note: ""}); api.save(); api.undoable("Jar taken off the shelf", () => { r(); api.save(); }); } return; }
    api.rerender();
  });
}
