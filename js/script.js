
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function savePref(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function readPref(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function removePref(k) { try { localStorage.removeItem(k); } catch (e) { } }

  function haptic(ms) {
    if (navigator.vibrate && window.matchMedia('(pointer: coarse)').matches) {
      try { navigator.vibrate(ms || 8); } catch (e) { }
    }
  }

  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, function () { showToast('Copy failed', 'error'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); onDone(); } catch (e) { showToast('Copy failed', 'error'); }
      document.body.removeChild(ta);
    }
  }

  /* ---------- Toast stack ---------- */
  var toastStack = document.getElementById('toastStack');
  var TOAST_ICONS = {
    check: 'fa-circle-check', info: 'fa-circle-info', warn: 'fa-triangle-exclamation',
    error: 'fa-circle-exclamation', sun: 'fa-sun', moon: 'fa-moon',
    sync: 'fa-circle-half-stroke', bulb: 'fa-lightbulb', rocket: 'fa-rocket',
    heart: 'fa-heart', copy: 'fa-clipboard-check', palette: 'fa-palette',
    share: 'fa-share-nodes', download: 'fa-download', wifi: 'fa-wifi'
  };
  function showToast(msg, iconName) {
    if (!toastStack) return;
    var el = document.createElement('div');
    el.className = 'toast';
    var cls = TOAST_ICONS[iconName] || iconName || 'fa-circle-check';
    el.innerHTML = '<i class="fa-solid ' + cls + '"></i><span></span>';
    el.querySelector('span').textContent = msg;
    toastStack.appendChild(el);
    void el.offsetWidth;
    el.classList.add('show');
    var timer = setTimeout(dismiss, 3200);
    function dismiss() {
      clearTimeout(timer);
      el.classList.remove('show');
      el.addEventListener('transitionend', function () { el.remove(); }, { once: true });
    }
    el.addEventListener('click', dismiss);
  }

  /* ---------- THEME ENGINE ---------- */
  var THEME_KEY = 'lumora-theme-mode';
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function resolveTheme(mode) {
    if (mode === 'light' || mode === 'dark') return mode;
    if (mode === 'system') return mq.matches ? 'dark' : 'light';
    if (mode === 'auto') {
      var h = new Date().getHours();
      return (h < 7 || h >= 19) ? 'dark' : 'light';
    }
    return mq.matches ? 'dark' : 'light';
  }

  var metaTheme = document.getElementById('metaTheme');
  var themeToggle = document.getElementById('themeToggle');

  function paintTheme(mode) {
    var resolved = resolveTheme(mode);
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-theme-mode', mode);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(resolved === 'dark'));
    if (metaTheme) metaTheme.setAttribute('content', resolved === 'dark' ? '#08090d' : '#ffffff');
    syncCustomizerModeUI(mode);
  }

  function applyThemeMode(mode, persist) {
    if (persist) savePref(THEME_KEY, mode);
    if (!reduced && document.startViewTransition) {
      document.startViewTransition(function () { paintTheme(mode); });
    } else {
      paintTheme(mode);
    }
  }

  applyThemeMode(readPref(THEME_KEY) || 'system', false);

  function toggleTheme() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyThemeMode(next, true);
    haptic(10);
    showToast(next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled',
      next === 'dark' ? 'moon' : 'sun');
  }

  themeToggle && themeToggle.addEventListener('click', toggleTheme);
  var mockToggle = document.getElementById('mockToggle');
  mockToggle && mockToggle.addEventListener('click', toggleTheme);
  var demoBtn = document.getElementById('demoBtn');
  demoBtn && demoBtn.addEventListener('click', toggleTheme);

  function onSystemChange() {
    if ((readPref(THEME_KEY) || 'system') === 'system') {
      applyThemeMode('system', false);
      showToast('Synced with system theme', 'sync');
    }
  }
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onSystemChange);
  else if (typeof mq.addListener === 'function') mq.addListener(onSystemChange);

  setInterval(function () {
    if (readPref(THEME_KEY) === 'auto') applyThemeMode('auto', false);
  }, 5 * 60 * 1000);

  document.addEventListener('keydown', function (e) {
    if (e.altKey && (e.key === 't' || e.key === 'T')) {
      e.preventDefault();
      toggleTheme();
    }
  });

  /* ---------- ACCENT / RADIUS / FONT / RTL ---------- */
  var ACCENT_KEY = 'lumora-accent';
  var RADIUS_KEY = 'lumora-radius';
  var FONT_KEY = 'lumora-font-scale';
  var RTL_KEY = 'lumora-rtl';
  var COOKIE_KEY = 'lumora-cookie-ok';

  function applyAccent(a, persist) {
    root.setAttribute('data-accent', a);
    if (persist) savePref(ACCENT_KEY, a);
    document.querySelectorAll('.swatch').forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-accent') === a);
    });
  }
  function applyRadius(v, persist) {
    root.style.setProperty('--radius-scale', v);
    if (persist) savePref(RADIUS_KEY, v);
    var el = document.getElementById('radiusVal');
    if (el) el.textContent = parseFloat(v).toFixed(2) + '×';
    var r = document.getElementById('radiusRange');
    if (r) r.value = v;
  }
  function applyFontScale(v, persist) {
    root.style.setProperty('--font-scale', v);
    if (persist) savePref(FONT_KEY, v);
    var el = document.getElementById('fontVal');
    if (el) el.textContent = parseFloat(v).toFixed(2) + '×';
    var r = document.getElementById('fontRange');
    if (r) r.value = v;
  }
  function applyRTL(on, persist) {
    if (on) root.setAttribute('dir', 'rtl');
    else root.removeAttribute('dir');
    if (persist) savePref(RTL_KEY, on ? '1' : '0');
    var sw = document.getElementById('rtlSwitch');
    if (sw) sw.setAttribute('aria-checked', String(on));
  }

  applyAccent(readPref(ACCENT_KEY) || 'indigo', false);
  applyRadius(readPref(RADIUS_KEY) || '1', false);
  applyFontScale(readPref(FONT_KEY) || '1', false);
  applyRTL(readPref(RTL_KEY) === '1', false);

  /* ---------- SCROLL ---------- */
  var navbar = document.getElementById('navbar');
  var toTop = document.getElementById('toTop');
  var toTopRing = document.getElementById('toTopRing');
  var scrollBar = document.getElementById('scrollBar');

  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? Math.min(y / h, 1) : 0;
    if (scrollBar) scrollBar.style.width = (pct * 100) + '%';
    if (navbar) navbar.classList.toggle('scrolled', y > 20);
    if (toTop) toTop.classList.toggle('show', y > 640);
    if (toTopRing) toTopRing.style.strokeDashoffset = String(157 - 157 * pct);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  toTop && toTop.addEventListener('click', function () {
    haptic(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- MOBILE NAV ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var navMenu = document.getElementById('navMenu');
  var OPEN_ICON = '<i class="fa-solid fa-bars"></i>';
  var CLOSE_ICON = '<i class="fa-solid fa-xmark"></i>';

  function openMenu() {
    navMenu.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close navigation menu');
    menuBtn.innerHTML = CLOSE_ICON;
  }
  function closeMenu() {
    if (!navMenu.classList.contains('open')) return;
    navMenu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open navigation menu');
    menuBtn.innerHTML = OPEN_ICON;
  }
  menuBtn && menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    haptic(6);
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });
  document.addEventListener('click', function (e) {
    if (!navMenu || !navMenu.classList.contains('open')) return;
    if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  navMenu && navMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (window.innerWidth > 959) closeMenu(); }, 120);
  });

  /* ---------- SCROLL-SPY ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link[href^="#"]'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- REVEAL + STAGGER + COUNTERS ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal, .grid.stagger'));

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = performance.now();
    function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = (el.getAttribute('data-delay') || 0) + 'ms';
        el.classList.add('in');
        el.querySelectorAll('[data-count]').forEach(runCounter);
        if (el.hasAttribute('data-count')) runCounter(el);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('[data-count]').forEach(runCounter);
  }

  /* ---------- READING TIME ---------- */
  (function () {
    var pill = document.getElementById('readingPill');
    var main = document.getElementById('main');
    if (!pill || !main) return;
    var words = (main.innerText || '').trim().split(/\s+/).length;
    var mins = Math.max(1, Math.round(words / 220));
    pill.querySelector('span').textContent = 'About ' + mins + ' min read · ' + words.toLocaleString() + ' words';
  })();

  /* ---------- HEADING ANCHORS ---------- */
  document.querySelectorAll('main section[id]').forEach(function (section) {
    var h = section.querySelector('.sec-head h2');
    if (!h || h.querySelector('.anchor-link')) return;
    var a = document.createElement('button');
    a.className = 'anchor-link';
    a.type = 'button';
    a.setAttribute('aria-label', 'Copy link to this section');
    a.innerHTML = '<i class="fa-solid fa-link"></i>';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var url = location.origin + location.pathname + '#' + section.id;
      copyText(url, function () {
        a.classList.add('copied');
        a.innerHTML = '<i class="fa-solid fa-check"></i>';
        haptic(8);
        showToast('Link copied — share this section', 'copy');
        setTimeout(function () {
          a.classList.remove('copied');
          a.innerHTML = '<i class="fa-solid fa-link"></i>';
        }, 1800);
      });
    });
    h.appendChild(a);
  });

  /* ---------- PRICING TOGGLE ---------- */
  var billingBtns = Array.prototype.slice.call(document.querySelectorAll('.bt-btn'));
  var amounts = Array.prototype.slice.call(document.querySelectorAll('.price-amount'));
  var notes = Array.prototype.slice.call(document.querySelectorAll('[data-note]'));

  billingBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var period = btn.getAttribute('data-period');
      billingBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
      amounts.forEach(function (el) {
        var value = el.getAttribute('data-' + period);
        if (!value) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(-6px)';
        setTimeout(function () {
          el.textContent = value;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 150);
      });
      notes.forEach(function (n) {
        n.textContent = period === 'yearly' ? 'Billed annually — save 20%' : 'Billed monthly';
      });
    });
  });

  document.querySelectorAll('.plan-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showToast('Starting the ' + (btn.getAttribute('data-plan') || 'plan') + ' checkout…', 'rocket');
    });
  });

  /* ---------- FAQ ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* ---------- CONTACT FORM ---------- */
  var contactForm = document.getElementById('contactForm');
  contactForm && contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = contactForm.querySelector('#cName');
    var email = contactForm.querySelector('#cEmail');
    var message = contactForm.querySelector('#cMsg');
    if (!name.value.trim()) { name.focus(); showToast('Please enter your name', 'error'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.value)) { email.focus(); showToast('Please enter a valid email', 'error'); return; }
    if (!message.value.trim()) { message.focus(); showToast('Please add a short message', 'error'); return; }
    showToast('Message sent — we\'ll be in touch soon', 'check');
    contactForm.reset();
  });

  /* ---------- NEWSLETTER ---------- */
  var subscribeBtn = document.getElementById('subscribeBtn');
  var subscribeEmail = document.getElementById('subscribeEmail');
  function handleSubscribe() {
    if (!subscribeEmail) return;
    var v = (subscribeEmail.value || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(v)) {
      showToast('Please enter a valid email address', 'error');
      subscribeEmail.focus();
      return;
    }
    showToast('You\'re on the list — welcome aboard', 'check');
    subscribeEmail.value = '';
  }
  subscribeBtn && subscribeBtn.addEventListener('click', handleSubscribe);
  subscribeEmail && subscribeEmail.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); handleSubscribe(); }
  });

  /* ---------- SMOOTH IN-PAGE SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      setTimeout(function () {
        var top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
        if (history.replaceState) history.replaceState(null, '', href);
      }, 60);
    });
  });

  /* ---------- SWIPER ---------- */
  function initSwiper() {
    if (!window.Swiper) return;
    new Swiper('.testimonialSwiper', {
      slidesPerView: 1, spaceBetween: 16, loop: true, grabCursor: true, speed: 650,
      autoplay: { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { el: '.swiper-pagination', clickable: true },
      a11y: { enabled: true },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 20 },
        1000: { slidesPerView: 3, spaceBetween: 24 }
      }
    });
  }
  if (document.readyState === 'complete') initSwiper();
  else window.addEventListener('load', initSwiper);

  /* ---------- FOOTER YEAR ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- CODE PLAYGROUND ---------- */
  var SNIPPETS = {
    html: [
      '<span class="tk-com">&lt;!-- index.html --&gt;</span>',
      '<span class="tk-tag">&lt;!DOCTYPE</span> <span class="tk-attr">html</span><span class="tk-tag">&gt;</span>',
      '<span class="tk-tag">&lt;html</span> <span class="tk-attr">lang</span>=<span class="tk-str">"en"</span> <span class="tk-attr">data-theme</span>=<span class="tk-str">"light"</span><span class="tk-tag">&gt;</span>',
      '<span class="tk-tag">&lt;head&gt;</span>',
      '  <span class="tk-com">&lt;!-- 1. Apply the theme BEFORE paint --&gt;</span>',
      '  <span class="tk-tag">&lt;script&gt;</span>',
      '    <span class="tk-kw">var</span> t = localStorage.<span class="tk-fn">getItem</span>(<span class="tk-str">\'lumora-theme-mode\'</span>) <span class="tk-kw">||</span> <span class="tk-str">\'system\'</span>;',
      '    <span class="tk-kw">var</span> r = t === <span class="tk-str">\'system\'</span>',
      '      ? (matchMedia(<span class="tk-str">\'(prefers-color-scheme: dark)\'</span>).matches ? <span class="tk-str">\'dark\'</span> : <span class="tk-str">\'light\'</span>)',
      '      : t;',
      '    document.documentElement.<span class="tk-fn">setAttribute</span>(<span class="tk-str">\'data-theme\'</span>, r);',
      '  <span class="tk-tag">&lt;/script&gt;</span>',
      '  <span class="tk-tag">&lt;link</span> <span class="tk-attr">rel</span>=<span class="tk-str">"stylesheet"</span> <span class="tk-attr">href</span>=<span class="tk-str">"lumora.css"</span><span class="tk-tag">&gt;</span>',
      '<span class="tk-tag">&lt;/head&gt;</span>',
      '<span class="tk-tag">&lt;body&gt;</span>',
      '  <span class="tk-tag">&lt;button</span> <span class="tk-attr">data-theme-toggle</span><span class="tk-tag">&gt;</span>Toggle theme<span class="tk-tag">&lt;/button&gt;</span>',
      '  <span class="tk-tag">&lt;script</span> <span class="tk-attr">src</span>=<span class="tk-str">"lumora.js"</span><span class="tk-tag">&gt;&lt;/script&gt;</span>',
      '<span class="tk-tag">&lt;/body&gt;</span>',
      '<span class="tk-tag">&lt;/html&gt;</span>'
    ].join('\n'),

    css: [
      '<span class="tk-com">/* lumora.css — design tokens */</span>',
      '<span class="tk-fn">:root</span> {',
      '  <span class="tk-prop">--bg</span>: <span class="tk-str">#ffffff</span>;',
      '  <span class="tk-prop">--text</span>: <span class="tk-str">#0b1220</span>;',
      '  <span class="tk-prop">--primary</span>: <span class="tk-str">#6366f1</span>;',
      '  <span class="tk-prop">--border</span>: <span class="tk-str">#e4e9f0</span>;',
      '}',
      '',
      '<span class="tk-fn">[data-theme=<span class="tk-str">"dark"</span>]</span> {',
      '  <span class="tk-prop">--bg</span>: <span class="tk-str">#08090d</span>;',
      '  <span class="tk-prop">--text</span>: <span class="tk-str">#f2f5f9</span>;',
      '  <span class="tk-prop">--primary</span>: <span class="tk-str">#818cf8</span>;',
      '  <span class="tk-prop">--border</span>: <span class="tk-str">#1e2430</span>;',
      '}',
      '',
      '<span class="tk-fn">body</span> {',
      '  <span class="tk-prop">background</span>: <span class="tk-kw">var</span>(--bg);',
      '  <span class="tk-prop">color</span>: <span class="tk-kw">var</span>(--text);',
      '  <span class="tk-prop">transition</span>: background-color <span class="tk-str">.45s</span> ease, color <span class="tk-str">.3s</span> ease;',
      '}'
    ].join('\n'),

    js: [
      '<span class="tk-com">/* lumora.js — tiny theme runtime */</span>',
      '(<span class="tk-kw">function</span> () {',
      '  <span class="tk-kw">var</span> root = document.documentElement;',
      '  <span class="tk-kw">var</span> KEY  = <span class="tk-str">\'lumora-theme-mode\'</span>;',
      '',
      '  <span class="tk-kw">function</span> <span class="tk-fn">resolve</span>(mode) {',
      '    <span class="tk-kw">if</span> (mode === <span class="tk-str">\'light\'</span> || mode === <span class="tk-str">\'dark\'</span>) <span class="tk-kw">return</span> mode;',
      '    <span class="tk-kw">if</span> (mode === <span class="tk-str">\'auto\'</span>) {',
      '      <span class="tk-kw">var</span> h = <span class="tk-kw">new</span> Date().<span class="tk-fn">getHours</span>();',
      '      <span class="tk-kw">return</span> (h &lt; 7 || h &gt;= 19) ? <span class="tk-str">\'dark\'</span> : <span class="tk-str">\'light\'</span>;',
      '    }',
      '    <span class="tk-kw">return</span> matchMedia(<span class="tk-str">\'(prefers-color-scheme: dark)\'</span>).matches ? <span class="tk-str">\'dark\'</span> : <span class="tk-str">\'light\'</span>;',
      '  }',
      '',
      '  <span class="tk-kw">function</span> <span class="tk-fn">setMode</span>(mode) {',
      '    localStorage.<span class="tk-fn">setItem</span>(KEY, mode);',
      '    root.<span class="tk-fn">setAttribute</span>(<span class="tk-str">\'data-theme\'</span>, <span class="tk-fn">resolve</span>(mode));',
      '  }',
      '',
      '  document.<span class="tk-fn">querySelectorAll</span>(<span class="tk-str">\'[data-theme-toggle]\'</span>)',
      '    .<span class="tk-fn">forEach</span>(<span class="tk-kw">function</span> (b) {',
      '      b.<span class="tk-fn">addEventListener</span>(<span class="tk-str">\'click\'</span>, <span class="tk-kw">function</span> () {',
      '        <span class="tk-kw">var</span> next = root.<span class="tk-fn">getAttribute</span>(<span class="tk-str">\'data-theme\'</span>) === <span class="tk-str">\'dark\'</span> ? <span class="tk-str">\'light\'</span> : <span class="tk-str">\'dark\'</span>;',
      '        <span class="tk-fn">setMode</span>(next);',
      '      });',
      '    });',
      '})();'
    ].join('\n')
  };

  var codePre = document.getElementById('codePre');
  var codeTabs = Array.prototype.slice.call(document.querySelectorAll('.showcase-tab'));
  var copyBtn = document.getElementById('copyCode');

  function renderCode(key) {
    if (!codePre || !SNIPPETS[key]) return;
    codePre.innerHTML = SNIPPETS[key];
    codeTabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === key;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
  }
  codeTabs.forEach(function (t) {
    t.addEventListener('click', function () { renderCode(t.getAttribute('data-tab')); });
  });
  renderCode('html');

  copyBtn && copyBtn.addEventListener('click', function () {
    var text = codePre ? codePre.textContent : '';
    copyText(text, function () {
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
      showToast('Code copied to clipboard', 'copy');
      setTimeout(function () {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>Copy</span>';
      }, 1800);
    });
  });

  /* ---------- RIPPLE ON ALL BUTTONS ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn');
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 800);
  });

  /* ---------- FOCUS TRAP (fixed for fixed-position elements) ---------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function isVisible(el) {
    if (el.hasAttribute('hidden')) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    if (el.closest('[hidden]')) return false;
    var st = window.getComputedStyle(el);
    return st.display !== 'none' && st.visibility !== 'hidden';
  }

  function createFocusTrap(container) {
    var lastFocused = document.activeElement;
    function keyHandler(e) {
      if (e.key !== 'Tab') return;
      var items = Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE)).filter(isVisible);
      if (!items.length) { e.preventDefault(); return; }
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault(); last.focus();
        }
      } else {
        if (document.activeElement === last || !container.contains(document.activeElement)) {
          e.preventDefault(); first.focus();
        }
      }
    }
    container.addEventListener('keydown', keyHandler);
    return {
      release: function () {
        container.removeEventListener('keydown', keyHandler);
        if (lastFocused && lastFocused.focus && document.contains(lastFocused)) {
          try { lastFocused.focus(); } catch (e) { }
        }
      }
    };
  }

  /* ---------- CUSTOMIZER PANEL ---------- */
  var panel = document.getElementById('customizerPanel');
  var panelScrim = document.getElementById('panelScrim');
  var openBtn = document.getElementById('openCustomizer');
  var fabBtn = document.getElementById('fabCustomizer');
  var closeBtn = document.getElementById('closeCustomizer');
  var closeBtn2 = document.getElementById('closeCustomizer2');
  var resetBtn = document.getElementById('resetCustomizer');
  var radiusRange = document.getElementById('radiusRange');
  var fontRange = document.getElementById('fontRange');
  var rtlSwitch = document.getElementById('rtlSwitch');
  var panelTrap = null;

  function openPanel() {
    if (!panel) return;
    panel.classList.add('open');
    panelScrim.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    haptic(8);
    var r = document.getElementById('radiusRange'); if (r) r.value = readPref(RADIUS_KEY) || '1';
    var f = document.getElementById('fontRange'); if (f) f.value = readPref(FONT_KEY) || '1';
    panelTrap = createFocusTrap(panel);
    setTimeout(function () {
      var first = panel.querySelector('.cust-mode, .panel-close');
      first && first.focus();
    }, 130);
  }
  function closePanel() {
    if (!panel) return;
    panel.classList.remove('open');
    panelScrim.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (panelTrap) { panelTrap.release(); panelTrap = null; }
  }

  openBtn && openBtn.addEventListener('click', openPanel);
  fabBtn && fabBtn.addEventListener('click', openPanel);
  closeBtn && closeBtn.addEventListener('click', closePanel);
  closeBtn2 && closeBtn2.addEventListener('click', closePanel);
  panelScrim && panelScrim.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel && panel.classList.contains('open')) closePanel();
  });

  function syncCustomizerModeUI(mode) {
    document.querySelectorAll('.cust-mode').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });
  }

  document.querySelectorAll('.cust-mode').forEach(function (b) {
    b.addEventListener('click', function () {
      var mode = b.getAttribute('data-mode');
      applyThemeMode(mode, true);
      haptic(8);
      var label = { light: 'Light', dark: 'Dark', system: 'System', auto: 'Auto (time)' }[mode] || mode;
      showToast(label + ' mode selected', 'sync');
    });
  });

  document.querySelectorAll('.swatch').forEach(function (s) {
    s.addEventListener('click', function () {
      var a = s.getAttribute('data-accent');
      applyAccent(a, true);
      haptic(6);
      showToast('Accent set to ' + a, 'palette');
    });
  });

  radiusRange && radiusRange.addEventListener('input', function () {
    applyRadius(radiusRange.value, true);
  });
  fontRange && fontRange.addEventListener('input', function () {
    applyFontScale(fontRange.value, true);
  });

  rtlSwitch && rtlSwitch.addEventListener('click', function () {
    var now = rtlSwitch.getAttribute('aria-checked') === 'true';
    applyRTL(!now, true);
    haptic(8);
    showToast(!now ? 'Right-to-left layout on' : 'Left-to-right layout', 'sync');
  });

  resetBtn && resetBtn.addEventListener('click', function () {
    removePref(THEME_KEY);
    removePref(ACCENT_KEY);
    removePref(RADIUS_KEY);
    removePref(FONT_KEY);
    removePref(RTL_KEY);
    applyThemeMode('system', false);
    applyAccent('indigo', false);
    applyRadius('1', false);
    applyFontScale('1', false);
    applyRTL(false, false);
    showToast('Customizer reset to defaults', 'sync');
  });

  /* ---------- COMMAND PALETTE ---------- */
  var cmdScrim = document.getElementById('cmdScrim');
  var cmdPalette = document.getElementById('cmdPalette');
  var cmdInput = document.getElementById('cmdInput');
  var cmdList = document.getElementById('cmdList');
  var cmdBtn = document.getElementById('cmdBtn');
  var cmdTrap = null;

  var COMMANDS = [
    { group: 'Navigate', label: 'Go to Home', icon: 'fa-house', action: function () { goTo('#home'); } },
    { group: 'Navigate', label: 'Go to Services', icon: 'fa-layer-group', action: function () { goTo('#services'); } },
    { group: 'Navigate', label: 'Go to Playground', icon: 'fa-code', action: function () { goTo('#playground'); } },
    { group: 'Navigate', label: 'Go to Features', icon: 'fa-star', action: function () { goTo('#features'); } },
    { group: 'Navigate', label: 'Go to Pricing', icon: 'fa-gem', action: function () { goTo('#pricing'); } },
    { group: 'Navigate', label: 'Go to Compare', icon: 'fa-scale-balanced', action: function () { goTo('#compare'); } },
    { group: 'Navigate', label: 'Go to Testimonials', icon: 'fa-comments', action: function () { goTo('#testimonials'); } },
    { group: 'Navigate', label: 'Go to FAQ', icon: 'fa-circle-question', action: function () { goTo('#faq'); } },
    { group: 'Navigate', label: 'Go to Contact', icon: 'fa-envelope', action: function () { goTo('#contact'); } },

    { group: 'Theme', label: 'Toggle light / dark', icon: 'fa-circle-half-stroke', kbd: ['Alt', 'T'], action: toggleTheme },
    { group: 'Theme', label: 'Light mode', icon: 'fa-sun', action: function () { applyThemeMode('light', true); showToast('Light mode enabled', 'sun'); } },
    { group: 'Theme', label: 'Dark mode', icon: 'fa-moon', action: function () { applyThemeMode('dark', true); showToast('Dark mode enabled', 'moon'); } },
    { group: 'Theme', label: 'Follow system theme', icon: 'fa-circle-half-stroke', action: function () { applyThemeMode('system', true); showToast('Following system theme', 'sync'); } },
    { group: 'Theme', label: 'Auto by time of day', icon: 'fa-clock', action: function () { applyThemeMode('auto', true); showToast('Auto theme enabled', 'sync'); } },
    { group: 'Theme', label: 'Open customizer', icon: 'fa-sliders', action: openPanel },

    { group: 'Accent', label: 'Indigo accent', icon: 'fa-palette', action: function () { applyAccent('indigo', true); showToast('Accent set to indigo', 'palette'); } },
    { group: 'Accent', label: 'Violet accent', icon: 'fa-palette', action: function () { applyAccent('violet', true); showToast('Accent set to violet', 'palette'); } },
    { group: 'Accent', label: 'Pink accent', icon: 'fa-palette', action: function () { applyAccent('pink', true); showToast('Accent set to pink', 'palette'); } },
    { group: 'Accent', label: 'Emerald accent', icon: 'fa-palette', action: function () { applyAccent('emerald', true); showToast('Accent set to emerald', 'palette'); } },
    { group: 'Accent', label: 'Amber accent', icon: 'fa-palette', action: function () { applyAccent('amber', true); showToast('Accent set to amber', 'palette'); } },
    { group: 'Accent', label: 'Sky accent', icon: 'fa-palette', action: function () { applyAccent('sky', true); showToast('Accent set to sky', 'palette'); } },

    { group: 'Accessibility', label: 'Toggle RTL layout', icon: 'fa-language', action: function () { var now = readPref(RTL_KEY) === '1'; applyRTL(!now, true); showToast(!now ? 'Right-to-left layout on' : 'Left-to-right layout', 'sync'); } },
    { group: 'Accessibility', label: 'Increase font size', icon: 'fa-magnifying-glass-plus', action: function () { var v = parseFloat(readPref(FONT_KEY) || '1'); v = Math.min(1.25, v + 0.05); applyFontScale(v.toFixed(2), true); showToast('Font scale: ' + v.toFixed(2) + '×', 'sync'); } },
    { group: 'Accessibility', label: 'Decrease font size', icon: 'fa-magnifying-glass-minus', action: function () { var v = parseFloat(readPref(FONT_KEY) || '1'); v = Math.max(0.85, v - 0.05); applyFontScale(v.toFixed(2), true); showToast('Font scale: ' + v.toFixed(2) + '×', 'sync'); } },
    { group: 'Accessibility', label: 'Reset font size', icon: 'fa-rotate-left', action: function () { applyFontScale('1', true); showToast('Font scale reset', 'sync'); } },

    { group: 'Actions', label: 'Share this page', icon: 'fa-share-nodes', action: function () { triggerShare(); } },
    { group: 'Actions', label: 'Copy current URL', icon: 'fa-link', action: function () { copyText(location.href, function () { showToast('URL copied to clipboard', 'copy'); }); } },
    { group: 'Actions', label: 'Show keyboard shortcuts', icon: 'fa-keyboard', action: openShortcuts },
    { group: 'Actions', label: 'Scroll to top', icon: 'fa-arrow-up', action: function () { window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  ];

  var filtered = COMMANDS.slice();
  var activeIdx = 0;

  function goTo(sel) {
    var target = document.querySelector(sel);
    if (!target) return;
    closePalette();
    setTimeout(function () {
      var top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
      if (history.replaceState) history.replaceState(null, '', sel);
    }, 80);
  }

  function renderCmdList() {
    if (!cmdList) return;
    if (!filtered.length) {
      cmdList.innerHTML = '<div class="cmd-empty"><i class="fa-solid fa-magnifying-glass" style="font-size:1.5rem;margin-bottom:8px;display:block;opacity:.5;"></i>No results found</div>';
      return;
    }
    var html = '';
    var lastGroup = '';
    filtered.forEach(function (cmd, i) {
      if (cmd.group !== lastGroup) {
        html += '<div class="cmd-group-label">' + cmd.group + '</div>';
        lastGroup = cmd.group;
      }
      html += '<button class="cmd-item' + (i === activeIdx ? ' active' : '') + '" type="button" data-i="' + i + '" role="option">'
        + '<i class="fa-solid ' + cmd.icon + '"></i>'
        + '<span class="cmd-item__label">' + cmd.label + '</span>'
        + (cmd.kbd ? '<span class="cmd-item__kbd">' + cmd.kbd.map(function (k) { return '<kbd>' + k + '</kbd>'; }).join('') + '</span>' : '')
        + '</button>';
    });
    cmdList.innerHTML = html;

    cmdList.querySelectorAll('.cmd-item').forEach(function (el) {
      el.addEventListener('click', function () {
        runCommand(parseInt(el.getAttribute('data-i'), 10));
      });
      el.addEventListener('mouseenter', function () {
        activeIdx = parseInt(el.getAttribute('data-i'), 10);
        cmdList.querySelectorAll('.cmd-item').forEach(function (x, j) {
          x.classList.toggle('active', j === activeIdx);
        });
      });
    });
  }

  function runCommand(i) {
    var cmd = filtered[i];
    if (!cmd) return;
    closePalette();
    setTimeout(function () { cmd.action(); }, 60);
  }

  function openPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.add('open');
    cmdScrim.classList.add('open');
    cmdPalette.setAttribute('aria-hidden', 'false');
    cmdInput.value = '';
    filtered = COMMANDS.slice();
    activeIdx = 0;
    renderCmdList();
    cmdTrap = createFocusTrap(cmdPalette);
    setTimeout(function () { cmdInput.focus(); }, 80);
  }
  function closePalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('open');
    cmdScrim.classList.remove('open');
    cmdPalette.setAttribute('aria-hidden', 'true');
    if (cmdTrap) { cmdTrap.release(); cmdTrap = null; }
  }

  cmdBtn && cmdBtn.addEventListener('click', openPalette);
  cmdScrim && cmdScrim.addEventListener('click', closePalette);

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      cmdPalette.classList.contains('open') ? closePalette() : openPalette();
    }
  });

  cmdInput && cmdInput.addEventListener('input', function () {
    var q = cmdInput.value.trim().toLowerCase();
    filtered = q
      ? COMMANDS.filter(function (c) { return (c.label + ' ' + c.group).toLowerCase().indexOf(q) !== -1; })
      : COMMANDS.slice();
    activeIdx = 0;
    renderCmdList();
  });

  cmdInput && cmdInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!filtered.length) return; activeIdx = (activeIdx + 1) % filtered.length; renderCmdList(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!filtered.length) return; activeIdx = (activeIdx - 1 + filtered.length) % filtered.length; renderCmdList(); }
    else if (e.key === 'Enter') { e.preventDefault(); runCommand(activeIdx); }
    else if (e.key === 'Escape') { closePalette(); }
  });

  /* ---------- SHORTCUTS OVERLAY ---------- */
  var shortcutScrim = document.getElementById('shortcutScrim');
  var shortcutBox = document.getElementById('shortcutBox');
  var closeShortcutsBtn = document.getElementById('closeShortcuts');
  var shortcutTrap = null;

  function openShortcuts() {
    if (!shortcutBox) return;
    shortcutBox.classList.add('open');
    shortcutScrim.classList.add('open');
    shortcutBox.setAttribute('aria-hidden', 'false');
    shortcutTrap = createFocusTrap(shortcutBox);
    setTimeout(function () { closeShortcutsBtn && closeShortcutsBtn.focus(); }, 80);
  }
  function closeShortcuts() {
    if (!shortcutBox) return;
    shortcutBox.classList.remove('open');
    shortcutScrim.classList.remove('open');
    shortcutBox.setAttribute('aria-hidden', 'true');
    if (shortcutTrap) { shortcutTrap.release(); shortcutTrap = null; }
  }
  closeShortcutsBtn && closeShortcutsBtn.addEventListener('click', closeShortcuts);
  shortcutScrim && shortcutScrim.addEventListener('click', closeShortcuts);

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      shortcutBox.classList.contains('open') ? closeShortcuts() : openShortcuts();
    }
  });

  /* Two-key navigation: g + letter */
  var lastKey = '';
  var lastKeyTime = 0;
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    var now = Date.now();
    if (lastKey === 'g' && now - lastKeyTime < 1200) {
      var k = (e.key || '').toLowerCase();
      var map = { h: '#home', p: '#pricing', c: '#contact', f: '#features', s: '#services' };
      if (map[k]) { e.preventDefault(); goTo(map[k]); }
      lastKey = '';
      return;
    }
    lastKey = (e.key || '').toLowerCase();
    lastKeyTime = now;
  });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.shiftKey && (e.key === 'C' || e.key === 'c') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      copyText(location.href, function () { showToast('URL copied to clipboard', 'copy'); });
    }
  });

  /* ---------- SHARE ---------- */
  var shareBtn = document.getElementById('shareBtn');
  function triggerShare() {
    var data = {
      title: 'Lumora — Intelligent Theme Engine',
      text: 'Light. Dark. Perfectly balanced. A theming engine for modern web apps.',
      url: location.href
    };
    if (navigator.share) {
      navigator.share(data).then(function () {
        showToast('Shared — thank you!', 'share');
      }).catch(function () { });
    } else {
      copyText(location.href, function () { showToast('Link copied — paste to share', 'copy'); });
    }
  }
  shareBtn && shareBtn.addEventListener('click', function () { haptic(8); triggerShare(); });

  /* ---------- PWA INSTALL ---------- */
  var installBtn = document.getElementById('installBtn');
  var deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  installBtn && installBtn.addEventListener('click', function () {
    if (!deferredInstallPrompt) return;
    haptic(10);
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function (choice) {
      if (choice.outcome === 'accepted') showToast('Installing Lumora…', 'download');
      else showToast('Install dismissed — you can try again anytime', 'info');
      deferredInstallPrompt = null;
      installBtn.hidden = true;
    });
  });

  window.addEventListener('appinstalled', function () {
    showToast('Lumora is installed — look for it on your home screen', 'check');
    if (installBtn) installBtn.hidden = true;
  });

  /* ---------- OFFLINE ---------- */
  var offlineBanner = document.getElementById('offlineBanner');
  function updateOnlineStatus() {
    if (!offlineBanner) return;
    if (navigator.onLine) {
      offlineBanner.classList.remove('show');
    } else {
      offlineBanner.classList.add('show');
      showToast('You\'re offline — cached content still works', 'wifi');
    }
  }
  window.addEventListener('online', function () { updateOnlineStatus(); showToast('Back online', 'check'); });
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  /* ---------- COOKIE ---------- */
  var cookie = document.getElementById('cookie');
  var cookieAccept = document.getElementById('cookieAccept');
  function showCookieBanner() {
    if (!cookie) return;
    cookie.classList.add('show');
    cookie.setAttribute('aria-hidden', 'false');
  }
  function hideCookieBanner() {
    if (!cookie) return;
    cookie.classList.remove('show');
    cookie.setAttribute('aria-hidden', 'true');
  }
  if (!readPref(COOKIE_KEY)) setTimeout(showCookieBanner, 1800);
  cookieAccept && cookieAccept.addEventListener('click', function () {
    savePref(COOKIE_KEY, '1');
    hideCookieBanner();
    showToast('Thanks — enjoy Lumora!', 'heart');
  });

  /* ---------- WELCOME ---------- */
  window.addEventListener('load', function () {
    setTimeout(function () {
      showToast('Press ⌘K / Ctrl+K for the command palette · ? for shortcuts', 'bulb');
    }, 1600);
  });

})();
