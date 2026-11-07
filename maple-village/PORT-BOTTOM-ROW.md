# Port to the public edition: the bottom row of the map (4 by 4 grid), and what came after it

Paste everything below the line into the chat that works on the public edition (branch `honeybrook-public`).

---

Please port a feature from the personal edition of Honeybrook into this public edition. The source is the personal edition's branch `ccr-896057b5-con92k` in the same repository (`thelumenco/planner`, folder `maple-village`). Fetch it with `git fetch origin ccr-896057b5-con92k` and read the changes from these commits:

- `09007fb` "The lower vineyard: a new screen down the hill with four more trellis rows"
- `22452d3` "The bottom row: Honeybrook Green, the Stables, Lighthouse Point and the coast strip, with villagers visiting"
- `cc9f65f` "The sea runs along the whole bottom row; the home river shows in the vineyard" (and the commit after it that tidies the paddock and labels)
- `4e3b065` "Bike hire on the green and at Lighthouse Point; a paddleboard jetty at the lighthouse"
- `32f0f9c` and `1cdf5d8`: the vineyard's river fork, redrawn with natural curves
- `a825813` "Lighthouse Point: the lamp and beam glow at night; the chip hatch window lights up"
- `2f9c879` "A pony of your own, Bram the lighthouse keeper with his tales, and mackerel fishing off the rocks"
- `26caa07` "The Sunday car boot sale on the green and the Monday lamp lighting at Lighthouse Point" (and `56d52c9`, the fish journal test count)
- `363eb23` "The bottom row in the stories: the priory vine and Priory Red, the flask and the sea cave, Pebble and Juniper's poem, story finds at the car boot"
- `009c495` "Bottom row fixes: jetty on the west beach, peas for the ducks, Dot's menu and buying fish, lighthouse and press moved; the allotments screen"
- `20f040f` and `9ebe70d`: the lower vineyard's river mouth, and beachcombing (clams and mussels are the kitchen's existing items)
- `f5972c9`: the river mouth shades into the sea (only the `lowervine.js` part; the ice cream change in that commit is personal-edition only, leave it out)

Use `git show <commit>` to see each diff. HANDOFF.md rounds 261 to 297 on that branch describe the design. Don't merge or cherry-pick blindly: this edition has drifted, so apply the changes by hand where files differ, and keep this edition's own conventions.

## What it is

The outdoor screens form a 4 by 4 grid. The top three rows already exist:

| | West | | | East |
|---|---|---|---|---|
| Row 1 | bay | hfarm | hlane | hwoods |
| Row 2 | shore | field | village | lane |
| Row 3 | flowers | orchard | base | vineyard |
| Row 4 (new) | lighthouse | stables | green | lowervine |

If this edition is missing any of those top-row screens, tell me before you start rather than guessing.

### 1. The lower vineyard (`lowervine`), south of the vineyard
- **Art:** new file `src/art/lowervine.js`.
- **Rows:** four more trellis rows. `F.vine.rows` grows to 7 (`ROWS = 7` in `game/vineyard.js`, and old saves are padded). Rows 0 to 2 stay on the vineyard; rows 3 to 6 are down the hill.
- **`art/vineyard.js`:** add `LOW_ROWS`, `UPPER`, `rowY`, `vineScene` and an exported `rowArt`, plus the path down past the seesaw (`lowerGate`, place `toLowerV`).
- **Trellis:** the stall's trellis fills the first bare row, so the 4th one bought goes down the hill.
- **Other places:** the old stone press (`vpress`), the valley bench (`vbench`), and a footbridge west over the stream to the green (`toGreenV`).

### 2. Honeybrook Green (`green`), south of home
- **Art:** new file `src/art/green.js`.
- **Places:** duck pond, bandstand, cricket lawn, allotments.
- **Gates:** up to home (`toGreenB` on base, bottom left of the firepit), east to the lower vineyard, west to the Stables.

### 3. The Stables (`stables`), south of the orchard
- **Art:** new file `src/art/stables.js`.
- **Places:** stable block, tack room, paddock with two ponies, sand ring for pony rides.
- **Gates:** up to the orchard (`toStablesO` on orchard), east to the green, west to Lighthouse Point.

### 4. Lighthouse Point (`lighthouse`), south of the flower farm
- **Art:** new file `src/art/lighthouse.js`, with `lighthouseArt(night)` lighting the lamp from 7pm to 6am.
- **Places:** the lighthouse, rock pools, beach huts, and a fish and chip hatch.
- **Gates:** up the coast path to the flower farm (`toLightF` on flowers), east to the Stables.

