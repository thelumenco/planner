// Pulls today's Sunsama tasks straight into the village through the `mcp` capability (the viewer's Sunsama connector),
// so quests appear whenever the page is opened, even before chat has run boss mode.
// Chat's plan (written by the playable-boss skill, with first steps and pep talks) always wins: the page only writes
// the plan doc when there's no plan for today yet, or when today's plan came from this pull.
export const SUNSAMA = "Sunsama MCP";   // connector display name, must match the published manifest

const decode = s => { const t = document.createElement("textarea"); for (let i = 0; i < 2; i++) { t.innerHTML = s; s = t.value; } return s; };
export function htmlToText(html){
  if (!html) return "";
  const s = String(html)
    .replace(/<li[^>]*data-checked="true"[^>]*>/gi, "\n- ✓ ")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|h\d|ul|ol)>/gi, "\n").replace(/<br\s*\/?>/gi, "\n").replace(/<hr[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decode(s).split("\n").map(l => l.trim()).filter(l => l && l !== "-").join("\n");
}
export function minutesOf(est){
  if (!est) return 25;
  const h = /(\d+)\s*h/i.exec(est), m = /(\d+)\s*m/i.exec(est);
  const n = (h ? +h[1]*60 : 0) + (m ? +m[1] : 0);
  return n > 0 ? Math.min(180, n) : 25;
}

// Subtasks: Sunsama's own subtasks, plus any checklist ("task list") in the notes. Notes often describe each
// subtask under a bold heading with bullets beneath (that's how the planning skills write them); those details are
// lifted out and kept with their subtask, so the notebook can show a tidy checklist instead of one long wall of text.
// -> {subs: [{id?, title, done, est?, info: [lines]}], notes: what's left, as plain text lines}
const norm = s => String(s || "").toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]+/g, "");
const sameTitle = (a, b) => { a = norm(a); b = norm(b); return !!a && !!b && (a === b || (Math.min(a.length, b.length) >= 8 && (a.startsWith(b) || b.startsWith(a)))); };
const shortEst = e => { const m = minutesOf(e); return e ? (m >= 60 ? `${Math.floor(m/60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`) : ""; };
export function splitNotes(html, subtasks){
  const subs = (subtasks || []).filter(x => x && x.title).map(x => ({id: x._id, title: decode(x.title).trim(), done: !!x.completed, est: shortEst(x.timeEstimate), info: []}));
  const out = []; let cur = null;   // cur: the subtask whose details we're collecting
  const txt = el => decode(el.textContent || "").replace(/\s+/g, " ").trim();
  if (html && /</.test(html)) {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    for (const el of doc.body.firstChild.children) {
      const tag = el.tagName.toLowerCase();
      if (tag === "hr") { cur = null; continue; }
      if ((tag === "ul" || tag === "ol") && el.getAttribute("data-type") === "taskList") {
        for (const li of el.querySelectorAll(':scope > li')) { const t = txt(li); if (t) subs.push({title: t, done: li.getAttribute("data-checked") === "true", info: [], local: true}); }
        cur = null; continue;
      }
      if (tag === "ul" || tag === "ol") {
        const items = [...el.querySelectorAll(":scope > li")].map(txt).filter(Boolean);
        if (cur) cur.info.push(...items); else out.push(...items.map(i => "- " + i));
        continue;
      }
      const t = txt(el); if (!t) continue;
      const strong = el.firstElementChild && /^(strong|b)$/i.test(el.firstElementChild.tagName) && el.textContent.trim().startsWith(el.firstElementChild.textContent.trim()) ? txt(el.firstElementChild) : "";
      const hit = strong && subs.find(x => !x.local && (sameTitle(x.title, strong) || sameTitle(x.title.replace(/^\[[^\]]*\]\s*/, ""), strong.replace(/^\[[^\]]*\]\s*/, ""))));
      if (hit) { if (out.length && out[out.length - 1] && out[out.length - 1].head) out.pop();   // a heading over subtasks only
        cur = hit; const rest = t.slice(strong.length).trim(); if (rest) hit.info.push(rest); continue; }
      cur = null; out.push(strong && strong === t && /:$/.test(t) ? {head: t} : t);
    }
  } else if (html) out.push(...htmlToText(html).split("\n"));
  const kept = out.filter((l, i) => !(l && l.head) || (i + 1 < out.length && !(out[i + 1] && out[i + 1].head))).map(l => l && l.head ? l.head : l);
  return {subs, notes: kept.join("\n")};
}
// One Sunsama task -> one quest. Ids stay the Sunsama _id, so progress survives re-pulls and chat rewrites.
export function toQuest(t){
  const sp = splitNotes(t.notes, t.subtasks), notes = sp.notes;
  const q = {id: t._id, title: t.title.trim(), minutes: minutesOf(t.timeEstimate), channel: t.channel || t.category || "", source: "sunsama"};
  if (t.completed) q.completed = true;
  if (notes) q.notes = notes.slice(0, 4000);
  if (sp.subs.length) q.subtasks = sp.subs.slice(0, 40).map(x => Object.assign(x, {info: x.info.slice(0, 12).map(l => l.slice(0, 400))}));
  if (/^personal$/i.test(q.channel) || t.isPersonal) q.place = "home";

  const gmail = /https:\/\/mail\.google\.com\/[^\s"<]+/.exec(decode(t.notes || ""));
  if (gmail || /\b(email|inbox|reply|comms)\b/i.test(t.title)) {
    q.place = "post"; q.spot = "counter";
    q.email = {subject: t.title.replace(/^\[[^\]]*\]\s*/, ""), link: gmail ? gmail[0] : "https://mail.google.com/mail/u/0/#inbox"};
  }
  if (/🚶|treadmill/i.test(t.title)) { q.treadmill = true; q.place = "home"; q.spot = "treadmill"; delete q.email; }  // a treadmill task: straight to the treadmill
  else if (/\bwalk\b/i.test(t.title)) q.treadmill = true;                                                              // walkable: offered
  return q;
}

