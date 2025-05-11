/**
 * Tech Search Analytics Module
 * Provides enhanced search analytics visualization.
 * 
 * Features:
 * - Visual search trend charts
 * - Search success metrics
 * - Popular search term displays
 * - Click-through analytics
 * 
 * @module TechSearchAnalytics
 */

// Check if the module has been loaded to prevent duplicate initialization
if (typeof window.TechSearchAnalytics === 'undefined') {
  /**
   * Tech Search Analytics Module
   */
  window.TechSearchAnalytics = (function() {
    // Private variables
    let _options = {
      analyticsContainerSelector: '.search-analytics',
      chartClass: 'search-analytics-chart',
      statsClass: 'search-analytics-stats',
      trendsClass: 'search-analytics-trends'
    };
    let _initialized = false;
    
    /**
     * Initialize search analytics
     * @param {Object} [options] - Configuration options
     */
    function init(options = {}) {
      // Prevent multiple initializations
      if (_initialized) return;
      
      // Merge options
      _options = Object.assign(_options, options);
      
      // Get analytics container
      const analyticsContainer = document.querySelector(_options.analyticsContainerSelector);
      
      if (!analyticsContainer) {
        console.warn('Analytics container not found');
        return;
      }
      
      // Initialize analytics display
      renderAnalytics(analyticsContainer);
      
      _initialized = true;
    }
    
    /**
     * Render analytics in the container
     * @param {HTMLElement} container - Container element
     */
    function renderAnalytics(container) {
      // Check if we have history data
      if (!window.TechSearchHistory) {
        container.innerHTML = '<p class="no-data-message">No search data available yet.</p>';
        return;
      }
      
      // Get analytics data
      const history = window.TechSearchHistory.getSearchHistory();
      const stats = window.TechSearchHistory.getSearchStats();
      const commonTerms = window.TechSearchHistory.getCommonTerms(5);
      const successRate = window.TechSearchHistory.getSuccessRate();
      const trendData = window.TechSearchHistory.getTrendData();
      
      if (!history || history.length === 0) {
        container.innerHTML = '<p class="no-data-message">No search data available yet. Try searching for something!</p>';
        return;
      }
      
      // Create analytics UI
      container.innerHTML = `
        <div class="tech-card">
          <div class="card-header">
            <h3>Advanced Search Analytics</h3>
            <span class="card-decoration"></span>
          </div>
          
          <div class="${_options.statsClass}">
            <div class="stat-group">
              <div class="stat-item">
                <span class="stat-label">Total Searches</span>
                <span class="stat-value">${history.length}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Success Rate</span>
                <span class="stat-value ${successRate < 50 ? 'negative' : 'positive'}">${successRate}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg Results</span>
                <span class="stat-value">${stats.avgResults}</span>
                <span class="stat-trend ${trendData.trend}">
                  ${trendData.trend === 'up' ? '↑' : trendData.trend === 'down' ? '↓' : '→'}
                  ${trendData.percentage}%
                </span>
              </div>
            </div>
          </div>
          
          <div class="${_options.trendsClass}">
            <h4>Popular Search Terms</h4>
            <div class="search-terms-visual">
              ${renderPopularTermsVisual(commonTerms)}
            </div>
          </div>
          
          <div class="${_options.chartClass}">
            <h4>Recent Search Results</h4>
            ${renderSearchHistoryChart(history.slice(-10))}
          </div>
          
          <div class="analytics-actions">
            <button id="refresh-analytics" class="c-btn c-btn--tech c-btn--sm">
              <span class="btn-text">Refresh Stats</span>
            </button>
            <button id="clear-search-history" class="c-btn c-btn--tech c-btn--sm c-btn--outline">
              <span class="btn-text">Clear History</span>
            </button>
          </div>
        </div>
      `;
      
      // Add event listeners
      const refreshBtn = container.querySelector('#refresh-analytics');
      const clearBtn = container.querySelector('#clear-search-history');
      
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          renderAnalytics(container);
        });
      }
      
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (window.TechSearchHistory) {
            window.TechSearchHistory.clearHistory();
            renderAnalytics(container);
          }
        });
      }
      
      // Add the necessary styles
      addAnalyticsStyles();
    }
    
    /**
     * Render popular search terms visual
     * @param {Array} terms - Popular search terms
     * @returns {string} HTML for terms visual
     */
    function renderPopularTermsVisual(terms) {
      if (!terms || terms.length === 0) {
        return '<p class="no-data-message">No search terms yet</p>';
      }
      
      return terms.map((term, index) => {
        const size = 100 - (index * 15);
        return `<span class="popular-term" style="font-size: ${size}%;">${term}</span>`;
      }).join(' ');
    }
    
    /**
     * Render search history chart
     * @param {Array} history - Search history items
     * @returns {string} HTML for chart
     */
    function renderSearchHistoryChart(history) {
      if (!history || history.length === 0) {
        return '<p class="no-data-message">No search data to display</p>';
      }
      
      // Find the maximum result count for scaling
      const maxResults = Math.max(...history.map(item => item.resultCount), 5);
      
      // Generate bars
      const chartBars = history.map(item => {
        const percentage = (item.resultCount / maxResults) * 100;
        return `
          <div class="chart-bar" style="height: ${percentage}%;" title="${item.query}: ${item.resultCount} results">
            <div class="bar-value">${item.resultCount}</div>
            <div class="bar-label">${truncateString(item.query, 8)}</div>
          </div>
        `;
      }).join('');
      
      return `
        <div class="bar-chart">
          ${chartBars}
        </div>
      `;
    }
    
    /**
     * Truncate string with ellipsis
     * @param {string} str - String to truncate
     * @param {number} length - Maximum length
     * @returns {string} Truncated string
     */
    function truncateString(str, length) {
      return str.length > length ? str.substring(0, length) + '...' : str;
    }
    
    /**
     * Add analytics styles to document
     */
    function addAnalyticsStyles() {
      if (document.getElementById('tech-analytics-styles')) return;
      
      const styleSheet = document.createElement('style');
      styleSheet.id = 'tech-analytics-styles';
      styleSheet.textContent = `
        .search-analytics-stats {
          display: flex;
          margin-bottom: 1.5rem;
        }
        
        .stat-group {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          gap: 1rem;
        }
        
        .stat-item {
          flex: 1;
          min-width: 100px;
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 4px;
          text-align: center;
          position: relative;
        }
        
        .stat-label {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        
        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--tech-text-color, #ffffff);
        }
        
        .stat-trend {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.75rem;
        }
        
        .stat-trend.up {
          color: #4caf50;
        }
        
        .stat-trend.down {
          color: #f44336;
        }
        
        .stat-trend.neutral {
          color: #9e9e9e;
        }
        
        .stat-value.positive {
          color: #4caf50;
        }
        
        .stat-value.negative {
          color: #f44336;
        }
        
        .search-analytics-trends {
          margin-bottom: 1.5rem;
        }
        
        .search-terms-visual {
          background: rgba(0, 0, 0, 0.2);
          padding: 1.5rem 1rem;
          border-radius: 4px;
          text-align: center;
          line-height: 1.8;
        }
        
        .popular-term {
          display: inline-block;
          margin: 0 8px;
          color: var(--tech-accent-color, #2196f3);
          text-shadow: 0 0 5px var(--tech-glow-color, rgba(33, 150, 243, 0.7));
        }
        
        .search-analytics-chart {
          margin-bottom: 1rem;
        }
        
        .bar-chart {
          height: 180px;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem 0.5rem;
          border-radius: 4px;
        }
        
        .chart-bar {
          width: 30px;
          min-height: 1px;
          background: var(--tech-accent-color, #2196f3);
          margin: 0 3px;
          position: relative;
          box-shadow: 0 0 5px var(--tech-glow-color, rgba(33, 150, 243, 0.5));
          transition: height 0.3s ease;
        }
        
        .bar-value {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .bar-label {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.6);
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 50px;
          overflow: hidden;
        }
        
        .analytics-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
        }
        
        .no-data-message {
          text-align: center;
          padding: 1.5rem;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }
      `;
      
      document.head.appendChild(styleSheet);
    }
    
    // Public API
    return {
      init: init,
      renderAnalytics: renderAnalytics
    };
  })();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.TechSearchAnalytics) {
      window.TechSearchAnalytics.init();
    }
  }, 800);
});

