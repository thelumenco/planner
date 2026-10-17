// Getting started: the premise, your character and pet, the first days, coins and XP, saving, time and settings;
// the quest board; hearts and gifts. All from the game's own data.
import { ITEMS, LEVELS, seasonOf, SEASONS } from "../../src/data/items.js";
import { NPCS } from "../../src/data/npcs.js";
import { SCREENS, WILF } from "../../src/game/intro.js";
import { SPECIES, KINDS } from "../../src/art/pets.js";
import { BODIES, SKINS, HAIRS, STYLES, TOPS, BOTTOMS, LEGS } from "../../src/game/look.js";
import { PRONOUNS } from "../../src/game/me.js";
import { SLOTS } from "../../src/game/slots.js";
import { GOALS } from "../../src/game/goals.js";
import { SHOP as VINE_SHOP } from "../../src/game/vineyard.js";
import { TASK_PAY, PAID_PER_DAY, MAX_REQ, MAX_HEARTS, FRIEND_HEARTS, TRIP_HEARTS, ASKERS, payEach, howMany } from "../../src/game/quests.js";
import { PLACES, DEFAULT_PLACE } from "../../src/data/places.js";
import { POSTAGE, REGIONS, OPENINGS } from "../../src/game/contacts.js";
import { STAMPS as WRAP_STAMPS } from "../../src/game/wrap.js";
import { esc, table, ico, itemIcon, coin, lede, spoiler, hm } from "../lib.mjs";

const h2 = (id, t, icon) => `<h2 id="${id}">${icon ? ico(icon, 22) + " " : ""}${esc(t)}</h2>`;
const h3 = (id, t) => `<h3 id="${id}">${esc(t)}</h3>`;
const list = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
const cap = s => s[0].toUpperCase() + s.slice(1);
const nm = id => (NPCS.find(n => n.id === id) || {name: id}).name;
const VILLAGERS = NPCS.filter(n => !n.tourist && !n.local && !n.kid);

