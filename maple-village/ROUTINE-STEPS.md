# Village steps for the scheduled tasks on your Mac

These five tasks run in the Claude desktop app on your Mac, so their instructions can only be edited there.
For each one: open the task in the Claude desktop app, edit its instructions, and paste the block at the very end.

The cloud routines (evening wind-down, book digest, Sunsama tidy) are already updated.

## 1. Daily morning briefing (8:00am weekdays) - the paper in your letterbox

```
FINAL STEP: deliver the paper to Maple's village. After the briefing is done, post a short newspaper version of it to Mel's village page, so it lands in the letterbox outside her home there (and the town crier finds her in town if she doesn't read it).
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "mail".
- First action "get" to read the doc and its version. Then action "set" with the whole doc back, if_version = the version you read (omit it only if the doc doesn't exist yet), appending ONE item to "items" and keeping only the newest 30. Leave every other field and item exactly as it was. Never write read flags.
- Plain text, no emoji, short lines. Only include what this run actually found. No email addresses, phone numbers or private details about other people beyond a first name.
- On a version conflict, read again and retry once. If the village write fails for any other reason, say so in one line at the end and carry on; never let it block the main task.
- Item: { "id": "briefing-YYYY-MM-DD" (today's Singapore date; replace an existing item with this id instead of adding a second), "from": "crier", "title": "<one-line headline for the day>", "body": "<1-2 plain sentences>", "sections": [ { "heading": "Today", "lines": ["<time> <event>"] }, { "heading": "The one that matters", "lines": ["..."] }, { "heading": "Inbox", "lines": ["..."] }, { "heading": "This week", "lines": ["..."] }, { "heading": "Little things", "lines": ["..."] } ], "at": <current epoch ms> }. 1-5 lines per section; drop empty sections.
```

## 2. Weekday inbox + calendar triage (morning, 6:30am) - Penny brings the morning post

```
FINAL STEP: send an inbox note to Maple's village. After the triage is done, post a short summary to Mel's village page. Penny the postie carries it to her.
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "mail".
- First action "get" to read the doc and its version. Then action "set" with the whole doc back, if_version = the version you read (omit it only if the doc doesn't exist yet), appending ONE item to "items" and keeping only the newest 30. Leave every other field and item exactly as it was. Never write read flags.
- Plain text, no emoji, short lines. Only include what this run actually found. No email addresses, phone numbers or private details about other people beyond a first name.
- On a version conflict, read again and retry once. If the village write fails for any other reason, say so in one line at the end and carry on; never let it block the main task.
- Item: { "id": "triage-YYYY-MM-DD-am", "from": "postie", "title": "Morning post", "body": "<1 sentence: how heavy the inbox is>", "sections": [ { "heading": "Needs you", "lines": ["..."] }, { "heading": "Drafts waiting", "lines": ["..."] }, { "heading": "New leads", "lines": ["..."] } ], "link": "https://mail.google.com/mail/?authuser=mel@freshpages.co", "at": <current epoch ms> }. 1-5 lines per section; drop empty sections; replace an existing item with the same id.
```

## 3. Weekday inbox + calendar triage (midday, 1:00pm) - Penny brings the afternoon post

```
FINAL STEP: send an inbox note to Maple's village. After the triage is done, post a short summary to Mel's village page. Penny the postie carries it to her.
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "mail".
- First action "get" to read the doc and its version. Then action "set" with the whole doc back, if_version = the version you read (omit it only if the doc doesn't exist yet), appending ONE item to "items" and keeping only the newest 30. Leave every other field and item exactly as it was. Never write read flags.
- Plain text, no emoji, short lines. Only include what this run actually found. No email addresses, phone numbers or private details about other people beyond a first name.
- On a version conflict, read again and retry once. If the village write fails for any other reason, say so in one line at the end and carry on; never let it block the main task.
- Item: { "id": "triage-YYYY-MM-DD-pm", "from": "postie", "title": "Afternoon post", "body": "<1 sentence: how heavy the inbox is>", "sections": [ { "heading": "Needs you", "lines": ["..."] }, { "heading": "Drafts waiting", "lines": ["..."] }, { "heading": "New leads", "lines": ["..."] } ], "link": "https://mail.google.com/mail/?authuser=mel@freshpages.co", "at": <current epoch ms> }. 1-5 lines per section; drop empty sections; replace an existing item with the same id.
```

## 4. GeBIZ Opportunity Scout (Mondays 8:45am) - Fennel brings the tenders

