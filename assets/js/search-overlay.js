/**
 * Search Overlay functionality
 * Handles the opening, closing, and keyboard interactions for the search overlay
 */
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchOverlay = document.getElementById('search-overlay');
  if (!searchOverlay) return; // Exit if overlay doesn't exist
  
  const searchToggle = document.querySelector('.c-navbar__link--icon[data-analytics="nav-search"]');
  const closeSearchBtn = document.getElementById('close-search');
  const searchInput = searchOverlay.querySelector('.c-search-overlay__input');
  const searchForm = searchOverlay.querySelector('form');
  
  // Search history management - store recent searches
  const MAX_RECENT_SEARCHES = 5;
  
  function getRecentSearches() {
    try {
      const searches = localStorage.getItem('recentSearches');
      return searches ? JSON.parse(searches) : [];
    } catch (e) {
      console.error('Error retrieving recent searches:', e);
      return [];
    }
  }
  
  function addRecentSearch(query) {
    if (!query || query.trim() === '') return;
    
    try {
      let searches = getRecentSearches();
      
      // Remove if already exists (to avoid duplicates)
      searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
      
      // Add to the beginning
      searches.unshift(query);
      
      // Limit the number of stored searches
      searches = searches.slice(0, MAX_RECENT_SEARCHES);
      
      localStorage.setItem('recentSearches', JSON.stringify(searches));
    } catch (e) {
      console.error('Error saving recent search:', e);
    }
  }
  
  // Function to open search overlay
  function openSearchOverlay() {
    searchOverlay.classList.add('is-active');
    searchOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    searchInput.focus(); // Focus the input for immediate typing
    
    // Show recent searches if input is empty
    if (!searchInput.value) {
      displayRecentSearches();
    }
  }
  
  // Function to close search overlay
  function closeSearchOverlay() {
    searchOverlay.classList.remove('is-active');
    searchOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Return focus to the element that opened the overlay
    if (document.activeElement === searchInput || document.activeElement === closeSearchBtn) {
      searchToggle?.focus();
    }
  }
  
  // Display recent searches under the search input
  function displayRecentSearches() {
    // Use the dedicated container for recent searches
    const recentContainer = searchOverlay.querySelector('.c-search-overlay__recent');
    if (!recentContainer) return;
    
    const searches = getRecentSearches();
    if (searches.length === 0) {
      recentContainer.style.display = 'none';
      return;
    }
    
    recentContainer.style.display = 'block';
    recentContainer.innerHTML = `
      <h3 class="c-search-overlay__recent-title">Recent Searches</h3>
      <ul class="c-search-overlay__recent-list">
        ${searches.map(search => `
          <li>
            <button type="button" class="c-search-overlay__recent-item" data-query="${search}">
              <span class="c-search-overlay__recent-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              ${search}
            </button>
          </li>
        `).join('')}
      </ul>
    `;
    
    // Add event listeners to the recent search items
    recentContainer.querySelectorAll('.c-search-overlay__recent-item').forEach(button => {
      button.addEventListener('click', () => {
        const query = button.getAttribute('data-query');
        searchInput.value = query;
        searchForm.submit();
      });
    });
  }
  
  // Event listeners
  if (searchToggle) {
    searchToggle.addEventListener('click', (e) => {
      e.preventDefault();
      openSearchOverlay();
    });
  }
  
  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', () => {
      closeSearchOverlay();
    });
  }
  
  // Handle search form submission
  if (searchForm) {
    searchForm.addEventListener('submit', () => {
      const query = searchInput.value.trim();
      if (query) {
        addRecentSearch(query);
      }
    });
  }
  
  // Handle input events
  if (searchInput) {
    searchInput.addEventListener('focus', () => {
      if (!searchInput.value.trim()) {
        displayRecentSearches();
      }
    });
    
    searchInput.addEventListener('input', () => {
      if (!searchInput.value.trim()) {
        displayRecentSearches();
      } else {
        // Hide recent searches when typing
        const recentContainer = searchOverlay.querySelector('.c-search-overlay__recent');
        if (recentContainer) {
          recentContainer.style.display = 'none';
        }
      }
    });
  }
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('is-active')) {
      closeSearchOverlay();
    }
  });
  
  // Close if clicked outside the form
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
      closeSearchOverlay();
    }
  });
});
