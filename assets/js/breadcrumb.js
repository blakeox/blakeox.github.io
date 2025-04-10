document.addEventListener('DOMContentLoaded', () => {
  const breadcrumbContainer = document.querySelector('.breadcrumb ol');
  if (!breadcrumbContainer) return;

  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  let breadcrumbHTML = `<li><a href="/">Home</a></li>`;

  pathSegments.forEach((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const url = `/${pathSegments.slice(0, index + 1).join('/')}/`;
    breadcrumbHTML += isLast
      ? `<li aria-current="page">${decodeURIComponent(segment.replace(/-/g, ' '))}</li>`
      : `<li><a href="${url}">${decodeURIComponent(segment.replace(/-/g, ' '))}</a></li>`;
  });

  breadcrumbContainer.innerHTML = breadcrumbHTML;

  const breadcrumbLinks = document.querySelectorAll('.breadcrumb a');
  breadcrumbLinks.forEach((link) => {
    const isActive = link.href === window.location.href;
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  });
});