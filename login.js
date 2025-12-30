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
        // Step 1: Call login API
        const loginUrl = window.AppConfig ? window.AppConfig.getLoginUrl() : '/api/v1/login';
        const loginPayload = {
          username: formData.email,
          password: formData.password,
          userType: formData.userType
        };

        // SECURITY: Never log passwords - only log URL
        console.log('Calling login API:', loginUrl);
        const loginResponse = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginPayload)
        });

        if (!loginResponse.ok) {
          const errorData = await loginResponse.json().catch(() => ({ message: 'Login failed' }));
          throw new Error(errorData.message || `Login failed with status ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        // SECURITY: Don't log sensitive login data
        console.log('Login successful');

        // Step 2: Get JWT token
        const tokenUrl = window.AppConfig ? window.AppConfig.getTokenUrl() : '/api/v1/token';
        const tokenPayload = {
          email: formData.email,
          password: formData.password
        };

        // SECURITY: Never log passwords - only log URL
        console.log('Calling token API:', tokenUrl);
        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tokenPayload)
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({ message: 'Token generation failed' }));
          throw new Error(errorData.message || `Token generation failed with status ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        const jwtToken = tokenData.token || tokenData.accessToken || tokenData.jwt;
        
        if (!jwtToken) {
          throw new Error('JWT token not found in response');
        }

        console.log('Token received successfully');

        // Step 3: Get user's products
        const myProductsUrl = window.AppConfig ? window.AppConfig.getMyProductsUrl() : '/api/v1/my-products';
        const productsResponse = await fetch(myProductsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });

        let productsData = [];
        if (productsResponse.ok) {
          const productsResponseData = await productsResponse.json();
          // Handle API response structure: { success: true, data: [...], message: "..." }
          if (productsResponseData.success && Array.isArray(productsResponseData.data)) {
            productsData = productsResponseData.data;
          } else if (Array.isArray(productsResponseData)) {
            // Fallback: if response is directly an array
            productsData = productsResponseData;
          }
          console.log('Products loaded:', productsData);
        } else {
          console.warn('Failed to load products, continuing with empty list');
        }

        // Store authentication data
        const authData = {
          token: jwtToken,
          email: formData.email,
          userType: formData.userType,
          products: productsData,
          loginData: loginData
        };

        if (formData.rememberMe) {
          localStorage.setItem('authToken', jwtToken);
          localStorage.setItem('userType', formData.userType);
          localStorage.setItem('userEmail', formData.email);
          localStorage.setItem('userProducts', JSON.stringify(productsData));
        } else {
          sessionStorage.setItem('authToken', jwtToken);
          sessionStorage.setItem('userType', formData.userType);
          sessionStorage.setItem('userEmail', formData.email);
          sessionStorage.setItem('userProducts', JSON.stringify(productsData));
        }

        // Redirect to dashboard
        if (formData.userType === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'dashboard.html';
        }
        
      } catch (error) {
        console.error('Login error:', error);
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
          errorMsg.textContent = error.message || 'Login failed. Please check your credentials and try again.';
          errorMsg.style.display = 'block';
        } else {
          alert(error.message || 'Login failed. Please check your credentials and try again.');
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
