// Little animals at home base: chicks and bunnies bought at the market, living in the run beside the garden.
// Each animal eats once a day (chick feed, rabbit pellets, or a garden carrot for the bunnies). After three
// days of meals a chick grows into a hen and a bunny into a rabbit; a fed hen lays an egg in the backpack.
// Nobody ever gets ill or leaves: a hungry animal just looks a little sorry for itself until it's fed.
import { dayKey, prevDay, esc } from "../util.js";
import { icon } from "../art/icons.js";
import { sk, tapeLabel } from "../art/scenes.js";

export const RUNS = [
  {n: "Little run", cap: 2, price: 0, what: "A small pen with a crate to sleep in. Room for two."},
  {n: "Bigger run", cap: 4, price: 35, what: "Darren moves the fence out. Room for four."},
  {n: "Coop and hutch", cap: 6, price: 70, what: "A proper coop with a ramp, and a hutch for the bunnies. Room for six."},
  {n: "Clover meadow", cap: 8, price: 120, what: "Clover to nibble and a water trough. Room for eight, and a meal lasts two days."}
];
export const KINDS = {
  chick: {n: "Chick", grown: "Hen", food: ["chickfeed"], foodName: "chick feed",
    names: ["Nugget", "Pip", "Sunny", "Butterbean", "Popcorn", "Peaches", "Marigold", "Custard", "Tofu", "Kaya"]},
  rabbit: {n: "Bunny", grown: "Rabbit", food: ["rabbitfeed", "carrot"], foodName: "rabbit pellets or a carrot",
    names: ["Clover", "Mochi", "Hazel", "Pudding", "Bun Bun", "Oreo", "Waffle", "Toffee", "Pebble", "Cinnamon"]}
};
const GROW = 3;
const BUNNY_COLS = ["#B9A38C", "#E9DCCB", "#FFFDF6", "#9C8C80"];

export function ensurePets(F){
  if (!F.pets || typeof F.pets !== "object") F.pets = {run: 0, animals: [], next: 1};
  if (!Array.isArray(F.pets.animals)) F.pets.animals = [];
  return F.pets;
}
export const runOf = F => RUNS[ensurePets(F).run] || RUNS[0];
export const roomLeft = F => runOf(F).cap - ensurePets(F).animals.length;
export const isGrown = a => (a.feeds || 0) >= GROW;
export const label = a => isGrown(a) ? KINDS[a.kind].grown : KINDS[a.kind].n;
export const fedToday = a => a.fedDay === dayKey();
// with the clover meadow, yesterday's meal still counts
export const hungry = (a, F) => !(fedToday(a) || (ensurePets(F).run >= 3 && a.fedDay === prevDay(dayKey())));
export const hungryCount = F => ensurePets(F).animals.filter(a => hungry(a, F)).length;

export function addAnimal(F, kind){
  const P = ensurePets(F); if (!KINDS[kind] || roomLeft(F) <= 0) return null;
  const used = new Set(P.animals.map(a => a.name)), pool = KINDS[kind].names.filter(n => !used.has(n));
  const name = pool.length ? pool[Math.floor(Math.random()*pool.length)] : `${KINDS[kind].n} ${P.next}`;
  const a = {id: "a" + (P.next++), kind, name, born: Date.now(), feeds: 0, fedDay: null, col: Math.floor(Math.random()*4)};
  P.animals.push(a); return a;
}
// Feed one animal from the backpack. Returns {ok, msg, egg, grew} and never throws.
export function feedOne(F, a, inv, addInv){
  if (!a) return {ok: false};
  if (fedToday(a)) return {ok: false, msg: `${a.name} is full for today.`};
  const food = KINDS[a.kind].food.find(id => inv[id] > 0);
  if (!food) return {ok: false, msg: `No ${KINDS[a.kind].foodName} in your backpack. The market sells it.`};
  const wasGrown = isGrown(a);
  addInv(food, -1); a.fedDay = dayKey(); a.feeds = (a.feeds || 0) + 1;
  const grew = !wasGrown && isGrown(a), egg = wasGrown && a.kind === "chick";
  if (egg) addInv("egg", 1);
  return {ok: true, grew, egg, food};
}
export function upgradeRun(F){
  const P = ensurePets(F), nx = RUNS[P.run + 1]; if (!nx || F.coins < nx.price) return null;
  F.coins -= nx.price; P.run++; return nx;
}

