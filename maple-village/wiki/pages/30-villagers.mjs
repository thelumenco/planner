// Villagers: the list, and a page for each of Honeybrook's villagers (who they are, where to find them, what they love)
import { NPCS } from "../../src/data/npcs.js";
import { lovesOf } from "../../src/data/loves.js";
import { ITEMS } from "../../src/data/items.js";
import { esc, table, hm, daysText, placeName, itemIcon, spoiler, lede } from "../lib.mjs";

const VILLAGERS = NPCS.filter(n => !n.tourist && !n.local && !n.kid);
const NEEDS = {mill: "once you've restored the old mill", millshop: "once the Mill Shop is open", cocoa: "once the Cocoa Room is open", giftshop: "once the gift shop is open", scoop: "once the Scoop Shack is open", cellar: "once the cellar door is built", terrace: "once the terrace is built"};
const badge = n => `<span class="badge" style="background:${esc((n.look && n.look.top) || "#F6E3A1")}">${esc(n.name[0])}</span>`;
const loveName = l => l.id ? (ITEMS[l.id] ? ITEMS[l.id].n : l.id) : (l.what || "Something special");
const loveRow = l => [l.id && ITEMS[l.id] ? itemIcon(l.id, 22) + esc(loveName(l)) : esc(loveName(l)), l.thanks ? `<span class="muted">"${esc(l.thanks)}"</span>` : ""];
function routine(n){
  const rows = (n.routine || []).slice().sort((a, b) => a.from - b.from).map(s => [`${hm(s.from)} to ${hm(s.to)}`, esc(placeName(s.scene)),
    [s.dow ? daysText(s.dow) : s.days === "we" ? "weekends" : s.days === "wd" ? "weekdays" : "every day", s.needs ? NEEDS[s.needs] || "later in the game" : ""].filter(Boolean).join(", ")]);
  return table(["When", "Where", "Days"], rows);
}
function page(n){
  const L = lovesOf(n.id), story = L.filter(l => l.kind === "story" || l.kind === "combo"), every = L.filter(l => l.kind === "everyday");
  const html = `<div class="hero">${badge(n)}<div><p class="lede" style="margin:0">${esc(n.job || "")}</p></div></div>
    ${n.intro ? `<blockquote class="box">"${esc(n.intro)}"</blockquote>` : ""}
    <h2>Where to find ${esc(n.name)}</h2>${routine(n)}
    <p class="muted">Festivals, trips, market days and visits can take villagers somewhere else for a while. Away from these times: ${esc(n.away || "they're at home.")}</p>
    <h2>Gifts ${esc(n.name)} loves</h2>
    <p>A love is worth a whole heart; anything else a villager is happy to have is worth half. One gift a day counts. See <a href="/hearts-and-gifts">Hearts and gifts</a>.</p>
    ${every.length ? table(["Everyday loves", ""], every.map(loveRow)) : ""}
    ${story.length ? spoiler(`${n.name}'s story loves`, `<p class="muted">Tied to ${esc(n.name)}'s own story. Each has its own thank-you.</p>` + table(["Story love", "What they say"], story.map(loveRow))) : ""}
    ${(n.lines || []).length ? `<h2>Things ${esc(n.name)} says</h2><ul class="plain">${n.lines.slice(0, 6).map(l => `<li>"${esc(l.replace(/\{pet\}/g, "your pet").replace(/\{[a-z]+\}/g, ""))}"</li>`).join("")}</ul>` : ""}`;
  return {slug: "villagers/" + n.id, title: n.name, section: "people", hide: true, blurb: n.job, html,
    search: [{t: n.name, d: n.job, a: "/villagers/" + n.id}, ...L.filter(l => l.id && ITEMS[l.id]).map(l => ({t: `${ITEMS[l.id].n}: loved by ${n.name}`, d: "A gift " + n.name + " loves", a: "/villagers/" + n.id}))]};
}
export const pages = () => [
  {slug: "villagers", title: "Villagers", section: "people", blurb: `All ${VILLAGERS.length} Honeybrook villagers, where to find them, and what they love`,
    html: lede(`Honeybrook has ${VILLAGERS.length} villagers. Get to know them: say hello, help with their requests on the quest board, and give gifts they love. Hearts open up trips together, visits and more.`)
      + `<div class="cards">${VILLAGERS.map(n => `<a class="card" href="/villagers/${n.id}">${badge(n)}<span><b>${esc(n.name)}</b><small>${esc(n.job || "")}</small></span></a>`).join("")}</div>`},
  ...VILLAGERS.map(page)
];
