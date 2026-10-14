// Rabbit, tortoise, quokka and capybara: the same five drawings as the fox (see pets.js for the frames).
// Kept free of imports: pets.js imports this file.
const FILL = `filter="url(#marker)"`;
const INK = `fill="none" style="stroke:var(--line)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" filter="url(#wob)"`;

export const RABBIT = {
  tail: `
              <g ${FILL}>
                <path d="M80 110 C74 104 78 94 86 94 C88 88 98 88 100 94 C108 94 110 104 104 108 C104 116 94 118 90 114 C86 118 78 116 80 110Z" style="fill:var(--pet2)"/>
              </g>
              <g ${INK}>
                <path d="M80 110 C74 104 78 94 86 94 C88 88 98 88 100 94 C108 94 110 104 104 108 C104 116 94 118 90 114 C86 118 78 116 80 110Z"/>
                <path d="M88 101 q3 -2 6 0 M92 108 q3 -2 5 0" opacity=".45"/>
              </g>
            `,
  body: `
              <g ${FILL}>
                <path d="M34 100 C30 80 42 70 60 70 C78 70 90 80 86 100 C84 112 76 118 60 118 C44 118 36 112 34 100Z" style="fill:var(--pet1)"/>
                <ellipse cx="60" cy="100" rx="15" ry="16" style="fill:var(--pet2)"/>
                <ellipse cx="42" cy="115" rx="12" ry="4.6" style="fill:var(--pet1)"/>
                <ellipse cx="78" cy="115" rx="12" ry="4.6" style="fill:var(--pet1)"/>
                              </g>
              <g ${INK}>
                <path d="M34 100 C30 80 42 70 60 70 C78 70 90 80 86 100 C84 112 76 118 60 118 C44 118 36 112 34 100"/>
                <path d="M30 116 C30 110 42 109 54 113 C52 119 34 120 30 116 M90 116 C90 110 78 109 66 113 C68 119 86 120 90 116"/>
                <path d="M40 94 q-2 5 0 9 M80 94 q2 5 0 9" opacity=".55"/>
              </g>
            `,
  head: `
              <g ${FILL}>
                <path d="M38 34 C30 16 30 -2 41 -4 C51 -5 54 14 52 32Z M82 34 C90 16 90 -2 79 -4 C69 -5 66 14 68 32Z" style="fill:var(--pet1)"/>
                <path d="M41 28 C37 16 37 3 42 1 C47 1 48 16 47 28Z M79 28 C83 16 83 3 78 1 C73 1 72 16 73 28Z" style="fill:var(--rose)" opacity=".7"/>
                <path d="M29 54 C29 36 43 27 60 27 C77 27 91 36 91 54 C91 69 78 77 60 77 C42 77 29 69 29 54Z" style="fill:var(--pet1)"/>
                <path d="M49 66 C49 59 55 57 60 60 C65 57 71 59 71 66 C71 72 65 74 60 72 C55 74 49 72 49 66Z" style="fill:var(--pet2)"/>
                <ellipse cx="38" cy="62" rx="5.5" ry="3.2" style="fill:var(--rose)" opacity=".75"/>
                <ellipse cx="82" cy="62" rx="5.5" ry="3.2" style="fill:var(--rose)" opacity=".75"/>
              </g>
              <g ${INK}>
                <path d="M38 34 C30 16 30 -2 41 -4 C51 -5 54 14 52 32 M82 34 C90 16 90 -2 79 -4 C69 -5 66 14 68 32"/>
                <path d="M29 54 C29 36 43 27 60 27 C77 27 91 36 91 54 C91 69 78 77 60 77 C42 77 29 69 29 54"/>
                <path d="M60 62 v3.4 M54 66 Q57 69.5 60 65.4 Q63 69.5 66 66"/>
                <path d="M49 63 L35 60 M49 66.5 L36 68.5 M71 63 L85 60 M71 66.5 L84 68.5" stroke-width="1.1" opacity=".6"/>
                <path d="M55 33 q5 -3 10 0" opacity=".45"/>
              </g>
              <g class="eyesOpen">
                <ellipse cx="46" cy="50" rx="4.6" ry="5.6" style="fill:var(--pet3)"/>
                <ellipse cx="74" cy="50" rx="4.6" ry="5.6" style="fill:var(--pet3)"/>
                <circle cx="47.6" cy="47.8" r="1.6" fill="#fff"/><circle cx="75.6" cy="47.8" r="1.6" fill="#fff"/>
              </g>
              <path d="M56.4 59.2 Q60 57.4 63.6 59.2 Q62.4 62.6 60 63 Q57.6 62.6 56.4 59.2Z" fill="#E48A9A" style="stroke:var(--line)" stroke-width="1" stroke-linejoin="round"/>
`,
  nap: `
            <g ${FILL}>
              <path d="M44 88 C28 84 28 54 50 40 C72 26 120 24 140 42 C156 56 154 84 132 89 C104 93 66 92 44 88Z" style="fill:var(--pet1)"/>
              <path d="M140 66 C136 58 142 52 148 54 C154 50 162 56 160 62 C164 68 158 76 152 74 C148 78 140 74 140 66Z" style="fill:var(--pet2)"/>
              <ellipse cx="112" cy="88" rx="17" ry="5" style="fill:var(--pet1)"/>
              <path d="M58 44 C70 28 98 20 112 24 C116 30 102 38 88 42 C78 45 66 48 58 46Z" style="fill:var(--pet1)"/>
              <path d="M22 66 C20 48 34 39 50 39 C66 39 78 49 78 63 C78 77 64 87 48 87 C32 87 23 78 22 66Z" style="fill:var(--pet1)"/>
              <path d="M52 46 C64 30 92 24 104 28 C106 34 92 40 80 44 C70 48 60 50 52 50Z" style="fill:var(--pet1)"/>
              <path d="M58 46 C70 36 88 31 98 31 C92 36 78 42 62 48Z" style="fill:var(--rose)" opacity=".6"/>
              <ellipse cx="32" cy="74" rx="10" ry="7.5" style="fill:var(--pet2)"/>
            </g>
            <g ${INK}>
              <path d="M78 34 C96 26 124 28 140 42 C156 56 154 84 132 89 C104 93 66 92 52 89"/>
              <path d="M140 66 C136 58 142 52 148 54 C154 50 162 56 160 62 C164 68 158 76 152 74 C148 78 140 74 140 66"/>
              <path d="M96 88 C96 82 108 82 124 85 C130 88 128 93 112 93 C102 93 96 92 96 88"/>
              <path d="M22 66 C20 48 34 39 50 39 C66 39 78 49 78 63 C78 77 64 87 48 87 C32 87 23 78 22 66"/>
              <path d="M52 50 C60 50 70 48 80 44 C92 40 106 34 104 28 C92 24 64 30 52 46"/>
              <path d="M40 60 Q45 64 50 60"/>
              <path d="M32 74 v3 M28 79 q2 2 4 -1 q2 3 4 1"/>
              <path d="M24 72 L12 70 M24 76 L13 79" stroke-width="1.1" opacity=".55"/>
              <path d="M100 48 q8 6 10 14 M118 52 q6 5 6 12" opacity=".5"/>
            </g>
            <path d="M28.6 70.6 Q32 69 35.4 70.6 Q34.2 73.4 32 73.8 Q29.8 73.4 28.6 70.6Z" fill="#E48A9A"/>
            <ellipse cx="54" cy="70" rx="4.5" ry="2.6" style="fill:var(--rose)" opacity=".7"/>
          `,
  stand: `
                <g class="mtail"><circle cx="7" cy="-4.5" r="3.2" style="fill:var(--pet2)"/></g>
                <ellipse cx="0" cy="-6.5" rx="7.2" ry="6.6" style="fill:var(--pet1)"/>
                <ellipse cx="0" cy="-5.2" rx="3.6" ry="4" style="fill:var(--pet2)" stroke="none"/>
                <ellipse cx="-3.6" cy="-0.9" rx="3" ry="1.4" style="fill:var(--pet1)"/><ellipse cx="3.6" cy="-0.9" rx="3" ry="1.4" style="fill:var(--pet1)"/>
                <path d="M-4.4 -19 c-2.4 -5 -2 -11 .4 -11.4 c2.4 -.2 3 5.6 2.4 11.4z M4.4 -19 c2.4 -5 2 -11 -.4 -11.4 c-2.4 -.2 -3 5.6 -2.4 11.4z" style="fill:var(--pet1)"/>
                <path d="M-3.3 -21 c-1 -3 -.8 -6.4 .2 -7 c1 .6 1.2 4 1 7z M3.3 -21 c1 -3 .8 -6.4 -.2 -7 c-1 .6 -1.2 4 -1 7z" style="fill:var(--rose)" stroke="none" opacity=".75"/>
                <ellipse cx="0" cy="-15" rx="7.2" ry="6.2" style="fill:var(--pet1)"/>
                <ellipse cx="0" cy="-12.2" rx="3" ry="2.2" style="fill:var(--pet2)" stroke="none"/>
                <circle cx="-2.9" cy="-16" r="1.1" style="fill:var(--pet3)" stroke="none"/><circle cx="2.9" cy="-16" r="1.1" style="fill:var(--pet3)" stroke="none"/>
                <ellipse cx="0" cy="-13.2" rx="1.1" ry=".8" fill="#E48A9A" stroke="none"/>
              `,
  curl: `
                <circle cx="11.5" cy="-4" r="2.8" style="fill:var(--pet2)"/>
                <path d="M-11 -1 c-1 -8 5 -12 11 -12 c7 0 12 4 12 9 c0 3 -3 4 -6 4 h-15 c-1 0 -2 -.4 -2 -1z" style="fill:var(--pet1)"/>
                <path d="M-12 -4.6 c0 -3.6 2.6 -6 6 -6 c3.4 0 5.6 2.4 5.6 5.6 c0 3 -2.4 5 -5.6 5 c-3.6 0 -6 -1.6 -6 -4.6z" style="fill:var(--pet1)"/>
                <path d="M-5 -9.6 c3 -3.4 9 -4.6 12 -3.6 c-1 2 -6 4 -10.6 4.8z" style="fill:var(--pet1)"/>
                <path d="M-9 -6 q1.4 1.2 2.8 0" fill="none" stroke-width=".9"/>
                <ellipse cx="-11.2" cy="-3.6" rx=".9" ry=".7" fill="#E48A9A" stroke="none"/>
              `,
  peek: `<g style="stroke:var(--line)" stroke-width="1" stroke-linejoin="round"><path d="M-3.8 -3 c-2.2 -5 -1.8 -10 .2 -10.4 c2 -.2 2.6 5 2 10.4z M3.8 -3 c2.2 -5 1.8 -10 -.2 -10.4 c-2 -.2 -2.6 5 -2 10.4z" style="fill:var(--pet1)"/><path d="M-2.8 -5 c-.8 -2.6 -.6 -5.6 .2 -6 c.8 .5 1 3.4 .8 6z M2.8 -5 c.8 -2.6 .6 -5.6 -.2 -6 c-.8 .5 -1 3.4 -.8 6z" style="fill:var(--rose)" stroke="none" opacity=".75"/><ellipse cx="0" cy="0" rx="6.8" ry="5.6" style="fill:var(--pet1)"/><ellipse cx="0" cy="2.6" rx="2.8" ry="2" style="fill:var(--pet2)" stroke="none"/><circle cx="-2.6" cy="-1" r="1" style="fill:var(--pet3)" stroke="none"/><circle cx="2.6" cy="-1" r="1" style="fill:var(--pet3)" stroke="none"/><ellipse cx="0" cy="1.7" rx=".9" ry=".7" fill="#E48A9A" stroke="none"/></g>`
};

