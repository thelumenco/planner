// Shared helpers: time (Singapore), DOM, maths.
export const H = 3600e3, M = 60e3, W = 520, HH = 640;
// Wall clock for day/time-of-day logic. The dev stub can shift it (?time=15:30); timers always use real Date.now().
export const now = () => Date.now() + (globalThis.__mapleOffset || 0);
export const dayKey = () => new Date(now() + 6*H).toISOString().slice(0,10); // Singapore time, resets 2am
export const sgHM = () => { const d = new Date(now() + 8*H); return d.getUTCHours()*60 + d.getUTCMinutes(); };
export const prevDay = k => new Date(Date.parse(k+"T00:00:00Z") - 864e5).toISOString().slice(0,10);
export const $ = id => document.getElementById(id);
export const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export const pick = a => a[Math.floor(Math.random()*a.length)];
export const rnd = (a, b) => a + Math.random()*(b - a);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const hash = s => { let h = 0; for (const c of String(s)) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
export const dur = ms => { const m = Math.ceil(ms/M); return m >= 60 ? `${Math.floor(m/60)}h ${m%60 ? (m%60) + "m" : ""}`.trim() : `${m}m`; };
export const ink = 'style="stroke:var(--line)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';
// Game copy is drawn, not emoji'd: strip pictographs from anything the game says (user data is left alone).
export const plain = s => String(s ?? "").replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D]/gu, "").replace(/ {2,}/g, " ").replace(/ ([!?.,])/g, "$1").trim();
