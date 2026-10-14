// Portovenere's rooms and things to join in with (rounds 211 to 213). The shops sell TOWN_GOODS (ronda.js buyGood,
// the shared data-rbuy buttons). Three things to take part in, each more than a speech bubble:
//   stuffing mussels with Rosa at the co-op (open them, fill them with the right things, tie them with thread: a tray
//   to eat, and her recipe), writing a line in the Poets' bookshop's visitors' book (pick a beginning, a middle and an
//   end: Signora Bianca copies it out and frames it for you), and the choir at San Pietro (11 to 12 and 4 to 5, Don
//   Piero there: listen, then join the last note). Evan joins in each. And the harbour cats, for Evan.
// The poet's notebook (round 213): a line of poetry from six corners of town (the castle, the swifts on the fig slope,
// Byron's Grotto, the choir, the mussel ropes, the strait). All six: a red notebook to keep.
// State: F.porto = {lines: {castle: day, ...}, notebook, muscoli, stuffed, verses: [...], choir, treats, cats}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";

export function pvState(F){ F.porto = F.porto || {}; F.porto.lines = F.porto.lines || {}; F.porto.verses = F.porto.verses || []; return F.porto; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const treats = (F, menu, act) => `<ul class="hlist wlist">${Object.entries(menu).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-pv="${act}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;
export function treat(F, menu, k){ const t = menu[k]; if (!t || F.coins < t[1]) return null; F.coins -= t[1]; const c = pvState(F); c.treats = (c.treats || 0) + 1; return t; }

/* ---------- the poet's notebook ---------- */
export const LINES = {
  castle: ["The castle", "Old stones remember every sail.", "pvcastle"], swifts: ["The swifts", "The swifts write circles no one reads.", "pvfigs"],
  grotto: ["Byron's Grotto", "The sea goes in, and comes out singing.", "pvgrotto"], church: ["The choir", "Black and white, and the last note gold.", "pvchoir"],
  ropes: ["The mussel ropes", "Patience grows on ropes in the dark.", "pvropes"], strait: ["The strait", "An island close enough to wave to.", "pvpalmaria"]};
export function earnLine(F, k, addInv){ const c = pvState(F); if (!LINES[k] || c.lines[k]) return null; c.lines[k] = dayKey();
  const all = Object.keys(LINES).every(x => c.lines[x]); if (all && !c.notebook) { c.notebook = dayKey(); addInv("pv_notebook", 1); }
  return {name: LINES[k][0], line: LINES[k][1], all}; }
export const lineCount = F => Object.keys(pvState(F).lines).filter(k => LINES[k]).length;

/* ---------- stuffing mussels with Rosa ---------- */
// Open three mussels with the little knife; fill them with the right four things (Rosa tuts at the wrong ones); tie
// each one shut with cotton thread (three). Then they go into her tomato sauce: a tray to eat, and the recipe.
export const STUFF = {price: 6, OPEN: 3, TIE: 3, fill: ["Bread soaked in milk", "Mortadella", "An egg", "Grated parmesan", "Parsley"], wrong: ["Lemon", "Chocolate", "Pesto"]};
export const stuffStart = () => ({open: 0, fill: [], tie: 0, oops: false});
export function stuffStep(st, what, v){
  if (what === "open") { if (st.open >= STUFF.OPEN) return false; st.open++; return true; }
  if (what === "fill") { if (st.open < STUFF.OPEN || st.fill.length >= 4) return false; if (STUFF.wrong.includes(v)) { st.oops = true; return "oops"; } if (!STUFF.fill.includes(v) || st.fill.includes(v)) return false; st.fill.push(v); st.oops = false; return true; }
  if (what === "tie") { if (st.fill.length < 4 || st.tie >= STUFF.TIE) return false; st.tie++; return true; }
  return false; }
export const stuffDone = st => st.open >= STUFF.OPEN && st.fill.length >= 4 && st.tie >= STUFF.TIE;
export function finishStuff(F){ if (F.coins < STUFF.price) return null; F.coins -= STUFF.price; const c = pvState(F); const first = !c.muscoli; c.muscoli = true; c.stuffed = (c.stuffed || 0) + 1; return {first}; }
export function musselsPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The mussel co-op</h2><p class="sub">Crates of shining black mussels straight off the ropes, a long steel table, and Rosa, sleeves rolled up, already halfway through a sack.</p>`;
  h += `<h3 class="ph3">Stuff mussels with Rosa · ${STUFF.price} ${coin()}</h3>`;
  if (!st) h += `<p class="muted">Muscoli ripieni: open them, fill them, tie them shut, and into her tomato sauce they go. A tray to eat, ${pvState(F).muscoli ? "and you know the recipe now" : "and she'll give you the recipe"}.${evan ? " Evan gets the job of handing over the thread, one piece at a time." : ""}</p><div class="actions"><button class="btn primary" data-pv="stuff" ${F.coins >= STUFF.price ? "" : "disabled"}>Roll up your sleeves</button></div>`;
  else if (!stuffDone(st)) {
    if (st.open < STUFF.OPEN) h += `<p class="muted">Slide the little knife in at the hinge and twist: ${st.open}/${STUFF.OPEN} open.</p><div class="actions"><button class="btn primary big" data-pv="open">Open one</button></div>`;
    else if (st.fill.length < 4) h += `<p class="muted">Now the filling. Four things go in.${st.fill.length ? ` In so far: ${esc(st.fill.join(", ").toLowerCase())}.` : ""}${st.oops ? ` Rosa: "No! Never that. Never, never."` : ""}</p>
      <div class="gchips">${[...STUFF.fill, ...STUFF.wrong].sort().map(f => `<button class="gchip${st.fill.includes(f) ? " on" : ""}" data-pv="fill:${esc(f)}" ${st.fill.includes(f) ? "disabled" : ""}><span>${esc(f)}</span></button>`).join("")}</div>`;
    else h += `<p class="muted">Tie each one shut with cotton thread so the filling stays in: ${st.tie}/${STUFF.TIE}.</p><div class="actions"><button class="btn primary big" data-pv="tie">Tie it</button></div>`;
  } else h += `<p class="muted">Into the pan of tomato sauce they go, bubbling gently. Rosa tastes one, closes her eyes, and nods. "Brava. Next year I give you a rope."</p><div class="actions"><button class="btn primary" data-pv="stuffdone" ${F.coins >= STUFF.price ? "" : "disabled"}>Eat them on the quay · ${STUFF.price} ${coin()}</button></div>`;
  return h + list(F, "pv_mussels", "Fresh off the ropes") + shut;
}

