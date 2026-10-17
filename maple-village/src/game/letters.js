// Letters (round 227), written at the writing desk in your room:
//   Dear future me: sealed until the day you pick, then it arrives in the letterbox at home (and you're told).
//   Dear Universe: a pen pal you never see, who always writes back, warmly. The reply is put together from a bank of
//     kind letters, chosen by what your letter is about (worries, sadness, hopes, thanks, plans, tiredness, love),
//     and arrives a few hours later (3 to 6 hours; a letter that would land in the night waits for the morning post).
// Any letter can be copied into your journal.
// State: F.letters = {items: [{id, kind: "universe"|"future", text, at, deliver?, read?, told?, journaled?,
//   reply?: {text, due, theme, read?, told?}}]}. Saved with the rest of the game.
import { esc, plain, now, dayKey, LOC, hash } from "../util.js";

export const MAX_TEXT = 4000;
const HR = 3600e3, DAY = 864e5;
export function lettersState(F){ const L = F.letters = (F.letters && typeof F.letters === "object") ? F.letters : {};
  L.items = Array.isArray(L.items) ? L.items : []; return L; }
const items = F => lettersState(F).items;
const universe = F => items(F).filter(e => e.kind === "universe");
const future = F => items(F).filter(e => e.kind === "future");
export const letterById = (F, id) => items(F).find(e => e.id === id) || null;
const uid = at => "l" + at.toString(36) + Math.floor(Math.random()*1e4).toString(36);
const addDays = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n*DAY).toISOString().slice(0, 10);
const localDay = ms => new Date(ms + LOC()).toISOString().slice(0, 10);
const localMin = ms => { const d = new Date(ms + LOC()); return d.getUTCHours()*60 + d.getUTCMinutes(); };

