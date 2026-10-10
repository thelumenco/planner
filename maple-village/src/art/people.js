// Villager sprite builder. Same rig as Mel/Evan (.flip > .bob > .legL/.legR/.armL/.armR) so the walk CSS animates it.
// Origin is at the feet. `look`: {skin, hair, hairStyle, top, bottom, extra}; kid=true draws Evan-sized.

const S = (c) => `style="fill:${c}"`;

function hair(style, c, k){
  // k = head radius scale; head centre is at (0, -46k) for adults
  const y = -46*k, r = 10.6*k;
  switch (style){
    case "bun": return `<circle cx="0" cy="${y - r - 3*k}" r="${5*k}" ${S(c)}/>` + cap(c, y, r);
    // a bob with a straight-cut fringe (Mel's mum): the bob behind, the fringe drawn over the forehead (see fringe)
    case "bobfringe":
    case "bob": return `<path d="M${-r-1.2} ${y+1} c-1 -12 5 -16 ${r+1} -16 c7 0 ${r+2} 4 ${r+1.6} 16 l0 ${7*k} l${-4*k} 0 l0 ${-8*k} c-4 -1 -12 -1 -16 -3 l0 ${11*k} l${-4*k} 0z" ${S(c)}/>`;
    case "long": return `<path d="M${-r-1} ${y} c-1 -12 5 -16 ${r+1} -16 c7 0 ${r+2} 4 ${r+1} 16 l1 ${18*k} l${-5*k} 0 l-1 ${-16*k} c-4 -2 -11 -2 -15 -5 l-1 ${21*k} l${-5*k} 0z" ${S(c)}/>`;
    case "spiky": return `<path d="M${-r} ${y-1} l-1 -6 l4 2 l1 -6 l4 4 l3 -6 l3 6 l4 -4 l1 6 l4 -2 l-1 6 c-4 -3 -16 -3 -22 0z" ${S(c)}/>`;
    // short curls: a cap with little round curls all over the top
    case "curly": return cap(c, y, r) + [[-9, -3], [-6.5, -8.5], [-1.5, -11], [3.5, -10.5], [8, -7], [10, -2], [-10.4, 2], [10.4, 2]].map(([dx, dy]) => `<circle cx="${dx*k}" cy="${y + dy*k}" r="${3.3*k}" ${S(c)}/>`).join("");
    default: return cap(c, y, r);
  }
}
const fringe = (c, y, r, k) => `<path d="M${-r-.4} ${y-2.6*k} h${2*r+.8} c0 -7 -4 -11.4 ${-r} -11.4 c-6.4 0 ${-r} 4.4 ${-r} 11.4z" ${S(c)}/>`;
// a paddleboard (stand-up paddling): the board under the feet and a paddle in the right hand
// round 134, Cinque Terre: Mum's beach towel, drawn upright under her so it lies flat when she does (act-sunbathe)
const towel = k => `<rect x="${-11*k}" y="${-64*k}" width="${22*k}" height="${68*k}" rx="2" style="fill:#3E9BC7"/>${[0, 1, 2, 3].map(i => `<path d="M${-11*k} ${(-54 + i*16)*k} h${22*k}" fill="none" stroke-width="${3*k}" style="stroke:#FFFDF6"/>`).join("")}`;
const board = k => `<ellipse cx="0" cy="${-1*k}" rx="${22*k}" ry="${3.6*k}" style="fill:#F3C969"/><path d="M${-18*k} ${-1*k} h${36*k}" fill="none" stroke-width=".8" style="stroke:#E8566C"/>`;
const paddle = k => `<path d="M${12*k} ${-30*k} l${5*k} ${32*k}" fill="none" stroke-width="1.6" style="stroke:#8A5A3A"/><path d="M${16*k} ${-2*k} l${2*k} ${8*k} l${3*k} ${-1*k} l${-2*k} ${-8*k}z" ${S("#7FB8E8")}/>`;
const cap = (c, y, r) => `<path d="M${-r-.2} ${y+1} c-1 -9 4 -14 ${r} -14 c6 0 ${r+1} 4 ${r} 14 c-3 -4 -8 -5 -12 -4 c-3 0 -6 2 -8 4z" ${S(c)}/>`;

