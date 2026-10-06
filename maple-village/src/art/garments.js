// Little hand-drawn pictures of wardrobe items for the wardrobe cards: the shape comes from the slot and words in the
// item's name (cami, wide-leg, maxi, ballet flats, tote...), the colour from colour words in it (navy, emerald, wine...).
const COLOURS = [
  [/black|jet/, "#2F2B28"], [/charcoal|grey|gray/, "#6B6B72"], [/icy white|pure white|white|ivory/, "#FFFDF6"], [/cream|natural|champagne|oyster|pearl/, "#F1E6CF"],
  [/navy|indigo|dark wash|denim/, "#2E3A70"], [/royal blue|deep blue/, "#3554B5"], [/porcelain|pale blue|icy blue|sky/, "#BCD3EC"], [/blue/, "#5B7FC7"],
  [/teal|peacock/, "#2A7C80"], [/emerald/, "#1F7A5A"], [/forest|racing|dark green|deep green/, "#2F5D44"], [/mint/, "#BFE3D0"], [/olive/, "#7A7A40"], [/green|botanical/, "#4E8A5E"],
  [/wine|burgundy|aubergine|plum/, "#6E2440"], [/crimson|red|raspberry|rose red/, "#B3263A"], [/hot pink|pink|blush/, "#F0B3C3"], [/lavender|lilac/, "#CDBEE8"],
  [/chocolate|brown/, "#5A3A2A"], [/mocha|taupe/, "#8E7462"], [/tan|cognac|camel|straw|bronze/, "#C08A5A"], [/gold/, "#D9A93A"], [/silver|platinum/, "#BFC3CA"]];
export const colourOf = (name, fallback) => { const n = String(name || "").toLowerCase(); const hit = COLOURS.find(([re]) => re.test(n)); return hit ? hit[1] : fallback; };

