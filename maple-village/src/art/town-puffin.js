// Puffin Isle (boat towns, round 214): a small wild island ringed by cliffs, nothing like Saltwick's red roofs or
// Portovenere's tall painted houses. No village at all: short rabbit-nibbled turf, pink cushions of sea thrift, grey
// rock splashed with yellow lichen, white foam, a pale grey-blue sea, bracken in the hollows, old dry stone walls, a
// stone jetty, a whitewashed farm, and a white lighthouse on the far tip. And birds: lots and lots of birds.
//   pi_haven (North Haven) *  | pi_wick  (The Wick)
//   pi_farm  (The Old Farm)    | pi_point (Lighthouse Point)
//   pi_haven: the landing cove along the top: your boat at the stone jetty, Dai's lobster pots, the steep cove path,
//             the warden's hut with its sightings board, and the rabbit warren
//   pi_wick:  the great cleft of the Wick: a sheer cliff face of ledges packed with guillemots and razorbills, and
//             opposite it the turf slope riddled with puffin burrows, the rope line, and the bench at the edge
//   pi_farm:  the whitewashed farmhouse tearoom, the walled garden, the pond, and the picnic meadow above the sea
//   pi_point: the lighthouse and the keeper's cottage, Ivy's boathouse on its slipway, the sea-glass cove, the rock
//             pools, and the seal beach under the lighthouse
// Seasons (puffinSeason in data/puffin.js, the real calendar): puffins by their burrows, on the ledges, on the water
// and whirring past, April to early August; a few late ones in mid August; grey seal pups on the beach September to
// December, with the bracken gone rusty; big grey winter seas January to March. Bluebells in April and May, sea pinks
// May to July. Rabbits all year.
import { dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { puffinSeason, piBluebells, piThrift } from "../data/puffin.js";

const C = {turf: "#A6C57C", turf2: "#B7D190", turf3: "#8FB268", slope: "#8EAF66", sea: "#7097A8", sea2: "#86AABA", deep: "#5B7E90", winter: "#5E7682", foam: "#F3F7F5",
  rock: "#8C8E8A", rock2: "#6F726F", rock3: "#A9AAA4", rock4: "#C2C2BA", lichen: "#E2C04A", lichen2: "#D98C3A", path: "#D8CCA6", path2: "#E6DCBC", pebble: "#CFC8B8",
  white: "#F4F1EA", slate: "#5D646C", slate2: "#4C535A", stone: "#A39E94", stone2: "#BDB8AE", stone3: "#857F76", wood: "#7A5A44", wood2: "#5E4434", iron: "#3F4A50",
  thrift: "#E68AAE", thrift2: "#C9668E", bell: "#6E7ED2", gorse: "#E8C33A", earth: "#B49A70", burrow: "#3A2C22", ink: "#2F2B28",
  black: "#232326", belly: "#FBFAF5", face: "#ECEBE6", beak: "#EA5A2E", beakBase: "#5A6878", beakStripe: "#F8C94C", feet: "#F07A2A", bunny: "#9A7A5E", bunny2: "#85664C", seal: "#7E868B", seal2: "#5F676C"};
const season = () => puffinSeason(dayKey());
const mon = () => +dayKey().slice(5, 7);
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const f1 = n => (+n).toFixed(1);
const NP = s => `<g pointer-events="none">${s}</g>`;
const seaCol = () => season() === "winter" ? C.winter : C.sea;
// a gentle sway or bob for a little creature, about its feet (added to its own placing transform)
const sway = (i, deg = 5, dur = 3) => `<animateTransform attributeName="transform" type="rotate" values="0;${-deg};0;${deg*.8};0" dur="${f1(dur + (i % 4)*.6)}s" begin="${f1(-(i*.73) % 3)}s" repeatCount="indefinite" additive="sum"/>`;

/* ---------- the birds and beasts ---------- */
// a puffin standing, feet at (x, y), about 25px tall at s 1, facing right (dir 1) or left (-1): black back and cap, white
// front and face, the big striped orange-red beak with its blue-grey base and yellow stripe, orange feet. o.fish: a
// beakful of silver sand eels. o.still: no little bob.
const puffinBody = fish => `<path d="M-3.5 -3 Q-9 -1 -10.6 2.4 Q-6 1.6 -2.6 -.6z" fill="${C.black}"/>
  <ellipse cx="0" cy="-9" rx="6.4" ry="8.8" fill="${C.black}" stroke="#151517" stroke-width=".6"/><ellipse cx="2.5" cy="-8.2" rx="4.2" ry="6.8" fill="${C.belly}"/>
  <path d="M-3.6 -14.4 Q-6.6 -8 -3 -2.4" stroke="#4A4A50" stroke-width=".9" fill="none"/>
  <circle cx="1.2" cy="-19.6" r="5.6" fill="${C.black}" stroke="#151517" stroke-width=".5"/><ellipse cx="3" cy="-19.1" rx="4" ry="3.8" fill="${C.face}"/>
  <path d="M3.1 -21.7 l.9 -1.3 l1 1.3z" fill="#5A5A60"/><circle cx="4" cy="-20.1" r="1.05" fill="#141416"/><circle cx="4.3" cy="-20.45" r=".35" fill="#FFFFFF"/>
  <path d="M5.4 -23 Q11 -21.2 12.4 -18.6 Q10.2 -15.9 5.4 -15.4z" fill="${C.beak}" stroke="#8A2E18" stroke-width=".45"/><path d="M5.4 -23 L7.5 -22.5 L7.5 -15.8 L5.4 -15.4z" fill="${C.beakBase}"/>
  <path d="M9.3 -21.4 Q10 -18.8 9.3 -16.3" stroke="${C.beakStripe}" stroke-width="1" fill="none"/><circle cx="5.9" cy="-16.3" r=".95" fill="#F7A23A"/>
  ${fish ? `<path d="M8 -17 q1.4 3.6 -.6 7.4 M9.6 -17.4 q2.2 3.4 1.4 7.6 M11 -18 q2.6 2.6 3 6.4" stroke="#B9C6CC" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M8 -17 q1.4 3.6 -.6 7.4 M9.6 -17.4 q2.2 3.4 1.4 7.6 M11 -18 q2.6 2.6 3 6.4" stroke="#E8EEF0" stroke-width=".5" fill="none"/>` : ""}
  <path d="M-2.6 -1 l-2.6 1.8 h4.6z M1.8 -1 l-.8 1.8 h4.8z" fill="${C.feet}" stroke="#B4501E" stroke-width=".4"/>`;
const puffin = (x, y, s = 1, dir = 1, i = 0, o = {}) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})">${o.still ? "" : sway(i, o.deg || 4, 2.6)}<ellipse cx="0" cy=".8" rx="7" ry="1.6" fill="#3E4A3A" opacity=".18"/>${puffinBody(o.fish)}</g>`;
// a puffin peeping out of its burrow: just the head and that beak
const peeper = (x, y, s = 1, dir = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})"><ellipse cx="0" cy="0" rx="7" ry="4" fill="${C.burrow}"/><g><animateTransform attributeName="transform" type="translate" values="0 3;0 0;0 0;0 3;0 3" keyTimes="0;.15;.6;.75;1" dur="7s" repeatCount="indefinite"/><circle cx="0" cy="-3" r="4.6" fill="${C.black}"/><ellipse cx="1.5" cy="-2.8" rx="3.2" ry="3" fill="${C.face}"/><circle cx="2.2" cy="-3.6" r=".85" fill="#141416"/><path d="M3.8 -5.8 Q8.4 -4.4 9.4 -2.2 Q7.6 -.2 3.8 .2z" fill="${C.beak}" stroke="#8A2E18" stroke-width=".4"/><path d="M6.8 -4.8 Q7.4 -2.6 6.8 -.6" stroke="${C.beakStripe}" stroke-width=".8" fill="none"/></g><path d="M-7 0 Q0 4 7 0" fill="${C.earth}"/></g>`;
// a burrow in the turf: a dark hole with a lip of scraped-out earth
const burrow = (x, y, s = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(5*s)}" ry="${f1(2.8*s)}" fill="${C.burrow}"/><path d="M${f1(x - 6*s)} ${f1(y + 1)} Q${f1(x)} ${f1(y + 5*s)} ${f1(x + 6*s)} ${f1(y + 1)}" stroke="${C.earth}" stroke-width="${f1(1.6*s)}" fill="none" stroke-linecap="round"/>`;
// a puffin in flight, whirring: little wings going like the clappers, orange feet trailing
const flyBody = `<ellipse cx="0" cy="0" rx="7.5" ry="4.2" fill="${C.black}"/><ellipse cx="1" cy="1.7" rx="5.4" ry="2.3" fill="${C.belly}"/><circle cx="7" cy="-1.6" r="3.7" fill="${C.black}"/><ellipse cx="8" cy="-1.4" rx="2.6" ry="2.4" fill="${C.face}"/><circle cx="8.7" cy="-2" r=".7" fill="#141416"/>
  <path d="M10 -3.7 Q13.8 -2.4 14.8 -.6 Q13.2 1.2 10 1.4z" fill="${C.beak}" stroke="#8A2E18" stroke-width=".35"/><path d="M12 -3 Q12.5 -1.1 12 .9" stroke="${C.beakStripe}" stroke-width=".7" fill="none"/><path d="M-6.6 .8 l-4 1.8 l1.2 -2.8z" fill="${C.feet}"/>`;
const flyWing = d => `<g><path d="M-3.4 -1.4 Q-2 -12 4 -11.4 Q2 -6 2.6 -1.4z" fill="#2E2E33"/><animateTransform attributeName="transform" type="scale" values="1 1;1 -.75;1 1" dur="${d}s" repeatCount="indefinite"/></g>`;
const flyer = (x, y, s, dir, dx, dy, dur, begin) => NP(`<g><animateTransform attributeName="transform" type="translate" values="0 0;${dx} ${dy}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><g transform="translate(${x} ${y}) scale(${f1(s*dir)} ${f1(s)})">${flyWing(.2 + (Math.abs(begin) % 3)*.02)}${flyBody}</g></g>`);
// a puffin bobbing on the sea
const swimmer = (x, y, s = 1, dir = 1, i = 0) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0" dur="${f1(2.6 + (i % 3)*.5)}s" begin="${f1(-i*.4)}s" repeatCount="indefinite"/><g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})"><path d="M-9 0 Q-9 -6 -2 -6.4 Q4 -6.6 6 -3 Q7 0 6 0z" fill="${C.black}"/><path d="M-4 0 Q-2 -3 4 -2.6 Q6 -1.4 6 0z" fill="${C.belly}"/><circle cx="4.4" cy="-8" r="3.9" fill="${C.black}"/><ellipse cx="5.6" cy="-7.8" rx="2.8" ry="2.6" fill="${C.face}"/><circle cx="6.2" cy="-8.4" r=".75" fill="#141416"/><path d="M7.6 -10.2 Q11.6 -9 12.6 -7 Q11 -5.2 7.6 -4.8z" fill="${C.beak}"/><path d="M9.8 -9.6 Q10.3 -7.6 9.8 -5.6" stroke="${C.beakStripe}" stroke-width=".7" fill="none"/><path d="M-11 1 q5 -2.4 10 0 q5 2.4 10 0 q4 -2 7 0" stroke="${C.foam}" stroke-width="1.1" fill="none"/></g></g>`;
// guillemots (chocolate brown, slim pointed bill) and razorbills (black, a thick blunt bill with a white line), standing
// shoulder to shoulder on the ledges
const auk = (x, y, s = 1, razor = false, dir = 1) => { const b = razor ? "#1F1F22" : "#4E3E34";
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})"><ellipse cx="0" cy="-6" rx="3.4" ry="6" fill="${b}"/><ellipse cx=".9" cy="-5" rx="2.2" ry="4.6" fill="${C.belly}"/><circle cx=".6" cy="-12.8" r="2.7" fill="${b}"/><circle cx="1.6" cy="-13.3" r=".55" fill="#0E0E10"/>`
    + (razor ? `<path d="M3 -14.2 Q6.2 -13.8 6.4 -12.6 Q5.4 -11.4 3 -11.6z" fill="#18181A"/><path d="M4.8 -14 v2.4" stroke="#FFFFFF" stroke-width=".55"/>` : `<path d="M3 -13.4 L7 -12.6 L3 -11.8z" fill="#2A2420"/>`) + `</g>`; };
