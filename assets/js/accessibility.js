document.addEventListener('DOMContentLoaded', () => {
  // Skip to Content Link
  const skipLink = document.querySelector('.skip-to-content');
  if (skipLink) {
    skipLink.addEventListener('click', (event) => {
      const targetId = skipLink.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        event.preventDefault();
        targetElement.setAttribute('tabindex', '-1'); // Make it focusable
        targetElement.focus();
        targetElement.addEventListener('blur', () => {
          targetElement.removeAttribute('tabindex'); // Remove tabindex after focus
        });
      }
    });
  }

  // Manage Focus for Modals
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => {
    const closeButton = modal.querySelector('.modal-close');
    const focusableElements = modal.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      } else if (event.key === 'Escape') {
        // Close modal on Escape key
        if (closeButton) closeButton.click();
      }
    });
  });

  // Add ARIA Live Regions for Dynamic Content
  const liveRegions = document.querySelectorAll('[aria-live]');
  liveRegions.forEach((region) => {
    region.setAttribute('aria-live', 'polite');
  });

  // Ensure Accessible Dropdowns
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        menu.classList.toggle('hidden', isExpanded);
      });

      toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          toggle.setAttribute('aria-expanded', 'false');
          menu.classList.add('hidden');
        }
      });
    }
  });
});