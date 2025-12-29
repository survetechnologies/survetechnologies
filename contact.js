// Contact Form JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        newsletter: document.getElementById('newsletter').checked
      };
      
      // Disable submit button
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      
      // Clear previous messages
      formMessage.className = 'form-message';
      formMessage.textContent = '';
      formMessage.style.display = 'none';
      
      try {
        // Get API URL from configuration
        const contactUrl = window.AppConfig ? window.AppConfig.getContactUrl() : '/api/v1/contact';
        
        if (window.AppConfig) {
          window.AppConfig.log('info', 'Sending contact form to:', contactUrl);
        }
        
        // Send to backend API - will email survetechnologies@gmail.com
        const response = await fetch(contactUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            to: 'survetechnologies@gmail.com',
            recipient_email: 'survetechnologies@gmail.com'
          })
        });
        
        if (response.ok) {
          // Success
          formMessage.className = 'form-message success';
          formMessage.textContent = 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.';
          formMessage.style.display = 'block';
          
          // Reset form
          contactForm.reset();
          
          // Scroll to message
          formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          throw new Error('Server error');
        }
      } catch (error) {
        console.error('Contact form error:', error);
        
        // Show error message
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Sorry, there was an error sending your message. Please try again or email us directly at survetechnologies@gmail.com';
        formMessage.style.display = 'block';
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }
});

