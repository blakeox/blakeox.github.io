document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const items = document.querySelectorAll('.searchable');
    const status = document.getElementById('search-status');
  
    function debounce(func, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
      };
    }

    function updateStatus(visibleCount) {
      if (status) {
        status.textContent = `${visibleCount} results found`;
      }
    }

    function highlightText(element, query) {
      const originalText = element.dataset.originalText || element.textContent;
      element.dataset.originalText = originalText;
    
      if (!query) {
        element.innerHTML = originalText;
        return;
      }
    
      const regex = new RegExp(`(${query})`, 'gi');
      element.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
    }

    searchInput.addEventListener('input', debounce(() => {
      const query = searchInput.value.toLowerCase();
      let visibleCount = 0;

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const isVisible = text.includes(query) || query === '';
        item.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visibleCount++;
          highlightText(item, query);
        } else {
          highlightText(item, '');
        }
      });

      updateStatus(visibleCount);
    }, 300));
  });