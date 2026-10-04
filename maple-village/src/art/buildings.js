// Village buildings, each with its own architecture. Door positions match VILLAGE[id].door in data/world.js.
// Each returns the whole tappable <g data-place>, with a hover glow and a washi label under it.
import { sk, tapeLabel } from "./scenes.js";

const wrap = (id, label, tapeCol, cx, baseY, halfW, art, lines) =>
  `<g data-place="${id}" aria-label="${label}"><ellipse class="hov" cx="${cx}" cy="${baseY + 4}" rx="${halfW + 14}" ry="10" style="fill:var(--butter)"/>
    ${sk(art, lines)}${tapeLabel(cx, baseY + 20, label, tapeCol, 11.5)}</g>`;

const smoke = (x, y) => `<path class="smoke" d="M${x} ${y} q-4 -6 0 -11 q4 -5 0 -10" opacity=".6"/>`;

// Town hall: civic, columns, pediment, clock tower with a flag, front steps.
export function townHall(){
  const art = `<rect x="246" y="34" width="28" height="44" style="fill:var(--card)"/><path d="M240 36 L260 14 L280 36Z" style="fill:var(--peri)"/>
    <circle cx="260" cy="54" r="9" style="fill:#FFFDF6"/>
    <rect x="198" y="104" width="124" height="62" style="fill:var(--card)"/>
    <path d="M186 106 L260 72 L334 106Z" style="fill:var(--peri)"/>
    ${[212, 234, 286, 308].map(x => `<rect x="${x - 4}" y="108" width="8" height="58" style="fill:#FFFDF6"/>`).join("")}
    <path d="M249 170 v-22 a11 11 0 0 1 22 0 v22z" style="fill:var(--wood)"/>
    <rect x="232" y="166" width="56" height="6" style="fill:var(--stone)"/><rect x="226" y="172" width="68" height="6" style="fill:var(--stone)"/>
    <path d="M260 2 l16 6 l-16 6z" style="fill:var(--peach)"/>`;
  const lines = `<rect x="246" y="34" width="28" height="44"/><path d="M240 36 L260 14 L280 36Z"/><circle cx="260" cy="54" r="9"/><path d="M260 54 v-6 M260 54 l4 3"/>
    <path d="M260 14 v-12 M260 2 l16 6 l-16 6"/>
    <rect x="198" y="104" width="124" height="62"/><path d="M186 106 L260 72 L334 106Z"/><path d="M200 106 h120" opacity=".5"/>
    ${[212, 234, 286, 308].map(x => `<rect x="${x - 4}" y="108" width="8" height="58"/><path d="M${x - 6} 108 h12 M${x - 6} 166 h12"/>`).join("")}
    <path d="M249 170 v-22 a11 11 0 0 1 22 0 v22"/><circle cx="266" cy="158" r="1.4"/>
    <rect x="232" y="166" width="56" height="6"/><rect x="226" y="172" width="68" height="6"/>
    <path d="M252 92 h16" opacity=".6"/><circle cx="260" cy="90" r="4"/>`;
  return wrap("hall", "Town hall", "var(--peri)", 260, 178, 70, art, lines);
}

