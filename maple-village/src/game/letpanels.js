// The holiday cottages' panels (round 236): for sale, choosing the look, the catalogue, one piece, the bookings
// calendar, the guest book and the changeover list. Logic lives in lets.js; core.js opens these with `coView`
// ({c, v, id?, tab?}) and wires the buttons through wireLets.
import { esc } from "../util.js";
import { icon } from "../art/icons.js";
import { COTTAGES, STYLES, STYLE_IDS, PIECES, PIECE_IDS, ACCESSORIES, ACC_IDS, TASKS, HOUSEKEEPER, REPAINT, BASICS } from "../data/cottages.js";
import * as LT from "./lets.js";

const coin = () => icon("coin", 13);
const tape = `<span class="tape gingham" aria-hidden="true"></span>`;
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const buyBtn = (F, price, attr, label) => `<button class="btn small ${F.coins >= price ? "primary" : "alt"}" ${attr} ${F.coins >= price ? "" : "disabled"}>${label} · ${price} ${coin()}</button>`;
const starStr = n => n == null ? "no reviews yet" : "★".repeat(Math.floor(n)) + (n % 1 >= .5 ? "½" : "") + ` ${n}`;
const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fmtDay = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short", timeZone: "UTC"});
const ROOMN = {down: "Downstairs", up: "Upstairs", garden: "Garden", acc: "Accessories"};

