// What each Honeybrook villager loves (the loves round, from LOVES-DRAFT.md): a love is worth a whole heart, anything
// else half (game/quests.js giveTo; Tomi gets nothing from dairy, game/core.js isDairy). Each villager has 6 to 10:
//   story     3 or 4 from their own chapters (data/stories.js), each with its own thank-you line
//   combo     at most one combination, a matcher over what's inside a made thing (a bonbon box, an ice cream, a mill
//             soap), with its own thank-you line
//   everyday  2 to 4 easy ones from round Honeybrook (an id, or {id, thanks})
// A love is {id, thanks} or {match, what, thanks}. match(it) reads the ITEMS entry: a packed bonbon box keeps
// `bonbons` [{shell, fills, shape}] (cocoa.js packBox), an ice cream `ings` and `dip` (scoop.js registerItems), a mill
// craft `mill` and `adds` (millcraft.js registerCraft). A love for a box id ("box4") also covers every packed box of
// that kind (`boxOf`), and a wrapped gift counts as what's inside it.
// ASKERS likes (quests.js) and the `to` lists on items no longer make anything a love: they only steer requests and
// who a present's sent round to.
import { ITEMS } from "./items.js";

// matchers
const box = f => it => !!(it && Array.isArray(it.bonbons) && f(it.bonbons));
const has = (b, fill) => b.some(x => (x.fills || []).includes(fill));
const gel = f => it => !!(it && it.gel && Array.isArray(it.ings) && f(it.ings, it));
const soapOf = adds => it => !!(it && it.mill === "soap" && Array.isArray(it.adds) && it.adds.length === adds.length && adds.every(a => it.adds.includes(a)));