// the shell's patches: a deeper green over var(--pet1)
const PATCH = `fill="#5F7140" opacity=".45"`;
export const TORTOISE = {
  tail: `
              <g ${FILL}>
                <path d="M86 106 C94 106 102 104 108 98 C104 108 96 112 86 113Z" style="fill:var(--pet2)"/>
              </g>
              <g ${INK}>
                <path d="M86 106 C94 106 102 104 108 98 C104 108 96 112 86 113"/>
              </g>
            `,
  body: `
              <g ${FILL}>
                <path d="M20 104 C18 80 36 64 60 64 C84 64 102 80 100 104Z" style="fill:var(--pet1)"/>
                <path d="M24 92 C26 82 32 76 40 72 L46 86 L38 98 L24 98Z M96 92 C94 82 88 76 80 72 L74 86 L82 98 L96 98Z" ${PATCH}/>
                <path d="M16 104 C16 100 18 98 22 98 L98 98 C102 98 104 100 104 104 C104 110 98 112 92 112 L28 112 C22 112 16 110 16 104Z" style="fill:var(--pet2)"/>
                <path d="M42 98 C42 84 50 80 60 80 C70 80 78 84 78 98Z" style="fill:var(--pet3)" opacity=".8"/>
                <path d="M50 66 L70 66 L71 96 C64 99 56 99 49 96Z" style="fill:var(--pet2)"/>
                <path d="M30 104 C28 112 28 118 38 118 C48 118 48 112 46 104Z M90 104 C92 112 92 118 82 118 C72 118 72 112 74 104Z" style="fill:var(--pet2)"/>
              </g>
              <g ${INK}>
                <path d="M22 98 C20 78 38 64 60 64 C82 64 100 78 98 98"/>
                <path d="M24 98 L38 98 L46 86 L40 72 M96 98 L82 98 L74 86 L80 72" opacity=".7"/>
                <path d="M42 98 C42 84 50 80 60 80 C70 80 78 84 78 98"/>
                <path d="M16 104 C16 100 18 98 22 98 L98 98 C102 98 104 100 104 104 C104 110 98 112 92 112 L28 112 C22 112 16 110 16 104"/>
                <path d="M30 104 C28 112 28 118 38 118 C48 118 48 112 46 104 M90 104 C92 112 92 118 82 118 C72 118 72 112 74 104"/>
                <path d="M34 116 v-2.4 M38 117 v-2.4 M42 116 v-2.4 M78 116 v-2.4 M82 117 v-2.4 M86 116 v-2.4" opacity=".7"/>
                <path d="M50 70 L49 96 M70 70 L71 96"/>
                <path d="M55 90 q5 2.4 10 0" opacity=".45"/>
              </g>
            `,
  head: `
              <g ${FILL}>
                <path d="M33 51 C33 34 45 25 60 25 C75 25 87 34 87 51 C87 67 75 76 60 76 C45 76 33 67 33 51Z" style="fill:var(--pet2)"/>
                <ellipse cx="53" cy="33" rx="3.4" ry="2.4" style="fill:var(--pet1)" opacity=".6"/>
                <ellipse cx="62" cy="30.5" rx="3.4" ry="2.4" style="fill:var(--pet1)" opacity=".6"/>
                <ellipse cx="70" cy="34" rx="3" ry="2.2" style="fill:var(--pet1)" opacity=".6"/>
                <ellipse cx="40" cy="61" rx="5.2" ry="3.1" style="fill:var(--rose)" opacity=".75"/>
                <ellipse cx="80" cy="61" rx="5.2" ry="3.1" style="fill:var(--rose)" opacity=".75"/>
              </g>
              <g ${INK}>
                <path d="M33 51 C33 34 45 25 60 25 C75 25 87 34 87 51 C87 67 75 76 60 76 C45 76 33 67 33 51"/>
                <path d="M49 64 Q60 72 71 64"/>
                <path d="M47.5 63 q1.5 1 2.6 2 M72.5 63 q-1.5 1 -2.6 2" opacity=".6"/>
              </g>
              <g class="eyesOpen">
                <ellipse cx="47" cy="50" rx="4.4" ry="5.4" style="fill:var(--pet3)"/>
                <ellipse cx="73" cy="50" rx="4.4" ry="5.4" style="fill:var(--pet3)"/>
                <circle cx="48.5" cy="47.8" r="1.5" fill="#fff"/><circle cx="74.5" cy="47.8" r="1.5" fill="#fff"/>
              </g>
              <circle cx="57" cy="59" r="1.3" style="fill:var(--pet3)"/><circle cx="63" cy="59" r="1.3" style="fill:var(--pet3)"/>
`,
  nap: `
            <g ${FILL}>
              <path d="M22 78 C22 40 54 16 86 16 C118 16 150 40 150 78Z" style="fill:var(--pet1)"/>
              <path d="M70 28 L102 28 L114 50 L102 72 L70 72 L58 50Z" ${PATCH}/>
              <path d="M30 70 C32 54 40 40 52 32 L58 50 L48 72 L34 72Z M142 70 C140 54 132 40 120 32 L114 50 L124 72 L138 72Z" ${PATCH}/>
              <path d="M38 88 q6 6 14 0Z M120 88 q6 6 14 0Z" style="fill:var(--pet2)"/>
              <path d="M14 82 C14 78 17 75 22 75 L150 75 C155 75 158 78 158 82 C158 88 152 91 146 91 L26 91 C20 91 14 88 14 82Z" style="fill:var(--pet2)"/>
              <path d="M20 76 C20 66 28 62 36 64 C42 66 42 74 40 76Z" style="fill:var(--pet3)" opacity=".85"/>
              <path d="M24 76 C24 70 28 67 33 68 C38 69 39 74 38 76Z" style="fill:var(--pet2)"/>
            </g>
            <g ${INK}>
              <path d="M22 75 C24 40 54 16 86 16 C118 16 148 40 150 75"/>
              <path d="M58 50 L70 28 L102 28 L114 50 L102 72 L70 72 L58 50 M58 50 L52 32 M48 72 L58 50 M114 50 L120 32 M124 72 L114 50" opacity=".7"/>
              <path d="M14 82 C14 78 17 75 22 75 L150 75 C155 75 158 78 158 82 C158 88 152 91 146 91 L26 91 C20 91 14 88 14 82"/>
              <path d="M20 76 C20 66 28 62 36 64 C42 66 42 74 40 76"/>
              <path d="M27.5 72 q2 1.6 4 0"/>
              <path d="M38 91 q6 4 14 0 M120 91 q6 4 14 0"/>
              <path d="M150 83 l7 -1" opacity=".6"/>
            </g>
          `,
  stand: `
                <g class="mtail"><path d="M10 -3.4 l4.6 .4 l-4.4 1.8z" style="fill:var(--pet2)"/></g>
                <path d="M-8.6 -3 v3 h3.6 v-3z M5 -3 v3 h3.6 v-3z" style="fill:var(--pet2)"/>
                <path d="M-9 -6 c-2 -1 -3.4 -2.4 -4 -4" style="stroke:var(--line)" stroke-width="4.2" stroke-linecap="round" fill="none"/>
                <path d="M-9 -6 c-2 -1 -3.4 -2.4 -4 -4" style="stroke:var(--pet2)" stroke-width="2.4" stroke-linecap="round" fill="none"/>
                <path d="M-10.4 -4 C-10.4 -12 -5 -16 0.6 -16 C6.2 -16 11.4 -12 11.4 -4Z" style="fill:var(--pet1)"/>
                <path d="M-3.6 -13.4 h7.6 l2 3.6 l-2 3.6 h-7.6 l-2 -3.6z" fill="#5F7140" opacity=".5" stroke="none"/>
                <path d="M-11.6 -4.2 h24.2 c.8 0 1 1.8 0 2.4 h-24.2 c-1 -.6 -.8 -2.4 0 -2.4z" style="fill:var(--pet2)"/>
                <ellipse cx="-13.6" cy="-11.6" rx="4.4" ry="3.8" style="fill:var(--pet2)"/>
                <circle cx="-14.6" cy="-12.4" r="1" style="fill:var(--pet3)" stroke="none"/>
                <path d="M-17.2 -10 q1.4 1 2.8 .2" fill="none" stroke-width=".7"/>
              `,
  curl: `
                <path d="M-10.4 -4 C-10.4 -12 -5 -16 0.6 -16 C6.2 -16 11.4 -12 11.4 -4Z" style="fill:var(--pet1)"/>
                <path d="M-3.6 -13.4 h7.6 l2 3.6 l-2 3.6 h-7.6 l-2 -3.6z" fill="#5F7140" opacity=".5" stroke="none"/>
                <path d="M-9.6 -4 c0 -2.6 1.4 -3.8 3.2 -3.8 c1.8 0 2.8 1.4 2.8 3.8z" style="fill:var(--pet3)" opacity=".85" stroke="none"/>
                <path d="M-8.4 -4 c0 -1.4 .8 -2.4 1.8 -2.4 c1 0 1.8 1 1.8 2.4z" style="fill:var(--pet2)" stroke="none"/>
                <path d="M-11.6 -4.2 h24.2 c.8 0 1 1.8 0 2.4 h-24.2 c-1 -.6 -.8 -2.4 0 -2.4z" style="fill:var(--pet2)"/>
                <path d="M-8 -1.8 q1.6 1.6 3.2 0 M5 -1.8 q1.6 1.6 3.2 0" style="fill:var(--pet2)"/>
              `,
  peek: `<g style="stroke:var(--line)" stroke-width="1" stroke-linejoin="round"><path d="M-8 7 C-8 3 -4 2 0 2 C4 2 8 3 8 7Z" style="fill:var(--pet1)"/><path d="M-2.6 3 v3 M2.6 3 v3" fill="none"/><ellipse cx="0" cy="-.6" rx="6" ry="5.4" style="fill:var(--pet2)"/><ellipse cx="-1.4" cy="-4.4" rx="1.2" ry=".8" style="fill:var(--pet1)" stroke="none" opacity=".7"/><ellipse cx="1.6" cy="-4.8" rx="1.2" ry=".8" style="fill:var(--pet1)" stroke="none" opacity=".7"/><circle cx="-2.4" cy="-1" r="1" style="fill:var(--pet3)" stroke="none"/><circle cx="2.4" cy="-1" r="1" style="fill:var(--pet3)" stroke="none"/><path d="M-1.8 1.8 q1.8 1.4 3.6 0" fill="none" stroke-width=".7"/></g>`
};

