# Maple's Village — handoff for Claude Code

This file hands a work-in-progress project from a claude.ai chat to Claude Code. It explains what the project is, how it got here, how the current build works, and what Mel wants next. It's a summary of the chat (4 Oct 2026), not a word-for-word transcript; every design decision Mel made is captured below.

## 1. What this is

**Maple's Village** is a cosy, Stardew-Valley-style web game that turns Mel's day into play. Her Sunsama tasks become quests. She walks her character around a small sketch-style village, into buildings, and up to a specific piece of furniture to do each quest. A tiny fox called **Maple** is her companion and coach. Finishing real tasks earns coins, which buy seeds, treats and toys; seeds grow in a garden in real time.

It is the game layer of Mel's **boss mode**: a coaching routine where Claude hands her one task at a time with a tiny physical first step, a time box and a short pep talk, reacts to "done" and "I'm procrastinating", and enforces breaks. The coaching rules live in `skills/playable-boss/SKILL.md`. The game must keep honouring them.

**Who it's for:** Mel (Melody Bay), founder of Ambidextrous (parent company of Fresh Pages Co., Chord and Chico), based in Singapore. She plays on phone and desktop equally. ADHD-friendly coaching style is a style she asked for, not a label to mention.

**Live link:** https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4 (a published claude.ai artifact, private to Mel).

## 2. Files in this folder

| Path | What it is |
|---|---|
| `maple-village.html` | The current build. One self-contained HTML file (CSS + SVG + JS inline). This is exactly what's live. |
| `skills/playable-boss/SKILL.md` | New skill: boss mode played through the village. Triggers only on explicit "playable boss" / "play my day" / "village mode" cues. Contains the chat ↔ page data contract (section 1b). |
| `skills/boss-mode/SKILL.md` | Mel's original boss-mode skill, unchanged. She keeps this for days she wants plain boss mode. If she swapped in an earlier Maple version, restore this one. |
| `references/fox-style-reference.jpg` | Art direction reference Mel shared: ink outlines, marker colouring, sketchy fur. Style reference only — Maple is an original drawing and must not copy this artwork. |
| `references/ohayo-app-ui.jpg` | Mel's own Ohayo app UI: tape-style buttons, washi tape colours and patterns, premium whitespace. |
| `references/ohayo-brand-type.webp` | Mel's type exploration: Klee One vs Zen Maru Gothic. She chose Klee One for headings. |

## 3. How we got here (chat timeline)

1. **Avatar idea.** Mel asked if her boss skill could be an avatar like Clippy but cuter. We agreed on an original tiny fox, living on its own pinned page, with chat doing the admin (Sunsama, timers, filing).
2. **Maple's den v1.** Cosy fox on a page: one task at a time, speech bubble, timers, berries earned from tasks, spent on feeding, grooming and playing. Friendship level carries across days; everything else resets at 2am Singapore time.
3. **Art + aesthetic.** Mel wanted a sketched ink-and-marker look (see fox reference), bullet-journal vibes and washi tape. Then she refined it: **Klee One** headings, **Mulish** body, highlighter/tape-style buttons and washi colours from her Ohayo app, generous whitespace, "premium app made by a designer". Fixed Maple looking translucent (marker filter now keeps fills solid).
4. **Chat integration.** Boss mode kick-off writes the day's tasks to the page's database and auto-opens the page.
5. **Village (stage 1).** Maple's den grew into a top-down village: Town hall (Ambidextrous), Chord workshop, Fresh Pages library, Chico cottage, post office, home, quest board, well, market stall, pond. Mel's character (fair skin, messy dark high ponytail, tank top, shorts) walks there; **Evan** (her son, 2.5, black hair, blue tee, yellow pants) toddles around as an NPC.
6. **Interiors + farming (stage 2).** Each building opens to its own interior screen with furniture "spots" where quests happen and a mini quest board on the wall. Market became its own shop screen. Garden with 12 plots: buy seeds, plant, water, grow in real time, finished quests speed growth, harvest to feed Maple or sell. Coins now carry over between days.
7. **This handoff.** Mel asked for NPCs, agent NPCs, user-count gardens, a "do task" notebook overlay, treadmill and email handling, a separate playable-boss skill, and to move development to Claude Code. Those are specced in section 7.

