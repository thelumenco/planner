// The map (round 231, the creator: "a mini version of the map... it shows where you are and where certain landmarks
// are", kept in the backpack; and the same map on the wiki). Honeybrook's sixteen outdoor screens sit on a 4 by 4 grid,
// the way their gates join up; each shows its name and a few landmarks, and a pulsing dot marks where you are. Things
// you haven't built or bought yet stay off the map until you have them. Pure: game/core.js and the wiki both draw it.
import { esc } from "../util.js";
import { icon, iconAt } from "../art/icons.js";

// [screen, short name, column, row, ground colour, where you are ("You're ...")]
export const TILES = [
  ["bay", "The bay", 0, 0, "#CFE6F2", "at the bay"], ["hfarm", "Wildflower Farm", 1, 0, "#E3EDC8", "at Wildflower Farm"], ["hlane", "Cottage lane", 2, 0, "#E8EDD8", "on the cottage lane"], ["hwoods", "The woods", 3, 0, "#CFE0C2", "in the woods"],
  ["shore", "Foreshore", 0, 1, "#F2E2B8", "on the foreshore"], ["field", "The field", 1, 1, "#DDEACB", "in the field"], ["village", "Town square", 2, 1, "#EFE4CF", "in the town square"], ["lane", "Makers' Lane", 3, 1, "#EDE3D6", "on Makers' Lane"],
  ["flowers", "Flower farm", 0, 2, "#F4DDE4", "at the flower farm"], ["orchard", "The orchard", 1, 2, "#DCE9C6", "in the orchard"], ["base", "Home", 2, 2, "#E4ECD6", "at home"], ["vineyard", "The vineyard", 3, 2, "#E6DCEB", "at the vineyard"],
  ["lighthouse", "Lighthouse Point", 0, 3, "#D6E6EF", "at Lighthouse Point"], ["stables", "The Stables", 1, 3, "#EADFCB", "at the Stables"], ["green", "Honeybrook Green", 2, 3, "#DCEBCB", "on Honeybrook Green"], ["lowervine", "Lower vineyard", 3, 3, "#E3DCE8", "in the lower vineyard"]];
// the paths between screens (each gate, both ways)
export const PATHS = [["bay", "hfarm"], ["hfarm", "hlane"], ["hlane", "hwoods"], ["bay", "shore"], ["hfarm", "field"], ["hlane", "village"], ["hwoods", "lane"],
  ["shore", "field"], ["field", "village"], ["village", "lane"], ["shore", "flowers"], ["field", "orchard"], ["village", "base"], ["lane", "vineyard"],
  ["flowers", "orchard"], ["orchard", "base"], ["base", "vineyard"],
  ["flowers", "lighthouse"], ["orchard", "stables"], ["base", "green"], ["vineyard", "lowervine"], ["lighthouse", "stables"], ["stables", "green"], ["green", "lowervine"]];
const goal = k => F => !!(F && F.goals && F.goals[k]);
// [screen, landmark, icon, shown when (F => bool; always on the wiki's map), wiki note]
export const LANDMARKS = [
  ["base", "Your house", "home"], ["base", "The garden", "sprout"], ["base", "The pond", "water"], ["base", "The shed", "wateringCan"],
  ["base", "The treehouse", "treehouse", F => !!(F && F.fam && F.fam.owned && F.fam.owned.treehouse), "once you've bought it"], ["base", "The greenhouse", "tomato", goal("greenhouse"), "once it's built"],
  ["village", "The market", "market"], ["village", "The town hall", "hall"], ["village", "The post office", "post"], ["village", "The library", "library"], ["village", "The bank", "coin"],
  ["lane", "Bo's workshop", "carpentry"], ["lane", "Ada's haberdashery", "haberdash"], ["lane", "Idris the tailor's", "tailor"], ["lane", "Mr Okada's, and Mika's chair", "okadahouse"],
  ["vineyard", "The wine shop", "wine_red"], ["vineyard", "The vines", "grape_red"], ["vineyard", "The olive grove", "olives"], ["vineyard", "The terrace", "wine_rose", F => !!(F && F.vine && F.vine.terrace), "once it's built"],
  ["orchard", "The fruit trees", "apple"], ["orchard", "The farm shop", "peach"],
  ["flowers", "The flower beds", "tulip"], ["flowers", "The bouquet bench", "sunflower"],
  ["field", "The football pitch", "ball"], ["field", "The Sunday market", "market"], ["field", "Kites", "kite"],
  ["shore", "The ferry jetty", "taxi"], ["shore", "Hana and Theo's", "home"], ["shore", "Paddleboards", "water"],
  ["bay", "The Scoop Shack", "icecream"], ["bay", "The Cocoa Room", "chocolate", goal("cocoa"), "once it's done up"], ["bay", "Sunset fishing", "fish"],
  ["hfarm", "The farmhouse", "home"], ["hfarm", "The goats", "goat"], ["hfarm", "The hives", "honey"],
  ["hlane", "Honeybrook station", "taxi"], ["hlane", "Elena's cottages", "bed"], ["hlane", "The windmill", "oliveoil", F => !(F && F.goals && F.goals.mill), "until it's an olive mill"], ["hlane", "The olive mill", "oliveoil", goal("mill"), "once it's opened up"],
  ["hwoods", "The lookout", "eyes"], ["hwoods", "Foraging", "mushroom"], ["hwoods", "The pool", "water"],
  ["lighthouse", "The lighthouse", "lighthouse"], ["lighthouse", "Fish and chips", "fish"], ["lighthouse", "Rock pools", "water"], ["lighthouse", "Paddleboard jetty", "water"],
  ["stables", "The paddock", "horse"], ["stables", "Pony rides", "horse"], ["stables", "The tack room", "home"],
  ["green", "The duck pond", "duck"], ["green", "The bandstand", "music"], ["green", "The cricket lawn", "ball"], ["green", "The allotments", "sprout"],
  ["lowervine", "Four more rows of vines", "grape_red"], ["lowervine", "The old press", "wine_red"], ["lowervine", "The sea bench", "water"]];
