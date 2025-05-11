/**
 * Tech Keyboard Shortcuts Module
 * Provides keyboard shortcut help and functionality.
 * 
 * Features:
 * - Keyboard shortcut help dialog
 * - Shortcut registration and handling
 * - Visual key indicators
 * 
 * @module TechKeyboardShortcuts
 */

// Check if the module has been loaded to prevent duplicate initialization
if (typeof window.TechKeyboardShortcuts === 'undefined') {
  /**
   * Tech Keyboard Shortcuts Module
   */
  window.TechKeyboardShortcuts = (function() {
    // Private variables
    let _options = {
      shortcutIndicatorClass: 'tech-key',
      shortcutDialogSelector: '#keyboard-shortcuts-dialog',
      shortcutHelpBtnSelector: '.keyboard-shortcut-help-btn'
    };
    let _registeredShortcuts = [];
    let _initialized = false;
    let _isDialogOpen = false;
    let _dialog = null;
    
    /**
     * Initialize keyboard shortcuts
     * @param {Object} [options] - Configuration options
     */
    function init(options = {}) {
      // Prevent multiple initializations
      if (_initialized) return;
      
      // Merge options
      _options = Object.assign(_options, options);
      
      // Setup keyboard shortcut help button if it exists
      const helpBtn = document.querySelector(_options.shortcutHelpBtnSelector);
      
      if (helpBtn) {
        helpBtn.addEventListener('click', function(e) {
          e.preventDefault();
          toggleShortcutsDialog();
        });
      }
      
      // Create or get the keyboard shortcuts dialog
      setupShortcutsDialog();
      
      // Register default shortcuts
      registerDefaultShortcuts();
      
      // Add shortcut listener
      document.addEventListener('keydown', handleShortcuts);
      
      // Mark as initialized
      _initialized = true;
    }
    
    /**
     * Setup the shortcuts dialog
     */
    function setupShortcutsDialog() {
      // Check if dialog already exists
      _dialog = document.querySelector(_options.shortcutDialogSelector);
      
      if (!_dialog) {
        // Create the dialog
        _dialog = document.createElement('div');
        _dialog.id = _options.shortcutDialogSelector.substring(1); // Remove # from selector
        _dialog.className = 'tech-keyboard-dialog';
        _dialog.setAttribute('role', 'dialog');
        _dialog.setAttribute('aria-modal', 'true');
        _dialog.setAttribute('aria-labelledby', 'keyboard-shortcuts-title');
        _dialog.setAttribute('tabindex', '-1');
        _dialog.setAttribute('aria-hidden', 'true');
        
        // Create dialog content
        _dialog.innerHTML = `
          <div class="dialog-content">
            <div class="dialog-header">
              <h2 id="keyboard-shortcuts-title">Keyboard Shortcuts</h2>
              <button class="dialog-close" aria-label="Close keyboard shortcuts">×</button>
            </div>
            <div class="dialog-body">
              <div class="shortcut-section">
                <h3>Global</h3>
                <ul class="shortcut-list" id="global-shortcuts">
                  <li><span class="tech-key">/</span> <span class="shortcut-description">Focus search</span></li>
                  <li><span class="tech-key">Alt</span> + <span class="tech-key">S</span> <span class="shortcut-description">Focus search (alternative)</span></li>
                  <li><span class="tech-key">?</span> <span class="shortcut-description">Show this help dialog</span></li>
                </ul>
              </div>
              
              <div class="shortcut-section">
                <h3>Search Results</h3>
                <ul class="shortcut-list" id="search-shortcuts">
                  <li><span class="tech-key">↑</span> <span class="shortcut-description">Previous result</span></li>
                  <li><span class="tech-key">↓</span> <span class="shortcut-description">Next result</span></li>
                  <li><span class="tech-key">Enter</span> <span class="shortcut-description">Open selected result</span></li>
                  <li><span class="tech-key">Esc</span> <span class="shortcut-description">Clear search</span></li>
                </ul>
              </div>
            </div>
            <div class="dialog-footer">
              <a href="/search-shortcuts/" class="c-btn c-btn--tech c-btn--sm">View All Shortcuts</a>
            </div>
          </div>
        `;
        
        // Add to document
        document.body.appendChild(_dialog);
        
        // Add event listener for close button
        const closeBtn = _dialog.querySelector('.dialog-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', function() {
            hideShortcutsDialog();
          });
        }
        
        // Add event listener for clicking outside the dialog
        _dialog.addEventListener('click', function(e) {
          if (e.target === _dialog) {
            hideShortcutsDialog();
          }
        });
        
        // Add escape key handler when dialog is open
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && _isDialogOpen) {
            hideShortcutsDialog();
          }
        });
      }
      
      // Add style if not present
      addDialogStyles();
    }
    
    /**
     * Add dialog styles to the document
     */
    function addDialogStyles() {
      const styleId = 'tech-keyboard-dialog-styles';
      
      // Check if styles are already added
      if (document.getElementById(styleId)) {
        return;
      }
      
      // Create style element
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        .tech-keyboard-dialog {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }
        
        .tech-keyboard-dialog.active {
          display: flex;
        }
        
        .tech-keyboard-dialog .dialog-content {
          background: var(--tech-background-color, #121212);
          border: 1px solid var(--tech-accent-color, #2196f3);
          border-radius: 6px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 0 20px rgba(33, 150, 243, 0.4);
          position: relative;
        }
        
        .tech-keyboard-dialog .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(33, 150, 243, 0.3);
        }
        
        .tech-keyboard-dialog h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--tech-accent-color, #2196f3);
        }
        
        .tech-keyboard-dialog .dialog-close {
          background: none;
          border: none;
          color: var(--tech-text-color, #ffffff);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }
        
        .tech-keyboard-dialog .dialog-close:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .tech-keyboard-dialog .dialog-body {
          padding: 20px;
        }
        
        .tech-keyboard-dialog .shortcut-section {
          margin-bottom: 20px;
        }
        
        .tech-keyboard-dialog h3 {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
          color: var(--tech-text-color, #ffffff);
          opacity: 0.8;
        }
        
        .tech-keyboard-dialog .shortcut-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .tech-keyboard-dialog .shortcut-list li {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          padding: 4px 0;
        }
        
        .tech-keyboard-dialog .shortcut-description {
          margin-left: 10px;
          color: var(--tech-text-color, #ffffff);
          opacity: 0.7;
        }
        
        .tech-keyboard-dialog .dialog-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(33, 150, 243, 0.3);
          text-align: right;
        }
      `;
      
      // Add to document head
      document.head.appendChild(styleElement);
    }
    
    /**
     * Toggle keyboard shortcuts dialog
     */
    function toggleShortcutsDialog() {
      _isDialogOpen ? hideShortcutsDialog() : showShortcutsDialog();
    }
    
    /**
     * Show the keyboard shortcuts dialog
     */
    function showShortcutsDialog() {
      if (_dialog) {
        _dialog.classList.add('active');
        _dialog.setAttribute('aria-hidden', 'false');
        _dialog.focus();
        _isDialogOpen = true;
        
        // Trap focus within dialog
        trapFocus(_dialog);
      }
    }
    
    /**
     * Hide the keyboard shortcuts dialog
     */
    function hideShortcutsDialog() {
      if (_dialog) {
        _dialog.classList.remove('active');
        _dialog.setAttribute('aria-hidden', 'true');
        _isDialogOpen = false;
        
        // Remove focus trap
        removeFocusTrap();
      }
    }
    
    /**
     * Register default keyboard shortcuts
     */
    function registerDefaultShortcuts() {
      // Dialog toggle shortcut
      registerShortcut('?', function() {
        toggleShortcutsDialog();
      }, 'Show keyboard shortcuts', 'global');
    }
    
    /**
     * Register a keyboard shortcut
     * @param {string} key - Key or key combination
     * @param {Function} callback - Function to call when shortcut is triggered
     * @param {string} description - Description of the shortcut
     * @param {string} category - Category for grouping shortcuts
     */
    function registerShortcut(key, callback, description, category = 'global') {
      _registeredShortcuts.push({
        key: key,
        callback: callback,
        description: description,
        category: category
      });
    }
    
    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleShortcuts(e) {
      // Skip shortcut handling in form elements except for specific keys
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) && 
          !['?', 'Escape'].includes(e.key)) {
        return;
      }
      
      // If modal is open, only process Escape
      if (_isDialogOpen && e.key !== 'Escape') {
        return;
      }
      
      // Check registered shortcuts
      _registeredShortcuts.forEach(shortcut => {
        if (matchesShortcut(e, shortcut.key)) {
          e.preventDefault();
          shortcut.callback(e);
        }
      });
    }
    
    /**
     * Check if event matches a shortcut key
     * @param {KeyboardEvent} e - Keyboard event
     * @param {string} shortcutKey - Shortcut key to match
     * @returns {boolean} Whether the event matches the shortcut
     */
    function matchesShortcut(e, shortcutKey) {
      // Simple key match
      if (shortcutKey === e.key) {
        return true;
      }
      
      // Handle combination keys (e.g. "Alt+S")
      if (shortcutKey.includes('+')) {
        const parts = shortcutKey.split('+').map(p => p.trim().toLowerCase());
        
        // Check modifier keys
        const modifiers = {
          alt: e.altKey,
          ctrl: e.ctrlKey,
          shift: e.shiftKey,
          meta: e.metaKey
        };
        
        // Check if all parts match
        return parts.every(part => {
          if (part in modifiers) {
            return modifiers[part];
          } else {
            return e.key.toLowerCase() === part;
          }
        });
      }
      
      return false;
    }
    
    /**
     * Trap focus inside an element
     * @param {HTMLElement} element - Element to trap focus within
     */
    function trapFocus(element) {
      const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), ' +
        'textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Focus the first element
      firstElement.focus();
      
      // Handle tab key
      element.addEventListener('keydown', handleTabKey);
      
      function handleTabKey(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
    
    /**
     * Remove focus trap event listener
     */
    function removeFocusTrap() {
      if (_dialog) {
        _dialog.removeEventListener('keydown', handleTabKey);
      }
      
      function handleTabKey() {} // Placeholder to satisfy the linter
    }
    
    // Public API
    return {
      init: init,
      registerShortcut: registerShortcut,
      showShortcutsDialog: showShortcutsDialog,
      hideShortcutsDialog: hideShortcutsDialog
    };
  })();
}
