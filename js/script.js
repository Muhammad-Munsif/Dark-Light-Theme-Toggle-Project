
(function () {
  // DOM Elements
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const demoToggle = document.getElementById('demoToggle');
  const themeIcon = document.getElementById('themeIcon');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const satisfactionStat = document.getElementById('satisfactionStat');
  const navLinks = document.querySelectorAll('.nav-link');

  // Current theme
  let currentTheme = localStorage.getItem('theme-preference') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // Apply initial theme
  body.setAttribute('data-theme', currentTheme);
  updateUI();

  // Theme toggle function
  function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme-preference', currentTheme);
    updateUI();
    showToast(`Switched to ${currentTheme} mode`);
  }

  // Update UI elements based on theme
  function updateUI() {
    // Update icon
    if (themeIcon) {
      themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Update satisfaction stat (just for demo)
    if (satisfactionStat) {
      satisfactionStat.textContent = currentTheme === 'dark' ? '87%' : '63%';
    }
  }

  // Show toast notification
  function showToast(message) {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
      mobileToggle.innerHTML = navMenu.classList.contains('show')
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navMenu.classList.remove('show');
          mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 &&
        !navMenu.contains(e.target) &&
        !mobileToggle.contains(e.target) &&
        navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  }

  // Event listeners
  themeToggle?.addEventListener('click', toggleTheme);
  demoToggle?.addEventListener('click', toggleTheme);

  // Keyboard shortcut (Alt+T)
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 't') {
      e.preventDefault();
      toggleTheme();
    }
  });

  // System preference change
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme-preference')) {
      currentTheme = e.matches ? 'dark' : 'light';
      body.setAttribute('data-theme', currentTheme);
      updateUI();
    }
  });

  // Contact form submission
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! We\'ll get back to you soon.');
    e.target.reset();
  });

  // Set active nav link based on scroll
  function setActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveNav);

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
