// Hokkaido's interiors (round 217): six rooms behind the doors in Otaru, Sapporo, Niseko and Furano. Northern and
// Meiji-era: grey-blue stone, red brick and iron, birch and logs, white tiles and pale wood; cool snow light at the
// windows (real snow in the snow months), warm lamplight and stoves inside. The edges full, the middle calm and clear
// (the playbook); solid furniture sits exactly on HK_OBST (data/hokkaido.js).
//   hk_glass:    the Otaru glassworks: an old stone warehouse, the furnace's glowing mouth, blowpipes in a rack, the
//                marver bench, floats to the ceiling, glass lamps, little glass animals
//   hk_musicbox: the music box hall: red brick and iron pillars, glass cases, the great cylinder box, the steam clock
//   hk_beer:     the beer factory: arched windows, two copper kettles behind a rail, the red star, the tasting table
//   hk_ramen:    the ramen shop: the long counter and stools, the kitchen's steaming pots, red lanterns, the noren
//   hk_lodge:    the ski lodge: log walls, the cast-iron stove and boots, skis, Mount Yotei in the great window
//   hk_dairy:    the Furano dairy: white tiles, churns, the milk fridge, the cheese counter and cellar, soft-serve
// Spots (data-rdspot, core.js roomSpot): the thing to tap in each room opens its panel (and the furnace, the kettles).
import { sk, tapeLabel } from "./scenes.js";
import { lampGlow } from "./village-extras.js";
import { dayKey } from "../util.js";
import { snowIn } from "../data/hokkaido.js";

const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const g = s => `<g pointer-events="none">${s}</g>`;
const spot = (id, tx, ty, aria, hov, body) => `<g data-rdspot="${id}" data-x="${tx}" data-y="${ty}" aria-label="${aria}">${hov}${body}</g>`;
const hovE = (x, y, rx, ry) => `<ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>`;
const exit = (col = "#2E3A5A") => `<g data-exit="1" aria-label="Back outside"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
  ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${col}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/>`)}<text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Exit</text></g>`;
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const L = `stroke="#3a2e28" stroke-width=".7"`;
const NAVY = "#2E3A5A", IRON = "#2F3A3C", BRASS = "#C9A24A", CREAM = "#FFFDF6", RED = "#B8432F", COPPER = "#C27040", LAV = "#8E7BC0";
const FLOATS = ["#3E7FB8", "#6FB0D0", "#3E8A6E", "#8CC4A0", "#D9A040", "#C9783A", "#2E5E8E", "#A8D4C8"];
const snowy = () => { try { return snowIn(dayKey()); } catch { return false; } };

/* ---------- shared bits ---------- */
const txt = (x, y, t, fs = 8, col = CREAM, extra = "") => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Klee One,serif" font-size="${fs}" fill="${col}"${extra}>${t}</text>`;
const signBoard = (x, y, w, t, bg = NAVY, col = "#F3E1A0", fs = 10) => g(sk(`<rect x="${x - w/2}" y="${y - 12}" width="${w}" height="20" rx="3" style="fill:${bg}"/>`, `<rect x="${x - w/2}" y="${y - 12}" width="${w}" height="20" rx="3"/>`) + txt(x, y + 3, t, fs, col, ` font-weight="700" letter-spacing="1"`));
// a brass lamp hanging from the ceiling on a chain
const hangLamp = (x, y, glow = 34) => lampGlow(x, y + 6, glow) + g(sk(`<path d="M${x - 7} ${y - 4} h14 l-3 14 h-8z" style="fill:#F6C26B"/><path d="M${x - 9} ${y - 4} l9 -7 l9 7z" style="fill:${BRASS}"/><rect x="${x - 5}" y="${y + 10}" width="10" height="3" style="fill:${BRASS}"/>`, `<path d="M${x} 0 V${y - 11}"/><path d="M${x - 7} ${y - 4} h14 l-3 14 h-8z"/><path d="M${x - 9} ${y - 4} l9 -7 l9 7z"/>`));
// an Otaru glass lamp: a coloured glass bell on a cord, lit
const glassLamp = (x, y, col = "#6FB0D0") => lampGlow(x, y + 6, 28) + g(`<path d="M${x} 0 V${y - 9}" stroke="${IRON}" stroke-width="1.2"/><path d="M${x - 10} ${y + 6} q0 -15 10 -15 q10 0 10 15z" fill="${col}" opacity=".88" ${L}/><path d="M${x - 5} ${y - 4} q-2 5 -1 9" stroke="${CREAM}" stroke-width="1.4" fill="none" opacity=".7"/><path d="M${x - 11} ${y + 6} h22" stroke="${BRASS}" stroke-width="2"/><circle cx="${x}" cy="${y + 9}" r="3.2" fill="#FFF3C4"/>`);
// a glass float in its rope net
const gfloat = (x, y, r, col) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity=".9" ${L}/><path d="M${x - r} ${y} q${r} ${r*.55} ${r*2} 0 M${x} ${y - r} q${-r*.55} ${r} 0 ${r*2} M${x} ${y - r} q${r*.55} ${r} 0 ${r*2}" fill="none" stroke="#C9B48A" stroke-width=".8"/><ellipse cx="${x - r*.38}" cy="${y - r*.4}" rx="${r*.26}" ry="${r*.16}" fill="${CREAM}" opacity=".75"/>`;
// a little glass animal: a cat, an owl or a fish
const gAnimal = (x, y, col, k = 0) => k % 3 === 0 ? `<ellipse cx="${x}" cy="${y - 4}" rx="5" ry="4.4" fill="${col}" opacity=".85" ${L}/><circle cx="${x + 3}" cy="${y - 10}" r="3.4" fill="${col}" opacity=".9" ${L}/><path d="M${x + 1} ${y - 12.5} l.6 -2.6 l1.6 1.8 M${x + 4} ${y - 13} l1 -2.4 l1.2 2" fill="${col}" ${L}/><path d="M${x - 5} ${y - 4} q-4 -2 -3 -7" fill="none" stroke="${col}" stroke-width="1.6"/>`
  : k % 3 === 1 ? `<ellipse cx="${x}" cy="${y - 6}" rx="5" ry="6.4" fill="${col}" opacity=".88" ${L}/><circle cx="${x - 2}" cy="${y - 8}" r="1.7" fill="${CREAM}"/><circle cx="${x + 2}" cy="${y - 8}" r="1.7" fill="${CREAM}"/><path d="M${x - .8} ${y - 6} l.8 1.4 l.8 -1.4z" fill="${BRASS}"/>`
  : `<path d="M${x - 7} ${y - 5} q7 -6 12 0 q-5 6 -12 0z M${x + 5} ${y - 5} l4 -3 v6z" fill="${col}" opacity=".88" ${L}/><circle cx="${x - 4}" cy="${y - 5.6}" r=".9" fill="${IRON}"/>`;

/* ---------- walls and floors ---------- */
const stoneWall = (col, line, h = 200) => `<rect width="520" height="${h}" style="fill:${col}"/>` + Array.from({length: Math.ceil(h/22)}, (_, r) => {
  let s = `<path d="M0 ${r*22 + 22} H520" style="stroke:${line}" stroke-width="1.6"/>`, x = -rnd(r + 3)*30, k = 0;
  while (x < 520) { const w = 34 + rnd(r*17 + k)*36; s += `<path d="M${x.toFixed(1)} ${r*22} v22" style="stroke:${line}" stroke-width="1.6"/>`; if (rnd(r*31 + k*7) > .72) s += `<rect x="${x.toFixed(1)}" y="${r*22}" width="${w.toFixed(1)}" height="22" style="fill:${line}" opacity=".28"/>`; x += w; k++; }
  return s; }).join("");
const brickWall = (col, mortar, h = 200) => `<rect width="520" height="${h}" style="fill:${col}"/>${Array.from({length: Math.ceil(h/12)}, (_, r) => `<path d="M0 ${12 + r*12} H520" style="stroke:${mortar}" stroke-width="1.1"/>${Array.from({length: 14}, (_, c) => `<path d="M${c*40 + (r % 2)*20} ${r*12} v12" style="stroke:${mortar}" stroke-width="1.1"/>`).join("")}`).join("")}${Array.from({length: 34}, (_, i) => `<rect x="${Math.floor(rnd(i)*13)*40 + (Math.floor(rnd(i + 40)*16) % 2)*20}" y="${Math.floor(rnd(i + 40)*16)*12}" width="40" height="12" style="fill:#6A3428" opacity=".22"/>`).join("")}`;
const logWall = (h = 200) => `<rect width="520" height="${h}" style="fill:#B07E52"/>${Array.from({length: Math.ceil(h/20)}, (_, r) => `<rect y="${r*20}" width="520" height="20" style="fill:${r % 2 ? "#A87448" : "#B5824F"}"/><path d="M0 ${r*20 + 4} H520" style="stroke:#CC9A64" stroke-width="2" opacity=".7"/><path d="M0 ${r*20 + 19} H520" style="stroke:#6E4A2C" stroke-width="2"/>${[0, 1, 2].map(k => `<path d="M${(r*97 + k*181) % 520} ${r*20 + 9} q14 -2 28 0" fill="none" style="stroke:#8A5E38" stroke-width="1"/>`).join("")}`).join("")}`;
const tileWall = (col, line, h = 200) => `<rect width="520" height="${h}" style="fill:${col}"/>${Array.from({length: Math.ceil(h/16)}, (_, i) => `<path d="M0 ${16 + i*16} H520" style="stroke:${line}" stroke-width="1"/>`).join("")}${Array.from({length: 33}, (_, i) => `<path d="M${i*16} 0 V${h}" style="stroke:${line}" stroke-width="1"/>`).join("")}`;
const boardsF = (y0, col, line) => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${col}"/>${Array.from({length: 14}, (_, r) => `<path d="M0 ${y0 + r*32} H520" style="stroke:${line}" stroke-width="1.3"/>${[0, 1, 2, 3].map(c => `<path d="M${((r*131 + c*157) % 520)} ${y0 + r*32} v32" style="stroke:${line}" stroke-width="1.1"/>`).join("")}`).join("")}`;
const flagsF = (y0, col, line) => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${col}"/>${Array.from({length: 48}, (_, i) => `<rect x="${(i % 8)*80 + (Math.floor(i/8) % 2)*40 - 40}" y="${y0 + Math.floor(i/8)*74}" width="78" height="72" rx="5" style="fill:none;stroke:${line}" stroke-width="2"/>`).join("")}${Array.from({length: 9}, (_, i) => `<ellipse cx="${40 + rnd(i + 5)*440}" cy="${y0 + 60 + rnd(i + 15)*360}" rx="${22 + rnd(i)*26}" ry="${3 + rnd(i + 2)*3}" style="fill:#E6EEF2" opacity=".22"/>`).join("")}`;
const tilesF = (y0, a, b, line) => `<rect y="${y0}" width="520" height="${640 - y0}" style="fill:${a}"/>${Array.from({length: 11}, (_, r) => Array.from({length: 13}, (_, c) => (r + c) % 2 ? `<rect x="${c*40}" y="${y0 + r*40}" width="40" height="40" style="fill:${b}"/>` : "").join("")).join("")}${Array.from({length: 12}, (_, r) => `<path d="M0 ${y0 + r*40} H520" style="stroke:${line}" stroke-width="1.2"/>`).join("")}${Array.from({length: 13}, (_, c) => `<path d="M${c*40} ${y0} V640" style="stroke:${line}" stroke-width="1.2"/>`).join("")}`;

