// The wardrobe at home: today's outfits from Mel's stylist (the "outfit" doc a morning routine writes, following the
// mel-stylist skill: three options built only from her Notion wardrobe), plus new outfits on request. New ones are
// made here with the page's Claude (sample capability) from the same wardrobe list the routine copies into the doc,
// and kept for the day in F.outfits.
import { esc, plain, dayKey } from "../util.js";
import { outfitDoc } from "./feeds.js";

const FIELDS = [["top", "Top"], ["dress", "Dress"], ["bottom", "Bottom"], ["shoes", "Shoes"], ["bag", "Bag"], ["jewellery", "Jewellery"], ["sunglasses", "Sunglasses"], ["layer", "Layer"], ["hair", "Hair"]];
const clean = (s, n = 140) => plain(String(s || "")).slice(0, n);
export const todayDoc = () => { const d = outfitDoc(); return d && d.day === dayKey() ? d : null; };
const extras = F => F.outfits && F.outfits.day === dayKey() ? F.outfits.list || [] : [];
const inventory = () => { const d = outfitDoc(); return d && d.wardrobe && typeof d.wardrobe === "object" ? d.wardrobe : null; };

function card(o, i){
  if (!o) return "";
  const rows = FIELDS.filter(([k]) => o[k]).map(([k, n]) => `<li><small>${n}</small><span>${esc(clean(o[k]))}</span></li>`).join("");
  return `<div class="outfit"><p class="olabel">${esc(clean(o.label, 50) || `Option ${i + 1}`)}</p><ul>${rows}</ul>${o.why ? `<p class="owhy">${esc(clean(o.why, 220))}</p>` : ""}</div>`;
}
export function wardrobePanel(F, st){
  const d = todayDoc(), more = extras(F), inv = inventory();
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The wardrobe</h2>`;
  if (d) h += `<p class="sub">${[d.weather && esc(clean(d.weather, 60)), d.on && esc(clean(d.on, 160))].filter(Boolean).join(" · ") || "Today's picks from your stylist."}</p>`;
  else h += `<p class="sub">Your stylist hasn't been by yet today. The morning briefing hangs three outfits in here.</p>`;
  const all = [...((d && d.options) || []).slice(0, 3), ...more];
  if (all.length) h += `<div class="outfits">${all.map(card).join("")}</div>`;
  h += `<p class="eyebrow" style="margin:14px 0 6px">Want something different?</p>`;
  if (!inv) h += `<p class="muted">New outfits need your wardrobe list, which comes with the morning drop-off.</p>`;
  else if (!st.sample) h += `<p class="muted">New outfits need Claude, which isn't reachable from this view just now.</p>`;
  else h += `<form class="row" id="outfitForm"><label class="sr" for="outfitAsk">What for?</label><input id="outfitAsk" maxlength="120" placeholder="optional: dinner out, school run, more colour..." value="${esc(st.ask || "")}"><button class="btn small" type="submit" ${st.busy ? "disabled" : ""}>${st.busy ? "Picking…" : "New outfit"}</button></form>${st.error ? `<p class="muted">${esc(st.error)}</p>` : ""}`;
  return h;
}

// One new outfit from the sample capability, using only pieces in the wardrobe list.
export async function newOutfit(F, sample, ask){
  const d = outfitDoc(), inv = inventory(); if (!inv || !sample) return null;
  const shown = [...((todayDoc() || {}).options || []), ...extras(F)].map(o => FIELDS.map(([k]) => o[k]).filter(Boolean).join(", ")).slice(-8);
  const prompt = `You are Mel's personal stylist. Suggest ONE outfit for today.
Rules: True/Deep Winter colours (black, pure white, navy, burgundy, forest green, royal blue, emerald, plum, charcoal, cool reds, hot pink, icy lavender; avoid camel, warm browns, orange, yellow, olive, rust, coral, cream). Romantic Kibbe: soft, fitted, draped, waist defined, midi/maxi lengths, rounded toes. One fitted + one relaxed. Always one piece of jewellery. Hair up by default (down only for a V-neck, off shoulder or a special evening). Weekends and parenting days: practical flat shoes, no heels, no low camis. Cream linen blazer only for in-person power meetings. Sunglasses only if she's going out.
Use ONLY items from this wardrobe list (copy their names). If a piece that would complete the look isn't there, add "(not currently in wardrobe)" after it.
Wardrobe: ${JSON.stringify(inv).slice(0, 6000)}
Today: ${d && d.day === dayKey() ? `${clean(d.weather, 60)}; on: ${clean(d.on, 200)}` : dayKey()}
Already suggested today (make this one clearly different): ${shown.join(" | ") || "none"}
Mel's request: ${clean(ask, 120) || "something different"}
Return JSON only: {"label": "2-4 word name", "top": "", "dress": "", "bottom": "", "shoes": "", "bag": "", "jewellery": "", "sunglasses": "", "layer": "", "hair": "up|down + short note", "why": "one sentence"} (leave fields empty when not used: dress OR top+bottom).`;
  const o = await sample.json(prompt, {modelTier: "quick", cache: false});
  if (!o || typeof o !== "object") return null;
  const out = {}; FIELDS.forEach(([k]) => { if (o[k]) out[k] = clean(o[k]); }); out.label = clean(o.label, 50) || "Fresh pick"; if (o.why) out.why = clean(o.why, 220);
  if (!out.top && !out.dress) return null;
  if (!F.outfits || F.outfits.day !== dayKey()) F.outfits = {day: dayKey(), list: []};
  F.outfits.list = [...F.outfits.list, out].slice(-4);
  return out;
}
