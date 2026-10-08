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
const board = k => `<ellipse cx="0" cy="${-1*k}" rx="${22*k}" ry="${3.6*k}" style="fill:#F3C969"/><path d="M${-18*k} ${-1*k} h${36*k}" fill="none" stroke-width=".8" style="stroke:#E8566C"/>`;
const paddle = k => `<path d="M${12*k} ${-30*k} l${5*k} ${32*k}" fill="none" stroke-width="1.6" style="stroke:#8A5A3A"/><path d="M${16*k} ${-2*k} l${2*k} ${8*k} l${3*k} ${-1*k} l${-2*k} ${-8*k}z" ${S("#7FB8E8")}/>`;
const cap = (c, y, r) => `<path d="M${-r-.2} ${y+1} c-1 -9 4 -14 ${r} -14 c6 0 ${r+1} 4 ${r} 14 c-3 -4 -8 -5 -12 -4 c-3 0 -6 2 -8 4z" ${S(c)}/>`;

function extra(kind, look, k){
  const y = -46*k, r = 10.6*k;
  switch (kind){
    case "apron": return `<path d="M${-6*k} ${-30*k} h${12*k} l${1.5*k} ${15*k} h${-15*k}z" ${S("#FFFDF6")}/><path d="M${-5*k} ${-31*k} l${-2*k} ${-5*k} M${5*k} ${-31*k} l${2*k} ${-5*k}" fill="none"/>`;
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
    case "lantern": return `<path d="M${12*k} ${-24*k} v${-4*k}" fill="none"/><rect x="${9*k}" y="${-24*k}" width="${7*k}" height="${9*k}" rx="2" ${S("#FFE7A0")}/><circle cx="${12.5*k}" cy="${-19.5*k}" r="${1.8*k}" fill="#F3A64A" stroke="none" class="twinkle"/>`;
  }
  return "";
}

// Batik: a little repeating motif (flowers of dots, tiny leaves) over the top and trousers. col: the motif colour.
function batik(col, k){
  const flower = (x, y) => `<circle cx="${x*k}" cy="${y*k}" r="${1.5*k}" style="fill:${col}" stroke="none"/>` + [[0, -2.6], [2.5, 0], [0, 2.6], [-2.5, 0]].map(([dx, dy]) => `<circle cx="${(x + dx)*k}" cy="${(y + dy)*k}" r="${.8*k}" style="fill:${col}" stroke="none"/>`).join("");
  const leaf = (x, y) => `<path d="M${x*k} ${y*k} q${1.6*k} ${-1.6*k} ${3.2*k} 0 q${-1.6*k} ${1.6*k} ${-3.2*k} 0z" style="fill:${col}" stroke="none"/>`;
  return `<g opacity=".85" pointer-events="none">${flower(-4, -31)}${flower(4.5, -25)}${flower(-3.5, -19)}${leaf(1, -33)}${leaf(-7, -25)}${leaf(4, -18)}
    <path d="M${-5.6*k} ${-12*k} h${3*k} M${-5.6*k} ${-8*k} h${3*k} M${2*k} ${-11*k} h${3*k} M${2*k} ${-6*k} h${3*k}" stroke-width="${1.1*k}" style="stroke:${col}"/></g>`;
}
export function personArt(look, kid){
  const k = kid ? 0.62 : look.tall ? 1.1 : 1;
  const legH = 13*k, legY = -15*k, lw = 5*k;
  const shoe = "var(--sock)";
  return `<g class="flip"><g filter="url(#wob)">
    <ellipse cx="0" cy="0" rx="${11*k}" ry="${3.5*k}" fill="rgba(60,40,30,.18)"/>
    <g class="bob" style="stroke:var(--line)" stroke-width="1.1" stroke-linejoin="round">
      ${look.board ? board(k) : ""}
      <g class="legL"><rect x="${-6.2*k}" y="${legY}" width="${lw}" height="${legH}" rx="2" ${S(look.shorts ? look.skin : look.bottom)}/>${look.shorts ? `<rect x="${-6.6*k}" y="${legY}" width="${lw + .8*k}" height="${legH*.5}" rx="1.5" ${S(look.bottom)}/>` : ""}<ellipse cx="${-3.7*k}" cy="${-1.6*k}" rx="${3.6*k}" ry="${2.1*k}" ${S(shoe)}/></g>
      <g class="legR"><rect x="${1.2*k}" y="${legY}" width="${lw}" height="${legH}" rx="2" ${S(look.shorts ? look.skin : look.bottom)}/>${look.shorts ? `<rect x="${.8*k}" y="${legY}" width="${lw + .8*k}" height="${legH*.5}" rx="1.5" ${S(look.bottom)}/>` : ""}<ellipse cx="${3.7*k}" cy="${-1.6*k}" rx="${3.6*k}" ry="${2.1*k}" ${S(shoe)}/></g>
      <g class="armL"><rect x="${-12*k}" y="${-34*k}" width="${4.2*k}" height="${13.5*k}" rx="2" ${S(look.skin)}/></g>
      <g class="armR"><rect x="${7.8*k}" y="${-34*k}" width="${4.2*k}" height="${13.5*k}" rx="2" ${S(look.skin)}/></g>
      ${look.dress ? `<path d="M${-9*k} ${-17*k} L${-12.5*k} ${-5*k} h${25*k} L${9*k} ${-17*k}z" ${S(look.dress)}/>` : ""}
      <path d="M${-8.6*k} ${-37*k} q${8.6*k} ${-2.4*k} ${17.2*k} 0 l${1.4*k} ${23*k} h${-20*k}z" ${S(look.dress || look.top)}/>
      ${look.batik ? batik(look.batik, k) : ""}
      ${["apron", "tie", "satchel", "bell", "lantern", "can", "hammer", "hoe", "cone"].includes(look.extra) ? extra(look.extra, look, k) : ""}
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
      ${look.hat ? extra(look.hat, look, k) : ""}
      ${look.specs ? `<g fill="none" stroke-width="1" style="stroke:${look.specs}"><circle cx="${-3.8*k}" cy="${-44*k}" r="${2.8*k}"/><circle cx="${3.8*k}" cy="${-44*k}" r="${2.8*k}"/><path d="M${-1*k} ${-44*k} h${2*k}"/></g>` : ""}
      ${look.board ? paddle(k) : ""}
      ${look.headphones ? `<path d="M${-11*k} ${-46*k} a${11*k} ${12*k} 0 0 1 ${22*k} 0" fill="none" stroke-width="1.8" style="stroke:var(--peri2)"/><rect x="${-13.5*k}" y="${-49*k}" width="${4.5*k}" height="${7*k}" rx="2" style="fill:var(--peri)"/><rect x="${9*k}" y="${-49*k}" width="${4.5*k}" height="${7*k}" rx="2" style="fill:var(--peri)"/>` : ""}
    </g>
  </g></g>`;
}

// A folded letter that floats over a messenger's head until it's read.
export const letterArt = `<g transform="translate(0 -70)"><g class="qmark"><g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.3" stroke-linejoin="round">
  <rect x="-11" y="-9" width="22" height="16" rx="2" style="fill:#FFFDF6"/><path d="M-11 -9 l11 9 l11 -9" fill="none"/><circle cx="0" cy="1" r="3" style="fill:var(--rose)"/></g></g></g>`;
