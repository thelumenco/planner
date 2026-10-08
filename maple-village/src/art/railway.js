// The railway and the Honeybrook along the top of the top row (the bay, Wildflower Farm, the cottage lane): the track
// at y 40-50 with its sleepers, the brook just below it (y ~92), and the train itself (game/rail.js says when it's where).
import { sk } from "./scenes.js";
import { trainHere, STOP_X } from "../game/rail.js";

export const RAIL_Y = 48, BROOK_Y = 92;
// the track: two rails on sleepers, on a low gravel bank, from x1 to x2
export const track = (x1, x2) => sk(`<rect x="${x1}" y="${RAIL_Y - 14}" width="${x2 - x1}" height="22" style="fill:#C9B8A0" opacity=".75"/>${Array.from({length: Math.ceil((x2 - x1)/14)}, (_, i) => `<rect x="${x1 + i*14}" y="${RAIL_Y - 12}" width="6" height="18" style="fill:#8A6A52"/>`).join("")}`,
  `<path d="M${x1} ${RAIL_Y - 9} H${x2} M${x1} ${RAIL_Y} H${x2}" stroke-width="1.6"/>`);
// the brook: a wavy ribbon of water flowing west, a little sparkle on it
export const brook = (x1, x2, y = BROOK_Y) => { const w = x2 - x1, n = Math.max(2, Math.round(w/40)), seg = w/n;
  let top = `M${x1} ${y - 7}`, bot = ""; for (let i = 0; i < n; i++) { top += ` q${seg/2} ${i % 2 ? 4 : -4} ${seg} 0`; }
  for (let i = n - 1; i >= 0; i--) bot += ` q${-seg/2} ${i % 2 ? 4 : -4} ${-seg} 0`;
  return sk(`<path d="${top} V${y + 7}${bot} z" style="fill:#9FD3E8"/>`, `<path d="${top}"/>`) + `<g pointer-events="none" opacity=".8">${Array.from({length: n}, (_, i) => `<path d="M${x1 + i*seg + 10} ${y} h10" style="stroke:#FFFDF6" stroke-width="1.6"><animate attributeName="opacity" values="0;1;0" dur="${3 + (i % 3)}s" begin="${i*.7}s" repeatCount="indefinite"/></path>`).join("")}</g>`; };

// the train: a green-and-cream engine, three carriages with faces at the windows, and a goods wagon of milk churns
const FACES = ["#F2D3BC", "#C99A78", "#EAC4A4", "#A8754F", "#F0D2B6"];
export function trainArt(dir){
  const e = dir === "w", car = (x, k) => `<rect x="${x}" y="${RAIL_Y - 30}" width="58" height="24" rx="4" style="fill:#F6EBC8"/><rect x="${x}" y="${RAIL_Y - 32}" width="58" height="5" rx="2" style="fill:#5E8A5A"/>
    ${[0, 1, 2].map(i => `<rect x="${x + 6 + i*18}" y="${RAIL_Y - 24}" width="12" height="10" rx="2" style="fill:#CFE0EE"/><circle cx="${x + 12 + i*18}" cy="${RAIL_Y - 18}" r="3" style="fill:${FACES[(k*3 + i) % FACES.length]}"/>`).join("")}`;
  const wheels = x => `<circle cx="${x + 12}" cy="${RAIL_Y - 4}" r="4" style="fill:#3A2E28"/><circle cx="${x + 46}" cy="${RAIL_Y - 4}" r="4" style="fill:#3A2E28"/>`;
  const engine = x => `<rect x="${x}" y="${RAIL_Y - 30}" width="50" height="24" rx="5" style="fill:#5E8A5A"/><rect x="${e ? x : x + 30}" y="${RAIL_Y - 38}" width="20" height="12" rx="2" style="fill:#4A6E48"/><rect x="${e ? x + 36 : x + 6}" y="${RAIL_Y - 42}" width="8" height="12" style="fill:#3A2E28"/><circle cx="${e ? x + 4 : x + 46}" cy="${RAIL_Y - 18}" r="4" style="fill:#F3C969"/><path d="M${x} ${RAIL_Y - 16} h50" style="stroke:#F6EBC8" stroke-width="2"/>`;
  const goods = x => `<rect x="${x}" y="${RAIL_Y - 26}" width="58" height="20" rx="2" style="fill:#B5443A"/>${[0, 1, 2, 3].map(i => `<rect x="${x + 6 + i*13}" y="${RAIL_Y - 36}" width="9" height="12" rx="3" style="fill:#DDE3E8"/>`).join("")}`;
  // engine leads in the direction of travel: east-bound it's on the right, west-bound on the left
  const parts = e ? [["engine", 0], ["car", 54], ["car", 116], ["car", 178], ["goods", 240]] : [["goods", 0], ["car", 62], ["car", 124], ["car", 186], ["engine", 248]];
  const smokeX = e ? 40 : 254;
  return `<g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.2">${parts.map(([k, x], i) => (k === "engine" ? engine(x) : k === "goods" ? goods(x) : car(x, i)) + (k === "engine" ? `<circle cx="${x + 12}" cy="${RAIL_Y - 4}" r="5" style="fill:#3A2E28"/><circle cx="${x + 38}" cy="${RAIL_Y - 4}" r="5" style="fill:#3A2E28"/>` : wheels(x))).join("")}</g>
    <g pointer-events="none" opacity=".7">${[0, 1, 2].map(i => `<circle cx="${smokeX}" cy="${RAIL_Y - 48}" r="${5 + i*2}" style="fill:#FFFDF6;stroke:var(--line)" stroke-width=".8"><animate attributeName="cy" values="${RAIL_Y - 46};${RAIL_Y - 80}" dur="2s" begin="${i*.6}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="2s" begin="${i*.6}s" repeatCount="indefinite"/></circle>`).join("")}</g>`;
}
export const TRAIN_LEN = 300;
// the train on this screen right now, moving (SMIL, started part-way through so a redraw doesn't restart it) or waiting
export function trainLayer(scene){
  const t = trainHere(scene); if (!t) return "";
  const off = -TRAIN_LEN - 20, end = 540, stop = STOP_X, el = t.elapsed.toFixed(1);
  const from = t.mode === "dwell" ? stop : t.mode === "depart" ? stop : t.dir === "e" ? off : end;
  const to = t.mode === "dwell" ? stop : t.mode === "arrive" ? stop : t.dir === "e" ? end : off;
  const move = from === to ? "" : `<animateTransform attributeName="transform" type="translate" from="${from} 0" to="${to} 0" dur="60s" begin="-${el}s" fill="freeze"/>`;
  return `<g class="train" pointer-events="none" transform="translate(${from} 0)">${trainArt(t.dir)}${move}</g>`;
}
