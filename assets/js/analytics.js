// Google Analytics Initialization
(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-HCSC5DWDPQ');
})();

// Microsoft Clarity Initialization
(function (c, l, a, r, i, t, y) {
  c[a] = c[a] || function () {
    (c[a].q = c[a].q || []).push(arguments);
  };
  t = l.createElement(r);
  t.async = 1;
  t.src = "https://www.clarity.ms/tag/" + i;
  y = l.getElementsByTagName(r)[0];
  y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "qtip3f40t2");

document.addEventListener('DOMContentLoaded', () => {
  // Helper function to track page views
  const trackPageView = (url) => {
    if (typeof gtag === 'function') {
      gtag('config', 'YOUR_GOOGLE_ANALYTICS_ID', { page_path: url });
      console.log(`Google Analytics: Page view tracked for ${url}`);
    } else {
      console.warn('Google Analytics is not initialized.');
    }

    if (typeof clarity === 'function') {
      clarity('track', 'pageview', { page_path: url });
      console.log(`Microsoft Clarity: Page view tracked for ${url}`);
    } else {
      console.warn('Microsoft Clarity is not initialized.');
    }
  };

  // Helper function to track custom events
  const trackEvent = (category, action, label = '', value = '') => {
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
      console.log(`Google Analytics: Event tracked - ${category}, ${action}, ${label}, ${value}`);
    } else {
      console.warn('Google Analytics is not initialized.');
    }

    if (typeof clarity === 'function') {
      clarity('track', 'event', {
        category,
        action,
        label,
        value,
      });
      console.log(`Microsoft Clarity: Event tracked - ${category}, ${action}, ${label}, ${value}`);
    } else {
      console.warn('Microsoft Clarity is not initialized.');
    }
  };

  // Track initial page load
  trackPageView(window.location.pathname);

  // Track navigation changes (for single-page applications)
  window.addEventListener('popstate', () => {
    trackPageView(window.location.pathname);
  });

  // Track clicks on elements with `data-track-event`
  document.querySelectorAll('[data-track-event]').forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.trackCategory || 'Button';
      const action = button.dataset.trackAction || 'Click';
      const label = button.dataset.trackLabel || button.textContent.trim();
      const value = button.dataset.trackValue || '';
      trackEvent(category, action, label, value);
    });
  });

  // Track outbound link clicks
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.addEventListener('click', () => {
      const url = link.href;
      trackEvent('Outbound Link', 'Click', url);
    });
  });

  // Track breadcrumb link clicks
  const breadcrumbLinks = document.querySelectorAll('.breadcrumb a[data-analytics]');
  breadcrumbLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const analyticsLabel = link.getAttribute('data-analytics');
      console.log(`Breadcrumb clicked: ${analyticsLabel}`);
      // Optionally send this data to Google Analytics or another tracking service
    });
  });

  // Track clicks on elements with `data-analytics`
  const analyticsElements = document.querySelectorAll('[data-analytics]');
  analyticsElements.forEach((element) => {
    element.addEventListener('click', () => {
      const analyticsLabel = element.getAttribute('data-analytics');
      console.log(`Analytics Event: ${analyticsLabel}`);
      // Optionally send this data to Google Analytics or another tracking service
    });
  });
});