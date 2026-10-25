// Messages in bottles (round 288, Mel: "can I occasionally get messages floating in a glass bottle in the sea? They're
// sometimes poems, sometimes affirmations, sometimes letters/musings from strangers. All have dates"). One washes up
// on a bottom-row beach every few days (game/south.js); each is read once, in order of the day's luck, then kept in
// the mailbox to read again. kind: poem, kind (an affirmation) or letter. British spelling, no long dashes.
export const BOTTLES = [
  {kind: "poem", date: "3 August 1962", from: "Ruth, aged 9, Whitby", text: "Little bottle, ride the tide,\ncarry this from side to side.\nWhoever finds you, far or near,\nI hope the sun is shining there."},
  {kind: "kind", date: "1 January 2020", from: "", text: "You are allowed to rest. The tide doesn't hurry, and it still gets everywhere."},
  {kind: "letter", date: "16 July 1973", from: "Susan (aged 11)", text: "To whoever finds this,\n\nHello! I am on holiday in a caravan at Robin Hood's Bay and it has rained for six days. We have played Monopoly fourteen times. My uncle is winning and nobody is speaking to him.\n\nIf it is sunny where you are, please enjoy it for me."},
  {kind: "poem", date: "21 March 1994", from: "", text: "The sea keeps nothing it is given.\nIt turns it over, sand and shell,\nand hands it back a little smoother.\nI hope it does the same for me."},
  {kind: "kind", date: "14 February 2015", from: "a stranger who means it", text: "Whoever you are: you are doing better than you think. Truly."},
  {kind: "letter", date: "22 June 2014", from: "Priya", text: "Today I left a job in an office with no windows and bought a little boat. I don't know how to sail it yet. I'm learning.\n\nIf you've been thinking about doing something brave, this is your sign."},
  {kind: "poem", date: "9 October 2011", from: "Kenji, on the harbour wall", text: "Low tide, autumn light.\nA heron stands so still that\nthe sea forgets him."},
  {kind: "letter", date: "30 October 1999", from: "Grandpa Joe", text: "My grandson and I made this boat out of a bottle, with a sail cut from a crisp packet. He says it will get to America.\n\nI haven't the heart to tell him we're facing the wrong way."},
  {kind: "kind", date: "6 June 1998", from: "", text: "Small steps still go somewhere. Ask any crab."},
  {kind: "letter", date: "7 December 1966", from: "Ivy", text: "Snow on the beach this morning, the first time in my life. The dog didn't know what to make of it. Neither did I.\n\nI wanted to tell somebody. Now I have."},
  {kind: "poem", date: "30 May 1979", from: "M.", text: "Gulls on the harbour wall,\nbread in my pocket,\na whole Saturday ahead\nand nobody needing me for anything.\nBliss."},
  {kind: "letter", date: "18 August 2009", from: "Lily", text: "Dear Somebody,\n\nI just saw a dolphin! A real one! Nobody else on the boat saw it so I'm telling you. It was grey and it smiled at me."},
  {kind: "kind", date: "25 November 2008", from: "", text: "Today, be as kind to yourself as you would be to a friend who'd had a long week."},
  {kind: "letter", date: "1 May 1958", from: "Margaret and Tom", text: "We were married this morning in the little church on the cliff, and we're throwing this off the end of the pier for luck.\n\nIf you find it, have a lovely day on us."},
  {kind: "poem", date: "12 January 2003", from: "", text: "Winter sea, grey as a slate roof,\nand still the boats go out.\nBrave little things,\nwith their lights on."},
  {kind: "letter", date: "12 September 1990", from: "a pebble collector", text: "Found a perfect round pebble today, the kind you wish on. I wished that everyone who reads this has a really good cup of tea within the hour.\n\nDid it work?"},
  {kind: "kind", date: "19 April 2023", from: "", text: "You don't have to do it all today. Pick one thing. Do it gently. Then have a biscuit."},
  {kind: "letter", date: "5 April 2012", from: "Becky", text: "My nan's scone recipe, because it's too good to keep to myself:\n\n8oz self-raising flour, 2oz butter, a pinch of salt, a spoon of sugar, a splash of milk. Hot oven, twelve minutes.\n\nJam first. Fight me."},
  {kind: "poem", date: "17 July 2019", from: "Ollie, aged 7", text: "I drew a whale in the sand\nand the sea took it home.\nI think it liked it."},
  {kind: "letter", date: "20 June 1947", from: "W. H.", text: "Midsummer's Eve. The fishing fleet is all lit up out in the bay like a string of pearls.\n\nI wish you could see it. Perhaps you can, wherever you are."},
  {kind: "kind", date: "8 August 1988", from: "", text: "Something good is on its way to you. Maybe this bottle was it. Maybe it's tomorrow."},
  {kind: "letter", date: "9 November 2016", from: "Tom, aged 8", text: "Do you think the sea gets bored of being blue?\n\nI like to think it enjoys the grey days too. Like a day off."},
  {kind: "letter", date: "4 September 1985", from: "a retired schoolteacher", text: "Dear Finder,\n\nI have thrown one of these into the sea on every birthday for forty years. Not one has ever come back. If you're reading this, do write to me at"},
  {kind: "poem", date: "23 September 1971", from: "", text: "September, and the beach\nbelongs to dogs again.\nThey run like they've been\nwaiting all summer."},
  {kind: "kind", date: "3 March 2017", from: "", text: "Breathe in for four, out for six. There. The sea does it all day long."},
  {kind: "letter", date: "15 March 1982", from: "Alan", text: "This bottle once held ginger beer, very good ginger beer, from the shop on the corner of Harbour Street.\n\nNow it holds a hello. Hello!"},
  {kind: "letter", date: "28 December 2024", from: "Anna", text: "That week between Christmas and New Year when nobody knows what day it is. Walked the beach in a new hat. It felt like the first page of a fresh notebook.\n\nI hope your year is a good one."},
  {kind: "kind", date: "11 May 2006", from: "", text: "You are exactly where you need to be. Even if it feels like the wrong bus."},
  {kind: "letter", date: "3 June 2005", from: "Sam", text: "If this reaches France, bonjour! If it reaches Norway, hei! If it's only washed up round the corner, hello, neighbour."},
  {kind: "poem", date: "2 February 2010", from: "", text: "Snowdrops by the lighthouse,\nfrost on the rail.\nThe kettle's on somewhere.\nIt always is."}
];
// what Mel thinks, now and then, after reading (the schoolteacher's address has washed away)
export const BOTTLE_AFTER = {22: "The rest has washed away, ink and all. She sounds lovely. You hope someone else's bottle reached her."};
