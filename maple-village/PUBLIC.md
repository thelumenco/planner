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

## Phases
1. Set up: this branch and worktree, the bookmark, the leak check. (done)
2. Strip out connectors and productivity code; build the quest board (your own tasks + village requests). (done)
3. Remove the family; rewrite the scenes and dialogue that depended on them.
4. Character creation (name, pronouns, look) and five pets: fox, rabbit, tortoise, quokka, capybara.
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
  3 coins (and grows the garden a little, like a finished quest always did); only the first 10 ticks a day pay. Undo
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

Makers' Lane: the app houses are homes now (ids kept: chord, chico, luna, ohayo). Bo's workshop (he lives upstairs),
Auntie Lin's cottage, Juniper's house (the little observatory) and Mr Okada's house. Each is home in the evening (and
Mr Okada early in the morning too): data/npcs.js `HOMES`. The Fresh Pages library is just the library.

Tests: `node test/smoke.mjs` has new sections for the quest board rules and a request handed over in the game; the
sections for removed features are gone. Each section now records a failure and carries on instead of stopping the run.
