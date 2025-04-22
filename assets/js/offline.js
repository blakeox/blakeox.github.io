document.addEventListener('DOMContentLoaded', () => {
  const offlineBanner = document.createElement('div');
  offlineBanner.id = 'offline-banner';
  offlineBanner.textContent = 'You are offline. Some features may not be available.';
  offlineBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f44336;
    color: #fff;
    text-align: center;
    padding: 0.5rem;
    font-size: 1rem;
    z-index: 1000;
    display: none;
  `;
  document.body.appendChild(offlineBanner);

  // Function to show the offline banner
  function showOfflineBanner() {
    offlineBanner.style.display = 'block';
  }

  // Function to hide the offline banner
  function hideOfflineBanner() {
    offlineBanner.style.display = 'none';
  }

  // Check initial online/offline status
  if (!navigator.onLine) {
    showOfflineBanner();
  }

  // Listen for online and offline events
  window.addEventListener('offline', showOfflineBanner);
  window.addEventListener('online', hideOfflineBanner);
});