/* ---------- the run panel ---------- */
export function runPanel(F){
  const P = ensurePets(F), R = runOf(F), nx = RUNS[P.run + 1];
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The animal run</h2><p class="sub">${esc(R.n)} · ${P.animals.length} of ${R.cap} · you have ${icon("coin", 16)} ${F.coins}</p>`;
  if (!P.animals.length) h += `<p class="muted">It's quiet in here. Chicks and bunnies are in the market's Animals tab, with their food.</p>`;
  else {
    h += `<ul class="hlist pets">${P.animals.map(a => { const hu = hungry(a, F), left = Math.max(0, GROW - (a.feeds || 0));
      return `<li><span class="pico">${icon(a.kind === "chick" ? (isGrown(a) ? "hen" : "chick") : "rabbit", 30)}</span><span><b>${esc(a.name)}</b><small>${label(a)} · ${hu ? "hungry" : "fed and happy"}${left ? ` · ${left} more ${left === 1 ? "meal" : "meals"} to grow up` : a.kind === "chick" ? " · lays an egg when fed" : ""}</small></span>${hu ? `<button class="next" data-feed="${a.id}">feed</button>` : `<span class="hbadge">full</span>`}</li>`; }).join("")}</ul>`;
    if (hungryCount(F) > 1) h += `<div class="actions"><button class="btn primary small" data-feed="all">Feed everyone</button></div>`;
  }
  h += `<p class="eyebrow" style="margin:12px 0 6px">Make the run nicer</p>`;
  h += nx ? `<div class="items shop"><button class="item" data-runup="1" ${F.coins < nx.price ? "disabled" : ""}><span class="e">${icon("coop", 34)}</span><span class="n">${esc(nx.n)}</span><span class="c"><b>${nx.price}</b> ${icon("coin", 13)}</span><span class="d">${esc(nx.what)}</span></button></div>`
    : `<p class="muted">The run's as cosy as it gets. Clover, a trough, a coop and a hutch.</p>`;
  return h;
}

