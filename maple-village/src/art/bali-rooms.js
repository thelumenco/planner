// Bali's interiors (round 218): five rooms behind the doors in Seminyak, Ubud and Tegallalang. Tropical and open-air:
// palm thatch and black ijuk roofs on timber posts, open sides with the green (or the sea) showing through, carved and
// gilded wood, woven bamboo, terracotta and stone, frangipani, and little canang sari offerings on every shelf and step.
// The edges full, the middle calm and clear (the playbook); solid furniture sits exactly on BL_OBST (data/bali.js).
//   ba_warung: Made's beach café: the thatch on posts, the sea through the open back, the glass case and the wok,
//              low tables and plastic stools, ceiling fans, the chalkboard menu, coconuts in a crate
//   ba_market: Ubud market: sarongs and batik from the beams, baskets, salak, mangosteen and rambutan, the carvings,
//              incense, and Ibu Sari's mat of palm leaves and petals in the middle
//   ba_silver: Wayan's silversmith's: cool tiles, glass cases of rings and bangles, the carved door, the workbench
//   ba_dance:  the palace dance pavilion: gilded red pillars, the tiered roof, the gamelan down one side, the split gate
//   ba_cacao:  Kadek's bamboo hut on stilts: woven walls, sacks of beans, the roasting pan on the fire, the tasting cups,
//              and the rice terraces going down through the open side
// Spots (data-rdspot, core.js roomSpot): the one thing to tap in each room opens its panel (game/bali.js).
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";

