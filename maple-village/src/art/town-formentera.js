// Formentera (boat towns, round 231): the quietest, flattest, most turquoise of the Balearics, nothing like Ronda's
// mountains or the Cinque Terre's cliff harbours. Pale sand and water so clear the boats seem to float in the air;
// cubic whitewashed houses with flat roofs and blue or green shutters; fig trees propped on juniper crutches; pink and
// silver salt pans with flamingos; dry-stone walls, Aleppo pines and twisted sabina junipers; bicycles everywhere.
//   fm_salines (The salt flats)              | fm_mola    (La Mola: cliffs and lighthouse)
//   fm_illetes (Ses Illetes and La Savina) * | fm_village (Sant Francesc)
//   fm_illetes: the long white sand spit running north into the turquoise with water on both sides, Marina's
//               chiringuito under its palm thatch, the dunes and their boardwalk, the rock pools, and La Savina's little
//               harbour in the bottom-left corner with your boat at the quay and the harbour light on the breakwater
//   fm_salines: the salt pans in their grid across the top (pink with white pyramids at harvest, flooded and silvery
//               otherwise), the flamingo pool, the stone salt works, the old salt windmill, the salt wagon
//   fm_village: Sant Francesc: the white fortress church and its square, whitewashed houses, Margalida's bakery, Joan's
//               bike hire with bikes outside, the fig tree on its crutches, the signpost to Cap de Barbaria
//   fm_mola:    the sea and the red cliffs, La Mola lighthouse, the pines, the hippy market (market days only), the old
//               flour windmill
// Seasons (data/formentera.js, the real calendar): flamingos September to April; the market Wednesdays and Sundays May
// to October; the salt harvest July to September; summer busier on the beach; winter greener, the fig trees bare.
import { dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { fmSeason, flamingosOn, marketOn, saltOn } from "../data/formentera.js";

const C = {sand: "#F4EDDC", sand2: "#EAE0C8", sand3: "#DCCDAA", dune: "#EDE2C6", white: "#FBF9F3", wash: "#F3EFE6", wash2: "#E2DCCF", wash3: "#CFC7B6",
  blue: "#3F7FB0", blue2: "#2E6690", green: "#4E8E6C", green2: "#3A7056", turq: "#3EC3C2", turq2: "#7DDCD2", turq3: "#BDF0E8", deep: "#2A93B6", deep2: "#1F6F98",
  seagrass: "#2E7D78", rock: "#B39C82", rock2: "#927D66", stone: "#CDB792", stone2: "#AE9A78", stone3: "#8E7C60", mares: "#DDBF8A", mares2: "#C3A26C",
  wood: "#8A6242", wood2: "#5E4430", thatch: "#CDAA68", thatch2: "#A98848", thatch3: "#E2C687", terra: "#C8714A", terra2: "#A2563A", iron: "#3A3B3D",
  cliff: "#B9573A", cliff2: "#D47A4C", cliff3: "#8E3E2A", earth: "#DDBE98", earth2: "#CBA67E", pink: "#F2B4C0", pink2: "#E996A8", flam: "#F29AA6", flam2: "#E2707F",
  ink: "#2F2B28", bougain: "#C8378A", bougain2: "#E05AA8"};
const SEA = () => fmSeason(dayKey());
const winter = () => SEA() === "winter";
const summer = () => SEA() === "summer";
const flamingos = () => flamingosOn(dayKey());
const market = () => marketOn(dayKey());
const salt = () => saltOn(dayKey());
const month = () => +dayKey().slice(5, 7);
// the scrub and grass by season: dry gold in summer, fresh green after the winter rain
const GRASS = {winter: ["#A9BC78", "#93AA62"], spring: ["#B4BF7E", "#9DAE68"], summer: ["#D2C590", "#C2B37A"], autumn: ["#C8C088", "#B3AE74"]};
const grassCols = () => GRASS[SEA()];
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const f1 = n => (+n).toFixed(1);
const NP = s => `<g pointer-events="none">${s}</g>`;
const swing = (cx, cy, deg, dur, begin = 0) => `<animateTransform attributeName="transform" type="rotate" values="0 ${f1(cx)} ${f1(cy)};${deg} ${f1(cx)} ${f1(cy)};0 ${f1(cx)} ${f1(cy)};${f1(-deg*.8)} ${f1(cx)} ${f1(cy)};0 ${f1(cx)} ${f1(cy)}" dur="${f1(dur)}s" begin="${f1(begin)}s" repeatCount="indefinite"/>`;
const bob = (dy, dur, begin = 0) => `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${dy};0 0" dur="${f1(dur)}s" begin="${f1(begin)}s" repeatCount="indefinite"/>`;
const segs = p => { let d = ""; for (let i = 0; i < p.length - 1; i++) { const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
  d += ` C${f1(b[0] + (c[0] - a[0])/6)} ${f1(b[1] + (c[1] - a[1])/6)} ${f1(c[0] - (e[0] - b[0])/6)} ${f1(c[1] - (e[1] - b[1])/6)} ${f1(c[0])} ${f1(c[1])}`; } return d; };
const smooth = p => `M${f1(p[0][0])} ${f1(p[0][1])}` + segs(p);
const sign = (x, y, w, t, size = 8, fill = "#FFFDF6", col = C.ink) => `<rect x="${f1(x - w/2)}" y="${f1(y - 7)}" width="${w}" height="14" rx="2" fill="${fill}" stroke="var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x}" y="${f1(y + 3)}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="${size}" fill="${col}" pointer-events="none">${t}</text>`;
const shadow = (x, y, rx, ry = rx*.22) => `<ellipse cx="${f1(x)}" cy="${f1(y + 1)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#3E4A40" opacity=".13"/>`;
const foliage = (blobs, cols) => NP(`<g filter="url(#wob)">${blobs.map(([x, y, rx, ry]) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx + 3)}" ry="${f1(ry + 3)}" fill="${cols[0]}"/>`).join("")}${blobs.map(([x, y, rx, ry]) => `<ellipse cx="${f1(x - 2)}" cy="${f1(y - 3)}" rx="${f1(rx*.9)}" ry="${f1(ry*.85)}" fill="${cols[1]}"/>`).join("")}${blobs.map(([x, y, rx, ry], k) => `<ellipse cx="${f1(x - rx*.3)}" cy="${f1(y - ry*.45)}" rx="${f1(rx*.42)}" ry="${f1(ry*.32)}" fill="${cols[2]}" opacity=".85"/>`).join("")}</g>`);

/* ---------- trees and plants ---------- */
// an Aleppo pine: a leaning grey-brown trunk and flat, cloudy layers of dark needles (green all year)
function pine(x, y, s = 1, i = 0, lean = 1){
  const P = v => f1(v), tx = x + 10*s*lean, ty = y - 58*s;
  const trunk = `<path d="M${P(x - 4*s)} ${P(y)} Q${P(x - 2*s + 4*s*lean)} ${P(y - 30*s)} ${P(tx - 2*s)} ${P(ty)} L${P(tx + 2*s)} ${P(ty)} Q${P(x + 2*s + 5*s*lean)} ${P(y - 28*s)} ${P(x + 4*s)} ${P(y)}z" fill="#7A5E4A" stroke="var(--line)" stroke-width=".7"/><path d="M${P(x + 2*s*lean)} ${P(y - 30*s)} q${P(-10*s*lean)} -6 ${P(-18*s*lean)} ${P(-14*s)}" stroke="#7A5E4A" stroke-width="${P(2.4*s)}" fill="none"/>`;
  const blobs = [[tx - 18*s*lean, ty + 8*s, 18*s, 8*s], [tx + 6*s, ty - 4*s, 22*s, 9*s], [tx + 22*s*lean, ty + 6*s, 14*s, 7*s], [tx - 4*s, ty - 14*s, 14*s, 7*s]];
  return NP(shadow(x + 6*s*lean, y, 26*s) + trunk) + `<g pointer-events="none">${swing(x, y, .6, 8 + i % 3, -i)}${foliage(blobs, ["#2F5A34", "#3F6E3E", "#5F8C50"])}</g>`;
}
// a sabina (Phoenician juniper): a low gnarled silver trunk and a flat, dense olive-green crown
function juniper(x, y, s = 1, i = 0){
  const P = v => f1(v);
  const trunk = `<path d="M${P(x - 5*s)} ${P(y)} Q${P(x - 8*s)} ${P(y - 10*s)} ${P(x - 2*s)} ${P(y - 16*s)} Q${P(x + 6*s)} ${P(y - 20*s)} ${P(x + 3*s)} ${P(y - 26*s)} M${P(x + 2*s)} ${P(y)} Q${P(x + 6*s)} ${P(y - 8*s)} ${P(x + 12*s)} ${P(y - 18*s)}" stroke="#A39A8C" stroke-width="${P(3.2*s)}" fill="none" stroke-linecap="round"/>`;
  const blobs = [[x - 10*s, y - 26*s, 14*s, 9*s], [x + 9*s, y - 30*s, 15*s, 10*s], [x, y - 38*s, 12*s, 8*s]];
  return NP(shadow(x, y, 18*s) + trunk) + `<g pointer-events="none">${swing(x, y, .5, 9 + i % 3, -i)}${foliage(blobs, ["#3F5A36", "#56723F", "#76905A"])}</g>`;
}
// a date palm (two stand behind the chiringuito)
function palm(x, y, s = 1, lean = 1, i = 0){
  const tx = x + 26*s*lean, ty = y - 110*s, d = `M${f1(x)} ${f1(y)} Q${f1(x + 2*s*lean)} ${f1(y - 60*s)} ${f1(tx)} ${f1(ty)}`;
  const fr = [[-46, 16], [-40, -6], [-22, -22], [-2, -28], [18, -24], [38, -8], [46, 16], [20, 22], [-20, 20]];
  const frond = ([dx, dy], k) => { const ex = tx + dx*s, ey = ty + dy*s + 12*s, cx = tx + dx*s*.55, cy = ty + Math.min(dy, 0)*s*.9 - 12*s; let lf = "";
    for (let j = 1; j <= 10; j++) { const t = j/11, px = (1 - t)*(1 - t)*tx + 2*(1 - t)*t*cx + t*t*ex, py = (1 - t)*(1 - t)*ty + 2*(1 - t)*t*cy + t*t*ey, L = s*(9 - 6*t);
      lf += `M${f1(px)} ${f1(py)} l${f1(-L*.4)} ${f1(L)} M${f1(px)} ${f1(py)} l${f1(L*.4)} ${f1(L)}`; }
    return `<path d="${lf}" fill="none" stroke="${k % 2 ? "#5E8A3E" : "#4C7A34"}" stroke-width="${f1(1.6*s)}" stroke-linecap="round"/><path d="M${f1(tx)} ${f1(ty)} Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}" fill="none" stroke="#3E6A2E" stroke-width="${f1(1.3*s)}"/>`; };
  return NP(`<g>${swing(x, y, .7, 8 + i % 3, -i)}<path d="${d}" fill="none" stroke="#6E5440" stroke-width="${f1(7.6*s)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#8E7258" stroke-width="${f1(5.6*s)}" stroke-dasharray="${f1(1.2*s)} ${f1(4*s)}"/>
    <g>${swing(tx, ty, 3, 5 + i % 3, -i)}${fr.map(frond).join("")}${[[-3, 5], [3, 6], [0, 2]].map(([dx, dy]) => `<circle cx="${f1(tx + dx*s)}" cy="${f1(ty + dy*s)}" r="${f1(2.6*s)}" fill="#C88A3A"/>`).join("")}</g></g>`);
}
// rosemary, thyme and lentisk: low grey-green mounds (a few blue flowers in winter and spring)
const scrub = (x, y, s = 1, k = 0) => NP(`<g filter="url(#wob)"><ellipse cx="${f1(x)}" cy="${f1(y - 6*s)}" rx="${f1(16*s)}" ry="${f1(9*s)}" fill="${k % 2 ? "#6E8358" : "#7C9064"}"/><ellipse cx="${f1(x - 4*s)}" cy="${f1(y - 9*s)}" rx="${f1(9*s)}" ry="${f1(5*s)}" fill="#97A87C"/></g>`
  + (winter() || SEA() === "spring" ? [-8, -2, 5, 10].map((d, j) => `<circle cx="${f1(x + d*s)}" cy="${f1(y - 8*s - (j % 2)*3*s)}" r="1.3" fill="#8AA4D8"/>`).join("") : ""));
