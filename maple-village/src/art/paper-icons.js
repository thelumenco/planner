// The paperie's icons (round 183): the batch's own picture at every step, so the look changes as Mel adds each thing.
//   ppscraps                 a tied bundle of scraps (a wine label, a chocolate wrapper, a receipt)
//   ppsoak                   the tub, torn bits floating
//   ppulp_<col>_<add>        a basin of pulp in its colour, the add-in flecked through
//   ppwet_<col>_<add>        a wet sheet on its felt, glossy and darker
//   pppress_<col>_<add>      a pressed stack, flat and damp
//   pp_<col>_<add>           a dry sheet with torn deckle edges and its flecks
// Every icon is [fills, ink lines], like the rest of icons.js.
const f = c => `style="fill:${c}"`;
export const COL = {natural: "#EFE6D2", blush: "#F2C4C4", sage: "#C6D6B2", ink: "#9DB4D0"};
export const WET = {natural: "#D9CDB2", blush: "#DDA6A8", sage: "#A9BE94", ink: "#7E98B8"};
const rnd = (seed, i) => { const x = Math.sin(seed*12.9898 + i*78.233)*43758.5453; return x - Math.floor(x); };
const seedOf = s => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

// the flecks for an add-in, scattered inside a box
function flecks(add, x0, y0, w, h, n = 7){
  if (!add || add === "none") return "";
  const s = seedOf(add), pts = Array.from({length: n}, (_, i) => [x0 + rnd(s, i)*w, y0 + rnd(s, i + 50)*h, rnd(s, i + 99)*180]);
  if (add === "lavender") return pts.map(([x, y, r]) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="1.1" ry=".55" transform="rotate(${r.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" ${f("#8E6CC0")}/>`).join("");
  if (add === "rose") return pts.slice(0, 5).map(([x, y, r]) => `<path d="M${x.toFixed(1)} ${y.toFixed(1)}q1.2 -1.4 2 0q-1 1.2 -2 0z" transform="rotate(${r.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" ${f("#E36A86")}/>`).join("");
  if (add === "petals") return pts.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".75" ${f(["#F3C969", "#E36A86", "#7FA8D8", "#F39A4A"][i % 4])}/>`).join("");
  if (add === "tea") return [...pts, ...pts.map(([x, y, r]) => [x + 1.6, y - 1.1, r])].map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".45" ${f("#6E4A2E")}/>`).join("");
  if (add === "gold") return pts.map(([x, y], i) => `<path d="M${x.toFixed(1)} ${(y - .9).toFixed(1)}l.5 .9l-.5 .9l-.5 -.9z" ${f(i % 2 ? "#E0A83A" : "#F6D27A")}/>`).join("");
  if (add === "seeds") return pts.map(([x, y, r]) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx=".8" ry=".45" transform="rotate(${r.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" ${f("#5A4632")}/>`).join("") + `<path d="M${(x0 + w*.7).toFixed(1)} ${(y0 + h*.75).toFixed(1)}v-1.6" style="stroke:#6FA05A;stroke-width:.5"/><ellipse cx="${(x0 + w*.7 + .7).toFixed(1)}" cy="${(y0 + h*.75 - 1.8).toFixed(1)}" rx=".8" ry=".4" ${f("#8CC06A")}/>`;
  return "";
}
// a torn deckle edge round a rectangle: little wobbles all the way round
function deckle(x0, y0, x1, y1, seed){
  const pts = [], step = 1.6;
  for (let x = x0; x < x1; x += step) pts.push([x, y0 + (rnd(seed, x)*.9 - .3)]);
  for (let y = y0; y < y1; y += step) pts.push([x1 + (rnd(seed, y + 40)*.9 - .3), y]);
  for (let x = x1; x > x0; x -= step) pts.push([x, y1 + (rnd(seed, x + 80)*.9 - .3)]);
  for (let y = y1; y > y0; y -= step) pts.push([x0 + (rnd(seed, y + 120)*.9 - .3), y]);
  return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "z";
}