// what's on one screen: [{n, ico, note}] (F null: everything, for the wiki)
export const landmarksOf = (F, screen) => LANDMARKS.filter(([s, , , when]) => s === screen && (!F || !when || when(F))).map(([, n, ico, , note]) => ({n, ico, note}));
export const tileOf = screen => TILES.find(t => t[0] === screen);
export const W = 484, H = 484;
const X = c => 12 + c*120, Y = r => 12 + r*120;   // tiles are 100 square, 20 apart
// the map as an svg. opts: {here: screen with the dot, pick: highlighted screen, tap: tiles get data-mm (in the game)}
export function mapSVG(F, opts = {}){
  const tiles = Object.fromEntries(TILES.map(t => [t[0], t]));
  const mid = s => { const t = tiles[s]; return [X(t[2]) + 50, Y(t[3]) + 50]; };
  const paths = PATHS.map(([a, b]) => { const [x1, y1] = mid(a), [x2, y2] = mid(b); return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#B9A27E" stroke-width="5" stroke-dasharray="2 7" stroke-linecap="round" fill="none"/>`; }).join("");
  const words = n => { const w = n.split(" "); if (n.length <= 11 || w.length < 2) return [n]; const h = Math.ceil(w.length/2); return [w.slice(0, h).join(" "), w.slice(h).join(" ")]; };
  const cells = TILES.map(([s, n, c, r, col]) => {
    const x = X(c), y = Y(r), lm = landmarksOf(F, s).slice(0, 3), lines = words(n), on = opts.pick === s;
    const icons = lm.map((l, i) => iconAt(l.ico, x + 50 + (i - (lm.length - 1)/2)*29, y + 74, 25)).join("");
    return `<g${opts.tap ? ` data-mm="${s}" role="button" tabindex="0" aria-label="${esc(n)}"` : ""} class="mmtile">
      <rect x="${x}" y="${y}" width="100" height="100" rx="12" fill="${col}" stroke="${on ? "#5E9A86" : "#3B3530"}" stroke-width="${on ? 3 : 1.4}"/>
      ${lines.map((t, i) => `<text x="${x + 50}" y="${y + (lines.length > 1 ? 24 : 30) + i*17}" text-anchor="middle" font-family="Klee One,serif" font-weight="600" font-size="15" fill="#2F2B28">${esc(t)}</text>`).join("")}${icons}</g>`; }).join("");
  const here = opts.here && tiles[opts.here] ? (() => { const t = tiles[opts.here], x = X(t[2]) + 88, y = Y(t[3]) + 12;
    return `<g class="mmhere" pointer-events="none"><circle cx="${x}" cy="${y}" r="9" fill="#E8566C" opacity=".35"><animate attributeName="r" values="7;13;7" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".45;.1;.45" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="${x}" cy="${y}" r="6" fill="#E8566C" stroke="#FFFDF6" stroke-width="2"/></g>`; })() : "";
  return `<svg class="mmsvg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="A map of Honeybrook${opts.here && tiles[opts.here] ? `: you're at ${esc(tiles[opts.here][1].toLowerCase())}` : ""}"><rect width="${W}" height="${H}" rx="16" fill="#F7F1E4"/>${paths}${cells}${here}</svg>`;
}
// the panel in the game. at: {screen (outdoor screen you're on, or null on a trip), inside (room name or ""), trip (town name or "")}
export function mapPanel(F, at, pick){
  const t = tileOf(pick) || tileOf(at.screen), where = at.trip ? `You're on a day trip to ${esc(at.trip)}. Honeybrook will be right here when you get home.`
    : at.inside ? `You're in ${esc(at.inside.replace(/^The /, "the "))}, ${esc(tileOf(at.screen)[5])}.` : `You're ${esc(tileOf(at.screen)[5])}.`;
  const lm = t ? landmarksOf(F, t[0]) : [];
  return `<div class="mmcard" role="dialog" aria-modal="true" aria-labelledby="mmT"><span class="tape gingham" aria-hidden="true"></span><h2 id="mmT">Map of Honeybrook</h2>
    <p class="sub"><span class="mmdot" aria-hidden="true"></span>${where}</p>${mapSVG(F, {here: at.trip ? null : at.screen, pick: t && t[0], tap: true})}
    ${t ? `<p class="sulabel">${esc(t[1])}</p><ul class="mmlist">${lm.map(l => `<li>${icon(l.ico, 22)}<span>${esc(l.n)}</span></li>`).join("")}</ul>` : ""}
    <p class="muted">Tap a place on the map to see what's there.</p><div class="actions"><button class="btn alt small" data-mmclose="1">Close</button></div></div>`;
}
