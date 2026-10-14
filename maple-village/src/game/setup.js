// The start of a new game (phase 4 of the public edition): your name and pronouns, how you look, and your pet.
// Three calm pages on one card. The pet page only shows for a new game: the species is yours for the whole game
// (its name can change later, in the settings). "Change my look" in the wardrobe reopens the look page on its own.
// Writes F.me = {name, pron: {they, them, their}, look} and, for a new game, F.pet (the species) and F.name (its name).
import { esc } from "../util.js";
import { BODIES, SKINS, HAIRS, STYLES, TOPS, BOTTOMS, LEGS, START, lookOf, applyLook } from "./look.js";
import { SPECIES, KINDS, petArt } from "../art/pets.js";
import { PRONOUNS } from "./me.js";

let st = null;   // the card's working copy while it's open

const chips = (key, list, cur) => `<div class="gchips" role="radiogroup">${list.map(([v, n]) => `<button type="button" class="gchip${v === cur ? " on" : ""}" data-su="${key}:${v}" aria-pressed="${v === cur}"><span>${esc(n)}</span></button>`).join("")}</div>`;
const swatches = (key, list, cur, label) => `<div class="swatches" role="radiogroup" aria-label="${esc(label)}">${list.map((c, i) => `<button type="button" class="sw${c === cur ? " on" : ""}" data-su="${key}:${c}" aria-pressed="${c === cur}" aria-label="${esc(label)} ${i + 1}" style="background:${c}"></button>`).join("")}</div>`;
// a pet portrait, sitting (the same drawing as the backpack panel's)
const petSvg = (kind, size) => { const a = petArt(kind), [c1, c2, c3] = SPECIES[kind].cols;
  return `<svg viewBox="12 0 104 122" width="${size}" height="${size}" aria-hidden="true" style="--pet1:${c1};--pet2:${c2};--pet3:${c3};overflow:visible"><g>${a.tail}</g><g>${a.body}</g><g>${a.head}</g></svg>`; };

function page(){
  const s = st;
  if (s.page === "you") return `<p class="eyebrow">Welcome to Honeybrook</p><h2>Who's moving in?</h2>
    <label class="sulabel" for="suName">Your name</label><input id="suName" class="suinput" maxlength="24" autocomplete="off" value="${esc(s.name)}" placeholder="what the village calls you">
    <p class="sulabel">Your pronouns</p>${chips("pron", Object.entries(PRONOUNS).map(([k, p]) => [k, p.label]).concat([["own", "My own"]]), s.pron)}
    ${s.pron === "own" ? `<div class="row suown"><input id="suThey" class="suinput" maxlength="12" placeholder="xe" value="${esc(s.own.they)}" aria-label="Subject pronoun, like she, he or they"><input id="suThem" class="suinput" maxlength="12" placeholder="xem" value="${esc(s.own.them)}" aria-label="Object pronoun, like her, him or them"><input id="suTheir" class="suinput" maxlength="12" placeholder="xyr" value="${esc(s.own.their)}" aria-label="Possessive, like her, his or their"></div>` : ""}
    <div class="actions"><button type="button" class="btn primary" data-su="go:look" ${s.name.trim() ? "" : "disabled"}>Next: how you look</button></div>`;
  if (s.page === "look") { const L = s.look;
    return `<p class="eyebrow">${s.lookOnly ? "The wardrobe" : "Step 2 of 3"}</p><h2>How you look</h2>
      <div class="sulook"><svg class="suprev" viewBox="-22 -70 44 74" width="120" height="200" aria-label="You"><g id="suFig"></g></svg><div class="suopts">
      <p class="sulabel">Body</p>${chips("body", BODIES, L.body)}
      <p class="sulabel">Skin</p>${swatches("skin", SKINS, L.skin, "Skin tone")}
      <p class="sulabel">Hair</p>${chips("style", STYLES, L.style)}${swatches("hair", HAIRS, L.hair, "Hair colour")}
      <p class="sulabel">Top</p>${swatches("top", TOPS, L.top, "Top colour")}
      <p class="sulabel">Bottoms</p>${chips("legs", LEGS, L.legs)}${swatches("bottom", BOTTOMS, L.bottom, "Bottoms colour")}
      </div></div>
      <div class="actions">${s.lookOnly ? `<button type="button" class="btn primary" data-su="done">Done</button><button type="button" class="btn alt" data-su="cancel">Never mind</button>` : `<button type="button" class="btn alt" data-su="go:you">Back</button><button type="button" class="btn primary" data-su="go:pet">Next: your pet</button>`}</div>`; }
  // the pet
  const k = s.pet, sp = SPECIES[k];
  return `<p class="eyebrow">Step 3 of 3</p><h2>Who's coming with you?</h2>
    <div class="supets" role="radiogroup">${KINDS.map(x => `<button type="button" class="supet${x === k ? " on" : ""}" data-su="pet:${x}" aria-pressed="${x === k}">${petSvg(x, 64)}<span>${esc(SPECIES[x].n)}</span></button>`).join("")}</div>
    <p class="sub">${esc(sp.line)} Yours for this whole game.</p>
    <label class="sulabel" for="suPet">Your ${esc(sp.n.toLowerCase())}'s name</label><input id="suPet" class="suinput" maxlength="20" autocomplete="off" value="${esc(s.petName)}">
    <div class="gchips">${sp.names.map(n => `<button type="button" class="gchip${n === s.petName ? " on" : ""}" data-su="pname:${esc(n)}"><span>${esc(n)}</span></button>`).join("")}</div>
    <div class="actions"><button type="button" class="btn alt" data-su="go:look">Back</button><button type="button" class="btn primary" data-su="done" ${s.petName.trim() ? "" : "disabled"}>Move in</button></div>`;
}

