// The fountain's wish: Mel's weekly visualisation ritual (her weekly-visualisation skill), in the courtyard.
// Purely reflective: the only things read are the month's theme (Notion Plans), last week's visualisation (for one
// look-back question) and, after the questions, her cycle phase from The Tans calendar. One question at a time with
// a warm one-line reflection; then a short present-tense summary in her own words. On her OK it's saved to the
// Weekly Visualisations database in Notion and the actions she ticks go to Sunsama (next week, a weekday).
import { esc, plain, dayKey } from "../util.js";
import { NOTION, readPlan } from "./plans.js";
import { SUNSAMA } from "./sunsama.js";
import { GCAL, CALENDARS } from "./calendar.js";

const VIS_DS = "ba8f40af-fcf2-4fe5-8831-71cbe1232dd9";   // Weekly Visualisations data source
const QUESTIONS = [
  "Close your eyes for a second. It's next Friday afternoon and the week went beautifully. What's the first thing you feel?",
  "What happened this week that made it feel that way? What's the one thing you're most proud of?",
  "Who were you in this week? How did you show up: as founder, as mum, as Mel?",
  "Where did your energy flow easiest? And what did you protect it from?",
  "Is there anything you're calling in this week? Something you're ready to receive, even if you can't control it?",
  "If this week had one word, a feeling to return to when things wobble, what is it?"];
export const vz = {step: "menu", answers: [], reflect: "", look: null, lookA: "", month: "", sum: null, pick: [], busy: false, error: "", draft: "", saved: null};
const unwrap = r => { let p = r && r.payload !== undefined ? r.payload : r; if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
  if (p && Array.isArray(p.content) && p.content[0] && typeof p.content[0].text === "string") { try { return JSON.parse(p.content[0].text); } catch { return p.content[0].text; } } return p; };
async function mcp(){ try { return window.claude && claude.use ? await claude.use("mcp") : null; } catch { return null; } }
const SG = 8*36e5, iso = ms => new Date(ms).toISOString().slice(0, 10);
const comingMonday = () => { const t = Date.parse(dayKey() + "T00:00:00Z"), dow = new Date(t).getUTCDay(); return iso(t + ((8 - dow) % 7 || 7)*864e5); };
const nice = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric", timeZone: "UTC"});

// last week's visualisation (only if it's recent): {theme, word}
async function lastVision(){
  const m = await mcp(); if (!m) return null;
  try {
    const s = unwrap(await m.callTool(NOTION, "notion-search", {query: "Week of", data_source_url: "collection://" + VIS_DS, page_size: 5}, {cache: {staleTime: 30*60e3}}));
    const hits = (s && Array.isArray(s.results)) ? s.results : []; let best = null;
    for (const h of hits.slice(0, 3)) {
      const page = unwrap(await m.callTool(NOTION, "notion-fetch", {id: h.id || h.url}, {cache: {staleTime: 30*60e3}}));
      const raw = typeof page === "string" ? page : (page && page.text) || "", pm = /<properties>\s*(\{[\s\S]*?\})\s*<\/properties>/.exec(raw);
      let p = {}; try { p = pm ? JSON.parse(pm[1]) : {}; } catch {}
      const d = p["date:Date:start"] || ""; if (d && (!best || d > best.date)) best = {date: d, theme: String(p.Theme || "").slice(0, 120), word: String(p["Feeling Word"] || "").slice(0, 40)};
    }
    if (best && Date.now() - Date.parse(best.date + "T00:00:00Z") < 21*864e5 && (best.theme || best.word)) return best;
  } catch {}
  return null;
}
async function cyclePhase(){
  const m = await mcp(), tans = CALENDARS.find(c => c.name === "The Tans"); if (!m || !tans) return "";
  try {
    const end = new Date().toISOString().replace(/\.\d+Z$/, "Z"), start = new Date(Date.now() - 45*864e5).toISOString().replace(/\.\d+Z$/, "Z");
    const p = unwrap(await m.callTool(GCAL, "list_events", {calendarId: tans.id, startTime: start, endTime: end, timeZone: "Asia/Singapore", pageSize: 100}));
    const d1 = ((p && p.events) || []).filter(e => /period day 1/i.test(e.summary || "")).map(e => (e.start && (e.start.date || e.start.dateTime) || "").slice(0, 10)).filter(Boolean).sort().pop();
    if (!d1) return "";
    const n = Math.floor((Date.parse(dayKey() + "T00:00:00Z") - Date.parse(d1 + "T00:00:00Z"))/864e5) + 1;
    return n < 1 || n > 40 ? "" : n <= 5 ? "Menstrual" : n <= 13 ? "Follicular" : n <= 16 ? "Ovulatory" : "Luteal";
  } catch { return ""; }
}