export const QUOKKA = {
  tail: `
              <g ${FILL}>
                <path d="M80 110 C92 116 108 116 118 106 C120 110 110 120 96 120 C88 120 82 118 78 116Z" style="fill:var(--pet1)"/>
              </g>
              <g ${INK}>
                <path d="M80 110 C92 116 108 116 118 106 C120 110 110 120 96 120 C88 120 82 118 78 116"/>
              </g>
            `,
  body: `
              <g ${FILL}>
                <path d="M35 106 C31 88 42 71 60 71 C78 71 89 88 85 106 C83 114 74 118 60 118 C46 118 37 114 35 106Z" style="fill:var(--pet1)"/>
                <ellipse cx="60" cy="101" rx="15" ry="16" style="fill:var(--pet2)"/>
                <ellipse cx="44" cy="115" rx="11" ry="4.6" style="fill:var(--pet3)" opacity=".85"/>
                <ellipse cx="76" cy="115" rx="11" ry="4.6" style="fill:var(--pet3)" opacity=".85"/>
                <ellipse cx="54.5" cy="97" rx="4.4" ry="3.4" style="fill:var(--pet1)"/>
                <ellipse cx="65.5" cy="97" rx="4.4" ry="3.4" style="fill:var(--pet1)"/>
              </g>
              <g ${INK}>
                <path d="M35 106 C31 88 42 71 60 71 C78 71 89 88 85 106 C83 114 74 118 60 118 C46 118 37 114 35 106"/>
                <path d="M44 86 Q45 94 50.4 96.6 M76 86 Q75 94 69.6 96.6"/>
                <path d="M50.2 97 C50.2 93.6 58.8 93.6 58.8 97 C58.8 100 50.2 100 50.2 97 M61.2 97 C61.2 93.6 69.8 93.6 69.8 97 C69.8 100 61.2 100 61.2 97"/>
                <path d="M34 116 C34 111 44 110 54 113 C54 119 36 120 34 116 M86 116 C86 111 76 110 66 113 C66 119 84 120 86 116"/>
                <path d="M41 98 q-2 5 0 9 M79 98 q2 5 0 9" opacity=".55"/>
              </g>
            `,
  head: `
              <g ${FILL}>
                <circle cx="38" cy="30" r="7.6" style="fill:var(--pet1)"/>
                <circle cx="82" cy="30" r="7.6" style="fill:var(--pet1)"/>
                <circle cx="38.4" cy="30.6" r="4" style="fill:var(--pet3)" opacity=".5"/>
                <circle cx="81.6" cy="30.6" r="4" style="fill:var(--pet3)" opacity=".5"/>
                <path d="M30 48 C30 34 44 26 60 26 C76 26 90 34 90 48 C90 58 82 64 76 68 C72 73 67 77 60 77 C53 77 48 73 44 68 C38 64 30 58 30 48Z" style="fill:var(--pet1)"/>
                <path d="M45 64 C45 57 53 55 60 58 C67 55 75 57 75 64 C75 71 68 76.5 60 76.5 C52 76.5 45 71 45 64Z" style="fill:var(--pet2)"/>
                <ellipse cx="38.5" cy="58.5" rx="5" ry="3" style="fill:var(--rose)" opacity=".8"/>
                <ellipse cx="81.5" cy="58.5" rx="5" ry="3" style="fill:var(--rose)" opacity=".8"/>
                <path d="M51.5 65 Q60 74.6 68.5 65 Q60 68.4 51.5 65Z" style="fill:var(--pet3)" opacity=".85"/>
              </g>
              <g ${INK}>
                <path d="M31.6 34.4 C29 28 33 22 39 22.6 C42.6 23 45 25.4 45.6 28.4 M88.4 34.4 C91 28 87 22 81 22.6 C77.4 23 75 25.4 74.4 28.4"/>
                <path d="M30 48 C30 34 44 26 60 26 C76 26 90 34 90 48 C90 58 82 64 76 68 C72 73 67 77 60 77 C53 77 48 73 44 68 C38 64 30 58 30 48"/>
                <path d="M60 61.4 v3.6 M48.6 63 q1.4 2.4 2.9 2 Q60 74.6 68.5 65 q1.5 .4 2.9 -2"/>
                <path d="M55 32 q5 -3 10 0 M36 44 q2 -2 4 -2 M84 44 q-2 -2 -4 -2" opacity=".45"/>
              </g>
              <g class="eyesOpen">
                <ellipse cx="46.5" cy="49" rx="4.2" ry="5.2" style="fill:var(--pet3)"/>
                <ellipse cx="73.5" cy="49" rx="4.2" ry="5.2" style="fill:var(--pet3)"/>
                <circle cx="48" cy="46.8" r="1.5" fill="#fff"/><circle cx="75" cy="46.8" r="1.5" fill="#fff"/>
              </g>
              <path d="M54.6 58.6 C54.6 55.4 65.4 55.4 65.4 58.6 C65.4 61.2 62.4 62.4 60 62.4 C57.6 62.4 54.6 61.2 54.6 58.6Z" style="fill:var(--pet3)"/>
`,
  nap: `
            <g ${FILL}>
              <path d="M150 64 C156 84 112 94 66 91 C50 90 40 89 34 87 C52 86 90 85 116 81 C134 78 146 72 150 64Z" style="fill:var(--pet1)"/>
              <path d="M40 76 C20 70 18 40 42 28 C66 14 118 14 140 32 C160 48 156 76 128 82 C100 86 62 84 40 76Z" style="fill:var(--pet1)"/>
              <ellipse cx="118" cy="84" rx="15" ry="4.6" style="fill:var(--pet3)" opacity=".85"/>
              <circle cx="64" cy="26" r="9" style="fill:var(--pet1)"/>
              <circle cx="64" cy="26.4" r="4.8" style="fill:var(--pet2)"/>
              <path d="M24 48 C24 34 36 25 50 25 C64 25 76 35 75 49 C74 63 62 70 48 70 C34 70 24 61 24 48Z" style="fill:var(--pet1)"/>
              <ellipse cx="36" cy="58" rx="11" ry="7.6" style="fill:var(--pet2)"/>
              <ellipse cx="50" cy="72" rx="6" ry="3.4" style="fill:var(--pet3)" opacity=".85"/>
            </g>
            <g ${INK}>
              <path d="M150 64 C156 84 112 94 66 91 C50 90 40 89 34 87 C52 86 90 85 116 81 C134 78 146 72 150 64"/>
              <path d="M74 22 C98 14 128 20 140 32 C160 48 156 76 128 82"/>
              <path d="M104 84 C104 80 112 79 126 82 C134 85 130 89 118 89 C108 89 104 88 104 84"/>
              <path d="M56 21 C60 15 70 16 72 23 C73 27 72 30 70 32"/>
              <path d="M24 48 C24 34 36 25 50 25 C64 25 76 35 75 49 C74 63 62 70 48 70 C34 70 24 61 24 48"/>
              <path d="M42 42 Q47 46 52 42"/>
              <path d="M31 60 q1 1.6 2.4 1.4 Q37 64 41 61 q1.2 .2 2 -1.4"/>
              <path d="M44 70 C44 68 52 68 56 72 C54 76 46 76 44 72" opacity=".8"/>
              <path d="M100 42 q8 6 10 14 M118 48 q6 5 6 12" opacity=".5"/>
            </g>
            <ellipse cx="28" cy="55" rx="3.4" ry="2.6" style="fill:var(--pet3)"/>
            <ellipse cx="55" cy="54" rx="4.5" ry="2.6" style="fill:var(--rose)" opacity=".7"/>
          `,
  stand: `
                <g class="mtail"><path d="M5 -2.4 c4 1.4 9 1.2 11.6 -1.4 c-1.4 3 -6.6 4.4 -11.6 3.4z" style="fill:var(--pet1)"/></g>
                <path d="M-7.4 -4 C-7.6 -10 -4.6 -13 0 -13 C4.6 -13 7.6 -10 7.4 -4 C7 -1 4 0 0 0 C-4 0 -7 -1 -7.4 -4Z" style="fill:var(--pet1)"/>
                <ellipse cx="0" cy="-5" rx="3.8" ry="4.2" style="fill:var(--pet2)" stroke="none"/>
                <ellipse cx="-3.4" cy="-0.8" rx="2.8" ry="1.4" style="fill:var(--pet3)"/><ellipse cx="3.4" cy="-0.8" rx="2.8" ry="1.4" style="fill:var(--pet3)"/>
                <circle cx="-5.6" cy="-20.4" r="2.8" style="fill:var(--pet1)"/><circle cx="5.6" cy="-20.4" r="2.8" style="fill:var(--pet1)"/>
                <circle cx="-5.4" cy="-20.2" r="1.3" style="fill:var(--pet2)" stroke="none"/><circle cx="5.4" cy="-20.2" r="1.3" style="fill:var(--pet2)" stroke="none"/>
                <ellipse cx="0" cy="-15.6" rx="7.4" ry="6.2" style="fill:var(--pet1)"/>
                <ellipse cx="0" cy="-12.8" rx="3.8" ry="2.8" style="fill:var(--pet2)" stroke="none"/>
                <circle cx="-2.9" cy="-16.6" r="1.1" style="fill:var(--pet3)" stroke="none"/><circle cx="2.9" cy="-16.6" r="1.1" style="fill:var(--pet3)" stroke="none"/>
                <ellipse cx="0" cy="-14" rx="1.3" ry=".9" style="fill:var(--pet3)" stroke="none"/>
                <path d="M-2 -12.6 q2 2 4 0" fill="none" stroke-width=".8"/>
                <ellipse cx="-1.8" cy="-6.6" rx="1.2" ry="1" style="fill:var(--pet3)" stroke="none"/><ellipse cx="1.8" cy="-6.6" rx="1.2" ry="1" style="fill:var(--pet3)" stroke="none"/>
              `,
  curl: `
                <path d="M12 -3 c2 4 -8 5.6 -16 4.8 c-3 -.3 -6 -1 -7 -2 c7 .6 15 .2 23 -2.8z" style="fill:var(--pet1)"/>
                <path d="M-11 -2 c-2 -9 6 -13 13 -12 c8 1 12 6 10 11 c-2 3 -9 4 -14 3.5 c-4 -.4 -8 -.6 -9 -2.5z" style="fill:var(--pet1)"/>
                <circle cx="-1.6" cy="-12.6" r="2.4" style="fill:var(--pet1)"/>
                <path d="M-9.6 -7.6 c0 -3.6 2.6 -5.6 5.6 -5.6 c3 0 5.4 2.2 5 5.4 c-.4 2.6 -2.6 4.2 -5.4 4.2 c-3 0 -5.2 -1.4 -5.2 -4z" style="fill:var(--pet1)"/>
                <ellipse cx="-7" cy="-5.4" rx="2.6" ry="1.8" style="fill:var(--pet2)" stroke="none"/>
                <path d="M-6 -8.2 q1.4 1.2 2.8 0" fill="none" stroke-width=".9"/>
              `,
  peek: `<g style="stroke:var(--line)" stroke-width="1" stroke-linejoin="round"><circle cx="-5" cy="-4.4" r="2.6" style="fill:var(--pet1)"/><circle cx="5" cy="-4.4" r="2.6" style="fill:var(--pet1)"/><ellipse cx="0" cy="0" rx="6.8" ry="5.6" style="fill:var(--pet1)"/><ellipse cx="0" cy="2.4" rx="3.6" ry="2.6" style="fill:var(--pet2)" stroke="none"/><circle cx="-2.6" cy="-1" r="1" style="fill:var(--pet3)" stroke="none"/><circle cx="2.6" cy="-1" r="1" style="fill:var(--pet3)" stroke="none"/><ellipse cx="0" cy="1.3" rx="1.2" ry=".8" style="fill:var(--pet3)" stroke="none"/><path d="M-1.8 2.4 q1.8 1.8 3.6 0" fill="none" stroke-width=".7"/></g>`
};

