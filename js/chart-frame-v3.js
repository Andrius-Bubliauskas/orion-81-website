/* (c) 2026 Andrius Bubliauskas. All rights reserved.
   orion-81.io 3.0.0, the theme bridge of the two generated pages (devlog/progress.html and devlog/agent-provenance.html).
   Classic script, no library, no network request. It adds to the pages and never carries them.
   Each page keeps its own theme switch exactly as published in 2.8.3 (the chart's "Theme" button, the graph's "Theme: auto / light / dark" button).
   The site's switch in the top bar (#o81-theme) sits beside it. The chart and the graph draw their colours from their own switch, so the site's
   button does not set the theme itself: it presses the page's own switch, so both agree and the canvas or SVG is redrawn by the page's own code.
   - the site button: toggles light and dark (aria-pressed says whether the light theme is on), and stores the visitor's choice (the one stored key)
   - the page's own switch: its choice is mirrored on the site button and stored the same way
   - the pages load no site.js: they keep their own full-height layout and their own switch; this file only adds the class that shows the theme button
   - a stored light theme is applied on load by pressing the page's own switch once (the page itself starts dark) */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');   /* the theme button is shown only when a script runs (base.css) */
  var site = document.getElementById('o81-theme');
  var chart = document.getElementById('bTheme');   /* the chart's own switch: dark <-> light */
  var graph = document.getElementById('theme');    /* the graph's own switch: auto -> light -> dark -> auto */
  var own = chart || graph;
  if (!site || !own) return;

  function current() {
    var t = doc.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }
  function mirror() { site.setAttribute('aria-pressed', current() === 'light' ? 'true' : 'false'); }
  function save(t) { try { window.localStorage.setItem('o81-theme', t); } catch (e) { /* storage may be blocked: the choice then lasts for this page */ } }

  /* put the page into t ('light' or 'dark') by pressing its own switch; the graph's switch has three states, so press until it names t */
  function setTheme(t) {
    if (chart) {
      if (current() !== t) chart.click();
    } else {
      for (var i = 0; i < 3 && own.textContent.indexOf('Theme: ' + t) !== 0; i++) own.click();
    }
  }

  /* the page's own switch was pressed (by the visitor or by this script): mirror it and keep it */
  own.addEventListener('click', function () {
    window.setTimeout(function () {
      var t = doc.getAttribute('data-theme');
      if (t === 'light' || t === 'dark') save(t);
      mirror();
    }, 0);
  });

  /* the site button: registered before site.js adds its own handler (that runs at DOMContentLoaded), and stops it, so the page's switch decides */
  site.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var next = current() === 'light' ? 'dark' : 'light';
    setTheme(next);
    save(next);
    mirror();
  }, true);

  var saved = null;
  try { saved = window.localStorage.getItem('o81-theme'); } catch (e) { saved = null; }
  if (saved === 'light') setTheme('light');
  mirror();
})();