// [fill, lines] in a 24 x 24 box
function shape(field, n, c){
  const F = `style="fill:${c}"`;
  if (field === "top") {
    if (/cami|spaghetti|tank|halter|vest|sleeveless|crop/.test(n)) return [`<path d="M8 5 L9.5 9 Q12 10.5 14.5 9 L16 5 L18 21 H6z" ${F}/>`, `<path d="M8 5 L9.5 9 Q12 10.5 14.5 9 L16 5 L18 21 H6z M8 5 V3 M16 5 V3"/>`];
    if (/shirt|blouse|polo/.test(n)) return [`<path d="M8 4 L12 6 L16 4 L21 8 L19 11 L17 10 V21 H7 V10 L5 11 L3 8z" ${F}/>`, `<path d="M8 4 L12 6 L16 4 L21 8 L19 11 L17 10 V21 H7 V10 L5 11 L3 8z M12 6 V21 M9.5 4.6 L12 8 L14.5 4.6"/>`];
    if (/off shoulder|boat|cowl/.test(n)) return [`<path d="M4 6 Q12 8.5 20 6 L19 10 L17 10 V21 H7 V10 L5 10z" ${F}/>`, `<path d="M4 6 Q12 8.5 20 6 L19 10 L17 10 V21 H7 V10 L5 10z"/>`];
    return [`<path d="M8 4 Q12 6.5 16 4 L21 8 L19 11 L17 10 V21 H7 V10 L5 11 L3 8z" ${F}/>`, `<path d="M8 4 Q12 6.5 16 4 L21 8 L19 11 L17 10 V21 H7 V10 L5 11 L3 8z"/>`];
  }
  if (field === "bottom") {
    if (/short/.test(n)) return [`<path d="M6 4 H18 L19 15 H13 L12 10 L11 15 H5z" ${F}/>`, `<path d="M6 4 H18 L19 15 H13 L12 10 L11 15 H5z M6 6.5 H18"/>`];
    if (/skirt/.test(n)) return [`<path d="M8 4 H16 L${/maxi/.test(n) ? "20 22 H4" : "19 18 H5"}z" ${F}/>`, `<path d="M8 4 H16 L${/maxi/.test(n) ? "20 22 H4" : "19 18 H5"}z M8 6.5 H16 M10 7 L8.5 18 M14 7 L15.5 18"/>`];
    if (/jegging|skinny|fitted/.test(n)) return [`<path d="M7 3 H17 L16 22 H13 L12 9 L11 22 H8z" ${F}/>`, `<path d="M7 3 H17 L16 22 H13 L12 9 L11 22 H8z M7 5.5 H17"/>`];
    return [`<path d="M7 3 H17 L20 22 H13.5 L12 9 L10.5 22 H4z" ${F}/>`, `<path d="M7 3 H17 L20 22 H13.5 L12 9 L10.5 22 H4z M7 5.5 H17"/>`];
  }
  if (field === "dress") {
    if (/jumpsuit/.test(n)) return [`<path d="M8 3 L9 7 H15 L16 3 L17 11 L19 22 H13 L12 14 L11 22 H5 L7 11z" ${F}/>`, `<path d="M8 3 L9 7 H15 L16 3 L17 11 L19 22 H13 L12 14 L11 22 H5 L7 11z M7 11 H17"/>`];
    const len = /mini/.test(n) ? 16 : /midi/.test(n) ? 19 : 22;
    return [`<path d="M8.5 3 L10 7 Q12 8 14 7 L15.5 3 L16.5 10 L${len > 18 ? 20 : 18.5} ${len} H${len > 18 ? 4 : 5.5} L7.5 10z" ${F}/>`, `<path d="M8.5 3 L10 7 Q12 8 14 7 L15.5 3 L16.5 10 L${len > 18 ? 20 : 18.5} ${len} H${len > 18 ? 4 : 5.5} L7.5 10z M7.5 10 Q12 11.5 16.5 10"/>${/wrap/.test(n) ? `<path d="M10 7 L15 15"/>` : ""}`];
  }
  if (field === "layer") {
    if (/cardigan/.test(n)) return [`<path d="M8 3 L4 7 L5 21 H11 L12 9 L13 21 H19 L20 7 L16 3 L12 9z" ${F}/>`, `<path d="M8 3 L4 7 L5 21 H11 L12 9 L13 21 H19 L20 7 L16 3 L12 9z M11 13 h.1 M11 16 h.1"/>`];
    return [`<path d="M8 3 L3 7 L4 21 H11 L12 11 L13 21 H20 L21 7 L16 3 L13.5 9 L12 11 L10.5 9z" ${F}/>`, `<path d="M8 3 L3 7 L4 21 H11 L12 11 L13 21 H20 L21 7 L16 3 L13.5 9 L12 11 L10.5 9z M8 3 L10.5 9 M16 3 L13.5 9"/>`];
  }
  if (field === "shoes") {
    if (/sneaker|trainer/.test(n)) return [`<path d="M3 16 V11 L9 10 L13 13 L20 14 Q22 15 21 18 H3z" ${F}/>`, `<path d="M3 16 V11 L9 10 L13 13 L20 14 Q22 15 21 18 H3z M3 16 H21 M9 12 l1 1.5 M11 12.5 l1 1.5"/>`];
    if (/pump|stiletto|heel/.test(n)) return [`<path d="M3 12 Q8 12 12 15 L20 15 Q21 18 18 18 H11 Q7 15 5 15 L4.5 20 H3.5z" ${F}/>`, `<path d="M3 12 Q8 12 12 15 L20 15 Q21 18 18 18 H11 Q7 15 5 15 L4.5 20 H3.5z"/>${/strap/.test(n) ? `<path d="M7 13 L9 11"/>` : ""}`];
    if (/loafer/.test(n)) return [`<path d="M3 17 Q3 12 9 12 L15 13 Q21 13.5 21 17 Q21 18 19 18 H4 Q3 18 3 17z" ${F}/>`, `<path d="M3 17 Q3 12 9 12 L15 13 Q21 13.5 21 17 Q21 18 19 18 H4 Q3 18 3 17z M11 13 L13 15.5 H16" /><path d="M12.5 14.4 h2" style="stroke:#D9A93A" stroke-width="1.6"/>`];
    return [`<path d="M3 16 Q3 12 8 12 Q12 14 16 13 Q21 13 21 16 Q21 18 18 18 H5 Q3 18 3 16z" ${F}/>`, `<path d="M3 16 Q3 12 8 12 Q12 14 16 13 Q21 13 21 16 Q21 18 18 18 H5 Q3 18 3 16z M8 12 Q12 15.5 16 13"/>${/bow|ballet/.test(n) ? `<path d="M15 13.5 l-1.4 -1.2 v2.4z M15 13.5 l1.4 -1.2 v2.4z"/>` : ""}`];
  }
  if (field === "bag") {
    if (/tote|shopper|cyme|straw/.test(n)) return [`<path d="M4 9 H20 L18.5 21 H5.5z" ${F}/>`, `<path d="M4 9 H20 L18.5 21 H5.5z M8 9 Q8 3 12 3 Q16 3 16 9"/>`];
    if (/clutch/.test(n)) return [`<rect x="3" y="9" width="18" height="9" rx="2" ${F}/>`, `<rect x="3" y="9" width="18" height="9" rx="2"/><path d="M3 12 Q12 15 21 12"/>`];
    if (/balloon|bucket|onigiri|origami/.test(n)) return [`<path d="M6 9 Q4 21 12 21 Q20 21 18 9z" ${F}/>`, `<path d="M6 9 Q4 21 12 21 Q20 21 18 9z M6 9 H18 M9 9 Q9 4 12 4 Q15 4 15 9"/>`];
    return [`<rect x="4" y="9" width="16" height="11" rx="2" ${F}/>`, `<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M4 13 H20 M9 9 Q9 4 12 4 Q15 4 15 9"/><circle cx="12" cy="13.5" r="1"/>`];
  }
  if (field === "jewellery") {
    const g = /silver|platinum|white gold/.test(n) ? "#BFC3CA" : /pearl/.test(n) ? (/black|dark/.test(n) ? "#3A3A46" : "#F6F1E8") : "#D9A93A";
    if (/watch/.test(n)) return [`<rect x="8" y="8" width="8" height="8" rx="2" style="fill:#FFFDF6"/><path d="M9 3 h6 v5 h-6z M9 16 h6 v5 h-6z" style="fill:${g}"/>`, `<rect x="8" y="8" width="8" height="8" rx="2"/><path d="M9 3 h6 v5 M9 21 h6 v-5 M12 10 v2 l1.5 1"/>`];
    if (/hoop/.test(n)) return [``, `<path d="M8 5 Q4 12 8 17 Q12 18 11 12 M16 5 Q20 12 16 17 Q12 18 13 12" style="stroke:${g}" stroke-width="2"/>`];
    if (/necklace|pendant|lariat/.test(n)) return [`<circle cx="12" cy="17" r="2.4" style="fill:${g}"/>`, `<path d="M5 4 Q12 16 19 4"/><circle cx="12" cy="17" r="2.4"/>`];
    if (/drop|dangle|orchid|petal|coin/.test(n)) return [`<circle cx="8" cy="7" r="1.6" style="fill:${g}"/><circle cx="16" cy="7" r="1.6" style="fill:${g}"/><path d="M8 11 q-2.5 3 0 6 q2.5 -3 0 -6z M16 11 q-2.5 3 0 6 q2.5 -3 0 -6z" style="fill:${g}"/>`, `<path d="M8 8.6 V11 M16 8.6 V11"/><path d="M8 11 q-2.5 3 0 6 q2.5 -3 0 -6z M16 11 q-2.5 3 0 6 q2.5 -3 0 -6z"/>`];
    return [`<circle cx="8" cy="12" r="2.6" style="fill:${g}"/><circle cx="16" cy="12" r="2.6" style="fill:${g}"/>`, `<circle cx="8" cy="12" r="2.6"/><circle cx="16" cy="12" r="2.6"/>`];
  }
  if (field === "sunglasses") {
    const lens = /tortoise|prada|hermes|hermès|burgundy|curve/.test(n) ? "#7A4A30" : "#2F2B28";
    if (/round|rubi/.test(n)) return [`<circle cx="7.5" cy="12" r="4" style="fill:${lens}"/><circle cx="16.5" cy="12" r="4" style="fill:${lens}"/>`, `<circle cx="7.5" cy="12" r="4"/><circle cx="16.5" cy="12" r="4"/><path d="M11.5 11.5 Q12 10.5 12.5 11.5 M3.5 11 L2 10 M20.5 11 L22 10"/>`];
    return [`<rect x="2.5" y="9" width="8.5" height="6.5" rx="2" style="fill:${lens}"/><rect x="13" y="9" width="8.5" height="6.5" rx="2" style="fill:${lens}"/>`, `<rect x="2.5" y="9" width="8.5" height="6.5" rx="2"/><rect x="13" y="9" width="8.5" height="6.5" rx="2"/><path d="M11 11 Q12 10 13 11"/>`];
  }
  if (field === "hair") {
    const down = /down/.test(n);
    return [`<circle cx="12" cy="12" r="5.5" style="fill:#F2D3B8"/><path d="M6.5 11 Q7 5.5 12 5.5 Q17 5.5 17.5 11 Q15 8.5 12 9 Q9 8.5 6.5 11z${down ? " M6.5 11 L5.5 21 H8.5 L8 14z M17.5 11 L18.5 21 H15.5 L16 14z" : ""}" style="fill:#2B2420"/>${down ? "" : `<circle cx="12" cy="4" r="2.6" style="fill:#2B2420"/>`}`, `<circle cx="12" cy="12" r="5.5"/>`];
  }
  return [`<circle cx="12" cy="12" r="6" style="fill:${c}"/>`, `<circle cx="12" cy="12" r="6"/>`];
}
const FALLBACK = {top: "#FFFDF6", bottom: "#2F2B28", dress: "#2E3A70", layer: "#2F2B28", shoes: "#2F2B28", bag: "#2F2B28", jewellery: "#D9A93A", sunglasses: "#2F2B28", hair: "#2B2420"};
export function garment(field, name, size = 30){
  const n = String(name || "").toLowerCase(), [fill, lines] = shape(field, n, colourOf(n, FALLBACK[field] || "#C9C2B8"));
  return `<svg class="ico garment" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><g filter="url(#markerS)">${fill}</g><g filter="url(#wobS)" fill="none" stroke="var(--line)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${lines}</g></svg>`;
}
