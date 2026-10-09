// Jeju (round 127): four screens of a volcanic island. Nothing like Ronda's white walls or Kyoto's dark timber: black
// basalt everywhere (dry-stone walls with gaps for the wind, thatched stone houses, the shore), green crater cones,
// tangerine orchards, rope-netted thatch, orange diving floats, wind and a very blue sea. Calm on purpose.
//   jj_shore:   Seongsan, the green crater by the sea; the divers' house; black rock pools; the divers out in the water
//   jj_farms:   the Olle trail (blue and orange ribbons) through tangerine orchards behind stone walls; the packing
//               shed; the pony paddock; the wish-towers
//   jj_harbour: the ferry pier, the squid boats with their lamps, the red and white horse lighthouses, the market hall
//   jj_village: thatched stone houses, the stone grandfathers (dol hareubang), the café, the dye workshop with cloth
//               drying, and the station at the bottom, where the sea bridge comes in (the station is not top left)
// Seasons: tangerines on the trees from autumn into winter (blossom in spring, green fruit in summer); rapeseed
// flowers in spring; snow in winter.
import { ink, dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampDefs, lampGlow } from "./village-extras.js";
import { seasonOf } from "../data/items.js";

const C = {soil: "#D8D0BC", soil2: "#CBC2AA", grass: "#C6D6A0", grass2: "#B2C78A", basalt: "#4A494E", basalt2: "#5F5E64", basalt3: "#7A7980",
  thatch: "#CDB57C", thatch2: "#A8915A", rope: "#8A7448", leaf: "#4E7A3A", leaf2: "#6A9A48", tang: "#F29A2E", sea: "#7FB6D6", sea2: "#A7D0E6",
  foam: "#EAF5FA", blue: "#3E7CC0", orange: "#F08A2E", wood: "#8A6A52", wood2: "#6B5444", ink: "#2F2B28", cloth: ["#C9874A", "#B26A36", "#D9A66A", "#9E5A2E"]};
const W = ink;
const ssn = () => seasonOf(dayKey());
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };

/* ---------- pieces ---------- */
const shade = (x, y, w, h, d = 12) => `<path d="M${x + w} ${y + 6} l${d} ${d*.7} V${y + h + d*.7} H${x + d} l${-d} ${-d*.7}z" style="fill:#6F7C9C" opacity=".18" pointer-events="none"/>`;
// a black dry-stone wall (batdam) along a path: lumpy stones with the light showing through the gaps
const wall = (d, w = 9) => `<g pointer-events="none" filter="url(#wob)"><path d="${d}" fill="none" style="stroke:var(--line)" stroke-width="${w + 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${C.basalt}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" style="stroke:${C.basalt3}" stroke-width="${w - 4}" stroke-dasharray="4 5" stroke-linecap="round"/><path d="${d}" fill="none" style="stroke:#E9E4D6" stroke-width="1.4" stroke-dasharray="1 13" opacity=".8"/></g>`;
// a tangerine tree: short trunk, a round dark crown and (in season) orange fruit; white blossom in spring
function tangerine(x, y, s = 1, i = 0){
  const se = ssn(), fruit = se === "autumn" || se === "winter" ? C.tang : se === "summer" ? "#9DBA5A" : "#FFFDF6";
  const dots = [[-9, -26], [6, -30], [11, -20], [-3, -18], [-12, -16], [3, -36]].map(([dx, dy], k) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${(se === "spring" ? 1.6 : 2.4)*s}" style="fill:${fruit}"/>`).join("");
  return `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 1}" rx="${14*s}" ry="${4*s}" fill="#8A9A62" opacity=".35"/>${sk(`<path d="M${x} ${y} v${-10*s}" style="stroke:#5A4636" stroke-width="${3*s}"/><ellipse cx="${x}" cy="${y - 24*s}" rx="${17*s}" ry="${15*s}" style="fill:${i % 2 ? C.leaf : C.leaf2}"/>${dots}`,
    `<ellipse cx="${x}" cy="${y - 24*s}" rx="${17*s}" ry="${15*s}"/>`)}</g>`;
}
// a thatched stone house (choga): black stone walls, a fat thatched roof tied down with a rope net against the wind
function choga(x, y, w, h, o = {}){
  const roofH = h*.75, rx = x - 8, rw = w + 16;
  const net = Array.from({length: Math.floor(rw/12)}, (_, i) => `<path d="M${rx + 6 + i*12} ${y - roofH + 6} q-2 ${roofH*.5} 0 ${roofH - 4}" style="stroke:${C.rope}" stroke-width="1"/>`).join("")
    + [.3, .6].map(f => `<path d="M${rx + 4} ${y - roofH + roofH*f + 4} q${rw/2 - 4} -4 ${rw - 8} 0" style="fill:none;stroke:${C.rope}" stroke-width="1"/>`).join("");
  const stones = Array.from({length: Math.floor(w*h/260)}, (_, i) => `<ellipse cx="${x + 6 + rnd(i + x)*(w - 12)}" cy="${y + 6 + rnd(i + y)*(h - 12)}" rx="${4 + rnd(i*3)*3}" ry="${3 + rnd(i*5)*2}" style="fill:${C.basalt3}" opacity=".7"/>`).join("");
  const dx = o.doorX || w/2;
  return shade(x, y, w, h) + sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${C.basalt2}"/>${stones}
    <rect x="${x + dx - 12}" y="${y + h - 34}" width="24" height="34" rx="2" style="fill:${o.door || C.wood}"/>${o.win !== false ? `<rect x="${x + (dx > w/2 ? 14 : w - 38)}" y="${y + 12}" width="22" height="16" rx="2" style="fill:#F3E7C8"/>` : ""}
    <path d="M${rx} ${y + 4} q2 ${-roofH} ${rw/2} ${-roofH} q${rw/2 - 2} 0 ${rw/2} ${roofH}z" style="fill:${C.thatch}"/>${net}`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><rect x="${x + dx - 12}" y="${y + h - 34}" width="24" height="34" rx="2"/><path d="M${rx} ${y + 4} q2 ${-roofH} ${rw/2} ${-roofH} q${rw/2 - 2} 0 ${rw/2} ${roofH}z"/>`)
    + (o.sign ? `<rect x="${x + dx - 26}" y="${y + 8}" width="52" height="13" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x + dx}" y="${y + 18}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${o.signCol || C.ink}" pointer-events="none">${o.sign}</text>` : "");
}
// a stone grandfather (dol hareubang): a hat, big round eyes, a long nose, hands on his tummy
const hareubang = (x, y, s = 1) => `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 1}" rx="${12*s}" ry="${4*s}" fill="#6F7C9C" opacity=".22"/>${sk(`<path d="M${x - 10*s} ${y} q-2 ${-22*s} ${2*s} ${-30*s} h${16*s} q${4*s} ${8*s} ${2*s} ${30*s}z" style="fill:${C.basalt2}"/>
  <ellipse cx="${x}" cy="${y - 38*s}" rx="${10*s}" ry="${11*s}" style="fill:${C.basalt2}"/><path d="M${x - 11*s} ${y - 44*s} q${11*s} ${-16*s} ${22*s} 0z" style="fill:${C.basalt}"/>
  <circle cx="${x - 4*s}" cy="${y - 40*s}" r="${2.6*s}" style="fill:${C.basalt3}"/><circle cx="${x + 4*s}" cy="${y - 40*s}" r="${2.6*s}" style="fill:${C.basalt3}"/><path d="M${x} ${y - 38*s} v${7*s}" style="stroke:${C.basalt}" stroke-width="${2.4*s}"/>
  <path d="M${x - 8*s} ${y - 18*s} q${8*s} ${-5*s} ${16*s} 0 M${x - 6*s} ${y - 12*s} q${6*s} ${-4*s} ${12*s} 0" style="fill:none;stroke:${C.basalt}" stroke-width="${2*s}"/>`,
  `<path d="M${x - 10*s} ${y} q-2 ${-22*s} ${2*s} ${-30*s} h${16*s} q${4*s} ${8*s} ${2*s} ${30*s}z"/><ellipse cx="${x}" cy="${y - 38*s}" rx="${10*s}" ry="${11*s}"/><path d="M${x - 11*s} ${y - 44*s} q${11*s} ${-16*s} ${22*s} 0z"/>`)}</g>`;
