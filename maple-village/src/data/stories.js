// Backstories (round 104): each storied villager tells Mel their story over time, a chapter at a time, in their
// speech bubbles (game/stories.js decides when). The threads tie together: the old chocolatier at the bay (Marchand &
// Fille, now Mel's Cocoa Room) runs through Celeste, Marco, Dad, Bo, Mateo and Opal; Okada's undelivered letter is
// Hana's; Juniper is the Gazette's secret poet and Theo has been collecting her poems; Elena and Marcus once shared an
// office; Felix's first bees swarmed in Ma Ma's apple tree; Wren is Bo's niece; and so on.
// A chapter: {lines: [bubble, ...], needs: [gate, ...], reward}
//   gates: "cocoa" / "cellar" (big goals owned), "trust1" (Trusted hand at the farm), "fish5" (five kinds in the fish
//   journal), "bouquet" (a bouquet in the backpack), "<npc>:<n>" (Mel has heard n of that villager's chapters)
//   rewards: see game/stories.js REWARDS
export const STORIES = {
  celeste: [
    {lines: ["That building down at the bay, before it was your Cocoa Room…", "…it was Marchand & Fille. My grandfather Henri's chocolaterie."]},
    {lines: ["Grand-père Henri opened it in 1962. Copper pots, a marble slab, and a queue out the door on Sunday mornings.", "I used to sit under the counter eating the broken bits."]},
    {lines: ["My mother, Margaux, took it over. 'Et Fille': and daughter. The best temperer on the whole coast."]},
    {lines: ["When Maman died, my brothers in Lyon wanted to sell it to a developer. Flats, they said.", "I couldn't run it. And I couldn't sell it. So it just… waited. Nine years, boarded up."]},
    {needs: ["cocoa"], lines: ["Yesterday I walked past the bay and smelled chocolate again. I had to sit down.", "Here: Grand-père's recipe book. It belongs in that kitchen. With you."], reward: "henri"},
    {lines: ["Maman always said wine and chocolate are old friends.", "Ask Marco why. He'll pretend he doesn't know."]}
  ],
  marco: [
    {lines: ["Forty summers on these vines. The first rows I planted with my own two hands, at twenty."]},
    {needs: ["celeste:6"], lines: ["Celeste sent you, didn't she. Margaux Marchand.", "She'd bring chocolate up to the vines at harvest. We ate it with the new red, sitting on the barrels."]},
    {lines: ["We were sweethearts, one summer. Then she went to Lyon to train, and I stayed with the vines.", "When she came back she was the 'Fille' at the shop, and I was 'that boy from the vineyard'. Best friends, ever after."]},
    {lines: ["The very first red from these vines, I named it Margaux. She laughed until she cried."]},
    {lines: ["I kept one bottle of that first vintage. Margaux, 1984.", "It belongs in your cellar, not under my bed. Open it on a good day."], reward: "margaux"}
  ],
  dad: [
    {lines: ["Did I ever tell you how I met your mother? She walked into the music shop with a guitar. Cracked neck.", "I was the boy behind the counter who fixed things."]},
    {lines: ["I took three weeks to fix that guitar.", "It only needed one."]},
    {lines: ["First date: a noodle place by the river in the city. She talked the whole time. I drew her on a napkin. Still got it."]},
    {needs: ["celeste:3"], lines: ["I was at art school then, too. A lady from the coast came into class, looking for someone to paint a chocolate box.", "Margaux Marchand! I painted her label: a ribbon and a little copper pot. Never dreamed we'd live down the road from her shop one day."]},
    {needs: ["cocoa"], lines: ["Found my old sketch of that label in a drawer. It should hang in your Cocoa Room, don't you think?"], reward: "label"}
  ],
  mum: [
    {lines: ["Your father will tell you he fixed my guitar. He did. Slowly. Very, very slowly."]},
    {lines: ["We all moved here together from the city when Ma Ma found the orchard. The city was too loud for her trees, she said."]},
    {lines: ["I still play that guitar, you know. Not well. Your dad pretends it's wonderful."]},
    {lines: ["Moving here was the best thing we ever did. Everyone round one table on Wednesdays and Sundays. That was always the dream."]}
  ],
  mama: [
    {lines: ["These trees came from cuttings. I carried them from the city in wet newspaper, on my lap, the whole way."]},
    {lines: ["The lemon tree nearly died the first winter. Gong Gong sat up with it all night. Talked to it."]},
    {lines: ["Twenty years ago a swarm of bees landed in my apple tree. A young man came running with a cardboard box.", "Felix! Now he says my blossom honey is HIS honey. Hmph."]},
    {lines: ["Mei's mother was my dearest friend. When she passed, Mei was so small.", "I taught her the roses, the way her mother sang to them."]},
    {lines: ["Tell Felix from me: the bees love the orchard best just after Gong Gong prunes. More blossom honey for everybody.", "Here, take a jar from the last batch. Don't tell him."], reward: "blossom"}
  ],
  gonggong: [
    {lines: ["Darren is a good boy. When he first came, he couldn't fix a tap. Now he fixes my radio."]},
    {lines: ["That old radio in his shed? Mine. Forty years. Still plays the news."]},
    {lines: ["I taught him everything: hammer, nail, patience. Mostly patience."]},
    {lines: ["Fishing at the lake on Sundays is my thinking time. Your grandmother thinks I'm napping. Sometimes I am."]}
  ],
  darren: [
    {lines: ["Gong Gong taught me to fix things. Lesson one: always turn the water off first. Learnt that one the hard way."]},
    {lines: ["The radio in the shed is his. I keep saying I'll give it back. He keeps telling me to keep it."]},
    {lines: ["Best day here? Evan on the swing I built. Gong Gong checked every bolt. Twice."]}
  ],
  okada: [
    {lines: ["In forty years, I delivered every letter but one."]},
    {lines: ["It came the winter of my first year. Addressed only to 'H., the seaside town'. No street. No town I knew."]},
    {lines: ["I kept it in my desk all these years. You don't throw away somebody's words."]},
    {needs: ["hana:2"], lines: ["Hana says she grew up in a seaside town. Her father was a fisherman.", "The letter's postmark… is a fishing harbour."]},
    {lines: ["I gave it to her this morning. My hands were shaking more than hers."]},
    {lines: ["It was from her father, before he went to sea and didn't come back. Forty years late.", "She hugged me. Then she gave me toast. I believe that's how Hana says thank you."]}
  ],
  hana: [
    {lines: ["I grew up by the sea. Dad had a little blue boat. He'd bring home fish, and I'd make the toast."]},
    {lines: ["He went out one winter and didn't come back. I was eight."]},
    {needs: ["okada:5"], lines: ["Mr Okada gave me a letter. From Dad. Forty years in a drawer, and it still smelled of the sea."]},
    {lines: ["He wrote that he'd teach me to sail that summer. So I've decided I'm going to learn anyway.", "And I made something new. Postman's toast: honey, butter, a pinch of sea salt. Here, first ones are yours."], reward: "toast"}
  ],
  juniper: [
    {lines: ["Can you keep a secret? The poems in the Gazette, signed 'J.'? Don't look at me like that."]},
    {lines: ["I write them at the library before it opens. The building's quietest then. Just me and the radiators."]},
    {needs: ["theo:2"], lines: ["Someone's been leaving pressed flowers in the poetry section. Right where the next poem goes."]},
    {lines: ["It's Theo. Of course it's Theo. He has a rubber stamp that says 'pressed'."]},
    {lines: ["We're doing a reading at the night market. Lior's making the lanterns. I'm terrified. You'll come?"]}
  ],
  theo: [
    {lines: ["I keep the village records. Births, weddings, who owns which hedge. And the Gazette's poems, in my album."]},
    {lines: ["Whoever 'J.' is, they write about the well like an old friend. I've started leaving them pressed flowers. Is that strange?"]},
    {needs: ["juniper:3"], lines: ["Juniper caught me with the flowers. I said I was cataloguing. She laughed for a full minute."]},
    {lines: ["We have tea in the trophy room now. She reads, I stamp. Best part of my day."]},
    {needs: ["juniper:5"], lines: ["The reading's on a Thursday night. I've reserved the front row. And the second row. For nerves."]}
  ],
  bo: [
    {lines: ["See that carved sign in the corner of the workshop? 'Marchand & Fille'. Made it the year I left school."]},
    {lines: ["When the shop closed, Celeste couldn't look at it. So I kept it. Oiled it every spring."]},
    {needs: ["cocoa", "celeste:5"], lines: ["I've sanded the old sign back. It's going up over your Cocoa Room door, if you'll have it."], reward: "sign"},
    {lines: ["My niece Wren's back from the city. Ranger, now. I built that cabin for her gran, you know."]}
  ],
  wren: [
    {lines: ["My gran was the ranger before me. She planted the chestnut tree by the foraging patch."]},
    {lines: ["Uncle Bo built the cabin and the lookout for her. I slept up in the lookout every summer."]},
    {lines: ["Ten years in the city. Offices. I missed the sound of the waterfall every single day."]},
    {needs: ["fish5"], lines: ["A ranger secret: the golden koi on your river come up at dusk when the water's still.", "Cast slow. Wait longer than feels right."], reward: "koi"}
  ],
  mateo: [
    {lines: ["My abuela Rosario worked at the old chocolate shop. Margaux's tempering girl, at sixteen."]},
    {lines: ["She came home smelling of cocoa every day. That's why I study food science. I wanted to know why chocolate snaps."]},
    {needs: ["cocoa", "celeste:5"], lines: ["I told her I work in the same kitchen now. She cried. She's coming to visit.", "She says the marble slab had better still be there."]}
  ],
  opal: [
    {needs: ["cocoa"], lines: ["Can I tell you something, now it's yours? I've paid the rates on that building at the bay for nine years."]},
    {lines: ["Developers kept calling the bank. I kept saying 'not for sale'. Technically it was Celeste's brothers' call. Technically."]},
    {lines: ["Margaux opened my first savings account. With a chocolate coin. Some debts aren't on paper."]}
  ],
  felix: [
    {lines: ["My first bees? A swarm that landed in your grandmother's apple tree. I was twenty, terrified, with a cardboard box."]},
    {lines: ["Ma Ma still says it's HER blossom honey. Technically, the bees agree with her."]},
    {needs: ["mama:5"], lines: ["Your Ma Ma's pruning tip worked. The orchard's buzzing. Don't tell her I said she was right."]}
  ],
  elena: [
    {lines: ["Before cheese, I was a banker. In the city. Grey suits, grey coffee."]},
    {lines: ["Your brother Marcus sat two desks down. He used to bring me egg tarts on Fridays."]},
    {lines: ["I left the week I cried at a spreadsheet. Bought two goats with my bonus. Best trade I ever made."]},
    {needs: ["marcus:2"], lines: ["Marcus came up on Saturday to help in the dairy. He's terrible at milking. He's very good at laughing about it."]}
  ],
  marcus: [
    {lines: ["You know Elena, from the farm? We worked together in the city. She left. I stayed."]},
    {needs: ["elena:3"], lines: ["Sometimes I think about doing what she did. Then I think about my mortgage. Then I think about goats."]},
    {lines: ["Angellina says I should 'explore the feeling'. So I'm exploring it. On Saturdays. With a milking stool."]}
  ],
  angelina: [
    {lines: ["Marcus pretends he loves spreadsheets. I'm literally doing a module on that."]},
    {needs: ["marcus:2"], lines: ["I told him: you don't have to quit to try something. Try it on a Saturday. That's psychology, Mel."]}
  ],
  mei: [
    {lines: ["My mum used to sing to the roses. I thought everybody did."]},
    {lines: ["When she died, Ma Ma brought me to the flower farm every day. She said the flowers needed me. I think I needed them."]},
    {lines: ["Every year on Mum's birthday I take her a bouquet. This year… would you bring me one? Any kind."]},
    {needs: ["bouquet"], lines: ["You brought one! Tulips were her favourite. Thank you, Mel. Really."], reward: "bouquet"}
  ],
  noor: [
    {lines: ["I used to run a rescue in the city. Thirty animals, one tiny yard."]},
    {lines: ["The landlord sold the building. I found homes for every single one. Then I cried for a week."]},
    {needs: ["trust1"], lines: ["Elena says there might be room in the barn for a little rescue corner one day. Imagine!"]}
  ],
  pilar: [
    {lines: ["Tomo's my nephew. My sister's boy. Eats like a horse, works like one too."]},
    {lines: ["My mother cooked for a whole village in Andalucía. I'm doing the same, one plate at a time."]},
    {needs: ["sofia:2"], lines: ["Sofia's nonna's fior di latte? She's been whipping it to death. I told her: let the milk be milk."]}
  ],
  sofia: [
    {lines: ["My nonna had a gelato cart in Napoli. This little book is all her recipes."]},
    {lines: ["There's one I can't get right. Her fior di latte. It's only milk and sugar, and I keep ruining it."]},
    {needs: ["pilar:3"], lines: ["Pilar fixed it! 'Let the milk be milk.' Here, taste. Nonna would cry."], reward: "nonna"}
  ],
  farid: [
    {lines: ["I trained in my uncle's bakery. Up at four, flour in my eyebrows."]},
    {lines: ["I came here for one summer of fruit picking. That was six summers ago."]},
    {lines: ["Felix's honey, Ma Ma's pistachios… I made my uncle's pastries for Pilar. She's putting them on the tapas menu!"], reward: "pastry"}
  ]
};
