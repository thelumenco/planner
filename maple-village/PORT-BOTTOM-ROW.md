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
Commits `a4fcaa1` "Seashells sell and can be given; things go in one at a time; the Cocoa Room's step strip and batch roasting" and the one after it, "The Cocoa Room's steps drawn, with how many at each" (HANDOFF.md round 299):
- Seashells (`BEACH` in `data/carboot.js`): sell for 1 (the conch for 2), and can be given (`to: "family"`, or this edition's equivalent, with a `say`).
- One at a time: the larder, the wine shop's fruit crate, the mill's basket and the mulled-wine spice rack get "1" and "All" buttons instead of moving everything at once. Port whichever of these this edition has.
- The Cocoa Room: the roaster takes up to four sacks at once (`ROAST_MAX`, `startRoast(F, n)`, `c.roast.n`; Mateo roasts a batch too). Every kitchen station opens with the five steps drawn as a row of little pictures (a bean sack, the roaster, the grinder, the marble slab, a bar mould: `PIC`, `flow`, CSS `.ccpipe`/`.ccstep` in `styles/game-ui.css`), each with how many are at that stage (sacks, roasting or roasted, the pot grinding or ready, the pot to temper, pieces to mould by flavour), the next step lit up, a "Next:" line with a "Go there" button (`nextStep`), and the bonbon shelf and bar wall counts written out by flavour underneath. This replaces the old one-line text of counts. Port if this edition has the Cocoa Room.
- Tests: the "Seashells, one at a time, and the chocolate steps (round 299)" block and the changed checks it lists in HANDOFF.

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

Adjust their ids to this edition. Then run the full suite and publish only when it's green. Afterwards, tell me what you changed from the source and anything you couldn't port.
