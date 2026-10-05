// The weekly review: a scrapbook page for the week (Monday to Sunday) at the town hall's review desk. It gathers
// what the village already knows (quests per day, routines kept, trophies, savings, letters and journal pages, the
// garden, steps and water) and this week's Sunsama objectives with their ticks, then ends with next week's three
// priorities, which go to Sunsama as next week's weekly objectives. Best done on a Friday; it's open any day.
// Reviews are kept in the game save: F.reviews[weekStart] = {at, priorities: [..], sent: [true|false, ..]}.
import { esc, plain, dayKey, now } from "../util.js";
import { SUNSAMA } from "./sunsama.js";

const WD = ["M", "T", "W", "T", "F", "S", "S"];
export const weekStart = (d = dayKey()) => { const t = new Date(d + "T00:00:00Z"); return new Date(t.getTime() - ((t.getUTCDay() + 6) % 7)*864e5).toISOString().slice(0, 10); };
export const weekDays = ws => Array.from({length: 7}, (_, i) => new Date(Date.parse(ws + "T00:00:00Z") + i*864e5).toISOString().slice(0, 10));
export const nextMonday = (d = dayKey()) => new Date(Date.parse(weekStart(d) + "T00:00:00Z") + 7*864e5).toISOString().slice(0, 10);
const sgMidnight = d => Date.parse(d + "T00:00:00+08:00");
const fmtDay = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "short", timeZone: "UTC"});

/* ---------- Sunsama: this week's objectives, and next week's new ones ---------- */
export const rw = {obj: null, objErr: false, objFor: "", sending: false, draft: null, showPast: false};
const mcp = async () => { try { return window.claude && claude.use ? await claude.use("mcp") : null; } catch { return null; } };
export async function loadObjectives(day = dayKey()){
  if (rw.objFor === day && rw.obj) return; const m = await mcp(); if (!m) { rw.objErr = true; rw.noMcp = true; return; }
  try {
    const r = await m.callTool(SUNSAMA, "read_resource", {uri: `sunsama://objectives/${day}`}, {cache: {staleTime: 5*60e3}});
    let p = r && r.payload; if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
    if (p && Array.isArray(p.contents) && p.contents[0] && p.contents[0].text) { try { p = JSON.parse(p.contents[0].text); } catch {} }
    rw.obj = (p && Array.isArray(p.objectives) ? p.objectives : []).filter(o => o && o.title).map(o => ({title: plain(String(o.title)).slice(0, 120), done: !!o.completed}));
    rw.objFor = day; rw.objErr = false;
  } catch { rw.objErr = true; }
}
// -> true when Sunsama took it
async function createObjective(title, weekStartDay){
  const m = await mcp(); if (!m) return false;
  try { await m.callTool(SUNSAMA, "create_weekly_objective", {title, weekStartDay}); return true; } catch { return false; }
}

/* ---------- the week, gathered ---------- */
// c: {F, history(day) -> {q, steps, water, harvest, coins}, routines(days), jars(), letters(ms), journal(ms), today}
export function gather(c){
  const ws = weekStart(c.today), days = weekDays(ws), since = sgMidnight(ws);
  const rows = days.map(d => d > c.today ? null : Object.assign({q: 0, steps: 0, water: 0, harvest: 0, coins: 0}, c.history(d) || {}));
  const past = rows.filter(Boolean), sum = k => past.reduce((a, r) => a + (r[k] || 0), 0);
  const best = past.reduce((a, r, i) => r.q > a.q ? {q: r.q, d: days[i]} : a, {q: 0, d: null});
  const jars = c.jars().map(j => ({label: j.label, cur: j.cur || "$", added: (j.log || []).filter(e => e.at >= since && e.amt > 0 && !e.emptied).reduce((a, e) => a + e.amt, 0), filled: !!(j.fullAt && j.fullAt >= since)}));
  return {ws, days, rows, today: c.today, quests: sum("q"), best, coins: sum("coins"), steps: sum("steps"), harvest: sum("harvest"),
    walked: past.filter(r => r.steps >= 5000).length, water: past.filter(r => r.water > 0).length ? sum("water")/past.filter(r => r.water > 0).length : 0,
    routines: c.routines(days), trophies: (c.F.trophies || []).filter(t => t.at >= since).sort((a, b) => a.at - b.at),
    jars: jars.filter(j => j.added || j.filled), letters: c.letters(since), journal: c.journal(since)};
}