function draw(){
  const box = document.getElementById("setup"); if (!box) return;
  const keep = document.activeElement && document.activeElement.id;
  box.querySelector(".sucard").innerHTML = page();
  if (st.page === "look") { const fig = document.getElementById("mel"), g = document.getElementById("suFig");
    if (fig && g) { const c = fig.cloneNode(true); c.removeAttribute("id"); c.querySelectorAll("[id]").forEach(e => e.removeAttribute("id")); c.removeAttribute("transform"); c.setAttribute("class", "ch me"); c.removeAttribute("style"); g.replaceChildren(c); applyLook(c, st.look); } }
  if (keep) { const e = document.getElementById(keep); if (e) { e.focus(); if (e.setSelectionRange) e.setSelectionRange(e.value.length, e.value.length); } }
}

// open the card: {F, look: true for the wardrobe's "change my look" only, done(F) when finished}
export function openSetup(F, {lookOnly = false, done} = {}){
  const me = F.me || {}, p = me.pron || {}, pk = Object.keys(PRONOUNS).find(k => PRONOUNS[k].they === p.they && PRONOUNS[k].them === p.them) || (p.they ? "own" : "they");
  const kind = F.pet && SPECIES[F.pet] ? F.pet : "fox";
  st = {page: lookOnly ? "look" : "you", lookOnly, name: me.name || "", pron: pk, own: {they: p.they || "", them: p.them || "", their: p.their || ""},
    look: lookOf(F), pet: kind, petName: F.pet ? F.name || "" : SPECIES[kind].names[0], touchedName: false};
  let box = document.getElementById("setup");
  if (!box) { box = document.createElement("div"); box.id = "setup"; box.className = "setup"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", lookOnly ? "Change your look" : "Start your game"); document.body.appendChild(box); }
  box.hidden = false; box.innerHTML = `<div class="sucard"></div>`;
  box.oninput = ev => { const id = ev.target.id;
    if (id === "suName") { st.name = ev.target.value; const b = box.querySelector('[data-su="go:look"]'); if (b) b.disabled = !st.name.trim(); }
    else if (id === "suPet") { st.petName = ev.target.value; st.touchedName = true; const b = box.querySelector('[data-su="done"]'); if (b) b.disabled = !st.petName.trim(); }
    else if (id === "suThey" || id === "suThem" || id === "suTheir") st.own[id.slice(2).toLowerCase()] = ev.target.value.trim(); };
  box.onclick = ev => { const b = ev.target.closest("[data-su]"); if (!b || b.disabled) return; const [a, ...rest] = b.dataset.su.split(":"), v = rest.join(":");
    if (a === "go") st.page = v;
    else if (a === "pron") st.pron = v;
    else if (a === "body") { const keepCol = {skin: st.look.skin, hair: st.look.hair}; st.look = {...START[v], ...keepCol}; }
    else if (["skin", "hair", "style", "top", "bottom", "legs"].includes(a)) st.look = {...st.look, [a]: v};
    else if (a === "pet") { if (!st.touchedName || SPECIES[st.pet].names.includes(st.petName)) st.petName = SPECIES[v].names[0]; st.pet = v; }
    else if (a === "pname") { st.petName = v; st.touchedName = true; }
    else if (a === "cancel") { close(); return; }
    else if (a === "done") { finish(F, done); return; }
    draw(); };
  draw();
}
function close(){ const box = document.getElementById("setup"); if (box) { box.hidden = true; box.innerHTML = ""; } st = null; }
function finish(F, done){
  const s = st, pron = s.pron === "own" ? {they: s.own.they || "they", them: s.own.them || "them", their: s.own.their || "their"} : {...PRONOUNS[s.pron]};
  delete pron.label;
  if (s.lookOnly) F.me = {...(F.me || {}), look: s.look};
  else { F.me = {name: s.name.trim().slice(0, 24), pron, look: s.look}; if (!F.pet) { F.pet = s.pet; F.name = s.petName.trim().slice(0, 20) || SPECIES[s.pet].names[0]; } }
  close(); if (done) done(F);
}
export const setupOpen = () => !!st;
