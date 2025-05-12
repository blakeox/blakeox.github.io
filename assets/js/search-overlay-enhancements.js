/**
 * Search Overlay UI Enhancements - Minimal Version
 * Provides a simple, minimalist search overlay experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all enhancement features when document is ready
  initMinimalSearchOverlay();
});

function initMinimalSearchOverlay() {
  setupMinimalSearchInteractions();
  addSearchInputFocusHandling();
  addSearchShortcuts();
}

/**
 * Set up placeholder text animation for the search input
 * Creates a typing effect cycling through example searches
 */
function setupPlaceholderAnimation() {
  const searchInput = document.querySelector('.c-search-overlay__input');
  if (!searchInput) return;
  
  const placeholders = [
    'Search for projects...',
    'Look up technical topics...',
    'Find blog articles...',
    'Explore documentation...'
  ];
  
  let currentIndex = 0;
  let currentPlaceholder = '';
  let isDeleting = false;
  let typingSpeed = 100;
  
  function typeEffect() {
    const fullPlaceholder = placeholders[currentIndex];
    
    if (isDeleting) {
      currentPlaceholder = fullPlaceholder.substring(0, currentPlaceholder.length - 1);
      typingSpeed = 50;
    } else {
      currentPlaceholder = fullPlaceholder.substring(0, currentPlaceholder.length + 1);
      typingSpeed = 100;
    }
    
    searchInput.setAttribute('placeholder', currentPlaceholder);
    
    if (!isDeleting && currentPlaceholder === fullPlaceholder) {
      isDeleting = true;
      typingSpeed = 1500; // Pause before deleting
    } else if (isDeleting && currentPlaceholder === '') {
      isDeleting = false;
      currentIndex = (currentIndex + 1) % placeholders.length;
      typingSpeed = 500; // Pause before typing next phrase
    }
    
    setTimeout(typeEffect, typingSpeed);
  }
  
  // Only start typing animation when search overlay is opened
  document.addEventListener('searchoverlay:open', () => {
    // Reset to beginning
    currentIndex = 0;
    currentPlaceholder = '';
    isDeleting = false;
    // Start the typing animation
    setTimeout(typeEffect, 800); // Slight delay after opening
  });
}

/**
 * Add pulse animation to the search button
 * Adds a visual indicator to draw attention to the search button
 */
function addPulseEffectToSearchButton() {
  const searchButtons = document.querySelectorAll('.c-search-overlay__submit');
  
  searchButtons.forEach(button => {
    // Add a pulse effect element
    const pulseEffect = document.createElement('span');
    pulseEffect.className = 'search-button-pulse';
    button.appendChild(pulseEffect);
    
    // Add data attribute for styling
    button.setAttribute('data-enhanced', 'true');
  });
}

/**
 * Initialize keyboard shortcuts panel
 * Creates a panel showing available keyboard shortcuts
 */
