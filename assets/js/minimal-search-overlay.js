/**
 * Minimal Search Overlay
 * A simplified search interface without popups or complex features
 */

document.addEventListener('DOMContentLoaded', () => {
  initMinimalSearchOverlay();
});

function initMinimalSearchOverlay() {
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.querySelector('.c-search-overlay__input');
  const searchSubmit = document.querySelector('.c-search-overlay__submit');
  const closeButton = document.querySelector('.c-search-overlay__close');
  
  if (!searchOverlay || !searchInput || !searchSubmit || !closeButton) return;
  
  // Add visual enhancements
  addSearchButtonEffect(searchSubmit);
  
  // Setup focus behavior
  setupFocusBehavior(searchOverlay, searchInput, searchSubmit);
  
  // Add keyboard shortcuts
  setupKeyboardShortcuts(searchOverlay, searchInput, closeButton);
  
  // Handle form submission
  setupFormHandling(searchOverlay);
  
  // Add visual feedback on keypresses
  setupInputFeedback(searchOverlay, searchInput);
  
  // Add theme awareness
  setupThemeAwareness(searchOverlay);
  
  // Manage recent searches
  manageRecentSearches(searchOverlay);
  
  // Setup recent searches display
  setupRecentSearchesDisplay(searchOverlay, searchInput);
  
  // Add autocomplete suggestions
  setupMinimalAutocomplete(searchOverlay, searchInput);
  
  // Add voice search capability
  setupVoiceSearch(searchOverlay, searchInput);
}

/**
 * Add visual effects to the search button
 */
function addSearchButtonEffect(searchSubmit) {
  // Add a pulse effect to the search button if it doesn't already exist
  if (!searchSubmit.querySelector('.search-button-pulse')) {
    const pulseEffect = document.createElement('span');
    pulseEffect.className = 'search-button-pulse';
    searchSubmit.appendChild(pulseEffect);
  }
  
  // Add animation data attribute
  searchSubmit.setAttribute('data-enhanced', 'true');
}

/**
 * Set contextual placeholder text based on time of day
 */
function setContextualPlaceholder(searchInput) {
  if (!searchInput) return;
  
  const hour = new Date().getHours();
  let placeholder = 'Search...';
  
  // Morning placeholder (5 AM to 11 AM)
  if (hour >= 5 && hour < 12) {
    placeholder = 'Good morning! What are you looking for?';
  } 
  // Afternoon placeholder (12 PM to 5 PM)
  else if (hour >= 12 && hour < 18) {
    placeholder = 'Search for anything...';
  } 
  // Evening placeholder (6 PM to 9 PM)
  else if (hour >= 18 && hour < 22) {
    placeholder = 'Good evening. Search the site...';
  }
  // Night/Late night placeholder (10 PM to 4 AM)
  else {
    if (hour >= 22 || hour < 2) {
      placeholder = 'What\'s on your mind?';
    } else {
      placeholder = 'What\'s keeping you up?';
    }
  }
  
  searchInput.placeholder = placeholder;
}

/**
 * Set up focus handling for the search input
 */
function setupFocusBehavior(searchOverlay, searchInput, searchSubmit) {
  // Focus input on overlay open
  document.addEventListener('searchoverlay:open', () => {
    setTimeout(() => {
      // Set contextual placeholder text
      setContextualPlaceholder(searchInput);
      
      searchInput.focus();
      searchOverlay.classList.add('is-visible');
    }, 100);
  });
  
  // Handle focus visual state
  searchInput.addEventListener('focus', () => {
    searchOverlay.classList.add('is-focused');
  });
  
  searchInput.addEventListener('blur', () => {
    // Short delay to check if focus moved to search button
    setTimeout(() => {
      if (document.activeElement !== searchSubmit) {
        searchOverlay.classList.remove('is-focused');
      }
    }, 100);
  });
  
  // Remove focus class when overlay closes
  document.addEventListener('searchoverlay:close', () => {
    searchOverlay.classList.remove('is-visible', 'is-focused');
  });
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts(searchOverlay, searchInput, closeButton) {
  if (!searchOverlay || !searchInput) return;
  
  // Global keyboard shortcut to open search with '/'
  document.addEventListener('keydown', (e) => {
    // Check if not in an input or textarea
    const target = e.target;
    if (
      e.key === '/' && 
      !['INPUT', 'TEXTAREA'].includes(target.tagName) && 
      !target.isContentEditable &&
      searchOverlay.getAttribute('aria-hidden') === 'true'
    ) {
      e.preventDefault();
      // Trigger custom event to open search
      document.dispatchEvent(new CustomEvent('searchoverlay:open'));
    }
    
    // Alt+V for voice search
    if (e.altKey && e.key.toLowerCase() === 'v' && 
        searchOverlay.getAttribute('aria-hidden') === 'false') {
      e.preventDefault();
      const voiceButton = searchOverlay.querySelector('.c-search-overlay__voice');
      if (voiceButton) voiceButton.click();
    }
  });
  
  // ESC key to close search
  searchOverlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('searchoverlay:close'));
    }
  });
  
  // Handle closing with close button
  closeButton?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('searchoverlay:close'));
  });
}

