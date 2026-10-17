// The calendar: the seasons and what changes, the week, the occasions and festivals, and the Christmas season.
// From data/items.js SEASONS, data/orchard.js, art/village-extras.js FESTIVALS, game/tours.js, occasions.js, xmas.js, mulled.js.
import { ITEMS, SEASONS } from "../../src/data/items.js";
import { TREES, FLOWERS } from "../../src/data/orchard.js";
import { FESTIVALS } from "../../src/art/village-extras.js";
import { OCC } from "../../src/game/occasions.js";
import { XMAS, XMAS_FROM, XMAS_TO, XMAS_LIT, DATE_FROM, DATE_TO, CLUB_FROM, CLUB_TO, DISCO_FROM, DISCO_TO, WS_FROM, WS_TO, CLASS_FROM, CLASS_TO, APERITIVO, VAN, MOVIE, BAYMKT, eventsOn, TOUR_FEE } from "../../src/game/tours.js";
import { CLASS as CARD_CLASS } from "../../src/game/paperie.js";
import { PUFFIN_MONTHS, PUP_MONTHS } from "../../src/data/puffin.js";
import { SNOW_MONTHS, MUSICBOXES } from "../../src/data/hokkaido.js";
import { esc, table, ico, itemIcon, coin, lede, hm } from "../lib.mjs";

const h2 = (id, t, icon) => `<h2 id="${id}">${icon ? ico(icon, 22) + " " : ""}${esc(t)}</h2>`;
const h3 = (id, t) => `<h3 id="${id}">${esc(t)}</h3>`;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const months = a => a.map(m => MONTHS[m - 1]).join(", ");
const VISITED = {bellbird: "Bellbird Valley", cinque: "Cinque Terre"};
const SEASON_MONTHS = {spring: "March to May", summer: "June to August", autumn: "September to November", winter: "December to February"};
const t2 = ([a, b]) => `${hm(a)} to ${hm(b % (24*60))}`;
const fmtD = k => new Date(k + "T00:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"});
const addD = (k, n) => new Date(Date.parse(k + "T00:00:00Z") + n*864e5).toISOString().slice(0, 10);
const icoList = ids => ids.map(id => `<span style="white-space:nowrap">${itemIcon(id, 22)}${esc(ITEMS[id] ? ITEMS[id].n : id)}</span>`).join(", ");

