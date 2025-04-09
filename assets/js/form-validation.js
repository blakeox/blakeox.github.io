document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.validate-form');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      let isValid = true;

      // Validate required fields
      const requiredFields = form.querySelectorAll('[data-required]');
      requiredFields.forEach((field) => {
        const errorMessage = field.nextElementSibling;
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
          if (errorMessage) {
            errorMessage.textContent = `${field.getAttribute('data-required')} is required.`;
            errorMessage.classList.remove('hidden');
          }
        } else {
          field.classList.remove('error');
          if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.classList.add('hidden');
          }
        }
      });

      // Validate email fields
      const emailFields = form.querySelectorAll('[data-email]');
      emailFields.forEach((field) => {
        const errorMessage = field.nextElementSibling;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (field.value.trim() && !emailRegex.test(field.value.trim())) {
          isValid = false;
          field.classList.add('error');
          if (errorMessage) {
            errorMessage.textContent = 'Please enter a valid email address.';
            errorMessage.classList.remove('hidden');
          }
        } else {
          field.classList.remove('error');
          if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.classList.add('hidden');
          }
        }
      });

      // Prevent form submission if validation fails
      if (!isValid) {
        event.preventDefault();
      }
    });

    // Clear error messages on input
    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        field.classList.remove('error');
        const errorMessage = field.nextElementSibling;
        if (errorMessage) {
          errorMessage.textContent = '';
          errorMessage.classList.add('hidden');
        }
      });
    });
  });
});