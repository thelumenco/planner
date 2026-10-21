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
  5 coins (3 until round 226; Mel: "increase the coins per task to 5") (and grows the garden a little, like a finished quest always did); only the first 10 ticks a day pay. Undo
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

Round 227 (Mel: "these are things that the player needs to fill in themselves"): five of the room tools are back, made
for any player and saved in the game state `F` (so in the browser and the cloud save slot like everything else; no
private docs, no Claude):
- Kind words (the courtyard corkboard, game/kudos.js, `F.kudos`): pin up kind things people have said, read one at
  random, take one down with Undo. Never a quest spot.
- Affirmations (the courtyard, game/affirm.js, `F.affirm`): five a day from a list of 30 general ones, plus your own
  (they take turns in the daily five); a heart keeps a favourite.
- Savings vaults (the bank, game/bank.js, `F.vaults`): your real-life savings, not coins, in five jewel jars. A label,
  a goal, markers, a colour, a currency picked once (£, $, €, ¥, S$, A$, ₹ or none); add, take out, empty or remove
  (with Undo), a little history; Opal's counter shows the passbook with the total.
- Emotion jars (the shelf in your room, game/jars.js, `F.jars`): up to 10 blobs from up to 4 feelings (your own
  feelings too), a note, ten jars on the shelf.
- Letters (the writing desk's journal, game/letters.js, `F.letters`): Dear future me (sealed until the day you pick,
  then in the letterbox at home) and Dear Universe (a pen pal who always writes back 3 to 6 hours later, or with the
  morning post, from a bank of warm replies picked by what your letter is about). Any letter copies into the journal.

