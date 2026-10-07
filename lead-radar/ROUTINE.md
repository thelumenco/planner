# Lead Radar daily scan

This is the prompt the daily Lead Radar routine ("Lead Radar daily scan", 7:48am Singapore time) runs. The routine starts a fresh session with no repo checkout, so the prompt carries a copy of `scan.py` at the end. If you edit either file, update the routine to match.

Dashboard: https://claude.ai/artifact/P7QeG3t9TW9dBEKeZegLmJ

---

Run the Lead Radar daily scan. Lead Radar finds Reddit posts from people who need one of my products and drafts a helpful reply for each. Its data lives in the database of the artifact https://claude.ai/artifact/P7QeG3t9TW9dBEKeZegLmJ, which you read and write with the ArtifactData tool (load it with ToolSearch).

1. **Get the scanner.** Save the Python script at the end of this message, exactly as given, to `work/scan.py`. (It is also kept in the `thelumenco/planner` repo at `lead-radar/scan.py`.)
2. **Export the database** into a scratch folder `work/db` with ArtifactData `list` and `out_dir: "work/db"` for the collections `products`, `leads` (page through with `query.cursor` until there is no `next_cursor`) and `seen`. If `products` is empty, write `meta/scan` with `{lastRunAt: <now ISO>, summary: "No products yet"}` and stop.
3. **Search Reddit:** `python3 work/scan.py --db work/db --out work/candidates.json`. If it exits with an error (Reddit blocked or unreachable), write `meta/scan` with `lastRunAt` set to now and `summary` set to a one-line, plain-English description of the error, then stop.
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


---
work/scan.py:

