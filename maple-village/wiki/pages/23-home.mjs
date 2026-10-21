// Round 231 (the creator: "what else did the wiki miss?"): home and your own corner. The guest room and guest stays,
// storage at home, the surprise bouquets, and the quiet things that are just for you: letters, the journal, routines,
// the shopping list, emotion jars, kind words, affirmations, the savings vaults, and the wardrobe's accessories.
// Numbers from src/game/guests.js, storage.js, creator.js, letters.js, jars.js, affirm.js, bank.js, wardrobe.js.
import { DECOR, ITEMS } from "../../src/data/items.js";
import { STAY } from "../../src/game/guests.js";
import { GIFT } from "../../src/game/creator.js";
import { MAX_BLOBS, MAX_KINDS, SLOTS as JAR_SLOTS } from "../../src/game/jars.js";
import { PER_DAY, AFFIRMATIONS } from "../../src/game/affirm.js";
import { SLOTS as VAULTS } from "../../src/game/bank.js";
import { ACCESSORIES } from "../../src/game/wardrobe.js";
import { esc, table, ico, coin, lede } from "../lib.mjs";

const days = ([a, b]) => `${a} to ${b} days`;

function html(){
  const acc = ACCESSORIES.map(([id, , n, where]) => [`<b>${esc(n)}</b>`, DECOR[id] && DECOR[id].price ? coin(DECOR[id].price) : "", where ? `Shows ${esc(where)} only` : "Shows everywhere"]);
  return lede("Home is where the quiet things live: a room for friends from your trips, cupboards that keep things for later, a writing desk, and a few corners that are just for you. None of the things in Your own corner earn coins; they're there for you.")
  + `<h2 id="guests">${ico("train", 22)} Friends to stay</h2>
    <p>Anyone in your address book (people you've met on day trips) can come and stay for ${STAY} days. Invite them from the guest book on the desk in the guest room.</p>
    <ul class="plain"><li>They arrive on the 10:30 train the next morning, and sleep in the guest room.</li>
      <li>Each day they follow a plan of their own about the village: the guest book shows today's.</li>
      <li>On their last morning they catch the 11 o'clock train home, and a thank-you letter follows them.</li>
      <li>One guest at a time. After a stay, the sheets go in the wash: you can invite someone again from the day after they leave.</li>
      <li>No coins and no hearts: it's just nice to have someone to stay.</li></ul>
  <h2 id="storage">${ico("box", 22)} Keeping things at home</h2>
    <p>Two places at home keep things for as long as you like, and nothing in them ever goes off:</p>
    ${table(["Where", "What it keeps"], [["<b>The fridge</b>, its Stored side", "Food, ingredients and flowers"], ["<b>The storage shelf</b> in the garage", "Everything else: soaps and oils from the mill, gifts, keepsakes, seeds..."]])}
    <p>Put things in from your backpack and take them back out to it. Once the Scoop Shack has its delivery bike, Tomo can take things from either one straight to a shop that uses them, there and then; anything the shop won't take comes home again. (The fridge's other side is your shopping list: see below.)</p>
  <h2 id="bouquets">${ico("bouquet", 22)} Surprise bouquets</h2>
    <p>Every now and then the postie brings a note from Honeybrook's creator, with a bouquet and ${coin(GIFT.coins)} tucked in. The first comes ${days(GIFT.first)} into your game, then one every ${days(GIFT.gap)}, in the daytime. Open the note to take the bouquet and the coins. Each note has its own bouquet, in its own colours.</p>
    <p>The bouquet's yours: put it in the vase on your bedroom table, give it to a villager (it counts as a gift), or sell it at Hana's. Now and then there's a special one too, for a thank you or a festival.</p>
  <h2 id="your-corner">${ico("heart", 22)} Your own corner</h2>
    <p>Quiet tools for your real life, tucked into the village. Nothing here costs or earns coins, and nothing is ever a quest.</p>
    ${table(["What", "Where", "What it does"], [
      ["<b>Letters</b>", "The writing desk in your room", "<b>Dear future me</b>: write a letter, pick a day (tomorrow at the earliest), and it's sealed till then; it arrives in your letterbox on the day. <b>Dear Universe</b>: a pen pal you never see, who always writes back warmly, 3 to 6 hours later (a reply that would land in the night waits for the morning post). Any letter can be copied into your journal."],
      ["<b>The journal</b>", "The top drawer of the writing desk", "Write as much or as little as you like, a page a day. It's kept with your game, and goes with you to any device you sign in on. Journal pages count towards a trophy."],
      ["<b>My routines</b>", "The noticeboard on the wall of your room", "Two kinds. A <b>checklist</b> (a morning routine, say) is fresh to tick every morning. A <b>weekly</b> routine has one step for each day of the week, with today's at the top (there's a self-care week to start you off). Ticks keep in step across devices."],
      ["<b>The shopping list</b>", "The fridge door at home", "A plain real-life list: add things, tick them off as they go in the basket, clear the ticked ones, or copy the list to take with you."],
      ["<b>Emotion jars</b>", "The shelf in your room", `Fill a jar with up to ${MAX_BLOBS} soft blobs from up to ${MAX_KINDS} feelings, add a note if you like, and keep it on the shelf (${JAR_SLOTS} jars, two rows) to look back on. Add feelings of your own, each in its own colour. A jar can come off the shelf again, with Undo.`],
      ["<b>Kind words</b>", "The corkboard on the courtyard wall by the town hall", "Pin up the nice things people have said to you, and who said them, to reread whenever you need a lift."],
      ["<b>Affirmations</b>", "The board beside it on the courtyard wall", `${PER_DAY} affirmations a day, from a list of ${AFFIRMATIONS.length} and any you write yourself (yours join the rotation). Tap the heart to keep one: Ones you kept stay on the board till you let them go.`],
      ["<b>Savings vaults</b>", "The bank on the town square", `Your own real-life savings (not game coins), as ${VAULTS} tall glass vault jars that fill with jewels. Give each a label, a goal, a marker every so often and a jewel colour. Add savings or take some out; empty a jar or remove a vault (both with Undo). Pick your currency once in the passbook: every vault shares it.`]])}
  <h2 id="treehouse">${ico("treehouse", 22)} The treehouse</h2>
    <p>A keepsake from the Gifts tab at Hana's market (${coin(ITEMS.treehouse.price)}). It goes up in the swing tree in your garden, with a ladder down the trunk. Tap it to climb up:</p>
    <ul class="plain"><li><b>The window seat:</b> sit at the big round window and look out. The view follows the time of day and the weather: morning mist, the sun going down behind the vineyard, rain on the leaves, the moon and stars at night.</li>
      <li><b>The letters shelf:</b> your letters, to reread (Dear future me, Dear Universe and the rest).</li>
      <li><b>The daydream jar:</b> write down something you'd like to do one day, big or small, and pop it in. Take one out at random when you need a nudge. When you've done one, it moves to the Done side with the date (with Undo). You can let one go, too. Nothing here costs or earns coins.</li>
      <li><b>The floor cushions:</b> for doing nothing at all. Your pet comes up too.</li></ul>
  <h2 id="wardrobe">${ico("tee", 22)} Accessories for the wardrobe</h2>
    <p>Hana's market has a Me &amp; my room tab with a few things to wear. Buy one once, then put it on or take it off at the wardrobe at home (which also keeps the clothes Idris makes for you at the tailor's).</p>
    ${table(["Accessory", "Price", "When it shows"], acc)}`;
}
export const pages = () => [{slug: "home", title: "Home and your own corner", section: "village", blurb: "Friends to stay, keeping things at home, the treehouse, surprise bouquets, letters, the journal, routines, jars, kind words, affirmations and savings", html: html(),
  search: [{t: "Guest stays", d: `Friends from your trips stay ${STAY} days`, a: "/home#guests"}, {t: "Storage at home", d: "The fridge's Stored side and the garage shelf", a: "/home#storage"},
    {t: "Surprise bouquets", d: `A note, a bouquet and ${GIFT.coins} coins every ${days(GIFT.gap)}`, a: "/home#bouquets"}, {t: "Letters", d: "Dear future me and Dear Universe", a: "/home#your-corner"},
    {t: "Journal", d: "In the writing desk", a: "/home#your-corner"}, {t: "My routines", d: "Checklists and weekly routines", a: "/home#your-corner"}, {t: "Shopping list", d: "On the fridge door", a: "/home#your-corner"},
    {t: "Emotion jars", d: "On the shelf in your room", a: "/home#your-corner"}, {t: "Kind words", d: "The courtyard corkboard", a: "/home#your-corner"}, {t: "Affirmations", d: `${PER_DAY} a day`, a: "/home#your-corner"},
    {t: "Savings vaults", d: "At the bank, for your real-life savings", a: "/home#your-corner"}, {t: "Accessories", d: "Bow, scarf, sun hat, pyjamas", a: "/home#wardrobe"}, {t: "Treehouse", d: "A reading nook up in the swing tree", a: "/home#treehouse"}, {t: "Daydream jar", d: "In the treehouse: things you'd like to do one day", a: "/home#treehouse"}]}];
