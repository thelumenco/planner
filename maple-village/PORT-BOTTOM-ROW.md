# Port to the public edition: the bottom row of the map (4 by 4 grid)

Paste everything below the line into the chat that works on the public edition (branch `honeybrook-public`).

---

Please port a feature from the personal edition of Honeybrook into this public edition. The source is the personal edition's branch `ccr-896057b5-con92k` in the same repository (`thelumenco/planner`, folder `maple-village`). Fetch it with `git fetch origin ccr-896057b5-con92k` and read the changes from these two commits:

- `09007fb` "The lower vineyard: a new screen down the hill with four more trellis rows"
- `22452d3` "The bottom row: Honeybrook Green, the Stables, Lighthouse Point and the coast strip, with villagers visiting"

Use `git show <commit>` to see each diff. HANDOFF.md rounds 261 to 265 on that branch describe the design. Don't merge or cherry-pick blindly: this edition has drifted, so apply the changes by hand where files differ, and keep this edition's own conventions.

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

Adjust their ids to this edition. Then run the full suite and publish only when it's green. Afterwards, tell me what you changed from the source and anything you couldn't port.
