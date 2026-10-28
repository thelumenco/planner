// The terrace's week (round 152, Mel: "the terrace doesn't get much action other than Sunday lunch"). Once the wine
// shop has its terrace:
//   weddings: the second Saturday of every month (and the fourth too, October to March, wedding season), 2 to 7pm. An
//     out-of-town couple and their people (data/terrace-people.js): the ceremony under the flower arch at 2, the
//     wedding breakfast at the long table at 3, the first dance at 5 and then everyone up dancing, the bouquet at 6:30.
//     Booked weeks ahead: the bookings book shows them coming. Sparkling by the case.
//   trivia night: every Wednesday, 7 to 9pm. Amara with the microphone, questions up on a projector screen on the
//     pergola, village teams at the long table, and Mel can join in with Darren and Angellina: 10 a team, five rounds of
//     four, and the winners take the pot.
//   sip and paint: every Thursday, 2 to 4pm. Dad teaches (his easel at home finally gets company), villagers at easels,
//     a glass of something; Mel can paint too, and takes her painting home.
//   the occasions: Valentine's dinner (14 February, 6 to 10pm, candles and couples), Christmas Day lunch (the whole
//     family at the long table, crackers and paper crowns, 12 to 4), New Year's Eve (8pm till half past midnight,
//     dancing and a countdown), and Mother's Day (the second Sunday in May: the long lunch, with Mum and Ma Ma as guests
//     of honour; lunch.js).
import { esc, dayKey, hash } from "../util.js";
import { SEATS } from "./lunch.js";
import { WEDDINGS } from "../data/terrace-people.js";
import { QUIZ_ROUNDS } from "../data/trivia.js";

const dowOf = day => new Date(day + "T00:00:00Z").getUTCDay();
const md = day => day.slice(5);
const addDays = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n*864e5).toISOString().slice(0, 10);
export const OCC = {
  wedding: {n: "A wedding", from: 14*60, to: 19*60, guests: 9, drink: 1.4, food: true},
  trivia: {n: "Trivia night", from: 19*60, to: 21*60, guests: 11, drink: .9, food: true},
  paint: {n: "Sip and paint", from: 14*60, to: 16*60, guests: 7, drink: .7, food: false, glasses: true},
  valentine: {n: "Valentine's dinner", from: 18*60, to: 22*60, guests: 10, drink: 1.2, food: true},
  christmas: {n: "Christmas Day lunch", from: 12*60, to: 16*60, guests: 7, drink: 1.1, food: true},
  nye: {n: "New Year's Eve", from: 20*60, to: 24*60 + 30, guests: 16, drink: 1.3, food: false}
};
export const mothersDay = day => md(day).startsWith("05-") && dowOf(day) === 0 && +day.slice(8) >= 8 && +day.slice(8) <= 14;
const weddingDay = day => { if (dowOf(day) !== 6) return false; const d = +day.slice(8), m = +day.slice(5, 7); return (d >= 8 && d <= 14) || (d >= 22 && d <= 28 && (m >= 10 || m <= 3)); };
export function weddingOn(day){ if (!weddingDay(day)) return null; const m = +day.slice(5, 7) + +day.slice(0, 4)*12, n = (m*2 + (+day.slice(8) > 20 ? 1 : 0)) % WEDDINGS.length; return WEDDINGS[n]; }
// round 284 (Mel: "it says they buy sparkling by the case, does that really happen?"): each couple orders two to four
// cases of sparkling ahead; on the day Celeste brings them up from your cellar (vineyard.js sellTick)
export const weddingCases = day => weddingOn(day) ? 2 + hash(day + ":cases") % 3 : 0;
// what's on the terrace that day (the special days win), or null
export function occasionOn(day){
  if (md(day) === "12-25") return "christmas"; if (md(day) === "12-31") return "nye"; if (md(day) === "02-14") return "valentine";
  if (weddingOn(day)) return "wedding"; if (dowOf(day) === 3) return "trivia"; if (dowOf(day) === 4) return "paint"; return null;
}
// on right now? (the game's day turns over at 2am, so New Year's Eve runs on past midnight as the 31st)
export function occasionNow(day = dayKey(), hm){
  const k = occasionOn(day); if (!k) return null; const o = OCC[k], t = k === "nye" && hm < 2*60 ? hm + 24*60 : hm;
  return t >= o.from && t < o.to ? {kind: k, ...o} : null;
}

