/**
 * Admin Search Analytics Module
 * Provides functionality for the search analytics admin dashboard
 */

// Create the Admin Search Analytics module
window.AdminSearchAnalytics = (function() {
  // Private variables
  let _searchData = null;
  let _performanceChart = null;
  
  /**
   * Initialize the admin search analytics
   */
  function init() {
    // Add event listeners for admin control buttons
    const refreshButton = document.getElementById('refresh-stats-btn');
    const clearButton = document.getElementById('clear-history-btn');
    const exportButton = document.getElementById('export-data-btn');
    
    if (refreshButton) {
      refreshButton.addEventListener('click', refreshData);
    }
    
    if (clearButton) {
      clearButton.addEventListener('click', clearSearchHistory);
    }
    
    if (exportButton) {
      exportButton.addEventListener('click', exportSearchData);
    }
    
    // Load initial data
    loadData();
  }
  
  /**
   * Load search analytics data
   */
  function loadData() {
    // Get search data from localStorage
    try {
      // Get raw search history data
      const searchHistory = JSON.parse(localStorage.getItem('tech-search-history') || '[]');
      
      // Get search statistics
      const searchStats = JSON.parse(localStorage.getItem('tech-search-stats') || '{}');
      
      // Process data for display
      _searchData = processSearchData(searchHistory, searchStats);
      
      // Update UI with data
      updateDashboard(_searchData);
      
    } catch (error) {
      console.error('Error loading search analytics data:', error);
      showErrorMessage('Failed to load search analytics data. Please refresh the page.');
    }
  }
  
  /**
   * Process search data for analytics
   * @param {Array} history - Search history array
   * @param {Object} stats - Search statistics object
   * @returns {Object} Processed analytics data
   */
  function processSearchData(history, stats) {
    // Default values
    const processedData = {
      totalSearches: stats.totalSearches || history.length || 0,
      successRate: stats.avgResults > 0 ? 100 : 0, // If avg > 0, success is 100%
      avgResults: stats.avgResults || 0,
      zeroResultsRate: 0,
      popularTerms: {},
      recentSearches: [],
      avgQueryLength: 0,
      mostCommonFilter: 'All',
      peakSearchTime: 'N/A'
    };
    
    // Process recent searches and popular terms
    if (history && history.length) {
      // Get recent searches (last 10)
      processedData.recentSearches = history.slice(-10).reverse();
      
      // Calculate popular terms
      const termCounts = {};
      let totalLength = 0;
      let zeroResults = 0;
      
      history.forEach(item => {
        const term = item.term.toLowerCase();
        termCounts[term] = (termCounts[term] || 0) + 1;
        totalLength += term.length;
        
        if (item.resultCount === 0) {
          zeroResults++;
        }
      });
      
      // Sort terms by count
      processedData.popularTerms = Object.entries(termCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      
      // Calculate average query length
      processedData.avgQueryLength = Math.round(totalLength / history.length);
      
      // Calculate zero results rate
      if (history.length > 0) {
        processedData.zeroResultsRate = Math.round((zeroResults / history.length) * 100);
      }
      
      // Find peak search time (hour with most searches)
      const hourCounts = {};
      history.forEach(item => {
        const timestamp = new Date(item.timestamp);
        const hour = timestamp.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      let peakHour = 0;
      let peakCount = 0;
      for (const [hour, count] of Object.entries(hourCounts)) {
        if (count > peakCount) {
          peakCount = count;
          peakHour = parseInt(hour);
        }
      }
      
      // Format peak hour as 12-hour time
      const peakHourFormatted = peakHour === 0 ? '12 AM' : 
                                peakHour < 12 ? `${peakHour} AM` : 
                                peakHour === 12 ? '12 PM' : 
                                `${peakHour - 12} PM`;
      processedData.peakSearchTime = peakHourFormatted;
    }
    
    return processedData;
  }
  
  /**
   * Update dashboard UI with analytics data
   * @param {Object} data - Processed analytics data
   */
  function updateDashboard(data) {
    // Update metric cards
    updateElement('total-searches-value', data.totalSearches);
    updateElement('success-rate-value', `${data.successRate}%`);
    updateElement('avg-results-value', data.avgResults.toFixed(1));
    updateElement('zero-results-value', `${data.zeroResultsRate}%`);
    
    // Update popular terms
    updatePopularTerms(data.popularTerms);
    
    // Update recent searches chart
    updateRecentSearchesChart(data.recentSearches);
    
    // Update performance chart
    updatePerformanceChart(data.recentSearches);
    
    // Update search patterns
    updateElement('avg-query-length', `${data.avgQueryLength} chars`);
    updateElement('most-common-filter', data.mostCommonFilter);
    updateElement('peak-search-time', data.peakSearchTime);
  }
  
  /**
   * Update element content if it exists
   * @param {string} id - Element ID
   * @param {string|number} value - New value
   */
  function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }
  
  /**
   * Update popular terms display
   * @param {Object} terms - Popular terms and their counts
   */
  function updatePopularTerms(terms) {
    const container = document.getElementById('popular-terms-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // If no terms, show message
    if (Object.keys(terms).length === 0) {
      container.innerHTML = '<p class="no-data-message">No search terms available yet.</p>';
      return;
    }
    
    // Display top terms (up to 10)
    Object.entries(terms).slice(0, 10).forEach(([term, count]) => {
      const termElement = document.createElement('div');
      termElement.className = 'term-tag';
      termElement.innerHTML = `
        <span class="term-text">${term}</span>
        <span class="term-count">${count}</span>
      `;
      container.appendChild(termElement);
    });
  }
  
  /**
   * Update recent searches chart
   * @param {Array} searches - Recent search data
   */
  function updateRecentSearchesChart(searches) {
    const container = document.getElementById('recent-searches-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // If no searches, show message
    if (searches.length === 0) {
      container.innerHTML = '<p class="no-data-message">No recent searches available.</p>';
      return;
    }
    
    // Create bar chart for recent searches
    const chartContainer = document.createElement('div');
    chartContainer.className = 'search-chart-container';
    
    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = 'recent-searches-chart';
    chartCanvas.height = 200;
    
    chartContainer.appendChild(chartCanvas);
    container.appendChild(chartContainer);
    
    // Create the chart if Chart.js is available
    if (window.Chart) {
      const ctx = chartCanvas.getContext('2d');
      const labels = searches.map(s => s.term);
      const data = searches.map(s => s.resultCount);
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Results',
            data: data,
            backgroundColor: 'rgba(33, 150, 243, 0.5)',
            borderColor: 'rgba(33, 150, 243, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Results'
              }
            }
          }
        }
      });
    }
  }
  
  /**
   * Update performance chart
   * @param {Array} searches - Search data
   */
  function updatePerformanceChart(searches) {
    const chartContainer = document.getElementById('search-performance-chart');
    if (!chartContainer || searches.length === 0 || !window.Chart) return;
    
    // Clean up existing chart
    if (_performanceChart) {
      _performanceChart.destroy();
    }
    
    // Group searches by date
    const searchesByDate = {};
    searches.forEach(search => {
      const date = new Date(search.timestamp).toLocaleDateString();
      if (!searchesByDate[date]) {
        searchesByDate[date] = {
          count: 0,
          avgResults: 0,
          totalResults: 0
        };
      }
      
      searchesByDate[date].count++;
      searchesByDate[date].totalResults += search.resultCount;
      searchesByDate[date].avgResults = 
        searchesByDate[date].totalResults / searchesByDate[date].count;
    });
    
    // Prepare data for chart
    const dates = Object.keys(searchesByDate).sort();
    const searchCounts = dates.map(date => searchesByDate[date].count);
    const avgResults = dates.map(date => searchesByDate[date].avgResults);
    
    // Create chart
    const ctx = chartContainer.getContext('2d');
    _performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Search Volume',
            data: searchCounts,
            borderColor: 'rgba(33, 150, 243, 1)',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            yAxisID: 'y',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Avg Results',
            data: avgResults,
            borderColor: 'rgba(76, 175, 80, 1)',
            backgroundColor: 'rgba(76, 175, 80, 0)',
            yAxisID: 'y1',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Search Volume'
            },
            grid: {
              display: true
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Avg Results'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  /**
   * Refresh analytics data
   */
  function refreshData() {
    const refreshBtn = document.getElementById('refresh-stats-btn');
    if (refreshBtn) {
      // Show loading state
      refreshBtn.setAttribute('disabled', 'disabled');
      refreshBtn.innerHTML = 'Refreshing...';
    }
    
    // Small timeout to show the loading state
    setTimeout(() => {
      loadData();
      
      if (refreshBtn) {
        refreshBtn.removeAttribute('disabled');
        refreshBtn.innerHTML = 'REFRESH STATS';
      }
    }, 800);
  }
  
  /**
   * Clear search history
   */
  function clearSearchHistory() {
    if (!confirm('Are you sure you want to clear all search history data? This cannot be undone.')) {
      return;
    }
    
    try {
      localStorage.removeItem('tech-search-history');
      localStorage.removeItem('tech-search-stats');
      
      // Show success message
      alert('Search history cleared successfully.');
      
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error clearing search history:', error);
      alert('Failed to clear search history. Please try again.');
    }
  }
  
  /**
   * Export search data as CSV
   */
  function exportSearchData() {
    try {
      const searchHistory = JSON.parse(localStorage.getItem('tech-search-history') || '[]');
      
      if (searchHistory.length === 0) {
        alert('No search data available to export.');
        return;
      }
      
      // Create CSV content
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Timestamp,Search Term,Results Count\n';
      
      searchHistory.forEach(item => {
        const timestamp = new Date(item.timestamp).toISOString();
        const term = item.term.replace(/"/g, '""'); // Escape quotes
        csvContent += `"${timestamp}","${term}",${item.resultCount}\n`;
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `search-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting search data:', error);
      alert('Failed to export search data. Please try again.');
    }
  }
  
  /**
   * Show error message
   * @param {string} message - Error message
   */
  function showErrorMessage(message) {
    // Show error toast or message
    alert(message);
  }
  
  // Public API
  return {
    init,
    loadData,
    refreshData
  };
})();

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize only if we're on the admin page and authenticated
  if (document.querySelector('.admin-dashboard') && sessionStorage.getItem('admin-auth')) {
    window.AdminSearchAnalytics.init();
  }
});
