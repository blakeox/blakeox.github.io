document.addEventListener('DOMContentLoaded', () => {
  const shareButtons = document.querySelectorAll('.share-btn');

  shareButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();

      const platform = button.dataset.platform;
      const url = button.dataset.url || window.location.href;
      const title = button.dataset.title || document.title;
      const text = button.dataset.text || '';

      let shareUrl = '';

      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
          break;
        case 'facebook':
          shareUrl = `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}%0A${encodeURIComponent(url)}`;
          break;
        default:
          console.warn('Unsupported sharing platform:', platform);
          return;
      }

      // Open the share URL in a new window
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    });
  });
});