function extra(kind, look, k){
  const y = -46*k, r = 10.6*k;
  switch (kind){
    case "apron": return `<path d="M${-6*k} ${-30*k} h${12*k} l${1.5*k} ${15*k} h${-15*k}z" ${S("#FFFDF6")}/><path d="M${-5*k} ${-31*k} l${-2*k} ${-5*k} M${5*k} ${-31*k} l${2*k} ${-5*k}" fill="none"/>`;
    case "specs": return `<g style="stroke:#1E1A18"><rect x="${-6.6*k}" y="${y}" width="${5.4*k}" height="${3.8*k}" rx="1" fill="none" stroke-width="1.3"/><rect x="${1.2*k}" y="${y}" width="${5.4*k}" height="${3.8*k}" rx="1" fill="none" stroke-width="1.3"/><path d="M${-1.2*k} ${y + 1.4*k} h${2.4*k}" fill="none" stroke-width="1.1"/></g>`;   // Jason's black frames (round 135), whatever's in his hands
    case "glasses": return `<circle cx="${-3.8*k}" cy="${y+2}" r="${2.6*k}" fill="none" stroke-width=".9"/><circle cx="${3.8*k}" cy="${y+2}" r="${2.6*k}" fill="none" stroke-width=".9"/><path d="M${-1.2*k} ${y+2} h${2.4*k}" fill="none" stroke-width=".9"/>`;
    case "cap": return `<path d="M${-r} ${y-3} c0 -8 ${r*2} -8 ${r*2} 0z" ${S(look.top)}/><path d="M${r-2} ${y-3} h${7*k}" stroke-width="2.2" style="stroke:${look.top}"/>`;
    case "sunhat": return `<ellipse cx="0" cy="${y-6*k}" rx="${16*k}" ry="${3.6*k}" ${S("#F3DFA6")}/><path d="M${-8*k} ${y-6*k} c0 -10 ${16*k} -10 ${16*k} 0z" ${S("#F3DFA6")}/><path d="M${-8*k} ${y-7.5*k} h${16*k}" style="stroke:var(--rose)" stroke-width="1.6"/>`;
    case "helmet": return `<path d="M${-r-1} ${y-1} c0 -12 ${r*2+2} -12 ${r*2+2} 0z" ${S("#F6E3A1")}/><path d="M${-2*k} ${y-11*k} v${8*k} M${3*k} ${y-11*k} v${8*k}" fill="none" stroke-width=".8"/>`;
    case "tie": return `<path d="M0 ${-35*k} l${-1.6*k} ${3*k} l${1.6*k} ${8*k} l${1.6*k} ${-8*k}z" ${S("#C2505F")}/>`;
    case "satchel": return `<path d="M${-7*k} ${-35*k} l${14*k} ${16*k}" fill="none" stroke-width="1.6" style="stroke:#8A5A3A"/><rect x="${5*k}" y="${-22*k}" width="${8*k}" height="${7*k}" rx="1.5" ${S("#C9A27E")}/>`;
    case "bell": return `<path d="M${11*k} ${-30*k} l${4*k} ${-6*k}" fill="none"/><path d="M${13*k} ${-37*k} c0 -5 ${6*k} -5 ${6*k} 0 l1 ${3*k} h${-8*k}z" ${S("#F3C969")}/>`;
    // held in the right hand (hand at about (10k, -21k))
    case "can": return `<path d="M${13*k} ${-24*k} q${5*k} ${-7*k} ${10*k} 0" fill="none"/><rect x="${11*k}" y="${-24*k}" width="${12*k}" height="${9*k}" rx="2" ${S("#9CC3E0")}/><path d="M${23*k} ${-20*k} l${7*k} ${-6*k}" fill="none" stroke-width="1.6"/><g class="drips"><circle cx="${31*k}" cy="${-21*k}" r="${1*k}" ${S("var(--water)")}/><circle cx="${33*k}" cy="${-15*k}" r="${1*k}" ${S("var(--water)")}/></g>`;
    case "hammer": return `<g class="tool"><path d="M${10*k} ${-20*k} l${6*k} ${-14*k}" fill="none" stroke-width="2.2" style="stroke:#8A5A3A"/><rect x="${12*k}" y="${-38*k}" width="${10*k}" height="${5*k}" rx="1" transform="rotate(24 ${17*k} ${-35.5*k})" ${S("var(--stone)")}/></g>`;
    case "cone": return `<path d="M${9.5*k} ${-23*k} l${3*k} ${10*k} l${3*k} ${-10*k}z" ${S("#E8C48E")}/><circle cx="${12.5*k}" cy="${-25*k}" r="${3.6*k}" ${S(["#F4C7CF", "#C3E8B8", "#F3E27A", "#FFF6DC"][Math.round(k*7 + (look.top || "").length) % 4])}/>`;
    case "hoe": return `<g class="tool"><path d="M${16*k} ${-48*k} l${-4*k} ${46*k}" fill="none" stroke-width="2" style="stroke:#8A5A3A"/><path d="M${12*k} ${-2*k} h${-8*k} l${1*k} ${3*k} h${7*k}z" ${S("var(--stone)")}/></g>`;
    case "rod": return `<path d="M${9*k} ${-22*k} L${34*k} ${-56*k}" fill="none" stroke-width="${1.8*k}" style="stroke:#8A5A3A"/><circle cx="${13*k}" cy="${-27*k}" r="${2.2*k}" ${S("#F3C969")}/><path d="M${34*k} ${-56*k} Q${39*k} ${-30*k} ${42*k} ${-4*k}" fill="none" stroke-width=".6"/><circle cx="${42*k}" cy="${-4*k}" r="${2.2*k}" ${S("#E8566C")}/>`;
    // round 107, for Ronda: Manolo's guitar, Dad's (and Lucía's) sketchbook, Marcus's camera, Angellina's notebook, Gong Gong's paper
    case "guitar": return `<g class="tool"><ellipse cx="${2*k}" cy="${-22*k}" rx="${7*k}" ry="${5.5*k}" transform="rotate(-20 ${2*k} ${-22*k})" ${S("#C98A4A")}/><circle cx="${2*k}" cy="${-22*k}" r="${1.8*k}" ${S("#3A2E28")}/><path d="M${7*k} ${-25*k} L${20*k} ${-34*k}" stroke-width="${2.4*k}" style="stroke:#7A4A30"/></g>`;
    case "sketchbook": return `<rect x="${4*k}" y="${-30*k}" width="${11*k}" height="${9*k}" rx="1" ${S("#FFFDF6")}/><path d="M${6*k} ${-27*k} q${3*k} ${-2*k} ${7*k} 0 M${6*k} ${-24*k} h${5*k}" fill="none" stroke-width=".7"/><g class="tool"><path d="M${14*k} ${-22*k} l${4*k} ${-6*k}" fill="none" stroke-width="1.4" style="stroke:#E3A23A"/></g>`;
    case "camera": return `<rect x="${7*k}" y="${-31*k}" width="${10*k}" height="${7*k}" rx="1.5" ${S("#3A3430")}/><circle cx="${12*k}" cy="${-27.5*k}" r="${2.2*k}" ${S("#9FD3E8")}/><rect x="${8*k}" y="${-33*k}" width="${3*k}" height="${2*k}" ${S("#3A3430")}/>`;
    case "notebook": return `<rect x="${7*k}" y="${-29*k}" width="${8*k}" height="${10*k}" rx="1" ${S("#E8566C")}/><path d="M${9*k} ${-26*k} h${4*k} M${9*k} ${-23*k} h${4*k}" fill="none" stroke-width=".7"/>`;
    case "newspaper": return `<rect x="${-10*k}" y="${-34*k}" width="${20*k}" height="${13*k}" rx="1" ${S("#F3ECDD")}/><path d="M${-8*k} ${-31*k} h${7*k} M${-8*k} ${-28*k} h${16*k} M${-8*k} ${-25*k} h${16*k} M${1*k} ${-31*k} h${7*k}" fill="none" stroke-width=".7"/>`;
    // round 122, for Kyoto (never what they did in Ronda): Mum's red paper parasol, Dad's clay cup on the wheel, Ma Ma's
    // paper cranes, Gong Gong's Go board, Darren's skewers, Marcus's calligraphy brush, Angellina's fortune slip
    case "parasol": return `<g class="tool"><path d="M${10*k} ${-20*k} L${10*k} ${-62*k}" fill="none" stroke-width="1.4" style="stroke:#5A4636"/><path d="M${-8*k} ${-56*k} Q${10*k} ${-76*k} ${28*k} ${-56*k}z" ${S("#C8432F")}/>${[0, 1, 2, 3].map(i => `<path d="M${10*k} ${-68*k} L${(-4 + i*9)*k} ${-57*k}" fill="none" stroke-width=".6" style="stroke:#F3C969"/>`).join("")}</g>`;
    case "claycup": return `<ellipse cx="${10*k}" cy="${-10*k}" rx="${11*k}" ry="${3*k}" ${S("#8A6A52")}/><path d="M${4*k} ${-11*k} q${-1*k} ${-10*k} ${3*k} ${-11*k} h${6*k} q${4*k} ${1*k} ${2*k} ${11*k}z" ${S("#C9A27E")}/><g class="tool"><path d="M${10*k} ${-14*k} h${2*k}" fill="none" stroke-width=".8"/></g>`;
    case "crane": return `<g class="tool"><path d="M${8*k} ${-28*k} l${6*k} ${-6*k} l${6*k} ${6*k} l${-6*k} ${2*k}z" ${S("#F2A0B8")}/><path d="M${14*k} ${-34*k} l${4*k} ${-4*k}" fill="none" stroke-width=".8"/></g><path d="M${-12*k} ${-6*k} l${4*k} ${-4*k} l${4*k} ${4*k}z M${-4*k} ${-4*k} l${4*k} ${-4*k} l${4*k} ${4*k}z" ${S("#BFE0F2")}/>`;
    case "goboard": return `<rect x="${8*k}" y="${-10*k}" width="${22*k}" height="${10*k}" rx="1" ${S("#D9B86A")}/><path d="M${11*k} ${-7*k} h${16*k} M${11*k} ${-4*k} h${16*k} M${15*k} ${-10*k} v${10*k} M${21*k} ${-10*k} v${10*k}" fill="none" stroke-width=".5"/>${[[13, -7, "#2F2B28"], [19, -4, "#FFFDF6"], [23, -7, "#2F2B28"], [17, -7, "#FFFDF6"]].map(([x, y, c]) => `<circle cx="${x*k}" cy="${y*k}" r="${1.4*k}" style="fill:${c}" stroke-width=".4"/>`).join("")}`;
    case "skewer": return `<g class="tool"><path d="M${10*k} ${-20*k} L${14*k} ${-40*k}" fill="none" stroke-width="1" style="stroke:#C9A27E"/>${[0, 1, 2].map(i => `<circle cx="${(13.2 - i*.8)*k}" cy="${(-36 + i*5)*k}" r="${2.4*k}" ${S(["#FBEFF2", "#9CC27E", "#F6C7D6"][i])}/>`).join("")}</g>`;
    case "brush": return `<rect x="${-14*k}" y="${-8*k}" width="${16*k}" height="${8*k}" ${S("#FFFDF6")}/><path d="M${-11*k} ${-6*k} q${3*k} ${2*k} ${6*k} 0 M${-8*k} ${-3*k} v${2*k}" fill="none" stroke-width="1.4" style="stroke:#2F2B28"/><g class="tool"><path d="M${10*k} ${-20*k} L${16*k} ${-34*k}" fill="none" stroke-width="1.6" style="stroke:#8A5A3A"/><path d="M${9*k} ${-18*k} l${2*k} ${-3*k} l${2*k} ${2*k}z" style="fill:#2F2B28"/></g>`;
    case "fortune": return `<g class="tool"><rect x="${8*k}" y="${-32*k}" width="${6*k}" height="${14*k}" rx="1" ${S("#FFFDF6")}/><path d="M${10*k} ${-29*k} v${8*k} M${12*k} ${-29*k} v${5*k}" fill="none" stroke-width=".6" style="stroke:#C8432F"/></g>`;
    // round 129, for Jeju (never what they did in Ronda or Kyoto): Mum's kite, Ma Ma's tangerine basket, Gong Gong's
    // net and needle, Darren's wish-tower stone (Dad's pat on the stone grandfather's nose is an arm, npcs.css)
    case "kite": return `<g class="kitefly"><path d="M${10*k} ${-22*k} Q${26*k} ${-60*k} ${34*k} ${-96*k}" fill="none" stroke-width=".7"/><path d="M${34*k} ${-110*k} l${8*k} ${10*k} l${-8*k} ${12*k} l${-8*k} ${-12*k}z" ${S("#F08A2E")}/><path d="M${26*k} ${-100*k} h${16*k} M${34*k} ${-110*k} v${22*k}" fill="none" stroke-width=".6"/><path d="M${34*k} ${-88*k} q${-4*k} ${8*k} ${2*k} ${14*k} q${4*k} ${6*k} ${-2*k} ${12*k}" fill="none" stroke-width="1" style="stroke:#3E7CC0"/></g>`;
    case "tbasket": return `<path d="M${6*k} ${-24*k} h${14*k} l${-2*k} ${9*k} h${-10*k}z" ${S("#C9A27E")}/><path d="M${7*k} ${-24*k} q${6*k} ${-9*k} ${12*k} 0" fill="none" stroke-width=".9"/>${[0, 1, 2].map(i => `<circle cx="${(9 + i*4)*k}" cy="${-25*k}" r="${2.4*k}" ${S("#F29A2E")}/>`).join("")}<g class="tool"><circle cx="${14*k}" cy="${-36*k}" r="${2.6*k}" ${S("#F29A2E")}/></g>`;
    case "net": return `<path d="M${-14*k} ${-12*k} q${14*k} ${-6*k} ${30*k} 0 l${-4*k} ${12*k} h${-22*k}z" ${S("#C9B27A")}/><path d="M${-10*k} ${-10*k} l${6*k} ${10*k} M${-2*k} ${-12*k} l${6*k} ${12*k} M${6*k} ${-12*k} l${6*k} ${12*k} M${12*k} ${-11*k} l${-6*k} ${11*k} M${4*k} ${-12*k} l${-6*k} ${12*k}" fill="none" stroke-width=".5"/><g class="tool"><path d="M${10*k} ${-20*k} l${4*k} ${-6*k}" fill="none" stroke-width="1.2" style="stroke:#8A6A52"/></g>`;
    case "stone": return `<g class="tool"><ellipse cx="${13*k}" cy="${-26*k}" rx="${4*k}" ry="${2.4*k}" ${S("#5F5E64")}/></g>${[0, 1, 2].map(i => `<ellipse cx="${20*k}" cy="${(-2 - i*4)*k}" rx="${(6 - i*1.4)*k}" ry="${2.2*k}" ${S(i % 2 ? "#7A7980" : "#4A494E")}/>`).join("")}`;
    // round 134, for Cinque Terre (never what they did in Ronda, Kyoto or Jeju): Ma Ma's knitting, Gong Gong's bocce
    // balls, Darren's hiking poles, Marcus's little rowing boat and oar, Angellina's book (Mum's towel is look.towel)
    case "knit": return `<circle cx="${-2*k}" cy="${-4*k}" r="${4*k}" ${S("#E8566C")}/><path d="M${-4*k} ${-6*k} q${2*k} ${3*k} ${5*k} ${1*k}" fill="none" stroke-width=".6"/><path d="M${2*k} ${-24*k} h${10*k} v${6*k} h${-10*k}z" ${S("#F2A0B8")}/><g class="tool"><path d="M${0*k} ${-28*k} L${14*k} ${-20*k} M${14*k} ${-28*k} L${0*k} ${-20*k}" fill="none" stroke-width="1" style="stroke:#C9A27E"/></g><path d="M${-1*k} ${-7*k} Q${2*k} ${-16*k} ${4*k} ${-20*k}" fill="none" stroke-width=".6" style="stroke:#E8566C"/>`;
    case "bocce": return `<g class="tool"><circle cx="${12*k}" cy="${-20*k}" r="${3.4*k}" ${S("#C9483A")}/></g><circle cx="${30*k}" cy="${-2*k}" r="${3.2*k}" ${S("#3E6BAE")}/><circle cx="${40*k}" cy="${-4*k}" r="${3.2*k}" ${S("#C9483A")}/><circle cx="${48*k}" cy="${0*k}" r="${1.6*k}" ${S("#FFFDF6")}/>`;
    case "poles": return `<path d="M${-10*k} ${-22*k} L${-16*k} ${0*k}" fill="none" stroke-width="1.4" style="stroke:#5F5E64"/><g class="tool"><path d="M${10*k} ${-22*k} L${17*k} ${0*k}" fill="none" stroke-width="1.4" style="stroke:#5F5E64"/></g><path d="M${-6*k} ${-37*k} h${12*k} l${2*k} ${14*k} h${-16*k}z" ${S("#2E7A5A")}/>`;
    case "oar": return `<path d="M${-26*k} ${-15*k} h${52*k} q${-4*k} ${15*k} ${-20*k} ${15*k} h${-14*k} q${-14*k} 0 ${-18*k} ${-15*k}z" ${S("#3E6BAE")}/><path d="M${-24*k} ${-11*k} h${48*k}" fill="none" stroke-width="${2*k}" style="stroke:#F3D98A"/><g class="tool"><path d="M${10*k} ${-22*k} L${34*k} ${2*k}" fill="none" stroke-width="1.6" style="stroke:#8A5A3A"/><ellipse cx="${36*k}" cy="${4*k}" rx="${2.4*k}" ry="${5*k}" transform="rotate(-45 ${36*k} ${4*k})" ${S("#C9A27E")}/></g>`;
    case "book": return `<path d="M${-2*k} ${-30*k} q${7*k} ${-3*k} ${14*k} 0 v${10*k} q${-7*k} ${-3*k} ${-14*k} 0z" ${S("#FFFDF6")}/><path d="M${5*k} ${-31*k} v${10*k}" fill="none" stroke-width=".7"/><path d="M${-2*k} ${-20*k} q${7*k} ${-3*k} ${14*k} 0" fill="none" stroke-width="1.4" style="stroke:#2E7A5A"/>`;
    case "lantern": return `<path d="M${12*k} ${-24*k} v${-4*k}" fill="none"/><rect x="${9*k}" y="${-24*k}" width="${7*k}" height="${9*k}" rx="2" ${S("#FFE7A0")}/><circle cx="${12.5*k}" cy="${-19.5*k}" r="${1.8*k}" fill="#F3A64A" stroke="none" class="twinkle"/>`;
  }
  return "";
}

