// The holiday cottages (round 236): Fig Tree and Bluebell, which Mel buys from Elena and does up for guests. Four
// screens each: downstairs (the sitting room on the left round the fire, the kitchen along the back wall on the right
// with the dining table in front of it, the front door at the bottom and the wooden stairs up, like the mill's),
// upstairs (the bedroom, with the bathroom door in its left wall), the bathroom (tiled to half height, the bath under
// the window, basin and towel rail) and the back garden (a wall with climbing roses, a stepping-stone path, a dining
// corner, the fire pit, a hammock and the hot tub tucked behind planting).
// Round 238 (Mel: "proportionate to me, placed like an interior designer would"): everything is drawn to Mel's scale
// (she is about 54px tall, so 1m is about 34px, softened to at most about 1.2x), under a low beamed cottage ceiling,
// and each room is laid out in zones with clear walkways from the doors to every piece.
// Furniture comes in three tiers in one of six looks (STYLES, src/data/cottages.js); tier 0 is a faint dashed footprint
// of the real size Mel can tap to buy. Mid-changeover the jobs still to do show: a rumpled bed, towels on the floor,
// mugs on the tables, leaves in the tub. Bluebell has blue shutters and a blue door; Fig Tree has its fig tree.
// Positions come from PIECES/ACCESSORIES/SPOTS (front-edge centres), so the drawings follow the data.
import { sk, tapeLabel } from "./scenes.js";
import { STYLES, PIECES, ACCESSORIES, SPOTS } from "../data/cottages.js";

/* ---------- helpers ---------- */
const g = s => `<g pointer-events="none">${s}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const lab = (x, y, t, col = "#F3E1A0", size = 8) => tapeLabel(x, y, t, col, size);
const f1 = n => (+n).toFixed(1);
const R = i => { const x = Math.sin(i*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };   // a steady scatter
const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v)*t).toString(16).padStart(2, "0")).join("").toUpperCase(); };
const dk = (c, t = .25) => mix(c, "#2A1E16", t), lt = (c, t = .3) => mix(c, "#FFFFFF", t);
// hand-drawn: the shapes get the marker fill, and their own outlines in wobbly ink; `det` is fine detail, no outline
const strip = s => s.replace(/ style="[^"]*"/g, "").replace(/ (opacity|fill|stroke-width|stroke-dasharray)="[^"]*"/g, "");
const D = (main, det = "") => sk(main + det, strip(main));
const txt = (x, y, t, size = 7, fill = "#3A2E28", weight = 400) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Klee One,serif" font-weight="${weight}" font-size="${size}" fill="${fill}" pointer-events="none">${t}</text>`;
const at = id => (PIECES[id] || ACCESSORIES[id]).at;

