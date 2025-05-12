/**
 * Admin Security Module
 * Provides extra security layer for admin pages
 */

(function() {
  'use strict';
  
  // Execute when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    initAdminSecurity();
  });
  
  /**
   * Initialize admin security features
   */
  function initAdminSecurity() {
    // Run security checks
    if (!isAdminPage()) return;
    
    // Check authentication status
    if (!isAuthenticated()) {
      // Redirect unauthenticated users to login
      redirectToLogin();
      return;
    }
    
    // Apply additional security measures
    disableDevToolsExports();
    applyContentSecurityRules();
    startSessionMonitor();
  }
  
  /**
   * Check if current page is an admin page
   * @returns {boolean} True if current page is in admin section
   */
  function isAdminPage() {
    return window.location.pathname.startsWith('/admin/') && 
           window.location.pathname !== '/admin/login/';
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  function isAuthenticated() {
    const authTimestamp = sessionStorage.getItem('admin-auth');
    if (!authTimestamp) return false;
    
    // Check if the session has expired (4 hours)
    const now = Date.now();
    const authTime = parseInt(authTimestamp);
    const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    
    return (now - authTime) < fourHours;
  }
  
  /**
   * Redirect unauthenticated users to login page
   */
  function redirectToLogin() {
    const currentPath = window.location.pathname;
    window.location.href = '/admin/login/?redirect=' + encodeURIComponent(currentPath);
  }
  
  /**
   * Apply content security measures to admin pages
   */
  function applyContentSecurityRules() {
    // Add security headers via meta tags
    // Note: These are fallbacks, actual headers should be set server-side
    
    // Create and append meta element for Content-Security-Policy
    const cspMeta = document.createElement('meta');
    cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
    cspMeta.setAttribute('content', "default-src 'self'; script-src 'self'; object-src 'none'");
    document.head.appendChild(cspMeta);
    
    // Create and append meta element for X-Frame-Options
    const xfoMeta = document.createElement('meta');
    xfoMeta.setAttribute('http-equiv', 'X-Frame-Options');
    xfoMeta.setAttribute('content', 'DENY');
    document.head.appendChild(xfoMeta);
  }
  
  /**
   * Disable various export features that could leak sensitive information
   */
  function disableDevToolsExports() {
    // Add protection against data copying
    document.addEventListener('copy', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Allow copying from inputs and textareas
        return;
      }
      
      // For all other elements, prevent copying admin data
      e.preventDefault();
    });
    
    // Disable right-click menu on admin pages
    document.addEventListener('contextmenu', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Allow right-click in inputs and textareas
        return;
      }
      
      e.preventDefault();
    });
  }
  
  /**
   * Monitor session and warn before expiration
   */
  function startSessionMonitor() {
    const authTimestamp = sessionStorage.getItem('admin-auth');
    if (!authTimestamp) return;
    
    const authTime = parseInt(authTimestamp);
    const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    const warningTime = 3.5 * 60 * 60 * 1000; // 3.5 hours in milliseconds
    
    // Set timer to warn user before session expiration
    const timeUntilWarning = (authTime + warningTime) - Date.now();
    
    if (timeUntilWarning > 0) {
      setTimeout(function() {
        showSessionWarning();
      }, timeUntilWarning);
    }
  }
  
  /**
   * Show session expiration warning
   */
  function showSessionWarning() {
    // Check if we already created a warning
    if (document.getElementById('session-warning')) return;
    
    // Create a warning element
    const warningElement = document.createElement('div');
    warningElement.id = 'session-warning';
    warningElement.className = 'session-warning';
    warningElement.innerHTML = `
      <div class="session-warning-content">
        <p>Your session will expire soon. Please save your work.</p>
        <button id="extend-session" class="c-btn c-btn--tech c-btn--sm">Extend Session</button>
      </div>
    `;
    
    document.body.appendChild(warningElement);
    
    // Add event listener to extend session button
    document.getElementById('extend-session').addEventListener('click', function() {
      // Reset session timestamp
      sessionStorage.setItem('admin-auth', Date.now().toString());
      
      // Remove warning
      document.body.removeChild(warningElement);
      
      // Restart session monitor
      startSessionMonitor();
    });
  }
})();
