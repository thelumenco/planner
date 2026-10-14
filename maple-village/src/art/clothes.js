// The player's clothes, drawn by one generator so the everyday look (look.js) and tailor-made clothes match.
// clothesArt({top, bottom, body}) returns SVG markup for each part of the #mel figure (index.html):
//   defs (patterns), legL/legR (trouser legs), hips (shorts/trousers seat, a skirt, or a dress's skirt),
//   armL/armR (sleeves), torso (top or dress bodice, neckline, collar, buttons, pockets).
// Units are the figure's: feet at y 0, hips y -23..-14, arms y -34..-20.5, torso y -36..-22.4 (up to the chin).
// A missing colour falls back to the look's CSS variables (--tank for the top, --denim for the bottom).

const KINDS = ["tank", "tee", "blouse", "shirt", "jumper", "dress"];
const SLEEVES = ["none", "short", "long", "puff"];
const NECKS = ["round", "v", "collar", "square"];
const LENGTHS = ["short", "knee", "long"];
const PATS = ["plain", "gingham", "stripe", "floral", "polka"];
const BUTTONS = {wood: "#B4844F", shell: "#F6EEDF", brass: "#D8AE48", pearl: "#FBF8F1"};
const DEF = {
  tank: {sleeves: "none", neck: "round", buttons: null},
  tee: {sleeves: "short", neck: "round", buttons: null},
  blouse: {sleeves: "short", neck: "round", buttons: null},
  shirt: {sleeves: "long", neck: "collar", buttons: "shell"},
  jumper: {sleeves: "long", neck: "round", buttons: null},
  dress: {sleeves: "none", neck: "round", buttons: null}
};
const pick = (v, list, d) => list.includes(v) ? v : d;
const HEX = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;
const hexOf = c => { const m = HEX.exec(String(c || "").trim()); if (!m) return null; let h = m[1].toUpperCase(); if (h.length === 3) h = h.replace(/./g, x => x + x); return h; };
const lum = h => { const n = parseInt(h, 16); return (0.299*(n >> 16) + 0.587*((n >> 8) & 255) + 0.114*(n & 255)) / 255; };
const n = v => +v.toFixed(2);

// a pattern fill for a colour: small and soft at the figure's size (about 60px tall)
function pattern(pat, h){
  const id = `cl-${pat}-${h}`, base = `#${h}`, light = lum(h) > 0.72;
  const ink = light ? "#8A6F5E" : "#FFFDF6", a = light ? 0.32 : 0.42;
  let art = "";
  if (pat === "gingham") art = `<rect width="3.2" height="3.2" fill="${base}"/><rect width="1.6" height="3.2" fill="${ink}" opacity="${a}"/><rect width="3.2" height="1.6" fill="${ink}" opacity="${a}"/>`;
  if (pat === "stripe") art = `<rect width="3" height="3" fill="${base}"/><rect y="2" width="3" height=".75" fill="${ink}" opacity="${a + 0.18}"/>`;
  if (pat === "polka") art = `<rect width="4" height="4" fill="${base}"/><circle cx="1" cy="1" r=".55" fill="${ink}" opacity=".85"/><circle cx="3" cy="3" r=".55" fill="${ink}" opacity=".85"/>`;
  if (pat === "floral") {
    const pet = light ? "#E8A0A8" : "#FFFDF6", mid = "#F3C969";
    const fl = (x, y) => [[0, -.75], [.72, -.23], [.45, .62], [-.45, .62], [-.72, -.23]].map(([dx, dy]) => `<circle cx="${n(x + dx)}" cy="${n(y + dy)}" r=".45" fill="${pet}"/>`).join("") + `<circle cx="${x}" cy="${y}" r=".38" fill="${mid}"/>`;
    art = `<rect width="7" height="7" fill="${base}"/>${fl(1.8, 1.9)}${fl(5.3, 5.2)}<circle cx="5.4" cy="1.6" r=".3" fill="${pet}" opacity=".8"/><circle cx="1.7" cy="5.5" r=".3" fill="${pet}" opacity=".8"/>`;
  }
  const w = pat === "floral" ? 7 : pat === "polka" ? 4 : pat === "gingham" ? 3.2 : 3;
  return {id, svg: `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${w}">${art}</pattern>`};
}