const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const g = s => `<g pointer-events="none">${s}</g>`;
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const exit = (col = "#5A3A2A") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Exit</text></g>`;
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const L = `stroke="#3a2e28" stroke-width=".7"`;
const TEAK = "#7A4A2E", DTEAK = "#5A3420", RED = "#A8322A", GOLD = "#D9A93A", CREAM = "#FFFDF6", LEAF = "#5E8A48", PALM = "#B9C98A",
  BRONZE = "#B8863A", THATCH = "#C9A160", IJUK = "#2F2622", BAMBOO = "#D9BE7A", TERRA = "#C46E48";
const PETALS = ["#FFFDF6", "#D8433A", "#F3C94A", "#3E6BAE", "#E58AB0", "#F09A3A"];

/* ---------- shared bits ---------- */
const txt = (x, y, t, fs = 8, col = CREAM, extra = "") => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Klee One,serif" font-size="${fs}" fill="${col}"${extra}>${t}</text>`;
const signBoard = (x, y, w, t, bg = TEAK, col = "#F3E1A0", fs = 10) => g(sk(`<rect x="${x - w/2}" y="${y - 12}" width="${w}" height="20" rx="3" style="fill:${bg}"/>`, `<rect x="${x - w/2}" y="${y - 12}" width="${w}" height="20" rx="3"/>`) + txt(x, y + 3, t, fs, col, ` font-weight="700" letter-spacing="1"`));
// a frangipani: five cream petals, a yolk-yellow heart
const frangi = (x, y, s = 1, col = CREAM) => [0, 72, 144, 216, 288].map(a => `<ellipse cx="${x}" cy="${y - 3.4*s}" rx="${2.3*s}" ry="${3.6*s}" fill="${col}" stroke="#C9A27E" stroke-width=".4" transform="rotate(${a} ${x} ${y})"/>`).join("") + `<circle cx="${x}" cy="${y}" r="${1.7*s}" fill="#F3C94A"/>`;
// a canang sari: a little palm-leaf tray, petals of the four directions, a frangipani, a stick of incense smoking
const canang = (x, y, s = 1, smoke = true) => `<path d="M${x - 9*s} ${y - 3*s} h${18*s} l${-2*s} ${6*s} h${-14*s}z" fill="${PALM}" stroke="#7FA35A" stroke-width=".7"/>${[-6, -2, 2, 6].map(d => `<path d="M${x + d*s} ${y - 3*s} v${6*s}" stroke="#9AB46A" stroke-width=".5"/>`).join("")}`
  + [[-5, -4, 1], [5, -4, 2], [-2, -6.5, 3], [3, -6.5, 0]].map(([dx, dy, c]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${2.2*s}" fill="${PETALS[c]}"/>`).join("") + frangi(x, y - 6*s, .7*s)
  + (smoke ? `<path d="M${x + 6*s} ${y - 3*s} l${3*s} ${-10*s}" stroke="#8A5A3A" stroke-width=".9"/><circle cx="${x + 9*s}" cy="${y - 13*s}" r=".9" fill="#F09A3A"/><path class="smoke" d="M${x + 9*s} ${y - 14*s} q-3 -5 0 -9 q3 -4 0 -9" fill="none" stroke="#E6E2DA" stroke-width="1" opacity=".8"/>` : "");
// a carved gilded band: a red ground with gold scrolls
const carved = (x, y, w, h, base = RED, gold = GOLD) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${base}" ${L}/>` + Array.from({length: Math.max(1, Math.floor(w/14))}, (_, i) => `<path d="M${x + 3 + i*14} ${y + h*.7} q3 ${-h*.5} 6 0 q2 ${-h*.3} -2 ${-h*.3} M${x + 9 + i*14} ${y + h*.3} q2 ${h*.4} 5 ${h*.4}" fill="none" stroke="${gold}" stroke-width="1.1"/>`).join("") + `<path d="M${x} ${y + 1.2} h${w} M${x} ${y + h - 1.2} h${w}" stroke="${gold}" stroke-width="1.4"/>`;
// a gilded carved red pillar, from y0 to y1
const pillar = (x, y0, y1, w = 16) => `<rect x="${x - w/2}" y="${y0}" width="${w}" height="${y1 - y0}" fill="${RED}" ${L}/><path d="M${x - w/2 + 3} ${y0} V${y1} " stroke="#C8483A" stroke-width="2.4" opacity=".7"/>`
  + carved(x - w/2 - 3, y0, w + 6, 14) + carved(x - w/2 - 3, y1 - 16, w + 6, 16) + Array.from({length: Math.floor((y1 - y0 - 40)/36)}, (_, i) => `<path d="M${x - w/2 + 2} ${y0 + 34 + i*36} q${w/2 - 2} 8 ${w - 4} 0 M${x} ${y0 + 30 + i*36} v12" stroke="${GOLD}" stroke-width="1.2" fill="none"/>`).join("");
// palm thatch: the eaves band, its ragged fringe along the bottom
const thatch = (y0, y1, col = THATCH, dark = "#8A6A3A") => `<rect y="${y0}" width="520" height="${y1 - y0}" fill="${col}"/>` + Array.from({length: 90}, (_, i) => `<path d="M${(i*5.9 + rnd(i)*4).toFixed(1)} ${y0} l${(rnd(i + 9)*6 - 3).toFixed(1)} ${y1 - y0}" stroke="${dark}" stroke-width="1" opacity=".45"/>`).join("")
  + `<path d="M0 ${y1 - 2}${Array.from({length: 52}, (_, i) => ` l5 ${(5 + rnd(i + 30)*6).toFixed(1)} l5 ${-(5 + rnd(i + 30)*6).toFixed(1)}`).join("")} V${y1 - 4} H0z" fill="${col}"/>` + `<path d="M0 ${y0 + (y1 - y0)*.45} H520" stroke="${dark}" stroke-width="1.4" opacity=".5"/>`;
// a ceiling fan on its rod (the blades turning slowly)
const fan = (x, y) => g(`<path d="M${x} 0 V${y}" stroke="#4A3C30" stroke-width="2"/><g class="tlspin">${[0, 90, 180, 270].map(a => `<ellipse cx="${x + 18}" cy="${y}" rx="17" ry="3.6" fill="#8A5A3A" ${L} transform="rotate(${a} ${x} ${y})"/>`).join("")}</g><ellipse cx="${x}" cy="${y}" rx="6" ry="4.5" fill="#E6E2DA" ${L}/>`);
// a woven bamboo lampshade hanging on a cord
const bambooLamp = (x, y, glow = 30) => lampGlow(x, y + 8, glow) + g(`<path d="M${x} 0 V${y - 8}" stroke="#4A3C30" stroke-width="1"/><path d="M${x - 13} ${y + 6} q0 -15 13 -15 q13 0 13 15z" fill="#D9BE7A" ${L}/>${[-8, -3, 2, 7].map(d => `<path d="M${x + d} ${y + 6} q0 -9 ${-d*.3 + 1} -14" stroke="#A8864A" stroke-width=".7" fill="none"/>`).join("")}<path d="M${x - 13} ${y + 6} h26" stroke="#A8864A" stroke-width="1.6"/><circle cx="${x}" cy="${y + 8}" r="3" fill="#FFF3C4"/>`);
// a basket: woven, with a rim
const basket = (x, y, w, h, col = "#C9A27E") => `<path d="M${x} ${y} h${w} l${-w*.08} ${h} h${-w*.84}z" fill="${col}" ${L}/>${Array.from({length: Math.floor(w/5)}, (_, i) => `<path d="M${x + 3 + i*5} ${y} l${(i - w/10)*.25} ${h}" stroke="#8A6A52" stroke-width=".6"/>`).join("")}${Array.from({length: Math.floor(h/4)}, (_, i) => `<path d="M${x + 1 + i*.3} ${y + 3 + i*4} h${w - 2 - i*.6}" stroke="#A8864A" stroke-width=".6"/>`).join("")}<rect x="${x - 1.5}" y="${y - 2.5}" width="${w + 3}" height="4" rx="2" fill="#A8864A" ${L}/>`;
// a hanging batik cloth: a ground, a pattern (dots, waves or kawung flowers), a fringe
const batik = (x, y, w, h, bg, fg, k = 0) => {
  const pat = k % 3 === 0 ? Array.from({length: Math.floor(h/10)*Math.floor(w/10)}, (_, i) => `<circle cx="${x + 5 + (i % Math.floor(w/10))*10}" cy="${y + 7 + Math.floor(i/Math.floor(w/10))*10}" r="2" fill="${fg}"/>`).join("")
    : k % 3 === 1 ? Array.from({length: Math.floor(h/9)}, (_, i) => `<path d="M${x} ${y + 8 + i*9} q${w/8} -5 ${w/4} 0 t${w/4} 0 t${w/4} 0 t${w/4} 0" fill="none" stroke="${fg}" stroke-width="1.6"/>`).join("")
    : Array.from({length: Math.floor(h/14)*Math.floor(w/14)}, (_, i) => { const cx = x + 7 + (i % Math.floor(w/14))*14, cy = y + 8 + Math.floor(i/Math.floor(w/14))*14; return `<ellipse cx="${cx}" cy="${cy - 3}" rx="2" ry="3" fill="${fg}"/><ellipse cx="${cx}" cy="${cy + 3}" rx="2" ry="3" fill="${fg}"/><ellipse cx="${cx - 3}" cy="${cy}" rx="3" ry="2" fill="${fg}"/><ellipse cx="${cx + 3}" cy="${cy}" rx="3" ry="2" fill="${fg}"/>`; }).join("");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}" ${L}/>${pat}<path d="M${x} ${y + h}${Array.from({length: Math.floor(w/3)}, () => ` v4 m3 -4`).join("")}" stroke="${bg}" stroke-width="1.2"/>`;
};
// fruit: salak (scaly brown), mangosteen (purple, green cap), rambutan (red, hairy), a hand of bananas
const salak = (x, y) => `<path d="M${x} ${y - 7} q6 3 5 8 q-1 4 -5 4 q-4 0 -5 -4 q-1 -5 5 -8z" fill="#6B3A2A" ${L}/><path d="M${x - 3} ${y - 2} l1.5 1.5 l1.5 -1.5 l1.5 1.5 l1.5 -1.5 M${x - 3} ${y + 1.5} l1.5 1.5 l1.5 -1.5 l1.5 1.5 l1.5 -1.5" stroke="#3A2018" stroke-width=".5" fill="none"/>`;
const mangosteen = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#5A2440" ${L}/><path d="M${x - 3} ${y - 4.6} l3 -2 l3 2 l-1 1.6 h-4z" fill="#5E8A48"/><circle cx="${x - 1.6}" cy="${y - 1}" r="1.2" fill="#8A4A6A" opacity=".7"/>`;
const rambutan = (x, y) => `<circle cx="${x}" cy="${y}" r="4.6" fill="#D8433A" ${L}/>${Array.from({length: 9}, (_, i) => { const a = i/9*Math.PI*2; return `<path d="M${x + Math.cos(a)*4.4} ${y + Math.sin(a)*4.4} l${Math.cos(a + .5)*2.6} ${Math.sin(a + .5)*2.6}" stroke="${i % 2 ? "#7FA35A" : "#D8433A"}" stroke-width=".9"/>`; }).join("")}`;
const bananas = (x, y, s = 1) => [0, 1, 2, 3].map(i => `<path d="M${x - 8*s + i*4*s} ${y} q${-2*s} ${-12*s} ${6*s} ${-18*s}" fill="none" stroke="#E8C23A" stroke-width="${3.4*s}" stroke-linecap="round"/>`).join("") + `<path d="M${x} ${y - 18*s} v${-6*s}" stroke="#6E5A3A" stroke-width="${2*s}"/>`;
// a green coconut (a straw in it, for es kelapa)
const coconut = (x, y, r = 8, straw = false) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#7FA35A" ${L}/><path d="M${x - r*.5} ${y - r*.5} q${r*.3} ${-r*.3} ${r*.7} ${-r*.2}" stroke="#A8C47A" stroke-width="1.4" fill="none"/>` + (straw ? `<ellipse cx="${x}" cy="${y - r*.7}" rx="${r*.4}" ry="${r*.18}" fill="${CREAM}"/><path d="M${x + 1} ${y - r*.7} l${r*.6} ${-r*1.4} l3 -1" stroke="#E58AB0" stroke-width="1.6" fill="none"/>` : "");
// a plastic stool, seen from the front
const stool = (x, y, col) => `<path d="M${x - 8} ${y - 12} h16 l2 12 h-3 l-1 -6 h-10 l-1 6 h-3z" fill="${col}" ${L}/><ellipse cx="${x}" cy="${y - 12}" rx="9" ry="2.6" fill="${col}" ${L}/>`;
// a potted frangipani in a terracotta pot
const frangiPot = (x, y, s = 1) => g(`<path d="M${x - 12*s} ${y - 20*s} h${24*s} l${-3*s} ${20*s} h${-18*s}z" fill="${TERRA}" ${L}/><path d="M${x - 13*s} ${y - 20*s} h${26*s}" stroke="#9E5A3A" stroke-width="${3*s}"/><path d="M${x} ${y - 20*s} q-2 ${-16*s} ${-10*s} ${-26*s} M${x} ${y - 22*s} q${4*s} ${-14*s} ${12*s} ${-22*s}" stroke="#9A8270" stroke-width="${2.4*s}" fill="none"/>`
  + [[-14, -48, 0], [-4, -54, 1], [10, -50, 2], [16, -42, 3], [-10, -38, 4]].map(([dx, dy, k]) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${8*s}" ry="${3.4*s}" fill="${k % 2 ? "#5E8A48" : "#6E9A52"}" transform="rotate(${(k*37) % 70 - 35} ${x + dx*s} ${y + dy*s})"/>`).join("")
  + [[-10, -54], [2, -58], [12, -54], [-2, -48]].map(([dx, dy]) => frangi(x + dx*s, y + dy*s, .9*s)).join(""));
// a palm tree for the views: a curved trunk and a crown of fronds
const palm = (x, y, s = 1, lean = 1) => `<path d="M${x} ${y} q${6*s*lean} ${-24*s} ${2*s*lean} ${-48*s}" fill="none" stroke="#7A5E44" stroke-width="${3.2*s}"/>` + [-150, -115, -80, -45, -10, 25].map(a => { const r = a*Math.PI/180, tx = x + 2*s*lean, ty = y - 48*s; return `<path d="M${tx} ${ty} q${Math.cos(r)*12*s} ${Math.sin(r)*12*s - 6*s} ${Math.cos(r)*22*s} ${Math.sin(r)*22*s + 4*s}" fill="none" stroke="#4E7A40" stroke-width="${2.6*s}" stroke-linecap="round"/>`; }).join("") + `<circle cx="${x + 2*s*lean}" cy="${y - 47*s}" r="${2.2*s}" fill="#6E5A3A"/>`;

/* ---------- through the open sides ---------- */
let clipN = 0;
const VIEWS = {
  // Seminyak: a warm sky, the sea glittering, a jukung outrigger with a striped sail, the sand, a leaning palm
  sea: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#CFE8EE"/><rect x="${x}" y="${y}" width="${w}" height="${h*.22}" fill="#BFE0EC"/><ellipse cx="${x + w*.7}" cy="${y + h*.2}" rx="${w*.12}" ry="${h*.06}" fill="#FFFFFF" opacity=".8"/>`
    + `<rect x="${x}" y="${y + h*.52}" width="${w}" height="${h*.48}" fill="#3E9AB0"/><rect x="${x}" y="${y + h*.52}" width="${w}" height="${h*.08}" fill="#5FB4C4"/>${Array.from({length: 8}, (_, i) => `<path d="M${x + rnd(i + x)*w} ${y + h*(.62 + rnd(i + 7)*.22)} q5 -2 10 0" stroke="#A8DCE4" stroke-width="1.2" fill="none"/>`).join("")}`
    + `<g transform="translate(${x + w*.3} ${y + h*.66})"><path d="M-16 0 q16 6 32 0 l-3 4 q-13 4 -26 0z" fill="${CREAM}" ${L}/><path d="M-12 1 h24" stroke="${RED}" stroke-width="1.2"/><path d="M-20 6 q20 3 40 0 M-10 0 l-6 6 M10 0 l6 6" stroke="#5A3E2A" stroke-width=".9" fill="none"/><path d="M0 0 V-22 L14 -4z" fill="#F3C94A" ${L}/><path d="M0 -15 l9 10" stroke="${RED}" stroke-width="2"/></g>`
    + `<path d="M${x} ${y + h*.88} q${w*.5} ${-h*.06} ${w} ${h*.02} V${y + h} H${x}z" fill="#EAD7A8"/>`,
  // the courtyard: green lawn, the red-brick palace wall, the carved split gate (candi bentar) in the middle, frangipani trees
  court: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#D6ECEE"/><rect x="${x}" y="${y + h*.56}" width="${w}" height="${h*.2}" fill="#B8604A"/>${Array.from({length: 6}, (_, r) => `<path d="M${x} ${y + h*.56 + r*h*.034} H${x + w}" stroke="#9A4A38" stroke-width=".6"/>`).join("")}<rect x="${x}" y="${y + h*.76}" width="${w}" height="${h*.24}" fill="#8FB070"/>`
    + [-1, 1].map(sd => { const ix = x + w/2 + sd*w*.035, W = w*.13, b = y + h*.84, t = [.56, .4, .26, .14, .04].map(f => y + h*f), st = [1, .84, .64, .44, .24];
      const d = `M${ix} ${b} H${ix + sd*W}` + t.map((ty, i) => ` V${ty} H${ix + sd*W*(st[i + 1] ?? 0)}`).join("") + ` V${t[4]}z`;
      return `<path d="${d}" fill="#B8604A" ${L}/>` + t.slice(0, 4).map((ty, i) => `<path d="M${ix} ${ty + 2} h${sd*W*st[i + 1]}" stroke="#E6D6B8" stroke-width="2.4"/>`).join("") + `<path d="M${ix} ${y + h*.7} h${sd*W*.9}" stroke="#E6D6B8" stroke-width="2.4"/><path d="M${ix + sd*W*.3} ${y + h*.62} q${sd*W*.2} -8 ${sd*W*.4} 0" stroke="#E6D6B8" stroke-width="1.4" fill="none"/>`; }).join("")
    + `<path d="M${x + w/2 - w*.1} ${y + h*.82} h${w*.2} l6 ${h*.1} h${-w*.2 - 12}z" fill="#C9C0B0" ${L}/>`
    + [.12, .88].map(f => `<path d="M${x + w*f} ${y + h*.9} q-2 ${-h*.2} -8 ${-h*.3} M${x + w*f} ${y + h*.8} q4 ${-h*.14} 10 ${-h*.22}" stroke="#8A7A6A" stroke-width="2.4" fill="none"/><ellipse cx="${x + w*f - 4}" cy="${y + h*.5}" rx="${w*.09}" ry="${h*.1}" fill="#6E9A52"/>${[[-10, -6], [0, -10], [8, -4], [-2, 2]].map(([dx, dy]) => frangi(x + w*f + dx, y + h*.5 + dy, .7)).join("")}`).join("")
    ,
  // Tegallalang: terraces going down in green steps, water glinting in the channels, palms on the ridges, Agung far off
  terraces: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#D6ECEE"/><path d="M${x + w*.45} ${y + h*.3} l${w*.18} ${-h*.18} q${w*.03} -3 ${w*.06} 0 l${w*.2} ${h*.18}z" fill="#9AAAB8"/><path d="M${x + w*.6} ${y + h*.13} q${w*.03} -3 ${w*.06} 0 l${w*.03} ${h*.03} l${-w*.06} ${h*.02}z" fill="#E6EEF2"/>`
    + `<path d="M${x} ${y + h*.36} q${w*.25} ${-h*.12} ${w*.5} ${-h*.04} t${w*.5} ${-h*.02} V${y + h} H${x}z" fill="#7FA35A"/>`
    + Array.from({length: 8}, (_, i) => { const yy = y + h*(.36 + i*.085), c = ["#8FB86A", "#A8C878", "#7FA85A", "#B9D488"][i % 4]; return `<path d="M${x - 10} ${yy + 6} q${w*.3} ${-h*.06 + i} ${w*.6} ${-h*.01} t${w*.5} ${h*.02} V${y + h} H${x - 10}z" fill="${c}"/><path d="M${x - 10} ${yy + 6} q${w*.3} ${-h*.06 + i} ${w*.6} ${-h*.01} t${w*.5} ${h*.02}" fill="none" stroke="#D6ECE4" stroke-width="1.2" opacity=".8"/><path d="M${x - 10} ${yy + 8} q${w*.3} ${-h*.06 + i} ${w*.6} ${-h*.01} t${w*.5} ${h*.02}" fill="none" stroke="#5E8A48" stroke-width="1" opacity=".6"/>`; }).join("")
    + palm(x + w*.16, y + h*.5, .7, 1) + palm(x + w*.24, y + h*.46, .6, -1) + palm(x + w*.82, y + h*.56, .8, -1) + palm(x + w*.56, y + h*.42, .5, 1),
  // the garden at the back of the silversmith's: banana leaves and a palm
  garden: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#D6ECEE"/><ellipse cx="${x + w*.3}" cy="${y + h*.9}" rx="${w*.5}" ry="${h*.5}" fill="#6E9A52"/><ellipse cx="${x + w*.85}" cy="${y + h*.95}" rx="${w*.4}" ry="${h*.45}" fill="#5E8A48"/>`
    + palm(x + w*.66, y + h*.95, .9, -1) + [[.16, .5, -30], [.3, .44, 20], [.12, .66, -60]].map(([fx, fy, a]) => `<ellipse cx="${x + w*fx}" cy="${y + h*fy}" rx="${w*.14}" ry="${h*.07}" fill="#7FA85A" transform="rotate(${a} ${x + w*fx} ${y + h*fy})"/><path d="M${x + w*fx - w*.12} ${y + h*fy} h${w*.24}" stroke="#A8C878" stroke-width="1" transform="rotate(${a} ${x + w*fx} ${y + h*fy})"/>`).join("")
};
const view = (x, y, w, h, kind) => { const id = `blrv${clipN++}`; return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${VIEWS[kind](x, y, w, h)}</g>`; };

/* ---------- floors ---------- */
const terraF = (y0, a = "#C8784E", b = "#BD6C44", line = "#9E5A3A") => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${a}"/>${Array.from({length: 12}, (_, r) => Array.from({length: 13}, (_, c) => (r + c) % 2 ? `<rect x="${c*40}" y="${y0 + r*40}" width="40" height="40" style="fill:${b}"/>` : "").join("")).join("")}${Array.from({length: 12}, (_, r) => `<path d="M0 ${y0 + r*40} H520" style="stroke:${line}" stroke-width="1.6"/>`).join("")}${Array.from({length: 13}, (_, c) => `<path d="M${c*40} ${y0} V640" style="stroke:${line}" stroke-width="1.6"/>`).join("")}`;
const tilesF = (y0, a, b, line) => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${a}"/>${Array.from({length: 11}, (_, r) => Array.from({length: 13}, (_, c) => (r + c) % 2 ? `<rect x="${c*40}" y="${y0 + r*40}" width="40" height="40" style="fill:${b}"/>` : "").join("")).join("")}${Array.from({length: 12}, (_, r) => `<path d="M0 ${y0 + r*40} H520" style="stroke:${line}" stroke-width="1.2"/>`).join("")}${Array.from({length: 13}, (_, c) => `<path d="M${c*40} ${y0} V640" style="stroke:${line}" stroke-width="1.2"/>`).join("")}`;
const flagsF = (y0, col, line, n = 9) => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${col}"/>${Array.from({length: 48}, (_, i) => `<rect x="${(i % 8)*80 + (Math.floor(i/8) % 2)*40 - 40}" y="${y0 + Math.floor(i/8)*74}" width="78" height="72" rx="5" style="fill:none;stroke:${line}" stroke-width="2"/>`).join("")}${Array.from({length: n}, (_, i) => `<ellipse cx="${40 + rnd(i + 5)*440}" cy="${y0 + 60 + rnd(i + 15)*360}" rx="${22 + rnd(i)*26}" ry="${3 + rnd(i + 2)*3}" style="fill:#FFFFFF" opacity=".12"/>`).join("")}`;
// split bamboo laid crossways, the nodes showing
const bambooF = y0 => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:#D2B676"/>${Array.from({length: 30}, (_, r) => `<rect y="${y0 + r*15}" width="520" height="13" style="fill:${["#D9BE7A", "#CDB070", "#D4B874"][r % 3]}"/><path d="M0 ${y0 + r*15 + 13.5} H520" style="stroke:#9A7E4A" stroke-width="2"/><path d="M0 ${y0 + r*15 + 3} H520" style="stroke:#E8D49A" stroke-width="1" opacity=".7"/>${[0, 1, 2, 3].map(k => `<path d="M${(r*113 + k*139) % 520} ${y0 + r*15} v13" style="stroke:#A8884E" stroke-width="2"/>`).join("")}`).join("")}`;
// a sunbeam across the floor from the open side
const sun = (pts, op = .1) => g(`<path d="${pts}" fill="#FFE7A8" opacity="${op}"/>`);
// woven bamboo matting (anyaman), the checker of a hut wall
const woven = (x, y, w, h, a = "#D9BE7A", b = "#B99A5A") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${a}"/>${Array.from({length: Math.ceil(h/8)*Math.ceil(w/8)}, (_, i) => { const c = i % Math.ceil(w/8), r = Math.floor(i/Math.ceil(w/8)); return (r + Math.floor(c/2)) % 2 ? `<rect x="${x + c*8}" y="${y + r*8}" width="8" height="8" fill="${b}" opacity=".55"/>` : ""; }).join("")}`;

/* ---------- the warung (Seminyak) ---------- */
function warungRoom(){
  const posts = [6, 176, 346, 514];
  const wall = g(`<rect width="520" height="200" fill="#E8D8B8"/>` + view(0, 40, 520, 140, "sea")
      // the low wall of whitewashed stone at the back, and the posts holding up the thatch
      + sk(`<rect y="168" width="520" height="32" style="fill:#EDE4D2"/><rect y="164" width="520" height="6" style="fill:#C9B89A"/>`, `<path d="M0 168 H520"/>`) + `<path d="M0 186 H520" stroke="#3E9AB0" stroke-width="3" opacity=".55"/>`
      + posts.map(x => `<rect x="${x - 6}" y="30" width="12" height="170" fill="#8A6A4A" ${L}/><path d="M${x - 3} 30 V200" stroke="#A8865E" stroke-width="2"/>${[60, 110, 150].map(y => `<path d="M${x - 6} ${y} h12" stroke="#6E5236" stroke-width="2"/>`).join("")}`).join("")
      + thatch(0, 42))
    + signBoard(262, 26, 128, "WARUNG MADE", "#3E6BAE", "#F3E1A0")
    // the chalkboard menu on its easel against the left posts
    + g(sk(`<rect x="22" y="56" width="140" height="100" rx="3" style="fill:#2F3A34"/>`, `<rect x="22" y="56" width="140" height="100" rx="3"/>`) + `<rect x="18" y="52" width="148" height="108" rx="4" fill="none" stroke="#A8865E" stroke-width="5"/>`
      + txt(92, 74, "MENU", 11, "#F3E1A0", ` font-weight="700" letter-spacing="2"`) + [["NASI GORENG", "#FFFDF6"], ["MIE GORENG", "#F4C7CF"], ["ES KELAPA", "#BFE3DA"]].map(([t, c], i) => txt(92, 96 + i*18, `· ${t} ·`, 10, c, ` font-weight="700"`)).join("")
      + frangi(146, 64, .9) + `<path d="M40 148 q8 -4 14 0 q6 4 12 0" stroke="#F3E1A0" stroke-width="1" fill="none"/>`)
    // the fans and a bamboo lamp
    + fan(232, 56) + fan(400, 52) + bambooLamp(318, 70, 30)
    // behind the counter: the shelf of kecap and sambal bottles, plates, a hand of bananas hanging from the post
    + g(sk(`<rect x="352" y="146" width="156" height="6" style="fill:#6E5236"/>`, `<rect x="352" y="146" width="156" height="6"/>`)
      + Array.from({length: 7}, (_, i) => `<rect x="${360 + i*13}" y="${124 + (i % 2)*4}" width="9" height="${22 - (i % 2)*4}" rx="2" fill="${["#3A2A20", RED, "#3A2A20", "#F3C94A", "#3A2A20", "#D8433A", "#5E8A48"][i]}" ${L}/><rect x="${360 + i*13}" y="${132 + (i % 2)*2}" width="9" height="5" fill="${CREAM}" opacity=".8"/>`).join("")
      + [0, 1, 2, 3, 4].map(i => `<ellipse cx="${470}" cy="${144 - i*3.4}" rx="16" ry="3" fill="${i % 2 ? "#E6E2DA" : CREAM}" ${L}/>`).join("") + bananas(346, 108, .9) + canang(492, 140, .8, false))
    // coconuts piled in a wooden crate at the back, a cool box of drinks
    + g(sk(`<rect x="34" y="208" width="84" height="36" style="fill:#A87A4E"/><path d="M34 220 h84 M34 232 h84" style="stroke:#7A5236" stroke-width="1.6"/>`, `<rect x="34" y="208" width="84" height="36"/>`)
      + [[46, 204], [62, 202], [78, 205], [94, 202], [108, 205], [54, 194], [72, 192], [90, 194]].map(([x, y], i) => coconut(x, y, 8, i === 6)).join("") + txt(76, 241, "KELAPA", 7, "#F3E1A0", ` font-weight="700"`))
    + g(sk(`<rect x="134" y="214" width="56" height="32" rx="4" style="fill:#3E6BAE"/><rect x="132" y="208" width="60" height="9" rx="3" style="fill:#F3F1EA"/>`, `<rect x="134" y="214" width="56" height="32" rx="4"/>`) + txt(162, 234, "ES", 9, CREAM, ` font-weight="700"`))
    + g(canang(222, 236, 1));
  // the counter: bamboo-clad, the glass case of rice and curries, a jar of krupuk, the wok on its burner
  const ctr = spot("ba_warung", 330, 322, "Order at the counter", hovE(330, 322, 44, 11),
    sk(`<rect x="300" y="248" width="190" height="52" style="fill:#C9A86A"/><rect x="296" y="236" width="198" height="14" rx="3" style="fill:#8A5A3A"/>`, `<rect x="300" y="248" width="190" height="52"/><rect x="296" y="236" width="198" height="14" rx="3"/>`)
    + g(Array.from({length: 19}, (_, i) => `<path d="M${305 + i*10} 250 V300" stroke="#A8864A" stroke-width="1.6"/>${[262, 286].map(y => `<path d="M${301 + i*10} ${y + (i % 2)*4} h8" stroke="#8A6A3A" stroke-width="1"/>`).join("")}`).join("")
      + txt(395, 278, "NASI · MIE · ES", 9, "#5A3A2A", ` font-weight="700"`)
      // the glass case
      + `<rect x="306" y="196" width="104" height="42" rx="2" fill="#E6F2F2" opacity=".55" ${L}/><path d="M306 216 h104" stroke="#9AB8BE"/><rect x="304" y="192" width="108" height="5" rx="1" fill="#C9A86A" ${L}/>`
      + [[318, 210, CREAM], [340, 210, "#8A4A2A"], [362, 210, "#E8B83A"], [386, 210, "#5E8A48"], [318, 232, "#C9783A"], [342, 232, "#F3E1A0"], [366, 232, "#D8433A"], [392, 232, "#8A5A3A"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="4" fill="#EDE8DE" ${L}/><ellipse cx="${x}" cy="${y - 2}" rx="7" ry="3.4" fill="${c}"/>`).join("")
      // krupuk in a tall tin, stacked bowls
      + `<rect x="414" y="204" width="20" height="34" rx="2" fill="#D6EEF0" opacity=".8" ${L}/>${[0, 1, 2, 3].map(i => `<ellipse cx="424" cy="${212 + i*7}" rx="7" ry="3" fill="#F6E8C8"/>`).join("")}<rect x="413" y="200" width="22" height="5" rx="1" fill="${RED}" ${L}/>`
      // the burner and the wok, a flame under it, steam
      + `<rect x="442" y="222" width="42" height="16" rx="2" fill="#5A6066" ${L}/><path class="flame" d="M455 222 q4 -8 8 0 q4 -9 8 0" fill="#3E7FB8"/><path class="flame" d="M458 222 q3 -5 5 0 q3 -6 5 0" fill="#F09A3A"/><path d="M440 214 q23 16 46 0z" fill="#2F2B28" ${L}/><path d="M484 212 l12 -6" stroke="#2F2B28" stroke-width="3"/><path d="M448 213 q14 4 28 0" stroke="#E8B83A" stroke-width="3"/><path d="M452 212 q4 -2 8 0 M462 212 q4 -2 8 0" stroke="#D8433A" stroke-width="1.4" fill="none"/>`
      + `<g class="steam"><circle cx="458" cy="200" r="5" fill="#FFFFFF" opacity=".7"/><circle cx="468" cy="190" r="6" fill="#FFFFFF" opacity=".55"/><circle cx="462" cy="180" r="5" fill="#FFFFFF" opacity=".4"/></g>` + canang(306, 240, .7, false))
    + lab(318, 346, "Order at the counter", "#F3E1A0", 10));
  // four low tables of rough teak, a plastic stool at each end, a plate and an es kelapa on top
  const table = ([x, y], i) => g(stool(x + 6, y + 30, ["#D8433A", "#3E6BAE", "#5E8A48", "#F3C94A"][i]) + stool(x + 54, y + 30, ["#3E6BAE", "#F3C94A", "#D8433A", "#5E8A48"][i])
    + sk(`<rect x="${x + 14}" y="${y + 6}" width="32" height="24" style="fill:#7A4A2E"/><rect x="${x + 10}" y="${y}" width="40" height="9" rx="2" style="fill:#A87448"/>`, `<rect x="${x + 10}" y="${y}" width="40" height="9" rx="2"/><path d="M${x + 16} ${y + 9} V${y + 30} M${x + 44} ${y + 9} V${y + 30}"/>`)
    + `<ellipse cx="${x + 22}" cy="${y + 1}" rx="7" ry="2.4" fill="${CREAM}" ${L}/><ellipse cx="${x + 22}" cy="${y}" rx="4" ry="1.6" fill="#E8B83A"/>` + coconut(x + 38, y - 4, 6, true));
  const tables = [[80, 340], [380, 340], [80, 480], [380, 480]].map(table).join("");
  // at the edges: the open sides' posts, surfboards leaning by the right, potted frangipani, the sand at the step
  const edges = g(`<rect x="0" y="200" width="12" height="440" fill="#8A6A4A" ${L}/><rect x="508" y="200" width="12" height="440" fill="#8A6A4A" ${L}/>`
      + [[496, 330, "#F3C94A"], [504, 350, "#3E9AB0"]].map(([x, y, c]) => `<path d="M${x} ${y} q8 50 0 120 q-8 -60 0 -120z" fill="${c}" ${L}/><path d="M${x} ${y + 8} V${y + 112}" stroke="${CREAM}" stroke-width="1"/>`).join("")
      + `<path d="M0 604 q130 -10 214 0 M306 604 q110 -10 214 0" stroke="#EAD7A8" stroke-width="10" opacity=".7" fill="none"/>`)
    + frangiPot(30, 632, .9) + frangiPot(486, 632, .9) + g(canang(168, 600, .9) + canang(352, 600, .9));
  return g(terraF(200) + sun("M0 200 H520 L470 640 H60z", .08)) + wall + edges + tables + ctr + exit("#3E6BAE");
}

/* ---------- Ubud market ---------- */
function marketRoom(){
  const wall = g(`<rect width="520" height="200" fill="#A8865E"/>` + view(0, 30, 520, 120, "court")
      // the carved timber frame of the market hall: the black ijuk roof, the beam, posts
      + `<rect width="520" height="30" fill="${IJUK}"/>${Array.from({length: 60}, (_, i) => `<path d="M${i*9} 0 l3 30" stroke="#4A3C34" stroke-width="1.4"/>`).join("")}` + carved(0, 30, 520, 12, TEAK, GOLD)
      + [8, 182, 338, 512].map(x => `<rect x="${x - 7}" y="42" width="14" height="158" fill="${TEAK}" ${L}/>`).join("")
      + `<rect y="150" width="520" height="50" fill="#8A6A4A"/><rect y="146" width="520" height="6" fill="${DTEAK}"/>`)
    // sarongs and batik hung from the beam
    + g([[18, "#3E6BAE", "#F3D34A", 0], [52, "#8A3A2A", "#F3E1B0", 2], [86, "#2F5A4A", "#F3C94A", 1], [120, "#C8432F", "#FFFDF6", 0], [152, "#5A3A6A", "#E8C08A", 2]].map(([x, bg, fg, k]) => `<path d="M${x} 44 h28" stroke="${DTEAK}" stroke-width="2"/>` + batik(x, 46, 28, 92 - (k*7) % 20, bg, fg, k)).join("")
      + [[350, "#E58AB0", "#FFFDF6", 1], [382, "#3E6BAE", "#FFFDF6", 2], [414, "#F09A3A", "#8A3A2A", 0], [446, "#2F5A4A", "#F3E1B0", 2], [478, "#D8433A", "#F3D34A", 1]].map(([x, bg, fg, k]) => `<path d="M${x} 44 h28" stroke="${DTEAK}" stroke-width="2"/>` + batik(x, 46, 28, 86 - (k*5) % 16, bg, fg, k)).join(""))
    // in the middle: the market's little shrine shelf, an offering, incense, the sign
    + signBoard(260, 62, 116, "PASAR UBUD", TEAK, "#F3E1A0")
    + g(sk(`<rect x="214" y="96" width="92" height="6" style="fill:${DTEAK}"/><path d="M222 96 v-14 h76 v14" style="fill:#8A3A2A"/>`, `<rect x="214" y="96" width="92" height="6"/>`) + carved(220, 80, 80, 8) + canang(236, 94, 1) + canang(284, 94, 1) + `<rect x="252" y="84" width="16" height="12" rx="2" fill="${GOLD}" ${L}/>` + frangi(260, 82, 1.1))
    // the stall backs: folded sarongs, baskets stacked, wooden masks on the right
    + g(Array.from({length: 6}, (_, i) => `<rect x="${12 + i*26}" y="${168 - (i % 2)*4}" width="22" height="${28 + (i % 2)*4}" fill="${["#3E6BAE", "#C8432F", "#F3C94A", "#2F5A4A", "#E58AB0", "#8A3A2A"][i]}" ${L}/>${[0, 1, 2].map(k => `<path d="M${12 + i*26} ${174 + k*8} h22" stroke="${CREAM}" stroke-width=".8" opacity=".6"/>`).join("")}`).join("")
      + basket(196, 172, 30, 24) + basket(234, 176, 24, 20, "#D9BE7A") + basket(264, 170, 30, 26, "#B99A6A") + basket(300, 176, 24, 20)
      + [[356, "#8A5A3A"], [392, "#C8432F"], [428, "#F3E1B0"], [464, "#5A3A2A"]].map(([x, c]) => `<path d="M${x} 158 q14 -4 28 0 v18 q-14 16 -28 0z" fill="${c}" ${L}/><circle cx="${x + 9}" cy="166" r="2.4" fill="${CREAM}"/><circle cx="${x + 19}" cy="166" r="2.4" fill="${CREAM}"/><circle cx="${x + 9}" cy="166" r="1" fill="${IJUK}"/><circle cx="${x + 19}" cy="166" r="1" fill="${IJUK}"/><path d="M${x + 8} 178 q6 4 12 0" stroke="${IJUK}" fill="none"/>`).join(""))
    // produce on the ground at the back: baskets of chillies and shallots, bananas
    + g(basket(150, 222, 34, 22, "#C9A27E") + Array.from({length: 7}, (_, i) => `<path d="M${154 + i*4} ${220 - (i % 2)*2} q2 -6 6 -8" stroke="#D8433A" stroke-width="2.6" stroke-linecap="round" fill="none"/>`).join("")
      + basket(334, 222, 34, 22, "#D9BE7A") + Array.from({length: 7}, (_, i) => `<ellipse cx="${340 + i*4}" cy="${220 - (i % 2)*3}" rx="3.4" ry="3" fill="#B8604A" ${L}/>`).join("") + bananas(200, 246, 1) + bananas(318, 246, .9) + canang(260, 240, 1));
  // the four stall tables: fruit; carvings; baskets; incense, magnets and folded sarongs
  const tableTop = (x, y, w, cloth) => sk(`<rect x="${x + 4}" y="${y + 10}" width="${w - 8}" height="40" style="fill:${DTEAK}"/><rect x="${x}" y="${y}" width="${w}" height="14" rx="2" style="fill:${cloth}"/>`, `<rect x="${x}" y="${y}" width="${w}" height="14" rx="2"/><path d="M${x + 6} ${y + 14} V${y + 50} M${x + w - 6} ${y + 14} V${y + 50}"/>`) + `<path d="M${x} ${y + 12}${Array.from({length: Math.floor(w/6)}, () => ` l3 4 l3 -4`).join("")}" fill="${cloth}" stroke="#3a2e28" stroke-width=".5"/>`;
  const fruit = g(tableTop(30, 250, 100, "#3E6BAE") + basket(36, 236, 28, 14, "#C9A27E") + basket(68, 234, 28, 16, "#D9BE7A") + basket(100, 236, 26, 14, "#C9A27E")
    + [[40, 232], [48, 230], [56, 232], [44, 226], [52, 225]].map(([x, y]) => salak(x, y)).join("") + [[74, 230], [82, 228], [90, 230], [78, 223], [86, 222]].map(([x, y]) => mangosteen(x, y)).join("") + [[106, 232], [114, 230], [120, 233], [110, 224], [118, 225]].map(([x, y]) => rambutan(x, y)).join("")
    + [["SALAK", 50], ["MANGGIS", 82], ["RAMBUTAN", 113]].map(([t, x]) => `<rect x="${x - 15}" y="254" width="30" height="8" fill="${CREAM}" ${L}/>` + txt(x, 260.5, t, 5.5, "#3B3530", ` font-weight="700"`)).join(""));
  const animal = (x, y, k) => k === 0 ? `<ellipse cx="${x}" cy="${y - 5}" rx="8" ry="5.4" fill="#8A5A3A" ${L}/><circle cx="${x - 4}" cy="${y - 10}" r="2.4" fill="#8A5A3A" ${L}/><circle cx="${x + 4}" cy="${y - 10}" r="2.4" fill="#8A5A3A" ${L}/><circle cx="${x - 4}" cy="${y - 10}" r="1" fill="${IJUK}"/><circle cx="${x + 4}" cy="${y - 10}" r="1" fill="${IJUK}"/><ellipse cx="${x}" cy="${y - 14}" rx="7" ry="2" fill="${LEAF}"/>`
    : k === 1 ? `<ellipse cx="${x}" cy="${y - 5}" rx="10" ry="6" fill="#A8744A" ${L}/><path d="M${x - 6} ${y - 8} l4 3 l4 -3 l4 3" stroke="#6E4A2C" fill="none"/><circle cx="${x + 11}" cy="${y - 4}" r="2.8" fill="#A8744A" ${L}/>`
    : k === 2 ? `<path d="M${x - 12} ${y - 4} q6 -6 12 -2 q6 4 12 -2 l2 2 q-6 6 -14 2 q-6 -3 -12 2z" fill="#6E4A2C" ${L}/><circle cx="${x + 12}" cy="${y - 7}" r="2.4" fill="#6E4A2C"/>`
    : `<ellipse cx="${x}" cy="${y - 6}" rx="6" ry="7" fill="#C9935A" ${L}/><circle cx="${x}" cy="${y - 15}" r="4.4" fill="#C9935A" ${L}/><path d="M${x - 4} ${y - 18} l1 -4 l2 3 M${x + 4} ${y - 18} l-1 -4 l-2 3" fill="#C9935A" stroke="#3a2e28" stroke-width=".5"/>`;
  const carvings = g(tableTop(390, 250, 100, "#C8432F") + [[404, 248, 0], [428, 248, 1], [454, 248, 2], [478, 248, 3], [416, 236, 3], [444, 238, 0], [470, 238, 1]].map(([x, y, k]) => animal(x, y, k)).join("")
    + `<rect x="452" y="254" width="34" height="8" fill="${CREAM}" ${L}/>` + txt(469, 260.5, "PAK GEDE", 5.5, "#3B3530", ` font-weight="700"`));
  const baskets = g(tableTop(30, 380, 100, "#2F5A4A") + basket(36, 360, 28, 20) + basket(70, 356, 26, 24, "#D9BE7A") + basket(102, 362, 24, 18, "#B99A6A") + `<path d="M74 356 q9 -14 18 0" stroke="#A8864A" stroke-width="2" fill="none"/>` + basket(52, 340, 22, 16, "#E0C890"));
  const incense = g(tableTop(390, 380, 100, "#E58AB0")
    + [0, 1, 2].map(i => `<rect x="${398 + i*12}" y="${362 - i*4}" width="10" height="${18 + i*4}" rx="1" fill="#8A5A3A" ${L}/>${[0, 1, 2].map(k => `<path d="M${401 + i*12 + k*2} ${362 - i*4} v-10" stroke="#D8433A" stroke-width=".8"/>`).join("")}`).join("")
    + `<path d="M434 376 v-22" stroke="#8A5A3A" stroke-width="1"/><circle cx="434" cy="354" r="1" fill="#F09A3A"/><path class="smoke" d="M434 352 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#E6E2DA" stroke-width="1.2"/>`
    + [0, 1, 2].map(i => `<rect x="${446 + i*14}" y="${364 - i*5}" width="13" height="16" fill="${["#3E6BAE", "#F3C94A", "#2F5A4A"][i]}" ${L}/><path d="M${446 + i*14} ${370 - i*5} h13" stroke="${CREAM}" stroke-width=".8"/>`).join("")
    + [[408, 380], [424, 380]].map(([x, y], i) => `<circle cx="${x}" cy="${y - 3}" r="4" fill="${i ? "#F3D34A" : LEAF}" ${L}/>`).join(""));
  // Ibu Sari's corner, in the middle by the shrine: a woven mat, palm leaves to fold, bowls of petals, finished trays
  const mat = g(`<rect x="196" y="292" width="132" height="40" rx="3" fill="#D9BE7A" ${L}/>` + Array.from({length: 8}, (_, i) => `<path d="M${200 + i*16} 292 v40" stroke="#B99A5A" stroke-width="1"/>`).join("") + `<path d="M196 302 h132 M196 322 h132" stroke="#B99A5A"/>`
    + [[206, 302, 0], [222, 300, 1], [298, 300, 2], [314, 302, 3]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="3.6" fill="#8A5A3A" ${L}/>${[-4, 0, 4, -2, 2].map((d, k) => `<circle cx="${x + d}" cy="${y - 1.4 - (k > 2 ? 1.6 : 0)}" r="1.8" fill="${PETALS[c]}"/>`).join("")}`).join("")
    + Array.from({length: 5}, (_, i) => `<path d="M${204 + i*4} 326 q10 -4 24 -2" stroke="#B9C98A" stroke-width="2" fill="none"/>`).join("") + canang(300, 326, .9, false) + canang(318, 324, .8, false) + frangi(236, 320, .9) + frangi(284, 318, .9));
  const sari = spot("ba_market", 262, 368, "Ibu Sari and the stalls", hovE(262, 368, 62, 11), mat + lab(262, 392, "Ibu Sari and the stalls", "#F4C7CF", 10));
  const edges = g(`<rect x="0" y="200" width="14" height="440" fill="${TEAK}" ${L}/><rect x="506" y="200" width="14" height="440" fill="${TEAK}" ${L}/>` + carved(0, 200, 14, 20, TEAK) + carved(506, 200, 14, 20, TEAK)
    + `<path d="M500 470 l14 120" stroke="#8A6A3A" stroke-width="3"/><path d="M510 580 q4 14 -2 30 l-6 -2 q2 -14 2 -28z" fill="#C9A160" ${L}/>`) + frangiPot(30, 634, .85) + frangiPot(488, 634, .85) + g(canang(174, 604, .9) + canang(346, 604, .9));
  return g(flagsF(200, "#B8A88A", "#9A8A6E") + sun("M120 200 H400 L460 640 H60z", .07)) + wall + edges + fruit + carvings + baskets + incense + sari + exit(TEAK);
}

/* ---------- the silversmith's (Celuk, in Ubud) ---------- */
function silverRoom(){
  const wall = g(`<rect width="520" height="200" fill="#ECE6DA"/><rect y="0" width="520" height="16" fill="${DTEAK}"/>` + carved(0, 16, 520, 10, TEAK) + `<rect y="164" width="520" height="36" fill="#D6CEBE"/><path d="M0 164 H520" stroke="#B8AE9A" stroke-width="3"/>`
      + Array.from({length: 26}, (_, i) => `<path d="M${i*20} 166 v34" stroke="#C6BCA8" stroke-width="1"/>`).join(""))
    // the carved wooden door on the left, red and gold, a frangipani on the step
    + g(sk(`<rect x="24" y="36" width="104" height="164" style="fill:${DTEAK}"/><path d="M34 200 V74 Q76 44 118 74 V200z" style="fill:${RED}"/>`, `<rect x="24" y="36" width="104" height="164"/><path d="M34 200 V74 Q76 44 118 74 V200z"/>`)
      + `<path d="M76 58 V200" stroke="${DTEAK}" stroke-width="2"/>` + [42, 80].map(x => `<rect x="${x}" y="86" width="30" height="44" rx="2" fill="none" stroke="${GOLD}" stroke-width="1.4"/><rect x="${x}" y="140" width="30" height="50" rx="2" fill="none" stroke="${GOLD}" stroke-width="1.4"/><circle cx="${x + 15}" cy="108" r="8" fill="none" stroke="${GOLD}" stroke-width="1.2"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${x + 15}" cy="104" rx="2" ry="3.4" fill="${GOLD}" transform="rotate(${a} ${x + 15} 108)"/>`).join("")}<path d="M${x + 4} 165 q11 -12 22 0 q-11 12 -22 0" stroke="${GOLD}" fill="none"/>`).join("")
      + carved(24, 36, 104, 12, DTEAK) + `<circle cx="72" cy="150" r="2.4" fill="${GOLD}"/><circle cx="80" cy="150" r="2.4" fill="${GOLD}"/>`)
    // the window on the garden, shutters open; the sign above
    + signBoard(262, 42, 140, "PERAK · SILVER", "#2E3A5A", "#E6E2DA")
    + g(view(196, 60, 132, 86, "garden") + sk(`<rect x="174" y="58" width="22" height="90" style="fill:#5E8A88"/><rect x="328" y="58" width="22" height="90" style="fill:#5E8A88"/>`, `<rect x="196" y="60" width="132" height="86"/><rect x="174" y="58" width="22" height="90"/><rect x="328" y="58" width="22" height="90"/>`)
      + [0, 1, 2, 3, 4, 5].map(i => `<path d="M176 ${66 + i*14} h18 M330 ${66 + i*14} h18" stroke="#4A6E6C" stroke-width="2"/>`).join("") + `<path d="M262 60 V146" stroke="${CREAM}" stroke-width="3"/><rect x="188" y="146" width="148" height="7" rx="2" fill="${TEAK}" ${L}/>`)
    // the sill: silver bowls, a little teapot, the offering, frangipani in a glass
    + g(`<path d="M202 146 q10 -12 20 0z" fill="#D6D0C6" ${L}/><path d="M232 146 q7 -10 14 0z" fill="#E6E2DA" ${L}/><ellipse cx="290" cy="140" rx="9" ry="7" fill="#D6D0C6" ${L}/><path d="M299 138 l7 -4 M281 136 q-6 0 -5 6" stroke="#9A928A" stroke-width="1.6" fill="none"/><rect x="286" y="131" width="8" height="3" fill="#9A928A"/>` + canang(262, 145, .8, false) + `<rect x="312" y="134" width="10" height="12" rx="2" fill="#D6EEF0" opacity=".8" ${L}/>` + frangi(317, 130, .9))
    // the tool board on the right: hammers, pliers, files, a saw frame, the drawplate
    + g(sk(`<rect x="370" y="44" width="134" height="110" rx="2" style="fill:#A87A52"/>`, `<rect x="370" y="44" width="134" height="110" rx="2"/>`) + Array.from({length: 7}, (_, i) => `<circle cx="${380 + i*19}" cy="54" r="1.4" fill="${DTEAK}"/>`).join("")
      + [0, 1, 2, 3].map(i => `<path d="M${384 + i*16} 60 v40" stroke="#6E4A2C" stroke-width="3"/><rect x="${378 + i*16}" y="${58}" width="12" height="${6 + i}" rx="1" fill="#9AA4AA" ${L}/>`).join("")
      + `<path d="M454 62 l10 30 M470 62 l-10 30" stroke="#9AA4AA" stroke-width="2.4"/><path d="M458 92 l-4 18 M466 92 l4 18" stroke="#D8433A" stroke-width="3.4"/>` + `<path d="M484 60 V112" stroke="#9AA4AA" stroke-width="3"/><path d="M494 60 V108" stroke="#9AA4AA" stroke-width="2"/>`
      + `<path d="M382 120 h48 v24 h-48" fill="none" stroke="#5A6066" stroke-width="2.4"/><path d="M382 120 V144" stroke="#C9CFD4" stroke-width=".8"/><rect x="440" y="120" width="56" height="24" rx="2" fill="#7E8890" ${L}/>${Array.from({length: 8}, (_, i) => `<circle cx="${446 + i*6.4}" cy="132" r="${2.2 - i*.2}" fill="${IJUK}"/>`).join("")}`)
    // a sign on an easel by the door: make your own ring
    + g(`<path d="M140 248 l10 -46 l10 46 M150 202 v46" stroke="${TEAK}" stroke-width="2.4"/><rect x="136" y="204" width="56" height="34" rx="3" fill="#2F3A34" ${L}/>` + txt(164, 218, "MAKE A", 7, "#F3E1A0", ` font-weight="700"`) + txt(164, 230, "RING TODAY", 7, "#F3E1A0", ` font-weight="700"`) + `<circle cx="184" cy="210" r="3" fill="none" stroke="#E6E2DA" stroke-width="1.4"/>`)
    + frangiPot(352, 248, .8) + g(canang(126, 196, .8)) + bambooLamp(176, 30, 24) + bambooLamp(348, 30, 24);
  // the glass cases down both sides: rings on dark velvet, bangles, little frangipani and gecko pendants
  const glassCase = (x, flip) => g(sk(`<rect x="${x}" y="244" width="70" height="236" rx="3" style="fill:${TEAK}"/><rect x="${x + 6}" y="250" width="58" height="214" rx="2" style="fill:#2E3A5A"/>`, `<rect x="${x}" y="244" width="70" height="236" rx="3"/><rect x="${x + 6}" y="250" width="58" height="214" rx="2"/>`)
    + Array.from({length: 6}, (_, r) => { const yy = 266 + r*34; return r % 2 === 0 ? [0, 1, 2, 3].map(c => `<circle cx="${x + 16 + c*13}" cy="${yy}" r="4.4" fill="none" stroke="${(r + c) % 3 ? "#E6E2DA" : "#C9CFD4"}" stroke-width="1.8"/>${c % 2 ? `<circle cx="${x + 16 + c*13}" cy="${yy - 4.4}" r="1.6" fill="${["#BFE3DA", "#F4C7CF", "#E6E2DA"][r % 3]}"/>` : ""}`).join("")
      : [0, 1].map(c => `<ellipse cx="${x + 22 + c*26}" cy="${yy}" rx="10" ry="6" fill="none" stroke="#E6E2DA" stroke-width="2.6"/><ellipse cx="${x + 22 + c*26}" cy="${yy}" rx="10" ry="6" fill="none" stroke="#9A928A" stroke-width=".6" stroke-dasharray="2 2"/>`).join(""); }).join("")
    + frangi(x + 22, 452, 1, "#E6E2DA") + `<path d="M${x + 38} 452 q6 -6 12 0 q4 4 8 0" stroke="#E6E2DA" stroke-width="2" fill="none"/>`
    + `<path d="M${x + 10} 254 l${flip ? 30 : 16} 200" stroke="#FFFFFF" stroke-width="6" opacity=".1"/><rect x="${x - 2}" y="464" width="74" height="16" rx="2" fill="${DTEAK}" ${L}/>` + canang(x + 35, 246, .7, false));
  const cases = glassCase(30, 0) + glassCase(420, 1);
  // Wayan's bench: a low teak bench, the little flame, hammers, the mandrel, the bowl of wire, a ring on the pin
  const bench = spot("ba_silver", 260, 352, "Wayan's bench", hovE(260, 352, 56, 11),
    sk(`<rect x="182" y="290" width="156" height="40" style="fill:${TEAK}"/><rect x="176" y="278" width="168" height="14" rx="3" style="fill:#A87448"/><rect x="194" y="298" width="56" height="12" rx="2" style="fill:#6B3E26"/><rect x="270" y="298" width="56" height="12" rx="2" style="fill:#6B3E26"/>`, `<rect x="182" y="290" width="156" height="40"/><rect x="176" y="278" width="168" height="14" rx="3"/>`)
    + g(`<circle cx="222" cy="304" r="2" fill="${GOLD}"/><circle cx="298" cy="304" r="2" fill="${GOLD}"/><path d="M182 316 h156" stroke="${DTEAK}" stroke-width="1.4"/>`
      // the tiny flame: a little oil lamp with a blowpipe
      + lampGlow(196, 266, 22) + `<path d="M188 280 h16 l-2 -6 h-12z" fill="#9AA4AA" ${L}/><path class="flame" d="M196 274 q-4 -6 0 -12 q4 6 0 12z" fill="#3E7FB8"/><path class="flame" d="M196 274 q-2 -3 0 -7 q2 4 0 7z" fill="#F6E3B4"/><path d="M204 270 l14 -10" stroke="#C9A24A" stroke-width="1.6"/>`
      // the hammers
      + `<path d="M214 284 l22 -6" stroke="#8A5A3A" stroke-width="2.4"/><rect x="232" y="272" width="6" height="12" rx="1" fill="#7E8890" ${L} transform="rotate(-15 235 278)"/><path d="M220 288 l18 2" stroke="#8A5A3A" stroke-width="2"/><rect x="236" y="285" width="5" height="9" rx="1" fill="#9AA4AA" ${L}/>`
      // the mandrel on its stand, a ring on it
      + `<path d="M290 282 l26 -16" stroke="#7E8890" stroke-width="5" stroke-linecap="round"/><path d="M290 282 l26 -16" stroke="#C9CFD4" stroke-width="1.4"/><ellipse cx="305" cy="273" rx="2" ry="4" fill="none" stroke="#F3F1EA" stroke-width="1.8" transform="rotate(-30 305 273)"/><rect x="284" y="280" width="12" height="6" rx="1" fill="#5A6066" ${L}/>`
      // the bowl of silver wire, a coil spilling, little rings on the bench pin
      + `<ellipse cx="328" cy="282" rx="11" ry="4.6" fill="#8A5A3A" ${L}/>${[0, 1, 2].map(i => `<ellipse cx="${324 + i*4}" cy="${279 - (i % 2)}" rx="4" ry="2" fill="none" stroke="#E6E2DA" stroke-width="1.2"/>`).join("")}<path d="M338 282 q6 -2 4 6 q-2 6 4 6" stroke="#E6E2DA" stroke-width="1" fill="none"/>`
      + `<path d="M246 280 l8 -2 l-1 6z" fill="#C9A27E" ${L}/>${[0, 1].map(i => `<circle cx="${268 + i*8}" cy="284" r="2.4" fill="none" stroke="#E6E2DA" stroke-width="1.2"/>`).join("")}`)
    + lab(260, 374, "Wayan's bench", "#C3DDF3", 10));
  const edges = g(`<rect x="0" y="200" width="20" height="440" fill="#E0D8C8"/><rect x="500" y="200" width="20" height="440" fill="#E0D8C8"/><path d="M20 200 V640 M500 200 V640" stroke="#C6BCA8" stroke-width="2"/>`) + frangiPot(26, 634, .8) + frangiPot(494, 634, .8) + g(canang(176, 604, .9) + canang(344, 604, .9));
  return g(tilesF(200, "#E8EEEC", "#D6E0DE", "#C3CDCB") + sun("M196 200 H328 L380 640 H150z", .1)) + wall + edges + cases + bench + exit("#2E3A5A");
}

/* ---------- the dance pavilion (the palace, Ubud) ---------- */
function danceRoom(){
  const posts = [20, 150, 370, 500];
  const wall = g(`<rect width="520" height="200" fill="#B8604A"/>` + view(0, 56, 520, 134, "court")
      // the tiered roof: two skirts of black ijuk, a carved beam under them
      + `<path d="M60 0 H460 L480 24 H40z" fill="${IJUK}"/><path d="M0 22 H520 V52 H0z" fill="#3A302A"/>${Array.from({length: 58}, (_, i) => `<path d="M${i*9} 22 l2 30" stroke="#4E423A" stroke-width="1.4"/>`).join("")}${Array.from({length: 46}, (_, i) => `<path d="M${60 + i*9} 0 l2 24" stroke="#4E423A" stroke-width="1.2"/>`).join("")}<path d="M0 52 H520" stroke="#1E1814" stroke-width="2"/>`
      + carved(0, 52, 520, 12) + posts.map(x => pillar(x, 64, 200, 18)).join("")
      // the stone plinth with its steps at the back
      + `<rect y="186" width="520" height="14" fill="#C2B8A6"/><path d="M0 186 H520" stroke="#9A907E" stroke-width="2"/>`)
    // a parasol (tedung) by the far pillar, offerings on the plinth
    + g(`<path d="M470 196 V96" stroke="${GOLD}" stroke-width="2.4"/><path d="M446 104 q24 -22 48 0z" fill="#F3F1EA" ${L}/><path d="M446 104 q24 6 48 0" stroke="${GOLD}" stroke-width="2.4" fill="none"/>${Array.from({length: 8}, (_, i) => `<path d="M${448 + i*6} 104 v5" stroke="${GOLD}" stroke-width="1.4"/>`).join("")}<circle cx="470" cy="84" r="3" fill="${GOLD}"/>`
      + `<path d="M50 196 V100" stroke="${GOLD}" stroke-width="2.4"/><path d="M26 108 q24 -22 48 0z" fill="#F3D34A" ${L}/><path d="M26 108 q24 6 48 0" stroke="${RED}" stroke-width="2.4" fill="none"/><circle cx="50" cy="88" r="3" fill="${GOLD}"/>`
      + canang(200, 194, .9) + canang(320, 194, .9) + canang(108, 194, .8, false) + canang(412, 194, .8, false))
    // on the stone floor at the back: the dancers' fans and a folded costume on a low bench
    + g(sk(`<rect x="100" y="216" width="80" height="24" rx="2" style="fill:${TEAK}"/><rect x="96" y="208" width="88" height="10" rx="2" style="fill:#A87448"/>`, `<rect x="96" y="208" width="88" height="10" rx="2"/>`)
      + `<rect x="106" y="198" width="34" height="12" rx="2" fill="#2F5A4A" ${L}/><path d="M106 204 h34" stroke="${GOLD}" stroke-width="2"/><rect x="144" y="200" width="30" height="10" rx="2" fill="${RED}" ${L}/><path d="M144 205 h30" stroke="${GOLD}" stroke-width="1.6"/>`
      + [0, 1].map(i => `<path d="M${200 + i*28} 236 l-12 -20 a14 14 0 0 1 24 0z" fill="${i ? RED : GOLD}" ${L}/>${[0, 1, 2, 3].map(k => `<path d="M${200 + i*28} 236 l${-10 + k*7} -18" stroke="${i ? GOLD : RED}" stroke-width=".7"/>`).join("")}`).join(""));
  // the gong frame at the back on the right: a carved gilded frame, three bronze gongs hanging, a beater
  const gong = (x, y, r) => `<path d="M${x} ${y - r - 10} V${y - r}" stroke="#5A3A2A" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="${r}" fill="${BRONZE}" ${L}/><circle cx="${x}" cy="${y}" r="${r*.78}" fill="none" stroke="#8A5E28" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="${r*.3}" fill="#D9A84A" ${L}/><ellipse cx="${x - r*.25}" cy="${y - r*.5}" rx="${r*.3}" ry="${r*.12}" fill="#F3D88A" opacity=".55"/>`;
  const gongs = g(sk(`<rect x="300" y="282" width="190" height="18" rx="2" style="fill:${RED}"/><rect x="304" y="186" width="14" height="100" style="fill:${RED}"/><rect x="472" y="186" width="14" height="100" style="fill:${RED}"/>`, `<rect x="300" y="282" width="190" height="18" rx="2"/><rect x="304" y="186" width="14" height="100"/><rect x="472" y="186" width="14" height="100"/>`)
    + carved(298, 178, 194, 14) + `<path d="M298 178 q-10 -10 -4 -20 q8 2 10 12 M492 178 q10 -10 4 -20 q-8 2 -10 12" fill="${GOLD}" ${L}/>` + carved(300, 284, 190, 14)
    + gong(346, 236, 26) + gong(400, 240, 22) + gong(448, 236, 26) + `<path d="M330 296 l20 -14" stroke="#8A5A3A" stroke-width="2.4"/><circle cx="352" cy="281" r="4" fill="#E6D6B8" ${L}/>`);
  // the kettle gongs (reyong) in their long carved case along the left wall
  const reyong = g(sk(`<rect x="30" y="250" width="50" height="150" rx="3" style="fill:${RED}"/><rect x="34" y="244" width="42" height="150" rx="3" style="fill:#C8483A"/>`, `<rect x="30" y="250" width="50" height="150" rx="3"/>`)
    + carved(30, 384, 50, 16) + Array.from({length: 8}, (_, i) => `<ellipse cx="55" cy="${260 + i*16}" rx="12" ry="6" fill="${BRONZE}" ${L}/><circle cx="55" cy="${258 + i*16}" r="3.4" fill="#D9A84A" ${L}/>`).join("")
    + `<path d="M44 238 q-12 -10 -4 -20 q6 6 8 16 M66 238 q12 -10 4 -20 q-6 6 -8 16" fill="${GOLD}" ${L}/>`);
  // the gamelan laid out on the floor: two rows of gangsa with gold carved cases, the drums at the end
  const gangsa = (x, y, w) => sk(`<path d="M${x} ${y + 26} V${y + 8} q${w/2} -8 ${w} 0 V${y + 26}z" style="fill:${RED}"/>`, `<path d="M${x} ${y + 26} V${y + 8} q${w/2} -8 ${w} 0 V${y + 26}z"/>`)
    + `<path d="M${x - 4} ${y + 8} q-6 -10 2 -16 q4 6 4 16 M${x + w + 4} ${y + 8} q6 -10 -2 -16 q-4 6 -4 16" fill="${GOLD}" ${L}/>` + carved(x, y + 14, w, 12)
    + Array.from({length: Math.floor((w - 8)/9)}, (_, i) => `<rect x="${x + 5 + i*9}" y="${y + 1 - Math.abs(i - (w - 8)/18)*.6}" width="7" height="10" rx="1.5" fill="${BRONZE}" ${L}/><circle cx="${x + 8.5 + i*9}" cy="${y + 6 - Math.abs(i - (w - 8)/18)*.6}" r=".9" fill="#5A3A2A"/>`).join("");
  const drum = (x, y) => `<path d="M${x - 10} ${y - 2} q-4 -10 0 -20 h20 q4 10 0 20z" fill="#8A5A3A" ${L}/><ellipse cx="${x}" cy="${y - 12}" rx="7" ry="9" fill="none"/><ellipse cx="${x - 10}" cy="${y - 12}" rx="3" ry="9" fill="#E6D6B8" ${L}/><ellipse cx="${x + 10}" cy="${y - 12}" rx="3" ry="9" fill="#E6D6B8" ${L}/>${[0, 1, 2, 3].map(k => `<path d="M${x - 9 + k*5} ${y - 21} l4 18" stroke="#C9A27E" stroke-width=".7"/>`).join("")}`;
  const gam = g(gangsa(34, 436, 62) + gangsa(104, 436, 62) + gangsa(174, 436, 72) + gangsa(34, 468, 72) + gangsa(114, 468, 72) + drum(208, 498) + drum(234, 496)
    + `<path d="M76 452 l10 -8 M150 452 l10 -8 M90 486 l10 -8" stroke="#8A5A3A" stroke-width="1.6"/>${[86, 160, 100].map((x, i) => `<rect x="${x - 1}" y="${[441, 441, 475][i]}" width="6" height="4" rx="1" fill="#C9A27E"/>`).join("")}`);
  const seat = spot("ba_dance", 196, 526, "Sit at the gongs", hovE(196, 526, 48, 11), gam + lab(200, 550, "Sit at the gongs", "#F3E1A0", 10));
  // the front pillars at the edges, and a little offering at the dancers' place in the middle (flat on the floor)
  const edges = g(pillar(10, 200, 640, 20) + pillar(510, 200, 640, 20) + canang(260, 300, .9) + `<path d="M500 420 q-8 -20 0 -40" stroke="#5E8A48" stroke-width="2" fill="none"/>`) + frangiPot(474, 634, .85) + g(canang(176, 604, .9) + canang(344, 604, .9));
  return g(flagsF(200, "#C2B8A6", "#A89E8C") + sun("M150 200 H370 L430 640 H90z", .1) + `<ellipse cx="300" cy="380" rx="150" ry="70" fill="#D6CCBA" opacity=".35"/>`) + wall + edges + gongs + reyong + seat + exit(RED);
}

/* ---------- the coffee and cacao house (Tegallalang) ---------- */
function cacaoRoom(){
  const wall = g(`<rect width="520" height="200" fill="${BAMBOO}"/>` + view(150, 30, 220, 170, "terraces") + woven(0, 30, 150, 170) + woven(370, 30, 150, 170)
      + thatch(0, 34, "#B99258", "#7A5A30")
      + [150, 370].map(x => `<rect x="${x - 7}" y="30" width="14" height="170" fill="#B99A5A" ${L}/>${[60, 100, 140, 180].map(y => `<path d="M${x - 7} ${y} h14" stroke="#8A6A3A" stroke-width="2"/>`).join("")}`).join("")
      // the bamboo railing across the open side
      + `<path d="M150 160 H370 M150 180 H370" stroke="#B99A5A" stroke-width="5"/><path d="M150 160 H370" stroke="#E8D49A" stroke-width="1.4"/>${[190, 230, 270, 310, 350].map(x => `<path d="M${x} 160 V200" stroke="#B99A5A" stroke-width="4"/>`).join("")}`)
    + signBoard(76, 56, 108, "KOPI · KAKAO", "#5A3A2A", "#F3E1A0", 9)
    // the left wall: cacao pods hanging in a bunch, a shelf of jars of beans and nibs
    + g(`<path d="M30 76 h80" stroke="#6E5236" stroke-width="2"/>` + [[38, "#E8B83A"], [56, "#D8833A"], [74, "#B8432F"], [92, "#E8B83A"], [104, "#7FA35A"]].map(([x, c], i) => `<path d="M${x} 76 v${6 + (i % 2)*4}" stroke="#6E5236"/><ellipse cx="${x}" cy="${94 + (i % 2)*4}" rx="7" ry="13" fill="${c}" ${L}/>${[-3, 0, 3].map(d => `<path d="M${x + d} ${83 + (i % 2)*4} v22" stroke="#3a2e28" stroke-width=".4" opacity=".6"/>`).join("")}`).join("")
      + sk(`<rect x="12" y="150" width="128" height="6" style="fill:#6E5236"/>`, `<rect x="12" y="150" width="128" height="6"/>`) + [0, 1, 2, 3, 4].map(i => `<rect x="${18 + i*24}" y="126" width="18" height="24" rx="3" fill="#D6EEF0" opacity=".75" ${L}/><rect x="${20 + i*24}" y="${136}" width="14" height="13" fill="${["#3A2A20", "#6B3A2A", "#8A5A3A", "#3A2A20", "#C9A27E"][i]}"/><rect x="${17 + i*24}" y="122" width="20" height="5" rx="1" fill="#8A6A3A" ${L}/>`).join("") + canang(128, 148, .7, false))
    // the right wall: woven trays (tampah) hung up, the paddle, a basket of pods
    + g([[400, 70, 22], [452, 66, 26], [492, 96, 16], [420, 120, 18]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#D9BE7A" ${L}/><circle cx="${x}" cy="${y}" r="${r - 3}" fill="none" stroke="#A8864A" stroke-width="1.6"/>${Array.from({length: 6}, (_, k) => `<path d="M${x - r + 4} ${y - r*.6 + k*r*.25} h${2*r - 8}" stroke="#B99A5A" stroke-width=".7"/>`).join("")}`).join("")
      + `<path d="M462 112 l14 70" stroke="#8A5A3A" stroke-width="3"/><ellipse cx="478" cy="186" rx="5" ry="9" fill="#8A5A3A" ${L}/>` + basket(388, 160, 40, 28) + [[396, 156, "#E8B83A"], [408, 154, "#D8833A"], [420, 156, "#B8432F"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="10" fill="${c}" ${L}/>`).join(""))
    + bambooLamp(260, 54, 26) + g(canang(200, 196, .9) + canang(326, 196, .9, false))
    // a split pod and beans drying on a mat at the back
    + g(`<rect x="160" y="214" width="78" height="26" rx="3" fill="#C9A86A" ${L}/>${Array.from({length: 26}, (_, i) => `<ellipse cx="${166 + (i % 13)*5.6}" cy="${222 + Math.floor(i/13)*9 + (i % 2)}" rx="2.4" ry="1.6" fill="${i % 3 ? "#6B3A2A" : "#8A5A3A"}"/>`).join("")}` + `<rect x="282" y="214" width="78" height="26" rx="3" fill="#C9A86A" ${L}/>${Array.from({length: 26}, (_, i) => `<ellipse cx="${288 + (i % 13)*5.6}" cy="${222 + Math.floor(i/13)*9 + (i % 2)}" rx="2.4" ry="1.6" fill="${i % 3 ? "#3A2A20" : "#5A3A2A"}"/>`).join("")}`);
  // the sacks along the left wall: coffee, cacao, the open tops showing the beans, a scoop
  const sack = (x, y, w, h, bean, t) => sk(`<path d="M${x} ${y + h} q-3 ${-h*.6} 2 ${-h} q${w/2} -6 ${w - 4} 0 q5 ${h*.4} 2 ${h}z" style="fill:#C9A27E"/>`, `<path d="M${x} ${y + h} q-3 ${-h*.6} 2 ${-h} q${w/2} -6 ${w - 4} 0 q5 ${h*.4} 2 ${h}z"/>`)
    + `<ellipse cx="${x + w/2 - 1}" cy="${y + 1}" rx="${w/2 - 4}" ry="5" fill="${bean}" ${L}/>${Array.from({length: 6}, (_, i) => `<ellipse cx="${x + 8 + (i % 3)*((w - 16)/2)}" cy="${y - 1 + Math.floor(i/3)*3}" rx="2" ry="1.3" fill="#2A1C14" opacity=".5"/>`).join("")}<path d="M${x + 4} ${y + 6} q${w/2} 4 ${w - 8} 0" stroke="#8A6A52" stroke-width="1.4" fill="none"/>`
    + txt(x + w/2 - 1, y + h*.62, t, 7, "#5A3A2A", ` font-weight="700"`);
  const sacks = g(sack(36, 262, 66, 56, "#3A2A20", "KOPI") + sack(34, 330, 70, 60, "#6B3A2A", "KAKAO") + sack(38, 400, 64, 56, "#5A3A2A", "BALI")
    + `<path d="M92 260 l14 -14" stroke="#8A6A3A" stroke-width="2.4"/><path d="M84 262 q6 -8 14 -2 l-4 6z" fill="#B99A5A" ${L}/>`);
  // the hearth on the right: a clay stove, the wide pan of beans, the paddle, smoke; firewood stacked behind
  const hearth = g(sk(`<rect x="420" y="300" width="70" height="20" rx="3" style="fill:#7A5A3A"/>`, `<rect x="420" y="300" width="70" height="20" rx="3"/>`)
    + [[5, 0], [5, 1], [4, 2], [3, 3]].map(([n, r]) => Array.from({length: n}, (_, i) => { const cx = 428 + r*6 + i*13 + (r % 2)*0, cy = 300 - r*11; return `<circle cx="${cx}" cy="${cy}" r="6.4" fill="#8A5A3A" ${L}/><circle cx="${cx}" cy="${cy}" r="4.4" fill="#E0C090"/><circle cx="${cx}" cy="${cy}" r="2" fill="none" stroke="#B99A5A" stroke-width=".6"/>`; }).join("")).join("")
    + sk(`<path d="M424 460 V372 q32 -10 64 0 V460z" style="fill:#A65A40"/><rect x="420" y="364" width="72" height="12" rx="4" style="fill:#8A4A32"/>`, `<path d="M424 460 V372 q32 -10 64 0 V460z"/>`)
    + `<path d="M440 460 V420 q16 -14 32 0 V460z" fill="#3A2A20"/><path class="flame" d="M446 458 q4 -18 10 -24 q2 10 6 6 q6 8 4 18z" fill="#F09A3A"/><path class="flame" d="M452 458 q2 -10 6 -14 q2 6 4 4 q2 6 0 10z" fill="#F6E3B4"/>` + lampGlow(456, 440, 26)
    + `<path d="M438 460 l12 -8 M474 460 l-12 -6" stroke="#6E4A2C" stroke-width="4"/>`
    + `<ellipse cx="456" cy="364" rx="40" ry="11" fill="#2F2B28" ${L}/><ellipse cx="456" cy="362" rx="33" ry="7" fill="#5A3420"/>${Array.from({length: 18}, (_, i) => `<ellipse cx="${430 + (i % 9)*6.4}" cy="${360 + Math.floor(i/9)*4}" rx="2.2" ry="1.4" fill="${i % 2 ? "#3A2A20" : "#6B3A2A"}"/>`).join("")}<path d="M444 362 l-22 -34" stroke="#8A5A3A" stroke-width="3"/><ellipse cx="447" cy="364" rx="5" ry="3" fill="#8A5A3A"/>`
    + `<g class="smoke"><circle cx="460" cy="340" r="7" fill="#F3F1EA" opacity=".55"/><circle cx="470" cy="324" r="9" fill="#F3F1EA" opacity=".4"/><circle cx="462" cy="306" r="8" fill="#F3F1EA" opacity=".28"/></g>`);
  // the tasting counter: bamboo, the little cups in a row, cacao pods split open, a tray of nibs
  const cup = (x, y, c) => `<path d="M${x - 5} ${y - 9} h10 l-1.5 9 h-7z" fill="${CREAM}" ${L}/><ellipse cx="${x}" cy="${y - 9}" rx="5" ry="1.6" fill="${c}"/><ellipse cx="${x}" cy="${y + .5}" rx="7" ry="1.8" fill="#E6E2DA" ${L}/>`;
  const ctr = spot("ba_cacao", 260, 374, "Tasting and roasting", hovE(260, 374, 56, 11),
    sk(`<rect x="184" y="312" width="152" height="38" style="fill:#C9A86A"/><rect x="178" y="300" width="164" height="14" rx="3" style="fill:#8A6A3A"/>`, `<rect x="184" y="312" width="152" height="38"/><rect x="178" y="300" width="164" height="14" rx="3"/>`)
    + g(Array.from({length: 15}, (_, i) => `<path d="M${189 + i*10} 314 V350" stroke="#A8864A" stroke-width="1.6"/>${[326, 340].map(y => `<path d="M${185 + i*10} ${y + (i % 2)*3} h8" stroke="#8A6A3A" stroke-width="1"/>`).join("")}`).join("")
      + ["#3A2A20", "#6B3A2A", "#C9A27E", "#E8C23A", "#8A5A3A", "#3A2A20", "#D9A05A", "#7FA35A"].map((c, i) => cup(198 + i*17.5, 308, c)).join("")
      + `<ellipse cx="186" cy="296" rx="6" ry="11" fill="#E8B83A" ${L} transform="rotate(70 186 296)"/><path d="M322 300 q8 -10 18 -2 q-6 10 -18 2z" fill="#D8833A" ${L}/><path d="M324 300 q8 -6 14 -1" stroke="#F3E1B0" stroke-width="3"/>${[0, 1, 2].map(i => `<circle cx="${327 + i*4}" cy="299" r="1.3" fill="#F6E8D0"/>`).join("")}`
      + canang(260, 340, .7, false))
    + lab(260, 396, "Tasting and roasting", "#F3E1A0", 10));
  // the edges: bamboo posts (the hut's stilts come up through the floor), a water jar, a broom
  const edges = g(`<rect x="0" y="200" width="16" height="440" fill="#B99A5A" ${L}/><rect x="504" y="200" width="16" height="440" fill="#B99A5A" ${L}/>${[260, 330, 400, 470, 540].map(y => `<path d="M0 ${y} h16 M504 ${y} h16" stroke="#8A6A3A" stroke-width="2"/>`).join("")}`
    + `<path d="M20 600 q-4 -24 10 -30 q14 6 10 30z" fill="${TERRA}" ${L}/><ellipse cx="30" cy="571" rx="7" ry="2.4" fill="#5A3A2A"/>` + `<path d="M500 500 l-6 90" stroke="#8A6A3A" stroke-width="2.4"/><path d="M494 590 l-8 22 h18z" fill="#C9A160" ${L}/>`) + frangiPot(488, 636, .8) + g(canang(176, 604, .9) + canang(344, 604, .9));
  return g(bambooF(200) + sun("M150 200 H370 L420 640 H100z", .12)) + wall + edges + sacks + hearth + ctr + exit("#5A3A2A");
}

const ROOMS = {ba_warung: warungRoom, ba_market: marketRoom, ba_silver: silverRoom, ba_dance: danceRoom, ba_cacao: cacaoRoom};
export function baliRoomArt(scene){ return (ROOMS[scene] || warungRoom)(); }
