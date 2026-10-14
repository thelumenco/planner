// The wedding parties for the terrace (round 152: occasional weddings, an out-of-town bride and groom, their family
// dancing). Four couples who've booked the terrace from out of town, each with six of their people, taking turns
// month by month (game/occasions.js says which wedding is when). local: "wedding" keeps them out of the village
// directory; they've no routine of their own, so they only ever appear on their wedding day.
const SKIN = ["#F6D9C4", "#F2D3BC", "#E8C4A0", "#D9A882", "#C99A78", "#B9825E", "#A8754F", "#8A5A3A"];
const HAIR = ["#2B2320", "#5A3A2A", "#8A5A3A", "#D9B46A", "#C9785A", "#1E1A18", "#D6D0C6", "#7C7570"];
const DRESSY = ["#E8A0B4", "#9CC4D0", "#F3C969", "#B48ED8", "#7FA35A", "#E8913A", "#4E6E8C", "#C8432F"];
const h = s => [...s].reduce((a, c) => (a*31 + c.charCodeAt(0)) >>> 0, 7);
// [id, name, who they are, role, hairStyle] -> an NPC in their best
const person = (id, name, job, role, hairStyle, kid) => {
  const k = h(id), skin = SKIN[k % SKIN.length], hair = role === "grand" ? "#D6D0C6" : HAIR[(k >> 3) % 6], col = DRESSY[(k >> 5) % DRESSY.length];
  const look = role === "bride" ? {skin, hair, hairStyle, top: "#FFFDF6", bottom: "#FFFDF6", dress: "#FFFDF6"}
    : role === "groom" ? {skin, hair, hairStyle, top: "#2F3A4A", bottom: "#2F3A4A", extra: "tie"}
    : role === "suit" || role === "grand" && /^m/.test(hairStyle) ? {skin, hair, hairStyle: hairStyle.replace(/^m/, "") || "short", top: col === "#C8432F" ? "#4A5568" : "#3E4A5A", bottom: "#3E4A5A", extra: "tie"}
    : {skin, hair, hairStyle, top: col, bottom: col, dress: col};
  return {id, name, job, look, local: "wedding", tourist: true, kid: !!kid, pitch: .86 + (k % 6)*.06, routine: [],
    lines: role === "bride" || role === "groom" ? ["Is this real? Pinch me.", "Thank you for having us. It's perfect out here.", "We found this place on a weekend away, and that was it."]
      : ["What a spot for it! Look at that view.", "I haven't cried this much since the last one.", "Is there more of that sparkling? Asking for a friend.", "Lovely couple. Lovely, lovely couple."],
    intro: role === "bride" || role === "groom" ? `${name}. We're getting married here today! Well, this afternoon. Nervous? Not at all. Very.` : `${name}. ${job}. We've come a long way for this, and it's worth every kilometre.`,
    away: `${name}'s gone home with the wedding party.`};
};
export const WEDDINGS = [
  {couple: "Chloe and James", from: "up from the city", ids: ["wd_chloe", "wd_james", "wd_denise", "wd_graham", "wd_ruby", "wd_peggy", "wd_harry", "wd_maisie"]},
  {couple: "Priyanka and Tom", from: "over from the coast", ids: ["wd_priyanka", "wd_tom", "wd_anjali", "wd_vikram", "wd_sue", "wd_dev2", "wd_nani", "wd_arjun"]},
  {couple: "Mei-Ling and Daniel", from: "in from interstate", ids: ["wd_meiling", "wd_daniel", "wd_mrtan", "wd_mrstan", "wd_josh", "wd_ahma", "wd_isla", "wd_kelvin"]},
  {couple: "Kate and Ellie", from: "down from the hills", ids: ["wd_kate", "wd_ellie", "wd_fiona", "wd_pete", "wd_bella", "wd_ron", "wd_ivy", "wd_sam2"]}
];
export const WEDDING_PEOPLE = [
  person("wd_chloe", "Chloe", "The bride", "bride", "long"), person("wd_james", "James", "The groom", "groom", "short"),
  person("wd_denise", "Denise", "Chloe's mother", "guest", "bob"), person("wd_graham", "Graham", "James's father", "suit", "short"),
  person("wd_ruby", "Ruby", "Chloe's sister, the bridesmaid", "guest", "bun"), person("wd_peggy", "Peggy", "James's nan", "grand", "bob"),
  person("wd_harry", "Harry", "The best man", "suit", "spiky"), person("wd_maisie", "Maisie", "The flower girl, Chloe's niece", "guest", "long", true),
  person("wd_priyanka", "Priyanka", "The bride", "bride", "bun"), person("wd_tom", "Tom", "The groom", "groom", "short"),
  person("wd_anjali", "Anjali", "Priyanka's mother", "guest", "bun"), person("wd_vikram", "Vikram", "Priyanka's father", "suit", "short"),
  person("wd_sue", "Sue", "Tom's mother", "guest", "bob"), person("wd_dev2", "Devesh", "The best man, Priyanka's brother", "suit", "short"),
  person("wd_nani", "Nani", "Priyanka's grandmother", "grand", "bun"), person("wd_arjun", "Arjun", "The ring bearer, Priyanka's nephew", "suit", "short", true),
  person("wd_meiling", "Mei-Ling", "The bride", "bride", "long"), person("wd_daniel", "Daniel", "The groom", "groom", "short"),
  person("wd_mrtan", "Mr Tan", "Mei-Ling's father", "suit", "short"), person("wd_mrstan", "Mrs Tan", "Mei-Ling's mother", "guest", "bob"),
  person("wd_josh", "Josh", "Daniel's brother, the best man", "suit", "spiky"), person("wd_ahma", "Grandma Tan", "Mei-Ling's grandmother", "grand", "bun"),
  person("wd_isla", "Isla", "The flower girl, Daniel's niece", "guest", "bobfringe", true), person("wd_kelvin", "Kelvin", "Mei-Ling's cousin", "suit", "short"),
  person("wd_kate", "Kate", "One of the brides", "bride", "long"), person("wd_ellie", "Ellie", "One of the brides", "bride", "bob"),
  person("wd_fiona", "Fiona", "Kate's mother", "guest", "bob"), person("wd_pete", "Pete", "Ellie's father", "suit", "short"),
  person("wd_bella", "Bella", "Their best friend, the maid of honour", "guest", "long"), person("wd_ron", "Ron", "Kate's grandad", "grand", "mshort"),
  person("wd_ivy", "Ivy", "Ellie's little sister, the flower girl", "guest", "long", true), person("wd_sam2", "Sammy", "Kate's brother", "suit", "spiky")
];

