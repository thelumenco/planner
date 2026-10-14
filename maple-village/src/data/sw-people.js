// Saltwick Harbour's people (round 208), local: "saltwick". Two to four in the rooms at the busy times and folk out on
// every screen, all in town hours (the boat brings Mel from 8am and takes her home by 7pm).
//   The storytellers (stories.js): Nan Storr at the fish market, Tom Hawsker at the chandlery (restoring a coble in
//   the yard), Priya at the jet workshop.
//   Also: Maud at the Copper Kettle; Ged behind the bar at the Fisherman's Arms; Billy and Alf, who mend nets on the
//   quay in the morning and sing shanties by the pub fire every afternoon (2 till 5); and visitors: Jen walking the
//   coast path with her spaniel, and Raven and Lily, who come every year for the abbey (all black lace, very sweet).
import { SW_ROOM_STAND, SW_PUB_SINGERS } from "./saltwick-rooms-layout.js";
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "saltwick", pitch: .82 + (id.charCodeAt(2) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const at = room => SW_ROOM_STAND[room];

export const SW_PEOPLE = [
  P("nanstorr", "Nan Storr", "Runs the fish market on the quay (fifty years on the same stall)", {skin: "#F2D3BC", hair: "#E6E2DA", hairStyle: "bun", top: "#3E6B8C", bottom: "#2F2B28", extra: "apron"},
    [slot("8:00", "13:00", "sw_market", at("sw_market"), {dir: -1}), slot("13:00", "14:00", "sw_kettle", [[200, 500], [320, 520]]), slot("14:00", "15:30", "sw_quay", [[220, 400], [260, 440], [200, 480]]), slot("15:30", "19:00", "sw_market", at("sw_market"), {dir: -1})],
    ["Cod's lovely today. Haddock's lovelier. Don't tell the cod.", "Fifty years on this stall, love. Same scales. Same view. Never bored once.", "Lobster's fresh off our Kevin's boat. Still cross about it, look.", "You want a brown crab for croquetas? Pick a heavy one. Heavy's full."],
    "Now then, love. Nan Storr. Everyone calls me Nan, even the vicar. What can I get you? Lobster's beautiful today.", "Nan's popped out. She'll be in the Copper Kettle, telling Maud about everyone."),
  P("tomhawsker", "Tom Hawsker", "Keeps the chandlery, and is restoring an old coble in the yard", {skin: "#E2B590", hair: "#8A8478", hairStyle: "short", top: "#5E7A6E", bottom: "#3A4A5A", hat: "cap"},
    [slot("8:00", "12:00", "sw_chandlery", at("sw_chandlery"), {dir: -1}), slot("12:00", "13:00", "sw_pub", [[200, 480], [300, 500]]), slot("13:00", "17:00", "sw_chandlery", at("sw_chandlery"), {dir: -1}), slot("17:00", "19:00", "sw_east", [[260, 452], [330, 420]])],
    ["Rope's rope. Good rope's summat else.", "She'll float by spring. I've said that for three springs.", "Sou'wester. Point at the back so the rain runs off your neck. Clever, our ancestors.", "Brass wants polishing every week. Salt gets in everything."],
    "Tom Hawsker. Chandler. If it goes on a boat, I've got it, or I'll find it. Mind the anchor by the door.", "Tom's out the back in the yard, with his coble."),
  P("priyajet", "Priya", "Carves jet in the workshop on the East Side", {skin: "#B9825E", hair: "#1E1A18", hairStyle: "long", top: "#2F2B28", bottom: "#5E4A7A", extra: "apron"},
    [slot("9:00", "12:00", "sw_jet", at("sw_jet"), {dir: -1}), slot("12:00", "13:00", "sw_kettle", [[220, 520], [340, 500]]), slot("13:00", "18:30", "sw_jet", at("sw_jet"), {dir: -1})],
    ["Jet's just old wood, really. A hundred and eighty million years old. Squashed.", "Rub it on the stone first. Patience. Then the leather. More patience.", "The Victorians went mad for jet. I don't blame them.", "Every piece breaks differently. You learn to listen to it."],
    "Hi! Priya. Mind the dust, it's everywhere. Want to see something that was a tree before the dinosaurs?", "Priya's gone for a sandwich. Back at one, says the sign."),
  P("maud", "Maud", "Runs the Copper Kettle tearoom", {skin: "#F6DCC6", hair: "#C9C2BA", hairStyle: "bob", top: "#E8A0B4", bottom: "#5A4A3E", extra: "apron"},
    [slot("8:00", "18:00", "sw_kettle", at("sw_kettle"), {dir: -1})],
    ["Sit yourself down, pet. Pot of tea's on its way.", "Curd tart's my mother's recipe. And her mother's. Nobody's improved on it.", "Scone's warm. Jam first, then cream. Don't argue, pet.", "You look like you need a slice of summat."],
    "Hello, pet! I'm Maud. Window seat's free, and the kettle's always on. What'll it be?", "The Copper Kettle's closed. Maud's gone home with her feet up."),
  P("ged", "Ged", "Keeps the bar at the Fisherman's Arms", {skin: "#E8C4A0", hair: "#3A3430", hairStyle: "short", top: "#7A2E2E", bottom: "#2F2B28"},
    [slot("11:00", "19:00", "sw_pub", at("sw_pub"), {dir: -1})],
    ["Shanty lads are in at two. Every day. Rain or shine. Mostly rain.", "Ginger beer for the little 'un? On the house.", "That model coble's older than me. And I'm old.", "Fire's lit. Sit by it. Doctor's orders."],
    "Ged. This is my pub, or the pub's mine, I forget which. Come in, warm up.", "The Fisherman's Arms isn't open yet. Ged's still asleep upstairs."),
  P("shantybilly", "Billy", "Mends nets on the quay, and sings shanties every afternoon", {skin: "#E2B590", hair: "#D6D0C6", hairStyle: "short", top: "#3E4A6A", bottom: "#3A3430", hat: "cap"},
    [slot("8:30", "13:00", "sw_quay", [240, 470], {act: "nets", dir: -1}), slot("14:00", "17:00", "sw_pub", SW_PUB_SINGERS[0], {dir: 1}), slot("17:00", "19:00", "sw_quay", [[220, 420], [260, 460]])],
    ["Haul away, lads! Haul away!", "Nets don't mend themselves. More's the pity.", "Two o'clock, by the fire. You'll sing. Everybody sings.", "Fifty years I've sung these. Still forget the third verse."],
    "Billy! I mend the nets and I sing the shanties. One's work, one's joy. Guess which is which.", "Billy's having his dinner."),
  P("shantyalf", "Alf", "Plays the squeezebox for the shanty singers", {skin: "#F2D3BC", hair: "#8A8478", hairStyle: "short", top: "#5E7A6E", bottom: "#3A3430"},
    [slot("8:30", "13:00", "sw_quay", [[260, 380], [300, 420]]), slot("14:00", "17:00", "sw_pub", SW_PUB_SINGERS[1], {act: "accordion", dir: -1}), slot("17:00", "19:00", "sw_east", [[200, 452], [280, 452]])],
    ["Squeezebox was my dad's. Wheezes like him too.", "One more verse! There's always one more verse.", "Billy can't hold a tune. He holds it in his heart though."],
    "Alf. I play the box. Badly but loudly. Two o'clock at the Arms.", "Alf's gone home for a kip."),
  P("swjen", "Jen", "Walking the coast path with her spaniel", {skin: "#F2D3BC", hair: "#C9785A", hairStyle: "long", top: "#E8823A", bottom: "#3A4A5A", hat: "sunhat"},
    [slot("9:00", "11:00", "sw_west", [[200, 400], [300, 460], [160, 520]]), slot("11:00", "12:30", "sw_abbey", [[260, 360], [300, 480]]), slot("12:30", "13:30", "sw_kettle", [[200, 520], [320, 540]]), slot("13:30", "16:00", "sw_quay", [[220, 420], [260, 500]])],
    ["Fourteen miles so far. My feet have opinions.", "Biscuit, NO. Leave the gull alone.", "The view from the abbey! I nearly cried. Might've been the wind."],
    "Hi! Jen. Walking the coast path, all of it, a bit at a time. That's Biscuit. She's walking it too, mostly sideways.", null, {tourist: true}),
  P("swraven", "Raven", "Comes to Saltwick every year for the abbey", {skin: "#F6E7DC", hair: "#1E1A18", hairStyle: "long", top: "#2F2B28", bottom: "#2F2B28"},
    [slot("10:00", "12:30", "sw_abbey", [[220, 380], [300, 420], [200, 460]]), slot("12:30", "14:00", "sw_jet", [[200, 500], [320, 520]]), slot("14:00", "16:30", "sw_east", [[240, 452], [320, 380]])],
    ["Isn't it beautiful? All those arches against the sky. I could live up here.", "We buy one piece of jet every year. This is our eleventh.", "Everyone thinks goths are gloomy. We're having a lovely time."],
    "Hello! I'm Raven. That's Lily. We come every year for the abbey. Twelve years now. Black lace, sea air, a cream tea. Perfect.", null, {tourist: true}),
  P("swlily", "Lily", "Comes to Saltwick every year for the abbey", {skin: "#E8C4A0", hair: "#5E4A7A", hairStyle: "bob", top: "#2F2B28", bottom: "#5E4A7A"},
    [slot("10:00", "12:30", "sw_abbey", [[240, 400], [320, 440], [220, 480]]), slot("12:30", "14:00", "sw_jet", [[220, 520], [340, 540]]), slot("14:00", "16:30", "sw_kettle", [[200, 500], [320, 520]])],
    ["The scones here are the best on the whole coast. We've checked.", "Raven's going to want the gull earrings. I can feel it.", "We got married in the church up there. Bats came. It was perfect."],
    "Hi! Lily. Yes, we dress like this all the time. Yes, even at the beach. Want a sweet? They're black liquorice, obviously.", null, {tourist: true})
];
