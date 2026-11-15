/* (c) 2026 Andrius Bubliauskas. All rights reserved.
   Epic Jam 2026, the Full devlog page (website 3.5.0): search, the team filter, open and close all, and opening the entry
   a link points to. Classic script, no storage, no network requests. Without it the page shows every entry, folded. */
(function () {
  'use strict';

  var tools = document.getElementById('fd-tools');
  if (!tools) return;
  var entries = [].slice.call(document.querySelectorAll('.fd-entry'));
  var days = [].slice.call(document.querySelectorAll('.fd-day'));
  var q = document.getElementById('fd-q');
  var count = document.getElementById('fd-count');
  var chips = [].slice.call(tools.querySelectorAll('.fd-chip'));
  var texts = entries.map(function (e) { return e.textContent.toLowerCase().replace(/\s+/g, ' '); });
  var crew = entries.map(function (e) { return (e.getAttribute('data-people') || '').split(' ').filter(Boolean); });

  function apply() {
    var words = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var want = chips.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; })
      .map(function (c) { return c.getAttribute('data-person'); });
    var shown = 0;
    entries.forEach(function (e, i) {
      var ok = words.every(function (w) { return texts[i].indexOf(w) !== -1; }) &&
        (want.length === 0 || want.some(function (p) { return crew[i].indexOf(p) !== -1; }));
      e.hidden = !ok;
      if (ok) shown++;
    });
    days.forEach(function (d) { d.hidden = !d.querySelector('.fd-entry:not([hidden])'); });
    count.textContent = shown === entries.length ? entries.length + ' entries'
      : shown === 0 ? 'No entries match. Clear the search or the team filter.'
      : 'Showing ' + shown + ' of ' + entries.length;
  }

  function openTarget() {
    var id = location.hash.slice(1);
    var el = id ? document.getElementById(id) : null;
    if (el && el.classList.contains('fd-entry')) {
      el.hidden = false;
      el.parentNode.parentNode.hidden = false;
      el.open = true;
      el.scrollIntoView();
    }
  }

  var timer;
  q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(apply, 120); });
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      apply();
    });
  });
  document.getElementById('fd-open').addEventListener('click', function () {
    entries.forEach(function (e) { if (!e.hidden) e.open = true; });
  });
  document.getElementById('fd-close').addEventListener('click', function () {
    entries.forEach(function (e) { e.open = false; });
  });
  window.addEventListener('hashchange', openTarget);

  tools.hidden = false;
  apply();
  openTarget();
})();
