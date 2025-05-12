/**
 * Search Overlay Component
 * Handles search functionality, suggestions, and analytics
 */
// Initialize placeholder for FlexSearch index
let flexIndex;
let indexReady = false;

async function loadSearchIndex() {
  try {
    const res = await fetch('/search-index.json');
    if (!res.ok) throw new Error('Failed to load search index');
    const data = await res.json();
    flexIndex = new FlexSearch.Document({
      document: {
        id: 'url',
        index: ['title', 'content', 'snippet', 'categories', 'tags', 'type'],
        store: ['title', 'url', 'snippet', 'content', 'type', 'date', 'categories', 'tags']
      },
      tokenize: 'forward',
      cache: 100,
      threshold: 2,
      resolution: 9,
      worker: true,
    });
    // Add data to index with improved tokenization
    data.forEach(item => flexIndex.add(item));
    indexReady = true;
    
    // Notify that search is ready
    document.dispatchEvent(new CustomEvent('searchReady'));
  } catch (err) {
    console.error('Error loading search index:', err);
    indexReady = false;
  }
}

class SearchOverlay {
  constructor() {
    this.lastFocusedElement = null;
    this.initializeElements();
    this.initializeModules();
    this.bindEvents();
    
    // Skip certain initializations in minimal mode
    if (!this.isMinimal) {
      this.addSpotlightEffect();
      this.displayRecentSearches();
      this.displayPopularSearches();
      this.displayBookmarks();
      this.isListening = false;
      this.speechRecognition = null;
      this.initVoiceSearch();
    }
  }

  initializeElements() {
    this.overlay = document.getElementById('search-overlay');
    this.input = this.overlay?.querySelector('.c-search-overlay__input');
    this.form = this.overlay?.querySelector('.c-search-overlay__form');
    this.closeButton = this.overlay?.querySelector('.c-search-overlay__close');
    this.ariaLive = this.overlay?.querySelector('#search-aria-live');
    this.searchCount = 0;
    this.lastSearchTime = 0;
    
    // Support both regular and minimal search overlay
    this.isMinimal = this.overlay?.classList.contains('c-search-overlay--minimal');
    
    // Only initialize elements if not in minimal mode
    if (!this.isMinimal) {
      this.themeToggle = this.overlay?.querySelector('.c-search-overlay__theme-toggle');
      this.recentSearches = this.overlay?.querySelector('.c-search-overlay__recent-list');
      this.popularSearches = this.overlay?.querySelector('.c-search-overlay__popular-list');
      this.suggestions = this.overlay?.querySelector('.c-search-overlay__suggestions');
      this.results = this.overlay?.querySelector('.c-search-overlay__results');
      this.spinner = this.overlay?.querySelector('.c-search-overlay__spinner');
      this.filter = this.overlay?.querySelector('.c-search-overlay__filter');
      this.activeResultIndex = -1;
      this.currentResults = [];
      this.voiceButton = this.overlay?.querySelector('.c-search-overlay__voice-toggle');
      this.bookmarksList = this.overlay?.querySelector('.c-search-overlay__bookmarks-list');
    }
    this.clearButton = this.overlay?.querySelector('.c-search-overlay__clear');
    this.container = this.overlay?.querySelector('.c-search-overlay__container');
    this.shortcuts = this.overlay?.querySelector('.c-search-overlay__shortcuts');
    this.inputBackdrop = this.overlay?.querySelector('.c-search-overlay__input-backdrop');
  }

  initializeModules() {
    // Only initialize these modules if not in minimal mode
    if (!this.isMinimal) {
      this.theme = new SearchOverlayTheme();
      this.history = new SearchHistory();
    }
    
    // Always initialize analytics
    this.analytics = new SearchAnalytics();
  }
  
  // Add a spotlight effect to the input when focused
  addSpotlightEffect() {
    // Skip this functionality in minimal mode
    if (this.isMinimal) return;
    
    this.input?.addEventListener('focus', () => {
      const inputGlow = this.inputBackdrop?.querySelector('.input-glow');
      const scanLine = this.inputBackdrop?.querySelector('.input-scan-line');
      if (inputGlow) inputGlow.classList.add('active');
      if (scanLine) scanLine.style.animationPlayState = 'running';
    });
    
    this.input?.addEventListener('blur', () => {
      const inputGlow = this.inputBackdrop?.querySelector('.input-glow');
      const scanLine = this.inputBackdrop?.querySelector('.input-scan-line');
      if (inputGlow) inputGlow.classList.remove('active');
      if (scanLine) scanLine.style.animationPlayState = 'paused';
    });
  }