/* ---------- the universe's letters ---------- */
// themes, in order of priority when a letter touches on several equally
export const THEMES = {
  worry: /\b(worr\w*|afraid|scared|fear\w*|anxi\w*|nervous|panic\w*|stress\w*|overwhelm\w*|dread\w*|unsure|uncertain)\b/gi,
  sad: /\b(sad\w*|lonely|alone|lonel\w*|cry\w*|cried|tears|grief|griev\w*|miss(ing)?|heartbr\w*|hurt\w*|down|low|lost)\b/gi,
  tired: /\b(tired|exhaust\w*|rest\w*|sleep\w*|burn(t|ed)? ?out|weary|drained|worn|busy)\b/gi,
  thanks: /\b(thank\w*|grateful|gratitude|blessed|lucky|appreciat\w*)\b/gi,
  hope: /\b(hop(e|es|ed|ing)|dream\w*|wish\w*|someday|one day|imagine|long(ing)? for)\b/gi,
  goal: /\b(goals?|plans?|planning|start\w*|begin\w*|new job|project\w*|try(ing)?|learn\w*|change|decid\w*|step)\b/gi,
  love: /\b(love\w*|lov(ing|ed)|heart|friend\w*|family|partner|kind(ness)?)\b/gi
};
export const REPLIES = {
  worry: [
    "I read every word, and I want you to know this first: you are in the right place, at the right time. The things that feel tangled right now are being gently untangled, even while you sleep.",
    "Worry is only love that doesn't know where to go yet. Let me hold some of it for a while. You don't have to carry it all up the hill on your own.",
    "I see how hard you are trying to keep everything safe. Here's a secret: you are safer than you feel. Doors you can't see yet are already opening.",
    "When the fear gets loud, put your hand on your heart and take one slow breath. That steady beat has carried you through every hard day so far, and it isn't stopping now.",
    "You don't need to know how it all turns out to take the next small step. Just the next one. I'll light the path a little at a time, the way I always have.",
    "Some of what you're afraid of will never happen, and the rest you'll meet when you're ready, with more courage than you think you have.",
    "I'm clearing the way ahead of you, even when it doesn't look like it. The detours are part of the route. Nothing is wasted.",
    "Be gentle with the part of you that's frightened. It's only trying to look after you. Tell it, kindly, that you've got this, and that I've got you."],
  sad: [
    "Oh, my dear. I'm so glad you wrote. Sadness is heavy, and you don't have to pretend it isn't. Let it be here for a while; it won't stay forever.",
    "You are not as alone as you feel. I'm here, reading every line, and I'm holding you close in the quiet way only the Universe can.",
    "Tears are not a sign that something is wrong with you. They're a sign of how deeply you care. That tenderness is one of the loveliest things about you.",
    "On the low days, just do the small kind things: a warm drink, a window open, a little walk. You don't need to fix anything today. You only need to be gentle.",
    "Every season turns. I promise you, there are bright mornings ahead with your name on them, and people and moments you haven't even met yet.",
    "What you're missing matters, because it mattered to you. Keep the good of it close; it's yours to keep, always.",
    "I see you, even on the days you feel invisible. Especially on those days.",
    "If your heart feels bruised, let it rest. Healing is quiet work, and it's already happening, a little more each day."],
  hope: [
    "What a beautiful thing to dream about. I've written it down, and I'm smiling. Hold on to it: wishes like yours have a way of finding their way home.",
    "Anything is possible. I know that sounds too big, but I've seen it again and again. Keep your dream somewhere you can see it every morning.",
    "Your hopes are not silly, and they're not too much. They're a map. Follow the little nudges; they'll lead you further than you imagine.",
    "I love that you still dream. It tells me your heart is wide open. Good things are always looking for open hearts.",
    "Start acting as if it's already on its way, because it is. Make a little room for it in your life, and watch what turns up.",
    "Some wishes come quickly and some take the long way round, but none of them are ever lost. I'm keeping yours safe.",
    "Imagine it in as much detail as you can: the light, the sounds, how you'll feel. I'm listening to every bit.",
    "The future is kinder than you fear and bigger than you think. Keep hoping. It suits you."],
  thanks: [
    "Thank you for thanking me! A grateful heart is like a magnet. Watch how much more good comes your way now.",
    "I loved reading this. Noticing the good is one of the bravest, brightest things a person can do, and you do it so well.",
    "Your gratitude made my whole day, and I am a very big place with a lot of days.",
    "Keep collecting these moments like pebbles in your pocket. On harder days, you can take them out and feel how much you've been given.",
    "You deserve every good thing you wrote about, and plenty more besides. I'm only getting started.",
    "What a lovely letter. It's full of light. I hope you read it back one day and remember how rich your life already is.",
    "Being thankful doesn't mean everything is perfect. It means you can see the good anyway. That's a gift, and it's yours.",
    "I'm so pleased these things made you happy. Some of them, between you and me, I arranged on purpose."],
  goal: [
    "I love a plan! Begin small, and begin today. The first step doesn't have to be good. It only has to be taken.",
    "You are more ready than you feel. Nobody feels completely ready. The ones who do it simply start anyway, and so can you.",
    "Write down the very next step, the tiniest one, and do just that. Then the next. That's how mountains get climbed: one ordinary step at a time.",
    "I'll be opening doors as you go. Keep your eyes open for help in unexpected places; it's often me in disguise.",
    "Some days you'll race ahead and some days you'll barely move. Both count. Keep going, kindly.",
    "Your plan has my full support. Celebrate every little bit of progress, even the bits nobody else would notice.",
    "If it changes shape along the way, let it. The best plans grow as you do.",
    "Trust yourself. You've figured out hard things before, and you'll figure this out too."],
  tired: [
    "It sounds as if you've been carrying a lot. Please rest. Rest isn't giving up; it's how you get your strength back.",
    "You don't have to earn a break. Lie down, close your eyes, and let the world turn on its own for a while. It will.",
    "Tired is your body's way of asking to be looked after. Say yes to it: an early night, a slow morning, a cup of something warm.",
    "There will always be more to do, but there is only one you. Looking after yourself is the most important job on the list.",
    "Let today be a soft day. Do the one thing that matters most, and let the rest wait until tomorrow.",
    "Even the sea rests between tides. You're allowed to be still.",
    "I'll keep watch while you sleep. Things have a way of looking brighter after a proper rest.",
    "You've done enough for today. Truly. Go gently."],
  love: [
    "Your letter was so full of love that it practically glowed in the post bag. Love like yours makes the whole world warmer.",
    "The way you care about people is one of your loveliest qualities. Don't forget to turn a little of that love towards yourself, too.",
    "Love is never wasted, not a single drop of it. Everything you give comes back to you, often from somewhere unexpected.",
    "I'm so happy you have people who matter this much to you. Hold them close, and let them hold you back.",
    "You are loved more than you know, by more people than you know, and by me, always.",
    "Keep your heart open. It's braver than it looks, and it knows the way.",
    "Small kindnesses are how love talks. Keep saying it in all the little ways you do.",
    "Thank you for sharing your heart with me. It's a very good one."],
  general: [
    "Thank you for your letter. I read it slowly, twice, and I want you to know I'm always listening, even when the world is noisy.",
    "Everything is working out for you, in ways you can't always see yet. I'm busy behind the scenes, I promise.",
    "You are exactly where you need to be. Keep being you. It's working.",
    "I love hearing from you. Write whenever you like: about big things, little things, or nothing much at all.",
    "Whatever today brings, remember that you're doing better than you think, and that I'm on your side.",
    "There's a small good thing waiting for you this week. Keep an eye out for it, and smile when you spot it.",
    "Life is long and full of surprises, and so many of them are lovely. More are on their way to you.",
    "Be kind to yourself today. You deserve the same warmth you give everyone else."]
};
const OPENINGS = ["Your letter arrived and made the stars twinkle a little brighter.", "I was so happy to find your letter waiting for me.",
  "What a joy to hear from you again.", "I've just finished reading your letter, and I'm smiling.", "Thank you for writing to me. I always love your letters."];
