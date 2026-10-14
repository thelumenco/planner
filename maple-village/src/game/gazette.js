// The good news board in the town square: the day's wins the village has seen, and what's on in the village.
import { esc } from "../util.js";

export function goodNewsHTML(wins, cal, tab = "wins"){
  let h = `<span class="tape gingham" aria-hidden="true"></span><p class="eyebrow" style="margin:0 0 2px">The Honeybrook Gazette</p><h2>Good news</h2><p class="sub">Fresh every morning.</p>`;
  h += `<div class="tabs" role="tablist">${[["wins", "Your wins"], ["events", "Events"]].map(([k, n]) => `<button role="tab" data-newstab="${k}" aria-selected="${k === tab}">${n}</button>`).join("")}</div>`;
  if (tab === "wins") h += (wins.length ? `<ul class="hlist gnews">${wins.slice(0, 8).map(w => `<li><span>${esc(w)}</span></li>`).join("")}</ul>` : `<p class="muted">Your wins show up here as the day goes on.</p>`);
  if (tab === "events") {
    if (cal && cal.fests.length) h += `<ul class="hlist gnews vcal fests">${cal.fests.map(f => `<li><span><b>${esc(f.name)}</b><small>${esc(f.when)} · ${esc(f.until)}</small></span></li>`).join("")}</ul>`;
    h += cal && cal.days.length ? `<ul class="hlist gnews vcal">${cal.days.map(d => `<li><span><b>${esc(d.when)}</b>${d.list.map(x => `<small>${esc(x)}</small>`).join("")}</span></li>`).join("")}</ul>` : `<p class="muted">A quiet fortnight in the village.</p>`;
  }
  return h;
}
