// Scratch cards at Hana's market (round 303: "I want to be able to rub the phone screen and it scratches away the
// ink"). Two a day, 4 coins each. Six squares under silver ink: three the same wins. You rub the ink away with a finger
// (or the mouse); once most of it's gone the rest clears by itself, and the prize is paid. The odds (agreed with the
// team): 70% nothing, 18% 5 coins, 6% a free item from Hana's shelves, 4% 20 coins, 2% 50 coins. Over many cards
// that pays back a little under the price, so it's a treat, not a way to make money.
// F.scratch = {day, bought, card: {syms: [6], prize: {coins} | {item}, paid}, played, won}
import { esc } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";

export const CARD = 4, PER_DAY = 2;
export const ODDS = [[.70, null], [.88, {coins: 5}], [.94, {item: true}], [.98, {coins: 20}], [1, {coins: 50}]];
const DECOYS = ["star", "bell", "cherry", "sparkle"];
const symOf = p => !p ? null : p.item ? "gift" : "c" + p.coins;
const ALL = ["c5", "c20", "c50", "gift", ...DECOYS];

export function scratchState(F, day){
  F.scratch = F.scratch || {played: 0, won: 0};
  const s = F.scratch; if (day && s.day !== day) { s.day = day; s.bought = 0; }
  return s;
}
export const cardsLeft = (F, day) => PER_DAY - (scratchState(F, day).bought || 0);
// the free item: something small from Hana's treats, deli and gifts shelves
export const prizeItems = () => Object.keys(ITEMS).filter(id => { const it = ITEMS[id];
  return ["treats", "deli", "family"].includes(it.tab) && ["gift", "food", "ingredient"].includes(it.kind) && it.price > 0 && it.price <= 12 && !it.need && !it.needs && !it.story && !it.visited && !it.seasons; });