/* ---------- map art (home base, bottom left) ---------- */
export function runArt(F){
  const P = ensurePets(F), lv = P.run, big = lv >= 1;
  const [x0, y0, x1, y1] = big ? [40, 508, 182, 590] : [92, 524, 182, 588];
  const posts = []; for (let x = x0; x <= x1; x += 16) posts.push(`M${x} ${y0 - 6} v8 M${x} ${y1 - 6} v8`);
  for (let y = y0; y <= y1; y += 18) posts.push(`M${x0} ${y - 4} v8 M${x1} ${y - 4} v8`);
  const fence = sk(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="3" style="fill:#EADFB8" opacity=".55"/>`,
    `<path d="M${x0} ${y0} H${x1} V${y1 - 26} M${x1} ${y1 - 6} V${y1} H${x0} Z" fill="none" style="stroke:var(--wood)" stroke-width="2.4"/><path d="${posts.join(" ")}" style="stroke:var(--wood)" stroke-width="2"/>`);
  const crate = lv < 2 ? sk(`<rect x="${x0 + 6}" y="${y0 + 6}" width="26" height="18" style="fill:#C9A27E"/>`, `<rect x="${x0 + 6}" y="${y0 + 6}" width="26" height="18"/><path d="M${x0 + 6} ${y0 + 15} h26" opacity=".4"/><path d="M${x0 + 12} ${y0 + 24} v-10 h14 v10" style="fill:var(--line)" opacity=".25"/>`) : "";
  const coop = lv >= 2 ? sk(`<path d="M44 498 l18 -14 l18 14z" style="fill:var(--rose)"/><rect x="46" y="498" width="32" height="24" style="fill:var(--butter)"/><rect x="56" y="508" width="11" height="14" style="fill:var(--wood)"/><path d="M67 522 l14 12 h4 l-14 -12z" style="fill:var(--wood)"/>
      <rect x="120" y="512" width="34" height="18" rx="2" style="fill:#C9A27E"/><path d="M118 513 h38 l-4 -7 h-30z" style="fill:var(--sage)"/>`,
      `<path d="M44 498 l18 -14 l18 14"/><rect x="46" y="498" width="32" height="24"/><rect x="56" y="508" width="11" height="14"/><path d="M67 522 l14 12 h4 l-14 -12z M71 526 l2 -1 M76 530 l2 -1"/>
      <rect x="120" y="512" width="34" height="18" rx="2"/><path d="M118 513 h38 l-4 -7 h-30z"/><path d="M126 516 v11 M132 516 v11 M138 516 v11" opacity=".55"/>`) : "";
  const meadow = lv >= 3 ? `<g pointer-events="none">${[[54, 542], [96, 532], [120, 578], [70, 580], [150, 548], [110, 556]].map(([x, y]) => `<g fill="var(--moss)" opacity=".8"><circle cx="${x - 2}" cy="${y}" r="2.4"/><circle cx="${x + 2}" cy="${y}" r="2.4"/><circle cx="${x}" cy="${y - 3}" r="2.4"/></g>`).join("")}</g>`
    + sk(`<rect x="124" y="580" width="30" height="7" rx="2" style="fill:var(--wood)"/><rect x="127" y="580" width="24" height="3" style="fill:#9CC3E0"/>`, `<rect x="124" y="580" width="30" height="7" rx="2"/>`) : "";
  const fed = P.animals.length && !hungryCount(F);
  const bowl = sk(`<path d="M${x1 - 24} ${y1 - 12} h14 l-2 6 h-10z" style="fill:var(--sky)"/>${fed ? `<ellipse cx="${x1 - 17}" cy="${y1 - 12}" rx="6" ry="2" style="fill:var(--honey)"/>` : ""}`, `<path d="M${x1 - 24} ${y1 - 12} h14 l-2 6 h-10z"/>`);
  const cols = big ? 4 : 2, gx = big ? 32 : 36, ox = big ? 60 : 118;
  const animals = P.animals.map((a, i) => { const x = ox + (i % cols)*gx + (i % 2 ? 6 : 0), y = (big ? 546 : 556) + Math.floor(i/cols)*24 + (i % 3)*3, flip = i % 2 ? -1 : 1;
    return `<g transform="translate(${x} ${y}) scale(${flip} 1)"><g class="${a.kind === "chick" ? "peck" : "hop"}" style="animation-delay:-${(i*0.7).toFixed(1)}s">${animalArt(a, hungry(a, F))}</g></g>`; }).join("");
  return `<g data-place="run" aria-label="Animal run"><ellipse class="hov" cx="${(x0 + x1)/2}" cy="${y1}" rx="${(x1 - x0)/2 + 8}" ry="10" style="fill:var(--butter)"/>${fence}${meadow}${crate}${coop}${bowl}${animals}${tapeLabel(big ? 204 : 137, big ? 500 : 508, "Animal run", "var(--peach)", 11)}</g>`;
}
const INK = `style="stroke:var(--line)" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"`;
export function animalArt(a, sad){
  const g = isGrown(a);
  if (a.kind === "chick") return g
    ? `<g ${INK}><path d="M-9 0 q-4 -9 2 -12" fill="#FFFDF6"/><ellipse cx="0" cy="-5" rx="9" ry="7" fill="#FFFDF6"/><circle cx="7" cy="-12" r="4.5" fill="#FFFDF6"/><path d="M5 -17 q1 -3 3 -1 q1 -3 3 0" fill="var(--rose)"/><path d="M11 -12 l3 1 l-3 1.5z" fill="var(--honey)"/><path d="M-2 2 v4 M3 2 v4" style="stroke:var(--honey)"/><circle cx="8" cy="-13" r=".9" fill="var(--line)" stroke="none"/></g>`
    : `<g ${INK}><circle cx="0" cy="-5" r="5.5" fill="var(--butter)"/><circle cx="4" cy="-10" r="3.6" fill="var(--butter)"/><path d="M7.4 -10 l2.4 .8 l-2.4 1.2z" fill="var(--honey)"/><path d="M-1 0 v3 M2 0 v3" style="stroke:var(--honey)"/><circle cx="4.8" cy="-10.8" r=".8" fill="var(--line)" stroke="none"/>${sad ? `<path d="M-6 -16 q2 -2 4 0" opacity=".6"/>` : ""}</g>`;
  const c = BUNNY_COLS[a.col || 0], s = g ? 1 : .72;
  return `<g transform="scale(${s})" ${INK}><ellipse cx="0" cy="-6" rx="10" ry="7" fill="${c}"/><circle cx="-10" cy="-8" r="2.6" fill="#FFFDF6"/><circle cx="8" cy="-11" r="5.2" fill="${c}"/><ellipse cx="6" cy="-20" rx="1.8" ry="5.5" fill="${c}" transform="rotate(${sad ? -40 : -10} 6 -16)"/><ellipse cx="10" cy="-20" rx="1.8" ry="5.5" fill="${c}" transform="rotate(${sad ? 30 : 12} 10 -16)"/><circle cx="10" cy="-12" r=".9" fill="var(--line)" stroke="none"/><circle cx="13" cy="-10" r=".9" fill="var(--rose)" stroke="none"/></g>`;
}
