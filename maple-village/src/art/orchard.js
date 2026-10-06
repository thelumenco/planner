// Ma Ma's orchard and flower farm: the two screens west of home, their trees, beds and bushes, and the potted flowers
// Mel can set around the village. Reads live state through the art context (G.F()).
import { ink, esc } from "../util.js";
import { sk, tapeLabel, tree, flowers, house, artCtx } from "./scenes.js";
import { streetLamp, lampDefs } from "./village-extras.js";
import { TREES, FLOWERS, TREE_ROWS, TREE_XS, BUSH_Y, BED_ROWS, FLOWER_XS } from "../data/orchard.js";
import { orchState, stateOf } from "../game/orchard.js";
import { orchardRiver } from "./field.js";

const W = `filter="url(#wob)" ${ink}`;

/* ---------- a tree, a bed, a bush (base at 0,0) ---------- */
// stage: "growing" (a sapling), "budding" (green fruit or blossom), "ripe", "faded" (bare, end of its season)
function treeBody(id, stage, g){
  const T = TREES[id] || {col: "#D9433A"};
  const trunk = `<path d="M-3 0 L-2.4 -26 L2.4 -26 L3 0z" style="fill:var(--wood)"/>`;
  if (stage === "growing") { const s = .45 + .4*(g || 0);
    return `<g transform="scale(${s.toFixed(2)})">${trunk}<circle cx="0" cy="-34" r="11" style="fill:#8DB86B"/><circle cx="-8" cy="-28" r="7" style="fill:#6E9F57"/><circle cx="8" cy="-29" r="7" style="fill:#6E9F57"/></g>`; }
  if (stage === "faded") return `${trunk}<path d="M0 -24 L-12 -40 M0 -26 L10 -42 M-6 -32 L-14 -30 M5 -34 L13 -33" fill="none" stroke-width="2" style="stroke:var(--wood)"/>
    <ellipse cx="-12" cy="-41" rx="3" ry="2" style="fill:#C9A06A"/><ellipse cx="11" cy="-43" rx="3" ry="2" style="fill:#B98A5A"/><ellipse cx="-6" cy="2" rx="4" ry="1.6" style="fill:#C9A06A"/>`;
  const fruit = stage === "ripe" ? T.col : stage === "budding" ? (T.bloom || "#B9D88A") : null;
  const dots = fruit ? [[-10, -38], [6, -44], [12, -32], [-4, -28], [-14, -28], [2, -36], [10, -24]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${stage === "ripe" ? 3.2 : 2.2}" style="fill:${fruit}"/>`).join("") : "";
  return `${trunk}<circle cx="0" cy="-38" r="16" style="fill:#8DB86B"/><circle cx="-12" cy="-30" r="11" style="fill:#6E9F57"/><circle cx="12" cy="-31" r="11" style="fill:#6E9F57"/>${dots}`;
}
function bedBody(id, stage, g){
  const c = (FLOWERS[id] || {col: "#E86A7C"}).col, soil = `<ellipse cx="0" cy="0" rx="32" ry="9" style="fill:#9C7A5C"/>`;
  const xs = [-20, -10, 0, 10, 20];
  if (!id) return soil;
  if (stage === "faded") return soil + xs.map(x => `<path d="M${x} -1 q2 -8 6 -6" fill="none" style="stroke:#A88A5A"/>`).join("");
  const h = stage === "growing" ? 5 + 10*(g || 0) : 20;
  const stems = xs.map((x, k) => `<path d="M${x} -1 v${-h - (k % 2)*3}" fill="none" style="stroke:var(--moss2)"/><ellipse cx="${x - 3}" cy="${-h*.45}" rx="3" ry="1.6" style="fill:var(--moss)"/>`).join("");
  const heads = stage === "ripe" ? xs.map((x, k) => `<circle cx="${x}" cy="${-h - (k % 2)*3 - 2}" r="5.2" style="fill:${c}"/><circle cx="${x}" cy="${-h - (k % 2)*3 - 2}" r="1.9" style="fill:#FFF0B8"/>`).join("")
    : stage === "budding" ? xs.map((x, k) => `<ellipse cx="${x}" cy="${-h - (k % 2)*3 - 1}" rx="2" ry="3" style="fill:var(--moss)"/><path d="M${x - 1} ${-h - (k % 2)*3 - 3} h2" style="stroke:${c}"/>`).join("") : "";
  return soil + stems + heads;
}
function bushBody(id, stage, g){
  const c = (FLOWERS[id] || {col: "#E8566C"}).col;
  if (!id) return `<ellipse cx="0" cy="0" rx="22" ry="6" style="fill:#9C7A5C"/>`;
  if (stage === "faded") return `<ellipse cx="0" cy="0" rx="22" ry="6" style="fill:#9C7A5C"/><path d="M-12 -2 L-4 -18 M0 -2 L2 -22 M10 -2 L6 -18" fill="none" style="stroke:#A88A5A"/>`;
  const s = stage === "growing" ? .5 + .45*(g || 0) : 1;
  const dots = stage === "ripe" ? [[-12, -14], [-4, -22], [6, -20], [13, -12], [0, -12], [-8, -6], [9, -5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" style="fill:${c}"/>`).join("")
    : stage === "budding" ? [[-10, -14], [2, -20], [12, -11], [-2, -8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" style="fill:${c}" opacity=".6"/>`).join("") : "";
  return `<g transform="scale(${s.toFixed(2)})"><ellipse cx="0" cy="-12" rx="22" ry="15" style="fill:#6E9F57"/><ellipse cx="-8" cy="-16" rx="12" ry="9" style="fill:#8DB86B"/>${dots}</g>`;
}
// standalone pictures for the panels
const pictureBox = (body, size, off, vb = "-34 -64 68 70") => `<svg class="vybottle" viewBox="${vb}" width="${size}" height="${Math.round(size*70/68)}" aria-hidden="true"><g ${W} ${off ? 'opacity=".4"' : ""}>${body}</g></svg>`;
export const treePic = (id, stage, size = 60, off) => pictureBox(treeBody(id, stage, .6), size, off);
export const flowerPic = (id, stage, bush, size = 60, off) => pictureBox(bush ? bushBody(id, stage, .6) : bedBody(id, stage, .6), size, off, bush ? "-30 -40 60 46" : "-36 -32 72 42");

/* ---------- potted flowers around the village ---------- */
// style: "box" (window box), "basket" (hanging basket), "pot" (terracotta pot), "vase" (glass vase)
export function potArt(x, y, flower, style){
  const c = (FLOWERS[flower] || {col: "#E86A7C"}).col;
  const heads = (pts, r) => pts.map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" style="fill:${c}"/><circle cx="${x + dx}" cy="${y + dy}" r="${r*.35}" style="fill:#FFF0B8"/>`).join("");
  if (style === "box") return `<g ${W} pointer-events="none"><path d="M${x-14} ${y-4} h28 l-2 8 h-24z" style="fill:#C46A4A"/>${heads([[-9, -8], [0, -10], [9, -8]], 3.4)}</g>`;
  if (style === "basket") return `<g ${W} pointer-events="none"><path d="M${x} ${y-26} L${x-8} ${y-8} M${x} ${y-26} L${x+8} ${y-8}" fill="none" stroke-width="1"/><path d="M${x-10} ${y-8} q10 12 20 0z" style="fill:#B98A5A"/>${heads([[-6, -11], [0, -14], [6, -11]], 3)}<path d="M${x-7} ${y-6} q-2 6 -1 9 M${x+6} ${y-6} q2 6 1 8" fill="none" style="stroke:var(--moss2)"/></g>`;
  if (style === "vase") return `<g ${W} pointer-events="none"><path d="M${x} ${y-12} v-10 M${x-5} ${y-12} l-3 -10 M${x+5} ${y-12} l3 -10" fill="none" style="stroke:var(--moss2)"/>${heads([[-8, -23], [0, -25], [8, -23]], 3.4)}<path d="M${x-6} ${y} q-2 -8 2 -13 h8 q4 5 2 13z" style="fill:#CFE3EC" opacity=".9"/></g>`;
  return `<g ${W} pointer-events="none"><path d="M${x} ${y-14} v-6" fill="none" style="stroke:var(--moss2)"/>${heads([[-7, -18], [0, -22], [7, -18]], 3.6)}<path d="M${x-9} ${y-14} h18 l-3 14 h-12z" style="fill:#C46A4A"/></g>`;
}
// the pots that are out in this scene (F.pots: {spot: flower})
export function potsIn(scene){
  const P = (artCtx().F().pots) || {};
  const at = {base: [["window", 293, 258, "box"], ["basket", 196, 262, "basket"]], vineyard: [["shop", 340, 224, "pot"]], room: [["vase", 452, 516, "vase"]]}[scene] || [];
  return at.filter(([s]) => P[s]).map(([s, x, y, style]) => potArt(x, y, P[s], style)).join("");
}

/* ---------- the screens ---------- */
const archGate = (id, x, y, label, lx, ly, col, aria) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="22" style="fill:var(--butter)"/>
    ${sk(`<rect x="${x-18}" y="${y-30}" width="6" height="40" style="fill:var(--wood)"/><rect x="${x+12}" y="${y-30}" width="6" height="40" style="fill:var(--wood)"/><path d="M${x-22} ${y-26} q22 -16 44 0 v6 q-22 -14 -44 0z" style="fill:#9CC27E"/><circle cx="${x-10}" cy="${y-24}" r="2.2" style="fill:#E8566C"/><circle cx="${x+9}" cy="${y-25}" r="2.2" style="fill:#F3C969"/>`,
      `<rect x="${x-18}" y="${y-30}" width="6" height="40"/><rect x="${x+12}" y="${y-30}" width="6" height="40"/><path d="M${x-22} ${y-26} q22 -16 44 0 v6 q-22 -14 -44 0z"/>`)}
    ${tapeLabel(lx, ly, label, col, 11)}</g>`;
// a hedge along the top; gap: [from, to] x range left open (the orchard's path up to the field)
const hedgeRow = gap => `<g ${W}>${Array.from({length: 14}, (_, i) => i*40 + 10).filter(x => !gap || x < gap[0] || x > gap[1]).map((x, k) => `<ellipse cx="${x}" cy="${118 + (Math.round((x - 10)/40) % 2)*4}" rx="26" ry="18" style="fill:var(--tree2)"/>`).join("")}</g>`;
const hedge = hedgeRow();

export function orchardArt(){
  const o = orchState(artCtx().F()), today = artCtx().day();
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="260" cy="470" rx="230" ry="130" style="fill:var(--grass2)"/><ellipse cx="400" cy="60" rx="140" ry="50" style="fill:var(--grass2)"/></g>
    ${tree(40, 50, .8)}${tree(160, 40, .7)}${tree(300, 46, .75)}${orchardRiver}${hedgeRow([200, 300])}
    <g filter="url(#wob)"><path d="M260 150 V270 M0 270 H520 M132 270 V236 M415 270 V252 M160 270 V610 M260 270 V610 M360 270 V610" fill="none" style="stroke:var(--path)" stroke-width="20" stroke-linecap="round"/></g>
    ${flowers([[200, 150, "#EFA3A6"], [230, 160, "#F3C969"], [300, 150, "#C3CDEE"], [30, 600, "#EFA3A6"], [490, 600, "#F3C969"], [470, 330, "#C3CDEE"]])}`;
  const cottage = house("cottage", 74, 152, 116, 72, "#FFF6E8", "#C2505F", "Ma Ma's cottage", "var(--blush)",
    {art: `<rect x="84" y="200" width="22" height="14" rx="2" style="fill:#9CC27E"/><circle cx="90" cy="200" r="3" style="fill:#E8566C"/><circle cx="98" cy="199" r="3" style="fill:#F3C969"/>`, lines: `<rect x="84" y="200" width="22" height="14" rx="2"/><path d="M156 120 v-16 h10 v22"/><path class="smoke" d="M161 100 q-4 -6 0 -11 q4 -5 0 -10" opacity=".6"/>`});
  const shop = `<g data-place="farmshop" aria-label="Farm shop"><ellipse class="hov" cx="415" cy="246" rx="62" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="358" y="186" width="114" height="50" rx="3" style="fill:#C9A27E"/><path d="M350 186 h130 l-8 -26 h-114z" style="fill:#F3C969"/><path d="M366 160 l-6 26 M392 160 l-4 26 M418 160 v26 M444 160 l4 26 M470 160 l6 26" style="stroke:#E8566C" stroke-width="6"/>
      <rect x="366" y="196" width="30" height="16" rx="2" style="fill:#B98A5A"/><rect x="402" y="196" width="30" height="16" rx="2" style="fill:#B98A5A"/><rect x="438" y="196" width="26" height="16" rx="2" style="fill:#8FB3E8"/>
      ${[[372, 196, "#D9433A"], [380, 194, "#F08A3C"], [388, 196, "#D9433A"], [408, 196, "#F3D34A"], [416, 194, "#C9D36A"], [424, 196, "#F3D34A"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.5" style="fill:${c}"/>`).join("")}
      ${[[444, 190, "#E8566C"], [451, 186, "#F3C33A"], [458, 190, "#C9A3E0"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.4" style="fill:${c}"/>`).join("")}`,
      `<rect x="358" y="186" width="114" height="50" rx="3"/><path d="M350 186 h130 l-8 -26 h-114z"/><rect x="366" y="196" width="30" height="16" rx="2"/><rect x="402" y="196" width="30" height="16" rx="2"/><rect x="438" y="196" width="26" height="16" rx="2"/><path d="M444 196 v-6 M451 196 v-10 M458 196 v-6"/>`)}
    ${o.tin ? `<g pointer-events="none" ${W}><rect x="458" y="174" width="12" height="9" rx="2" style="fill:var(--honey)"/></g>` : ""}
    ${tapeLabel(415, 264, "Farm shop", "var(--butter)", 11)}</g>`;
  const trees = TREE_ROWS.map((y, r) => TREE_XS.map((x, c) => { const i = r*4 + c, p = o.trees[i], st = stateOf("tree", p, today);
    return `<g data-tree="${i}" aria-label="Tree spot ${i + 1}"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="30" ry="9" style="fill:var(--butter)"/>
      ${p ? `<g transform="translate(${x} ${y}) scale(1.25)" ${W}>${treeBody(p.k, st.stage, st.g)}</g>` : `<g ${W}><ellipse cx="${x}" cy="${y}" rx="14" ry="5" style="fill:#B08A6A"/><path d="M${x-4} ${y-1} q4 -3 8 0" opacity=".5"/></g>`}</g>`; }).join("")).join("");
  return lampDefs + ground + cottage + shop
    + archGate("toFieldO", 260, 150, "The field", 316, 182, "var(--peri)", "Path to the field and the lake")
    + archGate("toBaseO", 500, 270, "Home", 474, 316, "var(--butter)", "Gate home")
    + archGate("toFlowers", 20, 270, "Flower farm", 70, 300, "var(--blush)", "Gate to the flower farm")
    + [[220, 252], [312, 252]].map(([x, y]) => streetLamp(x, y)).join("") + trees;
}
export function flowerFarmArt(){
  const o = orchState(artCtx().F()), today = artCtx().day();
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="260" cy="440" rx="230" ry="140" style="fill:var(--grass2)"/></g>
    ${tree(40, 50, .8)}${tree(170, 44, .7)}${tree(330, 50, .75)}${tree(480, 44, .8)}${hedge}
    <g filter="url(#wob)"><path d="M60 285 H520 M160 285 V600 M260 285 V600 M360 285 V600" fill="none" style="stroke:var(--path)" stroke-width="18" stroke-linecap="round"/></g>
    ${flowers([[30, 200, "#EFA3A6"], [44, 214, "#F3C969"], [30, 600, "#C3CDEE"], [490, 600, "#EFA3A6"], [480, 400, "#F3C969"], [40, 420, "#C3CDEE"]])}
    <g ${W}><rect x="20" y="470" width="44" height="8" rx="2" style="fill:var(--wood)"/><path d="M24 478 v14 M60 478 v14 M20 470 v-14 h44 v14" fill="none"/>
      <path d="M470 236 q8 -10 16 0 v12 h-16z" style="fill:var(--peri)"/><path d="M486 240 q8 -4 10 -10" fill="none"/></g>`;
  const bushes = FLOWER_XS.map((x, i) => { const p = o.bushes[i], st = stateOf("bush", p, today);
    return `<g data-bush="${i}" aria-label="Bush spot ${i + 1}"><ellipse class="hov" cx="${x}" cy="${BUSH_Y + 4}" rx="28" ry="8" style="fill:var(--butter)"/><g transform="translate(${x} ${BUSH_Y})" ${W}>${bushBody(p && p.k, st.stage, st.g)}</g></g>`; }).join("");
  const beds = BED_ROWS.map((y, r) => FLOWER_XS.map((x, c) => { const i = r*4 + c, p = o.beds[i], st = stateOf("bed", p, today);
    return `<g data-bed="${i}" aria-label="Flower bed ${i + 1}"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="36" ry="10" style="fill:var(--butter)"/><g transform="translate(${x} ${y})" ${W}>${bedBody(p && p.k, st.stage, st.g)}</g></g>`; }).join("")).join("");
  return lampDefs + ground + archGate("toOrchardF", 500, 285, "Orchard", 466, 316, "var(--sage)", "Gate to the orchard")
    + tapeLabel(260, 168, "Ma Ma's flower farm", "var(--blush)", 12) + bushes + beds;
}
// home base: the gate at the top left, along the path to the orchard
export function orchardGate(){
  return `<g filter="url(#wob)"><path d="M14 170 C80 172 150 210 214 300" fill="none" style="stroke:var(--path)" stroke-width="18" stroke-linecap="round"/></g>`
    + archGate("toOrchard", 24, 170, "Orchard", 74, 200, "var(--sage)", "Gate to Ma Ma's orchard");
}
