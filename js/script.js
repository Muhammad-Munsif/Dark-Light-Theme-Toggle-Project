<script>
    // Enhanced Theme Management System
    class ThemeManager {
      constructor() {
        this.config = {
          STORAGE_KEY: 'theme-preference',
          THEMES: {
            LIGHT: 'light',
            DARK: 'dark'
          },
          ICONS: {
            LIGHT: 'fas fa-sun',
            DARK: 'fas fa-moon'
          },
          SATISFACTION_RATES: {
            LIGHT: 63,
            DARK: 87
          }
        };

        this.currentTheme = null;
        this.autoCycleInterval = null;
        this.isAutoCycling = false;
      }

      init() {
        this.loadTheme();
        this.setupEventListeners();
        this.setupAnimations();
        this.updateSatisfactionBar();
        this.setupMobileMenu();
      }

      loadTheme() {
        const savedTheme = localStorage.getItem(this.config.STORAGE_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.currentTheme = savedTheme ||
          (systemPrefersDark ? this.config.THEMES.DARK : this.config.THEMES.LIGHT);

        this.applyTheme(this.currentTheme);
      }

      applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;

        // Update icons
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
          themeIcon.className = theme === this.config.THEMES.DARK ?
            this.config.ICONS.DARK : this.config.ICONS.LIGHT;
        }

        // Update satisfaction metrics
        this.updateSatisfactionMetrics();

        // Save preference
        localStorage.setItem(this.config.STORAGE_KEY, theme);

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
      }

      toggleTheme() {
        const newTheme = this.currentTheme === this.config.THEMES.DARK ?
          this.config.THEMES.LIGHT : this.config.THEMES.DARK;

        this.applyTheme(newTheme);
        this.showToast(`Switched to ${newTheme} mode`, 'success');
      }

      updateSatisfactionMetrics() {
        const satisfaction = this.currentTheme === this.config.THEMES.DARK ?
          this.config.SATISFACTION_RATES.DARK : this.config.SATISFACTION_RATES.LIGHT;

        const percentageEl = document.getElementById('satisfaction-percentage');
        const usageEl = document.getElementById('theme-usage');
        const barEl = document.getElementById('satisfaction-bar');

        if (percentageEl) percentageEl.textContent = `${satisfaction}%`;
        if (usageEl) usageEl.textContent = `${satisfaction}%`;
        if (barEl) barEl.style.width = `${satisfaction}%`;
      }

      setupEventListeners() {
        // Theme toggle buttons
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('demo-toggle')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('quick-toggle')?.addEventListener('click', () => this.toggleTheme());

        // System preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem(this.config.STORAGE_KEY)) {
            const newTheme = e.matches ? this.config.THEMES.DARK : this.config.THEMES.LIGHT;
            this.applyTheme(newTheme);
          }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
          if (e.altKey && e.key === 't') {
            e.preventDefault();
            this.toggleTheme();
          }
        });

        // Touch gestures for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          const swipeDistance = touchEndX - touchStartX;
          
          // Swipe right to toggle theme (only on mobile)
          if (Math.abs(swipeDistance) > 100 && window.innerWidth < 768) {
            if (swipeDistance > 0) {
              this.toggleTheme();
            }
          }
        });

        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
          const now = Date.now();
          if (now - lastTouchEnd <= 300) {
            e.preventDefault();
          }
          lastTouchEnd = now;
        }, { passive: false });
      }

      setupAnimations() {
        // Add loaded class to elements
        document.querySelectorAll('.animate-fade-in-up').forEach((el, index) => {
          setTimeout(() => {
            el.classList.add('loaded');
          }, index * 100);
        });

        // Prevent FOUC
        document.body.style.opacity = 0;
        window.addEventListener('DOMContentLoaded', () => {
          document.body.style.transition = 'opacity 0.3s';
          document.body.style.opacity = 1;
        });
      }

      setupMobileMenu() {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const mobileBackdrop = document.getElementById('mobileBackdrop');

        if (navbarToggler && mobileBackdrop) {
          navbarToggler.addEventListener('click', () => {
            const isExpanded = navbarToggler.getAttribute('aria-expanded') === 'true';
            mobileBackdrop.classList.toggle('show', !isExpanded);
          });

          mobileBackdrop.addEventListener('click', () => {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) {
              bsCollapse.hide();
              mobileBackdrop.classList.remove('show');
            }
          });

          // Close menu when clicking a link
          document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
              const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
              if (bsCollapse && window.innerWidth < 992) {
                bsCollapse.hide();
                mobileBackdrop.classList.remove('show');
              }
            });
          });
        }
      }

      showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          background: var(--card-bg);
          color: var(--text-color);
          border-radius: 10px;
          box-shadow: var(--box-shadow-dark);
          z-index: 1050;
          transform: translateX(150%);
          transition: transform 0.4s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 350px;
        `;

        const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
          toast.classList.add('show');
        });

        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
            if (toast.parentNode) {
              document.body.removeChild(toast);
            }
          }, 400);
        }, 3000);
      }
    }

    // Initialize Theme Manager
    const themeManager = new ThemeManager();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => themeManager.init());
    } else {
      themeManager.init();
    }

    // Apply theme immediately to prevent FOUC
    (function preventFOUC() {
      const savedTheme = localStorage.getItem('theme-preference');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      document.body.setAttribute('data-theme', initialTheme);
    })();

    // Handle responsive image loading
    function handleImageLoading() {
      const images = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }

    // Initialize image lazy loading
    document.addEventListener('DOMContentLoaded', handleImageLoading);

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    });

    // Add active class to current page in navigation
    function setActiveNavLink() {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    document.addEventListener('DOMContentLoaded', setActiveNavLink);
  </script>