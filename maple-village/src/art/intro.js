// The opening story's pictures (game/intro.js): everything seen through your own eyes, before you've chosen how you
// look, so you're never shown (only, once, a faint reflection in a window). Same hand-drawn ink and marker as the rest
// of the game (sk(): fills under #marker, ink lines under #wob). Each picture is 400 x 240.
import { sk } from "./scenes.js";

const wrap = (body, bg) => `<svg viewBox="0 0 400 240" class="inpic" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><rect width="400" height="240" fill="${bg}"/>${body}</svg>`;
const glow = (id, c1, c2) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient>`;

// 1. Late again: a laptop in a dark office, the screen the only light
function late(){
  let cells = "";
  for (let r = 0; r < 10; r++) for (let c = 0; c < 6; c++) if ((r*7 + c*3) % 5 === 0) cells += `<rect x="${121 + c*27}" y="${83 + r*9}" width="25" height="7" style="fill:${(r + c) % 3 ? "#F6E3A1" : "#C8E3C0"}"/>`;
  const tabs = Array.from({length: 14}, (_, i) => `<rect x="${120 + i*11.5}" y="174" width="10" height="5" rx="1" style="fill:${i === 9 ? "#FFFDF6" : "#A9C3DD"}"/>`).join("");
  return wrap(`<defs>${glow("inLamp", "#FFD98A", "#FFD98A")}${glow("inScreen", "#CFE3F5", "#CFE3F5")}</defs>
    <rect x="0" y="0" width="400" height="92" fill="#1E2438"/>${[20, 70, 120, 290, 340].map((x, i) => `<rect x="${x}" y="${20 + (i%2)*8}" width="34" height="56" fill="#252C44"/>${[0, 1, 2].map(k => i % 2 || k === 1 ? `<rect x="${x + 6 + k*9}" y="${34 + (i%2)*8}" width="5" height="5" fill="#F6E3A1" opacity=".55"/>` : "").join("")}`).join("")}
    <path d="M0 92 H400" stroke="#3A4260" stroke-width="2"/>
    <rect x="0" y="118" width="400" height="22" fill="#262D45"/>${[10, 60, 330, 380].map(x => `<rect x="${x}" y="104" width="6" height="36" fill="#2E3654"/>`).join("")}
    <circle cx="352" cy="112" r="34" fill="url(#inLamp)" opacity=".5"/><path d="M344 112 l8 -14 l8 14z" fill="#E9C46A"/><path d="M352 112 v8" stroke="#8A7A5A" stroke-width="2"/>
    <rect x="0" y="196" width="400" height="44" fill="#2A2F3E"/>
    <ellipse cx="200" cy="170" rx="160" ry="90" fill="url(#inScreen)" opacity=".18"/>`
    + sk(`<rect x="110" y="70" width="180" height="126" rx="7" style="fill:#3E4452"/><rect x="118" y="78" width="164" height="104" rx="2" style="fill:#DCEBF8"/>${cells}${tabs}
      <path d="M96 196 H304 L330 240 H70z" style="fill:#8A909E"/>`,
      `<rect x="110" y="70" width="180" height="126" rx="7"/><rect x="118" y="78" width="164" height="104" rx="2"/>${Array.from({length: 10}, (_, r) => `<path d="M118 ${82 + r*9} H282" opacity=".25"/>`).join("")}${Array.from({length: 5}, (_, c) => `<path d="M${146 + c*27} 78 V172" opacity=".25"/>`).join("")}
      <path d="M96 196 H304 L330 240 H70z"/>${[206, 216, 226].map((y, r) => Array.from({length: 11}, (_, k) => `<rect x="${104 + r*-3 + k*19}" y="${y}" width="15" height="7" rx="1.5" opacity=".45"/>`).join("")).join("")}`)
    + `<text x="279" y="190" text-anchor="end" font-size="7" font-family="Mulish,sans-serif" fill="#6E8094">9:47 PM</text>`, "#1A1F30");
}