/* ---------- who's where ---------- */
const TRIVIA = {master: "amara", teams: [{n: "The Quizzly Bears", ids: ["hana", "okada", "lin"]}, {n: "Les Vignerons", ids: ["celeste", "farid", "mei"]}, {n: "Bo Knows", ids: ["bo", "opal", "theo"]}], mine: ["darren", "angelina"]};
const PAINT = {teacher: "dad", ids: ["juniper", "wren", "noor", "elena", "felix", "lila"]};
const EASELS = [[150, 330, -1], [150, 420, -1], [150, 510, -1], [370, 330, 1], [370, 420, 1], [370, 510, 1]];
const VALENTINE = [["mum", "dad"], ["marcus", "angelina"], ["mama", "gonggong"], ["aiko", "hiro"], ["rosa", "bastien"]];
const CHRISTMAS = ["mama", "gonggong", "mum", "dad", "marcus", "angelina", "darren"];
const NYE = ["mum", "dad", "marcus", "angelina", "darren", "hana", "okada", "juniper", "bo", "opal", "theo", "felix", "elena", "farid", "mei", "celeste"];
const KNOTS = [[130, 350], [130, 470], [130, 560], [390, 360], [390, 470], [390, 560]];
const MOVES = ["dance", "boogie", "armsup", "twirl", "shuffle"];
const seat = i => ({at: [SEATS[i][0], SEATS[i][1]], dir: SEATS[i][2], act: "sit"});
const dancer = (id, i, day) => { const [cx, cy] = KNOTS[i % KNOTS.length], h = hash(day + id), a = (h % 12)/12*Math.PI*2;
  return {at: [Math.round(cx + Math.cos(a)*24), Math.round(cy + Math.sin(a)*12)], dir: Math.cos(a) > 0 ? -1 : 1, act: MOVES[h % MOVES.length]}; };
// the wedding's afternoon in phases
export const WED = {ceremony: [14*60, 15*60], breakfast: [15*60, 17*60], first: [17*60, 17*60 + 15], dancing: [17*60 + 15, 19*60], bouquet: 18*60 + 30};
function weddingPlace(w, id, day, hm){
  const i = w.ids.indexOf(id); if (i < 0) return null;
  if (hm < WED.ceremony[1]) return i < 2 ? {at: [248 + i*24, 280], dir: i ? -1 : 1, act: null, w: WED.ceremony} : {...seat(i), w: WED.ceremony};
  if (hm < WED.breakfast[1]) return {...seat(i), w: WED.breakfast};
  if (hm < WED.first[1]) return i < 2 ? {at: [140 + i*22, 420], dir: i ? -1 : 1, act: "twirl", w: WED.first} : {...seat(i), w: WED.first};
  return {...dancer(id, i, day), w: WED.dancing};
}
// npcs.js: where someone is during an occasion on the terrace (needs the terrace built)
export function occasionSlot(id, day, hm, terrace){
  if (!terrace) return null; const oc = occasionNow(day, hm); if (!oc) return null; const o = OCC[oc.kind];
  const slot = (p, w = [o.from, o.to]) => p && {from: w[0], to: w[1], scene: "terrace", at: p.at, dir: p.dir, act: p.act || undefined, occasion: oc.kind};
  if (oc.kind === "wedding") { const w = weddingOn(day), p = weddingPlace(w, id, day, hm); return p && slot(p, p.w); }
  if (oc.kind === "trivia") { if (id === TRIVIA.master) return slot({at: [352, 286], dir: -1, act: "point"});
    const all = [...TRIVIA.teams.flatMap(t => t.ids), ...TRIVIA.mine], i = all.indexOf(id); return i < 0 ? null : slot(seat(i)); }
  if (oc.kind === "paint") { if (id === PAINT.teacher) return slot({at: [260, 276], dir: 1, act: "point"}); const i = PAINT.ids.indexOf(id); return i < 0 ? null : slot({at: [EASELS[i][0], EASELS[i][1]], dir: EASELS[i][2], act: "paint"}); }
  if (oc.kind === "valentine") { const i = VALENTINE.flat().indexOf(id); return i < 0 ? null : slot(seat(i)); }
  if (oc.kind === "christmas") { const i = CHRISTMAS.indexOf(id); return i < 0 ? null : slot(seat(i)); }
  if (oc.kind === "nye") { const i = NYE.indexOf(id); return i < 0 ? null : slot(dancer(id, i, day), [20*60, 24*60 + 30]); }
  return null;
}
export const dancingNow = (day, hm) => { const oc = occasionNow(day, hm); return !!oc && (oc.kind === "nye" || (oc.kind === "wedding" && hm >= WED.first[0])); };

