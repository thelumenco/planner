// The wine cave (round 239): a secret passage from Mel's cellar, found over a few days of clues (a candle flame that
// leans, a draught behind the barrel racks, old bricks under the plaster with "T.R. 1912" scratched on one), leads to
// an old stone wine cave the monks of the priory (now the Scoop Shack) dug long ago to carry wine from the vineyard
// down to the bay; Tomás Ruiz found it in 1912, bricked up the cellar end and hid the key. A vaulted brick ceiling, rough
// limestone walls, flagstones, candles in niches, cobwebs, an iron lantern: dim and warm, cosy rather than scary.
// Its far end comes out behind a hidden panel of shelving in the Scoop Shack's gelato kitchen at the bay.
//   caveArt(st)            the cave scene ("winecave"); spots are data-cavespot, the cellar door is data-exit
//   cellarSecretArt(step)  the clues drawn over the cellar room (data-secret="brick", then "door")
//   kitchenSecretArt(open) the open shelving door in the gelato kitchen (data-secret="passage")
//   oldBottleIcon(kind)    a 36x36 dusty antique bottle: "r1923", "s1958" or "w1931"
// Scaled to Mel (about 65px tall in the game, so a metre is about 40px). The edges full, the middle clear.
import { sk, tapeLabel } from "./scenes.js";

const g = s => `<g pointer-events="none">${s}</g>`;
// an invisible, finger-sized tap area over a hidden door, so it stays secret to look at but easy to tap (round 250)
const hit = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent" pointer-events="all"/>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const lab = (x, y, t, col = "#F3E1A0", size = 8) => tapeLabel(x, y, t, col, size);
const f1 = n => (+n).toFixed(1);
const R = i => { const x = Math.sin(i*127.1 + 311.7)*43758.5453; return x - Math.floor(x); };   // a steady scatter
const strip = s => s.replace(/ style="[^"]*"/g, "").replace(/ (opacity|fill|stroke-width|stroke-dasharray)="[^"]*"/g, "");
const D = (main, det = "") => sk(main + det, strip(main));
const txt = (x, y, t, size = 7, fill = "#3A2E28", weight = 400, rot = 0) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Klee One,serif" font-weight="${weight}" font-size="${size}" fill="${fill}" pointer-events="none"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ""}>${t}</text>`;
const INK = "#3A2E28", OAK = "#7A5236", OAK2 = "#5A3A26", OAKL = "#A87E58", STONE = "#CDBFA6", STONE2 = "#B5A68C", STONE3 = "#9A8B72", BRICK = "#A8583C", BRICK2 = "#8A4430", IRON = "#3E3A38", CREAM = "#FFFDF6";
const spot = (id, sx, sy, aria, hov, body) => `<g data-cavespot="${id}" data-x="${sx}" data-y="${sy}" aria-label="${aria}">${hov}${body}</g>`;

