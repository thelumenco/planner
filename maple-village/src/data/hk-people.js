// Hokkaido's people (round 217), local: "hokkaido". Haruki the glassblower in Otaru (the third Haruki at the furnace),
// Ms Yuki at the music box hall, Kenji the brewer in Sapporo (forty years at the kettles), Mr Oda at the ramen shop,
// Aiko the ski instructor in Niseko (who grew up on the slopes under Mount Yotei), Sachi at the Furano dairy, and Mrs
// Nakamura on the morning market. And visitors (tourist: true). Two to four people in every room at the busy times.
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "hokkaido", pitch: .82 + (id.charCodeAt(2) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const T = (id, name, job, look, routine, lines, intro) => ({...P(id, name, job, look, routine, lines, intro, `${name}'s off seeing another bit of Hokkaido.`), tourist: true});

export const HK_PEOPLE = [
  P("hkharuki", "Haruki", "Blows glass in Otaru, the third Haruki at the same furnace", {skin: "#EAC4A0", hair: "#1E1A18", hairStyle: "short", top: "#3A4A5A", bottom: "#2F2B28", extra: "apron"},
    [slot("9:00", "18:00", "hk_glass", [262, 268], {dir: 1})],
    ["My grandfather made floats for the herring nets. Thousands a year. Now I make one at a time, and people hang them in windows. Better.", "Glass is patient. It waits for you to be patient too.", "The furnace never goes out. Not in a hundred years. My grandfather said if it does, the canal will freeze. It's never gone out, so who knows.", "Every float has a bubble in it somewhere. That's where the breath lives."],
    "Haruki. Glass. Come in, come in: it's warm by the furnace, too warm. Would you like to blow a float? Everybody should, once.", "The glassworks door is shut. The furnace roars on inside, as it always does.",
    {hellos: ["Ah! Back for another float?", "Good morning. The furnace is happy today.", "Come and stand by the fire. Otaru's cold."]}),
  P("hkyuki", "Ms Yuki", "Keeps the music box hall in Otaru", {skin: "#F2D3BC", hair: "#3A2A20", hairStyle: "bun", top: "#B48ED8", bottom: "#2E3A5A"},
    [slot("9:00", "18:00", "hk_musicbox", [262, 340], {dir: 1})],
    ["Every music box has a comb of little steel teeth. The pins pluck them. That's all a song is, really. Pins and teeth.", "The steam clock whistles on the quarter hour. I don't hear it any more. My customers jump every time.", "Wind it slowly. It'll play longer, and it's grateful."],
    "Welcome! I'm Yuki. Listen: thirty thousand music boxes, and every one of them is playing something different. Isn't it wonderful?", "Ms Yuki's gone for lunch. A hundred music boxes are still playing, to nobody."),
  P("hknakamura", "Mrs Nakamura", "Sells crab, scallops and corn on the morning market", {skin: "#E2B590", hair: "#9A928A", hairStyle: "bob", top: "#3E6BAE", bottom: "#5A4A3E", extra: "apron"},
    [slot("7:00", "13:00", "hk_otaru", [[130, 530], [180, 540]]), slot("13:00", "15:00", "hk_ramen", [[200, 540], [330, 560]])],
    ["Scallops! Look at the size. My husband caught these at four this morning. He's asleep now. Lazy.", "Sea urchin. Try it. Try it! There. See? Like eating the sea.", "Corn, butter, a little soy. That's Hokkaido in one bite."],
    "Nakamura! Come, come, look at my scallops. Biggest in Otaru. Possibly in Japan.", "Mrs Nakamura's stall is covered with a blue tarp. Back tomorrow at seven."),
  P("hkkenji", "Kenji", "Has brewed at the Sapporo beer factory for forty years", {skin: "#E8C2A0", hair: "#D6D0C6", hairStyle: "short", top: "#C8432F", bottom: "#2F2B28"},
    [slot("10:00", "13:00", "hk_beer", [404, 404], {dir: -1}), slot("13:00", "14:00", "hk_ramen", [100, 540], {act: "sit", dir: 1}), slot("14:00", "19:00", "hk_beer", [404, 404], {dir: -1})],
    ["Forty years. I've tasted every batch. My doctor is not pleased. My doctor has never tasted a batch.", "The star on the gable is the North Star. Hokkaido was the frontier. You followed the star north.", "Hops, malt, water, yeast. And snow. The snow makes the water. Everything here starts with snow."],
    "Kenji. Brewer. Will you join the tour? I'll show you the kettles. They're very beautiful. I polish them myself, on Sundays.", "Kenji's down in the cellars, checking on the lagers."),
  P("hkoda", "Mr Oda", "Makes miso ramen in Sapporo, and nothing else", {skin: "#C99A78", hair: "#3A3430", hairStyle: "short", top: "#FFFDF6", bottom: "#2F2B28", extra: "apron"},
    [slot("11:00", "21:00", "hk_ramen", [262, 268], {dir: 1})],
    ["One pot. Since dawn. Pork bones, chicken bones, kombu, patience.", "Slurp! It's polite. It cools the noodles, and it tells me you like it.", "Butter on ramen. Sapporo's gift to the world. You're welcome."],
    "Oda. Sit. Miso? Of course miso. Everyone has miso first time.", "The ramen shop's noren curtain is taken down. Mr Oda's gone to buy bones."),
  P("hkaiko", "Aiko", "Teaches skiing at Niseko. Grew up on the slopes under Mount Yotei", {skin: "#EAC4A0", hair: "#1E1A18", hairStyle: "long", top: "#C8432F", bottom: "#2E3A5A", hat: "cap"},
    [slot("8:00", "12:00", "hk_niseko", [[200, 240], [240, 200], [180, 260]]), slot("12:00", "13:30", "hk_lodge", [[200, 540], [330, 560]]), slot("13:30", "16:30", "hk_niseko", [[200, 240], [240, 200]]), slot("16:30", "19:00", "hk_lodge", [380, 316], {dir: -1})],
    ["Powder snow from Siberia, dried out over the sea, then dropped right here. The best snow in the world. Officially.", "My dad ran the lift. I was on skis before I could walk. Well. About the same time.", "In summer I take people rafting down the river. Different kind of shrieking.", "Mount Yotei's a volcano. Sleeping. Very deeply. Don't worry."],
    "Aiko! I teach skiing. In winter, anyway. In summer I teach people to fall out of rafts. Either way, you'll love it.", "Aiko's up the mountain somewhere."),
  P("hksachi", "Sachi", "Runs the dairy at Furano, and its soft-serve", {skin: "#F2D3BC", hair: "#5A3A2A", hairStyle: "bobfringe", top: "#FFFDF6", sleeves: "#FFFDF6", bottom: "#3E6BAE", extra: "apron"},
    [slot("8:00", "17:00", "hk_dairy", [262, 270], {dir: 1})],
    ["Forty cows, and every one has a name. The bossy one is called Plum.", "The milk's so rich because the grass is so sweet. The grass is sweet because of the snow. Everything comes back to the snow.", "Melon soft-serve in July. You have to. It's the law."],
    "Sachi! Welcome to the dairy. Soft-serve? Everyone has soft-serve. Even in the snow. Especially in the snow.", "The dairy's shut. Sachi's milking."),
  T("hkemily", "Emily", "Skiing (and eating) her way round Hokkaido", {skin: "#F6D9C4", hair: "#C9785A", hairStyle: "long", top: "#4E8AC8", bottom: "#2F2B28"},
    [slot("9:00", "11:00", "hk_otaru", [[260, 420], [380, 500]]), slot("11:00", "12:00", "hk_glass", [[200, 540], [330, 540]]), slot("12:00", "13:00", "hk_musicbox", [[200, 540], [330, 540]]), slot("13:00", "15:00", "hk_lodge", [[200, 540], [330, 560]]), slot("15:00", "17:00", "hk_dairy", [[200, 540], [330, 560]])],
    ["I came for the skiing. I'm staying for the soft-serve.", "I've had ramen four times in three days. That's not a problem. That's a plan.", "The snow squeaks. Did you notice? It squeaks."],
    "Emily! From Bristol. On a ski trip, technically. Mostly an eating trip."),
  T("hkdaniel", "Daniel", "Photographing the flower fields", {skin: "#B9825E", hair: "#2A211D", hairStyle: "curly", top: "#7A8A5A", bottom: "#5A4A3E", hat: "cap"},
    [slot("8:00", "11:00", "hk_furano", [[200, 260], [300, 250]]), slot("11:00", "12:00", "hk_dairy", [[200, 540], [330, 520]]), slot("12:00", "14:00", "hk_sapporo", [[140, 520], [260, 500]]), slot("14:00", "16:00", "hk_beer", [[200, 540], [330, 540]]), slot("16:00", "18:00", "hk_ramen", [[200, 540], [330, 560]])],
    ["The lone tree. I've photographed it eleven times. It doesn't get boring. It gets better.", "In July the whole hill's purple. People cry. I cried.", "The light up here's so clean. Like the sky's been rinsed."],
    "Daniel. Photographer. I'm meant to be shooting a calendar. Twelve months, and all I've got is that tree."),
  T("hkmiho", "Miho", "A student from Tokyo, on her summer break", {skin: "#F2D3BC", hair: "#1E1A18", hairStyle: "bobfringe", top: "#F4C7CF", bottom: "#FFFDF6"},
    [slot("10:00", "12:00", "hk_musicbox", [[200, 540], [330, 540]]), slot("12:00", "13:30", "hk_ramen", [[200, 540], [330, 560]]), slot("13:30", "15:00", "hk_glass", [[200, 540], [330, 540]]), slot("15:00", "17:00", "hk_beer", [[200, 540], [330, 540]]), slot("17:00", "19:00", "hk_sapporo", [[260, 500], [420, 560]])],
    ["Tokyo's so hot in summer. Here it's like someone opened a window.", "I've bought three music boxes. One for me, one for my mum, one for me.", "The glassblower let me try! It's harder than it looks. It looks very hard."],
    "Miho! I'm a student. I came to Hokkaido for a week, and I've extended it twice.")
];