/* ---------- trivia ---------- */
// five rounds of four; the night's twenty are picked from each round's pool by the date. [question, [answers], right index]
// round 302 (Mel: "Can I have more variety of trivia questions?"): the bank lives in data/trivia.js, eleven rounds of
// twenty; each night plays four of them, picked by the date, and Honeybrook to finish
export const QUIZ = {entry: 10, house: 10, rounds: QUIZ_ROUNDS};
// (the answers come in a different order each night, so the right one isn't always first)
// (the shared string hash barely changes from one date to the next, so the picks go through a mixer first)
const mix = s => { let h = hash(s); h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); return (h ^ (h >>> 16)) >>> 0; };
const shuffleQ = (q, key) => { const order = [0, 1, 2].map(i => [mix(key + ":" + i), i]).sort((a, b) => a[0] - b[0]).map(([, i]) => i); return [q[0], order.map(i => q[1][i]), order.indexOf(q[2])]; };
export function nightRounds(day){ const home = QUIZ.rounds.length - 1;
  return [...QUIZ.rounds.slice(0, home).map((x, r) => [mix(day + ":round" + r), x, r]).sort((a, b) => a[0] - b[0]).slice(0, 4).map(([, x, r]) => [x, r]), [QUIZ.rounds[home], home]]; }
export function quizFor(day){ return nightRounds(day).map(([[n, pool], r]) => ({n, qs: pool.map((q, i) => [mix(day + ":" + r + ":" + i), q, i]).sort((a, b) => a[0] - b[0]).slice(0, 4).map(([, q, i]) => shuffleQ(q, day + r + ":" + i))})); }
// the other teams' scores out of twenty, set by the night
export const rivalScores = day => TRIVIA.teams.map((t, i) => ({n: t.n, score: 10 + hash(day + ":team" + i) % 8}));
export const triviaStart = (day, team) => ({day, team, r: 0, q: 0, score: 0, picked: null, done: false, rounds: quizFor(day)});
export function triviaAnswer(st, a){ if (st.done || st.picked != null) return null; const q = st.rounds[st.r].qs[st.q], ok = a === q[2]; st.picked = a; if (ok) st.score++; return ok; }
export function triviaNext(st){ if (st.picked == null) return; st.picked = null; st.q++; if (st.q >= 4) { st.q = 0; st.r++; } if (st.r >= st.rounds.length) st.done = true; }
export function triviaResult(st){ const rivals = rivalScores(st.day), best = Math.max(...rivals.map(t => t.score)), pot = QUIZ.entry*(rivals.length + 1) + QUIZ.house;
  return {rivals, pot, place: 1 + rivals.filter(t => t.score > st.score).length, win: st.score > best, tie: st.score === best}; }