// a fill attribute for a garment, adding its pattern to defs
function filler(col, pat, fallbackVar, fallbackHex, defs){
  const h = hexOf(col);
  if (pat !== "plain") {
    const p = pattern(pat, h || fallbackHex);
    if (!defs.has(p.id)) defs.set(p.id, p.svg);
    return {fill: `style="fill:url(#${p.id})"`, plain: `style="fill:${h ? "#" + h : `var(${fallbackVar})`}"`};
  }
  const f = `style="fill:${h ? "#" + h : col && /^var\(/.test(col) ? col : `var(${fallbackVar})`}"`;
  return {fill: f, plain: f};
}

// ---- sleeves, drawn on the left arm (x -12..-7.8) and mirrored for the right
function sleeve(kind, sleeves, F){
  if (sleeves === "none") return "";
  if (sleeves === "short") return `<path d="M-12.2 -29 v-3.4 q0 -1.8 2 -1.8 h2.6 l.2 5.2z" ${F}/>`;
  if (sleeves === "puff") return `<path d="M-7.4 -28.6 l-.2 -5.6 h-2.6 q-2.6 0 -3.2 2.6 q-.5 2.2 1 3.2 q2.4 .8 5 -.2z" ${F}/>`
    + `<path d="M-11.2 -33.4 q-.9 2 -.2 3.8 M-9.4 -33.8 q-.5 2.2 0 4.4" fill="none" stroke-width=".55" stroke-linecap="round"/>`
    + `<path d="M-12.4 -29.1 q2.4 .8 5 -.2" fill="none" stroke-width=".8"/>`;
  // long: to the wrist, with a cuff (ribbed for a jumper)
  const cuff = kind === "jumper"
    ? `<path d="M-12.2 -24.4 h4.8 M-11 -24.2 v1.4 M-9.6 -24.2 v1.4 M-8.3 -24.2 v1.4" fill="none" stroke-width=".55"/>`
    : `<path d="M-12.2 -24.6 h4.8" fill="none" stroke-width=".7"/>`;
  return `<path d="M-12.2 -22.8 v-9.6 q0 -1.8 2 -1.8 h2.6 l.2 11.4z" ${F}/>${cuff}`;
}
const mirror = s => s ? `<g transform="scale(-1 1)">${s}</g>` : "";

// ---- the torso outline for each body: shoulder S, neck edge N (where the neckline starts), bottom B
const BODY = {
  woman: {S: [8.2, -36], N: [5.6, -36.4], B: [9, -22.4], sh: "q1.2 -.4 2.6 -.4", round: "q2.8 2.6 5.6 2.6 q2.8 0 5.6 -2.6", shR: "q1.4 0 2.6 .4"},
  man: {S: [8.8, -35.6], N: [5.8, -36.4], B: [9.4, -22.4], sh: "q1.2 -.8 3 -.8", round: "q2.9 2.2 5.8 2.2 q2.9 0 5.8 -2.2", shR: "q1.8 0 3 .8"}
};
BODY.neither = BODY.woman;

function neckline(neck, b, kind){
  const nx = b.N[0];
  if (neck === "v") return `l${nx} 5 l${nx} -5`;
  if (neck === "square") return `l1.2 2.6 h${n(2*nx - 2.4)} l1.2 -2.6`;
  if (neck === "collar" || kind === "shirt") return `q${n(nx/2)} 2.4 ${nx} 2.4 q${n(nx/2)} 0 ${nx} -2.4`;
  return b.round;
}
// the lowest point of the neckline at the centre, for the skin under it and where buttons start
const neckDepth = (neck, b) => neck === "v" ? b.N[1] + 5 : neck === "square" ? b.N[1] + 2.6 : neck === "collar" ? b.N[1] + 2.4 : b.N[1] + (b === BODY.man ? 2.2 : 2.6);