/* ---------- a line in the Poets' visitors' book ---------- */
export const VERSE = {a: ["Here, where the poets walked,", "Above the striped church,", "Between the castle and the sea,", "On a morning made of light,"],
  b: ["the swifts are writing", "the boats are dreaming", "the water holds", "my family laughs"], c: ["the whole blue afternoon.", "a song for Honeybrook.", "something I'll keep for ever.", "and I am home, and away."]};
export const verseOf = st => st && st.a != null && st.b != null && st.c != null ? `${VERSE.a[st.a]} ${VERSE.b[st.b]} ${VERSE.c[st.c]}` : "";
export function writeVerse(F, st, addInv){ const v = verseOf(st); if (!v) return null; const c = pvState(F); const first = !c.verses.length; c.verses.push(v); if (first) addInv("pv_verse", 1); return {verse: v, first}; }
export function versePanel(F, st = {}, evan){
  const c = pvState(F), pick = (k, opts) => `<div class="gchips">${opts.map((o, i) => `<button class="gchip${st[k] === i ? " on" : ""}" data-pv="${k}:${i}" aria-pressed="${st[k] === i}"><span>${esc(o)}</span></button>`).join("")}</div>`;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The visitors' book</h2><p class="sub">A huge old book on a stand, its pages soft as cloth. Signora Bianca's grandmother started it in 1922. "One line," says Signora Bianca. "Everyone who comes writes one line. Make it a good one. No pressure."</p>
    ${c.verses.length ? `<p class="muted">Your lines so far: ${c.verses.map(v => `"${esc(v)}"`).join(" ")}</p>` : ""}
    <p class="eyebrow">Begin</p>${pick("a", VERSE.a)}<p class="eyebrow">Then</p>${pick("b", VERSE.b)}<p class="eyebrow">And end</p>${pick("c", VERSE.c)}
    ${verseOf(st) ? `<p style="font-family:'Klee One',serif;font-size:1.1rem;text-align:center;margin:12px 0">"${esc(verseOf(st))}"</p>` : ""}${evan ? `<p class="muted">Evan adds a drawing of a cat underneath. It's very good. It has nine legs.</p>` : ""}
    <div class="actions"><button class="btn primary" data-pv="write" ${verseOf(st) ? "" : "disabled"}>Write it in the book</button></div>` + shut;
}
export function booksPanel(F){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The Poets' bookshop</h2><p class="sub">Shelves to the ceiling, a ladder on wheels, a portrait of Byron looking pleased with himself. Signora Bianca peers over her glasses. "Ah. A reader. I can always tell."</p>` + list(F, "pv_books") + `<div class="actions"><button class="btn alt" data-pv="verseopen">The visitors' book</button></div>` + shut; }

