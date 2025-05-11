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
    navLinks.setAttribute('aria-hidden', isExpanded);
    // Apply inert only to nav links except the search toggle button
    navLinks.querySelectorAll('.c-navbar__link:not(.search-toggle)').forEach(el => {
      if (isExpanded) el.removeAttribute('inert');
      else el.setAttribute('inert', '');
    });
    navLinks.classList.toggle('c-navbar__links--active', !isExpanded);
  }

  // Close navigation menu
  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.setAttribute('aria-hidden', 'true');
    navLinks.setAttribute('inert', '');
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
      const isActive = navLinks.classList.contains('c-navbar__links--active');
      navLinks.setAttribute('aria-hidden', String(!isActive));
      // Update inert on individual links (excluding search-toggle)
      navLinks.querySelectorAll('.c-navbar__link:not(.search-toggle)').forEach(el => {
        if (!isActive) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
      });
    });
  }

  // Initialize active link highlighting
  highlightActiveLink();
});