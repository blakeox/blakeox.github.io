document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.querySelector('#filter-dropdown');
  const searchInput = document.querySelector('#filter-search');
  const projectItems = document.querySelectorAll('.project-item');
  const noResults = document.querySelector('#no-results'); 
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

  function filterProjects() {
    const selectedTag = dropdown?.value || 'all';
    const query = (searchInput?.value || '').toLowerCase();

    // Save preferences
    localStorage.setItem('filterTag', selectedTag);
    localStorage.setItem('filterQuery', query);

    let visibleCount = 0;

    projectItems.forEach(item => {
      const itemText = item.textContent.toLowerCase();
      const itemTags = item.dataset.tags || '';
      const matchesTag = (selectedTag === 'all' || itemTags.includes(selectedTag));
      const matchesQuery = itemText.includes(query);

      // Only highlight the main paragraph or other specific elements, not the entire card
      const descriptionEl = item.querySelector('p');
      highlightTextInEl(descriptionEl, query);

      if (matchesTag && matchesQuery) {
        item.classList.remove('hidden');
        visibleCount++;
      } else {
        item.classList.add('hidden');
      }
    });

    // Show or hide "no results" if nothing is visible
    if (noResults) {
      noResults.classList.toggle('hidden', visibleCount !== 0);
    }
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