// a fulmar or a gannet gliding on stiff wings, far out
const glider = (x, y, s, dx, dur, begin, gannet = false) => NP(`<g><animateTransform attributeName="transform" type="translate" values="0 0;${dx/2} -4;${dx} 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 0 Q-6 -2 0 -1 Q6 -2 12 0 Q6 0 0 1 Q-6 0 -12 0z" fill="${gannet ? "#FBFAF5" : "#C9CFD2"}" stroke="#55595C" stroke-width=".5"/>${gannet ? `<path d="M-12 0 l3 -.6 v1.2z M12 0 l-3 -.6 v1.2z" fill="#222"/><circle cx="1.6" cy="-1" r="1.4" fill="#F0DEA0"/>` : ""}<ellipse cx="0" cy="0" rx="4" ry="1.6" fill="#FBFAF5"/></g></g>`);
// a grey seal mother hauled out on the beach (long, spotty, a Roman nose), facing right or left
const seal = (x, y, s = 1, dir = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})"><ellipse cx="0" cy="2" rx="24" ry="3" fill="#3E4A50" opacity=".2"/><path d="M-24 0 Q-28 -4 -30 -8 Q-25 -6 -22 -4 Q-14 -11 2 -11 Q14 -11 19 -7 Q24 -9 27 -5 Q28 -1 23 0 Q8 3 -24 0z" fill="${C.seal}" stroke="#4A5156" stroke-width=".7"/>
  ${[[-12, -7], [-4, -8], [6, -6], [-16, -3], [10, -8]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="1.6" ry="1" fill="${C.seal2}"/>`).join("")}<path d="M2 0 q4 -3 8 0" stroke="${C.seal2}" stroke-width="1.4" fill="none"/><circle cx="22.6" cy="-6" r="1.2" fill="#121416"/><circle cx="27" cy="-3.6" r=".8" fill="#2A2E30"/></g>`;
// a white fluffy seal pup lying on the pebbles, head turned to you, big dark eyes, breathing slowly
const pup = (x, y, s = 1, dir = 1, i = 0) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})"><ellipse cx="0" cy="1.4" rx="13" ry="2.4" fill="#3E4A50" opacity=".18"/><g><animateTransform attributeName="transform" type="scale" values="1 1;1.02 1.05;1 1" dur="${f1(3 + i*.5)}s" repeatCount="indefinite"/>
  <path d="M-13 0 Q-15 -3 -13 -6 Q-12 -10 -6 -10.6 Q0 -12 6 -10 Q10 -9 11 -6 Q12 -2 10 0z" fill="#F8F6EE" stroke="#B9BAB2" stroke-width=".8"/><path d="M-11 -7 q1 -1 2 0 M-6 -9.6 q1 -1 2 0 M0 -10.6 q1 -1 2 0" stroke="#D2D2CA" stroke-width=".6" fill="none"/>
  <path d="M-13 -3 q-4 -1 -4 -4 q2 1 4 1" fill="#ECEAE0" stroke="#B9BAB2" stroke-width=".6"/></g>
  <circle cx="9" cy="-8" r="6.4" fill="#F8F6EE" stroke="#B9BAB2" stroke-width=".8"/><circle cx="6.8" cy="-8.8" r="1.55" fill="#141416"/><circle cx="11.2" cy="-8.8" r="1.55" fill="#141416"/><circle cx="7.3" cy="-9.4" r=".5" fill="#FFF"/><circle cx="11.7" cy="-9.4" r=".5" fill="#FFF"/>
  <ellipse cx="9" cy="-5.8" rx="1.2" ry=".8" fill="#5A4A48"/><path d="M5 -5.4 h-3 M5 -4.6 l-3 .8 M13 -5.4 h3 M13 -4.6 l3 .8" stroke="#A9A9A0" stroke-width=".4"/></g>`;
// a seal's head in the shallows, watching you
const sealHead = (x, y, s = 1, i = 0) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0" dur="${f1(3.4 + i*.6)}s" begin="${f1(-i)}s" repeatCount="indefinite"/><g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s)})"><ellipse cx="0" cy="-4" rx="5.6" ry="6.2" fill="${C.seal}" stroke="#4A5156" stroke-width=".6"/><ellipse cx="0" cy="-1" rx="3.4" ry="2.4" fill="${C.seal2}"/><circle cx="-2.2" cy="-5.4" r="1.3" fill="#121416"/><circle cx="2.2" cy="-5.4" r="1.3" fill="#121416"/><circle cx="-1.9" cy="-5.8" r=".4" fill="#FFF"/><circle cx="2.5" cy="-5.8" r=".4" fill="#FFF"/><path d="M-9 1 q4 -2.4 9 0 q5 2.4 9 0" stroke="${C.foam}" stroke-width="1.2" fill="none"/></g></g>`;
// a rabbit, sitting up or grazing, white scut, one ear twitching now and then
const rabbit = (x, y, s = 1, dir = 1, i = 0, graze = false) => { const col = i % 3 === 2 ? C.bunny2 : C.bunny, hx = graze ? 7 : 5, hy = graze ? -5 : -10;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s*dir)} ${f1(s)})"><ellipse cx="0" cy=".6" rx="7" ry="1.4" fill="#3E4A3A" opacity=".18"/><ellipse cx="0" cy="-5" rx="6.6" ry="5.2" fill="${col}"/><circle cx="-6.2" cy="-4.4" r="2.2" fill="#F6F2EA"/><ellipse cx="2" cy="-1" rx="3" ry="1.4" fill="${col}"/>
    <circle cx="${hx}" cy="${hy}" r="3.8" fill="${col}"/><circle cx="${hx + 1.6}" cy="${hy - .6}" r=".8" fill="#1A1410"/><circle cx="${hx + 3.6}" cy="${hy + .6}" r=".55" fill="#C98A8A"/>
    <ellipse cx="${hx - 1.6}" cy="${hy - 6.4}" rx="1.4" ry="4.2" fill="${col}" transform="rotate(-14 ${hx - 1.6} ${hy - 3})"/>
    <g><ellipse cx="${hx + .4}" cy="${hy - 6.6}" rx="1.4" ry="4.2" fill="${col}"/><ellipse cx="${hx + .4}" cy="${hy - 6.4}" rx=".6" ry="3" fill="#D9A9A0"/><animateTransform attributeName="transform" type="rotate" values="0 ${hx} ${hy - 3};0 ${hx} ${hy - 3};-22 ${hx} ${hy - 3};0 ${hx} ${hy - 3};0 ${hx} ${hy - 3}" keyTimes="0;.8;.85;.9;1" dur="${f1(4 + (i % 4)*1.3)}s" begin="${f1(-i*.9)}s" repeatCount="indefinite"/></g></g>`; };
// sea thrift: a tight green cushion, covered in pink pom-poms May to July (dry papery heads after)
const thrift = (x, y, s = 1, i = 0) => { const fl = piThrift(dayKey()), s2 = season(), dry = !fl && (s2 === "late" || s2 === "seals" || (s2 === "puffins" && mon() >= 8));
  return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(9*s)}" ry="${f1(4.6*s)}" fill="#6F9A52"/><ellipse cx="${f1(x - 2*s)}" cy="${f1(y - 1.4*s)}" rx="${f1(5*s)}" ry="${f1(2.4*s)}" fill="#86AE64"/>`
    + (fl || dry ? [[-6, -5], [-1, -8], [5, -6], [2, -3], [-4, -2], [8, -2]].slice(0, 4 + (i % 3)).map(([a, b]) => `<path d="M${f1(x + a*s*.7)} ${f1(y - 1)} V${f1(y + b*s)}" stroke="#6F9A52" stroke-width=".7"/><circle cx="${f1(x + a*s)}" cy="${f1(y + b*s)}" r="${f1(2.3*s)}" fill="${fl ? C.thrift : "#D8C9B0"}"/>${fl ? `<circle cx="${f1(x + a*s - .5)}" cy="${f1(y + b*s - .5)}" r="${f1(.9*s)}" fill="#F6B9D0"/>` : ""}`).join("") : ""); };
// bluebells: little nodding blue-violet bells in a haze, April and May only
const bluebells = (x, y, w, h, n, seed) => piBluebells(dayKey()) ? NP(`<ellipse cx="${x}" cy="${y}" rx="${w/2}" ry="${h/2}" fill="${C.bell}" opacity=".22" filter="url(#wash)"/>` + Array.from({length: n}, (_, k) => { const a = x + (rnd(seed + k) - .5)*w, b = y + (rnd(seed + k + 50) - .5)*h;
  return `<path d="M${f1(a)} ${f1(b + 5)} q1 -4 0 -7" stroke="#5E8A4A" stroke-width=".7" fill="none"/><circle cx="${f1(a + 1)}" cy="${f1(b - 1)}" r="1.5" fill="${C.bell}"/><circle cx="${f1(a + 1.8)}" cy="${f1(b + 1.6)}" r="1.2" fill="#8090DC"/>`; }).join("")) : "";
// bracken: a clump of fronds, green in summer, rusty orange in autumn, dead brown in winter
const brackenCol = () => { const s = season(); return s === "seals" ? ["#C07A3E", "#A8652E"] : s === "winter" ? ["#9A7458", "#86634A"] : ["#7FA44E", "#6A9142"]; };
const bracken = (x, y, s = 1, i = 0) => { const [c1, c2] = brackenCol(), fr = [[-14, -16, -1], [-6, -22, -1], [4, -24, 1], [12, -16, 1], [0, -18, -1]];
  return fr.map(([dx, dy, side], k) => { const ex = x + dx*s, ey = y + dy*s, col = k % 2 ? c2 : c1;
    return `<path d="M${f1(x)} ${f1(y)} Q${f1(x + dx*s*.3)} ${f1(y + dy*s*.8)} ${f1(ex)} ${f1(ey)}" stroke="${col}" stroke-width="1.2" fill="none"/>` + [.3, .5, .7, .88].map(t => { const px = x + (ex - x)*t, py = y + (ey - y)*t + (1 - t)*3*s; return `<path d="M${f1(px)} ${f1(py)} l${f1(-4*s*(1 - t*.6))} ${f1(-1.6*s)} M${f1(px)} ${f1(py)} l${f1(4*s*(1 - t*.6))} ${f1(-1.2*s)}" stroke="${col}" stroke-width="${f1(1.8*s)}" stroke-linecap="round"/>`; }).join(""); }).join(""); };
const brackenPatch = (pts, s = 1) => NP(pts.map(([x, y], k) => bracken(x, y, s*(.85 + rnd(k + x)*.3), k)).join(""));
// gorse: a spiky dark green bush, yellow flowers most of the year ("when gorse is out of bloom, kissing's out of fashion")
const gorse = (x, y, s = 1) => NP(sk(`<path d="M${f1(x - 16*s)} ${y} Q${f1(x - 18*s)} ${f1(y - 12*s)} ${f1(x - 6*s)} ${f1(y - 16*s)} Q${x} ${f1(y - 22*s)} ${f1(x + 8*s)} ${f1(y - 16*s)} Q${f1(x + 18*s)} ${f1(y - 12*s)} ${f1(x + 16*s)} ${y}z" fill="#55703E"/>`, "")
  + (season() === "winter" ? [[-8, -10], [6, -12]] : [[-10, -8], [-4, -14], [3, -17], [9, -11], [12, -5], [-12, -3], [0, -8], [6, -4]]).map(([a, b]) => `<circle cx="${f1(x + a*s)}" cy="${f1(y + b*s)}" r="${f1(1.7*s)}" fill="${C.gorse}"/>`).join(""));
