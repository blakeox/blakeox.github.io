/**
 * Search History Management
 * Handles search history storage, retrieval, and analytics
 */
class SearchHistory {
  constructor() {
    this.storageKey = 'searchHistory';
    this.maxHistoryItems = 10;
    this.history = this.loadHistory();
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load search history:', error);
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  addSearch(query) {
    if (!query?.trim()) return;

    // Remove existing entry if present
    this.history = this.history.filter(item => item.query !== query);

    // Add new entry with timestamp
    this.history.unshift({
      query,
      timestamp: Date.now(),
      count: 1
    });

    // Limit history size
    if (this.history.length > this.maxHistoryItems) {
      this.history = this.history.slice(0, this.maxHistoryItems);
    }

    this.saveHistory();
  }

  getRecentSearches() {
    return this.history.map(item => item.query);
  }

  getPopularSearches() {
    return [...this.history]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.query);
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
  }

  removeSearch(query) {
    this.history = this.history.filter(item => item.query !== query);
    this.saveHistory();
  }

  getSearchStats() {
    return {
      totalSearches: this.history.length,
      uniqueSearches: new Set(this.history.map(item => item.query)).size,
      mostFrequent: this.getPopularSearches()[0],
      lastSearch: this.history[0]?.query
    };
  }

  exportHistory() {
    return JSON.stringify(this.history, null, 2);
  }

  importHistory(data) {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        this.history = imported;
        this.saveHistory();
        return true;
      }
    } catch (error) {
      console.warn('Failed to import search history:', error);
    }
    return false;
  }
}

// Export for use in other modules
window.SearchHistory = SearchHistory; 