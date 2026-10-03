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

// One Sunsama task -> one quest. Ids stay the Sunsama _id, so progress survives re-pulls and chat rewrites.
export function toQuest(t){
  let notes = htmlToText(t.notes);
  const subs = (t.subtasks || []).filter(s => s && s.title);
  if (subs.length) notes = (notes ? notes + "\n" : "") + "Subtasks:\n" + subs.map(s => `- ${s.completed ? "✓ " : ""}${s.title}`).join("\n");
  const q = {id: t._id, title: t.title.trim(), minutes: minutesOf(t.timeEstimate), channel: t.channel || t.category || "", source: "sunsama"};
  if (t.completed) q.completed = true;
  if (notes) q.notes = notes.slice(0, 4000);
  if (/^personal$/i.test(q.channel) || t.isPersonal) q.place = "home";
  if (/🚶|treadmill|\bwalk\b/i.test(t.title)) q.treadmill = true;
  const gmail = /https:\/\/mail\.google\.com\/[^\s"<]+/.exec(decode(t.notes || ""));
  if (gmail || /\b(email|inbox|reply|comms)\b/i.test(t.title)) {
    q.place = "post"; q.spot = "counter";
    q.email = {subject: t.title.replace(/^\[[^\]]*\]\s*/, ""), link: gmail ? gmail[0] : "https://mail.google.com/mail/u/0/#inbox"};
  }
  return q;
}

export function questsFrom(payload){
  const list = payload && Array.isArray(payload.tasks) ? payload.tasks : Array.isArray(payload) ? payload : [];
  // Completed tasks are kept (flagged) so the page can count them as done instead of dropping them from the recap.
  return list.filter(t => t && t._id && t.title && !t.deleted && !t.isArchived && !t.isBacklogged)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(toQuest);
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
