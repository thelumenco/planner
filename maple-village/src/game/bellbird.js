// Bellbird Valley road trips (round 141): the campervan's road map. Step into the van on the lane and open the map on
// the dashboard: pick who's coming (up to five in the van, Mel included: Evan counts) and a stop you can see on the
// map, and off you drive. At every stop the van's parked on its first screen: tap it for the map again, to drive on to
// another stop or home. Fuel: 6 coins a leg, plus 1 for each passenger (the cost of the shortest way there).
// The map only shows what Mel's found: the stops she's been to, and the ones a road away from them (Valley Gate from
// the start). A stamp in the passport for every stop.
// State: F.trip = {town: stop, day, party, from, by: "van"} (the trip system's, trips.js); F.bellbird = {stamps:
// {stop: day}, legs: n}.
import { esc, dayKey, sgHM } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWNS } from "../data/towns.js";
import { BB_MAP, BB_ROADS, BB_SOON } from "../data/bellbird.js";
import { FAMILY, nameOf, tripOn } from "./trips.js";

export const VAN_SEATS = 5, LEG = 6;
export const STOPS = Object.keys(TOWNS).filter(id => TOWNS[id].by === "van");
export const bbState = F => { F.bellbird = F.bellbird || {}; F.bellbird.stamps = F.bellbird.stamps || {}; return F.bellbird; };
const nbrs = id => BB_ROADS.filter(r => r.includes(id)).map(r => r[0] === id ? r[1] : r[0]);
// how many legs from a to b along the roads (home counts as a place)
export function legs(a, b){ if (a === b) return 0; const seen = {[a]: 0}, q = [a]; while (q.length) { const x = q.shift(); for (const y of nbrs(x)) if (!(y in seen)) { seen[y] = seen[x] + 1; if (y === b) return seen[y]; q.push(y); } } return Infinity; }
export const fuelFor = (from, to, party) => legs(from, to)*(LEG + party.filter(id => id !== "evan").length);
// what's on Mel's map: the stops she's been to, and those a road away (Valley Gate from the start)
export function known(F){ const st = bbState(F).stamps, seen = new Set(["bv_gate", ...Object.keys(st)]); Object.keys(st).forEach(s => nbrs(s).forEach(n => { if (n !== "home") seen.add(n); })); return STOPS.filter(s => seen.has(s)); }
export const stamped = (F, stop) => !!bbState(F).stamps[stop];
export const canSet = (hm = sgHM()) => hm >= 7*60 && hm < 18*60;
// set off from home -> the stop, or null
export function setOff(F, stop, party, hm = sgHM(), ownsVan = true){
  party = FAMILY.filter(id => party.includes(id)).slice(0, VAN_SEATS - 1);
  if (!ownsVan || !TOWNS[stop] || !canSet(hm) || tripOn(F) || !known(F).includes(stop)) return null;
  const cost = fuelFor("home", stop, party); if (F.coins < cost) return null;
  F.coins -= cost; F.trip = {town: stop, day: dayKey(), party, from: hm, by: "van"}; F.towns = {...(F.towns || {}), bellbird: (F.towns && F.towns.bellbird) || dayKey()};
  stamp(F, stop); bbState(F).legs = (bbState(F).legs || 0) + legs("home", stop); return {cost, stop};
}
// drive on from one stop to another -> {cost, stop, first}, or null
export function driveOn(F, stop, hm = sgHM()){
  const t = tripOn(F); if (!t || t.by !== "van" || !TOWNS[stop] || stop === t.town || !known(F).includes(stop) || hm >= TOWNS[stop].backTo) return null;
  const cost = fuelFor(t.town, stop, t.party); if (F.coins < cost) return null;
  F.coins -= cost; const n = legs(t.town, stop); t.town = stop; const first = stamp(F, stop); bbState(F).legs = (bbState(F).legs || 0) + n; return {cost, stop, first};
}
export function stamp(F, stop){ const s = bbState(F); if (s.stamps[stop]) return false; s.stamps[stop] = dayKey(); return true; }
export const homeFuel = F => { const t = tripOn(F); return t ? fuelFor(t.town, "home", t.party) : 0; };

