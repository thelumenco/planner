// Round 229: the secret passage (game/passage.js). The monks' wine cave under the vineyard: a brick barrel vault over
// limestone walls, flagstones, candles in niches, cobwebs in the corners and a hanging iron lantern; the worn stone
// arch over the far gate carved VINUM LAETIFICAT COR, with a sea-blue glow from the passage to the Scoop Shack; a
// little carved cross over the last niche and its candle stub. Calm: the ageing alcoves down the left, the brothers'
// press on the right, Tomás's crate of forgotten bottles and an oak bench in the bottom corners, the long table in the
// middle (laid with candelabra, plates and glasses only during Monday suppers), the door back to the cellar on the east wall.
// Also here: the cellar's clues (the draught, the old bricks, the secret door) and the gelato kitchen's hidden panel.
import { sk, tapeLabel } from "./scenes.js";

const LIME = "#E9DDC2", JOINT = "#CDBB98", BRICK = "#B0643E", MORTAR = "#E3C9A6";
const flame = (x, y, s = 1, cls = "hbflame still") => `<path class="${cls}" d="M${x} ${y - 9*s} q${4*s} ${5*s} ${3*s} ${8*s} q${-3*s} ${2.5*s} ${-6*s} 0 q${-1*s} ${-3*s} ${3*s} ${-8*s}z" fill="#FFC94A" stroke="#E8892A" stroke-width=".8"/>`;
const glow = (x, y, r, o = .35) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFD98A" opacity="${o}"/>`;
// a candle in an arched niche in the wall (stub: a short one, burnt nearly down)
const niche = (x, stub) => `${glow(x, 104, 24, .3)}${sk(`<path d="M${x - 14} 122 V94 a14 14 0 0 1 28 0 V122z" style="fill:#6B5640"/><rect x="${x - 3}" y="${stub ? 112 : 102}" width="6" height="${stub ? 8 : 18}" style="fill:#FFF6DE"/>`, `<path d="M${x - 14} 122 V94 a14 14 0 0 1 28 0 V122z M${x - 16} 122 h32"/>`)}${flame(x, stub ? 112 : 102, .9)}`;
const web = (x, y, sx) => `<g pointer-events="none" opacity=".6" style="stroke:#FFFDF6" stroke-width=".9" fill="none">${[0, 1, 2, 3].map(k => `<path d="M${x} ${y} L${x + sx*(46 - k*12)} ${y + k*14}"/>`).join("")}${[14, 26, 38].map(r => `<path d="M${x + sx*r} ${y} q${-sx*r*.15} ${r*.35} ${-sx*r*.25} ${r*.8}"/>`).join("")}</g>`;

