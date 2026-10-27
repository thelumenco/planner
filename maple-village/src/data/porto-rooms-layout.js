// Portovenere's rooms (round 211): where the furniture stands on the floor (people walk round it), where each
// shopkeeper stands behind their counter (Don Piero by the choir stalls in San Pietro), where the two choir singers
// stand for the rehearsal, and where visiting family gather. Matches src/art/porto-rooms.js.
// Room bounds are [30, 250, 490, 600] like the other towns' rooms.
export const PV_ROOM_OBST = {
  // the rope rack and its tub; the blue crates under the doors; the counter; the stuffing bench and stool; the net and buoys; the crates, salt sack and boots; the tub, hose and bucket; the geraniums
  pv_mussels: [[18, 228, 134, 312], [404, 206, 498, 294], [134, 266, 376, 348], [358, 330, 498, 412], [20, 376, 116, 470], [24, 506, 194, 594], [336, 516, 498, 594], [486, 430, 508, 474]],
  // the chestnut sacks; the agave; the bar; the little table by the water; the sweets corner; the two café tables; the agave by the door; the geraniums
  pv_bar: [[16, 262, 106, 346], [24, 400, 66, 454], [116, 266, 342, 350], [380, 240, 494, 300], [22, 452, 150, 592], [384, 470, 478, 516], [384, 540, 478, 586], [466, 380, 510, 424], [166, 554, 190, 594]],
  // the carving bench; its stool; the rough blocks; the display table; the secret under the sheet; the leaning slabs; the crate of offcuts; the plant; the bucket and dust sack; the plinth with the cat
  pv_bottega: [[14, 250, 144, 392], [136, 380, 164, 406], [20, 418, 106, 474], [160, 266, 360, 344], [384, 270, 482, 448], [24, 476, 150, 594], [144, 548, 196, 592], [202, 556, 226, 594], [336, 528, 440, 594], [440, 466, 500, 594]],
  // the armchair, side table and lamp; the visitors' book stand; the counter; the globe; the postcard spinner; the book table; the plants; the crates of books and the cat
  pv_books: [[20, 228, 156, 344], [180, 278, 236, 344], [254, 266, 460, 350], [24, 388, 80, 462], [458, 356, 500, 456], [22, 466, 158, 576], [24, 556, 186, 594], [350, 504, 498, 594]],
  // the baskets under the shell wall; the cabinet; the counter; the garland stand; the table and baskets at the front left; the scallop basket, giant clam and starfish crate
  pv_shells: [[14, 220, 182, 252], [16, 300, 104, 446], [228, 262, 434, 350], [440, 284, 502, 450], [20, 488, 196, 596], [334, 500, 498, 596]],
  // the altar and its flowers; the step under the sea window; the choir stalls and music stand; the font; the candle stand; the tall candlestick; the pews
  pv_church: [[170, 200, 350, 264], [364, 200, 496, 238], [14, 226, 176, 388], [30, 418, 98, 484], [404, 380, 486, 466], [474, 250, 494, 342], [20, 504, 176, 596], [344, 504, 500, 596]]
};
// where each shopkeeper stands: behind the counter (clear of it); in San Pietro, Don Piero stands by the choir stalls
export const PV_ROOM_STAND = {pv_mussels: [255, 254], pv_bar: [228, 254], pv_bottega: [260, 254], pv_books: [356, 254], pv_shells: [330, 254], pv_church: [252, 326]};
// the two choir singers in San Pietro, standing in front of the stalls
export const PV_CHOIR = [[196, 288], [198, 362]];
// four clear spots in each room for visiting family
export const PV_ROOM_PARTY = {
  pv_mussels: [[220, 530], [300, 530], [190, 450], [320, 450]],
  pv_bar: [[210, 530], [310, 530], [190, 440], [320, 430]],
  pv_bottega: [[240, 520], [300, 500], [200, 450], [320, 440]],
  pv_books: [[220, 530], [310, 530], [230, 440], [320, 440]],
  pv_shells: [[220, 530], [300, 520], [200, 420], [330, 440]],
  pv_church: [[220, 540], [300, 540], [270, 450], [340, 440]]
};
