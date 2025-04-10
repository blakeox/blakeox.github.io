document.addEventListener('DOMContentLoaded', () => {
  // Helper function to save a setting to localStorage
  function saveSetting(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Helper function to load a setting from localStorage
  function loadSetting(key, defaultValue = null) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  // Manage Dark Mode Setting
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    const isDarkMode = loadSetting('darkMode', false);
    document.body.classList.toggle('dark-mode', isDarkMode);
    darkModeToggle.setAttribute('aria-pressed', isDarkMode);

    darkModeToggle.addEventListener('click', () => {
      const newDarkModeState = !document.body.classList.contains('dark-mode');
      document.body.classList.toggle('dark-mode', newDarkModeState);
      saveSetting('darkMode', newDarkModeState);
      darkModeToggle.setAttribute('aria-pressed', newDarkModeState);
    });
  }

  // Manage Project Filters
  const filterDropdown = document.getElementById('filter-dropdown');
  const searchInput = document.getElementById('search-input');
  if (filterDropdown && searchInput) {
    // Restore saved filter and search query
    filterDropdown.value = loadSetting('filterTag', 'all');
    searchInput.value = loadSetting('filterQuery', '');

    // Save filter and search query on change
    filterDropdown.addEventListener('change', () => {
      saveSetting('filterTag', filterDropdown.value);
    });

    searchInput.addEventListener('input', () => {
      saveSetting('filterQuery', searchInput.value);
    });
  }

  // Manage Items Per Page Setting
  const itemsPerPageInput = document.getElementById('items-per-page');
  if (itemsPerPageInput) {
    const savedItemsPerPage = loadSetting('itemsPerPage', 6);
    itemsPerPageInput.value = savedItemsPerPage;

    itemsPerPageInput.addEventListener('change', () => {
      const newItemsPerPage = parseInt(itemsPerPageInput.value, 10) || 6;
      saveSetting('itemsPerPage', newItemsPerPage);
      location.reload(); // Reload the page to apply the new setting
    });
  }

  // Reset Settings Button
  const resetSettingsButton = document.getElementById('reset-settings');
  if (resetSettingsButton) {
    resetSettingsButton.addEventListener('click', () => {
      localStorage.clear();
      location.reload(); // Reload the page to reset all settings
    });
  }
});