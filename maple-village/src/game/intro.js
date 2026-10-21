// The opening story: a tired city office worker, a letter from Honeybrook, and a great-uncle's vineyard.
// A new game plays it once before the setup card (setup.js), where the last question, which pet was waiting on the
// porch, answers Uncle Wilf's riddle. Settings can play it again. Pictures are in art/intro.js; the train is the
// same ride as a day trip's. (The city is named only in this story's text; the leak check allows it in these two files.)
import { esc } from "../util.js";
import { INTRO_ART } from "../art/intro.js";

export const WILF = {name: "Wilfred Song", short: "Uncle Wilf"};
// {art, title, text, letter (shown as paper), train: the ride to Honeybrook instead of a picture}
export const SCREENS = [
  {art: "late", title: "Late again", text: "9:47pm, and the office is dark apart from your screen. Forty tabs open. The emails stopped making sense somewhere around lunch."},
  {art: "meal", title: "Dinner at the desk", text: "Dinner. Again. Cold noodles from the place downstairs, eaten one-handed between spreadsheets. You can't remember the last time you sat down at a proper table."},
  {art: "view", title: "The view", text: "Out there, Singapore glitters: the bay, the wheel, Marina Bay Sands lit up like a ship in the sky. In here, it's the same day as yesterday. And the day before that."},
  {art: "commute", title: "The morning train", text: "Up at six. Train, desk, train, bed. Shoulder to shoulder with a carriage full of people doing exactly the same. Somewhere in there, the years slipped by."},
  {art: "envelope", title: "The envelope", text: "Then one evening, a fat brown envelope, covered in stamps and redirection stickers. It has been to three of your old addresses looking for you.",
    letter: "Dear Sir or Madam,\n\nWe write regarding the estate of your late great-uncle, Mr Wilfred Song, of Honeybrook. His will was found only this spring, tucked inside a cookery book in his kitchen, and it has taken us some months to find you.\n\nWe are pleased to tell you that you are his sole heir: the house, its contents, the vineyard, and a small ice cream shop on the bay. A note in his hand is enclosed.\n\nYours faithfully,\nPembury & Vale, Solicitors"},
  {art: "note", title: "Uncle Wilf's note", text: "A cream card slides out, with an old photograph and a key on a red ribbon.",
    letter: "My dear,\n\nIf this has found you, then the old place is yours: the house, the vineyard, and every crooked post. I never had children of my own, but I kept every card you ever sent me. They're still on the kitchen wall.\n\nWhen I left Singapore, I was about your age, and just as tired. Honeybrook fixed that. I hope it does the same for you.\n\nThe vines have had a hard few years without me. They're tougher than they look, and so, I suspect, are you. Plant them again and they'll pay you back in sunshine.\n\nAnd down on the bay there's the Scoop Shack: the old beach café, my last folly. I never could resist a sea view. Sofia runs the counter and knows far more about gelato than I ever did. Listen to her.\n\nI only ask two things. Look after the vineyard. And look after my dear companion, who will be waiting for you. Don't worry: you'll know each other the moment you meet.\n\nThe village will help. They always helped me.\n\nWith all my love,\nUncle Wilf"},
  {art: "leaving", title: "Leaving", text: "You read the note four more times. The next morning, your pass goes in the drawer and your notice goes in. You empty your savings into your purse, book a flight and a train, and count what's left: 200 coins. Enough to start."},
  {train: true, title: "The train to Honeybrook", text: "All aboard for Honeybrook!"},
  {art: "arrive", title: "Honeybrook", text: "Nothing's growing. The posts lean, the wire sags, and the paint on the house has given up. But it's quiet, and the light is gold, and something just rustled by the porch..."},
  // round 225 (Mel): say plainly that time here keeps pace with the player's own day: a slow game
  {art: "arrive", title: "Honeybrook time", text: "One more thing, before you go in. Time in Honeybrook passes just as it does in your own day: morning here is your morning, and night is your night. Seeds take real hours to grow, the shops keep their hours, and your friends keep to their days. There's no rush. Come back a little each day, and watch the place come to life."}
];

let at = -1, opts = null;
function draw(){
  const box = document.getElementById("intro"); if (!box) return;
  const s = SCREENS[at], last = at === SCREENS.length - 1;
  if (s.train) {   // the day trip's train, on its way to Honeybrook; then on to the gate
    box.querySelector(".incard").innerHTML = "";
    const o = document.createElement("div"); o.className = "taxiride trainride inride"; o.innerHTML = (opts.trainArt ? opts.trainArt() : "") + `<p>${esc(s.text)}</p>`; box.appendChild(o);
    if (opts.sfx) opts.sfx("choo");
    setTimeout(() => { o.remove(); if (at >= 0) { at++; draw(); } }, 3400);
    return;
  }
  const paper = s.letter ? `<div class="inletter${s.art === "note" ? " hand" : ""}">${s.letter.split("\n\n").map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}</div>` : "";
  box.querySelector(".incard").innerHTML = `<div class="inpicbox">${INTRO_ART[s.art]()}</div>
    <div class="inbody"><p class="eyebrow">${esc(s.title)}</p><p class="intext">${esc(s.text)}</p>${paper}
    <div class="actions">${last ? "" : `<button type="button" class="btn alt" data-in="skip">${opts.replay ? "Close" : "Skip the story"}</button>`}<button type="button" class="btn primary" data-in="next">${last ? (opts.replay ? "Back to the village" : "Walk up to the house") : "Next"}</button></div></div>`;
  const b = box.querySelector('[data-in="next"]'); if (b) b.focus({preventScroll: true});
  box.querySelector(".incard").scrollTop = 0;
}
function close(){
  const box = document.getElementById("intro"); if (box) { box.hidden = true; box.innerHTML = ""; }
  at = -1; const done = opts && opts.done; opts = null; if (done) done();
}
// play it: {done() when finished or skipped, replay: true from the settings, trainArt(), sfx(name)}
export function openIntro(o = {}){
  opts = o; at = 0;
  let box = document.getElementById("intro");
  if (!box) { box = document.createElement("div"); box.id = "intro"; box.className = "intro"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "How it began"); document.body.appendChild(box); }
  box.hidden = false; box.innerHTML = `<div class="incard"></div>`;
  box.onclick = ev => { const b = ev.target.closest("[data-in]"); if (!b) return;
    if (b.dataset.in === "skip") { close(); return; }
    if (at >= SCREENS.length - 1) { close(); return; }
    at++; draw(); };
  draw();
}
export const introOpen = () => at >= 0;
// dev: jump straight to one screen (window.__hbIntro(i))
export function introAt(i, o = {}){ openIntro(o); at = Math.max(0, Math.min(SCREENS.length - 1, i)); draw(); }