const tuft = (x, y, col) => `<path d="M${x - 4} ${y} q2 -7 4 -1 q2 -8 4 0 q1 -5 3 1" fill="none" stroke="${col}" stroke-width="1.2" pointer-events="none"/>`;
const tufts = (pts, col) => NP(pts.map(([x, y]) => tuft(x, y, col || grassCols()[1])).join(""));
// marram grass on the dunes, with white sea lilies in late summer
const marram = (pts) => NP(pts.map(([x, y], k) => `<path d="M${x} ${y} q-3 -10 -7 -14 M${x} ${y} q0 -12 1 -17 M${x} ${y} q3 -9 8 -13" stroke="${k % 2 ? "#A9A66A" : "#8F9A5A"}" stroke-width="1.2" fill="none"/>`
  + (month() >= 7 && month() <= 9 && k % 3 === 0 ? `<g>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${f1(x + 6 + Math.cos(a*Math.PI/180)*2.2)}" cy="${f1(y - 8 + Math.sin(a*Math.PI/180)*2.2)}" rx="2" ry=".9" transform="rotate(${a} ${f1(x + 6 + Math.cos(a*Math.PI/180)*2.2)} ${f1(y - 8 + Math.sin(a*Math.PI/180)*2.2)})" fill="#FFFFFF"/>`).join("")}</g>` : "")).join(""));
const flowers = pts => winter() ? "" : NP(pts.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="1.7" fill="${SEA() === "spring" ? ["#F2D35E", "#FFFFFF", "#E07A9A", "#B48AD8"][k % 4] : ["#F2D35E", "#FFFFFF"][k % 2]}"/>`).join(""));

/* ---------- weather and light ---------- */
function light(){
  const se = SEA();
  return se === "summer" ? `<rect width="520" height="640" fill="#FFE9A8" opacity=".07" pointer-events="none"/>`
    : se === "autumn" ? `<rect width="520" height="640" fill="#FFD8A0" opacity=".06" pointer-events="none"/>`
    : se === "winter" ? `<rect width="520" height="640" fill="#D6E6EE" opacity=".08" pointer-events="none"/>` : "";
}

/* ---------- ground, water and paths ---------- */
const ground = (col, blobs) => `<rect width="520" height="640" fill="${col}"/><g filter="url(#wash)" opacity=".5" pointer-events="none">${blobs.map(([x, y, rx, ry, c]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join("")}</g>`;
const trail = (d, w, c1, c2) => NP(`<g filter="url(#wob)"><path d="${d}" fill="none" stroke="${c1}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c2}" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/></g>`);
const sandPath = (d, w) => trail(d, w, C.sand3, C.sand2);
const dirt = (d, w) => trail(d, w, "#D2BC98", "#E3D2B2");
const waves = (pts, col = "#FFFFFF", op = .75) => NP(`<g stroke="${col}" stroke-width="1.3" fill="none" opacity="${op}">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -3 10 0 q5 3 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;5 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`);
// sunlight dancing on the clear water: little bright net lines that shimmer
const caustics = (pts) => NP(`<g stroke="#E9FFFB" stroke-width="1" fill="none">${pts.map(([x, y], i) => `<path d="M${x} ${y} q6 -4 12 0 q4 4 10 -1" opacity="0"><animate attributeName="opacity" values="0;.7;0" dur="${f1(3 + (i % 4)*.6)}s" begin="${f1(-i*.7)}s" repeatCount="indefinite"/></path>`).join("")}</g>`);
const courses = (x, y, w, h, col, s = 8, op = .55, brick = 22) => `<path d="${Array.from({length: Math.floor(h/s)}, (_, k) => `M${f1(x)} ${f1(y + (k + 1)*s)} h${f1(w)}` + Array.from({length: Math.ceil(w/brick)}, (_, j) => ` M${f1(x + j*brick + (k % 2)*brick/2)} ${f1(y + k*s)} v${s}`).join("")).join(" ")}" stroke="${col}" stroke-width=".6" opacity="${op}"/>`;
// a dry-stone wall seen from the front: rough grey-gold stones in uneven courses with a row of capstones
function stoneWall(x1, x2, yt, h, seed = 0){
  let st = "", y = yt + 2;
  for (let r = 0; y < yt + h; r++) { let x = x1 - (r % 2)*8, rh = 7 + rnd(seed + r)*3; while (x < x2) { const w = 10 + rnd(seed + r*13 + x)*10;
    st += `<rect x="${f1(x + .8)}" y="${f1(y + .6)}" width="${f1(w - 1.6)}" height="${f1(rh - 1.2)}" rx="2.4" fill="${["#C8B898", "#B8A888", "#D4C6A6", "#A99878"][Math.floor(rnd(seed + x + r)*4)]}"/>`; x += w; } y += rh; }
  return NP(`<clipPath id="fmW${seed}"><rect x="${x1}" y="${yt}" width="${x2 - x1}" height="${h}"/></clipPath><rect x="${x1}" y="${yt}" width="${x2 - x1}" height="${h}" fill="#8E7E62"/><g clip-path="url(#fmW${seed})">${st}</g><path d="M${x1} ${yt + 1} H${x2}" stroke="#7A6A50" stroke-width="2.4" stroke-dasharray="9 2"/>`);
}

