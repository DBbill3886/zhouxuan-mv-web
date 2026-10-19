/* geo.js — shared character geometry (used by the offline p5.brush baker AND the live renderer).
   Head units, facing right, head top y=0, chin y=1. One geometry → watercolour sprite, live ink lines, Riso silhouette. */
'use strict';
const FIG = {
  // her: slender long neck, small upturned nose, soft full lips, almond eye with an outer flick; long hair with a side fringe falling
  // behind the shoulder; a narrow, sloping-shouldered coral sweater with a soft roll collar and a waist.
  her: {
    face: [[.70,.28],[.735,.36],[.748,.44],[.742,.49],[.778,.57],[.806,.622],[.800,.640],[.776,.652],[.768,.668],[.781,.689],[.766,.708],[.774,.726],[.756,.750],[.760,.790],[.744,.836],[.68,.892],[.61,.935],[.585,.975],[.568,1.06],[.57,1.16],[.585,1.26]],
    hair: [[.62,.05],[.73,.13],[.775,.24],[.772,.33],[.73,.30],[.65,.275],[.56,.33],[.50,.46],[.47,.62],[.455,.80],[.43,.96],[.40,1.10],[.36,1.24],[.31,1.38],[.27,1.52],[.21,1.41],[.14,1.30],[.07,1.12],[.03,.92],[.0,.72],[.0,.50],[.05,.28],[.14,.11],[.28,.02],[.45,-.01]],
    neckBack: [[.36,.92],[.345,1.08],[.33,1.24]],
    eyeU: [[.612,.500],[.638,.483],[.666,.479],[.696,.490],[.708,.483]],
    eyeL: [[.624,.517],[.654,.522],[.684,.510]],
    iris: [.664,.494,.022],
    brow: [[.616,.448],[.656,.433],[.702,.441]],
    body: [[.31,1.22],[.36,1.19],[.585,1.24],[.66,1.34],[.76,1.50],[.80,1.80],[.76,2.22],[.80,2.8],[.84,3.7],[-.40,3.7],[-.34,2.8],[-.28,2.22],[-.32,1.80],[-.26,1.48],[-.10,1.30],[.10,1.23]],
    seam: [[.64,1.50],[.58,2.05],[.53,2.65],[.55,3.3]],
    collar: [[.31,1.22],[.44,1.29],[.585,1.24]],
    lashes: [[[.696,.490],[.712,.476]], [[.684,.484],[.696,.469]]],
    lipShape: [[.764,.672],[.779,.689],[.765,.706],[.771,.724],[.756,.745],[.748,.733],[.752,.700]],
    // Favre-style negative-space shadow: a crisp darker-skin shape under the jaw and down the neck (no outline around the face)
    shade: [[.744,.836],[.70,.875],[.62,.92],[.585,.975],[.575,1.06],[.575,1.16],[.585,1.26],[.40,1.26],[.345,1.10],[.36,.93],[.46,.88],[.58,.87],[.68,.855]],
    sheen: [[.70,.17],[.60,.095],[.46,.08],[.30,.15],[.17,.33],[.11,.60],[.12,.90],[.17,1.18],[.13,.90],[.10,.60],[.15,.30],[.28,.11],[.46,.04],[.62,.06]],
    cheek: [.62,.66,.09],
  },
  // him: straight nose, defined jaw, long neck, swept-back quiff; a tailored dark coat with a V collar, lapel and a sleeve line.
  him: {
    face: [[.70,.24],[.742,.32],[.762,.42],[.752,.47],[.80,.575],[.828,.635],[.79,.665],[.785,.69],[.797,.715],[.78,.738],[.79,.762],[.77,.79],[.785,.845],[.758,.905],[.64,.965],[.54,.985],[.555,1.04],[.565,1.12],[.58,1.21]],
    hair: [[.66,.30],[.72,.285],[.775,.25],[.758,.19],[.725,.165],[.75,.115],[.70,.045],[.58,-.015],[.42,-.04],[.26,-.02],[.13,.06],[.05,.20],[.02,.38],[.04,.54],[.08,.63],[.12,.72],[.15,.69],[.18,.80],[.21,.77],[.24,.70],[.27,.58],[.33,.46],[.39,.42],[.445,.43],[.47,.51],[.49,.44],[.53,.37],[.60,.335]],
    ear: [[.42,.50],[.38,.505],[.36,.57],[.385,.64],[.43,.64]],
    neckBack: [[.25,.72],[.28,.96],[.30,1.17]],
    eyeU: [[.616,.494],[.642,.479],[.670,.476],[.703,.488]],
    eyeL: [[.628,.512],[.658,.516],[.690,.505]],
    iris: [.672,.490,.021],
    brow: [[.606,.430],[.660,.417],[.720,.425]],
    body: [[.27,1.17],[.38,1.13],[.58,1.21],[.70,1.31],[.88,1.45],[.98,1.70],[1.0,2.3],[1.02,3.7],[-.56,3.7],[-.54,2.3],[-.50,1.70],[-.40,1.45],[-.20,1.29],[.04,1.20]],
    collar: [[.38,1.13],[.47,1.33],[.58,1.21]],
    lapel: [[.47,1.33],[.66,1.57],[.72,1.98],[.70,2.5]],
    seam: [[.82,1.58],[.76,2.25],[.72,2.85],[.72,3.4]],
    shade: [[.758,.905],[.70,.935],[.62,.962],[.55,.985],[.56,1.06],[.565,1.12],[.58,1.21],[.40,1.20],[.30,1.17],[.27,.92],[.25,.74],[.36,.82],[.50,.88],[.64,.895]],
    sheen: [[.735,.16],[.66,.05],[.50,.0],[.33,.01],[.18,.08],[.08,.22],[.12,.10],[.30,-.015],[.50,-.03],[.68,.02]],
    shirt: [[.38,1.13],[.47,1.33],[.58,1.21],[.53,1.19],[.47,1.265],[.42,1.15]],
    mouth: [[.784,.738],[.765,.741],[.75,.736]],
    cheek: [.60,.66,.08],
  },
};
// polygons used for sprites
function skinPoly(G) { return [...G.face, ...G.neckBack.slice().reverse(), [.12, .5], [.32, .09], [.6, .13]]; }
// sprite boxes in head units [x0, y0, w, h] and bake scale (px per head unit)
const SPR_BOX = { skin: [-.15, -.1, 1.05, 1.5], hair: [-.2, -.15, 1.05, 1.9], body: [-.75, 1.0, 1.9, 2.75] };
const SPR_SCALE = { skin: 560, hair: 560, body: 380 };
// Catmull-Rom through points, n samples per span
function through(P, n = 6) {
  if (P.length < 3) return P.slice();
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
// closed version (wraps around)
function throughClosed(P, n = 6) { const m = P.length, Q = [P[m - 1], ...P, P[0], P[1]]; const C = through(Q, n); return C.slice(n, C.length - n - 1); }
// affine figure transform as matrix [a,b,c,d,e,f] (unit → screen): head centre (.45,.5) at (x0,y0), s px/unit, dir ±1, tilt about neck pivot (.40,1.15)
function figMatrix(x0, y0, s, dir = 1, tilt = 0) {
  const th = tilt * dir, c = Math.cos(th), sn = Math.sin(th);
  const px = (.40 - .45) * dir * s, py = (1.15 - .5) * s;
  // p' = R*(S*(u - (.45,.5)) - P) + P + (x0,y0), S = diag(dir*s, s)
  const a = c * dir * s, b = sn * dir * s, cc = -sn * s, d = c * s;
  const tx = x0 + px + (-c * px + sn * py) - (a * .45 + cc * .5);
  const ty = y0 + py + (-sn * px - c * py) - (b * .45 + d * .5);
  return [a, b, cc, d, tx, ty];
}
const mApply = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
if (typeof module !== 'undefined') module.exports = { FIG, through, throughClosed, figMatrix, mApply, skinPoly, SPR_BOX, SPR_SCALE };
