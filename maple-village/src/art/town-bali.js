// Bali (boat towns, round 218): the island of the gods, nothing like the grey stone and painted walls of the Ligurian
// towns or Puffin Isle's wild turf. Warm sand, a turquoise reef, painted jukung outriggers with eyes on their bows;
// coconut palms leaning over everything; carved grey paras stone and red brick; shaggy thatched alang-alang roofs on
// open bale pavilions and black palm-fibre roofs on the shrines; frangipani, hibiscus and lotus; yellow and white
// cloths, ceremonial umbrellas and black-and-white checked poleng; and a little palm-leaf tray of flowers (canang sari)
// on every step and shrine, with a thread of incense smoke. Mount Agung floats over it all in the haze.
//   ba_terraces (Rice terraces) | ba_beach (Sanur beach) *
//   ba_temple   (Water temple)  | ba_ubud  (Ubud village)
//   ba_beach:    the reef and the sea along the top, your boat among the jukung, Nyoman's warung on the sand, the kite
//                rack (kites flying July to September), the beach shrine, and palms along the beach path
//   ba_ubud:     Ibu Wayan's family compound and its carved gate, Ketut's silver workshop, the market hall and its
//                shrine, the great banyan wrapped in poleng, and the mossy gate of the monkey forest with its macaques
//   ba_terraces: green stairs of paddies under the mountain, the subak channel, the bamboo pavilion, the paddy ducks
//                marching in a line, the scarecrow with bells, and Dewi Sri's shrine
//   ba_temple:   the split gate (candi bentar), the gamelan pavilion, the meru, the spring pools with their row of
//                carved spouts, and the lotus and koi pond
// Seasons (data/bali.js, the real calendar): the wet season (November to March) vivid green, with a warm downpour on
// some afternoons; the dry season (April to October) golden, the terraces flooded like mirrors with young rice until
// July, then gold and harvested August to October; kites over the beach and the paddies July to September; penjor
// poles along the lanes on Galungan days.
import { dayKey, sgHM } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { baliSeason, baHarvest, baKites, galunganOn } from "../data/bali.js";

const C = {sand: "#EFDDB3", sand2: "#F6E8C6", wetsand: "#D9C190", sea: "#3FA3B3", deep: "#2B87A0", shallow: "#6FCBC2", reef: "#9ADBCB", foam: "#F6FBF8",
  grass: "#8CBF55", grass2: "#74A944", grassDry: "#A9BD62", grassDry2: "#94A853", lane: "#DACFB6", lane2: "#C3B597", earth: "#CDB283", earth2: "#B5975F",
  brick: "#B95C3E", brick2: "#9A4630", paras: "#BEB69F", paras2: "#A49C85", paras3: "#857E6A", moss: "#6F8C48", moss2: "#56733A",
  thatch: "#CDA35C", thatch2: "#AC8240", thatch3: "#8A6430", ijuk: "#2F2A26", ijuk2: "#4A433C", bamboo: "#CDAE62", bamboo2: "#A8893E",
  wood: "#7A4A2E", wood2: "#5A361F", red: "#A9322A", gold: "#D6A636", gold2: "#F0CB52", cloth: "#F2C230", white: "#F8F4EA", black: "#2B2A29",
  tile: "#BC6440", tile2: "#9C4D31", plaster: "#F1E8D8", palm: "#4E8A3A", palm2: "#6AA548", trunk: "#93795A", trunk2: "#6C5840",
  leaf: "#3E7A36", leaf2: "#589444", hib: "#E1413A", water: "#86CBC6", water2: "#B4E0DA", pond: "#4F9C93", pad: "#5C9A4C", pad2: "#78B25E", lotus: "#F28DB2",
  monkey: "#8E7B5F", monkey2: "#AE9C80", face: "#E2B29C", ink: "#2F2B28", iron: "#3F4A50"};
const wet = () => baliSeason(dayKey()) === "wet";
const harvest = () => baHarvest(dayKey());
const kiteDay = () => baKites(dayKey());
const galungan = () => galunganOn(dayKey());
const grassCols = () => wet() ? [C.grass, C.grass2] : [C.grassDry, C.grassDry2];
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const f1 = n => (+n).toFixed(1);
const NP = s => `<g pointer-events="none">${s}</g>`;
// a gentle rotation about a point, for swaying palms, umbrellas, kites and waddling ducks
const swing = (cx, cy, deg, dur, begin = 0) => `<animateTransform attributeName="transform" type="rotate" values="0 ${f1(cx)} ${f1(cy)};${deg} ${f1(cx)} ${f1(cy)};0 ${f1(cx)} ${f1(cy)};${f1(-deg*.8)} ${f1(cx)} ${f1(cy)};0 ${f1(cx)} ${f1(cy)}" dur="${f1(dur)}s" begin="${f1(begin)}s" repeatCount="indefinite"/>`;
const bob = (dy, dur, begin = 0) => `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${dy};0 0" dur="${f1(dur)}s" begin="${f1(begin)}s" repeatCount="indefinite"/>`;
// smooth curves through points (Catmull-Rom as cubic Béziers): a whole path, or just the segments from the current point
const segs = p => { let d = ""; for (let i = 0; i < p.length - 1; i++) { const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
  d += ` C${f1(b[0] + (c[0] - a[0])/6)} ${f1(b[1] + (c[1] - a[1])/6)} ${f1(c[0] - (e[0] - b[0])/6)} ${f1(c[1] - (e[1] - b[1])/6)} ${f1(c[0])} ${f1(c[1])}`; } return d; };
const smooth = p => `M${f1(p[0][0])} ${f1(p[0][1])}` + segs(p);
// the black-and-white checked poleng cloth, as a fill pattern
const DEFS = `<defs><pattern id="baPoleng" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#F6F2E8"/><rect width="4" height="4" fill="#2B2A29"/><rect x="4" y="4" width="4" height="4" fill="#2B2A29"/></pattern></defs>`;

/* ---------- plants ---------- */
// a coconut palm: a ringed, curving trunk and a crown of drooping feathery fronds that sways in the breeze
function palm(x, y, s = 1, lean = 1, i = 0){
  const tx = x + 30*s*lean, ty = y - 118*s, d = `M${f1(x)} ${f1(y)} Q${f1(x + 2*s*lean)} ${f1(y - 66*s)} ${f1(tx)} ${f1(ty)}`;
  const fr = [[-48, 18], [-42, -4], [-26, -22], [-6, -28], [16, -25], [36, -10], [48, 16], [22, 24], [-22, 22], [4, 20]];
  const frond = ([dx, dy], k) => { const ex = tx + dx*s, ey = ty + dy*s + 14*s, cx = tx + dx*s*.55, cy = ty + Math.min(dy, 0)*s*.9 - 14*s, n = 13; let leaflets = "";
    for (let j = 1; j <= n; j++) { const t = j/(n + 1), px = (1 - t)*(1 - t)*tx + 2*(1 - t)*t*cx + t*t*ex, py = (1 - t)*(1 - t)*ty + 2*(1 - t)*t*cy + t*t*ey;
      const gx = 2*(1 - t)*(cx - tx) + 2*t*(ex - cx), gy = 2*(1 - t)*(cy - ty) + 2*t*(ey - cy), gl = Math.hypot(gx, gy) || 1, L = s*(10.5 - 7.5*t);
      for (const sd of [1, -1]) { let vx = gx/gl*.45 - sd*gy/gl, vy = gy/gl*.45 + sd*gx/gl; vy += .9; const vl = Math.hypot(vx, vy); leaflets += `M${f1(px)} ${f1(py)} l${f1(vx/vl*L)} ${f1(vy/vl*L)}`; } }
    return `<path d="${leaflets}" fill="none" stroke="${k % 3 === 0 ? "#3F7A32" : k % 2 ? C.palm : C.palm2}" stroke-width="${f1(1.7*s)}" stroke-linecap="round"/><path d="M${f1(tx)} ${f1(ty)} Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}" fill="none" stroke="#3E6E2E" stroke-width="${f1(1.4*s)}"/>`; };
  const nuts = [[-4, 6], [3, 7], [0, 3], [-6, 2]].map(([dx, dy]) => `<circle cx="${f1(tx + dx*s)}" cy="${f1(ty + dy*s)}" r="${f1(3.4*s)}" fill="${dx ? "#7E8A3A" : "#9AA046"}" stroke="#4E5426" stroke-width=".6"/>`).join("");
  return NP(`<ellipse cx="${f1(x + 26*s*lean)}" cy="${f1(y + 2)}" rx="${f1(26*s)}" ry="${f1(5*s)}" fill="#3E4A30" opacity=".13"/><g>${swing(x, y, .8, 7 + i % 3, -i)}<path d="${d}" fill="none" stroke="${C.trunk2}" stroke-width="${f1(8.4*s)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.trunk}" stroke-width="${f1(6.4*s)}"/><path d="${d}" fill="none" stroke="${C.trunk2}" stroke-width="${f1(6.4*s)}" stroke-dasharray="${f1(1.1*s)} ${f1(4.4*s)}" opacity=".8"/>
    <g>${swing(tx, ty, 3, 4.6 + (i % 4)*.7, -i*.9)}${fr.map(frond).join("")}${nuts}</g></g>`);
}
// a frangipani flower: five cream petals round a yellow heart (or a pink one)
const fFlower = (x, y, r = 2.6, pink = false) => `<g>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${f1(x + Math.cos(a*Math.PI/180)*r*.7)}" cy="${f1(y + Math.sin(a*Math.PI/180)*r*.7)}" rx="${f1(r*.62)}" ry="${f1(r*.38)}" transform="rotate(${a} ${f1(x + Math.cos(a*Math.PI/180)*r*.7)} ${f1(y + Math.sin(a*Math.PI/180)*r*.7)})" fill="${pink ? "#F6C3D2" : "#FFF9EC"}" stroke="#D9C9A8" stroke-width=".3"/>`).join("")}<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r*.32)}" fill="${pink ? "#F4D35E" : "#F2C33E"}"/></g>`;
// a frangipani tree: a knobbly grey fork, rosettes of long leaves at the tips, and clusters of flowers
function frangipani(x, y, s = 1, pink = false, i = 0){
  const tips = [[-30, -50], [-12, -64], [12, -60], [32, -44], [0, -42]];
  const branch = tips.map(([dx, dy]) => `<path d="M${f1(x)} ${f1(y - 24*s)} Q${f1(x + dx*s*.3)} ${f1(y + dy*s*.6)} ${f1(x + dx*s)} ${f1(y + dy*s)}" fill="none" stroke="#8C8478" stroke-width="${f1(4*s)}" stroke-linecap="round"/>`).join("");
  const rosette = ([dx, dy], k) => { const cx = x + dx*s, cy = y + dy*s; return [0, 1, 2, 3, 4, 5].map(j => { const a = j*60 + k*17; return `<ellipse cx="${f1(cx + Math.cos(a*Math.PI/180)*8*s)}" cy="${f1(cy + Math.sin(a*Math.PI/180)*5*s)}" rx="${f1(9*s)}" ry="${f1(3.2*s)}" transform="rotate(${a} ${f1(cx + Math.cos(a*Math.PI/180)*8*s)} ${f1(cy + Math.sin(a*Math.PI/180)*5*s)})" fill="${j % 2 ? C.leaf : C.leaf2}"/>`; }).join("")
    + [[-3, -4], [3, -5], [0, -1], [5, 0], [-5, 1]].slice(0, 3 + k % 3).map(([fx, fy]) => fFlower(cx + fx*s, cy + fy*s, 2.8*s, pink)).join(""); };
  return NP(`<ellipse cx="${f1(x)}" cy="${f1(y + 1)}" rx="${f1(30*s)}" ry="${f1(6*s)}" fill="#3E4A30" opacity=".13"/><path d="M${f1(x - 3*s)} ${f1(y)} Q${f1(x - 2*s)} ${f1(y - 14*s)} ${f1(x)} ${f1(y - 24*s)} Q${f1(x + 2*s)} ${f1(y - 14*s)} ${f1(x + 3*s)} ${f1(y)}z" fill="#8C8478" stroke="#6E675C" stroke-width=".8"/>${branch}<g>${swing(x, y, 1.2, 6 + i % 3, -i)}${tips.map(rosette).join("")}</g>`);
}
// a hibiscus bush with big red trumpet flowers
const hibiscus = (x, y, s = 1, col = C.hib) => NP(sk([[-12, -8, 13, 9], [10, -9, 13, 10], [0, -17, 13, 10], [-4, -4, 12, 6]].map(([dx, dy, rx, ry], k) => `<ellipse cx="${f1(x + dx*s)}" cy="${f1(y + dy*s)}" rx="${f1(rx*s)}" ry="${f1(ry*s)}" fill="${k % 2 ? "#3D7434" : "#4B8A3E"}"/>`).join("")
  + [[-10, -12], [9, -15], [2, -22], [14, -6], [-14, -4]].map(([dx, dy]) => `${[0, 72, 144, 216, 288].map(a => `<circle cx="${f1(x + dx*s + Math.cos(a*Math.PI/180)*2.4*s)}" cy="${f1(y + dy*s + Math.sin(a*Math.PI/180)*2.4*s)}" r="${f1(2.2*s)}" fill="${col}"/>`).join("")}<circle cx="${f1(x + dx*s)}" cy="${f1(y + dy*s)}" r="${f1(1.2*s)}" fill="#8A1E22"/><path d="M${f1(x + dx*s)} ${f1(y + dy*s)} l${f1(2.4*s)} ${f1(-2.4*s)}" stroke="#F2C33E" stroke-width=".8"/>`).join(""), ""));
