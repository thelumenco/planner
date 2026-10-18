// Villagers: the list, and a page for each of Honeybrook's villagers (who they are, where to find them, what they love)
import { NPCS } from "../../src/data/npcs.js";
import { lovesOf } from "../../src/data/loves.js";
import { ITEMS } from "../../src/data/items.js";
import { STORIES } from "../../src/data/stories.js";
import { esc, table, hm, daysText, placeName, itemIcon, spoiler, lede, portrait, thingName } from "../lib.mjs";

const VILLAGERS = NPCS.filter(n => !n.tourist && !n.local && !n.kid);
const NEEDS = {mill: "once you've restored the old mill", millshop: "once the Mill Shop is open", cocoa: "once the Cocoa Room is open", giftshop: "once the gift shop is open", scoop: "once the Scoop Shack is open", cellar: "once the cellar door is built", terrace: "once the terrace is built"};
const badge = (n, size = 56) => portrait(n.look, size);   // the villager as the game draws them
const loveName = l => l.id ? thingName(l.id) : (l.what || "Something special");
const loveRow = l => [l.id && ITEMS[l.id] ? itemIcon(l.id, 22) + esc(loveName(l)) : esc(loveName(l)), l.thanks ? `<span class="muted">"${esc(l.thanks)}"</span>` : ""];
function routine(n){
  const rows = (n.routine || []).slice().sort((a, b) => a.from - b.from).map(s => [`${hm(s.from)} to ${hm(s.to)}`, esc(placeName(s.scene)),
    [s.dow ? daysText(s.dow) : s.days === "we" ? "weekends" : s.days === "wd" ? "weekdays" : "every day", s.needs ? NEEDS[s.needs] || "later in the game" : ""].filter(Boolean).join(", ")]);
  return table(["When", "Where", "Days"], rows);
}
// round 226 (Mel: "do the story arcs make it into the wiki?"): each storied villager's chapters, folded away
const GATE = {cocoa: "once the Cocoa Room is open", cellar: "once the cellar door is built", passage: "once the secret passage is found", mill: "once the old mill is restored", oil: "once you've pressed your first bottle at the mill",
  trust1: "once you're a Trusted hand at Wildflower Farm", fish5: "once five kinds of fish are in your journal", bouquet: "when you bring a bouquet", ronda2: "after a second day in Ronda", tiles4: "once you have four of Lucía's tiles"};
const nameOf = id => (NPCS.find(x => x.id === id) || {}).name || id;
const gateText = g => GATE[g] || (/^([a-z]+):(\d+)$/.test(g) ? `after ${g.split(":")[1]} of ${nameOf(g.split(":")[0])}'s chapters` : "later in the game");
const clean = l => esc(l.replace(/\{pet\}/g, "your pet").replace(/\{[a-z]+\}/g, "you"));
function storyHTML(n){
  const ch = STORIES[n.id]; if (!ch || !ch.length) return "";
  return `<h2 id="story">${esc(n.name)}'s story</h2><p>${esc(n.name)} tells you their story a chapter at a time, in their speech bubbles. A chapter can come on a day you've ticked off at least one of your own tasks (at most two villagers a day, one chapter each); finishing ${esc(n.name)}'s request brings their next chapter straight away. A little "…" over their head means one's ready: tap them to hear it. The friendship panel's "Stories so far" keeps everything you've heard.</p>
    ${spoiler(`${n.name}'s story, all ${ch.length} chapters`, ch.map((c, i) => `<h3>Chapter ${i + 1}${(c.needs || []).length ? ` <span class="muted" style="font-size:.85rem">(${esc(c.needs.map(gateText).join(", "))})</span>` : ""}</h3>${c.lines.map(l => `<p>"${clean(l)}"</p>`).join("")}${c.reward ? `<p class="muted">With a little gift at the end.</p>` : ""}`).join(""))}`;
}
function page(n){
  const L = lovesOf(n.id), story = L.filter(l => l.kind === "story" || l.kind === "combo"), every = L.filter(l => l.kind === "everyday");
  const html = `<div class="hero">${badge(n, 110)}<div><p class="lede" style="margin:0">${esc(n.job || "")}</p></div></div>
    ${n.intro ? `<blockquote class="box">"${esc(n.intro)}"</blockquote>` : ""}
    <h2>Where to find ${esc(n.name)}</h2>${routine(n)}
    <p class="muted">Festivals, trips, market days and visits can take villagers somewhere else for a while. Away from these times: ${esc(n.away || "they're at home.")}</p>
    <h2>Gifts ${esc(n.name)} loves</h2>
    <p>A love is worth a whole heart; anything else a villager is happy to have is worth half. One gift a day counts. See <a href="/hearts-and-gifts">Hearts and gifts</a>.</p>
    ${every.length ? table(["Everyday loves", ""], every.map(loveRow)) : ""}
    ${story.length ? spoiler(`${n.name}'s story loves`, `<p class="muted">Tied to ${esc(n.name)}'s own story. Each has its own thank-you.</p>` + table(["Story love", "What they say"], story.map(loveRow))) : ""}
    ${storyHTML(n)}
    ${(n.lines || []).length ? `<h2>Things ${esc(n.name)} says</h2><ul class="plain">${n.lines.slice(0, 6).map(l => `<li>"${esc(l.replace(/\{pet\}/g, "your pet").replace(/\{[a-z]+\}/g, ""))}"</li>`).join("")}</ul>` : ""}`;
  return {slug: "villagers/" + n.id, title: n.name, section: "people", hide: true, blurb: n.job, html,
    search: [{t: n.name, d: n.job, a: "/villagers/" + n.id}, ...L.filter(l => l.id && ITEMS[l.id]).map(l => ({t: `${ITEMS[l.id].n}: loved by ${n.name}`, d: "A gift " + n.name + " loves", a: "/villagers/" + n.id}))]};
}
export const pages = () => [
  {slug: "stories", title: "Villagers' stories", section: "people", blurb: "Every villager with a story to tell, and how the chapters come",
    html: lede(`${Object.keys(STORIES).filter(id => VILLAGERS.some(n => n.id === id)).length} villagers have a story to tell you, a chapter at a time, as you get to know them. The stories tie together: an old chocolatier at the bay, a letter that was never delivered, a secret poet. Each villager's page has their chapters, folded away so nothing is spoiled.`)
      + `<div class="cards">${VILLAGERS.filter(n => STORIES[n.id]).map(n => `<a class="card" href="/villagers/${n.id}#story">${badge(n)}<span><b>${esc(n.name)}</b><small>${STORIES[n.id].length} chapters</small></span></a>`).join("")}</div>`},
  {slug: "villagers", title: "Villagers", section: "people", blurb: `All ${VILLAGERS.length} Honeybrook villagers, where to find them, and what they love`,
    html: lede(`Honeybrook has ${VILLAGERS.length} villagers. Get to know them: say hello, help with their requests on the quest board, and give gifts they love. Hearts open up trips together, visits and more.`)
      + `<div class="cards">${VILLAGERS.map(n => `<a class="card" href="/villagers/${n.id}">${badge(n)}<span><b>${esc(n.name)}</b><small>${esc(n.job || "")}</small></span></a>`).join("")}</div>`},
  ...VILLAGERS.map(page)
];