// a Jeju pony grazing
const pony = (x, y, col, dir = 1, i = 0) => `<g pointer-events="none" transform="translate(${x} ${y}) scale(${dir} 1)"><ellipse cx="0" cy="1" rx="16" ry="3.5" fill="#6F7C9C" opacity=".2"/>${sk(`<path d="M-12 -6 v6 M-6 -6 v6 M6 -6 v6 M12 -6 v6" style="stroke:${C.wood2}" stroke-width="2.6"/><ellipse cx="0" cy="-12" rx="15" ry="8" style="fill:${col}"/>
  <path d="M12 -16 q8 -2 10 ${i % 2 ? 6 : 12} l4 2 q2 -4 -2 -6 q-4 -10 -12 -8z" style="fill:${col}"/><path d="M12 -18 q4 -6 10 -2" style="fill:none;stroke:#3A3430" stroke-width="2.4"/><path d="M-15 -12 q-6 2 -5 10" style="fill:none;stroke:#3A3430" stroke-width="2.4"/>`,
  `<ellipse cx="0" cy="-12" rx="15" ry="8"/>`)}</g>`;
// a little wish-tower: black stones piled up, smallest on top
const cairn = (x, y, n = 5, s = 1) => `<g pointer-events="none">${sk(Array.from({length: n}, (_, k) => `<ellipse cx="${x + (k % 2 ? 1 : -1)*s}" cy="${y - 3*s - k*5.4*s}" rx="${(8 - k*.9)*s}" ry="${3.4*s}" style="fill:${k % 2 ? C.basalt2 : C.basalt3}"/>`).join(""), `<ellipse cx="${x}" cy="${y - 3*s}" rx="${8*s}" ry="${3.4*s}"/>`)}</g>`;
// an Olle trail marker: a post with a blue ribbon and an orange one (follow the ribbons)
const olle = (x, y) => `<g pointer-events="none">${sk(`<rect x="${x - 2}" y="${y - 26}" width="4" height="26" style="fill:${C.wood}"/><path d="M${x + 2} ${y - 24} q8 2 9 12 q-5 -4 -9 -6z" style="fill:${C.blue}"/><path d="M${x + 2} ${y - 18} q10 4 8 14 q-4 -6 -8 -8z" style="fill:${C.orange}"/>`, `<rect x="${x - 2}" y="${y - 26}" width="4" height="26"/>`)}</g>`;
// an orange diving float (tewak), bobbing; a diver's head pops up beside it now and then
const tewak = (x, y, i) => `<g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0" dur="${2.6 + i*.4}s" repeatCount="indefinite"/>
  <ellipse cx="${x}" cy="${y + 4}" rx="10" ry="2.4" fill="${C.foam}" opacity=".8"/><circle cx="${x}" cy="${y}" r="6" style="fill:${C.orange};stroke:var(--line)" stroke-width="1"/><path d="M${x - 6} ${y} h12" style="stroke:#3A3430" stroke-width=".6"/>
  <g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.55;.6;.85;.9" dur="${9 + i*3}s" begin="${-i*2}s" repeatCount="indefinite"/><circle cx="${x + 12}" cy="${y - 1}" r="4.4" style="fill:#2F2B28;stroke:var(--line)" stroke-width=".8"/><rect x="${x + 9}" y="${y - 3}" width="6" height="3" rx="1" style="fill:#9FD3E8"/></g></g></g>`;
