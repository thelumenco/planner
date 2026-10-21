// The wine shop's alfresco terrace (round 146, Mel: "billowing canvas, swaying curtains, the feel of a long Provence
// Sunday lunch"). Through the glass doors in the wine shop's corner, or by tapping the little terrace outside: a
// pergola of weathered beams with cream canvas sails billowing overhead and linen curtains tied to the posts, swaying;
// a vine and wisteria along the beams; festoon lights; and down the middle one long table under white linen, with
// six chairs either side. Beyond the balustrade: lavender in rows, cypresses, olive trees, a stone farmhouse, and
// hills going blue. On Sundays from 11:30 the table's laid (plates, glasses, bread, jugs of lavender, bottles); the
// rest of the week it's a jug of lavender and folded napkins. Calm on purpose: the edges are busy, the middle clear.
import { dayKey, sgHM } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { occasionOn, occasionNow, mothersDay, WED } from "../game/occasions.js";

const C = {sky: "#F7E9CC", sky2: "#F3DDB0", hill: "#C9C3D9", hill2: "#B5B9C9", lav: "#A68FCB", lav2: "#8E78B8", leaf: "#7E9A68", olive: "#9AAA7E", cypress: "#4E6A4A",
  stone: "#EBDDC0", stone2: "#DDCBA6", flag: "#EFE3C9", wood: "#9A7656", wood2: "#7C5C40", linen: "#FBF6EA", canvas: "#F6EEDC", terra: "#C9785A", ink: "#2F2B28"};