// a banana plant: a few big ragged leaves on a green stem
const banana = (x, y, s = 1, i = 0) => NP(`<path d="M${x} ${y} V${f1(y - 30*s)}" stroke="#7C9A44" stroke-width="${f1(4*s)}"/><g>${swing(x, y - 30*s, 3, 5 + i, -i)}${[[-30, -40], [-18, -56], [16, -58], [30, -38], [2, -62]].map(([dx, dy], k) => `<path d="M${x} ${f1(y - 30*s)} Q${f1(x + dx*s*.5)} ${f1(y + (dy - 14)*s)} ${f1(x + dx*s)} ${f1(y + dy*s)} Q${f1(x + dx*s*.4)} ${f1(y + (dy + 6)*s)} ${x} ${f1(y - 30*s)}z" fill="${k % 2 ? "#6EA548" : "#82B856"}" stroke="#4E7A32" stroke-width=".7"/>`).join("")}</g>`);
const fern = (x, y, s = 1) => NP([-50, -25, 0, 25, 50].map(a => { const r = a*Math.PI/180, ex = x + Math.sin(r)*16*s, ey = y - Math.cos(r)*12*s; return `<path d="M${x} ${y} Q${f1((x + ex)/2)} ${f1(ey - 4*s)} ${f1(ex)} ${f1(ey + 4*s)}" fill="none" stroke="#4E8A3A" stroke-width="${f1(3*s)}" stroke-dasharray="1.4 .8"/>`; }).join(""));
const foliage = (blobs, cols = ["#3B6E34", "#4E8A3E", "#6AA450"]) => NP(`<g filter="url(#wob)">${blobs.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx + 3}" ry="${ry + 3}" fill="${cols[0]}"/>`).join("")}${blobs.map(([x, y, rx, ry]) => `<ellipse cx="${x - 2}" cy="${y - 3}" rx="${f1(rx*.9)}" ry="${f1(ry*.85)}" fill="${cols[1]}"/>`).join("")}${blobs.map(([x, y, rx, ry], k) => `<ellipse cx="${f1(x - rx*.3)}" cy="${f1(y - ry*.45)}" rx="${f1(rx*.42)}" ry="${f1(ry*.32)}" fill="${cols[2]}" opacity=".85"/>${k % 2 ? `<ellipse cx="${f1(x + rx*.3)}" cy="${f1(y - ry*.1)}" rx="${f1(rx*.25)}" ry="${f1(ry*.2)}" fill="${cols[2]}" opacity=".6"/>` : ""}`).join("")}</g>`);
const tuft = (x, y, col = "#5E8F3A") => `<path d="M${x - 4} ${y} q2 -7 4 -1 q2 -8 4 0 q1 -5 3 1" fill="none" stroke="${col}" stroke-width="1.2" pointer-events="none"/>`;
const petals = pts => NP(pts.map(([x, y], k) => fFlower(x, y, 2.2, k % 4 === 3)).join(""));

/* ---------- offerings and temple things ---------- */
// canang sari: a little square palm-leaf tray with petals for the four directions (white east, red south, yellow west,
// blue north), shredded pandan in the middle, and sometimes a stick of incense with its thread of smoke
const smoke = (x, y, i = 0) => `<path d="M${f1(x)} ${f1(y)} q-2 -4 0 -8 q2 -4 0 -8 q-2 -4 0 -8" fill="none" stroke="#E8E3DA" stroke-width="1.1" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;.85;0" dur="${f1(4 + (i % 3)*.6)}s" begin="${f1(-i*1.3)}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 2;1 -4" dur="${f1(4 + (i % 3)*.6)}s" begin="${f1(-i*1.3)}s" repeatCount="indefinite"/></path>`;
const canang = (x, y, s = 1, inc = false, i = 0) => `<g pointer-events="none"><rect x="${f1(x - 5*s)}" y="${f1(y - 3*s)}" width="${f1(10*s)}" height="${f1(6*s)}" rx="${f1(.6*s)}" fill="#CFDA7E" stroke="#93A84A" stroke-width=".6"/><path d="M${f1(x - 5*s)} ${f1(y + 3*s)} h${f1(10*s)}" stroke="#A8B85A" stroke-width="${f1(1.2*s)}" stroke-dasharray="1 .8"/>
  <circle cx="${f1(x + 3*s)}" cy="${f1(y - .3*s)}" r="${f1(1.5*s)}" fill="#FFFDF4"/><circle cx="${f1(x)}" cy="${f1(y + 1.4*s)}" r="${f1(1.5*s)}" fill="#E0403A"/><circle cx="${f1(x - 3*s)}" cy="${f1(y - .3*s)}" r="${f1(1.5*s)}" fill="#F4C431"/><circle cx="${f1(x)}" cy="${f1(y - 1.8*s)}" r="${f1(1.4*s)}" fill="#7A5AC0"/><circle cx="${f1(x)}" cy="${f1(y - .2*s)}" r="${f1(.9*s)}" fill="#5E9A4E"/>
  ${inc ? `<path d="M${f1(x + 2*s)} ${f1(y)} l${f1(2*s)} ${f1(-9*s)}" stroke="#7A3A22" stroke-width=".8"/><circle cx="${f1(x + 4*s)}" cy="${f1(y - 9*s)}" r=".7" fill="#E8603A"/>${smoke(x + 4*s, y - 10*s, i)}` : ""}</g>`;
const canangs = (pts, s = 1) => pts.map(([x, y], k) => canang(x, y, s, k % 2 === 0, k)).join("");
// a tedung: a tall ceremonial umbrella, yellow or white with a fringe, swaying a little
const umbrella = (x, y, h, col = C.cloth, i = 0) => NP(`<path d="M${x} ${y} V${y - h}" stroke="#7A4A2E" stroke-width="1.6"/><g>${swing(x, y, 1.5, 5 + i, -i)}<path d="M${x - 13} ${y - h + 3} Q${x} ${y - h - 13} ${x + 13} ${y - h + 3}z" fill="${col}" stroke="var(--line)" stroke-width=".9"/><path d="M${x - 13} ${y - h + 4.5} H${x + 13}" stroke="${col}" stroke-width="4" stroke-dasharray="1.2 1"/><path d="M${x - 12} ${y - h + 2} H${x + 12}" stroke="${C.gold}" stroke-width="1.2"/><circle cx="${x}" cy="${y - h - 10}" r="1.8" fill="${C.gold}"/></g>`);
// a palm-thatched (alang-alang) hip roof: shaggy straw, a heavy eave, a dark ridge; or black palm fibre (ijuk) on shrines
function thatch(x1, x2, yb, h, ijuk = false){
  const w = x2 - x1, ov = 6, t1 = x1 + w*.24, t2 = x2 - w*.24, c1 = ijuk ? C.ijuk : C.thatch, c2 = ijuk ? C.ijuk2 : C.thatch2, c3 = ijuk ? "#1E1A17" : C.thatch3, n = Math.max(6, Math.round(w/5));
  const shape = `M${f1(x1 - ov)} ${f1(yb)} L${f1(t1)} ${f1(yb - h)} L${f1(t2)} ${f1(yb - h)} L${f1(x2 + ov)} ${f1(yb)}z`;
  const streaks = Array.from({length: n + 1}, (_, k) => { const t = k/n; return `M${f1(t1 + (t2 - t1)*t)} ${f1(yb - h + 2)} L${f1(x1 - ov + (w + 2*ov)*t)} ${f1(yb - 4)}`; }).join("");
  return sk(`<path d="${shape}" fill="${c1}"/><path d="${streaks}" stroke="${c2}" stroke-width=".8" opacity=".8"/><path d="M${f1(x1 - ov)} ${f1(yb)} L${f1(x1 - ov + 3)} ${f1(yb - 6)} H${f1(x2 + ov - 3)} L${f1(x2 + ov)} ${f1(yb)}z" fill="${c2}"/><path d="M${f1(x1 - ov)} ${f1(yb + 1)} H${f1(x2 + ov)}" stroke="${c3}" stroke-width="2.6" stroke-dasharray="1.6 1.3"/><rect x="${f1(t1 - 2)}" y="${f1(yb - h - 3)}" width="${f1(t2 - t1 + 4)}" height="4" fill="${c3}"/>`, `<path d="${shape}"/>`);
}
// a terracotta tiled hip roof (Ubud shops and the market hall)
function tiles(x1, x2, yb, h){
  const w = x2 - x1, ov = 7, t1 = x1 + w*.2, t2 = x2 - w*.2, shape = `M${f1(x1 - ov)} ${f1(yb)} L${f1(t1)} ${f1(yb - h)} L${f1(t2)} ${f1(yb - h)} L${f1(x2 + ov)} ${f1(yb)}z`;
  const rows = Array.from({length: Math.floor(h/5)}, (_, k) => { const y = yb - 4 - k*5, f = (yb - y)/h; return `M${f1(x1 - ov + (t1 - x1 + ov)*f)} ${f1(y)} H${f1(x2 + ov - (x2 + ov - t2)*f)}`; }).join("");
  return sk(`<path d="${shape}" fill="${C.tile}"/><path d="${rows}" stroke="${C.tile2}" stroke-width="1" stroke-dasharray="4 1.2"/><rect x="${f1(t1 - 3)}" y="${f1(yb - h - 3)}" width="${f1(t2 - t1 + 6)}" height="4" fill="${C.tile2}"/>${[t1 - 3, (t1 + t2)/2, t2 + 3].map(x => `<path d="M${f1(x - 3)} ${f1(yb - h - 2)} q3 -7 6 0" fill="${C.paras}"/>`).join("")}`, `<path d="${shape}"/>`);
}
// courses of stone or brick
const courses = (x, y, w, h, col = C.paras3, s = 7, op = .55) => `<path d="${Array.from({length: Math.floor(h/s)}, (_, k) => `M${f1(x)} ${f1(y + (k + 1)*s)} h${f1(w)}`).join(" ")}" stroke="${col}" stroke-width=".6" opacity="${op}"/>`;
// a carved paras band: a grey stripe with little scrolls
const carved = (x, y, w, h = 6) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${h}" fill="${C.paras}"/><path d="${Array.from({length: Math.floor(w/8)}, (_, k) => `M${f1(x + 2 + k*8)} ${f1(y + h - 1.5)} q2 -${h - 3} 4 0`).join(" ")}" fill="none" stroke="${C.paras3}" stroke-width=".7"/>`;
// a pelinggih: a little shrine house on a carved stone post, a yellow cloth round its middle, a black roof, and
// offerings on its ledge
function shrine(cx, base, s = 1, o = {}){
  const P = (v) => f1(v);
  return NP(sk(`<rect x="${P(cx - 16*s)}" y="${P(base - 10*s)}" width="${P(32*s)}" height="${P(10*s)}" fill="${C.paras2}"/><rect x="${P(cx - 13*s)}" y="${P(base - 14*s)}" width="${P(26*s)}" height="${P(4*s)}" fill="${C.paras}"/>
    <rect x="${P(cx - 6*s)}" y="${P(base - 40*s)}" width="${P(12*s)}" height="${P(26*s)}" fill="${C.paras}"/><rect x="${P(cx - 7.5*s)}" y="${P(base - 34*s)}" width="${P(15*s)}" height="${P(11*s)}" fill="${o.poleng ? "url(#baPoleng)" : C.cloth}"/><path d="M${P(cx - 7.5*s)} ${P(base - 23*s)} l${P(3*s)} ${P(6*s)} l${P(3*s)} ${P(-6*s)}" fill="${o.poleng ? C.white : C.cloth}"/>
    <rect x="${P(cx - 13*s)}" y="${P(base - 43*s)}" width="${P(26*s)}" height="${P(3.4*s)}" fill="${C.paras2}"/><rect x="${P(cx - 10*s)}" y="${P(base - 58*s)}" width="${P(20*s)}" height="${P(15*s)}" fill="${C.brick}"/><rect x="${P(cx - 6*s)}" y="${P(base - 55*s)}" width="${P(12*s)}" height="${P(11*s)}" fill="#3A2820"/><path d="M${P(cx - 6*s)} ${P(base - 55*s)} h${P(12*s)}" stroke="${C.gold}" stroke-width="${P(1.6*s)}"/>
    <path d="M${P(cx - 17*s)} ${P(base - 57*s)} L${P(cx - 6*s)} ${P(base - 74*s)} H${P(cx + 6*s)} L${P(cx + 17*s)} ${P(base - 57*s)}z" fill="${C.ijuk}"/><path d="M${P(cx - 12*s)} ${P(base - 59*s)} L${P(cx - 4*s)} ${P(base - 72*s)} M${P(cx)} ${P(base - 59*s)} V${P(base - 72*s)} M${P(cx + 12*s)} ${P(base - 59*s)} L${P(cx + 4*s)} ${P(base - 72*s)}" stroke="${C.ijuk2}" stroke-width=".8"/><path d="M${P(cx - 2*s)} ${P(base - 74*s)} h${P(4*s)} l${P(-2*s)} ${P(-6*s)}z" fill="${C.gold}"/>`,
    `<path d="M${P(cx - 16*s)} ${P(base)} V${P(base - 10*s)} H${P(cx + 16*s)} V${P(base)} M${P(cx - 6*s)} ${P(base - 14*s)} V${P(base - 43*s)} M${P(cx + 6*s)} ${P(base - 14*s)} V${P(base - 43*s)}"/><rect x="${P(cx - 10*s)}" y="${P(base - 58*s)}" width="${P(20*s)}" height="${P(15*s)}"/><path d="M${P(cx - 17*s)} ${P(base - 57*s)} L${P(cx - 6*s)} ${P(base - 74*s)} H${P(cx + 6*s)} L${P(cx + 17*s)} ${P(base - 57*s)}z"/>`)
    + canang(cx - 6*s, base - 44*s, .75*s, true, Math.round(cx)) + canang(cx + 6*s, base - 44*s, .7*s) + canang(cx, base - 3*s, .8*s, true, Math.round(cx) + 1));
}
// a candi bentar: a tall stepped gate tower of red brick and carved grey stone, split clean down the middle so you walk
// through the cut. hw: the width of each half, gap: the way through
function splitGate(cx, base, hw, h, gap, o = {}){
  // the profile of each half from the outside edge in: [width, height] as fractions; a broad stone plinth, a tall brick
  // body with a carved panel, a jutting cornice, then smaller and smaller tiers up to the point, each with a little flick
  const prof = [[1, 0], [1, .15], [.84, .15], [.84, .5], [.95, .5], [.95, .57], [.76, .57], [.76, .65], [.63, .65], [.63, .73], [.5, .73], [.5, .8], [.37, .8], [.37, .87], [.24, .87], [.24, .93], [.12, .93], [.12, 1]];
  const body = o.moss ? "#8E8C70" : C.brick, dark = o.moss ? "#6E6A55" : C.brick2, stone = o.moss ? "#A9A88E" : C.paras, stone2 = o.moss ? "#8F8E76" : C.paras2;
  const half = side => { const L = cx - side*gap/2, X = f => L - side*hw*f, Y = f => base - h*f, lo = (a, b) => Math.min(a, b), wd = (a, b) => Math.abs(a - b);
    let d = `M${f1(L)} ${f1(base)}`; for (const [w, hh] of prof) d += ` L${f1(X(w))} ${f1(Y(hh))}`; d += ` L${f1(L)} ${f1(Y(1))}z`;
    let art = `<path d="${d}" fill="${body}"/>${courses(lo(L, X(.84)), Y(.5), wd(L, X(.84)), h*.35, dark, 5, .35)}<rect x="${f1(lo(L, X(1)))}" y="${f1(Y(.15))}" width="${f1(hw)}" height="${f1(h*.15)}" fill="${stone2}"/>${courses(lo(L, X(1)), Y(.15), hw, h*.15, C.paras3, 5)}`
      + carved(lo(L, X(.95)), Y(.57), hw*.95, h*.07) + `<rect x="${f1(lo(X(.72), X(.18)))}" y="${f1(Y(.46))}" width="${f1(hw*.54)}" height="${f1(h*.26)}" fill="${stone}"/><path d="M${f1(X(.58))} ${f1(Y(.22))} V${f1(Y(.36))} Q${f1(X(.45))} ${f1(Y(.44))} ${f1(X(.32))} ${f1(Y(.36))} V${f1(Y(.22))}z" fill="${dark}" opacity=".7"/>`;
    for (let k = 6; k < prof.length - 1; k += 2) { const [w, hh] = prof[k]; art += `<rect x="${f1(lo(L, X(w)))}" y="${f1(Y(hh) - 1)}" width="${f1(hw*w)}" height="3.4" fill="${stone}"/><path d="M${f1(X(w))} ${f1(Y(hh))} q${f1(-side*4)} -2 ${f1(-side*3)} -8 q${f1(side*2)} 3 ${f1(side*4)} 3z" fill="${stone}" stroke="var(--line)" stroke-width=".5"/>`; }
    art += `<rect x="${f1(side > 0 ? L - 4 : L)}" y="${f1(Y(1))}" width="4" height="${f1(h)}" fill="${dark}" opacity=".6"/><path d="M${f1(X(.12))} ${f1(Y(1))} l${f1(side*hw*.06)} -8 l${f1(side*hw*.06)} 8z" fill="${stone}"/>`;
    return {d, art}; };
  const l = half(1), r = half(-1);
  const moss = o.moss ? [[-1, .1], [-1, .52], [1, .3], [1, .62], [-1, .8], [1, .05]].map(([sd, f], k) => `<ellipse cx="${f1(cx + sd*(gap/2 + hw*(.3 + rnd(k)*.4)))}" cy="${f1(base - h*f)}" rx="${f1(7 + rnd(k + 9)*6)}" ry="3.4" fill="${C.moss}" opacity=".8"/>`).join("") : "";
  return NP(sk(l.art + r.art + moss, `<path d="${l.d}"/><path d="${r.d}"/>`));
}
// a little carved stone finial along a wall top
const finial = (x, y) => `<path d="M${x - 6} ${y} h12 v-4 h-2 v-4 h-2 l-2 -7 l-2 7 h-2 v4 h-2z" fill="${C.paras}" stroke="var(--line)" stroke-width=".6"/>`;
// a meru: a stone base with a carved red-and-gold door, and roofs of black palm fibre stacked one above another
function meru(cx, base, tiers, w0){
  let roofs = "", lines = "";
  for (let t = 0; t < tiers; t++) { const ww = w0*(1 - t*.15), yb = base - 50 - t*16, d = `M${f1(cx - ww/2)} ${f1(yb)} L${f1(cx - ww*.3)} ${f1(yb - 11)} H${f1(cx + ww*.3)} L${f1(cx + ww/2)} ${f1(yb)}z`;
    roofs += `<path d="M${f1(cx - ww*.28)} ${f1(yb - 10)} V${f1(yb - 16)} M${f1(cx + ww*.28)} ${f1(yb - 10)} V${f1(yb - 16)}" stroke="${C.wood}" stroke-width="2"/><path d="${d}" fill="${C.ijuk}"/><path d="M${f1(cx - ww/2)} ${f1(yb)} H${f1(cx + ww/2)}" stroke="#1E1A17" stroke-width="2.4" stroke-dasharray="1.4 1.2"/><path d="M${f1(cx - ww*.2)} ${f1(yb - 2)} L${f1(cx - ww*.15)} ${f1(yb - 10)} M${f1(cx + ww*.2)} ${f1(yb - 2)} L${f1(cx + ww*.15)} ${f1(yb - 10)}" stroke="${C.ijuk2}" stroke-width=".8"/>`;
    lines += `<path d="${d}"/>`; }
  const top = base - 50 - tiers*16 + 5;
  return NP(sk(`<rect x="${f1(cx - w0*.5)}" y="${base - 12}" width="${w0}" height="12" fill="${C.paras2}"/>${carved(cx - w0*.46, base - 20, w0*.92, 8)}<rect x="${f1(cx - w0*.36)}" y="${base - 50}" width="${f1(w0*.72)}" height="30" fill="${C.brick}"/>${courses(cx - w0*.36, base - 50, w0*.72, 30, C.brick2, 5, .4)}
    <rect x="${cx - 8}" y="${base - 44}" width="16" height="24" fill="${C.gold}"/><rect x="${cx - 6}" y="${base - 42}" width="12" height="22" fill="${C.red}"/><path d="M${cx} ${base - 42} v22 M${cx - 4} ${base - 36} h3 M${cx + 1} ${base - 36} h3" stroke="${C.gold}" stroke-width=".8"/>
    ${roofs}<path d="M${cx - 3} ${f1(top)} h6 l-3 -10z" fill="${C.gold}"/><circle cx="${cx}" cy="${f1(top - 11)}" r="2" fill="${C.gold}"/>`,
    `<rect x="${f1(cx - w0*.5)}" y="${base - 12}" width="${w0}" height="12"/><rect x="${f1(cx - w0*.36)}" y="${base - 50}" width="${f1(w0*.72)}" height="30"/>${lines}`));
}
// a bale: an open pavilion on a stone plinth, carved red posts with gold tops, under a thatched roof (two tiers for o.tier)
function bale(cx, base, w, ph, rh, o = {}){
  const n = o.posts || 4, xs = Array.from({length: n}, (_, k) => cx - w/2 + 9 + k*(w - 18)/(n - 1)), top = base - 16 - ph;
  const plinth = sk(`<rect x="${f1(cx - w/2)}" y="${base - 12}" width="${w}" height="12" fill="${o.bamboo ? C.paras2 : C.paras}"/>${courses(cx - w/2, base - 12, w, 12, C.paras3, 4)}<rect x="${f1(cx - w/2 + 3)}" y="${base - 16}" width="${w - 6}" height="4" fill="${o.bamboo ? C.bamboo2 : C.wood}"/>${o.steps ? `<rect x="${cx - 12}" y="${base - 4}" width="24" height="6" fill="${C.paras2}"/>` : ""}`, `<rect x="${f1(cx - w/2)}" y="${base - 12}" width="${w}" height="12"/>`);
  const posts = sk(xs.map(x => `<rect x="${f1(x - 2.6)}" y="${f1(top)}" width="5.2" height="${ph}" fill="${o.bamboo ? C.bamboo : C.red}"/>${o.bamboo ? `<path d="M${f1(x - 2.6)} ${f1(top + ph*.33)} h5.2 M${f1(x - 2.6)} ${f1(top + ph*.66)} h5.2" stroke="${C.bamboo2}" stroke-width=".8"/>` : `<rect x="${f1(x - 3.6)}" y="${f1(top)}" width="7.2" height="4" fill="${C.gold}"/><rect x="${f1(x - 3.6)}" y="${f1(top + ph - 4)}" width="7.2" height="4" fill="${C.gold}"/>`}`).join("") + `<rect x="${f1(cx - w/2 + 4)}" y="${f1(top - 3)}" width="${w - 8}" height="5" fill="${o.bamboo ? C.bamboo2 : C.wood2}"/>`,
    xs.map(x => `<path d="M${f1(x - 2.6)} ${f1(top)} v${ph} M${f1(x + 2.6)} ${f1(top)} v${ph}"/>`).join(""));
  const roof = o.tier ? thatch(cx - w*.3, cx + w*.3, top - rh*.55, rh*.6, o.ijuk) + `<path d="M${f1(cx - w*.26)} ${f1(top - rh*.55)} v${f1(rh*.2)} M${f1(cx + w*.26)} ${f1(top - rh*.55)} v${f1(rh*.2)}" stroke="${C.wood2}" stroke-width="2"/>` + thatch(cx - w/2, cx + w/2, top + 1, rh*.5, o.ijuk) : thatch(cx - w/2, cx + w/2, top + 1, rh, o.ijuk);
  return NP(`<ellipse cx="${cx}" cy="${base + 2}" rx="${f1(w*.55)}" ry="5" fill="#3E4A30" opacity=".12"/>` + plinth + (o.inside || "") + posts + roof);
}