export function paperIcon(name){
  if (name === "ppscraps") return [`<path d="M4 9l15 -2l1 9l-15 2z" ${f("#D9B98C")}/><rect x="6" y="6" width="8" height="6" rx=".5" transform="rotate(-8 10 9)" ${f("#FFFDF6")}/><path d="M12 5l7 1l-1 6l-7 -1z" ${f("#7A1F3D")}/><rect x="13.5" y="7" width="3.5" height="2.4" ${f("#F3C969")}/><path d="M5 13l9 -1l.5 4l-9 1z" ${f("#C2505F")}/>`,
    `<path d="M4 9l15 -2l1 9l-15 2zM12 5l7 1l-1 6l-7 -1z"/><path d="M11.6 7.6l1.3 9.6M3.8 12.6l16.6 -2.2" style="stroke:#8A6A3A"/><path d="M7 8.6h4M7 10.2h3" opacity=".6"/>`];
  if (name === "ppsoak") return [`<path d="M3 11h18l-2 9H5z" ${f("#B9AE9A")}/><ellipse cx="12" cy="11" rx="9" ry="2.2" ${f("#A8CCD8")}/>${[[8, 10.6, "#FFFDF6"], [12, 11.4, "#D9B98C"], [15.5, 10.5, "#7A1F3D"], [10, 11.8, "#C2505F"]].map(([x, y, c]) => `<path d="M${x} ${y}l1.6 -.5l.6 1l-1.6 .4z" ${f(c)}/>`).join("")}`,
    `<path d="M3 11h18l-2 9H5z"/><ellipse cx="12" cy="11" rx="9" ry="2.2"/><path class="smoke" d="M9 7q1 -1.5 0 -3M14 7q1 -1.5 0 -3" opacity=".5"/>`];
  const m = name.match(/^(pp|ppulp|ppwet|pppress)_([a-z]+)_([a-z]+)$/); if (!m || !COL[m[2]]) return null;
  const [, kind, col, add] = m, s = seedOf(name);
  if (kind === "ppulp") return [`<path d="M3 10h18l-2 10H5z" ${f("#C9A27E")}/><ellipse cx="12" cy="10.4" rx="8.4" ry="2.4" ${f(COL[col])}/>${flecks(add, 5.5, 9.2, 13, 2.4, 6)}<path d="M8 10.4q2 -1 4 0t4 0" style="fill:none;stroke:${WET[col]};stroke-width:.6"/>`,
    `<path d="M3 10h18l-2 10H5z"/><ellipse cx="12" cy="10.4" rx="9" ry="2.6"/><path d="M6 14h12" opacity=".4"/>`];
  if (kind === "ppwet") return [`<rect x="3" y="15" width="18" height="5" rx="1" ${f("#E8E2D6")}/><rect x="5" y="5" width="14" height="11" rx=".6" ${f(WET[col])}/>${flecks(add, 6, 6, 12, 9)}<path d="M7 7l3 0M7.5 8.5l1.5 0" style="stroke:#FFFFFF;stroke-width:.7;opacity:.8"/>`,
    `<rect x="3" y="15" width="18" height="5" rx="1"/><rect x="5" y="5" width="14" height="11" rx=".6"/><path d="M14 18.5q1 1 2 0" opacity=".5"/>`];
  if (kind === "pppress") return [`<rect x="4" y="13" width="16" height="2" ${f(WET[col])}/><rect x="4" y="11" width="16" height="2" ${f(COL[col])}/><rect x="4" y="15" width="16" height="2" ${f(COL[col])}/><rect x="4" y="17" width="16" height="2" ${f(WET[col])}/><rect x="3" y="7" width="18" height="3" rx=".5" ${f("#8A6A42")}/>${flecks(add, 5, 11.2, 14, 1.4, 4)}`,
    `<rect x="4" y="11" width="16" height="8"/><path d="M4 13h16M4 15h16M4 17h16"/><rect x="3" y="7" width="18" height="3" rx=".5"/><path d="M12 7V3M9 3h6"/>`];
  return [`<path d="${deckle(4, 4.5, 20, 19.5, s)}" ${f(COL[col])}/>${flecks(add, 6, 6.5, 12, 11)}`, `<path d="${deckle(4, 4.5, 20, 19.5, s)}"/>`];
}