/* ---------- houses ---------- */
// a whitewashed cube house seen from the front: soft corners, a flat roof with a low parapet, a little chimney, small
// windows with painted shutters and a painted door
function whiteHouse(x1, x2, yt, yb, o = {}){
  const sh = o.shutter || C.blue, w = x2 - x1, P = v => f1(v);
  const wins = (o.wins || []).map(([wx, wy]) => `<rect class="wglow" x="${P(wx - 6)}" y="${P(wy - 8)}" width="12" height="16" fill="#3E4A52"/><rect x="${P(wx - 14)}" y="${P(wy - 8)}" width="8" height="16" fill="${sh}"/><rect x="${P(wx + 6)}" y="${P(wy - 8)}" width="8" height="16" fill="${sh}"/><path d="M${P(wx - 13)} ${P(wy - 4)} h6 M${P(wx - 13)} ${P(wy)} h6 M${P(wx - 13)} ${P(wy + 4)} h6 M${P(wx + 7)} ${P(wy - 4)} h6 M${P(wx + 7)} ${P(wy)} h6 M${P(wx + 7)} ${P(wy + 4)} h6" stroke="#FFFFFF" stroke-width=".6" opacity=".5"/>`).join("");
  const door = o.door ? `<rect x="${P(o.door - 10)}" y="${P(yb - 30)}" width="20" height="30" rx="2" fill="${o.doorCol || sh}"/><path d="M${P(o.door)} ${P(yb - 30)} v30" stroke="#24323A" stroke-width=".6" opacity=".5"/><circle cx="${P(o.door + 5)}" cy="${P(yb - 14)}" r="1" fill="#E8D8A8"/>` : "";
  const chim = o.chim ? `<path d="M${P(o.chim - 6)} ${P(yt + 1)} v-14 h12 v14z" fill="${C.white}"/><path d="M${P(o.chim - 8)} ${P(yt - 13)} h16 v-3 h-16z" fill="${C.wash2}"/>` : "";
  return sk(`${chim}<path d="M${P(x1)} ${P(yb)} V${P(yt + 3)} Q${P(x1)} ${P(yt)} ${P(x1 + 3)} ${P(yt)} H${P(x2 - 3)} Q${P(x2)} ${P(yt)} ${P(x2)} ${P(yt + 3)} V${P(yb)}z" fill="${C.white}"/><rect x="${P(x1)}" y="${P(yt)}" width="${w}" height="4" fill="${C.wash2}"/><path d="M${P(x2 - 6)} ${P(yt + 4)} V${P(yb)}" stroke="${C.wash2}" stroke-width="5" opacity=".7"/><rect x="${P(x1)}" y="${P(yb - 5)}" width="${w}" height="5" fill="${o.plinth || "#D9D2C2"}"/>${wins}${door}`,
    `<path d="M${P(x1)} ${P(yb)} V${P(yt + 3)} Q${P(x1)} ${P(yt)} ${P(x1 + 3)} ${P(yt)} H${P(x2 - 3)} Q${P(x2)} ${P(yt)} ${P(x2)} ${P(yt + 3)} V${P(yb)}"/>`);
}
// a terracotta pot with a geranium (bare green in winter)
const pot = (x, y, k = 0) => NP(`<path d="M${x - 5} ${y - 9} h10 l-2 9 h-6z" fill="${C.terra}" stroke="var(--line)" stroke-width=".5"/><ellipse cx="${x}" cy="${y - 12}" rx="7" ry="5" fill="#4E8A3E"/>${winter() ? "" : `<circle cx="${x - 3}" cy="${y - 14}" r="2" fill="${k % 2 ? "#E04848" : "#F07AA0"}"/><circle cx="${x + 3}" cy="${y - 13}" r="2" fill="${k % 2 ? "#E04848" : "#F07AA0"}"/>`}`);
// bougainvillea tumbling over a wall (magenta most of the year, sparse in winter)
const bougain = (blobs) => NP(`<g filter="url(#wob)">${blobs.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#4E7A3A"/>`).join("")}${blobs.map(([x, y, rx, ry], k) => Array.from({length: winter() ? 3 : 9}, (_, j) => `<circle cx="${f1(x + (rnd(k*9 + j) - .5)*rx*1.6)}" cy="${f1(y + (rnd(k*5 + j*3) - .5)*ry*1.5)}" r="${f1(2.2 + rnd(j)*1.6)}" fill="${j % 2 ? C.bougain : C.bougain2}"/>`).join("")).join("")}</g>`);

/* ---------- boats, bikes and creatures ---------- */
// your own boat (the same boat as at home: white hull, blue stripe, red flag), with its shadow on the sand below the
// clear water, so it seems to float in the air
const yourBoat = (x, y) => NP(`<ellipse cx="${x + 10}" cy="${y + 16}" rx="44" ry="7" fill="#1E6E78" opacity=".25"/><g>${bob(-1.4, 3.4)}<ellipse cx="${x + 3}" cy="${y + 2}" rx="50" ry="3.4" fill="#FFFFFF" opacity=".5"/>${sk(`<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z" style="fill:#FFFDF6"/><path d="M${x - 36} ${y - 10} h78" style="stroke:#3E6B8C" stroke-width="3"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3" style="fill:#CFE0EE"/><path d="M${x + 30} ${y - 36} v-22 l14 9z" style="fill:#E8566C"/>`,
  `<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3"/><path d="M${x + 30} ${y - 18} v-40 l14 9 l-14 4"/>`)}</g>`);
// a llaüt: the islands' traditional wooden fishing boat, white with a coloured rail and a pointed bow
const llaut = (x, y, col = C.blue, i = 0, s = 1) => NP(`<ellipse cx="${f1(x + 6*s)}" cy="${f1(y + 12*s)}" rx="${f1(30*s)}" ry="${f1(5*s)}" fill="#1E6E78" opacity=".22"/><g>${bob(-1, 3 + i*.5, -i)}<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -10 Q-34 -12 -36 -18 L-28 -12 H26 Q32 -16 34 -20 Q32 -6 22 0 H-22 Q-28 -4 -30 -10z" fill="#FFFDF6" stroke="var(--line)" stroke-width=".8"/><path d="M-28 -11 H28" stroke="${col}" stroke-width="2.4"/><rect x="-6" y="-22" width="14" height="10" rx="1.4" fill="#E9E2D2" stroke="var(--line)" stroke-width=".6"/><path d="M-20 -12 V-28" stroke="${C.wood2}" stroke-width="1.2"/></g></g>`);
// a white yacht at anchor (summer)
const yacht = (x, y, i = 0) => NP(`<ellipse cx="${x + 6}" cy="${y + 12}" rx="30" ry="5" fill="#1E6E78" opacity=".2"/><g>${bob(-1, 3.6 + i*.4, -i)}<path d="M${x - 26} ${y - 8} h56 l-8 9 h-42z" fill="#FFFFFF" stroke="var(--line)" stroke-width=".8"/><path d="M${x} ${y - 8} V${y - 58}" stroke="#7A7A7A" stroke-width="1.2"/><path d="M${x + 2} ${y - 56} L${x + 22} ${y - 12} H${x + 2}z" fill="#FFFFFF" stroke="var(--line)" stroke-width=".6" opacity=".9"/></g>`);
// a bicycle (side on), with a wicker basket at the front
const bike = (x, y, col = C.blue, basket = true) => `<g pointer-events="none"><circle cx="${x - 11}" cy="${y - 7}" r="7" fill="none" stroke="${C.iron}" stroke-width="1.4"/><circle cx="${x + 11}" cy="${y - 7}" r="7" fill="none" stroke="${C.iron}" stroke-width="1.4"/><path d="M${x - 11} ${y - 7} L${x - 3} ${y - 19} H${x + 8} L${x + 11} ${y - 7} M${x - 3} ${y - 19} L${x + 1} ${y - 7} L${x + 8} ${y - 19} M${x - 5} ${y - 22} h5 M${x + 8} ${y - 19} l1 -5 h4" stroke="${col}" stroke-width="1.8" fill="none" stroke-linecap="round"/>${basket ? `<path d="M${x + 9} ${y - 25} h9 l-1 7 h-7z" fill="#C8A06A" stroke="#8A6A3A" stroke-width=".6"/>` : ""}</g>`;
// a flamingo: pink, long legs, an S of a neck; standing on one leg, or with its head down sweeping the water
function flamingo(x, y, s = 1, dir = 1, pose = 0, i = 0){
  const legs = pose === 1 ? `<path d="M0 0 L0 -22 M0 -22 l-5 -6 l4 -3" stroke="${C.flam2}" stroke-width="1.2" fill="none"/>` : `<path d="M-2 0 L-1 -22 M2 0 L1.4 -22" stroke="${C.flam2}" stroke-width="1.2"/>`;
  const body = `<ellipse cx="0" cy="-27" rx="9" ry="5.6" fill="${C.flam}" stroke="var(--line)" stroke-width=".6"/><path d="M-9 -27 q-4 1 -6 3 q4 0 6 -1z" fill="#2B2B2B"/><path d="M-6 -30 q4 -3 10 -1" stroke="${C.flam2}" stroke-width="1.4" fill="none"/>`;
  const neck = pose === 2 ? `<g>${swing(7, -28, 6, 3 + i, -i)}<path d="M6 -29 Q16 -40 14 -24 Q12 -10 9 -6" stroke="${C.flam}" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="9" cy="-5" r="2.4" fill="${C.flam}"/><path d="M9 -3 q-2 3 -5 2" stroke="#2B2B2B" stroke-width="1.6" fill="none"/></g>`
    : `<g>${swing(7, -28, 5, 4 + i, -i)}<path d="M6 -29 Q14 -36 9 -44 Q5 -52 11 -55" stroke="${C.flam}" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="12" cy="-55" r="2.6" fill="${C.flam}"/><path d="M14 -55 q4 1 3 5 q-2 -2 -3 -2z" fill="#2B2B2B"/><circle cx="12" cy="-56" r=".5" fill="#2B2B2B"/></g>`;
  return NP(`<ellipse cx="${f1(x)}" cy="${f1(y + 1)}" rx="${f1(9*s)}" ry="${f1(2*s)}" fill="#E9A0AA" opacity=".35"/><g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})">${legs}${body}${neck}</g>`);
}
// a little blue-green Formentera wall lizard, sunning itself
const lizard = (x, y, rot = 0) => NP(`<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-12 0 Q-6 -2 0 0 Q6 1 9 0 Q6 -2 0 -2.4 Q-6 -2.4 -12 0z" fill="#3C8A7A"/><ellipse cx="4" cy="-1" rx="5" ry="2" fill="#4AA08C"/><circle cx="9.6" cy="-1" r="1.8" fill="#3C8A7A"/><path d="M1 -2 l-2 -3 M6 -2 l2 -3 M1 0 l-2 3 M6 0 l2 3" stroke="#3C8A7A" stroke-width="1"/></g>`);
// a crab in a rock pool, sidling back and forth
const crab = (x, y, i = 0) => NP(`<g><animateTransform attributeName="transform" type="translate" values="0 0;6 0;0 0;-4 0;0 0" dur="${4 + i}s" begin="${-i}s" repeatCount="indefinite"/><g transform="translate(${x} ${y})"><path d="M-4 0 l-5 -3 M-4 2 l-6 1 M-3 3 l-4 4 M4 0 l5 -3 M4 2 l6 1 M3 3 l4 4" stroke="#C0582E" stroke-width="1.1"/><ellipse cx="0" cy="1" rx="4.6" ry="3.4" fill="#D8703A" stroke="var(--line)" stroke-width=".5"/><circle cx="-6" cy="-4" r="1.6" fill="#D8703A"/><circle cx="6" cy="-4" r="1.6" fill="#D8703A"/></g></g>`);
const gullFly = (cx, cy, r, dur, begin = 0) => NP(`<g><animateMotion path="M${cx - r} ${cy} a${r} ${f1(r*.4)} 0 1 0 ${2*r} 0 a${r} ${f1(r*.4)} 0 1 0 ${-2*r} 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><path d="M-9 0 Q-4 -5 0 0 Q4 -5 9 0" fill="none" stroke="#5A646E" stroke-width="1.6" stroke-linecap="round"><animate attributeName="d" values="M-9 0 Q-4 -5 0 0 Q4 -5 9 0;M-9 -2 Q-4 2 0 0 Q4 2 9 -2;M-9 0 Q-4 -5 0 0 Q4 -5 9 0" dur="1.2s" repeatCount="indefinite"/></path></g>`);

