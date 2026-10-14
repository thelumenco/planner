// The paperie in Montrose (round 183): one room, the shop at the front and the paper-making along the edges, so the player
// walks the steps round the room. Everything shows where the batch is up to: torn scraps in the bin, bits floating in
// the tub, the vat's pulp in its colour (flecked with the add-in), the stack in the press, sheets pegged on the line
// (darker while damp), and the shelves stacked in the colours you've made. Before it's yours: an empty shop, dust
// sheets, and an À VENDRE board to tap.
import { LOC } from "../util.js";
import { sk } from "./scenes.js";
import { iconAt } from "./icons.js";
import { COL, WET } from "./paper-icons.js";
import { classOn } from "../game/paperie.js";
import { rLab as lab, rG as g, rSpot as spot, rHov as hovE, rExit as exit, rFloor as floor, rSign as sign } from "./bellbird-rooms.js";

let getF = () => null;
export const setPaperArtF = fn => { getF = fn; };
export const paperOwned = () => { const F = getF(); return !!(F && F.goals && F.goals.paperie); };
const now = () => Date.now() + (globalThis.__mapleOffset || 0);
const O = `stroke="#3a2e28" stroke-width=".6"`;
const ADDCOL = {lavender: "#8E6CC0", rose: "#E36A86", petals: "#F3C969", tea: "#6E4A2E", gold: "#E0A83A", seeds: "#5A4632"};

const stoneWall = () => g(`<rect width="520" height="200" fill="#EDE2CC"/>${Array.from({length: 22}, (_, i) => `<rect x="${(i*61) % 500}" y="${20 + (i*37) % 160}" width="${20 + (i % 3)*8}" height="9" rx="3" fill="#DDCDAE"/>`).join("")}<rect width="520" height="12" fill="#5E7A4E"/><rect y="196" width="520" height="6" fill="#C9B48E"/>`);
const flecksIn = (add, x, y, w, h, n = 8) => !add || add === "none" ? "" : Array.from({length: n}, (_, i) => `<circle cx="${(x + ((i*37) % 100)/100*w).toFixed(1)}" cy="${(y + ((i*61) % 100)/100*h).toFixed(1)}" r="1.4" fill="${ADDCOL[add]}"/>`).join("");

function emptyRoom(){
  const dust = g(`${[[60, 300], [420, 320], [90, 470], [440, 480]].map(([x, y]) => `<path d="M${x - 34} ${y + 20} q10 -40 34 -42 q26 2 34 42z" fill="#F3EEE4" ${O}/>`).join("")}<path d="M40 560 h60 M380 250 h40" stroke="#C9B48E" stroke-dasharray="3 4"/>`);
  const board = spot("pp_buy", 260, 300, "The À VENDRE board", hovE(260, 250, 80, 14), sk(`<rect x="190" y="90" width="140" height="80" rx="4" style="fill:#FFFDF6"/>`, `<rect x="190" y="90" width="140" height="80" rx="4"/><path d="M220 170 v30 M300 170 v30"/>`)
    + g(`<text x="260" y="124" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="20" fill="#C8432F">À VENDRE</text><text x="260" y="148" text-anchor="middle" font-family="Klee One,serif" font-size="10" fill="#5A4636">ask at the café</text>`) + lab(260, 230, "For sale", "#F6E3B4"));
  return floor(200, "#C9A27E") + stoneWall() + dust + board + exit("#5E7A4E");
}

