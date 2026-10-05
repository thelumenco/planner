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

Round 10:
- Sound on iPhone: audio now starts on touchend/click (Safari ignores pointerdown), keeps retrying on each tap until running, plays a silent buffer inside the gesture and sets `navigator.audioSession.type = "playback"` so it isn't muted by the silent switch where supported. Settings has a "Play a test sound" button.
- Timers can be paused, resumed and restarted (round buttons next to the time, in the quest note and the notebook). `S.timer.pausedLeft` holds the remaining time while paused.
- Slimmer tracker column on the map.
- The Morning Crier is delivered to a letterbox at home base (a paper and a raised flag show while it's unread; tap to read). If Mel walks into town without reading it, Rosa the crier finds her there. Other messengers deliver wherever Mel is.

Round 11:
- Weekend mode and outdoor quests (`data/world.js`): personal outdoor tasks become quests at home base spots, any day: Evan outings and playdates at the swing, garden and repair jobs at the shed, walks and fresh air by the pond (`BASE_SPOTS`, place `"base"`, or set `place: "base", spot: "swing|shed|pond"` in the plan). On Saturdays and Sundays anything without a work hint goes home instead of the post office. Work tasks keep their town buildings on weekends; the town stays open.
- Darren's shed sells garden tools, bought once: big watering can (waters every thirsty plot at once), compost bin (crops grow 25% faster), sprinkler (new seeds water themselves). Stored in `F.tools`; owned tools appear at home base.
- Evening at home base, 7pm to 6am: the light drops (multiply tint), windows and the shed glow, the firepit is lit, stars over the river.
- Walking around things outdoors (`game/paths.js`): blocked rectangles per outdoor scene, A* over a 24px grid, route pulled tight. Arrow keys slide along walls.

Round 12:
- Family tab at the market. Little gifts (ice cream, red balloon, bubble wand, storybook for Evan; kopi, kaya toast, curry puff for Darren) go in the backpack and are handed over in person: Evan whenever he's around, Darren wherever his routine has him (the page says where). Every third gift they give something back (a tulip from Evan, strawberry seeds from Darren). Keepsakes, bought once: a sandpit at home base (Evan plays in it), a toy truck Evan carries, headphones Darren wears at his desk, a hammock by the pond where Darren rests 7:30-9:30pm. State in `F.fam = {owned, gifts}`; what Evan holds is drawn into his sprite (`#evanHold`).
- Fixes: the chimney sits on the roof; the washing line moved out from under the folded quest tab; market cards use a flex column (Safari overlapped grid buttons); the tab row wraps and the map can no longer be scrolled sideways by a tap.

Round 13 (routines → village):
- Cloud routines now post to the village as their last step: Daily evening wind down (from "winddown", 5:30pm; the page skips its own 6pm note that day and the note offers the pond walk), Daily Book Digest (Juniper's shelf, `library` doc), Daily Sunsama tidy (from "courier").
- Mac-bound tasks (Daily morning briefing, both inbox triages, GeBIZ scout) need the step pasted in the Claude desktop app: see ROUTINE-STEPS.md.

Round 14 (Hestia at home, `game/hestia.js`):
- Mel's household app (Hestia, codename mise) rebuilt in the house, same data shape so a Hestia export imports straight in (Settings > Import from Hestia). Stored in the per-user `hestia` doc; chat and routines don't write it.
- The cleaning cupboard opens the chores: Daily (with morning/evening tags), Weekly (weekday badges, Sunday-start week), This week's zone (5 default zones, "Move on to …" rotates and clears ticks), add/remove chores, a tidy timer (10/20/30 min, singing-bowl chime every 5 minutes, minutes logged) and "One at a time" focus cards (Done/Skip). Each chore pays 1 coin once per period; a home streak counts active days.
- The fridge (new, by the kitchen) holds the pantry: what we have by category, untick when it runs out to put it on the shopping list, shopping list filtered by where to buy, copy list, add items.
- Not quests. A hearth badge sits on the house at home base (chores due today + shopping), and on the cupboard and fridge inside. During the morning clean the first cupboard visit is still the wet wipe.
- Furniture: tall pieces stand against the back wall in every building.
- Other: drop a quest "not today" (and bring it back), newspaper name in Settings, forgiving taps on villagers, lanterns per routine win.

Round 15 (talk to Maple):
- A round chat button on the map opens a chat with Maple (the `sample` capability, quick tier, JSON reply). She answers in a line or two and returns actions the page runs straight away: shopping_add, restocked, chore_add, chore_done, tidy_timer, break/back, quest_add/drop/next, water, steps, go (walk somewhere), open (panel or fridge/cupboard), pet. Each action that ran shows as a green chip under her reply. Context sent: time, scene, phase, quests left, timer, water, steps, coins, and a Hestia summary. Chat history (last 30) is kept per device. A break she starts now takes priority over the morning clean.
- Polish: home furniture along the walls, names on speech bubbles, gift thank-yous with hearts, broom badge for chores, unticking a chore takes the coin back, a soft single chime, smaller town labels, swaying washing, messengers wait outside the house.

Round 16 (post box):
- A post box (pigeonholes, against the back wall) in the post office lists unread Primary mail from the Gmail connector (`game/postbox.js`, `search_threads`, `is:unread in:inbox category:primary`, read-only). The connector is Mel's work inbox. Each row opens the thread in Gmail; "Check again" refreshes. Filled pigeonholes show how many are waiting. Manifest now: Sunsama MCP read_resource, Google Calendar list_events, Gmail search_threads, plus sample, db, user.

Round 17 (reports from other routines, `game/feeds.js`):
- `health-chord` / `health-chico` docs (written by the nightly bug checks): a standing health sign in the Chord workshop and Chico cottage (three lights, status word; tap for each check and a link to the founder room) and a light on each building in the town square. Older than 36 h is flagged as stale.
- `content-chord` / `content-ambidextrous` docs (written by the content calendars): the calendar panel has Today and Content tabs; Content lists the next 14 days, both brands or one, view-only.
- Paste-in steps for those four routines: ROUTINE-STEPS.md sections 6-9. Those routines aren't reachable from Claude Code (likely local desktop tasks), so a cloud routine "Village feeds" (trig_01FNvkV73ExnoXTpVsTYT6Bv, 7:05am SGT daily) reads the Chord Founder Room / Chico Founder Desk (embedded `health-data` JSON) and the content planner artifacts, and writes the four docs (plus stats user counts).

Round 18 (good news):
- A Good News board in the town square (sparkles when there's a fresh pin-up). Tap for "Your wins" (the page's own: quests today and yesterday, streak, harvests, green health checks, user counts, plus the routine's) and "In the world" (3-5 real uplifting stories with links). Routine "Village good news (daily)" (trig_01LPCGof2eTZu2Q6NwbooC3s, 7:12am SGT) searches the web and reads the founder pages, then writes the `goodnews` doc.

Round 19 (Makers' Lane, a third screen):
- `lane` joins OUTDOOR: Chord workshop and Chico cottage moved off the town square to Makers' Lane (through a gate on the town's east edge), with their flower gardens, health lights, the Chord flag and Chico arch upgrades, and two fenced "coming soon" plots for the next apps (Luna, Ohayo). Screens chain base - village - lane; `nextHop()` routes through as many bridges/gates as needed, and `ARRIVE` is keyed "from>to". The town square keeps the hall, library, post office, market, well, boards and the bridge home.

Not done yet: stage 3 ideas (8.5); villagers and Evan still walk in straight lines; Hestia's custom lists, rhythm notes, equipment/energy filters and reminders weren't carried over.

## Round 20: town square rebalance
- With Chord and Chico gone to Makers' Lane, the square leaned right. Fresh Pages library moved to the west (door [85,272]), the good news board to the south-west (door [90,488]), and the bench upgrade follows the library.
- The Makers' Lane gate moved up to the north-east (door [444,218]; arrival from the lane at [426,238]). It stays clear of the phone's right-edge trackers.
- Note: `node build.mjs --dev` starts a server and never exits; use `--dev --once` for a one-off build.

## Round 21: animals and Pancake
- **Animal run** at home base, bottom left by the garden (`src/game/pets.js`, place `run`, door [198,566]). State lives in `F.pets = {run, animals:[{id, kind, name, feeds, fedDay, col}], next}` inside the fox doc.
  - Market tab "Animals": chick 12, bunny 18 (straight to the run, random cute name), chick feed 2, rabbit pellets 2 (one meal each). Bunnies also eat garden carrots.
  - Each animal eats once a day. 3 meals: chick to hen, bunny to rabbit. A fed hen lays an egg into the backpack (sells for 5, or feed it to Maple). Nobody gets ill or leaves.
  - Run upgrades from the run panel: Little run (2) → Bigger run 35 (4) → Coop and hutch 70 (6) → Clover meadow 120 (8; a meal lasts two days).
  - Maple nudges once a day on reaching home base if anyone is hungry; Evan sometimes visits the run. Chat can `go` to the "animal run" and `feed_animals`.
- **Pancake**, the village dog, at the good news board: sits up and wags when fresh news is pinned, naps otherwise.
- Good news routine (cloud, trig_01LPCGof2eTZu2Q6NwbooC3s) now asks for 5 stories, at least 2 small human-interest ones (animals, kindness, quirky local stories).

## Round 22: saving fix, tomorrow's quests, wardrobe
- **Saving (bug: a harvest vanished after a refresh).** Two causes fixed in `core.js` (fox/today docs) and `hestia.js`:
  - Nothing is pushed to the cloud until a definitive (not `fromCache`) snapshot has loaded; on that first load the cloud wins unless this browser's copy, as loaded at open (`loadedAt`), is newer.
  - Before each push the page `get()`s the doc: if its `updatedAt` is newer than the newest copy this page has seen (`seen`), another device saved since, so the page adopts that instead of overwriting (a stale background tab used to clobber the phone's progress). The 10-minute Sunsama check no longer saves when nothing changed. Pending saves flush on pagehide / hidden.
  - Tests: "saving" section (fresh browser + slow db via `?dblag=`; stale page vs another device's save). The stale test fails on the old code.
- **Tomorrow's quests:** "Peek at tomorrow's quests" on the quest list pulls `sunsama://tasks/<tomorrow>`; "do today" adds one to today (`early` = its day). Finishing it records `F.early[id] = day`, so on that day it's already ticked (no second coins). Sunsama itself isn't changed; Maple reminds Mel to tick it there.
- **Wardrobe** at home (left of the sofa, which moved right to C:[168,420]; wardrobe W:[52,352]). Reads doc `outfit` {day, weather, on, options[3], wardrobe{lists}}. "New outfit" uses `sample` with the style rules and the wardrobe list; extras live in `F.outfits` for the day.
  - The wardrobe list was seeded once from the Notion Wardrobe doc. Daily outfits come from the Mac morning briefing (ROUTINE-STEPS step 10): cloud routines can't attach connectors for this org, so a cloud stylist routine couldn't read Notion or Calendar.
- Tap a speech bubble to close it; "coming soon" signs fit their text; market cards are a wrapping flex row (Safari stacked grid cards); animals roam their run.

## Round 23: Mel's room, scratchpad, plans, walking round buildings
- **Mel's room** (`ROOMS.room`, scene "room"): through the west door of the house (`mydoor` station, R:[40,330]). `INNER` in world.js makes it an inner room: `outdoorOf("room") = "base"`, `go()` routes out through its east door (x 486) and in through the house's west door. No quest board, no NPCs, no couriers; Evan stays out.
  - Furniture against the walls: bed (nap 20 min or lie down; Mel shows in the bed, room dims, any tap wakes her), window with curtains (auto shut at dusk or while asleep, or toggled), wardrobe (moved here from the house), record player (toggles music), calm corner (guided breathing 1/3/5 min with a 4-2-6 s breathing ring, or decompress any time: `S.decompFree` returns to the previous mode and points to the journal), writing desk (journal).
  - Maple's bed is always here; she walks to it and sleeps while Mel's in the room.
  - Market tab "Me & my room" (DECOR with `tab:"me"`): room decor (`r_*`) and things Mel wears (`me_bow`, `me_scarf`, `me_hat` outdoors, `me_pj` in her room), drawn on her sprite (#melBow etc. in index.html).
- **Journal** and **scratchpad** (`myroom.js`): their own private docs "journal" (entries merged by id; deletes kept as markers) and "scratch" (saves ~1 s after typing). The town hall whiteboard opens the scratchpad unless Mel is arriving there for a quest.
- **Wardrobe drawings** (`art/garments.js`): a shape per slot and keyword, tinted by colour words. "New outfit" now sends the fuller style profile, today's calendar (page's Google Calendar) and the morning weather when there is one.
- **Plans** (`plans.js`): Maple's chat reads the Notion "Plans" database (data source `collection://ccad9e3d-…`) through the page's mcp: this week's page every chat, plus this month's and quarter's when the message is about plans. Titles: "Week of 5 Oct 2026", "October 2026", "Q4 2026". Capability adds `Notion: notion-search, notion-fetch`.
- **Walking**: villagers, messengers and Evan follow route-finder waypoints outdoors (`route()`/`walk()` in npcs.js, `evanWalk()` in core). Wander points inside obstacles are skipped; messengers stand on a clear side of Mel. Test samples NPC positions in the square.
- Recap: ticked checkboxes instead of ×, "The day is done". The bujo lists no longer use a 2-column grid (highlighted words were landing in the bullet column).

## Round 24: records, undo, frozen snapshots, ducks
- **Record player** opens a crate of records (`TRACKS` in audio.js): Morning piano, Rainy window, Music box (waltz), Sunday stroll, Night lights, and Rain on the roof (filtered noise + drips). All composed live with Web Audio; the choice is per device (`settings.track`). Volume slider and "Lift the needle".
- **Chores not ticking (bug)**: the real db hands out frozen snapshot data; Hestia adopted it with a shallow copy, so the next tick threw. Every snapshot is now deep-copied before use, and the dev stub freezes snapshots like the real db so tests catch this. Test: reload with a cloud copy, tick, still ticked.
- **Undo for every delete** (`undoable(msg, restore)` in core, a bar at the bottom for 7 s): Hestia chores and pantry items, dropping a quest, tearing out a journal page, wiping the scratchpad. Journal entries: the newest change wins on merge, so an undo beats the tear-out marker.
- Wardrobe keeps only the latest two extra picks; all picks clear each day.
- Curtains sway from the rod; a duck family swims along the river on home base and the town square every ~2 minutes, under the bridges.

## Round 25: client table in the town hall
- The client table moved from the Fresh Pages library to the town hall (`clients` station, E:[118,474]); the playable-boss skill's spot list is updated.
- `clients.js`: a live snapshot from Mel's Chord connector through the page's mcp (studio_overview, list_projects active, needs_attention; 5-minute connector cache, Refresh forces fresh): counts, active projects with progress, attention items, next booking. Nothing from Chord is stored in the db.
- Chat about clients: `sample` with the snapshot in the prompt and page tools (when the view supports them) that call Chord get_project, list_upcoming and list_clients. The chat log lives in the page view only.
- Capability adds `Chord: studio_overview, list_projects, needs_attention, get_project, list_upcoming, list_clients` (all read-only). The dev stub fakes Chord with `?chord=1`.

## Round 26: planning table, revenue chart
- **Planning table** moved to the right wall of the town hall (C:[420,474]). `planning.js`: three cards from the Notion Plans pages (this week, month, quarter, via plans.js, now also returning theme/period/url). The week card shows its objectives open, today's slice of "Day by day" pulled out, and the rest folded. A planning chat sees all three plans plus today's quests and calendar. Fridays show a CEO-debrief nudge.
- **Revenue chart** replaces the phone booth (`revenue` station, chart on an easel). `revenue.js`: Chord `list_invoices` (paid, grouped by paid month, last six months; "Internal" excluded; unpaid list), `list_retainers` (monthly_total). Hero number for this month against `F.revTarget` (Mel sets it), a single-series bar chart (validated #4E9A4A, rounded data ends, target as a dashed line, hover titles, a "See the numbers" table), what's still owed.
- Calls and meetings no longer have a booth; they fall back to another spot in the hall. Skill spot list updated (`revenue`).
- Capability adds Chord `list_invoices`, `list_retainers`.

## Round 27: emotion jars, planning fixes
- **Emotion jars** (`jars.js`): an emotion shelf at the bottom centre of Mel's room (J:[260,594]), drawn with tiny jars showing their colours. "Make a jar": up to 10 blobs from up to 4 feelings (10 built in, plus custom feelings with a curated colour), "undo last blob", an optional note (280 chars). Shelf view: two rows of five; a jar opens its note, "Send to my journal" (journal page with a polaroid of the jar redrawn from its blobs; the jar empties) or "Empty this jar" (both with Undo). Full shelf: Make a jar asks to empty or send one first. Private doc "jars" (merged by id, newest change wins). No coins; Maple reacts to the mix but never reads notes.
  - Colours validated with the dataviz script: every pair distinct for normal vision (all-pairs). Blobs are soft (halo, body, faint shade, highlight): no outline and no symbols, per Mel. Names always show on the picker buttons.
- **Planning table**: Notion tables render as tables (`tableHTML` in planning.js; other tags are dropped), cards can't widen the panel, and the table is now a long desk with a planner and a vase of flowers (`plantable`).
- Safari/WebKit fixes (the Mac app): finished cork-board notes fade by colour instead of `opacity` (an opacity layer over a rotated note with filtered SVG icons painted over the text), cork-note icons drop their SVG filters, and Pancake plus the bed's "z z" no longer put text inside a filtered group (WebKit painted a copy of the board there). WebKit isn't installed in this container, so these were fixed from the screenshots, not reproduced.

### Round 28: dark mode and quiet evenings
- Custom feelings wait for a name and a colour (no default colour) and never drop a blob in by themselves. The jar maker says why feelings are greyed out (4 feelings max, or the jar is full).
- Dark mode: speech bubbles stay cream with dark ink (`.speech` redefines the colour tokens locally). Place-name labels are dark ink on cream or pastel tape. The filing cabinet, cupboard and shop counter use fixed light fills. The `.next` pill buttons (e.g. "reread") use fixed navy text.
- Street lamps (`streetLamp` in village-extras.js) around the town square, Makers' Lane and home. Their warm glow (`.lglow`, `#lampg` gradient) shows only in dark mode, with a gentle flicker (off under reduced motion).
- Quiet evenings (Settings, on by default, `F.quietEvening`): once the lantern wind-down has finished and no quests remain, Maple, neighbours, couriers and Evan only speak in answer to a tap (input within 1.5 s).

### Round 29: reminders, quieter village
- **Reminders** (`reminders.js`): the chat action `{"type":"remind","text","minutes"|"at","date"?}` creates a 10-minute event, "Reminder: …", on Mel's Personal Google Calendar. It has a popup alert at 0 minutes and is marked free, so her phone's Calendar app pings her even when the village is closed. Times are worked out on the page, never trusted from the model. Reminders are kept in `F.reminders`, listed in the calendar panel, and can be cancelled there (`delete_event`, with Undo creating the event again). If the page is open when one comes due, Maple chimes and says it, even in quiet mode. Manifest adds Google Calendar `create_event` and `delete_event`. The create_event result shape is unverified: the event id is read from `payload.id` / `eventId` / `event.id`, and without an id Cancel only marks the reminder locally.
- **Quiet mode is wider:** whenever no quests are active (not only after wind-down), nobody speaks unprompted and Maple's bubble tucks away after 6 s. The exceptions are the lantern show, a running timer and decompress. The Settings label is "Peace and quiet".
- Panels redefine the light-theme colour tokens and `color-scheme: light`, so typed text and inputs stay dark ink in dark mode.
- Pond lanterns glow in dark mode. The street lamps by the quest board were removed (too many there).

### Round 30: Evan's room, bedtime, hugs
- **Evan's room** (`kidroom`, an `INNER` room of home whose door is on the east wall; `INNER` entries now carry `exit` for their own door). Its door is the `kiddoor` station at home slot K [480,330]. To make room, Darren's desk moved to G [436,448] and the laundry to D [350,556].
- Inside, Evan is the one who moves: `kidTap` in core.js; Mel waits by the door; Maple stays outside (hidden; `speak()` is silent in there). The camera follows Evan. `body.kidmode` hides the HUD, chat, notebook, trackers, zoom and undo bar.
- Leaving takes a press-and-hold of 1.3 s on the west door (`.kidexit` with a ring). A plain tap only shows a hint.
- Stations: car bed (sleep; a tap wakes him), snack cupboard (milk, juice, apple chips, watermelon, goldfish crackers, all free; Evan munches with a snack bubble), and four toddler games in `kid.js`: dino eggs, train, cars and balloons, each with big targets and no reading or losing.
- Nothing in there saves or earns: kid state is memory-only. `ctx()` skips re-rendering a game in progress so background refreshes don't restart it.
- New sound effects in audio.js: pop, crack, roar, whistle, choo, vroom, honk, crunch, slurp, yay.
- **Bedtime:** 8pm to 7am (`evanNight()`), Evan isn't at home base or in the house; in his room he's asleep in the car bed and a tap gets "shh… sleeping".
- **Hugs:** every 4–8 minutes (the first after 1–2.5) Evan runs to Mel with his arms up ("hug?"). Tapping him means `hugBack()` (Mel's arms, hearts, a `#melSay` bubble); after 6 s without a tap Mel gives a little "aww". `?hugsoon` makes the first hug come in 3 s, for tests.

### Round 31: home desk, reward placement, Evan's door
- **Home desk** (`desk.js`): tapping the home desk (when it isn't a quest arrival) opens a panel with three tabs. Today is Google Calendar. Work inbox is the Gmail connector (the post box cache, `postThreads()`). Personal inbox is baymelody@gmail.com through the **Zapier** connector: `execute_zapier_read_action` with Gmail "Find Email" (`gmail_find_email`), the personal connection id, and the query `in:inbox category:primary is:unread newer_than:3d`. It's Primary only because Zapier returns full bodies: an unfiltered unread search returned 85 mails and about 12 MB. Results are `{results:[{from:{name,email}, subject, raw:{snippet}, date, message_url}]}` (shape seen from one real read call). Nothing is stored. The manifest adds Zapier `execute_zapier_read_action`.
- **Rewards:** Maple's bed no longer shows in the living room. "Maple's cosy bed" (Me & my room tab) upgrades her basket in Mel's room. The big plant moved by the treadmill (172,606), clear of both bedroom doors. The toy truck still goes everywhere with Evan, his room included.
- **Evan's room:** tapping the door leaves, like every other door; the press-and-hold is gone. Its sign moved below the door, so it no longer sits over Mel. The grown-up buttons are still hidden while inside.
- Dark mode: the round HUD buttons and the zoom button are cream; `svg.ico` uses the light palette; the quest note and notebook pages redefine the light tokens, so highlighted words stay dark. The collapsed quest tab shows just the task name (no "Walking…").

### Round 32: Kind words
- **Kind words** (`kudos.js`): a corkboard on the town hall's back wall (station `kudos`, slot F [362,132]; it replaces the right-hand pennant). It's never a quest spot. Mel pins up compliments (text plus an optional "who said it"), reads them as a wall of sticky notes, or taps "Read me one" for a big random one. Notes can be taken down, with Undo.
- Storage is a private per-user doc "kudos", merged by id like the journal, with a localStorage copy. The board on the wall shows up to eight little notes.
- Chat action `kudos_add` lets Mel tell Maple a compliment and have it pinned. Places "kind words" and "compliments" walk there.
- Weekly nudge: walking into the town hall when the board has 3+ notes and hasn't been opened for 7 days, Maple suggests a read (once a day; silenced by quiet mode). `F.kudosSeen` tracks the last visit.

### Round 33: My routines, small fixes
- **My routines** (`routines.js`): a noticeboard on the back wall of Mel's room (station `routines`, slot N [388,132]). Two kinds of routine:
  - **Checklist:** ticked daily and fresh every morning. Seeded with a starter "Morning routine" Mel can edit.
  - **Weekly:** one step per weekday, with today's step as a big tick button and the week listed below. Seeded as an empty "Beauty routine"; Mel's real one isn't in Notion or this repo, so she pastes it in.
- Editing: rename, switch kind, edit or add steps, remove a step or a whole routine (with Undo). "Paste your whole week" parses lines like "Mon: …" or "Tuesday - …".
- Storage is a private doc "routines": lists merge by id, newest wins; ticks are kept per day and per item with timestamps.
- Chat action `routine_set` (name plus days or items). In the morning, Maple mentions today's weekly step or the morning checklist count when Mel walks into her room (once a day; respects quiet mode).
- The bought "Little bookshelf" in Mel's room moved to the left of the flower print so it doesn't overlap the board.
- **Home desk:** today's calendar, the work inbox and the personal inbox now sit on one page (no tabs), each filling in as soon as its source answers.
- The writing desk's legs now meet the desktop. Round-button icons draw their outlines without the wobble filter and slightly bolder (some Android phones dropped them). The heart bullet in the quest note has room before the text.

### Round 34: the courtyard, trophies, the fountain's visualisation
- **The courtyard** (scene `trophy`, an `INNER` room of the hall, reached through the archway station `trophydoor` on the town hall's west wall): flagstones, a whitewashed arcade with terracotta tiles and bougainvillea, planters and lemon trees.
  - **Bench:** Mel sits (`.sit`) until she walks.
  - **Fountain:** a coin wish, or the weekly visualisation.
  - **Pigeons:** pecking (CSS); a tap makes one flap off.
  - **Neighbours:** Theo eats lunch on the bench (12–1), Okada strolls 2–3, Juniper reads 3:30–4.
  - **Wall:** Kind words board (moved from the hall; the pennant is back) and the Affirmations board.
- **Trophies** (`trophies.js`): milestone families, each with its own look (shape, colour, emblem), the number on the plinth:
  - Quests: 10, 25, 50 … 2500.
  - App users for Chord, Chico (and Ohayo, Luna once their stats exist): 20, 50, 100 … 10,000.
  - The month's revenue goal (needs `F.revTarget`; checked when the revenue chart has loaded).
  - Sunsama weekly objectives: a rosette per week with all done, plus medals for 5, 10, 25, 50 and 100 done (`F.objDone` / `F.objWeeks`, read from `sunsama://objectives/<day>` for this week and last).
  - 7- and 14-day water and steps streaks (from `F.history`), Maple friendship levels, kind words, harvests (`F.harvestTotal`), journal pages.
  - Stored in `F.trophies`. The newest six stand on pedestals; older ones go into the **trophy book** automatically (or by choice): a page each with a Polaroid, the note and the date, with "Back on a pedestal" when there's room.
  - The first run backfills quietly and Maple mentions the count on entering the hall. New trophies after that get a chime, a flash and Maple.
  - An empty pedestal shows "coming up" progress.
- **Affirmations:** five a day. Claude writes them from this week's Notion plan (`sample`); a built-in kind list is the fallback. Favourites can be kept (`F.affirm`).
- **Fountain visualisation** (`vision.js`), following the weekly-visualisation skill:
  - Reads only the month's theme and the latest Weekly Visualisations entry (for the one-question look-back, only if under 3 weeks old).
  - Six questions, one at a time, with a one-line Claude reflection after each.
  - Then a 150–250 word summary, theme, word and her own actions.
  - On approval: a page in the Weekly Visualisations data source (`ba8f40af…`) with Week, Date, Theme, Feeling Word, Cycle Phase (from "Period day 1" on The Tans calendar) and Actions Pushed. Ticked actions become Sunsama tasks for the coming Monday; a retried save never duplicates them.
  - The manifest adds Notion `notion-create-pages` and Sunsama `create_task`.
- **Home desk:** the personal inbox only. **Routines:** one box per step that starts empty (no doubled tick), and more space above the buttons.
- **Emotion jars:** blobs are flat, slightly lumpy shapes in one colour (no shine, shade or outline), and the jar and lid are hand-drawn with wobbly lines.

### Round 35: beauty week, bedtime, letters, backups
- **Beauty routine:** Mel's week (Mon pore extraction … Sun air shot micro-needling + face mask) is the seed, plus a one-time `fillBeauty()` that fills the existing empty "beauty" list (never over edits; flag `beautyFilled`).
- **Bedtime** (`bedtimeTick` in the 1 s loop):
  - Maple chivvies at 11:00 and 11:30pm (`F.bedSaid`).
  - From 11:45pm to 6am a full-screen night overlay (`#bedLock`) blocks every tap and key.
  - "I really need to get up" skips just that night (`F.bedSkip` = night key).
  - Settings "Stay in bed" (`F.bedLock`, on by default) switches it off for good.
- **Letters** (`letters.js`; private doc "letters"), from the writing desk ("Write a letter" in the journal):
  - **Dear Universe:** Claude writes a warm reply (anything is possible; right place, right time; obstacles removed; things always work out). It arrives 15–45 minutes later as post. Pen-pal context comes from the last three exchanges; replies pending without Claude are written later.
  - **Dear future me:** sealed until the chosen date.
  - Arrivals are announced by Maple and read from the home letterbox (letters before the paper) or the desk. Any letter can be saved to the journal.
- **Backup:** Settings "Download a backup" saves every `fox.*` local copy as one JSON file (the `downloads` capability). The game's real home is the per-user db on claude.ai; this is a spare copy.

### Round 36: quests tick off in Sunsama
- Finishing a quest that came from Sunsama (`t.source === "sunsama"`, not already completed there) calls Sunsama `mark_task_as_completed` with `{taskId, finishedDay: today}`. Early quests pulled from tomorrow are marked done on the day Mel did them.
- Anything that fails waits in `F.sunsamaTodo` and is retried every 3 minutes (a quiet flash at most every 30 minutes). Quests Mel adds in the game ("x…" ids) stay game-only.
- The manifest adds Sunsama `mark_task_as_completed`.

### Round 37: routine bonuses
- Every routine on the board earns coins (`routineCoins` in core.js): +1 per checklist step and +5 for finishing a routine for the day (a weekly routine's one step counts as finishing it). Each pays once a day (`S.rCoins`), so untick and re-tick earns nothing extra. A workout routine on the board earns the same way.

### Round 38: Hestia "Last done"
- A fourth tab in the cleaning cupboard. Each item: `H.lastDone [{id, name, last, every}]`, seeded with aircon servicing (90 days), our sheets (7) and Evan's sheets (7). "Done today", a date picker for any past date, and how often (none, weekly … yearly) with due and overdue badges. Add and remove items (Undo).
- Saved in the hestia doc. Chat action `last_done` {what, date?} logs a job (and adds it if it's new).

### Round 39: the bank, and a re-laid town square
- **Square:** the town hall moved to about 11 o'clock (`translate(-90 0)`, door [170,180]); the **bank** is at about 1 o'clock (door [380,178]). The library moved down to 9 o'clock (`translate(-350 96)`, door [85,368]) and the well to [196,414]. Paths, obstacles (paths.js) and NPC wander points were updated to match.
- **The bank** (scene `bank`; `bank.js`, private doc "vaults", merged by jar id, local copy):
  - Five tall glass vault jars along the back wall in arched niches, each a savings goal with a label, goal, markers every N, jewel colour (8 jewels) and amount.
  - Tap a jar: set it up or change it, add savings (jewels pour in, the level rises, the brass cap drops: sounds `jewels` and `cap`), take some out, empty it (Undo) or remove the vault (Undo). History is listed.
  - A full jar sparkles; Maple announces it, and a trophy is earned each time a jar fills.
  - Opal the banker (9–5:30, lunch 12:30–1:30) stands at the counter, which shows every vault at a glance with a total.
  - Chat action `save` {vault, amount}. Places "bank", "vaults" and "savings" walk there.
- A foreground layer (`#fore`, after `#actors` in the world SVG; `foreArt(scene)` in scenes.js) draws things characters stand behind. The bank counter's front panel and brass arch live there, so Opal (now at [260,500]) stands behind the counter instead of on top of it.

### Round 40: the vineyard, the wine shop, workers, level buttons
- **Level UI:** buttons, notes and panel headings no longer tilt (`transform:none` overrides at the end of game-ui.css); the torn-tape button edge is now symmetric. The `#earn` flash is a pill toast above everything (z-index 40). While a panel is open it drops to the bottom of the screen, so it never covers a panel title.
- **The vineyard** (outdoor scene `vineyard`, east of home base over a footbridge; art in `src/art/vineyard.js`, logic in `src/game/vineyard.js`, state in the game save `F.vine`):
  - Three trellis rows of three vines (row 1 starts trellised). Tap a vine (`data-vine="r-i"`) to plant a red or white cutting, water it, and pick it when ripe: 6 hours, 3 bunches, and the vine fruits again after another watering.
  - The stall sells cuttings (10), trellises (25) and barrels (40, up to 3).
  - The barrel shed: 3 bunches make a barrel. Red takes 4h, rosé 2h, white 3h; sparkling takes 3h plus a 2h second fermentation. Name the wine when you bottle it (6 bottles into the cellar).
  - A playground (swings, slide, seesaw): tapping one sends Evan to play there (he comes along in the daytime). Pip plays there from 4:30 to 5:30pm.
- **The wine shop** (room `wineshop`): stock the shelves from the cellar and set prices. The honesty box collects customers' coins. Standing at the counter means Mel is serving: footfall ×3 and coins go straight to her (counter front drawn in `foreArt`). The tasting room pours glasses at a quarter of the bottle price; the chalkboard says nibbles are coming soon, since the food menu is still to be decided with Mel.
- **Customers:** `sellTick` runs every minute and on load, catching up to 12 hours. The shop is open 10am–10pm; evenings count ×2, lunch ×1.3 and weekends ×1.5. Each villager whose routine puts them in the shop or vineyard adds 40%. Busyness is read from the routines minute by minute (`whoAt`), on the game clock.
- **Workers:** Marco (8–6, lunch in the tasting room) and Ines (9–1, 2–5:30) work the vines. While either is on shift, thirsty vines get watered (picking stays Mel's). Celeste minds the shop counter (11–3, 3:30–9:30); while she's on, footfall doubles and her takings go in the honesty box.
- **Evening tastings:** Theo, Opal, Bo, Juniper, Okada (weekdays) and Hana (weekends) sit in the tasting room in the evenings.
- Places "vineyard", "vines", "barrels", "wine shop", "honesty box", "tasting room" and "playground" walk there.

### Round 41: label spacing, the pond moves down, playground swings
- `test/labels.mjs` (dev build) visits every scene through the dev-only `window.__mapleScene` hook. The stub sets `window.__mapleDevStub`; the real game has no hook. It reports washi labels closer than 14 to another label, closer than 8 to another drawing, or off the map edge. `tapeLabel` now clamps itself inside the map, and door labels sit 34 below the door's foot.
- Spacing moves: hall revenue chart D→[316,266]; Chord press B→[370,446]; home fridge H→[318,250]; Mel's wardrobe B→[350,306]; Evan's balloons E→[292,250], cars C→[110,592]; courtyard pedestals are shorter (trophies 56), labels shortened to 14 characters at size 9, and placed at P/S/U x 124, Q/T/V x 396 (rows 296/448/600). Its exit label "Town hall" sits below the archway.
- Home base: the pond moved down 62 (centre [408,566], obstacle [336,534,480,598], lanterns follow), the stream now feeds it lower, and the vineyard footbridge/gate moved to [490,470], well clear of the washing line.
- The playground swings each swing from their own hook (`.pswing`, per-seat transform-origin) instead of the tree swing's pivot.

### Round 42: subtasks as a checklist
- `splitNotes(html, subtasks)` (sunsama.js) turns a Sunsama task's notes into structured subtasks: Sunsama subtasks, plus any checklist (`data-type="taskList"`) in the notes. A bold-led paragraph whose text matches a subtask's title (ignoring "[Inbox]"-style prefixes) starts that subtask's details, and the bullets under it go with it. Headings sitting over subtask sections only are dropped; everything else stays as plain notes. Quests now carry `subtasks: [{id?, title, done, est, info[]}]`; the old "Subtasks:" text list in notes is still read for plans saved earlier.
- Ticks: `F.subDone[taskId] = {at, s: {key: done}}` (forgotten after 21 days) wins over Sunsama's last word. Ticks on real Sunsama subtasks are queued in `F.subTodo` and sent with `mark_subtask_as_completed` / `mark_subtask_as_incomplete` (added to the manifest), retried every 3 minutes like quest completions.
- The notebook shows a progress bar and a checklist. The next one is marked "up next" and opened to its details; the others open on tap, and done ones fold under "Done". Links render as named chips ("Doc ↗", "Gmail ↗", "Open ↗"), and "Label: url" lines become a chip named after the label. The quest note shows "Up next: …" with the count.

### Round 43: Mel's room rearranged
- Bed A→[262,300], centred under the window. Wardrobe B→[72,262], in the top-left corner against the wall. Routines board N→[406,132].
- Maple's basket follows the bed: `MAPLE_BED` (world.js) = bed + [110, 6], used by both the room art and core's sleep spot.
- The window's label sits on the wall to its left (the headboard is below it), and "To the house" is at y 296.