```python
#!/usr/bin/env python3
"""Lead Radar scanner: find fresh Reddit posts that match each product's keywords.

Reads the Lead Radar database as exported by ArtifactData (`list` with `out_dir`):
    <db>/products/*.json   one file per product
    <db>/leads/*.json      leads already in the dashboard (skipped as duplicates)
    <db>/seen/*.json       per-product lists of post ids already judged and rejected

Writes candidates for Claude to judge, score and draft replies for:
    {"products": {product_id: {"name": ..., "candidates": [post, ...]}}, "stats": {...}}

Uses Reddit's public JSON search. If REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are set
(a free "script" app from https://www.reddit.com/prefs/apps), it uses the official
OAuth API instead, which is faster and far less likely to be blocked.
"""
import argparse
import base64
import glob
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

USER_AGENT = "lead-radar/1.0 (personal lead finder)"
SUBS_PER_QUERY = 10
MAX_PER_PRODUCT = 60


def load_docs(folder):
    docs = {}
    for path in glob.glob(os.path.join(folder, "*.json")):
        with open(path) as f:
            raw = json.load(f)
        doc_id = raw.get("id") if isinstance(raw.get("data"), dict) else None
        data = raw["data"] if doc_id else raw
        docs[doc_id or os.path.splitext(os.path.basename(path))[0]] = data
    return docs


class Reddit:
    def __init__(self, delay):
        self.delay = delay
        self.token = None
        cid, secret = os.environ.get("REDDIT_CLIENT_ID"), os.environ.get("REDDIT_CLIENT_SECRET")
        if cid and secret:
            req = urllib.request.Request(
                "https://www.reddit.com/api/v1/access_token",
                data=b"grant_type=client_credentials",
                headers={
                    "User-Agent": USER_AGENT,
                    "Authorization": "Basic " + base64.b64encode(f"{cid}:{secret}".encode()).decode(),
                },
            )
            with urllib.request.urlopen(req, timeout=30) as r:
                self.token = json.load(r)["access_token"]
            self.delay = min(delay, 0.7)

    def get(self, path, params):
        base = "https://oauth.reddit.com" if self.token else "https://www.reddit.com"
        suffix = "" if self.token else ".json"
        url = f"{base}{path}{suffix}?{urllib.parse.urlencode(params)}"
        headers = {"User-Agent": USER_AGENT}
        if self.token:
            headers["Authorization"] = "Bearer " + self.token
        for attempt in range(2):
            time.sleep(self.delay)
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
                    return json.load(r)
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt == 0:
                    time.sleep(30)
                    continue
                raise


def search(reddit, keyword, subs, days):
    t = "day" if days <= 1 else "week" if days <= 7 else "month"
    params = {"q": keyword, "sort": "new", "t": t, "limit": 50, "type": "link"}
    if subs:
        params["restrict_sr"] = "on"
        return reddit.get("/r/" + "+".join(subs) + "/search", params)
    return reddit.get("/search", params)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True, help="folder that ArtifactData exported the database into")
    ap.add_argument("--out", required=True)
    ap.add_argument("--days", type=float, default=7, help="only posts newer than this many days")
    ap.add_argument("--delay", type=float, default=2.5, help="seconds between Reddit requests")
    args = ap.parse_args()

    products = load_docs(os.path.join(args.db, "products"))
    lead_ids = set(load_docs(os.path.join(args.db, "leads")))
    seen = {pid: set(d.get("ids", [])) for pid, d in load_docs(os.path.join(args.db, "seen")).items()}
    cutoff = time.time() - args.days * 86400

    reddit = Reddit(args.delay)
    out = {"products": {}, "stats": {"requests": 0, "errors": []}}

    for pid, p in products.items():
        subs = [re.sub(r"^/?r/", "", s.strip()).strip("/") for s in p.get("subreddits", []) if s.strip()]
        groups = [subs[i:i + SUBS_PER_QUERY] for i in range(0, len(subs), SUBS_PER_QUERY)] or [[]]
        found = {}
        for kw in p.get("keywords", []):
            for group in groups:
                out["stats"]["requests"] += 1
                try:
                    listing = search(reddit, kw, group, args.days)
                except Exception as e:  # keep scanning other keywords
                    out["stats"]["errors"].append(f"{p.get('name', pid)} / {kw}: {e}")
                    if isinstance(e, urllib.error.HTTPError) and e.code == 403 and not out["products"] and not found:
                        sys.exit(f"Reddit refused the request (403). It is blocking this network; set "
                                 f"REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET to use the official API. {e}")
                    continue
                for child in listing.get("data", {}).get("children", []):
                    d = child.get("data", {})
                    rid = d.get("id")
                    lead_id = f"{pid}~{rid}"
                    if (not rid or lead_id in lead_ids or rid in seen.get(pid, set())
                            or d.get("created_utc", 0) < cutoff or d.get("over_18") or d.get("stickied")
                            or d.get("locked") or d.get("archived") or d.get("author") in (None, "[deleted]", "AutoModerator")):
                        continue
                    post = found.setdefault(rid, {
                        "lead_id": lead_id,
                        "reddit_id": rid,
                        "title": d.get("title", ""),
                        "body": (d.get("selftext") or "")[:1500],
                        "subreddit": d.get("subreddit", ""),
                        "author": d.get("author", ""),
                        "url": "https://www.reddit.com" + d.get("permalink", ""),
                        "created_utc": int(d.get("created_utc", 0)),
                        "num_comments": d.get("num_comments", 0),
                        "matched": [],
                    })
                    if kw not in post["matched"]:
                        post["matched"].append(kw)
        ranked = sorted(found.values(), key=lambda x: (-len(x["matched"]), -x["created_utc"]))[:MAX_PER_PRODUCT]
        out["products"][pid] = {"name": p.get("name", pid), "candidates": ranked}

    st = out["stats"]
    if st["requests"] and len(st["errors"]) == st["requests"]:
        sys.exit("Every Reddit request failed, so nothing was scanned. First error: " + st["errors"][0])

    with open(args.out, "w") as f:
        json.dump(out, f, indent=1)
    total = sum(len(v["candidates"]) for v in out["products"].values())
    print(f"{total} new candidates across {len(products)} products "
          f"({out['stats']['requests']} requests, {len(out['stats']['errors'])} errors) -> {args.out}")


if __name__ == "__main__":
    main()
```
