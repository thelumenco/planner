// Puffin Isle's rooms (round 214): where the furniture stands on the floor (people walk round it), where each
// keeper stands (Finn behind his desk, Morwenna by the great lens and behind her kitchen table, Ivy by her window
// of jars, Bryn behind the tearoom counter), and where visiting family gather. Matches src/art/puffin-rooms.js.
// Room bounds are [30, 250, 490, 600] like the other towns' rooms.
export const PI_ROOM_OBST = {
  // the telescope's tripod; the desk; the cabinet; the stove and logs; the coat stand; the bench and wellies; the bucket; the nest boxes, rope and posts
  pi_warden: [[40, 236, 128, 302], [292, 258, 448, 344], [448, 230, 512, 306], [18, 372, 104, 480], [462, 346, 506, 470], [22, 506, 176, 596], [184, 558, 222, 596], [338, 494, 508, 596]],
  // the curve of the wall at each side; the gallery door's sill; the locker; the lens on its pedestal; the library steps; the stair hatch; the kit chest and paraffin
  pi_lamp: [[0, 236, 60, 284], [460, 236, 520, 284], [44, 236, 124, 262], [18, 312, 100, 412], [164, 248, 356, 360], [430, 336, 496, 474], [18, 510, 166, 584], [352, 524, 502, 596]],
  // the boots by the back door; the range; the dresser; the table and its chairs; the logbook cupboard; the rocking chair; logs and scuttle; flour, eggs and the churn
  pi_kitchen: [[28, 200, 96, 240], [116, 200, 256, 240], [370, 200, 514, 266], [126, 272, 398, 364], [16, 270, 114, 422], [420, 326, 506, 450], [20, 528, 166, 596], [360, 520, 502, 596]],
  // the workbench; the shop shelf; the lobster pot and buoy; the fish boxes; the upturned boat; the tin bath and the driftwood crate
  pi_studio: [[20, 226, 168, 304], [358, 230, 508, 304], [424, 384, 500, 466], [20, 380, 92, 474], [20, 510, 228, 596], [340, 500, 508, 596]],
  // the stove and its logs; the counter; the dresser; the two long tables and benches; the boots, sticks and dog bowl; the eggs and the geranium
  pi_tearoom: [[16, 200, 176, 252], [204, 258, 430, 346], [426, 200, 512, 266], [18, 380, 188, 510], [332, 380, 502, 510], [30, 504, 216, 598], [360, 520, 500, 598]]
};
// where each keeper stands: Finn behind his desk, Morwenna by the lens and behind her table, Ivy by her window, Bryn behind the counter
export const PI_ROOM_STAND = {pi_warden: [372, 250], pi_lamp: [384, 300], pi_kitchen: [300, 256], pi_studio: [300, 258], pi_tearoom: [316, 250]};
// four clear spots in each room for visiting family
export const PI_ROOM_PARTY = {
  pi_warden: [[220, 530], [300, 530], [200, 440], [300, 440]],
  pi_lamp: [[200, 460], [320, 460], [220, 540], [300, 540]],
  pi_kitchen: [[210, 540], [310, 540], [200, 466], [320, 466]],
  pi_studio: [[250, 530], [310, 520], [200, 440], [320, 440]],
  pi_tearoom: [[230, 450], [290, 450], [240, 540], [300, 540]]
};
