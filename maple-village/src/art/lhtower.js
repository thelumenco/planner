// Inside the lighthouse (round 297): three round rooms seen from above, one on top of the other, joined by a spiral
// stair that curls round the wall. Whitewashed stone, small deep windows, and each floor its own:
//   lhtower1  the store room and museum: flagstones, the wreck case, the visitor book on its stand, the tide board,
//             oilskins on pegs, the old fog bell, oil cans; the door out to the point
//   lhtower2  the watch room: boards, the brass telescope at the big window, the log desk, the coast chart, Bram's
//             armchair by the stove
//   lhtower3  the lamp room: glass all the way round, the great lens on its brass stand (turning, with its beam,
//             after dark), and the little door out onto the gallery
import { sk, tapeLabel } from "./scenes.js";

const CX = 260, CY = 360, R = 228;
const spot = (k, label, x, y, w, art, lx, ly, col = "var(--butter)") => `<g data-lhspot="${k}" aria-label="${label}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${w}" ry="${Math.round(w/4.5)}" style="fill:var(--butter)"/>${art}${tapeLabel(lx ?? x, ly ?? y + 22, label, col, 9.5)}</g>`;

// the round room: stone outside, a whitewashed wall ring with deep windows, the floor inside
function shell(floor, night, glass){
  const fl = {1: "#CFC6B8", 2: "#D9B58C", 3: "#C9CDD2"}[floor];
  const wins = (glass ? Array.from({length: 16}, (_, i) => i*22.5) : [-60, 0, 60, 120, 180, 240]).map(a => { const r = a*Math.PI/180, x = CX + Math.sin(r)*(R + 6), y = CY - Math.cos(r)*(R + 6);
    return glass ? `<rect x="${x - 26}" y="${y - 9}" width="52" height="18" rx="2" transform="rotate(${a} ${x} ${y})" style="fill:${night ? "#2E3A5C" : "#BFDCEF"}" opacity=".95"/>`
      : `<rect x="${x - 15}" y="${y - 8}" width="30" height="16" rx="6" transform="rotate(${a} ${x} ${y})" style="fill:${night ? "#2E3A5C" : "#BFDCEF"}"/>`; }).join("");
  const boards = floor === 2 ? `<g opacity=".28" style="stroke:#8A5A3A" stroke-width="1.4">${Array.from({length: 15}, (_, i) => `<path d="M${CX - R} ${CY - R + 22 + i*32} H${CX + R}"/>`).join("")}</g>`
    : floor === 1 ? `<g opacity=".3" fill="none" style="stroke:#8E8478" stroke-width="1.2">${[[140, 210, 90, 60], [250, 230, 100, 70], [120, 420, 110, 70], [330, 470, 90, 60], [220, 330, 80, 60], [380, 300, 70, 60]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>`).join("")}</g>`
    : `<g opacity=".3" fill="none" style="stroke:#9AA2AA" stroke-width="1">${[60, 120, 180].map(r => `<circle cx="${CX}" cy="${CY}" r="${r}"/>`).join("")}</g>`;
  return `<rect width="520" height="640" style="fill:#7E776F"/>
    ${sk(`<circle cx="${CX}" cy="${CY}" r="${R + 20}" style="fill:#F3EEE4"/><circle cx="${CX}" cy="${CY}" r="${R}" style="fill:${fl}"/>`, `<circle cx="${CX}" cy="${CY}" r="${R + 20}"/><circle cx="${CX}" cy="${CY}" r="${R}"/>`)}
    <defs><clipPath id="lhfloor"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath></defs><g clip-path="url(#lhfloor)">${boards}</g>${wins}`;
}
// the spiral stair against the wall: wedge steps fanning round a newel post; up (light) or down (darker, into the well)
function stair(k, x, y, down, label){
  const steps = Array.from({length: 7}, (_, i) => { const a0 = (-100 + i*26)*Math.PI/180, a1 = a0 + 24*Math.PI/180;
    return `<path d="M${x + Math.cos(a0)*12} ${y + Math.sin(a0)*12} L${x + Math.cos(a0)*58} ${y + Math.sin(a0)*58} A58 58 0 0 1 ${x + Math.cos(a1)*58} ${y + Math.sin(a1)*58} L${x + Math.cos(a1)*12} ${y + Math.sin(a1)*12}z" style="fill:${down ? ["#8E8478", "#857B70", "#7C7268", "#736A60", "#6A6158", "#615950", "#585048"][i] : ["#B9AE9E", "#C2B8A9", "#CBC2B4", "#D4CCBF", "#DDD6CA", "#E6E0D5", "#EFEAE0"][i]}"/>`; }).join("");
  return spot(k, label, x, y + 46, 52, sk(`${steps}<circle cx="${x}" cy="${y}" r="12" style="fill:#A8754F"/>`, `<circle cx="${x}" cy="${y}" r="58"/><circle cx="${x}" cy="${y}" r="12"/><path d="M${x} ${y - 58} A58 58 0 0 1 ${x + 58} ${y}" opacity=".5"/>`), x, y + 76, "var(--sky)");
}