// a pet portrait, drawn like the setup card's (the game's own filters are renamed to the wiki's)
export function petSvg(kind, size = 64){
  return import("../../src/art/pets.js").then(m => {
    const a = m.petArt(kind), [c1, c2, c3] = SPECIES[kind].cols;
    const fix = s => String(s).replace(/url\(#marker\)/g, "url(#markerS)").replace(/url\(#wob\)/g, "url(#wobS)");
    return `<svg viewBox="12 0 104 122" width="${size}" height="${size}" aria-hidden="true" style="--pet1:${c1};--pet2:${c2};--pet3:${c3};overflow:visible;flex:none"><g>${fix(a.tail)}</g><g>${fix(a.body)}</g><g>${fix(a.head)}</g></svg>`;
  });
}

// the welcome bag: three packets each of the season's three cheapest garden seeds (core.js starterSeeds)
const starter = season => Object.keys(ITEMS).filter(k => ITEMS[k].kind === "seed" && ITEMS[k].price && !k.startsWith("gh_") && (ITEMS[k].seasons || []).includes(season))
  .sort((a, b) => ITEMS[a].price - ITEMS[b].price).slice(0, 3);

async function gettingStarted(){
  const pets = await Promise.all(KINDS.map(async k => [k, await petSvg(k, 48)]));
  const goals = [...Object.entries(GOALS).map(([k, g]) => ({k, n: g.n, price: g.price, line: g.line, needs: g.needs && GOALS[g.needs] ? GOALS[g.needs].n : ""})),
    {k: "terrace", n: VINE_SHOP.terrace.n, price: VINE_SHOP.terrace.price, line: VINE_SHOP.terrace.say + " Bought at the vineyard stall.", needs: ""}].sort((a, b) => a.price - b.price);
  const html = lede(`You've inherited your great-uncle ${esc(WILF.name)}'s house and vineyard in Honeybrook, along with the companion he left behind. This page covers the first steps: making your character, choosing your pet, how coins and friendship work, and how the game keeps time and saves your progress.`)
  + h2("the-story", "How it begins", "letter")
  + `<p>A new game opens with a short story told through your own eyes. You're a tired office worker with a busy city office job: late nights, dinner at the desk, the packed morning train. Then a fat brown envelope arrives from a firm of solicitors in Honeybrook. ${esc(WILF.short)} has left you his house and his vineyard, and his note asks two things: look after the vineyard, and look after his companion, who'll be waiting.</p>
  <p>The story can be skipped, and you can watch it again any time from the settings ("Watch the story again").</p>`
  + spoiler("The opening story, screen by screen", `<ol>${SCREENS.map(s => `<li><b>${esc(s.title)}</b></li>`).join("")}</ol><p class="muted">The will turned up years late, tucked inside a cookery book. The last screen, "Honeybrook time", explains that time in Honeybrook passes just as it does in your own day.</p>`)
  + h2("your-character", "Making your character", "sparkle")
  + `<p>After the story comes the setup card, three calm pages:</p>
  <ol><li><b>You.</b> Your name (up to 24 letters) and your pronouns: ${list(Object.values(PRONOUNS).map(p => esc(p.label)))}, or your own. Narration always calls you "you"; the pronouns are for when villagers talk about you.</li>
  <li><b>How you look</b>, with a live preview. Body: ${list(BODIES.map(b => esc(b[1].toLowerCase()))).replace(/ and ([^ ]+)$/, " or $1")}. ${SKINS.length} skin tones. Hair: ${list(STYLES.map(s => esc(s[1].toLowerCase())))}, in ${HAIRS.length} colours. ${TOPS.length} top colours. ${cap(list(LEGS.map(l => esc(l[1].toLowerCase()))).replace(/ and ([^ ]+)$/, " or a $1"))} in ${BOTTOMS.length} colours.</li>
  <li><b>Your pet</b>: "Who's waiting on the porch?" Pick which of the five animals was ${esc(WILF.short)}'s companion, and give it a name.</li></ol>
  <p>You can change your look later from the wardrobe in your room or from the settings, and rename yourself and your pet in the settings. The pet's species stays the same for the whole game.</p>`
  + h2("pets", "The five pets", "fox")
  + table(["", "Pet", "Suggested names", "Character"], pets.map(([k, svg]) => [svg, `<b>${esc(SPECIES[k].n)}</b>`, esc(SPECIES[k].names.join(", ")), esc(SPECIES[k].line)]))
  + `<p>More about what your pet does, and how to spoil it, on the <a href="/pets">Pets</a> page.</p>`
  + h2("first-days", "The first days", "sprout")
  + `<p>A new game starts with ${coin(100)} coins and a welcome bag of seeds: three packets each of the three cheapest garden seeds that grow in the current season.</p>`
  + table(["Season", "Your welcome seeds"], Object.keys(SEASONS).map(s => [esc(SEASONS[s].n), starter(s).map(id => `${itemIcon(id, 22)}${esc(ITEMS[id].n)} ×3`).join("<br>")]))
  + `<p>Some good first steps:</p><ul class="plain">
    <li>Plant your seeds in the <a href="/garden-and-crops">garden</a> beside the house, and water them.</li>
    <li>Walk over the bridge to the town square and look at the <a href="/quest-board">quest board</a>. On your very first day two villagers pin up requests.</li>
    <li>Pin a few of your own real-life tasks to the board. Each tick pays coins.</li>
    <li>Say hello to everyone you pass. Villagers' stories open up as you get to know them (see <a href="/hearts-and-gifts">Hearts and gifts</a>).</li>
    <li>Pop into the <a href="/places#market">market</a>, where Hana sells seeds, treats, pet care things, gifts and more.</li></ul>`
  + h2("honeybrook-time", "Honeybrook time", "clock")
  + `<p>Time in Honeybrook passes just as it does in your own day: the clock follows your own time zone, morning there is your morning, and night is your night. The day turns over at midnight. Seeds take real hours to grow, the shops keep their hours, and your friends keep to their days.</p>
  <p>So Honeybrook is a slow game, made for little and often: come back a little each day and watch the place come to life. Seasons follow the real calendar too (see the <a href="/calendar">Calendar</a>).</p>`
  + h2("coins", "Coins", "coin")
  + `<p>Coins are Honeybrook's money. You earn them by:</p><ul class="plain">
    <li>ticking off your own tasks on the quest board: ${coin(TASK_PAY)} each, for the first ${PAID_PER_DAY} ticks of the day (a coin more if you walk to the task's place first);</li>
    <li>handing over village requests, which pay a little more than the market would;</li>
    <li>selling what you grow and make, at the market's Sell tab and in your own shops once you have them.</li></ul>
  <p>Some treats and toys at the market only unlock once you've earned enough coins that day. Anything bought by mistake can be undone straight away from the bar that pops up.</p>`
  + h3("big-goals", "Things to save up for")
  + table(["Goal", "Price", "What it is"], goals.map(g => [`<b>${esc(g.n)}</b>`, coin(g.price), esc(g.line) + (g.needs ? ` <span class="muted">(needs ${esc(g.needs.replace(/^The /, "the "))} first)</span>` : "")]))
  + h2("xp", "XP and your pet's friendship", "heart")
  + `<p>XP measures your friendship with your pet. You get 5 XP the first time you earn coins each day, and a little more for ticking tasks, feeding treats, playing with care things, feeding the animal run and giving gifts. Each level has a name, and some bring a present that shows up around your pet's rug.</p>`
  + table(["Level", "XP", "Name", "Present"], LEVELS.map((l, i) => [String(i + 1), String(l.xp), esc(l.name), l.gift ? esc(l.gift) : ""]))
  + h2("saving", "Saving, slots and your account", "bag")
  + `<p>The game saves as you play. It opens on a welcome screen with Honeybrook at golden hour, "Continue" for the game you last played, and <b>${SLOTS} save slots</b>. Each slot card shows your name and pet, the day you're on, your coins, your closest friend's hearts and when you last played; an empty one says "New game". Deleting a slot asks first. "Back to the title screen" in the settings takes you back to the slots.</p>
  <p>Everyone plays signed in, with Google or with an email address and password (there's "make an account" and "forgot your password" too). Your three slots are kept in your account and follow you to any device you sign in on. The first time you sign in, the game already in that browser comes with you. For extra peace of mind, "Download a backup" in the settings saves a file copy.</p>`
  + h2("bedtime", "Bedtime", "bed")
  + `<p>Your bed (in your room) has two uses: a 20-minute nap that wakes you with a chime, or lying down for as long as you like.</p>
  <p>The settings can keep you in bed overnight: from your bedtime until your wake-up time the village rests, with a calm screen saying how long until morning. In the 45 minutes before bed your pet nudges you and short, gentle wind-down lines appear. Pick your own times; the game starts at a bedtime of ${hm(23*60 + 45)} and up at ${hm(6*60)}.</p>`
  + h2("settings", "Settings", "gear")
  + table(["Section", "What's there"], [
    ["Sound", "Music (a calm piano loop) and its volume, sound effects, and a test sound."],
    ["Quiet", "Stay in bed overnight, with your bedtime and wake-up time."],
    ["Your goals", "How much water and how many steps a day you're aiming for (the little trackers at the top of the map), and \"Peace and quiet\": once your task list is done, nobody talks unless you tap them."],
    ["The story and the title screen", "Watch the story again; back to the title screen and your three save slots."],
    ["Your game is safe", "Download a backup file."],
    ["Write to us", "An email button for bugs, wishes and places you'd love to visit."],
    ["Support Honeybrook", "The tip jar: \"Leave a tip\" on Ko-fi. Honeybrook is made by one person, and the tip is entirely optional: the whole game stays free. (Not shown in the app-store versions.)"],
    ["Your newspaper", "Rename the weekend paper that lands in your letterbox."],
    ["You", "Change your name, and change your look."],
    ["Your pet", "Rename your pet."]].map(([a, b]) => [`<b>${esc(a)}</b>`, esc(b)]));
  const search = [["the-story", "The opening story", "How you came to Honeybrook"], ["your-character", "Making your character", "Name, pronouns and look"], ["pets", "Choosing your pet", "Fox, rabbit, tortoise, quokka or capybara"],
    ["first-days", "Starting coins and seeds", "What a new game starts with"], ["honeybrook-time", "Honeybrook time", "The clock follows your own day"], ["coins", "Coins", "How to earn them"], ["big-goals", "Big goals", "Things to save up for"],
    ["xp", "XP and friendship levels", "Your pet's friendship"], ["saving", "Save slots and cloud saves", "Three slots, signing in"], ["bedtime", "Bedtime", "Stay in bed overnight"], ["settings", "Settings and the tip jar", "Everything in the settings"]]
    .map(([a, t, d]) => ({t, d, a: "/getting-started#" + a}));
  goals.forEach(g => search.push({t: g.n, d: `A big goal: ${g.price} coins`, a: "/getting-started#big-goals"}));
  return {slug: "getting-started", title: "Getting started", section: "start", blurb: "Your new life in Honeybrook: your character, your pet, coins, saving and time", html, search};
}

function questBoard(){
  const placeRows = Object.entries(PLACES).map(([id, p]) => [`<b>${esc(p.n[0].toUpperCase() + p.n.slice(1))}</b><br><small class="muted">${esc(p.doing)}</small>`,
    id === DEFAULT_PLACE ? "<i>anything that matches nothing else</i>" : esc([...p.words, ...p.verbs].join(", "))]);
  const askers = Object.entries(ASKERS).map(([id, a]) => [`<a href="/villagers/${id}">${esc(nm(id))}</a>`, a.likes.filter(x => ITEMS[x]).map(x => `<span title="${esc(ITEMS[x].n)}">${itemIcon(x, 22)}</span>`).join(" ") + `<br><small class="muted">${esc(a.likes.filter(x => ITEMS[x]).map(x => ITEMS[x].n).join(", "))}</small>`]);
  const ex = ["carrot", "egg", "pumpkin", "loaf", "oliveoil"].filter(x => ITEMS[x]).map(x => [`${itemIcon(x, 22)}${esc(ITEMS[x].n)}`, String(howMany(x)), coin(payEach(x)), coin(howMany(x)*payEach(x))]);
  const html = lede(`The quest board in the town square holds two kinds of quest side by side: your own real-life tasks, typed in by you, and requests from Honeybrook's villagers. You can open it from the board itself or from the board button at the top of the screen.`)
  + h2("your-tasks", "Your own tasks", "note")
  + `<p>Type in anything you'd like to get done today, big or small, and pin it as a <b>one-off</b> or a <b>daily</b> task. There are no connections to other apps: it's just your list.</p><ul class="plain">
    <li>Each tick pays ${coin(TASK_PAY)} coins and helps the crops in your garden grow a little. Only the first ${PAID_PER_DAY} ticks of a day pay, but you can add and tick as many as you like.</li>
    <li>Unticking gives the coins back.</li>
    <li>Daily tasks come back fresh at midnight. One-offs stay until you tick them, then they're crossed off for the rest of that day and gone the next.</li>
    <li>You can tick a task on the board or straight from the little quest note on the map.</li></ul>`
  + h2("task-places", "Task places", "walker")
  + `<p>Each task goes to a place in the village, chosen by the words in it. A specific word (what the task is about, like "email", "laundry" or "tax") beats a general one (how you'll do it, like "write", "send" or "sort"). Between two equal words, the one that comes first wins. If nothing matches, the task goes to your desk at home.</p>
  <p>Every task shows its place in a little picker, so you can choose somewhere else (your choice sticks), and a "go" button walks you there. Going is optional: you can tick anywhere. But doing it in its place pays <b>a coin more</b>, within the day's ${PAID_PER_DAY} paid ticks.</p>
  <p class="muted">Examples: "write an email" goes to the post office; "write my essay" goes to the library desk.</p>`
  + table(["Place", "Words that send a task there"], placeRows)
  + h2("village-requests", "Village requests", "board")
  + `<ul class="plain"><li>Up to ${MAX_REQ} requests can be up at once. On your very first day two villagers pin one up, and after that a new one goes up most mornings (now and then there's a quiet day).</li>
    <li>Villagers only ask for in-season garden crops, or for things you've already had in your backpack that you make yourself (never something Hana sells over the counter).</li>
    <li>Each note says who's asking, how many they need, why, and the deadline: two to four days.</li>
    <li>"Find" walks you to the villager. Once you have everything, tap them to hand it over. A villager who's at home shows "at home" instead.</li>
    <li>A missed deadline quietly takes the note down. There's no penalty.</li></ul>`
  + h3("rewards", "Rewards")
  + `<p>A request pays per item, about 1.4 times the market's sell price (never more than a shop's own price for the same thing), and gives the villager <b>a heart</b>. Finishing someone's request also makes their next story chapter ready that same day.</p>`
  + table(["Item", "How many", "Each", "Total"], ex)
  + `<p class="muted">Typical requests. Hearts are never lost; see <a href="/hearts-and-gifts">Hearts and gifts</a>.</p>`
  + h3("who-asks", "Who asks for what")
  + `<p>These villagers post requests, and what they'd most like, in order. If none of it is something you can grow or make yet, they ask for something else you can.</p>`
  + table(["Villager", "Likes to ask for"], askers);
  const search = [{t: "Your own tasks", d: "One-off and daily tasks on the quest board", a: "/quest-board#your-tasks"}, {t: "Task places", d: "Where a task gets done, and the coin more", a: "/quest-board#task-places"},
    {t: "Village requests", d: "Villagers' requests on the quest board", a: "/quest-board#village-requests"}, {t: "Request rewards", d: "Coins and hearts", a: "/quest-board#rewards"},
    ...Object.values(PLACES).map(p => ({t: "Task place: " + p.n, d: p.doing, a: "/quest-board#task-places"}))];
  return {slug: "quest-board", title: "Quest board", section: "start", blurb: "Your own tasks, village requests, task places and rewards", html, search};
}

function heartsAndGifts(){
  const html = lede(`Every Honeybrook villager has five hearts to fill. Hearts come from helping with their requests and from giving presents they like, and they're never lost. As hearts grow, villagers open up: their stories, letters, trips together, and more.`)
  + h2("how-hearts-work", "How hearts work", "heart")
  + `<ul class="plain"><li><b>A village request</b> handed over: one heart.</li>
    <li><b>A present they love</b>: one heart. Each villager has a short list of loves (see each villager's page).</li>
    <li><b>Any other present</b>: half a heart. Two halves make a whole one.</li>
    <li><b>One present a day</b> per villager counts, whether you hand it over in person or send it round.</li>
    <li>Each villager has ${MAX_HEARTS} hearts, and hearts are never lost.</li></ul>
  <p class="muted">One exception: Tomi and dairy don't get on, so a dairy present for him is a kind thought but earns no heart.</p>`
  + h2("what-hearts-unlock", "What each level unlocks", "sparkle")
  + table(["Hearts", "What happens"], [
    ["Once you've met", "Their first story chapter."],
    ["2", "A thank-you letter in your letterbox."],
    [String(FRIEND_HEARTS), "They count as a friend: you can send them presents without finding them, post them a hamper, and they can take on a pet you've adopted."],
    ["4", "A little gift: three packets of in-season seeds, with a note."],
    [String(TRIP_HEARTS), "Friends for life, with a letter to say so. They can come on day trips and boat trips with you, and join the Sunday long lunch and Christmas Day lunch on the terrace. Their last story chapter."]
  ].map(([a, b]) => [`<b>${esc(a)}</b>`, esc(b)]))
  + `<p>Story chapters in between are spread evenly across the hearts. At most two villagers tell you a chapter each day, and only on a day you've finished at least one of your own tasks. A villager with a chapter ready shows a little "…" over their head: tap them to hear it. The Stories tab keeps everything you've heard.</p>`
  + h2("friends-panel", "Who's where, and the friends panel", "chat")
  + `<p>The friends panel has five tabs: <b>Who's where</b> (everyone's day at a glance, with the villagers you know best first and their hearts beside their names), <b>Neighbours</b> (everyone's hearts, and any request they have up), your pet, <b>Stories</b>, and <b>Gifts</b> (who you've given things to). Each villager's own page here shows where to find them: see <a href="/villagers">Villagers</a>.</p>`
  + h2("gatherings", "Gatherings", "calendar")
  + `<p>Your closest friends (${TRIP_HEARTS} hearts) take turns to book places at the Sunday long lunch on the terrace, two each Sunday, and all of them come to Christmas Day lunch there. Other gatherings, like trivia night, sip and paint, the wine club and disco night, are on the <a href="/calendar">Calendar</a>.</p>`
  + h2("giving", "Giving presents", "bag")
  + `<ul class="plain"><li><b>In person</b>: stand near a villager, open your backpack, choose "Give" and tap a present, a bunch of flowers or something you've grown or made. Anyone at all can be given something in person.</li>
    <li><b>Sent round</b>: tap a gift in your backpack to choose who it suits. Friends at ${FRIEND_HEARTS} hearts or more who aren't nearby get it sent round.</li>
    <li>Treats and keepsakes are in the market's Gifts tab, and bouquets come from the <a href="/flower-farm">flower farm</a>.</li>
    <li>Ice cream would melt on the way: give it in person, unless the Scoop Shack has its delivery bike.</li></ul>`
  + h3("thank-you-notes", "Thank-you notes")
  + `<p>A present that's sent round brings a thank-you note to your letters about ten minutes later, in the villager's own words. A present they love often has its own special thank-you.</p>`
  + h2("wrapping", "Wrapping", "hamper_small")
  + `<p>You can wrap any gift from your backpack: in shop-bought wrapping paper (kraft, gold, red or green, a sheet at a time, from the gift shop's wrapping table) or in your own handmade paper from the <a href="/paperie">paperie</a>, which is worth more. Then, if you like, stamp it, tie a ribbon and add a tag. The parcel's picture builds up with every choice.</p>
  <ul class="plain"><li>A wrapped gift counts as whatever is inside it, so a wrapped love is still a love.</li>
    <li>The rubber stamps come as a set: ${list(Object.values(WRAP_STAMPS).map(s => esc(s.toLowerCase())))}.</li>
    <li>A tag cut from a seeded sheet gets planted, and it grows.</li>
    <li>Wrapped gifts can also go out for sale on the gift shop's table, for a few coins more than unwrapped.</li></ul>`
  + h2("hampers", "Hampers", "hamper_big")
  + `<p>Penny's hamper table at the post office comes out three times a year: for Valentine's (1 to 14 February), Mother's Day (1 May to the second Sunday in May) and the Christmas season (20 November to Christmas Eve). Fill a wicker basket (small: three things, big: six) with things you've made, plus a bottle off your wine shelves, and tie it up. Each hamper is named after what's inside.</p>
  <p>Penny posts a hamper to a friend in the village (anyone at ${FRIEND_HEARTS} hearts or more, one each), to one of the regulars, or to friends you've met on your travels. Friends in the village write back quickly; friends far away the next day, with a postcard and a little something from where they live. From 1 December there are also hamper orders pinned up by the table. See the <a href="/calendar#christmas">Christmas season</a>.</p>`
  + h2("address-book", "Posting gifts and letters", "letter")
  + `<p>People you meet on your travels can go in your address book, under your letters (not the day-trippers). From the gift chooser, choose "By post" to send them a gift; a letter costs nothing. Letters start with a ready-made opening (${list(OPENINGS.map(o => `"${esc(o)}"`))}) and you can add your own words.</p>
  <p>A reply comes back in one to three days, in that person's own voice, now and then with a little something from where they live. After your third post, a friend whose own goods would suit a shop shelf may offer to send a few each week for the gift shop.</p>`
  + table(["Where they live", "Postage"], [...new Set(Object.values(POSTAGE))].sort((a, b) => a - b).map(p => [esc(list(Object.keys(POSTAGE).filter(k => POSTAGE[k] === p).map(k => REGIONS[k]))), coin(p)]));
  const search = [["how-hearts-work", "How hearts work", "Requests, loves and half hearts"], ["what-hearts-unlock", "What hearts unlock", "Letters, gifts, trips and stories"], ["friends-panel", "Who's where today", "The friends panel"],
    ["gatherings", "Gatherings", "Sunday lunch and Christmas lunch with close friends"], ["giving", "Giving presents", "One gift per villager a day"], ["thank-you-notes", "Thank-you notes", "Letters after a present"],
    ["wrapping", "Gift wrapping", "Paper, stamps, ribbon and tags"], ["hampers", "Hampers", "Penny's hamper table"], ["address-book", "Address book", "Posting gifts and letters to travel friends"]]
    .map(([a, t, d]) => ({t, d, a: "/hearts-and-gifts#" + a}));
  return {slug: "hearts-and-gifts", title: "Hearts and gifts", section: "start", blurb: `How hearts work, what they unlock, and giving presents to ${VILLAGERS.length} villagers`, html, search};
}

export const pages = async () => [await gettingStarted(), questBoard(), heartsAndGifts()];
