# Maple's Village

A cosy village game that turns Mel's Sunsama day into quests. It's published as a private claude.ai artifact (https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4) and fed by the **playable-boss** skill (`skills/playable-boss/SKILL.md`). `HANDOFF.md` has the full background and design system.

## Working on it

```sh
npm install
npm run dev          # http://localhost:5173, rebuilds on save. Add ?seed=1 for a demo day
npm run build        # dist/maple-village.html: the one file to publish
node test/smoke.mjs  # headless play-through on phone + desktop sizes (screenshots in test/shots/)
```

Dev URL options (from `dev/claude-stub.js`, a stand-in for `window.claude.use()`):

| Option | Effect |
|---|---|
| `?seed=1` | writes a demo plan, two agent notes and user counts |
| `?time=15:30` | pretends it's that time in Singapore (villager routines, lunch/water nudges) |
| `?reset=1` | clears all local game data first |
| `?nosample=1` | acts as if "talk to the note" isn't allowed |
| `?sunsama=1` | fake Sunsama connector, for the page's own Sunsama pull (use without `?seed`) |

In the browser console, `devDb.set("plan", {...})` / `devDb.get("today")` read and write the stub's documents.

## Layout

```
src/
  index.html          markup shell (styles + script are inlined by build.mjs)
  styles/             base.css (design tokens, cards, washi, village), notebook.css, npcs.css, game-ui.css (map-first layout, quest note, panels)
  util.js             Singapore time, DOM and maths helpers
  data/world.js       village layout, building interiors, task → place/spot matching
  data/items.js       shop items, crops, plots, friendship levels
  data/npcs.js        villagers (routines, lines, reactions) and agent messengers
  art/scenes.js       village / interior / garden SVG, furniture, user-count gardens
  art/buildings.js    the five work buildings, each with its own architecture
  art/interiors.js    per-building floors, walls and decor (furniture layout is ROOMS[id].pos)
  art/people.js       villager sprite rig
  art/icons.js        hand-drawn icon set (no emoji in the game)
  game/core.js        state + db sync, quest flow, actions, UI renderers, world sim
  game/sunsama.js     pulls today's Sunsama tasks via the mcp capability and turns them into quests
  game/npcs.js        villager routines, taps, reactions, mail messengers
  ui/notebook.js      the Do task notebook overlay and agent notes
dev/claude-stub.js    local runtime stub (dev builds only)
legacy/               the single-file build that was live at handoff
```

## Data the page reads and writes

All docs live under `data/users/<uid>/` in the artifact's `db`.

| Doc | Written by | What |
|---|---|---|
| `plan` | chat, or the page's own Sunsama pull (`source: "sunsama"`; chat's plan always wins) | `{day, tasks:[{id, title, firstStep, minutes, pep, notes?, email?, treadmill, meeting, chat, at, place, spot}]}` |
| `mail` | chat / agents | `{items:[{id, from, title, body, sections?, link?, at}]}`. `from: "crier"` renders as *The Morning Crier*. `from` picks the messenger (see `AGENTS` in `data/npcs.js`) |
| `library` | chat / book-digest | `{items:[{id, title, author, body, try?, link?, added}]}` for Juniper's digest shelf (one an hour, or one per quest done) |
| `stats` | chat | `{chord:{users, per?}, chico:{users, per?}}` for the flower gardens |
| `today` | page | resets 2am SGT: doneIds, steps, water, cleanDone, timers, … |
| `fox` | page | persistent: coins, inventory, garden plots, friendship, villagers met, letters read |

## Publishing

1. `npm run build`.
2. Publish `dist/maple-village.html` with capabilities **`{db: {}, user: {}, sample: {}, mcp: {servers: [{server: "Sunsama MCP", tools: ["read_resource"]}]}}`**. Passing capabilities replaces the whole stored set, so list them all. Without `sample`, everything works except "talk to the note" and Juniper's own picks. Without `mcp`, the page doesn't pull Sunsama itself and waits for chat's plan.

Live village (private, Mel's): https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4. Publish with the Artifact tool's `url` set to it. Data lives in the artifact's own database (no Firebase needed). An older test copy is at https://claude.ai/artifact/FLecX7JuweZ4iMJgujA2ET.

**Village quest loader** (Claude Code routine `trig_01EXogUFX8v1c5VvV9UKfgAZ`, daily 7:24am SGT) reads Sunsama and Calendar, writes the plan with first steps and pep talks (`source: "routine"`), and never overwrites a plan chat made that day. It needs the Sunsama and Google Calendar connectors attached to the routine.
3. Her progress lives in `db`, so it carries over.

## Open questions for Mel

- **Hana's hours:** the shop stays usable all day (there's an "honesty box" line when Hana's out). Say if you'd prefer a "back soon" sign.
- **Agent mail:** which agents run outside chat, and whether scheduled Cowork tasks can reach the Artifact tool's `write_db`. Until that's confirmed, chat posts the notes.
- **User counts:** no connector exposes Chord/Chico user numbers yet, so chat writes `stats` when you share them.
