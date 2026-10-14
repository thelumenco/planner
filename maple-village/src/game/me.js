// The player: their name and pronouns (chosen on the setup screen, game/setup.js). Narration always says "you";
// the pronouns are for the times someone talks about you to somebody else.
// State: F.me = {name, pron: {they, them, their}, look}
export const PRONOUNS = {
  she: {label: "she/her", they: "she", them: "her", their: "her"},
  he: {label: "he/him", they: "he", them: "him", their: "his"},
  they: {label: "they/them", they: "they", them: "them", their: "their"}
};
export const myName = F => (F && F.me && F.me.name) || "friend";
export const dearMe = F => `Dear ${myName(F)}`;
const pr = F => (F && F.me && F.me.pron) || PRONOUNS.they;
export const they = F => pr(F).they;
export const them = F => pr(F).them;
export const their = F => pr(F).their;
// "they're" / "she's": the verb that goes with the pronoun (they takes the plural)
export const theyre = F => { const t = they(F); return t === "they" ? "they're" : `${t}'s`; };
