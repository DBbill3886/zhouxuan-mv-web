# 《周旋》Web MV — 统一风格规范 (v1)

一个世界，两种印刷：主歌 = 纸上水彩+沸腾墨线；副歌 = 同一张纸上的双色 Riso。

## 纸 (两种模式共用)
- 纸色 PAPER `#EEE6D4`（米白，不用纯白）。纤维/颗粒/暗角全部在后期着色器 `post.js` 统一施加，场景代码里不画纸纹。
- 所有文字也走着色器（乘到纸上并带颗粒），永远不"浮"在画面上。

## 调色板 (全片仅此 7 色；每个镜头 ≤ 4 色 = 纸 + 墨 + 1~2 颜料)
| 名 | HEX | 用途 |
|---|---|---|
| INK 墨 | `#262833` | 所有线条、头发；不用纯黑 |
| AMBER 琥珀 | `#D2924A` | 主歌一 胶片色 / 灯光 |
| CORAL 珊瑚红 | `#E0563F` | "她"的颜色；Riso 第二色 |
| MIST 雾蓝 | `#5C7FA8` | "他"的颜色；Riso 第一色 |
| NIGHT 夜蓝 | `#26324A` | 熄灯后 |
| RAIN 雨灰 | `#8C9196` | 结尾雨 |
| PAPER 纸 | `#EEE6D4` | 底/皮肤留白 |
色彩弧：琥珀胶片 → 夜蓝 → 雨灰；珊瑚红只属于"她"，贯穿到结尾作为唯一的暖色记号。

## 人物
- 侧脸剪影式：只有一条墨线勾出 额-鼻-唇-下巴；眼睛 = 睁开的杏仁形：上眼睑一笔（较粗、两端收锋）+ 下眼睑细线 + 一个实心墨色瞳点 + 眉线；Riso 剪影中眼形镂空、瞳点保留。只有剧情需要时（睡梦、闭眼凝视的段落）才闭眼。不画嘴巴、不画手指。
- 皮肤留纸色不上色；头发 = 一整块墨色水彩；衣服 = 一整块颜料水彩 + 细墨线。≤ 4 个形状/人。
- 她：齐刘海波波头、高领；他：短发、立领大衣。比例修长（头:胸像 ≈ 1:3.6），画面中大尺度（头高 ≥ 200px）。
- 同一套几何 (`fig.js`) 同时供水彩笔刷和 Riso 网点使用 → 两种模式里是"同一个人"。

## 线
- 墨线 boil 10 fps（BOIL=10），粗细 1.0 (人物) / 0.6 (环境)；环境尽量少线，多用水彩块面。

## 字体
- 英文大标题：Anton（压缩无衬线，副歌巨字）。
- 中文歌词：Noto Serif CJK SC（宋体系），字距 +0.25em，小而精；副歌可放大为 Bold。
- 细节信息（时间码/段落/署名）：Instrument Sans 大写 + 宽字距，16–18px，INK 70%。
- 版式网格：外边距 72px；信息栏固定在四角，歌词固定在左下或竖排右侧。

## Riso
- 两色：MIST + CORAL，乘法叠印（叠出深紫）；网点 cell 9px，角度 MIST 15° / CORAL 75°；套色偏移 3–6px；墨量不均（starvation）+ 颗粒。
- 实地（文字）直接实印，渐变区才出网点。

## 禁止
- 火柴人、圆脸大眼可爱风、细节堆砌的绘本风；纯黑/纯白；渐变发光泛滥；平涂无纹理的 canvas 形状；AI 生成图片。

## Continuity & motifs (pass 3)
- The film is 15 continuous movements (see `MOVES` in `web/js/timeline.js`). Inside a movement nothing cuts: beats hand over by morphing one shared object, and painted movements carry one slow travelling camera (push + drift) that is identity at both ends.
- Riso posters change by a print morph (old plate's dots shrink while the new plate's grow; figures stay registered).
- No clip-art props: no price tags, coins, receipts, ECG traces, balloons, question marks, thermometers, cups, cartoon hands, scissors. Use the style's own materials instead: washes that drain or cool, reflections, threads, dots, rings, tally strokes, type.
- Characters (pass 4): her — long neck, small upturned nose, soft coral lip tint, lashes on an almond open eye, long side-fringed hair falling behind the shoulder with light strands; slim sloping-shouldered sweater with a waist. Him — straight nose, defined jaw, swept quiff with strands, tailored coat with V collar + lapel. One geometry (geo.js) drives sprites, ink and Riso silhouettes.
- No literal violence/props: 刺骨 is cold breath + frost crystals; 高音 is her light rising out of reach with his thread dissolving into coral rain.
- Boil never hard-swaps baked variants (smooth ≤45 % crossfade); the visible canvas never resizes for quality.

## Pass 5 — figure language (Favre negative-space × Kiuchi quiet flat figures)
- No black contour round faces: the profile is the edge of the skin wash, plus at most a thin warm sienna edge (forehead→chin).
- One crisp darker-skin shadow shape under the jaw and down the neck carries the form; soft coral cheek glow.
- Hair is the main graphic shape (pointed locks, side part, tapered nape) with one cool mist-blue sheen; no strands.
- Her: small solid coral lips; him: one short warm mouth line, shaded ear, cream shirt V under the dark coat.
- Clothes are flat; outline/fold lines in a darker tone of the cloth, never ink-black.
- Full figures (8 heads, `full:true`) wherever the whole body is on screen (interlude orbit); half-body elsewhere.
- Textures never re-randomise per frame: wash granulation is anchored to the shape; boil is continuous; grain is static.
- Lyrics / chorus captions are clamped above the control bar (`X.safeB`).

## Pass 6 — backlit silhouettes (supersedes the pass-5 figure language)
- Every character is a flat backlit silhouette (`js/fig.js`): one dark fill from the scene palette (`SILPAL[plate]`), **no facial features**.
- Rim light only on the edge that faces the shot's light source: mask minus itself shifted along the light direction, plus a soft inner glow
  and a faint bloom. Each shot sets `X.light` (a point `[x,y]` or `{dir:[dx,dy]}`), `X.rimA`, `X.rimCol`; a point light falls off with `lightR`.
- Her: long hair that lifts in the wind, a dress or coat, a small deep-coral scarf at the neck (`#7A2F28`, her colour). Him: short hair, 3/4 jacket
  with stand collar, tapered trousers with a knee fold and ankle break, contrapposto `rest` stance.
- Gestures are read only through the outline, so arms leave the body: presets `down hang back pocket reach reachLow reachHi up chest mouth ear hug brow out slack`
  (array `[upper, fore, hand, curl, showHand, foreLen]`), eased with `{from,to,k}`.
- Busts dissolve below the waist (fade applied after the rim, so the fade edge is never lit); full figures stand with `anchorOn(who, groundY, s)`.
- Motion: breathing, slow sway, wind in hair and hem, walk gait (`walk`, `walkA` blends in). All deterministic in t — no per-frame random.
- Riso posters use the same silhouettes via `figFlat` (density layers), so print and paint share one figure.
- Kept motifs: frost breath for 言语刺骨 (he cools CORAL→MIST from the hands up, arms closing in), the rising coral light + red thread for 高音
  (his hand rises after it and sinks as the thread dissolves), red line with ink bleed in the leek scene, no scissors.
