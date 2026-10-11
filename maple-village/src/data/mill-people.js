// The mill's own visitors (round 154): ten day-trippers who come for the olive oil tastings, the soap workshops and a
// browse round the shelves upstairs (millcraft.js millSlot says when). local: "millvisit" keeps them out of the village
// directory; no routine of their own.
const SKIN = ["#F6D9C4", "#F2D3BC", "#E8C4A0", "#D9A882", "#C99A78", "#B9825E", "#A8754F", "#8A5A3A"];
const HAIR = ["#2B2320", "#5A3A2A", "#8A5A3A", "#D9B46A", "#C9785A", "#1E1A18", "#D6D0C6", "#7C7570"];
const TOPS = ["#9CC4D0", "#E8A0B4", "#F3C969", "#9CAA6A", "#B48ED8", "#E8913A", "#7FA3B8", "#C8432F", "#F4E3C8", "#5E8A6A"];
const h = s => [...s].reduce((a, c) => (a*31 + c.charCodeAt(0)) >>> 0, 7);
const V = (id, name, job, hairStyle, extra) => { const k = h(id);
  return {id, name, job, local: "millvisit", tourist: true, pitch: .88 + (k % 6)*.06, routine: [],
    look: {skin: SKIN[k % 8], hair: HAIR[(k >> 3) % 8], hairStyle, top: TOPS[(k >> 5) % 10], bottom: ["#3E4A5A", "#5A4A3E", "#4F5A6A", "#2F2B28"][(k >> 7) % 4], ...(extra ? {extra} : {})},
    lines: ["Grassy! I said grassy and I was right!", "We drove an hour for this. Worth it.", "Can I buy the one with the rosemary? Two of them.", "I've never thought about olive oil this hard in my life."],
    intro: `${name}. ${job}. We saw the mill from the road and had to stop.`, away: `${name}'s gone home.`}; };
export const MILL_PEOPLE = [V("mv_june", "June", "On a food weekend with her sister", "bob"), V("mv_ollie", "Ollie", "Cycling the valley roads", "short", "helmet"),
  V("mv_priti", "Priti", "Collects olive oils from everywhere", "long"), V("mv_sam", "Sam", "Up from the city for the day", "spiky"),
  V("mv_lou", "Lou", "Here for the soap-making", "bun"), V("mv_ken", "Ken", "Retired, touring in a motorhome", "short", "glasses"),
  V("mv_tess", "Tess", "Writing a little guidebook to the valley", "bobfringe", "satchel"), V("mv_ravi", "Ravi", "A chef, scouting suppliers", "short", "apron"),
  V("mv_mia", "Mira", "On her honeymoon", "long"), V("mv_ben", "Bennett", "On his honeymoon", "short")];
export const MILL_VISITORS = MILL_PEOPLE.map(p => p.id);
