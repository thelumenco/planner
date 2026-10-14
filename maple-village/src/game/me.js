// The player: their name, for letters and the little speech label. Character creation (phase 4) fills F.me in;
// until then everyone writes to a "friend".
// State: F.me = {name}
export const myName = F => (F && F.me && F.me.name) || "friend";
export const dearMe = F => `Dear ${myName(F)}`;