// a grey boulder splashed with yellow and orange lichen
const boulder = (x, y, r = 12, k = 0) => NP(sk(`<path d="M${x - r} ${y} Q${x - r} ${f1(y - r*.9)} ${f1(x - r*.2)} ${y - r} Q${f1(x + r*.9)} ${f1(y - r*.9)} ${x + r} ${y}z" fill="${C.rock3}"/><path d="M${f1(x - r*.4)} ${f1(y - r*.7)} q${f1(r*.4)} ${f1(-r*.15)} ${f1(r*.7)} 0" stroke="${C.rock4}" stroke-width="1.2" fill="none"/>${[[-.4, -.5, C.lichen], [.3, -.6, C.lichen2], [.1, -.3, C.lichen]].slice(0, 2 + k % 2).map(([a, b, c]) => `<ellipse cx="${f1(x + a*r)}" cy="${f1(y + b*r)}" rx="${f1(r*.18)}" ry="${f1(r*.1)}" fill="${c}" opacity=".85"/>`).join("")}`,
  `<path d="M${x - r} ${y} Q${x - r} ${f1(y - r*.9)} ${f1(x - r*.2)} ${y - r} Q${f1(x + r*.9)} ${f1(y - r*.9)} ${x + r} ${y}z"/>`));
// an old dry stone wall: a row of grey stones, a little tumbled in places
const drywall = (x1, y1, x2, y2, h = 12, seed = 1) => { const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1)/9)); let s = "";
  for (let r = 0; r < 2; r++) for (let k = 0; k < n; k++) { const t = (k + (r ? .5 : 0))/n; if (t > 1) continue; const x = x1 + (x2 - x1)*t, y = y1 + (y2 - y1)*t - r*h*.5;
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(5 + rnd(seed + k + r*40)*2)}" ry="${f1(h*.32)}" fill="${[C.stone, C.stone2, C.stone3][Math.floor(rnd(seed + k*3 + r)*3)]}" stroke="${C.ink}" stroke-width=".7"/>`; }
  return NP(`<g filter="url(#wob)">${s}</g>`); };
// a clump of grass tufts, and a little dot of sea campion or daisy
const tuft = (x, y, col = "#7C9E58") => `<path d="M${x - 4} ${y} q2 -7 4 -1 q2 -8 4 0 q1 -5 3 1" fill="none" stroke="${col}" stroke-width="1.1" pointer-events="none"/>`;
const tufts = pts => NP(pts.map(([x, y]) => tuft(x, y)).join(""));
const flowers = (pts, col) => NP(pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${col}"/><circle cx="${x}" cy="${y}" r=".6" fill="#F3D35A"/>`).join(""));
// the sea, and the waves on it
const water = (d, col) => NP(sk(`<path d="${d}" style="fill:${col}"/>`, `<path d="${d}"/>`));
const waves = (pts, col = C.foam) => { const w = season() === "winter";
  return `<g pointer-events="none" style="stroke:${col}" stroke-width="${w ? 1.8 : 1.3}" fill="none" opacity=".85">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0${w ? " q5 -5 10 0" : ""}"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`; };
// white water bursting on the rocks: always a little; big and often in winter
const surf = (pts) => NP(pts.map(([x, y, d], i) => `<g><path d="M${x - 16} ${y} q4 -16 12 -10 q4 -14 12 -4 q8 -10 10 6 q6 2 2 8z" fill="#F4F8F6" stroke="#9FB8C0" stroke-width=".8"/>${[[-12, -18], [-2, -24], [8, -20], [14, -12]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.6" fill="#F4F8F6"/>`).join("")}<animate attributeName="opacity" values="0;.95;0" dur="${f1(3.4 + (i % 3)*.6)}s" begin="${d}s" repeatCount="indefinite"/></g>`).join(""));
// a rocky shoreline: a thick band of grey rock with lichen, following a path
const shoreRock = (d, w = 16) => NP(`<g filter="url(#wob)"><rect width="520" height="640" fill="none"/><path d="${d}" fill="none" stroke="${C.rock2}" stroke-width="${w + 4}" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.rock}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.rock3}" stroke-width="${w*.35}" stroke-dasharray="6 9" transform="translate(0 -3)"/><path d="${d}" fill="none" stroke="${C.lichen}" stroke-width="2.6" stroke-dasharray="2 23" stroke-linecap="round" transform="translate(0 -4)"/></g>`);
// a trodden path through the turf
const trail = (d, w = 26) => NP(`<g filter="url(#wob)"><rect width="520" height="640" fill="none"/><path d="${d}" fill="none" stroke="${C.path}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="${d}" fill="none" stroke="${C.path2}" stroke-width="${w*.6}" stroke-linecap="round" stroke-linejoin="round"/></g>`);
const turfGround = (col = C.turf) => `<rect width="520" height="640" style="fill:${col}"/><g filter="url(#wash)" opacity=".55" pointer-events="none"><ellipse cx="160" cy="420" rx="150" ry="90" fill="${C.turf2}"/><ellipse cx="380" cy="300" rx="130" ry="80" fill="${C.turf2}"/><ellipse cx="300" cy="560" rx="160" ry="60" fill="${C.turf3}" opacity=".6"/></g>`;
const bench = (x, y, col = C.wood) => NP(sk(`<rect x="${x - 18}" y="${y - 10}" width="36" height="4" style="fill:${col}"/><rect x="${x - 18}" y="${y - 18}" width="36" height="4" style="fill:${col}"/><path d="M${x - 15} ${y - 6} v8 M${x + 15} ${y - 6} v8" style="stroke:${C.wood2}" stroke-width="2"/>`, ""));
// your own boat (the same boat as at home: white hull, blue stripe, red flag), bobbing
const yourBoat = (x, y) => NP(`<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.6;0 0" dur="3.4s" repeatCount="indefinite"/><ellipse cx="${x + 3}" cy="${y + 2}" rx="50" ry="4" fill="${C.foam}" opacity=".55"/>${sk(`<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z" style="fill:#FFFDF6"/><path d="M${x - 36} ${y - 10} h78" style="stroke:#3E6B8C" stroke-width="3"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3" style="fill:#CFE0EE"/><path d="M${x + 30} ${y - 36} v-22 l14 9z" style="fill:#E8566C"/>`,
  `<path d="M${x - 40} ${y - 18} h86 l-10 18 h-66z"/><rect x="${x - 12}" y="${y - 36}" width="34" height="18" rx="3"/><path d="M${x + 30} ${y - 18} v-40 l14 9 l-14 4"/>`)}</g>`);
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:${C.wood}"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 22} h16" style="stroke:${C.sea}" stroke-width="2"/>`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
// chimney smoke drifting off on the wind
const smoke = (x, y) => NP([0, 1, 2].map(k => `<circle cx="${x}" cy="${y}" r="${3 + k}" fill="#E8ECEC" opacity="0"><animate attributeName="cy" values="${y};${y - 30}" dur="4.5s" begin="${k*1.5}s" repeatCount="indefinite"/><animate attributeName="cx" values="${x};${x + 22}" dur="4.5s" begin="${k*1.5}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.8;0" dur="4.5s" begin="${k*1.5}s" repeatCount="indefinite"/></circle>`).join(""));
// a slate-roofed whitewashed wall: front wall x..x+w from y to base, a roof of depth rh above it
const cottage = (x, base, w, h, rh, o = {}) => { const y = base - h;
  return sk(`<path d="M${x - 6} ${y} L${x + 10} ${y - rh} H${x + w - 10} L${x + w + 6} ${y}z" fill="${o.roof || C.slate}"/>${Array.from({length: Math.floor(rh/7)}, (_, k) => `<path d="M${f1(x + 10 - 16*(k + 1)*7/rh)} ${y - rh + (k + 1)*7} H${f1(x + w - 10 + 16*(k + 1)*7/rh)}" stroke="${C.slate2}" stroke-width=".7"/>`).join("")}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${o.wall || C.white}"/><rect x="${x}" y="${base - 6}" width="${w}" height="6" fill="#3A3A2E" opacity=".08"/>${o.extra || ""}`,
    `<path d="M${x - 6} ${y} L${x + 10} ${y - rh} H${x + w - 10} L${x + w + 6} ${y}z"/><rect x="${x}" y="${y}" width="${w}" height="${h}"/>${o.lines || ""}`); };
const win = (x, y, w = 14, h = 14, frame = "#3E6B8C") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#3E4650" stroke="${frame}" stroke-width="2"/><path d="M${x + w/2} ${y} v${h} M${x} ${y + h/2} h${w}" stroke="${frame}" stroke-width="1.2"/><rect x="${x - 2}" y="${y + h}" width="${w + 4}" height="2.4" fill="${C.stone2}"/>`;