export function paperRoomArt(){
  if (!paperOwned()) return emptyRoom();
  const F = getF(), p = (F && F.paperie) || {}, t = now(), stock = Object.entries(p.stock || {}).filter(([, n]) => n > 0);
  // the paper shelves on the back wall, left: stacks in the colours she's made
  const stacks = stock.slice(0, 12).map(([id, n], i) => { const [, col, add] = id.split("_"), x = 34 + (i % 4)*40, y = 72 + Math.floor(i/4)*44, h = Math.min(18, 4 + n*2);
    return `<rect x="${x}" y="${y + 20 - h}" width="32" height="${h}" rx="1" fill="${COL[col]}" ${O}/>${flecksIn(add, x + 3, y + 22 - h, 26, h - 4, 3)}<path d="M${x} ${y + 20 - h/2} h32" stroke="#00000018"/>`; }).join("");
  const shelf = spot("pp_shelf", 110, 270, "The paper shelves", hovE(110, 205, 90, 10), sk(`<rect x="24" y="40" width="172" height="152" rx="3" style="fill:#8A6A52"/>${[0, 1, 2].map(r => `<rect x="28" y="${92 + r*44}" width="164" height="5" style="fill:#6B5444"/>`).join("")}`, `<rect x="24" y="40" width="172" height="152" rx="3"/>`)
    + g(stacks || "") + lab(110, 220, stock.length ? "Paper shelves" : "Empty shelves", "#F6E3B4"));
  // the drying line, back wall right: each batch's sheets pegged up, darker while damp
  const sheets = (p.line || []).slice(0, 4).flatMap((s, b) => [0, 1, 2].map(k => { const x = 222 + b*70 + k*20, dry = s.done <= t;
    return dry ? iconAt(`pp_${s.col}_${s.add}`, x + 8, 92, 26) : `<rect x="${x}" y="80" width="17" height="24" fill="${WET[s.col]}" ${O}/>${flecksIn(s.add, x + 2, 82, 13, 20, 3)}`; })).join("");
  const line = spot("pp_line", 380, 268, "The drying line", hovE(360, 205, 130, 10), g(`<path d="M214 70 Q360 84 506 70" fill="none" stroke="#5A4636" stroke-width="1.2"/>${Array.from({length: 12}, (_, i) => `<rect x="${224 + i*23}" y="72" width="3" height="7" fill="#C9A27E"/>`).join("")}`) + g(sheets)
    + lab(360, 220, "Drying line", "#E6DCF3"));
  // the vat, back middle: water, or the pulp in its colour with the add-in through it, and the mould and deckle
  const pulp = p.pulp ? COL[p.pulp.col] : p.wet ? "#D9E6EA" : "#C9DEE6", padd = p.pulp ? p.pulp.add : null;
  const vat = spot("pp_vat", 260, 312, "The vat", hovE(260, 300, 70, 12), sk(`<path d="M200 236 h120 l-8 56 h-104z" style="fill:#9A7A5A"/><ellipse cx="260" cy="236" rx="60" ry="12" style="fill:${pulp}"/>`, `<path d="M200 236 h120 l-8 56 h-104z"/><ellipse cx="260" cy="236" rx="60" ry="12"/><path d="M204 258 h112 M206 276 h108" opacity=".5"/>`)
    + g(flecksIn(padd, 214, 230, 92, 10, 10) + `<rect x="168" y="214" width="30" height="40" rx="2" transform="rotate(-12 183 234)" fill="none" stroke="#6B5444" stroke-width="3"/><path d="M172 222 h22 M172 230 h22 M172 238 h22 M172 246 h22" transform="rotate(-12 183 234)" stroke="#B9AE9A" stroke-width=".6"/>`)
    + lab(260, 330, p.pulp ? "Pulp in the vat" : "The vat", "#F6E3B4"));
  // the scrap bin, left: torn bits sticking up (more scraps, fuller)
  const bits = Array.from({length: Math.min(7, p.scraps || 0)}, (_, i) => `<path d="M${46 + i*8} ${300 - (i % 3)*4} l7 -10 l5 4 l-4 10z" fill="${["#FFFDF6", "#7A1F3D", "#D9B98C", "#C2505F", "#F3C969"][i % 5]}" ${O}/>`).join("");
  const scrap = spot("pp_scrap", 132, 336, "The scrap bin", hovE(76, 344, 46, 8), g(bits) + sk(`<rect x="38" y="300" width="76" height="44" rx="3" style="fill:#B98A5E"/>`, `<rect x="38" y="300" width="76" height="44" rx="3"/><path d="M38 314 h76 M38 328 h76" opacity=".5"/>`) + lab(76, 362, "Scrap bin", "#F6E3B4"));
  // the soaking tub, left: water, bits floating when there's a batch in
  const soaking = !!p.soak, floaty = soaking ? [[54, 422, "#FFFDF6"], [72, 426, "#7A1F3D"], [90, 421, "#D9B98C"], [64, 429, "#C2505F"], [100, 427, "#F3C969"]].map(([x, y, c]) => `<path d="M${x} ${y}l7 -2l2 4l-7 2z" fill="${c}" ${O}/>`).join("") : "";
  const tub = spot("pp_soak", 132, 446, "The soaking tub", hovE(76, 456, 46, 8), sk(`<path d="M34 420 h84 l-6 34 h-72z" style="fill:#B9AE9A"/><ellipse cx="76" cy="420" rx="42" ry="8" style="fill:#A8CCD8"/>`, `<path d="M34 420 h84 l-6 34 h-72z"/><ellipse cx="76" cy="420" rx="42" ry="8"/>`) + g(floaty) + lab(76, 474, "Soaking tub", "#E3EEF0"));
  // the add-in jars, right: one jar of each
  const jarsArt = Object.entries(ADDCOL).map(([k, c], i) => { const x = 418 + (i % 3)*24, y = 290 + Math.floor(i/3)*28;
    return `<rect x="${x}" y="${y}" width="18" height="22" rx="3" fill="#F3F7F8" ${O}/><rect x="${x + 2}" y="${y + 8}" width="14" height="12" rx="2" fill="${c}" opacity=".85"/><rect x="${x + 3}" y="${y - 3}" width="12" height="4" rx="1" fill="#C9A27E" ${O}/>`; }).join("");
  const adds = spot("pp_adds", 386, 320, "The add-in jars", hovE(446, 352, 44, 8), sk(`<rect x="408" y="282" width="84" height="66" rx="3" style="fill:#8A6A52"/>`, `<rect x="408" y="282" width="84" height="66" rx="3"/>`) + g(jarsArt) + lab(448, 272, "Add-ins", "#E6DCF3"));
  // the screw press, right: a stack when there's one in
  const inPress = p.press || p.wet, stack = inPress ? [0, 1, 2, 3].map(i => `<rect x="${428}" y="${446 - i*5}" width="44" height="5" fill="${i % 2 ? WET[inPress.col] : COL[inPress.col]}" ${O}/>`).join("") : "";
  const pressY = p.press ? 420 : 404;
  const press = spot("pp_press", 386, 446, "The screw press", hovE(450, 462, 46, 8), sk(`<rect x="416" y="450" width="68" height="12" rx="2" style="fill:#5A4636"/><rect x="418" y="372" width="8" height="80" style="fill:#5A4636"/><rect x="474" y="372" width="8" height="80" style="fill:#5A4636"/><rect x="414" y="366" width="72" height="10" rx="2" style="fill:#5A4636"/>`,
    `<rect x="416" y="450" width="68" height="12" rx="2"/><rect x="414" y="366" width="72" height="10" rx="2"/>`) + g(stack + `<rect x="422" y="${pressY}" width="56" height="8" rx="1" fill="#8A6A42" ${O}/><path d="M450 376 V${pressY}" stroke="#3a2e28" stroke-width="3"/><path d="M432 350 h36" stroke="#3a2e28" stroke-width="3"/><path d="M450 350 v26" stroke="#3a2e28" stroke-width="3"/>`) + lab(450, 480, "Press", "#F6E3B4"));
  // the till, by the door: a bell, and the sign turned to ouvert
  const till = spot("pp_till", 206, 548, "The till", hovE(110, 560, 70, 10), sk(`<rect x="40" y="516" width="140" height="40" rx="4" style="fill:#5E7A4E"/><rect x="36" y="510" width="148" height="10" rx="3" style="fill:#C9A27E"/>`, `<rect x="40" y="516" width="140" height="40" rx="4"/>`)
    + g(`<path d="M70 508 q6 -12 12 0z" fill="#E0A83A" ${O}/><rect x="120" y="494" width="44" height="14" rx="2" fill="#FFFDF6" ${O}/><text x="142" y="504" text-anchor="middle" font-family="Klee One,serif" font-size="8" fill="#5E7A4E">ouvert</text>`) + lab(110, 578, "Till", "#F6E3B4"));
  // round 185: the ribbon rack by the door, right: spools of ribbon, a tray of stamps, tags on a hook
  const rack = spot("pp_rack", 368, 548, "The ribbon rack", hovE(446, 572, 46, 8), sk(`<rect x="404" y="500" width="84" height="60" rx="3" style="fill:#8A6A52"/><path d="M408 520 h76" style="stroke:#6B5444" stroke-width="3"/>`, `<rect x="404" y="500" width="84" height="60" rx="3"/>`)
    + g(["#C8432F", "#7A1F3D", "#C9A27E", "#E8566C"].map((c, i) => `<circle cx="${418 + i*20}" cy="512" r="7" fill="${c}" ${O}/><circle cx="${418 + i*20}" cy="512" r="2.4" fill="#FFFDF6"/>`).join("") + `<rect x="412" y="530" width="34" height="14" rx="2" fill="#C9A27E" ${O}/>${[0, 1, 2, 3].map(i => `<rect x="${415 + i*8}" y="526" width="5" height="6" rx="1" fill="#8A6A42"/>`).join("")}${[0, 1, 2].map(i => `<path d="M${458 + i*9} 528 l3 -3 h4 v12 h-7z" fill="${i === 1 ? "#C6D6B2" : "#EFE6D2"}" ${O}/>`).join("")}`)
    + lab(446, 580, "Ribbons & tags", "#F4C7CF"));
  // round 186: on Saturday afternoons the big table comes out for the card class, cards and scissors all over it
  const sg = new Date(t + LOC()), cls = classOn(sg.toISOString().slice(0, 10), sg.getUTCHours()*60 + sg.getUTCMinutes()) ? g(sk(`<rect x="210" y="420" width="100" height="44" rx="4" style="fill:#E8D3BC"/>`, `<rect x="210" y="420" width="100" height="44" rx="4"/>`)
    + ["#F2C4C4", "#C6D6B2", "#9DB4D0", "#EFE6D2"].map((c, i) => `<rect x="${222 + i*20}" y="${428 + (i % 2)*10}" width="14" height="18" rx="1" fill="${c}" ${O}/>`).join("") + lab(260, 478, "Card class", "#F4C7CF")) : "";
  return floor(200, "#C9A27E") + stoneWall() + sign(260, 32, "PAPETERIE", "#FFFDF6", "#5E7A4E", 11) + shelf + line + vat + scrap + tub + adds + press + till + rack + cls + exit("#5E7A4E");
}
