// The wardrobe at home: today's outfits from Mel's stylist (the "outfit" doc a morning routine writes, following the
// mel-stylist skill: three options built only from her Notion wardrobe), plus new outfits on request. New ones are
// made here with the page's Claude (sample capability) from the same wardrobe list the routine copies into the doc,
// and kept for the day in F.outfits.
import { esc, plain, dayKey } from "../util.js";
import { outfitDoc } from "./feeds.js";
import { garment } from "../art/garments.js";

const FIELDS = [["top", "Top"], ["dress", "Dress"], ["bottom", "Bottom"], ["shoes", "Shoes"], ["bag", "Bag"], ["jewellery", "Jewellery"], ["sunglasses", "Sunglasses"], ["layer", "Layer"], ["hair", "Hair"]];
const clean = (s, n = 140) => plain(String(s || "")).slice(0, n);
export const todayDoc = () => { const d = outfitDoc(); return d && d.day === dayKey() ? d : null; };
const extras = F => F.outfits && F.outfits.day === dayKey() ? F.outfits.list || [] : [];
const inventory = () => { const d = outfitDoc(); return d && d.wardrobe && typeof d.wardrobe === "object" ? d.wardrobe : null; };

// every outfit hanging in the wardrobe today: the stylist's three, then any new ones asked for
export const outfitsToday = F => [...((todayDoc() || {}).options || []).slice(0, 3), ...extras(F)];
const FIELD_NAME = Object.fromEntries(FIELDS);
function card(o, i){
  if (!o) return "";
  const rows = FIELDS.filter(([k]) => o[k]).map(([k, n]) => `<li><span class="gpic">${garment(k === "layer" ? "layer" : k, o[k])}</span><span><small>${n}</small>${esc(clean(o[k]))}</span></li>`).join("");
  return `<div class="outfit"><p class="olabel">${esc(clean(o.label, 50) || `Option ${i + 1}`)}</p><ul>${rows}</ul>${o.why ? `<p class="owhy">${esc(clean(o.why, 220))}</p>` : ""}<div class="actions"><button class="btn small primary" data-wear="${i}">Wear this</button></div></div>`;
}
export function wardrobePanel(F, st){
  const d = todayDoc(), more = extras(F), inv = inventory();
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The wardrobe</h2>`;
  if (d) h += `<p class="sub">${[d.weather && esc(clean(d.weather, 60)), d.on && esc(clean(d.on, 160))].filter(Boolean).join(" · ") || "Today's picks from your stylist."}</p>`;
  else h += `<p class="sub">Your stylist hasn't been by yet today. The morning briefing hangs three outfits in here.</p>`;
  const all = outfitsToday(F), w = F.wear && F.wear.day === dayKey() ? F.wear : null;
  if (w) h += `<p class="muted">Wearing today: <b>${esc(w.label || "your outfit")}</b>. <button class="btn small alt" data-wearoff="1">Back to my usual clothes</button></p>`;
  // putting one on: tick off what to wear (everything to start with), then confirm
  const pick = st.pick != null ? all[st.pick] : null;
  if (pick) { const fs = FIELDS.filter(([k]) => pick[k]);
    h += `<div class="outfit wearpick"><p class="olabel">Put on ${esc(clean(pick.label, 50) || "this outfit")}</p><p class="muted">Untick anything you're skipping.</p><ul>${fs.map(([k, n]) => `<li><label><input type="checkbox" data-wearf="${k}" checked> <span class="gpic">${garment(k === "layer" ? "layer" : k, pick[k])}</span><span><small>${n}</small>${esc(clean(pick[k]))}</span></label></li>`).join("")}</ul>
      <div class="actions"><button class="btn primary" data-wearok="${st.pick}">Put it on</button><button class="btn alt small" data-wearback="1">Back</button></div></div>`; }
  else if (all.length) h += `<div class="outfits">${all.map(card).join("")}</div>`;
  h += `<p class="eyebrow" style="margin:14px 0 6px">Want something different?</p>`;
  if (!inv) h += `<p class="muted">New outfits need your wardrobe list, which comes with the morning drop-off.</p>`;
  else if (!st.sample) h += `<p class="muted">New outfits need Claude, which isn't reachable from this view just now.</p>`;
  else h += `<form class="row" id="outfitForm"><label class="sr" for="outfitAsk">What for?</label><input id="outfitAsk" maxlength="120" placeholder="optional: dinner out, school run, more colour..." value="${esc(st.ask || "")}"><button class="btn small" type="submit" ${st.busy ? "disabled" : ""}>${st.busy ? "Picking…" : "New outfit"}</button></form>${st.error ? `<p class="muted">${esc(st.error)}</p>` : ""}`;
  return h;
}

