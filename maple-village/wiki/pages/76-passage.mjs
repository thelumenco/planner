// Round 229: the secret passage under the cellar door: the clue trail (folded away, it's a mystery), the wine cave
// and its spots, ageing wine, Tomás's forgotten bottles, Monday candlelit suppers, the way through to the Scoop Shack,
// and Hazel's chapters. Numbers from src/game/passage.js and src/data/world.js.
import { AGE, SUPPER, OLD, STEP } from "../../src/game/passage.js";
import { ROOMS } from "../../src/data/world.js";
import { STORIES } from "../../src/data/stories.js";
import { GOALS } from "../../src/game/goals.js";
import { esc, table, ico, itemIcon, coin, hm, spoiler, lede, DAYS } from "../lib.mjs";

const pct = x => `${Math.round(x*100)}%`;
const aged = (base, w) => base + Math.round(base*AGE.perWeek*Math.min(AGE.maxWeeks, w));
const clean = l => esc(l.replace(/\{pet\}/g, "your pet"));

function html(){
  const spots = ROOMS.cave.stations.map(s => [`<b>${esc(s[1])}</b>`, esc(s[5])]);
  const trail = `<ol>
    <li><b>A draught.</b> Walk into the cellar door once it's built: the candle on the high table keeps leaning, and your pet noses at the barrel racks.</li>
    <li><b>The bricks</b> (a later day). Tap the barrel racks: behind them, old bricks scratched with T.R. 1912. From then on they show on the cellar's left wall.</li>
    <li><b>The photograph</b> (a later day). The old photograph by the door of the old mill: turn it over for Tomás's clue. (If the mill isn't yours yet, the door's on the latch for this.)</li>
    <li><b>The key</b> (straight after). Tap the millstone: there's something under its lip.</li>
    <li><b>The door.</b> Tap the bricks in the cellar again. The door stays in the cellar's west wall from then on, though you'd hardly know it's there.</li></ol>
    <p class="muted">At most one new clue a day. Miss a few days and nothing's lost: the next step simply waits. On a new day mid-trail, your pet gives you a gentle nudge as you walk into the cellar.</p>`;
  const ex = [12, 18, 24, 28].map(b => [coin(b), coin(aged(b, 1)), coin(aged(b, 4)), coin(aged(b, AGE.maxWeeks))]);
  const hz = STORIES.hazel || [];
  return lede(`Under the vineyard, behind the cellar door's barrel racks, the brothers of an old priory by the bay dug a wine cave and a passage down to their boats. Tomás, who planted the olive by the old mill, found it in 1912 and bricked it up. It's waiting for you, once the <a href="/vineyard-and-wine#cellar">cellar door</a> is built (${coin(GOALS.cellar.price)}).`)
  + `<h2 id="trail">${ico("sparkle", 22)} Finding it</h2>${spoiler("The clue trail, step by step", trail)}
  <h2 id="cave">${ico("wine_red", 22)} The wine cave</h2>
    <p>A brick barrel vault over limestone walls, flagstones, candles in their niches, cobwebs and a hanging iron lantern. Over the far gate the brothers carved VINUM LAETIFICAT COR: wine gladdens the heart. Its door on the east wall goes back up to the cellar.</p>
    ${table(["Spot", "What's there"], spots)}
  <h2 id="ageing">${ico("clock", 22)} Ageing wine</h2>
    <p>Lay wine down in the alcoves from the cellar (up to ${AGE.cap} bottles at a time). A wine gains ${pct(AGE.perWeek)} of its bottle price for every full week it rests, up to ${AGE.maxWeeks} weeks (${pct(AGE.perWeek*AGE.maxWeeks)} more), rounded to the nearest coin. The price it starts from is its own price if it has one, or its style's price plus any riddling. Bring it up and it goes back to the cellar, kept back from the staff who stock the shelves, and sells for the extra once you stock it yourself.</p>
    ${table(["Bottle price", "After 1 week", "After 4 weeks", `After ${AGE.maxWeeks} weeks or more`], ex)}
  <h2 id="bottles">${ico("ob_1958", 22)} Forgotten bottles</h2>
    <p>An old crate holds three dusty bottles, one of each, with tags in Tomás's hand. <b>Keep it</b> puts one in your backpack as a keepsake, to treasure on a shelf or give to a friend (they can't be sold). <b>Open it here</b> pours a glass and a toast to Tomás.</p>
    ${table(["Bottle", "The tag"], OLD.map(b => [`${itemIcon(b.id, 22)} <b>${esc(b.n)}</b>`, `“${esc(b.tag)}”`]))}
  <h2 id="supper">${ico("calendar", 22)} Candlelit suppers</h2>
    <p>${DAYS[SUPPER.dow]}, ${hm(SUPPER.from)} to ${hm(SUPPER.to)}: the long table's laid with candelabra, plates and glasses, and ${SUPPER.guests} villagers come down to sit at it. Tap the table to host, once a night: ${coin(SUPPER.fee)} a guest, ${coin(SUPPER.fee*SUPPER.guests)} in all. Outside supper time, the table tells you when they are.</p>
  <h2 id="scoop">${ico("icecream", 22)} Through to the Scoop Shack</h2>
    <p>The rusty gate under the carved arch, with a sea-blue glow beyond, leads down the brothers' passage to the bay and out behind a section of shelving in the Scoop Shack's gelato kitchen (the Scoop Shack was the brothers' little priory, long ago). After your first trip through, those shelves are a way back into the cave. Look for a hairline of light, and a tea towel that won't keep still.</p>
  <h2 id="hazel">${ico("chat", 22)} Hazel's story</h2>
    <p>Once you've found the passage, <a href="/villagers/hazel#story">Hazel</a> from the Mill Shop tells how it came to be, ${hz.length} chapters, one at a time like the other villagers' stories.</p>
    ${hz.length ? spoiler(`Hazel's ${hz.length} chapters`, hz.map((c, i) => `<h3>Chapter ${i + 1}</h3>${c.lines.map(l => `<p>"${clean(l)}"</p>`).join("")}`).join("")) : ""}`;
}
export const pages = () => [{slug: "secret-passage", title: "The secret passage", section: "village", blurb: "A clue trail under the cellar door, the monks' wine cave, ageing wine, Monday suppers and a way through to the Scoop Shack", html: html(),
  search: [{t: "Secret passage", d: "Under the cellar door", a: "/secret-passage"}, {t: "Wine cave", d: "Ageing wine, forgotten bottles, Monday suppers", a: "/secret-passage#cave"},
    {t: "Ageing wine", d: `Up to ${AGE.cap} bottles, ${pct(AGE.perWeek)} a week for ${AGE.maxWeeks} weeks`, a: "/secret-passage#ageing"}, {t: "Candlelit suppers", d: `${DAYS[SUPPER.dow]}, ${hm(SUPPER.from)} to ${hm(SUPPER.to)}`, a: "/secret-passage#supper"}]}];