```
FINAL STEP: send a tenders note to Maple's village. After the scan, post a short summary to Mel's village page. Fennel the tender scout carries it to her.
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "mail".
- First action "get" to read the doc and its version. Then action "set" with the whole doc back, if_version = the version you read (omit it only if the doc doesn't exist yet), appending ONE item to "items" and keeping only the newest 30. Leave every other field and item exactly as it was. Never write read flags.
- Plain text, no emoji, short lines. Only include what this run actually found. No email addresses, phone numbers or private details about other people beyond a first name.
- On a version conflict, read again and retry once. If the village write fails for any other reason, say so in one line at the end and carry on; never let it block the main task.
- Item: { "id": "gebiz-YYYY-MM-DD", "from": "scout", "title": "<n> tenders worth a look" (or "No new tenders this week"), "body": "<1 sentence>", "sections": [ { "heading": "Worth a look", "lines": ["<title> · closes <date>"] } ], "link": "https://claude.ai/artifact/19VMZUhpZ4WEAD3MzyVbyg", "at": <current epoch ms> }. Up to 5 lines; replace an existing item with the same id.
```

## 5. Afternoon Briefing (1:30pm weekdays) - the afternoon edition in your letterbox

```
FINAL STEP: deliver the afternoon edition of the paper to Maple's village. After the briefing, post a short version to Mel's village page. It lands in the letterbox at her home there (the town crier finds her in town if she doesn't read it).
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "mail".
- First action "get" to read the doc and its version. Then action "set" with the whole doc back, if_version = the version you read (omit it only if the doc doesn't exist yet), appending ONE item to "items" and keeping only the newest 30. Leave every other field and item exactly as it was. Never write read flags.
- Plain text, no emoji, short lines. Only include what this run actually found. No email addresses, phone numbers or private details about other people beyond a first name. Leave the cycle note OUT of the village paper (it stays in the chat briefing only).
- On a version conflict, read again and retry once. If the village write fails for any other reason, say so in one line at the end and carry on; never let it block the briefing.
- Item: { "id": "afternoon-YYYY-MM-DD" (today's Singapore date; replace an existing item with this id instead of adding a second), "from": "crier", "edition": "Afternoon edition", "title": "<one-line headline for the rest of the day>", "body": "<1-2 plain sentences>", "sections": [ { "heading": "Rest of today", "lines": ["<time> <event>"] }, { "heading": "Still to do", "lines": ["..."] }, { "heading": "Heads up", "lines": ["<work-hours flags or weather change>"] } ], "at": <current epoch ms> }. 1-5 lines per section; drop empty sections.
```


## 10. Daily morning briefing again - the wardrobe at home

Paste this in the morning briefing too, after step 1's block. (The briefing's "What to Wear" section already runs your mel-stylist skill; this hangs those outfits in the wardrobe.)

```
FINAL STEP 2: hang today's outfits in the wardrobe in Maple's village. Use the three "What to Wear" options this briefing just made with the mel-stylist skill (every piece from the Wardrobe Notion doc).
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "outfit".
- First action "get" to read the doc and its version. Then action "set" with the whole doc, if_version = the version you read (omit it only if the doc doesn't exist yet). On a version conflict, read again and retry once. If it fails for any other reason, say so in one line and carry on.
- Doc: { "at": <current epoch ms>, "day": "YYYY-MM-DD" (today, Singapore), "weather": "<e.g. 31C, humid>", "on": "<today's events in one short line>", "options": [ { "label": "Polished"|"Elevated casual"|"Wild card", "top": "", "bottom": "", "dress": "" (dress OR top+bottom), "layer": "", "shoes": "", "bag": "", "jewellery": "", "sunglasses": "" (only if going out), "hair": "up|down + short note", "why": "one sentence" } x3 ], "wardrobe": <keep the existing "wardrobe" field exactly as it is, unless the Wardrobe Notion doc has changed: then rewrite it as lists of short item names: tops, bottoms, dresses, layers, shoes, bags, jewellery, belts, scarves, sunglasses, cooler_weather> }
- Plain text, no emoji.
```

# Reports for the village (bug checks and content calendars)

Paste each block at the end of the matching routine's instructions (wherever that routine lives: the Claude desktop app for tasks on your Mac, or claude.ai Routines for cloud ones). The village only reads these.

## 6. Chord nightly bug check - the health sign in the Chord workshop

```
FINAL STEP: put tonight's result on the health sign in Maple's village. After the bug check (and after updating the Chord founder room), write a short status for the village. It shows as a standing sign in the Chord building and a coloured light on the building in the town square.
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "health-chord".
- First action "get" to read the doc's version (it may not exist yet). Then action "set" with the WHOLE new doc, if_version = the version you read (omit it only if the doc doesn't exist). This doc is replaced each run: write the full current picture, not an append.
- Plain text, no emoji, short strings. Only what this run actually found. No email addresses, phone numbers, API keys, tokens or customer personal details.
- On a version conflict, read again and retry once. If the village write fails for any other reason, say so in one line at the end and carry on; never let it block the main task.
- Doc: { "app": "chord", "at": <current epoch ms>, "status": "green" | "amber" | "red", "headline": "<one line, e.g. All 212 tests green, no new errors>", "checks": [ { "name": "Unit tests", "state": "pass" | "warn" | "fail", "detail": "212/212" }, { "name": "E2E", "state": "pass", "detail": "18/18" }, { "name": "Errors (24h)", "state": "pass", "detail": "0 new" } ], "link": "https://claude.ai/artifact/P5hPqeNgPURfqecbbXMpxd" }.
- 2 to 8 checks, worst first. status: red if anything failed or is broken for users, amber for flaky/slow/skipped or needs a look soon, green if everything passed.
- Optional, if this run knows the current user count: also "get" doc_id "stats" and "set" it back with chord.users updated (keep every other field, including chord.label and chord.per), so the flower garden outside the Chord building grows.
```