// 2. Dinner at the desk: cold noodles in a plastic box, a plastic fork, a sticky note on the laptop
function meal(){
  const noodles = Array.from({length: 7}, (_, i) => `<path d="M142 ${120 + i*10} q12 ${i % 2 ? -6 : 6} 24 0 t24 0 t24 0 t24 0 t12 0" style="fill:none;stroke:#F6E6BE;stroke-width:3.2;stroke-linecap:round"/>`).join("");
  return wrap(`<rect width="400" height="240" fill="#7C8290"/><rect x="0" y="0" width="400" height="240" fill="#DCE7F2" opacity=".12"/>`
    + sk(`<rect x="-10" y="-10" width="200" height="66" rx="6" transform="rotate(-6 90 20)" style="fill:#A3A8B4"/><rect x="128" y="8" width="44" height="40" transform="rotate(5 150 28)" style="fill:#F6E27A"/>
      <rect x="120" y="100" width="150" height="104" rx="12" style="fill:#EEF2F4" opacity=".92"/><rect x="132" y="110" width="126" height="84" rx="8" style="fill:#D9C48E"/>${noodles}
      <circle cx="232" cy="130" r="4" style="fill:#9CC27E"/><circle cx="168" cy="172" r="3.5" style="fill:#9CC27E"/><circle cx="214" cy="180" r="3" style="fill:#9CC27E"/>
      <path d="M248 122 q10 -6 14 4 l-12 6z" style="fill:#B9D27A"/>
      <rect x="282" y="98" width="88" height="70" rx="10" transform="rotate(14 326 133)" style="fill:#EEF2F4" opacity=".75"/>
      <path d="M300 200 l70 -40 l5 6 l-70 42z" style="fill:#FFFFFF"/><rect x="40" y="150" width="56" height="44" rx="3" transform="rotate(-8 68 172)" style="fill:#FFFFFF" opacity=".9"/>`,
      `<rect x="-10" y="-10" width="200" height="66" rx="6" transform="rotate(-6 90 20)"/><rect x="128" y="8" width="44" height="40" transform="rotate(5 150 28)"/>
      <rect x="120" y="100" width="150" height="104" rx="12"/><rect x="132" y="110" width="126" height="84" rx="8"/>
      <path d="M248 122 q10 -6 14 4 l-12 6z"/><rect x="282" y="98" width="88" height="70" rx="10" transform="rotate(14 326 133)"/>
      <path d="M300 200 l70 -40 l5 6 l-70 42z"/><path d="M362 164 l14 -10 M366 168 l14 -10 M370 172 l13 -9" opacity=".7"/><rect x="40" y="150" width="56" height="44" rx="3" transform="rotate(-8 68 172)"/><path d="M50 166 l34 -4 M52 176 l30 -4" opacity=".3"/>`)
    + `<text x="150" y="31" text-anchor="middle" transform="rotate(5 150 28)" font-size="9" font-family="Klee One,serif" font-weight="600" fill="#C0392B">Q3 deck!!</text>`, "#7C8290");
}