export function caveArt(info = {}){
  const aged = info.aged || 0, left = info.bottles || [];
  // flagstones, each row a different rhythm
  const floor = `<rect width="520" height="640" style="fill:#C4B59B"/><g style="stroke:#A6957A" stroke-width="1.3" opacity=".8">${Array.from({length: 11}, (_, r) => `<path d="M0 ${170 + r*44} H520"/>${Array.from({length: 6}, (_, c) => `<path d="M${(c*96 + (r*37) % 96) % 520} ${170 + r*44} v44"/>`).join("")}`).join("")}</g>
    <g opacity=".35" style="fill:#E6DAC2">${Array.from({length: 14}, (_, i) => `<ellipse cx="${(i*131 + 40) % 500 + 10}" cy="${(i*89) % 430 + 190}" rx="${10 + (i % 3)*6}" ry="4"/>`).join("")}</g>`;
  // the limestone wall under the brick vault, the vault's ribs, and the far arch with its gate
  const wall = `<g pointer-events="none"><rect width="520" height="172" style="fill:${LIME}"/><g style="stroke:${JOINT}" stroke-width="1.2">${[0, 1, 2, 3].map(r => `<path d="M0 ${80 + r*24} H520"/>${Array.from({length: 9}, (_, c) => `<path d="M${(c*62 + (r % 2)*31) % 520} ${80 + r*24} v24"/>`).join("")}`).join("")}</g>
    <path d="M0 0 H520 V100 Q260 -6 0 100z" style="fill:${BRICK}"/><g style="stroke:${MORTAR}" stroke-width="1.4" fill="none">${[0, 1, 2, 3, 4].map(k => `<path d="M0 ${100 - k*20} Q260 ${-6 - k*20} 520 ${100 - k*20}"/>`).join("")}</g>
    <g style="stroke:${MORTAR}" stroke-width="1.2">${Array.from({length: 26}, (_, i) => { const x = 10 + i*20, k = i % 5, yq = t => (1 - t)*(1 - t)*(100 - k*20) + 2*t*(1 - t)*(-6 - k*20) + t*t*(100 - k*20), y = yq(x/520); return y > 2 ? `<path d="M${x} ${y} v-14"/>` : ""; }).join("")}</g>
    <path d="M0 100 Q260 -6 520 100" style="stroke:#7A4A30" stroke-width="7" fill="none"/><path d="M0 172 H520" style="stroke:var(--line)" stroke-width="1.4"/></g>`;
  const arch = `<defs><radialGradient id="hbSea"><stop offset="0" stop-color="#BFF1F2" stop-opacity=".95"/><stop offset=".55" stop-color="#5FB8CE" stop-opacity=".55"/><stop offset="1" stop-color="#2E7E9E" stop-opacity="0"/></radialGradient><path id="hbArchTxt" d="M205 104 A55 55 0 0 1 315 104"/></defs>
    <path d="M212 172 V104 a48 48 0 0 1 96 0 V172z" fill="#24414C"/><circle class="hbsea" cx="260" cy="140" r="64" fill="url(#hbSea)"/>
    <g opacity=".6" style="stroke:#DDF7F6" stroke-width="1.2" fill="none">${[0, 1, 2].map(k => `<path d="M${226 + k*6} ${150 + k*7} q8 -4 16 0 t16 0 t16 0"/>`).join("")}</g>
    ${sk(`<path d="M188 172 V104 a72 72 0 0 1 144 0 V172 H308 V104 a48 48 0 0 0 -96 0 V172z" style="fill:#D9CCAE"/>`, `<path d="M188 172 V104 a72 72 0 0 1 144 0 V172 H308 V104 a48 48 0 0 0 -96 0 V172z"/>${[-75, 75].map(a => { const r = Math.PI*(a - 90)/180; return `<path d="M${260 + 48*Math.cos(r)} ${104 + 48*Math.sin(r)} L${260 + 72*Math.cos(r)} ${104 + 72*Math.sin(r)}"/>`; }).join("")}`)}
    <text font-family="Klee One,serif" font-size="11" font-weight="600" letter-spacing=".8" fill="#4E3E2C"><textPath href="#hbArchTxt" startOffset="50%" text-anchor="middle">VINUM LAETIFICAT COR</textPath></text>
    <g style="stroke:#6E4630" stroke-width="3.2" stroke-linecap="round">${[224, 236, 248, 260, 272, 284, 296].map(x => `<path d="M${x} ${(106 - Math.sqrt(48*48 - (x - 260)*(x - 260))).toFixed(1)} V170"/>`).join("")}<path d="M214 124 H306 M213 152 H307"/></g>
    <g fill="#A8603A" opacity=".7">${[[230, 130], [268, 156], [290, 118], [244, 162]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2"/>`).join("")}</g>`;
  const lantern = `<g pointer-events="none"><path d="M350 0 V40" style="stroke:#3A3330" stroke-width="2" stroke-dasharray="4 2"/>${glow(350, 58, 30, .3)}${sk(`<path d="M340 44 h20 l4 8 v18 l-4 6 h-20 l-4 -6 v-18z" style="fill:#FFE6A6"/><path d="M338 44 h24 l-12 -6z" style="fill:#3A3330"/>`, `<path d="M340 44 h20 l4 8 v18 l-4 6 h-20 l-4 -6 v-18z M350 44 v32 M336 60 h28 M338 44 h24 l-12 -6z"/>`)}${flame(350, 64, .9)}</g>`;
  const cross = `<path d="M458 58 v20 M451 65 h14" style="stroke:#9A8768" stroke-width="3" stroke-linecap="round" pointer-events="none"/><path d="M458 58 v20 M451 65 h14" style="stroke:#F6EEDC" stroke-width="1" stroke-linecap="round" opacity=".7" pointer-events="none" transform="translate(-1 -1)"/>`;
  const decor = `<g pointer-events="none">${niche(56)}${niche(122)}${niche(394)}${niche(458, true)}</g>${cross}${lantern}${web(0, 0, 1)}${web(520, 0, -1)}`;
  // the ageing alcoves down the left: 24 places, a bottle end in each one laid down
  const holes = Array.from({length: 24}, (_, i) => { const a = i < 12 ? 0 : 1, j = i % 12, x = 32 + a*66 + (j % 3)*18, y = 232 + Math.floor(j/3)*20;
    return `<circle cx="${x}" cy="${y}" r="6.5" fill="${i < aged ? ["#5A1630", "#7A1F3D", "#C9B760", "#4A6A3A"][i % 4] : "#3A2A22"}" stroke="#2F2420" stroke-width=".8"/>${i < aged ? `<circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.6" fill="#FFFDF6" opacity=".5"/>` : ""}`; }).join("");
  const alcoves = `<g data-spot="alcoves" aria-label="The ageing alcoves"><ellipse class="hov" cx="82" cy="336" rx="64" ry="11" style="fill:var(--butter)"/>
    ${sk(`<rect x="14" y="188" width="136" height="142" rx="3" style="fill:${BRICK}"/>${[0, 1].map(a => `<path d="M${22 + a*66} 324 V220 a26 26 0 0 1 52 0 V324z" style="fill:#4A362A"/>`).join("")}`, `<rect x="14" y="188" width="136" height="142" rx="3"/>${[0, 1].map(a => `<path d="M${22 + a*66} 324 V220 a26 26 0 0 1 52 0 V324z"/>`).join("")}`)}
    <g style="stroke:${MORTAR}" stroke-width="1" opacity=".6" pointer-events="none">${[200, 214, 328].map(y => `<path d="M16 ${y} H148"/>`).join("")}</g>${holes}${tapeLabel(82, 352, "Ageing alcoves", "#EFE6D6", 10)}</g>`;
  // the brothers' press: oak frame, a great wooden screw, the slatted basket and its tray
  const press = `<g data-spot="oldpress" aria-label="The monks' old press"><ellipse class="hov" cx="418" cy="304" rx="62" ry="11" style="fill:var(--butter)"/>
    ${sk(`<rect x="364" y="278" width="108" height="20" rx="3" style="fill:#7A4E32"/><rect x="370" y="198" width="11" height="82" style="fill:#8A5A3A"/><rect x="455" y="198" width="11" height="82" style="fill:#8A5A3A"/><rect x="360" y="188" width="116" height="16" rx="2" style="fill:#9A6A44"/>
      <rect x="390" y="248" width="56" height="30" style="fill:#B48A62"/><ellipse cx="418" cy="248" rx="28" ry="7" style="fill:#6A2A3A"/><rect x="414" y="204" width="8" height="44" style="fill:#C9A27E"/><rect x="392" y="226" width="52" height="6" rx="3" style="fill:#7A4E32"/>`,
      `<rect x="364" y="278" width="108" height="20" rx="3"/><rect x="370" y="198" width="11" height="82"/><rect x="455" y="198" width="11" height="82"/><rect x="360" y="188" width="116" height="16" rx="2"/><rect x="390" y="248" width="56" height="30"/>${[400, 409, 418, 427, 436].map(x => `<path d="M${x} 250 v28"/>`).join("")}<ellipse cx="418" cy="248" rx="28" ry="7"/><rect x="414" y="204" width="8" height="44"/>${[210, 218, 238, 244].map(y => `<path d="M414 ${y} l8 4"/>`).join("")}<rect x="392" y="226" width="52" height="6" rx="3"/>`)}
    ${tapeLabel(418, 322, "The monks' press", "#EFE6D6", 10)}</g>`;
  // Tomás's crate of forgotten bottles, bottom left: dusty, with paper tags
  const BOT = {ob_1923: "#4A1A2A", ob_1931: "#BFAE5A", ob_1958: "#4A6A3A"};
  const bottles = `<g data-spot="oldbottles" aria-label="Forgotten bottles"><ellipse class="hov" cx="92" cy="578" rx="54" ry="10" style="fill:var(--butter)"/>
    ${["ob_1923", "ob_1931", "ob_1958"].map((id, i) => left.includes(id) ? (() => { const x = 68 + i*24, t = (i - 1)*8;
      return `<g transform="rotate(${t} ${x} 552)">${sk(`<path d="M${x - 7} 552 v-34 q0 -8 5 -11 v-10 h4 v10 q5 3 5 11 v34z" style="fill:${BOT[id]}"/><rect x="${x - 7}" y="520" width="14" height="30" fill="#D8D2C8" opacity=".35"/>`, `<path d="M${x - 7} 552 v-34 q0 -8 5 -11 v-10 h4 v10 q5 3 5 11 v34z"/>`)}<path d="M${x} 504 l6 8" style="stroke:#8A7A66" stroke-width=".8"/><rect x="${x + 3}" y="510" width="10" height="7" rx="1" transform="rotate(14 ${x + 8} 513)" fill="#F6EFE0" stroke="#8A7A66" stroke-width=".6"/></g>`; })() : "").join("")}
    ${sk(`<rect x="48" y="544" width="88" height="30" rx="2" style="fill:#B08A5E"/><path d="M54 544 q8 -6 16 -2 q10 -5 18 0 q10 -5 18 0 q10 -4 24 2z" style="fill:#E3C77A"/>`, `<rect x="48" y="544" width="88" height="30" rx="2"/><path d="M48 559 h88 M70 544 v30 M114 544 v30" opacity=".5"/>`)}
    ${tapeLabel(92, 594, "Forgotten bottles", "#EFE6D6", 10)}</g>`;
  // the long table and its benches; laid (candelabra, plates, glasses, bread) only during supper
  const places = [[206, 398], [314, 398], [206, 428], [314, 428]];
  const laid = info.laid ? `${places.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="5" fill="#FFFDF6" stroke="#5E4636" stroke-width=".8"/><ellipse cx="${x}" cy="${y}" rx="7" ry="2.6" fill="#E9C9A8"/><path d="M${x + 20} ${y - 2} q-4 0 -4 -6 h8 q0 6 -4 6z M${x + 20} ${y - 2} v5" fill="#7A1F3D" stroke="#3a2e28" stroke-width=".7"/>`).join("")}
    <ellipse cx="260" cy="414" rx="18" ry="6" fill="#C9A27E" stroke="#5E4636" stroke-width=".8"/><ellipse cx="254" cy="411" rx="7" ry="3.5" fill="#E8B878"/>
    ${[224, 296].map(x => `${glow(x, 384, 26, .35)}<path d="M${x} 414 v-18 M${x - 10} 398 q10 6 20 0" stroke="#8A6A2A" stroke-width="2" fill="none"/><ellipse cx="${x}" cy="414" rx="6" ry="2" fill="#8A6A2A"/>${[-10, 0, 10].map(dx => `<rect x="${x + dx - 2}" y="${dx ? 386 : 382}" width="4" height="${dx ? 12 : 14}" fill="#FFF6DE" stroke="#8A7A66" stroke-width=".5"/>${flame(x + dx, dx ? 386 : 382, .7)}`).join("")}`).join("")}` : "";
  const table = `<g data-spot="supper" aria-label="The long table"><ellipse class="hov" cx="260" cy="448" rx="120" ry="13" style="fill:var(--butter)"/>
    ${sk(`<rect x="158" y="362" width="204" height="10" rx="3" style="fill:#8A5A3A"/>`, `<rect x="158" y="362" width="204" height="10" rx="3"/>`)}
    ${sk(`<rect x="150" y="388" width="220" height="52" rx="4" style="fill:#9A6A44"/><rect x="154" y="392" width="212" height="44" rx="3" style="fill:#B07A50"/><path d="M168 440 v12 M352 440 v12" style="stroke:#6A4630" stroke-width="5"/>`, `<rect x="150" y="388" width="220" height="52" rx="4"/><path d="M154 406 h212 M154 422 h212" opacity=".3"/><path d="M168 440 v12 M352 440 v12"/>`)}
    ${laid}${sk(`<rect x="158" y="456" width="204" height="10" rx="3" style="fill:#8A5A3A"/>`, `<rect x="158" y="456" width="204" height="10" rx="3"/><path d="M170 466 v8 M350 466 v8"/>`)}
    ${tapeLabel(260, 486, "Long table", "#EFE6D6", 10)}</g>`;
  const bench = `<g data-spot="oakbench" aria-label="An old oak bench"><ellipse class="hov" cx="400" cy="592" rx="58" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="350" y="566" width="100" height="12" rx="3" style="fill:#9A6A44"/><rect x="350" y="548" width="100" height="8" rx="3" style="fill:#8A5A3A"/>`, `<rect x="350" y="566" width="100" height="12" rx="3"/><rect x="350" y="548" width="100" height="8" rx="3"/><path d="M358 556 v10 M442 556 v10 M360 578 v12 M440 578 v12"/>`)}
    ${tapeLabel(400, 608, "Oak bench", "#EFE6D6", 10)}</g>`;
  // the door back to the cellar, on the east wall: heavy oak with iron straps
  const door = `<g data-exit="1" aria-label="Back to the cellar door"><ellipse class="hov" cx="486" cy="450" rx="34" ry="10" style="fill:var(--butter)"/>
    ${sk(`<path d="M520 316 L492 328 L492 428 L520 440z" style="fill:#6B4A32"/>`, `<path d="M520 316 L492 328 L492 428 L520 440z"/><path d="M492 352 L520 342 M492 404 L520 412" style="stroke-width:2.4"/><circle cx="497" cy="384" r="2.2"/>`)}${tapeLabel(466, 476, "Cellar door", "#EFE6D6", 10)}</g>`;
  // warm and cosy: the corners fall into soft shadow, the middle stays lit
  const shade = `<defs><radialGradient id="hbCaveShade" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#3A2418" stop-opacity="0"/><stop offset="1" stop-color="#3A2418" stop-opacity=".32"/></radialGradient></defs><rect width="520" height="640" fill="url(#hbCaveShade)" pointer-events="none"/>`;
  return floor + wall + arch + decor + shade + alcoves + press + bottles + table + bench + door
    + `<g data-spot="cavegate" aria-label="The gate to the Scoop Shack"><path d="M206 172 V104 a54 54 0 0 1 108 0 V172z" fill="transparent"/><ellipse class="hov" cx="260" cy="178" rx="56" ry="10" style="fill:var(--butter)"/>${tapeLabel(260, 190, "To the Scoop Shack", "#E3F2EC", 10)}</g>`;
}

