document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const formMessages = document.getElementById('form-messages');

  form.addEventListener('submit', async (event) => { // Marked as async
    let isValid = true;

    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach((msg) => (msg.style.display = 'none'));

    // Validate Name
    if (nameInput.value.trim() === '') {
      const nameError = document.getElementById('name-error');
      nameError.style.display = 'block';
      isValid = false;
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      const emailError = document.getElementById('email-error');
      emailError.style.display = 'block';
      isValid = false;
    }

    // Validate Message
    if (messageInput.value.trim() === '') {
      const messageError = document.getElementById('message-error');
      messageError.style.display = 'block';
      isValid = false;
    }

    // Prevent form submission if validation fails
    if (!isValid) {
      event.preventDefault();
      formMessages.textContent = 'Please fix the errors above and try again.';
      formMessages.classList.add('error');
      return;
    }

    event.preventDefault(); // Prevent default form submission

    // Clear previous messages
    formMessages.textContent = '';
    formMessages.className = 'form-messages';

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        formMessages.textContent = 'Thank you! Your message has been sent successfully.';
        formMessages.classList.add('success');
        form.reset(); // Clear the form
      } else {
        throw new Error('There was an issue submitting the form. Please try again.');
      }
    } catch (error) {
      formMessages.textContent = error.message;
      formMessages.classList.add('error');
    }
  });
});