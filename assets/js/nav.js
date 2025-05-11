document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.c-navbar__toggle');
  const navLinks = document.querySelector('.c-navbar__links');
  const navItems = document.querySelectorAll('.c-navbar__link');

  function toggleTabIndex(isActive) {
    navLinks.querySelectorAll('a').forEach((link) => {
      link.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  // Toggle navigation menu
  function toggleNav() {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    // Don't set aria-hidden on the links container to keep it interactive
    // Just toggle the active class for styling
    navLinks.classList.toggle('c-navbar__links--active', !isExpanded);
  }

  // Close navigation menu
  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('c-navbar__links--active');
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
        // Navigation clicked analytics event
        // Optionally send tracking data here
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
      // Navigation transition completed - no action needed
    });
  }

  // Initialize active link highlighting
  highlightActiveLink();

  // Ensure search toggle is always accessible
  document.querySelector('.search-toggle')?.removeAttribute('inert');
});