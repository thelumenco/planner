// Interior shells: each building has its own floor, wall treatment and decor. Furniture positions live in
// ROOMS[id].pos (data/world.js); decor here stays clear of those and of the walk from the exit to the quest board.
import { sk, artCtx } from "./scenes.js";

const rows = (n, f) => Array.from({length: n}, (_, i) => f(i)).join("");
const wallBase = (wall, trim) => `<rect width="520" height="150" style="fill:${wall}"/><rect y="138" width="520" height="12" style="fill:${trim}" opacity=".9"/>`;
const skirting = `<g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.6" fill="none"><path d="M0 150 H520"/></g>`;
const plant = (x, y, s = 1) => sk(`<path d="M${x-10*s} ${y-18*s} h${20*s} l${-3*s} ${18*s} h${-14*s}z" style="fill:#E3A27E"/><path d="M${x} ${y-18*s} q${-16*s} ${-10*s} ${-12*s} ${-30*s} q${10*s} ${10*s} ${12*s} ${30*s} q${4*s} ${-26*s} ${16*s} ${-30*s} q${-2*s} ${20*s} ${-16*s} ${30*s}" style="fill:var(--moss)"/>`,
  `<path d="M${x-10*s} ${y-18*s} h${20*s} l${-3*s} ${18*s} h${-14*s}z"/><path d="M${x} ${y-18*s} q${-16*s} ${-10*s} ${-12*s} ${-30*s} q${10*s} ${10*s} ${12*s} ${30*s} q${4*s} ${-26*s} ${16*s} ${-30*s} q${-2*s} ${20*s} ${-16*s} ${30*s}"/>`);

