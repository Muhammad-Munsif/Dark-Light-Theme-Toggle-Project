    (function () {
      'use strict';

      /* ----------------------------------------------------------
         DOM references
         ---------------------------------------------------------- */
      var root = document.documentElement;
      var THEME_KEY = 'lumora-theme';

      var themeToggle = document.getElementById('themeToggle');
      var metaTheme = document.getElementById('metaTheme');
      var menuBtn = document.getElementById('menuBtn');
      var navMenu = document.getElementById('navMenu');
      var navbar = document.getElementById('navbar');
      var toTop = document.getElementById('toTop');
      var toast = document.getElementById('toast');
      var toastMsg = document.getElementById('toastMsg');
      var toastIcon = document.getElementById('toastIcon');

      var mq = window.matchMedia('(prefers-color-scheme: dark)');

      /* ----------------------------------------------------------
         Toast helper
         ---------------------------------------------------------- */
      var toastTimer;
      function showToast(message, icon) {
        if (!toast) return;
        toastMsg.textContent = message;
        if (icon) toastIcon.className = 'fa-solid ' + icon;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
          toast.classList.remove('show');
        }, 2600);
      }

      /* ----------------------------------------------------------
         Theme engine
         ---------------------------------------------------------- */
      function applyTheme(theme, persist) {
        root.setAttribute('data-theme', theme);
        if (persist) {
          try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
        }
        if (themeToggle) themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
        if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#08090d' : '#ffffff');
      }

      // Sync JS state with whatever the head bootstrap applied
      applyTheme(root.getAttribute('data-theme') || 'light', false);

      function toggleTheme() {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
        showToast(
          next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled',
          next === 'dark' ? 'fa-moon' : 'fa-sun'
        );
      }

      if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

      var mockToggle = document.getElementById('mockToggle');
      if (mockToggle) mockToggle.addEventListener('click', toggleTheme);

      var demoBtn = document.getElementById('demoBtn');
      if (demoBtn) demoBtn.addEventListener('click', toggleTheme);

      // Follow the OS only while the user hasn't made an explicit choice
      function onSystemChange(e) {
        var hasPref = false;
        try { hasPref = !!localStorage.getItem(THEME_KEY); } catch (err) { }
        if (!hasPref) {
          var next = e.matches ? 'dark' : 'light';
          applyTheme(next, false);
          showToast('Synced with your system theme', 'fa-circle-half-stroke');
        }
      }
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onSystemChange);
      else if (typeof mq.addListener === 'function') mq.addListener(onSystemChange);

      // Keyboard shortcut: Alt + T
      document.addEventListener('keydown', function (e) {
        if (e.altKey && (e.key === 't' || e.key === 'T')) {
          e.preventDefault();
          toggleTheme();
        }
      });

      /* ----------------------------------------------------------
         Mobile navigation
         ---------------------------------------------------------- */
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

      if (menuBtn) {
        menuBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (navMenu.classList.contains('open')) closeMenu();
          else openMenu();
        });
      }

      document.addEventListener('click', function (e) {
        if (!navMenu || !navMenu.classList.contains('open')) return;
        if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });

      // Close the panel whenever a link inside it is used
      if (navMenu) {
        navMenu.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', closeMenu);
        });
      }

      // Reset state when resizing up to desktop
      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (window.innerWidth > 959) closeMenu();
        }, 120);
      });

      /* ----------------------------------------------------------
         Scroll state (navbar + back-to-top) — rAF-throttled
         ---------------------------------------------------------- */
      var ticking = false;
      function onScroll() {
        var y = window.scrollY || window.pageYOffset;
        if (navbar) navbar.classList.toggle('scrolled', y > 20);
        if (toTop) toTop.classList.toggle('show', y > 640);
        ticking = false;
      }
      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(onScroll);
        }
      }, { passive: true });
      onScroll();

      if (toTop) {
        toTop.addEventListener('click', function () {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      /* ----------------------------------------------------------
         Scroll-spy for the active nav link
         ---------------------------------------------------------- */
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

      /* ----------------------------------------------------------
         Scroll reveal + animated counters
         ---------------------------------------------------------- */
      var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

      function runCounter(el) {
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1400;
        var start = performance.now();

        function frame(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(frame);
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

      /* ----------------------------------------------------------
         Pricing: monthly / yearly toggle
         ---------------------------------------------------------- */
      var billingBtns = Array.prototype.slice.call(document.querySelectorAll('.bt-btn'));
      var amounts = Array.prototype.slice.call(document.querySelectorAll('.price-amount'));
      var notes = Array.prototype.slice.call(document.querySelectorAll('[data-note]'));

      billingBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var period = btn.getAttribute('data-period');

          billingBtns.forEach(function (b) {
            b.classList.toggle('active', b === btn);
          });

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
            n.textContent = period === 'yearly'
              ? 'Billed annually — save 20%'
              : 'Billed monthly';
          });
        });
      });

      /* ----------------------------------------------------------
         Pricing CTA buttons
         ---------------------------------------------------------- */
      document.querySelectorAll('.plan-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var plan = btn.getAttribute('data-plan') || 'this plan';
          showToast('Starting the ' + plan + ' checkout…', 'fa-rocket');
        });
      });

      /* ----------------------------------------------------------
         FAQ: only one open at a time
         ---------------------------------------------------------- */
      var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
      faqItems.forEach(function (item) {
        item.addEventListener('toggle', function () {
          if (!item.open) return;
          faqItems.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        });
      });

      /* ----------------------------------------------------------
         Contact form
         ---------------------------------------------------------- */
      var contactForm = document.getElementById('contactForm');
      if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
          e.preventDefault();

          var name = contactForm.querySelector('#cName');
          var email = contactForm.querySelector('#cEmail');
          var message = contactForm.querySelector('#cMsg');

          if (!name.value.trim()) {
            name.focus();
            showToast('Please enter your name', 'fa-circle-exclamation');
            return;
          }
          if (!/^\S+@\S+\.\S+$/.test(email.value)) {
            email.focus();
            showToast('Please enter a valid email', 'fa-circle-exclamation');
            return;
          }
          if (!message.value.trim()) {
            message.focus();
            showToast('Please add a short message', 'fa-circle-exclamation');
            return;
          }

          showToast('Message sent — we\'ll be in touch soon', 'fa-paper-plane');
          contactForm.reset();
        });
      }

      /* ----------------------------------------------------------
         Newsletter
         ---------------------------------------------------------- */
      var subscribeBtn = document.getElementById('subscribeBtn');
      var subscribeEmail = document.getElementById('subscribeEmail');

      function handleSubscribe() {
        if (!subscribeEmail) return;
        var value = (subscribeEmail.value || '').trim();
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          showToast('Please enter a valid email address', 'fa-circle-exclamation');
          subscribeEmail.focus();
          return;
        }
        showToast('You\'re on the list — welcome aboard', 'fa-circle-check');
        subscribeEmail.value = '';
      }

      if (subscribeBtn) subscribeBtn.addEventListener('click', handleSubscribe);
      if (subscribeEmail) {
        subscribeEmail.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubscribe();
          }
        });
      }

      /* ----------------------------------------------------------
         Smooth in-page scrolling (native smooth + scroll-padding)
         ---------------------------------------------------------- */
      document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
          var href = anchor.getAttribute('href');
          if (!href || href === '#') return;

          var target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();
          closeMenu();

          setTimeout(function () {
            var top = target.getBoundingClientRect().top + window.scrollY - 92;
            window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
            if (history.replaceState) history.replaceState(null, '', href);
          }, 60);
        });
      });

      /* ----------------------------------------------------------
         Testimonials slider
         ---------------------------------------------------------- */
      function initSwiper() {
        if (!window.Swiper) return;
        new Swiper('.testimonialSwiper', {
          slidesPerView: 1,
          spaceBetween: 16,
          loop: true,
          grabCursor: true,
          speed: 650,
          autoplay: { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
          pagination: { el: '.swiper-pagination', clickable: true },
          a11y: { enabled: true },
          breakpoints: {
            560: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1000: { slidesPerView: 3, spaceBetween: 24 }
          }
        });
      }

      if (document.readyState === 'complete') initSwiper();
      else window.addEventListener('load', initSwiper);

      /* ----------------------------------------------------------
         Footer year
         ---------------------------------------------------------- */
      var yearEl = document.getElementById('year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();

      /* ----------------------------------------------------------
         Friendly hello
         ---------------------------------------------------------- */
      window.addEventListener('load', function () {
        setTimeout(function () {
          showToast('Tip: press Alt + T to switch themes', 'fa-lightbulb');
        }, 1400);
      });

    })();
  