export const TEAM_NAMES = ["Mel's Marvels", "Quiz Khalifa", "The Honey Badgers", "Vin Diesel"];
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
export function triviaPanel(F, st, o = {}){
  const tape = `<span class="tape stripe" aria-hidden="true"></span>`;
  let h = tape + `<h2>Trivia night</h2>`;
  if (!o.on) return h + `<p class="sub">Every Wednesday, 7 to 9pm on the terrace: Amara on the microphone, the questions up on the big screen, and teams round the long table. Ten coins a team; the winners take the pot.</p>` + shut;
  if (o.played) return h + `<p class="sub">You've played tonight. ${esc(o.played)}</p>` + shut;
  if (!st) return h + `<p class="sub">Amara taps the microphone. "Teams! Grab your pencils." Darren and Angellina have saved you a seat. Pick a team name, ten coins in the jar, and you're in. Five rounds of four.</p>
    <p class="eyebrow" style="margin:10px 0 6px">Your team</p><div class="gchips">${TEAM_NAMES.map((n, i) => `<button class="gchip" data-trv="join:${i}" ${F.coins >= QUIZ.entry ? "" : "disabled"}>${esc(n)}</button>`).join("")}</div><p class="muted">Ten coins a team. Tonight's pot: ${QUIZ.entry*4 + QUIZ.house} coins.</p>` + shut;
  if (st.done) { const r = triviaResult(st); const table = [...r.rivals, {n: st.team, score: st.score, me: true}].sort((a, b) => b.score - a.score);
    return h + `<p class="sub">${r.win ? `${esc(st.team)} win! Amara hands over the jar: ${r.pot} coins.` : r.tie ? "A tie for first! A tiebreaker: how many steps up to the lighthouse balcony at Lighthouse Point?" : `${["", "Second", "Third", "Fourth"][r.place - 1] || "A brave effort"}. There's always next Wednesday.`}</p>
      <ul class="hlist lunchbook">${table.map(t => `<li><b>${t.score}</b><span>${t.me ? `<strong>${esc(t.n)}</strong>` : esc(t.n)}</span><small>out of 20</small></li>`).join("")}</ul>
      ${r.tie ? `<div class="actions">${[96, 128, 160].map(n => `<button class="btn small alt" data-trv="tie:${n}">${n}</button>`).join("")}</div>` : `<div class="actions"><button class="btn primary" data-trv="end">Pencils down</button></div>`}`; }
  const R = st.rounds[st.r], q = R.qs[st.q];
  h += `<p class="eyebrow">Round ${st.r + 1}: ${esc(R.n)} · question ${st.q + 1} of 4</p><div class="trvscreen"><p>${esc(q[0])}</p></div><div class="trvans">${q[1].map((a, i) => `<button class="btn small ${st.picked == null ? "alt" : i === q[2] ? "primary" : i === st.picked ? "alt wrong" : "alt"}" data-trv="ans:${i}" ${st.picked == null ? "" : "disabled"}>${esc(a)}</button>`).join("")}</div>`;
  return h + (st.picked != null ? `<p class="muted">${st.picked === q[2] ? "Right!" : `It was ${esc(q[1][q[2]])}.`} ${st.score} so far.</p><div class="actions"><button class="btn primary" data-trv="next">Next question</button></div>` : `<p class="muted">${st.score} so far.</p>`);
}
export function finishTrivia(F, st, tie){ const r = triviaResult(st), win = r.win || (r.tie && tie === 128), t = F.terraceEv = F.terraceEv || {};
  t.trivia = dayKey(); t.quizzes = (t.quizzes || 0) + 1; if (win) { F.coins += r.pot; t.quizWins = (t.quizWins || 0) + 1; }
  t.quizLine = `${st.team} scored ${st.score} out of 20${win ? `, and won ${r.pot} coins` : ""}.`; return {win, pot: r.pot, score: st.score}; }

/* ---------- sip and paint ---------- */
export const PAINT_SUBJECTS = {view: {n: "The lavender view", steps: [["The sky", ["#F3DDB0", "#CFE3EA", "#F4C7CF"]], ["The hills", ["#C9C3D9", "#9CB4C9", "#B5B9C9"]], ["The lavender", ["#A68FCB", "#8E78B8", "#C9B3E3"]]]},
  cypress: {n: "Cypresses at dusk", steps: [["The sky", ["#E9C9A8", "#F4C7CF", "#CFB8D9"]], ["The fields", ["#D9C99A", "#C9B27A", "#E6D7A8"]], ["The cypresses", ["#4E6A4A", "#3E5A3A", "#6E8A5A"]]]},
  still: {n: "A bottle and a glass", steps: [["The wall", ["#F3E7C8", "#E8D5C4", "#DDE6D0"]], ["The bottle", ["#7A1F3D", "#3E5A3A", "#E8D57A"]], ["The fruit", ["#E8913A", "#C8432F", "#9CC27E"]]]}};
export const PAINT_PRICE = 12;
export const paintStart = subject => PAINT_SUBJECTS[subject] ? {subject, cols: []} : null;
export function paintStep(st, i){ const s = PAINT_SUBJECTS[st.subject]; if (st.cols.length >= s.steps.length) return null; const c = s.steps[st.cols.length][1][i]; if (!c) return null; st.cols.push(c); return c; }
export const paintDone = st => st.cols.length >= PAINT_SUBJECTS[st.subject].steps.length;
export function paintingSvg(subject, cols, w = 140){ const [a = "#FFFDF6", b = "#FFFDF6", c = "#FFFDF6"] = cols, H = Math.round(w*.72);
  const body = subject === "view" ? `<rect width="140" height="100" fill="${a}"/><path d="M0 52 Q35 36 70 48 T140 44 V70 H0z" fill="${b}"/><path d="M0 70 H140 V100 H0z" fill="#D9C99A"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${i*28 - 10} 100 L${i*24 + 8} 70" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`).join("")}`
    : subject === "cypress" ? `<rect width="140" height="100" fill="${a}"/><circle cx="104" cy="40" r="10" fill="#F3C969" opacity=".8"/><path d="M0 64 H140 V100 H0z" fill="${b}"/>${[[34, 70, 1], [52, 68, .8], [110, 72, 1.1]].map(([x, y, s]) => `<path d="M${x} ${y} c${-6*s} ${-12*s} ${-6*s} ${-38*s} 0 ${-52*s} c${6*s} ${14*s} ${6*s} ${40*s} 0 ${52*s}z" fill="${c}"/>`).join("")}`
    : `<rect width="140" height="100" fill="${a}"/><path d="M0 74 H140 V100 H0z" fill="#C9A27E"/><rect x="40" y="26" width="16" height="50" rx="5" fill="${b}"/><rect x="45" y="14" width="6" height="14" fill="${b}"/><path d="M74 54 h16 q0 14 -8 16 q-8 -2 -8 -16z M82 70 v6 M76 76 h12" fill="#FFFDF6" stroke="#2F2B28" stroke-width="1"/>${[[104, 70], [116, 72], [110, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c}"/>`).join("")}`;
  return `<svg viewBox="0 0 140 100" width="${w}" height="${H}" aria-hidden="true"><g stroke="none">${body}</g><rect width="140" height="100" fill="none" stroke="#8A6A52" stroke-width="6"/></svg>`;
}
export function paintPanel(F, st, o = {}){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Sip and paint</h2>`;
  if (!o.on) return h + `<p class="sub">Every Thursday, 2 to 4pm on the terrace: Dad teaches, everyone gets an easel and a glass, and you go home with a painting. ${PAINT_PRICE} coins.</p>` + shut;
  if (o.painted) return h + `<p class="sub">You've painted today. Dad's still going round everyone's easels with a little brush, fixing horizons.</p>` + shut;
  if (!st) return h + `<p class="sub">Dad clinks a glass. "Right! Nobody's Monet, and nobody needs to be. Three layers: the background, the middle, the thing you love. Pick what you're painting."</p><div class="actions">${Object.entries(PAINT_SUBJECTS).map(([k, s]) => `<button class="btn small primary" data-pnt="sub:${k}" ${F.coins >= PAINT_PRICE ? "" : "disabled"}>${esc(s.n)}</button>`).join("")}</div><p class="muted">${PAINT_PRICE} coins, with a glass of the house white.</p>` + shut;
  const s = PAINT_SUBJECTS[st.subject];
  h += `<div class="pntcanvas">${paintingSvg(st.subject, st.cols, 200)}</div>`;
  if (paintDone(st)) return h + `<p class="sub">Dad stands back with his hands on his hips. "Now THAT's going on a wall."</p><div class="actions"><button class="btn primary" data-pnt="done">Take it home</button></div>`;
  const [step, cols] = s.steps[st.cols.length];
  return h + `<p class="eyebrow">${esc(step)}</p><div class="actions">${cols.map((c, i) => `<button class="btn small alt pntcol" data-pnt="col:${i}" aria-label="Colour ${i + 1}"><span style="background:${c}"></span></button>`).join("")}</div>`;
}
export function finishPaint(F, st, addInv){ const t = F.terraceEv = F.terraceEv || {}; t.painted = dayKey(); t.paintings = (t.paintings || 0) + 1;
  const id = "p_" + st.subject; (t.gallery = t.gallery || {})[st.subject] = st.cols.slice(); if (!(F.inv || {})[id]) { addInv(id, 1); return id; } return null; }