// Batik: a little repeating motif (flowers of dots, tiny leaves) over the top and trousers. col: the motif colour.
function batik(col, k, shirt){   // shirt: just the shirt (Jason's print shirt, round 135), not the trousers
  const flower = (x, y) => `<circle cx="${x*k}" cy="${y*k}" r="${1.5*k}" style="fill:${col}" stroke="none"/>` + [[0, -2.6], [2.5, 0], [0, 2.6], [-2.5, 0]].map(([dx, dy]) => `<circle cx="${(x + dx)*k}" cy="${(y + dy)*k}" r="${.8*k}" style="fill:${col}" stroke="none"/>`).join("");
  const leaf = (x, y) => `<path d="M${x*k} ${y*k} q${1.6*k} ${-1.6*k} ${3.2*k} 0 q${-1.6*k} ${1.6*k} ${-3.2*k} 0z" style="fill:${col}" stroke="none"/>`;
  return `<g opacity=".85" pointer-events="none">${flower(-4, -31)}${flower(4.5, -25)}${flower(-3.5, -19)}${leaf(1, -33)}${leaf(-7, -25)}${leaf(4, -18)}
    ${shirt ? "" : `<path d="M${-5.6*k} ${-12*k} h${3*k} M${-5.6*k} ${-8*k} h${3*k} M${2*k} ${-11*k} h${3*k} M${2*k} ${-6*k} h${3*k}" stroke-width="${1.1*k}" style="stroke:${col}"/>`}</g>`;
}
import { bikeArt } from "./transport.js";
// Rain gear (everyone outdoors on a rainy day, each their own): an umbrella or a raincoat with a hood and wellies.
// gear = {kind: "brolly"|"coat", a, b (colours), pat: "solid"|"stripe"|"dots"|"scallop"|"check"|"clear"|"paper"}.
const BROLLY_COLS = [["#E8566C", "#FFFDF6"], ["#3E6B8C", "#F3C969"], ["#F3C969", "#E8913A"], ["#7FB8A8", "#FFFDF6"], ["#2F2B28", "#E8566C"], ["#9AA9DD", "#FFFDF6"], ["#C2505F", "#F4C7CF"], ["#5E8A5A", "#F3E7C9"], ["#F4C7CF", "#8E2C48"], ["#E3E8EC", "#3E6B8C"]];
const COAT_COLS = [["#F3C969", "#E8566C"], ["#E8566C", "#2F2B28"], ["#3E6B8C", "#F3C969"], ["#7FB8A8", "#2E3A70"], ["#9CC27E", "#F3C969"], ["#F4C7CF", "#9AA9DD"], ["#E8913A", "#3E6B8C"], ["#2E3A70", "#E8566C"]];
const BROLLY_PATS = ["solid", "stripe", "dots", "scallop", "check", "clear", "paper", "stripe", "dots"];
export function rainGearFor(seed, opts = {}){
  let h = 0; for (const c of String(seed) + "brolly") h = (h*31 + c.charCodeAt(0)) | 0; h = Math.abs(h);
  const coat = opts.coat || (!opts.brolly && h % 3 === 0);
  if (coat) { const [a, b] = COAT_COLS[(h >> 3) % COAT_COLS.length]; return {kind: "coat", a, b}; }
  const [a, b] = BROLLY_COLS[(h >> 3) % BROLLY_COLS.length]; return {kind: "brolly", a, b, pat: BROLLY_PATS[(h >> 7) % BROLLY_PATS.length]};
}
// held up in the right hand (hand at about (10k, -21k)); the canopy sits over the head
export function brollyArt(g, k){
  const cx = 4*k, cy = -64*k, R = 22*k, top = cy - 11*k, n = 6, xs = Array.from({length: n + 1}, (_, i) => cx - R + 2*R*i/n);
  const dome = `M${cx - R} ${cy} Q${cx - R} ${top} ${cx} ${top} Q${cx + R} ${top} ${cx + R} ${cy}`;
  const hem = g.pat === "scallop" ? xs.slice(1).map((x, i) => `Q${(xs[i] + x)/2} ${cy + 4*k} ${x} ${cy}`).join(" ") : `L${cx - R} ${cy}`;
  const alpha = g.pat === "clear" ? ` fill-opacity=".38"` : "";
  let deco = "";
  const clip = `M${cx - R} ${cy} Q${cx - R} ${top} ${cx} ${top} Q${cx + R} ${top} ${cx + R} ${cy}z`;
  if (g.pat === "stripe" || g.pat === "paper") deco = xs.slice(0, n).map((x, i) => i % 2 ? `<path d="M${cx} ${top} L${x} ${cy} L${xs[i + 1]} ${cy}z" style="fill:${g.b}" stroke="none"/>` : "").join("");
  if (g.pat === "dots") deco = [[-13, -3], [-5, -7], [4, -8], [12, -5], [-9, 1], [1, -1], [10, 1], [17, 0], [-17, 0]].map(([dx, dy]) => `<circle cx="${cx + dx*k}" cy="${cy + dy*k}" r="${1.5*k}" style="fill:${g.b}" stroke="none"/>`).join("");
  if (g.pat === "check") deco = [-14, -7, 0, 7, 14].map(dx => `<path d="M${cx + dx*k} ${top} V${cy}" style="stroke:${g.b}" stroke-width="${2*k}" opacity=".8"/>`).join("") + [-6, -2.5].map(dy => `<path d="M${cx - R} ${cy + dy*k} H${cx + R}" style="stroke:${g.b}" stroke-width="${2*k}" opacity=".8"/>`).join("");
  if (g.pat === "scallop") deco = `<path d="M${cx - R + 2*k} ${cy - 2.5*k} H${cx + R - 2*k}" style="stroke:${g.b}" stroke-width="${1.6*k}" stroke-dasharray="${2*k} ${2*k}"/>`;
  const ribs = g.pat === "paper" || g.pat === "clear" ? xs.slice(1, n).map(x => `<path d="M${cx} ${top} L${x} ${cy}" fill="none" stroke-width=".6" opacity=".7"/>`).join("") : "";
  const id = "bc" + Math.round(cx*10 + R*100) + (g.pat || "").length;
  return `<g class="brolly" pointer-events="none"><path d="M${10*k} ${-20*k} L${cx} ${top}" fill="none" stroke-width="${1.4*k}"/><path d="M${10*k} ${-20*k} q0 ${3*k} ${-2.6*k} ${3*k}" fill="none" stroke-width="${1.4*k}" style="stroke:${g.pat === "paper" ? "#8A5A3A" : "var(--line)"}"/>
    <defs><clipPath id="${id}"><path d="${clip}"/></clipPath></defs><path d="${dome} ${hem}z" style="fill:${g.a}"${alpha}/><g clip-path="url(#${id})">${deco}</g>${ribs}<path d="${dome} ${hem}z" fill="none"/><circle cx="${cx}" cy="${top - 1.4*k}" r="${1.4*k}" style="fill:${g.b}"/></g>`;
}
// a raincoat's hood, pulled up round the face (head centre at (0, -46k), radius 10.6k)
export function hoodArt(g, k, y = -46*k, r = 10.6*k){
  const R = r + 2.2*k, ri = r*.82;
  return `<path d="M${-R} ${y + 5*k} A${R} ${R*1.05} 0 0 1 ${R} ${y + 5*k} L${ri} ${y + 3*k} A${ri} ${ri*.95} 0 0 0 ${-ri} ${y + 3*k}z" style="fill:${g.a}"/><path d="M${-ri*.7} ${y - ri*.55} q${ri*.7} ${-ri*.4} ${ri*1.4} 0" fill="none" stroke-width=".7" opacity=".5"/>`;
}
// the coat itself over the top: longer, with toggles in the trim colour
const coatArt = (g, k) => `<path class="rcoat" d="M${-9*k} ${-37.4*k} q${9*k} ${-2.4*k} ${18*k} 0 l${2.6*k} ${29*k} h${-23.2*k}z" style="fill:${g.a}"/><path d="M0 ${-35*k} V${-8.6*k}" fill="none" stroke-width=".7"/>${[-30, -23, -16].map(y => `<rect x="${-1.6*k}" y="${y*k}" width="${3.2*k}" height="${1.6*k}" rx=".6" style="fill:${g.b}" stroke-width=".5"/>`).join("")}`;

