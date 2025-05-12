/**
 * Search functionality for blakeox.github.io
 * This script provides in-page search capabilities for both:
 * 1. Filtering items with .searchable class (for in-page filtering)
 * 2. Ful        // Process the data for search
        _searchIndex = searchData.map(item => ({
          id: item.id,
          title: item.title || '',
          content: item.content || '', 
          url: item.url || '',
          category: item.category || '',
          categories: item.categories || [],
          type: item.type || 'page',
          date: item.date || '',
          snippet: item.snippet || ''
        }));rch using the search index (for the dedicated search page)
 */
document.addEventListener('DOMContentLoaded', () => {
  // Common utility functions
  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Highlight matched text
  function highlightText(text, query) {
    if (!text || !query) return text || '';
    
    try {
      // Escape special regex characters in the query
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    } catch (e) {
      console.error('Error highlighting text:', e);
      return text;
    }
  }
  
  // In-page search functionality (for filtering elements with .searchable class)
  function initInPageSearch() {
    const searchInput = document.querySelector('.filter-input');
    if (!searchInput) return;
    
    const items = document.querySelectorAll('.searchable');
    const status = document.querySelector('.filter-status');
    
    function updateStatus(visibleCount) {
      if (status) {
        status.textContent = `${visibleCount} results found`;
        status.setAttribute('aria-live', 'polite');
      }
    }
    
    function highlightInPageElement(element, query) {
      if (!element) return;
      
      // Store the original text if it's not already stored
      if (!element.dataset.originalText) {
        // Find all elements that could contain text to highlight
        const textElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, li');
        
        textElements.forEach(el => {
          if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
            el.dataset.originalText = el.textContent;
          }
        });
      }
    
      if (!query) {
        // Reset the text if there's no query
        const textElements = element.querySelectorAll('[data-original-text]');
        textElements.forEach(el => {
          el.innerHTML = el.dataset.originalText;
        });
        return;
      }
      
      try {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        // Highlight text in elements with stored original text
        const textElements = element.querySelectorAll('[data-original-text]');
        textElements.forEach(el => {
          el.innerHTML = el.dataset.originalText.replace(regex, '<mark>$1</mark>');
        });
      } catch (e) {
        console.error('Error highlighting element:', e);
        // Restore original text on error
        const textElements = element.querySelectorAll('[data-original-text]');
        textElements.forEach(el => {
          el.innerHTML = el.dataset.originalText;
        });
      }
    }
    
    searchInput.addEventListener('input', debounce(() => {
      const query = searchInput.value.toLowerCase().trim();
      let visibleCount = 0;

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const isVisible = text.includes(query) || query === '';
        item.style.display = isVisible ? '' : 'none';
        
        if (isVisible) {
          visibleCount++;
          highlightInPageElement(item, query);
        } else {
          highlightInPageElement(item, '');
        }
      });

      updateStatus(visibleCount);
    }, 300));
  }

  // Initialize in-page search if elements exist
  initInPageSearch();

  // Initialize full site search functionality on the search page
  const searchPage = document.querySelector('.search-page');
  if (searchPage) {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.querySelector('.search-results__list');
    const searchStatus = document.getElementById('search-status');
    const searchForm = document.querySelector('.search-form');
    
    if (!searchInput || !resultsContainer || !searchStatus || !searchForm) {
      console.error('Search page elements not found');
      return;
    }
    
    // Prevent form submission
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      performSearch();
    });
    
    // Extract snippet of text from content
    function extractSnippet(content, length, query) {
      if (!content) return '';
      
      const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, ' ').trim();
      
      // If query exists, try to find a relevant snippet
      if (query && query.length > 2 && cleanContent.toLowerCase().includes(query.toLowerCase())) {
        const queryIndex = cleanContent.toLowerCase().indexOf(query.toLowerCase());
        const startIndex = Math.max(0, queryIndex - 60);
        const endIndex = Math.min(cleanContent.length, queryIndex + 120);
        
        let snippet = cleanContent.substring(startIndex, endIndex);
        
        // Add ellipsis if we're not at the start or end
        if (startIndex > 0) snippet = '...' + snippet;
        if (endIndex < cleanContent.length) snippet += '...';
        
        return snippet;
      }
      
      // Default to first part of content
      return cleanContent.length > length 
        ? cleanContent.substring(0, length) + '...' 
        : cleanContent;
    }
    
    // Format date from ISO string to readable format
    function formatDate(dateString) {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (e) {
        console.error('Error formatting date:', e);
        return '';
      }
    }
    
    // Load and process the search index
    let searchIndex = [];
    
    async function loadSearchIndex() {
      try {
        const response = await fetch('/search-index.json');
        if (!response.ok) {
          throw new Error(`Failed to load search index: ${response.status}`);
        }
        
        const searchData = await response.json();
        
        // Process the data for search
        searchIndex = searchData.map(item => ({
          id: item.id,
          title: item.title || '',
          content: item.content || '', 
          url: item.url || '',
          category: item.category || '',
          date: item.date || '',
          snippet: item.snippet || ''
        }));
        
        return true;
      } catch (error) {
        console.error('Error loading search index:', error);
        searchStatus.textContent = 'Search functionality is currently unavailable';
        searchStatus.classList.add('error');
        return false;
      }
    }
    
    // Get active category filters
    function getActiveFilters() {
      const allFilter = document.querySelector('.search-filter[data-category="all"]');
      if (allFilter?.checked) {
        return null; // No filtering if "All" is selected
      }
      
      const activeFilters = [];
      document.querySelectorAll('.search-filter:not([data-category="all"])').forEach(checkbox => {
        if (checkbox.checked) {
          activeFilters.push(checkbox.getAttribute('data-category'));
        }
      });
      
      return activeFilters.length > 0 ? activeFilters : null;
    }
    
    // Set up category filter handlers
    function setupCategoryFilters() {
      const allFilter = document.querySelector('.search-filter[data-category="all"]');
      const categoryFilters = document.querySelectorAll('.search-filter:not([data-category="all"])');
      
      // Initial state - add active class to All filter label
      if (allFilter) {
        allFilter.closest('.search-filter-label').classList.add('active');
      }
      
      function updateActiveFilterClasses() {
        // Reset all filter labels
        document.querySelectorAll('.search-filter-label').forEach(label => {
          label.classList.remove('active');
        });
        
        // Add active class to checked filters
        document.querySelectorAll('.search-filter:checked').forEach(checkbox => {
          checkbox.closest('.search-filter-label').classList.add('active');
        });
      }
      
      if (allFilter) {
        allFilter.addEventListener('change', () => {
          if (allFilter.checked) {
            // When "All" is checked, uncheck specific categories
            categoryFilters.forEach(filter => {
              filter.checked = false;
            });
            
            // Update active state
            updateActiveFilterClasses();
          }
          performSearch();
        });
      }
      
      categoryFilters.forEach(filter => {
        filter.addEventListener('change', () => {
          // If any specific category is checked, uncheck "All"
          if (filter.checked && allFilter) {
            allFilter.checked = false;
          }
          
          // If no specific category is checked, check "All"
          const anyChecked = Array.from(categoryFilters).some(f => f.checked);
          if (!anyChecked && allFilter) {
            allFilter.checked = true;
          }
          
          // Update active state
          updateActiveFilterClasses();
          
          performSearch();
        });
      });
    }
    
    // Set up sort options
    function setupSortOptions() {
      const sortOptions = document.querySelectorAll('.search-sort-option');
      
      // Add active class to default sort option
      document.querySelector('.search-sort-option:checked')
        ?.closest('.search-sort-label')
        ?.classList.add('active');
      
      sortOptions.forEach(option => {
        option.addEventListener('change', () => {
          // Update active class
          document.querySelectorAll('.search-sort-label').forEach(label => {
            label.classList.remove('active');
          });
          
          option.closest('.search-sort-label').classList.add('active');
          
          // Re-run search with new sort option
          performSearch();
        });
      });
    }
    
    // Calculate relevance score for search results
    function calculateRelevance(item, query) {
      let score = 0;
      const queryLower = query.toLowerCase();
      
      // Title matches are weighted more heavily
      if (item.title && item.title.toLowerCase().includes(queryLower)) {
        score += 10;
        // Exact title match or starts with query gets higher score
        if (item.title.toLowerCase() === queryLower) {
          score += 10;
        } else if (item.title.toLowerCase().startsWith(queryLower)) {
          score += 5;
        }
      }
      
      // Content matches
      if (item.content && item.content.toLowerCase().includes(queryLower)) {
        // Count occurrences of the query in content
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const occurrences = (item.content.match(regex) || []).length;
        score += Math.min(occurrences, 5); // Cap at 5 points for occurrences
      }
      
      return score;
    }
    
    // Search analytics to track user search patterns
    function trackSearchAnalytics(query, resultCount, filters, sortOption) {
      try {
        // Store search data in localStorage
        const searchData = {
          query,
          resultCount,
          filters: filters || 'all',
          sortOption,
          timestamp: new Date().toISOString(),
        };
        
        // Get existing analytics or initialize new array
        let searchAnalytics = [];
        try {
          const storedAnalytics = localStorage.getItem('searchAnalytics');
          if (storedAnalytics) {
            searchAnalytics = JSON.parse(storedAnalytics);
          }
        } catch (e) {
          console.error('Error parsing stored search analytics:', e);
        }
        
        // Add new search data and limit history
        searchAnalytics.unshift(searchData);
        searchAnalytics = searchAnalytics.slice(0, 50); // Keep last 50 searches
        
        // Save back to localStorage
        localStorage.setItem('searchAnalytics', JSON.stringify(searchAnalytics));
        
        // If Google Analytics or similar is available, track event
        if (typeof ga === 'function') {
          ga('send', 'event', 'Search', 'query', query, resultCount);
        }
      } catch (e) {
        console.error('Error tracking search analytics:', e);
      }
    }

    // Display search statistics from analytics data
    function displaySearchStatistics() {
      try {
        const storedAnalytics = localStorage.getItem('searchAnalytics');
        if (!storedAnalytics) return;
        
        const searchAnalytics = JSON.parse(storedAnalytics);
        if (!searchAnalytics || !searchAnalytics.length) return;
        
        const statsContainer = document.querySelector('.search-stats');
        if (!statsContainer) return;
        
        // Remove hidden class to display stats
        statsContainer.classList.remove('hidden');
        
        // Update statistics
        document.getElementById('recent-search-count').textContent = searchAnalytics.length;
        
        // Calculate most common search term
        const termCounts = {};
        searchAnalytics.forEach(item => {
          const term = item.query.toLowerCase();
          termCounts[term] = (termCounts[term] || 0) + 1;
        });
        
        // Find the term with highest count
        let mostCommonTerm = '';
        let highestCount = 0;
        
        Object.entries(termCounts).forEach(([term, count]) => {
          if (count > highestCount) {
            mostCommonTerm = term;
            highestCount = count;
          }
        });
        
        document.getElementById('most-common-term').textContent = mostCommonTerm || 'None';
        
        // Calculate average results
        const totalResults = searchAnalytics.reduce((sum, item) => sum + item.resultCount, 0);
        const avgResults = (totalResults / searchAnalytics.length).toFixed(1);
        document.getElementById('avg-results').textContent = avgResults;
        
        // Set up clear history button
        const clearButton = document.getElementById('clear-search-history');
        if (clearButton) {
          clearButton.addEventListener('click', () => {
            localStorage.removeItem('searchAnalytics');
            localStorage.removeItem('recentSearches');
            statsContainer.classList.add('hidden');
          });
        }
      } catch (e) {
        console.error('Error displaying search statistics:', e);
      }
    }

    // Perform search against the index
    function performSearch() {
      const query = searchInput.value.toLowerCase().trim();
      const activeFilters = getActiveFilters();
      const sortType = document.querySelector('.search-sort-option:checked')?.value || 'relevance';
      
      // Clear results
      resultsContainer.innerHTML = '';
      
      if (query === '') {
        searchStatus.textContent = 'Please enter a search term';
        return;
      }
      
      // Find matches
      let results = searchIndex.filter(item => {
        if (!item.title && !item.content) return false;
        
        // Apply category filters if active
        if (activeFilters && !activeFilters.includes(item.category)) {
          return false;
        }
        
        const titleMatch = item.title && item.title.toLowerCase().includes(query);
        const contentMatch = item.content && item.content.toLowerCase().includes(query);
        return titleMatch || contentMatch;
      });
      
      // Add relevance score for sorting
      results = results.map(item => ({
        ...item,
        relevance: calculateRelevance(item, query)
      }));
      
      // Sort results according to selected option
      if (sortType === 'relevance') {
        results.sort((a, b) => b.relevance - a.relevance);
      } else if (sortType === 'date') {
        results.sort((a, b) => {
          // Handle null dates or invalid dates
          if (!a.date) return 1;
          if (!b.date) return -1;
          
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          
          // Sort newest first
          return dateB - dateA;
        });
      }
      
      // Update status
      searchStatus.textContent = `${results.length} result${results.length === 1 ? '' : 's'} found`;
      
      // Track search analytics
      trackSearchAnalytics(query, results.length, activeFilters, sortType);

      // Display results
      if (results.length > 0) {
        results.forEach(result => {
          // Create a relevant snippet based on the query
          const snippet = result.snippet || extractSnippet(result.content, 150, query);
          
          // Highlight matched text
          const titleWithHighlight = highlightText(result.title, query);
          const snippetWithHighlight = highlightText(snippet, query);
          
          const resultItem = document.createElement('li');
          resultItem.className = 'search-results__item searchable';
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
          resultsContainer.appendChild(resultItem);
        });
      } else {
        const noResults = document.createElement('li');
        noResults.className = 'search-results__no-result';
        noResults.innerHTML = `<p>No results found for '${query}'. Try different keywords or check spelling.</p>`;
        resultsContainer.appendChild(noResults);
      }
    }
    
    // Handle keyboard navigation in search results
    function setupKeyboardNavigation() {
      let currentFocusIndex = -1;
      const resultLinks = [];
      
      function updateResultLinks() {
        resultLinks.length = 0;
        document.querySelectorAll('.search-results__item a').forEach(link => {
          resultLinks.push(link);
        });
      }
      
      function focusResult(index) {
        // Remove focus from current item
        if (currentFocusIndex >= 0 && currentFocusIndex < resultLinks.length) {
          resultLinks[currentFocusIndex].classList.remove('keyboard-focus');
        }
        
        // Update index
        currentFocusIndex = index;
        
        // Focus new item if valid
        if (currentFocusIndex >= 0 && currentFocusIndex < resultLinks.length) {
          const link = resultLinks[currentFocusIndex];
          link.classList.add('keyboard-focus');
          link.focus();
          
          // Ensure the item is visible
          const rect = link.getBoundingClientRect();
          const isInViewport = 
            rect.top >= 0 &&
            rect.bottom <= window.innerHeight;
            
          if (!isInViewport) {
            link.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }
      
      // Reset focus when search input is focused
      searchInput.addEventListener('focus', () => {
        if (currentFocusIndex !== -1) {
          resultLinks[currentFocusIndex]?.classList.remove('keyboard-focus');
          currentFocusIndex = -1;
        }
      });
      
      // Handle keyboard navigation
      document.addEventListener('keydown', (e) => {
        // Only handle keyboard navigation when search page is active
        if (!document.querySelector('.search-page')) return;
        
        // Update the collection of result links
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          updateResultLinks();
        }
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            focusResult(Math.min(currentFocusIndex + 1, resultLinks.length - 1));
            break;
            
          case 'ArrowUp':
            e.preventDefault();
            if (currentFocusIndex === -1) {
              focusResult(resultLinks.length - 1);
            } else {
              focusResult(Math.max(currentFocusIndex - 1, 0));
            }
            break;
            
          case 'Escape':
            searchInput.focus();
            searchInput.select();
            currentFocusIndex = -1;
            break;
        }
      });
      
      // After performing search, reset navigation
      const originalPerformSearch = performSearch;
      performSearch = function() {
        originalPerformSearch.apply(this, arguments);
        currentFocusIndex = -1;
        // Give time for the DOM to update before updating links
        setTimeout(updateResultLinks, 100);
      };
    }
    
    // Initialize search
    async function initSearch() {
      const success = await loadSearchIndex();
      if (!success) return;
      
      // Set up search input event listener
      searchInput.addEventListener('input', debounce(performSearch, 300));
      
      // Set up category filters
      setupCategoryFilters();
      
      // Set up sort options
      setupSortOptions();
      
      // Set up keyboard navigation
      setupKeyboardNavigation();
      
      // Initialize search if URL contains search parameters
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('q');
      if (searchQuery) {
        searchInput.value = searchQuery;
        performSearch();
      }

      // Display search statistics
      displaySearchStatistics();
    }
    
    // Start initialization
    initSearch();
  }
});