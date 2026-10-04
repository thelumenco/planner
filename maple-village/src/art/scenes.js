// SVG scene builders: village, interiors, garden. Generated strings, hand-drawn look via #wob / #marker / #wash.
// Scene builders read live game state through the `G` context set by core (setArtContext).
import { ink } from "../util.js";
import { VILLAGE, ROOMS, stationsOf } from "../data/world.js";
import { CROPS, PLOTS } from "../data/items.js";
import { roomShell } from "./interiors.js";
import { iconAt } from "./icons.js";
import { upgradesArt, festivalArt, festivalOn, pondLanterns } from "./village-extras.js";
import { townHall, chordWorkshop, library, chicoCottage, postOffice } from "./buildings.js";

let G = null;
export const setArtContext = g => { G = g; };
export const artCtx = () => G;

export function tapeLabel(x, y, text, col, size){
  const w = text.length*(size ? size*.56 : 8.2) + 22;
  return `<g transform="translate(${x} ${y}) rotate(-2)" pointer-events="none"><path d="M${-w/2} -11 l4 -1.5 l${w-8} 1 l4 -1 l-2 11 l2 11 l-4 1 l${-(w-8)} -1 l-4 1 l2 -11z" style="fill:${col}" opacity=".85"/><text class="lab" x="0" y="5" text-anchor="middle"${size ? ` style="font-size:${size}px"` : ""}>${text}</text></g>`;
}
export const sk = (art, lines) => `<g filter="url(#marker)">${art}</g><g filter="url(#wob)" fill="none" ${ink}>${lines}</g>`;
export function house(id, x, y, w, h, wall, roof, label, tapeCol, extra){
  const rx = x - 9, rw = w + 18, apex = y - h*0.62;
  const roofP = `M${rx} ${y} L${x + w/2} ${apex} L${rx + rw} ${y}Z`;
  const dx = x + w/2 - 11, dy = y + h - 30;
  const art = `<path d="${roofP}" style="fill:${roof}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${wall}"/>
    <rect x="${dx}" y="${dy}" width="22" height="30" rx="10" style="fill:var(--wood)"/>
    <rect x="${x+12}" y="${y+14}" width="20" height="18" rx="2" style="fill:var(--sky)"/><rect x="${x+w-32}" y="${y+14}" width="20" height="18" rx="2" style="fill:var(--sky)"/>`;
  const lines = `<path d="${roofP}"/><rect x="${x}" y="${y}" width="${w}" height="${h}"/>
    <rect x="${dx}" y="${dy}" width="22" height="30" rx="10"/><circle cx="${dx+16}" cy="${dy+16}" r="1.4"/>
    <rect x="${x+12}" y="${y+14}" width="20" height="18" rx="2"/><path d="M${x+22} ${y+14} v18 M${x+12} ${y+23} h20"/>
    <rect x="${x+w-32}" y="${y+14}" width="20" height="18" rx="2"/><path d="M${x+w-22} ${y+14} v18 M${x+w-32} ${y+23} h20"/>`;
  return `<g data-place="${id}" aria-label="${label}"><ellipse class="hov" cx="${x+w/2}" cy="${y+h+4}" rx="${w/2+14}" ry="10" style="fill:var(--butter)"/>
    ${sk(art + (extra ? extra.art : ""), lines + (extra ? extra.lines : ""))}${tapeLabel(x + w/2, y + h + 22, label, tapeCol)}</g>`;
}
export function tree(x, y, s){ s = s || 1;
  return `<g filter="url(#wob)" ${ink}><rect x="${x-3*s}" y="${y-6*s}" width="${6*s}" height="${14*s}" style="fill:var(--wood)"/>
    <circle cx="${x}" cy="${y-18*s}" r="${15*s}" style="fill:var(--tree)"/><circle cx="${x-10*s}" cy="${y-10*s}" r="${10*s}" style="fill:var(--tree2)"/><circle cx="${x+10*s}" cy="${y-11*s}" r="${10*s}" style="fill:var(--tree)"/></g>`; }
export const flowers = pts => pts.map(([x,y,c]) => `<circle cx="${x}" cy="${y}" r="2.6" style="fill:${c}"/><circle cx="${x}" cy="${y}" r="1" fill="#FFF6D8"/>`).join("");