/* ---------- panel ---------- */
export function fountainPanel(canAsk){
  const h = `<span class="tape sky" aria-hidden="true"></span><h2>The fountain</h2>`;
  if (vz.step === "menu") return h + `<p class="sub">The water's catching the light. What kind of wish?</p>
    <div class="vmenu"><button class="btn alt" data-vz="coin">Toss a coin</button>${canAsk ? `<button class="btn primary" data-vz="start">Visualise my week</button>` : ""}</div>
    ${canAsk ? `<p class="muted">The visualisation is your Friday ritual: six gentle questions, then the week written back to you. About ten minutes.</p>` : `<p class="muted">The visualisation needs Claude, which isn't reachable from this view just now.</p>`}
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  if (vz.step === "intro") return h + `<div class="vq"><p>Let's close the week behind you and paint the one ahead: how you want it to feel, who you want to be in it, what you're calling in.</p>
    ${vz.month ? `<p>This month's word is <i>${esc(vz.month)}</i>. Hold it loosely as you picture the week.</p>` : ""}${vz.busy ? `<p class="muted">Settling in…</p>` : ""}</div>
    <div class="actions"><button class="btn primary" data-vz="begin" ${vz.busy ? "disabled" : ""}>I'm ready</button><button class="btn alt small" data-vz="menu">Not now</button></div>`;
  if (vz.step === "look" || vz.step.startsWith("q")) {
    const i = vz.step === "look" ? -1 : +vz.step.slice(1);
    const q = i < 0 ? `Last Friday you called the week ${vz.look.word ? `<i>${esc(vz.look.word)}</i>` : "by its theme"}${vz.look.theme ? `: ${esc(vz.look.theme)}` : ""}. Now that it's really happened, how did it land against that?` : esc(QUESTIONS[i]);
    return h + `<p class="eyebrow">${i < 0 ? "Looking back" : `${i + 1} of ${QUESTIONS.length}`}</p>${vz.reflect ? `<p class="vreflect">${esc(vz.reflect)}</p>` : ""}<div class="vq"><p>${q}</p></div>
      <label class="sr" for="vzIn">Your answer</label><textarea id="vzIn" class="jnote" rows="3" maxlength="800" placeholder="Take your time…">${esc(vz.draft)}</textarea>
      <div class="actions"><button class="btn primary" data-vz="next" ${vz.busy ? "disabled" : ""}>${vz.busy ? "Listening…" : i === QUESTIONS.length - 1 ? "That's my week" : "Next"}</button><button class="btn alt small" data-vz="menu">Stop here</button></div>`;
  }
  if (vz.step === "writing") return h + `<p class="vreflect">${esc(vz.reflect || "")}</p><p class="muted">Writing your week back to you…</p>`;
  if (vz.step === "summary" && vz.sum) return h + `<div class="vsum">${vz.sum.text.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>
    <p class="muted">Theme: ${esc(vz.sum.theme)} · Your word: <b>${esc(vz.sum.word)}</b></p>
    ${vz.sum.actions.length ? `<p class="eyebrow">Actions you spoke of</p><ul class="rcheck">${vz.sum.actions.map((a, i) => { const on = vz.pick.includes(i); return `<li class="${on ? "on" : ""}" data-vz="pick" data-i="${i}" role="checkbox" aria-checked="${on}" tabindex="0"><span class="rbox${on ? " on" : ""}" aria-hidden="true"></span><span>${esc(a.title)}</span></li>`; }).join("")}</ul>` : `<p class="muted">The week needs nothing more from you today.</p>`}
    ${vz.error ? `<p class="jhint">${esc(vz.error)}</p>` : ""}
    <div class="actions"><button class="btn primary" data-vz="save" ${vz.busy ? "disabled" : ""}>${vz.busy ? "Saving…" : vz.sum.actions.length ? "Save this and set those in motion" : "Save this"}</button><button class="btn alt small" data-vz="menu">Keep it just here</button></div>`;
  if (vz.step === "done") return h + `<div class="vq"><p>${esc(vz.saved || "")}</p></div><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  vz.step = "menu"; return fountainPanel(canAsk);
}
// api: {sample, rerender, coin(), keep(vision)}
export function wireFountain(root, api){
  const ta = root.querySelector("#vzIn"); if (ta) { ta.oninput = () => { vz.draft = ta.value; }; setTimeout(() => ta.focus(), 60); }
  root.querySelectorAll("[data-vz]").forEach(b => { const go = async () => {
    const k = b.dataset.vz;
    if (k === "coin") { api.coin(); return; }
    if (k === "menu") { Object.assign(vz, {step: "menu", answers: [], reflect: "", draft: "", sum: null, error: "", busy: false}); api.rerender(); return; }
    if (k === "start") { Object.assign(vz, {step: "intro", answers: [], reflect: "", look: null, lookA: "", draft: "", sum: null, pick: [], error: "", busy: true}); api.rerender();
      const [plan, look] = await Promise.all([readPlan("month").catch(() => null), lastVision()]); vz.month = plan && plan.theme ? plan.theme : ""; vz.look = look; vz.busy = false; api.rerender(); return; }
    if (k === "begin") { vz.step = vz.look ? "look" : "q0"; vz.reflect = ""; vz.draft = ""; api.rerender(); return; }
    if (k === "pick") { const i = +b.dataset.i; vz.pick = vz.pick.includes(i) ? vz.pick.filter(x => x !== i) : [...vz.pick, i]; api.rerender(); return; }
    if (k === "next") { const ans = plain(vz.draft).trim(); if (!ans) { if (ta) ta.focus(); return; }
      const i = vz.step === "look" ? -1 : +vz.step.slice(1); if (i < 0) vz.lookA = ans; else vz.answers[i] = ans;
      vz.busy = true; api.rerender();
      const q = i < 0 ? "How did last week land against last week's vision?" : QUESTIONS[i];
      let reflect = "";
      try { const r = await api.sample(`You are guiding Mel through her weekly visualisation: warm, expansive, a little cosmic but never saccharine; she's a linguist, so be beautiful and precise. Reflect back her answer in ONE short warm sentence that mirrors her own words (don't paraphrase her into something she didn't say, don't ask a question, no emoji).${i < 0 ? " Honour whatever she says about last week without scoring it as hit or miss." : ""} If something heavy comes up, hold it kindly.\nQuestion: ${q}\nHer answer: ${ans}`, {modelTier: "quick", cache: false}); reflect = plain(String((r && r.text) || "")).trim().slice(0, 300); } catch {}
      vz.reflect = reflect; vz.draft = ""; vz.busy = false;
      if (i < QUESTIONS.length - 1) { vz.step = "q" + (i + 1); api.rerender(); return; }
      vz.step = "writing"; api.rerender();
      try {
        const words = QUESTIONS.map((x, j) => `Q: ${x}\nA: ${vz.answers[j] || ""}`).join("\n\n");
        const d = await api.sample.json(`Write Mel's weekly visualisation back to her: 150 to 250 words, second person, present tense, as if the week is already unfolding this way. Use her exact words and images wherever possible. Loosely: an opening line anchored in her feeling word; the week as she painted it; who she is in it; what she's calling in; a one-line closing anchor. Prose, no headings, no lists, no emoji. Warm and precise, a little cosmic, never saccharine.
