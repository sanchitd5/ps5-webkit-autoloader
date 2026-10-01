(function () {
  'use strict';

  var grid = document.getElementById('grid');
  var status = document.getElementById('status');
  var viewer = document.getElementById('viewer');
  var frame = document.getElementById('frame');
  var closeBtn = document.getElementById('close');
  var lastFocus = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  // Only allow http(s) and relative targets; blocks javascript: etc.
  function safeUrl(url) {
    return typeof url === 'string' && !/^\s*(javascript|data|vbscript):/i.test(url);
  }

  function makeIcon(p) {
    var img = el('img', 'icon');
    img.alt = '';
    img.onerror = function () {
      var f = el('div', 'icon fallback', (p.name || '?').charAt(0).toUpperCase());
      if (img.parentNode) img.parentNode.replaceChild(f, img);
    };
    if (p.icon) img.src = p.icon; else img.onerror();
    return img;
  }

  function makeCard(p) {
    var a = el('a', 'card');
    a.href = p.target;
    a.setAttribute('role', 'listitem');
    a.setAttribute('data-id', p.id || '');
    a.appendChild(makeIcon(p));
    a.appendChild(el('h2', 'name', p.name));
    a.appendChild(el('p', 'desc', p.description || ''));
    if (p.type === 'embed') {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openViewer(p.target);
      });
    }
    return a;
  }

  function render(plugins) {
    var valid = plugins.filter(function (p) {
      return p && p.name && safeUrl(p.target);
    });
    valid.forEach(function (p) { grid.appendChild(makeCard(p)); });
    status.textContent = valid.length ? '' : 'No plugins installed.';
    var first = grid.querySelector('.card');
    if (first) first.focus();
  }

  function openViewer(url) {
    lastFocus = document.activeElement;
    frame.src = url;
    viewer.hidden = false;
    closeBtn.focus();
  }

  function closeViewer() {
    viewer.hidden = true;
    frame.src = 'about:blank';
    if (lastFocus) lastFocus.focus();
  }

  closeBtn.addEventListener('click', closeViewer);

  // Spatial arrow-key navigation across the card grid.
  function center(e) {
    return { x: e.offsetLeft + e.offsetWidth / 2, y: e.offsetTop + e.offsetHeight / 2 };
  }

  function neighbour(cards, cur, dir) {
    var c = center(cur), best = null, bestScore = Infinity;
    cards.forEach(function (n) {
      if (n === cur) return;
      var p = center(n), dx = p.x - c.x, dy = p.y - c.y, score;
      if (dir === 'ArrowRight' && dx > 10 && Math.abs(dy) < 10) score = dx;
      else if (dir === 'ArrowLeft' && dx < -10 && Math.abs(dy) < 10) score = -dx;
      else if (dir === 'ArrowDown' && dy > 10) score = dy * 1000 + Math.abs(dx);
      else if (dir === 'ArrowUp' && dy < -10) score = -dy * 1000 + Math.abs(dx);
      else return;
      if (score < bestScore) { bestScore = score; best = n; }
    });
    return best;
  }

  document.addEventListener('keydown', function (e) {
    var key = e.key || '';
    if (!viewer.hidden) {
      if (key === 'Escape' || key === 'Backspace') { e.preventDefault(); closeViewer(); }
      return;
    }
    if (key.indexOf('Arrow') !== 0) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
    if (!cards.length) return;
    e.preventDefault();
    var cur = document.activeElement;
    if (cards.indexOf(cur) < 0) { cards[0].focus(); return; }
    var next = neighbour(cards, cur, key);
    if (next) next.focus();
  });

  fetch('plugins.json', { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) { render(Array.isArray(data.plugins) ? data.plugins : []); })
    .catch(function (err) { status.textContent = 'Failed to load plugins: ' + err.message; });
})();