function initKeyboardShortcutsPanel() {
  const searchOverlay = document.getElementById('search-overlay');
  if (!searchOverlay) return;
  
  // Create shortcuts panel
  const shortcutsPanel = document.createElement('div');
  shortcutsPanel.className = 'c-search-overlay__shortcuts-panel';
  shortcutsPanel.setAttribute('aria-hidden', 'true');
  shortcutsPanel.innerHTML = `
    <div class="shortcuts-panel__header">
      <h3>Keyboard Shortcuts</h3>
      <button class="shortcuts-panel__close" aria-label="Close shortcuts panel">×</button>
    </div>
    <div class="shortcuts-panel__content">
      <div class="shortcut-group">
        <h4>Navigation</h4>
        <div class="shortcut-item">
          <span class="shortcut-key">↑ / ↓</span>
          <span class="shortcut-desc">Navigate results</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-key">Enter</span>
          <span class="shortcut-desc">Open selected result</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-key">Esc</span>
          <span class="shortcut-desc">Close search</span>
        </div>
      </div>
      <div class="shortcut-group">
        <h4>Actions</h4>
        <div class="shortcut-item">
          <span class="shortcut-key">Tab</span>
          <span class="shortcut-desc">Navigate UI elements</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-key">Ctrl+K</span>
          <span class="shortcut-desc">Focus search</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-key">?</span>
          <span class="shortcut-desc">Toggle this help</span>
        </div>
      </div>
    </div>
  `;
  
  searchOverlay.appendChild(shortcutsPanel);
  
  // Toggle shortcuts panel on ? key
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && searchOverlay.getAttribute('aria-hidden') === 'false') {
      e.preventDefault();
      toggleShortcutsPanel();
    }
  });
  
  // Close panel button
  const closeButton = shortcutsPanel.querySelector('.shortcuts-panel__close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      toggleShortcutsPanel(false);
    });
  }
  
  function toggleShortcutsPanel(show) {
    const isHidden = shortcutsPanel.getAttribute('aria-hidden') === 'true';
    if (show !== undefined ? show : isHidden) {
      shortcutsPanel.setAttribute('aria-hidden', 'false');
      shortcutsPanel.classList.add('active');
    } else {
      shortcutsPanel.setAttribute('aria-hidden', 'true');
      shortcutsPanel.classList.remove('active');
    }
  }
  
  // Add a keyboard shortcut info button
  const searchContainer = searchOverlay.querySelector('.c-search-overlay__container');
  if (searchContainer) {
    const shortcutInfoButton = document.createElement('button');
    shortcutInfoButton.className = 'c-search-overlay__shortcut-info';
    shortcutInfoButton.setAttribute('aria-label', 'Show keyboard shortcuts');
    shortcutInfoButton.innerHTML = '?';
    shortcutInfoButton.addEventListener('click', () => toggleShortcutsPanel());
    searchContainer.appendChild(shortcutInfoButton);
  }
}

/**
 * Enhance search results display
 * Improves the organization and visual display of search results
 */
