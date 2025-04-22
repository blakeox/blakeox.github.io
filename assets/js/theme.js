document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');

  // Apply the saved theme or system preference
  function applyTheme(theme) {
    document.body.classList.remove('light-mode', 'dark-mode');
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else if (theme === 'light') {
      document.body.classList.add('light-mode');
    }
  }

  // Determine the initial theme
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (prefersDarkMode) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }

  // Update the toggle button state
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', document.body.classList.contains('dark-mode'));

    themeToggle.addEventListener('click', () => {
      const isDarkMode = document.body.classList.contains('dark-mode');
      const newTheme = isDarkMode ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      themeToggle.setAttribute('aria-pressed', !isDarkMode);
    });
  }

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
});