// One new outfit from the sample capability, using only pieces in the wardrobe list.
export async function newOutfit(F, sample, ask, events){
  const d = outfitDoc(), inv = inventory(); if (!inv || !sample) return null;
  const shown = [...((todayDoc() || {}).options || []), ...extras(F)].map(o => FIELDS.map(([k]) => o[k]).filter(Boolean).join(", ")).slice(-8);
  const prompt = `You are Mel's personal stylist. Suggest ONE outfit for today.
Mel's style profile (from her stylist skill):
- Colour season True/Deep Winter. Best: true black, pure white, icy white, deep navy, burgundy/wine, deep forest green, royal blue, emerald, plum, charcoal, cool blue-reds, hot pink, icy lavender. Wears silver AND gold. Avoid warm browns, camel, orange, yellow, warm beige, olive, rust, coral near the face (chocolate, mocha, tan work as neutrals away from the face). Neutrals: black, charcoal, navy, pure white.
- Kibbe Romantic: soft, curved, fitted; fluid fabrics (jersey, silk, satin, chiffon); define the waist (tuck or belt); midi and maxi; soft florals or abstract prints, never geometric; rounded or almond toes; no boxy head-to-toe or oversized.
- Frameworks: sandwich method (top colour repeated in shoes); one fitted + one relaxed; one area of visual interest; neckline-led jewellery (V-neck pendant, boat neck long lariat, off shoulder choker, cowl layered chains); hair up with high necks, down with open necklines; bag size balances the top.
- Day rules: hair up by default. Zoom/video calls: textured black boat neck top + long pendant. Weekends and parenting days: sneakers or ballet flats, polo tees with a belt are great, no heels, no low camis or strappy tops on their own. Sundays: parents' place, linen shorts, unless the calendar says otherwise. Cream linen blazer only for in-person power meetings. Heavy aircon: a cardigan. Sunglasses only if she goes out (Tom Ford black for polished, Rubi round for relaxed, warm frames only with cool outfits).
Dress for the day below: the most important event decides how polished it is; if events differ a lot, note when to change.
Use ONLY items from this wardrobe list (copy their names). If a piece that would complete the look isn't there, add "(not currently in wardrobe)" after it.
Wardrobe: ${JSON.stringify(inv).slice(0, 6000)}
Today: ${new Date(dayKey() + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "long", day: "numeric", month: "long", timeZone: "UTC"})}, Singapore.
Weather: ${d && d.day === dayKey() && d.weather ? clean(d.weather, 80) : "not checked yet; assume Singapore's usual: hot and humid, maybe an afternoon shower, cold aircon indoors"}.
Calendar: ${(events || []).length ? events.slice(0, 12).map(e => `${e.allDay ? "all day" : new Date(e.start).toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit", timeZone: "Asia/Singapore"})} ${clean(e.title, 60)}${e.where ? ` (${clean(e.where, 40)})` : ""}`).join("; ") : d && d.day === dayKey() && d.on ? clean(d.on, 200) : "nothing on the calendar (a home or WFH day)"}.
Already suggested today (make this one clearly different): ${shown.join(" | ") || "none"}
Mel's request: ${clean(ask, 120) || "something different"}
Return JSON only: {"label": "2-4 word name", "top": "", "dress": "", "bottom": "", "shoes": "", "bag": "", "jewellery": "", "sunglasses": "", "layer": "", "hair": "up|down + short note", "why": "one sentence"} (leave fields empty when not used: dress OR top+bottom).`;
  const o = await sample.json(prompt, {modelTier: "quick", cache: false});
  if (!o || typeof o !== "object") return null;
  const out = {}; FIELDS.forEach(([k]) => { if (o[k]) out[k] = clean(o[k]); }); out.label = clean(o.label, 50) || "Fresh pick"; if (o.why) out.why = clean(o.why, 220);
  if (!out.top && !out.dress) return null;
  if (!F.outfits || F.outfits.day !== dayKey()) F.outfits = {day: dayKey(), list: []};
  F.outfits.list = [...F.outfits.list, out].slice(-2);   // keep the wardrobe tidy: the latest two extra picks
  return out;
}
