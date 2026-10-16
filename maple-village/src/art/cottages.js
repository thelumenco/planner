// The holiday cottages (round 236): Fig Tree and Bluebell, which Mel buys from Elena and does up for guests. Three
// screens each: downstairs (the sitting room on the left, the kitchen on the right, the front door at the bottom and
// the wooden stairs up, like the mill's), upstairs (the bedroom, and the bath behind a half wall on the left) and the
// back garden (a wall with climbing roses, grass, a stepping-stone path and the hot tub). Furniture comes in three
// tiers in one of six looks (STYLES, src/data/cottages.js); tier 0 is a faint dashed footprint Mel can tap to buy.
// Mid-changeover the jobs still to do show: a rumpled bed, towels on the floor, mugs on the tables, leaves in the tub.
// Bluebell has blue shutters and a blue door; Fig Tree has its fig tree in the garden corner.
// The edges full, the middle calm and clear (the playbook). Spots: data-cospot (core.js coSpot).
import { sk, tapeLabel } from "./scenes.js";
import { STYLES, PIECES, ACCESSORIES, SPOTS } from "../data/cottages.js";

/* ---------- helpers ---------- */
const g = s => `<g pointer-events="none">${s}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const lab = (x, y, t, col = "#F3E1A0", size = 9) => tapeLabel(x, y, t, col, size);
const f1 = n => (+n).toFixed(1);
const R = i => { const x = Math.sin(i*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };   // a steady scatter
const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v)*t).toString(16).padStart(2, "0")).join("").toUpperCase(); };
const dk = (c, t = .25) => mix(c, "#2A1E16", t), lt = (c, t = .3) => mix(c, "#FFFFFF", t);
// hand-drawn: the shapes get the marker fill, and their own outlines in wobbly ink; `det` is fine detail, no outline
const strip = s => s.replace(/ style="[^"]*"/g, "").replace(/ (opacity|fill|stroke-width|stroke-dasharray|transform-origin)="[^"]*"/g, "");
const D = (main, det = "") => sk(main + det, strip(main));
const txt = (x, y, t, size = 7, fill = "#3A2E28", weight = 400, rot = 0) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Klee One,serif" font-weight="${weight}" font-size="${size}" fill="${fill}" pointer-events="none"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ""}>${t}</text>`;

// the state for one render (set at the top of cottageArt)
let S = STYLES.cottagecore, ST = {}, NIGHT = false, GL = [];
const tier = id => +((ST.tiers || {})[id] || 0);
const has = id => !!(ST.acc || {})[id];
const undone = k => !!ST.turn && !ST.turn[k];
const glow = (x, y, r = 40) => { GL.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="url(#coGlow)"/>`); return ""; };
const BLUE = "#5277B8", BLUE2 = "#3A5A92", INK = "#3A2E28", CREAM = "#FFFDF6";

// a little flame (it flickers via the game's .flame class)
const flame = (x, y, s = 1) => `<path class="flame" d="M${x} ${y} q${-6*s} ${-4*s} ${-1*s} ${-13*s} q${1*s} ${5*s} ${4*s} ${6*s} q${3*s} ${4*s} ${-3*s} ${7*s}z" fill="#F6A23A"/><path class="flame" d="M${x} ${y} q${-3*s} ${-3*s} 0 ${-7*s} q${1*s} ${3*s} ${2*s} ${4*s} q${1*s} ${2*s} ${-2*s} ${3*s}z" fill="#FFE08A"/>`;
const books = (x0, x1, base, seed, hMax = 20) => { let s = "", x = x0, k = 0; const cols = [S.accent, S.fabric, dk(S.wood, .2), "#E8D9B8", S.fabric2, "#7E8FA6", "#C8553D"];
  while (x < x1 - 4) { const w = 4 + Math.round(R(seed + k)*3), h = hMax - 6 + Math.round(R(seed*3 + k)*6), c = cols[(k*3 + seed) % cols.length];
    if (R(seed + k*7) > .88 && x + 12 < x1) { s += `<rect x="${x + 2}" y="${base - h + 2}" width="${w}" height="${h - 2}" transform="rotate(-14 ${x + 2} ${base})" style="fill:${c}" stroke="${INK}" stroke-width=".6"/>`; x += w + 6; }
    else { s += `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" style="fill:${c}" stroke="${INK}" stroke-width=".6"/><path d="M${x} ${base - h + 3} h${w}" stroke="${lt(c, .5)}" stroke-width=".8"/>`; x += w + .6; }
    k++; }
  return s; };

/* ---------- the spot wrapper, and the faint footprint of a piece not bought yet ---------- */
// FOOT: the footprint [w, h] above the front edge, used for the dashed outline and the hover
const FOOT = {sofa: [150, 68], armchair: [66, 64], coffee: [90, 30], rug: [176, 70], fireplace: [96, 56], lamp: [40, 90], kitchen: [118, 48], dining: [112, 40], bookshelf: [92, 56],
  bed: [140, 120], bedside: [214, 36], wardrobe: [64, 100], bath: [100, 46], windowseat: [86, 26], bedrug: [168, 62], vanity: [92, 56],
  hottub: [136, 72], patio: [110, 44], festoon: [400, 40], beds: [280, 30], hammock: [100, 50], firepit: [70, 34]};
// where the "buy one" tape goes, when it would sit badly in the middle of the footprint
const GHOST_LAB = {festoon: [260, 118], beds: [260, 230], windowseat: [396, 160], bedside: [270, 300], lamp: [56, 344]};
function pieceSpot(id, draw){
  const P = PIECES[id], t = tier(id), [ax, ay] = P.at, [sx, sy] = P.stand, [w, h] = FOOT[id] || [60, 40];
  const hov = id === "festoon" ? hovE(260, 110, 200, 30) : id === "bedside" ? hovE(180, 312, 24, 10) + hovE(360, 312, 24, 10) : hovE(ax, ay - (t ? 6 : h/2), Math.round(w/2 + 6), t ? 13 : Math.round(h/2 + 4));
  let body;
  if (t) body = draw(t);
  else {
    const ghost = id === "festoon" ? `<path d="M30 80 Q260 150 490 80" fill="none"/>` : id === "bedside" ? `<rect x="164" y="280" width="32" height="36" rx="4"/><rect x="344" y="280" width="32" height="36" rx="4"/>`
      : id === "hottub" || id === "rug" || id === "bedrug" || id === "firepit" ? `<ellipse cx="${ax}" cy="${ay - h/2}" rx="${w/2}" ry="${h/2}"/>` : `<rect x="${ax - w/2}" y="${ay - h}" width="${w}" height="${h}" rx="6"/>`;
    const [lx, ly] = GHOST_LAB[id] || [ax, ay - h/2];
    body = `<g opacity=".38" pointer-events="none"><g fill="${id === "festoon" ? "none" : "#FFFDF6"}" fill-opacity=".35" style="stroke:var(--line)" stroke-width="1.6" stroke-dasharray="6 5">${ghost}</g></g><g opacity=".85">${lab(lx, ly, P.n, "#EFE6D6", 8)}</g>`;
  }
  return `<g data-cospot="${id}" data-x="${sx}" data-y="${sy}" aria-label="${t ? P.tiers[t - 1].n : `${P.n}: not bought yet`}">${hov}${body}</g>`;
}
const otherSpot = (id, aria, hov, body) => { const [sx, sy] = SPOTS[ST.floor][id]; return `<g data-cospot="${id}" data-x="${sx}" data-y="${sy}" aria-label="${aria}">${hov}${body}</g>`; };