// Chord workshop: barn with a gambrel roof, plank walls, big X-braced doors, chimney, cog sign, log pile.
export function chordWorkshop(){
  const art = `<rect x="110" y="148" width="12" height="26" style="fill:var(--stone)"/>
    <path d="M24 204 L40 178 L85 160 L130 178 L146 204Z" style="fill:var(--sage)"/>
    <rect x="32" y="202" width="106" height="58" style="fill:#E3C59F"/>
    <rect x="64" y="222" width="42" height="38" style="fill:#B8875E"/>
    <rect x="78" y="182" width="14" height="13" style="fill:var(--sky)"/>
    <rect x="40" y="214" width="16" height="16" style="fill:var(--sky)"/><rect x="114" y="214" width="16" height="16" style="fill:var(--sky)"/>
    <circle cx="142" cy="246" r="6" style="fill:#C9A27E"/><circle cx="146" cy="256" r="6" style="fill:#C9A27E"/><circle cx="136" cy="256" r="6" style="fill:#C9A27E"/>`;
  const lines = `<rect x="110" y="148" width="12" height="26"/>${smoke(116, 144)}
    <path d="M24 204 L40 178 L85 160 L130 178 L146 204Z"/><path d="M40 178 L46 204 M130 178 L124 204" opacity=".5"/>
    <rect x="32" y="202" width="106" height="58"/>${[46, 60, 112, 126].map(x => `<path d="M${x} 232 v28" opacity=".35"/>`).join("")}
    <rect x="64" y="222" width="42" height="38"/><path d="M85 222 v38 M64 222 l21 38 M85 222 l-21 38 M85 222 l21 38 M106 222 l-21 38" opacity=".75"/>
    <rect x="78" y="182" width="14" height="13"/><path d="M85 182 v13"/>
    <rect x="40" y="214" width="16" height="16"/><path d="M48 214 v16 M40 222 h16"/><rect x="114" y="214" width="16" height="16"/><path d="M122 214 v16 M114 222 h16"/>
    <circle cx="142" cy="246" r="6"/><circle cx="146" cy="256" r="6"/><circle cx="136" cy="256" r="6"/><circle cx="142" cy="246" r="2"/>
    <g transform="translate(85 208)"><circle r="5"/><circle r="1.6"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M0 -5 v-2.4" transform="rotate(${a})"/>`).join("")}</g>`;
  return wrap("chord", "Chord", "var(--sage)", 85, 260, 60, art, lines);
}

// Fresh Pages library: stone hall, round tower with a cone roof, arched door and windows, open-book sign.
export function library(){
  const art = `<rect x="378" y="180" width="30" height="80" style="fill:#E9DFCD"/><path d="M372 182 L393 140 L414 182Z" style="fill:var(--peach)"/>
    <rect x="404" y="198" width="82" height="62" style="fill:#EFE6D6"/>
    <path d="M398 200 L445 170 L492 200Z" style="fill:var(--peach)"/>
    <circle cx="445" cy="187" r="6" style="fill:var(--butter)"/>
    <path d="M434 260 v-20 a11 11 0 0 1 22 0 v20z" style="fill:var(--wood)"/>
    <path d="M412 248 v-26 a7 7 0 0 1 14 0 v26z" style="fill:var(--sky)"/><path d="M464 248 v-26 a7 7 0 0 1 14 0 v26z" style="fill:var(--sky)"/>
    <path d="M389 218 v-14 a4 4 0 0 1 8 0 v14z" style="fill:var(--sky)"/>
    <path d="M435 212 q5 -3 10 0 q5 -3 10 0 v9 q-5 -3 -10 0 q-5 -3 -10 0z" style="fill:#FFFDF6"/>`;
  const lines = `<rect x="378" y="180" width="30" height="80"/><path d="M372 182 L393 140 L414 182Z"/><path d="M393 140 v-8"/><circle cx="393" cy="130" r="2"/>
    <rect x="404" y="198" width="82" height="62"/><path d="M398 200 L445 170 L492 200Z"/>
    <path d="M404 230 h82 M378 236 h30 M378 212 h30" opacity=".3"/>
    <circle cx="445" cy="187" r="6"/><path d="M441 187 h8 M445 183 v8" opacity=".5"/>
    <path d="M434 260 v-20 a11 11 0 0 1 22 0 v20"/><circle cx="451" cy="250" r="1.4"/>
    <path d="M412 248 v-26 a7 7 0 0 1 14 0 v26z M419 215 v33 M464 248 v-26 a7 7 0 0 1 14 0 v26z M471 215 v33"/>
    <path d="M389 218 v-14 a4 4 0 0 1 8 0 v14z"/>
    <path d="M435 212 q5 -3 10 0 q5 -3 10 0 v9 q-5 -3 -10 0 q-5 -3 -10 0z M445 212 v9"/><path d="M440 206 v6 M450 206 v6" opacity=".7"/>`;
  return wrap("fresh", "Fresh Pages", "var(--peach)", 435, 260, 58, art, lines);
}

// Chico cottage: rounded thatch roof, round door, round windows with flower boxes, heart on the roof.
export function chicoCottage(){
  const art = `<rect x="104" y="414" width="10" height="20" rx="3" style="fill:var(--stone)"/>
    <rect x="38" y="452" width="94" height="48" rx="6" style="fill:#FBEFEA"/>
    <path d="M26 458 Q28 410 85 404 Q142 410 144 458 Q85 446 26 458Z" style="fill:var(--rose)"/>
    <path d="M71 500 v-16 a14 14 0 0 1 28 0 v16z" style="fill:var(--sage)"/>
    <circle cx="52" cy="474" r="8" style="fill:var(--sky)"/><circle cx="118" cy="474" r="8" style="fill:var(--sky)"/>
    <rect x="42" y="484" width="20" height="6" rx="2" style="fill:var(--wood)"/><rect x="108" y="484" width="20" height="6" rx="2" style="fill:var(--wood)"/>
    <circle cx="46" cy="483" r="2" style="fill:var(--butter)"/><circle cx="52" cy="482" r="2" style="fill:var(--rose)"/><circle cx="58" cy="483" r="2" style="fill:var(--butter)"/>
    <circle cx="112" cy="483" r="2" style="fill:var(--peri)"/><circle cx="118" cy="482" r="2" style="fill:var(--butter)"/><circle cx="124" cy="483" r="2" style="fill:var(--peri)"/>
    <path d="M85 426 c-3 -4 -8 -1 -4 3 l4 4 l4 -4 c4 -4 -1 -7 -4 -3z" style="fill:#FFFDF6"/>`;
  const lines = `<rect x="104" y="414" width="10" height="20" rx="3"/>${smoke(109, 410)}
    <rect x="38" y="452" width="94" height="48" rx="6"/>
    <path d="M26 458 Q28 410 85 404 Q142 410 144 458 Q85 446 26 458Z"/><path d="M40 446 q8 4 16 0 q8 4 16 0 q8 4 16 0 q8 4 16 0 q8 4 16 0 q8 4 10 0 M52 428 q8 4 16 0 q8 4 16 0 q8 4 16 0 q8 4 16 0" opacity=".45"/>
    <path d="M71 500 v-16 a14 14 0 0 1 28 0 v16"/><circle cx="92" cy="490" r="1.4"/><path d="M85 470 v30" opacity=".35"/>
    <circle cx="52" cy="474" r="8"/><path d="M44 474 h16 M52 466 v16" opacity=".6"/><circle cx="118" cy="474" r="8"/><path d="M110 474 h16 M118 466 v16" opacity=".6"/>
    <rect x="42" y="484" width="20" height="6" rx="2"/><rect x="108" y="484" width="20" height="6" rx="2"/>`;
  return wrap("chico", "Chico", "var(--blush)", 85, 500, 58, art, lines);
}

// Post office: flat roof with a cornice, POST sign board, striped awning over the door, postbox.
export function postOffice(){
  const art = `<rect x="384" y="426" width="102" height="64" style="fill:#EAF1F6"/>
    <rect x="378" y="416" width="114" height="12" style="fill:var(--sky)"/>
    <rect x="410" y="396" width="50" height="20" rx="2" style="fill:#FFFDF6"/>
    <rect x="424" y="462" width="22" height="28" style="fill:var(--wood)"/>
    <path d="M410 448 h50 l5 12 h-60z" style="fill:#FFFDF6"/>
    ${[414, 426, 438, 450].map(x => `<path d="M${x} 448 h6 l1 12 h-7z" style="fill:var(--rose)"/>`).join("")}
    <rect x="390" y="438" width="16" height="22" style="fill:var(--sky)"/><rect x="466" y="438" width="16" height="22" style="fill:var(--sky)"/>
    <rect x="494" y="456" width="12" height="13" rx="3" style="fill:var(--rose)"/><rect x="498" y="469" width="4" height="17" style="fill:var(--wood)"/>`;
  const lines = `<rect x="384" y="426" width="102" height="64"/><rect x="378" y="416" width="114" height="12"/><path d="M378 422 h114" opacity=".4"/>
    <rect x="410" y="396" width="50" height="20" rx="2"/><path d="M416 400 h14 v10 h-14z M416 400 l7 5 l7 -5"/><path d="M436 403 h18 M436 409 h12" opacity=".6"/>
    <rect x="424" y="462" width="22" height="28"/><path d="M429 472 h12" stroke-width="2"/><circle cx="441" cy="480" r="1.3"/>
    <path d="M410 448 h50 l5 12 h-60z"/>
    <rect x="390" y="438" width="16" height="22"/><path d="M398 438 v22 M390 449 h16"/><rect x="466" y="438" width="16" height="22"/><path d="M474 438 v22 M466 449 h16"/>
    <rect x="494" y="456" width="12" height="13" rx="3"/><path d="M497 461 h6"/><path d="M500 469 v17"/>`;
  return wrap("post", "Post office", "var(--sky)", 435, 490, 58, art, lines);
}