// the keepsakes from the terrace: a painting from each of Theo's sip and paint subjects, and a caught bouquet
// (round 197: your own paintings can be given away too: `to` makes the backpack offer the gift chooser, with "Keep it" still there)
export const PAINTINGS = {
  p_view: {to: "family", say: "Your own painting! It's going straight on the wall, where everyone can see it.", says: {theo: "You painted this at my class! Look at that horizon. I'm framing it properly."}, n: "Your painting: the lavender view", kind: "keepsake", price: 0, art: ["tile", "#A68FCB", "#F3DDB0"], line: "Your own painting of the view from the terrace, from Theo's sip and paint. Lavender rows running off to blue hills. Wobbly, and wonderful."},
  p_cypress: {to: "family", say: "Your own painting! It's going straight on the wall, where everyone can see it.", says: {theo: "You painted this at my class! Look at that horizon. I'm framing it properly."}, n: "Your painting: cypresses at dusk", kind: "keepsake", price: 0, art: ["tile", "#4E6A4A", "#E9C9A8"], line: "Three cypresses against a peachy sky, painted at Theo's sip and paint on the terrace. He fixed the horizon with one stroke."},
  p_still: {to: "family", say: "Your own painting! It's going straight on the wall, where everyone can see it.", says: {theo: "You painted this at my class! Look at that horizon. I'm framing it properly."}, n: "Your painting: a bottle and a glass", kind: "keepsake", price: 0, art: ["tile", "#7A1F3D", "#F3E7C8"], line: "A still life: a bottle of your own wine, a glass and some fruit, from Theo's sip and paint. It's going on the wall."},
  t_bouquet: {n: "A wedding bouquet", kind: "keepsake", price: 0, art: ["tile", "#F4C7CF", "#7FA35A"], line: "The bouquet from a wedding on the terrace: it sailed over everyone's heads and straight into your arms. Roses, lavender and olive leaves, drying now."}
};
