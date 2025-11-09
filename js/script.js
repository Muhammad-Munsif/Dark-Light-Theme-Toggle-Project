// <!-- Theme Management Script -->

// Centralized Theme Configuration
const ThemeConfig = {
  STORAGE_KEY: "theme-preference",
  THEMES: {
    LIGHT: "light",
    DARK: "dark",
  },
  ICONS: {
    LIGHT: "fas fa-moon",
    DARK: "fas fa-sun",
  },
};

// Theme Manager
const ThemeManager = {
  currentTheme: null,

  // Initialize theme
  init() {
    // Get saved theme or system preference
    const savedTheme = localStorage.getItem(ThemeConfig.STORAGE_KEY);
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    this.currentTheme =
      savedTheme ||
      (systemPrefersDark ? ThemeConfig.THEMES.DARK : ThemeConfig.THEMES.LIGHT);

    // Apply theme
    this.applyTheme(this.currentTheme);

    // Set up event listeners
    this.setupEventListeners();

    // Adjust for screen size
    this.adjustForScreenSize();

    // Initialize demo button
    this.initDemoButton();
  },

  // Apply theme to the document
  applyTheme(theme) {
    // Update data attribute
    document.body.setAttribute("data-theme", theme);

    // Update theme icon
    const themeIcon = document.getElementById("theme-icon");
    if (themeIcon) {
      themeIcon.className =
        theme === ThemeConfig.THEMES.DARK
          ? ThemeConfig.ICONS.DARK
          : ThemeConfig.ICONS.LIGHT;
    }

    // Update button classes
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.style.background =
        theme === ThemeConfig.THEMES.DARK
          ? "linear-gradient(135deg, #8b85ff 0%, #ff7b95 100%)"
          : "linear-gradient(135deg, #6c63ff 0%, #ff6584 100%)";
    }

    // Update stats based on theme
    this.updateStats(theme);

    // Save preference
    localStorage.setItem(ThemeConfig.STORAGE_KEY, theme);
    this.currentTheme = theme;
  },

  // Toggle between themes
  toggleTheme() {
    const newTheme =
      this.currentTheme === ThemeConfig.THEMES.DARK
        ? ThemeConfig.THEMES.LIGHT
        : ThemeConfig.THEMES.DARK;

    this.applyTheme(newTheme);
  },

  // Set up event listeners
  setupEventListeners() {
    // Theme toggle button
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    // System preference changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        // Only update if no explicit preference is set
        if (!localStorage.getItem(ThemeConfig.STORAGE_KEY)) {
          const newTheme = e.matches
            ? ThemeConfig.THEMES.DARK
            : ThemeConfig.THEMES.LIGHT;
          this.applyTheme(newTheme);
        }
      });

    // Window resize for responsive adjustments
    window.addEventListener("resize", () => {
      this.adjustForScreenSize();
    });
  },

  // Adjust UI for different screen sizes
  adjustForScreenSize() {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) return;

    if (window.innerWidth < 576) {
      // Extra small devices
      themeToggle.classList.add("p-2");
      themeToggle.classList.remove("p-3", "p-4");
    } else if (window.innerWidth < 768) {
      // Small devices
      themeToggle.classList.add("p-3");
      themeToggle.classList.remove("p-2", "p-4");
    } else {
      // Medium devices and up
      themeToggle.classList.add("p-3");
      themeToggle.classList.remove("p-2", "p-4");
    }
  },

  // Initialize demo button
  initDemoButton() {
    const demoButton = document.getElementById("demo-toggle");
    if (demoButton) {
      demoButton.addEventListener("click", () => {
        this.toggleTheme();
      });
    }
  },

  // Update stats based on theme
  updateStats(theme) {
    const statsElement = document.getElementById("theme-usage");
    if (statsElement) {
      if (theme === ThemeConfig.THEMES.DARK) {
        statsElement.textContent = "72%";
        statsElement.nextElementSibling.textContent =
          "Users prefer dark mode at night";
      } else {
        statsElement.textContent = "63%";
        statsElement.nextElementSibling.textContent =
          "Users keep light mode during day";
      }
    }
  },
};

// Initialize theme manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
});

// Apply theme immediately to prevent FOUC (Flash of Unstyled Content)
(function preventFOUC() {
  const savedTheme = localStorage.getItem(ThemeConfig.STORAGE_KEY);
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const initialTheme =
    savedTheme ||
    (systemPrefersDark ? ThemeConfig.THEMES.DARK : ThemeConfig.THEMES.LIGHT);
  document.body.setAttribute("data-theme", initialTheme);
})();
