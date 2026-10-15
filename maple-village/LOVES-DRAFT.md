# Gift loves: draft (BUILT)

**Built 2026-10-15.** The live table is `src/data/loves.js` (FAVOURITES.md is regenerated from it). The owner approved all
the open points; how they were settled is under "As built" at the end. The rest of this file is the design as drafted.

Draft design for replacing today's favourites (see FAVOURITES.md) with a short, story-led list of loves per villager.
When drafted, nothing in `src/` had been changed. Every id below was checked against the live `ITEMS` table of the current dev
build (`dist/dev.html`), plus the runtime-registered families noted in the rules. Line numbers are as of 2026-10-15.

## Rules

- One gift per villager a day. A **love** is worth a whole heart, anything else half a heart (unchanged, `quests.js giveTo`).
- **Tomi is lactose intolerant: dairy gives him nothing** (no heart, not even a half). None of his loves are dairy.
- Each Honeybrook resident gets **6 to 10 loves**: 3 or 4 **story loves** (from their own chapters in `src/data/stories.js`),
  at most one **combination** love, and 2 or 3 **everyday loves** (no story, easy to find in Honeybrook).
- Every villager has one or two loves that need a day trip (bought there, or made at home with something learned there).
  None has all of them on a trip.
- Stories should let a reader work the loves out. Where a chapter gives no hook, a **new hint line** is proposed (one short
  bubble, appended to an existing chapter, in the villager's voice, British spelling, no em dashes).
- Each story love has a **special thank-you** line. Static items already support per-villager lines (`it.says[w]`, used in
  `core.js giveToVillager`), so these can go straight into `says`; dynamic items (ice creams, mill crafts) need a
  `thanks` field in the new loves table instead.
- Suggested shape: `src/data/loves.js` exporting `LOVES = {hana: {story: [{id, thanks}], combo: {match, thanks}, everyday: [id]}}`,
  with `core.js isFav(w, id)` checking only `LOVES` (no longer `it.to` lists or `ASKERS[w].likes`).
- **Routing:** `it.to` only decides who appears in the backpack's gift picker. A villager who loves an item must also
  appear there (picker = `it.to` plus whoever loves it). Ingredients (`matcha`, `flour`, `milk`...) and keepsakes
  (`k_bell`, `k_furin`...) have no `to`: today they can only be handed over in person with "give something"
  (`core.js:836 GIVE_KINDS`). Ice creams melt: in person, or with the Scoop Shack's delivery bike.

### Residents (confirmed)

`NPCS.filter(n => !n.tourist && !n.local && !n.kid)` gives exactly these 27: Hana, Mr Okada, Juniper, Bo, Auntie Lin,
Opal, Theo, Marco, Ines, Tomi, Posy, Hazel, Celeste, Farid, Mei, Felix, Elena, Amara, Mateo, Lila, Noor, Wren, Pilar,
Sofia, Tomo, Ada, Idris. (Grace is a tourist; Pip and the playground children are kids; Ronda, Kyoto, Jeju and Cinque
Terre people are `local`.) **Hazel, Amara, Lila and Tomo have no `STORIES` entry**, so their story loves hang on their
`npcs.js` lines, and their hint lines go into `npcs.js` `lines` (see open questions).

### Combinations: what can be detected today

| Family | Item ids | Detectable? |
|---|---|---|
| Bonbon boxes (`box4`, `box9`, `box16`, `-d` dark, `pairbox`) | one fixed id per size | **No.** `cocoa.js packBox` only records size and "all dark". Contents are lost. |
| Ice creams (`scoop.js registerItems`) | `gel_<cup/cone/float/waffle>_<ingredients>`, e.g. `gel_cone_apple-honey` | **Yes.** The recipe id (sorted ingredients) is inside the item id. Safer: add `ings: r.ings` to the ITEMS entry (ids turn `_` and `+` into `-`, so `fl_lavender` would split badly). |
| Mill crafts (`millcraft.js registerCraft`) | `mc_<kind>_<base>_<adds sorted, joined by ->`, e.g. `mc_soap_goatmilk_bq_lavender-honey` | **Yes.** Adds keep their `_`, so splitting on `-` works; adding `adds: r.adds` to the entry is cleaner. |
| Hampers (`xmas.js registerHampers`) | `hamper_<n>` | **Yes**, via `xmasState(F).hampers[].items`, but only at Christmas, Valentine's and Mother's Day. |
| Your own wines (`giftshop.js registerBottles`) | `wb_<shelf id>` | **Nearly.** The type is kept in `F.giftshop.bottles`, not on the ITEMS entry. One field (`type`) would make "a bottle of your red" a love. |

---

## Hana, runs the market

**Story loves**
- Mackerel [`mackerel`]. Sea by the pier in daylight, or Friday sunset fishing at the bay.
  Hook: `stories.js:46` "My father had a little blue boat." / "He'd bring home fish, and I'd make the toast."
  Thank-you: "Mackerel off the pier! Dad would've grilled it on the boat. I'll do the toast, love."
- Coastal heath honey [`honey_heath`]. **Day trip:** Coast Road, the Toadstool café.
  Hook: `stories.js:49` "Postman's toast: honey, butter, a pinch of sea salt."
  Thank-you: "Honey from the coast? It tastes of salt wind. That's going on Postman's toast."
- Jar of sea glass [`k_seaglass`]. Night market (Tue and Thu), Lior's stall; a keepsake, so in person.
  Hook: `stories.js:46` "I grew up by the sea, love." (plus the hint below).
  Thank-you: "Sea glass! I'd fill my pockets on the harbour wall. Green for luck, always green."

**Combination:** none.

**Everyday loves**
- Hotteok [`hotteok`], night market.
- Pineapple bun [`pineapplebun`], Sunday farmers' market bakery stall.
- Taro ball dessert [`taroballs`], night market.

**New hint lines**
- Append to `stories.js:46` (chapter 1): "I'd come home with my pockets full of sea glass. Green ones were lucky."

## Mr Okada, retired postmaster, unofficial well-keeper

**Story loves**
- Matcha powder [`matcha`]. Hana's market, Deli tab (also Kyoto's tea house). Ingredient, so in person.
  Hook: `stories.js:43` "This is my grandmother's tea scoop, from her lane in Kyoto."
  Thank-you: "Matcha. I shall use Grandmother's scoop. Slowly. She would rap my knuckles otherwise."
