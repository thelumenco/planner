// Portovenere (boat towns, round 210): the last town on the Ligurian coast before the Gulf of Poets, a short sail
// past Cinque Terre and nothing like its little pastel villages. Here the houses are a WALL: tall narrow tower-houses,
// six storeys, faded red and ochre and yellow and salmon with green shutters, packed shoulder to shoulder along the
// harbour (the palazzata) like a fortress. Dark grey rock and black-and-gold portoro marble; a grey stone castle on
// top; the black-and-white striped church of San Pietro out on the bare rock of the point; maritime pines, agave,
// prickly pear, capers and wild rosemary growing out of the walls; a deep blue-green sea; Palmaria island across a
// strait so narrow you could shout across it. Swifts round the castle, cormorants drying their wings, harbour cats.
//   pv_castle  (Castle Doria)  | pv_point   (San Pietro Point)
//   pv_borgo   (The Borgo)     | pv_harbour (The Harbour) *
//   pv_harbour: the quay under the palazzata: your boat, the mussel co-op, the bar, the cats on their step, the
//               fishing boats and the mussel-farm floats in the strait, and Palmaria across the water
//   pv_borgo:   inside the walls: the town gate of 1113, Via Capellini, the marble bottega, the Poets' bookshop, the
//               seashell shop, the nonnas' bench, and the steep steps up to the castle
//   pv_castle:  Castle Doria: the ramparts and the keep, the fig and olive slope, the widest view over the Gulf
//   pv_point:   San Pietro on its rock, the steps down to Byron's Grotto, the flat swimming rocks, the poets' bench
// Seasons: caper flowers on the walls in spring and summer; towels and swimmers on the rocks in summer; ripe figs in
// autumn; swifts round the castle from spring to autumn; big winter waves on the point; December lights at the bar.
import { dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { seasonOf } from "../data/items.js";

const C = {sea: "#2E7C80", sea2: "#4C9A97", deep: "#24686D", foam: "#E4F1EC", quay: "#C9C1B2", quay2: "#B2A999", lane: "#CDC4B3", lane2: "#B7AD9C",
  rock: "#6B6762", rock2: "#545150", rock3: "#8E8A84", rock4: "#A8A39A", slate: "#6C6E74", stone: "#9D988F", stone2: "#B4AFA5", stone3: "#7A756D",
  shutter: "#4F7A58", shutter2: "#3E6447", portoro: "#211F1E", gold: "#C9A24A", pine: "#3F5E3A", pine2: "#587B4A", bark: "#7A4E3C",
  scrub: "#AFAB88", scrub2: "#9C9876", agave: "#7FA39A", pear: "#6E9A5A", olive: "#98AA86", white: "#ECE7DA", black: "#2B2B2E", iron: "#3F4A50", wood: "#7A5A44", ink: "#2F2B28",
  // faded red, ochre, yellow, salmon: the tower-houses
  walls: ["#C8705A", "#D9A257", "#E4C26E", "#E39A82", "#B9604A", "#D88E6E", "#E0B46A", "#CF7F66", "#D7A98A"], doors: ["#3E6447", "#5A3A2E", "#2F4A5E", "#6A2E2A"]};
const ssn = () => seasonOf(dayKey());
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const f1 = n => n.toFixed(1);
const NP = s => `<g pointer-events="none">${s}</g>`;

/* ---------- pieces ---------- */
// a window with its green shutters, open (folded back either side) or shut against the sun
const shutterWin = (cx, wy, open, ww = 6) => open
  ? `<rect x="${f1(cx - ww/2 - 4)}" y="${f1(wy)}" width="4" height="12" style="fill:${C.shutter}"/><rect class="wglow" x="${f1(cx - ww/2)}" y="${f1(wy)}" width="${ww}" height="12" style="fill:#3E4146"/><rect x="${f1(cx + ww/2)}" y="${f1(wy)}" width="4" height="12" style="fill:${C.shutter}"/><path d="M${f1(cx - ww/2 - 4)} ${f1(wy + 12.5)} h${ww + 8}" style="stroke:#EDE6D6" stroke-width="1"/>`
  : `<rect x="${f1(cx - ww/2 - 1)}" y="${f1(wy)}" width="${ww + 2}" height="12" style="fill:${C.shutter}"/><path d="M${f1(cx - ww/2 - 1)} ${f1(wy + 3)} h${ww + 2} M${f1(cx - ww/2 - 1)} ${f1(wy + 6)} h${ww + 2} M${f1(cx - ww/2 - 1)} ${f1(wy + 9)} h${ww + 2} M${f1(cx)} ${f1(wy)} v12" style="stroke:${C.shutter2}" stroke-width=".6"/><path d="M${f1(cx - ww/2 - 2)} ${f1(wy + 12.5)} h${ww + 4}" style="stroke:#EDE6D6" stroke-width="1"/>`;
// a tower-house: tall and narrow, up to six storeys, faded plaster, green shutters, a flat slate roof with the odd
// rooftop loggia or chimney. Its base is its front step. o.door (+ o.sign, o.doorCol, o.frame: a portoro doorframe)
function tower(x, base, w, h, o = {}){
  const seed = Math.round(x*7 + base*13 + w*3), r = i => rnd(seed + i), wall = o.wall || C.walls[seed % C.walls.length], y = base - h;
  const floors = Math.max(2, Math.min(6, Math.round((h - 10)/30))), fh = (h - 10)/floors, cols = w < 34 ? 1 : 2;
  let wins = "";
  for (let f = 0; f < floors - 1; f++) for (let c = 0; c < cols; c++) {
    const cx = x + (cols === 1 ? w/2 : w*(c ? .72 : .28)), wy = y + 10 + f*fh + (fh - 13)/2;
    wins += shutterWin(cx, wy, r(f*5 + c) < .6, cols === 1 ? 7 : 5);
    if (!o.back && r(f*9 + c + 2) < .16) wins += `<rect x="${f1(cx - 6)}" y="${f1(wy + 12)}" width="12" height="2.4" style="fill:#8A6A52"/>${[-4, 0, 4].map((d, k) => `<circle cx="${f1(cx + d)}" cy="${f1(wy + 11)}" r="1.7" style="fill:${k === 1 ? "#6E9A5A" : "#C9483A"}"/>`).join("")}`;
  }
  // a string course under the top floor, and pale patches where the plaster has faded
  const trim = `<path d="M${x} ${f1(y + 10 + fh - 1)} h${w}" style="stroke:#FFFDF6" stroke-width="1.2" opacity=".45"/>${[0, 1].map(k => `<ellipse cx="${f1(x + w*(.2 + r(40 + k)*.6))}" cy="${f1(y + h*(.25 + r(50 + k)*.55))}" rx="${f1(w*.26)}" ry="${f1(fh*.7)}" style="fill:#FFFDF6" opacity=".14"/>`).join("")}`;
  // the ground floor: a shop door, or an arched street door, or a little barred window
  const gy = base - fh, dx = x + (o.doorX || w/2);
  let ground = `<rect x="${x}" y="${f1(gy)}" width="${w}" height="${f1(fh)}" style="fill:#3A2E28" opacity=".07"/>`;
  if (o.door) ground += (o.frame ? `<path d="M${dx - 11} ${base} V${base - 20} Q${dx} ${base - 33} ${dx + 11} ${base - 20} V${base}z" style="fill:${C.portoro}"/><path d="M${dx - 10} ${base - 6} q3 -6 1 -12 M${dx + 9} ${base - 4} q-2 -8 1 -14 M${dx - 4} ${base - 28} q5 2 9 -2" fill="none" style="stroke:${C.gold}" stroke-width=".8"/>` : "")
    + `<path d="M${dx - 8} ${base} V${base - 18} Q${dx} ${base - 28} ${dx + 8} ${base - 18} V${base}z" style="fill:${o.doorCol || C.doors[seed % C.doors.length]}"/><circle cx="${dx + 4}" cy="${base - 10}" r="1" style="fill:#E3C26A"/>`;
  else if (r(20) < .55) ground += `<path d="M${dx - 6} ${base} V${base - 14} Q${dx} ${base - 21} ${dx + 6} ${base - 14} V${base}z" style="fill:${C.doors[(seed + 1) % C.doors.length]}"/>`;
  else ground += `<rect class="wglow" x="${f1(dx - 4)}" y="${f1(gy + fh*.3)}" width="8" height="9" style="fill:#3E4146"/><path d="M${f1(dx - 1.5)} ${f1(gy + fh*.3)} v9 M${f1(dx + 1.5)} ${f1(gy + fh*.3)} v9" style="stroke:#8A8C90" stroke-width=".7"/>`;
  // the flat slate roof with its lip; a rooftop loggia or a chimney now and then
  const top = r(30) < .3 ? `<rect x="${f1(x + w*.15)}" y="${y - 12}" width="${f1(w*.5)}" height="12" style="fill:${wall}"/><path d="M${f1(x + w*.2)} ${y} v-8 q${f1(w*.1)} -4 ${f1(w*.2)} 0 v8" style="fill:#3E4146"/><rect x="${f1(x + w*.12)}" y="${y - 15}" width="${f1(w*.56)}" height="3" style="fill:${C.slate}"/>`
    : r(31) < .5 ? `<rect x="${f1(x + w*.65)}" y="${y - 10}" width="7" height="10" style="fill:${C.stone2}"/><rect x="${f1(x + w*.65 - 1)}" y="${y - 12}" width="9" height="2.4" style="fill:${C.slate}"/>` : "";
  const roof = `<rect x="${x - 1}" y="${y - 3}" width="${w + 2}" height="5" style="fill:${C.slate}"/>`;
  return sk(`${top}<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${wall}"/>${trim}${wins}${ground}${roof}${o.back ? `<rect x="${x}" y="${y - 3}" width="${w}" height="${h + 3}" style="fill:#DCE6E8" opacity=".28"/>` : ""}`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>${o.door ? `<path d="M${dx - 8} ${base} V${base - 18} Q${dx} ${base - 28} ${dx + 8} ${base - 18} V${base}"/>` : ""}`)
    + (o.sign ? `<rect x="${dx - 26}" y="${base - 44}" width="52" height="11" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${dx}" y="${base - 35.6}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7.4" fill="${C.ink}" pointer-events="none">${o.sign}</text>` : "");
}
// a wall of tower-houses shoulder to shoulder from x0: specs [w, h, o]; a shadow along their feet
const palazzata = (x0, base, specs) => { let x = x0; const out = specs.map(([w, h, o]) => { const s = tower(x, base, w, h, o); x += w; return s; }).join("");
  return `<rect x="${x0}" y="${base}" width="${x - x0}" height="7" style="fill:#3E4A50" opacity=".16" pointer-events="none"/>` + out; };
const water = (d, col = C.sea) => NP(sk(`<path d="${d}" style="fill:${col}"/>`, `<path d="${d}"/>`));
const waves = (pts, col = C.foam) => `<g pointer-events="none" style="stroke:${col}" stroke-width="1.4" fill="none" opacity=".85">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
// big stone flags, laid in courses
const flags = (x, y, w, h, col = C.quay2, s = 24) => `<g pointer-events="none" opacity=".55">${Array.from({length: Math.ceil(h/s)}, (_, k) => `<path d="M${x} ${y + k*s} H${x + w}" style="stroke:${col}" stroke-width=".8"/>${Array.from({length: Math.ceil(w/34)}, (_, j) => `<path d="M${x + j*34 + (k % 2)*17} ${y + k*s} v${s}" style="stroke:${col}" stroke-width=".8"/>`).join("")}`).join("")}</g>`;
const bollard = (x, y) => sk(`<rect x="${x - 3}" y="${y - 8}" width="6" height="9" rx="2" style="fill:${C.iron}"/><ellipse cx="${x}" cy="${y - 8}" rx="4" ry="1.6" style="fill:${C.iron}"/>`, "");
// a gozzo: the pointed Ligurian fishing boat, white with a coloured top strake and a little bow post
const gozzo = (x, y, stripe, dir = 1, i = 0, hull = "#F3EFE6") => NP(`<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.6;0 0" dur="${3 + i*.45}s" repeatCount="indefinite"/><ellipse cx="${x}" cy="${y + 3}" rx="28" ry="3" fill="${C.foam}" opacity=".55"/>
  ${sk(`<path d="M${x - 26*dir} ${y - 13} Q${x - 18*dir} ${y + 1} ${x} ${y + 1} Q${x + 18*dir} ${y + 1} ${x + 26*dir} ${y - 13}z" style="fill:${hull}"/><path d="M${x - 25*dir} ${y - 11} Q${x} ${y - 7} ${x + 25*dir} ${y - 11}" style="stroke:${stripe}" stroke-width="3" fill="none"/><path d="M${x + 25*dir} ${y - 13} l${3*dir} -6" style="stroke:${C.wood}" stroke-width="2"/><rect x="${x - 8}" y="${y - 19}" width="12" height="7" rx="1" style="fill:#D9CFC0"/>`,
    `<path d="M${x - 26*dir} ${y - 13} Q${x - 18*dir} ${y + 1} ${x} ${y + 1} Q${x + 18*dir} ${y + 1} ${x + 26*dir} ${y - 13}z"/>`)}</g>`);
// your own boat (the same boat as at home: white hull, blue stripe, red flag)
const yourBoat = (x, y) => NP(`<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0" dur="3.4s" repeatCount="indefinite"/>${sk(`<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z" style="fill:#FFFDF6"/><path d="M${x - 36} ${y - 10} h78" style="stroke:#3E6B8C" stroke-width="3"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3" style="fill:#CFE0EE"/><path d="M${x + 30} ${y - 36} v-22 l14 9z" style="fill:#E8566C"/>`,
  `<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3"/><path d="M${x + 30} ${y - 18} v-40 l14 9 l-14 4"/>`)}</g>`);
// the mussel farm: long lines of floats, black and orange, rising and falling on the swell
const musselFloats = (x1, x2, y0, rows, gap) => NP(Array.from({length: rows}, (_, k) => { const y = y0 + k*gap, n = Math.floor((x2 - x1)/9);
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.2;0 0" dur="${3.6 + k*.5}s" begin="${-k*.7}s" repeatCount="indefinite"/><path d="M${x1} ${y + 2} H${x2}" style="stroke:#1F2A2C" stroke-width=".7" opacity=".7"/>${Array.from({length: n}, (_, j) => `<ellipse cx="${x1 + 4 + j*9}" cy="${y}" rx="3.4" ry="2.6" style="fill:${(j + k) % 4 === 0 ? "#E8823A" : "#262628"};stroke:#1A1A1A" stroke-width=".5"/><ellipse cx="${x1 + 3 + j*9}" cy="${y - 1}" rx="1.2" ry=".7" fill="#FFFFFF" opacity=".35"/>`).join("")}</g>`; }).join(""));
// a cormorant: standing on a post or a rock with its wings hung out to dry, or flying low over the water
const cormorant = (x, y, s = 1) => NP(`<g>${sk(`<path d="M${x - 2*s} ${y - 14*s} L${x - 16*s} ${y - 20*s} L${x - 13*s} ${y - 8*s} z M${x + 2*s} ${y - 14*s} L${x + 16*s} ${y - 20*s} L${x + 13*s} ${y - 8*s} z" style="fill:#2A2A2E"/><ellipse cx="${x}" cy="${y - 9*s}" rx="${4*s}" ry="${8*s}" style="fill:#232326"/><path d="M${x} ${y - 16*s} q${-2*s} ${-5*s} ${s} ${-8*s}" style="stroke:#232326" stroke-width="${2.6*s}" fill="none"/><circle cx="${x + s}" cy="${y - 24*s}" r="${2.2*s}" style="fill:#232326"/><path d="M${x + 2.6*s} ${y - 24*s} l${4*s} ${s}" style="stroke:#C9A24A" stroke-width="${.9*s}"/>`, "")}<animateTransform attributeName="transform" type="translate" values="0 0;0 -.6;0 0" dur="2.6s" repeatCount="indefinite"/></g>`);
const flyingCormorant = (x, y, i = 0) => NP(`<g><path d="M${x - 10} ${y} q5 -5 10 0 q5 -5 10 0 M${x + 8} ${y - 1} l8 -1" fill="none" style="stroke:#232326" stroke-width="1.8"/><animateTransform attributeName="transform" type="translate" values="0 0;60 -6;120 0" dur="${18 + i*4}s" repeatCount="indefinite"/></g>`);
// swifts: little dark sickles screaming round and round the keep
const swifts = (cx, cy, r, n, dur, rev = false) => NP(`<g><animateTransform attributeName="transform" type="rotate" values="${rev ? `360 ${cx} ${cy};0 ${cx} ${cy}` : `0 ${cx} ${cy};360 ${cx} ${cy}`}" dur="${dur}s" repeatCount="indefinite"/>${Array.from({length: n}, (_, k) => { const a = k/n*Math.PI*2 + k*.4, x = cx + Math.cos(a)*r*(1 - (k % 3)*.12), y = cy + Math.sin(a)*r*.55;
  return `<path d="M${f1(x - 6)} ${f1(y + 1)} q3 -3 6 0 q3 -3 6 0 q-3 -1 -6 1 q-3 -2 -6 -1z" style="fill:#2A2A30;stroke:#2A2A30" stroke-width=".6"/>`; }).join("")}</g>`);