/* ---------- boats, kites, poles ---------- */
// a jukung: a slim painted outrigger canoe with a swordfish snout, a painted eye on the bow so it can see its way home,
// bamboo arms arching over to the two floats; furled on the sand, or sailing with a striped crab-claw sail
function jukung(x, y, s, dir, hull, stripe, i = 0, o = {}){
  const P = (dx, dy) => `${f1(x + dx*s*dir)} ${f1(y + dy*s)}`, hd = `M${P(-44, -15)} L${P(-38, -10)} L${P(40, -11)} L${P(60, -17)} L${P(43, -6)} Q${P(24, 3)} ${P(0, 3)} Q${P(-28, 3)} ${P(-40, -9)}z`;
  const far = `<path d="M${P(-46, -20)} L${P(46, -20)}" stroke="#B89E64" stroke-width="${f1(2*s)}" stroke-linecap="round"/>`;
  const arms = [-16, 18].map(ax => `<path d="M${P(ax - 3, -20)} C${P(ax - 2, -36)} ${P(ax + 4, -32)} ${P(ax + 6, 8)}" fill="none" stroke="#C9AE6E" stroke-width="${f1(2*s)}"/>`).join("");
  const near = `<path d="M${P(-48, 8)} L${P(48, 8)}" stroke="#D9C084" stroke-width="${f1(2.6*s)}" stroke-linecap="round"/><path d="M${P(-48, 8)} L${P(48, 8)}" stroke="#A88E54" stroke-width="${f1(2.6*s)}" stroke-dasharray="${f1(.8*s)} ${f1(9*s)}"/>`;
  const eye = `<ellipse cx="${f1(x + 33*s*dir)}" cy="${f1(y - 5.6*s)}" rx="${f1(3.6*s)}" ry="${f1(2.4*s)}" fill="#FFFDF6" stroke="#2B2A29" stroke-width=".7"/><circle cx="${f1(x + 34*s*dir)}" cy="${f1(y - 5.6*s)}" r="${f1(1.4*s)}" fill="#2B2A29"/><path d="M${P(29, -8.4)} Q${P(33, -10.6)} ${P(38, -8)}" fill="none" stroke="#C9302A" stroke-width="${f1(1*s)}"/>`;
  const snout = `<path d="M${P(44, -11.4)} L${P(60, -17)} L${P(48, -9)}z" fill="${stripe}"/>`;
  const sail = o.sail ? `<path d="M${P(4, -11)} L${P(10, -62)}" stroke="${C.wood}" stroke-width="${f1(1.4*s)}"/><path d="M${P(-24, -18)} Q${P(-4, -40)} ${P(12, -66)} Q${P(22, -36)} ${P(34, -20)} Q${P(4, -24)} ${P(-24, -18)}z" fill="${o.sail}" stroke="var(--line)" stroke-width=".8"/><path d="M${P(-12, -23)} Q${P(4, -40)} ${P(11, -58)} M${P(-2, -22)} Q${P(10, -38)} ${P(14, -52)}" fill="none" stroke="${o.sail2 || "#E8566C"}" stroke-width="${f1(2.2*s)}"/>`
    : `<path d="M${P(-30, -13)} L${P(30, -15)}" stroke="${C.wood}" stroke-width="${f1(1.6*s)}"/><path d="M${P(-24, -14.5)} L${P(22, -16)}" stroke="${o.furl || "#E8566C"}" stroke-width="${f1(3.4*s)}" stroke-linecap="round"/>`;
  const body = far + sk(`<path d="${hd}" fill="${hull}"/><path d="M${P(-38, -7)} L${P(42, -8)}" stroke="${stripe}" stroke-width="${f1(2.4*s)}"/><path d="M${P(-36, -2.6)} Q${P(0, 0)} ${P(38, -3.4)}" stroke="${o.stripe2 || "#FFFDF6"}" stroke-width="${f1(1.2*s)}" fill="none"/>${snout}`, `<path d="${hd}"/>`) + eye + sail + arms + near;
  return NP(o.afloat ? `<g>${bob(-1.6, 3.2 + i*.5, -i)}<ellipse cx="${f1(x)}" cy="${f1(y + 4*s)}" rx="${f1(50*s)}" ry="${f1(3*s)}" fill="${C.foam}" opacity=".5"/>${body}</g>` : `<ellipse cx="${f1(x)}" cy="${f1(y + 9*s)}" rx="${f1(52*s)}" ry="${f1(4*s)}" fill="#7A6040" opacity=".16"/>${body}`);
}
// your own boat (the same boat as at home: white hull, blue stripe, red flag), pulled up in the shallows
const yourBoat = (x, y) => NP(`<g>${bob(-1.4, 3.4)}<ellipse cx="${x + 3}" cy="${y + 2}" rx="52" ry="4" fill="${C.foam}" opacity=".6"/>${sk(`<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z" style="fill:#FFFDF6"/><path d="M${x - 36} ${y - 10} h78" style="stroke:#3E6B8C" stroke-width="3"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3" style="fill:#CFE0EE"/><path d="M${x + 30} ${y - 36} v-22 l14 9z" style="fill:#E8566C"/>`,
  `<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3"/><path d="M${x + 30} ${y - 18} v-40 l14 9 l-14 4"/>`)}</g>`);
// the great kites of Sanur: a bebean (a fish), a janggan (a bird with a tail as long as a street) and a pecukan (a
// leaf), bobbing on the wind at the end of their long strings
function kite(x, y, kind, i, sx, sy){
  const str = `<path d="M${x} ${y + 4} Q${f1((x + sx)/2 + 20)} ${f1((y + sy)/2 + 30)} ${sx} ${sy}" fill="none" stroke="#4A4038" stroke-width=".5" opacity=".55"/>`;
  const body = kind === "fish" ? `<path d="M${x - 16} ${y} Q${x} ${y - 11} ${x + 15} ${y} Q${x} ${y + 11} ${x - 16} ${y}z" fill="#D9403A" stroke="var(--line)" stroke-width=".8"/><path d="M${x - 15} ${y} L${x - 28} ${y - 9} L${x - 24} ${y} L${x - 28} ${y + 9}z" fill="#2B2A29"/><path d="M${x - 4} ${y - 7} l4 -7 l4 6 M${x - 4} ${y + 7} l4 7 l4 -6" fill="#F2C230" stroke="var(--line)" stroke-width=".6"/><path d="M${x - 8} ${y - 6} q2 6 0 12 M${x - 1} ${y - 8} q2 8 0 16" fill="none" stroke="#FFFDF6" stroke-width="1.6"/><circle cx="${x + 9}" cy="${y - 1.6}" r="2" fill="#FFFDF6"/><circle cx="${x + 9.4}" cy="${y - 1.6}" r=".9" fill="#2B2A29"/>`
    : kind === "bird" ? `<path d="M${x} ${y - 10} L${x + 20} ${y - 2} L${x + 6} ${y + 2} L${x} ${y + 8} L${x - 6} ${y + 2} L${x - 20} ${y - 2}z" fill="#FFFDF6" stroke="var(--line)" stroke-width=".8"/><path d="M${x - 14} ${y - 2} L${x + 14} ${y - 2}" stroke="#E8566C" stroke-width="2"/><circle cx="${x}" cy="${y - 4}" r="2.4" fill="#2B2A29"/><path d="M${x} ${y + 8} q12 24 -4 46 q-16 22 4 50 q14 20 -2 42" fill="none" stroke="#E8566C" stroke-width="2.6"><animate attributeName="d" values="M${x} ${y + 8} q12 24 -4 46 q-16 22 4 50 q14 20 -2 42;M${x} ${y + 8} q-10 24 4 46 q16 22 -4 50 q-14 20 4 42;M${x} ${y + 8} q12 24 -4 46 q-16 22 4 50 q14 20 -2 42" dur="5s" repeatCount="indefinite"/></path><path d="M${x} ${y + 8} q12 24 -4 46 q-16 22 4 50 q14 20 -2 42" fill="none" stroke="#F2C230" stroke-width="1" stroke-dasharray="3 5" opacity=".9"><animate attributeName="d" values="M${x} ${y + 8} q12 24 -4 46 q-16 22 4 50 q14 20 -2 42;M${x} ${y + 8} q-10 24 4 46 q16 22 -4 50 q-14 20 4 42;M${x} ${y + 8} q12 24 -4 46 q-16 22 4 50 q14 20 -2 42" dur="5s" repeatCount="indefinite"/></path>`
    : `<path d="M${x} ${y - 13} Q${x + 12} ${y - 2} ${x} ${y + 12} Q${x - 12} ${y - 2} ${x} ${y - 13}z" fill="#F2C230" stroke="var(--line)" stroke-width=".8"/><path d="M${x} ${y - 13} V${y + 12} M${x - 9} ${y - 2} H${x + 9}" stroke="#7A4A2E" stroke-width=".8"/><path d="M${x} ${y + 12} q-4 8 2 14 q4 6 -1 12" fill="none" stroke="#3E8FC0" stroke-width="1.6"/>`;
  return NP(str + `<g>${bob(-4, 5 + i, -i)}<g>${swing(x, y, 6, 4 + i*.7, -i)}${body}</g></g>`);
}
// a penjor (Galungan): a tall bamboo pole bending over at the top into a long curve, hung with palm-leaf ornaments, a
// sampian dangling from the tip and a little offering shelf part way up
function penjor(x, y, s = 1, dir = 1, i = 0){
  const P = (dx, dy) => [x + dx*s*dir, y + dy*s], A = P(0, -92), B = P(0, -156), Cc = P(40, -170), T = P(62, -122);
  const arc = `M${f1(A[0])} ${f1(A[1])} C${f1(B[0])} ${f1(B[1])} ${f1(Cc[0])} ${f1(Cc[1])} ${f1(T[0])} ${f1(T[1])}`;
  const at = t => { const u = 1 - t; return [u*u*u*A[0] + 3*u*u*t*B[0] + 3*u*t*t*Cc[0] + t*t*t*T[0], u*u*u*A[1] + 3*u*u*t*B[1] + 3*u*t*t*Cc[1] + t*t*t*T[1]]; };
  // the janur fringe of young palm leaf hanging all along the curve, with a red or white tassel now and then
  const fringe = Array.from({length: 16}, (_, k) => { const [px, py] = at(.06 + k*.058); return `<path d="M${f1(px)} ${f1(py)} l${f1(-1.5*s)} ${f1(9*s)} M${f1(px)} ${f1(py)} l${f1(1.5*s)} ${f1(8*s)}" stroke="#EFE29A" stroke-width="${f1(1.6*s)}"/>${k % 4 === 1 ? `<circle cx="${f1(px)}" cy="${f1(py + 10*s)}" r="${f1(1.6*s)}" fill="${k % 8 === 1 ? "#E0403A" : "#FFFDF4"}"/>` : ""}`; }).join("");
  const tassels = Array.from({length: 6}, (_, k) => { const yy = y - 24*s - k*11*s; return `M${x} ${f1(yy)} l${f1(-5*s)} ${f1(6*s)} M${x} ${f1(yy)} l${f1(5*s)} ${f1(6*s)}`; }).join(" ");
  return NP(`<path d="M${x} ${y} V${f1(A[1])}" stroke="${C.bamboo2}" stroke-width="${f1(4.6*s)}"/><path d="M${x} ${y} V${f1(A[1])}" stroke="${C.bamboo}" stroke-width="${f1(2.8*s)}"/><path d="M${x} ${y} V${f1(A[1])}" stroke="${C.bamboo2}" stroke-width="${f1(2.8*s)}" stroke-dasharray="${f1(.8*s)} ${f1(14*s)}"/><path d="${tassels}" stroke="#EFE29A" stroke-width="${f1(1.8*s)}" stroke-linecap="round"/>
    <path d="M${f1(x - 4*s)} ${f1(y - 88*s)} h${f1(8*s)} v${f1(40*s)} l${f1(-4*s)} ${f1(6*s)} l${f1(-4*s)} ${f1(-6*s)}z" fill="#EADB8A" stroke="#B8A250" stroke-width=".6"/><path d="M${x} ${f1(y - 84*s)} v${f1(36*s)}" stroke="#6E9A48" stroke-width="${f1(1.6*s)}" stroke-dasharray="${f1(3*s)} ${f1(2*s)}"/><path d="M${f1(x - 3*s)} ${f1(y - 70*s)} h${f1(6*s)} M${f1(x - 3*s)} ${f1(y - 58*s)} h${f1(6*s)}" stroke="#E0403A" stroke-width=".8"/>
    <rect x="${f1(x - 7*s)}" y="${f1(y - 30*s)}" width="${f1(14*s)}" height="${f1(8*s)}" fill="${C.bamboo}" stroke="var(--line)" stroke-width=".6"/><path d="M${f1(x - 9*s)} ${f1(y - 30*s)} L${x} ${f1(y - 37*s)} L${f1(x + 9*s)} ${f1(y - 30*s)}z" fill="${C.thatch}" stroke="var(--line)" stroke-width=".5"/>${canang(x, y - 31*s, .55*s)}
    <g>${swing(x, A[1], 2.5, 5 + i % 3, -i)}<path d="${arc}" fill="none" stroke="${C.bamboo2}" stroke-width="${f1(3.4*s)}"/><path d="${arc}" fill="none" stroke="${C.bamboo}" stroke-width="${f1(2*s)}"/>${fringe}
      <g>${swing(T[0], T[1], 7, 3 + i % 2, -i)}<path d="M${f1(T[0])} ${f1(T[1])} v${f1(6*s)}" stroke="${C.bamboo2}" stroke-width="1"/><path d="M${f1(T[0])} ${f1(T[1] + 6*s)} l${f1(-8*s)} ${f1(10*s)} l${f1(8*s)} ${f1(14*s)} l${f1(8*s)} ${f1(-14*s)}z" fill="#EFE29A" stroke="#B8A250" stroke-width=".7"/><path d="M${f1(T[0] - 5*s)} ${f1(T[1] + 16*s)} l${f1(5*s)} ${f1(6*s)} l${f1(5*s)} ${f1(-6*s)}" fill="none" stroke="#6E9A48" stroke-width="1"/><circle cx="${f1(T[0])}" cy="${f1(T[1] + 14*s)}" r="${f1(2.2*s)}" fill="#E0403A"/><path d="M${f1(T[0] - 4*s)} ${f1(T[1] + 26*s)} v${f1(12*s)} M${f1(T[0])} ${f1(T[1] + 30*s)} v${f1(14*s)} M${f1(T[0] + 4*s)} ${f1(T[1] + 26*s)} v${f1(12*s)}" stroke="#E6D27A" stroke-width="1.2"/></g></g>`);
}

/* ---------- creatures ---------- */
// an Indian runner duck: upright as a bottle, white or brown, waddling (feet at 0 0)
const duck = (k, brown = false) => `<g>${swing(0, 0, 7, .7, -k*.23)}<path d="M-1.6 0 l-1.4 1.6 M1.6 0 l1.4 1.6" stroke="#E3973A" stroke-width="1.1"/><ellipse cx="0" cy="-7" rx="3.8" ry="7.4" transform="rotate(16 0 -7)" fill="${brown ? "#A58560" : "#F6F1E6"}" stroke="var(--line)" stroke-width=".7"/><path d="M1.6 -12 q1 -4 .4 -6" stroke="${brown ? "#A58560" : "#F6F1E6"}" stroke-width="2.6"/><circle cx="2.2" cy="-18.8" r="2.6" fill="${brown ? "#6E5A3E" : "#F6F1E6"}" stroke="var(--line)" stroke-width=".7"/><path d="M4.4 -19 l4.4 1 l-4.4 1.2z" fill="#E3A33A"/><circle cx="3" cy="-19.6" r=".6" fill="#2B2A29"/></g>`;
// a long-tailed macaque sitting (feet at x y), its head turning now and then
const macaque = (x, y, s = 1, dir = 1, i = 0) => NP(`<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})"><path d="M5 -2 q14 0 12 12 q-1 6 -7 5" fill="none" stroke="${C.monkey}" stroke-width="2.2" stroke-linecap="round"/><path d="M-7 0 Q-9 -13 0 -16 Q9 -13 7 0z" fill="${C.monkey}" stroke="var(--line)" stroke-width=".8"/><ellipse cx="0" cy="-6" rx="4" ry="5" fill="${C.monkey2}"/><ellipse cx="-4.5" cy="-1" rx="3.4" ry="2.2" fill="${C.monkey}" stroke="var(--line)" stroke-width=".6"/><ellipse cx="4.5" cy="-1" rx="3.4" ry="2.2" fill="${C.monkey}" stroke="var(--line)" stroke-width=".6"/>
  <g>${swing(0, -16, 9, 3.4 + i*.8, -i)}<circle cx="0" cy="-21" r="5.6" fill="${C.monkey}" stroke="var(--line)" stroke-width=".8"/><circle cx="-5.4" cy="-21.6" r="1.6" fill="${C.face}"/><circle cx="5.4" cy="-21.6" r="1.6" fill="${C.face}"/><ellipse cx=".8" cy="-20" rx="3.6" ry="3.2" fill="${C.face}"/><circle cx="-.6" cy="-21" r=".7" fill="#2B2A29"/><circle cx="2.2" cy="-21" r=".7" fill="#2B2A29"/><path d="M-3 -25.6 q3 -2 6 0" stroke="#6E5E46" stroke-width="1.4" fill="none"/></g></g>`);