- Honey toast [`toast`]. Hana's market, Treats tab.
  Hook: `stories.js:41` "She hugged me. Then she gave me toast. I believe that's how Hana says thank you."
  Thank-you: "Toast. So this is how it feels. Thank you, truly."
- Box of wagashi [`wagashibox`]. **Day trip:** Kyoto, the sweet shop on the lane.
  Hook: `stories.js:43` "her lane in Kyoto" (plus the hint below).
  Thank-you: "Sweets from the lane. One meeting, one chance, she used to say. Here is another."

**Combination:** none.

**Everyday loves**
- Leek [`leek`], garden (winter, or the greenhouse).
- Fresh egg [`egg`], your hens.
- Kueh lapis [`kuehlapis`], Hana's market, Gifts tab (layers, in order: he approves).

**New hint lines**
- Append to `stories.js:43` (chapter 7): "After every lesson she gave her pupils a sweet from the wagashi shop on the lane."

## Juniper, librarian at the library

**Story loves**
- Mini paper lantern [`minilantern`]. Night market, Lior's stall.
  Hook: `stories.js:56` "We're doing a reading at the night market. Lior's making the lanterns."
  Thank-you: "One of Lior's lanterns. I'll read by it; quietly, at first."
- Natural handmade paper with wildflower petals [`pp_natural_petals`]. **Day trip:** made at your paperie in Montrose
  (Lavender Hills, once you own it).
  Hook: `stories.js:53` "I write them here at the library, before it opens." (plus the hint below).
  Thank-you: "Petal paper. The next poem goes on this. Don't look over my shoulder."
- Bouquet of sweet peas [`bq_sweetpea`]. Mei's flower farm shop (spring).
  Hook: `stories.js:54` "Someone's been leaving pressed flowers in the poetry section."
  Thank-you: "Sweet peas. I'll press one in the poetry section. Let Theo wonder."

**Combination:** none.

**Everyday loves**
- Blueberries [`blueberry`], garden (summer, or the greenhouse).
- Cosy socks [`cosysocks`], night market.
- Storybook [`storybook`], Hana's market, Gifts tab.

**New hint lines**
- Append to `stories.js:53` (chapter 2): "I'd write them on handmade paper if I could. The kind with petals pressed in."

## Bo, carpenter on Makers' Lane

**Story loves**
- Olive oil [`oliveoil`]. The old mill (Tomi's pressing, in the basket), or Ronda's market.
  Hook: `stories.js:76` "So I kept it. Oiled it every spring."
  Thank-you: "Good oil. The old sign'll get a rub this spring. *hums*"
- A whittled wren [`mk_bird`]. The makers' shelf in the winery gift shop (Wren's work).
  Hook: `stories.js:78` "My niece Wren's back from the city."
  Thank-you: "Our Wren made this? Look at that grain. She's got the hands for it."
- A red cedar bowl [`b_cedarbowl`]. **Day trip:** the Tablelands, the wood-turner's shop.
  Hook: `stories.js:75` "'Marchand & Fille', the old chocolate shop at the bay. Made it the year I left school." (plus the hint below).
  Thank-you: "Red cedar, turned proper. Smells like my first workshop. *hums*"

**Combination:** none.

**Everyday loves**
- Kopi [`kopi`], Hana's market, Gifts tab.
- Curry puff [`currypuff`], Hana's market, Gifts tab.
- Corn [`corn`], garden (summer, autumn).

**New hint lines**
- Append to `stories.js:75` (chapter 1): "Red cedar, that sign. Best wood there is. Smells like a pencil case."

## Auntie Lin, gardener

**Story loves**
- Tomato [`tomato`]. Garden (summer, autumn) or the greenhouse.
  Hook: `stories.js:62` "Then she asked why the tomato pages had poems in the margins."
  Thank-you: "Your tomatoes. Hm. Nearly as good as mine. That's a compliment, write it down."
- Leather notebook [`libreta`]. **Day trip:** Ronda, Antonio's leather workshop.
  Hook: `stories.js:63` "She brought me a notebook. Now I write them there."
  Thank-you: "A new notebook. More bad poems, then. Don't tell Juniper, she'll want to read them."
- Green tea from the slopes [`j_tea`]. **Day trip:** Jeju, the stone-house café.
  Hook: `stories.js:64` "one cottage, two armchairs, one teapot." (plus the hint below).
  Thank-you: "Green tea for the one teapot. Juniper will say she told me so."

**Combination:** none.

**Everyday loves**
- Strawberry [`strawberry`], garden (spring, or the greenhouse).
- Pumpkin [`pumpkin`], garden (autumn, winter).
- Honey lemon cordial [`honeylemon`], Sunday farmers' market, Felix's stall.

