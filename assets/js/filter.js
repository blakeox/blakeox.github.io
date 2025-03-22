document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-button');
    const projectItems = document.querySelectorAll('.project-item');
  
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tag = button.dataset.filter;
  
        // Update active state for buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
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
  });