/* ---------- landmarks ---------- */
// a windmill: a round whitewashed tower, a wooden cap and lattice sails (turning slowly, or still)
function windmill(cx, yb, s = 1, o = {}){
  const P = v => f1(v), tw = 30*s, th = 92*s, top = yb - th, hx = cx, hy = top + 4*s, R = (o.r || 52)*s, n = o.n || 6;
  const tower = sk(`<path d="M${P(cx - tw)} ${P(yb)} L${P(cx - tw*.74)} ${P(top)} H${P(cx + tw*.74)} L${P(cx + tw)} ${P(yb)}z" fill="${C.white}"/><path d="M${P(cx + tw*.4)} ${P(top)} L${P(cx + tw*.6)} ${P(yb)}" stroke="${C.wash2}" stroke-width="${P(8*s)}" opacity=".6"/><rect x="${P(cx - 7*s)}" y="${P(yb - 22*s)}" width="${P(14*s)}" height="${P(22*s)}" rx="${P(6*s)}" fill="${o.doorCol || C.wood}"/><rect class="wglow" x="${P(cx - 4*s)}" y="${P(top + 22*s)}" width="${P(8*s)}" height="${P(10*s)}" fill="#3E4A52"/><rect x="${P(cx - tw - 2)}" y="${P(yb - 4)}" width="${P(tw*2 + 4)}" height="5" fill="#D9D2C2"/>`,
    `<path d="M${P(cx - tw)} ${P(yb)} L${P(cx - tw*.74)} ${P(top)} H${P(cx + tw*.74)} L${P(cx + tw)} ${P(yb)}"/>`)
    + sk(`<path d="M${P(cx - tw*.86)} ${P(top + 2)} Q${P(cx)} ${P(top - 28*s)} ${P(cx + tw*.86)} ${P(top + 2)}z" fill="${C.wood}"/><path d="M${P(cx - tw*.6)} ${P(top - 4*s)} Q${P(cx)} ${P(top - 18*s)} ${P(cx + tw*.6)} ${P(top - 4*s)}" stroke="${C.wood2}" stroke-width="1" fill="none"/>`, `<path d="M${P(cx - tw*.86)} ${P(top + 2)} Q${P(cx)} ${P(top - 28*s)} ${P(cx + tw*.86)} ${P(top + 2)}z"/>`);
  const sail = k => { const a = k*360/n; return `<g transform="rotate(${f1(a)} ${P(hx)} ${P(hy)})"><path d="M${P(hx)} ${P(hy)} V${P(hy - R)}" stroke="${C.wood2}" stroke-width="${P(2.2*s)}"/>${o.cloth ? `<path d="M${P(hx)} ${P(hy - R*.25)} V${P(hy - R)} L${P(hx + R*.32)} ${P(hy - R*.3)}z" fill="#F6F0E0" stroke="#8A7A5A" stroke-width=".6" opacity=".95"/>`
    : `<path d="M${P(hx + 1)} ${P(hy - R*.25)} h${P(R*.2)} V${P(hy - R)} h${P(-R*.2)}z" fill="none" stroke="${C.wood}" stroke-width="1"/>${[.4, .55, .7, .85].map(t => `<path d="M${P(hx)} ${P(hy - R*t)} h${P(R*.2)}" stroke="${C.wood}" stroke-width=".8"/>`).join("")}`}</g>`; };
  const sails = `<g>${o.turn ? `<animateTransform attributeName="transform" type="rotate" values="0 ${P(hx)} ${P(hy)};360 ${P(hx)} ${P(hy)}" dur="${o.turn}s" repeatCount="indefinite"/>` : ""}${Array.from({length: n}, (_, k) => sail(k)).join("")}${o.cloth ? Array.from({length: n}, (_, k) => { const a = (k*360/n - 90)*Math.PI/180, b = ((k + 1)*360/n - 90)*Math.PI/180; return `<path d="M${P(hx + Math.cos(a)*R*.95)} ${P(hy + Math.sin(a)*R*.95)} L${P(hx + Math.cos(b)*R*.95)} ${P(hy + Math.sin(b)*R*.95)}" stroke="${C.wood2}" stroke-width=".8"/>`; }).join("") : ""}<circle cx="${P(hx)}" cy="${P(hy)}" r="${P(4*s)}" fill="${C.wood2}"/></g>`;
  return NP(shadow(cx, yb, tw*1.3) + tower + sails);
}
// a stall at the hippy market: a striped canvas awning on poles over a trestle of things for sale
function stall(x, y, w, col, goods, i = 0){
  const P = v => f1(v), stripes = Array.from({length: Math.ceil(w/10)}, (_, k) => k % 2 ? `<rect x="${P(x + k*10)}" y="${P(y - 40)}" width="${Math.min(10, w - k*10)}" height="12" fill="#FFF6E6"/>` : "").join("");
  return NP(`<path d="M${P(x + 2)} ${P(y)} V${P(y - 36)} M${P(x + w - 2)} ${P(y)} V${P(y - 36)}" stroke="${C.wood2}" stroke-width="2"/>`
    + sk(`<rect x="${P(x - 4)}" y="${P(y - 40)}" width="${w + 8}" height="12" fill="${col}"/>${stripes}<path d="M${P(x - 4)} ${P(y - 28)} ${Array.from({length: Math.ceil((w + 8)/8)}, (_, k) => `q4 4 8 0`).join(" ")}" fill="${col}"/>`, `<rect x="${P(x - 4)}" y="${P(y - 40)}" width="${w + 8}" height="12"/>`)
    + sk(`<rect x="${P(x)}" y="${P(y - 16)}" width="${w}" height="16" fill="${["#E9D7B4", "#D8C2E4", "#C6E0D4", "#F2D2C0"][i % 4]}"/>`, `<rect x="${P(x)}" y="${P(y - 16)}" width="${w}" height="16"/>`) + goods);
}
// a little signpost for a gate (a juniper-wood post with a painted arrow)
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:#9A8C7A"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 22} h16" style="stroke:${C.blue}" stroke-width="2"/>`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
// the tap area over your boat (the drawing itself ignores taps): the boat was hard to tap to sail home
const boatHit = (x, y) => `<rect x="${x - 50}" y="${y - 66}" width="104" height="76" fill="transparent" pointer-events="all"/>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;

/* ---------- fm_illetes: Ses Illetes and La Savina ---------- */
function illetesScreen(){
  const w = winter(), su = summer();
  // the sea: deep blue far out, turquoise over the sand, dark meadows of seagrass, and a pale band of shallows along
  // every shore; then the land on top (the spit, the beach, the dunes) with a white line of foam at its edge
  const landD = smooth([[252, -12], [254, 60], [248, 140], [254, 200], [242, 232], [204, 242], [174, 228], [168, 160], [162, 90], [150, 48], [134, 34], [116, 46], [104, 100], [100, 170], [96, 224], [72, 238], [48, 248], [44, 320], [48, 400], [44, 470], [44, 504]])
    + " L214 504 L214 650 L532 650 L532 -12z";
  const sea = NP(`<defs><linearGradient id="fmSeaG" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${C.deep2}"/><stop offset=".28" stop-color="${C.deep}"/><stop offset=".55" stop-color="${C.turq}"/><stop offset="1" stop-color="${C.turq}"/></linearGradient></defs>
    <rect x="-10" y="-10" width="270" height="660" fill="url(#fmSeaG)"/>
    <g filter="url(#wash)" opacity=".5">${[[40, 70, 34, 22], [214, 70, 26, 34], [22, 170, 20, 30], [60, 590, 40, 20], [180, 610, 26, 14]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.seagrass}"/>`).join("")}</g>`
    + `<path d="${landD}" fill="none" stroke="${C.turq2}" stroke-width="44" opacity=".85"/><path d="${landD}" fill="none" stroke="${C.turq3}" stroke-width="18" opacity=".9"/>`
    + caustics([[30, 120], [70, 200], [200, 40], [214, 150], [140, 600], [30, 560], [20, 300], [16, 440], [190, 200]])
    + waves([[20, 30], [60, 110], [190, 110], [220, 20], [24, 380], [100, 630]], "#FFFFFF", .6));
  const land = NP(`<path d="${landD}" fill="${C.sand}" stroke="#FFFFFF" stroke-width="3" stroke-opacity=".85"/><g filter="url(#wash)" opacity=".55">${[[330, 400, 160, 90, C.sand2], [134, 140, 26, 70, "#FBF7EC"], [380, 560, 120, 40, C.sand2], [100, 440, 50, 60, "#FAF5E8"]].map(([x, y, rx, ry, c]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join("")}</g>`);
  // the dunes: soft mounds of sand held together by marram grass, sea lilies and little junipers, the wooden
  // boardwalk on posts running north over them, rope rails either side
  const dunes = NP(`<g filter="url(#wob)">${[[300, 60, 70, 46], [390, 40, 60, 40], [500, 80, 50, 60], [320, 110, 60, 20], [400, 110, 40, 18]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.dune}"/><ellipse cx="${x - 10}" cy="${y - 8}" rx="${f1(rx*.6)}" ry="${f1(ry*.4)}" fill="#F8F2E2"/>`).join("")}</g>`)
    + marram([[270, 40], [300, 90], [340, 30], [370, 100], [410, 70], [292, 120], [494, 40], [506, 120], [488, 160], [262, 100], [416, 120], [350, 66]])
    + juniper(330, 70, .8, 1) + juniper(400, 118, .7, 2) + juniper(498, 110, .9, 3) + (w ? "" : tufts([[280, 70], [380, 50]], "#9AA25E"));
  const board = NP(sk(`<rect x="436" y="-4" width="32" height="182" fill="#C9A87A"/>${Array.from({length: 23}, (_, k) => `<path d="M436 ${k*8 + 2} h32" stroke="#9A7A52" stroke-width="1"/>`).join("")}`, `<path d="M436 -4 V178 M468 -4 V178"/>`)
    + [0, 1, 2, 3, 4, 5].map(k => `<rect x="430" y="${k*30 + 8}" width="4" height="12" fill="${C.wood2}"/><rect x="470" y="${k*30 + 8}" width="4" height="12" fill="${C.wood2}"/>`).join("")
    + `<path d="M432 ${10} ${[1, 2, 3, 4, 5].map(k => `Q432 ${k*30 - 2} 432 ${k*30 + 10}`).join(" ")} M472 10 ${[1, 2, 3, 4, 5].map(k => `Q472 ${k*30 - 2} 472 ${k*30 + 10}`).join(" ")}" stroke="#C8A86A" stroke-width="1.4" fill="none"/>`);
  const dunesPl = place("fmdunes", 452, 150, 26, 9, "The dune boardwalk", dunes + board, "Dune boardwalk", 300, 24, "#F6E3B4");
  // Marina's chiringuito: a shaggy palm-thatch roof on driftwood posts, a reed back wall, the bar counter with stools,
  // lanterns in the rafters, a chalkboard, and two date palms behind it
  const palms = palm(276, 150, .66, -1, 1) + palm(392, 146, .7, 1, 2);
  const shack = NP(sk(`<rect x="272" y="170" width="124" height="58" fill="#D9C49A"/>${Array.from({length: 30}, (_, k) => `<path d="M${274 + k*4} 170 v58" stroke="#BFA676" stroke-width="1.2"/>`).join("")}<rect class="wglow" x="296" y="196" width="30" height="20" fill="#7DCFD0"/><path d="M296 206 h30" stroke="#FFFFFF" stroke-width=".8" opacity=".6"/>`,
    `<rect x="272" y="170" width="124" height="58"/>`)
    + sk(`${[272, 392].map(x => `<rect x="${x}" y="168" width="5" height="62" fill="${C.wood}"/>`).join("")}<rect x="340" y="206" width="54" height="22" fill="#A98A64"/>${Array.from({length: 6}, (_, k) => `<path d="M${342 + k*9} 206 v22" stroke="#8A6A48" stroke-width=".8"/>`).join("")}<rect x="338" y="203" width="58" height="4" fill="${C.wood}"/>`, `<rect x="340" y="206" width="54" height="22"/>`)
    + `<path d="M322 228 v-16 h24 v16" fill="#5E4430"/>${[0, 1, 2, 3, 4].map(k => `<g>${swing(324 + k*5, 212, 4, 3 + k*.3, -k)}<path d="M${324 + k*5} 212 v14" stroke="${["#F2C14E", "#3EC3C2", "#F07A6A", "#FFFFFF", "#3F7FB0"][k]}" stroke-width="1.6" stroke-dasharray="2 1.4"/></g>`).join("")}`
    + sk(`<rect x="280" y="208" width="14" height="18" fill="#2E3A34"/>`, "") + `<path d="M283 213 h8 M283 217 h6 M283 221 h8" stroke="#F1EADB" stroke-width=".8"/>`
    + [350, 366, 382].map(x => `<path d="M${x} 228 v-8 M${x - 4} 220 h8" stroke="${C.wood2}" stroke-width="1.6"/>`).join("")
    + `<g>${[[352, 210, "#E05A3A"], [362, 211, "#F2C14E"], [374, 210, "#7FBF5A"], [386, 211, "#F07AA0"]].map(([x, y, c]) => `<rect x="${x - 2}" y="${y - 6}" width="5" height="7" rx="1" fill="${c}" opacity=".9"/>`).join("")}</g>`);
  const thatchRoof = NP(sk(`<path d="M262 186 L280 140 Q334 128 388 140 L406 186 ${Array.from({length: 18}, (_, k) => `L${f1(406 - (k + .5)*8)} ${k % 2 ? 192 : 186}`).join(" ")} L262 186z" fill="${C.thatch}"/>${Array.from({length: 26}, (_, k) => `<path d="M${270 + k*5.4} ${f1(186 + (k % 3))} L${f1(282 + k*4.6)} ${f1(142 - Math.sin(k/8)*4)}" stroke="${k % 2 ? C.thatch2 : C.thatch3}" stroke-width="1.4"/>`).join("")}<path d="M278 146 Q334 132 390 146" stroke="${C.thatch2}" stroke-width="3" fill="none"/>`,
    `<path d="M262 186 L280 140 Q334 128 388 140 L406 186"/>`)
    + [290, 316, 352, 378].map((x, k) => `<g>${swing(x, 186, 5, 3 + k*.4, -k)}<path d="M${x} 186 v6" stroke="${C.iron}" stroke-width=".7"/><circle cx="${x}" cy="${197}" r="8" fill="#FFD27A" opacity=".18"/><path d="M${x - 4} 192 h8 l-1 9 h-6z" fill="#F2C56A" stroke="var(--line)" stroke-width=".6"/></g>`).join("")
    + `<rect x="300" y="150" width="68" height="16" rx="3" fill="#FFFDF6" stroke="var(--line)" stroke-width=".8"/><text x="334" y="161.4" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8.4" fill="${C.blue2}">Ca na Marina</text>`);
  const deck = NP(sk(`<rect x="264" y="226" width="140" height="8" fill="#C9A87A"/>`, `<path d="M264 234 H404"/>`) + `<path d="M268 230 h132" stroke="#9A7A52" stroke-width=".8"/>`);
  const chir = place("fmchiringuito", 334, 252, 28, 9, "Marina's chiringuito", palms + shack + thatchRoof + deck, "Chiringuito", 334, 272, "#BFE8E2");
  // the clear water by the spit: a snorkel and fins left on the sand, a snorkeller's float bobbing out over the seagrass
  const snorkArt = NP(`<g>${bob(-1.6, 3)}<circle cx="212" cy="150" r="5" fill="#F2783A" stroke="var(--line)" stroke-width=".6"/><path d="M212 145 v-6" stroke="${C.iron}" stroke-width="1"/><path d="M212 139 l6 2 l-6 2z" fill="#F2C14E"/></g>`
    + `<path d="M196 234 l8 -4 l3 3 l-8 4z M204 238 l8 -4 l3 3 l-8 4z" fill="#3F7FB0" stroke="var(--line)" stroke-width=".5"/><path d="M218 228 q4 -6 8 -2 v8" stroke="#F2C14E" stroke-width="2" fill="none"/>`);
  const snork = place("fmsnorkel", 206, 252, 24, 9, "The clear water over the seagrass", snorkArt, "Clear water", 210, 186, "#BFE8E2");
  // boats at anchor in the clear water, floating on their own shadows (more of them in summer)
  const boats = llaut(214, 100, C.green, 1, .8) + (su ? yacht(60, 150, 0) + llaut(36, 60, C.blue, 3, .7) : w ? "" : yacht(50, 140, 1));
  // the rock pools at the end of the west beach: warm grey-brown rocks with shallow pools, crabs and an anemone
  const rocksArt = NP(sk(`<g filter="url(#wob)">${[[62, 300, 24, 18], [92, 292, 20, 14], [78, 330, 30, 14], [52, 330, 14, 10], [104, 324, 12, 10]].map(([x, y, rx, ry], k) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${k % 2 ? C.rock2 : C.rock}"/>`).join("")}</g>`, "")
    + `<ellipse cx="66" cy="304" rx="12" ry="6" fill="${C.turq2}"/><ellipse cx="88" cy="326" rx="10" ry="5" fill="${C.turq2}"/><ellipse cx="64" cy="303" rx="6" ry="2.4" fill="${C.turq3}"/><circle cx="92" cy="327" r="2.4" fill="#D0506A"/>`)
    + crab(66, 306, 0) + crab(86, 328, 2);
  const pools = place("fmcrabs", 126, 326, 24, 9, "The rock pools and their little crabs", rocksArt, "Rock pools", 82, 270, "#F2C9B4");
  // La Savina's little harbour: the stone quay with bollards, your boat tied up, a llaüt, and the breakwater with the
  // little harbour light at its tip
  const quay = NP(sk(`<rect x="40" y="500" width="204" height="20" fill="${C.stone}"/>${courses(40, 500, 204, 20, C.stone3, 10, .5, 26)}<rect x="214" y="500" width="30" height="150" fill="${C.stone}"/>${courses(214, 500, 30, 150, C.stone3, 14, .5, 15)}`,
    `<path d="M40 520 H214 V650 M244 500 V650 M40 500 V520"/>`) + [70, 120, 176].map(x => `<rect x="${x - 4}" y="502" width="8" height="8" rx="2" fill="${C.iron}"/>`).join("")
    + `<path d="M120 508 q-6 30 -26 74" stroke="#C8A86A" stroke-width="1.2" fill="none"/>`);
  const harbour = quay + yourBoat(84, 600) + llaut(170, 612, C.blue, 2, .8) + waves([[30, 540], [150, 560], [30, 624]]);
  const boat = place("fmboat", 130, 500, 30, 10, "Your boat at La Savina's quay", boatHit(84, 600), "Your boat", 168, 560, "#BFE8E2");
  const lightArt = NP(sk(`<path d="M222 606 L224 566 H234 L236 606z" fill="${C.white}"/><rect x="221" y="580" width="16" height="7" fill="#3E9A5A"/><rect x="223" y="554" width="12" height="12" fill="#D8F0E0"/><path d="M221 554 L229 546 L237 554z" fill="#3E9A5A"/><rect x="219" y="604" width="20" height="5" fill="#D9D2C2"/>`,
    `<path d="M222 606 L224 566 H234 L236 606z M221 554 L229 546 L237 554z"/><rect x="223" y="554" width="12" height="12"/>`)
    + `<circle cx="229" cy="560" r="10" fill="#7AF0A0" opacity=".25"><animate attributeName="opacity" values=".05;.45;.05" dur="3s" repeatCount="indefinite"/></circle>`);
  const hlight = place("fmharbourlight", 272, 556, 24, 9, "The little harbour light", lightArt, "Harbour light", 300, 522, "#F6E3B4");
  // the La Savina houses in the bottom-right corner: white cubes, blue and green shutters, a bike leaning outside
  const savina = whiteHouse(300, 370, 572, 646, {wins: [[334, 596]], chim: 316}) + whiteHouse(376, 448, 562, 646, {wins: [[396, 590], [430, 590]], shutter: C.green})
    + whiteHouse(454, 524, 576, 646, {wins: [[488, 600]], chim: 506}) + NP(sign(412, 620, 58, "LA SAVINA", 7.4, "#FFFDF6", C.blue2) + bike(352, 634, C.green) + pot(452, 640, 1) + pot(374, 640));
  // the junipers along the east edge
  const east = juniper(500, 236, 1, 4) + juniper(492, 312, .9, 5) + juniper(506, 384, .9, 6) + scrub(486, 270, .8) + scrub(500, 350, .7, 1);
  // the sandy tracks: up from the quay, east to Sant Francesc, to the chiringuito and the boardwalk
  const paths = sandPath("M190 500 Q300 470 530 436 M260 480 Q290 360 334 252 M300 390 Q400 300 452 176 M260 470 Q200 380 126 326 M250 430 Q230 330 206 252", 38);
  // summer: towels on the sand and a beach ball; a few sea-lily tufts along the beach; footprints
  // winter: the beach quieter, banks of dried seagrass washed up along the shore, the scrub behind it greener
  const wint = w ? NP(`<g filter="url(#wash)" opacity=".45">${[[360, 360, 110, 60], [220, 470, 70, 30], [440, 520, 60, 30]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#B9C890"/>`).join("")}</g>`
    + `<g stroke="#8A6E4E" stroke-width="3" stroke-linecap="round" opacity=".55" fill="none"><path d="M60 360 q4 30 -2 60 M58 440 q4 20 0 40 M106 120 q-3 30 -2 60 M166 120 q3 30 2 50"/></g>`) : "";
  const beach = wint + (su ? NP(`<rect x="122" y="104" width="22" height="12" rx="2" fill="#F07A6A" transform="rotate(-12 133 110)"/><rect x="128" y="180" width="22" height="12" rx="2" fill="#3F7FB0" transform="rotate(8 139 186)"/><path d="M132 186 h14 M132 190 h14" stroke="#FFFFFF" stroke-width="1"/><rect x="62" y="420" width="12" height="22" rx="2" fill="#F2C14E"/><circle cx="160" cy="430" r="5" fill="#FFFFFF" stroke="var(--line)" stroke-width=".6"/><path d="M155 430 h10 M160 425 v10" stroke="#E05A3A" stroke-width="1.6"/>`) : "")
    + marram([[120, 70], [146, 120], [116, 210], [60, 380], [70, 470], [200, 470]]) + NP(Array.from({length: 7}, (_, k) => `<ellipse cx="${f1(140 - k*2)}" cy="${f1(80 + k*18)}" rx="1.6" ry="2.4" fill="${C.sand3}" opacity=".7"/>`).join(""));
  return sea + land + paths + beach + boats + dunesPl + chir + snork + pools + harbour + boat + hlight + savina + east + gullFly(130, 330, 80, 20) + gullFly(380, 60, 50, 16, -6) + light()
    + gate("fmToSalines", 452, 40, "Salt flats", 392, 62, "North along the boardwalk to the salt flats", "#F2C9D2")
    + gate("fmToVillage", 500, 436, "Sant Francesc", 446, 474, "East along the road to Sant Francesc");
}

