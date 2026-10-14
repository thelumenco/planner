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

## Phases
1. Set up: this branch and worktree, the bookmark, the leak check. (done)
2. Strip out connectors and productivity code; build the quest board (your own tasks + village requests).
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
