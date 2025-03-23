document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const items = document.querySelectorAll('.searchable');
  
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  });