function enhanceSearchResults() {
  // Create a MutationObserver to watch for results being added
  const searchOverlay = document.getElementById('search-overlay');
  if (!searchOverlay) return;
  
  const resultsContainer = searchOverlay.querySelector('.c-search-overlay__results');
  if (!resultsContainer) return;
  
  // This observer will add animations to results as they're added and organize them by type
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Only apply grouping if we have regular result items
        const resultItems = resultsContainer.querySelectorAll('.c-search-overlay__result-item');
        if (resultItems.length > 0 && !resultsContainer.querySelector('.c-search-overlay__empty')) {
          organizeResultsByType(resultsContainer, resultItems);
        } else {
          // Add animation to items even if not grouped
          resultItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 50}ms`;
            item.classList.add('animated-entry');
          });
        }
      }
    });
  });
  
  function organizeResultsByType(container, resultItems) {
    // Clear existing content to rebuild with grouped structure
    const originalContent = container.innerHTML;
    container.innerHTML = '';
    
    // Group results by their type
    const groupedResults = {};
    resultItems.forEach(item => {
      const type = item.dataset.type || 'other';
      if (!groupedResults[type]) {
        groupedResults[type] = [];
      }
      groupedResults[type].push(item);
    });
    
    // If no grouping needed, restore original content and add animations
    const uniqueTypes = Object.keys(groupedResults);
    if (uniqueTypes.length <= 1) {
      container.innerHTML = originalContent;
      container.querySelectorAll('.c-search-overlay__result-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 50}ms`;
        item.classList.add('animated-entry');
      });
      return;
    }
    
    // Define icons for each type
    const typeIcons = {
      'article': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/><path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/></svg>',
      'doc': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="currentColor"/><path d="M14 3v5h5m-9 11h-2v-2h2v2zm0-4h-2v-2h2v2zm8 4h-6v-2h6v2zm0-4h-6v-2h6v2z" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>',
      'news': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke="currentColor" stroke-width="2"/><path d="M8 11h8v5H8v-5zm8-3h-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      'project': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
      'other': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    // Function to get friendly name for each type
    function getTypeName(type) {
      const typeNames = {
        'article': 'Articles',
        'doc': 'Documentation',
        'news': 'News',
        'project': 'Projects',
        'other': 'Other Results',
        'none': 'No Results'
      };
      return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1) + 's';
    }
    
    // Create groups in a specific order
    const typeOrder = ['article', 'doc', 'project', 'news'];
    const processedTypes = new Set();
    
    // First, add the ordered types
    typeOrder.forEach(type => {
      if (groupedResults[type]) {
        addResultGroup(type, groupedResults[type]);
        processedTypes.add(type);
      }
    });
    
    // Then add any remaining types
    Object.keys(groupedResults).forEach(type => {
      if (!processedTypes.has(type)) {
        addResultGroup(type, groupedResults[type]);
      }
    });
    
    function addResultGroup(type, items) {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'c-search-overlay__results-group';
      
      const headerDiv = document.createElement('div');
      headerDiv.className = 'results-group__header';
      headerDiv.setAttribute('data-type', type);
      
      const icon = document.createElement('span');
      icon.className = 'results-group__icon';
      icon.innerHTML = typeIcons[type] || typeIcons.other;
      
      const title = document.createElement('h4');
      title.className = 'results-group__title';
      title.textContent = getTypeName(type);
      
      const count = document.createElement('span');
      count.className = 'results-group__count';
      count.textContent = items.length;
      
      headerDiv.appendChild(icon);
      headerDiv.appendChild(title);
      headerDiv.appendChild(count);
      
      groupDiv.appendChild(headerDiv);
      
      // Create a container for the result items
      const itemsContainer = document.createElement('div');
      itemsContainer.className = 'results-group__items';
      
      // Add items with staggered animation
      items.forEach((item, index) => {
        const clone = item.cloneNode(true);
        clone.style.animationDelay = `${index * 50}ms`;
        clone.classList.add('animated-entry');
        itemsContainer.appendChild(clone);
      });
      
      groupDiv.appendChild(itemsContainer);
      container.appendChild(groupDiv);
    }
  }
  
  observer.observe(resultsContainer, { childList: true, subtree: true });
  
  // Add particle background to results container for tech theme
  const particleContainer = document.createElement('div');
  particleContainer.className = 'particle-background';
  
  // Create particles
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particleContainer.appendChild(particle);
  }
  
  resultsContainer.appendChild(particleContainer);
}

/**
 * Enhance empty state display
 * Provides a more helpful and engaging empty state when no results are found
 */
function enhanceEmptyState() {
  const searchOverlay = document.getElementById('search-overlay');
  if (!searchOverlay) return;
  
  const emptyState = document.getElementById('search-empty');
  if (!emptyState) return;
  
  // Clear any existing content in the empty state
  emptyState.innerHTML = `
    <div class="search-redirect-button-container">
      <button type="submit" class="search-redirect-button">See all results</button>
    </div>
  `;
  
  // Add listener to the redirect button
  const redirectButton = emptyState.querySelector('.search-redirect-button');
  if (redirectButton) {
    redirectButton.addEventListener('click', () => {
      // Get current search query
      const searchInput = searchOverlay.querySelector('.c-search-overlay__input');
      const query = searchInput ? searchInput.value.trim() : '';
      
      // Redirect to search page with the query
      window.location.href = `/search/?q=${encodeURIComponent(query)}`;
    });
  }
  
  // Monitor search results to show enhanced empty state
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;
  
  const resultsObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check for "No results found" message
        if (resultsContainer.querySelector('.c-search-overlay__empty')) {
          emptyState.classList.remove('visually-hidden');
          resultsContainer.classList.add('visually-hidden');
        } else {
          emptyState.classList.add('visually-hidden');
          resultsContainer.classList.remove('visually-hidden');
        }
      }
    });
  });
  
  resultsObserver.observe(resultsContainer, { childList: true, subtree: true });
}
