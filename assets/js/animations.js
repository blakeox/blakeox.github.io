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

// Interactive Timeline Toggle (Accordion behavior)
window.addEventListener('DOMContentLoaded', () => {
  const triggers = document.querySelectorAll('.timeline-trigger');
  triggers.forEach((btn, index) => {
    const details = btn.nextElementSibling;
    // Set ARIA controls
    const id = `timeline-details-${index}`;
    details.setAttribute('id', id);
    btn.setAttribute('aria-controls', id);
    btn.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');

    btn.addEventListener('click', () => {
      // Close all
      triggers.forEach(t => {
        t.nextElementSibling.classList.remove('open');
        t.classList.remove('open');
        t.setAttribute('aria-expanded', 'false');
      });
      // Toggle current
      const isOpen = details.classList.toggle('open');
      btn.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen.toString());
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); btn.click();
      }
    });
    btn.setAttribute('tabindex', '0');
  });
});

// Update sticky current year on scroll
window.addEventListener('DOMContentLoaded', () => {
  const currentYearEl = document.getElementById('timeline-current-year');
  const items = document.querySelectorAll('.timeline-item');
  if (currentYearEl && items.length) {
    const yearObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const year = entry.target.getAttribute('data-year');
          currentYearEl.textContent = year;
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    items.forEach(item => yearObserver.observe(item));
  }
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

// Debounce utility for performance
function debounce(func, wait = 50) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Timeline progress dots, auto-scroll, and card pop-in
window.addEventListener('DOMContentLoaded', () => {
  const timeline = document.querySelector('.timeline');
  const dots = document.querySelectorAll('.timeline-dots li');
  const items = document.querySelectorAll('.timeline > li');
  if (!timeline || !dots.length || !items.length) return;

  // Use IntersectionObserver for card visibility instead of manual scroll
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.2 });
  items.forEach(item => cardObserver.observe(item));

  // Debounced dots update
  function updateDots() {
    let activeIdx = 0;
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      if (rect.left < window.innerWidth / 2) activeIdx = i;
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIdx));
  }
  const debouncedUpdateDots = debounce(updateDots);
  window.addEventListener('scroll', debouncedUpdateDots, { passive: true });
  window.addEventListener('resize', debouncedUpdateDots);
  updateDots();

  // Dot click scrolls to card
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  // Auto-scroll to current on load (desktop only)
  if (window.innerWidth >= 768) {
    setTimeout(() => {
      const active = document.querySelector('.timeline > li.visible') || items[0];
      if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 400);
  }
});

// Timeline progress bar and keyboard navigation
window.addEventListener('DOMContentLoaded', () => {
  const timelineSection = document.getElementById('about-timeline');
  const progressBar = document.querySelector('.timeline-progress-bar');
  const timeline = document.querySelector('.timeline');
  const items = document.querySelectorAll('.timeline > li');
  if (!timelineSection || !progressBar || !items.length) return;

  // Animate progress bar as you scroll through timeline
  function updateTimelineProgress() {
    const rect = timelineSection.getBoundingClientRect();
    const winH = window.innerHeight;
    if (rect.top > winH || rect.bottom < 0) {
      progressBar.style.width = '0%';
      return;
    }
    // Find the most visible card
    let maxVisible = 0, activeIdx = 0;
    items.forEach((item, i) => {
      const r = item.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, winH) - Math.max(r.top, 0));
      if (visible > maxVisible) {
        maxVisible = visible;
        activeIdx = i;
      }
    });
    const percent = ((activeIdx + 1) / items.length) * 100;
    progressBar.style.width = percent + '%';
  }
  const debouncedProgress = debounce(updateTimelineProgress);
  window.addEventListener('scroll', debouncedProgress, { passive: true });
  window.addEventListener('resize', debouncedProgress);
  updateTimelineProgress();

  // Keyboard navigation (left/right arrows)
  timeline.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('timeline-trigger')) {
      let idx = Array.from(items).findIndex(li => li.contains(e.target));
      if (e.key === 'ArrowRight' && idx < items.length - 1) {
        const nextBtn = items[idx + 1].querySelector('.timeline-trigger');
        if (nextBtn) nextBtn.focus();
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        const prevBtn = items[idx - 1].querySelector('.timeline-trigger');
        if (prevBtn) prevBtn.focus();
      }
    }
  });
});