**New hint lines**
- Append to `stories.js:64` (chapter 4): "The teapot's for green tea now. Juniper's doing. I've come round to it."

## Opal, the banker

**Story loves**
- Box of gold chocolate coins [`sp_coins`]. The Cocoa Room's festival special (Chinese New Year only).
  Hook: `stories.js:94` "Margaux opened my first savings account. With a chocolate coin."
  Thank-you: "Gold coins. Margaux gave me one just like these. I never spent it."
- Box of 4 bonbons [`box4`]. The Cocoa Room, packed from the display case.
  Hook: `stories.js:92` "Can I tell you something, now the old chocolate shop at the bay is yours?"
  Thank-you: "Bonbons from Marchand & Fille's own kitchen. Best return I've ever had."
- Leather keyring [`llavero`]. **Day trip:** Ronda, Antonio's leather workshop.
  Hook: `stories.js:93` "I kept saying 'not for sale'." (plus the hint below).
  Thank-you: "A keyring. The old shop key goes on this one. Still never used, mind."

**Combination:** none.

**Everyday loves**
- Peach [`peach`], the orchard (summer).
- Pearl hair clip [`pearlclip`], night market, Mina's stall.
- Jar of wildflower honey [`honey`], Wildflower Farm's hives or Felix's market stall (a full jar, her favourite sight).

**New hint lines**
- Append to `stories.js:93` (chapter 2): "I still have a key to the place on my keyring. I never used it once."

## Theo, town hall clerk

**Story loves**
- Pressed-flower cards [`mk_cards`]. The makers' shelf in the winery gift shop (Auntie Lin's).
  Hook: `stories.js:69` "I've started leaving them pressed flowers. Is that strange?"
  Thank-you: "Pressed flowers. Filed under 'J.', officially. Unofficially, under 'lovely'."
- Postcard of the bridge [`postal`]. **Day trip:** Ronda, the postcard stall at Doña Carmen's.
  Hook: `stories.js:68` "And the Gazette's poems, the ones signed 'J.', in my album." (plus the hint below).
  Thank-you: "A Spanish stamp! Straight into the album. Next to the little bird from 1962."
- Chrysanthemum tea [`chrystea`]. Night market, Kai's stall.
  Hook: `stories.js:71` "Since Juniper caught me with the pressed flowers, we have tea in the trophy room."
  Thank-you: "Tea for the trophy room. Two cups, I think. Officially, one."

**Combination:** none.

**Everyday loves**
- Bag of coffee beans [`coffee`], Hana's market, Deli tab.
- Loaf of bread [`loaf`], baked in the wine shop's oven.
- Honey castella [`castella`], night market, Wen's stall.

**New hint lines**
- Append to `stories.js:68` (chapter 1): "Postcards too, for the stamps. Officially for the stamps."

## Marco, keeps the vineyard

**Story loves**
- Milk chocolate bar [`bar_milk`]. The Cocoa Room.
  Hook: `stories.js:30` "Margaux would bring chocolate up to the vines at harvest."
  Thank-you: "Chocolate, up at the vines. Like the old harvests. Sit with me a minute."
- Bellbird Pinot Noir [`b_pinot`]. **Day trip:** Bellbird Valley, the tasting room.
  Hook: `stories.js:30` "We ate it with the new red, sitting on the barrels."
  Thank-you: "Someone else's red. Not bad. Not Margaux, but not bad."
- Fig [`fig`]. The orchard (autumn).
  Hook: none yet (hint below).
  Thank-you: "A ripe fig. She always took the ripest. I let her."

**Combination:** none today. "A bottle of your own red" (`wb_*` of type red) would be the perfect one (open questions).

**Everyday loves**
- Sourdough loaf [`sourdough`], Sunday farmers' market bakery stall.
- Peas [`pea`], garden (spring, or the greenhouse).
- Craft lager [`lager`], Sunday farmers' market, Ben's stall.

**New hint lines**
- Append to `stories.js:30` (chapter 2): "Figs from the old tree by the barrels, too. She always took the ripest."

## Ines, vineyard hand

**Story loves**
- Jar of marinated olives [`olivejar`]. Sunday farmers' market, Elena's stall.
  Hook: `stories.js:139` "Half the olives in this valley are that tree's grandchildren."
  Thank-you: "Olives! Tomás's tree's great-great-grandchildren, probably. Family dinner."
- Almond cake [`tartaalm`]. **Day trip:** Ronda, the sweet shop.
  Hook: `stories.js:142` "her olive oil cake again, the one from Tomás's village."
  Thank-you: "Cake from near Tomás's village! Abuela will say hers is better. It is. Shh."
- A carved wooden spoon [`mk_spoon`]. The makers' shelf in the winery gift shop (Bo's).
  Hook: `stories.js:141` "Tomás carved it from a branch of that tree in 1913."
  Thank-you: "A carved spoon, like Tomás's! This one's for using. Stubborn, like me."

**Combination:** none.

**Everyday loves**
- Ice cream [`icecream`], Hana's market, Gifts tab.
- Ginger beer [`gingerbeer`], Sunday farmers' market, Ben's stall.
- Cherry [`cherry`], the orchard (spring).

**New hint lines:** none needed.

## Tomi, works the press at the old mill (dairy gives him nothing)

**Story loves**
- Jar of olives [`olives`]. Hana's market, Deli tab. Ingredient, so in person.
  Hook: `stories.js:109` "Best thing either of us did. Olives don't send emails."
  Thank-you: "Olives. No inbox, no meetings. Just olives. Perfect."
