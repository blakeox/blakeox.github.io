document.addEventListener('DOMContentLoaded', () => {
  const notificationContainer = document.createElement('div');
  notificationContainer.id = 'notification-container';
  notificationContainer.style.position = 'fixed';
  notificationContainer.style.top = '1rem';
  notificationContainer.style.right = '1rem';
  notificationContainer.style.zIndex = '1000';
  document.body.appendChild(notificationContainer);

  // Function to create and display a notification
  function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style the notification
    notification.style.background = type === 'success' ? '#4caf50' :
                                    type === 'error' ? '#f44336' :
                                    type === 'warning' ? '#ff9800' : '#2196f3';
    notification.style.color = '#fff';
    notification.style.padding = '1rem';
    notification.style.marginBottom = '1rem';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';

    // Append to the container
    notificationContainer.appendChild(notification);

    // Fade in the notification
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);

    // Remove the notification after the specified duration
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notificationContainer.removeChild(notification);
      }, 300);
    }, duration);
  }

  // Example usage
  window.showNotification = showNotification;

  // Example: Trigger a notification on button click
  const triggerButton = document.querySelector('[data-notification-trigger]');
  if (triggerButton) {
    triggerButton.addEventListener('click', () => {
      showNotification('This is an example notification!', 'success');
    });
  }
});