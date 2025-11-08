document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const html = document.documentElement;

  // Function to update icon and localStorage
  const setTheme = (isDark) => {
    if (isDark) {
      html.classList.add("dark");
      themeIcon.className = "fas fa-sun";
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      themeIcon.className = "fas fa-moon";
      localStorage.setItem("theme", "light");
    }
  };

  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  // Initialize theme
  if (savedTheme) {
    setTheme(savedTheme === "dark");
  } else {
    setTheme(systemPrefersDark);
  }

  // Toggle theme on button click
  themeToggle.addEventListener("click", () => {
    const isDark = html.classList.contains("dark");
    setTheme(!isDark);
  });

  // Watch for system theme changes (if no localStorage preference)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches);
      }
    });
});