// wavelets on the sea
const waves = (pts) => `<g pointer-events="none" style="stroke:${C.foam}" stroke-width="1.4" fill="none" opacity=".9">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
// black rocks along a shoreline
const rocks = pts => `<g pointer-events="none">${sk(pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.6}" style="fill:${C.basalt}"/><ellipse cx="${x - r*.3}" cy="${y - r*.2}" rx="${r*.4}" ry="${r*.2}" style="fill:${C.basalt3}"/>`).join(""), pts.slice(0, 6).map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.6}"/>`).join(""))}</g>`;
// gulls drifting over the sea
const gulls = (pts) => `<g pointer-events="none" fill="none" style="stroke:#3A3430" stroke-width="1.2">${pts.map(([x, y], i) => `<path d="M${x - 6} ${y} q3 -4 6 0 q3 -4 6 0"><animateTransform attributeName="transform" type="translate" values="0 0;${18 + i*6} ${-4 + i*2};0 0" dur="${12 + i*3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
// spring rapeseed flowers: little yellow drifts by the walls
const canola = pts => ssn() !== "spring" ? "" : `<g pointer-events="none">${pts.map(([x, y]) => Array.from({length: 7}, (_, k) => `<circle cx="${x + (k*7) % 26 - 13}" cy="${y + (k*5) % 10 - 5}" r="2.4" fill="#F5D33A"/>`).join("")).join("")}</g>`;
function seasonFx(){
  if (ssn() === "winter") return `<g pointer-events="none">${Array.from({length: 14}, (_, i) => `<circle r="1.8" fill="#FFFFFF" opacity=".9"><animateMotion dur="${10 + (i % 5)}s" begin="${-i*1.3}s" repeatCount="indefinite" path="M${20 + i*36} -10 q-12 330 8 660"/></circle>`).join("")}</g>`;
  return "";
}
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 16}" y="${y - 24}" width="12" height="32" rx="3" style="fill:${C.basalt2}"/><rect x="${x + 4}" y="${y - 24}" width="12" height="32" rx="3" style="fill:${C.basalt2}"/><path d="M${x - 16} ${y - 18} h32 M${x - 16} ${y - 8} h32" style="stroke:${C.wood}" stroke-width="2.4"/>`,
    `<rect x="${x - 16}" y="${y - 24}" width="12" height="32" rx="3"/><rect x="${x + 4}" y="${y - 24}" width="12" height="32" rx="3"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
const path = (d, w = 26) => `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:${C.soil2}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:#E6DFCC" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round"/></g>`;