/* ---------- through the windows: cool northern light, and snow in the snow months ---------- */
let clipN = 0;
const flakes = (x, y, w, h, n = 14, seed = 0) => Array.from({length: n}, (_, i) => `<circle cx="${(x + 3 + rnd(i + seed)*(w - 6)).toFixed(1)}" cy="${(y + 3 + rnd(i + seed + 50)*(h - 6)).toFixed(1)}" r="${(.9 + rnd(i + seed + 9)*1.3).toFixed(1)}" fill="#FFFFFF" opacity=".9"/>`).join("");
const VIEWS = {
  // Otaru: stone warehouses across the canal, a gas lamp
  canal: (x, y, w, h, S) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S ? "#E2E8EE" : "#D6E4EC"}"/>`
    + [0, 1, 2].map(i => `<rect x="${x + i*w*.36 - 4}" y="${y + h*(.38 + (i % 2)*.06)}" width="${w*.34}" height="${h*.3}" fill="${["#9AA4AA", "#8E989E", "#A4ACB0"][i]}"/><path d="M${x + i*w*.36 - 6} ${y + h*(.38 + (i % 2)*.06)} l${w*.17 + 2} ${-h*.1} l${w*.17 + 2} ${h*.1}z" fill="${S ? "#FFFFFF" : "#5A5E62"}"/><rect x="${x + i*w*.36 + w*.12}" y="${y + h*(.5 + (i % 2)*.06)}" width="${w*.07}" height="${h*.1}" fill="#F3D88A"/>`).join("")
    + `<rect x="${x}" y="${y + h*.68}" width="${w}" height="${h*.16}" fill="#6E8E9E"/><path d="M${x + w*.1} ${y + h*.76} q6 -2 12 0 M${x + w*.55} ${y + h*.8} q6 -2 12 0" stroke="#B9D2DC" stroke-width="1.2" fill="none"/><rect x="${x}" y="${y + h*.84}" width="${w}" height="${h*.16}" fill="${S ? "#F6F8FA" : "#9A9282"}"/>`
    + `<path d="M${x + w*.78} ${y + h*.9} V${y + h*.5}" stroke="${IRON}" stroke-width="2"/><rect x="${x + w*.78 - 4}" y="${y + h*.44}" width="8" height="9" fill="#F6D88A" stroke="${IRON}"/>` + (S ? flakes(x, y, w, h, 16, x) : ""),
  // the green steam clock on the corner, puffing
  clock: (x, y, w, h, S) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S ? "#E2E8EE" : "#D6E4EC"}"/><rect x="${x}" y="${y + h*.46}" width="${w}" height="${h*.4}" fill="#A68A72"/><rect x="${x + w*.08}" y="${y + h*.54}" width="${w*.16}" height="${h*.16}" fill="#F3D88A"/><rect x="${x}" y="${y + h*.86}" width="${w}" height="${h*.14}" fill="${S ? "#F6F8FA" : "#8E8A84"}"/>`
    + `<rect x="${x + w*.42}" y="${y + h*.3}" width="${w*.24}" height="${h*.58}" fill="#3E6E52" stroke="${IRON}" stroke-width=".8"/><path d="M${x + w*.38} ${y + h*.3} h${w*.32} l${-w*.16} ${-h*.12}z" fill="#2E5A40" stroke="${IRON}" stroke-width=".8"/><circle cx="${x + w*.54}" cy="${y + h*.4}" r="${w*.09}" fill="${CREAM}" stroke="${BRASS}" stroke-width="1.2"/><path d="M${x + w*.54} ${y + h*.4} v${-w*.06} M${x + w*.54} ${y + h*.4} h${w*.05}" stroke="${IRON}" stroke-width=".9"/>`
    + `<g class="steam"><circle cx="${x + w*.56}" cy="${y + h*.13}" r="${w*.07}" fill="#FFFFFF" opacity=".85"/><circle cx="${x + w*.66}" cy="${y + h*.08}" r="${w*.09}" fill="#FFFFFF" opacity=".7"/><circle cx="${x + w*.76}" cy="${y + h*.04}" r="${w*.08}" fill="#FFFFFF" opacity=".55"/></g>` + (S ? flakes(x, y, w, h, 10, x + 3) : ""),
  // Sapporo: tall elms in the park and a far TV tower
  trees: (x, y, w, h, S) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S ? "#E4EAF0" : "#D3E2EA"}"/><path d="M${x + w*.8} ${y + h*.78} V${y + h*.2} M${x + w*.77} ${y + h*.78} l${w*.03} ${-h*.5} l${w*.03} ${h*.5}" stroke="#C86A3A" stroke-width="1.6" fill="none"/>`
    + [.18, .5].map((f, i) => `<path d="M${x + w*f} ${y + h*.86} V${y + h*.42}" stroke="#5A4636" stroke-width="3"/>` + (S ? `<path d="M${x + w*f} ${y + h*.55} l${-w*.12} ${-h*.16} M${x + w*f} ${y + h*.5} l${w*.12} ${-h*.18} M${x + w*f} ${y + h*.44} l${-w*.06} ${-h*.2}" stroke="#5A4636" stroke-width="1.6"/><path d="M${x + w*f - w*.13} ${y + h*.38} l${w*.04} 2 M${x + w*f + w*.1} ${y + h*.31} l${w*.03} 2" stroke="#FFFFFF" stroke-width="2"/>` : `<ellipse cx="${x + w*f}" cy="${y + h*.36}" rx="${w*.17}" ry="${h*.16}" fill="${i ? "#C99A3A" : "#7FA35A"}"/><ellipse cx="${x + w*f + w*.05}" cy="${y + h*.3}" rx="${w*.1}" ry="${h*.1}" fill="${i ? "#D9B04A" : "#94B86A"}"/>`)).join("")
    + `<rect x="${x}" y="${y + h*.84}" width="${w}" height="${h*.16}" fill="${S ? "#F6F8FA" : "#8FA878"}"/>` + (S ? flakes(x, y, w, h, 18, x + 7) : ""),
  // a snowy lane: the shop opposite with its lamp, a bicycle under the eaves
  street: (x, y, w, h, S) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S ? "#E2E8EE" : "#D6E4EC"}"/><rect x="${x}" y="${y + h*.3}" width="${w*.6}" height="${h*.5}" fill="#8A6A52"/><path d="M${x - 2} ${y + h*.32} l${w*.32} ${-h*.14} l${w*.32} ${h*.14}z" fill="${S ? "#FFFFFF" : "#4E5A62"}"/><rect x="${x + w*.12}" y="${y + h*.46}" width="${w*.18}" height="${h*.16}" fill="#F3D88A"/><circle cx="${x + w*.48}" cy="${y + h*.5}" r="${w*.05}" fill="${RED}"/>`
    + `<rect x="${x}" y="${y + h*.8}" width="${w}" height="${h*.2}" fill="${S ? "#F6F8FA" : "#8E8A84"}"/><path d="M${x + w*.78} ${y + h*.82} V${y + h*.34}" stroke="${IRON}" stroke-width="2"/>` + (S ? flakes(x, y, w, h, 14, x + 11) : ""),
  // Mount Yotei: the near-perfect cone, birches, the ski run and lift
  yotei: (x, y, w, h, S) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S ? "#BCCCDA" : "#CFE0EC"}"/><rect x="${x}" y="${y}" width="${w}" height="${h*.3}" fill="#BCD4E6"/>`
    + `<path d="M${x - 10} ${y + h*.78} L${x + w*.42} ${y + h*.16} Q${x + w*.5} ${y + h*.1} ${x + w*.58} ${y + h*.16} L${x + w + 10} ${y + h*.78}z" fill="${S ? "#F4F7FA" : "#7E94A6"}"/>` + (S ? `<path d="M${x + w*.5} ${y + h*.12} Q${x + w*.56} ${y + h*.1} ${x + w*.58} ${y + h*.16} L${x + w + 10} ${y + h*.78} H${x + w*.62}z" fill="#C9D6E4"/>` : "")
    + `<path d="M${x + w*.3} ${y + h*.33} L${x + w*.42} ${y + h*.16} Q${x + w*.5} ${y + h*.1} ${x + w*.58} ${y + h*.16} L${x + w*.7} ${y + h*.33} l${-w*.06} ${h*.04} l${-w*.05} ${-h*.05} l${-w*.06} ${h*.06} l${-w*.06} ${-h*.06} l${-w*.05} ${h*.05}z" fill="#FFFFFF"/>`
    + `<path d="M${x + w*.5} ${y + h*.14} l${-w*.1} ${h*.6} M${x + w*.6} ${y + h*.22} l${w*.12} ${h*.5}" stroke="${S ? "#C9D6E2" : "#6A8092"}" stroke-width="1.4" fill="none"/>`
    + `<path d="M${x} ${y + h*.74} q${w*.3} ${-h*.08} ${w*.6} ${-h*.02} t${w*.4} 0 V${y + h} H${x}z" fill="${S ? "#FAFCFD" : "#8FA878"}"/>`
    + `<path d="M${x + w*.62} ${y + h*.9} L${x + w*.86} ${y + h*.56}" stroke="${IRON}" stroke-width=".9"/>${[0, 1, 2].map(i => `<path d="M${x + w*(.66 + i*.07)} ${y + h*(.85 - i*.1)} v6" stroke="${IRON}" stroke-width="1.6"/>`).join("")}`
    + [.06, .14, .9].map((f, i) => `<path d="M${x + w*f} ${y + h} V${y + h*(.5 + i*.06)}" stroke="#6E665A" stroke-width="5"/><path d="M${x + w*f} ${y + h} V${y + h*(.5 + i*.06) + 1}" stroke="#F4F2EA" stroke-width="3.4"/>${[0, 1, 2].map(k => `<path d="M${x + w*f - 1.4} ${y + h*(.6 + k*.1 + i*.03)} h2.4" stroke="#2F2B28" stroke-width="1.4"/>`).join("")}<path d="M${x + w*f} ${y + h*(.62 + i*.06)} l${w*.03} ${-h*.06} M${x + w*f} ${y + h*(.7 + i*.06)} l${-w*.03} ${-h*.06}" stroke="#F4F2EA" stroke-width="1.4"/>` + (S ? "" : `<ellipse cx="${x + w*f}" cy="${y + h*(.52 + i*.06)}" rx="${w*.04}" ry="${h*.07}" fill="${i ? "#D9B04A" : "#C9A040"}" opacity=".9"/>`)).join("")
    + (S ? flakes(x, y, w, h, 26, 91) : ""),
  // Furano: the flower stripes running up the hill, the mountains behind
  flowers: (x, y, w, h, S) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#D3E4EE"/><path d="M${x} ${y + h*.42} l${w*.2} ${-h*.16} l${w*.14} ${h*.08} l${w*.22} ${-h*.12} l${w*.24} ${h*.14} l${w*.2} ${-h*.06} V${y + h*.5} H${x}z" fill="#9AAAB8"/><path d="M${x + w*.14} ${y + h*.32} l${w*.06} ${-h*.06} l${w*.06} ${h*.05} M${x + w*.5} ${y + h*.24} l${w*.06} ${-h*.06} l${w*.07} ${h*.05}" stroke="#FFFFFF" stroke-width="2.4" fill="none"/>`
    + (S ? `<path d="M${x} ${y + h*.46} Q${x + w*.5} ${y + h*.34} ${x + w} ${y + h*.5} V${y + h} H${x}z" fill="#F6F8FA"/><path d="M${x + w*.1} ${y + h*.7} q${w*.4} ${-h*.12} ${w*.8} ${-h*.04}" stroke="#C9D6E2" stroke-width="1.4" fill="none"/>` + flakes(x, y, w, h, 18, 41)
      : `<path d="M${x} ${y + h*.46} Q${x + w*.5} ${y + h*.34} ${x + w} ${y + h*.5} V${y + h} H${x}z" fill="#8FB070"/>` + ["#8E7BC0", "#F3F0F4", "#D84A3A", "#F2C640", "#E58AB0", "#8E7BC0", "#F09A3A"].map((c, i) => `<path d="M${x + w*(i*.16 - .1)} ${y + h} L${x + w*(.3 + i*.11)} ${y + h*(.44 - i*.003)} L${x + w*(.36 + i*.11)} ${y + h*.45} L${x + w*(i*.16 + .03)} ${y + h}z" fill="${c}"/>`).join("")
      + `<path d="M${x + w*.86} ${y + h*.48} V${y + h*.3}" stroke="#5A4636" stroke-width="2"/><ellipse cx="${x + w*.86}" cy="${y + h*.27}" rx="${w*.04}" ry="${h*.07}" fill="#5E8A48"/>`)
};
// a window: the view clipped to it (square or arched), glazing bars, a sill, and snow banked on the outside ledge
const win = (x, y, w, h, kind, o = {}) => {
  const S = snowy(), id = `hkrv${clipN++}`, shape = o.arch ? `M${x} ${y + h} V${y + w/2} A${w/2} ${w/2} 0 0 1 ${x + w} ${y + w/2} V${y + h}z` : `M${x} ${y} h${w} v${h} h${-w}z`;
  const frame = o.frame || CREAM, cols = o.cols ?? 2, rows = o.rows ?? 2;
  const bars = Array.from({length: cols - 1}, (_, i) => `<path d="M${x + w*(i + 1)/cols} ${y} V${y + h}" style="stroke:${frame}" stroke-width="${o.bar || 3}"/>`).join("") + Array.from({length: rows - 1}, (_, i) => `<path d="M${x} ${y + (o.arch ? w/2 : 0) + (h - (o.arch ? w/2 : 0))*(i + 1)/rows} H${x + w}" style="stroke:${frame}" stroke-width="${o.bar || 3}"/>`).join("");
  return g(`<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs><g clip-path="url(#${id})">${VIEWS[kind](x, y, w, h, S)}${S ? `<path d="M${x} ${y + h} q${w*.2} -9 ${w*.4} -4 q${w*.3} -8 ${w*.6} -2 V${y + h}z" fill="#FFFFFF"/>` : ""}${bars}<path d="M${x + 6} ${y + h - 8} l${w*.3} ${-h*.5}" stroke="#FFFFFF" stroke-width="5" opacity=".18"/></g>`
    + sk("", `<path d="${shape}"/>`) + `<path d="${shape}" fill="none" stroke="${frame}" stroke-width="${o.edge || 5}"/>` + `<rect x="${x - 7}" y="${y + h}" width="${w + 14}" height="7" rx="2" fill="${o.sill || frame}" ${L}/>`);
};