Then list only the concrete actions SHE voiced or clearly implied (verb-first, a few words each); never invent tasks. Also a short theme phrase distilling the vision, and her feeling word from the last answer.
${vz.month ? `This month's theme (a gentle frame only): ${vz.month}\n` : ""}Her answers:
${words}
Return JSON only: {"summary": "...", "theme": "...", "word": "...", "actions": [{"title": "...", "why": "one line in her words"}]}`, {modelTier: "default", cache: false});
        vz.sum = {text: plain(String((d && d.summary) || "")).trim(), theme: plain(String((d && d.theme) || "")).slice(0, 80), word: plain(String((d && d.word) || vz.answers[5] || "")).slice(0, 30),
          actions: (Array.isArray(d && d.actions) ? d.actions : []).map(a => ({title: plain(String(a.title || "")).slice(0, 80), why: plain(String(a.why || "")).slice(0, 160)})).filter(a => a.title).slice(0, 6)};
        if (!vz.sum.text) throw 0;
        vz.pick = vz.sum.actions.map((_, j) => j); vz.step = "summary"; api.keep({week: comingMonday(), theme: vz.sum.theme, word: vz.sum.word, text: vz.sum.text, at: Date.now()});
      } catch { vz.step = "q5"; vz.draft = vz.answers[5] || ""; vz.reflect = "The words got caught in the water. Try that last one again?"; }
      api.rerender(); return; }
    if (k === "save") { vz.busy = true; vz.error = ""; api.rerender();
      const m = await mcp(); if (!m) { vz.busy = false; vz.error = "Notion and Sunsama aren't reachable from this view. Your visualisation is kept here."; api.rerender(); return; }
      const mon = comingMonday(), phase = await cyclePhase(), chosen = vz.pick.map(i => vz.sum.actions[i]).filter(Boolean);
      let pushed = 0;
      for (const a of chosen) { if (a.pushed) { pushed++; continue; }   // a retried save never duplicates a task
        try { await m.callTool(SUNSAMA, "create_task", {title: a.title, day: mon, timeEstimate: 20, notes: `From your weekly visualisation (${nice(dayKey())}): ${a.why || vz.sum.theme}`}); a.pushed = true; pushed++; } catch {} }
      const content = `${vz.sum.text}\n\n## Her words\n${QUESTIONS.map((q, j) => `**${q}**\n${vz.answers[j] || ""}`).join("\n\n")}${vz.look && vz.lookA ? `\n\n## Last week's vision, in hindsight\n${vz.lookA}` : ""}${chosen.length ? `\n\n## Actions\n${chosen.map(a => "- " + a.title).join("\n")}` : ""}`;
      try {
        await m.callTool(NOTION, "notion-create-pages", {parent: {type: "data_source_id", data_source_id: VIS_DS}, pages: [{properties: Object.assign({"Week": `Week of ${nice(mon)}`, "date:Date:start": dayKey(), "date:Date:is_datetime": 0, "Theme": vz.sum.theme, "Feeling Word": vz.sum.word, "Actions Pushed to Sunsama": pushed}, phase ? {"Cycle Phase": phase} : {}), content}]});
        vz.saved = `It's saved${pushed ? `, and ${pushed} action${pushed > 1 ? "s are" : " is"} waiting in Sunsama for Monday` : ""}. Your word is ${vz.sum.word}. Hold it close, and close the laptop on the week.`;
        vz.step = "done";
      } catch (e) { vz.error = `Couldn't save to Notion just now${pushed ? ` (${pushed} action${pushed > 1 ? "s" : ""} did reach Sunsama)` : ""}. It's kept here; try again in a minute.`; }
      vz.busy = false; api.rerender(); return; }
  }; b.onclick = go; if (b.getAttribute("role") === "checkbox") b.onkeydown = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); go(); } }; });
}
