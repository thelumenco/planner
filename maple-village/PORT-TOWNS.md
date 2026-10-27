# Port to the public edition: Portovenere and Formentera

Paste everything below the line into the chat that works on the public edition (branch `honeybrook-public`).

---

Please port two towns from the personal edition of Honeybrook into this public edition: **Portovenere** (a boat town) and **Formentera** (by ferry or by boat). They are the only two trip towns this edition doesn't have yet; it already has Saltwick Harbour, Puffin Isle, Bali and Hokkaido, so adapt these two the same way you adapted those.

The source is the personal edition's branch `ccr-896057b5-con92k` in the same repository (`thelumenco/planner`, folder `maple-village`). Fetch it with `git fetch origin ccr-896057b5-con92k`. HANDOFF.md on that branch describes both towns: "Rounds 210 to 213: Portovenere" and "Rounds 231 to 234: Formentera". Do one town at a time, and run the full suite and publish after each.

## Portovenere (town `porto`)
Commits, in order: `1664a56` and `478594e` (in progress), `a68306a` "Portovenere: four screens, six rooms (Signora Lia's shells too), people and stories, letters, music, stuffing mussels, the poets' book, the choir", and `2dde256` (her Rosa is `pvrosa`, because `rosa` is already a Honeybrook visitor). The in-progress commits overlap, so take the new files as they stand at the branch tip (`git show origin/ccr-896057b5-con92k:maple-village/<path>`) and wire the shared files by hand from the diffs.
- **New files:** `src/data/porto.js`, `src/data/porto-goods.js`, `src/data/pv-people.js`, `src/data/porto-rooms-layout.js`, `src/data/pen-pv.js`, `src/game/porto.js`, `src/art/town-porto.js`, `src/art/porto-rooms.js`.
- **Screens** (a ring): `pv_castle`, `pv_point`, `pv_borgo`, `pv_harbour`. **Rooms:** `pv_mussels`, `pv_bar`, `pv_bottega`, `pv_books`, `pv_shells` (Signora Lia's shell shop), `pv_church`.
- **Shared files touched:** `data/towns.js` (the town entry: spots, acts, rooms, lines), `data/npcs.js`, `data/stories.js`, `game/stories.js`, `game/audio.js` (town and room music), `game/kitchen.js` (specials `muscoli`, `castagnaccio`, `capperi`), `game/scoop.js` (`INGR` for chestnut flour, capers and fennel), `game/companions.js`, `game/contacts.js` (the letters), `game/core.js` (imports, scene art, panels, `data-pv` wiring, `pvLine`, the harbour cats).
- **Activities:** stuffing mussels with Rosa, a line in the poets' visitors' book, the choir at San Pietro with Don Piero, and the poet's notebook (six lines round the town, `pv_notebook` for all six).
- **Leave out:** Jason and Luca's visits (their Tuesday and Saturday `dow: [2, 6]` slots in `npcs.js`, and anything else naming them). They are personal-edition only.

## Formentera (town `formentera`)
Commits, in order: `6bd2571`, `d6eaade`, `bec774a`, `2134759` (in progress), then `f51368c` "Formentera: by ferry or boat; Ses Illetes, the salt flats, Sant Francesc and La Mola, five rooms, people and stories, raking salt, snorkelling". As with Portovenere, take the new files from the branch tip and wire the shared ones by hand.
- **New files:** `src/data/formentera.js`, `src/data/formentera-goods.js`, `src/data/fm-people.js`, `src/data/formentera-rooms-layout.js`, `src/data/pen-fm.js`, `src/game/formentera.js`, `src/art/town-formentera.js`, `src/art/formentera-rooms.js`.
- **Screens** (a ring): `fm_salines`, `fm_mola`, `fm_illetes`, `fm_village`. **Rooms:** `fm_bar`, `fm_salt`, `fm_bakery`, `fm_light`, `fm_bikes`.
- **Shared files touched:** `data/towns.js`, `data/npcs.js`, `data/stories.js`, `game/stories.js`, `game/audio.js`, `game/npcs.js`, `game/kitchen.js` (flor de sal, peix sec, figs, sheep's cheese; specials `ensaladapayesa`, `flao`, `figbread`), `game/scoop.js` (salted caramel and fig gelato), `game/companions.js`, `game/contacts.js`, `game/core.js`, `art/people.js` and `styles/npcs.css` (the family's props there).
- **Activities:** raking salt with Toni (July to September), snorkelling the seagrass, bikes at Joan's and the Green Route to La Mola, the market (market days), and the three lighthouse stamps.
- **Seasons:** flamingos September to April, the market Wednesdays and Sundays May to October, salt July to September.

## Later touches to both towns
These came after the towns and may already be here in general form; make sure they cover the two new towns:
- `ba3d94d`: tap anywhere on your boat to sail home.
- `b789143`: windows glow at night; the towns' window glass is tagged `wglow`.
- `0e74f1c`: your own boat sets off at any time and comes home whenever you're ready; both towns' boat lines say so.
- `19c69b0`: in `core.js`, the lit window panes carry their transform (it had slipped into a comment).

## Make it fit this edition
- **Family and Evan:** both towns have family acts and props (Mum, Dad, Ma Ma, Gong Gong, Darren, Marcus, Angelina) and Evan's lines and spots (`PV_EVAN`, `FM_EVAN`, the harbour cats). Map them to this edition's companions as you did for the other boat towns, or drop them.
- **Lines:** check every line in the new files for personal references, and run this edition's leak check.
- **Counts:** the personal tests count 34 kitchen trip specials after Portovenere and 46 after Formentera. This edition's numbers will differ, so update the counts to match.
- **House rules:** British spelling, no em or en dashes in game text, calm screens, and sell prices never above buy prices.

## Tests
Port "Portovenere by boat (rounds 210 to 213)" and "Formentera by ferry (rounds 231 to 234)" from `test/smoke.mjs` on the branch, adjusted to this edition. Publish only when the full suite is green. Afterwards, tell Mel what you changed from the source and anything you couldn't port.
