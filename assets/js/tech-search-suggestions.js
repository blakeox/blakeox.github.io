/**
 * Tech Search Suggestions Module
 * Provides autocomplete suggestions for the tech search interface.
 * 
 * Features:
 * - Real-time search suggestions as you type
 * - Common search terms display
 * - Keyboard navigation for suggestions
 * - Visual tech-themed suggestion styling
 * 
 * @module TechSearchSuggestions
 */

// Check if the module has been loaded to prevent duplicate initialization
if (typeof window.TechSearchSuggestions === 'undefined') {
  /**
   * Tech Search Suggestions Module
   */
  window.TechSearchSuggestions = (function() {
    // Private variables
    const MAX_SUGGESTIONS = 5;
    const MIN_CHARS_FOR_SUGGESTIONS = 2;
    let _options = {
      searchInputSelector: '#search-input',
      suggestionsContainerClass: 'tech-search-suggestions',
      suggestionItemClass: 'suggestion-item',
      activeSuggestionClass: 'active'
    };
    let _searchIndex = [];
    let _commonTerms = [];
    let _currentSuggestions = [];
    let _activeSuggestionIndex = -1;
    let _initialized = false;
    let _currentSearchContainer = null;
    
    /**
     * Initialize search suggestions
     * @param {Object} [options] - Configuration options
     */
    function init(options = {}) {
      // Prevent multiple initializations
      if (_initialized) return;
      
      // Merge options
      _options = Object.assign(_options, options);
      
      // Get search input
      const searchInput = document.querySelector(_options.searchInputSelector);
      if (!searchInput) {
        console.warn('Search input not found. Cannot initialize suggestions.');
        return;
      }
      
      // Create suggestions container
      _currentSearchContainer = searchInput.closest('.tech-search-box') || 
                                searchInput.closest('.c-search-overlay__input-group');
      
      if (!_currentSearchContainer) {
        console.warn('Search container not found. Cannot initialize suggestions.');
        return;
      }
      
      setupSuggestionsContainer(_currentSearchContainer);
      
      // Add event listeners
      searchInput.addEventListener('input', handleSearchInput);
      searchInput.addEventListener('keydown', handleKeyNavigation);
      document.addEventListener('click', handleClickOutside);
      
      // Add accessibility information to search input
      searchInput.setAttribute('aria-autocomplete', 'list');
      searchInput.setAttribute('role', 'combobox');
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.setAttribute('aria-controls', 'tech-search-suggestions-list');
      searchInput.setAttribute('aria-haspopup', 'listbox');
      
      // Initialize with common terms
      loadCommonTerms();
      
      // Get search index if TechSearchCore is available
      if (window.TechSearchCore && window.TechSearchCore.getSearchIndex) {
        _searchIndex = window.TechSearchCore.getSearchIndex();
      }
      
      _initialized = true;
    }
    
    /**
     * Create suggestions container
     * @param {HTMLElement} container - Container to append to
     */
    function setupSuggestionsContainer(container) {
      // Remove any existing suggestions container
      const existingSuggestions = document.querySelector(`.${_options.suggestionsContainerClass}`);
      if (existingSuggestions) {
        existingSuggestions.remove();
      }
      
      // Create new container
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = _options.suggestionsContainerClass;
      suggestionsContainer.setAttribute('role', 'listbox');
      suggestionsContainer.setAttribute('aria-label', 'Search suggestions');
      suggestionsContainer.style.display = 'none';
      
      // Add tech styling
      suggestionsContainer.innerHTML = `
        <div class="suggestions-decoration">
          <span class="corner-decoration top-left"></span>
          <span class="corner-decoration top-right"></span>
          <span class="corner-decoration bottom-left"></span>
          <span class="corner-decoration bottom-right"></span>
        </div>
      `;
      
      // Append to container
      container.appendChild(suggestionsContainer);
      
      // Add CSS if not already present
      addSuggestionStyles();
    }
    
    /**
     * Add suggestion styles to document
     */
    function addSuggestionStyles() {
      if (document.getElementById('tech-suggestions-styles')) return;
      
      const styleSheet = document.createElement('style');
      styleSheet.id = 'tech-suggestions-styles';
      styleSheet.textContent = `
        .tech-search-suggestions {
          position: absolute;
          z-index: 100;
          top: calc(100% + 5px);
          left: 0;
          right: 0;
          background: var(--tech-bg-color, #0a0d14);
          border: 1px solid var(--tech-accent-color, #2196f3);
          border-radius: 4px;
          padding: 8px 0;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5), 0 0 10px var(--tech-glow-color, rgba(33, 150, 243, 0.3));
          max-height: 300px;
          overflow-y: auto;
          backdrop-filter: blur(10px);
        }
        
        .tech-search-suggestions .suggestion-item {
          padding: 8px 16px;
          cursor: pointer;
          transition: background 0.2s ease;
          color: var(--tech-text-color, #ffffff);
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .tech-search-suggestions .suggestion-item::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--tech-accent-color, #2196f3);
          margin-right: 10px;
          display: inline-block;
          opacity: 0;
          transition: opacity 0.2s ease;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        
        .tech-search-suggestions .suggestion-item:hover,
        .tech-search-suggestions .suggestion-item.active {
          background: var(--tech-hover-bg, rgba(33, 150, 243, 0.1));
        }
        
        .tech-search-suggestions .suggestion-item:hover::before,
        .tech-search-suggestions .suggestion-item.active::before {
          opacity: 1;
        }
        
        .tech-search-suggestions .suggestion-item mark {
          background: rgba(33, 150, 243, 0.3);
          color: #fff;
          font-weight: bold;
          border-radius: 2px;
          padding: 0 2px;
        }
        
        .tech-search-suggestions .suggestions-decoration .corner-decoration {
          position: absolute;
          width: 8px;
          height: 8px;
          border: 1px solid var(--tech-accent-color, #2196f3);
        }
        
        .tech-search-suggestions .suggestions-decoration .top-left {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
        }
        
        .tech-search-suggestions .suggestions-decoration .top-right {
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
        }
        
        .tech-search-suggestions .suggestions-decoration .bottom-left {
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
        }
        
        .tech-search-suggestions .suggestions-decoration .bottom-right {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
        }
      `;
      
      document.head.appendChild(styleSheet);
    }
    
    /**
     * Handle input events on search box
     * @param {Event} event - Input event
     */
    function handleSearchInput(event) {
      const query = event.target.value.trim();
      
      if (query.length >= MIN_CHARS_FOR_SUGGESTIONS) {
        generateSuggestions(query);
      } else {
        hideSuggestions();
      }
    }
    
    /**
     * Generate and display search suggestions
     * @param {string} query - Search query
     */
    function generateSuggestions(query) {
      // Generate suggestions from search index and common terms
      _currentSuggestions = [];
      
      // Extract terms from search index titles that match query
      if (_searchIndex && _searchIndex.length) {
        const titleSuggestions = _searchIndex
          .filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
          .map(item => item.title)
          .slice(0, MAX_SUGGESTIONS);
          
        _currentSuggestions = [..._currentSuggestions, ...titleSuggestions];
      }
      
      // Add suggestions from common terms that match query
      const commonSuggestions = _commonTerms
        .filter(term => term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, MAX_SUGGESTIONS - _currentSuggestions.length);
        
      _currentSuggestions = [..._currentSuggestions, ...commonSuggestions];
      
      // Remove duplicates
      _currentSuggestions = [...new Set(_currentSuggestions)];
      
      // Limit to max suggestions
      _currentSuggestions = _currentSuggestions.slice(0, MAX_SUGGESTIONS);
      
      // Display suggestions
      if (_currentSuggestions.length > 0) {
        displaySuggestions(_currentSuggestions, query);
      } else {
        hideSuggestions();
      }
    }
    
    /**
     * Display suggestions in container
     * @param {Array} suggestions - List of suggestions
     * @param {string} query - Search query for highlighting
     */
    function displaySuggestions(suggestions, query) {
      const container = document.querySelector(`.${_options.suggestionsContainerClass}`);
      if (!container) return;
      
      // Clear existing suggestions, but keep decorations
      const decorations = container.querySelector('.suggestions-decoration');
      container.innerHTML = '';
      if (decorations) {
        container.appendChild(decorations);
      }
      
      // Create suggestion items
      suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = _options.suggestionItemClass;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        
        // Highlight matching text
        const highlighted = highlightMatching(suggestion, query);
        item.innerHTML = highlighted;
        
        // Add click handler
        item.addEventListener('click', () => {
          applySuggestion(suggestion);
        });
        
        container.appendChild(item);
      });
      
      // Show suggestions
      container.style.display = 'block';
      
      // Reset active suggestion
      _activeSuggestionIndex = -1;
    }
    
    /**
     * Highlight matching parts of suggestion
     * @param {string} suggestion - Suggestion text
     * @param {string} query - Query to highlight
     * @returns {string} HTML with highlighted text
     */
    function highlightMatching(suggestion, query) {
      if (!query) return suggestion;
      
      const regex = new RegExp(`(${query})`, 'gi');
      return suggestion.replace(regex, '<mark>$1</mark>');
    }
    
    /**
     * Hide suggestions container
     */
    function hideSuggestions() {
      const container = document.querySelector(`.${_options.suggestionsContainerClass}`);
      if (container) {
        container.style.display = 'none';
      }
    }
    
    /**
     * Apply selected suggestion to search input
     * @param {string} suggestion - Selected suggestion
     */
    function applySuggestion(suggestion) {
      const searchInput = document.querySelector(_options.searchInputSelector);
      if (!searchInput) return;
      
      // Update input value
      searchInput.value = suggestion;
      
      // Trigger search (if TechSearchCore is available)
      if (window.TechSearchCore && window.TechSearchCore.performSearch) {
        window.TechSearchCore.performSearch();
      }
      
      // Hide suggestions
      hideSuggestions();
    }
    
    /**
     * Handle keyboard navigation for suggestions
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeyNavigation(event) {
      const container = document.querySelector(`.${_options.suggestionsContainerClass}`);
      if (!container || container.style.display === 'none') return;
      
      const suggestions = container.querySelectorAll(`.${_options.suggestionItemClass}`);
      if (!suggestions.length) return;
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          _activeSuggestionIndex = (_activeSuggestionIndex + 1) % suggestions.length;
          updateActiveSuggestion(suggestions);
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          _activeSuggestionIndex = (_activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
          updateActiveSuggestion(suggestions);
          break;
          
        case 'Enter':
          if (_activeSuggestionIndex >= 0 && _activeSuggestionIndex < suggestions.length) {
            event.preventDefault();
            applySuggestion(_currentSuggestions[_activeSuggestionIndex]);
          }
          break;
          
        case 'Escape':
          hideSuggestions();
          break;
      }
    }
    
    /**
     * Update active suggestion styling
     * @param {NodeList} suggestions - Suggestion elements
     */
    function updateActiveSuggestion(suggestions) {
      // Remove active class from all suggestions
      suggestions.forEach(item => {
        item.classList.remove(_options.activeSuggestionClass);
        item.setAttribute('aria-selected', 'false');
      });
      
      // Add active class to current suggestion
      if (_activeSuggestionIndex >= 0 && _activeSuggestionIndex < suggestions.length) {
        suggestions[_activeSuggestionIndex].classList.add(_options.activeSuggestionClass);
        suggestions[_activeSuggestionIndex].setAttribute('aria-selected', 'true');
        
        // Ensure the active suggestion is visible
        suggestions[_activeSuggestionIndex].scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
    
    /**
     * Handle clicks outside suggestions container
     * @param {Event} event - Click event
     */
    function handleClickOutside(event) {
      const container = document.querySelector(`.${_options.suggestionsContainerClass}`);
      const searchInput = document.querySelector(_options.searchInputSelector);
      
      if (!container) return;
      
      if (!container.contains(event.target) && event.target !== searchInput) {
        hideSuggestions();
      }
    }
    
    /**
     * Load common search terms
     */
    function loadCommonTerms() {
      // Load from search history if available
      if (window.TechSearchHistory && window.TechSearchHistory.getCommonTerms) {
        _commonTerms = window.TechSearchHistory.getCommonTerms();
      }
      
      // Fallback to predefined common terms
      if (!_commonTerms.length) {
        _commonTerms = [
          'Jekyll', 
          'Portfolio', 
          'Projects',
          'Blog',
          'Contact'
        ];
      }
    }
    
    /**
     * Update search index
     * @param {Array} searchIndex - The search index data
     */
    function updateSearchIndex(searchIndex) {
      _searchIndex = searchIndex || [];
    }
    
    /**
     * Add common term to suggestions
     * @param {string} term - Term to add
     */
    function addCommonTerm(term) {
      if (!term || _commonTerms.includes(term)) return;
      
      _commonTerms.push(term);
      
      // Keep reasonable size
      if (_commonTerms.length > 20) {
        _commonTerms = _commonTerms.slice(-20);
      }
    }
    
    // Public API
    return {
      init: init,
      updateSearchIndex: updateSearchIndex,
      addCommonTerm: addCommonTerm,
      hideSuggestions: hideSuggestions
    };
  })();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for TechSearchCore to be initialized first
  setTimeout(() => {
    if (window.TechSearchSuggestions) {
      window.TechSearchSuggestions.init();
    }
  }, 500);
});
