document.addEventListener('DOMContentLoaded', () => {
  // Create the progress bar element
  const progressBar = document.createElement('div');
  progressBar.id = 'progress-bar';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: #4dc8aa;
    width: 0;
    z-index: 1000;
    transition: width 0.2s ease;
  `;
  document.body.appendChild(progressBar);

  // Update the progress bar width based on scroll position
  function updateProgressBar() {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / documentHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // Listen for scroll events
  window.addEventListener('scroll', updateProgressBar);

  // Initialize the progress bar on page load
  updateProgressBar();
});