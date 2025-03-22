document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.querySelector('#filter-dropdown');
  const projectItems = document.querySelectorAll('.project-item');

  if (!dropdown) return;

  dropdown.addEventListener('change', () => {
    const tag = dropdown.value;
    
    projectItems.forEach(item => {
      if (tag === 'all' || item.dataset.tags.includes(tag)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});
// This code filters project items based on the selected tag from a dropdown menu.
