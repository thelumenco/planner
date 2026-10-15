// Hokkaido (boat towns, round 222): Japan's snowy northern island, nothing like Kyoto's temples and timber lanes or the
// Lavender Hills' purple rows. Big skies; grey Otaru stone warehouses on a still canal with black iron gas lamps; a
// working harbour of white fishing boats and polystyrene crab boxes; a valley of ochre, rust and white rock pouring
// steam, with wooden boardwalks and a big red oni; white birches, Ezo spruce and red maples under the perfect cone of
// Mount Yotei; and a hill of rainbow flower stripes where red-crowned cranes dance in the winter snow.
//   hk_niseko (Niseko)                   | hk_flowers (The flower farm)
//   hk_market (Morning market & canal) * | hk_onsen   (The hot springs valley)
//   hk_market:  the stone warehouses and the canal along the top with the gas lamps and the bridge north, the market
//               hall and Kenta's glassworks, the harbour in the bottom-left corner with your boat at the pier, the
//               gull on his bollard, fish crates, and the crab and sea urchin stalls
//   hk_onsen:   the steaming valley (vents, boardwalks, sulphur yellow and rust rock) across the top, the red oni,
//               Mrs Sato's ryokan, the foot bath in its stream, and the egg spring with its baskets
//   hk_niseko:  Mount Yotei behind, the ski slope and the chairlift, the viewing deck, the timber lodge, the birch
//               grove, the sledging hill
//   hk_flowers: the rainbow stripes on the hill, the flower hill with its bell, the red-roofed café, the crane meadow
//               and its pond
// Seasons (data/hokkaido.js, the real calendar): winter (December to March) deep snow on everything, snow on the roofs,
// icicles, the lamps glowing, snow falling, the cranes dancing on the snowfield; spring (1 to 19 April) the thaw, old
// snow in patches, buds; sakura (20 April to May) every cherry tree on every screen in pink blossom, petals drifting;
// summer (June to September) green, flower stripes, wildflowers; autumn (October, November) golden birches, red maples.
import { dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { hkSeason, snowOn, sakuraOn, stripesOn } from "../data/hokkaido.js";

const C = {snow: "#F4F7FA", snow2: "#DEE7F0", snow3: "#C6D4E2", pave: "#D3CBBC", pave2: "#C2B9A8", pave3: "#A99F8C", gravel: "#CFC4AC", gravel2: "#DDD3BD",
  stone: "#9E9586", stone2: "#857C6E", stone3: "#6B6357", tile: "#4C525B", tile2: "#3A3F47", wood: "#7A4E32", wood2: "#583823", timber: "#A8774A", timber2: "#87593A",
  plaster: "#F1EADB", iron: "#2F3438", water: "#4F8288", water2: "#6E9EA0", sea: "#3D7898", sea2: "#5C98B4", foam: "#F3F8FA", red: "#C83A2E", lantern: "#D9483A",
  ochre: "#D8A443", rust: "#B85A30", sulphur: "#E9D56C", rock: "#E9E1CF", rock2: "#C9B99A", milky: "#A9D4D2", milky2: "#C8E6E2", navy: "#2E4566", ink: "#2F2B28",
  pink: "#F4BCCD", pink2: "#E9A0B7", pink3: "#FCE0E8", crane: "#FBFBF7", black: "#2B2B2B"};
const SEA = () => hkSeason(dayKey());
const winter = () => snowOn(dayKey());
const sakura = () => sakuraOn(dayKey());
const stripes = () => stripesOn(dayKey());
// the grass by season (in winter the ground is snow)
const GRASS = {winter: [C.snow, C.snow2], spring: ["#A9AF7A", "#959C66"], sakura: ["#9DC46C", "#86B055"], summer: ["#87B552", "#72A043"], autumn: ["#C2B064", "#A99A52"]};
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

/* ---------- trees and plants (every one of them changes with the season) ---------- */
const foliage = (blobs, cols) => NP(`<g filter="url(#wob)">${blobs.map(([x, y, rx, ry]) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx + 3)}" ry="${f1(ry + 3)}" fill="${cols[0]}"/>`).join("")}${blobs.map(([x, y, rx, ry]) => `<ellipse cx="${f1(x - 2)}" cy="${f1(y - 3)}" rx="${f1(rx*.9)}" ry="${f1(ry*.85)}" fill="${cols[1]}"/>`).join("")}${blobs.map(([x, y, rx, ry], k) => `<ellipse cx="${f1(x - rx*.3)}" cy="${f1(y - ry*.45)}" rx="${f1(rx*.42)}" ry="${f1(ry*.32)}" fill="${cols[2]}" opacity=".85"/>${k % 2 ? `<ellipse cx="${f1(x + rx*.3)}" cy="${f1(y - ry*.1)}" rx="${f1(rx*.25)}" ry="${f1(ry*.2)}" fill="${cols[2]}" opacity=".6"/>` : ""}`).join("")}</g>`);
const shadow = (x, y, rx, ry = rx*.22) => `<ellipse cx="${f1(x)}" cy="${f1(y + 1)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#34404A" opacity=".13"/>`;
// bare branches (winter and early spring): a few forked lines; with snow along their tops in winter, or buds in spring
function bareCrown(x, y, s, tips, col, i){
  const se = SEA(), lines = tips.map(([dx, dy], k) => { const mx = x + dx*s*.45 + (k % 2 ? 4 : -4)*s, my = y + dy*s*.55;
    return `M${f1(x)} ${f1(y)} Q${f1(mx)} ${f1(my)} ${f1(x + dx*s)} ${f1(y + dy*s)} M${f1(mx)} ${f1(my)} l${f1((dx > 0 ? 9 : -9)*s)} ${f1(-8*s)}`; }).join(" ");
  const snow = se === "winter" ? `<path d="${lines}" fill="none" stroke="${C.snow}" stroke-width="${f1(1.6*s)}" stroke-linecap="round" transform="translate(0 -1.4)" opacity=".95"/>` : "";
  const buds = se === "spring" ? tips.map(([dx, dy], k) => `<circle cx="${f1(x + dx*s)}" cy="${f1(y + dy*s)}" r="${f1(1.8*s)}" fill="${k % 2 ? "#C9667E" : "#9DB860"}"/>`).join("") : "";
  return `<path d="${lines}" fill="none" stroke="${col}" stroke-width="${f1(2.2*s)}" stroke-linecap="round"/>${snow}${buds}`;
}
// petals falling from a cherry in blossom
const petalFall = (x, y, s, i) => Array.from({length: 4}, (_, k) => { const sx = x + (rnd(i*7 + k) - .5)*50*s, d = 6 + rnd(i + k*3)*4;
  return `<ellipse cx="${f1(sx)}" cy="${f1(y)}" rx="1.8" ry="1.1" fill="${k % 2 ? C.pink : C.pink3}" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="${f1(d)}s" begin="${f1(-rnd(i*3 + k)*d)}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;${f1(14 + rnd(k)*12)} ${f1(30 + 26*s)};${f1(26 + rnd(k)*16)} ${f1(60 + 40*s)}" dur="${f1(d)}s" begin="${f1(-rnd(i*3 + k)*d)}s" repeatCount="indefinite"/></ellipse>`; }).join("");
// a cherry tree: a dark knobbly trunk and a wide crown: bare and snowy in winter, budding in spring, a cloud of pink
// blossom in the sakura season, green in summer, bronze and orange in autumn
function cherry(x, y, s = 1, i = 0){
  const se = SEA(), P = v => f1(v);
  const trunk = `<path d="M${P(x - 5*s)} ${P(y)} Q${P(x - 3*s)} ${P(y - 18*s)} ${P(x - 2*s)} ${P(y - 30*s)} L${P(x + 2*s)} ${P(y - 30*s)} Q${P(x + 4*s)} ${P(y - 16*s)} ${P(x + 6*s)} ${P(y)}z" fill="#5A4234" stroke="var(--line)" stroke-width=".7"/><path d="M${P(x - 2*s)} ${P(y - 8*s)} h${P(4*s)} M${P(x - 1*s)} ${P(y - 18*s)} h${P(3*s)}" stroke="#8A7060" stroke-width=".7"/>`;
  const tips = [[-34, -26], [-22, -44], [-4, -50], [16, -46], [32, -28]];
  const blobs = [[x - 22*s, y - 50*s, 18*s, 13*s], [x, y - 62*s, 22*s, 14*s], [x + 22*s, y - 50*s, 18*s, 13*s], [x - 8*s, y - 44*s, 20*s, 11*s], [x + 10*s, y - 40*s, 16*s, 9*s], [x - 32*s, y - 38*s, 11*s, 8*s], [x + 32*s, y - 38*s, 11*s, 8*s]];
  const cols = {sakura: [C.pink2, C.pink, C.pink3], summer: ["#3D7434", "#53903F", "#76AE58"], autumn: ["#A4472D", "#CB6A36", "#E59A4E"]}[se];
  const crown = cols ? `<path d="${tips.map(([dx, dy]) => `M${P(x)} ${P(y - 28*s)} Q${P(x + dx*s*.4)} ${P(y - 40*s)} ${P(x + dx*s)} ${P(y + (dy - 12)*s)}`).join(" ")}" fill="none" stroke="#5A4234" stroke-width="${P(2.6*s)}"/>` + foliage(blobs, cols)
    + (se === "sakura" ? NP(blobs.map(([bx, by, rx], k) => `<circle cx="${P(bx + (rnd(i + k) - .5)*rx)}" cy="${P(by + (rnd(i*2 + k) - .5)*rx*.5)}" r="${P(1.6*s)}" fill="#FFFFFF" opacity=".8"/>`).join("") + petalFall(x, y - 40*s, s, i)) : "")
    : NP(bareCrown(x, y - 28*s, s, tips.map(([dx, dy]) => [dx*1.1, dy*1.2]), "#5A4234", i));
  return NP(shadow(x, y, 34*s) + trunk) + `<g pointer-events="none">${swing(x, y, .8, 7 + i % 3, -i)}${crown}</g>`;
}
// a white birch: a pale trunk with black eyes; a narrow airy crown, gold in autumn, bare in winter
function birch(x, y, s = 1, i = 0){
  const se = SEA(), P = v => f1(v), h = 74*s;
  const marks = Array.from({length: 6}, (_, k) => `<path d="M${P(x - 2.6*s)} ${P(y - 8*s - k*11*s - rnd(i + k)*4)} q${P(2.6*s)} ${P(-1.6*s)} ${P(4.6*s)} 0" stroke="#2E2A26" stroke-width="${P(1.2*s)}" fill="none"/>`).join("");
  const trunk = `<path d="M${P(x - 3*s)} ${P(y)} L${P(x - 1.8*s)} ${P(y - h)} L${P(x + 1.8*s)} ${P(y - h)} L${P(x + 3*s)} ${P(y)}z" fill="#F3F0E8" stroke="var(--line)" stroke-width=".7"/>${marks}`;
  const blobs = [[x - 9*s, y - 58*s, 11*s, 15*s], [x + 9*s, y - 66*s, 11*s, 16*s], [x, y - 82*s, 10*s, 13*s], [x + 1*s, y - 48*s, 12*s, 10*s]];
  const cols = {sakura: ["#7DAF4C", "#9BCB62", "#C2E28A"], summer: ["#4C883C", "#68A24E", "#8DC064"], autumn: ["#C4922A", "#E7B738", "#F7DA6A"]}[se];
  const crown = cols ? foliage(blobs, cols) : NP(bareCrown(x, y - 46*s, s*.7, [[-16, -36], [-6, -54], [6, -50], [16, -34]], "#7A6A5E", i)
    + (se === "spring" ? `<g opacity=".35">${blobs.map(([bx, by, rx, ry]) => `<ellipse cx="${P(bx)}" cy="${P(by)}" rx="${P(rx*.7)}" ry="${P(ry*.7)}" fill="#B9D27A"/>`).join("")}</g>` : ""));
  return NP(shadow(x, y, 16*s) + trunk) + `<g pointer-events="none">${swing(x, y, 1, 6 + i % 4, -i)}${crown}</g>`;
}
// a maple (Ezo momiji): a round crown, flaming red in autumn
function maple(x, y, s = 1, i = 0){
  const se = SEA(), P = v => f1(v);
  const trunk = `<path d="M${P(x - 3.4*s)} ${P(y)} Q${P(x - 2*s)} ${P(y - 16*s)} ${P(x - 1.4*s)} ${P(y - 26*s)} L${P(x + 1.4*s)} ${P(y - 26*s)} Q${P(x + 2*s)} ${P(y - 14*s)} ${P(x + 3.4*s)} ${P(y)}z" fill="#6A4A38" stroke="var(--line)" stroke-width=".7"/>`;
  const blobs = [[x - 14*s, y - 40*s, 15*s, 12*s], [x + 12*s, y - 42*s, 15*s, 12*s], [x, y - 54*s, 16*s, 12*s], [x, y - 34*s, 14*s, 9*s]];
  const cols = {sakura: ["#6E9A40", "#8EBA54", "#B8D878"], summer: ["#3A7034", "#4C8A3E", "#6EA654"], autumn: ["#9A2A22", "#C8402E", "#EC7A44"]}[se];
  const crown = cols ? foliage(blobs, cols) : NP(bareCrown(x, y - 26*s, s*.8, [[-26, -24], [-10, -40], [10, -40], [26, -24]], "#6A4A38", i));
  return NP(shadow(x, y, 22*s) + trunk) + `<g pointer-events="none">${swing(x, y, .8, 7 + i % 3, -i)}${crown}</g>`;
}
// an Ezo spruce: dark layered tiers, each with a ledge of snow in winter
function spruce(x, y, s = 1){
  const P = v => f1(v), w = winter();
  const tiers = [0, 1, 2, 3].map(k => { const yb = y - 8*s - k*16*s, hw = (20 - k*4.2)*s, ht = 26*s;
    return `<path d="M${P(x - hw)} ${P(yb)} L${P(x)} ${P(yb - ht)} L${P(x + hw)} ${P(yb)} Q${P(x)} ${P(yb - 5*s)} ${P(x - hw)} ${P(yb)}z" fill="${k % 2 ? "#2F5B40" : "#3A6B4A"}" stroke="#24452F" stroke-width=".7"/>`
      + (w ? `<path d="M${P(x - hw*.8)} ${P(yb - 3*s)} Q${P(x - hw*.3)} ${P(yb - 9*s)} ${P(x)} ${P(yb - ht*.55)} Q${P(x + hw*.4)} ${P(yb - 8*s)} ${P(x + hw*.85)} ${P(yb - 3*s)} Q${P(x)} ${P(yb - 7*s)} ${P(x - hw*.8)} ${P(yb - 3*s)}z" fill="${C.snow}"/>` : ""); }).join("");
  return NP(shadow(x, y, 20*s) + `<rect x="${P(x - 2.4*s)}" y="${P(y - 10*s)}" width="${P(4.8*s)}" height="${P(10*s)}" fill="#5A4234"/>` + tiers + (w ? `<path d="M${P(x - 3*s)} ${P(y - 80*s)} L${P(x)} ${P(y - 90*s)} L${P(x + 3*s)} ${P(y - 80*s)}z" fill="${C.snow}"/>` : ""));
}
// kumazasa (Hokkaido's bamboo grass): a clump of bright leaves edged pale in winter; a snowy mound when buried
const sasa = (x, y, s = 1) => winter() ? NP(`<path d="M${f1(x - 18*s)} ${f1(y)} Q${f1(x - 14*s)} ${f1(y - 12*s)} ${f1(x)} ${f1(y - 13*s)} Q${f1(x + 15*s)} ${f1(y - 12*s)} ${f1(x + 18*s)} ${f1(y)}z" fill="${C.snow}" stroke="${C.snow3}" stroke-width=".8"/>`)
  : NP([-40, -20, 0, 20, 40, -30, 30].map((a, k) => { const r = a*Math.PI/180, L = (13 - (k > 4 ? 3 : 0))*s, ex = x + Math.sin(r)*L, ey = y - Math.cos(r)*L*.9;
    return `<path d="M${f1(x)} ${f1(y)} Q${f1((x + ex)/2 - 3*s)} ${f1((y + ey)/2)} ${f1(ex)} ${f1(ey)} Q${f1((x + ex)/2 + 3*s)} ${f1((y + ey)/2 + 2*s)} ${f1(x)} ${f1(y)}z" fill="${k % 2 ? "#4E8A3A" : "#5E9C46"}" stroke="#E8EEC8" stroke-width=".5"/>`; }).join(""));
