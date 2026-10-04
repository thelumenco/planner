// Today's schedule from Mel's Google calendars, read through the page's `mcp` capability (her Google Calendar
// connector). Shown on the calendar icon's panel. Read-only: the page never changes events.
export const GCAL = "Google Calendar";   // connector display name, must match the published manifest
export const CALENDARS = [
  {id: "primary", name: "Fresh Pages Co", color: "var(--peri2)"},
  {id: "5ie48aa9lld2tmkqvfrs4t0lqs@group.calendar.google.com", name: "Personal", color: "var(--rose)"},
  {id: "28c6d66a29b701bf4e58ccb22983ebfc2c4ac34fccb42fd7f0dc5e5239e72665@group.calendar.google.com", name: "The Tans", color: "var(--sage)"}
];

let cache = {day: "", at: 0, events: [], error: null};

// -> {events:[{id, title, start, end, allDay, where, link, cal, color}], error?}
export async function todaysEvents(day, fresh){
  if (!fresh && cache.day === day && Date.now() - cache.at < 5*60e3) return cache;
  let mcp = null;
  try { mcp = window.claude && claude.use ? await claude.use("mcp") : null; } catch {}
  if (!mcp) return (cache = {day, at: Date.now(), events: [], error: "unavailable"});
  const startTime = `${day}T00:00:00+08:00`, end = new Date(Date.parse(startTime) + 864e5).toISOString().replace(".000Z", "Z");
  const results = await Promise.all(CALENDARS.map(async c => {
    try {
      const r = await mcp.callTool(GCAL, "list_events", {calendarId: c.id, startTime, endTime: end, orderBy: "startTime", timeZone: "Asia/Singapore", pageSize: 60}, {cache: {staleTime: fresh ? 0 : 120000, refresh: !!fresh}});
      let p = r && r.payload; if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
      return {c, events: (p && Array.isArray(p.events)) ? p.events : []};
    } catch (e) { return {c, events: [], error: (e && e.code) || "upstream_error"}; }
  }));
  const events = [];
  results.forEach(({c, events: evs}) => evs.forEach(ev => {
    if (!ev || ev.status === "cancelled" || !ev.start) return;
    const allDay = !ev.start.dateTime;
    events.push({id: ev.id, title: ev.summary || "(busy)", allDay, start: allDay ? null : Date.parse(ev.start.dateTime), end: ev.end && ev.end.dateTime ? Date.parse(ev.end.dateTime) : null,
      where: ev.location || "", link: ev.htmlLink || "", cal: c.name, color: c.color});
  }));
  events.sort((a, b) => (a.allDay ? -1 : a.start) - (b.allDay ? -1 : b.start));
  const failed = results.filter(r => r.error);
  return (cache = {day, at: Date.now(), events, error: failed.length === results.length ? failed[0].error : null});
}
export const CAL_ERRORS = {
  unavailable: "Your calendar isn't reachable from this view.",
  needs_reauth: "Google Calendar needs reconnecting: claude.ai Settings → Connectors.",
  server_not_connected: "Add the Google Calendar connector in claude.ai Settings → Connectors.",
  not_in_manifest: "Google Calendar is switched off for this page. Turn it on in the page's Permissions.",
  server_unavailable: "Google Calendar didn't answer. Try again in a minute."
};
