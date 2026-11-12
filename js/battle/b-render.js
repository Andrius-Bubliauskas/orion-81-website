/* (c) 2026 Andrius Bubliauskas. All rights reserved. */
(function () {
'use strict';
var O81B = window.O81B = window.O81B || {};
var gl, ctx, F, core, s, TN, NP, TOT, wd, bt, pr, un, hv, pv, hb, sk, sp, ev, tx, fb, fw, fh, nIn, wk;
var sv, sf, pe, ph, lk, waits;
var tl = new Float32Array(6), cnt, off, cur, pnt, qa = new Float32Array(4), qb = new Float32Array(4), zv = [0, 0, 0, 0, 0];
var SN = 1.2, SW = 3.5, GC = .55, GK = 9, GA = .85, HS = 17, NPR = 7, PI2 = 6.2831853, PP = [0.416, 0.4, 0.376], pc;
var V3 = '#version 300 es\n', PR = 'precision highp float;\n';
var ROT = 'vec3 rot(vec4 q,vec3 v){return v+2.*cross(q.xyz,cross(q.xyz,v)+q.w*v);}\n';

var VBD = V3 + 'void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}';

var VHL = V3 + ROT + 'layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in float aTn;' +
'layout(location=3) in float aGl;layout(location=4) in float aBd;layout(location=5) in vec3 aIP;layout(location=6) in float aIS;' +
'layout(location=7) in vec4 aIQ;layout(location=8) in float aIT;layout(location=9) in float aIA;layout(location=10) in float aII;' +
'uniform mat4 uVP;out vec3 vN;out vec3 vW;out float vTn;out float vGl;out float vBd;flat out float vTe;flat out float vA;flat out float vI;' +
'void main(){vec3 w=aIP+rot(aIQ,aP*aIS);vN=rot(aIQ,aN);vW=w;vTn=aTn*255./128.;vGl=aGl;vBd=aBd;vTe=aIT;vA=aIA;vI=aII;gl_Position=uVP*vec4(w,1.);}';

var FHL = V3 + PR + 'uniform vec3 uEye,uLD,uLC,uLA,uPaint,uGP;uniform vec3 uTm[2];uniform float uMode;' +
'in vec3 vN;in vec3 vW;in float vTn;in float vGl;in float vBd;flat in float vTe;flat in float vA;flat in float vI;out vec4 o;' +
'const float BY[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);' +
'void main(){if(uMode>1.5){float n=vI+1.;o=vec4(n/255.,1.,mod(n*n*37.+n*73.+41.,256.)/255.,1.);return;}' +
'if(vA<1.){ivec2 c=ivec2(gl_FragCoord.xy)&3;if(vA<=(BY[c.y*4+c.x]+.5)/16.)discard;}' +
'vec3 n=normalize(vN);vec3 v=normalize(uEye-vW);vec3 tm=uTm[int(vTe+.5)];float b=step(.5,vBd);' +
'vec3 d=min(vec3(1.),mix(uPaint,tm,b)*vTn);' +
'vec3 c=pow(d,vec3(2.2))*(uLA+uLC*max(0.,dot(n,uLD)));' +
'c+=vec3(pow(1.-abs(dot(n,v)),3.)*.05)+uGP*(vGl*.5)+pow(tm,vec3(2.2))*(.15*b);' +
'c=pow(max(c,0.),vec3(1./2.2));vec3 e=max(c-.45,0.);c=min(c,vec3(.45))+.13*(1.-exp(-e/.13));o=vec4(c,1.);}';

var VMK = V3 + ROT + 'layout(location=0) in vec3 aP;layout(location=5) in vec3 aIP;layout(location=6) in float aIS;layout(location=7) in vec4 aIQ;' +
'layout(location=8) in float aIT;layout(location=9) in float aIA;layout(location=11) in vec4 aIX;layout(location=12) in float aIY;layout(location=13) in float aIV;' +
'uniform mat4 uVP;uniform float uWide;out vec3 vL;flat out vec4 vX;flat out vec3 vD;flat out float vK;flat out float vA;' +
'void main(){vL=aP;vX=aIX;vD=vec3(aIX.zw,aIY);vK=aIT+2.*uWide;vA=aIA*aIV;gl_Position=uVP*vec4(aIP+rot(aIQ,aP*aIS),1.);}';

var FMK = V3 + PR + 'in vec3 vL;flat in vec4 vX;flat in vec3 vD;flat in float vK;flat in float vA;out vec4 o;' +
'void main(){float h=vX.y,d=clamp(dot(normalize(vL),vD),-1.,1.);float fl=h*.5*pow(max(0.,d),6.);' +
'float x=(acos(d)-(1.-h)*1.6)/.12;float rp=h*.35*exp(-x*x);vec4 r=vec4(0.);r[int(vK+.5)]=min(1.,vA*((vK<1.5?.85:.6)*max(vX.x,.2)+vX.x*(fl+rp)));o=r;}';

var FBL = V3 + PR + 'uniform sampler2D uT;uniform vec2 uDir,uStep;uniform float uWt[7];out vec4 o;' +
'void main(){vec2 uv=gl_FragCoord.xy/vec2(textureSize(uT,0));vec4 a=vec4(0.);' +
'for(int i=-6;i<=6;i++){float w=uWt[abs(i)];vec2 k=uDir*float(i);a.rg+=texture(uT,uv+k*uStep.x).rg*w;a.ba+=texture(uT,uv+k*uStep.y).ba*w;}o=a;}';

var FCP = V3 + PR + 'uniform sampler2D uM,uG;uniform vec2 uRes;uniform vec3 uTd[2];uniform vec3 uCap;uniform float uSub;uniform vec4 uCh;out vec4 o;' +
'void main(){vec2 uv=gl_FragCoord.xy/uRes;vec4 m=texture(uM,uv)*uCh,g=texture(uG,uv)*uCh;' +
'float cv=smoothstep(.003,.02,max(max(m.r,m.g),max(m.b,m.a)));vec2 q=vec2(g.r+g.b,g.g+g.a)*(1.-cv*uSub);' +
'q=uCap.x*(1.-exp(-uCap.y*q));vec3 c;if(uSub>.5)c=q.x>=q.y?uTd[0]*q.x:uTd[1]*q.y;else{c=uTd[0]*q.x+uTd[1]*q.y;c*=min(1.,.55/max(max(c.r,c.g),max(c.b,.001)));}' +
'o=vec4(c,uCap.z*max(q.x,q.y)/uCap.x);}';

var VST = V3 + 'layout(location=0) in vec3 aA;layout(location=1) in vec3 aB;layout(location=2) in vec2 aW;layout(location=3) in vec3 aC;' +
'layout(location=4) in vec3 aS;layout(location=5) in float aK;uniform mat4 uVP;uniform vec3 uEye;uniform float uMpp,uD;' +
'out vec2 vU;flat out vec3 vCo;flat out vec3 vSh;' +
'const float AL[6]=float[6](0.,0.,1.,0.,1.,1.);const float AC[6]=float[6](-1.,1.,-1.,1.,1.,-1.);' +
'void main(){int id=gl_VertexID;float al=AL[id],u=AC[id];vec3 p=mix(aA,aB,al);vec3 d=aB-aA;vec3 s=cross(d,uEye-p);float l=length(s);' +
's=l>1e-4?s/l:vec3(1.,0.,0.);float hw=max(aW.x,.7*uMpp*(uD-p.z)/uD);p+=s*(u*hw);' +
'vU=vec2(u,mix(1.,1.-aW.y,al));vCo=aC*aK;vSh=aS*aK;gl_Position=uVP*vec4(p,1.);}';

var FST = V3 + PR + 'in vec2 vU;flat in vec3 vCo;flat in vec3 vSh;out vec4 o;' +
'void main(){float u=vU.x;float a=u/.28,b=u/.8;o=vec4((vCo*exp(-a*a)+vSh*exp(-b*b)*(1.-abs(u)))*vU.y,1.);}';

var VSP = V3 + 'layout(location=0) in vec4 aA;layout(location=1) in vec4 aC;layout(location=2) in vec4 aS;uniform mat4 uVP;uniform float uMpp,uD;' +
'out vec2 vUV;flat out vec3 vCo;flat out vec3 vSh;' +
'const float CX[6]=float[6](-1.,1.,-1.,1.,1.,-1.);const float CY[6]=float[6](-1.,-1.,1.,-1.,1.,1.);' +
'void main(){int id=gl_VertexID;vec2 c=vec2(CX[id],CY[id]);float r=max(aA.w,.001);float h=max(r,.8*uMpp*(uD-aA.z)/uD);' +
'vUV=c*(h/r);vCo=aC.rgb*aC.a;vSh=aS.xyz;gl_Position=uVP*vec4(aA.xy+c*h,aA.z,1.);}';

var FSP = V3 + PR + 'in vec2 vUV;flat in vec3 vCo;flat in vec3 vSh;out vec4 o;' +
'void main(){float d=length(vUV);int k=int(vSh.x+.5);float a=vSh.y,b=vSh.z,g;' +
'if(k==0){g=mix(exp(-3.*d),exp(-25.*d*d),a)*(1.-smoothstep(.7,1.,d));}' +
'else if(k==1){float w=max(b,.01);float x=(d-a)/w;g=exp(-x*x)*(1.-smoothstep(.9,1.,d));}' +
'else if(k==2){g=1.-smoothstep(.75,1.,d);}' +
'else if(k==4){float e=max(0.,1.-d*d);g=e*e;}' +
'else{float l=max(a,.05);vec2 q=abs(vUV);g=exp(-q.y*q.y*400.)*max(0.,1.-q.x/l)+exp(-q.x*q.x*400.)*max(0.,1.-q.y/l)+.6*exp(-30.*d*d);}' +
'o=vec4(vCo*g,1.);}';

function sh(t, src) {
  var x = gl.createShader(t);
  gl.shaderSource(x, src); gl.compileShader(x);
  return x;
}
function startAll() {
  var d = [[VBD, ctx.scenery.backdrop.frag], [VHL, FHL], [VMK, FMK], [VST, FST], [VSP, FSP], [VBD, FBL], [VBD, FCP]], i, p;
  for (i = 0; i < NPR; i++) {
    sv[i] = sh(gl.VERTEX_SHADER, d[i][0]); sf[i] = sh(gl.FRAGMENT_SHADER, d[i][1]);
    p = gl.createProgram();
    gl.attachShader(p, sv[i]); gl.attachShader(p, sf[i]); gl.linkProgram(p);
    pr[i] = p;
  }
  pe = gl.getExtension('KHR_parallel_shader_compile');
}
function linkOne(i) {
  var ok = gl.getProgramParameter(pr[i], gl.LINK_STATUS);
  if (ok) { gl.deleteShader(sv[i]); gl.deleteShader(sf[i]); return true; }
  gl.getShaderParameter(sv[i], gl.COMPILE_STATUS); gl.getShaderParameter(sf[i], gl.COMPILE_STATUS);
  return false;
}
function linkStep() {
  var i, all = true;
  if (pe && ph === 1) {
    for (i = 0; i < NPR; i++) if (!gl.getProgramParameter(pr[i], pe.COMPLETION_STATUS_KHR)) all = false;
    if (!all && waits < 2000) { waits++; return 2; }
  }
  if (!linkOne(lk++)) return -1;
  if (lk >= NPR) ph = 2;
  return 0;
}
function locs(p, names) {
  var o = {}, a = names.split(' '), i;
  for (i = 0; i < a.length; i++) o[a[i]] = gl.getUniformLocation(p, a[i]);
  return o;
}
function ab(loc, data, size, type, norm) {
  var b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, type, norm, 0, 0);
}
function ia(loc, size, stride, o) {
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, o);
  gl.vertexAttribDivisor(loc, 1);
}
function ib(bytes) {
  var b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, bytes, gl.DYNAMIC_DRAW);
  return b;
}
function hullVAO(m, cap) {
  var v = gl.createVertexArray(), b;
  gl.bindVertexArray(v);
  ab(0, m.pos, 3, gl.FLOAT, false); ab(1, m.nrm, 3, gl.FLOAT, false);
  ab(2, m.tone, 1, gl.UNSIGNED_BYTE, true); ab(3, m.glow, 1, gl.UNSIGNED_BYTE, true); ab(4, m.band, 1, gl.UNSIGNED_BYTE, true);
  b = ib(cap * HS * 4);
  ia(5, 3, 68, 0); ia(6, 1, 68, 12); ia(7, 4, 68, 16); ia(8, 1, 68, 32); ia(9, 1, 68, 36); ia(10, 1, 68, 40); ia(11, 4, 68, 44); ia(12, 1, 68, 60); ia(13, 1, 68, 64);
  gl.bindVertexArray(null);
  return { v: v, b: b, n: m.n };
}
function step() {
  var i, p, m, n, d;
  if (ph === 0) { startAll(); ph = 1; return 0; }
  if (ph === 1) return linkStep();
  i = s++;
  if (i < NPR) {
    d = i === 0 ? 'uRes uPx uMpp uCamY uT uTheme uQ' :
      i === 1 ? 'uVP uEye uLD uLC uLA uPaint uGP uTm uMode' :
      i === 2 ? 'uVP uWide' : i === 5 ? 'uT uDir uStep uWt' : i === 6 ? 'uM uG uRes uTd uCap uSub uCh' :
      i === 3 ? 'uVP uEye uMpp uD' : 'uVP uMpp uD';
    un[i] = locs(pr[i], d);
    return 0;
  }
  i -= NPR;
  if (i < TN) {
    m = ctx.ships.build(i);
    if (!m || !m.n) return -1;
    hv[i] = hullVAO(m, 100);
    p = ctx.ships.types[i].paint;
    for (n = 0; n < 3; n++) bt[i * 3 + n] = p[n];
    wd[i] = ctx.ships.types[i].cls === 'S' ? 0 : 1;
    return 0;
  }
  i -= TN;
  if (i < NP) {
    m = ctx.scenery.props[i].build();
    pv[i] = m && m.n ? hullVAO(m, 300) : null;
    p = ctx.scenery.props[i].paint || (m && m.paint) || PP;
    for (n = 0; n < 3; n++) pc[i * 3 + n] = p[n];
    return 0;
  }
  i -= NP;
  if (i > 0) { glowOne(i - 1); return 0; }
  sk = { v: gl.createVertexArray(), b: 0 };
  gl.bindVertexArray(sk.v); sk.b = ib(4096 * 64);
  ia(0, 3, 64, 0); ia(1, 3, 64, 12); ia(2, 2, 64, 24); ia(3, 3, 64, 32); ia(4, 3, 64, 44); ia(5, 1, 64, 56);
  sp = { v: gl.createVertexArray(), b: 0 };
  gl.bindVertexArray(sp.v); sp.b = ib(4096 * 48);
  ia(0, 4, 48, 0); ia(1, 4, 48, 16); ia(2, 4, 48, 32);
  ev = gl.createVertexArray();
  gl.bindVertexArray(null);
  return 0;
}

