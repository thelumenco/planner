// Keepsakes and pets from the market stalls (data/stall-goods.js).
//   keepsakes  little things Mel puts on a wall shelf in one of her buildings: two shelves each in the Scoop Shack,
//              the wine shop, home, her room, the Cocoa Room and the four app houses, one in the greenhouse and the
//              mill, and the home fridge for magnets. Town souvenirs marked keep can go up too. F.keeps = {spot: item id}; putting one where
//              another stands sends the old one back to the backpack, and a placed one can be taken back down.
//   pets       adopted at the market's adoption corner (Noor), then given to someone in the family, who looks after
//              it on the screen Mel picks. F.companions = [{id, kind, name, owner, scene, spot, since, patDay, playDay}].
//              Tap a pet to pat it; when its owner is on the same screen they play together (a little xp, once a day).
import { esc, dayKey, hash } from "../util.js";
import { ITEMS } from "../data/items.js";
import { icon } from "../art/icons.js";

/* ---------- keepsakes ---------- */
// shelf spots: [x, y] of the shelf's top edge on the back wall
export const KEEP_SPOTS = {
  scoop1: {scene: "scoopshop", at: [112, 128], n: "the Scoop Shack, by the cone"}, scoop2: {scene: "scoopshop", at: [396, 128], n: "the Scoop Shack, by the menu"},
  wine1: {scene: "wineshop", at: [96, 128], n: "the wine shop, left wall"}, wine2: {scene: "wineshop", at: [182, 128], n: "the wine shop, by the shelves"},
  home1: {scene: "home", at: [172, 128], n: "home, by the quest board"}, home2: {scene: "home", at: [352, 128], n: "home, by the kitchen window"},
  room1: {scene: "room", at: [62, 128], n: "your room, by the window"}, room2: {scene: "room", at: [482, 128], n: "your room, by your routines"},
  chord1: {scene: "chord", at: [186, 128], n: "the Chord workshop, by the pegboard"}, chord2: {scene: "chord", at: [318, 128], n: "the Chord workshop, by the window"},
  chico1: {scene: "chico", at: [336, 128], n: "Chico cottage, by the round window"}, chico2: {scene: "chico", at: [482, 128], n: "Chico cottage, far wall"},
  luna1: {scene: "luna", at: [96, 128], n: "the Luna house, left wall"}, luna2: {scene: "luna", at: [334, 128], n: "the Luna house, by the moon"},
  ohayo1: {scene: "ohayo", at: [60, 128], n: "the Ohayo house, left wall"}, ohayo2: {scene: "ohayo", at: [322, 128], n: "the Ohayo house, by the sunrise"},
  cocoa1: {scene: "cocoa", at: [100, 128], n: "the Cocoa Room, above the bar wall"}, cocoa2: {scene: "cocoa", at: [356, 128], n: "the Cocoa Room, by the chalkboard"},
  green1: {scene: "greenhouse", at: [64, 140], n: "the greenhouse, on the glass"},
  mill1: {scene: "mill", at: [64, 128], n: "the old mill, by the photograph"},
  fridge: {scene: "home", at: [328, 206], n: "home, on the fridge", only: "magnet"},   // no shelf: a magnet stuck on the fridge door
  fridge2: {scene: "home", at: [344, 226], n: "home, on the fridge (lower)", only: "magnet"},   // round 129: room for Jeju's magnet too
  fridge3: {scene: "home", at: [326, 230], n: "home, on the fridge (by the handle)", only: "magnet"},   // round 134: and Cinque Terre's
  fridge4: {scene: "home", at: [344, 204], n: "home, on the fridge (top corner)", only: "magnet"}   // round 142: and Bellbird Valley's
};
// what can go where: keepsakes, and souvenirs marked keep (towns.js), on shelves; fridge magnets only on the fridge
export const canKeep = it => !!it && (it.kind === "keepsake" || !!it.keep);
const fits = (it, sp) => canKeep(it) && (sp.only ? !!it[sp.only] : !it.magnet);
const BUILDING = {scoopshop: "The Scoop Shack", wineshop: "The wine shop", home: "Home", room: "Your room", cocoa: "The Cocoa Room", greenhouse: "The greenhouse", mill: "The old mill", chord: "Chord workshop", chico: "Chico cottage", luna: "Luna house", ohayo: "Ohayo house"};
const onWhat = sp => sp.only ? `on the fridge at ${sp.n.replace(/, .*/, "")}` : `on the shelf in ${sp.n}`;
export const keeps = F => (F.keeps = F.keeps || {});
// put a keepsake from the backpack on a shelf -> a line to say, or null
export function placeKeep(F, item, spot){
  const it = ITEMS[item], sp = KEEP_SPOTS[spot]; if (!it || !sp || !fits(it, sp) || !(F.inv[item] > 0)) return null;
  const K = keeps(F), old = K[spot];
  F.inv[item]--; if (!F.inv[item]) delete F.inv[item];
  if (old) F.inv[old] = (F.inv[old] || 0) + 1;
  K[spot] = item;
  return `${it.n} ${onWhat(sp)}.${old ? ` The ${ITEMS[old].n.toLowerCase()} is back in your backpack.` : ""}`;
}
export function takeKeep(F, spot){ const K = keeps(F), id = K[spot]; if (!id) return null; delete K[spot]; F.inv[id] = (F.inv[id] || 0) + 1; return ITEMS[id]; }
export function keepPanel(F, item){
  const it = ITEMS[item], K = keeps(F);
  const by = Object.keys(BUILDING).map(sc => [sc, Object.keys(KEEP_SPOTS).filter(k => KEEP_SPOTS[k].scene === sc && fits(it, KEEP_SPOTS[k]))]).filter(([, ks]) => ks.length);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>${esc(it ? it.n : "A keepsake")}</h2><p class="sub">${esc(it ? it.line || "" : "")} ${it && it.magnet ? "Where shall it go?" : "Which shelf?"}</p>
    ${by.map(([sc, ks]) => `<p class="eyebrow" style="margin:10px 0 4px">${esc(BUILDING[sc])}</p><div class="vhelp">${ks.map(k => `<button class="vhelpi" data-keepat="${k}"><span><b>${esc(KEEP_SPOTS[k].n.replace(/^[^,]+, /, "").replace(/^./, c => c.toUpperCase()))}</b><small>${K[k] ? `${esc(ITEMS[K[k]].n)} there now (it comes back to you)` : KEEP_SPOTS[k].only ? "nothing on it yet" : "empty shelf"}</small></span></button>`).join("")}</div>`).join("")}
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// a placed keepsake's card: what it is, and take it down
export function placedPanel(F, spot){
  const id = keeps(F)[spot], it = ITEMS[id]; if (!it) return "";
  return `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(it.n)}</h2><p class="sub">${esc(it.line || "")} ${esc(onWhat(KEEP_SPOTS[spot]).replace(/^./, c => c.toUpperCase()))}.</p>
    <div class="actions"><button class="btn alt" data-keepdown="${spot}">Take it down</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function keepsakesIn(F, scene){
  const K = keeps(F);
  return Object.entries(KEEP_SPOTS).filter(([, sp]) => sp.scene === scene).map(([k, sp]) => { const [x, y] = sp.at, id = K[k];
    if (sp.only) return id ? `<g data-keep="${k}" aria-label="${esc(ITEMS[id] ? ITEMS[id].n : "")}"><svg x="${x - 8}" y="${y - 8}" width="16" height="16" viewBox="0 0 24 24" overflow="visible">${icon(id, 24).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg></g>` : "";
    return `<g ${id ? `data-keep="${k}" aria-label="${esc(ITEMS[id] ? ITEMS[id].n : "")}"` : `pointer-events="none"`}><rect x="${x - 17}" y="${y}" width="34" height="5" rx="1.5" style="fill:#B98A5A;stroke:var(--line)" stroke-width="1"/>
      <path d="M${x - 11} ${y + 5} l3 6 M${x + 11} ${y + 5} l-3 6" style="stroke:var(--line)" stroke-width="1"/>${id ? `<svg x="${x - 13}" y="${y - 25}" width="26" height="26" viewBox="0 0 24 24" overflow="visible">${icon(id, 24).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>` : ""}</g>`; }).join("");
}

/* ---------- pets ---------- */
export const PETS = {
  kitten: {n: "kitten", names: ["Mochi", "Kaya", "Tofu", "Mango", "Pumpkin"], indoor: false, col: "#F2A65A"},
  puppy: {n: "puppy", names: ["Biscuit", "Bao", "Peanut", "Waffle", "Teddy"], indoor: false, col: "#C98A4A"},
  bunny: {n: "bunny", names: ["Clover", "Dumpling", "Snowy", "Bun Bun", "Pebble"], indoor: false, col: "#C9C2BA"},
  hamster: {n: "hamster", names: ["Muffin", "Nugget", "Sesame", "Bean", "Puff"], indoor: true, col: "#E3B06A"},
  goldfish: {n: "goldfish", names: ["Bubbles", "Goldie", "Koi Koi", "Sunny", "Finn"], indoor: true, col: "#F28C3A"},
  budgie: {n: "budgie", names: ["Kiwi", "Sky", "Pip", "Blue", "Chirpy"], indoor: true, col: "#7FB8E8"},
  tortoise: {n: "tortoise", names: ["Shelly", "Sir Slowly", "Mossy", "Pebbles", "Turbo"], indoor: false, col: "#7FA35A"},
  duckling: {n: "duckling", names: ["Lemon", "Puddle", "Quackers", "Sunny", "Custard"], indoor: false, col: "#F3D34A"}
};
// where a pet can live, and the open floor spots it sits on there (it picks one when it moves in)
export const PET_HOMES = {
  home: {n: "Home (the living room)", spots: [[160, 520], [370, 520], [330, 330]], indoor: true}, kidroom: {n: "Evan's room", spots: [[160, 520], [360, 500]], indoor: true},
  room: {n: "Your room", spots: [[300, 560], [200, 300]], indoor: true}, garage: {n: "The garage", spots: [[220, 380], [330, 560]], indoor: true},
  cottage: {n: "Ma Ma and Gong Gong's cottage", spots: [[180, 470], [360, 470]], indoor: true}, mumdad: {n: "Mum and Dad's", spots: [[200, 470], [380, 500]], indoor: true},
  marcus: {n: "Marcus and Angellina's", spots: [[200, 420], [380, 560]], indoor: true}, scoopshop: {n: "The Scoop Shack", spots: [[140, 450], [420, 440]], indoor: true},
  wineshop: {n: "The wine shop", spots: [[160, 470], [420, 470]], indoor: true}, chord: {n: "The Chord workshop", spots: [[170, 470], [420, 440]], indoor: true},
  chico: {n: "Chico cottage", spots: [[180, 420], [380, 470]], indoor: true}, luna: {n: "The Luna house", spots: [[180, 420], [380, 470]], indoor: true},
  ohayo: {n: "The Ohayo house", spots: [[260, 470], [420, 470]], indoor: true},
  base: {n: "Home base (the garden)", spots: [[200, 400], [330, 430], [420, 360]]}, orchard: {n: "Ma Ma's orchard", spots: [[260, 470], [150, 330]]},
  vineyard: {n: "The vineyard", spots: [[200, 560], [330, 570]]}, field: {n: "The field", spots: [[140, 520], [300, 440]]}, shore: {n: "The foreshore", spots: [[250, 470], [210, 300]]},
  bay: {n: "The bay (by the deck)", spots: [[260, 420], [300, 560]]}
};
export const OWNER_NAME = {evan: "Evan", darren: "Darren", mama: "Ma Ma", gonggong: "Gong Gong", mum: "Mum", dad: "Dad", marcus: "Marcus", angelina: "Angellina"};
export const companions = F => (F.companions = F.companions || []);
export const homesFor = kind => Object.keys(PET_HOMES).filter(h => !PETS[kind].indoor || PET_HOMES[h].indoor);
// adopt: a pet item from the backpack goes to its new owner, living where Mel chose
export function adopt(F, item, owner, home){
  const it = ITEMS[item], kind = it && it.pet; if (!kind || !(F.inv[item] > 0) || !OWNER_NAME[owner] || !homesFor(kind).includes(home)) return null;
  const list = companions(F), taken = list.map(c => c.name), name = PETS[kind].names.find(n => !taken.includes(n)) || PETS[kind].names[0] + " " + (list.length + 1);
  F.inv[item]--; if (!F.inv[item]) delete F.inv[item];
  const used = list.filter(c => c.scene === home).map(c => c.spot), spot = PET_HOMES[home].spots.findIndex((_, i) => !used.includes(i));
  const c = {id: "p" + Date.now().toString(36), kind, name, owner, scene: home, spot: spot < 0 ? list.length % PET_HOMES[home].spots.length : spot, since: Date.now()};
  list.push(c); return c;
}
export const petAt = c => { const h = PET_HOMES[c.scene]; return h ? h.spots[c.spot % h.spots.length] : [260, 470]; };
// the owner and the pet together: what they say (a few per kind, and a few for anyone)
const PLAY = {kitten: ["{o} dangles a ribbon. {p} pounces!", "{p} curls up on {o}'s lap and purrs."], puppy: ["{o} throws a stick. {p} brings it back. Again! Again!", "{p} rolls over for a tummy rub from {o}."],
  bunny: ["{o} offers {p} a carrot top. Nibble nibble.", "{p} does a happy binky around {o}'s feet."], hamster: ["{o} lets {p} run across their hands.", "{p} stuffs both cheeks with seeds while {o} giggles."],
  goldfish: ["{o} sprinkles a pinch of flakes. {p} does a little twirl.", "{o} taps the bowl gently. {p} swims over to say hello."], budgie: ["{p} hops onto {o}'s finger and chirps a song.", "{o} whistles. {p} whistles back!"],
  tortoise: ["{o} feeds {p} a strawberry. Very, very slowly, it's gone.", "{p} pokes its head out to see {o}."], duckling: ["{p} waddles after {o} everywhere.", "{o} fills a little dish of water. {p} splashes in it."]};
const OWNER_SAYS = {evan: ["Mama, look! {p} likes me!", "{p} is my BEST friend!"], darren: ["Who's a good {k}? You are.", "{p} and I are watching the game later."], mama: ["Aiyo, {p} so cute! Ma Ma give you snack.", "{p} keeps Ma Ma company in the afternoon."],
  gonggong: ["{p} and Gong Gong, two old friends.", "Gong Gong talks to {p} every morning."], mum: ["{p} came to Zumba with me! Well, watched.", "Isn't {p} the sweetest?"], dad: ["I'm drawing {p}. Hold still, {p}!", "{p} likes my piano playing."],
  marcus: ["{p} is my new gym buddy, Zeh.", "Best present, Zeh. Seriously."], angelina: ["{p} sits with me while I study.", "I love {p} so much. Thank you, Mel!"]};
export const fill = (s, c) => s.replace(/\{o\}/g, OWNER_NAME[c.owner]).replace(/\{p\}/g, c.name).replace(/\{k\}/g, PETS[c.kind].n);
export const playLine = c => fill(PLAY[c.kind][hash(c.id + dayKey()) % PLAY[c.kind].length], c);
export const ownerLine = c => fill(OWNER_SAYS[c.owner][hash(c.id + dayKey() + "o") % OWNER_SAYS[c.owner].length], c);
export function petPanel(F, c, ownerHere){
  if (!c) return "";
  const today = dayKey(), played = c.playDay === today;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(c.name)}</h2><p class="sub">${esc(OWNER_NAME[c.owner])}'s ${esc(PETS[c.kind].n)}, living at ${esc(PET_HOMES[c.scene].n.replace(/ \(.*\)$/, ""))}.${ownerHere ? ` ${esc(OWNER_NAME[c.owner])}'s here too.` : ""}</p>
    <div class="actions"><button class="btn primary" data-petdo="pat">Give ${esc(c.name)} a pat</button>${ownerHere ? `<button class="btn alt" data-petdo="play" ${played ? "disabled" : ""}>${played ? "Played together today" : `Play with ${esc(OWNER_NAME[c.owner])}`}</button>` : ""}</div>
    ${ownerHere ? "" : `<p class="muted">When ${esc(OWNER_NAME[c.owner])}'s here too, they can play together.</p>`}
    <form class="row hadd" data-petname="1"><label class="sr" for="petName">Name</label><input id="petName" maxlength="20" value="${esc(c.name)}"><button class="btn small alt">Rename</button></form>
    <label class="sr" for="petHome">Move home</label><select id="petHome" data-pethome="1">${homesFor(c.kind).map(h => `<option value="${h}" ${h === c.scene ? "selected" : ""}>${esc(PET_HOMES[h].n)}</option>`).join("")}</select>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// adopting: who it's for, then where it'll live (st: {owner})
export function adoptPanel(F, item, st){
  const it = ITEMS[item]; if (!it) return "";
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(it.n)}</h2><p class="sub">${esc(it.line)}</p>`;
  if (!st.owner) return h + `<p class="eyebrow" style="margin:8px 0 6px">Who'll look after it?</p><div class="actions">${Object.keys(OWNER_NAME).map(o => `<button class="btn small alt" data-adoptfor="${o}">${esc(OWNER_NAME[o])}</button>`).join("")}</div>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  return h + `<p class="eyebrow" style="margin:8px 0 6px">${esc(OWNER_NAME[st.owner])}'s new ${esc(PETS[it.pet].n)}. Where will it live?</p><div class="vhelp">${homesFor(it.pet).map(hm => `<button class="vhelpi" data-adoptat="${hm}"><span><b>${esc(PET_HOMES[hm].n)}</b></span></button>`).join("")}</div>
    <div class="actions"><button class="btn alt small" data-adoptback="1">Back</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
// the pets on this screen, sitting on their spots, each bobbing gently
const ink = `style="stroke:var(--line)" stroke-width="1.2" stroke-linejoin="round"`;
export function petArt(kind, x, y){
  const c = PETS[kind].col, f = col => `style="fill:${col};stroke:var(--line)" stroke-width="1.2" stroke-linejoin="round"`, eye = (ex, ey) => `<circle cx="${ex}" cy="${ey}" r="1.1" fill="#2F2B28"/>`;
  const body = {
    kitten: `<ellipse cx="0" cy="-7" rx="9" ry="6" ${f(c)}/><circle cx="7" cy="-14" r="5.5" ${f(c)}/><path d="M3 -18 l1 -5 l3 3z M9 -19 l2 -4 l1 5z" ${f(c)}/><path d="M-9 -8 q-6 -6 -3 -12" fill="none" ${ink}/>${eye(6, -14)}${eye(9.5, -14)}`,
    puppy: `<ellipse cx="0" cy="-7" rx="10" ry="6" ${f(c)}/><circle cx="8" cy="-14" r="6" ${f(c)}/><ellipse cx="4" cy="-14" rx="2.4" ry="4.5" ${f("#8A5A3A")}/><path d="M-10 -9 q-5 -4 -4 -9" fill="none" ${ink}/>${eye(8, -15)}${eye(11.5, -15)}<circle cx="13.5" cy="-12.5" r="1.2" fill="#2F2B28"/>`,
    bunny: `<ellipse cx="0" cy="-7" rx="8" ry="6" ${f(c)}/><circle cx="6" cy="-13" r="5" ${f(c)}/><ellipse cx="4" cy="-22" rx="1.8" ry="5" ${f(c)}/><ellipse cx="8" cy="-22" rx="1.8" ry="5" ${f(c)}/><circle cx="-8" cy="-8" r="2.5" ${f("#FFFDF6")}/>${eye(7, -13)}`,
    hamster: `<ellipse cx="0" cy="-6" rx="8" ry="6.5" ${f(c)}/><circle cx="-4" cy="-11" r="2" ${f(c)}/><circle cx="4" cy="-11" r="2" ${f(c)}/><ellipse cx="0" cy="-4" rx="4.5" ry="3" style="fill:#FFFDF6"/>${eye(-2.5, -7)}${eye(2.5, -7)}`,
    goldfish: `<ellipse cx="0" cy="-10" rx="10" ry="10" style="fill:#DCEBF2;stroke:var(--line)" stroke-width="1.2" opacity=".9"/><path d="M-3 -10 q4 -4 8 0 q-4 4 -8 0z M-3 -10 l-4 -3 v6z" ${f(c)}/><rect x="-8" y="-21" width="16" height="3" rx="1" style="fill:#FFFDF6;stroke:var(--line)" stroke-width="1"/>`,
    budgie: `<path d="M-4 0 v-6 M2 0 v-6" ${ink}/><ellipse cx="0" cy="-11" rx="6" ry="7.5" ${f(c)}/><circle cx="1" cy="-18" r="4" ${f("#F3E07A")}/><path d="M4 -17 l3 1 l-3 1z" style="fill:#F2A65A"/><path d="M-5 -6 l-5 6" ${ink}/>${eye(2, -19)}`,
    tortoise: `<path d="M-11 -3 q0 -12 11 -12 q11 0 11 12z" ${f(c)}/><path d="M-5 -10 l5 -3 l5 3 M-7 -5 h14" fill="none" ${ink} opacity=".6"/><ellipse cx="13" cy="-6" rx="4" ry="3" ${f("#B9D98A")}/>${eye(14, -7)}`,
    duckling: `<ellipse cx="0" cy="-6" rx="7" ry="5.5" ${f(c)}/><circle cx="5" cy="-13" r="4.5" ${f(c)}/><path d="M9 -13 l4 1 l-4 1.5z" style="fill:#F2A65A;stroke:var(--line)" stroke-width=".8"/>${eye(6, -14)}`
  }[kind];
  return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="10" ry="2.6" fill="rgba(60,40,30,.16)"/><g class="petbob">${body}</g></g>`;
}
export function petsIn(F, scene){
  return companions(F).filter(c => c.scene === scene && PETS[c.kind]).map(c => { const [x, y] = petAt(c);
    return `<g data-pet="${c.id}" aria-label="${esc(c.name)}, ${esc(OWNER_NAME[c.owner])}'s ${esc(PETS[c.kind].n)}"><ellipse class="hov" cx="${x}" cy="${y}" rx="16" ry="6" style="fill:var(--butter)"/>${petArt(c.kind, x, y)}</g>`; }).join("");
}