/* ---------- pi_haven: North Haven, the landing cove ---------- */
function havenScreen(){
  const s = season(), pf = s === "puffins";
  const ground = turfGround();
  // the cove along the top: the sea, the rock either side, the pebble beach in the middle, the bank up from it
  const seaD = "M0 0 H520 V182 Q470 172 432 156 Q396 138 368 116 Q340 102 300 104 Q250 100 212 106 Q176 114 152 140 Q120 176 60 180 Q24 184 0 188z";
  const sea = water(seaD, seaCol()) + waves([[40, 30], [140, 60], [200, 20], [380, 30], [440, 80], [470, 130], [60, 120], [330, 6]]);
  const beach = NP(sk(`<path d="M150 150 Q176 116 214 110 Q258 104 300 108 Q342 110 368 124 Q386 136 392 152 Q330 160 270 158 Q200 158 150 150z" fill="${C.pebble}"/>`, "")
    + Array.from({length: 40}, (_, k) => `<ellipse cx="${f1(170 + rnd(k)*210)}" cy="${f1(118 + rnd(k + 9)*34)}" rx="${f1(1.6 + rnd(k + 3)*1.6)}" ry="1.2" fill="${["#A9A396", "#BDB6A6", "#8E897E"][k % 3]}"/>`).join("")
    + `<path d="M152 140 Q176 114 214 108 Q258 102 300 106 Q342 108 370 122" fill="none" stroke="${C.foam}" stroke-width="2.4" opacity=".9"><animate attributeName="opacity" values=".9;.4;.9" dur="4s" repeatCount="indefinite"/></path>`);
  const rocks = shoreRock("M0 194 Q30 190 64 188 Q124 184 154 148 Q170 126 190 116") + shoreRock("M374 122 Q398 146 434 164 Q474 180 520 188")
    + NP(sk(`<path d="M0 198 Q22 220 18 260 Q24 290 0 304z" fill="${C.rock}"/><path d="M4 230 l10 4 M2 270 l12 2" stroke="${C.rock2}" stroke-width="1"/><ellipse cx="10" cy="248" rx="3" ry="1.6" fill="${C.lichen}"/>`, `<path d="M0 198 Q22 220 18 260 Q24 290 0 304"/>`))
    + [[20, 204], [60, 200], [110, 196], [404, 186], [446, 196], [486, 198]].map(([x, y], k) => thrift(x, y, .9, k)).join("");
  // the stone jetty out into the cove, your boat tied up at the end of it, Dai's little punt, the lobster pots
  const jetty = NP(sk(`<path d="M248 140 V30 Q248 22 262 22 Q276 22 276 30 V140z" fill="${C.stone2}"/>${Array.from({length: 10}, (_, k) => `<path d="M248 ${34 + k*11} H276" stroke="${C.stone3}" stroke-width=".7"/><path d="M${k % 2 ? 258 : 266} ${34 + k*11} v11" stroke="${C.stone3}" stroke-width=".6"/>`).join("")}<path d="M248 30 V140" stroke="#5E6A60" stroke-width="2" opacity=".35"/>`,
    `<path d="M248 140 V30 Q248 22 262 22 Q276 22 276 30 V140"/>`)
    + [[253, 32], [271, 32], [271, 84]].map(([x, y]) => `<rect x="${x - 2.6}" y="${y - 6}" width="5.2" height="7" rx="2" fill="${C.iron}"/>`).join("")
    + `<path d="M244 46 v24 M240 50 h4 M240 58 h4 M240 66 h4" stroke="#8A8C88" stroke-width="1.2"/><path d="M272 82 Q282 86 292 74" stroke="#C9B88A" stroke-width="1.4" fill="none"/><path d="M271 32 Q300 40 372 64" stroke="#C9B88A" stroke-width="1" fill="none"/>`);
  const boat = place("piboat", 262, 132, 30, 10, "Your boat at the jetty", yourBoat(330, 86), "Your boat", 344, 132, "#BFE0DA");
  const punt = NP(`<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.2;0 0" dur="3s" repeatCount="indefinite"/>${sk(`<path d="M190 66 Q192 80 212 80 H232 Q240 78 240 66z" fill="#7FA9C4"/><path d="M190 66 H240" stroke="#F4F1EA" stroke-width="2"/><path d="M200 70 h28" stroke="${C.wood}" stroke-width="2"/>`, `<path d="M190 66 Q192 80 212 80 H232 Q240 78 240 66z"/>`)}</g><path d="M240 68 Q246 70 249 66" stroke="#C9B88A" stroke-width="1" fill="none"/>`);
  const pots = NP(sk([[212, 140], [230, 138], [220, 126]].map(([x, y]) => `<path d="M${x - 8} ${y} V${y - 8} Q${x} ${y - 16} ${x + 8} ${y - 8} V${y}z" fill="#C2A878"/><path d="M${x - 8} ${y - 4} h16 M${x - 4} ${y} V${y - 12} M${x + 4} ${y} V${y - 12}" stroke="#7A5A3A" stroke-width=".7"/>`).join("") + `<circle cx="242" cy="136" r="5" fill="#E8823A"/><ellipse cx="204" cy="146" rx="7" ry="3" fill="none" stroke="#C9B88A" stroke-width="2"/>`, ""));
  // puffins rafting on the water in the cove, and whirring in and out; gannets far out in winter
  const water2 = pf ? [[60, 70, 1], [80, 76, -1], [96, 66, 1], [112, 80, 1], [180, 30, -1], [196, 40, 1], [420, 40, -1], [438, 52, 1], [456, 36, -1], [130, 40, 1]].map(([x, y, d], k) => swimmer(x, y, .85, d, k)).join("")
      + flyer(-30, 60, .9, 1, 600, -30, 11, -2) + flyer(560, 120, .85, -1, -620, -40, 13, -7) + flyer(-20, 30, .7, 1, 580, 20, 9, -5)
    : s === "late" ? swimmer(90, 74, .85, 1, 0) + swimmer(440, 46, .85, -1, 1)
    : s === "winter" ? glider(100, 30, .8, 300, 26, -3, true) + glider(420, 18, .6, -260, 30, -12, true) + surf([[30, 190, 0], [160, 140, 1.4], [400, 150, .7], [500, 186, 2.2]])
    : glider(80, 40, .8, 340, 22, -4) + surf([[30, 190, 0], [500, 186, 2]]);
  // the clifftop east of the cove: puffin burrows right by the path (in season the puffins stand about by them)
  const burrows = NP([[420, 214], [446, 206], [470, 222], [492, 212], [432, 238], [462, 244], [500, 236], [412, 252]].map(([x, y]) => burrow(x, y, .9)).join("")
    + (pf ? puffin(424, 212, .8, -1, 0) + puffin(452, 204, .8, 1, 1, {fish: true}) + puffin(476, 220, .78, -1, 2) + puffin(440, 236, .82, 1, 3) + puffin(470, 242, .8, -1, 4) + puffin(498, 234, .76, -1, 5) + peeper(492, 212, .8, -1)
      : s === "late" ? puffin(452, 204, .8, 1, 1) : rabbit(456, 228, .8, -1, 7, true)) + thrift(416, 230, .8, 2) + thrift(486, 252, .8, 1));
  // the steep cove path: stone steps up the bank from the beach, a rope to hold on to
  const path = trail("M262 150 V230 Q262 300 252 360 Q242 460 260 640") + trail("M252 352 Q380 336 520 352") + trail("M254 332 Q180 330 104 330", 20);
  const steps = place("pipath", 262, 210, 22, 12, "The steep path up from the cove", NP(`<path d="M232 166 Q256 158 292 166 L296 234 Q262 226 228 234z" fill="${C.slope}" opacity=".7" filter="url(#wash)"/>`
    + sk(Array.from({length: 7}, (_, k) => `<rect x="249" y="${160 + k*10}" width="26" height="6" rx="1" fill="${C.stone2}"/>`).join(""), "")
    + `<path d="M282 160 V230 M282 160 v-4 M282 186 v-4 M282 210 v-4 M282 230 v-4" stroke="${C.wood}" stroke-width="2"/><path d="M282 158 Q284 172 282 184 Q284 196 282 208 Q284 220 282 228" stroke="#C9B88A" stroke-width="1.4" fill="none"/>`
    + (pf ? puffin(234, 196, .74, 1, 6) + burrow(228, 206, .8) + puffin(298, 214, .74, -1, 7, {fish: true}) + burrow(306, 222, .8) : "") + thrift(230, 172, .8, 0) + thrift(296, 176, .8, 1)), "Cove path", 330, 196, "#BFE0DA");
  // the warden's hut: grey stone, slate roof, a green door, a sightings board, binoculars on the windowsill
  const board = `<rect x="58" y="268" width="28" height="30" fill="#2E4A3A" stroke="${C.wood}" stroke-width="2"/>${[0, 1, 2].map(k => `<path d="M62 ${282 + k*6} h${10 + (k % 2)*6}" stroke="#E8ECE4" stroke-width=".8"/><path d="M76 ${282 + k*6} h${3 + k}" stroke="#E8ECE4" stroke-width=".8" stroke-dasharray="1 1.2"/>`).join("")}<text x="72" y="276" text-anchor="middle" font-family="Klee One,serif" font-size="4.6" fill="#E8ECE4">TODAY</text>`;
  const hut = place("piwarden", 104, 326, 26, 9, "The warden's hut", NP(cottage(52, 312, 108, 58, 40, {wall: "#C4C0B6", roof: C.slate,
      extra: `${Array.from({length: 5}, (_, k) => `<path d="M52 ${264 + k*11} H160" stroke="#A9A49A" stroke-width=".6"/>`).join("")}<path d="M94 312 V284 Q104 274 114 284 V312z" fill="#3E6447"/><circle cx="110" cy="298" r="1.2" fill="#E3C26A"/>${win(124, 270, 22, 16, "#E8E4DA")}<path d="M128 284 h6 a2.4 2.4 0 1 1 0 .1 M140 284 h-2" stroke="#1F1F22" stroke-width="2.4"/><rect x="88" y="258" width="32" height="9" rx="1" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".6"/><text x="104" y="264.6" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="6" fill="${C.ink}">WARDEN</text>${board}`,
      lines: `<path d="M94 312 V284 Q104 274 114 284 V312"/>`})
    + sk(`<rect x="146" y="214" width="10" height="18" fill="${C.stone3}"/><rect x="144" y="212" width="14" height="4" fill="${C.slate}"/>`, "") + smoke(151, 210)
    + `<path d="M104 232 v-12" stroke="${C.iron}" stroke-width="1.2"/><g><animateTransform attributeName="transform" type="rotate" values="-10 104 220;10 104 220;-10 104 220" dur="6s" repeatCount="indefinite"/><path d="M96 219 q4 -3 8 -1 l4 -2 l-1 3 q2 1 0 2 h-10z" fill="${C.black}"/><path d="M107 217 l3 1 l-3 1z" fill="${C.beak}"/></g>`
    + sk(`<rect x="160" y="288" width="12" height="22" rx="2" fill="#4E6A5A"/><path d="M160 294 h12 M160 302 h12" stroke="#2F4A3A" stroke-width=".8"/>`, "")), "Warden's hut", 104, 350, "#E8C9A8");
  // the signpost where the paths meet
  const sign = NP(sk(`<rect x="200" y="270" width="4" height="36" fill="${C.wood}"/><path d="M204 276 h30 l6 5 l-6 5 h-30z M200 290 h-30 l-6 5 l6 5 h30z" fill="#FFFDF6"/>`, `<path d="M204 276 h30 l6 5 l-6 5 h-30z M200 290 h-30 l-6 5 l6 5 h30z"/>`)
    + `<text x="220" y="283.6" text-anchor="middle" font-family="Klee One,serif" font-size="6.6" fill="${C.ink}">Wick</text><text x="184" y="297.6" text-anchor="middle" font-family="Klee One,serif" font-size="6.6" fill="${C.ink}">Hut</text>`);
  // the rabbit warren: sandy scrapes and holes all over a hummock, and rabbits everywhere
  const warren = place("pirabbits", 404, 482, 30, 9, "The rabbit warren", NP(`<ellipse cx="406" cy="432" rx="70" ry="38" fill="#C8B98C" opacity=".45" filter="url(#wash)"/>`
    + [[362, 424], [392, 412], [428, 420], [452, 440], [372, 452], [410, 450], [440, 460]].map(([x, y]) => `<ellipse cx="${x}" cy="${y + 2}" rx="12" ry="5" fill="#CDB888"/>${burrow(x, y, 1)}`).join("")
    + rabbit(378, 430, .95, 1, 0) + rabbit(416, 424, 1, -1, 1, true) + rabbit(448, 448, .9, -1, 2) + rabbit(390, 462, .9, 1, 3, true) + rabbit(346, 470, .85, 1, 4) + rabbit(468, 420, .8, -1, 5, true)), "Rabbit warren", 404, 506, "#F2C9B4");
  // the bottom corners: an old dry stone wall, bracken (bluebells under it in spring), gorse, boulders
  const edges = bluebells(60, 560, 120, 50, 26, 3) + bluebells(460, 590, 110, 50, 22, 9) + brackenPatch([[16, 560], [44, 586], [76, 566], [100, 600], [24, 620], [64, 630], [110, 630]])
    + brackenPatch([[420, 570], [450, 592], [486, 566], [500, 612], [436, 628], [470, 624]]) + drywall(0, 548, 120, 540, 12, 4) + drywall(404, 548, 520, 556, 12, 7)
    + gorse(30, 344, 1) + gorse(486, 300, .9) + boulder(28, 450, 13, 1) + boulder(488, 480, 11, 0) + boulder(150, 600, 10, 1)
    + rabbit(170, 470, .85, 1, 8, true) + rabbit(320, 560, .8, -1, 9)
    + tufts([[60, 400], [140, 380], [330, 300], [360, 380], [180, 520], [300, 470], [470, 520], [120, 480], [220, 440], [420, 330]])
    + flowers([[90, 380], [150, 410], [330, 410], [380, 500], [210, 580], [300, 520]], "#FFFDF6");
  return ground + sea + beach + rocks + path + jetty + punt + water2 + boat + pots + burrows + steps + hut + sign + warren + edges
    + gate("piToWick", 500, 352, "The Wick", 456, 392, "East along the clifftop to the Wick", "#BFE0DA")
    + gate("piToFarm", 260, 612, "The Old Farm", 180, 616, "South down the track to the old farm");
}