/**
 * Set up form handling
 */
function setupFormHandling(searchOverlay) {
  const form = searchOverlay.querySelector('.c-search-overlay__form');
  const searchInput = searchOverlay.querySelector('.c-search-overlay__input');
  const loadingIndicator = searchOverlay.querySelector('.c-search-overlay__loading');
  
  if (!form || !searchInput) return;
  
  // Debounced search function for smoother typing experience
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    
    const query = searchInput.value.trim();
    
    // Show loading after a delay if search has content
    if (query.length > 0) {
      searchTimeout = setTimeout(() => {
        if (loadingIndicator) loadingIndicator.classList.add('is-loading');
      }, 300);
    } else {
      if (loadingIndicator) loadingIndicator.classList.remove('is-loading');
    }
  });
  
  form.addEventListener('submit', (e) => {
    const query = searchInput.value.trim();
    
    // Prevent empty submissions
    if (query === '') {
      e.preventDefault();
      return;
    }
    
    // Show loading animation
    if (loadingIndicator) loadingIndicator.classList.add('is-loading');
    
    // Add progress indicator on search button
    const searchButton = form.querySelector('.c-search-overlay__submit');
    if (searchButton) {
      searchButton.classList.add('is-loading');
      
      // Create progress ring if it doesn't exist
      if (!searchButton.querySelector('.progress-ring')) {
        const progressRing = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        progressRing.className = 'progress-ring';
        progressRing.setAttribute('width', '32');
        progressRing.setAttribute('height', '32');
        progressRing.setAttribute('viewBox', '0 0 32 32');
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '16');
        circle.setAttribute('cy', '16');
        circle.setAttribute('r', '14');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('fill', 'transparent');
        
        progressRing.appendChild(circle);
        searchButton.appendChild(progressRing);
      }
    }
    
    // Save to recent searches
    try {
      const recentKey = 'minimal-recent-searches';
      const recentSearches = JSON.parse(localStorage.getItem(recentKey) || '[]');
      
      // Remove this term if it already exists
      const filteredSearches = recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase());
      
      // Add to beginning
      filteredSearches.unshift(query);
      
      // Limit to 5 items
      const limitedSearches = filteredSearches.slice(0, 5);
      
      localStorage.setItem(recentKey, JSON.stringify(limitedSearches));
    } catch (e) {
      console.warn('Failed to save recent search:', e);
    }
    
    // Add subtle transition delay before submitting
    e.preventDefault();
    setTimeout(() => {
      form.submit();
    }, 400);
  });
}

/**
 * Add visual feedback on keypresses
 */
function setupInputFeedback(searchOverlay, searchInput) {
  // Add a keypress animation
  searchInput.addEventListener('keydown', (e) => {
    // Skip for modifier keys
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
      return;
    }
    
    // Add temporary class for animation
    searchInput.classList.add('key-pressed');
    
    // Remove class after animation
    setTimeout(() => {
      searchInput.classList.remove('key-pressed');
    }, 200);
  });
}

/**
 * Handle theme changes for the search overlay
 */