export function villageArt(){
  const D = VILLAGE;
  const ground = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="120" cy="120" rx="90" ry="50" style="fill:var(--grass2)"/><ellipse cx="420" cy="420" rx="100" ry="60" style="fill:var(--grass2)"/><ellipse cx="200" cy="560" rx="80" ry="40" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)"><path d="M260 322 L260 ${D.hall.door[1]} M260 322 C200 300 120 290 ${D.chord.door[0]} ${D.chord.door[1]} M260 322 C320 300 400 290 ${D.fresh.door[0]} ${D.fresh.door[1]} M260 322 C200 380 110 430 ${D.chico.door[0]} ${D.chico.door[1]} M260 322 C320 380 410 420 ${D.post.door[0]} ${D.post.door[1]} M260 322 L260 ${D.home.door[1]} M260 470 C300 540 320 590 ${D.pond.door[0]} ${D.pond.door[1]} M220 400 L${D.farm.door[0]} ${D.farm.door[1]}" fill="none" style="stroke:var(--path)" stroke-width="24" stroke-linecap="round"/>
      <ellipse cx="260" cy="326" rx="70" ry="40" style="fill:var(--path)"/><ellipse cx="260" cy="326" rx="70" ry="40" fill="none" style="stroke:var(--path2)" stroke-width="1.5" stroke-dasharray="3 7"/></g>
    ${flowers([[30,262,"#EFA3A6"],[44,270,"#F3C969"],[150,206,"#C3CDEE"],[372,206,"#EFA3A6"],[488,270,"#F3C969"],[300,448,"#EFA3A6"],[214,450,"#C3CDEE"],[160,600,"#F3C969"],[176,612,"#EFA3A6"],[470,540,"#C3CDEE"],[20,430,"#F3C969"],[505,380,"#EFA3A6"]])}
    ${tree(170,64,1)}${tree(350,64,1)}${tree(26,96,1.05)}${tree(494,96,1.05)}${tree(24,350,.9)}${tree(498,330,.9)}${tree(190,622,.85)}${tree(504,520,.85)}${tree(24,610,.95)}`;
  const homeX = {art:`<rect x="290" y="444" width="12" height="22" style="fill:var(--stone)"/>`, lines:`<rect x="290" y="444" width="12" height="22"/><path class="smoke" d="M296 440 q-4 -6 0 -11 q4 -5 0 -10" opacity=".6"/>`};
  const grown = (G.F().plots || []).filter(p => p && p.crop).length;
  const sprouts = Array.from({length:Math.min(4, grown)}, (_, i) => `<path d="M${160 + i*12} 470 v-8" style="stroke:var(--moss2)"/><ellipse cx="${157 + i*12}" cy="${463}" rx="3.5" ry="2" style="fill:var(--moss)"/><ellipse cx="${163 + i*12}" cy="${461}" rx="3.5" ry="2" style="fill:var(--moss)"/>`).join("");
  const places =
    townHall() + chordWorkshop() + library() + chicoCottage() + postOffice() +
    house("home", 205, 508, 110, 74, "var(--card)", "var(--butter)", "Home", "var(--butter)", homeX) +
    `<g data-place="farm" aria-label="Garden"><ellipse class="hov" cx="182" cy="478" rx="34" ry="10" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><rect x="150" y="446" width="64" height="30" rx="3" style="fill:#B08A6A"/>${sprouts}
      <path d="M146 482 v-40 M218 482 v-40 M146 450 h72 M146 470 h72" style="stroke:var(--wood)" stroke-width="2.4"/><path d="M146 442 v42 M161 442 v42 M203 442 v42 M218 442 v42" opacity=".8"/></g>
      ${tapeLabel(182, 432, "Garden", "var(--sage)")}</g>
    <g data-place="board" aria-label="Quest board"><ellipse class="hov" cx="260" cy="330" rx="40" ry="8" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><path d="M238 330 v-40 M282 330 v-40"/><rect x="230" y="282" width="60" height="38" rx="3" style="fill:var(--wood)"/>${notesArt(236, 288, G.remaining().length)}</g>
      ${tapeLabel(260, 278, "Quests", "var(--butter)")}</g>
    <g data-place="well" aria-label="Well"><ellipse class="hov" cx="160" cy="342" rx="26" ry="7" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><path d="M146 312 v20 M174 312 v20"/><path d="M140 314 l20 -12 l20 12z" style="fill:var(--peach)"/><ellipse cx="160" cy="334" rx="17" ry="7" style="fill:var(--stone)"/><path d="M143 334 v6 a17 7 0 0 0 34 0 v-6" style="fill:var(--stone)"/><ellipse cx="160" cy="333" rx="11" ry="4" style="fill:var(--water)"/></g>
      ${tapeLabel(160, 362, "Well", "var(--sky)")}</g>
    <g data-place="market" aria-label="Market"><ellipse class="hov" cx="362" cy="342" rx="32" ry="8" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><path d="M340 306 v30 M384 306 v30"/><rect x="336" y="320" width="52" height="16" style="fill:var(--wood)"/>
        <path d="M332 306 h60 l-4 10 h-52z" style="fill:var(--card)"/><path d="M340 306 l-2 10 M352 306 l-1 10 M364 306 v10 M376 306 l1 10" style="stroke:var(--rose)" stroke-width="5"/>
        <circle cx="350" cy="317" r="3.2" style="fill:var(--rose)"/><circle cx="362" cy="317" r="3.2" style="fill:var(--butter)"/><circle cx="374" cy="317" r="3.2" style="fill:var(--sage)"/></g>
      ${tapeLabel(362, 360, "Market", "var(--blush)")}</g>
    <g data-place="pond" aria-label="Pond"><ellipse class="hov" cx="420" cy="592" rx="70" ry="30" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><ellipse cx="430" cy="590" rx="58" ry="25" style="fill:var(--water)"/><path class="ripple" d="M405 586 q8 -4 16 0 M432 598 q8 -4 16 0" opacity=".6"/>
        <ellipse cx="455" cy="580" rx="7" ry="3.5" style="fill:var(--tree)"/><circle cx="455" cy="577" r="2" style="fill:var(--rose)"/>
        <rect x="322" y="596" width="34" height="6" rx="2" style="fill:var(--wood)"/><path d="M326 602 v8 M352 602 v8 M322 592 h34" /></g>
      ${tapeLabel(430, 630, "Pond", "var(--sky)")}</g>`;
  return ground + places + userGarden("chord", 148, 220, 4, 3, 12) + userGarden("chico", 34, 536, 8, 2, 12)
    + upgradesArt(G.F().totalQuests || 0) + festivalArt(festivalOn(G.day())) + pondLanterns(G.lanterns());
}
export function notesArt(x, y, n){
  const c = ["#FFFDF6","#F6E3A1","#F4C7CF","#C3CDEE","#DCE8C8"];
  return Array.from({length:Math.min(5, n)}, (_, i) => `<rect x="${x + i*10}" y="${y + (i%2)*6}" width="12" height="14" transform="rotate(${(i%2 ? 6 : -5)} ${x + 6 + i*10} ${y + 7})" style="fill:${c[i]}"/>`).join("");
}

/* ---------- furniture (x,y = centre of the front edge) ---------- */
export function furn(kind, x, y){
  const W2 = "var(--wood)";
  const legs = (w, h) => `<path d="M${x-w/2+6} ${y} v${h} M${x+w/2-6} ${y} v${h}"/>`;
  switch (kind){
    case "desk": return sk(`<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3" style="fill:${W2}"/><rect x="${x-18}" y="${y-50}" width="36" height="20" rx="2" style="fill:#DCE3EE"/><rect x="${x+22}" y="${y-38}" width="16" height="10" rx="1" style="fill:var(--card)"/><circle cx="${x-34}" cy="${y-36}" r="5" style="fill:var(--sky)"/>`,
      `<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3"/><rect x="${x-18}" y="${y-50}" width="36" height="20" rx="2"/><path d="M${x-22} ${y-30} h44"/><rect x="${x+22}" y="${y-38}" width="16" height="10" rx="1"/><circle cx="${x-34}" cy="${y-36}" r="5"/><path d="M${x-46} ${y-6} v14 M${x+46} ${y-6} v14"/>`);
    case "typewriter": return sk(`<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3" style="fill:${W2}"/><rect x="${x-26}" y="${y-48}" width="52" height="22" rx="5" style="fill:var(--peach)"/><rect x="${x-16}" y="${y-64}" width="32" height="18" style="fill:#FFFDF6"/>`,
      `<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3"/><rect x="${x-26}" y="${y-48}" width="52" height="22" rx="5"/><rect x="${x-16}" y="${y-64}" width="32" height="18"/><path d="M${x-10} ${y-58} h20 M${x-10} ${y-53} h14"/><path d="M${x-18} ${y-36} h36 M${x-18} ${y-31} h36" stroke-dasharray="2 3"/><path d="M${x-46} ${y-6} v14 M${x+46} ${y-6} v14"/>`);
    case "table": return sk(`<ellipse cx="${x}" cy="${y-22}" rx="58" ry="24" style="fill:${W2}"/><rect x="${x-26}" y="${y-36}" width="22" height="16" transform="rotate(-8 ${x-15} ${y-28})" style="fill:#FFFDF6"/><circle cx="${x+22}" cy="${y-26}" r="6" style="fill:var(--sky)"/>`,
      `<ellipse cx="${x}" cy="${y-22}" rx="58" ry="24"/><path d="M${x-30} ${y} v12 M${x+30} ${y} v12"/><rect x="${x-26}" y="${y-36}" width="22" height="16" transform="rotate(-8 ${x-15} ${y-28})"/><circle cx="${x+22}" cy="${y-26}" r="6"/>`);
    case "whiteboard": return sk(`<rect x="${x-46}" y="${y-92}" width="92" height="58" rx="3" style="fill:#FFFFFF"/><path d="M${x-30} ${y-76} q14 -8 28 0 t28 0" style="stroke:var(--peri2)" stroke-width="2" fill="none"/><path d="M${x-30} ${y-58} h40" style="stroke:var(--rose)" stroke-width="2"/>`,
      `<rect x="${x-46}" y="${y-92}" width="92" height="58" rx="3"/><path d="M${x-30} ${y-34} l-8 34 M${x+30} ${y-34} l8 34 M${x-46} ${y-30} h92"/>`);
    case "phone": return sk(`<rect x="${x-26}" y="${y-100}" width="52" height="100" rx="6" style="fill:var(--peri)"/><rect x="${x-16}" y="${y-86}" width="32" height="40" rx="3" style="fill:var(--sky)"/><rect x="${x-6}" y="${y-38}" width="12" height="16" rx="3" style="fill:var(--sock)"/>`,
      `<rect x="${x-26}" y="${y-100}" width="52" height="100" rx="6"/><rect x="${x-16}" y="${y-86}" width="32" height="40" rx="3"/><rect x="${x-6}" y="${y-38}" width="12" height="16" rx="3"/>`);
    case "shelf": case "craft": {
      const cols = kind === "craft" ? ["var(--rose)","var(--butter)","var(--sage)","var(--peri)","var(--peach)","var(--sky)"] : ["var(--peri2)","var(--rose)","var(--moss)","var(--honey)","var(--peach)","var(--sky)"];
      let b = ""; for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) b += `<rect x="${x-38 + i*12.5}" y="${y-88 + r*28}" width="${kind === "craft" ? 11 : 8}" height="${kind === "craft" ? 12 : 20}" style="fill:${cols[(i + r) % 6]}"/>`;
      return sk(`<rect x="${x-44}" y="${y-96}" width="88" height="96" rx="3" style="fill:${W2}"/>${b}`, `<rect x="${x-44}" y="${y-96}" width="88" height="96" rx="3"/><path d="M${x-44} ${y-68} h88 M${x-44} ${y-40} h88 M${x-44} ${y-12} h88"/>`); }
    case "bench": return sk(`<rect x="${x-56}" y="${y-30}" width="112" height="24" rx="2" style="fill:${W2}"/><circle cx="${x+30}" cy="${y-40}" r="9" style="fill:var(--stone)"/><rect x="${x-40}" y="${y-44}" width="30" height="6" rx="2" style="fill:var(--sock)"/>`,
      `<rect x="${x-56}" y="${y-30}" width="112" height="24" rx="2"/><circle cx="${x+30}" cy="${y-40}" r="9"/><circle cx="${x+30}" cy="${y-40}" r="3"/><rect x="${x-40}" y="${y-44}" width="30" height="6" rx="2"/><path d="M${x-12} ${y-44} v-8 h8 v8"/><path d="M${x-50} ${y-6} v14 M${x+50} ${y-6} v14"/>`);
    case "press": return sk(`<rect x="${x-44}" y="${y-30}" width="88" height="30" rx="3" style="fill:var(--sage)"/><circle cx="${x-14}" cy="${y-46}" r="14" style="fill:var(--stone)"/><circle cx="${x+18}" cy="${y-46}" r="14" style="fill:var(--stone)"/><rect x="${x-30}" y="${y-70}" width="40" height="14" style="fill:#FFFDF6"/>`,
      `<rect x="${x-44}" y="${y-30}" width="88" height="30" rx="3"/><circle cx="${x-14}" cy="${y-46}" r="14"/><circle cx="${x+18}" cy="${y-46}" r="14"/><rect x="${x-30}" y="${y-70}" width="40" height="14"/><path d="M${x+40} ${y-30} l14 -30"/>`);
    case "cork": { let p = ""; const c = ["#FFFDF6","#F6E3A1","#F4C7CF","#C3CDEE","#DCE8C8","#FFFDF6"];
      for (let i = 0; i < 6; i++) p += `<rect x="${x-36 + (i%3)*26}" y="${y-86 + Math.floor(i/3)*24}" width="18" height="18" style="fill:${c[i]}"/><circle cx="${x-27 + (i%3)*26}" cy="${y-81 + Math.floor(i/3)*24}" r="2" style="fill:var(--rose)"/>`;
      return sk(`<rect x="${x-46}" y="${y-96}" width="92" height="62" rx="3" style="fill:#D9B893"/>${p}`, `<rect x="${x-46}" y="${y-96}" width="92" height="62" rx="3"/><path d="M${x-34} ${y-34} l-6 34 M${x+34} ${y-34} l6 34"/>`); }
    case "nook": return sk(`<path d="M${x-40} ${y} v-34 q0 -22 22 -22 h20 q22 0 22 22 v34z" style="fill:var(--peach)"/><rect x="${x-30}" y="${y-30}" width="44" height="18" rx="6" style="fill:var(--cream)"/><circle cx="${x+44}" cy="${y-70}" r="12" style="fill:var(--butter)"/>`,
      `<path d="M${x-40} ${y} v-34 q0 -22 22 -22 h20 q22 0 22 22 v34z"/><rect x="${x-30}" y="${y-30}" width="44" height="18" rx="6"/><path d="M${x+44} ${y-58} v58 M${x+36} ${y} h16"/><path d="M${x+32} ${y-70} h24 l-4 -12 h-16z"/>`);
    case "sofa": return sk(`<rect x="${x-56}" y="${y-44}" width="112" height="28" rx="12" style="fill:var(--sage)"/><rect x="${x-60}" y="${y-24}" width="120" height="24" rx="10" style="fill:var(--sage)"/><rect x="${x-40}" y="${y-38}" width="24" height="18" rx="6" style="fill:var(--butter)"/><rect x="${x+16}" y="${y-38}" width="24" height="18" rx="6" style="fill:var(--rose)"/>`,
      `<rect x="${x-56}" y="${y-44}" width="112" height="28" rx="12"/><rect x="${x-60}" y="${y-24}" width="120" height="24" rx="10"/><rect x="${x-40}" y="${y-38}" width="24" height="18" rx="6"/><rect x="${x+16}" y="${y-38}" width="24" height="18" rx="6"/>`);
    case "kitchen": return sk(`<rect x="${x-56}" y="${y-40}" width="112" height="40" rx="3" style="fill:var(--card)"/><rect x="${x-56}" y="${y-46}" width="112" height="8" style="fill:${W2}"/><circle cx="${x-24}" cy="${y-52}" r="9" style="fill:var(--stone)"/><path d="M${x+8} ${y-62} h28 v14 h-28z" style="fill:var(--rose)"/>`,
      `<rect x="${x-56}" y="${y-40}" width="112" height="40" rx="3"/><path d="M${x-56} ${y-46} h112 v6"/><circle cx="${x-24}" cy="${y-52}" r="9"/><path d="M${x+8} ${y-62} h28 v14 h-28z M${x+36} ${y-58} h6"/><path d="M${x} ${y-40} v40" opacity=".5"/><path class="smoke" d="M${x+20} ${y-66} q-3 -5 0 -9 q3 -4 0 -8" opacity=".6"/>`);
    case "laundry": return sk(`<path d="M${x-30} ${y-34} h60 l-6 34 h-48z" style="fill:#E8D3B0"/><path d="M${x-24} ${y-34} q10 -14 22 -4 q10 -12 26 0z" style="fill:var(--sky)"/><path d="M${x-8} ${y-38} q8 -10 18 -2z" style="fill:var(--rose)"/>`,
      `<path d="M${x-30} ${y-34} h60 l-6 34 h-48z"/><path d="M${x-26} ${y-24} h52 M${x-24} ${y-14} h48" opacity=".5"/><path d="M${x-24} ${y-34} q10 -14 22 -4 q10 -12 26 0"/>`);
    case "cupboard": return sk(`<rect x="${x-36}" y="${y-84}" width="72" height="84" rx="3" style="fill:var(--card)"/><rect x="${x+42}" y="${y-30}" width="14" height="30" rx="4" style="fill:var(--sky)"/>`,
      `<rect x="${x-36}" y="${y-84}" width="72" height="84" rx="3"/><path d="M${x} ${y-84} v84"/><circle cx="${x-5}" cy="${y-42}" r="1.8"/><circle cx="${x+5}" cy="${y-42}" r="1.8"/><rect x="${x+42}" y="${y-30}" width="14" height="30" rx="4"/><path d="M${x+46} ${y-30} v-6 h8"/>`);
    case "counter": return sk(`<rect x="${x-58}" y="${y-36}" width="116" height="36" rx="3" style="fill:${W2}"/><rect x="${x-44}" y="${y-52}" width="24" height="16" style="fill:#FFFDF6"/><rect x="${x-14}" y="${y-50}" width="24" height="14" style="fill:var(--butter)"/><rect x="${x+18}" y="${y-54}" width="24" height="18" style="fill:var(--sky)"/>`,
      `<rect x="${x-58}" y="${y-36}" width="116" height="36" rx="3"/><rect x="${x-44}" y="${y-52}" width="24" height="16"/><path d="M${x-44} ${y-52} l12 8 l12 -8"/><rect x="${x-14}" y="${y-50}" width="24" height="14"/><rect x="${x+18}" y="${y-54}" width="24" height="18"/>`);
    case "cabinet": return sk(`<rect x="${x-30}" y="${y-92}" width="60" height="92" rx="3" style="fill:var(--stone)"/>`,
      `<rect x="${x-30}" y="${y-92}" width="60" height="92" rx="3"/><path d="M${x-30} ${y-62} h60 M${x-30} ${y-32} h60"/><path d="M${x-8} ${y-78} h16 M${x-8} ${y-48} h16 M${x-8} ${y-18} h16" stroke-width="3"/>`);
    case "scales": return sk(`<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3" style="fill:${W2}"/><path d="M${x-36} ${y-30} h28 l-4 -10 h-20z" style="fill:var(--butter)"/><rect x="${x+10}" y="${y-48}" width="12" height="18" rx="2" style="fill:var(--rose)"/><rect x="${x+28}" y="${y-40}" width="20" height="10" style="fill:#FFFDF6"/>`,
      `<rect x="${x-52}" y="${y-30}" width="104" height="24" rx="3"/><path d="M${x-36} ${y-30} h28 l-4 -10 h-20z M${x-22} ${y-40} v-10 h-10 h20"/><rect x="${x+10}" y="${y-48}" width="12" height="18" rx="2"/><rect x="${x+28}" y="${y-40}" width="20" height="10"/><path d="M${x-46} ${y-6} v14 M${x+46} ${y-6} v14"/>`);
    case "treadmill": return sk(`<rect x="${x-24}" y="${y-74}" width="48" height="74" rx="8" style="fill:var(--sock)"/><rect x="${x-17}" y="${y-66}" width="34" height="58" rx="4" style="fill:#6B5A52"/><rect x="${x-30}" y="${y-96}" width="60" height="16" rx="4" style="fill:var(--peri)"/><rect x="${x-14}" y="${y-93}" width="20" height="9" rx="2" style="fill:#DCE8C8"/>`,
      `<rect x="${x-24}" y="${y-74}" width="48" height="74" rx="8"/><path d="M${x-17} ${y-56} h34 M${x-17} ${y-44} h34 M${x-17} ${y-32} h34 M${x-17} ${y-20} h34" opacity=".45"/><path d="M${x-26} ${y-80} v28 M${x+26} ${y-80} v28" stroke-width="2.4"/><rect x="${x-30}" y="${y-96}" width="60" height="16" rx="4"/><rect x="${x-14}" y="${y-93}" width="20" height="9" rx="2"/><text x="${x-4}" y="${y-86}" text-anchor="middle" font-family="Klee One,serif" font-size="7" stroke="none" style="fill:var(--line)">1.2</text>`);
    case "bookcase": return furn("shelf", x, y) + sk(`<path d="M${x+20} ${y-104} h30 l-4 8 l4 8 h-30z" style="fill:var(--butter)"/>`,
      `<path d="M${x+20} ${y-104} h30 l-4 8 l4 8 h-30z"/><text x="${x+33}" y="${y-93}" text-anchor="middle" font-family="Klee One,serif" font-size="8" stroke="none" style="fill:var(--line)">new</text>`);
    case "shopcounter": return sk(`<rect x="${x-90}" y="${y-40}" width="180" height="40" rx="4" style="fill:${W2}"/><path d="M${x-96} ${y-118} h192 l-8 18 h-176z" style="fill:var(--card)"/><circle cx="${x-50}" cy="${y-52}" r="10" style="fill:var(--rose)"/><circle cx="${x-24}" cy="${y-52}" r="10" style="fill:var(--butter)"/><circle cx="${x+4}" cy="${y-52}" r="10" style="fill:var(--sage)"/><rect x="${x+30}" y="${y-64}" width="40" height="24" rx="3" style="fill:#FFFDF6"/>`,
      `<rect x="${x-90}" y="${y-40}" width="180" height="40" rx="4"/><path d="M${x-96} ${y-118} h192 l-8 18 h-176z"/><path d="M${x-80} ${y-118} l-3 18 M${x-50} ${y-118} l-2 18 M${x-20} ${y-118} l-1 18 M${x+10} ${y-118} v18 M${x+40} ${y-118} l1 18 M${x+70} ${y-118} l2 18" style="stroke:var(--rose)" stroke-width="6"/><path d="M${x-86} ${y-100} v60 M${x+86} ${y-100} v60"/><rect x="${x+30}" y="${y-64}" width="40" height="24" rx="3"/><text x="${x+50}" y="${y-48}" text-anchor="middle" font-family="Klee One,serif" font-size="11" stroke="none" style="fill:var(--line)">open</text>`);
  }
  return "";
}
export function roomArt(id){
  const r = ROOMS[id], st = stationsOf(id);
  let h = roomShell(id);
  if (id !== "market") h += `<g data-spot="board" aria-label="Quest board"><ellipse class="hov" cx="260" cy="204" rx="40" ry="10" style="fill:var(--butter)"/>
    ${sk(`<rect x="222" y="40" width="76" height="56" rx="3" style="fill:var(--wood)"/>`, `<rect x="222" y="40" width="76" height="56" rx="3"/>${notesArt(230, 50, G.questsIn(id).filter(t => !G.S().doneIds.includes(t.id)).length)}`)}${tapeLabel(260, 112, "Quests here", "var(--butter)")}</g>`;
  else h += sk(`<rect x="40" y="40" width="130" height="80" rx="3" style="fill:var(--wood)"/><rect x="350" y="40" width="130" height="80" rx="3" style="fill:var(--wood)"/>`,
    `<rect x="40" y="40" width="130" height="80" rx="3"/><path d="M40 80 h130"/><rect x="350" y="40" width="130" height="80" rx="3"/><path d="M350 80 h130"/>`) +
    `<g>${[["apple","dumpling","fish","toast"],["tulip","carrot","strawberry","sunflower"]].map((row, r) => row.map((n, i) => iconAt(n, 64 + i*30, 62 + r*38, 26)).join("")).join("")}${[["yarn","ball","brush","crown"],["bath","fort","corn","blueberry"]].map((row, r) => row.map((n, i) => iconAt(n, 374 + i*30, 62 + r*38, 26)).join("")).join("")}</g>`;
  st.forEach(s => {
    h += `<g data-spot="${s.id}" aria-label="${s.name}"><ellipse class="hov" cx="${s.x}" cy="${s.y + 6}" rx="62" ry="12" style="fill:var(--butter)"/>${furn(s.kind, s.x, s.y)}${tapeLabel(s.x, s.y + 24, s.name, "var(--card)")}</g>`;
  });
  h += `<g data-exit="1" aria-label="Exit"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
    ${sk(`<rect x="214" y="600" width="92" height="26" rx="8" style="fill:${r.trim}"/>`, `<rect x="214" y="600" width="92" height="26" rx="8"/><path d="M222 606 h76 M222 620 h76" stroke-dasharray="3 4" opacity=".6"/>`)}
    <text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Exit</text></g>`;
  return h;
}
export function farmArt(){
  let h = `<rect width="520" height="640" style="fill:var(--grass)"/>
    <g filter="url(#wash)" opacity=".7"><ellipse cx="260" cy="90" rx="200" ry="50" style="fill:var(--grass2)"/></g>
    <g filter="url(#wob)" ${ink}><path d="M20 140 H500 M20 140 V600 M500 140 V600 M20 600 H210 M310 600 H500" style="stroke:var(--wood)" stroke-width="3"/>
      ${Array.from({length:17}, (_, i) => `<path d="M${20 + i*30} 132 v16" style="stroke:var(--wood)" stroke-width="2.4"/>`).join("")}</g>
    ${tree(60,110,1)}${tree(460,110,1)}
    ${sk(`<rect x="232" y="40" width="56" height="66" rx="4" style="fill:var(--wood)"/><path d="M226 44 l34 -26 l34 26z" style="fill:var(--sage)"/>`, `<rect x="232" y="40" width="56" height="66" rx="4"/><path d="M226 44 l34 -26 l34 26z"/><path d="M248 106 v-26 h24 v26"/>`)}
    <g filter="url(#wob)" ${ink}><path d="M120 76 v40 M104 86 h32" style="stroke:var(--wood)" stroke-width="3"/><circle cx="120" cy="70" r="9" style="fill:var(--butter)"/><path d="M110 64 l10 -8 l10 8z" style="fill:var(--peach)"/></g>`;
  PLOTS.forEach((p, i) => {
    const s = G.F().plots[i], g = s && s.crop ? G.growth(s) : null;
    const wet = s && s.crop && s.wateredAt;
    h += `<g data-plot="${i}" aria-label="Plot ${i+1}"><rect class="hov" x="${p.x-6}" y="${p.y-6}" width="${p.w+12}" height="${p.h+12}" rx="10" style="fill:var(--butter)"/>
      <g filter="url(#wob)" ${ink}><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="6" style="fill:${wet ? "#8C6A52" : "#B08A6A"}"/>
      <path d="M${p.x+10} ${p.y+22} h${p.w-20} M${p.x+10} ${p.y+44} h${p.w-20}" opacity=".35"/>`;
    if (s && s.crop) {
      const cx = p.x + p.w/2, cy = p.y + p.h/2 + 8;
      if (!wet) h += `<circle cx="${cx-14}" cy="${cy-6}" r="2.4" style="fill:var(--sock)"/><circle cx="${cx}" cy="${cy}" r="2.4" style="fill:var(--sock)"/><circle cx="${cx+14}" cy="${cy-6}" r="2.4" style="fill:var(--sock)"/>`;
      else if (g < .34) h += `<path d="M${cx} ${cy} v-10" style="stroke:var(--moss2)"/><ellipse cx="${cx-5}" cy="${cy-10}" rx="5" ry="3" style="fill:var(--moss)"/><ellipse cx="${cx+5}" cy="${cy-12}" rx="5" ry="3" style="fill:var(--moss)"/>`;
      else if (g < 1) h += `<path d="M${cx} ${cy} v-22" style="stroke:var(--moss2)"/><ellipse cx="${cx-9}" cy="${cy-14}" rx="9" ry="4.5" style="fill:var(--moss)"/><ellipse cx="${cx+9}" cy="${cy-18}" rx="9" ry="4.5" style="fill:var(--moss)"/><ellipse cx="${cx-6}" cy="${cy-26}" rx="6" ry="3.5" style="fill:var(--tree)"/>`;
      h += `</g>`;
      if (wet && g >= 1) h += `<g class="ready">${iconAt(s.crop, cx, cy - 10, 34)}</g>${iconAt("sparkle", cx + 30, cy - 28, 16)}`;
      if (!wet) h += `${iconAt("drop", p.x + p.w - 12, p.y + 12, 15)}`;
    } else h += `</g>`;
    h += `</g>`;
  });
  h += `<g data-exit="1" aria-label="Exit"><ellipse class="hov" cx="260" cy="612" rx="54" ry="14" style="fill:var(--butter)"/>
    <g filter="url(#wob)" ${ink}><path d="M212 590 v34 M308 590 v34" style="stroke:var(--wood)" stroke-width="4"/></g>
    <text class="lab" x="260" y="618" text-anchor="middle" pointer-events="none">Back to the village</text></g>`;
  return h;
}

