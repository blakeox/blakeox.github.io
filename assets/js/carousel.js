document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach((carousel) => {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevButton = carousel.querySelector('.carousel-prev');
    const nextButton = carousel.querySelector('.carousel-next');
    const indicators = carousel.querySelectorAll('.carousel-indicator');
    let currentIndex = 0;
    let autoplayInterval;

    // Helper function to update the active slide
    function updateSlides(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
        slide.setAttribute('aria-hidden', i !== index);
      });

      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
        indicator.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    // Show the next slide
    function showNextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlides(currentIndex);
    }

    // Show the previous slide
    function showPrevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlides(currentIndex);
    }

    // Start autoplay
    function startAutoplay() {
      autoplayInterval = setInterval(showNextSlide, 5000); // Change slide every 5 seconds
    }

    // Stop autoplay
    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    // Event listeners for navigation buttons
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        stopAutoplay();
        showNextSlide();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        stopAutoplay();
        showPrevSlide();
      });
    }

    // Event listeners for indicators
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        stopAutoplay();
        currentIndex = index;
        updateSlides(currentIndex);
      });
    });

    // Keyboard navigation
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        stopAutoplay();
        showNextSlide();
      } else if (event.key === 'ArrowLeft') {
        stopAutoplay();
        showPrevSlide();
      }
    });

    // Initialize the carousel
    updateSlides(currentIndex);
    startAutoplay();

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
  });
});