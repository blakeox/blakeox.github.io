document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.querySelector('#filter-dropdown');
  const searchInput = document.querySelector('#search-input');
  const projectItems = document.querySelectorAll('.project-item');
  const noResults = document.querySelector('#no-results'); 
  const loadMoreBtn = document.querySelector('#load-more-btn');
  const statusEl = document.querySelector('#filter-status');
  let debounceTimer;

  // Restore user preferences on load
  const savedTag = localStorage.getItem('filterTag');
  const savedQuery = localStorage.getItem('filterQuery');
  if (dropdown && savedTag) dropdown.value = savedTag;
  if (searchInput && savedQuery) searchInput.value = savedQuery;

  // Highlights matched text only in a specific element's content
  function highlightTextInEl(element, query) {
    if (!element) return;
    // Save original text to a data attribute (for restoring later)
    const originalText = element.dataset.originalText || element.textContent;
    element.dataset.originalText = originalText;

    if (!query) {
      element.innerHTML = originalText;
      return;
    }
    const regex = new RegExp(`(${query})`, 'gi');
    element.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
  }

  function updateStatus(visibleCount) {
    if (statusEl) {
      statusEl.textContent = `${visibleCount} projects found`;
    }
  }

  function updateURLParams(selectedTag, query) {
    const params = new URLSearchParams(window.location.search);
    params.set('tag', selectedTag);
    params.set('query', query);
    history.replaceState({}, '', `${window.location.pathname}?${params}`);
  }

  function filterProjects() {
    const selectedTag = dropdown?.value || 'all';
    const query = (searchInput?.value || '').toLowerCase();

    // Save preferences
    localStorage.setItem('filterTag', selectedTag);
    localStorage.setItem('filterQuery', query);

    // Update URL parameters
    updateURLParams(selectedTag, query);

    let visibleCount = 0;

    projectItems.forEach(item => {
      const itemText = item.textContent.toLowerCase();
      const itemTags = item.dataset.tags || '';
      const matchesTag = (selectedTag === 'all' || itemTags.includes(selectedTag));
      const matchesQuery = itemText.includes(query);

      // Only highlight the main paragraph or other specific elements, not the entire card
      const descriptionEl = item.querySelector('p');
      highlightTextInEl(descriptionEl, query);
      const titleEl = item.querySelector('h3 a');
      highlightTextInEl(titleEl, query);

      if (matchesTag && matchesQuery) {
        item.classList.remove('hidden');
        visibleCount++;
      } else {
        item.classList.add('hidden');
      }
    });

    // Show or hide 'no results' if nothing is visible
    if (noResults) {
      noResults.classList.toggle('hidden', visibleCount !== 0);
    }

    // Hide 'Load More' button if filters are applied
    loadMoreBtn?.classList.toggle('hidden', selectedTag !== 'all' || query !== '');

    updateStatus(visibleCount);
  }

  function debounceFilterProjects() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filterProjects, 300);
  }

  dropdown?.addEventListener('change', filterProjects);
  searchInput?.addEventListener('input', debounceFilterProjects);

  // Initial load
  filterProjects();
});