/* ---------- user-count gardens (outside Chord and Chico) ----------
   stats doc: {chord:{users, per?}, chico:{users, per?}}. One flower per `per` users (default 10).
   Bloom type steps up at 100 / 250 users; a blossom tree joins at 500 and sparkles at 1000. */
export const GARDEN_TIERS = [[0, "daisy"], [100, "tulip"], [250, "sunflower"]];
export function userGarden(key, x, y, cols, rows, gap){
  const st = (G.stats() || {})[key];
  if (!st || !(st.users >= 0)) return "";
  const per = st.per > 0 ? st.per : 10, users = Math.floor(st.users), n = Math.min(cols*rows, Math.ceil(users/per));
  const tier = GARDEN_TIERS.reduce((t, [min, k]) => users >= min ? k : t, "daisy");
  const cols4 = key === "chord" ? ["#F3C969", "#FFFDF6", "#C3CDEE"] : ["#EFA3A6", "#F4C7CF", "#FFFDF6"];
  let f = "";
  for (let i = 0; i < n; i++) {
    const cx = x + 4 + (i % cols)*gap + (Math.floor(i/cols) % 2)*gap/2, cy = y + 10 + Math.floor(i/cols)*gap, c = cols4[i % 3];
    f += `<g class="bloom"><path d="M${cx} ${cy} v${tier === "sunflower" ? -9 : -6}" style="stroke:var(--moss2)" stroke-width="1.2"/>`;
    if (tier === "daisy") f += `<circle cx="${cx}" cy="${cy-7}" r="2.6" style="fill:${c}"/><circle cx="${cx}" cy="${cy-7}" r="1" fill="#F3C969"/>`;
    else if (tier === "tulip") f += `<path d="M${cx-3} ${cy-9} q3 -6 6 0 q-1 4 -3 4 q-2 0 -3 -4z" style="fill:${c}" stroke="var(--line)" stroke-width=".6"/>`;
    else f += `<circle cx="${cx}" cy="${cy-11}" r="4.2" fill="#F3C969" stroke="var(--line)" stroke-width=".6"/><circle cx="${cx}" cy="${cy-11}" r="1.8" fill="#8A5A3A"/>`;
    f += `</g>`;
  }
  const w = cols*gap, signX = x + w/2 + (key === "chord" ? 8 : 0), signY = y + rows*gap + 10;
  const tree = users >= 500 ? `<g filter="url(#wob)" ${ink}><rect x="${x+w-6}" y="${y+4}" width="4" height="12" style="fill:var(--wood)"/><circle cx="${x+w-4}" cy="${y}" r="9" style="fill:#F4C7CF"/><circle cx="${x+w-10}" cy="${y+4}" r="6" style="fill:#EFA3A6"/></g>` : "";
  const sparkle = users >= 1000 ? `<g class="twinkle">${iconAt("sparkle", x - 2, y - 2, 12)}${iconAt("sparkle", x + w + 2, y + rows*gap - 4, 11)}</g>` : "";
  const label = `${users.toLocaleString()} ${key === "chord" ? "creatives" : "families"}`;
  return `<g data-ugarden="${key}" aria-label="${label}">${f}${tree}${sparkle}
    ${tapeLabel(signX, signY, label, key === "chord" ? "var(--sage)" : "var(--blush)", 10)}</g>`;
}
