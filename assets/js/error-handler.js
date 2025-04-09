document.addEventListener('DOMContentLoaded', () => {
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Error captured:', event.message, event.filename, event.lineno, event.colno);
    displayErrorMessage('An unexpected error occurred. Please try again later.');
  });

  // Global promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    displayErrorMessage('An unexpected error occurred. Please try again later.');
  });

  // Helper function to display error messages to the user
  function displayErrorMessage(message) {
    const errorContainer = document.getElementById('global-error-container');
    if (!errorContainer) {
      console.warn('No global error container found in the DOM.');
      return;
    }

    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
    errorContainer.setAttribute('aria-live', 'polite');

    // Automatically hide the error message after 5 seconds
    setTimeout(() => {
      errorContainer.classList.add('hidden');
    }, 5000);
  }
});