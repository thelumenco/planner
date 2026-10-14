// Local stand-in for the claude.ai artifact runtime (window.claude.use), dev builds only.
window.__mapleDevStub = true;   // dev only: lets test scripts jump between scenes
// db: documents in localStorage under "stub:<path>", live onSnapshot. user: id "me". downloads: remembers the last save.
// URL options:
//   ?dblag=ms     delay the first database snapshot (like a slow phone connection)
//   ?seed=1         pin three demo tasks to the quest board (a fresh save only)
//   ?time=15:30     pretend it's this local time (NPC routines, nudges)
//   ?date=2026-11-07  pretend it's this date (festivals, rain, Friday paper); combine with ?time
//   ?reset=1        clear all local game + stub data first
(() => {
  const q = new URLSearchParams(location.search);
  if (q.get("reset")) Object.keys(localStorage).filter(k => k.startsWith("stub:") || k.startsWith("fox.")).forEach(k => localStorage.removeItem(k));
  if (q.get("time") || q.get("date")) {
    const [h, m] = (q.get("time") || "10:00").split(":").map(Number);
    const sg = new Date(Date.now() - new Date().getTimezoneOffset() * 60e3);
    const [Y, Mo, D] = q.get("date") ? q.get("date").split("-").map(Number) : [sg.getUTCFullYear(), sg.getUTCMonth() + 1, sg.getUTCDate()];
    const want = Date.UTC(Y, Mo - 1, D, h, m || 0);
    window.__mapleOffset = want - sg.getTime();
  }
  const listeners = {};
  // the real db hands out frozen snapshots; freeze here too so code that edits one in place fails in tests
  const deepFreeze = o => { if (o && typeof o === "object") { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
  const read = p => { try { return JSON.parse(localStorage.getItem("stub:" + p)); } catch { return null; } };
  const snap = (p, v) => ({ id: p.split("/").pop(), exists: v != null, data: () => v == null ? undefined : deepFreeze(JSON.parse(JSON.stringify(v))), metadata: { fromCache: false, hasPendingWrites: false } });
  const emit = p => (listeners[p] || []).forEach(fn => setTimeout(() => fn(snap(p, read(p))), 0));
  const write = (p, v) => { v == null ? localStorage.removeItem("stub:" + p) : localStorage.setItem("stub:" + p, JSON.stringify(v)); emit(p); };
  const doc = p => ({
    id: p.split("/").pop(), path: p,
    get: async () => snap(p, read(p)),
    set: async v => write(p, v),
    update: async v => write(p, Object.assign(read(p) || {}, v)),
    delete: async () => write(p, null),
    onSnapshot(next) { (listeners[p] = listeners[p] || []).push(next); setTimeout(() => next(snap(p, read(p))), +(q.get("dblag") || 0)); return () => { listeners[p] = listeners[p].filter(f => f !== next); }; },
    collection: c => collection(p + "/" + c)
  });
  const collection = p => ({ path: p, doc: id => doc(p + "/" + (id || Math.random().toString(36).slice(2))) });
  const db = { doc, collection };
  window.devDb = { get: k => read("data/users/me/" + k), set: (k, v) => write("data/users/me/" + k, v) };

  const downloads = { save: async ({ filename, data }) => { window.__download = { filename, size: String(data).length }; return { status: "saved" }; } };
  const caps = { downloads, db, user: { id: async () => "me", isOwner: () => true, canEdit: () => true } };
  window.claude = { use: name => new Promise(r => setTimeout(() => r(caps[name] ?? null), 250)) };

  if (q.get("seed") && !read("data/users/me/fox")) {   // only into a fresh save: later loads keep what the game wrote
    const at = Date.now();
    write("data/users/me/fox", { updatedAt: 1, board: { tasks: [
      { id: "tseed1", title: "Water the houseplants", daily: true, at },
      { id: "tseed2", title: "Book a dentist appointment", daily: false, at },
      { id: "tseed3", title: "Ten minutes of stretching", daily: true, at }
    ] } });
  }
})();