- Oat milk latte [`oatlatte`]. Hana's market, Gifts tab. Dairy-free.
  Hook: none yet (hint below).
  Thank-you: "Oat latte. City Tomi's drink, but it's allowed on Saturdays."
- A block of surf wax [`b_wax`]. **Day trip:** the Coast Road, Swell Surf Shop.
  Hook: none yet (same hint below; his weekend paddleboard is in his routine, `npcs.js:931`).
  Thank-you: "Surf wax! The board's been slippy for weeks. Don't tell Ines I fell in."

**Combination:** none.

**Everyday loves**
- Box of 4 dark bonbons [`box4d`], the Cocoa Room (all dark shells, dairy-free).
- Dalgona candy [`dalgona`], night market, Jae's stall.
- Beef jerky [`jerky`], Hana's market, Gifts tab.

**New hint lines**
- Append to `stories.js:110` (chapter 3): "In the city it was oat lattes at my desk. Now it's surf wax and the sea."

## Posy, runs the gift shop at the winery

**Story loves**
- A second-hand book [`b_oldbook`]. **Day trip:** the Tablelands, the book barn.
  Hook: `stories.js:113` "I've read three books about people like Tomi."
  Thank-you: "A new old book! Number four on people like Tomi, possibly. I'll report back."
- Coast Road tea towel [`b_teatowel`]. **Day trip:** the Coast Road, the Point gift shop.
  Hook: `npcs.js:157` "the kind with tea towels and fudge" and `npcs.js:162` "Tea towels. One day. Trust me." (story hint below).
  Thank-you: "A tea towel! You understand me. That's psychology, that is."
- Pastel highlighters [`highlighters`]. Hana's market, Gifts tab.
  Hook: `stories.js:113` (the three books, plus the advice in `stories.js:114`).
  Thank-you: "Highlighters! Book four is getting so much yellow. And pink. For feelings."

**Combination (not feasible today):** a bonbon box with at least one honey heart bonbon (honey filling, heart mould;
`npcs.js:162` "The honey heart bonbons go first. Every time."). Box contents aren't kept, so this can't be detected.
Until they are, use the single item: Honey sticks [`honeysticks`], Sunday farmers' market, Felix's stall.
Thank-you (either): "Honey! Of course it's honey. It always goes first."

**Everyday loves**
- Brown sugar bubble tea [`bubbletea`], Hana's market, Gifts tab.
- Rabbit night light [`rabbitlamp`], night market, Lior's stall.

**New hint lines**
- Append to `stories.js:113` (chapter 1): "I still can't pass a tea towel without buying it. Professional habit."

## Hazel, runs the Mill Shop (no chapters yet)

**Story loves** (hooks from `npcs.js`)
- Rosemary [`rosemary`]. The greenhouse. Ingredient, so in person.
  Hook: `npcs.js:180` "Rosemary and lemon: clears your head right out." / "rosemary for the dads"
  Thank-you: "Rosemary. Smell that. Clears your head right out. Told you."
- Lemon [`lemon`]. The orchard (spring, winter).
  Hook: `npcs.js:180` (same line).
  Thank-you: "A good lemon. Half for soap, half for my tea. Trust me."
- A block of Provence soap [`b_savon`]. **Day trip:** the Lavender Hills, the soap maker.
  Hook: `npcs.js:169` "I made soap for forty years, in a shed behind my house." (plus the hint below).
  Thank-you: "Cut from the block! Forty years and I still want to know how they get it so smooth."

**Combination (feasible):** a lavender and honey soap you made at the mill bench: `mc_soap_goatmilk_bq_lavender-honey`
or `mc_soap_oliveoil_bq_lavender-honey` (match: `mill === "soap"` and adds are exactly `bq_lavender` + `honey`).
Hook: `npcs.js:169` "Lavender and honey, that's the one." and `npcs.js:180` "Lavender and honey. Every time."
Thank-you: "Lavender and honey. Every time. You've a gift for this, love."

**Everyday loves**
- Fig and walnut jam [`figjam`], Sunday farmers' market, Elena's stall.
- Apple cider [`cider`], Sunday farmers' market, Ben's stall (her Friday glass).

**New hint lines**
- Add to her `lines` (`npcs.js:180`): "The soap maker in the Lavender Hills cuts it like cheese. I'd go back just for that."

## Celeste, runs the wine shop counter

**Story loves**
- Wine and chocolate pairing box [`pairbox`]. The Cocoa Room (a bottle from the shelf and 4 bonbons).
  Hook: `stories.js:26` "She always said wine and chocolate are old friends."
  Thank-you: "Wine and chocolate, old friends. Maman would have opened this tonight."
- Dark chocolate bar [`bar_dark`]. The Cocoa Room.
  Hook: `stories.js:22` "I used to sit under the counter eating the broken bits."
  Thank-you: "I'll break it myself, for old times' sake. Under the counter, of course."
- Hazelnuts [`hazelnut`]. Hana's market, Deli tab. Ingredient, so in person.
  Hook: `stories.js:25` "Here: Grand-père Henri's recipe book." (its reward is "Henri's hazelnut pralines", `game/stories.js:61`).
  Thank-you: "Hazelnuts, for Grand-père's pralines. His page has a thumbprint on it, you know."
- A box of calissons [`b_calissons`]. **Day trip:** the Lavender Hills, the nougat shop.
  Hook: none yet (hint below).
  Thank-you: "Calissons! Maman's Christmas. Little almond boats. Merci."

**Combination (not feasible today):** a bonbon box with a hazelnut bonbon and a red wine bonbon (Henri and Margaux,
`stories.js:25-26`). Needs box contents (open questions). Until then the pairing box stands in.
Thank-you: "Grand-père's hazelnut and Maman's red, in one box. I need to sit down."

