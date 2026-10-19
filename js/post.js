/* post.js — the one shared print/paper pass (WebGL2).
   paint: scene × paper fibre × grain (+10 fps micro-warp boil).  riso: 2 density layers → halftone, misregistration, starvation.
   mix 0..1 blends paint → riso through growing halftone dots (the watercolour "goes to print"). */
'use strict';
const POST = (() => {
  let gl, prog, paperProg, fbo, paperTex, tex = {}, U = {}, W = 0, H = 0, ok = false;
  const VS = `#version 300 es
  in vec2 p; out vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;
  const NOISE = `
  float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=.5; } return s; }`;
  const PAPER_FS = `#version 300 es
  precision highp float; in vec2 uv; out vec4 o; uniform vec2 uRes; uniform float uK; ${NOISE}
  void main(){ vec2 px = uv*uRes/uK;   // logical-ish units so paper looks the same on every screen
    float cloud = fbm(px/420.)*.06 + fbm(px/90.)*.03, fib = 0.;
    for (int k=0;k<3;k++){ float a = float(k)*2.094+.4; mat2 r = mat2(cos(a),-sin(a),sin(a),cos(a)); vec2 q = r*px;
      fib += smoothstep(.72,.98, vnoise(vec2(q.x/1.6, q.y/14.)+float(k)*17.)) * smoothstep(.45,.8, vnoise(q/70.+float(k)*5.)); }
    float tooth = h21(floor(uv*uRes))*.03;
    vec2 v = uv-.5; float vig = 1. - dot(v,v)*.22;
    o = vec4(vec3((1. - cloud - fib*.03 - tooth + .05)*vig), 1.); }`;
  const FS = `#version 300 es
  precision highp float; in vec2 uv; out vec4 o;
  uniform sampler2D uScene, uA, uB, uPaper; uniform vec2 uRes; uniform float uSeed, uMix, uCell, uK, uWarp;
  uniform vec3 uPaperCol, uColA, uColB; uniform vec2 uMis; ${NOISE}
  float halftone(sampler2D t, vec2 px, float ang, float cell){
    float c = cos(ang), s = sin(ang); mat2 R = mat2(c, -s, s, c);
    vec2 q = R*px/cell, ce = floor(q)+.5; vec2 cp = transpose(R)*(ce*cell);
    float dc = texture(t, cp/uRes).r, dl = texture(t, px/uRes).r;
    float r = sqrt(dc)*.74, dist = length(q-ce) + (vnoise(px*.35/uK)-.5)*.10;
    float dt = 1.-smoothstep(r-.07, r+.07, dist); dt *= step(.015, dl);
    return max(dt, smoothstep(.74, .86, dl));
  }
  void main(){
    vec2 px = vec2(uv.x, 1.-uv.y)*uRes, tuv = px/uRes;
    float pt = texture(uPaper, tuv).r, grain = h21(floor(px) + uSeed) - .5;
    vec3 pc = vec3(0.), rc = vec3(0.);
    if (uMix < .999) {
      vec2 w = vec2(vnoise(px/(38.*uK) + uSeed), vnoise(px/(38.*uK) - uSeed + 9.)) - .5;
      pc = texture(uScene, tuv + w*uWarp/uRes).rgb * pt + grain*.03;
    }
    if (uMix > .001) {
      vec2 pb = px + uMis*uK + vec2(-(px.y-uRes.y*.5)*.0016, (px.x-uRes.x*.5)*.0012);
      float ca = halftone(uA, px, .2618, uCell), cb = halftone(uB, pb, 1.309, uCell);
      float sa = .80 + .20*smoothstep(.25,.75, fbm(px/(160.*uK)+3.1)) - .14*step(.82, h21(floor(px/(1.5*uK))+7.));
      float sb = .82 + .18*smoothstep(.25,.75, fbm(px/(140.*uK)+9.7)) - .14*step(.84, h21(floor(px/(1.5*uK))+3.));
      rc = uPaperCol * pt; rc *= mix(vec3(1.), uColA, ca*sa); rc *= mix(vec3(1.), uColB, cb*sb); rc += grain*.035;
    }
    vec3 col = pc;
    if (uMix > .999) col = rc;
    else if (uMix > .001) {   // dots of print grow over the painting
      float cell = uCell*2.2; vec2 q = px/cell, ce = floor(q)+.5; float d = length(q-ce);
      float n = h21(floor(q)*1.7); float r = clamp(uMix*1.6 - n*.6, 0., 1.)*.75;
      float m = 1.-smoothstep(r-.05, r+.05, d); m = max(m, smoothstep(.85, 1., uMix));
      col = mix(pc, rc, m);
    }
    o = vec4(col, 1.);
  }`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function program(fs) { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
  function mkTex() { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); return t; }
  function init(canvas) {
    gl = canvas.getContext('webgl2', { alpha: false, antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) return false;
    prog = program(FS); paperProg = program(PAPER_FS);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (const n of ['scene', 'A', 'B']) tex[n] = mkTex();
    paperTex = mkTex(); fbo = gl.createFramebuffer();
    for (const n of ['uScene', 'uA', 'uB', 'uPaper', 'uRes', 'uSeed', 'uMix', 'uCell', 'uK', 'uWarp', 'uPaperCol', 'uColA', 'uColB', 'uMis']) U[n] = gl.getUniformLocation(prog, n);
    ok = true; return true;
  }
  function resize(w, h, k) {
    W = w; H = h; gl.bindTexture(gl.TEXTURE_2D, paperTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, paperTex, 0);
    gl.viewport(0, 0, w, h); gl.useProgram(paperProg); gl.uniform2f(gl.getUniformLocation(paperProg, 'uRes'), w, h); gl.uniform1f(gl.getUniformLocation(paperProg, 'uK'), k);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  const hex3 = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
  function up(unit, t, src) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); }
  function draw(o) {
    if (o.mix < .999) up(0, tex.scene, o.scene);
    if (o.mix > .001) { up(1, tex.A, o.A); up(2, tex.B, o.B); }
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, paperTex);
    gl.viewport(0, 0, W, H); gl.useProgram(prog);
    gl.uniform1i(U.uScene, 0); gl.uniform1i(U.uA, 1); gl.uniform1i(U.uB, 2); gl.uniform1i(U.uPaper, 3);
    gl.uniform2f(U.uRes, W, H); gl.uniform1f(U.uSeed, (o.boilN % 7) * 17.0); gl.uniform1f(U.uMix, o.mix);
    gl.uniform1f(U.uCell, o.cell); gl.uniform1f(U.uK, o.k); gl.uniform1f(U.uWarp, o.warp);
    gl.uniform3fv(U.uPaperCol, hex3(o.paper)); gl.uniform3fv(U.uColA, hex3(o.colA)); gl.uniform3fv(U.uColB, hex3(o.colB)); gl.uniform2f(U.uMis, o.mis[0], o.mis[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  return { init, resize, draw, get ok() { return ok; } };
})();
