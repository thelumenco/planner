// Saltwick Harbour's people (round 215), local: "saltwick". Ruth at the fish market (the fourth generation on the
// quay) and her grandson Jack, who knows every crab on the harbour wall; Alfie the lighthouse keeper, who logs every
// boat in his ledger; Nell at the quay café, who came for a weekend twenty years ago; Walter at the chandlery; Sid at
// the smokehouse. And visitors (tourist: true) walking the coast path, hunting fossils and watching the birds. Two to
// four people in every room at the busy times.
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "saltwick", pitch: .8 + (id.charCodeAt(2) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const T = (id, name, job, look, routine, lines, intro) => ({...P(id, name, job, look, routine, lines, intro, `${name}'s off along the coast path.`), tourist: true});

export const SW_PEOPLE = [
  // Ruth: sixty-eight, white coat and wellies, voice like a foghorn and a heart like butter. Her great-grandmother
  // gutted herring on this quay; Ruth's the first in the family to own the market outright. She's training Jack to
  // take over, and pretending not to be proud of him.
  P("swruth", "Ruth", "The fishmonger at Saltwick's market, the fourth generation on the quay", {skin: "#F2D3BC", hair: "#D6D0C6", hairStyle: "bun", top: "#FFFDF6", sleeves: "#FFFDF6", bottom: "#2E3A5A", extra: "apron"},
    [slot("6:30", "14:00", "sw_market", [260, 344], {dir: 1}), slot("14:00", "15:30", "sw_cafe", [[200, 520], [330, 540]]), slot("15:30", "18:00", "sw_harbour", [[150, 300], [230, 380], [330, 320]])],
    ["Cod, haddock, crab, lobster. If it swims past Saltwick, I've got it.", "My great-grandmother gutted herring on this quay with frost on her fingers. I've got a fridge. I'm soft.", "Jack's got the hands for it. Don't tell him I said so.", "Never buy a fish with sad eyes. Bright eyes, red gills, smells of the sea. Not of fish. The sea.", "The boats are in at six. You can set your watch by Davey. Well. You could, once."],
    "Ruth. Fish. Four generations of us on this quay, and I'm the loudest. What can I get you, love? The crab's lovely today.", "Ruth's gone home with her feet up. The market's shut till the boats come in.",
    {hellos: ["Morning, love! The crab's in.", "There you are. I kept you a lobster to look at.", "Mind the ice, it's slippy. Everyone does it once."]}),
  P("swjack", "Jack", "Ruth's grandson. Shovels ice at the market, knows every crab on the harbour wall", {skin: "#F6D9C4", hair: "#C9785A", hairStyle: "short", top: "#2E5E7A", bottom: "#3A3430"},
    [slot("7:00", "12:00", "sw_market", [[140, 540], [380, 540], [300, 560]]), slot("12:00", "13:00", "sw_cafe", [[330, 540], [200, 520]]), slot("13:00", "17:00", "sw_harbour", [470, 470], {act: "crab", dir: -1}), slot("17:00", "19:00", "sw_beach", [[220, 440], [300, 480]])],
    ["Smoked bacon. That's the secret. Unsmoked and they just laugh at you.", "Nan says I'll have the market one day. I'd rather have a boat. Don't tell her.", "There's a crab under the third step with one big claw. I call him Lefty. He's never been caught.", "I found a golden ammonite once. Gave it to Nan. She keeps it by the till and pretends it's not her favourite thing."],
    "Jack. I'm meant to be shovelling ice, but if you want to go crabbing later, I'll show you the spot. Bacon's on me.", "Jack's down on the scar somewhere, looking for fossils."),
  // Alfie: seventy-four, the last keeper on the north-east coast with a light that's still wound by hand. Thirty-nine
  // years, never missed a dusk. He writes everything in the ledger, the weather and every boat out and home, in the
  // same fountain pen.
  P("swalfie", "Alfie", "Keeps Saltwick's lighthouse, and writes every boat in his ledger", {skin: "#E8C2A0", hair: "#E6E2DA", hairStyle: "short", top: "#2E3A5A", sleeves: "#2E3A5A", bottom: "#3A3430", hat: "cap"},
    [slot("8:00", "12:00", "sw_harbour", [[466, 300], [470, 420], [462, 360]]), slot("12:00", "14:00", "sw_cafe", [100, 540], {act: "sit", dir: 1}), slot("14:00", "15:00", "sw_harbour", [[466, 300], [470, 420]]), slot("15:00", "22:00", "sw_lighthouse", [150, 380], {dir: 1})],
    ["Thirty-nine years, and I've never missed a dusk. Not once. Not even the night of the big snow.", "Every boat out, every boat home. It goes in the ledger. That way nobody's ever forgotten.", "They wanted to make her automatic. I said, over my dead body. They said, well, quite. We agreed to wait.", "Green light, every five seconds. Any sailor from here to Norway knows that's Saltwick.", "A clean lens is a kindness. To somebody you'll never meet, out there in the dark."],
    "Alfie, keeper of the light. Come up at dusk, if you like, and help me light her. I could use a younger pair of knees on those stairs.", "Alfie's up in the lamp room. You can see him, a little shape at the top, polishing.",
    {hellos: ["Fresh wind, backing west. Good to see you.", "There you are. The ledger's been asking after you.", "Mind how you go on the wall. It's slippy at the end."]}),
  // Nell: fifties, came from Leeds for a long weekend twenty years ago, met the café's old owner, and stayed.
  // Knows everyone's order. Feeds the harbour cat when she thinks nobody's looking. Everyone's looking.
  P("swnell", "Nell", "Runs the quay café. Came for a weekend twenty years ago and stayed", {skin: "#EAC4A0", hair: "#8A4A3A", hairStyle: "curly", top: "#C9483A", bottom: "#2F2B28", extra: "apron"},
    [slot("8:00", "17:00", "sw_cafe", [404, 314], {dir: -1}), slot("17:00", "19:00", "sw_wynds", [[262, 300], [262, 486]])],
    ["Jam first, then cream. I'll hear no arguments in this café.", "I came for a long weekend in 2006. I'm still here. The weekend's going very well.", "Crab sandwich, brown bread, lemon. Anything else is showing off.", "The cat? I don't feed the cat. (I feed the cat.)", "Tea's the answer. I don't always know what the question is, but tea's the answer."],
    "Hiya, love! Sit anywhere. Window seat's the best: you can see the boats come in. I'll bring you a pot.", "The café's shut. Nell's walking on the clifftop, like every evening."),
  P("swwalter", "Walter", "Has the chandlery. Nothing's been thrown away since 1931", {skin: "#E2B590", hair: "#9A928A", hairStyle: "short", top: "#5E6A4A", bottom: "#3A3430", extra: "glasses"},
    [slot("9:00", "17:30", "sw_chandlery", [260, 290], {dir: 1})],
    ["My grandad made that ship in a bottle. He never told anyone how. Took it with him, the old devil.", "Ganseys: every village had its own pattern. If a man was lost at sea, they'd know him by his jumper.", "Rope, string, twine and cord. They're all different. Don't let anyone tell you otherwise.", "A brass lamp lasts a hundred years. Polish it on a Sunday."],
    "Walter. Ring the bell if I'm in the back. Have a look round: if we haven't got it, you don't need it.", "The chandlery's shut. There's a note on the door: BACK IN A BIT. It's been there since Tuesday."),
  P("swsid", "Sid", "Smokes the kippers. Up at four, oak and herring and patience", {skin: "#C99A78", hair: "#3A3430", hairStyle: "short", top: "#3A3430", bottom: "#5A4A3E", extra: "apron"},
    [slot("6:00", "14:00", "sw_smokehouse", [260, 270], {dir: 1}), slot("14:00", "16:00", "sw_wynds", [[300, 420], [262, 380]])],
    ["Sixteen hours in the smoke. Not fifteen. Not seventeen. The smoke knows.", "Oak. Only oak. Somebody once asked me about beech. I didn't speak to him for a year.", "A kipper should be the colour of an old penny, and shine.", "My eyes are watering? No, it's the smoke. Always the smoke."],
    "Sid. Kippers. That's it, that's the whole business. Mind your coat: you'll smell like a bonfire till next week.", "Sid's gone home to sleep. He's back at four in the morning to light the oak."),
  // visitors
  T("swpriya", "Priya", "Walking the whole coast path, a bit at a time", {skin: "#B9825E", hair: "#1E1A18", hairStyle: "long", top: "#C9483A", bottom: "#3E5E7A", extra: "satchel"},
    [slot("9:00", "11:00", "sw_clifftop", [[220, 300], [330, 560], [400, 260]]), slot("11:00", "12:00", "sw_wynds", [[262, 220], [250, 560]]), slot("12:00", "13:30", "sw_cafe", [[200, 520], [330, 540]]), slot("13:30", "16:00", "sw_beach", [[300, 260], [260, 380]]), slot("16:00", "17:00", "sw_lighthouse", [[330, 540], [200, 540]])],
    ["Six hundred and thirty miles of coast path. I've done forty-one. It's not a race.", "The steps nearly finished me. The view finished me off properly.", "Every village has a chip shop that claims to be the best. I'm testing them all. For science."],
    "Priya! I'm walking the coast path, a weekend at a time. Saltwick's my favourite so far. Don't tell Robin Hood's Bay."),
  T("swamara", "Dr Okafor", "A geologist, on her holidays (looking at rocks anyway)", {skin: "#8A5A3E", hair: "#1E1A18", hairStyle: "bun", top: "#7A8A5A", bottom: "#5A4A3E", extra: "glasses"},
    [slot("8:30", "12:30", "sw_beach", [200, 460], {act: "crouch", dir: 1}), slot("12:30", "14:00", "sw_cafe", [[330, 540], [200, 520]]), slot("14:00", "16:30", "sw_clifftop", [[180, 380], [250, 440]])],
    ["Jurassic. Lower Jurassic, to be precise. One hundred and eighty million years, give or take a Tuesday.", "The golden ones are pyrite. Fool's gold. Not a fool's find, though.", "The cliff's falling into the sea a few inches a year. Every storm, new fossils. It's very exciting. Sorry."],
    "Dr Okafor. Geologist. I'm meant to be on holiday. I've filled two bags with rocks. My husband's not speaking to me."),
  T("swtom", "Tom", "Birdwatching on the clifftop", {skin: "#F2D3BC", hair: "#6B5A4A", hairStyle: "short", top: "#4E6A4A", bottom: "#5A4A3E", hat: "cap"},
    [slot("7:00", "11:00", "sw_clifftop", [300, 260], {act: "binoculars", dir: -1}), slot("11:00", "12:00", "sw_chandlery", [[200, 520], [330, 520]]), slot("12:00", "16:00", "sw_clifftop", [300, 260], {act: "binoculars", dir: -1})],
    ["Gannet! Folding up and dropping like a dart. Oh, that's beautiful.", "Puffins, in the summer, out on the rocks. You want Puffin Isle for proper numbers.", "Kittiwakes. They say their own name. Kitti-waaake. Listen."],
    "Tom. I watch birds. Mostly gulls, if I'm honest. But sometimes, a gannet."),
  T("swgraham", "Graham", "On a day out with his wife, June (and their dog)", {skin: "#EAC4A0", hair: "#D6D0C6", hairStyle: "short", top: "#C9A27E", bottom: "#3A3430"},
    [slot("10:00", "11:00", "sw_smokehouse", [[200, 540], [330, 540]]), slot("11:00", "12:00", "sw_market", [[200, 540], [330, 560]]), slot("12:00", "14:00", "sw_harbour", [[150, 280], [240, 260]]), slot("14:00", "16:00", "sw_cafe", [330, 520], {act: "sit", dir: -1})],
    ["We come every year. Same café, same table, same crab sandwich. June says I'm boring. June has the same sandwich.", "Forty-two years married, and she still steals my chips.", "Kippers for the freezer. Six pairs. June says that's too many. June's wrong."],
    "Graham. That's June over there telling the dog off. We've been coming here since 1983.")
];
