// The dining tables in your house and your friends' houses: round or a short rectangle, wood or glass, each house with
// its own chairs. Eight chairs: three along the back, one at each end, three along the front.
export const TABLES = {
  home: {shape: "round", glass: false, chair: "ladder"},       // honey wood, ladder-back chairs
  hanatheo: {shape: "round", glass: true, chair: "cushion"},   // glass top, cream cushioned chairs
  cottage: {shape: "rect", glass: false, chair: "painted"},    // Farid's farmhouse table, sage-green painted chairs
  tomiposy: {shape: "rect", glass: true, chair: "modern"}      // glass top, mustard chairs on black legs
};
// half the table's width, and where the seats sit from its front-centre: [dx, dy, facing]
export const halfW = t => t.shape === "round" ? 90 : 86;
export const SEATS = t => {
  const e = halfW(t) + 22;
  return {back: [[-50, -24], [0, -24], [50, -24]], ends: [[-e, -10, 1], [e, -10, -1]], front: [[-50, 18], [0, 18], [50, 18]]};
};
