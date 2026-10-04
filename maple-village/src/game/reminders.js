// Reminders: "remind me to get the laundry in in an hour" in Maple's chat becomes a 10-minute event on Mel's
// Personal Google Calendar with a pop-up alert at the start time, so her phone's Calendar app notifies her even
// when the village is closed. Kept in F.reminders (follows her across devices) so the village can list them,
// cancel them (Undo puts them back), and have Maple say it out loud if the page happens to be open at the time.
import { GCAL, CALENDARS, CAL_ERRORS } from "./calendar.js";
import { plain } from "../util.js";

const CAL = CALENDARS.find(c => c.name === "Personal") || CALENDARS[0];
const TZ = "Asia/Singapore", SG = 8*36e5;
const sgISO = ms => new Date(ms + SG).toISOString().slice(0, 19) + "+08:00";
export const fmtWhen = ms => {
  const t = new Date(ms).toLocaleTimeString("en-SG", {hour: "numeric", minute: "2-digit", timeZone: TZ}).replace(/\s/g, "").toLowerCase();
  const day = d => new Date(d + SG).toISOString().slice(0, 10);
  const today = day(Date.now()), tmr = day(Date.now() + 864e5), d = day(ms);
  return d === today ? t : d === tmr ? `${t} tomorrow` : `${t} ${new Date(ms).toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short", timeZone: TZ})}`;
};
// {minutes} from now, or {at:"HH:MM"} (Singapore, next time it comes round) with an optional {date:"YYYY-MM-DD"}
export function whenOf(a){
  const m = Number(a && a.minutes);
  if (m > 0) return Date.now() + Math.min(m, 60*24*14)*60e3;
  const hm = /^(\d{1,2}):(\d{2})$/.exec(String(a && a.at || "").trim()); if (!hm || +hm[1] > 23 || +hm[2] > 59) return null;
  const day = /^\d{4}-\d{2}-\d{2}$/.test(String(a.date || "")) ? a.date : new Date(Date.now() + SG).toISOString().slice(0, 10);
  let t = Date.parse(`${day}T${hm[1].padStart(2, "0")}:${hm[2]}:00+08:00`);
  if (!a.date && t <= Date.now() + 30e3) t += 864e5;
  return t > Date.now() && t < Date.now() + 366*864e5 ? t : null;
}
async function mcp(){ try { return window.claude && claude.use ? await claude.use("mcp") : null; } catch { return null; } }
// create_event's result shape isn't documented: look for the new event's id in the usual places
function eventId(r){
  let p = r && r.payload !== undefined ? r.payload : r;
  if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
  if (p && Array.isArray(p.content) && p.content[0] && typeof p.content[0].text === "string") { try { p = JSON.parse(p.content[0].text); } catch {} }
  const id = p && (p.id || p.eventId || (p.event && p.event.id));
  return typeof id === "string" ? id : null;
}
async function createEvent(text, at){
  const m = await mcp(); if (!m) throw {code: "unavailable"};
  const r = await m.callTool(GCAL, "create_event", {calendarId: CAL.id, summary: `Reminder: ${text}`, description: "Set by Maple in Maple's village.",
    startTime: sgISO(at), endTime: sgISO(at + 10*60e3), timeZone: TZ, availability: "AVAILABILITY_FREE", useDefaultReminders: false,
    overrideReminders: [{method: "popup", minutes: 0}]});
  return eventId(r);
}
const list = F => (F.reminders = Array.isArray(F.reminders) ? F.reminders : []);
export const upcoming = F => list(F).filter(r => !r.cancelled && r.at > Date.now() - 30*60e3).sort((a, b) => a.at - b.at);

// -> {ok:true, r, line} | {ok:false, line}
export async function addReminder(F, a, save){
  const text = plain(String(a && a.text || "")).replace(/^(to\s+)/i, "").trim().slice(0, 80), at = whenOf(a);
  if (!text || !at) return {ok: false, line: "I couldn't work out when. Try \"in 1 hour\" or \"at 6:30pm\"."};
  try {
    const id = await createEvent(text, at);
    const r = {id: "r" + Date.now().toString(36), text, at, eventId: id, cal: CAL.id, made: Date.now()};
    list(F).push(r); F.reminders = F.reminders.filter(x => x.at > Date.now() - 2*864e5).slice(-40); save();
    return {ok: true, r, line: `Reminder at ${fmtWhen(at)}: ${text}`};
  } catch (e) { return {ok: false, line: e && e.code === "not_granted" ? "Calendar reminders need your OK first. Allow Google Calendar in the page's Permissions." : CAL_ERRORS[e && e.code] || "I couldn't add that to your calendar just now."}; }
}
// Cancel takes the event off the calendar; the returned restore() puts a fresh one back (for Undo)
export async function cancelReminder(F, id, save){
  const r = list(F).find(x => x.id === id); if (!r) return null;
  r.cancelled = true; save();
  const m = await mcp();
  if (m && r.eventId) { try { await m.callTool(GCAL, "delete_event", {calendarId: r.cal || CAL.id, eventId: r.eventId, notificationLevel: "NONE"}); } catch {} }
  return async () => { if (r.at <= Date.now()) return; try { r.eventId = await createEvent(r.text, r.at); } catch {} r.cancelled = false; save(); };
}
// Reminders due now that this page hasn't announced yet (Maple says them if the village is open)
export function dueNow(F){
  const out = list(F).filter(r => !r.cancelled && !r.said && r.at <= Date.now() && r.at > Date.now() - 5*60e3);
  out.forEach(r => { r.said = true; });
  return out;
}
