// Elena's cottages, inside (round 219): placeholder until the art lands
export const LET_SHELLS = {bluebell: () => `<rect width="520" height="640" style="fill:#E6E2DA"/>`, figtree: () => `<rect width="520" height="640" style="fill:#EFE6D8"/>`};
// the furniture in a cottage: slots {slot: {cat, tier, col}}, positions {slot: [x, y]}, parcels waiting in the hall
export const letFurniture = (id, slots, pos, parcels) => Object.entries(slots).map(([s, p]) => `<rect x="${pos[s][0] - 20}" y="${pos[s][1] - 20}" width="40" height="30" style="fill:#C9A27E"/>`).join("");
export const hallTable = (x, y) => `<rect x="${x - 40}" y="${y - 30}" width="80" height="24" style="fill:#8A6A52"/>`;
