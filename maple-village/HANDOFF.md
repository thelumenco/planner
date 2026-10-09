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

### Round 44: vineyard pictures
- `src/art/wine.js` holds hand-drawn panel pictures:
  - `vineCloseup(vn, growth, trellis)`: no trellis, an empty spot, a thirsty vine (drooping leaves and water drops), flowers, then green bunches that swell and ripen to purple or gold with a sparkle.
  - `barrelPic(phase, col, label)`: empty, fermenting (an airlock with rising bubbles), ready for bubbles, bubbles (bottles resting), ready (sparkle), with a chalk plaque naming the style. `stageStrip` shows the steps with the current one marked.
  - `bottleArt(type, h)`: a shouldered red, a pink rosé, a slim white flute, and sparkling with gold foil.
  - `glassArt` and `stallIcon`.
- Barrels sit in cards (picture on the left, stacking on narrow phones). Wines on the shelves, in the cellar and in the tasting room are spaced cards with their bottle or glass. Stall items have icons.

### Round 45: weekly review, tasting room menu
- **Weekly review** (`src/game/review.js`): a scrapbook desk in the town hall (station `review`, W [268,420], furniture `scrapbook`). The page covers the week Monday to Sunday:
  - quests per day as bars, with the best day and coins
  - routines kept as day dots (`weekRoutines` in routines.js)
  - trophies earned this week
  - savings added per vault, and any vaults filled
  - journal pages (`journalSince`) and letters (`writtenSince`)
  - steps, water and harvests from `F.history`
  - this week's Sunsama objectives with ticks (`read_resource sunsama://objectives/{day}`)
  - next week's three priorities, sent to Sunsama with `create_weekly_objective` {title, weekStartDay: next Monday} (added to the manifest)
- The review is kept in `F.reviews[weekStart] = {at, priorities, sent[]}` and pays 15 coins the first time each week. Past weeks fold out. From Friday 2pm and over the weekend, Maple mentions it once a day until it's done. Places "weekly review", "review" and "scrapbook" walk there.
- **Tasting room menu** (`DISHES` in vineyard.js, `dishArt` in wine.js): ten small plates, stocked in batches.
  - From the kitchen, for coins: cheese board, bread, olives.
  - From the garden, out of `F.inv` crops: carrot cake, grilled corn, berry tart.
  - From Hana's market, out of `F.inv` treats: dumplings, honey toast, fish, apple slices.
- `v.menu[id]` counts the plates. Food on the menu adds 25% footfall, 60% of glasses sell with a plate, and now and then someone comes in just for a bite. `v.plates` and `today.plates` count them. The chalkboard reads "and small plates".