// the cellar's clues: the high table's candle (bent by the draught till the door's open), faint draught lines from
// behind the racks, then the old bricks on the left wall, then the secret door in their place
export function cellarPassArt(step){
  if (!step) return "";
  const lean = step < 5, x = 362, y = 470;
  let h = `<g pointer-events="none">${glow(x, 446, 20, .3)}${sk(`<ellipse cx="${x}" cy="${y}" rx="8" ry="2.6" style="fill:#C9A27E"/><rect x="${x - 3}" y="${y - 20}" width="6" height="20" style="fill:#FFF6DE"/>`, `<ellipse cx="${x}" cy="${y}" rx="8" ry="2.6"/><rect x="${x - 3}" y="${y - 20}" width="6" height="20"/>`)}${flame(x, y - 20, 1.1, lean ? "hbflame" : "hbflame still")}</g>`;
  if (lean) h += `<g class="hbdraught" pointer-events="none" fill="none" style="stroke:#FFF6E4" stroke-width="2" stroke-linecap="round" opacity=".55">${[[24, 372], [30, 396], [20, 414]].map(([sx, sy], i) => `<path d="M${sx} ${sy} q24 -10 48 0 t48 0" style="animation-delay:-${i*.7}s"/>`).join("")}</g>`;
  const P = "M0 316 L28 328 L28 428 L0 440z";
  if (step >= 2 && step < 5) h += `<g data-pass="bricks" aria-label="Old bricks behind the racks"><ellipse class="hov" cx="34" cy="452" rx="34" ry="10" style="fill:var(--butter)"/>
    <path d="M0 300 L40 318 L44 350 L34 444 L0 458z" fill="#E9DCCB" opacity=".8"/>${sk(`<path d="${P}" style="fill:#9A5A3A"/>`, `<path d="${P}"/>`)}
    <g style="stroke:${MORTAR}" stroke-width="1.2">${Array.from({length: 7}, (_, r) => { const y0 = 330 + r*14; return `<path d="M0 ${y0 - r*0} L28 ${y0 + 4}"/>${[r % 2 ? 9 : 16].map(x => `<path d="M${x} ${y0 + x/7} v14"/>`).join("")}`; }).join("")}</g>
    <path d="M10 381 l6 2 M11 386 l5 -3 M19 384 l4 2" style="stroke:#F6EEDC" stroke-width="1"/></g>`;
  // the secret door: a panel the colour of the wall stones, in the same perspective as the real door; only a hairline
  // of lantern light at its edge and a small iron ring give it away
  if (step >= 5) h += `<g data-pass="door" aria-label="A narrow door in the wall"><ellipse class="hov" cx="34" cy="452" rx="34" ry="10" style="fill:var(--butter)"/>
    <path d="${P}" style="fill:#B98E6A"/><g style="stroke:#8E6A4A" stroke-width="1.1" opacity=".55" fill="none"><path d="${P}"/>${[352, 376, 400].map(y => `<path d="M0 ${y - 12} L28 ${y - 4}"/>`).join("")}</g>
    <path d="M28.6 329 V427" style="stroke:#FFE3A3" stroke-width="1.2" opacity=".9"/><circle cx="21" cy="384" r="3.2" fill="none" style="stroke:#3A3330" stroke-width="1.3"/></g>`;
  return h;
}