const tuft = (x, y, col) => `<path d="M${x - 4} ${y} q2 -7 4 -1 q2 -8 4 0 q1 -5 3 1" fill="none" stroke="${col}" stroke-width="1.2" pointer-events="none"/>`;
const tufts = pts => winter() ? "" : NP(pts.map(([x, y]) => tuft(x, y, grassCols()[1])).join(""));
const wildflowers = pts => SEA() === "summer" || SEA() === "sakura" ? NP(pts.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${["#F2D35E", "#FFFFFF", "#B48AD8", "#F08AA0"][k % 4]}"/>`).join("")) : "";

/* ---------- weather and light ---------- */
const doy = () => { const d = dayKey(); return Math.round((Date.parse(d + "T00:00:00Z") - Date.parse(d.slice(0, 4) + "-01-01T00:00:00Z"))/864e5); };
// winter: big soft flakes drifting down; sakura: petals drifting across the whole screen
const snowfall = () => NP(`<g fill="#FFFFFF">${Array.from({length: 46}, (_, k) => { const x = rnd(k*3.3)*540 - 10, d = 9 + rnd(k)*7, r = 1 + rnd(k*5.1)*1.6;
  return `<circle cx="${f1(x)}" cy="-6" r="${f1(r)}" opacity="${f1(.6 + rnd(k*2)*.4)}"><animateTransform attributeName="transform" type="translate" values="0 0;${f1(-10 + rnd(k*7)*20)} 330;${f1(-4 + rnd(k*9)*10)} 660" dur="${f1(d)}s" begin="${f1(-rnd(k*2.3)*d)}s" repeatCount="indefinite"/></circle>`; }).join("")}</g>`);
const petalDrift = () => NP(Array.from({length: 26}, (_, k) => { const y = rnd(k*4.1)*600, d = 12 + rnd(k)*8;
  return `<ellipse cx="-10" cy="${f1(y)}" rx="2.2" ry="1.3" fill="${k % 3 ? C.pink : C.pink3}" opacity=".9"><animateTransform attributeName="transform" type="translate" values="0 0;270 ${f1(30 + rnd(k*3)*40)};540 ${f1(rnd(k*5)*90)}" dur="${f1(d)}s" begin="${f1(-rnd(k*1.7)*d)}s" repeatCount="indefinite"/></ellipse>`; }).join(""));
function light(){
  const se = SEA();
  return se === "winter" ? `<rect width="520" height="640" fill="#BFD3E8" opacity=".1" pointer-events="none"/>` + snowfall()
    : se === "sakura" ? `<rect width="520" height="640" fill="#FFD3DF" opacity=".07" pointer-events="none"/>` + petalDrift()
    : se === "autumn" ? `<rect width="520" height="640" fill="#FFB860" opacity=".08" pointer-events="none"/>`
    : se === "summer" ? `<rect width="520" height="640" fill="#FFE9A8" opacity=".05" pointer-events="none"/>` : "";
}
// spring: patches of old snow lying in the shade
const oldSnow = pts => SEA() === "spring" ? NP(`<g filter="url(#wob)">${pts.map(([x, y, rx]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f1(rx*.4)}" fill="${C.snow}" opacity=".92"/><ellipse cx="${x + 2}" cy="${f1(y + rx*.12)}" rx="${f1(rx*.8)}" ry="${f1(rx*.22)}" fill="${C.snow2}"/>`).join("")}</g>`) : "";

/* ---------- ground ---------- */
const ground = (col, blobs) => `<rect width="520" height="640" fill="${col}"/><g filter="url(#wash)" opacity=".5" pointer-events="none">${blobs.map(([x, y, rx, ry, c]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join("")}</g>`;
const trail = (d, w, c1, c2) => NP(`<g filter="url(#wob)"><path d="${d}" fill="none" stroke="${c1}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c2}" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/></g>`);
// a path: gravel most of the year, trodden snow in winter
const path = (d, w) => winter() ? trail(d, w, "#D6DFE9", "#E6ECF3") : trail(d, w, C.gravel, C.gravel2);
const flags = (x, y, w, h, col, s = 18) => `<g pointer-events="none" opacity=".45">${Array.from({length: Math.ceil(h/s)}, (_, k) => `<path d="M${x} ${y + k*s} H${x + w}" stroke="${col}" stroke-width=".8"/>${Array.from({length: Math.ceil(w/26)}, (_, j) => `<path d="M${x + j*26 + (k % 2)*13} ${y + k*s} v${s}" stroke="${col}" stroke-width=".8"/>`).join("")}`).join("")}</g>`;
const courses = (x, y, w, h, col, s = 8, op = .55, brick = 22) => `<path d="${Array.from({length: Math.floor(h/s)}, (_, k) => `M${f1(x)} ${f1(y + (k + 1)*s)} h${f1(w)}` + Array.from({length: Math.ceil(w/brick)}, (_, j) => ` M${f1(x + j*brick + (k % 2)*brick/2)} ${f1(y + k*s)} v${s}`).join("")).join(" ")}" stroke="${col}" stroke-width=".6" opacity="${op}"/>`;

/* ---------- buildings ---------- */
// a Japanese tiled roof seen from the front: dark kawara tiles in ridged rows, a heavy ridge, the eaves turned up a
// touch at the ends; snow piled thick on it in winter with icicles along the eave
function kawara(x1, x2, yb, h, o = {}){
  const ov = o.ov || 8, w = x2 - x1, t1 = x1 + w*(o.hip ?? .16), t2 = x2 - w*(o.hip ?? .16), col = o.col || C.tile, col2 = o.col2 || C.tile2;
  const shape = `M${f1(x1 - ov)} ${f1(yb - 3)} Q${f1(x1 + 4)} ${f1(yb - h*.3)} ${f1(t1)} ${f1(yb - h)} L${f1(t2)} ${f1(yb - h)} Q${f1(x2 - 4)} ${f1(yb - h*.3)} ${f1(x2 + ov)} ${f1(yb - 3)} L${f1(x2 + ov - 2)} ${f1(yb + 2)} H${f1(x1 - ov + 2)}z`;
  const n = Math.round(w/7), ridges = Array.from({length: n + 1}, (_, k) => { const t = k/n; return `M${f1(x1 - ov + 3 + (w + 2*ov - 6)*t)} ${f1(yb)} L${f1(t1 + (t2 - t1)*t)} ${f1(yb - h + 3)}`; }).join(" ");
  const snow = winter() ? `<path d="M${f1(x1 - ov + 2)} ${f1(yb - 6)} Q${f1(x1 + 6)} ${f1(yb - h*.35)} ${f1(t1 - 2)} ${f1(yb - h - 5)} Q${f1((t1 + t2)/2)} ${f1(yb - h - 10)} ${f1(t2 + 2)} ${f1(yb - h - 5)} Q${f1(x2 - 6)} ${f1(yb - h*.35)} ${f1(x2 + ov - 2)} ${f1(yb - 6)} ${segs(Array.from({length: 9}, (_, k) => [x2 + ov - 2 - (w + 2*ov - 4)*k/8, yb - 7 + (k % 2 ? 3 : -1)]))}z" fill="${C.snow}" stroke="${C.snow3}" stroke-width=".8"/>`
    + Array.from({length: Math.floor(w/14)}, (_, k) => { const x = x1 + 4 + k*14 + rnd(k + x1)*6, l = 4 + rnd(k*3 + x1)*7; return `<path d="M${f1(x - 1.6)} ${f1(yb + 1)} L${f1(x)} ${f1(yb + 1 + l)} L${f1(x + 1.6)} ${f1(yb + 1)}z" fill="#E6F1F8" stroke="#B7CCDC" stroke-width=".4"/>`; }).join("") : "";
  return sk(`<path d="${shape}" fill="${col}"/><path d="${ridges}" stroke="${col2}" stroke-width="1.6" opacity=".8"/><path d="M${f1(x1 - ov + 2)} ${f1(yb)} H${f1(x2 + ov - 2)}" stroke="${col2}" stroke-width="3" stroke-dasharray="3 1.4"/><rect x="${f1(t1 - 4)}" y="${f1(yb - h - 4)}" width="${f1(t2 - t1 + 8)}" height="5" fill="${col2}"/>${o.fish ? [t1 - 4, t2 + 4].map((x, k) => `<path d="M${f1(x)} ${f1(yb - h - 3)} q${k ? 5 : -5} -4 ${k ? 2 : -2} -10 q${k ? -3 : 3} 2 ${k ? -2 : 2} 4" fill="${C.ochre}" stroke="var(--line)" stroke-width=".6"/>`).join("") : ""}`, `<path d="${shape}"/>`) + NP(snow);
}
// an iron gas lamp on a black post: a warm glass lantern that glows (brightest in the snow)
const lamp = (x, y, i = 0) => NP(`<circle cx="${x}" cy="${y - 50}" r="${winter() ? 18 : 12}" fill="#FFE39A" opacity="${winter() ? .38 : .22}"><animate attributeName="opacity" values="${winter() ? ".32;.44;.32" : ".18;.26;.18"}" dur="${f1(2.6 + (i % 3)*.5)}s" repeatCount="indefinite"/></circle>
  <path d="M${x - 4} ${y} h8 l-1.4 -5 h-5.2z" fill="${C.iron}"/><rect x="${x - 1.5}" y="${y - 44}" width="3" height="40" fill="${C.iron}"/><path d="M${x - 5} ${y - 30} h10" stroke="${C.iron}" stroke-width="1.2"/>
  <path d="M${x - 6} ${y - 44} h12 l-2 -12 h-8z" fill="#F7E3A0" stroke="${C.iron}" stroke-width="1.2"/><path d="M${x} ${y - 44} v-12" stroke="${C.iron}" stroke-width=".7"/><path d="M${x - 8} ${y - 56} L${x} ${y - 62} L${x + 8} ${y - 56}z" fill="${C.iron}"/><circle cx="${x}" cy="${y - 63}" r="1.4" fill="${C.iron}"/>
  ${winter() ? `<path d="M${x - 9} ${y - 56} Q${x} ${y - 67} ${x + 9} ${y - 56} Q${x} ${y - 59} ${x - 9} ${y - 56}z" fill="${C.snow}" stroke="${C.snow3}" stroke-width=".5"/>` : ""}`);
// a red paper lantern (chochin), swinging a little
const chochin = (x, y, i = 0, t = "") => NP(`<g>${swing(x, y - 6, 4, 3 + i % 3, -i)}<path d="M${x} ${y - 8} v3" stroke="${C.iron}" stroke-width=".8"/><circle cx="${x}" cy="${y + 7}" r="12" fill="#FFB060" opacity=".18"/><rect x="${x - 4}" y="${y - 5}" width="8" height="2.4" fill="${C.iron}"/><ellipse cx="${x}" cy="${y + 6}" rx="6.4" ry="9" fill="${C.lantern}" stroke="var(--line)" stroke-width=".7"/><path d="M${x - 6} ${y + 2} h12 M${x - 6.4} ${y + 6} h12.8 M${x - 6} ${y + 10} h12" stroke="#9A2A22" stroke-width=".5"/><rect x="${x - 4}" y="${y + 14}" width="8" height="2.4" fill="${C.iron}"/>${t ? `<text x="${x}" y="${y + 8.6}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="6" fill="#FFF3D8">${t}</text>` : ""}</g>`);
// a noren: a short split cloth curtain over a door, stirring in the draught
const noren = (x, y, w, col = C.navy, mark = "") => NP(`<path d="M${x - w/2 - 2} ${y} H${x + w/2 + 2}" stroke="${C.wood2}" stroke-width="2"/>${[0, 1, 2].map(k => `<g>${swing(x - w/3 + k*w/3, y, 2.5, 3.6 + k*.4, -k)}<rect x="${f1(x - w/2 + k*w/3 + .6)}" y="${y}" width="${f1(w/3 - 1.2)}" height="${f1(w*.5)}" fill="${col}"/></g>`).join("")}${mark ? `<text x="${x}" y="${f1(y + w*.3)}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="${f1(w*.22)}" fill="#F6F0E2">${mark}</text>` : ""}`);
// steam: soft puffs rising and fading from a vent, a pool or a pot
const steam = (x, y, i = 0, s = 1, rise = 46) => NP(Array.from({length: 3}, (_, k) => { const d = 3.6 + rnd(i*5 + k)*2, b = -(k*d/3 + rnd(i + k)*1.2), dx = (rnd(i*3 + k) - .5)*16;
  return `<g opacity="0"><animate attributeName="opacity" values="0;.8;.5;0" dur="${f1(d)}s" begin="${f1(b)}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;${f1(dx)} ${f1(-rise*s)}" dur="${f1(d)}s" begin="${f1(b)}s" repeatCount="indefinite"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(9*s)}" ry="${f1(6*s)}" fill="#FFFFFF"/><ellipse cx="${f1(x + 6*s)}" cy="${f1(y - 4*s)}" rx="${f1(6*s)}" ry="${f1(4.6*s)}" fill="#FFFFFF"/><ellipse cx="${f1(x - 6*s)}" cy="${f1(y - 2*s)}" rx="${f1(5*s)}" ry="${f1(4*s)}" fill="#F4F6F6"/></g>`; }).join(""));
// woodsmoke from a chimney: thin grey curls
const smoke = (x, y, i = 0) => NP(Array.from({length: 3}, (_, k) => `<circle cx="${x}" cy="${y}" r="${4 + k}" fill="#D9DCDE" opacity="0"><animate attributeName="opacity" values="0;.75;0" dur="5s" begin="${f1(-k*1.66 - i)}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;${8 + k*3} -38" dur="5s" begin="${f1(-k*1.66 - i)}s" repeatCount="indefinite"/></circle>`).join(""));
// a little wooden signpost for a gate (a cap of snow in winter)
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:${C.timber2}"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 22} h16" style="stroke:${C.red}" stroke-width="2"/>`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${winter() ? NP(`<path d="M${x - 4} ${y - 30} q4 -5 8 0z M${x + 3} ${y - 28} q14 -5 22 0z" fill="${C.snow}"/>`) : ""}${lab(lx, ly, label, col, 11)}</g>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;

/* ---------- creatures ---------- */
// a red-crowned crane (tancho): white, a black neck and black bustle, a red cap; dancing (wings open, leaping) in winter
function crane(x, y, s = 1, dir = 1, dance = false, i = 0){
  const legs = `<path d="M-2 0 L-1 -17 M2 0 L1.4 -17" stroke="#3A3A3A" stroke-width="1.3"/>`;
  const body = `<path d="M-9 -24 q-9 2 -13 9 q7 -1 13 -5z" fill="${C.black}"/><ellipse cx="0" cy="-23" rx="10.5" ry="6.6" fill="${C.crane}" stroke="var(--line)" stroke-width=".7"/>`;
  const head = `<g>${dance ? "" : swing(8, -26, 8, 4 + i, -i)}<path d="M7 -26 Q12 -35 11 -45" stroke="${C.black}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M8.8 -29 Q12.6 -36 12.2 -42" stroke="${C.crane}" stroke-width="1" fill="none"/><circle cx="11.6" cy="-47" r="3.2" fill="${C.crane}" stroke="var(--line)" stroke-width=".6"/><path d="M9.4 -46 q2 1.6 4.6 0" stroke="${C.black}" stroke-width="1.8"/><circle cx="11.4" cy="-49.4" r="1.6" fill="#D52E28"/><path d="M14.6 -47.4 l8 1.6 l-8 1.2z" fill="#B9A35C"/></g>`;
  const wing = k => `<g>${swing(0, -26, k ? -16 : 16, 1.4, -i*.3)}<path d="M0 -26 Q${k ? 10 : -10} -46 ${k ? 22 : -22} -54 Q${k ? 24 : -24} -44 ${k ? 18 : -18} -34 Q${k ? 10 : -10} -28 0 -24z" fill="${C.crane}" stroke="var(--line)" stroke-width=".7"/><path d="M${k ? 22 : -22} -54 Q${k ? 25 : -25} -46 ${k ? 19 : -19} -36 L${k ? 15 : -15} -40z" fill="${C.black}"/></g>`;
  const inner = dance ? `<g>${`<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -9;0 0;0 0" dur="2.6s" begin="${f1(-i*.7)}s" repeatCount="indefinite"/>`}${wing(0)}${legs}${body}${head}${wing(1)}</g>` : legs + body + head;
  return NP(`<ellipse cx="${f1(x)}" cy="${f1(y + 1)}" rx="${f1(12*s)}" ry="${f1(2.6*s)}" fill="#34404A" opacity=".14"/><g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})">${inner}</g>`);
}
// a gull (standing, its head turning; or flying a slow loop overhead)
const gullStand = (x, y, s = 1) => NP(`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-2 0 v-5 M2 0 v-5" stroke="#E0A040" stroke-width="1"/><ellipse cx="0" cy="-9" rx="7.6" ry="5" fill="#FBFBF8" stroke="var(--line)" stroke-width=".7"/><path d="M-8 -10 Q-2 -14 6 -11 Q0 -8 -10 -6z" fill="#8A96A2" stroke="var(--line)" stroke-width=".5"/><path d="M-10 -7 l-4 1 l3 -3z" fill="${C.black}"/><g>${swing(4, -12, 14, 3.2)}<circle cx="5" cy="-15" r="3.8" fill="#FBFBF8" stroke="var(--line)" stroke-width=".6"/><circle cx="6.4" cy="-15.8" r=".7" fill="${C.black}"/><path d="M8.4 -15 l4.4 .8 l-4.4 1z" fill="#F2C33E"/><circle cx="11.6" cy="-14.4" r=".6" fill="#D9302A"/></g></g>`);
const gullFly = (cx, cy, r, dur, begin = 0) => NP(`<g><animateMotion path="M${cx - r} ${cy} a${r} ${f1(r*.4)} 0 1 0 ${2*r} 0 a${r} ${f1(r*.4)} 0 1 0 ${-2*r} 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><path d="M-9 0 Q-4 -5 0 0 Q4 -5 9 0" fill="none" stroke="#5A646E" stroke-width="1.6" stroke-linecap="round"><animate attributeName="d" values="M-9 0 Q-4 -5 0 0 Q4 -5 9 0;M-9 -2 Q-4 2 0 0 Q4 2 9 -2;M-9 0 Q-4 -5 0 0 Q4 -5 9 0" dur="1.2s" repeatCount="indefinite"/></path></g>`);