/* ---------- round 185: wrapping ---------- */
// ribbons (a spool), tags, stamps, and a wrapped parcel that builds up layer by layer as Mel picks each thing:
//   wrp_<col>_<add>_<stamp>_<ribbon>_<tag>   ("none" for anything not chosen yet)
export const RIBBON_COL = {gingham: "#C8432F", velvet: "#7A1F3D", twine: "#C9A27E"};
const STAMP_INK = {natural: "#8A6A42", blush: "#B24A5E", sage: "#4E6A3E", ink: "#2F3B73"};
// a tiny stamp motif at (x, y)
function motif(k, x, y, c){
  if (k === "bee") return `<ellipse cx="${x}" cy="${y}" rx="1.3" ry=".9" fill="${c}"/><ellipse cx="${x - .4}" cy="${y - 1}" rx=".7" ry=".5" fill="none" stroke="${c}" stroke-width=".35"/><ellipse cx="${x + .6}" cy="${y - 1}" rx=".7" ry=".5" fill="none" stroke="${c}" stroke-width=".35"/>`;
  if (k === "grape") return [[0, 0], [1, 0], [.5, .9], [-.5, .9], [0, 1.8]].map(([dx, dy]) => `<circle cx="${x + dx - .5}" cy="${y + dy - 1}" r=".55" fill="${c}"/>`).join("");
  if (k === "olive") return `<path d="M${x - 1.6} ${y + 1.2} L${x + 1.6} ${y - 1.2}" stroke="${c}" stroke-width=".35"/><ellipse cx="${x - .5}" cy="${y - .7}" rx=".9" ry=".4" transform="rotate(-35 ${x - .5} ${y - .7})" fill="${c}"/><ellipse cx="${x + .5}" cy="${y + .5}" rx=".9" ry=".4" transform="rotate(-35 ${x + .5} ${y + .5})" fill="${c}"/>`;
  if (k === "star") return `<path d="M${x} ${y - 1.4}l.4 1h1l-.8 .6l.3 1l-.9 -.6l-.9 .6l.3 -1l-.8 -.6h1z" fill="${c}"/>`;
  if (k === "heart") return `<path d="M${x} ${y + 1.1}l-1.2 -1.2a.7 .7 0 0 1 1.2 -.8a.7 .7 0 0 1 1.2 .8z" fill="${c}"/>`;
  return "";
}
export function wrapIcon(name){
  if (/^rb_/.test(name)) { const c = RIBBON_COL[name.slice(3)] || "#C8432F", gingham = name === "rb_gingham";
    return [`<rect x="6" y="5" width="12" height="14" rx="2" ${f("#E8DCC8")}/><rect x="8" y="7" width="8" height="10" ${f(c)}/>${gingham ? [0, 1, 2].map(i => `<rect x="${8 + (i % 2)*4}" y="${7 + i*3.4}" width="4" height="3.4" fill="#FFFDF6" opacity=".8"/>`).join("") : ""}<path d="M16 12q4 2 2 8" style="fill:none;stroke:${c};stroke-width:1.6"/>`,
      `<rect x="6" y="5" width="12" height="14" rx="2"/><path d="M6 7h12M6 17h12"/>`]; }
  if (name === "tag_plain" || name === "tag_seeded") return [`<path d="M7 9l5 -5h7v15h-12z" ${f(name === "tag_seeded" ? "#C6D6B2" : "#EFE6D2")}/>${name === "tag_seeded" ? [[11, 11], [14, 14], [12, 16], [16, 10]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx=".8" ry=".45" ${f("#5A4632")}/>`).join("") : ""}`,
    `<path d="M7 9l5 -5h7v15h-12z"/><circle cx="12" cy="7.5" r="1"/><path d="M12 6.5q-4 -4 -8 -2"/>`];
  if (/^stamp_/.test(name)) { const k = name.slice(6); return [`<rect x="7" y="12" width="10" height="7" rx="1" ${f("#C9A27E")}/><rect x="9" y="4" width="6" height="8" rx="2" ${f("#8A6A42")}/><g transform="translate(12 15.5) scale(1.6) translate(-12 -15.5)">${motif(k, 12, 15.5, "#3A2E28")}</g>`, `<rect x="7" y="12" width="10" height="7" rx="1"/><rect x="9" y="4" width="6" height="8" rx="2"/>`]; }
  const m = name.match(/^wrp_([a-z]+)_([a-z]+)_([a-z]+)_([a-z]+)_([a-z]+)$/); if (!m || !COL[m[1]]) return null;
  const [, col, add, stamp, ribbon, tag] = m, rc = RIBBON_COL[ribbon];
  let a = `<rect x="3.5" y="8" width="15" height="12" rx="1" ${f(COL[col])}/><path d="M3.5 8l2 -2h15l-2 2z" ${f(WET[col])}/><path d="M18.5 8l2 -2v12l-2 2z" ${f(WET[col])}/>${flecks(add, 5, 9.5, 12, 9, 6)}`;
  if (stamp !== "none") a += [[6.5, 11], [12, 10.5], [15.5, 14.5], [7, 17], [11.5, 16]].map(([x, y]) => motif(stamp, x, y, STAMP_INK[col])).join("");
  if (rc) a += `<rect x="10" y="8" width="2.4" height="12" ${f(rc)}/><rect x="3.5" y="12.8" width="15" height="2.2" ${f(rc)}/><path d="M12 6l3 -2l2.2 0l1 .5l-1.2 1.3z" ${f(rc)}/>${ribbon === "gingham" ? `<rect x="10" y="9.5" width="1.2" height="1.2" fill="#FFFDF6"/><rect x="11.2" y="11" width="1.2" height="1.2" fill="#FFFDF6"/><rect x="5" y="12.8" width="1.2" height="1.1" fill="#FFFDF6"/><rect x="15" y="13.9" width="1.2" height="1.1" fill="#FFFDF6"/>` : ""}`
    + `<path d="M11.2 7.5q-3 -4 -5 -1.5q1.6 2.4 5 1.5zM11.2 7.5q3 -4 5 -1.5q-1.6 2.4 -5 1.5z" ${f(rc)}/><circle cx="11.2" cy="7.5" r="1" ${f(rc)}/>`;
  if (tag !== "none") a += `<path d="M18.5 15l2 -1.6h2.4v4.4h-2.4z" ${f(tag === "seeded" ? "#C6D6B2" : "#FFFDF6")}/>${tag === "seeded" ? `<circle cx="21.6" cy="15.4" r=".4" fill="#5A4632"/><circle cx="21" cy="16.6" r=".4" fill="#5A4632"/>` : ""}`;
  const l = `<rect x="3.5" y="8" width="15" height="12" rx="1"/><path d="M3.5 8l2 -2h15l-2 2M18.5 8l2 -2v12l-2 2"/>${rc ? `<path d="M11.2 7.5q-3 -4 -5 -1.5q1.6 2.4 5 1.5zM11.2 7.5q3 -4 5 -1.5q-1.6 2.4 -5 1.5z"/>` : ""}${tag !== "none" ? `<path d="M18.5 15l2 -1.6h2.4v4.4h-2.4z"/><circle cx="20.9" cy="15.5" r=".45"/>` : ""}`;
  return [a, l];
}
