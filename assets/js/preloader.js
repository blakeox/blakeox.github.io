document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const MAX_TIMEOUT = 10000; // 10 seconds fallback

  const hidePreloader = () => {
    if (preloader) {
      preloader.setAttribute('aria-hidden', 'true');
      preloader.classList.add('hidden');
      console.log('Preloader hidden'); // Optional: Debugging
    }
  };

  if (preloader) {
    const timeout = setTimeout(hidePreloader, MAX_TIMEOUT);

    window.addEventListener('load', () => {
      clearTimeout(timeout);
      hidePreloader();
      window.removeEventListener('load', hidePreloader);
    });
  }
});