/* ---------- boats ---------- */
// your own boat (the same boat as at home: white hull, blue stripe, red flag), tied alongside the pier
const yourBoat = (x, y) => NP(`<g>${bob(-1.4, 3.4)}<ellipse cx="${x + 3}" cy="${y + 2}" rx="52" ry="4" fill="${C.foam}" opacity=".6"/>${sk(`<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z" style="fill:#FFFDF6"/><path d="M${x - 36} ${y - 10} h78" style="stroke:#3E6B8C" stroke-width="3"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3" style="fill:#CFE0EE"/><path d="M${x + 30} ${y - 36} v-22 l14 9z" style="fill:#E8566C"/>`,
  `<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3"/><path d="M${x + 30} ${y - 18} v-40 l14 9 l-14 4"/>`)}${winter() ? `<path d="M${x - 13} ${y - 36} q17 -5 36 0z" fill="${C.snow}"/>` : ""}</g>`);
// a little white fishing boat with a wheelhouse and its bright good-catch flags (tairyo-bata)
const fishingBoat = (x, y, i = 0) => NP(`<g>${bob(-1.2, 3 + i*.4, -i)}<ellipse cx="${x}" cy="${y + 2}" rx="34" ry="3" fill="${C.foam}" opacity=".55"/>${sk(`<path d="M${x - 30} ${y - 12} h58 l6 -6 l-4 18 h-56z" fill="#F6F4EE"/><path d="M${x - 28} ${y - 5} h58" stroke="#C0392B" stroke-width="2.4"/><rect x="${x + 2}" y="${y - 28}" width="18" height="16" fill="#E9EEF2"/><rect x="${x + 5}" y="${y - 25}" width="12" height="6" fill="#7FA7C0"/><path d="M${x - 14} ${y - 12} V${y - 46}" stroke="${C.iron}" stroke-width="1.4"/>`, `<path d="M${x - 30} ${y - 12} h58 l6 -6 l-4 18 h-56z"/>`)}
  ${["#E0403A", "#F2C230", "#3E8FC0"].map((c, k) => `<g>${swing(x - 14, y - 44 + k*9, 6, 2 + k*.4, -k)}<path d="M${x - 14} ${y - 46 + k*9} h${12 - k*2} l-2 4 l2 4 h-${12 - k*2}z" fill="${c}" stroke="var(--line)" stroke-width=".4"/></g>`).join("")}${winter() ? `<path d="M${x + 1} ${y - 28} q10 -4 20 0z" fill="${C.snow}"/>` : ""}</g>`);

/* ---------- hk_market: the morning market and the canal ---------- */
function marketScreen(){
  const w = winter(), se = SEA();
  const base = w ? ground(C.snow, [[260, 420, 220, 120, C.snow2], [120, 300, 90, 50, "#E9EEF3"]]) : ground(C.pave, [[260, 420, 220, 120, C.pave2], [400, 460, 90, 50, "#DCD4C4"], [120, 470, 100, 40, "#DCD4C4"]]);
  const paving = w ? path("M260 -10 V420 M180 470 Q330 430 530 440 M92 362 Q180 410 260 420 M426 352 Q350 400 260 420 M400 530 Q330 470 260 420 M150 196 H370", 36)
    : NP(flags(0, 184, 520, 330, C.pave3, 20)) + NP(`<g opacity=".7">${flags(222, 0, 76, 112, C.pave3, 16)}</g>`);
  // the warehouses on the far side of the canal: grey stone, iron-shuttered windows, black tiled roofs with fish on
  // the ridges, ivy climbing (green, then red in autumn); and the road north between them
  const ivy = (x, y, h) => { const c = {summer: ["#3E7A36", "#5A9A44"], sakura: ["#6EA444", "#8CC05A"], autumn: ["#B83A2A", "#E0703A"]}[se];
    return c ? NP(`<g filter="url(#wob)">${Array.from({length: 16}, (_, k) => `<ellipse cx="${f1(x + rnd(k + x)*18 - 9)}" cy="${f1(y - 4 - rnd(k*3 + x)*h)}" rx="${f1(3 + rnd(k)*3)}" ry="${f1(2.6 + rnd(k*2)*2.4)}" fill="${c[k % 2]}"/>`).join("")}</g>`)
      : NP(`<path d="M${x} ${y} q-6 -${h*.4} 2 -${h*.6} q6 -${h*.2} -2 -${h*.4} M${x} ${y} q8 -${h*.3} 4 -${h*.7}" fill="none" stroke="#6A5A4A" stroke-width="1"/>`); };
  const shutter = (x, y) => `<rect x="${x}" y="${y}" width="16" height="18" fill="#3E4A48" stroke="var(--line)" stroke-width=".6"/><path d="M${x + 8} ${y} v18" stroke="#2A3230" stroke-width=".8"/><circle cx="${x + 3}" cy="${y + 3}" r=".8" fill="#8A9690"/><circle cx="${x + 13}" cy="${y + 3}" r=".8" fill="#8A9690"/><circle cx="${x + 3}" cy="${y + 15}" r=".8" fill="#8A9690"/><circle cx="${x + 13}" cy="${y + 15}" r=".8" fill="#8A9690"/>`;
  const warehouse = (x1, x2, n) => NP(sk(`<rect x="${x1}" y="40" width="${x2 - x1}" height="72" fill="${C.stone}"/>${courses(x1, 40, x2 - x1, 72, C.stone3, 9, .5, 26)}<rect x="${x1}" y="40" width="${x2 - x1}" height="5" fill="${C.stone2}"/>
    ${[0, 1, 2].map(k => shutter(x1 + 12 + k*(x2 - x1 - 40)/2, 52)).join("")}<rect x="${(x1 + x2)/2 - 14}" y="80" width="28" height="32" fill="#4A4038"/><path d="M${(x1 + x2)/2} 80 v32" stroke="#2E2822" stroke-width="1"/><text x="${(x1 + x2)/2}" y="76" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="#F1EADB">${n}</text>`,
    `<rect x="${x1}" y="40" width="${x2 - x1}" height="72"/>`)) + kawara(x1 + 4, x2 - 4, 42, 34, {hip: .1});
  const sky = NP(`<rect width="520" height="12" fill="${w ? "#DCE4EC" : "#D9E8F0"}"/>`);
  const road = NP(`<rect x="222" y="0" width="76" height="112" fill="${w ? C.snow2 : C.pave}"/>`);
  const warehouses = warehouse(0, 104, "壱") + warehouse(110, 222, "弐") + warehouse(298, 410, "参") + warehouse(416, 520, "四") + ivy(132, 110, 56) + ivy(400, 110, 50)
    + cherry(204, 112, .78, 1) + cherry(316, 112, .78, 2);
  // the canal: still dark water, stone kerbs, the warehouses and lamps reflected, and (in season) petals or leaves or
  // plates of ice drifting
  const reflect = [0, 110, 298, 416].map((x, k) => `<rect x="${x + 6}" y="118" width="${k % 2 ? 100 : 92}" height="24" fill="#3E6A70" opacity=".5"/>`).join("");
  const floaters = se === "sakura" ? Array.from({length: 18}, (_, k) => `<ellipse cx="${f1(rnd(k)*520)}" cy="${f1(124 + rnd(k*3)*44)}" rx="1.8" ry="1.1" fill="${C.pink3}"><animateTransform attributeName="transform" type="translate" values="0 0;30 0" dur="${f1(20 + rnd(k)*10)}s" repeatCount="indefinite"/></ellipse>`).join("")
    : se === "autumn" ? Array.from({length: 8}, (_, k) => `<path d="M${f1(rnd(k)*500 + 10)} ${f1(126 + rnd(k*3)*40)} l3 -2 l2 2 l-2 2z" fill="${k % 2 ? "#D9642E" : "#E8B83A"}"><animateTransform attributeName="transform" type="translate" values="0 0;24 0" dur="${f1(24 + rnd(k)*10)}s" repeatCount="indefinite"/></path>`).join("")
    : w ? `<g filter="url(#wob)">${[[40, 150, 28], [140, 130, 20], [360, 156, 30], [470, 136, 22], [200, 162, 16]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r*.3)}" fill="#E8EFF4" opacity=".9"/>`).join("")}</g>` : "";
  const canal = NP(`<rect x="0" y="108" width="520" height="70" fill="${w ? "#3F6C74" : C.water}"/>${reflect}<g stroke="#9CC2C2" stroke-width="1" opacity=".5">${[[30, 152], [180, 140], [340, 160], [450, 146], [100, 168], [400, 128]].map(([x, y], k) => `<path d="M${x} ${y} h18"><animateTransform attributeName="transform" type="translate" values="0 0;8 0;0 0" dur="${5 + k % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>
    ${[30, 96, 170, 350, 424, 496].map(x => `<path d="M${x} 150 q3 4 0 8 q-3 4 0 8" stroke="#F4D98A" stroke-width="2" fill="none" opacity=".55"/>`).join("")}${floaters}`)
    + NP(sk(`<rect x="0" y="104" width="520" height="6" fill="${C.stone2}"/><rect x="0" y="174" width="520" height="10" fill="${C.stone}"/>${courses(0, 174, 520, 10, C.stone3, 5, .5, 30)}`, `<path d="M0 174 H520"/>`));
  // the stone bridge over the canal on the road north, with its low parapets
  const bridge = NP(sk(`<rect x="224" y="104" width="72" height="80" fill="${w ? C.snow2 : C.pave}"/><rect x="220" y="104" width="8" height="80" fill="${C.stone}"/><rect x="292" y="104" width="8" height="80" fill="${C.stone}"/>${courses(220, 104, 8, 80, C.stone3, 10, .6, 10)}${courses(292, 104, 8, 80, C.stone3, 10, .6, 10)}`, `<path d="M220 104 V184 M228 104 V184 M292 104 V184 M300 104 V184"/>`)
    + (w ? `<path d="M219 104 h10 v80 h-10z M291 104 h10 v80 h-10z" fill="${C.snow}" opacity=".85"/>` : ""));
  const lamps = [30, 96, 170, 350, 424, 496].map((x, k) => lamp(x, 182, k)).join("");
  const cnl = place("hkcanal", 150, 196, 28, 9, "The old canal and its gas lamps", "", "The canal", 120, 128, "#BFE0DA");
  // the market hall: a long low building, cream walls and dark posts, red lanterns along the eaves, the big sign,
  // a window onto the crab tank, a chalkboard out front and a stack of fish boxes
  const hallWall = NP(sk(`<rect x="0" y="268" width="184" height="76" fill="${C.plaster}"/>${[0, 40, 72, 112, 144, 182].map(x => `<rect x="${x}" y="268" width="5" height="76" fill="${C.wood2}"/>`).join("")}<rect x="0" y="336" width="184" height="8" fill="${C.stone2}"/>
    <rect x="10" y="290" width="54" height="34" fill="#4E86A4"/><path d="M10 300 h54" stroke="#9CD0E0" stroke-width=".8"/><rect x="76" y="296" width="32" height="40" fill="#3A2C22"/><rect x="120" y="288" width="54" height="40" fill="${C.timber}"/>${courses(120, 288, 54, 40, C.timber2, 6, .6, 60)}`,
    `<rect x="0" y="268" width="184" height="76"/><rect x="10" y="290" width="54" height="34"/><rect x="76" y="296" width="32" height="40"/>`)
    + `<g>${bob(-2, 3)}<path d="M24 318 q6 -8 12 0 l6 -4 m-18 4 l-6 -4 m6 6 l-5 4 m17 -4 l5 4" stroke="#C83A2E" stroke-width="2" fill="none"/><ellipse cx="30" cy="318" rx="6" ry="4" fill="#D9483A"/></g><g>${bob(1.4, 2.4, -1)}<ellipse cx="52" cy="312" rx="4" ry="2.4" fill="#E06A3A"/></g>`);
  const hallRoof = kawara(-4, 188, 272, 52, {hip: .12});
  const hallSign = `<rect x="56" y="230" width="76" height="26" rx="2" fill="#FFFDF6" stroke="var(--line)" stroke-width="1" pointer-events="none"/><text x="94" y="245" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="12" fill="${C.red}" pointer-events="none">朝市</text><text x="94" y="253.6" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="6" fill="${C.ink}" pointer-events="none">MORNING MARKET</text>`;
  const hallBits = [16, 48, 140, 170].map((x, k) => chochin(x, 276, k)).join("") + noren(92, 296, 34, C.navy, "市")
    + NP(sk(`<path d="M150 344 l6 -22 h14 l6 22" fill="${C.wood}"/><rect x="152" y="320" width="22" height="16" fill="#2E3A34"/>`, "") + `<path d="M155 326 h14 M155 330 h10" stroke="#F1EADB" stroke-width=".8"/>`
    + sk(`<rect x="8" y="336" width="22" height="9" fill="#F6F6F2"/><rect x="10" y="328" width="22" height="9" fill="#F6F6F2"/><rect x="34" y="336" width="22" height="9" fill="#F6F6F2"/>`, "") + `<path d="M12 340 h12 M14 332 h12 M38 340 h12" stroke="#3E8FC0" stroke-width="1.2"/>`);
  const hall = place("hkhall", 92, 356, 28, 9, "The morning market hall", hallWall + hallRoof + hallSign + hallBits, "Market hall", 92, 376, "#F2C9B4");
  // Kenta's glassworks: an old stone warehouse, the furnace chimney smoking, a glowing arched window of coloured
  // glass, glass floats in a net by the door and the music boxes in the window
  const floats = [[352, 300, "#5FAF9A"], [362, 312, "#4E86C0"], [348, 318, "#E0A040"], [366, 296, "#8AC0D8"], [356, 326, "#6FB06A"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="${c}" opacity=".9" stroke="var(--line)" stroke-width=".5"/><circle cx="${x - 1.8}" cy="${y - 1.8}" r="1.4" fill="#FFFFFF" opacity=".7"/>`).join("");
  const glassWall = NP(sk(`<rect x="336" y="262" width="184" height="74" fill="${C.stone}"/>${courses(336, 262, 184, 74, C.stone3, 9, .5, 26)}<path d="M380 324 V290 Q380 278 398 278 Q416 278 416 290 V324z" fill="#F4C66A"/><path d="M450 324 V290 Q450 278 468 278 Q486 278 486 290 V324z" fill="#F4C66A"/>
    <rect x="410" y="296" width="32" height="40" fill="#5A3A24"/><rect x="414" y="300" width="24" height="36" fill="#E8A64A"/><path d="M414 300 l10 4 v32 l-10 -1z" fill="#6E4A2E"/>`,
    `<rect x="336" y="262" width="184" height="74"/><path d="M380 324 V290 Q380 278 398 278 Q416 278 416 290 V324z M450 324 V290 Q450 278 468 278 Q486 278 486 290 V324z"/><rect x="410" y="296" width="32" height="40"/>`)
    + [[388, 304, "#4E86C0"], [398, 300, "#E0603A"], [406, 306, "#5FAF9A"], [390, 316, "#B070C0"], [402, 316, "#E0A040"], [458, 304, "#8AC0D8"], [468, 300, "#6FB06A"], [478, 306, "#E0603A"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${c}"/>`).join("")
    + `<rect x="456" y="314" width="10" height="7" fill="#8A5A3A"/><rect x="470" y="314" width="10" height="7" fill="#6E4A6A"/><path d="M380 324 h36 M450 324 h36" stroke="${C.stone2}" stroke-width="3"/>`
    + `<path d="M344 294 l26 0 M344 294 q13 40 26 0" fill="none" stroke="#C8A86A" stroke-width=".8"/>${floats}<circle cx="426" cy="318" r="22" fill="#FFB050" opacity=".14"/>`);
  const glassRoof = kawara(340, 516, 264, 46, {hip: .14}) + NP(sk(`<rect x="486" y="200" width="16" height="44" fill="${C.stone2}"/>${courses(486, 200, 16, 44, C.stone3, 8, .6, 16)}`, `<rect x="486" y="200" width="16" height="44"/>`)) + smoke(494, 196, 0)
    + (w ? NP(`<path d="M484 200 q10 -6 20 0z" fill="${C.snow}"/>`) : "");
  const glassSign = `<g pointer-events="none"><path d="M398 268 h56" stroke="${C.iron}" stroke-width="1.4"/><g>${swing(426, 268, 3, 4)}<path d="M406 268 v6 M446 268 v6" stroke="${C.iron}" stroke-width=".8"/><rect x="400" y="274" width="52" height="16" rx="2" fill="#2E3A44" stroke="var(--line)" stroke-width=".8"/><text x="426" y="285.4" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="#F4D98A">硝子 Kenta</text></g></g>`;
  const glass = place("hkglass", 426, 348, 28, 9, "Kenta's glassworks", glassWall + glassRoof + glassSign, "Kenta's glassworks", 426, 368, "#BFE0DA");
  // the cherry trees: one by the glassworks, one on the quay
  const trees = cherry(498, 392, .82, 3) + cherry(26, 438, .8, 4) + NP(w ? "" : `<g>${[[488, 400], [508, 398], [14, 446], [40, 444]].map(([x, y]) => tuft(x, y, "#8A9A6A")).join("")}</g>`);
  // the harbour: the stone quay along its edge with bollards, the sea (ice floes in winter), the wooden pier, your
  // boat tied up alongside, a fishing boat with its flags, gulls wheeling
  const seaD = "M-10 520 H240 V650 H-10z";
  const harbour = NP(sk(`<path d="${seaD}" fill="${w ? "#3A6682" : C.sea}"/>`, `<path d="${seaD}"/>`) + `<path d="M-10 540 Q100 548 240 538 V560 Q120 570 -10 560z" fill="${C.sea2}" opacity=".5"/>`
    + `<g stroke="${C.foam}" stroke-width="1.3" fill="none" opacity=".7">${[[20, 560], [190, 572], [30, 620], [100, 600], [210, 630]].map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;5 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`
    + (w ? `<g filter="url(#wob)">${[[30, 630, 18], [210, 556, 12], [190, 616, 16]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r*.35)}" fill="#EAF1F6"/>`).join("")}</g>` : ""))
    + NP(sk(`<rect x="-4" y="508" width="248" height="12" fill="${C.stone}"/>${courses(-4, 508, 248, 12, C.stone3, 6, .55, 24)}<rect x="236" y="508" width="10" height="140" fill="${C.stone}"/>${courses(236, 508, 10, 140, C.stone3, 12, .5, 10)}`, `<path d="M-4 520 H236 V650"/>`)
      + (w ? `<rect x="-4" y="505" width="252" height="5" fill="${C.snow}"/>` : ""))
    + NP(sk(`${[128, 162].map(x => `<rect x="${x - 2}" y="520" width="5" height="124" fill="${C.wood2}"/>`).join("")}<rect x="128" y="516" width="38" height="128" fill="${C.timber}"/>${Array.from({length: 16}, (_, k) => `<path d="M128 ${524 + k*8} h38" stroke="${C.timber2}" stroke-width="1"/>`).join("")}`, `<rect x="128" y="516" width="38" height="128"/>`)
      + (w ? `<rect x="128" y="516" width="38" height="128" fill="${C.snow}" opacity=".7"/>` : "") + `<path d="M124 590 q-20 -6 -40 -2" stroke="#C8A86A" stroke-width="1.2" fill="none"/>`)
    + yourBoat(76, 596) + fishingBoat(204, 616, 1) + NP([40, 196].map(x => `<rect x="${x - 4}" y="506" width="8" height="8" rx="2" fill="${C.iron}"/>`).join("")) + gullFly(110, 470, 70, 18) + gullFly(380, 160, 60, 22, -7);
  const boat = place("hkboat", 150, 498, 30, 10, "Your boat at the harbour pier", "", "Your boat", 68, 534, "#BFE0DA");
  // the gull on his bollard
  const gull = place("hkgull", 262, 506, 18, 8, "A gull on a bollard", NP(sk(`<path d="M252 546 v-16 q10 -6 20 0 v16z" fill="${C.iron}"/><ellipse cx="262" cy="530" rx="10" ry="3" fill="#4A5258"/>`, `<path d="M252 546 v-16 q10 -6 20 0 v16z"/>`)) + gullStand(262, 530, 1.1), "Gull", 214, 548, "#F6E3B4");
  // the fish crates, nets and glass floats on the quay
  const crates = NP(sk(`${[[242, 590], [270, 590], [256, 576], [242, 616], [270, 616]].map(([x, y]) => `<rect x="${x}" y="${y}" width="26" height="14" fill="#F4F4F0"/>`).join("")}<rect x="244" y="606" width="54" height="2" fill="#D9D9D2"/>`, "")
    + `${[[246, 597], [274, 597], [260, 583]].map(([x, y]) => `<path d="M${x} ${y} h16" stroke="#3E8FC0" stroke-width="1.6"/>`).join("")}<ellipse cx="286" cy="636" rx="12" ry="5" fill="#E07A3A"/><ellipse cx="286" cy="634" rx="6" ry="2.4" fill="#B8582A"/>${w ? `<path d="M240 576 h58 v-4 h-58z" fill="${C.snow}"/>` : ""}`);
  // the crab and sea urchin stalls: long tables of crab on ice, trays of urchin, scallops on the grill, a steaming
  // crab pot, cloth fronts with the names, good-catch banners on poles, and the awnings over the stallholders
  const crab = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 0 l-10 -6 l-6 4 M-6 2 l-12 2 l-4 6 M-5 4 l-8 8 M6 0 l10 -6 l6 4 M6 2 l12 2 l4 6 M5 4 l8 8" stroke="#C8402E" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="8" ry="6" fill="#D24A34" stroke="var(--line)" stroke-width=".6"/><circle cx="-2" cy="-2" r=".8" fill="#F6E0C8"/><circle cx="2" cy="-2" r=".8" fill="#F6E0C8"/></g>`;
  const uni = (x, y) => `<rect x="${x - 8}" y="${y - 4}" width="16" height="9" fill="#C89A5A" stroke="var(--line)" stroke-width=".5"/>${[-5, -1.6, 1.8, 5.2].map(d => `<ellipse cx="${x + d}" cy="${y}" rx="2" ry="3" fill="#F09A2A"/>`).join("")}`;
  const stall = (x1, x2, name, k) => NP(sk(`<rect x="${x1}" y="550" width="${x2 - x1}" height="22" fill="#E9F2F6"/><rect x="${x1}" y="572" width="${x2 - x1}" height="22" fill="${k ? "#2E5A7A" : "#7A2E2A"}"/>`, `<rect x="${x1}" y="550" width="${x2 - x1}" height="44"/>`)
    + `<text x="${(x1 + x2)/2}" y="587" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="11" fill="#FFF6E6">${name}</text>`
    + sk(`<path d="M${x1 - 4} 598 H${x2 + 4} L${x2 + 10} 640 H${x1 - 10}z" fill="#FFFDF6"/>${Array.from({length: Math.ceil((x2 - x1)/14)}, (_, j) => `<path d="M${x1 + 4 + j*14} 598 l-2 42" stroke="${k ? "#3E8FC0" : C.red}" stroke-width="6"/>`).join("")}`, `<path d="M${x1 - 4} 598 H${x2 + 4} L${x2 + 10} 640 H${x1 - 10}z"/>`));
  const nobori = (x, t, col, i) => NP(`<path d="M${x} 600 V500" stroke="${C.iron}" stroke-width="1.4"/><g>${swing(x, 502, 3, 4 + i, -i)}<rect x="${x + 1}" y="502" width="12" height="44" fill="${col}" stroke="var(--line)" stroke-width=".6"/><text x="${x + 7}" y="514" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="#FFFDF6" writing-mode="tb">${t}</text></g>`);
  const stallsArt = stall(304, 406, "かに", 0) + stall(416, 514, "うに", 1)
    + NP(crab(322, 560) + crab(346, 558, .9) + crab(370, 562) + `<rect x="384" y="554" width="18" height="12" fill="#5A5E62"/><path d="M386 556 h14" stroke="#E07A3A" stroke-width="2" stroke-dasharray="2 2"/>${[388, 394, 400].map(x => `<ellipse cx="${x}" cy="556" rx="2.6" ry="1.6" fill="#F2E6CC" stroke="#B8A47A" stroke-width=".4"/>`).join("")}`
      + uni(432, 560) + uni(452, 560) + uni(472, 560) + `<ellipse cx="496" cy="560" rx="9" ry="5" fill="#F4F4F0" stroke="var(--line)" stroke-width=".5"/>${[-4, 0, 4].map(d => `<circle cx="${496 + d}" cy="559" r="2" fill="#E8502A"/>`).join("")}`
      + (w ? `<path d="M302 550 h106 v-3 h-106z M414 550 h102 v-3 h-102z" fill="${C.snow}"/>` : ""))
    + steam(390, 548, 1, .6, 30) + nobori(300, "かに", C.red, 0) + nobori(508, "うに", "#2E5A7A", 1);
  const stalls = place("hkstalls", 400, 528, 30, 9, "The crab and sea urchin stalls", stallsArt, "Crab stalls", 360, 616, "#F2C9B4");
  const bits = w ? "" : NP([[200, 230], [320, 240], [300, 470], [470, 480], [60, 380], [220, 380]].map(([x, y], k) => `<path d="M${x - 3} ${y} h6" stroke="${C.pave3}" stroke-width="1" opacity=".4"/>`).join(""));
  return sky + base + road + paving + canal + bridge + warehouses + cnl + lamps + hall + glass + trees + harbour + crates + boat + gull + stalls + bits + light()
    + gate("hkToNiseko", 260, 40, "Niseko", 330, 34, "North over the canal bridge to Niseko", "#BFE0DA")
    + gate("hkToOnsen", 500, 440, "Hot springs", 450, 478, "East along the harbour road to the hot springs");
}

/* ---------- hk_onsen: the hot springs valley ---------- */
function onsenScreen(){
  const w = winter(), [gr, gr2] = grassCols();
  const base = ground(gr, [[260, 400, 200, 110, gr2], [120, 560, 120, 50, gr2]]);
  // the paths: in from the harbour road, up the valley lane, to the ryokan, the foot bath and the egg spring
  const paths = path("M-10 440 Q120 430 250 410 Q340 400 420 452 M140 -10 Q150 120 200 250 Q240 330 250 410 M250 410 Q200 470 128 506 M250 410 Q300 470 324 526 M250 410 Q280 330 300 262", 44);
  // the trees above the lane: spruce, a cherry and a maple
  const woods = spruce(20, 120, 1.1) + spruce(70, 70, .9) + maple(40, 210, 1, 1) + cherry(80, 168, .8, 2) + spruce(14, 40, .8) + sasa(70, 222) + sasa(20, 232, .8);
  // the steaming valley: a sunken basin of ochre, rust, sulphur yellow and white rock, vents and bubbling pools,
  // a zig-zag boardwalk out across it, and the far slopes; the rock is warm, so the snow only lies on the rims
  const rocks = [[260, 60, 70, 40, C.ochre], [400, 50, 80, 36, C.rust], [470, 130, 60, 50, C.ochre], [330, 150, 80, 50, C.rock], [240, 170, 50, 40, C.rust], [420, 200, 70, 30, C.rock2], [300, 90, 40, 30, C.sulphur], [500, 220, 40, 30, C.rust], [220, 100, 30, 40, C.rock]];
  const vD = "M232 0 H520 V248 H204 Q194 206 210 160 Q222 110 204 66 Q200 24 232 0z";
  const valley = NP(`<clipPath id="hkVal"><path d="${vD}"/></clipPath><path d="${vD}" fill="#C8A274" stroke="#8A6A48" stroke-width="2"/><g clip-path="url(#hkVal)"><g filter="url(#wash)">${rocks.map(([x, y, rx, ry, c]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join("")}</g>
    <g filter="url(#wob)">${[[280, 120, 16, 6], [380, 100, 20, 7], [450, 170, 14, 5], [350, 210, 18, 6], [250, 210, 12, 5]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.milky}"/><ellipse cx="${x - 3}" cy="${y - 1}" rx="${f1(rx*.6)}" ry="${f1(ry*.5)}" fill="${C.milky2}"/>`).join("")}</g></g>
    ${[[330, 60], [430, 130], [262, 150], [490, 70], [400, 180]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.6" fill="#5A4436"/><ellipse cx="${x}" cy="${y}" rx="8" ry="3.6" fill="none" stroke="${C.sulphur}" stroke-width="1.6"/>`).join("")}
    ${[[280, 120], [380, 100], [450, 170], [350, 210]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#FFFFFF"><animate attributeName="r" values="0;3;0" dur="${1.2 + k*.3}s" repeatCount="indefinite"/></circle>`).join("")}`)
    + NP(`<path d="M220 0 H520 V24 Q440 34 360 22 Q280 14 214 30z" fill="${w ? C.snow : "#7E8A5A"}"/>`) + spruce(230, 22, .6) + spruce(480, 20, .7) + spruce(400, 14, .5);
  const walk = NP(sk(`<path d="M292 248 L300 196 L380 160 L392 112 L470 74 L478 30" fill="none" stroke="${C.timber}" stroke-width="12" stroke-linejoin="round"/>`, `<path d="M286 248 L294 194 L374 158 L386 110 L464 72 L472 30 M298 248 L306 198 L386 162 L398 114 L476 76 L484 30" stroke-width="1"/>`)
    + `<path d="M292 248 L300 196 L380 160 L392 112 L470 74 L478 30" fill="none" stroke="${C.timber2}" stroke-width="12" stroke-dasharray="1 4" opacity=".8"/>`);
  const vapour = [[330, 60], [430, 130], [262, 150], [490, 70], [400, 180], [280, 120], [350, 210], [450, 170], [240, 60], [500, 200]].map(([x, y], k) => steam(x, y, k, 1.1 + (k % 3)*.2, 60)).join("");
  // the rim of the valley: a rail of rough logs, snow on the top in winter, and a sign
  const rim = NP(sk(`<rect x="196" y="240" width="324" height="8" fill="${C.timber}"/>${Array.from({length: 12}, (_, k) => `<rect x="${200 + k*27}" y="230" width="4" height="20" fill="${C.timber2}"/>`).join("")}<path d="M196 232 H520" stroke="${C.timber2}" stroke-width="3"/>`, `<path d="M196 232 H520 M196 248 H520"/>`)
    + (w ? `<path d="M196 238 H520 V242 H196z M196 229 H520 V232 H196z" fill="${C.snow}"/>` : "")) + sign(236, 244, 52, "地獄谷", 8);
  const vents = place("hkvents", 300, 264, 28, 9, "The steaming valley", valley + walk + vapour + rim, "Steaming valley", 262, 290, "#F6E3B4");
  // the red oni on his stone plinth: horns, a fierce grin, a tiger-skin wrap and a great iron club
  const oniArt = NP(sk(`<rect x="24" y="306" width="78" height="30" fill="${C.stone}"/>${courses(24, 306, 78, 30, C.stone3, 10, .55, 26)}<rect x="20" y="300" width="86" height="8" fill="${C.stone2}"/>`, `<rect x="24" y="300" width="78" height="36"/>`)
    + sk(`<path d="M50 300 l-2 -22 h10 l2 22z M66 300 l2 -22 h-10 l-2 22z" fill="${C.red}"/><path d="M42 282 Q40 256 48 250 Q62 243 76 250 Q84 256 82 282z" fill="${C.red}"/><path d="M53 256 q9 5 18 0" stroke="#9A2A22" stroke-width="1" fill="none"/><path d="M44 276 h36 v8 h-36z" fill="#E8C24A"/><path d="M48 279 l3 4 M56 279 l3 4 M64 279 l3 4 M72 279 l3 4" stroke="${C.black}" stroke-width="1.2"/>
      <path d="M44 256 q-12 8 -10 22 M80 256 q10 6 12 -8" stroke="${C.red}" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="62" cy="236" r="13" fill="${C.red}"/><path d="M52 226 l-4 -9 l6 5z M72 226 l4 -9 l-6 5z" fill="#F2E6C8"/><path d="M52 228 q10 -8 20 0" fill="#3A2A22"/>`,
      `<path d="M42 282 Q40 256 48 250 Q62 243 76 250 Q84 256 82 282z"/><circle cx="62" cy="236" r="13"/>`)
    + `<circle cx="57" cy="235" r="2.4" fill="#FFFDF6"/><circle cx="67" cy="235" r="2.4" fill="#FFFDF6"/><circle cx="57.4" cy="235.4" r="1.1" fill="${C.black}"/><circle cx="67.4" cy="235.4" r="1.1" fill="${C.black}"/><path d="M55 242 q7 5 14 0 z" fill="#FFFDF6" stroke="${C.black}" stroke-width=".6"/><path d="M57 242 l1 3 M66 242 l1 3" stroke="${C.black}" stroke-width=".5"/>`
    + `<g>${swing(92, 270, 3, 5)}<path d="M92 274 L98 210" stroke="${C.iron}" stroke-width="5" stroke-linecap="round"/><path d="M95 240 L100 210" stroke="${C.iron}" stroke-width="8" stroke-linecap="round"/>${[218, 226, 234].map(y => `<circle cx="${y === 218 ? 99 : y === 226 ? 98 : 97}" cy="${y}" r="1.6" fill="#8A929A"/>`).join("")}</g>`
    + (w ? `<path d="M50 224 q12 -8 24 0 q-12 -3 -24 0z M20 300 h86 v-4 h-86z" fill="${C.snow}"/>` : ""));
  const oni = place("hkoni", 72, 352, 26, 9, "The red oni and his club", oniArt, "Red oni", 62, 372, "#F2C9B4");
  // Mrs Sato's ryokan: two storeys of dark timber and paper screens, a curved tiled roof, lanterns, a navy noren and
  // a little stone lantern and pine in the garden
  const shoji = (x, y, wd, h) => `<rect x="${x}" y="${y}" width="${wd}" height="${h}" fill="#F6EEDA"/><path d="${Array.from({length: Math.floor(wd/7)}, (_, k) => `M${x + 7 + k*7} ${y} v${h}`).join(" ")} ${Array.from({length: Math.floor(h/8)}, (_, k) => `M${x} ${y + 8 + k*8} h${wd}`).join(" ")}" stroke="#9A7A58" stroke-width=".6"/>`;
  const ryArt = NP(sk(`<rect x="340" y="330" width="176" height="110" fill="#6E4A32"/><rect x="340" y="330" width="176" height="6" fill="${C.wood2}"/>${shoji(352, 344, 42, 32)}${shoji(452, 344, 42, 32)}${shoji(352, 392, 42, 34)}${shoji(452, 392, 42, 34)}<rect x="404" y="398" width="32" height="42" fill="#2E2218"/><rect x="336" y="436" width="184" height="6" fill="${C.stone2}"/>`,
    `<rect x="340" y="330" width="176" height="110"/><rect x="404" y="398" width="32" height="42"/>`))
    + kawara(332, 524, 384, 18, {ov: 10, hip: .02}) + kawara(338, 520, 334, 44, {hip: .16, fish: false})
    + NP(`<rect x="398" y="292" width="44" height="16" rx="2" fill="#2E2218" stroke="var(--line)" stroke-width=".8"/><text x="420" y="303.6" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9" fill="#F4E6C8">佐藤旅館</text>`)
    + noren(420, 400, 34, C.navy, "ゆ") + chochin(396, 404, 1, "") + chochin(444, 404, 2, "");
  const ryokan = place("hkryokan", 420, 452, 28, 9, "Mrs Sato's ryokan", ryArt, "Mrs Sato's ryokan", 400, 472, "#BFE0DA");
  // the garden by the ryokan: a stone lantern, a maple and a cherry
  const toro = (x, y) => NP(sk(`<rect x="${x - 3}" y="${y - 16}" width="6" height="16" fill="${C.stone}"/><rect x="${x - 7}" y="${y - 28}" width="14" height="12" fill="${C.stone}"/><rect x="${x - 4}" y="${y - 25}" width="8" height="6" fill="#F4D98A"/><path d="M${x - 11} ${y - 28} L${x} ${y - 36} L${x + 11} ${y - 28}z" fill="${C.stone2}"/>`, `<rect x="${x - 7}" y="${y - 28}" width="14" height="12"/>`) + (w ? `<path d="M${x - 11} ${y - 29} L${x} ${y - 37} L${x + 11} ${y - 29}z" fill="${C.snow}"/>` : ""));
  const garden = maple(482, 566, 1, 3) + toro(426, 520) + cherry(480, 620, 1, 4) + sasa(430, 600, 1.1) + sasa(500, 520, .8);
  // the foot bath: a warm milky stream between rocks, a long wooden bench along it, a little sign; steam rising
  const fbArt = NP(sk(`<path d="M28 540 Q120 530 228 544 L228 592 Q120 600 28 588z" fill="${C.stone2}"/>`, `<path d="M28 540 Q120 530 228 544 L228 592 Q120 600 28 588z"/>`)
    + `<path d="M36 548 Q120 540 220 552 L220 584 Q120 590 36 580z" fill="${C.milky}"/><path d="M40 560 Q120 552 216 566" stroke="${C.milky2}" stroke-width="5" fill="none"><animate attributeName="stroke-dashoffset" values="0;-40" dur="3s" repeatCount="indefinite"/></path><path d="M44 572 Q120 566 214 576" stroke="#FFFFFF" stroke-width="1" stroke-dasharray="6 10" fill="none" opacity=".7"><animate attributeName="stroke-dashoffset" values="0;-32" dur="2.4s" repeatCount="indefinite"/></path>`
    + sk(`<rect x="34" y="520" width="190" height="10" fill="${C.timber}"/><path d="M40 530 v10 M120 530 v10 M216 530 v10" stroke="${C.wood2}" stroke-width="3"/>`, `<rect x="34" y="520" width="190" height="10"/>`)
    + [[30, 560], [226, 570], [60, 594], [180, 596], [130, 538]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="${8 + k % 3*2}" ry="5" fill="${k % 2 ? C.stone : C.stone2}" stroke="var(--line)" stroke-width=".6"/>`).join("")
    + (w ? `<path d="M34 520 h190 v-3 h-190z" fill="${C.snow}"/>` : "")) + steam(80, 566, 2, .8, 34) + steam(170, 570, 5, .8, 34) + NP(sign(206, 510, 34, "足湯", 8));
  const footbath = place("hkfootbath", 128, 504, 30, 9, "The free foot bath", fbArt, "Foot bath", 128, 618, "#BFE0DA");
  // the egg spring: a bubbling pool in a ring of stones, bamboo poles over it with baskets of eggs on ropes
  const egArt = NP(sk(`<ellipse cx="326" cy="590" rx="60" ry="34" fill="${C.stone2}"/>`, `<ellipse cx="326" cy="590" rx="60" ry="34"/>`) + `<ellipse cx="326" cy="592" rx="50" ry="26" fill="${C.milky}"/><ellipse cx="320" cy="588" rx="30" ry="12" fill="${C.milky2}"/>`
    + [[300, 590], [326, 600], [350, 584]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="2" fill="#FFFFFF"><animate attributeName="r" values="0;3.4;0" dur="${1 + k*.3}s" repeatCount="indefinite"/></circle>`).join("")
    + sk(`<path d="M270 560 L382 552" stroke="${C.timber}" stroke-width="4"/><path d="M276 560 V620 M376 552 V616" stroke="${C.timber2}" stroke-width="3"/>`, `<path d="M270 560 L382 552"/>`)
    + [300, 326, 352].map((x, k) => `<g>${swing(x, 558, 4, 3 + k*.5, -k)}<path d="M${x} 558 v20" stroke="#8A7050" stroke-width=".8"/><path d="M${x - 8} 578 h16 l-2 8 h-12z" fill="#C8A060" stroke="var(--line)" stroke-width=".6"/>${[-4, 0, 4].map(d => `<ellipse cx="${x + d}" cy="578" rx="2.4" ry="3" fill="#F6EEDC" stroke="#B8A47A" stroke-width=".3"/>`).join("")}</g>`).join("")
    + (w ? `<path d="M266 562 Q326 548 386 562" stroke="${C.snow}" stroke-width="3" fill="none"/>` : "")) + steam(310, 592, 3, .9, 40) + steam(346, 588, 7, .9, 40) + NP(sign(380, 538, 54, "温泉たまご", 7));
  const eggs = place("hkeggs", 324, 526, 26, 9, "The egg spring", egArt, "Egg spring", 324, 628, "#F6E3B4");
  // along the bottom: bamboo grass, ferns and a stone or two; old snow in the shade in spring
  const bottom = sasa(30, 626, 1.2) + sasa(90, 630) + sasa(160, 628, 1.1) + sasa(230, 632) + sasa(400, 470, .8) + oldSnow([[40, 610, 30], [160, 240, 26], [470, 470, 20], [200, 620, 24]]);
  const bits = tufts([[150, 300], [260, 330], [300, 480], [180, 470], [110, 400], [360, 470]]) + wildflowers([[120, 290], [170, 380], [280, 360], [330, 300], [200, 450]]);
  return base + paths + woods + vents + oni + ryokan + garden + footbath + eggs + bottom + bits + light()
    + gate("hkToMarket", 20, 440, "Morning market", 80, 410, "West along the harbour road to the market", "#BFE0DA")
    + gate("hkToFlowersS", 140, 40, "Flower farm", 140, 90, "North up the valley lane to the flower farm", "#F2C9B4");
}

/* ---------- hk_niseko: Niseko under Mount Yotei ---------- */
function nisekoScreen(){
  const w = winter(), se = SEA(), [gr, gr2] = grassCols();
  const base = ground(gr, [[260, 400, 200, 110, gr2], [400, 560, 120, 50, gr2]]);
  // the sky and Mount Yotei: a near-perfect cone, white most of the year (just a cap in summer), and the foothills
  const capH = {winter: 1, spring: .7, sakura: .5, summer: .22, autumn: .4}[se];
  const yotei = (cx, base, hw, h) => { const sh = h*capH, sw = hw*capH;
    return NP(`<path d="M${cx - hw} ${base} Q${cx - hw*.45} ${base - h*.55} ${cx - 12} ${base - h} H${cx + 12} Q${cx + hw*.45} ${base - h*.55} ${cx + hw} ${base}z" fill="${w ? "#B9C9DA" : "#7F95A8"}"/>`
      + `<path d="M${f1(cx - sw - 6)} ${f1(base - h + sh)} Q${f1(cx - sw*.4)} ${f1(base - h + sh - 4)} ${cx - 12} ${base - h} H${cx + 12} Q${f1(cx + sw*.4)} ${f1(base - h + sh - 6)} ${f1(cx + sw + 6)} ${f1(base - h + sh)} ${segs(Array.from({length: 7}, (_, k) => [cx + sw + 6 - (2*sw + 12)*k/6, base - h + sh + (k % 2 ? 6 : -2)]))}z" fill="#FAFCFE"/>`
      + `<path d="M${cx + 12} ${base - h} Q${cx + hw*.45} ${base - h*.55} ${cx + hw} ${base} H${cx + hw*.5} Q${cx + hw*.2} ${base - h*.5} ${cx + 4} ${base - h}z" fill="#3A4A5A" opacity=".12"/>`
      + `<g><animateTransform attributeName="transform" type="translate" values="0 0;14 0;0 0" dur="46s" repeatCount="indefinite"/><ellipse cx="${cx - hw*.4}" cy="${base - h*.45}" rx="40" ry="7" fill="#FFFFFF" opacity=".7"/><ellipse cx="${cx + hw*.5}" cy="${base - h*.3}" rx="30" ry="6" fill="#FFFFFF" opacity=".6"/></g>`); };
  const sky = NP(`<rect width="520" height="160" fill="${w ? "#DCE6EF" : se === "autumn" ? "#E3ECEF" : "#CFE4EF"}"/>`) + yotei(360, 146, 170, 124)
    + NP(`<path d="M200 160 Q260 130 330 140 Q420 126 520 136 V160z" fill="${w ? C.snow2 : {spring: "#7E8A5E", sakura: "#6E9A4E", summer: "#4E8A44", autumn: "#B88A3A"}[se]}"/>`)
    + [[230, 152, .5], [258, 148, .45], [470, 146, .5], [500, 150, .55], [440, 150, .4]].map(([x, y, s]) => spruce(x, y, s)).join("") + [[330, 154, .45], [380, 150, .4], [410, 154, .45]].map(([x, y, s], k) => birch(x, y, s, k)).join("") + cherry(222, 158, .62, 8) + cherry(506, 160, .7, 9);
  // the ski slope down from the top-left, groomed with corduroy lines in winter (skiers zig-zagging down), green with
  // wildflowers in summer, gold in autumn, with spruce along its edge
  const slopeD = "M0 0 H120 Q182 22 210 74 Q190 150 208 236 H96 Q60 200 0 210z";
  const slopeCol = {winter: "#FAFCFE", spring: "#B4BC88", sakura: "#A6CC74", summer: "#8EC05A", autumn: "#CDB46A"}[se];
  const skier = (d, dur, b, col) => `<g><animateMotion path="${d}" dur="${dur}s" begin="${b}s" repeatCount="indefinite"/><path d="M-5 2 h10" stroke="#3A3A3A" stroke-width="1.2"/><path d="M0 1 v-6" stroke="${col}" stroke-width="3"/><circle cx="0" cy="-7.5" r="2" fill="${col}"/></g>`;
  const slope = NP(`<path d="${slopeD}" fill="${slopeCol}"/>` + sk("", `<path d="M120 0 Q182 22 210 74 Q190 150 208 236 M96 236 Q60 200 0 210"/>`)
    + (w ? `<path d="${Array.from({length: 9}, (_, k) => `M${20 + k*20} 0 Q${30 + k*18} 110 ${60 + k*15} 220`).join(" ")}" stroke="#DCE6F0" stroke-width="1" fill="none"/>` + skier("M40 0 Q100 40 50 80 Q10 120 90 160 Q150 190 120 230", 12, 0, "#E0403A") + skier("M150 0 Q90 50 140 100 Q190 150 130 200", 14, -6, "#3E8FC0")
      : `<g opacity=".7">${Array.from({length: 18}, (_, k) => `<circle cx="${f1(20 + rnd(k)*180)}" cy="${f1(20 + rnd(k*3)*200)}" r="1.5" fill="${se === "autumn" ? "#E8A040" : ["#F2D35E", "#FFFFFF", "#B48AD8"][k % 3]}"/>`).join("")}</g>`))
    + spruce(14, 190, .9) + spruce(30, 120, .8) + spruce(16, 50, .7);
  // the chairlift: pylons up the slope, the cable, chairs going up and coming down, the base station with its wheel
  const lineUp = "M168 238 L72 -30", lineDn = "M78 -30 L176 238";
  const chair = (d, dur, b) => `<g><animateMotion path="${d}" dur="${dur}s" begin="${b}s" repeatCount="indefinite"/><path d="M0 0 v10" stroke="${C.iron}" stroke-width="1"/><path d="M-6 10 h12 v6 h-12z" fill="#D9483A" stroke="var(--line)" stroke-width=".6"/></g>`;
  const lift = NP(sk(`${[[140, 160], [112, 84], [88, 18]].map(([x, y]) => `<path d="M${x} ${y + 50} V${y}" stroke="#6A7480" stroke-width="4"/><path d="M${x - 12} ${y} h24" stroke="#6A7480" stroke-width="3"/>`).join("")}`, "")
    + `<path d="${lineUp} ${lineDn}" stroke="#3A4048" stroke-width="1" fill="none"/>` + Array.from({length: 5}, (_, k) => chair(lineUp, 20, -k*4)).join("") + Array.from({length: 5}, (_, k) => chair(lineDn, 20, -k*4 - 2)).join("")
    + sk(`<rect x="110" y="250" width="92" height="36" fill="${C.timber}"/>${courses(110, 250, 92, 36, C.timber2, 6, .6, 100)}<rect x="132" y="262" width="22" height="24" fill="#3A2C22"/><circle cx="172" cy="248" r="14" fill="none" stroke="#6A7480" stroke-width="3"/><path d="M104 252 L156 232 L208 252z" fill="${C.red}"/>`,
      `<rect x="110" y="250" width="92" height="36"/><path d="M104 252 L156 232 L208 252z"/>`) + (w ? `<path d="M104 251 L156 231 L208 251 Q156 238 104 251z" fill="${C.snow}"/>` : "") + sign(158, 270, 30, "LIFT", 7));
  const lft = place("hklift", 150, 300, 28, 9, "The ski lift and the slope", slope + lift, w ? "Ski lift" : "The lift", 150, 320, "#BFE0DA");
  // the viewing deck for Yotei: boards, a bench, a coin telescope and a sign
  const deck = NP(sk(`<rect x="254" y="158" width="72" height="36" fill="${C.timber}"/>${Array.from({length: 8}, (_, k) => `<path d="M${258 + k*9} 158 v36" stroke="${C.timber2}" stroke-width=".8"/>`).join("")}<rect x="264" y="166" width="44" height="6" fill="${C.wood}"/><rect x="264" y="160" width="44" height="4" fill="${C.wood}"/><path d="M268 172 v8 M304 172 v8" stroke="${C.wood2}" stroke-width="2"/><path d="M318 186 v-16" stroke="#4E6A7A" stroke-width="2"/><rect x="312" y="162" width="12" height="8" rx="2" fill="#4E6A7A"/>`, `<rect x="254" y="158" width="72" height="36"/>`)
    + (w ? `<path d="M264 160 h44 v3 h-44z" fill="${C.snow}"/>` : "") + sign(290, 150, 46, "羊蹄山", 8));
  const yoteiPl = place("hkyotei", 290, 206, 26, 9, "The view of Mount Yotei", deck, "Mount Yotei", 380, 196, "#BFE0DA");
  // the ski lodge: honey timber, a steep roof heavy with snow in winter, a stone chimney, big warm windows, a
  // balcony, a rack of skis by the door
  const lodgeArt = NP(sk(`<rect x="340" y="290" width="172" height="94" fill="${C.timber}"/>${courses(340, 290, 172, 94, C.timber2, 7, .55, 200)}<rect x="356" y="306" width="40" height="30" fill="#F4C66A"/><rect x="456" y="306" width="40" height="30" fill="#F4C66A"/><path d="M376 306 v30 M356 321 h40 M476 306 v30 M456 321 h40" stroke="${C.wood2}" stroke-width="1.2"/>
    <rect x="404" y="342" width="32" height="42" fill="#5A3A24"/><rect x="408" y="346" width="24" height="38" fill="#E8A64A"/><path d="M340 340 H512" stroke="${C.wood2}" stroke-width="3"/><path d="${Array.from({length: 18}, (_, k) => `M${344 + k*9.4} 340 v-10`).join(" ")} M340 330 H512" stroke="${C.wood2}" stroke-width="1.4"/>`,
    `<rect x="340" y="290" width="172" height="94"/><rect x="404" y="342" width="32" height="42"/>`)
    + sk(`<path d="M326 296 L426 226 L526 296 L516 300 L426 238 L336 300z" fill="#8A3A2E"/><path d="M336 300 L426 238 L516 300z" fill="${C.timber}"/><path d="M412 270 h28 v20 h-28z" fill="#F4C66A"/><path d="M426 270 v20 M412 280 h28" stroke="${C.wood2}" stroke-width="1"/>`, `<path d="M326 296 L426 226 L526 296"/>`)
    + (w ? `<path d="M324 296 L426 222 L528 296 L520 298 Q470 262 426 236 Q380 262 332 298z" fill="${C.snow}" stroke="${C.snow3}" stroke-width=".8"/>${Array.from({length: 10}, (_, k) => `<path d="M${346 + k*16} ${300 - Math.abs(k - 4.5)*0} l1.6 ${6 + rnd(k)*6} l1.6 ${-6 - rnd(k)*6}z" fill="#E6F1F8"/>`).join("")}` : "")
    + sk(`<rect x="466" y="226" width="18" height="50" fill="${C.stone}"/>${courses(466, 226, 18, 50, C.stone3, 8, .6, 18)}`, `<rect x="466" y="226" width="18" height="50"/>`) + (w ? `<path d="M464 226 q11 -7 22 0z" fill="${C.snow}"/>` : "")
    + sk(`<path d="M446 384 V350 M470 384 V350 M444 356 h28" stroke="${C.wood2}" stroke-width="2.4"/>${["#E0403A", "#3E8FC0", "#F2C230", "#2E2E2E", "#6FB06A"].map((c, k) => `<path d="M${448 + k*5} 384 V346" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`).join("")}`, "")
    + `<rect x="352" y="250" width="48" height="16" rx="2" fill="#5A3A24" stroke="var(--line)" stroke-width=".8"/><text x="376" y="261.4" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7.6" fill="#F4E6C8">LODGE</text>`) + smoke(475, 220, 1);
  const lodge = place("hklodge", 420, 396, 28, 9, "The ski lodge", lodgeArt, "Ski lodge", 420, 416, "#F2C9B4");
  // the birch grove
  const grove = place("hkbirch", 118, 410, 26, 9, "The birch grove", birch(24, 360, 1.05, 0) + birch(66, 336, .95, 1) + birch(46, 412, 1.1, 2) + birch(88, 380, .85, 3) + birch(18, 470, 1, 4) + birch(76, 466, .9, 5)
    + sasa(40, 476, .9) + oldSnow([[50, 440, 30]]), "Birch grove", 118, 430, "#F6E3B4");
  // the sledging hill: a smooth white mound with tracks and bright sledges in winter, a soft green slope in summer
  const hillCol = {winter: "#FAFCFE", spring: "#ABB57E", sakura: "#A1C870", summer: "#8DBF59", autumn: "#C7B266"}[se];
  const sled = (x, y, c) => `<path d="M${x - 9} ${y} h16 q4 0 4 -4 v-2 h-20z" fill="${c}" stroke="var(--line)" stroke-width=".6"/><path d="M${x + 11} ${y - 6} q4 -4 0 -6" stroke="${c}" stroke-width="1.4" fill="none"/>`;
  const sledArt = NP(`<path d="M-10 640 V540 Q60 500 150 520 Q206 540 222 640z" fill="${hillCol}"/>` + sk("", `<path d="M-10 540 Q60 500 150 520 Q206 540 222 640"/>`)
    + (w ? `<path d="M40 512 Q90 560 170 600 M60 510 Q110 556 190 596" stroke="#C6D4E2" stroke-width="1.4" fill="none"/>` + sled(186, 520, "#E0403A") + sled(206, 528, "#3E8FC0") + sled(176, 534, "#F2C230")
      + `<g><animateMotion path="M50 520 Q100 560 180 604" dur="5s" repeatCount="indefinite"/>${sled(0, 0, "#6FB06A")}</g>`
      : `<g opacity=".8">${Array.from({length: 12}, (_, k) => `<circle cx="${f1(20 + rnd(k + 40)*180)}" cy="${f1(540 + rnd(k*3 + 40)*80)}" r="1.6" fill="${se === "autumn" ? "#E8A040" : ["#F2D35E", "#FFFFFF", "#F08AA0"][k % 3]}"/>`).join("")}</g>`)) + spruce(22, 560, .7);
  const sledPl = place("hksled", 150, 490, 26, 9, "The little sledging hill", sledArt, w ? "Sledging hill" : "Grassy hill", 80, 600, "#F6E3B4");
  // the paths: up from the canal road, across to the field road, to the lodge, the lift and the deck
  const paths = path("M260 650 Q262 520 262 440 Q300 460 530 470 M262 440 Q300 400 420 396 M262 440 Q200 360 150 300 M262 440 Q280 300 290 206", 34);
  // the corner trees: maples (red in autumn), a cherry, birches and a spruce
  const corner = maple(360, 590, 1.15, 1) + cherry(440, 600, 1.05, 5) + birch(500, 560, 1, 6) + maple(504, 636, .9, 2) + spruce(340, 640, .8) + birch(388, 640, .8, 7);
  const bits = tufts([[220, 330], [320, 420], [200, 560], [300, 520], [380, 460]]) + wildflowers([[230, 360], [330, 440], [210, 540], [300, 500], [180, 340], [360, 500]]) + oldSnow([[300, 300, 24], [210, 580, 28], [480, 470, 22]]);
  return base + sky + paths + lft + yoteiPl + lodge + grove + sledPl + corner + bits + light()
    + gate("hkToMarketS", 260, 612, "Morning market", 180, 618, "South over the canal bridge to the market", "#BFE0DA")
    + gate("hkToFlowers", 500, 470, "Flower farm", 448, 506, "East across the fields to the flower farm", "#F2C9B4");
}

/* ---------- hk_flowers: the flower farm ---------- */
function flowersScreen(){
  const w = winter(), se = SEA(), [gr, gr2] = grassCols();
  const base = ground(gr, [[260, 400, 200, 110, gr2], [120, 500, 100, 50, gr2]]);
  // the sky and the far mountains (the Tokachi range), snowy-topped
  const sky = NP(`<rect width="520" height="80" fill="${w ? "#DCE6EF" : "#CFE4EF"}"/><path d="M0 70 L40 40 L70 52 L110 26 L150 48 L190 34 L240 56 L290 30 L330 50 L380 24 L430 46 L470 34 L520 50 V90 H0z" fill="${w ? "#B9C9DA" : "#8FA4B6"}"/><path d="M100 30 L110 26 L122 33 L114 36z M282 34 L290 30 L300 36 L291 38z M370 28 L380 24 L392 31 L382 33z" fill="#FAFCFE"/>`);
  // the stripes: long bands following the hill's curve; poppies, lupins, salvia, marigolds, cosmos and baby's breath in
  // summer; tilled earth and green rows in spring; harvested with the last cosmos in autumn; a smooth snowfield in winter
  const hillTop = y0 => [[-10, y0 + 10], [80, y0 - 4], [170, y0 - 10], [260, y0 - 4], [350, y0 + 8], [420, y0 + 22]];
  const bandCols = stripes() ? ["#D93A32", "#8A5AC0", "#3E6AC0", "#F2902A", "#F08AB8", "#FAF6F0", "#D93A32", "#8A5AC0"]
    : se === "autumn" ? ["#B88A4A", "#9C7A40", "#F08AB8", "#B88A4A", "#C8A060", "#9C7A40", "#F2902A", "#B88A4A"]
    : se === "winter" ? Array(8).fill(C.snow) : ["#8E6E4E", "#7DAA4E", "#8E6E4E", "#7DAA4E", "#8E6E4E", "#7DAA4E", "#8E6E4E", "#7DAA4E"];
  const bandY = [74, 96, 118, 140, 162, 184, 206, 228];
  const band = (k) => { const top = hillTop(bandY[k]), bot = hillTop(bandY[k] + 24).reverse();
    return `<path d="${smooth(top)} L${f1(bot[0][0])} ${f1(bot[0][1])}${segs(bot)}z" fill="${bandCols[k]}"/>`; };
  const texture = stripes() ? `<g opacity=".55">${Array.from({length: 140}, (_, k) => { const b = k % 8, x = rnd(k*1.7)*340 - 6, yy = bandY[b] + 4 + rnd(k*2.9)*16 + (Math.cos((x + 10)/120)*-6); return `<circle cx="${f1(x)}" cy="${f1(yy)}" r="${f1(1.2 + rnd(k)*1.2)}" fill="${b === 5 ? "#FFFFFF" : "#FFF3E0"}" opacity="${b === 5 ? .9 : .45}"/>`; }).join("")}</g>`
    : w ? `<g stroke="${C.snow3}" stroke-width="1" fill="none" opacity=".6">${bandY.map(y => `<path d="${smooth(hillTop(y + 12))}"/>`).join("")}</g>`
    : `<g stroke="#5E4A34" stroke-width=".8" fill="none" opacity=".35">${bandY.map(y => `<path d="${smooth(hillTop(y + 8))}"/><path d="${smooth(hillTop(y + 16))}"/>`).join("")}</g>`;
  const far = NP(`<path d="M-10 90 Q200 60 530 84 V270 H-10z" fill="${w ? C.snow2 : gr2}"/>`);
  const hill = NP(`<path d="${smooth(hillTop(64))} L${hillTop(256).reverse().map(([x, y]) => `${f1(x)} ${f1(y)}`).join(" L")}z" fill="${w ? C.snow : gr2}"/>${bandCols.map((_, k) => band(k)).join("")}${texture}<path d="${smooth(hillTop(64))}" stroke="${w ? C.snow3 : "#5E7A3A"}" stroke-width="1.6" fill="none"/>`)
    + [[30, 70], [60, 64], [90, 60], [250, 60], [280, 64]].map(([x, y], k) => k % 2 ? birch(x, y, .45, k) : spruce(x, y, .4)).join("")
    + (w ? crane(150, 210, .8, 1, true, 3) + crane(186, 214, .8, -1, true, 4) : "");
  // a little red barn on the far ridge
  const barn = NP(sk(`<rect x="196" y="40" width="34" height="20" fill="#B8402E"/><path d="M192 42 L213 28 L234 42z" fill="#5A5E66"/><rect x="208" y="48" width="10" height="12" fill="#F1EADB"/>`, `<rect x="196" y="40" width="34" height="20"/><path d="M192 42 L213 28 L234 42"/>`) + (w ? `<path d="M192 42 L213 27 L234 42 Q213 34 192 42z" fill="${C.snow}"/>` : ""));
  const stripesPl = place("hkstripes", 190, 268, 30, 9, w ? "The snowfield, where the stripes bloom in summer" : "The rainbow flower stripes", hill, w ? "The snowfield" : stripes() ? "Flower stripes" : "The stripe fields", 190, 288, "#F2C9B4");
  // the flower hill: a soft grassy dome (the rest of the screen's ground), a mown path up it, and the little bell on
  // its post at the top
  const flowerHill = NP(`<path d="M300 272 Q318 150 380 116 Q440 90 530 96 V272z" fill="${w ? C.snow : gr}"/>` + sk("", `<path d="M300 272 Q318 150 380 116 Q440 90 530 96"/>`)
    + `<path d="M430 270 Q420 210 440 170 Q446 150 440 134" stroke="${w ? "#DCE5EE" : gr2}" stroke-width="14" fill="none" stroke-linecap="round"/>`
    + (w || se === "spring" ? "" : `<g opacity=".85">${Array.from({length: 26}, (_, k) => `<circle cx="${f1(350 + rnd(k + 70)*160)}" cy="${f1(130 + rnd(k*3 + 70)*120)}" r="1.6" fill="${se === "autumn" ? "#E8A040" : ["#F2D35E", "#FFFFFF", "#F08AA0", "#B48AD8"][k % 4]}"/>`).join("")}</g>`));
  const hillPl = place("hkhill", 430, 280, 28, 9, "The flower hill", flowerHill + cherry(508, 250, .8, 6) + oldSnow([[380, 230, 26]]), "Flower hill", 470, 300, "#F6E3B4");
  const bellArt = NP(sk(`<path d="M456 126 V96 M474 126 V96 M452 96 h26" stroke="${C.wood}" stroke-width="4" fill="none"/><path d="M450 94 L465 86 L480 94z" fill="${C.red}"/>`, `<path d="M456 126 V96 M474 126 V96 M450 94 L465 86 L480 94z"/>`)
    + `<g>${swing(465, 98, 10, 2.6)}<path d="M465 98 v3" stroke="${C.iron}" stroke-width="1"/><path d="M459 112 Q459 101 465 101 Q471 101 471 112z" fill="#D8A84A" stroke="var(--line)" stroke-width=".7"/><circle cx="465" cy="113" r="1.4" fill="#8A6A2A"/><path d="M465 113 v10" stroke="#C83A2E" stroke-width="1.4"/></g>`
    + (w ? `<path d="M449 94 L465 85 L481 94 Q465 89 449 94z" fill="${C.snow}"/>` : ""));
  const bell = place("hkbell", 438, 134, 22, 8, "The little bell at the top of the hill", bellArt, "Hilltop bell", 470, 72, "#F6E3B4");
  // the farm café: white boards, a red roof, a big window of jars and dried flowers, a soft-serve cone sign, a bench
  // and window boxes of flowers
  const cafeArt = NP(sk(`<rect x="10" y="330" width="156" height="92" fill="#F7F3EA"/>${Array.from({length: 13}, (_, k) => `<path d="M10 ${336 + k*7} h156" stroke="#DCD4C4" stroke-width=".7"/>`).join("")}<rect x="22" y="352" width="44" height="34" fill="#BFE0EA"/><rect x="120" y="352" width="36" height="34" fill="#BFE0EA"/><rect x="78" y="380" width="28" height="42" fill="#8A5A3A"/><rect x="82" y="384" width="20" height="18" fill="#BFE0EA"/>`,
    `<rect x="10" y="330" width="156" height="92"/><rect x="78" y="380" width="28" height="42"/>`)
    + `${[[30, 372, "#E8A040"], [40, 368, "#B070C0"], [50, 374, "#F08AB8"], [58, 370, "#E0603A"]].map(([x, y, c]) => `<rect x="${x - 3}" y="${y}" width="6" height="10" fill="${c}" opacity=".85"/>`).join("")}<path d="M126 362 q6 -8 12 0 q6 -8 12 0" stroke="#8A6A3A" stroke-width="1" fill="none"/>`
    + sk(`<path d="M0 334 L88 286 L176 334 L168 338 L88 296 L8 338z" fill="#C8402E"/><path d="M8 338 L88 296 L168 338z" fill="#F7F3EA"/><circle cx="88" cy="318" r="8" fill="#BFE0EA"/>`, `<path d="M0 334 L88 286 L176 334"/>`)
    + (w ? `<path d="M-2 334 L88 282 L178 334 L170 336 Q120 304 88 294 Q50 304 6 336z" fill="${C.snow}" stroke="${C.snow3}" stroke-width=".8"/>` : "")
    + sk(`<rect x="20" y="386" width="48" height="6" fill="${C.wood}"/><rect x="118" y="386" width="40" height="6" fill="${C.wood}"/>`, "")
    + (w ? "" : [24, 32, 40, 48, 56, 64, 122, 130, 138, 146, 154].map((x, k) => `<circle cx="${x}" cy="384" r="2.6" fill="${["#D93A32", "#8A5AC0", "#F2902A", "#F08AB8"][k % 4]}"/>`).join(""))
    + `<rect x="58" y="304" width="60" height="16" rx="2" fill="#FFFDF6" stroke="var(--line)" stroke-width=".8"/><text x="88" y="315.4" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7.6" fill="${C.red}">FARM CAFÉ</text>`
    + sk(`<path d="M142 422 v-24" stroke="${C.wood2}" stroke-width="2"/><path d="M134 380 l8 18 l8 -18z" fill="#E8B060"/><path d="M134 380 q0 -12 8 -14 q8 2 8 14z" fill="#FBF6EC"/>`, `<path d="M134 380 l8 18 l8 -18z M134 380 q0 -12 8 -14 q8 2 8 14z"/>`));
  const cafe = place("hkcafe", 92, 434, 28, 9, "The farm café and shop", cafeArt, "Farm café", 92, 454, "#F2C9B4");
  // the crane meadow and pond: reeds, the pond (frozen at the edges in winter), cranes standing in the shallows in
  // summer; in winter a snowfield where the pairs dance, bowing and leaping with their wings open
  const pondD = "M330 560 Q340 520 400 520 Q470 516 510 540 Q530 580 500 610 Q440 640 380 626 Q330 610 330 560z";
  const meadowCol = w ? C.snow : {spring: "#9AA470", sakura: "#8EB65E", summer: "#7EAE4E", autumn: "#BCA05A"}[se];
  const reeds = pts => NP(pts.map(([x, y], k) => `<g>${swing(x, y, 3, 3 + k % 3, -k)}<path d="M${x} ${y} q-2 -14 -1 -24 M${x + 3} ${y} q2 -12 4 -20 M${x - 3} ${y} q-3 -10 -6 -16" stroke="${w ? "#B8A880" : se === "autumn" ? "#B89A5A" : "#6E9A48"}" stroke-width="1.3" fill="none"/><ellipse cx="${x - 1}" cy="${y - 24}" rx="1.6" ry="4" fill="#7A5A3A"/></g>`).join(""));
  const meadow = NP(`<path d="M300 466 Q400 456 520 470 V640 H300z" fill="${meadowCol}"/>` + sk("", `<path d="M300 466 Q400 456 520 470"/>`)
    + sk(`<path d="${pondD}" fill="${w ? "#B9D2E0" : "#5E9CB0"}"/>`, `<path d="${pondD}"/>`) + (w ? `<path d="M360 560 Q410 540 470 556 Q490 580 450 600 Q400 610 370 590z" fill="#7FAFC4"/>` : `<path d="M350 556 Q400 534 470 548" stroke="#9CCAD6" stroke-width="3" fill="none" opacity=".7"/>`)
    + sk(`${[310, 340, 370, 400, 430, 460, 490].map(x => `<path d="M${x} 486 v-14" stroke="${C.wood}" stroke-width="2.4"/>`).join("")}<path d="M304 476 H516" stroke="${C.wood}" stroke-width="1.6"/>`, ""))
    + reeds([[336, 540], [352, 524], [500, 530], [512, 556], [344, 610], [380, 630]])
    + (w ? crane(340, 516, .85, 1, true, 2) + crane(392, 508, 1, 1, true, 0) + crane(446, 512, 1, -1, true, 1) + crane(500, 504, .85, -1, false, 3)
      : crane(410, 560, 1, 1, false, 0) + crane(448, 572, .95, -1, false, 1) + crane(470, 500, .85, -1, false, 2));
  const cranes = place("hkcranes", 380, 452, 28, 9, "The crane meadow and the pond", meadow, w ? "Dancing cranes" : "Crane meadow", 440, 620, "#BFE0DA");
  // the bottom-left corner: two cherry trees, a fence and a cart of potted flowers
  const corner = cherry(40, 610, 1, 7) + cherry(140, 630, .9, 8) + NP(sk(`<path d="M10 560 H190" stroke="${C.wood}" stroke-width="2"/>${[14, 50, 86, 122, 158, 186].map(x => `<path d="M${x} 572 v-18" stroke="${C.wood}" stroke-width="3"/>`).join("")}`, "")
    + sk(`<rect x="92" y="568" width="40" height="14" fill="${C.timber}"/><circle cx="100" cy="584" r="5" fill="${C.wood2}"/><circle cx="126" cy="584" r="5" fill="${C.wood2}"/>`, `<rect x="92" y="568" width="40" height="14"/>`)
    + (w ? `<path d="M92 568 q20 -6 40 0z" fill="${C.snow}"/>` : [98, 108, 118, 128].map((x, k) => `<circle cx="${x}" cy="564" r="4" fill="${["#D93A32", "#8A5AC0", "#F2902A", "#F08AB8"][k]}"/>`).join("")));
  const paths = path("M-10 480 Q120 470 250 380 Q300 330 430 280 M250 380 Q240 500 240 650 M250 380 Q170 420 92 434 M250 380 Q320 430 380 452 M190 268 Q220 320 250 380", 40);
  const bits = tufts([[220, 320], [300, 340], [180, 500], [280, 450], [210, 560]]) + wildflowers([[200, 330], [320, 380], [170, 480], [290, 500], [230, 440]]) + oldSnow([[200, 500, 24], [300, 300, 20]]);
  return base + sky + far + barn + paths + stripesPl + hillPl + bell + cafe + cranes + corner + bits + light()
    + gate("hkToNisekoW", 20, 480, "Niseko", 60, 516, "West across the fields to Niseko", "#BFE0DA")
    + gate("hkToOnsenN", 240, 612, "Hot springs", 310, 620, "South down the valley lane to the hot springs", "#F6E3B4");
}

export function hokkaidoArt(scene){
  return scene === "hk_market" ? marketScreen() : scene === "hk_onsen" ? onsenScreen() : scene === "hk_niseko" ? nisekoScreen() : flowersScreen();
}
// the sight on the far shore as you sail in (a 600x90 strip; the sea starts at y 56): Mount Yotei white over the
// hills, the harbour town's warehouses and a lighthouse, and fishing boats out on the water; snowy in winter, pink with
// cherry blossom in the sakura season, gold in autumn. (Read when the module loads; hokkaidoSight() gives a fresh one
// for any day.)
export function hokkaidoSight(day = dayKey()){
  const se = hkSeason(day), hills = {winter: "#E8EEF4", spring: "#8E9A6A", sakura: "#7EA45A", summer: "#5E9A4A", autumn: "#C0903A"}[se];
  const cap = {winter: 1, spring: .7, sakura: .5, summer: .25, autumn: .45}[se];
  const boat = (x, k) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;${k % 2 ? 22 : -22} 0;0 0" dur="${30 + k*8}s" repeatCount="indefinite"/><path d="M${x - 10} 54 h20 l-3 3 h-14z" fill="#FFFDF6" stroke="#3b3530" stroke-width=".6"/><rect x="${x}" y="48" width="6" height="6" fill="#E9EEF2" stroke="#3b3530" stroke-width=".5"/><path d="M${x - 4} 54 v-10" stroke="#3b3530" stroke-width=".6"/><path d="M${x - 4} 44 h5 l-1 2 l1 2 h-5z" fill="${["#E0403A", "#F2C230", "#3E8FC0"][k % 3]}"/></g>`;
  const trees = Array.from({length: 9}, (_, k) => { const x = 250 + k*36 + rnd(k)*10; return `<ellipse cx="${f1(x)}" cy="45" rx="7" ry="5" fill="${se === "sakura" ? (k % 2 ? "#F4BCCD" : "#E9A0B7") : se === "autumn" ? (k % 2 ? "#E59A4E" : "#CB6A36") : se === "winter" ? "#F4F7FA" : "#4E8A3E"}" stroke="#3b3530" stroke-width=".5"/>`; }).join("");
  const sh = 40*cap, sw = 54*cap;
  return `<path d="M300 50 Q360 30 404 8 H420 Q466 30 540 50z" fill="${se === "winter" ? "#C6D4E2" : "#8EA2B4"}"/><path d="M${f1(412 - sw)} ${f1(8 + sh)} Q${f1(412 - sw*.4)} ${f1(4 + sh)} 404 8 H420 Q${f1(412 + sw*.4)} ${f1(4 + sh)} ${f1(412 + sw)} ${f1(8 + sh)} Q412 ${f1(14 + sh)} ${f1(412 - sw)} ${f1(8 + sh)}z" fill="#FFFFFF" stroke="none"/>`
    + `<path d="M190 56 Q230 36 300 40 Q400 34 500 40 Q560 42 600 48 V56z" fill="${hills}"/>` + trees
    + [[262, 22], [288, 18], [314, 24], [340, 20], [366, 22]].map(([x, h], k) => `<rect x="${x}" y="${56 - h}" width="22" height="${h}" fill="${k % 2 ? "#9E9586" : "#857C6E"}" stroke="#3b3530" stroke-width=".5"/><path d="M${x - 2} ${56 - h} l13 -7 l13 7z" fill="${se === "winter" ? "#F4F7FA" : "#4C525B"}" stroke="#3b3530" stroke-width=".5"/>`).join("")
    + `<rect x="230" y="30" width="7" height="26" fill="#FFFDF6" stroke="#3b3530" stroke-width=".6"/><path d="M229 30 h9 l-2 -5 h-5z" fill="#C83A2E" stroke="#3b3530" stroke-width=".5"/><path d="M190 56 h230" stroke="#9E9586" stroke-width="2"/>`
    + boat(140, 0) + boat(90, 1) + boat(520, 2)
    + (se === "winter" ? `<g fill="#FFFFFF" stroke="none">${Array.from({length: 24}, (_, k) => `<circle cx="${f1(rnd(k)*600)}" cy="${f1(rnd(k*3)*52)}" r="1.1" opacity=".85"/>`).join("")}</g>` : "");
}
export const HOKKAIDO_SIGHT = hokkaidoSight();
