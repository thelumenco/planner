// Emotion jars (Mel's room): fill a jar with up to 10 blobs from up to 4 emotions, add a short note, and keep it on
// the shelf (two rows of five). A jar can be emptied, or its memory sent to the journal as a polaroid + note.
// Private doc "jars" in the per-user collection: {jars:[{id, at, slot, blobs:[emotionId...], note} | {id, at, deleted}],
// custom:[{id, name, color, at}], updatedAt}. Jars merge by id across devices (newest change wins, like the journal).
// Colours: validated so every pair is distinct for normal vision; names always show beside them. Blobs are soft:
// no outline and no symbol (Mel asked for soft blobs).
import { esc, plain } from "../util.js";

export const EMOTIONS = [
  {id: "joy", name: "Joy", color: "#f7cf1d", mark: "sun"}, {id: "sad", name: "Sadness", color: "#2a78d6", mark: "drop"},
  {id: "anger", name: "Anger", color: "#c42b3a", mark: "zig"}, {id: "fear", name: "Fear", color: "#4a3aa7", mark: "wave"},
  {id: "disgust", name: "Disgust", color: "#008300", mark: "squig"}, {id: "calm", name: "Calm", color: "#1baf7a", mark: "line"},
  {id: "love", name: "Love", color: "#f08fb4", mark: "heart"}, {id: "anxious", name: "Anxious", color: "#ea6a1f", mark: "dots"},
  {id: "tired", name: "Tired", color: "#8a8a93", mark: "z"}, {id: "proud", name: "Proud", color: "#7a4a1e", mark: "star"}];
export const CUSTOM_COLOURS = ["#0e6b73", "#7d2d6b", "#7fb8e8", "#a6c832", "#e0a46b", "#3b3b44", "#c9a3e8", "#5c8a3a"];
export const MAX_BLOBS = 10, MAX_KINDS = 4, SLOTS = 10;

