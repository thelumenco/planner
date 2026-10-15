// Bali's rooms (round 220): where the furniture stands on the floor (people walk round it), where each keeper stands
// (Nyoman behind the warung counter, Ibu Wayan behind her table of offerings, Made by the ugal at the head of the
// gamelan, Ketut behind his silver case, Komang behind her stall), where the two gamelan players stand, and where
// visiting family gather. Matches src/art/bali-rooms.js. Room bounds are [30, 250, 490, 600] like the other towns' rooms.
export const BA_ROOM_OBST = {
  // the juice cooler; the counter and its glass cabinet; the sea-view table and stools; the coconut heap; the two mats and low tables; the plants
  ba_warung: [[18, 196, 104, 322], [114, 214, 346, 348], [366, 254, 498, 334], [20, 370, 118, 446], [20, 498, 204, 598], [322, 498, 502, 598], [470, 420, 506, 472]],
  // the palm leaves; the shrine and its umbrella; the table of offerings; the mat; the incense stand; the flower baskets; the leaves and plants
  ba_offer: [[14, 196, 50, 262], [404, 196, 512, 266], [154, 226, 370, 342], [24, 336, 180, 432], [410, 288, 486, 366], [20, 548, 232, 596], [330, 530, 502, 598], [470, 420, 506, 474]],
  // the gong frame; the reong; the back row of gangsa; the front row; the drums; the costume stand; the guardians and umbrellas; the mallet rack
  ba_gamelan: [[10, 200, 180, 304], [290, 196, 498, 250], [160, 252, 422, 306], [150, 318, 420, 368], [30, 336, 142, 404], [436, 312, 506, 474], [20, 500, 120, 598], [400, 500, 500, 598], [18, 420, 48, 512]],
  // the workbench and stool; the silver case; the carved chest; the vitrine; the water jar; the little shrine table; the plants
  ba_silver: [[16, 240, 202, 356], [224, 226, 476, 346], [412, 354, 506, 446], [20, 466, 114, 596], [120, 536, 172, 596], [330, 554, 398, 598], [380, 548, 420, 598], [468, 548, 506, 598]],
  // Komang's stall; the spice stall and its sacks; the sarong rail and kite; the baskets; the coffee and rice sacks and the Garuda
  ba_market: [[146, 258, 380, 350], [18, 268, 148, 414], [404, 224, 504, 430], [24, 520, 210, 596], [326, 520, 500, 598]]
};
// where each keeper stands: behind the counter (clear of it); Made stands by the ugal at the head of the orchestra
export const BA_ROOM_STAND = {ba_warung: [228, 254], ba_offer: [262, 254], ba_gamelan: [452, 284], ba_silver: [350, 254], ba_market: [262, 254]};
// the two gamelan players, standing in front of the gangsa
export const BA_PLAYERS = [[180, 396], [372, 396]];
// four clear spots in each room for visiting family
export const BA_ROOM_PARTY = {
  ba_warung: [[220, 540], [300, 540], [200, 450], [320, 440]],
  ba_offer: [[240, 520], [310, 520], [230, 440], [330, 430]],
  ba_gamelan: [[210, 540], [310, 540], [190, 480], [340, 480]],
  ba_silver: [[220, 520], [300, 520], [210, 440], [320, 450]],
  ba_market: [[240, 540], [300, 530], [220, 450], [320, 450]]
};
