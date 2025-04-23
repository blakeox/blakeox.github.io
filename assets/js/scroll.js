document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', `#${targetId}`);
      }
    });
  });

  // Back-to-Top Button
  const backToTopButton = document.querySelector('.back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.remove('hidden');
      } else {
        backToTopButton.classList.add('hidden');
      }
    });

    backToTopButton.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.scrollIntoView({ behavior: 'smooth' });
      // Accessibility: move focus to body for screen readers/keyboard users
      document.body.setAttribute('tabindex', '-1');
      document.body.focus();
      document.body.addEventListener('blur', () => {
        document.body.removeAttribute('tabindex');
      }, { once: true });
    });
  }

  // Accordion Toggle for Quick Links
  const accordionToggle = document.querySelector('.accordion-toggle');
  const quickLinks = document.getElementById('footer-quick-links');

  if (accordionToggle && quickLinks) {
    accordionToggle.addEventListener('click', () => {
      const isExpanded = accordionToggle.getAttribute('aria-expanded') === 'true';
      accordionToggle.setAttribute('aria-expanded', !isExpanded);
      quickLinks.classList.toggle('expanded', !isExpanded);
    });
  }

  // Scroll-triggered animations
  const scrollElements = document.querySelectorAll('.scroll-animate');
  function handleScrollAnimations() {
    const windowHeight = window.innerHeight;

    scrollElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < windowHeight - 100) {
        element.classList.add('visible');
      } else {
        element.classList.remove('visible');
      }
    });
  }

  // Add scroll event listener
  window.addEventListener('scroll', handleScrollAnimations);

  // Trigger scroll animations on page load
  handleScrollAnimations();
});