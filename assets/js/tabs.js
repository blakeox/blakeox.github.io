document.addEventListener('DOMContentLoaded', () => {
  const tabContainers = document.querySelectorAll('.tabs');

  tabContainers.forEach((container) => {
    const tabButtons = container.querySelectorAll('.tab-button');
    const tabPanels = container.querySelectorAll('.tab-panel');

    // Helper function to activate a tab
    function activateTab(index) {
      tabButtons.forEach((button, i) => {
        button.classList.toggle('active', i === index);
        button.setAttribute('aria-selected', i === index);
        button.setAttribute('tabindex', i === index ? '0' : '-1');
      });

      tabPanels.forEach((panel, i) => {
        panel.classList.toggle('hidden', i !== index);
        panel.setAttribute('aria-hidden', i !== index);
      });
    }

    // Add event listeners to tab buttons
    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        activateTab(index);
      });

      button.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
          const nextIndex = (index + 1) % tabButtons.length;
          tabButtons[nextIndex].focus();
          activateTab(nextIndex);
        } else if (event.key === 'ArrowLeft') {
          const prevIndex = (index - 1 + tabButtons.length) % tabButtons.length;
          tabButtons[prevIndex].focus();
          activateTab(prevIndex);
        }
      });
    });

    // Initialize the first tab as active
    activateTab(0);
  });
});