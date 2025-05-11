/**
 * Search Enhancements
 * Adds advanced UI features and animations to the search overlay
 */
document.addEventListener('DOMContentLoaded', () => {
  initSearchEnhancements();
});

function initSearchEnhancements() {
  // Elements
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-overlay-input');
  const searchResults = document.getElementById('search-results');
  const searchEmpty = document.getElementById('search-empty');
  const searchForm = searchOverlay?.querySelector('.c-search-overlay__form');
  const inputGroup = searchOverlay?.querySelector('.c-search-overlay__input-group');
  
  if (!searchOverlay) return;
  
  // Ensure search form submits to search.html
  if (searchForm) {
    searchForm.setAttribute('action', '/search.html');
    
    // Handle form submission
    searchForm.addEventListener('submit', (event) => {
      if (searchInput && !searchInput.value.trim()) {
        event.preventDefault(); // Prevent empty submissions
        searchInput.focus();
      }
    });
  }
  
  // Add spotlight effect for interactive elements
  addSpotlightEffect(searchResults);
  
  // Add tech scan effect
  addTechScanEffect(searchResults);
  
  // Track keyboard shortcuts usage
  trackKeyboardShortcuts();
  
  // Enhance search input experience
  enhanceSearchInput(searchInput, inputGroup);
  
  // Add auto-scroll for keyboard navigation
  addAutoScrollForResults(searchResults);
  
  // Show empty state when appropriate
  handleEmptyState(searchResults, searchEmpty);
  
  // Improve animations for results
  animateSearchResults(searchResults);
  
  // Add category badges to search results
  addResultMetadata();
}

/**
 * Add a spotlight effect that follows the mouse cursor
 * @param {HTMLElement} element - The element to add the effect to
 */
function addSpotlightEffect(element) {
  if (!element) return;
  
  element.classList.add('spotlight-effect');
  
  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    element.style.setProperty('--x', `${x}%`);
    element.style.setProperty('--y', `${y}%`);
  });
}

/**
 * Add tech scan line effect
 * @param {HTMLElement} element - The element to add the effect to
 */
function addTechScanEffect(element) {
  if (!element) return;
  
  element.classList.add('tech-scan-effect');
  
  element.addEventListener('mouseenter', () => {
    element.classList.add('scanning');
  });
  
  element.addEventListener('mouseleave', () => {
    element.classList.remove('scanning');
  });
}

/**
 * Track keyboard shortcuts to show the used keys
 */
function trackKeyboardShortcuts() {
  const shortcuts = document.querySelectorAll('.c-search-overlay__shortcuts .shortcut-key kbd');
  
  document.addEventListener('keydown', (e) => {
    shortcuts.forEach(key => {
      // Match the key with keyboard event
      if (
        (key.textContent.toLowerCase() === e.key.toLowerCase()) ||
        (key.classList.contains('up') && e.key === 'ArrowUp') ||
        (key.classList.contains('down') && e.key === 'ArrowDown')
      ) {
        // Add press animation
        key.classList.add('key-press');
        setTimeout(() => key.classList.remove('key-press'), 200);
      }
    });
  });
}

/**
 * Enhance search input experience with animations and focus effects
 * @param {HTMLElement} input - The search input element
 * @param {HTMLElement} inputGroup - The parent input group
 */
function enhanceSearchInput(input, inputGroup) {
  if (!input || !inputGroup) return;
  
  // Add glow effect on focus
  input.addEventListener('focus', () => {
    inputGroup.classList.add('focused');
    const glow = inputGroup.querySelector('.input-glow');
    const scanLine = inputGroup.querySelector('.input-scan-line');
    
    if (glow) glow.style.opacity = '0.7';
    if (scanLine) scanLine.style.animationPlayState = 'running';
  });
  
  input.addEventListener('blur', () => {
    inputGroup.classList.remove('focused');
    const glow = inputGroup.querySelector('.input-glow');
    const scanLine = inputGroup.querySelector('.input-scan-line');
    
    if (glow) glow.style.opacity = '0';
    if (scanLine) scanLine.style.animationPlayState = 'paused';
  });
  
  // Add typing animation on first focus
  let hasAnimated = false;
  input.addEventListener('focus', () => {
    if (!hasAnimated) {
      input.classList.add('animate-cursor');
      hasAnimated = true;
      setTimeout(() => {
        input.classList.remove('animate-cursor');
      }, 2000);
    }
  }, { once: true });
}

