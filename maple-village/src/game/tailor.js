// Ada's haberdashery and Idris the tailor's, on Makers' Lane (in what were Lin's cottage and Juniper's house).
// Buy fabric by the piece and buttons by the card from Ada; take them next door, design something with Idris (garment,
// fabric, sleeves, neckline, length, buttons, pockets) with a live preview on you, and pay his fee when you finalise.
// It's ready the next morning from 9: collect it and it goes into your wardrobe, to wear whenever you like.
// State: F.sew = {fabric: {key: pieces}, buttons: {kind: cards}, order: null|{...design, name, day, ready}, clothes: [...],
//   wear: {top, bottom, dress}}   (a made piece: {id, kind, slot, fab, mat, col, pat, sleeves, neck, length, buttons,
//   pockets, name, made})
import { esc, dayKey } from "../util.js";
import { MATERIALS, COLOURS, PATTERNS, BUTTONS, GARMENTS, OPT_NAMES, fabricKey, parseFabric, fabricName, fabricPrice, makingFee, piecesFor, READY_HOUR } from "../data/sewing.js";

export const fabricLabel = k => fabricName(k).toLowerCase();
export const GARMENT_NAME = Object.fromEntries(Object.entries(GARMENTS).map(([k, g]) => [k, g.n]));
export const sewState = F => { const s = F.sew = F.sew || {}; s.fabric = s.fabric || {}; s.buttons = s.buttons || {}; s.clothes = s.clothes || []; s.wear = s.wear || {}; if (s.order === undefined) s.order = null; return s; };
const coin = n => `${n} coin${n === 1 ? "" : "s"}`;
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const chip = (key, val, on, label) => `<button type="button" class="gchip${on ? " on" : ""}" data-sew="${key}:${esc(val)}" aria-pressed="${on}"><span>${esc(label)}</span></button>`;
const swatch = (key, col, on, label) => `<button type="button" class="sw${on ? " on" : ""}" data-sew="${key}:${col}" aria-pressed="${on}" aria-label="${esc(label)}" style="background:${col}"></button>`;
// a little square of fabric, pattern and all (the same patterns the clothes use, drawn flat)
export function fabricSwatch(k, size = 34){
  const f = parseFabric(k), c = f.col, ink = "rgba(58,46,40,.35)", w = size;
  const pat = f.pat === "gingham" ? `<path d="M0 ${w/4}h${w}M0 ${w*3/4}h${w}M${w/4} 0v${w}M${w*3/4} 0v${w}" stroke="${ink}" stroke-width="${w/6}"/>`
    : f.pat === "stripe" ? [1, 3, 5, 7].map(i => `<path d="M${i*w/8} 0v${w}" stroke="${ink}" stroke-width="${w/14}"/>`).join("")
    : f.pat === "polka" ? [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]].map(([x, y]) => `<circle cx="${x*w}" cy="${y*w}" r="${w/14}" fill="#FFFDF6" opacity=".85"/>`).join("")
    : f.pat === "floral" ? [[.3, .3], [.72, .62], [.3, .8]].map(([x, y]) => `<g transform="translate(${x*w} ${y*w})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${Math.cos(a*Math.PI/180)*w/16}" cy="${Math.sin(a*Math.PI/180)*w/16}" r="${w/22}" fill="#FFFDF6" opacity=".85"/>`).join("")}<circle r="${w/26}" fill="#F3C969"/></g>`).join("") : "";
  return `<svg class="fabsw" width="${w}" height="${w}" viewBox="0 0 ${w} ${w}" aria-hidden="true"><rect width="${w}" height="${w}" rx="${w/6}" fill="${c}" stroke="rgba(58,46,40,.5)"/>${pat}</svg>`;
};

/* ---------- Ada's haberdashery ---------- */
export function buyFabric(F, k, n){ const s = sewState(F), cost = fabricPrice(k)*n; if (F.coins < cost || n < 1) return null; F.coins -= cost; s.fabric[k] = (s.fabric[k] || 0) + n; return cost; }
export function buyButtons(F, b){ const s = sewState(F), d = BUTTONS[b]; if (!d || F.coins < d.price) return null; F.coins -= d.price; s.buttons[b] = (s.buttons[b] || 0) + 1; return d.price; }
// Ada buys back what you haven't used, at half what you paid (never more than she sells it for)
export const sellBack = k => Math.floor(fabricPrice(k)/2);
export function sellFabric(F, k){ const s = sewState(F); if (!s.fabric[k]) return null; s.fabric[k]--; if (!s.fabric[k]) delete s.fabric[k]; const p = sellBack(k); F.coins += p; return p; }

export function haberdasheryHTML(F, st, open){
  const s = sewState(F), tab = st.tab || "fabric", mat = st.mat || "cotton", col = st.col || "#9CC27E", pat = st.pat || "plain", k = fabricKey(mat, col, pat), each = fabricPrice(k);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Ada's haberdashery</h2>`;
  if (!open) return h + `<p class="sub">Shut. Ada opens nine thirty to half past five, every day but Sunday. There's a bolt of gingham in the window, waiting.</p>` + basketHTML(F) + shut;
  h += `<p class="sub">Bolts of fabric to the ceiling, a jar of buttons on the counter, and Ada with a tape measure round her neck. You have ${coin(F.coins)}.</p>`;
  h += `<div class="tabs" role="tablist">${[["fabric", "Fabric"], ["buttons", "Buttons"], ["basket", "Your basket"]].map(([t, n]) => `<button role="tab" data-sew="tab:${t}" aria-selected="${t === tab}">${n}</button>`).join("")}</div>`;
  if (tab === "fabric") {
    h += `<p class="sulabel">Material</p><div class="gchips">${Object.entries(MATERIALS).map(([m, d]) => chip("mat", m, m === mat, `${d.n} · ${d.price}`)).join("")}</div>
      <p class="muted">${esc(MATERIALS[mat].line)}</p>
      <p class="sulabel">Colour</p><div class="swatches">${Object.entries(COLOURS).map(([c, n]) => swatch("col", c, c === col, n)).join("")}</div>
      <p class="sulabel">Pattern</p><div class="gchips">${Object.entries(PATTERNS).map(([p, d]) => chip("pat", p, p === pat, d.extra ? `${d.n} +${d.extra}` : d.n)).join("")}</div>
      <div class="row" style="align-items:center;gap:12px;margin:10px 0">${fabricSwatch(k, 56)}<div><b>${esc(fabricName(k))}</b><br><small>${coin(each)} a piece · you have ${s.fabric[k] || 0}</small></div></div>
      <div class="actions">${[1, 2, 3, 4].map(n => `<button class="btn small ${n === 1 ? "primary" : "alt"}" data-sew="buy:${n}" ${F.coins >= each*n ? "" : "disabled"}>${n} piece${n === 1 ? "" : "s"} · ${each*n}</button>`).join("")}</div>
      <p class="muted">A top takes 2 to 4 pieces of one fabric, a skirt or shorts 2, a dress 4 (one more if it's long). Idris next door does the making.</p>`;
  } else if (tab === "buttons") {
    h += `<p class="muted">A card of buttons does one garment.</p><ul class="hlist">${Object.entries(BUTTONS).map(([b, d]) => `<li><span><i class="btndot" style="background:${d.col}"></i> ${esc(d.n)} <small>· you have ${s.buttons[b] || 0}</small></span><button class="btn small alt" data-sew="btn:${b}" ${F.coins >= d.price ? "" : "disabled"}>${coin(d.price)}</button></li>`).join("")}</ul>`;
  } else h += basketHTML(F, true);
  return h + shut;
}
function basketHTML(F, selling){
  const s = sewState(F), fabs = Object.entries(s.fabric).filter(([, n]) => n > 0), btns = Object.entries(s.buttons).filter(([, n]) => n > 0);
  if (!fabs.length && !btns.length) return `<p class="muted">Your sewing basket's empty.</p>`;
  return `<p class="sulabel">Your sewing basket</p><ul class="hlist">${fabs.map(([k, n]) => `<li><span>${fabricSwatch(k, 22)} ${esc(fabricName(k))} <small>× ${n}</small></span>${selling ? `<button class="btn small alt" data-sew="sell:${esc(k)}">Sell one · ${sellBack(k)}</button>` : ""}</li>`).join("")}${btns.map(([b, n]) => `<li><span><i class="btndot" style="background:${BUTTONS[b].col}"></i> ${esc(BUTTONS[b].n)} <small>× ${n}</small></span></li>`).join("")}</ul>${selling && fabs.length ? `<p class="muted">Ada buys back unused fabric at half price.</p>` : ""}`;
}

