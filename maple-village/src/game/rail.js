// The railway: trains run along the top of the top row, from the city (off the bay's west edge, over the trestle)
// through the bay and Wildflower Farm to Honeybrook station on the cottage lane, and on east into the hill (and back).
// The timetable is only on the platform board (not the village calendar). Each train stops at Honeybrook for two
// minutes at its time; on the way it passes the farm a minute or two either side, and the bay a minute further out.
import { dayKey, sgHM } from "../util.js";

export const TRAINS = [
  {id: "milk", t: 7*60 + 40, dir: "w", n: "The milk train", to: "to the city", line: "Churns of milk and crates of honey from the farm, off to the city."},
  {id: "am", t: 9*60 + 15, dir: "e", n: "The morning train", to: "from the city", line: "Day-trippers and tour groups, here for the farm, the wine and the bay."},
  {id: "mid", t: 13*60 + 20, dir: "w", n: "The lunchtime train", to: "to the city", line: "Back to town after a morning out."},
  {id: "pm", t: 17*60 + 5, dir: "e", n: "The evening train", to: "from the city", line: "On Tuesdays and Thursdays, the night market crowd."},
  {id: "late", t: 22*60 + 30, dir: "w", n: "The late train", to: "to the city", line: "Night market evenings only: everyone home, sleepy and full.", dow: [2, 4]}
];
export const STOP_X = 190;   // where the train's tail sits when it's waiting at Honeybrook's platform
const dow = day => new Date(day + "T00:00:00Z").getUTCDay();
export const trainsOn = day => TRAINS.filter(t => !t.dow || t.dow.includes(dow(day)));
// the one-minute windows each screen sees a train in, relative to its time at the station
const WINDOWS = {
  hlane: {e: [[-1, "arrive"], [0, "dwell"], [1, "dwell"], [2, "depart"]], w: [[-1, "arrive"], [0, "dwell"], [1, "dwell"], [2, "depart"]]},
  hfarm: {e: [[-2, "pass"]], w: [[3, "pass"]]},
  bay: {e: [[-3, "pass"]], w: [[4, "pass"]]},
  hwoods: {e: [[3, "pass"]], w: [[-2, "pass"]]}   // round 103: on east into the tunnel under the hill (and back out)
};
const secs = () => { const d = new Date(Date.now() + (globalThis.__mapleOffset || 0) + 8*3600e3); return d.getUTCSeconds() + d.getUTCMilliseconds()/1000; };
// the train on a screen right now: {id, dir, mode, elapsed (seconds into its minute; dwell counts both minutes)} or null
export function trainHere(scene, day = dayKey(), hm = sgHM()){
  const w = WINDOWS[scene]; if (!w) return null;
  for (const t of trainsOn(day)) for (const [k, mode] of w[t.dir]) if (hm === t.t + k) return {...t, mode, elapsed: secs() + (mode === "dwell" ? (k - 0)*60 : 0)};
  return null;
}
export const trainKey = scene => { const t = trainHere(scene); return t ? `${t.id}:${t.mode}:${t.mode === "dwell" ? "" : sgHM()}` : ""; };
export const nextTrain = (day = dayKey(), hm = sgHM()) => trainsOn(day).find(t => t.t + 2 >= hm) || null;
export const fmt = m => `${Math.floor(m/60) % 12 || 12}:${String(m % 60).padStart(2, "0")}${m < 12*60 ? "am" : "pm"}`;

export function timetablePanel(day = dayKey(), hm = sgHM(), tickets = false){
  const nx = nextTrain(day, hm);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Honeybrook</h2><p class="sub">Trains today. Every one stops here for two minutes.${nx ? ` Next: ${nx.n.toLowerCase()} at ${fmt(nx.t)}.` : " That's the last one gone for today."}</p>`;
  h += `<ul class="hlist wlist">${trainsOn(day).map(t => `<li class="${nx && t.id === nx.id ? "now" : ""}"><span class="wtxt"><b>${fmt(t.t)} · ${t.n} ${t.to}</b><small>${t.line}</small></span></li>`).join("")}</ul>`;
  // round 107: the ticket window's open, for day trips (trips.js)
  h += tickets ? `<div class="actions"><button class="btn primary" data-tickets="1">Ticket window: day trips to Ronda and Kyoto</button></div>` : `<p class="muted">The ticket window's shutters are down for now: it opens when there's somewhere to go.</p>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