// a koi turning slow circles (drawn at the origin facing +x; o.path is the loop it swims)
const koi = (path, col, spot, dur, begin, s = 1) => `<g><animateMotion path="${path}" dur="${dur}s" begin="${begin}s" rotate="auto" repeatCount="indefinite"/><g transform="scale(${s})"><path d="M8 0 Q4 -3.6 -3 -2.2 L-8 -4 L-6.4 0 L-8 4 L-3 2.2 Q4 3.6 8 0z" fill="${col}" stroke="#8A4A2A" stroke-width=".4"/><ellipse cx="2" cy="0" rx="2.4" ry="1.4" fill="${spot}"/></g></g>`;
const lotusPad = (x, y, r, k = 0) => `<path d="M${f1(x)} ${f1(y)} L${f1(x + r)} ${f1(y - r*.12)} A${f1(r)} ${f1(r*.55)} 0 1 0 ${f1(x + r)} ${f1(y + r*.12)}z" transform="rotate(${(k*67) % 360} ${f1(x)} ${f1(y)})" fill="${k % 2 ? C.pad : C.pad2}" stroke="#3E6E32" stroke-width=".6"/>`;
const lotus = (x, y, s = 1) => `<path d="M${x} ${y} v${f1(8*s)}" stroke="#4E7A32" stroke-width="1"/>${[-50, -25, 0, 25, 50].map((a, k) => `<path d="M${x} ${y} q${f1(-3*s)} ${f1(-6*s)} 0 ${f1(-11*s)} q${f1(3*s)} ${f1(5*s)} 0 ${f1(11*s)}z" transform="rotate(${a} ${x} ${y})" fill="${k === 2 ? "#F7B6CE" : C.lotus}" stroke="#C9547E" stroke-width=".5"/>`).join("")}<circle cx="${x}" cy="${f1(y - 3*s)}" r="${f1(1.6*s)}" fill="#F2D35E"/>`;

/* ---------- ground, water, light ---------- */
const water = (d, col) => NP(sk(`<path d="${d}" fill="${col}"/>`, `<path d="${d}"/>`));
const waves = (pts, col = C.foam) => NP(`<g stroke="${col}" stroke-width="1.4" fill="none" opacity=".85">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;5 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`);
const ground = (col, blobs) => `<rect width="520" height="640" fill="${col}"/><g filter="url(#wash)" opacity=".5" pointer-events="none">${blobs.map(([x, y, rx, ry, c]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join("")}</g>`;
const trail = (d, w, c1 = C.earth, c2 = "#DCC497") => NP(`<g filter="url(#wob)"><path d="${d}" fill="none" stroke="${c1}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c2}" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/></g>`);
// paving: rough-cut stone flags in courses
const flags = (x, y, w, h, col = C.lane2, s = 18) => `<g pointer-events="none" opacity=".5">${Array.from({length: Math.ceil(h/s)}, (_, k) => `<path d="M${x} ${y + k*s} H${x + w}" stroke="${col}" stroke-width=".8"/>${Array.from({length: Math.ceil(w/26)}, (_, j) => `<path d="M${x + j*26 + (k % 2)*13} ${y + k*s} v${s}" stroke="${col}" stroke-width=".8"/>`).join("")}`).join("")}</g>`;
// a distant volcano in the haze, a wisp of cloud round its shoulder
const volcano = (cx, base, w, h, col = "#9DB0C0") => NP(`<path d="M${cx - w/2} ${base} Q${f1(cx - w*.2)} ${f1(base - h*.55)} ${f1(cx - w*.06)} ${base - h} L${f1(cx + w*.05)} ${base - h} Q${f1(cx + w*.2)} ${f1(base - h*.55)} ${cx + w/2} ${base}z" fill="${col}"/><path d="M${f1(cx + w*.05)} ${base - h} Q${f1(cx + w*.2)} ${f1(base - h*.55)} ${cx + w/2} ${base} H${f1(cx + w*.22)} Q${f1(cx + w*.12)} ${f1(base - h*.5)} ${f1(cx + w*.01)} ${base - h}z" fill="#FFFFFF" opacity=".16"/><path d="M${f1(cx - w*.06)} ${base - h} l${f1(w*.03)} ${f1(h*.12)} l${f1(w*.03)} ${f1(-h*.06)} l${f1(w*.04)} ${f1(h*.1)} l${f1(-w*.01)} ${f1(-h*.16)}z" fill="#E8EEF2" opacity=".7"/>
  <g>${`<animateTransform attributeName="transform" type="translate" values="0 0;12 0;0 0" dur="40s" repeatCount="indefinite"/>`}<ellipse cx="${f1(cx - w*.16)}" cy="${f1(base - h*.6)}" rx="${f1(w*.16)}" ry="${f1(h*.08)}" fill="#FFFFFF" opacity=".75"/><ellipse cx="${f1(cx + w*.02)}" cy="${f1(base - h*.66)}" rx="${f1(w*.12)}" ry="${f1(h*.07)}" fill="#FFFFFF" opacity=".65"/></g>`);
// the light: golden in the dry season; in the wet season a warm short downpour on some afternoons
const doy = () => { const d = dayKey(); return Math.round((Date.parse(d + "T00:00:00Z") - Date.parse(d.slice(0, 4) + "-01-01T00:00:00Z"))/864e5); };
function light(){
  if (!wet()) return `<rect width="520" height="640" fill="#FFC864" opacity=".07" pointer-events="none"/>`;
  const m = sgHM(); if (m < 14*60 || m >= 17*60 || rnd(doy()*3.1) > .65) return "";
  return NP(`<rect width="520" height="640" fill="#5E7A86" opacity=".12"/><g stroke="#E8F2F6" stroke-width="1" opacity=".55">${Array.from({length: 70}, (_, k) => { const x = rnd(k*3.3)*560 - 20, y = rnd(k*7.7)*640; return `<path d="M${f1(x)} ${f1(y)} l-4 12"><animateTransform attributeName="transform" type="translate" values="0 -40;-12 640" dur="${f1(.9 + rnd(k)*.5)}s" begin="${f1(-rnd(k*2)*1.4)}s" repeatCount="indefinite"/></path>`; }).join("")}</g>`);
}
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:${C.bamboo2}"/><path d="M${x - 3} ${y - 20} h6 M${x - 3} ${y - 6} h6" style="stroke:${C.wood}" stroke-width="1"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 22} h16" style="stroke:${C.brick}" stroke-width="2"/>`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
// the tap area over your boat (the drawing itself ignores taps): Mel couldn't easily tap the boat to sail home
const boatHit = (x, y) => `<rect x="${x - 50}" y="${y - 66}" width="104" height="76" fill="transparent" pointer-events="all"/>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;