/* ---------- the room shell: floor, back wall, beams, windows ---------- */
function floorArt(y0 = 200){
  let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${S.floor}"/>`;
  if (ST.style === "peranakan") {   // painted floor tiles: cream squares with a jade diamond at each corner and a pink flower
    for (let r = 0; y0 + r*48 < 640; r++) for (let k = 0; k < 11; k++) { const x = k*48, y = y0 + r*48;
      s += `<rect x="${x}" y="${y}" width="48" height="48" style="fill:${S.floor};stroke:${mix(S.floor, S.floor2, .45)}" stroke-width="1"/><path d="M${x} ${y - 8} l8 8 l-8 8 l-8 -8z" style="fill:${S.floor2}" opacity=".75"/><circle cx="${x + 24}" cy="${y + 24}" r="5" style="fill:${S.fabric}" opacity=".7"/><circle cx="${x + 24}" cy="${y + 24}" r="2" style="fill:${S.metal}"/>`; }
  } else {
    for (let r = 0; y0 + r*28 < 640; r++) { const y = y0 + r*28;
      s += `<path d="M0 ${y} H520" style="stroke:${S.floor2}" stroke-width="1.2"/>`;
      for (let k = 0; k < 4; k++) { const x = Math.round((k*150 + r*67) % 600) - 40; s += `<path d="M${x} ${y} v28" style="stroke:${S.floor2}" stroke-width="1"/>`; }
      if (r % 2) s += `<path d="M${Math.round(R(r)*400)} ${y + 13} q20 -3 40 0" fill="none" style="stroke:${S.floor2}" stroke-width=".7" opacity=".6"/>`; }
  }
  return g(s);
}
function wallArt(){
  let s = `<rect width="520" height="200" style="fill:${S.wall}"/>`;
  // a little pattern on the upper wall for the busier looks
  if (ST.style === "cottagecore") for (let r = 0; r < 5; r++) for (let k = 0; k < 14; k++) s += `<g opacity=".45"><circle cx="${k*40 + (r % 2)*20 + 10}" cy="${36 + r*20}" r="2" style="fill:${S.fabric}"/><path d="M${k*40 + (r % 2)*20 + 10} ${38 + r*20} l-3 4 M${k*40 + (r % 2)*20 + 10} ${38 + r*20} l3 4" style="stroke:${S.accent}" stroke-width=".8"/></g>`;
  if (ST.style === "peranakan") for (let k = 0; k < 18; k++) s += `<rect x="${k*30}" y="136" width="30" height="50" style="fill:${k % 2 ? S.floor2 : lt(S.floor2, .45)}" opacity=".55"/><circle cx="${k*30 + 15}" cy="161" r="6" style="fill:${S.fabric}" opacity=".6"/>`;
  // the dado rail and panelling below it
  s += `<rect y="132" width="520" height="56" style="fill:${S.wall2}" opacity="${ST.style === "peranakan" ? .35 : 1}"/><rect y="128" width="520" height="5" style="fill:${lt(S.wood, .25)}"/><path d="M0 128 H520 M0 133 H520" style="stroke:${dk(S.wall2, .3)}" stroke-width=".8"/>`;
  if (["coastal", "scandi", "cottagecore"].includes(ST.style)) s += Array.from({length: 40}, (_, k) => `<path d="M${k*13 + 6} 134 V188" style="stroke:${dk(S.wall2, .15)}" stroke-width=".8"/>`).join("");
  else if (ST.style === "midcentury" || ST.style === "japandi") s += Array.from({length: 8}, (_, k) => `<rect x="${k*66 + 8}" y="140" width="52" height="40" rx="2" fill="none" style="stroke:${dk(S.wall2, .15)}" stroke-width="1"/>`).join("");
  // the beams along the ceiling edge, and the joists' ends
  s += `<rect width="520" height="16" style="fill:${dk(S.wood, .4)}"/><path d="M0 16 H520" style="stroke:${INK}" stroke-width="1.2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<rect x="${k*72 + 12}" y="14" width="14" height="10" rx="1" style="fill:${dk(S.wood, .5)}"/>`).join("")}`
    + Array.from({length: 10}, (_, k) => `<path d="M${k*56 + 10} 6 q12 2 24 0" fill="none" style="stroke:${dk(S.wood, .2)}" stroke-width=".8"/>`).join("");
  // the skirting
  s += `<rect y="187" width="520" height="13" style="fill:${lt(S.wall2, .2)}"/><path d="M0 187 H520" style="stroke:${dk(S.wall2, .35)}" stroke-width="1"/><path d="M0 200 H520" style="stroke:${INK}" stroke-width="1.4"/>`;
  return g(s);
}
// what you see through a window: the sky, the downs and a hedge by day; dark blue, the moon and stars by night
function view(x, y, w, h, seed = 0){
  if (NIGHT) return `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#26325E"/><rect x="${x}" y="${y + h*.6}" width="${w}" height="${h*.4}" style="fill:#1E284C"/>`
    + [0, 1, 2, 3, 4].map(k => `<circle cx="${f1(x + 4 + R(seed + k)*(w - 8))}" cy="${f1(y + 4 + R(seed*2 + k*3)*h*.5)}" r="${f1(.8 + R(k)*.8)}" fill="#FFF3C4"/>`).join("")
    + (seed % 2 ? `<path d="M${x + w*.72} ${y + 10} a6 6 0 1 0 6 8 a5 5 0 1 1 -6 -8z" fill="#FFF3C4"/>` : "");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#CFE6F2"/><ellipse cx="${x + w*.3}" cy="${y + h*.25}" rx="${w*.18}" ry="4" fill="#FFFFFF" opacity=".8"/>`
    + `<path d="M${x} ${y + h*.62} q${w*.3} ${-h*.18} ${w*.6} ${-h*.06} q${w*.25} ${-h*.08} ${w*.4} ${h*.02} V${y + h} H${x}z" style="fill:#A9C98A"/><path d="M${x} ${y + h*.8} q${w*.5} ${-h*.1} ${w} 0 V${y + h} H${x}z" style="fill:#7FA86A"/>`
    + [0, 1, 2].map(k => `<circle cx="${f1(x + w*(.2 + k*.3))}" cy="${f1(y + h*.82)}" r="${f1(w*.09)}" style="fill:#6E9A5A"/>`).join("");
}
let CID = 0;
function windowArt(x, y, w, h, {curtains = true, seed = 1} = {}){
  const id = `coWin${++CID}`;
  let s = `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="2" style="fill:${lt(S.wall2, .1)}"/>`;
  s += `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${view(x, y, w, h, seed)}</g>`;
  const frame = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" style="stroke:${CREAM}" stroke-width="4"/>`;
  const bars = `<path d="M${x + w/2} ${y} v${h} M${x} ${y + h*.48} h${w}" style="stroke:${CREAM}" stroke-width="2.6"/>`;
  s += sk(frame + bars + `<rect x="${x - 9}" y="${y + h + 3}" width="${w + 18}" height="6" rx="1" style="fill:${lt(S.wood, .2)}"/>`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><rect x="${x - 9}" y="${y + h + 3}" width="${w + 18}" height="6" rx="1"/>`);
  if (ST.c === "bluebell") {   // Bluebell's blue shutters, folded back against the wall
    const sw = Math.round(w*.34);
    s += [x - 8 - sw, x + w + 8].map(sx => D(`<rect x="${sx}" y="${y - 4}" width="${sw}" height="${h + 8}" rx="1" style="fill:${BLUE}"/>`, Array.from({length: Math.floor((h + 4)/8)}, (_, k) => `<path d="M${sx + 2} ${y + 2 + k*8} h${sw - 4}" style="stroke:${BLUE2}" stroke-width="1.2"/>`).join(""))).join("");
  }
  if (curtains) s += D(`<path d="M${x - 10} ${y - 10} h${w*.28} q-6 ${h*.5} ${-2} ${h*.6} q4 ${h*.2} -6 ${h*.48} h${-w*.18} q-4 ${-h*.5} 0 ${-h*1.08}z" style="fill:${S.fabric2}"/><path d="M${x + w + 10} ${y - 10} h${-w*.28} q6 ${h*.5} 2 ${h*.6} q-4 ${h*.2} 6 ${h*.48} h${w*.18} q4 ${-h*.5} 0 ${-h*1.08}z" style="fill:${S.fabric2}"/>`,
    `<path d="M${x - 14} ${y - 12} H${x + w + 14}" style="stroke:${dk(S.wood, .3)}" stroke-width="3" stroke-linecap="round"/><path d="M${x - 2} ${y + h*.62} q4 2 8 0 M${x + w + 2} ${y + h*.62} q-4 2 -8 0" style="stroke:${S.accent}" stroke-width="2"/>`);
  return g(s);
}
// the night: the room dims a little and the warm lights glow
const nightWash = () => `<rect width="520" height="640" fill="#2E3470" opacity=".3" style="mix-blend-mode:multiply" pointer-events="none"/>`;
const glowDefs = `<defs><radialGradient id="coGlow"><stop offset="0" stop-color="#FFD98A" stop-opacity=".6"/><stop offset=".45" stop-color="#FFC66B" stop-opacity=".22"/><stop offset="1" stop-color="#FFC66B" stop-opacity="0"/></radialGradient></defs>`;

/* ---------- deliveries waiting: wrapped crates and parcels with string ---------- */
const SLOTS = {down: [[334, 612], [372, 612], [352, 586], [316, 562], [356, 560]], up: [[172, 612], [210, 612], [190, 586], [228, 586], [154, 586]], garden: [[330, 584], [368, 584], [348, 560], [386, 560]]};
function crates(){
  const here = (ST.crates || []).filter(id => { const r = (PIECES[id] || ACCESSORIES[id] || {}).room; return r ? r === ST.floor : ST.floor === "down"; });
  return g(here.slice(0, SLOTS[ST.floor].length).map((id, i) => { const [x, y] = SLOTS[ST.floor][i];
    if (PIECES[id]) return D(`<rect x="${x - 17}" y="${y - 26}" width="34" height="26" rx="1" style="fill:#C9A26A"/>`, `${[0, 1, 2].map(k => `<path d="M${x - 17} ${y - 20 + k*8} h34" stroke="#9A7A4A" stroke-width="1"/>`).join("")}<path d="M${x} ${y - 26} v26 M${x - 17} ${y - 13} h34" stroke="#8A3A2A" stroke-width="1.6"/><path d="M${x} ${y - 26} q-7 -7 -8 0 q1 3 8 0 q7 -7 8 0 q-1 3 -8 0" fill="none" stroke="#8A3A2A" stroke-width="1.4"/><rect x="${x + 6}" y="${y - 10}" width="9" height="6" rx="1" fill="${CREAM}" stroke="${INK}" stroke-width=".5" transform="rotate(8 ${x + 10} ${y - 7})"/>`);
    return D(`<rect x="${x - 13}" y="${y - 18}" width="26" height="18" rx="2" style="fill:#D8B98A"/>`, `<path d="M${x} ${y - 18} v18 M${x - 13} ${y - 9} h26" stroke="#7A4A2A" stroke-width="1.3"/><path d="M${x} ${y - 18} q-6 -6 -6 0 q1 2 6 0 q6 -6 6 0 q-1 2 -6 0" fill="none" stroke="#7A4A2A" stroke-width="1.2"/>`);
  }).join(""));
}

/* ====================================================================================================== */
/* ---------- downstairs ---------- */
function fireplace(t){
  const fire = (x, y, s) => `<path d="M${x - 14*s} ${y} l${28*s} -4 M${x - 12*s} ${y - 4} l${24*s} 4" stroke="#6B4A2E" stroke-width="${4*s}" stroke-linecap="round"/>` + flame(x - 5*s, y - 4, s) + flame(x + 5*s, y - 4, s*.8) + flame(x, y - 5, s*1.2);
  glow(110, 232, t === 3 ? 70 : 56);
  if (t === 1) return D(`<rect x="72" y="240" width="76" height="12" rx="2" style="fill:#8E8A86"/><rect x="106" y="197" width="8" height="14" style="fill:#3A3634"/><rect x="86" y="207" width="48" height="5" rx="1" style="fill:#4A4644"/><rect x="88" y="211" width="44" height="31" rx="3" style="fill:#3A3634"/><rect x="96" y="217" width="28" height="19" rx="2" style="fill:#2A201C"/>`,
    fire(110, 234, .7) + `<path d="M92 242 v4 M128 242 v4" stroke="#3A3634" stroke-width="3"/><circle cx="110" cy="214" r="1.6" fill="${S.metal}"/>`);
  if (t === 2) return D(`<rect x="60" y="244" width="100" height="10" rx="2" style="fill:#B8AE9E"/><rect x="66" y="197" width="88" height="49" style="fill:#CFC4B2"/><path d="M84 246 V222 q26 -16 52 0 V246z" style="fill:#2E2622"/>`,
    [0, 1, 2].map(r => `<path d="M66 ${208 + r*13} h18 M136 ${208 + r*13} h18" stroke="#A89C88" stroke-width="1"/><path d="M${74 + (r % 2)*6} ${197 + r*13} v13 M${144 - (r % 2)*6} ${197 + r*13} v13" stroke="#A89C88" stroke-width="1"/>`).join("") + `<path d="M92 204 h36" stroke="#A89C88" stroke-width="1"/>` + fire(110, 244, 1));
  return D(`<rect x="62" y="194" width="96" height="56" style="fill:${S.wood}"/><rect x="78" y="202" width="64" height="48" style="fill:${lt(S.accent, .35)}"/><path d="M88 250 V224 q22 -16 44 0 V250z" style="fill:#2E2622"/><rect x="54" y="187" width="112" height="9" rx="2" style="fill:${dk(S.wood, .15)}"/><rect x="58" y="252" width="104" height="5" rx="2" style="fill:${S.metal}"/><path d="M160 252 l4 -20 h22 l4 20z" style="fill:#C9A26A"/>`,
    `${[0, 1, 2, 3].map(k => `<path d="M${66 + k*3} 198 v50 M${146 + k*3} 198 v50" stroke="${dk(S.wood, .3)}" stroke-width=".7"/>`).join("")}${[0, 1, 2, 3, 4, 5].map(k => `<rect x="${79 + (k % 2)*54}" y="${203 + Math.floor(k/2)*15}" width="8" height="12" fill="${S.accent}" opacity=".7"/>`).join("")}`
    + `<path d="M60 196 q4 6 10 6 M160 196 q-4 6 -10 6" stroke="${dk(S.wood, .3)}" stroke-width="2" fill="none"/>` + fire(110, 248, 1.2)
    + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => `<ellipse cx="${60 + k*13}" cy="${187 + (k % 2)}" rx="6" ry="3" fill="${k % 3 ? "#6E9A5A" : "#88AE6A"}"/>`).join("") + `<circle cx="84" cy="186" r="2" fill="#C8483A"/><circle cx="132" cy="187" r="2" fill="#C8483A"/>`
    + [0, 1, 2].map(k => `<ellipse cx="${170 + k*7}" cy="${232}" rx="4" ry="3" fill="#8A6A52" stroke="${INK}" stroke-width=".5"/>`).join(""));
}
function chimney(){   // the chimney breast and its oak beam: part of the cottage, there before any fireplace
  return g(`<rect x="62" y="16" width="96" height="172" style="fill:${mix(S.wall, S.wall2, .55)}"/><path d="M62 128 h96" stroke="${dk(S.wall2, .2)}" stroke-width="1"/>` + sk("", `<path d="M62 16 V188 M158 16 V188"/>`) + D(`<rect x="58" y="188" width="104" height="9" rx="1" style="fill:${dk(S.wood, .25)}"/>`, `<path d="M64 192 q20 -2 40 0 q20 2 50 -1" fill="none" stroke="${dk(S.wood, .45)}" stroke-width=".7"/>`));
}
function bookshelf(t){
  if (t === 1) return D(`${[[206, 196], [206, 222], [206, 246]].map(([x, y]) => `<rect x="${x - 4}" y="${y}" width="96" height="5" rx="1" style="fill:${lt(S.wood, .15)}"/>`).join("")}${[210, 280].map(x => `<rect x="${x}" y="201" width="12" height="21" style="fill:#B8583C"/><rect x="${x}" y="227" width="12" height="19" style="fill:#B8583C"/>`).join("")}`,
    books(224, 278, 222, 3, 19) + books(224, 278, 246, 7, 18) + [210, 280].map(x => `<path d="M${x} 211 h12 M${x} 236 h12" stroke="#8E3E2A" stroke-width=".8"/>`).join(""));
  const lower = (x0, x1) => `<rect x="${x0}" y="196" width="${x1 - x0}" height="56" style="fill:${S.wood}"/><rect x="${x0 + 5}" y="201" width="${x1 - x0 - 10}" height="46" style="fill:${dk(S.wood, .35)}"/><rect x="${x0 - 2}" y="194" width="${x1 - x0 + 4}" height="5" rx="1" style="fill:${dk(S.wood, .1)}"/>`;
  if (t === 2) return D(lower(204, 296), `<path d="M209 224 h82" stroke="${S.wood}" stroke-width="3"/>` + books(210, 290, 222, 5) + books(210, 290, 247, 11));
  // the library wall: shelves either side of the window, a bridge over it, and a ladder on a rail
  return D(`<rect x="198" y="18" width="28" height="178" style="fill:${S.wood}"/><rect x="274" y="18" width="28" height="178" style="fill:${S.wood}"/><rect x="198" y="18" width="104" height="18" style="fill:${S.wood}"/>` + lower(198, 302),
    [0, 1, 2, 3].map(k => `<rect x="202" y="${40 + k*38}" width="20" height="34" fill="${dk(S.wood, .35)}"/><rect x="278" y="${40 + k*38}" width="20" height="34" fill="${dk(S.wood, .35)}"/>` + books(203, 222, 74 + k*38, k*5 + 2, 22) + books(279, 298, 74 + k*38, k*7 + 4, 22)).join("")
    + `<path d="M203 222 h94" stroke="${S.wood}" stroke-width="3"/>` + books(204, 296, 222, 9) + books(204, 296, 247, 13) + books(206, 294, 34, 17, 14)
    + `<path d="M196 30 h108" stroke="${S.metal}" stroke-width="2"/><path d="M262 30 L276 252 M282 30 L296 252" stroke="${dk(S.wood, .4)}" stroke-width="3"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<path d="M${263 + k*1.7} ${50 + k*26} h20" stroke="${dk(S.wood, .4)}" stroke-width="2"/>`).join("")}`);
}
function kitchen(t){
  const top = `<rect x="342" y="205" width="120" height="8" rx="1" style="fill:${t === 3 ? dk(S.wood, .1) : lt(S.wood, .25)}"/>`;
  if (t === 1) return D(`<rect x="346" y="213" width="112" height="41" style="fill:${S.wall2}"/>${top}<rect x="354" y="199" width="40" height="7" rx="1" style="fill:#3A3634"/><path d="M410 205 h36 l-3 7 h-30z" style="fill:#C3C8CC"/><rect x="346" y="134" width="30" height="4" style="fill:${S.wood}"/>`,
    `<path d="M348 214 q14 4 26 0 q14 4 26 0 v38 h-52z" fill="${S.fabric}" opacity=".85"/>${[0, 1, 2, 3].map(k => `<path d="M${352 + k*12} 214 v38" stroke="${lt(S.fabric, .5)}" stroke-width="2"/>`).join("")}<ellipse cx="366" cy="200" rx="7" ry="2" fill="none" stroke="#8A8E92" stroke-width="1.2"/><ellipse cx="383" cy="200" rx="7" ry="2" fill="none" stroke="#8A8E92" stroke-width="1.2"/><path d="M428 205 v-12 q0 -4 6 -4" fill="none" stroke="#8A9096" stroke-width="2"/><path d="M360 194 q0 -10 9 -10 q9 0 9 10z" fill="${S.accent}" stroke="${INK}" stroke-width=".7"/><path d="M378 190 l6 -3" stroke="${INK}" stroke-width="1"/><rect x="350" y="122" width="8" height="12" rx="2" fill="#E8D9B8" stroke="${INK}" stroke-width=".6"/><rect x="362" y="124" width="8" height="10" rx="2" fill="${S.fabric}" stroke="${INK}" stroke-width=".6"/>`);
  const cup = t === 3 ? mix(S.accent, "#FFFFFF", .35) : mix(S.accent, "#FFFFFF", .5);
  const range = (x, w) => `<rect x="${x}" y="196" width="${w}" height="58" rx="3" style="fill:${S.accent}"/><rect x="${x - 2}" y="193" width="${w + 4}" height="6" rx="1" style="fill:${dk(S.accent, .2)}"/><rect x="${x + 4}" y="214" width="${w/2 - 6}" height="34" rx="2" style="fill:${dk(S.accent, .12)}"/><rect x="${x + w/2 + 2}" y="214" width="${w/2 - 6}" height="34" rx="2" style="fill:${dk(S.accent, .12)}"/>`;
  const rangeDet = (x, w) => `<path d="M${x + 3} 210 h${w - 6}" stroke="#C3C8CC" stroke-width="2"/>${[0, 1, 2, 3].map(k => `<circle cx="${x + 8 + k*(w - 16)/3}" cy="203" r="1.8" fill="#C3C8CC"/>`).join("")}<path d="M${x + 8} 220 h${w/2 - 16} M${x + w/2 + 6} 220 h${w/2 - 16}" stroke="#C3C8CC" stroke-width="1.6"/>`;
  const doors = (x0, x1) => Array.from({length: Math.floor((x1 - x0)/24)}, (_, k) => `<rect x="${x0 + 3 + k*24}" y="217" width="20" height="33" rx="1.5" fill="none" stroke="${dk(cup, .2)}" stroke-width="1"/><circle cx="${x0 + 19 + k*24}" cy="226" r="1.6" fill="${S.metal}"/>`).join("");
  if (t === 2) return D(`<rect x="346" y="213" width="112" height="41" style="fill:${cup}"/>${top}${range(346, 48)}<path d="M410 204 h36 v12 h-36z" style="fill:${CREAM}"/><rect x="430" y="58" width="30" height="70" rx="1" style="fill:${S.wood}"/><rect x="344" y="132" width="26" height="4" style="fill:${S.wood}"/>`,
    rangeDet(346, 48) + doors(398, 458) + `<path d="M428 205 v-12 q0 -4 6 -4" fill="none" stroke="${S.metal}" stroke-width="2"/>` + [0, 1, 2].map(r => `<path d="M432 ${80 + r*22} h26" stroke="${dk(S.wood, .3)}" stroke-width="2"/>${[0, 1, 2].map(k => `<circle cx="${437 + k*8}" cy="${72 + r*22}" r="5" fill="${CREAM}" stroke="${S.accent}" stroke-width="1.2"/>`).join("")}`).join("")
      + `<rect x="348" y="120" width="8" height="12" rx="2" fill="#E8D9B8" stroke="${INK}" stroke-width=".6"/><rect x="359" y="122" width="8" height="10" rx="2" fill="${S.fabric}" stroke="${INK}" stroke-width=".6"/>`);
  // the farmhouse kitchen: tiled splashback, a big range under its mantle, a butler sink, copper pans, herbs on the sill
  return D(`<rect x="342" y="150" width="120" height="55" style="fill:${CREAM}"/><rect x="346" y="213" width="112" height="41" style="fill:${cup}"/>${top}<rect x="342" y="118" width="58" height="32" style="fill:${S.wall2}"/><rect x="338" y="114" width="66" height="6" rx="1" style="fill:${dk(S.wood, .1)}"/>${range(346, 54)}<rect x="412" y="203" width="40" height="16" rx="1" style="fill:${CREAM}"/><rect x="430" y="40" width="32" height="4" style="fill:${S.metal}"/>`,
    Array.from({length: 30}, (_, k) => `<rect x="${342 + (k % 10)*12}" y="${152 + Math.floor(k/10)*17}" width="11" height="16" fill="${k % 3 === 1 ? lt(S.accent, .3) : CREAM}" stroke="${mix(S.accent, "#FFFFFF", .5)}" stroke-width=".6"/>`).join("")
    + rangeDet(346, 54) + doors(404, 458) + `<path d="M424 205 v-14 q0 -4 6 -4" fill="none" stroke="${S.metal}" stroke-width="2.2"/>`
    + [436, 452].map((x, k) => `<path d="M${x} 44 v6" stroke="${INK}" stroke-width="1"/><circle cx="${x}" cy="${58 + k*2}" r="${7 - k}" fill="#C9824A" stroke="${INK}" stroke-width=".7"/><path d="M${x} ${51} v-2" stroke="#8A4A2A" stroke-width="2"/>`).join("")
    + [380, 396, 412].map((x, k) => `<path d="M${x - 5} 122 h10 l-2 6 h-6z" fill="#C8643B" stroke="${INK}" stroke-width=".5"/>${[0, 1, 2].map(j => `<ellipse cx="${x - 3 + j*3}" cy="${116 - (j % 2)*3}" rx="2.4" ry="4" fill="${k === 1 ? "#88AE6A" : "#6E9A5A"}"/>`).join("")}`).join("")
    + `<rect x="352" y="128" width="8" height="12" rx="2" fill="#E8D9B8" stroke="${INK}" stroke-width=".6"/>`);
}
function fridge(){
  const col = mix(S.accent, "#FFFFFF", .72), body = `<path d="M468 262 V160 q0 -12 12 -12 h22 q12 0 12 12 V262z" style="fill:${col}"/>`;
  const note = ST.fridge ? `<g transform="rotate(-6 490 204)"><rect x="476" y="194" width="30" height="20" rx="1" fill="#F4C7CF" stroke="${INK}" stroke-width=".6"/>${txt(491, 206, "Welcome!", 6.4, INK, 700)}<path d="M480 210 q11 3 22 0" stroke="#C2505F" stroke-width=".7" fill="none"/><circle cx="491" cy="194" r="2.4" fill="${S.accent}"/></g>` : "";
  return otherSpot("fridge", ST.fridge ? "The fridge: welcome treats inside" : "The fridge", hovE(490, 268, 30, 10),
    D(body, `<path d="M468 184 h46" stroke="${dk(col, .3)}" stroke-width="1.2"/><path d="M473 166 v12 M473 192 v22" stroke="#9AA0A6" stroke-width="3" stroke-linecap="round"/><path d="M470 262 v4 M512 262 v4" stroke="${INK}" stroke-width="2"/><circle cx="500" cy="230" r="2.4" fill="#C8553D"/><circle cx="486" cy="240" r="2.4" fill="#7FA06B"/>`) + note
    + lab(490, 280, "Fridge", "#E6EEF2", 8));
}
function dining(t){
  const tops = {1: [362, 438, 410], 2: [344, 456, 404], 3: [330, 470, 400]}[t], [x0, x1, ty] = tops, w = x1 - x0;
  const chair = (x, y, col = S.wood) => `<path d="M${x - 9} ${y} v-30 M${x + 9} ${y} v-30" stroke="${dk(col, .3)}" stroke-width="2.4"/><path d="M${x - 9} ${y - 28} h18 M${x - 9} ${y - 20} h18" stroke="${dk(col, .3)}" stroke-width="2.4"/>`;
  let back = "";
  if (t === 1) back = chair(382, 410, S.metal) + chair(420, 410, S.metal);
  if (t === 2) back = chair(374, 406) + chair(426, 406);
  if (t === 3) back = `<rect x="346" y="384" width="108" height="8" rx="2" fill="${S.wood}" stroke="${INK}" stroke-width="1"/><path d="M352 392 v8 M448 392 v8" stroke="${dk(S.wood, .3)}" stroke-width="3"/>`;
  const legs = t === 1 ? `<path d="M${x0 + 8} 436 L${x0 + 22} 446 M${x0 + 22} 436 L${x0 + 8} 446 M${x1 - 8} 436 L${x1 - 22} 446 M${x1 - 22} 436 L${x1 - 8} 446" stroke="${S.metal}" stroke-width="2.4"/>`
    : `<rect x="${x0 + 4}" y="${ty + 32}" width="7" height="${446 - ty - 32}" style="fill:${dk(S.wood, .2)}"/><rect x="${x1 - 11}" y="${ty + 32}" width="7" height="${446 - ty - 32}" style="fill:${dk(S.wood, .2)}"/>`;
  const ends = t > 1 ? [x0 - 10, x1 + 10].map(x => `<path d="M${x} 446 v-34 M${x} 424 h${x < 400 ? 10 : -10}" stroke="${dk(S.wood, .3)}" stroke-width="2.6"/><rect x="${x - 4}" y="${x < 400 ? 420 : 420}" width="8" height="4" fill="${S.fabric}"/>`).join("") : "";
  const top = `<rect x="${x0}" y="${ty}" width="${w}" height="${t === 1 ? 20 : 26}" rx="2" style="fill:${t === 1 ? lt(S.wood, .3) : S.wood}"/><rect x="${x0}" y="${ty + (t === 1 ? 20 : 26)}" width="${w}" height="6" style="fill:${dk(S.wood, .25)}"/>`;
  const runner = t === 3 ? `<rect x="${x0 + 12}" y="${ty + 9}" width="${w - 24}" height="9" fill="${S.fabric2}" opacity=".9"/><path d="M${x0 + 12} ${ty + 11} h${w - 24} M${x0 + 12} ${ty + 16} h${w - 24}" stroke="${S.accent}" stroke-width=".8"/>${[344, 456].map(x => `<rect x="${x - 2}" y="${ty - 4}" width="4" height="14" fill="${CREAM}" stroke="${INK}" stroke-width=".5"/><rect x="${x - 4}" y="${ty + 9}" width="8" height="3" fill="${S.metal}"/>`).join("")}` : "";
  return back + D(top + (t === 1 ? "" : legs), (t === 1 ? legs : "") + ends + runner + (t > 1 ? `<path d="M${x0 + 10} ${ty + 6} q${w/2} 3 ${w - 20} 0" stroke="${dk(S.wood, .2)}" stroke-width=".7" fill="none"/>` : ""));
}
function fruitBowl(){   // the fruit basket on the dining table (filled when st.basket)
  const t = tier("dining"), x = 368, y = t ? ({1: 420, 2: 418, 3: 414})[t] : 436;
  const fruit = ST.basket ? `<circle cx="${x - 7}" cy="${y - 7}" r="5" fill="#D9433A"/><circle cx="${x + 2}" cy="${y - 9}" r="5" fill="#F2A03A"/><path d="M${x + 9} ${y - 4} q-4 -9 1 -12 q5 3 3 12z" fill="#A8C25A"/><circle cx="${x - 2}" cy="${y - 4}" r="4.4" fill="#7A4A66"/><path d="M${x + 2} ${y - 14} v-3 M${x - 7} ${y - 12} l1 -3" stroke="#5A3A2A" stroke-width="1"/><ellipse cx="${x - 9}" cy="${y - 9}" rx="1.4" ry="1" fill="#FFFFFF" opacity=".6"/>` : "";
  return otherSpot("basket", ST.basket ? "The fruit basket, full" : "The fruit basket, empty", hovE(x, y + 4, 20, 9),
    `<g pointer-events="none">${fruit}${D(`<path d="M${x - 13} ${y - 5} h26 q-2 9 -13 9 q-11 0 -13 -9z" style="fill:#C9A26A"/>`, `<path d="M${x - 11} ${y - 2} h22" stroke="#9A7A4A" stroke-width=".8"/>`)}</g>`);
}
function sofa(t){
  const col = t === 1 ? mix(S.fabric2, "#B8A890", .3) : t === 2 ? S.fabric : dk(S.fabric, .12), d = dk(col, .18);
  const backY = t === 3 ? 296 : 304;
  const main = `<rect x="104" y="${backY}" width="132" height="${342 - backY}" rx="${t === 3 ? 16 : 10}" style="fill:${col}"/><rect x="104" y="350" width="132" height="16" rx="3" style="fill:${d}"/><rect x="112" y="334" width="58" height="20" rx="5" style="fill:${lt(col, .1)}"/><rect x="170" y="334" width="58" height="20" rx="5" style="fill:${lt(col, .1)}"/>`
    + `<rect x="92" y="${t === 3 ? 318 : 324}" width="26" height="${t === 3 ? 48 : 42}" rx="${t === 3 ? 12 : 7}" style="fill:${col}"/><rect x="222" y="${t === 3 ? 318 : 324}" width="26" height="${t === 3 ? 48 : 42}" rx="${t === 3 ? 12 : 7}" style="fill:${col}"/>`;
  let det = t === 3 ? `<path d="M100 372 v-6 M240 372 v-6 M150 372 v-6 M190 372 v-6" stroke="${S.metal}" stroke-width="4" stroke-linecap="round"/>` : `<path d="M110 366 l-2 6 M230 366 l2 6" stroke="${dk(S.wood, .3)}" stroke-width="3"/>`;
  if (t === 1) det += `<rect x="190" y="314" width="16" height="13" fill="${lt(S.accent, .3)}" stroke="${INK}" stroke-width=".6" stroke-dasharray="2 1.4" transform="rotate(6 198 320)"/><path d="M128 344 q12 4 24 0" stroke="${d}" stroke-width="1" fill="none"/>`;
  if (t === 2) det += `<path d="M106 358 h128 M110 310 h120" stroke="${lt(col, .35)}" stroke-width="1.2"/>`;
  if (t === 3) det += [0, 1, 2].map(r => [0, 1, 2, 3, 4, 5].map(k => `<circle cx="${122 + k*20 + (r % 2)*10}" cy="${306 + r*9}" r="1.3" fill="${dk(col, .35)}"/>`).join("")).join("") + `<ellipse cx="140" cy="314" rx="22" ry="4" fill="#FFFFFF" opacity=".18"/><ellipse cx="200" cy="343" rx="16" ry="3" fill="#FFFFFF" opacity=".2"/><circle cx="105" cy="324" r="7" fill="none" stroke="${d}" stroke-width="1.2"/><circle cx="235" cy="324" r="7" fill="none" stroke="${d}" stroke-width="1.2"/><path d="M104 366 h132" stroke="${S.metal}" stroke-width="1.6" stroke-dasharray="2 2"/>`;
  return D(main, det);
}
function armchair(t){
  if (t === 1) { const c = lt(S.wood, .3);
    return D(`<path d="M270 352 q-6 -34 30 -36 q36 2 30 36z" style="fill:${c}"/><rect x="276" y="346" width="48" height="16" rx="6" style="fill:${S.fabric2}"/><path d="M276 362 h48 l-4 12 h-40z" style="fill:${c}"/>`,
      `${[0, 1, 2, 3].map(k => `<path d="M${274 - k} ${336 - k*5} q26 -8 52 0" fill="none" stroke="${dk(c, .25)}" stroke-width=".8"/>`).join("")}<path d="M282 374 l-3 6 M318 374 l3 6" stroke="${dk(c, .3)}" stroke-width="2.4"/>`); }
  const col = t === 2 ? mix(S.accent, S.fabric2, .35) : S.accent, d = dk(col, .2);
  const back = t === 3 ? `<path d="M274 352 V306 q0 -8 10 -8 h32 q10 0 10 8 V352z" style="fill:${col}"/><path d="M272 312 q-10 4 -8 30 l10 4 V312z M328 312 q10 4 8 30 l-10 4 V312z" style="fill:${d}"/>` : `<rect x="276" y="318" width="48" height="36" rx="8" style="fill:${col}"/>`;
  const stool = t === 3 ? `<rect x="284" y="394" width="32" height="14" rx="5" style="fill:${col}"/>` : "";
  return D(back + `<rect x="266" y="338" width="16" height="36" rx="6" style="fill:${col}"/><rect x="318" y="338" width="16" height="36" rx="6" style="fill:${col}"/><rect x="280" y="346" width="40" height="16" rx="4" style="fill:${lt(col, .12)}"/><rect x="280" y="360" width="40" height="14" style="fill:${d}"/>` + stool,
    `<path d="M272 374 v6 M328 374 v6" stroke="${dk(S.wood, .3)}" stroke-width="3"/>` + (t === 3 ? `<path d="M288 408 v4 M312 408 v4" stroke="${dk(S.wood, .3)}" stroke-width="3"/>${[0, 1, 2].map(k => `<circle cx="${290 + k*10}" cy="${312}" r="1.2" fill="${d}"/>`).join("")}` : ""));
}
function coffee(t){
  if (t === 1) return D(`<rect x="192" y="414" width="68" height="8" style="fill:${lt("#C9A26A", .15)}"/><rect x="194" y="422" width="64" height="24" style="fill:#C9A26A"/>`, `${[0, 1, 2].map(k => `<path d="M194 ${428 + k*6} h64" stroke="#9A7A4A" stroke-width="1"/>`).join("")}${txt(226, 440, "APPLES", 6, "#7A5A3A", 700)}`);
  if (t === 2) return D(`<rect x="182" y="414" width="88" height="10" rx="2" style="fill:${lt(S.wood, .1)}"/><rect x="186" y="424" width="80" height="5" style="fill:${dk(S.wood, .2)}"/><rect x="188" y="428" width="6" height="18" style="fill:${dk(S.wood, .2)}"/><rect x="258" y="428" width="6" height="18" style="fill:${dk(S.wood, .2)}"/>`,
    `<path d="M190 418 q30 -2 72 1" fill="none" stroke="${dk(S.wood, .15)}" stroke-width=".7"/>`);
  return D(`<rect x="184" y="434" width="84" height="5" style="fill:${S.metal}"/><rect x="178" y="410" width="96" height="9" rx="2" style="fill:#DDEEF2" opacity=".75"/>`,
    `<path d="M182 419 v27 M270 419 v27" stroke="${S.metal}" stroke-width="3"/><rect x="194" y="426" width="30" height="5" fill="${S.accent}" stroke="${INK}" stroke-width=".5"/><rect x="196" y="421" width="26" height="5" fill="${S.fabric}" stroke="${INK}" stroke-width=".5"/><rect x="236" y="427" width="24" height="7" fill="${dk(S.wood, .2)}" stroke="${INK}" stroke-width=".5"/>`
      + `<rect x="194" y="404" width="22" height="5" fill="${S.fabric2}" stroke="${INK}" stroke-width=".5"/><path d="M252 410 l-3 -8 h10 l-3 8z" fill="#C8643B"/><ellipse cx="251" cy="399" rx="4" ry="5" fill="#6E9A5A"/><ellipse cx="257" cy="400" rx="3" ry="4" fill="#88AE6A"/><path d="M182 412 h90" stroke="#FFFFFF" stroke-width="1" opacity=".8"/>`);
}
function rug(t){
  if (t === 1) return D(`<ellipse cx="226" cy="430" rx="92" ry="40" style="fill:${S.fabric2}"/>`, [S.fabric, S.accent, S.wall2, S.fabric, lt(S.accent, .3)].map((c, k) => `<ellipse cx="226" cy="430" rx="${84 - k*15}" ry="${35 - k*6.5}" fill="none" stroke="${c}" stroke-width="5" stroke-dasharray="${9 + k} 3"/>`).join(""));
  if (t === 2) return D(`<rect x="138" y="390" width="176" height="80" rx="4" style="fill:${S.fabric2}"/>`, `<rect x="146" y="397" width="160" height="66" rx="2" fill="none" stroke="${S.accent}" stroke-width="3"/><rect x="154" y="404" width="144" height="52" fill="none" stroke="${S.fabric}" stroke-width="1.4"/>`);
  const c = mix(S.fabric, "#8E3A3A", .35);
  return D(`<rect x="118" y="382" width="216" height="92" rx="3" style="fill:${c}"/>`,
    `<rect x="126" y="389" width="200" height="78" fill="none" stroke="${S.fabric2}" stroke-width="5"/>${Array.from({length: 18}, (_, k) => `<path d="M${132 + k*11} 389 l3 -3 l3 3" fill="none" stroke="${S.accent}" stroke-width="1.2"/>`).join("")}<path d="M226 400 l40 28 l-40 28 l-40 -28z" fill="${S.fabric2}" opacity=".9"/><path d="M226 410 l26 18 l-26 18 l-26 -18z" fill="${S.accent}"/><circle cx="226" cy="428" r="5" fill="${S.metal}"/>${[150, 302].map(x => `<path d="M${x - 10} 418 l10 10 l-10 10 l-10 -10z" fill="${S.accent}" opacity=".8"/>`).join("")}`
      + Array.from({length: 12}, (_, k) => `<path d="M118 ${386 + k*7.4} h-6 M334 ${386 + k*7.4} h6" stroke="${lt(S.fabric2, .2)}" stroke-width="1.4"/>`).join(""));
}
function lamp(t){
  if (t === 1) { glow(56, 290, 54); return D(`<ellipse cx="56" cy="372" rx="12" ry="4" style="fill:${S.wood}"/><circle cx="56" cy="290" r="18" style="fill:${NIGHT ? "#FFF3D0" : CREAM}"/>`, `<path d="M56 368 V308" stroke="${S.wood}" stroke-width="2.4"/>${[-10, 0, 10].map(d => `<path d="M${56 + d*.9} 273 q${d*.6} 17 0 34" fill="none" stroke="#D8CCB8" stroke-width=".8"/>`).join("")}`); }
  if (t === 2) { glow(56, 300, 50); return D(`<ellipse cx="56" cy="372" rx="12" ry="4" style="fill:${S.metal}"/><path d="M42 274 h28 l6 26 h-40z" style="fill:${NIGHT ? lt(S.fabric2, .5) : S.fabric2}"/>`, `<path d="M56 368 V300" stroke="${S.metal}" stroke-width="3"/><path d="M38 296 h40" stroke="${dk(S.fabric2, .2)}" stroke-width="1"/>`); }
  glow(130, 280, 60);
  return D(`<rect x="44" y="360" width="24" height="12" rx="2" style="fill:#E8E4DC"/><path d="M112 276 q18 -16 36 0z" style="fill:${S.metal}"/>`, `<path d="M56 360 Q56 210 130 262" fill="none" stroke="${S.metal}" stroke-width="3"/><ellipse cx="130" cy="277" rx="10" ry="2.4" fill="${NIGHT ? "#FFE8A8" : "#F2E6C8"}"/>`);
}
function gardenDoor(){   // the back door to the garden, in the left wall
  const col = ST.c === "bluebell" ? BLUE : "#7E9A68";
  return otherSpot("garden", "The back door to the garden", hovE(34, 486, 30, 14),
    D(`<path d="M0 372 L24 384 V490 L0 504z" style="fill:${col}"/><path d="M4 384 L20 392 V430 L4 426z" style="fill:${NIGHT ? "#26325E" : "#CFE6F2"}"/><rect x="2" y="496" width="38" height="10" rx="3" style="fill:#B9875E"/>`, `<path d="M12 388 V428" stroke="${CREAM}" stroke-width="1.4"/><circle cx="20" cy="448" r="2" fill="${S.metal}"/>`)
    + lab(34, 526, "Garden", "#D8EBC8", 9));
}
function sideWall(){ return g(`<path d="M0 200 H16 V640 H0z" style="fill:${S.wall2}"/><path d="M0 214 H16" stroke="${dk(S.wall2, .3)}"/>` + sk("", `<path d="M16 200 V640"/>`)); }
function calendar(){
  return otherSpot("calendar", "The bookings calendar", hovE(320, 94, 26, 34),
    g(D(`<rect x="304" y="66" width="32" height="46" rx="1" style="fill:${CREAM}"/><rect x="304" y="66" width="32" height="10" style="fill:${S.accent}"/>`,
      `<path d="M320 60 v6" stroke="${INK}" stroke-width="1"/><circle cx="320" cy="60" r="1.6" fill="${INK}"/>${Array.from({length: 20}, (_, k) => `<rect x="${307 + (k % 5)*5.4}" y="${80 + Math.floor(k/5)*7.4}" width="4.4" height="6" fill="${[3, 4, 5, 11, 12, 17].includes(k) ? S.fabric : "#EFE8DA"}" stroke="#C9C0B0" stroke-width=".3"/>`).join("")}`))
    + lab(320, 128, "Bookings", "#F4D3C8", 8));
}
function consoleArt(){
  return g(D(`<rect x="62" y="518" width="124" height="8" rx="1" style="fill:${S.wood}"/><rect x="66" y="526" width="116" height="10" style="fill:${dk(S.wood, .12)}"/><rect x="68" y="536" width="6" height="18" style="fill:${dk(S.wood, .25)}"/><rect x="174" y="536" width="6" height="18" style="fill:${dk(S.wood, .25)}"/>`,
    `<circle cx="124" cy="531" r="1.6" fill="${S.metal}"/><ellipse cx="124" cy="517" rx="8" ry="2.4" fill="${S.fabric2}" stroke="${INK}" stroke-width=".5"/><path d="M120 516 l5 -2 l2 2" stroke="${S.metal}" stroke-width="1.2" fill="none"/><path d="M174 518 l-3 -10 h12 l-3 10z" fill="#C8643B"/><path d="M177 508 q-6 -10 -2 -16 M177 508 q4 -12 8 -14 M177 508 v-14" stroke="#6E9A5A" stroke-width="2" fill="none"/>`));
}
function guestbook(){
  return otherSpot("guestbook", "The guest book", hovE(96, 560, 30, 12),
    g(D(`<path d="M78 518 l2 -10 q8 -3 16 1 q8 -4 16 -1 l2 10 q-9 -3 -18 1 q-9 -4 -18 -1z" style="fill:${CREAM}"/>`, `<path d="M96 509 v10" stroke="${INK}" stroke-width=".6"/>${[0, 1, 2].map(k => `<path d="M${83} ${511 + k*2.4} q5 -1 10 0 M${99} ${511 + k*2.4} q5 -1 10 0" stroke="#9A8E80" stroke-width=".5" fill="none"/>`).join("")}<path d="M104 520 l10 -8" stroke="${S.accent}" stroke-width="1.6"/>`))
    + lab(92, 578, "Guest book", "#F4D3C8", 9));
}
function catalogue(){
  return otherSpot("catalogue", "The furniture catalogue", hovE(150, 560, 26, 12),
    g(D(`<rect x="136" y="500" width="30" height="18" rx="1" style="fill:#E8574A"/><path d="M136 518 h30 v-3 h-30z" style="fill:${CREAM}"/>`, `<path d="M136 506 h30" stroke="${CREAM}" stroke-width="2"/><path d="M137 516.5 h28" stroke="#C9C0B0" stroke-width=".5"/><circle cx="151" cy="511" r="2.4" fill="#F6E3A1"/>`))
    + lab(164, 600, "Catalogue", "#F3E1A0", 9));
}
function broom(){
  return otherSpot("tidy", "The broom cupboard", hovE(306, 518, 32, 11),
    g(D(`<path d="M300 520 h28 l-3 -16 h-22z" style="fill:#C9A26A"/><path d="M302 522 l2 -14 h18 l4 14z" style="fill:#D9B866"/><path d="M276 522 h18 l3 -10 h-18z" style="fill:${S.accent}"/>`,
      `<path d="M314 508 L322 446" stroke="#8A6A52" stroke-width="3" stroke-linecap="round"/><path d="M304 512 h20" stroke="${S.fabric}" stroke-width="2"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${306 + k*4} 512 v9" stroke="#A88A3A" stroke-width=".7"/>`).join("")}<path d="M294 514 l10 -6" stroke="${dk(S.accent, .3)}" stroke-width="2.4" stroke-linecap="round"/>`))
    + lab(306, 538, "Broom cupboard", "#E6DDF2", 8));
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
    + lab(X + 30, 628, "Upstairs", "#F3E1A0", 9));
}
const exitMat = () => `<g data-exit="1" aria-label="Out of the front door to the lane"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${ST.c === "bluebell" ? BLUE : "#C9A27E"}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none"${ST.c === "bluebell" ? ` style="fill:#FFFDF6"` : ""}>Exit</text></g>`;

// the one-off touches downstairs
function accDown(){
  let s = "";
  if (has("prints")) s += g(D(`<rect x="158" y="70" width="20" height="26" style="fill:${dk(S.wood, .2)}"/><rect x="182" y="80" width="18" height="24" style="fill:${S.metal}"/><rect x="162" y="100" width="16" height="14" style="fill:${dk(S.wood, .2)}"/>`,
    `<rect x="161" y="73" width="14" height="20" fill="#CFE6F2"/><path d="M161 88 q7 -6 14 -2 v7 h-14z" fill="#7FA86A"/><rect x="185" y="83" width="12" height="18" fill="${CREAM}"/><circle cx="191" cy="90" r="3.4" fill="${S.fabric}"/><path d="M191 93 v6" stroke="#6E9A5A" stroke-width="1"/><rect x="165" y="103" width="10" height="8" fill="${S.fabric2}"/><path d="M168 70 l0 -4 M191 80 l0 -4" stroke="${INK}" stroke-width=".7"/>`));
  if (has("candles")) { glow(110, 176, 34); s += g(D(`<rect x="94" y="176" width="8" height="13" rx="1" style="fill:${CREAM}"/><rect x="106" y="170" width="9" height="19" rx="1" style="fill:${CREAM}"/><rect x="119" y="180" width="8" height="9" rx="1" style="fill:${CREAM}"/>`, flame(98, 175, .5) + flame(110.5, 169, .55) + flame(123, 179, .45))); }
  if (has("records")) s += g(D(`<rect x="230" y="184" width="30" height="12" rx="1" style="fill:${S.wood}"/><rect x="263" y="178" width="20" height="18" style="fill:#C9A26A"/>`,
    `<ellipse cx="243" cy="184" rx="10" ry="2.6" fill="#2A2420"/><circle cx="243" cy="184" r="1.4" fill="${S.fabric}"/><path d="M256 182 l-6 2" stroke="${S.metal}" stroke-width="1.2"/>${[0, 1, 2, 3].map(k => `<rect x="${265 + k*4}" y="${170 + (k % 2)*2}" width="4" height="10" fill="${[S.accent, S.fabric, "#2A2420", S.fabric2][k]}" stroke="${INK}" stroke-width=".4"/>`).join("")}`));
  if (has("diffuser")) s += g(D(`<ellipse cx="330" cy="215" rx="11" ry="3.4" style="fill:${lt(S.wood, .1)}"/><rect x="326" y="203" width="8" height="11" rx="2" style="fill:#C9B3E3"/>`,
    `<path d="M324 218 l-3 18 M336 218 l3 18 M330 219 v17" stroke="${dk(S.wood, .2)}" stroke-width="1.8"/><path d="M329 203 l-5 -14 M330 203 l1 -15 M331 203 l6 -13" stroke="#5A3A2A" stroke-width=".8"/><path d="M322 186 q2 -6 6 -4 M336 184 q4 -6 6 -2" stroke="#C9B3E3" stroke-width="1" fill="none" opacity=".8"/>`));
  if (has("flowers")) { const y = tier("dining") ? 412 : 444; s += g(D(`<path d="M394 ${y} q-4 -10 2 -16 h8 q6 6 2 16z" style="fill:${CREAM}"/>`,
    `<path d="M397 ${y - 15} l1 -3 h4 l1 3" stroke="${S.accent}" stroke-width="1" fill="none"/>${[[-8, -26, S.fabric], [0, -30, "#F6E3A1"], [8, -26, S.fabric], [-4, -22, "#FFFFFF"], [5, -21, "#C9B3E3"]].map(([dx, dy, c]) => `<path d="M400 ${y - 16} L${400 + dx} ${y + dy}" stroke="#6E9A5A" stroke-width="1"/><circle cx="${400 + dx}" cy="${y + dy}" r="3.4" fill="${c}" stroke="${INK}" stroke-width=".4"/>`).join("")}`)); }
  if (has("cushions")) s += g(D(`<path d="M120 324 q14 -6 28 0 q2 12 -2 22 q-12 4 -24 0 q-4 -10 -2 -22z" style="fill:${S.accent}"/><path d="M196 324 q14 -6 28 0 q2 12 -2 22 q-12 4 -24 0 q-4 -10 -2 -22z" style="fill:${S.fabric2}"/><path d="M214 306 q20 -4 30 6 v40 q-8 6 -14 2 q2 -24 -16 -30z" style="fill:${lt(S.fabric, .25)}"/>`,
    `<circle cx="134" cy="334" r="4" fill="none" stroke="${lt(S.accent, .4)}" stroke-width="1.2"/><path d="M200 330 h20 M200 336 h20" stroke="${S.accent}" stroke-width="1"/>${[0, 1, 2].map(k => `<path d="M${226 + k*5} 314 q2 20 0 38" stroke="${S.accent}" stroke-width=".9" fill="none"/>`).join("")}`));
  return s;
}
// guests in, or the changeover still to do
function livedDown(){
  let s = "";
  if (ST.occupied) {
    s += g(D(`<rect x="20" y="572" width="34" height="34" rx="4" style="fill:#C8553D"/>`, `<path d="M30 572 v-6 h14 v6" fill="none" stroke="${INK}" stroke-width="1.6"/><path d="M20 584 h34" stroke="${dk("#C8553D", .25)}" stroke-width="1"/><circle cx="31" cy="596" r="4" fill="#F6E3A1"/><rect x="40" y="590" width="9" height="6" fill="#7FB0CF" transform="rotate(10 44 593)"/><circle cx="25" cy="608" r="2" fill="${INK}"/><circle cx="49" cy="608" r="2" fill="${INK}"/>`));
    const [bx, by] = tier("coffee") ? [244, 408] : tier("sofa") ? [196, 342] : [226, 438];
    s += g(`<g transform="rotate(-8 ${bx} ${by})">${D(`<path d="M${bx - 14} ${by} l1 -8 q6 -2 13 1 q7 -3 13 -1 l1 8 q-7 -2 -14 1 q-7 -3 -14 -1z" style="fill:${CREAM}"/>`, `<path d="M${bx} ${by - 7} v8" stroke="${S.accent}" stroke-width="1.6"/>`)}</g>`);
  }
  if (undone("tidy")) {
    const mug = (x, y, c) => `<rect x="${x - 4}" y="${y - 8}" width="8" height="8" rx="1.5" fill="${c}" stroke="${INK}" stroke-width=".6"/><path d="M${x + 4} ${y - 6} q4 1 0 4" fill="none" stroke="${INK}" stroke-width=".7"/><ellipse cx="${x}" cy="${y - 8}" rx="4" ry="1.2" fill="#8A5A3A"/>`;
    const plate = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="3" fill="${CREAM}" stroke="${INK}" stroke-width=".6"/><circle cx="${x - 2}" cy="${y - .5}" r=".9" fill="#C9A26A"/><circle cx="${x + 3}" cy="${y}" r=".8" fill="#C9A26A"/>`;
    if (tier("coffee")) s += g(mug(204, 416, S.fabric2) + mug(258, 418, CREAM) + plate(228, 418));
    if (tier("dining")) s += g(plate(400, 424) + plate(436, 420) + mug(420, 414, S.accent));
    s += g(Array.from({length: 9}, (_, k) => `<circle cx="${f1(204 + R(k)*50)}" cy="${f1(454 + R(k + 9)*16)}" r="1" fill="#B8956A"/>`).join(""));
    s += g(D(`<path d="M108 404 q14 -8 28 -2 q4 12 -2 22 q-14 4 -26 -2 q-4 -10 0 -18z" style="fill:${S.fabric}"/>`, `<path d="M116 410 q8 4 14 0" stroke="${lt(S.fabric, .4)}" stroke-width="1" fill="none"/>`));
    s += g(D(`<path d="M474 524 q-6 -24 4 -34 q10 4 20 0 q8 12 2 34z" style="fill:${S.fabric2}"/>`, `<path d="M478 494 q10 4 20 0" stroke="${INK}" stroke-width="1" fill="none"/><path d="M480 492 q-6 -8 2 -10 q4 6 8 2 q6 -6 8 2" fill="${CREAM}" stroke="${INK}" stroke-width=".6"/>`));
  }
  return s;
}
function downArt(){
  return floorArt() + wallArt() + windowArt(226, 46, 48, 80, {curtains: tier("bookshelf") !== 3, seed: 1}) + windowArt(374, 44, 52, 72, {curtains: false, seed: 2}) + sideWall()
    + chimney() + pieceSpot("rug", rug) + pieceSpot("fireplace", fireplace) + pieceSpot("bookshelf", bookshelf) + calendar() + pieceSpot("kitchen", kitchen) + fridge()
    + gardenDoor() + pieceSpot("lamp", lamp) + pieceSpot("sofa", sofa) + pieceSpot("armchair", armchair) + pieceSpot("coffee", coffee) + pieceSpot("dining", dining)
    + accDown() + fruitBowl() + consoleArt() + guestbook() + catalogue() + broom() + livedDown() + stairsUp() + crates() + exitMat();
}

/* ====================================================================================================== */
/* ---------- upstairs ---------- */
function bathroomShell(){   // tiles on the bathroom floor and wall, and the half wall that screens it from the bed
  let s = "";
  for (let r = 0; r < 6; r++) for (let k = 0; k < 6; k++) s += `<rect x="${k*24}" y="${200 + r*24}" width="24" height="24" style="fill:${(r + k) % 2 ? CREAM : lt(S.wall2, .1)};stroke:${dk(S.wall2, .15)}" stroke-width=".8"/>`;
  for (let r = 0; r < 4; r++) for (let k = 0; k < 12; k++) s += `<rect x="${k*12 + (r % 2)*6 - 6}" y="${134 + r*13}" width="12" height="13" style="fill:${k % 5 === 2 ? lt(S.accent, .55) : CREAM};stroke:${dk(S.wall2, .1)}" stroke-width=".6"/>`;
  return g(s);
}
const halfWall = () => g(D(`<path d="M140 166 h12 v140 h-12z" style="fill:${lt(S.wall2, .25)}"/><path d="M152 166 l4 3 v171 l-4 -2z" style="fill:${dk(S.wall2, .15)}"/><rect x="140" y="306" width="12" height="34" style="fill:${S.wall2}"/>`, `<path d="M140 338 h12" stroke="${INK}"/>`));
function bath(t){
  if (t === 1) return D(`<rect x="50" y="262" width="84" height="32" rx="2" style="fill:${CREAM}"/><rect x="50" y="292" width="84" height="8" style="fill:${lt(S.wall2, .05)}"/><path d="M56 164 q36 -10 76 0 l-2 4 q-6 60 4 120 h-18 q-10 -60 -4 -120z" style="fill:${S.fabric2}"/>`,
    `<path d="M60 268 h64" stroke="#C9D4DA" stroke-width="1"/><circle cx="92" cy="278" r="3" fill="#9AA0A6"/><path d="M92 136 v22 q0 4 -4 6" stroke="${S.metal}" stroke-width="2" fill="none"/><ellipse cx="86" cy="166" rx="6" ry="2.4" fill="${S.metal}"/>${[0, 1, 2].map(k => `<path d="M${118 + k*4} 170 q-4 60 4 118" stroke="${dk(S.fabric2, .15)}" stroke-width="1" fill="none"/>`).join("")}<path d="M54 162 h80" stroke="${S.metal}" stroke-width="2"/>`);
  const copper = t === 3, body = copper ? "#C9824A" : CREAM;
  if (copper) glow(140, 236, 26);
  return (copper ? D(`<rect x="134" y="246" width="20" height="5" style="fill:${S.wood}"/>`, `<path d="M137 251 v14 M151 251 v14" stroke="${dk(S.wood, .3)}" stroke-width="2"/><rect x="138" y="238" width="6" height="8" fill="${CREAM}"/>${flame(141, 238, .4)}<path d="M146 246 l3 -8 h4 l2 8z" fill="#6E9A5A"/>`) : "")
    + D(`<path d="M40 256 h104 q2 30 -18 38 h-68 q-20 -8 -18 -38z" style="fill:${body}"/><ellipse cx="92" cy="256" rx="52" ry="8" style="fill:${copper ? "#E6A86A" : CREAM}"/><ellipse cx="92" cy="257" rx="46" ry="5.4" style="fill:#BFE0EA"/>`,
      `<path d="M56 292 l-4 8 h6 M128 292 l4 8 h-6" stroke="${copper ? INK : S.metal}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M88 250 v-8 h8 v8 M92 242 v-4" stroke="${S.metal}" stroke-width="2" fill="none"/>`
      + (copper ? `<path d="M50 264 q4 20 18 28" stroke="#F2C08A" stroke-width="3" fill="none" opacity=".8"/><rect x="72" y="250" width="40" height="5" rx="1" fill="${S.wood}" stroke="${INK}" stroke-width=".6"/><rect x="78" y="246" width="10" height="4" fill="${S.fabric}"/>` : `<path d="M52 266 q6 18 16 24" stroke="#FFFFFF" stroke-width="2" fill="none"/>`));
}
function bed(t){
  const rump = undone("beds"), duv = t === 1 ? S.fabric2 : t === 2 ? S.fabric : lt(S.fabric, .15), quilt = has("linen");
  let head;
  if (t === 1) head = `<path d="M204 216 V160 q66 -22 132 0 V216" fill="none" stroke="${S.metal}" stroke-width="4"/>${[0, 1, 2, 3, 4, 5].map(k => `<path d="M${222 + k*19} ${156 - (k > 0 && k < 5 ? 6 : 0)} V212" stroke="${S.metal}" stroke-width="2"/>`).join("")}`;
  else if (t === 2) head = `<path d="M202 216 V160 q0 -14 14 -14 h108 q14 0 14 14 V216z" style="fill:${S.wood}"/>`;
  else head = `<path d="M200 216 V150 q70 -30 140 0 V216z" style="fill:${S.fabric}"/>`;
  const posts = t === 3 ? `<rect x="196" y="70" width="8" height="262" style="fill:${dk(S.wood, .1)}"/><rect x="336" y="70" width="8" height="262" style="fill:${dk(S.wood, .1)}"/><rect x="192" y="64" width="156" height="12" rx="2" style="fill:${S.wood}"/>` : "";
  const drapes = t === 3 ? `<path d="M196 76 q-14 60 -4 120 q8 4 14 0 q-4 -60 2 -120z" fill="${S.fabric2}" stroke="${INK}" stroke-width=".8"/><path d="M344 76 q14 60 4 120 q-8 4 -14 0 q4 -60 -2 -120z" fill="${S.fabric2}" stroke="${INK}" stroke-width=".8"/><path d="M204 76 q66 18 132 0" fill="none" stroke="${S.fabric2}" stroke-width="6"/>` : "";
  const frame = `<rect x="204" y="206" width="132" height="110" rx="4" style="fill:${CREAM}"/><rect x="200" y="312" width="140" height="14" rx="2" style="fill:${t === 1 ? S.metal : S.wood}"/>`;
  let pillows, cover;
  if (rump) {
    pillows = `<path d="M214 214 q22 -8 46 2 q2 12 -4 18 q-22 4 -42 -4z" style="fill:${CREAM}" transform="rotate(-12 236 222)"/><path d="M286 220 q22 -6 42 4 q0 12 -6 16 q-20 2 -38 -4z" style="fill:${CREAM}" transform="rotate(16 306 228)"/>`;
    cover = `<path d="M204 270 q20 -12 36 -2 q16 -14 34 -2 q18 -12 34 0 q14 -6 28 4 V316 H204z" style="fill:${quilt ? S.fabric2 : duv}"/>`;
  } else {
    pillows = `<rect x="214" y="212" width="50" height="22" rx="8" style="fill:${CREAM}"/><rect x="276" y="212" width="50" height="22" rx="8" style="fill:${CREAM}"/>` + (t === 3 ? `<rect x="234" y="226" width="30" height="18" rx="6" style="fill:${S.accent}"/><rect x="276" y="226" width="30" height="18" rx="6" style="fill:${S.fabric2}"/>` : "");
    cover = `<rect x="202" y="242" width="136" height="76" rx="4" style="fill:${duv}"/><rect x="202" y="242" width="136" height="12" rx="3" style="fill:${lt(duv, .35)}"/>`;
  }
  let det = "";
  if (rump) det += `<path d="M216 248 q20 6 40 -2 M262 256 q22 -6 44 4 M224 238 q10 6 26 2" stroke="#D8D0C4" stroke-width="1" fill="none"/>`;
  if (!rump && quilt) det += Array.from({length: 18}, (_, k) => `<rect x="${206 + (k % 6)*22}" y="${256 + Math.floor(k/6)*20}" width="22" height="20" fill="${[S.fabric, S.fabric2, lt(S.accent, .4), CREAM][(k*5) % 4]}" opacity=".8"/>`).join("") + `<path d="M206 256 h132" stroke="${INK}" stroke-width=".6" stroke-dasharray="2 2"/>`;
  else if (!rump && t === 2) det += [0, 1, 2].map(r => `<path d="M204 ${268 + r*16} h132" stroke="${dk(duv, .12)}" stroke-width="1"/>`).join("") + [0, 1, 2, 3, 4].map(k => `<path d="M${226 + k*22} 256 v60" stroke="${dk(duv, .12)}" stroke-width="1"/>`).join("");
  else if (!rump && t === 3) det += `<path d="M204 300 q66 8 132 0" stroke="${S.accent}" stroke-width="2" fill="none"/><ellipse cx="270" cy="272" rx="40" ry="8" fill="#FFFFFF" opacity=".18"/>`;
  else if (rump && quilt) det += `<path d="M210 290 h120" stroke="${S.fabric}" stroke-width="3" stroke-dasharray="10 6"/>`;
  if (t === 2) det += `<path d="M216 160 h108" stroke="${dk(S.wood, .2)}" stroke-width="1"/>`;
  if (t === 3) det += [0, 1, 2, 3].map(k => `<circle cx="${236 + k*22}" cy="${170 - (k === 1 || k === 2 ? 6 : 0)}" r="1.6" fill="${dk(S.fabric, .3)}"/>`).join("");
  if (ST.occupied && !rump) det += `<g transform="rotate(10 300 300)"><path d="M288 302 l1 -7 q5 -2 11 1 q6 -3 11 -1 l1 7 q-6 -2 -12 1 q-6 -3 -12 -1z" fill="${CREAM}" stroke="${INK}" stroke-width=".6"/><path d="M300 296 v7" stroke="${S.accent}" stroke-width="1.4"/></g>`;
  return (t === 3 ? D(posts.split("<rect x=\"192\"")[0]) : "") + D(head) + D(frame + pillows + cover, det) + (t === 3 ? D(`<rect x="192" y="64" width="156" height="12" rx="2" style="fill:${S.wood}"/>`, drapes) : "");
}
function bedside(t){
  const one = x => {
    if (t === 1) return D(`<ellipse cx="${x}" cy="290" rx="14" ry="5" style="fill:${lt(S.wood, .15)}"/>`, `<path d="M${x - 9} 292 l-3 24 M${x + 9} 292 l3 24 M${x} 294 v22" stroke="${dk(S.wood, .25)}" stroke-width="2.4"/><path d="M${x - 2} 288 v-8 h5 v8" fill="#DDEEF2" stroke="${INK}" stroke-width=".5"/>`);
    const lampIt = t === 3 ? (glow(x, 254, 34), `<path d="M${x} 280 v-18" stroke="${S.metal}" stroke-width="2"/><path d="M${x - 9} 250 h18 l4 13 h-26z" fill="${NIGHT ? lt(S.fabric2, .5) : S.fabric2}" stroke="${INK}" stroke-width=".8"/><ellipse cx="${x}" cy="281" rx="6" ry="2" fill="${S.metal}"/>`) : "";
    return D(`<rect x="${x - 15}" y="280" width="30" height="36" rx="2" style="fill:${t === 3 ? S.wood : lt(S.wood, .1)}"/>`, `<path d="M${x - 15} 294 h30" stroke="${dk(S.wood, .25)}" stroke-width="1"/><circle cx="${x}" cy="288" r="1.4" fill="${S.metal}"/><circle cx="${x}" cy="304" r="1.4" fill="${S.metal}"/>` + lampIt);
  };
  return one(180) + one(360);
}
function wardrobe(t){
  if (t === 1) return D(`<rect x="430" y="246" width="44" height="14" rx="2" style="fill:#C9A26A"/>`, `<path d="M426 262 V168 M482 262 V168 M424 168 h60" stroke="${S.metal}" stroke-width="3"/>${[S.fabric, S.accent, CREAM, S.fabric2, "#7E8FA6"].map((c, k) => `<path d="M${436 + k*9} 168 v5" stroke="${INK}" stroke-width=".8"/><path d="M${430 + k*9} 178 l6 -5 l6 5 l2 ${30 + (k % 2)*14} h-16z" fill="${c}" stroke="${INK}" stroke-width=".7"/>`).join("")}`);
  if (t === 2) { const c = mix(S.accent, "#FFFFFF", .5);
    return D(`<rect x="424" y="156" width="60" height="102" rx="2" style="fill:${c}"/><rect x="420" y="150" width="68" height="8" rx="2" style="fill:${dk(c, .1)}"/>`, `<path d="M454 160 v94" stroke="${dk(c, .3)}" stroke-width="1.2"/><rect x="429" y="164" width="21" height="86" fill="none" stroke="${dk(c, .2)}" stroke-width="1"/><rect x="458" y="164" width="21" height="86" fill="none" stroke="${dk(c, .2)}" stroke-width="1"/><circle cx="450" cy="208" r="1.8" fill="${S.metal}"/><circle cx="458" cy="208" r="1.8" fill="${S.metal}"/><path d="M428 258 v4 M480 258 v4" stroke="${INK}" stroke-width="2.4"/><path d="M434 180 q6 -6 12 0 q-6 6 -12 0 M462 180 q6 -6 12 0 q-6 6 -12 0" fill="${S.fabric}"/>`); }
  return D(`<path d="M418 258 V138 q36 -22 72 0 V258z" style="fill:${S.wood}"/><rect x="438" y="152" width="32" height="92" rx="14" style="fill:#DDEEF2"/>`,
    `<path d="M436 148 v108 M472 148 v108" stroke="${dk(S.wood, .3)}" stroke-width="1.2"/><rect x="422" y="150" width="12" height="96" fill="none" stroke="${dk(S.wood, .3)}" stroke-width="1"/><rect x="474" y="150" width="12" height="96" fill="none" stroke="${dk(S.wood, .3)}" stroke-width="1"/><path d="M442 230 l20 -64" stroke="#FFFFFF" stroke-width="3" opacity=".6"/><path d="M432 134 q22 -12 44 0" stroke="${S.metal}" stroke-width="2" fill="none"/><circle cx="454" cy="128" r="3" fill="${S.metal}"/><path d="M418 258 h72 v4 h-72z" fill="${dk(S.wood, .3)}"/><circle cx="432" cy="200" r="1.8" fill="${S.metal}"/><circle cx="476" cy="200" r="1.8" fill="${S.metal}"/>`);
}
function seatRecess(){   // the deep window recess the window seat sits in (part of the cottage)
  const id = `coWin${++CID}`;
  return g(D(`<rect x="350" y="32" width="88" height="140" rx="2" style="fill:${dk(S.wall2, .06)}"/>`) + `<defs><clipPath id="${id}"><rect x="364" y="44" width="60" height="92"/></clipPath></defs><g clip-path="url(#${id})">${view(364, 44, 60, 92, 3)}</g>`
    + sk(`<rect x="364" y="44" width="60" height="92" fill="none" style="stroke:${CREAM}" stroke-width="4"/><path d="M394 44 v92 M364 90 h60" style="stroke:${CREAM}" stroke-width="2.6"/>`, `<rect x="364" y="44" width="60" height="92"/>`)
    + (ST.c === "bluebell" ? D(`<rect x="352" y="42" width="10" height="96" style="fill:${BLUE}"/><rect x="426" y="42" width="10" height="96" style="fill:${BLUE}"/>`, Array.from({length: 11}, (_, k) => `<path d="M353 ${48 + k*8} h8 M427 ${48 + k*8} h8" stroke="${BLUE2}" stroke-width="1"/>`).join("")) : "")
    + D(`<rect x="350" y="140" width="88" height="20" style="fill:${lt(S.wood, .2)}"/><rect x="350" y="160" width="88" height="12" style="fill:${S.wall2}"/>`, `<path d="M350 160 h88" stroke="${dk(S.wood, .3)}" stroke-width="1"/>`));
}
function windowseat(t){
  if (t === 1) return D(`<rect x="362" y="142" width="40" height="16" rx="6" style="fill:${S.fabric}"/>`, `<path d="M366 150 h32" stroke="${lt(S.fabric, .4)}" stroke-width="1"/>`);
  let s = D(`<rect x="352" y="142" width="84" height="18" rx="5" style="fill:${S.fabric2}"/><rect x="356" y="132" width="20" height="16" rx="5" style="fill:${S.fabric}"/><rect x="412" y="132" width="20" height="16" rx="5" style="fill:${S.accent}"/><path d="M396 146 q14 -4 26 2 l-2 26 q-12 4 -22 0z" style="fill:${lt(S.accent, .45)}"/>`,
    `${[0, 1, 2].map(k => `<path d="M${401 + k*6} 148 v24" stroke="${S.accent}" stroke-width="1"/>`).join("")}`);
  if (t === 3) {
    s += D(`<rect x="352" y="161" width="40" height="11" style="fill:${dk(S.wood, .3)}"/>`, books(354, 390, 172, 21, 10));
    s += g(Array.from({length: 13}, (_, k) => { const a = k/12, x = f1(358 + a*72), y = f1(38 + Math.sin(a*Math.PI*3)*4); if (k % 3 === 0) glow(+x, +y, 16); return `<circle cx="${x}" cy="${y}" r="2.2" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".4"/>`; }).join("")
      + `<path d="M356 36 q36 8 76 0" fill="none" stroke="#5A6A4A" stroke-width=".8"/>` + [0, 1, 2, 3, 4, 5].map(k => { const y = 50 + k*15; if (k % 2) glow(352, y, 12); return `<circle cx="352" cy="${y}" r="2" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".4"/><circle cx="436" cy="${y}" r="2" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".4"/>`; }).join(""));
  }
  return s;
}
function bedrug(t){
  if (t === 1) return D(`<rect x="188" y="404" width="164" height="64" rx="2" style="fill:${S.fabric2}"/>`, [0, 1, 2, 3].map(k => `<path d="M188 ${414 + k*14} h164" stroke="${S.accent}" stroke-width="2.4"/>`).join("") + Array.from({length: 9}, (_, k) => `<path d="M188 ${406 + k*7.4} h-5 M352 ${406 + k*7.4} h5" stroke="${S.fabric2}" stroke-width="1.2"/>`).join(""));
  if (t === 2) return D(`<path d="M206 432 q-6 -26 30 -30 q30 -8 64 0 q36 2 38 28 q4 26 -30 34 q-34 8 -68 0 q-38 -4 -34 -32z" style="fill:#F6F2E8"/>`, Array.from({length: 22}, (_, k) => `<path d="M${f1(212 + R(k)*116)} ${f1(410 + R(k + 3)*48)} q3 -3 6 0" stroke="#D8D0C0" stroke-width="1" fill="none"/>`).join(""));
  return D(`<ellipse cx="270" cy="432" rx="112" ry="38" style="fill:${S.fabric}"/>`, `<ellipse cx="270" cy="432" rx="100" ry="32" fill="none" stroke="${S.fabric2}" stroke-width="5"/><ellipse cx="270" cy="432" rx="70" ry="22" fill="none" stroke="${S.accent}" stroke-width="3" stroke-dasharray="8 4"/><ellipse cx="270" cy="432" rx="34" ry="11" fill="${S.fabric2}"/>`);
}
function vanity(t){
  if (t === 1) return D(`<rect x="66" y="442" width="52" height="28" style="fill:#C9A26A"/><circle cx="92" cy="426" r="14" style="fill:#DDEEF2"/>`, `<path d="M66 456 h52" stroke="#9A7A4A" stroke-width="1"/><circle cx="92" cy="426" r="14" fill="none" stroke="${S.metal}" stroke-width="2.4"/><path d="M86 420 l8 -6" stroke="#FFFFFF" stroke-width="2"/><rect x="104" y="434" width="7" height="9" rx="1" fill="${S.fabric}"/>`);
  const c = t === 3 ? CREAM : S.wood;
  const mirror = t === 2 ? `<ellipse cx="92" cy="400" rx="18" ry="24" style="fill:#DDEEF2"/>` : `<rect x="64" y="374" width="56" height="54" rx="4" style="fill:#DDEEF2"/>`;
  let det = `<path d="M50 446 h84" stroke="${dk(c, .2)}" stroke-width="1"/><circle cx="70" cy="452" r="1.4" fill="${S.metal}"/><circle cx="114" cy="452" r="1.4" fill="${S.metal}"/><path d="M54 458 v12 M130 458 v12" stroke="${dk(S.wood, .2)}" stroke-width="3"/>`;
  det += t === 2 ? `<ellipse cx="92" cy="400" rx="18" ry="24" fill="none" stroke="${dk(S.wood, .2)}" stroke-width="3"/><path d="M84 392 l10 -10" stroke="#FFFFFF" stroke-width="2"/>` : `<path d="M74 412 l16 -26" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>`;
  det += `<rect x="104" y="428" width="6" height="8" rx="1" fill="${S.fabric}" stroke="${INK}" stroke-width=".4"/><rect x="113" y="430" width="5" height="6" rx="1" fill="#C9B3E3" stroke="${INK}" stroke-width=".4"/>`;
  let s = D(mirror + `<rect x="48" y="436" width="88" height="22" rx="2" style="fill:${c}"/><rect x="46" y="432" width="92" height="5" rx="1" style="fill:${dk(c, .1)}"/>`, det);
  if (t === 3) {
    s += g([[64, 374], [120, 374], [64, 428], [120, 428], [64, 401], [120, 401], [82, 374], [102, 374]].map(([x, y]) => { glow(x, y, 14); return `<circle cx="${x}" cy="${y}" r="3.4" fill="${NIGHT ? "#FFE8A8" : "#FFF6DA"}" stroke="${INK}" stroke-width=".6"/>`; }).join(""));
    s += D(`<rect x="76" y="482" width="32" height="12" rx="5" style="fill:${S.fabric}"/>`, `<path d="M80 494 v8 M104 494 v8" stroke="${S.metal}" stroke-width="2.4"/>`);
  }
  return s;
}
function stairsDown(){   // the top of the stairs, bottom left, going down (like the mill's upstairs)
  return otherSpot("stairs", "Down the stairs to the sitting room", hovE(80, 590, 46, 14),
    sk(`<rect x="36" y="520" width="90" height="96" style="fill:#7A5638"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${40 + i*4}" y="${528 + i*17}" width="${82 - i*8}" height="12" style="fill:#A8754F"/>`).join("")}<path d="M130 520 v96 M126 520 h8" style="stroke:#5A3A2A" stroke-width="3"/>`, `<rect x="36" y="520" width="90" height="96"/>`)
    + lab(80, 628, "Downstairs", "#F3E1A0", 9));
}
function accUp(){
  let s = "";
  if (has("mirror")) s += g(D(`<circle cx="330" cy="96" r="14" style="fill:#DDEEF2"/>`, `<circle cx="330" cy="96" r="14" fill="none" stroke="${S.metal}" stroke-width="3"/><path d="M323 92 l9 -8" stroke="#FFFFFF" stroke-width="2"/><path d="M330 82 l-6 -12 h12z" fill="none" stroke="${INK}" stroke-width=".6"/>`));
  if (has("towels")) s += g(D(`<path d="M48 236 L52 166 M72 236 L68 166" style="stroke:${S.wood}" stroke-width="3"/><rect x="48" y="176" width="24" height="22" rx="2" style="fill:${S.fabric2}"/><rect x="49" y="206" width="22" height="18" rx="2" style="fill:${CREAM}"/>`, `<path d="M50 180 h20 M50 220 h20" stroke="${S.accent}" stroke-width="1.2"/>`));
  if (has("robes")) s += g(D(`<path d="M158 196 l8 -4 l8 4 l3 40 h-22z" style="fill:${CREAM}"/><path d="M172 198 l8 -4 l8 4 l3 40 h-22z" style="fill:${S.fabric2}"/>`, `<circle cx="166" cy="192" r="1.6" fill="${S.metal}"/><circle cx="180" cy="194" r="1.6" fill="${S.metal}"/><path d="M160 214 h18 M174 216 h18" stroke="${S.accent}" stroke-width="1.2"/>`));
  if (has("plant")) s += g(D(`<path d="M456 516 h28 l-3 24 h-22z" style="fill:#C8643B"/>`, [[-22, -40, -30], [18, -46, 24], [-4, -62, -4], [-26, -18, -50], [24, -22, 50]].map(([dx, dy, a]) => `<path d="M470 516 Q${470 + dx*.4} ${516 + dy*.5} ${470 + dx} ${516 + dy}" stroke="#4E7A3E" stroke-width="1.6" fill="none"/><ellipse cx="${470 + dx}" cy="${516 + dy}" rx="13" ry="8" fill="${(dx + dy) % 3 ? "#5E9A4A" : "#6EAA5A"}" stroke="${INK}" stroke-width=".7" transform="rotate(${a} ${470 + dx} ${516 + dy})"/>`).join("") + `<path d="M456 520 h28" stroke="#8E4A2A" stroke-width="2"/>`));
  return s;
}
function livedUp(){
  let s = "";
  if (ST.occupied) s += g(D(`<ellipse cx="222" cy="352" rx="5" ry="9" style="fill:${S.fabric}"/><ellipse cx="236" cy="354" rx="5" ry="9" style="fill:${S.fabric}"/>`, `<path d="M218 346 q4 -3 8 0 M232 348 q4 -3 8 0" stroke="${CREAM}" stroke-width="2.4" fill="none"/>`));
  if (undone("beds")) s += g(D(`<path d="M376 342 q-4 -18 12 -22 q10 -10 22 -2 q14 -2 16 12 q6 10 -4 14 q-20 4 -46 -2z" style="fill:${CREAM}"/><path d="M386 336 q8 -10 18 -4 q8 -2 10 6 q-12 4 -28 -2z" style="fill:${S.fabric2}"/>`, `<path d="M384 330 q10 4 18 -2 M396 322 q4 6 12 4" stroke="#D8D0C4" stroke-width="1" fill="none"/>`));
  if (undone("bath")) {
    if (tier("bath") > 1) s += g(D(`<path d="M108 252 h20 l2 26 q-8 6 -12 0 q-4 6 -10 0z" style="fill:${S.fabric2}"/>`, `<path d="M110 270 h18" stroke="${S.accent}" stroke-width="1.2"/>`));
    s += g(D(`<path d="M40 328 q8 -10 24 -6 q12 0 14 8 q-2 8 -18 8 q-18 0 -20 -10z" style="fill:${CREAM}"/><path d="M104 334 q6 -12 22 -8 q8 4 6 10 q-14 6 -28 -2z" style="fill:${S.fabric2}"/>`, `<path d="M50 330 q10 2 20 0" stroke="#D8D0C4" stroke-width="1" fill="none"/><path d="M108 332 h18" stroke="${S.accent}" stroke-width="1"/>`));
  }
  return s;
}
function upArt(){
  return floorArt() + wallArt() + bathroomShell() + windowArt(52, 44, 76, 72, {curtains: false, seed: 4}) + seatRecess()
    + upAccBack() + pieceSpot("bath", bath) + halfWall() + upAccRobes() + pieceSpot("windowseat", windowseat) + pieceSpot("wardrobe", wardrobe)
    + pieceSpot("bedside", bedside) + pieceSpot("bed", bed) + upAccMirror() + pieceSpot("bedrug", bedrug) + pieceSpot("vanity", vanity) + upAccPlant()
    + livedUp() + stairsDown() + crates();
}
// the accessories upstairs, split so each sits at the right depth
const upAccBack = () => { const keep = ACC_UP("towels"); return keep; };
const upAccRobes = () => ACC_UP("robes"), upAccMirror = () => ACC_UP("mirror"), upAccPlant = () => ACC_UP("plant");
function ACC_UP(id){ const save = ST.acc; ST.acc = {[id]: has(id)}; const s = accUp(); ST.acc = save; return s; }

/* ====================================================================================================== */
/* ---------- the back garden ---------- */
function gardenShell(){
  let s = `<rect width="520" height="70" style="fill:${NIGHT ? "#26325E" : "#CFE6F2"}"/>`;
  s += NIGHT ? Array.from({length: 14}, (_, k) => `<circle cx="${f1(R(k)*520)}" cy="${f1(6 + R(k + 5)*50)}" r="${f1(.8 + R(k)*.9)}" fill="#FFF3C4"/>`).join("") + `<path d="M84 18 a9 9 0 1 0 9 12 a7 7 0 1 1 -9 -12z" fill="#FFF3C4"/>`
    : `<ellipse cx="120" cy="26" rx="34" ry="8" fill="#FFFFFF" opacity=".85"/><ellipse cx="380" cy="18" rx="26" ry="6" fill="#FFFFFF" opacity=".8"/>`;
  // the grass, mown in stripes, with tufts and daisies
  s += `<rect y="196" width="520" height="444" style="fill:#A8C77A"/>` + Array.from({length: 10}, (_, k) => k % 2 ? `<rect y="${196 + k*44}" width="520" height="44" style="fill:#B2D088"/>` : "").join("")
    + Array.from({length: 40}, (_, k) => { const x = f1(R(k*3)*520), y = f1(214 + R(k*7)*380); return `<path d="M${x} ${y} l-2 -5 M${x} ${y} l0 -6 M${x} ${y} l2 -5" stroke="#7FA05A" stroke-width="1"/>`; }).join("")
    + Array.from({length: 16}, (_, k) => `<circle cx="${f1(R(k*5 + 2)*520)}" cy="${f1(260 + R(k*11 + 1)*320)}" r="2" fill="#FFFFFF"/><circle cx="${f1(R(k*5 + 2)*520)}" cy="${f1(260 + R(k*11 + 1)*320)}" r=".8" fill="#F2C94C"/>`).join("");
  if (ST.c === "figtree") {   // Fig Tree: an old brick wall with a stone coping
    s += `<rect y="62" width="520" height="140" style="fill:#C27A5A"/>` + Array.from({length: 14}, (_, r) => `<path d="M0 ${70 + r*10} H520" stroke="#A8664A" stroke-width="1"/>` + Array.from({length: 18}, (_, k) => `<path d="M${k*30 + (r % 2)*15} ${70 + r*10} v10" stroke="#A8664A" stroke-width="1"/>`).join("")).join("")
      + Array.from({length: 30}, (_, k) => `<rect x="${f1(R(k)*500)}" y="${70 + Math.floor(R(k + 2)*13)*10}" width="28" height="9" fill="${k % 2 ? "#B46E50" : "#CE8A66"}" opacity=".7"/>`).join("")
      + `<rect y="56" width="520" height="10" style="fill:#C9BCA4"/><path d="M0 56 H520 M0 66 H520" stroke="${INK}" stroke-width="1.2"/>`;
  } else {   // Bluebell: a white picket fence with a beech hedge behind
    s += `<rect y="40" width="520" height="160" style="fill:#7FA05A"/>` + Array.from({length: 26}, (_, k) => `<circle cx="${k*21}" cy="${46 + (k % 3)*4}" r="14" fill="${k % 2 ? "#6E9A4A" : "#88AE5E"}"/>`).join("")
      + Array.from({length: 30}, (_, k) => `<path d="M${k*18 + 2} 202 V104 l7 -9 l7 9 V202z" fill="#F6F2E8" stroke="#B8B0A0" stroke-width="1"/>`).join("") + `<rect y="126" width="520" height="7" fill="#EDE8DC"/><rect y="178" width="520" height="7" fill="#EDE8DC"/>`;
  }
  s += `<path d="M0 200 H520" stroke="${INK}" stroke-width="1.2"/>`;
  // climbing roses along the top and trailing down
  const roses = [S.fabric, "#E86A7A", "#F4B8C0", "#FFFFFF", "#D9433A"];
  s += Array.from({length: 24}, (_, k) => { const x = k*22 + 6 + R(k)*8, y = (ST.c === "figtree" ? 60 : 100) + R(k + 4)*10, down = k % 4 === 1 ? 50 : 0;
    return `<path d="M${f1(x)} ${f1(y)} q${f1(R(k)*10 - 5)} ${down/2} 0 ${down}" stroke="#4E7A3E" stroke-width="1.6" fill="none"/>${[0, 1, 2].map(j => `<ellipse cx="${f1(x - 8 + j*8)}" cy="${f1(y + (j % 2)*4 + (j === 2 ? down*.6 : 0))}" rx="6" ry="4" fill="#5E8A4A"/>`).join("")}<circle cx="${f1(x)}" cy="${f1(y - 1)}" r="4" fill="${roses[k % 5]}" stroke="${INK}" stroke-width=".5"/><circle cx="${f1(x + 6)}" cy="${f1(y + down*.8 + 3)}" r="3.2" fill="${roses[(k + 2) % 5]}" stroke="${INK}" stroke-width=".5"/>`; }).join("");
  // the stepping-stone path from the back door
  s += [[258, 584], [222, 570], [188, 556], [160, 538], [142, 514], [136, 488], [142, 462]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="${15 - k*.5}" ry="${7 - k*.2}" fill="#C9C2B4" stroke="#8E8678" stroke-width="1"/><path d="M${x - 6} ${y - 1} q5 -2 10 0" stroke="#E0DACC" stroke-width="1" fill="none"/>`).join("");
  return g(s);
}
function figTree(){
  if (ST.c !== "figtree") return "";
  const leaf = (x, y, a, c) => `<path d="M0 0 q-8 -4 -10 -14 q4 -2 6 2 q-2 -8 4 -12 q4 4 2 10 q2 -6 8 -6 q2 6 -4 10 q6 0 8 4 q-6 6 -14 6z" transform="translate(${f1(x)} ${f1(y)}) rotate(${a})" fill="${c}" stroke="${INK}" stroke-width=".6"/>`;
  return g(D(`<path d="M476 252 q-4 -40 -16 -70 l8 -2 q8 24 14 40 q6 -30 20 -50 l6 4 q-14 26 -16 78z" style="fill:#8E8070"/>`)
    + Array.from({length: 26}, (_, k) => leaf(420 + R(k)*100, 96 + R(k + 7)*120, R(k + 3)*360, ["#5E8A4A", "#6E9A4A", "#4E7A3E"][k % 3])).join("")
    + [[446, 170], [470, 140], [500, 186], [438, 128], [492, 112]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="5" fill="#6A3A5A" stroke="${INK}" stroke-width=".5"/>`).join(""));
}
function flowerbeds(t){
  const bluebells = (x, y) => ST.c === "bluebell" ? `<path d="M${x} ${y} q2 -14 8 -18" stroke="#5E8A4A" stroke-width="1.2" fill="none"/>${[0, 1, 2].map(j => `<path d="M${x + 2 + j*3} ${y - 6 - j*4} q-3 4 0 6 q3 -2 0 -6z" fill="#5C6FD0"/>`).join("")}` : "";
  if (t === 1) return D([150, 196, 242, 288, 334, 380].map(x => `<path d="M${x - 12} 226 h24 l-3 18 h-18z" style="fill:#C8643B"/>`).join(""),
    [150, 196, 242, 288, 334, 380].map((x, k) => `${[[-6, -8], [0, -12], [6, -8]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${226 + dy}" rx="6" ry="5" fill="#5E8A4A"/>`).join("")}${[[-5, -12], [4, -14], [0, -8]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${226 + dy}" r="3" fill="${["#D9433A", "#9A7AC8", "#F6E3A1", S.fabric, "#E86A7A", "#FFFFFF"][k]}"/>`).join("")}<path d="M${x - 13} 226 h26" stroke="#8E4A2A" stroke-width="2"/>`).join("") + bluebells(404, 244));
  const border = D(`<path d="M16 202 H504 V236 q-60 10 -120 4 q-62 -8 -124 2 q-62 8 -124 -2 q-60 -8 -120 4z" style="fill:#8A6A4A"/>`,
    Array.from({length: 36}, (_, k) => { const x = 22 + k*13.6, h = 18 + R(k)*30, c = ["#C9B3E3", "#E86A7A", "#F6E3A1", S.fabric, "#9A7AC8", "#FFFFFF"][k % 6];
      return `<path d="M${f1(x)} 236 V${f1(236 - h)}" stroke="#5E8A4A" stroke-width="1.6"/><ellipse cx="${f1(x - 3)}" cy="${f1(236 - h*.4)}" rx="4" ry="2" fill="#6E9A4A"/>${k % 3 === 0 ? [0, 1, 2, 3].map(j => `<circle cx="${f1(x)}" cy="${f1(236 - h + j*5)}" r="2.6" fill="${c}"/>`).join("") : `<circle cx="${f1(x)}" cy="${f1(236 - h)}" r="${k % 2 ? 4 : 3}" fill="${c}" stroke="${INK}" stroke-width=".4"/>`}`; }).join("")
    + [40, 120, 200, 330, 470].map(x => bluebells(x, 238)).join(""));
  if (t === 2) return border;
  return border + D(`<rect x="214" y="100" width="7" height="144" style="fill:#F6F2E8"/><rect x="299" y="100" width="7" height="144" style="fill:#F6F2E8"/><path d="M214 104 q46 -50 92 0 l-7 2 q-39 -40 -78 0z" style="fill:#F6F2E8"/>`,
    Array.from({length: 22}, (_, k) => { const a = Math.PI*(k/21), x = 260 - Math.cos(a)*46, y = 104 - Math.sin(a)*34; return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="7" ry="5" fill="#5E8A4A"/>${k % 2 ? `<circle cx="${f1(x + 2)}" cy="${f1(y - 2)}" r="4" fill="${k % 4 === 1 ? S.fabric : "#E86A7A"}" stroke="${INK}" stroke-width=".4"/>` : ""}`; }).join("")
    + [0, 1, 2, 3, 4, 5].map(k => `<ellipse cx="${k % 2 ? 302 : 218}" cy="${130 + k*18}" rx="6" ry="4" fill="#5E8A4A"/><circle cx="${k % 2 ? 304 : 216}" cy="${134 + k*18}" r="3.4" fill="#E86A7A" stroke="${INK}" stroke-width=".4"/>`).join(""));
}
function festoon(t){
  const bulb = (x, y, k) => { if (k % 2 === 0) glow(x, y + 3, 18); return `<path d="M${f1(x)} ${f1(y)} v3" stroke="${INK}" stroke-width=".7"/><ellipse cx="${f1(x)}" cy="${f1(y + 6)}" rx="3" ry="4" fill="${NIGHT ? "#FFE08A" : "#FFF6DA"}" stroke="${INK}" stroke-width=".5"/>`; };
  const string = (x0, y0, x1, y1, sag, n) => { let s = `<path d="M${x0} ${y0} Q${(x0 + x1)/2} ${(y0 + y1)/2 + sag*2} ${x1} ${y1}" fill="none" stroke="#3A3634" stroke-width="1.2"/>`;
    for (let k = 1; k < n; k++) { const u = k/n, x = (1 - u)*(1 - u)*x0 + 2*u*(1 - u)*(x0 + x1)/2 + u*u*x1, y = (1 - u)*(1 - u)*y0 + 2*u*(1 - u)*((y0 + y1)/2 + sag*2) + u*u*y1; s += bulb(x, y, k); }
    return s; };
  const posts = D(`<rect x="24" y="70" width="8" height="150" style="fill:${S.wood}"/><rect x="488" y="70" width="8" height="150" style="fill:${S.wood}"/>`);
  let s = posts + g(string(28, 76, 492, 76, 24, 16));
  if (t > 1) s += g(string(28, 100, 492, 76, 30, 14) + string(28, 76, 492, 104, 34, 14));
  if (t === 3) s += g([[100, 110], [180, 126], [340, 126], [420, 110]].map(([x, y], k) => { glow(x, y + 10, 24); return `<path d="M${x} ${y - 14} v6" stroke="${INK}" stroke-width=".7"/><circle cx="${x}" cy="${y}" r="9" fill="${[S.fabric, S.accent, S.fabric2, S.fabric][k]}" stroke="${INK}" stroke-width=".7"/><path d="M${x - 9} ${y} h18 M${x} ${y - 9} v18" stroke="${INK}" stroke-width=".4" opacity=".5"/>`; }).join("")
    + [28, 492].map(x => { glow(x, 62, 22); return `<rect x="${x - 6}" y="54" width="12" height="16" rx="2" fill="#FFF3C8" stroke="${INK}" stroke-width=".8"/><path d="M${x - 7} 54 l7 -5 l7 5z" fill="#3A3634"/>`; }).join(""));
  return s;
}
function hottub(t){
  const leaves = undone("hottub"), cx = 370, cy = 280;
  let s = "";
  if (t === 3) s += D(`<rect x="306" y="186" width="6" height="96" style="fill:${dk(S.wood, .2)}"/><rect x="428" y="186" width="6" height="96" style="fill:${dk(S.wood, .2)}"/>`);
  const water = `<ellipse cx="${cx}" cy="${cy + 2}" rx="56" ry="13" style="fill:${t === 3 ? "#7FD8DE" : "#8FCCD6"}"/>`;
  if (t === 1) s += D(`<path d="M304 ${cy} V322 q66 36 132 0 V${cy}z" style="fill:#A8754F"/><ellipse cx="${cx}" cy="${cy}" rx="66" ry="18" style="fill:#B9875E"/>` + water,
    Array.from({length: 11}, (_, k) => `<path d="M${312 + k*12} ${cy + 14 + Math.sin(k/10*Math.PI)*12} V${322 + Math.sin(k/10*Math.PI)*16}" stroke="#8A6340" stroke-width="1"/>`).join("") + `<path d="M304 296 q66 34 132 0 M304 316 q66 34 132 0" stroke="#4A4644" stroke-width="2.4" fill="none"/>`);
  else s += D(`<path d="M304 ${cy} V322 q66 36 132 0 V${cy}z" style="fill:${t === 3 ? dk(S.wood, .25) : "#B7744A"}"/><ellipse cx="${cx}" cy="${cy}" rx="66" ry="18" style="fill:${t === 3 ? dk(S.wood, .1) : "#C98A5E"}"/>` + water
      + `<rect x="290" y="316" width="30" height="12" rx="1" style="fill:#B7744A"/><rect x="284" y="326" width="36" height="14" rx="1" style="fill:#C98A5E"/>`,
    [0, 1, 2, 3].map(k => `<path d="M304 ${292 + k*9} q66 ${34} 132 0" stroke="${t === 3 ? dk(S.wood, .4) : "#9A5E3A"}" stroke-width=".8" fill="none"/>`).join(""));
  if (t === 3) { s += g(Array.from({length: 12}, (_, k) => { const a = Math.PI*(k/11), x = cx - Math.cos(a)*62, y = cy + 4 + Math.sin(a)*16; glow(x, y, 14); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="2" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".4"/>`; }).join(""));
    if (NIGHT) glow(cx, cy, 70); }
  if (!leaves) s += g([0, 1, 2].map(k => `<path d="M${346 + k*22} ${cy - 6} q-6 -10 0 -18 q6 -8 0 -16" stroke="#FFFFFF" stroke-width="2" fill="none" opacity=".55"/>`).join(""));
  else s += g([[340, 280], [372, 286], [398, 278], [356, 274], [410, 284]].map(([x, y], k) => `<path d="M${x} ${y} q5 -5 10 0 q-5 5 -10 0z" fill="${["#D98A3A", "#C8643B", "#9AAE4A"][k % 3]}" stroke="${INK}" stroke-width=".5" transform="rotate(${k*40} ${x + 5} ${y})"/>`).join("")
      + D(`<path d="M378 ${cy - 18} q34 -2 58 12 q6 14 -4 22 l-40 4 q-14 -14 -14 -38z" style="fill:#6E7A6E"/>`, `<path d="M394 ${cy - 12} q18 4 32 14" stroke="#8E9A8E" stroke-width="1.2" fill="none"/>`));
  if (t === 3) s += D(`<rect x="300" y="282" width="6" height="64" style="fill:${dk(S.wood, .2)}"/><rect x="434" y="282" width="6" height="64" style="fill:${dk(S.wood, .2)}"/><path d="M290 186 L370 168 L450 186 v10 H290z" style="fill:${S.fabric2}"/>`,
    `<path d="M290 196 ${Array.from({length: 10}, (_, k) => `q8 8 16 0`).join(" ")}" fill="${S.accent}" opacity=".8"/>` + Array.from({length: 9}, (_, k) => { glow(298 + k*18, 202, 12); return `<circle cx="${298 + k*18}" cy="${202}" r="2" fill="${NIGHT ? "#FFE08A" : "#FFF3C8"}" stroke="${INK}" stroke-width=".4"/>`; }).join("")
      + `<path d="M303 196 L303 282 M437 196 L437 282" stroke="${dk(S.wood, .2)}" stroke-width="6"/>`);
  return s;
}
function patio(t){
  const chair = (x, y, col, face = 1) => `<path d="M${x - 8} ${y} v-14 M${x + 8} ${y} v-14" stroke="${col}" stroke-width="2.2"/><rect x="${x - 9}" y="${y - 16}" width="18" height="4" rx="1" fill="${col}"/><path d="M${x - 8} ${y - 16} v-14 q8 ${-6*face} 16 0 v14" stroke="${col}" stroke-width="2.2" fill="none"/>`;
  if (t === 1) return D(`<ellipse cx="160" cy="400" rx="24" ry="8" style="fill:${S.accent}"/>`, `<path d="M160 408 v20 M152 430 h16" stroke="${S.accent}" stroke-width="2.6"/>` + chair(126, 430, S.accent) + chair(194, 430, S.accent) + `<rect x="150" y="390" width="7" height="8" rx="1" fill="${CREAM}" stroke="${INK}" stroke-width=".5"/>`);
  let s = "";
  if (t === 3) s += D(`<rect x="102" y="300" width="6" height="80" style="fill:${S.wood}"/><rect x="214" y="300" width="6" height="80" style="fill:${S.wood}"/>`);
  const [x0, x1] = t === 2 ? [116, 204] : [96, 224];
  s += g([0, 1, 2].slice(0, t === 2 ? 2 : 3).map(k => chair(x0 + 20 + k*(x1 - x0 - 40)/(t === 2 ? 1 : 2), 398, S.wood)).join(""));
  s += D(`<rect x="${x0}" y="398" width="${x1 - x0}" height="16" rx="2" style="fill:${S.wood}"/><rect x="${x0}" y="414" width="${x1 - x0}" height="4" style="fill:${dk(S.wood, .25)}"/>`, `<path d="M${x0 + 6} 418 v12 M${x1 - 6} 418 v12" stroke="${dk(S.wood, .25)}" stroke-width="3"/>${[0, 1, 2].map(k => `<path d="M${x0 + 2} ${402 + k*4} h${x1 - x0 - 4}" stroke="${dk(S.wood, .15)}" stroke-width=".6"/>`).join("")}<path d="M156 398 l-2 -8 h8 l-2 8z" fill="${CREAM}"/><circle cx="158" cy="388" r="3" fill="${S.fabric}"/>`);
  s += g([0, 1].map(k => chair(x0 + 18 + k*(x1 - x0 - 36), 446, S.wood, -1)).join(""));
  if (t === 3) s += D(`<rect x="88" y="326" width="7" height="124" style="fill:${S.wood}"/><rect x="226" y="326" width="7" height="124" style="fill:${S.wood}"/><path d="M80 322 H240 v8 H80z" style="fill:${S.wood}"/><path d="M96 296 H226 v6 H96z" style="fill:${S.wood}"/>`,
    [0, 1, 2, 3, 4, 5].map(k => `<path d="M${98 + k*24} 300 l-6 26" stroke="${S.wood}" stroke-width="4"/>`).join("") + Array.from({length: 16}, (_, k) => `<ellipse cx="${84 + k*10}" cy="${322 + (k % 3)*2}" rx="6" ry="4" fill="#5E8A4A"/>${k % 3 === 0 ? `<path d="M${84 + k*10} 326 q-2 10 0 16" stroke="#9A7AC8" stroke-width="3" stroke-linecap="round"/>` : ""}`).join(""));
  return s;
}
function hammock(t){
  if (t === 1) return D(`<path d="M414 520 l8 -30 h20 l-8 30z" style="fill:${S.fabric}"/>`, `<path d="M416 512 l6 -22 M426 520 l6 -30 M434 520 l6 -30" stroke="${CREAM}" stroke-width="3"/><path d="M412 520 l14 -40 M446 520 l-8 -30 M410 506 h36" stroke="${S.wood}" stroke-width="2.4"/>`);
  let s = D(`<rect x="360" y="440" width="8" height="82" style="fill:${S.wood}"/><rect x="492" y="440" width="8" height="82" style="fill:${S.wood}"/><path d="M376 470 q54 46 108 0 q-54 30 -108 0z" style="fill:${S.fabric2}"/>`,
    `<path d="M368 452 L376 470 M492 452 L484 470" stroke="#C9B48A" stroke-width="1.4"/>${[0, 1, 2].map(k => `<path d="M${384 + k*30} 474 q4 ${12 + (k === 1 ? 6 : 0)} 0 ${18}" stroke="${S.accent}" stroke-width="2" fill="none"/>`).join("")}<rect x="388" y="476" width="20" height="10" rx="4" fill="${S.fabric}" stroke="${INK}" stroke-width=".6" transform="rotate(14 398 481)"/>`);
  if (t === 3) s += D(`<rect x="438" y="546" width="74" height="22" rx="6" style="fill:${S.fabric2}"/><rect x="436" y="566" width="78" height="8" rx="2" style="fill:${S.wood}"/><rect x="444" y="534" width="22" height="16" rx="5" style="fill:${S.accent}"/><rect x="484" y="534" width="22" height="16" rx="5" style="fill:${S.fabric}"/>`, `<path d="M440 574 v6 M510 574 v6" stroke="${dk(S.wood, .3)}" stroke-width="3"/>`);
  return s;
}
function firepit(t){
  const fire = (y, s) => { glow(250, y - 10, t === 3 ? 66 : 54); return `<path d="M236 ${y} l28 -4 M238 ${y - 4} l24 4" stroke="#6B4A2E" stroke-width="${4*s}" stroke-linecap="round"/>` + flame(244, y - 3, s) + flame(256, y - 3, s*.8) + flame(250, y - 5, s*1.2); };
  if (t === 1) return D(`<path d="M228 496 h44 q-4 14 -22 14 q-18 0 -22 -14z" style="fill:#3A3634"/>`, `<path d="M234 506 l-6 18 M266 506 l6 18 M250 510 v14" stroke="#3A3634" stroke-width="2.4"/>${[0, 1, 2, 3].map(k => `<path d="M${234 + k*10} 498 v8" stroke="#6A6664" stroke-width="1"/>`).join("")}` + fire(498, .8));
  const ring = (rx, ry, cy) => Array.from({length: 14}, (_, k) => { const a = k/14*Math.PI*2; return `<ellipse cx="${f1(250 + Math.cos(a)*rx)}" cy="${f1(cy + Math.sin(a)*ry)}" rx="7" ry="4.6" fill="${k % 2 ? "#B8AE9E" : "#A89C88"}" stroke="${INK}" stroke-width=".7"/>`; }).join("");
  if (t === 2) return D(`<ellipse cx="250" cy="512" rx="30" ry="10" style="fill:#4A4040"/>`, ring(30, 10, 512) + fire(512, 1));
  return D(`<ellipse cx="250" cy="510" rx="74" ry="24" style="fill:#C9C2B4"/><ellipse cx="250" cy="510" rx="34" ry="12" style="fill:#3A3434"/><rect x="200" y="466" width="100" height="10" rx="3" style="fill:${S.wood}"/>`,
    `<path d="M206 476 v8 M294 476 v8" stroke="${dk(S.wood, .3)}" stroke-width="4"/>` + [0, 1, 2, 3, 4].map(k => `<path d="M${190 + k*30} ${492 + (k % 2)*10} l14 ${k % 2 ? -8 : 8}" stroke="#A89C88" stroke-width=".8"/>`).join("") + ring(34, 12, 510) + fire(510, 1.2)
      + `<rect x="168" y="500" width="12" height="38" rx="3" fill="${S.wood}" stroke="${INK}" stroke-width="1"/>`);
}
function house(){
  const door = ST.c === "bluebell" ? BLUE : "#7E9A68", wall = ST.c === "bluebell" ? "#F2EFE6" : "#E3D3B4";
  if (NIGHT) { glow(176, 620, 40); glow(344, 620, 40); }
  const winC = NIGHT ? "#FFD98A" : "#CFE6F2";
  return otherSpot("house", "Back inside the cottage", hovE(260, 600, 40, 14),
    `<rect y="594" width="520" height="46" style="fill:${wall}"/>` + sk("", `<path d="M0 594 H520"/>`) + D(`<rect x="150" y="604" width="52" height="36" style="fill:${winC}"/><rect x="318" y="604" width="52" height="36" style="fill:${winC}"/><path d="M226 640 V588 q34 -24 68 0 V640z" style="fill:${lt(wall, .2)}"/><path d="M234 640 V594 q26 -18 52 0 V640z" style="fill:${door}"/><path d="M218 586 q42 -30 84 0 l-6 4 q-36 -24 -72 0z" style="fill:#6A6E74"/>`,
      `<path d="M176 604 v36 M150 622 h52 M344 604 v36 M318 622 h52" stroke="${CREAM}" stroke-width="2.4"/><circle cx="278" cy="620" r="2.2" fill="${S.metal}"/><rect x="246" y="600" width="28" height="10" rx="2" fill="${lt(door, .3)}"/>`
      + (ST.c === "bluebell" ? [134, 204, 302, 372].map(x => `<rect x="${x}" y="602" width="14" height="38" fill="${BLUE}" stroke="${INK}" stroke-width=".8"/>`).join("") : "")
      + (ST.c === "figtree" ? Array.from({length: 18}, (_, k) => `<path d="M${f1(R(k)*520)} ${f1(600 + R(k + 1)*36)} h22" stroke="#C9B894" stroke-width="1"/>`).join("") : "")
      + [0, 1, 2, 3, 4, 5, 6].map(k => `<ellipse cx="${222 + (k % 2)*4}" cy="${636 - k*8}" rx="5" ry="3.4" fill="#5E8A4A"/><ellipse cx="${298 - (k % 2)*4}" cy="${636 - k*8}" rx="5" ry="3.4" fill="#6E9A4A"/>`).join(""))
    + lab(260, 556, "Back inside", "#F3E1A0", 9));
}
function accGarden(){
  let s = "";
  if (has("birdbath")) s += g(D(`<path d="M74 300 l2 -30 h8 l2 30z" style="fill:#C9C2B4"/><path d="M60 270 q20 10 40 0 q-4 -8 -20 -8 q-16 0 -20 8z" style="fill:#D8D2C4"/><rect x="68" y="298" width="24" height="5" rx="1" style="fill:#B8AE9E"/>`, `<ellipse cx="80" cy="266" rx="14" ry="3" fill="#9FD0DC"/><path d="M86 258 q4 -6 8 -2 l4 -1 l-3 3 q0 4 -6 4z" fill="#8A6A52"/>`));
  if (has("blankets")) s += g(D(`<path d="M278 524 h28 l-3 -18 h-22z" style="fill:#C9A26A"/><rect x="280" y="494" width="12" height="14" rx="5" style="fill:${S.fabric}"/><rect x="290" y="496" width="12" height="12" rx="5" style="fill:${S.fabric2}"/>`, `<path d="M284 494 v14 M288 494 v14" stroke="${S.accent}" stroke-width="1"/><path d="M280 514 h24" stroke="#9A7A4A" stroke-width=".8"/>`));
  if (has("lanterns")) s += g([[106, 566], [124, 540], [176, 598]].map(([x, y]) => { glow(x, y - 8, 26); return D(`<rect x="${x - 6}" y="${y - 16}" width="12" height="16" rx="2" style="fill:${NIGHT ? "#FFE8A8" : "#E8F1F0"}"/><path d="M${x - 7} ${y - 16} l7 -6 l7 6z" style="fill:#3A3634"/>`, `<path d="M${x} ${y - 24} q4 -4 0 -6" stroke="#3A3634" stroke-width="1" fill="none"/><rect x="${x - 2}" y="${y - 10}" width="4" height="6" fill="${CREAM}"/>${flame(x, y - 10, .3)}`); }).join(""));
  return s;
}
function gardenArt(){
  return gardenShell() + pieceSpot("beds", flowerbeds) + figTree() + pieceSpot("festoon", festoon) + accGardenOnly("birdbath") + pieceSpot("hottub", hottub) + pieceSpot("patio", patio)
    + pieceSpot("firepit", firepit) + accGardenOnly("blankets") + pieceSpot("hammock", hammock) + accGardenOnly("lanterns") + crates() + house();
}
function accGardenOnly(id){ const save = ST.acc; ST.acc = {[id]: has(id)}; const s = accGarden(); ST.acc = save; return s; }

/* ====================================================================================================== */
export function cottageArt(scene, st = {}){
  const m = /^(figtree|bluebell)_(down|up|garden)$/.exec(scene || "") || [0, st.c || "figtree", st.floor || "down"];
  ST = {...st, c: m[1], floor: m[2], tiers: st.tiers || {}, acc: st.acc || {}, crates: st.crates || []};
  S = STYLES[ST.style] || STYLES.cottagecore; NIGHT = !!st.night; GL = []; CID = 0;
  const body = ST.floor === "up" ? upArt() : ST.floor === "garden" ? gardenArt() : downArt();
  return glowDefs + body + (NIGHT ? nightWash() + `<g pointer-events="none">${GL.join("")}</g>` : "");
}