/* ---------- the glassworks (Otaru) ---------- */
function glassRoom(){
  const wall = g(stoneWall("#A9B3B8", "#8A959C") + `<rect width="520" height="16" style="fill:#4A3C30"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${i*104 - 10} 16 l22 -16 M${i*104 + 32} 16 l-22 -16" stroke="#3A2E24" stroke-width="3"/>`).join("")}<rect y="190" width="520" height="10" style="fill:#7E888E"/>`)
    // floats to the ceiling: the left wall's shelves
    + g(sk(`<rect x="6" y="18" width="98" height="182" style="fill:#7A5A3E"/>`, `<rect x="6" y="18" width="98" height="182"/>`) + `<rect x="12" y="20" width="86" height="176" fill="#5E4430"/>`
      + [60, 102, 144, 186].map((sy, r) => `<rect x="8" y="${sy}" width="94" height="5" fill="#B98A5A" ${L}/>` + Array.from({length: 4}, (_, k) => { const rr = 8 + rnd(r*5 + k)*4; return gfloat(22 + k*22, sy - rr, rr, FLOATS[(r*3 + k) % 8]); }).join("")).join(""))
    // the right wall's shelves: vases, glass lamps, the animals
    + g(sk(`<rect x="446" y="18" width="70" height="182" style="fill:#7A5A3E"/>`, `<rect x="446" y="18" width="70" height="182"/>`) + `<rect x="451" y="20" width="60" height="176" fill="#5E4430"/>`
      + [60, 102, 144, 186].map((sy, r) => `<rect x="448" y="${sy}" width="66" height="5" fill="#B98A5A" ${L}/>` + (r % 2 ? [0, 1, 2, 3, 4].map(k => gAnimal(458 + k*12, sy, FLOATS[(k + r) % 8], k + r)).join("")
        : [0, 1, 2].map(k => `<path d="M${458 + k*20} ${sy} q-6 -10 -1 -18 v-6 h6 v6 q5 8 -1 18z" fill="${FLOATS[(k*2 + r) % 8]}" opacity=".88" ${L}/><path d="M${456 + k*20} ${sy - 14} q-1 5 1 9" stroke="${CREAM}" stroke-width="1.2" fill="none" opacity=".7"/>`).join(""))).join(""))
    // the blowpipes standing in their rack
    + g(sk(`<rect x="248" y="112" width="84" height="7" style="fill:#7A5A3E"/><rect x="246" y="232" width="88" height="16" style="fill:#6B4A34"/>`, `<rect x="248" y="112" width="84" height="7"/><rect x="246" y="232" width="88" height="16"/>`)
      + Array.from({length: 8}, (_, i) => `<path d="M${256 + i*10} 234 L${254 + i*10 + (i % 3)} 70" stroke="#7E8890" stroke-width="3.2"/><path d="M${256 + i*10} 234 L${254 + i*10 + (i % 3)} 70" stroke="#C9CFD4" stroke-width="1"/><rect x="${251 + i*10 + (i % 3)}" y="64" width="6" height="8" rx="2" fill="#5A4636" ${L}/>`).join("") + `<rect x="248" y="150" width="84" height="6" fill="#7A5A3E" ${L}/>`)
    + signBoard(290, 40, 96, "硝子 GLASS", "#3E5A6E")
    + win(344, 52, 88, 124, "canal", {arch: true, frame: "#5E4430", cols: 2, rows: 3})
    + glassLamp(118, 64, "#6FB0D0") + glassLamp(438, 40, "#D9A040") + glassLamp(340, 30, "#8CC4A0");
  // the furnace: a brick dome on the back wall, the round mouth white-orange, a hood above
  const furnace = spot("hkfurnace", 175, 268, "The furnace", hovE(175, 268, 38, 9),
    `<ellipse cx="175" cy="254" rx="80" ry="16" fill="#F5A04A" opacity=".24"/>`
    + sk(`<path d="M136 16 h78 l14 38 h-106z" style="fill:#4A5054"/><path d="M114 248 V122 Q114 66 175 66 Q236 66 236 122 V248z" style="fill:#B0603E"/><rect x="108" y="236" width="134" height="14" rx="2" style="fill:#6E5A4E"/>`,
      `<path d="M136 16 h78 l14 38 h-106z"/><path d="M114 248 V122 Q114 66 175 66 Q236 66 236 122 V248z"/><rect x="108" y="236" width="134" height="14" rx="2"/>`)
    + g(Array.from({length: 13}, (_, r) => `<path d="M${r < 4 ? 130 - r*4 : 116} ${88 + r*12} H${r < 4 ? 220 + r*4 : 234}" stroke="#8E4A30" stroke-width="1"/>`).join("")
      + `<path d="M114 140 H236 M114 200 H236" stroke="${IRON}" stroke-width="3"/><circle cx="175" cy="164" r="30" fill="#3A2A24"/><defs><radialGradient id="hkfire"><stop offset="0" stop-color="#FFF6D0"/><stop offset=".55" stop-color="#FFC060"/><stop offset="1" stop-color="#E8642A"/></radialGradient></defs>`
      + `<circle class="flick" cx="175" cy="164" r="23" fill="url(#hkfire)"/><rect x="150" y="212" width="50" height="20" rx="3" fill="#3A2A24"/><rect x="155" y="216" width="40" height="12" rx="2" fill="#E8742A" opacity=".85"/>`)
    + lampGlow(175, 164, 66)
    + lab(138, 312, "The furnace", "#F6E3B4", 9));
  // the display table down the left: floats in a tray, glass animals, cups and little vases
  const table = g(sk(`<rect x="30" y="250" width="70" height="226" rx="3" style="fill:#C9A87A"/><rect x="30" y="468" width="70" height="12" rx="2" style="fill:#8A6A42"/>`, `<rect x="30" y="250" width="70" height="226" rx="3"/><rect x="30" y="468" width="70" height="12" rx="2"/>`)
    + `<rect x="36" y="258" width="58" height="82" rx="2" fill="#E8DCC0" ${L}/>` + [0, 1, 2, 3, 4, 5].map(i => gfloat(50 + (i % 2)*30, 274 + Math.floor(i/2)*24, 10, FLOATS[(i*3) % 8])).join("")
    + `<rect x="36" y="348" width="58" height="56" rx="2" fill="#2E3A5A" ${L}/>` + Array.from({length: 8}, (_, i) => gAnimal(46 + (i % 4)*13, 370 + Math.floor(i/4)*26, FLOATS[(i + 2) % 8], i)).join("")
    + [0, 1, 2, 3, 4, 5].map(i => `<path d="M${42 + (i % 3)*18} ${428 + Math.floor(i/3)*24} h12 l-2 14 h-8z" fill="${FLOATS[(i*5) % 8]}" opacity=".85" ${L}/>`).join("")
    + `<rect x="58" y="462" width="30" height="10" rx="1" fill="${CREAM}" ${L}/>` + txt(73, 470, "Otaru", 6.5, "#3B3530"));
  // the annealing oven (floats cooling slowly) and the cooling rack, down the right
  const oven = g(sk(`<rect x="420" y="250" width="70" height="104" style="fill:#A65A40"/><rect x="420" y="360" width="70" height="116" rx="2" style="fill:#7A5A3E"/>`, `<rect x="420" y="250" width="70" height="104"/><rect x="420" y="360" width="70" height="116" rx="2"/>`)
    + Array.from({length: 8}, (_, r) => `<path d="M420 ${262 + r*12} H490" stroke="#8A4430" stroke-width="1"/>`).join("") + `<rect x="430" y="276" width="50" height="50" rx="3" fill="#5A6066" ${L}/><rect x="440" y="288" width="30" height="18" rx="2" fill="#E8964A" opacity=".75"/><path d="M432 314 h46" stroke="${BRASS}" stroke-width="2"/><circle cx="455" cy="340" r="7" fill="${CREAM}" ${L}/><path d="M455 340 l4 -3" stroke="${RED}" stroke-width="1.2"/>`
    + [0, 1, 2, 3].map(r => `<path d="M424 ${388 + r*24} H486" stroke="#B98A5A" stroke-width="2"/>` + [0, 1, 2].map(k => gfloat(436 + k*19, 380 + r*24, 7, FLOATS[(r*2 + k + 1) % 8])).join("")).join("") + txt(455, 470, "cooling", 7, "#F6E3B4"));
  // the bench in the middle: the steel marver, the long arms, a pipe with a glowing gob, the jacks
  const bench = spot("hk_glass", 260, 366, "The glassblowing bench", hovE(260, 366, 74, 11),
    sk(`<rect x="184" y="304" width="152" height="36" rx="2" style="fill:#6B4A34"/><rect x="180" y="282" width="160" height="24" rx="3" style="fill:#B98A5A"/><rect x="188" y="285" width="48" height="18" rx="2" style="fill:#C9CFD4"/>`, `<rect x="184" y="304" width="152" height="36" rx="2"/><rect x="180" y="282" width="160" height="24" rx="3"/><rect x="188" y="285" width="48" height="18" rx="2"/>`)
    + g(`<path d="M194 288 h38" stroke="${CREAM}" stroke-width="2" opacity=".7"/><path d="M240 286 H334 M240 302 H334" stroke="#7E8890" stroke-width="2.4"/><path d="M252 294 L334 290" stroke="#5A6066" stroke-width="3.4"/>${[0, 1, 2].map(i => `<rect x="${200 + i*44}" y="312" width="36" height="22" rx="2" fill="#7A5A3E"/>`).join("")}`
      + `<circle cx="246" cy="294" r="8" fill="url(#hkfire)" ${L}/><path d="M300 284 l18 6 M300 288 l18 2" stroke="#9AA6AC" stroke-width="1.6"/><rect x="322" y="282" width="12" height="8" rx="1" fill="#8A6A42" ${L}/>`)
    + lampGlow(246, 294, 30) + lab(260, 390, "Blow a float", "#C3DDF3", 10));
  // a crate of floats packed in straw, a water barrel
  const edges = g(sk(`<rect x="34" y="568" width="56" height="30" style="fill:#B98A5A"/><rect x="448" y="560" width="40" height="38" rx="4" style="fill:#7A5A3E"/>`, `<rect x="34" y="568" width="56" height="30"/><rect x="448" y="560" width="40" height="38" rx="4"/>`)
    + Array.from({length: 10}, (_, i) => `<path d="M${38 + i*5} 570 l${i % 2 ? 3 : -3} -6" stroke="#E2C27A" stroke-width="1.4"/>`).join("") + gfloat(50, 564, 8, FLOATS[0]) + gfloat(70, 563, 8, FLOATS[4]) + `<ellipse cx="468" cy="562" rx="18" ry="4" fill="#6FA3B8" ${L}/><path d="M448 572 h40 M448 588 h40" stroke="${IRON}" stroke-width="2"/>` + txt(62, 590, "OTARU", 7, "#5A3E2A", ` font-weight="700"`));
  return g(flagsF(200, "#9C968C", "#837D73")) + wall + table + oven + furnace + bench + edges + exit("#3E5A6E");
}

/* ---------- the music box hall (Otaru) ---------- */
const mbox = (x, y, w, h, col, open = true) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="1" fill="${col}" ${L}/>` + (open ? `<path d="M${x} ${y - h} l${w*.15} ${-h*.7} h${w*.7} l${w*.15} ${h*.7}z" fill="${col}" opacity=".85" ${L}/><path d="M${x + w*.25} ${y - h - h*.35} h${w*.5}" stroke="${BRASS}" stroke-width="1"/>` : `<rect x="${x - 1}" y="${y - h - 2}" width="${w + 2}" height="3" fill="${col}" ${L}/>`) + `<circle cx="${x + w/2}" cy="${y - h/2}" r="${Math.max(1, h*.12)}" fill="${BRASS}"/>`;
const MBC = ["#8A3A2E", "#3E5A4A", "#C9A24A", "#5E4430", "#2E4A6A", "#E8D8C0", "#A8604A"];
function musicRoom(){
  const wall = g(brickWall("#A8563E", "#C4937E") + `<rect width="520" height="14" style="fill:${IRON}"/>${Array.from({length: 26}, (_, i) => `<circle cx="${10 + i*20}" cy="7" r="1.6" fill="#6E7A7C"/>`).join("")}<rect y="190" width="520" height="10" style="fill:#5E3A2E"/>`)
    // shelves of music boxes up both walls
    + [[4, 100], [416, 100]].map(([x0, w], s) => g(sk(`<rect x="${x0}" y="16" width="${w}" height="184" style="fill:#5E3A2A"/>`, `<rect x="${x0}" y="16" width="${w}" height="184"/>`)
      + [56, 96, 136, 176].map((sy, r) => `<rect x="${x0 + 2}" y="${sy}" width="${w - 4}" height="5" fill="#B98A5A" ${L}/>` + Array.from({length: 4}, (_, k) => { const bw = 14 + rnd(r*9 + k + s*40)*8, bh = 8 + rnd(r*5 + k + s*20)*8; return mbox(x0 + 6 + k*23, sy, bw, bh, MBC[(r*3 + k + s*2) % 7], (k + r + s) % 2 === 0); }).join("")).join(""))).join("")
    // the iron pillars
    + [108, 398].map(x => g(sk(`<rect x="${x}" y="20" width="14" height="222" style="fill:#2F4A40"/><rect x="${x - 6}" y="14" width="26" height="10" style="fill:#2F4A40"/><rect x="${x - 5}" y="236" width="24" height="12" style="fill:#2F4A40"/>`, `<rect x="${x}" y="20" width="14" height="222"/><rect x="${x - 6}" y="14" width="26" height="10"/><rect x="${x - 5}" y="236" width="24" height="12"/>`) + `<path d="M${x + 4} 26 V234" stroke="#5E8070" stroke-width="2"/>`)).join("")
    + win(132, 44, 50, 128, "canal", {arch: true, frame: "#2F4A40", cols: 2, rows: 3, bar: 2.4})
    + win(338, 44, 50, 128, "clock", {arch: true, frame: "#2F4A40", cols: 2, rows: 3, bar: 2.4})
    + signBoard(260, 34, 124, "オルゴール堂", "#2F4A40", "#F3E1A0", 11)
    + hangLamp(196, 70, 36) + hangLamp(324, 70, 36);
  // the great antique cylinder music box: a mahogany cabinet on legs, the glass lid on the brass cylinder and comb
  const big = g(sk(`<path d="M200 120 h120 v-8 l-10 -10 h-100 l-10 10z" style="fill:#7A3A2A"/><rect x="198" y="120" width="124" height="90" rx="2" style="fill:#6B3424"/><rect x="206" y="128" width="108" height="44" rx="2" style="fill:#2E2420"/><path d="M204 210 v36 M316 210 v36 M224 210 v32 M296 210 v32" style="stroke:#5A2A1E" stroke-width="6"/>`,
    `<rect x="198" y="120" width="124" height="90" rx="2"/><rect x="206" y="128" width="108" height="44" rx="2"/><path d="M204 210 v36 M316 210 v36"/>`)
    + `<rect x="214" y="136" width="92" height="20" rx="9" fill="${BRASS}" ${L}/>${Array.from({length: 40}, (_, i) => `<circle cx="${218 + (i % 20)*4.4}" cy="${141 + Math.floor(i/20)*8 + (i % 3)}" r=".8" fill="#5A4636"/>`).join("")}<path d="M214 162 h92" stroke="#D9DEE2" stroke-width="3"/>${Array.from({length: 23}, (_, i) => `<path d="M${215 + i*4} 160 v6" stroke="#9AA6AC" stroke-width="1.2"/>`).join("")}`
    + `<path d="M210 130 l18 36" stroke="#FFFFFF" stroke-width="4" opacity=".16"/><rect x="246" y="184" width="28" height="12" rx="1" fill="${BRASS}" ${L}/>` + txt(260, 193, "1890", 7, "#5A3E2A", ` font-weight="700"`)
    + `<path d="M322 160 h10 v-14" stroke="${BRASS}" stroke-width="2.6" fill="none"/><circle cx="332" cy="144" r="3" fill="#5A2A1E"/>` + Array.from({length: 4}, (_, i) => `<text x="${226 + i*24}" y="${110 - (i % 2)*8}" font-size="10" fill="#F3E1A0" opacity=".9">♪</text>`).join(""));
  // the glass case down the left: music boxes on red velvet; the tiered stand down the right: carousels and little houses
  const caseL = g(sk(`<rect x="30" y="250" width="70" height="270" rx="3" style="fill:#5E3A2A"/><rect x="36" y="256" width="58" height="258" rx="2" style="fill:#8A2E34"/>`, `<rect x="30" y="250" width="70" height="270" rx="3"/><rect x="36" y="256" width="58" height="258" rx="2"/>`)
    + Array.from({length: 12}, (_, i) => mbox(42 + (i % 2)*26, 292 + Math.floor(i/2)*38, 20, 14, MBC[(i*2 + 1) % 7], i % 3 !== 1)).join("")
    + `<rect x="36" y="256" width="58" height="258" rx="2" fill="#D6ECF4" opacity=".22"/><path d="M42 300 l40 -40 M42 420 l46 -46 M44 500 l40 -40" stroke="#FFFFFF" stroke-width="3" opacity=".35"/>`);
  const carousel = (x, y, c) => `<path d="M${x} ${y - 30} v24" stroke="${BRASS}" stroke-width="1.6"/><path d="M${x - 13} ${y - 26} q13 -14 26 0z" fill="${c}" ${L}/><path d="M${x - 13} ${y - 26} h26" stroke="${CREAM}" stroke-width="1.6" stroke-dasharray="3 3"/><path d="M${x - 9} ${y - 24} v14 M${x + 9} ${y - 24} v14" stroke="${BRASS}" stroke-width="1"/><ellipse cx="${x - 5}" cy="${y - 13}" rx="3.6" ry="2.4" fill="${CREAM}" ${L}/><ellipse cx="${x + 5}" cy="${y - 15}" rx="3.6" ry="2.4" fill="#C9A0A0" ${L}/><rect x="${x - 15}" y="${y - 8}" width="30" height="8" rx="2" fill="#5E3A2A" ${L}/>`;
  const house = (x, y, c) => `<rect x="${x - 9}" y="${y - 14}" width="18" height="14" fill="${c}" ${L}/><path d="M${x - 11} ${y - 14} l11 -9 l11 9z" fill="#5E3A2A" ${L}/><rect x="${x - 3}" y="${y - 10}" width="6" height="6" fill="#F3D88A" ${L}/>`;
  const caseR = g(sk(`<rect x="420" y="250" width="70" height="270" rx="3" style="fill:#7A5A3E"/>`, `<rect x="420" y="250" width="70" height="270" rx="3"/>`) + [0, 1, 2].map(i => `<rect x="${424 + i*4}" y="${256 + i*0}" width="${62 - i*8}" height="258" fill="${["#9A7650", "#B98A5A", "#C99A66"][i]}" opacity=".9"/>`).join("")
    + [300, 370, 440, 506].map((y, i) => (i % 2 ? house(440, y, "#E8D8C0") + house(470, y - 4, "#9ABCC8") + mbox(448, y + 26, 18, 10, MBC[i + 2]) : carousel(455, y, ["#B8432F", "#3E5A4A"][i/2 % 2]) + mbox(428, y + 2, 12, 8, MBC[i]) + mbox(472, y + 2, 12, 8, MBC[i + 3], false))).join(""));
  // the counter: a glass top over little boxes, an open box with its comb, a wrapped present, the bell
  const ctr = spot("hk_musicbox", 260, 426, "The counter", hovE(260, 426, 80, 12),
    sk(`<rect x="184" y="378" width="152" height="22" rx="2" style="fill:#5E3A2A"/><rect x="180" y="360" width="160" height="20" rx="3" style="fill:#7A4A32"/>`, `<rect x="184" y="378" width="152" height="22" rx="2"/><rect x="180" y="360" width="160" height="20" rx="3"/>`)
    + g(`<rect x="188" y="363" width="144" height="14" rx="2" fill="#8A2E34"/>` + Array.from({length: 6}, (_, i) => `<rect x="${194 + i*23}" y="366" width="16" height="8" rx="1" fill="${MBC[(i + 2) % 7]}" ${L}/>`).join("") + `<rect x="188" y="363" width="144" height="14" rx="2" fill="#D6ECF4" opacity=".3"/>`
      + mbox(196, 362, 26, 12, "#C9A24A") + `<rect x="236" y="348" width="22" height="14" fill="#E8D8C0" ${L}/><path d="M247 348 v14 M236 355 h22" stroke="${RED}" stroke-width="2"/><path d="M243 348 q4 -6 4 0 q0 -6 4 0" fill="none" stroke="${RED}" stroke-width="1.6"/>`
      + `<path d="M300 362 q6 -14 12 0z" fill="${BRASS}" ${L}/><circle cx="306" cy="349" r="1.8" fill="${BRASS}"/><rect x="270" y="354" width="22" height="8" rx="1" fill="#E8DCC0" ${L}/>` + txt(281, 360, "¥", 6, "#5A3E2A"))
    + lab(260, 450, "Choose a music box", "#C3DDF3", 10));
  // a long red runner to the door, an umbrella stand, a palm
  const rug = g(`<rect x="214" y="408" width="92" height="190" fill="#7A2E2E"/><rect x="220" y="414" width="80" height="178" fill="none" stroke="#C9A24A" stroke-width="2"/>${[0, 1, 2].map(i => `<path d="M260 ${440 + i*56} l10 10 l-10 10 l-10 -10z" fill="none" stroke="#C9A24A" stroke-width="1.4"/>`).join("")}`);
  const edges = g(sk(`<path d="M38 598 h24 l-2 -30 h-20z" style="fill:#2F4A40"/><path d="M458 598 h28 l-4 -22 h-20z" style="fill:#C9785A"/>`, `<path d="M38 598 h24 l-2 -30 h-20z"/><path d="M458 598 h28 l-4 -22 h-20z"/>`)
    + `<path d="M44 568 l-4 -24 M50 568 v-26 M56 568 l4 -22" stroke="${IRON}" stroke-width="2.6"/><path d="M36 544 q4 -6 8 0 M56 546 q4 -6 8 0" stroke="${RED}" stroke-width="2" fill="none"/>`
    + [[-14, -18], [0, -26], [14, -16], [-6, -30], [8, -32]].map(([dx, dy]) => `<path d="M472 576 q${dx*.5} ${dy*.5} ${dx} ${dy}" stroke="#4E7A3A" stroke-width="5" stroke-linecap="round" fill="none"/>`).join(""));
  return g(boardsF(200, "#8E6448", "#73503A")) + rug + wall + big + caseL + caseR + edges + ctr + exit("#2F4A40");
}

