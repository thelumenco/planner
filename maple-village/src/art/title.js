// The title screen's picture: Honeybrook at golden hour. Rooftops in the valley, the vineyard rows on the slope, the
// train running along the top of the hill, a river catching the light. Same ink and marker as the rest of the game.
import { sk } from "./scenes.js";

const house = (x, y, w, h, wall, roof) => [
  `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" style="fill:${wall}"/><path d="M${x - 4} ${y - h} L${x + w/2} ${y - h - w*.5} L${x + w + 4} ${y - h}z" style="fill:${roof}"/><rect x="${x + w*.38}" y="${y - h*.55}" width="${w*.24}" height="${h*.55}" style="fill:#8A6A4A"/><rect x="${x + w*.12}" y="${y - h*.8}" width="${w*.18}" height="${h*.22}" style="fill:#FFE3A3"/>`,
  `<rect x="${x}" y="${y - h}" width="${w}" height="${h}"/><path d="M${x - 4} ${y - h} L${x + w/2} ${y - h - w*.5} L${x + w + 4} ${y - h}z"/><rect x="${x + w*.38}" y="${y - h*.55}" width="${w*.24}" height="${h*.55}"/>`];
const tree = (x, y, r, c = "#7FA35A") => [`<rect x="${x - 1.5}" y="${y - 6}" width="3" height="8" style="fill:#8A6A4A"/><circle cx="${x}" cy="${y - 6 - r}" r="${r}" style="fill:${c}"/>`, `<circle cx="${x}" cy="${y - 6 - r}" r="${r}"/>`];

export function titleArt(){
  const houses = [house(150, 176, 30, 22, "#F3E3C9", "#C8643B"), house(186, 182, 34, 26, "#E9EEF3", "#6E9FD6"), house(226, 176, 28, 20, "#F6E3D8", "#E8566C"),
    house(262, 184, 32, 24, "#F3EDE4", "#9CC27E"), house(118, 186, 26, 18, "#F7E6BC", "#B98A5A")];
  const trees = [tree(104, 190, 9), tree(300, 188, 10, "#6E9A52"), tree(140, 196, 7, "#9CC27E"), tree(250, 196, 8)];
  // the vineyard: green rows on the slope to the right, posts standing straight now
  const rows = [0, 1, 2, 3, 4, 5].map(i => `<path d="M${308 + i*15} ${150 + i*3} q20 26 30 60" style="fill:none;stroke:#5E8A48;stroke-width:5;stroke-linecap:round"/>`).join("");
  const train = `<g transform="translate(64 76)"><rect x="0" y="0" width="56" height="12" rx="4" fill="#FFFDF6" stroke="#3b3530" stroke-width="1"/><rect x="0" y="7" width="56" height="2.5" fill="#3E6BAE"/>${[6, 18, 30, 42].map(x => `<rect x="${x}" y="2.5" width="8" height="4" rx="1" fill="#FFE3A3"/>`).join("")}<circle cx="10" cy="13" r="2.4" fill="#5A4A40"/><circle cx="46" cy="13" r="2.4" fill="#5A4A40"/></g>
    <path d="M0 92 Q120 78 260 86 T400 80" fill="none" stroke="#8A6A4A" stroke-width="1.2" stroke-dasharray="3 2" opacity=".6"/>`;
  return `<svg viewBox="0 0 400 240" class="ttpic" role="img" aria-label="Honeybrook at golden hour" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="ttSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6C98A"/><stop offset=".6" stop-color="#F9E2B8"/><stop offset="1" stop-color="#FBEFD6"/></linearGradient>
      <radialGradient id="ttSun"><stop offset="0" stop-color="#FFF6DA"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="240" fill="url(#ttSky)"/><circle cx="318" cy="64" r="60" fill="url(#ttSun)"/><circle cx="318" cy="64" r="17" fill="#FFF1C8"/>
    <path d="M0 96 Q70 70 150 88 T300 80 T400 86 V140 H0z" fill="#C9C48A"/><path d="M0 110 Q100 92 200 108 T400 100 V160 H0z" fill="#B9B070"/>
    ${train}
    <path d="M280 150 Q340 128 400 140 V240 H280z" fill="#A9B86A"/>${rows}
    <path d="M0 160 Q110 142 220 156 T400 168 V240 H0z" fill="#D9C27A"/>
    <path d="M0 214 Q90 200 190 212 T400 206 V240 H0z" fill="#9FC9D9"/><path d="M40 222 h40 M150 216 h30 M260 220 h44" stroke="#FFFDF6" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`
    + sk(trees.map(t => t[0]).join("") + houses.map(h => h[0]).join(""), trees.map(t => t[1]).join("") + houses.map(h => h[1]).join(""))
    + `<path d="M126 168 q4 -10 0 -18 M196 152 q5 -10 0 -18" fill="none" stroke="#FFFDF6" stroke-width="1.4" opacity=".7"/></svg>`;
}
