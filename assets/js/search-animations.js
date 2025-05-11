/**
 * Search Animations Module
 * Provides animation functionality for the search overlay
 */
class SearchAnimations {
  constructor(overlay) {
    this.overlay = overlay;
    this.container = overlay.querySelector('.c-search-overlay__container');
    this.input = overlay.querySelector('.c-search-overlay__input');
    this.searchResults = overlay.querySelector('.c-search-overlay__results');
    this.suggestions = overlay.querySelector('.c-search-overlay__suggestions');
    this.header = overlay.querySelector('.c-search-overlay__header');
    this.form = overlay.querySelector('.c-search-overlay__form');
    this.animationsEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for browser support
    this.hasIntersectionObserver = 'IntersectionObserver' in window;
    this.hasAnimationAPI = 'animate' in document.createElement('div');
    
    this.initAnimationObservers();
    this.initEventListeners();
  }

  // Initialize intersection observers to trigger animations when elements come into view
  initAnimationObservers() {
    if (!this.hasIntersectionObserver || !this.animationsEnabled) return;

    // Observer for results items
    this.resultsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.resultsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
  }

  initEventListeners() {
    // Listen for theme changes to adjust animations
    this.overlay.addEventListener('themechange', (e) => this.applyThemeAnimations(e.detail.theme));
  }

  // Opening animation sequence
  animateOpen() {
    if (!this.animationsEnabled) {
      this.overlay.classList.add('instant-open');
      return Promise.resolve();
    }

    // Reset animation classes
    this.overlay.classList.remove('c-search-overlay--closing');
    
    // Add tech scan effect to container
    this.container.classList.add('tech-scan-effect');
    
    // Animate container entrance
    const containerAnimation = this.hasAnimationAPI ? 
      this.container.animate([
        { opacity: 0, transform: 'translateY(-20px) scale(0.98)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.2, 0.9, 0.4, 1.0)',
        fill: 'forwards'
      }) : null;
      
    // Staggered animation for header elements
    this.animateStaggered(
      this.header.children, 
      { opacity: 0, transform: 'translateY(-15px)' },
      { opacity: 1, transform: 'translateY(0)' },
      { duration: 250, delay: 100, stagger: 80 }
    );
    
    // Add glow pulse to search input
    setTimeout(() => {
      this.input.classList.add('animate-pulse-glow');
    }, 400);
    
    return new Promise(resolve => {
      setTimeout(() => {
        this.input.focus();
        resolve();
      }, 300);
    });
  }

  // Closing animation sequence
  animateClose() {
    if (!this.animationsEnabled) {
      return Promise.resolve();
    }
    
    this.overlay.classList.add('c-search-overlay--closing');
    
    // Animate container exit
    const containerAnimation = this.hasAnimationAPI ?
      this.container.animate([
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0.95)' }
      ], {
        duration: 200,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      }) : null;
    
    return new Promise(resolve => {
      setTimeout(resolve, 200);
    });
  }

  // Animate search results appearing
  animateResults(resultsItems) {
    if (!this.animationsEnabled || !resultsItems.length) return;
    
    // Remove previous animations
    Array.from(this.searchResults.querySelectorAll('.visible'))
      .forEach(el => el.classList.remove('visible'));
    
    // Observe new items for animation
    resultsItems.forEach(item => {
      if (this.hasIntersectionObserver) {
        this.resultsObserver.observe(item);
      } else {
        // Fallback for browsers without IntersectionObserver
        setTimeout(() => {
          item.classList.add('visible');
        }, 50);
      }
    });
  }

  // Create a ripple effect on button clicks
  createRipple(event, element) {
    if (!this.animationsEnabled) return;
    
    const button = element || event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.classList.add('search-wave');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  // Typing animation for search input placeholders
  animateTypingPlaceholder(phrases, options = {}) {
    if (!this.animationsEnabled || !this.input) return;
    
    const defaults = {
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1500,
      startDelay: 500,
      loop: true
    };
    
    const settings = { ...defaults, ...options };
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isWaiting = false;
    
    const type = () => {
      if (!this.input) return; // Check if input still exists
      
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        // Removing characters
        this.input.setAttribute('placeholder', currentPhrase.substring(0, charIndex - 1));
        charIndex--;
        
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(type, settings.startDelay);
          return;
        }
      } else {
        // Adding characters
        this.input.setAttribute('placeholder', currentPhrase.substring(0, charIndex + 1));
        charIndex++;
        
        if (charIndex === currentPhrase.length) {
          if (settings.loop) {
            isDeleting = true;
            isWaiting = true;
            setTimeout(type, settings.backDelay);
            return;
          } else {
            return; // End if no loop
          }
        }
      }
      
      const speedFactor = isDeleting ? settings.backSpeed : settings.typeSpeed;
      const randomDelay = Math.random() * 40 - 20; // Add natural typing variance
      
      setTimeout(type, speedFactor + randomDelay);
    };
    