export const LOVES = {
  hana: {story: [
      {id: "mackerel", thanks: "Mackerel off the pier! My father would've grilled it on the boat. I'll do the toast, love."},
      {id: "honey_heath", thanks: "Honey from the coast? It tastes of salt wind. That's going on Postman's toast."},
      {id: "k_seaglass", thanks: "Sea glass! I'd fill my pockets on the harbour wall. Green for luck, always green."}],
    everyday: ["hotteok", "pineapplebun", "taroballs"]},
  okada: {story: [
      {id: "matcha", thanks: "Matcha. I shall use Grandmother's scoop. Slowly. She would rap my knuckles otherwise."},
      {id: "s_toast", thanks: "Postman's toast. So this is how it feels. Thank you, truly."},
      {id: "wagashibox", thanks: "Sweets from the lane. One meeting, one chance, she used to say. Here is another."}],
    // round 231: rum and raisin (Saltwick's dark rum and raisins from the drying loft), the special at the Scoop Shack
    combo: {what: "a rum and raisin ice cream", match: gel(i => i.includes("rum") && i.includes("raisins")), thanks: "Rum and raisin. The flavour of every seaside I posted a letter from. I shall eat it on the bench by the post box."},
    everyday: ["leek", "egg", "kuehlapis"]},
  juniper: {story: [
      {id: "minilantern", thanks: "One of Lior's lanterns. I'll read by it; quietly, at first."},
      {id: "pp_natural_petals", thanks: "Petal paper. The next poem goes on this. Don't look over my shoulder."},
      {id: "bq_sweetpea", thanks: "Sweet peas. I'll press one in the poetry section. Let Theo wonder."}],
    everyday: ["blueberry", "cosysocks", "storybook"]},
  bo: {story: [
      {id: "oliveoil", thanks: "Good oil. The old sign'll get a rub this spring. *hums*"},
      {id: "mk_bird", thanks: "Our Wren made this? Look at that grain. She's got the hands for it."},
      {id: "b_cedarbowl", thanks: "Red cedar, turned proper. Smells like my first workshop. *hums*"}],
    everyday: ["kopi", "currypuff", "corn"]},
  lin: {story: [
      {id: "tomato", thanks: "Your tomatoes. Hm. Nearly as good as mine. That's a compliment, write it down."},
      {id: "libreta", thanks: "A new notebook. More bad poems, then. Don't tell Juniper, she'll want to read them."},
      {id: "j_tea", thanks: "Green tea for the one teapot. Juniper will say she told me so."}],
    everyday: ["strawberry", "pumpkin", "honeylemon"]},
  opal: {story: [
      {id: "coin_tin", thanks: "Gold coins. Margaux gave me one just like these. I never spent it."},
      {id: "sp_coins", thanks: "A whole box of gold coins! Margaux would call that a sound investment."},
      {id: "box4", thanks: "Bonbons from Marchand & Fille's own kitchen. Best return I've ever had."},
      {id: "llavero", thanks: "A keyring. The old shop key goes on this one. Still never used, mind."}],
    everyday: ["peach", "pearlclip", "honey"]},
  theo: {story: [
      {id: "mk_cards", thanks: "Pressed flowers. Filed under 'J.', officially. Unofficially, under 'lovely'."},
      {id: "postal", thanks: "A Spanish stamp! Straight into the album. Next to the little bird from 1962."},
      {id: "chrystea", thanks: "Tea for the trophy room. Two cups, I think. Officially, one."},
      {id: "rubberstamp", thanks: "A rubber stamp! 'Received with thanks.' I'll stamp everything. Officially."}],
    everyday: ["coffee", "loaf", "castella"]},
  marco: {story: [
      {id: "bar_milk", thanks: "Chocolate, up at the vines. Like the old harvests. Sit with me a minute."},
      {id: "b_pinot", thanks: "Someone else's red. Not bad. Not Margaux, but not bad."},
      {id: "fig", thanks: "A ripe fig. She always took the ripest. I let her."}],
    everyday: ["sourdough", "pea", "lager"]},
  ines: {story: [
      {id: "olivejar", thanks: "Olives! Tomás's tree's great-great-grandchildren, probably. Family dinner."},
      {id: "tartaalm", thanks: "Cake from near Tomás's village! Abuela will say hers is better. It is. Shh."},
      {id: "mk_spoon", thanks: "A carved spoon, like Tomás's! This one's for using. Stubborn, like me."},
      {id: "tk_tortaaceite", thanks: "Abuela's olive oil cake! Don't tell her yours is nearly as good. It is."}],
    everyday: ["icecream", "gingerbeer", "cherry"]},
  tomi: {story: [
      {id: "olives", thanks: "Olives. No inbox, no meetings. Just olives. Perfect."},
      {id: "oatlatte", thanks: "Oat latte. City Tomi's drink, but it's allowed on Saturdays."},
      {id: "b_wax", thanks: "Surf wax! The board's been slippy for weeks. Don't tell Ines I fell in."}],
    everyday: ["box4d", "dalgona", "jerky"]},
  posy: {story: [
      {id: "b_oldbook", thanks: "A new old book! Number four on people like Tomi, possibly. I'll report back."},
      {id: "b_teatowel", thanks: "A tea towel! You understand me. That's psychology, that is."},
      {id: "highlighters", thanks: "Highlighters! Book four is getting so much yellow. And pink. For feelings."}],
    combo: {what: "a box of bonbons with a honey heart in it", match: box(b => b.some(x => (x.fills || []).includes("honey") && x.shape === "heart")), thanks: "Honey! Of course it's honey. It always goes first."},
    everyday: ["bubbletea", "rabbitlamp", "fudge"]},
  hazel: {story: [
      {id: "rosemary", thanks: "Rosemary. Smell that. Clears your head right out. Told you."},
      {id: "lemon", thanks: "A good lemon. Half for soap, half for my tea. Trust me."},
      {id: "b_savon", thanks: "Cut from the block! Forty years and I still want to know how they get it so smooth."}],
    combo: {what: "a lavender and honey soap from the mill bench", match: soapOf(["bq_lavender", "honey"]), thanks: "Lavender and honey. Every time. You've a gift for this, love."},
    everyday: ["figjam", "cider"]},
  celeste: {story: [
      {id: "pairbox", thanks: "Wine and chocolate, old friends. Maman would have opened this tonight."},
      {id: "bar_dark", thanks: "I'll break it myself, for old times' sake. Under the counter, of course."},
      {id: "s_praline", thanks: "Grand-père's pralines. His page has a thumbprint on it, you know."},
      {id: "b_calissons", thanks: "Calissons! Maman's Christmas. Little almond boats. Merci."}],
    combo: {what: "a box of bonbons with a hazelnut one and a red wine one", match: box(b => has(b, "hazelnut") && has(b, "wine_red")), thanks: "Grand-père's hazelnut and Maman's red, in one box. I need to sit down."},
    everyday: ["croissant", "grape_red"]},
  farid: {story: [
      {id: "pistachio", thanks: "Pistachios! Uncle's pastries again this week. Pilar gets the first tray."},
      {id: "honey_blossom", thanks: "Orchard blossom. My trees made this, whatever Felix says."},
      {id: "tk_pasteles", thanks: "Uncle's pastries, from Pilar's kitchen. He'd want to know who did the honey."},
      {id: "azafran", thanks: "Saffron. Uncle would lock this in the till. I'll use just a pinch."}],
    everyday: [{id: "plum", thanks: "Plums! Wilf would trade me a case of red for a crate of these."},
      {id: "flour", thanks: "Flour! I'll be up at four. Old habits. Cake at three, then."}, "eggwaffle", "hobakjuk"]},
  mei: {story: [
      {id: "bq_tulip", thanks: "Tulips. Her favourite. I'll put them by her photo."},
      {id: "bq_rose", thanks: "Roses. I'll sing to them tonight. Don't laugh."},
      {id: "b_proteas", thanks: "Proteas! The bravest flowers. She'd have loved these."}],
    everyday: ["grassjelly", "honeycomb", "incense"]},
  felix: {story: [
      {id: "apple", thanks: "An apple from that tree? That's where it all started. Cardboard box and all."},
      {id: "honey_sun", thanks: "Someone else's honey. Lovely. Mine's better. The bees agree."}],
    combo: {what: "an ice cream with apple and honey in it", match: gel(i => i.includes("apple") && i.includes("honey")), thanks: "Apple and honey, the swarm in a cone. The bees decided this one."},
    everyday: ["sunflower", "bq_cosmos", "rootbeer"]},
  elena: {story: [
      {id: "eggtart", thanks: "Egg tarts! Is it Friday? It feels like Friday."},
      {id: "b_beans", thanks: "Proper coffee. Not grey at all. My old bank would never."},
      {id: "carrot", thanks: "Carrots! Daisy will pretend not to care. She'll care."}],
    everyday: ["scallion", "beewraps", "soap_oat"]},
  hettie: {story: [
      {id: "soycandle", thanks: "A fig candle! The cottages will smell like a summer garden."},
      {id: "figjam", thanks: "Fig jam, for my toast. You know me too well."},
      {id: "honey_lav", thanks: "Lavender honey! Like my linen cupboard, but you can eat it."}],
    everyday: ["croissant", "bananabread", "pinklemonade"]},
  amara: {story: [
      {id: "bar_white", thanks: "White chocolate! My secret's out. Don't tell Mateo."},
      {id: "furoshiki", thanks: "A wrapping cloth! I'm going to wrap everything. Even you."}],
    everyday: ["coconutshake", "mangomochi", "bananabread", "dragonbeard"]},
  mateo: {story: [
      {id: "chocolate", thanks: "Let's test the snap. For science, boss."},
      {id: "churros", thanks: "Churros! Abuela's Sundays. Now I need very thick chocolate."}],
    everyday: ["popcornchicken", "lurourice", "cinnamonbun", "kimbap"]},
  lila: {story: [
      {id: "box9", thanks: "Nine bonbons! That's a whole week of research."},
      {id: "j_choco", thanks: "Tangerine chocolates from Jeju! Research, international edition."}],
    everyday: ["starcharm", "tanghulu", "bungeoppang", "scrunchie"]},
  noor: {story: [
      {id: "b_adopt", thanks: "A joey, adopted? Happy tears. Sorry. Happy tears."},
      {id: "catplush", thanks: "A little cat. Just like hers. I'm not crying, you're crying."}],
    everyday: ["pea", "pumpkin", "sugarcane", "eggbread"]},
  wren: {story: [
      {id: "chestnut", thanks: "Gran's chestnuts. Roast them slow. She'd say the same."},
      {id: "k_furin", thanks: "A chime. For the cabin window. Nearly as good as the falls."},
      {id: "b_claybird", thanks: "A kingfisher that sits still. First time for everything."}],
    everyday: ["blackberry", "mushroom", "beanie"]},
  pilar: {story: [
      {id: "yemas", thanks: "Carmen's yemas. Mamá was right. Worth every grain of sugar."},
      {id: "garlic", thanks: "Garlic for the salmorejo. Taste this later. No, really, taste it."},
      {id: "milk", thanks: "Good milk. Let it be milk. Tell Sofia I said so."},
      {id: "tk_salmorejo", thanks: "Mamá's salmorejo, in a pot to take away. Bit more garlic next time. It's lovely."}],
    everyday: ["potato", "pepper", "sardine"]},
  sofia: {story: [
      {id: "s_nonna", thanks: "Fior di latte, the way Nonna made it. Ciao, Nonna."},
      {what: "a fior di latte you made: milk and nothing else, not dipped", match: gel((i, it) => i.length === 1 && i[0] === "milk" && !it.dip), thanks: "Just milk. You let the milk be milk. Pilar will be unbearable."},
      {id: "limoncino", thanks: "Limoncino! Into the freezer, for emergencies. Like Nonna."}],
    everyday: ["lemon", "hairribbon", "mochi", "qqballs"]},
  tomo: {story: [
      {id: "friedchicken", thanks: "XXL. Finally, a portion my size."},
      {id: "jamon", thanks: "Jamón! It won't reach the kitchen. Don't tell Tía Pilar."}],
    combo: {what: "an ice cream with pistachio in it", match: gel(i => i.includes("pistachio")), thanks: "Pistachio. I literally dreamt about this. Last night."},
    everyday: ["guabao", "dumpling", "tteokbokki"]},
  ada: {story: [
      {id: "k_bell", thanks: "A brass bell. It'll go over the door. Mother's can have a rest."},
      {id: "c_linen", thanks: "Proper linen. Look at it crease. That's how you know."},
      {id: "btncard", thanks: "A card of buttons! The best one's going in the jar. Mother would approve."}],
    everyday: ["bowclip", "stripesocks", "raspberry", "tulip"]},
  idris: {story: [
      {id: "b_record", thanks: "Something to dance to. Long arm first, Grandfather would say."},
      {id: "cinturon", thanks: "Hand-stitched. Even stitches, every one. I'm almost jealous."}],
    everyday: ["pear", "egg", "pepperbun", "handcream"]}
};
// every love of one villager, as [{kind, id?, match?, what?, thanks?}]
export const lovesOf = w => { const L = LOVES[w]; if (!L) return [];
  return [...(L.story || []).map(x => ({kind: "story", ...x})), ...(L.combo ? [{kind: "combo", ...L.combo}] : []), ...(L.everyday || []).map(x => ({kind: "everyday", ...(typeof x === "string" ? {id: x} : x)}))]; };
// what a gift really is: a wrapped one is what's inside it
const inner = id => { let it = ITEMS[id], k = 0; while (it && it.wrapped && it.inner && k++ < 4) { id = it.inner; it = ITEMS[id]; } return id; };
// the love this gift is for villager w, or null
export function loveFor(w, id){
  const x = inner(id), it = ITEMS[x]; if (!it) return null;
  return lovesOf(w).find(l => l.match ? l.match(it) : l.id === x || it.boxOf === l.id) || null;
}
export const isLove = (w, id) => !!loveFor(w, id);
// the special thank-you a love brings (story and combination loves, and an everyday one that has one), or ""
export const loveThanks = (w, id) => { const l = loveFor(w, id); return (l && l.thanks) || ""; };
// who loves this gift (for the backpack's picker and the friendship view)
export const loversOf = id => Object.keys(LOVES).filter(w => isLove(w, id));
