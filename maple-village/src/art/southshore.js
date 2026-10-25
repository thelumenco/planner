// The sea along the bottom of the bottom row (round 266, the creator: "that little water that's flowing east in the lighthouse
// screen... can that carry over on the stables and village green and lower vineyard too?"). The same strip of sand and
// sea on the Stables, the green and the lower vineyard, meeting Lighthouse Point's bottom edge at its east side.
const ripple = ([x, y]) => `<path class="ripple" d="M${x} ${y} q5 -3.5 10 0 q5 3.5 10 0" fill="none" style="stroke:#FFFDF6" stroke-width="1.3" opacity=".8"/>`;
export const SHORE_Y = 592;   // where the water starts at each screen edge (walk no further)
export function southShore(){
  const sand = "M0 554 C120 548 260 562 390 554 C450 550 490 556 520 554 V640 H0Z";
  const sea = "M0 592 C100 604 220 590 330 600 C420 606 480 594 520 592 V640 H0Z";
  const edge = "M0 592 C100 604 220 590 330 600 C420 606 480 594 520 592";
  return `<g pointer-events="none"><g filter="url(#wob)"><path d="${sand}" style="fill:var(--sand)"/><path d="${sea}" style="fill:var(--sea)"/>
    <path d="M0 614 C140 622 300 610 420 620 C470 624 500 616 520 614 V640 H0Z" style="fill:var(--sea2)" opacity=".7"/></g>
    <g filter="url(#wob)" fill="none"><path d="${edge}" style="stroke:#FFFDF6" stroke-width="3.2" stroke-dasharray="10 7" opacity=".9"/><path d="${edge}" style="stroke:var(--line)" stroke-width="1" opacity=".45"/></g>
    ${[[60, 618], [190, 622], [330, 616], [460, 624]].map(ripple).join("")}</g>`;
}