const KEY = "fox.jars";
const load = () => { try { return Object.assign({jars: [], custom: [], updatedAt: 0}, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { return {jars: [], custom: [], updatedAt: 0}; } };
let D = load(), ref = null, chain = Promise.resolve(), onChange = () => {};
const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch {} };
function merge(a, b){
  const by = (xs, ys) => { const m = new Map(); [...(xs || []), ...(ys || [])].forEach(e => { if (!e || !e.id) return; const o = m.get(e.id); if (!o || (e.at || 0) > (o.at || 0)) m.set(e.id, e); }); return [...m.values()]; };
  return {jars: by(a.jars, b && b.jars).slice(-60), custom: by(a.custom, b && b.custom).slice(-24), updatedAt: Math.max(a.updatedAt || 0, (b && b.updatedAt) || 0)};
}
export function attachJars(col, changed){
  onChange = changed; ref = col.doc("jars");
  ref.onSnapshot(snap => { if (!snap.exists) { if (D.jars.length || D.custom.length) push(); return; } D = merge(D, JSON.parse(JSON.stringify(snap.data() || {}))); keep(); onChange(); }, () => {});
}
function push(){ if (!ref) return; chain = chain.then(async () => { try { const cur = await ref.get(); if (cur.exists) D = merge(D, JSON.parse(JSON.stringify(cur.data() || {}))); await ref.set(JSON.parse(JSON.stringify(D))); } catch {} }); }
const commit = () => { D.updatedAt = Date.now(); keep(); push(); onChange(); };

export const palette = () => [...EMOTIONS, ...D.custom.filter(c => !c.deleted).map(c => ({id: c.id, name: c.name, color: c.color, mark: "dot", custom: true}))];
export const emo = id => palette().find(e => e.id === id) || {id, name: "Feeling", color: "#B9B0A4", mark: "dot"};
export const shelf = () => { const s = Array(SLOTS).fill(null); D.jars.filter(j => !j.deleted && j.slot != null).forEach(j => { if (j.slot >= 0 && j.slot < SLOTS && !s[j.slot]) s[j.slot] = j; }); return s; };
export const jarById = id => D.jars.find(j => j.id === id && !j.deleted) || null;
export const freeSlot = () => shelf().findIndex(x => !x);
export function addCustom(name, color){
  name = plain(String(name || "")).trim().slice(0, 20); if (!name) return null;
  const c = {id: "c" + Date.now().toString(36), name: name[0].toUpperCase() + name.slice(1), color: CUSTOM_COLOURS.includes(color) ? color : CUSTOM_COLOURS[0], at: Date.now()};
  D.custom.push(c); commit(); return c;
}
export function makeJar(blobs, note){
  const slot = freeSlot(); if (slot < 0 || !blobs.length) return null;
  const j = {id: "j" + Date.now().toString(36), at: Date.now(), slot, blobs: blobs.slice(0, MAX_BLOBS), note: plain(String(note || "")).trim().slice(0, 280),
    colors: Object.fromEntries([...new Set(blobs)].map(id => { const e = emo(id); return [id, {name: e.name, color: e.color, mark: e.mark}]; }))};
  D.jars.push(j); commit(); return j;
}
// empty a jar (kept as a marker so it doesn't come back from another device); restore() undoes it
export function emptyJar(id){
  const j = jarById(id); if (!j) return null;
  D.jars = D.jars.map(x => x.id === id ? {id, at: Date.now(), deleted: true} : x); commit();
  return () => { if (shelf()[j.slot]) { const s = freeSlot(); if (s < 0) return; j.slot = s; } D.jars = D.jars.map(x => x.id === id ? Object.assign({}, j, {at: Date.now()}) : x); commit(); };
}

/* ---------- drawing ---------- */
// Blob positions inside the jar: stacked from the bottom in rows of 3/4, a little jitter from the jar id
const rnd = (seed, i) => { let h = 2166136261; for (const ch of seed + ":" + i) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000)/1000; };
// A soft blob: no outline, no symbol. A lighter centre, a gentle shade at the bottom and a small highlight.
// A soft, flat blob: a slightly lumpy shape (each one its own, from the seed) in one flat colour.
// No shine, shading or outline: the game is 2D.
const softBlob = (x, y, r, color, sq = 1.12, seed = "") => {
  const n = 9, pts = Array.from({length: n}, (_, i) => { const a = i/n*Math.PI*2, k = 1 + (rnd(seed + "b", i) - .5)*.22; return [x + Math.cos(a)*r*sq*k, y + Math.sin(a)*r*k]; });
  const mid = (p, q) => [(p[0] + q[0])/2, (p[1] + q[1])/2], f = v => v.toFixed(1);
  let d = `M${mid(pts[n - 1], pts[0]).map(f).join(" ")}`; pts.forEach((p, i) => { const m = mid(p, pts[(i + 1) % n]); d += ` Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`; });
  return `<path d="${d}z" fill="${color}" opacity=".88"/>`;
};
// A jar in a 60 x 80 box: glass, cork lid, blobs. `col(id)` gives {color, mark} for an emotion id.
export function jarArt(jar, opts = {}){
  const blobs = (jar && jar.blobs) || [], col = id => (jar && jar.colors && jar.colors[id]) || emo(id), seed = (jar && jar.id) || "new";
  // rows of 3 and 2, nested like real blobs settling: ten blobs fill the jar to the shoulder
  const pos = []; for (let i = 0, row = 0, k = 0; i < blobs.length; i++) { const per = row % 2 ? 2 : 3; pos.push([14 + (k + (row % 2 ? .5 : 0))*16 + (rnd(seed, i) - .5)*3, 68 - row*12.5 + (rnd(seed, i + 50) - .5)*2]); if (++k >= per) { k = 0; row++; } }
  const b = blobs.map((id, i) => { const c = col(id), [x, y] = pos[i], r = 7.6 + rnd(seed, i + 9)*.9; return `<g class="${opts.anim && i === blobs.length - 1 ? "blobdrop" : ""}">${softBlob(x, y, r, c.color, 1.1, seed + i)}</g>`; }).join("");
  const glow = blobs.length ? `<ellipse cx="30" cy="62" rx="24" ry="20" fill="${col(blobs[blobs.length - 1]).color}" opacity=".12"/>` : "";
  return `<g class="jar">${glow}<path d="M8.5 20 q-4 4.6 -3.6 10.8 q.9 19.5 -.2 39.4 q.3 7.1 7.4 7.3 q18.4 .9 36.6 -.4 q6.6 -.4 6.7 -7.2 q-.9 -20.2 .3 -40.1 q-.3 -6.1 -3.4 -10z" fill="rgba(220,235,245,.42)" stroke="var(--line, #3b3530)" stroke-width="1.4" stroke-linejoin="round"/>${b}
    <path d="M10.5 25 q-.8 19 .2 38" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2.2" stroke-linecap="round"/><path d="M10.2 12.6 q20 -1.4 39.8 .6 l.4 8.2 q-20 1 -40.4 -.4z" fill="#C9A27E" stroke="var(--line, #3b3530)" stroke-width="1.3" stroke-linejoin="round"/><path d="M14 16.8 q16 -.8 32 .2" fill="none" stroke="rgba(47,43,40,.25)" stroke-width="1"/></g>`;
}
export const jarSVG = (jar, size = 60, opts) => `<svg class="jarsvg" viewBox="0 0 60 80" width="${size}" height="${Math.round(size*4/3)}" aria-hidden="true">${jarArt(jar, opts)}</svg>`;
export const jarLabel = j => [...new Set(j.blobs)].map(id => { const n = j.blobs.filter(x => x === id).length, e = (j.colors && j.colors[id]) || emo(id); return `${e.name}${n > 1 ? " ×" + n : ""}`; }).join(", ");
const when = at => new Date(at).toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Singapore"});

