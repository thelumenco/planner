// Getting about: bike hire racks (game/transport.js) and the river taxi's stops (a little jetty with a striped post),
// plus the bicycle itself, drawn under Mel or a villager.
import { sk, tapeLabel } from "./scenes.js";


// a bicycle (frame colour col), origin at the rider's feet, k = scale; wheels turn while it moves (CSS .bikeWheel)
export const bikeArt = (col = "#5E8A5A", k = 1) => `<g class="bikeArt" style="stroke:var(--line)" stroke-width="${1.1*k}">
  ${[-13, 13].map(x => `<g class="bikeWheel"><circle cx="${x*k}" cy="${-1*k}" r="${7*k}" fill="none" stroke-width="${1.8*k}"/><path d="M${x*k} ${-8*k} V${6*k} M${(x - 7)*k} ${-1*k} H${(x + 7)*k}" stroke-width="${.6*k}" opacity=".6"/></g>`).join("")}
  <path d="M${-13*k} ${-1*k} L${-4*k} ${-14*k} H${9*k} L${13*k} ${-1*k} M${-4*k} ${-14*k} L${1*k} ${-1*k} L${9*k} ${-14*k} M${9*k} ${-14*k} L${11*k} ${-22*k} h${4*k}" fill="none" style="stroke:${col}" stroke-width="${2.2*k}" stroke-linecap="round"/>
  <rect x="${-8*k}" y="${-17*k}" width="${8*k}" height="${3*k}" rx="${1.5*k}" style="fill:#3A2E28"/><path d="M${10*k} ${-22*k} h${6*k}" stroke-width="${1.6*k}"/></g>`;

// a rack of hire bikes: three bikes leaning on a wooden rail, under a little sign
const COLS = ["#5E8A5A", "#E8566C", "#3E6B8C"];
export function bikeRack(id, x, y){
  return `<g data-place="${id}" aria-label="Bike hire"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="34" ry="9" style="fill:var(--butter)"/>
    ${sk(`<rect x="${x - 30}" y="${y - 14}" width="60" height="4" rx="2" style="fill:#C9A27E"/><rect x="${x - 30}" y="${y - 14}" width="4" height="14" style="fill:#8A6A52"/><rect x="${x + 26}" y="${y - 14}" width="4" height="14" style="fill:#8A6A52"/><rect x="${x - 16}" y="${y - 44}" width="32" height="14" rx="2" style="fill:#FFFDF6"/><rect x="${x - 1}" y="${y - 30}" width="2" height="16" style="fill:#8A6A52"/>`,
      `<rect x="${x - 30}" y="${y - 14}" width="60" height="4" rx="2"/><rect x="${x - 16}" y="${y - 44}" width="32" height="14" rx="2"/>`)}
    <text x="${x}" y="${y - 34}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7.6" fill="#5E8A5A" pointer-events="none">BIKES</text>
    <g pointer-events="none" filter="url(#wob)">${[-18, 0, 18].map((dx, i) => `<g transform="translate(${x + dx} ${y}) scale(.62)">${bikeArt(COLS[i])}</g>`).join("")}</g>
    ${tapeLabel(x, y + 18, "Bike hire", "#C3E8DA", 9)}</g>`;
}
// a river taxi stop: a short jetty into the water, a striped mooring post and a flag
export function taxiStop(id, x, y, scene, ly = y + 20){
  return `<g data-place="${id}" aria-label="River taxi stop"><ellipse class="hov" cx="${x}" cy="${y + 4}" rx="28" ry="8" style="fill:var(--butter)"/>
    ${sk(`<rect x="${x - 26}" y="${y - 10}" width="30" height="14" rx="2" style="fill:#C9A27E"/><rect x="${x + 6}" y="${y - 40}" width="5" height="40" style="fill:#FFFDF6"/><path d="M${x + 6} ${y - 34} h5 M${x + 6} ${y - 24} h5 M${x + 6} ${y - 14} h5" style="stroke:#E8566C" stroke-width="3"/><path d="M${x + 11} ${y - 40} l14 5 l-14 5z" style="fill:#3E6B8C"/>`,
      `<rect x="${x - 26}" y="${y - 10}" width="30" height="14" rx="2"/><path d="M${x - 18} ${y - 10} v14 M${x - 8} ${y - 10} v14" opacity=".5"/><rect x="${x + 6}" y="${y - 40}" width="5" height="40"/>`)}
    ${tapeLabel(x, ly, "River taxi", "#DCEBF6", 9)}</g>`;
}
// the taxi itself: a little green launch with a striped canopy (drawn in the ride overlay)
export const taxiBoat = `<svg viewBox="0 0 120 60" width="180" height="90" aria-hidden="true"><g filter="url(#wob)" style="stroke:#3b3530" stroke-width="1.4" stroke-linejoin="round">
  <path d="M8 36 H112 L100 52 H20z" fill="#5E8A5A"/><path d="M8 36 H112" stroke="#FFFDF6" stroke-width="2"/><rect x="34" y="14" width="52" height="5" fill="#E8566C"/><path d="M38 19 v17 M82 19 v17" /><path d="M34 14 h52" stroke="#FFFDF6" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="52" cy="30" r="5" fill="#F2D3BC"/><circle cx="68" cy="30" r="5" fill="#C99A78"/></g></svg>`;

// the stops and racks drawn on screens that already existed (the woods draws its own): core.js appends this
export function transportArt(scene){
  return scene === "base" ? taxiStop("taxihome", 376, 120, scene, 158) : scene === "field" ? taxiStop("taxilake", 300, 348, scene)
    : scene === "shore" ? taxiStop("taxishore", 214, 142, scene) : scene === "lane" ? taxiStop("taxilane", 56, 212, scene)
    : scene === "village" ? bikeRack("bikesvillage", 196, 566) : "";
}
// the riverbank going by during the ride: a row of trees and reeds (scrolls past, CSS .taxibank)
export const taxiBank = `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.2">${[20, 90, 150, 230, 300, 360, 440, 510, 570].map((x, i) => i % 3 === 1
  ? `<path d="M${x} 86 l18 -50 l18 50z" fill="#5E8A5A"/>` : `<rect x="${x + 14}" y="62" width="6" height="24" fill="#7A5638"/><circle cx="${x + 17}" cy="50" r="${18 + (i % 2)*5}" fill="${i % 2 ? "#9CC27E" : "#E8913A"}"/>`).join("")}</g></svg>`;
