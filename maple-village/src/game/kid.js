// Evan's room: a toddler-safe corner of the game for when the real Evan borrows Mel's phone. He taps, the little
// Evan in the game walks, eats, naps and plays. Nothing here touches the rest of the game: no coins, no XP, no
// saves; all state lives in memory and is gone when the room is left. The games are built for a two-year-old:
// big targets, no reading, no losing, something fun on every tap.
import { sfx } from "./audio.js";

export const kid = {sleep: false, pending: null, open: null};
const INK = "#3A2E28", sw = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
const pick = a => a[Math.floor(Math.random()*a.length)];

/* ---------- pictures (shared by the snack picker and Evan's little snack bubble) ---------- */
export const SNACKS = {
  milk: {n: "Milk", say: ["milk!", "gulp gulp!", "mmm milk"], fx: "slurp",
    svg: `<path d="M22 20 h20 l6 10 v32 a3 3 0 0 1 -3 3 h-26 a3 3 0 0 1 -3 -3 v-32z" fill="#FFFDF6" ${sw}/><path d="M22 20 l-6 10 h32" fill="#CFE3F4" ${sw}/><path d="M20 20 h24 v-6 h-24z" fill="#7FB8E8" ${sw}/><circle cx="32" cy="46" r="7" fill="#7FB8E8"/>`},
  juice: {n: "Juice", say: ["juice!", "slurp!", "yummy juice"], fx: "slurp",
    svg: `<rect x="18" y="22" width="28" height="42" rx="3" fill="#F7B24A" ${sw}/><path d="M36 22 l4 -14 l6 2" fill="none" ${sw}/><circle cx="32" cy="44" r="8" fill="#F2833A" ${sw}/><path d="M32 36 q4 -4 7 -2" fill="none" stroke="#5C8A3A" stroke-width="2.2" stroke-linecap="round"/>`},
  apple: {n: "Apple chips", say: ["crunch crunch!", "apple!", "crunchy!"], fx: "crunch",
    svg: `<path d="M8 38 h48 q-2 22 -24 22 q-22 0 -24 -22z" fill="#F4C7CF" ${sw}/>${[[20, 32], [32, 28], [44, 32], [26, 36], [38, 36]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#FFF3D6" ${sw}/><circle cx="${x}" cy="${y}" r="1.6" fill="${INK}"/>`).join("")}`},
  melon: {n: "Watermelon", say: ["melon!", "juicy!", "nom nom"], fx: "crunch",
    svg: `<path d="M8 24 h48 a24 24 0 0 1 -48 0z" fill="#7BB37A" ${sw}/><path d="M13 24 h38 a19 19 0 0 1 -38 0z" fill="#F26D6D"/>${[[22, 32], [32, 36], [42, 32], [28, 28], [37, 28]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.6" fill="${INK}"/>`).join("")}<path d="M8 24 h48" ${sw}/>`},
  fish: {n: "Goldfish crackers", say: ["fishies!", "crunch!", "more fish!"], fx: "crunch",
    svg: `<path d="M8 40 h48 q-2 20 -24 20 q-22 0 -24 -20z" fill="#BFD6E6" ${sw}/>${[[20, 32, -10], [36, 28, 8], [30, 37, 0], [46, 35, -6]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="0" cy="0" rx="8" ry="5" fill="#F3A13A" ${sw}/><path d="M7 0 l6 -5 v10z" fill="#F3A13A" ${sw}/><circle cx="-4" cy="-1" r="1.2" fill="${INK}"/></g>`).join("")}`}
};
const pic = (inner, size = 64) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;
export const snackPic = (id, size) => pic(SNACKS[id].svg, size);

const DINO_COLS = ["#7BB37A", "#7FB8E8", "#F2A65A", "#C9A3E8", "#F4A0B5"];
const babyDino = c => `<path d="M14 54 q-4 -20 12 -26 q4 -14 16 -12 q10 2 8 12 q-2 6 -10 6 q4 8 2 20z" fill="${c}" ${sw}/><circle cx="44" cy="22" r="2" fill="${INK}"/><path d="M47 28 q-3 2 -6 1" fill="none" ${sw}/><path d="M26 30 l-3 -5 l5 1 l1 -5 l4 3" fill="#FFFDF6" ${sw}/>`;
const egg = (stage) => `<ellipse cx="32" cy="38" rx="20" ry="25" fill="#FFF6E2" ${sw}/><circle cx="24" cy="30" r="3.4" fill="#A8CF8E"/><circle cx="38" cy="44" r="4" fill="#F2A65A"/><circle cx="36" cy="26" r="2.6" fill="#7FB8E8"/>${stage >= 1 ? `<path d="M14 36 l6 -5 l5 6 l6 -7 l6 7 l6 -6 l5 5" fill="none" ${sw}/>` : ""}`;
const hatched = c => `${babyDino(c)}<path d="M12 44 l6 -5 l5 6 l6 -7 l6 7 l6 -6 l6 5 v6 a20 14 0 0 1 -41 0z" fill="#FFF6E2" ${sw}/>`;
const CAR_COLS = ["#E86A5C", "#5B8FD6", "#F3C14A"];
const car = c => `<path d="M6 40 v-10 q0 -4 4 -4 h10 l8 -10 h18 q4 0 6 4 l6 10 q6 0 6 6 v4z" fill="${c}" ${sw}/><path d="M30 18 h14 l5 8 h-24z" fill="#DCEBF6" ${sw}/><circle cx="18" cy="42" r="7" fill="#3B3B44" ${sw}/><circle cx="48" cy="42" r="7" fill="#3B3B44" ${sw}/><circle cx="18" cy="42" r="2.4" fill="#D9D9D9"/><circle cx="48" cy="42" r="2.4" fill="#D9D9D9"/><circle cx="62" cy="32" r="2.6" fill="#FFE38A"/>`;
const engine = `<svg viewBox="0 0 80 64" width="110" height="88" aria-hidden="true"><path d="M8 50 v-24 h24 v-12 h16 v12 h16 q8 0 8 8 v16z" fill="#E86A5C" ${sw}/><rect x="12" y="30" width="16" height="12" rx="2" fill="#DCEBF6" ${sw}/><path d="M52 26 v-12 h8 v12" fill="#3B3B44" ${sw}/><circle cx="22" cy="54" r="8" fill="#3B3B44" ${sw}/><circle cx="54" cy="54" r="8" fill="#3B3B44" ${sw}/><circle cx="72" cy="40" r="3" fill="#FFE38A"/><g class="puff"><circle cx="58" cy="8" r="5" fill="#FFFFFF" ${sw}/></g></svg>`;
const wagon = c => `<svg viewBox="0 0 64 64" width="80" height="80" aria-hidden="true"><rect x="6" y="24" width="52" height="26" rx="4" fill="${c}" ${sw}/><circle cx="18" cy="54" r="7" fill="#3B3B44" ${sw}/><circle cx="46" cy="54" r="7" fill="#3B3B44" ${sw}/><path d="M0 40 h6" ${sw}/></svg>`;
const BAL_COLS = ["#F26D6D", "#F7C548", "#7FB8E8", "#7BB37A", "#C9A3E8", "#F4A0B5"];
const balloon = c => `<svg viewBox="0 0 64 96" width="74" height="111" aria-hidden="true"><ellipse cx="32" cy="32" rx="24" ry="29" fill="${c}" ${sw}/><path d="M28 61 l4 6 l4 -6z" fill="${c}" ${sw}/><path d="M32 67 q-6 12 2 26" fill="none" stroke="${INK}" stroke-width="1.6"/><ellipse cx="23" cy="21" rx="5" ry="8" fill="#FFFFFF" opacity=".55"/></svg>`;
const star = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 2 l3 6.5 7 .8 -5.2 4.8 1.4 7 -6.2 -3.5 -6.2 3.5 1.4 -7 L1 9.3 l7 -.8z" fill="#F7C548" ${sw.replace("2.2", "1.4")}/></svg>`;
const home = `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M3 11 L12 3 l9 8 M5 10 v10 h14 v-10" fill="none" ${sw}/><rect x="10" y="14" width="4" height="6" fill="#F7C548"/></svg>`;

/* ---------- the games ---------- */
const st = {eggs: [], wagons: 1, trainBusy: false, popped: 0, spawn: null, timers: []};
const later = (fn, ms) => { const t = setTimeout(fn, ms); st.timers.push(t); return t; };
export function stopKidGame(){ clearInterval(st.spawn); st.spawn = null; st.timers.forEach(clearTimeout); st.timers = []; st.trainBusy = false; }
const newEggs = () => { st.eggs = Array.from({length: 4}, () => ({stage: 0, col: pick(DINO_COLS)})); };

const TITLES = {snacks: "Snack time!", dino: "Dino eggs", train: "Choo choo!", cars: "Beep beep!", balloons: "Pop the balloons"};
export function kidPanel(kind){
  const head = `<span class="tape gingham" aria-hidden="true"></span><h2 class="ktitle">${TITLES[kind] || ""}</h2>`;
  const done = `<div class="kfoot"><button class="kdone" data-kid="done" aria-label="All done">${home}</button></div>`;
  if (kind === "snacks") return head + `<div class="ksnacks">${Object.keys(SNACKS).map(id => `<button class="ksnack" data-snack="${id}">${snackPic(id, 72)}<span>${SNACKS[id].n}</span></button>`).join("")}</div>` + done;
  return head + `<div class="kgame k-${kind}" id="kgame"></div>` + done;
}
// Called after the panel's HTML is in place. api: {eat(id), close()}
export function wireKid(root, kind, api){
  root.querySelectorAll("[data-snack]").forEach(b => b.onclick = () => api.eat(b.dataset.snack));
  root.querySelectorAll('[data-kid="done"]').forEach(b => b.onclick = () => api.close());
  const g = root.querySelector("#kgame"); if (!g) return;
  stopKidGame();
  if (kind === "dino") { newEggs(); drawEggs(g); }
  if (kind === "train") drawTrain(g);
  if (kind === "cars") drawCars(g);
  if (kind === "balloons") startBalloons(g);
}

// Dino eggs: tap an egg, it cracks; tap again, a baby dino hatches and roars. All four hatched: a cheer, new eggs.
function drawEggs(g){
  g.innerHTML = st.eggs.map((e, i) => `<button class="kegg${e.stage === 1 ? " wobble" : ""}" data-egg="${i}" aria-label="${e.stage < 2 ? "Egg" : "Baby dinosaur"}">${pic(e.stage < 2 ? egg(e.stage) : hatched(e.col), 140)}${e.stage === 2 ? `<span class="kpop">Rawr!</span>` : ""}</button>`).join("");
  g.querySelectorAll("[data-egg]").forEach(b => b.onclick = () => {
    const e = st.eggs[+b.dataset.egg]; if (e.stage >= 2) { sfx("roar"); b.classList.remove("hop"); void b.offsetWidth; b.classList.add("hop"); return; }
    e.stage++; sfx(e.stage === 1 ? "crack" : "roar"); drawEggs(g);
    if (st.eggs.every(x => x.stage === 2)) { later(() => sfx("yay"), 500); later(() => { newEggs(); drawEggs(g); }, 2600); }
  });
}
// Train: tap anywhere and the train chugs off, toots, and comes back with one more carriage (up to four).
function drawTrain(g){
  g.innerHTML = `<div class="ksky"></div><div class="ktrack"></div><button class="ktrain" aria-label="Train">${engine}${Array.from({length: st.wagons}, (_, i) => wagon(["#7FB8E8", "#F7C548", "#7BB37A", "#C9A3E8"][i % 4])).join("")}</button>`;
  g.onclick = () => {
    if (st.trainBusy) { sfx("whistle"); return; }
    st.trainBusy = true; sfx("whistle"); later(() => sfx("choo"), 700);
    const t = g.querySelector(".ktrain"); t.classList.add("go");
    later(() => { st.wagons = st.wagons >= 4 ? 1 : st.wagons + 1; drawTrain(g); const n = g.querySelector(".ktrain"); n.classList.add("back"); later(() => { n.classList.remove("back"); st.trainBusy = false; }, 1300); }, 1700);
  };
}
// Cars: three cars on the road. Tap one: beep beep, it zooms away and drives back in.
function drawCars(g){
  g.innerHTML = CAR_COLS.map((c, i) => `<div class="klane"><button class="kcar" data-car="${i}" aria-label="Car">${pic(car(c), 120).replace('viewBox="0 0 64 64"', 'viewBox="0 0 72 52"')}</button></div>`).join("");
  g.querySelectorAll("[data-car]").forEach(b => b.onclick = () => {
    if (b.classList.contains("zoom")) { sfx("honk"); return; }
    sfx("honk"); later(() => sfx("vroom"), 250); b.classList.add("zoom");
    b.insertAdjacentHTML("beforeend", `<span class="kpop">Beep beep!</span>`);
    later(() => { b.classList.remove("zoom"); const p = b.querySelector(".kpop"); if (p) p.remove(); }, 2300);
  });
}
// Balloons: they float up from the bottom; tap to pop. Every pop adds a star; ten stars and a cheer.
function startBalloons(g){
  st.popped = 0;
  g.innerHTML = `<div class="kstars" aria-hidden="true"></div>`;
  const spawn = () => {
    if (!g.isConnected) return stopKidGame();
    if (g.querySelectorAll(".kballoon").length >= 6) return;
    const b = document.createElement("button"); b.className = "kballoon"; b.setAttribute("aria-label", "Balloon");
    b.style.left = (5 + Math.random()*70) + "%"; b.style.animationDuration = (6 + Math.random()*3).toFixed(1) + "s"; b.innerHTML = balloon(pick(BAL_COLS));
    b.onclick = ev => { ev.stopPropagation(); sfx("pop"); b.classList.add("popped"); b.innerHTML = `<svg viewBox="0 0 64 64" width="74" height="74" aria-hidden="true">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M32 32 l${(Math.cos(a*Math.PI/180)*26).toFixed(1)} ${(Math.sin(a*Math.PI/180)*26).toFixed(1)}" stroke="#F7C548" stroke-width="4" stroke-linecap="round"/>`).join("")}</svg>`;
      setTimeout(() => b.remove(), 400);
      st.popped++; const s = g.querySelector(".kstars"); if (s) s.innerHTML = star.repeat(st.popped % 10 || (st.popped ? 10 : 0));
      if (st.popped % 10 === 0) { later(() => sfx("yay"), 200); later(() => { const s2 = g.querySelector(".kstars"); if (s2) s2.innerHTML = ""; }, 2000); } };
    b.addEventListener("animationend", () => b.remove());
    g.appendChild(b);
  };
  spawn(); st.spawn = setInterval(spawn, 900);
}

export const EVAN_TAPS = ["hehe!", "Mama!", "look!", "wheee!", "again!", "yay!"];
export const pickSay = pick;