/* ---------- panels ---------- */
// view: {mode: "shelf"|"make"|"jar", id, blobs:[], note, adding, customName, customColor}
export function jarsPanel(v){
  const s = shelf(), full = freeSlot() < 0;
  if (v.mode === "make") {
    const kinds = [...new Set(v.blobs)], pal = palette();
    return `<span class="tape gingham" aria-hidden="true"></span><h2>Make a jar</h2><p class="sub">Tap a feeling to drop a blob in. Up to ${MAX_BLOBS} blobs, from up to ${MAX_KINDS} feelings.</p>
      <div class="jarmake"><div class="jarbig">${jarSVG({id: "new", blobs: v.blobs}, 120, {anim: true})}<p class="muted">${v.blobs.length}/${MAX_BLOBS} ${v.blobs.length ? "· " + esc(jarLabel({blobs: v.blobs})) : ""}</p>${v.blobs.length ? `<button class="btn alt small" data-jar="unblob">Undo last blob</button>` : ""}</div>
      <div class="emos">${pal.map(e => { const off = v.blobs.length >= MAX_BLOBS || (!kinds.includes(e.id) && kinds.length >= MAX_KINDS);
        return `<button class="emo" data-emo="${esc(e.id)}" ${off ? "disabled" : ""}><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">${softBlob(12, 12, 8.6, e.color, 1.06, e.id)}</svg><span>${esc(e.name)}</span></button>`; }).join("")}
        <button class="emo add${v.adding ? " on" : ""}" data-jar="custom" aria-expanded="${!!v.adding}"><span class="plus">+</span><span>Your own</span></button></div></div>
      ${kinds.length >= MAX_KINDS && v.blobs.length < MAX_BLOBS ? `<p class="jhint">This jar has ${MAX_KINDS} feelings, the most it holds, so the others are resting. Tap one of these four for more, or undo a blob to swap one out.</p>` : v.blobs.length >= MAX_BLOBS ? `<p class="jhint">The jar's full. Put it on the shelf, or undo a blob to change it.</p>` : ""}
      ${v.added ? `<p class="jhint">${esc(v.added)} is in your feelings now. Tap it to drop a blob in.</p>` : ""}
      ${v.adding ? (() => { const name = String(v.customName || "").trim(), col = v.customColor || "", ready = !!(name && col);
        return `<form class="jcustom" id="jcForm" novalidate><p class="eyebrow">Your own feeling</p>
        <div class="jcrow"><span class="jcprev" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30">${col ? softBlob(12, 12, 8.6, col, 1.06, col) : `<circle cx="12" cy="12" r="8.6" fill="none" stroke="#B9B0A4" stroke-width="1.2" stroke-dasharray="2.5 2.5"/>`}</svg></span>
          <label class="sr" for="jcName">1. Name it</label><input id="jcName" maxlength="20" placeholder="1. Name it, e.g. Overwhelmed" value="${esc(v.customName || "")}" enterkeyhint="next" autocomplete="off"></div>
        <p class="muted jcstep">2. Pick its colour</p><div class="swatches" role="radiogroup" aria-label="Colour">${CUSTOM_COLOURS.map(c => `<button type="button" class="sw${col === c ? " on" : ""}" data-sw="${c}" style="background:${c}" role="radio" aria-checked="${col === c}" aria-label="colour ${c}"></button>`).join("")}</div>
        ${v.customWarn ? `<p class="jhint">${esc(v.customWarn)}</p>` : ""}
        <div class="actions"><button class="btn small" type="submit" ${ready ? "" : "aria-disabled=\"true\""}>Add feeling</button><button class="btn alt small" type="button" data-jar="custom">Cancel</button></div></form>`; })() : ""}
      <label class="sr" for="jNote">A short note</label><textarea id="jNote" class="jnote" rows="2" maxlength="280" placeholder="A short note, if you like: what happened, what you need...">${esc(v.note || "")}</textarea>
      <div class="actions"><button class="btn primary" data-jar="place" ${v.blobs.length && !full ? "" : "disabled"}>Put it on the shelf</button><button class="btn alt small" data-jar="shelf">Back to the shelf</button></div>
      ${full ? `<p class="muted">The shelf's full. Empty a jar or send one to your journal first.</p>` : ""}`;
  }
  if (v.mode === "jar") {
    const j = jarById(v.id); if (!j) return jarsPanel({mode: "shelf"});
    return `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(when(j.at))}</h2>
      <div class="jardetail">${jarSVG(j, 110)}<div><p class="sub">${esc(jarLabel(j))}</p>${j.note ? `<p class="jnotecard">${esc(j.note)}</p>` : `<p class="muted">No note in this one.</p>`}</div></div>
      <div class="actions"><button class="btn primary small" data-jar="send" data-id="${esc(j.id)}">Send to my journal</button><button class="btn alt small" data-jar="empty" data-id="${esc(j.id)}">Empty this jar</button><button class="btn alt small" data-jar="shelf">Back to the shelf</button></div>`;
  }
  // shelf
  const row = r => `<div class="jrow">${s.slice(r*5, r*5 + 5).map((j, i) => j ? `<button class="jslot" data-jarid="${esc(j.id)}" aria-label="Jar from ${esc(when(j.at))}: ${esc(jarLabel(j))}">${jarSVG(j, 52)}<small>${esc(new Date(j.at).toLocaleDateString("en-GB", {day: "numeric", month: "short", timeZone: "Asia/Singapore"}))}</small></button>` : `<span class="jslot empty" aria-hidden="true"><svg viewBox="0 0 60 80" width="52" height="69"><ellipse cx="30" cy="74" rx="18" ry="3" fill="rgba(120,104,84,.15)"/></svg><small>&nbsp;</small></span>`).join("")}</div>`;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Emotion shelf</h2><p class="sub">${s.filter(Boolean).length ? "Tap a jar to read its note." : "Feelings, kept safe in jars. Make your first one."}</p>
    <div class="jshelf">${row(0)}<div class="jplank"></div>${row(1)}<div class="jplank"></div></div>
    <div class="actions"><button class="btn primary" data-jar="make">${full ? "Make a jar (shelf full)" : "Make a jar"}</button></div>
    ${full ? `<p class="muted">The shelf's full. Tap a jar to empty it or send it to your journal, then make a new one.</p>` : ""}`;
}