  bindEvents() {
    // Directly bind to the nav search button
    this.navSearchButton = document.querySelector('.search-toggle');
    if (this.navSearchButton) {
      // Simplify event handler for search toggle - just toggle the overlay state
      this.navSearchButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent the click from bubbling up
        // Always try to open if hidden, close if visible
        const isHidden = this.overlay?.getAttribute('aria-hidden') === 'true';
        if (isHidden) {
          this.open();
        } else {
          this.close();
        }
      });
    }
    
    this.closeButton?.addEventListener('click', () => this.close());
    
    // Only bind theme toggle in regular mode
    if (!this.isMinimal && this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    // Allow form to submit to search page when user presses Enter
    if (this.form) {
      // Make sure form action points to the search page
      this.form.setAttribute('action', '/search/');
      
      this.form.addEventListener('submit', (e) => {
        const query = this.input?.value.trim();
        if (!query) {
          e.preventDefault();
          return;
        }
        // Add the search to history before navigating
        this.history?.addSearch(query);
        // Let the form submit naturally to search page
      });
    }
    this.input?.addEventListener('input', this.debounce(() => {
      this.handleLiveSearch();
      this.toggleClearButton();
    }, 250));
    this.clearButton?.addEventListener('click', () => {
      this.input.value = '';
      this.handleLiveSearch();
      this.toggleClearButton();
      this.input.focus();
    });
    
    // Add mouse tracking for spotlight effect on search results
    this.results?.addEventListener('mousemove', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      e.currentTarget.style.setProperty('--x', `${x}%`);
      e.currentTarget.style.setProperty('--y', `${y}%`);
    });
    this.filter?.addEventListener('change', () => {
      this.handleLiveSearch();
    });
    this.overlay?.addEventListener('themechange', (e) => {
      this.handleThemeChange(e.detail.theme);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay?.getAttribute('aria-hidden') === 'false') {
        this.close();
      }
      if (this.overlay?.getAttribute('aria-hidden') === 'false') {
        this.handleKeyboardNavigation(e);
      }
    });
    this.suggestions?.addEventListener('click', (e) => {
      const item = e.target.closest('.c-search-overlay__suggestion-item');
      if (item) {
        this.selectSuggestion(item.dataset.suggestion);
      }
    });
    this.results?.addEventListener('click', (e) => {
      const item = e.target.closest('.c-search-overlay__result-item');
      if (item) {
        if (e.target.classList.contains('bookmark-btn')) {
          this.toggleBookmark(item.dataset.url, item.dataset.title);
          e.stopPropagation();
        } else {
          window.location.href = item.dataset.url;
        }
      }
    });
    this.voiceButton?.addEventListener('click', () => this.toggleVoiceSearch());
    // Focus trap
    this.overlay?.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.overlay.getAttribute('aria-hidden') === 'false') {
        this.trapFocus(e);
      }
    });
    // Close overlay on outside click
    document.addEventListener('mousedown', (e) => {
      if (this.overlay.getAttribute('aria-hidden') === 'false' && !this.container.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    // Remove the justClosed check to allow toggling regardless of state
    const isHidden = this.overlay?.getAttribute('aria-hidden') === 'true';
    if (isHidden) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    if (!this.overlay) return;
    // Find the nav search button and store as lastFocusedElement
    const navSearchButton = document.querySelector('.search-toggle');
    this.lastFocusedElement = document.activeElement === navSearchButton ? navSearchButton : document.activeElement;
    // Set display directly first, then set aria-hidden and other properties
    this.overlay.style.display = 'flex';
    // Force a reflow to ensure display takes effect before other changes
    void this.overlay.offsetHeight;
    this.overlay.setAttribute('aria-hidden', 'false'); 
    this.overlay.style.pointerEvents = 'auto';
    this.overlay.style.zIndex = '10000';
    document.body.style.overflow = 'hidden';
    this.input?.focus();
    this.analytics?.trackEvent('search_overlay_open');
    this.overlay.dispatchEvent(new CustomEvent('searchoverlay:open'));
    
    // Only show recent and popular searches in full mode
    if (!this.isMinimal) {
      this.displayRecentSearches();
      this.displayPopularSearches();
    }
  }

  close() {
    if (!this.overlay) return;
    console.warn('[SearchOverlay] Closing overlay');
    // Set aria-hidden first, then handle display
    this.overlay.setAttribute('aria-hidden', 'true');
    this.overlay.style.pointerEvents = 'none';
    this.overlay.style.zIndex = '0';
    
    // Use setTimeout to ensure CSS transitions complete before hiding
    setTimeout(() => {
      this.overlay.style.display = 'none';
    }, 10);
    document.body.style.overflow = '';
    this.input?.blur();
    this.analytics?.trackEvent('search_overlay_close');
    this.overlay.dispatchEvent(new CustomEvent('searchoverlay:close'));
    this.clearResults();
    this.clearSuggestions();
    this.hideSpinner();
    // Always return focus to the nav search button if available
    if (this.navSearchButton && typeof this.navSearchButton.focus === 'function') {
      this.navSearchButton.focus();
      console.warn('[SearchOverlay] Focus returned to nav search button');
    } else if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
      console.warn('[SearchOverlay] Focus returned to last focused element');
    }
    // Debug: print computed style
    const cs = window.getComputedStyle(this.overlay);
    console.warn('[SearchOverlay] After close, computed style:', {
      display: cs.display,
      pointerEvents: cs.pointerEvents,
      zIndex: cs.zIndex
    });
  }

  async handleSearch() {
    const query = this.input?.value.trim();
    if (!query) return;
    this.showSpinner();
    this.analytics?.trackEvent('search_start', { query });
    this.history?.addSearch(query);
    this.displayRecentSearches();
    try {
      const results = await this.fetchResults(query, this.filter?.value || 'all');
      this.displayResults(results);
      this.analytics?.trackEvent('search_complete', { query, count: results.length });
      this.announce(`${results.length} results found for "${query}"`);
    } catch (error) {
      this.displayError('Error fetching results.');
      this.analytics?.trackEvent('search_error', { error: error.message });
      this.announce('Error fetching results.');
    } finally {
      this.hideSpinner();
    }
  }

  async handleLiveSearch() {
    const query = this.input?.value.trim();
    if (!query) {
      this.clearSuggestions();
      this.clearResults();
      return;
    }
    this.showSpinner();
    try {
      const suggestions = await this.fetchSuggestions(query, this.filter?.value || 'all');
      this.displaySuggestions(suggestions);
      this.analytics?.trackEvent('suggestion_show', { query, count: suggestions.length });
      this.announce(`${suggestions.length} suggestions for "${query}"`);
    } catch {
      this.displayError('Error fetching suggestions.');
      this.announce('Error fetching suggestions.');
    } finally {
      this.hideSpinner();
    }
  }

  async fetchSuggestions(query) {
    if (!query || !indexReady) return [];
    const results = flexIndex.search(query, { limit: 5, enrich: true });
    const flat = results.flatMap(r => r.result);
    if (flat.length === 0) {
      return [];
    }
    return flat.map(item => item.title);
  }

  async fetchResults(query) {
    if (!query || !indexReady) return [];
    // Search across all indexed fields
    const results = flexIndex.search(query, { 
      limit: 15, 
      enrich: true,
      field: ['title', 'content', 'snippet', 'categories', 'tags']
    });
    const flat = results.flatMap(r => r.result);
    if (flat.length === 0) {
      return [{
        title: 'No results found',
        url: '#',
        snippet: 'Try different keywords, check your spelling, or explore popular topics below.',
        type: 'none'
      }];
    }
    
    return flat.map(item => ({
      title: this.highlightMatch(item.title || '', query),
      url: item.url,
      snippet: this.highlightMatch(item.snippet || '', query),
      type: item.type || 'page',
      category: item.categories || [],
      date: item.date
    }));
  }

  getDidYouMean() {
    // FlexSearch does not provide a built-in "did you mean" feature.
    return null;
  }

  highlightMatch(text, query) {
    if (!query) return text;
    // Simple highlight: wrap matching query in <mark>
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  displaySuggestions(suggestions) {
    if (!this.suggestions) return;
    this.suggestions.innerHTML = suggestions.map(s =>
      `<div class="c-search-overlay__suggestion-item" role="option" data-suggestion="${s}" tabindex="-1">${s}</div>`
    ).join('');
    this.suggestions.style.display = suggestions.length ? 'block' : 'none';
    this.currentResults = suggestions;
    this.activeResultIndex = -1;
  }

  displayResults(results) {
    if (!this.results) return;
    const bookmarks = this.getBookmarks();
    if (!results.length) {
      this.results.innerHTML = '<div class="c-search-overlay__empty">No results found.</div>';
    } else {
      this.results.innerHTML = results.map(r => {
        // Format the result type for display
        const typeLabel = r.type ? '<span class="c-search-overlay__result-type">' + r.type + '</span>' : '';
        
        // Format category badges if available
        let categoryBadges = '';
        if (r.category && r.category.length > 0) {
          const categories = Array.isArray(r.category) ? r.category : [r.category];
          categoryBadges = categories.map(cat => 
            '<span class="c-search-overlay__result-category">' + cat + '</span>'
          ).join('');
        }
        
        // Format date if available
        const dateStr = r.date ? '<span class="c-search-overlay__result-date">' + new Date(r.date).toLocaleDateString() + '</span>' : '';
        
        return '<div class="c-search-overlay__result-item" role="option" data-url="' + r.url + '" data-title="' + r.title.replace(/<[^>]+>/g, '') + '" data-type="' + (r.type || "") + '" tabindex="0">' +
          '<div class="c-search-overlay__result-header">' +
            '<strong>' + r.title + '</strong>' +
            typeLabel +
          '</div>' +
          '<div class="c-search-overlay__result-meta">' +
            categoryBadges +
            dateStr +
          '</div>' +
          '<span class="c-search-overlay__result-snippet">' + r.snippet + '</span>' +
          '<button class="bookmark-btn" aria-label="Bookmark result" aria-pressed="' + (bookmarks.some(b => b.url === r.url) ? 'true' : 'false') + '">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 4v16l6-5.333L18 20V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</div>';
      }).join('');
    }
    this.results.style.display = 'block';
    this.currentResults = results;
    this.activeResultIndex = -1;
  }

  displayError(message) {
    if (this.results) {
      this.results.innerHTML = '<div class="c-search-overlay__error">' + message + '</div>';
      this.results.style.display = 'block';
    }
  }

  clearSuggestions() {
    if (this.suggestions) {
      this.suggestions.innerHTML = '';
      this.suggestions.style.display = 'none';
    }
  }

  clearResults() {
    if (this.results) {
      this.results.innerHTML = '';
      this.results.style.display = 'none';
    }
  }

  showSpinner() {
    if (this.spinner) this.spinner.classList.remove('visually-hidden');
  }
  hideSpinner() {
    if (this.spinner) this.spinner.classList.add('visually-hidden');
  }

  handleKeyboardNavigation(e) {
    const items = Array.from(this.suggestions?.querySelectorAll('.c-search-overlay__suggestion-item') || []);
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeResultIndex = (this.activeResultIndex + 1) % items.length;
      this.updateActiveSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeResultIndex = (this.activeResultIndex - 1 + items.length) % items.length;
      this.updateActiveSuggestion(items);
    } else if (e.key === 'Enter' && this.activeResultIndex >= 0) {
      e.preventDefault();
      this.selectSuggestion(items[this.activeResultIndex].dataset.suggestion);
    }
  }

  updateActiveSuggestion(items) {
    items.forEach((item, i) => {
      item.setAttribute('aria-selected', i === this.activeResultIndex ? 'true' : 'false');
      if (i === this.activeResultIndex) item.focus();
    });
  }

  selectSuggestion(suggestion) {
    if (this.input) this.input.value = suggestion;
    this.clearSuggestions();
    this.handleSearch();
  }

  displayRecentSearches() {
    if (!this.recentSearches) return;
    const searches = this.history?.getRecentSearches() || [];
    this.recentSearches.innerHTML = searches.map(search =>
      `<li class="c-search-overlay__recent-item"><a href="/search/?q=${encodeURIComponent(search)}">${search}</a></li>`
    ).join('');
  }

  displayPopularSearches() {
    if (!this.popularSearches) return;
    // Mock: Replace with real API or analytics
    const popular = ['AI', 'JavaScript', 'CSS', 'React', 'Accessibility'];
    this.popularSearches.innerHTML = popular.map(search =>
      `<li class="c-search-overlay__recent-item"><a href="/search/?q=${encodeURIComponent(search)}">${search}</a></li>`
    ).join('');
  }

  toggleTheme() {
    // Toggle between default and dark for demo
    const current = this.overlay?.getAttribute('data-tech-theme') || 'default';
    const next = current === 'dark' ? 'default' : 'dark';
    this.theme?.setTheme(next);
  }

  handleThemeChange(theme) {
    this.overlay?.setAttribute('data-tech-theme', theme);
    this.analytics?.trackEvent('theme_change', { theme });
  }

  announce(message) {
    if (this.ariaLive) {
      this.ariaLive.textContent = '';
      setTimeout(() => {
        this.ariaLive.textContent = message;
      }, 10);
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Voice Search Integration
  initVoiceSearch() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechRecognition = new SpeechRecognition();
    this.speechRecognition.lang = 'en-US';
    this.speechRecognition.interimResults = false;
    this.speechRecognition.maxAlternatives = 1;
    this.speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (this.input) {
        this.input.value = transcript;
        this.handleLiveSearch();
      }
      this.isListening = false;
      this.updateVoiceButton();
    };
    this.speechRecognition.onstart = () => {
      this.isListening = true;
      this.updateVoiceButton();
      this.announce('Listening...');
    };
    this.speechRecognition.onend = () => {
      this.isListening = false;
      this.updateVoiceButton();
      this.announce('Stopped listening.');
    };
    this.speechRecognition.onerror = () => {
      this.isListening = false;
      this.updateVoiceButton();
      this.announce('Voice search error.');
    };
  }

  toggleVoiceSearch() {
    if (!this.speechRecognition) return;
    if (this.isListening) {
      this.speechRecognition.stop();
    } else {
      this.speechRecognition.start();
    }
  }

  updateVoiceButton() {
    if (!this.voiceButton) return;
    this.voiceButton.classList.toggle('is-listening', this.isListening);
    this.voiceButton.setAttribute('aria-pressed', this.isListening ? 'true' : 'false');
  }

  // Bookmarking
  toggleBookmark(url, title) {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(b => b.url === url);
    if (index >= 0) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push({ url, title });
    }
    localStorage.setItem('searchBookmarks', JSON.stringify(bookmarks));
    this.displayBookmarks();
  }

  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem('searchBookmarks')) || [];
    } catch {
      return [];
    }
  }

  displayBookmarks() {
    if (!this.bookmarksList) return;
    const bookmarks = this.getBookmarks();
    this.bookmarksList.innerHTML = bookmarks.length
      ? bookmarks.map(b => `<li><a href="${b.url}">${b.title}</a></li>`).join('')
      : '<li>No bookmarks yet.</li>';
  }

  trapFocus(e) {
    const focusable = this.container.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const focusableArray = Array.prototype.slice.call(focusable);
    const first = focusableArray[0];
    const last = focusableArray[focusableArray.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

// Export for use in other modules
window.SearchOverlay = SearchOverlay;

document.addEventListener('DOMContentLoaded', () => {
  console.warn('Search overlay initialization started');
  // Check if required classes are available
  console.warn('SearchOverlayTheme available:', typeof SearchOverlayTheme !== 'undefined');
  console.warn('SearchOverlay available:', typeof SearchOverlay !== 'undefined');
  // Initialize search overlay components
  if (typeof SearchOverlayTheme !== 'undefined') {
    console.warn('Initializing SearchOverlayTheme');
    new SearchOverlayTheme();
  }
  if (typeof SearchOverlay !== 'undefined') {
    console.warn('Initializing SearchOverlay');
    new SearchOverlay();
  }
  // Initialize FlexSearch
  loadSearchIndex();
});
