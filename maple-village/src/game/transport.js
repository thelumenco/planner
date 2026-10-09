// Getting about Honeybrook (round 103).
//   Bike hire: racks at Honeybrook station, in the woods and in the town square. BIKE_FEE coins for an hour; while it's
//     out Mel rides it everywhere outdoors (faster than walking, slower than the scooter: goals.js rideSpeed), and
//     after the hour it goes back to the nearest rack by itself. Villagers ride bikes too (look.bike, npcs.js).
//   The river taxi: a little launch that runs down the river from the waterfall pool in the woods, past Makers' Lane
//     and home, across the lake and out to the foreshore, 7am to 9pm. Any stop to any other, TAXI_FEE coins; it's the
//     quick way from the woods to Ma Ma's (the foreshore stop is one gate from the flower farm, the lake stop one from
//     the orchard).
// State: F.bike = {until, col} while a bike is out.
import { esc, now, sgHM } from "../util.js";
import { icon } from "../art/icons.js";

export const BIKE_FEE = 5, BIKE_MINS = 60;
const BIKE_COLS = ["#5E8A5A", "#E8566C", "#3E6B8C", "#F3C969"];
export const bikeOn = F => !!(F.bike && F.bike.until > now());
export const bikeLeft = F => bikeOn(F) ? Math.ceil((F.bike.until - now())/60000) : 0;
export function hireBike(F){
  if (bikeOn(F) || F.coins < BIKE_FEE) return null;
  F.coins -= BIKE_FEE; F.bike = {until: now() + BIKE_MINS*60000, col: BIKE_COLS[Math.floor(Math.random()*BIKE_COLS.length)]};
  return `A bike for an hour (${BIKE_FEE} coins). Bell, basket, off you go!`;
}
export function returnBike(F){ if (!F.bike) return null; F.bike = null; return "Bike back in the rack. Thanks for riding!"; }
// called on each tick: the hour's up -> a line, once
export function bikeExpired(F){ if (F.bike && F.bike.until <= now()) { F.bike = null; return "Your hour on the bike's up. It's gone back to the rack."; } return null; }

const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
export function bikePanel(F, ownRide){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Bike hire</h2><p class="sub">Honeybrook's hire bikes: ${BIKE_FEE} ${coin()} for an hour. Faster than walking (not quite the scooter). Racks at the station, in the woods and in the town square.</p>`;
  if (bikeOn(F)) h += `<p><b>Your bike's out:</b> ${bikeLeft(F)} minute${bikeLeft(F) === 1 ? "" : "s"} left. It goes back to the rack by itself when the hour's up.</p><div class="actions"><button class="btn alt" data-bike="return">Return it now</button></div>`;
  else h += `<div class="actions"><button class="btn primary" data-bike="hire" ${F.coins >= BIKE_FEE ? "" : "disabled"}>Hire a bike for an hour · ${BIKE_FEE} ${coin()}</button></div>${ownRide ? `<p class="muted">While it's out you'll ride the bike instead of your ${esc(ownRide)}.</p>` : ""}`;
  return h + shut;
}

// The river taxi's stops, downstream order. at: where Mel steps off.
export const STOPS = {
  taxiwoods: {scene: "hwoods", n: "Waterfall pool", at: [168, 290], line: "Honeybrook Woods, under the waterfall"},
  taxilane: {scene: "lane", n: "Makers' Lane", at: [62, 236], line: "Makers' Lane"},
  taxihome: {scene: "base", n: "Home jetty", at: [150, 140], line: "home, at your little jetty"},
  taxilake: {scene: "field", n: "The lake", at: [300, 372], line: "the lake on the field (one gate from the orchard)"},
  taxishore: {scene: "shore", n: "The foreshore", at: [214, 168], line: "the foreshore (one gate from Ma Ma's flower farm)"}
};
export const TAXI_FEE = 4, TAXI_FROM = 7*60, TAXI_TO = 21*60;
export const taxiRunning = (hm = sgHM()) => hm >= TAXI_FROM && hm < TAXI_TO;
export const stopIn = scene => Object.keys(STOPS).find(k => STOPS[k].scene === scene) || null;
export function taxiPanel(F, from){
  const here = STOPS[from], on = taxiRunning();
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>River taxi</h2><p class="sub">${esc(here.n)}. The little launch runs the river from the waterfall to the sea, 7am to 9pm. Any stop, ${TAXI_FEE} ${coin()}.</p>`;
  if (!on) return h + `<p class="muted">The taxi's tied up for the night. First boat at 7am.</p>` + shut;
  h += `<ul class="hlist wlist">${Object.entries(STOPS).filter(([k]) => k !== from).map(([k, s]) => `<li><span class="wtxt"><b>${esc(s.n)}</b><small>${esc(s.line)}</small></span><button class="btn small primary" data-taxi="${k}" ${F.coins >= TAXI_FEE ? "" : "disabled"}>Go · ${TAXI_FEE} ${coin()}</button></li>`).join("")}</ul>`;
  return h + shut;
}
export function takeTaxi(F, to){ const s = STOPS[to]; if (!s || !taxiRunning() || F.coins < TAXI_FEE) return null; F.coins -= TAXI_FEE; return s; }
