// The old mill (round 110): the windmill on the cottage lane, opened up as an olive mill (a big goal, goals.js).
// Inside: the stone basin where the millstone crushes the olives, the press with its stack of round mats, clay jars
// along the wall. Three jars of olives make one bottle of olive oil; a pressing takes an hour (set it and walk away),
// up to four bottles at a time. Olives come from Mel's backpack first, then the olive crate the vineyard hands fill.
// State: F.mill = {press: {start, dur, n} | null, made}
import { H } from "../util.js";
import { icon } from "../art/icons.js";
import { vineState } from "./vineyard.js";

export const JARS_PER_BOTTLE = 3, PRESS_MAX = 4, PRESS_DUR = 1*H;
export function millState(F){ F.mill = F.mill || {}; const m = F.mill; if (!("press" in m)) m.press = null; m.made = m.made || 0; return m; }
export const pressLeft = m => m.press ? Math.max(0, m.press.start + m.press.dur - Date.now()) : 0;
// olives available: the backpack, then the vineyard's olive crate
export const olivesHave = F => ((F.inv && F.inv.olives) || 0) + (vineState(F).oliveCrate || 0);
export function startPress(F, n){
  const m = millState(F); if (m.press) return null;
  n = Math.min(PRESS_MAX, n, Math.floor(olivesHave(F)/JARS_PER_BOTTLE)); if (n < 1) return null;
  let need = n*JARS_PER_BOTTLE; const v = vineState(F);
  const fromBag = Math.min(need, (F.inv && F.inv.olives) || 0); if (fromBag) { F.inv.olives -= fromBag; if (F.inv.olives <= 0) delete F.inv.olives; need -= fromBag; }
  if (need) v.oliveCrate -= need;
  m.press = {start: Date.now(), dur: PRESS_DUR, n};
  return `${n*JARS_PER_BOTTLE} jars of olives under the millstone. ${n} bottle${n > 1 ? "s" : ""} of oil in about an hour.`;
}
export function collectOil(F, addInv){
  const m = millState(F); if (!m.press || pressLeft(m)) return null;
  const n = m.press.n; m.press = null; m.made += n; addInv("oliveoil", n);
  return `${n} bottle${n > 1 ? "s" : ""} of your own olive oil, green-gold and peppery. Into your backpack.`;
}
const mins = ms => { const m = Math.max(1, Math.ceil(ms/60000)); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m}m`; };
export function millPanel(F){
  const m = millState(F), have = olivesHave(F), can = Math.min(PRESS_MAX, Math.floor(have/JARS_PER_BOTTLE)), left = pressLeft(m), v = vineState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The olive press</h2><p class="sub">Three jars of olives make a bottle of olive oil: crushed under the millstone, pressed between the mats. Up to ${PRESS_MAX} bottles a pressing, about an hour.</p>`;
  h += `<p class="muted">${icon("olives", 16)} Olives: ${(F.inv && F.inv.olives) || 0} in your backpack${v.oliveCrate ? `, ${v.oliveCrate} in the vineyard crate` : ""}.${m.made ? ` Bottles pressed so far: ${m.made}.` : ""}</p>`;
  if (m.press) h += left ? `<p>Pressing ${m.press.n} bottle${m.press.n > 1 ? "s" : ""}: ready in ${mins(left)}.</p><span class="clbar"><i style="width:${Math.round(100*(1 - left/m.press.dur))}%"></i></span>`
    : `<p><b>The oil's ready!</b></p><div class="actions"><button class="btn primary" data-mill="collect">Bottle it (${m.press.n})</button></div>`;
  else h += can ? `<div class="actions">${[1, can].filter((n, i, a) => a.indexOf(n) === i).map(n => `<button class="btn ${n === can ? "primary" : "alt"}" data-mill="press" data-n="${n}">Press ${n} bottle${n > 1 ? "s" : ""} (${n*JARS_PER_BOTTLE} jars)</button>`).join("")}</div>`
    : `<p class="muted">Not enough olives for a bottle yet. Your olive tree (and the grove, from the vineyard stall) give jars every eight hours; Elena sells them at the Sunday market too.</p>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