/* ---------- fm_salines: the salt flats ---------- */
function salinesScreen(){
  const w = winter(), se = SEA(), sl = salt(), fl = flamingos(), [gr, gr2] = grassCols();
  const base = ground("#E6DCC6", [[260, 420, 200, 110, "#DDD1B6"], [420, 500, 100, 50, gr], [200, 560, 120, 50, gr]]);
  // the salt pans: a grid of shallow pools between low earth banks; pink with a white crust and raked into pyramids at
  // the harvest, flooded and silvery with the sky in them the rest of the year
  const rows = [[22, 68, [0, 70, 150, 236, 318, 400, 524]], [72, 134, [0, 96, 214, 330, 430, 524]], [138, 198, [0, 130, 250, 360, 524]], [202, 244, [0, 80, 190, 300, 410, 524]]];
  const pinks = ["#F2B6C1", "#EEA8B6", "#F6C6CE", "#E9BAC2"], silvers = ["#C4D6DE", "#B6CCD6", "#D0DEE4", "#ACC4CF"];
  const pans = rows.map(([y1, y2, xs], r) => xs.slice(0, -1).map((x, k) => { const x2 = xs[k + 1], i = r*7 + k, col = (sl ? pinks : silvers)[i % 4];
    const crust = sl ? `<g opacity=".8">${Array.from({length: 3}, (_, j) => `<ellipse cx="${f1(x + 14 + rnd(i*5 + j)*(x2 - x - 28))}" cy="${f1(y1 + 10 + rnd(i*7 + j)*(y2 - y1 - 20))}" rx="${f1(5 + rnd(j + i)*7)}" ry="${f1(2 + rnd(j*2 + i)*1.6)}" fill="#FFFFFF"/>`).join("")}</g>`
      : `<path d="M${x + 14} ${f1(y1 + 18 + rnd(i)*20)} h${f1(20 + rnd(i*3)*30)} M${f1(x + 30 + rnd(i*2)*20)} ${f1(y1 + 40 + rnd(i*4)*16)} h${f1(16 + rnd(i*5)*20)}" stroke="#FFFFFF" stroke-width="1.4" opacity=".7"/>`;
    return `<rect x="${x + 3}" y="${y1 + 3}" width="${x2 - x - 6}" height="${y2 - y1 - 6}" rx="5" fill="${col}"/><ellipse cx="${f1(x + (x2 - x)*.35)}" cy="${f1(y1 + (y2 - y1)*.35)}" rx="${f1((x2 - x)*.3)}" ry="${f1((y2 - y1)*.22)}" fill="#FFFFFF" opacity="${sl ? .12 : .22}"/>${crust}`; }).join("")).join("");
  const pyramid = (x, y, s = 1) => `<path d="M${f1(x - 12*s)} ${y} L${x} ${f1(y - 16*s)} L${f1(x + 12*s)} ${y}z" fill="#FFFFFF" stroke="#C8C8D0" stroke-width=".8"/><path d="M${x} ${f1(y - 16*s)} L${f1(x + 12*s)} ${y} H${f1(x + 3*s)}z" fill="#E4E6EC"/>`;
  const harvest = sl ? NP([[60, 72], [200, 72], [380, 72], [480, 72], [110, 138], [280, 138], [450, 138], [60, 202], [230, 202], [420, 202], [40, 248], [140, 248], [350, 248]].map(([x, y], k) => pyramid(x, y, k % 3 ? 1.4 : 1.1)).join("")
    + `<path d="M196 238 l-6 -20 M186 214 h10" stroke="${C.wood}" stroke-width="1.6"/><path d="M200 246 h20 l-2 -8 h-16z" fill="#7A7A7A"/><circle cx="222" cy="246" r="3" fill="${C.iron}"/><path d="M202 238 q8 -6 16 0z" fill="#FFFFFF"/>`) : "";
  const panArt = NP(`<rect x="-4" y="0" width="528" height="252" fill="#D4C4A0"/><rect x="-4" y="0" width="528" height="14" fill="#D6E8EE"/><g filter="url(#wob)">${Array.from({length: 18}, (_, k) => `<ellipse cx="${f1(k*31 + rnd(k)*12)}" cy="${f1(15 + rnd(k*3)*3)}" rx="${f1(14 + rnd(k)*8)}" ry="5" fill="${k % 2 ? "#3F6E3E" : "#4F7E46"}"/>`).join("")}</g><g filter="url(#wob)">${pans}</g><rect x="-4" y="242" width="528" height="10" fill="#BBA67E"/>${courses(-4, 244, 528, 8, "#8E7C60", 8, .4, 18)}`
    + caustics([[40, 40], [260, 30], [470, 50], [100, 130], [300, 120], [460, 130], [40, 200], [250, 200], [460, 204]]))
    + harvest + (sl ? "" : gullFly(250, 120, 90, 24));
  const pansPl = place("fmpans", 250, 268, 28, 9, sl ? "The salt pans at the harvest" : "The salt pans", panArt, sl ? "Salt harvest" : "Salt pans", 250, 126, "#F6E3B4");
  // the flamingo pool: a lagoon of shallow salty water ringed with glasswort (green in summer, red in autumn and
  // winter); the flamingos wading from September to April
  const poolD = "M-10 252 H120 Q150 262 152 320 Q156 400 140 440 Q120 470 60 468 Q20 466 -10 470z";
  const glass = {summer: "#7A9A4A", spring: "#8AA650", autumn: "#B4484A", winter: "#9A3E54"}[se];
  const pool = NP(sk(`<path d="${poolD}" fill="${fl ? "#E8C4C8" : "#BFD4DA"}"/>`, `<path d="${poolD}"/>`) + `<path d="M0 300 Q60 290 120 310 M10 380 Q70 370 130 390 M0 430 Q50 420 110 436" stroke="#FFFFFF" stroke-width="1.4" fill="none" opacity=".6"/>`
    + `<g filter="url(#wob)">${[[120, 258], [140, 282], [150, 320], [153, 360], [150, 400], [140, 436], [112, 462], [74, 468], [34, 468], [6, 466]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="${k % 2 ? 11 : 9}" ry="5" fill="${glass}" opacity=".9"/>`).join("")}</g>`)
    + (fl ? flamingo(40, 320, 1, 1, 1, 0) + flamingo(76, 334, .95, -1, 2, 1) + flamingo(104, 300, .9, 1, 0, 2) + flamingo(56, 396, 1, -1, 0, 3) + flamingo(96, 410, .9, 1, 2, 4) + flamingo(30, 440, .85, 1, 1, 5)
      : NP(`<path d="M70 360 l6 -14 l6 14" stroke="#7A8A90" stroke-width="1" fill="none" opacity=".4"/>`) + gullFly(70, 360, 40, 14, -3));
  const flam = place("fmflamingos", 172, 380, 26, 9, fl ? "The flamingos on the pool" : "The flamingo pool (the flamingos come back in September)", pool, fl ? "Flamingos" : "Flamingo pool", 70, 266, "#F2C9D2");
  // the old salt windmill: a round white tower with still lattice sails, a little cracked
  const millArt = windmill(66, 616, .9, {n: 4, r: 56}) + scrub(118, 612, .8, 1) + scrub(20, 606, .7);
  const mill = place("fmwindmill", 152, 560, 24, 9, "The old salt windmill", millArt, "Salt windmill", 168, 500, "#F6E3B4");
  // the salt works: an old store of golden sandstone blocks, a terracotta roof, a heavy wooden door, sacks of salt
  // stacked outside and a wooden rake leaning by the step
  const works = NP(sk(`<rect x="356" y="316" width="164" height="76" fill="${C.mares}"/>${courses(356, 316, 164, 76, C.mares2, 12, .7, 30)}<path d="M414 392 V364 Q414 348 430 348 Q446 348 446 364 V392z" fill="${C.wood}"/><path d="M430 348 V392" stroke="${C.wood2}" stroke-width="1"/><path d="M418 362 h24 M418 376 h24" stroke="${C.wood2}" stroke-width=".8"/><rect class="wglow" x="372" y="336" width="16" height="16" fill="#3E4A52"/><rect class="wglow" x="480" y="336" width="16" height="16" fill="#3E4A52"/>`,
    `<rect x="356" y="316" width="164" height="76"/><path d="M414 392 V364 Q414 348 430 348 Q446 348 446 364 V392"/>`)
    + sk(`<path d="M348 318 L376 284 H508 L528 318z" fill="${C.terra}"/>${Array.from({length: 18}, (_, k) => `<path d="M${352 + k*10} 318 L${f1(378 + k*7.4)} 286" stroke="${C.terra2}" stroke-width="1.2"/>`).join("")}`, `<path d="M348 318 L376 284 H508 L528 318z"/>`)
    + `<rect x="398" y="296" width="64" height="16" rx="2" fill="#FFFDF6" stroke="var(--line)" stroke-width=".8"/><text x="430" y="307.4" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${C.ink}">SAL · SALT</text>`
    + sk([[362, 378], [380, 378], [371, 366], [470, 378], [488, 378]].map(([x, y]) => `<rect x="${x}" y="${y}" width="17" height="14" rx="4" fill="#F4EFE2"/>`).join(""), "") + [[370, 386], [388, 386], [478, 386], [496, 386]].map(([x, y]) => `<path d="M${x - 4} ${y - 2} h8" stroke="${C.blue}" stroke-width="1"/>`).join("")
    + `<path d="M404 392 l8 -40 M406 352 l10 2" stroke="${C.wood}" stroke-width="2"/>`);
  const worksPl = place("fmsaltworks", 430, 408, 28, 9, "The salt works shop", works, "Salt works", 430, 428, "#F2C9D2");
  // the bottom-right corner: an old salt wagon on its rails, pines behind
  const corner = pine(486, 572, 1, 1, -1) + pine(410, 600, .8, 2) + NP(`<path d="M360 626 H524 M360 632 H524" stroke="#6A5A4A" stroke-width="1.6"/>${Array.from({length: 9}, (_, k) => `<rect x="${364 + k*18}" y="624" width="4" height="10" fill="${C.wood2}"/>`).join("")}`)
    + NP(sk(`<path d="M424 620 L418 598 H470 L464 620z" fill="#8A6A4A"/><circle cx="430" cy="622" r="5" fill="${C.iron}"/><circle cx="458" cy="622" r="5" fill="${C.iron}"/>`, `<path d="M424 620 L418 598 H470 L464 620z"/>`) + (sl ? `<path d="M420 598 Q444 584 468 598z" fill="#FFFFFF" stroke="#C8C8D0" stroke-width=".6"/>` : ""))
    + scrub(380, 560, .9) + scrub(500, 640, .8, 1);
  const paths = dirt("M260 650 Q256 450 250 268 M252 420 Q350 420 430 408 M330 418 Q430 460 530 470 M252 360 Q210 372 172 380 M254 500 Q200 540 152 560", 36);
  const bits = tufts([[200, 300], [320, 300], [190, 520], [330, 520], [300, 360], [210, 440]]) + flowers([[214, 310], [306, 350], [200, 470], [320, 470]]) + NP(lizard(332, 512, -10));
  return base + paths + pansPl + flam + mill + worksPl + corner + bits + light()
    + gate("fmToIlletes", 260, 612, "Ses Illetes", 330, 620, "South along the boardwalk to Ses Illetes", "#BFE8E2")
    + gate("fmToMola", 500, 470, "La Mola", 456, 506, "East along the Green Route to La Mola", "#F6E3B4");
}

