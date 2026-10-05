// Pictures for the vineyard's panels: a close-up of a vine (it changes as it grows), a barrel showing its
// fermentation stage, wine bottles by style, and little icons for the stall. Hand-drawn like the rest of the village:
// ink outlines, the shared #wob wobble filter, panel colours (panels are always light).
const INK = `stroke="#3b3530" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
const ripeCol = kind => kind === "red" ? "#6B2A55" : "#C9D66A";

// a five-pointed vine leaf centred on (x, y), size s, turned by `rot` degrees
const leaf = (x, y, s, rot, fill) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 7 C-2 4 -9 7 -11 1 C-12 -3 -8 -5 -6 -4 C-9 -8 -5 -12 -2 -9 C-1 -13 1 -13 2 -9 C5 -12 9 -8 6 -4 C8 -5 12 -3 11 1 C9 7 2 4 0 7Z" fill="${fill}" ${INK} stroke-width="${(1.3/s).toFixed(2)}"/><path d="M0 6 V-8 M0 0 L-7 -4 M0 0 L7 -4" fill="none" stroke="#3b3530" stroke-width="${(.8/s).toFixed(2)}" opacity=".55"/></g>`;
// a bunch of grapes hanging from (x, y): rows of 4, 3, 3, 2, 1 berries; `n` caps how many show (they swell as it ripens)
function bunch(x, y, col, r, n = 13){
  const rows = [4, 3, 3, 2, 1]; let out = "", k = 0;
  rows.forEach((c, ri) => { for (let i = 0; i < c && k < n; i++, k++) { const cx = x + (i - (c - 1)/2)*r*1.75, cy = y + 6 + ri*r*1.55;
    out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${col}" stroke="#3b3530" stroke-width="1"/><circle cx="${(cx - r*.35).toFixed(1)}" cy="${(cy - r*.35).toFixed(1)}" r="${(r*.28).toFixed(1)}" fill="#FFFDF6" opacity=".55"/>`; } });
  return `<path d="M${x} ${y - 6} q2 4 0 8" fill="none" stroke="#5E7A4E" stroke-width="1.6"/>${out}`;
}
// The close-up on a vine card. vn: {v: "red"|"white", wateredAt} or null; g: growth 0..1; trellis: does the row have one
export function vineCloseup(vn, g, trellis){
  const thirsty = vn && !vn.wateredAt, soil = !vn ? "#B08A6A" : thirsty ? "#CDAE8A" : "#8A6A4E";
  let h = `<rect x="2" y="2" width="166" height="136" rx="14" fill="#EEF4E6"/><circle cx="138" cy="30" r="13" fill="#F6E3A1" opacity=".9"/>
    <path d="M2 116 Q60 108 168 116 V124 a14 14 0 0 1 -14 14 H16 a14 14 0 0 1 -14 -14z" fill="${soil}"/>`;
  if (!trellis) return svg(h + `<g filter="url(#wob)"><path d="M40 118 v-26 M130 118 v-26" stroke="#8B5E3C" stroke-width="4" stroke-linecap="round"/><path d="M40 98 H130" fill="none" stroke="#3b3530" stroke-dasharray="5 6" opacity=".55"/></g>
    <text x="85" y="78" text-anchor="middle" font-family="Klee One,serif" font-size="12" fill="#8A8279">needs a trellis</text>`);
  h += `<g filter="url(#wob)"><path d="M18 118 V30 M152 118 V30" stroke="#8B5E3C" stroke-width="5" stroke-linecap="round"/><path d="M18 42 H152 M18 66 H152" fill="none" stroke="#6B5E52" stroke-width="1.2"/></g>`;
  if (!vn) return svg(h + `<ellipse cx="85" cy="116" rx="22" ry="6" fill="#9C7A5C" ${INK}/><path d="M85 112 v-14" stroke="#5E7A4E" stroke-width="1.6" stroke-dasharray="3 3"/>
    <text x="85" y="88" text-anchor="middle" font-family="Klee One,serif" font-size="12" fill="#8A8279">ready for a vine</text>`);
  const lf = thirsty ? "#B7C58E" : "#86B26A", lf2 = thirsty ? "#C8D3A0" : "#9CC27E", droop = thirsty ? 18 : 0;
  // trunk up to the wires, arms out along them
  h += `<g filter="url(#wob)"><path d="M85 118 C82 100 90 88 85 70 C83 60 86 50 85 44" fill="none" stroke="#7A5638" stroke-width="7" stroke-linecap="round"/>
    <path d="M85 46 C70 44 52 40 34 43 M85 46 C100 42 118 40 136 44 M85 68 C72 66 60 64 50 66" fill="none" stroke="#7A5638" stroke-width="3.2" stroke-linecap="round"/></g>`;
  const leaves = [[44, 38, 1.15, -20], [70, 34, 1.3, 8], [102, 34, 1.25, -6], [128, 40, 1.1, 22], [56, 62, 1, -30], [116, 60, 1, 28], [36, 58, .9, -40], [138, 62, .9, 40]];
  const nL = vn.wateredAt ? 5 + Math.round(g*3) : 4;
  h += leaves.slice(0, nL).map(([x, y, s, r], i) => leaf(x, y + droop*(i % 2 ? .4 : .2), s, r + (thirsty ? (i % 2 ? 18 : -18) : 0), i % 2 ? lf2 : lf)).join("");
  if (vn.wateredAt) {
    const ripe = g >= 1, col = ripe ? ripeCol(vn.v) : g > .6 ? (vn.v === "red" ? "#9A6A86" : "#B9CF7A") : "#A9C98A", r = 3.4 + Math.min(1, g)*1.4, n = 6 + Math.round(Math.min(1, g)*7);
    if (g > .15) h += bunch(66, 74, col, r, n) + bunch(106, 76, col, r, n);
    else h += `<circle cx="66" cy="78" r="2.6" fill="#E9F0C8" ${INK}/><circle cx="70" cy="81" r="2.6" fill="#E9F0C8" ${INK}/><circle cx="106" cy="80" r="2.6" fill="#E9F0C8" ${INK}/>`;   // tiny flowers first
    if (ripe) h += `<g class="twinkle"><path d="M140 84 l2.5 -6 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5z" fill="#FFE38A" ${INK} stroke-width="1"/></g>`;
  } else h += `<g><path d="M140 70 q-7 10 0 14 q7 -4 0 -14z" fill="#9CC3E0" ${INK}/><path d="M128 92 q-5 7 0 10 q5 -3 0 -10z" fill="#BFD6E6" ${INK}/></g>`;
  return svg(h);
}
const svg = (inner, w = 170, hgt = 140, cls = "vypic") => `<svg class="${cls}" viewBox="0 0 ${w} ${hgt}" width="${w}" height="${hgt}" aria-hidden="true">${inner}</svg>`;

// A barrel with what's happening inside it. b: null (empty) or {style, stage}; st: its STYLES entry; phase:
// "empty" | "ferment" | "bubbles" (sparkling's second fermentation) | "await2" (waiting for the second) | "ready"
export function barrelPic(phase, col, label){
  let h = `<rect x="2" y="2" width="136" height="116" rx="14" fill="#F3EADF"/><path d="M2 100 H138 V104 a14 14 0 0 1 -14 14 H16 a14 14 0 0 1 -14 -14z" fill="#E2D2BC"/>`;
  // cradle and barrel lying on its side, front end towards us
  h += `<g filter="url(#wob)"><path d="M26 102 l10 -14 M114 102 l-10 -14 M22 102 H118" stroke="#6B4A33" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M22 60 C22 34 38 24 70 24 C102 24 118 34 118 60 C118 86 102 96 70 96 C38 96 22 86 22 60Z" fill="#B07B52" ${INK}/>
    <path d="M38 27 C32 45 32 75 38 93 M102 27 C108 45 108 75 102 93" fill="none" stroke="#4A3A30" stroke-width="3.2"/>
    <path d="M55 25 C53 45 53 75 55 95 M70 24 V96 M85 25 C87 45 87 75 85 95" fill="none" stroke="#8A5A3A" stroke-width="1" opacity=".7"/></g>`;
  // a chalk plaque with the wine's name
  if (label) h += `<rect x="50" y="48" width="40" height="22" rx="3" fill="#3E4A43" ${INK}/><text x="70" y="63" text-anchor="middle" font-family="Klee One,serif" font-size="10" fill="#F6EFE3">${label}</text>`;
  if (phase === "empty") h += `<ellipse cx="70" cy="22" rx="16" ry="5" fill="#C9A27E" ${INK} transform="rotate(-18 70 22)"/><text x="70" y="64" text-anchor="middle" font-family="Klee One,serif" font-size="11" fill="#FFF3DD">empty</text>`;
  else {
    // a drop of the wine's colour on the plaque, and the bung on top
    h += `<circle cx="70" cy="80" r="5" fill="${col}" ${INK} stroke-width="1"/><rect x="65" y="16" width="10" height="9" rx="2" fill="#8B5E3C" ${INK}/>`;
    if (phase === "ferment" || phase === "bubbles") {
      // an airlock with bubbles popping up: it's busy in there
      h += `<path d="M70 16 V6 h6 v6" fill="none" ${INK}/><g class="vybub"><circle cx="76" cy="2" r="2.2" fill="#FFFDF6" ${INK} stroke-width=".9"/><circle cx="82" cy="-4" r="1.6" fill="#FFFDF6" ${INK} stroke-width=".9"/><circle cx="74" cy="-9" r="1.2" fill="#FFFDF6" ${INK} stroke-width=".9"/></g>`;
      if (phase === "bubbles") h += `<g transform="translate(112 38)">${bottleArt("sparkling", 30, -24)}</g>`;   // bottles resting in the rack for their bubbles
    } else if (phase === "await2") h += `<path d="M118 40 l6 -6 M120 48 h8 M118 56 l6 6" stroke="#C9A227" stroke-width="2" stroke-linecap="round"/>`;
    else if (phase === "ready") h += `<g class="twinkle"><path d="M116 26 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3z" fill="#FFE38A" ${INK} stroke-width="1"/></g>`;
  }
  return svg(h, 140, 120, "vypic barrelpic");
}
// The steps a barrel goes through, with the current one marked
export function stageStrip(style, phase){
  const steps = style === "sparkling" ? [["ferment", "Fermenting"], ["await2", "Ready for bubbles"], ["bubbles", "Bubbles"], ["ready", "Ready to bottle"]] : [["ferment", "Fermenting"], ["ready", "Ready to bottle"]];
  const at = steps.findIndex(s => s[0] === phase);
  return `<ol class="vystages">${steps.map(([k, n], i) => `<li class="${i < at ? "past" : i === at ? "now" : ""}">${n}</li>`).join("")}</ol>`;
}

// A wine bottle by style, `h` pixels tall. Optional (x, y) offset places it inside another drawing (with a tilt).
export function bottleArt(type, h, tilt){
  const glass = type === "red" ? "#2F4A33" : type === "sparkling" ? "#4E6B44" : type === "rose" ? "#F4D6DC" : "#C9DCA8";
  const wine = {red: "#7A1F3D", rose: "#E98AA0", white: "#E8D57A", sparkling: "#F3E7B0"}[type] || "#7A1F3D";
  const body = type === "white" ? "M12 2 h6 v18 q6 8 6 18 v34 a3 3 0 0 1 -3 3 h-12 a3 3 0 0 1 -3 -3 v-34 q0 -10 6 -18z"   // a tall, slim flute
    : "M12 2 h6 v14 q8 4 8 12 v44 a3 3 0 0 1 -3 3 h-16 a3 3 0 0 1 -3 -3 v-44 q0 -8 8 -12z";                                 // shouldered bottle
  const clear = type === "rose" || type === "white";
  const inner = `<path d="${body}" fill="${glass}" ${INK}/>${clear ? `<path d="M7 40 h16 v31 a2 2 0 0 1 -2 2 h-12 a2 2 0 0 1 -2 -2z" fill="${wine}" opacity=".9"/>` : ""}
    <rect x="7" y="44" width="16" height="18" rx="1.5" fill="#FFFDF6" ${INK} stroke-width="1"/><rect x="9" y="49" width="12" height="4" fill="${wine}"/><path d="M10 57 h10" stroke="#8A8279" stroke-width="1"/>
    ${type === "sparkling" ? `<path d="M11 1 h8 v13 h-8z" fill="#C9A227" ${INK} stroke-width="1"/><path d="M11 9 h8" stroke="#8B6B12" stroke-width="1"/>` : `<rect x="12" y="1" width="6" height="5" rx="1" fill="${type === "red" ? "#8E2C48" : "#C9A227"}" ${INK} stroke-width="1"/>`}
    <path d="M9 24 q-1 10 0 18" fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>`;
  if (tilt != null) return `<g transform="scale(${(h/76).toFixed(3)}) rotate(${tilt} 15 40)">${inner}</g>`;
  return `<svg class="vybottle" viewBox="0 0 30 76" width="${Math.round(h*30/76)}" height="${h}" aria-hidden="true">${inner}</svg>`;
}
// a glass of wine, for the tasting room
export const glassArt = (type, h = 34) => { const wine = {red: "#7A1F3D", rose: "#E98AA0", white: "#E8D57A", sparkling: "#F3E7B0"}[type] || "#7A1F3D";
  return `<svg class="vybottle" viewBox="0 0 24 40" width="${Math.round(h*.6)}" height="${h}" aria-hidden="true"><path d="M5 4 h14 q1 14 -7 17 q-8 -3 -7 -17z" fill="#F4F8FA" ${INK}/><path d="M5.6 10 h12.8 q-.6 10 -6.4 11 q-5.8 -1 -6.4 -11z" fill="${wine}"/>${type === "sparkling" ? `<circle cx="10" cy="15" r=".9" fill="#FFFDF6"/><circle cx="13" cy="13" r=".7" fill="#FFFDF6"/>` : ""}<path d="M12 21 v13 M6 36 h12" fill="none" ${INK}/></svg>`; };

// stall icons
export function stallIcon(id, off){
  const w = (inner) => `<svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><g${off ? ' opacity=".4"' : ""}>${inner}</g></svg>`;
  if (id === "cut_red" || id === "cut_white") { const c = id === "cut_red" ? "#6B2A55" : "#C9D66A";
    return w(`<path d="M24 46 V22" stroke="#7A5638" stroke-width="3" stroke-linecap="round"/>${leaf(16, 16, .9, -25, "#86B26A")}${leaf(32, 14, .8, 25, "#9CC27E")}${bunch(24, 24, c, 2.8, 9)}`); }
  if (id === "trellis") return w(`<path d="M8 44 V8 M40 44 V8" stroke="#8B5E3C" stroke-width="3.4" stroke-linecap="round"/><path d="M8 16 H40 M8 28 H40" fill="none" stroke="#3b3530" stroke-width="1.2"/>${leaf(20, 20, .7, -15, "#86B26A")}${leaf(30, 30, .6, 20, "#9CC27E")}`);
  return w(`<path d="M8 24 C8 12 14 8 24 8 C34 8 40 12 40 24 C40 36 34 40 24 40 C14 40 8 36 8 24Z" fill="#B07B52" ${INK}/><path d="M14 9 C11 18 11 30 14 39 M34 9 C37 18 37 30 34 39" fill="none" stroke="#4A3A30" stroke-width="2.2"/><path d="M24 8 V40" stroke="#8A5A3A" stroke-width="1" opacity=".7"/>`);
}