/* ---------- the beer factory (Sapporo) ---------- */
const star = (x, y, r, col = "#D8382E") => `<path d="${Array.from({length: 10}, (_, i) => { const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*.42 : r; return `${i ? "L" : "M"}${(x + Math.cos(a)*rr).toFixed(1)} ${(y + Math.sin(a)*rr).toFixed(1)}`; }).join(" ")}z" fill="${col}" ${L}/>`;
const kettle = cx => `<rect x="${cx - 6}" y="0" width="12" height="90" fill="${COPPER}" ${L}/><path d="M${cx - 8} 40 h16" stroke="${BRASS}" stroke-width="3"/>`
  + sk(`<path d="M${cx - 64} 158 Q${cx - 64} 86 ${cx} 86 Q${cx + 64} 86 ${cx + 64} 158z" style="fill:#C8783E"/><rect x="${cx - 66}" y="154" width="132" height="132" style="fill:${COPPER}"/>`,
    `<path d="M${cx - 64} 158 Q${cx - 64} 86 ${cx} 86 Q${cx + 64} 86 ${cx + 64} 158z"/><rect x="${cx - 66}" y="154" width="132" height="132"/>`)
  + `<rect x="${cx - 72}" y="280" width="144" height="40" rx="2" fill="#E8E4DA" stroke="#3a2e28" stroke-width="1.4"/>`
  + `<path d="M${cx - 44} 100 Q${cx - 50} 120 ${cx - 50} 150 V284" stroke="#EBB27A" stroke-width="9" fill="none" opacity=".7"/><path d="M${cx + 40} 160 V284" stroke="#9A5430" stroke-width="12" opacity=".5"/>`
  + `<path d="M${cx - 66} 156 h132 M${cx - 66} 220 h132 M${cx - 66} 284 h132" stroke="${BRASS}" stroke-width="3"/><ellipse cx="${cx}" cy="118" rx="16" ry="10" fill="#D9A24A" ${L}/><ellipse cx="${cx}" cy="118" rx="10" ry="6" fill="#6E8E9E" ${L}/><path d="M${cx - 6} 115 l5 -2" stroke="${CREAM}" stroke-width="1.4"/>`
  + `<circle cx="${cx + 30}" cy="190" r="8" fill="${CREAM}" ${L}/><path d="M${cx + 30} 190 l4 -4" stroke="${RED}" stroke-width="1.2"/><circle cx="${cx - 30}" cy="252" r="9" fill="none" stroke="${RED}" stroke-width="2.4"/><path d="M${cx - 39} 252 h18 M${cx - 30} 243 v18" stroke="${RED}" stroke-width="1.6"/>`
  + Array.from({length: 7}, (_, i) => `<path d="M${cx - 72 + i*24} 280 v40" stroke="#C9C3B6" stroke-width="1"/>`).join("") + `<path d="M${cx - 72} 300 h144" stroke="#C9C3B6" stroke-width="1"/>`
  + `<path d="M${cx - 72} 304 H${cx + 72}" stroke="${BRASS}" stroke-width="3.4"/>${[-68, -24, 24, 68].map(d => `<path d="M${cx + d} 304 v16" stroke="${BRASS}" stroke-width="3"/>`).join("")}`
  + `<g class="steam"><circle cx="${cx}" cy="6" r="8" fill="#FFFFFF" opacity=".5"/></g>`;
