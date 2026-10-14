// The haberdashery and the tailor's on Makers' Lane (Ada's and Idris's): what's for sale, what can be made, and what
// it costs. Fabric comes by the piece; a garment needs a few pieces of one fabric, and buttons by the card. Prices sit
// well above the market's day-to-day things: a dress, all in, is something to save up for.
export const MATERIALS = {
  cotton: {n: "Cotton", price: 6, line: "Soft and easy. Good for everything."},
  linen: {n: "Linen", price: 8, line: "Cool and crumpled in the best way."},
  denim: {n: "Denim", price: 9, line: "Tough as boots. Softens with every wash."},
  wool: {n: "Wool", price: 12, line: "Warm, and smells faintly of sheep. Lovely."},
  silk: {n: "Silk", price: 18, line: "For best. Ada keeps it in tissue paper."}
};
export const COLOURS = {
  "#FFFDF6": "Cream", "#F2A290": "Coral", "#E8566C": "Poppy", "#F4C7CF": "Blush", "#F3C969": "Honey", "#9CC27E": "Sage",
  "#5E8A48": "Fern", "#6E9FD6": "Cornflower", "#2F3B73": "Navy", "#C9A3E0": "Lilac", "#8C8F7A": "Olive", "#2F2B28": "Ink"
};
export const PATTERNS = {plain: {n: "Plain", extra: 0}, gingham: {n: "Gingham", extra: 2}, stripe: {n: "Stripe", extra: 2}, polka: {n: "Polka dot", extra: 2}, floral: {n: "Floral", extra: 3}};
export const BUTTONS = {
  wood: {n: "Wooden buttons", price: 3, col: "#B98A5A"}, shell: {n: "Shell buttons", price: 5, col: "#F3EDE4"},
  brass: {n: "Brass buttons", price: 6, col: "#D9A93A"}, pearl: {n: "Pearl buttons", price: 8, col: "#F6F1E8"}
};
// a fabric is one material in one colour and pattern; its key is "material:colour:pattern"
export const fabricKey = (mat, col, pat) => `${mat}:${col}:${pat}`;
export const parseFabric = k => { const [mat, col, pat] = String(k).split(":"); return {mat, col, pat}; };
export const fabricName = k => { const f = parseFabric(k); return `${COLOURS[f.col] || "Plain"} ${f.pat === "plain" ? "" : PATTERNS[f.pat].n.toLowerCase() + " "}${MATERIALS[f.mat] ? MATERIALS[f.mat].n.toLowerCase() : "fabric"}`; };
export const fabricPrice = k => { const f = parseFabric(k); return (MATERIALS[f.mat] || {price: 6}).price + (PATTERNS[f.pat] || {extra: 0}).extra; };

// What Idris can make. slot: where it's worn. pieces: of one fabric. fee: his making, before extras.
// opts: the choices (the first is the default). Extras: puff sleeves and a collar 3, pockets 2, a long skirt or dress
// a piece more and 4 for the hemming; buttons take one card of buttons from your basket.
export const GARMENTS = {
  tee: {n: "T-shirt", slot: "top", pieces: 2, fee: 15, opts: {sleeves: ["short", "none", "long", "puff"], neck: ["round", "v", "square"]}},
  blouse: {n: "Blouse", slot: "top", pieces: 3, fee: 20, opts: {sleeves: ["short", "long", "puff"], neck: ["round", "v", "square", "collar"], buttons: true}},
  shirt: {n: "Shirt", slot: "top", pieces: 3, fee: 22, opts: {sleeves: ["long", "short"], neck: ["collar"], buttons: "need"}},
  jumper: {n: "Jumper", slot: "top", pieces: 4, fee: 28, opts: {sleeves: ["long"], neck: ["round", "v"]}},
  shorts: {n: "Shorts", slot: "bottom", pieces: 2, fee: 14, opts: {pockets: true}},
  trousers: {n: "Trousers", slot: "bottom", pieces: 3, fee: 22, opts: {pockets: true}},
  skirt: {n: "Skirt", slot: "bottom", pieces: 2, fee: 16, opts: {length: ["knee", "short", "long"], pockets: true}},
  dress: {n: "Dress", slot: "dress", pieces: 4, fee: 32, opts: {sleeves: ["short", "none", "long", "puff"], neck: ["round", "v", "square", "collar"], length: ["knee", "short", "long"], buttons: true, pockets: true}}
};
export const OPT_NAMES = {
  sleeves: {none: "No sleeves", short: "Short sleeves", long: "Long sleeves", puff: "Puff sleeves"},
  neck: {round: "Round neck", v: "V-neck", square: "Square neck", collar: "Collar"},
  length: {short: "Short", knee: "Knee length", long: "Long"}
};
// the price of a design: Idris's fee and the extras (the fabric and buttons you bring are already yours)
export function makingFee(d){
  const g = GARMENTS[d.kind]; if (!g) return 0;
  return g.fee + (d.sleeves === "puff" ? 3 : 0) + (d.neck === "collar" && d.kind !== "shirt" ? 3 : 0) + (d.pockets ? 2 : 0) + (d.length === "long" ? 4 : 0);
}
export const piecesFor = d => (GARMENTS[d.kind] || {pieces: 0}).pieces + (d.length === "long" ? 1 : 0);
export const READY_HOUR = 9;   // ready the next morning from 9
