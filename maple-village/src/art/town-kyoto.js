// Kyoto (round 121): four screens of an old capital in a bowl of wooded hills. Nothing like Ronda's white walls and
// hard sun: dark timber townhouses with lattice fronts, grey tiled roofs with upturned eaves, stone lanes, paper
// lanterns, vermilion gates, raked gravel, moss, bamboo, maples and the sound of water. Soft light; calm on purpose.
//   kt_station: the little wooden station and the tram, the bamboo grove down the west side, the yukata shop
//   kt_lane:    the sloping stone lane of Higashiyama up to the five-storey pagoda: the tea house, the sweet shop, the pottery
//   kt_temple:  the temple hall, a tunnel of vermilion torii, the raked gravel garden, the koi pond and its red bridge
//   kt_river:   the shallow river with its turtle stepping stones and herons, the covered market, the willow canal
// Seasons: cherry blossom in spring; cicadas and fireflies in summer; red and gold maples in autumn; snow and red
// camellias in winter.
import { ink, dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampDefs, lampGlow } from "./village-extras.js";
import { seasonOf } from "../data/items.js";

const C = {gravel: "#E8E2D4", gravel2: "#DDD5C4", stone: "#CFC8BA", stone2: "#B9B0A4", timber: "#4A3A2E", timber2: "#6B5444", plaster: "#F3EFE6",
  roof: "#5E6670", roof2: "#47505A", vermilion: "#D0452F", moss: "#7E9A5A", moss2: "#6E8B4A", bamboo: "#8DB255", bamboo2: "#6E9A44", water: "#8FC3D8",
  paper: "#FBF3DF", lanternRed: "#C8432F", ink: "#2F2B28"};
const W = ink;
const ssn = () => seasonOf(dayKey());
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);

/* ---------- pieces ---------- */
// a soft blue-grey shadow down and to the right
const shade = (x, y, w, h, d = 12) => `<path d="M${x + w} ${y + 6} l${d} ${d*.7} V${y + h + d*.7} H${x + d} l${-d} ${-d*.7}z" style="fill:#6F7C9C" opacity=".18" pointer-events="none"/>`;
// a grey tiled roof with gently upturned eaves
const roofArt = (x, y, w, h) => `<path d="M${x - 10} ${y + h} q8 -4 14 -${h} H${x + w - 4} q6 ${h - 4} 14 ${h}z" style="fill:${C.roof}"/>${Array.from({length: Math.floor((w + 10)/8)}, (_, i) => `<path d="M${x - 2 + i*8} ${y + 3} v${h - 5}" style="stroke:${C.roof2}" stroke-width="1.2"/>`).join("")}`;
const roofLines = (x, y, w, h) => `<path d="M${x - 10} ${y + h} q8 -4 14 -${h} H${x + w - 4} q6 ${h - 4} 14 ${h}z"/>`;
// a townhouse (machiya): dark timber frame, lattice front, white plaster above, a noren curtain over the door
function machiya(x, y, w, h, o = {}){
  const lat = Array.from({length: Math.floor((w - 12)/5)}, (_, i) => `<path d="M${x + 8 + i*5} ${y + h*.42} V${y + h - 6}" style="stroke:${C.timber2}" stroke-width="1.4"/>`).join("");
  const dx = o.doorX || w/2, noren = o.noren || "#3E5E7A";
  return shade(x, y, w, h) + sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${C.timber}"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h*.36}" style="fill:${C.plaster}"/>${lat}
    <rect x="${x + dx - 14}" y="${y + h*.45}" width="28" height="${h*.55}" style="fill:#2A221C"/><path d="M${x + dx - 18} ${y + h*.42} h36 v${h*.22} h-36z" style="fill:${noren}"/><path d="M${x + dx - 6} ${y + h*.42} v${h*.22} M${x + dx + 6} ${y + h*.42} v${h*.22}" style="stroke:${C.paper}" stroke-width="1"/>
    ${roofArt(x, y - 16, w, 18)}`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="M${x + dx - 18} ${y + h*.42} h36 v${h*.22} h-36z"/>${roofLines(x, y - 16, w, 18)}`)
    + (o.sign ? `<rect x="${x + dx - 22}" y="${y + 8}" width="44" height="13" rx="2" style="fill:${C.timber2};stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x + dx}" y="${y + 18}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${C.paper}" pointer-events="none">${o.sign}</text>` : "")
    + (o.lantern ? chochin(x + dx + 26, y + h*.38) : "");
}
// a red paper lantern hanging by a door
const chochin = (x, y, col = C.lanternRed) => lampGlow(x, y + 8, 22) + `<g pointer-events="none" ${W} stroke-width="1"><path d="M${x} ${y - 6} v4"/><ellipse cx="${x}" cy="${y + 8}" rx="6" ry="9" style="fill:${col}"/><path d="M${x - 5} ${y + 4} h10 M${x - 6} ${y + 9} h12 M${x - 5} ${y + 14} h10" stroke-width=".6"/></g>`;
// a stone lantern (tōrō)
const toro = (x, y, s = 1) => `<g pointer-events="none">${sk(`<rect x="${x - 4*s}" y="${y - 20*s}" width="${8*s}" height="${20*s}" style="fill:${C.stone2}"/><path d="M${x - 11*s} ${y - 20*s} h${22*s} l${-4*s} ${-5*s} h${-14*s}z" style="fill:${C.stone}"/><rect x="${x - 7*s}" y="${y - 34*s}" width="${14*s}" height="${9*s}" style="fill:#E6DED0"/><rect x="${x - 3.5*s}" y="${y - 32*s}" width="${7*s}" height="${5*s}" style="fill:#F6D98A"/><path d="M${x - 13*s} ${y - 34*s} q${13*s} ${-11*s} ${26*s} 0z" style="fill:${C.stone2}"/>`,
  `<rect x="${x - 4*s}" y="${y - 20*s}" width="${8*s}" height="${20*s}"/><path d="M${x - 13*s} ${y - 34*s} q${13*s} ${-11*s} ${26*s} 0z"/><rect x="${x - 7*s}" y="${y - 34*s}" width="${14*s}" height="${9*s}"/>`)}</g>` + lampGlow(x, y - 29*s, 16);