function torsoArt(t, b, F, plain){
  const {kind, sleeves, neck, buttons, pockets} = t, [sx, sy] = b.S, [nx, ny] = b.N;
  const jumper = kind === "jumper", bx = b.B[0] + (jumper ? 0.3 : 0), by = b.B[1] + (jumper ? 1 : 0);
  const depth = neckDepth(neck, b);
  // a round neck meets the chin (no neck showing); a V, square or collar dips below it, with skin inside its outline
  let s = neck === "round" ? "" : `<path d="M${-nx} ${ny} h${n(2*nx)} V${n(depth + 0.6)} H${-nx}z" style="fill:var(--skin)" stroke="none"/>`;
  s += `<path d="M${-sx} ${sy} ${b.sh} ${neckline(neck, b, kind)} ${b.shR} L${bx} ${by} H${-bx}z" ${F}/>`;
  if (sleeves === "none") s += `<path d="M${n(-nx + 0.2)} ${ny + 0.2} l.6 -3.2 M${n(nx - 0.2)} ${ny + 0.2} l-.6 -3.2" fill="none"/>`;
  if (jumper) {
    s += `<path d="M${-bx + 0.1} ${n(by - 1.7)} H${bx - 0.1}" fill="none" stroke-width=".7"/>`;
    let ribs = ""; for (let x = -bx + 1.6; x < bx - 1; x += 2) ribs += `M${n(x)} ${n(by - 1.5)} v1.3 `;
    s += `<path d="${ribs}" fill="none" stroke-width=".5"/>`;
    if (neck === "round") s += `<path d="M${-nx} ${ny} ${b.round}" transform="translate(0 1.1)" fill="none" stroke-width=".55"/>`;
  }
  if (kind === "blouse" && neck === "round" && !buttons) {
    // soft gathers under the neckline and a little bow
    s += `<path d="M-2.4 ${n(depth + 1.1)} q.2 1.6 -.3 3 M0 ${n(depth + 1.4)} v3 M2.4 ${n(depth + 1.1)} q-.2 1.6 .3 3" fill="none" stroke-width=".5" stroke-linecap="round"/>`;
    s += `<path d="M0 ${n(depth + 0.2)} l-1.8 -1.1 v2.2z M0 ${n(depth + 0.2)} l1.8 -1.1 v2.2z" style="fill:#FFFDF6" stroke-width=".55"/><circle cx="0" cy="${n(depth + 0.2)}" r=".6" style="fill:#FFFDF6" stroke-width=".55"/>`;
  }
  if (kind === "shirt" || buttons) s += `<path d="M0 ${n(depth)} V${by}" fill="none" stroke-width=".6"/>`;
  if (neck === "collar") s += `<path d="M${n(-nx - 0.3)} ${ny - 0.3} L-0.2 ${n(depth + 0.2)} L-2.4 ${n(depth + 2.2)} Q${n(-nx + 0.4)} ${n(depth + 1.4)} ${n(-nx - 0.3)} ${ny - 0.3}z M${n(nx + 0.3)} ${ny - 0.3} L0.2 ${n(depth + 0.2)} L2.4 ${n(depth + 2.2)} Q${n(nx - 0.4)} ${n(depth + 1.4)} ${n(nx + 0.3)} ${ny - 0.3}z" ${plain} stroke-width=".9"/>`;
  if (buttons) {
    const c = BUTTONS[buttons] || BUTTONS.shell, top = Math.max(depth + (neck === "collar" ? 3.2 : 1.6), -31), bot = by - (jumper ? 2.6 : 1.4);
    const k = Math.max(2, Math.round((bot - top) / 2.8)); let d = "";
    for (let i = 0; i <= k; i++) d += `<circle cx="0" cy="${n(top + (bot - top)*i/k)}" r=".8" style="fill:${c}" stroke-width=".5"/>`;
    s += d;
  }
  if (pockets && kind !== "dress") s += `<path d="M2.6 -30 h3.6 v2.6 q-1.8 1.1 -3.6 0z" ${F} stroke-width=".7"/><path d="M2.6 -29.1 h3.6" fill="none" stroke-width=".5"/>`;
  return s;
}

