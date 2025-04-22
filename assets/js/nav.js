document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = navLinks.querySelectorAll('a');
  console.log('Nav script loaded', { navToggle, navLinks });

  function toggleTabIndex(isActive) {
    navLinks.querySelectorAll('a').forEach((link) => {
      link.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  // Toggle navigation menu
  function toggleNav() {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navLinks.setAttribute('aria-hidden', isExpanded);
    navLinks.classList.toggle('active', !isExpanded);
  }

  // Close navigation menu
  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.setAttribute('aria-hidden', 'true');
    navLinks.classList.remove('active');
  }

  // Highlight active menu item
  function highlightActiveLink() {
    const currentPath = window.location.pathname;
    navItems.forEach((link) => {
      const isActive = link.getAttribute('href') === currentPath;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if (navToggle && navLinks) {
    navLinks.setAttribute('role', 'menu');

    navToggle.addEventListener('click', toggleNav);

    navToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleNav();
      }
    });

    document.addEventListener('click', (event) => {
      if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
        closeNav();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeNav();
      }
    });

    navItems.forEach((link) => {
      link.addEventListener('click', () => {
        closeNav();
        console.log(`Navigation clicked: ${link.getAttribute('data-analytics')}`);
      });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
          closeNav();
          toggleTabIndex(false);
        }
      }, 200);
    });

    navLinks.addEventListener('transitionend', () => {
      const isActive = navLinks.classList.contains('active');
      navLinks.setAttribute('aria-hidden', String(!isActive));
    });
  }

  // Initialize active link highlighting
  highlightActiveLink();
});