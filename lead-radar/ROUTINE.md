# Lead Radar daily scan

This is the prompt the daily Lead Radar routine runs. Keep it in sync with the routine if you edit it.

Dashboard: https://claude.ai/artifact/P7QeG3t9TW9dBEKeZegLmJ

---

Run the Lead Radar daily scan. Lead Radar finds Reddit posts from people who need one of my products and drafts a helpful reply for each. Its data lives in the database of the artifact https://claude.ai/artifact/P7QeG3t9TW9dBEKeZegLmJ, which you read and write with the ArtifactData tool (load it with ToolSearch).

1. **Get the scanner.** Find `lead-radar/scan.py` in the `thelumenco/planner` checkout. If it is missing, run `git fetch origin main ccr-e37939bd-fgryyn` and check out the `lead-radar` folder from whichever branch has it.
2. **Export the database** into a scratch folder `work/db` with ArtifactData `list` and `out_dir: "work/db"` for the collections `products`, `leads` (page through with `query.cursor` until there is no `next_cursor`) and `seen`. If `products` is empty, write `meta/scan` with `{lastRunAt: <now ISO>, summary: "No products yet"}` and stop.
3. **Search Reddit:** `python3 lead-radar/scan.py --db work/db --out work/candidates.json`. If it exits with an error (Reddit blocked or unreachable), write `meta/scan` with `lastRunAt` set to now and `summary` set to a one-line, plain-English description of the error, then stop.
4. **Judge each candidate** in `work/candidates.json` against its product's `about`, `keywords` and `replyNotes`. Give it a `fit` score from 1 to 10: 10 means the poster is clearly asking for or struggling with exactly what the product solves; 5 means plausibly interested; below 5 means unrelated, a competitor's or seller's own promo, a news or meme post, or a thread where a product link would be unwelcome. Keep only posts scoring 5 or more.
5. **Draft a reply** for each kept post, following these rules:
   - Lead with genuinely useful help for the poster's actual problem (2-5 short sentences). The reply must be worth reading even without the link.
   - Mention the product once, naturally, with its URL, and disclose that you made it (e.g. "I built X for exactly this" or "full disclosure, it's mine").
   - Sound like a real person in that subreddit: plain, warm, specific. No marketing words, no emojis, no hashtags, no bullet lists, no sign-off.
   - Never invent features, prices or claims beyond the product description and reply notes.
   - If the subreddit is likely strict about self-promotion, keep the link low-key at the end.
6. **Write the results** with ArtifactData `batch` (up to 50 writes per batch; these are new documents, so no `if_version`):
   - Each kept post: `set` in collection `leads`, doc id = the candidate's `lead_id`, data `{productId, redditId, title, body, subreddit, author, url, createdUtc, numComments, matched, fit, why, draft, status: "drafted", foundAt: <now ISO>, updatedAt: <now ISO>}`, where `why` is one short sentence on why this person needs the product.
   - Each rejected post: add its `reddit_id` to `seen/<productId>` as `{ids: [...]}`, merged with the ids already exported, newest last, keeping at most the last 4000. Use `set` with the `if_version` from the export when the document already exists.
   - Finally `set` `meta/scan` to `{lastRunAt: <now ISO>, summary: "<N> new leads: <count per product>"}` (pass `if_version` if it exists).
7. Reply with one line: how many new leads per product, or why the scan could not run. Do not commit or push anything.
