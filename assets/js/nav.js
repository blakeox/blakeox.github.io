document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  console.log('Nav script loaded', { navToggle, navLinks });

  function toggleTabIndex(isActive) {
    navLinks.querySelectorAll('a').forEach((link) => {
      link.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  if (navToggle && navLinks) {
    navLinks.setAttribute('role', 'menu');

    navToggle.addEventListener('click', () => {
      const isActive = navLinks.classList.toggle('active');
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.setAttribute('aria-hidden', String(!isActive));
      toggleTabIndex(isActive);
    });

    navToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navLinks.classList.toggle('active');
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
      }
    });

    document.addEventListener('click', (event) => {
      if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
        if (navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
          navLinks.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
          navLinks.setAttribute('aria-hidden', 'true');
          toggleTabIndex(false);
        }
      }, 200);
    });

    navLinks.addEventListener('transitionend', () => {
      const isActive = navLinks.classList.contains('active');
      navLinks.setAttribute('aria-hidden', String(!isActive));
    });
  }
});