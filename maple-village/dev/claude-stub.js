// Local stand-in for the claude.ai artifact runtime (window.claude.use), dev builds only.
// db: documents in localStorage under "stub:<path>", live onSnapshot. user: id "me". sample: canned replies.
// URL options:
//   ?seed=1         write a demo plan, mail and stats for today
//   ?time=15:30     pretend it's this time in Singapore (NPC routines, nudges)
//   ?nosample=1     behave as if the sample capability isn't granted
//   ?reset=1        clear all local game + stub data first
(() => {
  const q = new URLSearchParams(location.search);
  if (q.get("reset")) Object.keys(localStorage).filter(k => k.startsWith("stub:") || k.startsWith("fox.")).forEach(k => localStorage.removeItem(k));
  if (q.get("time")) {
    const [h, m] = q.get("time").split(":").map(Number);
    const sg = new Date(Date.now() + 8 * 3600e3);
    const want = Date.UTC(sg.getUTCFullYear(), sg.getUTCMonth(), sg.getUTCDate(), h, m || 0);
    window.__mapleOffset = want - sg.getTime();
  }
  const listeners = {};
  const read = p => { try { return JSON.parse(localStorage.getItem("stub:" + p)); } catch { return null; } };
  const snap = (p, v) => ({ id: p.split("/").pop(), exists: v != null, data: () => v == null ? undefined : JSON.parse(JSON.stringify(v)), metadata: { fromCache: false, hasPendingWrites: false } });
  const emit = p => (listeners[p] || []).forEach(fn => setTimeout(() => fn(snap(p, read(p))), 0));
  const write = (p, v) => { v == null ? localStorage.removeItem("stub:" + p) : localStorage.setItem("stub:" + p, JSON.stringify(v)); emit(p); };
  const doc = p => ({
    id: p.split("/").pop(), path: p,
    get: async () => snap(p, read(p)),
    set: async v => write(p, v),
    update: async v => write(p, Object.assign(read(p) || {}, v)),
    delete: async () => write(p, null),
    onSnapshot(next) { (listeners[p] = listeners[p] || []).push(next); setTimeout(() => next(snap(p, read(p))), 0); return () => { listeners[p] = listeners[p].filter(f => f !== next); }; },
    collection: c => collection(p + "/" + c)
  });
  const collection = p => ({ path: p, doc: id => doc(p + "/" + (id || Math.random().toString(36).slice(2))) });
  const db = { doc, collection };
  window.devDb = { get: k => read("data/users/me/" + k), set: (k, v) => write("data/users/me/" + k, v) };

  const sample = async (input, opts = {}) => {
    const reply = "I'm the dev stub, so no real Claude here. In the published page this answers properly. Try: open the doc, write one rough sentence, then tell me how it went.";
    let text = "";
    for (const w of reply.split(" ")) { await new Promise(r => setTimeout(r, 40)); text += (text ? " " : "") + w; opts.onText && opts.onText({ text, delta: w }); }
    return { text, truncated: false, modelTierApplied: opts.modelTier || "default" };
  };
  sample.json = async () => ({});
  sample.limits = async () => ({ maxPromptBytes: 100000 });

  const caps = { db, user: { id: async () => "me", isOwner: () => true, canEdit: () => true }, sample: q.get("nosample") ? null : sample };
  window.claude = { use: name => new Promise(r => setTimeout(() => r(caps[name] ?? null), 250)) };

  if (q.get("seed")) {
    const sg = new Date(Date.now() + 6 * 3600e3 + (window.__mapleOffset || 0)).toISOString().slice(0, 10);
    write("data/users/me/plan", { day: sg, tasks: [
      { id: "t1", title: "Fix Chord onboarding flow", firstStep: "Open the onboarding screen in the browser", minutes: 25, pep: "This is the bit new creatives see first. Make it lovely.", place: "chord", spot: "bench",
        notes: "From Sunsama:\n- Step 2 skips the brand colour picker on mobile\n- Copy on the welcome screen still says 'studio' instead of 'workspace'\n- Check it on a 375px screen\nLinked doc: https://example.com/onboarding-spec" },
      { id: "t2", title: "Reply to Farzana about the MUSE audit", firstStep: "Open her email", minutes: 15, place: "post", spot: "counter",
        email: { who: "Farzana", subject: "MUSE audit next steps", draft: "Hi Farzana, lovely to hear from you! Here's what happens next…", link: "https://mail.google.com/mail/u/0/#inbox" },
        notes: "She asked when the audit report lands and whether the call can move to Thursday." },
      { id: "t3", title: "Review the Chico beta feedback doc", firstStep: "Open the feedback doc", minutes: 25, treadmill: true, place: "chico", spot: "sofa", notes: "Read-only skim. Star the three loudest themes." },
      { id: "t4", title: "Call with Ambidextrous accountant", minutes: 30, meeting: true, at: "3:00 pm", place: "hall", spot: "phone" },
      { id: "t5", title: "Send October invoices", firstStep: "Open Stripe invoices", minutes: 20, place: "post", spot: "scales" }
    ] });
    write("data/users/me/mail", { items: [
      { id: "m1", from: "crier", title: "A charging-week Monday, one call at three", at: Date.now() - 3600e3,
        body: "Good morning, Mel. Five quests on the board, one meeting, and the week's theme is Chico charging.",
        sections: [
          { heading: "Today", lines: ["3:00 pm Call with the accountant (Zoom)", "5:30 pm Evan pickup"] },
          { heading: "The one that matters", lines: ["Fix the Chord onboarding flow: new creatives see it first"] },
          { heading: "Inbox", lines: ["2 possible leads (one MUSE, one website copy)", "Farzana is waiting on a reply"] },
          { heading: "This week", lines: ["Theme: Chico charging", "Revenue action: send 3 MUSE follow-ups"] },
          { heading: "Little things", lines: ["Water bottle by the desk", "Treadmill-able: the Chico feedback review"] }
        ] },
      { id: "m2", from: "postie", title: "Inbox triage", body: "2 new leads, 1 draft waiting for your OK (Farzana).\nNothing urgent from clients.", link: "https://mail.google.com/mail/u/0/#inbox", at: Date.now() - 600e3 }
    ] });
    write("data/users/me/library", { items: [
      { id: "d1", title: "Show Your Work!", author: "Austin Kleon", added: 1, body: "- Share something small every day\n- Think process, not product\n- Teach what you know\n- Be open, but don't turn into human spam", try: "Post one behind-the-scenes photo of today's work." },
      { id: "d2", title: "Company of One", author: "Paul Jarvis", added: 2, body: "- Question growth by default\n- Stay small and resilient\n- Build systems before hiring", try: "List one thing to stop doing this month." }
    ] });
    write("data/users/me/stats", { chord: { users: 142, at: Date.now() }, chico: { users: 58, at: Date.now() } });
  }
})();
