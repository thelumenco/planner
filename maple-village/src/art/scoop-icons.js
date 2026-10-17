// The dip bar's picture (round 223): a cone or a waffle with its scoop, dipped and topped, drawn from the name
//   dpc_<fmt>_<ice hex>_<dip>_<top>     fmt cone | waffle; ice hex is the flavour's colour without the #; dip a DIPS key; top a TOPPINGS key or "none"
// so the preview at the dip bar changes as you pick, like the wrapping table's, and the dipped ice creams you make keep it.
// Every icon is [fills, ink lines], like the rest of icons.js.
const f = c => `style="fill:${c}"`;
const DIP = {milk: "#8A5A3A", dark: "#4A2E22", white: "#F6EBD2", house: "#3F2519", pink: "#F2A0B8", matcha: "#8FB86A"};
const rnd = (seed, i) => { const x = Math.sin(seed*12.9898 + i*78.233)*43758.5453; return x - Math.floor(x); };
// the topping, scattered over the dipped shell (cx, cy: the top of the scoop; r: its radius)
function topping(k, cx, cy, r){
  const pts = Array.from({length: 9}, (_, i) => { const a = Math.PI*(1.05 + .9*rnd(3, i)), d = r*(.25 + .65*rnd(7, i)); return [cx + Math.cos(a)*d, cy + Math.sin(a)*d*.8 + r*.35]; });
  if (k === "sprinkles") return pts.map(([x, y], i) => `<rect x="${x - .8}" y="${y - .25}" width="1.6" height=".55" rx=".25" transform="rotate(${Math.round(rnd(5, i)*180)} ${x} ${y})" ${f(["#E8566C", "#F3C969", "#7FA0D0", "#9BC26A", "#F4C7CF"][i % 5])}/>`).join("");
  if (k === "coconut") return pts.map(([x, y], i) => `<path d="M${x - .9} ${y}q.9 -.7 1.8 0" style="fill:none;stroke:#FFFDF6;stroke-width:.7;stroke-linecap:round" transform="rotate(${Math.round(rnd(2, i)*90 - 45)} ${x} ${y})"/>`).join("");
  if (k === "nuts") return pts.slice(0, 7).map(([x, y], i) => `<path d="M${x - .7} ${y + .5}l.4 -1.1l1 .2l.2 .9z" ${f(i % 2 ? "#B98A5A" : "#D9B07A")}/>`).join("");
  if (k === "marsh") return pts.slice(0, 6).map(([x, y], i) => `<rect x="${x - .7}" y="${y - .55}" width="1.4" height="1.1" rx=".35" ${f(i % 2 ? "#F4C7CF" : "#FFFDF6")}/>`).join("");
  if (k === "caramel" || k === "gula") { const c = k === "caramel" ? "#D9963A" : "#8A4E26"; return `<path d="M${cx - r*.75} ${cy + r*.2}q${r*.4} ${r*.5} ${r*.75} 0t${r*.75} 0" style="fill:none;stroke:${c};stroke-width:.9;stroke-linecap:round"/><path d="M${cx - r*.5} ${cy - r*.2}q${r*.5} ${r*.45} ${r} 0" style="fill:none;stroke:${c};stroke-width:.8;stroke-linecap:round"/>`; }
  if (k === "strawb") return pts.slice(0, 7).map(([x, y], i) => `<path d="M${x} ${y - .7}l.8 1.2h-1.6z" ${f(i % 3 ? "#E8566C" : "#C2384F")}/>`).join("");
  if (k === "pop") return pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r=".45" ${f(["#9FD3C2", "#F2A0B8", "#F3C969"][i % 3])}/>`).join("");
  return "";
}
export function dipIcon(name){
  const m = name.match(/^dpc_(cone|waffle)_([0-9a-fA-F]{6})_([a-z]+)_([a-z]+)$/); if (!m) return null;
  const [, fmt, hex, dip, top] = m, ice = "#" + hex, dc = DIP[dip] || DIP.milk;
  // the scoop: a ball of the flavour, its top half coated in the dip with drips running down
  const cx = 12, cy = fmt === "cone" ? 7.6 : 8.4, r = 4.6, e = cy - 1;   // e: where the coat's edge runs, a little above the middle
  const scoop = `<circle cx="${cx}" cy="${cy}" r="${r}" ${f(ice)}/>`;
  const hw = Math.sqrt(r*r - 1);
  const coat = `<path d="M${cx - hw} ${e}a${r} ${r} 0 0 1 ${2*hw} 0v.6q-.7 1.6 -1.3 0q-.6 2.3 -1.4 .2q-.8 1.6 -1.5 -.1q-.7 2 -1.5 .1q-.6 1.2 -1.3 -.2z" ${f(dc)}/><path d="M${cx - r*.55} ${cy - r*.55}q${r*.3} -${r*.3} ${r*.75} -${r*.32}" style="fill:none;stroke:#FFFDF6;stroke-width:.6;stroke-linecap:round;opacity:.6"/>`;
  const holder = fmt === "cone"
    ? [`<path d="M7.8 ${cy + 3}h8.4l-4.2 ${21.5 - cy - 3}z" ${f("#E8C48E")}/>`, `<path d="M7.8 ${cy + 3}L12 21.5L16.2 ${cy + 3}M9.4 ${cy + 5}l4.4 3.4M14.6 ${cy + 5}l-4.4 3.4M10.6 ${cy + 8.8}l2.4 1.9"/>`]
    : [`<path d="M4 ${cy + 3}q8 -3 16 0l-2 7q-6 2 -12 0z" ${f("#E8B86A")}/>`, `<path d="M4 ${cy + 3}q8 -3 16 0l-2 7q-6 2 -12 0zM8 ${cy + 2.4}l1 7.6M12 ${cy + 2}v8.4M16 ${cy + 2.4}l-1 7.6M5 ${cy + 6}h14"/>`];
  const rim = fmt === "cone" ? 3 : 2.2, rw = Math.sqrt(r*r - rim*rim);   // the scoop's outline stops where it sinks into the cone or the waffle
  return [holder[0] + scoop + coat + topping(top, cx, cy - r*.45, r), holder[1] + `<path d="M${cx - rw} ${cy + rim}A${r} ${r} 0 1 1 ${cx + rw} ${cy + rim}"/>`];
}
export const dipIco = (fmt, iceCol, dip, top) => { const h = /^#?([0-9a-fA-F]{6})$/.exec(String(iceCol || "")); return `dpc_${fmt === "waffle" ? "waffle" : "cone"}_${h ? h[1] : "F4C7CF"}_${dip}_${top || "none"}`; };