const g = s => `<g pointer-events="none">${s}</g>`;
const cypress = (x, y, s = 1) => g(sk(`<path d="M${x} ${y} c${-7*s} ${-14*s} ${-8*s} ${-44*s} 0 ${-62*s} c${8*s} ${18*s} ${7*s} ${48*s} 0 ${62*s}z" style="fill:${C.cypress}"/>`, `<path d="M${x} ${y} c${-7*s} ${-14*s} ${-8*s} ${-44*s} 0 ${-62*s} c${8*s} ${18*s} ${7*s} ${48*s} 0 ${62*s}z"/>`));
const oliveTree = (x, y, s = 1) => g(sk(`<path d="M${x} ${y} q${-2*s} ${-12*s} ${2*s} ${-20*s}" style="fill:none;stroke:${C.wood2}" stroke-width="${3*s}"/>${[[-10, -26, 12], [6, -30, 13], [-2, -38, 11], [12, -22, 9]].map(([dx, dy, r]) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${r*s}" ry="${r*s*.7}" style="fill:${C.olive}"/>`).join("")}`, `<ellipse cx="${x}" cy="${y - 30*s}" rx="${20*s}" ry="${14*s}"/>`));
const pot = (x, y, flower = "#E8566C", s = 1) => g(sk(`<path d="M${x - 9*s} ${y - 14*s} h${18*s} l${-3*s} ${14*s} h${-12*s}z" style="fill:${C.terra}"/>${[[-5, -18], [0, -22], [5, -18], [-2, -16], [3, -15]].map(([dx, dy], i) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${(i < 3 ? 3.4 : 2.6)*s}" style="fill:${i % 2 ? C.leaf : flower}"/>`).join("")}`, `<path d="M${x - 9*s} ${y - 14*s} h${18*s} l${-3*s} ${14*s} h${-12*s}z"/>`));
const chair = (x, y, side) => g(sk(`<rect x="${x - 9}" y="${y - 10}" width="18" height="12" rx="2" style="fill:#C9B27A"/><rect x="${side < 0 ? x + 6 : x - 9}" y="${y - 26}" width="3" height="18" style="fill:#8A7A52"/><path d="M${x - 8} ${y - 6} h16 M${x - 8} ${y - 2} h16" style="stroke:#A89660" stroke-width="1"/>`, `<rect x="${x - 9}" y="${y - 10}" width="18" height="12" rx="2"/>`));

// round 152: the terrace dressed for its occasions (game/occasions.js)
const roseC = ["#E8566C", "#F4C7CF", "#FFFDF6"];
function occasionDecor(kind, day, hm, F){
  if (kind === "wedding" && hm >= 12*60 && hm < 20*60) {   // the flower arch at the head of the table, ribbons on the chairs
    const arch = `<path d="M232 300 V258 Q260 222 288 258 V300" fill="none" stroke="#B9A88A" stroke-width="4"/>` + Array.from({length: 18}, (_, i) => { const a = Math.PI*(i/17), x = 260 - Math.cos(a)*28, y = 258 - Math.sin(a)*30 + (i % 2)*2; return `<circle cx="${x}" cy="${y}" r="${3.4 + (i % 3)}" fill="${roseC[i % 3]}" stroke="#2F2B28" stroke-width=".5"/>`; }).join("")
      + [236, 284].map(x => [270, 284].map(y => `<circle cx="${x}" cy="${y}" r="3" fill="#7FA35A"/><circle cx="${x + 1}" cy="${y - 3}" r="2.6" fill="${roseC[(x + y) % 3]}"/>`).join("")).join("");
    const bows = [0, 1, 2, 3, 4, 5].flatMap(i => [[203, 330 + i*44], [317, 330 + i*44]]).map(([x, y]) => `<path d="M${x - 5} ${y - 3} l5 3 l-5 3z M${x + 5} ${y - 3} l-5 3 l5 3z" fill="#FFFDF6" stroke="#C9B9A0" stroke-width=".6"/>`).join("");
    return g(arch + bows) + `<g data-tspot="arch" data-x="260" data-y="310" aria-label="The flower arch"><ellipse class="hov" cx="260" cy="304" rx="30" ry="8" style="fill:var(--butter)"/></g>`;
  }
  if (kind === "trivia" && hm >= 18*60 + 30 && hm < 21*60 + 30) {   // the projector screen hung from the beam, and the projector on the table
    return g(`<path d="M196 214 v8 M324 214 v8" stroke="#5A4A3A" stroke-width="1.4"/><rect x="190" y="220" width="140" height="58" rx="2" fill="#FFFDF6" stroke="#2F2B28" stroke-width="1.2"/><rect x="186" y="218" width="148" height="5" rx="2" fill="#5F5E64"/>
      <text x="260" y="242" text-anchor="middle" font-family="Klee One,serif" font-size="11" fill="#2F2B28">Trivia night</text><text x="260" y="260" text-anchor="middle" font-family="Klee One,serif" font-size="8" fill="#6E6A64">pencils ready!</text>
      <path d="M260 290 L210 276 M260 290 L310 276" stroke="#FFF6C8" stroke-width="10" opacity=".25"/><rect x="252" y="288" width="16" height="9" rx="2" fill="#3A3430"/><circle cx="260" cy="292" r="2.4" fill="#FFF6C8"/>`)
      + `<g data-tspot="screen" data-x="300" data-y="300" aria-label="Trivia night: join a team"><ellipse class="hov" cx="260" cy="282" rx="72" ry="10" style="fill:var(--butter)"/></g>`;
  }
  if (kind === "paint" && hm >= 13*60 + 30 && hm < 16*60 + 30) {   // Mel's own easel, waiting, and a tray of paints on the table
    return g(`<path d="M444 470 l-7 30 M456 470 l7 30 M450 462 v38" stroke="#8A6A52" stroke-width="2"/><rect x="436" y="430" width="28" height="34" fill="#FFFDF6" stroke="#2F2B28" stroke-width="1"/>${F.terraceEv && F.terraceEv.painted === day && F.terraceEv.gallery ? "" : ""}
      <rect x="246" y="440" width="28" height="10" rx="2" fill="#FFFDF6" stroke="#2F2B28" stroke-width=".7"/>${["#E8566C", "#A68FCB", "#F3C969", "#7FA35A"].map((c, i) => `<circle cx="${251 + i*6}" cy="445" r="2" fill="${c}"/>`).join("")}`)
      + `<g data-tspot="easel" data-x="430" data-y="508" aria-label="Your easel: sip and paint"><ellipse class="hov" cx="450" cy="502" rx="22" ry="7" style="fill:var(--butter)"/></g>`;
  }
  if (kind === "valentine" && hm >= 17*60) return g([340, 400, 460, 520].map((y, i) => `<rect x="${256}" y="${y - 12}" width="5" height="12" fill="#FFFDF6" stroke="#2F2B28" stroke-width=".6"/><path d="M258.5 ${y - 12} q-2 -4 0 -7 q2 3 0 7z" fill="#F3C969" class="twinkle"/><circle cx="${266}" cy="${y - 4}" r="3" fill="#E8566C"/>`).join(""));
  if (kind === "christmas" && hm >= 10*60 && hm < 18*60) return g(`<g transform="translate(-290 236) scale(1)"><path d="M440 360 l14 -40 l14 40z M444 340 l10 -26 l10 26z" fill="#3E6A4A" stroke="#2F2B28" stroke-width="1"/><rect x="450" y="360" width="8" height="8" fill="#8A6A52"/><path d="M454 310 l2 5 l5 0 l-4 3 l2 5 l-5 -3 l-5 3 l2 -5 l-4 -3 l5 0z" fill="#F3C969"/>${[[446, 344, "#E8566C"], [462, 350, "#F3C969"], [452, 330, "#9CC4D0"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${c}"/>`).join("")}</g>
    ${[0, 1, 2, 3, 4, 5].flatMap(i => [[246, 330 + i*44], [274, 330 + i*44]]).map(([x, y], i) => `<path d="M${x - 6} ${y} h12" stroke="${["#C8432F", "#3E6A4A", "#F3C969"][i % 3]}" stroke-width="4" stroke-linecap="round"/>`).join("")}`);
  if (kind === "nye" && (hm >= 19*60 || hm < 60)) { const balloons = [[196, 300], [324, 300], [196, 596], [324, 596]].map(([x, y], i) => `<path d="M${x} ${y} q${i % 2 ? 6 : -6} -14 0 -30" fill="none" stroke="#8A8478" stroke-width=".6"/>${[0, 1, 2].map(j => `<ellipse cx="${x + (j - 1)*7}" cy="${y - 34 - (j % 2)*5}" rx="5" ry="6.4" fill="${["#F3C969", "#FFFDF6", "#C9B3E3"][j]}" stroke="#2F2B28" stroke-width=".5"/>`).join("")}`).join("");
    const fw = hm >= 23*60 + 58 || hm < 30 ? [[120, 60, "#F3C969"], [260, 40, "#F4C7CF"], [400, 70, "#9CC4D0"]].map(([x, y, c], i) => `<g class="fwork" style="animation-delay:${i*.5}s">${Array.from({length: 12}, (_, k) => { const a = k/12*Math.PI*2; return `<path d="M${x} ${y} l${Math.cos(a)*22} ${Math.sin(a)*22}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`; }).join("")}</g>`).join("") : "";
    return g(balloons + fw); }
  return "";
}
// round 153 (Mel): light for the evenings. Fairy lights strung across the pergola in three swags, candles in glass jars
// down the long table and on the wall, and woven rattan pendants hanging from the beams (and a rattan floor lantern by
// the doors). From six they're lit: the glowing bits are .nglow, so core.js redraws them above the dusk wash.
function terraceLights(hm){
  const lit = hm >= 18*60 || hm < 6*60, glow = s => lit ? `<g class="nglow">${s}</g>` : s;
  const swag = (y, sag) => { const pts = Array.from({length: 19}, (_, i) => { const t = i/18, x = 48 + t*424; return [x, y + Math.sin(t*Math.PI)*sag]; });
    return `<path d="M48 ${y} Q260 ${y + sag*2} 472 ${y}" fill="none" stroke="#5A4A3A" stroke-width=".8"/>` + glow(pts.map(([x, yy], i) => `${lit ? `<circle cx="${x.toFixed(1)}" cy="${(yy + 3).toFixed(1)}" r="5" fill="#FFE3A3" opacity=".35"/>` : ""}<circle cx="${x.toFixed(1)}" cy="${(yy + 3).toFixed(1)}" r="2" fill="${lit ? (i % 3 ? "#FFE9A8" : "#FFD27A") : "#F3EEE2"}" stroke="#5A4A3A" stroke-width=".4"/>`).join("")); };
  const candle = (x, y, s = 1) => `<rect x="${x - 4*s}" y="${y - 10*s}" width="${8*s}" height="${10*s}" rx="${2*s}" fill="#E8F1F3" fill-opacity=".7" stroke="#2F2B28" stroke-width=".6"/><rect x="${x - 2*s}" y="${y - 7*s}" width="${4*s}" height="${6*s}" rx=".6" fill="#FFFDF6"/>`
    + (lit ? glow(`<circle cx="${x}" cy="${y - 8*s}" r="${9*s}" fill="#FFD27A" opacity=".3"/><path class="flick" d="M${x} ${y - 13*s} q${-2*s} ${3*s} 0 ${5*s} q${2*s} ${-2*s} 0 ${-5*s}z" fill="#FFB347"/>`) : "");
  const rattan = (x, y, s = 1) => `<path d="M${x} 216 V${y - 22*s}" stroke="#5A4A3A" stroke-width=".8"/><path d="M${x - 16*s} ${y} Q${x - 16*s} ${y - 22*s} ${x} ${y - 22*s} Q${x + 16*s} ${y - 22*s} ${x + 16*s} ${y}z" fill="#C9A26A" stroke="#7A5638" stroke-width="1"/>`
    + `<path d="M${x - 12*s} ${y - 6*s} h${24*s} M${x - 9*s} ${y - 12*s} h${18*s} M${x - 5*s} ${y - 18*s} h${10*s} M${x} ${y - 22*s} v${22*s} M${x - 8*s} ${y - 20*s} l${-4*s} ${20*s} M${x + 8*s} ${y - 20*s} l${4*s} ${20*s}" stroke="#8A6A42" stroke-width=".7" fill="none"/>`
    + (lit ? glow(`<ellipse cx="${x}" cy="${y + 4*s}" rx="${30*s}" ry="${16*s}" fill="#FFD27A" opacity=".32"/><ellipse cx="${x}" cy="${y}" rx="${12*s}" ry="${3*s}" fill="#FFE9A8"/>`) : "");
  const floorLantern = (x, y) => `<path d="M${x - 10} ${y} l2 -30 h16 l2 30z" fill="#C9A26A" stroke="#7A5638" stroke-width="1"/>${[0, 1, 2, 3].map(i => `<path d="M${x - 9 + i*0.6} ${y - 7 - i*7} h${18 - i*1.2}" stroke="#8A6A42" stroke-width=".7"/>`).join("")}<path d="M${x - 6} ${y - 30} q6 -8 12 0" fill="none" stroke="#7A5638" stroke-width="1.2"/>`
    + (lit ? glow(`<ellipse cx="${x}" cy="${y - 12}" rx="22" ry="20" fill="#FFD27A" opacity=".3"/><rect x="${x - 4}" y="${y - 20}" width="8" height="10" rx="2" fill="#FFE9A8"/>`) : "");
  return `<g pointer-events="none">${swag(300, 14)}${swag(420, 16)}${swag(540, 14)}
    ${[330, 400, 470, 540].map((y, i) => candle(i % 2 ? 262 : 258, y)).join("")}${[150, 330].map(x => candle(x, 182, .9)).join("")}
    ${rattan(150, 300)}${rattan(370, 300)}${floorLantern(110, 470)}${floorLantern(430, 600)}</g>`;
}
export function terraceArt(F = {}){
  const day = dayKey(), hm = sgHM(), sunday = new Date(day + "T00:00:00Z").getUTCDay() === 0, evening = hm >= 18*60 || hm < 6*60, occ = occasionOn(day);
  // laid for Sunday lunch, the wedding breakfast, Valentine's and Christmas
  const laid = (sunday && hm >= 11*60 + 30 && hm < 15*60 + 30) || (occ === "wedding" && hm >= 14*60 + 30 && hm < 19*60) || (occ === "valentine" && hm >= 17*60 + 30) || (occ === "christmas" && hm >= 11*60 + 30 && hm < 16*60 + 30);
  // the view: sky, hills going blue, rows of lavender, cypresses and olives, a stone farmhouse with blue shutters
  const view = `<defs><linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${evening ? "#E9C9A8" : C.sky}"/><stop offset="1" stop-color="${evening ? "#F3D9B8" : C.sky2}"/></linearGradient></defs>
    <rect width="520" height="200" fill="url(#tsky)"/>${g(`<path d="M0 92 Q90 60 180 84 T360 70 T520 82 V140 H0z" style="fill:${C.hill}"/><path d="M0 112 Q120 90 240 108 T520 100 V150 H0z" style="fill:${C.hill2}" opacity=".8"/>`)}
    ${g(`<path d="M0 128 H520 V188 H0z" style="fill:#D9C99A"/>${Array.from({length: 11}, (_, i) => `<path d="M${-40 + i*56} 188 L${10 + i*48} 128" style="stroke:${i % 2 ? C.lav : C.lav2}" stroke-width="13" stroke-linecap="round"/>`).join("")}`)}
    ${g(sk(`<rect x="360" y="96" width="62" height="34" style="fill:${C.stone}"/><path d="M354 98 l37 -20 l37 20z" style="fill:${C.terra}"/><rect class="wglow" x="370" y="106" width="9" height="11" style="fill:#7FA3B8"/><rect class="wglow" x="402" y="106" width="9" height="11" style="fill:#7FA3B8"/><rect x="386" y="114" width="10" height="16" style="fill:${C.wood}"/>`, `<rect x="360" y="96" width="62" height="34"/><path d="M354 98 l37 -20 l37 20z"/>`))}
    ${cypress(70, 150, 1.1)}${cypress(92, 146, .8)}${cypress(458, 140, 1)}${oliveTree(170, 140, .8)}${oliveTree(300, 134, .7)}`;
  // the balustrade: a low stone wall with pots of geraniums
  const wall = g(sk(`<rect x="0" y="176" width="520" height="28" style="fill:${C.stone2}"/><rect x="0" y="172" width="520" height="8" style="fill:${C.stone}"/>`, `<path d="M0 172 H520 M0 204 H520"/>`)) + pot(150, 176) + pot(208, 176, "#F3F0E6") + pot(330, 176) + pot(392, 176, "#E89AB8");
  // the floor: warm stone flags
  const floor = g(`<rect x="0" y="204" width="520" height="436" style="fill:${C.flag}"/>${Array.from({length: 24}, (_, i) => `<rect x="${(i % 6)*90 + (Math.floor(i/6) % 2)*45 - 20}" y="${214 + Math.floor(i/6)*108}" width="86" height="104" rx="6" style="fill:none;stroke:#00000012" stroke-width="1.6"/>`).join("")}`);
  // the wine shop's wall down the left, with the glass doors back in
  const shop = g(sk(`<rect x="0" y="204" width="34" height="436" style="fill:#E6D2B4"/>${Array.from({length: 10}, (_, i) => `<path d="M0 ${230 + i*42} h34" style="stroke:#00000014"/>`).join("")}`, `<path d="M34 204 V640"/>`))
    + `<g data-exit="1" aria-label="Back into the wine shop"><ellipse class="hov" cx="40" cy="${468}" rx="16" ry="40" style="fill:var(--butter)"/>${sk(`<rect class="wglow" x="8" y="396" width="26" height="100" style="fill:#CFE3EA" opacity=".85"/><path d="M21 396 v100 M8 446 h26" style="stroke:${C.linen}" stroke-width="3"/><path d="M12 404 l6 -4 M12 420 l10 -8" style="stroke:#FFFFFF" stroke-width="2" opacity=".8"/>`, `<rect x="8" y="396" width="26" height="100"/>`)}</g>`;
  // the pergola: posts, beams, the vine and the wisteria along the top beam, festoon lights
  const posts = [[44, 214], [476, 214], [44, 620], [476, 620], [44, 418], [476, 418]];
  const pergola = g(sk(`${posts.map(([x, y]) => `<rect x="${x - 5}" y="${y - 6 - (y > 400 && y < 600 ? 0 : 0)}" width="10" height="${y > 600 ? 20 : 12}" style="fill:${C.wood}"/>`).join("")}<rect x="30" y="206" width="460" height="9" style="fill:${C.wood}"/><path d="M44 214 V630 M476 214 V630" style="stroke:${C.wood}" stroke-width="8"/>`, `<rect x="30" y="206" width="460" height="9"/>`))
    + g(`${Array.from({length: 22}, (_, i) => `<ellipse cx="${36 + i*21}" cy="${213 + (i % 3)*3}" rx="9" ry="6" style="fill:${i % 4 === 1 ? "#B9A2DC" : C.leaf}" opacity=".95"/>`).join("")}${[90, 200, 330, 430].map(x => `<path d="M${x} 216 q-4 14 0 26 q4 10 -1 20" style="fill:none;stroke:#B9A2DC" stroke-width="5" stroke-linecap="round" opacity=".85"/>`).join("")}`)
    + g(`<path d="M44 236 Q150 268 260 240 Q370 268 476 236" style="fill:none;stroke:#5A4A3A" stroke-width="1"/>${Array.from({length: 13}, (_, i) => { const x = 52 + i*35, y = 238 + Math.sin(i/12*Math.PI*2)*-12 + 14*Math.sin(i/12*Math.PI)*.4; return `<circle cx="${x}" cy="${y + 6}" r="3" fill="#F6D98A" class="twinkle" style="animation-delay:${(i % 5)*.4}s"/>`; }).join("")}`);
  // the canvas sails overhead, billowing (CSS .billow), and the linen curtains tied to the posts, swaying (.tcurtain)
  const sails = [[60, 250], [190, 330], [330, 460]].map(([x0, x1], i) => `<g class="billow" style="animation-delay:${-i*1.3}s"><path d="M${x0} 214 L${x1} 214 Q${x1 - 6} 258 ${x1 - 14} 270 Q${(x0 + x1)/2} ${282 + i*4} ${x0 + 14} 266 Q${x0 + 4} 252 ${x0} 214z" fill="${C.canvas}" stroke="#D8CCB0" stroke-width="1.2" opacity=".9"/><path d="M${x0 + 20} 222 Q${(x0 + x1)/2} 250 ${x1 - 20} 222" fill="none" stroke="#E6DCC6" stroke-width="1"/></g>`).join("");
  const curtain = (x, y, side) => `<g class="tcurtain" style="transform-origin:${x}px ${y}px;animation-delay:${(x + y) % 3}s"><path d="M${x} ${y} q${side*16} 30 ${side*6} 70 q${side*-4} 16 ${side*14} 60 l${side*10} 0 q${side*-10} -40 ${side*6} -70 q${side*12} -30 ${side*4} -60z" fill="${C.linen}" stroke="#E2D8C2" stroke-width="1.1" opacity=".92"/><path d="M${x + side*4} ${y + 74} q${side*6} 2 ${side*12} -2" fill="none" stroke="${C.terra}" stroke-width="2"/></g>`;
  const drapes = curtain(48, 216, 1) + curtain(472, 216, -1) + curtain(48, 420, 1) + curtain(472, 420, -1);
  // the long table under white linen, six chairs down each side
  const T = {x: 236, w: 48, y0: 300, y1: 580};
  const chairs = [0, 1, 2, 3, 4, 5].map(i => chair(212, 336 + i*44, 1) + chair(308, 336 + i*44, -1)).join("");
  let table = g(sk(`<rect x="${T.x}" y="${T.y0}" width="${T.w}" height="${T.y1 - T.y0}" rx="3" style="fill:${C.linen}"/><path d="M${T.x} ${T.y0 + 4} v${T.y1 - T.y0 - 8} M${T.x + T.w} ${T.y0 + 4} v${T.y1 - T.y0 - 8}" style="stroke:#E6DCC6" stroke-width="3"/><rect x="${T.x + 18}" y="${T.y0 + 6}" width="12" height="${T.y1 - T.y0 - 12}" rx="2" style="fill:#E8E0F0" opacity=".8"/>`, `<rect x="${T.x}" y="${T.y0}" width="${T.w}" height="${T.y1 - T.y0}" rx="3"/>`));
  const jug = (x, y) => `<rect x="${x - 4}" y="${y - 10}" width="8" height="10" rx="2" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".8"/>${[-3, 0, 3].map(d => `<path d="M${x + d} ${y - 10} l${d*.6} -8" stroke="${C.lav2}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}`;
  if (laid) {
    const places = [0, 1, 2, 3, 4, 5].flatMap(i => [[T.x + 10, 336 + i*44 - 10], [T.x + T.w - 10, 336 + i*44 - 10]]);
    table += g(`${places.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#FFFFFF" stroke="#C9C0AE" stroke-width=".8"/><circle cx="${x}" cy="${y}" r="3.4" fill="${["#E8A86A", "#9CC27E", "#E8566C"][(x + y) % 3]}" opacity=".7"/><path d="M${x + (x < 260 ? 8 : -8)} ${y - 6} v8" stroke="#C9C0AE" stroke-width="1.2"/>`).join("")}
      ${[340, 430, 520].map((y, i) => `<rect x="${256}" y="${y - 14}" width="7" height="16" rx="2.4" fill="${["#7A1F3D", "#E8D57A", "#F3E7B0"][i]}" stroke="${C.ink}" stroke-width=".7"/>`).join("")}
      ${[385, 475].map(y => `<ellipse cx="260" cy="${y}" rx="9" ry="5" fill="#E3B47A" stroke="${C.ink}" stroke-width=".7"/>`).join("")}${jug(260, 316)}${jug(260, 572)}`);
  } else table += g(`${jug(260, 450)}${[340, 560].map(y => `<path d="M${T.x + 8} ${y} h${T.w - 16}" stroke="#E2D8C2" stroke-width="5" stroke-linecap="round"/>`).join("")}`);
  const tableSpot = `<g data-tspot="table" data-x="260" data-y="288" aria-label="The long table"><ellipse class="hov" cx="260" cy="296" rx="34" ry="10" style="fill:var(--butter)"/></g>`;
  // round the edges: the sideboard with bottles and a stack of plates, an olive in a big pot, pots of herbs and
  // geraniums, the lectern with the bookings book by the doors, a watering can
  const side = g(sk(`<rect x="404" y="300" width="64" height="40" rx="3" style="fill:${C.wood}"/><rect x="400" y="296" width="72" height="8" rx="2" style="fill:${C.wood2}"/>${[0, 1, 2, 3].map(i => `<rect x="${410 + i*10}" y="${278}" width="6" height="18" rx="2.2" style="fill:${["#7A1F3D", "#E8D57A", "#8A2E3E", "#F3E7B0"][i]}"/>`).join("")}<rect x="452" y="284" width="14" height="12" rx="2" style="fill:#FFFDF6"/>`, `<rect x="404" y="296" width="68" height="44"/>`))
    + g(sk(`<path d="M424 560 h48 l-6 30 h-36z" style="fill:${C.terra}"/>`, `<path d="M424 560 h48 l-6 30 h-36z"/>`)) + oliveTree(448, 560, 1.3) + pot(90, 600, "#E8566C", 1.3) + pot(120, 610, "#F3F0E6", 1.1) + pot(400, 612, "#B9A2DC", 1.2)
    + pot(84, 250, "#9CC27E") + pot(436, 252, "#E8566C");
  const book = `<g data-tspot="book" data-x="104" data-y="386" aria-label="The bookings book"><ellipse class="hov" cx="80" cy="372" rx="20" ry="8" style="fill:var(--butter)"/>${sk(`<path d="M76 370 v-26" style="stroke:${C.wood2}" stroke-width="4"/><path d="M64 344 h26 l-4 -10 h-18z" style="fill:${C.wood}"/><path d="M66 336 q6 -3 11 0 q5 -3 11 0" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".8"/>`, `<path d="M64 344 h26 l-4 -10 h-18z"/>`)}</g>`;
  const view2 = `<g data-tspot="view" data-x="300" data-y="226" aria-label="The view"><ellipse class="hov" cx="300" cy="196" rx="40" ry="8" style="fill:var(--butter)"/></g>`;
  // the steps down to the vineyard, in the low wall at the bottom
  const steps = g(sk(`<rect x="0" y="618" width="210" height="22" style="fill:${C.stone2}"/><rect x="310" y="618" width="210" height="22" style="fill:${C.stone2}"/>`, `<path d="M0 618 H210 M310 618 H520"/>`)) + `<g data-exit="vineyard" aria-label="Down the steps to the vineyard"><ellipse class="hov" cx="260" cy="626" rx="44" ry="10" style="fill:var(--butter)"/></g>`;
  const labels = tapeLabel(80, 392, "Bookings", "#E6DDF2", 9) + tapeLabel(352, 596, "The long table", "#FBF0D6", 9) + tapeLabel(300, 168, "The view", "#E6DDF2", 9);
  // round 152: Mother's Day: jugs of pink roses down the table
  const mum = sunday && mothersDay(day) && hm >= 11*60 ? g([380, 470, 540].map(y => `<rect x="256" y="${y - 10}" width="8" height="10" rx="2" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".8"/>${[-4, 0, 4].map(d => `<circle cx="${260 + d}" cy="${y - 14 - Math.abs(d)/2}" r="3" fill="${roseC[(y + d) % 2]}"/>`).join("")}`).join("")) : "";
  return view + wall + floor + shop + side + chairs + table + mum + tableSpot + book + view2 + steps + pergola + sails + drapes + terraceLights(hm) + occasionDecor(occ, day, hm, F) + labels;
}
