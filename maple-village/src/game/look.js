// How you look (phase 4 of the public edition): chosen when you start, changeable later from the wardrobe.
// The player figure is the #mel drawing in index.html; applyLook() sets its colours (CSS variables) and switches its
// parts on and off with classes, so the same call dresses the figure on the map and the preview on the setup screen.
// State: F.me.look = {body, skin, hair, style, top, bottom, legs}
export const BODIES = [["woman", "Woman"], ["man", "Man"], ["neither", "Neither"]];
export const SKINS = ["#FBE3D3", "#F3D2B8", "#EBC4A0", "#D9A57E", "#C08A62", "#A26E4B", "#7E5136", "#5C3A26"];
export const HAIRS = ["#2A211D", "#4A3226", "#6B4A2E", "#A9713E", "#D9A35A", "#E9D6A6", "#B5562E", "#D9D4CC", "#8FA7C8", "#C98AA8"];
export const STYLES = [["pony", "Ponytail"], ["long", "Long"], ["bob", "Bob"], ["short", "Short"], ["bun", "Bun"], ["curly", "Curly"]];
export const TOPS = ["#F2A290", "#FFFDF6", "#6E9FD6", "#9CC27E", "#F3C969", "#C9A3E0", "#E8566C", "#3E4A5C", "#8FA7C8", "#2F2B28"];
export const BOTTOMS = ["#7D97C2", "#2F3A4A", "#2F2B28", "#8C8F7A", "#C9A27E", "#E8566C", "#FFFDF6", "#5E6E8C"];
export const LEGS = [["shorts", "Shorts"], ["trousers", "Trousers"], ["skirt", "Skirt"]];

// a starting look for each body (the screen opens on one of these; every part can be changed)
export const START = {
  woman: {body: "woman", skin: SKINS[1], hair: HAIRS[0], style: "pony", top: TOPS[0], bottom: BOTTOMS[0], legs: "shorts"},
  man: {body: "man", skin: SKINS[2], hair: HAIRS[1], style: "short", top: TOPS[2], bottom: BOTTOMS[1], legs: "trousers"},
  neither: {body: "neither", skin: SKINS[3], hair: HAIRS[2], style: "bob", top: TOPS[3], bottom: BOTTOMS[3], legs: "trousers"}
};
const ok = (v, list) => list.some(x => (Array.isArray(x) ? x[0] : x) === v);
// fill in anything missing or unknown (an old save, a hand-edited one) from the body's starting look
export function lookOf(F){
  const L = (F && F.me && F.me.look) || {}, base = START[ok(L.body, BODIES) ? L.body : "woman"];
  return {body: base.body, skin: ok(L.skin, SKINS) ? L.skin : base.skin, hair: ok(L.hair, HAIRS) ? L.hair : base.hair, style: ok(L.style, STYLES) ? L.style : base.style,
    top: ok(L.top, TOPS) ? L.top : base.top, bottom: ok(L.bottom, BOTTOMS) ? L.bottom : base.bottom, legs: ok(L.legs, LEGS) ? L.legs : base.legs};
}

// dress a #mel-shaped figure: colours, hair style, body, legs (trousers run down to the shoes; a skirt flares)
export function applyLook(el, look){
  if (!el) return;
  el.style.setProperty("--skin", look.skin); el.style.setProperty("--hair", look.hair);
  el.style.setProperty("--tank", look.top); el.style.setProperty("--denim", look.bottom);
  for (const [k] of STYLES) el.classList.toggle("hs-" + k, look.style === k);
  for (const [k] of BODIES) el.classList.toggle("b-" + k, look.body === k);
  for (const [k] of LEGS) el.classList.toggle("l-" + k, look.legs === k);
}
