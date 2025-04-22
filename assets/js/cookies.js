document.addEventListener('DOMContentLoaded', () => {
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptButton = document.getElementById('accept-cookies');
  const declineButton = document.getElementById('decline-cookies');

  // Helper function to set a cookie
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  }

  // Helper function to get a cookie
  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${name}=`)) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }

  // Hide the cookie banner if consent is already given or declined
  if (getCookie('cookieConsent') !== null) {
    cookieBanner?.classList.add('hidden');
  }

  // Handle 'Accept' button click
  acceptButton?.addEventListener('click', () => {
    setCookie('cookieConsent', 'accepted', 365); // Store consent for 1 year
    cookieBanner?.classList.add('hidden');
    console.log('Cookies accepted');
  });

  // Handle 'Decline' button click
  declineButton?.addEventListener('click', () => {
    setCookie('cookieConsent', 'declined', 365); // Store decline for 1 year
    cookieBanner?.classList.add('hidden');
    console.log('Cookies declined');
  });
});