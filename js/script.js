 <script>
    (function () {
      const body = document.body;
      const themeBtn = document.getElementById('themeToggleBtn');
      const demoMagic = document.getElementById('demoMagicBtn');
      const themeIcon = document.getElementById('themeIcon');
      const mobileToggle = document.getElementById('mobileToggle');
      const navMenu = document.getElementById('navMenu');
      const toastEl = document.getElementById('globalToast');
      const toastMsgSpan = document.getElementById('toastMsg');
      const satisfactionSpan = document.getElementById('satisfactionRate');
      const navLinks = document.querySelectorAll('.nav-link');
      const navbar = document.getElementById('mainNavbar');

      let currentTheme = localStorage.getItem('theme-pref');
      if (!currentTheme) currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

      function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme-pref', theme);
        if (themeIcon) themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        if (satisfactionSpan) satisfactionSpan.textContent = theme === 'dark' ? '96%' : '94%';
      }
      applyTheme(currentTheme);

      function showToast(msg) { toastMsgSpan.innerHTML = msg; toastEl.classList.add('show'); setTimeout(() => toastEl.classList.remove('show'), 2800); }
      function toggleTheme() { currentTheme = currentTheme === 'dark' ? 'light' : 'dark'; applyTheme(currentTheme); showToast(`✨ Switched to ${currentTheme === 'dark' ? 'Nightfall' : 'Radiance'} mode`); }
      themeBtn?.addEventListener('click', toggleTheme);
      demoMagic?.addEventListener('click', toggleTheme);

      // Mobile menu
      if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => { e.stopPropagation(); navMenu.classList.toggle('show'); mobileToggle.innerHTML = navMenu.classList.contains('show') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>'; });
        document.addEventListener('click', (e) => { if (window.innerWidth <= 860 && navMenu.classList.contains('show') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) { navMenu.classList.remove('show'); mobileToggle.innerHTML = '<i class="fas fa-bars"></i>'; } });
        navLinks.forEach(link => { link.addEventListener('click', () => { if (window.innerWidth <= 860) { navMenu.classList.remove('show'); mobileToggle.innerHTML = '<i class="fas fa-bars"></i>'; } }); });
      }

      // Smooth scroll
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          if (href && href !== '#') { e.preventDefault(); const target = document.querySelector(href); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
      });

      // Active nav
      const sections = document.querySelectorAll('section[id]');
      function setActiveNav() {
        let scrollPos = window.scrollY + 100, found = false;
        sections.forEach(section => {
          if (section.id) { const top = section.offsetTop, bottom = top + section.offsetHeight; if (scrollPos >= top && scrollPos < bottom) { found = true; navLinks.forEach(link => { link.classList.remove('active'); if (link.getAttribute('href') === `#${section.id}`) link.classList.add('active'); }); } }
        });
        if (!found && window.scrollY < 60) { navLinks.forEach(link => { link.classList.remove('active'); if (link.getAttribute('href') === '#' || link.getAttribute('href') === '#home') link.classList.add('active'); }); }
      }
      window.addEventListener('scroll', () => { setActiveNav(); if (window.scrollY > 20) navbar?.classList.add('scrolled'); else navbar?.classList.remove('scrolled'); });
      setActiveNav();

      document.getElementById('contactFormPro')?.addEventListener('submit', (e) => { e.preventDefault(); showToast('📬 Message sent! We\'ll reply soon.'); e.target.reset(); });
      document.getElementById('subscribeBtn')?.addEventListener('click', () => { const email = document.getElementById('subscribeEmail')?.value.trim(); if (email && email.includes('@')) { showToast('🎉 Subscribed!'); document.getElementById('subscribeEmail').value = ''; } else showToast('✉️ Enter valid email'); });
      document.querySelectorAll('.pricing-btn').forEach(btn => btn.addEventListener('click', () => showToast('🚀 Demo — upgrade flow would start here')));

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { if (!localStorage.getItem('theme-pref')) { currentTheme = e.matches ? 'dark' : 'light'; applyTheme(currentTheme); showToast(`🔄 System theme synced: ${currentTheme} mode`); } });
      document.addEventListener('keydown', (e) => { if (e.altKey && e.key === 't') { e.preventDefault(); toggleTheme(); } });

      // Swiper
      new Swiper('.testimonialSwiper', { slidesPerView: 1, spaceBetween: 20, loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, pagination: { el: '.swiper-pagination', clickable: true }, breakpoints: { 640: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView: 3, spaceBetween: 24 } } });
    })();
  </script>