function beerRoom(){
  const wall = g(brickWall("#9C4A36", "#C08672") + `<rect width="520" height="14" style="fill:${IRON}"/><rect y="190" width="520" height="10" style="fill:#5E3A2E"/>`)
    + win(216, 58, 88, 132, "trees", {arch: true, frame: CREAM, cols: 2, rows: 3})
    + win(6, 48, 40, 120, "trees", {arch: true, frame: CREAM, cols: 1, rows: 3, bar: 2})
    + win(474, 48, 40, 120, "trees", {arch: true, frame: CREAM, cols: 1, rows: 3, bar: 2})
    + g(`<path d="M0 16 q65 18 130 0 t130 0 t130 0 t130 0" fill="none" stroke="#5E7A3A" stroke-width="1.6"/>` + Array.from({length: 26}, (_, i) => { const x = 10 + i*20, y = 16 + Math.sin((x % 130)/130*Math.PI)*9*(Math.floor(x/130) % 2 ? -1 : 1) + 4; return `<ellipse cx="${x}" cy="${y.toFixed(1)}" rx="3.4" ry="4.6" fill="${i % 3 ? "#9ABA5A" : "#B8C86A"}" ${L}/>`; }).join(""))
    + g(`<circle cx="260" cy="32" r="18" fill="#F3E8D6" ${L}/>` + star(260, 33, 14))
    + hangLamp(204, 46, 30) + hangLamp(316, 46, 30);
  const kettles = spot("hkkettles", 260, 296, "The copper kettles", hovE(260, 296, 40, 9), g(kettle(130) + kettle(390)) + lab(260, 336, "The copper kettles", "#F6E3B4", 9));
  // the long tasting table: coasters with the star, a jug, pretzels, and at one place a paddle of three little glasses
  const glass = (x, y, c) => `<path d="M${x - 4} ${y - 14} h8 l-1 14 h-6z" fill="${c}" ${L}/><path d="M${x - 4} ${y - 14} h8 v3 h-8z" fill="${CREAM}"/>`;
  const table = spot("hk_beer", 260, 506, "The tasting table", hovE(260, 506, 76, 11),
    sk(`<rect x="100" y="440" width="320" height="28" rx="3" style="fill:#B98A5A"/><rect x="100" y="466" width="320" height="14" rx="2" style="fill:#7A5A3E"/>`, `<rect x="100" y="440" width="320" height="28" rx="3"/><rect x="100" y="466" width="320" height="14" rx="2"/>`)
    + g(`<path d="M100 454 H420" stroke="#A07648" stroke-width="1"/>` + [140, 196, 324, 380].map((x, i) => `<circle cx="${x}" cy="452" r="7" fill="${CREAM}" ${L}/>` + star(x, 452, 4) + (i % 2 ? glass(x + 12, 460, "#E8B040") : "")).join("")
      + `<rect x="232" y="448" width="56" height="12" rx="2" fill="#5E4430" ${L}/>${glass(244, 458, "#F2D27A")}${glass(260, 458, "#D99A3A")}${glass(276, 458, "#5A3422")}`
      + `<path d="M164 446 h14 v14 h-14z" fill="#E6EEF0" opacity=".8" ${L}/><path d="M178 449 q5 0 5 5 q0 4 -5 4" fill="none" stroke="#9AA6AC" stroke-width="1.4"/><rect x="164" y="450" width="14" height="10" fill="#E8B040" opacity=".8"/><ellipse cx="352" cy="454" rx="10" ry="5" fill="#C9A87A" ${L}/><path d="M346 452 q3 -3 6 0 q3 3 6 0" stroke="#8A5A2A" stroke-width="1.4" fill="none"/>`)
    + lab(260, 530, "The tour and tasting", "#C3DDF3", 10));
  // barrels and malt sacks by the door
  const edges = g(sk(`<rect x="32" y="560" width="34" height="38" rx="8" style="fill:#8A5A36"/><rect x="66" y="566" width="30" height="32" rx="7" style="fill:#9A6A42"/><path d="M444 598 q-4 -30 10 -36 h18 q12 6 10 36z" style="fill:#D9C6A0"/>`, `<rect x="32" y="560" width="34" height="38" rx="8"/><rect x="66" y="566" width="30" height="32" rx="7"/><path d="M444 598 q-4 -30 10 -36 h18 q12 6 10 36z"/>`)
    + `<path d="M32 570 h34 M32 588 h34 M66 574 h30 M66 590 h30" stroke="${IRON}" stroke-width="2"/>` + txt(463, 586, "MALT", 7, "#7A4A2A", ` font-weight="700"`) + `<path d="M456 564 q8 -6 16 0" stroke="#A08A60" stroke-width="2" fill="none"/>`);
  return g(flagsF(200, "#A89C88", "#8E826E")) + wall + kettles + table + edges + exit(RED);
}

