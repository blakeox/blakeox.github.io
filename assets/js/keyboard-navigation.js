/**
 * Keyboard Navigation Module
 * Handles keyboard navigation for search results and other interactive elements.
 * 
 * Features:
 * - Arrow key navigation through search results
 * - Enter key to follow links
 * - Escape key to reset focus
 * - Screen reader announcements for accessibility
 * - Focus management for keyboard users
 * 
 * @module KeyboardNavigation
 */

// Check if the module has been loaded to prevent duplicate initialization
if (typeof window.TechSearchKeyboardNavigation === 'undefined') {
  /**
   * Tech Search Keyboard Navigation Module
   */
  window.TechSearchKeyboardNavigation = (function() {
    // Private variables
    let _resultItems = []; // Array of result items
    let _currentFocusIndex = -1; // Current focused item index
    let _searchInput = null; // Reference to search input element
    
    /**
     * Initialize keyboard navigation
     * @param {HTMLElement} searchInputElement - The search input element
     * @param {HTMLElement[]} resultElements - Array of result elements
     * @param {Function} [callback] - Optional callback after navigation
     */
    function init(searchInputElement, resultElements, callback = null) {
      if (!searchInputElement) {
        console.warn('Search input element not found. Keyboard navigation not initialized.');
        return;
      }
      
      _searchInput = searchInputElement;
      _resultItems = Array.from(resultElements || []);
      _currentFocusIndex = -1;
      
      // Set up global keyboard shortcuts
      setupGlobalShortcuts();
      
      // Remove existing event listeners to prevent duplicates
      _searchInput.removeEventListener('keydown', handleSearchInputKeyDown);
      
      // Add keyboard navigation event listener
      _searchInput.addEventListener('keydown', handleSearchInputKeyDown);
      
      // Add event listeners to result items
      _resultItems.forEach((item, index) => {
        item.addEventListener('click', function() {
          updateFocusedItem(index, callback);
        });
        
        item.addEventListener('focus', function() {
          updateFocusedItem(index, callback);
        });
      });
      
      // Reset focus state
      resetFocus();
    }
    
    /**
     * Handle keyboard events in search input
     * @param {Event} e - Keyboard event
     */
    function handleSearchInputKeyDown(e) {
      // Only process if we have results
      if (!_resultItems.length) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          navigate(1); // Move down
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          navigate(-1); // Move up
          break;
          
        case 'Enter':
          e.preventDefault();
          if (_currentFocusIndex >= 0 && _currentFocusIndex < _resultItems.length) {
            // Find and click the link within the current focused result
            const link = _resultItems[_currentFocusIndex].querySelector('a');
            if (link) link.click();
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          resetFocus();
          break;
      }
    }
    
    /**
     * Navigate through results
     * @param {number} direction - Direction to navigate (1 for down, -1 for up)
     */
    function navigate(direction) {
      if (!_resultItems.length) return;
      
      // Calculate new index with wrapping
      let newIndex = _currentFocusIndex + direction;
      
      // Handle out of bounds
      if (newIndex < 0) {
        newIndex = _resultItems.length - 1; // Wrap to last result
      } else if (newIndex >= _resultItems.length) {
        newIndex = 0; // Wrap to first result
      }
      
      updateFocusedItem(newIndex);
    }
    
    /**
     * Update the focused item
     * @param {number} index - Index of item to focus
     * @param {Function} [callback] - Optional callback after focus change
     */
    function updateFocusedItem(index, callback = null) {
      _currentFocusIndex = index;
      
      // Update visual styles
      updateResultStyles();
      
      // Focus the item
      if (_currentFocusIndex >= 0 && _currentFocusIndex < _resultItems.length) {
        _resultItems[_currentFocusIndex].focus();
        
        // Get the result title for screen reader announcement
        const resultTitle = _resultItems[_currentFocusIndex].querySelector('.search-results__title')?.textContent || 'Result';
        announceToScreenReaders(`Selected result: ${resultTitle}`);
        
        // Call callback if provided
        if (typeof callback === 'function') {
          callback(_currentFocusIndex, _resultItems[_currentFocusIndex]);
        }
      }
    }
    
    /**
     * Update visual styles of all results
     */
    function updateResultStyles() {
      _resultItems.forEach((item, i) => {
        if (i === _currentFocusIndex) {
          item.classList.add('focused');
          item.setAttribute('aria-selected', 'true');
        } else {
          item.classList.remove('focused');
          item.setAttribute('aria-selected', 'false');
        }
      });
    }
    
    /**
     * Reset focus to search input
     */
    function resetFocus() {
      _currentFocusIndex = -1;
      updateResultStyles();
      if (_searchInput) {
        _searchInput.focus();
      }
    }
    
    /**
     * Make an announcement for screen readers
     * @param {string} message - Message to announce
     */
    function announceToScreenReaders(message) {
      let ariaLive = document.getElementById('sr-announcements');
      
      if (!ariaLive) {
        ariaLive = document.createElement('div');
        ariaLive.id = 'sr-announcements';
        ariaLive.className = 'visually-hidden';
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.setAttribute('aria-atomic', 'true');
        document.body.appendChild(ariaLive);
      }
      
      ariaLive.textContent = message;
    }
    
    /**
     * Update result items after DOM changes
     * @param {HTMLElement[]} newResultItems - New array of result elements
     */
    function updateResultItems(newResultItems) {
      _resultItems = Array.from(newResultItems || []);
      _currentFocusIndex = -1;
      
      // Re-initialize with the new items
      if (_searchInput) {
        init(_searchInput, _resultItems);
      }
    }
    
    /**
     * Focus on the search input element
     */
    function focusOnSearchInput() {
      if (_searchInput) {
        _searchInput.focus();
        
        // Select text if there's any
        if (_searchInput.value) {
          _searchInput.select();
        }
      }
    }
    
    /**
     * Setup global keyboard shortcuts for search functionality
     */
    function setupGlobalShortcuts() {
      // Remove existing global listeners to prevent duplicates
      document.removeEventListener('keydown', handleGlobalKeyDown);
      
      // Add global keyboard shortcuts
      document.addEventListener('keydown', handleGlobalKeyDown);
      
      // Register with the keyboard shortcuts module if available
      if (window.TechKeyboardShortcuts && typeof window.TechKeyboardShortcuts.registerShortcut === 'function') {
        // Register search focus shortcut
        window.TechKeyboardShortcuts.registerShortcut('/', function() {
          focusOnSearchInput();
          announceToScreenReaders('Search box focused. Type to search.');
        }, 'Focus search', 'global');
        
        // Register alternative search focus shortcut
        window.TechKeyboardShortcuts.registerShortcut('Alt+s', function() {
          focusOnSearchInput();
          announceToScreenReaders('Search box focused. Type to search.');
        }, 'Focus search (alternative)', 'global');
      }
    }
    
    /**
     * Handle global keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleGlobalKeyDown(e) {
      // Skip if focus is in a text input (except our search input) or textarea
      if ((e.target.tagName === 'INPUT' && e.target !== _searchInput && e.target.type === 'text') || 
          e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Keyboard shortcuts (using / to trigger search is common in many web apps)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        focusOnSearchInput();
        announceToScreenReaders('Search box focused. Type to search.');
      }
      
      // Alt+S to focus search box (additional shortcut)
      if (e.key === 's' && e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        focusOnSearchInput();
        announceToScreenReaders('Search box focused. Type to search.');
      }
      
      // Escape to blur search when focused and cancel search
      if (e.key === 'Escape' && document.activeElement === _searchInput) {
        e.preventDefault();
        _searchInput.blur();
        resetFocus();
        
        // Clear search if TechSearchCore is available
        if (window.TechSearchCore && window.TechSearchCore.clearSearch) {
          window.TechSearchCore.clearSearch();
        }
        
        announceToScreenReaders('Search cancelled.');
      }
    }
    
    // Public API
    return {
      init: init,
      navigate: navigate,
      resetFocus: resetFocus,
      updateResultItems: updateResultItems,
      announceToScreenReaders: announceToScreenReaders,
      focusOnSearchInput: focusOnSearchInput
    };
  })();
}
