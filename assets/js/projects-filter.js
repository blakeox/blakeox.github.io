document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('#filter-dropdown');
    const searchInput = document.querySelector('#search-input');
    const sortDropdown = document.querySelector('#sort-dropdown');
    const projectGrid = document.querySelector('#project-grid');
    const projectItems = Array.from(document.querySelectorAll('.project-item'));
    const noResults = document.querySelector('#no-results');
    const loadMoreBtn = document.querySelector('#load-more-btn');
    
    let debounceTimer;
    let itemsPerPage = 6;
    
    // Restore saved filters
    dropdown.value = localStorage.getItem('filterTag') || 'all';
    searchInput.value = localStorage.getItem('filterQuery') || '';
    
    function debounce(func, delay) {
      return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
      };
    }
    
    function highlightText(el, query) {
      if (!el) return;
      const original = el.dataset.originalText || el.textContent;
      el.dataset.originalText = original;
      el.innerHTML = query ? original.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>') : original;
    }
    
    function filterProjects() {
      const selectedTag = dropdown.value;
      const query = searchInput.value.trim().toLowerCase();
      localStorage.setItem('filterTag', selectedTag);
      localStorage.setItem('filterQuery', query);
    
      let visibleCount = 0;
      projectItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        const tags = item.dataset.tags || '';
        const matchTag = selectedTag === 'all' || tags.includes(selectedTag);
        const matchQuery = text.includes(query);
        highlightText(item.querySelector('p'), query);
        if (matchTag && matchQuery) {
          item.classList.remove('hidden');
          visibleCount++;
        } else {
          item.classList.add('hidden');
        }
      });
      noResults.classList.toggle('hidden', visibleCount !== 0);
    }
    
    function sortProjects() {
      // Only work on items that are currently visible (not hidden)
      const visibleItems = [...projectGrid.querySelectorAll('.project-item:not(.hidden)')];
      const sortValue = sortDropdown.value;
      visibleItems.sort((a, b) => {
        const titleA = a.querySelector('h3').textContent.trim().toLowerCase();
        const titleB = b.querySelector('h3').textContent.trim().toLowerCase();
        return sortValue === 'title-asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
      });
      visibleItems.forEach(item => projectGrid.appendChild(item));
    }
    
    function updatePagination() {
      // Show only items up to itemsPerPage.
      projectItems.forEach((item, index) => {
        if (index < itemsPerPage) {
          item.classList.remove('hidden');
        }
      });
      filterProjects();
    }
    
    dropdown.addEventListener('change', filterProjects);
    searchInput.addEventListener('input', debounce(filterProjects, 300));
    sortDropdown.addEventListener('change', () => {
      filterProjects();
      sortProjects();
    });
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.disabled = true;
      document.getElementById('load-more-spinner').classList.remove('hidden');
      
      // Simulate a short delay for a smoother transition (adjust timing as needed)
      setTimeout(() => {
        itemsPerPage += 6;
        updatePagination();
        loadMoreBtn.disabled = false;
        document.getElementById('load-more-spinner').classList.add('hidden');
      }, 500);
    });
    
    // Initial load
    updatePagination();
  });