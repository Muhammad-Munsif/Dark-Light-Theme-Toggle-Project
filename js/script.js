 <script>
    (function () {
      // DOM Elements
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

      // Theme management
      let currentTheme = localStorage.getItem('theme-pref');
      if (!currentTheme) {
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme-pref', theme);
        if (themeIcon) {
          themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        if (satisfactionSpan) {
          satisfactionSpan.textContent = theme === 'dark' ? '96%' : '94%';
        }
        // Trigger reflow for smooth transitions
        document.documentElement.style.setProperty('--transition-speed', '0.3s');
      }

      applyTheme(currentTheme);

      function showToast(message, isSuccess = true) {
        toastMsgSpan.innerHTML = message;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2800);
      }

      function toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        currentTheme = newTheme;
        applyTheme(currentTheme);
        showToast(`✨ Switched to ${newTheme === 'dark' ? 'Nightfall' : 'Radiance'} mode`);
      }

      themeBtn?.addEventListener('click', toggleTheme);
      demoMagic?.addEventListener('click', toggleTheme);

      // Mobile menu with enhanced UX
      if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          navMenu.classList.toggle('show');
          mobileToggle.innerHTML = navMenu.classList.contains('show') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        document.addEventListener('click', (e) => {
          if (window.innerWidth <= 860 && navMenu.classList.contains('show') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            navMenu.classList.remove('show');
            mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
          }
        });
        navLinks.forEach(link => {
          link.addEventListener('click', () => {
            if (window.innerWidth <= 860) {
              navMenu.classList.remove('show');
              mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
          });
        });
      }

      // Smooth scroll & active nav
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });

      const sections = document.querySelectorAll('section[id]');
      function setActiveNav() {
        let scrollPos = window.scrollY + 130;
        let found = false;
        sections.forEach(section => {
          if (section.id) {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
              found = true;
              navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${section.id}`) {
                  link.classList.add('active');
                }
              });
            }
          }
        });
        if (!found && window.scrollY < 80) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' || link.getAttribute('data-nav') === 'home') {
              link.classList.add('active');
            }
          });
        }
      }
      window.addEventListener('scroll', () => {
        setActiveNav();
        if (window.scrollY > 20) navbar?.classList.add('scrolled');
        else navbar?.classList.remove('scrolled');
      });
      setActiveNav();

      // Contact form
      const contactForm = document.getElementById('contactFormPro');
      if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          showToast('📬 Message sent! Our team will reply within minutes.');
          contactForm.reset();
        });
      }

      // Newsletter subscribe
      const subscribeBtn = document.getElementById('subscribeBtn');
      const subscribeEmail = document.getElementById('subscribeEmail');
      if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
          const email = subscribeEmail?.value.trim();
          if (email && email.includes('@')) {
            showToast('🎉 Subscribed! You\'ll get the latest updates.');
            subscribeEmail.value = '';
          } else {
            showToast('✉️ Please enter a valid email address.');
          }
        });
      }

      // Pricing buttons interaction
      document.querySelectorAll('.pricing-btn').forEach(btn => {
        btn.addEventListener('click', () => showToast('🚀 This is a demo — upgrade flow would start here'));
      });

      // System preference listener
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme-pref')) {
          currentTheme = e.matches ? 'dark' : 'light';
          applyTheme(currentTheme);
          showToast(`🔄 System theme synced: ${currentTheme} mode`);
        }
      });

      // Keyboard shortcut Alt + T
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 't') {
          e.preventDefault();
          toggleTheme();
        }
      });

      // Add ripple effect to buttons for better feedback
      document.querySelectorAll('.btn-modern, .theme-toggle').forEach(btn => {
        btn.addEventListener('click', function (e) {
          let ripple = document.createElement('span');
          ripple.classList.add('ripple-effect');
          ripple.style.position = 'absolute';
          ripple.style.borderRadius = '50%';
          ripple.style.backgroundColor = 'rgba(255,255,255,0.5)';
          ripple.style.width = '10px';
          ripple.style.height = '10px';
          ripple.style.transform = 'scale(0)';
          ripple.style.transition = 'transform 0.5s, opacity 0.5s';
          ripple.style.pointerEvents = 'none';
          this.style.position = 'relative';
          this.style.overflow = 'hidden';
          const rect = this.getBoundingClientRect();
          ripple.style.left = (e.clientX - rect.left) + 'px';
          ripple.style.top = (e.clientY - rect.top) + 'px';
          this.appendChild(ripple);
          setTimeout(() => { ripple.style.transform = 'scale(30)'; ripple.style.opacity = '0'; }, 10);
          setTimeout(() => ripple.remove(), 500);
        });
      });

      console.log('✨ ThemeSwitch Pro fully loaded — responsive & interactive');
    })();
  </script>