const CLOSINGS = ["Anything is possible. Never forget that.", "Things are always working out for you.", "Write again soon. I'll be here.",
  "Sending you all the light I have.", "Go gently, and know you are loved."];
// the theme a letter is mostly about (most keyword hits, worries and sadness counting double; the order above settles a tie)
export function themeOf(text){
  let best = "general", n = 0;
  for (const [k, re] of Object.entries(THEMES)) { const m = (String(text || "").match(re) || []).length*(k === "worry" || k === "sad" ? 2 : 1); if (m > n) { best = k; n = m; } }
  return best;
}
// a short phrase from the letter to quote back (its first sentence, if it's short and not just "Dear Universe")
export function quoteOf(text){
  const body = String(text || "").replace(/^\s*dear\s+universe[,.!:]?\s*/i, "").trim();
  const first = (body.split(/(?<=[.!?])\s+|\n+/)[0] || "").trim().replace(/[.!?,;:]+$/, "");
  const w = first.split(/\s+/).filter(Boolean).length;
  return w >= 3 && w <= 14 && first.length <= 90 ? first : "";
}
const pickOf = (list, seed) => list[seed % list.length];
// the universe's reply to a letter. `name`: the player's name; `last`: the body used last time (to avoid a repeat)
export function writeReply(text, name = "friend", seed = hash(text), last = ""){
  const theme = themeOf(text), bank = REPLIES[theme];
  let body = pickOf(bank, seed); if (body === last) body = pickOf(bank, seed + 1);
  const extra = pickOf(REPLIES[theme === "general" ? "love" : "general"], seed >> 3), q = quoteOf(text);
  const quote = q ? `You wrote, "${q}." I've been thinking about that, and I want you to hear this from me.` : "";
  const parts = [`Dear ${name || "friend"},`, `${pickOf(OPENINGS, seed >> 2)}${quote ? " " + quote : ""}`, body, extra, pickOf(CLOSINGS, seed >> 4), "Always,\nthe Universe"];
  return {text: parts.join("\n\n"), theme, body};
}
// when the reply arrives: 3 to 6 hours after posting; one that would land between 10pm and 7am waits for the morning post
export function replyDue(at, r = Math.random()){
  let due = at + (3 + 3*r)*HR; const m = localMin(due);
  if (m >= 22*60 || m < 7*60) { const day = m >= 22*60 ? addDays(localDay(due), 1) : localDay(due); due = Date.parse(day + "T07:30:00Z") - LOC(); }
  return due;
}

