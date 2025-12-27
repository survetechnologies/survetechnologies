// Login Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const userTypeSelect = document.getElementById('userType');
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordInput = document.getElementById('password');
  
  // Password toggle functionality
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const icon = passwordToggle.querySelector('i');
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  }
  
  // Handle form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = {
        userType: userTypeSelect.value,
        email: document.getElementById('email').value,
        password: passwordInput.value,
        rememberMe: document.getElementById('rememberMe').checked
      };
      
      // Validate user type
      if (!formData.userType) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
          errorMessage.textContent = 'Please select a user type (User or Admin)';
          errorMessage.style.display = 'block';
        } else {
          alert('Please select a user type (User or Admin)');
        }
        return;
      }
      
      // Clear error message
      const errorMessage = document.getElementById('errorMessage');
      if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
      }
      
      // Disable submit button
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';
      
      try {
        // Simulate API call (replace with actual API endpoint)
        // const response = await fetch('/api/v1/auth/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // });
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store user type in session/localStorage
        if (formData.rememberMe) {
          localStorage.setItem('userType', formData.userType);
          localStorage.setItem('userEmail', formData.email);
        } else {
          sessionStorage.setItem('userType', formData.userType);
          sessionStorage.setItem('userEmail', formData.email);
        }
        
        // Redirect based on user type
        if (formData.userType === 'admin') {
          // Redirect to admin dashboard
          window.location.href = 'admin-dashboard.html';
        } else {
          // Redirect to user dashboard
          window.location.href = 'dashboard.html';
        }
        
      } catch (error) {
        console.error('Login error:', error);
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
          errorMsg.textContent = 'Login failed. Please check your credentials and try again.';
          errorMsg.style.display = 'block';
        } else {
          alert('Login failed. Please check your credentials and try again.');
        }
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }
  
  // Restore user type from storage if "Remember me" was checked
  const savedUserType = localStorage.getItem('userType');
  if (savedUserType && userTypeSelect) {
    userTypeSelect.value = savedUserType;
    updateLoginCardBorder(savedUserType);
  }
  
  // Add visual feedback for user type selection
  if (userTypeSelect) {
    userTypeSelect.addEventListener('change', (e) => {
      updateLoginCardBorder(e.target.value);
    });
    
    // Set initial border color
    updateLoginCardBorder(userTypeSelect.value);
  }
  
  function updateLoginCardBorder(userType) {
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
      if (userType === 'admin') {
        loginCard.style.borderTopColor = 'var(--error)';
      } else if (userType === 'user') {
        loginCard.style.borderTopColor = 'var(--accent-primary)';
      } else {
        loginCard.style.borderTopColor = 'var(--border-color)';
      }
    }
  }
});