// a harbour cat: curled asleep, or sitting up and watching
const cat = (x, y, col, sit = false, stripes = false) => NP(sit
  ? sk(`<path d="M${x + 5} ${y} q10 2 8 -8" style="stroke:${col}" stroke-width="2.4" fill="none"/><ellipse cx="${x}" cy="${y - 6}" rx="6" ry="7" style="fill:${col}"/><circle cx="${x}" cy="${y - 15}" r="4.6" style="fill:${col}"/><path d="M${x - 4} ${y - 18} l1 -5 l3 3z M${x + 4} ${y - 18} l-1 -5 l-3 3z" style="fill:${col}"/>${stripes ? `<path d="M${x - 4} ${y - 8} h8 M${x - 5} ${y - 4} h10" style="stroke:#5A524A" stroke-width=".8"/>` : ""}<path d="M${x - 2} ${y - 15} h1 M${x + 1} ${y - 15} h1" style="stroke:#2F2B28" stroke-width=".9"/>`, "")
  : sk(`<ellipse cx="${x}" cy="${y - 4}" rx="10" ry="5" style="fill:${col}"/><circle cx="${x - 8}" cy="${y - 6}" r="4" style="fill:${col}"/><path d="M${x - 11} ${y - 9} l0 -4 l3 2z M${x - 6} ${y - 9.5} l1 -4 l2 3z" style="fill:${col}"/><path d="M${x + 9} ${y - 2} q2 4 -6 4" style="stroke:${col}" stroke-width="2.2" fill="none"/>${stripes ? `<path d="M${x - 2} ${y - 8} v6 M${x + 3} ${y - 8} v6" style="stroke:#5A524A" stroke-width=".8"/>` : ""}<path d="M${x - 10} ${y - 6} q1 1 2 0" style="stroke:#2F2B28" stroke-width=".7" fill="none"/>`, ""));
