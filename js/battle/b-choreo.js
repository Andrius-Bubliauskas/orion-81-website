/* (c) 2026 Andrius Bubliauskas. All rights reserved. */
(function () {
'use strict';
window.O81B = window.O81B || {};
// Nothing happens at load. The first read of any member of O81B.choreo decodes O81B.choreoData (see the encoder);
// if the data is missing or malformed, the choreography stays not ready and every member reads undefined.
var TWO = Math.PI * 2, E = 1 / 30, AL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', LK = [];
var D, p, N, T, C, roster, ready = 0, V;
var ac, c9, cx, cy, cz, cw, lim, bst, sd_, sr_, bg, et, ee, ec, eb, hA, hM, hR, booms, launches, docks, arrivals, shots;
function num(s, q, n) {
  var v = 0, d;
  while (n--) { d = LK[s.charCodeAt(q++)]; if (d === undefined) throw 0; v = v * 64 + d; }
  return v;
}
function rd(n, sc, off) {
  var a = new Float64Array(n), q;
  for (q = 0; q < n; q++, p += 2) a[q] = (num(D.P, p, 2) - 2048) * sc + off;
  return a;
}
function byT(a, b) { return a.t - b.t; }
function str(v, m) { return typeof v === 'string' && v.length > 0 && v.length % m === 0; }
function decode() {
  var i, j, r, z, cl, s, t, e, c, b, o, g0, g1, g2;
  D = window.O81B.choreoData; p = 0;
  if (!D || !Array.isArray(D.T) || !D.T.length || !D.C || !Array.isArray(D.D) || D.D.length < 4 || !(D.Y > 0)) throw 0;
  if (!str(D.R, 2) || !str(D.P, 2) || !str(D.E, 5) || !str(D.S, 9)) throw 0;
  for (i = 0; i < 64; i++) LK[AL.charCodeAt(i)] = i;
  T = D.T; C = D.C; N = D.R.length / 2;
  for (i = 0; i < T.length; i++) {
    r = T[i];
    if (!Array.isArray(r) || r.length < 6 || !(r[2] > 0) || !(r[3] > 0) || !(r[4] > 0) || !Array.isArray(cl = C[r[1]]) || cl.length < 5 || !(cl[1] >= 0) || !(cl[4] > 0)) throw 0;
  }
  roster = []; ac = []; c9 = []; cx = []; cy = []; cz = []; cw = []; lim = []; bst = []; sd_ = []; sr_ = []; bg = [];
  et = []; ee = []; ec = []; eb = []; hA = []; hM = []; hR = []; booms = []; launches = []; docks = []; arrivals = []; shots = [];
  // Per-ship tables. T row: id, class, boost, Kxy, Kz, Kyaw. C[class]: tilt deg, bank g, shield delay, recharge, thrust accel.
  for (i = 0; i < N; i++) {
    j = num(D.R, 2 * i, 2);
    r = T[j >> 3]; z = j & 7; cl = C[r[1]];
    roster.push({ team: i < N / 2 ? 0 : 1, type: r[0], cls: r[1], zone: z });
    cx[i] = rd(r[3], 1, 0);
    cy[i] = rd(r[3], 0.5, -z * D.Y);
    cz[i] = rd(r[4], 0.25, 0);
    cw[i] = r[5] ? rd(r[5], TWO / 1024, 0) : null;
    lim[i] = cl[0] * Math.PI / 180; c9[i] = Math.cos(0.9 * lim[i]); bg[i] = cl[1]; sd_[i] = cl[2]; sr_[i] = cl[3]; bst[i] = r[2]; ac[i] = cl[4];
    et[i] = []; ee[i] = []; ec[i] = []; eb[i] = []; hA[i] = []; hM[i] = []; hR[i] = [];
  }
  if (p !== D.P.length) throw 0;
  for (i = 0; i < D.E.length / 5; i++) {
    j = num(D.E, 5 * i, 5);
    s = j >> 23; t = ((j >> 10) & 8191) / 100; e = (j >> 8) & 3; c = (j >> 1) & 127; b = j & 1;
    et[s].push(t); ee[s].push(e); ec[s].push(c); eb[s].push(b);
    if (e === 0) launches.push({ t: t, carrier: c, bay: b, ship: s });
    else if (e === 1) docks.push({ t: t, carrier: c, bay: b, ship: s });
    else if (e === 2) booms.push({ t: t, ship: s, size: 'SML'.indexOf(roster[s].cls) });
    else arrivals.push({ t: t, ship: s });
  }
  launches.sort(byT); docks.sort(byT); booms.sort(byT); arrivals.sort(byT);
  for (i = 0; i < D.S.length / 9; i++) {
    g0 = num(D.S, 9 * i, 3); g1 = num(D.S, 9 * i + 3, 3); g2 = num(D.S, 9 * i + 6, 3);
    o = { t0: (g0 & 8191) / 100, dur: (g2 & 1023) / 100, kind: (g0 >> 13) & 3, from: g1 & 127, gun: g0 >> 15,
      to: (g1 >> 7) & 127, hit: (g1 >> 14) & 1, n: (g2 >> 14) + 1, dmg: g1 >> 15, dir: (g2 >> 10) & 15 };
    if (!hA[o.to] || !roster[o.from]) throw 0;
    shots.push(o);
    if (o.hit) { hA[o.to].push((o.t0 + o.dur) % 60); hM[o.to].push(D.D[o.dmg]); hR[o.to].push(o.dir * TWO / 16); }
  }
}

// Periodic cubic B-spline: basis b* and derivative basis d* for u = t K / 60, control indices i0-i3.
var i0, i1, i2, i3, W = new Float64Array(12);   // W: basis 0-3, derivative basis 4-7, launch/dock times 8-9
function bs(K, t) {
  var u = t * K / 60, f, g, f2, x;
  u = u < 0 ? u + K : u >= K ? u - K : u; x = Math.floor(u);
  f = u - x; if (x >= K) x -= K;
  i0 = x ? x - 1 : K - 1; i1 = x; i2 = x + 1 < K ? x + 1 : 0; i3 = x + 2 < K ? x + 2 : x + 2 - K;
  g = 1 - f; f2 = f * f;
  W[0] = g * g * g / 6; W[1] = (3 * f2 * f - 6 * f2 + 4) / 6; W[2] = (-3 * f2 * f + 3 * f2 + 3 * f + 1) / 6; W[3] = f2 * f / 6;
  W[4] = -g * g / 2; W[5] = (9 * f2 - 12 * f) / 6; W[6] = (-9 * f2 + 6 * f + 3) / 6; W[7] = f2 / 2;
}
function sv(c) { return W[0] * c[i0] + W[1] * c[i1] + W[2] * c[i2] + W[3] * c[i3]; }
function sd(c) {
  return (W[4] * c[i0] + W[5] * c[i1] + W[6] * c[i2] + W[7] * c[i3]) * c.length / 60;
}
function sp(a, t, o) { bs(cx[a].length, t); o[0] = sv(cx[a]); o[1] = sv(cy[a]); bs(cz[a].length, t); o[2] = sv(cz[a]); }
function ss(a, b, x) { x = (x - a) / (b - a); x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }

// Frame from heading, pitch, bank: bow BB, up UU, starboard SS.
var BB = [0, 0, 0], UU = [0, 0, 0], SS = [0, 0, 0];
function frame(psi, th, ph) {
  var cp = Math.cos(psi), sp_ = Math.sin(psi), ct = Math.cos(th), st = Math.sin(th), c = Math.cos(ph), s = Math.sin(ph);
  var bx = ct * cp, by = ct * sp_, bz = st, ux = -st * cp, uy = -st * sp_, uz = ct;
  var sx = by * uz - bz * uy, sy = bz * ux - bx * uz, sz = bx * uy - by * ux;
  ux = c * ux + s * sx; uy = c * uy + s * sy; uz = c * uz + s * sz;
  BB[0] = bx; BB[1] = by; BB[2] = bz; UU[0] = ux; UU[1] = uy; UU[2] = uz;
  SS[0] = by * uz - bz * uy; SS[1] = bz * ux - bx * uz; SS[2] = bx * uy - by * ux;
}
function yawFrame(a, t) {
  var c = cw[a], mx = 0.9 * lim[a], om;
  bs(c.length, t);
  om = sd(c) * 2.5; om = om < -mx ? -mx : om > mx ? mx : om;
  frame(sv(c), 0, -om);
}

// Launch and dock context of the ship being computed: carrier, side, time into the window.
var et_, ee_, gl, sl, gd, sg, tmp = [0, 0, 0], P0 = [0, 0, 0], P1 = [0, 0, 0], P2 = [0, 0, 0], P3 = [0, 0, 0], P4 = [0, 0, 0];
function blend(o, c, t, s, tau) {
  var w = ss(0.8, 2.6, tau), q, r;
  if (w >= 1) return;
  r = s * (10 + tau * (40 + 12 * tau));
  sp(c, t, tmp); yawFrame(c, t);
  for (q = 0; q < 3; q++) o[q] = (tmp[q] + r * SS[q]) * (1 - w) + o[q] * w;
}
function pos(a, t, dt, o) {
  sp(a, t, o);
  if (gl >= 0) blend(o, gl, t, sl, W[8] + dt);
  if (gd >= 0) blend(o, gd, t, sg, W[9] - dt);
}

function state(a, t, out) {
  var P = out.p || (out.p = [0, 0, 0]), Q = out.q || (out.q = [0, 0, 0, 1]), H = out.hd || (out.hd = [1, 0, 0]);
  var n, k, m, k2 = 0, pr = 1, d = 0, u = 0, se = -1, nd = 0, l = lim[a], q;
  t -= 60 * Math.floor(t / 60);
  gl = gd = -1;
  et_ = et[a]; ee_ = ee[a]; n = et_.length;
  if (n) {
    k = n - 1;
    for (m = 0; m < n; m++) { if (et_[m] <= t + 1e-7) k = m; else break; }   // an event at t counts, despite rounding of t
    d = t - et_[k]; if (d < 0) d = d < -1e-6 ? d + 60 : 0;
    se = ee_[k]; pr = se === 0 || se === 3;
    if (pr) {
      k2 = (k + 1) % n; u = et_[k2] - t; if (u < 0) u += 60;
      if (se === 0 && d < 4) { gl = ec[a][k]; sl = eb[a][k] ? 1 : -1; W[8] = d; }
      if (ee_[k2] === 1) { nd = 1; if (u < 4) { gd = ec[a][k2]; sg = eb[a][k2] ? 1 : -1; W[9] = u; } }
    }
  }
  pos(a, t, 0, P0); pos(a, t + E, E, P1); pos(a, t - E, -E, P2);
  var vx = (P1[0] - P2[0]) / (2 * E), vy = (P1[1] - P2[1]) / (2 * E), vz = (P1[2] - P2[2]) / (2 * E);
  var sp2 = vx * vx + vy * vy + vz * vz, ax = (P1[0] - 2 * P0[0] + P2[0]) / (E * E), ay = (P1[1] - 2 * P0[1] + P2[1]) / (E * E);
  var az = (P1[2] - 2 * P0[2] + P2[2]) / (E * E);
  if (cw[a]) yawFrame(a, t);
  else {
    var vh2 = vx * vx + vy * vy + 1e-9, vh = Math.sqrt(vh2), th = Math.atan2(vz, vh), tl = 0.5 * l, ph, mx;
    th = th < -tl ? -tl : th > tl ? tl : th;
    ph = -Math.atan((vx * ay - vy * ax) / vh2 * vh / bg[a]);
    mx = c9[a] / Math.cos(th);
    if (mx < 1 && Math.cos(ph) < mx) ph = ph < 0 ? -Math.acos(mx) : Math.acos(mx);
    // below 25 m/s sideways the heading leans on a 1 s chord, so a climb or dive never spins the bow
    if (vh < 25) {
      pos(a, t + 0.5, 0.5, P3); pos(a, t - 0.5, -0.5, P4);
      var cdx = P3[0] - P4[0], cdy = P3[1] - P4[1], cl = Math.sqrt(cdx * cdx + cdy * cdy) + 1e-9, wq = ss(4, 25, vh);
      vx = wq * vx / vh + (1 - wq) * cdx / cl; vy = wq * vy / vh + (1 - wq) * cdy / cl;
    }
    frame(Math.atan2(vy, vx), th, ph);
  }
  var r00 = BB[0], r10 = BB[1], r20 = BB[2], r01 = UU[0], r11 = UU[1], r21 = UU[2], r02 = SS[0], r12 = SS[1], r22 = SS[2];
  var tr = r00 + r11 + r22, w, x, y, z, f;
  if (tr > 0) { f = Math.sqrt(tr + 1) * 2; w = f / 4; x = (r21 - r12) / f; y = (r02 - r20) / f; z = (r10 - r01) / f; }
  else if (r00 > r11 && r00 > r22) { f = Math.sqrt(1 + r00 - r11 - r22) * 2; w = (r21 - r12) / f; x = f / 4; y = (r01 + r10) / f; z = (r02 + r20) / f; }
  else if (r11 > r22) { f = Math.sqrt(1 + r11 - r00 - r22) * 2; w = (r02 - r20) / f; x = (r01 + r10) / f; y = f / 4; z = (r12 + r21) / f; }
  else { f = Math.sqrt(1 + r22 - r00 - r11) * 2; w = (r10 - r01) / f; x = (r02 + r20) / f; y = (r12 + r21) / f; z = f / 4; }
  f = w < 0 ? -1 : 1;
  Q[0] = x * f; Q[1] = y * f; Q[2] = z * f; Q[3] = w * f;
  P[0] = P0[0]; P[1] = P0[1]; P[2] = P0[2];

  var vis = 0, sh = 1, hit = 0, thr = 0, best = 1e9, bd = 0, tau, rec, h;
  H[0] = 1; H[1] = 0; H[2] = 0;
  if (pr) {
    vis = 1;
    if (se === 0) vis = 0.05 + 0.95 * ss(0, 1.9, d);
    else if (se === 3) vis = 0.05 + 0.95 * ss(0, 1.5, d);
    if (nd) vis = Math.min(vis, 0.05 + 0.95 * ss(0, 1.9, u));
    f = Math.sqrt(sp2); h = f / (0.85 * bst[a]); h = h > 1 ? 1 : h;
    tr = (ax * vx + ay * vy + az * vz) / (f + 1e-9); if (tr < 0) tr = 0;
    thr = 0.05 + 0.95 * h * h + 0.6 * tr / ac[a]; thr = thr < 0.05 ? 0.05 : thr > 1 ? 1 : thr;
    var A = hA[a], M = hM[a];
    for (m = 0; m < A.length; m++) {
      if (n) { q = A[m] - (t - d); if (q < 0) q += 60; if (q >= 60) q -= 60; if (q > d) continue; tau = d - q; }
      else { tau = t - A[m]; if (tau < 0) tau += 60; }
      rec = tau < sd_[a] ? 1 : Math.max(0, 1 - (tau - sd_[a]) / sr_[a]);
      sh -= M[m] * rec;
      if (tau < 0.6) { h = 1 - tau / 0.6; h *= h; if (h > hit) hit = h; }
      if (tau < best) { best = tau; bd = hR[a][m]; }
    }
    sh = sh < 0 ? 0 : sh;
    if (best < 1e9) { H[0] = Math.cos(bd); H[2] = Math.sin(bd); }
  }
  out.vis = vis; out.sh = sh; out.hit = hit; out.thr = thr;
}

function init() {
  if (ready) return;
  ready = -1;
  try {
    decode();
    V = { N: N, roster: roster, state: state, shots: shots, booms: booms, launches: launches, docks: docks, arrivals: arrivals };
    ready = 1;
  } catch (x) { V = null; }
}
var O = {};
function member(name) {
  Object.defineProperty(O, name, { enumerable: true, get: function () { init(); return ready > 0 ? V[name] : undefined; } });
}
['N', 'roster', 'state', 'shots', 'booms', 'launches', 'docks', 'arrivals'].forEach(member);
window.O81B.choreo = O;
})();