function hullUni() {
  var u = un[1], l = F.light;
  gl.useProgram(pr[1]);
  gl.uniformMatrix4fv(u.uVP, false, F.vp); gl.uniform3fv(u.uEye, F.eye);
  gl.uniform3fv(u.uLD, l.dir); gl.uniform3fv(u.uLC, l.color); gl.uniform3fv(u.uLA, l.ambient);
  gl.uniform3fv(u.uTm, tl); gl.uniform1f(u.uMode, F.mode === 2 ? 2 : 0);
  return u;
}
function drawProps() {
  var f = F, h = f.cssH * f.mpp / 2, y0 = f.bgY - h - 1200, y1 = f.bgY + h + 1200, k, j, i, n, zs = ctx.scenery.zones, it, o, a, q, u, cy, pp, l, w = pnt;
  for (k = 0; k < 5; k++) { cy = -900 * k; zv[k] = cy >= y0 && cy <= y1; }
  u = hullUni();
  for (i = 0; i < pv.length; i++) {
    if (!pv[i]) continue;
    n = 0;
    for (k = 0; k < 5; k++) {
      if (!zv[k]) continue;
      it = zs[k].near;
      for (j = 0; j < it.length && n < 300; j++) {
        o = it[j];
        if (o.prop !== i || (f.tier === 0 && o.p[2] >= 500)) continue;
        a = o.axis; l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1;
        core.qaxis(a[0] / l, a[1] / l, a[2] / l, PI2 * o.turns * f.t / 60, qa, 0);
        core.qmul(qa, 0, o.q, 0, qb, 0);
        q = n * HS; pp = o.p;
        w[q] = pp[0]; w[q + 1] = pp[1] - 900 * k; w[q + 2] = pp[2]; w[q + 3] = o.s;
        w[q + 4] = qb[0]; w[q + 5] = qb[1]; w[q + 6] = qb[2]; w[q + 7] = qb[3];
        w[q + 8] = 0; w[q + 9] = 1; w[q + 10] = 0;
        n++;
      }
    }
    if (!n) continue;
    gl.uniform3f(u.uPaint, pc[i * 3], pc[i * 3 + 1], pc[i * 3 + 2]);
    gl.uniform3f(u.uGP, Math.pow(pc[i * 3], 2.2), Math.pow(pc[i * 3 + 1], 2.2), Math.pow(pc[i * 3 + 2], 2.2));
    gl.bindBuffer(gl.ARRAY_BUFFER, pv[i].b); gl.bufferSubData(gl.ARRAY_BUFFER, 0, w, 0, n * HS);
    gl.bindVertexArray(pv[i].v); gl.drawArraysInstanced(gl.TRIANGLES, 0, pv[i].n, n);
    R.draws++; R.tris += n * pv[i].n / 3;
  }
}
function fillShips() {
  var f = F, i, t, n = f.n, w = hb.w, q, c, P = f.P, Q = f.Q, on = f.on, V = f.V, H = f.HD;
  for (t = 0; t < TN; t++) cnt[t] = 0;
  for (i = 0; i < n; i++) if (on[i] && V[i] > 0) cnt[f.ty[i]]++;
  for (t = 0, c = 0; t < TN; t++) { off[t] = c; cur[t] = c; c += cnt[t]; }
  nIn = c;
  for (i = 0; i < n; i++) {
    if (!on[i] || !(V[i] > 0)) continue;
    t = f.ty[i]; q = cur[t]++ * HS;
    w[q] = P[i * 3]; w[q + 1] = P[i * 3 + 1]; w[q + 2] = P[i * 3 + 2]; w[q + 3] = f.DS[i];
    w[q + 4] = Q[i * 4]; w[q + 5] = Q[i * 4 + 1]; w[q + 6] = Q[i * 4 + 2]; w[q + 7] = Q[i * 4 + 3];
    w[q + 8] = f.tm[i]; w[q + 9] = f.AL[i]; w[q + 10] = i;
    w[q + 11] = f.SH[i]; w[q + 12] = f.HT[i]; w[q + 13] = H[i * 3]; w[q + 14] = H[i * 3 + 1]; w[q + 15] = H[i * 3 + 2]; w[q + 16] = V[i];
  }
  for (t = 0; t < TN; t++) if (cnt[t]) {
    gl.bindBuffer(gl.ARRAY_BUFFER, hv[t].b); gl.bufferSubData(gl.ARRAY_BUFFER, 0, w, off[t] * HS, cnt[t] * HS);
  }
}
function drawShips(wide) {
  var t, u = hullUni();
  gl.uniform3f(u.uGP, 1, .75, .45);
  for (t = 0; t < TN; t++) {
    if (!cnt[t] || wd[t] !== wide) continue;
    gl.uniform3f(u.uPaint, bt[t * 3], bt[t * 3 + 1], bt[t * 3 + 2]);
    gl.bindVertexArray(hv[t].v); gl.drawArraysInstanced(gl.TRIANGLES, 0, hv[t].n, cnt[t]);
    R.draws++; R.tris += cnt[t] * hv[t].n / 3;
  }
}
function mkTex(w, h) {
  var t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, w, h);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}
