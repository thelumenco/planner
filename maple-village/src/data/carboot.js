// The car boot sale's curios (round 271, game/south.js): keepsakes for the shelves at home, registered with the other
// items. Kept in a file of its own so art/icons.js can read it without importing the game code.
import { ITEMS } from "./items.js";
export const CARBOOT = {
  cb_teacup: {n: "Rosebud teacup", price: 6, art: ["cup", "#F4C7CF"], line: "A bone china teacup with rosebuds round the rim and a gold edge, only slightly chipped."},
  cb_records: {n: "Box of old records", price: 14, art: ["disc", "#3B3530"], line: "Big band, a bit of jazz, and one very scratchy brass band record from the 1950s."},
  cb_lamp: {n: "Brass oil lamp", price: 16, art: ["lantern", "#C9A04A"], line: "A little brass oil lamp, the kind that hung in fishermen's cottages. It still has its glass."},
  cb_globe: {n: "Little globe", price: 12, art: ["globe", "#9FC3D9"], line: "A small globe so old some of the countries have changed their names twice."},
  cb_radio: {n: "Old wireless", price: 18, art: ["radio", "#A8754F"], line: "A wooden valve radio. It hums when it warms up, and then, gloriously, the shipping forecast."},
  cb_bell: {n: "Ship's bell", price: 15, art: ["bell", "#C9A04A"], line: "A small brass ship's bell. One ring and everyone comes for tea."},
  cb_owl: {n: "China owl", price: 7, art: ["owl", "#C9A27E"], line: "A round china owl with an expression of deep disapproval. You love it immediately."},
  cb_train: {n: "Tin toy train", price: 10, art: ["train", "#E8566C"], line: "A clockwork tin engine. Wind it up and it rattles proudly across the table."},
  cb_boat: {n: "Ship in a bottle", price: 13, art: ["boat", "#FFFDF6"], line: "A tiny three-masted ship in a bottle. How it got in there is anyone's guess."},
  cb_horse: {n: "Wooden rocking horse", price: 11, art: ["horse", "#C98A4A"], line: "A small carved rocking horse, painted dapple grey. It looks a bit like Pebble."},
  cb_candle: {n: "Brass candlestick", price: 8, art: ["candle", "#F3E7C8"], line: "A heavy brass candlestick with a drip tray, polished to a soft glow."},
  cb_crane: {n: "Folded paper cranes", price: 5, art: ["crane", "#C3CDEE"], line: "A string of tiny paper cranes, folded by somebody very patient."}
};
Object.entries(CARBOOT).forEach(([id, c]) => { ITEMS[id] = {n: c.n, kind: "keepsake", price: c.price, art: c.art, line: c.line}; });
