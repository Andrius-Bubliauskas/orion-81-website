/* (c) 2026 Andrius Bubliauskas. All rights reserved. */
(function () {
'use strict';
window.O81B = window.O81B || {};
var NL = 4096, NS = 4096;
var core, ch, sh, L, S, nl = 0, ns = 0, gl = [], so, N = 0, NB = 0, SC, SG, BC, step = 0, ready = 0;
var WC = [], WB = [], WS = [], WE = [], ap = new Float32Array(6);
var RM = [], tv = new Float32Array(3), tw = new Float32Array(3), t2 = new Float32Array(3), bv = new Float32Array(3);
var MP = 1.9, hc = new Float32Array(3), DX = new Float32Array([-1, 0, 0]), TC = null;
var fx = { L: null, S: null, nl: 0, ns: 0, init: init, prep: prep, build: build };

function pL(a, b, c, d, e, f, w, tl, cr, cg, cb, sr, sg, sb, k) {
  if (nl >= NL || k <= 0.002) return;
  var o = nl * 16;
  L[o] = a; L[o + 1] = b; L[o + 2] = c; L[o + 3] = d; L[o + 4] = e; L[o + 5] = f; L[o + 6] = w; L[o + 7] = tl;
  L[o + 8] = cr; L[o + 9] = cg; L[o + 10] = cb; L[o + 11] = sr; L[o + 12] = sg; L[o + 13] = sb; L[o + 14] = k; L[o + 15] = 0;
  nl++;
}
function pS(x, y, z, r, cr, cg, cb, k, sp, a, b) {
  if (ns >= NS || k <= 0.002) return;
  var o = ns * 12;
  S[o] = x; S[o + 1] = y; S[o + 2] = z; S[o + 3] = r; S[o + 4] = cr; S[o + 5] = cg; S[o + 6] = cb; S[o + 7] = k;
  S[o + 8] = sp; S[o + 9] = a; S[o + 10] = b; S[o + 11] = 0;
  ns++;
}
function lp(a, b, f) { return a + (b - a) * f; }
function tyOf(i) { return sh.index[ch.roster[i].type] | 0; }

function init(c) {
  core = O81B.core; ch = c.choreo; sh = c.ships;
  L = fx.L = new Float32Array(NL * 16); S = fx.S = new Float32Array(NS * 12);
  nl = ns = fx.nl = fx.ns = 0;
  so = { p: [0, 0, 0], q: [0, 0, 0, 1], vis: 0, sh: 0, hit: 0, hd: [0, 0, 0], thr: 0 };
  var i, j, g, l, ty;
  gl = [];
  for (i = 0; i < sh.types.length; i++) {
    g = sh.types[i].guns || []; l = [[], [], [], []];
    for (j = 0; j < g.length; j++) if (l[g[j].kind]) l[g[j].kind].push(g[j]);
    gl.push(l);
    g = sh.types[i].engines || []; RM[i] = 0;
    for (j = 0; j < g.length; j++) if (g[j].r > RM[i]) RM[i] = g[j].r;
  }
  N = ch.shots.length; NB = ch.booms.length; RM.length = sh.types.length;
  SC = new Float32Array(N * 14 + 1); SG = new Float32Array(N + 1); BC = new Float32Array(NB * 14 + 1);
  step = 0; ready = 0; WC.length = WB.length = WS.length = WE.length = 0;
}

// world gun position of ship i, kind k, number gun, at time t
function gp(i, k, gun, t, o, oo) {
  ch.state(i, t, so);
  var ti = tyOf(i), ty = sh.types[ti], l = gl[ti][k], s = ty.scale, g;
  g = l[gun % l.length];
  tv[0] = g.p[0] * s; tv[1] = g.p[1] * s; tv[2] = g.p[2] * s;
  core.qrot(so.q, 0, tv, 0, tw, 0);
  o[oo] = so.p[0] + tw[0]; o[oo + 1] = so.p[1] + tw[1]; o[oo + 2] = so.p[2] + tw[2];
}
function tp(i, t, o, oo) {
  ch.state(i, t, so);
  o[oo] = so.p[0]; o[oo + 1] = so.p[1]; o[oo + 2] = so.p[2];
}
function shotPrep(si) {
  var s = ch.shots[si], o = si * 14, n = s.n || 1, k = s.kind, t0 = s.t0, d = s.dur > 0.05 ? s.dur : 0.05, gap, gb, ta, tb, ty, a, l;
  SC[o + 12] = 0;
  l = k === 0 || k === 1 || k === 2 || k === 3 ? gl[tyOf(s.from)][k] : null;
  if (!l || !l.length) return;
  gap = k === 0 ? 0.04 + 0.16 * core.rnd(si, 1) : k === 2 ? 0.09 : Math.min(0.07, d / n);
  SG[si] = gap;
  if (k === 1) { gb = ta = tb = t0 + d; }
  else { gb = t0 + (n - 1) * gap; ta = t0 + d; tb = gb + d; }
  gp(s.from, k, s.gun, t0, SC, o); gp(s.from, k, s.gun, gb, SC, o + 3);
  tp(s.to, ta, SC, o + 6); tp(s.to, tb, SC, o + 9);
  SC[o + 12] = sh.types[tyOf(s.from)].scale || 1;
  ty = sh.types[tyOf(s.to)]; a = ty.shield;
  SC[o + 13] = 1.5 * Math.max(a[0], a[1], a[2]) * ty.scale;
}
function boomPrep(bi) {
  var b = ch.booms[bi], o = bi * 14, ty = sh.types[tyOf(b.ship)], k;
  ch.state(b.ship, b.t - 0.1, so);
  BC[o + 3] = so.p[0]; BC[o + 4] = so.p[1]; BC[o + 5] = so.p[2];
  ch.state(b.ship, b.t - 0.05, so);
  for (k = 0; k < 3; k++) { BC[o + 3 + k] = (so.p[k] - BC[o + 3 + k]) / 0.05; BC[o + k] = so.p[k] + BC[o + 3 + k] * 0.05; }
  for (k = 0; k < 4; k++) BC[o + 6 + k] = so.q[k];
  BC[o + 10] = ty.len * ty.scale * 0.5; BC[o + 12] = b.t; BC[o + 13] = b.size;
}
function num(a, b) { return a - b; }
function evs(m, l) {
  var i, k;
  for (i = 0; i < l.length; i++) {
    k = l[i].carrier * 8 + (l[i].bay & 7);
    (m[k] = m[k] || []).push(core.wrap(l[i].t));
  }
}
function waves() {
  var m = {}, i, c, k, ts, n, g, mi, gap, st, u, idx;
  evs(m, ch.launches || []); evs(m, ch.docks || []);
  for (c in m) {
    ts = m[c].sort(num); n = ts.length; g = -1; mi = 0;
    for (i = 0; i < n; i++) {
      gap = i < n - 1 ? ts[i + 1] - ts[i] : ts[0] + 60 - ts[n - 1];
      if (gap > g) { g = gap; mi = i; }
    }
    if (g <= 3) { WC.push(c >> 3); WB.push(c & 7); WS.push(0); WE.push(1e9); continue; }
    st = (mi + 1) % n; u = [];
    for (k = 0; k < n; k++) { idx = (st + k) % n; u.push(ts[idx] + (idx < st ? 60 : 0)); }
    st = 0;
    for (k = 1; k <= n; k++) {
      if (k === n || u[k] - u[k - 1] > 3) { WC.push(c >> 3); WB.push(c & 7); WS.push(u[st] - 1.5); WE.push(u[k - 1] + 1.5); st = k; }
    }
  }
}
function prep() {
  if (ready) return 1;
  var end = step + 48, tot = N + NB;
  while (step < end && step < tot) {
    if (step < N) shotPrep(step); else boomPrep(step - N);
    step++;
  }
  if (step >= tot) { waves(); ready = 1; return 1; }
  return 0;
}

// gas colour by age since the burst, into hc
function mx(a, b, c, d, e, f, k) { hc[0] = lp(a, d, k); hc[1] = lp(b, e, k); hc[2] = lp(c, f, k); }
function heat(u) {
  if (u < 0.4) mx(1, 0.85, 0.55, 1, 0.55, 0.18, u * 2.5);
  else if (u < 1) mx(1, 0.55, 0.18, 0.9, 0.35, 0.1, (u - 0.4) / 0.6);
  else mx(0.9, 0.35, 0.1, 0.5, 0.12, 0.05, Math.min(1, (u - 1) / 1.5));
}
// px: CSS pixels to metres, a flash is never wider than 30 m
function pm(n) { return n * MP; }
function cap(n) { n *= MP; return n > 30 ? 30 : n; }
function flash(x, y, z, a, d, rm, k) {
  if (a < 0 || a >= d) return;
  var f = 1 - a / d;
  pS(x, y, z, rm * (0.6 + 0.4 * f), 0.95, 0.95, 1, k * f, 0, 0.7, 0);
  pS(x, y, z, rm, 1, 1, 1, k * f * 0.8, 3, 0.9, 0);
}
// gas ball: filled, radius rm after gt seconds, peak k km (both sprites together), gone after dur seconds; ramps in over 0.15 s
function gas(x, y, z, a, rm, km, gt, dur) {
  var g, r, k, f;
  if (a < 0 || a >= dur) return;
  g = Math.min(1, a / gt); r = rm * (0.12 + 0.88 * (1 - (1 - g) * (1 - g)));
  f = 1 - a / dur; k = km * core.sstep(0, 0.15, a) * f * (0.3 + 0.7 * f);
  heat(a);
  pS(x, y, z, r, hc[0], hc[1], hc[2], k * 0.62, 4, 0, 0);
  pS(x, y, z, r * 0.55, hc[0], hc[1], hc[2], k * 0.38, 4, 0, 0);
}
function dirv(bi, m, out) {
  var z = core.rnd(bi * 64 + m, 5) * 2 - 1, p = core.rnd(bi * 64 + m, 4) * 6.2832, r = Math.sqrt(1 - z * z);
  out[0] = r * Math.cos(p); out[1] = r * Math.sin(p); out[2] = z;
}
function boom(F, bi) {
  var o = bi * 14, a = core.age(F.t, BC[o + 12]), sz = BC[o + 13], x, y, z, i, m, nb, ab, hl, am, nc, sp, k, f, g, R;
  if (a >= (sz ? 4.6 : 2.1)) return;
  x = BC[o] + BC[o + 3] * 0.5 * a; y = BC[o + 1] + BC[o + 4] * 0.5 * a; z = BC[o + 2] + BC[o + 5] * 0.5 * a;
  hl = BC[o + 10];
  if (sz === 0) {
    R = 22 * Math.sqrt(hl / 30); R = pm(R < 24 ? 24 : R > 30 ? 30 : R);
    flash(x, y, z, a, 0.06, cap(14), 0.95);
    gas(x, y, z, a, R, 0.55, 0.5, 1.5);
    if (a < 1.2) {
      nc = 12 + ((core.rnd(bi, 3) * 8) | 0); if (F.tier === 0) nc >>= 1;
      g = a / 1.2; f = 1 - (1 - g) * (1 - g);
      for (m = 0; m < nc; m++) {
        dirv(bi, m, bv); sp = pm(30 + 40 * core.rnd(bi * 64 + m, 6)) * f;
        heat(a * 0.5); k = 0.6 * (1 - g * g);
        tv[0] = x + bv[0] * sp; tv[1] = y + bv[1] * sp; tv[2] = z + bv[2] * sp;
        pS(tv[0], tv[1], tv[2], pm(1.3), hc[0], hc[1], hc[2], k, 2, 0, 0);
      }
    }
    return;
  }
  nb = 2 + ((core.rnd(bi, 20) * 3) | 0);
  for (m = 0; m < nb; m++) {
    ab = a - (0.15 + 1.2 * m / nb);
    if (ab < 0 || ab >= 2.5) continue;
    tv[0] = (core.rnd(bi * 8 + m, 21) * 2 - 1) * hl * 0.8; tv[1] = 0; tv[2] = (core.rnd(bi * 8 + m, 22) * 2 - 1) * hl * 0.15;
    core.qrot(BC, o + 6, tv, 0, tw, 0);
    flash(x + tw[0], y + tw[1], z + tw[2], ab, 0.05, cap(12), 0.9);
    gas(x + tw[0], y + tw[1], z + tw[2], ab, pm(18), 0.5 * (1 - core.sstep(1.5, 2.4, ab + 0.15 + 1.2 * m / nb)), 0.4, 2.5);
  }
  am = a - 1.5;
  if (am < 0) return;
  flash(x, y, z, am, 0.06, cap(30), 0.95);
  gas(x, y, z, am, pm(55 + 20 * core.rnd(bi, 8)), 0.5, 0.9, 2.5);
  if (am < 1.2) {
    g = am / 1.2; f = 1 - (1 - g) * (1 - g); R = pm(110) * f;
    pS(x, y, z, R / 0.9 + 1, 1, 0.7, 0.4, 0.25 * (1 - g), 1, 0.9, 0.07);
  }
  if (am < 3) {
    nc = 3 + ((core.rnd(bi, 7) * 4) | 0); if (F.tier === 0) nc = (nc + 1) >> 1;
    g = am / 3; f = 1 - (1 - g) * (1 - g);
    for (m = 0; m < nc; m++) {
      dirv(bi, m + 20, bv); sp = pm(40 + 50 * core.rnd(bi * 64 + m, 6)) * f;
      pS(x + bv[0] * sp, y + bv[1] * sp, z + bv[2] * sp, pm(1.8), lp(0.5, 1, 1 - g), lp(0.12, 0.4, 1 - g), lp(0.05, 0.12, 1 - g), 0.6 * (1 - g), 2, 0, 0);
    }
  }
}

// start and end of bolt or tracer j into ap (a miss passes the shield's reach to one side)
function aim(si, s, o, j, n) {
  var f = n > 1 ? j / (n - 1) : 0, sx = lp(SC[o], SC[o + 3], f), sy = lp(SC[o + 1], SC[o + 4], f), ex = lp(SC[o + 6], SC[o + 9], f), ey = lp(SC[o + 7], SC[o + 10], f), dx, dy, l2, m;
  if (!s.hit) {
    dx = ex - sx; dy = ey - sy; l2 = Math.sqrt(dx * dx + dy * dy) || 1;
    m = SC[o + 13] * (core.rnd(si, 2) < 0.5 ? -1 : 1) / l2;
    ex -= dy * m; ey += dx * m;
  }
  ap[0] = sx; ap[1] = sy; ap[2] = lp(SC[o + 2], SC[o + 5], f); ap[3] = ex; ap[4] = ey; ap[5] = lp(SC[o + 8], SC[o + 11], f);
}
// laser bolts (kind 0) and cannon tracers (kind 3): bolt j leaves at j * gap and lands dur later
function laser(F, si, s, a, o, cn) {
  var n = s.n || 1, d = s.dur > 0.05 ? s.dur : 0.05, gap = SG[si], j, ab, sx, sy, sz, ex, ey, ez, dx, dy, dz, D, sp, dt, hd, tl, ux, uy, uz, f;
  var len = pm(cn ? 10 : 16), c = TC, i3 = F.tm[s.from] * 3, r, g, b;
  r = 0.5 + 0.5 * c[i3]; g = 0.5 + 0.5 * c[i3 + 1]; b = 0.5 + 0.5 * c[i3 + 2];
  for (j = 0; j < n; j++) {
    ab = a - j * gap;
    if (ab < 0) break;
    if (ab > d + 3) continue;
    aim(si, s, o, j, n);
    sx = ap[0]; sy = ap[1]; sz = ap[2]; ex = ap[3]; ey = ap[4]; ez = ap[5];
    dx = ex - sx; dy = ey - sy; dz = ez - sz; D = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    sp = D / d; dt = s.hit ? D : D + sp * 0.4;
    hd = sp * ab; tl = hd - len;
    if (ab < 0.04) pS(sx, sy, sz, pm(3), 0.9, 0.95, 1, 0.8 * (1 - ab / 0.04), 3, 0.8, 0);
    if (s.hit && ab >= d && ab < d + 0.26) {
      f = ab - d;
      if (cn) { if (f < 0.06) pS(ex, ey, ez, pm(3), 1, 0.6, 0.3, 0.8 * (1 - f / 0.06), 2, 0.6, 0); }
      else if (f < 0.06) pS(ex, ey, ez, pm(4), r, g, b, 0.9, 3, 0.9, 0);
      else pS(ex, ey, ez, pm(3), c[i3], c[i3 + 1], c[i3 + 2], 0.5 * (1 - (f - 0.06) / 0.2), 0, 0.5, 0);
    }
    if (tl >= dt) continue;
    if (hd > dt) hd = dt;
    if (tl < 0) tl = 0;
    ux = dx / D; uy = dy / D; uz = dz / D;
    if (cn) pL(sx + ux * hd, sy + uy * hd, sz + uz * hd, sx + ux * tl, sy + uy * tl, sz + uz * tl, pm(1.8), 0.8, 1, 0.8, 0.6, 0.9, 0.25, 0.1, 1);
    else pL(sx + ux * hd, sy + uy * hd, sz + uz * hd, sx + ux * tl, sy + uy * tl, sz + uz * tl, pm(3.2), 0.8, 1, 1, 1, c[i3] * 0.9, c[i3 + 1] * 0.9, c[i3 + 2] * 0.9, 1);
  }
}
function rail(si, s, a, o) {
  var d = s.dur > 0.05 ? s.dur : 0.05, f, r, p, gx, gy, gz, ad, dx, dy, dz, D, k;
  if (a < d) {
    f = a / d; gx = lp(SC[o], SC[o + 3], f); gy = lp(SC[o + 1], SC[o + 4], f); gz = lp(SC[o + 2], SC[o + 5], f);
    r = pm(3 + 6 * f); p = 0.7 + 0.3 * Math.sin(a * 20 + si);
    pS(gx, gy, gz, r, 0.624, 0.78, 1, 0.4 * p, 0, 0.4, 0);
    pS(gx, gy, gz, r * 0.4, 0.8, 0.9, 1, 0.15 * p, 0, 0.7, 0);
    return;
  }
  ad = a - d; gx = SC[o + 3]; gy = SC[o + 4]; gz = SC[o + 5];
  if (ad < 0.16) {
    k = ad < 0.04 ? 1 : 1 - (ad - 0.04) / 0.12; r = cap(12);
    pS(gx, gy, gz, r * (0.7 + 0.3 * k), 0.95, 0.9, 1, 0.95 * k, 0, 0.8, 0);
    pS(gx, gy, gz, r, 0.95, 0.9, 1, 0.8 * k, 3, 0.9, 0);
  }
  if (ad < 0.3) {
    k = ad / 0.3; r = pm(20) * (1 - (1 - k) * (1 - k));
    pS(gx, gy, gz, r / 0.9 + 1, 0.7, 0.65, 1, 0.35 * (1 - k), 1, 0.9, 0.08);
  }
  if (ad < 0.6) {
    dx = SC[o + 6] - gx; dy = SC[o + 7] - gy; dz = SC[o + 8] - gz; D = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (D > 1) {
      k = pm(300) / D + 1;
      pL(gx, gy, gz, gx + dx * k, gy + dy * k, gz + dz * k, pm(3.5), 0.6, 0.55, 0.5, 1, 0.4, 0.35, 0.8, 0.55 * Math.pow(1 - ad / 0.6, 1.5));
    }
  }
  if (s.hit && ad < 0.06) flash(SC[o + 6], SC[o + 7], SC[o + 8], ad, 0.06, cap(6), 0.9);
}
function bz(u, a, b, c, d, e, f, g, h, i) {
  var v = 1 - u, p = v * v, q = 2 * u * v, r = u * u;
  bv[0] = p * a + q * d + r * g; bv[1] = p * b + q * e + r * h; bv[2] = p * c + q * f + r * i;
}
function rocket(si, s, a, o) {
  var n = s.n || 1, d = s.dur > 0.05 ? s.dur : 0.05, j, ab, f, gx, gy, gz, tx, ty, tz, dx, dy, l2, sd, off, cx, cy, cz, u, x, y, z, ai, k;
  for (j = 0; j < n; j++) {
    ab = a - j * 0.09;
    if (ab < 0) break;
    if (ab > d + 0.6) continue;
    f = n > 1 ? j / (n - 1) : 0;
    gx = lp(SC[o], SC[o + 3], f); gy = lp(SC[o + 1], SC[o + 4], f); gz = lp(SC[o + 2], SC[o + 5], f);
    tx = lp(SC[o + 6], SC[o + 9], f); ty = lp(SC[o + 7], SC[o + 10], f); tz = lp(SC[o + 8], SC[o + 11], f);
    dx = tx - gx; dy = ty - gy;
    l2 = Math.sqrt(dx * dx + dy * dy) || 1;
    sd = core.rnd(si * 16 + j, 3) < 0.5 ? -1 : 1;
    off = Math.sqrt(dx * dx + dy * dy + (tz - gz) * (tz - gz)) * (0.2 + 0.15 * core.rnd(si * 16 + j, 4)) * sd;
    cx = (gx + tx) / 2 - dy / l2 * off; cy = (gy + ty) / 2 + dx / l2 * off; cz = (gz + tz) / 2;
    u = ab / d;
    if (u < 1) {
      bz(u, gx, gy, gz, cx, cy, cz, tx, ty, tz);
      x = bv[0]; y = bv[1]; z = bv[2];
      k = pm(14) / (Math.sqrt(dx * dx + dy * dy + (tz - gz) * (tz - gz)) * 1.1 + 1);
      bz(u > k ? u - k : 0, gx, gy, gz, cx, cy, cz, tx, ty, tz);
      pL(x, y, z, bv[0], bv[1], bv[2], pm(1.6), 1, 1, 0.7, 0.35, 1, 0.4, 0.15, 0.5);
      pS(x, y, z, pm(5), 1, 0.5, 0.2, 0.45, 0, 0.4, 0);
      pS(x, y, z, pm(1.2), 1, 0.85, 0.6, 0.6, 2, 0, 0);
    } else if (s.hit) {
      ai = ab - d;
      if (ai < 0.5) {
        flash(tx, ty, tz, ai, 0.05, cap(6), 0.9);
        k = 1 - ai / 0.5; x = 1 - k * k;
        pS(tx, ty, tz, pm(4 + 10 * x), 1, 0.55, 0.25, 0.3 * k, 0, 0.5, 0);
        pS(tx, ty, tz, pm(4 + 10 * x), 1, 0.6, 0.3, 0.25 * k, 1, 0.8, 0.3);
      }
    }
  }
}
function build(F) {
  var t = F.t, i, j, n = F.n, dd, s, a, o, ty, es, en, ds, al, thr, len, x, y, z, w, c, dd, k, bs, b, ar, lc, ar2;
  nl = 0; ns = 0;
  TC = F.team; MP = F.mpp > 0 ? F.mpp : 1.9;
  // drive plumes
  for (i = 0; i < n; i++) {
    if (!(F.V[i] > 0)) continue;
    ty = sh.types[F.ty[i]]; es = ty.engines; ds = F.DS[i]; al = F.AL[i];
    if (F.eye && F.cssH) {
      dd = F.eye[2] - F.P[i * 3 + 2]; if (!(dd > 1)) dd = 1;
      w = dd * 0.26795; len = (26.4 * RM[F.ty[i]] + 0.5 * ty.len) * ds * 1.2;
      if (Math.abs(F.P[i * 3]) > w * F.cssW / F.cssH + len || Math.abs(F.P[i * 3 + 1] - F.camY - (F.bgY - F.camY) * dd / F.eye[2]) > w + len) continue;
    }
    thr = F.TH[i]; thr = Math.pow(thr < 0 ? 0 : thr > 1 ? 1 : thr, 0.8);
    core.qrot(F.Q, i * 4, DX, 0, t2, 0);
    for (j = 0; j < es.length; j++) {
      en = es[j]; tv[0] = en.p[0] * ds; tv[1] = en.p[1] * ds; tv[2] = en.p[2] * ds;
      core.qrot(F.Q, i * 4, tv, 0, tw, 0);
      x = F.P[i * 3] + tw[0]; y = F.P[i * 3 + 1] + tw[1]; z = F.P[i * 3 + 2] + tw[2];
      len = 2 * en.r * (8 + 52 * thr) * ds * 0.22; lc = 0.6 * ty.len * ds;
      len = len * (0.25 + 0.75 * thr); if (len > lc) len = lc;
      w = en.r * ds * 0.9;
      if (F.D && F.mpp) {
        dd = F.D - z; if (!(dd > 1)) dd = 1;
        lc = (ty.cls === 'L' ? 3.6 : ty.cls === 'M' ? 2.7 : 1.8) * F.mpp * dd / F.D;
        if (w > lc) w = lc;
      }
      k = al * (0.3 + 0.7 * thr); lc = 0.55 + 0.45 * thr;
      pL(x, y, z, x + t2[0] * len, y + t2[1] * len, z + t2[2] * len, w, 1, 0.95 * lc, 0.95 * lc, lc, 0.225, 0.25, 0.475, k);
      lc = w * 1.5; if (lc > en.r * ds * 1.6) lc = en.r * ds * 1.6;
      pS(x, y, z, lc, 0.7, 0.75, 1, 0.3 * k, 0, 0.4, 0);
    }
  }
  if (!ready) { fx.nl = nl; fx.ns = ns; return; }
  // shots
  for (i = 0; i < N; i++) {
    s = ch.shots[i]; a = core.age(t, s.t0);
    if (a > s.dur + (s.n || 1) * 0.2 + 3) continue;
    o = i * 14;
    if (SC[o + 12] === 0) continue;
    if (s.kind === 0) laser(F, i, s, a, o, 0);
    else if (s.kind === 1) rail(i, s, a, o);
    else if (s.kind === 2) rocket(i, s, a, o);
    else laser(F, i, s, a, o, 1);
  }
  for (i = 0; i < NB; i++) boom(F, i);
  // hangar light
  for (i = 0; i < WC.length; i++) {
    c = WC[i]; if (!(F.V[c] > 0)) continue;
    a = core.age(t, WS[i]); dd = WE[i] - WS[i];
    if (a >= dd) continue;
    k = dd >= 60 ? 0.5 : 0.5 * core.sstep(0, 0.4, a) * core.sstep(0, 0.4, dd - a);
    ty = sh.types[F.ty[c]]; bs = ty.bays || []; ds = F.DS[c];
    b = bs[WB[i]];
    if (b) {
      tv[0] = b.p[0] * ds; tv[1] = b.p[1] * ds; tv[2] = b.p[2] * ds;
      core.qrot(F.Q, c * 4, tv, 0, tw, 0);
      tv[0] = b.d[0]; tv[1] = b.d[1]; tv[2] = b.d[2];
      core.qrot(F.Q, c * 4, tv, 0, t2, 0);
      pS(F.P[c * 3] + tw[0] + t2[0] * 4, F.P[c * 3 + 1] + tw[1] + t2[1] * 4, F.P[c * 3 + 2] + tw[2] + t2[2] * 4,
        pm(12 * ds / 1.32), 1, 0.98, 0.92, k * 0.6, 4, 0, 0);
      pS(F.P[c * 3] + tw[0], F.P[c * 3 + 1] + tw[1], F.P[c * 3 + 2] + tw[2], pm(5), 1, 0.98, 0.92, k * 0.4, 4, 0, 0);
    }
  }
  // arrival flares
  ar = ch.arrivals || [];
  for (i = 0; i < ar.length; i++) {
    a = core.age(t, ar[i].t);
    c = ar[i].ship;
    if (a >= 1.5 || !(F.V[c] > 0)) continue;
    k = core.sstep(0, 0.15, a); ds = F.DS[c]; ty = sh.types[F.ty[c]]; es = ty.engines;
    core.qrot(F.Q, c * 4, DX, 0, t2, 0);
    dd = ty.len * ds * 0.4; ar2 = 0.7 * k * (1 - core.sstep(0.4, 1.5, a));
    bs = 0.45 * k * (1 - core.sstep(0.5, 1.5, a)); if (bs > 0.7 / es.length) bs = 0.7 / es.length;
    for (j = 0; j < es.length; j++) {
      en = es[j]; tv[0] = en.p[0] * ds; tv[1] = en.p[1] * ds; tv[2] = en.p[2] * ds;
      core.qrot(F.Q, c * 4, tv, 0, tw, 0);
      x = F.P[c * 3] + tw[0]; y = F.P[c * 3 + 1] + tw[1]; z = F.P[c * 3 + 2] + tw[2];
      w = en.r * ds * 0.9; if (w > pm(2.5)) w = pm(2.5);
      pL(x, y, z, x + t2[0] * dd, y + t2[1] * dd, z + t2[2] * dd, w, 0.9, 0.85, 0.85, 1, 0.3, 0.3, 0.7, ar2);
      pS(x, y, z, pm(10), 0.85, 0.8, 1, bs, 4, 0, 0);
      if (a < 0.3) pS(x, y, z, pm(4), 1, 1, 1, 0.9 * (1 - a / 0.3), 3, 0.8, 0);
    }
  }
  fx.nl = nl; fx.ns = ns;
}

O81B.fx = fx;
})();
