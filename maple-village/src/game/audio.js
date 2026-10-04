// Sound: an original, calm piano loop (soft, nostalgic, in the spirit of Studio Ghibli scores, but composed here)
// plus small sound effects. Everything is synthesised with Web Audio, so there are no audio files to load.
// Browsers only allow sound after a tap, so nothing plays until the first interaction.
// Settings (music on/off + volume, effects on/off) are per device, in localStorage.

let ac = null, master = null, musicBus = null, sfxBus = null, reverb = null, pianoWave = null;
const KEY = "fox.sound";
export const settings = (() => { try { return Object.assign({music: true, musicVol: .5, sfx: true}, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { return {music: true, musicVol: .5, sfx: true}; } })();
const saveSettings = () => { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch {} };

function ensure(){
  if (ac) return ac;
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  master = ac.createGain(); master.gain.value = .9; master.connect(ac.destination);
  // a small hall: generated stereo impulse, decaying noise
  reverb = ac.createConvolver();
  const len = Math.floor(ac.sampleRate*2.6), ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random()*2 - 1)*Math.pow(1 - i/len, 2.6); }
  reverb.buffer = ir;
  const wet = ac.createGain(); wet.gain.value = .32; reverb.connect(wet).connect(master);
  musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(master); musicBus.connect(reverb);
  sfxBus = ac.createGain(); sfxBus.gain.value = .8; sfxBus.connect(master); sfxBus.connect(reverb);
  // piano-ish tone: fundamental + a few soft harmonics
  pianoWave = ac.createPeriodicWave(new Float32Array([0, 1, .42, .18, .09, .05, .02]), new Float32Array(7));
  return ac;
}
// iPhone/iPad: audio may only start inside a tap's touchend/click (not pointerdown), plays through the silent switch
// only when the audio session is "playback", and wants one sound started inside that gesture.
export function unlockAudio(){
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch {}
  if (!ensure()) return;
  try { const b = ac.createBuffer(1, 1, 22050), src = ac.createBufferSource(); src.buffer = b; src.connect(ac.destination); src.start(0); } catch {}
  const go = () => { if (settings.music) startMusic(); };
  if (ac.state !== "running") ac.resume().then(go, () => {}); else go();
}
export const audioRunning = () => !!ac && ac.state === "running";
// keep trying on every real gesture until the context is running
const GESTURES = ["touchend", "click", "keydown", "pointerup"];
function onGesture(){ unlockAudio(); if (audioRunning()) GESTURES.forEach(t => document.removeEventListener(t, onGesture, true)); }
GESTURES.forEach(t => document.addEventListener(t, onGesture, true));

/* ---------- music ---------- */
const N = n => 440*Math.pow(2, (n - 69)/12);               // MIDI note -> Hz
// The records on Mel's record player: each is a little piece composed here, played live. bars: [bass, chord tones...]
// steps = eighth notes per bar (6 for the waltz), arp = which chord tone each eighth plays, tone = the instrument.
export const TRACKS = {
  piano: {name: "Morning piano", mood: "Soft and hopeful", bpm: 64, steps: 8, tone: "piano", col: "var(--butter)",
    bars: [[41, 60, 64, 65, 69, 72], [40, 59, 62, 64, 67, 71], [38, 57, 60, 62, 64, 65], [40, 55, 59, 60, 64, 67], [34, 57, 58, 62, 65, 69], [33, 55, 57, 60, 64, 67], [31, 53, 55, 58, 62, 65], [36, 53, 55, 58, 60, 65]],
    arp: [1, 2, 3, 4, 3, 2, 1, 2], arpVel: .055, mel: .75},
  rainy: {name: "Rainy window", mood: "Slow, a little wistful", bpm: 54, steps: 8, tone: "rhodes", col: "var(--sky)",
    bars: [[38, 57, 60, 64, 65, 69], [34, 57, 62, 65, 69, 72], [31, 58, 62, 65, 67, 70], [33, 55, 61, 64, 67, 69]],
    arp: [1, 3, 2, 4, 1, 3, 2, 5], arpVel: .045, mel: .5},
  musicbox: {name: "Music box", mood: "Tinkly, a gentle waltz", bpm: 88, steps: 6, tone: "bell", col: "var(--blush)",
    bars: [[48, 64, 67, 72, 76, 79], [45, 64, 69, 72, 76, 81], [41, 65, 69, 72, 77, 81], [43, 62, 67, 71, 74, 79]],
    arp: [1, 3, 5, 3, 4, 2], arpVel: .05, mel: .6, up: 12},
  stroll: {name: "Sunday stroll", mood: "Bright and bouncy", bpm: 84, steps: 8, tone: "piano", col: "var(--sage)",
    bars: [[43, 59, 62, 67, 71, 74], [40, 59, 64, 67, 71, 76], [36, 60, 64, 67, 72, 76], [38, 57, 62, 66, 69, 74]],
    arp: [1, 3, 2, 3, 4, 3, 2, 3], arpVel: .06, mel: .85, bounce: true},
  night: {name: "Night lights", mood: "A hushed lullaby", bpm: 50, steps: 8, tone: "bell", col: "var(--peri)",
    bars: [[44, 60, 63, 68, 72, 75], [41, 60, 65, 68, 72, 77], [37, 61, 65, 68, 73, 77], [39, 58, 63, 67, 70, 75]],
    arp: [1, 2, 3, 4, 5, 4, 3, 2], arpVel: .035, mel: .4},
  rain: {name: "Rain on the roof", mood: "Just rain, no music", rain: true, col: "#9CB4C9"}
};
const cur = () => TRACKS[settings.track] || TRACKS.piano;
let BEAT = 60/64, BARS = TRACKS.piano.bars;
let playing = false, nextTime = 0, step = 0, timerId = 0, loops = 0, melody = [], rainSrc = null, bellWave = null, rhodesWave = null;