/* ---------- the page ---------- */
const card = (title, icon, body, tape) => `<section class="rvcard"><span class="rvtape ${tape || ""}" aria-hidden="true"></span><h3>${icon}${esc(title)}</h3>${body}</section>`;
const ico = path => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" class="rvico"><g fill="none" stroke="#3b3530" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${path}</g></svg>`;
const I = {
  quests: ico(`<rect x="5" y="3" width="14" height="18" rx="2" fill="#F6E3A1"/><path d="M8 9 l2 2 l4 -4 M8 15 h8"/>`),
  routine: ico(`<rect x="4" y="4" width="16" height="16" rx="3" fill="#D6E8F7"/><path d="M8 9 h8 M8 13 h8 M8 17 h5"/>`),
  trophy: ico(`<path d="M8 4 h8 v5 a4 4 0 0 1 -8 0z" fill="#F3C969"/><path d="M8 6 h-3 a3 3 0 0 0 3 4 M16 6 h3 a3 3 0 0 1 -3 4 M12 13 v4 M8 20 h8"/>`),
  jar: ico(`<path d="M7 7 h10 v11 a2 2 0 0 1 -2 2 h-6 a2 2 0 0 1 -2 -2z" fill="#E3F0F5"/><rect x="6" y="4" width="12" height="3" rx="1" fill="#C9A227"/><path d="M10 14 l2 -2 l2 2 l-2 2z" fill="#D9485F"/>`),
  letter: ico(`<rect x="3" y="6" width="18" height="13" rx="2" fill="#FFFDF6"/><path d="M3 7 l9 6 l9 -6"/>`),
  garden: ico(`<path d="M12 21 V11" /><path d="M12 13 q-6 0 -6 -6 q6 0 6 6z M12 11 q6 0 6 -6 q-6 0 -6 6z" fill="#9CC27E"/>`),
  body: ico(`<circle cx="12" cy="5" r="2.4" fill="#F4C7CF"/><path d="M12 8 v7 M8 11 h8 M12 15 l-3 6 M12 15 l3 6"/>`),
  goal: ico(`<circle cx="12" cy="12" r="8" fill="#FBE3D2"/><circle cx="12" cy="12" r="4.5" fill="#FFFDF6"/><circle cx="12" cy="12" r="1.6" fill="#D9485F"/>`),
  star: ico(`<path d="M12 3 l2.6 5.6 6 .7 -4.5 4.1 1.2 6 -5.3 -3 -5.3 3 1.2 -6 -4.5 -4.1 6 -.7z" fill="#F6E3A1"/>`)
};
function bars(w){
  const max = Math.max(3, ...w.rows.map(r => r ? r.q : 0));
  return `<svg class="rvbars" viewBox="0 0 196 70" width="196" height="70" aria-hidden="true">${w.rows.map((r, i) => { const x = 8 + i*27, hgt = r ? Math.max(r.q ? 6 : 2, 46*r.q/max) : 2, today = w.days[i] === w.today;
    return `<rect x="${x}" y="${50 - hgt}" width="18" height="${hgt}" rx="3" fill="${!r ? "#EAE3D8" : today ? "#F3C969" : "#9AA9DD"}" stroke="${r ? "#3b3530" : "none"}" stroke-width="1.2"/>${r && r.q ? `<text x="${x + 9}" y="${44 - hgt}" text-anchor="middle" font-size="10" font-weight="700" fill="#2F2B28">${r.q}</text>` : ""}<text x="${x + 9}" y="64" text-anchor="middle" font-size="10" font-weight="${today ? 800 : 600}" fill="${today ? "#2F2B28" : "#8A8279"}">${WD[i]}</text>`; }).join("")}</svg>`;
}
const dots = days => `<span class="rvdots">${days.map((d, i) => `<i class="${d === true ? "on" : d === false ? "off" : "na"}" title="${WD[i]}">${WD[i]}</i>`).join("")}</span>`;
// c: as for gather(), plus: trophySVG(t, size), canSend (Sunsama connector available)
export function reviewPanel(F, c){
  const w = gather(c), rev = (F.reviews || {})[w.ws], nm = nextMonday(c.today), fri = new Date(c.today + "T00:00:00Z").getUTCDay() === 5;
  if (!rw.draft || rw.draft.ws !== w.ws) rw.draft = {ws: w.ws, p: rev ? rev.priorities.slice() : ["", "", ""]};
  let h = `<span class="tape dots" aria-hidden="true"></span><h2>Your week in the village</h2>
    <p class="sub">${fmtDay(w.days[0])} to ${fmtDay(w.days[6])}${fri ? ". Happy Friday! Here's everything you did." : ". The week so far."}</p><div class="rvgrid">`;
  h += card(`${w.quests} quest${w.quests === 1 ? "" : "s"} done`, I.quests, `${bars(w)}<p class="rvnote">${w.best.q ? `Best day: ${new Date(w.best.d + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "long", timeZone: "UTC"})}, with ${w.best.q}.` : "The week's just getting going."} ${w.coins} coins earned.</p>`, "peach");
  const rt = w.routines.filter(r => r.days.some(d => d !== null));
  h += card("Routines kept", I.routine, rt.length ? rt.map(r => { const due = r.days.filter(d => d !== null).length, kept = r.days.filter(d => d === true).length;
    return `<div class="rvrow"><b>${esc(r.name)}</b><small>${kept} of ${due} day${due === 1 ? "" : "s"}</small>${dots(r.days)}</div>`; }).join("") : `<p class="rvnote">No routines due yet this week. They live on the noticeboard in your room.</p>`, "sky");
  h += card(w.trophies.length ? `${w.trophies.length} new troph${w.trophies.length === 1 ? "y" : "ies"}` : "Trophies", I.trophy, w.trophies.length ? `<div class="rvtroph">${w.trophies.slice(0, 6).map(t => `<figure>${c.trophySVG(t, 46)}<figcaption>${esc(t.label)}</figcaption></figure>`).join("")}</div>` : `<p class="rvnote">None new this week. The next one's closer than you think.</p>`, "butter");
  h += card("Savings", I.jar, w.jars.length ? w.jars.map(j => `<div class="rvrow"><b>${esc(j.label)}</b><small>${j.added ? `+${esc(j.cur)}${j.added.toLocaleString("en-GB")}` : ""}${j.filled ? " · filled to the top!" : ""}</small></div>`).join("") : `<p class="rvnote">No jewels added this week. Opal's always in.</p>`, "sage");
  h += card("Words", I.letter, `<div class="rvrow"><b>${w.journal}</b><small>journal page${w.journal === 1 ? "" : "s"}</small></div><div class="rvrow"><b>${w.letters.universe}</b><small>letter${w.letters.universe === 1 ? "" : "s"} to the universe</small></div><div class="rvrow"><b>${w.letters.future}</b><small>letter${w.letters.future === 1 ? "" : "s"} to future you</small></div>`, "blush");
  h += card("Body and garden", I.body, `<div class="rvrow"><b>${w.steps.toLocaleString("en-GB")}</b><small>steps${w.walked ? `, ${w.walked} day${w.walked === 1 ? "" : "s"} over 5,000` : ""}</small></div><div class="rvrow"><b>${w.water ? (w.water/1000).toFixed(1) + "L" : "-"}</b><small>water a day, on average</small></div><div class="rvrow"><b>${w.harvest}</b><small>harvest${w.harvest === 1 ? "" : "s"} from the garden</small></div>`, "peach");
  // this week's objectives from Sunsama
  const ob = rw.objFor === c.today ? rw.obj : null;
  h += `</div>` + card("This week's objectives", I.goal, !c.canSend ? `<p class="rvnote">Connect Sunsama to see your weekly objectives here.</p>` : rw.objErr && !ob ? `<p class="rvnote">Couldn't reach Sunsama just now.</p>` : !ob ? `<p class="rvnote">Fetching them from Sunsama…</p>` : !ob.length ? `<p class="rvnote">No weekly objectives set in Sunsama this week.</p>`
    : `<ul class="rvobj">${ob.map(o => `<li class="${o.done ? "done" : ""}"><span class="rvtick" aria-hidden="true"></span>${esc(o.title)}</li>`).join("")}</ul><p class="rvnote">${ob.filter(o => o.done).length} of ${ob.length} done${ob.every(o => o.done) ? ". Every one! That's a rosette in the courtyard." : "."}</p>`, "sky wide");
  // next week's priorities
  const sent = rev && rev.sent && rev.sent.some(Boolean);
  h += `<section class="rvcard rvnext"><span class="rvtape butter" aria-hidden="true"></span><h3>${I.star}Next week's three priorities</h3>
    <p class="rvnote">Week of ${fmtDay(nm)}. ${c.canSend ? "They go to Sunsama as next week's weekly objectives." : "Saved here (Sunsama isn't connected)."}</p>
    <ol class="rvprio">${[0, 1, 2].map(i => { const ok = rev && rev.sent && rev.sent[i];
      return `<li><label class="sr" for="rvP${i}">Priority ${i + 1}</label><input id="rvP${i}" class="rvp" data-i="${i}" maxlength="120" placeholder="${["The one that matters most", "Then this", "And this"][i]}" value="${esc(rw.draft.p[i] || "")}" ${ok ? "disabled" : ""}>${ok ? `<span class="rvok" title="In Sunsama">in Sunsama</span>` : ""}</li>`; }).join("")}</ol>
    <div class="actions"><button class="btn primary" data-rv="send" ${rw.sending ? "disabled" : ""}>${rw.sending ? "Sending…" : sent ? (rev.sent.every((x, i) => x || !rev.priorities[i]) ? "Update the review" : "Try the rest again") : c.canSend ? "Send to Sunsama and finish" : "Finish the review"}</button></div>
    ${rev ? `<p class="rvnote">Reviewed ${new Date(rev.at).toLocaleDateString("en-GB", {weekday: "long", timeZone: "Asia/Singapore"})}. Well done.</p>` : ""}</section>`;
  // past weeks
  const past = Object.keys(F.reviews || {}).filter(k => k !== w.ws).sort().reverse().slice(0, 8);
  if (past.length) h += `<button class="subdonebtn" data-rv="past" aria-expanded="${rw.showPast}">Past weeks (${past.length}) ${rw.showPast ? "▴" : "▾"}</button>${rw.showPast ? `<ul class="hlist wlist">${past.map(k => `<li><span class="wtxt"><b>Week of ${fmtDay(k)}</b><small>${F.reviews[k].priorities.filter(Boolean).map(esc).join(" · ") || "no priorities set"}</small></span></li>`).join("")}</ul>` : ""}`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// api: {save, rerender, say, sfx, canSend, coins(n), today}