/* ---------- the road map ---------- */
const fmt = m => `${Math.floor(m/60) % 12 || 12}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m < 12*60 ? "am" : "pm"}`;
const coin = () => icon("coin", 13);
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
function mapSvg(F, at){
  const k = new Set(known(F)), st = bbState(F).stamps, show = id => id === "home" || k.has(id);
  const P = BB_MAP, roads = BB_ROADS.filter(([a, b]) => show(a) && show(b));
  const pine = (x, y, s = 1) => `<g><path d="M${x} ${y} v-${6*s}" stroke="#7A5A3A" stroke-width="1.2"/><ellipse cx="${x}" cy="${y - 9*s}" rx="${5*s}" ry="${6*s}" fill="#8FAE7A" stroke="#4A5A3A" stroke-width=".7"/></g>`;
  let h = `<svg class="bbmap" viewBox="0 0 360 240" role="img" aria-label="The road map of Bellbird Valley"><rect width="360" height="240" rx="10" fill="#F6EDD5" stroke="#B9A47A" stroke-width="1.5"/>
    <path d="M0 190 Q60 160 120 180 T240 170 T360 180 V240 H0z" fill="#E6DDB0" opacity=".7"/><path d="M0 70 Q80 40 150 60 T300 40 T360 50" fill="none" stroke="#C9C08A" stroke-width="8" opacity=".5"/>
    ${[[60, 120], [180, 120], [300, 100], [200, 230], [40, 60], [330, 60]].map(([x, y]) => pine(x, y)).join("")}`;
  // the roads to the other regions: signposted, closed for now
  h += BB_SOON.filter(([from]) => k.has(from)).map(([from, [x, y], label]) => { const [fx, fy] = P[from]; return `<path d="M${fx} ${fy} L${x} ${y}" stroke="#B9A47A" stroke-width="2" stroke-dasharray="2 4" fill="none"/><text x="${x}" y="${y + (y < 30 ? 12 : -4)}" text-anchor="middle" font-size="7.5" fill="#8A7A5A" font-style="italic">${esc(label)} (soon)</text>`; }).join("");
  h += roads.map(([a, b]) => `<path d="M${P[a][0]} ${P[a][1]} Q${(P[a][0] + P[b][0])/2 + 8} ${(P[a][1] + P[b][1])/2 - 10} ${P[b][0]} ${P[b][1]}" stroke="#C9785A" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("");
  h += [...k].map(id => { const [x, y] = P[id], seen = !!st[id], here = at === id;
    return `<g><circle cx="${x}" cy="${y}" r="${here ? 9 : 7}" fill="${seen ? "#F3C969" : "#FFFDF6"}" stroke="#5A4636" stroke-width="1.4" ${seen ? "" : 'stroke-dasharray="2 2"'}/>${seen ? `<path d="M${x - 3} ${y} l2 2.4 l4.4 -5" fill="none" stroke="#5A4636" stroke-width="1.4"/>` : `<text x="${x}" y="${y + 3}" text-anchor="middle" font-size="8" font-weight="700" fill="#5A4636">?</text>`}
      <text x="${x}" y="${y + 19}" text-anchor="middle" font-size="9" font-weight="700" fill="#3B3530" font-family="Klee One,serif">${esc(TOWNS[id].n)}</text>${here ? `<text x="${x}" y="${y - 13}" text-anchor="middle" font-size="8" fill="#C9483A">you're here</text>` : ""}</g>`; }).join("");
  h += `<g><circle cx="${P.home[0]}" cy="${P.home[1]}" r="7" fill="#9CC27E" stroke="#5A4636" stroke-width="1.4"/><text x="${P.home[0] + 2}" y="${P.home[1] - 11}" text-anchor="middle" font-size="9" font-weight="700" fill="#3B3530" font-family="Klee One,serif">Honeybrook</text></g></svg>`;
  return h;
}
// the map panel: at home (pick who's coming, then a stop), or at a stop (drive on, or home)
export function mapPanel(F, o = {}){
  const t = tripOn(F), at = t && t.by === "van" ? t.town : null, hm = o.hm != null ? o.hm : sgHM(), st = bbState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Bellbird Valley</h2><p class="sub">${at ? `Parked at ${esc(TOWNS[at].n)}. Drive on, or head home.` : "The road map on the dashboard. The valley's an hour down the road: vines, kangaroos, balloons and berries."} Stamps: ${Object.keys(st.stamps).length} of ${STOPS.length}.</p>`;
  h += mapSvg(F, at) + `<div class="actions"><button class="btn small alt" data-bvpass="1">The passport (${Object.keys(st.stamps).length} stamps)</button></div>`;
  if (!at) {
    if (t) return h + `<p class="muted">You're already out on a day trip today.</p>` + shut;
    if (!o.ownsVan) return h + shut;
    const pick = (o.pick || []).filter(id => FAMILY.includes(id)).slice(0, VAN_SEATS - 1);
    h += `<p class="eyebrow" style="margin:10px 0 6px">Who's coming? (${pick.length + 1} of ${VAN_SEATS} seats, you included)</p><div class="gchips">${FAMILY.map(id => `<button class="gchip${pick.includes(id) ? " on" : ""}" data-bvpick="${id}" aria-pressed="${pick.includes(id)}" ${!pick.includes(id) && pick.length >= VAN_SEATS - 1 ? "disabled" : ""}>${esc(nameOf(id))}</button>`).join("")}</div>`;
    if (!canSet(hm)) return h + `<p class="muted">Too ${hm < 7*60 ? "early" : "late"} to set off: day trips leave between 7am and 6pm (and you're home by 10).</p>` + shut;
    h += `<p class="eyebrow" style="margin:12px 0 6px">Where to?</p><div class="actions bbgo">${known(F).map(s => { const c = fuelFor("home", s, pick); return `<button class="btn small ${F.coins >= c ? "primary" : "alt"}" data-bvgo="${s}" ${F.coins >= c ? "" : "disabled"}>${esc(TOWNS[s].n)} · ${c} ${coin()}</button>`; }).join("")}</div><p class="muted">Fuel: ${LEG} coins a leg, plus 1 for each grown-up passenger. Home by ${fmt(TOWNS.bv_gate.backTo)}.</p>`;
    return h + shut;
  }
  if (t.party.length) h += `<p class="muted">With you: ${t.party.map(nameOf).join(", ").replace(/, ([^,]*)$/, " and $1")}.</p>`;
  const others = known(F).filter(s => s !== at);
  h += `<p class="eyebrow" style="margin:10px 0 6px">Drive on to</p><div class="actions bbgo">${others.map(s => { const c = fuelFor(at, s, t.party); return `<button class="btn small ${F.coins >= c ? "primary" : "alt"}" data-bvgo="${s}" ${F.coins >= c && hm < TOWNS[s].backTo ? "" : "disabled"}>${esc(TOWNS[s].n)}${stamped(F, s) ? "" : " (new!)"} · ${c} ${coin()}</button>`; }).join("")}</div>`;
  h += `<div class="actions"><button class="btn primary" data-bvhome="1">Drive home to Honeybrook · ${homeFuel(F)} ${coin()}</button></div><p class="muted">Home by ${fmt(TOWNS[at].backTo)} at the latest.</p>`;
  return h + shut;
}
// the passport: a stamp for every stop
export function passportPanel(F){
  const st = bbState(F).stamps;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Bellbird Valley passport</h2><p class="sub">${Object.keys(st).length} of ${STOPS.length} stamps. More of the valley to come: the Coast Road, the Lavender Hills and the Tablelands.</p>
    <div class="bbstamps">${STOPS.map(s => `<div class="bbstamp${st[s] ? " on" : ""}"><b>${esc(TOWNS[s].n)}</b><small>${st[s] ? `stamped ${esc(st[s])}` : "not yet"}</small></div>`).join("")}</div>` + shut;
}