## 7. Chico nightly bug check - the health sign in Chico cottage

```
FINAL STEP: put tonight's result on the health sign in Maple's village. After the bug check (and after updating the Chico founder room), write a short status for the village. It shows as a standing sign in the Chico building and a coloured light on the building in the town square.
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "health-chico".
- First action "get" to read the doc's version (it may not exist yet). Then action "set" with the WHOLE new doc, if_version = the version you read (omit it only if the doc doesn't exist). This doc is replaced each run: write the full current picture, not an append.
- Plain text, no emoji, short strings. Only what this run actually found. No email addresses, phone numbers, API keys, tokens or customer personal details.
- On a version conflict, read again and retry once. If the village write fails for any other reason, say so in one line at the end and carry on; never let it block the main task.
- Doc: { "app": "chico", "at": <current epoch ms>, "status": "green" | "amber" | "red", "headline": "<one line, e.g. All 212 tests green, no new errors>", "checks": [ { "name": "Unit tests", "state": "pass" | "warn" | "fail", "detail": "212/212" }, { "name": "E2E", "state": "pass", "detail": "18/18" }, { "name": "Errors (24h)", "state": "pass", "detail": "0 new" } ], "link": "https://claude.ai/artifact/N8XGDo6PDqRkYsure3it8W" }.
- 2 to 8 checks, worst first. status: red if anything failed or is broken for users, amber for flaky/slow/skipped or needs a look soon, green if everything passed.
- Optional, if this run knows the current user count: also "get" doc_id "stats" and "set" it back with chico.users updated (keep every other field, including chico.label and chico.per), so the flower garden outside the Chico building grows.
```

## 8. Chord content calendar - the Content tab

```
FINAL STEP: send the content plan to Maple's village (view-only calendar). After updating the Chord content calendar, write the next two weeks of planned posts for the village's Content tab.
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "content-chord".
- First action "get" to read the doc's version (it may not exist yet). Then action "set" with the WHOLE new doc, if_version = the version you read (omit it only if the doc doesn't exist). This doc is replaced each run: write the full current picture, not an append.
- Plain text, no emoji, short strings. Only what this run actually found. No email addresses, phone numbers, API keys, tokens or customer personal details.
- On a version conflict, read again and retry once. If the village write fails for any other reason, say so in one line at the end and carry on; never let it block the main task.
- Doc: { "brand": "chord", "at": <current epoch ms>, "items": [ { "date": "YYYY-MM-DD", "time": "09:00" (optional, 24h Singapore time), "channel": "Instagram" | "Blog" | "LinkedIn" | "Newsletter" | ..., "title": "<post title or hook>", "status": "idea" | "draft" | "scheduled" | "posted", "link": "<optional https URL to the post or draft>" } ] }.
- Include everything from 7 days ago to 14 days ahead (at most 60 items), sorted by date.
```

## 9. Ambidextrous content calendar - the Content tab

```
FINAL STEP: send the content plan to Maple's village (view-only calendar). After updating the Ambidextrous content calendar, write the next two weeks of planned posts for the village's Content tab.
- Use the ArtifactData tool (load it with ToolSearch "select:ArtifactData" if it's deferred). Page url: https://claude.ai/artifact/REdXbAyK7ybkGJbmohoCM4, collection "data/users/me", doc_id "content-ambidextrous".
- First action "get" to read the doc's version (it may not exist yet). Then action "set" with the WHOLE new doc, if_version = the version you read (omit it only if the doc doesn't exist). This doc is replaced each run: write the full current picture, not an append.
- Plain text, no emoji, short strings. Only what this run actually found. No email addresses, phone numbers, API keys, tokens or customer personal details.
- On a version conflict, read again and retry once. If the village write fails for any other reason, say so in one line at the end and carry on; never let it block the main task.
- Doc: { "brand": "ambidextrous", "at": <current epoch ms>, "items": [ { "date": "YYYY-MM-DD", "time": "09:00" (optional, 24h Singapore time), "channel": "Instagram" | "Blog" | "LinkedIn" | "Newsletter" | ..., "title": "<post title or hook>", "status": "idea" | "draft" | "scheduled" | "posted", "link": "<optional https URL to the post or draft>" } ] }.
- Include everything from 7 days ago to 14 days ahead (at most 60 items), sorted by date.
```
