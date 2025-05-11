/**
 * Search History Module
 * Manages search history tracking, statistics, and persistence with localStorage.
 * 
 * Features:
 * - Save search queries and result counts
 * - Calculate search statistics
 * - Persist data with localStorage
 * - Display search statistics in UI
 * 
 * @module SearchHistory
 */

// Check if the module has been loaded to prevent duplicate initialization
if (typeof window.TechSearchHistory === 'undefined') {
  /**
   * Tech Search History Module
   */
  window.TechSearchHistory = (function() {
    // Private variables
    const STORAGE_KEY = 'techSearchHistory';
    const MAX_HISTORY_ITEMS = 10;
    
    /**
     * Initialize search history
     * @param {Object} [options] - Configuration options
     * @param {HTMLElement} [options.statsContainer] - Container for stats display
     * @param {HTMLElement} [options.clearButton] - Button to clear history
     */
    function init(options = {}) {
      // Try to load and display search history
      try {
        const history = getSearchHistory();
        
        // Update UI if we have history and a container
        if (history.length > 0 && options.statsContainer) {
          updateStatsUI(history, options.statsContainer);
        }
        
        // Set up clear button if provided
        if (options.clearButton) {
          options.clearButton.addEventListener('click', function() {
            clearHistory();
            if (options.statsContainer) {
              options.statsContainer.classList.add('hidden');
            }
          });
        }
      } catch (e) {
        console.warn('Could not load search history:', e);
      }
    }
    
    /**
     * Get search history from storage
     * @returns {Array} Array of search history items
     */
    function getSearchHistory() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (e) {
        console.warn('Could not retrieve search history:', e);
        return [];
      }
    }
    
    /**
     * Save a search to history
     * @param {string} query - Search query
     * @param {number} resultCount - Number of results found
     * @param {HTMLElement} [statsContainer] - Optional stats container to update
     */
    function saveSearch(query, resultCount, statsContainer = null) {
      if (!window.localStorage) return;
      
      try {
        // Get existing history or create new
        let searchHistory = getSearchHistory();
        
        // Add new search
        searchHistory.push({
          query: query,
          resultCount: resultCount,
          date: new Date().toISOString()
        });
        
        // Keep only the most recent searches
        if (searchHistory.length > MAX_HISTORY_ITEMS) {
          searchHistory = searchHistory.slice(-MAX_HISTORY_ITEMS);
        }
        
        // Save back to storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory));
        
        // Update UI if container provided
        if (statsContainer) {
          updateStatsUI(searchHistory, statsContainer);
        }
        
        return searchHistory;
      } catch (e) {
        console.warn('Could not save search history:', e);
        return [];
      }
    }
    
    /**
     * Clear search history
     */
    function clearHistory() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
      } catch (e) {
        console.warn('Could not clear search history:', e);
        return false;
      }
    }
    
    /**
     * Update the statistics UI
     * @param {Array} history - Search history array
     * @param {HTMLElement} container - Stats container element
     */
    function updateStatsUI(history, container) {
      if (!container || !history || history.length === 0) return;
      
      // Show stats container
      container.classList.remove('hidden');
      
      // Update count
      const countElement = container.querySelector('#recent-search-count');
      if (countElement) {
        countElement.textContent = history.length;
      }
      
      // Find most common term
      const termCounts = {};
      history.forEach(item => {
        termCounts[item.query] = (termCounts[item.query] || 0) + 1;
      });
      
      let mostCommonTerm = '';
      let maxCount = 0;
      for (const term in termCounts) {
        if (termCounts[term] > maxCount) {
          mostCommonTerm = term;
          maxCount = termCounts[term];
        }
      }
      
      const termElement = container.querySelector('#most-common-term');
      if (termElement) {
        termElement.textContent = mostCommonTerm || 'None';
      }
      
      // Calculate average results
      const totalResults = history.reduce((sum, item) => sum + item.resultCount, 0);
      const avgResults = (totalResults / history.length).toFixed(1);
      
      const avgElement = container.querySelector('#avg-results');
      if (avgElement) {
        avgElement.textContent = avgResults;
      }
    }
    
    /**
     * Get statistics about search history
     * @returns {Object} Search statistics
     */
    function getSearchStats() {
      const history = getSearchHistory();
      
      if (history.length === 0) {
        return {
          count: 0,
          mostCommonTerm: null,
          avgResults: 0
        };
      }
      
      // Calculate most common term
      const termCounts = {};
      history.forEach(item => {
        termCounts[item.query] = (termCounts[item.query] || 0) + 1;
      });
      
      let mostCommonTerm = '';
      let maxCount = 0;
      for (const term in termCounts) {
        if (termCounts[term] > maxCount) {
          mostCommonTerm = term;
          maxCount = termCounts[term];
        }
      }
      
      // Calculate average results
      const totalResults = history.reduce((sum, item) => sum + item.resultCount, 0);
      const avgResults = history.length ? (totalResults / history.length) : 0;
      
      return {
        count: history.length,
        mostCommonTerm: mostCommonTerm,
        avgResults: avgResults
      };
    }
    
    /**
     * Get list of common search terms
     * @param {number} [limit=5] - Maximum number of terms to return
     * @returns {Array} Most common search terms
     */
    function getCommonTerms(limit = 5) {
      const history = getSearchHistory();
      
      if (!history || history.length === 0) {
        return [];
      }
      
      // Count term occurrences
      const termCounts = {};
      history.forEach(item => {
        termCounts[item.query] = (termCounts[item.query] || 0) + 1;
      });
      
      // Sort terms by frequency
      return Object.entries(termCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(entry => entry[0]);
    }
    
    /**
     * Get search success rate (searches with results > 0)
     * @returns {number} Success rate percentage
     */
    function getSuccessRate() {
      const history = getSearchHistory();
      
      if (!history || history.length === 0) {
        return 0;
      }
      
      const successfulSearches = history.filter(item => item.resultCount > 0).length;
      return Math.round((successfulSearches / history.length) * 100);
    }
    
    /**
     * Get trend data from search history
     * @returns {Object} Trend data
     */
    function getTrendData() {
      const history = getSearchHistory();
      
      if (!history || history.length < 2) {
        return { trend: 'neutral', percentage: 0 };
      }
      
      // Compare last 5 searches with previous 5
      const recentSearches = history.slice(-5);
      const previousSearches = history.slice(-10, -5);
      
      if (previousSearches.length === 0) {
        return { trend: 'neutral', percentage: 0 };
      }
      
      const recentAvg = recentSearches.reduce((sum, item) => sum + item.resultCount, 0) / recentSearches.length;
      const prevAvg = previousSearches.reduce((sum, item) => sum + item.resultCount, 0) / previousSearches.length;
      
      const percentChange = prevAvg === 0 ? 0 : Math.round(((recentAvg - prevAvg) / prevAvg) * 100);
      
      return {
        trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral',
        percentage: Math.abs(percentChange)
      };
    }
    
    /**
     * Track search click-through (when a user clicks a result)
     * @param {string} query - Search query
     * @param {string} resultUrl - URL of clicked result
     */
    function trackResultClick(query, resultUrl) {
      if (!window.localStorage) return;
      
      try {
        // Get existing click tracking or create new
        let searchClicks = JSON.parse(localStorage.getItem('techSearchClicks')) || {};
        
        // Add to tracking
        if (!searchClicks[query]) {
          searchClicks[query] = [];
        }
        
        searchClicks[query].push({
          url: resultUrl,
          timestamp: new Date().toISOString()
        });
        
        // Keep reasonable size (max 50 queries)
        if (Object.keys(searchClicks).length > 50) {
          const oldestKey = Object.keys(searchClicks)[0];
          delete searchClicks[oldestKey];
        }
        
        // Save back to storage
        localStorage.setItem('techSearchClicks', JSON.stringify(searchClicks));
      } catch (e) {
        console.warn('Could not save search click tracking:', e);
      }
    }
    
    // Public API
    return {
      init: init,
      saveSearch: saveSearch,
      getSearchHistory: getSearchHistory,
      clearHistory: clearHistory,
      getSearchStats: getSearchStats,
      getCommonTerms: getCommonTerms,
      getSuccessRate: getSuccessRate,
      getTrendData: getTrendData,
      trackResultClick: trackResultClick
    };
  })();
}