// the gelato kitchen's hidden panel (once you've come through the cave's gate): ordinary shelves of jars and tubs on
// the west wall, a hairline of light down one edge and a tea towel stirring in the draught
export function kitchenPanelArt(){
  const P = "M0 316 L28 328 L28 428 L0 440z", JAR = ["#F4C7CF", "#FFF3D6", "#C9E4D4", "#F3D98A", "#D9E6F2"];
  return `<g data-pass="kpanel" aria-label="Shelves of jars and tubs"><ellipse class="hov" cx="34" cy="452" rx="34" ry="10" style="fill:var(--butter)"/>
    ${sk(`<path d="${P}" style="fill:#E3EAEE"/>`, `<path d="${P}" opacity=".5"/>${[352, 384, 416].map(y => `<path d="M0 ${y - 8} L28 ${y}"/>`).join("")}`)}
    ${[352, 384, 416].map((y, r) => [4, 13, 21].map((x, i) => `<rect x="${x - 3}" y="${y - 8 + x/3.5 - 11}" width="${i === 1 ? 7 : 6}" height="${i === 1 ? 9 : 10}" rx="${i === 1 ? 1.5 : 2.5}" fill="${JAR[(r*3 + i) % 5]}" stroke="#3a2e28" stroke-width=".6"/>`).join("")).join("")}
    <path d="M28.6 329 V427" style="stroke:#FFE3A3" stroke-width="1.2" opacity=".9"/>
    <g class="hbtowel"><path d="M8 414 h14 l1 22 q-8 3 -16 0z" fill="#FFFDF6" stroke="#3a2e28" stroke-width=".7"/><path d="M8 420 h15 M8 426 h15" style="stroke:#7FB8E8" stroke-width="1.6"/></g></g>`;
}