function seasonsHTML(){
  const seeds = s => Object.keys(ITEMS).filter(id => ITEMS[id].kind === "seed" && !id.startsWith("gh_") && (ITEMS[id].seasons || []).includes(s));
  const trees = s => Object.values(TREES).filter(t => (t.seasons || []).includes(s)).map(t => t.fruit);
  const flowers = s => Object.entries(FLOWERS).filter(([, f]) => (f.seasons || []).includes(s)).map(([id]) => "bq_" + id);
  return lede("Honeybrook keeps the real calendar, on your own clock: the seasons, the days of the week and the special days all come round just as they do for you. Here's what happens when.")
  + h2("seasons", "The seasons", "sprout")
  + `<p>Seasons follow the real months. When the season turns, Hana's seed packets change (anything already bought or planted carries on), the orchard and the flower farm come into their own seasons, and the tapas of the day change too. A greenhouse grows anything all year round.</p>`
  + Object.entries(SEASONS).map(([s, S]) => h3(s, `${S.n}: ${SEASON_MONTHS[s]}`) + `<p class="muted">${esc(S.line)}.</p>`
    + table(["", "In season"], [["<b>Seeds at the market</b>", icoList(seeds(s)) + (seeds(s).some(id => ITEMS[id].visited) ? `<br><small class="muted">${seeds(s).filter(id => ITEMS[id].visited).map(id => `${esc(ITEMS[id].n)} once you've visited ${esc(VISITED[ITEMS[id].visited] || ITEMS[id].visited)}`).join("; ")}.</small>` : "")], ["<b>Orchard fruit</b>", icoList(trees(s))], ["<b>Flower farm</b>", icoList(flowers(s)).replace(/Bouquet of (\w)/g, (m, c) => c.toUpperCase())]])).join("")
  + h3("weather", "The weather")
  + `<p>The rainy months are November to January: roughly one day in three is a proper downpour (paddling's off), and another one in ten a light shower. The rest of the year a shower blows through about one day in seven: brollies up, nothing called off. Rain never lasts all day: a wet day has one spell of rain, half an hour to an hour, some time between 8am and 8pm.</p>`
  + h3("travel-seasons", "Seasons away from home")
  + table(["Where", "When", "What"], [
    ["<a href=\"/trips/puffin\">Puffin Isle</a>", months(PUFFIN_MONTHS), "Puffins, and a puffin stamp each month."],
    ["<a href=\"/trips/puffin\">Puffin Isle</a>", months(PUP_MONTHS), "Seal pups, and the seal pup stamp."],
    ["<a href=\"/trips/hokkaido\">Hokkaido</a>", months(SNOW_MONTHS), "Snow, and ski lessons at Niseko."],
    ["<a href=\"/trips/hokkaido\">Hokkaido</a>", "February", "The snow festival in Sapporo's long park."],
    ["<a href=\"/trips/hokkaido\">Hokkaido</a>", "Each season", "A music box for the season: " + Object.values(MUSICBOXES).map(m => `"${esc(m[0])}"`).join(", ") + "."]
  ].map(r => r.map((c, i) => i === 1 ? esc(c) : c)));
}

function weekHTML(){
  const W = [
    ["Every day", [`Farid's tea and cake at the cottage, 3pm`, `Customers at the wine shop ${hm(10*60)} to ${hm(22*60)}`]],
    ["Monday to Saturday", [`Hana's class on the exercise lawn, ${t2([CLASS_FROM, CLASS_TO])}: Pilates on Mondays and Wednesdays, Zumba on Tuesdays and Thursdays, Piloxing on Fridays and Saturdays`]],
    ["Sunday", [`<a href="/markets#sunday-farmers-market">Sunday farmers market</a> on the field, ${t2((e => [e.from, e.to])(eventsOn("2026-10-18")[0]))}`, `Orchard tours at 10am, 11:30am, 2pm and 4pm (${coin(TOUR_FEE)} a person into the farm shop's tin)`, `The Sunday long lunch on the terrace, 12 to 3pm (once the terrace is built)`]],
    ["Monday", [`Painters bring new paintings for the gift shop's gallery wall, and makers top up their shelf`, `The Cocoa Room, the gift shop and the Mill Shop are closed`]],
    ["Tuesday", [`<a href="/markets#night-market">Night market</a> on the field, ${t2([17*60 + 30, 22*60])}`, `Bo leads an orchard tour after work, ${t2([17*60 + 45, 18*60 + 30])}`, `Date night: Tomi and Posy in the tasting room, ${t2([DATE_FROM, DATE_TO])}`]],
    ["Wednesday", [`${OCC.trivia.n} on the terrace, ${t2([OCC.trivia.from, OCC.trivia.to])}`]],
    ["Thursday", [`<a href="/markets#night-market">Night market</a>, ${t2([17*60 + 30, 22*60])}`, `Bo's orchard tour, ${t2([17*60 + 45, 18*60 + 30])}`, `${OCC.paint.n} on the terrace with Theo, ${t2([OCC.paint.from, OCC.paint.to])}`]],
    ["Friday", [`Aperitivo hour at the wine shop, ${t2(APERITIVO)}`, `<a href="/markets#friday-market">Friday market</a> on the field, ${t2(BAYMKT)}`, `The fishmonger's van at the bay, ${t2(VAN)}`, `Sunset fishing off the beach, ${t2([17*60, 20*60])}`,
      `First Friday of the month: the wine club at the cellar door, ${t2([CLUB_FROM, CLUB_TO])}`, `Last Friday of the month: movie night on the field, ${t2(MOVIE)}`, `In the Christmas season: carols by the Christmas tree, 7pm`]],
    ["Saturday", [`Orchard tours at 10am, 11:30am, 2pm and 4pm`, `Disco night at the cellar door, ${t2([DISCO_FROM, DISCO_TO])}`, `Bonbon workshop at the Cocoa Room, ${t2([WS_FROM, WS_TO])} (an upgrade)`, `Card-making class at your paperie in Montrose, ${t2([CARD_CLASS.from, CARD_CLASS.to])}`,
      `Date night: Tomi and Posy in the tasting room, ${t2([DATE_FROM, DATE_TO])}`, `Second Saturday of the month (and the fourth too, October to March): a wedding on the terrace, ${t2([OCC.wedding.from, OCC.wedding.to])}`, `Last Saturday of the month: the <a href="/markets#field-fair">field fair</a>, ${t2([10*60, 16*60])}`,
      `In the Christmas season: Santa's grotto on the field, 5 to 8pm`]]
  ];
  return h2("the-week", "The week", "calendar")
  + `<p>Some of these need something built or bought first: the terrace for trivia, sip and paint, weddings and Sunday lunch; the cellar door for the wine club and disco night. The good news board in the town square shows what's on over the next fortnight.</p>`
  + table(["Day", "What's on"], W.map(([d, l]) => [`<b>${esc(d)}</b>`, `<ul class="plain" style="margin:0">${l.map(x => `<li>${x}</li>`).join("")}</ul>`]));
}

function occasionsHTML(){
  const fests = FESTIVALS.map(f => [`<b id="${f.id}">${esc(f.name)}</b>`, f.dates.map(k => `<span style="white-space:nowrap">${fmtD(k)}</span>`).join("<br>"), `Decorations up ${f.before} day${f.before === 1 ? "" : "s"} before${f.after ? `, down ${f.after} day${f.after === 1 ? "" : "s"} after` : ""}${f.vineyard ? ". Bunting over the vines, and every bunch you pick is a big one" : ""}`]);
  const occ = [
    [OCC.valentine.n, "14 February", t2([OCC.valentine.from, OCC.valentine.to]), "Candles and couples on the terrace."],
    ["Mother's Day long lunch", "The second Sunday in May", "12 to 3pm", "The Sunday long lunch, with a toast to everyone who mothers us."],
    [OCC.christmas.n, "25 December", t2([OCC.christmas.from, OCC.christmas.to]), "All your closest friends at the long table, crackers and paper crowns."],
    [OCC.nye.n, "31 December", t2([OCC.nye.from, OCC.nye.to]), "Dancing and a countdown on the terrace."]
  ].map(([n, d, t, w]) => [`<b>${esc(n)}</b>`, esc(d), `<span style="white-space:nowrap">${esc(t)}</span>`, esc(w)]);
  return h2("occasions", "Occasions on the terrace", "wine_rose")
  + `<p>Once the wine shop has its terrace, these special days take it over (they win over the usual weekly nights).</p>`
  + table(["Occasion", "When", "Time", ""], occ)
  + h3("hamper-seasons", "Hamper seasons")
  + `<p>Penny's hamper table at the post office comes out for Valentine's (1 to 14 February), Mother's Day (1 May to the second Sunday in May) and the Christmas season. See <a href="/hearts-and-gifts#hampers">Hampers</a>.</p>`
  + h2("festivals", "Festivals", "lantern")
  + `<p>The village puts up decorations for these, and they show on the good news board's calendar. Some move each year, so the game keeps a table of dates.</p>`
  + table(["Festival", "Dates", ""], fests);
}

function christmasHTML(){
  const goods = XMAS.flatMap(s => [...(s.items || []), ...(s.treats || [])]).filter(id => ITEMS[id]);
  return h2("christmas", "The Christmas season", "xm_star")
  + table(["When", "What"], [
    ["20 November", `The Christmas market opens on the field, every evening ${t2([XMAS_FROM, XMAS_TO])}, until Christmas Eve. The very first night the whole village gathers round the tree and counts it down.`],
    ["Every evening", `The village Christmas tree on the football pitch is lit at ${hm(XMAS_LIT)}.`],
    ["20 November to Boxing Day", `Mulled wine season: the big copper pot is on in the wine shop kitchen. Mull a bottle of your own red with spices from Hana and fruit or honey, then sell the cups.`],
    ["Fridays", "Carols by the Christmas tree, 7pm. Pick one, and everybody sings."],
    ["Weekends", "Santa's grotto on the field, 5 to 8pm. A visit gets you a photo with Santa to keep."],
    ["1 December", "Hamper orders start at the post office: two a day pinned up by Penny's hamper table."],
    ["24 December", "The lantern walk round the field, 8:15pm. You keep your paper lantern."],
    ["25 December", `Christmas Day lunch on the terrace, ${t2([OCC.christmas.from, OCC.christmas.to])}.`],
    ["31 December", `New Year's Eve on the terrace, ${t2([OCC.nye.from, OCC.nye.to])}.`]
  ].map(([a, b]) => [`<b>${esc(a)}</b>`, b]))
  + `<p>The Christmas market takes the place of the night market, the fair, the Friday market and movie night, but the Sunday farmers market carries on. Its stalls include your own (things you've made), the mulled wine stall and, once it's yours, the Cocoa Room's. See every stall on the <a href="/markets#christmas-market">Markets</a> page.</p>
  <p>Christmas things to buy: ${icoList([...new Set(goods)])}.</p>`;
}

export const pages = () => {
  const html = seasonsHTML() + weekHTML() + occasionsHTML() + christmasHTML();
  const search = [{t: "Seasons", d: "What changes through the year", a: "/calendar#seasons"}, ...Object.entries(SEASONS).map(([s, S]) => ({t: S.n, d: SEASON_MONTHS[s], a: "/calendar#" + s})),
    {t: "Weather and rainy months", d: "November to January", a: "/calendar#weather"}, {t: "The week", d: "What's on each day", a: "/calendar#the-week"},
    {t: "Trivia night", d: "Wednesdays on the terrace", a: "/calendar#the-week"}, {t: "Sip and paint", d: "Thursdays on the terrace", a: "/calendar#the-week"}, {t: "Disco night", d: "Saturdays at the cellar door", a: "/calendar#the-week"},
    {t: "Wine club", d: "First Friday of the month", a: "/calendar#the-week"}, {t: "Movie night", d: "Last Friday of the month", a: "/calendar#the-week"}, {t: "Weddings", d: "On the terrace", a: "/calendar#the-week"},
    {t: "Sunday long lunch", d: "On the terrace, 12 to 3pm", a: "/calendar#the-week"}, {t: "Orchard tours", d: "Weekends, and Bo's after-work tours", a: "/calendar#the-week"}, {t: "Hana's class", d: "Pilates, Zumba and Piloxing", a: "/calendar#the-week"},
    {t: "Aperitivo hour", d: "Friday evenings at the wine shop", a: "/calendar#the-week"}, {t: "Occasions", d: "Valentine's, Mother's Day, Christmas, New Year's Eve", a: "/calendar#occasions"},
    {t: "Valentine's dinner", d: "14 February", a: "/calendar#occasions"}, {t: "Mother's Day", d: "Second Sunday in May", a: "/calendar#occasions"}, {t: "New Year's Eve", d: "31 December", a: "/calendar#occasions"},
    ...FESTIVALS.map(f => ({t: f.name, d: "A festival", a: "/calendar#festivals"})),
    {t: "Christmas season", d: "20 November to Christmas Eve", a: "/calendar#christmas"}, {t: "Santa's grotto", d: "Weekend evenings at Christmas", a: "/calendar#christmas"}, {t: "Mulled wine season", d: "20 November to Boxing Day", a: "/calendar#christmas"},
    {t: "Christmas tree lighting", d: "20 November", a: "/calendar#christmas"}, {t: "Lantern walk", d: "Christmas Eve", a: "/calendar#christmas"}, {t: "Carols", d: "Fridays at Christmas", a: "/calendar#christmas"}];
  return [{slug: "calendar", title: "Calendar", section: "calendar", blurb: "The seasons, the week, occasions, festivals and the Christmas season", html, search}];
};
