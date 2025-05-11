/**
 * @deprecated This file is deprecated and has been replaced by modular components.
 * Please use the following files instead:
 * - tech-search-core.js
 * - tech-search-animations.js
 * - keyboard-navigation.js
 * - search-history.js
 * - tech-settings.js
 *
 * See _tech-search-module-architecture.md for documentation on the new modular structure.
 */

// Forward to modular implementations if they exist
document.addEventListener('DOMContentLoaded', () => {
  console.warn('tech-search.js is deprecated. Please use the modular components instead.');
  
  if (window.TechSearchAnimations && window.TechSearchCore) {
    // Initialize the modular system instead
    if (window.TechSearchAnimations) window.TechSearchAnimations.init();
  } else {
    // Fall back to legacy implementation
    initTechSearchWithThrottling();
  }
  
  // Use throttled version for better performance
  function initTechSearchWithThrottling() {
    // Check if we're on search.html or using the overlay
    const isSearchPage = !!document.querySelector('.search-results__list');
    
    // Init typing effect for search inputs with data attribute
    const typingInputs = document.querySelectorAll('input[data-typing-effect="true"]');
    typingInputs.forEach(input => {
      initTypingEffect(input);
    });
    
    // Init radar ping animation
    initRadarPing();
    
    // Init search result animations
    initSearchResultAnimations();
    
    // Init tech particles background with performance throttling
    initParticlesBackgroundThrottled();
    
    // Init hover effects for search results
    initSearchResultHoverEffects();
    
    // Only initialize keyboard navigation if NOT on the main search page
    // (which already has its own keyboard navigation)
    if (!isSearchPage) {
      initKeyboardNavigation();
    }
    
    // Init glitch effect for tech titles
    initGlitchEffect();
    
    // Check for mobile devices to adjust animations
    detectAndOptimizeForMobile();
  }
  
  // Radar ping effect animation
  function initRadarPing() {
    const radarContainers = document.querySelectorAll('.search-radar-container');
    
    radarContainers.forEach(container => {
      const ping = container.querySelector('.radar-ping');
      if (!ping) return;
      
      // Create ping animation effect every 3 seconds
      setInterval(() => {
        // Reset animation by cloning and replacing
        const newPing = ping.cloneNode(true);
        if (ping.parentNode) {
          ping.parentNode.replaceChild(newPing, ping);
        }
      }, 3000);
    });
  }
  
  // Typing effect for search inputs
  function initTypingEffect(input) {
    const placeholderText = input.getAttribute('placeholder');
    if (!placeholderText) return;
    
    // Store original placeholder
    input.setAttribute('data-original-placeholder', placeholderText);
    input.setAttribute('placeholder', '');
    
    let charIndex = 0;
    const typingSpeed = 80; // ms per character
    
    function typeNextChar() {
      if (charIndex < placeholderText.length) {
        input.setAttribute(
          'placeholder', 
          input.getAttribute('placeholder') + placeholderText.charAt(charIndex)
        );
        charIndex++;
        setTimeout(typeNextChar, typingSpeed + Math.random() * 40);
      } else {
        // Reset and repeat after delay
        setTimeout(() => {
          input.setAttribute('placeholder', '');
          charIndex = 0;
          typeNextChar();
        }, 3000);
      }
    }
    
    // Start typing effect after a short delay
    setTimeout(typeNextChar, 1000);
    
    // Stop animation when input is focused
    input.addEventListener('focus', () => {
      input.setAttribute('placeholder', input.getAttribute('data-original-placeholder'));
    });
    
    // Restart animation when input loses focus and is empty
    input.addEventListener('blur', () => {
      if (!input.value) {
        input.setAttribute('placeholder', '');
        charIndex = 0;
        typeNextChar();
      }
    });
  }
  
  // Animate search results as they're added to the DOM
  function initSearchResultAnimations() {
    // Observer to detect when search results are added to the DOM
    const resultsContainer = document.querySelector('.search-results__list');
    if (!resultsContainer) return;
    
    // Create observer to watch for new results
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // New search results have been added
          const results = resultsContainer.querySelectorAll('.search-results__item');
          
          // Apply staggered entrance animations
          results.forEach((result, index) => {
            // Add animation delay based on index
            result.style.animationDelay = `${index * 0.08}s`;
            result.classList.add('tech-result-animate');
            
            // Add tech decoration elements
            addTechDecoration(result);
          });
        }
      });
    });
    
    // Start observing the container for added results
    observer.observe(resultsContainer, { childList: true });
    
    // Function to add tech decoration to search results
    function addTechDecoration(resultItem) {
      // Add corner brackets for tech decoration
      const article = resultItem.querySelector('article');
      if (article) {
        const decoration = document.createElement('div');
        decoration.className = 'result-tech-decoration';
        
        // Add corner elements
        ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(position => {
          const corner = document.createElement('span');
          corner.className = `corner ${position}`;
          decoration.appendChild(corner);
        });
        
        // Add scan line
        const scanLine = document.createElement('span');
        scanLine.className = 'scan-line';
        decoration.appendChild(scanLine);
        
        // Insert at the beginning of the article
        article.insertBefore(decoration, article.firstChild);
      }
    }
  }
  
  // Add interactive hover effects for search results
  function initSearchResultHoverEffects() {
    // Use event delegation for better performance
    document.addEventListener('mouseover', function(e) {
      const resultItem = e.target.closest('.search-results__item');
      if (!resultItem) return;
      
      // Create hover glow effect
      const glowEffect = resultItem.querySelector('.hover-glow') || createGlowElement(resultItem);
      
      // Position the glow at mouse position
      const rect = resultItem.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      glowEffect.style.opacity = '0.7';
      glowEffect.style.top = `${y}px`;
      glowEffect.style.left = `${x}px`;
    });
    
    document.addEventListener('mouseout', function(e) {
      const resultItem = e.target.closest('.search-results__item');
      if (!resultItem) return;
      
      const glowEffect = resultItem.querySelector('.hover-glow');
      if (glowEffect) {
        glowEffect.style.opacity = '0';
      }
    });
    
    function createGlowElement(container) {
      const glow = document.createElement('div');
      glow.className = 'hover-glow';
      container.appendChild(glow);
      return glow;
    }
  }
  
  // Create interactive particles in the tech background with performance throttling
  function initParticlesBackgroundThrottled() {
    const techBgElements = document.querySelectorAll('.tech-particles, .tech-particles-animated');
    if (techBgElements.length === 0) return;
    
    // Detect low-powered devices and reduce animation complexity
    const isLowPoweredDevice = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                              navigator.hardwareConcurrency < 4;
    
    // Apply browser-specific performance optimizations
    applyBrowserSpecificOptimizations();
    
    techBgElements.forEach(bg => {
      // Add mouse movement listener with throttling for better performance
      const container = bg.closest('.tech-header, .tech-search-page, .c-search-overlay');
      if (!container) return;
      
      let lastExecution = 0;
      const throttleDelay = isLowPoweredDevice ? 100 : 30; // Longer delay for low-powered devices
      
      container.addEventListener('mousemove', event => {
        const now = Date.now();
        if (now - lastExecution < throttleDelay) return;
        
        lastExecution = now;
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Move particles slightly based on mouse position (less movement on low-powered devices)
        const moveFactor = isLowPoweredDevice ? 0.01 : 0.02;
        bg.style.backgroundPosition = `${x * moveFactor}px ${y * moveFactor}px, ${-x * moveFactor/2}px ${-y * moveFactor/2}px`;
      });
    });
  }
  
  // Apply browser-specific optimizations for animations and effects
  function applyBrowserSpecificOptimizations() {
    const html = document.documentElement;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    const isEdge = navigator.userAgent.indexOf('Edg') > -1;
    const isOldEdge = /Edge\/\d./i.test(navigator.userAgent);
    
    // Add browser-specific classes to the HTML element for CSS targeting
    if (isSafari) html.classList.add('browser-safari');
    if (isFirefox) html.classList.add('browser-firefox');
    if (isEdge) html.classList.add('browser-edge');
    if (isOldEdge) html.classList.add('browser-old-edge');
    
    // Apply Safari-specific backdrop filter fix
    if (isSafari) {
      // Safari has issues with complex backdrop-filter animations
      const elementsWithBackdropFilter = document.querySelectorAll(
        '.tech-search-box, .search-results__item, .tech-search-form'
      );
      elementsWithBackdropFilter.forEach(el => {
        el.classList.add('safari-backdrop-fix');
      });
    }
    
    // Firefox-specific adjustments
    if (isFirefox) {
      // Firefox has better performance with reduced particle count
      const particleElements = document.querySelectorAll('.tech-particles');
      particleElements.forEach(el => {
        el.classList.add('firefox-particles-fix');
      });
    }
    
    // Edge-specific adjustments
    if (isOldEdge) {
      // Old Edge has issues with certain animations
      const glitchEffects = document.querySelectorAll('.glitch-layer');
      glitchEffects.forEach(el => {
        el.style.display = 'none';
      });
      
      // Limit animation complexity on old Edge
      html.classList.add('limit-animations');
    }
    
    // Check if user has requested reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.classList.add('tech-reduced-motion');
      
      // Log that we're respecting reduced motion preference
      console.log('Respecting reduced motion preference. Some animations disabled.');
    }
    
    // Add listener for system dark mode changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    
    // Initial check for dark mode
    handleDarkModeChange(darkModeMediaQuery);
    
    // Handle dark mode changes
    function handleDarkModeChange(e) {
      if (e.matches) {
        // System is in dark mode, adjust tech search UI if needed
        html.classList.add('system-dark-mode');
      } else {
        html.classList.remove('system-dark-mode');
      }
    }
  }
  
  // Enhance search input focus states
  const searchInputs = document.querySelectorAll('.tech-input, .c-search-overlay__input');
  searchInputs.forEach(input => {
    input.addEventListener('focus', () => {
      const parent = input.closest('.input-wrapper, .c-search-overlay__input-group');
      if (parent) {
        parent.classList.add('input-focused');
      }
    });
    
    input.addEventListener('blur', () => {
      const parent = input.closest('.input-wrapper, .c-search-overlay__input-group');
      if (parent) {
        parent.classList.remove('input-focused');
      }
    });
  });
  
  // Add special effects to tech buttons
  const techButtons = document.querySelectorAll('.c-btn--tech, .c-btn--neon');
  techButtons.forEach(button => {
    button.addEventListener('mouseenter', createRippleEffect);
  });
  
  function createRippleEffect(event) {
    const button = event.currentTarget;
    
    // Remove any existing ripple
    const existingRipple = button.querySelector('.ripple-effect');
    if (existingRipple) {
      existingRipple.remove();
    }
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    // Set ripple position based on mouse position
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    // Add to button
    button.appendChild(ripple);
    
    // Remove after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  }
  
  // Add glitch text effect to tech titles
  function initGlitchEffect() {
    const techTitles = document.querySelectorAll('.tech-title, .c-search-overlay__title');
    
    techTitles.forEach(title => {
      // Don't apply to titles that already have special elements
      if (title.querySelector('.tech-badge')) return;
      
      const titleText = title.innerText;
      title.innerHTML = '';
      
      // Create glitch layers
      const baseLayer = document.createElement('span');
      baseLayer.className = 'glitch-base';
      baseLayer.innerText = titleText;
      
      const beforeLayer = document.createElement('span');
      beforeLayer.className = 'glitch-layer glitch-before';
      beforeLayer.setAttribute('data-text', titleText);
      
      const afterLayer = document.createElement('span');
      afterLayer.className = 'glitch-layer glitch-after';
      afterLayer.setAttribute('data-text', titleText);
      
      // Add them to the title
      title.appendChild(beforeLayer);
      title.appendChild(baseLayer);
      title.appendChild(afterLayer);
    });
  }
  
  // Helper function to throttle function calls - used implicitly in our throttling logic
  // We're implementing the throttling directly in the event handlers for better performance
  // This pattern is used in initParticlesBackgroundThrottled but implemented inline
  
  // Detect mobile devices and optimize animations
  function detectAndOptimizeForMobile() {
    const isMobile = window.innerWidth <= 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Reduce animation complexity for mobile
      document.documentElement.classList.add('tech-mobile-optimized');
      
      // Reduce particle density
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        .tech-particles, .tech-particles-animated {
          opacity: 0.3 !important;
          background-size: 80px 80px, 40px 40px !important;
        }
        
        .tech-grid.horizontal, .tech-grid.vertical, .grid-line {
          opacity: 0.2 !important;
          background-size: 60px 60px !important;
        }
        
        @keyframes scanLine {
          0% {
            left: -100%;
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }
  
  // Keyboard navigation for search results
  function initKeyboardNavigation() {
    const searchInput = document.getElementById('search-input');
    let currentFocusIndex = -1;
    let searchResults = [];
    let ariaLiveRegion;
    
    // Create screen reader announcement region if it doesn't exist
    if (!document.getElementById('sr-announcements')) {
      ariaLiveRegion = document.createElement('div');
      ariaLiveRegion.id = 'sr-announcements';
      ariaLiveRegion.className = 'visually-hidden';
      ariaLiveRegion.setAttribute('aria-live', 'polite');
      ariaLiveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(ariaLiveRegion);
    } else {
      ariaLiveRegion = document.getElementById('sr-announcements');
    }
    
    // Monitor for changes to search results
    const resultsContainer = document.querySelector('.search-results__list');
    if (!resultsContainer) return;
    
    // Create observer to watch for new results
    const observer = new MutationObserver(() => {
      // Update our results collection whenever the DOM changes
      searchResults = Array.from(document.querySelectorAll('.search-results__item'));
      
      // Reset focus index when results change
      currentFocusIndex = -1;
      
      // Make results keyboard navigable
      makeResultsNavigable();
    });
    
    // Start observing the container for added results
    observer.observe(resultsContainer, { childList: true });
    
    // Make search results navigable with keyboard
    function makeResultsNavigable() {
      searchResults.forEach((result, index) => {
        // Make sure each result is properly focusable
        result.setAttribute('tabindex', '0');
        result.setAttribute('role', 'listitem');
        
        // Handle Enter key on focused result
        result.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            // Find and activate the link in the result item
            const link = result.querySelector('a');
            if (link) link.click();
            e.preventDefault();
          }
        });
        
        // Handle focus events
        result.addEventListener('focus', () => {
          currentFocusIndex = index;
          updateFocusStyle(result);
          announceResult(result);
        });
        
        // Handle click events
        result.addEventListener('click', (e) => {
          // Ensure clicks on the item itself (not on links) focus the item
          if (e.target === result || !e.target.closest('a')) {
            result.focus();
          }
        });
      });
    }
    
    // Add keyboard event listener to the document for arrow key navigation
    document.addEventListener('keydown', (e) => {
      // Only handle keyboard navigation when we have results
      if (searchResults.length === 0) return;
      
      // Check which key was pressed
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          navigateResults(1);
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          navigateResults(-1);
          break;
          
        case 'Escape':
          // Return focus to search input if ESC is pressed
          if (document.activeElement !== searchInput) {
            searchInput.focus();
            currentFocusIndex = -1;
            e.preventDefault();
          }
          break;
      }
    });
    
    // Navigate through results by increment (-1 for up, +1 for down)
    function navigateResults(increment) {
      // Calculate the new index
      let newIndex = currentFocusIndex + increment;
      
      // Handle wrapping at the beginning and end of the list
      if (newIndex < 0) {
        newIndex = searchInput ? -1 : searchResults.length - 1;
      } else if (newIndex >= searchResults.length) {
        newIndex = searchInput ? -1 : 0;
      }
      
      // Update focus
      if (newIndex === -1 && searchInput) {
        // Focus back on the search input
        searchInput.focus();
        currentFocusIndex = -1;
        // Remove focus style from all results
        searchResults.forEach(result => result.classList.remove('focused'));
      } else {
        // Focus on the result item
        searchResults[newIndex].focus();
        currentFocusIndex = newIndex;
      }
    }
    
    // Update styling for focused item
    function updateFocusStyle(focusedItem) {
      // Remove focus style from all results first
      searchResults.forEach(result => result.classList.remove('focused'));
      // Add focus style to current item
      focusedItem.classList.add('focused');
    }
    
    // Announce the focused result for screen readers
    function announceResult(result) {
      const title = result.querySelector('.search-results__title')?.textContent || '';
      const snippet = result.querySelector('.search-results__snippet')?.textContent || '';
      const type = result.querySelector('.search-results__type')?.textContent || '';
      
      // Create a concise announcement
      const announcement = `${title}. ${type}. ${snippet.substring(0, 100)}`;
      
      // Announce to screen readers
      if (ariaLiveRegion) {
        ariaLiveRegion.textContent = announcement;
      }
    }
  }
});
