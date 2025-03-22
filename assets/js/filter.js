document.addEventListener('DOMContentLoaded', () => {
    const filterContainer = document.querySelector('.filter-buttons');
    const projectItems = document.querySelectorAll('.project-item');
  
    if (!filterContainer) return;
  
    filterContainer.addEventListener('click', (e) => {
      const button = e.target.closest('.filter-button');
      if (!button) return;
  
      const tag = button.dataset.filter;
  
      // Clear active state and aria-pressed for all buttons
      filterContainer.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      // Set active state for clicked button
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
  
      // Filter project items
      projectItems.forEach(item => {
        if (tag === 'all' || item.dataset.tags.includes(tag.toLowerCase())) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });