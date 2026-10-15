// Bali's interiors (round 220): five rooms behind the doors on the beach, in Ubud and at the water temple.
// Balinese rooms: open pavilions (bale) on raised stone plinths, carved and painted red-and-gold timber, alang-alang
// thatch, woven bamboo walls (bedeg), red brick and grey paras stone, terracotta and volcanic stone floors, frangipani,
// and the little palm-leaf offerings (canang sari) on every ledge. The edges full, the middle calm and clear (the playbook).
//   ba_warung:  Nyoman's warung on the sand: the glass cabinet of nasi campur dishes, the cooler of fresh juices,
//               a heap of young coconuts, low tables on woven mats, the open side looking out to the jukung and the sea
//   ba_offer:   Ibu Wayan's offerings house: rows of finished canang, palm leaves, baskets of flowers by colour,
//               the mat where the offerings are made, incense, the family shrine
//   ba_gamelan: the gamelan pavilion at the water temple: hanging gongs, rows of bronze gangsa in carved red-and-gold
//               frames, the reong, the kendang drums, a Legong costume on its stand
//   ba_silver:  Ketut's silver workshop: the workbench with tiny tools and a little flame, trays of filigree, the cases
//   ba_market:  the market hall in Ubud: spices, vanilla, coffee, snake fruit, mangosteen and rambutan, sarongs,
//               baskets, carvings and kites
// Spots (data-rdspot, core.js roomSpot): the thing to tap in each room opens its panel; a few small touches too.
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";

const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const g = s => `<g pointer-events="none">${s}</g>`;
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const exit = (col = "#7E2A22") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none" style="fill:#FFFDF6">Exit</text></g>`;
const txt = (x, y, t, size = 9, fill = "#FFFDF6", weight = 400, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Klee One,serif" font-weight="${weight}" font-size="${size}" fill="${fill}" pointer-events="none">${t}</text>`;
const R = i => { const x = Math.sin(i*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };   // a steady scatter
const f1 = n => n.toFixed(1);
const P = {red: "#A8322A", red2: "#7E2420", gold: "#D9AE4E", gold2: "#B8862A", goldL: "#F3D98A", thatch: "#C9A55E", thatch2: "#A8843E", thatch3: "#86662E",
  bamboo: "#DCC48E", bamboo2: "#BFA066", paras: "#BDB4A2", paras2: "#9C9382", lava: "#5E5A56", lava2: "#46423F", brick: "#B5583A", brick2: "#94452E",
  terra: "#C47A55", leaf: "#5E8A4A", leaf2: "#3E6E3A", janur: "#E0D88E", janur2: "#B8AE5A", sky: "#D6ECE8", sea: "#2F8E96", sea2: "#5EB0AE",
  bronze: "#CFA04A", bronze2: "#8E6A2A", bronzeD: "#6E5022", ijuk: "#2E2A28", teak: "#8A5A3A", teak2: "#6B4430", silver: "#D6D3CC", silver2: "#A9A59C"};
// a unique clip for a window onto the outside world
let CID = 0;
const clip = (x, y, w, h, inner) => { const id = `baClip${++CID}`; return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`; };

/* ---------- shared pieces ---------- */
// floors: square tiles (terracotta, volcanic stone, paras) laid in rows; teak boards
const tiles = (y0, cols, line, w = 52, h = 40, off = true) => { let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${cols[0]}"/>`;
  for (let r = 0; y0 + r*h < 640; r++) for (let k = -1; k*w < 520; k++) s += `<rect x="${k*w + (off ? (r % 2)*w/2 : 0)}" y="${y0 + r*h}" width="${w}" height="${h}" style="fill:${cols[(r*3 + k*7 + 20) % cols.length]};stroke:${line}" stroke-width="1.1"/>`;
  return g(s); };
const boards = (y0, cols, line) => { let s = `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${cols[0]}"/>`;
  for (let r = 0; y0 + r*24 < 640; r++) { let x = -((r*53) % 140); while (x < 520) { const w = 120 + Math.round(R(r*9 + x)*90); s += `<rect x="${x}" y="${y0 + r*24}" width="${w}" height="24" style="fill:${cols[((r + Math.round(x/7)) % cols.length + cols.length) % cols.length]};stroke:${line}" stroke-width="1"/>`; x += w; } }
  return g(s); };
// the raised plinth: a carved paras kerb where the floor meets the back wall, and a step down at the front
const kerb = (y = 200) => g(`<rect y="${y}" width="520" height="9" style="fill:${P.paras}"/>${Array.from({length: 26}, (_, k) => `<path d="M${k*20 + 4} ${y + 4.5} q3 -4 6 0 q3 4 6 0" fill="none" style="stroke:${P.paras2}" stroke-width="1"/>`).join("")}<path d="M0 ${y + 9} H520" style="stroke:#7E7666" stroke-width="1.4"/>`);
const step = () => g(`<rect y="630" width="520" height="10" style="fill:${P.paras}"/><path d="M0 630 H520" style="stroke:#7E7666" stroke-width="1.4"/>`);
// the underside of the alang-alang thatch: bamboo rafters, grass in long streaks
const thatchTop = (h = 30) => { const d = [[], [], []]; for (let i = 0; i < 90; i++) d[i % 3 ? 0 : 1].push(`M${f1(R(i)*530 - 5)} ${f1(R(i*3)*h*.4)}l${f1(R(i*5)*6 - 3)} ${f1(h*.4 + R(i*7)*h*.6)}`);
  return g(`<rect width="520" height="${h}" style="fill:${P.thatch2}"/><path d="${d[0].join("")}" style="stroke:${P.thatch3}" stroke-width="1.2"/><path d="${d[1].join("")}" style="stroke:${P.thatch}" stroke-width="1.8"/>${[60, 160, 260, 360, 460].map(x => `<path d="M${x} 0 V${h}" style="stroke:${P.bamboo2}" stroke-width="5"/><path d="M${x - 2.5} ${h*.5} h5" style="stroke:${P.thatch3}" stroke-width="1"/>`).join("")}`); };
// a carved beam painted red with gold leaf scrolls (patra) along it
const beam = (x, y, w, h = 14, col = P.red) => sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${col}"/><path d="M${x} ${y + 2} h${w} M${x} ${y + h - 2} h${w}" style="stroke:${P.gold}" stroke-width="1.6"/>${Array.from({length: Math.floor(w/18)}, (_, k) => { const cx = x + 9 + k*18, cy = y + h/2;
  return `<path d="M${cx - 6} ${cy} q3 ${-h*.32} 6 0 q3 ${h*.32} 6 0 q-3 ${-h*.22} -6 0 q-3 ${h*.22} -6 0z" style="fill:${P.gold}"/><circle cx="${cx + 8.5}" cy="${cy}" r="1.3" style="fill:${P.goldL}"/>`; }).join("")}`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`);
// a bamboo beam with its nodes
const bambooBeam = (x, y, w, d = 10) => sk(`<rect x="${x}" y="${y}" width="${w}" height="${d}" rx="${d/2}" style="fill:${P.bamboo}"/>${Array.from({length: Math.floor(w/46)}, (_, k) => `<path d="M${x + 30 + k*46} ${y} v${d}" style="stroke:${P.bamboo2}" stroke-width="2"/>`).join("")}<path d="M${x} ${y + 3} h${w}" style="stroke:#F1E2B8" stroke-width="1.2"/>`, `<rect x="${x}" y="${y}" width="${w}" height="${d}" rx="${d/2}"/>`);
// a carved column, red and gold, on a stone base (umpak), with a gold bracket at the top
const column = (x, y0, y1, w = 14) => sk(`<rect x="${x - w/2}" y="${y0}" width="${w}" height="${y1 - y0}" style="fill:${P.red}"/>${Array.from({length: Math.floor((y1 - y0 - 40)/26)}, (_, k) => { const cy = y0 + 32 + k*26; return `<path d="M${x} ${cy - 6} l4 6 l-4 6 l-4 -6z" style="fill:${P.gold}"/>`; }).join("")}
  <rect x="${x - w/2}" y="${y0 + 8}" width="${w}" height="4" style="fill:${P.gold}"/><rect x="${x - w/2}" y="${y1 - 18}" width="${w}" height="4" style="fill:${P.gold}"/><path d="M${x - w/2 - 7} ${y0} h${w + 14} l-7 9 h${-w}z" style="fill:${P.gold}"/><path d="M${x - w/2 - 6} ${y1} h${w + 12} l-3 -10 h${-w - 6}z" style="fill:${P.paras}"/>`,
  `<rect x="${x - w/2}" y="${y0}" width="${w}" height="${y1 - y0}"/><path d="M${x - w/2 - 6} ${y1} h${w + 12} l-3 -10 h${-w - 6}z"/>`);
// a bamboo post
const post = (x, y0, y1, w = 9) => sk(`<rect x="${x - w/2}" y="${y0}" width="${w}" height="${y1 - y0}" rx="3" style="fill:${P.bamboo}"/>${Array.from({length: Math.floor((y1 - y0)/40)}, (_, k) => `<path d="M${x - w/2} ${y0 + 30 + k*40} h${w}" style="stroke:${P.bamboo2}" stroke-width="2"/>`).join("")}`, `<rect x="${x - w/2}" y="${y0}" width="${w}" height="${y1 - y0}" rx="3"/>`);
// woven bamboo (bedeg) as a pattern; a red brick wall with grey paras bands carved in leaf scrolls
const weaveDefs = (a = P.bamboo, b = P.bamboo2) => `<defs><pattern id="baWeave" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${a}"/><path d="M0 1.7h7M0 5.2h7M7 8.7h7M7 12.2h7M8.7 0v7M12.2 0v7M1.7 7v7M5.2 7v7" stroke="${b}" stroke-width="1.2"/><path d="M7 0v14M0 7h14" stroke="${b}" stroke-width=".6" opacity=".6"/></pattern></defs>`;
const weave = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#baWeave)"/>`;
const brickWall = (x, y, w, h) => { let d = "";
  for (let r = 0; r*9 < h; r++) { d += `M${x} ${y + r*9}h${w}`; for (let k = 0; k*22 < w; k++) d += `M${x + k*22 + (r % 2)*11} ${y + r*9}v9`; }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.brick}"/><path d="${d}" style="stroke:${P.brick2}" stroke-width=".8"/>`; };
const parasBand = (x, y, w, h = 14) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.paras}"/>${Array.from({length: Math.floor(w/16)}, (_, k) => `<path d="M${x + 4 + k*16} ${y + h*.7} q4 ${-h*.6} 8 0 M${x + 8 + k*16} ${y + h*.7} v${-h*.25}" fill="none" style="stroke:${P.paras2}" stroke-width="1.1"/>`).join("")}<path d="M${x} ${y} h${w} M${x} ${y + h} h${w}" style="stroke:#857C6C" stroke-width="1"/>`;
// a frangipani flower (jepun): five cream petals, a yolk-yellow heart
const frangi = (x, y, s = 1, c = "#FFFDF6") => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="1.4" cy="-4.4" rx="2.8" ry="4.6" transform="rotate(${a})" style="fill:${c};stroke:#E8DCC2" stroke-width=".4"/>`).join("")}<circle r="2.1" style="fill:#F3C94A"/></g>`;
const hibiscus = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-4" rx="3.4" ry="4.4" transform="rotate(${a})" style="fill:#D9433A"/>`).join("")}<path d="M0 0 l5 -6" style="stroke:#F3C94A" stroke-width="1"/></g>`;
// a canang sari: a little square tray of young palm leaf, flowers in the colours of the four directions, a pinch of pandan, incense
const canang = (x, y, s = 1, smoke = false) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-9 0 l1.6 -5 h14.8 l1.6 5z" style="fill:${P.janur};stroke:${P.janur2}" stroke-width=".7"/><path d="M-7 -2.5 h14" style="stroke:${P.janur2}" stroke-width=".5"/>
  <path d="M-5 -5 l-1 -3 M-2 -5 l0 -3.4 M2 -5 l1 -3" style="stroke:#5E9A4A" stroke-width=".9"/><circle cx="-5" cy="-6.6" r="2.3" style="fill:#FFFDF6"/><circle cx="-1.6" cy="-7.4" r="2.3" style="fill:#D9433A"/><circle cx="1.8" cy="-7" r="2.3" style="fill:#F3C94A"/><circle cx="5.2" cy="-6.4" r="2.3" style="fill:#7E5AB0"/>${frangi(0, -9, .42)}
  ${smoke ? `<path d="M5 -7 l2.4 -12" style="stroke:#7A4A2A" stroke-width=".8"/><circle cx="7.4" cy="-19" r=".9" style="fill:#E8823A"/><path d="M7.5 -20 q-3 -5 0 -9 q3 -4 -1 -9" fill="none" style="stroke:#D8D4CC" stroke-width=".9" opacity=".8"/>` : ""}</g>`;
// a lighter canang for long rows on shelves
const canangS = (x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-9 0 l1.6 -5 h14.8 l1.6 5z" style="fill:${P.janur};stroke:${P.janur2}" stroke-width=".7"/><circle cx="-5" cy="-6.4" r="2.3" style="fill:#FFFDF6"/><circle cx="-1.6" cy="-7.2" r="2.3" style="fill:#D9433A"/><circle cx="1.8" cy="-6.8" r="2.3" style="fill:#F3C94A"/><circle cx="5.2" cy="-6.2" r="2.3" style="fill:#7E5AB0"/><circle cy="-8.6" r="1.6" style="fill:#FFFDF6"/></g>`;
// a ceremonial umbrella (tedung), its cloth fringe
const tedung = (x, y, h, col = "#F3C94A", fr = "#FFFDF6") => sk(`<path d="M${x} ${y} V${y - h}" style="stroke:${P.red2}" stroke-width="3"/><path d="M${x - 22} ${y - h + 10} q22 -22 44 0z" style="fill:${col}"/><path d="M${x - 22} ${y - h + 10} h44 v7 h-44z" style="fill:${fr}"/>${Array.from({length: 11}, (_, k) => `<path d="M${x - 20 + k*4} ${y - h + 17} v4" style="stroke:${col}" stroke-width="1.6"/>`).join("")}<circle cx="${x}" cy="${y - h - 2}" r="2.6" style="fill:${P.gold}"/>`,
  `<path d="M${x - 22} ${y - h + 10} q22 -22 44 0z"/>`);
// black-and-white chequered poleng cloth
const poleng = (x, y, w, h, sz = 5) => { let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#FFFDF6"/>`; for (let r = 0; r*sz < h; r++) for (let c = 0; c*sz < w; c++) if ((r + c) % 2) s += `<rect x="${x + c*sz}" y="${y + r*sz}" width="${Math.min(sz, w - c*sz)}" height="${Math.min(sz, h - r*sz)}" style="fill:#2F2B28"/>`; return s; };
// a lamak: a long hanging of palm leaf, cut into patterns
const lamak = (x, y, h, w = 16) => g(sk(`<rect x="${x - w/2}" y="${y}" width="${w}" height="${h}" style="fill:${P.janur}"/><path d="M${x - w/2} ${y + h} l${w/4} 8 l${w/4} -8 l${w/4} 8 l${w/4} -8" style="fill:${P.janur}"/>${Array.from({length: Math.floor(h/14)}, (_, k) => `<path d="M${x} ${y + 4 + k*14} l4 5 l-4 5 l-4 -5z" style="fill:#7FA35A"/>`).join("")}<path d="M${x - w/2 + 2} ${y} v${h} M${x + w/2 - 2} ${y} v${h}" style="stroke:${P.janur2}" stroke-width="1"/>`, `<rect x="${x - w/2}" y="${y}" width="${w}" height="${h}"/>`));
// a woven rattan lamp hanging from the beam
const lamp = (x, y, top = 40) => g(sk(`<path d="M${x} ${top} V${y - 12}" style="stroke:#3A3430" stroke-width="1"/><path d="M${x - 13} ${y} q0 -14 13 -14 q13 0 13 14z" style="fill:#C9A26A"/>${[-8, -3, 2, 7].map(d => `<path d="M${x + d} ${y - 13} l${d*.4} 13" style="stroke:#8A6A3A" stroke-width=".8"/>`).join("")}<path d="M${x - 11} ${y - 6} h22" style="stroke:#8A6A3A" stroke-width=".8"/><ellipse cx="${x}" cy="${y + 1}" rx="7" ry="2.4" style="fill:#FFE3A3"/>`, `<path d="M${x - 13} ${y} q0 -14 13 -14 q13 0 13 14z"/>`)) + lampGlow(x, y + 4, 30);
// a coconut palm and the garden beyond: sky, Gunung Agung far off, rice terraces stepping down, palms and banana leaves
const palm = (x, y, h, lean = 10, s = 1) => `<path d="M${x} ${y} q${lean*.2} ${-h*.6} ${lean} ${-h}" fill="none" style="stroke:#8A7A5E" stroke-width="${4*s}"/>${[-70, -40, -12, 14, 42, 72, 180].map(a => { const r = 24*s, dx = Math.sin(a*Math.PI/180)*r, dy = -Math.cos(a*Math.PI/180)*r*.55 + 6*s; return `<path d="M${x + lean} ${y - h} q${f1(dx*.5)} ${f1(dy - 8*s)} ${f1(dx)} ${f1(dy)} q${f1(-dx*.4)} ${f1(-4*s)} ${f1(-dx)} ${f1(-dy)}z" style="fill:${a % 4 ? "#4E7E3E" : "#6E9A4A"}"/>`; }).join("")}<circle cx="${x + lean - 2}" cy="${y - h + 4}" r="${2.6*s}" style="fill:#7A8A3A"/><circle cx="${x + lean + 2}" cy="${y - h + 5}" r="${2.6*s}" style="fill:#7A8A3A"/>`;
const garden = (x, y, w, h, opt = {}) => clip(x, y, w, h, `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.sky}"/>
  ${opt.agung ? `<path d="M${x + w*.1} ${y + h*.5} L${x + w*.42} ${y + h*.18} q${w*.04} -${h*.03} ${w*.08} 0 L${x + w*.9} ${y + h*.5}z" style="fill:#A9BCC2"/>` : ""}
  <rect x="${x}" y="${y + h*.46}" width="${w}" height="${h*.54}" style="fill:#7FAE5A"/>${Array.from({length: 6}, (_, k) => `<path d="M${x - 10} ${f1(y + h*(.5 + k*.09))} q${w*.3} ${-6 + (k % 2)*10} ${w*.6} ${-2} t${w*.6} 4" fill="none" style="stroke:${k % 2 ? "#5E8E44" : "#9CC46A"}" stroke-width="2.2"/>`).join("")}
  ${(opt.palms || []).map(([px, ph, l]) => palm(x + px, y + h, ph, l)).join("")}
  ${opt.banana ? `<path d="M${x + w - 6} ${y + h} q-16 -30 -30 -40 q20 4 30 30 M${x + w - 4} ${y + h} q-4 -44 -24 -60 q24 10 24 54" style="fill:#5E9A4A"/>` : ""}`);

/* ---------- Nyoman's warung on the sand ---------- */
// the beach through the open side: a white jukung with its painted eye and outriggers, a red sail out at sea
const jukung = (x, y, s = 1, col = "#3E7AB0") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -2 q30 10 60 0 l6 -8 q-36 6 -72 0z" style="fill:#FFFDF6;stroke:#2F2B28" stroke-width=".8"/><path d="M-28 -3 q28 7 56 0" style="stroke:${col}" stroke-width="2"/><path d="M-33 -10 q2 -6 6 -8 M33 -10 q-2 -6 -6 -8" fill="none" style="stroke:#2F2B28" stroke-width="1.6"/><ellipse cx="-24" cy="-6" rx="3" ry="2" style="fill:#FFFDF6;stroke:#2F2B28" stroke-width=".6"/><circle cx="-24" cy="-6" r="1" style="fill:#2F2B28"/>
  <path d="M-16 -8 l-4 -10 M16 -8 l4 -10" style="stroke:#6B5444" stroke-width="1.2"/><path d="M-30 -18 h60" style="stroke:#6B5444" stroke-width="1.2"/><path d="M-36 -18 h72" style="stroke:#8A7A5E" stroke-width="1.6" opacity=".8"/></g>`;
const beachView = (x, y, w, h) => clip(x, y, w, h, `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${P.sky}"/><rect x="${x}" y="${y + h*.42}" width="${w}" height="${h*.3}" style="fill:${P.sea}"/>${Array.from({length: 5}, (_, k) => `<path d="M${x + 8 + k*44} ${f1(y + h*(.5 + (k % 3)*.06))} q5 -3 10 0 q5 3 10 0" fill="none" style="stroke:${P.sea2}" stroke-width="1.3"/>`).join("")}
  <path d="M${x} ${y + h*.72} q${w*.5} -8 ${w} 0 V${y + h} H${x}z" style="fill:#EAD7A8"/><path d="M${x} ${y + h*.72} q${w*.5} -8 ${w} 0" fill="none" style="stroke:#F7F1E2" stroke-width="2.4"/>
  <path d="M${x + w*.62} ${y + h*.4} l10 -26 l12 26z" style="fill:#D9433A"/><path d="M${x + w*.6} ${y + h*.41} h28" style="stroke:#FFFDF6" stroke-width="2"/>
  ${jukung(x + w*.3, y + h*.86, .9)}${jukung(x + w*.78, y + h*.92, .7, "#D9433A")}${palm(x + w - 4, y + h*.9, h*.8, -18, .9)}
  <path d="M${x + 30} ${y + 20} q3 -3 6 0 q3 -3 6 0 M${x + 60} ${y + 30} q2 -2 4 0 q2 -2 4 0" fill="none" style="stroke:#3A3430" stroke-width="1"/>`);
// a dish from the cabinet: a bowl with rice, tempeh, chicken, greens, egg, sambal, peanuts
const dish = (x, y, kind) => { const fill = {rice: "#FFFDF6", tempeh: "#C9964A", chicken: "#B8622A", greens: "#4E8A3A", egg: "#F3C94A", sambal: "#C9332A", nuts: "#B87A3A", fish: "#D98A4A"}[kind];
  return `<ellipse cx="${x}" cy="${y}" rx="12" ry="3.2" style="fill:#F3EEE6;stroke:#9AA6AE" stroke-width=".6"/>${kind === "egg" ? `<ellipse cx="${x - 4}" cy="${y - 2}" rx="4" ry="3" style="fill:#FFFDF6"/><circle cx="${x - 4}" cy="${y - 2}" r="1.6" style="fill:#F3B23A"/><ellipse cx="${x + 4}" cy="${y - 2}" rx="4" ry="3" style="fill:#FFFDF6"/><circle cx="${x + 4}" cy="${y - 2}" r="1.6" style="fill:#F3B23A"/>`
    : kind === "rice" ? `<path d="M${x - 8} ${y - 1} q8 -9 16 0z" style="fill:#FFFDF6"/><path d="M${x - 6} ${y - 1} q6 -7 12 0" fill="none" style="stroke:#E8E2D4" stroke-width=".6"/>`
    : Array.from({length: 7}, (_, k) => `<ellipse cx="${f1(x - 8 + k*2.6)}" cy="${f1(y - 2 - R(k + x)*2.4)}" rx="${kind === "nuts" ? 1.2 : 2.6}" ry="${kind === "nuts" ? 1 : 1.8}" style="fill:${fill}"/>`).join("")}`; };
const coconut = (x, y, s = 1, straw = false) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><ellipse rx="11" ry="10" style="fill:#7FA83A;stroke:#4E6E2A" stroke-width=".8"/><path d="M-7 -4 q4 -4 9 -3" fill="none" style="stroke:#B8D46A" stroke-width="1.6"/>${straw ? `<path d="M-3 -9 h7 l-1 -3 h-5z" style="fill:#F3EEE6"/><path d="M1 -11 l4 -12 l4 -2" fill="none" style="stroke:#E8566C" stroke-width="1.6"/>` : ""}</g>`;
function warungRoom(){
  // woven bamboo on the left, the open side to the beach on the right, the thatch over all
  const wall = weaveDefs() + g(`${weave(0, 30, 312, 170)}<rect x="300" y="30" width="220" height="170" style="fill:${P.sky}"/>`)
    + g(beachView(306, 40, 214, 140))
    + g(sk(`<rect x="306" y="176" width="214" height="24" style="fill:${P.paras}"/>${parasBand(306, 176, 214, 10)}`, `<rect x="306" y="176" width="214" height="24"/>`))
    + thatchTop(30) + g(bambooBeam(0, 30, 520, 11)) + g(post(306, 40, 200, 11) + post(412, 40, 178, 9) + post(514, 40, 200, 11))
    // the painted sign
    + g(sk(`<rect x="20" y="48" width="178" height="24" rx="3" style="fill:#2E7A5A"/><rect x="24" y="52" width="170" height="16" rx="2" fill="none" style="stroke:#F3C94A" stroke-width="1"/>`, `<rect x="20" y="48" width="178" height="24" rx="3"/>`) + txt(109, 65, "WARUNG NYOMAN", 11, "#F6E3B4", 700))
    // the menu board
    + g(sk(`<rect x="22" y="80" width="104" height="94" rx="2" style="fill:#2F3A34"/><rect x="22" y="80" width="104" height="94" rx="2" fill="none" style="stroke:${P.teak}" stroke-width="4"/>`, `<rect x="22" y="80" width="104" height="94" rx="2"/>`)
      + txt(74, 95, "MENU", 9, "#F3D98A", 700) + ["Nasi campur", "Mie goreng", "Sate lilit", "Gado-gado", "Es kelapa muda", "Fresh juices"].map((t, i) => txt(74, 109 + i*11.5, t, 7.6, i === 4 ? "#B9E08A" : "#E8EEE6")).join(""))
    // the Balinese calendar, full of little coloured days
    + g(sk(`<rect x="136" y="82" width="52" height="68" style="fill:#FFFDF6"/><rect x="136" y="82" width="52" height="16" style="fill:#C9332A"/>${Array.from({length: 35}, (_, k) => `<rect x="${139 + (k % 7)*7}" y="${102 + Math.floor(k/7)*9}" width="5.4" height="7" style="fill:${[16, 22].includes(k) ? "#C9332A" : k % 5 === 0 ? "#F3D98A" : "#EFE8DA"}"/>`).join("")}<path d="M162 76 v6" style="stroke:#3A3430" stroke-width="1.2"/>`, `<rect x="136" y="82" width="52" height="68"/>`) + txt(162, 94, "KALENDER", 6.4, "#FFFDF6", 700))
    // the little wall shrine (plangkiran) with today's offering
    + g(sk(`<path d="M210 104 h56 l-6 10 h-44z" style="fill:${P.teak}"/><path d="M214 104 v-26 q24 -14 48 0 v26" style="fill:${P.red}"/><path d="M220 78 q18 -10 36 0" fill="none" style="stroke:${P.gold}" stroke-width="2"/><rect x="214" y="96" width="48" height="5" style="fill:#F3C94A"/>`, `<path d="M210 104 h56 l-6 10 h-44z"/><path d="M214 104 v-26 q24 -14 48 0 v26"/>`) + canang(238, 104, 1.1, true))
    // a shelf of jars of krupuk and bottles of sambal
    + g(sk(`<rect x="200" y="152" width="96" height="5" style="fill:${P.teak}"/>${[[212, "#F3E2B4"], [234, "#F6C9A4"], [256, "#F3E2B4"]].map(([x, c]) => `<rect x="${x - 9}" y="126" width="18" height="26" rx="3" style="fill:#E8F1F0" opacity=".9"/>${Array.from({length: 5}, (_, k) => `<ellipse cx="${x - 4 + (k % 2)*7}" cy="${132 + k*4}" rx="4" ry="2.2" style="fill:${c}"/>`).join("")}<rect x="${x - 10}" y="122" width="20" height="5" rx="1" style="fill:#C9332A"/>`).join("")}${[274, 286].map(x => `<rect x="${x - 4}" y="134" width="8" height="18" rx="2" style="fill:#B8332A"/><rect x="${x - 2}" y="128" width="4" height="6" style="fill:#3A3430"/>`).join("")}`, `<rect x="200" y="152" width="96" height="5"/>`))
    + lamp(150, 186, 41) + lamp(296, 192, 41);
  // the cooler of fresh juices: a glass-fronted fridge, big jars on top with mango, watermelon, avocado and lime
  const cooler = g(sk(`<rect x="22" y="200" width="78" height="118" rx="4" style="fill:#3E8AB0"/><rect x="30" y="214" width="62" height="86" rx="2" style="fill:#D8EEF0"/>${[0, 1, 2].map(r => `<path d="M30 ${242 + r*28} h62" style="stroke:#9ABCC6" stroke-width="1.4"/>${[0, 1, 2, 3].map(k => `<rect x="${34 + k*14}" y="${222 + r*28}" width="9" height="20" rx="2" style="fill:${["#F3A23A", "#E8566C", "#9CC45A", "#F3D34A"][(k + r) % 4]}"/><rect x="${35 + k*14}" y="${219 + r*28}" width="7" height="4" style="fill:#3A3430"/>`).join("")}`).join("")}<rect x="22" y="204" width="78" height="9" style="fill:#2E6E92"/><path d="M92 238 v34" style="stroke:#E8F1F0" stroke-width="3" stroke-linecap="round"/>
      ${[[36, "#F3A23A"], [60, "#E8566C"], [84, "#B9D46A"]].map(([x, c]) => `<rect x="${x - 10}" y="178" width="20" height="26" rx="4" style="fill:${c}" opacity=".85"/><rect x="${x - 10}" y="178" width="20" height="26" rx="4" fill="none" style="stroke:#E8F1F0" stroke-width="1.4"/><rect x="${x - 7}" y="174" width="14" height="5" rx="1" style="fill:#5A5550"/>`).join("")}`,
      `<rect x="22" y="200" width="78" height="118" rx="4"/><rect x="30" y="214" width="62" height="86" rx="2"/>`) + txt(61, 211, "JUS SEGAR", 6.6, "#FFFDF6", 700));
  // the counter: Nyoman's glass cabinet of nasi campur dishes (the blue-framed etalase), a rice basket, the krupuk tin, magnets
  const counter = spot("ba_warung", 230, 382, "Nyoman's warung counter", hovE(230, 364, 112, 15),
    sk(`<rect x="122" y="294" width="218" height="50" style="fill:${P.teak}"/>${weave(130, 300, 202, 38)}<rect x="118" y="286" width="226" height="10" rx="2" style="fill:${P.teak2}"/>
      <rect x="132" y="224" width="124" height="62" style="fill:#E8F4F2" opacity=".9"/><rect x="132" y="224" width="124" height="62" fill="none" style="stroke:#2E6EB0" stroke-width="4"/><path d="M132 255 h124 M194 224 v62" style="stroke:#2E6EB0" stroke-width="2.4"/><rect x="128" y="218" width="132" height="8" rx="2" style="fill:#2E6EB0"/>
      ${dish(149, 249, "rice")}${dish(176, 249, "chicken")}${dish(212, 249, "tempeh")}${dish(238, 249, "greens")}${dish(149, 280, "egg")}${dish(176, 280, "sambal")}${dish(212, 280, "fish")}${dish(238, 280, "nuts")}
      <path d="M272 286 l-4 -26 h40 l-4 26z" style="fill:#C9A26A"/>${Array.from({length: 5}, (_, k) => `<path d="M${270 + k*8} 262 l-2 22" style="stroke:#8A6A3A" stroke-width=".8"/>`).join("")}<path d="M270 262 q18 -12 36 0z" style="fill:#FFFDF6"/><path d="M286 252 q2 -6 0 -10" fill="none" style="stroke:#FFFFFF" stroke-width="1" opacity=".7"/>
      <rect x="312" y="246" width="24" height="40" rx="2" style="fill:#D9DDE0"/><rect x="316" y="256" width="16" height="20" style="fill:#F3E2B4"/>${[0, 1, 2].map(k => `<ellipse cx="324" cy="${260 + k*6}" rx="6" ry="2.4" style="fill:#F6E7C8"/>`).join("")}<rect x="310" y="242" width="28" height="6" rx="1" style="fill:#C9332A"/>`,
      `<rect x="122" y="294" width="218" height="50"/><rect x="118" y="286" width="226" height="10" rx="2"/><rect x="132" y="224" width="124" height="62"/><path d="M272 286 l-4 -26 h40 l-4 26z"/><rect x="312" y="246" width="24" height="40" rx="2"/>`)
    + txt(324, 268, "KRUPUK", 4.6, "#8A3A2A", 700) + txt(194, 236, "NASI CAMPUR", 6.4, "#2E4A6E", 700)
    // a little card of fridge magnets propped on the counter
    + sk(`<rect x="262" y="276" width="0" height="0"/>`, ``)
    + lab(230, 364, "Nasi campur", "#F6E3B4", 10));
  // the sea-view table by the open side: a low table, two stools, a coconut with a straw and a glass of juice
  const seaview = spot("baseaview", 432, 362, "A table looking out at the sea", hovE(432, 346, 60, 12),
    g(sk(`<rect x="386" y="276" width="92" height="9" rx="2" style="fill:${P.teak}"/><path d="M394 285 v34 M470 285 v34" style="stroke:${P.teak2}" stroke-width="4"/>`, `<rect x="386" y="276" width="92" height="9" rx="2"/>`)
      + coconut(410, 268, .9, true) + `<rect x="444" y="258" width="12" height="18" rx="2" style="fill:#F3A23A" opacity=".9"/><path d="M452 258 l4 -10" style="stroke:#3E8A5A" stroke-width="1.4"/>` + frangi(466, 272, .9)
      + stool(380, 330, P.bamboo2) + stool(486, 330, P.bamboo2))
    + lab(432, 346, "Sea view table", "#CFE0EE", 9));
  // the coconut heap on the left, green young coconuts, a couple opened with straws
  const coconuts = g(sk(`<path d="M22 444 q46 -10 92 0" fill="none" style="stroke:#C9A26A" stroke-width="2"/>`, ``) + [[36, 434], [60, 436], [84, 434], [104, 438], [48, 416], [72, 416], [94, 418], [60, 398], [82, 400], [70, 382]].map(([x, y], k) => coconut(x, y, 1, k === 9)).join("")
    + `<path d="M40 444 q-2 -6 2 -10" fill="none" style="stroke:#4E6E2A" stroke-width="1"/>`);
  // low tables on woven mats at the front, cushions, a bowl of frangipani; plants at the open side
  const matTable = (x0, x1, extra) => sk(`<path d="M${x0} 596 l10 -94 h${x1 - x0 - 20} l10 94z" style="fill:#D9BE86"/>${Array.from({length: 9}, (_, k) => `<path d="M${x0 + 6 + k*(x1 - x0 - 12)/8} 594 l${(k - 4)*1.2} -90" style="stroke:#B89A5E" stroke-width="1.2"/>`).join("")}${Array.from({length: 7}, (_, k) => `<path d="M${x0 + 8 - k*.4} ${510 + k*13} H${x1 - 8 + k*.4}" style="stroke:#C4A66E" stroke-width="1"/>`).join("")}
    <rect x="${x0 + 26}" y="530" width="${x1 - x0 - 52}" height="10" rx="2" style="fill:${P.teak}"/><path d="M${x0 + 34} 540 v22 M${x1 - 34} 540 v22" style="stroke:${P.teak2}" stroke-width="5"/>
    <rect x="${x0 + 10}" y="566" width="34" height="16" rx="6" style="fill:#C9483A"/><rect x="${x1 - 44}" y="566" width="34" height="16" rx="6" style="fill:#3E7AB0"/>${extra}`,
    `<path d="M${x0} 596 l10 -94 h${x1 - x0 - 20} l10 94z"/><rect x="${x0 + 26}" y="530" width="${x1 - x0 - 52}" height="10" rx="2"/>`);
  const front = g(matTable(24, 200, `${dish(80, 530, "rice")}${dish(112, 530, "chicken")}<rect x="138" y="516" width="10" height="14" rx="2" style="fill:#E8566C" opacity=".85"/><rect x="152" y="518" width="10" height="12" rx="2" style="fill:#F3A23A" opacity=".85"/>`)
    + matTable(326, 500, `<path d="M396 530 q17 -14 34 0z" style="fill:#C47A55"/><ellipse cx="413" cy="522" rx="16" ry="4" style="fill:#7FB0C0"/>${[[402, 520], [410, 516], [419, 519], [426, 522], [414, 524]].map(([x, y]) => frangi(x, y, .9)).join("")}${coconut(366, 522, .8, true)}${coconut(460, 524, .7)}`))
    + g(plant(488, 470) + plant(488, 254));
  return tiles(200, ["#C98A62", "#C07E58", "#CE946C", "#BC7A54"], "#9A5E40", 52, 40) + kerb() + wall + cooler + counter + seaview + coconuts + front + step() + exit("#2E7A5A");
}
const stool = (x, y, col = P.teak) => sk(`<ellipse cx="${x}" cy="${y - 20}" rx="11" ry="4.2" style="fill:${col}"/><path d="M${x - 7} ${y - 18} l-3 18 M${x + 7} ${y - 18} l3 18 M${x} ${y - 17} v17" style="stroke:${P.teak2}" stroke-width="2.2"/>`, `<ellipse cx="${x}" cy="${y - 20}" rx="11" ry="4.2"/>`);
// a plant in a terracotta pot: a frangipani sapling with white flowers, or broad leaves
const plant = (x, y, flowers = true) => g(sk(`${[[-12, -26], [-4, -36], [6, -32], [13, -22], [0, -24]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y - 18 + dy*.5}" rx="5" ry="12" transform="rotate(${dx*3} ${x + dx} ${y - 18 + dy*.5})" style="fill:#4E8A44"/>`).join("")}${flowers ? [[-8, -40], [4, -46], [11, -36]].map(([dx, dy]) => frangi(x + dx, y + dy, .8)).join("") : ""}<path d="M${x - 12} ${y - 18} h24 l-3 18 h-18z" style="fill:${P.terra}"/><path d="M${x - 13} ${y - 18} h26" style="stroke:#9A5A3E" stroke-width="3"/>`, `<path d="M${x - 12} ${y - 18} h24 l-3 18 h-18z"/>`));

/* ---------- Ibu Wayan's offerings house ---------- */
// a family shrine (sanggah): a carved paras base wrapped in yellow and white cloth, a little red-and-gold house, black ijuk roof
const shrine = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${sk(`<path d="M-28 0 h56 l-4 -12 h-48z" style="fill:${P.paras2}"/><rect x="-22" y="-74" width="44" height="62" style="fill:${P.paras}"/>${[-62, -40].map(yy => `<path d="M-22 ${yy} h44" style="stroke:${P.paras2}" stroke-width="1.4"/>`).join("")}<path d="M-14 -56 q14 -12 28 0 M-10 -30 q10 -8 20 0" fill="none" style="stroke:${P.paras2}" stroke-width="1.4"/>
  <rect x="-23" y="-50" width="46" height="9" style="fill:#F3C94A"/><rect x="-23" y="-41" width="46" height="5" style="fill:#FFFDF6"/><path d="M-6 -41 l-3 14 l9 -6 l9 6 l-3 -14" style="fill:#F3C94A"/>
  <rect x="-26" y="-80" width="52" height="7" style="fill:${P.paras2}"/><rect x="-17" y="-108" width="34" height="28" style="fill:${P.red}"/><rect x="-10" y="-104" width="20" height="22" style="fill:${P.gold}"/><path d="M0 -104 v22" style="stroke:${P.red2}" stroke-width="1.2"/><circle cx="-3" cy="-92" r="1.3" style="fill:${P.red2}"/><circle cx="3" cy="-92" r="1.3" style="fill:${P.red2}"/>
  <path d="M-30 -106 l30 -26 l30 26z" style="fill:${P.ijuk}"/><path d="M-22 -126 l22 -20 l22 20" style="fill:#3E3A36"/><path d="M-30 -106 h60" style="stroke:#1E1A18" stroke-width="2"/><path d="M0 -146 v-8" style="stroke:${P.gold}" stroke-width="2.4"/><circle cx="0" cy="-156" r="2.6" style="fill:${P.gold}"/>
  ${Array.from({length: 10}, (_, k) => `<path d="M${-27 + k*6} -106 l2 -10" style="stroke:#4A4440" stroke-width=".8"/>`).join("")}`,
  `<path d="M-28 0 h56 l-4 -12 h-48z"/><rect x="-22" y="-74" width="44" height="62"/><rect x="-17" y="-108" width="34" height="28"/><path d="M-30 -106 l30 -26 l30 26z"/>`)}${canang(-10, -80, .9)}${canang(10, -80, .9, true)}${canang(0, -12, .9)}</g>`;
// a round woven basket heaped with flowers of one colour
const flowerBasket = (x, y, w, col, kind, seed) => sk(`<path d="M${x - w/2} ${y - 26} q${w/2} 8 ${w} 0 l-5 26 h${-w + 10}z" style="fill:#C9A26A"/>${Array.from({length: 4}, (_, k) => `<path d="M${x - w/2 + 2 + k*1.2} ${y - 20 + k*6} h${w - 4 - k*2.4}" style="stroke:#9A7A4A" stroke-width="1"/>`).join("")}${Array.from({length: 9}, (_, k) => `<path d="M${x - w/2 + 6 + k*(w - 12)/8} ${y - 24} v24" style="stroke:#A8844E" stroke-width=".8"/>`).join("")}
  <ellipse cx="${x}" cy="${y - 26}" rx="${w/2}" ry="7" style="fill:#A8844E"/>${Array.from({length: 13}, (_, i) => { const dx = (R(i*5 + seed) - .5)*w*.85, dy = -27 - R(i*7 + seed)*8 + Math.abs(dx)*.12;
    return kind === "frangi" ? frangi(x + dx, y + dy, .85) : kind === "hib" ? hibiscus(x + dx, y + dy, .8) : `<circle cx="${f1(x + dx)}" cy="${f1(y + dy)}" r="4" style="fill:${col}"/><circle cx="${f1(x + dx - 1)}" cy="${f1(y + dy - 1)}" r="1.6" style="fill:#FFFDF6" opacity=".35"/>`; }).join("")}`,
  `<path d="M${x - w/2} ${y - 26} q${w/2} 8 ${w} 0 l-5 26 h${-w + 10}z"/>`);
// a bundle of long young palm leaves (janur), tied
const janurBundle = (x, y, h, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})">${Array.from({length: 7}, (_, k) => `<path d="M${x - 9 + k*3} ${y} q${(k - 3)*2} ${-h*.5} ${(k - 3)*4} ${-h}" fill="none" style="stroke:${k % 2 ? P.janur : "#D1C878"}" stroke-width="4"/>`).join("")}<path d="M${x - 10} ${y - h*.3} h20" style="stroke:#8A6A3A" stroke-width="2.4"/></g>`;
function offerRoom(){
  // the pavilion: red brick and carved paras, the thatch above, the courtyard beyond the gap on the right
  const wall = g(`${brickWall(0, 30, 520, 170)}${parasBand(0, 60, 520, 12)}${parasBand(0, 176, 520, 12)}`)
    + g(garden(388, 74, 132, 100, {palms: [[100, 92, 8]], banana: true}))
    + thatchTop(28) + g(beam(0, 28, 520, 16)) + g(column(10, 44, 200, 14) + column(384, 44, 200, 12) + column(510, 44, 200, 14))
    // the long rack of finished canang on three shelves
    + g(sk(`<rect x="134" y="78" width="228" height="120" style="fill:${P.teak2}"/>${[112, 150, 188].map(y => `<rect x="130" y="${y}" width="236" height="6" style="fill:${P.teak}"/>`).join("")}<path d="M134 78 v120 M362 78 v120" style="stroke:${P.teak}" stroke-width="4"/>`, `<rect x="134" y="78" width="228" height="120"/>`)
      + [112, 150, 188].map((y, r) => Array.from({length: 11}, (_, k) => r === 1 && k % 4 === 1 ? `<path d="M${142 + k*20} ${y} l3 -14 h10 l3 14z" style="fill:${P.janur};stroke:${P.janur2}" stroke-width=".7"/><circle cx="${150 + k*20}" cy="${y - 16}" r="3" style="fill:#E8823A"/>` : canangS(150 + k*20 + (r % 2)*3, y, 1.05)).join("")).join("")
      + lamak(146, 44, 30, 12) + lamak(350, 44, 30, 12))
    // left of it: palm leaves hanging on a bamboo rail to keep them fresh
    + g(sk(`<path d="M28 82 h92" style="stroke:${P.bamboo2}" stroke-width="5" stroke-linecap="round"/>`, `<path d="M28 82 h92"/>`) + Array.from({length: 7}, (_, k) => `<path d="M${34 + k*13} 82 q${(k % 2 ? 3 : -3)} 50 ${(k % 3) - 1} ${100 + (k % 3)*12}" fill="none" style="stroke:${k % 2 ? P.janur : "#D1C878"}" stroke-width="5"/>`).join("") + lamp(260, 64, 44))
    + lamp(76, 210, 44);
  // the family shrine in the corner, a frangipani over it, a yellow umbrella
  const corner = g(shrine(450, 262, 1.22) + tedung(502, 262, 130, "#FFFDF6", "#F3C94A"));
  // a stack of round bamboo trays of offerings ready to go out
  const trays = g(sk(`${[0, 1, 2].map(k => `<ellipse cx="66" cy="${514 - k*10}" rx="${40 - k*3}" ry="8" style="fill:${k % 2 ? "#C9A26A" : "#B8925A"}"/><path d="M${28 + k*3} ${512 - k*10} q${38 - k*3} 10 ${76 - k*6} 0" fill="none" style="stroke:#8A6A3A" stroke-width="1"/>`).join("")}`, `<ellipse cx="66" cy="514" rx="40" ry="8"/>`)
    + [44, 58, 72, 86].map((x, k) => canangS(x, 494 - (k % 2), .9)).join(""));
  // the shop: a low table in front of the rack, trays of finished canang, a fruit-and-cake tower (gebogan), the price slate
  const shop = spot("ba_offer", 262, 372, "Ibu Wayan's finished offerings", hovE(262, 356, 108, 14),
    sk(`<rect x="160" y="292" width="204" height="9" rx="2" style="fill:${P.teak}"/><rect x="166" y="301" width="192" height="38" style="fill:${P.teak2}"/>${[0, 1, 2, 3].map(k => `<rect x="${176 + k*46}" y="307" width="34" height="26" rx="2" style="fill:${P.red}"/><rect x="${180 + k*46}" y="311" width="26" height="18" rx="1" fill="none" style="stroke:${P.gold}" stroke-width="1.4"/>`).join("")}
      ${[188, 236].map(x => `<rect x="${x - 22}" y="286" width="44" height="6" rx="2" style="fill:#C9A26A"/>`).join("")}
      <path d="M318 292 l-8 -6 h26 l-8 6z" style="fill:${P.gold}"/><rect x="318" y="282" width="8" height="6" style="fill:${P.gold}"/><path d="M304 284 q18 -60 36 0z" style="fill:#7FA83A"/>${Array.from({length: 18}, (_, k) => { const r = Math.floor(k/4), c = k % 4; return `<circle cx="${f1(312 + c*6 + r*1.2 - r*.3 + (r % 2)*2)}" cy="${280 - r*9}" r="3.6" style="fill:${["#E8823A", "#C9332A", "#F3D34A", "#7A3A5A", "#4E8A3A"][(k*3) % 5]}"/>`; }).join("")}${frangi(322, 230, 1.2)}`,
      `<rect x="160" y="292" width="204" height="9" rx="2"/><rect x="166" y="301" width="192" height="38"/><path d="M304 284 q18 -60 36 0z"/>`)
    + Array.from({length: 4}, (_, k) => canang(176 + (k % 2)*14 - 2 + (k > 1 ? 0 : 0), 290 - (k > 1 ? 0 : 0), .8)).join("") + Array.from({length: 4}, (_, k) => canang(222 + k*10, 290, .8)).join("")
    + lab(262, 356, "Finished offerings", "#F6E3B4", 10));
  // the mat where the offerings are made: a pandan mat, strips of palm leaf, a half-pinned tray, little heaps of petals
  const mat = spot("bacanang", 104, 454, "Make a canang sari on the mat", hovE(100, 440, 64, 13),
    sk(`<path d="M28 428 l14 -88 h120 l14 88z" style="fill:#D9BE86"/>${Array.from({length: 10}, (_, k) => `<path d="M${36 + k*15} 426 l${(k - 4.5)*1.6} -84" style="stroke:#B89A5E" stroke-width="1"/>`).join("")}${Array.from({length: 6}, (_, k) => `<path d="M${40 - k*2} ${352 + k*14} H${166 + k*2}" style="stroke:#C4A66E" stroke-width="1"/>`).join("")}<path d="M28 428 l14 -88 h120 l14 88z" fill="none" style="stroke:#9A2E2A" stroke-width="3"/>
      ${Array.from({length: 6}, (_, k) => `<path d="M${52 + k*5} 364 l${30 + k*2} -6" style="stroke:${k % 2 ? P.janur : "#C9C070"}" stroke-width="3" stroke-linecap="round"/>`).join("")}
      <path d="M100 400 l3 -10 h28 l3 10z" style="fill:${P.janur};stroke:${P.janur2}" stroke-width=".8"/><path d="M106 390 v-8 M128 390 v-8" style="stroke:${P.janur2}" stroke-width="1.4"/>
      ${[[60, 404, "#FFFDF6"], [76, 410, "#D9433A"], [140, 372, "#F3C94A"], [150, 388, "#7E5AB0"]].map(([x, y, c]) => Array.from({length: 6}, (_, k) => `<circle cx="${f1(x + (R(k + x) - .5)*12)}" cy="${f1(y + (R(k*3 + x) - .5)*6)}" r="2.6" style="fill:${c}"/>`).join("")).join("")}
      <path d="M148 410 l10 -2" style="stroke:#8A6A3A" stroke-width="1"/>${Array.from({length: 5}, (_, k) => `<path d="M${144 + k*2} 414 l8 -1" style="stroke:#C9A26A" stroke-width=".8"/>`).join("")}`,
      `<path d="M28 428 l14 -88 h120 l14 88z"/><path d="M100 400 l3 -10 h28 l3 10z"/>`)
    + canang(68, 386, 1.1) + canang(92, 378, 1.1)
    + lab(100, 440, "Make a canang", "#E8F0C8", 9));
  // the incense: a terracotta burner on a little carved stand, sticks smoking, packets of frangipani incense
  const incense = spot("baincense", 448, 392, "The incense", hovE(448, 378, 44, 11),
    sk(`<rect x="416" y="332" width="64" height="8" rx="2" style="fill:${P.red}"/><path d="M422 340 v22 M474 340 v22" style="stroke:${P.red2}" stroke-width="4"/><path d="M420 336 h56" style="stroke:${P.gold}" stroke-width="1.6"/>
      <path d="M432 332 q-2 -16 12 -18 q14 2 12 18z" style="fill:${P.terra}"/><path d="M432 320 h24" style="stroke:#9A5A3E" stroke-width="2"/>
      ${[-8, -3, 2, 7].map((d, k) => `<path d="M${444 + d*.3} 316 l${d*.8} -20" style="stroke:#7A4A2A" stroke-width="1"/><circle cx="${444 + d*1.1}" cy="${295}" r="1.1" style="fill:#E8823A"/>`).join("")}
      ${[0, 1].map(k => `<rect x="${462 + k*8}" y="${316 - k*2}" width="6" height="16" style="fill:${k ? "#F6E7DC" : "#E8C27A"}"/>`).join("")}`,
      `<rect x="416" y="332" width="64" height="8" rx="2"/><path d="M432 332 q-2 -16 12 -18 q14 2 12 18z"/>`)
    + `<path d="M440 292 q-6 -12 2 -22 q8 -10 -2 -22 q-6 -8 2 -16 M450 292 q8 -10 0 -20 q-6 -12 4 -20" fill="none" style="stroke:#D8D4CC" stroke-width="1.6" opacity=".75"/>`
    + lab(448, 378, "Incense", "#E8E0F0", 9));
  // the front: the baskets of flowers by colour; palm leaves, banana leaves and a frangipani in a pot
  const front = g(flowerBasket(50, 588, 52, "", "frangi", 3) + flowerBasket(104, 590, 50, "", "hib", 5) + flowerBasket(156, 588, 50, "#F3A23A", "", 7) + flowerBasket(206, 590, 44, "#7E5AB0", "", 9)
      + [[60, 530, "#FFFDF6"], [116, 528, "#D9433A"], [164, 534, "#F3B23A"]].map(([x, y, c]) => "").join(""))
    + g(sk(`<path d="M336 596 q4 -20 30 -22 h80 q26 2 30 22z" style="fill:#4E8A3A"/><path d="M344 590 q60 -24 126 0" fill="none" style="stroke:#3E6E2A" stroke-width="1.4"/>${Array.from({length: 8}, (_, k) => `<path d="M${360 + k*14} 576 l-6 16" style="stroke:#3E6E2A" stroke-width="1"/>`).join("")}`, `<path d="M336 596 q4 -20 30 -22 h80 q26 2 30 22z"/>`)
      + janurBundle(372, 574, 62, -20) + janurBundle(398, 576, 70, -6) + janurBundle(424, 574, 60, 10))
    + plant(488, 596) + plant(488, 472, false)
    + g(canang(244, 594, 1.2, true) + canang(312, 590, 1.1));
  return tiles(200, ["#BDB6A6", "#B4AD9C", "#C6BFAF", "#ACA594"], "#8E8778", 64, 46) + kerb() + wall + corner + shop + mat + incense + trays + front + step() + exit("#7E2A22");
}

/* ---------- the gamelan pavilion ---------- */
// a gangsa: a row of bronze keys over a carved red trough painted with gold leaf, gold flame-scrolls rising at each end
const gangsa = (x, y, w, n = 10, big = false) => { const H = big ? 32 : 27, top = y - 9 - H, x0 = x - w/2, x1 = x + w/2, kw = (w - 30)/n;
  const keys = Array.from({length: n}, (_, k) => { const kx = x0 + 15 + k*kw, kh = 14 - k*.4; return `<path d="M${f1(kx + 1)} ${f1(top - 2)} l1.4 ${f1(-kh)} h${f1(kw - 3.6)} l1.4 ${f1(kh)}z" style="fill:${k % 2 ? "#E0B252" : "#EEC66A"};stroke:#6E4A1E" stroke-width=".6"/><path d="M${f1(kx + 2.6)} ${f1(top - kh + .4)} h${f1(kw - 4.6)}" style="stroke:#F6E0A0" stroke-width="1.1"/>`; }).join("");
  const end = d => { const ex = d < 0 ? x0 + 5 : x1 - 5; return `<rect x="${ex - 5}" y="${top - 16}" width="10" height="${H + 16}" style="fill:${P.red2}"/><path d="M${ex - 5} ${top - 12} h10 M${ex - 5} ${top + H - 6} h10" style="stroke:${P.gold}" stroke-width="1.6"/>
    <path d="M${ex} ${top - 15} v-8 q0 -12 ${d*9} -12 q${d*7} 0 ${d*7} 7 q0 6 ${d*-6} 6 q${d*-4} 0 ${d*-4} -4" fill="none" style="stroke:${P.gold}" stroke-width="3.6" stroke-linecap="round"/><path d="M${ex} ${top - 20} q${d*-8} -2 ${d*-8} -12 q${d*6} 2 ${d*8} 8z" style="fill:${P.gold}"/><circle cx="${ex}" cy="${top - 14}" r="2.6" style="fill:${P.goldL}"/>`; };
  return sk(`<path d="M${x0} ${top} h${w} l-4 ${H} h${-w + 8}z" style="fill:${P.red}"/><path d="M${x0 + 4} ${top + 3} h${w - 8} l-3 ${H - 6} h${-w + 14}z" fill="none" style="stroke:${P.gold}" stroke-width="1.8"/>
    <circle cx="${x}" cy="${top + H/2}" r="${big ? 7 : 6}" style="fill:${P.gold}"/><circle cx="${x}" cy="${top + H/2}" r="2.6" style="fill:${P.red2}"/>${[-1, 1].map(d => Array.from({length: Math.floor((w/2 - 22)/12)}, (_, k) => { const cx = x + d*(14 + k*12), cy = top + H/2;
      return `<path d="M${cx} ${cy} q${d*3} -7 ${d*9} -5 q${d*-2} 3 ${d*-4} 2 q${d*6} 3 ${d*4} 8 q${d*-5} 1 ${d*-9} -5z" style="fill:${P.gold}"/>`; }).join("")).join("")}
    <path d="M${x0 + 3} ${top} l5 -15 h${w - 16} l5 15z" style="fill:#3E1A14"/>${keys}<path d="M${x0 + 8} ${top - 7} h${w - 16}" style="stroke:#5A3A2A" stroke-width=".7" opacity=".7"/>
    ${end(-1)}${end(1)}<path d="M${x0 + 10} ${y - 9} l-2 9 h9 l2 -9 M${x1 - 10} ${y - 9} l2 9 h-9 l-2 -9" style="fill:${P.red2}"/>
    <path d="M${x - 10} ${top - 9} l16 -7" style="stroke:#8A5A3A" stroke-width="1.8"/><path d="M${x + 4} ${top - 19} l5 7" style="stroke:#5A3A2A" stroke-width="3.4" stroke-linecap="round"/>`,
    `<path d="M${x0} ${top} h${w} l-4 ${H} h${-w + 8}z"/><path d="M${x0 + 3} ${top} l5 -12 h${w - 16} l5 12"/>`); };
// a hanging gong: a dark bronze disc, a raised ring and boss
const gong = (x, y, r) => `<path d="M${x - r*.3} ${y - r - 14} l${r*.3} 14 l${r*.3} -14" fill="none" style="stroke:#4A3428" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r}" style="fill:${P.bronze2}"/><circle cx="${x}" cy="${y}" r="${r*.8}" fill="none" style="stroke:${P.bronzeD}" stroke-width="2.4"/><circle cx="${x}" cy="${y}" r="${r*.62}" fill="none" style="stroke:#A8803A" stroke-width="1"/><circle cx="${x}" cy="${y}" r="${r*.3}" style="fill:${P.bronze}"/><circle cx="${x}" cy="${y}" r="${r*.18}" style="fill:#E8C060"/><path d="M${x - r*.62} ${y - r*.5} q${r*.3} -${r*.3} ${r*.7} -${r*.36}" fill="none" style="stroke:#D9B060" stroke-width="2.2" opacity=".75"/>`;
// a naga head carved on the end of a beam, gold with a red tongue
const naga = (x, y, d = 1) => `<path d="M${x} ${y} q${d*14} -16 ${d*28} -6 q${d*6} 6 ${d*2} 12 q${d*6} 2 ${d*4} 8 q${d*-8} 2 ${d*-14} -4 q${d*-8} 4 ${d*-20} 0z" style="fill:${P.gold}"/><path d="M${x + d*28} ${y + 12} l${d*8} 4 l${d*-2} -6" style="fill:#C9332A"/><circle cx="${x + d*18}" cy="${y - 5}" r="2" style="fill:${P.red2}"/><path d="M${x + d*4} ${y - 4} q${d*-4} -12 ${d*6} -18 q${d*2} 6 ${d*-2} 12" style="fill:${P.gold}"/>`;
// a meru: the tiered black-thatched shrine tower of a temple, seen beyond the pavilion
const meru = (x, y, tiers, w) => `<rect x="${x - w*.2}" y="${y - 22}" width="${w*.4}" height="22" style="fill:${P.paras}"/><rect x="${x - w*.12}" y="${y - 18}" width="${w*.24}" height="14" style="fill:${P.red}"/>${Array.from({length: tiers}, (_, k) => { const ww = w*(1 - k*.11), yy = y - 22 - k*11; return `<path d="M${x - ww/2} ${yy} l${ww*.16} -8 h${ww*.68} l${ww*.16} 8z" style="fill:${P.ijuk}"/><rect x="${x - ww*.2}" y="${yy - 11}" width="${ww*.4}" height="3" style="fill:#8A3A2A"/>`; }).join("")}<path d="M${x} ${y - 22 - tiers*11 + 3} v-10" style="stroke:${P.gold}" stroke-width="2.2"/><circle cx="${x}" cy="${y - 30 - tiers*11}" r="2.2" style="fill:${P.gold}"/>`;
// one half of a split gate (candi bentar): red brick stepping up to a sheer inner face, trimmed in paras
const bentar = (xi, y, h, d) => { const s = [[0, 0], [0, -h]]; let x = 0, yy = -h; for (let k = 0; k < 6; k++) { x += d*-6; s.push([x + d*6, yy]); s.push([x, yy + 4]); yy += h/6 - 2; s.push([x, yy]); } s.push([x - d*6, 0]);
  const pts = s.map(([a, b]) => `${f1(xi + a)},${f1(y + b)}`).join(" "); return `<polygon points="${pts}" style="fill:${P.brick};stroke:${P.paras}" stroke-width="2.4"/><path d="M${xi} ${y - h} v${h}" style="stroke:${P.paras2}" stroke-width="2"/><path d="M${xi + d*-4} ${y - h - 4} l${d*-2} -8 l${d*-2} 8z" style="fill:${P.paras}"/>`; };
function gamelanRoom(){
  // the bale gong: a massive carved beam, a painted cloth (ider-ider) along it, columns, the temple courtyard beyond
  const yard = clip(0, 62, 520, 138, `<rect y="62" width="520" height="138" style="fill:${P.sky}"/>${palm(110, 160, 92, -10, .95)}${palm(470, 160, 86, 10, .9)}${meru(176, 150, 5, 64)}${meru(352, 150, 3, 50)}${meru(440, 150, 9, 60)}
    ${bentar(254, 150, 80, 1)}${bentar(266, 150, 80, -1)}${brickWall(0, 150, 520, 50)}${parasBand(0, 150, 520, 10)}${parasBand(0, 186, 520, 14)}
    ${[200, 320].map(x => `<path d="M${x} 150 v-36 M${x - 6} 116 q6 -10 12 0" style="stroke:${P.bamboo2};fill:#7FA35A" stroke-width="2"/>`).join("")}`);
  const ider = `<rect y="44" width="520" height="18" style="fill:#E8D7B0"/>${Array.from({length: 13}, (_, k) => { const x = 20 + k*40; return `<circle cx="${x}" cy="51" r="3.4" style="fill:${k % 2 ? "#C9832A" : "#3E5A7A"}"/><path d="M${x - 4} 60 l4 -8 l4 8z" style="fill:${k % 3 ? P.red : "#3E5A7A"}"/><path d="M${x - 8} 54 l4 -2 M${x + 8} 54 l-4 -2" style="stroke:#5A3A2A" stroke-width="1"/><path d="M${x + 14} 48 q4 6 0 12" fill="none" style="stroke:#7FA35A" stroke-width="1.6"/>`; }).join("")}<path d="M0 62 ${Array.from({length: 26}, () => `q10 7 20 0`).join(" ")}" style="fill:${P.red}"/><path d="M0 44 h520" style="stroke:${P.gold}" stroke-width="2"/>`;
  const wall = g(yard) + thatchTop(28) + g(beam(0, 28, 520, 16) + ider) + g(column(10, 62, 214, 16) + column(136, 66, 200, 12) + column(384, 66, 200, 12) + column(510, 62, 214, 16))
    + lamak(136, 70, 50, 12) + lamak(384, 70, 50, 12);
  // a pandan mat where the players sit, under the whole orchestra
  const mat = g(sk(`<path d="M156 380 l12 -138 h280 l10 138z" style="fill:#C9A86E"/>${Array.from({length: 14}, (_, k) => `<path d="M${166 + k*21} 378 l${(k - 6.5)*.9} -134" style="stroke:#B08E56" stroke-width="1"/>`).join("")}<path d="M156 380 l12 -138 h280 l10 138z" fill="none" style="stroke:${P.red}" stroke-width="4"/><path d="M162 372 l11 -122 h270 l9 122z" fill="none" style="stroke:${P.gold}" stroke-width="1.2"/>`, `<path d="M156 380 l12 -138 h280 l10 138z"/>`));
  // the gong frame (gayor): carved posts, a crown of gold flames, naga heads, the great gong and the kempur hanging
  const gongs = g(sk(`<rect x="22" y="94" width="12" height="206" style="fill:${P.red}"/><rect x="154" y="94" width="12" height="206" style="fill:${P.red}"/>${[22, 154].map(x => `<rect x="${x}" y="110" width="12" height="4" style="fill:${P.gold}"/><rect x="${x}" y="276" width="12" height="4" style="fill:${P.gold}"/><path d="M${x - 6} 300 h24 l-3 -10 h-18z" style="fill:${P.red2}"/>${[150, 190, 230].map(y => `<path d="M${x + 6} ${y - 6} l4 6 l-4 6 l-4 -6z" style="fill:${P.gold}"/>`).join("")}`).join("")}
      <rect x="14" y="88" width="160" height="12" style="fill:${P.red}"/><path d="M14 90 h160 M14 98 h160" style="stroke:${P.gold}" stroke-width="1.4"/>${Array.from({length: 9}, (_, k) => `<path d="M${22 + k*18} 88 q-4 -10 2 -18 q2 8 8 4 q-2 8 -4 14z" style="fill:${P.gold}"/>`).join("")}<path d="M76 70 q18 -26 36 0z" style="fill:${P.gold}"/><circle cx="94" cy="62" r="5" style="fill:${P.red}"/><circle cx="94" cy="62" r="2.4" style="fill:${P.goldL}"/>`,
    `<rect x="22" y="94" width="12" height="206"/><rect x="154" y="94" width="12" height="206"/><rect x="14" y="88" width="160" height="12"/>`) + naga(14, 94, -1) + naga(174, 94, 1)
    + gong(68, 172, 38) + gong(128, 204, 22)
    + sk(`<path d="M42 300 l26 -44" style="stroke:#8A5A3A" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="70" cy="252" rx="8" ry="6" transform="rotate(-30 70 252)" style="fill:#C9483A"/><path d="M64 250 l10 6" style="stroke:#F3C94A" stroke-width="1.4"/>`, `<path d="M42 300 l26 -44"/>`));
  // the reong: a long carved frame holding a row of little bronze kettle gongs, mallets lying on it
  const reong = g(sk(`<path d="M300 246 h186 l-4 -26 h-178z" style="fill:${P.red}"/><path d="M306 242 h174 l-3 -18 h-168z" fill="none" style="stroke:${P.gold}" stroke-width="1.4"/>${Array.from({length: 12}, (_, k) => `<path d="M${311 + k*14} 222 q7 -13 14 0z" style="fill:${k % 2 ? P.bronze : "#D8AA54"}"/><circle cx="${318 + k*14}" cy="213" r="2.4" style="fill:#E8C060"/>`).join("")}
      <path d="M298 246 q-14 -10 -8 -36 q8 8 12 -2 q6 14 2 38z M488 246 q14 -10 8 -36 q-8 8 -12 -2 q-6 14 -2 38z" style="fill:${P.gold}"/>${[340, 362, 412, 438].map(x => `<path d="M${x} 216 l12 -4" style="stroke:#5A3A2A" stroke-width="2"/>`).join("")}`,
    `<path d="M300 246 h186 l-4 -26 h-178z"/>`));
  // the orchestra: two rows of gangsa, the big ugal in the middle of the back row
  const orchestra = spot("bagong", 300, 444, "Join the gamelan orchestra", hovE(300, 404, 150, 16),
    gangsa(212, 304, 90, 8) + gangsa(306, 304, 98, 9, true) + gangsa(400, 304, 90, 8) + gangsa(212, 368, 90, 7) + gangsa(306, 368, 90, 7) + gangsa(400, 368, 90, 7)
    + lab(300, 404, "Join the gamelan", "#F6E3B4", 10));
  // the kendang: two drums on a low carved stand, rawhide laced in a zigzag
  const drum = (x, y, w, col) => `<path d="M${x - w/2} ${y - 13} q${w/2} -8 ${w} 0 v20 q${-w/2} 8 ${-w} 0z" style="fill:${col}"/><ellipse cx="${x - w/2}" cy="${y - 3}" rx="5" ry="11" style="fill:#E8D7B0"/><ellipse cx="${x + w/2}" cy="${y - 3}" rx="4" ry="9" style="fill:#E8D7B0"/><path d="M${x - w/2 + 2} ${y - 13} ${Array.from({length: 6}, (_, k) => `L${f1(x - w/2 + 6 + k*(w - 8)/6)} ${k % 2 ? y - 14 : y + 7}`).join(" ")}" fill="none" style="stroke:#C9A26A" stroke-width="1.2"/>`;
  const drums = spot("badrum", 86, 432, "The kendang drum", hovE(86, 416, 52, 11),
    sk(`<rect x="34" y="384" width="104" height="10" rx="2" style="fill:${P.red}"/><path d="M34 386 h104" style="stroke:${P.gold}" stroke-width="1.4"/><path d="M40 394 v8 M132 394 v8" style="stroke:${P.red2}" stroke-width="5"/>${drum(84, 376, 76, "#8A4A2A")}${drum(80, 350, 64, "#6E3A22")}`, `<rect x="34" y="384" width="104" height="10" rx="2"/><path d="M46 363 q38 -8 76 0 v20 q-38 8 -76 0z"/>`)
    + lab(86, 416, "Kendang drum", "#F6E3B4", 9));
  // the Legong costume on its stand: the gold headdress crowned with frangipani, the painted gold cloth, the collar, a fan
  const dancer = spot("badancer", 466, 496, "A Legong costume on its stand", hovE(466, 480, 44, 11),
    sk(`<path d="M466 470 v-80" style="stroke:#5A3A2A" stroke-width="3"/><path d="M446 472 h40" style="stroke:#5A3A2A" stroke-width="4"/>
      <path d="M450 372 q16 -8 32 0 l4 64 q-20 8 -40 0z" style="fill:#3E7A5A"/>${Array.from({length: 5}, (_, k) => `<path d="M${452 + k*7} ${380 + (k % 2)*4} q3 20 0 50" fill="none" style="stroke:${P.gold}" stroke-width="1.6"/>`).join("")}
      <path d="M444 372 q22 14 44 0 q-4 14 -22 16 q-18 -2 -22 -16z" style="fill:${P.gold}"/>${[452, 460, 468, 476].map(x => `<circle cx="${x}" cy="378" r="1.6" style="fill:${P.red}"/>`).join("")}
      <path d="M458 388 h16 l-2 56 l-6 8 l-6 -8z" style="fill:#C9483A"/><path d="M460 396 h12 M460 408 h12 M460 420 h12 M460 432 h12" style="stroke:${P.gold}" stroke-width="1.6"/>
      <path d="M458 368 v-8 h16 v8z" style="fill:#5A3A2A"/><path d="M450 362 q16 -44 32 0 q-16 -6 -32 0z" style="fill:${P.gold}"/><path d="M456 352 q10 -18 20 0" fill="none" style="stroke:${P.red}" stroke-width="2"/><circle cx="466" cy="340" r="3" style="fill:${P.red}"/>${[[452, 330], [460, 322], [472, 322], [480, 330], [466, 316]].map(([x, y]) => frangi(x, y, .9)).join("")}
      <path d="M488 400 l14 -10 l4 14z" style="fill:#C9483A"/><path d="M488 400 l14 -10 M488 400 l18 4" style="stroke:${P.gold}" stroke-width="1.2"/>`,
      `<path d="M450 372 q16 -8 32 0 l4 64 q-20 8 -40 0z"/><path d="M450 362 q16 -44 32 0 q-16 -6 -32 0z"/>`)
    + lab(466, 480, "Legong costume", "#F0D8E8", 9));
  // the ceng-ceng: little cymbals on the back of a carved turtle
  const turtle = g(`<g transform="translate(0 -24)">` + sk(`<ellipse cx="78" cy="488" rx="34" ry="14" style="fill:#5E8A5A"/><path d="M52 486 q26 -18 52 0" fill="none" style="stroke:${P.gold}" stroke-width="1.6"/><path d="M110 486 q10 -4 12 4 q-4 6 -12 2z" style="fill:#5E8A5A"/><circle cx="117" cy="487" r="1.4" style="fill:#2F2B28"/>${[60, 96].map(x => `<path d="M${x} 498 l-4 6 M${x + 6} 498 l2 6" style="stroke:#4E7A4A" stroke-width="4"/>`).join("")}
      ${[64, 76, 88].map(x => `<ellipse cx="${x}" cy="476" rx="7" ry="2.6" style="fill:${P.bronze}"/><circle cx="${x}" cy="474" r="1.6" style="fill:#E8C060"/>`).join("")}`, `<ellipse cx="78" cy="488" rx="34" ry="14"/>`) + `</g>`);
  // the front corners: a stone guardian in his poleng sarong with a hibiscus behind his ear, umbrellas, offerings
  const guardian = (x, y) => sk(`<path d="M${x - 24} ${y} h48 l-4 -14 h-40z" style="fill:${P.paras2}"/><path d="M${x - 16} ${y - 14} q-2 -40 16 -44 q18 4 16 44z" style="fill:${P.paras}"/><circle cx="${x}" cy="${y - 66}" r="14" style="fill:${P.paras}"/><path d="M${x - 7} ${y - 68} h4 M${x + 3} ${y - 68} h4 M${x - 5} ${y - 60} q5 4 10 0" style="stroke:#6E6658" stroke-width="1.6"/>
    ${poleng(x - 17, y - 44, 34, 30, 5)}<path d="M${x - 17} ${y - 44} h34" style="stroke:#C9332A" stroke-width="3"/>`, `<path d="M${x - 16} ${y - 14} q-2 -40 16 -44 q18 4 16 44z"/><circle cx="${x}" cy="${y - 66}" r="14"/>`) + hibiscus(x + 14, y - 74, 1);
  const front = g(guardian(48, 594) + tedung(98, 594, 96, "#FFFDF6", "#F3C94A") + canang(74, 590, 1.1, true)
    + guardian(472, 594) + tedung(422, 594, 96, "#F3C94A", "#FFFDF6") + canang(446, 590, 1.1, true)) + turtle;
  return tiles(200, ["#5E5A56", "#56524E", "#66625D", "#4E4A46"], "#3A3734", 64, 46) + kerb() + wall + mat + gongs + reong + orchestra + drums + dancer + front + step() + exit("#7E2A22");
}

/* ---------- Ketut's silver workshop ---------- */
const ring = (x, y, s = 1, stone = "") => `<ellipse cx="${x}" cy="${y}" rx="${3.4*s}" ry="${2.4*s}" fill="none" style="stroke:${P.silver}" stroke-width="${1.4*s}"/>${stone ? `<circle cx="${x}" cy="${y - 2.4*s}" r="${1.5*s}" style="fill:${stone}"/>` : ""}`;
// a filigree piece: a little spiral flower of silver wire
const fili = (x, y, r = 6) => `<g fill="none" style="stroke:${P.silver}" stroke-width=".9">${Array.from({length: 6}, (_, k) => { const a = k*60*Math.PI/180, cx = x + Math.cos(a)*r*.55, cy = y + Math.sin(a)*r*.55; return `<path d="M${f1(cx)} ${f1(cy)} m-${f1(r*.3)} 0 a${f1(r*.3)} ${f1(r*.3)} 0 1 1 ${f1(r*.3)} ${f1(r*.3)}"/>`; }).join("")}<circle cx="${x}" cy="${y}" r="${f1(r*.25)}"/><circle cx="${x}" cy="${y}" r="${r}"/></g>`;
function silverRoom(){
  // a ceiling of woven bamboo, a carved teak beam, panelled walls of carved teak, a garden window with red-and-gold doors
  const wall = weaveDefs("#D9C08A", "#B89A62") + g(`<rect y="30" width="520" height="170" style="fill:#EFE3C8"/>${weave(0, 0, 520, 30)}`)
    + g(`<rect y="140" width="520" height="60" style="fill:${P.teak2}"/>${Array.from({length: 13}, (_, k) => `<rect x="${k*40 + 6}" y="148" width="28" height="44" rx="2" style="fill:${P.teak}"/><path d="M${k*40 + 12} 176 q8 -18 16 0 q-8 8 -16 0z" style="fill:#9A6A48"/>`).join("")}<rect y="138" width="520" height="5" style="fill:${P.gold}"/>`)
    + g(beam(0, 30, 520, 14, P.teak2))
    // the garden window between carved doors folded back
    + g(sk(`<rect x="196" y="54" width="128" height="80" style="fill:${P.teak2}"/>`, `<rect x="196" y="54" width="128" height="80"/>`) + garden(204, 60, 112, 70, {agung: true, palms: [[22, 50, 6], [96, 40, -6]]})
      + sk(`${[[170, 1], [326, -1]].map(([x]) => `<rect x="${x}" y="54" width="24" height="80" style="fill:${P.red}"/><rect x="${x + 4}" y="60" width="16" height="30" style="fill:${P.gold}"/><rect x="${x + 4}" y="96" width="16" height="32" style="fill:${P.gold}"/><path d="M${x + 12} 66 q-6 9 0 18 q6 -9 0 -18z M${x + 12} 104 q-6 9 0 18 q6 -9 0 -18z" style="fill:${P.red}"/>`).join("")}`, `<rect x="170" y="54" width="24" height="80"/><rect x="326" y="54" width="24" height="80"/>`))
    // the sign
    + g(sk(`<rect x="190" y="0" width="0" height="0"/>`, ``))
    // wall cases of silver: framed boards on the left and right of the window
    + g(sk(`<rect x="22" y="64" width="100" height="68" rx="2" style="fill:#2E2A38"/><rect x="22" y="64" width="100" height="68" rx="2" fill="none" style="stroke:${P.gold}" stroke-width="3"/>`, `<rect x="22" y="64" width="100" height="68" rx="2"/>`)
      + Array.from({length: 10}, (_, k) => { const x = 36 + (k % 5)*18, y = 84 + Math.floor(k/5)*28; return k % 3 === 0 ? fili(x, y, 7) : k % 3 === 1 ? `<path d="M${x} ${y - 10} v4" style="stroke:${P.silver}" stroke-width=".8"/><path d="M${x} ${y - 6} l5 8 l-5 8 l-5 -8z" fill="none" style="stroke:${P.silver}" stroke-width="1.2"/><circle cx="${x}" cy="${y + 2}" r="1.6" style="fill:#5EB0AE"/>` : `<circle cx="${x}" cy="${y}" r="8" fill="none" style="stroke:${P.silver}" stroke-width="2"/>`; }).join(""))
    + g(sk(`<rect x="368" y="64" width="130" height="68" rx="2" style="fill:#2E2A38"/><rect x="368" y="64" width="130" height="68" rx="2" fill="none" style="stroke:${P.gold}" stroke-width="3"/>`, `<rect x="368" y="64" width="130" height="68" rx="2"/>`)
      + `<path d="M386 74 q8 20 16 0 q8 22 16 0 q8 22 16 0" fill="none" style="stroke:${P.silver}" stroke-width="1.4"/>${[394, 410, 426].map(x => `<circle cx="${x}" cy="82" r="2" style="fill:${P.silver}"/>`).join("")}` + frangi(462, 76, 1.6, P.silver) + fili(388, 112, 8) + fili(414, 112, 8) + `<path d="M440 124 l10 -22 l10 22z" fill="none" style="stroke:${P.silver}" stroke-width="1.4"/><circle cx="450" cy="110" r="3" style="fill:#5EB0AE"/>` + frangi(480, 112, 1.2, P.silver))
    + g(sk(`<rect x="22" y="47" width="100" height="14" rx="2" style="fill:${P.red}"/><rect x="368" y="47" width="130" height="14" rx="2" style="fill:${P.red}"/>`, `<rect x="22" y="47" width="100" height="14" rx="2"/><rect x="368" y="47" width="130" height="14" rx="2"/>`)) + txt(72, 58, "KETUT SILVER", 8, "#F6E3B4", 700) + txt(433, 58, "SILVER OF CELUK", 8, "#F6E3B4", 700)
    + lamp(130, 186, 44) + lamp(400, 186, 44);
  // the plangkiran: the little house shrine high on the wall over the bench, with today's offering
  const shrineShelf = g(`<g transform="translate(${146 - 56*.72} ${110 - 196*.72}) scale(.72)">` + sk(`<path d="M28 196 h56 l-6 10 h-44z" style="fill:${P.teak}"/><path d="M32 196 v-24 q24 -14 48 0 v24" style="fill:${P.red}"/><path d="M38 174 q18 -10 36 0" fill="none" style="stroke:${P.gold}" stroke-width="2"/><rect x="32" y="188" width="48" height="5" style="fill:#F3C94A"/>`, `<path d="M28 196 h56 l-6 10 h-44z"/>`) + canang(56, 196, 1.1, true) + `</g>`)
    // a little anvil on a tree stump, a bucket of water to quench the silver
    + g(sk(`<path d="M30 452 q-2 -26 4 -34 h40 q6 8 4 34z" style="fill:#8A6A4A"/><ellipse cx="54" cy="418" rx="20" ry="5" style="fill:#B89A72"/><path d="M42 412 h26 l-4 -10 h10 l-2 -6 h-36 l4 6 h6z" style="fill:#5E5A56"/><path d="M36 430 q18 6 36 0" fill="none" style="stroke:#6B5444" stroke-width="1.2"/>`, `<path d="M30 452 q-2 -26 4 -34 h40 q6 8 4 34z"/><path d="M42 412 h26 l-4 -10 h10 l-2 -6 h-36 l4 6 h6z"/>`)
      + sk(`<path d="M90 452 l-4 -26 h30 l-4 26z" style="fill:#8E9AA2"/><ellipse cx="101" cy="426" rx="15" ry="3.4" style="fill:#5E9AAE"/>`, `<path d="M90 452 l-4 -26 h30 l-4 26z"/>`));
  // the workbench: the bench pin, tiny tools, the little oil-lamp flame and blowpipe, coils of wire, a piece of filigree half made
  const bench = spot("bafiligree", 100, 392, "Watch filigree being made at the workbench", hovE(98, 376, 66, 12),
    sk(`<rect x="22" y="268" width="150" height="10" rx="2" style="fill:${P.teak}"/><rect x="28" y="278" width="138" height="58" style="fill:${P.teak2}"/>${[0, 1].map(k => `<rect x="${36 + k*66}" y="${286}" width="56" height="18" rx="2" style="fill:${P.teak}"/><circle cx="${64 + k*66}" cy="295" r="2" style="fill:${P.gold}"/>`).join("")}<path d="M34 336 v12 M160 336 v12" style="stroke:${P.teak2}" stroke-width="5"/>
      <path d="M92 268 l14 -6 h20 l-14 6z" style="fill:#C9A26A"/><path d="M112 262 l6 -2 l-2 6" style="fill:#3A2A20"/>
      <path d="M40 268 v-10 h18 v10" style="fill:#7A8A9A"/><ellipse cx="49" cy="258" rx="9" ry="3" style="fill:#5E5A56"/><path d="M49 255 q-4 -8 0 -14 q4 6 0 14z" style="fill:#F3A23A"/><path d="M49 252 q-1.6 -4 0 -6.4 q1.6 2.4 0 6.4z" style="fill:#7EC0F0"/><path d="M60 250 l14 -6" style="stroke:${P.silver2}" stroke-width="1.6"/>
      ${[[136, "#D6D3CC"], [152, "#C9C4BA"]].map(([x, c]) => `<ellipse cx="${x}" cy="262" rx="7" ry="6" fill="none" style="stroke:${c}" stroke-width="2.4"/><circle cx="${x}" cy="262" r="2" style="fill:${P.teak}"/>`).join("")}
      ${[0, 1, 2, 3, 4].map(k => `<path d="M${76 + k*5} 266 l${(k - 2)} -8" style="stroke:#5E5A56" stroke-width="1.2"/>`).join("")}<path d="M160 266 l8 -14" style="stroke:#3A3430" stroke-width="2"/><circle cx="168" cy="250" r="7" fill="none" style="stroke:#3A3430" stroke-width="2"/><circle cx="168" cy="250" r="5" style="fill:#CFE8EE" opacity=".7"/>`,
      `<rect x="22" y="268" width="150" height="10" rx="2"/><rect x="28" y="278" width="138" height="58"/><path d="M92 268 l14 -6 h20 l-14 6z"/>`)
    + fili(104, 262, 4) + g(sk(`<rect x="38" y="${290 - 2}" width="0" height="0"/>`, ``)) + g(stool(186, 352, P.teak))
    // a tray of filigree pieces at the end of the bench
    + sk(`<rect x="126" y="270" width="0" height="0"/>`, ``)
    + lab(98, 376, "Filigree bench", "#E8E6E0", 9));
  // the display case: Ketut's glass counter, velvet trays of rings, earrings, bangles and brooches, a bust with a necklace
  const caseS = spot("ba_silver", 350, 384, "Ketut's silver case", hovE(350, 368, 110, 14),
    sk(`<rect x="232" y="306" width="236" height="38" style="fill:${P.teak}"/>${[0, 1, 2, 3].map(k => `<rect x="${242 + k*56}" y="312" width="48" height="26" rx="2" style="fill:${P.teak2}"/><path d="M${250 + k*56} 325 q16 -10 32 0 q-16 10 -32 0z" style="fill:${P.gold}" opacity=".7"/>`).join("")}
      <rect x="232" y="268" width="236" height="38" style="fill:#E8F4F2" opacity=".55"/><rect x="236" y="290" width="228" height="14" style="fill:#2E2A38"/><rect x="232" y="268" width="236" height="38" fill="none" style="stroke:${P.gold2}" stroke-width="3"/><rect x="228" y="304" width="244" height="6" rx="1" style="fill:${P.teak2}"/>
      <path d="M244 272 l16 0" style="stroke:#FFFFFF" stroke-width="2" opacity=".7"/><path d="M432 272 l8 0" style="stroke:#FFFFFF" stroke-width="2" opacity=".7"/>
      <path d="M400 268 q-2 -16 10 -20 l2 -14 q4 -3 8 0 l2 14 q12 4 10 20z" style="fill:#2E2A38"/><path d="M406 248 q10 14 20 0" fill="none" style="stroke:${P.silver}" stroke-width="1.4"/><path d="M416 254 l-3 5 l3 5 l3 -5z" style="fill:${P.silver}"/>`,
      `<rect x="232" y="268" width="236" height="76"/><path d="M400 268 q-2 -16 10 -20 l2 -14 q4 -3 8 0 l2 14 q12 4 10 20z"/>`)
    + [250, 266, 282, 298, 314].map((x, k) => ring(x, 297, 1.1, ["#5EB0AE", "", "#C9332A", "", "#7E5AB0"][k])).join("")
    + [334, 346, 358, 370].map(x => `<path d="M${x} 291 v3" style="stroke:${P.silver}" stroke-width=".8"/><path d="M${x} 294 l3 4 l-3 4 l-3 -4z" fill="none" style="stroke:${P.silver}" stroke-width="1"/>`).join("") + fili(390, 297, 5) + frangi(446, 296, .9, P.silver)
    + lab(350, 368, "Silver case", "#E8E6E0", 10));
  // the right: a carved chest with trays of filigree; the front: a tall glass vitrine, a stone water jar, plants
  const right = g(sk(`<rect x="420" y="380" width="80" height="62" style="fill:${P.red}"/><rect x="426" y="388" width="68" height="46" fill="none" style="stroke:${P.gold}" stroke-width="2"/><path d="M440 411 q20 -16 40 0 q-20 16 -40 0z" style="fill:${P.gold}"/><rect x="416" y="372" width="88" height="9" style="fill:${P.red2}"/>
      ${[0, 1].map(k => `<rect x="${422 + k*40}" y="360" width="36" height="12" rx="2" style="fill:#2E2A38"/>`).join("")}`, `<rect x="420" y="372" width="80" height="70"/>`)
    + [0, 1, 2].map(k => fili(430 + k*10, 366, 3.6)).join("") + [0, 1, 2].map(k => ring(470 + k*10, 366, 1, k === 1 ? "#5EB0AE" : "")).join(""));
  // a silver bokor (the footed offering bowl Celuk is known for) piled with fruit, on a red stand
  const bokor = g(sk(`<rect x="440" y="500" width="56" height="8" rx="2" style="fill:${P.red}"/><path d="M446 508 v22 M490 508 v22" style="stroke:${P.red2}" stroke-width="4"/><path d="M444 504 h52" style="stroke:${P.gold}" stroke-width="1.2"/>
      <path d="M458 500 l4 -10 h12 l4 10z" style="fill:${P.silver}"/><path d="M448 478 q20 18 40 0z" style="fill:${P.silver}"/><path d="M452 482 q16 10 32 0" fill="none" style="stroke:${P.silver2}" stroke-width="1"/>${[456, 466, 476].map(x => `<circle cx="${x}" cy="486" r="2.4" fill="none" style="stroke:${P.silver2}" stroke-width=".8"/>`).join("")}
      ${[[458, 472, "#E8823A"], [468, 470, "#C9332A"], [478, 472, "#F3D34A"], [463, 464, "#5A2A44"], [473, 464, "#7FA83A"], [468, 458, "#E8823A"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4.4" style="fill:${c}"/>`).join("")}`, `<rect x="440" y="500" width="56" height="8" rx="2"/><path d="M448 478 q20 18 40 0z"/>`) + frangi(468, 452, 1));
  const front = g(sk(`<rect x="24" y="470" width="86" height="122" rx="2" style="fill:${P.teak2}"/><rect x="30" y="476" width="74" height="104" style="fill:#DCEEF0" opacity=".85"/>${[506, 540].map(y => `<path d="M30 ${y} h74" style="stroke:${P.teak}" stroke-width="3"/>`).join("")}
      <path d="M44 502 q12 -14 24 0z" style="fill:${P.silver}"/><path d="M76 502 l6 -14 h10 l-4 14z" style="fill:${P.silver}"/><path d="M40 534 h30 l-6 -6 h-18z" style="fill:${P.silver}"/><path d="M48 528 v-14 M62 528 v-12" style="stroke:${P.silver2}" stroke-width="1.2"/><path d="M48 514 l12 6 M62 516 l-12 4" style="stroke:${P.silver}" stroke-width="1"/>
      <path d="M78 534 l8 -18 l8 18z" style="fill:${P.silver}"/><path d="M70 516 q16 -8 32 0" fill="none" style="stroke:${P.silver}" stroke-width="1.6"/>`, `<rect x="24" y="470" width="86" height="122" rx="2"/>`)
    + fili(48, 560, 7) + fili(70, 560, 7) + frangi(92, 560, 1.2, P.silver))
    + g(sk(`<path d="M128 592 q-14 -30 4 -50 h28 q18 20 4 50z" style="fill:${P.lava}"/><ellipse cx="146" cy="542" rx="16" ry="4" style="fill:#3E6E7A"/><path d="M134 560 q12 6 24 0" fill="none" style="stroke:${P.lava2}" stroke-width="1.6"/>`, `<path d="M128 592 q-14 -30 4 -50 h28 q18 20 4 50z"/>`) + frangi(150, 541, .8) + frangi(140, 543, .7))
    + plant(486, 596) + plant(400, 596, false)
    + g(sk(`<path d="M336 596 h56 l-4 -30 h-48z" style="fill:${P.red}"/><path d="M340 576 h48" style="stroke:${P.gold}" stroke-width="1.4"/><rect x="336" y="560" width="56" height="7" style="fill:${P.red2}"/>`, `<path d="M336 596 h56 l-4 -30 h-48z"/>`) + canang(364, 560, 1.1, true));
  return boards(200, ["#9A6A48", "#8E6040", "#A47452"], "#6B4430") + kerb() + wall + shrineShelf + bench + caseS + right + bokor + front + step() + exit("#6B4430");
}

/* ---------- the market hall ---------- */
// fruit: snake fruit (brown, scaly), mangosteen (purple, green cap), rambutan (red and hairy)
const salak = (x, y) => `<path d="M${x} ${y - 6} q5 2 4 6 q-1 4 -4 4 q-3 0 -4 -4 q-1 -4 4 -6z" style="fill:#6E3A22"/><path d="M${x - 2} ${y - 2} l1 1 l1 -1 l1 1" fill="none" style="stroke:#A86A4A" stroke-width=".6"/>`;
const manggis = (x, y) => `<circle cx="${x}" cy="${y}" r="4.4" style="fill:#5A2A44"/><path d="M${x - 3} ${y - 4} l3 -2 l3 2 l-3 1z" style="fill:#5E8A3A"/>`;
const rambutan = (x, y) => `<circle cx="${x}" cy="${y}" r="4.2" style="fill:#D9433A"/>${Array.from({length: 8}, (_, k) => { const a = k*45*Math.PI/180; return `<path d="M${f1(x + Math.cos(a)*4)} ${f1(y + Math.sin(a)*4)} l${f1(Math.cos(a)*2.4)} ${f1(Math.sin(a)*2.4)}" style="stroke:#5E9A3A" stroke-width=".7"/>`; }).join("")}`;
const trayHeap = (x, y, w, fn, n, seed) => `<ellipse cx="${x}" cy="${y}" rx="${w/2 + 3}" ry="5" style="fill:#C9A26A"/>${Array.from({length: n}, (_, i) => { const dx = (R(i*5 + seed) - .5)*w*.9, dy = -3 - R(i*7 + seed)*(w*.25)*(1 - Math.abs(2*dx/w)); return fn(+f1(x + dx), +f1(y + dy)); }).join("")}`;
const kite = (x, y, s = 1, a = "#D9433A", b = "#FFFDF6") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0 q20 -16 40 -6 q10 6 20 6 q-10 0 -20 6 q-20 10 -40 -6z" style="fill:${a}"/><path d="M-14 -8 q4 8 0 16 M-4 -9 q4 9 0 18" fill="none" style="stroke:${b}" stroke-width="2.4"/><circle cx="-22" cy="-2" r="2.6" style="fill:${b}"/><circle cx="-22" cy="-2" r="1.2" style="fill:#2F2B28"/><path d="M30 0 l14 -10 l-4 10 l4 10z" style="fill:${b}"/></g>`;
const sackHeap = (x, y, w, col, label, seed) => sk(`<path d="M${x - w/2} ${y} q-4 -28 6 -36 h${w - 12} q10 8 6 36z" style="fill:#C9B07A"/><path d="M${x - w/2 + 4} ${y - 36} q${w/2 - 4} -8 ${w - 8} 0" fill="none" style="stroke:#8A6A3A" stroke-width="1.6"/><ellipse cx="${x}" cy="${y - 36}" rx="${w/2 - 6}" ry="5" style="fill:${col}"/>${Array.from({length: 8}, (_, k) => `<circle cx="${f1(x + (R(k + seed) - .5)*(w - 18))}" cy="${f1(y - 38 + R(k*3 + seed)*4)}" r="1.6" style="fill:#2F2B28" opacity=".25"/>`).join("")}`,
  `<path d="M${x - w/2} ${y} q-4 -28 6 -36 h${w - 12} q10 8 6 36z"/>`) + (label ? txt(x, y - 12, label, 6, "#5A3A2E", 700) : "");
function marketRoom(){
  // the hall: a high thatch, a red beam, kites hung from it, sarongs and carvings on the back wall
  const sarong = (x, y, w, h, a, b, k) => sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${a}"/>${Array.from({length: Math.floor(h/10)}, (_, r) => `<path d="M${x} ${y + 6 + r*10} ${Array.from({length: Math.floor(w/8)}, () => "l4 -3 l4 3").join(" ")}" fill="none" style="stroke:${b}" stroke-width="1.2"/>`).join("")}<rect x="${x}" y="${y + h - 8}" width="${w}" height="8" style="fill:${b}"/>`, `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`);
  const wall = weaveDefs() + g(`<rect y="30" width="520" height="170" style="fill:#E8D6B0"/>${weave(0, 120, 520, 80)}<rect y="118" width="520" height="5" style="fill:${P.teak}"/>`)
    + thatchTop(30) + g(beam(0, 30, 520, 14)) + g(column(8, 44, 200, 14) + column(512, 44, 200, 14))
    // the sign over Komang's stall
    + g(sk(`<rect x="184" y="52" width="152" height="22" rx="3" style="fill:${P.red}"/><rect x="188" y="56" width="144" height="14" rx="2" fill="none" style="stroke:${P.gold}" stroke-width="1"/>`, `<rect x="184" y="52" width="152" height="22" rx="3"/>`) + txt(260, 68, "PASAR UBUD", 11, "#F6E3B4", 700))
    // kites on the beam
    + g(sk(kite(110, 72, .9) + kite(420, 74, .9, "#3E7AB0", "#F3D34A"), ``) + `<path d="M150 72 q30 20 20 50 M460 74 q20 18 10 44" fill="none" style="stroke:#F3D34A" stroke-width="1.2"/>`)
    // sarongs on a rail on the left
    + g(sk(`<path d="M20 96 h140" style="stroke:${P.teak2}" stroke-width="4" stroke-linecap="round"/>`, `<path d="M20 96 h140"/>`) + sarong(24, 98, 30, 96, "#C9483A", "#F3C94A") + sarong(58, 98, 30, 90, "#2E5A8A", "#F6E3B4") + sarong(92, 98, 30, 98, "#3E7A5A", "#E8C27A") + sarong(126, 98, 30, 92, "#7A3A5A", "#F3C94A"))
    // shelves of coffee jars, vanilla, rice in the middle; carvings on the right
    + g(sk(`${[112, 158].map(y => `<rect x="190" y="${y}" width="140" height="6" style="fill:${P.teak}"/>`).join("")}`, `<rect x="190" y="112" width="140" height="6"/><rect x="190" y="158" width="140" height="6"/>`)
      + [200, 224, 248, 272, 296, 318].map((x, k) => `<rect x="${x - 8}" y="88" width="16" height="24" rx="3" style="fill:#E8F1F0" opacity=".9"/><rect x="${x - 7}" y="96" width="14" height="15" style="fill:${["#5A3A2A", "#2F2440", "#5A3A2A", "#F6E3B4", "#5A3A2A", "#C9332A"][k]}"/><rect x="${x - 9}" y="84" width="18" height="5" rx="1" style="fill:${P.teak2}"/>`).join("")
      + [204, 236, 268, 300].map((x, k) => `<path d="M${x - 12} 158 l3 -18 h18 l3 18z" style="fill:#C9A26A"/>${k % 2 ? Array.from({length: 7}, (_, j) => `<path d="M${x - 7 + j*2} 142 l${j - 3} -14" style="stroke:#3A2A20" stroke-width="1.4"/>`).join("") + `<path d="M${x - 7} 136 h14" style="stroke:#C9332A" stroke-width="1.6"/>` : `<ellipse cx="${x}" cy="141" rx="10" ry="3" style="fill:${k ? "#6E9A3A" : "#5A3A2A"}"/>`}`).join("")
      + txt(260, 172, "", 1))
    + g(sk(`${[100, 158].map(y => `<rect x="364" y="${y}" width="136" height="6" style="fill:${P.teak}"/>`).join("")}`, `<rect x="364" y="100" width="136" height="6"/><rect x="364" y="158" width="136" height="6"/>`)
      // carved cats with long tails, a Garuda, a frog with an umbrella, frangipani carvings
      + `<path d="M378 100 v-22 q0 -8 6 -8 l2 -6 l2 6 h4 l2 -6 l2 6 q6 0 6 8 v22z" style="fill:#3E5A9A"/><path d="M398 100 q12 -4 8 -26" fill="none" style="stroke:#3E5A9A" stroke-width="3"/>${[382, 390].map(x => `<circle cx="${x}" cy="78" r="1.2" style="fill:#F3D34A"/>`).join("")}
        <path d="M424 100 l2 -14 l-14 -10 l18 4 l6 -10 l6 10 l18 -4 l-14 10 l2 14z" style="fill:${P.red}"/><path d="M426 86 l10 -6 l10 6" fill="none" style="stroke:${P.gold}" stroke-width="1.6"/><circle cx="436" cy="72" r="4" style="fill:${P.gold}"/>
        <path d="M466 100 q-2 -14 12 -16 q14 2 12 16z" style="fill:#5E8A3A"/><circle cx="472" cy="86" r="2" style="fill:#F3D34A"/><circle cx="484" cy="86" r="2" style="fill:#F3D34A"/><path d="M490 92 v-24" style="stroke:#5A3A2A" stroke-width="1.2"/><path d="M480 72 q10 -12 20 0z" style="fill:#E8566C"/>`
      + [376, 400, 424, 448, 472].map((x, k) => k % 2 ? `<path d="M${x} 158 v-26 q4 -8 8 0 v26z" style="fill:#C9A26A"/>` : frangi(x + 4, 146, 1.6, "#F1E2C4")).join("")
      + `<path d="M490 158 l2 -24 q4 -6 6 0 v24z" style="fill:#8A5A3A"/>`)
    + lamp(170, 190, 44) + lamp(350, 190, 44);
  // Komang's stall: fruit in flat baskets, vanilla pods in bundles, coffee beans, a pair of scales, black rice
  const stall = spot("ba_market", 262, 378, "Komang's stall", hovE(262, 362, 112, 14),
    sk(`<rect x="152" y="290" width="220" height="10" rx="2" style="fill:${P.bamboo2}"/><rect x="158" y="300" width="208" height="40" style="fill:${P.teak}"/>${weave(164, 304, 196, 32)}<path d="M162 340 v8 M362 340 v8" style="stroke:${P.teak2}" stroke-width="5"/>
      <path d="M355 290 v-30" style="stroke:#B8862A" stroke-width="3"/><path d="M347 290 h16" style="stroke:#B8862A" stroke-width="3"/><path d="M335 258 h40" style="stroke:#B8862A" stroke-width="2"/><path d="M337 258 l-4 12 M337 258 l4 12 M373 258 l-4 12 M373 258 l4 12" style="stroke:#8A6A3A" stroke-width=".8"/><path d="M329 270 q8 6 16 0z M365 270 q8 6 16 0z" style="fill:#D9A93E"/><circle cx="355" cy="256" r="3" style="fill:#D9A93E"/>`,
      `<rect x="152" y="290" width="220" height="10" rx="2"/><rect x="158" y="300" width="208" height="40"/>`)
    + trayHeap(184, 288, 40, salak, 14, 1) + trayHeap(230, 288, 40, manggis, 12, 3) + trayHeap(276, 288, 40, rambutan, 12, 5)
    + `<ellipse cx="316" cy="288" rx="16" ry="4" style="fill:#C9A26A"/>${Array.from({length: 9}, (_, k) => `<path d="M${306 + k*2.4} 286 l${(k - 4)*1.5} -16" style="stroke:#3A2A20" stroke-width="1.6"/>`).join("")}<path d="M304 278 h24" style="stroke:#C9332A" stroke-width="1.6"/>`
    + lab(262, 362, "Komang's stall", "#F6E3B4", 10));
  // the spice stall: round trays of turmeric, chillies, cloves, nutmeg, cinnamon, candlenut; sacks of pepper; lemongrass
  const spiceTray = (x, y, col, n, seed) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="6" style="fill:#C9A26A"/><path d="M${x - 20} ${y - 1} q20 -12 40 0" style="fill:${col}"/>${Array.from({length: n}, (_, k) => `<circle cx="${f1(x + (R(k + seed) - .5)*30)}" cy="${f1(y - 3 - R(k*3 + seed)*4)}" r="1.4" style="fill:#2F2B28" opacity=".2"/>`).join("")}`;
  const spices = spot("baspice", 82, 446, "The spice stall", hovE(82, 432, 56, 12),
    sk(`<rect x="22" y="330" width="122" height="9" rx="2" style="fill:${P.bamboo2}"/><path d="M28 339 v52 M138 339 v52" style="stroke:${P.bamboo2}" stroke-width="5"/><path d="M28 372 h110" style="stroke:${P.bamboo2}" stroke-width="3"/>`, `<rect x="22" y="330" width="122" height="9" rx="2"/>`)
    + spiceTray(48, 330, "#E8A82A", 6, 1) + spiceTray(100, 330, "#C9332A", 4, 3) + spiceTray(74, 316, "#5A3A2A", 8, 5)
    + `${Array.from({length: 7}, (_, k) => `<path d="M${92 + k*3} 316 q2 -5 6 -6" fill="none" style="stroke:#B8332A" stroke-width="2.4" stroke-linecap="round"/>`).join("")}`
    + sk(`<path d="M28 330 v-76 M138 330 v-76" style="stroke:${P.bamboo2}" stroke-width="5"/><path d="M22 256 h122" style="stroke:${P.bamboo2}" stroke-width="5" stroke-linecap="round"/>
      <path d="M44 258 v10" style="stroke:#8A6A3A" stroke-width="1"/>${Array.from({length: 7}, (_, k) => `<path d="M${38 + k*2} 268 v${24 + (k % 3)*3}" style="stroke:#9A6A3A" stroke-width="2.4"/>`).join("")}<path d="M37 274 h16" style="stroke:#C9332A" stroke-width="1.6"/>
      <path d="M68 258 q-2 18 0 36" fill="none" style="stroke:#8A6A3A" stroke-width="1"/>${Array.from({length: 7}, (_, k) => `<path d="M${68 + (k % 2 ? 3 : -3)} ${264 + k*4.6} q${k % 2 ? 5 : -5} 1 ${k % 2 ? 7 : -7} 5" fill="none" style="stroke:#C9332A" stroke-width="2.6" stroke-linecap="round"/>`).join("")}
      <path d="M92 258 v6" style="stroke:#8A6A3A" stroke-width="1"/>${Array.from({length: 6}, (_, k) => `<circle cx="${88 + (k % 2)*8}" cy="${268 + Math.floor(k/2)*8}" r="4" style="fill:${k % 3 ? "#B8606A" : "#D9A0A0"}"/>`).join("")}
      <path d="M118 258 v6" style="stroke:#8A6A3A" stroke-width="1"/>${Array.from({length: 6}, (_, k) => `<path d="M${112 + k*2.4} 264 v30" style="stroke:#9CC46A" stroke-width="2.2"/>`).join("")}<path d="M110 270 h18" style="stroke:#8A6A3A" stroke-width="2"/>`, `<path d="M28 330 v-76 M138 330 v-76 M22 256 h122"/>`)
    + sackHeap(52, 410, 46, "#3A2A20", "CENGKEH", 7) + sackHeap(108, 412, 48, "#2F2B28", "MERICA", 9)
    + lab(82, 432, "Spice stall", "#F6E3B4", 9));
  // the right: a rail of sarongs and a stand of big kites; the front: baskets on the left, coffee sacks and a carved Garuda right
  const right = g(sk(`<path d="M414 228 v190 M496 228 v190 M410 232 h90" style="stroke:${P.teak2}" stroke-width="4"/>`, `<path d="M410 232 h90"/>`)
    + sarong(420, 236, 34, 120, "#F3C94A", "#C9483A") + sarong(458, 236, 34, 128, "#2E5A8A", "#E8C27A")
    + sk(kite(452, 396, 1.1, "#E8566C", "#F3D34A"), ``) + `<path d="M496 396 q10 14 -4 24" fill="none" style="stroke:#F3D34A" stroke-width="1.4"/>`);
  const basketPile = g(sk(`<path d="M28 592 l6 -40 h56 l6 40z" style="fill:#C9A26A"/><path d="M34 552 q28 -10 56 0" style="fill:#B8925A"/>${Array.from({length: 6}, (_, k) => `<path d="M${32 + k*2} ${560 + k*6} h${60 - k*4}" style="stroke:#9A7A4A" stroke-width="1"/>`).join("")}
      <path d="M100 592 q-4 -36 30 -38 q34 2 30 38z" style="fill:#D9BE86"/><path d="M104 574 h52 M102 584 h56" style="stroke:#B89A5E" stroke-width="1.2"/><path d="M118 554 q12 -16 24 0" fill="none" style="stroke:#8A6A3A" stroke-width="2.4"/>
      <path d="M44 552 l4 -26 h32 l4 26z" style="fill:#B8925A"/><ellipse cx="64" cy="526" rx="18" ry="4" style="fill:#9A7A4A"/><path d="M48 538 h32" style="stroke:#8A6A3A" stroke-width="1.2"/>
      <path d="M170 594 l-4 -22 h40 l-4 22z" style="fill:#C9483A"/><path d="M168 580 h36" style="stroke:#F3C94A" stroke-width="1.6"/>`, `<path d="M28 592 l6 -40 h56 l6 40z"/><path d="M100 592 q-4 -36 30 -38 q34 2 30 38z"/>`));
  // a basket of snake fruit and a hand of bananas on a low stool (left); a stack of woven farmers' hats (right)
  const mid = g(stool(74, 504, P.bamboo2) + trayHeap(74, 482, 46, salak, 12, 21) + sk(`<path d="M96 476 q8 -16 22 -14 M98 480 q10 -12 22 -8 M98 484 q12 -8 22 -2" fill="none" style="stroke:#E8C23A" stroke-width="5" stroke-linecap="round"/>`, ``)
    + sk(`${[0, 1, 2, 3].map(k => `<path d="M434 ${500 - k*7} l26 -24 l26 24z" style="fill:${k % 2 ? "#D9BE86" : "#C9A86E"}"/>`).join("")}<path d="M434 500 h52" style="stroke:#8A6A3A" stroke-width="1.6"/>`, `<path d="M434 500 l26 -24 l26 24z"/>`));
  const frontR = g(sackHeap(354, 594, 50, "#5A3A2A", "KOPI BALI", 11) + sackHeap(404, 596, 48, "#2F2440", "BERAS HITAM", 13)
    + sk(`<path d="M446 594 h44 l-4 -10 h-36z" style="fill:${P.teak2}"/>${[-1, 1].map(d => Array.from({length: 5}, (_, k) => `<path d="M${468 + d*6} ${548 + k*2} q${d*(14 + k*3)} ${-20 + k*6} ${d*(22 + k*2)} ${-26 + k*10} q${d*-8} 8 ${d*-22} ${26 - k*8}z" style="fill:${k % 2 ? P.gold : P.red}"/>`).join("")).join("")}<path d="M458 584 q-4 -30 10 -40 q14 10 10 40z" style="fill:${P.red}"/><path d="M462 572 h12 M461 562 h14" style="stroke:${P.gold}" stroke-width="1.6"/><circle cx="468" cy="536" r="7" style="fill:#3E7A5A"/><path d="M468 538 l8 4 l-8 2z" style="fill:${P.gold}"/><circle cx="470" cy="534" r="1.4" style="fill:#FFFDF6"/><path d="M462 530 l2 -8 l4 5 l4 -5 l2 8z" style="fill:${P.gold}"/>`, `<path d="M458 584 q-4 -30 10 -40 q14 10 10 40z"/><circle cx="468" cy="536" r="7"/>`)
    + canang(300, 592, 1.1, true));
  return tiles(200, ["#A8A28E", "#9E9884", "#B2AC98", "#968F7C"], "#7E7866", 56, 42) + kerb() + wall + stall + spices + right + mid + basketPile + frontR + step() + exit("#7E2A22");
}

export function baliRoomArt(scene){
  CID = 0;
  return scene === "ba_warung" ? warungRoom() : scene === "ba_offer" ? offerRoom() : scene === "ba_gamelan" ? gamelanRoom() : scene === "ba_silver" ? silverRoom() : marketRoom();
}