// a maritime pine: a leaning red-brown trunk and a flat dark umbrella of needles
const pine = (x, y, s = 1, lean = 1) => { const cx = x + 14*s*lean, cy = y - 64*s, cl = [[-20, 4, 17, 8], [18, 5, 19, 8], [-2, -3, 22, 10], [8, -9, 13, 6]];
  return NP(`<ellipse cx="${x + 10*s*lean}" cy="${y + 2}" rx="${30*s}" ry="${6*s}" fill="#3E4A50" opacity=".14"/>` + sk(`<path d="M${x - 2*s} ${y} Q${x + 2*s*lean} ${y - 30*s} ${x + 12*s*lean} ${y - 58*s} L${x + 17*s*lean} ${y - 57*s} Q${x + 8*s*lean} ${y - 30*s} ${x + 4*s} ${y}z" style="fill:${C.bark}"/><path d="M${x + 6*s*lean} ${y - 36*s} q${-10*s*lean} -6 ${-20*s*lean} -22 M${x + 10*s*lean} ${y - 48*s} q${10*s*lean} -4 ${20*s*lean} -12" style="stroke:${C.bark}" stroke-width="${2.4*s}" fill="none"/>`
    + cl.map(([dx, dy, rx, ry], k) => `<ellipse cx="${f1(cx + dx*s)}" cy="${f1(cy + dy*s)}" rx="${f1(rx*s)}" ry="${f1(ry*s)}" style="fill:${k > 1 ? C.pine2 : C.pine}"/>`).join(""),
    cl.slice(0, 3).map(([dx, dy, rx, ry]) => `<ellipse cx="${f1(cx + dx*s)}" cy="${f1(cy + dy*s)}" rx="${f1(rx*s)}" ry="${f1(ry*s)}"/>`).join(""))); };
