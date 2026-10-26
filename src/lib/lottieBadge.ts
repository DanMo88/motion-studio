/**
 * A tiny Lottie animation authored in code (circle draw-on + pop + checkmark).
 * Lottie is just JSON, so AI agents can generate / edit animations directly.
 * Any LottieFiles/After Effects (Bodymovin) export can be dropped in instead.
 */
const hexToRgb = (hex: string): [number, number, number, number] => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
};

const easeOut = { i: { x: [0.25], y: [1] }, o: { x: [0.6], y: [0] } };
const overshoot = { i: { x: [0.3], y: [1.5] }, o: { x: [0.5], y: [0] } };
const transform = { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } };

const layer = (ind: number, nm: string, shapes: unknown[], scale: unknown) => ({
  ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op: 90, st: 0, bm: 0,
  ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [256, 256, 0] }, a: { a: 0, k: [0, 0, 0] }, s: scale },
  shapes,
});

export const makeBadgeLottie = (accent: string, accent2: string) => ({
  v: "5.7.4", fr: 30, ip: 0, op: 90, w: 512, h: 512, nm: "badge", ddd: 0, assets: [],
  layers: [
    layer(1, "check", [
      {
        ty: "gr", nm: "check",
        it: [
          { ty: "sh", ks: { a: 0, k: { i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[-80, 5], [-25, 60], [85, -60]], c: false } } },
          { ty: "st", c: { a: 0, k: hexToRgb(accent2) }, o: { a: 0, k: 100 }, w: { a: 0, k: 34 }, lc: 2, lj: 2 },
          { ty: "tm", s: { a: 0, k: 0 }, o: { a: 0, k: 0 }, m: 1, e: { a: 1, k: [{ t: 22, s: [0], ...easeOut }, { t: 42, s: [100] }] } },
          transform,
        ],
      },
    ], { a: 0, k: [100, 100, 100] }),
    layer(2, "ring", [
      {
        ty: "gr", nm: "ring",
        it: [
          { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [340, 340] } },
          { ty: "st", c: { a: 0, k: hexToRgb(accent) }, o: { a: 0, k: 100 }, w: { a: 0, k: 26 }, lc: 2, lj: 2 },
          { ty: "tm", s: { a: 0, k: 0 }, o: { a: 0, k: 0 }, m: 1, e: { a: 1, k: [{ t: 0, s: [0], ...easeOut }, { t: 28, s: [100] }] } },
          transform,
        ],
      },
    ], { a: 1, k: [{ t: 0, s: [60, 60, 100], ...overshoot }, { t: 26, s: [100, 100, 100] }] }),
  ],
});
