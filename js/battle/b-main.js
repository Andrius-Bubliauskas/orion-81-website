/* (c) 2026 Andrius Bubliauskas. All rights reserved. */
(function () {
 'use strict';
 window.O81B = window.O81B || {};
 var O = window.O81B, C, W = window, D = document, H = D.documentElement, M = Math,
 cv, gl, F, tgl, A, sc, rd, cl, buf, bufN = 0, raf = 0, prepped = 0, starting = 0, dead = 0, lost = 0, hid = 0,
 light = 0, reduced = 0, mq, paused = 0, mv = 0, ph = 0, tier = 1, auto = 1, res = 1, rate = 60,
 mode = 0, camY = -4000, camSet = null, tcur = 0, base = 0, t0 = 0, lc = 0, due = 0,
 wS = 0, wN = 0, fps = 0, jn = 0, rt = 0, pw = 0, pi = 0, docH = -1, sOk = 0, S = [0, 0, 0, 0, 0],
 ids = 'top stats chart cards doors'.split(' '), cS = 0, cN = 0, cL = 0, cM = 1e9,
 hl = 0, js = new Float64Array(120), jt = new Float64Array(120), hs = new Float64Array(120), rc = new Float64Array(120),
 ou = { p: [0, 0, 0], q: [0, 0, 0, 1], vis: 0, sh: 0, hit: 0, hd: [1, 0, 0], thr: 0 };
 function tm() { return { S: 0, M: 0, L: 0, present: 0, total: 0 }; }
 function now() { return performance.now(); }
 function z(n) { return new Float32Array(n); }
 function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
 function vis(on) {
 H.classList.toggle('o81-battle-on', !!on);
 H.classList.toggle('o81-battle-run', !!on && !reduced && !hl);
 }
 function fail() { dead = 1; stop(); A.ready = false; vis(0); }
 function pr() { if (tgl) tgl.setAttribute('aria-pressed', paused ? 'true' : 'false'); }
 function halt(n) {
 var k = 0, i, m = M.min(jn, 120);
 for (i = 0; i < m; i++) if (n - jt[i] <= 2000) hs[k++] = js[i];
 if (k < 8) return;
 hs.subarray(0, k).sort();
 if (hs[k * 0.95 | 0] > 50) frz();
 }
 function frz() { hl = 1; paused = 1; stop(); vis(1); pr(); }
 function run() { return A.ready && !light && !hid && !lost && !dead; }
 function secs() {
 var h = H.scrollHeight, m = M.max(0, h - W.innerHeight), g = m >= 200, p = -1e9, sy = W.scrollY || 0, i, e, r, s;
 for (i = 0; i < 5; i++) {
 e = D.getElementById(ids[i]);
 if (!e) { g = false; break; }
 r = e.getBoundingClientRect();
 s = C.clamp(r.top + sy + r.height / 2 - W.innerHeight / 2, 0, m);
 if (s < p + 1) s = p + 1;
 S[i] = p = s;
 }
 sOk = g; docH = h;
 }
 function tgt(y) {
 var i;
 if (!sOk) return -4000;
 y = C.clamp(y, S[0], S[4]);
 for (i = 1; i < 4 && y > S[i]; i++);
 return -2000 * (i - 1) - 2000 * (y - S[i - 1]) / (S[i] - S[i - 1]);
 }
 function size() {
 var r = cv.getBoundingClientRect(), w = r.width, h = r.height, d, cw, ch;
 if (w < 1 || h < 1) return 0;
 d = M.min(W.devicePixelRatio || 1, tier ? 2 : 1.5) * res;
 if (w * h * d * d > 2100000) d = M.sqrt(2100000 / (w * h));
 cw = M.floor(w * d); ch = M.floor(h * d);
 if (cw !== F.cw || ch !== F.ch) { cv.width = cw; cv.height = ch; gl.viewport(0, 0, cw, ch); }
 F.cw = cw; F.ch = ch; F.cssW = w; F.cssH = h; F.px = cw / w; rt = r.top;
 return 1;
 }
 function cam(dt) {
 var iw = W.innerWidth, ih = W.innerHeight, mp, dd, tg;
 if (H.scrollHeight !== docH || iw !== pw || ih !== pi) { secs(); pw = iw; pi = ih; }
 tg = sOk ? tgt(reduced ? 0 : (W.scrollY || 0)) : -4000;
 if (camSet !== null) camY = camSet;
 else camY += (tg - camY) * (1 - M.exp(-(reduced ? 1e3 : dt) / 0.15));
 mv = camSet === null && !reduced && M.abs(tg - camY) > 0.3;
 mp = iw < 900 ? M.min(3.3, 1.9 * M.pow(900 / iw, 0.6)) : iw <= 2736 ? 1.9 : 5200 / iw;
 dd = F.cssH * mp / (2 * M.tan(M.PI / 12));
 F.yc = ih / 2 - rt;
 C.proj(F.vp, F.cssW * mp, F.cssH * mp, dd, F.yc, F.cssH, camY);
 F.eye[1] = camY; F.eye[2] = dd;
 F.camY = camY; F.mpp = mp; F.D = dd; F.bgY = camY + (F.yc - F.cssH / 2) * mp;
 F.zk = C.zw(F.zw, camY);
 C.lblend(F.light, F.zw, O.scenery.zones);
 }
 function ships(t) {
 var ch = O.choreo, i, v, p, s, R, y1 = camY + F.yc * F.mpp, y0 = camY - (F.cssH - F.yc) * F.mpp,
 hw = F.cssW * F.mpp * 0.575, pad = (y1 - y0) * 0.075, x, y;
 for (i = 0; i < F.n; i++) {
 ch.state(i, t, ou);
 p = ou.p; v = ou.vis; x = p[0]; y = p[1];
 F.P.set(p, 3 * i); F.HD.set(ou.hd, 3 * i); F.Q.set(ou.q, 4 * i);
 F.V[i] = v; F.SH[i] = ou.sh; F.HT[i] = ou.hit; F.TH[i] = ou.thr;
 s = sc[i]; F.AL[i] = v; F.DS[i] = s; R = rd[i] * s;
 F.on[i] = v > 0 && M.abs(x) < hw + R && y > y0 - pad - R && y < y1 + pad + R ? 1 : 0;
 }
 }
 function draw(t, dt) {
 if (!size()) return;
 F.tier = tier; F.mode = mode; F.t = t;
 cam(dt);
 ships(t);
 O.fx.build(F);
 O.render.frame(F, O.fx);
 }
 function frame(n) {
 var s = now(), dt = M.min(0.25, (n - lc) / 1000), m, p, q;
 lc = n;
 if (!paused) tcur = C.wrap(base + (n - t0) / 1000);
 draw(tcur, dt);
 js[jn % 120] = now() - s; jt[jn % 120] = n; jn++;
 if (paused) return;
 wN++;
 if (n - wS < 1000) return;
 m = (n - wS) / wN; fps = wN; wS = n; wN = 0;
 p = cN ? cS / cN : 16.7; cS = 0; cN = 0;
 if (!auto) return;
 if (tier) { if (p > 25) { tier = 0; rate = 30; } }
 else {
 q = cM < 1e9 ? cM : p; q = M.ceil((1000 / rate - 2) / q) * q;
 if (m > 1.3 * q) {
 if (res > 0.5) { p = M.max(0.5, res * M.sqrt(q / m)); if (p === 0.5 || M.abs(p - res) >= 0.1 * res) res = p; }
 else rate = rate > 20 ? 20 : 15;
 }
 if (res <= 0.5 && rate <= 15) halt(n);
 }
 }
 function tick() {
 var n;
 raf = 0;
 if (!run()) return;
 n = now();
 if (cL) { cS += n - cL; cN++; if (n - cL < cM) cM = n - cL; }
 cL = n;
 if (n < due - 2) { raf = requestAnimationFrame(tick); return; }
 due = M.max(due + 1000 / rate, n - 1000 / rate);
 try { frame(n); } catch (e) { fail(); return; }
 if (!hl && (!paused || mv)) raf = requestAnimationFrame(tick);
 }
 function kick() {
 if (raf || hl || !run()) return;
 if (paused) lc = now();
 raf = requestAnimationFrame(tick);
 }
 function resume() {
 var n = now();
 lc = n; wS = n; wN = 0; due = n; cL = 0; cM = 1e9; cS = 0; cN = 0;
 if (!paused) { base = tcur; t0 = n; }
 kick();
 }
 function redraw() {
 if (!run()) return;
 if (paused) A.seek(tcur); else kick();
 }
 function go() {
 try {
 lc = now();
 if (!hid && size()) draw(tcur, 1e3);
 A.ready = true;
 vis(1);
 if (W.getComputedStyle(cv).visibility === 'hidden') { fail(); return; }
 pr();
 if (!reduced) resume();
 } catch (e) { fail(); }
 }
 function slice() {
 var s = now(), r, t, mx = 0;
 if (dead || lost) return;
 try {
 while (now() - s + mx <= 12) {
 t = now();
 r = ph ? O.fx.prep() : O.render.prep();
 if (now() - t > mx) mx = now() - t;
 if (r < 0) { fail(); return; }
 if (r === 1 && ++ph > 1) { ph = 2; break; }
 if (r === 2) break;
 }
 } catch (e) { fail(); return; }
 if (ph < 2) { setTimeout(slice, 0); return; }
 starting = 0; prepped = 1;
 if (!light) go();
 }
 function build() {
 var R = O.choreo.roster, T = O.ships.types, n = R.length, i, g;
 F = {
 vp: z(16), eye: z(3), light: { dir: z(3), color: z(3), ambient: z(3) }, zw: z(5), team: z(6), n: n,
 ty: new Int16Array(n), tm: new Uint8Array(n), P: z(3 * n), Q: z(4 * n), V: z(n), SH: z(n),
 HT: z(n), HD: z(3 * n), TH: z(n), DS: z(n), AL: z(n), on: new Uint8Array(n)
 };
 sc = z(n); rd = z(n); cl = [];
 for (i = 0; i < n; i++) {
 g = O.ships.index[R[i].type];
 F.ty[i] = g; F.tm[i] = R[i].team; sc[i] = T[g].scale; rd[i] = 0.6 * T[g].len; cl.push(R[i].cls);
 }
 g = getComputedStyle(H);
 for (i = 0; i < 6; i++) F.team[i] = (C.hex(g.getPropertyValue('--b-team-' + (i / 3 | 0))) || C.hex(i < 3 ? '#f2b84b' : '#5aa2ff'))[i % 3];
 }
 function eng() {
 O.render.init(gl, { ships: O.ships, scenery: O.scenery, F: F });
 O.fx.init({ ships: O.ships, choreo: O.choreo, F: F });
 ph = 0; size(); slice();
 }
 function mk() {
 cv = D.getElementById('o81-battle');
 if (!cv) {
 cv = D.createElement('canvas'); cv.id = 'o81-battle';
 D.body.insertBefore(cv, D.body.firstChild);
 }
 cv.setAttribute('aria-hidden', 'true');
 cv.addEventListener('webglcontextlost', function (e) {
 e.preventDefault(); lost = 1; A.ready = false; prepped = 0; starting = 0; stop(); vis(0);
 });
 cv.addEventListener('webglcontextrestored', function () {
 try {
 lost = 0; starting = 1; if (!F) build();
 eng();
 } catch (e) { fail(); }
 });
 }
 function rest() {
 if (dead || lost || light) { starting = 0; return; }
 try { build(); eng(); } catch (e) { fail(); }
 }
 function begin() {
 if (starting || dead || prepped) return;
 starting = 1;
 try {
 mk();
 gl = cv.getContext('webgl2', { alpha: false, antialias: true, depth: true, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
 if (!gl) { fail(); return; }
 setTimeout(rest, 0);
 } catch (e) { fail(); }
 }
 function start() {
 if (dead || lost) return;
 if (prepped) go(); else begin();
 }
 function theme() {
 var l = H.dataset.theme === 'light';
 if (l === light) return;
 light = l;
 if (l) { stop(); vis(0); } else start();
 }
 function tog() { A[paused ? 'play' : 'pause'](); }
 function init() {
 try {
 C = O.core;
 light = H.dataset.theme === 'light';
 mq = W.matchMedia('(prefers-reduced-motion: reduce)');
 reduced = mq.matches;
 if (reduced) { paused = 1; tcur = 12; }
 mq.addEventListener('change', function () {
 if (!mq.matches || reduced) return;
 reduced = 1; frz();
 if (run()) A.seek(tcur);
 });
 tier = W.matchMedia('(pointer: coarse)').matches || W.innerWidth < 700 ? 0 : 1;
 rate = tier ? 60 : 30;
 tgl = D.getElementById('o81-battle-toggle');
 if (tgl) {
 pr();
 tgl.addEventListener('click', tog);
 }
 new MutationObserver(theme).observe(H, { attributes: true, attributeFilter: ['data-theme'] });
 W.addEventListener('resize', function () { if (hl) A.seek(tcur); else kick(); });
 W.addEventListener('scroll', function () { if (!reduced) kick(); }, { passive: true });
 D.addEventListener('visibilitychange', function () {
 hid = D.hidden;
 if (hid) stop(); else if (A.ready) resume();
 });
 hid = D.hidden;
 if (!light) start();
 } catch (e) { fail(); }
 }
 function boot() {
 if (W.__o81b) return;
 W.__o81b = A;
 function idle() { if (W.requestIdleCallback) W.requestIdleCallback(init, { timeout: 1500 }); else setTimeout(init, 1); }
 if (D.readyState === 'complete') idle(); else W.addEventListener('load', idle);
 }
 A = {
 ready: false,
 seek: function (t) { if (!run()) return; paused = 1; tcur = C.wrap(t); pr(); try { draw(tcur, 0); } catch (e) { fail(); } },
 play: function () { if (!run() || !paused || reduced || hl) return; paused = 0; pr(); resume(); },
 pause: function () { paused = 1; pr(); },
 time: function () { return tcur; },
 setCam: function (y) { camSet = y == null ? null : +y; if (camSet !== null) camY = camSet; redraw(); },
 tier: function () { return tier; },
 setTier: function (n) { tier = n ? 1 : 0; auto = 0; res = 1; rate = n ? 60 : 30; redraw(); },
 mode: function (s) { mode = s === 'shields' ? 1 : s === 'ids' ? 2 : s === 'floor' ? 3 : 0; redraw(); },
 counts: function () {
 var T = [tm(), tm()], i, o;
 if (F) for (i = 0; i < F.n; i++) {
 o = T[F.tm[i]]; o.total++;
 if (F.V[i] > 0) { o.present++; o[cl[i]]++; }
 }
 return { t: F && F.t || 0, teams: T };
 },
 inView: function () {
 var r = [], i, x, y, w, nx, ny, e, q, V, rr;
 if (!run() || !F.cw) return r;
 V = F.vp; e = cv.getBoundingClientRect();
 for (i = 0; i < F.n; i++) {
 if (!(F.V[i] > 0)) continue;
 x = F.P[3 * i]; y = F.P[3 * i + 1]; q = F.P[3 * i + 2];
 w = V[11] * q + V[15];
 nx = V[0] * x / w; ny = (V[5] * y + V[9] * q + V[13]) / w;
 rr = rd[i] / 1.2 * F.DS[i] * V[5] * 0.5 * F.cssH / w;
 if (M.abs(nx) >= 1 + rr * 2 / F.cssW || M.abs(ny) >= 1 + rr * 2 / F.cssH) continue;
 r.push({
 i: i, team: F.tm[i], type: O.choreo.roster[i].type, cls: cl[i],
 x: e.left + (nx * 0.5 + 0.5) * F.cssW, y: e.top + (0.5 - ny * 0.5) * F.cssH,
 r: rr
 });
 }
 return r;
 },
 zone: function () { return { k: F && F.zk || 0, w: F ? Array.prototype.slice.call(F.zw) : [1, 0, 0, 0, 0] }; },
 hash: function () {
 var n;
 if (!run()) return '';
 try {
 draw(tcur, 0); n = F.cw * F.ch * 4;
 if (!buf || bufN !== n) { buf = new Uint8Array(n); bufN = n; }
 O.render.read(buf);
 return C.fnv(buf, n);
 } catch (e) { return ''; }
 },
 stats: function () {
 var m = M.min(jn, 120), a;
 rc.set(js.subarray(0, m)); a = rc.subarray(0, m); a.sort();
 return {
 fps: fps, jsMs: { median: m ? a[m >> 1] : 0, p95: m ? a[m * 0.95 | 0] : 0 },
 draws: O.render.draws, tris: O.render.tris, pixels: F && F.cw ? F.cw * F.ch : 0, tier: tier
 };
 }
 };
 window.O81B.main = { boot: boot };
 boot();
})();