### 5. The coast strip on the flower farm
In `art/orchard.js`, `flowerFarmArt` gets a strip of sand and sea down its west edge, so the coast runs unbroken from the foreshore to Lighthouse Point. The farm's bench moves to the east side. Update `paths.js` to match.

### 5b. The sea along the bottom, the river and the transport
- **The sea along the bottom (`art/southshore.js`):** the strip of sand and sea from the bottom of Lighthouse Point carries on along the bottom of the Stables, the green and the lower vineyard. The lower vineyard's valley becomes sea, and its bench becomes the sea bench. The Stables' paddock moves up 26.
- **The home river in the vineyard:** the river from home shows at the vineyard's top left.
- **Bike hire:** racks on the green and at Lighthouse Point (`transportArt`).
- **Paddleboards:** a jetty at Lighthouse Point (`lsup`) for paddling to the foreshore or home, and the foreshore's jetty panel can paddle to Lighthouse Point.

### 6. Things to do: `src/game/south.js`
- **Ducks:** feed them for 1 coin, once a day, not at night.
- **Bandstand:** the brass band plays on Sundays, 2 to 4.
- **Cricket:** a match on Saturdays, 2 to 5.
- **Allotments:** a swap crate gives one free vegetable a day.
- **Ponies:** Biscuit loves apples and Pebble loves carrots. A treat and a brush each per day build trust. This uses the paddock panel, with `data-pony` buttons and `woodsView = "paddock"`.
- **Pony ride:** once Pebble's trust reaches 3, the child character can ride round the ring. It costs 15 coins, once a day, and the child must be with the player.
- **Lighthouse:** climb it.
- **Rock pools:** only at low tide (6 to 11am and 5 to 8pm).
- **Fish and chips:** 9 coins.

None of it should make money; the coins only go out.

### 7. Villagers on the new screens: `southSlot` in `game/south.js`
It goes into `slotAt` in `game/npcs.js`, just before `routineAt`:
- six villagers at the Sunday band
- six at Saturday cricket
- an allotment holder on Tuesday and Thursday mornings, and another on Saturdays
- a stable hand on weekday mornings
- the two vineyard workers on the lower vines in the afternoon
- walkers at the lighthouse at weekends and most evenings

### 8. Core wiring in `game/core.js` and `data/world.js`
- **`world.js`:** `SOUTH`, the new `VILLAGE` places, and the `BRIDGES` and `ARRIVE` entries in both directions.
- **`core.js`:** the scene art, both scene-name maps (the `names` object in `drawScene`, and the "the lower vineyard" style map), and `SOUTH_SPOTS` with `southSpot`.
- **Lists that check outdoor screens:** these use `SOUTH.includes(...)`: Evan's lists, `bounds()`, and `walkToPlace`.
- **Vines:** the vine tap handler and the vine panels also work on `lowervine`.

### 9. Later additions (rounds 268 to 275)
- **Lighthouse glow:** the lighthouse lamp and beam glow above the night darkening (`nglow`).
- **Bram:** the keeper villager, with his daily tales when you climb the lighthouse.
- **A pony of your own:** 1,200 coins at the stable block, named by the player.
- **Mackerel rocks:** a new fishing spot (`rocks`) with pollack and sea bass.
- **Weekly events:** the Sunday car boot sale (curios in `data/carboot.js`) and the Monday lamp lighting.
- **The story threads:**
  - the priory vine and the new grape Priory Red, which is wired through all the wine code (grep `priory`)
  - the flask and the sea cave panel
  - Pebble and Juniper's poem
  - story finds at the car boot sale

These story threads hang off the personal edition's villagers and its secret passage arc (Hazel, Marco, Ines, Celeste, Theo, Juniper). Port them only where this edition has the same villagers and arc; otherwise keep the mechanics (the flask, the sea cave, Priory Red, story finds) and attach them to this edition's own characters, or leave them out and tell me.

