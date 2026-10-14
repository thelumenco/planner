// Backstories (round 104): each storied villager tells Mel their story over time, a chapter at a time, in their
// speech bubbles (game/stories.js decides when). The threads tie together: the old chocolatier at the bay (Marchand &
// Fille, now Mel's Cocoa Room) runs through Celeste, Marco, Dad, Bo, Mateo and Opal; Okada's undelivered letter is
// Hana's; Juniper is the Gazette's secret poet and Theo has been collecting her poems; Elena and Marcus once shared an
// office; Felix's first bees swarmed in Ma Ma's apple tree; Wren is Bo's niece; and so on.
// A chapter: {recap, lines: [bubble, ...], needs: [gate, ...], reward}
//   recap: one bubble (every chapter after the first) reminding Mel what that villager told her last time, since
//   chapters can be days or a week apart; shown before the chapter's lines. Lines should name their subject rather
//   than lean on a pronoun from an earlier chapter, so each chapter makes sense on its own.
//   gates: "cocoa" / "cellar" (big goals owned), "trust1" (Trusted hand at the farm), "fish5" (five kinds in the fish
//   journal), "bouquet" (a bouquet in the backpack), "<npc>:<n>" (Mel has heard n of that villager's chapters)
//   rewards: see game/stories.js REWARDS
export const STORIES = {
  celeste: [
    {lines: ["That building down at the bay, before it was your Cocoa Room…", "…it was Marchand & Fille. My grandfather Henri's chocolaterie."]},
    {recap: "Remember Marchand & Fille, the chocolaterie down at the bay? My grandfather Henri's.", lines: ["Grand-père Henri opened the shop in 1962. Copper pots, a marble slab, and a queue out the door on Sunday mornings.", "I used to sit under the counter eating the broken bits."]},
    {recap: "I told you about Grand-père's shop at the bay, and me under the counter with the broken bits.", lines: ["My mother, Margaux, took the shop over. 'Et Fille': and daughter. The best temperer on the whole coast."]},
    {recap: "Maman, Margaux, ran Marchand & Fille after Grand-père. The best temperer on the coast, as I said.", lines: ["When Maman died, my brothers in Lyon wanted to sell the shop to a developer. Flats, they said.", "I couldn't run it. And I couldn't sell it. So it just… waited. Nine years, boarded up."]},
    {recap: "You know the shop at the bay sat boarded up for nine years. I couldn't run it, and I couldn't sell it.", needs: ["cocoa"], lines: ["Yesterday I walked past the bay and smelled chocolate again. I had to sit down.", "Here: Grand-père's recipe book. It belongs in that kitchen. With you."], reward: "henri"},
    {recap: "Grand-père's recipe book is back in the kitchen at the bay now, with you. That makes me so happy.", lines: ["Maman always said wine and chocolate are old friends.", "Ask Marco why. He'll pretend he doesn't know."]}
  ],
  marco: [
    {lines: ["Forty summers on these vines. The first rows I planted with my own two hands, at twenty."]},
    {recap: "Forty summers I've tended these vines, I told you. Planted the first rows myself.", needs: ["celeste:6"], lines: ["Celeste sent you, didn't she. About her mother, Margaux Marchand.", "She'd bring chocolate up to the vines at harvest. We ate it with the new red, sitting on the barrels."]},
    {recap: "Where was I? Margaux, bringing chocolate up to the vines at harvest, and the two of us on the barrels.", lines: ["Margaux and I were sweethearts, one summer. Then she went to Lyon to train, and I stayed with the vines.", "When she came back she was the 'Fille' at the shop, and I was 'that boy from the vineyard'. Best friends, ever after."]},
    {recap: "Margaux and I: sweethearts for one summer, then best friends for life. That much you know.", lines: ["The very first red from these vines, I named it Margaux. She laughed until she cried."]},
    {recap: "My first red, the one I named after Margaux. You should have heard her laugh.", lines: ["I kept one bottle of that first vintage. Margaux, 1984.", "It belongs in your cellar, not under my bed. Open it on a good day."], reward: "margaux"}
  ],
  dad: [
    {lines: ["Did I ever tell you how I met your mother? She walked into the music shop with a guitar. Cracked neck.", "I was the boy behind the counter who fixed things."]},
    {recap: "So, your mother walks into the music shop with a cracked guitar, and there I am behind the counter…", lines: ["I took three weeks to fix that guitar.", "It only needed one."]},
    {recap: "Three weeks I spent on your mother's guitar, when it only needed one. I wasn't in a hurry, was I?", lines: ["First date: a noodle place by the river in the city. Your mother talked the whole time. I drew her on a napkin. Still got it."]},
    {recap: "I told you about our first date, the noodle place by the river, and the napkin drawing of your mother.", needs: ["celeste:3"], lines: ["I was at art school then, too. A lady from the coast came into class, looking for someone to paint a chocolate box.", "Margaux Marchand! I painted her label: a ribbon and a little copper pot. Never dreamed we'd live down the road from her shop one day."]},
    {recap: "Remember the chocolate box label I painted for Margaux Marchand? A ribbon and a little copper pot.", needs: ["cocoa"], lines: ["Found my old sketch of that label in a drawer. It should hang in your Cocoa Room, don't you think?"], reward: "label"}
  ],
  mum: [
    {lines: ["Your father will tell you he fixed my guitar. He did. Slowly. Very, very slowly."]},
    {recap: "I told you how your father fixed my guitar, ever so slowly. That was the start of us.", lines: ["We all moved here together from the city when Ma Ma found the orchard. The city was too loud for her trees, she said."]},
    {recap: "Remember how we all came down from the city together, when Ma Ma found her orchard?", lines: ["I still play that guitar your dad fixed, you know. Not well. Your dad pretends it's wonderful."]},
    {recap: "The guitar your dad fixed still gets played, not very well. He's very sweet about it.", lines: ["Moving here was the best thing we ever did. Everyone round one table on Wednesdays and Sundays. That was always the dream."]}
  ],
  mama: [
    {lines: ["These trees came from cuttings. I carried them from the city in wet newspaper, on my lap, the whole way."]},
    {recap: "My orchard trees, I told you: cuttings from the city, wrapped in wet newspaper on my lap.", lines: ["The lemon tree nearly died the first winter. Gong Gong sat up with it all night. Talked to it."]},
    {recap: "Gong Gong sat up all night with my lemon tree that first winter, talking to it. Silly man.", lines: ["Twenty years ago a swarm of bees landed in my apple tree. A young man came running with a cardboard box.", "Felix! Now he says my blossom honey is HIS honey. Hmph."]},
    {recap: "Felix and his cardboard box, catching the bees in my apple tree. He still calls it HIS honey.", lines: ["Mei's mother was my dearest friend. When she passed, Mei was so small.", "I taught her the roses, the way her mother sang to them."]},
    {recap: "I told you how I taught little Mei the roses, the way her mother sang to them.", lines: ["Tell Felix from me: the bees love the orchard best just after Gong Gong prunes. More blossom honey for everybody.", "Here, take a jar from the last batch. Don't tell him."], reward: "blossom"}
  ],
  gonggong: [
    {lines: ["Darren is a good boy. When he first came, he couldn't fix a tap. Now he fixes my radio."]},
    {recap: "Darren couldn't fix a tap when he first came, I told you. Now he fixes my radio.", lines: ["That old radio in Darren's shed? Mine. Forty years. Still plays the news."]},
    {recap: "The radio in Darren's shed is mine, you know. Forty years old and still going.", lines: ["I taught Darren everything: hammer, nail, patience. Mostly patience."]},
    {recap: "Hammer, nail, patience: that's what I taught Darren. Mostly patience.", lines: ["Fishing at the lake on Sundays is my thinking time. Your grandmother thinks I'm napping. Sometimes I am."]}
  ],
  darren: [
    {lines: ["Gong Gong taught me to fix things. Lesson one: always turn the water off first. Learnt that one the hard way."]},
    {recap: "Gong Gong's first lesson, remember? Turn the water off first. I learnt that the wet way.", lines: ["The radio in the shed is Gong Gong's. I keep saying I'll give it back. He keeps telling me to keep it."]},
    {recap: "Still haven't given Gong Gong his radio back. He still won't take it.", lines: ["Best day here? Evan on the swing I built. Gong Gong checked every bolt. Twice."]}
  ],
  okada: [
    {lines: ["In forty years, I delivered every letter but one."]},
    {recap: "Forty years of post, and only one letter I never delivered. I've been meaning to tell you about it.", lines: ["That letter came the winter of my first year. Addressed only to 'H., the seaside town'. No street. No town I knew."]},
    {recap: "That one undelivered letter, addressed only to 'H., the seaside town'. No street at all.", lines: ["I kept the letter in my desk all these years. You don't throw away somebody's words."]},
    {recap: "The letter for 'H.' has sat in my desk for forty years. I never could throw it away.", needs: ["hana:2"], lines: ["Hana says she grew up in a seaside town. Her father was a fisherman.", "The letter's postmark… is a fishing harbour."]},
    {recap: "Hana grew up by the sea, and that old letter for 'H.' is postmarked at a fishing harbour.", lines: ["I gave Hana the letter this morning. My hands were shaking more than hers."]},
    {recap: "I finally gave Hana that forty-year-old letter. My hands were shaking more than hers.", lines: ["The letter was from her father, before he went to sea and didn't come back. Forty years late.", "She hugged me. Then she gave me toast. I believe that's how Hana says thank you."]},
    // round 122: Sachiko in Kyoto kept his grandmother's tea scoop
    {recap: "Hana's letter found its way home at last. And now, it seems, something has found its way home to me.", needs: ["sachiko:3"], lines: ["My grandmother's tea scoop. Sachiko kept it? All these years?", "Grandmother taught half the lane. She'd be glad it was you who brought it. Thank you, Mel. Truly."]}
  ],
  hana: [
    {lines: ["I grew up by the sea. Dad had a little blue boat. He'd bring home fish, and I'd make the toast."]},
    {recap: "I told you about Dad's little blue boat. He'd bring the fish, I'd make the toast.", lines: ["Dad went out one winter and didn't come back. I was eight."]},
    {recap: "You know about Dad, and his little blue boat, and the winter he didn't come home.", needs: ["okada:5"], lines: ["Mr Okada gave me a letter. From Dad. Forty years in a drawer, and it still smelled of the sea."]},
    {recap: "Dad's letter, the one Mr Okada kept in his drawer for forty years. I've been thinking about it.", lines: ["Dad wrote that he'd teach me to sail that summer. So I've decided I'm going to learn anyway.", "And I made something new. Postman's toast: honey, butter, a pinch of sea salt. Here, first ones are yours."], reward: "toast"}
  ],
  juniper: [
    {lines: ["Can you keep a secret? The poems in the Gazette, signed 'J.'? Don't look at me like that."]},
    {recap: "Still keeping my secret? The 'J.' poems in the Gazette are mine.", lines: ["I write the poems at the library before it opens. The building's quietest then. Just me and the radiators."]},
    {recap: "I write my Gazette poems at the library, before it opens. Just me and the radiators.", needs: ["theo:2"], lines: ["Someone's been leaving pressed flowers in the poetry section. Right where the next poem goes."]},
    {recap: "Those pressed flowers in the poetry section, right where my next poem goes? I've solved it.", lines: ["It's Theo leaving the flowers. Of course it's Theo. He has a rubber stamp that says 'pressed'."]},
    {recap: "Theo and his pressed flowers. And his rubber stamp. I'm still smiling about it.", lines: ["We're doing a reading at the night market. Lior's making the lanterns. I'm terrified. You'll come?"]}
  ],
  theo: [
    {lines: ["I keep the village records. Births, weddings, who owns which hedge. And the Gazette's poems, in my album."]},
    {recap: "I keep the Gazette's poems in my album, as I said. The ones signed 'J.'.", lines: ["Whoever 'J.' is, they write about the well like an old friend. I've started leaving them pressed flowers. Is that strange?"]},
    {recap: "My pressed flowers for 'J.', the Gazette's poet. I did ask you if that was strange.", needs: ["juniper:3"], lines: ["Juniper caught me with the flowers. I said I was cataloguing. She laughed for a full minute."]},
    {recap: "Juniper caught me leaving the flowers, you'll recall. 'Cataloguing', I said.", lines: ["Juniper and I have tea in the trophy room now. She reads, I stamp. Best part of my day."]},
    {recap: "Tea with Juniper in the trophy room: she reads, I stamp. And now she's reading out loud.", needs: ["juniper:5"], lines: ["Juniper's reading at the night market is on a Thursday night. I've reserved the front row. And the second row. For nerves."]}
  ],
  bo: [
    {lines: ["See that carved sign in the corner of the workshop? 'Marchand & Fille'. Made it the year I left school."]},
    {recap: "That 'Marchand & Fille' sign in my workshop, I carved it the year I left school.", lines: ["When the shop closed, Celeste couldn't look at the sign. So I kept it. Oiled it every spring."]},
    {recap: "I kept the old Marchand & Fille sign all those years after the shop closed. Oiled it every spring.", needs: ["cocoa", "celeste:5"], lines: ["I've sanded the old sign back. It's going up over your Cocoa Room door, if you'll have it."], reward: "sign"},
    {recap: "The old Marchand & Fille sign looks right at home over your Cocoa Room door.", lines: ["My niece Wren's back from the city. Ranger, now. I built the ranger's cabin for her gran, you know."]}
  ],
  wren: [
    {lines: ["My gran was the ranger before me. She planted the chestnut tree by the foraging patch."]},
    {recap: "Gran was the ranger here before me, I told you. She planted the chestnut by the foraging patch.", lines: ["Uncle Bo built the cabin and the lookout for Gran. I slept up in the lookout every summer."]},
    {recap: "Uncle Bo built Gran's cabin and the lookout. I spent every summer up there.", lines: ["Ten years in the city. Offices. I missed the sound of the waterfall every single day."]},
    {recap: "Ten years of city offices, and all I missed was the waterfall. It's good to be home.", needs: ["fish5"], lines: ["A ranger secret: the golden koi on your river come up at dusk when the water's still.", "Cast slow. Wait longer than feels right."], reward: "koi"}
  ],
  mateo: [
    {lines: ["My abuela Rosario worked at the old chocolate shop. Margaux's tempering girl, at sixteen."]},
    {recap: "My abuela Rosario, remember? Margaux's tempering girl at the old chocolate shop, at sixteen.", lines: ["Abuela came home smelling of cocoa every day. That's why I study food science. I wanted to know why chocolate snaps."]},
    {recap: "Abuela's cocoa smell is why I study food science, as I said. I had to know why chocolate snaps.", needs: ["cocoa", "celeste:5"], lines: ["I told Abuela I work in the same kitchen now. She cried. She's coming to visit.", "She says the marble slab had better still be there."]}
  ],
  opal: [
    {needs: ["cocoa"], lines: ["Can I tell you something, now it's yours? I've paid the rates on that building at the bay for nine years."]},
    {recap: "I told you I paid the rates on the old chocolate shop at the bay for nine years.", lines: ["Developers kept calling the bank. I kept saying 'not for sale'. Technically it was Celeste's brothers' call. Technically."]},
    {recap: "Developers kept calling about the shop at the bay, and I kept saying 'not for sale'.", lines: ["Margaux opened my first savings account. With a chocolate coin. Some debts aren't on paper."]}
  ],
  felix: [
    {lines: ["My first bees? A swarm that landed in your grandmother's apple tree. I was twenty, terrified, with a cardboard box."]},
    {recap: "My very first swarm, in your grandmother's apple tree. Me at twenty, with a cardboard box.", lines: ["Ma Ma still says it's HER blossom honey. Technically, the bees agree with her."]},
    {recap: "Ma Ma and I still argue over whose blossom honey it is. The bees take her side.", needs: ["mama:5"], lines: ["Your Ma Ma's pruning tip worked. The orchard's buzzing. Don't tell her I said she was right."]}
  ],
  elena: [
    {lines: ["Before cheese, I was a banker. In the city. Grey suits, grey coffee."]},
    {recap: "I was a banker in the city before cheese, I told you. Grey suits, grey coffee.", lines: ["Your brother Marcus sat two desks down. He used to bring me egg tarts on Fridays."]},
    {recap: "Marcus, two desks down at the bank, with his Friday egg tarts. The best bit of the week.", lines: ["I left the bank the week I cried at a spreadsheet. Bought two goats with my bonus. Best trade I ever made."]},
    {recap: "I swapped banking for two goats, remember? Best trade I ever made.", needs: ["marcus:2"], lines: ["Marcus came up on Saturday to help in the dairy. He's terrible at milking. He's very good at laughing about it."]}
  ],
  marcus: [
    {lines: ["You know Elena, from the farm? We worked together in the city. She left. I stayed."]},
    {recap: "Elena and I worked together in the city, remember? She left. I stayed.", needs: ["elena:3"], lines: ["Sometimes I think about doing what Elena did. Then I think about my mortgage. Then I think about goats."]},
    {recap: "I told you I sometimes think about doing what Elena did. Mortgage, then goats.", lines: ["Angellina says I should 'explore the feeling'. So I'm exploring it. On Saturdays. With a milking stool."]}
  ],
  angelina: [
    {lines: ["Marcus pretends he loves spreadsheets. I'm literally doing a module on that."]},
    {recap: "Marcus and his pretend love of spreadsheets, remember? I'm literally doing a module on it.", needs: ["marcus:2"], lines: ["I told Marcus: you don't have to quit to try something. Try it on a Saturday. That's psychology, Mel."]}
  ],
  mei: [
    {lines: ["My mum used to sing to the roses. I thought everybody did."]},
    {recap: "My mum used to sing to the roses, I told you. I thought everybody did.", lines: ["When Mum died, Ma Ma brought me to the flower farm every day. She said the flowers needed me. I think I needed them."]},
    {recap: "Ma Ma brought me to the flower farm every day when I was small. The flowers and I looked after each other.", lines: ["Every year on Mum's birthday I take her a bouquet. This year… would you bring me one? Any kind."]},
    {recap: "You remember I asked you for a bouquet, for Mum's birthday?", needs: ["bouquet"], lines: ["You brought one! Tulips were her favourite. Thank you, Mel. Really."], reward: "bouquet"}
  ],
  noor: [
    {lines: ["I used to run a rescue in the city. Thirty animals, one tiny yard."]},
    {recap: "My old animal rescue in the city, I told you: thirty animals, one tiny yard.", lines: ["The landlord sold the rescue's building. I found homes for every single one. Then I cried for a week."]},
    {recap: "When the rescue's building was sold, I found homes for all thirty animals. Every single one.", needs: ["trust1"], lines: ["Elena says there might be room in the barn for a little rescue corner one day. Imagine!"]}
  ],
  pilar: [
    {lines: ["Tomo's my nephew. My sister's boy. Eats like a horse, works like one too."]},
    {recap: "You know my nephew Tomo, my sister's boy. Eats like a horse, works like one too.", lines: ["My mother cooked for a whole village in Andalucía. I'm doing the same, one plate at a time."]},
    {recap: "I told you about my mother, cooking for a whole village in Andalucía. I'm doing the same here.", needs: ["sofia:2"], lines: ["Sofia's nonna's fior di latte? She's been whipping it to death. I told her: let the milk be milk."]},
    // round 107: Doña Carmen, in Ronda, knew Pilar's mother
    {recap: "Sofia and her nonna's fior di latte, remember? I told her to let the milk be milk.", needs: ["carmen:3"], lines: ["Doña Carmen sent me a kiss? From Ronda?", "She was my mother's best friend. Mamá used to say Carmen's yemas were the only sweets worth the sugar.", "I'm making Mamá's salmorejo tonight. For both of them."]}
  ],
  // round 120: Ines is Tomás Ruiz's great-great-granddaughter. He came with the railway in 1912 from a village near
  // Ronda and planted an olive cutting by the windmill; his initials are on the mill's beam
  ines: [
    {lines: ["My great-great-grandad Tomás came with the railway. Laid the track from the coast, sleeper by sleeper.", "He meant to go home to Spain when it was done. He met my great-great-grandma at the station tea room instead."]},
    {recap: "Great-great-grandad Tomás, remember? Came with the railway, met my great-great-grandma at the station tea room.", lines: ["Tomás had a cutting from his grandfather's olive tree in his pocket the whole way, wrapped in a wet handkerchief.", "Everyone said an olive would never grow here. He planted it by the windmill anyway. Stubborn. It runs in the family."]},
    {recap: "I told you about Tomás's olive cutting, the one he planted by the windmill when everyone said it wouldn't grow.", lines: ["See the trees on the top terrace? My abuela takes a cutting from the old tree by the windmill every spring.", "Half the olives in this valley are that tree's grandchildren. Including yours, probably."]},
    {recap: "Half the olives in this valley come from Tomás's old tree by the windmill. Yours too, probably.", needs: ["mill"], lines: ["You opened up the old mill! Did you see the initials on the beam? T.R. That's Tomás!", "Family story: he carved them the day the millstone stopped, and said one day it would turn again, for olives."]},
    {recap: "Tomás's initials on the mill beam, remember? He said the millstone would turn again one day, for olives.", needs: ["oil"], lines: ["I took a bottle of your oil to Abuela. From Tomás's tree's grandchildren, pressed in his mill. She cried into her bread. Then she ate the bread.", "She sent this. Tomás carved it from a branch of that tree in 1913. It should live with the oil now."], reward: "spoon"},
    {recap: "Abuela loved your oil from Tomás's tree. And his old olive wood spoon is with you now.", needs: ["ines:5"], lines: ["Abuela's been baking her olive oil cake again, the one from Tomás's village.", "She said I could give you the recipe. That's basically a royal decree."], reward: "oilcake"}
  ],
  // Kyoto's locals (round 122), told on a day trip like Ronda's. Sachiko and Okada: his grandmother taught her the tea ceremony
  sachiko: [
    {lines: ["I learned the tea ceremony from an old lady on this lane. Okada-sensei. She rapped my knuckles with a fan when I rushed."]},
    {recap: "Okada-sensei, who taught me the tea ceremony on this lane. She rapped my knuckles when I rushed.", lines: ["Okada-sensei's grandson went across the sea to deliver letters, they said. She was so proud. She kept his postcards by the kettle."]},
    {recap: "My old teacher's grandson went across the sea to deliver letters. She kept his postcards by the kettle.", needs: ["okada:1"], lines: ["Okada? The postman in your village? A tall man who never throws anything away?", "Then please give him this: his grandmother's tea scoop. I've kept it forty years. It should go home."], reward: "chashaku"},
    {recap: "Okada-sensei's tea scoop is going home with you, to her grandson. Thank you.", lines: ["One meeting, one chance. Okada-sensei used to say it every time I left. I say it to you now."]}
  ],
  joshin: [
    {lines: ["I sold insurance in Tokyo for eleven years. Very good at it. Very unhappy."]},
    {recap: "Eleven years selling insurance in Tokyo, I told you. Very good at it. Very unhappy.", lines: ["One morning on the train I couldn't remember the last time I'd looked at the sky. I got off. I came here. I never went back."]},
    {recap: "That morning on the Tokyo train, when I got off and came here instead. Do you remember?", lines: ["My teacher made me rake the gravel garden for a year before I was allowed to sit. Best year of my life."]},
    {recap: "A whole year raking my teacher's gravel garden before I could sit. Still the best year.", lines: ["Here's my secret: every morning I'm terrible at meditation. Then I laugh. Then I'm a little better."]}
  ],
  tanaka: [
    {lines: ["My great-grandfather opened this shop in 1921. The wooden moulds on the wall are his."]},
    {recap: "This shop is my great-grandfather's, since 1921. His wooden moulds are still on the wall.", lines: ["There is one sweet I make only one day a year: the first snow. White, round, a little cold. My father taught me on the day he retired."]},
    {recap: "The first snow sweet, I told you: one day a year, the way my father taught me.", lines: ["My daughter wants to make chocolate wagashi. Chocolate! My father would faint.", "...I tried one. It was very good. Don't tell her."]}
  ],
  // Jason (round 135): Mel's friend, who lives in Vernazza now; told on a trip day, one a day
  jason: [
    {lines: ["Do you remember 2015? Your train stuck in Florence for six hours, and me on the harbour stones with a pizza going cold.", "I'd brought a book. I'd have waited all night. I very nearly did."]},
    {recap: "Me on the harbour stones in 2015, waiting six hours for your train from Florence. What a summer that was.", lines: ["Every one of Corniglia's steps, that summer. I counted them aloud, and you pretended not to know me.", "I still climb them, most mornings. They haven't got any fewer. I've got a little more patient."]},
    {recap: "Corniglia's steps! Me counting every one aloud, you pretending not to know me.", lines: ["I met Luca when the ferry from La Spezia broke down outside the harbour. He came out in a little boat with a toolbox and a terrible joke.", "I stayed for the joke. Then for the man. Then for the view. In that order, he'll tell you. He's wrong, but I let him."]},
    {recap: "I told you how I met Luca: a broken-down ferry, a little boat, a toolbox and a terrible joke.", lines: ["Every morning, the same table, an espresso, a poem. Most of them are dreadful. About one a month is all right.", "This one's all right. It's for you. Don't read it here, I'll go red. Read it on the train."], reward: "poem"},
    {recap: "My morning poems, remember? Espresso, same table, and the one good poem of the month went home with you.", lines: ["I've decided what happiness is, Mel. A second-floor window. A harbour. Someone who brings you coffee without asking.", "And an old friend who comes to visit. I have all four today. Imagine that."]}
  ],
  // Ronda's locals (round 107): told on a day trip (no quest needed; the two-a-day limit still holds)
  carmen: [
    {lines: ["I learned the yemas from the nuns at the convent when I was nine. They paid me in sugar."]},
    {recap: "The nuns taught me the yemas when I was nine, I told you. Paid me in sugar.", lines: ["There was a girl, Rosario, who came to my shop every Sunday. She cooked like an angel.", "She went north, to a little village, and cooked for everyone. I never saw her again."]},
    {recap: "Rosario, the girl who cooked like an angel, remember? She went north to a little village.", needs: ["pilar:2"], lines: ["Pilar? A cook called Pilar, in your village? Her mother was from Andalucía?", "¡Ay! Rosario's girl! Tell her Doña Carmen sends a kiss. And take her these."], reward: "carmen"},
    {recap: "Rosario's daughter Pilar, cooking in your village! I still can't believe it.", lines: ["The nuns are getting old. Soon nobody will turn the wheel at the convent.", "Maybe I'll learn the biscuits too. At my age! Why not."]}
  ],
  rafael: [
    {lines: ["My grandfather pressed the olives with a donkey. I have a machine. The donkey was better company."]},
    {recap: "My grandfather pressed his olives with a donkey, I told you. Better company than my machine.", needs: ["ronda2"], lines: ["My son wants to be a DJ. In Málaga. A DJ! Who will press the oil?"]},
    {recap: "My son, the one who wants to be a DJ in Málaga. Remember? A DJ!", needs: ["rafael:2"], lines: ["My son came home for the harvest. He put music on in the mill, very loud.", "The olives didn't mind. Neither did I. Don't tell him."]}
  ],
  lucia: [
    {lines: ["My grandmother painted the tiles round the fountain in the plaza. I fix them when the frost cracks one."]},
    {recap: "My grandmother painted the tiles round the plaza fountain, I told you. I mend them when the frost cracks one.", lines: ["Two hundred and eleven views on the fountain tiles. I'll never finish. That's the good part."]},
    {recap: "Two hundred and eleven views on the fountain tiles, remember? I'll never finish, and that's the good part.", needs: ["tiles4"], lines: ["You're nearly a whole set! Where will they go?", "A bench by a pond in Honeybrook? Send me a photo. Then I'll paint Honeybrook. View two hundred and twelve."]}
  ],
  manolo: [
    {lines: ["I had a band once, in Sevilla. Five of us in a van. Then I came home.", "The fountain has better acoustics. And it never asks for a bigger share."]},
    {recap: "My old band in Sevilla, five of us in a van. The fountain's better, as I said.", lines: ["The lady in your family who dances: she claps on the right beats. Nobody claps on the right beats."]},
    {recap: "I told you about the lady in your family who dances. She claps on the right beats!", lines: ["Here, this one's new. I wrote it about the vultures. It's slow. They're very patient birds."]}
  ],
  sofia: [
    {lines: ["My nonna had a gelato cart in Napoli. This little book is all her recipes."]},
    {recap: "My nonna's gelato cart in Napoli, remember? This little book holds all her recipes.", lines: ["There's one recipe in Nonna's book I can't get right. Her fior di latte. It's only milk and sugar, and I keep ruining it."]},
    {recap: "Nonna's fior di latte, the one I kept ruining. Only milk and sugar, I told you!", needs: ["pilar:3"], lines: ["Pilar fixed it! 'Let the milk be milk.' Here, taste. Nonna would cry."], reward: "nonna"}
  ],
  farid: [
    {lines: ["I trained in my uncle's bakery. Up at four, flour in my eyebrows."]},
    {recap: "My uncle's bakery, I told you: up at four, flour in my eyebrows.", lines: ["I came here for one summer of fruit picking. That was six summers ago."]},
    {recap: "One summer of fruit picking, I said. That was six summers ago.", lines: ["Felix's honey, Ma Ma's pistachios… I made my uncle's pastries for Pilar. She's putting them on the tapas menu!"], reward: "pastry"}
  ],
  // Saltwick Harbour's locals, told on a boat trip like Ronda's and Kyoto's. Nan Storr's family coble, the
  // Margaret Ann, rebuilt three times; Tom Hawsker's coble, the Kittiwake, plank by plank (Nan's grandson Danny tows her
  // round on launch day); Priya and old Mr Ellerby, who made her ask eleven times (her first good piece was a kittiwake)
  nanstorr: [
    {lines: ["Fifty years on this stall, love. Fifty! I've sold haddock to three mayors and a bishop.", "See the blue coble tied up by the swing bridge? The Margaret Ann. She's a Storr boat, and she's older than me. Well. Bits of her are."]},
    {recap: "The Margaret Ann, I told you. Our family's blue coble by the bridge. Older than me, bits of her.", lines: ["My grandad Billy Storr built the Margaret Ann in 1921. Named her after his mam, who never once set foot in her.", "Grandad Billy always said a coble's like a good teapot. Keep her warm and she'll see you out."]},
    {recap: "Grandad Billy built the Margaret Ann in 1921, remember? Named her for his mam, who wouldn't get in her.", lines: ["The big storm of '53 smashed half the boats in this harbour. The Margaret Ann ended up in the fish market. Inside it.", "My dad and Grandad Billy built her again from what was left. Same name, same blue. Mam said it was a heap of firewood in its Sunday best."]},
    {recap: "After the storm of '53, Dad and Grandad Billy built the Margaret Ann again from the bits. Same name, same blue.", lines: ["My Jack rebuilt the Margaret Ann a third time, in the eighties. Every winter evening in the chandlery yard, with a flask and the radio on.", "Jack kept one plank from Grandad Billy's boat in her, under the seat. For luck, he said. For being soft, I said. He's still both, bless him."]},
    {recap: "My Jack rebuilt the Margaret Ann the third time, and kept one of Grandad Billy's planks under the seat for luck.", lines: ["Our Kevin's lad, Danny, took the Margaret Ann out on his own this morning. Fourth Storr to fish her. He's twenty-two and thinks he invented the sea.", "Danny came back with the best lobsters I've seen in ten year, and the whole quay clapped him in. Grandad Billy's plank is still under the seat.", "Here, love: Jack's old oilskin hat. He's got a new one and won't stop showing it off."], reward: "storrhat"}
  ],
  tomhawsker: [
    {lines: ["There's an old coble in my yard out the back. The Kittiwake. Found her under a tarpaulin up the coast, full of nettles.", "Folk say the Kittiwake's firewood. I say she's just having a long sit down."]},
    {recap: "The old coble in my yard, the Kittiwake. Full of nettles when I found her. Just having a sit down, I said.", lines: ["Took fourteen rotten planks off the Kittiwake this week. I've numbered every one in chalk, so I know where the new ones go.", "Larch, for the new planks. You steam them till they bend. Like me in a hot bath."]},
    {recap: "I told you I'd had fourteen rotten planks off the Kittiwake, numbered in chalk, with new larch in the steamer.", lines: ["Seven new planks on the Kittiwake now. Copper nails, every one by hand. My thumb's had a few and all.", "A coble's flat at the back, you know, so she can land on a beach stern first. Clever lass, a coble. Cleverer than me."]},
    {recap: "Seven of the Kittiwake's new planks on, copper nails by hand. And a few in my thumb, as I said.", lines: ["The Kittiwake's all planked now. I've caulked her seams with oakum and tar. The yard smells like eighteen ninety.", "Three coats of paint, red and white, like in the old photo of her. I'm not crying. It's the tar."]},
    {recap: "The Kittiwake's planked, caulked and painted red and white, like her old photo. Nearly ready, I told you.", needs: ["nanstorr:5"], lines: ["Launch day! The Kittiwake went down the slipway at high tide and floated like she'd never been away.", "Nan Storr's grandson Danny towed her round the harbour behind the Margaret Ann. The whole quay cheered. The gulls shouted. Same thing, really.", "Made you this, for keeping an old man company. The Kittiwake, in a bottle. Took me longer than the real one."], reward: "kittiwake"}
  ],
  priyajet: [
    {lines: ["I used to do spreadsheets in Leeds. Then I came to Saltwick for a weekend and saw jet in a shop window. Black as the night sky, and warm when you hold it.", "There was an old carver in the back of that shop, Mr Ellerby. I asked if he'd teach me. He said no. Then he said shut the door, there's a draught."]},
    {recap: "Mr Ellerby, the old jet carver, said no the first time I asked him to teach me. And to shut the door.", lines: ["I asked Mr Ellerby eleven times. Once a month, every month, on the train from Leeds.", "The eleventh time, Mr Ellerby sighed and handed me an apron. He said, 'You'll only keep coming back. Like the tide.'"]},
    {recap: "Eleven asks it took, one a month on the train from Leeds, before Mr Ellerby handed me an apron.", lines: ["The first piece of jet I ever carved, I dropped on the flagstones. It broke clean in two. I wanted the floor to swallow me.", "Mr Ellerby picked up both halves, looked at them for ages, and said, 'Now you've got two pieces. Carry on.'"]},
    {recap: "My first jet carving broke in two on the floor, and Mr Ellerby just said, 'Now you've got two pieces.'", lines: ["A year in, I carved a little kittiwake brooch. Mr Ellerby turned it over and over. Then he said, 'That'll do.'", "'That'll do' from Mr Ellerby is like a brass band from anyone else. I went and sat on the steps and grinned at the sea for an hour."]},
    {recap: "'That'll do,' Mr Ellerby said about my kittiwake brooch. From him, that's a brass band.", lines: ["The workshop is mine now. Mr Ellerby's retired, but he still pops in most days to tell me my polishing is too shy.", "I'm carving his favourite design for my shop sign: an ammonite curled round a little star. Mr Ellerby says the star's wonky. He's smiling when he says it.", "These are for you. Jet earrings, my own design. Mr Ellerby says they'll do. Which means they're wonderful."], reward: "jetear"}
  ]
};