const SHELLS = {
  // Town hall: stone tiles, a red carpet runner to the board, tall arched windows, pennants.
  hall: () => `<rect width="520" height="640" style="fill:#E6E0D6"/>
    <g opacity=".55" style="stroke:#CFC6B8" stroke-width="1.2">${rows(12, i => `<path d="M0 ${170 + i*40} H520"/>`)}${rows(11, i => `<path d="M${i*52 + ((i % 2) ? 0 : 26)} 150 V640"/>`)}</g>
    <rect x="234" y="150" width="52" height="450" style="fill:var(--rose)" opacity=".45"/><path d="M238 150 V600 M282 150 V600" style="stroke:var(--honey)" stroke-width="2" stroke-dasharray="6 5" opacity=".9"/>
    ${wallBase("#E6E9F5", "var(--peri)")}
    ${sk(`<path d="M44 130 v-70 a24 24 0 0 1 48 0 v70z" style="fill:var(--sky)"/><path d="M428 130 v-70 a24 24 0 0 1 48 0 v70z" style="fill:var(--sky)"/>
      <path d="M140 20 h26 v54 l-13 -10 l-13 10z" style="fill:var(--peri)"/><path d="M354 20 h26 v54 l-13 -10 l-13 10z" style="fill:var(--peach)"/>`,
      `<path d="M44 130 v-70 a24 24 0 0 1 48 0 v70z M68 36 v94 M44 84 h48"/><path d="M428 130 v-70 a24 24 0 0 1 48 0 v70z M452 36 v94 M428 84 h48"/>
      <path d="M140 20 h26 v54 l-13 -10 l-13 10z M134 20 h38 M354 20 h26 v54 l-13 -10 l-13 10z M348 20 h38"/><circle cx="153" cy="40" r="5"/><circle cx="367" cy="40" r="5"/>`)}
    ${skirting}${plant(70, 600, 1.1)}${plant(474, 610, .9)}`,

  // Chord workshop: wide planks with sawdust, a pegboard of tools, a factory window, crates.
  chord: () => `<rect width="520" height="640" style="fill:#E2CDAA"/>
    <g opacity=".5" style="stroke:#C9AE86" stroke-width="1.2">${rows(9, i => `<path d="M${i*60 + 20} 150 V640"/>`)}${rows(18, i => `<path d="M${(i*67) % 520 + 20} ${170 + (i % 9)*52} h-18"/>`)}</g>
    <g opacity=".5" style="fill:#F3E2C2">${rows(14, i => `<circle cx="${(i*83 + 37) % 480 + 20}" cy="${(i*131) % 420 + 190}" r="${2 + (i % 3)}"/>`)}</g>
    ${wallBase("#E9F0E2", "var(--sage)")}
    ${sk(`<rect x="34" y="26" width="150" height="96" rx="3" style="fill:#D9B893"/><rect x="336" y="30" width="150" height="74" rx="2" style="fill:var(--sky)"/>
      <path d="M60 44 h8 v34 h-8z" style="fill:var(--stone)"/><circle cx="100" cy="56" r="11" style="fill:var(--stone)"/><path d="M128 44 l14 0 l-4 40 h-6z" style="fill:var(--rose)"/><rect x="152" y="46" width="18" height="10" style="fill:var(--sock)"/>`,
      `<rect x="34" y="26" width="150" height="96" rx="3"/>${rows(6, i => rows(4, j => `<circle cx="${48 + i*26}" cy="${38 + j*24}" r="1"/>`))}
      <path d="M60 44 h8 v34 h-8z M64 78 v14"/><circle cx="100" cy="56" r="11"/><circle cx="100" cy="56" r="4"/><path d="M128 44 l14 0 l-4 40 h-6z"/><rect x="152" y="46" width="18" height="10"/><path d="M161 56 v24"/>
      <rect x="336" y="30" width="150" height="74" rx="2"/>${rows(4, i => `<path d="M${366 + i*30} 30 v74"/>`)}<path d="M336 67 h150"/>`)}
    ${skirting}
    ${sk(`<rect x="446" y="394" width="40" height="34" style="fill:#C9A27E"/><rect x="454" y="366" width="30" height="28" style="fill:#D9B893"/>`,
      `<rect x="446" y="394" width="40" height="34"/><path d="M446 394 l40 34 M486 394 l-40 34" opacity=".5"/><rect x="454" y="366" width="30" height="28"/><path d="M454 380 h30" opacity=".5"/>`)}`,

  // Fresh Pages library: herringbone floor, built-in bookcases on the back wall, a round rug.
  fresh: () => `<rect width="520" height="640" style="fill:#E7CFAC"/>
    <g opacity=".45" style="stroke:#CDAE84" stroke-width="1.1">${rows(13, r => rows(14, c => `<path d="M${c*40 + (r % 2)*20} ${160 + r*38} l20 19 ${c % 2 ? "" : "m0 0 l20 -19"}"/>`))}</g>
    <g filter="url(#wob)" opacity=".8"><ellipse cx="260" cy="420" rx="150" ry="62" style="fill:var(--peach)" opacity=".55"/><ellipse cx="260" cy="420" rx="150" ry="62" fill="none" style="stroke:var(--line)" stroke-width="1.3"/><ellipse cx="260" cy="420" rx="132" ry="50" fill="none" style="stroke:var(--line)" stroke-width="1" stroke-dasharray="4 6"/></g>
    ${wallBase("#F6E8DC", "var(--peach)")}
    ${sk(`<rect x="14" y="14" width="190" height="122" rx="3" style="fill:var(--wood)"/><rect x="316" y="14" width="190" height="122" rx="3" style="fill:var(--wood)"/>
      ${rows(3, r => rows(14, i => `<rect x="${22 + i*13}" y="${22 + r*38}" width="${9 + (i % 3)}" height="${26 - (i*7 % 6)}" style="fill:${["var(--peri2)", "var(--rose)", "var(--moss)", "var(--honey)", "var(--peach)", "var(--sky)", "#FFFDF6"][(i + r*3) % 7]}"/>`))}
      ${rows(3, r => rows(14, i => `<rect x="${324 + i*13}" y="${22 + r*38}" width="${9 + (i % 2)}" height="${26 - (i*5 % 7)}" style="fill:${["var(--sky)", "var(--honey)", "var(--rose)", "#FFFDF6", "var(--moss)", "var(--peri2)", "var(--peach)"][(i + r*2) % 7]}"/>`))}`,
      `<rect x="14" y="14" width="190" height="122" rx="3"/><path d="M14 50 h190 M14 88 h190 M14 126 h190"/><rect x="316" y="14" width="190" height="122" rx="3"/><path d="M316 50 h190 M316 88 h190 M316 126 h190"/>
      <path d="M190 16 l-14 118 M184 60 h-11 M181 90 h-11" opacity=".8"/>`)}
    ${skirting}${plant(470, 420, .9)}`,

  // Chico cottage: soft floor, polka-dot wallpaper, round windows, braided rug, plants.
  chico: () => `<rect width="520" height="640" style="fill:#F2E2D8"/>
    <g opacity=".4" style="stroke:#E2C9BB" stroke-width="1.1">${rows(12, i => `<path d="M0 ${176 + i*40} H520"/>`)}</g>
    <g filter="url(#wob)"><ellipse cx="260" cy="420" rx="120" ry="60" style="fill:var(--butter)" opacity=".7"/>${[100, 80, 60, 40].map((rx, i) => `<ellipse cx="260" cy="420" rx="${rx}" ry="${rx/2}" fill="none" style="stroke:${["var(--rose)", "var(--sage)", "var(--peri)", "var(--rose)"][i]}" stroke-width="5" opacity=".7"/>`).join("")}<ellipse cx="260" cy="420" rx="120" ry="60" fill="none" style="stroke:var(--line)" stroke-width="1.2"/></g>
    ${wallBase("#F7E3E6", "var(--blush)")}
    <g style="fill:#EFC3CB" opacity=".7">${rows(8, r => rows(17, i => `<circle cx="${i*32 + (r % 2)*16 + 6}" cy="${r*17 + 8}" r="2.4"/>`))}</g>
    ${sk(`<circle cx="96" cy="66" r="34" style="fill:var(--sky)"/><circle cx="424" cy="66" r="34" style="fill:var(--sky)"/><path d="M168 20 v26" style="stroke:var(--line)"/><circle cx="168" cy="58" r="12" style="fill:var(--moss)"/>`,
      `<circle cx="96" cy="66" r="34"/><path d="M62 66 h68 M96 32 v68"/><circle cx="424" cy="66" r="34"/><path d="M390 66 h68 M424 32 v68"/><path d="M168 0 v46 M156 52 l-6 14 M180 52 l6 14"/>`)}
    ${skirting}${plant(52, 430, 1)}${plant(478, 430, .85)}`,

  // Post office: checkerboard tiles, pigeonhole wall, a clock and a stamp poster, parcel stack.
  post: () => `<rect width="520" height="640" style="fill:#E9F0F4"/>
    <g style="fill:#D6E2EA">${rows(13, r => rows(13, c => (r + c) % 2 ? `<rect x="${c*40}" y="${150 + r*38}" width="40" height="38"/>` : ""))}</g>
    ${wallBase("#E3EEF5", "var(--sky)")}
    ${sk(`<rect x="24" y="18" width="176" height="112" rx="3" style="fill:var(--wood)"/>${rows(4, r => rows(6, c => `<rect x="${32 + c*28}" y="${26 + r*26}" width="22" height="20" style="fill:${(r*6 + c) % 5 === 0 ? "#FFFDF6" : (r*6 + c) % 7 === 0 ? "var(--butter)" : "#9C7A5C"}"/>`))}
      <circle cx="372" cy="56" r="24" style="fill:#FFFDF6"/><rect x="418" y="30" width="70" height="88" rx="2" style="fill:#FFFDF6"/><rect x="430" y="44" width="46" height="40" style="fill:var(--rose)"/>`,
      `<rect x="24" y="18" width="176" height="112" rx="3"/>${rows(4, r => rows(6, c => `<rect x="${32 + c*28}" y="${26 + r*26}" width="22" height="20"/>`))}
      <circle cx="372" cy="56" r="24"/><path d="M372 56 v-14 M372 56 l10 6"/><rect x="418" y="30" width="70" height="88" rx="2"/><rect x="430" y="44" width="46" height="40" stroke-dasharray="2 2"/><path d="M432 96 h42 M432 106 h30" opacity=".6"/>`)}
    ${skirting}
    ${sk(`<rect x="416" y="340" width="44" height="30" style="fill:#D9B893"/><rect x="424" y="314" width="30" height="26" style="fill:#E8D3B0"/>`, `<rect x="416" y="340" width="44" height="30"/><path d="M438 340 v30 M416 355 h44" opacity=".6"/><rect x="424" y="314" width="30" height="26"/><path d="M439 314 v26" opacity=".6"/>`)}`,

  // Home: warm planks, plus whatever Mel has bought at the market's Home tab (wallpaper, rug, lamp, plant, painting).
// Maple's cosy bed lives in Mel's room now; Evan's toys in his. The plant sits by the treadmill, clear of both doors.
  home: () => { const d = (artCtx() && artCtx().F().decor) || {};
    return `<rect width="520" height="640" style="fill:#EBDDC6"/>
    <g opacity=".5" style="stroke:#D9C6A8" stroke-width="1.2">${rows(12, i => `<path d="M0 ${170 + i*40} H520"/>`)}${rows(24, i => `<path d="M${(i*97 + (i%3)*40) % 520} ${170 + (i%12)*40} v40"/>`)}</g>
    ${d.rug ? homeRug(d.rug) : `<g filter="url(#wash)" opacity=".55"><ellipse cx="260" cy="420" rx="150" ry="70" style="fill:var(--butter)"/></g>`}
    ${wallBase("#F8EED8", "var(--butter)")}${d.wall ? wallpaper(d.wall) : ""}
    ${d.art ? sk(`<rect x="152" y="40" width="44" height="36" rx="2" style="fill:var(--wood)"/><rect x="158" y="46" width="32" height="24" style="fill:var(--sky)"/><path d="M158 70 l10 -10 l8 7 l6 -5 l8 8z" style="fill:var(--moss)"/>`, `<rect x="152" y="40" width="44" height="36" rx="2"/><rect x="158" y="46" width="32" height="24"/><path d="M174 30 l-12 10 M174 30 l12 10"/>`) : ""}
    ${d.lamp ? sk(`<path d="M190 368 h24 l6 18 h-36z" style="fill:var(--butter)"/>`, `<path d="M190 368 h24 l6 18 h-36z M202 386 v52 M192 440 h20"/>`) : ""}
    ${d.plant ? plant(172, 606, 1.2) : ""}
    ${sk(`<rect x="60" y="34" width="70" height="58" rx="30" style="fill:var(--sky)"/><rect x="390" y="34" width="70" height="58" rx="30" style="fill:var(--sky)"/>`, `<rect x="60" y="34" width="70" height="58" rx="30"/><path d="M95 34 v58 M60 66 h70"/><rect x="390" y="34" width="70" height="58" rx="30"/><path d="M425 34 v58 M390 66 h70"/>`)}
    ${skirting}`; },

  // Mel's room: soft carpet, lilac wall with tiny hearts, and whatever she's bought for it in the market
  room: () => { const d = (artCtx() && artCtx().F().decor) || {};
    return `<rect width="520" height="640" style="fill:#E9DCE2"/>
    <g style="fill:#DCCAD3" opacity=".7">${rows(9, r => rows(14, i => `<circle cx="${i*38 + (r % 2)*19 + 10}" cy="${172 + r*52}" r="1.6"/>`))}</g>
    ${d.r_rug ? `<g filter="url(#wob)" opacity=".9" transform="translate(40 62) scale(.8)"><path d="M170 470 c-20 -30 20 -60 50 -44 c10 -26 60 -30 76 -4 c26 -18 70 0 60 34 c26 10 20 50 -14 52 h-150 c-34 -2 -40 -30 -22 -38z" style="fill:#FFFDF6;stroke:var(--line)" stroke-width="1.3"/></g>` : `<g filter="url(#wash)" opacity=".5"><ellipse cx="270" cy="470" rx="130" ry="56" style="fill:var(--blush)"/></g>`}
    ${wallBase("#EFE3EE", "var(--blush)")}
    <g style="fill:#E3CCDB" opacity=".8">${rows(6, r => rows(13, i => `<path transform="translate(${i*42 + (r % 2)*21 + 12} ${r*22 + 12}) scale(.7)" d="M0 3 c-4 -5 -9 0 -5 4 l5 5 l5 -5 c4 -4 -1 -9 -5 -4z"/>`))}</g>
    ${d.r_lights ? `<path d="M10 16 Q130 44 250 18 Q380 46 510 16" fill="none" style="stroke:var(--line)" stroke-width="1.2" filter="url(#wob)"/>${[30, 70, 110, 150, 190, 230, 290, 330, 370, 410, 450, 490].map((x, i) => `<circle class="twinkle" cx="${x}" cy="${(32 + 10*Math.sin(i*1.3)).toFixed(1)}" r="3.6" fill="${["#FFD66E", "#F7A9A9", "#A9D3F7", "#C7E8A9"][i % 4]}" style="animation-delay:-${(i*0.3).toFixed(1)}s"/>`).join("")}` : ""}
    ${d.r_art ? sk(`<rect x="112" y="34" width="56" height="44" rx="2" style="fill:#FFFDF6"/><circle cx="132" cy="56" r="7" style="fill:var(--rose)"/><circle cx="148" cy="54" r="6" style="fill:var(--peri)"/><path d="M132 63 v10 M148 60 v13" style="stroke:var(--moss2)"/>`, `<rect x="106" y="28" width="68" height="56" rx="2"/><rect x="112" y="34" width="56" height="44" rx="2"/>`) : ""}
    ${d.r_shelf ? sk(`<rect x="8" y="58" width="90" height="10" style="fill:var(--wood)"/>${["var(--rose)", "var(--peri)", "var(--sage)", "var(--butter)", "var(--peach)"].map((c, i) => `<rect x="${16 + i*12}" y="${36 + (i % 2)*4}" width="10" height="${22 - (i % 2)*4}" style="fill:${c}"/>`).join("")}`, `<rect x="8" y="58" width="90" height="10"/><path d="M14 68 v8 M92 68 v8"/>`) : ""}
    ${d.r_plant ? plant(366, 300, 1.2) : ""}
    ${d.r_vanity ? sk(`<rect x="38" y="584" width="70" height="12" rx="2" style="fill:var(--wood)"/><ellipse cx="73" cy="558" rx="20" ry="26" style="fill:#DCE8F4"/>`, `<rect x="38" y="584" width="70" height="12" rx="2"/><path d="M46 596 v16 M100 596 v16"/><ellipse cx="73" cy="558" rx="20" ry="26"/><path d="M64 544 l8 -8" opacity=".6"/>`) : ""}
    ${skirting}`; },

  // Evan's room: a sunny yellow wall of little dinosaurs, a soft mint carpet, a road play mat, bunting and a train picture
  kidroom: () => { const dino = (x, y, c, f) => `<path transform="translate(${x} ${y}) scale(${f ? -.9 : .9} .9)" d="M-12 6 q-2 -10 6 -12 q2 -8 9 -7 q5 1 4 6 q-1 3 -5 3 q2 5 1 10 h-4 v-3 h-5 v3z M-12 6 q-6 -2 -9 -6 q5 1 9 0" style="fill:${c}"/>`;
    return `<rect width="520" height="640" style="fill:#DDEBD5"/>
    <g style="fill:#CFE0C4" opacity=".8">${rows(9, r => rows(14, i => `<circle cx="${i*38 + (r % 2)*19 + 10}" cy="${178 + r*52}" r="1.8"/>`))}</g>
    ${sk(`<rect x="168" y="540" width="190" height="78" rx="14" style="fill:#B9CFA8"/><rect x="184" y="554" width="158" height="50" rx="22" fill="none" style="stroke:#6B7280" stroke-width="12"/>`,
      `<rect x="168" y="540" width="190" height="78" rx="14"/><rect x="184" y="554" width="158" height="50" rx="22" fill="none" stroke-dasharray="6 6" style="stroke:#FFFDF6" stroke-width="1.6"/>`)}
    ${wallBase("#F9E08A", "#7BB37A")}
    <g opacity=".75">${rows(5, r => rows(12, i => dino(i*44 + (r % 2)*22 + 16, r*27 + 18, ["#A8CF8E", "#F2A65A", "#7FB8E8"][(i + r) % 3], (i + r) % 2)))}</g>
    <g>${rows(13, i => `<path d="M${i*40 + 4} 10 l14 22 l14 -22z" style="fill:${["#F26D6D", "#7FB8E8", "#7BB37A", "#F7F2E4"][i % 4]}" opacity=".9"/>`)}</g><path d="M0 10 Q260 18 520 10" fill="none" style="stroke:var(--line)" stroke-width="1.2" filter="url(#wob)"/>
    ${sk(`<rect x="404" y="52" width="80" height="58" rx="3" style="fill:#FFFDF6"/><path d="M414 94 h60" style="stroke:#B98B5E" stroke-width="3"/><path d="M420 92 v-14 h10 v-6 h6 v6 h6 q4 0 4 4 v10z" style="fill:#E86A5C"/><rect x="450" y="80" width="18" height="12" rx="2" style="fill:#7FB8E8"/>`,
      `<rect x="398" y="46" width="92" height="70" rx="3"/><rect x="404" y="52" width="80" height="58" rx="3"/><path d="M420 92 v-14 h10 v-6 h6 v6 h6 q4 0 4 4 v10z"/><rect x="450" y="80" width="18" height="12" rx="2"/>`)}
    ${skirting}`; },

  // The courtyard: warm flagstones, a whitewashed arcade with terracotta tiles and pink bougainvillea, planters, lemon trees
  trophy: () => { const stones = rows(11, r => rows(9, c => { const w = 52 + ((r*7 + c*13) % 5)*6, x = c*60 + (r % 2)*30 - 20 + ((r + c) % 3)*3, y = 160 + r*44 + ((c*5) % 3)*2;
      return `<rect x="${x}" y="${y}" width="${w}" height="38" rx="9" style="fill:${["#E9DCC6", "#E3D3BA", "#EEE3D0", "#DFCDB2"][(r*3 + c) % 4]}"/>`; }));
    const arch = x => `<path d="M${x-30} 150 v-62 a30 30 0 0 1 60 0 v62z" style="fill:#E8D8C2"/><path d="M${x-30} 150 v-62 a30 30 0 0 1 60 0 v62" fill="none" style="stroke:var(--line)" stroke-width="1.4"/>`;
    const bloom = (x, y) => rows(7, i => `<circle cx="${x + Math.cos(i*0.9)*12 + (i % 3)*4}" cy="${y + Math.sin(i*1.3)*7}" r="${4 + (i % 2)}" style="fill:${["#E86AA0", "#F08FB4", "#D9548C"][i % 3]}"/>`);
    return `<rect width="520" height="640" style="fill:#D6C3A6"/><g filter="url(#wob)" opacity=".95">${stones}</g>
    <rect width="520" height="150" style="fill:#F6EEE2"/><rect y="138" width="520" height="12" style="fill:#C9774D" opacity=".85"/>
    <g filter="url(#wob)">${[66, 196, 324, 454].map(arch).join("")}</g>
    <g>${rows(26, i => `<path d="M${i*20} 0 h20 v14 q-10 6 -20 0z" style="fill:${i % 2 ? "#C9774D" : "#B8653D"}"/>`)}</g>
    <g>${bloom(30, 22)}${bloom(130, 18)}${bloom(262, 24)}${bloom(392, 18)}${bloom(492, 24)}</g><path d="M10 28 q40 14 80 0 t80 4 t90 -2 t90 4 t90 -4 t80 2" fill="none" style="stroke:#5C8A3A" stroke-width="2" opacity=".7"/>
    ${sk(`<rect x="10" y="168" width="44" height="120" rx="6" style="fill:#B9D2A6"/><rect x="466" y="168" width="44" height="120" rx="6" style="fill:#B9D2A6"/><rect x="190" y="560" width="22" height="18" rx="3" style="fill:#C9774D"/><rect x="308" y="560" width="22" height="18" rx="3" style="fill:#C9774D"/>`,
      `<rect x="10" y="168" width="44" height="120" rx="6"/><rect x="466" y="168" width="44" height="120" rx="6"/><rect x="190" y="560" width="22" height="18" rx="3"/><rect x="308" y="560" width="22" height="18" rx="3"/>`)}
    <g style="fill:#7FA36E">${rows(9, i => `<circle cx="${20 + (i % 3)*12}" cy="${182 + Math.floor(i/3)*36}" r="9"/><circle cx="${476 + (i % 3)*12}" cy="${182 + Math.floor(i/3)*36}" r="9"/>`)}</g>
    <g style="fill:#F3C969">${rows(4, i => `<circle cx="${28 + i*6}" cy="${200 + i*20}" r="3"/><circle cx="${484 + i*5}" cy="${206 + i*18}" r="3"/>`)}</g>
    <g style="fill:#7FA36E">${[201, 319].map(x => `<circle cx="${x}" cy="552" r="11"/><circle cx="${x - 7}" cy="546" r="7"/><circle cx="${x + 7}" cy="545" r="7"/>`).join("")}</g>`; },

  // The bank (five vaults): cream and sage marble floor, a calm sage wall with brass trim and an arched vault niche behind each jar
  bank: () => `<rect width="520" height="640" style="fill:#EFE9DA"/>
    <g opacity=".5">${rows(12, r => rows(13, c => (r + c) % 2 ? `<rect x="${c*40}" y="${150 + r*42}" width="40" height="42" style="fill:#DCE5D2"/>` : ""))}</g>
    <rect width="520" height="340" style="fill:#EEF1E6"/><rect y="330" width="520" height="10" style="fill:var(--honey)" opacity=".85"/>
    <g filter="url(#wob)">${[70, 165, 260, 355, 450].map(x => `<path d="M${x-36} 334 V60 a36 36 0 0 1 72 0 V334" style="fill:#E2E8D8;stroke:var(--line)" stroke-width="1.3"/>`).join("")}</g>
    <g style="fill:var(--honey)" opacity=".8">${[117, 212, 307, 402].map(x => `<circle cx="${x}" cy="40" r="5"/>`).join("")}</g>
    ${sk(`<path d="M232 8 h56 l-6 14 h-44z" style="fill:var(--honey)"/>`, `<path d="M232 8 h56 l-6 14 h-44z"/><path d="M248 15 h24" opacity=".5"/>`)}${plant(30, 610, 1.1)}${plant(490, 610, 1)}`,

  // The kitchen: checked tiles, a sage dado, open shelves with pots, a herb rail and a window over the garden
  kitchen: () => `<rect width="520" height="640" style="fill:#E9E2D4"/>
    <g opacity=".5">${rows(12, r => rows(13, c => (r + c) % 2 ? `<rect x="${c*40}" y="${150 + r*42}" width="40" height="42" style="fill:#D7E3CC"/>` : ""))}</g>
    ${wallBase("#F2EBDD", "#7FA36E")}${skirting}
    ${sk(`<rect x="196" y="34" width="128" height="80" rx="4" style="fill:#CFE0EE"/><ellipse cx="236" cy="72" rx="20" ry="8" style="fill:#FFFDF6"/>`, `<rect x="196" y="34" width="128" height="80" rx="4"/><path d="M260 34 v80 M196 74 h128"/>`)}
    ${sk(`<rect x="20" y="40" width="130" height="6" style="fill:#8B5E3C"/><path d="M34 46 v14 h18 v-14z M70 46 v18 h22 v-18z M110 46 v12 h16 v-12z" style="fill:#C46A4A"/>`, `<rect x="20" y="40" width="130" height="6"/><path d="M34 46 v14 h18 v-14z M70 46 v18 h22 v-18z M110 46 v12 h16 v-12z"/>`)}
    ${sk(`<path d="M360 40 h130" /><path d="M376 40 q-6 18 0 26 q6 -8 0 -26z M408 40 q-6 18 0 26 q6 -8 0 -26z M440 40 q-6 18 0 26 q6 -8 0 -26z M472 40 q-6 18 0 26 q6 -8 0 -26z" style="fill:#7FA35A"/>`, `<path d="M360 40 h130"/><path d="M376 40 q-6 18 0 26 q6 -8 0 -26z M408 40 q-6 18 0 26 q6 -8 0 -26z M440 40 q-6 18 0 26 q6 -8 0 -26z M472 40 q-6 18 0 26 q6 -8 0 -26z"/>`)}
    ${plant(490, 610, .9)}`,

  // Ma Ma's cottage: warm wooden boards, flowery wallpaper, a window onto the orchard with lace curtains, family
  // photos on the wall (Mel, Evan), a wall calendar, a crocheted rug by the tea table
  cottage: () => `<rect width="520" height="640" style="fill:#C9A27E"/>
    <g opacity=".4" style="stroke:#A7825F" stroke-width="1.2">${rows(13, i => `<path d="M0 ${170 + i*36} H520"/>`)}${rows(30, i => `<path d="M${(i*71) % 520} ${170 + (i % 13)*36} v36"/>`)}</g>
    <rect width="520" height="150" style="fill:#F6E7D7"/>${wallpaper("flower")}<rect y="138" width="520" height="12" style="fill:#C2505F" opacity=".9"/>${skirting}
    ${sk(`<rect x="200" y="30" width="120" height="84" rx="4" style="fill:#CFE0EE"/><circle cx="236" cy="96" r="14" style="fill:#9CC27E"/><circle cx="286" cy="92" r="16" style="fill:#7FA35A"/><circle cx="290" cy="86" r="2.6" style="fill:#D9433A"/><circle cx="230" cy="92" r="2.4" style="fill:#F08A3C"/>
      <path d="M196 30 h20 q-6 40 2 84 h-22z M324 30 h-20 q6 40 -2 84 h22z" style="fill:#FFFDF6"/>`, `<rect x="200" y="30" width="120" height="84" rx="4"/><path d="M260 30 v84 M200 72 h120"/><path d="M196 30 h20 q-6 40 2 84 h-22z M324 30 h-20 q6 40 -2 84 h22z" opacity=".7"/>`)}
    ${sk(`<rect x="40" y="40" width="34" height="42" rx="2" style="fill:#FFFDF6"/><circle cx="57" cy="56" r="7" style="fill:#E8B4C0"/><rect x="88" y="48" width="30" height="34" rx="2" style="fill:#FFFDF6"/><circle cx="103" cy="62" r="6" style="fill:#F3C969"/>`,
      `<rect x="40" y="40" width="34" height="42" rx="2"/><rect x="44" y="44" width="26" height="34"/><rect x="88" y="48" width="30" height="34" rx="2"/><rect x="92" y="52" width="22" height="26"/>`)}
    ${sk(`<rect x="420" y="34" width="56" height="70" rx="2" style="fill:#FFFDF6"/><rect x="420" y="34" width="56" height="16" style="fill:#C2505F"/>`, `<rect x="420" y="34" width="56" height="70" rx="2"/><path d="M420 50 h56"/>${rows(4, r => `<path d="M428 ${62 + r*10} h40" opacity=".35"/>`)}`)}
    ${sk(`<rect x="378" y="320" width="116" height="26" rx="10" style="fill:#9CC27E"/><rect x="372" y="338" width="128" height="22" rx="8" style="fill:#8DB86B"/><rect x="392" y="326" width="22" height="14" rx="5" style="fill:#F3C969"/>`,
      `<rect x="378" y="320" width="116" height="26" rx="10"/><rect x="372" y="338" width="128" height="22" rx="8"/><rect x="392" y="326" width="22" height="14" rx="5"/><path d="M436 340 v20" opacity=".4"/>`)}
    <g filter="url(#wob)">${[86, 62, 40].map((rx, i) => `<ellipse cx="110" cy="560" rx="${rx}" ry="${rx*.42}" style="fill:${["#E8B4C0", "#F6E3A1", "#9CC27E"][i]}" opacity=".8"/>`).join("")}</g>
    ${plant(30, 610, 1)}${plant(490, 610, .9)}`,

  // The wine shop: terracotta tiles, warm plaster, a wine rack behind the counter, the chalk menu, hanging lamps
  wineshop: () => `<rect width="520" height="640" style="fill:#D9A58A"/>
    <g opacity=".45" style="stroke:#B97F62" stroke-width="1.2">${rows(12, i => `<path d="M0 ${170 + i*40} H520"/>`)}${rows(26, i => `<path d="M${(i % 13)*40 + (Math.floor(i/13) % 2)*20} ${170 + (i % 12)*40} v40"/>`)}</g>
    <g filter="url(#wash)" opacity=".5"><ellipse cx="300" cy="470" rx="170" ry="80" style="fill:#E9BFA6"/></g>
    ${wallBase("#F4E6D6", "#8E2C48")}${skirting}
    ${sk(`<rect x="262" y="40" width="140" height="96" rx="3" style="fill:#8B5E3C"/>${rows(15, i => `<circle cx="${280 + (i % 5)*26}" cy="${60 + Math.floor(i/5)*28}" r="7" style="fill:${i % 4 === 1 ? "#9DBF8A" : "#5B2338"}"/>`)}`,
      `<rect x="262" y="40" width="140" height="96" rx="3"/><path d="M262 74 h140 M262 102 h140" opacity=".6"/>`)}
    ${sk(`<rect x="430" y="46" width="70" height="80" rx="3" style="fill:#3E4A43"/>`, `<rect x="430" y="46" width="70" height="80" rx="3"/>`)}
    <g font-family="Klee One,serif" font-weight="600" fill="#F6EFE3" text-anchor="middle" pointer-events="none"><text x="465" y="66" font-size="10">Tonight</text><text x="465" y="84" font-size="8">by the glass</text><text x="465" y="98" font-size="8">and small</text><text x="465" y="112" font-size="8">plates</text></g>
    ${sk("", `<path d="M150 0 v40 M200 0 v24"/>`)}
    ${sk(`<path d="M138 40 h24 l-4 10 h-16z M188 24 h24 l-4 10 h-16z" style="fill:#F3C969"/>`, `<path d="M138 40 h24 l-4 10 h-16z M188 24 h24 l-4 10 h-16z"/>`)}
    ${plant(30, 610, 1.1)}${plant(490, 610, 1)}`,

  // Mum and Dad's on the foreshore: pale timber, a big window onto the sea, Dad's framed sketches and a music stand
  mumdad: () => `<rect width="520" height="640" style="fill:#D8C3A0"/>
    <g opacity=".4" style="stroke:#B9A27E" stroke-width="1.2">${rows(13, i => `<path d="M0 ${170 + i*36} H520"/>`)}${rows(30, i => `<path d="M${(i*83) % 520} ${170 + (i % 13)*36} v36"/>`)}</g>
    ${wallBase("#EAF2F5", "#3E6B8C")}${skirting}
    ${sk(`<rect x="300" y="26" width="170" height="92" rx="4" style="fill:#BFE0EE"/><path d="M300 86 q42 -10 85 0 t85 0 v32 h-170z" style="fill:#7FB8E8"/><path d="M402 78 q8 -12 16 -4 q-6 2 -8 8z" style="fill:#5E7A94"/>`, `<rect x="300" y="26" width="170" height="92" rx="4"/><path d="M385 26 v92"/><path d="M300 86 q42 -10 85 0 t85 0" opacity=".6"/>`)}
    ${sk(`<rect x="30" y="34" width="40" height="32" rx="2" style="fill:#FFFDF6"/><rect x="84" y="28" width="34" height="44" rx="2" style="fill:#FFFDF6"/><rect x="200" y="40" width="44" height="34" rx="2" style="fill:#FFFDF6"/>`,
      `<rect x="30" y="34" width="40" height="32" rx="2"/><path d="M36 58 q8 -14 16 -4 q6 -10 12 2" opacity=".7"/><rect x="84" y="28" width="34" height="44" rx="2"/><circle cx="101" cy="44" r="7" opacity=".7"/><path d="M92 64 q9 -8 18 0" opacity=".7"/><rect x="200" y="40" width="44" height="34" rx="2"/><path d="M206 66 l10 -14 l8 8 l8 -12 l8 18" opacity=".7"/>`)}
    <g filter="url(#wob)">${[96, 70, 44].map((rx, i) => `<ellipse cx="300" cy="420" rx="${rx}" ry="${rx*.42}" style="fill:${["#BFE0EE", "#FFFDF6", "#E8B4C0"][i]}" opacity=".75"/>`).join("")}</g>
    ${plant(490, 610, 1)}${plant(24, 610, .85)}`,
  // Marcus and Angellina's: soft lilac walls, a gallery wall (their engagement photo), fairy lights, a plant shelf
  marcus: () => `<rect width="520" height="640" style="fill:#CDB59A"/>
    <g opacity=".4" style="stroke:#AE9578" stroke-width="1.2">${rows(13, i => `<path d="M0 ${170 + i*36} H520"/>`)}${rows(30, i => `<path d="M${(i*59) % 520} ${170 + (i % 13)*36} v36"/>`)}</g>
    ${wallBase("#F3ECF7", "#8E5B9A")}${skirting}
    <g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1" fill="none"><path d="M10 18 Q130 34 260 18 T510 18"/></g>
    ${rows(16, i => `<circle cx="${20 + i*31}" cy="${22 + Math.sin(i/2)*5}" r="2.6" style="fill:${["#F3C969", "#F2A0B8", "#C9E6F2"][i % 3]}"/>`)}
    ${sk(`<rect x="214" y="44" width="54" height="40" rx="2" style="fill:#FFFDF6"/><rect x="278" y="50" width="30" height="30" rx="2" style="fill:#FFFDF6"/><rect x="318" y="44" width="36" height="44" rx="2" style="fill:#FFFDF6"/><circle cx="234" cy="64" r="6" style="fill:#F0D0B4"/><circle cx="248" cy="64" r="6" style="fill:#E6BC98"/>`,
      `<rect x="214" y="44" width="54" height="40" rx="2"/><path d="M226 80 q8 -8 16 0 M240 80 q8 -8 16 0" opacity=".7"/><rect x="278" y="50" width="30" height="30" rx="2"/><path d="M284 74 l8 -12 l8 12" opacity=".7"/><rect x="318" y="44" width="36" height="44" rx="2"/><path d="M326 80 q10 -20 20 0" opacity=".7"/>`)}
    <g filter="url(#wob)">${[96, 70].map((rx, i) => `<ellipse cx="110" cy="412" rx="${rx}" ry="${rx*.42}" style="fill:${["#C9A3E0", "#F6E3A1"][i]}" opacity=".7"/>`).join("")}</g>
    ${plant(490, 610, 1.1)}${plant(30, 610, .9)}`,
  // the garage: a concrete floor with oil-stain shadows, a pegboard of tools, a roller door, a strip light
  garage: () => `<rect width="520" height="640" style="fill:#C9C6C0"/>
    <g opacity=".35" style="stroke:#A9A59D" stroke-width="1.2">${rows(4, i => `<path d="M0 ${250 + i*110} H520"/>`)}${rows(4, i => `<path d="M${130*i} 150 V640"/>`)}</g>
    <ellipse cx="330" cy="500" rx="70" ry="14" style="fill:#AFAAA2" opacity=".6"/>
    ${wallBase("#E3E6EA", "#8FA3B8")}${skirting}
    ${sk(`<rect x="40" y="30" width="180" height="90" rx="3" style="fill:#D9B48A"/>${rows(6, i => `<circle cx="${60 + i*30}" cy="46" r="2" style="fill:#8A6A4A"/>`)}<path d="M60 52 v34 M90 52 l10 30 M120 52 v26 h8 M150 52 q10 16 0 30 M180 52 v40" style="stroke:#5E5A55" stroke-width="3" fill="none"/>`,
      `<rect x="40" y="30" width="180" height="90" rx="3"/>`)}
    ${sk(`<rect x="250" y="20" width="230" height="118" rx="3" style="fill:#B9C3CC"/>${rows(8, i => `<rect x="250" y="${24 + i*14}" width="230" height="3" style="fill:#9AA6B1"/>`)}`, `<rect x="250" y="20" width="230" height="118" rx="3"/>`)}
    ${sk(`<rect x="200" y="6" width="120" height="6" rx="3" style="fill:#FFFDF6"/>`, `<rect x="200" y="6" width="120" height="6" rx="3"/>`)}
    ${plant(490, 610, .8)}`,
  // the home office: soft green walls, a big window, a pinboard, the way back into the living room on the east wall
  office: () => `<rect width="520" height="640" style="fill:#D9C3A0"/>
    <g opacity=".4" style="stroke:#B9A27E" stroke-width="1.2">${rows(13, i => `<path d="M0 ${170 + i*36} H520"/>`)}${rows(30, i => `<path d="M${(i*67) % 520} ${170 + (i % 13)*36} v36"/>`)}</g>
    ${wallBase("#EEF1E6", "var(--sage)")}${skirting}
    ${sk(`<rect x="200" y="28" width="128" height="86" rx="4" style="fill:#CFE0EE"/><circle cx="236" cy="96" r="16" style="fill:#9EBE8C"/>`, `<rect x="200" y="28" width="128" height="86" rx="4"/><path d="M264 28 v86 M200 70 h128"/>`)}
    ${sk(`<rect x="372" y="34" width="110" height="74" rx="3" style="fill:#D9B48A"/><rect x="384" y="44" width="26" height="22" style="fill:#FFF3B8"/><rect x="420" y="48" width="28" height="20" style="fill:#F4C7CF"/><rect x="398" y="74" width="30" height="22" style="fill:#C3CDEE"/>`, `<rect x="372" y="34" width="110" height="74" rx="3"/>`)}
    ${plant(30, 610, .9)}${plant(300, 610, .8)}`,
  // the cellar door: stone walls, an arched brick ceiling line, warm lamps, and the way back on the east wall
  cellar: () => `<rect width="520" height="640" style="fill:#B98E6A"/>
    <g opacity=".45" style="stroke:#8E6A4A" stroke-width="1.2">${rows(12, i => `<path d="M0 ${170 + i*40} H520"/>`)}${rows(26, i => `<path d="M${(i % 13)*40 + (Math.floor(i/13) % 2)*20} ${170 + (i % 12)*40} v40"/>`)}</g>
    ${wallBase("#E9DCCB", "#6B3A2A")}${skirting}
    <g opacity=".5">${rows(5, r => rows(13, c => `<rect x="${c*40 + (r % 2)*20}" y="${r*28}" width="38" height="26" rx="3" style="fill:#D9C3A6"/>`))}</g>
    ${sk(`<path d="M200 138 v-60 q60 -60 120 0 v60z" style="fill:#3E2A20"/>${rows(3, i => `<ellipse cx="${232 + i*28}" cy="118" rx="12" ry="11" style="fill:#A8693F"/>`)}`, `<path d="M200 138 v-60 q60 -60 120 0 v60z"/>`)}
    ${[110, 410].map(x => sk(`<circle cx="${x}" cy="60" r="10" style="fill:#FFD27A"/>`, `<path d="M${x} 20 v30"/><circle cx="${x}" cy="60" r="10"/>`)).join("")}
    ${sk(`<path d="M520 316 L492 328 L492 428 L520 440z" style="fill:#6B3A2A"/>`, `<path d="M520 316 L492 328 L492 428 L520 440z"/><circle cx="497" cy="384" r="1.8"/>`)}
    ${plant(490, 610, .9)}`,
  market: () => `<rect width="520" height="640" style="fill:#EBDDC6"/>
    <g opacity=".5" style="stroke:#D9C6A8" stroke-width="1.2">${rows(12, i => `<path d="M0 ${170 + i*40} H520"/>`)}${rows(24, i => `<path d="M${(i*97 + (i%3)*40) % 520} ${170 + (i%12)*40} v40"/>`)}</g>
    <g filter="url(#wash)" opacity=".55"><ellipse cx="260" cy="420" rx="150" ry="70" style="fill:var(--blush)"/></g>
    ${wallBase("#F8E5E2", "var(--blush)")}${skirting}`
};

function wallpaper(kind){
  if (kind === "stripe") return `<g opacity=".55">${rows(26, i => i % 2 ? `<rect x="${i*20}" y="0" width="10" height="138" style="fill:#F1D9A8"/>` : "")}</g>`;
  if (kind === "flower") return `<g opacity=".7">${rows(5, r => rows(14, i => { const x = i*40 + (r % 2)*20 + 10, y = r*28 + 12; return `<circle cx="${x}" cy="${y}" r="4" fill="#F4C7CF"/><circle cx="${x}" cy="${y}" r="1.6" fill="#F3C969"/>`; }))}</g>`;
  return `<g style="fill:#EBC9B8" opacity=".75">${rows(8, r => rows(17, i => `<circle cx="${i*32 + (r % 2)*16 + 6}" cy="${r*17 + 8}" r="3"/>`))}</g>`;
}
function homeRug(kind){
  if (kind === "stripe") return sk(`<rect x="170" y="370" width="180" height="96" rx="6" style="fill:var(--sage)"/>${rows(5, i => `<rect x="170" y="${382 + i*18}" width="180" height="7" style="fill:#FFFDF6"/>`)}`, `<rect x="170" y="370" width="180" height="96" rx="6"/><path d="M170 366 v-4 M190 366 v-4 M330 366 v-4 M350 366 v-4" />`);
  return `<g filter="url(#wob)">${[110, 86, 62, 38].map((rx, i) => `<ellipse cx="260" cy="420" rx="${rx}" ry="${rx*.45}" style="fill:${["var(--peri)", "var(--butter)", "var(--rose)", "var(--peri)"][i]}" opacity=".8"/>`).join("")}<ellipse cx="260" cy="420" rx="110" ry="49.5" fill="none" style="stroke:var(--line)" stroke-width="1.3"/></g>`;
}
export const roomShell = id => (SHELLS[id] || SHELLS.home)();