/* ---------- jj_shore: Seongsan, the divers' house, the rock pools ---------- */
function shoreScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.grass}"/><g filter="url(#wash)" opacity=".6"><ellipse cx="380" cy="420" rx="150" ry="120" style="fill:${C.grass2}"/><ellipse cx="300" cy="590" rx="140" ry="50" style="fill:${C.soil}"/></g>`;
  // the sea along the top and down the west side
  const sea = `<g pointer-events="none">${sk(`<path d="M0 0 H520 V70 Q470 92 430 70 Q380 50 300 64 Q270 120 250 210 Q160 250 70 230 Q50 300 64 380 Q40 470 56 640 H0z" style="fill:${C.sea}"/>`, `<path d="M520 70 Q470 92 430 70 Q380 50 300 64 Q270 120 250 210 Q160 250 70 230 Q50 300 64 380 Q40 470 56 640"/>`)}
    ${waves([[340, 20], [450, 40], [20, 300], [16, 520], [380, 30], [24, 420]])}</g>
    ${rocks([[296, 70, 10], [330, 60, 8], [430, 74, 9], [480, 80, 7], [64, 240, 9], [58, 330, 10], [66, 420, 8], [52, 520, 9], [262, 206, 9], [210, 232, 8], [120, 238, 10]])}`;
  // Seongsan: a great green crater rising out of the sea, rocky skirts, grass up to the rim, the bowl inside
  const cone = place("jjcone", 150, 222, 40, 12, "Seongsan, the sunrise peak", sk(`<path d="M24 210 Q30 120 70 70 Q120 22 190 40 Q250 70 258 140 Q262 190 244 214 Q140 236 24 210z" style="fill:${C.basalt2}"/>
      <path d="M38 196 Q44 120 84 78 Q128 40 186 54 Q236 80 242 140 Q244 182 232 200 Q140 218 38 196z" style="fill:#8FB46A"/>
      <ellipse cx="140" cy="102" rx="70" ry="30" style="fill:#7FA35A"/><ellipse cx="140" cy="106" rx="56" ry="20" style="fill:#9DBF72"/>
      ${[[70, 160], [96, 180], [200, 170], [220, 150], [60, 130], [170, 190]].map(([x, y]) => `<path d="M${x} ${y} q4 -16 2 -26" style="fill:none;stroke:#6E9A44" stroke-width="2"/>`).join("")}
      ${[[44, 200], [240, 204], [30, 180]].map(([x, y]) => `<path d="M${x} ${y} l8 -18 l8 18z" style="fill:${C.basalt}"/>`).join("")}`,
      `<path d="M24 210 Q30 120 70 70 Q120 22 190 40 Q250 70 258 140 Q262 190 244 214"/><ellipse cx="140" cy="102" rx="70" ry="30"/>`), "Sunrise peak", 150, 246, "#DCEBC8");
  // a sun just over the sea behind the crater in the early morning (the sunrise peak!)
  const sun = `<g pointer-events="none" opacity=".85"><circle cx="300" cy="28" r="14" fill="#F6C26B"/><circle cx="300" cy="28" r="22" fill="#F6C26B" opacity=".25"/></g>`;
  // the divers' house: thatch, stone, a line of wetsuits drying, orange floats stacked by the door
  const house = `<g data-place="jjhaenyeo" aria-label="The divers' house"><ellipse class="hov" cx="404" cy="184" rx="44" ry="10" style="fill:var(--butter)"/>${choga(340, 110, 132, 70, {doorX: 64, sign: "해녀 DIVERS", door: "#5E7A8A"})}
    ${sk(`<path d="M478 146 h34" style="stroke:#3A3430" stroke-width="1"/><path d="M482 146 v22 h8 v-22 M496 146 v22 h8 v-22" style="fill:#2F2B28"/>${[[352, 182], [364, 186], [358, 174]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" style="fill:${C.orange}"/>`).join("")}`, `<path d="M478 146 h34"/>`)}
    ${lab(404, 206, "Divers' house", "#C3DDF3", 10)}</g>`;
  // the rock pools: a black rock shelf full of little pools
  const pools = place("jjpools", 200, 466, 26, 10, "The rock pools", sk(`<path d="M30 400 Q80 372 150 386 Q196 396 196 440 Q200 500 140 518 Q70 530 36 500 Q16 460 30 400z" style="fill:${C.basalt}"/>
      ${[[70, 420, 18, 8], [128, 410, 14, 6], [100, 462, 22, 9], [150, 478, 12, 5], [62, 490, 12, 5]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:${C.sea2}"/>`).join("")}
      ${[[96, 458], [140, 410]].map(([x, y]) => `<path d="M${x} ${y} q3 -5 6 0" style="fill:none;stroke:#5E8A3A" stroke-width="1.6"/>`).join("")}<circle cx="74" cy="420" r="2.4" style="fill:#C8643B"/><circle cx="150" cy="478" r="2" style="fill:#E8B13A"/>`,
      `<path d="M30 400 Q80 372 150 386 Q196 396 196 440 Q200 500 140 518 Q70 530 36 500 Q16 460 30 400z"/>`), "Rock pools", 120, 540, "#C3DDF3");
  const trail = path("M504 330 Q380 320 300 300 Q260 300 250 330 Q240 420 300 520 L300 616 M250 330 Q220 400 200 450");
  const bits = olle(470, 300) + olle(310, 560) + wall("M300 250 Q360 240 420 262 Q470 270 506 262") + wall("M340 400 Q380 380 440 392 Q480 400 506 396") + canola([[380, 380], [460, 380], [340, 240]]);
  const floats = [tewak(360, 30, 0), tewak(410, 44, 1), tewak(470, 26, 2), tewak(26, 330, 3)].join("");
  return lampDefs + ground + sea + sun + floats + gulls([[200, 30], [460, 120], [30, 200]]) + trail + bits + cone + pools + house + seasonFx()
    + gate("jjToFarms", 504, 330, "Tangerine farms", 456, 362, "East along the Olle trail to the tangerine farms")
    + gate("jjToHarbour", 300, 612, "Harbour", 362, 600, "South along the coast to the harbour", "#C3DDF3");
}

/* ---------- jj_farms: the Olle trail, the orchards, the packing shed, the ponies, the wish-towers ---------- */
function farmsScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.soil}"/><g filter="url(#wash)" opacity=".7"><ellipse cx="140" cy="160" rx="140" ry="120" style="fill:${C.grass}"/><ellipse cx="420" cy="500" rx="110" ry="90" style="fill:${C.grass}"/><ellipse cx="200" cy="560" rx="120" ry="60" style="fill:${C.grass2}"/></g>`;
  const trail = path("M16 330 Q140 330 262 320 Q300 318 300 260 Q300 220 396 200 M262 320 Q250 460 262 616 M262 420 Q330 420 396 420");
  // the orchard: two walled fields of tangerine trees, each behind its own black stone wall
  const field1 = wall("M24 60 H250 V150 H24z"), field2 = wall("M24 170 H250 V266 H24z");
  const trees1 = [[50, 100], [94, 98], [138, 102], [182, 98], [226, 100], [60, 140], [106, 142], [152, 138], [198, 142]].map(([x, y], i) => tangerine(x, y, .82, i)).join("");
  const trees2 = [[50, 210], [94, 208], [138, 212], [182, 208], [226, 210], [62, 254], [108, 252], [154, 256], [200, 252]].map(([x, y], i) => tangerine(x, y, .82, i + 1)).join("");
  const orchard = `<g data-place="jjorchard" aria-label="The tangerine orchards"><ellipse class="hov" cx="150" cy="288" rx="40" ry="10" style="fill:var(--butter)"/>${lab(200, 300, "Tangerine orchards", "#FBE0B8", 10)}</g>`;
  // the packing shed: a blue tin roof, crates of tangerines stacked outside
  const shed = `<g data-place="jjshed" aria-label="The packing shed"><ellipse class="hov" cx="396" cy="182" rx="44" ry="10" style="fill:var(--butter)"/>${shade(330, 96, 140, 80)}
    ${sk(`<rect x="330" y="96" width="140" height="80" style="fill:#E6DED0"/><path d="M322 100 L400 66 L478 100z" style="fill:${C.blue}"/>${Array.from({length: 12}, (_, i) => `<path d="M${330 + i*12} ${97 - (i < 6 ? i*5.5 : (11 - i)*5.5)} V${100}" style="stroke:#2E5E9A" stroke-width="1"/>`).join("")}
      <rect x="378" y="124" width="40" height="52" style="fill:#5E7A8A"/><path d="M398 124 v52" style="stroke:#3A3430" stroke-width="1"/>
      ${[[438, 160], [456, 160], [447, 146]].map(([x, y]) => `<rect x="${x - 8}" y="${y}" width="16" height="12" style="fill:#C9A27E"/><circle cx="${x - 3}" cy="${y + 1}" r="2.6" style="fill:${C.tang}"/><circle cx="${x + 3}" cy="${y + 1}" r="2.6" style="fill:${C.tang}"/>`).join("")}`,
      `<rect x="330" y="96" width="140" height="80"/><path d="M322 100 L400 66 L478 100z"/><rect x="378" y="124" width="40" height="52"/>`)}
    ${lab(396, 202, "Packing shed", "#C3DDF3", 10)}</g>`;
  // the pony paddock: a stone-walled field with three ponies
  const paddock = `<g data-place="jjponies" aria-label="The ponies"><ellipse class="hov" cx="396" cy="410" rx="36" ry="9" style="fill:var(--butter)"/>${wall("M336 426 H350 M376 426 H504 V566 H336 V426")}
    ${pony(390, 486, "#8A5A3A", 1, 0)}${pony(456, 520, "#C9A27E", -1, 1)}${pony(430, 460, "#5A4030", -1, 2)}${lab(420, 590, "Ponies", "#F3E1A0", 10)}</g>`;
  const cairns = `<g data-place="jjcairns" aria-label="The wish-towers"><ellipse class="hov" cx="150" cy="546" rx="44" ry="10" style="fill:var(--butter)"/>${cairn(80, 528, 6)}${cairn(104, 520, 4, .9)}${cairn(124, 534, 5)}${cairn(70, 508, 3, .8)}${lab(110, 566, "Wish-towers", "#E7D9F2", 10)}</g>`;
  const bits = olle(300, 300) + olle(276, 470) + olle(40, 316) + wall("M200 440 Q220 520 236 616") + canola([[300, 360], [320, 560], [200, 400]]) + tangerine(470, 260, 1, 3) + tangerine(196, 600, .9, 2);
  return lampDefs + ground + trail + field1 + field2 + trees1 + trees2 + orchard + shed + paddock + cairns + bits + seasonFx()
    + gate("jjToShore", 16, 330, "The shore", 60, 300, "West along the trail to the shore and the crater", "#C3DDF3")
    + gate("jjToVillage", 262, 612, "Stone village", 336, 600, "South down the lane to the stone village");
}

/* ---------- jj_harbour: the ferry pier, the squid boats, the horse lighthouses, the market hall ---------- */
// a horse lighthouse: a tower shaped like a Jeju pony standing tall, one red, one white
const horseLight = (x, y, col, dir = 1) => `<g transform="translate(${x} ${y}) scale(${dir} 1)">${sk(`<rect x="-9" y="-58" width="18" height="58" rx="3" style="fill:${col}"/><path d="M-9 -56 q4 -16 12 -18 q10 -2 14 8 l2 10 q-6 -2 -8 -6 l-4 6z" style="fill:${col}"/><path d="M-6 -70 q-4 8 -4 14" style="fill:none;stroke:#3A3430" stroke-width="2.4"/><rect x="-12" y="-4" width="24" height="6" style="fill:${C.basalt}"/>`,
  `<rect x="-9" y="-58" width="18" height="58" rx="3"/><path d="M-9 -56 q4 -16 12 -18 q10 -2 14 8 l2 10"/>`)}${lampGlow(4, -64, 14)}</g>`;
// a squid boat: little fishing boat with a string of big bulbs for night fishing
const squidBoat = (x, y, col, i) => `<g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur="${3 + i*.5}s" repeatCount="indefinite"/>${sk(`<path d="M${x - 30} ${y - 10} h60 l-8 12 h-44z" style="fill:${col}"/><rect x="${x - 10}" y="${y - 22}" width="18" height="12" style="fill:#FFFDF6"/><path d="M${x - 26} ${y - 26} h52" style="stroke:#3A3430" stroke-width="1"/>`,
  `<path d="M${x - 30} ${y - 10} h60 l-8 12 h-44z"/>`)}${[-20, -8, 4, 16].map(dx => `<circle cx="${x + dx}" cy="${y - 24}" r="3" style="fill:#FFF3C4;stroke:var(--line)" stroke-width=".7"/>`).join("")}</g></g>`;
function harbourScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.soil}"/><g filter="url(#wash)" opacity=".6"><ellipse cx="380" cy="420" rx="150" ry="140" style="fill:#E3DCC8"/></g>`;
  // the sea: the west side and the harbour mouth along the bottom-left
  const sea = `<g pointer-events="none">${sk(`<path d="M0 0 H130 Q150 120 120 250 Q110 300 120 330 L200 330 L200 450 Q190 520 210 600 Q260 620 520 610 V640 H0z" style="fill:${C.sea}"/>`,
    `<path d="M130 0 Q150 120 120 250 Q110 300 120 330 M200 450 Q190 520 210 600 Q260 620 520 610"/>`)}${waves([[30, 80], [70, 200], [20, 560], [90, 600], [300, 626], [420, 624]])}</g>`;
  // the pier: a long stone quay with the ferry tied up alongside
  const pier = `<g pointer-events="none">${sk(`<rect x="110" y="330" width="96" height="120" style="fill:#B9B0A4"/><rect x="0" y="380" width="120" height="22" style="fill:#B9B0A4"/>${[130, 160, 190].map(x => `<rect x="${x - 4}" y="440" width="8" height="8" rx="2" style="fill:#3A3430"/>`).join("")}`, `<rect x="110" y="330" width="96" height="120"/><rect x="0" y="380" width="120" height="22"/>`)}</g>`;
  const ferry = `<g data-place="jjpier" aria-label="The ferry pier: ferries home to Honeybrook"><ellipse class="hov" cx="214" cy="424" rx="30" ry="10" style="fill:var(--butter)"/>
    <g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur="4s" repeatCount="indefinite"/>${sk(`<path d="M10 300 H110 L100 372 H18z" style="fill:#FFFDF6"/><rect x="10" y="352" width="96" height="7" style="fill:${C.blue}"/><rect x="30" y="306" width="60" height="30" rx="3" style="fill:#EAF6FA"/>${[38, 54, 70].map(x => `<rect x="${x}" y="312" width="12" height="10" rx="2" style="fill:#9FD3E8"/>`).join("")}<rect x="52" y="286" width="12" height="20" style="fill:${C.orange}"/>`,
      `<path d="M10 300 H110 L100 372 H18z"/><rect x="30" y="306" width="60" height="30" rx="3"/>`)}</g></g>
    ${sk(`<rect x="196" y="378" width="34" height="30" rx="2" style="fill:#FFFDF6"/><path d="M196 378 h34 l-4 -8 h-26z" style="fill:${C.blue}"/>`, `<rect x="196" y="378" width="34" height="30" rx="2"/>`)}
    <text x="213" y="396" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7" fill="${C.blue}" pointer-events="none">FERRY</text>${lab(160, 470, "Ferry home", "#C3DDF3", 10)}</g>`;
  const lights = `<g data-place="jjlights" aria-label="The horse lighthouses"><ellipse class="hov" cx="150" cy="556" rx="30" ry="9" style="fill:var(--butter)"/><g pointer-events="none">${rocks([[60, 566, 16], [158, 590, 14]])}${horseLight(60, 562, "#D0452F", 1)}${horseLight(158, 586, "#FFFDF6", -1)}</g>${lab(110, 616, "Horse lighthouses", "#F6D3DC", 10)}</g>`;
  // the market hall: a long low building with a striped awning and crates outside
  const market = `<g data-place="jjmarket" aria-label="The market hall"><ellipse class="hov" cx="396" cy="186" rx="50" ry="10" style="fill:var(--butter)"/>${shade(314, 96, 172, 80)}
    ${sk(`<rect x="314" y="96" width="172" height="80" style="fill:#E6DED0"/><path d="M306 100 L400 70 L494 100z" style="fill:${C.basalt2}"/><path d="M314 116 h172 v14 h-172z" style="fill:${C.orange}"/>${Array.from({length: 11}, (_, i) => `<rect x="${314 + i*16}" y="116" width="8" height="14" style="fill:#FFFDF6"/>`).join("")}
      <rect x="376" y="134" width="40" height="42" style="fill:#5E4A3A"/>${[[334, 164], [352, 164], [448, 164], [466, 164]].map(([x, y], i) => `<rect x="${x - 8}" y="${y}" width="16" height="12" style="fill:#C9A27E"/><circle cx="${x}" cy="${y + 1}" r="4" style="fill:${["#F29A2E", "#5E8A48", "#C8643B", "#3E5E4A"][i]}"/>`).join("")}`,
      `<rect x="314" y="96" width="172" height="80"/><path d="M306 100 L400 70 L494 100z"/><rect x="376" y="134" width="40" height="42"/>`)}
    <rect x="364" y="100" width="72" height="13" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="400" y="110" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${C.ink}" pointer-events="none">시장 MARKET</text>
    ${lab(400, 206, "Market hall", "#FBE0B8", 10)}</g>`;
  const trail = path("M300 26 Q300 120 290 220 Q270 330 230 410 M290 260 Q400 280 504 400 M300 330 Q330 440 360 520");
  const bits = squidBoat(60, 140, "#3E7CC0", 0) + squidBoat(70, 240, "#5E8A48", 1) + squidBoat(330, 632, "#C8643B", 2) + gulls([[60, 60], [300, 560], [160, 520]]) + hareubang(470, 330, .8)
    + `<g pointer-events="none">${sk([[300, 480], [318, 492], [340, 482]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="6" style="fill:#C9A27E"/>`).join("") + `<path d="M290 470 q20 -14 60 0" style="stroke:#8A7448" stroke-width="1.4" fill="none"/>`, `<ellipse cx="300" cy="480" rx="10" ry="6"/>`)}</g>`;
  return lampDefs + ground + sea + pier + trail + bits + market + ferry + lights + seasonFx()
    + gate("jjToShoreN", 300, 26, "The shore", 362, 30, "North up the coast to the shore and the crater", "#C3DDF3")
    + gate("jjToVillageE", 504, 400, "Village", 466, 364, "East up into the stone village");
}

/* ---------- jj_village: thatched stone houses, the stone grandfathers, the café, the dye workshop, the station ---------- */
function villageScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.soil}"/><g filter="url(#wash)" opacity=".6"><ellipse cx="160" cy="400" rx="140" ry="120" style="fill:${C.grass}"/><ellipse cx="300" cy="230" rx="120" ry="60" style="fill:${C.grass}"/></g>`;
  // the olle (the winding stone-walled alley), from the stone grandfathers down to the station
  const lanes = path("M262 40 Q262 140 250 220 Q236 300 262 380 Q290 460 380 500 Q404 520 404 560 M16 400 Q140 400 240 380 M250 220 Q330 230 410 330 M250 200 Q180 196 112 186", 30);
  const walls = wall("M226 120 Q216 220 208 300 Q200 340 160 350 Q90 352 30 360")  + wall("M30 440 Q140 434 230 420 Q270 470 340 520")
    + wall("M226 120 H200 M300 120 H324");
  // the stone grandfathers either side of the way in from the north
  const statues = `<g data-place="jjstatues" aria-label="The stone grandfathers"><ellipse class="hov" cx="262" cy="118" rx="44" ry="9" style="fill:var(--butter)"/>${hareubang(214, 112, 1.1)}${hareubang(310, 112, 1.1)}${lab(262, 140, "Stone grandfathers", "#E7D9F2", 10)}</g>`;
  // the café: an old stone house, a tangerine painted on its door
  const cafe = `<g data-place="jjcafe" aria-label="The stone-house café"><ellipse class="hov" cx="112" cy="182" rx="40" ry="10" style="fill:var(--butter)"/>${choga(30, 110, 166, 66, {doorX: 82, sign: "CAFÉ 카페", door: C.tang})}
    ${sk(`<circle cx="112" cy="160" r="5" style="fill:#FFFDF6"/><path d="M112 155 v-3" style="stroke:${C.leaf}" stroke-width="2"/>`, "")}${lab(112, 204, "Café", "#FBE0B8", 10)}</g>`;
  // the dye workshop: lines of persimmon-dyed cloth drying, from pale to deep rust
  const dye = `<g data-place="jjdye" aria-label="The dye workshop"><ellipse class="hov" cx="410" cy="348" rx="40" ry="10" style="fill:var(--butter)"/>${choga(334, 274, 152, 64, {doorX: 76, sign: "갈옷 DYE", door: C.cloth[1]})}
    ${sk(`<path d="M332 236 V270 M490 236 V270" style="stroke:${C.wood}" stroke-width="3"/><path d="M332 240 Q411 248 490 240" style="fill:none;stroke:#3A3430" stroke-width="1"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${342 + i*24}" y="${242 + (i === 0 || i === 5 ? 0 : 2)}" width="16" height="${22 + (i % 2)*6}" style="fill:${C.cloth[i % 4]}"/>`).join("")}`, `<path d="M332 240 Q411 248 490 240"/>`)}
    ${lab(410, 370, "Dye workshop", "#F3E1A0", 10)}</g>`;
  // more thatched houses round about (just houses: people live here)
  const houses = choga(40, 284, 120, 52, {doorX: 30}) + choga(30, 486, 130, 56, {doorX: 96});
  // the station: a small stone building with a blue roof, its platform, the rails and the sea bridge out to the east
  const rail = `<g pointer-events="none">${sk(`<path d="M440 640 Q470 600 520 590 V640z" style="fill:${C.sea}"/><rect x="300" y="596" width="220" height="18" style="fill:#BFB7A6"/>`, `<path d="M440 640 Q470 600 520 590"/>`)}
    ${Array.from({length: 15}, (_, i) => `<rect x="${304 + i*15}" y="596" width="5" height="18" style="fill:#6B5444"/>`).join("")}<path d="M300 600 H520 M300 610 H520" style="stroke:#7A7A80" stroke-width="1.6"/>
    ${[470, 498].map(x => `<rect x="${x}" y="612" width="6" height="28" style="fill:${C.basalt2};stroke:var(--line)" stroke-width=".8"/>`).join("")}</g>`;
  const station = `<g data-place="jjtrain" aria-label="Jeju station">${shade(338, 464, 164, 84)}
    ${sk(`<rect x="338" y="584" width="182" height="12" style="fill:#B9B0A4"/><rect x="338" y="478" width="164" height="70" style="fill:${C.basalt2}"/>${Array.from({length: 14}, (_, i) => `<ellipse cx="${346 + rnd(i + 9)*150}" cy="${486 + rnd(i + 19)*54}" rx="5" ry="3" style="fill:${C.basalt3}" opacity=".7"/>`).join("")}
      <path d="M330 482 L420 450 L510 482z" style="fill:${C.blue}"/><rect x="404" y="512" width="30" height="36" style="fill:#5E7A8A"/><rect x="352" y="500" width="34" height="20" rx="2" style="fill:#F3E7C8"/><rect x="452" y="500" width="34" height="20" rx="2" style="fill:#F3E7C8"/>
      <rect x="396" y="548" width="46" height="36" style="fill:#E6DFCC"/>`, `<rect x="338" y="478" width="164" height="70"/><path d="M330 482 L420 450 L510 482z"/><rect x="404" y="512" width="30" height="36"/>`)}
    <rect x="384" y="484" width="72" height="14" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8"/><text x="420" y="494" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9" fill="${C.ink}" pointer-events="none">제주 JEJU</text>
    ${lab(470, 572, "Station · trains home", "#C3DDF3", 10)}</g>`;
  const trees = tangerine(190, 300, 1, 0) + tangerine(312, 440, .9, 1) + tangerine(480, 220, .9, 2) + tangerine(170, 600, .9, 3)
    + `<g pointer-events="none">${sk(`<path d="M300 200 v-14" style="stroke:#5A4636" stroke-width="3"/><ellipse cx="300" cy="176" rx="18" ry="14" style="fill:#7FA35A"/>${[[-8, -2], [6, -6], [2, 6]].map(([dx, dy]) => `<circle cx="${300 + dx}" cy="${176 + dy}" r="3" style="fill:#E07A2E"/>`).join("")}`, `<ellipse cx="300" cy="176" rx="18" ry="14"/>`)}</g>`   // a persimmon tree, for the dye
    + canola([[150, 380], [60, 420], [320, 380]]);
  return lampDefs + ground + lanes + walls + houses + trees + cafe + dye + rail + station + statues + seasonFx()
    + gate("jjToFarmsN", 262, 40, "Tangerine farms", 340, 34, "North between the stone grandfathers to the tangerine farms")
    + gate("jjToHarbourW", 16, 400, "Harbour", 60, 372, "West down to the harbour", "#C3DDF3");
}

export function jejuArt(scene){
  return scene === "jj_shore" ? shoreScreen() : scene === "jj_farms" ? farmsScreen() : scene === "jj_harbour" ? harbourScreen() : villageScreen();
}
// The train ride to Jeju: green hills, then the long sea bridge over a very blue sea, and a crater on the horizon
export const jejuRide = () => `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
  <path d="M0 50 H600 V90 H0z" fill="${C.sea}"/><path d="M380 50 Q420 22 470 24 Q510 28 530 50z" fill="#8FB46A"/><ellipse cx="456" cy="30" rx="26" ry="6" fill="#7FA35A"/>
  <path d="M0 72 H600" stroke="#8A8279" stroke-width="4"/>${Array.from({length: 12}, (_, i) => `<path d="M${20 + i*50} 72 v18" stroke="#8A8279" stroke-width="3"/>`).join("")}
  ${[60, 200, 320].map(x => `<path d="M${x} 60 q5 -4 10 0 q5 4 10 0" fill="none" stroke="#EAF5FA" stroke-width="1.4"/>`).join("")}</g></svg>`;
// The ferry crossing (both ways): the boat rides the swell, a crater on the horizon, and a dolphin or two
export function ferryRideArt(home){
  const bank = `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
    ${home ? `<path d="M0 56 Q75 34 150 50 T300 50 V60 H0z" fill="#9CC27E"/>` : `<path d="M400 56 Q440 26 490 28 Q530 32 550 56z" fill="#8FB46A"/><ellipse cx="476" cy="34" rx="26" ry="6" fill="#7FA35A"/>`}
    <path d="M0 56 H600 V90 H0z" fill="${C.sea}"/>${[40, 140, 260, 380, 500].map(x => `<path d="M${x} 72 q6 -5 12 0 q6 5 12 0" fill="none" stroke="#EAF5FA" stroke-width="1.4"/>`).join("")}
    <g><path d="M220 66 q14 -16 28 0" fill="#7A8C9C"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -2;0 6" dur="1.6s" repeatCount="indefinite"/></g></g></svg>`;
  const boat = `<div class="taxiboat"><svg viewBox="0 0 160 60" width="220" height="82" aria-hidden="true"><g filter="url(#wob)" style="stroke:#3b3530" stroke-width="1.4" stroke-linejoin="round">
    <path d="M6 30 H154 L140 54 H18z" fill="#FFFDF6"/><rect x="10" y="40" width="138" height="6" fill="${C.blue}"/><rect x="40" y="12" width="70" height="20" rx="3" fill="#EAF6FA"/>${[48, 66, 84].map(x => `<rect x="${x}" y="16" width="14" height="10" rx="2" fill="#9FD3E8"/>`).join("")}
    <rect x="96" y="2" width="10" height="12" fill="${C.orange}"/><circle cx="58" cy="21" r="4" fill="#F2D3BC"/><circle cx="74" cy="21" r="4" fill="#C99A78"/></g></svg></div>`;
  return bank + boat;
}
// The wish-tower in Honeybrook Woods, by the river (Mel, round 127): it grows a stone for each wish (up to nine)
export const wishTower = (x, y, n) => `<g data-place="wishtower" aria-label="The wish-tower">${`<ellipse class="hov" cx="${x}" cy="${y + 4}" rx="18" ry="6" style="fill:var(--butter)"/>`}${cairn(x, y, Math.max(3, Math.min(9, n)), 1.25)}</g>`;
