document.addEventListener('DOMContentLoaded', () => {
  // Log basic performance metrics
  function logPerformanceMetrics() {
    if (!performance || !performance.timing) {
      console.warn('Performance API is not supported in this browser.');
      return;
    }

    const timing = performance.timing;
    const metrics = {
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart, // Time to First Byte
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      pageLoad: timing.loadEventEnd - timing.navigationStart,
    };

    console.table(metrics);
  }

  // Monitor resource usage
  function logResourceUsage() {
    if (!performance || !performance.getEntriesByType) {
      console.warn('Performance API is not supported in this browser.');
      return;
    }

    const resources = performance.getEntriesByType('resource');
    resources.forEach((resource) => {
      console.log(`Resource: ${resource.name}`);
      console.log(`Type: ${resource.initiatorType}`);
      console.log(`Duration: ${resource.duration.toFixed(2)}ms`);
    });
  }

  // Detect long tasks
  function detectLongTasks() {
    if (!PerformanceObserver) {
      console.warn('PerformanceObserver is not supported in this browser.');
      return;
    }

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  // Log metrics on page load
  window.addEventListener('load', () => {
    logPerformanceMetrics();
    logResourceUsage();
    detectLongTasks();
  });

  // Monitor First Input Delay (FID)
  function monitorFID() {
    if (!PerformanceObserver) {
      console.warn('PerformanceObserver is not supported in this browser.');
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log(`First Input Delay: ${entry.processingStart - entry.startTime}ms`);
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
  }

  monitorFID();
});