### 10. Fixes and additions (rounds 276 to 292)
- **Paddleboard jetty:** moved to the west beach at Lighthouse Point, west of the beach huts (`JETTY.lighthouse`, `lsup`).
- **Ducks:** fed with peas or corn from the bag for free, or 1 coin of duck food otherwise.
- **Fish and chips:** the hatch opens a menu panel (`woodsView = "chips"`, `CHIP_MENU`), and the player can sell catch to the hatch (`CHIP_BUYS`, `sellCatch`, up to 6 a day). Keep the sell prices below buy prices.
- **Positions:** the lighthouse moves up (translate 0 -36) and the old press moves up (translate 0 -120), clear of the mackerel rocks and the footbridge.
- **The allotments screen:** new file `src/art/allotment.js`, an inside screen reached from the green (`gallot`), with six neighbours' plots (`PLOTS`, `data-aspot`) and the swap crate. Swap the plot holders for this edition's villagers.
- **River mouth:** on the lower vineyard the stream fans out across the sand into the sea, filled with a gradient from `--water` to `--sea` so the two blend.
- **Buying the lower vineyard (round 282):** the four lower rows start as Bram's, with a For Sale sign (`vsale`, `lowerSalePanel`, `buyLower`, 2,500 coins); no trellis goes down there until you buy. Use this edition's keeper if Bram isn't ported.
- **Riding your own pony and Bram's cottage (round 283):** tack from the tack room, an hour's ride a day as a ride mode ("pony" in `ride()`), and the keeper's cottage above the beach huts at Lighthouse Point (`art/bramcot.js`, scene `bramcot`, `bramSpot`). Swap Evan for this edition's companion, or drop him.
- **Beachcombing:** two finds a day on each bottom-row beach (`BEACH_SPOTS`, `beachFinds`, `pickBeach`, `beachArt`, `data-shell`): seashells and conches (`BEACH` in `data/carboot.js`), plus the kitchen's existing `clams` and `mussels` if this edition has them; otherwise shells only.

- **Round 286:** the home jetty can paddle to Lighthouse Point; boarding at Lighthouse Point starts out on the water below the jetty (`paddleTo` offsets); Dot sells fish and chips to take away (`takeaway`, item `chips_out`), a gift for this edition's family or friends, or leave the gift lines out if it has none.

- **Round 287:** seagulls at Lighthouse Point (perched, and gliding by day; the one on the chip hatch roof is tappable), and the river taxi stops at the Lighthouse Point jetty (`STOPS.taxilight`, a "Take the river taxi" button in its jetty panel). Update the taxi tests' stop count.

- **Round 288:** messages in bottles on the bottom-row beaches (`data/bottles.js`, `bottleToday`, `pickBottle`, `bottlePanel`, `bottleMail`, `bottleArt`), kept in the mailbox; and the perched gulls tilt their heads now and then (`.gullperch`); round 289: two of them now and then flap off over the sea and glide back (`.gulloff`, `.gwup`, `.gwdown`, `.gwflap`). Round 290: the gull drawings live in `art/gulls.js`, and `coastGulls(scene, night)` adds gulls along the foreshore and the Stables, green and lower vineyard beaches. The messages have no personal content, so they can go across as they are.