/**
 * Auto-scroll to keep active result visible during keyboard navigation
 * @param {HTMLElement} resultsContainer - The search results container
 */
function addAutoScrollForResults(resultsContainer) {
  if (!resultsContainer) return;
  
  // Observer for active result changes
  const observer = new MutationObserver(mutationsList => {
    mutationsList.forEach(mutation => {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'class' && 
          mutation.target.classList.contains('active')) {
        // Scroll the active item into view
        mutation.target.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    });
  });
  
  // Start observing once results are populated
  const checkForResults = setInterval(() => {
    const resultItems = resultsContainer.querySelectorAll('.c-search-overlay__result-item');
    if (resultItems.length > 0) {
      resultItems.forEach(item => {
        observer.observe(item, { attributes: true });
      });
      clearInterval(checkForResults);
    }
  }, 500);
}

/**
 * Show empty state when there are no results
 * @param {HTMLElement} resultsContainer - The search results container
 * @param {HTMLElement} emptyState - The empty state container
 */
function handleEmptyState(resultsContainer, emptyState) {
  if (!resultsContainer || !emptyState) return;
  
  // Observer for results container changes
  const observer = new MutationObserver((mutations) => {
    // Check if results container has content
    const hasResults = resultsContainer.children.length > 0;
    const hasVisibleContent = resultsContainer.offsetHeight > 10; // Arbitrary small value
    
    if (!hasResults || !hasVisibleContent) {
      // Only show empty state if input has value
      const input = document.getElementById('search-overlay-input');
      if (input && input.value.trim().length > 0) {
        emptyState.classList.remove('visually-hidden');
      } else {
        emptyState.classList.add('visually-hidden');
      }
    } else {
      emptyState.classList.add('visually-hidden');
    }
  });
  
  // Start observing
  observer.observe(resultsContainer, { 
    childList: true,
    subtree: true,
    attributes: true
  });
}

/**
 * Add staggered animations to search results
 * @param {HTMLElement} resultsContainer - The search results container
 */
function animateSearchResults(resultsContainer) {
  if (!resultsContainer) return;
  
  // Observer for new results
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Get newly added result items
        const resultItems = Array.from(resultsContainer.querySelectorAll('.c-search-overlay__result-item:not(.animated)'));
        
        // Add staggered animation to each result
        resultItems.forEach((item, index) => {
          item.classList.add('animated');
          item.style.animationDelay = `${index * 0.05}s`;
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px)';
          
          // Begin animation in next frame
          requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          });
        });
      }
    });
  });
  
  // Start observing
  observer.observe(resultsContainer, { childList: true });
}

/**
 * Add category badges and metadata to search results
 */
function addResultMetadata() {
  // Observer for new results
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Process results to add badges
        processResultItems();
      }
    });
  });
  
  // Process all result items to add category badges
  function processResultItems() {
    const resultItems = document.querySelectorAll('.c-search-overlay__result-item');
    
    resultItems.forEach(item => {
      if (item.dataset.processed === 'true') return;
      
      const itemType = item.dataset.type || 'page';
      const title = item.querySelector('.c-search-overlay__result-title');
      
      // Only add badge if title exists and item not processed
      if (title && !title.dataset.type) {
        title.dataset.type = itemType;
        
        // Add category badge if not exists
        if (!item.querySelector('.c-search-overlay__result-category')) {
          const meta = document.createElement('div');
          meta.className = 'c-search-overlay__result-meta';
          
          const badge = document.createElement('span');
          badge.className = 'c-search-overlay__result-category';
          badge.textContent = itemType.charAt(0).toUpperCase() + itemType.slice(1);
          
          meta.appendChild(badge);
          
          // Add date if available
          if (item.dataset.date) {
            const date = document.createElement('span');
            date.className = 'c-search-overlay__result-date';
            date.textContent = new Date(item.dataset.date).toLocaleDateString();
            meta.appendChild(date);
          }
          
          // Insert after title
          const snippet = item.querySelector('.c-search-overlay__result-snippet');
          if (snippet) {
            item.insertBefore(meta, snippet);
          } else {
            item.appendChild(meta);
          }
        }
      }
      
      item.dataset.processed = 'true';
    });
  }
  
  // Start observing search results
  const resultsContainer = document.getElementById('search-results');
  if (resultsContainer) {
    observer.observe(resultsContainer, { childList: true });
  }
}