/* ---------- the ramen shop (Sapporo) ---------- */
const vtag = (x, y, chars, col = "#2F2B28") => `<rect x="${x - 11}" y="${y}" width="22" height="${chars.length*12 + 10}" rx="1" fill="#F1E2C0" ${L}/>` + chars.split("").map((c, i) => `<text x="${x}" y="${y + 15 + i*12}" text-anchor="middle" font-size="10" font-weight="700" fill="${col}">${c}</text>`).join("");
const chochin = (x, y, ch) => lampGlow(x, y + 16, 34) + g(`<path d="M${x} 0 V${y}" stroke="${IRON}" stroke-width="1.2"/><rect x="${x - 8}" y="${y}" width="16" height="5" fill="#2F2B28"/><ellipse cx="${x}" cy="${y + 20}" rx="14" ry="17" fill="#D8442E" ${L}/>${[-10, -4, 2, 8].map(d => `<path d="M${x - 13} ${y + 20 + d} q13 3 26 0" stroke="#A82E22" stroke-width=".9" fill="none"/>`).join("")}<rect x="${x - 8}" y="${y + 36}" width="16" height="5" fill="#2F2B28"/><text x="${x}" y="${y + 25}" text-anchor="middle" font-size="12" font-weight="700" fill="#2F2B28">${ch}</text>`);
const pot = (x, w, h, c = "#B8BEC4") => `<rect x="${x - w/2}" y="${196 - h}" width="${w}" height="${h}" rx="3" fill="${c}" ${L}/><ellipse cx="${x}" cy="${196 - h}" rx="${w/2}" ry="4" fill="#8E969C" ${L}/><path d="M${x - w/2 - 4} ${200 - h*.6} h4 M${x + w/2} ${200 - h*.6} h4" stroke="#5A6066" stroke-width="2.4"/><path d="M${x - w/2 + 5} ${198 - h*.8} V194" stroke="#FFFFFF" stroke-width="3" opacity=".4"/>`
  + `<g class="steam">${[0, 1, 2].map(i => `<path d="M${x - 8 + i*8} ${188 - h} q-6 -10 0 -18 q6 -8 0 -16" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join("")}</g>`;
function ramenRoom(){
  const wall = g(`<rect width="520" height="200" style="fill:#EFE4CC"/><rect y="0" width="520" height="12" style="fill:#4A3424"/><rect y="118" width="520" height="82" style="fill:#7A5238"/>${Array.from({length: 18}, (_, i) => `<path d="M${i*30 + 10} 118 V200" stroke="#5E3E28" stroke-width="1.4"/>`).join("")}<path d="M0 118 H520" stroke="#4A3424" stroke-width="4"/>`)
    // the menu: wooden tags along the top, a little window on the snowy lane
    + g(`<path d="M126 18 H202 M318 18 H394" stroke="#4A3424" stroke-width="2"/>` + [["醤油", RED], ["味噌", "#2F2B28"], ["塩", "#2F2B28"]].map(([t, c], i) => vtag(140 + i*25, 20, t, c)).join("") + [["バター", RED], ["コーン", "#2F2B28"], ["餃子", "#2F2B28"]].map(([t, c], i) => vtag(330 + i*25, 20, t, c)).join(""))
    + win(14, 24, 72, 74, "street", {frame: "#4A3424", cols: 2, rows: 2, bar: 2.4, sill: "#7A5238"})
    // the kitchen doorway and its noren, the shelf of bowls on the right
    + g(sk(`<rect x="222" y="58" width="76" height="142" style="fill:#3A2A20"/>`, `<rect x="222" y="58" width="76" height="142"/>`) + `<path d="M216 58 H304" stroke="#4A3424" stroke-width="5"/>`
      + [0, 1, 2].map(i => `<path d="M${223 + i*25} 60 h24 v58 q-12 4 -24 0z" fill="#2E3A5A" stroke="#1E2840" stroke-width=".8"/>`).join("") + ["ラ", "ー", "メン"].map((t, i) => `<text x="${235 + i*25}" y="${i === 1 ? 96 : 94}" text-anchor="middle" font-size="${i === 2 ? 11 : 14}" font-weight="700" fill="${CREAM}">${t}</text>`).join(""))
    + g(sk(`<rect x="420" y="40" width="92" height="6" style="fill:#5E3E28"/><rect x="420" y="84" width="92" height="6" style="fill:#5E3E28"/>`, `<rect x="420" y="40" width="92" height="6"/><rect x="420" y="84" width="92" height="6"/>`)
      + Array.from({length: 4}, (_, i) => [0, 1, 2].map(k => `<path d="M${428 + i*21} ${40 - k*5} h16 l-2 -5 h-12z" fill="${["#F2EEE6", "#D8442E", "#2E3A5A", "#F2EEE6"][i]}" ${L}/>`).join("")).join("")
      + `<ellipse cx="440" cy="76" rx="9" ry="8" fill="#FFFDF6" ${L}/><circle cx="440" cy="66" r="7" fill="#FFFDF6" ${L}/><path d="M447 62 v-8" stroke="#FFFDF6" stroke-width="4" stroke-linecap="round"/><circle cx="440" cy="76" r="2.4" fill="${BRASS}"/><path d="M437 65 h1.6 M441 65 h1.6" stroke="${IRON}"/>`
      + [0, 1, 2].map(i => `<rect x="${462 + i*15}" y="${60 - (i % 2)*6}" width="10" height="${24 + (i % 2)*6}" rx="3" fill="${["#5E3A22", "#C9A24A", "#3E6E52"][i]}" ${L}/>`).join(""))
    + chochin(108, 30, "麺") + chochin(410, 30, "味");
  // the stove along the back: two big stockpots, the noodle boiler, ladles; steam rising
  const kitchen = g(sk(`<rect x="34" y="196" width="180" height="50" style="fill:#9AA2A8"/><rect x="306" y="196" width="180" height="50" style="fill:#9AA2A8"/>`, `<rect x="34" y="196" width="180" height="50"/><rect x="306" y="196" width="180" height="50"/>`)
    + `<path d="M34 202 H214 M306 202 H486" stroke="#C9CFD4" stroke-width="2"/>${[60, 150, 340, 440].map(x => `<rect x="${x - 14}" y="216" width="28" height="18" rx="2" fill="#5A6066" ${L}/><circle cx="${x}" cy="225" r="4" fill="#E8742A" opacity=".8"/>`).join("")}`
    + pot(80, 58, 62) + pot(160, 48, 46, "#A8B0B6") + pot(352, 60, 34, "#C9CFD4") + `<path d="M330 162 v-14 M352 162 v-16 M374 162 v-14" stroke="#7E5A3A" stroke-width="2"/><path d="M324 148 h12 M346 146 h12 M368 148 h12" stroke="#C9CFD4" stroke-width="3"/>`
    + `<path d="M420 196 v-40 M436 196 v-44 M452 196 v-38" stroke="#7E8890" stroke-width="2"/><circle cx="420" cy="154" r="5" fill="none" stroke="#7E8890" stroke-width="2"/><ellipse cx="436" cy="150" rx="6" ry="3" fill="#7E8890"/><rect x="460" y="176" width="22" height="20" rx="2" fill="#F2EEE6" ${L}/>`);
  // the narrow shelf by the door: water jug, glasses, a stack of bowls, the paper aprons
  const shelf = g(sk(`<rect x="30" y="250" width="30" height="170" rx="2" style="fill:#7A5238"/>`, `<rect x="30" y="250" width="30" height="170" rx="2"/>`)
    + [292, 336, 380].map(y => `<rect x="31" y="${y}" width="28" height="4" fill="#B98A5A"/>`).join("") + `<rect x="37" y="266" width="16" height="24" rx="4" fill="#D6ECF4" opacity=".9" ${L}/><rect x="40" y="276" width="10" height="13" fill="#9CC4D8" opacity=".8"/>`
    + [0, 1, 2].map(k => `<path d="M35 ${334 - k*6} h20 l-2 -5 h-16z" fill="#F2EEE6" ${L}/>`).join("") + [0, 1].map(k => `<rect x="${36 + k*10}" y="364" width="8" height="14" fill="#E6F2F4" opacity=".9" ${L}/>`).join("") + `<rect x="35" y="396" width="20" height="18" rx="1" fill="#D8442E" ${L}/>`);
  // the counter: hinoki top, a bowl being served, water glasses, the condiment caddies, chopsticks; red stools
  const caddy = x => `<rect x="${x - 14}" y="286" width="28" height="8" rx="1" fill="#5E3E28" ${L}/>${["#F2EEE6", "#D8442E", "#3E3A36"].map((c, i) => `<rect x="${x - 11 + i*8}" y="278" width="6" height="10" rx="2" fill="${c}" ${L}/>`).join("")}<rect x="${x + 16}" y="280" width="10" height="12" fill="#A82E22" ${L}/><path d="M${x + 18} 280 v-4 M${x + 21} 280 v-5 M${x + 24} 280 v-4" stroke="#E8D8B0" stroke-width="1"/>`;
  const ctr = spot("hk_ramen", 260, 362, "The counter", hovE(260, 362, 76, 11),
    sk(`<rect x="60" y="302" width="400" height="28" style="fill:#5E3E28"/><rect x="56" y="280" width="408" height="24" rx="2" style="fill:#D9B98A"/><rect x="56" y="272" width="408" height="10" style="fill:#B98A5A"/>`, `<rect x="60" y="302" width="400" height="28"/><rect x="56" y="280" width="408" height="24" rx="2"/><rect x="56" y="272" width="408" height="10"/>`)
    + g(Array.from({length: 20}, (_, i) => `<path d="M${64 + i*20} 304 v24" stroke="#4A3020" stroke-width="1.2"/>`).join("") + `<path d="M60 292 H460" stroke="#C9A878" stroke-width="1"/>`
      + [110, 400].map(caddy).join("") + [86, 160, 210, 310, 360, 436].map(x => `<rect x="${x - 4}" y="284" width="8" height="12" fill="#E6F2F4" opacity=".9" ${L}/>`).join("")
      + `<ellipse cx="260" cy="290" rx="20" ry="7" fill="#2F2B28" ${L}/><ellipse cx="260" cy="287" rx="17" ry="5" fill="#D9A24A"/><path d="M250 287 q4 -2 8 0 q4 2 8 0" stroke="#F3E1A0" stroke-width="1.4" fill="none"/><circle cx="268" cy="286" r="2.6" fill="#F3E1A0"/><rect x="250" y="284" width="7" height="4" fill="#C98A6A"/><path d="M262 284 l8 -2" stroke="#3E6E52" stroke-width="2"/><path d="M276 292 l14 -14 M279 293 l14 -14" stroke="#B98A5A" stroke-width="1.4"/>`
      + `<g class="steam"><path d="M254 278 q-4 -8 0 -14 q4 -6 0 -12 M266 278 q-4 -8 0 -14" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".75"/></g>`
      + Array.from({length: 8}, (_, i) => `<path d="M${85 + i*50} 334 v12" stroke="#5A6066" stroke-width="2.4"/><ellipse cx="${85 + i*50}" cy="332" rx="13" ry="5" fill="#C83A2E" ${L}/><ellipse cx="${85 + i*50}" cy="331" rx="9" ry="2.6" fill="#E25A44"/>`).join(""))
    + lab(260, 388, "Order at the counter", "#C3DDF3", 10));
  // a crate of empties and an umbrella stand by the door
  const edges = g(sk(`<rect x="38" y="572" width="50" height="26" style="fill:#C9A24A"/><rect x="452" y="566" width="26" height="32" rx="2" style="fill:#5A6066"/>`, `<rect x="38" y="572" width="50" height="26"/><rect x="452" y="566" width="26" height="32" rx="2"/>`)
    + [0, 1, 2, 3, 4].map(i => `<rect x="${42 + i*9}" y="562" width="6" height="14" rx="2" fill="#7A4A22" ${L}/>`).join("") + `<path d="M458 566 l-4 -24 M466 566 v-28 M472 566 l4 -22" stroke="${IRON}" stroke-width="2.4"/><path d="M450 542 q4 -6 8 0" stroke="#2E3A5A" stroke-width="2.4" fill="none"/>`);
  const mat = g(`<rect x="196" y="560" width="128" height="34" rx="4" fill="#5E6A5A" opacity=".85"/>${Array.from({length: 15}, (_, i) => `<path d="M${202 + i*8} 564 v26" stroke="#4A5448" stroke-width="1.4"/>`).join("")}`);
  return g(tilesF(200, "#B8AE9C", "#ACA290", "#9A907E")) + mat + wall + kitchen + shelf + ctr + edges + exit("#2E3A5A");
}

