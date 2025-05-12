/**
 * Category Filters Module
 * Enhances search experience with interactive category filtering
 * 
 * Features:
 * - Interactive filter buttons with counts
 * - Visual feedback and animations
 * - Accessibility support with ARIA attributes
 * - Keyboard navigation
 * 
 * @module CategoryFilters
 */

// Create the CategoryFilters module
window.CategoryFilters = (function() {
  // Private variables
  let _options = {
    filterButtonSelector: '.category-filter-btn',
    activeClass: 'active',
    countSelector: '.filter-count',
    loadingSelector: '.search-filters-loading'
  };
  let _buttons = [];
  let _counts = { all: 0, blog: 0, project: 0, page: 0 };
  let _initialized = false;
  let _callback = null;
  
  /**
   * Initialize the category filters
   * @param {Object} options - Configuration options
   * @param {Function} callback - Callback function when filters change
   */
  function init(options = {}, callback = null) {
    // Prevent multiple initializations
    if (_initialized) return;
    
    // Merge options
    _options = Object.assign(_options, options);
    
    // Store the callback
    _callback = callback;
    
    // Get all filter buttons
    _buttons = document.querySelectorAll(_options.filterButtonSelector);
    
    // Add event listeners to buttons
    _buttons.forEach(button => {
      button.addEventListener('click', handleFilterClick);
      
      // Add keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFilterClick.call(button, e);
        }
      });
    });
    
    // Mark as initialized
    _initialized = true;
    
    // Initial update of counts (if data available)
    updateCountsFromStorage();
  }
  
  /**
   * Handle filter button click
   * @param {Event} e - Click event
   */
  function handleFilterClick(e) {
    // Get the clicked button and category
    const button = this;
    const category = button.getAttribute('data-category');
    
    // Show loading indicator
    showLoading(true);
    
    // Toggle active state
    if (category === 'all') {
      // If "All" is clicked, deactivate other buttons
      _buttons.forEach(btn => {
        const isAll = btn.getAttribute('data-category') === 'all';
        btn.classList.toggle(_options.activeClass, isAll);
        btn.setAttribute('aria-pressed', isAll ? 'true' : 'false');
      });
    } else {
      // If a specific category is clicked
      // First, deactivate "All" button
      const allButton = document.querySelector(`${_options.filterButtonSelector}[data-category="all"]`);
      if (allButton) {
        allButton.classList.remove(_options.activeClass);
        allButton.setAttribute('aria-pressed', 'false');
      }
      
      // Toggle this button
      const isActive = button.classList.toggle(_options.activeClass);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      
      // If no buttons are active after this click, activate "All"
      const anyActive = Array.from(_buttons).some(btn => 
        btn.getAttribute('data-category') !== 'all' && 
        btn.classList.contains(_options.activeClass)
      );
      
      if (!anyActive && allButton) {
        allButton.classList.add(_options.activeClass);
        allButton.setAttribute('aria-pressed', 'true');
      }
    }
    
    // Get active filters and notify callback
    const activeFilters = getActiveFilters();
    if (_callback && typeof _callback === 'function') {
      _callback(activeFilters);
    }
    
    // Hide loading after a short delay (to show the animation)
    setTimeout(() => showLoading(false), 300);
  }
  
  /**
   * Show or hide loading indicator
   * @param {boolean} show - Whether to show the loading indicator
   */
  function showLoading(show) {
    const loader = document.querySelector(_options.loadingSelector);
    if (loader) {
      loader.classList.toggle('visible', show);
      loader.setAttribute('aria-hidden', show ? 'false' : 'true');
    }
  }
  
  /**
   * Get active filter categories
   * @returns {Array} Active filter categories
   */
  function getActiveFilters() {
    // Check if "All" is active
    const allButton = document.querySelector(`${_options.filterButtonSelector}[data-category="all"].${_options.activeClass}`);
    if (allButton) {
      return []; // Empty array means no filtering (all included)
    }
    
    // Get all active category buttons
    const activeButtons = document.querySelectorAll(`${_options.filterButtonSelector}:not([data-category="all"]).${_options.activeClass}`);
    
    // Map to categories
    return Array.from(activeButtons).map(btn => btn.getAttribute('data-category'));
  }
  
  /**
   * Update counts for each category
   * @param {Object} counts - Object with counts for each category
   */
  function updateCounts(counts = {}) {
    // Store the counts
    _counts = Object.assign(_counts, counts);
    
    // Calculate total for "All" category
    _counts.all = Object.values(_counts).reduce((sum, count) => sum + count, 0) - _counts.all;
    
    // Update DOM
    _buttons.forEach(button => {
      const category = button.getAttribute('data-category');
      const countEl = button.querySelector(_options.countSelector);
      
      if (countEl && _counts[category] !== undefined) {
        countEl.textContent = _counts[category];
      }
    });
    
    // Store counts in sessionStorage for persistence
    try {
      sessionStorage.setItem('categoryFilterCounts', JSON.stringify(_counts));
    } catch (e) {
      console.warn('Could not save category counts to sessionStorage:', e);
    }
  }
  
  /**
   * Update counts from storage (if available)
   */
  function updateCountsFromStorage() {
    try {
      const storedCounts = sessionStorage.getItem('categoryFilterCounts');
      if (storedCounts) {
        updateCounts(JSON.parse(storedCounts));
      }
    } catch (e) {
      console.warn('Could not load category counts from sessionStorage:', e);
    }
  }
  
  // Public API
  return {
    init,
    getActiveFilters,
    updateCounts
  };
})();