/* ---------- the ground floor ---------- */
function ground(o){
  const n = o.curios || 0, cur = ["#8FC79A", "#7FB8E8", "#F4EEE3", "#C9A24A", "#6E625A", "#B8743E", "#3B3530", "#3E6B8C", "#9CC27E", "#F3E2C4", "#DCEAF2", "#D9B060"];
  const caseArt = sk(`<rect x="52" y="250" width="124" height="86" rx="3" style="fill:#8A5A3A"/><rect x="58" y="256" width="112" height="74" style="fill:#DCEAF2" opacity=".9"/><rect x="58" y="282" width="112" height="3" style="fill:#A8754F"/><rect x="58" y="307" width="112" height="3" style="fill:#A8754F"/>
      ${Array.from({length: n}, (_, i) => `<circle cx="${68 + (i % 6)*18}" cy="${276 + Math.floor(i/6)*25}" r="4.5" style="fill:${cur[i % cur.length]}"/>`).join("")}
      ${Array.from({length: Math.min(8, o.bottles || 0)}, (_, i) => `<rect x="${64 + i*13}" y="316" width="6" height="12" rx="2" style="fill:#9CC27E" opacity=".85"/>`).join("")}`,
    `<rect x="52" y="250" width="124" height="86" rx="3"/><rect x="58" y="256" width="112" height="74"/>`);
  const book = sk(`<path d="M290 470 l-8 44 h20 l-8 -44z" style="fill:#8A5A3A"/><path d="M262 452 l32 8 l32 -8 v20 l-32 8 l-32 -8z" style="fill:#FFFDF6"/><path d="M294 460 v20" style="stroke:#A99D8C"/><rect x="318" y="446" width="3" height="16" rx="1" style="fill:#3E6B8C"/>`,
    `<path d="M262 452 l32 8 l32 -8 v20 l-32 8 l-32 -8z"/><path d="M290 480 l-8 34 h20 l-8 -34"/><path d="M268 462 l20 4 M300 466 l20 -4" opacity=".5"/>`);
  const tide = sk(`<rect x="214" y="150" width="92" height="56" rx="3" style="fill:#3B4A44"/><rect x="210" y="146" width="100" height="64" rx="4" fill="none" style="stroke:#A8754F" stroke-width="5"/>`, `<rect x="210" y="146" width="100" height="64" rx="4"/>`)
    + `<text x="260" y="166" text-anchor="middle" font-family="Klee One,serif" font-size="9" fill="#FFFDF6" pointer-events="none">TIDES</text><text x="260" y="182" text-anchor="middle" font-family="Klee One,serif" font-size="7.5" fill="#FFFDF6" pointer-events="none">low 6 to 11am</text><text x="260" y="195" text-anchor="middle" font-family="Klee One,serif" font-size="7.5" fill="#FFFDF6" pointer-events="none">and 5 to 8pm</text>`;
  const coat = (x, c) => `<path d="M${x - 10} 186 q10 -6 20 0 l4 40 h-28z" style="fill:${c}"/><path d="M${x - 6} 180 q6 -10 12 0z" style="fill:${c}"/>`;
  const pegs = sk(`<rect x="88" y="176" width="84" height="6" rx="2" style="fill:#8A5A3A"/>${coat(104, "#F3C969")}${coat(132, "#F3C969")}${coat(158, "#E8B86A")}`, `<rect x="88" y="176" width="84" height="6" rx="2"/><path d="M94 186 q10 -6 20 0 l4 40 h-28z M122 186 q10 -6 20 0 l4 40 h-28z M148 186 q10 -6 20 0 l4 40 h-28z"/>`);
  const bell = sk(`<path d="M352 352 v-22 h56 v22" fill="none" style="stroke:#6B4A36" stroke-width="5"/><path d="M366 360 q0 -26 14 -26 q14 0 14 26 l4 8 h-36z" style="fill:#D9A441"/><circle cx="380" cy="372" r="4" style="fill:#A8754F"/>`, `<path d="M352 352 v-22 h56 v22"/><path d="M366 360 q0 -26 14 -26 q14 0 14 26 l4 8 h-36z"/>`);
  const cans = `<g pointer-events="none">${sk(`<rect x="372" y="500" width="22" height="30" rx="3" style="fill:#7FA36E"/><rect x="398" y="508" width="18" height="22" rx="3" style="fill:#C8432F"/><circle cx="160" cy="530" r="20" style="fill:#C9A27E"/><circle cx="160" cy="530" r="12" style="fill:#B98A5A"/>`, `<rect x="372" y="500" width="22" height="30" rx="3"/><rect x="398" y="508" width="18" height="22" rx="3"/><circle cx="160" cy="530" r="20"/><circle cx="160" cy="530" r="12"/>`)}</g>`;
  const door = `<g data-lhspot="out" aria-label="Out to the point"><ellipse class="hov" cx="260" cy="606" rx="42" ry="12" style="fill:var(--butter)"/>${sk(`<rect x="232" y="584" width="56" height="18" rx="3" style="fill:#2F4A6B"/>`, `<rect x="232" y="584" width="56" height="18" rx="3"/>`)}${tapeLabel(260, 574, "Out to the point", "var(--sky)", 10)}</g>`;
  return shell(1, o.night) + cans
    + spot("case", "The wreck case", 114, 348, 70, caseArt) + spot("book", "Visitor book", 294, 520, 48, book, 294, 540) + spot("tide", "Tide board", 260, 222, 56, tide, 260, 232, "var(--sage)")
    + spot("pegs", "Oilskins", 130, 236, 52, pegs, 130, 246, "var(--peach)") + spot("bell", "The fog bell", 380, 384, 40, bell) + stair("up", 392, 244, false, "Up the stairs") + door;
}

