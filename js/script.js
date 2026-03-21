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

      // Get saved theme or system preference
      let currentTheme = localStorage.getItem('theme-pref');

      if (!currentTheme) {
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      // Apply theme function - fully working
      function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme-pref', theme);

        // Update icon
        if (themeIcon) {
          if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
          } else {
            themeIcon.className = 'fas fa-moon';
          }
        }

        // Update satisfaction stat for demo fun
        if (satisfactionSpan) {
          satisfactionSpan.textContent = theme === 'dark' ? '96%' : '94%';
        }

        // Force body background update
        body.style.backgroundColor = 'var(--bg-primary)';
      }

      // Initial apply
      applyTheme(currentTheme);

      // Show toast notification
      function showToast(message) {
        toastMsgSpan.innerHTML = message;
        toastEl.classList.add('show');
        setTimeout(() => {
          toastEl.classList.remove('show');
        }, 2800);
      }

      // Toggle theme function
      function toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        currentTheme = newTheme;
        applyTheme(currentTheme);
        showToast(`✨ Switched to ${newTheme === 'dark' ? 'Nightfall' : 'Radiance'} mode`);
      }

      // Event listeners for theme toggle
      if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
      }

      if (demoMagic) {
        demoMagic.addEventListener('click', toggleTheme);
      }

      // Mobile menu toggle
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
              if (mobileToggle) mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
          });
        });
      }

      // Smooth scroll for anchor links
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

      // Active nav on scroll
      const sections = document.querySelectorAll('section[id]');
      function setActiveNav() {
        let scrollPos = window.scrollY + 120;
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

        if (!found && window.scrollY < 100) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' || link.getAttribute('data-nav') === 'home') {
              link.classList.add('active');
            }
          });
        }
      }

      window.addEventListener('scroll', setActiveNav);
      setActiveNav();

      // Contact form submission
      const contactForm = document.getElementById('contactFormPro');
      if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          showToast('📬 Message sent! Our team will reply within minutes.');
          contactForm.reset();
        });
      }

      // System preference change listener (only if no user pref)
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

      console.log('Theme system initialized. Current theme:', currentTheme);
    })();
  </script>