/* ---------- writing and receiving ---------- */
export function postUniverse(F, text, name, at = now(), r = Math.random()){
  text = plain(String(text || "")).trim().slice(0, MAX_TEXT); if (!text) return null;
  const prev = universe(F).filter(e => e.reply).slice(-1)[0];
  const e = {id: uid(at), kind: "universe", text, at};
  const rep = writeReply(text, name, hash(text + at), prev && prev.reply ? prev.reply.body : "");
  e.reply = {text: rep.text, theme: rep.theme, body: rep.body, due: replyDue(at, r)};
  items(F).push(e); return e;
}
export function sealFuture(F, text, deliver, at = now()){
  text = plain(String(text || "")).trim().slice(0, MAX_TEXT); if (!text) return null;
  const min = addDays(localDay(at), 1), d = /^\d{4}-\d{2}-\d{2}$/.test(String(deliver || "")) && deliver >= min ? deliver : min;
  const e = {id: uid(at), kind: "future", text, at, deliver: d}; items(F).push(e); return e;
}
const replyIn = (e, t) => !!(e.reply && e.reply.due <= t);
const opened = (e, day) => e.deliver <= day;
// letters in the letterbox that haven't been read: universe replies past their time, future letters on or after their day
export const arrived = (F, t = now(), day = dayKey()) => [...universe(F).filter(e => replyIn(e, t) && !e.reply.read), ...future(F).filter(e => opened(e, day) && !e.read)];
// mark newly arrived letters as announced; returns them
export function announce(F, t = now(), day = dayKey()){
  const out = arrived(F, t, day).filter(e => !(e.kind === "universe" ? e.reply.told : e.told));
  out.forEach(e => { if (e.kind === "universe") e.reply.told = true; else e.told = true; }); return out;
}
export function markRead(F, id, t = now(), day = dayKey()){
  const e = letterById(F, id); if (!e) return false;
  if (e.kind === "universe" && replyIn(e, t) && !e.reply.read) { e.reply.read = true; e.reply.told = true; return true; }
  if (e.kind === "future" && opened(e, day) && !e.read) { e.read = true; e.told = true; return true; }
  return false;
}
const shortWhen = ms => new Date(ms).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});
const longDate = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"});
export { longDate };
// the text a letter goes into the journal as
export function journalText(e, t = now()){
  if (e.kind === "universe") return `Dear Universe,\n\n${e.text.replace(/^\s*dear\s+universe[,.!:]?\s*/i, "")}${replyIn(e, t) ? `\n\nThe Universe wrote back:\n\n${e.reply.text}` : ""}`;
  return `A letter to future me (written ${shortWhen(e.at)})\n\n${e.text}`;
}

