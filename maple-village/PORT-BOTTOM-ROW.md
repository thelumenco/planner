# Port to the public edition: the bottom row of the map (4 by 4 grid)

Paste everything below the line into the chat that works on the public edition (branch `honeybrook-public`).

---

Please port a feature from the personal edition of Honeybrook into this public edition. The source is the personal edition's branch `ccr-896057b5-con92k` in the same repository (`thelumenco/planner`, folder `maple-village`). Fetch it with `git fetch origin ccr-896057b5-con92k` and read the changes from these two commits:

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

Use `git show <commit>` to see each diff. HANDOFF.md rounds 261 to 279 on that branch describe the design. Don't merge or cherry-pick blindly: this edition has drifted, so apply the changes by hand where files differ, and keep this edition's own conventions.

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

### 10. Fixes and additions (rounds 276 to 279)
- **Paddleboard jetty:** moved to the west beach at Lighthouse Point, west of the beach huts (`JETTY.lighthouse`, `lsup`).
- **Ducks:** fed with peas or corn from the bag for free, or 1 coin of duck food otherwise.
- **Fish and chips:** the hatch opens a menu panel (`woodsView = "chips"`, `CHIP_MENU`), and the player can sell catch to the hatch (`CHIP_BUYS`, `sellCatch`, up to 6 a day). Keep the sell prices below buy prices.
- **Positions:** the lighthouse moves up (translate 0 -36) and the old press moves up (translate 0 -120), clear of the mackerel rocks and the footbridge.
- **The allotments screen:** new file `src/art/allotment.js`, an inside screen reached from the green (`gallot`), with six neighbours' plots (`PLOTS`, `data-aspot`) and the swap crate. Swap the plot holders for this edition's villagers.
- **River mouth:** on the lower vineyard the stream fans out across the sand into the sea, filled with a gradient from `--water` to `--sea` so the two blend.
- **Beachcombing:** two finds a day on each bottom-row beach (`BEACH_SPOTS`, `beachFinds`, `pickBeach`, `beachArt`, `data-shell`): seashells and conches (`BEACH` in `data/carboot.js`), plus the kitchen's existing `clams` and `mussels` if this edition has them; otherwise shells only.

## Make it fit this edition
This edition has no personal family content, so adapt these:
- **Evan:** the pony ride and the little reactions use Evan (`evanHere`, `evanSays`). Use this edition's child or companion character if it has one. Otherwise drop the ride's child condition and the reactions.
- **Villager ids:** `southSlot` names personal-edition villagers (`gonggong`, `mei`, `lila`, `ines`, `marco`, and the pools `BAND_POOL`, `CRICKET_POOL` and `WALK_POOL`). Swap in villagers that exist here. Don't use a family member.
- **Lines:** check every speech line in `south.js`, `world.js` and `southSpot` for personal references. There shouldn't be any beyond Evan and the villager names, but please confirm.
- **House rules, as here:** British spelling, no em or en dashes in game text, calm screens, and sell prices never above buy prices.

## Tests
Port the two smoke-test blocks:
- "The lower vineyard (round 261)"
- "The green, the Stables and Lighthouse Point (rounds 262 to 264)"
- "The bottom row in the stories (rounds 272 to 275)", only for the threads you ported

Adjust their ids to this edition. Then run the full suite and publish only when it's green. Afterwards, tell me what you changed from the source and anything you couldn't port.