function note(freq, t, dur, vel){
  const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), tone = cur().tone;
  if (!bellWave) { bellWave = ac.createPeriodicWave(new Float32Array([0, 1, 0, .35, 0, .12, 0, .05]), new Float32Array(8)); rhodesWave = ac.createPeriodicWave(new Float32Array([0, 1, .25, .12, .02]), new Float32Array(5)); }
  o.setPeriodicWave(tone === "bell" ? bellWave : tone === "rhodes" ? rhodesWave : pianoWave); o.frequency.value = freq;
  f.type = "lowpass"; f.frequency.value = Math.min(4200, 900 + freq*2.2);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + .006);
  g.gain.exponentialRampToValueAtTime(vel*.35, t + .25); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(f).connect(g).connect(musicBus); o.start(t); o.stop(t + dur + .05);
}
function newMelody(){
  // a gentle top line: mostly chord tones on beats 1 and 3, with the odd passing note; varies each pass
  melody = BARS.map((b, i) => { const top = b.slice(2).map(n => n + 12); const r = (k) => top[(i*3 + k + loops) % top.length];
    return Math.random() < .25 ? [] : [[0, r(0)], [2, r(1 + (Math.random() < .5 ? 0 : 1))], ...(Math.random() < .4 ? [[3.5, r(2)]] : [])]; });
}
function schedule(){
  const T = cur(), S8 = T.steps || 8, up = T.up || 0;
  while (nextTime < ac.currentTime + .6) {
    const bar = Math.floor(step/S8) % BARS.length, e = step % S8, t = nextTime, b = BARS[bar];
    if (bar === 0 && e === 0) { if (step) loops++; newMelody(); if (Math.random() > T.mel) melody = melody.map(() => []); }
    if (e === 0) { note(N(b[0]), t, 3.4, .16); note(N(b[0] + 12), t, 3, .08); }       // bass + octave
    if (S8 === 8 && e === 4) note(N(b[0] + 7), t, 2.4, .09);                            // fifth on beat 3
    if (T.bounce && (e === 2 || e === 6)) note(N(b[0] + 12), t, .6, .07);              // a skip in the step
    if (S8 === 6 && (e === 2 || e === 4)) note(N(b[1]), t, 1.2, .05);                  // waltz: oom-pah-pah
    const arp = (T.arp || [1, 2, 3, 4, 3, 2, 1, 2])[e];
    note(N(b[Math.min(arp, b.length - 1)] + up), t + (Math.random() - .5)*.012, 2.2, (T.arpVel || .055) + Math.random()*.02);
    (melody[bar] || []).forEach(([beat, n]) => { if (Math.abs(beat*2 - e) < .01) note(N(n + up), t + .01, 2.8, .1); });
    step++; nextTime += BEAT/2;
  }
}
// "Rain on the roof": looping filtered noise with the odd drip
function startRain(){
  const len = ac.sampleRate*3, buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); let last = 0; for (let i = 0; i < len; i++) { last = (last + .04*(Math.random()*2 - 1))/1.04; d[i] = last*3.2 + (Math.random() < .0004 ? (Math.random() - .5)*.8 : 0); } }
  const src = ac.createBufferSource(), f = ac.createBiquadFilter(); src.buffer = buf; src.loop = true; f.type = "lowpass"; f.frequency.value = 1400;
  src.connect(f).connect(musicBus); src.start(); rainSrc = src;
  timerId = setInterval(() => { if (Math.random() < .35) note(N(84 + Math.floor(Math.random()*8)), ac.currentTime + Math.random()*.5, .5, .015); }, 700);
}
export function startMusic(){
  if (!ensure() || playing || !settings.music) return;
  const T = cur(); BEAT = 60/(T.bpm || 64); BARS = T.bars || TRACKS.piano.bars;
  playing = true; nextTime = ac.currentTime + .15; step = 0; loops = 0;
  musicBus.gain.cancelScheduledValues(ac.currentTime);
  musicBus.gain.setTargetAtTime(settings.musicVol*(T.rain ? .9 : .5), ac.currentTime, 1.2);
  if (T.rain) { startRain(); return; }
  timerId = setInterval(schedule, 120); schedule();
}
export function stopMusic(){
  if (!ac || !playing) return;
  playing = false; clearInterval(timerId);
  if (rainSrc) { const r = rainSrc; rainSrc = null; setTimeout(() => { try { r.stop(); } catch {} }, 900); }
  musicBus.gain.setTargetAtTime(0, ac.currentTime, .4);
}
// Put a different record on (starts playing it, turning music on if it was off)
export function setTrack(id){
  if (!TRACKS[id]) return; const was = playing; settings.track = id; settings.music = true; saveSettings();
  if (was) { stopMusic(); setTimeout(() => startMusic(), 450); } else unlockAudio();
}
export const currentTrack = () => settings.track && TRACKS[settings.track] ? settings.track : "piano";
export function setMusic(on){ settings.music = on; saveSettings(); on ? unlockAudio() : stopMusic(); }
export function setMusicVol(v){ settings.musicVol = v; saveSettings(); if (ac && playing) musicBus.gain.setTargetAtTime(v*.5, ac.currentTime, .2); }
export function setSfx(on){ settings.sfx = on; saveSettings(); }
document.addEventListener("visibilitychange", () => { if (!ac) return; if (document.hidden) { stopMusic(); } else { if (ac.state !== "running") ac.resume().catch(() => {}); if (settings.music && !playing) startMusic(); } });