export function salePanel(F, c){
  const C = COTTAGES[c];
  if (!LT.forSale(F, c)) return `${tape}<h2>${C.n}</h2><p class="sub">Elena's holiday let, ${C.line}. Not for sale yet: she'll write when it is.</p>${shut}`;
  return `${tape}<h2>${C.n}: for sale</h2><p class="sub">Elena's selling ${C.line}. Two floors up a little wooden stair, a back garden with room for a hot tub, and guests who come on the train.</p>
    <p class="muted">Once it's yours: pick a look, order furniture from the catalogue (it comes on the next morning's train), and open it for bookings once there's a bed, a sofa, a kitchen and a table.</p>
    <div class="actions">${buyBtn(F, C.price, 'data-co="buy"', `Buy ${esc(C.n)}`)}</div>${shut}`;
}
export function stylePanel(F, c){
  const L = LT.letState(F), cur = L.style[c];
  return `${tape}<h2>${cur ? "Change the look" : "Pick a look"}</h2><p class="sub">${cur ? `Repainting ${esc(COTTAGES[c].n)} costs ${REPAINT} ${coin()}. The furniture keeps its quality and takes the new colours.` : `How should ${esc(COTTAGES[c].n)} feel? Every piece you buy will come in this style.`}</p>
    <ul class="hlist wlist">${STYLE_IDS.map(k => { const s = STYLES[k];
      return `<li><span class="wtxt"><b><i aria-hidden="true" style="display:inline-block;width:34px;height:12px;border-radius:6px;margin-right:6px;vertical-align:middle;background:linear-gradient(90deg,${s.wall} 0 25%,${s.wood} 25% 50%,${s.fabric} 50% 75%,${s.accent} 75%)"></i>${esc(s.n)}</b><small>${esc(s.line)}</small></span>${k === cur ? `<span class="hbadge">now</span>` : `<button class="btn small primary" data-co="style:${k}">${cur ? `Repaint · ${REPAINT}` : "This one"}</button>`}</li>`; }).join("")}</ul>${shut}`;
}
function pieceRow(F, c, id){
  const p = PIECES[id], t = LT.tierOf(F, c, id), nx = LT.nextTier(F, c, id), o = LT.pending(F, c, id);
  const now = t ? p.tiers[t - 1].n : "Not yet";
  const act = o ? `<span class="hbadge">on the train</span>` : nx ? buyBtn(F, nx.price, `data-co="order:${id}"`, t ? "Upgrade" : "Order") : `<span class="hbadge">the best</span>`;
  return `<li><span class="wtxt"><b>${esc(p.n)}${p.basic && !t ? " (needed to open)" : ""}</b><small>${t ? `${"●".repeat(t)}${"○".repeat(3 - t)} ${esc(now)}` : "Not yet"}${o ? `. Coming: ${esc(o.n)}` : nx ? `. ${t ? "Next" : "Start with"}: ${esc(nx.n)}` : ""}</small></span>${act}</li>`;
}
export function catalogPanel(F, c, tab = "down"){
  const tabs = `<div class="tabs" role="tablist">${["down", "up", "garden", "acc"].map(k => `<button role="tab" data-cotab="${k}" aria-selected="${k === tab}">${ROOMN[k]}</button>`).join("")}</div>`;
  let h = `${tape}<h2>The catalogue</h2>${tabs}<p class="sub">For ${esc(COTTAGES[c].n)}, in ${esc(STYLES[LT.letState(F).style[c]].n)}. Order today and it comes on the 9:15 train tomorrow morning. You have ${F.coins} ${coin()}.</p>`;
  if (tab === "acc") h += `<ul class="hlist wlist">${ACC_IDS.map(k => { const a = ACCESSORIES[k], have = LT.letState(F).acc[c][k], o = LT.pending(F, c, k);
    return `<li><span class="wtxt"><b>${esc(a.n)}</b><small>${ROOMN[a.room]}</small></span>${have ? `<span class="hbadge">there</span>` : o ? `<span class="hbadge">on the train</span>` : buyBtn(F, a.price, `data-co="order:${k}"`, "Order")}</li>`; }).join("")}</ul>`;
  else h += `<ul class="hlist wlist">${PIECE_IDS.filter(k => PIECES[k].room === tab).map(k => pieceRow(F, c, k)).join("")}</ul>`;
  h += `<div class="actions"><button class="btn alt small" data-co="view:style">Change the look</button></div>`;
  return h + shut;
}
export function piecePanel(F, c, id){
  const p = PIECES[id], t = LT.tierOf(F, c, id);
  return `${tape}<h2>${esc(p.n)}</h2><p class="sub">${t ? `${esc(p.tiers[t - 1].n)}, in ${esc(STYLES[LT.letState(F).style[c]].n)}.` : "Nothing here yet."}${LT.pending(F, c, id) ? " Something new is coming on tomorrow's train." : ""}</p>
    <ul class="hlist wlist">${p.tiers.map((x, i) => `<li class="${i + 1 === t ? "now" : ""}"><span class="wtxt"><b>${"●".repeat(i + 1)}${"○".repeat(2 - i)} ${esc(x.n)}</b><small>${x.price} coins</small></span>${i + 1 <= t ? `<span class="hbadge">${i + 1 === t ? "yours" : "done"}</span>` : ""}</li>`).join("")}</ul>
    <ul class="hlist wlist">${pieceRow(F, c, id)}</ul>
    <div class="actions"><button class="btn alt small" data-co="view:cat">The whole catalogue</button></div>${shut}`;
}
const CELL = {in: "#CFE6C9", stay: "#E3F0DA", out: "#F6E3B4", turn: "#F3C9A8", buffer: "repeating-linear-gradient(45deg,#EFE7DA 0 4px,#FFFDF6 4px 8px)", blocked: "#D9D4CC", free: "#FFFDF6"};
export function calendarPanel(F, c, today, nameOf){
  const L = LT.letState(F), C = COTTAGES[c];
  let h = `${tape}<h2>Bookings: ${esc(C.n)}</h2>`;
  if (!LT.isOpen(F, c)) return h + `<p class="sub">Not open for bookings yet. ${esc(C.n)} needs ${BASICS.filter(k => !LT.tierOf(F, c, k)).map(k => PIECES[k].n.toLowerCase()).join(", ") || "a look"} first.</p>${shut}`;
  h += `<p class="sub">${LT.stars(F, c)} stars on the listing · ${starStr(LT.rating(F, c))} from guests · ${LT.rate(F, c)} ${coin()} a night. Check-in at 3, check-out at 10.</p>`;
  h += `<p class="eyebrow">Buffer between guests</p><div class="actions" style="justify-content:flex-start">${[0, 1, 2, 3].map(n => `<button class="btn small ${L.buffer[c] === n ? "primary" : "alt"}" data-co="buffer:${n}">${n === 0 ? "Same day" : n + (n === 1 ? " day" : " days")}</button>`).join("")}</div>`;
  const m0 = LT.mondayOf(today);
  h += `<div style="display:grid;grid-template-columns:repeat(7,1fr) 64px;gap:3px;font-size:.72rem;margin:8px 0">${WD.map(d => `<b style="text-align:center">${d}</b>`).join("")}<span></span>`;
  for (let w = 0; w < 5; w++) {
    const mon = LT.addDays(m0, 7*w), blocked = L.blocked[c].includes(mon);
    for (let i = 0; i < 7; i++) { const d = LT.addDays(mon, i), st = LT.dayState(F, c, d), past = d < today;
      const who = st.s && (st.k === "in" || st.k === "turn") ? (nameOf(st.s.who[0]) || "")[0] + (nameOf(st.s.who[1]) || "")[0] : "";
      h += `<span title="${esc(fmtDay(d))}: ${st.k}" style="background:${CELL[st.k]};border:1px solid ${d === today ? "var(--navy)" : "#E3D9C8"};border-radius:6px;min-height:30px;padding:2px;opacity:${past ? .45 : 1};text-align:center;line-height:1.1">${+d.slice(8)}<br><small>${st.k === "in" ? "in " + who : st.k === "turn" ? "out/in" : st.k === "out" ? "out" : st.k === "blocked" ? "✕" : ""}</small></span>`; }
    h += mon >= m0 && LT.addDays(mon, 6) >= today ? `<button class="btn small ${blocked ? "primary" : "alt"}" style="padding:2px 4px;font-size:.7rem" data-co="block:${mon}">${blocked ? "Unblock" : "Block"}</button>` : "<span></span>";
  }
  h += `</div><p class="muted" style="font-size:.75rem">Green: guests in. Gold: check-out morning. Peach: out and in the same day. Stripes: your buffer. Grey: weeks you've blocked off (any bookings in them are cancelled kindly).</p>`;
  const up = L.stays[c].filter(s => !s.done).slice(0, 4);
  h += `<p class="eyebrow">Coming up</p>` + (up.length ? `<ul class="hlist">${up.map(s => `<li><span><b>${esc(s.who.map(nameOf).join(" and "))}</b><small>${esc(fmtDay(s.in))} to ${esc(fmtDay(s.out))}, ${s.n} nights${s.checkedIn ? " · staying now" : ""}</small></span></li>`).join("")}</ul>` : `<p class="muted">No bookings yet. They'll come.</p>`);
  h += `<p class="eyebrow">Changeovers</p><ul class="hlist wlist"><li><span class="wtxt"><b>${esc(HOUSEKEEPER.n)} the housekeeper</b><small>Strips the beds, cleans and tidies, and sees to the hot tub at eleven on check-out days, for ${HOUSEKEEPER.fee} coins a time. The fruit basket and the fridge stay yours.</small></span><button class="btn small ${L.keeper[c] ? "primary" : "alt"}" data-co="keeper">${L.keeper[c] ? "Hired" : "Hire her"}</button></li></ul>`;
  return h + shut;
}
export function guestBookPanel(F, c, nameOf){
  const L = LT.letState(F), r = L.reviews.filter(v => v.c === c);
  let h = `${tape}<h2>The guest book</h2><p class="sub">${esc(COTTAGES[c].n)} · ${starStr(LT.rating(F, c))}. ${L.earned ? `${L.earned.toLocaleString()} coins earned from the cottages so far.` : ""}</p>`;
  h += r.length ? `<ul class="hlist">${r.slice(0, 12).map(v => `<li><span><b>${"★".repeat(v.score)}${"☆".repeat(5 - v.score)} ${esc(v.who.map(nameOf).join(" and "))}</b><small>${esc(fmtDay(v.in))}: "${esc(v.text)}"</small></span></li>`).join("")}</ul>` : `<p class="muted">Empty pages, waiting for the first guests to write something nice.</p>`;
  return h + shut;
}
export function todoPanel(F, c){
  const L = LT.letState(F), t = LT.turn(F, c), cur = LT.current(F, c), nx = LT.nextStay(F, c);
  let h = `${tape}<h2>Getting ${esc(COTTAGES[c].n)} ready</h2>`;
  if (cur) return h + `<p class="sub">Guests are staying until ${esc(fmtDay(cur.out))}. Leave them in peace.</p>${shut}`;
  h += `<p class="sub">${nx ? `Next guests: ${esc(fmtDay(nx.in))} at 3pm.` : "No one booked in yet."} ${t ? "Tap each thing in the cottage to do it." : "It's clean and fresh."}</p><ul class="hlist wlist">`;
  for (const [k, T] of Object.entries(TASKS)) {
    if (T.only && !LT.tierOf(F, c, T.only)) continue;
    const done = k === "basket" ? !!L.basket[c] : k === "fridge" ? !!L.fridge[c] : !t || t[k];
    h += `<li><span class="wtxt"><b>${done ? "✓ " : ""}${esc(T.n)}</b><small>${T.need ? (T.floor === "up" ? "Upstairs" : T.floor === "garden" ? "In the garden" : "Downstairs") : k === "basket" ? `A nice extra: ${T.fruit} pieces of fruit from your backpack` : `A nice extra: ${T.treats} treats from your backpack (milk, eggs, honey, cheese)`}</small></span>${done ? `<span class="hbadge">done</span>` : !T.need ? `<button class="btn small primary" data-co="task:${k}">Do it</button>` : ""}</li>`;
  }
  return h + `</ul>${shut}`;
}
export function coPanel(F, v, today, nameOf){
  const c = v.c;
  if (v.v === "sale") return salePanel(F, c);
  if (v.v === "style" || (!LT.letState(F).style[c] && LT.owns(F, c))) return stylePanel(F, c);
  if (v.v === "cat") return catalogPanel(F, c, v.tab);
  if (v.v === "piece") return piecePanel(F, c, v.id);
  if (v.v === "cal") return calendarPanel(F, c, today, nameOf);
  if (v.v === "book") return guestBookPanel(F, c, nameOf);
  return todoPanel(F, c);
}
// api: {save, rerender, say, flash, sfx, today, enter(c)}
export function wireLets(root, F, v, api){
  root.querySelectorAll("[data-cotab]").forEach(b => b.onclick = () => { v.tab = b.dataset.cotab; api.sfx("tap"); api.rerender(); });
  root.querySelectorAll("[data-co]").forEach(b => b.onclick = () => {
    const [a, k] = b.dataset.co.split(":"), c = v.c, today = api.today();
    if (a === "buy") { const r = LT.buy(F, c, today); if (!r.ok) return api.say(r.msg); api.sfx("chaching"); api.flash(`${COTTAGES[c].n}: yours!`); v.v = "style"; api.save(); api.say(`The key from under the flowerpot is yours now. ${COTTAGES[c].n}! First, how should it feel?`); api.rerender(); return; }
    if (a === "style") { const r = LT.setStyle(F, c, k); if (!r.ok) return r.msg && api.say(r.msg); api.sfx("chime"); api.flash(`${COTTAGES[c].n}: ${STYLES[k].n}`); v.v = "cat"; v.tab = v.tab || "down"; api.save(); api.rerender(); api.redraw(); return; }
    if (a === "order") { const r = LT.order(F, c, k, today); if (!r.ok) return api.say(r.msg); api.sfx("coin"); api.flash(`${r.n}: on tomorrow's 9:15`); api.save(); api.rerender(); return; }
    if (a === "view") { v.v = k; api.sfx("paper"); api.rerender(); return; }
    if (a === "buffer") { LT.setBuffer(F, c, +k, today); api.sfx("tap"); api.save(); api.rerender(); return; }
    if (a === "block") { const on = !LT.letState(F).blocked[c].includes(k), r = LT.setBlocked(F, c, k, on, today); api.sfx("paper"); if (r.cancelled) api.say(`Blocked off. ${r.cancelled} booking${r.cancelled > 1 ? "s" : ""} moved on, with a kind note.`); api.save(); api.rerender(); return; }
    if (a === "keeper") { const L = LT.letState(F); LT.setKeeper(F, c, !L.keeper[c]); api.sfx("chime"); api.say(L.keeper[c] ? `${HOUSEKEEPER.n}'s hired: she'll turn ${COTTAGES[c].n} round after every stay. The basket and the fridge are still yours.` : `You'll do the changeovers yourself.`); api.save(); api.rerender(); return; }
    if (a === "task") { api.task(c, k); return; }
  });
}