// a candle flame (it flickers via the game's .flame class); `lean` bends it sideways
const flame = (x, y, s = 1, lean = 0) => `<path class="flame" d="M${f1(x)} ${f1(y)} q${f1(-5*s)} ${f1(-4*s)} ${f1(lean*s - s)} ${f1(-12*s)} q${f1(s)} ${f1(5*s)} ${f1(4*s)} ${f1(6*s)} q${f1(2*s)} ${f1(4*s)} ${f1(-3*s)} ${f1(6*s)}z" fill="#F6A23A"/><path class="flame" d="M${f1(x)} ${f1(y)} q${f1(-2.4*s)} ${f1(-3*s)} ${f1(lean*s*.5)} ${f1(-7*s)} q${f1(s)} ${f1(3*s)} ${f1(2*s)} ${f1(4*s)} q${f1(s)} ${f1(2*s)} ${f1(-2*s)} ${f1(3*s)}z" fill="#FFE08A"/>`;
const candle = (x, y, h = 10, w = 5) => `<rect x="${f1(x - w/2)}" y="${f1(y - h)}" width="${w}" height="${h}" rx="1" fill="#F4ECD8" stroke="${INK}" stroke-width=".5"/><path d="M${f1(x - w/2)} ${f1(y - h + 2)} q1 3 0 5" stroke="#E8DCC0" stroke-width="1.2" fill="none"/>` + flame(x, y - h, .45);
// a soft warm pool of light (the cave's own gradient, so it shows whatever the time of day)
const warm = (x, y, r, o = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="url(#wcWarm)" opacity="${o}"/>`;
const defs = `<defs><radialGradient id="wcWarm"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset=".45" stop-color="#FFC66B" stop-opacity=".2"/><stop offset="1" stop-color="#FFC66B" stop-opacity="0"/></radialGradient>
  <radialGradient id="wcSea"><stop offset="0" stop-color="#8FD4E4" stop-opacity=".55"/><stop offset=".5" stop-color="#6FB8D0" stop-opacity=".2"/><stop offset="1" stop-color="#6FB8D0" stop-opacity="0"/></radialGradient>
  <radialGradient id="wcDim" cx=".5" cy=".42" r=".75"><stop offset=".55" stop-color="#1E1410" stop-opacity="0"/><stop offset="1" stop-color="#1E1410" stop-opacity=".5"/></radialGradient></defs>`;
// a cobweb fanned into a corner: (x, y) the corner, dx/dy which way it opens
const cobweb = (x, y, dx, dy, s = 1) => { const r = [10, 18, 26].map(v => v*s); let w = "";
  for (let k = 0; k <= 4; k++) { const a = k/4*Math.PI/2; w += `<path d="M${x} ${y} L${f1(x + dx*Math.cos(a)*r[2])} ${f1(y + dy*Math.sin(a)*r[2])}"/>`; }
  r.forEach(rr => { let d = ""; for (let k = 0; k <= 4; k++) { const a = k/4*Math.PI/2, px = x + dx*Math.cos(a)*rr, py = y + dy*Math.sin(a)*rr; d += k ? ` Q${f1(x + dx*Math.cos(a - Math.PI/16)*rr*.86)} ${f1(y + dy*Math.sin(a - Math.PI/16)*rr*.86)} ${f1(px)} ${f1(py)}` : `M${f1(px)} ${f1(py)}`; } w += `<path d="${d}"/>`; });
  return `<g fill="none" stroke="#EDE6DA" stroke-width=".6" opacity=".75" pointer-events="none">${w}</g>`; };
// a dusty dark bottle lying neck-out in a rack: we see its round shoulder and the foil on its neck
const bottleEnd = (x, y, k) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="4.6" fill="${["#24301F", "#2E2420", "#3A1E24"][k % 3]}" stroke="${INK}" stroke-width=".5"/><circle cx="${f1(x)}" cy="${f1(y)}" r="1.8" fill="${["#8A2A2A", "#C9A23A", "#3A3A3A"][k % 3]}"/><path d="M${f1(x - 3)} ${f1(y - 2)} q2 -2 5 -1" stroke="#D8D0C0" stroke-width=".8" fill="none" opacity=".7"/>`;

/* ---------- the cave ---------- */
const FL = 232;   // where the back wall meets the floor
function shell(){
  // the dark rock round everything, the limestone end wall inside the brick vault, the flagstone floor
  let s = `<rect width="520" height="640" fill="#3A2C24"/>`;
  s += `<path d="M0 ${FL} V200 Q0 18 260 18 Q520 18 520 200 V${FL}z" fill="${STONE}"/>`;
  s += Array.from({length: 30}, (_, k) => `<ellipse cx="${f1(30 + R(k)*460)}" cy="${f1(60 + R(k + 4)*170)}" rx="${f1(10 + R(k*3)*22)}" ry="${f1(5 + R(k*5)*9)}" fill="${k % 2 ? STONE2 : "#D8CCB4"}" opacity=".7"/>`).join("");
  s += Array.from({length: 14}, (_, k) => `<path d="M${f1(40 + R(k*7)*440)} ${f1(70 + R(k*9)*150)} q${f1(R(k)*10 - 5)} 8 ${f1(R(k + 1)*14 - 7)} 16" stroke="${STONE3}" stroke-width=".8" fill="none"/>`).join("");
  // flagstones, larger towards the front
  s += `<rect y="${FL}" width="520" height="${640 - FL}" fill="#8E8272"/>`;
  for (let r = 0, y = FL; y < 640; r++) { const h = 22 + r*5; for (let x = -((r*37) % 70); x < 520; ) { const w = 60 + Math.round(R(r*11 + x)*50);
      s += `<path d="M${x + 2} ${y + 2} h${w - 4} l1 ${h - 4} h${-w + 3}z" fill="${["#968A78", "#8A7E6C", "#A0947F", "#857968"][((r + Math.round(x/13)) % 4 + 4) % 4]}" stroke="#6E6252" stroke-width="1"/>`; x += w; }
    y += h; }
  // the brick vault: voussoirs round the arch, the springing stones at each side
  let v = "";
  for (let k = 0; k < 34; k++) { const a0 = Math.PI*(k/34), a1 = Math.PI*((k + 1)/34), pt = (a, rx, ry) => [260 - Math.cos(a)*rx, 200 - Math.sin(a)*ry];
    const [x0, y0] = pt(a0, 262, 182), [x1, y1] = pt(a1, 262, 182), [x2, y2] = pt(a1, 292, 206), [x3, y3] = pt(a0, 292, 206);
    v += `<path d="M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)} L${f1(x3)} ${f1(y3)}z" fill="${k % 3 === 1 ? BRICK2 : BRICK}" stroke="#5E2E20" stroke-width=".8"/>`; }
  s += v + `<path d="M-2 200 Q-2 -6 260 -6 Q522 -6 522 200" fill="none" stroke="#2A1E18" stroke-width="2"/>`;
  // the rough side walls, the cave narrowing a little towards us
  s += `<path d="M0 200 L58 ${FL + 6} L50 600 L0 640z" fill="#B5A68C"/><path d="M520 200 L462 ${FL + 6} L470 600 L520 640z" fill="#B5A68C"/>`
    + Array.from({length: 18}, (_, k) => { const left = k % 2 === 0, x = left ? 6 + R(k)*36 : 474 + R(k)*36, y = 250 + R(k + 3)*340; return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(6 + R(k*3)*8)}" ry="${f1(4 + R(k)*5)}" fill="${k % 3 ? STONE3 : "#C4B69C"}" opacity=".8"/>`; }).join("");
  return g(s + sk("", `<path d="M58 ${FL + 6} L50 600 M462 ${FL + 6} L470 600 M58 ${FL + 6} H462"/>`));
}
// candles in little niches cut into the back wall, and the iron lantern hanging from the crown of the vault
function niches(){
  const niche = (x, y, h = 8) => `<path d="M${x - 9} ${y} v-14 q9 -10 18 0 v14z" fill="#5E4A3A" stroke="${INK}" stroke-width=".8"/>` + candle(x, y, h, 4) + warm(x, y - h, 28);
  // a little cross the monks carved over one niche
  const cross = (x, y) => `<path d="M${x - 2} ${y - 12} h4 v6 h5 v4 h-5 v12 h-4 v-12 h-5 v-4 h5z" fill="${STONE2}" stroke="${STONE3}" stroke-width=".9"/><path d="M${x + 2} ${y - 12} v6 M${x + 7} ${y - 6} v4" stroke="#E2D8C4" stroke-width=".7"/>`;
  const lantern = `<path d="M260 0 V58" stroke="${IRON}" stroke-width="1.6"/>` + warm(260, 78, 120, .9) + D(`<path d="M250 64 h20 l-3 26 h-14z" style="fill:#FFE8A8"/><path d="M247 64 l13 -8 l13 8z" style="fill:${IRON}"/><rect x="249" y="89" width="22" height="4" rx="1" style="fill:${IRON}"/>`, `<path d="M256 64 v26 M264 64 v26" stroke="${IRON}" stroke-width="1"/>` + flame(260, 84, .5));
  return g(cross(150, 98) + niche(150, 128, 4) + niche(370, 128) + niche(36, 300) + niche(484, 300) + lantern
    + cobweb(70, 96, 1, 1, 1.1) + cobweb(450, 96, -1, 1, 1.1) + cobweb(60, FL + 6, 1, -1, .7) + cobweb(460, FL + 6, -1, -1, .7) + cobweb(4, 210, 1, 1, .8) + cobweb(516, 210, -1, 1, .8));
}
// the ageing alcoves: three stone arches with wooden racks, filled with st.laid bottles (eight to an alcove)
function alcoves(n){
  const xs = [190, 260, 330];
  let s = "";
  xs.forEach((x, a) => {
    s += D(`<path d="M${x - 30} ${FL} V172 q30 -30 60 0 V${FL}z" style="fill:#4A382C"/>`, `<path d="M${x - 33} ${FL} V171 q33 -34 66 0 V${FL}" fill="none" stroke="${STONE3}" stroke-width="3"/>`);
    // the rack: two shelves of four cradles
    s += [0, 1].map(r => `<rect x="${x - 26}" y="${196 + r*20}" width="52" height="3" fill="${OAK}" stroke="${INK}" stroke-width=".5"/>`).join("") + [-26, -13, 0, 13, 26].map(dx => `<path d="M${x + dx} 182 V${FL}" stroke="${OAK2}" stroke-width="1.4"/>`).join("");
    for (let k = 0; k < 8; k++) { const i = a*8 + k; if (i >= n) break; s += bottleEnd(x - 19.5 + (k % 4)*13, 190 + Math.floor(k/4)*20, i); }
  });
  return spot("alcoves", 260, 300, `The ageing alcoves: ${n} bottle${n === 1 ? "" : "s"} laid down`, hovE(260, FL + 8, 112, 14), s + lab(260, FL + 22, "Ageing alcoves"));
}
// the dusty niche of forgotten bottles (Tomás's own, left behind)
function oldBottles(n){
  const x = 100, y = 250, b = FL - 2;
  let s = D(`<path d="M${x - 26} ${b} V184 q26 -24 52 0 V${b}z" style="fill:#4E3C30"/><rect x="${x - 28}" y="${b}" width="56" height="5" style="fill:${STONE2}"/>`);
  if (!n) s += candle(x, b, 9, 4) + warm(x, b - 10, 26);
  for (let k = 0; k < n; k++) { const by = b - 6 - k*12;   // lying on their sides, necks to the right, thick with dust
    s += `<g transform="translate(${x - 18} ${by})"><path d="M0 -4 h20 q4 0 6 2 h8 v4 h-8 q-2 2 -6 2 h-20 q-2 -4 0 -8z" fill="${["#3A1E24", "#2F3A26", "#5A4A2A"][k]}" stroke="${INK}" stroke-width=".6"/><path d="M2 -3 h18" stroke="#E8E0D0" stroke-width="2" opacity=".45"/>${[2, 7, 12, 17, 23].map(dx => `<circle cx="${dx}" cy="${-1 + (dx % 3)}" r=".7" fill="#E8E0D0" opacity=".7"/>`).join("")}</g>`; }
  if (n) s += `<g transform="rotate(-8 ${x + 12} ${b - 30})"><rect x="${x + 4}" y="${b - 36}" width="16" height="11" fill="#E8D9B0" stroke="${INK}" stroke-width=".5"/><path d="M${x + 6} ${b - 32} h11 M${x + 6} ${b - 29} h8" stroke="#8A7A5A" stroke-width=".6"/><path d="M${x + 4} ${b - 34} l-5 -3" stroke="#8A7A5A" stroke-width=".6"/></g>`;
  s += cobweb(x - 24, 184, 1, 1, .7) + cobweb(x + 24, 184, -1, 1, .55);
  return spot("oldbottles", 110, 300, n ? `Forgotten bottles: ${n}` : "An empty niche", hovE(x, y + 4, 34, 10), s + lab(x, y + 18, "Forgotten bottles", "#EFE6D6"));
}
// Tomás's antique screw press: a slatted basket on a stone bed, a great wooden screw through an oak beam
function press(){
  const x = 420, y = 300;
  const body = D(`<rect x="${x - 38}" y="${y - 14}" width="76" height="14" rx="2" style="fill:${STONE2}"/><path d="M${x + 38} ${y - 8} h8 v5 h-8z" style="fill:${STONE3}"/><rect x="${x - 34}" y="${y - 120}" width="8" height="106" style="fill:${OAK}"/><rect x="${x + 26}" y="${y - 120}" width="8" height="106" style="fill:${OAK}"/><rect x="${x - 40}" y="${y - 128}" width="80" height="12" rx="2" style="fill:${OAK2}"/><rect x="${x - 22}" y="${y - 54}" width="44" height="40" rx="2" style="fill:#8A6A4A"/><rect x="${x - 24}" y="${y - 60}" width="48" height="7" rx="2" style="fill:${OAKL}"/>`,
    `${Array.from({length: 8}, (_, k) => `<path d="M${x - 19 + k*5.4} ${y - 52} v36" stroke="${OAK2}" stroke-width="1"/>`).join("")}<path d="M${x - 22} ${y - 40} h44 M${x - 22} ${y - 26} h44" stroke="${IRON}" stroke-width="1.6"/>`
    + `<rect x="${x - 4}" y="${y - 116}" width="8" height="56" fill="#9A7A52" stroke="${INK}" stroke-width=".6"/>${Array.from({length: 9}, (_, k) => `<path d="M${x - 4} ${y - 112 + k*6} l8 3" stroke="${OAK2}" stroke-width="1"/>`).join("")}<path d="M${x - 30} ${y - 92} h60" stroke="${OAK}" stroke-width="4" stroke-linecap="round"/><circle cx="${x}" cy="${y - 92}" r="5" fill="${OAK2}" stroke="${INK}" stroke-width=".6"/>`
    + `<path d="M${x + 46} ${y - 3} q4 6 0 10" stroke="#6A2A3A" stroke-width="1.4" fill="none" opacity=".5"/>`);
  return spot("press", 400, 340, "Tomás's old wine press", hovE(x, y + 2, 46, 11), body + cobweb(x - 40, y - 128, 1, 1, .8) + lab(x, y + 18, "Old press"));
}
// the long oak supper table, four chairs; laid for supper with a runner, candelabra, plates, glasses and bread
function table(supper){
  const x0 = 176, x1 = 344, ty = 418, y = 450;
  const chairBack = (cx, cy) => `<path d="M${cx - 9} ${cy} v-34 M${cx + 9} ${cy} v-34 M${cx - 9} ${cy - 31} h18 M${cx - 9} ${cy - 24} h18" stroke="${OAK2}" stroke-width="2.6" stroke-linecap="round"/><rect x="${cx - 11}" y="${cy - 14}" width="22" height="4" rx="1" fill="${OAK}" stroke="${INK}" stroke-width=".5"/>`;
  const chairFront = (cx, cy) => `<rect x="${cx - 11}" y="${cy - 16}" width="22" height="5" rx="1.5" fill="${OAK}" stroke="${INK}" stroke-width=".6"/><path d="M${cx - 9} ${cy - 11} v11 M${cx + 9} ${cy - 11} v11" stroke="${OAK2}" stroke-width="2.4"/><path d="M${cx - 9} ${cy - 16} v-22 M${cx + 9} ${cy - 16} v-22 M${cx - 9} ${cy - 34} h18 M${cx - 9} ${cy - 27} h18" stroke="${OAK2}" stroke-width="2.6" stroke-linecap="round"/>`;
  let s = g([[200, 430], [320, 430]].map(([cx, cy]) => chairBack(cx, cy)).join(""));
  s += D(`<rect x="${x0}" y="${ty}" width="${x1 - x0}" height="24" rx="2" style="fill:${OAK}"/><rect x="${x0}" y="${ty + 24}" width="${x1 - x0}" height="6" style="fill:${OAK2}"/><rect x="${x0 + 6}" y="${ty + 30}" width="7" height="${y - ty - 30 + 16}" style="fill:${OAK2}"/><rect x="${x1 - 13}" y="${ty + 30}" width="7" height="${y - ty - 30 + 16}" style="fill:${OAK2}"/>`,
    `${[0, 1, 2].map(k => `<path d="M${x0 + 4} ${ty + 6 + k*7} q${(x1 - x0)/2} ${k % 2 ? 2 : -2} ${x1 - x0 - 8} 0" stroke="#6A4630" stroke-width=".7" fill="none"/>`).join("")}`);
  if (supper) {
    const places = [[200, ty + 7], [320, ty + 7], [200, ty + 19], [320, ty + 19]];
    s += g(warm(260, ty + 4, 130) + `<rect x="${x0 + 14}" y="${ty + 9}" width="${x1 - x0 - 28}" height="7" fill="${CREAM}" stroke="#D8D0C0" stroke-width=".6"/>`
      + places.map(([px, py]) => `<ellipse cx="${px}" cy="${py}" rx="9" ry="3.2" fill="${CREAM}" stroke="${INK}" stroke-width=".5"/><ellipse cx="${px}" cy="${py}" rx="5" ry="1.6" fill="none" stroke="#C9A26A" stroke-width=".6"/><path d="M${px + 13} ${py - 1} q-3 -3 0 -7 h4 q3 4 0 7z M${px + 15} ${py - 1} v3" fill="#8A2A3A" stroke="${INK}" stroke-width=".4" opacity=".9"/>`).join("")
      + `<rect x="234" y="${ty + 11}" width="20" height="9" rx="2" fill="#B98F5E" stroke="${INK}" stroke-width=".5"/><ellipse cx="244" cy="${ty + 13}" rx="7" ry="3" fill="#E3B47A" stroke="${INK}" stroke-width=".5"/><path d="M268 ${ty + 14} l-1 -12 h5 l-1 12z" fill="#2E2420" stroke="${INK}" stroke-width=".4"/>`
      // the candelabra: three arms on a brass stem
      + `<path d="M284 ${ty + 13} v-14 M276 ${ty - 1} q8 6 16 0 M276 ${ty - 1} v-4 M292 ${ty - 1} v-4" stroke="#C9A23A" stroke-width="1.6" fill="none"/><ellipse cx="284" cy="${ty + 13}" rx="5" ry="1.6" fill="#C9A23A"/>` + candle(276, ty - 5, 7, 3) + candle(284, ty - 1, 9, 3) + candle(292, ty - 5, 7, 3));
  } else s += g(warm(260, ty + 8, 60, .8) + `<ellipse cx="260" cy="${ty + 14}" rx="5" ry="1.8" fill="#C9A23A"/>` + candle(260, ty + 13, 10, 4));
  s += g([[200, 480], [320, 480]].map(([cx, cy]) => chairFront(cx, cy)).join(""));
  return spot("table", 260, 510, supper ? "The supper table, laid" : "The supper table", hovE(260, y + 4, 96, 14), s + lab(260, 528, "Supper table", supper ? "#F3C969" : "#F3E1A0"));
}
// the rusty iron gate in the left wall: the passage on to the bay, a sea-blue glow and a draught coming through
function gate(){
  const arch = `M14 470 V392 q20 -38 40 0 V470z`;
  const draught = [0, 1, 2].map(k => `<path d="M58 ${404 + k*20} q10 -5 20 0 t20 0 t20 0" fill="none" stroke="#CFE8EE" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="10 50" opacity=".7"><animate attributeName="stroke-dashoffset" from="60" to="0" dur="${3 + k*.7}s" repeatCount="indefinite"/></path>`).join("");
  const body = `<circle cx="34" cy="424" r="60" fill="url(#wcSea)"/>` + D(`<path d="${arch}" style="fill:#1E2A30"/>`, `<path d="${arch}" fill="#2E5866" opacity=".55"/>`)
    + sk(`${[20, 27, 34, 41, 48].map(x => `<path d="M${x} 470 V${x < 34 ? 390 + (34 - x)*.9 : 390 + (x - 34)*.9}" style="stroke:#7A4A32" stroke-width="2"/>`).join("")}<path d="M14 420 h40 M14 446 h40" style="stroke:#7A4A32" stroke-width="2"/><path d="M14 392 q20 -38 40 0" fill="none" style="stroke:#6A3E2A" stroke-width="3"/>`, `<path d="${arch}"/>`)
    + `<g pointer-events="none">${draught}${[[26, 440], [42, 430], [34, 456]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#C86A3A" opacity=".8"/>`).join("")}</g>`;
  // the monks' worn stone arch over it, carved VINUM LAETIFICAT COR (wine gladdens the heart)
  const voussoirs = Array.from({length: 9}, (_, k) => { const a0 = Math.PI*(1 - k/9), a1 = Math.PI*(1 - (k + 1)/9), p = (a, r) => [34 + Math.cos(a)*r, 394 - Math.sin(a)*r*.95];
    const [x0, y0] = p(a0, 21), [x1, y1] = p(a1, 21), [x2, y2] = p(a1, 31), [x3, y3] = p(a0, 31); return `<path d="M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)} L${f1(x3)} ${f1(y3)}z" fill="${k % 2 ? "#D8CCB4" : STONE}" stroke="${STONE3}" stroke-width=".8"/>`; }).join("");
  const stoneArch = g(voussoirs + `<rect x="1" y="394" width="12" height="78" fill="${STONE}" stroke="${STONE3}" stroke-width=".8"/><rect x="55" y="394" width="10" height="78" fill="${STONE}" stroke="${STONE3}" stroke-width=".8"/>`
    + `<defs><path id="wcMotto" d="M7 394 A27 25.6 0 0 1 61 394"/></defs><text font-family="Georgia,'Times New Roman',serif" font-size="4.6" letter-spacing=".25" fill="#6A5A44"><textPath href="#wcMotto" startOffset="50%" text-anchor="middle">VINUM LAETIFICAT COR</textPath></text>`);
  return spot("gate", 64, 450, "The iron gate under the monks' arch: the passage to the Scoop Shack", hovE(40, 470, 32, 10), body + stoneArch + lab(66, 488, "To the Scoop Shack", "#D8ECF2"));
}
// the heavy old door back to the cellar, in the right wall
function cellarDoor(){
  const d = `M470 470 V396 q20 -36 40 0 V470z`;
  return `<g data-exit="1" aria-label="Back to the cellar">${hovE(486, 455, 30, 10)}`
    + D(`<path d="${d}" style="fill:${OAK}"/>`, `${[478, 486, 494, 502].map(x => `<path d="M${x} ${x < 490 ? 382 + (490 - x)*.4 : 382 + (x - 490)*.4} V470" stroke="${OAK2}" stroke-width="1"/>`).join("")}<path d="M470 404 h40 M470 452 h40" stroke="${IRON}" stroke-width="3"/><circle cx="476" cy="432" r="2.4" fill="none" stroke="${IRON}" stroke-width="1.4"/>`)
    + g(warm(490, 420, 30, .6)) + lab(486, 488, "Cellar") + `</g>`;
}
export function caveArt(st = {}){
  const laid = Math.max(0, Math.min(24, +st.laid || 0)), old = Math.max(0, Math.min(3, +st.old || 0));
  // the monks' old bench, worn smooth, with a candle left on the end
  const props = g(D(`<rect x="70" y="544" width="92" height="7" rx="2" style="fill:${OAK}"/><rect x="74" y="551" width="8" height="18" style="fill:${OAK2}"/><rect x="150" y="551" width="8" height="18" style="fill:${OAK2}"/>`, `<path d="M74 547 q40 -2 84 1" stroke="${OAKL}" stroke-width="1" fill="none"/><path d="M78 562 h76" stroke="${OAK2}" stroke-width="2"/>`)
    + D(`<ellipse cx="430" cy="566" rx="16" ry="5" style="fill:#7A5A3E"/><path d="M414 566 v-26 q16 -6 32 0 v26z" style="fill:#8A6A4A"/>`, `<path d="M414 548 q16 5 32 0 M414 558 q16 5 32 0" stroke="${IRON}" stroke-width="1.6" fill="none"/>`)
    + candle(84, 544, 7, 4) + warm(84, 534, 40) + [[408, 530], [414, 522]].map(([x, y], k) => `<rect x="${x}" y="${y}" width="${10 - k*2}" height="4" rx="1" fill="#C9A26A" stroke="${INK}" stroke-width=".4"/>`).join(""));
  return defs + shell() + niches() + alcoves(laid) + oldBottles(old) + press() + props + gate() + cellarDoor() + table(!!st.supper)
    + `<rect width="520" height="640" fill="url(#wcDim)" pointer-events="none"/>`;
}