**Everyday loves**
- Butter croissant [`croissant`], Sunday farmers' market bakery stall.
- Red grapes [`grape_red`], the vineyard. Ingredient, so in person.

**New hint lines**
- Append to `stories.js:23` (chapter 3): "Every Christmas she bought calissons from the nougat shop in the hills. Little almond boats."

## Farid, works the fruit orchard

**Story loves**
- Pistachios [`pistachio`]. Hana's market, Deli tab. Ingredient, so in person.
  Hook: `stories.js:200` "with Felix's honey and the orchard's pistachios."
  Thank-you: "Pistachios! Uncle's pastries again this week. Pilar gets the first tray."
- Jar of orchard blossom honey [`honey_blossom`]. Wildflower Farm's hives (the blossom weeks).
  Hook: `stories.js:200` "with Felix's honey", and `stories.js:98` "it's the orchard's blossom honey, not mine."
  Thank-you: "Orchard blossom. My trees made this, whatever Felix says."
- Bag of flour [`flour`]. Hana's market, Deli tab. Ingredient, so in person.
  Hook: `stories.js:198` "Up at four, flour in my eyebrows."
  Thank-you: "Flour! I'll be up at four. Old habits. Cake at three, then."
- Saffron [`azafran`]. **Day trip:** Ronda, the spice stall at the market.
  Hook: none yet (hint below).
  Thank-you: "Saffron. Uncle would lock this in the till. I'll use just a pinch."

**Combination:** none.

**Everyday loves**
- Egg waffle [`eggwaffle`], night market, Wen's stall.
- Sweet pumpkin porridge [`hobakjuk`], night market, Jae's stall.

**New hint lines**
- Append to `stories.js:198` (chapter 1): "My uncle kept his saffron in a tin by the till. Like money, he said."

## Mei, works the flower farm

**Story loves**
- Bouquet of tulips [`bq_tulip`]. Mei's flower farm shop, or your own tulips (spring).
  Hook: `stories.js:120` "Tulips were her favourite."
  Thank-you: "Tulips. Her favourite. I'll put them by her photo."
- Bouquet of roses [`bq_rose`]. Mei's flower farm shop (spring to autumn).
  Hook: `stories.js:117` "My mother used to sing to the roses. I thought everybody did."
  Thank-you: "Roses. I'll sing to them tonight. Don't laugh."
- A bucket of proteas [`b_proteas`]. **Day trip:** Bellbird Valley, the farm-gate shed.
  Hook: none yet (hint below).
  Thank-you: "Proteas! The bravest flowers. She'd have loved these."

**Combination:** none.

**Everyday loves**
- Grass jelly drink [`grassjelly`], night market.
- Honeycomb [`honeycomb`], Wildflower Farm's hives or Felix's market stall.
- Sandalwood incense [`incense`], night market, Lior's stall.

**New hint lines**
- Append to `stories.js:118` (chapter 2): "My mother loved proteas too. She said they were the bravest flowers."

## Felix, keeps the bees at Wildflower Farm

**Story loves**
- Apple [`apple`]. The orchard (autumn), or Hana's market, Treats tab (all year).
  Hook: `stories.js:97` "A swarm that landed in the old apple tree in the orchard."
  Thank-you: "An apple from that tree? That's where it all started. Cardboard box and all."
- Sunflower honey [`honey_sun`]. **Day trip:** the Lavender Hills, the honey house on Sunflower Hill.
  Hook: `stories.js:98` "Farid still says it's the orchard's blossom honey, not mine." (plus the hint below).
  Thank-you: "Someone else's honey. Lovely. Mine's better. The bees agree."

**Combination (feasible):** an ice cream with both apple and honey in it, any format, from the Scoop Shack
(e.g. `gel_cone_apple-honey`, a dairy-free sorbet; or `gel_cup_apple-honey-milk`; dipped ones too). Match: the
recipe's ingredients include `apple` and `honey`.
Hook: `stories.js:97` (the apple tree) and `stories.js:98` (the honey).
Thank-you: "Apple and honey, the swarm in a cone. The bees decided this one."

**Everyday loves**
- Sunflower [`sunflower`], garden (summer, autumn).
- Bouquet of cosmos [`bq_cosmos`], Mei's flower farm shop (summer).
- Root beer [`rootbeer`], Sunday farmers' market, Ben's stall.

**New hint lines**
- Append to `stories.js:98` (chapter 2): "One day I'll taste someone else's honey. Sunflower, maybe. Just to check mine's better."

## Elena, runs the dairy at Wildflower Farm

**Story loves**
- Egg tart [`eggtart`]. Sunday farmers' market bakery stall.
  Hook: `stories.js:103` "He used to bring me egg tarts on Fridays."
  Thank-you: "Egg tarts! Is it Friday? It feels like Friday."
- Valley coffee beans [`b_beans`]. **Day trip:** Bellbird Valley, the coffee caravan.
  Hook: `stories.js:102` "Grey suits, grey coffee."
  Thank-you: "Proper coffee. Not grey at all. My old bank would never."
- Carrot [`carrot`]. Garden (spring, autumn, winter).
  Hook: `stories.js:104` "Bought two goats with my bonus. Best trade I ever made."
  Thank-you: "Carrots! Daisy will pretend not to care. She'll care."

**Combination:** none.

**Everyday loves**
- Scallion pancake [`scallion`], night market.
- Beeswax food wraps [`beewraps`], Sunday farmers' market, Felix's stall.
- Oat and milk soap [`soap_oat`], Sunday farmers' market, Grace's stall.