/* ---------- the ski lodge (Niseko) ---------- */
const ski = (x, top, col) => `<path d="M${x - 3} 246 V${top + 8} q3 -12 6 0 V246z" fill="${col}" ${L}/><path d="M${x} 246 V${top + 10}" stroke="${CREAM}" stroke-width=".8" opacity=".6"/><rect x="${x - 4}" y="${180 + (x % 3)*4}" width="8" height="6" fill="#2F2B28"/>`;
function lodgeRoom(){
  const wall = g(logWall() + `<rect width="520" height="12" style="fill:#4A3424"/><rect y="192" width="520" height="8" style="fill:#5E3E28"/>`)
    + win(108, 22, 184, 168, "yotei", {frame: "#5A3E2A", cols: 3, rows: 2, bar: 4, edge: 7, sill: "#7A5238"})
    // snowshoes and mittens on the wall by the stove
    + g(`<ellipse cx="24" cy="70" rx="11" ry="24" fill="none" stroke="#8A5E38" stroke-width="3"/><path d="M15 62 h18 M14 74 h20 M16 86 h16 M24 48 v46" stroke="#C9B48A" stroke-width="1"/>`
      + `<path d="M8 128 H50 M76 128 H104" stroke="#8A6A52" stroke-width="1.2"/>${[[16, RED], [34, "#2E5A8A"], [84, "#E8B83A"]].map(([x, c]) => `<path d="M${x - 5} 128 h10 v10 q0 8 -5 8 q-5 0 -5 -8z" fill="${c}" ${L}/><rect x="${x - 6}" y="128" width="12" height="4" fill="${CREAM}" ${L}/>`).join("")}`)
    // the chalkboard and the mug shelves behind the counter
    + g(sk(`<rect x="312" y="24" width="140" height="84" rx="2" style="fill:#2F3A34"/>`, `<rect x="312" y="24" width="140" height="84" rx="2"/>`) + `<rect x="308" y="20" width="148" height="92" rx="3" fill="none" stroke="#8A6A52" stroke-width="4"/>`
      + txt(382, 42, "HOT DRINKS", 10, CREAM, ` font-weight="700"`) + ["Hot chocolate", "Hot milk and honey", "Corn soup", "Matcha latte"].map((t, i) => `<text x="324" y="${58 + i*13}" font-family="Klee One,serif" font-size="9" fill="${CREAM}">${t}</text><circle cx="440" cy="${55 + i*13}" r="2" fill="${["#F3E1A0", "#F4C7CF", "#BFE3DA"][i % 3]}"/>`).join(""))
    + g([132, 170].map(y => `<rect x="306" y="${y}" width="152" height="5" fill="#7A5238" ${L}/>` + Array.from({length: 7}, (_, k) => `<rect x="${312 + k*20}" y="${y - 14}" width="12" height="14" rx="2" fill="${["#F2EEE6", "#B8432F", "#2E5A8A", "#F2EEE6", "#3E6E52", "#E8B83A", "#F2EEE6"][(k + y) % 7]}" ${L}/><path d="M${324 + k*20} ${y - 11} q4 0 4 4 q0 4 -4 4" fill="none" stroke="#3a2e28" stroke-width=".9"/>`).join("")).join(""))
    // the ski rack in the corner
    + g(sk(`<rect x="464" y="108" width="52" height="6" style="fill:#5E3E28"/>`, `<rect x="464" y="108" width="52" height="6"/>`) + [[472, 56, RED], [482, 62, "#2E5A8A"], [492, 52, "#E8B83A"], [502, 60, "#C9A87A"], [511, 66, "#3E6E52"]].map(([x, t, c]) => ski(x, t, c)).join("") + `<path d="M470 246 L476 120 M478 246 L470 126" stroke="#5A6066" stroke-width="1.6"/>`)
    + hangLamp(98, 56, 30) + hangLamp(300, 56, 30);
  // the cast-iron stove on its slate hearth: the fire through the door, the kettle, boots drying, a log basket
  const stove = g(sk(`<rect x="30" y="250" width="70" height="210" rx="2" style="fill:#6E6A66"/><rect x="58" y="0" width="12" height="290" style="fill:#2F2F33"/>`, `<rect x="30" y="250" width="70" height="210" rx="2"/><rect x="58" y="0" width="12" height="290"/>`)
    + [300, 360, 420].map(y => `<path d="M30 ${y} H100" stroke="#5A5652" stroke-width="1.4"/>`).join("") + `<path d="M56 60 h16 M56 160 h16" stroke="#4A4A50" stroke-width="3"/>`
    + `<rect x="36" y="258" width="58" height="22" rx="3" fill="#8A5E38" ${L}/>${[0, 1, 2, 3].map(i => `<circle cx="${44 + i*14}" cy="${266 - (i % 2)*3}" r="6" fill="#C9A87A" ${L}/><circle cx="${44 + i*14}" cy="${266 - (i % 2)*3}" r="2.4" fill="none" stroke="#8A6A42" stroke-width=".8"/>`).join("")}`
    + `<rect x="34" y="286" width="62" height="8" rx="2" fill="#2F2F33" ${L}/><rect x="38" y="294" width="54" height="76" rx="4" fill="#3A3A40" ${L}/><path d="M42 380 v-10 M88 380 v-10" stroke="#2F2F33" stroke-width="4"/><rect x="46" y="312" width="38" height="44" rx="12" fill="#2F2F33" ${L}/>`
    + `<rect class="flick" x="51" y="318" width="28" height="32" rx="9" fill="url(#hkfire2)"/><defs><radialGradient id="hkfire2" cy=".7"><stop offset="0" stop-color="#FFF2B0"/><stop offset=".6" stop-color="#F59A3A"/><stop offset="1" stop-color="#C8442A"/></radialGradient></defs><path d="M58 350 v-30 M65 350 v-30 M72 350 v-30" stroke="#2F2F33" stroke-width="1.6"/>`
    + `<path d="M74 286 q0 -14 10 -14 q10 0 10 14z" fill="#2F2F33" ${L}/><path d="M92 278 l6 -4" stroke="#2F2F33" stroke-width="2.4"/>`
    + [[40, "#7A4A2A"], [68, "#3E4A5A"]].map(([x, c], i) => `<path d="M${x} ${396 + i*8} h9 v22 h9 v6 h-18z M${x + 12} ${394 + i*8} h9 v24 h6 v6 h-15z" fill="${c}" ${L}/><path d="M${x} ${398 + i*8} h9 M${x + 12} ${396 + i*8} h9" stroke="${CREAM}" stroke-width="2"/>`).join(""))
    + lampGlow(65, 336, 64);
  // the hot drinks counter: the urn, the cocoa pot on its warmer, enamel mugs, the marshmallow jar
  const ctr = spot("hk_lodge", 380, 326, "The hot drinks counter", hovE(380, 326, 66, 10),
    sk(`<rect x="300" y="262" width="160" height="38" style="fill:#8A5A36"/><rect x="296" y="240" width="168" height="24" rx="3" style="fill:#C99A62"/>`, `<rect x="300" y="262" width="160" height="38"/><rect x="296" y="240" width="168" height="24" rx="3"/>`)
    + g(`<path d="M300 274 H460 M300 287 H460" stroke="#6E4A2C" stroke-width="1.6"/><path d="M300 268 H460" stroke="#A87448" stroke-width="1" opacity=".7"/>`
      + `<rect x="312" y="210" width="28" height="38" rx="6" fill="#C9CFD4" ${L}/><path d="M316 214 v28" stroke="#FFFFFF" stroke-width="2.4" opacity=".6"/><path d="M340 236 h6 v6" stroke="#5A6066" stroke-width="2.4" fill="none"/><rect x="310" y="206" width="32" height="5" rx="2" fill="#5A6066"/>`
      + `<rect x="356" y="238" width="30" height="6" rx="1" fill="#2F2F33"/><path d="M360 238 q0 -18 11 -18 q11 0 11 18z" fill="#B8432F" ${L}/><path d="M382 226 q8 0 6 8" stroke="#B8432F" stroke-width="2.4" fill="none"/>`
      + [0, 1, 2].map(i => `<rect x="${398 + i*16}" y="${238 - (i % 2)*2}" width="11" height="12" rx="2" fill="#F2EEE6" ${L}/><path d="M${398 + i*16} ${240 - (i % 2)*2} h11" stroke="#2E5A8A" stroke-width="1.6"/>`).join("")
      + `<rect x="446" y="226" width="14" height="20" rx="3" fill="#E6F2F4" opacity=".9" ${L}/>${[0, 1, 2, 3].map(i => `<rect x="${448 + (i % 2)*5}" y="${232 + Math.floor(i/2)*6}" width="4" height="4" rx="1" fill="#FFFFFF" ${L}/>`).join("")}`
      + `<g class="steam"><path d="M370 216 q-4 -6 0 -12 M404 232 q-3 -5 0 -10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".8"/></g>`)
    + lampGlow(380, 236, 40) + lab(380, 350, "Hot drinks", "#C3DDF3", 10));
  // the bench with its sheepskins
  const fleece = (x, y) => `<ellipse cx="${x}" cy="${y + 2}" rx="23" ry="12" fill="#F3EDE0" ${L}/>` + Array.from({length: 14}, (_, i) => `<circle cx="${(x - 18 + (i % 7)*6 + (i > 6 ? 3 : 0)).toFixed(1)}" cy="${y - 3 + (i > 6 ? 9 : 0)}" r="${4 + rnd(i + x)*1.6}" fill="${i % 2 ? "#F7F2E6" : "#ECE4D2"}" stroke="#C9BFA8" stroke-width=".6"/>`).join("");
  const bench = g(sk(`<rect x="160" y="420" width="100" height="28" rx="3" style="fill:#A87448"/><rect x="160" y="446" width="100" height="14" rx="2" style="fill:#6E4A2C"/>`, `<rect x="160" y="420" width="100" height="28" rx="3"/><rect x="160" y="446" width="100" height="14" rx="2"/>`) + fleece(186, 432) + fleece(234, 434) + `<path d="M226 426 h18" stroke="#E2D8C6" stroke-width="1"/>`);
  // a braided rug, a stack of logs, snow boots by the door
  const rug = g([[78, 28, "#8A3A2E"], [64, 22, "#C9A24A"], [48, 16, "#3E5A6E"], [32, 10, "#B8432F"], [16, 5, "#E8D8C0"]].map(([rx, ry, c]) => `<ellipse cx="350" cy="486" rx="${rx}" ry="${ry}" fill="${c}" stroke="#3a2e28" stroke-width=".5"/>`).join(""));
  const edges = g(sk(`<rect x="34" y="574" width="60" height="24" style="fill:#5E3E28"/>`, `<rect x="34" y="574" width="60" height="24"/>`) + [0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${42 + (i % 4)*14 + (i > 3 ? 7 : 0)}" cy="${i > 3 ? 568 : 582}" r="7" fill="#C9A87A" ${L}/><circle cx="${42 + (i % 4)*14 + (i > 3 ? 7 : 0)}" cy="${i > 3 ? 568 : 582}" r="3" fill="none" stroke="#8A6A42" stroke-width=".8"/>`).join("")
    + `<path d="M446 598 v-20 h10 v14 h10 v6z M466 598 v-22 h10 v16 h10 v6z" fill="#8A3A2E" ${L}/><path d="M446 580 h10 M466 578 h10" stroke="${CREAM}" stroke-width="3"/>`);
  return g(boardsF(200, "#A27650", "#86603E")) + rug + wall + stove + bench + ctr + edges + exit("#5E3E28");
}

/* ---------- the Furano dairy ---------- */
const bottle = (x, y, cap, milk = "#FFFFFF") => `<path d="M${x - 3} ${y - 22} h6 v4 q4 3 4 8 v10 h-14 v-10 q0 -5 4 -8z" fill="${milk}" ${L}/><rect x="${x - 3.4}" y="${y - 24}" width="6.8" height="3" fill="${cap}" ${L}/><path d="M${x - 4} ${y - 10} h8" stroke="#9CC4D8" stroke-width="1.4"/>`;
const churn = (x, y) => `<path d="M${x - 12} ${y} V${y - 26} q0 -6 6 -9 v-6 h12 v6 q6 3 6 9 V${y}z" fill="#C9CFD4" ${L}/><rect x="${x - 8}" y="${y - 46}" width="16" height="5" rx="1" fill="#9AA2A8" ${L}/><path d="M${x - 12} ${y - 8} h24 M${x - 12} ${y - 22} h24" stroke="#8E969C" stroke-width="1.6"/><path d="M${x - 9} ${y - 3} V${y - 26}" stroke="#FFFFFF" stroke-width="2.4" opacity=".6"/><path d="M${x - 13} ${y - 30} h-3 M${x + 13} ${y - 30} h3" stroke="#5A6066" stroke-width="2"/>`;
function dairyRoom(){
  const wall = g(tileWall("#F7F7F2", "#DDE2E0") + `<rect width="520" height="20" style="fill:#E2CFAE"/><rect y="186" width="520" height="14" style="fill:#D9C29E"/><path d="M0 20 H520" stroke="#B89A72" stroke-width="2"/>`)
    // lavender drying from the rail
    + g(`<path d="M6 24 H226" stroke="#8A6A52" stroke-width="3"/>` + Array.from({length: 8}, (_, i) => { const x = 18 + i*28; return `<path d="M${x} 24 v10" stroke="#6E8A4A" stroke-width="1.4"/><rect x="${x - 4}" y="32" width="8" height="4" fill="#C9A87A"/>${Array.from({length: 5}, (_, k) => `<path d="M${x - 4 + k*2} 36 l${(k - 2)*2} 16" stroke="#7A9A5A" stroke-width="1"/><ellipse cx="${x - 4 + k*2 + (k - 2)*2}" cy="${56 + (k % 2)*3}" rx="1.8" ry="5" fill="${LAV}"/>`).join("")}`; }).join(""))
    // the price board, the cow
    + g(sk(`<rect x="12" y="76" width="94" height="88" rx="2" style="fill:#3E5A4A"/>`, `<rect x="12" y="76" width="94" height="88" rx="2"/>`) + txt(59, 94, "牛乳 MILK", 9, CREAM, ` font-weight="700"`) + [["Milk", "200"], ["Coffee milk", "220"], ["Butter", "600"], ["Cheese", "900"]].map(([t, p], i) => `<text x="20" y="${112 + i*14}" font-family="Klee One,serif" font-size="8.5" fill="${CREAM}">${t}</text><text x="98" y="${112 + i*14}" text-anchor="end" font-family="Klee One,serif" font-size="8.5" fill="#F3E1A0">¥${p}</text>`).join(""))
    // the cheese cellar door: a stone arch, the door ajar, steps going down into the cool dark
    + g(sk(`<path d="M120 246 V126 Q120 96 154 96 Q188 96 188 126 V246z" style="fill:#B8B0A2"/><path d="M128 246 V130 Q128 106 154 106 Q180 106 180 130 V246z" style="fill:#2F2A26"/><path d="M128 246 V130 Q128 112 140 108 L146 116 V246z" style="fill:#8A6A4A"/>`, `<path d="M120 246 V126 Q120 96 154 96 Q188 96 188 126 V246z"/><path d="M128 246 V130 Q128 106 154 106 Q180 106 180 130 V246z"/>`)
      + [0, 1, 2, 3].map(i => `<path d="M${150 + i*3} ${244 - i*14} H${180 - i*2}" stroke="#6E6258" stroke-width="2"/>`).join("") + `<path d="M130 150 h14 M130 210 h14" stroke="${IRON}" stroke-width="2"/><circle cx="142" cy="182" r="2" fill="${BRASS}"/>`
      + `<rect x="128" y="76" width="52" height="14" rx="2" fill="#E2CFAE" ${L}/>` + txt(154, 86, "チーズ CELLAR", 7, "#5A3E2A", ` font-weight="700"`))
    // the big cone sign above the counter
    + g(sk(`<path d="M244 82 L260 150 L276 82z" style="fill:#D9A86A"/><ellipse cx="260" cy="80" rx="20" ry="8" style="fill:#FBF7EE"/><ellipse cx="260" cy="68" rx="16" ry="7" style="fill:#FBF7EE"/><ellipse cx="260" cy="57" rx="11" ry="6" style="fill:#FBF7EE"/><path d="M256 50 q4 -12 8 -4" style="fill:#FBF7EE"/>`, `<path d="M244 82 L260 150 L276 82z"/><ellipse cx="260" cy="80" rx="20" ry="8"/><ellipse cx="260" cy="68" rx="16" ry="7"/><ellipse cx="260" cy="57" rx="11" ry="6"/><path d="M256 50 q4 -12 8 -4"/>`)
      + `<path d="M248 92 l20 30 M252 108 l12 18 M272 92 l-20 30 M268 108 l-12 18" stroke="#B88448" stroke-width="1"/><path d="M252 64 q8 4 16 0 M248 76 q12 5 24 0" stroke="#E6DCC8" stroke-width="1.2" fill="none"/>`
      + `<rect x="212" y="154" width="96" height="20" rx="3" fill="${LAV}" ${L}/>` + txt(260, 168, "ソフトクリーム", 10, CREAM, ` font-weight="700"`))
    + win(340, 34, 116, 116, "flowers", {frame: "#FFFFFF", cols: 2, rows: 2, sill: "#D9C29E"})
    + g(`<path d="M384 156 h20 l-3 -12 h-14z" fill="#C9785A" ${L}/>${[-6, -2, 2, 6].map(d => `<path d="M${394 + d} 144 l${d*.4} -14" stroke="#6E8A4A" stroke-width="1"/><ellipse cx="${394 + d*1.4}" cy="${128 + Math.abs(d)}" rx="1.6" ry="4.4" fill="${LAV}"/>`).join("")}`)
    // jars of jam and honey, tins of butter on the right
    + g(sk(`<rect x="464" y="70" width="52" height="5" style="fill:#C9A87A"/><rect x="464" y="120" width="52" height="5" style="fill:#C9A87A"/><rect x="464" y="170" width="52" height="5" style="fill:#C9A87A"/>`, `<rect x="464" y="70" width="52" height="5"/><rect x="464" y="120" width="52" height="5"/><rect x="464" y="170" width="52" height="5"/>`)
      + [70, 120, 170].map((y, r) => [0, 1, 2].map(k => `<rect x="${468 + k*16}" y="${y - 16}" width="12" height="16" rx="2" fill="${[["#C8432F", "#E8A040", "#8E3A5A"], ["#F3E1A0", "#F3E1A0", "#E8C860"], ["#2E5A8A", "#2E5A8A", "#3E6E52"]][r][k]}" ${L}/><rect x="${467 + k*16}" y="${y - 19}" width="14" height="4" fill="${r === 2 ? "#C9CFD4" : "#F2EEE6"}" ${L}/>`).join("")).join(""));
  // the milk fridge down the left: glass bottles with coloured caps, coffee milk, melon milk
  const fridge = g(sk(`<rect x="30" y="250" width="80" height="230" rx="4" style="fill:#F2F4F4"/><rect x="38" y="276" width="64" height="194" rx="2" style="fill:#DDEFF4"/>`, `<rect x="30" y="250" width="80" height="230" rx="4"/><rect x="38" y="276" width="64" height="194" rx="2"/>`)
    + `<rect x="34" y="254" width="72" height="18" rx="2" fill="#2E5A8A"/>` + txt(70, 267, "MILK 牛乳", 9, CREAM, ` font-weight="700"`)
    + [330, 392, 454].map((y, r) => `<rect x="38" y="${y}" width="64" height="4" fill="#B8C4CC"/>` + Array.from({length: 5}, (_, k) => bottle(46 + k*12, y, ["#2E5A8A", RED, "#3E8A5E", "#E8A040"][(k + r) % 4], r === 1 && k > 2 ? "#D9B48A" : r === 2 && k < 2 ? "#E8F0C8" : "#FFFFFF")).join("")).join("")
    + `<path d="M44 290 l30 -12 M44 420 l40 -18" stroke="#FFFFFF" stroke-width="4" opacity=".45"/><rect x="96" y="340" width="4" height="60" rx="2" fill="#9AA2A8"/>`);
  // the steel churns on their pallet down the right
  const churns = g(sk(`<rect x="410" y="250" width="80" height="230" rx="2" style="fill:#C9A87A"/>`, `<rect x="410" y="250" width="80" height="230" rx="2"/>`) + Array.from({length: 9}, (_, i) => `<path d="M410 ${256 + i*26} H490" stroke="#A88A5E" stroke-width="1.4"/>`).join("")
    + [306, 362, 418, 474].map(y => churn(432, y) + churn(468, y + 2)).join(""));
  // the counter: a glass cheese case, the cheese board, the soft-serve machine, the cones, the bell
  const ctr = spot("hk_dairy", 260, 354, "The dairy counter", hovE(260, 354, 74, 11),
    sk(`<rect x="184" y="300" width="152" height="30" rx="2" style="fill:#E8DCC4"/><rect x="180" y="280" width="160" height="22" rx="3" style="fill:#FBFAF6"/><rect x="190" y="304" width="76" height="22" rx="2" style="fill:#DDEFF4"/>`, `<rect x="184" y="300" width="152" height="30" rx="2"/><rect x="180" y="280" width="160" height="22" rx="3"/><rect x="190" y="304" width="76" height="22" rx="2"/>`)
    + g([0, 1, 2].map(i => `<ellipse cx="${204 + i*24}" cy="318" rx="10" ry="6" fill="#F2C860" ${L}/><path d="M${194 + i*24} 318 v4 q10 6 20 0 v-4" fill="#E0A840" ${L}/>`).join("") + `<path d="M196 308 l12 -4" stroke="#FFFFFF" stroke-width="2" opacity=".6"/>${Array.from({length: 5}, (_, i) => `<path d="M${276 + i*12} 302 v26" stroke="#D6C8AE" stroke-width="1"/>`).join("")}`
      + `<rect x="188" y="278" width="44" height="8" rx="2" fill="#B98A5A" ${L}/><path d="M196 278 l10 -10 h10 v10z" fill="#F2C860" ${L}/><path d="M220 276 l10 -6" stroke="#9AA6AC" stroke-width="1.6"/>`
      + `<rect x="290" y="226" width="40" height="56" rx="4" fill="#C9CFD4" ${L}/><rect x="294" y="218" width="32" height="10" rx="3" fill="#9AA2A8" ${L}/><path d="M296 232 v44" stroke="#FFFFFF" stroke-width="3" opacity=".6"/><rect x="298" y="246" width="24" height="10" rx="1" fill="${LAV}"/><path d="M304 258 v6 M316 258 v6" stroke="#5A6066" stroke-width="2.4"/><path d="M302 256 l-6 -10 M318 256 l6 -10" stroke="#3E3A36" stroke-width="2.4" stroke-linecap="round"/><rect x="296" y="272" width="28" height="4" fill="#8E969C"/>`
      + `<rect x="242" y="268" width="14" height="14" rx="1" fill="#E8DCC4" ${L}/>${[0, 1, 2].map(i => `<path d="M${244 + i*4} 268 l2 -10 l2 10z" fill="#D9A86A" ${L}/>`).join("")}<path d="M266 282 q5 -12 10 0z" fill="${BRASS}" ${L}/>`)
    + lab(260, 378, "Soft-serve and milk", "#C3DDF3", 10));
  // a crate of Furano melons, a crate of milk bottles by the door
  const edges = g(sk(`<rect x="36" y="574" width="58" height="24" style="fill:#C9A87A"/><rect x="440" y="576" width="48" height="22" style="fill:#3E6E9A"/>`, `<rect x="36" y="574" width="58" height="24"/><rect x="440" y="576" width="48" height="22"/>`)
    + [0, 1, 2].map(i => `<circle cx="${48 + i*17}" cy="570" r="9" fill="#9ABA6A" ${L}/><path d="M${42 + i*17} 566 q6 4 12 0 M${42 + i*17} 572 q6 -4 12 0" stroke="#E6EEC8" stroke-width=".8" fill="none"/>`).join("") + [0, 1, 2, 3].map(i => bottle(448 + i*11, 580, ["#2E5A8A", RED, "#3E8A5E", "#2E5A8A"][i])).join("") + txt(65, 591, "FURANO", 7, "#5A3E2A", ` font-weight="700"`));
  return g(boardsF(200, "#E4D4B6", "#CBB894")) + wall + fridge + churns + ctr + edges + exit("#3E5A4A");
}

const ROOMS = {hk_glass: glassRoom, hk_musicbox: musicRoom, hk_beer: beerRoom, hk_ramen: ramenRoom, hk_lodge: lodgeRoom, hk_dairy: dairyRoom};
export function hokkaidoRoomArt(scene){ clipN = 0; return (ROOMS[scene] || glassRoom)(); }