/* ---------- the bookings book: coming up ---------- */
const fmtD = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short", timeZone: "UTC"});
const hhmm = m => { m %= 24*60; const h = Math.floor(m/60); return `${h % 12 || 12}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${h < 12 ? "am" : "pm"}`; };
// weddings show up to six weeks ahead; the weekly nights two weeks ahead; the special days a month ahead
export function comingUp(day = dayKey()){
  const out = [];
  for (let i = 0; i < 42; i++) { const d = addDays(day, i), k = occasionOn(d); if (!k) { if (mothersDay(d) && i < 31) out.push({day: d, n: "Mother's Day long lunch", when: "12 to 3pm", note: "Mum and Ma Ma are guests of honour"}); continue; }
    if ((k === "trivia" || k === "paint") && i >= 14) continue; if ((k === "christmas" || k === "nye" || k === "valentine") && i >= 31) continue;
    const o = OCC[k], w = k === "wedding" ? weddingOn(d) : null;
    out.push({day: d, n: w ? `The wedding of ${w.couple}` : o.n, when: `${hhmm(o.from)} to ${hhmm(o.to)}`, note: w ? `${w.from}; ${weddingCases(d)} cases of sparkling ordered from your cellar` : k === "trivia" ? "teams of three, 10 a team" : k === "paint" ? "Dad teaching" : ""}); }
  return out;
}
export function comingUpHTML(day = dayKey(), terrace = true){
  if (!terrace) return `<p class="muted">You'll need the terrace first: Darren can build it, from the vineyard stall.</p>`;
  return `<ul class="hlist lunchbook">${comingUp(day).map(e => `<li><b>${esc(fmtD(e.day))}</b><span>${esc(e.n)}</span><small>${esc(e.when)}${e.note ? ` · ${esc(e.note)}` : ""}</small></li>`).join("")}</ul>`;
}
