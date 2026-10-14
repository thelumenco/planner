// The five pets (phase 4 of the public edition): fox, rabbit, tortoise, quokka and capybara. You choose one when you
// start a game and it's yours for that game (species fixed; the name can change). Each species has the same five
// drawings in the same frames, so the animations, accessories and poses fit them all:
//   tail, body, head  the portrait in the backpack panel ("Spoil <name>"): an svg viewBox 0 0 120 120, sitting on the
//                     rug with its feet at y≈118. #fTail swishes about (78,102), #fHead tilts about (60,76); the head
//                     sits in the box x 22..98, y 8..78 with the eyes around y 50 (the scarf is drawn at y 72..95 and
//                     the crown above the head), and the head art keeps the blinking eyes in a <g class="eyesOpen">
//   nap               the portrait napping, curled up: viewBox 0 0 170 96, lying on the rug (bottom at y≈92)
//   stand             the little follower on the map, standing, feet at y 0, about 20 tall and 20 wide (the tail, if
//                     any, in <g class="mtail">)
//   curl              the little follower asleep, curled, feet at y 0
//   peek              a head peeping out of the bike basket or the back of the car, centred on 0,0, about 12 across
// Colours come from --pet1 (main coat), --pet2 (the light parts) and --pet3 (eyes, nose, paws), set on :root by
// core.js from SPECIES[kind].cols, so the same drawing works in light and dark themes.
export const SPECIES = {
  fox: {n: "Fox", a: "a fox", cols: ["#EE8B3A", "#FFF7EA", "#4A3029"], names: ["Ember", "Rusty", "Clementine", "Toffee", "Saffron"],
    pace: 1, sleepy: 1, line: "Quick, curious and a terrible sock thief."},
  rabbit: {n: "Rabbit", a: "a rabbit", cols: ["#CDB497", "#FFF4E6", "#4A3A30"], names: ["Clover", "Biscuit", "Thistle", "Pudding", "Bramble"],
    pace: 1.15, sleepy: 1, line: "Hops everywhere. Will do anything for a carrot top."},
  tortoise: {n: "Tortoise", a: "a tortoise", cols: ["#9AAE6E", "#E6D7A8", "#3E3A2C"], names: ["Pebble", "Basil", "Mossy", "Sage", "Professor"],
    pace: .55, sleepy: 1.3, line: "Never in a hurry. Always gets there."},
  quokka: {n: "Quokka", a: "a quokka", cols: ["#A97E5A", "#EBD6B8", "#3A2A20"], names: ["Sunny", "Wattle", "Pip", "Banjo", "Smiley"],
    pace: 1, sleepy: .9, line: "Smiles at everyone. Everyone smiles back."},
  capybara: {n: "Capybara", a: "a capybara", cols: ["#9C7350", "#C9A27E", "#3A2A20"], names: ["Mochi", "Tofu", "Chestnut", "Bean", "Captain"],
    pace: .8, sleepy: 1.4, line: "Calm about absolutely everything. Loves a warm bath."}
};
export const KINDS = Object.keys(SPECIES);
export const speciesOf = F => SPECIES[(F && F.pet) || "fox"] ? (F && F.pet) || "fox" : "fox";