export function wireReview(root, F, api){
  root.querySelectorAll(".rvp").forEach(inp => inp.oninput = () => { rw.draft.p[+inp.dataset.i] = inp.value; });
  root.querySelectorAll("[data-rv]").forEach(b => b.onclick = async () => {
    if (b.dataset.rv === "past") { rw.showPast = !rw.showPast; api.rerender(); return; }
    const ws = weekStart(api.today), nm = nextMonday(api.today), pr = rw.draft.p.map(x => plain(String(x || "")).trim().slice(0, 120));
    if (!pr.some(Boolean)) { api.say("Pop in at least one priority for next week first."); return; }
    F.reviews = F.reviews || {}; const first = !F.reviews[ws], rev = F.reviews[ws] = Object.assign({sent: []}, F.reviews[ws] || {}, {priorities: pr, at: (F.reviews[ws] || {}).at || now()});
    if (api.canSend) {
      rw.sending = true; api.rerender();
      for (let i = 0; i < 3; i++) if (pr[i] && !rev.sent[i]) rev.sent[i] = await createObjective(pr[i], nm);
      rw.sending = false;
    }
    if (first) api.coins(15);
    api.sfx("chime"); api.save();
    const bad = api.canSend && pr.some((p, i) => p && !rev.sent[i]);
    api.say(bad ? "Saved. Some didn't reach Sunsama, so tap again in a bit." : first ? `Week reviewed! ${api.canSend ? "Next week's priorities are in Sunsama. " : ""}Plus 15 coins. Rest well.` : "Review updated.");
    api.rerender();
  });
}