/* ---------- the choir at San Pietro ---------- */
export const CHOIR = {times: [[11*60, 12*60], [16*60, 17*60]], LISTEN: 3, verses: ["A long low note from the basses, like the sea breathing in.", "The altos come in, then the sopranos, high and clear, and the whole stone church hums.", "Matteo reaches for the top note... and gets it. Don Piero raises one eyebrow, very pleased."]};
export const choirOn = hm => CHOIR.times.some(([f, t]) => hm >= f && hm < t);
export const choirStart = () => ({listen: 0, sung: false});
export function choirListen(st){ if (st.listen >= CHOIR.LISTEN) return false; st.listen++; return true; }
export function finishChoir(F){ const c = pvState(F); c.choir = (c.choir || 0) + 1; return c.choir; }
export function choirPanel(F, st, {hm, evan, here}){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>San Pietro</h2><p class="sub">Black and white stripes of stone, cool air, candles, and a window full of sea. The choir stalls are carved with fish and ships.</p>`;
  if (!choirOn(hm) || !here) return h + `<p class="muted">${choirOn(hm) ? "The choir's still gathering. A minute more." : "The choir rehearses at eleven and at four. Come back then, and sit in."}</p>` + shut;
  if (!st) return h + `<h3 class="ph3">Sit in on the rehearsal</h3><p class="muted">Don Piero nods you to the end of a pew. "Listen," he whispers. "And at the end, if you like, sing the last note with us."${evan ? " Evan sits very, very still, which is a miracle." : ""}</p><div class="actions"><button class="btn primary" data-pv="choir">Sit and listen</button></div>` + shut;
  if (st.listen < CHOIR.LISTEN) return h + `<p class="muted">${esc(CHOIR.verses[st.listen])}</p><div class="actions"><button class="btn primary" data-pv="listen">Keep listening</button></div>`;
  return h + `<p class="muted">The last line. Don Piero turns, and nods at you.</p><div class="actions"><button class="btn primary big" data-pv="lastnote">Sing the last note</button></div>`;
}

/* ---------- the bar, the bottega, the shell shop ---------- */
export const BAR = {coffee: ["A coffee at the counter", 2, "Tiny, black, perfect, drunk standing up like everyone else."], aperitivo: ["Aperitivo by the water", 4, "A cold drink, a bowl of olives, little squares of pizza, and the boats going by."],
  pandolce: ["A slice of pandolce", 3, "Dense and sweet with raisins, pine nuts and a little fennel. Tonio's mother's."], biscotti: ["Chestnut biscuits", 2, "Crunchy, nutty, just sweet enough. Made for dunking."]};
export function barPanel(F, evan){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The bar on the quay</h2><p class="sub">Tonio's little bar, its doors open onto the harbour, tables almost in the water. "Sit! I bring things."</p>${treats(F, BAR, "bar")}${evan ? `<p class="muted">Evan's gets a little paper boat folded from a napkin.</p>` : ""}` + list(F, "pv_bar", "From the deli shelf") + shut; }
export function bottegaPanel(F){ return `<span class="tape gingham" aria-hidden="true"></span><h2>Ilario's bottega</h2><p class="sub">Marble dust in the sunbeams, the tap-tap of a chisel, and shelves of black stone veined with gold. Ilario doesn't look up. "Look. Touch. Buy, if you like."</p>` + list(F, "pv_bottega") + shut; }
export function shellsPanel(F){ return `<span class="tape gingham" aria-hidden="true"></span><h2>Signora Lia's shells</h2><p class="sub">Every surface covered in shells: mobiles turning overhead, boxes and mirrors and wreaths, baskets you could run your fingers through. Lia holds a shell to your ear. "Hear that? That's Palmaria."</p>` + list(F, "pv_shells", "To take home") + shut; }

export function portoPanel(F, view, st = {}){
  return view === "pv_mussels" || view === "pvstuff" ? musselsPanel(F, st.stuff, st.evan) : view === "pv_bar" ? barPanel(F, st.evan) : view === "pv_bottega" ? bottegaPanel(F)
    : view === "pv_books" ? booksPanel(F) : view === "pvverse" ? versePanel(F, st.verse, st.evan) : view === "pv_shells" ? shellsPanel(F)
    : view === "pvchoir" ? choirPanel(F, st.choir, st) : "";
}
