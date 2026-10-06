// Big, slow goals: things worth saving up for once the vineyard is running.
//   scooter  gets Mel from screen to screen faster (kept in the garage, through the living room's east door)
//   car      faster still: a cream convertible with room for Maple and Evan
//   boat     a dolphin cruise boat moored at the jetty on the foreshore
//   cellar   a cellar door extension off the wine shop: barrel racks, a tasting bar, Mel's wine wall (and a few more visitors)
// Owned goals live in F.goals; how Mel gets about (walk / scooter / car) in F.ride.
import { esc } from "../util.js";
import { icon } from "../art/icons.js";

export const GOALS = {
  scooter: {n: "Scooter", price: 800, where: "garage", line: "A little electric scooter. Zips you from screen to screen about half again as fast as walking."},
  car: {n: "Cream convertible", price: 3500, where: "garage", line: "A cream convertible, roof down. Room for you, Maple and Evan, and more than twice as fast as walking."},
  boat: {n: "Dolphin cruise boat", price: 2000, where: "shore", line: "A little cruise boat moored at the end of the jetty. Take the family out to see the dolphins up close."},
  cellar: {n: "Cellar door", price: 2500, where: "wineshop", line: "A cellar door extension off the wine shop: barrel racks, a tasting bar and a wall of every wine you've made. Visitors love a cellar door, and once a month it hosts the wine club."}
};
export const owns = (F, k) => !!(F.goals && F.goals[k]);
// how much faster Mel moves outdoors, and on what
export const ride = F => { const r = F.ride; return r === "car" && owns(F, "car") ? "car" : r === "scooter" && owns(F, "scooter") ? "scooter" : r === "walk" ? "walk" : owns(F, "car") ? "car" : owns(F, "scooter") ? "scooter" : "walk"; };
export const rideSpeed = F => ({walk: 1, scooter: 1.6, car: 2.5})[ride(F)];

// -> a line to say, or null if it can't be bought (yet)
export function buyGoal(F, k){
  const g = GOALS[k]; if (!g || owns(F, k) || F.coins < g.price || (g.needs && !owns(F, g.needs))) return null;
  F.coins -= g.price; F.goals = {...(F.goals || {}), [k]: Date.now()};
  if (k === "scooter" || k === "car") F.ride = k;
  return {scooter: "A shiny new scooter, parked in the garage. You'll zip about on it outdoors from now on.",
    car: "A cream convertible! Roof down, Maple in the back, Evan waving at everyone. You'll drive between screens from now on.",
    boat: "Your dolphin cruise boat is moored at the end of the jetty. Take everyone out!",
    cellar: "The cellar door is open! Through the new door on the wine shop's west wall."}[k];
}

const coin = () => icon("coin", 14);
// the "save up for it" card shown where a goal is built or bought
export function goalPanel(F, k){
  const g = GOALS[k], have = owns(F, k), need = g.needs && !owns(F, g.needs);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(g.n)}</h2><p class="sub">${esc(g.line)}</p>`;
  if (have) h += `<p class="muted">Yours since ${new Date(F.goals[k]).toLocaleDateString("en-GB", {day: "numeric", month: "short"})}.</p>`;
  else if (need) h += `<p class="muted">You'll need the ${esc(GOALS[g.needs].n.toLowerCase())} first.</p>`;
  else { const pct = Math.min(100, Math.round(100*F.coins/g.price));
    h += `<div class="goalbar" role="img" aria-label="${pct}% saved"><span style="width:${pct}%"></span></div><p class="muted">${F.coins} of ${g.price} ${coin()} saved${F.coins < g.price ? `: ${g.price - F.coins} to go` : ""}.</p>
      <div class="actions"><button class="btn primary" data-goal="${k}" ${F.coins < g.price ? "disabled" : ""}>${k === "cellar" ? "Build it" : "Buy it"} (${g.price} ${coin()})</button></div>`; }
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// the garage: the vehicles, and how to get about
export function garagePanel(F){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The garage</h2><p class="sub">How do you want to get about?</p><div class="actions">`;
  h += [["walk", "Walk"], ["scooter", "Scooter"], ["car", "Car"]].map(([k, n]) => `<button class="btn small ${ride(F) === k ? "primary" : "alt"}" data-ride="${k}" ${k !== "walk" && !owns(F, k) ? "disabled" : ""}>${n}${k !== "walk" && !owns(F, k) ? ` (${GOALS[k].price})` : ""}</button>`).join("") + `</div>`;
  ["scooter", "car"].filter(k => !owns(F, k)).forEach(k => { const g = GOALS[k];
    h += `<p class="eyebrow" style="margin-top:12px">${esc(g.n)}</p><p class="muted">${esc(g.line)} ${F.coins} of ${g.price} ${coin()} saved.</p><div class="actions"><button class="btn primary small" data-goal="${k}" ${F.coins < g.price ? "disabled" : ""}>Buy it (${g.price} ${coin()})</button></div>`; });
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