// an agave: a rosette of stiff blue-grey leaves
const agave = (x, y, s = 1) => NP(sk([[-14, -6], [-10, -16], [-3, -20], [4, -19], [11, -14], [15, -5], [0, -12]].map(([dx, dy], k) => `<path d="M${x - 2*s} ${y} Q${x + dx*s*.4} ${y + dy*s*.7} ${x + dx*s} ${y + dy*s} Q${x + dx*s*.5} ${y + dy*s*.4} ${x + 2*s} ${y}z" style="fill:${k % 2 ? C.agave : "#6E938A"}"/>`).join(""), ""));
// prickly pear: paddles on paddles; yellow flowers in spring and summer, red fruit in autumn
const pear = (x, y, s = 1) => { const ss = ssn(), pads = [[0, -8, 7, 9], [-9, -18, 6, 8], [8, -20, 6, 8], [-2, -30, 5, 7], [14, -31, 5, 6]];
  return NP(sk(pads.map(([dx, dy, rx, ry]) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${rx*s}" ry="${ry*s}" style="fill:${C.pear}"/>`).join("") + pads.slice(1).map(([dx, dy, rx, ry], k) => `<circle cx="${x + dx*s + (k % 2 ? 3 : -2)*s}" cy="${y + (dy - ry + 1)*s}" r="${1.8*s}" style="fill:${ss === "autumn" ? "#C9483A" : ss === "winter" ? C.pear : "#F2C94C"}"/>`).join(""), "")); };
// a caper plant tumbling out of a wall: round leaves, and white-and-mauve flowers in spring and summer
const caper = (x, y, s = 1) => { const fl = ["spring", "summer"].includes(ssn());
  return NP(`<path d="M${x} ${y} q${-6*s} ${8*s} ${-4*s} ${16*s} M${x} ${y} q${6*s} ${6*s} ${8*s} ${14*s}" style="stroke:#5E7A4A" stroke-width="1" fill="none"/>${[[-3, 4], [-6, 10], [-4, 16], [3, 4], [6, 9], [8, 14], [0, 1]].map(([dx, dy]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${2*s}" style="fill:#6E9A5A"/>`).join("")}${fl ? [[-5, 8], [5, 11], [0, 3]].map(([dx, dy]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${2.6*s}" style="fill:#FFFDF6;stroke:#C9A0D6" stroke-width=".6"/><circle cx="${x + dx*s}" cy="${y + dy*s}" r=".9" style="fill:#9A5AB4"/>`).join("") : ""}`); };
// wild rosemary: a low grey-green clump, flowering pale blue in winter and spring
const rosemary = (x, y) => { const fl = ["winter", "spring"].includes(ssn());
  return NP(`${[-8, -4, 0, 4, 8].map((dx, k) => `<path d="M${x + dx*.4} ${y} q${dx*.6} -8 ${dx} -${10 + (k % 2)*3}" style="stroke:#6F8A72" stroke-width="2" fill="none" stroke-linecap="round"/>`).join("")}${fl ? [[-6, -9], [1, -12], [6, -8]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.4" style="fill:#9FB8E0"/>`).join("") : ""}`); };
// a grey boulder, and a tuft of dry grass
const boulder = (x, y, r = 12) => NP(sk(`<path d="M${x - r} ${y} Q${x - r} ${y - r*.9} ${x - r*.2} ${y - r} Q${x + r*.9} ${y - r*.9} ${x + r} ${y}z" style="fill:${C.rock}"/><path d="M${x - r*.4} ${y - r*.7} q${r*.4} -${r*.15} ${r*.7} 0" style="stroke:${C.rock4}" stroke-width="1.2" fill="none"/>`, `<path d="M${x - r} ${y} Q${x - r} ${y - r*.9} ${x - r*.2} ${y - r} Q${x + r*.9} ${y - r*.9} ${x + r} ${y}z"/>`));
const tuft = (x, y, col = "#8E8E6A") => `<path d="M${x - 4} ${y} q2 -7 4 -1 q2 -8 4 0 q1 -5 3 1" fill="none" style="stroke:${col}" stroke-width="1.2" pointer-events="none"/>`;
const bench = (x, y, col = C.wood) => NP(sk(`<rect x="${x - 18}" y="${y - 10}" width="36" height="4" style="fill:${col}"/><rect x="${x - 18}" y="${y - 18}" width="36" height="4" style="fill:${col}"/><path d="M${x - 15} ${y - 6} v8 M${x + 15} ${y - 6} v8" style="stroke:${C.iron}" stroke-width="2"/>`, ""));
// crenellations along a wall top: square merlons
const merlons = (x1, x2, y, col = C.stone, step = 14) => Array.from({length: Math.floor((x2 - x1)/step)}, (_, k) => `<rect x="${x1 + k*step}" y="${y - 8}" width="${step*.55}" height="8" style="fill:${col}"/>`).join("");
const blocks = (x, y, w, h, s = 12) => `<path d="${Array.from({length: Math.floor(h/s)}, (_, k) => `M${x} ${y + (k + 1)*s} h${w}`).join(" ")}" style="stroke:${C.stone3}" stroke-width=".5" opacity=".6"/>`;
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:${C.iron}"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 22} h16" style="stroke:${C.sea}" stroke-width="2"/>`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
// the tap area over your boat (the drawing itself ignores taps): the boat was hard to tap to sail home
const boatHit = (x, y) => `<rect x="${x - 50}" y="${y - 66}" width="104" height="76" fill="transparent" pointer-events="all"/>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
// black-and-white stripes, the way San Pietro is built: a band of dark stone, a band of pale
const stripes = (x, y, w, h, b = 7) => Array.from({length: Math.ceil(h/b)}, (_, k) => `<rect x="${x}" y="${f1(y + k*b)}" width="${w}" height="${f1(Math.min(b, h - k*b))}" style="fill:${k % 2 ? C.white : C.black}"/>`).join("");
const stripedGable = (x, w, yb, ht, b = 7) => Array.from({length: Math.ceil(ht/b)}, (_, k) => { const y1 = yb - k*b, y2 = Math.max(yb - ht, y1 - b), h1 = w/2*(1 - (yb - y1)/ht), h2 = w/2*(1 - (yb - y2)/ht), cx = x + w/2;
  return `<path d="M${f1(cx - h1)} ${f1(y1)} L${f1(cx - h2)} ${f1(y2)} H${f1(cx + h2)} L${f1(cx + h1)} ${f1(y1)}z" style="fill:${k % 2 ? C.white : C.black}"/>`; }).join("");
const lights = (x1, x2, y) => +dayKey().slice(5, 7) === 12 ? NP(`<path d="M${x1} ${y} Q${(x1 + x2)/2} ${y + 6} ${x2} ${y}" fill="none" style="stroke:#3A3430" stroke-width=".6"/>${Array.from({length: 7}, (_, k) => { const t = k/6, xx = x1 + (x2 - x1)*t, yy = y + 6*4*t*(1 - t); return `<circle class="twinkle" cx="${f1(xx)}" cy="${f1(yy + 2)}" r="2" fill="${["#F3C969", "#E8566C", "#9FD3E8"][k % 3]}" style="animation-delay:${k*.3}s"/>`; }).join("")}`) : "";

/* ---------- pv_harbour: the quay under the palazzata ---------- */
function harbourScreen(){
  const s = ssn();
  const ground = `<rect width="520" height="640" style="fill:${C.quay}"/>${flags(0, 214, 420, 390)}<g filter="url(#wash)" opacity=".35" pointer-events="none"><ellipse cx="250" cy="420" rx="150" ry="110" fill="#E3DACA"/></g>`;
  // the strait: down the east side and along the bottom, deep blue-green; Palmaria close across it
  const sea = water("M420 0 H520 V640 H0 V600 H384 Q420 600 420 564z") + waves([[436, 30], [434, 110], [440, 356], [90, 618], [200, 626], [400, 622]]);
  const kerb = NP(`<path d="M420 0 V564 Q420 600 384 600 H0" fill="none" style="stroke:#DCD5C8" stroke-width="5"/>${[150, 240, 330, 420, 510].map(y => bollard(413, y)).join("")}${[90, 200].map(x => bollard(x, 596)).join("")}`);
  const palmaria = place("pvpalmaria", 392, 330, 28, 9, "The view across the strait to Palmaria", sk(`<path d="M476 0 H520 V344 Q504 338 496 306 Q482 254 492 196 Q478 124 488 64 Q482 26 476 0z" style="fill:#7E9A6A"/><path d="M476 0 Q482 26 488 64 Q478 124 492 196 Q482 254 496 306 Q504 338 520 344 V334 Q510 330 504 304 Q492 254 502 196 Q488 124 498 64 Q492 26 488 0z" style="fill:${C.rock}"/>`,
    `<path d="M476 0 Q482 26 488 64 Q478 124 492 196 Q482 254 496 306 Q504 338 520 344"/>`) + [[506, 40, .4], [510, 130, .38], [508, 230, .42], [514, 300, .32]].map(([x, y, k]) => pine(x, y, k, -1)).join(""), "Palmaria", 372, 354, "#BFE0DA");
  // the palazzata: the wall of tower-houses along the top, the mussel co-op and the bar at its foot
  const wall = palazzata(0, 214, [[34, 196], [32, 188], [32, 204], [32, 184], [40, 200, {door: true, sign: "Mussels", doorCol: "#2F4A5E"}], [30, 182], [26, 204], [26, 190], [48, 186, {door: true, sign: "Bar Tonio", doorCol: C.shutter2}], [28, 200], [28, 176]]);
  const wallPlace = place("pvwall", 196, 300, 34, 10, "The palazzata, the wall of tower-houses", "", "The palazzata", 196, 320);
  // the mussel co-op: crates and a coil of rope by the door; in autumn the nets hung out to dry
  const mussels = place("pvmussels", 150, 232, 22, 8, "The mussel co-op", NP(sk(`<rect x="178" y="222" width="26" height="14" style="fill:#3E6B8C"/><rect x="182" y="210" width="22" height="12" style="fill:#E8823A"/><path d="M178 229 h26 M182 216 h22" style="stroke:#1F2A2C" stroke-width=".6"/><ellipse cx="116" cy="230" rx="9" ry="4" style="fill:#C9A86A"/><ellipse cx="116" cy="229" rx="4" ry="1.6" style="fill:#8A6A3A"/>`, "")
    + (s === "autumn" ? `<path d="M10 150 h52" style="stroke:${C.wood}" stroke-width="1.4"/>${[16, 28, 40, 52].map(x => `<path d="M${x} 150 q-2 14 0 30 q2 14 0 24" style="stroke:#3E8A6A" stroke-width="4" fill="none" opacity=".75" stroke-dasharray="2 1.5"/>`).join("")}` : "")), "Mussel co-op", 150, 254, "#BFE0DA");
  // the bar: a green awning, two little tables out on the quay, lights along it in December
  const bar = place("pvbar", 276, 232, 22, 8, "The bar on the quay", NP(sk(`<path d="M252 182 h48 v6 ${Array.from({length: 6}, () => "q-4 5 -8 0").join(" ")}z" style="fill:${C.shutter}"/><path d="M252 186 h48" style="stroke:#FFFDF6" stroke-width="1.2"/>`, `<path d="M252 182 h48 v6"/>`)
    + [[233, 246], [321, 246]].map(([x, y]) => sk(`<rect x="${x - 10}" y="${y - 6}" width="5" height="9" style="fill:${C.wood}"/><rect x="${x + 5}" y="${y - 6}" width="5" height="9" style="fill:${C.wood}"/><ellipse cx="${x}" cy="${y - 6}" rx="7" ry="3" style="fill:#FFFDF6"/><path d="M${x} ${y - 3} v8" style="stroke:${C.iron}" stroke-width="1.4"/><path d="M${x - 2} ${y - 9} v-3 h3 v3" style="fill:#E8823A"/>`, "")).join("") + lights(252, 300, 190)), "Bar Tonio", 276, 254, "#F2C9B4");
  // the houses running down the west side, two rows climbing behind each other
  const west = palazzata(0, 340, [[34, 126, {back: true}], [32, 120, {back: true}], [32, 126, {back: true}]]) + palazzata(0, 470, [[30, 128], [36, 120], [32, 124]]) + caper(98, 300) + caper(60, 360, .9);
  // the cats' sunny step at the foot of the houses
  const cats = place("pvcats", 150, 456, 24, 8, "The harbour cats on their sunny step", NP(sk(`<rect x="98" y="444" width="34" height="26" style="fill:${C.stone2}"/><path d="M98 456 h34" style="stroke:${C.stone3}" stroke-width=".8"/>`, `<rect x="98" y="444" width="34" height="26"/>`))
    + cat(114, 455, "#D98A4A", false, true) + cat(124, 444, "#8A8580", true, true) + cat(216, 254, C.black, true), "Harbour cats", 150, 480, "#F2C9B4");
  // the rocks and the stone stair up the north end, towards the point
  const north = NP(sk(`<path d="M356 214 Q362 190 358 160 Q366 140 360 110 L376 102 Q384 150 378 214z" style="fill:${C.rock}"/><path d="M362 124 l10 4 M360 168 l14 4 M364 196 l10 2" style="stroke:${C.rock2}" stroke-width="1"/>`, `<path d="M356 214 Q362 190 358 160 Q366 140 360 110 L376 102 Q384 150 378 214"/>`)
    + sk(`<rect x="376" y="0" width="44" height="70" style="fill:${C.stone2}"/>${Array.from({length: 7}, (_, k) => `<path d="M376 ${k*10} H420" style="stroke:${C.stone3}" stroke-width=".8"/>`).join("")}`, `<rect x="376" y="0" width="44" height="70"/>`))
    + agave(368, 222, .8) + caper(366, 128) + caper(372, 170, .8);
  const boats = gozzo(448, 148, "#3E6B8C", -1, 0) + gozzo(450, 236, C.shutter, 1, 1) + gozzo(447, 318, "#C9483A", -1, 2)
    + NP(`<path d="M413 146 L424 138 M413 236 L424 228 M413 326 L424 312" style="stroke:#3A3430" stroke-width=".7"/>`);
  const farm = musselFloats(434, 512, 396, 5, 38) + NP(sk(`<rect x="434" y="370" width="5" height="26" style="fill:${C.wood}"/>`, "")) + cormorant(436, 372, .9) + flyingCormorant(150, 612, 0);
  const boat = place("pvboat", 330, 578, 34, 10, "Your boat at the quay", yourBoat(326, 634) + boatHit(326, 634) + `<rect x="180" y="574" width="96" height="30" fill="transparent" pointer-events="all"/>`, "Your boat", 228, 588, "#BFE0DA");
  return ground + sea + palmaria + farm + boats + kerb + wall + north + west + wallPlace + mussels + bar + cats + boat
    + gate("pvToBorgo", 20, 526, "The Borgo", 76, 560, "West through the old gate into the Borgo")
    + gate("pvToPoint", 398, 40, "San Pietro", 392, 92, "North along the rocks to San Pietro", "#BFE0DA");
}

/* ---------- pv_borgo: inside the walls ---------- */
function borgoScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.lane}"/>${flags(0, 214, 456, 400, C.lane2, 20)}`;
  // Via Capellini: the lane in through the gate, along, and up to the foot of the castle steps; a slate gutter down it
  const lane = NP(`<path d="M456 432 H310 Q256 432 256 378 V214" fill="none" style="stroke:#D9D1C2" stroke-width="64" stroke-linejoin="round" opacity=".55" filter="url(#wob)"/><path d="M456 432 H310 Q256 432 256 378 V214" fill="none" style="stroke:${C.slate}" stroke-width="3" stroke-dasharray="7 3" opacity=".45"/>`);
  const pots = [[30, 272], [104, 482], [178, 224], [318, 224], [438, 224], [138, 480]].map(([x, y], k) => NP(sk(`<path d="M${x - 6} ${y} h12 l-2 -9 h-8z" style="fill:#B9604A"/>`, "") + `<circle cx="${x - 3}" cy="${y - 12}" r="2.4" fill="${k % 2 ? "#E8566C" : "#C9483A"}"/><circle cx="${x + 3}" cy="${y - 13}" r="2.4" fill="#C9483A"/><circle cx="${x}" cy="${y - 10}" r="2" fill="#6E9A5A"/>`)).join("");
  // the steep steps up to the castle between the houses, with a little arch over them and washing across
  const steps = NP(sk(`<rect x="220" y="0" width="70" height="214" style="fill:${C.stone2}"/>${Array.from({length: 24}, (_, k) => `<path d="M220 ${k*9} H290" style="stroke:${C.stone3}" stroke-width=".8"/>`).join("")}`, `<rect x="220" y="0" width="70" height="214"/>`)
    + sk(`<path d="M214 132 H298 V172 H290 Q256 136 222 172 H214z" style="fill:#D9A257"/>`, `<path d="M214 132 H298 V172 H290 Q256 136 222 172 H214z"/>`)
    + `<path d="M214 62 Q256 74 298 58" fill="none" style="stroke:#3A3430" stroke-width=".7"/>${[[232, 66, "#FFFDF6"], [246, 68, "#9FC3D9"], [266, 67, "#E8566C"], [282, 63, "#F3C969"]].map(([x, y, c]) => `<rect x="${x - 4}" y="${y}" width="8" height="11" style="fill:${c};stroke:var(--line)" stroke-width=".6"/>`).join("")}`);
  const top = palazzata(0, 214, [[36, 200], [34, 192], [40, 206], [40, 196, {door: true, sign: "Marmi", doorCol: "#5A3A2E", frame: true}], [30, 188], [34, 200]])
    + palazzata(298, 214, [[36, 194], [44, 204, {door: true, sign: "Poets' Books", doorCol: C.shutter2}], [38, 186], [40, 198]]);
  // the marble bottega: a black-and-gold portoro slab leaning by the door
  const bottega = place("pvbottega", 130, 232, 22, 8, "Ilario's marble bottega", NP(sk(`<path d="M152 214 L156 186 H170 L168 214z" style="fill:${C.portoro}"/><path d="M155 206 q5 -6 3 -14 M160 212 q4 -10 8 -12" fill="none" style="stroke:${C.gold}" stroke-width=".9"/><rect x="90" y="202" width="20" height="12" style="fill:#EDE8DC"/><path d="M92 210 q6 -4 14 -2" style="stroke:#9A9A94" stroke-width=".6" fill="none"/>`, `<path d="M152 214 L156 186 H170 L168 214z"/>`)), "Marble bottega", 130, 254, "#E8C9A8");
  // the Poets' bookshop: a little cart of books outside
  const books = place("pvbooks", 356, 232, 22, 8, "The Poets' bookshop", NP(sk(`<rect x="384" y="214" width="28" height="14" style="fill:${C.wood}"/>${[0, 1, 2, 3, 4, 5].map(k => `<rect x="${386 + k*4}" y="${206 - (k % 2)*2}" width="3.4" height="${10 + (k % 2)*2}" style="fill:${["#C9483A", "#3E6B8C", "#E3C26A", C.shutter, "#8A3A4A", "#EDE8DC"][k]}"/>`).join("")}<circle cx="388" cy="230" r="3" style="fill:${C.iron}"/><circle cx="408" cy="230" r="3" style="fill:${C.iron}"/>`, `<rect x="384" y="214" width="28" height="14"/>`)), "Poets' bookshop", 352, 254, "#BFE0DA");
  // down the west side: tall houses, Signora Lia's shell shop with garlands of shells round the door
  const westRow = palazzata(0, 470, [[40, 196], [42, 188, {door: true, sign: "Conchiglie", doorCol: "#2F4A5E"}], [40, 204]]);
  const shells = place("pvshells", 61, 490, 22, 8, "Signora Lia's seashell shop", NP(`<path d="M47 470 Q46 446 53 432 M75 470 Q76 446 69 432" fill="none" style="stroke:#8A7A6A" stroke-width=".6"/>${[[47, 466], [46, 458], [47, 450], [49, 442], [52, 435], [75, 466], [76, 458], [75, 450], [73, 442], [70, 435]].map(([x, y], k) => `<path d="M${x - 2.4} ${y + 1.6} q2.4 -6 4.8 0z" style="fill:${["#F4D7C8", "#FFFDF6", "#E8C9A8", "#F2B9A8"][k % 4]};stroke:var(--line)" stroke-width=".5"/>`).join("")}<g><animateTransform attributeName="transform" type="rotate" values="-4 96 404;4 96 404;-4 96 404" dur="5s" repeatCount="indefinite"/><path d="M96 404 v10 M88 414 h16 M88 414 v8 M104 414 v8 M96 414 v12" style="stroke:#8A7A6A" stroke-width=".6"/>${[[88, 424], [104, 424], [96, 428]].map(([x, y]) => `<path d="M${x - 2.6} ${y + 1.6} q2.6 -6 5.2 0z" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".5"/>`).join("")}</g>`), "Seashell shop", 66, 510, "#F2C9B4");
  const bottom = palazzata(0, 660, [[46, 118], [40, 112], [52, 120], [46, 116]]);
  // the town wall down the east side: the gate tower with its arch and the carved date, 1113
  const townWall = NP(sk(`<rect x="456" y="0" width="64" height="640" style="fill:${C.stone}"/>${blocks(456, 0, 64, 640, 14)}<rect x="448" y="236" width="72" height="156" style="fill:${C.stone2}"/>${blocks(448, 236, 72, 156, 14)}${merlons(448, 520, 236, C.stone2, 14)}<path d="M456 470 V420 Q488 380 520 420 V470z" style="fill:#4A4642"/><path d="M462 470 V424 Q488 392 514 424 V470z" style="fill:#6A6560"/>`,
    `<rect x="448" y="236" width="72" height="156"/><path d="M456 470 V420 Q488 380 520 420"/><path d="M456 0 V236 M456 392 V420 M456 470 V640"/>`)
    + `<rect x="466" y="352" width="44" height="22" rx="2" style="fill:#E6E0D2;stroke:var(--line)" stroke-width=".8"/><text x="488" y="361" text-anchor="middle" font-family="Klee One,serif" font-size="5.6" fill="${C.ink}">COLONIA IANUENSIS</text><text x="488" y="371" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="8" fill="${C.ink}">1113</text>`
    + sk(`<rect x="472" y="270" width="6" height="18" rx="3" style="fill:#3E4146"/><rect x="492" y="270" width="6" height="18" rx="3" style="fill:#3E4146"/>`, "")) + caper(462, 520) + caper(500, 130, .9) + agave(486, 620, .9);
  const gatePlace = place("pvgate", 420, 432, 26, 9, "The town gate, carved 1113", "", "The 1113 gate", 398, 398, "#E8C9A8");
  const lanePlace = place("pvlane", 250, 340, 28, 9, "Via Capellini, the narrow lane", "", "Via Capellini", 250, 360);
  // the nonnas' bench against the low wall at the bottom, geraniums in pots, a basket of beans to shell
  const nonnas = place("pvnonnas", 320, 566, 30, 9, "The nonnas' bench", NP(sk(`<rect x="184" y="594" width="272" height="46" style="fill:${C.stone2}"/>${blocks(184, 594, 272, 46, 12)}`, `<rect x="184" y="594" width="272" height="46"/>`) + bench(320, 600, "#3E6447")
    + sk(`<rect x="306" y="584" width="12" height="4" style="fill:#C9805A"/><rect x="324" y="584" width="12" height="4" style="fill:#E3C26A"/><path d="M346 600 h14 l-2 -8 h-10z" style="fill:#C9A86A"/>${[350, 353, 356].map(x => `<path d="M${x} 592 q1 -4 3 -5" style="stroke:#6E9A5A" stroke-width="1.6" fill="none"/>`).join("")}`, "")
    + [[204, 592], [228, 592], [420, 592], [440, 592]].map(([x, y]) => sk(`<path d="M${x - 6} ${y} h12 l-2 -9 h-8z" style="fill:#B9604A"/>`, "") + `<circle cx="${x - 3}" cy="${y - 12}" r="2.4" fill="#C9483A"/><circle cx="${x + 3}" cy="${y - 13}" r="2.4" fill="#E8566C"/><circle cx="${x}" cy="${y - 10}" r="2" fill="#6E9A5A"/>`).join("")) + cat(392, 590, "#EDE8DC", false), "Nonnas' bench", 320, 624, "#F2C9B4");
  return ground + lane + steps + top + westRow + pots + bottega + books + shells + bottom + townWall + gatePlace + lanePlace + nonnas
    + rosemary(150, 528) + caper(126, 300, .9)
    + gate("pvToHarbour", 500, 432, "The harbour", 470, 494, "East out through the gate to the harbour", "#BFE0DA")
    + gate("pvToCastle", 256, 40, "Castle steps", 256, 106, "North up the steep steps to the castle");
}

/* ---------- pv_castle: Castle Doria, the fig and olive slope, the gulf ---------- */
function castleScreen(){
  const s = ssn();
  const ground = `<rect width="520" height="640" style="fill:${C.scrub}"/><g filter="url(#wash)" opacity=".5" pointer-events="none"><ellipse cx="250" cy="430" rx="210" ry="150" fill="#C2BD98"/></g>`;
  // the Gulf of Poets: the deep sea off the top right, Lerici's castle tiny on the far shore, a sail or two
  const sea = water("M366 0 H520 V280 Q484 268 444 274 Q404 280 386 256 Q372 212 366 160z") + NP(sk(`<path d="M366 0 H520 V30 Q490 36 460 26 Q430 18 400 26 Q380 30 366 26z" style="fill:#A3B5A6"/><rect x="474" y="12" width="12" height="9" style="fill:#C9C2B2"/><rect x="478" y="7" width="5" height="5" style="fill:#C9C2B2"/>`, "")
    + [[426, 120, 0], [480, 190, 1]].map(([x, y, i]) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;-14 2;0 0" dur="${30 + i*8}s" repeatCount="indefinite"/><path d="M${x} ${y} v-14 l9 13z" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".7"/><path d="M${x - 7} ${y + 1} h16 l-3 3 h-10z" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".7"/></g>`).join("")) + waves([[400, 70], [460, 100], [420, 210], [490, 240]]);
  // the walls along the cliff edge, crenellated, following the curve down
  const parapetPts = [[370, 176], [374, 202], [380, 226], [390, 252], [406, 268], [426, 274], [446, 272], [466, 270], [486, 270], [506, 274]];
  const parapet = NP(sk(`<path d="M366 150 Q372 214 386 256 Q404 282 444 276 Q484 270 520 280" fill="none" style="stroke:${C.stone}" stroke-width="10"/>${parapetPts.map(([x, y]) => `<rect x="${x - 3.5}" y="${y - 12}" width="7" height="7" style="fill:${C.stone}"/>`).join("")}`, `<path d="M366 150 Q372 214 386 256 Q404 282 444 276 Q484 270 520 280"/>`));
  const view = place("pvgulfview", 430, 300, 30, 9, "The view over the Gulf of Poets", bench(452, 296), "Gulf of Poets", 438, 320, "#BFE0DA");
  // Castle Doria: the curtain wall, the bastion, the square keep with its flag, the gate
  const castle = place("pvcastle", 196, 250, 40, 10, "The castle ramparts", NP(pine(70, 110, .8) + pine(310, 104, .7, -1))
    + sk(`<path d="M8 230 Q60 240 120 232 Q200 242 280 232 Q330 238 372 228 V214 H8z" style="fill:${C.rock2}"/><rect x="16" y="92" width="58" height="130" style="fill:${C.stone3}"/>${blocks(16, 92, 58, 130, 13)}${merlons(16, 76, 92, C.stone3, 12)}<rect x="16" y="110" width="350" height="112" style="fill:${C.stone}"/>${blocks(16, 110, 350, 112, 13)}${merlons(76, 366, 110, C.stone, 16)}
      <rect x="150" y="26" width="92" height="196" style="fill:${C.stone2}"/>${blocks(150, 26, 92, 196, 14)}${merlons(150, 246, 26, C.stone2, 16)}${[[170, 60], [222, 60], [196, 110]].map(([x, y]) => `<rect x="${x - 2}" y="${y}" width="4" height="14" style="fill:#3E4146"/>`).join("")}
      <path d="M182 222 V198 Q196 182 210 198 V222z" style="fill:#3E3A36"/><path d="M186 198 V222 M192 192 V222 M198 190 V222 M204 192 V222 M182 206 H210 M182 214 H210" style="stroke:#6A645E" stroke-width=".7"/>${[[90, 160], [300, 160], [330, 150]].map(([x, y]) => `<rect x="${x - 2}" y="${y}" width="4" height="12" style="fill:#3E4146"/>`).join("")}`,
      `<rect x="16" y="92" width="58" height="130"/><rect x="16" y="110" width="350" height="112"/><rect x="150" y="26" width="92" height="196"/><path d="M182 222 V198 Q196 182 210 198 V222"/>`)
    + NP(`<path d="M196 14 v-14" style="stroke:${C.iron}" stroke-width="1.4"/><g><animateTransform attributeName="transform" type="skewY" values="0;-4;0" dur="3s" repeatCount="indefinite"/><rect x="197" y="1" width="16" height="11" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".6"/><path d="M205 1 v11 M197 6.5 h16" style="stroke:#C9483A" stroke-width="2.4"/></g>`) + caper(120, 150) + caper(270, 130, .9) + caper(340, 180, .8), "Castle Doria", 196, 270, "#E8C9A8");
  // the dirt path: up from the steps to the castle gate, and off east along below the walls
  const paths = NP(`<g filter="url(#wob)"><path d="M256 640 V560 Q256 440 222 340 Q204 290 196 236 M236 400 Q330 350 420 372 Q480 392 504 432" fill="none" style="stroke:#C9BC9C" stroke-width="28" stroke-linecap="round"/><path d="M256 640 V560 Q256 440 222 340 Q204 290 196 236 M236 400 Q330 350 420 372 Q480 392 504 432" fill="none" style="stroke:#DCD0B2" stroke-width="20" stroke-linecap="round"/></g>`)
    + NP(sk(`<rect x="228" y="548" width="56" height="92" style="fill:${C.stone2}"/>${Array.from({length: 11}, (_, k) => `<path d="M228 ${548 + k*9} H284" style="stroke:${C.stone3}" stroke-width=".8"/>`).join("")}`, `<rect x="228" y="548" width="56" height="92"/>`));
  // the fig and olive slope: dry stone terraces, silvery olives, a big fig (purple figs in autumn)
  const olive = (x, y, k = 1) => NP(sk(`<path d="M${x - 3} ${y} q-2 -10 2 -18 q4 -4 2 -10" style="stroke:#6A5A4A" stroke-width="${4*k}" fill="none"/>${[[-10, -26, 11, 8], [10, -28, 12, 8], [0, -36, 12, 8], [-2, -22, 9, 5]].map(([dx, dy, rx, ry], j) => `<ellipse cx="${x + dx*k}" cy="${y + dy*k}" rx="${rx*k}" ry="${ry*k}" style="fill:${j === 2 ? "#AFC09C" : C.olive}"/>`).join("")}`, [[-10, -26, 11, 8], [10, -28, 12, 8], [0, -36, 12, 8]].map(([dx, dy, rx, ry]) => `<ellipse cx="${x + dx*k}" cy="${y + dy*k}" rx="${rx*k}" ry="${ry*k}"/>`).join(""))
    + (s === "autumn" || s === "winter" ? [[-8, -24], [6, -30], [12, -22]].map(([dx, dy]) => `<circle cx="${x + dx*k}" cy="${y + dy*k}" r="1.5" fill="#3A3A2E"/>`).join("") : ""));
  const terraces = NP([330, 430, 530].map((y, k) => `<path d="M0 ${y} Q${90 + k*10} ${y - 10} ${190 - k*6} ${y + 8}" fill="none" style="stroke:${C.stone3}" stroke-width="10" stroke-linecap="round"/><path d="M0 ${y} Q${90 + k*10} ${y - 10} ${190 - k*6} ${y + 8}" fill="none" style="stroke:${C.stone2}" stroke-width="7" stroke-dasharray="6 2.4" stroke-linecap="round"/>`).join(""));
  const fig = NP(sk(`<path d="M80 438 q-4 -16 0 -30 M80 420 q10 -8 18 -20 M80 418 q-12 -6 -18 -18" style="stroke:#8A7A6A" stroke-width="4" fill="none"/>${[[60, 396], [80, 386], [100, 394], [70, 410], [94, 408], [82, 400]].map(([x, y], k) => `<path d="M${x} ${y + 9} l-8 -6 l3 -6 l-4 -6 l7 -1 l2 -6 l4 5 l4 -5 l2 6 l7 1 l-4 6 l3 6z" style="fill:${k % 2 ? "#5E8A44" : "#6E9A52"}"/>`).join("")}`, "")
    + (s === "autumn" ? [[66, 404], [88, 396], [98, 410], [76, 414]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="3.6" fill="#6A3A6A" stroke="#2F2B28" stroke-width=".5"/>`).join("") : s === "summer" ? [[70, 404], [92, 400]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#9AB46A"/>`).join("") : ""));
  const figs = place("pvfigs", 140, 456, 30, 9, "The fig and olive slope", terraces + olive(40, 362, .9) + fig + olive(150, 544) + olive(60, 604, .85), "Figs and olives", 140, 476, "#E8C9A8");
  // swifts screaming round the keep, from spring to autumn; in winter just a kestrel hanging on the wind
  const birds = s === "winter" ? NP(`<g><animateTransform attributeName="transform" type="translate" values="0 0;3 -2;0 0" dur="2s" repeatCount="indefinite"/><path d="M300 60 q6 -6 12 -2 q6 -4 12 2 M312 58 v6" fill="none" style="stroke:#6A4A3A" stroke-width="1.8"/></g>`)
    : swifts(196, 80, 120, s === "autumn" ? 4 : 7, 14) + swifts(196, 110, 70, s === "autumn" ? 2 : 5, 9, true);
  const scrubby = pine(424, 612, 1.05) + pine(486, 552, .85, -1) + pear(340, 600) + agave(498, 318, .9) + agave(300, 268, .9) + rosemary(30, 300) + rosemary(360, 484) + rosemary(170, 620) + rosemary(330, 250) + boulder(26, 478, 14) + boulder(494, 358, 12) + boulder(116, 610, 10)
    + [[40, 250], [120, 300], [330, 320], [300, 520], [210, 590], [400, 480], [460, 520], [90, 500], [370, 560]].map(([x, y]) => tuft(x, y)).join("");
  return ground + sea + parapet + paths + figs + castle + view + scrubby + birds
    + gate("pvToBorgoS", 256, 612, "The Borgo", 188, 616, "South down the steep steps to the Borgo")
    + gate("pvToPointW", 500, 430, "San Pietro", 452, 470, "East along the walls down to San Pietro", "#BFE0DA");
}

/* ---------- pv_point: San Pietro on its rock, Byron's Grotto, the swimming rocks ---------- */
function pointScreen(){
  const s = ssn(), winter = s === "winter";
  const ground = `<rect width="520" height="640" style="fill:${C.rock3}"/><g filter="url(#wash)" opacity=".55" pointer-events="none"><ellipse cx="260" cy="420" rx="200" ry="150" fill="${C.rock4}"/><ellipse cx="200" cy="600" rx="140" ry="50" fill="#B9B4AA"/></g>
    <g pointer-events="none" style="stroke:${C.rock}" stroke-width=".8" fill="none" opacity=".7"><path d="M150 330 l30 12 l14 -6 M260 520 l20 -10 l26 6 M90 520 l26 14 M330 360 l22 -10 M200 470 l-18 16"/></g>`;
  // the sea round three sides: the open sea off the top and the grotto's cove (west), the strait (east)
  const seaD = "M0 0 H520 V640 H458 Q450 560 462 480 Q474 400 456 330 Q440 260 462 180 Q470 120 456 76 Q380 58 300 50 Q220 46 134 60 Q142 120 130 180 Q122 240 140 268 Q80 282 0 274z";
  const sea = water(seaD, winter ? C.deep : C.sea) + NP(`<path d="M520 640 H458 Q450 560 462 480 Q474 400 456 330 Q440 260 462 180 Q470 120 456 76 Q380 58 300 50 Q220 46 134 60 Q142 120 130 180 Q122 240 140 268 Q80 282 0 274" fill="none" style="stroke:${C.rock2}" stroke-width="9" stroke-linejoin="round" filter="url(#wob)"/>`)
    + waves([[40, 30], [200, 20], [380, 24], [480, 90], [60, 180], [20, 240], [480, 420], [486, 600]]);
  // a corner of Palmaria across the strait, and cormorants on their rocks
  const palm = NP(sk(`<path d="M492 66 Q502 58 520 56 V210 Q506 204 500 180 Q490 130 492 66z" style="fill:#7E9A6A"/>`, `<path d="M492 66 Q502 58 520 56 M520 210 Q506 204 500 180 Q490 130 492 66"/>`)) + pine(508, 120, .35, -1);
  const birdRocks = NP(sk(`<ellipse cx="488" cy="300" rx="14" ry="6" style="fill:${C.rock2}"/><ellipse cx="62" cy="140" rx="16" ry="7" style="fill:${C.rock2}"/><ellipse cx="300" cy="22" rx="12" ry="5" style="fill:${C.rock2}"/>`, ""))
    + cormorant(488, 298, .9) + cormorant(62, 138, .85) + cormorant(300, 20, .7) + flyingCormorant(120, 40, 1);
  // Byron's Grotto: a dark cave in the cove's cliff, and the steps cut down the rock to it
  const grotto = place("pvgrotto", 100, 300, 26, 9, "The steps down to Byron's Grotto", NP(sk(`<path d="M20 274 Q16 236 40 222 Q64 214 76 236 Q82 256 80 274z" style="fill:${C.rock2}"/><path d="M34 274 Q34 246 48 238 Q62 236 64 252 V274z" style="fill:#1F2224"/>`, `<path d="M34 274 Q34 246 48 238 Q62 236 64 252 V274"/>`)
    + sk([[118, 292], [108, 284], [98, 278], [88, 274], [80, 270]].map(([x, y]) => `<rect x="${x - 8}" y="${y - 4}" width="16" height="6" style="fill:${C.stone2}"/>`).join(""), [[118, 292], [108, 284], [98, 278], [88, 274], [80, 270]].map(([x, y]) => `<rect x="${x - 8}" y="${y - 4}" width="16" height="6"/>`).join(""))
    + `<rect x="136" y="300" width="34" height="14" rx="1" style="fill:#E6E0D2;stroke:var(--line)" stroke-width=".7"/><text x="153" y="309.5" text-anchor="middle" font-family="Klee One,serif" font-size="6.4" fill="${C.ink}">GROTTA</text>`), "Byron's Grotto", 96, 322, "#BFE0DA");
  // San Pietro: the striped Gothic church on the very end of the rock, its bell tower, and the old loggia of arches
  const church = place("pvchurch", 268, 256, 34, 10, "The church of San Pietro", sk(`<rect x="140" y="146" width="58" height="92" style="fill:${C.stone}"/>${blocks(140, 146, 58, 92, 12)}${[150, 168, 186].map(x => `<path d="M${x - 6} 238 V200 Q${x} 188 ${x + 6} 200 V238z" style="fill:${winter ? C.deep : C.sea2}"/>`).join("")}<path d="M136 148 h66 l-4 -8 h-58z" style="fill:${C.slate}"/>
      ${stripes(196, 128, 144, 110)}${stripedGable(192, 152, 130, 62)}<path d="M268 238 V196 Q268 176 282 172 Q268 176 268 196 M254 238 V198 Q254 180 268 172 Q282 180 282 198 V238z" style="fill:#4A3A2E"/><circle cx="268" cy="150" r="9" style="fill:${C.white}"/><circle class="wglow" cx="268" cy="150" r="6" style="fill:#3E4146"/><path d="M262 150 h12 M268 144 v12" style="stroke:${C.white}" stroke-width=".8"/>${[218, 318].map(x => `<path class="wglow" d="M${x - 4} 210 V190 Q${x} 182 ${x + 4} 190 V210z" style="fill:#3E4146"/>`).join("")}
      ${stripes(338, 70, 46, 168)}<path d="M334 72 L361 44 L388 72z" style="fill:${C.slate}"/>${[350, 372].map(x => `<path d="M${x - 5} 104 V88 Q${x} 80 ${x + 5} 88 V104z" style="fill:#3E4146"/>`).join("")}<path d="M361 44 v-10 M356 38 h10" style="stroke:${C.iron}" stroke-width="1.6"/>`,
    `<rect x="140" y="146" width="58" height="92"/><rect x="196" y="128" width="144" height="110"/><path d="M192 130 L268 68 L344 130"/><rect x="338" y="70" width="46" height="168"/><path d="M334 72 L361 44 L388 72z"/><path d="M254 238 V198 Q254 180 268 172 Q282 180 282 198 V238"/>`)
    + caper(144, 140, .9) + caper(392, 170, .9), "San Pietro", 268, 276, "#E8C9A8");
  // the flat swimming rocks: pale slabs sloping into the strait, a ladder; towels and swimmers in summer, a rod in autumn
  const slabs = [[350, 430, 456, 418, 464, 470, 360, 478], [372, 494, 462, 486, 456, 548, 380, 552], [356, 566, 452, 562, 458, 612, 360, 616]];
  const rocks = place("pvrocks", 404, 480, 30, 9, "The flat swimming rocks", NP(sk(slabs.map(p => `<path d="M${p[0]} ${p[1]} L${p[2]} ${p[3]} L${p[4]} ${p[5]} L${p[6]} ${p[7]}z" style="fill:#BDB8AE"/>`).join(""), slabs.map(p => `<path d="M${p[0]} ${p[1]} L${p[2]} ${p[3]} L${p[4]} ${p[5]} L${p[6]} ${p[7]}z"/>`).join(""))
    + sk(`<path d="M452 520 v26 M462 518 v26 M452 526 h10 M452 534 h10 M452 542 h10" style="stroke:#C9C2B2" stroke-width="1.6"/>`, "")
    + (s === "summer" ? [[380, 446, "#E8566C"], [418, 454, "#3E6B8C"], [396, 590, "#F3C969"], [424, 524, "#7FB7C9"]].map(([x, y, c], k) => sk(`<rect x="${x - 12}" y="${y - 5}" width="24" height="10" rx="1" style="fill:${c}" transform="rotate(${k % 2 ? -8 : 6} ${x} ${y})"/><path d="M${x - 12} ${y - 2} h24 M${x - 12} ${y + 2} h24" style="stroke:#FFFDF6" stroke-width="1" transform="rotate(${k % 2 ? -8 : 6} ${x} ${y})"/>`, "")).join("")
      + [[484, 450, 0], [494, 520, 1], [480, 584, 2]].map(([x, y, i]) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;-3 1;0 0" dur="${3 + i}s" repeatCount="indefinite"/><circle cx="${x}" cy="${y}" r="4" style="fill:${["#F8DECD", "#C9906A", "#E8C9A8"][i]};stroke:var(--line)" stroke-width=".7"/><path d="M${x - 4} ${y - 1} q4 -6 8 0" style="fill:${["#E8566C", "#2A211D", "#3E6B8C"][i]}"/><path d="M${x - 9} ${y + 3} q4 -3 8 0 M${x + 2} ${y + 3} q4 -3 8 0" fill="none" style="stroke:${C.foam}" stroke-width="1"/></g>`).join("")
      : s === "autumn" ? `<path d="M410 520 L470 470" style="stroke:#5A4636" stroke-width="1.4"/><path d="M470 470 Q480 500 478 540" fill="none" style="stroke:#3A3430" stroke-width=".5"/><rect x="402" y="516" width="14" height="10" style="fill:#3E6B8C;stroke:var(--line)" stroke-width=".7"/>` : "")), "Swimming rocks", 400, 500, "#BFE0DA");
  // the poets' bench: stone, looking out over the open sea where Byron swam
  const poets = place("pvbench", 176, 420, 30, 9, "The poets' bench", NP(sk(`<rect x="154" y="392" width="44" height="8" style="fill:${C.stone2}"/><rect x="156" y="384" width="40" height="8" style="fill:${C.white}"/><rect x="158" y="400" width="6" height="6" style="fill:${C.stone3}"/><rect x="188" y="400" width="6" height="6" style="fill:${C.stone3}"/>`, `<rect x="154" y="384" width="44" height="16"/>`)
    + `<rect x="166" y="386" width="20" height="5" style="fill:${C.gold}" opacity=".7"/>`), "Poets' bench", 176, 440, "#F2C9B4");
  // the old walls coming down from the castle on the west side, a pine, prickly pear and rosemary in the cracks
  const walls = NP(sk(`<rect x="0" y="500" width="44" height="140" style="fill:${C.stone}"/>${blocks(0, 500, 44, 140, 13)}<rect x="0" y="490" width="10" height="10" style="fill:${C.stone}"/><rect x="18" y="490" width="10" height="10" style="fill:${C.stone}"/><rect x="36" y="490" width="8" height="10" style="fill:${C.stone}"/>`, `<rect x="0" y="500" width="44" height="140"/>`))
    + pine(128, 622, .95) + pear(90, 566) + agave(30, 360, .9) + rosemary(40, 320) + rosemary(110, 400) + boulder(28, 412, 13) + boulder(232, 628, 10) + boulder(300, 600, 8)
    + [[150, 520], [240, 300], [380, 290], [60, 470], [300, 520]].map(([x, y]) => tuft(x, y, "#7E8A6E")).join("") + rosemary(214, 520) + rosemary(426, 344) + rosemary(250, 608) + agave(160, 340, .9) + caper(30, 506, .9);
  // winter: big seas crashing white on the rocks of the strait and the point
  const surf = winter ? NP([[470, 360, 0], [476, 470, 1.2], [466, 560, .6], [430, 64, 1.8], [150, 58, 2.4], [116, 268, .9]].map(([x, y, d]) => `<g><path d="M${x - 16} ${y} q4 -16 12 -10 q4 -14 12 -4 q8 -10 10 6 q6 2 2 8z" style="fill:#F4F8F6;stroke:#9FB8C0" stroke-width=".8"/>${[[-12, -18], [-2, -24], [8, -20], [14, -12]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.6" fill="#F4F8F6"/>`).join("")}<animate attributeName="opacity" values="0;.95;0" dur="3.4s" begin="${d}s" repeatCount="indefinite"/></g>`).join("")
    + `<path d="M466 300 q10 -8 20 0 q10 8 20 0 M470 400 q10 -8 20 0 q10 8 20 0 M464 520 q10 -8 20 0 q10 8 20 0" fill="none" style="stroke:#FFFFFF" stroke-width="2.4" opacity=".9"/>`) : "";
  return ground + sea + palm + birdRocks + walls + grotto + church + rocks + poets + surf
    + gate("pvToHarbourS", 330, 612, "The harbour", 262, 616, "South along the rocks to the harbour", "#BFE0DA")
    + gate("pvToCastleE", 20, 460, "Castle Doria", 100, 480, "West up along the walls to the castle");
}

export function portoArt(scene){
  return scene === "pv_harbour" ? harbourScreen() : scene === "pv_borgo" ? borgoScreen() : scene === "pv_castle" ? castleScreen() : pointScreen();
}
// the sight on the far shore as you sail in (a 600x90 strip; the sea starts at y 56): the wall of tower-houses in faded
// colours along the water, the grey castle above, and the striped church on its rock at the end of the point
export const PORTO_SIGHT = `<path d="M318 56 Q336 36 368 32 L398 14 Q440 4 478 12 L520 28 Q540 36 548 44 L560 56z" fill="#7A766F"/><path d="M402 20 h56 v-6 h4 v3 h4 v-3 h4 v3 h4 v-3 h4 v6 h6 v12 h-82z" fill="#ABA69C"/><rect x="430" y="2" width="14" height="16" fill="#B4AFA5"/>${[[340, 26, "#E2A894"], [350, 32, "#E8C98E"], [360, 28, "#D99A84"], [370, 34, "#EDD6A0"], [380, 30, "#E6B48E"], [390, 35, "#D9A28A"], [400, 29, "#E8C98E"], [410, 33, "#E2A894"], [420, 28, "#EDD6A0"], [430, 31, "#D99A84"], [440, 25, "#E6B48E"]].map(([x, h, c]) => `<rect x="${x}" y="${56 - h}" width="10" height="${h}" fill="${c}"/><path d="M${x + 5} ${60 - h} v${h - 10}" stroke="#6E9A78" stroke-width="2.4" stroke-dasharray="2.4 3.6"/>`).join("")}<path d="M532 56 Q548 36 568 34 Q588 36 598 56z" fill="#5E5A56"/><rect x="550" y="20" width="24" height="18" fill="#E8E4DA"/><path d="M550 24 h24 M550 29 h24 M550 34 h24" stroke="#3A3A3E" stroke-width="2"/><path d="M548 20 L562 11 L576 20z" fill="#E8E4DA"/><rect x="574" y="12" width="8" height="26" fill="#E8E4DA"/><path d="M574 18 h8 M574 24 h8 M574 30 h8" stroke="#3A3A3E" stroke-width="2"/>`;
