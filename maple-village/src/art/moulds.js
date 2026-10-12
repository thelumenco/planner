// Bonbon moulds (round 176, Mel: "can I cut shapes for the bonbons"): the outline of a bonbon in each mould, centred
// on (x, y), about r across from the middle. Used by the bonbon panels (game/cocoa.js) and the display case (scenes.js).
const f = n => +n.toFixed(2);
export function mouldPath(shape, x, y, r){
  if (shape === "heart") return `M${f(x)} ${f(y + r)} Q${f(x - r*1.35)} ${f(y - r*.1)} ${f(x - r*.6)} ${f(y - r*.8)} Q${f(x - r*.15)} ${f(y - r*1.05)} ${f(x)} ${f(y - r*.4)} Q${f(x + r*.15)} ${f(y - r*1.05)} ${f(x + r*.6)} ${f(y - r*.8)} Q${f(x + r*1.35)} ${f(y - r*.1)} ${f(x)} ${f(y + r)}Z`;
  if (shape === "square") { const k = r*.85, c = r*.3; return `M${f(x - k + c)} ${f(y - k)} H${f(x + k - c)} Q${f(x + k)} ${f(y - k)} ${f(x + k)} ${f(y - k + c)} V${f(y + k - c)} Q${f(x + k)} ${f(y + k)} ${f(x + k - c)} ${f(y + k)} H${f(x - k + c)} Q${f(x - k)} ${f(y + k)} ${f(x - k)} ${f(y + k - c)} V${f(y - k + c)} Q${f(x - k)} ${f(y - k)} ${f(x - k + c)} ${f(y - k)}Z`; }
  if (shape === "shell") return `M${f(x)} ${f(y + r)} L${f(x - r)} ${f(y - r*.15)} Q${f(x - r*.9)} ${f(y - r*1.1)} ${f(x)} ${f(y - r)} Q${f(x + r*.9)} ${f(y - r*1.1)} ${f(x + r)} ${f(y - r*.15)}Z`;
  if (shape === "star") { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*.45 : r*1.05; d += `${i ? "L" : "M"}${f(x + rr*Math.cos(a))} ${f(y + rr*Math.sin(a))} `; } return d + "Z"; }
  return `M${f(x - r)} ${f(y + r*.65)} Q${f(x - r)} ${f(y - r)} ${f(x)} ${f(y - r)} Q${f(x + r)} ${f(y - r)} ${f(x + r)} ${f(y + r*.65)}Z`;   // dome
}
// the ribs on a seashell
export const shellRibs = (x, y, r) => [-.55, 0, .55].map(t => `M${f(x)} ${f(y + r*.9)} L${f(x + t*r)} ${f(y - r*.8)}`).join(" ");