// the state for one render (set at the top of cottageArt)
let S = STYLES.cottagecore, ST = {}, NIGHT = false, GL = [];
const tier = id => +((ST.tiers || {})[id] || 0);
const has = id => !!(ST.acc || {})[id];
const undone = k => !!ST.turn && !ST.turn[k];
let XF = null;   // the scale a free-standing piece is drawn at (about its front-edge centre), so glows land in the right place
const glow = (x, y, r = 40) => { if (XF) { x = XF.x + (x - XF.x)*XF.k; y = XF.y + (y - XF.y)*XF.k; r = r*XF.k; } GL.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#coGlow)"/>`); return ""; };
// free-standing pieces are drawn 1.2x about their front-edge centre (Mel's sprite stands about 64px tall in the room),
// and the things that sit on them (cushions, the fruit, mugs) go through the same transform
const K = {sofa: 1.2, armchair: 1.2, coffee: 1.2, rug: 1.2, lamp: 1.2, dining: 1.2, bedrug: 1.2, bathrug: 1.2, hottub: 1.2, patio: 1.2, hammock: 1.2, firepit: 1.2, bath: 1.15};
const scaled = (id, fn) => { const k = K[id] || 1, [x, y] = PIECES[id].at; if (k === 1) return fn(); const save = XF; XF = {x, y, k}; const s = fn(); XF = save;
  return `<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${s}</g>`; };
const BLUE = "#5277B8", BLUE2 = "#3A5A92", INK = "#3A2E28", CREAM = "#FFFDF6";
// each room's footprint, dolls-house style: x0..x1 wide, the back wall from WT down to FL, the floor down to y1;
// outside it, the cottage's thick whitewashed walls (the bedroom is a little narrower, the bathroom snug)
const ROOMS = {down: {x0: 0, x1: 520, ceil: 0, WT: 99, FL: 210, y1: 640}, up: {x0: 50, x1: 470, ceil: 0, WT: 99, FL: 210, y1: 566}, bath: {x0: 110, x1: 410, ceil: 64, WT: 124, FL: 220, y1: 500}};
let FL = 210, WT = 99;

// a little flame (it flickers via the game's .flame class)
const flame = (x, y, s = 1) => `<path class="flame" d="M${f1(x)} ${f1(y)} q${f1(-6*s)} ${f1(-4*s)} ${f1(-1*s)} ${f1(-13*s)} q${f1(s)} ${f1(5*s)} ${f1(4*s)} ${f1(6*s)} q${f1(3*s)} ${f1(4*s)} ${f1(-3*s)} ${f1(7*s)}z" fill="#F6A23A"/><path class="flame" d="M${f1(x)} ${f1(y)} q${f1(-3*s)} ${f1(-3*s)} 0 ${f1(-7*s)} q${f1(s)} ${f1(3*s)} ${f1(2*s)} ${f1(4*s)} q${f1(s)} ${f1(2*s)} ${f1(-2*s)} ${f1(3*s)}z" fill="#FFE08A"/>`;
// a row of book spines between x0 and x1 standing on `base`, about h tall
const books = (x0, x1, base, seed, h = 12) => { let s = "", x = x0, k = 0; const cols = [S.accent, S.fabric, dk(S.wood, .2), "#E8D9B8", S.fabric2, "#7E8FA6", "#C8553D"];
  while (x < x1 - 2.5) { const w = 2.4 + Math.round(R(seed + k)*2)*.8, hh = h - 3 + Math.round(R(seed*3 + k)*3), c = cols[(k*3 + seed) % cols.length];
    s += `<rect x="${f1(x)}" y="${f1(base - hh)}" width="${f1(w)}" height="${f1(hh)}" fill="${c}" stroke="${INK}" stroke-width=".4"/>`; x += w + .3; k++; }
  return s; };
// a straight-backed chair seen from behind (its back towards us), and one side-on at the end of a table
const chairBack = (x, y, col, h = 26) => `<path d="M${x - 7} ${y} v${-h} M${x + 7} ${y} v${-h}" stroke="${dk(col, .3)}" stroke-width="2.2"/><path d="M${x - 7} ${y - h + 2} h14 M${x - 7} ${y - h + 8} h14" stroke="${dk(col, .3)}" stroke-width="2.2"/><rect x="${x - 8}" y="${y - 12}" width="16" height="3" fill="${dk(col, .15)}"/>`;
const chairSide = (x, y, col, face = 1) => `<path d="M${x} ${y} v-12 M${x + 10*face} ${y} v-12 M${x} ${y - 12} v-14" stroke="${dk(col, .3)}" stroke-width="2.2"/><path d="M${x - face} ${y - 13} h${12*face}" stroke="${dk(col, .2)}" stroke-width="3"/>`;

/* ---------- the spot wrapper, and the faint footprint of a piece not bought yet ---------- */
// FOOT: the real footprint [w, h] above the front edge, for the dashed outline and the hover
const FOOT = {sofa: [86, 38], armchair: [38, 40], coffee: [50, 20], rug: [140, 64], fireplace: [76, 62], lamp: [22, 66], kitchen: [138, 40], dining: [64, 36], bookshelf: [50, 44],
  bed: [66, 84], wardrobe: [48, 80], windowseat: [66, 22], bedrug: [130, 56], vanity: [52, 44],
  bath: [72, 36], basin: [46, 40], bathrug: [56, 20],
  hottub: [78, 50], patio: [70, 36], beds: [300, 26], hammock: [104, 44], firepit: [54, 26]};
const GHOST_LAB = {festoon: [260, 200], windowseat: [400, 196]};
function pieceSpot(id, draw){
  const P = PIECES[id], t = tier(id), [ax, ay] = P.at, [sx, sy] = P.stand, k = K[id] || 1, [w, h] = (FOOT[id] || [40, 30]).map(v => Math.round(v*k));
  const hov = id === "festoon" ? hovE(260, 200, 220, 24) : id === "bedside" ? hovE(ax - 46, ay - 4, 14, 8) + hovE(ax + 46, ay - 4, 14, 8) : hovE(ax, ay - Math.min(h/2, 10), Math.round(w/2 + 4), Math.max(8, Math.min(16, Math.round(h/3))));
  let body;
  if (t) body = scaled(id, () => draw(t, ax, ay));
  else {
    const ghost = id === "festoon" ? `<path d="M32 176 Q260 250 488 176" fill="none"/><path d="M28 262 V172 M492 262 V172"/>` : id === "bedside" ? `<rect x="${ax - 56}" y="${ay - 22}" width="20" height="22" rx="3"/><rect x="${ax + 36}" y="${ay - 22}" width="20" height="22" rx="3"/>`
      : ["hottub", "rug", "bedrug", "firepit"].includes(id) ? `<ellipse cx="${ax}" cy="${ay - h/2}" rx="${w/2}" ry="${h/2}"/>` : `<rect x="${ax - w/2}" y="${ay - h}" width="${w}" height="${h}" rx="4"/>`;
    const [lx, ly] = GHOST_LAB[id] || [ax, ay - h/2];
    body = `<g opacity=".4" pointer-events="none"><g fill="${id === "festoon" ? "none" : "#FFFDF6"}" fill-opacity=".35" style="stroke:var(--line)" stroke-width="1.4" stroke-dasharray="5 4">${ghost}</g></g><g opacity=".85">${lab(lx, ly, P.n, "#EFE6D6", 7)}</g>`;
  }
  return `<g data-cospot="${id}" data-x="${sx}" data-y="${sy}" aria-label="${t ? P.tiers[t - 1].n : `${P.n}: not bought yet`}">${hov}${body}</g>`;
}
const otherSpot = (id, aria, hov, body) => { const [sx, sy] = SPOTS[ST.floor][id]; return `<g data-cospot="${id}" data-x="${sx}" data-y="${sy}" aria-label="${aria}">${hov}${body}</g>`; };

/* ---------- the room shell: a low beamed ceiling, the back wall, the floor, windows ---------- */
function floorArt(y0 = FL){
  let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${S.floor}"/>`;
  if (ST.style === "peranakan") {   // painted floor tiles: cream squares, a jade diamond at each corner, a pink flower
    for (let r = 0; y0 + r*34 < 640; r++) for (let k = 0; k < 16; k++) { const x = k*34, y = y0 + r*34;
      s += `<rect x="${x}" y="${y}" width="34" height="34" style="fill:${S.floor};stroke:${mix(S.floor, S.floor2, .4)}" stroke-width=".8"/><path d="M${x} ${y - 6} l6 6 l-6 6 l-6 -6z" style="fill:${S.floor2}" opacity=".7"/><circle cx="${x + 17}" cy="${y + 17}" r="3.4" style="fill:${S.fabric}" opacity=".6"/>`; }
  } else {
    for (let r = 0; y0 + r*18 < 640; r++) { const y = y0 + r*18;
      s += `<path d="M0 ${y} H520" style="stroke:${S.floor2}" stroke-width="1"/>`;
      for (let k = 0; k < 5; k++) { const x = Math.round((k*130 + r*53) % 650) - 60; s += `<path d="M${x} ${y} v18" style="stroke:${S.floor2}" stroke-width=".9"/>`; }
      if (r % 3 === 1) s += `<path d="M${Math.round(R(r)*440)} ${y + 9} q14 -2 28 0" fill="none" style="stroke:${S.floor2}" stroke-width=".6" opacity=".6"/>`; }
  }
  return s;
}
// the low cottage ceiling: plaster between dark oak beams that run towards us, and the wall plate along the top of the wall
function ceiling(){
  const plaster = lt(S.wall2, .35), oak = dk(S.wood, .42);
  let s = `<rect width="520" height="${WT}" style="fill:${plaster}"/>`;
  for (let k = 0; k < 6; k++) { const xb = 36 + k*90, xt = 260 + (xb - 260)*1.35; s += `<path d="M${f1(xt - 9)} 0 L${f1(xt + 9)} 0 L${xb + 6} ${WT - 7} L${xb - 6} ${WT - 7}z" style="fill:${oak}"/>`; }
  s += `<rect y="${WT - 11}" width="520" height="11" style="fill:${dk(S.wood, .35)}"/><path d="M0 ${WT - 11} H520" style="stroke:${INK}" stroke-width="1"/><path d="M0 ${WT} H520" style="stroke:${INK}" stroke-width="1.2"/>`;
  return s;
}
function wallArt(){
  const D1 = FL - 36;   // the dado rail, about a metre up
  let s = `<rect y="${WT}" width="520" height="${FL - WT}" style="fill:${S.wall}"/>`;
  if (ST.style === "cottagecore") for (let r = 0; WT + 12 + r*16 < D1 - 4; r++) for (let k = 0; k < 18; k++) s += `<g opacity=".4"><circle cx="${k*30 + (r % 2)*15 + 8}" cy="${WT + 13 + r*16}" r="1.5" style="fill:${S.fabric}"/><path d="M${k*30 + (r % 2)*15 + 8} ${WT + 15 + r*16} l-2 3 M${k*30 + (r % 2)*15 + 8} ${WT + 15 + r*16} l2 3" style="stroke:${S.accent}" stroke-width=".6"/></g>`;
  s += `<rect y="${D1}" width="520" height="${FL - D1}" style="fill:${S.wall2}" opacity="${ST.style === "peranakan" ? .5 : 1}"/><rect y="${D1 - 3}" width="520" height="4" style="fill:${lt(S.wood, .25)}"/>`;
  if (ST.style === "peranakan") for (let k = 0; k < 26; k++) s += `<rect x="${k*20}" y="${D1 + 2}" width="20" height="24" style="fill:${k % 2 ? S.floor2 : lt(S.floor2, .45)}" opacity=".55"/><circle cx="${k*20 + 10}" cy="${D1 + 14}" r="4" style="fill:${S.fabric}" opacity=".6"/>`;
  else if (["coastal", "scandi", "cottagecore"].includes(ST.style)) s += Array.from({length: 58}, (_, k) => `<path d="M${k*9 + 4} ${D1 + 2} V${FL - 8}" style="stroke:${dk(S.wall2, .15)}" stroke-width=".6"/>`).join("");
  else s += Array.from({length: 11}, (_, k) => `<rect x="${k*48 + 6}" y="${D1 + 5}" width="38" height="18" rx="1" fill="none" style="stroke:${dk(S.wall2, .15)}" stroke-width=".8"/>`).join("");
  s += `<rect y="${FL - 8}" width="520" height="8" style="fill:${lt(S.wall2, .2)}"/><path d="M0 ${FL - 8} H520" style="stroke:${dk(S.wall2, .35)}" stroke-width=".8"/><path d="M0 ${FL} H520" style="stroke:${INK}" stroke-width="1.3"/>`;
  return s;
}
// the room itself (ceiling, back wall, floor) inside its footprint, and the cottage's thick walls round it
function roomShell(inner = ""){
  const r = ROOMS[ST.floor];
  if (r.x0 === 0 && r.x1 === 520) return g(ceiling() + wallArt() + floorArt() + inner);
  const lime = "#EFE9DD", lime2 = "#E2DACB", oak = dk(S.wood, .45), T = 16;
  let out = `<rect width="520" height="640" style="fill:${lime}"/>`
    // old stone showing through the limewash, and the oak frame of the cottage
    + Array.from({length: 26}, (_, k) => `<ellipse cx="${f1(R(k*3)*520)}" cy="${f1(R(k*5 + 1)*640)}" rx="${f1(8 + R(k)*14)}" ry="${f1(4 + R(k + 2)*6)}" style="fill:${lime2}" opacity=".8"/>`).join("")
    + [r.x0 - T - 22, r.x1 + T + 10].map(x => `<rect x="${x}" y="0" width="12" height="640" style="fill:${oak}"/>`).join("")
    + `<rect y="${Math.max(0, r.ceil - 22)}" width="520" height="12" style="fill:${oak}"/>` + (r.ceil > 30 ? `<path d="M${r.x0 - T - 22} ${r.ceil - 10} L${r.x0 - T - 60} 0 h-12 L${r.x0 - T - 22} ${r.ceil + 20}z M${r.x1 + T + 22} ${r.ceil - 10} L${r.x1 + T + 60} 0 h12 L${r.x1 + T + 22} ${r.ceil + 20}z" style="fill:${oak}"/>` : "");
  const room = clip(r.x0, r.ceil, r.x1 - r.x0, r.y1 - r.ceil, ceiling() + wallArt() + floorArt() + inner);
  // the wall tops round the room (the walls are seen from above, thick and whitewashed)
  const caps = sk(`<rect x="${r.x0 - T}" y="${r.ceil}" width="${T}" height="${r.y1 - r.ceil + T}" style="fill:#F7F3EA"/><rect x="${r.x1}" y="${r.ceil}" width="${T}" height="${r.y1 - r.ceil + T}" style="fill:#F7F3EA"/><rect x="${r.x0 - T}" y="${r.y1}" width="${r.x1 - r.x0 + 2*T}" height="${T}" style="fill:#F7F3EA"/>`,
    `<rect x="${r.x0 - T}" y="${r.ceil}" width="${r.x1 - r.x0 + 2*T}" height="${r.y1 - r.ceil + T}"/><rect x="${r.x0}" y="${r.ceil}" width="${r.x1 - r.x0}" height="${r.y1 - r.ceil}"/>`);
  return g(out + room + caps);
}
// a thin strip of the left-hand wall, for the doors in it
const sideWall = () => g(`<path d="M0 ${FL} H14 V640 H0z" style="fill:${S.wall2}"/>` + sk("", `<path d="M14 ${FL} V640"/>`));   // downstairs only
// what you see through a window: sky, downs and a hedge by day; dark blue, the moon and stars by night
function view(x, y, w, h, seed = 0){
  if (NIGHT) return `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#26325E"/><rect x="${x}" y="${f1(y + h*.65)}" width="${w}" height="${f1(h*.35)}" style="fill:#1E284C"/>`
    + [0, 1, 2, 3].map(k => `<circle cx="${f1(x + 3 + R(seed + k)*(w - 6))}" cy="${f1(y + 3 + R(seed*2 + k*3)*h*.5)}" r=".9" fill="#FFF3C4"/>`).join("")
    + (seed % 2 ? `<path d="M${f1(x + w*.7)} ${y + 7} a4 4 0 1 0 4 5 a3.4 3.4 0 1 1 -4 -5z" fill="#FFF3C4"/>` : "");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#CFE6F2"/><ellipse cx="${f1(x + w*.3)}" cy="${f1(y + h*.22)}" rx="${f1(w*.16)}" ry="2.4" fill="#FFFFFF" opacity=".8"/>`
    + `<path d="M${x} ${f1(y + h*.62)} q${f1(w*.3)} ${f1(-h*.16)} ${f1(w*.6)} ${f1(-h*.05)} q${f1(w*.25)} ${f1(-h*.07)} ${f1(w*.4)} ${f1(h*.02)} V${y + h} H${x}z" style="fill:#A9C98A"/><path d="M${x} ${f1(y + h*.82)} q${f1(w*.5)} ${f1(-h*.08)} ${w} 0 V${y + h} H${x}z" style="fill:#7FA86A"/>`;
}
let CID = 0;
const clip = (x, y, w, h, inner) => { const id = `coClip${++CID}`; return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`; };
function windowArt(x, y, w, h, {curtains = true, seed = 1, shutters = true} = {}){
  let s = `<rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" rx="1" style="fill:${lt(S.wall2, .1)}"/>` + clip(x, y, w, h, view(x, y, w, h, seed));
  s += sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" style="stroke:${CREAM}" stroke-width="3"/><path d="M${x + w/2} ${y} v${h} M${x} ${f1(y + h*.48)} h${w}" style="stroke:${CREAM}" stroke-width="2"/><rect x="${x - 6}" y="${y + h + 2}" width="${w + 12}" height="4" rx="1" style="fill:${lt(S.wood, .2)}"/>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><rect x="${x - 6}" y="${y + h + 2}" width="${w + 12}" height="4" rx="1"/>`);
  if (shutters && ST.c === "bluebell") {   // Bluebell's blue shutters, folded back against the wall
    const sw = Math.round(w*.34);
    s += [x - 5 - sw, x + w + 5].map(sx => D(`<rect x="${sx}" y="${y - 2}" width="${sw}" height="${h + 4}" rx="1" style="fill:${BLUE}"/>`, Array.from({length: Math.floor((h + 2)/6)}, (_, k) => `<path d="M${sx + 2} ${y + 2 + k*6} h${sw - 4}" style="stroke:${BLUE2}" stroke-width=".9"/>`).join(""))).join("");
  }
  if (curtains) s += D(`<path d="M${x - 7} ${y - 7} h${f1(w*.26)} q-4 ${f1(h*.5)} -1 ${f1(h*.6)} q3 ${f1(h*.2)} -4 ${f1(h*.48)} h${f1(-w*.17)} q-3 ${f1(-h*.5)} 0 ${f1(-h*1.08)}z" style="fill:${S.fabric2}"/><path d="M${x + w + 7} ${y - 7} h${f1(-w*.26)} q4 ${f1(h*.5)} 1 ${f1(h*.6)} q-3 ${f1(h*.2)} 4 ${f1(h*.48)} h${f1(w*.17)} q3 ${f1(-h*.5)} 0 ${f1(-h*1.08)}z" style="fill:${S.fabric2}"/>`,
    `<path d="M${x - 10} ${y - 8} H${x + w + 10}" style="stroke:${dk(S.wood, .3)}" stroke-width="2.4" stroke-linecap="round"/><path d="M${x - 1} ${f1(y + h*.62)} q3 1.4 6 0 M${x + w + 1} ${f1(y + h*.62)} q-3 1.4 -6 0" style="stroke:${S.accent}" stroke-width="1.6"/>`);
  return g(s);
}
const nightWash = () => `<rect width="520" height="640" fill="#2E3470" opacity=".3" style="mix-blend-mode:multiply" pointer-events="none"/>`;
const glowDefs = `<defs><radialGradient id="coGlow"><stop offset="0" stop-color="#FFD98A" stop-opacity=".6"/><stop offset=".45" stop-color="#FFC66B" stop-opacity=".22"/><stop offset="1" stop-color="#FFC66B" stop-opacity="0"/></radialGradient></defs>`;

/* ---------- deliveries waiting: wrapped crates and parcels with string ---------- */
const SLOTS = {down: [[332, 612], [360, 612], [346, 592], [318, 592], [374, 592]], up: [[190, 552], [218, 552], [204, 532], [246, 552], [232, 532]],
  bath: [[180, 488], [208, 488], [194, 468], [330, 488], [358, 488]], garden: [[372, 578], [400, 578], [386, 558], [160, 578]]};
function crates(){
  const here = (ST.crates || []).filter(id => { const r = (PIECES[id] || ACCESSORIES[id] || {}).room; return r ? r === ST.floor : ST.floor === "down"; });
  return g(here.slice(0, SLOTS[ST.floor].length).map((id, i) => { const [x, y] = SLOTS[ST.floor][i];
    if (PIECES[id]) return D(`<rect x="${x - 12}" y="${y - 18}" width="24" height="18" rx="1" style="fill:#C9A26A"/>`, `<path d="M${x - 12} ${y - 12} h24 M${x - 12} ${y - 6} h24" stroke="#9A7A4A" stroke-width=".8"/><path d="M${x} ${y - 18} v18 M${x - 12} ${y - 9} h24" stroke="#8A3A2A" stroke-width="1.3"/><path d="M${x} ${y - 18} q-5 -5 -6 0 q1 2 6 0 q5 -5 6 0 q-1 2 -6 0" fill="none" stroke="#8A3A2A" stroke-width="1.1"/>`);
    return D(`<rect x="${x - 9}" y="${y - 12}" width="18" height="12" rx="1.5" style="fill:#D8B98A"/>`, `<path d="M${x} ${y - 12} v12 M${x - 9} ${y - 6} h18" stroke="#7A4A2A" stroke-width="1.1"/><path d="M${x} ${y - 12} q-4 -4 -4 0 q1 1.4 4 0 q4 -4 4 0 q-1 1.4 -4 0" fill="none" stroke="#7A4A2A" stroke-width="1"/>`);
  }).join(""));
}

/* ====================================================================================================== */
/* ---------- downstairs: the sitting room round the fire, the kitchen and the dining table ---------- */
function chimney(){   // the chimney breast and its oak beam: part of the cottage, there before any fireplace
  const [x] = at("fireplace");
  return g(`<rect x="${x - 38}" y="99" width="76" height="${FL - 99}" style="fill:${mix(S.wall, S.wall2, .5)}"/>` + sk("", `<path d="M${x - 38} 99 V${FL} M${x + 38} 99 V${FL}"/>`)
    + D(`<rect x="${x - 40}" y="176" width="80" height="6" rx="1" style="fill:${dk(S.wood, .25)}"/>`, `<path d="M${x - 34} 179 q20 -1 40 0 q14 1 28 -1" fill="none" stroke="${dk(S.wood, .45)}" stroke-width=".6"/>`));
}
function fireplace(t, x, y){
  const fire = (fy, s) => `<path d="M${x - 9*s} ${fy} l${18*s} -3 M${x - 8*s} ${fy - 3} l${16*s} 3" stroke="#6B4A2E" stroke-width="${3*s}" stroke-linecap="round"/>` + flame(x - 3*s, fy - 2, s*.7) + flame(x + 3*s, fy - 2, s*.55) + flame(x, fy - 3, s*.85);
  glow(x, y - 26, t === 3 ? 56 : 46);
  const hearth = `<rect x="${x - 36}" y="${y - 10}" width="72" height="10" rx="1" style="fill:${t === 3 ? "#E8E2D8" : t === 2 ? "#B8AE9E" : "#8E8A86"}"/>`;
  if (t === 1) return D(hearth + `<rect x="${x - 3}" y="182" width="6" height="${y - 42 - 182}" style="fill:#3A3634"/><rect x="${x - 16}" y="${y - 44}" width="32" height="4" rx="1" style="fill:#4A4644"/><rect x="${x - 14}" y="${y - 40}" width="28" height="27" rx="2" style="fill:#3A3634"/><rect x="${x - 9}" y="${y - 35}" width="18" height="15" rx="1.5" style="fill:#2A201C"/>`,
    fire(y - 22, .7) + `<path d="M${x - 11} ${y - 13} v3 M${x + 11} ${y - 13} v3" stroke="#3A3634" stroke-width="2.4"/><path d="M${x + 22} ${y - 10} v-16 M${x + 25} ${y - 10} v-14" stroke="${S.metal}" stroke-width="1.4"/>`);
  if (t === 2) return D(hearth + `<rect x="${x - 32}" y="182" width="64" height="${y - 10 - 182}" style="fill:#CFC4B2"/><path d="M${x - 18} ${y - 10} V${y - 32} q18 -12 36 0 V${y - 10}z" style="fill:#2E2622"/>`,
    [0, 1, 2].map(r => `<path d="M${x - 32} ${190 + r*12} h14 M${x + 18} ${190 + r*12} h14" stroke="#A89C88" stroke-width=".8"/><path d="M${x - 26 + (r % 2)*5} ${182 + r*12} v12 M${x + 26 - (r % 2)*5} ${182 + r*12} v12" stroke="#A89C88" stroke-width=".8"/>`).join("") + fire(y - 12, 1));
  return D(hearth + `<rect x="${x - 34}" y="182" width="68" height="${y - 10 - 182}" style="fill:${S.wood}"/><rect x="${x - 24}" y="188" width="48" height="${y - 10 - 188}" style="fill:${lt(S.accent, .35)}"/><path d="M${x - 15} ${y - 10} V${y - 30} q15 -11 30 0 V${y - 10}z" style="fill:#2E2622"/><rect x="${x - 42}" y="174" width="84" height="8" rx="1.5" style="fill:${dk(S.wood, .15)}"/><path d="M${x + 40} ${y} l2 -14 h14 l2 14z" style="fill:#C9A26A"/>`,
    `${[0, 1, 2].map(k => `<path d="M${x - 32 + k*3} 184 v${y - 196} M${x + 26 + k*3} 184 v${y - 196}" stroke="${dk(S.wood, .3)}" stroke-width=".6"/>`).join("")}${[0, 1, 2, 3].map(k => `<rect x="${x - 23 + (k % 2)*40}" y="${190 + Math.floor(k/2)*12}" width="6" height="10" fill="${S.accent}" opacity=".7"/>`).join("")}`
    + `<path d="M${x - 30} ${y - 8} h60" stroke="${S.metal}" stroke-width="2.4"/>` + fire(y - 12, 1.1)
    + Array.from({length: 11}, (_, k) => `<ellipse cx="${x - 40 + k*8}" cy="${174 + (k % 2)}" rx="4.4" ry="2.4" fill="${k % 3 ? "#6E9A5A" : "#88AE6A"}"/>`).join("") + `<circle cx="${x - 20}" cy="173" r="1.6" fill="#C8483A"/><circle cx="${x + 18}" cy="174" r="1.6" fill="#C8483A"/>`
    + [0, 1, 2].map(k => `<ellipse cx="${x + 45 + k*4}" cy="${y - 14}" rx="3" ry="2.2" fill="#8A6A52" stroke="${INK}" stroke-width=".4"/>`).join(""));
}
function bookshelf(t, x, y){
  if (t === 1) return D(`${[y - 27, y - 14, y - 2].map(py => `<rect x="${x - 24}" y="${py}" width="48" height="3" rx="1" style="fill:${lt(S.wood, .15)}"/>`).join("")}${[x - 22, x + 16].map(bx => `<rect x="${bx}" y="${y - 24}" width="6" height="10" style="fill:#B8583C"/><rect x="${bx}" y="${y - 11}" width="6" height="9" style="fill:#B8583C"/>`).join("")}`,
    books(x - 15, x + 15, y - 14, 3, 10) + books(x - 15, x + 15, y - 2, 7, 9) + `<path d="M${x - 20} ${y - 30} l4 -6 l4 6z M${x + 12} ${y - 27} v-6 h6 v6z" fill="${S.accent}" stroke="${INK}" stroke-width=".4"/>`);
  if (t === 2) return D(`<rect x="${x - 22}" y="${y - 76}" width="44" height="76" style="fill:${S.wood}"/><rect x="${x - 18}" y="${y - 72}" width="36" height="66" style="fill:${dk(S.wood, .35)}"/><rect x="${x - 24}" y="${y - 80}" width="48" height="5" rx="1" style="fill:${dk(S.wood, .1)}"/>`,
    [0, 1, 2].map(k => `<path d="M${x - 18} ${y - 55 + k*17} h36" stroke="${S.wood}" stroke-width="2"/>`).join("") + books(x - 17, x + 17, y - 56, 5) + books(x - 17, x + 10, y - 39, 9) + books(x - 17, x + 17, y - 22, 11) + `<path d="M${x + 11} ${y - 40} q3 -8 6 0z" fill="${S.accent}"/>` + books(x - 17, x + 17, y - 6, 13));
  // the library wall: floor to ceiling, a ladder on a brass rail
  return D(`<rect x="${x - 32}" y="99" width="64" height="${y - 99}" style="fill:${S.wood}"/><rect x="${x - 28}" y="104" width="56" height="${y - 110}" style="fill:${dk(S.wood, .35)}"/>`,
    Array.from({length: 7}, (_, k) => { const by = 122 + k*18; return `<path d="M${x - 28} ${by} h56" stroke="${S.wood}" stroke-width="2"/>` + (by < y - 4 ? books(x - 27, x + 27, by - 1, k*5 + 2, 13) : ""); }).join("")
    + `<path d="M${x - 34} 108 h68" stroke="${S.metal}" stroke-width="1.6"/><path d="M${x + 12} 108 L${x + 20} ${y} M${x + 22} 108 L${x + 30} ${y}" stroke="${dk(S.wood, .45)}" stroke-width="2.2"/>${Array.from({length: 7}, (_, k) => `<path d="M${f1(x + 13 + k*1.15)} ${120 + k*18} h10" stroke="${dk(S.wood, .45)}" stroke-width="1.6"/>`).join("")}`);
}
function kitchen(t, x, y){
  const x0 = x - 66, x1 = x + 68, top = `<rect x="${x0 - 2}" y="${y - 38}" width="${x1 - x0 + 4}" height="8" rx="1" style="fill:${t === 3 ? dk(S.wood, .1) : lt(S.wood, .25)}"/>`;
  const cup = t === 3 ? mix(S.accent, "#FFFFFF", .35) : t === 2 ? mix(S.accent, "#FFFFFF", .5) : S.wall2;
  const doors = (a, b) => Array.from({length: Math.floor((b - a)/18)}, (_, k) => `<rect x="${a + 2 + k*18}" y="${y - 27}" width="15" height="24" rx="1" fill="none" stroke="${dk(cup, .2)}" stroke-width=".8"/><circle cx="${a + 14 + k*18}" cy="${y - 20}" r="1.2" fill="${S.metal}"/>`).join("");
  const range = (rx, w) => `<rect x="${rx}" y="${y - 36}" width="${w}" height="36" rx="2" style="fill:${S.accent}"/><rect x="${rx - 1}" y="${y - 40}" width="${w + 2}" height="5" rx="1" style="fill:${dk(S.accent, .2)}"/>`;
  const rangeDet = (rx, w) => `<rect x="${rx + 3}" y="${y - 26}" width="${w/2 - 4}" height="22" rx="1" fill="${dk(S.accent, .12)}"/><rect x="${rx + w/2 + 1}" y="${y - 26}" width="${w/2 - 4}" height="22" rx="1" fill="${dk(S.accent, .12)}"/><path d="M${rx + 2} ${y - 30} h${w - 4}" stroke="#C3C8CC" stroke-width="1.6"/>${[0, 1, 2].map(k => `<circle cx="${rx + 6 + k*(w - 12)/2}" cy="${y - 33}" r="1.3" fill="#C3C8CC"/>`).join("")}`;
  const sink = (sx, w) => `<path d="M${sx} ${y - 38} h${w} v8 h-${w}z" style="fill:${t === 1 ? "#C3C8CC" : CREAM}"/>`;
  const tap = sx => `<path d="M${sx} ${y - 38} v-8 q0 -3 4 -3" fill="none" stroke="${S.metal}" stroke-width="1.6"/>`;
  if (t === 1) return D(`<rect x="${x0}" y="${y - 30}" width="${x1 - x0}" height="30" style="fill:${cup}"/>${top}${sink(x + 2, 20)}<rect x="${x0 + 8}" y="${y - 42}" width="26" height="4" rx="1" style="fill:#3A3634"/><rect x="${x1 - 32}" y="148" width="30" height="3" style="fill:${S.wood}"/>`,
    `<path d="M${x0 + 2} ${y - 29} q12 3 22 0 q12 3 22 0 v27 h-44z" fill="${S.fabric}" opacity=".85"/>${[0, 1, 2, 3].map(k => `<path d="M${x0 + 6 + k*10} ${y - 29} v27" stroke="${lt(S.fabric, .5)}" stroke-width="1.6"/>`).join("")}${tap(x + 12)}<ellipse cx="${x0 + 15}" cy="${y - 42}" rx="5" ry="1.4" fill="none" stroke="#8A8E92"/><ellipse cx="${x0 + 28}" cy="${y - 42}" rx="5" ry="1.4" fill="none" stroke="#8A8E92"/><path d="M${x0 + 10} ${y - 44} q0 -8 7 -8 q7 0 7 8z" fill="${S.accent}" stroke="${INK}" stroke-width=".5"/>${[0, 1, 2].map(k => `<rect x="${x1 - 30 + k*9}" y="${140 + (k % 2)}" width="6" height="${8 - (k % 2)}" rx="1.4" fill="${["#E8D9B8", S.fabric, "#E8F1F0"][k]}" stroke="${INK}" stroke-width=".4"/>`).join("")}`);
  if (t === 2) return D(`<rect x="${x0}" y="${y - 30}" width="${x1 - x0}" height="30" style="fill:${cup}"/>${top}${range(x0 + 2, 32)}${sink(x + 2, 22)}<rect x="${x1 - 34}" y="116" width="32" height="50" rx="1" style="fill:${S.wood}"/><rect x="${x0 + 2}" y="148" width="28" height="3" style="fill:${S.wood}"/>`,
    rangeDet(x0 + 2, 32) + doors(x0 + 36, x1) + tap(x + 13) + [0, 1, 2].map(r => `<path d="M${x1 - 32} ${132 + r*16} h28" stroke="${dk(S.wood, .3)}" stroke-width="1.6"/>${[0, 1, 2].map(k => `<circle cx="${x1 - 26 + k*9}" cy="${126 + r*16}" r="3.6" fill="${CREAM}" stroke="${S.accent}" stroke-width="1"/>`).join("")}`).join("")
      + [0, 1].map(k => `<rect x="${x0 + 6 + k*12}" y="${139 + k}" width="7" height="${9 - k}" rx="1.4" fill="${["#E8D9B8", S.fabric][k]}" stroke="${INK}" stroke-width=".4"/>`).join(""));
  // the farmhouse kitchen: tiled splashback, a big range under its chimney mantle, a butler sink, copper pans, herbs on the sill
  return D(`<rect x="${x0 - 2}" y="182" width="${x1 - x0 + 4}" height="${y - 38 - 182}" style="fill:${CREAM}"/><rect x="${x0}" y="${y - 30}" width="${x1 - x0}" height="30" style="fill:${cup}"/>${top}<rect x="${x0}" y="140" width="44" height="34" style="fill:${S.wall2}"/><rect x="${x0 - 3}" y="136" width="50" height="5" rx="1" style="fill:${dk(S.wood, .1)}"/>${range(x0 + 2, 40)}${sink(x + 2, 24)}<rect x="${x1 - 32}" y="120" width="30" height="3" style="fill:${S.metal}"/>`,
    Array.from({length: Math.floor((x1 - x0)/9)*3}, (_, k) => { const n = Math.floor((x1 - x0)/9); return `<rect x="${x0 + (k % n)*9}" y="${174 + Math.floor(k/n)*6.6}" width="9" height="6.6" fill="${k % 4 === 1 ? lt(S.accent, .3) : CREAM}" stroke="${mix(S.accent, "#FFFFFF", .5)}" stroke-width=".4"/>`; }).join("")
    + rangeDet(x0 + 2, 40) + doors(x0 + 44, x1) + tap(x + 14)
    + [x1 - 26, x1 - 12].map((px, k) => `<path d="M${px} 123 v4" stroke="${INK}" stroke-width=".8"/><circle cx="${px}" cy="${133 + k*2}" r="${5.4 - k}" fill="#C9824A" stroke="${INK}" stroke-width=".5"/>`).join("")
    + [x - 10, x + 2, x + 14].map((px, k) => `<path d="M${px - 3.4} 170 h7 l-1.4 4 h-4z" fill="#C8643B" stroke="${INK}" stroke-width=".4"/>${[0, 1, 2].map(j => `<ellipse cx="${px - 2 + j*2}" cy="${166 - (j % 2)*2}" rx="1.6" ry="3" fill="${k === 1 ? "#88AE6A" : "#6E9A5A"}"/>`).join("")}`).join(""));
}
function fridge(){
  const [sx] = SPOTS.down.fridge, x0 = sx - 16, y = 240, col = mix(S.accent, "#FFFFFF", .72);
  const note = ST.fridge ? `<g transform="rotate(-6 ${sx} 212)"><rect x="${sx - 13}" y="205" width="26" height="14" rx="1" fill="#F4C7CF" stroke="${INK}" stroke-width=".5"/>${txt(sx, 214, "Welcome!", 5.4, INK, 700)}<circle cx="${sx}" cy="205" r="1.8" fill="${S.accent}"/></g>` : "";
  return otherSpot("fridge", ST.fridge ? "The fridge: welcome treats inside" : "The fridge", hovE(sx, 246, 22, 9),
    D(`<path d="M${x0} ${y} V185 q0 -9 9 -9 h14 q9 0 9 9 V${y}z" style="fill:${col}"/>`, `<path d="M${x0} 198 h32" stroke="${dk(col, .3)}" stroke-width="1"/><path d="M${x0 + 4} 186 v8 M${x0 + 4} 203 v16" stroke="#9AA0A6" stroke-width="2.4" stroke-linecap="round"/><circle cx="${x0 + 24}" cy="226" r="1.8" fill="#C8553D"/><circle cx="${x0 + 14}" cy="232" r="1.8" fill="#7FA06B"/>`) + note
    + lab(sx, 254, "Fridge", "#E6EEF2", 7));
}
function dining(t, x, y){
  const W = {1: 24, 2: 30, 3: 40}[t], ty = y - 36;
  let back = "";
  if (t === 1) back = chairBack(x - 11, y - 18, S.metal) + chairBack(x + 11, y - 18, S.metal);
  if (t === 2) back = chairBack(x - 14, y - 20, S.wood) + chairBack(x + 14, y - 20, S.wood);
  if (t === 3) back = `<rect x="${x - 34}" y="${y - 44}" width="68" height="5" rx="1.5" fill="${S.wood}" stroke="${INK}" stroke-width=".8"/><path d="M${x - 30} ${y - 39} v6 M${x + 30} ${y - 39} v6" stroke="${dk(S.wood, .3)}" stroke-width="2"/>`;
  const legs = t === 1 ? `<path d="M${x - W + 4} ${ty + 18} L${x - W + 12} ${y} M${x - W + 12} ${ty + 18} L${x - W + 4} ${y} M${x + W - 4} ${ty + 18} L${x + W - 12} ${y} M${x + W - 12} ${ty + 18} L${x + W - 4} ${y}" stroke="${S.metal}" stroke-width="1.8"/>`
    : `<rect x="${x - W + 2}" y="${ty + 18}" width="4" height="${y - ty - 18}" style="fill:${dk(S.wood, .2)}"/><rect x="${x + W - 6}" y="${ty + 18}" width="4" height="${y - ty - 18}" style="fill:${dk(S.wood, .2)}"/>`;
  const ends = t > 1 ? chairSide(x - W - 14, y - 2, S.wood, 1) + chairSide(x + W + 14, y - 2, S.wood, -1) : "";
  const top = `<rect x="${x - W}" y="${ty}" width="${W*2}" height="14" rx="1.5" style="fill:${t === 1 ? lt(S.wood, .3) : S.wood}"/><rect x="${x - W}" y="${ty + 14}" width="${W*2}" height="4" style="fill:${dk(S.wood, .25)}"/>`;
  const runner = t === 3 ? `<rect x="${x - W + 8}" y="${ty + 5}" width="${W*2 - 16}" height="5" fill="${S.fabric2}" opacity=".9"/>${[x - W + 6, x + W - 6].map(cx => `<rect x="${cx - 1.4}" y="${ty - 4}" width="2.8" height="9" fill="${CREAM}" stroke="${INK}" stroke-width=".4"/>`).join("")}` : "";
  return back + D(top + (t === 1 ? "" : legs), (t === 1 ? legs : "") + ends + runner);
}
function fruitBowl(){   // the fruit basket on the dining table (filled when st.basket)
  const [dx, dy] = at("dining"), t = tier("dining"), x = dx - 14, y = t ? dy - 28 : dy - 4;
  const fruit = ST.basket ? `<circle cx="${x - 4}" cy="${y - 5}" r="3.2" fill="#D9433A"/><circle cx="${x + 2}" cy="${y - 6}" r="3.2" fill="#F2A03A"/><path d="M${x + 6} ${y - 3} q-3 -6 1 -8 q3 2 2 8z" fill="#A8C25A"/><circle cx="${x - 1}" cy="${y - 3}" r="2.8" fill="#7A4A66"/>` : "";
  return otherSpot("basket", ST.basket ? "The fruit basket, full" : "The fruit basket, empty", hovE(x, y + 2, 13, 7)
    + `<rect x="${x - 22}" y="${y - 22}" width="44" height="32" rx="8" fill="transparent" pointer-events="all"/>`,   // round 254 (Mel: tapping the basket opened the dining table): a finger-sized tap area over the bowl, above the table's
    `<g pointer-events="none">${fruit}${D(`<path d="M${x - 9} ${y - 3} h18 q-2 6 -9 6 q-7 0 -9 -6z" style="fill:#C9A26A"/>`)}</g>`);
}
function rug(t, x, y){
  if (t === 1) return D(`<ellipse cx="${x}" cy="${y - 30}" rx="62" ry="30" style="fill:${S.fabric2}"/>`, [S.fabric, S.accent, S.wall2, S.fabric, lt(S.accent, .3)].map((c, k) => `<ellipse cx="${x}" cy="${y - 30}" rx="${56 - k*10}" ry="${26 - k*4.6}" fill="none" stroke="${c}" stroke-width="3.6" stroke-dasharray="${7 + k} 2.4"/>`).join(""));
  if (t === 2) return D(`<rect x="${x - 66}" y="${y - 62}" width="132" height="62" rx="3" style="fill:${S.fabric2}"/>`, `<rect x="${x - 60}" y="${y - 57}" width="120" height="52" rx="2" fill="none" stroke="${S.accent}" stroke-width="2.4"/><rect x="${x - 54}" y="${y - 52}" width="108" height="42" fill="none" stroke="${S.fabric}" stroke-width="1"/>`);
  const c = mix(S.fabric, "#8E3A3A", .35);
  return D(`<rect x="${x - 72}" y="${y - 66}" width="144" height="66" rx="2" style="fill:${c}"/>`,
    `<rect x="${x - 66}" y="${y - 61}" width="132" height="56" fill="none" stroke="${S.fabric2}" stroke-width="4"/>${Array.from({length: 16}, (_, k) => `<path d="M${x - 62 + k*8} ${y - 61} l2 -2 l2 2" fill="none" stroke="${S.accent}" stroke-width=".9"/>`).join("")}<path d="M${x} ${y - 53} l30 20 l-30 20 l-30 -20z" fill="${S.fabric2}" opacity=".9"/><path d="M${x} ${y - 45} l18 12 l-18 12 l-18 -12z" fill="${S.accent}"/><circle cx="${x}" cy="${y - 33}" r="3.4" fill="${S.metal}"/>`
      + Array.from({length: 9}, (_, k) => `<path d="M${x - 72} ${y - 63 + k*7.4} h-4 M${x + 72} ${y - 63 + k*7.4} h4" stroke="${lt(S.fabric2, .2)}" stroke-width="1.2"/>`).join(""));
}
function coffee(t, x, y){
  if (t === 1) return D(`<rect x="${x - 18}" y="${y - 20}" width="36" height="5" style="fill:${lt("#C9A26A", .15)}"/><rect x="${x - 17}" y="${y - 15}" width="34" height="15" style="fill:#C9A26A"/>`, `<path d="M${x - 17} ${y - 10} h34 M${x - 17} ${y - 5} h34" stroke="#9A7A4A" stroke-width=".8"/>`);
  if (t === 2) return D(`<rect x="${x - 24}" y="${y - 20}" width="48" height="7" rx="1.5" style="fill:${lt(S.wood, .1)}"/><rect x="${x - 22}" y="${y - 13}" width="3.4" height="13" style="fill:${dk(S.wood, .2)}"/><rect x="${x + 18.6}" y="${y - 13}" width="3.4" height="13" style="fill:${dk(S.wood, .2)}"/>`);
  return D(`<rect x="${x - 22}" y="${y - 7}" width="44" height="3" style="fill:${S.metal}"/><rect x="${x - 26}" y="${y - 21}" width="52" height="6" rx="1.5" style="fill:#DDEEF2" opacity=".8"/>`,
    `<path d="M${x - 24} ${y - 15} v15 M${x + 24} ${y - 15} v15" stroke="${S.metal}" stroke-width="2.2"/><rect x="${x - 16}" y="${y - 11}" width="16" height="4" fill="${S.accent}" stroke="${INK}" stroke-width=".4"/><rect x="${x + 4}" y="${y - 12}" width="12" height="5" fill="${dk(S.wood, .2)}" stroke="${INK}" stroke-width=".4"/><rect x="${x - 14}" y="${y - 25}" width="12" height="3.4" fill="${S.fabric2}" stroke="${INK}" stroke-width=".4"/><path d="M${x + 12} ${y - 21} l-2 -5 h7 l-2 5z" fill="#C8643B"/><ellipse cx="${x + 13}" cy="${y - 29}" rx="3" ry="3.6" fill="#6E9A5A"/>`);
}
// the sofa faces the fire, so we see its back; the tops of the seat cushions peek over it
function sofa(t, x, y){
  const col = t === 1 ? mix(S.fabric2, "#B8A890", .3) : t === 2 ? S.fabric : dk(S.fabric, .12), d = dk(col, .18);
  const main = `<rect x="${x - 34}" y="${y - 40}" width="68" height="10" rx="4" style="fill:${lt(col, .15)}"/><rect x="${x - 38}" y="${y - 34}" width="76" height="30" rx="${t === 3 ? 9 : 6}" style="fill:${col}"/>`
    + `<rect x="${x - 44}" y="${y - 31}" width="12" height="27" rx="${t === 3 ? 6 : 4}" style="fill:${d}"/><rect x="${x + 32}" y="${y - 31}" width="12" height="27" rx="${t === 3 ? 6 : 4}" style="fill:${d}"/><rect x="${x - 40}" y="${y - 7}" width="80" height="4" style="fill:${dk(col, .3)}"/>`;
  let det = t === 3 ? `<path d="M${x - 38} ${y} v-3 M${x + 38} ${y} v-3 M${x - 10} ${y} v-3 M${x + 10} ${y} v-3" stroke="${S.metal}" stroke-width="2.6" stroke-linecap="round"/>` : `<path d="M${x - 36} ${y - 3} l-1 3 M${x + 36} ${y - 3} l1 3" stroke="${dk(S.wood, .3)}" stroke-width="2"/>`;
  det += `<path d="M${x} ${y - 39} v8" stroke="${d}" stroke-width=".8"/>`;
  if (t === 1) det += `<rect x="${x + 8}" y="${y - 24}" width="10" height="8" fill="${lt(S.accent, .3)}" stroke="${INK}" stroke-width=".5" stroke-dasharray="1.6 1" transform="rotate(6 ${x + 13} ${y - 20})"/>`;
  if (t === 2) det += `<path d="M${x - 36} ${y - 29} h72" stroke="${lt(col, .35)}" stroke-width="1"/>`;
  if (t === 3) det += [0, 1].map(r => [0, 1, 2, 3, 4, 5].map(k => `<circle cx="${x - 28 + k*11 + (r % 2)*5.5}" cy="${y - 26 + r*8}" r="1" fill="${dk(col, .35)}"/>`).join("")).join("") + `<ellipse cx="${x - 14}" cy="${y - 29}" rx="14" ry="2.4" fill="#FFFFFF" opacity=".18"/>`;
  return D(main, det);
}
// the armchair, side-on, angled in towards the fire and the rug
function armchair(t, x, y){
  if (t === 1) { const c = lt(S.wood, .3);
    return D(`<path d="M${x - 18} ${y - 6} q-4 -24 6 -32 q6 2 6 14 h20 q4 0 4 6 v12z" style="fill:${c}"/><rect x="${x - 10}" y="${y - 20}" width="26" height="7" rx="3" style="fill:${S.fabric2}"/>`,
      `${[0, 1, 2].map(k => `<path d="M${x - 16} ${y - 24 + k*6} q14 -2 30 0" fill="none" stroke="${dk(c, .25)}" stroke-width=".6"/>`).join("")}<path d="M${x - 14} ${y - 6} l-2 6 M${x + 14} ${y - 6} l2 6" stroke="${dk(c, .3)}" stroke-width="2"/>`); }
  const col = t === 2 ? mix(S.accent, S.fabric2, .35) : S.accent, d = dk(col, .2);
  const back = t === 3 ? `<path d="M${x - 18} ${y - 6} V${y - 40} q0 -6 6 -6 q4 0 4 6 q6 0 6 8 l-4 4 V${y - 6}z" style="fill:${col}"/>` : `<path d="M${x - 18} ${y - 6} V${y - 32} q0 -5 5 -5 q5 0 5 5 V${y - 6}z" style="fill:${col}"/>`;
  const stool = t === 3 ? `<rect x="${x + 22}" y="${y - 12}" width="16" height="8" rx="3" style="fill:${col}"/>` : "";
  return D(back + `<rect x="${x - 12}" y="${y - 19}" width="28" height="7" rx="3" style="fill:${lt(col, .12)}"/><rect x="${x - 12}" y="${y - 13}" width="28" height="8" style="fill:${d}"/><rect x="${x - 10}" y="${y - 26}" width="26" height="7" rx="3.4" style="fill:${col}"/>` + stool,
    `<path d="M${x - 14} ${y - 5} v5 M${x + 14} ${y - 5} v5" stroke="${dk(S.wood, .3)}" stroke-width="2.4"/>` + (t === 3 ? `<path d="M${x + 25} ${y - 4} v4 M${x + 35} ${y - 4} v4" stroke="${dk(S.wood, .3)}" stroke-width="2"/>` : ""));
}
function lamp(t, x, y){
  if (t === 1) { glow(x, y - 66, 44); return D(`<ellipse cx="${x}" cy="${y - 1}" rx="7" ry="2.4" style="fill:${S.wood}"/><circle cx="${x}" cy="${y - 64}" r="9" style="fill:${NIGHT ? "#FFF3D0" : CREAM}"/>`, `<path d="M${x} ${y - 2} V${y - 55}" stroke="${S.wood}" stroke-width="1.8"/>${[-5, 0, 5].map(d => `<path d="M${x + d*.9} ${y - 72} q${d*.5} 8 0 16" fill="none" stroke="#D8CCB8" stroke-width=".6"/>`).join("")}`); }
  if (t === 2) { glow(x, y - 62, 40); return D(`<ellipse cx="${x}" cy="${y - 1}" rx="7" ry="2.4" style="fill:${S.metal}"/><path d="M${x - 7} ${y - 74} h14 l3 13 h-20z" style="fill:${NIGHT ? lt(S.fabric2, .5) : S.fabric2}"/>`, `<path d="M${x} ${y - 2} V${y - 61}" stroke="${S.metal}" stroke-width="2"/>`); }
  glow(x - 34, y - 70, 46);
  return D(`<rect x="${x - 6}" y="${y - 7}" width="12" height="7" rx="1.5" style="fill:#E8E4DC"/><path d="M${x - 44} ${y - 72} q10 -11 20 0z" style="fill:${S.metal}"/>`, `<path d="M${x} ${y - 7} Q${x + 4} ${y - 104} ${x - 34} ${y - 80}" fill="none" stroke="${S.metal}" stroke-width="2.2"/><ellipse cx="${x - 34}" cy="${y - 72}" rx="6" ry="1.6" fill="${NIGHT ? "#FFE8A8" : "#F2E6C8"}"/>`);
}
function gardenDoor(){   // the back door to the garden, in the left wall, near the front
  const col = ST.c === "bluebell" ? BLUE : "#7E9A68";
  return otherSpot("garden", "The back door to the garden", hovE(30, 574, 24, 10),
    D(`<path d="M1 494 L16 501 V572 L1 582z" style="fill:${col}"/><path d="M4 500 L13 505 V530 L4 527z" style="fill:${NIGHT ? "#26325E" : "#CFE6F2"}"/><path d="M4 582 l16 -8 h18 l-14 10z" style="fill:#B9875E"/>`, `<circle cx="13" cy="542" r="1.4" fill="${S.metal}"/>`)
    + lab(36, 598, "Garden", "#D8EBC8", 8));
}
function calendar(){
  const [x] = SPOTS.down.calendar;
  return otherSpot("calendar", "The bookings calendar", hovE(x, 142, 18, 22),
    g(D(`<rect x="${x - 11}" y="126" width="22" height="28" rx="1" style="fill:${CREAM}"/><rect x="${x - 11}" y="126" width="22" height="6" style="fill:${S.accent}"/>`,
      `<circle cx="${x}" cy="122" r="1.2" fill="${INK}"/><path d="M${x} 122 v4" stroke="${INK}" stroke-width=".7"/>${Array.from({length: 16}, (_, k) => `<rect x="${x - 9 + (k % 4)*4.6}" y="${134 + Math.floor(k/4)*4.8}" width="3.8" height="4" fill="${[2, 3, 9, 10, 14].includes(k) ? S.fabric : "#EFE8DA"}" stroke="#C9C0B0" stroke-width=".2"/>`).join("")}`))
    + lab(x, 112, "Bookings", "#F4D3C8", 7));
}
function broomCupboard(){   // a slim cupboard by the kitchen, its door ajar on a broom and dustpan
  const [x] = SPOTS.down.tidy, y = 240;
  return otherSpot("tidy", "The broom cupboard", hovE(x, 246, 16, 8),
    g(D(`<rect x="${x - 11}" y="${y - 68}" width="22" height="68" style="fill:${lt(S.wood, .1)}"/><rect x="${x - 7}" y="${y - 62}" width="12" height="60" style="fill:${dk(S.wood, .45)}"/><path d="M${x + 5} ${y - 62} l6 -2 v62 l-6 -2z" style="fill:${lt(S.wood, .2)}"/>`,
      `<path d="M${x - 3} ${y - 58} L${x - 1} ${y - 12}" stroke="#8A6A52" stroke-width="1.8"/><path d="M${x - 6} ${y - 2} l2 -10 h6 l2 10z" fill="#D9B866"/><path d="M${x + 1} ${y - 2} h5 l-1 -6 h-4z" fill="${S.accent}"/>`))
    + lab(x, 160, "Broom cupboard", "#E6DDF2", 7));
}
function consoleArt(){   // the console table behind the sofa, where the guest book and the catalogue live
  const [gx] = SPOTS.down.guestbook, [cx] = SPOTS.down.catalogue, x0 = gx - 26, x1 = cx + 36, y = 500;
  return g(D(`<rect x="${x0}" y="${y - 30}" width="${x1 - x0}" height="5" rx="1" style="fill:${S.wood}"/><rect x="${x0 + 2}" y="${y - 25}" width="${x1 - x0 - 4}" height="7" style="fill:${dk(S.wood, .12)}"/><rect x="${x0 + 3}" y="${y - 18}" width="3.4" height="18" style="fill:${dk(S.wood, .25)}"/><rect x="${x1 - 6.4}" y="${y - 18}" width="3.4" height="18" style="fill:${dk(S.wood, .25)}"/>`,
    `<circle cx="${(x0 + x1)/2}" cy="${y - 21}" r="1.2" fill="${S.metal}"/><path d="M${x0 + 10} ${y - 4} h${x1 - x0 - 20}" stroke="${dk(S.wood, .25)}" stroke-width="1.6"/><path d="M${x0 + 8} ${y - 6} l-2 -8 h12 l-2 8z" fill="#C9A26A"/>`));
}
function guestbook(){
  const [x] = SPOTS.down.guestbook, y = 470;
  return otherSpot("guestbook", "The guest book", hovE(x, 498, 18, 8),
    g(D(`<path d="M${x - 11} ${y} l1 -6 q5 -2 10 1 q5 -3 10 -1 l1 6 q-6 -2 -11 1 q-5 -3 -11 -1z" style="fill:${CREAM}"/>`, `<path d="M${x} ${y - 5} v6" stroke="${INK}" stroke-width=".5"/><path d="M${x + 6} ${y + 1} l7 -5" stroke="${S.accent}" stroke-width="1.2"/>`))
    + lab(x - 8, 522, "Guest book", "#F4D3C8", 8));
}
function catalogue(){
  const [x] = SPOTS.down.catalogue, y = 470;
  return otherSpot("catalogue", "The furniture catalogue", hovE(x, 498, 16, 8),
    g(D(`<rect x="${x - 9}" y="${y - 10}" width="18" height="10" rx="1" style="fill:#E8574A"/><path d="M${x - 9} ${y} h18 v-2 h-18z" style="fill:${CREAM}"/>`, `<path d="M${x - 9} ${y - 7} h18" stroke="${CREAM}" stroke-width="1.4"/><circle cx="${x}" cy="${y - 4}" r="1.6" fill="#F6E3A1"/>`))
    + lab(x + 8, 542, "Catalogue", "#F3E1A0", 8));
}
// the stairs up: side-on wooden stairs, exactly the mill's (six treads rising to the right over a solid stringer,
// a handrail on turned balusters, a newel post at the foot), here against the right of the bottom
function stairsUp(){
  const X = 398, B = 612, RW = 19, RH = 15, N = 6, top = B - N*RH, prof = `M${X} ${B} ${Array.from({length: N}, (_, k) => `V${B - (k + 1)*RH} H${X + (k + 1)*RW}`).join(" ")} V${B} Z`;
  return otherSpot("stairs", "Up the stairs: the bedroom and bathroom", hovE(X + 56, B - 4, 66, 12),
    sk(`<path d="${prof}" style="fill:#8A6340"/>${Array.from({length: N}, (_, k) => `<rect x="${X + k*RW - 1}" y="${B - (k + 1)*RH - 2}" width="${RW + 3}" height="4" rx="1" style="fill:#B9875E"/>`).join("")}
      ${Array.from({length: N}, (_, k) => `<path d="M${X + k*RW + RW/2} ${B - (k + 1)*RH - 2} V${B - (k + 1)*RH - 30}" style="stroke:#6B4A2E" stroke-width="2"/>`).join("")}
      <path d="M${X + 2} ${B - 44} L${X + N*RW + 2} ${top - 32}" style="stroke:#5A3A2A" stroke-width="3.5" stroke-linecap="round"/><rect x="${X - 2}" y="${B - 50}" width="7" height="50" rx="1.5" style="fill:#6B4A2E"/><circle cx="${X + 1.5}" cy="${B - 52}" r="4" style="fill:#5A3A2A"/>`,
      `<path d="${prof}"/><path d="M${X + 2} ${B - 44} L${X + N*RW + 2} ${top - 32}"/>`)
    + lab(X + 30, 628, "Upstairs", "#F3E1A0", 8));
}
const exitMat = () => `<g data-exit="1" aria-label="Out of the front door to the lane"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${ST.c === "bluebell" ? BLUE : "#C9A27E"}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none"${ST.c === "bluebell" ? ` style="fill:#FFFDF6"` : ""}>Exit</text></g>`;

// the one-off touches downstairs, each where a stylist would put it
function accDown(id){
  if (!has(id)) return "";
  const [x, y] = at(id);
  if (id === "prints") return g(D(`<rect x="${x - 13}" y="${y - 16}" width="26" height="30" style="fill:${dk(S.wood, .2)}"/><rect x="${x - 31}" y="${y - 8}" width="13" height="17" style="fill:${S.metal}"/><rect x="${x + 18}" y="${y - 8}" width="13" height="17" style="fill:${S.metal}"/>`,
    `<rect x="${x - 10}" y="${y - 13}" width="20" height="24" fill="#CFE6F2"/><path d="M${x - 10} ${y + 2} q10 -8 20 -3 v12 h-20z" fill="#7FA86A"/><circle cx="${x + 5}" cy="${y - 7}" r="2.4" fill="#F6E3A1"/><rect x="${x - 29}" y="${y - 6}" width="9" height="13" fill="${CREAM}"/><circle cx="${x - 24.5}" cy="${y - 1}" r="2.4" fill="${S.fabric}"/><rect x="${x + 20}" y="${y - 6}" width="9" height="13" fill="${S.fabric2}"/><path d="M${x + 22} ${y + 5} l3 -6 l3 6z" fill="${S.accent}"/>`));
  if (id === "candles") { glow(x, y - 10, 30); return g(D(`<rect x="${x - 16}" y="${y - 8}" width="5" height="8" rx="1" style="fill:${CREAM}"/><rect x="${x - 3}" y="${y - 12}" width="6" height="12" rx="1" style="fill:${CREAM}"/><rect x="${x + 11}" y="${y - 6}" width="5" height="6" rx="1" style="fill:${CREAM}"/>`, flame(x - 13.5, y - 8, .35) + flame(x, y - 12, .4) + flame(x + 13.5, y - 6, .32))); }
  if (id === "records") return g(D(`<rect x="${x - 20}" y="${y - 24}" width="40" height="24" style="fill:${S.wood}"/><rect x="${x - 21}" y="${y - 28}" width="42" height="5" rx="1" style="fill:${dk(S.wood, .1)}"/><rect x="${x - 16}" y="${y - 34}" width="20" height="6" rx="1" style="fill:${lt(S.wood, .2)}"/>`,
    `<ellipse cx="${x - 6}" cy="${y - 34}" rx="7" ry="1.8" fill="#2A2420"/><circle cx="${x - 6}" cy="${y - 34}" r=".9" fill="${S.fabric}"/>${[0, 1, 2, 3, 4, 5].map(k => `<rect x="${x - 17 + k*5.6}" y="${y - 20}" width="4.4" height="15" fill="${[S.accent, S.fabric, "#2A2420", S.fabric2, "#E8D9B8", "#7E8FA6"][k]}" stroke="${INK}" stroke-width=".3"/>`).join("")}<path d="M${x + 9} ${y - 28} l-2 -6 h7 l-2 6z" fill="#C8643B"/><ellipse cx="${x + 10.5}" cy="${y - 37}" rx="3" ry="3.4" fill="#6E9A5A"/>`));
  if (id === "diffuser") return g(D(`<rect x="${x - 3}" y="${y - 8}" width="6" height="8" rx="1.4" style="fill:#C9B3E3"/>`, `<path d="M${x - 1} ${y - 8} l-4 -10 M${x} ${y - 8} l1 -11 M${x + 1} ${y - 8} l4 -9" stroke="#5A3A2A" stroke-width=".6"/>`));
  if (id === "flowers") { const fy = tier("dining") ? y : at("dining")[1] - 2; return g(D(`<path d="M${x - 4} ${fy} q-3 -7 1 -11 h6 q4 4 1 11z" style="fill:${CREAM}"/>`,
    [[-6, -18, S.fabric], [0, -21, "#F6E3A1"], [6, -18, S.fabric], [-3, -15, "#FFFFFF"], [4, -14, "#C9B3E3"]].map(([dx, dy, c]) => `<path d="M${x} ${fy - 11} L${x + dx} ${fy + dy}" stroke="#6E9A5A" stroke-width=".8"/><circle cx="${x + dx}" cy="${fy + dy}" r="2.4" fill="${c}" stroke="${INK}" stroke-width=".3"/>`).join(""))); }
  if (id === "cushions") return g(D(`<path d="M${x - 30} ${y - 6} q8 -4 16 0 q1 7 -1 12 h-14 q-2 -5 -1 -12z" style="fill:${S.accent}"/><path d="M${x + 10} ${y - 6} q8 -4 16 0 q1 7 -1 12 h-14 q-2 -5 -1 -12z" style="fill:${S.fabric2}"/><path d="M${x + 26} ${y - 4} q10 -2 16 6 v22 q-6 4 -10 0 q2 -16 -8 -20z" style="fill:${lt(S.fabric, .25)}"/>`,
    `<circle cx="${x - 22}" cy="${y}" r="2.4" fill="none" stroke="${lt(S.accent, .4)}" stroke-width=".9"/><path d="M${x + 12} ${y - 2} h12 M${x + 12} ${y + 2} h12" stroke="${S.accent}" stroke-width=".7"/>${[0, 1, 2].map(k => `<path d="M${x + 31 + k*3} ${y} q1 12 0 22" stroke="${S.accent}" stroke-width=".7" fill="none"/>`).join("")}`));
  return "";
}
// guests in, or the changeover still to do
function livedDown(){
  let s = "";
  const [cx, cy] = at("coffee"), [dx, dy] = at("dining");
  if (ST.occupied) {
    s += g(D(`<rect x="184" y="584" width="22" height="20" rx="3" style="fill:#C8553D"/>`, `<path d="M190 584 v-4 h10 v4" fill="none" stroke="${INK}" stroke-width="1.2"/><circle cx="191" cy="594" r="2.4" fill="#F6E3A1"/><rect x="197" y="590" width="6" height="4" fill="#7FB0CF"/><circle cx="187" cy="605" r="1.4" fill="${INK}"/><circle cx="203" cy="605" r="1.4" fill="${INK}"/>`));
    const [bx, by] = tier("coffee") ? [cx + 8, cy - 20] : [cx + 30, cy - 4];
    s += scaled("coffee", () => g(`<g transform="rotate(-8 ${bx} ${by})">${D(`<path d="M${bx - 9} ${by} l1 -5 q4 -1 8 1 q4 -2 8 -1 l1 5 q-4 -1 -9 1 q-5 -2 -9 -1z" style="fill:${CREAM}"/>`, `<path d="M${bx} ${by - 4} v5" stroke="${S.accent}" stroke-width="1.2"/>`)}</g>`));
  }
  if (undone("tidy")) {
    const mug = (x, y, c) => `<rect x="${x - 2.6}" y="${y - 5}" width="5.2" height="5" rx="1" fill="${c}" stroke="${INK}" stroke-width=".5"/><path d="M${x + 2.6} ${y - 4} q2.6 1 0 3" fill="none" stroke="${INK}" stroke-width=".5"/>`;
    const plate = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="2" fill="${CREAM}" stroke="${INK}" stroke-width=".5"/><circle cx="${x - 1.4}" cy="${y - .3}" r=".7" fill="#C9A26A"/><circle cx="${x + 2}" cy="${y}" r=".6" fill="#C9A26A"/>`;
    if (tier("coffee")) s += scaled("coffee", () => g(mug(cx - 14, cy - 19, S.fabric2) + mug(cx + 16, cy - 18, CREAM) + plate(cx, cy - 17)));
    if (tier("dining")) s += scaled("dining", () => g(plate(dx + 2, dy - 26) + plate(dx + 20, dy - 28) + mug(dx - 2, dy - 30, S.accent)));
    s += g(Array.from({length: 8}, (_, k) => `<circle cx="${f1(cx - 20 + R(k)*40)}" cy="${f1(cy + 4 + R(k + 9)*12)}" r=".8" fill="#B8956A"/>`).join(""));
    const [sx, sy] = at("sofa");
    s += g(D(`<path d="M${sx + 50} ${sy + 10} q8 -5 16 -1 q2 7 -1 12 q-8 3 -15 -1 q-2 -6 0 -10z" style="fill:${S.fabric}"/>`));
    s += g(D(`<path d="M478 524 q-4 -16 3 -22 q6 3 13 0 q5 8 1 22z" style="fill:${S.fabric2}"/>`, `<path d="M481 502 q6 3 13 0" stroke="${INK}" stroke-width=".8" fill="none"/><path d="M483 501 q-4 -6 1 -7 q3 4 5 1 q4 -4 5 1" fill="${CREAM}" stroke="${INK}" stroke-width=".5"/>`));
  }
  return s;
}
// decor that makes the zones: a runner from the front door, a side table by the armchair, a bench for boots by the stairs
function downDecor(){
  const [ax, ay] = at("armchair");
  // a side table and plant tucked behind the armchair
  const side = D(`<ellipse cx="${ax - 24}" cy="${ay - 62}" rx="9" ry="3" style="fill:${lt(S.wood, .1)}"/><path d="M${ax - 30} ${ay - 44} h12 l-1 -3 h-10z" style="fill:${dk(S.wood, .2)}"/>`, `<path d="M${ax - 24} ${ay - 60} v14" stroke="${dk(S.wood, .2)}" stroke-width="1.8"/><path d="M${ax - 28} ${ay - 64} l1 -5 h6 l1 5z" fill="#C8643B"/><ellipse cx="${ax - 26}" cy="${ay - 72}" rx="3" ry="4" fill="#6E9A5A"/><ellipse cx="${ax - 22}" cy="${ay - 73}" rx="2.4" ry="3.4" fill="#88AE6A"/>`);
  // a Welsh dresser against the right-hand wall, between the fridge and the stairs
  const x0 = 454, x1 = 500, y = 382, c = mix(S.accent, "#FFFFFF", .55);
  const dresser = D(`<rect x="${x0}" y="${y - 84}" width="${x1 - x0}" height="50" style="fill:${c}"/><rect x="${x0 - 3}" y="${y - 88}" width="${x1 - x0 + 6}" height="5" rx="1" style="fill:${dk(c, .15)}"/><rect x="${x0 - 2}" y="${y - 36}" width="${x1 - x0 + 4}" height="6" rx="1" style="fill:${dk(c, .1)}"/><rect x="${x0}" y="${y - 30}" width="${x1 - x0}" height="28" style="fill:${c}"/>`,
    `${[0, 1].map(r => `<path d="M${x0 + 2} ${y - 60 + r*22} h${x1 - x0 - 4}" stroke="${dk(c, .25)}" stroke-width="1.4"/>${[0, 1, 2, 3].map(k => `<circle cx="${x0 + 8 + k*10}" cy="${y - 68 + r*22}" r="4" fill="${CREAM}" stroke="${S.accent}" stroke-width=".9"/>`).join("")}`).join("")}<path d="M${(x0 + x1)/2} ${y - 30} v28" stroke="${dk(c, .25)}" stroke-width=".8"/><circle cx="${(x0 + x1)/2 - 4}" cy="${y - 16}" r="1.2" fill="${S.metal}"/><circle cx="${(x0 + x1)/2 + 4}" cy="${y - 16}" r="1.2" fill="${S.metal}"/><path d="M${x0 + 2} ${y - 2} v2 M${x1 - 2} ${y - 2} v2" stroke="${INK}" stroke-width="2"/><path d="M${x0 + 6} ${y - 36} q6 -8 12 0z" fill="#C9A26A"/><circle cx="${x0 + 10}" cy="${y - 40}" r="2.4" fill="#D9433A"/><circle cx="${x0 + 15}" cy="${y - 40}" r="2.4" fill="#F2A03A"/>`);
  return g(side + dresser);
}
function downArt(){
  const [kx] = at("kitchen");
  return roomShell() + windowArt(38, 116, 48, 56, {seed: 1}) + windowArt(kx - 22, 112, 44, 50, {curtains: false, seed: 2}) + sideWall()
    + chimney() + accDown("prints") + accDown("records") + pieceSpot("fireplace", fireplace) + accDown("candles") + pieceSpot("bookshelf", bookshelf) + calendar() + broomCupboard() + pieceSpot("kitchen", kitchen) + fridge()
    + gardenDoor() + downDecor() + pieceSpot("rug", rug) + pieceSpot("armchair", armchair) + pieceSpot("coffee", coffee) + pieceSpot("dining", dining) + scaled("dining", () => accDown("flowers") + fruitBowl())
    + pieceSpot("sofa", sofa) + scaled("sofa", () => accDown("cushions")) + pieceSpot("lamp", lamp)
    + consoleArt() + guestbook() + catalogue() + accDown("diffuser") + livedDown() + stairsUp() + crates() + exitMat();
}

/* ====================================================================================================== */
/* ---------- upstairs: the bedroom ---------- */
function bathDoor(){   // the door through to the bathroom, in the thick left-hand wall
  const col = ST.c === "bluebell" ? BLUE : lt(S.wood, .1), [sx, sy] = SPOTS.up.bathroom;
  return otherSpot("bathroom", "Through the door to the bathroom", hovE(sx - 10, sy + 6, 26, 10),
    D(`<rect x="32" y="${sy - 58}" width="20" height="74" rx="1" style="fill:${col}"/><path d="M52 ${sy + 16} h22 l-4 -12 h-18z" style="fill:${S.fabric2}"/>`,
      `<rect x="35" y="${sy - 52}" width="14" height="28" fill="none" stroke="${dk(col, .25)}" stroke-width=".8"/><rect x="35" y="${sy - 18}" width="14" height="28" fill="none" stroke="${dk(col, .25)}" stroke-width=".8"/><circle cx="48" cy="${sy - 20}" r="1.4" fill="${S.metal}"/><ellipse cx="42" cy="${sy - 38}" rx="4" ry="2.4" fill="${CREAM}" stroke="${INK}" stroke-width=".4"/>`)
    + lab(sx + 4, sy + 36, "Bathroom", "#DDEBF2", 8));
}
// a little rush chair and a basket of spare blankets by the bathroom door
const doorCorner = () => "";
function vanity(t, x, y){
  if (t === 1) return D(`<rect x="${x - 18}" y="196" width="36" height="3" rx="1" style="fill:${S.wood}"/><circle cx="${x}" cy="176" r="10" style="fill:#DDEEF2"/>`, `<path d="M${x - 14} 199 l3 5 M${x + 14} 199 l-3 5" stroke="${dk(S.wood, .3)}" stroke-width="1.4"/><circle cx="${x}" cy="176" r="10" fill="none" stroke="${S.metal}" stroke-width="1.8"/><path d="M${x - 5} 173 l6 -5" stroke="#FFFFFF" stroke-width="1.6"/><rect x="${x + 6}" y="190" width="5" height="6" rx="1" fill="${S.fabric}"/><rect x="${x - 12}" y="191" width="4" height="5" rx="1" fill="#C9B3E3"/>`);
  const c = t === 3 ? CREAM : S.wood, w = 24;
  const mirror = t === 2 ? `<ellipse cx="${x}" cy="${y - 52}" rx="10" ry="13" style="fill:#DDEEF2"/>` : `<rect x="${x - 16}" y="150" width="32" height="34" rx="3" style="fill:#DDEEF2"/>`;
  let det = `<path d="M${x - w + 2} ${y - 22} h${w*2 - 4}" stroke="${dk(c, .2)}" stroke-width=".8"/><circle cx="${x - 10}" cy="${y - 25}" r="1" fill="${S.metal}"/><circle cx="${x + 10}" cy="${y - 25}" r="1" fill="${S.metal}"/><path d="M${x - w + 3} ${y - 20} v20 M${x + w - 3} ${y - 20} v20" stroke="${dk(S.wood, .2)}" stroke-width="2.2"/>`;
  det += t === 2 ? `<ellipse cx="${x}" cy="${y - 52}" rx="10" ry="13" fill="none" stroke="${dk(S.wood, .2)}" stroke-width="2"/><path d="M${x - 5} ${y - 56} l6 -6" stroke="#FFFFFF" stroke-width="1.6"/><path d="M${x} ${y - 39} v6" stroke="${dk(S.wood, .2)}" stroke-width="2"/>` : `<path d="M${x - 8} 176 l10 -18" stroke="#FFFFFF" stroke-width="2" opacity=".7"/>`;
  det += `<rect x="${x + 10}" y="${y - 37}" width="4" height="5" rx="1" fill="${S.fabric}" stroke="${INK}" stroke-width=".3"/><rect x="${x + 15}" y="${y - 36}" width="3.4" height="4" rx="1" fill="#C9B3E3" stroke="${INK}" stroke-width=".3"/>`;
  let s = D(mirror + `<rect x="${x - w}" y="${y - 30}" width="${w*2}" height="10" rx="1" style="fill:${c}"/><rect x="${x - w - 1}" y="${y - 33}" width="${w*2 + 2}" height="4" rx="1" style="fill:${dk(c, .1)}"/><rect x="${x - 8}" y="${y - 14}" width="16" height="5" rx="2" style="fill:${t === 3 ? S.fabric : S.wood}"/>`, det + `<path d="M${x - 6} ${y - 9} v9 M${x + 6} ${y - 9} v9" stroke="${t === 3 ? S.metal : dk(S.wood, .3)}" stroke-width="1.6"/>`);
  if (t === 3) s += g([[x - 16, 150], [x + 16, 150], [x - 16, 184], [x + 16, 184], [x - 16, 167], [x + 16, 167], [x, 150]].map(([bx, by]) => { glow(bx, by, 12); return `<circle cx="${bx}" cy="${by}" r="2.4" fill="${NIGHT ? "#FFE8A8" : "#FFF6DA"}" stroke="${INK}" stroke-width=".5"/>`; }).join(""));
  return s;
}
function bedside(t, x, y){
  const one = bx => {
    if (t === 1) return D(`<ellipse cx="${bx}" cy="${y - 18}" rx="9" ry="3.4" style="fill:${lt(S.wood, .15)}"/>`, `<path d="M${bx - 6} ${y - 16} l-2 16 M${bx + 6} ${y - 16} l2 16 M${bx} ${y - 15} v15" stroke="${dk(S.wood, .25)}" stroke-width="1.8"/><path d="M${bx - 1.4} ${y - 20} v-6 h3.4 v6" fill="#DDEEF2" stroke="${INK}" stroke-width=".4"/>`);
    const lampIt = t === 3 ? (glow(bx, y - 38, 28), `<path d="M${bx} ${y - 24} v-10" stroke="${S.metal}" stroke-width="1.4"/><path d="M${bx - 6} ${y - 42} h12 l3 8 h-18z" fill="${NIGHT ? lt(S.fabric2, .5) : S.fabric2}" stroke="${INK}" stroke-width=".6"/><ellipse cx="${bx}" cy="${y - 24}" rx="4" ry="1.4" fill="${S.metal}"/>`) : `<rect x="${bx - 5}" y="${y - 26}" width="8" height="3" fill="${S.accent}" stroke="${INK}" stroke-width=".3"/>`;
    return D(`<rect x="${bx - 10}" y="${y - 22}" width="20" height="22" rx="1.5" style="fill:${t === 3 ? S.wood : lt(S.wood, .1)}"/>`, `<path d="M${bx - 10} ${y - 13} h20" stroke="${dk(S.wood, .25)}" stroke-width=".8"/><circle cx="${bx}" cy="${y - 17}" r="1" fill="${S.metal}"/><circle cx="${bx}" cy="${y - 7}" r="1" fill="${S.metal}"/>` + lampIt);
  };
  return one(x - 46) + one(x + 46);
}
function bed(t, x, y){
  const rump = undone("beds"), duv = t === 1 ? S.fabric2 : t === 2 ? S.fabric : lt(S.fabric, .15), quilt = has("linen");
  const L = x - 32, Rr = x + 32, top = 214, foot = y - 14;
  let head;
  if (t === 1) head = `<path d="M${L + 2} ${top + 4} V188 q30 -12 60 0 V${top + 4}" fill="none" stroke="${S.metal}" stroke-width="2.6"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${L + 12 + k*10} ${186 - (k > 0 && k < 4 ? 3 : 0)} V${top}" stroke="${S.metal}" stroke-width="1.4"/>`).join("")}`;
  else if (t === 2) head = `<path d="M${L} ${top + 4} V184 q0 -8 8 -8 h48 q8 0 8 8 V${top + 4}z" style="fill:${S.wood}"/>`;
  else head = `<path d="M${L} ${top + 4} V178 q32 -18 64 0 V${top + 4}z" style="fill:${S.fabric}"/>`;
  const frame = `<rect x="${L + 2}" y="${top}" width="60" height="${foot - top}" rx="3" style="fill:${CREAM}"/><rect x="${L}" y="${foot - 2}" width="64" height="12" rx="2" style="fill:${t === 1 ? S.metal : S.wood}"/>`;
  let pillows, cover;
  if (rump) {
    pillows = `<path d="M${L + 6} ${top + 4} q12 -5 24 1 q1 8 -2 11 q-12 2 -22 -2z" style="fill:${CREAM}" transform="rotate(-12 ${L + 18} ${top + 8})"/><path d="M${x + 4} ${top + 7} q12 -4 22 2 q0 8 -3 10 q-11 1 -20 -2z" style="fill:${CREAM}" transform="rotate(16 ${x + 15} ${top + 12})"/>`;
    cover = `<path d="M${L + 2} ${foot - 30} q10 -7 18 -1 q9 -8 18 -1 q10 -7 18 0 q5 -3 8 2 V${foot} H${L + 2}z" style="fill:${quilt ? S.fabric2 : duv}"/>`;
  } else {
    pillows = `<rect x="${L + 6}" y="${top + 3}" width="25" height="12" rx="5" style="fill:${CREAM}"/><rect x="${x + 1}" y="${top + 3}" width="25" height="12" rx="5" style="fill:${CREAM}"/>` + (t === 3 ? `<rect x="${x - 15}" y="${top + 11}" width="14" height="10" rx="4" style="fill:${S.accent}"/><rect x="${x + 1}" y="${top + 11}" width="14" height="10" rx="4" style="fill:${S.fabric2}"/>` : "");
    cover = `<rect x="${L + 1}" y="${top + 22}" width="62" height="${foot - top - 20}" rx="3" style="fill:${duv}"/><rect x="${L + 1}" y="${top + 22}" width="62" height="7" rx="2" style="fill:${lt(duv, .35)}"/>`;
  }
  let det = "";
  if (rump) det += `<path d="M${L + 8} ${top + 24} q10 4 20 -1 M${x + 2} ${top + 30} q12 -4 24 2" stroke="#D8D0C4" stroke-width=".8" fill="none"/>`;
  if (!rump && quilt) det += Array.from({length: 15}, (_, k) => `<rect x="${L + 2 + (k % 5)*12}" y="${top + 30 + Math.floor(k/5)*((foot - top - 30)/3)}" width="12" height="${f1((foot - top - 30)/3)}" fill="${[S.fabric, S.fabric2, lt(S.accent, .4), CREAM][(k*5) % 4]}" opacity=".85"/>`).join("");
  else if (!rump && t === 2) det += [0, 1].map(r => `<path d="M${L + 2} ${top + 42 + r*14} h60" stroke="${dk(duv, .12)}" stroke-width=".8"/>`).join("") + [0, 1, 2, 3].map(k => `<path d="M${L + 14 + k*12} ${top + 29} v${foot - top - 29}" stroke="${dk(duv, .12)}" stroke-width=".8"/>`).join("");
  else if (!rump && t === 3) det += `<path d="M${L + 2} ${foot - 10} q30 5 60 0" stroke="${S.accent}" stroke-width="1.6" fill="none"/>`;
  if (ST.occupied && !rump) det += `<path d="M${x + 8} ${foot - 16} l1 -5 q3 -1 6 1 q3 -2 6 -1 l1 5 q-3 -1 -7 1 q-4 -2 -7 -1z" fill="${CREAM}" stroke="${INK}" stroke-width=".5"/>`;
  // the four-poster: posts at the corners, a canopy frame and drapes tied back at the foot
  const backPosts = t === 3 ? D(`<rect x="${L - 1}" y="104" width="4" height="${top - 100}" style="fill:${dk(S.wood, .1)}"/><rect x="${Rr - 3}" y="104" width="4" height="${top - 100}" style="fill:${dk(S.wood, .1)}"/>`) : "";
  const front = t === 3 ? D(`<rect x="${L - 3}" y="118" width="5" height="${y - 118}" style="fill:${dk(S.wood, .1)}"/><rect x="${Rr - 2}" y="118" width="5" height="${y - 118}" style="fill:${dk(S.wood, .1)}"/><path d="M${L - 3} 118 L${L - 1} 104 H${Rr + 1} L${Rr + 3} 118z" style="fill:${S.wood}"/>`,
    `<path d="M${L - 2} 122 q-8 30 -2 60 q4 2 7 0 q-2 -30 1 -60z" fill="${S.fabric2}" stroke="${INK}" stroke-width=".6"/><path d="M${Rr + 2} 122 q8 30 2 60 q-4 2 -7 0 q2 -30 -1 -60z" fill="${S.fabric2}" stroke="${INK}" stroke-width=".6"/><path d="M${L} 120 q32 10 64 0" fill="none" stroke="${S.fabric2}" stroke-width="4"/>`) : "";
  return backPosts + D(head) + D(frame + pillows + cover, det + `<path d="M${L + 2} ${y - 4} v4 M${Rr - 2} ${y - 4} v4" stroke="${dk(S.wood, .3)}" stroke-width="2.4"/>`) + front;
}
function seatRecess(){   // the deep window recess the window seat sits in (part of the cottage)
  const [x, y] = at("windowseat"), x0 = x - 32, x1 = x + 32;
  return g(D(`<rect x="${x0}" y="112" width="64" height="${y - 112}" rx="1" style="fill:${dk(S.wall2, .06)}"/>`) + clip(x0 + 10, 120, 44, 58, view(x0 + 10, 120, 44, 58, 3))
    + sk(`<rect x="${x0 + 10}" y="120" width="44" height="58" fill="none" style="stroke:${CREAM}" stroke-width="3"/><path d="M${x} 120 v58 M${x0 + 10} 148 h44" style="stroke:${CREAM}" stroke-width="2"/>`, `<rect x="${x0 + 10}" y="120" width="44" height="58"/>`)
    + (ST.c === "bluebell" ? D(`<rect x="${x0 + 2}" y="118" width="7" height="62" style="fill:${BLUE}"/><rect x="${x1 - 9}" y="118" width="7" height="62" style="fill:${BLUE}"/>`) : "")
    + D(`<rect x="${x0}" y="182" width="64" height="${y - 194}" style="fill:${lt(S.wood, .2)}"/><rect x="${x0}" y="${y - 12}" width="64" height="12" style="fill:${S.wall2}"/>`));
}
function windowseat(t, x, y){
  const x0 = x - 32;
  if (t === 1) return D(`<rect x="${x0 + 8}" y="${y - 24}" width="24" height="9" rx="4" style="fill:${S.fabric}"/>`);
  let s = D(`<rect x="${x0 + 1}" y="${y - 26}" width="62" height="13" rx="4" style="fill:${S.fabric2}"/><rect x="${x0 + 4}" y="${y - 34}" width="13" height="11" rx="4" style="fill:${S.fabric}"/><rect x="${x0 + 47}" y="${y - 34}" width="13" height="11" rx="4" style="fill:${S.accent}"/><path d="M${x + 4} ${y - 22} q10 -3 18 1 l-1 20 q-8 3 -16 0z" style="fill:${lt(S.accent, .45)}"/>`,
    [0, 1, 2].map(k => `<path d="M${x + 7 + k*4} ${y - 20} v18" stroke="${S.accent}" stroke-width=".8"/>`).join(""));
  if (t === 3) {
    s += D(`<rect x="${x0 + 2}" y="${y - 11}" width="30" height="10" style="fill:${dk(S.wood, .3)}"/>`, books(x0 + 3, x0 + 31, y - 1, 21, 8));
    s += g(Array.from({length: 11}, (_, k) => { const a = k/10, lx = f1(x0 + 6 + a*52), ly = f1(116 + Math.sin(a*Math.PI*3)*2.4); if (k % 3 === 0) glow(+lx, +ly, 14); return `<circle cx="${lx}" cy="${ly}" r="1.6" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".3"/>`; }).join("")
      + [0, 1, 2, 3].map(k => { const ly = 126 + k*16; if (k % 2) glow(x0 + 4, ly, 10); return `<circle cx="${x0 + 4}" cy="${ly}" r="1.5" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".3"/><circle cx="${x0 + 60}" cy="${ly}" r="1.5" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".3"/>`; }).join(""));
  }
  return s;
}
function wardrobe(t, x, y){
  if (t === 1) return D(`<rect x="${x - 16}" y="${y - 10}" width="32" height="9" rx="1.5" style="fill:#C9A26A"/>`, `<path d="M${x - 20} ${y} V${y - 70} M${x + 20} ${y} V${y - 70} M${x - 22} ${y - 70} h44" stroke="${S.metal}" stroke-width="2.2"/>${[S.fabric, S.accent, CREAM, S.fabric2, "#7E8FA6"].map((c, k) => `<path d="M${x - 14 + k*7} ${y - 70} v3" stroke="${INK}" stroke-width=".6"/><path d="M${x - 18 + k*7} ${y - 64} l4 -3 l4 3 l1.4 ${22 + (k % 2)*10} h-10.8z" fill="${c}" stroke="${INK}" stroke-width=".5"/>`).join("")}`);
  if (t === 2) { const c = mix(S.accent, "#FFFFFF", .5);
    return D(`<rect x="${x - 22}" y="${y - 74}" width="44" height="72" rx="1.5" style="fill:${c}"/><rect x="${x - 25}" y="${y - 78}" width="50" height="5" rx="1.5" style="fill:${dk(c, .1)}"/>`, `<path d="M${x} ${y - 72} v68" stroke="${dk(c, .3)}" stroke-width="1"/><rect x="${x - 18}" y="${y - 68}" width="15" height="60" fill="none" stroke="${dk(c, .2)}" stroke-width=".8"/><rect x="${x + 3}" y="${y - 68}" width="15" height="60" fill="none" stroke="${dk(c, .2)}" stroke-width=".8"/><circle cx="${x - 3}" cy="${y - 38}" r="1.3" fill="${S.metal}"/><circle cx="${x + 3}" cy="${y - 38}" r="1.3" fill="${S.metal}"/><path d="M${x - 20} ${y - 2} v2 M${x + 20} ${y - 2} v2" stroke="${INK}" stroke-width="2"/><path d="M${x - 14} ${y - 60} q4 -4 8 0 q-4 4 -8 0 M${x + 6} ${y - 60} q4 -4 8 0 q-4 4 -8 0" fill="${S.fabric}"/>`); }
  return D(`<path d="M${x - 26} ${y} V${y - 82} q26 -14 52 0 V${y}z" style="fill:${S.wood}"/><rect x="${x - 11}" y="${y - 76}" width="22" height="66" rx="10" style="fill:#DDEEF2"/>`,
    `<path d="M${x - 13} ${y - 80} v78 M${x + 13} ${y - 80} v78" stroke="${dk(S.wood, .3)}" stroke-width="1"/><path d="M${x - 6} ${y - 20} l12 -44" stroke="#FFFFFF" stroke-width="2" opacity=".6"/><path d="M${x - 14} ${y - 88} q14 -8 28 0" stroke="${S.metal}" stroke-width="1.6" fill="none"/><circle cx="${x}" cy="${y - 92}" r="2.2" fill="${S.metal}"/><circle cx="${x - 18}" cy="${y - 40}" r="1.3" fill="${S.metal}"/><circle cx="${x + 18}" cy="${y - 40}" r="1.3" fill="${S.metal}"/><path d="M${x - 26} ${y - 3} h52" stroke="${dk(S.wood, .3)}" stroke-width="2.4"/>`);
}
function bedrug(t, x, y){
  if (t === 1) return D(`<rect x="${x - 56}" y="${y - 54}" width="112" height="54" rx="2" style="fill:${S.fabric2}"/>`, [0, 1, 2, 3].map(k => `<path d="M${x - 56} ${y - 46 + k*12} h112" stroke="${S.accent}" stroke-width="2"/>`).join("") + Array.from({length: 8}, (_, k) => `<path d="M${x - 56} ${y - 52 + k*7} h-4 M${x + 56} ${y - 52 + k*7} h4" stroke="${S.fabric2}" stroke-width="1"/>`).join(""));
  if (t === 2) return D(`<path d="M${x - 40} ${y - 18} q-4 -18 22 -22 q20 -6 40 0 q24 2 22 20 q2 16 -22 20 q-22 4 -42 0 q-24 -2 -20 -18z" style="fill:#F6F2E8"/>`, Array.from({length: 14}, (_, k) => `<path d="M${f1(x - 34 + R(k)*68)} ${f1(y - 34 + R(k + 3)*30)} q2 -2 4 0" stroke="#D8D0C0" stroke-width=".8" fill="none"/>`).join(""));
  return D(`<ellipse cx="${x}" cy="${y - 28}" rx="72" ry="28" style="fill:${S.fabric}"/>`, `<ellipse cx="${x}" cy="${y - 28}" rx="64" ry="23" fill="none" stroke="${S.fabric2}" stroke-width="4"/><ellipse cx="${x}" cy="${y - 28}" rx="46" ry="16" fill="none" stroke="${S.accent}" stroke-width="2.4" stroke-dasharray="6 3"/><ellipse cx="${x}" cy="${y - 28}" rx="22" ry="8" fill="${S.fabric2}"/>`);
}
function stairsDown(){   // the top of the stairs, a stairwell in the front left corner, going down (like the mill's upstairs)
  const [sx, sy] = SPOTS.up.stairs, x0 = sx - 48, y0 = sy + 10;
  return otherSpot("stairs", "Down the stairs to the sitting room", hovE(sx, sy + 20, 46, 14),
    sk(`<rect x="${x0}" y="${y0}" width="90" height="90" style="fill:#7A5638"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${x0 + 4 + i*4}" y="${y0 + 6 + i*16}" width="${82 - i*8}" height="11" style="fill:#A8754F"/>`).join("")}<path d="M${x0 + 94} ${y0} v90 M${x0} ${y0 - 2} h94" style="stroke:#5A3A2A" stroke-width="3"/>${[0, 1, 2, 3].map(k => `<path d="M${x0 + 94} ${y0 + 10 + k*22} v-10" style="stroke:#6B4A2E" stroke-width="1.6"/>`).join("")}`, `<rect x="${x0}" y="${y0}" width="90" height="90"/>`)
    + lab(sx + 70, sy + 96, "Downstairs", "#F3E1A0", 8));
}
function accUp(id){
  if (!has(id)) return "";
  const [x, y] = at(id);
  if (id === "mirror") return g(D(`<circle cx="${x}" cy="${y}" r="11" style="fill:#DDEEF2"/>`, `<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="${S.metal}" stroke-width="2.4"/><path d="M${x - 5} ${y - 3} l7 -6" stroke="#FFFFFF" stroke-width="1.6"/><path d="M${x} ${y - 11} l-5 -9 h10z" fill="none" stroke="${INK}" stroke-width=".5"/>`));
  if (id === "plant") return g(D(`<path d="M${x - 10} ${y - 16} h20 l-2 16 h-16z" style="fill:#C8643B"/>`, [[-16, -28, -30], [12, -32, 24], [-2, -44, -4], [-18, -14, -50], [16, -16, 50]].map(([dx, dy, a]) => `<path d="M${x} ${y - 16} Q${x + dx*.4} ${y - 16 + dy*.5} ${x + dx} ${y - 16 + dy}" stroke="#4E7A3E" stroke-width="1.2" fill="none"/><ellipse cx="${x + dx}" cy="${y - 16 + dy}" rx="9" ry="5.4" fill="${(dx + dy) % 3 ? "#5E9A4A" : "#6EAA5A"}" stroke="${INK}" stroke-width=".5" transform="rotate(${a} ${x + dx} ${y - 16 + dy})"/>`).join("") + `<path d="M${x - 10} ${y - 13} h20" stroke="#8E4A2A" stroke-width="1.6"/>`));
  return "";
}
function livedUp(){
  let s = "";
  const [bx, by] = at("bed");
  if (ST.occupied) s += g(D(`<ellipse cx="${bx - 18}" cy="${by + 12}" rx="3.4" ry="6" style="fill:${S.fabric}"/><ellipse cx="${bx - 9}" cy="${by + 13}" rx="3.4" ry="6" style="fill:${S.fabric}"/>`, `<path d="M${bx - 21} ${by + 8} q3 -2 6 0 M${bx - 12} ${by + 9} q3 -2 6 0" stroke="${CREAM}" stroke-width="1.8" fill="none"/>`));
  if (undone("beds")) s += g(D(`<path d="M${bx + 44} ${by + 4} q-3 -12 8 -15 q7 -7 15 -1 q10 -1 11 8 q4 7 -3 9 q-14 3 -31 -1z" style="fill:${CREAM}"/><path d="M${bx + 51} ${by} q5 -7 12 -3 q6 -1 7 4 q-8 3 -19 -1z" style="fill:${S.fabric2}"/>`, `<path d="M${bx + 50} ${by - 4} q7 3 12 -1" stroke="#D8D0C4" stroke-width=".8" fill="none"/>`));
  return s;
}
// a bench at the foot of the bed, a reading corner with a chair and a lamp, and a chest of drawers by the bathroom door
function upDecor(){
  const [bx, by] = at("bed");
  let s = tier("bed") ? D(`<rect x="${bx - 24}" y="${by + 2}" width="48" height="6" rx="2" style="fill:${S.fabric2}"/><rect x="${bx - 24}" y="${by + 8}" width="48" height="5" style="fill:${S.wood}"/>`, `<path d="M${bx - 22} ${by + 13} v4 M${bx + 22} ${by + 13} v4" stroke="${dk(S.wood, .3)}" stroke-width="2"/>`) : "";
  // a reading corner against the right-hand wall: a chair, a lamp on a little table
  const cx = 424, cy = 470, col = mix(S.fabric, S.accent, .3);
  glow(454, 426, 30);
  s += D(`<rect x="${cx - 15}" y="${cy - 34}" width="30" height="22" rx="7" style="fill:${col}"/><rect x="${cx - 19}" y="${cy - 20}" width="8" height="16" rx="3" style="fill:${dk(col, .1)}"/><rect x="${cx + 11}" y="${cy - 20}" width="8" height="16" rx="3" style="fill:${dk(col, .1)}"/><rect x="${cx - 12}" y="${cy - 16}" width="24" height="10" rx="3" style="fill:${lt(col, .15)}"/>`,
    `<path d="M${cx - 15} ${cy - 4} v4 M${cx + 15} ${cy - 4} v4" stroke="${dk(S.wood, .3)}" stroke-width="2"/><rect x="${cx - 6}" y="${cy - 30}" width="12" height="9" rx="3" fill="${S.fabric2}" stroke="${INK}" stroke-width=".4"/>`)
    + D(`<ellipse cx="454" cy="448" rx="9" ry="3" style="fill:${lt(S.wood, .1)}"/><path d="M447 425 h14 l3 9 h-20z" style="fill:${NIGHT ? lt(S.fabric2, .5) : S.fabric2}"/>`, `<path d="M454 450 v18 M448 468 h12" stroke="${dk(S.wood, .2)}" stroke-width="1.8"/><path d="M454 445 v-11" stroke="${S.metal}" stroke-width="1.2"/><rect x="444" y="442" width="7" height="3" fill="${S.accent}"/>`)
  // a chest of drawers against the left-hand wall, below the bathroom door
    + D(`<rect x="54" y="384" width="38" height="38" rx="1.5" style="fill:${S.wood}"/><rect x="52" y="380" width="42" height="5" rx="1" style="fill:${dk(S.wood, .1)}"/>`, `${[0, 1, 2].map(k => `<path d="M56 ${396 + k*12} h34" stroke="${dk(S.wood, .3)}" stroke-width=".8"/><circle cx="66" cy="${390 + k*12}" r="1" fill="${S.metal}"/><circle cx="80" cy="${390 + k*12}" r="1" fill="${S.metal}"/>`).join("")}<path d="M66 380 q-2 -8 2 -12 h4 q4 4 2 12z" fill="${CREAM}" stroke="${INK}" stroke-width=".4"/><circle cx="68" cy="364" r="2.4" fill="${S.fabric}"/><circle cx="72" cy="366" r="2" fill="#F6E3A1"/><rect x="78" y="374" width="10" height="6" fill="${S.accent}" stroke="${INK}" stroke-width=".3"/>`);
  return g(s);
}
function upArt(){
  return roomShell() + windowArt(70, 116, 48, 56, {seed: 4}) + seatRecess() + accUp("mirror")
    + pieceSpot("windowseat", windowseat) + pieceSpot("wardrobe", wardrobe) + pieceSpot("vanity", vanity) + pieceSpot("bedrug", bedrug) + pieceSpot("bedside", bedside) + pieceSpot("bed", bed)
    + bathDoor() + doorCorner() + upDecor() + accUp("plant") + livedUp() + stairsDown() + crates();
}

/* ====================================================================================================== */
/* ---------- the bathroom (round 237): its own room, through the door off the bedroom ---------- */
function bathShell(){   // tiles to half height on the back wall, a checked tile floor
  let t = `<rect y="${FL}" width="520" height="${640 - FL}" style="fill:${CREAM}"/>`;
  for (let r = 0; FL + r*24 < 640; r++) for (let k = 0; k < 22; k++) t += `<rect x="${k*24 + 2}" y="${FL + r*24}" width="24" height="24" style="fill:${(r + k) % 2 ? CREAM : mix(S.wall2, CREAM, .15)};stroke:${dk(S.wall2, .12)}" stroke-width=".6"/>`;
  for (let r = 0; r < 7; r++) for (let k = 0; k < 36; k++) { const x = k*15 - (r % 2)*7.5, c = (k*7 + r*3) % 9 === 0 ? lt(S.accent, .35) : (k + r) % 5 === 0 ? lt(S.fabric2, .2) : CREAM;
    t += `<rect x="${x}" y="${f1(FL - 66 + r*9.4)}" width="15" height="9.4" style="fill:${c};stroke:${dk(S.wall2, .15)}" stroke-width=".4"/>`; }
  t += `<rect y="${FL - 70}" width="520" height="5" style="fill:${S.accent}"/><rect y="${FL - 6}" width="520" height="6" style="fill:${S.accent}" opacity=".55"/><path d="M0 ${FL} H520" style="stroke:${INK}" stroke-width="1.3"/>`;
  return roomShell(t);
}
function bathTub(t, x, y){
  const L = x - 34, Rr = x + 34;
  // a walk-in shower tray in the middle of the room, a curtain on a ring rail hung from the beams
  if (t === 1) return D(`<path d="M${x - 30} ${y - 104} q30 -10 60 0 l-2 4 q-6 40 2 74 h-56 q8 -34 -4 -78z" style="fill:${lt(S.fabric2, .25)}" opacity=".9"/><rect x="${x - 24}" y="${y - 28}" width="48" height="22" rx="1.5" style="fill:${CREAM}"/><rect x="${x - 24}" y="${y - 7}" width="48" height="7" style="fill:${lt(S.wall2, .05)}"/><path d="M${x + 12} ${y - 102} q-4 40 4 76 h14 q-2 -40 -2 -78z" style="fill:${S.fabric2}"/>`,
    `<ellipse cx="${x}" cy="${y - 104}" rx="30" ry="7" fill="none" stroke="${S.metal}" stroke-width="1.6"/><path d="M${x - 24} ${y - 106} V${WT} M${x + 24} ${y - 106} V${WT}" stroke="${S.metal}" stroke-width=".8"/><path d="M${x} ${WT} V${y - 92}" stroke="${S.metal}" stroke-width="1.6"/><ellipse cx="${x}" cy="${y - 90}" rx="6" ry="2" fill="${S.metal}"/><circle cx="${x}" cy="${y - 17}" r="2" fill="#9AA0A6"/>${[0, 1, 2].map(k => `<path d="M${x + 15 + k*4} ${y - 98} q-3 36 3 70" stroke="${dk(S.fabric2, .15)}" stroke-width=".8" fill="none"/>`).join("")}`);
  const copper = t === 3, body = copper ? "#C9824A" : CREAM;
  if (copper) glow(Rr + 10, y - 34, 26);
  return (copper ? D(`<rect x="${Rr + 4}" y="${y - 22}" width="14" height="4" style="fill:${S.wood}"/>`, `<path d="M${Rr + 6} ${y - 18} v18 M${Rr + 16} ${y - 18} v18" stroke="${dk(S.wood, .3)}" stroke-width="1.6"/><rect x="${Rr + 7}" y="${y - 28}" width="5" height="6" fill="${CREAM}"/>${flame(Rr + 9.5, y - 28, .35)}<path d="M${Rr + 13} ${y - 22} l2 -6 h3 l1 6z" fill="#6E9A5A"/>`) : "")
    + D(`<path d="M${L} ${y - 26} h68 q2 18 -12 22 h-44 q-14 -4 -12 -22z" style="fill:${body}"/><ellipse cx="${x}" cy="${y - 26}" rx="34" ry="6" style="fill:${copper ? "#E6A86A" : CREAM}"/><ellipse cx="${x}" cy="${y - 25.4}" rx="30" ry="3.8" style="fill:#BFE0EA"/>`,
      `<path d="M${L + 10} ${y - 5} l-3 5 h4 M${Rr - 10} ${y - 5} l3 5 h-4" stroke="${copper ? INK : S.metal}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M${x - 4} ${y - 31} v-6 h8 v6 M${x} ${y - 37} v-3" stroke="${S.metal}" stroke-width="1.6" fill="none"/>`
      + (copper ? `<path d="M${L + 6} ${y - 20} q4 12 14 15" stroke="#F2C08A" stroke-width="2.4" fill="none" opacity=".8"/><rect x="${x - 14}" y="${y - 30}" width="28" height="3.4" rx="1" fill="${S.wood}" stroke="${INK}" stroke-width=".4"/><rect x="${x - 9}" y="${y - 33}" width="7" height="3" fill="${S.fabric}"/>` : `<path d="M${L + 6} ${y - 19} q4 10 10 13" stroke="#FFFFFF" stroke-width="1.6" fill="none"/>`));
}
function basin(t, x, y){
  const mirror = (mx, w, h) => `<rect x="${mx - w/2}" y="${134}" width="${w}" height="${h}" rx="${w/2}" style="fill:#DDEEF2"/>`;
  if (t === 1) return D(`<rect x="${x - 8}" y="146" width="16" height="22" rx="1" style="fill:#DDEEF2"/><path d="M${x - 12} ${y - 32} h24 q0 8 -12 9 q-12 -1 -12 -9z" style="fill:${CREAM}"/><rect x="${x - 4}" y="${y - 24}" width="8" height="24" style="fill:${CREAM}"/>`, `<ellipse cx="${x}" cy="${y - 32}" rx="10" ry="2" fill="#DDEEF2"/><path d="M${x} ${y - 33} v-5 q0 -2 3 -2" stroke="${S.metal}" stroke-width="1.4" fill="none"/>`);
  if (t === 2) return D(mirror(x, 24, 40) + `<rect x="${x - 20}" y="${y - 34}" width="40" height="5" rx="1" style="fill:${lt(S.wood, .1)}"/><rect x="${x - 18}" y="${y - 29}" width="36" height="9" style="fill:${S.wood}"/><path d="M${x - 10} ${y - 34} h20 q0 6 -10 7 q-10 -1 -10 -7z" style="fill:${CREAM}"/>`,
    `<rect x="${x - 12}" y="134" width="24" height="40" rx="12" fill="none" stroke="${S.wood}" stroke-width="2.4"/><path d="M${x - 6} 152 l9 -11" stroke="#FFFFFF" stroke-width="1.6"/><path d="M${x - 16} ${y - 20} v20 M${x + 16} ${y - 20} v20 M${x - 16} ${y - 8} h32" stroke="${dk(S.wood, .25)}" stroke-width="1.8"/><path d="M${x} ${y - 35} v-5 q0 -2 3 -2" stroke="${S.metal}" stroke-width="1.4" fill="none"/>`);
  return D(mirror(x - 15, 20, 38) + mirror(x + 15, 20, 38) + `<rect x="${x - 32}" y="${y - 34}" width="64" height="6" rx="1" style="fill:#F2EEE8"/><rect x="${x - 30}" y="${y - 28}" width="60" height="28" style="fill:${mix(S.accent, "#FFFFFF", .4)}"/>`,
    `${[x - 15, x + 15].map(mx => `<rect x="${mx - 10}" y="134" width="20" height="38" rx="10" fill="none" stroke="${S.metal}" stroke-width="2"/><path d="M${mx - 5} 150 l7 -9" stroke="#FFFFFF" stroke-width="1.4"/><ellipse cx="${mx}" cy="${y - 32}" rx="8" ry="1.6" fill="#DDEEF2" stroke="${INK}" stroke-width=".4"/><path d="M${mx} ${y - 34} v-5 q0 -2 3 -2" stroke="${S.metal}" stroke-width="1.4" fill="none"/>`).join("")}<path d="M${x} ${y - 26} v24" stroke="${dk(S.accent, .2)}" stroke-width=".8"/><circle cx="${x - 4}" cy="${y - 14}" r="1.2" fill="${S.metal}"/><circle cx="${x + 4}" cy="${y - 14}" r="1.2" fill="${S.metal}"/>`);
}
function bathrug(t, x, y){
  if (t === 1) return D(`<rect x="${x - 24}" y="${y - 16}" width="48" height="16" rx="3" style="fill:${S.fabric2}"/>`, `<rect x="${x - 20}" y="${y - 13}" width="40" height="10" rx="2" fill="none" stroke="${S.accent}" stroke-width="1" stroke-dasharray="3 2"/>`);
  if (t === 2) return D(`<rect x="${x - 26}" y="${y - 18}" width="52" height="18" rx="4" style="fill:${S.fabric2}"/><ellipse cx="${x + 40}" cy="${y - 16}" rx="8" ry="2.6" style="fill:${S.wood}"/>`, `${[0, 1].map(k => `<path d="M${x - 22} ${y - 12 + k*6} h44" stroke="${S.accent}" stroke-width="1.2"/>`).join("")}<path d="M${x + 34} ${y - 14} l-2 14 M${x + 46} ${y - 14} l2 14" stroke="${dk(S.wood, .25)}" stroke-width="1.8"/><rect x="${x + 35}" y="${y - 22}" width="9" height="5" rx="1.4" fill="${S.fabric}" stroke="${INK}" stroke-width=".4"/>`);
  return D(`<path d="M${x - 30} ${y - 9} q-3 -12 18 -13 q22 -3 42 1 q16 2 14 12 q-1 10 -22 10 h-36 q-16 -1 -16 -10z" style="fill:${lt(S.fabric2, .45)}"/><rect x="${x + 36}" y="${y - 22}" width="18" height="7" rx="2" style="fill:${S.fabric}"/>`,
    Array.from({length: 12}, (_, k) => `<path d="M${f1(x - 26 + R(k)*52)} ${f1(y - 18 + R(k + 2)*14)} q2 -2 4 0" stroke="#D8D0C0" stroke-width=".8" fill="none"/>`).join("") + `<path d="M${x + 37} ${y - 22} v-16 q8 -4 16 0 v16" fill="none" stroke="${dk(S.wood, .2)}" stroke-width="2"/><path d="M${x + 38} ${y - 15} l-1 11 M${x + 52} ${y - 15} l1 11" stroke="${dk(S.wood, .2)}" stroke-width="2"/>`);
}
function towelRail(){   // the towel rail beside the bath, always there; the fluffy towels are an accessory
  const [x, y] = at("towels"), t = has("towels");
  const towels = t ? `<rect x="${x - 14}" y="${y - 44}" width="12" height="26" rx="2" style="fill:${S.fabric2}"/><rect x="${x + 2}" y="${y - 44}" width="12" height="22" rx="2" style="fill:${CREAM}"/>` : "";
  const det = t ? `<path d="M${x - 14} ${y - 26} h12 M${x + 2} ${y - 26} h12" stroke="${S.accent}" stroke-width="1.2"/><rect x="${x - 12}" y="${y - 8}" width="24" height="5" rx="2" fill="${S.fabric}" stroke="${INK}" stroke-width=".4"/><rect x="${x - 11}" y="${y - 12}" width="22" height="4.4" rx="2" fill="${CREAM}" stroke="${INK}" stroke-width=".4"/>` : `<path d="M${x - 8} ${y - 44} v12 h8 v-12" fill="${CREAM}" stroke="${INK}" stroke-width=".5"/>`;
  return g(sk(`<path d="M${x - 16} ${y} V${y - 46} M${x + 16} ${y} V${y - 46}" style="stroke:${S.metal}" stroke-width="2.6"/><path d="M${x - 18} ${y - 44} h36 M${x - 16} ${y - 24} h32" style="stroke:${S.metal}" stroke-width="2"/>`, `<path d="M${x - 19} ${y} h6 M${x + 13} ${y} h6"/>`) + D(towels, det));
}
function accBath(id){
  if (!has(id)) return "";
  const [x, y] = at(id);
  if (id === "robes") return g(D(`<path d="M${x - 15} ${y - 38} l6 -3 l6 3 l2.4 38 h-16.8z" style="fill:${CREAM}"/><path d="M${x + 1} ${y - 37} l6 -3 l6 3 l2.4 38 h-16.8z" style="fill:${S.fabric2}"/><rect x="${x - 19}" y="${y - 46}" width="38" height="4" rx="1.4" style="fill:${S.wood}"/>`, `<circle cx="${x - 9}" cy="${y - 42}" r="1.2" fill="${S.metal}"/><circle cx="${x + 7}" cy="${y - 41}" r="1.2" fill="${S.metal}"/><path d="M${x - 14} ${y - 20} h14 M${x + 2} ${y - 19} h14" stroke="${S.accent}" stroke-width="1.2"/>`));
  if (id === "soaps") return g(D(`<rect x="${x - 18}" y="${y - 2}" width="36" height="3" rx="1" style="fill:${S.wood}"/><rect x="${x - 15}" y="${y - 7}" width="7" height="5" rx="1.4" style="fill:#C9B3E3"/><rect x="${x - 7}" y="${y - 6}" width="7" height="4" rx="1.4" style="fill:#F4C7CF"/><path d="M${x + 2} ${y - 2} v-9 h6 v9z" style="fill:#E8F1F0"/><path d="M${x + 10} ${y - 2} v-7 h6 v7z" style="fill:#FFF3D6"/>`, `<path d="M${x + 2} ${y - 9} h6 M${x + 10} ${y - 7} h6" stroke="${S.fabric}" stroke-width="1.4"/>`));
  if (id === "bathplant") return g(D(`<path d="M${x - 6} ${y - 4} h12 l-1.4 -8 h-9.2z" style="fill:#C8643B"/>`, [-60, -35, -12, 12, 35, 60].map(a => `<path d="M${x} ${y - 12} q${f1(a*.2)} -10 ${f1(a*.34)} -7" stroke="#5E8A4A" stroke-width="1.6" fill="none"/>${[1, 2, 3].map(j => `<ellipse cx="${f1(x + a*.34*j/3)}" cy="${f1(y - 12 - 7*j/3 - (j === 2 ? 2 : 0))}" rx="2" ry="1.1" fill="#6E9A4A"/>`).join("")}`).join("")));
  return "";
}
function bathCorners(){   // a slipper chair on the left, a cupboard on the right, a laundry basket and a plant in the front corners
  glow(386, 384, 26);
  return g(D(`<path d="M134 492 h24 l-3 -22 h-18z" style="fill:#C9A26A"/><rect x="366" y="398" width="36" height="42" rx="1.5" style="fill:${lt(S.wood, .1)}"/><rect x="363" y="394" width="42" height="5" rx="1" style="fill:${dk(S.wood, .1)}"/>`,
    `${[0, 1, 2].map(k => `<path d="M137 ${476 + k*5} h18" stroke="#9A7A4A" stroke-width=".7"/>`).join("")}<path d="M137 470 q4 -6 8 -2 q4 -5 9 1" fill="${S.fabric2}" stroke="${INK}" stroke-width=".5"/><path d="M384 399 v40" stroke="${dk(S.wood, .25)}" stroke-width=".8"/><circle cx="380" cy="416" r="1.2" fill="${S.metal}"/><circle cx="388" cy="416" r="1.2" fill="${S.metal}"/><rect x="372" y="384" width="6" height="10" rx="1" fill="${CREAM}" stroke="${INK}" stroke-width=".4"/>${flame(375, 384, .35)}<path d="M386 394 l2 -9 h6 l2 9z" fill="#E8F1F0" stroke="${INK}" stroke-width=".4"/>`)
    + D(`<path d="M378 494 h20 l-2 -14 h-16z" style="fill:#C8643B"/>`, [[-11, -24, -30], [9, -27, 24], [-1, -36, -4], [-13, -11, -50], [12, -13, 50]].map(([dx, dy, a]) => `<path d="M388 480 Q${388 + dx*.4} ${480 + dy*.5} ${388 + dx} ${480 + dy}" stroke="#4E7A3E" stroke-width="1.2" fill="none"/><ellipse cx="${388 + dx}" cy="${480 + dy}" rx="7.4" ry="3.8" fill="#5E9A4A" stroke="${INK}" stroke-width=".5" transform="rotate(${a} ${388 + dx} ${480 + dy})"/>`).join(""))
    + D(`<rect x="126" y="378" width="30" height="20" rx="8" style="fill:${S.fabric}"/><rect x="128" y="396" width="26" height="8" rx="3" style="fill:${lt(S.fabric, .15)}"/>`, `<path d="M130 404 v8 M152 404 v8" stroke="${S.metal}" stroke-width="1.8"/><rect x="134" y="390" width="14" height="5" rx="2" fill="${CREAM}" stroke="${INK}" stroke-width=".3"/>`));
}
function livedBath(){
  if (!undone("bath")) return "";
  const [x, y] = at("bath");
  let s = "";
  if (tier("bath") > 1) s += g(D(`<path d="M${x + 12} ${y - 30} h12 l1 16 q-4 4 -7 0 q-3 4 -6 0z" style="fill:${S.fabric2}"/>`, `<path d="M${x + 13} ${y - 20} h11" stroke="${S.accent}" stroke-width="1"/>`));
  s += g(D(`<path d="M${x - 70} ${y + 30} q6 -8 18 -5 q9 0 10 6 q-1 6 -14 6 q-13 0 -14 -7z" style="fill:${CREAM}"/><path d="M${x + 54} ${y + 50} q5 -9 17 -6 q6 3 5 8 q-12 5 -22 -2z" style="fill:${S.fabric2}"/>`, `<path d="M${x - 64} ${y + 31} q8 2 15 0" stroke="#D8D0C4" stroke-width=".8" fill="none"/>`));
  return s;
}
function bedroomDoor(){   // the doorway in the front wall, out to the landing and back to the bedroom
  const r = ROOMS.bath, [sx, sy] = SPOTS.bath.bedroom;
  const landing = `<rect x="${sx - 70}" y="${r.y1 + 16}" width="140" height="${640 - r.y1 - 16}" style="fill:${S.floor}"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<path d="M${sx - 70} ${r.y1 + 30 + k*18} h140" stroke="${S.floor2}" stroke-width=".8"/>`).join("")}`;
  return g(D(landing + `<rect x="${sx - 22}" y="${r.y1 - 1}" width="44" height="18" style="fill:${S.floor}"/>`, `<path d="M${sx - 60} ${r.y1 + 40} V640 M${sx + 60} ${r.y1 + 40} V640" stroke="#6B4A2E" stroke-width="2.4"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${sx - 60} ${r.y1 + 50 + k*22} h-6 M${sx + 60} ${r.y1 + 50 + k*22} h6" stroke="#6B4A2E" stroke-width="1.6"/>`).join("")}`)
    + D(`<path d="M${sx + 22} ${r.y1} l14 -4 v20 l-14 2z" style="fill:${ST.c === "bluebell" ? BLUE : lt(S.wood, .1)}"/>`))
    + otherSpot("bedroom", "Back through to the bedroom", hovE(sx, sy, 34, 10),
    sk(`<rect x="${sx - 26}" y="${sy - 12}" width="52" height="16" rx="5" style="fill:${S.fabric2}"/>`, `<rect x="${sx - 26}" y="${sy - 12}" width="52" height="16" rx="5"/>`) + `<path d="M${sx - 20} ${sy - 8} h40 M${sx - 20} ${sy} h40" stroke="${S.accent}" stroke-width="1.2" pointer-events="none"/>`
    + lab(sx, r.y1 + 44, "Bedroom", "#F3E1A0", 8));
}
// a runner from the door to the bath, a ladder of towels against the side wall, a slipper chair and a plant stand
const bathDecor = () => "";
function bathArt(){
  const [wx] = at("bathplant");
  glow(wx - 40, WT + 18, 24); glow(wx + 40, WT + 18, 24);
  const sconce = sx => `<path d="M${sx} ${WT + 16} v8" stroke="${S.metal}" stroke-width="1.6"/><path d="M${sx - 5} ${WT + 10} h10 l-2 8 h-6z" fill="${NIGHT ? "#FFE8A8" : "#F6EEDA"}" stroke="${INK}" stroke-width=".6"/>`;
  return bathShell() + windowArt(wx - 24, WT + 12, 48, 48, {seed: 5}) + g(sconce(wx - 40) + sconce(wx + 40)) + accBath("bathplant") + accBath("robes") + pieceSpot("basin", basin) + accBath("soaps")
    + bathCorners() + pieceSpot("bathrug", bathrug) + pieceSpot("bath", bathTub) + towelRail() + livedBath() + bedroomDoor() + crates();
}
/* ====================================================================================================== */
/* ---------- the back garden ---------- */
const GW = 214;   // the foot of the garden wall
function gardenShell(){
  let s = `<rect width="520" height="${GW}" style="fill:${NIGHT ? "#26325E" : "#CFE6F2"}"/>`;
  s += NIGHT ? Array.from({length: 16}, (_, k) => `<circle cx="${f1(R(k)*520)}" cy="${f1(6 + R(k + 5)*90)}" r="${f1(.8 + R(k)*.9)}" fill="#FFF3C4"/>`).join("") + `<path d="M84 26 a9 9 0 1 0 9 12 a7 7 0 1 1 -9 -12z" fill="#FFF3C4"/>`
    : `<ellipse cx="120" cy="40" rx="34" ry="8" fill="#FFFFFF" opacity=".85"/><ellipse cx="380" cy="28" rx="26" ry="6" fill="#FFFFFF" opacity=".8"/>`;
  // the neighbours' trees beyond the wall
  s += Array.from({length: 14}, (_, k) => `<circle cx="${k*40 + 10}" cy="${126 + (k % 3)*6}" r="${22 + (k % 2)*6}" fill="${NIGHT ? "#2E4038" : k % 2 ? "#8FB47A" : "#7FA86A"}"/>`).join("");
  // the grass, mown in stripes, with tufts and daisies
  s += `<rect y="${GW}" width="520" height="${640 - GW}" style="fill:#A8C77A"/>` + Array.from({length: 12}, (_, k) => k % 2 ? `<rect y="${GW + k*36}" width="520" height="36" style="fill:#B2D088"/>` : "").join("")
    + Array.from({length: 36}, (_, k) => { const x = f1(R(k*3)*520), y = f1(GW + 10 + R(k*7)*380); return `<path d="M${x} ${y} l-1.4 -4 M${x} ${y} l0 -5 M${x} ${y} l1.4 -4" stroke="#7FA05A" stroke-width=".8"/>`; }).join("")
    + Array.from({length: 16}, (_, k) => `<circle cx="${f1(R(k*5 + 2)*520)}" cy="${f1(GW + 40 + R(k*11 + 1)*340)}" r="1.6" fill="#FFFFFF"/>`).join("");
  if (ST.c === "figtree") {   // Fig Tree: an old brick wall with a stone coping
    s += `<rect y="150" width="520" height="${GW - 150}" style="fill:#C27A5A"/>` + Array.from({length: 9}, (_, r) => `<path d="M0 ${156 + r*7} H520" stroke="#A8664A" stroke-width=".8"/>` + Array.from({length: 26}, (_, k) => `<path d="M${k*20 + (r % 2)*10} ${156 + r*7} v7" stroke="#A8664A" stroke-width=".8"/>`).join("")).join("")
      + `<rect y="146" width="520" height="7" style="fill:#C9BCA4"/><path d="M0 146 H520 M0 153 H520" stroke="${INK}" stroke-width="1"/>`;
  } else {   // Bluebell: a white picket fence in front of a beech hedge
    s += `<rect y="136" width="520" height="${GW - 136}" style="fill:#7FA05A"/>` + Array.from({length: 30}, (_, k) => `<circle cx="${k*18}" cy="${140 + (k % 3)*3}" r="11" fill="${k % 2 ? "#6E9A4A" : "#88AE5E"}"/>`).join("")
      + Array.from({length: 44}, (_, k) => `<path d="M${k*12 + 1} ${GW} V166 l5 -6 l5 6 V${GW}z" fill="#F6F2E8" stroke="#B8B0A0" stroke-width=".8"/>`).join("") + `<rect y="176" width="520" height="5" fill="#EDE8DC"/><rect y="200" width="520" height="5" fill="#EDE8DC"/>`;
  }
  s += `<path d="M0 ${GW} H520" stroke="${INK}" stroke-width="1.2"/>`;
  // climbing roses along the top of the wall, a few trailing down
  const roses = [S.fabric, "#E86A7A", "#F4B8C0", "#FFFFFF", "#D9433A"], top = ST.c === "figtree" ? 146 : 160;
  s += Array.from({length: 30}, (_, k) => { const x = k*18 + 4 + R(k)*6, y = top + R(k + 4)*6, down = k % 4 === 1 ? 34 : 0;
    return `<path d="M${f1(x)} ${f1(y)} q${f1(R(k)*6 - 3)} ${down/2} 0 ${down}" stroke="#4E7A3E" stroke-width="1.2" fill="none"/>${[0, 1, 2].map(j => `<ellipse cx="${f1(x - 5 + j*5)}" cy="${f1(y + (j % 2)*3 + (j === 2 ? down*.6 : 0))}" rx="4" ry="2.6" fill="#5E8A4A"/>`).join("")}<circle cx="${f1(x)}" cy="${f1(y - 1)}" r="2.8" fill="${roses[k % 5]}" stroke="${INK}" stroke-width=".4"/><circle cx="${f1(x + 4)}" cy="${f1(y + down*.8 + 2)}" r="2.4" fill="${roses[(k + 2) % 5]}" stroke="${INK}" stroke-width=".4"/>`; }).join("");
  // the stepping-stone path: from the back door up to the fire pit, and on to the table
  s += [[260, 588], [252, 566], [244, 544], [236, 522], [196, 444], [172, 426], [148, 408]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="4.6" fill="#C9C2B4" stroke="#8E8678" stroke-width=".8"/><path d="M${x - 4} ${y - 1} q3 -1.4 7 0" stroke="#E0DACC" stroke-width=".8" fill="none"/>`).join("");
  return g(s);
}
// the screen of planting round the hot tub: Fig Tree's fig, or Bluebell's tall grasses and bamboo
function screenPlanting(){
  const [hx] = at("hottub");
  const grasses = (x0, n) => Array.from({length: n}, (_, k) => { const x = x0 + k*7; return `<path d="M${x} 330 q${f1(-4 + R(k)*8)} -30 ${f1(-6 + R(k + 3)*12)} -58" stroke="${k % 2 ? "#7FA05A" : "#9AB86A"}" stroke-width="2" fill="none"/>`; }).join("");
  let s = D(`<rect x="${hx + 40}" y="314" width="44" height="18" rx="1" style="fill:${lt(S.wood, .05)}"/>`, grasses(hx + 44, 6) + `<path d="M${hx + 40} 322 h44" stroke="${dk(S.wood, .2)}" stroke-width=".8"/>`);
  if (ST.c === "figtree") {
    const leaf = (x, y, a, c) => `<path d="M0 0 q-6 -3 -7 -10 q3 -1 4 1 q-1 -6 3 -8 q3 3 1 7 q1 -4 6 -4 q1 4 -3 7 q4 0 6 3 q-4 4 -10 4z" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a)})" fill="${c}" stroke="${INK}" stroke-width=".5"/>`;
    s += g(D(`<path d="M488 ${GW + 54} q-3 -30 -12 -50 l6 -2 q6 16 10 28 q4 -22 14 -36 l5 3 q-10 18 -12 57z" style="fill:#8E8070"/>`)
      + Array.from({length: 26}, (_, k) => leaf(440 + R(k)*80, 118 + R(k + 7)*104, R(k + 3)*360, ["#5E8A4A", "#6E9A4A", "#4E7A3E"][k % 3])).join("")
      + [[456, 176], [478, 150], [504, 190], [448, 136], [496, 124]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="3.6" fill="#6A3A5A" stroke="${INK}" stroke-width=".4"/>`).join(""));
  } else s += g(D(`<path d="M474 ${GW + 52} h40 l-2 -12 h-36z" style="fill:#B8AE9E"/>`, Array.from({length: 9}, (_, k) => `<path d="M${478 + k*4} ${GW + 42} V${150 + (k % 3)*14}" stroke="#7FA05A" stroke-width="2"/>${[0, 1, 2].map(j => `<path d="M${478 + k*4} ${170 + j*22 + (k % 2)*6} l${k % 2 ? 7 : -7} -3" stroke="#6E9A4A" stroke-width="1.4"/>`).join("")}`).join("")));
  return s;
}
function flowerbeds(t, x, y){
  const bluebells = (bx, by) => ST.c === "bluebell" ? `<path d="M${bx} ${by} q1 -9 5 -12" stroke="#5E8A4A" stroke-width=".9" fill="none"/>${[0, 1, 2].map(j => `<path d="M${bx + 1.4 + j*2} ${by - 4 - j*2.6} q-2 2.6 0 4 q2 -1.4 0 -4z" fill="#5C6FD0"/>`).join("")}` : "";
  const pots = [x - 100, x - 60, x - 20, x + 20, x + 60, x + 100];
  if (t === 1) return D(pots.map(px => `<path d="M${px - 8} ${y - 11} h16 l-2 11 h-12z" style="fill:#C8643B"/>`).join(""),
    pots.map((px, k) => `${[[-4, -5], [0, -8], [4, -5]].map(([dx, dy]) => `<ellipse cx="${px + dx}" cy="${y - 11 + dy}" rx="4" ry="3.4" fill="#5E8A4A"/>`).join("")}${[[-3, -8], [3, -9], [0, -5]].map(([dx, dy]) => `<circle cx="${px + dx}" cy="${y - 11 + dy}" r="2" fill="${["#D9433A", "#9A7AC8", "#F6E3A1", S.fabric, "#E86A7A", "#FFFFFF"][k]}"/>`).join("")}<path d="M${px - 9} ${y - 11} h18" stroke="#8E4A2A" stroke-width="1.6"/>`).join("") + bluebells(x + 120, y));
  const border = D(`<path d="M16 ${GW - 2} H504 V${y - 4} q-60 7 -120 3 q-62 -5 -124 1 q-62 5 -124 -1 q-60 -5 -120 3z" style="fill:#8A6A4A"/>`,
    Array.from({length: 44}, (_, k) => { const fx = 20 + k*11, h = 12 + R(k)*22, c = ["#C9B3E3", "#E86A7A", "#F6E3A1", S.fabric, "#9A7AC8", "#FFFFFF"][k % 6];
      return `<path d="M${fx} ${y - 6} V${f1(y - 6 - h)}" stroke="#5E8A4A" stroke-width="1.2"/><ellipse cx="${fx - 2}" cy="${f1(y - 6 - h*.4)}" rx="3" ry="1.4" fill="#6E9A4A"/>${k % 3 === 0 ? [0, 1, 2, 3].map(j => `<circle cx="${fx}" cy="${f1(y - 6 - h + j*3.4)}" r="1.8" fill="${c}"/>`).join("") : `<circle cx="${fx}" cy="${f1(y - 6 - h)}" r="${k % 2 ? 2.8 : 2.2}" fill="${c}" stroke="${INK}" stroke-width=".3"/>`}`; }).join("")
    + [40, 120, 200, 330, 400].map(bx => bluebells(bx, y - 4)).join(""));
  if (t === 2) return border;
  return border + D(`<rect x="${x - 20}" y="160" width="4" height="${y - 160}" style="fill:#F6F2E8"/><rect x="${x + 16}" y="160" width="4" height="${y - 160}" style="fill:#F6F2E8"/><path d="M${x - 20} 162 q20 -26 40 0 l-4 1 q-16 -20 -32 0z" style="fill:#F6F2E8"/>`,
    Array.from({length: 18}, (_, k) => { const a = Math.PI*(k/17), ax = x - Math.cos(a)*20, ay = 162 - Math.sin(a)*16; return `<ellipse cx="${f1(ax)}" cy="${f1(ay)}" rx="4.4" ry="3" fill="#5E8A4A"/>${k % 2 ? `<circle cx="${f1(ax + 1)}" cy="${f1(ay - 1)}" r="2.6" fill="${k % 4 === 1 ? S.fabric : "#E86A7A"}" stroke="${INK}" stroke-width=".3"/>` : ""}`; }).join("")
    + [0, 1, 2, 3, 4, 5].map(k => `<ellipse cx="${k % 2 ? x + 18 : x - 18}" cy="${176 + k*10}" rx="4" ry="2.6" fill="#5E8A4A"/><circle cx="${k % 2 ? x + 19 : x - 19}" cy="${178 + k*10}" r="2.4" fill="#E86A7A" stroke="${INK}" stroke-width=".3"/>`).join(""));
}
function festoon(t){
  const bulb = (x, y, k) => { if (k % 2 === 0) glow(x, y + 3, 14); return `<path d="M${f1(x)} ${f1(y)} v2" stroke="${INK}" stroke-width=".6"/><ellipse cx="${f1(x)}" cy="${f1(y + 4)}" rx="2" ry="2.8" fill="${NIGHT ? "#FFE08A" : "#FFF6DA"}" stroke="${INK}" stroke-width=".4"/>`; };
  const string = (x0, y0, x1, y1, sag, n) => { let s = `<path d="M${x0} ${y0} Q${(x0 + x1)/2} ${(y0 + y1)/2 + sag*2} ${x1} ${y1}" fill="none" stroke="#3A3634" stroke-width="1"/>`;
    for (let k = 1; k < n; k++) { const u = k/n, x = (1 - u)*(1 - u)*x0 + 2*u*(1 - u)*(x0 + x1)/2 + u*u*x1, y = (1 - u)*(1 - u)*y0 + 2*u*(1 - u)*((y0 + y1)/2 + sag*2) + u*u*y1; s += bulb(x, y, k); }
    return s; };
  let s = D(`<rect x="25" y="172" width="5" height="90" style="fill:${S.wood}"/><rect x="490" y="172" width="5" height="90" style="fill:${S.wood}"/>`);
  s += g(string(28, 176, 492, 176, 18, 20));
  if (t > 1) s += g(string(28, 190, 492, 176, 24, 18) + string(28, 176, 492, 192, 26, 18));
  if (t === 3) s += g([[110, 206], [190, 218], [330, 218], [410, 206]].map(([x, y], k) => { glow(x, y + 6, 18); return `<path d="M${x} ${y - 12} v5" stroke="${INK}" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="6.4" fill="${[S.fabric, S.accent, S.fabric2, S.fabric][k]}" stroke="${INK}" stroke-width=".6"/><path d="M${x - 6.4} ${y} h12.8" stroke="${INK}" stroke-width=".3" opacity=".5"/>`; }).join("")
    + [27.5, 492.5].map(x => { glow(x, 164, 18); return `<rect x="${x - 4.4}" y="158" width="9" height="12" rx="1.4" fill="#FFF3C8" stroke="${INK}" stroke-width=".6"/><path d="M${x - 5.4} 158 l5.4 -4 l5.4 4z" fill="#3A3634"/>`; }).join(""));
  return s;
}
function hottub(t, x, y){
  const leaves = undone("hottub"), cy = y - 34;
  let s = "";
  if (t === 3) s += D(`<rect x="${x - 36}" y="${y - 120}" width="4" height="${86}" style="fill:${dk(S.wood, .2)}"/><rect x="${x + 32}" y="${y - 120}" width="4" height="${86}" style="fill:${dk(S.wood, .2)}"/>`);
  const water = `<ellipse cx="${x}" cy="${cy + 1}" rx="32" ry="8" style="fill:${t === 3 ? "#7FD8DE" : "#8FCCD6"}"/>`;
  const shell = (side, rim) => `<path d="M${x - 37} ${cy} V${y - 10} q37 20 74 0 V${cy}z" style="fill:${side}"/><ellipse cx="${x}" cy="${cy}" rx="37" ry="11" style="fill:${rim}"/>` + water;
  if (t === 1) s += D(shell("#A8754F", "#B9875E"), Array.from({length: 9}, (_, k) => `<path d="M${x - 33 + k*8.2} ${f1(cy + 9 + Math.sin(k/8*Math.PI)*2)} V${f1(y - 8 + Math.sin(k/8*Math.PI)*9)}" stroke="#8A6340" stroke-width=".8"/>`).join("") + `<path d="M${x - 37} ${cy + 10} q37 20 74 0 M${x - 37} ${cy + 22} q37 20 74 0" stroke="#4A4644" stroke-width="1.8" fill="none"/>`);
  else s += D(shell(t === 3 ? dk(S.wood, .25) : "#B7744A", t === 3 ? dk(S.wood, .1) : "#C98A5E") + `<rect x="${x - 50}" y="${y - 18}" width="16" height="8" rx="1" style="fill:#B7744A"/><rect x="${x - 54}" y="${y - 10}" width="20" height="10" rx="1" style="fill:#C98A5E"/>`,
    [0, 1, 2].map(k => `<path d="M${x - 37} ${cy + 8 + k*7} q37 20 74 0" stroke="${t === 3 ? dk(S.wood, .4) : "#9A5E3A"}" stroke-width=".7" fill="none"/>`).join(""));
  if (t === 3) { s += g(Array.from({length: 10}, (_, k) => { const a = Math.PI*(k/9), lx = x - Math.cos(a)*34, ly = cy + 2 + Math.sin(a)*9; glow(lx, ly, 10); return `<circle cx="${f1(lx)}" cy="${f1(ly)}" r="1.5" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".3"/>`; }).join(""));
    if (NIGHT) glow(x, cy, 50); }
  if (!leaves) s += g([0, 1, 2].map(k => `<path d="M${x - 14 + k*14} ${cy - 4} q-4 -7 0 -12 q4 -6 0 -11" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity=".55"/>`).join(""));
  else s += g([[-18, 0], [-4, 4], [10, -1], [-10, -3], [18, 3]].map(([dx, dy], k) => `<path d="M${x + dx} ${cy + dy} q3 -3 6 0 q-3 3 -6 0z" fill="${["#D98A3A", "#C8643B", "#9AAE4A"][k % 3]}" stroke="${INK}" stroke-width=".4" transform="rotate(${k*40} ${x + dx + 3} ${cy + dy})"/>`).join("")
      + D(`<path d="M${x + 4} ${cy - 11} q22 -1 36 8 q4 9 -3 14 l-25 2 q-8 -9 -8 -24z" style="fill:#6E7A6E"/>`, `<path d="M${x + 14} ${cy - 7} q11 3 20 9" stroke="#8E9A8E" stroke-width="1" fill="none"/>`));
  if (t === 3) s += D(`<rect x="${x - 40}" y="${y - 100}" width="4" height="${100}" style="fill:${dk(S.wood, .2)}"/><rect x="${x + 36}" y="${y - 100}" width="4" height="${100}" style="fill:${dk(S.wood, .2)}"/><path d="M${x - 48} ${y - 104} L${x} ${y - 124} L${x + 48} ${y - 104} v7 H${x - 48}z" style="fill:${S.fabric2}"/>`,
    `<path d="M${x - 48} ${y - 97} ${Array.from({length: 8}, () => `q6 6 12 0`).join(" ")}" fill="${S.accent}" opacity=".8"/>` + Array.from({length: 7}, (_, k) => { glow(x - 42 + k*14, y - 92, 10); return `<circle cx="${x - 42 + k*14}" cy="${y - 92}" r="1.5" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".3"/>`; }).join(""));
  return s;
}
function patio(t, x, y){
  if (t === 1) return D(`<ellipse cx="${x}" cy="${y - 22}" rx="13" ry="4.6" style="fill:${S.accent}"/>`, `<path d="M${x} ${y - 18} v18 M${x - 5} ${y} h10" stroke="${S.accent}" stroke-width="1.8"/>` + chairSide(x - 26, y, S.accent, 1) + chairSide(x + 26, y, S.accent, -1) + `<rect x="${x - 4}" y="${y - 30}" width="4" height="6" rx="1" fill="${CREAM}" stroke="${INK}" stroke-width=".4"/>`);
  let s = "";
  const W = t === 2 ? 26 : 36;
  if (t === 3) s += D(`<rect x="${x - 42}" y="${y - 110}" width="4" height="${74}" style="fill:${S.wood}"/><rect x="${x + 38}" y="${y - 110}" width="4" height="${74}" style="fill:${S.wood}"/>`);
  s += g((t === 2 ? [x - 12, x + 12] : [x - 22, x, x + 22]).map(cx => chairBack(cx, y - 20, S.wood)).join(""));
  s += D(`<rect x="${x - W}" y="${y - 30}" width="${W*2}" height="12" rx="1.5" style="fill:${S.wood}"/><rect x="${x - W}" y="${y - 18}" width="${W*2}" height="3" style="fill:${dk(S.wood, .25)}"/>`,
    `<path d="M${x - W + 4} ${y - 15} v15 M${x + W - 4} ${y - 15} v15" stroke="${dk(S.wood, .25)}" stroke-width="2.4"/>${[0, 1, 2].map(k => `<path d="M${x - W + 2} ${y - 27 + k*3} h${W*2 - 4}" stroke="${dk(S.wood, .15)}" stroke-width=".5"/>`).join("")}<path d="M${x - 2} ${y - 30} l-1 -6 h6 l-1 6z" fill="${CREAM}"/><circle cx="${x}" cy="${y - 37}" r="2.4" fill="${S.fabric}"/>` + chairSide(x - W - 12, y, S.wood, 1) + chairSide(x + W + 12, y, S.wood, -1));
  if (t === 3) s += D(`<rect x="${x - 48}" y="${y - 84}" width="5" height="${88}" style="fill:${S.wood}"/><rect x="${x + 43}" y="${y - 84}" width="5" height="${88}" style="fill:${S.wood}"/><path d="M${x - 54} ${y - 88} H${x + 54} v5 H${x - 54}z" style="fill:${S.wood}"/><path d="M${x - 44} ${y - 112} H${x + 44} v4 H${x - 44}z" style="fill:${S.wood}"/>`,
    [0, 1, 2, 3, 4].map(k => `<path d="M${x - 36 + k*18} ${y - 108} l-4 22" stroke="${S.wood}" stroke-width="3"/>`).join("") + Array.from({length: 14}, (_, k) => `<ellipse cx="${x - 52 + k*8}" cy="${y - 86 + (k % 3)*1.6}" rx="4.4" ry="3" fill="#5E8A4A"/>${k % 3 === 0 ? `<path d="M${x - 52 + k*8} ${y - 83} q-1.4 7 0 11" stroke="#9A7AC8" stroke-width="2.4" stroke-linecap="round"/>` : ""}`).join(""));
  return s;
}
function hammock(t, x, y){
  if (t === 1) return D(`<path d="M${x - 8} ${y} l5 -20 h14 l-5 20z" style="fill:${S.fabric}"/>`, `<path d="M${x - 6} ${y - 6} l4 -14 M${x + 1} ${y} l4 -20 M${x + 6} ${y} l4 -20" stroke="${CREAM}" stroke-width="2"/><path d="M${x - 10} ${y} l10 -26 M${x + 14} ${y} l-6 -20 M${x - 10} ${y - 9} h24" stroke="${S.wood}" stroke-width="1.8"/>`);
  let s = D(`<rect x="${x - 50}" y="${y - 50}" width="5" height="50" style="fill:${S.wood}"/><rect x="${x + 45}" y="${y - 50}" width="5" height="50" style="fill:${S.wood}"/><path d="M${x - 38} ${y - 34} q38 30 76 0 q-38 20 -76 0z" style="fill:${S.fabric2}"/>`,
    `<path d="M${x - 45} ${y - 44} L${x - 38} ${y - 34} M${x + 45} ${y - 44} L${x + 38} ${y - 34}" stroke="#C9B48A" stroke-width="1.1"/>${[0, 1, 2].map(k => `<path d="M${x - 26 + k*22} ${y - 30} q3 ${8 + (k === 1 ? 4 : 0)} 0 12" stroke="${S.accent}" stroke-width="1.6" fill="none"/>`).join("")}<rect x="${x - 26}" y="${y - 28}" width="13" height="7" rx="3" fill="${S.fabric}" stroke="${INK}" stroke-width=".5" transform="rotate(14 ${x - 20} ${y - 25})"/>`);
  if (t === 3) s += D(`<rect x="${x + 30}" y="${y + 24}" width="52" height="13" rx="4" style="fill:${S.fabric2}"/><rect x="${x + 28}" y="${y + 36}" width="56" height="5" rx="1.4" style="fill:${S.wood}"/><rect x="${x + 33}" y="${y + 16}" width="14" height="10" rx="3" style="fill:${S.accent}"/><rect x="${x + 63}" y="${y + 16}" width="14" height="10" rx="3" style="fill:${S.fabric}"/>`, `<path d="M${x + 31} ${y + 41} v4 M${x + 81} ${y + 41} v4" stroke="${dk(S.wood, .3)}" stroke-width="2"/>`);
  return s;
}
function firepit(t, x, y){
  const fire = (fy, sc) => { glow(x, fy - 8, t === 3 ? 54 : 44); return `<path d="M${x - 8} ${fy} l16 -2.4 M${x - 7} ${fy - 2.4} l14 2.4" stroke="#6B4A2E" stroke-width="${2.6*sc}" stroke-linecap="round"/>` + flame(x - 3, fy - 2, sc*.7) + flame(x + 3, fy - 2, sc*.55) + flame(x, fy - 3, sc*.85); };
  if (t === 1) return D(`<path d="M${x - 14} ${y - 22} h28 q-3 9 -14 9 q-11 0 -14 -9z" style="fill:#3A3634"/>`, `<path d="M${x - 9} ${y - 15} l-4 15 M${x + 9} ${y - 15} l4 15 M${x} ${y - 13} v13" stroke="#3A3634" stroke-width="1.8"/>` + fire(y - 21, .8));
  const ring = (rx, ry, cy) => Array.from({length: 12}, (_, k) => { const a = k/12*Math.PI*2; return `<ellipse cx="${f1(x + Math.cos(a)*rx)}" cy="${f1(cy + Math.sin(a)*ry)}" rx="5" ry="3.2" fill="${k % 2 ? "#B8AE9E" : "#A89C88"}" stroke="${INK}" stroke-width=".5"/>`; }).join("");
  if (t === 2) return D(`<ellipse cx="${x}" cy="${y - 10}" rx="20" ry="7" style="fill:#4A4040"/>`, ring(20, 7, y - 10) + fire(y - 9, 1));
  return D(`<ellipse cx="${x}" cy="${y - 12}" rx="52" ry="18" style="fill:#C9C2B4"/><ellipse cx="${x}" cy="${y - 12}" rx="20" ry="7" style="fill:#3A3434"/><rect x="${x - 32}" y="${y - 44}" width="64" height="6" rx="2" style="fill:${S.wood}"/><rect x="${x - 60}" y="${y - 26}" width="10" height="26" rx="2" style="fill:${S.wood}"/>`,
    `<path d="M${x - 28} ${y - 38} v6 M${x + 28} ${y - 38} v6" stroke="${dk(S.wood, .3)}" stroke-width="2.6"/>` + [0, 1, 2, 3].map(k => `<path d="M${x - 44 + k*28} ${y - 18 + (k % 2)*8} l10 ${k % 2 ? -5 : 5}" stroke="#A89C88" stroke-width=".6"/>`).join("") + ring(22, 8, y - 12) + fire(y - 11, 1.1));
}
function house(){
  const door = ST.c === "bluebell" ? BLUE : "#7E9A68", wall = ST.c === "bluebell" ? "#F2EFE6" : "#E3D3B4";
  if (NIGHT) { glow(178, 610, 34); glow(342, 610, 34); }
  const winC = NIGHT ? "#FFD98A" : "#CFE6F2";
  return otherSpot("house", "Back inside the cottage", hovE(260, 604, 34, 12),
    `<rect y="582" width="520" height="58" style="fill:${wall}"/>` + sk("", `<path d="M0 582 H520"/>`)
    + D(`<rect x="160" y="596" width="36" height="34" style="fill:${winC}"/><rect x="324" y="596" width="36" height="34" style="fill:${winC}"/><path d="M243 640 V584 q17 -12 34 0 V640z" style="fill:${lt(wall, .2)}"/><path d="M246 640 V587 q14 -9 28 0 V640z" style="fill:${door}"/><path d="M236 580 q24 -18 48 0 l-4 3 q-20 -14 -40 0z" style="fill:#6A6E74"/>`,
      `<path d="M178 596 v34 M160 613 h36 M342 596 v34 M324 613 h36" stroke="${CREAM}" stroke-width="2"/><circle cx="270" cy="616" r="1.6" fill="${S.metal}"/><rect x="252" y="596" width="16" height="7" rx="1.4" fill="${lt(door, .3)}"/>`
      + (ST.c === "bluebell" ? [148, 196, 312, 360].map(x => `<rect x="${x}" y="594" width="12" height="38" fill="${BLUE}" stroke="${INK}" stroke-width=".6"/>`).join("") : "")
      + (ST.c === "figtree" ? Array.from({length: 18}, (_, k) => `<path d="M${f1(R(k)*520)} ${f1(588 + R(k + 1)*46)} h18" stroke="#C9B894" stroke-width=".8"/>`).join("") : "")
      + [0, 1, 2, 3, 4, 5].map(k => `<ellipse cx="${240 + (k % 2)*3}" cy="${636 - k*8}" rx="4" ry="2.6" fill="#5E8A4A"/><ellipse cx="${280 - (k % 2)*3}" cy="${636 - k*8}" rx="4" ry="2.6" fill="#6E9A4A"/>`).join(""))
    + lab(260, 558, "Back inside", "#F3E1A0", 8));
}
function accGarden(id){
  if (!has(id)) return "";
  const [x, y] = at(id);
  if (id === "birdbath") return g(D(`<path d="M${x - 3} ${y} l1.4 -20 h3.2 l1.4 20z" style="fill:#C9C2B4"/><path d="M${x - 13} ${y - 20} q13 7 26 0 q-3 -5 -13 -5 q-10 0 -13 5z" style="fill:#D8D2C4"/><rect x="${x - 8}" y="${y - 2}" width="16" height="3.4" rx="1" style="fill:#B8AE9E"/>`, `<ellipse cx="${x}" cy="${y - 22}" rx="9" ry="2" fill="#9FD0DC"/><path d="M${x + 4} ${y - 26} q3 -4 6 -1 l3 -1 l-2 2 q0 3 -4 3z" fill="#8A6A52"/>`));
  if (id === "blankets") return g(D(`<path d="M${x - 9} ${y} h18 l-2 -12 h-14z" style="fill:#C9A26A"/><rect x="${x - 8}" y="${y - 20}" width="8" height="9" rx="3.4" style="fill:${S.fabric}"/><rect x="${x - 1}" y="${y - 19}" width="8" height="8" rx="3.4" style="fill:${S.fabric2}"/>`, `<path d="M${x - 6} ${y - 20} v9 M${x - 3} ${y - 20} v9" stroke="${S.accent}" stroke-width=".7"/>`));
  if (id === "lanterns") return g([[x, y + 12], [x - 6, y - 16], [x - 40, y + 4]].map(([lx, ly]) => { glow(lx, ly - 6, 20); return D(`<rect x="${lx - 4}" y="${ly - 11}" width="8" height="11" rx="1.4" style="fill:${NIGHT ? "#FFE8A8" : "#E8F1F0"}"/><path d="M${lx - 5} ${ly - 11} l5 -4 l5 4z" style="fill:#3A3634"/>`, `<path d="M${lx} ${ly - 16} q3 -3 0 -4" stroke="#3A3634" stroke-width=".8" fill="none"/><rect x="${lx - 1.4}" y="${ly - 7}" width="2.8" height="4" fill="${CREAM}"/>${flame(lx, ly - 7, .22)}`); }).join(""));
  return "";
}
// a raised herb bed and a watering can, geraniums by the back door, and stepping stones from the fire to the hot tub
function gardenDecor(){
  let s = D(`<rect x="22" y="498" width="96" height="24" rx="1" style="fill:${S.wood}"/><rect x="22" y="494" width="96" height="6" style="fill:#7A5A3E"/>`, `<path d="M22 510 h96" stroke="${dk(S.wood, .3)}" stroke-width=".8"/>${Array.from({length: 12}, (_, k) => `<ellipse cx="${28 + k*8}" cy="${490 - (k % 3)*2}" rx="4" ry="${5 + (k % 2)*2}" fill="${["#6E9A4A", "#88AE6A", "#5E8A4A"][k % 3]}"/>`).join("")}${[34, 66, 98].map(x => `<circle cx="${x}" cy="484" r="1.6" fill="#C9B3E3"/>`).join("")}`)
    + D(`<path d="M128 520 h14 l-2 -12 h-10z" style="fill:#7FA0A8"/>`, `<path d="M142 512 l8 -6" stroke="#7FA0A8" stroke-width="2"/><path d="M132 508 q5 -6 10 0" fill="none" stroke="#5E7A82" stroke-width="1.2"/>`);
  s += [212, 308].map(x => D(`<path d="M${x - 7} 582 h14 l-2 -10 h-10z" style="fill:#C8643B"/>`, `${[-3, 0, 3].map(d => `<circle cx="${x + d}" cy="${566 - Math.abs(d)}" r="2.4" fill="#D9433A"/>`).join("")}<ellipse cx="${x}" cy="571" rx="6" ry="3" fill="#5E8A4A"/>`)).join("");
  s += [[290, 452], [318, 426], [346, 402]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="4" fill="#C9C2B4" stroke="#8E8678" stroke-width=".8"/>`).join("");
  return g(s);
}
function gardenArt(){
  return gardenShell() + gardenDecor() + pieceSpot("beds", flowerbeds) + screenPlanting() + pieceSpot("festoon", festoon) + accGarden("birdbath") + pieceSpot("patio", patio) + pieceSpot("hottub", hottub)
    + pieceSpot("firepit", firepit) + accGarden("blankets") + pieceSpot("hammock", hammock) + accGarden("lanterns") + crates() + house();
}

/* ====================================================================================================== */
export function cottageArt(scene, st = {}){
  const m = /^(figtree|bluebell)_(down|up|bath|garden)$/.exec(scene || "") || [0, st.c || "figtree", st.floor || "down"];
  ST = {...st, c: m[1], floor: m[2], tiers: st.tiers || {}, acc: st.acc || {}, crates: st.crates || []};
  S = STYLES[ST.style] || STYLES.cottagecore; NIGHT = !!st.night; GL = []; CID = 0;
  const rm = ROOMS[ST.floor] || ROOMS.down; FL = rm.FL; WT = rm.WT;
  const body = ST.floor === "up" ? upArt() : ST.floor === "bath" ? bathArt() : ST.floor === "garden" ? gardenArt() : downArt();
  return glowDefs + body + (NIGHT ? nightWash() + `<g pointer-events="none">${GL.join("")}</g>` : "");
}