/* ---------- sound effects ---------- */
function noise(sec){ const b = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate*sec)), ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1; const s = ac.createBufferSource(); s.buffer = b; return s; }
function bell(freq, t, dur, vel){
  [1, 2.76, 5.4].forEach((m, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = freq*m;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel/(i*1.8 + 1), t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur/(i + 1));
    o.connect(g).connect(sfxBus); o.start(t); o.stop(t + dur); });
}
const FX = {
  // paper: a handful of tiny filtered crackles
  paper(t, soft){ for (let i = 0; i < (soft ? 5 : 9); i++) { const s = noise(.03), f = ac.createBiquadFilter(), g = ac.createGain(), at = t + i*(.018 + Math.random()*.03);
    f.type = "bandpass"; f.frequency.value = 1800 + Math.random()*3500; f.Q.value = 1.4; g.gain.setValueAtTime((soft ? .12 : .2)*(.5 + Math.random()), at); g.gain.exponentialRampToValueAtTime(.0001, at + .03 + Math.random()*.03);
    s.connect(f).connect(g).connect(sfxBus); s.start(at); } },
  // purr: rumbling low noise, pulsing ~24 times a second, swelling in and out
  purr(t){ const s = noise(1.8), f = ac.createBiquadFilter(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    f.type = "lowpass"; f.frequency.value = 260; lfo.frequency.value = 24; lg.gain.value = .5; lfo.connect(lg).connect(g.gain);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.55, t + .3); g.gain.linearRampToValueAtTime(.45, t + 1.2); g.gain.linearRampToValueAtTime(0, t + 1.75);
    s.connect(f).connect(g).connect(sfxBus); s.start(t); lfo.start(t); lfo.stop(t + 1.8); },
  // cha-ching: a quick register clunk then two bright bells
  chaching(t){ const s = noise(.08), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = "highpass"; f.frequency.value = 2500;
    g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.0001, t + .08); s.connect(f).connect(g).connect(sfxBus); s.start(t);
    bell(1568, t + .07, 1.1, .22); bell(2093, t + .17, 1.4, .2); },
  coin(t){ bell(2349, t, .7, .12); },
  bowl(t){ [220, 550].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(i ? .05 : .16, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 3.2); o.connect(g).connect(sfxBus); o.start(t); o.stop(t + 3.3); }); },
  // a soft single chime (ticking things off, gifts); timers ending still use the fuller three-note alarm
  chime(t){ bell(1046, t, 1.4, .055); },
  alarm(t){ [660, 880, 1320].forEach((fr, i) => bell(fr, t + i*.18, 1.2, .14)); },
  // villager "hello": a few soft pitched blips, Animal Crossing style, pitch set per villager
  babble(t, pitch = 1){ const n = 3 + Math.floor(Math.random()*3);
    for (let i = 0; i < n; i++) { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), at = t + i*.075;
      o.type = "square"; o.frequency.value = 330*pitch*Math.pow(2, [0, 2, 4, 7, 9][Math.floor(Math.random()*5)]/12); f.type = "lowpass"; f.frequency.value = 1400;
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.07, at + .01); g.gain.exponentialRampToValueAtTime(.0001, at + .065);
      o.connect(f).connect(g).connect(sfxBus); o.start(at); o.stop(at + .08); } },
  // Evan's room: playful, soft sounds for the toddler games
  pop(t){ const s = noise(.06), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = "bandpass"; f.frequency.value = 1800; g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.0001, t + .07); s.connect(f).connect(g).connect(sfxBus); s.start(t); },
  crack(t){ for (let i = 0; i < 3; i++) { const s = noise(.025), f = ac.createBiquadFilter(), g = ac.createGain(), at = t + i*.05; f.type = "highpass"; f.frequency.value = 2200; g.gain.setValueAtTime(.18, at); g.gain.exponentialRampToValueAtTime(.0001, at + .03); s.connect(f).connect(g).connect(sfxBus); s.start(at); } },
  roar(t){ const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(260, t); o.frequency.linearRampToValueAtTime(420, t + .15); o.frequency.exponentialRampToValueAtTime(180, t + .5);
    f.type = "lowpass"; f.frequency.value = 900; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + .55); o.connect(f).connect(g).connect(sfxBus); o.start(t); o.stop(t + .6); },
  whistle(t){ [[740, 0], [988, 0], [740, .32], [988, .32]].forEach(([fr, d]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = fr; g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(.05, t + d + .03); g.gain.setValueAtTime(.05, t + d + .22); g.gain.exponentialRampToValueAtTime(.0001, t + d + .3); o.connect(g).connect(sfxBus); o.start(t + d); o.stop(t + d + .32); }); },
  choo(t){ for (let i = 0; i < 4; i++) { const s = noise(.12), f = ac.createBiquadFilter(), g = ac.createGain(), at = t + i*.22; f.type = "bandpass"; f.frequency.value = 700; g.gain.setValueAtTime(.2, at); g.gain.exponentialRampToValueAtTime(.0001, at + .12); s.connect(f).connect(g).connect(sfxBus); s.start(at); } },
  vroom(t){ const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(220, t + .7);
    f.type = "lowpass"; f.frequency.value = 600; g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.0001, t + .8); o.connect(f).connect(g).connect(sfxBus); o.start(t); o.stop(t + .85); },
  honk(t){ [0, .2].forEach(d => { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = "square"; o.frequency.value = 440; f.type = "lowpass"; f.frequency.value = 1200; g.gain.setValueAtTime(.05, t + d); g.gain.exponentialRampToValueAtTime(.0001, t + d + .14); o.connect(f).connect(g).connect(sfxBus); o.start(t + d); o.stop(t + d + .15); }); },
  crunch(t){ for (let i = 0; i < 4; i++) { const s = noise(.04), f = ac.createBiquadFilter(), g = ac.createGain(), at = t + i*.09; f.type = "bandpass"; f.frequency.value = 2600; g.gain.setValueAtTime(.16, at); g.gain.exponentialRampToValueAtTime(.0001, at + .04); s.connect(f).connect(g).connect(sfxBus); s.start(at); } },
  slurp(t){ const o = ac.createOscillator(), g = ac.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(700, t + .35); g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .4); o.connect(g).connect(sfxBus); o.start(t); o.stop(t + .42); },
  yay(t){ [523, 659, 784, 1046].forEach((fr, i) => bell(fr, t + i*.09, .7, .06)); },
  tap(t){ const o = ac.createOscillator(), g = ac.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(520, t + .06);
    g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.0001, t + .08); o.connect(g).connect(sfxBus); o.start(t); o.stop(t + .1); }
};
export function sfx(name, arg){
  if (!settings.sfx || !ensure() || ac.state !== "running" || !FX[name]) return;
  try { FX[name](ac.currentTime + .01, arg); } catch {}
}
export function alarm(){ if (!ensure() || ac.state !== "running") return; try { FX.alarm(ac.currentTime + .01); } catch {} }
