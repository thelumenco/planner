// The orchard (fruit trees) and the flower farm (flower beds and bushes), west of home through the gate at the top
// left. Mel buys and plants; Ma Ma waters, tends and picks. Everything is seasonal: a tree or flower only lives in its
// own seasons, and when the season turns it fades and the spot needs replanting (storybook seasons, see items.js).
//   Trees:   a sapling grows for a day, its first fruit ripens 12 hours later, then there's fruit again every day.
//   Beds:    seedlings grow for 12 hours, flower, are cut, and bloom again 16 hours later.
//   Bushes:  grow for a day, flower, and bloom again every day.
// Ma Ma picks whatever's ripe between 7am and 7pm and puts it in the farm shop. Villagers buy from the shop (Ma Ma
// keeps the takings in a tin and hands them over when Mel visits), and Mel can take anything for herself: fruit,
// bouquets (3 stems) and potted flowers (2 stems). If the shop's out, she can buy them for a few coins.
import { H } from "../util.js";

export const TREE_GROW = 24*H, TREE_FIRST = 12*H, TREE_AGAIN = 24*H;
export const BED_GROW = 12*H, BED_AGAIN = 16*H, BUSH_GROW = 24*H, BUSH_AGAIN = 24*H;
export const BOUQUET_STEMS = 3, POT_STEMS = 2;

// fruit: the item it gives (the apple is the market's apple). sell: what one fetches (the farm shop, the wine shop).
export const TREES = {
  cherry:    {n: "Cherry tree", fruit: "cherry", fn: ["cherry", "cherries"], seasons: ["spring"], price: 30, yield: 4, sell: 4, col: "#C2334D", bloom: "#F7D6DE"},
  lemon:     {n: "Lemon tree", fruit: "lemon", fn: ["lemon", "lemons"], seasons: ["spring", "winter"], price: 25, yield: 3, sell: 3, col: "#F3D34A"},
  peach:     {n: "Peach tree", fruit: "peach", fn: ["peach", "peaches"], seasons: ["summer"], price: 30, yield: 3, sell: 5, col: "#F4A67A"},
  mango:     {n: "Mango tree", fruit: "mango", fn: ["mango", "mangoes"], seasons: ["summer"], price: 40, yield: 3, sell: 6, col: "#F2B33D"},
  apple:     {n: "Apple tree", fruit: "apple", fn: ["apple", "apples"], seasons: ["autumn"], price: 25, yield: 4, sell: 3, col: "#D9433A"},
  pear:      {n: "Pear tree", fruit: "pear", fn: ["pear", "pears"], seasons: ["autumn"], price: 30, yield: 4, sell: 4, col: "#C9D36A"},
  fig:       {n: "Fig tree", fruit: "fig", fn: ["fig", "figs"], seasons: ["autumn"], price: 35, yield: 3, sell: 5, col: "#7A4A6E"},
  orange:    {n: "Orange tree", fruit: "orange", fn: ["orange", "oranges"], seasons: ["winter"], price: 25, yield: 4, sell: 3, col: "#F08A3C"},
  persimmon: {n: "Persimmon tree", fruit: "persimmon", fn: ["persimmon", "persimmons"], seasons: ["winter"], price: 35, yield: 3, sell: 5, col: "#E8743B"},
  // round 129: Ma Ma brings a sapling home from Jeju (if she went); only then can the orchard grow them (unlock)
  tangerine: {n: "Tangerine tree", fruit: "tangerine", fn: ["tangerine", "tangerines"], seasons: ["autumn", "winter"], price: 30, yield: 4, sell: 3, col: "#F29A2E", unlock: "jeju"}
};
// a tree that has to be unlocked first (the tangerine: F.jeju.sapling)
export const treeOpen = (F, C) => !C || !C.unlock || !!(F && F.jeju && F.jeju.sapling);
// bush: grows on a bush (top row of the flower farm) rather than in a bed. stem: what one stem fetches at the shop.
export const FLOWERS = {
  tulip:      {n: "Tulips", one: "tulip", seasons: ["spring"], price: 6, col: "#E86A7C"},
  sweetpea:   {n: "Sweet peas", one: "sweet pea", seasons: ["spring"], price: 6, col: "#C9A3E0"},
  sunflower:  {n: "Sunflowers", one: "sunflower", seasons: ["summer"], price: 7, col: "#F3C33A"},
  cosmos:     {n: "Cosmos", one: "cosmos", seasons: ["summer"], price: 6, col: "#F2A0B8"},
  mum:        {n: "Chrysanthemums", one: "chrysanthemum", seasons: ["autumn"], price: 7, col: "#E9B640"},
  dahlia:     {n: "Dahlias", one: "dahlia", seasons: ["autumn"], price: 8, col: "#C2334D"},
  pansy:      {n: "Pansies", one: "pansy", seasons: ["winter"], price: 6, col: "#8C7AD9"},
  amaryllis:  {n: "Amaryllis", one: "amaryllis", seasons: ["winter"], price: 8, col: "#D9433A"},
  rose:       {n: "Roses", one: "rose", bush: true, seasons: ["spring", "summer", "autumn"], price: 22, col: "#E8566C"},
  lavender:   {n: "Lavender", one: "lavender", bush: true, seasons: ["spring", "summer"], price: 18, col: "#9C8CD9"},
  hydrangea:  {n: "Hydrangeas", one: "hydrangea", bush: true, seasons: ["summer"], price: 20, col: "#8FB3E8"},
  heather:    {n: "Heather", one: "heather", bush: true, seasons: ["autumn", "winter"], price: 18, col: "#C98AB8"},
  camellia:   {n: "Camellias", one: "camellia", bush: true, seasons: ["winter"], price: 22, col: "#F08AA0"}
};
export const STEM_PRICE = 2, BOUQUET_PRICE = 8, POT_PRICE = 10;
export const BED_YIELD = 3, BUSH_YIELD = 4;

// Where the trees, beds and bushes stand on their screens
export const TREE_ROWS = [372, 462, 552], TREE_XS = [110, 210, 310, 410];
export const BUSH_Y = 236, BED_ROWS = [340, 428, 516], FLOWER_XS = [110, 210, 310, 410];

// Spots a potted flower can go (Mel picks one when she places a pot from her backpack)
export const POT_SPOTS = {
  window: {n: "the window box at home", scene: "base"},
  basket: {n: "the hanging basket by your door", scene: "base"},
  shop:   {n: "the pot outside the wine shop", scene: "vineyard"},
  vase:   {n: "the vase in your room", scene: "room"}
};
