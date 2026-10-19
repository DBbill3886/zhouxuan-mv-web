# Subset fonts to the glyphs the site uses and embed as base64 woff2 (works offline / file://, no CDN). All fonts SIL OFL.
import glob, base64, io
from fontTools.ttLib import TTFont, TTCollection
from fontTools import subset
from fontTools.varLib import instancer
chars = set()
for f in glob.glob('js/*.js') + ['index.html']: chars |= set(open(f, encoding='utf8').read())
chars |= set(chr(c) for c in range(32, 127)) | set('，。、：；！？“”‘’《》（）·—…「」×▸◂¥')
txt = ''.join(sorted(c for c in chars if ord(c) >= 32))
def sub(font, text):
    o = subset.Options(); o.flavor = 'woff2'; o.layout_features = ['kern', 'liga', 'palt']; o.name_IDs = ['*']; o.notdef_outline = True
    s = subset.Subsetter(o); s.populate(text=text); s.subset(font); b = io.BytesIO(); font.flavor = 'woff2'; font.save(b); return b.getvalue()
fonts = []
fonts.append(('ZXSong', sub(TTCollection('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc').fonts[2], txt)))
fonts.append(('ZXSongB', sub(TTCollection('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc').fonts[2], txt)))
fonts.append(('ZXDisp', sub(TTFont('/usr/share/fonts/truetype/sand-box/google/Anton/Anton-Regular.ttf'), ''.join(chr(c) for c in range(32, 127)))))
ui = instancer.instantiateVariableFont(TTFont('/usr/share/fonts/truetype/sand-box/google/Instrument Sans/InstrumentSans-VariableFont_wdth,wght.ttf'), {'wght': 600, 'wdth': 100})
fonts.append(('ZXUI', sub(ui, ''.join(chr(c) for c in range(32, 127)) + '·—×▸◂')))
css = '/* Noto Serif CJK SC Regular/Bold, Anton, Instrument Sans — SIL OFL 1.1 — subset & embedded */\n'
for n, d in fonts:
    css += f'@font-face{{font-family:"{n}";font-display:block;src:url(data:font/woff2;base64,{base64.b64encode(d).decode()}) format("woff2")}}\n'; print(n, len(d))
open('fonts/fonts.css', 'w').write(css); print('chars', len(txt))
