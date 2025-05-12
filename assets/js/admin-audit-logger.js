/**
 * Admin Audit Logging Module
 * Records admin actions and authentication attempts for security purposes
 */

window.AdminAuditLogger = (function() {
  'use strict';
  
  // Private variables
  const STORAGE_KEY = 'admin-audit-log';
  const MAX_LOG_ENTRIES = 100; // Maximum number of log entries to keep
  
  /**
   * Initialize the audit logger
   */
  function init() {
    // Nothing to initialize here
    // The module is ready for use immediately
  }
  
  /**
   * Log an admin action
   * @param {string} action - The action being performed
   * @param {object} details - Additional details about the action
   */
  function logAction(action, details = {}) {
    const logEntry = createLogEntry('action', action, details);
    saveLogEntry(logEntry);
  }
  
  /**
   * Log an authentication attempt
   * @param {string} username - The username used (if applicable)
   * @param {boolean} success - Whether the attempt was successful
   * @param {object} details - Additional details about the attempt
   */
  function logAuthAttempt(username, success, details = {}) {
    const logEntry = createLogEntry('auth', 
      success ? 'successful_login' : 'failed_login', 
      { username, success, ...details }
    );
    saveLogEntry(logEntry);
  }
  
  /**
   * Log a security event
   * @param {string} event - The security event type
   * @param {object} details - Additional details about the event
   */
  function logSecurityEvent(event, details = {}) {
    const logEntry = createLogEntry('security', event, details);
    saveLogEntry(logEntry);
  }
  
  /**
   * Create a log entry object
   * @param {string} type - The type of log entry (auth, action, security)
   * @param {string} name - The name of the event
   * @param {object} details - Additional details
   * @returns {object} The log entry object
   */
  function createLogEntry(type, name, details) {
    return {
      timestamp: new Date().toISOString(),
      type: type,
      name: name,
      details: details,
      ip: 'client', // In a real application, this would be server-side
      userAgent: navigator.userAgent,
      path: window.location.pathname
    };
  }
  
  /**
   * Save a log entry to storage
   * @param {object} logEntry - The log entry to save
   */
  function saveLogEntry(logEntry) {
    try {
      // Get existing log
      const existingLog = getAuditLog();
      
      // Add new entry at the beginning
      existingLog.unshift(logEntry);
      
      // Trim log to maximum size
      const trimmedLog = existingLog.slice(0, MAX_LOG_ENTRIES);
      
      // Save back to storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedLog));
      
      // In a real application, you would also send this to the server
      console.debug('Admin audit log entry saved:', logEntry);
      
    } catch (error) {
      console.error('Error saving audit log entry:', error);
    }
  }
  
  /**
   * Get the complete audit log
   * @returns {Array} The audit log entries
   */
  function getAuditLog() {
    try {
      const logData = localStorage.getItem(STORAGE_KEY);
      return logData ? JSON.parse(logData) : [];
    } catch (error) {
      console.error('Error reading audit log:', error);
      return [];
    }
  }
  
  /**
   * Clear the audit log (admin function)
   */
  function clearAuditLog() {
    // Log the clearing action first
    const logEntry = createLogEntry('security', 'clear_audit_log', {});
    
    // Clear the storage
    localStorage.removeItem(STORAGE_KEY);
    
    // Save just the clearing action
    localStorage.setItem(STORAGE_KEY, JSON.stringify([logEntry]));
  }
  
  /**
   * Export the audit log as JSON
   * @returns {string} JSON string of the audit log
   */
  function exportAuditLog() {
    const log = getAuditLog();
    return JSON.stringify(log, null, 2);
  }
  
  // Public API
  return {
    init: init,
    logAction: logAction,
    logAuthAttempt: logAuthAttempt,
    logSecurityEvent: logSecurityEvent,
    getAuditLog: getAuditLog,
    clearAuditLog: clearAuditLog,
    exportAuditLog: exportAuditLog
  };
})();

// Initialize the audit logger
document.addEventListener('DOMContentLoaded', function() {
  if (window.AdminAuditLogger) {
    window.AdminAuditLogger.init();
  }
});
