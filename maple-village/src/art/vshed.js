// The barrel shed and the drying loft above it (round 308, ported: a proper room view for the
// barrel shed and the drying loft, instead of a list). Two rooms seen from the front, like the kitchens:
//   vshed  the barrel shed: up to six barrels on their cradles (each with its style's stamp and a tag: empty, hours to
//          go, ready), the grape crates by the door, the bottling table, Marco's bench under the dusty window, lanterns,
//          and the ladder up to the loft in the back corner
//   vloft  the drying loft: sloping beams and a round window, two cane racks of bunches that shrivel to raisins as they
//          dry, a little cask beside each, three raisin trays on a trestle, the steeping shelf of limoncino, the salting
//          crock, the mortar table, a sleepy cat on a sack, and the hatch back down (round 308b: no list view in the loft)
// Tapping a spot (data-vsspot) walks you there; core.js (vsSpot) does the rest.
import { sk, tapeLabel } from "./scenes.js";

const spot = (k, label, x, y, w, art, lx, ly, col = "var(--butter)", size = 9.5) => `<g data-vsspot="${k}" aria-label="${label}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${w}" ry="${Math.round(w/4.5)}" style="fill:var(--butter)"/>${art}${label && lx != null ? tapeLabel(lx, ly, label, col, size) : ""}</g>`;
const mix = (a, b, t) => { const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), A = h(a), B = h(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v)*t).toString(16).padStart(2, "0")).join(""); };
const lantern = (x, night) => `${sk(`<path d="M${x} 0 v34"/><rect x="${x - 8}" y="34" width="16" height="20" rx="3" style="fill:${night ? "#FFD27A" : "#F3E3B8"}"/>`, `<path d="M${x} 0 v34"/><rect x="${x - 8}" y="34" width="16" height="20" rx="3"/><path d="M${x - 10} 34 h20"/>`)}${night ? `<circle class="nglow" cx="${x}" cy="44" r="34" style="fill:#FFD27A" opacity=".18"/>` : ""}`;
const exitMat = (label) => spot("out", label, 260, 612, 54, sk(`<rect x="214" y="600" width="92" height="22" rx="5" style="fill:#B5644A"/>`, `<rect x="214" y="600" width="92" height="22" rx="5"/><path d="M224 606 h72 M224 616 h72" opacity=".4"/>`), 260, 590, "var(--card)", 9);