/* ---------- the watch room ---------- */
function watch(o){
  const scope = sk(`<path d="M260 230 l-20 40 M260 230 l20 40 M260 230 v42" style="stroke:#6B4A36" stroke-width="4"/><rect x="236" y="206" width="56" height="13" rx="6" transform="rotate(-22 264 212)" style="fill:#D9A441"/><circle cx="240" cy="222" r="5" style="fill:#3B3530"/>`,
    `<rect x="236" y="206" width="56" height="13" rx="6" transform="rotate(-22 264 212)"/><path d="M260 230 l-20 40 M260 230 l20 40 M260 230 v42"/>`);
  const logs = (o.logDays || 0) > 0;
  const desk = sk(`<rect x="62" y="300" width="112" height="56" rx="3" style="fill:#A8754F"/><path d="M92 314 l26 -5 l26 5 v20 l-26 5 l-26 -5z" style="fill:#FFFDF6"/><path d="M118 309 v30" style="stroke:#A99D8C"/>${logs ? `<path d="M96 318 h18 M96 324 h16 M96 330 h18 M122 318 h18" style="stroke:#3B3530" stroke-width=".8" opacity=".6"/>` : ""}<rect x="150" y="306" width="6" height="18" rx="2" style="fill:#F3C969"/>`,
    `<rect x="62" y="300" width="112" height="56" rx="3"/><path d="M92 314 l26 -5 l26 5 v20 l-26 5 l-26 -5z"/>`);
  const chart = sk(`<rect x="86" y="160" width="96" height="62" rx="2" style="fill:#F3E7C9"/><path d="M92 210 q20 -30 40 -10 q20 18 44 -28" fill="none" style="stroke:#7AB3D6" stroke-width="10" opacity=".7"/><path d="M96 178 q10 8 24 2 M150 196 q8 -6 18 0" fill="none" style="stroke:#9CC27E" stroke-width="3"/><circle cx="158" cy="176" r="3" style="fill:#C8432F"/>`,
    `<rect x="86" y="160" width="96" height="62" rx="2"/>`);
  const chair = sk(`<rect x="356" y="400" width="66" height="52" rx="12" style="fill:#7A9CC6"/><rect x="348" y="408" width="16" height="44" rx="7" style="fill:#6A8CB6"/><rect x="414" y="408" width="16" height="44" rx="7" style="fill:#6A8CB6"/>`,
    `<rect x="356" y="400" width="66" height="52" rx="12"/><rect x="348" y="408" width="16" height="44" rx="7"/><rect x="414" y="408" width="16" height="44" rx="7"/>`);
  const stove = `<g pointer-events="none">${sk(`<rect x="440" y="440" width="34" height="40" rx="4" style="fill:#3B3530"/><rect x="452" y="414" width="8" height="28" style="fill:#4A4642"/><rect x="446" y="456" width="22" height="14" rx="2" style="fill:${o.night || o.bram ? "#F2A65A" : "#5A524C"}"/><rect x="434" y="488" width="22" height="10" rx="3" style="fill:#7FA36E"/>`, `<rect x="440" y="440" width="34" height="40" rx="4"/><rect x="452" y="414" width="8" height="28"/>`)}</g>`;
  return shell(2, o.night) + stove
    + spot("scope", "The telescope", 262, 286, 46, scope) + spot("log", "The weather log", 118, 372, 62, desk) + spot("chart", "Your spotting list", 134, 236, 56, chart, 134, 240, "var(--sage)")
    + spot("chair", "Bram's armchair", 388, 466, 48, chair, 388, 478, "var(--peach)") + stair("up", 392, 222, false, "Up to the lamp") + stair("down", 168, 500, true, "Down the stairs");
}

