// Backstories (round 104): each storied villager tells you their story over time, a chapter at a time, in their
// speech bubbles (game/stories.js decides when: at most two tellers a day, so days or weeks can pass between
// chapters). So every chapter stands on its own: from the second chapter on, the first bubble gently re-anchors, in
// the teller's own voice, naming who or what it's about and where they left off ("That letter for 'H.' I never
// delivered…"), never a bare "it" or "she" that only made sense last time. The "Stories so far" tab in the friendship
// panel (storiesHTML) keeps the full record.
// The threads tie together: the old chocolatier at the bay (Marchand & Fille, now your Cocoa Room) runs through
// Celeste, Marco, Bo, Mateo and Opal; Okada's undelivered letter is Hana's, and his grandmother's tea scoop is with
// Sachiko in Kyoto; Juniper is the Gazette's secret poet and Theo has been collecting her poems; Elena and Tomi once
// sat two desks apart in the city (Posy has views); Felix's first bees swarmed in the orchard's apple tree, which is
// Farid's; Wren is Bo's niece; Pilar's mother was Doña Carmen's Sunday girl in Ronda; Pilar fixes Sofia's nonna's
// fior di latte; Ines's great-great-grandad Tomás planted the valley's first olive and carved the mill's beam.
// A chapter: {lines: [bubble, ...], needs: [gate, ...], reward}
//   gates: "cocoa" / "cellar" (big goals owned), "mill" (the old mill opened), "oil" (a first bottle pressed there),
//   "trust1" (Trusted hand at the farm), "fish5" (five kinds in the fish journal), "bouquet" (a bouquet in the
//   backpack), "ronda2" (a second day in Ronda), "tiles4" (four of Lucía's tiles), "<npc>:<n>" (you've heard n of
//   that villager's chapters)
//   rewards: see game/stories.js REWARDS
export const STORIES = {
  celeste: [
    {lines: ["You know the building down at the bay, the one that's your Cocoa Room? Before all that, it had a name.", "Marchand & Fille. My grandfather Henri's chocolaterie."]},
    {lines: ["I told you about Marchand & Fille, Grand-père Henri's chocolate shop at the bay. Let me tell you how it began.", "He opened it in 1962. Copper pots, a marble slab, and a queue out the door on Sunday mornings.", "I used to sit under the counter eating the broken bits."]},
    {lines: ["After Grand-père Henri, the chocolate shop at the bay went to my mother, Margaux.", "That's the 'Fille' in Marchand & Fille: and daughter. She was the best temperer on the whole coast."]},
    {lines: ["Maman, Margaux, the best temperer on the coast: when she died, my brothers in Lyon wanted to sell the shop.", "To a developer. Flats, they said. I couldn't run it. And I couldn't sell it.", "So Marchand & Fille just waited. Nine years, boarded up."]},
    {needs: ["cocoa"], lines: ["Grand-père's old shop at the bay, nine years boarded up? Yesterday I walked past and smelled chocolate again. I had to sit down.", "Here: Grand-père Henri's recipe book. It belongs in that kitchen. With you."], reward: "henri"},
    {lines: ["One more thing about Maman, Margaux. She always said wine and chocolate are old friends.", "Ask Marco, up at the vineyard, why. He'll pretend he doesn't know."]}
  ],
  marco: [
    {lines: ["Forty summers on these vines. The first rows I planted with my own two hands, at twenty."]},
    {needs: ["celeste:6"], lines: ["Celeste sent you, didn't she, asking about wine and chocolate. She means her mother. Margaux Marchand.", "Margaux would bring chocolate up to the vines at harvest. We ate it with the new red, sitting on the barrels."]},
    {lines: ["Margaux Marchand, from the chocolate shop. There's more to that story.", "We were sweethearts, one summer. Then she went to Lyon to train, and I stayed with the vines.", "When she came back she was the 'Fille' at the shop, and I was 'that boy from the vineyard'. Best friends, ever after."]},
    {lines: ["Margaux and me, best friends ever after. So the very first red from these vines, I named it Margaux.", "She laughed until she cried."]},
    {lines: ["That first red I named for Margaux: I kept one bottle. Margaux, 1984.", "It belongs in your cellar, not under my bed. Open it on a good day."], reward: "margaux"}
  ],
  okada: [
    {lines: ["Forty years a postman, and I delivered every letter but one."]},
    {lines: ["That one letter I never delivered: it came the winter of my first year.", "Addressed only to 'H., the seaside town'. No street. No town I knew."]},
    {lines: ["The letter for 'H., the seaside town', the one I could never deliver? I kept it in my desk all these years.", "You don't throw away somebody's words."]},
    {needs: ["hana:2"], lines: ["My undelivered letter, the one for 'H., the seaside town'. I think I know who H. is.", "Hana says she grew up in a seaside town. Her father was a fisherman.", "And the letter's postmark is a fishing harbour."]},
    {lines: ["The forty-year letter, for 'H.': I gave it to Hana this morning.", "My hands were shaking more than hers."]},
    {lines: ["Hana's letter, the one I kept in my desk forty years: it was from her father.", "Written before he went to sea and didn't come back. Forty years late.", "She hugged me. Then she gave me toast. I believe that's how Hana says thank you."]},
    // round 122: Sachiko in Kyoto kept his grandmother's tea scoop
    {needs: ["sachiko:3"], lines: ["This is my grandmother's tea scoop, from her lane in Kyoto. Sachiko kept it? All these years?", "Grandmother taught half the lane. She'd be glad it was you who brought it. Thank you. Truly."]}
  ],
  hana: [
    {lines: ["I grew up by the sea, love. My father had a little blue boat.", "He'd bring home fish, and I'd make the toast."]},
    {lines: ["My father, with the little blue boat? He went out one winter and didn't come back.", "I was eight."]},
    {needs: ["okada:5"], lines: ["You know my father never came back from the sea. Well. Mr Okada gave me a letter.", "From my father. Forty years in a drawer, and it still smelled of the sea."]},
    {lines: ["My father's letter, the one Mr Okada kept forty years: he wrote that he'd teach me to sail that summer.", "So I've decided I'm going to learn anyway.", "And I made something new. Postman's toast: honey, butter, a pinch of sea salt. Here, first ones are yours."], reward: "toast"}
  ],
  juniper: [
    {lines: ["Can you keep a secret? The poems in the Gazette, signed 'J.'? Don't look at me like that."]},
    {lines: ["About those Gazette poems signed 'J.'. Still a secret, yes?", "I write them here at the library, before it opens. The building's quietest then. Just me and the radiators."]},
    {needs: ["theo:2"], lines: ["My secret Gazette poems: I think someone's found me out.", "Someone's been leaving pressed flowers in the poetry section. Right where the next poem goes."]},
    {lines: ["The pressed flowers in the poetry section, the ones left where my next poem goes? I know who it is.", "It's Theo. Of course it's Theo. He has a rubber stamp that says 'pressed'."]},
    {lines: ["So Theo knows I'm 'J.' now, and I've gone and agreed to something.", "We're doing a reading at the night market. Lior's making the lanterns. I'm terrified. You'll come?"]}
  ],
  theo: [
    {lines: ["I keep the village records. Births, weddings, who owns which hedge.", "And the Gazette's poems, the ones signed 'J.', in my album."]},
    {lines: ["Those Gazette poems signed 'J.', in my album: whoever writes them writes about the well like an old friend.", "I've started leaving them pressed flowers. Is that strange?"]},
    {needs: ["juniper:3"], lines: ["The pressed flowers I was leaving for 'J.'? Juniper caught me at it, in the poetry section.", "I said I was cataloguing. She laughed for a full minute."]},
    {lines: ["Since Juniper caught me with the pressed flowers, we have tea in the trophy room.", "She reads, I stamp. Best part of my day."]},
    {needs: ["juniper:5"], lines: ["Juniper's poetry reading at the night market: it's on a Thursday night. Officially.", "I've reserved the front row. And the second row. For nerves."]}
  ],
  bo: [
    {lines: ["See that carved sign in the corner of the workshop? 'Marchand & Fille', the old chocolate shop at the bay.", "Made it the year I left school. *hums*"]},
    {lines: ["That old 'Marchand & Fille' sign in my workshop: when the chocolate shop closed, Celeste couldn't look at it.", "So I kept it. Oiled it every spring."]},
    {needs: ["cocoa", "celeste:5"], lines: ["The Marchand & Fille sign, the one I've oiled every spring? I've sanded it back.", "It's going up over your Cocoa Room door, if you'll have it."], reward: "sign"},
    {lines: ["Now the old sign's up over your door, other news. My niece Wren's back from the city.", "Ranger, now. I built that cabin in the woods for her gran, you know."]}
  ],
  wren: [
    {lines: ["My gran was the ranger before me. She planted the chestnut tree by the foraging patch."]},
    {lines: ["Gran, the ranger before me? Uncle Bo built the cabin and the lookout for her.", "I slept up in the lookout every summer."]},
    {lines: ["After all those summers in Gran's lookout, I went off to the city. Ten years. Offices.", "I missed the sound of the waterfall every single day."]},
    {needs: ["fish5"], lines: ["Five kinds of fish in your journal? Then you've earned a ranger secret.", "The golden koi on your river come up at dusk, when the water's still.", "Cast slow. Wait longer than feels right."], reward: "koi"}
  ],
  mateo: [
    {lines: ["My abuela Rosario worked at the old chocolate shop at the bay, Marchand & Fille.", "Margaux's tempering girl, at sixteen."]},
    {lines: ["Abuela Rosario, Margaux's tempering girl at the chocolate shop? She came home smelling of cocoa every day.", "That's why I study food science. I wanted to know why chocolate snaps."]},
    {needs: ["cocoa", "celeste:5"], lines: ["Abuela Rosario, who tempered at Marchand & Fille: I told her I work in the same kitchen now, boss.", "She cried. She's coming to visit. She says the marble slab had better still be there."]}
  ],
  opal: [
    {needs: ["cocoa"], lines: ["Can I tell you something, now the old chocolate shop at the bay is yours?", "I've paid the rates on that building for nine years."]},
    {lines: ["Those nine years I paid the rates on the old chocolate shop: developers kept calling the bank.", "I kept saying 'not for sale'. Technically it was Celeste's brothers' call. Technically."]},
    {lines: ["You're wondering why I paid the rates on Marchand & Fille all those years. Margaux opened my first savings account.", "With a chocolate coin. Some debts aren't on paper."]}
  ],
  felix: [
    {lines: ["My first bees? A swarm that landed in the old apple tree in the orchard.", "I was twenty, terrified, with a cardboard box."]},
    {lines: ["That swarm from the orchard's apple tree became my first hives. Farid still says it's the orchard's blossom honey, not mine.", "Technically, the bees agree with him."]},
    {needs: ["farid:2"], lines: ["Farid and I, still arguing over whose honey it is? Well. He gave me a pruning tip for the orchard.", "It worked. The orchard's buzzing. Don't tell him I said he was right."]}
  ],
  elena: [
    {lines: ["Before cheese, I was a banker. In the city. Grey suits, grey coffee."]},
    {lines: ["Back in my banking days in the city, Tomi sat two desks down. Tomi from the mill, yes.", "He used to bring me egg tarts on Fridays."]},
    {lines: ["I never told you how I got out of banking. I left the week I cried at a spreadsheet.", "Bought two goats with my bonus. Best trade I ever made."]},
    {needs: ["tomi:2"], lines: ["Tomi, my old desk neighbour from the bank: he came up on Saturday to help in the dairy.", "He's terrible at milking. He's very good at laughing about it."]}
  ],
  tomi: [
    {lines: ["You know Elena, from the farm? We sat two desks apart in the city, before I came home to the mill."]},
    {needs: ["elena:3"], lines: ["Elena and me, two desks apart in the city? She left first. Then me.", "Best thing either of us did. Olives don't send emails."]},
    {lines: ["Since Elena and I both quit the city, Posy says I should 'explore the feeling'.", "So I'm exploring it. On Saturdays, at Elena's. With a milking stool."]}
  ],
  posy: [
    {lines: ["Tomi at the mill pretends he never misses the city. I've read three books about people like Tomi."]},
    {needs: ["tomi:2"], lines: ["Tomi, who pretends he doesn't miss the city? I gave him some advice.", "You don't have to choose. Press olives in the week, milk goats on a Saturday. That's psychology."]}
  ],
  mei: [
    {lines: ["My mother used to sing to the roses. I thought everybody did."]},
    {lines: ["My mother, the one who sang to the roses: when she died, I came to the flower farm every day.", "Everyone said the flowers needed me. I think I needed them."]},
    {lines: ["I come to the flowers for my mother, you know. Every year on her birthday I take her a bouquet.", "This year… would you bring me one? Any kind."]},
    {needs: ["bouquet"], lines: ["A bouquet for my mother's birthday. You brought one! Tulips were her favourite.", "Thank you. Really."], reward: "bouquet"}
  ],
  noor: [
    {lines: ["I used to run a rescue in the city. Thirty animals, one tiny yard."]},
    {lines: ["My old rescue in the city, thirty animals in one tiny yard? The landlord sold the building.", "I found homes for every single one. Then I cried for a week."]},
    {needs: ["trust1"], lines: ["Ever since I lost my rescue in the city, I've wanted another. And guess what?", "Elena says there might be room in the barn for a little rescue corner one day. Imagine!"]}
  ],
  pilar: [
    {lines: ["You've met Tomo? My nephew. My sister's boy.", "Eats like a horse, works like one too."]},
    {lines: ["Cooking runs in my family, not just eating like Tomo. My mother cooked for a whole village in Andalucía.", "I'm doing the same, one plate at a time."]},
    {needs: ["sofia:2"], lines: ["Sofia at the Scoop Shack, with her nonna's fior di latte? She's been whipping it to death.", "I told her: let the milk be milk."]},
    // round 107: Doña Carmen, in Ronda, knew Pilar's mother
    {needs: ["carmen:3"], lines: ["Doña Carmen sent me a kiss? From Ronda?", "She was my mother's best friend. Mamá used to say Carmen's yemas were the only sweets worth the sugar.", "I'm making Mamá's salmorejo tonight. For both of them."]}
  ],
  // round 120: Ines is Tomás Ruiz's great-great-granddaughter. He came with the railway in 1912 from a village near
  // Ronda and planted an olive cutting by the windmill; his initials are on the mill's beam
  ines: [
    {lines: ["My great-great-grandad Tomás came with the railway. Laid the track from the coast, sleeper by sleeper.", "He meant to go home to Spain when it was done. He met my great-great-grandma at the station tea room instead."]},
    {lines: ["Great-great-grandad Tomás, who laid the railway? He carried a cutting from his grandfather's olive tree the whole way.", "In his pocket, wrapped in a wet handkerchief. Everyone said an olive would never grow here.", "He planted it by the windmill anyway. Stubborn. It runs in the family."]},
    {lines: ["Tomás's olive, the one he planted by the windmill? It's still there. My abuela takes a cutting from it every spring.", "See the trees on the top terrace? Half the olives in this valley are that tree's grandchildren. Including yours, probably."]},
    {needs: ["mill"], lines: ["You opened up the old mill! Did you see the initials on the beam? T.R. That's Tomás, my great-great-grandad!", "Family story: he carved them the day the millstone stopped, and said one day it would turn again, for olives."]},
    {needs: ["oil"], lines: ["I took a bottle of your oil to Abuela: olives from Tomás's tree's grandchildren, pressed in his own mill.", "She cried into her bread. Then she ate the bread.", "She sent this. Tomás carved it from a branch of that tree in 1913. It should live with the oil now."], reward: "spoon"},
    {needs: ["ines:5"], lines: ["Ever since that bottle of your oil, Abuela's been baking her olive oil cake again, the one from Tomás's village.", "She said I could give you the recipe. That's basically a royal decree."], reward: "oilcake"}
  ],
  // Kyoto's locals (round 122), told on a day trip like Ronda's. Sachiko and Okada: his grandmother taught her the tea ceremony
  sachiko: [
    {lines: ["I learned the tea ceremony from an old lady on this lane. Okada-sensei.", "She rapped my knuckles with a fan when I rushed."]},
    {lines: ["Okada-sensei, my old tea teacher on this lane: her grandson went across the sea to deliver letters, they said.", "She was so proud. She kept his postcards by the kettle."]},
    {needs: ["okada:1"], lines: ["Okada? The postman in your village? A tall man who never throws anything away?", "Then he is Okada-sensei's grandson. Please give him this: his grandmother's tea scoop.", "I've kept it forty years. It should go home."], reward: "chashaku"},
    {lines: ["Okada-sensei had a saying. Now that her tea scoop is going home with you, it's yours too.", "One meeting, one chance. She used to say it every time I left. I say it to you now."]}
  ],
  joshin: [
    {lines: ["I sold insurance in Tokyo for eleven years. Very good at it. Very unhappy."]},
    {lines: ["Eleven years selling insurance in Tokyo! Here's how it ended.", "One morning on the train I couldn't remember the last time I'd looked at the sky. I got off. I came here. I never went back."]},
    {lines: ["When I turned up here, straight off that Tokyo train, my teacher made me rake the gravel garden for a year before I was allowed to sit.", "Best year of my life."]},
    {lines: ["Eleven years of insurance, one year of raking gravel. And now, here's my secret.", "Every morning I'm terrible at meditation. Then I laugh. Then I'm a little better."]}
  ],
  tanaka: [
    {lines: ["My great-grandfather opened this shop in 1921. The wooden moulds on the wall are his."]},
    {lines: ["My great-grandfather's moulds make most of our sweets. But there is one I make only one day a year: the first snow.", "White, round, a little cold. My father taught me on the day he retired."]},
    {lines: ["Four generations in this shop, and now my daughter wants to make chocolate wagashi. Chocolate! My father would faint.", "...I tried one. It was very good. Don't tell her."]}
  ],
  // Ornella (id "jason"): the retired ferry captain in Vernazza; told on a trip day, one a day
  jason: [
    {lines: ["The first ferry I ever captained, I was twenty-nine and the only woman in the harbour office. The old men took bets on how long I'd last.", "Thirty-one years. I outlasted the bets, the old men, and two ferries."]},
    {lines: ["Thirty-one years on the ferry, and now I'm on shore leave. Every morning I climb Corniglia's steps and count them out loud.", "People pretend not to know me. Let them. At my age, every step is a little flag on a summit."]},
    {lines: ["You've heard me boast about the ferry. Here's the night I'm proudest of: the big storm, eleven years ago.", "The engine died outside the harbour mouth. A boy of sixteen went down into the engine room with a torch in his teeth.", "He got it going again, then was sick in a bucket. That was Dario. I made him my engineer on the spot."]},
    {lines: ["Ferries, steps, Dario: you've had my stories. Now my verses. Every morning, the same table, a coffee, four lines in my notebook.", "Most of them are dreadful. About one a month is all right. This one's all right. It's for you.", "Don't read it here, I'll go red. Read it on the train."], reward: "poem"},
    {lines: ["After all my stories, I've decided what happiness is.", "A window over a harbour. A swim before breakfast. Somebody who brings you coffee without being asked.", "And a friend from far away who comes back to visit. I have all four today. Imagine that."]}
  ],
  // Ronda's locals (round 107): told on a day trip (no quest needed; the two-a-day limit still holds)
  carmen: [
    {lines: ["I learned the yemas from the nuns at the convent when I was nine, guapa. They paid me in sugar."]},
    {lines: ["Sixty years of yemas, and one customer I never forgot. A girl, Rosario, who came to my shop every Sunday. She cooked like an angel.", "She went north, to a little village, and cooked for everyone. I never saw her again."]},
    {needs: ["pilar:2"], lines: ["Pilar? A cook called Pilar, in your village? Her mother was from Andalucía?", "¡Ay! Rosario's girl! My Sunday girl who cooked like an angel! Tell her Doña Carmen sends a kiss. And take her these."], reward: "carmen"},
    {lines: ["Rosario's girl, found after all these years! And the nuns who taught me the yemas are getting old.", "Soon nobody will turn the wheel at the convent. Maybe I'll learn their biscuits too. At my age! Why not."]}
  ],
  rafael: [
    {lines: ["My grandfather pressed the olives with a donkey. I have a machine. The donkey was better company."]},
    {needs: ["ronda2"], lines: ["Five generations pressing olives in this valley, and my son wants to be a DJ. In Málaga. A DJ!", "Who will press the oil?"]},
    {needs: ["rafael:2"], lines: ["My son, the one who wants to be a DJ in Málaga? He came home for the harvest.", "He put music on in the mill, very loud. The olives didn't mind. Neither did I. Don't tell him."]}
  ],
  lucia: [
    {lines: ["My grandmother painted the tiles round the fountain in the plaza. I fix them when the frost cracks one."]},
    {lines: ["Besides my grandmother's fountain tiles, I'm painting every view in Ronda.", "Two hundred and eleven views. I'll never finish. That's the good part."]},
    {needs: ["tiles4"], lines: ["Four of my Ronda views on tiles! You're nearly a whole set. Where will they go?", "A bench by a pond in Honeybrook? Send me a photo. Then I'll paint Honeybrook. View two hundred and twelve."]}
  ],
  manolo: [
    {lines: ["I had a band once, in Sevilla. Five of us in a van. Then I came home.", "The fountain has better acoustics. And it never asks for a bigger share."]},
    {lines: ["Since my band days in Sevilla, I've played this fountain to a lot of clapping. Most of it on the wrong beats.", "The lady who danced here the day you came by? She claps on the right beats. Nobody claps on the right beats."]},
    {lines: ["The fountain beats a van in Sevilla for writing songs, too. Here, this one's new.", "I wrote it about the vultures. It's slow. They're very patient birds."]}
  ],
  sofia: [
    {lines: ["My nonna had a gelato cart in Napoli. This little book is all her recipes."]},
    {lines: ["Nonna's recipe book, from her gelato cart in Napoli? There's one I can't get right. Her fior di latte.", "It's only milk and sugar, and I keep ruining it."]},
    {needs: ["pilar:3"], lines: ["Nonna's fior di latte, the one I kept ruining? Pilar fixed it! 'Let the milk be milk.'", "Here, taste. Nonna would cry."], reward: "nonna"}
  ],
  farid: [
    {lines: ["I trained in my uncle's bakery. Up at four, flour in my eyebrows."]},
    {lines: ["After all those four o'clock starts in my uncle's bakery, I came here for one summer of fruit picking.", "That was six summers ago."]},
    {lines: ["My uncle's pastries, from the bakery where I trained? I made them for Pilar, with Felix's honey and the orchard's pistachios.", "She's putting them on the tapas menu!"], reward: "pastry"}
  ],
  // Phase 4: Ada the haberdasher and Idris the tailor, Makers' Lane. Ada's jar of buttons; Idris's first suit.
  ada: [
    {lines: ["See the button jar on my counter? Every button in it came off something somebody loved.", "My mother started it. She ran a haberdashery by the sea, with a bell over the door."]},
    {lines: ["The button jar I told you about, my mother's: the oldest one is a brass button off a sea captain's coat.", "She swapped him a whole bolt of serge for it. She said it was the best bargain of her life."]},
    {lines: ["My mother's shop by the sea, the one with the bell? It closed the winter I turned twenty.", "I kept the bell, the scissors and the jar. That's this shop, really. Just further from the sea."]},
    {lines: ["That brass button, the sea captain's, from the bottom of the jar: I want it to go on something you wear.", "Don't argue. Buttons should be worn, not kept. Take it to Idris."], reward: "seabutton"}
  ],
  idris: [
    {lines: ["The first thing I ever made was a suit for my grandfather. I was fourteen. The sleeves were different lengths."]},
    {lines: ["My grandfather's suit, the one with the odd sleeves: he wore it to every wedding for thirty years.", "He said the short arm was for shaking hands and the long one was for dancing."]},
    {lines: ["After that suit for my grandfather, I went to a tailor in the city to learn properly. Five years of buttonholes.", "Then the lane had an empty house and a door with a step that suited me."]},
    {lines: ["When my grandfather died, that suit with the odd sleeves came back to me. It hangs at the end of my rail.", "I've never taken the sleeves up. Some mistakes should be kept exactly as they are."]}
  ]

};