/* ---------- the barrel shed ---------- */
export const SHED_SLOTS = [[84, 262], [184, 262], [284, 262], [84, 408], [184, 408], [284, 408]];
function barrel(x, y, b){
  const cradle = `<path d="M${x - 30} ${y} l8 -16 h12 l-4 16z M${x + 30} ${y} l-8 -16 h-12 l4 16z" style="fill:#6B4430"/>`;
  if (!b) return `<g opacity=".45">${sk(`<path d="M${x - 30} ${y} l8 -16 h12 l-4 16z M${x + 30} ${y} l-8 -16 h-12 l4 16z" style="fill:#B89878"/>`, `<rect x="${x - 38}" y="${y - 66}" width="76" height="54" rx="26" stroke-dasharray="5 5"/>`)}</g>`;
  const tag = b.ph === "empty" ? ["Empty", "var(--card)"] : b.ph === "ready" ? ["Ready!", "#BFE3C4"] : b.ph === "await2" ? ["Bubbles next", "#F3E3B8"] : [b.left, "#F6EEE4"];
  return sk(`${cradle}<rect x="${x - 38}" y="${y - 66}" width="76" height="54" rx="26" style="fill:${b.ph === "empty" ? "#C9A27E" : "#A8754F"}"/><ellipse cx="${x + 34}" cy="${y - 39}" rx="7" ry="25" style="fill:#8A5A3A"/>
      <rect x="${x - 25}" y="${y - 66}" width="6" height="54" style="fill:#5E5A55"/><rect x="${x + 17}" y="${y - 66}" width="6" height="54" style="fill:#5E5A55"/>${b.col ? `<circle cx="${x - 2}" cy="${y - 39}" r="11" style="fill:${b.col}"/><circle cx="${x - 2}" cy="${y - 39}" r="6" style="fill:#F6EEE4" opacity=".55"/>` : ""}
      ${b.ph === "ferment" || b.ph === "bubbles" ? `<circle cx="${x + 34}" cy="${y - 54}" r="2" style="fill:${b.col}"/>` : ""}`,
    `<path d="M${x - 30} ${y} l8 -16 h12 l-4 16 M${x + 30} ${y} l-8 -16 h-12 l4 16"/><rect x="${x - 38}" y="${y - 66}" width="76" height="54" rx="26"/><ellipse cx="${x + 34}" cy="${y - 39}" rx="7" ry="25"/>${b.col ? `<circle cx="${x - 2}" cy="${y - 39}" r="11"/>` : ""}`)
    + tapeLabel(x, y - 80, tag[0], tag[1], 8.5);
}
// o: {barrels: [{ph, col, left}|null x6, owned up to o.n], n, crates: [{n, col}], bottles, loft, night}
export function shedArt(o){
  const night = o.night, win = night ? "#2E3A5C" : "#CFE0EE";
  let h = `<rect width="520" height="640" style="fill:#C9A27E"/>
    <g opacity=".3" style="stroke:#8A5A3A" stroke-width="1.4">${Array.from({length: 15}, (_, i) => `<path d="M0 ${180 + i*32} H520"/>`).join("")}${Array.from({length: 30}, (_, i) => `<path d="M${(i*97) % 520} ${180 + Math.floor(i/2)*32} v32"/>`).join("")}</g>
    ${sk(`<rect width="520" height="168" style="fill:#7A5232"/>`, `<path d="M0 168 H520"/>`)}<g opacity=".3" style="stroke:#4A2E22">${Array.from({length: 13}, (_, i) => `<path d="M${i*40 + 20} 0 V168"/>`).join("")}</g>
    ${sk(`<rect x="352" y="40" width="80" height="58" rx="3" style="fill:${win}"/>`, `<rect x="352" y="40" width="80" height="58" rx="3"/><path d="M392 40 v58 M352 69 h80"/>`)}${night ? "" : `<g opacity=".35">${[0, 1, 2].map(i => `<circle cx="${368 + i*22}" cy="${56 + (i % 2)*18}" r="${3 + i}" style="fill:#FFFDF6"/>`).join("")}</g>`}
    ${lantern(150, night)}${lantern(300, night)}
    <g opacity=".5">${[[40, 130], [70, 140], [470, 150]].map(([x, y]) => `<path d="M${x} ${y} l10 -6 l4 8z" style="fill:#4A2E22"/>`).join("")}</g>`;
  // the ladder up to the loft, in the back corner
  if (o.loft) h += spot("up", "Up to the loft", 476, 236, 34, sk(`<rect x="452" y="0" width="56" height="26" style="fill:#3B2A20"/><path d="M458 30 L462 232 M494 30 L490 232" style="stroke:#A8754F;stroke-width:5"/>${Array.from({length: 8}, (_, i) => `<path d="M460 ${48 + i*24} H492" style="stroke:#A8754F;stroke-width:4"/>`).join("")}`,
    `<rect x="452" y="0" width="56" height="26"/><path d="M456 30 L460 232 M496 30 L492 232"/>`), 470, 256, "var(--peach)", 8.5);
  // Marco's bench under the window
  h += spot("bench", "Marco's bench", 392, 256, 50, sk(`<rect x="340" y="198" width="104" height="14" rx="2" style="fill:#A8754F"/><rect x="346" y="212" width="8" height="40" style="fill:#8A5A3A"/><rect x="430" y="212" width="8" height="40" style="fill:#8A5A3A"/><rect x="356" y="186" width="18" height="12" rx="2" style="fill:#5E5A55"/><path d="M392 196 l18 -8 l3 4 l-18 8z" style="fill:#6B4430"/><circle cx="426" cy="191" r="6" style="fill:#9CC27E"/>`,
    `<rect x="340" y="198" width="104" height="14" rx="2"/><path d="M350 212 v40 M434 212 v40"/><rect x="356" y="186" width="18" height="12" rx="2"/>`), 392, 122, "#C9E4D2", 8.5);
  // the barrels
  SHED_SLOTS.forEach(([x, y], i) => { const b = o.barrels[i]; h += i < o.n ? spot("b" + i, `Barrel ${i + 1}`, x, y + 4, 42, barrel(x, y, b || {ph: "empty"})) : barrel(x, y, null); });
  // the bottling table
  const bt = Math.min(8, o.bottles || 0);
  h += spot("bottle", "Bottling table", 420, 404, 56, sk(`<rect x="360" y="360" width="120" height="16" rx="2" style="fill:#A8754F"/><rect x="368" y="376" width="8" height="30" style="fill:#8A5A3A"/><rect x="464" y="376" width="8" height="30" style="fill:#8A5A3A"/>
      ${Array.from({length: bt}, (_, i) => `<rect x="${370 + i*11}" y="334" width="8" height="26" rx="3" style="fill:#5B2338"/><rect x="${372 + i*11}" y="328" width="4" height="7" style="fill:#C9A27E"/>`).join("")}${bt ? "" : Array.from({length: 4}, (_, i) => `<rect x="${372 + i*13}" y="336" width="8" height="24" rx="3" style="fill:#DCEAF2" opacity=".85"/>`).join("")}
      <rect x="452" y="330" width="14" height="30" rx="2" style="fill:#5E5A55"/>`,
    `<rect x="360" y="360" width="120" height="16" rx="2"/><path d="M372 376 v30 M468 376 v30"/><rect x="452" y="330" width="14" height="30" rx="2"/>`), 420, 424, "var(--card)", 8.5);
  // the grape crates by the door
  h += spot("crates", "Grape crates", 150, 548, 80, (o.crates.length ? o.crates : [{n: 0, col: "#7A3E8A"}]).slice(0, 3).map((c, i) => { const x = 70 + i*80;
    return sk(`<rect x="${x - 30}" y="498" width="60" height="36" rx="2" style="fill:#D9B58C"/>${Array.from({length: Math.min(6, c.n)}, (_, k) => `<g>${[[-4, 0], [4, 0], [0, 6], [-8, 6], [8, 6], [0, 12]].map(([dx, dy]) => `<circle cx="${x - 16 + (k % 3)*16 + dx/2}" cy="${494 - Math.floor(k/3)*10 + dy/2}" r="3" style="fill:${c.col}"/>`).join("")}</g>`).join("")}`,
      `<rect x="${x - 30}" y="498" width="60" height="36" rx="2"/><path d="M${x - 30} 510 h60 M${x - 30} 522 h60" opacity=".45"/>`); }).join(""), 150, 568, "var(--sage)", 8.5);
  h += exitMat("Out to the vines");
  return h;
}

