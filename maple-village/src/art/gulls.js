// Seagulls (round 287 at Lighthouse Point; round 290, Mel: "can we then have gulls all along the foreshore and beach").
// perched(x, y, flip, headDelay, fly): a herring gull standing, tilting its head now and then (.gullperch); with
// fly = [seconds, delay] it also flaps off over the sea and glides back (.gulloff). flying(x, y, delay): one gliding.
// round 289 (Mel: "Will gulls occasionally flap and fly off"): with fly = [seconds, delay] a gull now and then
// spreads its wings, flaps off over the sea and glides back to land (.gulloff; its wings .gwup/.gwdown, same timing)
export const perched = (x, y, flip = 1, d = 0, fly = null) => { const t = fly ? `animation-duration:${fly[0]}s;animation-delay:${fly[1]}s` : "";
  return `<g transform="translate(${x} ${y}) scale(${flip} 1)"><g${fly ? ` class="gulloff" style="${t}"` : ""}><g class="gullperch" style="stroke:var(--line);animation-delay:${d}s" stroke-width=".8"><path d="M-2 0 l-1 4 M2 0 l1 4" style="stroke:#E8955A" stroke-width="1.2"/>
  <ellipse cx="0" cy="-5" rx="8" ry="5" style="fill:#FFFDF6"/><g${fly ? ` class="gwdown" style="${t}"` : ""}><path d="M-8 -6 q6 -4 12 0 q-4 4 -12 0z" style="fill:#AEB7BF"/><path d="M-8 -6 l-4 -1 l3 3z" style="fill:#3B3530"/></g>
  <circle cx="6" cy="-11" r="3.6" style="fill:#FFFDF6"/><circle cx="7" cy="-12" r=".7" style="fill:#2F2B28" stroke="none"/><path d="M9.4 -11.4 l4 .8 l-4 1z" style="fill:#F3C969"/></g>${fly ? `<g class="gwup" style="${t}"><g class="gwflap" style="stroke:var(--line)" stroke-width=".8"><path d="M-2 -8 q-8 -14 -18 -10 q8 2 14 12z M2 -8 q6 -14 16 -12 q-8 4 -12 14z" style="fill:#E6EBEF"/><path d="M-20 -18 l4 1 l-2 3z M18 -20 l-4 2 l2 2z" style="fill:#3B3530"/></g></g>` : ""}</g></g>`; };
export const flying = (x, y, d) => `<g transform="translate(${x} ${y})"><g class="gullfly" style="animation-delay:${d}s"><path d="M-12 0 q6 -7 12 -1 q6 -6 12 1" fill="none" style="stroke:#66717B" stroke-width="2.8" stroke-linecap="round"/><path d="M-12 0 q6 -7 12 -1 q6 -6 12 1" fill="none" style="stroke:#FFFDF6" stroke-width="1"/></g></g>`;

// the foreshore and the beaches along the bottom row: a few standing about on the sand or the jetty, one or two
// that take off now and then, and a couple gliding over the water by day (Lighthouse Point draws its own)
const COAST = {
  shore: {sit: [[60, 454, 1, 0, [58, -12]], [176, 300, -1, -2], [170, 560, 1, -5, [71, -40]], [180, 140, -1, -7]], fly: [[70, 160], [100, 380], [60, 560]]},
  stables: {sit: [[60, 586, 1, -1, [61, -25]], [440, 588, -1, -4]], fly: [[210, 612], [400, 620]]},
  green: {sit: [[90, 586, -1, -2], [360, 588, 1, -6, [55, -33]]], fly: [[260, 614]]},
  lowervine: {sit: [[200, 586, 1, -3, [64, -10]], [470, 586, -1, -5]], fly: [[330, 612], [150, 620]]}
};
export function coastGulls(scene, night){
  const c = COAST[scene]; if (!c) return "";
  return `<g pointer-events="none">${c.sit.map(g => perched(...g)).join("")}${night ? "" : c.fly.map(([x, y], i) => flying(x, y, -i*5)).join("")}</g>`;
}
