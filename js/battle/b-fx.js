/* (c) 2026 Andrius Bubliauskas. All rights reserved. */
(function () {
'use strict';
window.O81B = window.O81B || {};
var NL = 4096, NS = 4096, M = Math, rnd, age, qrot, sstep;
var core, ch, sh, L, S, nl = 0, ns = 0, gl = [], so, N = 0, NB = 0, SC, SG, BC, step = 0, ready = 0;
var WC = [], WB = [], WS = [], WE = [], ap = new Float32Array(6);
var rk = new Float32Array(12), RM = [], tv = new Float32Array(3), tw = new Float32Array(3), t2 = new Float32Array(3), bv = new Float32Array(3), wv = new Float32Array(3);
var MP = 1.9, hc = new Float32Array(3), DX = new Float32Array([-1, 0, 0]), TC = null;
var BK, NK = 0, KB = [], BKI = [], CEN = [], ST = 208, KI = 0, BV = [], ta = new Float64Array(4), tq = new Float64Array(4), WW;
var fx = { L: null, S: null, W: null, nl: 0, ns: 0, nw: 0, init: init, prep: prep, build: build };
function pL(a, b, c, d, e, f, w, tl, cr, cg, cb, sr, sg, sb, k) {
	if (nl >= NL || k <= 0.002) return;
	var o = nl++ * 16, i;
	for (i = 0; i < 15; i++) L[o + i] = arguments[i];
	L[o + 15] = 0;
}
function pS(x, y, z, r, cr, cg, cb, k, sp, a, b) {
	if (ns >= NS || k <= 0.002) return;
	var o = ns++ * 12, i;
	for (i = 0; i < 11; i++) S[o + i] = arguments[i] || 0;
	S[o + 11] = 0;
}
function far(x, y, z, m, F) {
	if (!F.eye || !F.cssH) return false;
	var d = F.eye[2] - z, w;
	if (!(d > 1)) d = 1;
	w = d * 0.26795;
	return M.abs(x) > w * F.cssW / F.cssH + m || M.abs(y - F.camY - (F.bgY - F.camY) * d / F.eye[2]) > w + m;
}
// world point of local p on ship i, scaled s
function wp(P, Q, i, p, s) {
	qrot(Q, i * 4, p, 0, tw, 0);
	wv[0] = P[i * 3] + tw[0] * s; wv[1] = P[i * 3 + 1] + tw[1] * s; wv[2] = P[i * 3 + 2] + tw[2] * s;
}
function ln(x, y, z) { return M.sqrt(x * x + y * y + z * z); }
function du(s) { return s.dur > 0.05 ? s.dur : 0.05; }
function eo(g) { return 1 - (1 - g) * (1 - g); }
function lp(a, b, f) { return a + (b - a) * f; }
function tyOf(i) { return sh.index[ch.roster[i].type] | 0; }
function init(c) {
	core = O81B.core; rnd = core.rnd; age = core.age; qrot = core.qrot; sstep = core.sstep; ch = c.choreo; sh = c.ships;
	L = fx.L = new Float32Array(NL * 16); S = fx.S = new Float32Array(NS * 12);
	nl = ns = fx.nl = fx.ns = 0;
	so = { p: [0, 0, 0], q: [0, 0, 0, 1], vis: 0, sh: 0, hit: 0, hd: [0, 0, 0], thr: 0 };
	var i, j, g, l;
	gl = [];
	WW = fx.W = new Float32Array(512); fx.nw = 0;
	for (i = 0; i < sh.types.length; i++) {
		g = sh.types[i].guns || []; l = [[], [], [], []];
		for (j = 0; j < g.length; j++) if (l[g[j].kind]) l[g[j].kind].push(g[j]);
		gl.push(l);
		g = sh.types[i].engines || []; RM[i] = 0;
		for (j = 0; j < g.length; j++) if (g[j].r > RM[i]) RM[i] = g[j].r;
	}
	N = ch.shots.length; NB = ch.booms.length; RM.length = sh.types.length;
	SC = new Float32Array(N * 14 + 1); SG = new Float32Array(N + 1); BC = new Float32Array(NB * 14 + 1);
	KB = []; BKI = []; CEN = [];
	for (i = 0; i < NB; i++) {
		g = ch.booms[i]; BKI[i] = g.br === 1 && g.size > 0 ? KB.push(i) - 1 : -1;
	}
	NK = KB.length; BK = new Float64Array(NK * ST + 1); BV = [];
	for (i = 0; i < NK; i++) BV.push(BK.subarray(i * ST, i * ST + ST));
	step = 0; ready = 0; WC.length = WB.length = WS.length = WE.length = 0;
}
function gp(i, k, gun, t, o, oo) {
	ch.state(i, t, so);
	var ti = tyOf(i), l = gl[ti][k];
	wp(so.p, so.q, 0, l[gun % l.length].p, sh.types[ti].scale);
	o[oo] = wv[0]; o[oo + 1] = wv[1]; o[oo + 2] = wv[2];
}
function tp(i, t, o, oo) {
	ch.state(i, t, so);
	o[oo] = so.p[0]; o[oo + 1] = so.p[1]; o[oo + 2] = so.p[2];
}
function shotPrep(si) {
	var s = ch.shots[si], o = si * 14, n = s.n || 1, k = s.kind, t0 = s.t0, d = du(s), gap, gb, ta, tb, ty, a, l;
	SC[o + 12] = 0;
	l = k >= 0 && k <= 3 ? gl[tyOf(s.from)][k] : null;
	if (!l || !l.length) return;
	gap = k === 0 ? 0.04 + 0.16 * rnd(si, 1) : k === 2 ? 0.09 : M.min(0.07, d / n);
	SG[si] = gap;
	if (k === 1) { gb = ta = tb = t0 + d; }
	else { gb = t0 + (n - 1) * gap; ta = t0 + d; tb = gb + d; }
	gp(s.from, k, s.gun, t0, SC, o); gp(s.from, k, s.gun, gb, SC, o + 3);
	tp(s.to, ta, SC, o + 6); tp(s.to, tb, SC, o + 9);
	SC[o + 12] = sh.types[tyOf(s.from)].scale || 1;
	ty = sh.types[tyOf(s.to)]; a = ty.shield;
	SC[o + 13] = 1.5 * M.max(a[0], a[1], a[2]) * ty.scale;
}
function boomPrep(bi) {
	var b = ch.booms[bi], o = bi * 14, ty = sh.types[tyOf(b.ship)], k;
	ch.state(b.ship, b.t - .0667, so);
	BC[o + 3] = so.p[0]; BC[o + 4] = so.p[1]; BC[o + 5] = so.p[2];
	ch.state(b.ship, b.t - .0333, so);
	for (k = 0; k < 3; k++) { BC[o + 3 + k] = (so.p[k] - BC[o + 3 + k]) / .0334; BC[o + k] = so.p[k] + BC[o + 3 + k] * .0333; }
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
function R(a, b) { return rnd(KI * 256 + a, b); }
// break-up data
function kPrep(j) {
	var B = BV[j], bi = KB[j], b = ch.booms[bi], ty = tyOf(b.ship), T = sh.types[ty], s = T.scale, me = sh.build(ty), np = core.nparts(T, me), big = b.size > 1;
	var c = CEN[ty], cu = T.cuts || [-T.len / 6, T.len / 6], ar = ch.arrivals || [], i, k, m, p, v, u, d = 30, x, q, nb, ld;
	KI = bi; ld = big ? 6 + 6 * R(1, 1) : 1.5; nb = (big ? 6 : 2) + (R(2, 1) * (big ? 15 : 3) | 0);
	B.set(BC.subarray(bi * 14, bi * 14 + 10));
	if (!c) {
		c = CEN[ty] = new Float64Array(28);
		for (v = 0; v < me.n; v++) {
			k = core.part(T, me, v); c[21 + k]++;
			for (m = 0; m < 3; m++) c[k * 3 + m] += me.pos[v * 3 + m];
		}
		for (k = 0; k < 21; k++) c[k] /= c[21 + (k / 3 | 0)] || 1;
	}
	for (i = 0; i < ar.length; i++) if (ar[i].ship === b.ship) { u = age(ar[i].t, b.t); if (u > 0.01 && u < d) d = u; }
	B.set([np, ty, b.t, d, nb, cu.length, ld, b.ship, b.size], 10);
	for (k = 0; k < np; k++) {
		p = 20 + k * 10; q = 10 + k;
		for (m = 0; m < 3; m++) B[p + m] = c[k * 3 + m] * s;
		x = (np & 1) && k === np >> 1 ? 0 : c[k * 3] > 0 ? 1 : -1; v = R(q, 3);
		u = x ? (v - 0.5) * 1.2 : v < 0.5 ? -1.57 : 1.57; v = big ? 2 + 10 * R(q, 4) : 4 + 10 * R(q, 4);
		tv[0]=x*M.cos(u)*v;tv[1]=0;tv[2]=M.sin(u)*v;
		qrot(B,6,tv,0,tw,0);tw[2]/=M.max(1,M.abs(tw[2])/2);
		vaxis(bi, 30 + k, bv);
		for (m = 0; m < 3; m++) { B[p + 3 + m] = tw[m]; B[p + 6 + m] = bv[m]; }
		B[p + 9] = (0.3 + 0.7 * R(q, 5)) * (big ? 4 : 12) * 0.0174533;
	}
	for (m = 0; m < nb; m++) {
		p = 90 + m * 5; q = 20 + m; x = big && m === nb - 1;
		u = (m + R(q, 1) * (big ? 1 : 0.5)) / nb;
		B[p + 3] = x ? ld - 0.3 : (big ? ld : 1.5) * u;
		B[p + 4] = big ? 25 + 30 * R(q, 5) : 10 + 12.5 * R(q, 5);
		tv[0] = (x ? 0.05 : (big ? u : R(q, 2)) - 0.5) * 0.9 * T.len * s; tv[1]=T.height*s*.55;
		tv[2] = T.shield[2] * (R(q, 4) * 2 - 1) * 0.7 * s;
		ch.state(b.ship, b.t - ld + B[p + 3], so);
		qrot(so.q, 0, tv, 0, tw, 0);
		for (k = 0; k < 3; k++) B[p + k] = so.p[k] + tw[k];
	}
	for (i = 0; i < cu.length; i++) {
		tv[0]=cu[i]*s;tv[2]=0;tv[1]=T.height*s*.55;qrot(B,6,tv,0,tw,0);
		for (m = 0; m < 3; m++) B[190 + i * 3 + m] = B[m] + tw[m];
	}
}
function prep() {
	if (ready) return 1;
	var end = step + 48, tot = N + NB;
	while (step < end && step < tot) {
		if (step < N) shotPrep(step); else boomPrep(step - N);
		step++;
	}
	if (step >= tot) {
		if (step < tot + NK) { kPrep(step++ - tot); return 0; }
		waves(); ready = 1; return 1;
	}
	return 0;
}
var HK = [1, 0.85, 0.55, 1, 0.55, 0.18, 0.9, 0.35, 0.1, 0.5, 0.12, 0.05];
function heat(u) {
	var i = u < 0.4 ? 0 : u < 1 ? 3 : 6, k = i ? i > 3 ? M.min(1, (u - 1) / 1.5) : (u - 0.4) / 0.6 : u * 2.5, j;
	for (j = 0; j < 3; j++) hc[j] = lp(HK[i + j], HK[i + 3 + j], k);
}
function pm(n) { return n * MP; }
function cap(n) { n *= MP; return n > 30 ? 30 : n; }
function flash(x, y, z, a, d, rm, k) {
	if (a < 0 || a >= d) return;
	var f = 1 - a / d;
	pS(x, y, z, rm * (0.6 + 0.4 * f), 0.95, 0.95, 1, k * f, 0, 0.7, 0);
	pS(x, y, z, rm, 1, 1, 1, k * f * 0.8, 3, 0.9, 0);
}
// gas ball: radius rm at gt s, peak km, gone at dur s
function gas(x, y, z, a, rm, km, gt, dur) {
	var g, r, k, f;
	if (a < 0 || a >= dur) return;
	g = M.min(1, a / gt); r = rm * (0.12 + 0.88 * eo(g));
	f = 1 - a / dur; k = km * sstep(0, 0.15, a) * f * (0.3 + 0.7 * f);
	heat(a);
	pS(x, y, z, r, hc[0], hc[1], hc[2], k * 0.62, 4);
	pS(x, y, z, r * 0.55, hc[0], hc[1], hc[2], k * 0.38, 4);
}
// tumble axis: within 10 degrees of the vertical
function vaxis(bi, m, out) {
	var z = 1 - 0.0151922 * rnd(bi * 64 + m, 5), p = rnd(bi * 64 + m, 4) * 6.2832, r = M.sqrt(1 - z * z);
	out[0] = r * M.cos(p); out[1] = r * M.sin(p); out[2] = z;
}
function dirv(bi, m, out) {
	var z = rnd(bi * 64 + m, 5) * 2 - 1, p = rnd(bi * 64 + m, 4) * 6.2832, r = M.sqrt(1 - z * z);
	out[0] = r * M.cos(p); out[1] = r * M.sin(p); out[2] = z;
}
// one blast before a break: radius r metres, life lf s; ls = the large ship's last (kept dim)
function blast(x, y, z, ab, r, lf, ls) {
	var u = ab / lf, f = 1 - u, g = ab < 0.12 ? 1 : 1 - sstep(0.12, 0.45, ab), h = M.min(1, ab / 0.4), rc = M.min(ls ? 12 : 30, r * 0.5);
	if (u >= 1) return;
	pS(x, y, z, r * 3, 1, 0.6, 0.25, (ls ? 0.1 : 0.4) * sstep(0, 0.15, ab) * (1 - sstep(0.5, 1, u)), 4);
	pS(x, y, z, r * (0.55 + 0.45 * eo(M.min(1, ab / 0.25))), 1, 0.45, 0.1, (ls ? 0.25 : 0.85) * sstep(0, 0.06, ab) * (1 - sstep(0.45, 1, u)), 4);
	pS(x, y, z, r * 1.7, 1, 0.4, 0.08, (ls ? 0.12 : 0.45) * sstep(0, 0.08, ab) * f, 0, 0.5, 0);
	pS(x, y, z, rc, 1, lp(0.92, 0.55, h), lp(0.65, 0.12, h), (ls ? 0.4 : 0.9) * g * (ab < 0.12 ? 1 - ab * 3.2 : 0.6), 4);
}
function brk(F, j) {
	var B = BV[j], big = B[18] > 1, nb = B[14], ld = B[16], a = age(F.t, B[12] - ld), m, o, ab, x, y, z, ls;
	if (a >= ld + 3.6) return;
	for (m = 0; m < nb; m++) {
		o = 90 + m * 5; ab = a - B[o + 3];
		if (ab < 0 || ab >= 0.9) continue;
		x = B[o] + B[3] * ab; y = B[o + 1] + B[4] * ab; z = B[o + 2] + B[5] * ab;
		ls = big && m === nb - 1; blast(x, y, z, ab, B[o + 4], 0.5 + 0.4 * rnd(B[17] * 64 + m, 7), ls);
	}
	ab = a - ld;
	if (ab < 0 || ab >= 1.8) return;
	for (m = 0; m < B[15]; m++) {
		o = 190 + m * 3; x = B[o] + B[3] * ab; y = B[o + 1] + B[4] * ab; z = B[o + 2] + B[5] * ab;
		flash(x, y, z, ab, 0.06, cap(big ? 20 : 14), 0.7);
		gas(x, y, z, ab, big ? 60 : 30, big ? 0.25 : 0.35, 0.6, 1.8);
	}
}
function wreck(F, j) {
	var B = BV[j], tau = age(F.t, B[12]), E = B[13], np = B[10], ty = sh.types[B[11]], k, p, w, o, d;
	if (np < 1) return;
	if (tau >= E || fx.nw >= 8 || far(B[0] + B[3] * tau, B[1] + B[4] * tau, B[2] + B[5] * tau, ty.len * ty.scale + 25 * tau + 100, F)) return;
	o = fx.nw++ * 64; d = (E - tau) / 4;
	WW[o] = B[17]; WW[o + 1] = B[11]; WW[o + 2] = np; WW[o + 3] = d > 1 ? 1 : d; WW[o + 4] = core.clamp(1 - tau / 6, 0, 1); WW[o + 5] = F.tm[B[17]]; WW[o + 6] = WW[o + 7] = 0;
	for (k = 0; k < np; k++) {
		p = 20 + k * 10; w = o + 8 + k * 8;
		core.qaxis(B[p + 6], B[p + 7], B[p + 8], B[p + 9] * tau, ta, 0);
		core.qmul(ta, 0, B, 6, tq, 0);
		for (d = 0; d < 3; d++) tv[d] = B[p + d];
		qrot(B, 6, tv, 0, tw, 0);
		qrot(tq, 0, tv, 0, t2, 0);
		for (d = 0; d < 3; d++) { WW[w + d] = B[d] + tw[d] + (B[3 + d] + B[p + 3 + d]) * tau - t2[d]; WW[w + 4 + d] = tq[d]; }
		WW[w + 3] = 0; WW[w + 7] = tq[3];
	}
}
function boom(F, bi) {
	if (BKI[bi] >= 0) { brk(F, BKI[bi]); return; }
	var o = bi * 14, a = age(F.t, BC[o + 12]), sz = BC[o + 13], x, y, z, i, m, nb, ab, hl, am, nc, sp, k, f, g, R;
	if (a >= (sz ? 4.6 : 2.1)) return;
	x = BC[o] + BC[o + 3] * 0.5 * a; y = BC[o + 1] + BC[o + 4] * 0.5 * a; z = BC[o + 2] + BC[o + 5] * 0.5 * a;
	hl = BC[o + 10];
	if (sz === 0) {
		R = 22 * M.sqrt(hl / 30); R = pm(R < 24 ? 24 : R > 30 ? 30 : R);
		flash(x, y, z, a, 0.06, cap(14), 0.95);
		gas(x, y, z, a, R, 0.55, 0.5, 1.5);
		if (a < 1.2) {
			nc = 12 + ((rnd(bi, 3) * 8) | 0); if (F.tier === 0) nc >>= 1;
			g = a / 1.2; f = eo(g);
			for (m = 0; m < nc; m++) {
				dirv(bi, m, bv); sp = pm(30 + 40 * rnd(bi * 64 + m, 6)) * f;
				heat(a * 0.5); k = 0.6 * (1 - g * g);
				pS(x + bv[0] * sp, y + bv[1] * sp, z + bv[2] * sp, pm(1.3), hc[0], hc[1], hc[2], k, 2);
			}
		}
		return;
	}
	nb = 2 + ((rnd(bi, 20) * 3) | 0);
	for (m = 0; m < nb; m++) {
		ab = a - (0.15 + 1.2 * m / nb);
		if (ab < 0 || ab >= 2.5) continue;
		tv[0] = (rnd(bi * 8 + m, 21) * 2 - 1) * hl * 0.8; tv[1] = 0; tv[2] = (rnd(bi * 8 + m, 22) * 2 - 1) * hl * 0.15;
		qrot(BC, o + 6, tv, 0, tw, 0);
		flash(x + tw[0], y + tw[1], z + tw[2], ab, 0.05, cap(12), 0.9);
		gas(x + tw[0], y + tw[1], z + tw[2], ab, pm(18), 0.5 * (1 - sstep(1.5, 2.4, ab + 0.15 + 1.2 * m / nb)), 0.4, 2.5);
	}
	am = a - 1.5;
	if (am < 0) return;
	flash(x, y, z, am, 0.06, cap(30), 0.95);
	gas(x, y, z, am, pm(55 + 20 * rnd(bi, 8)), 0.5, 0.9, 2.5);
	if (am < 1.2) {
		g = am / 1.2; f = eo(g); R = pm(110) * f;
		pS(x, y, z, R / 0.9 + 1, 1, 0.7, 0.4, 0.25 * (1 - g), 1, 0.9, 0.07);
	}
	if (am < 3) {
		nc = 3 + ((rnd(bi, 7) * 4) | 0); if (F.tier === 0) nc = (nc + 1) >> 1;
		g = am / 3; f = eo(g);
		for (m = 0; m < nc; m++) {
			dirv(bi, m + 20, bv); sp = pm(40 + 50 * rnd(bi * 64 + m, 6)) * f;
			pS(x + bv[0] * sp, y + bv[1] * sp, z + bv[2] * sp, pm(1.8), lp(0.5, 1, 1 - g), lp(0.12, 0.4, 1 - g), lp(0.05, 0.12, 1 - g), 0.6 * (1 - g), 2);
		}
	}
}
function aim(si, s, o, j, n) {
	var f = n > 1 ? j / (n - 1) : 0, sx = lp(SC[o], SC[o + 3], f), sy = lp(SC[o + 1], SC[o + 4], f), ex = lp(SC[o + 6], SC[o + 9], f), ey = lp(SC[o + 7], SC[o + 10], f), dx, dy, l2, m;
	if (!s.hit) {
		dx = ex - sx; dy = ey - sy; l2 = ln(dx, dy, 0) || 1;
		m = SC[o + 13] * (rnd(si, 2) < 0.5 ? -1 : 1) / l2;
		ex -= dy * m; ey += dx * m;
	}
	ap[0] = sx; ap[1] = sy; ap[2] = lp(SC[o + 2], SC[o + 5], f); ap[3] = ex; ap[4] = ey; ap[5] = lp(SC[o + 8], SC[o + 11], f);
}
function laser(F, si, s, a, o, cn) {
	var n = s.n || 1, d = du(s), gap = SG[si], j, ab, sx, sy, sz, ex, ey, ez, dx, dy, dz, D, sp, dt, hd, tl, ux, uy, uz, f;
	var len, c = TC, i3 = F.tm[s.from] * 3, r, g, b;
	r = 0.5 + 0.5 * c[i3]; g = 0.5 + 0.5 * c[i3 + 1]; b = 0.5 + 0.5 * c[i3 + 2];
	for (j = 0; j < n; j++) {
		ab = a - j * gap;
		if (ab < 0) break;
		if (ab > d + 3) continue;
		aim(si, s, o, j, n);
		sx = ap[0]; sy = ap[1]; sz = ap[2]; ex = ap[3]; ey = ap[4]; ez = ap[5];
		dx = ex - sx; dy = ey - sy; dz = ez - sz; D = ln(dx, dy, dz) || 1;
		sp = D / d; dt = s.hit ? D : D + sp * 0.4;
		len = sp * 0.03; if (len < pm(6)) len = pm(6);
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
	var d = du(s), f, r, p, gx, gy, gz, ad, dx, dy, dz, D, k;
	if (a < d) {
		f = a / d; gx = lp(SC[o], SC[o + 3], f); gy = lp(SC[o + 1], SC[o + 4], f); gz = lp(SC[o + 2], SC[o + 5], f);
		r = pm(3 + 6 * f); p = 0.7 + 0.3 * M.sin(a * 20 + si);
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
		k = ad / 0.3; r = pm(20) * eo(k);
		pS(gx, gy, gz, r / 0.9 + 1, 0.7, 0.65, 1, 0.35 * (1 - k), 1, 0.9, 0.08);
	}
	if (ad < 0.6) {
		dx = SC[o + 6] - gx; dy = SC[o + 7] - gy; dz = SC[o + 8] - gz; D = ln(dx, dy, dz);
		if (D > 1) {
			k = pm(300) / D + 1;
			pL(gx, gy, gz, gx + dx * k, gy + dy * k, gz + dz * k, pm(3.5), 0.6, 0.55, 0.5, 1, 0.4, 0.35, 0.8, 0.55 * M.pow(1 - ad / 0.6, 1.5));
		}
	}
	if (s.hit && ad < 0.06) flash(SC[o + 6], SC[o + 7], SC[o + 8], ad, 0.06, cap(6), 0.9);
}
function bz(u, a, b, c, d, e, f, g, h, i) {
	var v = 1 - u, p = v * v, q = 2 * u * v, r = u * u;
	bv[0] = p * a + q * d + r * g; bv[1] = p * b + q * e + r * h; bv[2] = p * c + q * f + r * i;
}
function rpos(ab, d) {
	var e = ab > d ? ab - d : 0;
	if (ab < 0) ab = 0;
	bz(ab > d ? 1 : ab / d, rk[0], rk[1], rk[2], rk[3], rk[4], rk[5], rk[6], rk[7], rk[8]);
	bv[0] += rk[9] * e; bv[1] += rk[10] * e; bv[2] += rk[11] * e;
}
function rocket(si, s, a, o) {
	var n = s.n || 1, d = du(s), j, ab, f, gx, gy, gz, tx, ty, tz, dx, dy, dz, l2, D, off, cx, cy, cz, e, fb, tf, x, y, z, ai, g;
	for (j = 0; j < n; j++) {
		ab = a - j * 0.09;
		if (ab < 0) break;
		if (ab > d + 1.4) continue;
		f = n > 1 ? j / (n - 1) : 0;
		gx = lp(SC[o], SC[o + 3], f); gy = lp(SC[o + 1], SC[o + 4], f); gz = lp(SC[o + 2], SC[o + 5], f);
		tx = lp(SC[o + 6], SC[o + 9], f); ty = lp(SC[o + 7], SC[o + 10], f); tz = lp(SC[o + 8], SC[o + 11], f);
		dx = tx - gx; dy = ty - gy; dz = tz - gz;
		l2 = ln(dx, dy, 0) || 1; D = ln(l2, dz, 0) || 1;
		off = D * (0.06 + 0.06 * rnd(si * 16 + j, 4)) * ((j & 1) ? 1 : -1);
		cx = (gx + tx) / 2 - dy / l2 * off; cy = (gy + ty) / 2 + dx / l2 * off; cz = (gz + tz) / 2;
		rk[0] = gx; rk[1] = gy; rk[2] = gz; rk[3] = cx; rk[4] = cy; rk[5] = cz; rk[6] = tx; rk[7] = ty; rk[8] = tz;
		rk[9] = 2 * (tx - cx) / d; rk[10] = 2 * (ty - cy) / d; rk[11] = 2 * (tz - cz) / d;
		e = s.hit ? d : d + 0.5;
		if (ab < e) {
			fb = ab > d ? 1 - (ab - d) / 0.5 : 1;
			rpos(ab, d); x = bv[0]; y = bv[1]; z = bv[2];
			rpos(ab - pm(10) * d / D, d);
			pL(x, y, z, bv[0], bv[1], bv[2], pm(2.2), 1, 1, 0.85, 0.6, 1, 0.5, 0.2, 0.9 * fb);
			pS(x, y, z, pm(3), 1, 0.9, 0.7, 0.9 * fb, 2);
			pS(x, y, z, pm(8), 1, 0.55, 0.25, 0.5 * fb, 0, 0.4, 0);
		}
		if (ab < e + 0.8) {
			tf = ab > d ? 1 - (ab - d) / (e - d + 0.8) : 1;
			rpos(ab < e ? ab : e, d); x = bv[0]; y = bv[1]; z = bv[2];
			rpos(ab - 0.8, d);
			pL(x, y, z, bv[0], bv[1], bv[2], pm(1.6), 0.9, 0.8, 0.6, 0.45, 0.5, 0.35, 0.25, 0.4 * tf);
		}
		if (s.hit && ab >= d && ab < d + 0.4) {
			ai = ab - d; g = ai / 0.4;
			flash(tx, ty, tz, ai, 0.1, cap(10), 0.9);
			pS(tx, ty, tz, pm(3 + 21 * (eo(g))), 1, 0.6, 0.3, 0.6 * (1 - g), 1, 0.85, 0.08);
		}
	}
}
function build(F) {
	var t = F.t, i, j, n = F.n, dd, s, a, o, ty, es, en, ds, al, thr, len, x, y, z, w, c, k, bs, b, ar, lc, ar2;
	nl = 0; ns = 0; fx.nw = 0;
	TC = F.team; MP = F.mpp > 0 ? F.mpp : 1.9;
	for (i = 0; i < n; i++) {
		if (!(F.V[i] > 0)) continue;
		ty = sh.types[F.ty[i]]; es = ty.engines; ds = F.DS[i]; al = F.AL[i];
		if (far(F.P[i * 3], F.P[i * 3 + 1], F.P[i * 3 + 2], (26.4 * RM[F.ty[i]] + 0.5 * ty.len) * ds * 1.2, F)) continue;
		thr = M.pow(core.clamp(F.TH[i], 0, 1), 0.8);
		qrot(F.Q, i * 4, DX, 0, t2, 0);
		for (j = 0; j < es.length; j++) {
			en = es[j]; wp(F.P, F.Q, i, en.p, ds);
			x = wv[0]; y = wv[1]; z = wv[2];
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
	for (i = 0; i < N; i++) {
		s = ch.shots[i]; a = age(t, s.t0);
		if (a > s.dur + (s.n || 1) * 0.2 + 3) continue;
		o = i * 14;
		if (SC[o + 12] === 0) continue;
		if (s.kind === 0) laser(F, i, s, a, o, 0);
		else if (s.kind === 1) rail(i, s, a, o);
		else if (s.kind === 2) rocket(i, s, a, o);
		else laser(F, i, s, a, o, 1);
	}
	for (i = 0; i < NB; i++) boom(F, i);
	for (i = 0; i < NK; i++) wreck(F, i);
	for (i = 0; i < WC.length; i++) {
		c = WC[i]; if (!(F.V[c] > 0)) continue;
		a = age(t, WS[i]); dd = WE[i] - WS[i];
		if (a >= dd) continue;
		k = dd >= 60 ? 0.5 : 0.5 * sstep(0, 0.4, a) * sstep(0, 0.4, dd - a);
		ds = F.DS[c]; b = (sh.types[F.ty[c]].bays || [])[WB[i]];
		if (b) {
			wp(F.P, F.Q, c, b.p, ds);
			qrot(F.Q, c * 4, b.d, 0, t2, 0);
			pS(wv[0] + t2[0] * 4, wv[1] + t2[1] * 4, wv[2] + t2[2] * 4, pm(12 * ds / 1.32), 1, 0.98, 0.92, k * 0.6, 4);
			pS(wv[0], wv[1], wv[2], pm(5), 1, 0.98, 0.92, k * 0.4, 4);
		}
	}
	ar = ch.arrivals || [];
	for (i = 0; i < ar.length; i++) {
		a = age(t, ar[i].t);
		c = ar[i].ship;
		if (a >= 1.5 || !(F.V[c] > 0)) continue;
		k = sstep(0, 0.15, a); ds = F.DS[c]; ty = sh.types[F.ty[c]]; es = ty.engines;
		qrot(F.Q, c * 4, DX, 0, t2, 0);
		dd = ty.len * ds * 0.4; ar2 = 0.7 * k * (1 - sstep(0.4, 1.5, a));
		bs = 0.45 * k * (1 - sstep(0.5, 1.5, a)); if (bs > 0.7 / es.length) bs = 0.7 / es.length;
		for (j = 0; j < es.length; j++) {
			en = es[j]; wp(F.P, F.Q, c, en.p, ds);
			x = wv[0]; y = wv[1]; z = wv[2];
			w = en.r * ds * 0.9; if (w > pm(2.5)) w = pm(2.5);
			pL(x, y, z, x + t2[0] * dd, y + t2[1] * dd, z + t2[2] * dd, w, 0.9, 0.85, 0.85, 1, 0.3, 0.3, 0.7, ar2);
			pS(x, y, z, pm(10), 0.85, 0.8, 1, bs, 4);
			if (a < 0.3) pS(x, y, z, pm(4), 1, 1, 1, 0.9 * (1 - a / 0.3), 3, 0.8, 0);
		}
	}
	fx.nl = nl; fx.ns = ns;
}
O81B.fx = fx;
})();
