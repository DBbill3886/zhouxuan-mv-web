/* shots_v2.js — 1:58–3:23  interlude (print dissolves back into night watercolour; two of them drift in orbit; a spark rises)
   → verse 2 rap, one image per line: fireworks → paths → pour → palm → fishbowl → dream bubble → strings → empty chair →
   shadows & seal → bubbles → storm boat → ink flood & moons → star-trail eye → shrinking → turning away → her gaze (→ inverted Riso).
   Every cut hands one object across: the floor line, the spark, falling trails, the coral path = the stream, the last drop, the bowl = the bubble,
   bubble dots = strings, cut strings, the doorway shadow, the seal = a bubble, the bubble = the boat, the wave = the flood,
   the moon = the iris, the shut lid = the horizon, his figure, her face. */
'use strict';
const nightLyr = () => { X.dark = true; X.lyr = { mode: 'rap' }; };
// ---------- interlude ----------
function starsField(t, k, seed = 1, n = 70) {
  const V0 = X.VIS, c = X.ctx;
  for (let i = 0; i < n; i++) { const a = seg(k, hash(i * 3.1 + seed) * .8, hash(i * 3.1 + seed) * .8 + .2); if (a <= 0) continue;
    const x = V0.x0 + hash(i * 7.7 + seed) * (V0.x1 - V0.x0), y = V0.y0 + hash(i * 1.9 + seed) * (V0.y1 - V0.y0) * .9, tw = .6 + .4 * sin(X.t * 2 + i), r = 1.6 + 2.4 * hash(i * 5);
    c.fillStyle = rgba(ZX.cream, a * tw); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); if (r > 3.4) glow(x, y, r * 8, '#FFE2A8', .25 * a * tw); }
}
function shotInterlude(t, lt, d) {
  const c = X.ctx, B8 = R8POS(), V0 = X.VIS;
  plate('night');
  const lift = easeIO(seg(lt, 1.2, 4.5)), orbit = seg(lt, 3, 15.6), apart = easeIn(seg(lt, 14.2, 17.4));
  starsField(t, seg(lt, .8, 9));
  // the floor line (from R8) fades
  const fl = 1 - seg(lt, 1.2, 3); if (fl > 0) ink([[V0.x0 - 20, B8.floor], [CX(), B8.floor + 2], [V0.x1 + 20, B8.floor]], 5, { col: ZX.cream, key: 'ifl', alpha: fl, taper: [0, 0] });
  // binary orbit: from back-to-back on the floor to circling each other, then flung apart
  const mx = CX(), my = O(520, 900), th = PI + orbit * TAU * 1.5 + apart * 1.2, rr = lerp(O(340, 270), O(560, 330), ease(seg(lt, 3, 8))) * (1 + apart * 1.8), ry = O(.32, 1.1);
  const pos = w => { const sg = w === 'her' ? 1 : -1; return [mx + cos(th) * rr * sg, my + sin(th) * rr * ry * sg]; };
  const P = { her: pos('her'), him: pos('him') };
  // trails (dotted, each in their colour)
  if (orbit > 0) for (const w of ['her', 'him']) { for (let i = 1; i < 26; i++) { const a = th - i * .09, sg = w === 'her' ? 1 : -1, x = mx + cos(a) * rr * sg, y = my + sin(a) * rr * ry * sg;
    c.fillStyle = rgba(w === 'her' ? ZX.coral : ZX.mist, (1 - i / 26) * .8 * seg(orbit, 0, .05)); c.beginPath(); c.arc(x, y + O(120, 120), 4, 0, TAU); c.fill(); } }
  for (const w of ['her', 'him']) {
    const s0 = B8[w][2], s = lerp(s0, O(170, 160), lift), fx = lerp(B8[w][0], P[w][0], lift), fy = lerp(B8[w][1], P[w][1] - s * .3, lift);
    const other = w === 'her' ? P.him : P.her, face = lift < .5 ? (w === 'her' ? -1 : 1) : Math.sign(other[0] - P[w][0]) || 1;
    const dir = lift < .5 ? face : lerp(w === 'her' ? -1 : 1, face, seg(lift, .5, 1)) || face;
    figure({ who: w, x: fx, y: fy, s, dir: sgnDir(dir), tilt: sin(t * .7 + (w === 'her' ? 0 : 2)) * .08, blink: blinkAt(t, w === 'her' ? [124.2, 131.0] : [127.5, 133.6]), alpha: 1 - seg(apart, .7, 1) });
  }
  // the spark: a coral point rises from the bottom and bursts at 2:18
  const sk = seg(t, 135.8, 138); if (sk > 0) { const x = CX() + sin(sk * 9) * 8, y = lerp(V0.y1 + 20, FW0()[1], easeOut(sk));
    for (let i = 0; i < 10; i++) { const yy = y + i * 16; c.fillStyle = rgba(ZX.coral, (1 - i / 10) * .9); c.beginPath(); c.arc(x + sin((sk - i * .01) * 9) * 8, yy, 5 - i * .35, 0, TAU); c.fill(); }
    glow(x, y, 60, '#FF8A5A', .7); }
  // first second: the print dots shrink back into paint
  X.mix = 1 - easeOut(seg(lt, 0, 1.3)); if (X.mix > 0) chorusDensity(118.6, 4.03, 4.03, 'R8', false);
  X.dark = true; X.lyr = { mode: 'none' };
}
// ---------- fireworks ----------
const FW0 = () => [CX(), O(300, 520)];
const FW_T = () => [138, 139.0, 139.95, 140.9, 141.85, 142.6];
function fwPos(i) { const P = X.L ? [[960, 300], [560, 260], [1380, 220], [760, 400], [1200, 360], [960, 240]] : [[540, 520], [300, 420], [800, 360], [420, 720], [700, 640], [540, 460]]; return P[i]; }
function shotFireworks(t, lt, d) {
  plate('night'); const c = X.ctx;
  const T = FW_T(); let flash = 0;
  T.forEach((ts, i) => { const [x, y] = fwPos(i), age = t - ts; if (i < T.length - 1 || age < .9) firework(x, y, age, i % 2 ? ZX.amberLt : ZX.coral, O(1.2, 1.25) * (i === 0 ? 1.25 : 1), 'fw' + i); if (age > 0 && age < .5) flash = max(flash, 1 - age / .5); });
  if (flash > 0) fillAll('#5A4A60', .12 * flash);
  // two small figures from the back-left looking up, lit by each burst
  const s = O(190, 210), tint = flash > .35 ? '#FFC98A' : null;
  figure({ who: 'her', x: O(780, 380), y: O(780, 1430), s, dir: 1, tilt: -.38, look: .6, blink: blinkAt(t, [141.2]), skinTint: tint });
  figure({ who: 'him', x: O(1110, 700), y: O(760, 1400), s: s * 1.05, dir: -1, tilt: -.34, look: .6, blink: blinkAt(t, [140.1]), skinTint: tint });
  // the last burst's trails fall to the ground and become two lines (→ paths)
  const fall = seg(t, 142.9, 143.88); if (fall > 0) { const [x, y] = fwPos(5); for (const sg of [-1, 1]) inkPart([[x + sg * 40, y + 60], [x + sg * 80, lerp(y + 200, X.VIS.y1 - 200, fall)], [x + sg * 30, X.VIS.y1 + 20]], easeIn(fall), 4, { col: sg < 0 ? ZX.coral : ZX.mist, key: 'ft' + sg }); }
  nightLyr();
}
// ---------- paths: one point, two roads, a growing deviation ----------
function pathPts(sg, k, straight = 0) {
  const V0 = X.VIS, x0 = CX(), y0 = V0.y1 + 20, P = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24, dev = pow(u, 1.6) * O(700, 420) * k, x = x0 + sg * dev, y = y0 - u * (V0.y1 - V0.y0 + 60);
    P.push([lerp(x, x0, sg < 0 ? straight : 0), y]); }
  return P;
}
function shotPaths(t, lt, d) {
  plate('night'); fillAll(ZX.inkNight, .2); const c = X.ctx, V0 = X.VIS;
  const k = easeIO(seg(lt, 0, d * .8)), st = easeIO(seg(lt, d - .6, d));
  const her = pathPts(-1, k, st), him = pathPts(1, k);
  ink(her, 5, { col: ZX.coral, key: 'ph', taper: [0, .2] }); ink(him, 5, { col: ZX.mist, key: 'pm', taper: [0, .2], alpha: 1 - st * .6 });
  // footprints walking away on each road
  for (const [P, col, ph] of [[her, ZX.coral, 0], [him, ZX.mist, .5]]) for (let i = 0; i < 9; i++) { const u = ((lt * .18 + i / 9 + ph * .05) % 1), j = min(23, floor(u * 24)), q = P[j], q2 = P[j + 1];
    const x = lerp(q[0], q2[0], u * 24 - j), y = lerp(q[1], q2[1], u * 24 - j); c.fillStyle = rgba(col, .8 * (1 - st)); c.beginPath(); c.ellipse(x + (i % 2 ? 9 : -9), y, 5, 9, 0, 0, TAU); c.fill(); }
  // the deviation, measured
  const a = atan2(O(700, 420) * k, V0.y1 - V0.y0) * 180 / PI * 2, ox = CX(), oy = V0.y1 - O(120, 220);
  if (k > .05 && st < 1) { const r = O(180, 160), arc = []; const a0 = -PI / 2 - atan2(O(700, 420) * k * .5, V0.y1 - V0.y0) * 1.2, a1 = -PI / 2 + atan2(O(700, 420) * k * .5, V0.y1 - V0.y0) * 1.2;
    for (let i = 0; i <= 14; i++) { const q = lerp(a0, a1, i / 14); arc.push([ox + cos(q) * r, oy + sin(q) * r]); } ink(arc, 2, { col: ZX.cream, key: 'dev', alpha: (1 - st) * .8 });
    c.save(); c.globalAlpha = (1 - st) * .85; c.fillStyle = ZX.cream; c.font = `600 ${O(22, 30)}px ${ZX.fUI}`; spaced(c, `Δ ${a.toFixed(1)}°`, ox, oy - r - 22, 3, 'center'); c.restore(); }
  nightLyr();
}
// ---------- pour: the coral road stands up as a stream from a tipped cup ----------
const CUP = () => X.L ? [960, 230] : [540, 420];
function cupShape(x, y, rot, s) { const P = rotP(offP([[-90, -110], [90, -110], [70, 110], [-70, 110]], x, y, s), x, y, rot); shape(P, ZX.cream, { lc: ZX.inkNight, key: 'cup', lw: 3 }); return rotP([[x + 90 * s, y - 110 * s]], x, y, rot)[0]; }
function shotPour(t, lt, d) {
  plate('night'); fillAll(ZX.inkNight, .2 * (1 - seg(lt, 0, 1))); const c = X.ctx, V0 = X.VIS, [cx, cy] = CUP();
  const tip = kf(lt, [[0, 0], [.6, 1.9], [d - 1, 2.1], [d - .3, .3]]), empty = seg(lt, d * .55, d * .85), cin = easeOut(seg(lt, 0, .6));
  const lip = cupShape(cx - 60 + (1 - cin) * 0, cy - (1 - cin) * 400, tip, O(1, 1.15));
  // stream: full → thinning → drops (我不强求)
  const sw = lerp(26, 4, empty), bot = V0.y1 + 20;
  if (lt < .6) ink(pathPts(-1, 0, 1), 5, { col: ZX.coral, key: 'ph', taper: [0, 0], alpha: 1 - lt / .6 });
  if (empty < 1) { const P = [[lip[0], lip[1]], [lip[0] + 26, lip[1] + 60]]; for (let i = 1; i <= 8; i++) P.push([lip[0] + 34 + sin(t * 8 + i) * 3, lerp(lip[1] + 60, bot, i / 8)]); ink(P, sw, { col: ZX.coral, key: 'stream', taper: [.1, 0] }); }
  // splash at the bottom: drops leap and fall back
  for (let i = 0; i < 14; i++) { const ph = (t * 1.6 + hash(i)) % 1, x = lip[0] + 34 + (hash(i * 3) - .5) * 260 * ph, y = bot - 40 - sin(ph * PI) * (120 + 160 * hash(i * 5)); c.fillStyle = rgba(ZX.coral, (1 - ph) * (1 - empty * .8)); c.beginPath(); c.arc(x, y, 7 * (1 - ph) + 2, 0, TAU); c.fill(); }
  // single drops when it is empty → the last drop (→ palm)
  if (empty > 0) for (let i = 0; i < 4; i++) { const ts = d * .7 + i * .35, age = lt - ts; if (age < 0) continue; const y = lip[1] + 60 + age * age * 1800; if (y > bot) continue; wash(ellP(lip[0] + 34, y, 9, 14, 12), ZX.coral, { tex: .4 }); }
  nightLyr();
}
// ---------- palm: the last warm drop, cooling ----------
const PALM = () => X.L ? [960, 760] : [540, 1300];
function shotHand(t, lt, d) {
  plate('night'); const c = X.ctx, [hx, hy] = PALM(), s = O(1.7, 1.9), V0 = X.VIS;
  const cool = easeIO(seg(lt, .8, d - .3)), tiltA = easeIO(seg(lt, d - .5, d)) * .5;
  hand(hx, hy, s, -.1 + tiltA, mixCol('#F2D9B0', '#B8C4D4', cool), ZX.inkNight);
  glow(hx, hy - 40, 300 * (1 - cool * .7), '#FFB45E', .75 * (1 - cool));
  // the drop: falls in, sits warm, then rolls off the tilted palm (→ bowl)
  const [lx] = CUP(), fall = seg(lt, 0, .5), roll = easeIn(seg(lt, d - .5, d));
  const dx = lerp(lx - 26, hx, ease(fall)) + roll * O(500, 320), dy = lerp(V0.y0 - 40, hy - 50, easeIn(fall)) + roll * O(160, 220);
  wash(ellP(dx, dy, 18, lerp(26, 16, fall), 16), mixCol(ZX.coral, '#9AA8BC', cool * .8), { tex: .5 });
  // frost creeping in from the edges of the palm
  for (let i = 0; i < 9; i++) { const a = -PI * .9 + i * PI * .22, r0 = 260 * s * .55, r1 = r0 + 70 * cool; if (cool > .05) ink([[hx + cos(a) * r0, hy + sin(a) * r0 * .9], [hx + cos(a + .05) * (r0 + r1) / 2, hy + sin(a + .05) * (r0 + r1) / 2 * .9], [hx + cos(a) * r1, hy + sin(a) * r1 * .9]], 2, { col: '#B8C4D4', key: 'fr' + i, alpha: cool }); }
  // her, far away and leaving (a small coral figure at the top)
  const w = seg(lt, 0, d); figure({ who: 'her', x: O(1500, 860) + w * 60, y: O(260, 420), s: O(90, 90), dir: 1, alpha: .9 * (1 - w * .8), blink: 0, noBody: false });
  nightLyr();
}
// ---------- fishbowl: two fish circling, a knock, a crack ----------
const BOWL = () => X.L ? [1240, 560, 300] : [540, 900, 330];
function bowlCrack(k, x, y, r) { if (k <= 0) return; const P = [[x - r * .2, y - r * .95], [x - r * .05, y - r * .6], [x - r * .25, y - r * .35], [x + r * .02, y - r * .05], [x - r * .1, y + r * .3], [x + r * .12, y + r * .55]]; inkPart(P, k, 3.2, { col: ZX.cream, key: 'crack', smooth: 0 }); }
function shotFish(t, lt, d) {
  plate('night'); const c = X.ctx, [bx, by, br] = BOWL();
  const knock = 156.8, shake = (t > knock && t < knock + .5) ? sin((t - knock) * 60) * 14 * (1 - (t - knock) / .5) : 0;
  c.save(); c.translate(shake, 0);
  const bowl = ellP(bx, by, br, br * .96, 48);
  wash(bowl, '#3D5778', { tex: .7, alpha: .85 }); wash(ellP(bx, by - br * .25, br * .97, br * .2, 30).slice(0, 25).concat([[bx + br, by + br], [bx - br, by + br]]), '#5C7FA8', { tex: .8, alpha: .5 });
  // the drop lands (ripple at the top surface)
  const rp = seg(lt, .2, 1.4); if (rp > 0 && rp < 1) ripple(bx, by - br * .25, 40 + rp * 160, 1 - rp, 'bwr');
  // two fish, circling each other (her coral, him mist)
  const sp = t * 1.6, rr = br * .45;
  fish(bx + cos(sp) * rr, by + sin(sp) * rr * .5, sp + PI / 2, O(1.0, 1.1), ZX.coral, 'fa');
  fish(bx + cos(sp + PI) * rr, by + sin(sp + PI) * rr * .5, sp + PI * 1.5, O(1.0, 1.1), ZX.mist, 'fb');
  ink(bowl, 3.4, { col: ZX.cream, closed: true, key: 'bowl' }); bowlCrack(easeOut(seg(t, knock, knock + .35)), bx, by, br);
  glow(bx - br * .4, by - br * .45, 60, '#FFFFFF', .25);
  c.restore();
  // the drop arriving from the palm
  const fall = seg(lt, 0, .3); if (fall < 1) { const [hx, hy] = PALM(); wash(ellP(lerp(hx + O(500, 320), bx, fall), lerp(hy - 50 + O(160, 220), by - br * .25, fall), 14, 18, 12), '#9AA8BC', { tex: .4 }); }
  nightLyr();
}
// ---------- dream: the cracked bowl is the bubble over his sleeping head ----------
function shotDream(t, lt, d) {
  plate('night'); const c = X.ctx, [bx, by, br] = BOWL(), up = easeIn(seg(lt, d - .7, d)) * O(900, 1300);
  const hx = O(560, 380), hy = O(760, 1450), s = O(300, 320);
  figure({ who: 'him', x: hx, y: hy, s, dir: 1, tilt: .32 + sin(t * .8) * .03, blink: 1, brow: .5 });   // eyes shut on purpose: he is asleep
  // thought dots from his head to the bubble
  for (let i = 0; i < 4; i++) { const u = (i + 1) / 5, x = lerp(hx + s * .4, bx - br * .7, u), y = lerp(hy - s * .6, by + br * .7, u) - up * u; c.fillStyle = rgba(ZX.cream, .9); c.beginPath(); c.arc(x, y, 8 + i * 5, 0, TAU); c.fill(); }
  // inside the bubble: her, in amber (the past), still there
  const m = easeIO(seg(lt, 0, .8));
  c.save(); c.beginPath(); c.ellipse(bx, by - up, br, br * .96, 0, 0, TAU); c.clip();
  wash(ellP(bx, by - up, br, br * .96, 48), mixCol('#3D5778', ZX.amber, m), { tex: .8 });
  if (m > 0) figure({ who: 'her', x: bx - br * .12, y: by - br * .18 - up, s: br * .62, dir: 1, tilt: .06, blink: blinkAt(t, [160.2]), alpha: m });
  if (m < 1) { const sp = t * 1.6, rr = br * .45; c.globalAlpha = 1 - m; fish(bx + cos(sp) * rr, by + sin(sp) * rr * .5 - up, sp + PI / 2, 1, ZX.coral, 'fa'); fish(bx + cos(sp + PI) * rr, by + sin(sp + PI) * rr * .5 - up, sp + PI * 1.5, 1, ZX.mist, 'fb'); c.globalAlpha = 1; }
  c.restore();
  ink(ellP(bx, by - up, br, br * .96, 48), 3.4, { col: ZX.cream, closed: true, key: 'bowl' }); c.save(); c.translate(0, -up); bowlCrack(1, bx, by, br); c.restore();
  nightLyr();
}
// ---------- strings: fate's puppet; a heart line that wants to move ----------
const STR = () => X.L ? { x: 960, y: 330, s: 300, bar: 70 } : { x: 540, y: 760, s: 320, bar: 230 };
function shotStrings(t, lt, d) {
  plate('night'); const c = X.ctx, S = STR(), V0 = X.VIS, cut = seg(t, 166.0, 166.25), drop = easeIn(seg(t, 166.05, 166.56)) * O(1100, 1500);
  const pull = sin(t * 2.4) * .14, down = easeOut(seg(lt, 0, .8));
  const f = figure({ who: 'him', x: S.x + sin(t * 1.2) * 30, y: S.y + 20 + drop, s: S.s, dir: -1, tilt: pull, bodyTilt: pull * .4, brow: .4, blink: blinkAt(t, [163.4, 165.2]) * .8 + .35 });
  // the cross-bar and its strings (they arrive from the dream bubble's dots)
  const bx = S.x + sin(t * 1.2) * 30, by = V0.y0 + S.bar + (1 - down) * -300;
  ink([[bx - 220, by + pull * 200], [bx, by], [bx + 220, by - pull * 200]], 6, { col: ZX.cream, key: 'bar' });
  const anchors = [[.5, -.05], [-.3, 1.3], [1.0, 1.3]];
  anchors.forEach((a, i) => { const p = f.pt(a), top = [bx + (i - 1) * 200, by + (i - 1) * -pull * 200]; const yEnd = cut > 0 ? lerp(p[1], top[1] + 80, cut) : p[1];
    ink([top, [lerp(top[0], p[0], .5), lerp(top[1], yEnd, .5)], [p[0], yEnd]], 1.6, { col: ZX.cream, key: 'st' + i, alpha: .85 }); });
  // heart line across the chest: it moves on every beat, then is told not to (又何必让心波动)
  const amp = (1 - easeIO(seg(t, 164.3, 165.6))) * O(90, 80) * (.4 + .6 * pulse(t, 4)), y = S.y + S.s * 1.8 + drop, P = [];
  for (let i = 0; i <= 40; i++) { const x = lerp(V0.x0 - 20, V0.x1 + 20, i / 40); P.push([x, y + sin(i * .9 - t * 6) * amp * exp(-pow((x - S.x) / O(500, 360), 2))]); }
  ink(P, 4, { col: ZX.coral, key: 'heart', taper: [0, 0] });
  nightLyr();
}
// ---------- chair: nobody in it; light from a door; someone's shadow ----------
const DOOR = () => X.L ? [1480, 220, 260, 600] : [700, 760, 260, 620];
function room(t, k = 1) {
  const c = X.ctx, V0 = X.VIS, [dx, dy, dw, dh] = DOOR(), floorY = dy + dh;
  wash([[V0.x0 - 20, floorY], [V0.x1 + 20, floorY], [V0.x1 + 20, V0.y1 + 20], [V0.x0 - 20, V0.y1 + 20]], '#1A2131', { tex: .8, alpha: .8 * k });
  const open = easeOut(seg(t, 167.2, 168.4));
  wash(rectP(dx, dy, dw * open, dh), '#F6E2B4', { tex: .3, edge: .1, alpha: k }); glow(dx + dw * open / 2, dy + dh * .5, 420, '#FFC27A', .35 * open * k);
  // light falling into the room
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .25 * open * k; c.fillStyle = '#FFC27A'; c.beginPath(); c.moveTo(dx, floorY); c.lineTo(dx + dw * open, floorY); c.lineTo(dx + dw * open - O(700, 300), V0.y1 + 20); c.lineTo(dx - O(900, 420), V0.y1 + 20); c.closePath(); c.fill(); c.restore();
  ink(rectP(dx, dy, dw, dh), 3, { col: ZX.inkNight, closed: true, smooth: 0, key: 'door', alpha: k });
  return { open, floorY, dx, dy, dw, dh };
}
function shotChair(t, lt, d) {
  plate('night'); const c = X.ctx, V0 = X.VIS, R = room(t);
  const chX = O(760, 360), chY = R.floorY - O(-10, -60);
  lightCone(chX, V0.y0 - 20, 90, O(620, 520), chY - V0.y0 + 300, '#FFC27A', .55); glow(chX, chY - 120, 380, '#FFC27A', .22);
  chair(chX, chY - 250 * O(1.2, 1.1) + 230 * O(1.2, 1.1), O(1.2, 1.1), '#3A4258', ZX.cream);
  // the cut strings fall onto the empty seat
  const fall = easeIn(seg(lt, 0, .7)); for (let i = 0; i < 3; i++) { const x = chX - 80 + i * 70, y0 = lerp(V0.y0 - 200, chY - 60, fall); ink([[x, y0 - 300 + fall * 260], [x + 10, y0 - 150 + fall * 120], [x + 30 * fall, y0]], 1.6, { col: ZX.cream, key: 'cs' + i, alpha: .8 }); }
  // someone's shadow enters the light (下一个又会是谁)
  const sh = easeIO(seg(t, 168.2, 170.19)); if (sh > 0) { c.save(); c.globalAlpha = .7 * sh; c.translate(R.dx + R.dw * .5, R.floorY); c.transform(1, 0, O(-1.1, -.6), O(.55, .5) + sh * .25, 0, 0);
    figFlat(c, { who: 'her', x: 60 - (1 - sh) * 200, y: -O(560, 600), s: O(170, 180), dir: -1, fill: '#0E1320', eye: false }); c.restore(); }
  nightLyr();
}
// ---------- shadows on the wall: where they overlapped, a seal stays ----------
const SEAL = () => X.L ? [960, 430, 150] : [540, 860, 170];
function seal(x, y, s, a = 1, rot = -.06) {
  const c = X.ctx; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot);
  wash(rrP(-s / 2, -s / 2, s, s, s * .12, 3), ZX.coral, { tex: .9, edge: .3 });
  c.fillStyle = ZX.paper; c.font = `${s * .4}px ${ZX.fCNB}`; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText('周', s * .2, -s * .2); c.fillText('旋', s * .2, s * .22); c.fillText('印', -s * .21, 0);
  c.restore();
}
function shotShadows(t, lt, d) {
  plate('night'); const c = X.ctx, V0 = X.VIS, [sx, sy, ss] = SEAL(), [dx, dy, dw, dh] = DOOR(), ex = easeIO(seg(lt, 0, 1.1));
  // the doorway's light opens up into the whole wall the shadows fall on
  const wl = [lerp(dx, V0.x0 - 40, ex), lerp(dy, V0.y0 - 40, ex), lerp(dw, V0.x1 - V0.x0 + 80, ex), lerp(dh, V0.y1 - V0.y0 + 80, ex)];
  c.save(); c.globalAlpha = lerp(1, .55, ex); wash(rectP(...wl), '#E8C08A', { tex: .7, edge: .2 }); c.restore(); glow(sx, sy, O(900, 800), '#FFC27A', .3);
  // first moments: the doorway shadow slides onto this wall
  if (ex < 1) { c.save(); c.globalAlpha = 1 - ex; const chX = O(760, 360), chY = DOOR()[1] + DOOR()[3] + O(10, 60); lightCone(chX, V0.y0 - 20, 90, O(620, 520), chY - V0.y0 + 300, '#FFC27A', .55); chair(chX, chY - 20 * O(1.2, 1.1), O(1.2, 1.1), '#3A4258', ZX.cream); c.restore(); }
  const meet = kf(lt, [[0, 1], [1.6, 0], [2.6, 0], [d, 1.1]], easeIO), S = O(300, 300);
  const herX = sx - O(60, 40) - meet * O(520, 300), himX = sx + O(60, 40) + meet * O(520, 300), fy = sy - O(80, 60);
  c.save(); c.globalAlpha = .62 * easeIO(seg(lt, .2, 1.2)); figFlat(c, { who: 'her', x: herX, y: fy, s: S, dir: 1, fill: '#151A28', eye: false }); figFlat(c, { who: 'him', x: himX, y: fy - 10, s: S * 1.04, dir: -1, fill: '#151A28', eye: false }); c.restore();
  // the seal is pressed where they overlapped, and stays
  const press = backOut(seg(t, 172.0, 172.5)); if (press > 0) seal(sx, sy + S * .9, ss * press);
  nightLyr();
}
// ---------- bubbles: the same scene again and again, popping ----------
function bubble(x, y, r, a, k, kind) {
  const c = X.ctx; c.save(); c.globalAlpha = a;
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); wash(ellP(x, y, r, r, 30), '#3D5778', { tex: .5, alpha: .4 });
  figFlat(c, { who: 'her', x: x - r * .38, y: y - r * .25, s: r * .4, dir: 1, fill: ZX.coral, eye: false }); figFlat(c, { who: 'him', x: x + r * .38, y: y - r * .27, s: r * .42, dir: -1, fill: ZX.mist, eye: false }); c.restore();
  ink(ellP(x, y, r, r, 30), 2.4, { col: ZX.cream, closed: true, key: 'bb' + k, alpha: a }); glow(x - r * .4, y - r * .4, r * .3, '#FFFFFF', .3 * a);
}
function shotBubbles(t, lt, d) {
  plate('night'); const c = X.ctx, V0 = X.VIS, [sx, sy, ss] = SEAL();
  const lift = easeIO(seg(lt, 0, 1)); if (lift < 1) { c.save(); c.globalAlpha = .55 * (1 - lift); wash(rectP(V0.x0 - 40, V0.y0 - 40, V0.x1 - V0.x0 + 80, V0.y1 - V0.y0 + 80), '#E8C08A', { tex: .7, edge: .2 }); c.restore(); glow(sx, sy, O(900, 800), '#FFC27A', .3 * (1 - lift)); }
  if (lift < 1) { const S = O(300, 300), m = 1.1, fy = sy - O(80, 60); c.save(); c.globalAlpha = .62 * (1 - lift); figFlat(c, { who: 'her', x: sx - O(60, 40) - m * O(520, 300), y: fy, s: S, dir: 1, fill: '#151A28', eye: false }); figFlat(c, { who: 'him', x: sx + O(60, 40) + m * O(520, 300), y: fy - 10, s: S * 1.04, dir: -1, fill: '#151A28', eye: false }); c.restore(); }
  if (lift < 1) seal(sx, sy + 270 - lift * 200, ss * (1 - lift * .6), 1 - lift);
  for (let i = 0; i < 11; i++) {
    const born = .3 + i * .28, age = lt - born, popAt = 1.2 + hash(i * 9) * 1.6; if (age < 0) continue;
    const x = (i === 0 ? sx : V0.x0 + (.12 + .76 * hash(i * 4.4)) * (V0.x1 - V0.x0)) + sin(age * 2 + i) * 20, y = (i === 0 ? sy + 70 : V0.y1 - 100) - age * O(150, 260) * (1 + hash(i));
    const r = O(70, 80) + hash(i * 2) * O(70, 80), last = i === 10;
    if (!last && age > popAt) { const pa = age - popAt; if (pa < .35) for (let k = 0; k < 8; k++) { const q = k / 8 * TAU, rr = r * (1 + pa * 2); c.fillStyle = rgba(ZX.cream, 1 - pa / .35); c.beginPath(); c.arc(x + cos(q) * rr, y + sin(q) * rr, 3, 0, TAU); c.fill(); } continue; }
    if (last) { const fallK = easeIO(seg(lt, d - 1.2, d)), BX = BOAT0(); bubble(lerp(x, BX[0], fallK), lerp(y, BX[1], fallK), lerp(r, O(110, 120), fallK), 1, i, 0); }
    else bubble(x, y, r, min(1, age * 4), i, 0);
  }
  nightLyr();
}
// ---------- storm: the last bubble lands as a paper boat ----------
const BOAT0 = () => X.L ? [960, 640] : [540, 1120];
function waves(t, y0, amp, col, key, a = 1) { const V0 = X.VIS, P = []; for (let i = 0; i <= 30; i++) { const x = lerp(V0.x0 - 30, V0.x1 + 30, i / 30); P.push([x, y0 + sin(i * .8 + t * 2.4) * amp + sin(i * .33 - t * 1.3) * amp * .6]); } ink(P, 3, { col, key, alpha: a, taper: [0, 0] }); return P; }
function shotStorm(t, lt, d) {
  plate('sea'); const c = X.ctx, V0 = X.VIS, [bx, by] = BOAT0();
  const m = easeOut(seg(lt, 0, .5)), roll = sin(t * 2.2) * .28, heave = sin(t * 2.2 + 1) * 40;
  rain(O(160, 140), rgba(ZX.cream, .55), 1, .3, 3, [40, 90], 1800);
  for (let j = 0; j < 4; j++) waves(t + j, by + 40 + j * O(90, 120), 22 + j * 6, j % 2 ? ZX.cream : '#A9B8C8', 'wv' + j, .8);
  if (m < 1) bubble(bx, by, O(110, 120), 1 - m, 99, 0);
  paperBoat(bx, by + heave, O(1.4, 1.5) * m, roll);
  // lightning flash on the strong beats
  const fl = pulse(t, 9) * (floor(beatOf(t)) % 4 === 0 ? 1 : 0); if (fl > .3) fillAll('#E8EEF5', .25 * fl);
  // the big wave rises (→ flood)
  const wv = easeIn(seg(lt, d - .9, d)); if (wv > 0) { const y = lerp(V0.y1 + 40, V0.y0 - 60, wv), P = [[V0.x0 - 40, V0.y1 + 40]]; for (let i = 0; i <= 20; i++) P.push([lerp(V0.x0 - 40, V0.x1 + 40, i / 20), y + sin(i * .7 + t * 3) * 40]); P.push([V0.x1 + 40, V0.y1 + 40]); wash(P, ZX.inkNight, { tex: .9, edge: .4 }); }
  nightLyr();
}
// ---------- flood: memory rises without a sound; every night's moon goes under ----------
const MOONS = 7;
function moonPos(i) { return X.L ? [260 + i * 233, 210] : [150 + (i % 4) * 260, 330 + floor(i / 4) * 230]; }
function moon(x, y, r, f, a, side = 1) { const c = X.ctx; c.save(); c.globalAlpha *= a; wash(ellP(x, y, r, r, 30), ZX.cream, { tex: .4, edge: .2 }); if (f < .98) { c.beginPath(); c.arc(x, y, r + 1, 0, TAU); c.clip(); c.fillStyle = ZX.night; c.beginPath(); c.ellipse(x + side * f * r * 2.05, y, r * 1.02, r * 1.02, 0, 0, TAU); c.fill(); } c.restore(); }
function shotFlood(t, lt, d) {
  plate('night'); const c = X.ctx, V0 = X.VIS;
  const lvl = lerp(V0.y0 - 60, V0.y1 - O(160, 300), easeOut(seg(lt, 0, 1.2))) - ease(seg(lt, 1, d - .4)) * O(560, 1000) * 0;
  // moons, one per night; the ink climbs and swallows them one by one
  const rise = ease(seg(lt, .6, d - .5)), floodY = lerp(V0.y1 - O(160, 300), V0.y0 + O(330, 560), rise);
  for (let i = 0; i < MOONS; i++) { const [x, y] = moonPos(i), on = seg(lt, .4 + i * .32, .7 + i * .32), keep = i === 3 ? 1 : 1; if (on <= 0) continue; moon(x, y, O(54, 64), 1 - abs(i - 3) / 3 * .8, on, i < 3 ? -1 : 1); }
  const P = [[V0.x0 - 40, V0.y1 + 40]]; for (let i = 0; i <= 24; i++) P.push([lerp(V0.x0 - 40, V0.x1 + 40, i / 24), (lt < 1.2 ? lvl : floodY) + sin(i * .9 + t * 1.4) * 14]); P.push([V0.x1 + 40, V0.y1 + 40]);
  wash(P, '#141B2A', { tex: .9, edge: .4 }); ink(P.slice(1, -1), 2.4, { col: '#5C7FA8', key: 'fl' });
  for (let i = 0; i < 6; i++) { const y = (lt < 1.2 ? lvl : floodY) + 60 + i * O(90, 140); if (y < X.VIS.y1) waves(t * .5 + i, y, 8, '#3D5778', 'fw' + i, .6); }
  // the full moon (the middle one) stays above water, grows (→ iris)
  const [mx, my] = moonPos(3), g = easeIn(seg(lt, d - .9, d)), r = lerp(O(54, 64), O(240, 260), g);
  moon(lerp(mx, EYE0()[0], g), lerp(my, EYE0()[1], g), r, 1, 1);
  nightLyr();
}
// ---------- star-trail eye ----------
function starTrails(ex, ey, sp, a) { for (let i = 0; i < 40; i++) { const rr = O(300, 300) + hash(i * 3.3) * O(900, 700), a0 = hash(i * 7.1) * TAU, len = .2 + sp * .5; const arc = []; for (let k = 0; k <= 10; k++) { const q = a0 + k / 10 * len; arc.push([ex + cos(q) * rr, ey + sin(q) * rr]); } ink(arc, 1.6 + hash(i) * 1.6, { col: ZX.cream, key: 'trl' + i, alpha: .55 * a }); } }
const EYE0 = () => X.L ? [960, 520] : [540, 900];
function shotStarEye(t, lt, d) {
  plate('night'); fillAll(ZX.inkNight, .35); const c = X.ctx, [ex, ey] = EYE0(), G = FIG.her;
  const stop = seg(t, 189.8, 190.4), close = easeIn(seg(lt, d - .7, d));
  // star trails around the eye (long exposure); they stop on 只是我以为
  const sp = (t - 187.38) * .35 * (1 - stop * .9);
  const fl = 1 - easeOut(seg(lt, 0, .7)); if (fl > 0) fillAll('#141B2A', .85 * fl);
  starTrails(ex, ey, sp, 1 - stop * .7);
  if (false) for (let i = 0; i < 40; i++) { const rr = O(300, 300) + hash(i * 3.3) * O(900, 700), a0 = hash(i * 7.1) * TAU, len = .2 + sp * .5; const arc = []; for (let k = 0; k <= 10; k++) { const q = a0 + k / 10 * len; arc.push([ex + cos(q) * rr, ey + sin(q) * rr]); } ink(arc, 1.6 + hash(i) * 1.6, { col: ZX.cream, key: 'trl' + i, alpha: .55 * (1 - stop * .7) }); }
  // her eye, very close: lid curve + iris (the moon)
  const s = O(12000, 11000), [ix, iy, ir] = G.iris, m = figMatrix(0, 0, s, 1, 0), I = mApply(m, [ix, iy]), ox = ex - I[0], oy = ey - I[1];
  const T = P => P.map(p => { const q = mApply(m, p); return [q[0] + ox, q[1] + oy]; });
  const eyeIn = easeOut(seg(lt, 0, .6));
  const lidU = G.eyeU.map((p, i) => { const q = i / (G.eyeU.length - 1), a = G.eyeU[0], b = G.eyeU[G.eyeU.length - 1], base = [lerp(a[0], b[0], q), lerp(a[1], b[1], q) + .012]; return [lerp(p[0], base[0], close), lerp(p[1], base[1], close)]; });
  c.save(); c.globalAlpha = eyeIn; wash(T([...through(lidU, 4), ...through(G.eyeL, 4).reverse()]), '#F4EEE0', { tex: .3, edge: 0 }); c.restore();
  if (close < .9) { c.save(); c.beginPath(); pathOf(c, T([...through(lidU, 4), ...through(G.eyeL, 4).reverse()]), true); c.clip(); moon(ex, ey, ir * s * 1.05, 1, 1); wash(ellP(ex, ey, ir * s * .55, ir * s * .55, 28), ZX.ink, { tex: .5 });
    for (let i = 0; i < 10; i++) { const rr = ir * s * (.62 + i * .04), arc = []; for (let k = 0; k <= 8; k++) { const q = i + k / 8 * (.5 + sp * .4); arc.push([ex + cos(q) * rr, ey + sin(q) * rr]); } ink(arc, 1.4, { col: ZX.cream, key: 'itr' + i, alpha: .7 }); } c.restore(); }
  ink(T(lidU), O(30, 28), { key: 'elid', taper: [.2, .35] }); ink(T(G.eyeL), O(14, 13), { key: 'elow', alpha: (1 - close) * .9 }); ink(T(G.brow), O(16, 15), { key: 'ebrw', alpha: .8 });
  if (lt < .5) moon(ex, ey, lerp(O(240, 260), ir * s * 1.05, easeOut(lt / .5)), 1, 1 - lt / .5);
  nightLyr();
}
// ---------- shrink: the shut lid becomes the horizon; a stain pushes him back ----------
function lidLine(k) { const V0 = X.VIS, [ex, ey] = EYE0(), P = []; for (let i = 0; i <= 12; i++) { const u = i / 12; P.push([lerp(ex - O(700, 420) * (1 - k) , V0.x0 - 30, k) + u * lerp(O(1400, 840), V0.x1 - V0.x0 + 60, k), lerp(ey + sin(u * PI) * -40 * (1 - k), O(700, 1260), k)]); } return P; }
function shotShrink(t, lt, d) {
  plate('night'); const c = X.ctx, V0 = X.VIS, hk = easeIO(seg(lt, 0, .8)), H = lidLine(hk), hy = O(700, 1260);
  if (hk < 1) { fillAll(ZX.inkNight, .35 * (1 - hk)); const [ex, ey] = EYE0(); starTrails(ex, ey, (190.4 - 187.38) * .35 * .1 + 0, .3 * (1 - hk)); }
  ink(H, lerp(18, 3, hk), { col: ZX.ink, key: 'hor', taper: [0, 0] });
  // the stain spreads from the right
  const st = easeIn(seg(lt, .3, d)), sx = lerp(V0.x1 + 200, V0.x0 + (V0.x1 - V0.x0) * .25, st), P = [];
  for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, r = (V0.y1 - V0.y0) * (1 + .1 * sin(a * 5 + t)); P.push([sx + r + cos(a) * r * (1 + .15 * sin(a * 3)), hy + sin(a) * r * .9]); }
  wash(P, ZX.inkNight, { tex: .9, edge: .5, edgeW: 18 });
  const sc = lerp(O(300, 320), O(110, 120), easeIO(seg(lt, .4, d))), fx = lerp(O(1060, 600), O(560, 330), easeIO(seg(lt, .4, d)));
  figure({ who: 'him', x: fx, y: hy - sc * 3.25 + sc * 2.0, s: sc, dir: 1, tilt: .06, brow: .8, blink: blinkAt(t, [192.6]) * .5 + .3, alpha: hk });
  nightLyr();
}
// ---------- turn away ----------
function shotTurn(t, lt, d) {
  plate('night'); const c = X.ctx, V0 = X.VIS, hy = O(700, 1260);
  ink(lidLine(1), 3, { col: ZX.ink, key: 'hor', taper: [0, 0] });
  const back = 1 - easeOut(seg(lt, 0, d)), sx = lerp(V0.x0 + (V0.x1 - V0.x0) * .25, V0.x1 + 400, 1 - back), P = [];
  for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, r = (V0.y1 - V0.y0) * (1 + .1 * sin(a * 5 + t)); P.push([sx + r + cos(a) * r * (1 + .15 * sin(a * 3)), hy + sin(a) * r * .9]); }
  wash(P, ZX.inkNight, { tex: .9, edge: .5, edgeW: 18 });
  const tk = easeIO(seg(lt, .3, 1.3)), dir = cos(tk * PI), sc = lerp(O(110, 120), O(220, 240), easeIO(seg(lt, .2, d))), walk = easeIn(seg(lt, 1.3, d)) * O(-600, -420);
  figure({ who: 'him', x: O(560, 330) + walk, y: hy - sc * 1.25, s: sc, dir: sgnDir(dir), tilt: -.03, brow: .3, blink: .3 });
  // her face fades in from the right (→ gaze)
  const hf = easeIO(seg(lt, d - 1, d)); if (hf > 0) { const P1 = R1POS(); c.save(); c.globalAlpha = hf; figure({ who: 'her', x: P1.her[0], y: P1.her[1], s: P1.her[2], dir: 1, alpha: hf }); c.restore(); }
  nightLyr();
}
// ---------- her gaze; the kind lie runs out; into the inverted print ----------
function shotGaze(t, lt, d) {
  plate('night'); glow(O(960, 540), O(420, 880), O(700, 800), '#FFB45E', .16);
  const P = R1POS(), close = easeIO(seg(t, 200.6, 201.6)) * (1 - easeIO(seg(t, 202.4, 203.0)));
  const hin = easeIO(seg(lt, .4, 1.6));
  figure({ who: 'her', x: P.her[0], y: P.her[1], s: P.her[2], dir: 1, tilt: .02, blink: max(close, blinkAt(t, [199.4])), look: .3 });
  figure({ who: 'him', x: P.him[0], y: P.him[1] + (1 - hin) * 60, s: P.him[2], dir: -1, tilt: -.02, blink: blinkAt(t, [198.0]), look: .4, alpha: hin, brow: .4 });
  // the thread from 1:21, now unwinding back into her lips (终将尽)
  const k = 1 - easeIO(seg(t, 198.45, 201.6)); if (k > 0 && lt > .3) { const lip = [P.her[0] + P.her[2] * .34, P.her[1] + P.her[2] * .3], hc = [P.him[0] - P.him[2] * .05, P.him[1] + P.him[2] * .2], Q = [lip];
    for (let i = 1; i <= 48; i++) { const u = i / 48, a = PI + u * TAU * 1.6, r = P.him[2] * (.9 - .25 * u); Q.push([lerp(lip[0], hc[0] + cos(a) * r, ease(min(1, u * 3))), lerp(lip[1], hc[1] + sin(a) * r * .5, ease(min(1, u * 3)))]); }
    inkPart(Q, k * hin, 3.2, { col: ZX.coral, key: 'lie' }); }
  X.mix = easeIn(seg(t, 202.9, 203.7)); if (X.mix > 0) chorusDensity(203.7, 0, 1.2, 'R1', true);
  X.dark = true; X.lyr = {};
}