/* ---------- pi_wick: the seabird cliffs ---------- */
function wickScreen(){
  const s = season(), pf = s === "puffins", late = s === "late";
  const ground = turfGround();
  const sea = water("M0 0 H520 V54 Q470 50 400 48 Q300 46 200 50 Q100 54 0 58z", seaCol()) + waves([[30, 20], [150, 30], [270, 14], [400, 26], [480, 8]]);
  // the north side of the Wick: a strip of clifftop turf, then the sheer face dropping to the water, its ledges packed
  // with birds in summer
  const faceD = "M186 72 Q300 64 520 66 V158 Q430 160 340 164 Q262 170 200 186 Q190 130 186 72z";
  const face = NP(`<path d="M180 48 Q300 44 520 46 V72 Q300 66 186 76z" fill="${C.turf3}"/>` + sk(`<path d="${faceD}" fill="${C.rock}"/><path d="M186 72 Q300 64 520 66 V80 Q300 76 188 86z" fill="${C.rock3}"/><path d="M340 164 Q430 160 520 158 V140 Q430 144 340 150 Q262 156 200 176 V186 Q262 170 340 164z" fill="${C.rock2}"/>`, `<path d="${faceD}"/>`)
    + [[230, 80, 186], [270, 74, 172], [330, 74, 166], [380, 72, 162], [440, 70, 160], [490, 70, 158]].map(([x, y1, y2]) => `<path d="M${x} ${y1} q-6 ${(y2 - y1)/2} 2 ${y2 - y1}" stroke="${C.rock2}" stroke-width="1" fill="none"/>`).join(""));
  // the ledges: short broken shelves across the face, whitewashed below with droppings in the nesting season
  const ledges = [[204, 258, 94], [280, 350, 96], [372, 430, 93], [452, 516, 95], [214, 300, 113], [322, 392, 115], [410, 470, 112], [486, 518, 114],
    [222, 268, 131], [290, 356, 133], [378, 446, 130], [466, 516, 132], [236, 300, 148], [330, 400, 150], [430, 500, 147]];
  const ledgeArt = NP(ledges.map(([x1, x2, y], k) => `<path d="M${x1} ${y} Q${(x1 + x2)/2} ${y - 1.6} ${x2} ${y + .6}" stroke="${C.rock3}" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M${x1 + 2} ${y + 2.2} Q${(x1 + x2)/2} ${y + 1} ${x2 - 2} ${y + 2.6}" stroke="${C.rock2}" stroke-width="1.2" fill="none"/>`
    + (pf || late ? Array.from({length: Math.floor((x2 - x1)/14)}, (_, j) => `<path d="M${f1(x1 + 6 + j*14 + rnd(j + k*10)*6)} ${y + 3} q${f1(rnd(j*7 + k)*2 - 1)} ${f1(4 + rnd(j*3 + k)*7)} 0 ${f1(5 + rnd(j*3 + k)*8)}" stroke="#F4F1EA" stroke-width="${f1(.8 + rnd(j + k)*.9)}" opacity="${pf ? .6 : .35}" stroke-linecap="round" fill="none"/>`).join("") : "")).join("")
    + (pf ? ledges.map(([x1, x2, y], k) => { let out = ""; for (let x = x1 + 5; x < x2 - 3; x += 7.2) { const r = rnd(x*.37 + k*17); if (r < .1) continue; out += auk(x, y, .72, r > .74, r > .42 ? 1 : -1); } return out; }).join("")
      : late ? [ledges[1], ledges[6], ledges[9]].map(([x1, , y], k) => [0, 1].map(j => auk(x1 + 14 + j*16, y, .72, (j + k) % 2 === 1)).join("")).join("")
      : s === "seals" ? [ledges[2], ledges[5], ledges[13]].map(([x1, , y]) => `<g transform="translate(${x1 + 20} ${y})">${fulmar()}</g>`).join("") : ""));
  // the Wick itself: the deep cleft of sea between the two sides, foam at the foot of the cliff
  const wick = water("M200 186 Q262 170 340 164 Q430 160 520 158 V238 Q440 236 360 230 Q270 222 200 186z", s === "winter" ? C.winter : C.deep)
    + waves([[260, 190], [330, 182], [400, 196], [470, 186], [440, 216], [360, 210]]) + NP(`<path d="M206 186 Q262 172 340 166 Q430 162 520 160" fill="none" stroke="${C.foam}" stroke-width="2.4" opacity=".8"/>`)
    + (s === "winter" ? surf([[240, 184, 0], [330, 172, 1.1], [430, 166, 2], [500, 168, .6]]) : surf([[300, 176, 1]]));
  // the clifftop puffins on the far side (small, far away) and in the sky, and rafts of them on the water
  const farPuffins = pf ? NP(Array.from({length: 22}, (_, k) => [204 + rnd(k*3 + 1)*306, 56 + rnd(k*5 + 2)*16, k]).sort((a, b) => a[1] - b[1]).map(([x, y, k]) => puffin(x, y, .48, rnd(k + 2) > .5 ? 1 : -1, k)).join(""))
    + NP([[270, 200, 1], [284, 206, -1], [300, 198, 1], [420, 214, -1], [436, 206, 1], [452, 216, 1], [380, 222, -1], [480, 196, -1]].map(([x, y, d], k) => swimmer(x, y, .7, d, k)).join(""))
    : late ? NP(puffin(300, 62, .5, 1, 0) + swimmer(420, 210, .7, 1, 0)) : "";
  const sky = pf ? flyer(-30, 120, .95, 1, 600, -40, 8, -1) + flyer(560, 100, .9, -1, -620, 20, 9, -4) + flyer(-30, 200, .85, 1, 590, -60, 10, -6) + flyer(560, 30, .8, -1, -600, 10, 11, -2)
      + flyer(-30, 260, 1, 1, 560, -150, 9, -3.4) + flyer(560, 210, .9, -1, -400, -150, 8.5, -.6) + flyer(-30, 30, .75, 1, 600, 0, 12, -8)
    : late ? flyer(-30, 120, .9, 1, 600, -40, 9, -3)
    : s === "seals" ? glider(-20, 120, .9, 560, 18, -4) + glider(540, 200, .8, -560, 22, -12)
    : glider(-20, 24, .7, 560, 28, -8, true) + glider(540, 36, .6, -560, 32, -20, true);
  // the turf slope on this side, riddled with burrows, the puffins standing about by them
  const slope = NP(`<path d="M200 190 Q270 222 360 232 Q440 238 520 240 V326 H196z" fill="${C.slope}"/><path d="M200 190 Q270 222 360 232 Q440 238 520 240" fill="none" stroke="${C.rock}" stroke-width="5" filter="url(#wob)"/>`
    + bluebells(300, 290, 160, 50, 30, 21)) + boulder(300, 264, 9, 1) + boulder(470, 280, 8, 0);
  const holes = [[222, 236], [250, 250], [282, 244], [312, 256], [344, 248], [376, 258], [404, 250], [436, 262], [468, 254], [496, 264],
    [234, 280], [262, 292], [296, 284], [328, 298], [360, 288], [392, 300], [424, 290], [458, 302], [490, 292], [246, 312], [312, 314], [380, 316], [446, 314], [500, 316]];
  const burrows = NP(holes.map(([x, y]) => burrow(x, y, 1.05)).join(""));
  const cliffPuffins = pf ? NP([
      [232, 236, 1, 0], [262, 248, -1, 1, 1], [292, 242, -1, 0], [322, 254, 1, 0], [354, 246, -1, 1], [388, 256, 1, 0], [414, 248, -1, 0, 1], [446, 260, 1, 0], [478, 252, -1, 0], [504, 262, -1, 0],
      [244, 278, 1, 1], [276, 290, -1, 0], [306, 282, 1, 0, 1], [340, 296, -1, 0], [372, 286, 1, 0], [404, 298, -1, 1], [434, 288, 1, 0], [470, 300, -1, 0], [258, 312, 1, 0], [324, 312, -1, 0, 1], [392, 314, 1, 0], [458, 312, -1, 0]
    ].map(([x, y, d, , fish], k) => puffin(x, y, .84 + rnd(k)*.12, d, k, {fish: !!fish})).join("") + peeper(496, 292, .95, -1) + peeper(380, 316, .95, 1) + peeper(250, 250, .9, 1))
    : late ? NP(puffin(330, 296, .95, -1, 0, {fish: true}) + puffin(420, 260, .95, 1, 1) + peeper(458, 302, .95, -1))
    : NP(rabbit(300, 288, .9, -1, 0, true) + rabbit(420, 300, .85, 1, 1) + rabbit(250, 262, .8, 1, 2));
  const pinks = NP([[214, 210], [470, 248], [216, 300], [500, 300], [280, 316], [420, 318], [350, 270]].map(([x, y], k) => thrift(x, y, .9, k)).join(""));
  const cliffs = place("picliffs", 320, 346, 34, 10, "The seabird cliffs and the puffin burrows", "", "Seabird cliffs", 300, 372, "#BFE0DA");
  // the rope line: low posts and a sagging rope along the top of the slope, a little warden's sign
  const rope = place("piropeline", 440, 352, 30, 9, "The rope line along the burrows", NP(sk(Array.from({length: 9}, (_, k) => `<rect x="${200 + k*36}" y="${318}" width="4" height="16" fill="${C.wood}"/>`).join("")
      + `<rect x="462" y="294" width="3" height="40" fill="${C.wood}"/><rect x="430" y="282" width="68" height="24" rx="2" fill="#FFFDF6"/>`, `<rect x="430" y="282" width="68" height="24" rx="2"/>`)
    + `<path d="${Array.from({length: 8}, (_, k) => `M${202 + k*36} 322 Q${220 + k*36} 330 ${238 + k*36} 322`).join(" ")}" stroke="#D8C08A" stroke-width="1.6" fill="none"/>`
    + `<text x="464" y="293" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="5.4" fill="${C.ink}">${pf || late ? "PUFFINS NESTING" : "PUFFIN BURROWS"}</text><text x="464" y="301.4" text-anchor="middle" font-family="Klee One,serif" font-size="5" fill="${C.ink}">behind the rope, please</text>`), "Rope line", 440, 376, "#F2C9B4");
  // the west headland: rock at the corner, sea pinks, the bench right at the edge looking down the Wick
  const head = NP(sk(`<path d="M0 54 Q60 52 120 50 Q170 50 186 72 Q192 130 200 186 Q170 200 150 196" fill="none" stroke="${C.rock}" stroke-width="10"/><path d="M0 58 Q30 120 26 180 Q40 240 0 300z" fill="${C.rock}"/><path d="M8 100 l12 4 M6 160 l14 2 M8 230 l12 6" stroke="${C.rock2}" stroke-width="1"/><ellipse cx="14" cy="130" rx="4" ry="2" fill="${C.lichen}"/><ellipse cx="18" cy="200" rx="3" ry="1.6" fill="${C.lichen2}"/>`,
    `<path d="M0 58 Q30 120 26 180 Q40 240 0 300"/>`) + [[54, 70], [96, 66], [140, 64], [176, 92], [180, 140], [44, 120], [60, 200], [110, 150]].map(([x, y], k) => thrift(x, y, 1, k)).join("") + bluebells(100, 120, 100, 60, 24, 31) + gorse(70, 280, .9));
  const edge = place("piedge", 150, 236, 28, 9, "The bench at the cliff edge", bench(150, 218, "#8A7A62"), "Cliff-edge bench", 128, 258, "#E8C9A8");
  // the paths: in from the haven, along behind the rope, and down the coast path to the point
  const paths = trail("M0 410 Q90 380 180 372 Q260 364 340 366 Q420 370 476 380") + trail("M300 366 Q290 460 304 540 Q306 600 300 640") + trail("M180 372 Q160 300 150 240", 16);
  // the east side: cliffs and a glimpse of sea; bracken and an old wall in the bottom corners; boulders
  const east = water("M500 326 Q492 420 504 520 Q496 600 510 640 H520 V326z", seaCol()) + shoreRock("M486 330 Q478 430 490 520 Q484 600 494 640", 12) + surf(s === "winter" ? [[506, 400, 0], [506, 560, 1.6]] : []);
  const edges = brackenPatch([[16, 580], [44, 606], [80, 586], [110, 620], [30, 634], [124, 600]]) + brackenPatch([[404, 590], [434, 610], [466, 588], [420, 636], [458, 630]])
    + bluebells(70, 600, 110, 40, 20, 41) + drywall(0, 566, 134, 574, 12, 12) + drywall(392, 572, 486, 566, 12, 14)
    + boulder(80, 466, 15, 1) + boulder(200, 600, 10, 0) + boulder(420, 470, 9, 1) + thrift(120, 440, .9, 1) + thrift(380, 520, .9, 2) + thrift(220, 470, .8, 0)
    + rabbit(120, 520, .85, 1, 3, true) + rabbit(400, 430, .8, -1, 4)
    + tufts([[60, 340], [130, 330], [240, 420], [370, 420], [420, 520], [160, 560], [240, 520], [340, 600], [60, 480]]) + flowers([[100, 340], [210, 400], [380, 460], [260, 580], [150, 500]], "#FFFDF6");
  return ground + sea + face + ledgeArt + wick + slope + burrows + farPuffins + pinks + cliffPuffins + head + paths + east + edges + rope + cliffs + edge + sky
    + gate("piToHaven", 20, 410, "North Haven", 80, 440, "West along the clifftop to North Haven", "#BFE0DA")
    + gate("piToPoint", 300, 612, "Lighthouse Point", 196, 616, "South along the coast path to Lighthouse Point");
}
// in autumn a fulmar or two sit on the ledges: grey and white, a stubby tube-nosed bill
const fulmar = () => `<ellipse cx="0" cy="-4.6" rx="5" ry="4.2" fill="#FBFAF5"/><ellipse cx="-2" cy="-5.4" rx="4" ry="2.4" fill="#B9C2C6"/><circle cx="3" cy="-8.6" r="2.7" fill="#FBFAF5"/><circle cx="3.8" cy="-9" r=".6" fill="#1A1A1A"/><path d="M5.4 -9 l2.4 .8 l-2.4 .6z" fill="#C9B46A"/>`;

