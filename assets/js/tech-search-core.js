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
      
      // Set up form submit handler
      if (searchForm) {
        searchForm.addEventListener('submit', e => {
          e.preventDefault();
          search(searchInput.value);
        });
      }
      
      // Set up input handler with debounce
      searchInput.addEventListener('input', () => {
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(() => {
          search(searchInput.value);
        }, _options.debounceTime);
      });
      
      // Load search index
      await loadSearchIndex();
      
      // Initialize CategoryFilters if available
      if (window.CategoryFilters) {
        window.CategoryFilters.init({}, filters => {
          // When filters change, re-run the search with current query
          search(searchInput.value);
        });
      }
      
      // If initial query provided, perform search
      if (options.initialQuery) {
        search(options.initialQuery);
      }
      
      _initialized = true;
      
      // Dispatch event signaling search module is ready
      document.dispatchEvent(new Event('techSearchInitialized'));
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
        
        // Process the data for search with enhanced field support
        _searchIndex = searchData.map(item => ({
          id: item.id || item.url,
          title: item.title || '',
          content: item.content || '',
          url: item.url || '',
          type: item.type || 'page',
          categories: item.categories || [],
          category: item.category || (item.categories && item.categories.length ? item.categories[0] : ''),
          date: item.date || '',
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
     * @param {string} query - Search query
     * @returns {Promise} Promise resolving when search is complete
     */
    function search(query) {
      query = (query || '').toLowerCase().trim();
      
      // Create visual search feedback
      createSearchPulse();
      
      // Clear results and update UI state
      const resultsContainer = document.querySelector(_options.resultsContainerSelector);
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
      }
      
      // Reset keyboard navigation
      if (window.TechSearchKeyboardNavigation) {
        window.TechSearchKeyboardNavigation.resetFocus();
      }
      
      if (query === '') {
        updateStatus('Please enter a search term');
        // Dispatch event signaling search completion
        document.dispatchEvent(new Event('techSearchComplete'));
        return Promise.resolve([]);
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
      
      // Update category counts if available
      updateCategoryCounts(results);
      
      // Display results
      if (results.length > 0) {
        renderSearchResults(results, query, resultsContainer);
        
        // Initialize keyboard navigation
        if (window.TechSearchKeyboardNavigation) {
          const resultItems = Array.from(resultsContainer.querySelectorAll(`.${_options.resultItemClass}`));
          window.TechSearchKeyboardNavigation.updateResultItems(resultItems);
        }
      } else {
        renderNoResultsMessage(query, resultsContainer);
      }
      
      // Save search to history if available
      if (window.TechSearchHistory) {
        const statsContainer = document.querySelector('.search-stats');
        window.TechSearchHistory.saveSearch(query, results.length, statsContainer);
      } 
      
      // Announce to screen readers
      announceSearchResults(results.length, query);
      
      // Dispatch event signaling search completion
      document.dispatchEvent(new Event('techSearchComplete'));
      
      return Promise.resolve(results);
    }
    
    /**
     * Get active filter options
     * @returns {Array} Active filter categories
     */
    function getActiveFilters() {
      // Use CategoryFilters module if available
      if (window.CategoryFilters) {
        return window.CategoryFilters.getActiveFilters();
      }
      
      // Legacy fallback for backward compatibility
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
        // Match content across all important fields
        const titleMatch = (item.title || '').toLowerCase().includes(query);
        const contentMatch = (item.content || '').toLowerCase().includes(query);
        const snippetMatch = (item.snippet || '').toLowerCase().includes(query);
        
        // Check for category matches
        const categoryMatches = item.categories && item.categories.some(cat => 
          cat.toLowerCase().includes(query)
        );
        
        const contentMatches = titleMatch || contentMatch || snippetMatch || categoryMatches;
        
        // Filter by document type if filters are active
        // Map some common filter names to our internal type names
        const typeMatches = filters.length === 0 || 
            filters.some(filter => {
              if (filter === 'all') return true;
              if (filter === 'blog' && item.type === 'post') return true;
              if (filter === 'project' && item.type === 'project') return true;
              if (filter === 'page' && item.type === 'page') return true;
              return filter === item.type;
            });
        
        return contentMatches && typeMatches;
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
        
        // Add data attributes for content type and other metadata for styling
        if (result.type) {
            resultItem.setAttribute('data-type', result.type);
        }
        if (result.date) {
            resultItem.setAttribute('data-date', result.date);
        }
        
        resultItem.innerHTML = `
          <article>
            <div class="search-results__header">
              <h3 class="search-results__title">
                <a href="${result.url}">${titleWithHighlight}</a>
              </h3>
              ${result.type ? `<span class="search-results__type" data-type="${result.type}">${result.type}</span>` : ''}
            </div>
            <div class="search-results__meta">
              ${result.categories && result.categories.length ? result.categories.map(cat => `<span class="search-results__category">${cat}</span>`).join('') : ''}
              ${result.date ? `<span class="search-results__date">${formatDate(result.date)}</span>` : ''}
            </div>
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
     * Render no results message with suggestions
     * @param {string} query - Search query
     * @param {HTMLElement} container - Results container
     */
    function renderNoResultsMessage(query, container) {
      // Create related terms based on the query
      const getRelatedTerms = (q) => {
        // Split the query into terms
        const terms = q.toLowerCase().split(/\s+/).filter(t => t.length > 1);
        
        // Use some common topics from the site as fallbacks
        const commonTopics = [
          'projects', 'blog', 'tutorials', 'portfolio', 'technology', 
          'development', 'programming', 'web design', 'code', 'software',
          'github', 'javascript', 'python', 'react', 'design', 'analysis'
        ];
        
        // Try to create related terms
        let related = [];
        
        // If we have a multi-word query, suggest individual parts
        if (terms.length > 1) {
          related = [...terms.slice(0, 2)]; // Include first two individual terms
          
          // Add combination of first words with slight modification
          if (terms[0].length > 3 && terms[1].length > 3) {
            related.push(`${terms[0]} ${terms[1].substring(0, Math.ceil(terms[1].length * 0.7))}`);
          }
          
          // Try to find similar topic
          commonTopics.forEach(topic => {
            for (const term of terms) {
              if (term.length > 3 && 
                (topic.includes(term.substring(0, 3)) || 
                term.includes(topic.substring(0, 3)))) {
                related.push(topic);
                break;
              }
            }
          });
        } else if (terms.length === 1) {
          // For single word queries, find related terms
          const term = terms[0];
          
          // Try some prefix/suffix modifications
          if (term.length > 5) {
            related.push(term.substring(0, Math.floor(term.length * 0.7)));
            
            // Try alternate endings if the term might be plural or past tense
            if (term.endsWith('s')) {
              related.push(term.substring(0, term.length - 1));
            } else if (term.endsWith('ing')) {
              related.push(term.substring(0, term.length - 3));
            } else if (term.endsWith('ed')) {
              related.push(term.substring(0, term.length - 2));
            } else {
              // Try adding common suffixes
              related.push(`${term}s`);
            }
          }
          
          // Find common topics that contain parts of the term
          commonTopics.forEach(topic => {
            if (topic.includes(term.substring(0, Math.min(3, term.length))) || 
                term.includes(topic.substring(0, Math.min(3, topic.length)))) {
              related.push(topic);
            }
          });
        }
        
        // Add some common topics if we don't have enough suggestions
        while (related.length < 3) {
          const randomTopic = commonTopics[Math.floor(Math.random() * commonTopics.length)];
          if (!related.includes(randomTopic)) {
            related.push(randomTopic);
          }
        }
        
        // Return de-duplicated list
        return [...new Set(related)].slice(0, 3);
      };
      
      // Generate related terms based on query and search index
      let relatedTerms = getRelatedTerms(query);
      
      // Look for similar terms in search index (fuzzy matching)
      if (_searchIndex && _searchIndex.length > 0) {
        const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
        
        // Find potential matches in titles and categories
        const potentialMatches = new Set();
        queryTerms.forEach(term => {
          // Only check first few chars to allow for fuzzy matching
          const termPrefix = term.substring(0, Math.min(4, term.length));
          
          _searchIndex.slice(0, 50).forEach(item => { // Limit to first 50 items for performance
            // Check title words
            const titleWords = (item.title || '').toLowerCase().split(/\s+/);
            titleWords.forEach(word => {
              if (word.length > 3 && (word.includes(termPrefix) || termPrefix.includes(word.substring(0, 3)))) {
                potentialMatches.add(word);
              }
            });
            
            // Check categories
            (item.categories || []).forEach(category => {
              const catLower = category.toLowerCase();
              if (catLower.includes(termPrefix) || termPrefix.includes(catLower.substring(0, 3))) {
                potentialMatches.add(category.toLowerCase());
              }
            });
          });
        });
        
        // Add potential matches to related terms
        if (potentialMatches.size > 0) {
          relatedTerms = [...relatedTerms, ...Array.from(potentialMatches).slice(0, 3)];
        }
      }
      
      // Deduplicate and limit
      relatedTerms = [...new Set(relatedTerms)].slice(0, 5);
      
      // Format the related terms as HTML with improved styling
      const relatedTermsHtml = relatedTerms.map(term => 
        `<li><a href="#" class="suggested-term tech-suggested-term" data-term="${term}">
          <span class="suggestion-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <span class="suggestion-text">${term}</span>
        </a></li>`
      ).join('');
      
      // Create no results container with enhanced styling
      const noResults = document.createElement('li');
      noResults.className = `${_options.noResultsClass} tech-no-results`;
      noResults.innerHTML = `
        <div class="tech-no-results-content">
          <div class="no-results-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3 class="no-results-title">No matching results</h3>
          <p class="no-results-message">Your search for <strong>"${query}"</strong> did not match any content.</p>
          
          <div class="no-results-suggestions">
            <div class="suggestions-section">
              <p class="suggestions-title">Suggestions:</p>
              <ul class="suggestions-list">
                <li>Check your spelling</li>
                <li>Try using more general terms</li>
                <li>Use fewer keywords</li>
                <li>Try different filters</li>
              </ul>
            </div>
            
            <div class="related-terms-section">
              <p class="suggestions-title">You might be looking for:</p>
              <ul class="related-terms-list">
                ${relatedTermsHtml}
              </ul>
            </div>
          </div>
          
          <div class="no-results-help">
            <span class="help-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </span>
            <span class="help-text">Still can't find what you're looking for? Try browsing the <a href="/blog/">blog</a> or <a href="/projects/">projects</a>.</span>
          </div>
        </div>
      `;
      
      // Add the no results element to the container
      container.appendChild(noResults);
      
      // Add event listeners for suggested terms
      const suggestedTerms = noResults.querySelectorAll('.suggested-term');
      suggestedTerms.forEach(term => {
        term.addEventListener('click', (e) => {
          e.preventDefault();
          // Get the term value, accounting for nested elements in the link
          let target = e.target;
          while (target && !target.hasAttribute('data-term') && target !== term) {
            target = target.parentElement;
          }
          
          const suggestedTerm = target.getAttribute('data-term');
          const searchInput = document.querySelector(_options.searchInputSelector);
          
          if (searchInput && suggestedTerm) {
            // Add visual feedback
            const allSuggestions = document.querySelectorAll('.suggested-term');
            allSuggestions.forEach(s => s.classList.remove('clicked'));
            target.classList.add('clicked');
            
            // Animate the input change
            const currentValue = searchInput.value;
            let i = 0;
            searchInput.value = '';
            
            // Clear and retype the new search term for visual effect
            const typingInterval = setInterval(() => {
              if (i <= suggestedTerm.length) {
                searchInput.value = suggestedTerm.substring(0, i);
                i++;
              } else {
                clearInterval(typingInterval);
                // Perform search after typing animation
                search(suggestedTerm);
              }
            }, 30);
          }
        });
      });
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
    
    /**
     * Update category counts based on search results
     * @param {Array} results - Search results
     */
    function updateCategoryCounts(results) {
      // Skip if CategoryFilters is not available
      if (!window.CategoryFilters) return;
      
      // Count items by category
      const counts = {
        blog: 0,
        project: 0,
        page: 0
      };
      
      // Map internal types to filter types
      results.forEach(item => {
        if (item.type === 'post') counts.blog++;
        else if (item.type === 'project') counts.project++;
        else if (item.type === 'page') counts.page++;
        else {
          // Check if item has a category that matches our filter types
          const category = (item.category || '').toLowerCase();
          if (category === 'blog') counts.blog++;
          else if (category === 'project') counts.project++;
          else if (category === 'page') counts.page++;
        }
      });
      
      // Update the category filter counts
      window.CategoryFilters.updateCounts(counts);
    }
    
    /**
     * Generate search preview for real-time feedback
     * @param {string} query - Search query
     * @returns {Promise} Promise resolving with preview data
     */
    function generatePreview(query) {
      query = (query || '').toLowerCase().trim();
      
      return new Promise((resolve) => {
        // If query is empty, return empty results
        if (!query || query.length < 2) {
          resolve({ count: 0, highlights: [] });
          return;
        }
        
        // Do lightweight search (without rendering)
        const activeFilters = getActiveFilters();
        const results = filterSearchResults(query, activeFilters);
        
        // Extract highlights (unique terms that match the query)
        const highlights = [];
        const uniqueTerms = new Set();
        
        // Extract unique matching terms from results
        if (results.length > 0) {
          results.forEach(result => {
            // Extract words that contain the query
            const content = (result.content || '').toLowerCase();
            const words = content.split(/\s+/);
            
            words.forEach(word => {
              // Remove punctuation
              const cleanWord = word.replace(/[^\w\s]/g, '');
              
              // Add unique terms that include the query
              if (cleanWord.includes(query) && 
                  cleanWord.length > 3 && 
                  !uniqueTerms.has(cleanWord) &&
                  highlights.length < 10) {
                uniqueTerms.add(cleanWord);
                highlights.push(cleanWord);
              }
            });
          });
        }
        
        resolve({
          count: results.length,
          highlights: highlights
        });
      });
    }
    
    // Public API
    return {
      init: init,
      performSearch: performSearch,
      clearSearch: clearSearch,
      search: search,
      loadSearchIndex: loadSearchIndex,
      highlightText: highlightText,
      getSearchIndex: getSearchIndex
    };
  })();
}
