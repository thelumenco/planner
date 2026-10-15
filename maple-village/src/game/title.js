// The welcome screen (phase 5): the picture of Honeybrook, Continue (your last game), the three save slots, and the
// opening story to watch again. Playing another slot puts this one away and reloads into it (slots.js); a new game in
// an empty slot starts with the story and the setup card, as ever. Silent: the music starts in the village.
import { esc } from "../util.js";
import { titleArt } from "../art/title.js";
import { petArt, SPECIES } from "../art/pets.js";
import { NPCS } from "../data/npcs.js";
import { SLOTS, activeSlot, summary, switchTo, wipe } from "./slots.js";

let opts = null, ask = 0, mail = {mode: "in", email: "", msg: ""};   // opts.player: the signed-in player; opts.remote: {slot: summary} of the cloud's copies   // ask: the slot whose "delete?" question is showing
const petPic = kind => { const a = petArt(kind), [c1, c2, c3] = SPECIES[kind].cols;
  return `<svg viewBox="12 0 104 122" width="44" height="44" aria-hidden="true" style="--pet1:${c1};--pet2:${c2};--pet3:${c3};overflow:visible"><g>${a.tail}</g><g>${a.body}</g><g>${a.head}</g></svg>`; };
const ago = at => { if (!at) return ""; const d = Math.round((Date.now() - at)/864e5); return d <= 0 ? "played today" : d === 1 ? "played yesterday" : `played ${d} days ago`; };
const nameOf = id => (NPCS.find(n => n.id === id) || {}).name || id;

// this browser's copy of a slot, or the cloud's if it's newer (another device played it last)
const best = n => { const l = summary(n), r = opts && opts.remote && opts.remote[n]; return r && (!l || (r.at || 0) > (l.at || 0)) ? r : l; };
function card(n){
  const s = best(n), on = n === activeSlot();
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
  const cur = best(activeSlot()), P = opts.player, head = `<div class="ttpicbox">${titleArt()}</div><div class="ttbody">
    <h1 class="tttitle">Honeybrook</h1><p class="ttsub">A village, a vineyard, and a little more time.</p>`;
  // everyone plays with an account (the public game): sign in first, then the slots
  if (opts.needAccount && !P) { box.querySelector(".ttcard").innerHTML = head + (opts.checking ? `<p class="ttacct">One moment...</p>`
    : `<button type="button" class="btn primary ttgo" data-tt="signin">Sign in with Google</button>
      <form class="ttmail" data-ttmail="1"><p class="eyebrow">Or with your email</p>
        <label class="sr" for="ttEmail">Email</label><input id="ttEmail" class="suinput" type="email" autocomplete="email" placeholder="email" value="${esc(mail.email)}">
        <label class="sr" for="ttPw">Password</label><input id="ttPw" class="suinput" type="password" autocomplete="${mail.mode === "new" ? "new-password" : "current-password"}" placeholder="password${mail.mode === "new" ? " (six characters or more)" : ""}">
        ${mail.msg ? `<p class="ttmsg">${esc(mail.msg)}</p>` : ""}
        <div class="actions"><button type="submit" class="btn primary small">${mail.mode === "new" ? "Make my account" : "Sign in"}</button>
        <button type="button" class="ttx" data-tt="mode">${mail.mode === "new" ? "I already have an account" : "New here? Make an account"}</button>${mail.mode === "new" ? "" : `<button type="button" class="ttx" data-tt="reset">Forgot your password?</button>`}</div></form>
      <p class="ttacct">Everyone plays with an account: your games are kept safe in it, and follow you to any device.</p>`)
    + `<div class="actions"><button type="button" class="btn alt small" data-tt="story">Watch the story</button></div></div>`; return; }
  box.querySelector(".ttcard").innerHTML = head + `
    ${cur ? `<button type="button" class="btn primary ttgo" data-tt="play:${activeSlot()}">Continue with ${esc(cur.name)}</button>` : ""}
    <p class="eyebrow">Your games</p><div class="ttslots">${Array.from({length: SLOTS}, (_, i) => card(i + 1)).join("")}</div>
    ${P ? `<p class="ttacct">Signed in${P.name ? ` as <b>${esc(P.name)}</b>` : ""}: your games are kept safe and follow you to any device. <button type="button" class="ttx" data-tt="signout">Sign out</button></p>` : ""}
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
    if (a === "signin") { opts.signIn && opts.signIn(); return; }
    if (a === "mode") { mail = {...mail, mode: mail.mode === "new" ? "in" : "new", msg: "", email: emailNow()}; draw(); return; }
    if (a === "reset") { const e = emailNow(); if (!e) { mail = {...mail, msg: "Type your email first, then tap Forgot your password."}; draw(); return; }
      opts.mail("reset", e).then(m => { mail = {...mail, email: e, msg: m || `A link to reset your password is on its way to ${e}.`}; draw(); }); return; }
    if (a === "signout") { opts.signOut && opts.signOut(); return; }
    if (a === "wipe") { const playing = n === activeSlot(); wipe(n); if (opts.wipeCloud) opts.wipeCloud(n); if (opts.remote) delete opts.remote[n]; ask = 0; if (playing) { const o2 = opts; closeTitle(); o2.reload(false); return; } draw(); return; }
    if (a === "story") { opts.story && opts.story(); return; }
    if (a === "play") { const o2 = opts; if (n === activeSlot()) { closeTitle(); o2.play(); return; } if (o2.save) o2.save(); if (switchTo(n)) { closeTitle(); o2.reload(true); } } };
  box.onsubmit = ev => { if (!ev.target.closest("[data-ttmail]")) return; ev.preventDefault();
    const e = emailNow(), pw = (document.getElementById("ttPw") || {}).value || "";
    mail = {...mail, email: e, msg: "One moment..."}; draw();
    opts.mail(mail.mode === "new" ? "up" : "in", e, pw).then(m => { if (m) { mail = {...mail, msg: m}; draw(); } }); };
  draw();
}
const emailNow = () => ((document.getElementById("ttEmail") || {}).value || mail.email || "").trim();
export const titleOpen = () => !!opts;
// the player signed in or out, or the cloud's copies arrived: redraw with them
export function refreshTitle(o){ if (!opts) return; Object.assign(opts, o); draw(); }
