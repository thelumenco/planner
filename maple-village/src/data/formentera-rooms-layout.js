// Formentera's rooms (round 231): where the furniture stands on the floor (people walk round it), where each keeper stands
// (Marina behind the driftwood bar, Toni behind the salt counter, Margalida behind the tiled counter, Pep behind the postcard
// counter, Joan behind the hire desk), and where visiting family gather. Matches src/art/formentera-rooms.js.
// Room bounds are [30, 250, 490, 600] like the other towns' rooms.
export const FM_ROOM_OBST = {
  // the fish grill; the driftwood bar; the juice corner and baskets; the table with toes in the sand and its chairs; the hammock; the palm, crate and cool box; the deckchairs and umbrella
  fm_bar: [[14, 236, 152, 350], [144, 262, 380, 350], [384, 236, 506, 352], [20, 408, 172, 500], [384, 400, 506, 494], [18, 538, 160, 598], [362, 540, 506, 598]],
  // the salt sacks; the salt counter; the board of old photos; the salt wagon on its track; the herb bench; the crates of bath crystals; the salt barrels and the cat
  fm_salt: [[14, 230, 150, 352], [144, 262, 380, 350], [392, 210, 506, 352], [14, 412, 154, 498], [394, 414, 506, 494], [18, 540, 152, 598], [366, 540, 506, 598]],
  // the wood oven and its log pile; the tiled counter; the cheese and fig dresser; the café table and its chairs; the flour sacks and almonds; the geraniums and lemons; the bread bench
  fm_bakery: [[14, 200, 160, 352], [144, 258, 380, 350], [390, 226, 506, 350], [20, 410, 172, 498], [398, 450, 506, 498], [18, 548, 150, 598], [364, 542, 506, 598]],
  // the spiral stair; the stamp lectern; the postcard counter; the Verne bookcase; the keeper's desk and chair; the old lens; the rope and paraffin cans; the bench and potted pine
  fm_light: [[14, 200, 150, 354], [174, 262, 244, 350], [266, 262, 434, 348], [436, 222, 506, 350], [20, 418, 170, 498], [414, 398, 486, 500], [18, 548, 150, 598], [366, 520, 506, 598]],
  // the bike rack at the back; the hire desk; the Green Routes easel; the second row of bikes; the child's bike, trailer and baskets; the tool bench; the caps crate and bougainvillea
  fm_bikes: [[14, 296, 156, 352], [144, 262, 380, 350], [392, 210, 506, 352], [16, 446, 172, 498], [396, 406, 506, 498], [18, 524, 152, 598], [362, 524, 506, 598]]
};
// where each keeper stands: behind the counter (clear of it)
export const FM_ROOM_STAND = {fm_bar: [262, 254], fm_salt: [262, 254], fm_bakery: [262, 254], fm_light: [350, 254], fm_bikes: [262, 254]};
// four clear spots in each room for visiting family
export const FM_ROOM_PARTY = {
  fm_bar: [[220, 540], [300, 540], [210, 450], [320, 450]],
  fm_salt: [[220, 540], [300, 540], [210, 450], [320, 450]],
  fm_bakery: [[220, 540], [300, 540], [220, 450], [320, 450]],
  fm_light: [[200, 556], [320, 556], [196, 440], [330, 440]],
  fm_bikes: [[220, 540], [300, 540], [210, 450], [320, 450]]
};