/* ---------- the clues in Mel's cellar ---------- */
export function cellarSecretArt(step = 0){
  step = +step || 0;
  if (step < 1) return "";
  let s = defs;
  // a candle on the high table, its flame leaning and fluttering to the left
  const cx = 384, cy = 466;
  s += g(warm(cx, cy - 12, 36) + `<ellipse cx="${cx}" cy="${cy}" rx="6" ry="2" fill="#C9A23A"/><rect x="${cx - 2.5}" y="${cy - 14}" width="5" height="14" rx="1" fill="#F4ECD8" stroke="${INK}" stroke-width=".5"/>`
    + `<g><path d="M${cx} ${cy - 14} q-6 -2 -9 -10 q4 2 6 0 q2 4 5 4z" fill="#F6A23A"/><path d="M${cx} ${cy - 14} q-4 -1 -6 -6 q3 1 4 0 q1 3 3 3z" fill="#FFE08A"/><animateTransform attributeName="transform" type="rotate" values="0 ${cx} ${cy - 14};-12 ${cx} ${cy - 14};4 ${cx} ${cy - 14};-8 ${cx} ${cy - 14};0 ${cx} ${cy - 14}" dur="1.6s" repeatCount="indefinite"/></g>`);
  // faint draught lines drifting out from behind the barrel racks
  s += g([0, 1, 2].map(k => `<path d="M${20 + k*4} ${430 + k*22} q12 -6 24 0 t24 0 t24 0" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="12 60" opacity=".5"><animate attributeName="stroke-dashoffset" from="72" to="0" dur="${3.4 + k*.6}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".15;.55;.15" dur="${3.4 + k*.6}s" repeatCount="indefinite"/></path>`).join(""));
  const patch = `M4 388 q8 -10 22 -6 q14 -8 28 2 q10 8 6 22 q6 16 -2 30 q-4 14 -18 14 q-14 6 -28 -2 q-10 -10 -8 -30 q-6 -16 0 -30z`;
  if (step < 5) {
    // the plaster has fallen away: old bricks behind, one scratched "T.R. 1912"
    const bricks = Array.from({length: 7}, (_, r) => Array.from({length: 4}, (_, k) => `<rect x="${f1(-6 + k*18 + (r % 2)*9)}" y="${384 + r*10}" width="17" height="9" rx="1" fill="${(r + k) % 3 ? BRICK : BRICK2}" stroke="#5E2E20" stroke-width=".6"/>`).join("")).join("");
    const id = "wcPatch";
    s += `<g data-secret="brick" data-x="70" data-y="440" aria-label="A loose brick">${hovE(40, 452, 34, 10)}`
      + `<defs><clipPath id="${id}"><path d="${patch}"/></clipPath></defs><g pointer-events="none"><g clip-path="url(#${id})">${bricks}</g>`
      + `<g transform="rotate(-4 32 426)"><rect x="22" y="420" width="20" height="10" rx="1" fill="#C27A5A" stroke="${INK}" stroke-width=".7"/>${txt(32, 428, "T.R. 1912", 4.6, "#3A1E14", 700)}</g></g>`
      + sk("", `<path d="${patch}"/>`) + g([[8, 470], [20, 476], [52, 474]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="1.6" fill="#E9DCCB" stroke="#B8A890" stroke-width=".5"/>`).join(""))
      + lab(44, 494, "Old bricks", "#EFE6D6") + `</g>`;
  } else {
    // the passage is open (round 244, Mel: "more secret"): a hidden panel on the west wall, the same boards and
    // colour as the cellar around it, set in the same perspective as the real door opposite. Only a hairline of
    // lantern light at its edge and a small iron ring give it away. No label.
    const panel = `M0 318 L26 329 L26 427 L0 438z`;
    s += `<g data-secret="door" data-x="56" data-y="440" aria-label="The secret passage">${hovE(30, 452, 30, 9)}${hit(0, 306, 66, 160)}`   // Mel: the tap area was very small
      + D(`<path d="${panel}" style="fill:#B48A66"/>`, `<path d="M0 352 L26 360 M0 388 L26 393 M0 418 L26 419" stroke="#8E6A4A" stroke-width=".9" opacity=".7"/>`)
      + g(`<path d="M26.5 330 V426" stroke="#FFD27A" stroke-width="1.3" opacity=".55"><animate attributeName="opacity" values=".35;.7;.4;.6;.35" dur="3.2s" repeatCount="indefinite"/></path>`
        + `<circle cx="20" cy="380" r="2.6" fill="none" stroke="#4A3A30" stroke-width="1.1"/>`)
      + `</g>`;
  }
  return s;
}

/* ---------- the far end: the gelato kitchen's shelving swings open ---------- */
export function kitchenSecretArt(open){
  if (!open) return "";
  // round 244 (Mel: "more secret"): just a tall set of shelves on the west wall, jars and tubs on it, like any kitchen.
  // A hairline of lantern light down one edge, and a draught that stirs the tea towel, are all that give it away.
  const shelf = `M0 330 L34 340 V470 L0 480z`;
  return defs + `<g data-secret="passage" data-x="64" data-y="455" aria-label="The secret passage">${hovE(34, 478, 30, 9)}${hit(0, 318, 72, 176)}`
    + D(`<path d="${shelf}" style="fill:#F4F1EA"/>`, [0, 1, 2, 3].map(k => `<path d="M0 ${364 + k*30} L34 ${370 + k*28}" stroke="#B8C4CC" stroke-width="2"/>${[0, 1].map(j => `<rect x="${6 + j*13}" y="${f1(354 + k*29 + j*2)}" width="8" height="9" rx="1.4" fill="${["#F4C7CF", "#FFF3D6", "#BFE0F2"][(j + k) % 3]}" stroke="${INK}" stroke-width=".4"/>`).join("")}`).join(""))
    + g(`<path d="M34.6 342 V468" stroke="#FFD27A" stroke-width="1.2" opacity=".5"><animate attributeName="opacity" values=".3;.65;.35;.55;.3" dur="3.4s" repeatCount="indefinite"/></path>`
      + `<g><path d="M30 404 h8 v16 l-3 -2 l-2 3 l-3 -3z" fill="#FFFDF6" stroke="${INK}" stroke-width=".5"/><animateTransform attributeName="transform" type="rotate" values="0 34 404;4 34 404;-2 34 404;0 34 404" dur="2.6s" repeatCount="indefinite"/></g>`)
    + `</g>`;
}


/* ---------- the forgotten bottles, as icons ---------- */
export function oldBottleIcon(kind){
  const K = {r1923: {glass: "#4A1A24", label: "#E8D9B0", ink: "#8A3A3A", cap: "#8A2A2A", y: "1923"},
    s1958: {glass: "#2E4A2E", label: "#F0E6C8", ink: "#6A5A2A", cap: "#C9A23A", y: "1958"},
    w1931: {glass: "#D9C27A", label: "#F4ECD8", ink: "#7A6A3A", cap: "#B8A07A", y: "1931"}}[kind] || {glass: "#3A2E28", label: "#E8D9B0", ink: "#6A5A4A", cap: "#8A7A6A", y: ""};
  const sparkle = kind === "s1958";
  const body = `<path d="M14 33 h8 q3 0 3 -3 v-12 q0 -4 -3 -6 v-${sparkle ? 5 : 6} h-8 v${sparkle ? 5 : 6} q-3 2 -3 6 v12 q0 3 3 3z" fill="${K.glass}" stroke="${INK}" stroke-width=".8"/>`;
  const neck = sparkle ? `<rect x="15" y="3" width="6" height="5" rx="1.4" fill="#D8C9A0" stroke="${INK}" stroke-width=".5"/><rect x="14" y="5" width="8" height="4" fill="${K.cap}"/><path d="M15 3 l6 5 M21 3 l-6 5 M14 9 h8" stroke="#B8B0A0" stroke-width=".5"/>`
    : `<rect x="15" y="4" width="6" height="4" rx="1" fill="${K.cap}" stroke="${INK}" stroke-width=".5"/>`;
  const label = `<rect x="12.6" y="19" width="10.8" height="8" rx="1" fill="${K.label}" opacity=".85"/><path d="M14 21.4 h8" stroke="${K.ink}" stroke-width=".6" opacity=".6"/><text x="18" y="25.6" text-anchor="middle" font-family="Klee One,serif" font-size="3.4" fill="${K.ink}" opacity=".75">${K.y}</text>`;
  const dust = `<path d="M13 14 q5 -2 10 0 v4 q-5 -1 -10 0z" fill="#E8E0D0" opacity=".35"/>` + [[14, 16], [20, 14], [23, 22], [13, 29], [21, 31], [17, 11], [26, 28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".6" fill="#E8E0D0" opacity=".8"/>`).join("");
  const web = `<g fill="none" stroke="#DCD4C6" stroke-width=".4" opacity=".9"><path d="M36 0 L26 0 M36 0 L36 10 M36 0 L28 8 M36 0 L31 3 M36 0 L33 5"/><path d="M29 0 Q31 3 36 3 M27 0 Q30 6 36 7 M33 0 Q34 1 36 1.4"/></g>`;
  const shine = `<path d="M15 15 v14" stroke="#FFFFFF" stroke-width="1" opacity="${kind === "w1931" ? .5 : .25}"/>`;
  return body + neck + label + shine + dust + web;
}
