/**
 * Admin Authentication Module
 * Handles password-based authentication for admin pages
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
});

/**
 * Initialize admin authentication
 */
function initAdminAuth() {
  const authContainer = document.getElementById('admin-auth-container');
  const contentContainer = document.getElementById('admin-content');
  const loginButton = document.getElementById('admin-login-btn');
  const logoutButton = document.getElementById('admin-logout-btn');
  const passwordInput = document.getElementById('admin-password');
  const errorElement = document.getElementById('admin-auth-error');
  
  if (!authContainer || !contentContainer) return;
  
  // Check if already authenticated
  if (isAuthenticated()) {
    showAdminContent();
  }
  
  // Add login handler
  if (loginButton && passwordInput) {
    loginButton.addEventListener('click', () => {
      authenticate(passwordInput.value);
    });
    
    // Allow enter key to submit
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        authenticate(passwordInput.value);
      }
    });
  }
  
  // Add logout handler
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logout();
    });
  }
  
  /**
   * Authenticate with password
   * @param {string} password - The password to check
   */
  function authenticate(password) {
    // Clear previous errors
    if (errorElement) {
      errorElement.textContent = '';
    }
    
    // Simple hash-based verification (this is client-side and not secure for truly sensitive data)
    // In a real application, use a proper server-side authentication system
    const hashedPassword = simpleHash(password);
    
    // This is a simple hash of "techsearch2024" - replace with your chosen password hash
    const correctHash = "7d5a3b8e9f2c6d1a4e7b0c3f6a9d2e5b"; // Example hash
    
    if (hashedPassword === correctHash) {
      // Set authenticated session
      sessionStorage.setItem('admin-auth', Date.now().toString());
      showAdminContent();
      
      // Load admin data
      loadAdminData();
    } else {
      // Show error
      if (errorElement) {
        errorElement.textContent = 'Invalid password. Please try again.';
        
        // Shake effect for incorrect password
        passwordInput.classList.add('shake-error');
        setTimeout(() => {
          passwordInput.classList.remove('shake-error');
        }, 500);
      }
    }
  }
  
  /**
   * Logout from admin area
   */
  function logout() {
    sessionStorage.removeItem('admin-auth');
    window.location.reload();
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
   * Show the admin content and hide login form
   */
  function showAdminContent() {
    if (authContainer) {
      authContainer.style.display = 'none';
    }
    
    if (contentContainer) {
      contentContainer.style.display = 'block';
      
      // Add visible class with slight delay for animation
      setTimeout(() => {
        contentContainer.classList.add('visible');
      }, 50);
    }
  }
  
  /**
   * Very simple string hashing function
   * Note: This is NOT cryptographically secure, just a simple obfuscation
   * @param {string} str - String to hash
   * @returns {string} Hashed string
   */
  function simpleHash(str) {
    let hash = 0;
    const salt = "techsearchadmin"; // Simple salt to make reverse-engineering harder
    const saltedStr = str + salt;
    
    for (let i = 0; i < saltedStr.length; i++) {
      const char = saltedStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to hex string and pad to consistent length
    let hexHash = Math.abs(hash).toString(16);
    while (hexHash.length < 32) {
      hexHash = "0" + hexHash;
    }
    
    return hexHash.substring(0, 32);
  }
}

/**
 * Load admin data when authenticated
 */
function loadAdminData() {
  // This function will be implemented in admin-search-analytics.js
  if (typeof window.AdminSearchAnalytics !== 'undefined' && 
      typeof window.AdminSearchAnalytics.loadData === 'function') {
    window.AdminSearchAnalytics.loadData();
  }
}