// a maple: red and gold in autumn, fresh green in spring and summer, bare in winter
function maple(x, y, s = 1){
  const se = ssn(), cols = se === "autumn" ? ["#C8432F", "#E0782E", "#E8B13A"] : se === "winter" ? null : se === "spring" ? ["#9CC27E", "#B9D88A", "#7FA35A"] : ["#6E9A44", "#86AE58", "#5E8A3A"];
  const trunk = `<path d="M${x} ${y} q-2 ${-12*s} ${-6*s} ${-20*s} M${x} ${y - 10*s} q4 ${-8*s} ${10*s} ${-14*s}" style="fill:none;stroke:#5A4636" stroke-width="${3*s}"/>`;
  if (!cols) return `<g pointer-events="none">${sk(trunk, trunk)}</g>`;
  const blobs = [[-12, -26, 12], [6, -32, 13], [16, -20, 10], [-4, -16, 10], [-18, -14, 8]];
  return `<g pointer-events="none">${sk(trunk + blobs.map(([dx, dy, r], i) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${r*s}" style="fill:${cols[i % 3]}"/>`).join(""), blobs.slice(0, 3).map(([dx, dy, r]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${r*s}"/>`).join(""))}</g>`;
}
// a cherry tree: clouds of pink in spring, green otherwise, bare in winter
function sakura(x, y, s = 1){
  const se = ssn(), col = se === "spring" ? ["#F6C7D6", "#F2A0B8", "#FBE1EA"] : se === "winter" ? null : se === "autumn" ? ["#C9A44A", "#B98A4A", "#D9B86A"] : ["#7FA35A", "#8FB46A", "#6E9A44"];
  const trunk = `<path d="M${x} ${y} q-4 ${-16*s} ${2*s} ${-26*s} M${x} ${y - 14*s} q-8 ${-6*s} ${-14*s} ${-8*s}" style="fill:none;stroke:#5A4040" stroke-width="${3.4*s}"/>`;
  if (!col) return `<g pointer-events="none">${sk(trunk, trunk)}</g>`;
  const blobs = [[-14, -30, 13], [6, -36, 14], [18, -26, 11], [-2, -22, 11]];
  return `<g pointer-events="none">${sk(trunk + blobs.map(([dx, dy, r], i) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${r*s}" style="fill:${col[i % 3]}"/>`).join(""), blobs.slice(0, 2).map(([dx, dy, r]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${r*s}"/>`).join(""))}</g>`;
}
// petals drifting (spring) or snow falling (winter) or fireflies (summer evenings)
function seasonFx(){
  const se = ssn();
  if (se === "spring") return `<g pointer-events="none">${Array.from({length: 10}, (_, i) => `<ellipse cx="0" cy="0" rx="2.6" ry="1.6" fill="#F6C7D6"><animateMotion dur="${9 + i}s" begin="${-i*1.7}s" repeatCount="indefinite" path="M${40 + i*48} -10 q30 160 -20 330 t10 330"/></ellipse>`).join("")}</g>`;
  if (se === "winter") return `<g pointer-events="none">${Array.from({length: 14}, (_, i) => `<circle r="1.8" fill="#FFFFFF" opacity=".9"><animateMotion dur="${10 + (i % 5)}s" begin="${-i*1.3}s" repeatCount="indefinite" path="M${20 + i*36} -10 q-12 330 8 660"/></circle>`).join("")}</g>`;
  return "";
}
// a vermilion torii gate
const torii = (x, y, w = 40, h = 46, col = C.vermilion) => sk(`<rect x="${x - w/2 + 4}" y="${y - h}" width="5" height="${h}" style="fill:${col}"/><rect x="${x + w/2 - 9}" y="${y - h}" width="5" height="${h}" style="fill:${col}"/><path d="M${x - w/2 - 4} ${y - h - 4} q${w/2 + 4} -6 ${w + 8} 0 v5 h-${w + 8}z" style="fill:${col}"/><path d="M${x - w/2 - 6} ${y - h - 8} q${w/2 + 6} -6 ${w + 12} 0 v4 h-${w + 12}z" style="fill:#2F2B28"/><rect x="${x - w/2 + 2}" y="${y - h + 8}" width="${w - 4}" height="4" style="fill:${col}"/>`,
  `<rect x="${x - w/2 + 4}" y="${y - h}" width="5" height="${h}"/><rect x="${x + w/2 - 9}" y="${y - h}" width="5" height="${h}"/><path d="M${x - w/2 - 6} ${y - h - 8} q${w/2 + 6} -6 ${w + 12} 0 v4 h-${w + 12}z"/>`);
// a gate between screens: a small wooden gateway with a little roof
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 18}" y="${y - 30}" width="6" height="40" style="fill:${C.timber2}"/><rect x="${x + 12}" y="${y - 30}" width="6" height="40" style="fill:${C.timber2}"/><path d="M${x - 26} ${y - 30} q26 -10 52 0 v5 h-52z" style="fill:${C.roof}"/>`,
    `<rect x="${x - 18}" y="${y - 30}" width="6" height="40"/><rect x="${x + 12}" y="${y - 30}" width="6" height="40"/><path d="M${x - 26} ${y - 30} q26 -10 52 0 v5 h-52z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
// a place with a tap target and a label (the round-1 spots: a line when Mel walks up)
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
// stone flags for a lane
const flags = (pts, w = 40) => `<g filter="url(#wob)"><path d="${pts}" fill="none" style="stroke:${C.stone}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${pts}" fill="none" style="stroke:${C.stone2}" stroke-width="${w - 4}" stroke-dasharray="10 12" stroke-linecap="butt" opacity=".35"/></g>`;
// a heron standing in the shallows
const heron = (x, y) => `<g pointer-events="none" ${W} stroke-width="1"><path d="M${x} ${y} v-12 M${x + 4} ${y} v-12" stroke-width="1.2"/><ellipse cx="${x + 2}" cy="${y - 18}" rx="8" ry="6" style="fill:#E6E8EC"/><path d="M${x + 8} ${y - 20} q6 -10 2 -18" style="fill:none;stroke:#E6E8EC" stroke-width="3"/><path d="M${x + 8} ${y - 20} q6 -10 2 -18" fill="none"/><path d="M${x + 10} ${y - 38} l9 2 l-9 2z" style="fill:#E8B13A"/></g>`;
// koi in a pond
const koi = pts => `<g pointer-events="none" ${W} stroke-width=".7">${pts.map(([x, y, c], i) => `<g transform="translate(${x} ${y})"><g><path d="M-7 0 q7 -5 13 0 q-6 5 -13 0z M6 0 l5 -3 v6z" style="fill:${c}"/><animateTransform attributeName="transform" type="translate" values="0 0;${i % 2 ? 18 : -16} 4;0 0" dur="${8 + i*2}s" repeatCount="indefinite"/></g></g>`).join("")}</g>`;
// a few stalks of bamboo (the grove is built from these)
const stalks = (x0, x1, y0, y1, n, seed = 0) => `<g pointer-events="none">${Array.from({length: n}, (_, i) => { const x = x0 + ((i*37 + seed*13) % (x1 - x0)), c = i % 3 ? C.bamboo : C.bamboo2;
  return `<path d="M${x} ${y1} V${y0}" style="stroke:${c}" stroke-width="${5 + (i % 3)}"/>${Array.from({length: Math.floor((y1 - y0)/46)}, (_, k) => `<path d="M${x - 3} ${y1 - 30 - k*46} h6" style="stroke:#5E8A3A" stroke-width="1.2"/>`).join("")}<path d="M${x} ${y0 + 20 + (i % 4)*40} q10 -6 18 -2 q-8 4 -18 2z M${x} ${y0 + 60 + (i % 5)*50} q-10 -6 -18 -2 q8 4 18 2z" style="fill:#9CC27E"/>`; }).join("")}</g>`;
const defs = `<defs><pattern id="ktgrav" width="18" height="10" patternUnits="userSpaceOnUse"><rect width="18" height="10" fill="${C.gravel}"/><circle cx="4" cy="3" r="1" fill="${C.gravel2}"/><circle cx="12" cy="7" r="1.1" fill="${C.gravel2}"/></pattern></defs>`;

/* ---------- kt_station: the station, the tram, the bamboo grove, the yukata shop ---------- */
function stationScreen(){
  const ground = `<rect width="520" height="640" fill="url(#ktgrav)"/><g filter="url(#wash)" opacity=".7"><ellipse cx="320" cy="560" rx="160" ry="50" style="fill:#C9D3A8"/><ellipse cx="460" cy="250" rx="70" ry="60" style="fill:#C9D3A8"/></g>
    ${flags("M330 168 V300 H510 M330 300 V610")}`;
  // the tram line along the top, and the little maroon and cream tram
  const rail = `<g pointer-events="none"><rect x="130" y="36" width="390" height="16" style="fill:#BFB7A6"/>${Array.from({length: 26}, (_, i) => `<rect x="${136 + i*15}" y="36" width="5" height="16" style="fill:#6B5444"/>`).join("")}<path d="M130 40 H520 M130 48 H520" style="stroke:#7A7A80" stroke-width="1.6"/></g>
    ${sk(`<rect x="150" y="10" width="120" height="34" rx="6" style="fill:#7A2E4A"/><rect x="150" y="10" width="120" height="13" rx="6" style="fill:${C.paper}"/>${[162, 186, 210, 234].map(x => `<rect x="${x}" y="14" width="16" height="10" rx="2" style="fill:#BFE0F2"/>`).join("")}<circle cx="170" cy="44" r="5" style="fill:#3A3430"/><circle cx="250" cy="44" r="5" style="fill:#3A3430"/>`,
      `<rect x="150" y="10" width="120" height="34" rx="6"/>`)}`;
  const st = `<g data-place="kttrain" aria-label="Kyoto station">${shade(262, 80, 140, 76)}
    ${sk(`<rect x="262" y="80" width="140" height="76" style="fill:${C.timber}"/><rect x="268" y="86" width="128" height="26" style="fill:${C.plaster}"/>${Array.from({length: 24}, (_, i) => `<path d="M${270 + i*5.3} 116 V150" style="stroke:${C.timber2}" stroke-width="1.4"/>`).join("")}<rect x="318" y="116" width="28" height="40" style="fill:#2A221C"/>${roofArt(262, 58, 140, 22)}`,
      `<rect x="262" y="80" width="140" height="76"/>${roofLines(262, 58, 140, 22)}`)}
    <rect x="300" y="90" width="64" height="16" rx="2" style="fill:${C.paper};stroke:var(--line)" stroke-width="1"/><text x="332" y="102" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="10" fill="${C.ink}" pointer-events="none">京都 KYOTO</text>
    ${chochin(276, 118)}${chochin(388, 118)}${lab(332, 182, "Station · trains home", "#C3DDF3", 10)}</g>`;
  // the bamboo grove down the west side: tall stalks, light coming through in stripes
  const grove = `<g pointer-events="none"><rect x="0" y="0" width="134" height="640" style="fill:#B9CC8E"/><g opacity=".35">${[40, 140, 260, 380, 500].map(y => `<path d="M0 ${y} L134 ${y + 60} V${y + 80} L0 ${y + 20}z" fill="#FFF6D8"/>`).join("")}</g></g>
    ${stalks(6, 128, 0, 640, 26, 1)}`;
  const groveSpot = place("bamboo", 150, 420, 30, 14, "The bamboo grove", "", "Bamboo grove", 160, 446, "#DCEBC8");
  // the yukata shop: a townhouse with indigo and red yukata hanging out front
  const yukata = `<g data-place="yukata" aria-label="The yukata shop"><ellipse class="hov" cx="440" cy="474" rx="40" ry="12" style="fill:var(--butter)"/>${machiya(380, 384, 120, 80, {noren: "#3E5E7A", sign: "YUKATA", doorX: 60})}
    ${sk(`<path d="M392 430 l6 -14 h12 l6 14 l-4 30 h-16z" style="fill:#3E5E7A"/><path d="M466 430 l6 -14 h12 l6 14 l-4 30 h-16z" style="fill:#C8432F"/>${[0, 1, 2].map(i => `<circle cx="${400 + i*3}" cy="${440 + i*6}" r="1.6" style="fill:#FFFDF6"/><circle cx="${474 + i*3}" cy="${440 + i*6}" r="1.6" style="fill:#F3C969"/>`).join("")}`, `<path d="M392 430 l6 -14 h12 l6 14 l-4 30 h-16z M466 430 l6 -14 h12 l6 14 l-4 30 h-16z"/>`)}
    ${lab(440, 492, "Yukata rental", "#E7D9F2", 10)}</g>`;
  // a red vending machine by the station (of course), maples, a stone lantern, a bench of sorts
  const vend = `<g pointer-events="none">${sk(`<rect x="420" y="128" width="26" height="40" rx="2" style="fill:#C8432F"/><rect x="424" y="132" width="18" height="16" style="fill:#EAF6FA"/>${[0, 1, 2].map(i => `<rect x="${426 + i*5}" y="${136}" width="3" height="8" style="fill:${["#3E6BAE", "#F3C969", "#5E8A48"][i]}"/>`).join("")}`, `<rect x="420" y="128" width="26" height="40" rx="2"/>`)}</g>`;
  const trees = maple(214, 300, 1.1) + maple(470, 300, .9) + sakura(220, 560, 1) + maple(470, 600, .9) + toro(260, 420) + toro(410, 330, .9);
  return defs + lampDefs + ground + grove + rail + st + vend + trees + groveSpot + yukata + seasonFx()
    + gate("ktToLane", 500, 300, "Higashiyama", 466, 262, "East along the tram line to the old lane and the pagoda")
    + gate("ktToRiver", 330, 616, "The river", 392, 604, "South to the river and the canal");
}

/* ---------- kt_lane: Higashiyama, the stone lane up to the pagoda ---------- */
function laneScreen(){
  const ground = `<rect width="520" height="640" style="fill:#D9D0BC"/>${flags("M14 300 H200 Q260 300 280 250 L330 190 M280 250 Q300 400 330 470 V616", 46)}`;
  // the five-storey pagoda at the top of the lane
  const tiers = [0, 1, 2, 3, 4].map(i => { const w = 92 - i*12, x = 432 - w/2, y = 168 - i*30; return `<rect x="${x + 8}" y="${y - 18}" width="${w - 16}" height="18" style="fill:${C.vermilion}"/>${roofArt(x, y - 30, w, 12)}`; }).join("");
  const pagoda = `<g data-place="pagoda" aria-label="The five-storey pagoda"><ellipse class="hov" cx="432" cy="182" rx="44" ry="12" style="fill:var(--butter)"/>${shade(386, 20, 92, 160)}
    ${sk(tiers + `<path d="M432 14 v-12" style="stroke:#C9A44A" stroke-width="3"/>${[0, 1, 2, 3].map(i => `<circle cx="432" cy="${10 - i*3}" r="2" style="fill:#C9A44A"/>`).join("")}`, [0, 1, 2, 3, 4].map(i => { const w = 92 - i*12, x = 432 - w/2, y = 168 - i*30; return roofLines(x, y - 30, w, 12); }).join(""))}
    ${lab(432, 200, "The pagoda", "#F6D3DC", 10)}</g>`;
  const teahouse = `<g data-place="chaya" aria-label="The tea house">${machiya(26, 76, 176, 96, {noren: "#5E7A4A", sign: "お茶 TEA", lantern: true, doorX: 88})}${lab(114, 194, "Tea house", "#DCEBC8", 10)}</g>`;
  const sweets = `<g data-place="wagashi" aria-label="The sweet shop">${machiya(336, 330, 168, 96, {noren: "#E8A0B4", sign: "WAGASHI", doorX: 84})}${lab(420, 446, "Sweet shop", "#F6D3DC", 10)}</g>`;
  const pottery = `<g data-place="pottery" aria-label="The pottery workshop">${machiya(26, 430, 168, 90, {noren: "#8A6A52", sign: "POTTERY", doorX: 84})}
    ${sk([0, 1, 2].map(i => `<path d="M${46 + i*16} 524 q-3 -10 4 -12 h6 q7 2 4 12z" style="fill:${["#5E7A8A", "#C9A27E", "#3E5E4A"][i]}"/>`).join(""), "")}${lab(110, 540, "Pottery", "#E8D3BC", 10)}</g>`;
  // a rickshaw parked by the lane, maples, lanterns, a cat on a step
  const rickshaw = `<g pointer-events="none">${sk(`<circle cx="236" cy="420" r="16" style="fill:none;stroke:#2F2B28" stroke-width="3"/><path d="M226 404 h22 l4 -22 h-22z" style="fill:#2F2B28"/><path d="M230 384 q10 -14 22 -2" style="fill:#C8432F"/><path d="M252 410 l40 6" style="stroke:#8A6A52" stroke-width="3"/>`, `<circle cx="236" cy="420" r="16"/>`)}</g>`;
  const trees = maple(250, 180, 1) + maple(220, 600, 1) + sakura(470, 600, .9) + maple(300, 120, .8) + toro(372, 250, .9) + toro(380, 560);
  return defs + lampDefs + ground + teahouse + pottery + sweets + pagoda + rickshaw + trees + seasonFx()
    + gate("ktToStation", 16, 300, "The station", 60, 262, "West back to the station and the bamboo")
    + gate("ktStepsDown", 330, 616, "Temple", 394, 604, "Down the stone steps to the temple");
}

/* ---------- kt_temple: the hall, the torii tunnel, the gravel garden, the koi pond ---------- */
function templeScreen(){
  const ground = `<rect width="520" height="640" style="fill:#D6CDB8"/><g filter="url(#wash)" opacity=".8"><ellipse cx="110" cy="520" rx="110" ry="80" style="fill:#B5C58E"/><ellipse cx="420" cy="560" rx="110" ry="60" style="fill:#B5C58E"/></g>
    ${flags("M150 26 V120 Q150 200 230 200 H350 M230 200 V610 M14 380 H230", 40)}`;
  // the temple hall: a deep sweeping roof on red-brown pillars, a gong, incense smoke
  const hall = `<g data-place="hall" aria-label="The temple hall">${shade(270, 70, 210, 100)}
    ${sk(`<rect x="276" y="92" width="198" height="80" style="fill:${C.timber}"/>${[290, 330, 370, 410, 450].map(x => `<rect x="${x}" y="96" width="8" height="76" style="fill:#8E3A2A"/>`).join("")}<rect x="340" y="120" width="70" height="52" style="fill:#2A221C"/><path d="M250 98 q18 -8 30 -44 H470 q12 36 30 44z" style="fill:${C.roof}"/>${Array.from({length: 26}, (_, i) => `<path d="M${270 + i*8.4} 58 v36" style="stroke:${C.roof2}" stroke-width="1.2"/>`).join("")}<path d="M300 54 q75 -24 150 0z" style="fill:${C.roof2}"/>`,
      `<rect x="276" y="92" width="198" height="80"/><path d="M250 98 q18 -8 30 -44 H470 q12 36 30 44z"/><path d="M300 54 q75 -24 150 0z"/>`)}
    <g pointer-events="none"><rect x="366" y="176" width="20" height="10" rx="2" style="fill:#5A4636;stroke:var(--line)" stroke-width=".8"/>${[0, 1].map(i => `<path class="smoke" d="M${372 + i*8} 174 q-4 -8 0 -14 q4 -6 0 -12" fill="none" style="stroke:#B9B0A4" stroke-width="1.4" opacity=".6"/>`).join("")}</g>
    ${lab(375, 204, "Temple hall", "#F6E3B4", 10)}</g>`;
  // the torii tunnel climbing the path: vermilion gates close together, getting smaller as they climb
  const tunnel = `<g data-place="torii" aria-label="The torii gates">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => torii(230, 610 - i*44, 54 - i*1.5, 50 - i)).join("")}${lab(290, 520, "Torii gates", "#F6D3DC", 10)}</g>`;
  // the raked gravel garden: lines raked round three rocks
  const garden = `<g data-place="zen" aria-label="The gravel garden"><ellipse class="hov" cx="400" cy="372" rx="90" ry="50" style="fill:var(--butter)"/>
    ${sk(`<rect x="304" y="300" width="190" height="130" rx="6" style="fill:#EFEAE0"/>`, `<rect x="304" y="300" width="190" height="130" rx="6"/>`)}
    <g pointer-events="none" fill="none" style="stroke:#C9C1AE" stroke-width="1.2">${Array.from({length: 11}, (_, i) => `<path d="M310 ${308 + i*11} H488"/>`).join("")}${[[350, 340, 12], [430, 360, 16], [400, 404, 10]].map(([x, y, r]) => [1, 2, 3].map(k => `<ellipse cx="${x}" cy="${y}" rx="${r + k*6}" ry="${r*.7 + k*4}" style="fill:#EFEAE0"/>`).join("")).join("")}</g>
    ${sk([[350, 340, 12], [430, 360, 16], [400, 404, 10]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.7}" style="fill:#8A8478"/><ellipse cx="${x - 2}" cy="${y - 3}" rx="${r*.6}" ry="${r*.3}" style="fill:#7E9A5A"/>`).join(""), "")}
    ${lab(400, 448, "Gravel garden", "#EFEAE0", 10)}</g>`;
  // the koi pond, with its little red bridge
  const pond = `<g data-place="koi" aria-label="The koi pond"><ellipse class="hov" cx="110" cy="520" rx="80" ry="34" style="fill:var(--butter)"/>
    ${sk(`<ellipse cx="110" cy="510" rx="78" ry="38" style="fill:${C.water}"/><path d="M70 500 q40 -24 80 0" style="fill:none;stroke:${C.vermilion}" stroke-width="7"/>`, `<ellipse cx="110" cy="510" rx="78" ry="38"/><path d="M70 500 q40 -24 80 0"/>`)}
    ${koi([[80, 520, "#F28C28"], [130, 506, "#FFFDF6"], [110, 530, "#E8566C"]])}${lab(110, 566, "Koi pond", "#DCEBF6", 10)}</g>`;
  const trees = maple(60, 300, 1.1) + maple(470, 230, .9) + sakura(470, 520, 1) + maple(60, 160, .9) + toro(180, 300) + toro(290, 300, .9);
  return defs + lampDefs + ground + hall + garden + pond + trees + tunnel + seasonFx()
    + gate("ktStepsUp", 150, 30, "Higashiyama", 214, 30, "Up the stone steps to the lane and the pagoda")
    + gate("ktToRiverW", 16, 380, "The river", 60, 342, "West along the canal to the river");
}

/* ---------- kt_river: the river and its turtle stones, the market, the willow canal ---------- */
function riverScreen(){
  const ground = `<rect width="520" height="640" style="fill:#C9D3A8"/><rect x="0" y="0" width="520" height="300" fill="url(#ktgrav)"/>${flags("M300 26 V300 M60 300 H420 M260 420 V560 H510", 36)}`;
  // the river across the middle: shallow, with turtle-shaped stepping stones and a heron
  const turtles = [0, 1, 2, 3].map(i => { const x = 262, y = 334 + i*22; return `<ellipse cx="${x}" cy="${y}" rx="16" ry="8" style="fill:#9A9488"/><circle cx="${x + 16}" cy="${y}" r="4" style="fill:#9A9488"/><path d="M${x - 8} ${y} h16 M${x} ${y - 6} v12" style="stroke:#7A7468" stroke-width="1"/>`; }).join("");
  const river = `<g pointer-events="none">${sk(`<path d="M0 318 Q260 306 520 322 V424 Q260 436 0 420z" style="fill:${C.water}"/>`, `<path d="M0 318 Q260 306 520 322 M0 420 Q260 436 520 424"/>`)}
    ${[0, 1, 2, 3, 4].map(i => `<path class="ripple" d="M${40 + i*100} ${350 + (i % 2)*40} q8 -4 16 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.2"/>`).join("")}</g>`;
  const stones = `<g data-place="stones" aria-label="The turtle stepping stones"><ellipse class="hov" cx="262" cy="368" rx="30" ry="50" style="fill:var(--butter)"/>${sk(turtles, "")}${lab(330, 390, "Turtle stones", "#DCEBF6", 9)}</g>`;
  // the covered market: a long arcade with a coloured awning and paper lanterns
  const market = `<g data-place="nishiki" aria-label="The covered market">${shade(30, 76, 230, 96)}
    ${sk(`<rect x="30" y="80" width="230" height="92" style="fill:${C.timber}"/><path d="M24 80 q121 -40 242 0z" style="fill:#EAF2F4" opacity=".9"/><rect x="40" y="110" width="210" height="62" style="fill:#2A221C"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${48 + i*34}" y="${150}" width="26" height="22" style="fill:${["#E8566C", "#F3C969", "#9CC27E", "#F28C28", "#E6DED0", "#8A5A3A"][i]}"/>`).join("")}`,
      `<rect x="30" y="80" width="230" height="92"/><path d="M24 80 q121 -40 242 0z"/>`)}
    <rect x="100" y="88" width="90" height="16" rx="2" style="fill:${C.vermilion};stroke:var(--line)" stroke-width="1"/><text x="145" y="100" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9" fill="${C.paper}" pointer-events="none">MARKET 市場</text>
    ${[60, 110, 180, 230].map(x => chochin(x, 112)).join("")}${lab(145, 192, "Covered market", "#F6E3B4", 10)}</g>`;
  // the canal on the right: willows trailing, a little stone bridge where the path crosses
  const canal = `<g pointer-events="none">${sk(`<rect x="420" y="0" width="46" height="640" style="fill:${C.water}"/><rect x="410" y="540" width="66" height="22" style="fill:${C.stone}"/>`, `<path d="M420 0 V540 M466 0 V540 M420 562 V640 M466 562 V640"/><rect x="410" y="540" width="66" height="22"/>`)}
    ${[120, 260, 470].map(y => `<g>${sk(`<path d="M408 ${y} v-40" style="stroke:#5A4636" stroke-width="3"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${398 + k*6} ${y - 40} q${-2 + k} 30 ${4 - k} 54" style="fill:none;stroke:#8FB46A" stroke-width="3"/>`).join("")}`, `<path d="M408 ${y} v-40"/>`)}</g>`).join("")}</g>`;
  const trees = sakura(80, 560, 1.1) + maple(170, 560, .9) + toro(60, 280, .9) + toro(380, 600, .8);
  return defs + lampDefs + ground + river + canal + market + stones + heron(120, 380) + heron(400, 400) + trees + seasonFx()
    + gate("ktToStationN", 300, 26, "The station", 364, 30, "North along the river to the station")
    + gate("ktToTemple", 504, 520, "Temple", 470, 482, "East over the canal bridge to the temple");
}

export function kyotoArt(scene){
  return scene === "kt_station" ? stationScreen() : scene === "kt_lane" ? laneScreen() : scene === "kt_temple" ? templeScreen() : riverScreen();
}
// The train ride to Kyoto: green hills, pagodas and torii going by
export const kyotoRide = () => `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
  <path d="M0 40 L60 16 L120 34 L190 12 L260 30 L330 10 L400 28 L470 14 L540 30 L600 18 V60 H0z" fill="#9AAFC2"/>
  <path d="M0 60 Q75 36 150 56 T300 56 T450 56 T600 56 V90 H0z" fill="#8FB46A"/><path d="M0 74 Q100 54 200 72 T400 72 T600 72 V90 H0z" fill="#6E9A44"/>
  ${[80, 260, 450].map(x => `<rect x="${x}" y="44" width="10" height="14" fill="#D0452F"/><path d="M${x - 6} 44 h22 l-3 -4 h-16z" fill="#47505A"/><path d="M${x - 4} 38 h18 l-3 -4 h-12z" fill="#47505A"/>`).join("")}
  ${[170, 370, 540].map(x => `<path d="M${x} 66 v-12 M${x + 14} 66 v-12 M${x - 3} 54 h20" stroke="#D0452F" stroke-width="3"/>`).join("")}</g></svg>`;