function sizeGlow() {
  var w = (F.cw + 1) >> 1, h = (F.ch + 1) >> 1, i, f;
  if (tx[0] && w === fw && h === fh) return;
  for (i = 0; i < 3; i++) { if (tx[i]) { gl.deleteTexture(tx[i]); gl.deleteFramebuffer(fb[i]); } }
  fw = w; fh = h;
  for (i = 0; i < 3; i++) {
    tx[i] = mkTex(w, h); f = fb[i] = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx[i], 0);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
}
function glowOne(k) {
  var f;
  if (!k) { fw = (gl.drawingBufferWidth + 1) >> 1; fh = (gl.drawingBufferHeight + 1) >> 1; }
  tx[k] = mkTex(fw, fh); f = fb[k] = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx[k], 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindTexture(gl.TEXTURE_2D, null);
}
function drawMask() {
  var f = F, t, u = un[2];
  sizeGlow();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb[0]); gl.viewport(0, 0, fw, fh);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendEquation(gl.MAX); gl.blendFunc(gl.ONE, gl.ONE);
  gl.useProgram(pr[2]); gl.uniformMatrix4fv(u.uVP, false, f.vp);
  for (t = 0; t < TN; t++) {
    if (!cnt[t]) continue;
    gl.uniform1f(u.uWide, wd[t]);
    gl.bindVertexArray(hv[t].v); gl.drawArraysInstanced(gl.TRIANGLES, 0, hv[t].n, cnt[t]);
    R.draws++; R.tris += cnt[t] * hv[t].n / 3;
  }
  gl.blendEquation(gl.FUNC_ADD); gl.disable(gl.BLEND);
  u = un[5]; gl.useProgram(pr[5]); gl.bindVertexArray(ev);
  gl.uniform1fv(u.uWt, wk); gl.uniform2f(u.uStep, SN * f.px / 2.2, SW * f.px / 2.2); gl.uniform1i(u.uT, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb[1]); gl.bindTexture(gl.TEXTURE_2D, tx[0]);
  gl.uniform2f(u.uDir, 1 / fw, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb[2]); gl.bindTexture(gl.TEXTURE_2D, tx[1]);
  gl.uniform2f(u.uDir, 0, 1 / fh); gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, f.cw, f.ch);
  R.draws += 2; R.tris += 2;
}
function compose(c0, c1, c2, c3) {
  var f = F, u = un[6], m1 = f.mode === 1;
  gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.useProgram(pr[6]);
  gl.uniform1i(u.uM, 0); gl.uniform1i(u.uG, 1); gl.uniform2f(u.uRes, f.cw, f.ch); gl.uniform3fv(u.uTd, f.team);
  gl.uniform3f(u.uCap, m1 ? 1 : GC, GK, m1 ? 0 : GA); gl.uniform1f(u.uSub, m1 ? 1 : 0); gl.uniform4f(u.uCh, c0, c1, c2, c3);
  gl.bindVertexArray(ev); gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tx[0]); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tx[2]);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  R.draws++; R.tris++;
  gl.bindTexture(gl.TEXTURE_2D, null); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null);
  gl.disable(gl.BLEND); gl.depthMask(true); gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
}
function drawFx(fx) {
  var f = F, u, n;
  gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
  n = Math.min(fx.nl | 0, 4096);
  if (n > 0) {
    u = un[3]; gl.useProgram(pr[3]);
    gl.uniformMatrix4fv(u.uVP, false, f.vp); gl.uniform3fv(u.uEye, f.eye); gl.uniform1f(u.uMpp, f.mpp); gl.uniform1f(u.uD, f.D);
    gl.bindBuffer(gl.ARRAY_BUFFER, sk.b); gl.bufferSubData(gl.ARRAY_BUFFER, 0, fx.L, 0, n * 16);
    gl.bindVertexArray(sk.v); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, n);
    R.draws++; R.tris += n * 2;
  }
  n = Math.min(fx.ns | 0, 4096);
  if (n > 0) {
    u = un[4]; gl.useProgram(pr[4]);
    gl.uniformMatrix4fv(u.uVP, false, f.vp); gl.uniform1f(u.uMpp, f.mpp); gl.uniform1f(u.uD, f.D);
    gl.bindBuffer(gl.ARRAY_BUFFER, sp.b); gl.bufferSubData(gl.ARRAY_BUFFER, 0, fx.S, 0, n * 12);
    gl.bindVertexArray(sp.v); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, n);
    R.draws++; R.tris += n * 2;
  }
}

