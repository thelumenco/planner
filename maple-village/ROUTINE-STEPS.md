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