export function rollPrize(r, r2 = Math.random()){
  const p = ODDS.find(([at]) => r < at)[1]; if (!p || !p.item) return p;
  const pool = prizeItems(); return pool.length ? {item: pool[Math.floor(r2*pool.length) % pool.length]} : {coins: 5};
}
// six squares: a win has three of the prize's symbol and no other three; a loss has no three of anything
export function layout(prize, rnd = Math.random){
  const want = symOf(prize), out = want ? [want, want, want] : [], count = {}; out.forEach(x => count[x] = (count[x] || 0) + 1);
  while (out.length < 6) { const x = ALL[Math.floor(rnd()*ALL.length) % ALL.length]; if (x === want || (count[x] || 0) >= 2) continue; count[x] = (count[x] || 0) + 1; out.push(x); }
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd()*(i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export const winner = syms => { const c = {}; syms.forEach(x => c[x] = (c[x] || 0) + 1); return Object.keys(c).find(x => c[x] >= 3) || null; };

export function buyCard(F, day, rnd = Math.random){
  const s = scratchState(F, day);
  if (s.card && !s.card.paid) return {line: "Finish the card you've got first."};
  if ((s.bought || 0) >= PER_DAY) return {line: "\"Two's the limit, love,\" says Hana. \"Come back tomorrow.\""};
  if ((F.coins || 0) < CARD) return {line: `A card is ${CARD} coins.`};
  F.coins -= CARD; s.bought = (s.bought || 0) + 1; s.played = (s.played || 0) + 1;
  const prize = rollPrize(rnd(), rnd()); s.card = {syms: layout(prize, rnd), prize, paid: false};
  return {ok: true, card: s.card};
}
// paid once, when the ink's off -> {coins} | {item} | null, and a line
export function claimCard(F, addInv){
  const s = scratchState(F), c = s.card; if (!c || c.paid) return null; c.paid = true;
  if (!c.prize) return {prize: null, line: pick(["Not this time. Hana pops the card in the recycling for you.", "No three the same. \"Next time,\" says Hana, with a wink.", "Not a winner, but the scratching was nice."])};
  s.won = (s.won || 0) + 1;
  if (c.prize.coins) { F.coins = (F.coins || 0) + c.prize.coins; return {prize: c.prize, line: c.prize.coins >= 50 ? `Three gold coins! Fifty coins. Hana counts them out twice, beaming.` : `Three the same: ${c.prize.coins} coins! Hana counts them into your hand.`}; }
  addInv(c.prize.item, 1); return {prize: c.prize, line: `Three presents! You win ${ITEMS[c.prize.item].n.toLowerCase()}, off Hana's shelf. She pops it in your backpack.`};
}
const pick = a => a[Math.floor(Math.random()*a.length)];

const symHTML = x => x[0] === "c" && x !== "cherry" ? `<span class="scsym">${icon("coin", 30)}<b>${x.slice(1)}</b></span>` : x === "gift" ? `<span class="scsym">${icon("heart", 30)}<b>present</b></span>` : `<span class="scsym">${icon(x, 30)}</span>`;
export function scratchHTML(F, day){
  const s = scratchState(F, day), c = s.card, left = cardsLeft(F, day);
  const buy = `<button class="btn primary" data-scratch="buy" ${left > 0 && F.coins >= CARD && !(c && !c.paid) ? "" : "disabled"}>Buy a card · ${CARD} ${icon("coin", 13)}</button>`;
  const head = `<p class="sub">A jar of scratch cards on Hana's counter. ${CARD} coins a card, ${PER_DAY} a day. Find three the same to win: 5, 20 or 50 coins, or a present off the shelves.</p>`;
  if (!c) return `<div class="scwrap">${head}<div class="actions">${buy}</div><p class="muted">${left} card${left === 1 ? "" : "s"} left today.</p></div>`;
  return `<div class="scwrap">${head}
    <div class="sccard${c.paid ? " done" : ""}"><div class="scgrid">${c.syms.map(symHTML).join("")}</div>${c.paid ? "" : `<canvas class="scink" width="300" height="200" aria-label="Silver ink: rub it away"></canvas>`}</div>
    ${c.paid ? `<p class="muted">${c.prize ? (c.prize.coins ? `You won ${c.prize.coins} coins.` : `You won ${esc(ITEMS[c.prize.item].n.toLowerCase())}.`) : "Not this time."} ${left} card${left === 1 ? "" : "s"} left today.</p><div class="actions">${buy}</div>`
      : `<p class="muted">Rub the silver ink with your finger to scratch it away.</p><div class="actions"><button class="btn small alt" data-scratch="all">Scratch it all off</button></div>`}</div>`;
}
// the rubbing: draw the ink on the canvas, erase where the finger goes, and call done() once most of it's off
export function wireScratch(root, {done, sfx}){
  const cv = root.querySelector("canvas.scink"); if (!cv) return;
  const g = cv.getContext("2d"); if (!g) return;
  const W = cv.width, H = cv.height, grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#C9CCD2"); grad.addColorStop(.5, "#E8EAEE"); grad.addColorStop(1, "#B9BDC5");
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(90,96,108,.55)"; g.font = "600 15px Klee One, serif"; g.textAlign = "center"; g.fillText("Rub here", W/2, H/2 + 5);
  g.globalCompositeOperation = "destination-out";
  const COLS = 15, ROWS = 10, hit = new Set(); let down = false, last = null, lastSound = 0, finished = false;
  const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left)*W/r.width, (e.clientY - r.top)*H/r.height]; };
  const mark = (x, y) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const cx = Math.floor((x + dx*9)/(W/COLS)), cy = Math.floor((y + dy*9)/(H/ROWS)); if (cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS) hit.add(cx + "," + cy); } };
  const rub = (x, y) => { g.beginPath(); g.lineCap = "round"; g.lineWidth = 30;
    if (last) { g.moveTo(last[0], last[1]); g.lineTo(x, y); g.stroke(); const n = Math.ceil(Math.hypot(x - last[0], y - last[1])/8); for (let i = 1; i <= n; i++) mark(last[0] + (x - last[0])*i/n, last[1] + (y - last[1])*i/n); }
    else { g.arc(x, y, 15, 0, Math.PI*2); g.fill(); mark(x, y); }
    last = [x, y]; const t = Date.now(); if (t - lastSound > 260) { lastSound = t; sfx && sfx(); }
    if (!finished && hit.size >= COLS*ROWS*.6) { finished = true; cv.style.transition = "opacity .5s"; cv.style.opacity = "0"; setTimeout(done, 450); } };
  cv.addEventListener("pointerdown", e => { down = true; last = null; try { cv.setPointerCapture(e.pointerId); } catch (_) {} rub(...at(e)); e.preventDefault(); });
  cv.addEventListener("pointermove", e => { if (down) { rub(...at(e)); e.preventDefault(); } });
  const up = () => { down = false; last = null; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up); cv.addEventListener("pointerleave", up);
}
