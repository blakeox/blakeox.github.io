/**
 * Tech Search Core Module
 * Core functionality for the tech-inspired search feature.
 * 
 * Features:
 * - Loading search index
 * - Performing search with filters and sorting
 * - Rendering search results with highlighting
 * - Search result animations and visual effects
 * 
 * @module TechSearchCore
 */

// Check if the module has been loaded to prevent duplicate initialization
if (typeof window.TechSearchCore === 'undefined') {
  /**
   * Tech Search Core Module
   */
  window.TechSearchCore = (function() {
    // Private variables
    let _searchIndex = [];
    let _options = {
      searchInputSelector: '#search-input',
      resultsContainerSelector: '.search-results__list',
      statusElementSelector: '#search-status',
      searchBoxSelector: '.tech-search-box',
      searchFormSelector: '.search-form',
      resultItemClass: 'search-results__item',
      noResultsClass: 'search-results__no-result',
      debounceTime: 300
    };
    let _debounceTimer;
    let _initialized = false;
    
    /**
     * Initialize the search functionality
     * @param {Object} [options] - Configuration options
     */
    async function init(options = {}) {
      // Prevent multiple initializations
      if (_initialized) return;
      
      // Merge options
      _options = Object.assign(_options, options);
      
      // Get DOM elements
      const searchInput = document.querySelector(_options.searchInputSelector);
      const searchForm = document.querySelector(_options.searchFormSelector);
      
      if (!searchInput) {
        console.warn('Search input element not found');
        return;
      }
      
      if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
          e.preventDefault();
          performSearch();
        });
      }
      
      // Set up debounced search
      searchInput.addEventListener('input', function() {
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(performSearch, _options.debounceTime);
      });
      
      // Load search index
      try {
        await loadSearchIndex();
        
        // Initialize from URL parameters if present
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        if (searchQuery) {
          searchInput.value = searchQuery;
          performSearch();
        }
        
        _initialized = true;
      } catch (error) {
        console.error('Failed to initialize search:', error);
      }
    }
    
    /**
     * Load search index from JSON file
     */
    async function loadSearchIndex() {
      try {
        const response = await fetch('/search-index.json');
        if (!response.ok) {
          throw new Error('Failed to load search index');
        }
        
        const searchData = await response.json();
        
        // Process the data for search
        _searchIndex = searchData.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          url: item.url,
          category: item.category,
          date: item.date,
          snippet: item.snippet || extractSnippet(item.content, 150)
        }));
        
        updateStatus(`Search index loaded with ${_searchIndex.length} entries`);
      } catch (error) {
        console.error('Error loading search index:', error);
        updateStatus('Search functionality is currently unavailable', true);
        throw error;
      }
    }
    
    /**
     * Extract a snippet from content
     * @param {string} content - Content to extract from
     * @param {number} length - Maximum length of snippet
     * @returns {string} Extracted snippet
     */
    function extractSnippet(content, length) {
      if (!content) return '';
      const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, ' ').trim();
      return cleanContent.length > length 
        ? cleanContent.substring(0, length) + '...' 
        : cleanContent;
    }
    
    /**
     * Perform search with current input value
     */
    function performSearch() {
      const searchInput = document.querySelector(_options.searchInputSelector);
      const resultsContainer = document.querySelector(_options.resultsContainerSelector);
      
      if (!searchInput || !resultsContainer) return;
      
      const query = searchInput.value.toLowerCase().trim();
      
      // Create visual search feedback
      createSearchPulse();
      
      // Clear results
      resultsContainer.innerHTML = '';
      
      // Reset keyboard navigation
      if (window.TechSearchKeyboardNavigation) {
        window.TechSearchKeyboardNavigation.resetFocus();
      }
      
      if (query === '') {
        updateStatus('Please enter a search term');
        return;
      }
      
      // Get selected filters
      const activeFilters = getActiveFilters();
      const sortMethod = getActiveSortMethod();
      
      // Find matches
      let results = filterSearchResults(query, activeFilters);
      
      // Sort results
      results = sortSearchResults(results, sortMethod);
      
      // Update status
      updateStatus(`${results.length} result${results.length === 1 ? '' : 's'} found`);
      
      // Display results
      if (results.length > 0) {
        renderSearchResults(results, query, resultsContainer);
        
        // Initialize keyboard navigation
        if (window.TechSearchKeyboardNavigation) {
          const resultItems = Array.from(resultsContainer.querySelectorAll(`.${_options.resultItemClass}`));
          window.TechSearchKeyboardNavigation.updateResultItems(resultItems);
        }
      } else {
        renderNoResults(query, resultsContainer);
      }
      
      // Save search to history if available
      if (window.TechSearchHistory) {
        const statsContainer = document.querySelector('.search-stats');
        window.TechSearchHistory.saveSearch(query, results.length, statsContainer);
      } 
      
      // Announce to screen readers
      announceSearchResults(results.length, query);
    }
    
    /**
     * Get active filter options
     * @returns {Array} Active filter categories
     */
    function getActiveFilters() {
      const filterCheckboxes = document.querySelectorAll('.search-filter:checked');
      const filters = Array.from(filterCheckboxes).map(cb => cb.dataset.category);
      
      // If "all" is selected or no filters are selected, return empty array (no filtering)
      if (filters.includes('all') || filters.length === 0) {
        return [];
      }
      
      return filters;
    }
    
    /**
     * Get active sort method
     * @returns {string} Sort method ('relevance' or 'date')
     */
    function getActiveSortMethod() {
      const sortRadio = document.querySelector('.search-sort-option:checked');
      return sortRadio ? sortRadio.value : 'relevance';
    }
    
    /**
     * Filter search results based on query and filters
     * @param {string} query - Search query
     * @param {Array} filters - Category filters
     * @returns {Array} Filtered results
     */
    function filterSearchResults(query, filters) {
      return _searchIndex.filter(item => {
        // Match content
        const titleMatch = item.title.toLowerCase().includes(query);
        const contentMatch = item.content.toLowerCase().includes(query);
        const contentMatches = titleMatch || contentMatch;
        
        // Filter by category if filters are active
        const categoryMatches = filters.length === 0 || filters.includes(item.category);
        
        return contentMatches && categoryMatches;
      });
    }
    
    /**
     * Sort search results
     * @param {Array} results - Search results
     * @param {string} method - Sort method
     * @returns {Array} Sorted results
     */
    function sortSearchResults(results, method) {
      if (method === 'date') {
        return results.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date) - new Date(a.date);
        });
      }
      
      // Default to relevance (no sorting)
      return results;
    }
    
    /**
     * Render search results to container
     * @param {Array} results - Search results
     * @param {string} query - Search query for highlighting
     * @param {HTMLElement} container - Results container
     */
    function renderSearchResults(results, query, container) {
      results.forEach((result, index) => {
        // Highlight matched text
        let titleWithHighlight = highlightText(result.title, query);
        let snippetWithHighlight = highlightText(result.snippet, query);
        
        const resultItem = document.createElement('li');
        resultItem.className = `${_options.resultItemClass} searchable`;
        resultItem.setAttribute('tabindex', '0');
        resultItem.setAttribute('role', 'option');
        resultItem.setAttribute('aria-selected', 'false');
        resultItem.setAttribute('data-result-index', index.toString());
        
        resultItem.innerHTML = `
          <article>
            <h3 class="search-results__title">
              <a href="${result.url}">${titleWithHighlight}</a>
            </h3>
            ${result.category ? `<span class="search-results__category">${result.category}</span>` : ''}
            ${result.date ? `<span class="search-results__date">${formatDate(result.date)}</span>` : ''}
            <p class="search-results__snippet">${snippetWithHighlight}</p>
          </article>
        `;
        
        // Setup keyboard events for the result item
        resultItem.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            trackResultClick(result, query);
            window.location.href = result.url;
          }
        });
        
        // Track result clicks
        const resultLink = resultItem.querySelector('a');
        if (resultLink) {
          resultLink.addEventListener('click', function() {
            trackResultClick(result, query);
          });
        }
        
        container.appendChild(resultItem);
      });
    }
    
    /**
     * Render no results message
     * @param {string} query - Search query
     * @param {HTMLElement} container - Results container
     */
    function renderNoResults(query, container) {
      const noResults = document.createElement('li');
      noResults.className = _options.noResultsClass + ' tech-no-result';
      noResults.innerHTML = `
        <div class="tech-no-results-container">
          <span class="tech-icon">!</span>
          <p>No results found for <span class="query-text">"${query}"</span>.</p>
          <p class="suggestion">Try different keywords or check spelling.</p>
        </div>
      `;
      container.appendChild(noResults);
    }
    
    /**
     * Highlight search term in text
     * @param {string} text - Original text
     * @param {string} query - Search query
     * @returns {string} Highlighted text
     */
    function highlightText(text, query) {
      if (!text || !query) return text || '';
      
      // Handle multi-word queries by splitting into individual terms
      const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
      
      if (terms.length === 0) {
        return text;
      }
      
      let result = text;
      
      // Escape special regex characters to prevent errors
      const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Highlight each term individually
      terms.forEach(term => {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        result = result.replace(regex, '<mark>$1</mark>');
      });
      
      return result;
    }
    
    /**
     * Format date string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    function formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    /**
     * Update search status text
     * @param {string} message - Status message
     * @param {boolean} [isError=false] - Whether this is an error status
     */
    function updateStatus(message, isError = false) {
      const statusElement = document.querySelector(_options.statusElementSelector);
      if (!statusElement) return;
      
      statusElement.textContent = message;
      
      if (isError) {
        statusElement.classList.add('error');
      } else {
        statusElement.classList.remove('error');
      }
    }
    
    /**
     * Create visual pulse animation
     */
    function createSearchPulse() {
      const searchBox = document.querySelector(_options.searchBoxSelector);
      if (!searchBox) return;
      
      // Remove any existing pulses
      const existingPulse = document.querySelector('.search-pulse');
      if (existingPulse) {
        existingPulse.remove();
      }
      
      // Create pulse element
      const pulse = document.createElement('div');
      pulse.className = 'search-pulse';
      searchBox.appendChild(pulse);
      
      // Remove after animation completes
      setTimeout(() => {
        pulse.remove();
      }, 1000);
    }
    
    /**
     * Announce search results to screen readers
     * @param {number} count - Number of results
     * @param {string} query - Search query
     */
    function announceSearchResults(count, query) {
      if (window.TechSearchKeyboardNavigation) {
        window.TechSearchKeyboardNavigation.announceToScreenReaders(
          `Search complete. ${count} result${count === 1 ? '' : 's'} found for "${query}".`
        );
      }
    }
    
    /**
     * Track when users click on search results
     * @param {Object} result - The clicked search result
     * @param {string} query - The search query
     */
    function trackResultClick(result, query) {
      // Track via search history module if available
      if (window.TechSearchHistory && window.TechSearchHistory.trackResultClick) {
        window.TechSearchHistory.trackResultClick(query, result.url);
      }
    }
    
    /**
     * Get the current search index
     * @returns {Array} Search index data
     */
    function getSearchIndex() {
      return _searchIndex;
    }
    
    /**
     * Clear the search input and results
     */
    function clearSearch() {
      const searchInput = document.querySelector(_options.searchInputSelector);
      const resultsContainer = document.querySelector(_options.resultsContainerSelector);
      
      if (searchInput) {
        searchInput.value = '';
      }
      
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
      }
      
      updateStatus('Please enter a search term');
    }
    
    // Public API
    return {
      init: init,
      performSearch: performSearch,
      clearSearch: clearSearch,
      loadSearchIndex: loadSearchIndex,
      highlightText: highlightText,
      getSearchIndex: getSearchIndex
    };
  })();
}