var R = O81B.render = {
  draws: 0, tris: 0,
  init: function (g, c) {
    var i, t;
    gl = g; ctx = c; F = c.F; core = O81B.core; s = 0;
    TN = c.ships.types.length; NP = c.scenery.props.length; TOT = NPR + TN + NP + 4;
    pr = []; un = []; sv = []; sf = []; pe = null; ph = 0; lk = 0; waits = 0; hv = []; pv = []; sk = sp = ev = null; tx = []; fb = []; fw = fh = nIn = 0;
    wk = new Float32Array(7); for (i = 0, t = 0; i < 7; i++) { wk[i] = Math.exp(-i * i / 9.68); t += i ? 2 * wk[i] : wk[0]; }
    for (i = 0; i < 7; i++) wk[i] /= t;
    bt = new Float32Array(TN * 3); wd = new Float32Array(TN);
    cnt = new Int32Array(TN); off = new Int32Array(TN); cur = new Int32Array(TN);
    hb = { w: new Float32Array(100 * HS) };
    pnt = new Float32Array(300 * HS); pc = new Float32Array(NP * 3);
    R.draws = 0; R.tris = 0;
  },
  prep: function () {
    var r;
    try { r = step(); } catch (e) { return -1; }
    if (r < 0) return -1;
    if (r === 2) return 2;
    return s >= TOT ? 1 : 0;
  },
  frame: function (f, fx) {
    var m = f.mode, u, i;
    F = f; R.draws = 0; R.tris = 0;
    gl.viewport(0, 0, f.cw, f.ch);
    gl.disable(gl.BLEND); gl.disable(gl.DITHER); gl.depthMask(true); gl.disable(gl.CULL_FACE);
    for (i = 0; i < 6; i++) tl[i] = f.team[i];
    if (m === 0 || m === 3) {
      gl.disable(gl.DEPTH_TEST);
      u = un[0]; gl.useProgram(pr[0]);
      gl.uniform2f(u.uRes, f.cw, f.ch); gl.uniform1f(u.uPx, f.px); gl.uniform1f(u.uMpp, f.mpp);
      gl.uniform1f(u.uCamY, f.bgY); gl.uniform1f(u.uT, f.t); gl.uniform1f(u.uTheme, 0); gl.uniform1f(u.uQ, f.tier);
      gl.bindVertexArray(ev); gl.drawArrays(gl.TRIANGLES, 0, 3);
      R.draws = 1; R.tris = 1;
      gl.clear(gl.DEPTH_BUFFER_BIT);
    } else {
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    if (m === 0 || m === 3) drawProps();
    if (m < 3) {
      fillShips();
      if (m === 2) { drawShips(1); drawShips(0); }
      else if (nIn) {
        drawMask();
        if (m === 1) compose(1, 1, 1, 1);
        else { compose(0, 0, 1, 1); drawShips(1); compose(1, 1, 0, 0); drawShips(0); }
      } else if (m === 0) { drawShips(1); drawShips(0); }
    }
    if (m === 0 && fx) drawFx(fx);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND); gl.depthMask(true);
  },
  read: function (u8) {
    gl.readPixels(0, 0, F.cw, F.ch, gl.RGBA, gl.UNSIGNED_BYTE, u8);
  }
};
})();