function setupThemeAwareness(searchOverlay) {
  // Initial theme check
  updateThemeStyles(searchOverlay);
  
  // Listen for theme changes
  document.addEventListener('themeChanged', () => {
    updateThemeStyles(searchOverlay);
  });
  
  function updateThemeStyles(overlay) {
    if (!overlay) return;
    
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                      document.body.classList.contains('dark-theme');
    
    if (isDarkMode) {
      overlay.setAttribute('data-theme-mode', 'dark');
    } else {
      overlay.setAttribute('data-theme-mode', 'light');
    }
  }
}

/**
 * Manage recent searches
 */
function manageRecentSearches(searchOverlay) {
  const MAX_RECENT_SEARCHES = 5;
  const STORAGE_KEY = 'minimal-recent-searches';
  const form = searchOverlay.querySelector('.c-search-overlay__form');
  const searchInput = searchOverlay.querySelector('.c-search-overlay__input');
  
  if (!form || !searchInput) return;
  
  // Save search term when submitting
  form.addEventListener('submit', () => {
    const query = searchInput.value.trim();
    if (query) {
      saveRecentSearch(query);
    }
  });
  
  // Handle quick search on keyboard shortcut
  document.addEventListener('keydown', (e) => {
    // Alt+Number for quick search (1-5)
    if (e.altKey && !e.ctrlKey && !e.metaKey && /^[1-5]$/.test(e.key) && 
        searchOverlay.getAttribute('aria-hidden') === 'false') {
      e.preventDefault();
      const recentSearches = getRecentSearches();
      const index = parseInt(e.key) - 1;
      if (recentSearches && recentSearches[index]) {
        searchInput.value = recentSearches[index];
        form.submit();
      }
    }
  });
  
  // Helper function to save a search term
  function saveRecentSearch(term) {
    let recentSearches = getRecentSearches() || [];
    
    // Remove this term if it already exists (to move it to the top)
    recentSearches = recentSearches.filter(search => search !== term);
    
    // Add new term at the beginning
    recentSearches.unshift(term);
    
    // Limit to MAX_RECENT_SEARCHES
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
      recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
    } catch (e) {
      console.warn('Failed to save recent searches:', e);
    }
  }
  
  // Helper function to get recent searches
  function getRecentSearches() {
    try {
      const searches = localStorage.getItem(STORAGE_KEY);
      return searches ? JSON.parse(searches) : [];
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
      return [];
    }
  }
}

/**
 * Add minimal autocomplete suggestions
 */
