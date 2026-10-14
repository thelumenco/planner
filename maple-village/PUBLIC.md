# Honeybrook: the public edition

This branch (`honeybrook-public`, its own worktree) is the public copy of Honeybrook. Mel's personal game lives on its own
branch and folder and is never changed from here. Today's personal game is bookmarked as the branch `personal-v191-snapshot`.

## Rules
- Nothing about Mel's family, her work, her connectors or where she lives may ship. `node leak-check.mjs` checks the built
  game and fails while anything is left; `npm run build:public` builds and checks. Only publish when it passes.
- Never merge this branch into Mel's, or hers into this one wholesale. New features are ported across by hand, on purpose.
- New destinations in Mel's game get family acts; their public versions get something different (a villager friend, the pet).

## Decisions (Mel, 2026-10-14)
- Two copies (this branch), real clock in the player's own timezone, villagers all kept (none are real people), name: Honeybrook.
- Quests: the player's own real-life tasks (typed in, no connectors) alongside Stardew-style village requests.
- Firebase (hosting, sign-in, cloud saves) in phase 6.
- Phase 2 (Mel, 2026-10-14): the four app houses become villagers' homes; up to 10 paid task ticks a day; keep the
  journal and the routines board, remove the other room and town hall tools; 3 coins a task.
- Phase 3 (Mel, 2026-10-14): villagers without homes take the family's places; hearts only come from requests; the
  child's room becomes a guest room for friends to stay, with written schedules.
- Phase 4 (Mel, 2026-10-14): pet species fixed per game; the look covers body (woman, man, neither), skin, hair and
  clothes; pet names are suggested but changeable; the Singapore snacks stay.

## Phases
1. Set up: this branch and worktree, the bookmark, the leak check. (done)
2. Strip out connectors and productivity code; build the quest board (your own tasks + village requests). (done)
3. Remove the family; rewrite the scenes and dialogue that depended on them. (done)
4. Character creation (name, pronouns, look) and five pets: fox, rabbit, tortoise, quokka, capybara. (done)
5. Welcome screen and three save slots, on the device.
6. Firebase: sign-in (Google, email link, guest), cloud saves, hosting, security rules.
7. Polish: first-day tutorial, settings, credits, balance, beta testers.

## Leak check at the start (phase 1)
2069 references: family names (Darren 74, Evan 217, Maple 60, Mum 84, Dad 103, Marcus 53, Angelina 250, Ma Ma 285,
Gong Gong 305, Jason 29, Luca 13, Mel 153, Zeh 56), connectors and work (Sunsama 117, Gmail 22, Notion 25, Zapier 7,
Google Calendar 7, Chord 49, Fresh Pages 13, Chico 26, Luna 17, Ohayo 19, mcp 17, window.claude 14, email addresses 3),
and Singapore (51).

## Phase 2: the quest board (done)
What went: every connector and the code behind it (the Sunsama pull and tick-back, tomorrow's tasks, the calendar panel,
reminders, the post box, the home desk inbox, the client table, revenue chart, planning table, weekly review, the
fountain's visualisation, the wardrobe stylist), everything Claude wrote from the page (the fox chat, book digests, Dear
Universe replies, affirmations), the messengers for Mel's routines, the user-count gardens and health signs, the
coaching flow (five-minute clean, first steps, time boxes, procrastinating, breaks, decompress), and the room tools Mel
let go (emotion jars, kind words, scratchpad, savings vaults, Hestia chores and pantry). The weekend paper, the 6pm
lanterns at the pond, letters from villagers and the address book stay: they're all made in the game.

The clock: day and time of day now follow the player's own timezone (util.js `LOC()`), and the day turns over at midnight.

The quest board (game/quests.js, state in `F.board`):
- Your tasks: typed in, one-off or daily. Tick on the board or straight from the quest note on the map. A tick pays
  3 coins (and grows the garden a little, like a finished quest always did); only the first 10 ticks a day pay. Undo
  gives the coins back. Daily tasks come back fresh at midnight; one-offs stay until ticked, then go the next day.
- Village requests: up to three at once from Honeybrook villagers (quests.js `ASKERS`), two on the very first day and
  one most days after. They only ask for in-season garden crops or things you've had in your backpack that you make
  yourself (not anything Hana sells over the counter). Pay per item: about 1.4 times the market's sell price, never more
  than a shop's own price for it. "Find" on the board walks you to the villager; tap them to hand it over. A missed
  deadline quietly takes the note down.
