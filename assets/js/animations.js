document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade-in Animation
  function fadeIn(element, delay = 0) {
    if (prefersReducedMotion) return; // Skip animations if reduced motion is preferred
    element.style.opacity = 0;
    element.style.transition = `opacity 0.5s ease ${delay}s`;
    element.style.opacity = 1;
  }

  // Apply fade-in to elements with the class 'fade-in'
  const fadeInElements = document.querySelectorAll('.fade-in');
  fadeInElements.forEach((element, index) => {
    fadeIn(element, index * 0.2); // Stagger animations
  });

  // Scroll-triggered Animations
  function handleScrollAnimations() {
    const scrollElements = document.querySelectorAll('.scroll-animate');
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

  // Trigger scroll animations on load
  handleScrollAnimations();

  // Utility: Animate elements with a specific class
  function animateOnEvent(selector, animationClass, event = 'click') {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.addEventListener(event, () => {
        element.classList.add(animationClass);
        setTimeout(() => {
          element.classList.remove(animationClass); // Remove class after animation ends
        }, 1000); // Adjust timeout to match animation duration
      });
    });
  }

  // Example: Add a bounce animation to buttons on click
  animateOnEvent('.btn', 'bounce', 'click');
});

// Interactive Timeline Toggle
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.timeline-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.nextElementSibling.classList.toggle('open');
    });
  });
});

// Animated Stats Counters
window.addEventListener('DOMContentLoaded', () => {
  const animateCount = el => {
    const target = +el.dataset.target;
    let count = 0;
    const step = target / 200;
    const tick = () => {
      count += step;
      el.textContent = Math.floor(count);
      if (count < target) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    tick();
  };
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animateCount(entry.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat span').forEach(el => statsObserver.observe(el));
});