## 4. Current build: how it works

### 4.1 Runtime + constraints (important)

The page is published as a **claude.ai artifact**. That runtime has rules the code already follows:

- **Self-contained file.** External scripts only from cdnjs.cloudflare.com, cdn.jsdelivr.net/npm, cdn.tailwindcss.com, code.jquery.com; stylesheets only from fonts.googleapis.com. No remote images, no other network requests. Everything else is blocked silently. Max 16 MB.
- **Capabilities** are reached with `await claude.use(name)` and may resolve `null`; the page must work without them. This build declares `db` and `user`.
  - `db`: per-person documents under `data/users/<uid>/` (private to Mel). The page uses three docs: `today`, `fox`, `plan`.
  - Other capabilities exist and are relevant to the roadmap: `sample` (ask Claude from the page; costs the viewer's usage, asks consent), `mcp` (call Mel's connected apps from the page), `assets`, `downloads`.
- **localStorage** works as a per-browser cache; the page mirrors state there and reconciles with `db` by `updatedAt`.
- **Publishing:** as far as I know, the live link is updated with the Artifact tool in claude.ai chat (`publish` with the link as `url`). So the likely loop is: build in Claude Code → bring the finished HTML back to a claude.ai chat → publish to the same link. Verify this before relying on it. If Mel prefers to host elsewhere, the `db`/`user`/`sample`/`mcp` capabilities and the chat → page task loading won't exist there and would need a replacement backend.

### 4.2 Structure of `maple-village.html`

One file, top to bottom:

