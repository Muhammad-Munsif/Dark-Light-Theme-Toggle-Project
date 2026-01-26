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
        const currentThemeIcon = document.getElementById('current-theme-icon');
        const currentThemeText = document.getElementById('current-theme-text');
        
        if (themeIcon) {
          themeIcon.className = theme === this.config.THEMES.DARK ? 
            this.config.ICONS.DARK : this.config.ICONS.LIGHT;
        }
        
        if (currentThemeIcon) {
          currentThemeIcon.className = theme === this.config.THEMES.DARK ? 
            this.config.ICONS.DARK : this.config.ICONS.LIGHT;
        }
        
        if (currentThemeText) {
          currentThemeText.textContent = theme === this.config.THEMES.DARK ? 
            'Dark Mode' : 'Light Mode';
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
      }

      resetToSystem() {
        localStorage.removeItem(this.config.STORAGE_KEY);
        this.loadTheme();
        
        // Show notification
        this.showToast('Reset to system default theme', 'info');
      }

      updateSatisfactionMetrics() {
        const satisfaction = this.currentTheme === this.config.THEMES.DARK ? 
          this.config.SATISFACTION_RATES.DARK : this.config.SATISFACTION_RATES.LIGHT;
        
        const percentageEl = document.getElementById('satisfaction-percentage');
        const usageEl = document.getElementById('theme-usage');
        
        if (percentageEl) percentageEl.textContent = `${satisfaction}%`;
        if (usageEl) usageEl.textContent = `${satisfaction}%`;
        
        this.updateSatisfactionBar();
      }

      updateSatisfactionBar() {
        const satisfaction = this.currentTheme === this.config.THEMES.DARK ? 
          this.config.SATISFACTION_RATES.DARK : this.config.SATISFACTION_RATES.LIGHT;
        
        const bar = document.getElementById('satisfaction-bar');
        if (bar) {
          bar.style.width = `${satisfaction}%`;
        }
      }

      toggleAutoCycle() {
        if (this.isAutoCycling) {
          this.stopAutoCycle();
        } else {
          this.startAutoCycle();
        }
      }

      startAutoCycle() {
        this.isAutoCycling = true;
        const autoToggleBtn = document.getElementById('auto-toggle');
        if (autoToggleBtn) {
          autoToggleBtn.innerHTML = '<i class="fas fa-stop me-2"></i>Stop Auto Cycle';
          autoToggleBtn.classList.remove('btn-outline-primary');
          autoToggleBtn.classList.add('btn-danger');
        }
        
        this.autoCycleInterval = setInterval(() => {
          this.toggleTheme();
        }, 2000);
        
        this.showToast('Auto theme cycling started', 'success');
      }

      stopAutoCycle() {
        this.isAutoCycling = false;
        clearInterval(this.autoCycleInterval);
        
        const autoToggleBtn = document.getElementById('auto-toggle');
        if (autoToggleBtn) {
          autoToggleBtn.innerHTML = '<i class="fas fa-clock me-2"></i>Auto Cycle';
          autoToggleBtn.classList.remove('btn-danger');
          autoToggleBtn.classList.add('btn-outline-primary');
        }
        
        this.showToast('Auto theme cycling stopped', 'warning');
      }

      setupEventListeners() {
        // Theme toggle button
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Demo toggle button
        document.getElementById('demo-toggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Quick toggle button
        document.getElementById('quick-toggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Auto cycle button
        document.getElementById('auto-toggle')?.addEventListener('click', () => this.toggleAutoCycle());
        
        // Reset button
        document.getElementById('reset-theme')?.addEventListener('click', () => this.resetToSystem());
        
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
          
          if (e.altKey && e.key === 'a') {
            e.preventDefault();
            this.toggleAutoCycle();
          }
        });

        // Focus styles for accessibility
        document.addEventListener('keyup', (e) => {
          if (e.key === 'Tab') {
            document.documentElement.classList.add('focus-visible');
          }
        });

        document.addEventListener('click', (e) => {
          if (e.detail === 0) {
            document.documentElement.classList.remove('focus-visible');
          }
        });
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

      showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-${type}`;
        toast.style.cssText = `
          position: fixed;
          bottom: 80px;
          right: 20px;
          padding: 12px 20px;
          background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#2196F3'};
          color: white;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          z-index: 1000;
          transform: translateX(150%);
          transition: transform 0.4s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          max-width: 300px;
        `;
        
        const icon = type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
          toast.style.transform = 'translateX(150%)';
          setTimeout(() => {
            document.body.removeChild(toast);
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
  </script>