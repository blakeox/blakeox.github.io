// filepath: /Users/blakepowell/Documents/GitHub/blakeox.github.io/assets/js/tech-settings.js
/**
 * Tech Search Settings Panel
 * This file handles the functionality for the tech search settings panel,
 * including theme toggling and animation settings.
 * 
 * This script is organized into several key sections:
 * 1. Core Settings Panel Initialization & Toggle Functionality
 * 2. Theme Management (selection, persistence, synchronization)
 * 3. Animation Toggle Controls (particles, scan lines, glow effects, radar)
 * 4. Accessibility Features (reduced motion, keyboard navigation)
 * 5. Browser Detection & Compatibility Adjustments
 * 
 * This script works with both:
 * - The search.html template (full page search)
 * - The search-overlay.html component (modal overlay)
 * 
 * @requires LocalStorage - For persisting user preferences
 * @module TechSettings
 */

// Check if the module has been loaded to prevent duplicate initialization
if (typeof window.TechSettings === 'undefined') {
  /**
   * Tech Settings Module
   * Manages tech interface settings and preferences
   */
  window.TechSettings = (function() {
    // Private variables
    const STORAGE_KEY = 'techSearchSettings';
    let _initialized = false;
    let _settingsPanel = null;
    let _isSearchPage = false;
    
    /**
     * Initialize tech settings
     */
    function init() {
      // Prevent multiple initializations
      if (_initialized) return;
      
      _isSearchPage = !!document.querySelector('.search-results__list');
      _settingsPanel = document.querySelector('.tech-settings-panel');
      
      if (!_settingsPanel) {
        console.warn('Tech settings panel not found');
        return;
      }
      
      // Initialize settings panel components
      initSettingsPanel();
      initPageThemeSynchronization();
      
      _initialized = true;
    }
    
    /**
     * Initialize the settings panel functionality
     */
    function initSettingsPanel() {
      if (!_settingsPanel) return;
    
      // Configure settings panel based on page context
      if (_isSearchPage) {
        // We're on the main search page - ensure settings affect the search.html structure
        console.log('Tech settings initialized for main search page');
      } else {
        // We're likely in the overlay - default behavior
        console.log('Tech settings initialized for overlay');
      }
      
      // DOM elements
      const toggleBtn = _settingsPanel.querySelector('.tech-settings-toggle');
      const closeBtn = _settingsPanel.querySelector('.tech-settings-close');
      const themeOptions = _settingsPanel.querySelectorAll('.theme-option');
      const toggleSwitches = _settingsPanel.querySelectorAll('.toggle-switch');
      
      // Initialize from saved preferences if available
      loadSavedSettings();
      
      // Toggle panel visibility
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          _settingsPanel.classList.add('active');
          _settingsPanel.querySelector('.tech-settings-content').setAttribute('aria-hidden', 'false');
        });
      }
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          _settingsPanel.classList.remove('active');
          _settingsPanel.querySelector('.tech-settings-content').setAttribute('aria-hidden', 'true');
        });
      }
      
      // Theme selection
      themeOptions.forEach(option => {
        option.addEventListener('click', () => {
          // Update aria-pressed state
          themeOptions.forEach(opt => opt.setAttribute('aria-pressed', 'false'));
          option.setAttribute('aria-pressed', 'true');
          
          // Apply theme
          const selectedTheme = option.getAttribute('data-theme');
          applyTechTheme(selectedTheme);
          
          // Save preference
          saveSettings('techTheme', selectedTheme);
        });
      });
      
      // Animation toggles
      toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', () => {
          const toggleId = toggle.id;
          const isEnabled = toggle.checked;
          
          applyAnimationSetting(toggleId, isEnabled);
          
          // Save preference
          saveSettings(toggleId, isEnabled);
        });
      });
      
      // Check for browser limitations and adjust UI accordingly
      detectBrowserLimitations();
    }
    
    /**
     * Apply tech theme to search containers
     * @param {string} theme - Theme name to apply
     */
    function applyTechTheme(theme) {
      const searchContainer = document.querySelector('.tech-search-page');
      const searchOverlay = document.getElementById('search-overlay');
      
      // Apply to main search page container
      if (searchContainer) {
        searchContainer.setAttribute('data-tech-theme', theme);
      }
      
      // Apply to search overlay if it exists (for mini search)
      if (searchOverlay) {
        searchOverlay.setAttribute('data-tech-theme', theme);
      }
      
      // Apply to any tech-themed cards or elements
      const techThemedElements = document.querySelectorAll('.tech-card, .tech-header');
      techThemedElements.forEach(element => {
        element.setAttribute('data-tech-theme', theme);
      });
      
      // Update theme name display if present
      const themeDisplayElement = document.getElementById('current-theme-name');
      if (themeDisplayElement) {
        const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
        themeDisplayElement.textContent = themeName;
      }
      
      // Update any theme-specific classes on body if needed
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${theme}`);
      
      // Notify screen readers of theme change
      announceToScreenReaders(`Theme changed to ${theme}`);
    }
    
    /**
     * Apply animation settings
     * @param {string} settingId - Setting ID
     * @param {boolean} enabled - Whether the setting is enabled
     */
    function applyAnimationSetting(settingId, enabled) {
      const htmlElement = document.documentElement;
      const searchPageContainer = document.querySelector('.tech-search-page');
      
      // Main HTML element classes for global effects
      switch(settingId) {
        case 'toggle-particles':
          htmlElement.classList.toggle('tech-disable-particles', !enabled);
          break;
          
        case 'toggle-scan-lines':
          htmlElement.classList.toggle('tech-disable-scan-lines', !enabled);
          break;
          
        case 'toggle-glow-effects':
          htmlElement.classList.toggle('tech-disable-glow', !enabled);
          break;
          
        case 'toggle-radar-ping':
          htmlElement.classList.toggle('tech-disable-radar', !enabled);
          break;
          
        case 'toggle-reduced-motion':
          htmlElement.classList.toggle('tech-reduced-motion', enabled);
          break;
      }
      
      // If on search.html page, also toggle classes on the search page container for scoped effects
      if (_isSearchPage && searchPageContainer) {
        switch(settingId) {
          case 'toggle-particles':
            searchPageContainer.classList.toggle('tech-disable-particles', !enabled);
            break;
            
          case 'toggle-scan-lines':
            searchPageContainer.classList.toggle('tech-disable-scan-lines', !enabled);
            break;
            
          case 'toggle-glow-effects':
            searchPageContainer.classList.toggle('tech-disable-glow', !enabled);
            break;
            
          case 'toggle-radar-ping':
            searchPageContainer.classList.toggle('tech-disable-radar', !enabled);
            break;
        }
      }
      
      // Notify screen readers of animation setting change
      const labelElement = document.querySelector(`label[for="${settingId}"]`);
      if (labelElement) {
        const settingName = labelElement.textContent;
        announceToScreenReaders(`${settingName} ${enabled ? 'enabled' : 'disabled'}`);
      }
    }
    
    /**
     * Helper function for screen reader announcements
     * @param {string} message - Message to announce
     */
    function announceToScreenReaders(message) {
      let ariaLive = document.getElementById('settings-aria-live');
      
      if (!ariaLive) {
        ariaLive = document.createElement('div');
        ariaLive.id = 'settings-aria-live';
        ariaLive.className = 'visually-hidden';
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.setAttribute('aria-atomic', 'true');
        document.body.appendChild(ariaLive);
      }
      
      ariaLive.textContent = message;
    }
    
    /**
     * Check for browser limitations and adjust UI accordingly
     */
    function detectBrowserLimitations() {
      // Add browser detection and limitation flags here
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      const isOldEdge = /Edge\/\d./i.test(navigator.userAgent);
      
      // Apply specific browser classes for CSS targeting if needed
      const html = document.documentElement;
      if (isSafari) html.classList.add('browser-safari');
      if (isFirefox) html.classList.add('browser-firefox');
      if (isOldEdge) html.classList.add('browser-old-edge');
      
      // Add browser info to settings note
      const settingsNote = document.querySelector('.tech-settings-note p');
      if (settingsNote) {
        if (isSafari) {
          settingsNote.innerHTML += ' <br>Some effects optimized for Safari.';
        } else if (isOldEdge) {
          settingsNote.innerHTML += ' <br>Limited effects available in this browser.';
        }
      }
    }
    
    /**
     * Save settings to localStorage
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     */
    function saveSettings(key, value) {
      if (!window.localStorage) return;
      
      try {
        // Get existing settings or create new object
        let techSettings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        
        // Update setting
        techSettings[key] = value;
        
        // Save back to storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(techSettings));
      } catch (e) {
        console.warn('Could not save tech search settings:', e);
      }
    }
    
    /**
     * Load saved settings from localStorage
     */
    function loadSavedSettings() {
      if (!window.localStorage || !_settingsPanel) return;
      
      try {
        const techSettings = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!techSettings) return;
        
        // Apply saved theme
        if (techSettings.techTheme) {
          applyTechTheme(techSettings.techTheme);
          // Update UI to match
          const themeOptions = _settingsPanel.querySelectorAll('.theme-option');
          themeOptions.forEach(opt => {
            opt.setAttribute('aria-pressed', opt.getAttribute('data-theme') === techSettings.techTheme);
          });
        }
        
        // Apply saved animation settings
        const toggleSwitches = _settingsPanel.querySelectorAll('.toggle-switch');
        toggleSwitches.forEach(toggle => {
          const toggleId = toggle.id;
          if (toggleId in techSettings) {
            toggle.checked = techSettings[toggleId];
            applyAnimationSetting(toggleId, techSettings[toggleId]);
          }
        });
        
      } catch (e) {
        console.warn('Could not load tech search settings:', e);
      }
    }
    
    /**
     * Keep themes synchronized between search page and overlay
     */
    function initPageThemeSynchronization() {
      // Get all tech theme containers
      const themeContainers = document.querySelectorAll('[data-tech-theme]');
      const searchOverlay = document.getElementById('search-overlay');
      const searchPage = document.querySelector('.tech-search-page');
      
      // Load saved theme from localStorage
      const savedSettings = getSavedSettings();
      const defaultTheme = savedSettings?.techTheme || 'default';
      
      // Apply the saved theme to all containers
      themeContainers.forEach(container => {
        container.setAttribute('data-tech-theme', defaultTheme);
      });
      
      // Update theme options UI if available
      const themeOptions = document.querySelectorAll('.theme-option');
      themeOptions.forEach(option => {
        const isSelected = option.getAttribute('data-theme') === defaultTheme;
        option.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });
      
      // Setup observers to keep themes in sync
      if (searchOverlay && searchPage) {
        // When overlay theme changes, update page theme
        observeThemeChanges(searchOverlay, (theme) => {
          searchPage.setAttribute('data-tech-theme', theme);
        });
        
        // When page theme changes, update overlay theme
        observeThemeChanges(searchPage, (theme) => {
          searchOverlay.setAttribute('data-tech-theme', theme);
        });
      }
    }
    
    /**
     * Observe theme changes on element
     * @param {HTMLElement} element - Element to observe
     * @param {Function} callback - Callback when theme changes
     */
    function observeThemeChanges(element, callback) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' &&
              mutation.attributeName === 'data-tech-theme') {
            const theme = element.getAttribute('data-tech-theme');
            callback(theme);
            saveThemeSetting(theme);
          }
        });
      });
      
      observer.observe(element, { attributes: true });
    }
    
    /**
     * Get saved settings from localStorage
     * @returns {Object|null} Saved settings or null if unavailable
     */
    function getSavedSettings() {
      if (!window.localStorage) return null;
      
      try {
        const techSettings = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return techSettings || null;
      } catch (e) {
        console.warn('Could not load tech search settings:', e);
        return null;
      }
    }
    
    /**
     * Save theme setting to localStorage
     * @param {string} theme - Theme to save
     */
    function saveThemeSetting(theme) {
      const currentSettings = getSavedSettings() || {};
      currentSettings.techTheme = theme;
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
      } catch (e) {
        console.warn('Could not save theme setting:', e);
      }
    }
    
    // Public API
    return {
      init: init,
      applyTechTheme: applyTechTheme,
      getSavedSettings: getSavedSettings,
      saveSettings: saveSettings,
      saveThemeSetting: saveThemeSetting
    };
  })();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.TechSettings) {
    window.TechSettings.init();
  }
});
