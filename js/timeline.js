/* timeline.js — shot list (start times from the LRC). Each shot paints the whole frame; bridges live inside the shots. */
'use strict';
const SHOTS = [];
const reg = (t0, fn) => SHOTS.push([t0, fn]);
const stub = name => (t, lt) => { plate('paper'); const c = X.ctx; c.fillStyle = ZX.ink; c.font = `60px ${ZX.fCN}`; c.fillText(name + ' ' + lt.toFixed(1), 200, 400); };
const S_ = (name) => { let f; try { f = Function('return typeof ' + name + " === 'function' ? " + name + ' : null')(); } catch (e) { f = null; } return f || stub(name); };
function buildTimeline() {
  const L = [
    [0, 'shotFilm'], [45.27, 'shotMudChess'],
    [56.55, 'shotLamps'], [58.53, 'shotSplit'], [62.55, 'shotCircle'], [66.36, 'shotPhone'], [68.37, 'shotDawn'], [71.73, 'shotMasks'], [75.60, 'shotPuddle'], [79.53, 'shotEyes'],
    [86.58, 'shotR1'], [88.14, 'shotR2'], [94.47, 'shotR3'], [98.82, 'shotR4'], [102.24, 'shotR5'], [106.05, 'shotR6'], [110.07, 'shotR7'], [114.57, 'shotR8'],
    [118.6, 'shotInterlude'],
    [138.00, 'shotFireworks'], [143.88, 'shotPaths'], [147.69, 'shotPour'], [151.23, 'shotFish'], [158.07, 'shotDream'], [162.00, 'shotStrings'],
    [166.56, 'shotChair'], [170.19, 'shotShadows'], [174.60, 'shotBubbles'], [178.53, 'shotStorm'], [182.40, 'shotFlood'], [187.38, 'shotStarEye'], [191.04, 'shotShrink'], [194.73, 'shotTurn'], [197.22, 'shotGaze'],
    [203.70, 'shotR1i'], [204.90, 'shotR2i'], [211.47, 'shotR3i'], [215.85, 'shotR4i'], [219.21, 'shotR5i'], [223.08, 'shotR6i'], [227.04, 'shotR7i'], [231.69, 'shotR8i'],
    [235.77, 'shotLake'], [243.72, 'shotSmoke'], [247.65, 'shotClouds'], [251.46, 'shotDrops'], [255.57, 'shotReflect'], [259.56, 'shotWords'], [263.19, 'shotHighNote'], [275.0, 'shotCredits'],
  ];
  for (const [t0, n] of L) reg(t0, S_(n));
  SHOTS.sort((a, b) => a[0] - b[0]);
}
// The film is 15 continuous movements (one camera each, no cuts). Inside a movement the beats hand over by morphing a shared object;
// painted movements also get one slow travelling camera (push + drift) that is identity at both ends, so it never jumps at a boundary.
const MOVES = [
  [0, 45.27, '胶片 → 账本', 0], [45.27, 56.55, '泥潭 → 棋盘', 1], [56.55, 68.37, '熄灯 → 一半一半 → 不圆满 → 电话', 1], [68.37, 79.53, '黎明电线 → 笑脸成泥 → 水洼倒影', 1],
  [79.53, 86.58, '凝视 · 善意的谎言', 0], [86.58, 118.6, '副歌 · 印刷海报', 0], [118.6, 138, '间奏 · 星夜', 1], [138, 151.23, '烟花 → 陌路 → 倾尽', 1],
  [151.23, 162, '鱼缸 → 不醒的梦', 1], [162, 174.6, '提线 → 空椅 → 影子烙印', 1], [174.6, 187.38, '泡影 → 纸船 → 墨潮', 1], [187.38, 203.7, '一眼万年 → 退缩 → 凝视', 0],
  [203.7, 235.77, '副歌 · 反转海报', 0], [235.77, 263.19, '湖 · 雨', 1], [263.19, 290.7, '高音 → 片尾', 0],
];
function moveAt(t) { for (const m of MOVES) if (t < m[1]) return m; return MOVES[MOVES.length - 1]; }
function runShot(t) {
  if (!SHOTS.length) buildTimeline();
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const t0 = SHOTS[i][0], end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : DUR, call = () => SHOTS[i][1](t, t - t0, end - t0);
  const m = moveAt(t);
  if (!m[3]) return call();
  const u = clamp((t - m[0]) / (m[1] - m[0])), b = sin(PI * u), sd = hash(m[0]) > .5 ? 1 : -1;
  const z = 1 + .045 * b, dx = sd * O(36, 22) * sin(TAU * u) * .5, dy = O(-14, -24) * b;
  withCam(CX() + dx, CY() + dy, z, call);
}