### Round 46: the kitchen, tapas of the day, where ingredients come from
- **Kitchen** (INNER room `kitchen`, parent `wineshop`; door station `kdoor` on the shop's east wall K [480,390]; its way out is the bottom mat). Logic is in `src/game/kitchen.js`; state is `F.kitchen = {larder, oven, press}`.
  - **Larder:** shows its stock, and can bring kitchen goods in from the backpack (one at a time or everything).
  - **Oven:** 1 flour makes 2 loaves in 1 hour.
  - **Cheese press:** 2 milk make 1 cheese in 3 hours.
  - **Stove:** small plates (`DISHES`: bread, olives, cheese board, dumplings, honey toast, fish, apples, each from larder ingredients) go to `v.menu`. The **tapas of the day** (`TAPAS`, nine garden dishes, 6 plates a batch) is chosen once a day; it can be changed until the first batch is cooked. It's stored as `v.tapas = {day, id, plates, cooked}`.
  - The wine shop's chalkboard names today's tapas (drawn in `roomArt`).
- **Sales:** tapas sell first (65% of plates), only on their own game day, and bring 1.4× footfall. At closing (10pm), or on the next tick after the day turns over, `staffDinner` gives leftovers to Marco, Ines and Celeste. They leave olives, eggs and flour in the larder, and Maple says so (`v.staffNote`).
- **Backpack:** kitchen goods show a "to the kitchen" chip. Items of the new kind `ingredient` (flour, cheese, olives, milk) go to the kitchen when tapped; food can still be fed to Maple. `toKitchen` sends all of one item.
- **Ingredients:**
  - New crops tomato (6h), potato (8h) and pepper (6h), with seeds at the market.
  - Hana's new **Deli** tab: flour 3, cheese 9, olives 5.
  - A **goat** (Animals tab, 30; eats goat feed or a carrot) gives a bottle of milk when fed once grown.
  - The **olive tree** (vineyard stall, 30; planted by the path at [250,262]) gives 2 jars of olives every 8 hours.
  - Eggs come from hens, as before.
- Kitchen dish buttons use `data-dish`, not `data-id`: core's market handler claims every `.item[data-id]` in the panel.

### Round 47: gentler economy, storybook seasons
- **Target:** about 80 coins a day from real life (quests ~33, breaks, steps, routines, chores; plus 15 for the Friday review). Once set up, the vineyard and kitchen earn about as much again. With 6–7 tasks a day, buying everything takes about 5–6 weeks; the full price list adds up to about 4,700–5,000.
- **Vineyard** (`vineyard.js`):
  - `GROW` is 8h.
  - `STYLES`: red 10h/18, rosé 6h/15, white 8h/16, sparkling 8h+5h/26.
  - `SHOP`: cuttings 20, olive tree 150, trellis 80, barrel 150 × barrels owned (`shopPrice`), terrace 600 (`v.terrace`, ×1.3 footfall, pergola art).
  - Sale rates per minute × footfall: bottle .0012, glass .001, plate alone .0006.
- **Quest boost:** `questBoost(F, QUEST_BOOST)` runs when a quest is done. It moves the clock forward on growing vines, fermenting barrels, the oven and the cheese press, so finishing tasks makes the vineyard faster.
- **Price ladder:**
  - Tools: can 60, compost 150, sprinkler 300.
  - Runs: 80, 180, 350.
  - Animals: chick 25, rabbit 35, goat 150.
  - Keepsakes: sandpit 150, truck 80, headphones 120, hammock 250, Evan's treehouse 800 (drawn at home base).
  - Decor: ×1.5.
- **Seasons** (`SEASONS`, `seasonOf(day)` in items.js): spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb.
  - Seeds carry `seasons`, and the market only sells what's in season. New crops: pea (4h, spring), pumpkin (24h, autumn), leek (8h, winter).
  - Every `TAPAS` dish has seasons. The stove lists in-season dishes only (`inSeason`); there are 13 tapas in all.
  - `body.season-*` changes the tree colours (and the grass in light mode).
- **Grape harvest festival** (`FESTIVALS` id `harvest`, early October, `vineyard: true`): bunting in the vineyard, a Maple line, and +1 bunch on every harvest.

### Round 48: staff take over the chores, renaming, tableware
- **Staff** (`v.help`; each can be switched off in the staff card at the shop counter, "Your staff" in `counterPanel`). Defaults are all on except `fetch`.
  - `pick`: Marco and Ines pick ripe vines while on shift (inside `sellTick`; the harvest-festival bonus comes through as `opts.harvest`). They still water.
  - `barrels`: Marco fills empty barrels. Red grapes make red wine, white grapes make white. Rosé and sparkling are only made when Mel fills a barrel herself. Mel still names and bottles every wine.
  - `stock`: Celeste moves the cellar onto the shelves while she's in the shop.
  - `cook`: **Pilar** (new NPC; in the kitchen 10am–2:30pm and 4–9:30pm, on a break in the tasting room between). `cookTick` in kitchen.js runs from `vineTick` while she's in the kitchen. She:
    - takes out loaves and cheese, and restarts the press and oven (bread while there are fewer than 3 loaves),
    - picks the dearest in-season tapas the larder can make (if Mel hasn't picked one),
    - cooks another batch when fewer than 2 plates are left,
    - tops small plates up to 2+, keeping back enough for one more batch of tapas.

    Her last 4 notes (`k.log`) show in the stove card. Maple reads her line out only when Mel is in the kitchen.
  - `fetch`: Pilar moves kitchen goods from the backpack into the larder.
  - The day's tallies are in `v.today.picked`, `filled` and `stocked`.
- **Names:** `v.names = {vineyard, shop}`, set in the same card (`rename`). `vineyardName(F)` and `shopName(F)` feed the scene names and the map tape labels. The labels drop "The" and are cut at 16 characters (`tag` in art/vineyard.js).
- **Tableware:** `drawTableware()` runs in the frame loop, in the wine shop only. Each seated villager (`act: "sit"`) gets a glass of the open wine and a plate (tapas first, otherwise a small plate from the menu) on the nearest table. They're drawn in `#tableware` inside `#sceneArt`, and redrawn only when the key changes.

### Round 49: path from Makers' Lane to the vineyard
- The lane's centre path now runs down to the bottom edge. It ends at a vine arch, `toVineL` (door [262,622]). The lamp that stood on the path moved to [222,572].
- The vineyard has a path down from the top edge at x 290 to the main path, starting at a matching arch, `toLaneV` (door [290,16], label "Makers' Lane").
- New `BRIDGES` entries `lane.vineyard` and `vineyard.lane`, and new arrival points `lane>vineyard` [290,72] and `vineyard>lane` [262,586]. `nextHop` routes through them automatically.

### Round 50: subtasks pay
- `subTick` pays the first time a subtask is ticked in the village. `F.subDone[taskId].paid[key]` records it, so unticking and re-ticking doesn't pay again.
  - Inside a treadmill batch (`isTreadTask`), each subtask used to be a task of its own, so it pays like a quest: 5 coins, 1 xp and the growing boost. It doesn't count towards the quest totals.
  - Any other subtask pays 1 coin.
  - The parent quest still pays its usual 5 when it's marked Done.
- Subtasks ticked directly in Sunsama don't pay. Only ticks made in the village do.

### Round 51: hens eat three meals
- A grown hen (`kind: "chick"`, grown) eats breakfast (before noon), lunch (till 5pm) and dinner (after 5pm). `a.fedMeal` records which meal she last had, and she lays an egg after each one, so up to 3 a day at 3 bags of chick feed.
- The clover meadow's "a meal lasts two days" rule doesn't apply to hens: they still come to every meal.
- Chicks, bunnies and goats still eat once a day (otherwise a chick would grow up in a day).

### Round 52: Ma Ma's orchard and flower farm
- **Screens.** Two new outdoor screens, `orchard` and `flowers` (in `OUTDOOR`), plus an interior `cottage` (in `ROOMS`).
  - Home's top-left arch `toOrchard` leads to the orchard. The orchard has a gate home (`toBaseO`, east) and an arch to the flower farm (`toFlowers`, west). The flower farm's way back is `toOrchardF`.
  - The new `ARRIVE` entries are `base>orchard`, `orchard>base`, `orchard>flowers` and `flowers>orchard`.
  - Obstacles are in `paths.js`.
  - Art is in `src/art/orchard.js`: `orchardArt`, `flowerFarmArt`, `orchardGate` for home, `potsIn(scene)`, and `treePic`/`flowerPic` for the cards. The cottage shell is in interiors.js, and its furniture (`grannybed`, `tv`, `kitchenette`, `teatable`) is in `furn`.
- **Catalogue** (`src/data/orchard.js`):
  - 9 fruit trees, 8 bed flowers and 5 bushes, each with its seasons.
  - Trees take 24h to grow, then their first fruit 12h later, then fruit daily.
  - Beds take 12h to grow and rebloom after 16h; bushes take 24h and rebloom after 24h.
  - Spots: 12 trees in 3 rows of 4, 12 beds and 4 bushes.
- **Logic** (`src/game/orchard.js`). State is `F.orch = {trees, beds, bushes, stock, tin, lastTick, today, tea}`, and placed pots are in `F.pots`.
  - `stateOf` gives a spot's stage: empty, growing, budding, ripe, or faded once out of season.
  - `plant` buys and plants in one go, on an empty or faded spot.
  - `orchTick` runs every second from core's `orchardTick`. Ma Ma picks anything ripe from 7am to 7pm into `stock` (fruit ids, and `stem:<flower>`).
  - Villagers buy from the stock from 9am to 6pm at about 0.0016 a minute (×1.5 at weekends), and the coins go in `tin`.
  - `orchardArrive` hands over the tin and has Ma Ma say hello. Between 3 and 4pm she invites Mel in for tea.
  - The farm shop card has Fruit and Flowers tabs. Fruit can be taken one or all at a time. A bouquet takes 3 stems and a pot 2. When the shop's out, a fruit costs its sell price + 1, a bouquet 8 and a pot 10.
  - Items are generated in items.js:
    - fruit is `kind: "food"` with `fruit: true` (the apple is the market's apple),
    - bouquets are `bq_<flower>` (`kind: "bouquet"`),
    - pots are `pot_<flower>` (`kind: "pot"`).

    Their icons are made from the catalogue colours in icons.js.
  - Bouquets: `giveBouquet` gives to the nearest villager within 170px (or Evan), and Ma Ma has her own lines. Counts are kept in `F.bouquets`.
  - Pots: the `potPanel` card places one in the window box or hanging basket at home, the pot outside the wine shop, or the vase in Mel's room (`POT_SPOTS`).
  - Tea: `haveTea` works once a day while Ma Ma's in the cottage, for 3 coins and 1 xp.
- **Wine shop fruit crate:** `v.fruit`. `stockFruit` moves all of one fruit from the backpack into it, the crate shows in `shelfPanel`, and `sellTick` sells fruit at its `sell` price.
- **Ma Ma** (NPC `mama`):
  - Looks: curly black hair (`hairStyle: "curly"`), a batik top and trousers (`look.batik` is the motif colour), and a sun hat (`look.hat`, drawn over any prop).
  - Weekday routine: the orchard 7–11am (watering), the flower farm 11am–1pm, her cottage 1–4pm (tea at 3), the flower farm 4–6pm, then the cottage with the TV.
  - She's also in town 9:30–11:30 on Saturdays, at the vineyard 4–5:30pm on Tuesdays and Thursdays, and at Mel's home 3–5pm on Sundays.
  - Routine slots now take `dow: [0-6]` (`slotNow` in npcs.js and `whoAt` in vineyard.js).
- **Gong Gong** (NPC `gonggong`, Mel's grandpa):
  - Looks: `tall`, fair, short grey hair, round gold glasses (`look.specs` is the frame colour, drawn on top of any prop).
  - At home he wears a white singlet and berms (`look.shorts` draws short trousers over bare legs). Going out, the slot `look: OUT` swaps in a pale shirt and long trousers. Any routine slot can now override clothes with `look`.
  - Routine: TV on the cottage sofa, the orchard 9–11:30am and 5–6pm, the flower farm 1–2pm, and tea at 3 on the other side of the table.
  - He goes to town on Mondays and Saturdays, the vineyard on Wednesdays, and Mel's home at the weekend.
- Villagers' hats come off indoors (`makeNode` drops `look.hat` when the scene isn't outdoors). The cottage has a two-seat sofa in front of the TV, where the grandparents sit in the evening.
- **Farm shop rework (Mel's call).** Fruit and flowers come only from Mel's own trees and beds, and they're free: nothing is bought there. The shop has three tabs:
  - **Plant**: `plantAny` buys and plants in the first empty or faded spot of that kind, and shows how many free spots there are.
  - **Fruit** and **Flowers**: only what Ma Ma has picked.

  The shop opens on Plant until something's planted. Tapping a spot still plants directly.

### Round 53: guests order when they sit down
- Mel noticed that someone "in for a tasting" didn't open a bottle: sales were only the per-minute chance in `sellTick`. Now `serveGuest` (vineyard.js) runs from core's `drawTableware` as soon as a villager sits in the tasting room while Mel's there:
  - They get one glass from the open bottle, or a fresh bottle is opened (5 glasses).
  - 6 times in 10 they also get a plate (`servePlate`, shared with `sellTick`).
  - The money goes to the honesty box, or straight to Mel when she's serving.
- `S.served["<npc>:<slot key>"]` records the order, so each sitting orders once. The tableware shows exactly what each guest ordered. Pilar's break doesn't count as a customer.
- Away from the shop, sales are still the background chance in `sellTick`.

### Round 54: orchard workers, visitors and tours; Penny; writing tasks
- **Tours** (`src/game/tours.js`, worked out from the date so every screen agrees):
  - Weekends: four tours at 10:00, 11:30, 2pm and 4pm, 45 minutes each. The guide rotates through Ma Ma, Gong Gong, Farid and Mei, and the group is 3–4 villagers picked from `VISITORS`.
  - Darren leads one at 5:45pm on Tuesdays and Thursdays.
  - The group spends the first half among the trees and the second half at the flower beds.
  - `tourSlot` and `visitSlot` override `slotNow` in npcs.js. The guide's act is `guide`, with `actLines.guide` for each guide.
  - Drop-ins (`visitsOn`): on weekdays one villager visits the orchard at lunch and one the flower farm after work; at weekends one visits the flower farm at lunch.
- **Fees:** `TOUR_FEE` is 4 a person. `orchTick` pays each finished tour into `o.tin` once at least 3 things are planted, records it in `o.toursPaid` and counts it in `o.today.tours`. The farm shop shows today's tours (`tourLine`). Arriving mid-tour gets a line from Maple, and a tour finishing while Mel's there is announced.
- **Workers:** `farid` works the orchard and `mei` the flower farm, 8am–5:30pm daily with lunch on site.
- **Penny fix:** a tap on a speech bubble also reaches the person under it (`elementFromPoint` after hiding the bubble), so a bubble no longer blocks a messenger.
- **Writing tasks:** `isWriting(t)` in world.js. Any writing (write, draft, blog, newsletter, copy, caption, script, outline, journal…) goes to Fresh Pages → writing desk, ahead of business keywords and planned places. Only treadmill batches and home-base outings come first.

### Round 55: gifts for the grandparents, the field and lake, the river
- **Gifts** (`tab: "family"`, `to: "grands"`):
  - kueh lapis 5, ondeh-ondeh 4, ang ku kueh 4, mooncake 12 (autumn only, through the market's existing season filter), bird's nest 18, chicken essence 10.
  - `giveGift` gives to whichever of Ma Ma and Gong Gong is nearest in the scene. If neither is there, it says where they are. Counts go in `F.fam.gifts.mama` and `F.fam.gifts.gonggong`.
  - Icons are in icons.js.
- **The field** (OUTDOOR `field`, art in `src/art/field.js`):
  - A lake with two swans gliding (SMIL `animateTransform`), reeds, a bench, a picnic blanket and basket, and a football pitch.
  - Gates: the orchard's top arch `toFieldO` ↔ the field's `toOrchardN` (bottom), and the town's west arch `toField` ↔ the field's `toTownF` (east).
  - Spots, handled by `fieldSpot` in core:
    - `lake`: feed the swans once a day (`S.swans`), 1 xp.
    - `picnic`: Mel sits. A picnic from the backpack is eaten here for 4 xp, with Evan.
    - `pitch`: a kickabout with Evan (`S.kickabout`, 1 xp a day); Pip asks for a pass.
  - Evan comes along in the daytime (`evanHere`, `EVAN_SPOTS.field`), and Mel can sit there (`mel.sitting` kept in the field).
- **Field visits** (`fieldVisits` and `fieldSlot` in tours.js, after tours and visits in `slotNow`):
  - two picnickers 12–1:30pm,
  - one villager feeding the swans 5:30–6:30pm,
  - Pip playing football after school, and on weekend mornings and afternoons,
  - Ma Ma and Gong Gong strolling round the lake on Friday afternoons and Sunday mornings.
- **River:** the field's river leaves the lake's east side and runs south-east off the bottom edge at x≈380. In the orchard, `orchardRiver` enters at the top (x 380) and flows east off the right edge at y≈70, into the home screen's river along the top.
- **Garden yields:** each crop now gives several per harvest (`CROPS[*].yield`: tulip 2, sunflower 2, carrot 3, corn 3, tomato 3, pepper 3, leek 3, pea 4, potato 4, strawberry 5, blueberry 5, pumpkin 2), and seed cards show it.
  - Per-piece sale prices dropped (corn 4, carrot 3, potato 2, strawberry 4, pumpkin 10…), so a whole harvest sells for only about 1.3–1.5× what one piece used to. The real gain is ingredients for the kitchen.
  - `CROPS[*].ns` is the plural, for Maple's harvest line.
- More seasonal gifts for the grandparents: bak kwa 10 and pineapple tarts 8 (spring), rice dumplings (`bakchang`) 6 (summer), Christmas log cake 14 (winter). The market's dumpling stays a treat for Maple.
- Pip's weekday football in the field is 3:30–4:30pm, so his playground slot at the vineyard (4:30) still happens.
- **Chalkboard menu:** the wine shop's chalkboard is a station (`menu`, kind `chalkmenu`: a transparent hit area over the board painted in interiors.js). It opens `menuPanel` (vineyard.js), which lists only what's available now, with prices: today's tapas, small plates, wines by the glass and by the bottle, and the orchard fruit crate.
- **More tasting-room regulars** (`TASTINGS` and `tastingSlot` in tours.js, last in `slotNow`'s overlay chain):
  - Afternoons: Auntie Lin daily, Okada (weekdays), Juniper and Bo (weekends), Hana (Mon/Wed/Fri), and Ma Ma and Gong Gong at 4:30pm on Saturdays.
  - After work: Ines 5:30, Marco 6:00, Farid 6:45, Mei 7:00.
  - Darren on Friday nights at 8pm.
  - The tasting room now has a third table (`cafetables` draws three; `drawTableware` knows them). Seats never double up in time.
  - The honesty box moved up (H [96,420]) to clear the new table's label.
- **More tasting-room regulars** (`TASTINGS` and `tastingSlot` in tours.js, last in `slotNow`'s overlay chain):
  - Afternoons: Auntie Lin daily, Okada (weekdays), Juniper and Bo (weekends), Hana (Mon/Wed/Fri), and Ma Ma and Gong Gong at 4:30pm on Saturdays.
  - After work: Ines 5:30, Marco 6:00, and the orchard's farmhands Farid 6:45 and Mei 7:00.
  - Darren on Friday nights at 8pm.
  - The tasting room now has a third table (`cafetables` draws three; `drawTableware` knows them). Seats never double up in time.
- **Out-of-towners** (NPCs with `tourist: true` and an empty routine: Aiko, Ben, Clara, Dev, Elena, Felix, Grace, Hiro; `TOURISTS` in tours.js). They only ever appear at the wine shop and the orchards:
  - Tour groups are now a couple of villagers plus 1–2 tourists. Each tourist on a finished tour buys one thing from the farm shop stock (a bouquet's worth for stems), paid into the tin.
  - They browse by the farm shop 10:30–11:45am and visit the flower beds 2:30–3:30pm.
  - They take tasting seats in the regulars' gaps: a pair at 1pm, 4pm and 8:30pm, and 11am at weekends (`touristTastings`). Half the time they also buy a bottle to take home (`serveGuest` with `tourist`).
- **Wine shop layout:** the wine shelves stand against the back wall (S [92,238]) and the honesty box is beside the counter (H [206,318]).

### Round 56: tasting regulars and out-of-towners; Sunsama early ticks
- **More tasting-room regulars** (`TASTINGS` and `tastingSlot` in tours.js, last in `slotNow`'s overlay chain):
  - Afternoons: Auntie Lin daily, Okada (weekdays), Juniper and Bo (weekends), Hana (Mon/Wed/Fri), and Ma Ma and Gong Gong at 4:30pm on Saturdays.
  - After work: Ines 5:30, Marco 6:00, and the orchard's farmhands Farid 6:45 and Mei 7:00.
  - Darren on Friday nights at 8pm.
  - The tasting room has a third table (`cafetables` draws three; `drawTableware` knows them). Seats never double up in time.
- **Out-of-towners** (NPCs with `tourist: true` and an empty routine: Aiko, Ben, Clara, Dev, Elena, Felix, Grace, Hiro; `TOURISTS` in tours.js). They only ever appear at the wine shop and the orchards:
  - Tour groups are now a couple of villagers plus 1–2 tourists. Each tourist on a finished tour buys one thing from the farm shop stock (a bouquet's worth for stems), paid into the tin.
  - They browse by the farm shop 10:30–11:45am and visit the flower beds 2:30–3:30pm.
  - They take tasting seats in the regulars' gaps: a pair at 1pm, 4pm and 8:30pm, and 11am at weekends (`touristTastings`). Half the time they also buy a bottle to take home (`serveGuest` with `tourist`).
- **Wine shop layout:** the wine shelves stand against the back wall (S [92,238]), the honesty box is beside the counter (H [206,318]), and the chalkboard is the `menu` station.
- **Orchard hedge:** `hedgeRow(gap)` leaves the path to the field open behind the arch (x 200–300).
- **Sunsama early ticks.** Sunsama lists a task on any day it's worked on, so a later day's task Mel started early came back in today's pull and opened as a quest.
  - Each quest now keeps `day` (Sunsama's `scheduledDate`). `pullSunsama` returns `{tasks}` for that day and earlier, and `{ahead}` for tasks scheduled later. Only `tasks` reach the boards.
  - `creditAhead`: an ahead task that's completed pays 5 coins, 1 xp and a quest count once, and records `F.early[id] = its day`. On that day `creditDone` marks it done without paying again.
  - `paySunsamaSubs`: subtasks ticked in Sunsama, on today's tasks and ahead tasks, pay like village ticks via the shared `paySub` (5 in a treadmill batch, else 1). They're recorded in `F.subDone[task].paid`.
  - The first run only records what's already ticked (`F.subBaseline`), so nothing pays retroactively.
  - The stub's `?ahead=1` adds such a task, for the test.

### Round 57: busy weekends: families, roundabout, Sunday market, field fair
- **Busier wine shop.**
  - Background rates are up about 1.6×: bottle .002, glass .0016, plate alone .001, fruit .0018 per minute × footfall.
  - Out-of-towners take more tasting seats: weekdays at 12, 1, 2:30, 4, 5 and 8:30pm; weekends also at 11 and 4:30.
- **Tourist families** (`FAMILIES` and `familyVisits`/`familySlot` in tours.js; NPCs with `tourist: true`, and the kids also `kid: true`): parents Sam, Priya, Jonah and Mia, kids Lily, Max, Noah, Zara, Ollie and Ava.
  - The kids run round the vineyard playground while a parent watches.
  - One family on weekday afternoons (3:30–5pm). At weekends it's busy 10am–12:30 and 12:45–5:30pm.
  - On market and fair days two families go to the field first.
- **Roundabout** at the vineyard playground (`pround`, turning slowly), a nod to Swings & Roundabouts; `playground()` handles Evan on it.
- **Field events** (`eventOn` and `eventNow` in tours.js; `eventSlot` comes first in `slotNow`):
  - Stalls stand in a row along the top of the field (`STALL_SPOTS`, six places; each stall's `at` says which). Spots are `mstall0`–`mstall5`; `stallAt(day, hm, i)` says which stall stands there now, and `core.js` routes the tap by its `kind`.
  - The **Sunday farmers market** runs 8am–1pm every week. Stalls: Elena (cheese and olives, 0), Felix (honey, 1), **our wine stall** (2, `kind: "wine"`, minded by Ines), **Ma Ma's fruit and flowers** (3, `kind: "orchard"`), Grace (flower crowns, 4) and Dev (bakery, 5). Ordinary stalls sell with `buy()`.
  - The **field fair** runs on the last Saturday of the month, 10am–4pm. Hiro's kites and Aiko's face painting are activities for Evan (3 coins: `fairActivity`); Ben has lemonade and apples, and Clara has snacks.
  - The art draws bunting and the event's name along the top, the stalls, a second picnic blanket, and kites at the fair. The pitch stays.
  - Shoppers come in two waves of 4 (villagers, spare out-of-towners, Sam and Priya; never anyone on a tour). They browse along the stalls, then in the second half of each wave two of them sit on the picnic blankets (`PICNICKERS`). Pip runs about.
  - Stall keepers are never picked for tours or tasting seats that day; Ma Ma doesn't guide Sunday tours.
- **Wine stall:** it sells from the shop's own `v.shelf` (stock is shared). In `sellTick` the market adds bottle .012 and glass .008 per minute while it's open. Standing at the stall (`serving()` covers the field stall on market days) triples that and pays Mel directly (`opts.stall`). `stallMarketPanel` lists the shelf.
- **Ma Ma's market stall** shares the farm shop's `o.stock`: `shopPanel(F, today, tab, true)` is the market mode (Fruit and Flowers tabs only, no Plant tab), still free for Mel. While the market's on, `orchTick` sells from the stock at .02 a minute (about six things a morning) into Ma Ma's tin (the farm shop's own 9–6 rate is replaced during those hours).

### Round 58: the market moves up top, Ma Ma's market stall, the tour sign
- See Round 57 for the stall row along the top of the field (`STALL_SPOTS`, `stallAt`), picnickers and Ma Ma's market stall.
- **Tour sign** in the orchard (`toursign`, by the path up to the field): `tourBoard(F, today, hm)` in orchard.js lists today's tours (time, guide, who's signed up with visitors marked, the fee, "on now"/"done"), or the next day with tours if today has none left. Chat can go there ("tour sign", "tours").
- The field arch label moved to (318, 178) and the right-hand lamp to x 334 to make room.

### Round 59: market specials, eight stalls, undo for every purchase
- **Eight market stalls** along the top (`STALL_SPOTS`, 60 apart, narrower stalls, labels staggered high/low; keepers stand in front of their table):
  - 0 Cheese (Elena)
  - 1 Honey (Felix): honey, honeycomb, beeswax candle, honey toast
  - 2 Produce (Clara): `produce: true`, the vegetables and berries whose seeds are in season, priced at sell + 2 (`stallItems`, `stallPrice` in core.js; `buy(id, price)` takes a price)
  - 3 Our wines (Ines)
  - 4 Ma Ma's
  - 5 Soap (Grace): lavender soap, rose and oat soap, little duck soap, sugar scrub, flower crowns
  - 6 Craft beer (Ben): pale ale, stout
  - 7 Bakery (Dev)
  - The fair's four stalls moved to places 2–5.
- **Market specials** are `tab: "market"` items, so they're never on Hana's shelves. They're gifts:
  - `to` can be `"family"` (Evan, Darren, Ma Ma or Gong Gong), `"grands"`, one person, or a list. `giveGift` hands the gift to whichever suitable person is nearest.
  - `says: {evan, darren, mama, gonggong}` gives each person their own line.
  - `giftNames(to)` writes "for Darren or Gong Gong" and so on in the shop, the stall and the backpack.
- **Undo for purchases, game-wide:**
  - A capture-phase click listener snapshots `F` (as JSON) before every tap. If the tap spent coins, `undoable` offers to restore the snapshot in place, so module references to `F` stay valid.
  - The bar shows the last `flash` text and the coins spent.
  - Skipped when the tap already offered its own undo (`undoMark`) or the coins went out as a chore refund (flash starting "-").
- **Roundabout moved** into the playground between the swings and the slide (`pround` door [188,598]; the art is the old drawing inside `translate(-282 82)`, label above it). It used to sit where the harvest bunting crosses.
- **The "mosquito" fix:** the roundabout's spokes used `animateTransform type="scale"` around the SVG origin, so the mirroring swept them across the whole vineyard. They now scale inside a `translate(470 498)` group, so they turn in place.

### Round 60: market keepers move about
- `keeperPose(st, day, hm)` in tours.js: every 30 minutes each keeper picks behind / behind / front / sit / chat / wander (seeded by day, keeper and half-hour). The first half hour everyone is behind their stall setting up.
  - `keeperSlot` turns the pose into a slot (`glide: true`). The places are: behind at [x+3, y-9]; in front at [x+9, y+9]; sitting on the crate at [x-17, y+7]; chatting on the path beside the next stall at [x±30, y+48]; wandering `FIELD_WALK`.
  - `keeperAway` is true for chat and wander. The stall panel and the tap line then say it's on the honesty tin.
- `glide` slots (npcs.js): when a new slot in the same scene starts, the NPC walks there in a straight line instead of popping into place.
- **Stall tables as depth-sorted props:** `stallFront` (art/field.js) draws the table and goods. core.js `stallFronts()` adds them to the `#actors` ordering at y = table bottom − 1 (with `pointer-events: none`), so anyone standing behind a table shows from the waist up. The `.sfront` nodes are removed when leaving the field or when the event ends.
- `.npc.act-sit` styling now only applies when the NPC isn't walking (`:not(.walk)`).

### Round 61: the foreshore, Mel's family, Mum's exercise class, family paddling
- **The foreshore** (`shore`, art/shore.js), modelled on the Mandurah foreshore. It sits west of the field and north of the flower farm.
  - The sea takes the west third, with three dolphins surfacing on SMIL loops and a far-off paddleboarder.
  - Then a strip of sand with the **Dolphin bench** (`dolphins`: Mel sits; mornings, once a day, dolphins and a little xp) and the jetty with the **paddleboard rack** (`suprack`).
  - The boardwalk, Norfolk pines, two lamps, and two houses: **Mum and Dad's** (`mumdad`) and **Marcus and Angellina's** (`marcus`).
  - Gates: `toFieldS` (east) ↔ the field's `toShoreF` (west), and `toFlowersS` (south) ↔ the flower farm's `toShoreFl` (top left; the hedge has a gap there).
  - Bounds keep Mel off the water (x ≥ 186). OBST covers the houses and the rack.
- **Interiors:** `ROOMS.mumdad` has the piano, double bass, easel, Mum's mat and the kitchen table. `ROOMS.marcus` has the games corner, the psychology bookshelf, Angellina's desk, the sofa and a table. New furniture kinds are in scenes.js; the shells are in interiors.js.
- **New NPCs** (data/npcs.js):
  - **Mum** (bob with a fringe: hairStyle `bobfringe`): morning walk on the foreshore, then she leads the class at 8. After that she volunteers (the library Mon/Wed, the town hall Fri) or waters at the orchard (Tue/Thu). Flower farm in the early afternoon, town in the late afternoon, her mat at home.
  - **Dad** (black specs, T-shirt and berms): sketching on the sand at 7, piano, town, the orchard (Mon/Wed/Fri) or bass, the easel, a walk on the foreshore, and music in the evening.
  - **Marcus** (tall, silver specs): banker at the village bank Mon/Wed/Fri (`BANKER` look, covering Opal's lunch at the main counter). "At work in the city" Tue/Thu. Gaming on the sofa (act `game`) in the evenings. On weekends: the orchard, town, then paddleboarding 4–5pm.
  - **Angellina** (`dress` look): studies at the library on weekday mornings and at her desk in the afternoons. Waters with Mei, walks the foreshore, paddleboards with Marcus at weekends.
  - `SHORE_WALK`/`SEA` are point lists. Slots with `free: true` move straight with no clamping (paddleboarders on the water, at speed 22).
- **Mum's exercise class** (`classOn`/`classSlot` in tours.js): 8–9am Monday to Saturday on the field's **exercise lawn** (`exlawn`, east of the river). Pilates Mon/Wed, Zumba Tue/Thu, Piloxing Fri/Sat.
  - Mum leads (act `lead`) with 3 villagers from `CLASS_POOL` (act `exercise`).
  - Tapping the lawn during class puts Mel on the spare mat with the `#mel.exercise` animation; once a day it gives +2 coins and 2 xp. Outside class times it tells you the timetable.
- **Out-of-towners paddleboard** (`shoreSlot`): two on weekend mornings (9 to 12), one on weekday mornings (7 to 8:30).
- **Family paddle** (`familyPaddle`/`endPaddle` in core.js, module state `sup`):
  - Mel (and Evan, if he's here) take boards out for 60 seconds. A `.supboard` is injected under their `.bob` and shown by the `.sup` class.
  - Any of Mum, Dad, Marcus or Angellina whose routine has them on the foreshore paddle out too (`supSlot` in npcs.js, via `api.sup()`).
  - Maple waits by the rack and couriers wait at the water's edge. A dolphin moment comes at 20 seconds.
  - Tapping the shore ends it early. A finished paddle gives 2 xp once a day. Not at night or in the rain.
- **Darren** paddleboards off the foreshore on Sunday afternoons (3 to 4:30).
- **Gifts:** `"family"` now also covers Mum, Dad, Marcus and Angellina (`FOLKS`). Soaps, scrub and candles suit Mum and Angellina too; beers suit Dad and Marcus too; honey has a line for each of them.
- people.js: `look.board` draws a board and paddle; `look.dress` draws a dress (the legs show below it); hairStyle `bobfringe` adds a straight-cut fringe.
- CSS (npcs.css): paddleboarders bob and hide their shadow; `exercise`/`lead` raise and lower their arms; `game` sits with busy thumbs.

### Round 62: gift chooser and thank-you notes, who's where, family dinners, more people out and about
- **Gift chooser:** tapping a gift in the backpack opens `giftPickHTML`, listing everyone the gift suits (`giftWho`), each marked "here" or "send it".
  - Someone here gets it in person (`giveGift(id, chosen)`).
  - Anyone else gets it sent round (`giveTo`): an entry goes in `F.thanks` ({who, item, at: now + 10 min}).
  - Once due, `thanksMail()` adds "Thank you from X" notes to `localMail`. Penny delivers them; `thankNote` builds the text from the gift's `says` line and the person's sign-off.
- **Who's where today** (friendship view, `whosWhereHTML`): family first, then the village. Each person's day comes from `daySchedule(id, day)` in npcs.js (quarter-hour sampling of `slotAt`, cached per day).
  - npcs.js now has `slotAt(def, day, t, live)`. `slotNow` is the live case and adds the family paddle.
- **Family dinners** (tours.js `dinnerOn`/`dinnerNow`/`dinnerSlot`/`dinnerSeat`): Wednesdays and Sundays, 6:30 to 8pm. The host goes round home → Mum and Dad's → the cottage → Marcus and Angellina's (`DINNER_HOSTS`, by week).
  - Seats: Ma Ma, Gong Gong, Mum, Dad and Angellina along the back; Darren, Marcus, Evan and Mel along the front.
  - Every house has a `dining` station (`DINING` positions). The table is also a depth-sorted prop (`diningTable` in scenes.js, via `stallFronts`), so those along the back show from the waist up.
  - Furniture moved to make room:
    - Mel's home: the dining table replaced the sofa (it takes the sofa's reading/rest quests; Evan's storybook spot moved to it).
    - The cottage: the kitchenette now stands against the back wall and the tea table is bottom left.
    - Mum and Dad's: the kitchen table became the dining table and Mum's mat moved up.
    - Marcus and Angellina's: re-laid out as a games-and-sofa corner on the left, Angellina's desk and bookshelf as a study nook at the back right, and the dining table in the middle right.
    - The rugs moved to match.
  - Evan sits at his seat on dinner nights (`evanAtDinner`, `#evan.sit`). Tapping the table sits Mel down (2.5 seconds; 3 xp once a night). A reminder plays from 5:30pm, and chat "family dinner" walks there.
- **Out and about:**
  - Mum: Thursday afternoon at the vineyard.
  - Dad: Sunday morning at the market, Tuesday late morning in the lane, Saturday afternoon at the vineyard, Wednesday sketching by the lake.
  - Marcus and Angellina: the Sunday market, Friday evening at the vineyard, the lane (Saturday / Wednesday).
  - Villagers in Makers' Lane (`LANE`): Mr Okada (Mon/Wed/Fri 2pm), Bo (Tue/Thu lunch), Juniper (weekdays 3:30pm).

### Round 63: dark sea, date nights, family voices, Ah Gong and Ah Ma, Evan at Marcus's, desk and table swapped
- **Dark sea:** the foreshore's sea and sand use `--sea`, `--sea2` and `--sand` (base.css), which have dark-theme values like the rest of the palette.
- **Date night** (`dateSlot`, tours.js): Marcus and Angellina sit at the middle tasting table (seats c and d) on Tuesdays and Saturdays, 7:30 to 9pm. Mr Okada, Hana and Bo take those nights off. A one-line notice plays when Mel walks in.
- **Voices:** NPC defs can carry `hellos` (used for the "hello near Mel" bubbles).
  - Dad: "Hi darling! Love you, have a good day." (also in his intro and lines) and "Ah Gong loves who the most?"
  - Marcus calls Mel "Zeh" (intro, hellos, lines, his thank-you sign-off, his honey line).
  - Mum: "Hello darling! Have you eaten?"
- **Ah Gong and Ah Ma** (`grandBanter`, every 5 seconds): when Evan and Dad or Mum share a screen, a little exchange every minute or two.
  - Ah Gong asks "Ah Gong loves who the most?"; Evan answers cheekily and Ah Gong laughs.
  - Ah Ma asks for a hug; Evan runs off with "Catch me first!".
  - Once a day there's a surprise toy: a dinosaur, aeroplane or robot, drawn in Evan's hand via `S.evanHold`.
- **Evan visits the family houses** by day: `evanHere` includes mumdad and marcus (with `EVAN_SPOTS`).
  - At Marcus and Angellina's he asks for Mario or Spiderman as he arrives. Tapping the games corner (`marcusGames`) has him play a level, with Marcus chiming in; 1 xp once a day.
- **Mel's home, tidied into zones:**
  - The dining table along the back wall at left; the fridge (344) and kitchen (440) at the back right.
  - Her home desk at middle left (130,452) with the treadmill below it; Darren's desk at middle right.
  - The laundry basket (350,516) beside the cleaning cupboard at bottom right.
  - The middle stays open on the way to the door.

### Round 64: big goals: garage, scooter, car, dolphin cruise boat, cellar door
- **Why:** the economy check found about 1,300–1,500 coins a week once the vineyard is going, against about 5,000 coins of one-off buys, so Mel would run out of things to save for within a month.
- **game/goals.js:** `GOALS` (garage 1,200; scooter 800 and car 3,500, both needing the garage; boat 2,000; cellar 2,500).
  - `buyGoal` stores `F.goals[k]` (a timestamp). `goalPanel` is the "save up for it" card with a progress bar. `garagePanel` chooses how to get about (`F.ride`: walk, scooter or car).
  - The generic purchase undo covers all of these.
- **Garage:** the `gdoor` station on the back wall of the house, between the fridge (318) and the kitchen (452). It's boarded up with a sign until built.
  - `INNER.garage` is entered through that door and left by the mat at the bottom. `ROOMS.garage` has the workbench, storage, and the scooter and car bays (dashed outlines until bought).
- **Riding:** outdoors `stepTo(mel, ...)` is scaled by `rideSpeed(F)` (scooter 1.6×, car 2.5×).
  - While she moves, `#mel.scoot` shows the scooter under her feet and `#mel.drive` shows the car around her (both injected in core.js). Neither shows during a paddle.
- **Dolphin cruise boat:** the `boat` spot on the foreshore (a mooring post with a sign until bought, then the boat at the end of the jetty).
  - `startCruise`: `S.cruise.until` lasts 45 seconds. The boat gets `.cruising` (CSS keyframes up the coast and back), with heads aboard and extra dolphins alongside.
  - Mel, Evan and Maple are hidden (`cruisingNow` in the per-frame visibility lines). `endCruise` puts them back on the sand; 3 xp once a day. Not at night.
- **Cellar door:** the `cdoor` station on the wine shop's west wall (dashed with a sign until built). `INNER.cellar` has its way back on the east wall.
  - `ROOMS.cellar` has the wine wall, the tasting bar (`flight`: 2 xp once a day), barrel racks and a high table.
  - It adds ×1.15 to the wine shop's footfall in `sellTick`.

### Round 65: the home office and garage off the living room, a cream convertible
- **Living room** (`ROOMS.home`): the family dining table in the middle (`DINING.home` 260,452), the sofa (back in, with the reading and rest quests), and the fridge and kitchen along the back.
  - Four doors: Mel's room and the **home office** (`officedoor`, left wall, lower) on the left; Evan's room and the **garage** (`gdoor`, right wall, lower) on the right.
- **Home office** (`ROOMS.office`, `INNER.office`): Mel's desk (`desk`, the `/./` home-quest default and the calendar and inbox desk), Darren's desk (Darren types there on weekdays at 430,258), a bookshelf, and the treadmill.
- **Garage** (`ROOMS.garage`, `INNER.garage`): now part of the house from the start (the garage goal was dropped, since the cleaning cupboard lives there).
  - It holds the workbench, the cleaning cupboard (the daily clean and Hestia's chores), storage, the laundry corner, and the car and scooter bays.
- **Quests:** home quests can land in the office or garage. `basePlace` is the old placeOf; `spotOf` picks from all three rooms' stations; `placeOf` returns the room the chosen station is in. `questsIn("home")` counts all three.
  - `placeInfo(pl)` labels rooms that aren't village buildings.
  - `questMark` points at the door of a room off the current room.
  - `PLACES` sends cupboard and laundry to the garage, and desk and treadmill to the office.
  - Couriers don't come into the office or garage either.
- Rooms off another room can also be left by the Exit mat at the bottom (as well as their side door).
- **The car** is a cream convertible (`GOALS.car`, 3,500, no garage needed; the scooter is 800). While driving, Maple rides in the back, and Evan does too when he's with Mel and awake (`#mel.withEvan`).
  - Their own sprites are hidden while the car moves (`mel.wasDriving`, `mel.carEvan`), and they hop out beside her when she stops.

### Round 66: the monthly wine club at the cellar door
- `wineClubOn` / `wineClubNow` / `clubMembers` / `clubSlot` in tours.js: the first Friday of every month, 6 to 9pm, once the cellar door is built. Eight members are picked each month from `CLUB_POOL` (regulars, the orchard and vineyard hands, Mum, Dad, Marcus and Angellina) and wander the cellar (`CLUB_WALK`).
  - npcs.js gates the overlay on `cellarBuilt()`. It comes after dinner and date night in `slotAt`.
- **Sales** (`sellTick`): club minutes sell bottles at .04 and glasses at .03 off the shop's shelves.
  - With Mel in the cellar (`opts.club`), that's ×1.5 on the live minute, and the coins go to her; otherwise they go to the honesty box.
  - Roughly 7 bottles and 5 glasses a club, if the shelves are stocked.
- **Hosting:** tapping the tasting bar during the club (3 xp once a club) has a couple of members chime in.
- Notices: a reminder from noon on club day, and a welcome line when walking into the cellar during it.
- Who's where shows "the wine club at the cellar door" and a notice line.

### Round 67: wear today's outfit, door exits for the office and garage, a roomier undo toast
- **Wearing an outfit:** each wardrobe card has "Wear this", which opens a checklist of its pieces, all ticked. "Put it on" stores `F.wear` ({day, label, and the ticked fields}, kept for the day).
  - `applyWear` (core.js, called from `dressMel`) uses `colourOf` (garments.js, now exported).
  - The top and bottom recolour `--tank` and `--denim` on `#mel`.
  - A dress (`#oDress`), layer (`#oLayer` plus `.osleeve`), shoes (`.oshoe`), bag (`#oBag`), earrings (`#oEar`, gold, silver or pearl) and sunglasses (`#oShades`, outdoors only) are overlays added to Mel's sprite in index.html.
  - Hair "down" shows `#oHairDown` and hides the ponytail (`#mel.hairdown`). Pyjamas in her room hide the outfit.
  - "Back to my usual clothes" clears it. `outfitsToday(F)` lists the stylist's three plus any extras.
- **Office and garage:** no Exit mat; their doors (office: east wall, garage: west wall, labelled "Living room") are the `data-exit` way back, like Mel's room.
- **Undo toast:** rounded rectangle (22px corners), more padding, `width: max-content` up to 460px, the message wraps inside, and it sits 96px up so it clears the quest note.

### Round 68: bedroom doors in the family houses, the usual-look hair tie, button-row spacing
- **Bedroom doors:** a `bedroom` station (furniture kind `bedroomdoor`, scenes.js) in the cottage (west wall, R:[40,330]; it replaces Ma Ma's bed `mbed`), Mum and Dad's (east, R:[480,330]) and Marcus's (east, R:[480,370]).
  - The door is pink with a heart sign, which turns into a "shh" sign from 11pm to 6am.
  - Evening routines (data/npcs.js) now run to 22:50. From 22:50 to 23:00 the couple stand at their bedroom door. From 23:00 they have no slot, so they're absent until their morning routine.
  - Tapping the door (core.js) says they're fast asleep at night (11pm to 6:30am), otherwise that it's private.
- **Hair tie:** the blue hair tie and the two sprigs on Mel's sprite carry `class="usual"`. `applyWear` sets `#mel.restyled` whenever a worn outfit has a hair, dress or top piece, and `#mel.restyled .usual` hides them.
- **Buttons:** `.panel .actions{margin-top:12px}` (0 when first child), so focus and highlight rings no longer touch the line above.
- **Darren asleep (round 68b):** from 22:00 to 23:00 he sits on the home sofa (slot in data/npcs.js). `darrenAsleep()` (scenes.js) is true from 23:00 until 7:00 on weekdays and 7:30 at weekends. The room's `bed` art then draws him on the right pillow (`.darrenBed`) with the covers pulled up, and the bed panel mentions him.

### Round 69: the stream from the sea, and paddling between home and the foreshore
- **Water:** an inlet off the sea (`MOUTH`, filled with the same `--sea` and edged with the shoreline's white foam dashes) narrows through the sand into a stream (`STREAM`, shore.js). The stream runs east at y≈55–70 and its blue eases from `--sea` to the river's `--water` (`#streamBlue` gradient). It enters the field at the top left (`INLET`, field.js), goes under a small footbridge on the lake path and feeds the lake. The lake's river already runs on through the orchard to home.
- **Home jetty:** `homejetty` (VILLAGE, base at [150,132]). `homeJetty()` in scenes.js draws a short boardwalk out over the river and three boards on a rack.
- **Choices:** tapping the home jetty or the foreshore's `suprack` sets `goalView = "jetty"`, which shows `jettyPanel(scene, evanHere())` (goals.js).
  - Foreshore: "Paddle about" (`data-sup="play"`, the old `familyPaddle`) or "Paddle home" (`data-sup="base"`).
  - Home: "Paddle to the foreshore" (`data-sup="shore"`).
- **The trip:** `paddleTo(dest)` (core.js) puts Mel, Maple and Evan (when he's around) on boards on the water, then about 1.3s later calls `setScene(dest, JETTY[dest])`; the scene fade is the blink. Mel steps off by the other rack. Paddling isn't allowed from 10pm to 6am.
- **Room for a future top row:** Mel plans four more screens above the foreshore, the field, the town square and Makers' Lane (ideas: a holiday house or ice cream shop above the foreshore; a forest or mountainside above Makers' Lane; an airport somewhere), each reached by a gate. Keep the top edge (y < 40) of those four screens free, especially the top middle. On the foreshore the stream stays below y≈50, so a north path there would cross it on a footbridge.

### Round 70: market gifts for Mum, Dad, Marcus and Angellina
- The kuehs and festive treats (kueh lapis, ondeh-ondeh, ang ku kueh, mooncake, bak kwa, pineapple tarts, bak chang, log cake) now go `to:["mama","gonggong","mum","dad"]`, with `says` lines for Mum and Dad. Bird's nest and chicken essence stay with the grandparents.
- New Family-tab gifts at Hana's market:
  - Marcus (lactose intolerant, loves protein): plant protein bar, beef jerky, grilled chicken bento.
  - Angellina: brown sugar bubble tea, pastel highlighters.
  - Both of them: oat milk latte, box of mochi.
  - Nothing dairy goes to Marcus.

### Round 71: Evan's room and garage doors swapped
- The garage door is now the living room's upper east door (Q:[480,330], INNER.garage.door [456,340]); Evan's room is the lower one (K:[480,512], INNER.kidroom.door [456,512]).

### Round 72: accessories in the wardrobe, the night market, one evening light everywhere
- **Wardrobe accessories:** `ACCESSORIES` and `wearing(F, k)` (wardrobe.js). The wardrobe lists the owned `me_*` decor (bow, scarf, hat, pyjamas) with a Wearing/Put on toggle (`data-acc`). The toggle is the same `F.decor[slot]` switch as tapping the item at Hana's. `dressMel` uses `wearing`.
- **Night market** (tours.js): `NIGHT` stalls, Tuesday and Thursday 18:00–22:00 at the field's stall spots.
  - `eventOn` returns `{kind: "night"}`.
  - Traders are new out-of-town NPCs (yun, jae, mina, tomas, sora, lior, wen, kai). Shoppers are `NIGHT_TOURISTS` (noa, jun, bea, omar, lucy, tae, ivy, rafe; all `tourist: true`, so they're hidden from who's-where) plus two villagers a wave (`nightShopper`).
  - Shopper slots are marked `night`. npcs.js `nightOk` drops one for anyone due at a tasting or at the wine shop by routine, so the evening regulars still come.
- **Goods:** 17 gift items with `tab:"night"` (street food, sweets, hair things, charms, socks and tees, drinks), each with `says` lines. Nothing dairy goes to Marcus. Lior's stall sells two decor items: `n_lanterns` (paper lanterns across the living room) and `r_moon` (a moon lamp by Mel's bed); `marketStallPanel` renders `st.decor`. Icons were added for these, and for last round's Marcus and Angellina gifts.
- **Art** (field.js):
  - `fairyLights()` replace the bunting.
  - `stage()` stands on the exercise lawn (the mats are hidden on night market nights). It has keys (Ella) and double bass (Otis), drawn with `personArt` and swaying, a light frame, and the tip hat `jazzhat` (VILLAGE spot; `tipBand()` costs 2 coins). The second picnic blanket isn't drawn at night.
- **Music** (audio.js): `TRACKS.jazz` (`live: true`, so it isn't on the record player). It has a swung walking bass (`walk`) and keys comping. `setLive("jazz")` takes over from the record while Mel is on the field during the night market. It's driven from `render()` and the 1-second interval, which also redraws the field when an event starts or ends.
- **Evening light:** `duskWash` (scenes.js) is a gentle multiply wash (#CDD1EE) used on every outdoor screen after 7pm. Home draws it under its lamps and windows, the field under the market, and core.js appends it for the other outdoor screens. Before this, only home had a (much darker) wash.
- **Sunset (round 72b):** `duskWash` is replaced by `skyWash(m)` / `skyColour(m)` (scenes.js), a multiply wash keyed through the day. It's white (no wash) by day, a warm sunset from 18:00 (#F9D9C2 at 18:45), the original dusk #A3A9DC by 19:30, darker from 21:00 into deep night (#5C6496) by 22:30. It lifts from 4:45 into a pink sunrise that's gone by 6:45. The colour is quantised to 5 minutes, and the interval redraws outdoor screens when it changes. Home lamps still light at 19:00 (`duskArt`).
- **Night lamps and labels (round 72c):** the street lamps' `.lglow` used to switch on only in phone dark mode, which was removed. After 7pm, `nightLights()` (core.js, run from drawScene on outdoor screens) now appends a `.nightcopy` group above the dusk wash. It holds lit copies of every lamp glow and glass (home already has its own `litLamp`s), and copies of every `tapeLabel` on white tape. Each copy keeps its on-screen position via `getCTM`, and copies ignore taps, so the originals underneath still take them.

### Round 73: no browser pop-ups (blocked in the artifact frame)
- The artifact frame blocks `confirm()` and `prompt()`: confirm() returns false and prompt() returns null, so the buttons using them silently did nothing.
- The bedtime card's "I really need to get up" now asks inside the card (`#bedSure`: "Yes, just tonight" / "Back to sleep").
- The bank's "Take some out" now uses the amount box.
- The tests fail if a dialog ever opens. Don't use confirm, prompt or alert anywhere.

### Round 74: the cleaning cupboard tidied
- Effort shows as word chips (quick, medium, big job) instead of dots. The timer buttons sit in an even row of three. There is more room around "One at a time" and the tabs, taller rows, and a bigger tap area on the remove button.
- Ticking a chore (in the list or "One at a time") offers Undo (`offerUndo`, hestia.js). Unticking also refunds the coin, as before.

### Round 75: bouquets go to the gift chooser
- Tapping a bouquet in the backpack opens the same chooser as gifts: the whole family (`FAMILY_ALL`), plus "near" (the nearest villager within reach) when someone is about.
- Someone here gets it in person (`bouquetTo`, or `giveBouquet` for a villager). Anyone else gets it sent round, and a thank-you note (`BQ_NOTE`) arrives about 10 minutes later.
- In the farm shop's flower rows, the Bouquet and Pot buttons sit on their own line under the name.

### Round 76: quests before the five-minute clean
- "do this now" was hidden on every quest until the five-minute clean was done (`phase() === "clean"`).
- Now any quest can be picked. Picking one first sets `S.cleanLater`, so the clean stops gating the day and waits at the top of the board as "Five-minute clean · waiting for later". Its own "do this now" (`data-cleannow`) brings it back.

### Round 77: the bay and The Scoop Shack (Mel's ice cream shop)
- **Map:** a new outdoor screen, `bay`, north of the foreshore. The foreshore's boardwalk (x=250) now runs to the top over a small footbridge across the stream, to the `toBay` arch; the bay's `toShoreB` arch leads back down.
  - Art in `src/art/bay.js`: the sea and sand continue up the west side; The Scoop Shack (`scoopshop`, a `house()` with a striped awning, a cone on the roof and the shop's name on its sign); `deck` (three umbrella tables, `DECK_SEATS`); and `reno`, a boarded-up shopfront with scaffolding and a "Coming soon: brewery? chocolatier?" sign (`RENO_LINE`).
- **Shop** (`ROOMS.scoopshop`): mint and pink. It has `gcounter` (the display case, drawn in `foreArt` so Sofia stands behind it, tubs in each flavour's colour), `gmenu` (chalkboard prices painted in the shell), `gtables` (tap to sit, Evan beside) and `gkdoor` to the kitchen.
- **Kitchen** (`INNER.scoopkitchen`, a door on the east wall back to the shop): `gfridge`, `gfreezer`, `gboard` (today's batches) and `gbench` (mixing).
- **Logic** (`src/game/scoop.js`, state in `F.scoop`):
  - `INGR` is everything that can go in a flavour: fruit, berries and some garden crops, flower stems (`fl_<flower>`), milk, honey, egg and olives. The fridge is stocked from the backpack, or straight from Ma Ma's farm shop shelf.
  - `discover(F, ings)`: any 1 to 4 ingredients make a flavour, and every combination is new. The id is the sorted combination; `nameFor` gives one or two ingredient names plus a style, or a poetic name for three or four. With milk it's a gelato, without a dairy-free sorbet. The first tub (20 scoops) is made on the spot.
  - `scoopTick` catches up minute by minute (up to 2 days). Tomo (`cookOn`: Monday to Saturday 8:00–16:00, except his 12:00–12:45 lunch) makes up to 4 batches a day, 45 minutes each. He makes what's ticked on the board in order, or, if nothing is ticked, tops up the flavours running lowest, whenever the fridge has the ingredients.
  - Sales happen 10:00–20:00. They are busier at weekends, mid-afternoon, Tue/Thu night-market evenings and while Mel stands at the counter, and slower at higher prices (`priceOf` is the price per type plus a special surcharge). Takings go to `F.coins`.
- **For Mel:** at the counter, a free one now (Mel holds `#melCone`; Evan holds an ice cream), or one to take away. Take-aways are gift items registered per flavour and type (`registerItems`, ids `gel_<type>_<flavour>`, icons `ic_<type>`). They go through the normal gift chooser; gelato (dairy) isn't offered to Marcus.
- **NPCs:** Sofia (counter, every day, lunch on the deck) and Tomo (kitchen, as above; Sunday afternoons on the foreshore).
  - Customers come from `scoopVisits` / `scoopSlot` (tours.js): 2–4 an hour from villagers, tourists, night-market tourists, families and Mel's family. Each queues at the counter for 6 minutes, then eats inside, goes to the deck, or strolls the foreshore with a cone (`act: "cone"`, drawn by people.js).
  - npcs.js `iceOk` only lets someone come when their routine leaves them free.
- Milk is now sold in Hana's Deli tab (4 coins); goats still give it free.

### Round 78: ingredients
- **Hana's deli tab** now sells gelato staples (all `kind: "ingredient"`, with icons, and in `INGR`): dark chocolate, vanilla, coffee beans, pistachios, hazelnuts, coconut, matcha, pandan, gula melaka, black sesame, fresh mint and bananas. Chocolate is meant to come from the bay's future chocolatier as well.
- **Grape crates:** picked grapes still go to `v.grapes`, now shown as "The grape crates" at the top of the barrel shed panel.
  - Take 1 or All puts `grape_red` / `grape_white` items in the backpack (ingredients for gelato); Put back returns them.
  - When Marco's "fills empty barrels" help is on, he only uses bunches beyond `v.keep[colour]`, which Mel sets with a stepper.
- **Wine shop larder:** each good is a "Take one" button (`data-k="take"`) that moves it back to the backpack. `isGood` now allows loaves (new `ITEMS.loaf`) to go back in. Note: Pilar cooks from the larder on her shifts.

### Round 79: Scoop Shack upgrades
- **Catalogue:** `UPGRADES` in scoop.js, bought with `buyUpgrade` into `s.up`. Opened from the shop's catalogue stand (`gupgrades`) or the "Shop upgrades" button on the counter panel (`data-gview="upgrade"`, `data-gbuy`).
- **Honesty freezer** (400): bay spot `hfreezer`.
  - Sells cups only, 7–10am and 8–10pm, while the shop is shut (`honestyOpen`). It uses the same tubs as the counter.
  - Coins collect in `s.box`, not Mel's purse. 15% of sales add an extra coin and a note (`s.notes`).
  - Collect them in its panel (`collectBox`). The panel's `scView` is "honesty".
- **Awning and fairy lights** (250): drawn on the deck. 25% of sales tip +1 (`t.tips`).
- **Neon cone** (350): beside the shop door. Sales ×1.3 from 5pm, including the honesty freezer.
- **Lit at night:** the neon and the fairy lights carry class `nglow`, which `nightLights` copies above the dusk wash.
- **Delivery bike** (800): bay spot `dbike`.
  - Its "deliver" panel is also reachable from the backpack's "Send an ice cream" button. It works 10am to 8pm.
  - A delivery takes a scoop from a tub and sends it to one of the family as a gift with a thank-you note.
  - Without the bike, a `gel` gift can't be sent round (it would melt): give it in person.
- **Chocolate dip station** (500):
  - INNER room `scoopdip` through the shop's east door (`gddoor`). Before purchase the door is dashed and opens the catalogue.
  - Stations: `gpots` (dips in `DIPS`, bought with `buyDip`), `gtops` (`TOPPINGS`, bought with `buyTopping`) and `gdipbar` (`makeDipped`, to eat or to give).
  - Dipped gifts are `gel_dip_<fmt>_<dip>_<top|none>_<flavour>`, registered from `s.dipIds` and the inventory. Milk, white and matcha dips count as dairy.
  - Customers: cones and waffles get dipped 25–60% of the time (more dips and toppings, more takers), paying `prices.dip` plus maybe `prices.top`. Both prices have steppers on the menu.
- **Mixing bench preview:** while ingredients are picked, `benchPanel` shows a result card (`.gresult`): a scoop in the blended colour, the flavour's name, and gelato or sorbet. Once mixed, it shows the new flavour (`scSt.made`, `.gresult.made`).
- **Grape crates layout:** the crates list uses `orflowers grcrates`, so buttons sit on their own line, and the keep-back stepper has its own labelled row (`.grkeep`).

### Round 80: choosing the display
- **The display:** it holds `SLOTS` (8) flavours, kept in `s.display` in slot order.
  - Until Mel changes it, `s.display` is undefined and `displayIds` fills it with whatever's in stock.
  - `onDisplay(s)` lists displayed flavours that have scoops left. Customer sales, the honesty freezer and the counter's free and take-away list only use those. The dip bar and the delivery bike can still take from any tub.
- **Changing it:** in the freezer panel (also reachable from the counter's "Change what's in the display" button), Take off or Put out a flavour (`data-gdisp`).
  - When all 8 slots are full, Swap in opens a chooser (`scSt.swap`, `data-gswapout`), and `setDisplay(s, id, out)` puts the new flavour in the chosen slot.
  - A displayed flavour that sells out keeps its slot, drawn as an empty tub.
  - A newly discovered flavour goes straight into a free slot, if there is one.

### Round 81: the Scoop Shack's night market cart
- **The stall:** `NIGHT` has a ninth stall, `{id: "tomo", at: 8, kind: "scoop"}`.
  - Place 8 (`STALL_SPOTS[8] = [306, 520]`, VILLAGE `mstall8`) isn't on the top row. It's on the grass between the middle path and the river.
  - field.js draws it as a pink cart under a striped umbrella (`cart`, `cartBody`, also the depth-sorted front).
  - Tomo minds it after his kitchen shift, with the usual keeper poses; his sitting crate is on the right.
- **Sales:** `cartMinute` (scoop.js, `cartOn` = Tuesday and Thursday, 6–10pm) sells cups and cones from `onDisplay` at the shop's prices, sometimes dipped.
  - Base rate .03 a minute, ×1.6 while Mel stands at the cart (`atCart()` in core.js).
  - Takings go to Mel and are tracked as `t.cart` / `t.cartCoins`. The field flashes "+N coins: the … cart".
- **Tapping the cart:** opens `counterPanel` in cart mode (`{cart: true, keeper}`), with free or take-away scoops. It's wired via `wireScoop` when `fieldView === "mstall8"`.

### Round 82: the village calendar
- **Where:** the good news board in the town square, between "Your wins" and "In the world". `goodNewsHTML(wins, cal)`; `villageCalendar()` in core.js builds the data.
- **Festivals:** from the exported `FESTIVALS` (village-extras.js), any festival in the next 92 days, or one running now, with a countdown.
- **The next 14 days, by day:** the field events (`eventOn`), the wine club if the cellar door is owned, and family dinners. The wine stall is only at the Sunday farmers market; the Scoop Shack cart is only at the night market.
- The cart's panel now says it serves from tubs already made, with no batches at the market.

### Round 83: Tomo serves, Mel makes the tubs
- **Tomo's new role:** he no longer cooks. He serves on the shop floor and the deck every day, 10–6 with lunch 1–1:45 (npcs.js routine, act "cone"; scoop.js `waiterOn`).
  - Shop sales are ×1.2 while he's on.
  - He does the delivery-bike runs; deliveries now go out 10am–6pm, outside his lunch.
  - He still minds the night market cart.
- **Making tubs:** `kitchenMinute` / `todaysQueue` / `cookOn` are gone. Mel makes tubs herself with `makeTub(F, id)`: one of each ingredient from the fridge, +20 scoops, into a free display slot if the display is arranged.
  - From the recipe book (station `gboard`, now "Recipe book", `recipePanel`, `data-gmake`).
  - Or at the mixing bench: picking a known combination shows "Make another tub".
  - A batch left over from an old save is finished straight away.

### Round 84: Luna and Ohayo houses; night market from 5:30
- **The houses:** Makers' Lane's two plots now hold the Luna house (a lavender observatory, door [160,520]) and the Ohayo house (a sunrise house with a noren curtain, door [362,520]).
  - Building art is in buildings.js (`lunaHouse`, `ohayoHouse`); rooms `luna` and `ohayo` in world.js, with shells in interiors.js. Each room has a desk, shelf, sofa, planning table and a health sign (`healthluna`, `healthohayo`).
  - `plotArt` remains for future apps.
- **Feeds:** `APPS` and `DOCS` in feeds.js include `health-luna` and `health-ohayo`. Each building shows a light on the lane, and a user garden appears once `stats.luna` or `stats.ohayo` has users. core.js uses `APP_IDS` / `APP_NAME`.
  - The Village feeds routine still only reads the Chord and Chico founder pages. Add the Luna and Ohayo founder desk URLs to its prompt once they exist.
- **Quests:** routed by `/\bluna\b/` and `/ohayo/`; both houses are in `WORK`.
- **Night market:** now 5:30pm to 10pm (tours.js `eventOn`; scoop.js `cartOn` and the evening boost).

### Round 85: more stall goods, rotating
- **The goods:** `src/data/stall-goods.js` has 77 more gifts (`GOODS`) for the Sunday market, the field fair and the night market. That's about three times the old range.
  - Each good names an icon shape and colours (`art`). icons.js draws them with a set of shape makers (jar, bottle, cup, bun, clip, sock, lantern, and so on).
  - items.js merges them into `ITEMS`.
  - Dairy goods leave Marcus out of their `to` list.
- **The rotation:** `POOLS[eventKind][keeper]` lists each stall's extra range. core.js `todaysGoods(st, day)` shows the stall's signature item (the first of its tours.js `items`) every time, plus `max(2, items.length)` picks from the rest of the range. The picks are ordered by `hash(day:keeper:item)`, so a given market day always shows the same mix and different days differ.
  - Lior's lantern decor stays on every night; its gifts rotate.

### Round 86: keepsakes and pets
- **Keepsakes** (`kind: "keepsake"`, 12 in stall-goods.js, sold in the stalls' rotating pools: Tomás, Lior, Grace, Felix, Ben, Dev, Sora, Wen):
  - From the backpack they go on a wall shelf: two each in the Scoop Shack, the wine shop, home, Mel's room, Chord, Chico, Luna and Ohayo (companions.js `KEEP_SPOTS`, drawn by `keepsakesIn`).
  - Placing one where another stands sends the old one back to the backpack. Tap a placed one (`data-keep`) to take it down. Stored in `F.keeps = {spot: item}`.
- **Pets** (`kind: "pet"`, 8 kinds) come from Noor's adoption corner (new NPC `noor`), on the grass by the river at place 8, on Sunday markets and field fairs:
  - The kitten is always there; the other pets rotate.
  - From the backpack, choose an owner, then a home from `PET_HOMES` (19 screens; the hamster, goldfish and budgie live indoors only).
  - Stored in `F.companions = [{id, kind, name, owner, scene, spot, since, patDay, playDay}]`, drawn by `petsIn` with a gentle bob.
  - Tap a pet (`data-pet`) to pat it (xp once a day). When its owner is on the same screen, they can play together: a line for the pair and one from the owner, xp once a day. You can also rename it or move its home.
  - An owner who isn't there sends a thank-you note.

### Round 87: The Cocoa Room, step 1
- **Opening it:** a big goal (`goals.js` "cocoa", 1000 coins), bought by tapping the bay's boarded-up shopfront (`reno`).
  - Once owned, bay.js draws the shop there: cocoa walls, a striped awning, a window of chocolates, and a sign with its name. VILLAGE `cocoa`, door [396,516].
- **Rooms:**
  - `cocoa` (shop front): counter `ccounter`, whose front is drawn over the people in foreArt so Amara stands behind it; bar wall `barwall`; tables; kitchen door `ckdoor`.
  - `cocoakitchen`: `sacks`, `roaster`, `grinder`, `slab`, `moulds`.
- **cocoa.js** (state in `F.cocoa`), bean to bar, all done by Mel:
  - Buy a sack (10 coins).
  - Roast it (10 min, `ROAST_MIN`).
  - Grind it as milk, dark or white (2 h, `GRIND_MIN`).
  - Temper it on the slab (+30 pieces).
  - Mould 10 pieces into 10 bars on the wall.
  - Timers use the game clock and finish when ticked (`cocoaTick`).
- **Sales:**
  - Open 11–8, Tuesday to Sunday.
  - Base rate .03 a minute; ×1.4 at weekends, ×1.2 from 3 to 6pm, ×1.5 while Mel's at the counter. 30% of customers buy two bars.
  - The bar price is set at the counter, where Mel can also rename the shop.
  - Mel can have a bar or take one to give (gift items `bar_milk`, `bar_dark`, `bar_white`; dark is dairy-free).
- **Amara** (npcs.js) serves Tuesday to Sunday, 10:45–8:15, once the shop is owned. Routine slots' `needs` now also checks `F.goals`.
- **Still to come, steps 2–4:** bonbons (discovery, display case, gift boxes, recipe book), the Scoop Shack and wine shop links, festival specials, and the upgrades catalogue.

### Round 88: The Cocoa Room, step 2 (bonbons)
- **New kitchen stations:** the fillings pantry `pantry` (P) and the bonbon table `bonbon` (B). In the shop front, a display case `case` (D).
- **Pantry:** fillings come from the backpack's ingredients (`isFilling`, which is INGR minus milk, egg, olives, corn, carrot and tomato). `stockPantry` moves them in. Orchard fruit can also be stocked straight in.
- **Making bonbons:**
  - Choose a shell (milk, dark or white; it uses 6 pieces of tempered chocolate, `SHELL`) and one or two fillings.
  - `makeBonbons` makes a tray of 12 (`TRAY`) and gives the combination a name (`bonbonName`). The panel previews it before you make it.
  - A combination you haven't made before is a discovery: it goes into `F.cocoa.bonbons` with xp and a toast.
- **Display case:** holds 6 kinds (`CASE`). Tap a kind to put it in or take it out (`toggleDisplay`).
  - `cocoaTick` sells bonbons in half of sales: 2–4 at a time, at `prices.bonbon` (3 coins by default, set at the counter).
- **Boxes:** `packBox` packs 4 or 9 bonbons into `box4`/`box9`, which are gift items in stall-goods.js. You get `box4d`/`box9d` (dairy-free) when every bonbon in the box has a dark shell. You can also eat one (`eatBonbon`).
- **Still to come:** step 3 (house chocolate for the Scoop Shack and dip station, wine pairings, festival specials) and step 4 (the upgrades catalogue and a night market stall).

### Round 89: Mateo, the Cocoa Room's kitchen hand
- **Who he is:** Mateo (npcs.js) works in `cocoakitchen` from 9 to 6, Tuesday to Sunday, once the shop is owned. He moves between the stations.
- **What he does:** in `cocoaTick`, each minute of his shift runs `handStep`:
  - Temper a finished pot.
  - Start a grind when roasted beans are waiting.
  - Roast a sack when none is roasted, auto-buying one if allowed.
  - Mould loose chocolate into bars, up to 40 of each kind on the wall (`WALL`).
  - Timers now finish at the simulated minute (`finish(c, t)`), so catch-ups while Mel's away keep the line moving.
- **The bonbon shelf:**
  - Mateo's tempered pots go to `c.res[kind]` first, up to Mel's targets `c.keep` (default milk 30, dark 30, white 0). Only the rest becomes loose `c.choc`, and only loose chocolate is moulded.
  - `nextKind` grinds whichever kind is furthest below its target; otherwise, the kind with the fewest bars.
  - Mel's own pots from the slab stay loose.
  - Bonbon shells take from the shelf first, then from loose chocolate (`shellChoc`).
- **Kitchen plan** (`planPanel`, at the counter):
  - Pause or resume Mateo (`c.plan.on`).
  - Shelf targets per kind, in steps of 6.
  - Auto-buy (`plan.buy`, on by default).
  - A coin floor (`plan.floor`, 200, in steps of 50) he never spends below.
  - Sacks he leaves alone (`plan.hold`).
  - `c.bought` counts the sacks he's bought.
- **The away message** says what he did: pots, shelf pieces, bars, sacks bought.
- **Tests:** the Cocoa Room block pauses Mateo for Mel's hand-made run, then checks two days of his shifts from empty and the plan controls.

### Round 90: Mateo goes part-time; the Cocoa Room, step 3 (village links)
- **Mateo is a part-time student now:** shifts are Wednesday and Friday 2–6 and Saturday 10–5 (cocoa.js `HAND` by weekday; the npcs.js routine matches). Over two days that's about 5 pots instead of 9.
- **Scoop Shack:**
  - At the moulds, 10 loose dark pieces (`sendScoop`) go one of two ways:
    - 5 "Cocoa Room chocolate" (`housechoc`, a new gelato ingredient in scoop.js INGR, not a bonbon filling) into the gelato fridge.
    - With the dip station built, 20 house-made dark dips (`s.houseDips`, `DIPS.house`, which can't be bought).
  - Customers who get a dipped cone pick house-made dark 45% of the time while there are dips, paying `HOUSE_EXTRA` (2) more.
  - The dip bar offers it while dips are left (`dipReady`).
- **Wine:**
  - The fillings shelf can open a bottle off the wine shop shelf into 4 wine fillings (`WINE_FILL` `wine_<style>`; `FL()` looks up INGR or WINE_FILL).
  - The counter packs a wine pairing box: a bottle plus 4 bonbons from the case (`packPairing`, gift `pairbox`, adults only).
  - On wine club nights (with the cellar door), `cocoaTick` has members buying bonbons or bars, counted in `sold[day].club`.
- **Festival specials** (`SPECIALS`, `specialOn(day)` via `festivalOn`):
  - Christmas yule log: 12 dark make 4, at 18 coins.
  - Chinese New Year gold coins: 12 milk make 6, at 12 coins.
  - Deepavali spiced box: 12 dark make 6, at 12 coins.
  - Mid-Autumn chocolate mooncake: 12 white make 6, at 10 coins.
  - They're made at the bonbon table during the festival window, sold beside the case while the festival's on (shown in the case panel), and can be taken to give from the counter (gifts `sp_*` in stall-goods.js).
- **Tests:** the Cocoa Room block covers each link. `smoke.mjs` also gets back its Scoop upgrades `c0` line, which round 89 removed by mistake.
- **Still to come, step 4:** the upgrades catalogue, then the night market stall.

### Round 91: The Cocoa Room, step 4 (upgrades and the night market cart)
- **The catalogue:** "Shop upgrades" on the counter panel (`ccView "ups"`, `upsPanel`, `buyCcUp`, state in `c.up`). There are ten, 4450 coins in all (`CC_UPS`):
  - **Window display (300):** sales ×1.2. bay.js draws tiered stands and twinkling lights in the window.
  - **Hot chocolate bar (400):** `hotMinute` sells cups from loose chocolate, 1 piece each, at `prices.hot` (5).
    - Busier in the evening, on rainy days and in the wet season.
    - The counter has a price stepper and "Have a hot chocolate" (`haveHot`). The cart sells it too.
    - A steamer is drawn on the counter (`ccCounterUps` in scenes.js).
  - **Second grinder (600):** grinder slots `""` and `"2"` (`grind2`/`ground2`), with `slots`, `freeSlot` and `readyPot`.
    - Mel and Mateo both use free slots; tempering takes whichever pot is ready.
    - A smaller second grinder is drawn (`grinder2`).
  - **Gift wrapping (350):** a quarter of bonbon customers buy a boxed 4 (+3 coins). The counter packs a grand box of 16 (`box16`/`box16d`).
  - **Cacao tree (500):** a free sack every 2 days (`c.treeAt`). Not drawn in the orchard yet.
  - **Chocolate fountain (450):** a quarter of sales leave a 1-coin tip. Evan reacts on arrival. Drawn on the counter.
  - **Scoop supply deal (250):** from 9am each day, 10 loose dark pieces become 5 `housechoc` in the Scoop fridge (`c.supplyDay`).
  - **Weekend workshops (700):** Saturday 2–4, paying 48 coins at 4pm (`sold[day].workshop`). It's also on the village calendar. No class is drawn at the tables yet.
  - **Second assistant (500):** Lila (npcs.js) works Mondays and weekend afternoons; the shop opens Mondays (`openOn(day, hm, mon)`), sales ×1.1.
    - Routine `needs` can now name a Cocoa upgrade as `cc_<k>` (npcs.js `routineAt`).
  - **Night market cart (400):** tours.js NIGHT gets `{id: "mateo", at: 9, kind: "cocoa", needs: "cc_cart"}`.
    - Stalls with `needs` only stand once core.js `setStallOwned` says so.
    - `STALL_SPOTS[9]` is [196,520], with a world place `mstall9`. field.js draws `ccCart`/`ccBody`.
    - `cocoaTick` sells there Tue/Thu 5:30–10, ×1.6 while Mel's at it (`opts.cart`). Its panel is the counter panel with `cart: true` (no plan, upgrades or rename).
- **Selling** now goes through `sellTo(c, day, out, o)`: bonbons (sometimes boxed), bars or hot chocolate. It's shared by the counter, the cart and the wine club.
- **Tests:** the Cocoa Room block (39 checks) buys everything and checks each upgrade, Lila on a Monday and the cart on a Tuesday night.

### Round 92: the ice cream churner, the cart moves to Sunday, cacao tree and workshop art, wine name suggestions
- **The churner (scoop.js):**
  - Every tub, whether a new flavour's first or another of a known one, now spends `CHURN_MIN` (60) minutes blending and freezing before its 20 scoops are ready.
  - The churner holds `CHURNS` (2) batches at a time: `s.churn = [{id, done, isNew}]`.
  - `finishChurn(s, t)` runs in `scoopTick` (`out.churned`) and in the panels (`churnLine`). Finished tubs go to the freezer, and into the display if it's arranged and has room.
  - `discover` and `makeTub` refuse, and `canMake` is false, while the churner's full.
  - core.js says "Ding! … frozen and ready" in the Scoop screens and the bay. `scoopNow()` also runs on arriving at those screens, so finished tubs and sales catch up straight away.
- **The Cocoa Room's cart is a Sunday farmers market cart now, not a night market one.** In tours.js it's a MARKET entry at place 9, beside Noor's pen, which stands where the Scoop Shack's cart does on night market evenings. `cartOn` is Sunday 8–1, and the calendar mentions it on market days.
- **The cacao tree** is drawn in Ma Ma's orchard on the hedge line, top right (orchard.js `cacaoTree`).
- **The Saturday workshop class:**
  - tours.js `workshopSlot` / `workshopGroup` seats six visitors and tourists at the Cocoa Room tables, 2–4. It's gated by core's `setStallOwned` map, which now includes `cc_workshop`.
  - Trays, piping bags and a "Bonbon workshop today" note appear on the tables.
  - Tapping the tables during the class gives a line (and one from Evan).
- **Wine names:**
  - vineyard.js `wineNames(F, slot)` gives a ready barrel 12 suggestions, never repeating a name in the cellar or on the shelves. They come from three patterns: village places and moments plus a style word, family names plus places, and French ones per style.
  - The first suggestion is the input's placeholder, and is used if the name's left blank. "Suggest a name" cycles through the rest.
- **Testing:** `block.py` needs the exact `console.log("\nthe vineyard")` marker; plain "the vineyard" finds another block first.

### Map plan for the top row (agreed with Mel, round 93)
- Above the foreshore: the bay (built).
- **Above the field: the farm** (Felix and Elena's). It has the farmhouse, barn (milking; the dairy and cheese cave inside), cow and goat paddocks, beehives along a lavender hedge, and a farm stand by the gate. It's reached through a gate on the bay's east edge. The lake is south of it.
- **Above the town square: the cottage lane and the train station**, at the foot of an incline (the start of the hill). It has four holiday cottages and the station, where guests arrive by train. This replaces the old airport idea.
- **Above Makers' Lane: the base of the hill**, covered in trees. Not decided yet.
- **Farmstay decisions:**
  - Felix and Elena run the farm, and Mel helps and takes produce.
  - Honeysuckle cottage is Mateo and Lila's; Clover is Noor's; Bluebell and Fig Tree are holiday lets that Mel can later buy (about 3,000 and 2,000) and do up.
  - The decor styles are Cottagecore, Japandi, Coastal, Mid-century, Peranakan and Scandi. Turnover is hands-on by default, with a housekeeper available to hire.
  - Cheeses get suggested names, like wines and bonbons.
- **Round 93:** the cacao tree moved inside the orchard, on the east side by the fruit trees (`cacaoTree` at 484,470). It's a tappable place (`cacao`, world.js) that says when the next sack is due, and Ma Ma chimes in if she's there.

### Round 94: Honeybrook Farm, step 1 (the farm screen)
- **Decisions:**
  - The dolphin cruise boat now costs 4,500 (goals.js), so it's the priciest vehicle. The campervan will be about 3,800, above the car's 3,500.
  - The campervan stays parked as a place to stay, with future road trips off the map. Train times go on a platform board only, not the village calendar, and train tickets will later lead to other destinations.
  - Honeybrook (the brook) runs along the top of the cottage lane, farm and bay, under the railway, and out to sea. It never crosses the field, so the market stays clear.
  - The river: the waterfall in the woods is the source. It runs down through Makers' Lane and the vineyard, along the top of the home screen, through the orchard, into the lake, and out to the foreshore.
  - There's no gate between the farm and the field: one would land on the market stall row.
- **The screen:** `hfarm` (OUTDOOR), east of the bay through `toFarmB` (bay.js gate at 498,520) and back through `toBayF`.
  - `hfEast` is the future lane to the cottages (just a line for now).
  - Art is in `src/art/hfarm.js` (`hfarmArt`):
    - The top strip (y < 120) is kept for the railway and the brook. The shared post-and-rail fence runs at y=122.
    - Along the top: the farmhouse (`house()`), the lavender bed with five painted hives, and a red gambrel barn.
    - The cow and goat paddocks below, with SMIL grazing and hopping, a trough and a climbing spool.
    - The farm stand, a "Honeybrook Farm" sign and a lamp.
  - Obstacles are in paths.js `hfarm`. The bay's bottom-right pine moved to make room for the gate.
- **Logic:** `src/game/hfarm.js`, state in `F.hfarm`.
  - `feedHerd` is per herd, each day. `brush` is per animal, each day, for XP and a line.
  - `milkOne` / `milkHerd` work 6–10am, once a day, if the animal was fed today or yesterday. A cow gives 2 `milk`, a goat 1 `goatmilk`.
  - Five hives fill over `HIVE_DAYS` (3) days, staggered from the start. `collectHives` gives 2 honey per full hive.
  - The farm stand (`STAND`) sells milk 3, goat's milk 4, honey 6 and eggs 3.
  - Panels: `herdPanel`, `hivesPanel`, `standPanel`. core.js `hfView` and `wireFarm` (`data-hf`) handle them, with Felix, Elena and Evan lines.
- **Goat's milk:** a new ingredient (`goatmilk`, items.js, icon, scoop.js INGR). `isDairy` makes a flavour with it a gelato. It isn't a bonbon filling.
- **Felix and Elena** are farm residents now (npcs.js), not tourists.
  - Felix works the hives and the paths, with a lunch sit by the farmhouse. Elena works the paddocks and the barn front.
  - They still keep their Sunday market stalls (eventSlot).
  - In the tourist list, Rosa and Bastien replace them (npcs.js, tours.js `TOURISTS`).
- **Tests:** a new "Honeybrook Farm" block. The big-goals test now starts with 13,000 coins, for the new boat price.
- **Still to come, step 2:** the dairy and cheese cave inside the barn (cheeses that take time, with suggested names) and the honey hut.
- **Round 94b:**
  - The bay's gate to the farm moved up into the gap between the Scoop Shack and the Cocoa Room (500,374), labelled "Honeybrook". The honesty freezer's label moved left to make room, and the bottom-right pine is back where it was.
  - The farm's west gate lines up with it, at (22,280), on a little track between the farmhouse and the cow paddock.
- **Round 94c:**
  - The honesty freezer sits against the Scoop Shack's front wall, right of the door (bay.js `translate(-4 -32)`, place door 432,290). It's outside so it can sell while the shop's shut.
  - The farm's paddocks are smaller and lower (cows 54–216, goats 304–466, y 336–470), with paths round them at x=30, x=490 and y=282.

### Round 95: Honeybrook Farm, step 2 (the barn)
- **The barn is a room now** (`ROOMS.barn`, entered from the farm's `barn` place). Its shell is in interiors.js: red planks, straw, a beam with lanterns and a hay door. Stations:
  - `stalls` and `hayloft`: just lines.
  - `extractor` (the honey extractor), `crock` (yoghurt crocks), `press` (the cheese press, furniture kind `hfpress`, since `cheesepress` is the wine kitchen's), `cave` (the cheese cave, which draws a wheel on its shelves for each one ageing).
  - Station taps go through the room-spot handler (beside the Cocoa Room's), setting `hfView`. Panels are in hfarm.js; actions run through `wireFarm`.
- **Honey:**
  - Collecting a full hive now gives 2 frames (`h.frames`), not jars.
  - The extractor (`spinFrames`) turns frames into jars of this week's honey (`honeyNow`, rotating weekly): wildflower `honey`, `honey_lav` or `honey_blossom`. The new two are gift items, gelato ingredients and bonbon fillings.
- **Yoghurt:** `makeYoghurt` turns 1 milk or goat's milk into 1 `yoghurt` (an ingredient; dairy in gelato, so frozen yoghurt).
- **Cheese:**
  - `CHEESES`: fresh goat's cheese (2 goat's milk, 1 day, 4 wedges), farmhouse cheddar (3 milk, 4 days, 6), Honeybrook blue (3 milk, 6 days, 6).
  - `pressCheese` puts a named wheel on one of 6 cave shelves (`h.cave`). `cheeseNames` suggests names from farm places, the animal and French ones, never repeating a name used before (`h.names`).
  - The press panel works like the wine bottling: the first suggestion is the placeholder (used if blank), and "Suggest a name" cycles through the rest. `hfSt` holds the choice.
  - `takeWheel` cuts a ripe wheel into wedges: `chz_fresh`, `chz_cheddar`, `chz_blue`. They're gift items; none go to Marcus, and only the adventurous get the blue.
- **Elena** spends 11–1 in the barn. Evan follows Mel onto the farm and into the barn.
- **Not done yet:** the cheeses don't reach the wine shop's tapas, Elena's stall or Ma Ma's farm shop. That could come later.

### Round 96: the town is Honeybrook; the farm is Wildflower Farm
- Mel named the town **Honeybrook** and the farm **Wildflower Farm**; every "Honeybrook Farm" is now "Wildflower Farm". The cheese "Honeybrook blue" and the station keep the town's name.
- The Good News board has a masthead, "The Honeybrook Gazette" (feeds.js).
- The town square has a "Welcome to Honeybrook" sign, and the station road gate (`toStationV`, top middle) up to the lane. The tree that stood there was removed.

### Round 97: the cottage lane and Honeybrook station (farmstay step 3)
- **The screen:** `hlane` (OUTDOOR), east of Wildflower Farm through `hfEast` and back through `toFarmL`. The station road goes down to the town square: `toTownL` here, `toStationV` there. Art is in `src/art/hlane.js`:
  - Along the top: the track, the platform between it and the brook (shelter, "Honeybrook" sign, `timetable` board), a footbridge down to the lane, and the fence at y=122.
  - Four cottages:
    - `honeysuckle`: Mateo and Lila's, a room.
    - `clover`: Noor's, a room, with a pen of rescues beside it.
    - `bluebell` and `figtree`: holiday lets, spots that say who's staying this week.
  - The windmill (`windmill()`, sails rotating on a 28s loop), goats and sheep on the slope, a hen house, a hive in Honeysuckle's garden, and a `vanspot` (Campervan spot) waiting for step 4.
  - Trees thicken to the east.
- **The railway:** `src/art/railway.js` has `track`, `brook`, `trainArt` and `trainLayer`. The bay, farm and lane all draw the track and brook along the top; the bay's line crosses a trestle over the sea at its top-left, and the brook runs out to sea there.
- **Trains:** `src/game/rail.js`.
  - `TRAINS`: 7:40 milk train west, 9:15 east, 1:20 west, 5:05 east, and 10:30 west on Tuesdays and Thursdays only.
  - `trainHere(scene)`: the lane sees each train arrive (t-1), wait (t, t+1) and depart (t+2). Eastbound trains pass the farm at t-2 and the bay at t-3; westbound ones pass the farm at t+3 and the bay at t+4.
  - The train is SMIL-animated across its minute with a negative `begin`, so redraws carry on from where it is. core.js redraws when `trainKey` changes, and says a line as one arrives or passes.
  - `timetablePanel` is the only place train times appear (`railOpen`). The ticket window says it opens when there's somewhere to go.
- **People:**
  - tours.js `trainSlot`: today's tourists on tours walk down the lane off the 9:15. On Tuesdays and Thursdays the night-market crowd comes in on the 5:05 and waits on the platform for the 10:30.
  - `letSlot` / `letGuests`: two tourists per holiday let for the week (keyed by Monday), on the porches 7:30–9 and 6–9:30pm.
  - Mateo (mornings and evenings) and Lila (evenings, and weekday mornings) are at Honeysuckle. Noor has a routine now (not a tourist): her garden at Clover in the mornings, the porch 4–7:30.
- **Interiors:** shells for Honeysuckle (bunting, rag rug) and Clover (sage walls, paw prints, pet bowls). New furniture kind `petbeds`.
- **Tests:** a "Honeybrook station" block with 14 checks.

### Round 98: the campervan (farmstay step 4)
- **A big goal** (goals.js `van`, 3,800), bought by tapping the `vanspot` on the cottage lane.
  - Once owned, hlane.js draws `campervan(420,588)`: cream over mint, a pop-top roof, round headlights, a spare wheel. Its window curtains take the chosen curtain colour, and fairy lights twinkle along the roof if lights are chosen.
  - It's the `van` place, which leads into `ROOMS.van`.
  - It doesn't drive around town (Mel's call). Road trips off the map come later.
- **Inside** (interiors.js `van` shell): a curved ceiling with a starry roof window, two round windows with curtains, and a string of lights if chosen. Stations:
  - `vbed`: a line, plus one from Evan.
  - `vkitchen`: shows the plant, if chosen.
  - `vtable`: the rug goes under it.
  - `vboard`: the mood board.
  - Furniture kinds `vanbed`, `vankitchen`, `vantable` and `vanboard` read the decor through scenes.js `vanSt`.
- **Decor** (`src/game/van.js`, state in `F.van`):
  - Six `SLOTS` (bedding 40, curtains 30, lights 25, rug 30, cushions 20, plant 15) in six `STYLES`: Cottagecore, Japandi, Coastal, Mid-century, Peranakan, Scandi. Each piece has its own name.
  - `vanPick` buys a piece once, then swaps freely; `vanClear` takes it out.
  - `vanLook` / `lookLine` judge the look: dressed count, main style and share, from "All Coastal" to "Eclectic! Or a bit chaotic". It's meant to be reused for the cottages' rating later.
- **core.js:** `vanView` / `vanSt`, `moodPanel`, `data-van` actions. Evan follows into the van.
- **Tests:** a "the campervan" block.
- **Round 98b:** the van's inside is redrawn as a long, narrow van seen from the back doors: the bed across the far end under the roof window, side windows with curtains, lights down both walls, the kitchenette and table along the sides. A narrow walkable aisle (`bounds` [182,210,338,612]).

### Round 99: farm life (Wildflower Farm gets deeper); home goats give goat's milk
- **Home goats** (pets.js, the animal run) now give `goatmilk`, not `milk`, so goats always mean goat's milk. Milk comes from the farm's cows and the stand.
- **Trust** (`h.trust`, `LEVELS`, `levelOf`, `gainTrust`; core.js `farmTrust(n)` celebrates each new level):
  - Earned from chores: hay 2, brush 1, muck out 2, milk 1 (2 for milking the herd), collecting hives about 1 per frame, turning cheese 2 a day, latching the gate 1, catching a runaway goat 3, a request 10.
  - **Helper (0).**
  - **Trusted hand (40):** Mel's own hive (`h.myHive`, at `MY_HIVE_SPOT` with a flag, renameable; gives `MY_FRAMES` 4) and her own veil.
  - **Apprentice (100):**
    - The press offers brie, halloumi and smoked (`lvl: 2`).
    - At the extractor, frames can be cut as `honeycomb` and jars creamed into `honey_cream`.
  - **Partner (200):**
    - A shelf at the farm stand (`stockShelf`; `hfTick` sells from it 8–6 at full price).
    - Nine cave shelves instead of six (`caveSize`).
- **Moods:**
  - `moodOf` is 0, 1 or 2: hay today or yesterday, plus a brush and a mucked-out stall (`muckOut`, per herd per day).
  - Yield: a cow gives 1/2/3 milk, a goat 1/1/2. Animals can now be milked unfed; they just give less.
- **The goat gate:** `latchGate` in the evening. If it wasn't latched the night before, a goat is out 60% of the time (`strayGoat`: a deterministic goat and spot). Tap the `stray` place to round it up.
- **Bees:**
  - `beeTime` counts rainy days as half (`rainyOn`). A hive left full past `SWARM_DAYS` (2) swarms (`swarmCheck`, in `hfTick`), losing the batch.
  - The panel warns when a hive is restless.
- **Cheese:**
  - `turnWheels` turns each ageing wheel once a day (`w.turns`).
  - `quality` is excellent (≥75% of its days turned), good (≥35%) or rustic. Excellent cuts give `<id>_ex` items (registered in hfarm.js from items.js, +5 price, a warmer line, icons with a star); rustic gives one wedge fewer.
- **Requests:** `REQUESTS`, one a day (`requestToday` by hash). Some ask for things (3 eggs, 2 apples, 2 carrots), others for a job done today (muck out both stalls, brush all the cows, turn the wheels, milk everyone, help Felix move a hive while he's there). They're shown in the new `farmhousePanel` (tap the farmhouse) with the trust bar and what's been earned.
- **New items:** `chz_brie`, `chz_halloumi`, `chz_smoked`, `honey_cream`, plus `_ex` versions of every cheese.
- **Tests:** a new "farm life" block. The old cheddar check now expects a rustic five wedges.

### Round 100: rain all year, everyone's own rain gear; fishing
- **Rain** (village-extras.js `rainLevel`): 0 dry, 1 light shower, 2 downpour. Nov–Jan: 34% downpour, 10% shower. Other months: about 14% shower (about 12% measured). `rainyOn` = any rain; `stormyOn` = downpour (only that calls off the family paddle). The `#rain` overlay gets class `light` for showers; the arrival line says "A light shower today. Brollies up!".
- **Rain gear** (people.js):
  - `rainGearFor(seed, {coat, brolly})` gives each villager their own: a coat for about a third of them, otherwise a brolly. Brolly patterns: solid, stripe, dots, scallop, check, clear, paper. Colours come from `BROLLY_COLS` / `COAT_COLS`.
  - `brollyArt`, `hoodArt`, `coatArt` (class `rcoat`); coats bring wellies and sleeves.
  - npcs.js `makeNode` adds `look.rain` outdoors (`OUTDOOR`) on rainy days. Anyone holding a prop in the right hand gets a coat; no gear on a paddleboard.
  - Mel: `#melRain` with `MEL_BROLLY` (periwinkle, white dots). Evan: `#evanRain` hood, class `raincoat` (yellow `--tee`, `.esleeve`, `.welly`). Both set in core.js `dressRain()` from `dressMel`.
- **Fishing** (fishing.js; art/fishing.js):
  - Spots: places `fishriver` (base), `fishlake` (field), `fishsea` (shore), each with a post (`fishSpotArt`).
  - `FISH`: 17 entries by spot, `when` (day/dawn/dusk/night), `rain`, weight, size and `hard`. The golden koi is dusk on the river; `F.fish.koi` (up to 3) is drawn in the home pond (`koiArt`). The boot and sea glass are journal-only.
  - Bait: `BAIT_DAY` 3 worms each morning, plus 1 per quest (`countQuest` calls `addBait`), up to 20.
  - Rod 80, better reel 400 (green zone ×1.35).
  - A cast: bite after 2–6 s; the marker sweeps (`DUR` 900 ms each way, `markerAt`). Reeling in the green lands it (`land`); reeling early loses it; it escapes after `ESCAPE` 3.5 s.
  - Panel `fishPanel` (Fishing / Journal tabs). Mel's `#melRod` (class `bite` when it bites). core.js: `fishSpot`, `fishSt`, `fishGo`, `fishBite`.
  - New items (kitchen ingredients): trout, crayfish, sardine, mackerel, seabream, squid, octopus. Other fish give the existing `fish` item.
  - Seven seafood tapas, all year: sardinas, escabeche, calamares, pulpo, dorada, trucha, cangrejos.
- **Tests:** "rainy days" and "fishing" blocks.

### Round 101: balance (phase 1) and more uses per item (phase 4)
- **Phase 1:**
  - Quests pay 8 (`QUEST_PAY`, was 5), including Sunsama and treadmill subtasks. Finishing a routine pays 8 (`ROUTINE_DONE`).
  - Wine: price elasticity, `winePf(s)` = (style price / price)^1.3, capped at 1.6. It applies to shop bottles and glasses, the market stall, the wine club and tourist souvenirs. The shelf shows "pricey: fewer buyers" or "a bargain".
  - Cacao beans cost 25 a sack (`SACK`, was 10).
  - Catch-up is 24 h everywhere: vineyard and orchard were 12 h; Scoop, Cocoa and farm were 2 days.
  - Ma Ma's farm shop sells 5× more (.008/min).
  - The kitchen press takes goat's milk. Larder **groups** (kitchen.js `ALT`, `larderCount`, `GROUP_ICON`): cheese (deli, press or any `chz_*`), milk (milk or goatmilk), farmcheese, halloumi, bluecheese, cheddar, honey (any honey jar, creamed included), petals (garden tulip or sunflower). Farm cheeses, honey jars, honeycomb, yoghurt, pears and figs can be brought into the larder.
- **Phase 4:**
  - New small plates: farm cheese board (12), honey cake, flower shortbread, blueberry tart.
  - New tapas: huevos rotos, Ma Ma's tomato and egg, yoghurt with honey, grilled halloumi with honey, Honeybrook blue with pear, apple and cheddar tostas, leek and cheese tart, honeycomb with farm cheese. That makes 28 tapas.
  - Peas now run spring and summer; leek soup autumn and winter. Pea and mint gelato (`INGR.pea`).
  - **Chef's request** (`requestOf(day)`): a villager craves one in-season tapas; as the tapas of the day it sells at 1.5× (`tapasPrice`). Pilar picks by `tapasPrice`.
- **Parked (Mel said not yet; keep for later):**
  - **Phase 2, stars:** a real-life-only currency for big buys. On hold: Mel doesn't want stars piling up with nothing else to spend them on.
  - **Phase 3, ongoing costs:**
    - Staff wages with a Sunday report (takings − wages − ingredients).
    - Train tickets to destination screens (150–600 a trip).
    - Van road trips (fuel and campsite fees).
    - A weekly animal feed bill.
  - **Phase 5, growth ladder and small wins:** Honeybrook Woods, buying and renting cottages, and a collection book with stickers for fish, flavours, wine labels and cheeses.

### Round 102: phase 4, the rest
- **Hen treats** (pets.js `canTreat`, `scatterTreat`; `P.treat` = day): one garden sunflower scattered in the run (a button in the run panel). For the rest of that day every grown hen lays 2 eggs a meal. `feedOne` now returns `egg` as a count.
- **Petal syrup** (kitchen.js `makeSyrup`, `SYRUP_PETALS` 3): made at the larder from 3 garden flowers (the `petals` group: tulip or sunflower). It gives 2 `syrup` items in the backpack.
  - Uses: gelato (`INGR.syrup`, "Petal"), a bonbon filling (via INGR), and the new small plate "Lemon and petal posset" (milk + lemon + syrup, 4 plates at 7).
  - Lemons and syrup are now kitchen goods. Pea is excluded from bonbon fillings.
- **Bouquet orders** (orchard.js `orderOf(day)`, `fillOrder`, `ORDER_PAY` 25): six days in seven, a villager asks for a bouquet for an occasion. It shows in Ma Ma's farm shop (not the market stall); hand over any `bq_*` for 25 coins, once a day (`o.orderDay`).
- **Ma Ma's tomato and egg** (core.js `sitForDinner`): at the first sit-down of a family dinner, if Mel has 2 tomatoes and 2 eggs, Ma Ma cooks it (+2 XP, a line from Ma Ma and Evan; `S.tomeggDay`). If Mel has only some of them, the dinner line says what's needed.
- **Tests:** "flowers, eggs and Ma Ma's tomato and egg" block.

### Round 103: Honeybrook Woods, bike hire, the river taxi, villagers on the new screens
- **Woods screen `hwoods`** (art/hwoods.js), east of the cottage lane and above Makers' Lane:
  - Along the top, the railway runs into a tunnel under the hill (the hill is drawn after `trainLayer`). rail.js `WINDOWS.hwoods`: east-bound trains pass 3 minutes after their station time, west-bound 2 minutes before.
  - The cliff and waterfall feed the pool, which feeds the Honeybrook (west, under the station) and the river (`RIVER`, south-west to Makers' Lane). `riverPath(pts, w)` is reused for the lane.
  - Places: `ranger` (cabin, `rangerPanel`), `forage`, `lookout`, `fishpool` (4th fishing spot: minnow, brown trout, grayling; the journal now has 20), `taxiwoods`, `bikeswoods`. Gates: `toLaneW` (to hlane) and `toMakersW` (to lane).
  - The cottage lane gets the `toWoodsL` gate (top-right) and `bikesst`. Makers' Lane gets the river down its west edge (with a plank at the town gate), the `toWoodsM` arch at the top, and `taxilane`.
- **Foraging** (game/woods.js `forage`, `F.woods.forageDay`): once a day, by season. Spring: 3 wild garlic. Summer: 4 blackberries. Autumn: 3 mushrooms (+1 if raining). Winter: 4 chestnuts.
  - Kitchen: wild garlic tortilla (spring), wild mushrooms on toast and roast chestnuts with honey (autumn and winter), and the blackberry crumble small plate.
  - Gelato `INGR` gains blackberry and chestnut (so they're bonbon fillings too).
- **Bike hire** (game/transport.js; art/transport.js `bikeRack`, `bikeArt`):
  - Racks at the station, the woods and the town square (`bikesvillage`).
  - `hireBike`: 5 coins for 60 minutes (`F.bike = {until, col}`). goals.js `ride` returns "bike" while it's out; speed 1.3 (scooter 1.6, car 2.5). `bikeExpired` runs in the periodic tick.
  - Mel shows `.rideBike` (class `biking`) while moving.
  - Villagers: `look.bike` draws a bike under them in personArt. In npcs.js they move at 86 instead of 48 and get raincoats rather than brollies.
- **River taxi** (`STOPS`, `taxiPanel`, `takeTaxi`, core.js `rideTaxi` with a 2.6 s `.taxiride` overlay of the launch and riverbank):
  - Stops: waterfall pool, Makers' Lane, home jetty (`taxihome` by the bridge), the lake (`taxilake`) and the foreshore (`taxishore`).
  - Runs 7am to 9pm; 4 coins any stop. Stops on existing screens are drawn by `transportArt(scene)`.
  - Why a river taxi and not a bus: it follows the river that already runs from the waterfall to the sea. The foreshore stop is one gate from the flower farm.
- **Schedules:**
  - New ranger **Wren**: bikes up Makers' Lane at 7:30, walks the woods 8 to 5, lunch at the cabin, fishes the pool on Saturday evenings.
  - New prop `fish` (a rod) via `PROPS`.
  - New slots:
    - Okada: woods walks Tue/Thu (through the station lane), fishing the lake Sun.
    - Juniper: bike rides Mon/Wed/Fri at 7 and Sat; the Tue 7:40 train.
    - Bo: the bay Wed/Fri lunch, bike Sat.
    - Opal: the farm stand Sat, woods Sun.
    - Theo: woods Sat, the bay deck Sun.
    - Hana: the farm stand Mon/Thu at 7.
    - Celeste: foraging Mon.
    - Gong Gong: fishing the lake Sun, the farm Tue (with Ma Ma).
    - Mei: woods Sun.
    - Felix: the 7:40 milk train daily, the barn Mon/Wed/Fri afternoons.
    - Mateo and Lila: inside Honeysuckle in the evenings. Noor: inside Clover.
    - Mum: woods Wed. Dad: fishing off the pier Sat. Marcus: bike Sun.
    - Angelina: the bay Sat. Darren: woods Sat.
    - Holiday-let guests: a bike ride and a lookout walk in the woods (tours.js `letSlot`).
  - npcs.js `outdoors` now uses `OUTDOOR`, so hats stay on at the bay, farm, lane and woods.
- **Fixes:** runtime-registered items (fishing catches, forage finds) now get `ico: id`. The backpack crashed without it.
- **Tests:** the "Honeybrook Woods, bikes and the river taxi" block. The fishing journal now expects 19 locked, the autumn stove 26 tapas.

### Round 104: backstories, and the family at the night market and fair
- **Family at events** (tours.js `FAMILY_EVENTS`, `familyAtEvent`, checked in `eventSlot` after the stall keepers):
  - Night market, Tuesday: Ma Ma and Gong Gong 5:45 to 7, Marcus and Angellina 6:30 to 8:30.
  - Night market, Thursday: Mum and Dad 6 to 8, Darren 7 to 8:30.
  - Fair: Mum and Dad 10 to 12, Ma Ma and Gong Gong 11 to 1, Darren 1 to 3, Marcus and Angellina 1 to 3:30.
  - The Sunday market was already in their routines.
- **Backstories** (data/stories.js `STORIES`; game/stories.js):
  - 25 villagers, 3 to 6 chapters each, told in bubbles on tap. npcs.js `tapNpc` runs `api.story`, chaining the bubbles one after another.
  - When: one chapter per villager per day, only when `F.storyDay` is today (core.js `countQuest` sets it, so stories need a real quest done that day), after the intro, and once the chapter's gates are met (`cocoa`, `cellar`, `trust1`, `fish5`, `bouquet`, `<npc>:<n>`).
  - A ready chapter shows a "…" cue (`.storycue`, class `story`), and the hello bubble becomes "Mel! Got a minute?".
  - The heard chapters are listed as "Stories so far" in the friendship view (`storiesHTML`). State: `F.story = {heard, day, log, flags}`.
- **The threads:**
  - The old chocolatier, Marchand & Fille (1962), which became the Cocoa Room: Celeste's family. Grandfather Henri, mother Margaux, brothers in Lyon who wanted it sold.
  - Marco and Margaux were sweethearts; his first red was named for her.
  - Dad painted the Marchand label at art school in the city. Dad and Mum met when she brought her cracked guitar into the music shop where he worked; the family moved here together from the city when Ma Ma found the orchard.
  - Bo carved and kept the old sign.
  - Mateo's abuela was Margaux's tempering girl.
  - Opal paid the building's rates for nine years.
  - Okada's one undelivered letter was from Hana's father.
  - Juniper is the Gazette's secret poet "J."; Theo collects the poems and leaves pressed flowers.
  - Elena and Marcus worked at the same city bank; Marcus starts helping in the dairy on Saturdays, nudged by Angellina.
  - Felix's first bees swarmed in Ma Ma's apple tree.
  - Mei's mother was Ma Ma's dearest friend (a bouquet for her birthday).
  - Wren is Bo's niece; the gran was the last ranger.
  - Noor's city rescue closed.
  - Tomo is Pilar's nephew; Pilar fixes Sofia's nonna's fior di latte.
  - Farid trained in his uncle's bakery.
  - Gong Gong taught Darren to fix things.
- **Rewards** (`REWARDS`):
  - henri: `s_recipebook` keepsake and 2 `s_praline`.
  - margaux: a "Margaux 1984" bottle in the cellar.
  - label: `s_label` keepsake.
  - blossom: a jar of orchard blossom honey.
  - toast: 2 `s_toast`.
  - sign: the `flags.sign` Marchand & Fille sign on the Cocoa Room in bay.js.
  - koi: koi weight 3 → 7.
  - bouquet: uses up one `bq_*`.
  - nonna: 2 `s_nonna`.
  - pastry: a tapas, "Farid's honey and pistachio pastries".
  - Game-changing flags are re-applied each render (`applyFlags`). Story items live in stall-goods.js (not sold anywhere).
- **Tests:** "stories and the family out at the fairs" block.

### Noted (Mel, after round 104): the boat travels to other towns
- Once bought, the dolphin cruise boat (goals.js `boat`, moored at the foreshore) should also take Mel to other towns along the coast, alongside the dolphin cruise.
- It is one of three ways to destination screens: the train (tickets at the station window), the campervan (road trips), and the boat (coastal towns). The destination screens aren't built yet; see the proposal in chat.
- **Mel's picks for the boat (build later; the boat is a big goal, so its towns should feel big):**
  - **Saltwick Harbour:**
    - Fish market: lobster, clams, onions, sea salt, seaweed.
    - These are things you can't get in Honeybrook. They feed new tapas, and sea salt and seaweed go into gelato and bonbons through the normal discovery (sea salt + dark chocolate → sea salt dark chocolate gelato; savoury seaweed flavours too).
    - Also: the chandlery, a café on the quay, the lighthouse.
  - **Puffin Isle:** the lighthouse keeper, rock pools, seabirds, sea glass.
  - **Both:** a souvenir collection, locals (with stories), and **picnics**. No accommodation.
- **Towns in general (Mel's picks):**
  - A town is **2×2 screens** (four screens), more interesting than one.
  - Visits are day trips: stay as long as you like, then travel back home. There's no overnight stay, and the van doesn't count.
  - **Train towns are commissioned:** Mel names an inspiration ("a little town inspired by Ronda / Kyoto / Provence / the English countryside") and it gets built to the shared town template.
  - **Campervan:** click the parked van to open a **roadmap**. Each stop on the map is a single screen with something to explore. From each screen, click on to the next stop.

### Round 105 (in progress)
- Reopening the game puts Mel back where she was (`F.where`, written by `save()`, restored at boot) if it's the same game day. On a new day she wakes at home. Mel's room and Evan's room always start fresh.
- Tulip bulbs are on sale autumn to spring, and sunflower seeds summer and autumn, so there are garden flowers (petal syrup, shortbread, hen treats) in every season.

## DESTINATIONS PLAYBOOK (read before building any town or trip)
Mel's rules for towns reached by boat, train and campervan. **Every new town or route starts with a detailed plan for Mel, and nothing is built until she approves it.**

### 1. Plan first (required, every time)
Write the proposal for Mel covering every item below. Only build after she says go.
- **Inspiration and feel:** what real place it draws on (for train towns Mel names it, e.g. "inspired by Ronda / Kyoto / Provence / the English countryside"), and the mood in a line.
- **Geography:** terrain, water, slopes, cliffs, gorges, coast and orientation. Where the sun and light fall. How the four screens join physically (for example a gorge splitting the town with a bridge across it, terraces climbing a hill, a harbour wall curling round). **It must not feel like a repackaged Honeybrook**: different ground colours, path shapes, building forms, roof styles and materials.
- **Layout:** a sketch of the **2×2 grid** (four screens): what's on each screen, where the gates between them are, where you arrive (station, quay or parking), and walkable areas versus obstacles.
- **Flora and fauna:** the local trees, plants, flowers and crops, and how they change with the seasons (for example cork oak, almond blossom and orange trees for Ronda; maples, moss gardens and bamboo for Kyoto). Plus birds and animals.
- **Local goods:** three to six things you can't get in Honeybrook, each with at least one use back home (a tapas, gelato or bonbon ingredient through normal discovery, a gift, decor), with prices.
- **Places:** a market or shops, a café or tea house, a landmark, a picnic spot, and anything special to the town.
- **Locals:** two or three villagers, with routines and a short story arc for the story system.
- **Souvenir collection:** what to collect and what completing it gives.
- **Family in the town:** lines, favourite spots and acts for each family member (see section 4).
- **Getting there:** the travel mode, the cost, and the arrival and departure flow.
- **Balance:** what it costs, what it earns, and how it fits the in-game versus real-life balance.

### 2. Town template (once approved)
- **Screens:** four outdoor screens (2×2) joined by gates, with their own palette and art file (`src/art/town-<id>.js`) and their own obstacles and bounds. They're not linked to Honeybrook's BRIDGES; travel is the only way in or out.
- **Interiors (Mel, round 116): every new town gets four to five interior screens**, more if Mel asks for them (Ronda has six). You go in through the door of the matching place on an outdoor screen.
  - **Layout:** each room's layout is ours to design: its own floor, walls, light and furniture, kept calm with a few strong pieces and plenty of floor.
  - **Detail around the edges (Mel, round 117):** rooms must not feel bare. Fill the walls and edges: shelves and displays full of the shop's goods, plenty of tables and chairs in cafés and bars, plants in the corners, crates, jars, lamps, benches, signs. Keep the middle of the floor and the paths to the spots clear, so it stays calm. Add each new piece of furniture to TOWN_OBST so people walk round it.
  - **A cultural activity in two or three rooms (Mel, round 117):** something specific to that culture that Mel can take part in, more than a speech bubble.
    - Examples: a flamenco corner with a little stage in Ronda's tapas bar; a monk with a meditation corner in a Kyoto temple.
    - Mel joins in (a short interaction or mini-moment with a result: clapping the rhythm, a breathing exercise, a lesson), and Evan can join in too, since he usually comes along.
    - Plan these in the town proposal.
  - **Shopping corners and thoughtful touches (Mel, round 117):** Mel loves shopping. Give rooms different corners that sell different things, a wide variety rather than one short list, and add small, unexpected but thoughtful touches: a free flower for Evan, a stamp on a postcard, a shop cat, the owner remembering her.
  - **People:** each room has people in it, locals and tourists with routines across the day, two to four at a time, so it never feels empty but never crowded. The family follow Mel inside.
  - **Music:** each room has its own live track in audio.js, different from the town's street music and from every other room.
  - **How it's built:** list the rooms in `rooms` on the town (door, name, music, party spots, the line said on entering). Add a TOWN_PLACES entry with the room's id so the Exit works, its bounds and obstacles in TOWN_BOUNDS and TOWN_OBST, and its art in `src/art/<town>-rooms.js`. Things to tap inside use `data-rdspot` (core.js `roomSpot`).
- **Day trips only:** no accommodation. Stay as long as you like, then travel home. A trip ends when the game day ends, and Mel wakes at home.
- **Resume:** reopening the same day puts Mel back where she was in the town (`F.where`). The trip state is saved in `F.trip`.

### 3. Getting there, and who comes
- **Boat** (a big goal; Saltwick Harbour and Puffin Isle): up to **8 people** including Mel. A small fuel cost per trip. Daylight only, not on downpour days.
- **Train** (station window tickets): **any number of family members**, but **a ticket for each person**, priced by distance.
- **Campervan** (owned): up to **5 people including Mel**. Tap the parked van to open the roadmap; each stop is one screen with something to explore, and you choose the next stop from there. Drive home from any stop.
- **Picking the party:** a family picker before leaving (Mum, Dad, Ma Ma, Gong Gong, Darren, Evan, Marcus, Angellina), with the cost shown per person.

### 4. Family on a trip (checked against the code: works with these guards)
- **Schedules:** add a `tripSlot` at the **top** of npcs.js `slotAt`. Party members are in the town all trip day; everyone else carries on as normal; routines resume the next day.
- **Guards (each needs a fallback):**
  - Orchard tours: Ma Ma, Gong Gong and Darren lead some, so substitute Farid or Mei.
  - Mum's morning exercise class: "away today" note.
  - Ma Ma's Sunday stall: Farid or Mei keeps it.
  - Family dinner: if the host is away, move it to the next house.
  - Ma Ma's tea and in-person gifts: say where they are ("Ma Ma's in <town> today"); posting a gift still works.
  - Evan: follows Mel only if picked (`evanHere` must include town scenes); otherwise he stays home.
  - Quests: walking to a quest spot from a town says "head home first" (`nextHop` has no route from a town).
- **Per-town flavour** (data on the town):
  - `familyLines[npc]`: tap and hello lines for that town.
  - `familySpots[npc]`: favourite spot and act per screen (Dad sketching the view, Ma Ma haggling at the market, Gong Gong fishing, Evan chasing pigeons, Mum dancing to busking music, Marcus photographing, Angellina people-watching with a notebook, Darren at a flea market or hardware stall).
  - The party follows Mel between the town's screens and settles at their favourite spots, with an occasional town-specific remark.
- **Tests per town:** the party appears in the town; nobody in the party appears in Honeybrook; each guard works; the per-town lines show; resume mid-trip works; trip end returns home.

### 5. Ideas already agreed
- **Saltwick Harbour (boat):**
  - Fish market: lobster, clams, onions, sea salt, seaweed. These feed tapas, and gelato and bonbons through discovery (for example sea salt dark chocolate).
  - Also: the chandlery, a quay café, the lighthouse, picnics, locals, souvenirs.
- **Puffin Isle (boat):** the lighthouse keeper, rock pools, seabirds, sea glass, picnics.
- **Train towns:** commissioned by Mel by inspiration, each with a detailed plan first.
- **Campervan:** the roadmap of single-screen stops, with stamps for stops visited.
- Tests: `browser.newPage` in smoke.mjs sets `window.__mapleNoResume` unless the page asks for `{resume: true}`; core.js skips the resume when that flag is set.

### Round 106: tidier home river, two storytellers a day
- The home river's separate river taxi stop is gone. The taxi now stops at the little jetty (`homejetty`): its panel (goals.js `jettyPanel`) offers "Paddle to the foreshore" or "Take the river taxi" (`data-taxiopen` sets `woodsView = "taxihome"`). `STOPS.taxihome.at` is the jetty (150,140).
- Stories: at most **two villagers a day** tell a chapter (`TELLERS_PER_DAY`). Today's tellers are the first eligible villagers in an order hashed by day; once two have told theirs, no more cues or chapters until tomorrow.

### Round 107: Ronda, the first train town (trip system + the four screens)
- **Data:** `src/data/towns.js`. `TOWNS.ronda` holds the fare (40 a person, Evan free), the hours (out 7am to 6pm, back until 10pm), the screens, the arrival point, the station place, the music track, family `spots` and `lines` per screen, and `say` lines for the places. `TOWN_PLACES`, `TOWN_BRIDGES`, `TOWN_ARRIVE`, `TOWN_OBST` and `TOWN_BOUNDS` are merged into world.js (VILLAGE, OUTDOOR, BRIDGES, ARRIVE) and paths.js (OBST). `townOf(scene)` returns the town id, or null for Honeybrook.
- **Trips:** `src/game/trips.js`.
  - State: `F.trip = {town, day, party, from, done?}`. `tripOn` gives the live trip (null once done, or on another day).
  - Functions: `buyTrip`, `endTrip`, `fareFor`, `ticketPanel` (the family picker), `homePanel` (the town station).
  - `tripSlot` is the **first** entry in npcs.js `slotAt`. Party members are wherever Mel is in the town (`follow`: they walk in from behind her to their spot); while she's on the train they're nowhere.
  - `initTrips(() => F)` takes a getter (F can be swapped by a cloud sync) and hands tours.js its `setAway`.
- **Guards** (tours.js `awayToday`):
  - Tour guides skip anyone away; Farid takes Darren's tour.
  - Mei minds Ma Ma's market stall.
  - `classOn` is null when Mum is away, and `joinClass` explains why.
  - `dinnerOn` moves to the next house when both hosts are away.
  - Couriers don't come to towns.
  - Mel walks in towns (no Honeybrook bike, scooter or car), and it doesn't rain there.
  - `go()` refuses a target in another town ("head home first"), and `questMark` points to the town's station.
  - The default line says quests keep till home.
- **core.js:**
  - `trainRide(text, town, then)` is an overlay (`.taxiride.trainride`; art in `trainRideArt`).
  - `startTrip` / `tripHome` / `townSpot` handle the trip and the town's places.
  - `townTick`: the occasional family remark, and the forced last train at 10pm.
  - `liveNow()` picks the live music: "ronda" in the towns, jazz at the night market.
  - `setScene` saves on town screens, so resume works.
  - Resume into a town only while the trip's on.
- **Music:** audio.js `TRACKS.ronda` (live). A plucked "guitar" tone (bright attack, filter closing), strummed 3+3+2, and the Andalusian cadence Am–G–F–E with a Phrygian top line (`lines`).
- **Art:** `src/art/town-ronda.js`.
  - Palette `C`; helpers `casa`, `tileRoof`, `reja`, `shutters`, `balcony`, `pot`, `bougain`, `orangeTree`, `cypress`, `oliveTree`, `planeTree`, `pinsapo`, `almond`, `pricklyPear`, `lantern`, `gate`, `vultures`, `swifts`, `pigeons`, `cat`, `gorgeBand`, `railing`, and `valley`.
  - Seasons drive fruit and blossom, plane leaves, valley colours, bougainvillea and swifts.
- **Not yet (rounds 3 and 4):**
  - Places are lines only for now: the market, tapas taste-to-learn, the sweet shop, the convent, tiles and the bench, the picnic, and Tempranillo.
  - The locals: Carmen, Rafael, Lucía and Manolo, plus Pilar's chapter.
  - Family acts: dance, sketch, haggle, doze, count, jog/photo, notebook.
- **Tests:** smoke "a day trip to Ronda".
- **Round 3 (places, goods and recipes):** `src/game/ronda.js`, with data in towns.js (`TOWN_GOODS`, `TILES`, `TASTINGS`).
  - **The market:** almonds, Seville oranges, olive oil, jamón, payoyo, membrillo and a picnic basket. From the second visit (`F.ronda.days`), Tempranillo cuttings: 3 for 120 (`vineyard.addCuttings`; `v.tempra` unlocks the grape in the plant, crate and barrel panels).
  - **The tapas bar:** tasting sets `F.learned[id]`. kitchen.js `TAPAS` entries with `learn: true` (salmorejo, ajo blanco, jamón croquetas, payoyo with membrillo, orange salad) show on the stove, and get picked by Pilar, only once learned (`knows`). They're never the chef's request.
  - **New small plates:** salted almonds, bread with oil.
  - **Ingredients elsewhere:** almonds, Seville oranges, membrillo and olive oil are gelato ingredients (scoop.js `INGR`), and so bonbon fillings too.
  - **The sweet shop and convent:** yemas and almond cake; convent biscuits (all gifts).
  - **The tile shop:** 8 tiles (orange in winter and spring, geranium in spring and summer, almond blossom in winter). All eight set `F.ronda.bench`, and core.js draws `tileBench(236, 548)` at home. Also a painted fan and cork coasters (gifts).
  - **Picnic:** a picnic at the Alameda balcony uses the basket (`F.ronda.picnics`).
  - **Tempranillo** (vineyard.js `STYLES.tempranillo`): 12h in the barrel, 28 coins a bottle. It has its own wine names and colours (wine.js and vineyard art), and Marco fills it first.
- **Round 4 (locals and family):**
  - **Locals:** Doña Carmen, Rafael, Lucía and Manolo are in data/npcs.js with `local: "ronda"`. Their routines are on Ronda's screens only, and they're left out of the who's-where directory.
  - **Stories:** they have stories in data/stories.js. stories.js `LOCALS` tell theirs on a trip day without a quest; the two-a-day limit still applies.
  - **Story gates:** `ronda2` (a second visit) and `tiles4`.
  - **Pilar and Carmen:** Carmen's chapter 3 (needs `pilar:2`) reveals Pilar's mother Rosario and gives 2 yemas. Pilar's chapter 4 (needs `carmen:3`) follows.
  - **Family acts:** `TOWNS.ronda.acts` drives them through trips.js `tripSlot` (at a spot, in hours; slots `glide` between spots):
    - Mum dances while Manolo plays (11–14, 18–22).
    - Dad sketches (bridge, Alameda).
    - Ma Ma haggles at the market (8–14).
    - Gong Gong dozes behind a newspaper on a bench.
    - Marcus photographs.
    - Angellina takes notes.
    - Darren wanders the steps.
    - Evan comments on each screen and sticks by Mel on the bridge.
  - **Art and props:** the props are people.js extras (`guitar`, `sketchbook`, `camera`, `notebook`, `newspaper`; npcs.js `PROPS`). The animations are in npcs.css (`act-guitar`, `act-dance`, `act-haggle`, `act-sketch`, `act-doze`).

### Round 108: trousers, the letterbox flag, and running the kitchen
- **Wardrobe:** a bottom that isn't shorts or a skirt shows long trouser legs (`.otrouser` in index.html). The hips (`#oHips`) lose the shorts hem, so it reads as one garment (core.js `applyWear`).
- **Letterbox:** only the newest daily paper and the newest weekend edition count as unread (core.js `stalePapers`).
- **Kitchen:**
  - `k.keep` (larder id -> count): the larder's keep steppers; Pilar never uses kept stock (`canSpare`/`useSpare`).
  - `k.pilarNo` (Pilar's list on the stove): dishes, "tapas", "bread" and "press" she may not do on her own.
  - Tapas: `v.tapasList` (up to `TAPAS_MAX` 3 a day; old `v.tapas` migrates in `vineState`).
  - `v.tapasPlan` = {day, ids}: tomorrow's tapas, applied by `tapasAll` on the day.
  - Fold-outs remember being open (`KP`).

### Round 109: the greenhouse, herbs and gambas (the olive mill and grove come next round)
- **Greenhouse:**
  - `GOALS.greenhouse` (400) turns the garden's old shed into a glass house (art/greenhouse.js `ghOutside`, drawn in farmArt with `data-gh="door"`).
  - Inside is `INNER.greenhouse` (parent farm), drawn by `greenhouseArt`.
  - Six beds (`F.gh.beds`, game/greenhouse.js). The misters keep them damp, so there's no watering, and quest boosts apply (`ghBoost`).
- **Herbs:** `CROPS` garlic, basil, mint, rosemary, chives, thyme (`herb: true`). The `<herb>_seed` packets are greenhouse-only (`greenhouse: true`, `needs: "greenhouse"`).
- **Out-of-season seeds:** every seasonal seed has a `gh_<seed>` twin (×1.5 price). Hana's seed shelf shows a twin only while the ordinary seed is out of season, and only once the greenhouse is built. The garden's plots don't take greenhouse packets.
- **Uses:** herbs are kitchen GOODS. Basil, rosemary and thyme are gelato ingredients (and so bonbon fillings); mint already was.
- **New tapas:** gambas al ajillo (3 shrimp, 2 garlic, 1 olive oil), rosemary potatoes, tomato and basil bruschetta, chive omelette, and roast pumpkin with thyme.
- **Shrimp:** a sea catch in the morning (fishing.js `FISH.shrimp`).
- **Garden fence:** there's a gate gap in the top fence (x 232–288) and stepping stones to the greenhouse door.

### Round 110: the old mill and the olive grove
- **The mill:** `GOALS.mill` (350). The windmill on the cottage lane (spot `windmill`) opens the goal panel; once owned, it goes inside the `mill` scene (`VILLAGE.mill` holds its door, so Exit works; art/mill.js `millArt`).
- **Pressing:** tap the millstone or the press for `millPanel` (game/mill.js). 3 jars of olives make 1 bottle, up to 4 bottles a pressing, 1 hour; then "Bottle it" puts them in the backpack. Olives come from the backpack first, then the vineyard's `v.oliveCrate`.
- **The grove:** `SHOP.grove` (300, needs the olive tree) adds four small trees in a row on the top-left terrace of the vineyard (place `grove`, `grovePanel`). 8 jars every 8 hours (`pickGrove`).
- **Workers:** Marco and Ines (help.pick) pick the olive tree and the grove on shift into `v.oliveCrate` (`takeOliveCrate`).
- **Round 111: selling the catch:** fishing.js `sellCatch` and `CATCH`. A "Your catch" section at every fishing spot lets you sell one or "Sell the lot", at the same prices as the market Sell tab; the everyday "fish" item now sells for 3.

### Round 112: Friday evenings
- **Aperitivo** (tours.js `aperitivoNow`, Fri 4:30–7):
  - More villagers at the tasting tables.
  - In vineyard.js `sellTick`: footfall ×1.6, more plates (walk-ins `.005` vs `.0016`, 90% of glasses come with a plate), and 20% tips while Mel serves.
  - The everyday walk-in plate rate went up too (`.001` → `.0016`).
- **The bonfire** (`bonfireNow`, Fri 7–10, on the bay beach at `FIRE`):
  - `bonfireSlot`: the family on logs, with Dad playing guitar.
  - The fire pit is always drawn; it's lit on Friday nights (art/friday.js).
  - The bonfire panel releases the week's lanterns (friday.js `weekQuests`/`releaseLanterns`, once a Friday). `lanternFlight` draws them in `#fxLayer`, begun at `getCurrentTime()`.
- **Sal's fish van** (`vanNow`, Fri 5–10, place `fishvan`): sells worms ×5 (6), clams (4) and lemons (3), and buys the catch ×1.5 (`sellCatch` mult).
  - New tapas: clams with garlic and lemon (`almejas`).
- **Kites:** the `kite` item (Hana's Family shelf, 12 coins). The field's place `kitefly` flies it for a minute (`S.kite`, `kiteArt`), and Evan runs along.
- **Still to come (round 113):** movie night on the field (the last Friday of the month) and a small Friday market at the bay.

### Round 113: movie night and the Friday bay market
- **Movie night** (tours.js `movieNow`: the last Friday of the month, 7:30–9:30):
  - A screen on the field at `SCREEN` with a little film flickering on it, blankets, and a popcorn cart (places `screen` and `popcorn`; art/friday.js `movieArt`).
  - The film is picked by the month (friday.js `filmOf`). Popcorn is a gift item.
  - `movieSlot`: the family and a few villagers on the blankets. It comes before `bonfireSlot` in the chain.
- **The Friday bay market** (`bayMarketNow`, Fri 4:30–8):
  - Three stalls (`BAY_STALLS`, places `bm0`–`bm2`) kept by night-market out-of-towners (`bayKeepers`). Each has four goods from everything the regular markets sell, a new mix each week (friday.js `bayStallGoods`).
  - Hiro sells kites on the beach (place `kites`). Buying goes through core `buy` (`bayMarketPanel`).

### Round 114: Mel's Friday feedback, and a calm screen
- Standing rule from Mel: new things must not crowd the screen. Aim for a calm feel: fewer props and people, labels left clear.
- The bonfire is the firepit at home (base scene), at `FIRE` [276,608]. Mel asked for it there. `bonfireArt` adds only the tap target, the big flames and a small label, because scenes.js already draws the stones. The family sits round it (`LOGS`), with Marcus and Angellina on the bench, and nobody stands in front of the flames. The lanterns drift up over the house. The bay keeps only Sal's van.
- The Friday market (`BAYMKT`, 4:30 to 7:15) is on the field, where the Sunday market stands:
  - `BAY_STALLS` along the top row, with Hiro's kites at `KITE_SELLER`.
  - Places `bm0`–`bm2` and `kites` are in the field scene.
  - The bay keeps only the van and the bonfire.
- Movie night (`MOVIE`, 7:30 to 9:30, last Friday of the month) also uses the Sunday market spot, with the screen at `SCREEN` [236,128]. It starts 15 minutes after the market packs up, and a test checks the gap. The family spread out over the field instead of bunching at the screen: Mum and Dad on the one blanket by the screen, Ma Ma and Gong Gong at the picnic spot, and Marcus and Angellina strolling round the exercise lawn (`LAWN_STROLL`). A test checks that no more than two sit near the screen.
- Omar is now Ezra. The id stays `omar`, so saves and schedules carry on.

### Round 115: sunset fishing, grilled sardines, and the farm path
- **Sunset fishing at the bay:** `SPOTS.bay` (place `fishbay`), Friday 5 to 8pm only.
  - `spotOpen` gates it, and the spot art is hidden outside those hours.
  - Fish: sardine, mackerel and sea bream (shared with the sea through `also`), plus two new ones: red mullet (`mullet`, sells 6) and a very rare bluefin tuna (`tuna`, sells 30).
  - Selling at this spot pays Sal's ×1.5.
- **Sal's van** sells three sardines for 9. That's the same as his buy price, so there's no profit in buying and selling back.
- **Grill at the bonfire:** "Grill the fish" in the bonfire panel uses up to 6 sardines or mullet, once a Friday (`grillFish`, `F.fri.grill`), and gives hearts and XP.
- **Farm path:** a path joins the lake field and Wildflower Farm, which sits right above it.
  - Field gate `toFarmN` at the top, at x=366, between the trees. Its label is hidden on market days because the stalls fill the top row.
  - Farm gate `toFieldH` at the bottom of the centre lane.
  - Both are in BRIDGES and ARRIVE, so routing now goes field↔farm directly.

### Round 116: Ronda's interiors, the leather workshop and churros
- **Six interiors**, each entered through its door outdoors (`TOWNS.ronda.rooms`, `townRoom`, `roomBehind`). `townOf` covers them too. Art is in art/ronda-rooms.js.
  - The tapas bar (`rd_tapas`): hams on the beam, a tiled dado, the zinc bar to order at, barrel tables.
  - Doña Carmen's café (`rd_cafe`): an arched window, a ceiling fan, the glass counter, marble tables. New: sit down for a café con leche and a churro (3), or churros con chocolate (4), via `cafeTreat`. Churros to take away (a family gift, 4).
  - The Arab baths (`rd_banos`): horseshoe arches, star skylights with shafts of light, a basin. Tap "Look up" for facts.
  - The Moorish garden (`rd_jardin`): a water channel and fountain, four myrtle beds with orange trees, tiled benches. Sit by the fountain.
  - The covered market (`rd_mercado`): an iron and glass hall, Rafael's stall (the market panel), fruit, ham, Rocío's flowers.
  - The leather workshop (`rd_cuero`): Mel asked for one in a blank house, so it's the lower-left house on `rd_old`, signed "PIEL · UBRIQUE". Inside are hides, a shelf of bags and Antonio's bench. The shop sells Ubrique leather: a wallet, a handbag, a belt, a notebook and a keyring, all gifts.
- **Each room has its own live track** (audio.js): `rd_tapas` rumba, `rd_cafe` waltz, `rd_banos` bells, `rd_jardin` water bells, `rd_mercado` bright strum, `rd_cuero` slow soleá.
- **New Ronda locals and tourists**, with routines spread over the rooms: Paco (waiter), Pepe (paper, siesta), Lola (shopping), Amina (baths guide), Joaquín (gardener), Rocío (flowers), Antonio (leather), and the tourists Ingrid, Kenji and Chloé.
  - Doña Carmen now works inside her café, and Rafael inside the market.
- **Inside rooms**, Mel, Evan and the villagers route round the furniture: findPath is on for town rooms.

### Round 117: fuller Ronda interiors (Mel: "a bit bare")
- **Edges filled, middles kept clear**, with new pieces in ronda-rooms.js (`palm`, `crates`, `tinaja`, `bench`, `niche`):
  - **Tapas bar:** a bottle shelf, a table for two each side, a barrel rack, a coat stand, an A-board, crates.
  - **Café:** six tables now, plus a newspaper rack, a cake stand, palms in the corners, a crate of lemons.
  - **Baths:** lamp niches, stone benches, tinajas, a plaque.
  - **Garden:** geraniums all along both walls, side benches, lanterns and jasmine by the gate.
  - **Market:** a spice stall, olive barrels, bread, crates.
  - **Leather workshop:** tall shelf units of bags, wallets and belts on both walls, fuller display tables, a saddle, a hat stand of satchels, boxes.
- **TOWN_OBST updated** for all the new furniture.