/* ---------- ba_beach: Sanur beach ---------- */
function beachScreen(){
  const [gr, gr2] = grassCols(), shore = [[530, 182], [470, 188], [420, 180], [360, 177], [300, 186], [240, 181], [180, 176], [120, 183], [60, 178], [-10, 182]];
  const sand = ground(C.sand, [[260, 400, 200, 120, C.sand2], [120, 520, 120, 50, "#E8D3A4"], [420, 380, 90, 60, C.sand2]]);
  // the sky and Mount Agung on the horizon, the sea and the reef along the top, the shallows and the wet sand
  const sky = `<rect width="520" height="46" fill="${wet() ? "#C9DADF" : "#D9ECF2"}"/>` + volcano(400, 46, 210, 40) + NP(`<path d="M0 44 Q60 38 120 42 Q170 44 210 46 H0z" fill="#8AA88A" opacity=".6"/>`);
  const sea = water(`M-10 44 H530 L530 182${segs(shore)} Z`, C.sea) + NP(`<path d="M-10 44 H530 V74 Q400 82 260 72 Q120 64 -10 76z" fill="${C.deep}" opacity=".7"/><path d="M-10 120 Q120 112 260 122 Q400 130 530 118 L530 182 ${segs(shore)} Z" fill="${C.shallow}" opacity=".85"/><path d="M-10 150 Q140 146 260 154 Q400 160 530 150 L530 182 ${segs(shore)} Z" fill="${C.reef}" opacity=".6"/>`)
    + NP(`<g stroke="${C.foam}" stroke-width="1.5" fill="none" opacity=".55" stroke-dasharray="5 19">${[[100, 0]].map(([y, d], k) => `<path d="M-10 ${y} Q130 ${y - 6} 260 ${y + 2} Q400 ${y + 8} 530 ${y - 2}"><animate attributeName="stroke-dashoffset" values="0;-46" dur="${6 + k*2}s" repeatCount="indefinite"/></path>`).join("")}</g>`)
    + waves([[30, 60], [150, 70], [330, 58], [450, 66], [80, 132], [380, 138], [210, 116]]);
  const foam = NP(`<path d="${smooth(shore)}" fill="none" stroke="${C.foam}" stroke-width="3.4" stroke-linecap="round"><animateTransform attributeName="transform" type="translate" values="0 0;0 3;0 0" dur="5s" repeatCount="indefinite"/><animate attributeName="opacity" values=".95;.5;.95" dur="5s" repeatCount="indefinite"/></path><path d="${smooth(shore.map(([x, y]) => [x, y + 5]))} L530 200 L-10 200z" fill="${C.wetsand}" opacity=".7"/>`);
  // boats out on the water: jukung under sail beyond the reef
  const sailing = jukung(110, 112, .55, 1, "#FFFDF6", "#3E8FC0", 0, {afloat: true, sail: "#FFFDF6", sail2: "#E8566C"}) + jukung(232, 82, .42, -1, "#F2C230", "#2B2A29", 1, {afloat: true, sail: "#F2C230", sail2: "#2B7A9A"})
    + NP(`<g><animateTransform attributeName="transform" type="translate" values="0 0;-30 0;0 0" dur="60s" repeatCount="indefinite"/>${jukung(470, 98, .38, -1, "#3E8FC0", "#FFFDF6", 2, {afloat: true, sail: "#E8566C", sail2: "#FFFDF6"})}</g>`);
  // kites over the sea in season, their strings running down to the rack on the sand
  const flying = kiteDay() ? kite(176, 28, "fish", 0, 214, 306) + kite(392, 22, "bird", 1, 214, 306) + kite(330, 74, "leaf", 2, 214, 306) + kite(40, 70, "leaf", 3, 214, 306) : "";
  // your boat in the shallows among the jukung
  const boat = place("baboat", 300, 200, 34, 10, "Your boat on the reef edge", yourBoat(296, 186) + boatHit(296, 186), "Your boat", 212, 206, "#BFE0DA");
  // the jukung pulled up on the sand: white, yellow and blue hulls, stripes, eyes, furled sails, a net drying
  const boats = place("bajukung", 430, 314, 32, 10, "The jukung, the painted outrigger boats", palm(508, 196, .85, -1, 6) + jukung(438, 226, .9, -1, "#FFFDF6", "#C9302A", 0, {furl: "#3E8FC0"}) + jukung(452, 262, .95, 1, "#F2C230", "#2B7A9A", 1, {furl: "#E8566C", stripe2: "#C9302A"}) + jukung(430, 296, .85, -1, "#3E8FC0", "#FFFDF6", 2, {furl: "#F2C230", stripe2: "#F2C230"})
    + NP(`<path d="M376 300 q8 -6 16 0 q8 6 16 0" fill="none" stroke="#3E6B8C" stroke-width="2" stroke-dasharray="1.6 1.2" opacity=".7"/>`), "Jukung", 440, 334, "#BFE0DA");
  // Nyoman's warung: woven bamboo walls, a shaggy thatched roof, the glass cabinet of nasi campur, coconuts by the door
  const dishes = [[58, 291, "#E0703A"], [68, 291, "#F2C230"], [78, 291, "#6E9A3A"], [88, 291, "#8A4A2A"], [62, 299, "#F7F3E8"], [72, 299, "#C9302A"], [82, 299, "#E8B04A"]];
  const warung = place("bawarung", 96, 358, 28, 9, "Nyoman's warung", palm(16, 262, .9, 1, 2) + NP(sk(`<rect x="12" y="262" width="160" height="70" fill="#D6B577"/><clipPath id="baWar"><rect x="12" y="262" width="160" height="70"/></clipPath><path d="${Array.from({length: 23}, (_, k) => `M${12 + k*8} 262 l-10 70 M${12 + k*8 - 6} 262 l10 70`).join(" ")}" stroke="#B8955A" stroke-width=".6" opacity=".7" clip-path="url(#baWar)"/>
      <rect x="82" y="276" width="28" height="56" fill="#4E3A2A"/><rect x="22" y="306" width="58" height="26" fill="${C.wood}"/><rect x="112" y="306" width="50" height="26" fill="${C.wood}"/><rect x="50" y="284" width="46" height="22" fill="#DDF0F0" opacity=".92"/><path d="M50 295 h46" stroke="#9AB8BA" stroke-width=".8"/>
      ${dishes.map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.2" fill="${c}" stroke="#8A7A6A" stroke-width=".4"/>`).join("")}<rect x="128" y="290" width="22" height="16" fill="#3E8FC0"/><path d="M128 296 h22" stroke="#FFFDF6" stroke-width="1"/>
      ${[14, 80, 112, 166].map(x => `<rect x="${x - 2.5}" y="262" width="5" height="70" fill="${C.wood2}"/>`).join("")}`, `<rect x="12" y="262" width="160" height="70"/><rect x="82" y="276" width="28" height="56"/>`))
    + thatch(4, 180, 266, 58)
    + NP(`<path d="M10 270 Q96 280 176 270" fill="none" stroke="#3A3430" stroke-width=".6"/>${[24, 44, 64, 128, 148, 168].map((x, k) => `<circle cx="${x}" cy="${272 + Math.sin(k)*2}" r="2.2" fill="${["#F3C969", "#E8566C", "#9FD3E8"][k % 3]}" class="twinkle" style="animation-delay:${k*.4}s"/>`).join("")}`)
    + `<rect x="58" y="238" width="76" height="14" rx="2" fill="#FFFDF6" stroke="var(--line)" stroke-width=".8" pointer-events="none"/><text x="96" y="248.4" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${C.ink}" pointer-events="none">Warung Nyoman</text>`
    + NP(sk(`${[[158, 334], [168, 334], [163, 326], [176, 334], [172, 326], [166, 318]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.2" fill="#7E9A3A"/><circle cx="${x - 1.6}" cy="${y - 1.6}" r="1.4" fill="#A9C25A"/>`).join("")}<rect x="24" y="330" width="40" height="6" fill="${C.wood}"/><path d="M28 336 v6 M60 336 v6" stroke="${C.wood2}" stroke-width="2"/><rect x="118" y="330" width="34" height="6" fill="${C.wood}"/><path d="M122 336 v6 M148 336 v6" stroke="${C.wood2}" stroke-width="2"/>`, "")
    + fFlower(40, 328, 3) + fFlower(134, 327, 3, true) + canang(96, 338, 1, true, 4)), "The warung", 96, 378, "#F2C9B4");
  // the kite rack: a bamboo A-frame with a big fish kite resting on it, and a pile of string
  const rack = place("bakites", 214, 364, 26, 9, "The kites of Sanur", NP(sk(`<path d="M190 344 L210 300 L230 344 M196 330 H224" fill="none" stroke="${C.bamboo2}" stroke-width="3"/><g transform="rotate(-18 214 322)"><path d="M194 322 Q212 306 232 322 Q212 338 194 322z" fill="#D9403A"/><path d="M196 322 L184 312 L188 322 L184 332z" fill="#2B2A29"/><path d="M204 312 q3 10 0 20 M214 309 q3 13 0 26" fill="none" stroke="#FFFDF6" stroke-width="2"/><circle cx="224" cy="320" r="2" fill="#FFFDF6"/></g><ellipse cx="236" cy="342" rx="6" ry="3" fill="#E6DCC4"/><circle cx="236" cy="341" r="2" fill="#B8A88A"/>`,
      `<path d="M190 344 L210 300 L230 344"/>`)), kiteDay() ? "Kites flying" : "Kites", 214, 384);
  // the little beach shrine on its stone step, umbrellas either side, offerings and incense
  const sh = place("bashrine1", 452, 490, 26, 9, "The little beach shrine", NP(sk(`<rect x="414" y="446" width="82" height="26" fill="${C.paras2}"/>${carved(414, 446, 82, 7)}${courses(414, 453, 82, 19, C.paras3, 6)}<rect x="438" y="470" width="34" height="6" fill="${C.paras}"/>`, `<rect x="414" y="446" width="82" height="26"/>`))
    + umbrella(422, 448, 74, C.white, 0) + umbrella(488, 448, 74, C.cloth, 1) + shrine(455, 448, 1.08) + canangs([[428, 474], [482, 474]]), "Beach shrine", 452, 510, "#F2C9B4");
  // along the bottom: the grass verge, the paved beach path, the lane inland, palms, hibiscus and a frangipani
  const verge = NP(`<path d="M-10 552 Q120 544 260 552 Q400 560 530 548 V650 H-10z" fill="${gr}"/><path d="M-10 562 Q120 556 240 562 V650 H360 V562 Q440 566 530 558" fill="none" stroke="${gr2}" stroke-width="2" opacity=".6"/>`)
    + trail("M-10 568 Q130 562 260 568 Q400 574 530 566", 26, "#C9A27A", "#DDBF95") + trail("M300 566 V650", 70, "#C9A27A", "#DDBF95")
    + NP([[30, 572], [90, 590], [170, 584], [400, 590], [470, 576], [500, 610], [140, 620], [60, 626]].map(([x, y]) => tuft(x, y, gr2)).join(""));
  const trees = palm(34, 414, .95, 1, 0) + hibiscus(110, 614, 1.1) + hibiscus(404, 618, 1) + frangipani(474, 606, 1, false, 2) + palm(64, 630, 1, 1, 3) + palm(196, 638, .82, -1, 4) + palm(430, 640, .9, -1, 5)
    + frangipani(24, 604, .8, true, 6);
  const pj = galungan() ? penjor(214, 596, .95, 1, 0) + penjor(388, 598, .95, -1, 1) + penjor(150, 584, .8, 1, 2) + penjor(450, 584, .8, -1, 3) : "";
  // little things on the sand: shells, a strand of seaweed, footprints down to the water, petals by the warung
  const bits = NP(`${[[180, 240], [340, 250], [260, 420], [380, 470], [120, 470], [300, 520]].map(([x, y], k) => `<path d="M${x - 3} ${y + 1} q3 -6 6 0z" fill="${["#FFFDF6", "#F4D7C8", "#F2B9A8"][k % 3]}" stroke="#B8A88A" stroke-width=".5"/>`).join("")}<path d="M150 206 q10 -4 20 2 q8 4 16 -2" fill="none" stroke="#6E8A4A" stroke-width="1.6" opacity=".7"/>${[[330, 236], [338, 252], [334, 270], [344, 288], [338, 306], [348, 324]].map(([x, y], k) => `<ellipse cx="${x + (k % 2)*6}" cy="${y}" rx="2" ry="3" fill="#C9B184" opacity=".6"/>`).join("")}`) + petals([[118, 372], [60, 366], [170, 362], [492, 520], [436, 524]]);
  return DEFS + sand + sea + sky + foam + sailing + verge + bits + rack + boats + warung + sh + boat + trees + pj + flying + light()
    + gate("baToTerraces", 20, 470, "Rice terraces", 84, 438, "West up the coconut track to the rice terraces")
    + gate("baToUbud", 300, 612, "Ubud", 244, 618, "South along the lane inland to Ubud", "#BFE0DA");
}

/* ---------- ba_ubud: the village ---------- */
function ubudScreen(){
  const [gr, gr2] = grassCols();
  const base = ground(gr, [[260, 330, 220, 120, wet() ? "#9CCB64" : "#B5C670"], [120, 560, 120, 60, gr2]]);
  // the lanes: south from the beach road, and west to the temple road; paved, mossy at the edges
  const lanes = NP(`<g filter="url(#wob)"><path d="M292 -10 V650 M300 330 H-10" fill="none" stroke="${C.moss}" stroke-width="92" opacity=".35"/><path d="M292 -10 V650 M300 330 H-10" fill="none" stroke="${C.lane}" stroke-width="80"/></g>`) + NP(`<g opacity=".6">${flags(254, 0, 76, 640)}${flags(0, 292, 254, 76)}</g>`);
  // Ibu Wayan's family compound: the wall, the carved angkul-angkul gate under its own little thatched roof, the bale
  // roofs and family shrines peeking over, a frangipani, and baskets of petals sorted by colour by the step
  const behind = palm(206, 170, .95, -1, 1) + frangipani(54, 160, 1, false, 3) + thatch(12, 96, 128, 30) + thatch(150, 190, 112, 22, true) + thatch(176, 214, 104, 24, true)
    + NP(`<path d="M20 70 H100" stroke="#6E5A40" stroke-width=".8"/>${[30, 46, 62, 78, 94].map(x => `<path d="M${x} 70 q-3 12 0 26" stroke="#B9C86A" stroke-width="3" fill="none"/>`).join("")}`);
  const wall = NP(sk(`<rect x="0" y="168" width="238" height="58" fill="${C.brick}"/>${courses(0, 168, 238, 58, C.brick2, 6, .45)}${carved(0, 162, 238, 8)}${[18, 50, 82, 178, 206, 230].map(x => finial(x, 163)).join("")}`, `<rect x="0" y="162" width="238" height="64"/>`));
  const angkul = NP(sk(`<rect x="100" y="140" width="60" height="86" fill="${C.paras}"/>${courses(100, 140, 60, 86, C.paras3, 7)}<rect x="104" y="150" width="8" height="76" fill="${C.brick}"/><rect x="148" y="150" width="8" height="76" fill="${C.brick}"/><path d="M114 226 V176 Q130 160 146 176 V226z" fill="#3A2820"/><rect x="114" y="180" width="8" height="46" fill="${C.red}" transform="skewY(4)"/><rect x="138" y="182" width="8" height="46" fill="${C.red}" transform="skewY(-4)"/><path d="M118 186 v34 M142 186 v34" stroke="${C.gold}" stroke-width="1"/><rect x="110" y="226" width="40" height="6" fill="${C.paras2}"/>`, `<rect x="100" y="140" width="60" height="86"/><path d="M114 226 V176 Q130 160 146 176 V226"/>`))
    + thatch(96, 164, 144, 34) + NP(`<path d="M126 108 h8 l-4 -8z" fill="${C.gold}"/>`);
  const basket = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="4" fill="#B48A50" stroke="var(--line)" stroke-width=".7"/><ellipse cx="${x}" cy="${y - 2}" rx="7.6" ry="3" fill="${c}"/>${[-4, 0, 4].map(d => `<circle cx="${x + d}" cy="${y - 3}" r="1.6" fill="${c}" stroke="#FFFFFF" stroke-width=".3" opacity=".9"/>`).join("")}`;
  const offer = place("baoffer", 130, 242, 26, 9, "Ibu Wayan's offerings house", behind + wall + angkul + NP(basket(74, 222, "#FFFDF4") + basket(90, 226, "#E0403A") + basket(172, 222, "#F4C431") + basket(188, 226, "#7A5AC0")) + canangs([[122, 236], [140, 236]]), "Ibu Wayan's offerings", 130, 262, "#F2C9B4");
  // Ketut's silver workshop: white walls and carved stone, a terracotta roof, the window full of silver, a carved door
  const silverWin = `<rect class="wglow" x="358" y="160" width="50" height="44" fill="#3E4650"/>${[[366, 172], [378, 170], [390, 174], [400, 170], [370, 188], [384, 186], [398, 190]].map(([x, y], k) => k % 2 ? `<circle cx="${x}" cy="${y}" r="3.4" fill="none" stroke="#E8EEF2" stroke-width="1"/><circle cx="${x}" cy="${y}" r="1.4" fill="none" stroke="#E8EEF2" stroke-width=".6"/>` : `<path d="M${x} ${y - 4} q3 4 0 8 q-3 -4 0 -8z" fill="none" stroke="#E8EEF2" stroke-width=".9"/><circle cx="${x}" cy="${y}" r=".9" fill="#9FD3E8"/>`).join("")}<path d="M358 182 h50" stroke="#8A8C90" stroke-width=".8"/><path d="M362 164 l10 30" stroke="#FFFFFF" stroke-width="2" opacity=".2"/>`;
  const silver = place("basilver", 424, 242, 26, 9, "Ketut's silver workshop", palm(500, 120, .9, -1, 2) + NP(sk(`<rect x="348" y="118" width="168" height="108" fill="${C.plaster}"/>${carved(348, 118, 168, 8)}<rect x="348" y="214" width="168" height="12" fill="${C.paras2}"/>${silverWin}<rect class="wglow" x="452" y="160" width="50" height="44" fill="#3E4650"/><path d="M477 160 v44 M452 182 h50" stroke="${C.wood}" stroke-width="2"/>
      <rect x="410" y="158" width="30" height="58" fill="${C.gold}"/><rect x="413" y="161" width="24" height="55" fill="${C.wood}"/><path d="M425 161 v55 M416 172 h6 M428 172 h6 M416 196 h6 M428 196 h6" stroke="${C.gold}" stroke-width=".9"/><rect x="406" y="214" width="38" height="6" fill="${C.paras}"/>`,
      `<rect x="348" y="118" width="168" height="108"/><rect x="410" y="158" width="30" height="58"/>`)) + tiles(344, 520, 120, 52)
    + `<rect x="394" y="130" width="62" height="16" rx="2" fill="#FFFDF6" stroke="var(--line)" stroke-width=".8" pointer-events="none"/><text x="425" y="141.6" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8.4" fill="${C.ink}" pointer-events="none">Perak Ketut</text>`
    + NP(sk(`<path d="M350 226 h12 l-2 -9 h-8z M500 226 h12 l-2 -9 h-8z" fill="#B95C3E"/>`, "") + hibiscus(356, 214, .55) + hibiscus(506, 214, .55)) + canang(424, 236, 1, true, 5), "Ketut's silver", 424, 262, "#BFE0DA");
  // the market hall: two great tiled roofs on wooden posts, and underneath it all at once
  const goods = `<rect x="364" y="370" width="152" height="58" fill="#5A4432" opacity=".5"/>${[[376, "#6A3A2A"], [398, "#5A2A4A"], [420, "#D8403A"], [442, "#E8C33A"]].map(([x, c]) => `<ellipse cx="${x}" cy="420" rx="9" ry="5" fill="#B48A50"/>${[-4, 0, 4, -2, 2].map((d, k) => `<circle cx="${x + d}" cy="${416 - (k > 2 ? 3 : 0)}" r="2.6" fill="${c}" stroke="#3A2820" stroke-width=".3"/>`).join("")}`).join("")}
    ${[[470, "#3E8FC0"], [480, "#E0703A"], [490, "#7A5AC0"], [500, "#2B7A5A"], [510, "#C9302A"]].map(([x, c], k) => `<rect x="${x - 4}" y="376" width="8" height="${30 + (k % 2)*8}" fill="${c}"/><path d="M${x - 4} ${386 + k} h8 M${x - 4} ${396 - k} h8" stroke="#F6E3B4" stroke-width="1" stroke-dasharray="1.4 1.4"/>`).join("")}
    ${[[384, 380], [404, 384], [424, 380]].map(([x, y], k) => `<path d="M${x} ${y - 6} l5 6 l-5 6 l-5 -6z" fill="${["#F2C230", "#E8566C", "#3E8FC0"][k]}" stroke="var(--line)" stroke-width=".5"/><path d="M${x} ${y + 6} q2 5 -1 9" fill="none" stroke="#C9302A" stroke-width=".8"/><path d="M${x} ${y - 6} v-8" stroke="#3A3430" stroke-width=".5"/>`).join("")}`;
  const market = place("bamarket", 440, 458, 28, 9, "The market hall", NP(sk(`<rect x="358" y="428" width="162" height="12" fill="${C.paras}"/>${courses(358, 428, 162, 12, C.paras3, 4)}`, `<rect x="358" y="428" width="162" height="12"/>`)
      + goods + sk([366, 412, 458, 512].map(x => `<rect x="${x - 3}" y="366" width="6" height="62" fill="${C.wood}"/>`).join(""), "")) + tiles(358, 520, 368, 40) + NP(sk(`<rect x="398" y="316" width="96" height="16" fill="${C.plaster}"/>${[410, 430, 450, 470].map(x => `<rect x="${x}" y="319" width="10" height="10" fill="#5A4432"/>`).join("")}`, "")) + tiles(394, 498, 318, 34)
    + `<rect x="420" y="342" width="44" height="14" rx="2" fill="#FFFDF6" stroke="var(--line)" stroke-width=".8" pointer-events="none"/><text x="442" y="352.2" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8.4" fill="${C.ink}" pointer-events="none">Pasar</text>` + canangs([[420, 446], [460, 446]]), "Market hall", 456, 462, "#E8C9A8");
  const sh2 = place("bashrine2", 338, 488, 22, 8, "The market shrine", shrine(334, 472, .62, {poleng: true}) + canang(320, 476, .8), "Market shrine", 262, 470, "#F2C9B4");
  // the great banyan: a trunk of a hundred twisted strands wrapped in poleng, curtains of roots, a shrine at its foot
  const trunkStrands = Array.from({length: 11}, (_, k) => { const x = 66 + k*10 + (rnd(k)*6 - 3); return `<path d="M${f1(x)} 580 Q${f1(x + (rnd(k + 3) - .5)*16)} 520 ${f1(110 + (x - 110)*.5)} 452" fill="none" stroke="${k % 2 ? "#8A7860" : "#9D8B72"}" stroke-width="${f1(7 + rnd(k + 7)*4)}" stroke-linecap="round"/>`; }).join("");
  const roots = Array.from({length: 22}, (_, k) => { const x = 8 + k*10.4 + rnd(k + 20)*4, y1 = 440 + rnd(k + 30)*30; return x > 56 && x < 168 ? "" : `<path d="M${f1(x)} ${f1(y1)} q${f1((rnd(k) - .5)*6)} ${f1(40 + rnd(k + 2)*30)} ${f1((rnd(k + 5) - .5)*4)} ${f1(70 + rnd(k + 9)*60)}" fill="none" stroke="#8E7C62" stroke-width="${f1(1 + rnd(k + 11)*1.2)}" opacity=".85"/>`; }).join("");
  const canopy = [[100, 396, 44, 22], [30, 426, 48, 30], [96, 418, 58, 32], [168, 420, 56, 30], [222, 444, 34, 24], [58, 462, 48, 24], [136, 458, 60, 26], [196, 466, 36, 20]];
  const banyan = place("babanyan", 214, 540, 26, 9, "The great banyan tree", NP(`<ellipse cx="110" cy="586" rx="96" ry="12" fill="#3E4A30" opacity=".16"/>${trunkStrands}<rect x="62" y="520" width="98" height="20" fill="url(#baPoleng)" stroke="var(--line)" stroke-width=".8"/><path d="M62 540 l6 10 l6 -10 M148 540 l6 10 l6 -10" fill="#F6F2E8" stroke="var(--line)" stroke-width=".6"/>${roots}`)
    + foliage(canopy) + NP(Array.from({length: 9}, (_, k) => { const x = 24 + k*24 + rnd(k + 60)*8; return x > 60 && x < 160 ? "" : `<path d="M${f1(x)} ${f1(462 + rnd(k)*12)} q-2 30 1 ${f1(60 + rnd(k + 3)*40)}" fill="none" stroke="#8E7C62" stroke-width="1.2"/>`; }).join(""))
    + shrine(200, 590, .55) + umbrella(176, 590, 40, C.white, 3) + fern(20, 600) + fern(236, 628, .8) + canangs([[96, 574], [124, 576]]), "Great banyan", 214, 560, "#E8C9A8");
  // the monkey forest: deep green and dark, tall trees, ferns, and its mossy split gate with macaques on the carvings
  const forest = NP(`<path d="M226 600 Q260 560 300 552 Q340 548 364 520 Q376 480 420 474 Q470 466 530 476 V650 H226z" fill="#2A5230"/>`)
    + foliage([[392, 486, 34, 22], [452, 474, 40, 24], [506, 488, 30, 22], [300, 566, 50, 16]], ["#24482A", "#356A36", "#4E8A42"])
    + NP([[398, 640, 7], [446, 640, 9], [500, 640, 6]].map(([x, y, w]) => `<path d="M${x - w - 6} ${y} Q${x - w} ${y - 20} ${x - w*.5} ${y - 50} L${x - 2} ${y - 150} H${x + 2} L${x + w*.5} ${y - 50} Q${x + w} ${y - 20} ${x + w + 6} ${y}z" fill="#9A8C74" stroke="var(--line)" stroke-width=".8"/><path d="M${x} ${y - 140} q-14 40 -4 90 M${x + 3} ${y - 120} q10 30 2 60" fill="none" stroke="#5E8A3E" stroke-width="1.4"/>`).join(""))
    + foliage([[420, 520, 44, 26], [490, 530, 40, 26], [380, 560, 30, 20]], ["#24482A", "#356A36", "#4E8A42"]) + fern(380, 616) + fern(470, 628, 1.1) + fern(512, 600, .9) + banana(424, 600, .9, 1) + NP(`<path d="M372 470 q6 40 -2 80 M486 480 q-8 30 2 64" fill="none" stroke="#6E9A48" stroke-width="1.2"/>`);
  const monkeys = place("bamonkeys", 300, 572, 26, 9, "The gate of the monkey forest", NP(`<rect x="280" y="572" width="40" height="54" fill="#1E3824"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${f1(281 + k*1.5)}" y="${600 + k*6}" width="${f1(38 - k*3)}" height="4" fill="${C.paras2}" opacity="${f1(1 - k*.15)}"/>`).join("")}`) + splitGate(300, 616, 50, 112, 40, {moss: true})
    + macaque(262, 506, .9, 1, 0) + macaque(340, 532, .85, -1, 1) + macaque(226, 596, .8, 1, 2) + macaque(372, 588, .75, -1, 3)
    + `<rect x="232" y="588" width="44" height="13" rx="1" fill="#E6E0D2" stroke="var(--line)" stroke-width=".6" pointer-events="none"/><text x="254" y="597" text-anchor="middle" font-family="Klee One,serif" font-size="5.6" fill="${C.ink}" pointer-events="none">WENARA WANA</text>`, "Monkey forest", 300, 627, "#BFE0DA");
  // a fighting cock asleep in his bell-shaped bamboo basket by the road, and petals on the paving
  const rooster = NP(sk(`<path d="M18 262 Q16 238 31 234 Q46 238 44 262z" fill="none" stroke="${C.bamboo2}" stroke-width="1.4"/><path d="M22 262 Q22 242 31 236 M40 262 Q40 242 31 236 M31 236 V262 M18 252 H44" fill="none" stroke="${C.bamboo2}" stroke-width=".9"/><ellipse cx="31" cy="256" rx="7" ry="5" fill="#B9542E"/><path d="M36 252 q4 -6 2 -9 l2 1" fill="#B9542E"/><path d="M38 244 l1 -3 l1 3" fill="#D9302A"/><path d="M25 254 q-5 -6 -2 -10 q2 6 4 7" fill="#2E4A3A"/>`, ""));
  const pj = galungan() ? penjor(248, 132, .8, 1, 0) + penjor(336, 196, .8, -1, 1) + penjor(248, 262, .8, 1, 2) + penjor(336, 326, .8, -1, 3) + penjor(248, 462, .75, 1, 4) : "";
  const bits = petals([[220, 236], [312, 270], [270, 420], [160, 352], [60, 352], [330, 160], [262, 500]]) + canangs([[262, 284], [318, 360]], .9) + NP([[26, 280], [200, 284], [240, 370], [340, 380], [70, 372], [240, 480]].map(([x, y]) => tuft(x, y, gr2)).join(""));
  return DEFS + base + lanes + offer + silver + forest + monkeys + market + banyan + sh2 + rooster + bits + pj + light()
    + gate("baToBeach", 290, 40, "Sanur beach", 290, 96, "North along the lane to the beach", "#BFE0DA")
    + gate("baToTemple", 20, 330, "Water temple", 104, 346, "West along the village road to the water temple");
}

/* ---------- ba_terraces: the rice terraces ---------- */
// a contour across the hillside: the lip of terrace k
const contour = (y0, gap, seed, amp) => (k, x) => y0 + k*gap + amp*Math.sin(x/70 + seed + k*.9) + amp*.5*Math.sin(x/29 + seed*2 + k*1.7);
// how each paddy looks this month: "green" (growing), "mirror" (flooded, just planted, the sky in it), "gold" (ripe)
// or "cut" (harvested stubble with puddles and sheaves)
function paddyStates(){
  if (harvest()) return ["gold", "gold", "cut", "gold", "gold", "gold", "cut", "gold"];
  if (wet()) return ["green", "green", "mirror", "green", "green", "green", "green", "mirror"];
  return ["mirror", "mirror", "green", "mirror", "mirror", "green", "mirror", "mirror"];
}
function terraceBlock(id, x1, x2, cy, n, offset = 0){
  const xs = []; for (let x = x1; x < x2; x += 20) xs.push(x); xs.push(x2);
  const line = (k, dy = 0) => xs.map(x => [x, cy(k, x) + dy]), states = paddyStates(), dry = !wet();
  const bank = harvest() ? "#8A8E4A" : dry ? "#79964A" : "#5F9238", lip = harvest() ? "#B9B466" : dry ? "#A3BE68" : "#99CC62";
  let out = "";
  for (let k = 0; k < n; k++) {
    const st = states[(k + offset) % states.length], top = line(k), topR = line(k, 6), bot = line(k + 1), rev = bot.slice().reverse();
    const band = `${smooth(topR)} L${f1(rev[0][0])} ${f1(rev[0][1])}${segs(rev)}Z`, riser = `${smooth(top)} L${f1(x2)} ${f1(cy(k, x2) + 6)}${segs(topR.slice().reverse())}Z`;
    const row = (f, col, w, dash, op = 1, off = 0) => `<path d="${smooth(xs.map(x => [x, cy(k, x) + 6 + (cy(k + 1, x) - cy(k, x) - 6)*f]))}" fill="none" stroke="${col}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-dashoffset="${off}" opacity="${op}"/>`;
    const fill = st === "green" ? (dry ? "#8FC452" : "#74B442") : st === "mirror" ? (wet() ? "#B2D3D6" : "#C3E1E6") : st === "gold" ? "#E1BD50" : "#CDB47A";
    let rows = "";
    if (st === "green") rows = [.18, .42, .66, .88].map((f, j) => row(f, dry ? "#64A43A" : "#4E9230", 3.4, "1.6 2.6", 1, j*1.3)).join("") + row(.3, "#C2E4DC", 1, "6 9", .45) + row(.77, "#C2E4DC", 1, "5 11", .4);
    else if (st === "mirror") rows = `<g clip-path="url(#${id}${k})"><ellipse cx="${f1(x1 + (x2 - x1)*(.25 + rnd(k + offset)*.5))}" cy="${f1(cy(k, x1) + 18)}" rx="34" ry="5" fill="#FFFFFF" opacity=".6"/><ellipse cx="${f1(x1 + (x2 - x1)*(.1 + rnd(k + 9)*.3))}" cy="${f1(cy(k, x1) + 24)}" rx="20" ry="3" fill="#FFFFFF" opacity=".45"/></g>` + row(.25, "#EEF7F8", 2.2, "24 30", .7, k*11) + [.36, .6, .84].map((f, j) => row(f, "#5FA03A", 2.4, ".9 4.2", 1, j*2)).join("");
    else if (st === "gold") rows = [.18, .42, .66, .88].map((f, j) => row(f, "#C39A2C", 3.6, "1.8 2.2", 1, j*1.1)).join("") + [.3, .55, .78].map(f => row(f, "#F4D97A", 1.4, "1 4", .9)).join("");
    else rows = `<g clip-path="url(#${id}${k})"><ellipse cx="${f1(x1 + (x2 - x1)*.3)}" cy="${f1(cy(k, x1) + 20)}" rx="26" ry="4" fill="#B9D6D2" opacity=".7"/><ellipse cx="${f1(x1 + (x2 - x1)*.72)}" cy="${f1(cy(k, x1) + 24)}" rx="18" ry="3" fill="#B9D6D2" opacity=".6"/></g>` + [.3, .55, .8].map(f => row(f, "#A08650", 1.6, "1 3.4")).join("")
      + [.2, .45, .7].map((t, j) => { const x = x1 + (x2 - x1)*t, y = (cy(k, x) + cy(k + 1, x))/2 + 3; return `<path d="M${f1(x - 4)} ${f1(y)} L${f1(x)} ${f1(y - 10)} L${f1(x + 4)} ${f1(y)}z" fill="#E6C25A" stroke="#A8862E" stroke-width=".6"/><path d="M${f1(x - 3)} ${f1(y - 4)} h6" stroke="#A8862E" stroke-width=".8"/>`; }).join("");
    out += `<clipPath id="${id}${k}"><path d="${band}"/></clipPath><path d="${riser}" fill="${bank}"/><path d="${band}" fill="${fill}"/>${rows}<path d="${smooth(top)}" fill="none" stroke="${lip}" stroke-width="2.4"/><path d="${smooth(topR)}" fill="none" stroke="#3E5A2A" stroke-width=".8" opacity=".5"/>`;
  }
  return NP(`<g filter="url(#wob)">${out}</g>`);
}
function terracesScreen(){
  const [gr, gr2] = grassCols();
  const up = contour(92, 31, 1.3, 5), ll = contour(348, 40, 2.1, 6), lr = contour(352, 38, 3.7, 5);
  // the sky, the mountain, and the jungle ridge with its palms along the top
  const sky = `<rect width="520" height="110" fill="${wet() ? "#CCDCE0" : "#DCEDF2"}"/>` + volcano(330, 92, 380, 78, wet() ? "#A6B5C0" : "#9FB3C3")
    + NP(`<path d="M-10 70 Q60 56 130 66 Q200 74 260 62 Q330 52 400 66 Q470 76 530 62 V110 H-10z" fill="#5E8C56"/>${Array.from({length: 26}, (_, k) => `<ellipse cx="${f1(k*21 - 4)}" cy="${f1(84 + rnd(k)*8)}" rx="${f1(14 + rnd(k + 4)*8)}" ry="${f1(10 + rnd(k + 8)*5)}" fill="${k % 2 ? "#4C7E44" : "#3F7038"}"/>`).join("")}`)
    + [[30, 90, .5], [96, 86, .55], [176, 92, .48], [310, 88, .52], [388, 92, .5], [452, 86, .56], [500, 90, .46]].map(([x, y, s], k) => palm(x, y, s, k % 2 ? -1 : 1, k)).join("");
  const kites = kiteDay() ? kite(140, 34, "leaf", 1, 96, 300) + kite(420, 26, "bird", 2, 420, 300) : "";
  // the upper terraces right across, and the lower ones either side of the path down
  const upper = terraceBlock("bau", -10, 530, up, 5), lowL = terraceBlock("bal", -10, 214, ll, 8, 2), lowR = terraceBlock("bar", 306, 530, lr, 8, 5);
  // the grassy ridge with the path along it and down the middle, the subak channel along its top edge
  const xsA = []; for (let x = -10; x <= 530; x += 20) xsA.push([x, up(5, x)]);
  const ridgeD = `${smooth(xsA)} L530 ${f1(lr(0, 530))}${segs([[530, lr(0, 530)], [440, lr(0, 440)], [360, lr(0, 360)], [322, lr(0, 322) + 4], [318, 400], [325, 460], [316, 520], [323, 580], [318, 650]])} H206${segs([[206, 650], [198, 590], [205, 530], [197, 470], [204, 410], [204, ll(0, 204) + 4]])}${segs([[204, ll(0, 204) + 4], [120, ll(0, 120)], [40, ll(0, 40)], [-10, ll(0, -10)]])} Z`;
  const ridge = NP(`<path d="${ridgeD}" fill="none" stroke="${harvest() ? "#8A8E4A" : wet() ? "#5F9238" : "#79964A"}" stroke-width="12" filter="url(#wob)"/>` + sk(`<path d="${ridgeD}" fill="${gr}"/>`, `<path d="${ridgeD}"/>`)) + NP(`<g filter="url(#wash)" opacity=".5"><ellipse cx="260" cy="300" rx="200" ry="30" fill="${gr2}"/></g>`)
    + trail("M530 300 C450 296 380 306 300 302 C270 302 262 322 262 352 V650", 30) + trail("M262 302 C200 300 140 310 96 336", 22);
  const channel = NP(`<path d="${smooth(xsA.filter(([x]) => x >= 300).map(([x, y]) => [x, y + 9]))}" fill="none" stroke="#6E8A4A" stroke-width="7"/><path d="${smooth(xsA.filter(([x]) => x >= 300).map(([x, y]) => [x, y + 9]))}" fill="none" stroke="#9FD6D6" stroke-width="4"/><path d="${smooth(xsA.filter(([x]) => x >= 300).map(([x, y]) => [x, y + 9]))}" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-dasharray="4 10" opacity=".8"><animate attributeName="stroke-dashoffset" values="0;28" dur="2.4s" repeatCount="indefinite"/></path>`)
    + NP(`<ellipse cx="290" cy="${f1(up(5, 300) + 24)}" rx="9" ry="4" fill="${C.paras2}" stroke="var(--line)" stroke-width=".7"/><ellipse cx="290" cy="${f1(up(5, 300) + 23)}" rx="6" ry="2.4" fill="#9FD6D6"/><path d="M302 ${f1(up(5, 300) + 9)} L292 ${f1(up(5, 300) + 13)}" stroke="${C.bamboo2}" stroke-width="4" stroke-linecap="round"/><path d="M292 ${f1(up(5, 300) + 14)} q-1 4 -1 8" fill="none" stroke="#DFF3F2" stroke-width="2" stroke-dasharray="3 2"><animate attributeName="stroke-dashoffset" values="0;-10" dur=".7s" repeatCount="indefinite"/></path>`);
  // the paddies place: the upper terraces, a farmer's hat left on a lip
  const paddy = place("bapaddy", 250, 264, 30, 9, "The rice paddies", NP(`<path d="M232 ${f1(up(4, 232) + 2)} l8 -6 l8 6z" fill="#D8B56A" stroke="var(--line)" stroke-width=".6"/>`), harvest() ? "Golden paddies" : "The paddies", 250, 230, "#F6E3B4");
  // the bamboo pavilion: a bale bengong to rest in, a hat hanging on a post and a kettle on the mat
  const pav = place("babale", 92, 342, 30, 9, "The bamboo pavilion", bale(92, 330, 120, 30, 44, {bamboo: true, inside: NP(`<rect x="44" y="306" width="96" height="8" fill="#D9C38A"/><path d="M48 310 h88" stroke="#B8A066" stroke-width="2" stroke-dasharray="3 2"/><ellipse cx="120" cy="305" rx="6" ry="4" fill="#5A6878"/><path d="M118 301 q2 -4 5 -2" stroke="#5A6878" stroke-width="1.2" fill="none"/>`)})
    + NP(`<path d="M44 290 l10 -6 l10 6z" fill="#D8B56A" stroke="var(--line)" stroke-width=".6"/>`), "Bamboo pavilion", 92, 362, "#E8C9A8");
  // Dewi Sri's shrine: a little bamboo shrine on a post at the corner of the paddy, yellow cloth and offerings
  const sri = place("bashrine3", 306, 380, 22, 8, "Dewi Sri's shrine, for the goddess of rice", NP(sk(`<path d="M336 376 V340" stroke="${C.bamboo2}" stroke-width="3"/><rect x="326" y="328" width="20" height="14" fill="${C.bamboo}"/><rect x="330" y="331" width="12" height="9" fill="#5A4432"/><path d="M322 330 L336 316 L350 330z" fill="${C.thatch}"/><rect x="331" y="346" width="10" height="9" fill="${C.cloth}"/><path d="M336 316 v-8 l8 3 l-8 3" fill="#FFFDF6" stroke="var(--line)" stroke-width=".5"/>`, `<rect x="326" y="328" width="20" height="14"/><path d="M322 330 L336 316 L350 330z"/>`)) + canang(336, 340, .7, true, 3), "Dewi Sri's shrine", 372, 400, "#F2C9B4");
  // the scarecrow: an old shirt and a farmer's hat, strings of bells and cans out to two bamboo poles, jingling
  const scare = place("bascarecrow", 214, 440, 22, 8, "The scarecrow with bells", NP(`<path d="M60 ${f1(ll(3, 60) - 30)} V${f1(ll(3, 60) + 6)} M190 ${f1(ll(3, 190) - 34)} V${f1(ll(3, 190) + 6)}" stroke="${C.bamboo2}" stroke-width="2.4"/>
      <g>${swing(130, 462, 3, 3)}<path d="M60 ${f1(ll(3, 60) - 28)} Q95 430 116 432 M144 432 Q170 428 190 ${f1(ll(3, 190) - 32)}" fill="none" stroke="#5A4A3A" stroke-width=".7"/>${[76, 92, 106, 156, 172].map((x, k) => k % 2 ? `<circle cx="${x}" cy="${f1(434 + (k === 1 ? 2 : 0))}" r="2.2" fill="${C.gold2}" stroke="#8A6A20" stroke-width=".5"/>` : `<rect x="${x - 2}" y="434" width="4" height="5" fill="#C9CDD0" stroke="#6A6E72" stroke-width=".5"/>`).join("")}</g>
      <g>${swing(130, 476, 4, 3.6)}${sk(`<path d="M130 476 V424 M112 436 H148" stroke="${C.bamboo2}" stroke-width="2.6"/><path d="M118 434 H142 L138 458 H122z" fill="#6E8FB0"/><path d="M130 436 v20" stroke="#4E6E90" stroke-width=".8"/><circle cx="130" cy="426" r="6" fill="#D9C38A"/><path d="M118 424 L130 412 L142 424z" fill="#D8B56A"/><path d="M110 436 l-4 6 M150 436 l4 6" stroke="#D9C38A" stroke-width="2.4"/>`, `<path d="M118 434 H142 L138 458 H122z"/><path d="M118 424 L130 412 L142 424z"/>`)}</g>`), "Scarecrow", 150, 488, "#F6E3B4");
  // the paddy ducks: tall runner ducks marching along the dyke in a line, and the keeper's flag where they'll gather
  const dyke = xs => smooth(xs.map(x => [x, lr(4, x) - 1])), dpath = dyke([326, 350, 380, 410, 440, 470, 494]);
  const ducks = place("baducks", 306, 500, 22, 8, "The paddy ducks", NP(`<path d="M498 ${f1(lr(4, 498) + 4)} V${f1(lr(4, 498) - 40)}" stroke="${C.bamboo2}" stroke-width="2"/><g>${swing(498, lr(4, 498) - 40, 10, 2.4)}<path d="M498 ${f1(lr(4, 498) - 40)} l14 3 l-14 6z" fill="#FFFDF6" stroke="var(--line)" stroke-width=".6"/></g>`
      + Array.from({length: 7}, (_, k) => `<g opacity="0"><animateMotion path="${dpath}" dur="40s" begin="${f1(-k*2.9)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.05;.92;1" dur="40s" begin="${f1(-k*2.9)}s" repeatCount="indefinite"/>${duck(k, k === 2 || k === 5)}</g>`).join("")
      + [[420, lr(5, 420) - 10], [450, lr(5, 450) - 14]].map(([x, y], k) => `<g transform="translate(${x} ${f1(y)}) scale(${k ? -1 : 1} 1)">${duck(k + 9, k === 1)}</g>`).join("")), "Paddy ducks", 404, 528, "#F6E3B4");
  const edges = palm(28, 640, 1.15, 1, 1) + palm(496, 470, 1, -1, 2) + palm(176, 420, .62, -1, 3) + banana(470, 640, 1.1, 2) + banana(36, 470, .9, 1);
  const pj = galungan() ? penjor(198, 604, .85, 1, 0) + penjor(324, 556, .85, -1, 1) + penjor(198, 470, .8, 1, 2) + penjor(324, 424, .8, -1, 3) : "";
  return DEFS + `<rect width="520" height="640" fill="${gr}"/>` + sky + upper + lowL + lowR + ridge + channel + paddy + sri + scare + ducks + pav + edges + pj + kites
    + NP([[230, 270], [420, 290], [160, 312], [290, 420], [230, 560], [480, 280]].map(([x, y]) => tuft(x, y, gr2)).join("")) + light()
    + gate("baToBeachE", 500, 300, "Sanur beach", 448, 338, "East down the coconut track to the beach", "#BFE0DA")
    + gate("baToTempleS", 260, 612, "Water temple", 186, 618, "South down through the paddies to the water temple");
}

/* ---------- ba_temple: the water temple ---------- */
function templeScreen(){
  const [gr, gr2] = grassCols();
  const base = ground(gr, [[260, 320, 160, 90, wet() ? "#9CCB64" : "#B5C670"], [260, 80, 120, 50, gr2]]);
  // outside: the path up to the gate between frangipani and palms
  const outside = trail("M260 -10 V200", 70, C.lane2, C.lane) + NP(flags(232, 0, 56, 150))
    + frangipani(70, 120, 1.25, false, 1) + palm(20, 140, 1, 1, 2) + banana(130, 132, .9, 3) + frangipani(450, 112, 1.2, true, 4) + palm(500, 146, 1, -1, 5) + banana(390, 132, .9, 6) + hibiscus(170, 140, .8) + hibiscus(352, 142, .8);
  // the temple wall, and the split gate with its steps and offerings
  const wall = NP(sk(`<rect x="0" y="152" width="520" height="48" fill="${C.brick}"/>${courses(0, 152, 520, 48, C.brick2, 6, .45)}${carved(0, 146, 520, 8)}${[30, 80, 130, 390, 440, 490].map(x => finial(x, 147)).join("")}`, `<rect x="0" y="146" width="520" height="54"/>`));
  const gateArt = splitGate(260, 202, 62, 156, 40) + NP(sk([0, 1, 2].map(k => `<rect x="${236 - k*3}" y="${190 + k*6}" width="${48 + k*6}" height="6" fill="${C.paras2}"/>`).join(""), "")) + canangs([[248, 194], [272, 194], [244, 206], [276, 206]]);
  const gt = place("bagate", 260, 222, 28, 9, "The split gate, the candi bentar", gateArt, "Split gate", 260, 242, "#E8C9A8");
  // the courtyard paving
  const paving = NP(`<g filter="url(#wob)"><path d="M260 200 V470 M260 418 H530" fill="none" stroke="${C.lane}" stroke-width="66"/></g>`) + NP(flags(228, 204, 64, 260)) + NP(flags(292, 392, 228, 52));
  // the gamelan pavilion: carved red and gold posts, two tiers of thatch, the bronze instruments gleaming inside
  const inst = `${[[52, 346], [92, 346], [132, 346]].map(([x, y]) => `<rect x="${x - 16}" y="${y - 4}" width="32" height="10" fill="${C.red}" stroke="${C.gold}" stroke-width=".8"/>${[0, 1, 2, 3, 4, 5].map(j => `<rect x="${x - 14 + j*5}" y="${y - 7}" width="4" height="4" fill="${C.gold2}" stroke="#A8822A" stroke-width=".4"/>`).join("")}`).join("")}
    <path d="M150 300 V352 M178 300 V352 M146 302 H182" stroke="${C.red}" stroke-width="3"/><circle cx="164" cy="324" r="11" fill="${C.gold}" stroke="#8A6A20" stroke-width="1"/><circle cx="164" cy="324" r="4" fill="${C.gold2}" stroke="#8A6A20" stroke-width=".6"/><path d="M164 302 v2" stroke="#3A3430" stroke-width=".8"/>
    <ellipse cx="114" cy="324" rx="10" ry="5" fill="#8A5A3A" stroke="var(--line)" stroke-width=".6"/><ellipse cx="104" cy="324" rx="2" ry="5" fill="#D9C38A"/>`;
  const gam = place("bagamelan", 108, 388, 30, 9, "The gamelan pavilion", bale(108, 370, 170, 54, 70, {tier: true, steps: true, posts: 5, inside: NP(inst)}) + canangs([[100, 372], [118, 374]]), "Gamelan pavilion", 108, 408, "#E8C9A8");
  // the meru, umbrellas either side, a guardian in poleng, offerings on the steps (and gebogan towers on Galungan)
  const gebogan = x => `<path d="M${x - 7} 362 h14 l-2 -4 h-10z" fill="${C.gold}"/>${[0, 1, 2, 3, 4].map(j => `<ellipse cx="${x}" cy="${356 - j*6}" rx="${7 - j}" ry="3.4" fill="${["#E0403A", "#F2C230", "#6E9A3A", "#E8803A", "#FFFDF4"][j]}" stroke="var(--line)" stroke-width=".4"/>`).join("")}<circle cx="${x}" cy="326" r="2.4" fill="#F28DB2"/>`;
  const guardian = x => NP(sk(`<rect x="${x - 8}" y="346" width="16" height="16" fill="${C.paras2}"/><rect x="${x - 6}" y="324" width="12" height="22" fill="url(#baPoleng)"/><circle cx="${x}" cy="318" r="6" fill="${C.paras}"/><path d="M${x - 3} 317 h2 M${x + 1} 317 h2 M${x - 2} 321 q2 2 4 0" stroke="${C.paras3}" stroke-width=".9"/>`, `<rect x="${x - 8}" y="346" width="16" height="16"/>`));
  const sh4 = place("bashrine4", 420, 380, 28, 9, "The temple shrine, a meru", umbrella(370, 362, 82, C.cloth, 0) + umbrella(474, 362, 82, C.white, 1) + meru(422, 362, 5, 74) + guardian(382) + guardian(462)
    + (galungan() ? NP(gebogan(404) + gebogan(440)) : "") + canangs([[408, 366], [422, 368], [436, 366]]), "Temple shrine", 420, 400, "#F2C9B4");
  // the spring pools: a carved back wall with a long row of spouts pouring into clear water over pebbles
  const spouts = Array.from({length: 10}, (_, k) => 40 + k*25.5);
  const pools = place("bapools", 326, 520, 26, 9, "The holy spring pools", NP(`<rect x="20" y="470" width="284" height="150" fill="${C.water}"/>` + sk(`<rect x="20" y="424" width="284" height="46" fill="${C.paras}"/>${carved(20, 424, 284, 9)}${courses(20, 433, 284, 37, C.paras3, 7)}<rect x="14" y="470" width="8" height="170" fill="${C.paras2}"/><rect x="302" y="470" width="8" height="170" fill="${C.paras2}"/><rect x="157" y="470" width="10" height="150" fill="${C.paras2}"/><rect x="14" y="618" width="296" height="22" fill="${C.paras2}"/>${courses(14, 618, 296, 22, C.paras3, 6)}`,
      `<rect x="20" y="424" width="284" height="196"/><path d="M157 470 V620 M167 470 V620"/>`)
    + `<g opacity=".5">${Array.from({length: 40}, (_, k) => `<ellipse cx="${f1(26 + rnd(k)*270)}" cy="${f1(500 + rnd(k + 50)*110)}" rx="${f1(2 + rnd(k + 9)*2.4)}" ry="1.4" fill="${["#8FB3A8", "#B9C9B4", "#6E9A90"][k % 3]}"/>`).join("")}</g><path d="M20 476 H304" stroke="${C.water2}" stroke-width="5" opacity=".7"/>`
    + spouts.map((x, k) => `<path d="M${f1(x - 5)} 448 h10 v8 q-5 5 -10 0z" fill="${C.paras2}" stroke="var(--line)" stroke-width=".7"/><circle cx="${f1(x - 2)}" cy="451" r="1" fill="${C.paras3}"/><path d="M${f1(x)} 456 q3 10 1 ${22 + (k % 3)*4}" fill="none" stroke="#EAF7F5" stroke-width="2.6" stroke-dasharray="4 2.4"><animate attributeName="stroke-dashoffset" values="0;-12.8" dur=".6s" repeatCount="indefinite"/></path><ellipse cx="${f1(x + 1)}" cy="${f1(480 + (k % 3)*4)}" rx="3" ry="1.2" fill="none" stroke="#FFFFFF" stroke-width=".8"><animate attributeName="rx" values="2;9" dur="1.6s" begin="${f1(-k*.3)}s" repeatCount="indefinite"/><animate attributeName="ry" values="1;3" dur="1.6s" begin="${f1(-k*.3)}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="1.6s" begin="${f1(-k*.3)}s" repeatCount="indefinite"/></ellipse>`).join("")
    + [[80, 560], [210, 590], [250, 540]].map(([x, y]) => fFlower(x, y, 3)).join("") + canangs([[60, 438], [160, 438], [260, 438]], .8)), "Spring pools", 160, 600, "#BFE0DA");
  // the lotus and koi pond
  const pondD = "M352 486 Q350 476 370 476 H504 Q522 476 522 496 V640 H352z";
  const loop1 = "M380 540 C380 510 470 506 486 530 C502 556 470 600 430 596 C392 592 380 570 380 540z", loop2 = "M410 600 C440 620 500 610 500 580 C500 548 456 540 432 556 C412 570 390 584 410 600z";
  const koiPond = place("bakoi", 380, 460, 26, 9, "The lotus and koi pond", NP(sk(`<path d="${pondD}" fill="${C.paras2}"/>`, `<path d="${pondD}"/>`) + `<path d="M360 492 Q360 484 374 484 H506 Q514 484 514 498 V640 H360z" fill="${C.pond}"/>`
    + `<path d="M366 500 H508" stroke="#7FC0B6" stroke-width="3" opacity=".6"/>` + koi(loop1, "#F08A2E", "#FFFDF4", 22, 0, 1.2) + koi(loop1, "#FFFDF4", "#E0503A", 22, -8, 1.05) + koi(loop2, "#F2C230", "#F08A2E", 18, -3, 1.1) + koi(loop2, "#E0503A", "#FFFDF4", 18, -11, 1) + koi(loop1, "#2B2A29", "#F08A2E", 22, -15, .9)
    + [[374, 506, 10], [404, 520, 12], [470, 506, 11], [496, 532, 10], [388, 600, 12], [452, 624, 13], [500, 598, 10], [372, 566, 9], [430, 492, 9]].map(([x, y, r], k) => lotusPad(x, y, r, k)).join("")
    + lotus(404, 514, 1.1) + lotus(472, 500, 1) + lotus(392, 592, 1.2) + lotus(498, 590, .9)), "Lotus pond", 440, 552, "#BFE0DA");
  const eastSide = NP(sk(`<rect x="502" y="200" width="18" height="190" fill="${C.brick}"/>${carved(500, 200, 20, 6)}`, "")) + frangipani(500, 270, 1, false, 7) + frangipani(500, 372, .8, true, 8);
  const pj = galungan() ? penjor(166, 142, .85, -1, 0) + penjor(354, 142, .85, 1, 1) + penjor(222, 420, .7, -1, 2) + penjor(298, 420, .7, 1, 3) : "";
  const bits = petals([[230, 300], [300, 340], [250, 420], [340, 410], [200, 230], [330, 260]]) + NP([[200, 460], [340, 470], [30, 410], [480, 460], [200, 120], [320, 110]].map(([x, y]) => tuft(x, y, gr2)).join(""));
  return DEFS + base + outside + paving + wall + gt + gam + sh4 + eastSide + pools + koiPond + bits + pj + light()
    + gate("baToTerracesN", 260, 40, "Rice terraces", 130, 88, "North up through the paddies to the terraces")
    + gate("baToUbudE", 500, 418, "Ubud", 468, 458, "East along the village road to Ubud", "#BFE0DA");
}

export function baliArt(scene){
  return scene === "ba_beach" ? beachScreen() : scene === "ba_ubud" ? ubudScreen() : scene === "ba_terraces" ? terracesScreen() : templeScreen();
}
// the sight on the far shore as you sail in (a 600x90 strip; the sea starts at y 56): Mount Agung in the haze, a
// palm-fringed shore, and the striped sails of jukung out on the water. (Read when the module loads; baliSight() gives
// a fresh one for any day: kites over the shore in season.)
export function baliSight(day = dayKey()){
  const pl = (x, h, k) => `<path d="M${x} 48 q${k % 2 ? 2 : -2} ${-h/2} ${k % 2 ? 4 : -3} ${-h}" stroke="#6C5A40" stroke-width="1.4" fill="none"/>${[-10, -5, 0, 5, 10].map(d => `<path d="M${x + (k % 2 ? 4 : -3)} ${48 - h} q${d} -4 ${d*1.5} 5" stroke="#3F6E36" stroke-width="1.8" fill="none"/>`).join("")}`;
  const sail = (x, k) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;${k % 2 ? 26 : -26} 0;0 0" dur="${30 + k*7}s" repeatCount="indefinite"/><path d="M${x - 9} 55 h18 l-3 2.4 h-12z" fill="#FFFDF6" stroke="#3b3530" stroke-width=".6"/><path d="M${x - 7} 53 Q${x} 44 ${x + 2} 34 Q${x + 5} 46 ${x + 9} 52z" fill="${["#E8566C", "#F2C230", "#FFFDF6"][k % 3]}" stroke="#3b3530" stroke-width=".6"/><path d="M${x - 2} 50 Q${x + 2} 44 ${x + 3} 38" stroke="${["#FFFDF6", "#2B7A9A", "#E8566C"][k % 3]}" stroke-width="1.4" fill="none"/></g>`;
  return `<path d="M330 50 Q400 26 438 6 L456 6 Q500 28 590 50z" fill="#9AAEC0"/><path d="M456 6 Q500 28 590 50 H540 Q490 30 452 6z" fill="#FFFFFF" opacity=".18"/><ellipse cx="420" cy="22" rx="30" ry="4" fill="#FFFFFF" stroke="none" opacity=".8"/><ellipse cx="470" cy="26" rx="22" ry="3" fill="#FFFFFF" stroke="none" opacity=".7"/>`
    + `<path d="M232 56 Q250 44 290 44 Q380 40 470 42 Q540 43 580 48 L600 56z" fill="#6FA05A"/><path d="M238 56 Q300 50 380 51 Q480 50 600 53 V56z" fill="#EBDDB4" stroke="none"/>`
    + [[262, 18, 0], [284, 22, 1], [306, 16, 2], [338, 24, 3], [366, 20, 4], [402, 22, 5], [436, 18, 6], [470, 24, 7], [506, 20, 8], [540, 22, 9], [572, 18, 10]].map(([x, h, k]) => pl(x, h, k)).join("")
    + sail(150, 0) + sail(204, 1) + sail(110, 2) + (baKites(day) ? `<path d="M300 20 l5 6 l-5 6 l-5 -6z" fill="#D9403A" stroke="#3b3530" stroke-width=".6"/><path d="M300 32 q3 6 -1 10" stroke="#F2C230" fill="none"/>` : "");
}
export const BALI_SIGHT = baliSight();
