/* (c) 2026 Andrius Bubliauskas. All rights reserved. */
(function () {
  'use strict';
  window.O81B = window.O81B || {};
  var M = Math, K = ['dir', 'color', 'ambient'];
  function wrap(t) { var r = M.round((t - 60 * M.floor(t / 60)) * 1e6) / 1e6; return r >= 60 || r < 0 ? 0 : r; }
  function age(t, t0) { return wrap(t - t0); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function sstep(a, b, x) { var k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); }
  // integer hash of two integers to [0, 1)
  function rnd(i, k) {
    var h = M.imul(i | 0, 0x9E3779B1) ^ M.imul((k | 0) + 0x7F4A7C15, 0x85EBCA6B);
    h ^= h >>> 16; h = M.imul(h, 0x7FEB352D);
    h ^= h >>> 15; h = M.imul(h, 0x846CA68B);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  // rotate v by unit quaternion q: v + w*t + u x t, t = 2 (u x v)
  function qrot(q, qo, v, vo, out, oo) {
    var x = q[qo], y = q[qo + 1], z = q[qo + 2], w = q[qo + 3],
      a = v[vo], b = v[vo + 1], c = v[vo + 2],
      tx = 2 * (y * c - z * b), ty = 2 * (z * a - x * c), tz = 2 * (x * b - y * a);
    out[oo] = a + w * tx + y * tz - z * ty;
    out[oo + 1] = b + w * ty + z * tx - x * tz;
    out[oo + 2] = c + w * tz + x * ty - y * tx;
  }
  function qmul(a, ao, b, bo, out, oo) {
    var ax = a[ao], ay = a[ao + 1], az = a[ao + 2], aw = a[ao + 3],
      bx = b[bo], by = b[bo + 1], bz = b[bo + 2], bw = b[bo + 3];
    out[oo] = aw * bx + ax * bw + ay * bz - az * by;
    out[oo + 1] = aw * by - ax * bz + ay * bw + az * bx;
    out[oo + 2] = aw * bz + ax * by - ay * bx + az * bw;
    out[oo + 3] = aw * bw - ax * bx - ay * by - az * bz;
  }
  function qaxis(ax, ay, az, ang, out, oo) {
    var s = M.sin(ang / 2);
    out[oo] = ax * s; out[oo + 1] = ay * s; out[oo + 2] = az * s; out[oo + 3] = M.cos(ang / 2);
  }
  function hex(s) {
    s = String(s).trim();
    var m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(s), h, i, r = [];
    if (!m) return null;
    h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    for (i = 0; i < 3; i++) r.push(parseInt(h.substr(2 * i, 2), 16) / 255);
    return r;
  }
  function fnv(u8, n) {
    var h = 0x811C9DC5, i;
    for (i = 0; i < n; i++) { h ^= u8[i]; h = M.imul(h, 16777619); }
    return ('0000000' + (h >>> 0).toString(16)).slice(-8);
  }
  function lin(c) { return M.pow(c, 2.2); }
  function dsp(c) { return M.pow(c, 1 / 2.2); }
  // fill the off-axis view-projection P: w, h = view size in metres, dd = distance, yc = centre row, ch = canvas CSS height, cy = camera Y
  function proj(P, w, h, dd, yc, ch, cy) {
    var n = 50, f = 30000;
    P[0] = 2 * dd / w; P[5] = 2 * dd / h; P[9] = 2 * yc / ch - 1;
    P[10] = -(f + n) / (f - n); P[11] = -1;
    P[13] = -cy * P[5] - dd * P[9]; P[14] = dd * (f + n) / (f - n) - 2 * f * n / (f - n); P[15] = dd;
  }
  // zone weights into w (five, two non-zero at most) for camera Y cy; returns the nearest zone
  function zw(w, cy) {
    var u = clamp(-cy / 2000, 0, 4), i = u | 0, fr = u - i;
    w.fill(0); w[i] = 1 - fr; if (fr > 0 && i < 4) w[i + 1] = fr;
    return M.round(u);
  }
  // part number of vertex v (K41): by mesh.parts, else by local x against type.cuts (stand-in: thirds of the length)
  function part(ty, me, v) {
    var p = me.parts, k = 0, c, x;
    if (p) { while (k + 1 < p.length && p[k + 1] <= v) k++; return M.min(k, 6); }
    c = ty.cuts || [-ty.len / 6, ty.len / 6]; x = me.pos[3 * v];
    while (k < c.length && x >= c[k]) k++;
    return M.min(k, 6);
  }
  function nparts(ty, me) { return M.min(7, me.parts ? me.parts.length : (ty.cuts ? ty.cuts.length : 2) + 1); }
  // blend the zones' light by weights w into l3, direction normalised
  function lblend(l3, w, Z) {
    var c, a, i, m;
    for (c = 0; c < 9; c++) {
      a = K[c / 3 | 0]; l3[a][c % 3] = 0;
      for (i = 0; i < 5; i++) if (w[i] > 0) l3[a][c % 3] += w[i] * Z[i].light[a][c % 3];
    }
    m = M.sqrt(l3.dir[0] * l3.dir[0] + l3.dir[1] * l3.dir[1] + l3.dir[2] * l3.dir[2]) || 1;
    l3.dir[0] /= m; l3.dir[1] /= m; l3.dir[2] /= m;
  }
  window.O81B.core = {
    LOOP: 60, wrap: wrap, age: age, clamp: clamp, mix: mix, sstep: sstep, rnd: rnd,
    qrot: qrot, qmul: qmul, qaxis: qaxis, hex: hex, fnv: fnv, lin: lin, dsp: dsp,
    proj: proj, zw: zw, part: part, nparts: nparts, lblend: lblend
  };
})();