/* ---------- the drying loft ---------- */
// a cane rack: two posts, three bars, six bunches that shrink and darken from grape to raisin as p goes 0 -> 1
function rack(x, y, r){
  const bunches = r.state === "dry" || r.state === "ready" ? [[-30, -82], [0, -82], [30, -82], [-30, -48], [0, -48], [30, -48]] : [];
  const col = mix(r.col || "#7A3E8A", "#5A3624", r.state === "ready" ? 1 : r.p || 0), rad = 4.6 - 1.6*(r.state === "ready" ? 1 : r.p || 0);
  return sk(`<rect x="${x - 50}" y="${y - 108}" width="6" height="108" style="fill:#A8754F"/><rect x="${x + 44}" y="${y - 108}" width="6" height="108" style="fill:#A8754F"/>${[-100, -66, -32].map(dy => `<rect x="${x - 50}" y="${y + dy}" width="100" height="4" rx="2" style="fill:#D9B58C"/>`).join("")}
      ${bunches.map(([dx, dy]) => `<path d="M${x + dx} ${y + dy - 14} v4" style="stroke:#7FA35A;stroke-width:1.5"/>${[[-4, 0], [4, 0], [0, 6], [-4, 12], [4, 12], [0, 18], [-8, 6], [8, 6]].map(([a, b]) => `<circle cx="${x + dx + a*rad/4.6}" cy="${y + dy - 8 + b*rad/4.6}" r="${rad}" style="fill:${col}"/>`).join("")}`).join("")}`,
    `<path d="M${x - 47} ${y - 108} v108 M${x + 47} ${y - 108} v108"/>${[-100, -66, -32].map(dy => `<path d="M${x - 50} ${y + dy + 2} h100"/>`).join("")}`)
    + (r.state === "locked" ? "" : tapeLabel(x, y - 124, r.state === "empty" ? "Empty" : r.state === "ready" ? "Raisins!" : r.left, r.state === "ready" ? "#BFE3C4" : "#F6EEE4", 8));
}
function cask(x, y, c){
  return sk(`<rect x="${x - 26}" y="${y - 8}" width="52" height="8" style="fill:#6B4430"/><rect x="${x - 24}" y="${y - 50}" width="48" height="42" rx="16" style="fill:${c.state === "empty" ? "#C9A27E" : "#A8754F"}"/><rect x="${x - 15}" y="${y - 50}" width="4" height="42" style="fill:#5E5A55"/><rect x="${x + 11}" y="${y - 50}" width="4" height="42" style="fill:#5E5A55"/>${c.state !== "empty" ? `<circle cx="${x}" cy="${y - 29}" r="7" style="fill:#C98A4A"/>` : ""}`,
    `<rect x="${x - 24}" y="${y - 50}" width="48" height="42" rx="16"/><path d="M${x - 26} ${y} h52"/>`)
    + (c.state === "locked" || c.state === "empty" ? "" : tapeLabel(x, y - 62, c.state === "ready" ? "Ready!" : c.left, c.state === "ready" ? "#BFE3C4" : "#F6EEE4", 8));
}
function tray(x, y, t){
  const col = mix("#9C6BB0", "#5A3624", t.state === "ready" ? 1 : t.p || 0), full = t.state === "dry" || t.state === "ready";
  return sk(`<rect x="${x - 34}" y="${y - 12}" width="68" height="12" rx="2" style="fill:#E8D3A6"/>${full ? Array.from({length: 14}, (_, i) => `<circle cx="${x - 28 + (i % 7)*9.4}" cy="${y - 8 + Math.floor(i/7)*5}" r="${3 - (t.p || 0)}" style="fill:${col}"/>`).join("") : ""}`,
    `<rect x="${x - 34}" y="${y - 12}" width="68" height="12" rx="2"/>`) + (t.state === "locked" ? "" : tapeLabel(x, y - 24, t.state === "empty" ? "Empty" : t.state === "ready" ? "Raisins!" : t.left, t.state === "ready" ? "#BFE3C4" : "#F6EEE4", 7.5));
}
// o: {racks: [r, r], casks: [c, c], trays: [t, t, t], lemon: {state, p, left}, salt, pesto: {locked}, night}
export function loftArt(o){
  const night = o.night;
  let h = `<rect width="520" height="640" style="fill:#D9B58C"/>
    <g opacity=".28" style="stroke:#8A5A3A" stroke-width="1.4">${Array.from({length: 15}, (_, i) => `<path d="M0 ${190 + i*30} H520"/>`).join("")}</g>
    ${sk(`<path d="M0 0 H520 V190 H0z" style="fill:#E8D9BE"/><path d="M0 190 L0 120 L260 6 L520 120 L520 190" style="fill:#F3E7D2"/><path d="M0 120 L260 6 L520 120" style="fill:none;stroke:#8A5A3A;stroke-width:12"/>`, `<path d="M0 120 L260 6 L520 120 M0 190 H520"/><path d="M130 63 V190 M390 63 V190" style="stroke-width:5"/>`)}
    ${sk(`<circle cx="260" cy="96" r="30" style="fill:${night ? "#2E3A5C" : "#CFE0EE"}"/>`, `<circle cx="260" cy="96" r="30"/><path d="M260 66 v60 M230 96 h60"/>`)}
    ${lantern(180, night)}${lantern(340, night)}`;
  // the racks and their casks
  [[95, 300], [95, 470]].forEach(([x, y], i) => { const r = o.racks[i], c = o.casks[i];
    h += spot(i ? "rack2" : "rack", i ? "Cane rack 2" : "Cane rack", x, y + 6, 56, rack(x, y, r), x, y + 20, "var(--peach)", 8.5);
    h += spot(i ? "cask2" : "cask", i ? "Cask 2" : "Cask", 222, y + 4, 34, cask(222, y, c), 222, y + 18, "var(--card)", 8); });
  // the steeping shelf on the wall, the salting crock, the mortar table
  const L = o.lemon, lc = mix("#EAF2EE", "#F3D94A", L.state === "ready" ? 1 : L.p || 0);
  h += spot("lemon", "Steeping shelf", 400, 232, 52, sk(`<rect x="350" y="172" width="100" height="8" rx="2" style="fill:#A8754F"/>${L.state === "empty" ? "" : [0, 1].map(i => `<rect x="${376 + i*34}" y="${138}" width="16" height="34" rx="5" style="fill:${lc}"/><rect x="${380 + i*34}" y="132" width="8" height="8" style="fill:#C9A27E"/>`).join("")}<circle cx="364" cy="166" r="6" style="fill:#F3D94A"/>`,
    `<rect x="350" y="172" width="100" height="8" rx="2"/>${L.state === "empty" ? "" : [0, 1].map(i => `<rect x="${376 + i*34}" y="138" width="16" height="34" rx="5"/>`).join("")}`), 400, 196, "#F3E3B8", 8.5);
  const S = o.salt;
  h += spot("salt", "Salting crock", 442, 314, 36, sk(`<path d="M418 312 q-4 -40 4 -50 h40 q8 10 4 50z" style="fill:#B9B0A4"/><ellipse cx="442" cy="262" rx="24" ry="6" style="fill:#8A8279"/><ellipse cx="442" cy="256" rx="12" ry="5" style="fill:#6E6A64"/>`,
    `<path d="M418 312 q-4 -40 4 -50 h40 q8 10 4 50z"/><ellipse cx="442" cy="262" rx="24" ry="6"/>`) + (S.state === "empty" ? "" : tapeLabel(442, 238, S.state === "ready" ? "Ready!" : S.left, S.state === "ready" ? "#BFE3C4" : "#F6EEE4", 7.5)), 442, 330, "var(--card)", 8.5);
  h += spot("pesto", "The mortar", 432, 452, 50, sk(`<rect x="384" y="412" width="96" height="10" rx="2" style="fill:#A8754F"/><rect x="390" y="422" width="7" height="30" style="fill:#8A5A3A"/><rect x="467" y="422" width="7" height="30" style="fill:#8A5A3A"/>
      <path d="M402 412 q2 -18 18 -18 q16 0 18 18z" style="fill:#D9D2C6"/><path d="M424 396 l12 -16" style="stroke:#8A8279;stroke-width:5"/><circle cx="458" cy="400" r="9" style="fill:#7FA35A"/><rect x="452" y="402" width="12" height="10" rx="2" style="fill:#C9A27E"/>`,
    `<rect x="384" y="412" width="96" height="10" rx="2"/><path d="M402 412 q2 -18 18 -18 q16 0 18 18z"/>`), 432, 470, o.pesto.locked ? "var(--card)" : "#C9E4D2", 8.5);
  // the trays on their trestle
  h += sk(`<rect x="44" y="548" width="262" height="8" rx="2" style="fill:#A8754F"/><path d="M60 556 l-8 30 M290 556 l8 30" style="stroke:#8A5A3A;stroke-width:5"/>`, `<rect x="44" y="548" width="262" height="8" rx="2"/>`);
  [90, 175, 260].forEach((x, i) => { h += spot(["tray", "tray2", "tray3"][i], `Raisin tray ${i + 1}`, x, 560, 36, tray(x, 548, o.trays[i]), null, null); });
  h += tapeLabel(175, 600, "Raisin trays", "var(--peach)", 8.5);
  // the cat, asleep on a sack, and the hatch down
  h += `<g pointer-events="none">${sk(`<path d="M318 600 q-4 -24 14 -28 q22 -2 26 28z" style="fill:#C9A27E"/><ellipse cx="336" cy="574" rx="16" ry="9" style="fill:#E8A25A"/><circle cx="350" cy="568" r="7" style="fill:#E8A25A"/><path d="M346 562 l2 -6 l3 5 M352 562 l3 -5 l1 6" style="fill:#E8A25A"/>`,
    `<ellipse cx="336" cy="574" rx="16" ry="9"/><circle cx="350" cy="568" r="7"/><path d="M347 569 q2 1 4 0" opacity=".7"/><path d="M322 578 q-8 4 -2 8"/>`)}</g>`;
  h += spot("down", "Down the ladder", 446, 590, 42, sk(`<rect x="408" y="548" width="76" height="52" rx="3" style="fill:#3B2A20"/><path d="M424 550 v50 M468 550 v50" style="stroke:#A8754F;stroke-width:4"/>${[0, 1].map(i => `<path d="M424 ${566 + i*18} H468" style="stroke:#A8754F;stroke-width:3"/>`).join("")}`,
    `<rect x="408" y="548" width="76" height="52" rx="3"/>`), 446, 618, "var(--card)", 8.5);
  return h;
}
