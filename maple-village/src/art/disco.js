// Saturday disco night in the cellar door (round 140): the glitter ball comes down from the ceiling and spins, beams of
// coloured light sweep the room, and pools of colour pulse on the floor. Over the room's own art, under the dancers.
const BEAMS = [["#F29AB0", 150, 380], ["#7FD3E8", 400, 360], ["#F3D34A", 230, 470], ["#B9A8E8", 330, 480], ["#9CE0A8", 470, 450], ["#F6A65A", 110, 460]];
export function discoArt(){
  const bx = 360, by = 150;
  const facets = Array.from({length: 7}, (_, r) => Array.from({length: 7}, (_, c) => { const x = bx - 21 + c*6, y = by - 21 + r*6; return Math.hypot(x + 3 - bx, y + 3 - by) < 22 ? `<rect x="${x}" y="${y}" width="5.4" height="5.4" style="fill:${(r + c) % 3 ? "#D9DDE6" : "#FFFFFF"}"/>` : ""; }).join("")).join("");
  return `<g class="disco" pointer-events="none">
    <rect width="520" height="640" style="fill:#2A2240" opacity=".32"/>
    ${BEAMS.map(([col, x, y], i) => `<path class="dbeam" style="fill:${col};animation-delay:-${(i*.37).toFixed(2)}s" d="M${bx} ${by} L${x - 34} ${y} L${x + 34} ${y}z" opacity=".22"/>`).join("")}
    ${BEAMS.map(([col, x, y], i) => `<ellipse class="dspot" style="fill:${col};animation-delay:-${(i*.53).toFixed(2)}s" cx="${x}" cy="${y}" rx="40" ry="12" opacity=".45"/>`).join("")}
    <path d="M${bx} 0 V${by - 22}" style="stroke:#3A3430" stroke-width="1.2"/>
    <g class="dball"><circle cx="${bx}" cy="${by}" r="22" style="fill:#BFC6D3;stroke:var(--line)" stroke-width="1.2"/><g class="dfacets">${facets}</g><circle cx="${bx - 8}" cy="${by - 8}" r="5" style="fill:#FFFFFF" opacity=".9"/></g>
    ${[[bx - 40, by + 10], [bx + 36, by - 6], [bx + 10, by + 34], [bx - 26, by - 30]].map(([x, y], i) => `<path class="dglint" style="animation-delay:-${i*.4}s" d="M${x} ${y - 6} l1.6 4.4 l4.4 1.6 l-4.4 1.6 l-1.6 4.4 l-1.6 -4.4 l-4.4 -1.6 l4.4 -1.6z" fill="#FFF6C8"/>`).join("")}
  </g>`;
}
