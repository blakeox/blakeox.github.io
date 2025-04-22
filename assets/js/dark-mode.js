document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-mode-toggle');
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedPreference = localStorage.getItem('darkMode');

  if (savedPreference === null && prefersDarkMode) {
    document.body.classList.add('dark-mode');
  } else if (savedPreference === 'true') {
    document.body.classList.add('dark-mode');
  }

  if (toggle) {
    toggle.setAttribute('aria-pressed', document.body.classList.contains('dark-mode'));

    toggle.addEventListener('click', () => {
      const isDarkMode = document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', isDarkMode);
      toggle.setAttribute('aria-pressed', isDarkMode);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('darkMode') === null) {
      if (e.matches) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  });
});