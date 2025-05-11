/**
 * Search Overlay Component
 * Handles search functionality, suggestions, and analytics
 */
// Mock content index for Fuse.js demo
const SEARCH_INDEX = [
  { title: 'JavaScript Guide', url: '/docs/js-guide', snippet: 'Learn JavaScript from basics to advanced.' },
  { title: 'CSS Tricks', url: '/docs/css-tricks', snippet: 'Advanced CSS techniques and tips.' },
  { title: 'React Tutorial', url: '/docs/react-tutorial', snippet: 'Build modern UIs with React.' },
  { title: 'Accessibility Best Practices', url: '/docs/a11y', snippet: 'Make your site accessible to everyone.' },
  { title: 'AI in Web Development', url: '/blog/ai-web', snippet: 'How AI is changing the web.' },
  { title: 'Jekyll for GitHub Pages', url: '/docs/jekyll', snippet: 'Host your site with Jekyll and GitHub Pages.' },
  { title: 'Voice Search Integration', url: '/blog/voice-search', snippet: 'Add voice search to your site.' },
  { title: 'Fuzzy Search with Fuse.js', url: '/blog/fuzzy-search', snippet: 'Implement typo-tolerant search.' },
  // ...add more as needed
];

// Initialize FlexSearch
const flexIndex = new FlexSearch.Document({
  document: {
    id: 'url',
    index: ['title', 'snippet']
  },
  tokenize: 'forward',
  cache: true,
  encode: 'icase',
  threshold: 1,
});
SEARCH_INDEX.forEach(item => flexIndex.add(item));

class SearchOverlay {
  constructor() {
    this.initializeElements();
    this.initializeModules();
    this.bindEvents();
    this.displayRecentSearches();
    this.displayPopularSearches();
    this.displayBookmarks();
    this.isListening = false;
    this.speechRecognition = null;
    this.initVoiceSearch();
  }

  initializeElements() {
    this.overlay = document.getElementById('search-overlay');
    this.input = this.overlay?.querySelector('.c-search-overlay__input');
    this.form = this.overlay?.querySelector('.c-search-overlay__form');
    this.closeButton = this.overlay?.querySelector('.c-search-overlay__close');
    this.themeToggle = this.overlay?.querySelector('.c-search-overlay__theme-toggle');
    this.recentSearches = this.overlay?.querySelector('.c-search-overlay__recent-list');
    this.popularSearches = this.overlay?.querySelector('.c-search-overlay__popular-list');
    this.suggestions = this.overlay?.querySelector('.c-search-overlay__suggestions');
    this.results = this.overlay?.querySelector('.c-search-overlay__results');
    this.spinner = this.overlay?.querySelector('.c-search-overlay__spinner');
    this.filter = this.overlay?.querySelector('.c-search-overlay__filter');
    this.ariaLive = this.overlay?.querySelector('#search-aria-live');
    this.searchCount = 0;
    this.lastSearchTime = 0;
    this.activeResultIndex = -1;
    this.currentResults = [];
    this.voiceButton = this.overlay?.querySelector('.c-search-overlay__voice-toggle');
    this.bookmarksList = this.overlay?.querySelector('.c-search-overlay__bookmarks-list');
  }

  initializeModules() {
    this.theme = new SearchOverlayTheme();
    this.history = new SearchHistory();
    this.analytics = new SearchAnalytics();
  }

  bindEvents() {
    document.querySelectorAll('.search-toggle').forEach(button => {
      button.addEventListener('click', () => this.toggle());
    });
    this.closeButton?.addEventListener('click', () => this.close());
    this.themeToggle?.addEventListener('click', () => this.toggleTheme());
    this.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSearch();
    });
    this.input?.addEventListener('input', this.debounce(() => {
      this.handleLiveSearch();
    }, 250));
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
  }

  toggle() {
    const isHidden = this.overlay?.getAttribute('aria-hidden') === 'true';
    if (isHidden) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    if (!this.overlay) return;
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.input?.focus();
    this.analytics?.trackEvent('search_overlay_open');
    this.overlay.dispatchEvent(new CustomEvent('searchoverlay:open'));
    this.displayRecentSearches();
    this.displayPopularSearches();
  }

  close() {
    if (!this.overlay) return;
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.input?.blur();
    this.analytics?.trackEvent('search_overlay_close');
    this.overlay.dispatchEvent(new CustomEvent('searchoverlay:close'));
    this.clearResults();
    this.clearSuggestions();
    this.hideSpinner();
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
    } catch (error) {
      this.displayError('Error fetching suggestions.');
      this.announce('Error fetching suggestions.');
    } finally {
      this.hideSpinner();
    }
  }

  async fetchSuggestions(query, filter) {
    if (!query) return [];
    const results = flexIndex.search(query, { limit: 5, enrich: true });
    const flat = results.flatMap(r => r.result);
    if (flat.length === 0) {
      // Optionally, you can implement a "Did you mean" feature here
      return [];
    }
    return flat.map(item => item.title);
  }

  async fetchResults(query, filter) {
    if (!query) return [];
    const results = flexIndex.search(query, { limit: 10, enrich: true });
    const flat = results.flatMap(r => r.result);
    if (flat.length === 0) {
      return [{
        title: 'No results found',
        url: '#',
        snippet: 'Try different keywords, check your spelling, or explore popular topics below.'
      }];
    }
    return flat.map(item => ({
      title: this.highlightMatch(item.title, query),
      url: item.url,
      snippet: this.highlightMatch(item.snippet, query)
    }));
  }

  getDidYouMean(query) {
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
    this.suggestions.innerHTML = suggestions.map((s, i) =>
      `<div class="c-search-overlay__suggestion-item" role="option" data-suggestion="${s}" tabindex="-1">${s}</div>`
    ).join('');
    this.suggestions.style.display = suggestions.length ? 'block' : 'none';
    this.currentResults = suggestions;
    this.activeResultIndex = -1;
  }

  displayResults(results) {
    if (!this.results) return;
    const bookmarks = this.getBookmarks();
    this.results.innerHTML = results.map((r, i) =>
      `<div class="c-search-overlay__result-item" role="option" data-url="${r.url}" data-title="${r.title.replace(/<[^>]+>/g, '')}" tabindex="0">
        <strong>${r.title}</strong><br><span>${r.snippet}</span>
        <button class="bookmark-btn" aria-label="Bookmark result" aria-pressed="${bookmarks.some(b => b.url === r.url) ? 'true' : 'false'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 4v16l6-5.333L18 20V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>`
    ).join('');
    this.results.style.display = results.length ? 'block' : 'none';
    this.currentResults = results;
    this.activeResultIndex = -1;
  }

  displayError(message) {
    if (this.results) {
      this.results.innerHTML = `<div class="c-search-overlay__error">${message}</div>`;
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
    if (this.spinner) this.spinner.style.display = 'block';
  }
  hideSpinner() {
    if (this.spinner) this.spinner.style.display = 'none';
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
    this.speechRecognition.onerror = (event) => {
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
}

// Export for use in other modules
window.SearchOverlay = SearchOverlay;