/* ---------- fm_village: Sant Francesc ---------- */
function villageScreen(){
  const w = winter(), se = SEA(), [gr, gr2] = grassCols(), m = month();
  const base = ground(gr, [[260, 420, 160, 120, gr2], [80, 420, 80, 60, "#C9BA90"]]);
  // the square: pale flagstones in front of the church, the road north and the lane west
  const square = NP(`<path d="M160 -10 H262 V230 H474 V430 Q380 470 300 450 Q200 470 160 440 Q120 444 -10 446 V420 Q120 414 160 400z" fill="#EDE5D2"/>`
    + `<g opacity=".4" stroke="#C9BCA2" stroke-width=".8">${Array.from({length: 12}, (_, k) => `<path d="M160 ${244 + k*16} H474"/>`).join("")}${Array.from({length: 14}, (_, k) => `<path d="M${168 + k*22} 236 v200"/>`).join("")}${Array.from({length: 13}, (_, k) => `<path d="M166 ${k*18} H256"/>`).join("")}</g>`);
  // the houses top left: whitewashed cubes in two rows, blue and green shutters, a bougainvillea over a door
  const houses = whiteHouse(-4, 86, 22, 84, {wins: [[40, 52]], chim: 70}) + whiteHouse(92, 160, 30, 92, {wins: [[126, 58]], shutter: C.green})
    + whiteHouse(-4, 72, 116, 202, {wins: [[34, 146]], door: 34, doorCol: C.blue}) + whiteHouse(78, 160, 124, 206, {wins: [[100, 152], [140, 152]], door: 120, shutter: C.green, doorCol: C.green, chim: 146})
    + bougain([[86, 132, 16, 12], [76, 150, 8, 14], [164, 196, 10, 10]]) + pot(14, 208) + pot(56, 208, 1) + NP(bike(92, 212, C.blue));
  // the church of Sant Francesc Xavier: a white fortress of a church, thick buttressed walls, hardly a window, a bell
  // gable with one bell, a heavy arched door, and an old cannon on the square
  const church = NP(sk(`<path d="M266 222 L276 64 H286 V222z" fill="${C.wash2}"/><path d="M470 222 L460 64 H450 V222z" fill="${C.wash2}"/><rect x="284" y="50" width="168" height="172" fill="${C.white}"/><rect x="284" y="50" width="168" height="6" fill="${C.wash2}"/>
    <path d="M346 50 V22 Q366 4 386 22 V50z" fill="${C.white}"/><path d="M356 44 V30 Q366 20 376 30 V44z" fill="#4A5A64"/><path d="M430 56 V222" stroke="${C.wash2}" stroke-width="10" opacity=".6"/>
    <path d="M346 222 V184 Q346 164 366 164 Q386 164 386 184 V222z" fill="${C.wood}"/><path d="M366 164 V222 M352 196 h28" stroke="${C.wood2}" stroke-width="1"/><path d="M340 222 V182 Q340 158 366 158 Q392 158 392 182 V222" fill="none" stroke="${C.wash3}" stroke-width="2.4"/>
    <circle class="wglow" cx="366" cy="110" r="9" fill="#3E4A52"/><rect class="wglow" x="306" y="84" width="6" height="18" rx="3" fill="#3E4A52"/><rect class="wglow" x="424" y="84" width="6" height="18" rx="3" fill="#3E4A52"/><rect x="280" y="216" width="176" height="6" fill="#D9D2C2"/>`,
    `<path d="M266 222 L276 64 H286 M470 222 L460 64 H450"/><rect x="284" y="50" width="168" height="172"/><path d="M346 50 V22 Q366 4 386 22 V50 M346 222 V184 Q346 164 366 164 Q386 164 386 184 V222"/>`)
    + `<g>${swing(366, 30, 6, 4)}<path d="M366 30 v2" stroke="${C.iron}" stroke-width="1"/><path d="M360 42 Q360 32 366 32 Q372 32 372 42z" fill="#B8903A" stroke="var(--line)" stroke-width=".6"/></g><path d="M366 4 v-4 M363 -2 h6" stroke="${C.iron}" stroke-width="1.2"/>`
    + `<path d="M294 214 h22 l4 -4" stroke="#3A3B3D" stroke-width="4" stroke-linecap="round"/><circle cx="298" cy="216" r="4" fill="#5A4A3A"/><circle cx="312" cy="216" r="4" fill="#5A4A3A"/>` + pot(334, 224, 1) + pot(398, 224));
  const churchPl = place("fmchurch", 366, 240, 28, 9, "The fortress church of Sant Francesc", church, "The church", 366, 150, "#F6E3B4");
  // the pines top right and a juniper on the square
  const trees = pine(500, 120, 1, 1, -1) + pine(500, 236, .9, 2, -1) + juniper(486, 60, .8, 3);
  // Margalida's bakery: a white house, a green door, a sign, a window of bread, a bench with a basket
  const bakeArt = whiteHouse(-4, 150, 258, 352, {door: 84, shutter: C.green, doorCol: C.green, chim: 126, wins: [[130, 300]]})
    + NP(sk(`<rect class="wglow" x="14" y="292" width="44" height="34" fill="#F6E6C2"/><path d="M14 314 h44" stroke="#C8A86A" stroke-width="2"/>`, `<rect x="14" y="292" width="44" height="34"/>`)
      + `<ellipse cx="26" cy="308" rx="7" ry="4" fill="#C8873A"/><ellipse cx="44" cy="308" rx="8" ry="4.4" fill="#D89A4A"/><circle cx="24" cy="321" r="4" fill="#E8C47A"/><circle cx="36" cy="321" r="4" fill="#E8C47A"/><circle cx="48" cy="321" r="4" fill="#D8A060"/>`
      + `<rect x="56" y="268" width="56" height="16" rx="2" fill="#FFFDF6" stroke="var(--line)" stroke-width=".8"/><text x="84" y="279.4" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8.4" fill="${C.green2}">FORN · bakery</text>`
      + `<path d="M62 290 h44 l-4 8 h-36z" fill="${C.green}"/><path d="M66 298 ${[0, 1, 2, 3, 4].map(() => "q4 3 8 0").join(" ")}" fill="${C.green}"/>`) + pot(112, 352) + pot(58, 352, 1);
  const bakery = place("fmbakery", 84, 368, 28, 9, "Margalida's bakery", bakeArt, "Bakery", 84, 388, "#F2C9B4");
  // Joan's bike hire: a white shop, a blue door and sign, a row of hire bikes with baskets out front, helmets on hooks
  const bikeArt = whiteHouse(356, 524, 300, 396, {door: 470, doorCol: C.blue, wins: [[396, 340]], chim: 506})
    + NP(`<rect x="384" y="306" width="104" height="16" rx="2" fill="${C.blue}" stroke="var(--line)" stroke-width=".8"/><text x="436" y="317.6" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8.4" fill="#FFFDF6">BICIS · bike hire</text>`
      + [[424, 348, "#F2C14E"], [436, 352, "#F07A6A"], [448, 348, C.turq]].map(([x, y, c]) => `<path d="M${x - 5} ${y} q5 -8 10 0z" fill="${c}" stroke="var(--line)" stroke-width=".5"/>`).join("")
      + `<path d="M366 404 H456" stroke="#8A8A8A" stroke-width="1.4"/>` + [[378, C.blue], [400, C.green], [422, "#E05A3A"], [444, C.blue]].map(([x, c]) => bike(x, 410, c)).join(""));
  const bikes = place("fmbikes", 470, 426, 28, 9, "Joan's bike hire", bikeArt, "Bike hire", 470, 446, "#BFE8E2");
  // the fig tree on its crutches: a low grey trunk, huge spreading branches propped on a ring of forked juniper poles,
  // big lobed leaves (bare in winter, figs at the end of summer)
  const props = [[24, 540], [52, 502], [102, 494], [146, 510], [166, 552], [36, 590], [130, 596]];
  const figBranches = `<path d="M84 612 Q80 580 88 560 M88 560 Q60 548 30 538 M88 560 Q70 520 52 500 M88 560 Q100 520 104 492 M88 560 Q120 530 146 508 M88 560 Q130 556 166 550 M88 566 Q60 584 38 588 M88 566 Q110 590 128 594" stroke="#8E8676" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M84 612 Q80 580 88 560" stroke="#A0988A" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  const poles = props.map(([x, y]) => `<path d="M${x} ${y + 34} V${y} M${x - 4} ${y - 5} L${x} ${y} L${x + 4} ${y - 5}" stroke="#7A6450" stroke-width="2.6" fill="none" stroke-linecap="round"/>`).join("");
  const figLeaves = w ? "" : `<g filter="url(#wob)">${Array.from({length: 26}, (_, k) => { const a = rnd(k*3.1)*Math.PI*2, r = 20 + rnd(k*1.7)*60, x = 92 + Math.cos(a)*r*1.1, y = 540 + Math.sin(a)*r*.42;
    return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(14 + rnd(k)*6)}" ry="${f1(10 + rnd(k*2)*4)}" fill="${["#4E7E36", "#5E9040", "#6FA24C"][k % 3]}"/>`; }).join("")}</g>`
    + (m >= 8 && m <= 9 ? NP(Array.from({length: 14}, (_, k) => `<circle cx="${f1(40 + rnd(k*4)*110)}" cy="${f1(520 + rnd(k*6)*60)}" r="2.6" fill="#6A3A6A"/>`).join("")) : "")
    + `<g opacity=".7">${Array.from({length: 12}, (_, k) => `<path d="M${f1(40 + rnd(k*5)*110)} ${f1(520 + rnd(k*8)*60)} l-3 -4 l3 -2 l3 2z" fill="#86B85A"/>`).join("")}</g>`;
  const figArt = NP(`<ellipse cx="94" cy="590" rx="${w ? 60 : 90}" ry="${w ? 12 : 22}" fill="#3E4A30" opacity=".16"/>` + figBranches + poles) + (w ? NP(`<path d="M30 538 l-6 -10 M52 500 l-4 -10 M104 492 l2 -12 M146 508 l8 -8 M166 550 l10 -4" stroke="#8E8676" stroke-width="3" fill="none" stroke-linecap="round"/>`) : `<g pointer-events="none">${swing(88, 560, .5, 9)}${figLeaves}</g>`);
  const fig = place("fmfig", 196, 534, 26, 9, w ? "The fig tree on its crutches, bare for the winter" : "The fig tree on its crutches", figArt, "Fig tree", 96, 626, "#F6E3B4");
  // the dry-stone wall along the bottom (a lizard sunning on it), the corner junipers and the old juniper-wood field
  // gate where the track to Cap de Barbaria leaves the village
  const wall = stoneWall(176, 470, 604, 40, 3) + NP(lizard(300, 606, -6) + lizard(420, 610, 4));
  const corner = juniper(500, 520, 1, 4) + juniper(492, 600, .9, 5) + NP(sk(`<path d="M470 600 V564 M500 600 V564 M470 572 L500 592 M470 592 L500 572 M470 572 H500 M470 584 H500" stroke="#9A8C7A" stroke-width="2.6" fill="none"/>`, ""))
    + stoneWall(500, 524, 604, 40, 5);
  const barbArt = dirt("M410 520 Q450 556 484 580", 20) + NP(sk(`<rect x="438" y="474" width="6" height="52" fill="#9A8C7A"/><path d="M444 480 h56 l8 7 l-8 7 h-56z" fill="#FFFDF6"/>`, `<rect x="438" y="474" width="6" height="52"/><path d="M444 480 h56 l8 7 l-8 7 h-56z"/>`)
    + `<text x="474" y="489.6" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7" fill="${C.blue2}">Barbaria 8km</text>` + lizard(442, 512, -80));
  const barb = place("fmbarbaria", 404, 540, 26, 9, "The signpost to Cap de Barbaria", barbArt, "Cap de Barbaria", 400, 574, "#BFE8E2");
  const paths = dirt("M-10 440 Q100 432 200 440 M206 -10 V240 M84 368 Q140 420 200 440", 34);
  const bits = tufts([[190, 500], [300, 500], [250, 560], [360, 560], [210, 600]]) + flowers([[200, 520], [280, 540], [330, 500], [240, 590]]) + scrub(176, 470, .8) + scrub(360, 470, .7, 1);
  return base + square + paths + houses + trees + churchPl + bakery + bikes + fig + wall + corner + barb + bits + light()
    + gate("fmToIlletesW", 20, 440, "La Savina", 66, 476, "West along the road to La Savina and Ses Illetes", "#BFE8E2")
    + gate("fmToMolaN", 206, 40, "La Mola", 270, 34, "North up the old road to La Mola");
}

/* ---------- fm_mola: La Mola, the cliffs and the lighthouse ---------- */
function molaScreen(){
  const w = winter(), se = SEA(), mk = market(), [gr, gr2] = grassCols(), m = month();
  const base = ground(C.earth, [[240, 380, 170, 140, gr], [160, 200, 100, 60, gr2], [300, 520, 120, 60, gr]]);
  // the sea far below, the red cliff edge along the top and down the east side, swifts and gulls over the drop
  const sea = NP(`<rect x="0" y="0" width="520" height="100" fill="${C.deep2}"/><rect x="0" y="0" width="520" height="30" fill="#2E7FA6"/><rect x="490" y="96" width="40" height="420" fill="${C.deep2}"/>`
    + `<g stroke="#9ED4E6" stroke-width="1" opacity=".5">${[[30, 20], [120, 50], [230, 30], [350, 60], [460, 20], [80, 80], [500, 200], [500, 340]].map(([x, y], k) => `<path d="M${x} ${y} h14"><animateTransform attributeName="transform" type="translate" values="0 0;6 0;0 0" dur="${5 + k % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`);
  const cliffD = smooth([[-10, 96], [40, 90], [90, 98], [150, 88], [220, 96], [290, 86], [350, 94], [420, 88], [470, 96], [492, 120], [486, 200], [494, 280], [486, 360], [494, 440], [486, 510], [520, 560]]) + " L530 650 L-10 650z";
  const strata = [-24, -18, -12].map((dy, k) => `<path d="${smooth([[-10, 96], [40, 90], [90, 98], [150, 88], [220, 96], [290, 86], [350, 94], [420, 88], [470, 96], [492, 120], [486, 200], [494, 280], [486, 360], [494, 440], [486, 510]])}" transform="translate(${f1(-dy*.22)} ${dy})" stroke="${k % 2 ? C.cliff3 : "#E39466"}" stroke-width="${k === 1 ? 1.4 : 1}" fill="none" opacity=".55"/>`).join("");
  const cliff = NP(`<path d="${cliffD}" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".7" transform="translate(7 -32)"/><path d="${cliffD}" fill="${C.cliff3}" transform="translate(7 -32)"/><path d="${cliffD}" fill="${C.cliff}" transform="translate(5 -24)"/><path d="${cliffD}" fill="${C.cliff2}" transform="translate(2 -9)"/>${strata}`
    + `<g fill="${C.cliff3}" opacity=".45">${Array.from({length: 22}, (_, k) => `<path d="M${f1(rnd(k)*470)} ${f1(70 + rnd(k*3)*14)} l4 -3 l5 2 l-3 3z"/>`).join("")}</g><path d="${cliffD}" fill="${C.earth}"/><path d="${cliffD}" fill="none" stroke="#9A5236" stroke-width="1.4" opacity=".6"/>`
    + `<g>${bob(-1, 4)}<path d="M120 46 h22 l-3 4 h-17z" fill="#FFFFFF" stroke="#3b3530" stroke-width=".5"/><path d="M130 46 V24 L142 44z" fill="#FFFFFF" stroke="#3b3530" stroke-width=".5"/></g>`)
    + gullFly(160, 50, 70, 16) + gullFly(380, 40, 50, 12, -5);
  // the viewpoint: a low wall along the cliff top
  const view = place("fmcliffs", 200, 128, 26, 9, "The red cliffs and the view", stoneWall(100, 330, 100, 14, 7) + NP(lizard(250, 104, 4)), "The cliffs", 214, 150, "#F2C9B4");
  // La Mola lighthouse: a pale stone tower rising from the keeper's house, the lantern on top, a plaque to Jules Verne
  const lh = NP(sk(`<rect x="364" y="150" width="104" height="62" fill="${C.white}"/><rect x="364" y="150" width="104" height="5" fill="${C.wash2}"/>${[372, 446].map(x => `<rect class="wglow" x="${x}" y="168" width="14" height="18" fill="#3E4A52"/><rect x="${x - 4}" y="168" width="4" height="18" fill="${C.green}"/><rect x="${x + 14}" y="168" width="4" height="18" fill="${C.green}"/>`).join("")}<path d="M402 212 V190 Q402 180 412 180 Q422 180 422 190 V212z" fill="${C.green2}"/><rect x="362" y="206" width="108" height="6" fill="#D9D2C2"/>`,
    `<rect x="364" y="150" width="104" height="62"/><path d="M402 212 V190 Q402 180 412 180 Q422 180 422 190 V212z"/>`)
    + sk(`<path d="M398 150 L402 44 H422 L426 150z" fill="${C.mares}"/>${courses(398, 44, 28, 106, C.mares2, 9, .6, 14)}<rect x="396" y="38" width="32" height="7" fill="${C.wash2}"/><rect x="402" y="18" width="20" height="20" fill="#E8F4F2"/><path d="M406 18 v20 M412 18 v20 M418 18 v20" stroke="#7A8A8A" stroke-width=".8"/><path d="M398 18 Q412 2 426 18z" fill="${C.green2}"/><rect class="wglow" x="408" y="64" width="8" height="12" fill="#3E4A52"/><rect class="wglow" x="408" y="100" width="8" height="12" fill="#3E4A52"/>`,
      `<path d="M398 150 L402 44 H422 L426 150z M398 18 Q412 2 426 18z"/><rect x="402" y="18" width="20" height="20"/>`)
    + `<circle cx="412" cy="28" r="12" fill="#FFF3B0" opacity=".3"><animate attributeName="opacity" values=".1;.5;.1" dur="5s" repeatCount="indefinite"/></circle><rect x="430" y="190" width="14" height="10" rx="1" fill="#B8A07A" stroke="var(--line)" stroke-width=".5"/><path d="M433 194 h8 M433 197 h6" stroke="#5A4A3A" stroke-width=".6"/>`);
  const light1 = place("fmlighthouse", 412, 228, 28, 9, "La Mola lighthouse", lh, "Lighthouse", 316, 176, "#F6E3B4");
  // the pines along the west and in the bottom-left corner
  const west = pine(40, 170, 1.1, 1) + pine(70, 260, .9, 2, -1) + pine(30, 340, 1, 3) + pine(40, 500, 1, 4) + pine(80, 590, 1.1, 5, -1) + scrub(90, 330, .8) + scrub(100, 440, .9, 1);
  // the hippy market among the pines: striped awnings over trestles of silver jewellery, leather sandals,
  // dreamcatchers and woven baskets, bunting strung between the trees, a guitar; on other days a quiet clearing
  const sandals = x => [0, 1, 2].map(k => `<path d="M${x + k*9} 330 q3 -6 6 0 l-1 -8 h-4z" fill="#8A5A3A"/>`).join("");
  const beads = x => [0, 1, 2, 3].map(k => `<circle cx="${x + k*7}" cy="326" r="2.6" fill="none" stroke="${["#3EC3C2", "#F07A6A", "#F2C14E", "#B48AD8"][k]}" stroke-width="1.4"/>`).join("");
  const dream = (x, y, i) => `<g>${swing(x, y - 10, 6, 3 + i*.4, -i)}<path d="M${x} ${y - 10} v4" stroke="${C.wood2}" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="5" fill="none" stroke="#C8A06A" stroke-width="1.2"/><path d="M${x - 3} ${y + 5} v8 M${x} ${y + 5} v10 M${x + 3} ${y + 5} v8" stroke="#F2F2F2" stroke-width="1"/></g>`;
  const baskets = (x, y) => [0, 1].map(k => `<path d="M${x + k*16} ${y} h12 l-2 -8 h-8z" fill="#C8A06A" stroke="#8A6A3A" stroke-width=".6"/>`).join("");
  const stalls = mk ? stall(296, 338, 52, "#E05A3A", sandals(302) + dream(338, 304, 1), 0) + stall(360, 338, 52, C.turq, beads(366) + dream(404, 304, 2), 1)
      + stall(430, 400, 44, "#B48AD8", baskets(434, 392), 2) + stall(430, 462, 44, "#F2C14E", dream(440, 432, 3) + dream(456, 434, 4), 3)
      + NP(`<path d="M300 268 Q350 286 400 270 Q440 284 470 272" stroke="#7A6A5A" stroke-width=".8" fill="none"/>${Array.from({length: 14}, (_, k) => { const x = 304 + k*12, y = 274 + Math.sin(k/2)*6; return `<path d="M${x} ${f1(y)} l4 8 l4 -8z" fill="${["#E05A3A", "#3EC3C2", "#F2C14E", "#B48AD8", "#7FBF5A"][k % 5]}"/>`; }).join("")}`
      + `<path d="M422 336 l-6 -26 q-4 -6 2 -8 q6 0 4 8" stroke="${C.wood}" stroke-width="2" fill="none"/><ellipse cx="420" cy="334" rx="6" ry="4" fill="#C8873A" stroke="var(--line)" stroke-width=".5"/>`)
    : NP(sk(`<rect x="310" y="322" width="40" height="6" fill="${C.wood}"/><rect x="314" y="328" width="4" height="10" fill="${C.wood2}"/><rect x="342" y="328" width="4" height="10" fill="${C.wood2}"/><rect x="436" y="420" width="34" height="5" fill="${C.wood}"/><rect x="436" y="414" width="34" height="5" fill="${C.wood}"/>`, "")
      + sign(380, 326, 66, m >= 5 && m <= 10 ? "Market: Wed, Sun" : "Market: May to Oct", 7.4, "#FFFDF6", C.blue2));
  const grove = pine(320, 296, 1, 1) + pine(392, 286, 1.05, 2, -1) + pine(462, 300, .95, 3, -1) + pine(458, 384, .9, 4) + pine(462, 470, .95, 5, -1);
  const mkt = place("fmmarket", 360, 356, 28, 9, mk ? "The hippy market among the pines" : "The hippy market's clearing (Wednesdays and Sundays, May to October)", grove + stalls, mk ? "Hippy market" : "Market pines", 352, 378, "#F2C9D2");
  // the old flour windmill: a stout white tower, a wooden cap and six cloth sails turning very slowly
  const mill2 = place("fmwindmill2", 352, 566, 24, 9, "The old flour windmill", windmill(440, 634, 1, {n: 6, r: 58, cloth: true, turn: 70}) + scrub(392, 632, .8, 1), "Flour windmill", 300, 540, "#F6E3B4");
  // the scrub and dry-stone walls along the bottom, either side of the old road south
  const bottom = stoneWall(110, 196, 616, 30, 9) + stoneWall(290, 380, 616, 30, 11) + scrub(150, 612, .9) + scrub(330, 612, .8, 1);
  const paths = dirt("M-10 396 Q120 396 240 380 Q250 500 240 650 M240 380 Q230 250 200 128 M240 380 Q330 360 360 356 M240 300 Q330 250 412 228 M240 480 Q300 540 352 566", 34);
  const bits = tufts([[170, 220], [300, 210], [160, 420], [320, 440], [200, 520], [140, 300]]) + flowers([[180, 240], [290, 200], [150, 450], [330, 470], [220, 540]]) + NP(lizard(150, 610, -4));
  return base + sea + cliff + paths + view + west + light1 + mkt + mill2 + bottom + bits + light()
    + gate("fmToSalinesW", 20, 396, "Salt flats", 70, 432, "West along the Green Route to the salt flats", "#F2C9D2")
    + gate("fmToVillageS", 240, 612, "Sant Francesc", 160, 580, "South down the old road to Sant Francesc", "#BFE8E2");
}

export function formenteraArt(scene){
  return scene === "fm_illetes" ? illetesScreen() : scene === "fm_salines" ? salinesScreen() : scene === "fm_village" ? villageScreen() : molaScreen();
}
// the sight on the far shore as you sail in (a 600x90 strip; the sea starts at y 56): a long low island, the white
// spit of Ses Illetes with turquoise water round it, the pink salt flats at the harvest, the white village, and La
// Mola's plateau and red cliffs with the lighthouse at the far end; green in winter, gold in summer. (Read when the
// module loads; formenteraSight() gives a fresh one for any day.)
export function formenteraSight(day = dayKey()){
  const se = fmSeason(day), land = {winter: "#9DB46A", spring: "#AFBC74", summer: "#D2C48A", autumn: "#C4BC82"}[se], pans = saltOn(day) ? "#F2B6C1" : "#C4D6DE";
  const houses = [[300, 8], [312, 10], [326, 7], [338, 9], [352, 8]].map(([x, h], k) => `<rect x="${x}" y="${50 - h}" width="11" height="${h}" fill="#FBF9F3" stroke="#3b3530" stroke-width=".5"/>${k % 2 ? `<rect x="${x + 4}" y="${52 - h}" width="3" height="3" fill="#3F7FB0"/>` : ""}`).join("");
  const pines = Array.from({length: 7}, (_, k) => `<ellipse cx="${f1(420 + k*18 + rnd(k)*6)}" cy="${f1(29 + rnd(k*3)*3)}" rx="8" ry="3.6" fill="#3F6E3E" stroke="#3b3530" stroke-width=".4"/>`).join("");
  const ferry = `<g><animateTransform attributeName="transform" type="translate" values="0 0;-26 0;0 0" dur="40s" repeatCount="indefinite"/><path d="M60 54 h34 l-4 4 h-28z" fill="#FFFFFF" stroke="#3b3530" stroke-width=".6"/><rect x="66" y="47" width="20" height="7" fill="#FFFFFF" stroke="#3b3530" stroke-width=".5"/><path d="M68 50 h16" stroke="#3F7FB0" stroke-width="1.4"/></g>`;
  return `<path d="M90 56 Q120 52 170 54 L200 55 V58 H90z" fill="#7DDCD2"/><path d="M110 56 Q150 50 196 52 L210 54" stroke="#FFFFFF" stroke-width="3" fill="none"/>`
    + `<path d="M196 56 Q230 48 290 47 Q380 46 400 40 L410 30 Q480 24 560 26 L590 30 L600 56z" fill="${land}"/><path d="M478 33 Q530 31 592 32 L600 56 H486 Q482 44 478 33z" fill="#B9573A"/><path d="M484 42 Q540 40 596 42 M486 49 Q540 47 598 49" stroke="#8E3E2A" stroke-width=".8" fill="none" opacity=".6"/>`
    + `<rect x="232" y="48" width="40" height="5" rx="2" fill="${pans}" stroke="#3b3530" stroke-width=".4"/>` + houses + pines
    + `<rect x="350" y="${32}" width="6" height="12" fill="#FBF9F3" stroke="#3b3530" stroke-width=".5"/><path d="M353 32 l-7 -5 M353 32 l7 -5 M353 32 l-6 6 M353 32 l6 6" stroke="#5E4430" stroke-width=".8"/>`
    + `<rect x="566" y="8" width="5" height="20" fill="#E8D4AA" stroke="#3b3530" stroke-width=".5"/><path d="M564 8 Q568.5 2 573 8z" fill="#3A7056"/><circle cx="568.5" cy="10" r="5" fill="#FFF3B0" opacity=".5"/>`
    + ferry;
}
export const FORMENTERA_SIGHT = formenteraSight();
