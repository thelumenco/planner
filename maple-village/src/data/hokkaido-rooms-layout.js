// Hokkaido's rooms (round 222): where the furniture stands on the floor (people walk round it), where each keeper stands
// (Haruko behind the market stalls, Kenta behind his glass counter, Mrs Sato behind the front desk, Ben behind the hire desk,
// Kumiko behind the café counter), and where visiting family gather. Matches src/art/hokkaido-rooms.js.
// Room bounds are [30, 250, 490, 600] like the other towns' rooms.
export const HK_ROOM_OBST = {
  // the market stalls; the kaisendon bar and its stools; the crab tank; the kombu barrel; the fish boxes; the melon, corn and potato crates
  hk_hall: [[144, 262, 380, 350], [14, 262, 154, 384], [376, 228, 506, 356], [20, 424, 82, 502], [436, 412, 506, 498], [18, 538, 158, 598], [350, 528, 504, 598]],
  // the furnace, marver and blowpipe rack; the water bucket; the glass counter; the music-box stand; the bench of blowpipes; the heap of floats; the straw crate and cullet jars
  hk_glass: [[14, 200, 170, 344], [132, 334, 170, 366], [224, 262, 476, 350], [398, 396, 506, 498], [18, 408, 98, 472], [18, 516, 152, 598], [364, 538, 502, 598]],
  // the front desk; the low tea table and cushions; the tansu chest; the andon lamp; the bonsai stand; the slippers; the folded futons
  hk_ryokan: [[160, 262, 362, 348], [28, 412, 176, 510], [398, 396, 506, 496], [450, 520, 490, 596], [20, 520, 112, 598], [126, 584, 200, 600], [366, 538, 448, 598]],
  // the fireplace and log stack; the hire desk; the trail map easel; the armchair; the ski rack; the boot dryers; the bench
  hk_lodge: [[14, 200, 178, 346], [172, 262, 352, 348], [396, 226, 498, 346], [16, 406, 92, 486], [398, 384, 506, 512], [18, 500, 158, 598], [358, 534, 502, 598]],
  // the seed rack; the café counter; the pressed-flower wall; the two tables and their chairs; the flower buckets; the melon and dried-flower crates
  hk_cafe: [[18, 200, 130, 354], [160, 262, 362, 348], [390, 206, 506, 350], [26, 476, 174, 552], [346, 476, 494, 552], [18, 562, 102, 598], [424, 562, 504, 598], [146, 552, 198, 598], [322, 544, 370, 598]]
};
// where each keeper stands: behind the counter (clear of it)
export const HK_ROOM_STAND = {hk_hall: [262, 254], hk_glass: [350, 254], hk_ryokan: [262, 254], hk_lodge: [262, 254], hk_cafe: [262, 254]};
// four clear spots in each room for visiting family
export const HK_ROOM_PARTY = {
  hk_hall: [[220, 540], [300, 540], [210, 450], [320, 450]],
  hk_glass: [[220, 540], [300, 540], [200, 450], [320, 450]],
  hk_ryokan: [[220, 540], [300, 540], [230, 440], [330, 440]],
  hk_lodge: [[220, 540], [300, 540], [200, 450], [330, 450]],
  hk_cafe: [[230, 540], [290, 540], [220, 440], [310, 440]]
};