export function personArt(look, kid){
  const k = kid ? 0.62 : look.tall ? 1.1 : 1;
  const legH = 13*k, legY = -15*k, lw = 5*k;
  const rain = look.rain, coat = rain && rain.kind === "coat";
  const shoe = coat ? rain.b : "var(--sock)", sleeve = x => coat ? `<rect x="${x}" y="${-34*k}" width="${4.2*k}" height="${11*k}" rx="2" ${S(rain.a)}/>` : "";
  return `<g class="flip"><g filter="url(#wob)">
    <ellipse cx="0" cy="0" rx="${11*k}" ry="${3.5*k}" fill="rgba(60,40,30,.18)"/>
    <g class="bob" style="stroke:var(--line)" stroke-width="1.1" stroke-linejoin="round">
      ${look.board ? board(k) : ""}
      ${look.towel ? towel(k) : ""}
      ${look.bike ? `<g transform="translate(0 ${7*k})">${bikeArt(look.bike === true ? "#3E6B8C" : look.bike, k)}</g>` : ""}
      <g class="legL"><rect x="${-6.2*k}" y="${legY}" width="${lw}" height="${legH}" rx="2" ${S(look.shorts ? look.skin : look.bottom)}/>${look.shorts ? `<rect x="${-6.6*k}" y="${legY}" width="${lw + .8*k}" height="${legH*.5}" rx="1.5" ${S(look.bottom)}/>` : ""}<ellipse cx="${-3.7*k}" cy="${-1.6*k}" rx="${3.6*k}" ry="${2.1*k}" ${S(shoe)}/></g>
      <g class="legR"><rect x="${1.2*k}" y="${legY}" width="${lw}" height="${legH}" rx="2" ${S(look.shorts ? look.skin : look.bottom)}/>${look.shorts ? `<rect x="${.8*k}" y="${legY}" width="${lw + .8*k}" height="${legH*.5}" rx="1.5" ${S(look.bottom)}/>` : ""}<ellipse cx="${3.7*k}" cy="${-1.6*k}" rx="${3.6*k}" ry="${2.1*k}" ${S(shoe)}/></g>
      <g class="armL"><rect x="${-12*k}" y="${-34*k}" width="${4.2*k}" height="${13.5*k}" rx="2" ${S(look.skin)}/>${sleeve(-12*k)}</g>
      <g class="armR"><rect x="${7.8*k}" y="${-34*k}" width="${4.2*k}" height="${13.5*k}" rx="2" ${S(look.skin)}/>${sleeve(7.8*k)}</g>
      ${look.dress ? `<path d="M${-9*k} ${-17*k} L${-12.5*k} ${-5*k} h${25*k} L${9*k} ${-17*k}z" ${S(look.dress)}/>` : ""}
      <path d="M${-8.6*k} ${-37*k} q${8.6*k} ${-2.4*k} ${17.2*k} 0 l${1.4*k} ${23*k} h${-20*k}z" ${S(look.dress || look.top)}/>
      ${look.batik && !coat ? batik(look.batik, k) : ""}${look.print && !coat ? batik(look.print, k, true) : ""}
      ${coat ? coatArt(rain, k) : ""}
      ${["apron", "tie", "satchel", "bell", "lantern", "can", "hammer", "hoe", "cone", "rod", "guitar", "sketchbook", "camera", "notebook", "newspaper", "parasol", "claycup", "crane", "goboard", "skewer", "brush", "fortune", "kite", "tbasket", "net", "stone", "knit", "bocce", "poles", "oar", "book"].includes(look.extra) ? extra(look.extra, look, k) : ""}
      ${look.hairStyle === "long" || look.hairStyle === "bob" || look.hairStyle === "bobfringe" ? hair(look.hairStyle, look.hair, k) : ""}
      <circle cx="0" cy="${-46*k}" r="${10.6*k}" ${S(look.skin)}/>
      ${look.hairStyle === "long" || look.hairStyle === "bob" || look.hairStyle === "bobfringe" ? cap(look.hair, -46*k, 10.6*k) : hair(look.hairStyle, look.hair, k)}
      <ellipse cx="${-3.7*k}" cy="${-44*k}" rx="${1.2*k}" ry="${1.6*k}" ${S("var(--sock)")} stroke="none"/>
      <ellipse cx="${3.7*k}" cy="${-44*k}" rx="${1.2*k}" ry="${1.6*k}" ${S("var(--sock)")} stroke="none"/>
      <ellipse cx="${-6.4*k}" cy="${-40.6*k}" rx="${2*k}" ry="${1.2*k}" ${S("var(--rose)")} opacity=".7" stroke="none"/>
      <ellipse cx="${6.4*k}" cy="${-40.6*k}" rx="${2*k}" ry="${1.2*k}" ${S("var(--rose)")} opacity=".7" stroke="none"/>
      <path d="M${-1.6*k} ${-40.4*k} q${1.6*k} ${1.4*k} ${3.2*k} 0" fill="none" stroke-width="1"/>
      ${look.hairStyle === "bobfringe" ? fringe(look.hair, -46*k, 10.6*k, k) : ""}
      ${["glasses", "cap", "sunhat", "helmet"].includes(look.extra) ? extra(look.extra, look, k) : ""}
      ${look.specs ? extra("specs", look, k) : ""}
      ${look.hat && !coat ? extra(look.hat, look, k) : ""}
      ${coat ? hoodArt(rain, k) : ""}
      ${look.specs ? `<g fill="none" stroke-width="1" style="stroke:${look.specs}"><circle cx="${-3.8*k}" cy="${-44*k}" r="${2.8*k}"/><circle cx="${3.8*k}" cy="${-44*k}" r="${2.8*k}"/><path d="M${-1*k} ${-44*k} h${2*k}"/></g>` : ""}
      ${look.board ? paddle(k) : ""}
      ${rain && rain.kind === "brolly" ? brollyArt(rain, k) : ""}
      ${look.headphones ? `<path d="M${-11*k} ${-46*k} a${11*k} ${12*k} 0 0 1 ${22*k} 0" fill="none" stroke-width="1.8" style="stroke:var(--peri2)"/><rect x="${-13.5*k}" y="${-49*k}" width="${4.5*k}" height="${7*k}" rx="2" style="fill:var(--peri)"/><rect x="${9*k}" y="${-49*k}" width="${4.5*k}" height="${7*k}" rx="2" style="fill:var(--peri)"/>` : ""}
    </g>
  </g></g>`;
}

// A folded letter that floats over a messenger's head until it's read.
export const letterArt = `<g transform="translate(0 -70)"><g class="qmark"><g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.3" stroke-linejoin="round">
  <rect x="-11" y="-9" width="22" height="16" rx="2" style="fill:#FFFDF6"/><path d="M-11 -9 l11 9 l11 -9" fill="none"/><circle cx="0" cy="1" r="3" style="fill:var(--rose)"/></g></g></g>`;
