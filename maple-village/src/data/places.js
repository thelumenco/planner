// Where your own tasks get done (the quest board's "your tasks"). Each task is sent to one place by the words in it:
// a specific word (email, laundry, tax: what the task is about) beats a general one (write, send, sort: how), and
// between equals the word that comes first in the task wins. Nothing matches: your desk at home. The player can
// always pick another place for a task (t.place, with t.placeSet once they've chosen).
// Going there is optional: tick a task anywhere, or walk to its place and do it there for a coin more.
export const PLACES = {
  post:     {n: "the post office", scene: "post", spot: "counter", doing: "Letters in, letters out",
    words: ["email", "e-mail", "inbox", "reply", "replies", "message", "letter", "post", "parcel", "mail", "dm", "text", "call", "phone", "ring", "rsvp", "respond", "postcard", "card", "whatsapp"], verbs: ["send", "answer", "contact", "chase", "follow up"]},
  cabinet:  {n: "the filing cabinet", scene: "post", spot: "cabinet", doing: "A place for everything",
    words: ["admin", "paperwork", "form", "tax", "file", "filing", "document", "contract", "insurance", "renew", "passport", "appointment", "booking", "visa", "licence", "license", "warranty", "flight", "hotel", "ticket", "holiday", "trip", "doctor", "dentist", "vet"], verbs: ["sort", "organise", "organize", "fill", "book"]},
  scales:   {n: "the post office scales", scene: "post", spot: "scales", doing: "Weighed, stamped, sorted",
    words: ["pay", "bill", "bank", "budget", "invoice", "receipt", "expense", "rent", "money", "savings", "transfer", "refund", "subscription", "accounts"], verbs: []},
  writing:  {n: "the library desk", scene: "library", spot: "desk", doing: "Pen, paper, quiet",
    words: ["essay", "report", "draft", "blog", "article", "story", "homework", "assignment", "study", "revise", "revision", "exam", "course", "lesson", "research", "notes", "proposal", "presentation", "slides", "cv", "resume", "cover letter", "poem", "journal"], verbs: ["write", "plan", "learn", "practise", "practice"]},
  reading:  {n: "the reading nook", scene: "library", spot: "nook", doing: "A good chair and a good lamp",
    words: ["chapter", "novel", "magazine", "podcast", "books"], verbs: ["read", "listen"]},
  kitchen:  {n: "your kitchen", scene: "home", spot: "kitchen", doing: "Something smells good",
    words: ["cook", "dinner", "lunch", "breakfast", "meal", "bake", "prep", "recipe", "dishes", "lunchbox"], verbs: []},
  sofa:     {n: "your sofa", scene: "home", spot: "sofa", doing: "Soft cushions, deep breaths",
    words: ["rest", "nap", "meditate", "meditation", "breathe", "relax", "stretch"], verbs: ["sit"]},
  laundry:  {n: "the laundry corner", scene: "garage", spot: "laundry", doing: "Fold, stack, done",
    words: ["laundry", "washing", "fold", "iron", "clothes", "sheets", "towels", "wardrobe"], verbs: ["wash"]},
  cleaning: {n: "the cleaning cupboard", scene: "garage", spot: "cupboard", doing: "Mop, duster, bucket",
    words: ["clean", "tidy", "hoover", "vacuum", "mop", "dust", "declutter", "bathroom", "bins", "rubbish", "recycling"], verbs: ["wipe", "sweep"]},
  exercise: {n: "the treadmill", scene: "office", spot: "treadmill", doing: "A gentle walk, going nowhere",
    words: ["exercise", "workout", "walk", "run", "jog", "gym", "yoga", "pilates", "steps", "cardio", "swim"], verbs: ["move"]},
  fixing:   {n: "Bo's workbench", scene: "carpentry", spot: "bench", doing: "Measure twice, cut once",
    words: ["fix", "repair", "build", "diy", "assemble", "paint", "hang", "drill", "furniture", "shelf", "bike"], verbs: ["make", "mend"]},
  shopping: {n: "the market", scene: "market", spot: "stall", doing: "Basket on your arm",
    words: ["groceries", "grocery", "shopping", "supermarket", "buy", "pick up", "errand", "pharmacy", "gift"], verbs: ["get"]},
  desk:     {n: "your desk", scene: "office", spot: "desk", doing: "Your own little desk", words: [], verbs: []}
};
export const DEFAULT_PLACE = "desk";

// a task's place from its words -> place id
export function placeFor(title){
  const t = " " + String(title || "").toLowerCase().replace(/[^a-z0-9'\- ]/g, " ").replace(/\s+/g, " ") + " ";
  let best = null;
  for (const [id, p] of Object.entries(PLACES)) for (const [list, w] of [[p.words, 2], [p.verbs, 1]]) for (const k of list) {
    const m = new RegExp(" " + k.replace(/[-']/g, "\\$&") + "(s|es|d|ed|ing|ies)? ").exec(t); if (!m) continue;   // the word, or a plain ending ("emails", "booked")
    const i = m.index;
    if (!best || w > best.w || (w === best.w && i < best.i)) best = {id, w, i};
  }
  return best ? best.id : DEFAULT_PLACE;
}
export const placeOf = t => PLACES[t.place] ? t.place : placeFor(t.title);
// the place at this spot (scene + station id), if any
export const placeAt = (scene, spot) => Object.keys(PLACES).find(id => PLACES[id].scene === scene && PLACES[id].spot === spot) || null;