function setupMinimalAutocomplete(searchOverlay, searchInput) {
  // Common search terms - these would ideally come from your site's actual analytics
  const commonSearchTerms = [
    'projects',
    'blog',
    'technology',
    'resume',
    'contact',
    'about',
    'services',
    'portfolio',
    'experience',
    'skills'
  ];
  
  // Create autocomplete element if it doesn't exist
  let autocompleteEl = searchOverlay.querySelector('.c-search-overlay__autocomplete');
  if (!autocompleteEl) {
    autocompleteEl = document.createElement('div');
    autocompleteEl.className = 'c-search-overlay__autocomplete';
    autocompleteEl.setAttribute('aria-hidden', 'true');
    searchInput.parentNode.appendChild(autocompleteEl);
  }
  
  // Listen for input changes with debounce
  let autocompleteTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(autocompleteTimeout);
    
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length < 2) {
      hideAutocomplete();
      return;
    }
    
    autocompleteTimeout = setTimeout(() => {
      // Filter matching terms
      const matches = commonSearchTerms.filter(term => 
        term.toLowerCase().includes(query) && term.toLowerCase() !== query
      ).slice(0, 3); // Max 3 suggestions
      
      // Add recent searches that match
      try {
        const recentSearches = JSON.parse(localStorage.getItem('minimal-recent-searches') || '[]');
        const recentMatches = recentSearches.filter(term => 
          term.toLowerCase().includes(query) && term.toLowerCase() !== query && !matches.includes(term.toLowerCase())
        ).slice(0, 2);
        
        matches.push(...recentMatches);
      } catch (e) {
        console.warn('Error accessing recent searches:', e);
      }
      
      // Update or hide autocomplete
      if (matches.length) {
        showAutocomplete(matches, query);
      } else {
        hideAutocomplete();
      }
    }, 200);
  });
  
  // Hide on blur (with delay to allow click)
  searchInput.addEventListener('blur', () => {
    setTimeout(hideAutocomplete, 200);
  });
  
  // Hide when ESC pressed
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideAutocomplete();
    } else if (e.key === 'ArrowDown') {
      // Handle arrow down to focus on first suggestion
      e.preventDefault();
      const firstSuggestion = autocompleteEl.querySelector('.autocomplete-item');
      if (firstSuggestion) {
        firstSuggestion.focus();
      }
    }
  });
  
  // Show autocomplete with matches
  function showAutocomplete(matches, query) {
    autocompleteEl.innerHTML = '';
    
    matches.forEach(term => {
      const item = document.createElement('button');
      item.className = 'autocomplete-item';
      item.setAttribute('type', 'button');
      
      // Highlight the matching part
      const termLower = term.toLowerCase();
      const queryIndex = termLower.indexOf(query.toLowerCase());
      if (queryIndex >= 0) {
        const before = term.substring(0, queryIndex);
        const match = term.substring(queryIndex, queryIndex + query.length);
        const after = term.substring(queryIndex + query.length);
        item.innerHTML = `${before}<strong>${match}</strong>${after}`;
      } else {
        item.textContent = term;
      }
      
      // Handle click on suggestion
      item.addEventListener('click', () => {
        searchInput.value = term;
        hideAutocomplete();
        searchInput.focus();
      });
      
      // Handle keyboard navigation
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = item.nextElementSibling;
          if (next) next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = item.previousElementSibling;
          if (prev) {
            prev.focus();
          } else {
            searchInput.focus();
          }
        }
      });
      
      autocompleteEl.appendChild(item);
    });
    
    autocompleteEl.setAttribute('aria-hidden', 'false');
  }
  
  // Hide autocomplete
  function hideAutocomplete() {
    autocompleteEl.setAttribute('aria-hidden', 'true');
    autocompleteEl.innerHTML = '';
  }
}

/**
 * Set up voice search functionality
 */
function setupVoiceSearch(searchOverlay, searchInput) {
  const voiceButton = searchOverlay.querySelector('.c-search-overlay__voice');
  if (!voiceButton || !searchInput) return;
  
  // Check if browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceButton.style.display = 'none';
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US'; // Set language
  
  let isListening = false;
  
  // Handle button click to start/stop listening
  voiceButton.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        isListening = true;
        voiceButton.classList.add('is-listening');
        
        // Show feedback to user
        const toast = createToast('Listening...', 'info', 5000);
        searchOverlay.appendChild(toast);
        setTimeout(() => {
          toast.classList.add('visible');
        }, 10);
      } catch (err) {
        console.error('Speech recognition error:', err);
        const toast = createToast('Could not start voice recognition', 'error', 3000);
        searchOverlay.appendChild(toast);
        setTimeout(() => {
          toast.classList.add('visible');
        }, 10);
      }
    }
  });
  
  // Handle speech recognition result
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    
    // Trigger input event to update autocomplete
    const inputEvent = new Event('input', { bubbles: true });
    searchInput.dispatchEvent(inputEvent);
    
    // Show feedback
    const confidence = Math.round(event.results[0][0].confidence * 100);
    const toast = createToast(`Heard: "${transcript}" (${confidence}% confident)`, 'success', 3000);
    searchOverlay.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);
  };
  
  // Handle end of speech recognition
  recognition.onend = () => {
    isListening = false;
    voiceButton.classList.remove('is-listening');
  };
  
  // Handle errors
  recognition.onerror = (event) => {
    isListening = false;
    voiceButton.classList.remove('is-listening');
    console.error('Speech recognition error:', event.error);
    
    const toast = createToast(`Error: ${event.error}`, 'error', 3000);
    searchOverlay.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);
  };
  
  // Helper function to create toast notifications
  function createToast(message, type, duration) {
    const toast = document.createElement('div');
    toast.className = `c-search-overlay__toast toast-${type || 'info'}`;
    toast.textContent = message;
    
    // Auto remove after duration
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration || 3000);
    
    return toast;
  }
}