/* ---------- Idris the tailor ---------- */
const garmentName = d => { const f = parseFabric(d.fab), g = GARMENTS[d.kind]; return `${COLOURS[f.col] || ""} ${f.pat === "plain" ? "" : PATTERNS[f.pat].n.toLowerCase() + " "}${MATERIALS[f.mat] ? MATERIALS[f.mat].n.toLowerCase() + " " : ""}${g.n.toLowerCase()}`.replace(/\s+/g, " ").trim(); };
// the design on the counter, filled in with the defaults for anything not chosen
export function designOf(F, st){
  const s = sewState(F), kind = GARMENTS[st.kind] ? st.kind : "tee", g = GARMENTS[kind], o = g.opts, need = piecesFor({kind, length: st.length});
  const fabs = Object.keys(s.fabric).filter(k => s.fabric[k] > 0), fab = fabs.includes(st.fab) ? st.fab : fabs.find(k => s.fabric[k] >= need) || fabs[0] || null;
  const d = {kind, fab, sleeves: o.sleeves ? (o.sleeves.includes(st.sleeves) ? st.sleeves : o.sleeves[0]) : null, neck: o.neck ? (o.neck.includes(st.neck) ? st.neck : o.neck[0]) : null,
    length: o.length ? (o.length.includes(st.length) ? st.length : o.length[0]) : null, buttons: o.buttons && st.buttons && (s.buttons[st.buttons] || 0) > 0 ? st.buttons : o.buttons === "need" ? Object.keys(s.buttons).find(b => s.buttons[b] > 0) || null : null,
    pockets: !!(o.pockets && st.pockets)};
  return d;
}
// what a design looks like on you: a spec for the clothes art (art/clothes.js)
export function specOf(d){
  const f = parseFabric(d.fab || "cotton:#FFFDF6:plain"), slot = GARMENTS[d.kind].slot;
  const base = {col: f.col, pat: f.pat, mat: f.mat, pockets: d.pockets};
  return slot === "bottom" ? {bottom: {...base, kind: d.kind, length: d.length}} : {top: {...base, kind: d.kind, sleeves: d.sleeves, neck: d.neck, length: d.length, buttons: d.buttons}};
}
export function orderState(F, day = dayKey(), hm = 0){
  const o = sewState(F).order; if (!o) return null;
  return {...o, readyNow: day > o.ready || (day === o.ready && hm >= READY_HOUR*60)};
}
// finalise: the fabric and buttons go to Idris, his fee is paid, and it's ready tomorrow from 9 -> the order, or {err}
export function placeOrder(F, d, tomorrow){
  const s = sewState(F), need = piecesFor(d), fee = makingFee(d);
  if (s.order) return {err: "Idris is still making your last one."};
  if (!d.fab || (s.fabric[d.fab] || 0) < need) return {err: `That needs ${need} pieces of one fabric.`};
  if (GARMENTS[d.kind].opts.buttons === "need" && !d.buttons) return {err: "A shirt needs a card of buttons."};
  if (d.buttons && !(s.buttons[d.buttons] > 0)) return {err: "You've no buttons of that kind."};
  if (F.coins < fee) return {err: `Idris's fee is ${coin(fee)}.`};
  F.coins -= fee; s.fabric[d.fab] -= need; if (!s.fabric[d.fab]) delete s.fabric[d.fab];
  if (d.buttons) { s.buttons[d.buttons]--; if (!s.buttons[d.buttons]) delete s.buttons[d.buttons]; }
  s.order = {...d, name: garmentName(d), fee, day: dayKey(), ready: tomorrow};
  return s.order;
}
export function collect(F, day = dayKey(), hm = 0){
  const s = sewState(F), o = orderState(F, day, hm); if (!o || !o.readyNow) return null;
  const f = parseFabric(o.fab), piece = {id: "c" + Date.now().toString(36), kind: o.kind, slot: GARMENTS[o.kind].slot, fab: o.fab, mat: f.mat, col: f.col, pat: f.pat,
    sleeves: o.sleeves, neck: o.neck, length: o.length, buttons: o.buttons, pockets: o.pockets, name: o.name, made: day};
  s.clothes.push(piece); s.order = null; return piece;
}
export function tailorHTML(F, st, open, day = dayKey(), hm = 0){
  const s = sewState(F), o = orderState(F, day, hm);
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Idris the tailor</h2>`;
  if (!open) return h + `<p class="sub">Shut. Idris works nine thirty to half past five, every day but Sunday. ${o ? (o.readyNow ? `Your ${esc(o.name)} is ready: come back when he's open.` : `He's making your ${esc(o.name)}: ready tomorrow from nine.`) : "A tape measure hangs on the door handle, like a promise."}</p>` + shut;
  if (o && o.readyNow) return h + `<p class="sub">Idris lifts it off the rail, folds it in tissue paper and ties it with string. Your ${esc(o.name)}, ready.</p><div class="actions"><button class="btn primary" data-sew="collect">Collect it</button></div>` + shut;
  if (o) return h + `<p class="sub">Idris is making your ${esc(o.name)}. "Tomorrow from nine. Not a minute before: I don't hurry hems."</p>` + shut;
  const d = designOf(F, st), g = GARMENTS[d.kind], need = piecesFor(d), fee = makingFee(d), fabs = Object.keys(s.fabric).filter(k => s.fabric[k] > 0);
  const enough = d.fab && s.fabric[d.fab] >= need, btnOk = g.opts.buttons !== "need" || d.buttons, can = enough && btnOk && F.coins >= fee;
  h += `<p class="sub">Pattern paper, pins in his mouth, a chalk line on the cutting table. "What are we making?"</p>
    <div class="gchips">${Object.entries(GARMENTS).map(([k, x]) => chip("kind", k, k === d.kind, x.n)).join("")}</div>
    <div class="sulook"><svg class="suprev tlprev" viewBox="-22 -70 44 74" width="110" height="185" aria-label="A preview of you wearing it"><g id="tlFig"></g></svg><div class="suopts">
    <p class="sulabel">Fabric <small class="muted">(${need} pieces)</small></p>${fabs.length ? `<div class="gchips">${fabs.map(k => `<button type="button" class="gchip${k === d.fab ? " on" : ""}" data-sew="fab:${esc(k)}" aria-pressed="${k === d.fab}" ${s.fabric[k] >= need ? "" : "disabled"}>${fabricSwatch(k, 18)}<span>${esc(fabricName(k))} ×${s.fabric[k]}</span></button>`).join("")}</div>` : `<p class="muted">No fabric yet: Ada's haberdashery is just over the lane.</p>`}
    ${g.opts.sleeves && g.opts.sleeves.length > 1 ? `<p class="sulabel">Sleeves</p><div class="gchips">${g.opts.sleeves.map(v => chip("sleeves", v, v === d.sleeves, OPT_NAMES.sleeves[v] + (v === "puff" ? " +3" : ""))).join("")}</div>` : ""}
    ${g.opts.neck && g.opts.neck.length > 1 ? `<p class="sulabel">Neckline</p><div class="gchips">${g.opts.neck.map(v => chip("neck", v, v === d.neck, OPT_NAMES.neck[v] + (v === "collar" ? " +3" : ""))).join("")}</div>` : ""}
    ${g.opts.length ? `<p class="sulabel">Length</p><div class="gchips">${g.opts.length.map(v => chip("length", v, v === d.length, OPT_NAMES.length[v] + (v === "long" ? " +4, 1 more piece" : ""))).join("")}</div>` : ""}
    ${g.opts.buttons ? `<p class="sulabel">Buttons</p><div class="gchips">${g.opts.buttons === "need" ? "" : chip("buttons", "", !d.buttons, "None")}${Object.keys(BUTTONS).map(b => `<button type="button" class="gchip${d.buttons === b ? " on" : ""}" data-sew="buttons:${b}" aria-pressed="${d.buttons === b}" ${(s.buttons[b] || 0) > 0 ? "" : "disabled"}><i class="btndot" style="background:${BUTTONS[b].col}"></i><span>${esc(BUTTONS[b].n.replace(" buttons", ""))} ×${s.buttons[b] || 0}</span></button>`).join("")}</div>` : ""}
    ${g.opts.pockets ? `<p class="sulabel">Pockets</p><div class="gchips">${chip("pockets", "1", d.pockets, "Pockets +2")}${chip("pockets", "", !d.pockets, "No pockets")}</div>` : ""}
    </div></div>
    <p class="muted">${enough ? `Your ${esc(d.fab ? fabricName(d.fab) : "fabric")}, ${need} pieces${d.buttons ? `, and a card of ${esc(BUTTONS[d.buttons].n.toLowerCase())}` : ""}. Idris's fee: ${coin(fee)}, paid when you finalise. Ready tomorrow from nine.` : `You'll need ${need} pieces of one fabric for a ${esc(g.n.toLowerCase())}${!btnOk ? ", and a card of buttons" : ""}.`}</p>
    <div class="actions"><button class="btn primary" data-sew="order" ${can ? "" : "disabled"}>Have it made · ${coin(fee)}</button></div>`;
  return h + shut;
}

/* ---------- the wardrobe ---------- */
export function wornSpec(F){
  const s = sewState(F), get = id => s.clothes.find(c => c.id === id), w = s.wear, out = {};
  const dress = get(w.dress), top = get(w.top), bottom = get(w.bottom);
  if (dress) out.top = {kind: "dress", sleeves: dress.sleeves, neck: dress.neck, length: dress.length, buttons: dress.buttons, pockets: dress.pockets, col: dress.col, pat: dress.pat, mat: dress.mat};
  else { if (top) out.top = {kind: top.kind, sleeves: top.sleeves, neck: top.neck, buttons: top.buttons, pockets: top.pockets, col: top.col, pat: top.pat, mat: top.mat};
    if (bottom) out.bottom = {kind: bottom.kind, length: bottom.length, pockets: bottom.pockets, col: bottom.col, pat: bottom.pat, mat: bottom.mat}; }
  return out;
}
export function wear(F, id){
  const s = sewState(F), c = s.clothes.find(x => x.id === id); if (!c) return false;
  if (c.slot === "dress") s.wear = {dress: id}; else { delete s.wear.dress; s.wear[c.slot] = s.wear[c.slot] === id ? null : id; }
  return true;
}
export const everyday = F => { sewState(F).wear = {}; };
export function clothesHTML(F){
  const s = sewState(F), w = s.wear;
  if (!s.clothes.length) return `<p class="sulabel">Made for you</p><p class="muted">Nothing tailor-made yet. Ada's haberdashery and Idris the tailor are on Makers' Lane.</p>`;
  const on = c => w.dress === c.id || w.top === c.id || w.bottom === c.id;
  return `<p class="sulabel">Made for you</p><ul class="hlist">${s.clothes.map(c => `<li><span>${fabricSwatch(c.fab, 22)} ${esc(c.name)}</span><button class="btn small ${on(c) ? "primary" : "alt"}" data-wear="${c.id}">${on(c) ? "Wearing" : "Wear"}</button></li>`).join("")}</ul>
    ${w.dress || w.top || w.bottom ? `<div class="actions"><button class="btn small alt" data-wear="">Back to my everyday look</button></div>` : ""}`;
}
