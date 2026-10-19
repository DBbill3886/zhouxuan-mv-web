# 周旋 · Web MV（水彩墨线 × 双色 Riso）

在线：https://dbbill3886.github.io/zhouxuan-mv-web/

- 主歌：预烘焙水彩底板/人物（p5.brush 离线生成，每张 2 个 boil 变体，5 fps 交替）+ 实时 10 fps 沸腾墨线（Canvas 2D）。
- 副歌：同一套人物几何输出到两张密度层（雾蓝 / 珊瑚红），WebGL2 着色器实时做网点、套色偏移、缺墨与纸纹；副歌二为反转版（珊瑚红实地 + 镂空大字 + 雾蓝人物）。
- 色彩弧：琥珀（胶片）→ 夜蓝（熄灯、间奏、主歌二）→ 雨灰（尾声）。珊瑚红只属于“她”。
- 时间完全由 `audio.currentTime` 驱动，可任意拖动；横屏 1920×1080 与竖屏 1080×1920 各自独立构图。
- 调试参数：`?t=秒` 跳到某时刻，`&still` 静帧，`&q=0.5` 固定画质，`&auto` 无声自动播放。

结构：`js/core.js`（风格内核）`fig.js`（人物）`props.js`（道具）`post.js`（纸/Riso 着色器）
`shots_*.js`（各段镜头与镜头间的桥接物）`timeline.js`（镜头表）`main.js`（时钟、布局、歌词、UI）。
全部画面由代码生成，无 AI 生成图像。


## Pass 6 — silhouettes
All figures are backlit silhouettes with a rim light on the side facing each shot's light source (see STYLE_GUIDE.md › Pass 6).
`figure(o)` keeps the old API (`who x y s dir tilt arm armB full walk light rimA …`), so every shot calls it the same way; `figFlat` draws the
same silhouette into the Riso layers. The old sprite/ink face figures and `assets/sprites` are retired.
Dev: `node tools/figtest.mjs 1920x1080 out.png "<shot body js>" [t]` renders a one-off figure test.
