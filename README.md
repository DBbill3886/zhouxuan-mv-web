# 周旋 · Web MV

《周旋》（王以太 / 艾热 AIR）网页版实时动画 MV。纯静态站点：`index.html` + 原生 JS（Canvas 2D），无构建步骤；直接双击 `index.html` 或用任意静态服务器打开即可。

- 风格 B：奶油纸、墨蓝、唯一一根褪色红线、巨大的圆 / 落日、简笔小人、粗衬线中文排版。全部由代码绘制，无图片素材。
- 时间轴完全由 `audio.currentTime`（平滑时钟）驱动，可任意拖动进度条。
- 按 devicePixelRatio 渲染（上限 2x，帧时超预算时自动降分辨率）；横屏 16:9 舞台，竖屏为舞台 + 下方大字歌词。
- 快捷键：空格 播放/暂停，←/→ 快退/快进 5 秒，F 全屏。
- 调试参数：`?t=90` 定格在 90 秒；`?auto=1` 无音频虚拟时钟；`?fixq=1` 关闭自适应分辨率。

结构：`js/lib.js`（调色板/缓动/画笔/小人，即风格模块，见 `STYLE.md`）· `js/engine.js`（转场 pan/iris/flood、桥接圆与红线、字幕）· `js/scenes_*.js`（分镜）· `js/timeline.js`（时间线）· `js/main.js`（循环、时钟、界面）。
字体：Noto Serif CJK SC Bold 与 Playfair Display Italic（均为 SIL OFL）子集化后内嵌于 `fonts/fonts.css`（`build_fonts.py`）。
