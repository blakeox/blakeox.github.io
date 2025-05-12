/**
 * Tech Search Previews Module
 * Implements real-time search result previews and enhanced loading states
 * 
 * Features:
 * - Real-time search preview while typing
 * - Advanced loading states with animations
 * - Preview term highlighting
 * - Enhanced status updates
 * 
 * @module TechSearchPreviews
 */

// Check if the module has been loaded to prevent duplicate initialization
window.TechSearchPreviews = (function() {
  // Private variables
  let _options = {
    searchInputSelector: '#search-input',
    resultsContainerSelector: '.search-results__list',
    searchHeaderSelector: '.search-results-header',
    statusElementSelector: '#search-status',
    previewDebounceTime: 200,
    minQueryLength: 2
  };
  
  let _debounceTimer;
  let _initialized = false;
  let _loadingElement;
  let _previewElement;
  
  /**
   * Initialize the search previews module
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    // Prevent multiple initializations
    if (_initialized) return;
    
    // Merge options
    _options = Object.assign(_options, options);
    
    // Create loading element
    createLoadingElement();
    
    // Create preview element
    createPreviewElement();
    
    // Set up input handler for previews
    const searchInput = document.querySelector(_options.searchInputSelector);
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        
        // Show loading state
        if (query.length >= _options.minQueryLength) {
          showLoading(true);
        }
        
        // Clear previous debounce timer
        clearTimeout(_debounceTimer);
        
        // Set new timer for preview
        _debounceTimer = setTimeout(() => {
          if (query.length >= _options.minQueryLength) {
            generatePreview(query);
          } else {
            hidePreview();
          }
          
          // Hide loading after preview generation
          showLoading(false);
        }, _options.previewDebounceTime);
      });
      
      // Hide preview when search form is submitted (full search will run)
      const searchForm = document.querySelector('.search-form');
      if (searchForm) {
        searchForm.addEventListener('submit', () => {
          hidePreview();
          showLoading(true);
        });
      }
    }
    
    // Listen for search completion from core module
    document.addEventListener('techSearchComplete', () => {
      showLoading(false);
      hidePreview();
    });
    
    _initialized = true;
  }
  
  /**
   * Create loading element
   */
  function createLoadingElement() {
    // Create the loading container if it doesn't exist
    if (!document.querySelector('.search-loading-container')) {
      _loadingElement = document.createElement('div');
      _loadingElement.className = 'search-loading-container';
      _loadingElement.innerHTML = `
        <div class="tech-loader">
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <div class="loading-text">Processing query</div>
        </div>
      `;
      
      // Insert after the search form
      const searchForm = document.querySelector('.search-form');
      if (searchForm) {
        searchForm.parentNode.insertBefore(_loadingElement, searchForm.nextSibling);
      }
    } else {
      _loadingElement = document.querySelector('.search-loading-container');
    }
  }
  
  /**
   * Create preview element
   */
  function createPreviewElement() {
    // Create the preview container if it doesn't exist
    if (!document.querySelector('.search-preview')) {
      _previewElement = document.createElement('div');
      _previewElement.className = 'search-preview';
      _previewElement.innerHTML = `
        <div class="preview-content">
          <div class="preview-count"></div>
          <div class="preview-highlights"></div>
        </div>
      `;
      
      // Insert after the search form and loading container
      const searchBox = document.querySelector('.tech-search-box');
      if (searchBox) {
        searchBox.parentNode.insertBefore(_previewElement, searchBox.nextSibling);
      }
    } else {
      _previewElement = document.querySelector('.search-preview');
    }
  }
  
  /**
   * Show or hide loading animation
   * @param {boolean} show - Whether to show the loading state
   */
  function showLoading(show) {
    if (_loadingElement) {
      _loadingElement.classList.toggle('active', show);
    }
  }
  
  /**
   * Hide search preview
   */
  function hidePreview() {
    if (_previewElement) {
      _previewElement.classList.remove('active');
    }
  }
  
  /**
   * Generate and display search preview
   * @param {string} query - Search query
   */
  function generatePreview(query) {
    if (!_previewElement || !query) return;
    
    // Skip if SearchCore is not available
    if (!window.TechSearchCore) {
      console.warn('TechSearchCore module not found, previews disabled');
      return;
    }
    
    // Call lightweight preview search
    window.TechSearchCore.generatePreview(query)
      .then(previewData => {
        updatePreviewUI(previewData, query);
      })
      .catch(error => {
        console.error('Error generating preview:', error);
        hidePreview();
      });
  }
  
  /**
   * Update preview UI with search preview data
   * @param {Object} previewData - Preview data from search
   * @param {string} query - The search query
   */
  function updatePreviewUI(previewData, query) {
    if (!_previewElement) return;
    
    const { count, highlights } = previewData;
    
    // Update preview count text
    const countElement = _previewElement.querySelector('.preview-count');
    if (countElement) {
      countElement.textContent = count > 0
        ? `Found approximately ${count} result${count === 1 ? '' : 's'} for "${query}"`
        : `No matching results for "${query}"`;
    }
    
    // Update highlights
    const highlightsElement = _previewElement.querySelector('.preview-highlights');
    if (highlightsElement) {
      highlightsElement.innerHTML = '';
      
      if (highlights.length > 0) {
        // Display up to 5 highlights
        highlights.slice(0, 5).forEach(highlight => {
          const highlightEl = document.createElement('span');
          highlightEl.className = 'highlight-item';
          highlightEl.textContent = highlight;
          highlightsElement.appendChild(highlightEl);
        });
      } else {
        highlightsElement.innerHTML = '<em>Try modifying your search terms</em>';
      }
    }
    
    // Show the preview
    _previewElement.classList.add('active');
  }
  
  // Public API
  return {
    init,
    showLoading
  };
})();

// When page loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize search previews if the main module is loaded
  if (window.TechSearchCore) {
    window.TechSearchPreviews.init();
  }
});
