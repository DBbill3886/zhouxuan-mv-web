/* timeline.js — shot list (start times from the LRC). Each shot paints the whole frame; bridges live inside the shots. */
'use strict';
const SHOTS = [];
const reg = (t0, fn) => SHOTS.push([t0, fn]);
const stub = name => (t, lt) => { plate('paper'); const c = X.ctx; c.fillStyle = ZX.ink; c.font = `60px ${ZX.fCN}`; c.fillText(name + ' ' + lt.toFixed(1), 200, 400); };
const S_ = (name) => { let f; try { f = Function('return typeof ' + name + " === 'function' ? " + name + ' : null')(); } catch (e) { f = null; } return f || stub(name); };
function buildTimeline() {
  const L = [
    [0, 'shotFilm'], [45.27, 'shotMud'], [49.17, 'shotChess'],
    [56.55, 'shotLamps'], [58.53, 'shotSplit'], [62.55, 'shotCircle'], [66.36, 'shotPhone'], [68.37, 'shotDawn'], [71.73, 'shotMasks'], [75.60, 'shotBalloon'], [79.53, 'shotEyes'],
    [86.58, 'shotR1'], [88.14, 'shotR2'], [94.47, 'shotR3'], [98.82, 'shotR4'], [102.24, 'shotR5'], [106.05, 'shotR6'], [110.07, 'shotR7'], [114.57, 'shotR8'],
    [118.6, 'shotInterlude'],
    [138.00, 'shotFireworks'], [143.88, 'shotPaths'], [147.69, 'shotPour'], [151.23, 'shotHand'], [154.83, 'shotFish'], [158.07, 'shotDream'], [162.00, 'shotStrings'],
    [166.56, 'shotChair'], [170.19, 'shotShadows'], [174.60, 'shotBubbles'], [178.53, 'shotStorm'], [182.40, 'shotFlood'], [187.38, 'shotStarEye'], [191.04, 'shotShrink'], [194.73, 'shotTurn'], [197.22, 'shotGaze'],
    [203.70, 'shotR1i'], [204.90, 'shotR2i'], [211.47, 'shotR3i'], [215.85, 'shotR4i'], [219.21, 'shotR5i'], [223.08, 'shotR6i'], [227.04, 'shotR7i'], [231.69, 'shotR8i'],
    [235.77, 'shotLake'], [243.72, 'shotSmoke'], [247.65, 'shotClouds'], [251.46, 'shotDrops'], [255.57, 'shotReflect'], [259.56, 'shotWords'], [263.19, 'shotHighNote'], [275.0, 'shotCredits'],
  ];
  for (const [t0, n] of L) reg(t0, S_(n));
  SHOTS.sort((a, b) => a[0] - b[0]);
}
function runShot(t) {
  if (!SHOTS.length) buildTimeline();
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const t0 = SHOTS[i][0], end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : DUR;
  SHOTS[i][1](t, t - t0, end - t0);
}