/* ---------- the letters panel ---------- */
export const freshView = (mode = "home") => ({mode, id: null, draft: "", date: ""});
const inMonths = (n, day) => { const d = new Date(day + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); };
const para = t => esc(t).split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
const firstLine = t => esc(String(t).replace(/^\s*dear\s+(universe|future me)[,.!:]?\s*/i, "").split("\n").find(Boolean) || "").slice(0, 60) || "A letter";
export function lettersPanel(F, lv, opts = {}){
  const t = opts.now || now(), day = opts.day || dayKey(), canJournal = opts.journal !== false;
  let h = `<span class="tape sky" aria-hidden="true"></span>`;
  if (lv.mode === "universe") return h + `<h2>Dear Universe,</h2><p class="sub">Write whatever's on your heart. The Universe always writes back, usually within a few hours.</p>
    <label class="sr" for="ltText">Your letter</label><textarea id="ltText" class="jnote lpaper" rows="8" maxlength="${MAX_TEXT}" placeholder="Dear Universe,">${esc(lv.draft)}</textarea>
    <div class="actions"><button class="btn primary" data-lt="senduni">Post it</button><button class="btn alt small" data-lt="home">Back</button></div>`;
  if (lv.mode === "future") return h + `<h2>Dear future me,</h2><p class="sub">Sealed until the day you choose, then it comes to your letterbox at home.</p>
    <label class="sr" for="ltText">Your letter</label><textarea id="ltText" class="jnote lpaper" rows="8" maxlength="${MAX_TEXT}" placeholder="Dear future me,">${esc(lv.draft)}</textarea>
    <div class="row ldate"><label for="ltDate">Deliver on</label><input id="ltDate" type="date" min="${addDays(day, 1)}" value="${esc(lv.date || inMonths(3, day))}"></div>
    <div class="actions"><button class="btn primary" data-lt="sendfut">Seal it</button><button class="btn alt small" data-lt="home">Back</button></div>`;
  const jb = e => canJournal ? `<button class="btn alt small" data-lt="journal" data-id="${esc(e.id)}" ${e.journaled ? "disabled" : ""}>${e.journaled ? "In your journal" : "Copy into my journal"}</button>` : "";
  if (lv.mode === "read") {
    const e = letterById(F, lv.id); if (!e) { lv.mode = "home"; return lettersPanel(F, lv, opts); }
    if (e.kind === "universe") { const r = replyIn(e, t) ? e.reply : null;
      return h + `<h2>Your letter, ${esc(shortWhen(e.at))}</h2><div class="lletter mine">${para(e.text)}</div>
        ${r ? `<p class="eyebrow">The Universe wrote back</p><div class="lletter uni">${para(r.text)}</div>` : `<p class="muted">On its way. The Universe takes its time, but it always writes back.</p>`}
        <div class="actions">${r ? `<button class="btn primary small" data-lt="universe">Write back</button>` : ""}${jb(e)}<button class="btn alt small" data-lt="home">Back</button></div>`; }
    const open = opened(e, day);
    return h + `<h2>${open ? `From you, ${esc(shortWhen(e.at))}` : "A sealed letter"}</h2>${open ? `<div class="lletter mine">${para(e.text)}</div>` : `<p class="muted">Sealed until ${esc(longDate(e.deliver))}. No peeking.</p>`}
      <div class="actions">${open ? jb(e) : ""}<button class="btn alt small" data-lt="home">Back</button></div>`;
  }
  const u = universe(F), f = future(F), news = arrived(F, t, day);
  h += `<h2>Letters</h2><p class="sub">Write to the Universe, or to the you of later on.</p>
    <div class="vmenu"><button class="btn primary" data-lt="universe">Dear Universe...</button><button class="btn alt" data-lt="future">Dear future me...</button></div>`;
  if (news.length) h += `<p class="eyebrow" style="margin-top:14px">Arrived</p><ul class="hlist lt lnew">${news.map(e => `<li data-lt="open" data-id="${esc(e.id)}" role="button" tabindex="0"><span><b>${e.kind === "universe" ? "A letter from the Universe" : "A letter from your past self"}</b><small>${e.kind === "universe" ? "in reply to yours of " + esc(shortWhen(e.at)) : "written " + esc(shortWhen(e.at))}</small></span><span class="hbadge now">new</span></li>`).join("")}</ul>`;
  if (u.length) h += `<p class="eyebrow" style="margin-top:14px">Pen pals with the Universe</p><ul class="hlist lt">${u.slice().reverse().slice(0, 12).map(e => `<li data-lt="open" data-id="${esc(e.id)}" role="button" tabindex="0"><span><b>${firstLine(e.text)}</b><small>${esc(shortWhen(e.at))}, ${replyIn(e, t) ? "answered" : "reply on its way"}</small></span></li>`).join("")}</ul>`;
  if (f.length) h += `<p class="eyebrow" style="margin-top:14px">To future me</p><ul class="hlist lt">${f.slice().reverse().map(e => `<li data-lt="open" data-id="${esc(e.id)}" role="button" tabindex="0"><span><b>${opened(e, day) ? firstLine(e.text) : "Sealed"}</b><small>written ${esc(shortWhen(e.at))}, ${opened(e, day) ? "arrived " : "arrives "}${esc(longDate(e.deliver))}</small></span></li>`).join("")}</ul>`;
  return h;
}
// api: {rerender, save, toJournal(text) -> bool, sent(kind, letter), name}
export function wireLetters(root, F, lv, api){
  const ta = root.querySelector("#ltText"), dt = root.querySelector("#ltDate");
  if (ta) { ta.oninput = () => { lv.draft = ta.value; }; if (!lv.draft) setTimeout(() => ta.focus(), 60); }
  if (dt) dt.onchange = () => { lv.date = dt.value; };
  const blur = () => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); };
  root.querySelectorAll("[data-lt]").forEach(b => { const go = () => {
    const k = b.dataset.lt, id = b.dataset.id;
    if (k === "home") lv.mode = "home";
    else if (k === "universe" || k === "future") { lv.mode = k; lv.draft = ""; }
    else if (k === "open") { lv.mode = "read"; lv.id = id; if (markRead(F, id)) return api.save(); }
    else if (k === "senduni") { const e = postUniverse(F, ta ? ta.value : lv.draft, api.name()); if (!e) { if (ta) ta.focus(); return; }
      blur(); lv.draft = ""; lv.mode = "home"; api.sent("universe", e); return api.save(); }
    else if (k === "sendfut") { const e = sealFuture(F, ta ? ta.value : lv.draft, dt && dt.value); if (!e) { if (ta) ta.focus(); return; }
      blur(); lv.draft = ""; lv.date = ""; lv.mode = "home"; api.sent("future", e); return api.save(); }
    else if (k === "journal") { const e = letterById(F, id); if (!e || e.journaled) return; if (api.toJournal(journalText(e))) { e.journaled = true; return api.save(); } }
    api.rerender(); };
    b.onclick = go; if (b.getAttribute("role") === "button") b.onkeydown = ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); } };
  });
}