## Phase 3: no family (done)
Who's in the family's places (ids swapped in code, every line rewritten in the villager's own voice):
- Hana (the market) and Theo (town clerk, piano, double bass, sketching) live in the blue house on the foreshore
  (scene `hanatheo`). Hana leads the 8am class on the field.
- Farid (the orchard, a baker who bakes too much) and Mei (the flower farm, sings to the roses, fishes) share the
  orchard cottage. Farid keeps the orchard's stall, the 3pm tea and cake, the Christmas wreaths.
- Tomi (the olive press, games, paddleboarding) and Posy (the gift shop, reads psychology for fun), engaged, live in
  the lilac house next door (scene `tomiposy`).
- Bo (carpenter) sets up the garden tools and builds the extras, and does the evening farm tours.
These seven are your close friends: they come on day trips, get gifts (the market's Gifts tab), and come to the Friday
bonfire. (The Wednesday and Sunday village supper was a personal-edition thing and is gone; each house keeps its
own dining table, round or short, wood or glass, with its own chairs, and you can sit at it.) Their home routines are in data/npcs.js `AT_HOME`. Hearts still only
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

## Elena sells her cottages, and a little landlord business (Mel 2026-10-14, built in round 219)
Bluebell and Fig Tree, the two holiday lets on the cottage lane by the station, are Elena's. They stay holiday lets
(guests for the week, out on the porch mornings and evenings) until you reach five hearts with her. Then Elena writes
to say she'd rather sell them to a friend than a stranger off the train, and knocking on either door brings up her
offer: 3,000 for Bluebell (sleeps four, two bedrooms) and 2,000 for Fig Tree (sleeps two). Data in data/lets.js,
logic and panels in game/lets.js, the rooms in art/lets-art.js.

Then they're yours to furnish and let, a mini landlord business:
- Each cottage has fixed places for furniture (Fig Tree 11, Bluebell 13 with a second bed and linen), over two
  floors like the old mill (round 220, Mel: the one-room version looked messy): the sitting room and table
  downstairs, with stairs up the left wall; the bed or beds and the little touches upstairs. The hall table
  downstairs is where it's all run: the catalogue, the parcels to unpack, the spares and the guest book.
- The catalogue has eleven kinds of piece, each in three tiers (simple, good, fine) and five colours (sage,
  cornflower, rose, ochre, cream). Prices, simple/good/fine: bed 120/260/520, bed linen 30/70/140, armchair or
  sofa 90/200/420, table and chairs 100/220/450, shelves 60/140/300, lamp 25/60/130, rug 30/80/170, curtains
  25/60/130, picture 20/50/120, plant 15/35/80, little touches 15/40/90. Furnishing Fig Tree all fine costs 2,550.
- Nothing is instant: an order comes on the next day's train, as a parcel in the hall, to unpack into its place.
  Swapping a piece out puts the old one in the spare room, to put back or use in the other cottage.
- The game sets the rent: how complete (places filled) and how fine (average tier) make a score from 0 to 1, half
  each. Nightly rate = cap x (0.3 + 0.7 x score); caps are 70 for Bluebell and 50 for Fig Tree. Stars = 1 + 4 x
  score, rounded. A cottage won't let at all without a bed and bed linen; a bed and simple sheets alone lets for
  about 24 a night at two stars.
- Round 221 (Mel: bathroom, calendar, changeovers, housekeeper, garden): a bathroom through a door in the bedroom,
  with its own catalogue section (bath 150/320/650, basin and mirror 60/140/300, towels 20/50/110, bath mat 15/35/80,
  toiletries 15/40/90, and a plant). A cottage now needs a bed, linen and a bath before it can let.
- The calendar (a tab at the hall table): guests book 2 to 4 days ahead, never more than three weeks ahead, for one
  to five nights. Tap a free day to close it; "Pause new bookings" stops new ones altogether (booked stays still
  come). Between stays there are changeover days, 1, 2 or 3 (your choice; the day they leave counts as the first).
  The better the last review, the sooner the next booking after that (3 extra days after one or two stars, down to
  none after five).
- The welcome (another tab): on a changeover day, tidy up and make the beds, then fill the fruit basket (up to 3
  fruit) and the fridge (up to 4: your own wine, cheese, chocolate, bread, jam, honey, cider and so on), all from
  your backpack. Tidy with 2 or more in each: the guests add a star to their review and leave a tip of 4 a thing.
  Guests who arrive to an untidy cottage take two stars off. Either way they come, and pay when they leave.
- Hettie (a new villager on the lane, round 221) does changeovers if you hire her: 25 a time at Fig Tree, 35 at
  Bluebell, paid on the day guests leave. She tidies, and fills the basket and fridge from a pantry cupboard you
  keep stocked. Let her go any time. On her changeover mornings she's at the cottage from 10.
- The garden, out of the back door downstairs: things the builders bring the next day, each raising the most the
  cottage can charge a night: a proper garden 300 (+5), patio table 250 (+4), fairy lights 120 (+2), hammock 180
  (+3), fire pit 400 (+6), barbecue 350 (+5), bikes 500 (+6), hot tub 1,500 (+15). All of them: Bluebell up to 116
  a night, Fig Tree up to 96.
- Away for a while, the cottages run on (up to the last 60 days): guests come, stay and pay; with nobody tidying,
  the reviews suffer.
- Round 222 (Mel: "why is the bathtub so huge? Things should be proportionate to me, placed like an interior
  designer would"): everything in the cottages is drawn to the player's scale (the player is 64 units tall: a bath
  about as long as you are tall, a double bed a little narrower). Rooms are laid out in groups (sofa facing the fire
  on a rug, a kitchen corner with the fridge, beds centred under their windows with bedside tables). The bedrooms and
  bathrooms are smaller rooms (walkable y 176 to 430, LET_ROOM in core.js), with the front of the cottage drawn below
  them like an open doll's house.
- Switched on for everyone in round 223 (LIVE in game/lets.js).

## The opening story (2026-10-14)
A new game starts with a short story told through your own eyes (game/intro.js, pictures in art/intro.js): a tired
office worker in Singapore (late nights, dinner at the desk, the view of Marina Bay, the packed morning train) gets a
letter from Pembury & Vale, Solicitors, Honeybrook. Their great-uncle, Wilfred Song, has left them his house and
vineyard; his will turned up years late inside a cookery book. His note asks two things: look after the vineyard, and
look after his companion, who'll be waiting. Then the train to Honeybrook, the bare vineyard at golden hour, and the
setup card, whose last question ("Who's waiting on the porch?") is the pet. You're never shown (only, once, a faint
reflection in a window), since you haven't chosen how you look yet. Skippable; "Watch the story again" in Settings.
Eight villagers have a line about Wilf. Singapore is allowed in the story's two files only (leak-check.mjs ALLOW).
Dev builds skip it unless the page has ?intro=1; window.__mapleIntro(i) opens one screen.

## Planned: a Honeybrook wiki (after the public launch)
Like the Stardew Valley wiki: a companion site players can browse for the full villager stories (every chapter, by
heart level), each villager's favourite gifts, where to buy or grow things, schedules, events, day-trip towns and
their shops, recipes, and the little secrets. A cheat sheet for anyone who wants one; the game itself never needs
it. Right now nobody can know a villager's favourites without it. Reference so far: FAVOURITES.md (generated from
the game data). Before the wiki, the favourites themselves want balancing: the seven villagers who took the family's
places each have 80 to 140 favourite presents (everything bought on trips was made for them), while the other twenty
have a handful of crops at most and several have none at all. Plan: each villager gets a short hand-picked list of
loves (around six to ten), and every other present is a nice gift (half a heart).

