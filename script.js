// Function to set theme immediately based on preference or system
(function initializeTheme() {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  // Apply theme without relying on DOMContentLoaded for a smooth initial load
  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
})();

// Wait for the full page load to attach the click listener
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const html = document.documentElement;

  // Check if elements exist before proceeding
  if (!themeToggle || !themeIcon) {
    console.error("Theme toggle button or icon not found.");
    return;
  }

  // Function to update icon and localStorage (called after initialization)
  const updateIconAndStorage = (isDark) => {
    if (isDark) {
      themeIcon.className = "fas fa-sun";
      localStorage.setItem("theme", "dark");
    } else {
      themeIcon.className = "fas fa-moon";
      localStorage.setItem("theme", "light");
    }
  };

  // Set the initial icon state based on the already-applied theme class
  updateIconAndStorage(html.classList.contains("dark"));

  // Toggle theme on button click
  themeToggle.addEventListener("click", () => {
    const isDark = html.classList.toggle("dark"); // Toggle the class and get the new state
    updateIconAndStorage(isDark);
  });

  // Watch for system theme changes (if no localStorage preference set)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        const isDark = e.matches;
        isDark ? html.classList.add("dark") : html.classList.remove("dark");
        updateIconAndStorage(isDark);
      }
    });
});
