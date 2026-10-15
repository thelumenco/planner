// The welcome screen (phase 5): the picture of Honeybrook, Continue (your last game), the three save slots, and the
// opening story to watch again. Playing another slot puts this one away and reloads into it (slots.js); a new game in
// an empty slot starts with the story and the setup card, as ever. Silent: the music starts in the village.
import { esc } from "../util.js";
import { titleArt } from "../art/title.js";
import { petArt, SPECIES } from "../art/pets.js";
import { NPCS } from "../data/npcs.js";
import { SLOTS, activeSlot, summary, switchTo, wipe } from "./slots.js";

let opts = null, ask = 0;   // ask: the slot whose "delete?" question is showing
const petPic = kind => { const a = petArt(kind), [c1, c2, c3] = SPECIES[kind].cols;
  return `<svg viewBox="12 0 104 122" width="44" height="44" aria-hidden="true" style="--pet1:${c1};--pet2:${c2};--pet3:${c3};overflow:visible"><g>${a.tail}</g><g>${a.body}</g><g>${a.head}</g></svg>`; };
const ago = at => { if (!at) return ""; const d = Math.round((Date.now() - at)/864e5); return d <= 0 ? "played today" : d === 1 ? "played yesterday" : `played ${d} days ago`; };
const nameOf = id => (NPCS.find(n => n.id === id) || {}).name || id;

function card(n){
  const s = summary(n), on = n === activeSlot();
  if (ask === n) return `<div class="ttslot ask"><p><b>Delete slot ${n}?</b> ${s ? `${esc(s.name)}'s game will be gone for good.` : ""}</p>
    <div class="actions"><button type="button" class="btn alt small" data-tt="keep">Keep it</button><button type="button" class="btn small ttdel" data-tt="wipe:${n}">Delete</button></div></div>`;
  if (!s) return `<button type="button" class="ttslot empty" data-tt="play:${n}"><span class="ttn">Slot ${n}</span><b>New game</b><small>A letter from Honeybrook is waiting.</small></button>`;
  const sp = SPECIES[s.pet] ? s.pet : "fox";
  return `<div class="ttslot${on ? " on" : ""}"><button type="button" class="ttplay" data-tt="play:${n}" aria-label="Play slot ${n}: ${esc(s.name)}">${petPic(sp)}<span><span class="ttn">Slot ${n}</span><b>${esc(s.name)} and ${esc(s.petName || SPECIES[sp].n)}</b>
    <small>Day ${s.days || 1} · ${s.coins} coins${s.best ? ` · ${esc(nameOf(s.best.id))} ${"♥".repeat(s.best.hearts)}` : ""}${s.at ? ` · ${ago(s.at)}` : ""}</small></span></button>
    <button type="button" class="ttx" data-tt="ask:${n}" aria-label="Delete slot ${n}">delete</button></div>`;
}
function draw(){
  const box = document.getElementById("welcome"); if (!box) return;
  const cur = summary(activeSlot());
  box.querySelector(".ttcard").innerHTML = `<div class="ttpicbox">${titleArt()}</div><div class="ttbody">
    <h1 class="tttitle">Honeybrook</h1><p class="ttsub">A village, a vineyard, and a little more time.</p>
    ${cur ? `<button type="button" class="btn primary ttgo" data-tt="play:${activeSlot()}">Continue with ${esc(cur.name)}</button>` : ""}
    <p class="eyebrow">Your games</p><div class="ttslots">${Array.from({length: SLOTS}, (_, i) => card(i + 1)).join("")}</div>
    <div class="actions"><button type="button" class="btn alt small" data-tt="story">Watch the story</button></div></div>`;
}
export function closeTitle(){ const box = document.getElementById("welcome"); if (box) { box.hidden = true; box.innerHTML = ""; } opts = null; ask = 0; }
// {play() when the playing slot is chosen, reload(skipTitle) after switching or deleting, story(), save() first}
export function openTitle(o = {}){
  opts = o; ask = 0;
  let box = document.getElementById("welcome");
  if (!box) { box = document.createElement("div"); box.id = "welcome"; box.className = "welcomebox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Honeybrook"); document.body.appendChild(box); }
  box.hidden = false; box.innerHTML = `<div class="ttcard"></div>`;
  box.onclick = ev => { const b = ev.target.closest("[data-tt]"); if (!b) return; const [a, v] = b.dataset.tt.split(":"), n = +v;
    if (a === "ask") { ask = n; draw(); return; }
    if (a === "keep") { ask = 0; draw(); return; }
    if (a === "wipe") { const playing = n === activeSlot(); wipe(n); ask = 0; if (playing) { const o2 = opts; closeTitle(); o2.reload(false); return; } draw(); return; }
    if (a === "story") { opts.story && opts.story(); return; }
    if (a === "play") { const o2 = opts; if (n === activeSlot()) { closeTitle(); o2.play(); return; } if (o2.save) o2.save(); if (switchTo(n)) { closeTitle(); o2.reload(true); } } };
  draw();
}
export const titleOpen = () => !!opts;
