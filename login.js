// Login Form Functionality
document.addEventListener('DOMContentLoaded', () => {
  initializeLoginForm();
});

function initializeLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');

  // Password toggle functionality
  if (passwordToggle) {
    passwordToggle.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      const icon = passwordToggle.querySelector('i');
      if (type === 'password') {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      } else {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      }
    });
  }

  // Form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe').checked;

      // Clear previous errors
      hideError();
      clearInputErrors();

      // Basic validation
      if (!email || !password) {
        showError('Please fill in all required fields');
        return;
      }

      if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        markInputError('email');
        return;
      }

      // Disable submit button
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';

      try {
        // In a real application, you would make an API call here
        // const response = await fetch('/api/v1/auth/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email, password, rememberMe })
        // });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate successful login
        // In a real app, you would:
        // - Store the authentication token
        // - Redirect to dashboard
        // - Handle remember me functionality
        
        // For demo purposes, show success and redirect
        showSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          // Redirect to dashboard or home page
          // In a real app: window.location.href = '/dashboard';
          window.location.href = 'index.html';
        }, 1000);

      } catch (error) {
        showError('Invalid email or password. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }

  // Social login handlers
  const googleBtn = document.querySelector('.btn-google');
  const githubBtn = document.querySelector('.btn-github');

  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      // In a real app, this would initiate OAuth flow
      alert('Google login would be implemented here');
    });
  }

  if (githubBtn) {
    githubBtn.addEventListener('click', () => {
      // In a real app, this would initiate OAuth flow
      alert('GitHub login would be implemented here');
    });
  }

  // Forgot password handler
  const forgotPasswordLink = document.querySelector('.forgot-password');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      // In a real app, this would open a forgot password modal or redirect
      alert('Forgot password functionality would be implemented here');
    });
  }
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show error message
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
  }
}

// Hide error message
function hideError() {
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
  }
}

// Show success message
function showSuccess(message) {
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.background = '#d1fae5';
    errorMessage.style.color = '#065f46';
    errorMessage.classList.add('show');
  }
}

// Mark input as error
function markInputError(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.add('error');
    input.addEventListener('input', () => {
      input.classList.remove('error');
    }, { once: true });
  }
}

// Clear all input errors
function clearInputErrors() {
  document.querySelectorAll('.input-wrapper input').forEach(input => {
    input.classList.remove('error', 'success');
  });
}

// Auto-focus email input on load
window.addEventListener('load', () => {
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.focus();
  }
});