// ---- bottoms (and a dress's skirt), all in the hips slot; trouser legs in the leg slots
const SKIRT_TO = {short: -11.2, knee: -7, long: -3};
const DRESS_TO = {short: -12, knee: -7, long: -3};
function skirtArt(len, F, pockets, dress){
  const to = (dress ? DRESS_TO : SKIRT_TO)[len], top = -23.6, half = 8.8 + (to - top)*(dress ? 0.27 : 0.29);
  const w = n(half - 8.8), h = n(to - top);
  let s = `<path d="M-8.8 ${top} h17.6 l${w} ${h} h${n(-2*half)}z" ${F}/>`;
  if (len !== "short" || dress) s += `<path d="M-3.6 ${n(top + 3.4)} q-.6 ${n(h*0.45)} -1.6 ${n(h - 3.6)} M3.6 ${n(top + 3.4)} q.6 ${n(h*0.45)} 1.6 ${n(h - 3.6)}" fill="none" stroke-width=".5" stroke-linecap="round" opacity=".7"/>`;
  if (pockets) s += `<path d="M-8.2 -19.4 h3.4 v2.6 q-1.7 1 -3.4 0z M4.8 -19.4 h3.4 v2.6 q-1.7 1 -3.4 0z" ${F} stroke-width=".7"/>`;
  return s;
}

export function clothesArt({top, bottom, body} = {}){
  const bd = BODY[body] ? body : "woman", b = BODY[bd], T = top || {}, Bt = bottom || {};
  const kind = pick(T.kind, KINDS, bd === "woman" ? "tank" : "tee"), D = DEF[kind];
  const t = {kind, sleeves: pick(T.sleeves, SLEEVES, D.sleeves), neck: pick(T.neck, NECKS, D.neck),
    buttons: T.buttons === undefined ? D.buttons : (BUTTONS[T.buttons] ? T.buttons : null), pockets: !!T.pockets,
    length: pick(T.length, LENGTHS, "knee")};
  const defs = new Map();
  const tf = filler(T.col, pick(T.pat, PATS, "plain"), "--tank", "F2A290", defs);
  const out = {defs: "", legL: "", legR: "", hips: "", armL: "", armR: "", torso: ""};

  const sl = sleeve(kind, t.sleeves, tf.fill);
  out.armL = sl; out.armR = mirror(sl);
  out.torso = torsoArt(t, b, tf.fill, tf.plain);

  if (kind === "dress") {
    out.hips = skirtArt(t.length, tf.fill, t.pockets, true);
  } else {
    const bk = pick(Bt.kind, ["shorts", "trousers", "skirt"], bd === "woman" ? "shorts" : "trousers");
    const bf = filler(Bt.col, pick(Bt.pat, PATS, "plain"), "--denim", "7D97C2", defs).fill;
    const pk = Bt.pockets ? `<path d="M-8.5 -19.8 q2.4 -.3 3 -3.2 M8.5 -19.8 q-2.4 -.3 -3 -3.2" fill="none" stroke-width=".6"/>` : "";
    if (bk === "skirt") out.hips = skirtArt(pick(Bt.length, LENGTHS, "short"), bf, Bt.pockets, false);
    else if (bk === "shorts") out.hips = `<path d="M-8.6 -23 h17.2 l1 9.5 h-8 l-1.6 -3 l-1.6 3 h-8z" ${bf}/>${pk}`;
    else {
      // one piece waist to shoes: the seat's side lines run straight into the legs' outer edges
      out.hips = `<path d="M-8.6 -23 h17.2 l-.1 10.2 h-17z" ${bf} stroke="none"/><path d="M-8.5 -12.6 l-.1 -10.4 h17.2 l-.1 10.4" fill="none"/>${pk}`;
      out.legL = `<rect x="-8.5" y="-16.6" width="8.1" height="15" rx="1.4" ${bf}/>`;
      out.legR = `<rect x="0.4" y="-16.6" width="8.1" height="15" rx="1.4" ${bf}/>`;
    }
  }
  out.defs = [...defs.values()].join("");
  return out;
}
