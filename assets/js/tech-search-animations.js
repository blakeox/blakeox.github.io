/**
 * Tech Search Animations Module
 * Handles animations for the tech-inspired futuristic search components.
 * 
 * Features:
 * - Radar ping animation
 * - Typing effect for search inputs
 * - Particle background effects
 * - Hover animations for search results
 * - Scan line animations
 * 
 * @module TechSearchAnimations
 */

// Check if the module has been loaded to prevent duplicate initialization
if (typeof window.TechSearchAnimations === 'undefined') {
  /**
   * Tech Search Animations Module
   */
  window.TechSearchAnimations = (function() {
    // Private variables
    const TYPING_SPEED = 50; // ms per character
    const RADAR_INTERVAL = 3000; // ms between radar pings
    const THROTTLE_DELAY = 100; // ms for animation throttling
    let _radarIntervalId = null;
    
    /**
     * Initialize animations
     * @param {Object} [options] - Configuration options
     */
    function init() {
      // Initialize typing effect for inputs with data attribute
      const typingInputs = document.querySelectorAll('input[data-typing-effect="true"]');
      typingInputs.forEach(input => {
        initTypingEffect(input);
      });
      
      // Init radar ping animation
      initRadarPing();
      
      // Init search result animations
      initSearchResultAnimations();
      
      // Init particles background with throttling for performance
      initParticlesBackgroundThrottled();
      
      // Init hover effects
      initSearchResultHoverEffects();
    }
    
    /**
     * Initialize typing effect for search inputs
     * @param {HTMLElement} inputElement - Input element
     */
    function initTypingEffect(inputElement) {
      if (!inputElement || !inputElement.placeholder) return;
      
      const originalPlaceholder = inputElement.placeholder;
      inputElement.placeholder = '';
      
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < originalPlaceholder.length) {
          inputElement.placeholder += originalPlaceholder.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, TYPING_SPEED);
      
      // Store original placeholder for focus/blur effects
      inputElement.setAttribute('data-original-placeholder', originalPlaceholder);
      
      // Reset placeholder on focus
      inputElement.addEventListener('focus', function() {
        if (this.value === '') {
          this.placeholder = '';
        }
      });
      
      // Restore original placeholder on blur
      inputElement.addEventListener('blur', function() {
        if (this.value === '') {
          this.placeholder = this.getAttribute('data-original-placeholder') || '';
        }
      });
    }
    
    /**
     * Initialize radar ping animation
     */
    function initRadarPing() {
      // Stop any existing interval
      if (_radarIntervalId) {
        clearInterval(_radarIntervalId);
      }
      
      const radarContainers = document.querySelectorAll('.search-radar-container');
      if (!radarContainers.length) return;
      
      // Start radar ping at regular intervals
      _radarIntervalId = setInterval(() => {
        radarContainers.forEach(container => {
          createRadarPing(container);
        });
      }, RADAR_INTERVAL);
      
      // Initial ping
      radarContainers.forEach(container => {
        createRadarPing(container);
      });
    }
    
    /**
     * Create radar ping effect
     * @param {HTMLElement} container - Radar container element
     */
    function createRadarPing(container) {
      // Check if page is visible
      if (document.hidden) return;
      
      // Create radar circle element
      const radarCircle = document.createElement('div');
      radarCircle.className = 'radar-circle';
      container.appendChild(radarCircle);
      
      // Remove after animation completes
      setTimeout(() => {
        radarCircle.remove();
      }, 3000);
    }
    
    /**
     * Initialize search result animations
     */
    function initSearchResultAnimations() {
      // Apply staggered fade-in animation to search results
      const searchResults = document.querySelectorAll('.search-results__item');
      if (!searchResults.length) return;
      
      searchResults.forEach((result, index) => {
        result.style.animationDelay = `${index * 0.08}s`;
        result.classList.add('tech-result-animate');
      });
    }
    
    /**
     * Initialize particles background with throttling
     */
    function initParticlesBackgroundThrottled() {
      // Check if reduced motion is preferred
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      
      const particlesContainers = document.querySelectorAll('.tech-particles');
      if (!particlesContainers.length) return;
      
      // Use throttling for better performance
      let lastTime = 0;
      
      function animateParticles(time) {
        if (time - lastTime > THROTTLE_DELAY) {
          lastTime = time;
          
          // Apply subtle movement based on mouse position
          document.addEventListener('mousemove', (event) => {
            const mouseX = event.clientX / window.innerWidth;
            const mouseY = event.clientY / window.innerHeight;
            
            particlesContainers.forEach(container => {
              container.style.backgroundPosition = 
                `${mouseX * 20}px ${mouseY * 20}px, ${mouseX * 10}px ${mouseY * 10}px`;
            });
          });
        }
        requestAnimationFrame(animateParticles);
      }
      
      requestAnimationFrame(animateParticles);
    }
    
    /**
     * Initialize hover effects for search results
     */
    function initSearchResultHoverEffects() {
      const searchResults = document.querySelectorAll('.search-results__item');
      if (!searchResults.length) return;
      
      searchResults.forEach(result => {
        // Create hover glow element
        const hoverGlow = document.createElement('div');
        hoverGlow.className = 'hover-glow';
        result.appendChild(hoverGlow);
        
        // Add mouse move event to track cursor
        result.addEventListener('mousemove', (event) => {
          const rect = result.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          
          hoverGlow.style.opacity = '0.8';
          hoverGlow.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        // Hide glow when mouse leaves
        result.addEventListener('mouseleave', () => {
          hoverGlow.style.opacity = '0';
        });
      });
    }
    
    /**
     * Create ripple effect on element click
     * @param {Event} event - Click event
     */
    function createRippleEffect(event) {
      const button = event.currentTarget;
      const ripple = document.createElement('span');
      
      ripple.className = 'ripple-effect';
      button.appendChild(ripple);
      
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      setTimeout(() => {
        ripple.remove();
      }, 1000);
    }
    
    /**
     * Initialize ripple effects on buttons
     */
    function initRippleEffects() {
      const buttons = document.querySelectorAll('.c-btn--tech, .theme-option');
      
      buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
      });
    }
    
    /**
     * Create scan line effect
     * @param {HTMLElement} container - Container for scan line
     */
    function createScanLine(container) {
      const scanLine = document.createElement('div');
      scanLine.className = 'scan-line';
      container.appendChild(scanLine);
      
      setTimeout(() => {
        scanLine.remove();
      }, 3000);
    }
    
    /**
     * Stop all animations
     */
    function stopAllAnimations() {
      if (_radarIntervalId) {
        clearInterval(_radarIntervalId);
        _radarIntervalId = null;
      }
    }
    
    // Public API
    return {
      init: init,
      initTypingEffect: initTypingEffect,
      initRadarPing: initRadarPing,
      createRippleEffect: createRippleEffect,
      initRippleEffects: initRippleEffects,
      createScanLine: createScanLine,
      stopAllAnimations: stopAllAnimations
    };
  })();
}
