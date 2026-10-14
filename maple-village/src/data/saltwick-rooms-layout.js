// Saltwick Harbour's rooms (round 206): where the furniture stands on the floor (people walk round it), where each
// shopkeeper stands behind their counter, where the two shanty singers sit in the pub, and where visiting family
// gather. Matches src/art/saltwick-rooms.js. Room bounds are [30, 250, 490, 600] like the other towns' rooms.
export const SW_ROOM_OBST = {
  // the lobster tank; the slab; the scales table; the salt and dulse rack and the fish boxes; the mussel basket; the onion sack and crab crate; the clam crates and bucket
  sw_market: [[26, 230, 104, 340], [104, 262, 416, 356], [28, 420, 124, 466], [428, 232, 494, 434], [430, 456, 494, 506], [364, 520, 494, 592], [26, 496, 136, 592]],
  // the rope coils; the counter; the rope drums; the anchor and buoy; the lantern table; the barrel of oars; the brass crates
  sw_chandlery: [[26, 270, 132, 342], [144, 270, 346, 350], [432, 248, 494, 358], [24, 392, 106, 470], [402, 420, 494, 472], [436, 540, 494, 596], [26, 500, 166, 590]],
  // the window seat; the cake counter; the dresser; the four gingham tables with their chairs; the plants; the umbrella stand
  sw_kettle: [[16, 196, 188, 262], [294, 270, 494, 338], [18, 294, 98, 442], [116, 438, 212, 476], [400, 422, 496, 460], [48, 534, 144, 572], [392, 534, 488, 572], [472, 360, 500, 384], [16, 460, 56, 512], [480, 498, 504, 520]],
  // the drawers; the jet case; the workbench and its stool; the glass cabinet; the customers' table; the crate of rough jet; the armchair; the plant
  sw_jet: [[20, 330, 94, 434], [134, 272, 336, 352], [378, 300, 496, 420], [16, 446, 90, 540], [396, 462, 504, 512], [416, 520, 494, 590], [82, 548, 150, 594], [26, 566, 56, 594]],
  // the hearth; the barrel table in the singers' corner; the bar; the barrel by the bar; the settle and table at the front left; the settle, table and chair at the front right
  sw_pub: [[10, 200, 174, 262], [60, 378, 104, 430], [284, 270, 496, 348], [442, 382, 492, 442], [14, 500, 158, 596], [336, 500, 504, 596]]
};
// where each shopkeeper stands: behind the counter (clear of it)
export const SW_ROOM_STAND = {sw_market: [260, 254], sw_chandlery: [245, 256], sw_kettle: [395, 256], sw_jet: [235, 256], sw_pub: [390, 256]};
// the two shanty singers in the Fisherman's Arms, on their stools either side of the barrel by the fire
export const SW_PUB_SINGERS = [[50, 354], [56, 454]];
// four clear spots in each room for visiting family
export const SW_ROOM_PARTY = {
  sw_market: [[200, 540], [330, 540], [170, 440], [360, 440]],
  sw_chandlery: [[200, 540], [330, 540], [180, 450], [330, 470]],
  sw_kettle: [[200, 540], [330, 540], [260, 450], [340, 470]],
  sw_jet: [[200, 540], [330, 540], [170, 460], [300, 470]],
  sw_pub: [[200, 540], [300, 540], [230, 450], [330, 460]]
};