/**
 * Search Analytics
 * Tracks search performance, usage patterns, and user behavior
 */
class SearchAnalytics {
  constructor() {
    this.events = [];
    this.metrics = {
      searches: 0,
      suggestions: 0,
      errors: 0,
      averageLatency: 0
    };
    this.initialize();
  }

  initialize() {
    // Set up performance observer
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver(this.handlePerformanceEntries.bind(this));
      this.observer.observe({ entryTypes: ['measure', 'resource'] });
    }

    // Set up error tracking
    window.addEventListener('error', this.handleError.bind(this));
  }

  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      data
    };

    this.events.push(event);
    this.updateMetrics(event);

    // Send to analytics service if configured
    if (window.analytics?.track) {
      window.analytics.track(eventName, data);
    }
  }

  updateMetrics(event) {
    switch (event.name) {
      case 'search_start':
        this.metrics.searches++;
        break;
      case 'suggestion_show':
        this.metrics.suggestions++;
        break;
      case 'search_error':
        this.metrics.errors++;
        break;
      case 'search_complete':
        if (event.data.latency) {
          this.updateLatencyMetrics(event.data.latency);
        }
        break;
    }
  }

  updateLatencyMetrics(latency) {
    const total = this.metrics.averageLatency * (this.metrics.searches - 1) + latency;
    this.metrics.averageLatency = total / this.metrics.searches;
  }

  handlePerformanceEntries(entries) {
    for (const entry of entries.getEntries()) {
      if (entry.name === 'search') {
        this.trackEvent('search_performance', {
          duration: entry.duration,
          startTime: entry.startTime
        });
      }
    }
  }

  handleError(error) {
    this.trackEvent('search_error', {
      message: error.message,
      stack: error.stack
    });
  }

  getMetrics() {
    return {
      ...this.metrics,
      events: this.events.length,
      lastEvent: this.events[this.events.length - 1]
    };
  }

  getSearchPatterns() {
    const searches = this.events.filter(e => e.name === 'search_start');
    return {
      totalSearches: searches.length,
      averageTimeBetweenSearches: this.calculateAverageTimeBetweenSearches(searches),
      popularQueries: this.getPopularQueries(searches)
    };
  }

  calculateAverageTimeBetweenSearches(searches) {
    if (searches.length < 2) return 0;
    
    const times = searches.map(s => s.timestamp);
    const differences = times.slice(1).map((time, i) => time - times[i]);
    return differences.reduce((a, b) => a + b) / differences.length;
  }

  getPopularQueries(searches) {
    const queries = searches.map(s => s.data.query);
    const counts = queries.reduce((acc, query) => {
      acc[query] = (acc[query] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([query, count]) => ({ query, count }));
  }

  exportData() {
    return {
      events: this.events,
      metrics: this.metrics,
      patterns: this.getSearchPatterns()
    };
  }

  clearData() {
    this.events = [];
    this.metrics = {
      searches: 0,
      suggestions: 0,
      errors: 0,
      averageLatency: 0
    };
  }
}

// Export for use in other modules
window.SearchAnalytics = SearchAnalytics;