export const CAPYBARA = {
  tail: `
              <g ${FILL}>
                <path d="M84 104 C88 100 94 101 94 105 C94 108 90 110 86 109Z" style="fill:var(--pet1)"/>
              </g>
              <g ${INK}>
                <path d="M86 102 C90 100 94 102 94 105 C94 108 90 110 86 109"/>
              </g>
            `,
  body: `
              <g ${FILL}>
                <path d="M29 100 C27 80 41 70 60 70 C79 70 93 80 91 100 C89 112 79 118 60 118 C41 118 31 112 29 100Z" style="fill:var(--pet1)"/>
                <ellipse cx="60" cy="102" rx="16" ry="14" style="fill:var(--pet2)" opacity=".75"/>
                <ellipse cx="46.5" cy="115" rx="8.5" ry="4.2" style="fill:var(--pet3)" opacity=".9"/>
                <ellipse cx="73.5" cy="115" rx="8.5" ry="4.2" style="fill:var(--pet3)" opacity=".9"/>
              </g>
              <g ${INK}>
                <path d="M29 100 C27 80 41 70 60 70 C79 70 93 80 91 100 C89 112 79 118 60 118 C41 118 31 112 29 100"/>
                <path d="M42 100 q-1 7 1 12 M78 100 q1 7 -1 12" opacity=".6"/>
                <path d="M38 115 C38 111 55 111 55 115 C55 119 38 119 38 115 M65 115 C65 111 82 111 82 115 C82 119 65 119 65 115"/>
                <path d="M44 115 v2.6 M49 115 v2.6 M71 115 v2.6 M76 115 v2.6" opacity=".55"/>
                <path d="M34 90 q-1 4 0 7 M86 90 q1 4 0 7 M36 104 q-1 3 0 6 M84 104 q1 3 0 6" opacity=".5"/>
              </g>
            `,
  head: `
              <g ${FILL}>
                <ellipse cx="38" cy="26" rx="6.6" ry="5.4" style="fill:var(--pet1)"/>
                <ellipse cx="82" cy="26" rx="6.6" ry="5.4" style="fill:var(--pet1)"/>
                <ellipse cx="38" cy="26.6" rx="3.4" ry="2.6" style="fill:var(--pet3)" opacity=".45"/>
                <ellipse cx="82" cy="26.6" rx="3.4" ry="2.6" style="fill:var(--pet3)" opacity=".45"/>
                <path d="M32 40 C32 28 44 23 60 23 C76 23 88 28 88 40 L90 64 C90 74 78 78 60 78 C42 78 30 74 30 64Z" style="fill:var(--pet1)"/>
                <path d="M33 62 C34 56 46 54 60 54 C74 54 86 56 87 62 L88 66 C88 74 76 77 60 77 C44 77 32 74 32 66Z" style="fill:var(--pet2)"/>
                <ellipse cx="37" cy="60" rx="5" ry="3" style="fill:var(--rose)" opacity=".7"/>
                <ellipse cx="83" cy="60" rx="5" ry="3" style="fill:var(--rose)" opacity=".7"/>
                <path d="M49 61 C50 57.6 55 57 56.6 59.6 C56 62 52 63 49 61Z M71 61 C70 57.6 65 57 63.4 59.6 C64 62 68 63 71 61Z" style="fill:var(--pet3)"/>
              </g>
              <g ${INK}>
                <path d="M32 26 C30 21 36 19 40 21 M88 26 C90 21 84 19 80 21"/>
                <path d="M32 40 C32 28 44 23 60 23 C76 23 88 28 88 40 L90 64 C90 74 78 78 60 78 C42 78 30 74 30 64 L32 40"/>
                <path d="M33 62 C34 56 46 54 60 54 C74 54 86 56 87 62" opacity=".5"/>
                <path d="M60 62 v4.6 M53 70 Q60 73.4 67 70"/>
                <path d="M53 30 l2 3 M60 28 v3.6 M67 30 l-2 3" opacity=".45"/>
              </g>
              <g class="eyesOpen">
                <ellipse cx="46.2" cy="50.4" rx="4" ry="4.4" style="fill:var(--pet3)"/>
                <ellipse cx="73.8" cy="50.4" rx="4" ry="4.4" style="fill:var(--pet3)"/>
                <path d="M41.4 50.2 C41.4 45 51 44.6 51 48.8Z M78.6 50.2 C78.6 45 69 44.6 69 48.8Z" style="fill:var(--pet1)"/>
                <circle cx="47.4" cy="51.6" r="1.1" fill="#fff"/><circle cx="75" cy="51.6" r="1.1" fill="#fff"/>
                <path d="M41 50.4 Q45.6 48.2 51.2 48.6 M79 50.4 Q74.4 48.2 68.8 48.6" fill="none" style="stroke:var(--line)" stroke-width="1.5" stroke-linecap="round"/>
              </g>
`,
  nap: `
            <g ${FILL}>
              <path d="M40 90 C30 72 42 42 82 38 C122 34 152 50 154 74 C156 86 148 92 132 92 L48 92 C44 92 42 91 40 90Z" style="fill:var(--pet1)"/>
              <ellipse cx="138" cy="90" rx="11" ry="3.4" style="fill:var(--pet3)" opacity=".9"/>
              <ellipse cx="62" cy="49" rx="6.6" ry="5" style="fill:var(--pet1)"/>
              <ellipse cx="62" cy="49.6" rx="3.4" ry="2.4" style="fill:var(--pet3)" opacity=".45"/>
              <path d="M12 76 C12 62 22 52 38 51 C54 50 66 54 71 64 C75 72 72 86 62 90 C50 93 26 93 16 89 C13 87 12 82 12 76Z" style="fill:var(--pet1)"/>
              <path d="M12 76 C12 66 17 60 25 60 C32 60 34 70 33 80 C32 88 24 92 16 89 C13 87 12 82 12 76Z" style="fill:var(--pet2)"/>
              <path d="M13 70 C14 67 18 67 18 70 C18 73 14 74 13 72Z" style="fill:var(--pet3)"/>
              <ellipse cx="52" cy="91" rx="9" ry="3" style="fill:var(--pet3)" opacity=".9"/>
            </g>
            <g ${INK}>
              <path d="M66 56 C68 44 80 38 92 38 C122 36 152 50 154 74 C156 86 148 92 132 92 L72 92"/>
              <path d="M127 90 C127 87 149 87 149 90 C149 93 127 93 127 90"/>
              <path d="M56 47 C57 43 64 42 67 45"/>
              <path d="M12 76 C12 62 22 52 38 51 C54 50 66 54 71 64 C75 72 72 86 62 90 C50 93 26 93 16 89 C13 87 12 82 12 76"/>
              <path d="M30 62 C34 68 34 80 30 88" opacity=".5"/>
              <path d="M42 66 Q47 69 52 66"/>
              <path d="M16 80 q4 2 8 0" opacity=".7"/>
              <path d="M43 91 C43 88 61 88 61 91 C61 94 43 94 43 91" opacity=".8"/>
              <path d="M96 50 q6 5 8 12 M116 52 q6 5 6 12 M84 66 q4 4 4 9" opacity=".5"/>
            </g>
            <ellipse cx="46" cy="76" rx="4.5" ry="2.6" style="fill:var(--rose)" opacity=".7"/>
          `,
  stand: `
                <g class="mtail"></g>
                <path d="M-6 -4 v4 h3.4 v-4z M6 -4 v4 h3.4 v-4z" style="fill:var(--pet3)"/>
                <path d="M-9 -8 C-9 -14 -3 -16 3 -16 C9 -16 13 -12 13 -7 C13 -3 10 -2 6 -2 L-4 -2 C-7 -2 -9 -4 -9 -8Z" style="fill:var(--pet1)"/>
                <ellipse cx="-6.6" cy="-18.6" rx="2" ry="1.5" style="fill:var(--pet1)"/>
                <path d="M-17.4 -12.6 C-17.4 -16 -14 -19 -9 -19 C-5 -19 -3 -16.4 -3 -12.6 C-3 -8.8 -5.6 -7.4 -9 -7.4 L-14.6 -7.4 C-16.6 -7.4 -17.4 -9 -17.4 -12.6Z" style="fill:var(--pet1)"/>
                <path d="M-17.4 -11 C-17.4 -13 -16.4 -14 -14.8 -14 C-13.4 -14 -13 -12 -13 -10.6 C-13 -8.6 -13.6 -7.4 -14.6 -7.4 C-16.6 -7.4 -17.4 -8.6 -17.4 -11Z" style="fill:var(--pet2)" stroke="none"/>
                <path d="M-11.4 -14.2 h2.6 a1.3 1.1 0 0 1 -2.6 0z" style="fill:var(--pet3)" stroke="none"/>
                <path d="M-11.8 -14.4 h3.4" fill="none" stroke-width=".8"/>
                <ellipse cx="-16.8" cy="-12.6" rx=".7" ry=".9" style="fill:var(--pet3)" stroke="none"/>
              `,
  curl: `
                <path d="M-8 -1 C-10 -8 -4 -12 3 -12 C9 -12 13 -8 13 -4 C13 -1 10 0 6 0 L-6 0 C-7 0 -7.6 -.4 -8 -1Z" style="fill:var(--pet1)"/>
                <ellipse cx="-6.4" cy="-11.4" rx="1.9" ry="1.4" style="fill:var(--pet1)"/>
                <path d="M-15.6 -3.4 C-15.6 -7.6 -12.4 -10.6 -8 -10.6 C-4 -10.6 -2 -8 -2 -4.6 C-2 -1.4 -4 0 -7 0 L-13.4 0 C-15 0 -15.6 -1 -15.6 -3.4Z" style="fill:var(--pet1)"/>
                <path d="M-15.6 -3 C-15.6 -5 -14.6 -6 -13.2 -6 C-12 -6 -11.4 -4 -11.4 -2.4 C-11.4 -.8 -12 0 -13.4 0 C-15 0 -15.6 -1 -15.6 -3Z" style="fill:var(--pet2)" stroke="none"/>
                <path d="M-9.8 -6.4 q1.2 1 2.4 0" fill="none" stroke-width=".9"/>
                <ellipse cx="-15" cy="-4.4" rx=".6" ry=".8" style="fill:var(--pet3)" stroke="none"/>
              `,
  peek: `<g style="stroke:var(--line)" stroke-width="1" stroke-linejoin="round"><ellipse cx="-4.4" cy="-5.2" rx="1.8" ry="1.4" style="fill:var(--pet1)"/><ellipse cx="4.4" cy="-5.2" rx="1.8" ry="1.4" style="fill:var(--pet1)"/><path d="M-5.8 -2.6 C-5.8 -5 -3 -6 0 -6 C3 -6 5.8 -5 5.8 -2.6 L6.2 2.6 C6.2 5 3.4 6 0 6 C-3.4 6 -6.2 5 -6.2 2.6Z" style="fill:var(--pet1)"/><path d="M-6 2 C-6 .6 -3 0 0 0 C3 0 6 .6 6 2 L6.1 2.8 C6.1 5 3.4 5.9 0 5.9 C-3.4 5.9 -6.1 5 -6.1 2.8Z" style="fill:var(--pet2)" stroke="none"/><path d="M-2.2 1.2 C-2.2 .4 2.2 .4 2.2 1.2 C2.2 2 1 2.2 0 2.2 C-1 2.2 -2.2 2 -2.2 1.2Z" style="fill:var(--pet3)" stroke="none"/><path d="M-3.6 -2.4 h2 a1 .9 0 0 1 -2 0z M1.6 -2.4 h2 a1 .9 0 0 1 -2 0z" style="fill:var(--pet3)" stroke="none"/><path d="M-4 -2.6 h2.8 M1.2 -2.6 h2.8" fill="none" stroke-width=".7"/></g>`
};