    // Start typing animation
    setTimeout(type, settings.startDelay);
  }
  
  // Apply theme-specific animations
  applyThemeAnimations(theme) {
    const themeAnimations = {
      'default': {
        scanLines: true,
        particleDensity: 'medium',
        glowIntensity: 'medium'
      },
      'dark': {
        scanLines: true,
        particleDensity: 'high',
        glowIntensity: 'high'
      },
      'light': {
        scanLines: false,
        particleDensity: 'low',
        glowIntensity: 'low'
      },
      'neon': {
        scanLines: true,
        particleDensity: 'high',
        glowIntensity: 'max'
      },
      'cyberpunk': {
        scanLines: true,
        particleDensity: 'medium',
        glowIntensity: 'high'
      }
    };
    
    const settings = themeAnimations[theme] || themeAnimations['default'];
    
    // Apply theme-specific animation settings
    if (settings.scanLines) {
      this.container.classList.add('scan-lines');
    } else {
      this.container.classList.remove('scan-lines');
    }
    
    // Set data attributes for CSS to pick up
    this.container.dataset.glowIntensity = settings.glowIntensity;
    this.container.dataset.particleDensity = settings.particleDensity;
  }
  
  // Utility function to animate elements in a staggered sequence
  animateStaggered(elements, fromStyles, toStyles, options = {}) {
    if (!this.animationsEnabled || !this.hasAnimationAPI) return;
    
    const defaults = {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
      delay: 0,
      stagger: 50
    };
    
    const settings = { ...defaults, ...options };
    
    Array.from(elements).forEach((el, index) => {
      setTimeout(() => {
        el.animate([fromStyles, toStyles], {
          duration: settings.duration,
          easing: settings.easing,
          fill: settings.fill
        });
      }, settings.delay + (index * settings.stagger));
    });
  }
}

// Export for use in other modules
window.SearchAnimations = SearchAnimations;

// Initialize on document load if overlay exists
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('search-overlay');
  if (overlay && typeof SearchOverlay !== 'undefined') {
    // Add animation capabilities to existing search overlay
    SearchOverlay.prototype.animations = null;
    
    const initializeSearchAnimations = (overlay) => {
      const animations = new SearchAnimations(overlay);
      SearchOverlay.prototype.animations = animations;
      
      // Patch existing methods to add animations
      const originalOpen = SearchOverlay.prototype.open;
      SearchOverlay.prototype.open = async function() {
        if (animations) {
          await animations.animateOpen();
        }
        if (originalOpen) originalOpen.call(this);
      };
      
      const originalClose = SearchOverlay.prototype.close;
      SearchOverlay.prototype.close = async function() {
        if (animations) {
          await animations.animateClose();
        }
        if (originalClose) originalClose.call(this);
      };
      
      const originalDisplayResults = SearchOverlay.prototype.displayResults;
      SearchOverlay.prototype.displayResults = function(results) {
        if (originalDisplayResults) originalDisplayResults.call(this, results);
        
        if (animations) {
          const resultItems = this.results.querySelectorAll('.c-search-overlay__result-item');
          animations.animateResults(resultItems);
        }
      };
      
      // Add typing animation for placeholder
      const searchPhrases = [
        'Search for articles...',
        'Looking for something?',
        'Try searching by topic...',
        'Find documentation...',
        'Discover projects...'
      ];
      
      animations.animateTypingPlaceholder(searchPhrases);
    };
    
    // If search overlay instance already exists, add animations to it
    if (window.searchOverlayInstance) {
      initializeSearchAnimations(overlay);
    } else {
      // Otherwise wait for it to be created
      const originalSearchOverlay = window.SearchOverlay;
      window.SearchOverlay = function(...args) {
        const instance = new originalSearchOverlay(...args);
        window.searchOverlayInstance = instance;
        initializeSearchAnimations(overlay);
        return instance;
      };
      Object.assign(window.SearchOverlay, originalSearchOverlay);
      window.SearchOverlay.prototype = originalSearchOverlay.prototype;
    }
  }
});