- **Round 291/292:** the priory ruins behind the old press (they wait until the old mill is unlocked: `F.goals.mill`, or this edition's equivalent; buying the lower vineyard needs no mill), restored a step a day (`RUIN_STEPS`, `ruinStep`, `pickHerbs`, `ruinsPanel`, art in `lowerVineArt(v, ruin)`), giving sage (a new item and mill herb) and lavender once done. Hazel's line in the last step is personal-edition; swap it for this edition's villager or drop it.

### 11. Weddings buy sparkling by the case (round 284, not part of the bottom row)
If this edition has the terrace weddings (`game/occasions.js`), port this too: commit `4fea497` "Weddings order two to four cases of sparkling, brought up from the cellar on the day".
- `occasions.js`: `weddingCases(day)` gives each couple an order of two to four cases; the bookings book note reads "N cases of sparkling ordered from your cellar".
- `vineyard.js` `sellTick`: once the wedding's on (`v.wedCases` marks the day), that many bottles (six a case) come straight out of the cellar's sparkling, kept-back lots included but nothing on the riddling rack, paid at the shelf price (`bottlePrice`, shared with `stock`). If there's not enough, they take what there is; guests still buy off the shelves as before. The day's report counts the couple's bottles (`today.cases`).
- Test: the extra checks in "The terrace's week" block.

### 12. Dot's hatch, inside the lighthouse, and the boat (rounds 296 and 297)
Commits (the HANDOFF.md entries for rounds 296 and 297 describe them; leave out the bakery revert and its save migration in `ce7e5e6`, which is personal-edition only):
- `bb16c97` and `63e011a`: **Dot's hatch opens and shuts.** `CHIP_HOURS` 11:30 to 20:30 and `chipsOpen(hm)` in `south.js`, and `chipsPanel(F, day, hm)` shows her note when she's shut. `lighthouseArt(night, chipsOpen)` draws her at the open hatch (`hatchOpen`) with curls, a pink hairband, rosy cheeks and earrings, and only a thin outline, because a thick one read as a beard. When shut there's a slatted roller shutter.
- `dcc59a5`: **inside the lighthouse, three floors.** New files `src/game/lhtower.js` and `src/art/lhtower.js`, scenes `lhtower1` to `lhtower3`, with `towerSpot` and `TOWER_AT` in `core.js`, and walls in `paths.js`. Tapping the lighthouse goes in; its old climb line moves to the gallery.
  - The ground floor: the wreck case (twelve curios from the rock pools, `poolFind`, `placeCurio`), the visitor book, the tide board, oilskins and the fog bell.
  - The watch room: the telescope and spotting list (`lookOut`, `SIGHTS`), the weather log (`writeLog`, a week running gives a treat) and the keeper's armchair (his tales; Bram sits there from 16:30 to 17:30 in `npcs.js`).
  - The lamp room: polish the lens (`polishLens`; treats only, never coins), the beam turning after dark (`.lhspin`), the Monday lamp lighting from up there, and the gallery view.
  - Nothing pays coins and finishing a collection earns nothing; keep it that way. Swap Bram for this edition's keeper, and Evan's lines for this edition's companion, or drop them. The puffin sighting mentions Puffin Isle; reword it if this edition has no Puffin Isle trip.
- `d4fdc40`: **the dolphin cruise sets off at any hour** (`startCruise`; after dark it's a moonlit cruise). The two dolphins beside the cruising boat now leap on the seaward side; they used to jump onto the beach. If this edition has the cruise boat, port both.
- `0e74f1c`: **your own boat sails to towns at any hour and comes home whenever you're ready.** In `trips.js`, `canLeave(..., "boat")` is always true, `BOAT_OUT` is gone and `BOAT_HOME` is midnight. The call back aboard comes only just before the day turns over, between 1:45 and 2am (`timeToGo`, `BOAT_LATE`). The boat towns' lines say "whenever you're ready". Apply it to whichever boat towns this edition has.
- Round 298 (`git log` "The wine shop's windows stop short of the door; the green's lamp posts light up at night"): the green's two lamp posts get `lampGlow` (and `lampDefs`), so they light up after dark; and the wine shop's window panes in `art/vineyard.js` `shopArt` are narrowed (330 to 368, 412 to 448), because the night glow drawn round the left pane spilled over the door. Port the window fix only if this edition's wine shop has the same drawing.
- Tests: the "Inside the lighthouse (round 297)" block; the extra check for the hatch's hours at the end of the "Riding your pony and Bram's cottage (round 283)" block; and the "your own boat sails to towns (round 205)" block, where the 8am and 2pm checks became "set off at six in the morning" and "half nine at night".

### 13. Seashells, one at a time, and the chocolate steps (round 299)
Commits `a4fcaa1` "Seashells sell and can be given; things go in one at a time; the Cocoa Room's step strip and batch roasting" and `0253b70` "The Cocoa Room's steps drawn, with how many at each" (HANDOFF.md round 299):
- Seashells (`BEACH` in `data/carboot.js`): sell for 1 (the conch for 2), and can be given (`to: "family"`, or this edition's equivalent, with a `say`).
- One at a time: the larder, the wine shop's fruit crate, the mill's basket and the mulled-wine spice rack get "1" and "All" buttons instead of moving everything at once. Port whichever of these this edition has.
- The Cocoa Room: the roaster takes up to four sacks at once (`ROAST_MAX`, `startRoast(F, n)`, `c.roast.n`; Mateo roasts a batch too). Every kitchen station opens with the five steps drawn as a row of little pictures (a bean sack, the roaster, the grinder, the marble slab, a bar mould: `PIC`, `flow`, CSS `.ccpipe`/`.ccstep` in `styles/game-ui.css`), each with how many are at that stage (sacks, roasting or roasted, the pot grinding or ready, the pot to temper, pieces to mould by flavour), the next step lit up, a "Next:" line with a "Go there" button (`nextStep`), and the bonbon shelf and bar wall counts written out by flavour underneath. This replaces the old one-line text of counts. Port if this edition has the Cocoa Room.
- Round 300 (`19c69b0`), the lit windows at night: in `core.js`, where each `.wglow` pane's lit copy is made for `.nightcopy`, check that `k.setAttribute("stroke", "none"); k.setAttribute("transform", mtx(w));` is real code and not the tail of the comment after `k.setAttribute("style", ...)`. In the personal edition it had slipped into the comment, so on any building drawn inside a translated group (Chord, Chico) the warm panes floated beside the windows. If this edition has the same line, fix it the same way.
- Tests: the "Seashells, one at a time, and the chocolate steps (round 299)" block and the changed checks it lists in HANDOFF.

### 14. The paperie's steps drawn (round 301)
Commit `45b9e10` "The paperie's steps drawn, like the Cocoa Room's" on the branch (HANDOFF.md round 301). In `game/paperie.js`, the text strip of steps (`STEPS`, `stepNow`, `.ppstrip`/`.ppstep`) and the batch picture under it become `strip(F, t, here)`: six stages drawn as cards (Scraps, Soak, Pulp, Press, Dry, Shelves), each with its picture (the batch icons) and how many are at it, the next one lit up by `nextPaper(F, t)`, a "Next:" line and a "Go there" button, and tapping a card goes to that station. It reuses the Cocoa Room's card CSS from section 13 (`.ccpipe`, `.ccstep`), plus `.ccpipe.six` and `.ccpic`, so port section 13's CSS first. Test: the changed check in "The paperie in Montrose (round 183)".

### 15. More trivia (round 302)
Commit `9058fc3` "Trivia: 220 questions in eleven rounds, a different mix each week" on the branch (HANDOFF.md round 302). If this edition has trivia night on the terrace (`game/occasions.js` `QUIZ`): the questions move to a new file `src/data/trivia.js` (`QUIZ_ROUNDS`, eleven rounds of twenty), and `quizFor` plays four rounds picked by the date (`nightRounds`) plus the Honeybrook round to finish, with a `mix` step on the hash so neighbouring weeks differ. The Honeybrook round names personal-edition villagers and places (Tomo, Mateo, Bram, Dot, Pilar, Amara, Pebble, Bellbird Valley's people): keep the ones this edition has and swap or drop the rest. Test: the new check in "The terrace's week".

### 16. Happenings: setbacks and surprises (rounds 303 and 304)
Commits `c7da0a9` "Happenings, part one" and `00d2241` "Happenings, part two" (HANDOFF.md rounds 303 and 304). Once a player has bought everything, nothing much happens, so now and then something does. Take the new file `src/game/happen.js` as it stands at the branch tip and wire it by hand:
- **The morning roll** (`hapDaily`, state `F.hap`): never on the first morning or while away on a trip. Each happening leaves a note in the mailbox (`hapMail`, merged into core's mail list; add `HP.hapMail(F).length` to the mail cache key). In `core.js`, `hapNow()` runs every 15 seconds from the tick, builds who owns what, reads last night's weather, then calls `judge()` (the critic) and `lapse()` (a missed order).
- **Storm night** (60% after a stormy night): breaks the boat's rail (no boat trips or cruises until mended), a vineyard trellis (that row can't be picked), the Scoop Shack awning (sales ×0.85), or the bandstand bunting. A tappable "Storm damage: mend" tape label (`hapMarks`, `data-mend`); Mel walks over and pays (`mend`).
- **The wine** (`vineyard.js`): every twelfth bottling turns to vinegar (six bottles of `vinegar`, sells for 2; round 309 gives it a bottle icon, `I.vinegar` in `art/icons.js`, makes it a kitchen good in `game/kitchen.js` `GOODS`, and adds two dishes that use it: the small plate `insalata` and the all-year tapa `encurtidos`); in harvest week, without the new **bird netting** (vineyard shop, 80), starlings strip a few ripe vines (`birdsTake`).
- **The food critic** (1 in 20, a fortnight apart): a hint names the shop and the hour; well stocked (`WELL`) means a good review and ×1.3 sales for a week, otherwise a lukewarm write-up and no harm.
- **Coach party** (1 in 10): the bay's shops or the wine shop sell ×3 for two hours from 11 or 2.
- **Big orders** (1 in 8, at least 6 days apart): 20 to 30 scoops, 12 to 18 bars or 10 to 16 bottles, due in 2 or 3 days at 5pm, paid at the shop price plus a tenth. "Order: deliver" label on the shop (`data-order`, `orderStock`, `orderTake` in core). Missed: a note, nothing lost.
- **Upkeep**: per shop, after 21 days, 1 in 14 a morning, a bill (80, 100 or 60) and an "Upkeep: pay" label; that shop sells ×0.8 until it's paid.
- `boost(F, shop, day, hm)` multiplies sales in `scoop.js` (`saleMinute`), `cocoa.js` (`busy`) and the wine shop's factor.
- Port only the parts whose shops and places this edition has, and map the village names in the notes (the cricket club, Hana, Bram, the Honeybrook Gazette) to this edition's. Keep the amounts: money must not come easily.
- Tests: "Happenings: storms, the wine, the critic and coach parties (round 303)" and "Happenings: big orders and upkeep (round 304)".

### 17. Festival chocolates you can see and give, and more rain (rounds 305 and 306)
HANDOFF.md rounds 305 and 306.
- **Festival chocolates** (port if this edition has the Cocoa Room's festival specials): in `game/cocoa.js`, the `SPECIALS` lines stop sounding like a list of ingredients (no chilli to hunt for), the festival card on the bonbon table says "All it needs is 12 pieces of ... chocolate (you have N): everything else is in the kitchen", and shows a big drawn picture of the special (`specialPic`: six chocolate diyas with gold flames in a marigold box for Deepavali, gold coins for Chinese New Year, the yule log, mooncakes), how many are made, and a "Take one to give" button (`data-cc="takesp"`). New icons `sp_spiced` and `sp_coins` in `art/icons.js`; specials in stock stand on the Cocoa Room counter (`art/scenes.js`, the cocoa counter). The Deepavali box goes to family or friends. In `core.js` the "made" line's plural is fixed ("boxes"). Test: "Festival chocolates you can see and give (round 305)".
- **Valentine's and Mother's Day chocolates** (round 307): two more specials, `sp_hearts` (a box of six dark chocolate hearts) and `sp_roses` (a posy of white chocolate roses), with pictures, icons and gift items. `specialOn(day)` gives them the week before 14 February and the week before the second Sunday in May, checked before the festivals (Chinese New Year often overlaps Valentine's week). Map the gift lines to this edition's family.
- **More rain, shorter showers**: `art/village-extras.js` `rainDay` and `showerAt`: a shower every two or three days (the days go in fives, rain on the first and on the third or fourth), each 1 to 3 hours, starting 7am to 7pm; half downpours in the wet season, a quarter otherwise. If this edition has section 16's storm night, it now follows a downpour day (`rainDay(prev) === 2`) at 40%. Your own boat is only kept in by rough seas from half an hour before a downpour until two hours after (`roughSea(day, hm)`, used where the boat panel and `buyTrip` checked for a downpour day; "Too rough to sail just now"). Test: the "rainy days" block's first check. Expect other tests that assumed a dry day to need a dry date or time.

### 18. The barrel shed and the drying loft as rooms (round 308)
HANDOFF.md round 308. Port the barrel shed room if this edition has the vineyard's barrel shed; the drying loft only if it has the loft (it comes with Cinque Terre).
- New `src/art/vshed.js` (`shedArt`, `loftArt`, `SHED_SLOTS`): scenes `vshed` and `vloft`, custom-drawn front-view rooms with `data-vsspot` spots, wired like the lighthouse floors: in `core.js` the scene art and names, `shedNow()`, `loftNow()`, `VS_AT`, `vsSpot(k)`, `loftAct(a, k)` (shared with the loft's list), the click handler for `data-vsspot`, the vineyard's barrel shed place walking you in (`setScene("vshed", ...)`), and `vshed` added where the barrels panel renders and `wireVine` runs. Walls in `game/paths.js`; Marco's 4:30 to 6 bench slot in `data/npcs.js` (map to this edition's vineyard hand, if any).
- Round 310 fix, needed with these rooms: in `core.js` `frameNow`, the "walked off the bottom of a room" rule (`!INNER[scene] && !coOf(scene) && mel.y > 592` then `VILLAGE[scene].door`) must also check `VILLAGE[scene]`, or walking to the bottom of the shed or loft crashes ("reading 'door'").
- No "list view" in the loft: everything is done by tapping things in the room (the loft's list panel stays only as code the old ladder button could reach).
- The cellar (if this edition has it): `art/scenes.js` `barrelrack` draws the barrels bought for the cellar (the 7th to 18th) as twelve barrel ends stamped in their wine's colours, gaps for ones not bought, a green dot on ready ones, and an "N ready" tag.
- `game/loft.js`: two racks each with their own cask (`rack`/`rack2`, `cask`/`cask2`), racks dry in 2 days, a cask gives 6 bottles, three raisin trays (`tray`/`tray2`/`tray3`).
- Tests: "The barrel shed and the drying loft as rooms (round 308)", and wherever an old test tapped the barrel shed and expected the list, walk into the shed and tap the crates (`[data-vsspot="crates"]`) first, and out (`[data-vsspot="out"]`) after.

- Round 313 (Mel: "I should be able to dry some while some are in the cask"; "things don't appear immediately"; "one modal for grapes, one modal for the wines"):
  - `game/loft.js`: a rack can start while its cask is ageing. `collect` on a dry rack puts the raisins into its own cask, or the other one if that's free (`{cask: "cask"|"cask2"}`), or returns `{wait: true}` and leaves them on the rack. `loftAct` in core says so, and the "This rack's cask is still full" refusal in `vsSpot` is gone.
  - `core.js` `vsSpot`: after starting or collecting a loft job, `render(true)` so the racks, casks and trays redraw at once; the `[data-lf]` buttons call `drawScene()` too.
  - `game/vineyard.js`: `barrelPanel` is split. `grapePanel(F)` ("The grape crates": take, put back, keep back) opens from the shed's crates (`vyView = "grapes"`); `barrelPanel(F)` ("The wines": barrels, bottling, the cellar's bottles, buying barrels) opens from the barrels, the bench and the bottling table, and from the cellar's racks. No "Up the ladder" button: the ladder is in the room.
  - Tests: new checks in "The barrel shed and the drying loft as rooms (round 308)" and in the Cinque Terre unit checks; tests that tapped the crates to fill or bottle now tap barrel 1 (`[data-vsspot="b0"]`), and the Cinque Terre test climbs the ladder spot (`[data-vsspot="up"]`).

### 19. The paper shop keeper makes paper too, and a longer drying line (rounds 311 and 312)
HANDOFF.md rounds 311 and 312. Port this if this edition has the paperie and its keeper (here Lise, the `paperkeeper` goal; use this edition's keeper name). In `game/paperie.js`:
- `liseStep(F, t, day)`: while the keeper is in (`keeperIn`), `paperTick` runs one back-room step a minute after taking dry sheets down: hang pressed sheets if the line has room, press wet sheets, choose an add-in (or plain) for pulp that hasn't had one, pull, beat soaked scraps in a colour, or tear 2 bundles into the tub. Each step waits `LISE_WAIT` (5) minutes after anyone last touched the batch (`p.touched`, now stamped by Mel's own steps too), so the player gets first go.
- `liseColour`, `liseAdd`, `liseLean(day)`: weighted random picks, only what the till can pay for, never the same colour and add-in as her last batch, and leaning to the season (blush and roses before Valentine's, petals and seeds in early May, gold and ink blue in December, sage and seeds in spring).
- Money must not come easily: she pays pigment and jars from the player's coins, never uses the backpack, never buys scraps. With an empty till she makes plain natural sheets (`beat` now lets a free colour through when coins are below zero).
- `paperTick` returns `out.lise` (lines like "hung six sheets of ... on the line"); `liseToday(F, day)` puts what she's made today on the till panel. In `core.js` `paperNow` flashes "Lise ..." when the player is in the shop, saves on her steps, and her away note adds how many new sheets she hung.
- Round 312: the drying line holds `LINE` = 8 batches of 6 (48 sheets), drawn as two strings of four in `art/paperie-room.js` (the second string 50 down). With the keeper working, the line and the scraps are the limits.
- Test: "Lise makes paper too: every stage, her own colours and add-ins (round 311)".

### 20. A bigger churner for the Scoop Shack (round 314)
HANDOFF.md round 314. Port it if this edition has the Scoop Shack and its upgrades catalogue.
- `game/scoop.js`: a sixth upgrade, `bigchurn` ("A bigger churner", 900 coins, with a line in `buyUpgrade`). `churnCap(s)` is `BIG_CHURNS` (4) with it, else `CHURNS` (2); `churnFull` uses it, and the "churner's full" message and `churnLine` say the right number ("four at a time", "In the churner (2 of 4)"). Each tub still takes an hour.
- Tests: the Scoop Shack upgrades block counts six upgrades; a unit check "the bigger churner (an upgrade, 900 coins) holds four".

### 21. A dish for red mullet (round 315)
HANDOFF.md round 315. Port it if this edition has the kitchen's tapas and the bay's Friday sunset fishing.
- `game/kitchen.js`: `mullet` in `GOODS` and `SOURCE` ("the bay, Friday evenings 5 to 8"), and an all-year tapa `salmonetes` ("Fried red mullet with lemon": 1 red mullet, 1 lemon, 12 coins).
- `game/fishing.js`: the red mullet's backpack line names the kitchen, the Friday bonfire and Sal.
- Tests: the stove's Local tab count goes up by one; a unit check "red mullet goes to the kitchen".

### 22. The tomato salad's picture (round 316)
HANDOFF.md round 316. Port it with the vinegar dishes (section 16's note) and section 21.
- `art/wine.js` `dishArt`: an `insalata` drawing (tomato slices, basil, a splash of vinegar and a small cruet); without it the small plate showed an empty plate. `TAPAS_COL` gets colours for `encurtidos` and `salmonetes`.
- Test: "every small plate is drawn, not an empty plate" (a unit check).

### 23. The coach party you can see, and Tomo's bike (round 317)
HANDOFF.md round 317. Port the coach crowd with section 16 (happenings); Tomo's two fixes wherever the delivery bike rides by.
- New `src/art/coachcrowd.js`: `CROWD_AT` (where visitors stand or sit in each room, scene units), `CROWD_ORDER` (vineyard: the wine shop, then the terrace; bay: the Scoop Shack, the Cocoa Room, then the bay outside), `crowdLevel(win, hm)` (in over 12 minutes, out over the last 15), `crowdSplit(place, level, {terrace, cocoa})` (rooms fill in order; with no terrace the winery's overflow waits by its door in the vineyard), `crowdArt(room, n, seed)` (static figures with glasses or cones, seated ones use `.act-sit`) and `coachArt()` (the coach, parked by the vineyard stall).
- `game/happen.js`: `coachToday(F, day)` -> `{place, hm}`; the coach note says where the overflow goes.
- `core.js`: `coachCrowdNow()`; `drawScene` adds the crowd to the scene art (and the coach in the vineyard); `hapNow` redraws when the numbers change. Check the positions against this edition's rooms.
- Tomo's bike: `npcs.css` keeps a `.rideby` rider's arms still and forward on the handlebars (no walk swing); `setScene` removes any `.rideby` so his ride never carries on indoors.
- Round 318 (Mel: "I thought it would be for all at once"): `coach()` in `happen.js` now boosts every shop the player owns, at the bay and the vineyard together, for the same two hours, at `COACH_X` = 2.5 each (was 3 for one place, so the money stays in check). `coachToday` returns `places`; `coachCrowdNow` merges `crowdSplit` for each. The note says it splits between the bay and the vineyard.
- Not built yet: a cruise ship (Mel: "don't build the cruise part yet").
- Tests: "The coach party you can see, and Tomo's bike (round 317)" and the round 317 unit checks.

## Make it fit this edition
This edition has no personal family content, so adapt these:
- **Evan:** the pony ride and the little reactions use Evan (`evanHere`, `evanSays`). Use this edition's child or companion character if it has one. Otherwise drop the ride's child condition and the reactions.
- **Villager ids:** `southSlot` names personal-edition villagers (`gonggong`, `mei`, `lila`, `ines`, `marco`, and the pools `BAND_POOL`, `CRICKET_POOL` and `WALK_POOL`). Swap in villagers that exist here. Don't use a family member.
- **Lines:** check every speech line in `south.js`, `world.js` and `southSpot` for personal references. There shouldn't be any beyond Evan and the villager names, but please confirm.
- **House rules, as here:** British spelling, no em or en dashes in game text, calm screens, and sell prices never above buy prices.

## Tests
Port these smoke-test blocks:
- "The lower vineyard (round 261)"
- "The green, the Stables and Lighthouse Point (rounds 262 to 264)"
- "The bottom row in the stories (rounds 272 to 275)", only for the threads you ported
- "Inside the lighthouse (round 297)", plus the changed checks listed in section 12
- "Seashells, one at a time, and the chocolate steps (round 299)", plus the changed checks HANDOFF.md round 299 lists, for the parts you ported
- the changed check in "The paperie in Montrose (round 183)" (section 14)
- the round 314 checks in "Scoop Shack upgrades" and the bigger churner unit checks (section 20)
- "The coach party you can see, and Tomo's bike (round 317)" (section 23)
- "Lise makes paper too: every stage, her own colours and add-ins (round 311)" (section 19)
- "Happenings: storms, the wine, the critic and coach parties (round 303)" and "Happenings: big orders and upkeep (round 304)" (section 16)
- "Festival chocolates you can see and give (round 305)" and the changed "rainy days" check (section 17)
- "The barrel shed and the drying loft as rooms (round 308)" (section 18)

Adjust their ids to this edition. Then run the full suite and publish only when it's green. Afterwards, tell me what you changed from the source and anything you couldn't port.