**New hint lines:** none needed.

## Amara, serves at the Cocoa Room (no chapters yet)

**Story loves** (hooks from `npcs.js`)
- White chocolate bar [`bar_white`]. The Cocoa Room.
  Hook: `npcs.js:266` "The dark one's flying off the wall today." (plus the hint below).
  Thank-you: "White chocolate! My secret's out. Don't tell Mateo."
- Furoshiki cloth [`furoshiki`]. **Day trip:** Kyoto, the yukata shop.
  Hook: `npcs.js:265` "I wrap, I sell, and I sneak the broken bits."
  Thank-you: "A wrapping cloth! I'm going to wrap everything. Even you."

**Combination:** none.

**Everyday loves**
- Coconut shake [`coconutshake`], night market, Kai's stall.
- Mango mochi [`mangomochi`], night market, Wen's stall.
- Banana bread [`bananabread`], Sunday farmers' market bakery stall.
- Dragon's beard candy [`dragonbeard`], night market, Wen's stall.

**New hint lines**
- Add to her `lines` (`npcs.js:266`): "Everyone wants the dark. I'm a white chocolate girl, secretly."

## Mateo, kitchen hand at the Cocoa Room

**Story loves**
- Bar of dark chocolate [`chocolate`]. Hana's market, Deli tab. Ingredient, so in person.
  Hook: `stories.js:88` "I wanted to know why chocolate snaps."
  Thank-you: "Let's test the snap. For science, boss."
- Churros [`churros`]. **Day trip:** Ronda, the sweet shop.
  Hook: `stories.js:87` "My abuela Rosario worked at the old chocolate shop" (plus the hint below).
  Thank-you: "Churros! Abuela's Sundays. Now I need very thick chocolate."

**Combination:** none.

**Everyday loves**
- Popcorn chicken [`popcornchicken`], night market, Yun's stall.
- Braised pork rice [`lurourice`], night market, Yun's stall.
- Cinnamon bun [`cinnamonbun`], Sunday farmers' market bakery stall.
- Kimbap roll [`kimbap`], night market, Jae's stall.

**New hint lines**
- Append to `stories.js:88` (chapter 2): "On Sundays she still makes churros, with chocolate thick enough to stand a spoon in."

## Lila, serves at the Cocoa Room (no chapters yet)

**Story loves** (hooks from `npcs.js`)
- Box of 9 bonbons [`box9`]. The Cocoa Room.
  Hook: `npcs.js:286` "I'm working my way through every bonbon. For research."
  Thank-you: "Nine bonbons! That's a whole week of research."
- Tangerine chocolates [`j_choco`]. **Day trip:** Jeju, the market hall.
  Hook: `npcs.js:286` (same), plus the hint below.
  Thank-you: "Tangerine chocolates from Jeju! Research, international edition."