- Hearts: one per request handed over, five each, never lost. Two hearts: a thank-you letter. Four: a gift of three
  seed packets. Five: friends for life. Finishing someone's request makes their next story chapter ready that day.
  The friendship panel has a Neighbours tab with everyone's hearts. New trophies: village requests (5 to 100) and best
  friends (villagers with five hearts).

The fridge (Mel, 2026-10-14): a Shopping list tab beside Stored (game/shopping.js, `F.shopList`). A new game starts
with six made-up sample items; add, tick into the basket, clear, and Copy list (what's still to buy, as text; where the
browser blocks copying, the text shows selected instead). No coins.

Makers' Lane: the app houses are homes now (ids kept: chord, chico, luna, ohayo). Bo's workshop (he lives upstairs),
Auntie Lin's cottage, Juniper's house (the little observatory) and Mr Okada's house. Each is home in the evening (and
Mr Okada early in the morning too): data/npcs.js `HOMES`. The Fresh Pages library is just the library.

Tests: `node test/smoke.mjs` has new sections for the quest board rules and a request handed over in the game; the
sections for removed features are gone. Each section now records a failure and carries on instead of stopping the run.

## Phase 3: no family (done)
Who's in the family's places (ids swapped in code, every line rewritten in the villager's own voice):
- Hana (the market) and Theo (town clerk, piano, double bass, sketching) live in the blue house on the foreshore
  (scene `hanatheo`). Hana leads the 8am class on the field.
- Farid (the orchard, a baker who bakes too much) and Mei (the flower farm, sings to the roses, fishes) share the
  orchard cottage. Farid keeps the orchard's stall, the 3pm tea and cake, the Christmas wreaths.
- Tomi (the olive press, games, paddleboarding) and Posy (the gift shop, reads psychology for fun), engaged, live in
  the lilac house next door (scene `tomiposy`).
- Bo (carpenter) sets up the garden tools and builds the extras, and does the evening farm tours.
These seven are your close friends: they come on day trips, get gifts (the market's Gifts tab), come to the Wednesday
and Sunday village supper and the Friday bonfire. Their home routines are in data/npcs.js `AT_HOME`. Hearts still only
come from village requests.

The child's room is gone. Nippers is Coach Dimi's grown-ups' surf club morning; Santa's grotto, the field fair's kite
and face paint, and the sunflower maze certificate are the player's own. The toys in the shop are things for your home
or your pet. Jason and Luca are now Ornella (a retired ferry captain who writes a verse every morning) and Dario (the
boat mechanic who collects English idioms), pen pals you meet in Vernazza. The player is "you" everywhere; letters
open "Dear friend" until character creation names you (game/me.js). National Day and the Merlion are gone; the rainy
months are just the rainy months.

The guest room (game/guests.js, data/guests.js, `F.guest`): the guest book on the desk invites anyone in your address
book. They come on the 10:30 train the next morning and stay three days: an arrival day, one whole day (outdoors or
gentle, depending on who it is) and a last breakfast before the 11 o'clock train. Each slot of each day is written in
the guest book ("Today's plan"), they appear in Who's where, sleep in the guest room, say things about where they are
and where they're from, and a thank-you letter arrives the morning after. One guest at a time; no coins, no hearts.

The public build (`node build.mjs`) now strips source comments from the JS, CSS and HTML. Leak check after phase 3:
only "Maple" (36, the fox's name, phase 4) and window.claude (1, the save hookup, phase 6) are left.

## Phase 4: you and your pet (done)
A new game opens on the setup card (game/setup.js): your name and pronouns (she/her, he/him, they/them or your own),
then how you look with a live preview (body: woman, man or neither; eight skin tones; ponytail, long, bob, short, bun
or curly hair in ten colours; ten top colours; shorts, trousers or a skirt in eight colours), then your pet. State:
`F.me = {name, pron: {they, them, their}, look}`, `F.pet` (the species) and `F.name` (its name). Narration says "you";
the pronouns are there for anyone talking about you. Change your look from the wardrobe or the settings, and your
name and your pet's name in the settings; the species stays for the game.

Pets (art/pets.js, art/pets-art.js): fox, rabbit, tortoise, quokka and capybara, each drawn for the backpack portrait,
the nap, the little follower (standing and curled) and the head in the bike basket and the car, in the same frames so
the accessories and animations fit all five. Suggested names (Ember, Clover, Pebble, Sunny, Mochi and friends), never
the personal edition's. A tortoise ambles behind you, a rabbit bounds; a capybara (and a tortoise) naps longer. Lines
can say {pet} and {kind}; speak(), flash() and the villagers' bubbles fill them in. Dev builds skip the setup card
unless the page has ?setup=1. The leak check now finds nothing but window.claude (the save hookup, phase 6).

## After phase 4: tailoring, gifts and stories (Mel, 2026-10-14)
- Makers' Lane: Ada's haberdashery (what was Lin's cottage) and Idris the tailor's (what was Juniper's observatory, now
  a thimble roof and a big button sign). Auntie Lin and Juniper share a new green cottage on the foreshore by the
  flower-farm gate (scene linjun), and Lin has a story now: how a gardener and a librarian became the best of friends.
  Bluebell and Fig Tree stay holiday lets with their guests (to be bought later). Both shops open 9:30 to 5:30,
  every day but Sunday. Tops run up to the chin again (no neck showing); V, square and collar necklines show skin.
- Ada sells fabric by the piece (cotton 6, linen 8, denim 9, wool 12, silk 18; gingham, stripe and polka dot +2,
  floral +3; twelve colours) and buttons by the card (wood, shell, brass, pearl, 3 to 8), and buys unused fabric back
  at half price. Idris makes a T-shirt, blouse, shirt, jumper, shorts, trousers, skirt or dress (2 to 4 pieces of one
  fabric; a long one takes a piece more): sleeves, neckline, length, buttons and pockets, with a live preview on you.
  His fee (14 to 32, plus 3 for puff sleeves or a collar, 2 for pockets, 4 for a long hem) is paid when you finalise;
  it's ready the next morning from 9; collect it and it's in your wardrobe (data/sewing.js, game/tailor.js, F.sew).
- One clothes generator (art/clothes.js) draws everything you wear, everyday look included, so the preview, the
  setup card and the map always match.
- Gifts: any villager, one present a day each (in person, or sent round). A favourite (something they'd ask for, or a
  present that suits them) is a heart; anything else half a heart. Hearts open up stories: the first chapter once
  you've met, the last at five hearts. Every chapter re-introduces what it's about, and the Stories tab keeps the
  whole story per villager. Ada and Idris have stories of their own (Ada's button jar, Idris's grandfather's suit).

## Planned: Elena sells her cottages, and a little landlord business (Mel, 2026-10-14)
Bluebell and Fig Tree, the two holiday lets on the cottage lane by the station, are Elena's. They stay holiday lets
(guests for the week, out on the porch mornings and evenings) until you reach five hearts with her. Then Elena decides
to sell them to you: she'd rather sell to a friend than a stranger off the train (about 3,000 for Bluebell and 2,000
for Fig Tree, from the personal edition's plan).

Then they're yours to furnish and let, a mini landlord business:
- A furniture catalogue with a wide range: beds and bed linen (covers, quilts, pillows), dining tables and chairs,
  armchairs and sofas, bookshelves and shelves, lamps, potted plants, rugs, curtains, pictures and little accessories
  for each room. Pieces come in quality tiers, from simple to very fine, priced to match.
- Nothing is instant: you order from the catalogue and it arrives on the train the next day, to unpack and place.
- The game sets the rent, not the player: each cottage's nightly rate comes from how nice its furniture is and how
  complete the set is (a bed, somewhere to sit, a table, light, something on the walls, and so on), up to a cap for
  the cottage. Nicer and more complete means better guests and a higher rate; a half-furnished cottage still lets,
  just for less. The cap keeps money from getting too easy.
- It works like a little Airbnb. Guests book short stays (a night to a week), arrive on the train with their
  suitcases, stay in the cottage and wander the village like the holiday guests do now, then leave a star rating
  and a short review in a guest book. The rating comes from the same things as the rate (how nice, how complete),
  plus whether the place is clean and ready between guests (a quick tidy-up after each stay). Good reviews bring
  bookings more often; the nightly rate itself stays the game's to set, up to the cottage's cap.
- Still to design: the tiers and prices, the completeness checklist, how often bookings come, and how payment
  works (paid when a stay ends, into your coins, with the review).
Nothing is built yet; hearts with Elena already count from requests and gifts.
