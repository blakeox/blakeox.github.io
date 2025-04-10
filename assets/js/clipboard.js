document.addEventListener('DOMContentLoaded', () => {
  // Select all elements with the class "copy-to-clipboard"
  const copyButtons = document.querySelectorAll('.copy-to-clipboard');

  copyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-clipboard-target');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const textToCopy = targetElement.textContent || targetElement.value;

        // Copy text to clipboard
        navigator.clipboard.writeText(textToCopy).then(() => {
          // Provide feedback to the user
          button.textContent = 'Copied!';
          button.classList.add('copied');

          // Reset the button text after 2 seconds
          setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        }).catch((err) => {
          console.error('Failed to copy text: ', err);
          button.textContent = 'Error';
        });
      }
    });
  });
});