**Combination:** none (a box with every bonbon different would suit her, but box contents aren't kept).

**Everyday loves**
- Star charm [`starcharm`], night market, Tomás's stall ("Someone asked if we deliver to the moon", `npcs.js:287`).
- Tanghulu [`tanghulu`], night market.
- Bungeoppang [`bungeoppang`], night market, Jae's stall.
- Velvet scrunchie [`scrunchie`], night market.

**New hint lines**
- Add to her `lines` (`npcs.js:287`): "Next on my research list: those tangerine chocolates from Jeju."

## Noor, finds homes for rescued pets

**Story loves**
- Adopt-a-joey certificate [`b_adopt`]. **Day trip:** Bellbird Valley, the wildlife hospital. Keepsake, so in person.
  Hook: `stories.js:123` "I used to run a rescue in the city. Thirty animals, one tiny yard."
  Thank-you: "A joey, adopted? Happy tears. Sorry. Happy tears."
- Cat plushie keychain [`catplush`]. Night market, Tomás's stall.
  Hook: `stories.js:124` "I found homes for every single one." (plus the hint below).
  Thank-you: "A little cat. Just like hers. I'm not crying, you're crying."

**Combination:** none.

**Everyday loves**
- Peas [`pea`], garden (spring, or the greenhouse).
- Pumpkin [`pumpkin`], garden (autumn, winter).
- Sugarcane juice [`sugarcane`], night market, Kai's stall.
- Egg bread [`eggbread`], night market.

**New hint lines**
- Append to `stories.js:124` (chapter 2): "The first kitten I rehomed, I kept a little cat keyring to remember her."

## Wren, Honeybrook Woods' ranger

**Story loves**
- Chestnuts [`chestnut`]. The foraging patch in the woods (winter).
  Hook: `stories.js:81` "She planted the chestnut tree by the foraging patch."
  Thank-you: "Gran's chestnuts. Roast them slow. She'd say the same."
- Wind chime [`k_furin`]. **Day trip:** Kyoto, the pottery. Keepsake, so in person.
  Hook: `stories.js:83` "I missed the sound of the waterfall every single day."
  Thank-you: "A chime. For the cabin window. Nearly as good as the falls."
- A clay kingfisher [`b_claybird`]. **Day trip:** the Tablelands, the Mistfall gallery.
  Hook: `npcs.js:846` "Kingfisher by the pool this morning. Blink and you miss it." (story hint below).
  Thank-you: "A kingfisher that sits still. First time for everything."

**Combination:** none.

**Everyday loves**
- Blackberries [`blackberry`], the foraging patch (summer).
- Wild mushrooms [`mushroom`], the foraging patch (autumn).
- Knit beanie [`beanie`], night market, Sora's stall.

**New hint lines**
- Append to `stories.js:82` (chapter 2): "From the lookout I'd watch the kingfisher work the pool. Still my favourite bird."

## Pilar, cooks in the wine shop kitchen

**Story loves**
- Yemas del Tajo [`yemas`]. **Day trip:** Ronda, the sweet shop (and Doña Carmen's reward).
  Hook: `stories.js:132` "Mamá used to say Carmen's yemas were the only sweets worth the sugar."
  Thank-you: "Carmen's yemas. Mamá was right. Worth every grain of sugar."
- Garlic [`garlic`]. The greenhouse. Ingredient, so in person.
  Hook: `stories.js:132` "I'm making Mamá's salmorejo tonight."
  Thank-you: "Garlic for the salmorejo. Taste this later. No, really, taste it."
- Milk [`milk`]. Hana's market, Deli tab. Ingredient, so in person.
  Hook: `stories.js:130` "I told her: let the milk be milk."
  Thank-you: "Good milk. Let it be milk. Tell Sofia I said so."

**Combination:** none.

**Everyday loves**
- Potato [`potato`], garden ("Bring me tomatoes and I'll bring you bravas").
- Pepper [`pepper`], garden (summer).
- Sardine [`sardine`], the sea by the pier.

**New hint lines:** none needed.

## Sofia, runs the counter at the Scoop Shack

**Story loves**
- Nonna's fior di latte, made by you: a gelato of milk and nothing else, any format
  (`gel_cup_milk`, `gel_cone_milk`, `gel_float_milk`, `gel_waffle_milk`; not dipped). Feasible: the recipe id is exactly `milk`.
  Hook: `stories.js:194` "Her fior di latte. It's only milk and sugar" and `stories.js:195` "'Let the milk be milk.'"
  Thank-you: "Fior di latte, the way Nonna made it. Ciao, Nonna."
- Your limoncino [`limoncino`]. Made in your drying loft (unlocked by a first trip to Cinque Terre; three lemons, five days).
  Hook: none yet (hint below).
  Thank-you: "Limoncino! Into the freezer, for emergencies. Like Nonna."

**Combination:** none (the fior di latte above is the only recipe-matched love she needs).

**Everyday loves**
- Lemon [`lemon`], the orchard (spring, winter).
- Silk hair ribbon [`hairribbon`], night market, Mina's stall.
- Box of mochi [`mochi`], Hana's market, Gifts tab.
- Sweet potato balls [`qqballs`], night market, Wen's stall.

**New hint lines**
- Append to `stories.js:193` (chapter 1): "She kept limoncino in the freezer too. For emergencies, she said."

## Tomo, serves on the deck and rides the delivery bike (no chapters yet)

**Story loves**
- XXL fried chicken [`friedchicken`]. Night market.
  Hook: `stories.js:128` (Pilar's chapter, about him) "Eats like a horse, works like one too."
  Thank-you: "XXL. Finally, a portion my size."
- Jamón [`jamon`]. **Day trip:** Ronda, the market. Ingredient, so in person.
  Hook: none yet (hint below).
  Thank-you: "Jamón! It won't reach the kitchen. Don't tell Tía Pilar."

**Combination (feasible):** any ice cream with pistachio in it, any format (e.g. `gel_cone_milk-pistachio`).
Match: the recipe's ingredients include `pistachio`.
Hook: `npcs.js:879` "I dream in pistachio."
Thank-you: "Pistachio. I literally dreamt about this. Last night."

**Everyday loves**
- Gua bao [`guabao`], night market, Yun's stall.
- Dumpling [`dumpling`], Hana's market, Treats tab.
- Tteokbokki [`tteokbokki`], night market.

**New hint lines**
- Add to his `lines` (`npcs.js:879`): "Tía Pilar brings jamón back from Ronda. Most of it reaches the kitchen."

## Ada, runs the haberdashery on Makers' Lane

**Story loves**
- Little brass bell [`k_bell`]. Night market, Tomás's stall. Keepsake, so in person.
  Hook: `stories.js:204` "She ran a haberdashery by the sea, with a bell over the door." and `stories.js:206` "I kept the bell, the scissors and the jar."
  Thank-you: "A brass bell. It'll go over the door. Mother's can have a rest."
- Linen tea towel [`c_linen`]. **Day trip:** Cinque Terre, the lemon shop.
  Hook: `npcs.js:892` "Linen creases. That's how you know it's linen." (story hint below).
  Thank-you: "Proper linen. Look at it crease. That's how you know."

**Combination:** none.

**Everyday loves**
- Velvet bow clip [`bowclip`], night market, Mina's stall.
- Striped socks [`stripesocks`], night market, Sora's stall.
- Raspberries [`raspberry`], garden (canes first come from Bellbird Valley).
- Tulip [`tulip`], garden (autumn to spring).

**New hint lines**
- Append to `stories.js:204` (chapter 1): "She sold linen too, the good kind. It creased like it meant it."

## Idris, the tailor on Makers' Lane

**Story loves**
- A record of bush ballads [`b_record`]. **Day trip:** Bellbird Valley, the op shop. Keepsake, so in person.
  Hook: `stories.js:211` "He said the short arm was for shaking hands and the long one was for dancing."
  Thank-you: "Something to dance to. Long arm first, Grandfather would say."
- Leather belt [`cinturon`]. **Day trip:** Ronda, Antonio's leather workshop.
  Hook: none yet (hint below).
  Thank-you: "Hand-stitched. Even stitches, every one. I'm almost jealous."

**Combination:** none.

**Everyday loves**
- Pear [`pear`], the orchard (autumn).
- Fresh egg [`egg`], your hens.
- Pepper bun [`pepperbun`], night market, Yun's stall.
- Rose hand cream [`handcream`], Sunday farmers' market, Grace's stall (a tailor's hands).

**New hint lines**
- Append to `stories.js:211` (chapter 2): "He wore it with a leather belt older than me. I polished it every wedding."

---

## Open questions

1. **Bonbon box contents.** Celeste's hazelnut and red wine box, Posy's honey heart and a "one of every flavour"
   box for Lila all need `cocoa.js packBox` / `packPairing` to remember what went in. Suggestion: mint a
   content-keyed id per packed box (like hampers: `F.cocoa.boxes[]` plus a register function, the item carrying
   `fills`), at the cost of boxes no longer stacking by size. Until then those loves use the single-item fallbacks above.
2. **Ice creams and mill crafts** are feasible today by parsing the id, but adding `ings` (scoop.js registerItems)
   and `adds` (millcraft.js registerCraft) to their ITEMS entries would make the matchers safe for ingredients with
   underscores (`fl_lavender`, `honey_lav`).
3. **Your own red wine for Marco** (and Celeste): `giftshop.js registerBottles` would need to copy `b.type` onto the
   ITEMS entry, so "any `wb_*` of type red" can be a love. Perfect fit for `stories.js:30`.
4. **One-off story rewards** (`s_toast` Postman's toast, `s_praline` Henri's pralines, `s_nonna` Nonna's fior di latte)
   would be the best loves for Okada, Celeste and Sofia, but you only ever get two. Should Hana sell Postman's toast
   once chapter 4 is told (Treats tab), and the Cocoa Room make Henri's pralines from the recipe book?
5. **Gold chocolate coins** (`sp_coins`) are only made at Chinese New Year, so Opal's best love is seasonal. Make a
   small year-round tin of coins at the Cocoa Room?
6. **Kitchen dishes aren't items.** Pilar's salmorejo, Ines's abuela's olive oil cake and Farid's honey and pistachio
   pastries live on the wine shop menu only. A "plate to take away" item would give perfect story loves.
7. **Items that don't exist yet but would be perfect:** plums (Farid and Wilf's crate of plums, `npcs.js:201`; there's
   no plum tree), fudge (Posy, `npcs.js:157`), a card of buttons (Ada), a rubber stamp (Theo, `stories.js:55`), ink or a
   brush (Okada's gallery work).
8. **Hazel, Amara, Lila and Tomo have no story chapters.** Their hint lines go into `npcs.js` `lines` for now. Worth a
   short story each (Hazel's soap shed and Grace; Amara and Lila at the Cocoa Room; Tomo and Tía Pilar)?
9. **Old favourites:** should the quest board's `ASKERS[w].likes` (`quests.js:69`) stop counting as loves once
   `LOVES` exists? This draft assumes yes, so each villager has only the 6 to 10 above.
10. **Tomi's "dairy gives nothing"** needs a dairy flag the gift code can read (today dairy is only implied by `to`
    lists, `chz_*` ids and `r.dairy` on gelato). Suggest `dairy: true` on dairy items.
11. **Gated loves:** Juniper's petal paper needs the Montrose paperie (a 1,500-coin goal); Ada's raspberries need canes
    from Bellbird Valley; Sunday market and night market stalls rotate stock (`stall-goods.js POOLS`), so a few
    everyday loves won't be on sale every week.

---

## As built (2026-10-15)

- `src/data/loves.js` holds every villager's loves; `core.js isFav` only asks it (ASKERS likes and `to` lists no longer count).
  A story love speaks its own thank-you in person, sent round and in the thank-you note (still one heart).
- Box contents (1): `cocoa.js packBox` and `packGrand` mint content-keyed ids (`box4_<key>`, `box9d_<key>`...), kept in
  `F.cocoa.boxes` and registered on load. Celeste's hazelnut and red wine box and Posy's honey heart box are now her
  combinations (Posy's honey sticks fallback dropped). Plain boxes from old saves still stack, give and sell. Pairing
  boxes stay one stacking item: the gift shop's wine corner counts and prices them that way, and no love needs their contents.
- Ice creams carry `ings`, mill crafts `adds`, so the matchers don't parse ids (2). Marco's own-red love (3) not built.
- One-off rewards (4): Hana sells Postman's toast (Treats, 9) once her chapter 4 is told; the Cocoa Room's bonbon table
  makes Henri's pralines from the recipe book (6 milk pieces and a hazelnut make 2); the Scoop Shack counter makes Nonna's
  fior di latte (a bottle of milk makes a cup). Gated by `stories.js storyGiven`, which reads what's been heard. Mr Okada
  loves Postman's toast (not the honey toast), Celeste Henri's pralines (not loose hazelnuts), Sofia Nonna's cup and any
  plain milk gelato you make.
- Gold coins (5): a little tin at the bonbon table all year (6 milk pieces make 3, 5 coins each); Opal loves it and the
  Chinese New Year box.
- Kitchen dishes (6): box a plate of salmorejo, olive oil cake or honey and pistachio pastries from the day's batch at the
  stove (`kitchen.js TAKEAWAY`): story loves for Pilar, Ines and Farid.
- New items (7): plums (a plum tree, summer and autumn; Farid), fudge (Hana's Gifts tab; Posy), a card of buttons (Ada's
  Buttons tab; Ada), a rubber stamp (the post office's stamps and scales; Theo). Ink and brushes not built.
- Hazel, Amara, Lila and Tomo (8): hint lines are in their `npcs.js` lines; their stories are for later.