1. **CSS** — design tokens on `:root` (light + dark), paper cards with a fibre texture, washi tape variants (`.tape.dots/.stripe/.gingham/.sky`), tape-shaped buttons (`.btn.primary/.yes/.alt/.warn`), journal quest card, trackers, character walk animations, portrait animations.
2. **Hidden SVG filter defs** — `#wob` (wobbly ink lines), `#marker` (marker-fill texture with displaced edges and darker streaks; fills stay opaque), `#wash` (watercolour blobs). All art uses these to look hand-drawn.
3. **Markup** — left column: header (coins), map card (`#world` SVG 520×640 viewBox with `#sceneArt`, quest marker, actors), context panel `#ctx` (moves to the right column on desktop), trackers. Right column: quest card `#journal`, backpack card with Maple's big portrait `#scene`, all-quests list, friendship.
4. **JS** (one IIFE), in order:
   - **World data** — `VILLAGE` (building doors, marker positions, village spots), `ROOMS` (each interior's stations: id, name, slot, furniture kind, keyword regex, line), `POS` slot coordinates, `placeOf(task)` and `spotOf(task)` (use `task.place`/`task.spot` if given, else keyword match, else default/hash).
   - **Items + crops** — `ITEMS` (seeds, treats, tools, consumables, produce; prices, sell values), `CROPS` (durations: flowers 1h, veg 4h, berries 24h), `PLOTS` (12), `QUEST_BOOST` (30 min growth per finished quest), friendship `LEVELS`.
   - **Art** — `villageArt()`, `roomArt(id)` with `furn(kind,x,y)` furniture primitives, `farmArt()`. Generated SVG strings; scene redraws via `drawScene()`.
   - **State + persistence** — `S` (today, resets 2am SGT), `F` (persistent: name, xp, streak, coins, inventory, plots, cooldowns), `P` (plan from chat). `persist()` / `push()` debounce writes to `db`.
   - **Quest flow** — phases `clean → task ↔ break/decompress → recap`, `S.arrived[taskId]` once she reaches the quest's spot, timers (`clean` 5 min, `task` time box, `deal` 5 min, `break` 10 min) with chime + vibrate.
   - **Actions** — `A.*` (walk, gotWipe, cleanDone, firstStep, done, proc, back, flow, decompressed, water), shop `buy/sell`, farm `plant/waterPlot/harvest`, backpack `useItem`, free play.
   - **UI renderers** — `journal()`, `ctx()` (shop / plot panel / quest board), `bag()`, `trackers()`, `questMark()`, `render(redraw)`.
   - **World sim** — `mel`, `maple`, `evan` entities, `go(scene,x,y,fn)` builds a multi-leg route (exit room → walk village → enter building → walk to spot), `setScene()` with fade, tap and arrow/WASD input, Evan's wander AI, depth sorting, speech bubble positioning (`bubbleAt`), `requestAnimationFrame` loop.

### 4.3 Game rules already in place

- **Day start:** the five-minute clean at home's cleaning cupboard, every day, before any work quest (boss-mode rule).
- **Quest card:** label shows building + spot; "Walk to the …" auto-walks the whole route; on arrival: tiny first step → "First step done" starts the time box → "Quest done". "I'm procrastinating" offers a 5-minute deal, a wet-wipe reset or a basics check; a second stall asks unclear / too big / don't want to.
- **Breaks:** 10 minutes after every quest except straight after the clean. Maple naps. "I'm in flow" skips once.
- **Meetings** (`meeting: true`) send her to chat for the decompress routine.
- **Trackers:** water (8 boxes; first 4 earn a coin; the well also adds water), steps (5 boxes, one per 1,000; 2 coins per 1,000).
- **Lunch nudge** ~10:45–11:30 and **water nudge** ~1–2:30pm, once each.
- **Coins:** clean +3, quest +5, proper break +2, water +1 (max 4/day), steps +2 per 1,000. Coins persist.
- **Market:** only usable inside the market. Tabs: Seeds, Treats, Care (tools are bought once), Sell (produce).
- **Garden:** plant → water → grows in real time → harvest. Finished quests take 30 minutes off every growing crop. Welcome gift: 2 tulip seeds + 1 carrot seed.
- **Friendship:** never goes down. +5 per active day, +1 per care action (tools, free play and hide-and-seek have cooldowns so it can't be farmed). Levels unlock den décor in Maple's portrait: scarf, plant, fairy lights, bunting.
- **No guilt mechanics.** Maple never gets sad, hungry or sick. Slow days just mean fewer treats.

### 4.4 Chat ↔ page data contract

Chat (the playable-boss skill) writes `data/users/me/plan` with the Artifact tool's `write_db` at kick-off and whenever the plan changes:

```json
{
  "day": "2026-10-05",
  "tasks": [
    {
      "id": "sunsama-task-id",
      "title": "Fix Chord onboarding flow",
      "firstStep": "Open the onboarding screen in the browser",
      "minutes": 25,
      "pep": "This is the bit new creatives see first. Make it lovely.",
      "treadmill": false,
      "meeting": false,
      "chat": false,
      "at": "3:00 pm",
      "place": "chord",
      "spot": "bench"
    }
  ]
}
```

- `day` is the Singapore date, but before 2am it's the previous date.
- `place`: `hall | chord | fresh | chico | post | home`. `spot`: see the station list in the skill (and `ROOMS` in the code).
- Chat reads `today` (`doneIds`, `steps`, `water`, `cleanDone`) so it never re-hands a finished task, and folds it into the end-of-day recap. Chat never writes `today` or `fox`.

### 4.5 Design system

- **Type:** Klee One (600) for headings, speech bubbles, timers, pep lines and map labels. Mulish (400/600/700) for everything else. Small uppercase tracked labels (`.eyebrow`, `.lbl`) are Mel's own style; keep them.
- **Palette (light):** background `#F2EEE7`, card `#F9F7F2`, ink `#2F2B28`, soft `#8A8279`, navy `#2F3B73`. Tape colours: periwinkle `#C3CDEE`, butter `#F6E3A1`, blush `#F4C7CF` (text `#C2505F`), oat `#EAE3D8`, peach `#F5C3A4`, sage `#B9D2A6`, sky `#BFD6E6`. Fox orange `#EE8B3A`. Dark mode tokens exist and must keep working.
- **Buttons:** torn tape strips via `clip-path`, slight rotation. Periwinkle with a navy dot = main action; butter = finishing; oat = soft options; blush = destructive.
- **Washi:** translucent strips with torn edges on every card: peach solid, periwinkle dots, sage stripes, pale blue.
- **Art:** everything original, drawn in SVG with ink outlines (`#wob`) and marker fills (`#marker`). Nothing copied from Stardew Valley, Potion Permit or the reference image.
- **Layout:** generous whitespace; phone-first with tap-to-walk; desktop two columns with arrow/WASD.

### 4.6 Known issues / rough edges

- Interiors feel sparse; furniture labels and the speech bubble crowd the map on small phones.
- The map is a fixed 520×640 scene scaled to width; characters are small on phones. A camera/zoom may help as the world grows.
- Walking is straight-line (no collision); characters can cross buildings.
- One large file is getting hard to maintain; see 8.1.

## 5. Mel's preferences worth knowing

- Warm, direct coaching. Short sentences. Never guilt. One clear action and one check-in per message.
- She prices on value delivered; any pricing-related task should get that reminder (already in the skill).
- She works roughly 8am–6pm Singapore time; Evan's care shapes some days.
- She likes cosy games (Stardew Valley, Potion Permit), Tokyu Hands stationery aesthetics, bullet journals.

## 6. Skills

- **boss-mode** stays as her plain daily boss.
- **playable-boss** is the same coaching plus the village. It loads the plan, opens the page, keeps ids stable, rewrites the plan after reshuffles and reads the page's progress. Install it as a separate skill.

## 7. What Mel asked for next (spec)

### 7.1 Village NPCs

Light-touch characters she says hi to and chats with occasionally. Each has a backstory, a job and a daily routine (positions by time of day, Singapore time). Tap → a short line; a rotating pool of lines, sometimes reacting to her day (e.g. after three quests, after a harvest). Suggested cast, all original:

| NPC | Job + where | Backstory | Routine |
|---|---|---|---|
| **Hana** | Runs the market | Moved from a seaside town; bakes the honey toast; remembers everyone's usual. | Opens the stall 8am, lunch rush 12–1, restocks 3pm, closes 7pm (the market could show a "back soon" sign outside hours — check with Mel first; she wants the shop to stay reachable). |
| **Mr Okada** | Retired postmaster, unofficial well-keeper | Delivered letters for 40 years; still can't stop sorting things. | Mornings at the post office steps, afternoons by the well, evenings feeding pond ducks. |
| **Juniper** | Librarian at the Fresh Pages library | Loves semicolons; secretly writes poetry; recommends one book a week. | Opens the library 8:30, reading hour in the nook after lunch, shelves books at 4. |
| **Bo** | Carpenter at the Chord workshop | Builds and fixes everything in town; hums while he works. | Workbench mornings, odd jobs around the village in the afternoon. |
| **Auntie Lin** | Gardener | Has opinions about soil; gives seed tips and the occasional free seed. | Garden at dawn and late afternoon, pond bench midday. |
| **Pip** | A kid on a bike | Evan's best friend; races him around the square. | Plays near the square and pond after 3pm. |
| **Theo** | Town hall clerk | Keeps the village records; very proud of his stamp collection. | At his desk in the town hall 9–5, lunch on the pond bench. |

### 7.2 Agent NPCs (her real automations as characters)

Mel's skills and agents run through her day (8am–6pm). Each becomes an NPC who appears at the right time, walks or runs to her character, and delivers a note. Tapping the note opens the notebook overlay (7.4) with the content.

| NPC idea | Represents | When | Delivers |
|---|---|---|---|
| Town crier | morning-briefing | ~8am | The day's briefing summary |
| Librarian's runner | book-digest | ~7:30am | Today's book digest link |
| Postie | inbox-triage, leads-inbox-scan | Morning + after lunch | Inbox summary, new leads, drafts waiting for approval |
| Chord agent | Chord product agent | During the day | Chord updates / what it did |
| Chico agent | Chico product agent | During the day | Chico updates |
| Content planner | Ambidextrous blog + IG planning | When run | Content plan or drafts to review |
| Tender scout | gebiz-opportunity-scout | Weekly | Matching tenders |
| Garden courier | sunsama-tidy, client-health-check | When run | Tidy summary / clients needing attention |
| Wind-down messenger | evening-wind-down | ~6pm | Runs to her with a note to close the day |

**How it would work:** the page can't run her agents. Each skill would gain a final step that posts a short note to the page's database (e.g. collection `data/users/me/mail`, docs like `{from, title, body, link, at, read}`); the page watches that collection and plays the delivery. Open questions: whether scheduled tasks in Cowork can reach the Artifact tool's `write_db` (verify), and which agents Mel actually runs outside chat.

### 7.3 User-count gardens

The gardens outside Chico cottage and the Chord workshop grow with real user numbers: e.g. one flower per N users, bigger blooms or new plant types at milestones, a little sign with the count. Needs a data source: Chord's and Chico's user counts are not in the current connectors as far as I know. Options: chat writes a `stats` doc when Mel shares numbers or when an admin endpoint/connector exists; or the page reads it via the `mcp` capability if a connector exposes it.

### 7.4 "Do task" notebook overlay

When her character is at a quest's spot, the quest pops up with a **Do task** button. Tapping it opens a large overlay that fills most of the screen and looks like a notebook page (or a page torn from one, washi-taped down). It shows the task's Sunsama notes/instructions (add `notes` to the plan schema; chat copies them from Sunsama).

The note is interactive, like Maple: progress buttons such as **Started**, **Halfway**, **Stuck**, **Need more time**, **Done**, which update the quest state and get a response. Option to "talk to the note" in free text using the `sample` capability (Claude answers inside the page; viewer's usage, consent prompt on first use). The timer stays visible on the page. Agent NPC notes reuse this overlay.

### 7.5 Treadmill quests

Quests with `treadmill: true` get a "Do it on the treadmill" option: a treadmill station at home (or a walking trail looping the village) where her character walks for the time box. Afterwards: "Steps showing?" → steps tracker. Keep the boss-mode rule that the treadmill is an offer, never an instruction.

### 7.6 Email quests

Email work happens at the post office counter. The notebook overlay shows the context (who, what, draft if chat prepared one) and a link out to Gmail (test whether external links open from the artifact viewer). The postie NPC delivers inbox-triage results. The page shouldn't send email itself; drafting and sending stay with chat/Gmail.

### 7.7 Speech bubble

Fixed in the latest build: when Maple is next to Mel, the bubble lifts above Mel's head instead of covering her face. Recheck on small phones.

## 8. Suggested next steps in Claude Code

1. **Split the single file into a small project** (e.g. Vite, plain modules): `data/` (places, rooms, items, NPCs), `art/` (SVG builders), `game/` (state, quests, farm, routes), `ui/` (cards, overlay), plus a build step that inlines everything back into **one self-contained HTML** for publishing as the artifact.
2. **Write a tiny local stub** of `window.claude.use()` (db in memory or localStorage, `sample` returning canned text) so it runs in a normal browser for development.
3. **Build 7.4 (notebook overlay) first.** It's the core of "doing" a task and it's reused by agent NPCs.
4. Then NPCs (7.1), treadmill/email (7.5–7.6), agent NPC mail (7.2), user-count gardens (7.3).
5. Stage 3 ideas still open from earlier: decorating her house, outfits for her character, building upgrades as the businesses grow, weekly story chapters from her Notion week theme, "grumpy critters" for procrastinated tasks, seasons and festivals.
6. Bring the built HTML back to claude.ai and publish to the same link so her progress (db) and the chat integration carry on.

## 9. Progress in Claude Code (4 Oct 2026)

Done, in `maple-village/` (see `README.md` for how to run and publish):

- **8.1 split + build:** ES modules under `src/`, `build.mjs` inlines everything into `dist/maple-village.html`. The original single file is kept in `legacy/`.
- **8.2 dev stub:** `dev/claude-stub.js` (db in localStorage, canned `sample`, `?seed`, `?time`, `?reset`).
- **7.4 notebook overlay:** the **Do task** chip on the map and button on the quest card open a washi-taped notebook page with the Sunsama `notes`, first step, pep line, live timer, Maple's latest line (and her procrastination options), plus Started / Halfway / Stuck / Need more time / Done and "talk to the note" (`sample`, quick tier, no memory beyond the page).
- **7.1 villagers:** Hana, Mr Okada, Juniper, Bo, Auntie Lin, Pip and Theo follow Singapore-time routines across the village and interiors. Tap for an intro on first meeting, then lines and once-a-day reactions (three quests done, a harvest, an email quest, lunch time…). Auntie Lin gives a free seed packet. Pip races Evan to the pond.
- **7.5 treadmill:** a treadmill station at home. Treadmill quests offer "Do it on the treadmill" in the notebook, Mel walks in place during the time box, then a "Log my steps" prompt.
- **7.6 email quests:** `email: {who, subject, draft, link}` on a task shows an email block with "Open in Gmail ↗" and "Copy draft". Nothing is sent from the page.
- **7.2 agent NPCs:** new `mail` doc. Unread notes (under 36h old) are carried by a messenger who runs to Mel's character. Tap them to open the note in the notebook. A Letters card keeps the last 20.
- **7.3 user-count gardens:** new `stats` doc. One flower per 10 users outside Chord and Chico, with blooms that step up at 100 and 250 users, a blossom tree at 500 and sparkles at 1,000.
- `test/smoke.mjs` plays the day loop headlessly on phone and desktop.

Round 2 (same day):
- Each work building has its own architecture: civic town hall with clock tower and columns, barn-style Chord workshop, Fresh Pages library with a round tower, rounded Chico cottage, flat-roofed post office. Home keeps the classic cottage.
- Each interior has its own floor, walls, decor and furniture layout (`art/interiors.js`, `ROOMS[id].pos`).
- Morning briefing notes from the crier render as *The Morning Crier* village paper (`sections` on mail items).
- Juniper's digest shelf in the library: book digests from a new `library` doc, one an hour or one per quest done, with a "Read before" list and a Claude-picked fallback when the shelf is empty.

Round 3: everything happens on the map, no scrolling (Mel's principle: if possible, things open inside the game).
- Trackers sit in a strip above the map. The page is sized so the whole game fits the screen.
- The quest card is now a washi-taped note pinned on the map. It folds to one line while walking or when tapped away, re-opens when the quest step changes, and docks on the opposite half from Mel.
- Quest board = a cork board with pinned notes; shop, garden plot, digest shelf, backpack (with Maple) and letters all open as panels over the map. HUD buttons: 📋 quests, 🎒 backpack, ✉️ letters (with counts).

Round 4:
- No emoji anywhere: a hand-drawn icon set (`art/icons.js`, ink + marker like the map) for the corner icons, trackers, coins, shop and backpack items, seed packets, place markers, stickers, floating hearts/coins and the garden. Game speech strips any stray emoji (`plain()`); Mel's own Sunsama text is left alone.
- Phone: the map fills the screen; scene name, coins and four corner icons (quest board, backpack, friendship, letters) float top-right, trackers in a strip under them. A camera pans left/right to follow Mel.
- The open quest note fills the map (Mel's choice). Timers show for the clean, the time box, the 5-minute deal, breaks, and a new 30-second clench in the decompress note.
- Any quest can be picked any time: tap its note on the cork board ("do this now"). Boss mode still hands out one at a time.
- The morning briefing prints as *The Morning Crier*: masthead, volume line, headline, lede, a front-page story and two columns.

Round 5:
- Treadmill tasks (title has 🚶 or "treadmill") are assigned straight to the treadmill at home; "walk" tasks keep the offer.
- Water and steps are thin drawn progress bars. Tapping one opens a small notebook page: water in ml (+glass / +bottle / +big bottle, or type the total; goal 2 L), steps typed from the watch (goal 5,000).

Round 6:
- Phone camera pans with a GPU transform (no more flicker), folded quest tab moved to the bottom-left corner.
- Published to the live link (https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4) with capabilities db, user, sample, mcp (Sunsama read_resource). Mel's garden and friendship carried over.
- Routine "Village quest loader" (daily 7:24am SGT) loads the plan from Sunsama + Calendar.

Round 7:
- Phone: a zoom button toggles between following Mel and seeing the whole map at once (remembered per device).
- Water and steps are vertical drawn bars in a column on the right of the map.
- The quest note starts folded when the village opens.
- Sunsama completions count: tasks ticked off in Sunsama (by Mel or chat) are marked done in the village with coins, checked on open, on tab return and every 10 minutes.
- Village upgrades (`art/village-extras.js`): nine permanent decorations unlocked by lifetime quests (3, 8, 15, 25, 40, 60, 85, 120, 160). Listed in the friendship panel.
- Festivals and weather: New Year, Chinese New Year, National Day, Mid-Autumn, Deepavali, Christmas (lunar dates in a table to check yearly), wet-season rain Nov–Jan on roughly a third of days.
- Home decor: a Home tab at the market (wallpapers, rugs, lamp, plant, painting, Maple's bed) drawn inside the house.
- Friday weekend edition of The Morning Crier, built from a 21-day history the page keeps (quests, steps, water, harvests, coins, villagers chatted with, upgrades, festival coming up).
- 6pm wind-down: the evening messenger brings a note; "Walk to the pond" floats a lantern per win while Maple reads them out, then hands over to chat's wind-down.

Round 8:
- Calendar corner icon: today's events from Mel's three Google calendars (`game/calendar.js`, mcp `list_events`).
- Settings corner icon: rename Maple, music on/off + volume, sound effects on/off (per device).
- Sound (`game/audio.js`, all synthesised): an original calm piano loop in F major, paper rustle on notes, Maple purrs, villagers babble hello, cha-ching on a finished quest.

Round 9:
- Notebook action buttons are smaller (`.nbactions .btn`).
- Two outdoor screens joined by a river (`OUTDOOR`, `BRIDGES`, `ARRIVE` in `data/world.js`):
  - **Home base** (`base`, `baseArt()`): the house, the fenced garden (into the farm), the pond (wind-down lanterns, blossom upgrade), Darren's shed, Evan's tree swing, a firepit and a washing line. The day starts here.
  - **Town square** (`village`): the five work buildings, market, well, quest board and a riverside bench.
  - Walking anywhere routes out of the building, over the bridge if needed, and in at the door (`go()`). A third screen (e.g. Luna) is one more `OUTDOOR` entry plus a bridge pair.
- Darren, a new NPC who stays at home base: grey tee, jeans, black hair, a touch taller than Mel. Weekdays he waters the garden (7–8:30), types at his home office desk (8:30–12:30, 13:30–17:30), fixes the house at lunch, tends the farm after work; weekends are mostly outdoors. Slots take `{days, act, dir}`; `act` adds a prop (can, hammer, hoe) or the typing animation and its own lines.
- Town folk moved: Bo and Theo lunch on the riverside bench, Okada's evening spot is the bench, Auntie Lin feeds the ducks at the home pond at midday, Pip plays with Evan at home base after 3pm.
- User-count gardens use the stats doc's `label` ("9 studios", "47 families").

Not done yet: stage 3 ideas (8.5), collision-aware walking.
