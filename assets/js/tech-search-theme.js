/**
 * Search Overlay Theme Management
 * Handles theme switching and persistence for the search overlay
 */
class SearchOverlayTheme {
  constructor() {
    this.searchOverlay = document.getElementById('search-overlay');
    if (!this.searchOverlay) {
      console.warn('Search overlay element not found');
      return;
    }

    this.themeKey = 'searchOverlayTheme';
    this.currentTheme = this.getStoredTheme() || 'default';
    
    this.initialize();
  }

  initialize() {
    // Apply initial theme
    this.applyTheme(this.currentTheme);
    
    // Listen for theme changes
    this.bindEvents();
    
    // Listen for system theme changes
    this.watchSystemTheme();
  }

  bindEvents() {
    // Listen for theme toggle buttons
    const themeButtons = document.querySelectorAll('.theme-option');
    themeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const theme = button.getAttribute('data-theme');
        this.setTheme(theme);
      });
    });

    // Listen for theme change events
    this.searchOverlay.addEventListener('themechange', (e) => {
      this.applyTheme(e.detail.theme);
    });
  }

  watchSystemTheme() {
    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e) => {
      if (this.currentTheme === 'system') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);
  }

  getStoredTheme() {
    try {
      return localStorage.getItem(this.themeKey);
    } catch (e) {
      console.warn('Could not access localStorage:', e);
      return 'default';
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    
    try {
      localStorage.setItem(this.themeKey, theme);
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e);
    }
    
    this.applyTheme(theme);
  }

  applyTheme(theme) {
    // Remove all theme classes
    this.searchOverlay.classList.remove('theme-default', 'theme-dark', 'theme-light', 'theme-neon', 'theme-cyberpunk');
    
    // Add new theme class
    this.searchOverlay.classList.add(`theme-${theme}`);
    
    // Update data attribute
    this.searchOverlay.setAttribute('data-tech-theme', theme);
    
    // Update CSS variables
    this.updateThemeVariables(theme);
    
    // Dispatch theme change event
    const event = new CustomEvent('themechange', {
      detail: { theme }
    });
    this.searchOverlay.dispatchEvent(event);
  }

  updateThemeVariables(theme) {
    const root = document.documentElement;
    
    switch (theme) {
      case 'dark':
        root.style.setProperty('--tech-primary', '#90caf9');
        root.style.setProperty('--tech-primary-rgb', '144, 202, 249');
        root.style.setProperty('--tech-secondary', '#3d8eff');
        root.style.setProperty('--tech-secondary-rgb', '61, 142, 255');
        root.style.setProperty('--tech-accent', '#f459cc');
        root.style.setProperty('--tech-accent-rgb', '244, 89, 204');
        root.style.setProperty('--tech-grid-color', 'rgba(85, 210, 230, 0.2)');
        root.style.setProperty('--tech-glow-color', 'rgba(61, 142, 255, 0.6)');
        root.style.setProperty('--tech-bg-color', 'rgba(20, 30, 40, 0.9)');
        root.style.setProperty('--tech-bg-color-rgb', '20, 30, 40');
        break;
        
      case 'neon':
        root.style.setProperty('--tech-primary', '#0ff');
        root.style.setProperty('--tech-primary-rgb', '0, 255, 255');
        root.style.setProperty('--tech-secondary', '#f0f');
        root.style.setProperty('--tech-secondary-rgb', '255, 0, 255');
        root.style.setProperty('--tech-accent', '#ff0');
        root.style.setProperty('--tech-accent-rgb', '255, 255, 0');
        root.style.setProperty('--tech-grid-color', 'rgba(0, 255, 255, 0.15)');
        root.style.setProperty('--tech-glow-color', 'rgba(255, 0, 255, 0.6)');
        root.style.setProperty('--tech-bg-color', 'rgba(0, 10, 20, 0.95)');
        root.style.setProperty('--tech-bg-color-rgb', '0, 10, 20');
        break;
        
      case 'cyberpunk':
        root.style.setProperty('--tech-primary', '#ff00ff');
        root.style.setProperty('--tech-primary-rgb', '255, 0, 255');
        root.style.setProperty('--tech-secondary', '#00ffff');
        root.style.setProperty('--tech-secondary-rgb', '0, 255, 255');
        root.style.setProperty('--tech-accent', '#ffff00');
        root.style.setProperty('--tech-accent-rgb', '255, 255, 0');
        root.style.setProperty('--tech-grid-color', 'rgba(255, 0, 255, 0.15)');
        root.style.setProperty('--tech-glow-color', 'rgba(0, 255, 255, 0.6)');
        root.style.setProperty('--tech-bg-color', 'rgba(0, 0, 0, 0.95)');
        root.style.setProperty('--tech-bg-color-rgb', '0, 0, 0');
        break;
        
      default:
        root.style.setProperty('--tech-primary', '#4dc8aa');
        root.style.setProperty('--tech-primary-rgb', '77, 200, 170');
        root.style.setProperty('--tech-secondary', '#0af');
        root.style.setProperty('--tech-secondary-rgb', '0, 170, 255');
        root.style.setProperty('--tech-accent', '#f0a');
        root.style.setProperty('--tech-accent-rgb', '255, 0, 170');
        root.style.setProperty('--tech-grid-color', 'rgba(85, 210, 230, 0.15)');
        root.style.setProperty('--tech-glow-color', 'rgba(0, 170, 255, 0.6)');
        root.style.setProperty('--tech-bg-color', 'rgba(0, 20, 40, 0.9)');
        root.style.setProperty('--tech-bg-color-rgb', '0, 20, 40');
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  isDarkTheme() {
    return this.currentTheme === 'dark' || 
           (this.currentTheme === 'system' && 
            window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
}

// Export for use in other modules
window.SearchOverlayTheme = SearchOverlayTheme; 