/**
 * Display and manage recent searches dropdown
 */
function setupRecentSearchesDisplay(searchOverlay, searchInput) {
  const historyButton = searchOverlay.querySelector('.c-search-overlay__history');
  const recentsPanel = searchOverlay.querySelector('.c-search-overlay__recents');
  const recentsList = searchOverlay.querySelector('.recent-searches-list');
  const clearButton = searchOverlay.querySelector('.clear-recent-searches');
  const clearSearchButton = searchOverlay.querySelector('.c-search-overlay__clear');
  const form = searchOverlay.querySelector('.c-search-overlay__form');
  
  if (!historyButton || !recentsPanel || !recentsList || !clearButton || !searchInput) return;
  
  // Toggle recents panel
  historyButton.addEventListener('click', () => {
    const isHidden = recentsPanel.getAttribute('aria-hidden') === 'true';
    
    // Update panel visibility
    recentsPanel.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
    historyButton.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    
    // Update history list when showing
    if (isHidden) {
      updateRecentSearchesList();
    }
  });
  
  // Clear all recent searches
  clearButton.addEventListener('click', () => {
    try {
      localStorage.removeItem('minimal-recent-searches');
      updateRecentSearchesList();
      
      // Show feedback
      const toast = createToast('Search history cleared', 'info', 2000);
      searchOverlay.appendChild(toast);
      setTimeout(() => toast.classList.add('visible'), 10);
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
    
    // Hide panel
    recentsPanel.setAttribute('aria-hidden', 'true');
    historyButton.setAttribute('aria-expanded', 'false');
  });
  
  // Clear current search
  if (clearSearchButton) {
    clearSearchButton.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      toggleClearButton();
      
      // Trigger input event to update UI
      const inputEvent = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(inputEvent);
    });
  }
  
  // Handle input changes for clear button visibility
  searchInput.addEventListener('input', toggleClearButton);
  
  // Hide panel when clicking outside
  document.addEventListener('click', (e) => {
    if (recentsPanel.getAttribute('aria-hidden') === 'false' && 
        !recentsPanel.contains(e.target) && 
        e.target !== historyButton) {
      recentsPanel.setAttribute('aria-hidden', 'true');
      historyButton.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Update recent searches list
  function updateRecentSearchesList() {
    try {
      const recentSearches = JSON.parse(localStorage.getItem('minimal-recent-searches') || '[]');
      
      if (recentSearches.length === 0) {
        recentsList.innerHTML = '<li class="no-recents">No recent searches</li>';
        return;
      }
      
      recentsList.innerHTML = recentSearches.map((search, index) => `
        <li>
          <button type="button" class="recent-search-item" data-search="${search}" aria-label="Search for ${search}">
            <span class="search-text">${search}</span>
            <kbd>${index + 1}</kbd>
          </button>
        </li>
      `).join('');
      
      // Add click handlers to recent search items
      recentsList.querySelectorAll('.recent-search-item').forEach(item => {
        item.addEventListener('click', () => {
          const searchTerm = item.dataset.search;
          searchInput.value = searchTerm;
          
          // Trigger input event to update UI
          const inputEvent = new Event('input', { bubbles: true });
          searchInput.dispatchEvent(inputEvent);
          
          // Close panel
          recentsPanel.setAttribute('aria-hidden', 'true');
          historyButton.setAttribute('aria-expanded', 'false');
          
          // Focus on input
          searchInput.focus();
          
          // Submit if Alt is held
          if (form && event.altKey) {
            form.submit();
          }
        });
      });
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
    }
  }
  
  // Toggle clear button visibility
  function toggleClearButton() {
    if (!clearSearchButton) return;
    
    if (searchInput.value.trim()) {
      clearSearchButton.classList.add('is-visible');
    } else {
      clearSearchButton.classList.remove('is-visible');
    }
  }
  
  // Helper function to create toast notifications if it doesn't exist
  function createToast(message, type, duration) {
    const toast = document.createElement('div');
    toast.className = `c-search-overlay__toast toast-${type || 'info'}`;
    toast.textContent = message;
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, duration || 3000);
    
    return toast;
  }
}