export function questsFrom(payload){
  const list = payload && Array.isArray(payload.tasks) ? payload.tasks : Array.isArray(payload) ? payload : [];
  // Completed tasks are kept (flagged) so the page can count them as done instead of dropping them from the recap.
  return list.filter(t => t && t._id && t.title && !t.deleted && !t.isArchived && !t.isBacklogged)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(toQuest);
}

// Finishing a quest ticks the task off in Sunsama (finishedDay = the day Mel did it). Resolves true/false.
// Tick (or untick) one subtask in Sunsama. -> true when Sunsama accepted it
export async function subtaskInSunsama(taskId, subtaskId, done){
  let mcp = null; try { mcp = window.claude && claude.use ? await claude.use("mcp") : null; } catch {}
  if (!mcp || !taskId || !subtaskId) return false;
  try { await mcp.callTool(SUNSAMA, done ? "mark_subtask_as_completed" : "mark_subtask_as_incomplete", {taskId, subtaskId}); return true; } catch (e) { return false; }
}
export async function completeInSunsama(taskId, day){
  let mcp = null; try { mcp = window.claude && claude.use ? await claude.use("mcp") : null; } catch {}
  if (!mcp || !taskId) return false;
  try { await mcp.callTool(SUNSAMA, "mark_task_as_completed", {taskId, finishedDay: day}); return true; } catch (e) { return false; }
}
// Returns {tasks} on success, or {error: code, message} so the UI can say exactly what to fix.
export async function pullSunsama(day, opts = {}){
  let mcp = null;
  try { mcp = window.claude && claude.use ? await claude.use("mcp") : null; } catch {}
  if (!mcp) return {error: "unavailable"};
  try {
    const res = await mcp.callTool(SUNSAMA, "read_resource", {uri: `sunsama://tasks/${day}`}, {cache: {staleTime: opts.fresh ? 0 : 60000, refresh: !!opts.fresh}});
    let p = res && res.payload;
    if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
    // Some MCP resource readers wrap the resource as {contents:[{text}]}
    if (p && Array.isArray(p.contents) && p.contents[0] && p.contents[0].text) { try { p = JSON.parse(p.contents[0].text); } catch {} }
    return {tasks: questsFrom(p)};
  } catch (e) {
    return {error: (e && e.code) || "upstream_error", message: e && e.message, retryable: !!(e && e.retryable), retryAfterMs: e && e.retryAfterMs};
  }
}

export const SUNSAMA_ERRORS = {
  unavailable: "Sunsama isn't reachable from this view.",
  needs_reauth: "Sunsama needs reconnecting: claude.ai Settings → Connectors.",
  server_not_connected: "Add the Sunsama connector in claude.ai Settings → Connectors.",
  selection_required: "Pick which Sunsama connector to use when claude.ai asks.",
  not_in_manifest: "Sunsama is switched off for this page. Turn it on in the page's Permissions.",
  not_granted: "Sunsama isn't allowed for this page.",
  blocked_by_policy: "Your organisation's policy blocks Sunsama here.",
  server_unavailable: "Sunsama didn't answer just now. Try again in a minute.",
  tool_error: "Sunsama returned an error."
};
