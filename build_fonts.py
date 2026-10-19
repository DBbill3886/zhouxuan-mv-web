# 字体子集化：只保留站点用到的字形，并以 base64 内嵌进 CSS（离线可用、file:// 可用、无 CDN）
import glob,base64,io,subprocess,os
from fontTools.ttLib import TTFont,TTCollection
from fontTools import subset
from fontTools.varLib import instancer
chars=set()
for f in glob.glob('js/*.js')+['index.html']: chars|=set(open(f,encoding='utf8').read())
chars|=set(''.join(chr(c) for c in range(32,127)))|set('，。、：；！？“”‘’《》（）·—…「」')
txt=''.join(sorted(c for c in chars if ord(c)>=32))
def sub(font,name,text):
    o=subset.Options(); o.flavor='woff2'; o.layout_features=['kern','liga','palt']; o.name_IDs=['*']; o.notdef_outline=True
    s=subset.Subsetter(o); s.populate(text=text); s.subset(font)
    b=io.BytesIO(); font.flavor='woff2'; font.save(b); data=b.getvalue(); print(name,len(data)); return data
cjk=TTCollection('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc').fonts[2]
d1=sub(cjk,'ZXSerif',txt)
lat=TTFont('/usr/share/fonts/truetype/sand-box/google/Playfair Display/PlayfairDisplay-Italic-VariableFont_wght.ttf')
lat=instancer.instantiateVariableFont(lat,{'wght':800})
d2=sub(lat,'ZXLat',''.join(chr(c) for c in range(32,127)))
css=f"""/* Noto Serif CJK SC Bold (SIL OFL) & Playfair Display Italic 800 (SIL OFL) — subset, embedded */
@font-face{{font-family:"ZXSerif";font-weight:700;font-style:normal;font-display:block;src:url(data:font/woff2;base64,{base64.b64encode(d1).decode()}) format("woff2")}}
@font-face{{font-family:"ZXLat";font-weight:800;font-style:italic;font-display:block;src:url(data:font/woff2;base64,{base64.b64encode(d2).decode()}) format("woff2")}}
"""
open('fonts/fonts.css','w').write(css); print('chars',len(txt))