/* ---------- pi_farm: the old farm ---------- */
function farmScreen(){
  const s = season(), m = mon();
  const ground = turfGround("#A9C87E");
  // the sea round the bottom left: low cliffs, a glimpse of open water
  const sea = water("M0 480 Q16 520 50 552 Q110 584 200 582 Q320 580 420 584 Q480 586 520 584 V640 H0z", seaCol()) + shoreRock("M0 476 Q18 520 52 550 Q110 578 200 576 Q320 574 420 578 Q480 580 520 578", 14)
    + waves([[60, 606], [180, 620], [300, 604], [420, 620], [480, 600]]) + (s === "winter" ? surf([[90, 580, 0], [300, 582, 1.2], [460, 584, 2.2]]) : "") + (s === "puffins" ? NP(swimmer(250, 614, .7, 1, 0) + swimmer(266, 620, .7, -1, 1)) : "");
  // the track down from the haven, the lane out east to the lighthouse, and little paths to the doors
  const paths = trail("M260 0 V130 Q260 250 262 300 Q300 330 400 330 Q470 330 520 330") + trail("M262 236 Q200 230 130 222", 18) + trail("M262 240 Q330 236 385 228", 18) + trail("M262 300 Q236 400 214 466 Q190 496 130 494", 16) + trail("M300 320 Q330 400 360 440", 16);
  // the old farmhouse: long, low and whitewashed, a slate roof, a chimney at each end; Bryn's tearoom
  const house = place("pitearoom", 130, 216, 26, 9, "Bryn's tearoom in the old farmhouse", NP(cottage(30, 202, 196, 74, 56, {
      extra: `<path d="M120 202 V176 Q130 166 140 176 V202z" fill="#2F4A5E"/><circle cx="136" cy="190" r="1.2" fill="#E3C26A"/>${win(48, 150)}${win(84, 150)}${win(160, 150)}${win(196, 150)}
        <rect x="108" y="140" width="44" height="12" rx="2" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".6"/><text x="130" y="149" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7.4" fill="${C.ink}">Tearoom</text>
        <path d="M110 202 l3 -7 h4 l1 7z M150 202 l1 -7 h4 l2 7z" fill="#6A4A34"/>${[[44, 168], [80, 168], [156, 168], [192, 168]].map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="5" fill="#B9604A"/><circle cx="${x + 5}" cy="${y - 2}" r="2.2" fill="#E8566C"/><circle cx="${x + 11}" cy="${y - 3}" r="2.2" fill="#F2C94C"/><circle cx="${x + 17}" cy="${y - 2}" r="2.2" fill="#E8566C"/>`).join("")}`,
      lines: `<path d="M120 202 V176 Q130 166 140 176 V202"/>`})
    + sk(`<rect x="40" y="58" width="16" height="30" fill="${C.white}"/><rect x="38" y="56" width="20" height="5" fill="${C.slate}"/><rect x="200" y="58" width="16" height="30" fill="${C.white}"/><rect x="198" y="56" width="20" height="5" fill="${C.slate}"/>`, `<rect x="40" y="58" width="16" height="30"/><rect x="200" y="58" width="16" height="30"/>`)
    + smoke(48, 52) + smoke(208, 52)
    // the woodpile in its lean-to at the end of the house, and a bench with a teapot outside
    + sk(`<path d="M226 150 L244 160 V204 H226z" fill="${C.slate}"/>${[0, 1, 2, 3].map(r => [0, 1].map(c => `<circle cx="${231 + c*8 + (r % 2)*3}" cy="${200 - r*8}" r="3.6" fill="#B89A6E" stroke="#6A4A34" stroke-width=".6"/>`).join("")).join("")}`, "")
    + bench(184, 226, "#6E8A9A") + `<path d="M176 207 h8 v5 h-8z" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".5"/><path d="M184 208 q3 0 3 3" stroke="${C.ink}" stroke-width=".5" fill="none"/>`), "Tearoom", 130, 240, "#E8C9A8");
  // the walled garden: old stone walls, rows of kale and beans, fuchsia, two beehives, a wooden gate
  const veg = s === "winter" ? `${[110, 132, 154].map(y => Array.from({length: 8}, (_, k) => `<path d="M${314 + k*20} ${y} q-4 -6 0 -10 q4 4 0 10z" fill="#4E7A54"/>`).join("")).join("")}`
    : `${[104, 128].map(y => Array.from({length: 8}, (_, k) => `<circle cx="${314 + k*20}" cy="${y}" r="5.4" fill="${k % 2 ? "#5E8A4A" : "#6E9A52"}"/><circle cx="${312 + k*20}" cy="${y - 2}" r="2.4" fill="#86B266"/>`).join("")).join("")}${Array.from({length: 7}, (_, k) => `<path d="M${318 + k*22} 176 V146" stroke="${C.wood}" stroke-width="1.4"/><path d="M${318 + k*22} 172 q-4 -6 0 -12 q4 -6 0 -12" stroke="#5E8A4A" stroke-width="2.2" fill="none"/>${s === "puffins" && m >= 6 ? `<circle cx="${320 + k*22}" cy="158" r="1.6" fill="#E8566C"/>` : ""}`).join("")}`;
  const fuchsia = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="10" fill="#4E7A44"/>${s === "winter" ? "" : [[-8, -2], [-2, 4], [6, -4], [9, 3], [0, -6]].map(([a, b]) => `<path d="M${x + a} ${y + b} v3" stroke="#B4285A" stroke-width="1.6"/><circle cx="${x + a}" cy="${y + b + 4}" r="1.3" fill="#7A3A9A"/>`).join("")}`;
  const garden = place("pigarden", 385, 226, 26, 9, "The walled garden", NP(sk(`<rect x="290" y="62" width="192" height="148" fill="#8E9C6A"/><rect x="290" y="62" width="192" height="20" fill="${C.stone}"/>`, "")
      + `<g opacity=".95">${veg}</g>${fuchsia(304, 92)}${fuchsia(468, 92)}${fuchsia(470, 180)}`
      + sk(`<rect x="300" y="168" width="14" height="16" fill="#F4F1EA"/><path d="M298 168 h18 l-2 -4 h-14z" fill="#D9D2C2"/><rect x="420" y="168" width="14" height="16" fill="#F4F1EA"/><path d="M418 168 h18 l-2 -4 h-14z" fill="#D9D2C2"/>`, "")
      + (s === "winter" ? "" : [[310, 160], [432, 160], [380, 150]].map(([x, y], k) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;6 -4;-3 3;0 0" dur="${3 + k}s" repeatCount="indefinite"/><ellipse cx="${x}" cy="${y}" rx="1.6" ry="1.2" fill="#E3B04B"/><path d="M${x - 1} ${y - 1} l-1 -1.4 M${x + 1} ${y - 1} l1 -1.4" stroke="#FFFFFF" stroke-width=".7"/></g>`).join(""))
      + drywall(290, 72, 482, 72, 16, 21) + drywall(290, 72, 290, 206, 10, 23) + drywall(482, 72, 482, 206, 10, 25) + drywall(290, 206, 372, 206, 14, 27) + drywall(398, 206, 482, 206, 14, 29)
      + sk(`<rect x="373" y="190" width="24" height="16" fill="#9A7A54"/><path d="M373 196 h24 M373 202 h24 M373 190 l24 16" stroke="#6A4A34" stroke-width="1"/>`, `<rect x="373" y="190" width="24" height="16"/>`)), "Walled garden", 385, 250, "#E8C9A8");
  // the gorse hedge down the east side above the lane
  const hedge = gorse(492, 160, 1.1) + gorse(500, 200, 1) + gorse(488, 244, 1.1) + gorse(504, 278, .9);
  // the pond: a moorhen bobbing, reeds, yellow flag irises in early summer, a heron at the edge
  const iris = s === "puffins" && m >= 5 && m <= 7;
  const pond = place("pipond", 130, 492, 26, 9, "The farm pond", NP(sk(`<ellipse cx="130" cy="424" rx="84" ry="46" fill="#7FA6A8"/><ellipse cx="124" cy="420" rx="66" ry="32" fill="#8FB6B4"/>`, `<ellipse cx="130" cy="424" rx="84" ry="46"/>`)
      + [[80, 418], [168, 430], [120, 440]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.4" fill="#5E8A4A"/><path d="M${x} ${y} l5 -2" stroke="#8FB6B4" stroke-width="1"/>`).join("")
      + [[52, 400], [58, 420], [204, 410], [198, 438], [64, 446], [190, 396]].map(([x, y], k) => `<path d="M${x} ${y + 12} q-2 -14 -1 -24 M${x + 3} ${y + 12} q1 -14 3 -22 M${x + 6} ${y + 12} q2 -10 5 -16" stroke="${s === "winter" ? "#B49A6A" : "#5E8A4A"}" stroke-width="1.6" fill="none"/>${k % 2 ? "" : `<rect x="${x + 1.6}" y="${y - 16}" width="3" height="9" rx="1.4" fill="#6A4A34"/>`}${iris && k % 2 ? `<path d="M${x + 6} ${y - 6} l-3 -4 l3 1 l3 -1z" fill="#F2C94C"/>` : ""}`).join("")
      + `<g><animateTransform attributeName="transform" type="translate" values="0 0;18 3;0 0" dur="14s" repeatCount="indefinite"/><ellipse cx="108" cy="414" rx="7" ry="4" fill="#2A2A2E"/><circle cx="114" cy="409" r="3" fill="#2A2A2E"/><path d="M116 408 l3 1 l-3 1z" fill="#D8332A"/><path d="M102 412 l-3 -2 v3z" fill="#FFFFFF"/><path d="M98 418 q6 -2 12 0 q6 2 12 0" stroke="#EAF2F0" stroke-width="1" fill="none"/></g>`
      + `<g transform="translate(196 392)"><path d="M0 0 v-10 M3 0 v-10" stroke="#B4A06A" stroke-width="1"/><ellipse cx="2" cy="-16" rx="5" ry="7" fill="#9AA4AA"/><path d="M4 -22 q4 -6 0 -12" stroke="#9AA4AA" stroke-width="2.4" fill="none"/><circle cx="4" cy="-34" r="2.4" fill="#C9D0D4"/><path d="M5 -35 h3" stroke="#1F1F22" stroke-width=".8"/><path d="M6 -34 l7 1 l-7 1z" fill="#D9B44A"/></g>`), "The pond", 130, 514, "#BFE0DA");
  // the picnic meadow: soft turf full of little flowers, a checked rug and a basket
  const fl = s === "puffins" ? (m <= 5 ? ["#F2D86A", "#FFFDF6"] : ["#F2D86A", "#E68AAE", "#B9A6E0"]) : s === "late" ? ["#B9A6E0", "#F2D86A"] : s === "seals" ? ["#FFFDF6"] : [];
  const meadowFlowers = fl.length ? NP(Array.from({length: 46}, (_, k) => { const x = 290 + rnd(k)*210, y = 360 + rnd(k + 70)*200; return `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.7" fill="${fl[k % fl.length]}"/>`; }).join("")) : "";
  const meadow = place("pimeadow", 360, 456, 30, 9, "The picnic meadow", NP(sk(`<path d="M332 418 L388 412 L392 444 L330 448z" fill="#E8566C"/>${[0, 1, 2, 3].map(k => `<path d="M${338 + k*14} 417 L${338 + k*14} 447" stroke="#FFFDF6" stroke-width="3"/>`).join("")}${[0, 1].map(k => `<path d="M331 ${426 + k*12} L390 ${421 + k*12}" stroke="#FFFDF6" stroke-width="3"/>`).join("")}`, `<path d="M332 418 L388 412 L392 444 L330 448z"/>`)
    + sk(`<rect x="394" y="428" width="18" height="12" rx="2" fill="#C2A06A"/><path d="M396 428 q7 -10 14 0" stroke="#8A6A44" stroke-width="1.6" fill="none"/><path d="M394 433 h18" stroke="#8A6A44" stroke-width=".8"/>`, "")
    + `<rect x="350" y="424" width="9" height="7" rx="1" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".5"/><circle cx="372" cy="432" r="4" fill="#F2D86A" stroke="${C.ink}" stroke-width=".5"/>`), "Picnic meadow", 360, 480, "#F2C9B4");
  // a wind-bent hawthorn (blossom in May, red haws in autumn), boulders, rabbits, an old wall
  const thorn = NP(sk(`<path d="M452 528 Q450 506 462 494 Q476 484 490 482" stroke="#5E4434" stroke-width="4" fill="none"/><path d="M462 496 l-8 -6" stroke="#5E4434" stroke-width="2"/>${[[446, 488, 14, 8], [470, 480, 18, 9], [490, 476, 12, 7]].map(([x, y, a, b]) => `<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="${s === "winter" ? "none" : "#5E7A44"}"/>`).join("")}`, "")
    + (m === 5 ? [[440, 486], [452, 482], [466, 478], [478, 482], [492, 474], [484, 470]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#FFF6F2"/>`).join("") : s === "seals" ? [[444, 490], [458, 484], [474, 484], [488, 476]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#C0302A"/>`).join("") : ""));
  const bits = drywall(20, 300, 150, 290, 12, 33) + drywall(286, 540, 400, 552, 12, 35) + boulder(240, 520, 11, 0) + boulder(36, 360, 12, 1) + boulder(470, 400, 10, 1)
    + rabbit(300, 520, .85, 1, 1, true) + rabbit(440, 380, .8, -1, 2) + rabbit(80, 330, .8, 1, 3, true) + bluebells(80, 330, 90, 40, 18, 51)
    + tufts([[70, 260], [180, 270], [330, 280], [430, 270], [200, 520], [270, 440], [470, 450], [400, 560], [80, 540]]) + thrift(30, 470, .9, 1) + thrift(250, 566, .9, 2) + thrift(460, 566, .9, 0);
  return ground + sea + paths + house + garden + hedge + pond + meadowFlowers + meadow + thorn + bits
    + gate("piToHavenN", 260, 40, "North Haven", 176, 34, "North up the track to North Haven", "#BFE0DA")
    + gate("piToPointE", 500, 330, "Lighthouse", 456, 372, "East along the lane to Lighthouse Point", "#BFE0DA");
}

/* ---------- pi_point: Lighthouse Point ---------- */
function pointScreen(){
  const s = season(), w = s === "winter";
  const ground = turfGround("#A3C07A") + `<g filter="url(#wash)" opacity=".5" pointer-events="none"><ellipse cx="380" cy="420" rx="80" ry="50" fill="${C.rock3}"/></g>`;
  // the sea down the east side and along the bottom: the seal beach's cove under the lighthouse, the rock pools, the
  // sea-glass cove
  const seaD = "M520 0 V640 H0 V602 Q60 596 120 600 Q150 602 168 590 Q190 572 222 570 Q262 568 292 576 Q316 586 334 602 Q400 610 470 600 Q490 560 484 500 Q478 470 466 458 Q452 446 448 420 Q444 390 446 360 Q448 320 458 296 Q464 282 468 270 Q476 200 470 120 Q466 60 470 0z";
  const sea = water(seaD, seaCol()) + waves([[490, 40], [492, 160], [494, 250], [490, 340], [496, 440], [500, 560], [60, 620], [200, 626], [380, 622], [460, 616]])
    + shoreRock("M470 0 Q466 60 470 120 Q476 200 466 268 Q456 284 452 300", 12) + shoreRock("M466 456 Q478 470 484 500 Q490 560 470 600", 10) + shoreRock("M0 600 Q60 594 120 598 Q150 600 168 588", 10)
    + (w ? surf([[480, 90, 0], [478, 230, 1.3], [490, 500, .6], [100, 596, 2], [330, 600, 1.7]]) : surf([[480, 230, .5]]));
  // the lighthouse on the tip: white, round, the black lantern and its gallery, the brass plaque by the door
  const lighthouse = place("pilighthouse", 398, 246, 26, 9, "The lighthouse", NP(sk(`<path d="M366 236 Q366 228 372 226 H424 Q430 228 430 236z" fill="${C.stone2}"/><path d="M374 228 L382 80 H414 L422 228z" fill="#FBFAF5"/><path d="M374 228 L382 80 H390 L384 228z" fill="#E4E2DA"/>
      <rect x="376" y="70" width="44" height="10" fill="#2F3438"/><path d="M372 70 h52" stroke="#2F3438" stroke-width="2.4"/>${[378, 386, 394, 402, 410, 418].map(x => `<path d="M${x} 70 v-8" stroke="#2F3438" stroke-width="1"/>`).join("")}<path d="M374 62 h48" stroke="#2F3438" stroke-width="1.2"/>
      <rect x="384" y="42" width="28" height="22" fill="#CFE6EE"/><path d="M393 42 v22 M403 42 v22" stroke="#2F3438" stroke-width="1.6"/><path d="M380 44 Q398 22 416 44z" fill="#2F3438"/><path d="M398 28 v-8" stroke="#2F3438" stroke-width="1.4"/><circle cx="398" cy="19" r="2.2" fill="#2F3438"/>
      <path d="M388 228 V212 Q398 202 408 212 V228z" fill="#2F4A5E"/>${[110, 146, 182].map(y => `<rect x="395" y="${y}" width="6" height="10" rx="3" fill="#3E4650"/>`).join("")}<rect x="412" y="212" width="8" height="6" rx="1" fill="#D9B44A"/>`,
      `<path d="M374 228 L382 80 H414 L422 228z"/><rect x="376" y="70" width="44" height="10"/><rect x="384" y="42" width="28" height="22"/><path d="M380 44 Q398 22 416 44z"/><path d="M388 228 V212 Q398 202 408 212 V228"/>`)
    + `<g><ellipse cx="398" cy="53" rx="6" ry="7" fill="#FFF6C8" opacity=".9"><animate attributeName="opacity" values=".2;.9;.2" dur="5s" repeatCount="indefinite"/></ellipse></g>`
    + `<circle cx="416" cy="215" r="1.6" fill="#FFF6C8"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/></circle>`), "Lighthouse", 410, 268, "#E8C9A8");
  // the keeper's cottage: thick white walls, a blue door, smoke from the chimney, the cat in the window, the washing line
  const cat = `<ellipse cx="320" cy="164" rx="5" ry="3.6" fill="#2A2A2E"/><circle cx="324" cy="160" r="3" fill="#2A2A2E"/><path d="M322 158 l.6 -3 l1.6 2 M325 157 l1.4 -2.4 l.6 2.8" fill="#2A2A2E"/><circle cx="325" cy="160" r=".6" fill="#F2C94C"/>`;
  const keeper = place("pikeeper", 292, 236, 26, 9, "The keeper's cottage", NP(cottage(232, 222, 120, 70, 44, {
      extra: `<path d="M282 222 V196 Q292 186 302 196 V222z" fill="#3E6B8C"/><circle cx="298" cy="210" r="1.2" fill="#E3C26A"/>${win(246, 172)}${win(312, 158, 16, 14)}${cat}<rect x="262" y="214" width="12" height="8" fill="#B9604A"/><circle cx="266" cy="211" r="2" fill="#E8566C"/><circle cx="270" cy="210" r="2" fill="#F2C94C"/>`,
      lines: `<path d="M282 222 V196 Q292 186 302 196 V222"/>`})
    + sk(`<rect x="330" y="98" width="14" height="26" fill="${C.white}"/><rect x="328" y="96" width="18" height="4" fill="${C.slate}"/>`, `<rect x="330" y="98" width="14" height="26"/>`) + smoke(337, 92)
    + sk(`<rect x="131" y="150" width="4" height="62" fill="${C.wood}"/>`, "") + `<path d="M133 156 Q182 170 232 162" stroke="#8A8C88" stroke-width=".8" fill="none"/>`
    + [[150, 160, "#FFFDF6"], [166, 164, "#E8566C"], [184, 166, "#7FA9C4"], [202, 165, "#F2C94C"]].map(([x, y, c], k) => `<g><animateTransform attributeName="transform" type="skewX" values="0;${k % 2 ? 8 : -8};0" dur="${2.4 + k*.3}s" repeatCount="indefinite"/><rect x="${x - 5}" y="${y}" width="10" height="${12 + (k % 2)*4}" fill="${c}" stroke="${C.ink}" stroke-width=".6"/></g>`).join("")), "Keeper's cottage", 270, 258, "#F2C9B4");
  // the seal beach: a pebbly cove under the lighthouse; pups in autumn, a seal or two bobbing in summer
  const beachD = "M468 268 Q392 288 380 360 Q374 432 462 466 Q452 446 448 420 Q444 390 446 360 Q448 320 458 296z";
  const sealsHere = s === "seals" ? seal(426, 318, .95, -1) + pup(414, 362, 1.45, -1, 0) + pup(412, 412, 1.35, 1, 1) + pup(434, 446, 1.15, -1, 2) + sealHead(476, 360, 1, 0) + sealHead(490, 420, .9, 1)
    : s === "winter" ? "" : sealHead(482, 380, 1, 0) + sealHead(492, 470, .85, 1);
  const seals = place("piseals", 360, 372, 26, 9, "The seal beach", NP(sk(`<path d="${beachD}" fill="${C.pebble}"/>`, `<path d="${beachD}"/>`) + shoreRock("M468 266 Q390 286 378 360 Q372 434 460 470", 7) + `<path d="M458 296 Q448 320 446 360 Q444 390 448 420 Q452 446 462 460" stroke="${C.foam}" stroke-width="2.4" fill="none" opacity=".85"><animate attributeName="opacity" values=".9;.35;.9" dur="4.4s" repeatCount="indefinite"/></path>` + Array.from({length: 24}, (_, k) => `<ellipse cx="${f1(394 + rnd(k + 5)*46)}" cy="${f1(300 + rnd(k + 33)*150)}" rx="1.6" ry="1.1" fill="${["#A9A396", "#8E897E"][k % 2]}"/>`).join("") + sealsHere), "Seal beach", 340, 396, "#BFE0DA");
  // the rock pools: a shelf of grey rock with pools in it: anemones, a starfish, a crab, samphire in the cracks
  const pools = place("pipools", 356, 470, 26, 9, "The rock pools", NP(sk(`<path d="M340 488 Q380 476 440 480 Q478 488 480 530 Q486 580 466 600 Q400 608 346 600 Q332 560 340 488z" fill="${C.rock3}"/>`, `<path d="M340 488 Q380 476 440 480 Q478 488 480 530 Q486 580 466 600 Q400 608 346 600 Q332 560 340 488z"/>`)
      + [[372, 506, 18, 8], [430, 516, 22, 10], [392, 556, 24, 10], [450, 572, 14, 7]].map(([x, y, a, b]) => `<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="#6FA4AE" stroke="${C.rock2}" stroke-width="1.4"/><ellipse cx="${x - a*.3}" cy="${y - b*.3}" rx="${a*.4}" ry="${b*.25}" fill="#9CC8CC"/>`).join("")
      + [[366, 508], [436, 512], [386, 558], [400, 552]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#C0302A"/><circle cx="${x}" cy="${y}" r="1" fill="#E8566C"/>`).join("")
      + `<path d="M424 520 l3 -6 l1 6 l6 -2 l-5 4 l4 5 l-6 -2 l-2 6 l-1 -6 l-6 1z" fill="#E8823A"/><g><animateTransform attributeName="transform" type="translate" values="0 0;8 0;8 0;0 0" dur="6s" repeatCount="indefinite"/><ellipse cx="400" cy="584" rx="4" ry="2.6" fill="#C9603A"/><path d="M396 584 l-3 -2 M404 584 l3 -2 M397 586 l-2 2 M403 586 l2 2" stroke="#C9603A" stroke-width=".8"/></g>`
      + [[350, 492], [470, 540], [356, 590]].map(([x, y]) => `<path d="M${x} ${y} l-3 -6 M${x} ${y} l0 -7 M${x} ${y} l3 -6" stroke="#7FA35A" stroke-width="1.6"/>`).join("")
      + [[384, 528], [416, 590], [460, 546]].map(([x, y]) => `<path d="M${x - 3} ${y} q3 -5 6 0z" fill="#8A8C88"/>`).join("") + `<path d="M350 530 l14 6 l8 -4 M404 500 l10 6 M346 572 l20 -4 M440 548 l-6 12 M462 500 l-8 8" stroke="${C.rock2}" stroke-width=".9" fill="none"/>` + [[354, 548, "#C2C2BA"], [470, 590, "#B2B2AA"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="${c}" stroke="${C.rock2}" stroke-width=".8"/>`).join("") + `<path d="M480 530 Q486 580 466 600 Q400 608 346 600" stroke="#8A6A2E" stroke-width="5" stroke-dasharray="3 2" fill="none" opacity=".8"/><path d="M478 520 Q484 570 462 596" stroke="#5E7A3A" stroke-width="2" stroke-dasharray="2 3" fill="none"/>`), "Rock pools", 356, 494, "#BFE0DA");
  // the sea-glass cove: a little pebble beach with glass glinting in it
  const glass = place("piglass", 236, 534, 28, 9, "The sea-glass cove", NP(sk(`<path d="M172 590 Q192 560 226 558 Q268 556 296 566 Q318 576 330 598 Q300 590 260 588 Q210 588 172 590z" fill="${C.pebble}"/>`, `<path d="M172 590 Q192 560 226 558 Q268 556 296 566 Q318 576 330 598"/>`)
      + Array.from({length: 30}, (_, k) => `<ellipse cx="${f1(186 + rnd(k + 11)*136)}" cy="${f1(564 + rnd(k + 61)*24)}" rx="1.8" ry="1.2" fill="${["#A9A396", "#BDB6A6", "#8E897E"][k % 3]}"/>`).join("")
      + [[200, 576, "#7FC2A0"], [222, 568, "#C98A3A"], [244, 580, "#F4F6F2"], [262, 570, "#7FC2A0"], [286, 580, "#5E9CD8"], [306, 584, "#9FD8C0"], [234, 586, "#C98A3A"]].map(([x, y, c], k) => `<path d="M${x - 3} ${y} l2 -2.6 l3 .4 l1 2.6 l-3 1.4z" fill="${c}" stroke="#4A5A5A" stroke-width=".4"/><circle cx="${x}" cy="${y - 1}" r="1.2" fill="#FFFFFF"><animate attributeName="opacity" values="0;1;0;0" dur="${3 + k*.4}s" begin="${-k*.7}s" repeatCount="indefinite"/></circle>`).join("")), "Sea-glass cove", 236, 556, "#F2C9B4");
  // Ivy's boathouse at the top of the slipway: stone, a slate roof, the big doors open, jars of sea glass glowing
  const jars = [[78, "#7FC2A0"], [88, "#5E9CD8"], [98, "#C98A3A"], [108, "#9FD8C0"], [118, "#F4F6F2"]];
  const boathouse = place("piboathouse", 96, 528, 26, 9, "Ivy's boathouse studio", NP(sk(`<rect x="88" y="516" width="22" height="80" fill="${C.stone2}"/>${Array.from({length: 8}, (_, k) => `<path d="M88 ${520 + k*10} h22" stroke="${C.stone3}" stroke-width=".6"/>`).join("")}`, "")
    + cottage(40, 514, 112, 54, 40, {wall: "#B9B3A6", extra: `<path d="M70 514 V478 H122 V514z" fill="#2E2A28"/><path d="M70 478 L58 514 M122 478 L134 514" stroke="${C.wood}" stroke-width="5"/>${jars.map(([x, c], k) => `<rect x="${x - 3.6}" y="${486 + (k % 2)*2}" width="7.2" height="10" rx="1.6" fill="${c}" opacity=".9"/><rect x="${x - 2.6}" y="${484 + (k % 2)*2}" width="5.2" height="2" fill="#8A7A6A"/>`).join("")}<path d="M72 498 h48" stroke="${C.wood}" stroke-width="1.6"/>${[[80, "#E8566C"], [96, "#7FC2A0"], [112, "#F2C94C"]].map(([x, c], k) => `<g><animateTransform attributeName="transform" type="rotate" values="-8 ${x} 480;8 ${x} 480;-8 ${x} 480" dur="${3 + k}s" repeatCount="indefinite"/><path d="M${x} 480 v4" stroke="#8A7A6A" stroke-width=".5"/><circle cx="${x}" cy="${487}" r="3" fill="${c}" opacity=".85"/></g>`).join("")}
        <rect x="74" y="452" width="44" height="10" rx="2" fill="#FFFDF6" stroke="${C.ink}" stroke-width=".6"/><text x="96" y="459.6" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="6.4" fill="${C.ink}">Sea Glass</text>${[[48, 470, "#E8823A"], [140, 476, "#F4F1EA"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="${c}"/><path d="M${x} ${y - 4} v-6" stroke="#8A7A6A" stroke-width=".8"/>`).join("")}`,
      lines: `<path d="M70 514 V478 H122 V514"/>`})
    + sk(`<path d="M24 542 Q22 528 40 526 Q58 524 60 538 z" fill="#3E6B8C"/><path d="M24 542 h36" stroke="#F4F1EA" stroke-width="1.6"/>`, "")), "Boathouse", 96, 552, "#E8C9A8");
  // the paths: down from the Wick, in from the farm, out to each place
  const paths = trail("M200 0 V120 Q206 250 220 300") + trail("M0 330 Q120 320 220 300 Q300 288 340 296") + trail("M292 236 Q290 270 262 292", 16) + trail("M398 246 Q384 282 336 296", 16)
    + trail("M300 294 Q330 330 360 372 Q372 420 356 470", 16) + trail("M222 308 Q230 430 236 534", 16) + trail("M226 420 Q150 440 96 528", 16);
  // the north-west corner: rock, gorse, thrift, a little bracken; boulders and rabbits
  // the north-west corner: a tumble of lichened boulders, gorse and bracken, sea pinks in the cracks
  const nw = brackenPatch([[14, 120], [40, 150], [16, 190], [64, 196], [100, 186]], .9) + boulder(34, 90, 22, 1) + boulder(80, 66, 16, 0) + boulder(20, 54, 12, 1) + boulder(96, 120, 14, 1) + boulder(56, 132, 12, 0)
    + gorse(124, 160, 1) + gorse(140, 96, .85) + gorse(40, 200, .8) + thrift(66, 96, .8, 1) + thrift(110, 200, .9, 0) + thrift(130, 60, .8, 2) + thrift(16, 100, .7, 1);
  const bits = brackenPatch([[260, 70], [300, 84], [240, 96], [330, 66]], .9) + boulder(30, 400, 13, 1) + boulder(170, 420, 9, 0) + boulder(330, 420, 10, 1)
    + rabbit(160, 260, .85, 1, 1, true) + rabbit(60, 300, .8, -1, 2) + rabbit(300, 380, .8, 1, 3, true)
    + thrift(440, 270, .8, 1) + thrift(420, 460, .8, 2) + thrift(150, 570, .9, 0) + thrift(332, 470, .7, 1) + bluebells(280, 90, 120, 40, 18, 61)
    + tufts([[100, 270], [180, 380], [260, 420], [140, 460], [300, 520], [200, 240], [360, 330], [60, 450]]) + flowers([[120, 300], [200, 440], [300, 450], [60, 380], [260, 260]], "#FFFDF6");
  // in season, a few puffins whirring past offshore and rafting off the point; gannets in winter; fulmars in autumn
  const sky = s === "puffins" ? flyer(560, 300, .85, -1, -640, -60, 10, -3) + flyer(-30, 610, .8, 1, 580, -20, 11, -6) + NP(swimmer(496, 520, .75, -1, 0) + swimmer(500, 200, .75, -1, 1) + swimmer(120, 622, .7, 1, 2))
    : s === "seals" ? glider(-20, 620, .8, 560, 20, -7) : w ? glider(540, 120, .7, -560, 28, -6, true) : "";
  return ground + sea + paths + nw + keeper + lighthouse + seals + pools + glass + boathouse + bits + sky
    + gate("piToWickN", 200, 40, "The Wick", 200, 96, "North along the coast path to the Wick", "#BFE0DA")
    + gate("piToFarmW", 20, 330, "The Old Farm", 90, 366, "West along the lane to the old farm");
}

export function puffinArt(scene){
  return scene === "pi_haven" ? havenScreen() : scene === "pi_wick" ? wickScreen() : scene === "pi_farm" ? farmScreen() : pointScreen();
}
// the sight on the far shore as you sail out (a 600x90 strip; the sea starts at y 56): the island, green on top and
// ringed with grey cliffs, the white lighthouse on its tip, and in season puffins whirring past low over the water.
// (Read when the module loads; puffinSight() gives a fresh one for any day.)
export function puffinSight(day = dayKey()){
  const pf = ["puffins", "late"].includes(puffinSeason(day));
  const bird = (x, y, k) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;-70 ${k % 2 ? -4 : 3}" dur="${5 + k}s" begin="${-k*1.3}s" repeatCount="indefinite"/><g transform="translate(${x} ${y}) scale(-.75 .75)" stroke="none">${flyWing(.22)}${flyBody}</g></g>`;
  return `<path d="M288 56 Q296 42 316 38 Q360 30 420 28 Q480 26 520 32 Q556 38 566 56z" fill="#8A8C88"/><path d="M300 44 Q340 32 400 30 Q470 26 520 32 Q548 36 556 46 Q520 40 470 40 Q400 40 340 44 Q316 46 300 48z" fill="#9DBF6E"/>`
    + `<path d="M330 46 v8 M372 44 v10 M430 42 v12 M486 42 v12" stroke="#6E716F" stroke-width=".8"/><rect x="452" y="36" width="12" height="6" fill="#F4F1EA"/><path d="M450 36 h16 l-2 -3 h-12z" fill="#5D646C"/>`
    + `<path d="M532 38 L535 12 H543 L546 38z" fill="#FBFAF5"/><rect x="533" y="6" width="12" height="6" fill="#CFE6EE"/><path d="M532 6 Q539 0 546 6z" fill="#2F3438"/><path d="M531 12 h16" stroke="#2F3438" stroke-width="1.4"/>`
    + `<path d="M296 56 q6 -3 12 0 M540 56 q6 -3 12 0" stroke="#F3F7F5" stroke-width="1.2" fill="none"/>`
    + (pf ? [[230, 48, 0], [250, 44, 1], [200, 50, 2], [270, 40, 3], [160, 46, 4]].map(([x, y, k]) => bird(x, y, k)).join("") : "");
}
export const PUFFIN_SIGHT = puffinSight();