/* ---------- the lamp room ---------- */
function lamp(o){
  const prisms = Array.from({length: 7}, (_, i) => `<ellipse cx="260" cy="${300 + i*10}" rx="${44 - Math.abs(i - 3)*7}" ry="5" fill="none" style="stroke:#9FC3D9" stroke-width="2.2" opacity=".9"/>`).join("");
  const beam = o.night ? `<g class="lhspin" pointer-events="none"><path d="M260 330 L520 270 L520 390z" fill="#FFE9A0" opacity=".28"/><path d="M260 330 L0 270 L0 390z" fill="#FFE9A0" opacity=".2"/></g>` : "";
  const lens = sk(`<rect x="226" y="372" width="68" height="34" rx="4" style="fill:#C9A24A"/><rect x="236" y="404" width="48" height="18" style="fill:#A8754F"/><path d="M214 330 q0 -56 46 -62 q46 6 46 62 q0 40 -46 44 q-46 -4 -46 -44z" style="fill:${o.night ? "#FFE9A0" : "#E6F1F7"}" opacity=".95"/>${prisms}${o.night ? `<circle cx="260" cy="332" r="16" style="fill:#FFF6D0"/>` : `<path d="M236 304 q8 -14 20 -18" fill="none" style="stroke:#FFFDF6" stroke-width="3" stroke-linecap="round"/>`}`,
    `<path d="M214 330 q0 -56 46 -62 q46 6 46 62 q0 40 -46 44 q-46 -4 -46 -44z"/><rect x="226" y="372" width="68" height="34" rx="4"/><path d="M236 422 h48"/>`);
  const rail = `<g pointer-events="none" fill="none" style="stroke:#A8754F" stroke-width="3" opacity=".7"><circle cx="260" cy="340" r="100"/></g>`;
  const gdoor = `<g data-lhspot="gallery" aria-label="Out onto the gallery"><ellipse class="hov" cx="104" cy="366" rx="36" ry="12" style="fill:var(--butter)"/>${sk(`<rect x="72" y="318" width="20" height="56" rx="3" style="fill:#2F4A6B"/><rect x="76" y="326" width="12" height="18" rx="2" style="fill:${o.night ? "#2E3A5C" : "#BFDCEF"}"/>`, `<rect x="72" y="318" width="20" height="56" rx="3"/>`)}${tapeLabel(112, 392, "The gallery", "var(--sky)", 9.5)}</g>`;
  return shell(3, o.night, true) + beam + rail + spot("lens", o.night ? "The lamp" : "The great lens", 260, 430, 60, lens, 260, 452, "var(--butter)") + gdoor + stair("down", 376, 512, true, "Down the stairs");
}

export function towerArt(floor, o = {}){ return floor === "lhtower1" ? ground(o) : floor === "lhtower2" ? watch(o) : lamp(o); }