## Task places (2026-10-15)
Your own tasks on the quest board each go to a place in the village (src/data/places.js): the post office (email,
reply, call...), its filing cabinet (forms, tax, booking...) and scales (pay, bill, bank...), the library desk (essay,
report, study...) and reading nook (read, chapter...), your kitchen, sofa, desk, the laundry corner and cleaning
cupboard in the garage, the treadmill, Bo's workbench (fix, build...) and the market (groceries, buy...). A specific
word beats a general one ("write an email" goes to the post office, "write my essay" to the library desk); between
equals the earlier word wins; no match means your desk. Each task shows its place in a little picker (the player's
choice sticks) and a "go" that walks you there. Ticking anywhere still works; doing it in its place pays a coin more
(within the day's ten paid ticks).

## Phase 5: the welcome screen and three save slots (done, 2026-10-15)
The game opens on a welcome screen (game/title.js, picture in art/title.js): Honeybrook at golden hour, "Continue with
<name>", three slot cards (name and pet, day, coins, closest friend's hearts, when last played; or "New game"), a
delete that asks first, and "Watch the story". Silent: the music starts in the village. Settings has "Back to the
title screen". Saves (game/slots.js): the game always plays from the fox.* keys; a slot not being played is kept
whole under hb.slot.N (sound and zoom stay per device); switching puts the playing slot away, takes the chosen one
out and reloads straight into it. A save from before slots is slot 1. Dev builds skip the welcome screen unless
?title=1. Phase 6 (Firebase) will keep each slot in the cloud.

## Phase 6: accounts and cloud saves with Firebase (built 2026-10-15; deploy steps in DEPLOY.md)
Everyone plays with an account: the welcome screen asks for Google or email-and-password sign-in (with "make an
account" and "forgot your password") before showing the slots. Each signed-in player's three slots live in Firestore
under players/{uid}/slot{N}/{fox, today, routines, journal} (game/cloud.js); firestore.rules lets a player read and
write only their own. The first sign-in uploads the game already in this browser; another account signing in on the
same browser only ever sees its own games. Backups are a plain file download. The dev builds use a local stand-in
(dev/claude-stub.js, window.__hbDevCloud). Hosting: honey-brook.web.app, deployed by GitHub Actions
(.github/workflows/honeybrook-deploy.yml) on every push to honeybrook-public, after the leak check passes. The leak
check is now clean.

## Islands by ferry: Saltwick Harbour (built 2026-10-16; plan in ISLANDS-PLAN.md)
- The foreshore jetty's ferry now goes to any town with a `ferry` entry (Jeju and Saltwick Harbour); the panel has a
  chip for each. The train window only lists train towns. Your own boat (the dolphin cruise goal) opens a panel too:
  a dolphin cruise, or a day trip to an island with a `boat` entry (Saltwick: 15 coins of fuel, up to 7 friends free,
  dry days only). A boat trip is stored as a ferry trip with `own: true`, so it lands and leaves where the ferry does.
- Saltwick: data in `src/data/saltwick.js` (merged into towns.js), people in `src/data/sw-people.js`, letters in
  `src/data/pen-sw.js`, panels and games in `src/game/saltwick.js`, art in `src/art/town-saltwick.js` and
  `src/art/saltwick-rooms.js`, music `saltwick` + one track per room in audio.js. Ids start `sw`.
- Things to do: fossil hunting on the scar (three stones a day; six ammonites, then a glass case), crabbing off the
  harbour wall (pull up just after the twitch; three crabs earns your own line), a proper pot of tea with Nell (five
  steps in order; a Saltwick mug), lighting the lighthouse lamp with Alfie at dusk (a page from his ledger).
- Friends' acts here: Tomi crabbing, Bo tapping fossils, Farid with a crab sandwich on the clifftop bench, Theo painting
  the lighthouse railings. Four Saltwick specials for the kitchen; sea salt and dulse for gelato and bonbons.
- Next islands, in order: Puffin Isle, Hokkaido, Bali.
- Any ferry town can say `ferry.dry: true`: no crossing on a rainy day (Puffin Isle's little boat). `soon: true` on a
  town hides it from the ferry and boat menus while it's being built.

## Islands by ferry: Puffin Isle (built 2026-10-16)
- Data in `src/data/puffin.js`, people in `src/data/pi-people.js`, letters in `src/data/pen-pi.js`, panels and games
  in `src/game/puffin.js`, art in `src/art/town-puffin.js` and `src/art/puffin-rooms.js`, music `puffin` + one track
  per room. Ids start `pi`. The lighthouse door leads up to the lamp room.
- Ferry 40 (dry days only, out 8 to 2, last boat 8pm); your own boat 20 of fuel. Puffins April to July, seal pups
  October and November.
- Things to do: the count in the bird hide (puffins, or seals/pups out of season; five right = a volunteer's badge),
  reading the weather in the lamp room (three right in a row = Morwenna's storm glass), sea glass in the cove (once a
  day) and a pendant at the post office's workbench, and the puffin stamps (one a month in season, five framed).
- Friends' acts: Hana watching the puffins, Mei feeding the goats, Posy with sea glass, Bo waving at the seals.

## Islands by ferry: Hokkaido (built 2026-10-16)
- Data in `src/data/hokkaido.js`, people in `src/data/hk-people.js`, letters in `src/data/pen-hk.js`, panels and games
  in `src/game/hokkaido.js`, art in `src/art/town-hokkaido.js` and `src/art/hokkaido-rooms.js`, music `hokkaido` + one
  track per room. Ids start `hk`. Ferry only (90, out 7 to 1, home by 10); too far for your own boat.
- Screens (Mel's picks): Otaru (ferry, canal, glassworks, music box hall, market, steam clock), Sapporo (clock tower,
  beer factory, ramen shop, the long park and its February snow sculptures, beer garden), Niseko (Mount Yotei, the
  slopes, the ski lodge, the foot bath, the river), Furano (the flower farm, the dairy, the melon stall, the lone tree).
  Six rooms: the glassworks, the music box hall, the beer factory, the ramen shop, the ski lodge, the Furano dairy.
- Things to do: blowing a glass float (one a day), a music box for each season (all four play together), the beer
  tour and tasting (match three beers), a ski lesson December to March (a first ski pass), carving at the snow festival
  in February, the foot bath. Friends: Hana in the foot bath, Bo with a soft-serve, Posy in the flowers, Theo's toast in
  the beer garden, Tomi skiing.

## Islands by ferry: Bali (built 2026-10-16)
- Data in `src/data/bali.js`, people in `src/data/bl-people.js`, letters in `src/data/pen-bl.js`, panels and games in
  `src/game/bali.js`, art in `src/art/town-bali.js` and `src/art/bali-rooms.js`, music `bali` + one track per room.
  Scene and place ids start `ba` (not `bl`: Bellbird Valley's lookout already has `bl_paddock` and `bl_valley`). Ferry
  only (110, out 7 to noon, home by 10).
- Screens: Seminyak (the jetty, beach, warung, sunset spot, jukung), Ubud (market, silversmith, the palace gate into
  the dance pavilion, the monkey forest), Tegallalang (the terraces, the subak, the jungle swing, the coffee and cacao
  house), Uluwatu (the cliff temple, the amphitheatre, the cliff path, the surf).
- Things to do: a canang sari with Ibu Sari (each colour to its compass point), a gamelan lesson (play back three
  patterns: a little gong), a silver ring with Wayan, Pak Gede's carved animal of the day (seven, then a shelf), the
  kecak fire dance at sunset, the jungle swing, the monkeys (who sometimes take your sunglasses). Friends: Hana on a
  beanbag, Farid planting rice, Tomi on the swing, Bo with a coconut, Posy's offering, Theo at the gamelan.

## The wiki (honeybrookwiki.web.app, round 224 on)
Built from the game's own data by `node wiki/build-wiki.mjs` (part of `npm run build:public`, so every deploy rebuilds
it, and the leak check covers it strictly). A new villager, item, recipe or destination appears on its own. The one
hand-written piece per destination is its "Things to do" list (ACTS in wiki/pages/70-trips.mjs): the test "The wiki
covers every destination" fails until a new place has one.

## The secret passage (round 229, the creator's brief)
Under the cellar door, a clue trail leads to the monks' wine cave, which comes out behind a hidden panel in the Scoop
Shack's gelato kitchen. Game rules and state in `src/game/passage.js` (`F.passage`, defaults for old saves), art in
`src/art/cave.js`, the scene in `src/data/world.js` (INNER.cave, parent "cellar"; ROOMS.cave), wiki page
`wiki/pages/76-passage.mjs` (/secret-passage).
- Backstory: the Scoop Shack was the brothers' little priory; they dug a cave and passage under the vineyard to the
  boats. Tomás (the mill's railwayman, "T.R. 1912" on the beam) found it in 1912, laid down a few bottles, bricked it up
  and hid the key under the millstone.
- The trail (only once the cellar door is built; at most one new clue a day; missed days wait): 1 the draught (walking
  into the cellar: the high table's candle bends, draught lines behind the racks, the pet noses at them), 2 the bricks
  (a later day: tap the racks once; old bricks on the cellar's left wall from then on), 3 the photograph (a later day:
  the back of the one at the mill; if the mill isn't owned, the windmill's door is on the latch for steps 3 and 4),
  4 the key (straight after: the millstone), 5 the door (tap the bricks; the key isn't a clue, so no wait). On a new day
  mid-trail the pet nudges you as you walk into the cellar. Brief adaptations: "the fox" is the player's pet ({pet});
  "Keep it" makes a keepsake to treasure or give a friend (no family here).
- The secret door: a panel in the cellar's stone colour on the west wall (the same perspective as the east door), a
  hairline of light and an iron ring, no label. The kitchen panel (only after first coming through the gate): shelves
  of jars and tubs on the kitchen's west wall, a hairline of light and a tea towel stirring, no label.
- The cave: brick barrel vault, limestone, flagstones, candles in niches, cobwebs, a hanging lantern, the arch carved
  VINUM LAETIFICAT COR over the rusty gate with a sea-blue glow, a carved cross over a niche with a candle stub. Spots:
  the gate ("To the Scoop Shack"), the ageing alcoves, the monks' press (tap lines), the forgotten bottles, the long
  table, an oak bench; its east door goes back to the cellar.
- Ageing (creator's change): up to 24 bottles; a wine gains 10% of its base bottle price a full week, up to 8 weeks
  (+80%), rounded (`AGE`). Base: its own price, else its style's plus riddling. Brought up, it returns to the cellar
  kept back from the staff, priced with the bonus (a separate "(cave-aged)" entry so it doesn't merge at the old price).
- Forgotten bottles: `ob_1923` red, `ob_1931` white, `ob_1958` sparkling, each with its own icon. Keepsakes (`to:
  "family"`, no sell price). Open it here: a tasting line and a toast to Tomás.
- Monday suppers, 7 to 9pm (`SUPPER`): four villagers sit beside the long table (`SUP_SEATS`, slot in npcs.js slotAt;
  the table's laid only then). Host once a night: 22 a guest, 88. The furniture audit's set-up opens the passage so the
  cave is checked too.
- Hazel's five chapters (data/stories.js, gate "passage"): her gran's holy ground, the priory and the boats, the
  fishermen's boathouse and the singing, Tomás in 1912, the beach café and her first knickerbocker glory.
- go() now handles rooms inside rooms (cave inside cellar inside wine shop) for walking there from anywhere.
- Test: "The secret passage (round 229)" in test/smoke.mjs.

## Round 231 (2026-10-21)
- One copy plays at a time (a BroadcastChannel plus a cloud "playing" doc, with a Play here card); on first load the
  cloud save wins unless it hasn't changed since the last sync (`fox.synced`).
- The larder: take-outs stay in the backpack; Pilar's fetch is off by default.
- Economy: START_COINS 200, requests pay 1.8x. A one-off thank-you special (100 coins and a bouquet), 19 Oct to 9 Nov 2026.
- Wine in ice cream and bonbons ("Take a bottle"), Saltwick rum, raisins from the loft, the Rum and Raisin special.
- Cherries all year (Otaru market punnet); raspberries at the mill; the cottage fruit basket takes any fruit.
- Windows glow 7pm to 11pm in Honeybrook. Each pet has its own sound. Boats home are easy to tap.
- The bin (game/bin.js): Throw something away from the backpack, with Undo; The bin keeps it 24 hours with Take back.
  Dig it up (orchard.js digUp) for in-season orchard and flower spots.
- Hairstyles (game/look.js STYLES, #hero in index.html, CSS .hs-*): long curls, bangs, pigtails, pixie cut, mohawk.
- Mika's (game/salon.js): Mr Okada's granddaughter cuts hair in his front room (station "salon", furn "salon"),
  10 to 5, Tuesday to Saturday; style 5, colour 10, both 15, Undo; her last chapter (reward "mikacut") makes the next
  visit free. A sandwich board on the lane (buildings.js ohayoHouse). Villagers are now 29.
- Wiki: a Home page (wiki/pages/23-home.mjs), the drying loft, seasons, the campervan mood board, Sunday lunch,
  shoppers, the salon and Mika's page.
- Tests: "Mika's: hair, by appointment (round 231)" and the other round 231 sections in test/smoke.mjs.