// 3. The view: Marina Bay at night from an office window at Raffles Place, looking east across the bay. Left to
// right: the Flyer (the big wheel), the Helix Bridge, the ArtScience Museum's lotus, Marina Bay Sands (three towers under
// the long SkyPark, its tip jutting out north, to the left), the Supertrees of Gardens by the Bay behind
function view(){
  const sky = `<defs><linearGradient id="inSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141B33"/><stop offset=".75" stop-color="#2E3A68"/><stop offset="1" stop-color="#4A4E7A"/></linearGradient>${glow("inTree", "#E07AB8", "#E07AB8")}</defs>`;
  const stars = [[40, 24], [130, 16], [210, 30], [300, 14], [370, 34], [90, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#FFFDF6" opacity=".7"/>`).join("");
  // the Flyer: wheel, spokes, capsules, and its legs on the terminal
  const fx = 66, fy = 112, fr = 44;
  const flyer = sk(`<rect x="34" y="166" width="64" height="12" rx="3" style="fill:#2A3052"/>`,
    `<circle cx="${fx}" cy="${fy}" r="${fr}" style="stroke:#BFD3F2"/><circle cx="${fx}" cy="${fy}" r="${fr - 4}" style="stroke:#8FA7D8" opacity=".6"/>${Array.from({length: 14}, (_, i) => { const a = i*Math.PI/7; return `<path d="M${fx} ${fy} L${(fx + Math.cos(a)*fr).toFixed(1)} ${(fy + Math.sin(a)*fr).toFixed(1)}" style="stroke:#8FA7D8" opacity=".45"/>`; }).join("")}
      <path d="M${fx} ${fy} L50 166 M${fx} ${fy} L82 166" style="stroke:#BFD3F2"/><rect x="34" y="166" width="64" height="12" rx="3"/>`)
    + Array.from({length: 14}, (_, i) => { const a = i*Math.PI/7 + .22; return `<circle cx="${(fx + Math.cos(a)*fr).toFixed(1)}" cy="${(fy + Math.sin(a)*fr).toFixed(1)}" r="2.3" fill="#F6E3A1"/>`; }).join("");
  // the Helix Bridge: a long low curve over the water, its double helix as two twisting lines
  const helix = sk(`<path d="M86 182 Q140 170 196 178 L196 182 Q140 175 86 186z" style="fill:#3A426E"/>`,
    `<path d="M86 182 Q140 170 196 178"/><path d="M86 176 ${Array.from({length: 11}, (_, i) => `Q${91 + i*10} ${i % 2 ? 182 : 168} ${96 + i*10} ${175 - i*.2}`).join(" ")}" style="stroke:#BFD3F2"/><path d="M86 180 ${Array.from({length: 11}, (_, i) => `Q${91 + i*10} ${i % 2 ? 168 : 184} ${96 + i*10} ${177 - i*.2}`).join(" ")}" style="stroke:#F6E3A1" opacity=".7"/>`);
  // the ArtScience Museum: a white lotus of ten petals on a round base
  const petals = [-58, -42, -27, -13, 0, 13, 27, 42, 58].map(a => `<path d="M0 0 Q-7 -20 -3 -36 Q0 -40 3 -36 Q7 -20 0 0z" transform="translate(208 170) rotate(${a})" style="fill:#F1ECE2"/>`).join("");
  const lotus = sk(`${petals}<ellipse cx="208" cy="172" rx="22" ry="7" style="fill:#D9D2C6"/>`, `${petals.replace(/style="fill:#F1ECE2"/g, "")}<ellipse cx="208" cy="172" rx="22" ry="7"/>`);
  // Marina Bay Sands: three towers (each a pair of slim legs, the inner one leaning in) under the SkyPark
  const towers = [254, 296, 338].map(x => `<path d="M${x - 13} 176 L${x - 12} 74 H${x + 12} L${x + 13} 176z" style="fill:#2C3458"/><path d="M${x} 74 Q${x + 3} 130 ${x + 13} 176" style="fill:none;stroke:#1E2440;stroke-width:1.5"/>`).join("");
  const lights = [254, 296, 338].flatMap(x => Array.from({length: 18}, (_, r) => (r*3 + x) % 4 ? `<rect x="${x - 9 + (r % 3)*6}" y="${80 + r*5.4}" width="3" height="2" fill="#F6E3A1" opacity=".75"/>` : "")).join("");
  const mbs = sk(`${towers}<path d="M214 70 Q218 64 232 64 H356 Q364 64 364 70 L360 76 H220z" style="fill:#3A4372"/>`,
    `${[254, 296, 338].map(x => `<path d="M${x - 13} 176 L${x - 12} 74 H${x + 12} L${x + 13} 176z"/>`).join("")}<path d="M214 70 Q218 64 232 64 H356 Q364 64 364 70 L360 76 H220z"/><path d="M226 67 h126" opacity=".4"/>`) + lights
    + `<path d="M232 64 H356" stroke="#9FD3E8" stroke-width="1.2" opacity=".8"/>`;
  // the Supertrees behind, to the right: thin trunks, wide canopies, a soft purple glow
  const trees = [[372, 120, 1], [390, 132, .8], [356, 138, .7]].map(([x, y, s]) => `<path d="M${x - 2*s} 176 L${x - 3*s} ${y} H${x + 3*s} L${x + 2*s} 176z" fill="#5A3F6E"/><path d="M${x - 16*s} ${y - 8*s} Q${x} ${y + 4*s} ${x + 16*s} ${y - 8*s} Q${x} ${y - 2*s} ${x - 16*s} ${y - 8*s}z" fill="#C46AAE"/>`).join("");
  const water = `<rect x="0" y="176" width="400" height="64" fill="#18203A"/>${[[60, 196, 30], [140, 206, 22], [210, 192, 18], [270, 200, 40], [320, 214, 26], [96, 222, 34], [250, 228, 30]].map(([x, y, w]) => `<path d="M${x} ${y} h${w}" stroke="#F6E3A1" stroke-width="1.6" opacity=".45" stroke-linecap="round"/>`).join("")}`;
  // the window: your faint reflection in the glass, and the frame
  const me = `<path d="M150 240 Q150 200 178 192 Q170 178 172 164 Q176 144 196 142 Q218 142 222 164 Q224 180 214 192 Q244 200 246 240z" fill="#C9D3F2" opacity=".07"/>`;
  const frame = `<path d="M0 0 H400 V240 H0z M14 12 V232 H194 V12z M206 12 V232 H386 V12z" fill="#1A1E2C" fill-rule="evenodd"/><path d="M0 232 H400 V240 H0z" fill="#252A3A"/>`;
  return wrap(`${sky}<rect width="400" height="240" fill="url(#inSky)"/>${stars}<circle cx="372" cy="128" r="40" fill="url(#inTree)" opacity=".35"/>${trees}${flyer}${helix}${mbs}${lotus}${water}${me}${frame}`, "#141B33");
}

// 4. The morning train: holding the pole in a packed carriage, everyone in their own little world
function commute(){
  const heads = [[36, 150, "#8E97AB"], [112, 164, "#7D869B"], [306, 168, "#8E97AB"], [376, 156, "#737C92"], [62, 196, "#6E778C"], [356, 206, "#7D869B"]];
  const ppl = heads.map(([x, y, c]) => `<path d="M${x - 30} 240 Q${x - 30} ${y + 30} ${x} ${y + 26} Q${x + 30} ${y + 30} ${x + 30} 240z" style="fill:${c}"/><circle cx="${x}" cy="${y}" r="17" style="fill:${c}"/>`).join("");
  const pplL = heads.map(([x, y]) => `<path d="M${x - 30} 240 Q${x - 30} ${y + 30} ${x} ${y + 26} Q${x + 30} ${y + 30} ${x + 30} 240"/><circle cx="${x}" cy="${y}" r="17"/>`).join("");
  return wrap(`<rect width="400" height="240" fill="#E6E9EE"/>`
    + sk(`<rect x="0" y="0" width="400" height="20" style="fill:#D2D7DE"/><rect x="40" y="26" width="320" height="14" rx="3" style="fill:#FFFFFF"/>
      <rect x="20" y="48" width="360" height="74" rx="10" style="fill:#BFD8EC"/>${[[40, 74], [96, 60], [150, 82], [212, 56], [270, 70], [330, 64]].map(([x, y]) => `<rect x="${x}" y="${y}" width="40" height="${122 - y}" style="fill:#E9EEF3"/>`).join("")}`,
      `<rect x="40" y="26" width="320" height="14" rx="3"/><path d="M60 33 H340" style="stroke:#D0453B;stroke-width:2.2"/><path d="M60 36 H340" style="stroke:#3E9A5A;stroke-width:2.2" opacity=".8"/>${[70, 110, 150, 190, 230, 270, 310].map(x => `<circle cx="${x}" cy="33" r="2.2" style="fill:#FFFFFF"/>`).join("")}
      <rect x="20" y="48" width="360" height="74" rx="10"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${30 + i*80} ${60 + i*4} h${44 - i*4}" opacity=".35"/>`).join("")}<path d="M0 16 H400"/>`)
    + `<text x="104" y="13" text-anchor="middle" font-size="7.5" font-family="Mulish,sans-serif" font-weight="700" fill="#3E4A5C" opacity=".8">NEXT STATION: RAFFLES PLACE</text>`
    + sk(ppl, pplL) + `<rect x="296" y="196" width="14" height="22" rx="3" fill="#CFE3F5" opacity=".6"/>`
    + sk(`<rect x="190" y="0" width="9" height="240" style="fill:#C8CDD4"/>`, `<rect x="190" y="0" width="9" height="240"/><path d="M193 0 V240" opacity=".3"/>`), "#E6E9EE");
}

// 5. The envelope: a fat manila envelope, stamps and redirection stickers all over it, an official letter beneath
function envelope(){
  return wrap(`<defs>${glow("inWarm", "#FFE3A3", "#FFE3A3")}</defs><rect width="400" height="240" fill="#B48A62"/><circle cx="330" cy="30" r="200" fill="url(#inWarm)" opacity=".35"/>${[40, 100, 160, 220].map(y => `<path d="M0 ${y} H400" stroke="#9E7650" stroke-width="1" opacity=".5"/>`).join("")}`
    + sk(`<rect x="196" y="26" width="160" height="196" rx="3" transform="rotate(8 276 124)" style="fill:#FFFDF6"/>`,
      `<rect x="196" y="26" width="160" height="196" rx="3" transform="rotate(8 276 124)"/><g transform="rotate(8 276 124)"><circle cx="216" cy="46" r="8"/><path d="M212 46 l4 -5 l4 5 l-4 5z"/>${[76, 86, 96, 108, 118, 128, 140, 150].map((y, i) => `<path d="M210 ${y} h${i % 3 === 2 ? 80 : 128}" opacity=".3"/>`).join("")}</g>`)
    + `<text x="234" y="44" transform="rotate(8 276 124)" font-size="7" font-family="Mulish,sans-serif" font-weight="700" letter-spacing="1" fill="#3E4A5C">PEMBURY &amp; VALE</text><text x="234" y="54" transform="rotate(8 276 124)" font-size="5.5" font-family="Mulish,sans-serif" letter-spacing="1" fill="#6E7480">SOLICITORS · HONEYBROOK</text>`
    + sk(`<rect x="52" y="60" width="210" height="140" rx="4" transform="rotate(-5 157 130)" style="fill:#D9B36C"/>
      <g transform="rotate(-5 157 130)"><rect x="214" y="68" width="18" height="22" style="fill:#E8566C"/><rect x="236" y="68" width="18" height="22" style="fill:#6E9FD6"/><rect x="214" y="94" width="18" height="22" style="fill:#9CC27E"/>
      <rect x="64" y="72" width="90" height="20" rx="3" style="fill:#F6E27A"/><rect x="70" y="150" width="80" height="18" rx="3" style="fill:#FFFDF6"/></g>`,
      `<rect x="52" y="60" width="210" height="140" rx="4" transform="rotate(-5 157 130)"/><g transform="rotate(-5 157 130)"><rect x="214" y="68" width="18" height="22"/><rect x="236" y="68" width="18" height="22"/><rect x="214" y="94" width="18" height="22"/>
      <circle cx="200" cy="96" r="16" style="stroke:#C0392B" opacity=".55"/><path d="M188 90 h24 M188 96 h24 M188 102 h24" style="stroke:#C0392B" opacity=".4"/>
      <rect x="64" y="72" width="90" height="20" rx="3"/><rect x="70" y="150" width="80" height="18" rx="3"/>${[116, 126, 136].map((y, i) => `<path d="M100 ${y} q20 -3 40 0 t${40 - i*10} 0"/>`).join("")}<path d="M76 158 h50" style="stroke:#C0392B" opacity=".6"/></g>`)
    + `<text x="109" y="86" transform="rotate(-5 157 130)" text-anchor="middle" font-size="8" font-family="Mulish,sans-serif" font-weight="700" fill="#5A4A2E">REDIRECTED</text>`, "#B48A62");
}

// 6. Uncle Wilf's note: a handwritten card, an old photo of the vineyard in its green days, a key on a ribbon
function note(){
  return wrap(`<defs>${glow("inWarm2", "#FFE3A3", "#FFE3A3")}</defs><rect width="400" height="240" fill="#B48A62"/><circle cx="80" cy="30" r="200" fill="url(#inWarm2)" opacity=".35"/>${[40, 100, 160, 220].map(y => `<path d="M0 ${y} H400" stroke="#9E7650" stroke-width="1" opacity=".5"/>`).join("")}`
    + sk(`<rect x="262" y="40" width="104" height="112" rx="2" transform="rotate(9 314 96)" style="fill:#FBF7EE"/><g transform="rotate(9 314 96)"><rect x="270" y="48" width="88" height="78" style="fill:#BFD8EC"/><path d="M270 98 Q300 86 330 96 T358 92 V126 H270z" style="fill:#9CC27E"/>
        ${[0, 1, 2, 3].map(i => `<path d="M${272 + i*22} 126 L${300 + i*16} 100" style="stroke:#5E8A48;stroke-width:3;fill:none"/>`).join("")}<rect x="300" y="72" width="22" height="18" style="fill:#F2D3B0"/><path d="M297 73 l14 -10 l14 10z" style="fill:#C8643B"/></g>
      <path d="M60 196 q10 -14 22 -2 q8 10 -4 16 q-14 4 -18 -14z" style="fill:#C0392B"/><circle cx="96" cy="204" r="9" style="fill:#B9A27A"/><rect x="104" y="201" width="40" height="6" rx="2" style="fill:#B9A27A"/><rect x="134" y="206" width="5" height="8" style="fill:#B9A27A"/><rect x="126" y="206" width="5" height="6" style="fill:#B9A27A"/>
      <rect x="96" y="24" width="168" height="170" rx="4" transform="rotate(-4 180 109)" style="fill:#FFFDF6"/>`,
      `<rect x="262" y="40" width="104" height="112" rx="2" transform="rotate(9 314 96)"/><g transform="rotate(9 314 96)"><rect x="270" y="48" width="88" height="78"/><rect x="300" y="72" width="22" height="18"/><path d="M297 73 l14 -10 l14 10z"/><path d="M340 112 v-10 a3 3 0 1 1 0.1 0" opacity=".7"/></g>
      <path d="M60 196 q10 -14 22 -2 q8 10 -4 16 q-14 4 -18 -14z"/><circle cx="96" cy="204" r="9"/><circle cx="96" cy="204" r="4"/><rect x="104" y="201" width="40" height="6" rx="2"/>
      <rect x="96" y="24" width="168" height="170" rx="4" transform="rotate(-4 180 109)"/><g transform="rotate(-4 180 109)">${[46, 60, 74, 88, 102, 116, 130, 144].map((y, i) => `<path d="M110 ${y} q12 -4 24 0 t24 0 t24 0 t${i % 3 === 2 ? 10 : 24} 0" style="stroke:#3E4A7A" opacity=".75"/>`).join("")}<path d="M208 168 q6 -12 10 0 q4 -12 10 0" style="stroke:#3E4A7A"/></g>`), "#B48A62");
}

// 7. Leaving: your office pass dropped in a drawer; your suitcase waiting by the door
function leaving(){
  return wrap(`<defs>${glow("inSun", "#FFF1C8", "#FFF1C8")}</defs><rect width="400" height="240" fill="#EFE6D6"/><rect x="0" y="150" width="400" height="90" fill="#D9C4A4"/>`
    + sk(`<rect x="240" y="20" width="96" height="140" rx="3" style="fill:#C99A63"/><rect x="256" y="34" width="64" height="40" rx="2" style="fill:#FFF1C8"/>
      <rect x="350" y="96" width="46" height="62" rx="7" style="fill:#5E9A86"/><rect x="364" y="86" width="18" height="12" rx="4" style="fill:none"/><rect x="376" y="104" width="12" height="16" rx="2" style="fill:#F6E27A"/>
      <rect x="10" y="132" width="230" height="120" rx="6" style="fill:#B98A5A"/><rect x="28" y="150" width="194" height="80" rx="4" style="fill:#7E5A3A"/>
      <rect x="92" y="170" width="44" height="30" rx="4" transform="rotate(-10 114 185)" style="fill:#FFFDF6"/><rect x="98" y="176" width="14" height="16" rx="2" transform="rotate(-10 114 185)" style="fill:#9AA3B5"/>`,
      `<rect x="240" y="20" width="96" height="140" rx="3"/><rect x="256" y="34" width="64" height="40" rx="2"/><circle cx="326" cy="96" r="3"/>
      <rect x="350" y="96" width="46" height="62" rx="7"/><rect x="364" y="86" width="18" height="12" rx="4"/><rect x="376" y="104" width="12" height="16" rx="2"/><path d="M382 120 v10"/><circle cx="360" cy="160" r="3"/><circle cx="386" cy="160" r="3"/>
      <rect x="10" y="132" width="230" height="120" rx="6"/><rect x="28" y="150" width="194" height="80" rx="4"/>
      <rect x="92" y="170" width="44" height="30" rx="4" transform="rotate(-10 114 185)"/><g transform="rotate(-10 114 185)"><path d="M118 180 h12 M118 186 h10" opacity=".5"/></g><path d="M112 172 Q132 154 160 166 Q186 180 176 200 Q160 214 136 204" style="stroke:#3E6BAE;stroke-width:3.2"/>`)
    + `<circle cx="298" cy="54" r="70" fill="url(#inSun)" opacity=".45"/>`, "#EFE6D6");
}

// 9. Arrival: at the gate in the golden evening. Bare rows, leaning posts, sagging wire, a tired house, and
// something rustling by the porch
function arrive(){
  const posts = [[188, 140, -6], [236, 146, 5], [284, 152, -9], [332, 158, 7], [380, 164, -4], [212, 182, 8], [272, 192, -7], [334, 202, 10]];
  const P = posts.map(([x, y, a]) => `<rect x="${x - 3}" y="${y - 40}" width="6" height="40" transform="rotate(${a} ${x} ${y})" style="fill:#9E7A52"/>`).join("");
  const PL = posts.map(([x, y, a]) => `<rect x="${x - 3}" y="${y - 40}" width="6" height="40" transform="rotate(${a} ${x} ${y})"/>`).join("");
  const wire = `<path d="M188 112 Q212 124 236 116 Q260 130 284 120 Q308 134 332 126 Q356 136 380 132" opacity=".6"/><path d="M212 152 Q242 168 272 160 Q302 176 334 170" opacity=".6"/>`;
  const weeds = [[170, 168], [246, 176], [300, 188], [360, 182], [228, 214], [312, 226], [384, 214]].map(([x, y]) => `<path d="M${x} ${y} l-4 -10 M${x} ${y} l0 -13 M${x} ${y} l5 -9" style="stroke:#8C8F5A"/>`).join("");
  return wrap(`<defs><linearGradient id="inGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3C98A"/><stop offset="1" stop-color="#F7E6BC"/></linearGradient></defs>
    <rect width="400" height="240" fill="url(#inGold)"/><circle cx="330" cy="70" r="20" fill="#FFF1C8"/>
    <path d="M0 100 Q60 74 130 92 T260 86 T400 90 V130 H0z" fill="#B9B070"/><path d="M0 120 Q90 100 180 116 T400 112 V240 H0z" fill="#D2B97A"/>`
    + sk(`<rect x="34" y="62" width="104" height="72" style="fill:#EADCC4"/><path d="M26 66 L86 30 L146 66z" style="fill:#9E6A4A"/><rect x="64" y="96" width="22" height="38" style="fill:#8A6A4A"/><rect x="100" y="84" width="24" height="20" style="fill:#BFD8EC"/><rect x="42" y="84" width="16" height="20" transform="rotate(8 50 94)" style="fill:#7FA0B0"/>
      <rect x="30" y="130" width="112" height="8" style="fill:#B98A5A"/><path d="M48 76 q6 4 2 10 q-6 -2 -2 -10z M118 116 q8 2 4 10 q-6 -4 -4 -10z M96 70 q6 2 3 8z" style="fill:#F6EFE2"/>
      <ellipse cx="152" cy="134" rx="18" ry="12" style="fill:#7FA35A"/>${P}`,
      `<rect x="34" y="62" width="104" height="72"/><path d="M26 66 L86 30 L146 66z"/><rect x="64" y="96" width="22" height="38"/><rect x="100" y="84" width="24" height="20"/><path d="M112 84 v20 M100 94 h24"/><rect x="42" y="84" width="16" height="20" transform="rotate(8 50 94)"/>
      <rect x="30" y="130" width="112" height="8"/><path d="M40 72 l10 4 M120 112 l6 6" opacity=".4"/><ellipse cx="152" cy="134" rx="18" ry="12"/><path d="M134 124 l-6 -5 M138 120 l-3 -7 M168 122 l5 -6 M172 128 l7 -2" opacity=".8"/>${PL}${wire}${weeds}`)
    + sk(`<rect x="0" y="176" width="10" height="64" style="fill:#9E7A52"/><path d="M10 184 L118 200 L118 214 L10 198z M10 214 L118 226 L118 238 L10 228z" style="fill:#B98A5A"/><rect x="22" y="150" width="62" height="22" rx="2" transform="rotate(-7 53 161)" style="fill:#E9DCC0"/>`,
      `<rect x="0" y="176" width="10" height="64"/><path d="M10 184 L118 200 L118 214 L10 198z M10 214 L118 226 L118 238 L10 228z M40 190 v38 M76 194 v38" /><rect x="22" y="150" width="62" height="22" rx="2" transform="rotate(-7 53 161)"/><path d="M30 150 l-2 -14 M76 145 l2 -14" opacity=".7"/>`)
    + `<text x="53" y="165" transform="rotate(-7 53 161)" text-anchor="middle" font-size="8.5" font-family="Klee One,serif" font-weight="600" fill="#5A4A3A">Song's Vineyard</text>`, "#F3C98A");
}

export const INTRO_ART = {late, meal, view, commute, envelope, note, leaving, arrive};
