/* (c) 2026 Andrius Bubliauskas. All rights reserved.
   The Orchestration page of orion-81.io 3.0.0 (contract O): navigation for the 15 slides. Classic script, no library, no network request, nothing stored.
   The page is complete without it: the slides follow one another down the page as real text, and every old fragment (#loop, #stands and so on) is a real id.
   What it adds:
   - the current slide (aria-current="true" on the slide) and the counter "Slide N of 15" (the one that most recently passed the reading line)
   - the arrow keys (Left and Right; Home and End inside the slide area), the Previous and Next buttons, and swipe on touch screens
   - full screen: one slide at a time, fitted to the screen (the Fullscreen API where the browser has it, a fixed layer everywhere)
   Movement is a plain jump (no smooth scrolling), so the page is the same for a reader who asked for less motion. */
(function () {
  'use strict';

  var stage = document.querySelector('[data-o81-slides]');
  if (!stage) return;
  var doc = document.documentElement;
  var slides = [].slice.call(stage.querySelectorAll('[data-o81-slide]'));
  if (!slides.length) return;
  var frames = slides.map(function (s) { return s.closest('.og-frame') || s; });
  var count = stage.querySelector('[data-o81-slide-count]');
  var prevB = stage.querySelector('[data-o81-prev]');
  var nextB = stage.querySelector('[data-o81-next]');
  var fsB = stage.querySelector('[data-o81-fullscreen]');
  var bar = stage.querySelector('.og-bar');
  var cur = 0;
  var lockUntil = 0;
  var full = false;
  var nativeFull = false;
  var ticking = false;

  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }

  function setCurrent(i) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    for (var k = 0; k < slides.length; k++) {
      if (k === cur) slides[k].setAttribute('aria-current', 'true'); else slides[k].removeAttribute('aria-current');
    }
    if (count) count.textContent = 'Slide ' + (cur + 1) + ' of ' + slides.length;
    if (full) for (var j = 0; j < frames.length; j++) frames[j].classList.toggle('og-away', j !== cur);
  }

  function barsBottom() {
    var h = 0;
    var sb = document.querySelector('.site-bar');
    if (sb) h += sb.getBoundingClientRect().height;
    if (bar && !full) h += bar.getBoundingClientRect().height;
    return h;
  }

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    setCurrent(i);
    lockUntil = now() + 300;
    if (full) { stage.scrollTop = 0; return; }
    frames[i].scrollIntoView({ block: 'start' });
  }

  /* the slide that most recently passed the reading line, as the page is scrolled */
  function fromScroll() {
    ticking = false;
    if (full || now() < lockUntil) return;
    var top = barsBottom();
    var line = top + (window.innerHeight - top) * 0.35;
    var pick = 0;
    for (var k = 0; k < frames.length; k++) {
      if (frames[k].getBoundingClientRect().top <= line) pick = k; else break;
    }
    if (pick !== cur) setCurrent(pick);
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    if (window.requestAnimationFrame) window.requestAnimationFrame(fromScroll); else fromScroll();
  }

  /* ---- full screen */
  function enterFull() {
    if (full) return;
    full = true;
    stage.classList.add('is-full');
    doc.classList.add('og-full');
    if (fsB) fsB.setAttribute('aria-pressed', 'true');
    setCurrent(cur);
    stage.scrollTop = 0;
    try {
      if (stage.requestFullscreen) {
        var p = stage.requestFullscreen();
        nativeFull = true;
        if (p && p.catch) p.catch(function () { nativeFull = false; });
      }
    } catch (e) { nativeFull = false; }
    try { stage.focus({ preventScroll: true }); } catch (e2) { /* ignore */ }
  }
  function exitFull() {
    if (!full) return;
    full = false;
    stage.classList.remove('is-full');
    doc.classList.remove('og-full');
    if (fsB) fsB.setAttribute('aria-pressed', 'false');
    for (var j = 0; j < frames.length; j++) frames[j].classList.remove('og-away');
    if (nativeFull && document.fullscreenElement && document.exitFullscreen) {
      try { var p = document.exitFullscreen(); if (p && p.catch) p.catch(function () {}); } catch (e) { /* ignore */ }
    }
    nativeFull = false;
    lockUntil = now() + 600;
    /* the page was held still behind the full-screen layer: bring the current slide back to the top (again once the browser has left full screen) */
    frames[cur].scrollIntoView({ block: 'start' });
    window.setTimeout(function () { if (!full) frames[cur].scrollIntoView({ block: 'start' }); }, 150);
  }

  /* ---- keys */
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var t = e.target;
    if (full && e.key === 'Escape') { exitFull(); return; }
    if (t && t.closest && t.closest('.site-bar, input, select, textarea, [contenteditable="true"]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    else if ((e.key === 'Home' || e.key === 'End') && t && stage.contains(t)) { e.preventDefault(); go(e.key === 'Home' ? 0 : slides.length - 1); }
  });

  /* ---- buttons */
  if (prevB) prevB.addEventListener('click', function () { go(cur - 1); });
  if (nextB) nextB.addEventListener('click', function () { go(cur + 1); });
  if (fsB) fsB.addEventListener('click', function () { if (full) exitFull(); else enterFull(); });
  document.addEventListener('fullscreenchange', function () { if (full && nativeFull && !document.fullscreenElement) { nativeFull = false; exitFull(); } });

  /* ---- swipe: a mostly horizontal drag of at least 48 px; a vertical drag is the page scrolling */
  var sx = 0, sy = 0, lx = 0, ly = 0, touching = false;
  stage.addEventListener('touchstart', function (e) {
    if (!e.touches || e.touches.length !== 1) { touching = false; return; }
    touching = true;
    sx = lx = e.touches[0].clientX;
    sy = ly = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchmove', function (e) {
    if (!touching || !e.touches || !e.touches.length) return;
    lx = e.touches[0].clientX;
    ly = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (!touching) return;
    touching = false;
    var t = e.changedTouches && e.changedTouches[0];
    var x = t ? t.clientX : lx, y = t ? t.clientY : ly;
    var dx = x - sx, dy = y - sy;
    if (Math.abs(dx) < 48 && t) { dx = lx - sx; dy = ly - sy; }
    if (Math.abs(dx) >= 48 && Math.abs(dx) > 1.6 * Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
  stage.addEventListener('touchcancel', function () { touching = false; }, { passive: true });

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- a fragment (an old Orchestration address such as #loop or #stands) names a slide: that slide is the current one */
  function fromHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    var s = el && el.closest ? el.closest('[data-o81-slide]') : null;
    if (!s && el) s = el.querySelector ? el.querySelector('[data-o81-slide]') : null;
    var i = s ? slides.indexOf(s) : -1;
    if (i >= 0) { setCurrent(i); lockUntil = now() + 300; }
  }
  window.addEventListener('hashchange', fromHash);

  setCurrent(0);
  fromHash();
})();
