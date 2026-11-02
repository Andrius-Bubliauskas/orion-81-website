/* (c) 2026 Andrius Bubliauskas. All rights reserved.
   orion-81.io 3.0.0, the shared page script (DESIGN.md section 6 and section 7). Classic script, no library, no network request.
   It adds to the pages and never carries them: every page reads and works without it, and the page is complete with no script.
   - the theme switch (dark is the default; the one stored key is the visitor's choice of the light theme)
   - the height of the top bar (it wraps onto a second row on a narrow screen)
   - the contents bar and the "Jump to" menu (the section whose heading most recently passed the top of the reading area is marked)
   - the devlog's Show all and Collapse all controls
   - the road: the current milestone is open; a node opens by click, Enter and Space; at 900 px and wider one readout panel under the rail
   - the gauge arcs (the arc sweeps once, over --dur-gauge, when it first comes into view; the final state is already in the page)
   - the reveals (an IntersectionObserver fallback where animation-timeline is not supported)
   - a same-document View Transition cross-fade for what the reader changes (the theme, the test table, Show all, Collapse all), skipped under
     reduced motion and where the browser has none. */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');
  var reducedMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reducedNow() { return !!(reducedMq && reducedMq.matches); }

  /* a change the reader makes, as a cross-fade where the browser offers one (and the reader has not asked for less motion) */
  function transition(fn) {
    if (!reducedNow() && document.startViewTransition) {
      try {
        var vt = document.startViewTransition(fn);
        /* a transition that a newer one skips rejects these promises: that is not an error (the page update still ran) */
        var quiet = function () {};
        if (vt) { ['ready', 'finished', 'updateCallbackDone'].forEach(function (k) { if (vt[k] && vt[k].catch) vt[k].catch(quiet); }); }
        return;
      } catch (e) { /* fall through */ }
    }
    fn();
  }
  window.o81Transition = transition;

  /* ---- theme: set before the first paint */
  function savedTheme() {
    try { return window.localStorage.getItem('o81-theme') === 'light' ? 'light' : 'dark'; } catch (e) { return 'dark'; }
  }
  /* the button keeps one name ("Light theme"); aria-pressed says whether the light theme is on */
  function applyTheme(t) {
    doc.setAttribute('data-theme', t);
    var b = document.getElementById('o81-theme');
    if (b) b.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
  }
  applyTheme(savedTheme());

  function cues(el) {
    var max = el.scrollWidth - el.clientWidth;
    el.classList.toggle('can-l', el.scrollLeft > 2);
    el.classList.toggle('can-r', el.scrollLeft < max - 2);
  }

  function ready() {
    /* theme button */
    applyTheme(doc.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    var tb = document.getElementById('o81-theme');
    if (tb) {
      tb.addEventListener('click', function () {
        var next = doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        try { window.localStorage.setItem('o81-theme', next); } catch (e) { /* storage may be blocked: the choice then lasts for this page */ }
        transition(function () { applyTheme(next); });
      });
    }

    /* the top bar: its height (one row, or two on a narrow screen) is what the sticky bars and the anchors keep clear of */
    var bar = document.querySelector('.site-bar');
    if (bar) {
      var measure = function () {
        var h = Math.round(bar.getBoundingClientRect().height);
        if (h > 0) doc.style.setProperty('--bar-h', h + 'px');
      };
      measure();
      if (window.ResizeObserver) new ResizeObserver(measure).observe(bar); else window.addEventListener('resize', measure);
    }

    /* contents bar and Jump to menu */
    var toc = document.querySelector('nav.toc');
    if (toc) {
      var det = toc.querySelector('details');
      var list = toc.querySelector('ul');
      var links = [].slice.call(toc.querySelectorAll('a[href^="#"]'));
      var wide = window.matchMedia('(min-width: 900px)');
      /* from 1200 px the strip wraps to a second row (css/components.css), so the sticky bar's height, which anchors keep clear of, is measured, not assumed */
      var tocMeasure = function () {
        if (!wide.matches) { doc.style.removeProperty('--toc-h'); return; }
        var th = Math.round(toc.getBoundingClientRect().height);
        if (th > 0) doc.style.setProperty('--toc-h', th + 'px');
      };
      var sync = function () { if (det) det.open = wide.matches; cues(list); tocMeasure(); };
      if (wide.addEventListener) wide.addEventListener('change', sync); else if (wide.addListener) wide.addListener(sync);
      sync();
      if (window.ResizeObserver) new ResizeObserver(tocMeasure).observe(toc); else window.addEventListener('resize', tocMeasure);
      list.addEventListener('scroll', function () { cues(list); }, { passive: true });
      links.forEach(function (a) {
        a.addEventListener('click', function () { if (!wide.matches && det) det.open = false; });
      });
      /* the heading of each section: the one that most recently passed the top of the reading area marks its link */
      var heads = links.map(function (a) {
        var s = document.getElementById(a.getAttribute('href').slice(1));
        return s ? (s.matches('h1, h2, h3') ? s : (s.querySelector('h1, h2, h3') || s)) : null;
      });
      var ticking = false;
      var spy = function () {
        ticking = false;
        var pad = parseFloat(getComputedStyle(doc).scrollPaddingTop) || 0;
        var line = pad + Math.max(0, window.innerHeight - pad) * 0.3;
        var active = -1;
        for (var i = 0; i < heads.length; i++) {
          if (heads[i] && heads[i].getBoundingClientRect().top <= line) active = i;
        }
        if (window.innerHeight + window.pageYOffset >= doc.scrollHeight - 2 && heads.length) active = heads.length - 1;
        links.forEach(function (a, i) {
          if (i === active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
        if (active >= 0 && wide.matches) {
          var a = links[active];
          var want = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
          if (a.offsetLeft < list.scrollLeft || a.offsetLeft + a.offsetWidth > list.scrollLeft + list.clientWidth) list.scrollLeft = Math.max(0, want);
        }
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(spy); } }, { passive: true });
      window.addEventListener('resize', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(spy); } });
      spy();
    }

    /* the devlog's Show all and Collapse all */
    var tools = document.querySelector('.pg-tools');
    var showAll = document.getElementById('o81-show-all');
    var collapse = document.getElementById('o81-collapse-all');
    var entries = function () { return [].slice.call(document.querySelectorAll('#o81-log details.pg-more')); };
    if (tools && showAll && collapse && entries().length) {
      tools.hidden = false;
      var state = function () { showAll.setAttribute('aria-expanded', entries().every(function (d) { return d.open; }) ? 'true' : 'false'); };
      showAll.addEventListener('click', function () { transition(function () { entries().forEach(function (d) { d.open = true; }); state(); }); });
      collapse.addEventListener('click', function () { transition(function () { entries().forEach(function (d) { d.open = false; }); state(); }); });
      entries().forEach(function (d) { d.addEventListener('toggle', state); });
    }

    /* the road (DESIGN.md section 7.5). With no script it is the ordered list with every node's heading, status and text visible.
       With script each heading gets a button (inside the h3, which stays a heading) with aria-expanded and aria-controls, and the current
       milestone is open. At 900 px and wider the nodes are a rail and the selected node's text is shown in one readout panel under it
       (one node at a time); below 900 px each node opens in place. */
    var road = document.querySelector('#road ol');
    if (road) {
      var wideRoad = window.matchMedia('(min-width: 900px)');
      var items = [].slice.call(road.children).map(function (li, i) {
        var node = li.querySelector('.pg-node');
        var h = node.querySelector('h3');
        var p = node.querySelector('p');
        if (!p.id) p.id = 'o81-road-' + i;
        h.id = h.id || 'o81-road-h-' + i;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pg-node-btn';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', p.id);
        while (h.firstChild) btn.appendChild(h.firstChild);
        h.appendChild(btn);
        return { li: li, node: node, h: h, p: p, btn: btn, kind: li.classList.contains('is-done') ? 'done' : (li.classList.contains('is-now') ? 'now' : 'later') };
      });
      var nowAt = 0;
      items.forEach(function (it, i) { if (it.kind === 'now') nowAt = i; });
      var sel = nowAt;
      var open = items.map(function (it, i) { return i === nowAt; });
      var panel = document.createElement('div');
      panel.id = 'o81-road-readout';
      panel.className = 'pg-readout';
      panel.setAttribute('role', 'region');
      var centre = function () {
        if (!wideRoad.matches || road.scrollWidth <= road.clientWidth) return;
        var it = items[sel];
        road.scrollLeft = Math.max(0, it.li.offsetLeft - (road.clientWidth - it.li.offsetWidth) / 2);
      };
      /* A node that is only partly in the rail is scrolled fully into view when it is selected (instant, no smooth scrolling).
         It is centred, which is where the rail's scroll-snap (align: center) would settle a nearer position anyway; the ends of the rail clamp. */
      var reveal = function () {
        if (!wideRoad.matches || road.scrollWidth <= road.clientWidth) return;
        var it = items[sel];
        var l = it.li.offsetLeft - road.scrollLeft, r = l + it.li.offsetWidth;
        if (l < 0 || r > road.clientWidth) centre();
      };
      var render = function () {
        var rail = wideRoad.matches;
        if (rail) {
          if (!panel.parentNode) road.parentNode.insertBefore(panel, road.nextSibling);
          panel.setAttribute('aria-labelledby', items[sel].h.id);
          panel.setAttribute('data-kind', items[sel].kind);
        }
        items.forEach(function (it, i) {
          var on = rail ? i === sel : open[i];
          if (rail && on) { if (it.p.parentNode !== panel) panel.appendChild(it.p); }
          else if (it.p.parentNode !== it.node) it.node.appendChild(it.p);
          it.p.hidden = !on;
          it.btn.setAttribute('aria-expanded', on ? 'true' : 'false');
          it.li.classList.toggle('is-open', on);
        });
        if (!rail && panel.parentNode) panel.parentNode.removeChild(panel);
      };
      items.forEach(function (it, i) {
        it.btn.addEventListener('click', function () {
          if (wideRoad.matches) sel = i; else open[i] = !open[i];
          render();
          reveal();
        });
      });
      road.addEventListener('keydown', function (e) {
        var i = items.map(function (it) { return it.btn; }).indexOf(document.activeElement);
        if (i < 0 || e.altKey || e.ctrlKey || e.metaKey) return;
        var n = -1;
        if (e.key === 'ArrowRight' || (e.key === 'ArrowDown' && !wideRoad.matches)) n = Math.min(i + 1, items.length - 1);
        else if (e.key === 'ArrowLeft' || (e.key === 'ArrowUp' && !wideRoad.matches)) n = Math.max(i - 1, 0);
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = items.length - 1;
        if (n >= 0) { e.preventDefault(); items[n].btn.focus(); }
      });
      var relayout = function () { render(); centre(); };
      if (wideRoad.addEventListener) wideRoad.addEventListener('change', relayout); else if (wideRoad.addListener) wideRoad.addListener(relayout);
      relayout();
    }

    /* gauges: the arc follows the numbers in the page; it sweeps once on first view, over --dur-gauge */
    var gauges = [].slice.call(document.querySelectorAll('svg.gauge'));
    gauges.forEach(function (g) {
      var nums = g.parentNode.querySelectorAll('[data-o81-stat]');
      if (nums.length < 2) return;
      var a = parseFloat(nums[0].textContent.replace(/,/g, '')), b = parseFloat(nums[1].textContent.replace(/,/g, ''));
      var v = g.querySelector('.val');
      if (v && b > 0 && a >= 0) v.setAttribute('stroke-dasharray', Math.min(100, Math.round(a / b * 1000) / 10) + ' 100');
    });
    if (gauges.length && !reducedNow() && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
      var dur = parseFloat(getComputedStyle(doc).getPropertyValue('--dur-gauge')) || 700;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          var v = en.target.querySelector('.val');
          if (v) v.animate([{ strokeDasharray: '0 100' }, { strokeDasharray: v.getAttribute('stroke-dasharray') }], { duration: dur, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
          io.unobserve(en.target);
        });
      }, { threshold: 0.6 });
      gauges.forEach(function (g) { io.observe(g); });
    }

    /* reveals: CSS scroll-driven (animation-timeline: view()) where the browser has it; otherwise they fade in and rise 8 px when 15% in view */
    var viewOk = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
    if (!viewOk && !reducedNow() && 'IntersectionObserver' in window) {
      var rv = [].slice.call(document.querySelectorAll('.rv'));
      if (rv.length) {
        var rio = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (!en.isIntersecting) return;
            en.target.classList.add('is-in');
            rio.unobserve(en.target);
          });
        }, { threshold: 0.15 });
        doc.classList.add('rv-io');
        rv.forEach(function (e) { rio.observe(e); });
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