const FOX = {
  tail: `
              <g filter="url(#marker)">
                <path d="M78 108 C124 114 134 66 104 54 C93 50 86 62 95 68 C107 78 102 98 76 96 Z" style="fill:var(--pet1)"/>
                <path d="M104 54 C95 50 86 59 92 66 L97 63 L99 68 L104 62 L108 66 L111 59 C109 57 107 55 104 54Z" style="fill:var(--pet2)"/>
              </g>
              <g fill="none" style="stroke:var(--line)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" filter="url(#wob)">
                <path d="M78 108 C124 114 134 66 104 54 C93 50 86 62 95 68 C107 78 102 98 76 96"/>
                <path d="M92 66 L97 63 L99 68 L104 62 L108 66 L111 59"/>
                <path d="M110 86 q4 -4 5 -9 M104 96 q5 -3 7 -7" opacity=".55"/>
              </g>
            `,
  body: `
              <g filter="url(#marker)">
                <ellipse cx="60" cy="94" rx="29" ry="24" style="fill:var(--pet1)"/>
                <path d="M46 84 L51 88 L54 82 L60 88 L66 82 L69 88 L74 84 C76 96 72 112 60 113 C48 112 44 96 46 84Z" style="fill:var(--pet2)"/>
                <ellipse cx="47" cy="115" rx="8.5" ry="5" style="fill:var(--pet3)"/>
                <ellipse cx="73" cy="115" rx="8.5" ry="5" style="fill:var(--pet3)"/>
              </g>
              <g fill="none" style="stroke:var(--line)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" filter="url(#wob)">
                <path d="M34 98 C30 80 42 70 60 70 C78 70 90 80 86 98 C84 110 76 118 60 118 C44 118 36 110 34 98"/>
                <path d="M46 84 L51 88 L54 82 L60 88 L66 82 L69 88 L74 84"/>
                <path d="M38 114 q9 -6 18 0 M64 114 q9 -6 18 0"/>
                <path d="M40 96 q-2 5 0 9 M80 96 q2 5 0 9" opacity=".55"/>
              </g>
            `,
  head: `
              <g filter="url(#marker)">
                <path d="M30 42 L33 8 L54 30Z M90 42 L87 8 L66 30Z" style="fill:var(--pet1)"/>
                <path d="M35 34 L36 17 L47 29Z M85 34 L84 17 L73 29Z" style="fill:var(--pet3)" opacity=".8"/>
                <path d="M27 50 C27 34 42 24 60 24 C78 24 93 34 93 50 L98 55 L92 57 L95 62 L88 62 C82 72 72 77 60 77 C48 77 38 72 32 62 L25 62 L28 57 L22 55Z" style="fill:var(--pet1)"/>
                <path d="M26 56 C34 74 52 80 60 70 C68 80 86 74 94 56 C82 62 70 60 60 52 C50 60 38 62 26 56Z" style="fill:var(--pet2)"/>
                <ellipse cx="37" cy="61" rx="5.5" ry="3.2" style="fill:var(--rose)" opacity=".75"/>
                <ellipse cx="83" cy="61" rx="5.5" ry="3.2" style="fill:var(--rose)" opacity=".75"/>
              </g>
              <g fill="none" style="stroke:var(--line)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" filter="url(#wob)">
                <path d="M30 42 L33 8 L54 30 M90 42 L87 8 L66 30"/>
                <path d="M27 50 C27 34 42 24 60 24 C78 24 93 34 93 50 L98 55 L92 57 L95 62 L88 62 C82 72 72 77 60 77 C48 77 38 72 32 62 L25 62 L28 57 L22 55 L27 50"/>
                <path d="M26 56 C38 62 50 60 60 52 C70 60 82 62 94 56" opacity=".6"/>
                <path d="M56 66 Q60 70 64 66"/>
                <path d="M57 32 l3 -4 l3 4" opacity=".55"/>
              </g>
              <g class="eyesOpen">
                <ellipse cx="46" cy="50" rx="4.6" ry="5.6" style="fill:var(--pet3)"/>
                <ellipse cx="74" cy="50" rx="4.6" ry="5.6" style="fill:var(--pet3)"/>
                <circle cx="47.6" cy="47.8" r="1.6" fill="#fff"/><circle cx="75.6" cy="47.8" r="1.6" fill="#fff"/>
              </g>
              <ellipse cx="60" cy="62" rx="4.2" ry="3.1" style="fill:var(--pet3)"/>
`,
  nap: `
            <g filter="url(#marker)">
              <path d="M40 74 C20 70 16 40 40 28 C64 14 118 14 140 32 C160 48 156 76 128 80 C100 84 62 82 40 74Z" style="fill:var(--pet1)"/>
              <path d="M150 62 C156 84 112 94 70 90 C46 88 26 84 20 76 C40 80 80 82 112 78 C134 75 146 70 150 62Z" style="fill:var(--pet1)"/>
              <path d="M20 76 C24 84 34 88 44 88 L40 84 L46 82 L40 78 L46 75 C36 77 26 77 20 76Z" style="fill:var(--pet2)"/>
              <path d="M30 40 C30 26 44 20 56 22 L60 4 L70 24 C78 30 80 44 72 54 C64 64 44 66 34 58Z" style="fill:var(--pet1)"/>
              <path d="M34 58 C42 50 54 50 62 56 C56 64 42 66 34 58Z" style="fill:var(--pet2)"/>
            </g>
            <g fill="none" style="stroke:var(--line)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" filter="url(#wob)">
              <path d="M70 24 C96 14 128 18 140 32 C160 48 156 76 128 80"/>
              <path d="M150 62 C156 84 112 94 70 90 C46 88 26 84 20 76 C40 80 80 82 112 78 C134 75 146 70 150 62"/>
              <path d="M40 84 L46 82 L40 78 L46 75"/>
              <path d="M30 40 C30 26 44 20 56 22 L60 4 L70 24 C78 30 80 44 72 54 C64 64 44 66 34 58 C30 52 29 46 30 40"/>
              <path d="M40 40 Q45 44 50 40"/>
              <path d="M100 40 q8 6 10 14 M118 46 q6 5 6 12" opacity=".5"/>
            </g>
            <ellipse cx="35" cy="56" rx="3.2" ry="2.4" style="fill:var(--pet3)"/>
            <ellipse cx="52" cy="47" rx="4.5" ry="2.6" style="fill:var(--rose)" opacity=".7"/>
          `,
  stand: `
                <g class="mtail"><path d="M5 -5 c10 1 13 -9 9 -14 c-2 4 -5 6 -9 7z" style="fill:var(--pet1)"/><path d="M14 -19 c-1 3 -2 4 -4 5 l3 -1 l0 2 c2 -2 2 -4 1 -6z" style="fill:var(--pet2)"/></g>
                <ellipse cx="0" cy="-6.5" rx="7.5" ry="6.5" style="fill:var(--pet1)"/>
                <ellipse cx="0" cy="-5" rx="3.6" ry="4" style="fill:var(--pet2)" stroke="none"/>
                <ellipse cx="-3" cy="-0.8" rx="2.4" ry="1.4" style="fill:var(--pet3)"/><ellipse cx="3" cy="-0.8" rx="2.4" ry="1.4" style="fill:var(--pet3)"/>
                <path d="M-7 -17 l1 -9 l5 5z M7 -17 l-1 -9 l-5 5z" style="fill:var(--pet1)"/>
                <ellipse cx="0" cy="-16" rx="8" ry="6.6" style="fill:var(--pet1)"/>
                <path d="M-7.6 -15 c2 4.5 5 5.6 7.6 3.4 c2.6 2.2 5.6 1.1 7.6 -3.4 c-3 1.4 -5.6 0.8 -7.6 -1.4 c-2 2.2 -4.6 2.8 -7.6 1.4z" style="fill:var(--pet2)" stroke="none"/>
                <circle cx="-3" cy="-17" r="1.1" style="fill:var(--pet3)" stroke="none"/><circle cx="3" cy="-17" r="1.1" style="fill:var(--pet3)" stroke="none"/>
                <ellipse cx="0" cy="-13.4" rx="1.2" ry=".9" style="fill:var(--pet3)" stroke="none"/>
              `,
  curl: `
                <path d="M-11 -2 c-2 -9 6 -13 13 -12 c8 1 12 6 10 11 c-2 3 -9 4 -14 3.5 c-4 -.4 -8 -.6 -9 -2.5z" style="fill:var(--pet1)"/>
                <path d="M12 -3 c1 5 -10 6 -19 4.6 c-3 -.4 -5 -1 -6 -2 c7 .8 17 .4 25 -2.6z" style="fill:var(--pet1)"/>
                <path d="M-13 -0.4 c1 2 3 2.6 5 2.4 l-1 -1 l2 -1 l-2 -1z" style="fill:var(--pet2)"/>
                <path d="M-9 -8 c0 -4 3 -6 6 -5.4 l1.4 -4.6 l2.6 5 c1.6 2 1.4 5 -1 7 c-3 2 -7 1.6 -9 -2z" style="fill:var(--pet1)"/>
                <path d="M-6.6 -7.4 q1.4 1.2 2.8 0" fill="none" stroke-width=".9"/>
              `,
  peek: `<g style="stroke:var(--line)" stroke-width="1" stroke-linejoin="round"><path d="M-6 -3 l1 -7 l4 4z M6 -3 l-1 -7 l-4 4z" style="fill:var(--pet1)"/><ellipse cx="0" cy="0" rx="7" ry="5.6" style="fill:var(--pet1)"/><path d="M-6.6 1 c2 3.6 4.4 4.4 6.6 2.6 c2.2 1.8 4.6 1 6.6 -2.6 c-2.6 1.2 -4.8 .6 -6.6 -1.2 c-1.8 1.8 -4 2.4 -6.6 1.2z" style="fill:var(--pet2)" stroke="none"/><circle cx="-2.6" cy="-1" r="1" style="fill:var(--pet3)" stroke="none"/><circle cx="2.6" cy="-1" r="1" style="fill:var(--pet3)" stroke="none"/></g>`
};
// the other four are drawn in pets-art.js, in the same frames
import { RABBIT, TORTOISE, QUOKKA, CAPYBARA } from "./pets-art.js";
export const PET_ART = {fox: FOX, rabbit: RABBIT, tortoise: TORTOISE, quokka: QUOKKA, capybara: CAPYBARA};
export const petArt = kind => PET_ART[kind] || FOX;
// lines written for any pet: {pet} is its name, {kind} what it is ("fox", "capybara")
export const petify = (s, F) => String(s ?? "").replace(/\{pet\}/g, (F && F.name) || "your pet").replace(/\{kind\}/g, SPECIES[speciesOf(F)].n.toLowerCase());
