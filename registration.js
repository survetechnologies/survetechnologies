// Registration Form State
let currentStep = 1;
const totalSteps = 4;
let selectedProducts = [];
let formData = {};
let currentCurrency = { code: 'USD', symbol: '$', rate: 1.0 }; // Default to USD

// Currency Configuration (Exchange rates relative to USD)
const currencyConfig = {
  US: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
  DE: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  FR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.0 },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 150.0 }
};

// Available Products (Base prices in USD)
const products = [
  {
    id: 'invoice-processor',
    name: 'Invoice Processor Agent',
    description: 'Automated invoice processing, extraction, and payment scheduling',
    pricing: { model: 'per_batch', batch_size: 10, price_per_batch: 5.00 },
    plans: [
      { id: 'starter', name: 'Starter Plan', monthly_fee: 0, discount: 0 },
      { id: 'professional', name: 'Professional Plan', monthly_fee: 49, discount: 0.20 },
      { id: 'enterprise', name: 'Enterprise Plan', monthly_fee: 199, discount: 0.40 }
    ],
    defaultPlan: 'professional'
  },
  {
    id: 'content-writer',
    name: 'Content Writer Pro',
    description: 'AI-powered content creation for blogs, articles, and marketing',
    pricing: { model: 'per_word', price_per_100_words: 0.05 },
    plans: [
      { id: 'starter', name: 'Starter Plan', monthly_fee: 0, discount: 0 }
    ],
    defaultPlan: 'starter'
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst Expert',
    description: 'Advanced data analysis with visualizations and insights',
    pricing: { model: 'per_analysis', price_per_analysis: 2.00 },
    plans: [
      { id: 'starter', name: 'Starter Plan', monthly_fee: 0, discount: 0 }
    ],
    defaultPlan: 'starter'
  }
];

// Get currency info for a country
function getCurrencyForCountry(countryCode) {
  if (!countryCode) {
    return currencyConfig.US;
  }
  // Ensure country code is uppercase for consistency
  const code = countryCode.toUpperCase().trim();
  
  const currency = currencyConfig[code];
  if (!currency) {
    console.warn('Currency not found for country code:', code, 'Defaulting to USD');
    return currencyConfig.US;
  }
  return currency;
}

// Convert price from USD to current currency
function convertPrice(usdPrice) {
  return usdPrice * currentCurrency.rate;
}

// Format price with currency symbol
function formatPrice(price, decimals = 2) {
  const convertedPrice = convertPrice(price);
  
  // Special handling for JPY (no decimals) and INR (no decimals for small amounts)
  if (currentCurrency.code === 'JPY') {
    return `${currentCurrency.symbol}${Math.round(convertedPrice).toLocaleString()}`;
  }
  
  if (currentCurrency.code === 'INR' && convertedPrice < 1) {
    return `${currentCurrency.symbol}${convertedPrice.toFixed(decimals)}`;
  }
  
  return `${currentCurrency.symbol}${convertedPrice.toFixed(decimals)}`;
}

// Get formatted product price string
function getProductPriceString(product) {
  const pricing = product.pricing;
  
  if (pricing.model === 'per_batch') {
    return `${formatPrice(pricing.price_per_batch)} per ${pricing.batch_size} invoices`;
  } else if (pricing.model === 'per_word') {
    return `${formatPrice(pricing.price_per_100_words)} per 100 words`;
  } else if (pricing.model === 'per_analysis') {
    return `${formatPrice(pricing.price_per_analysis)} per analysis`;
  }
  
  return '';
}

// Update currency based on country selection
function updateCurrency(countryCode) {
  if (!countryCode) {
    return; // Don't update if no country code provided
  }
  
  const newCurrency = getCurrencyForCountry(countryCode);
  
  // Update currency
  const currencyChanged = currentCurrency.code !== newCurrency.code;
  currentCurrency = newCurrency;
  
  // Update currency indicator if it exists
  const currencyIndicator = document.getElementById('currencyIndicator');
  if (currencyIndicator) {
    currencyIndicator.textContent = `Prices in ${currentCurrency.code} (${currentCurrency.name})`;
    if (currencyChanged) {
      currencyIndicator.style.animation = 'pulse 0.5s ease-in-out';
      setTimeout(() => {
        currencyIndicator.style.animation = '';
      }, 500);
    }
  }
  
  // Re-render products with new currency
  if (currentStep === 2) {
    renderProducts();
    // Update selected products prices
    updateSelectedProductsPrices();
    // Restore selected state
    selectedProducts.forEach(product => {
      const card = document.querySelector(`[data-product-id="${product.id}"]`);
      if (card) {
        card.classList.add('selected');
      }
    });
  }
  
  // Update review sections if on step 3 or 4
  if (currentStep === 3) {
    updateSelectedProductsReview();
  }
  if (currentStep === 4) {
    updateReviewSection();
  }
}

// Update selected products with current currency prices
function updateSelectedProductsPrices() {
  selectedProducts.forEach(product => {
    const productData = products.find(p => p.id === product.id);
    if (productData) {
      product.price = getProductPriceString(productData);
      const plan = productData.plans.find(p => p.id === product.plan);
      if (plan) {
        product.monthlyFee = plan.monthly_fee;
      }
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeForm();
  setupFormValidation();
  setupInputFormatters();
  setupCountryChangeHandler();
  // Products will be rendered when Step 2 is shown with correct currency
});

// Initialize form
function initializeForm() {
  updateProgressIndicator();
  showStep(1);
  
  // Set initial currency from default country selection (US is selected by default)
  const countrySelect = document.getElementById('country');
  if (countrySelect) {
    // Force set to US if no value or if value is US
    if (!countrySelect.value || countrySelect.value === 'US') {
      currentCurrency = currencyConfig.US;
      // Update currency note
      const currencyNote = document.getElementById('currencyNote');
      if (currencyNote) {
        currencyNote.textContent = `Prices will be displayed in ${currentCurrency.code} (${currentCurrency.name})`;
      }
    } else if (countrySelect.value) {
      updateCurrency(countrySelect.value);
    }
  }
}

// Update progress indicator
function updateProgressIndicator() {
  const steps = document.querySelectorAll('.progress-step');
  steps.forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove('active', 'completed');
    
    if (stepNum < currentStep) {
      step.classList.add('completed');
      const line = step.nextElementSibling;
      if (line && line.classList.contains('progress-line')) {
        line.classList.add('completed');
      }
    } else if (stepNum === currentStep) {
      step.classList.add('active');
    }
  });
}

// Show specific step
function showStep(step) {
  const steps = document.querySelectorAll('.form-step');
  steps.forEach((s, index) => {
    if (index + 1 === step) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });
  
  currentStep = step;
  updateProgressIndicator();
  
  // Update currency indicator on Step 2
  const currencyIndicator = document.getElementById('currencyIndicator');
  if (currencyIndicator) {
    currencyIndicator.textContent = `Prices in ${currentCurrency.code} (${currentCurrency.name})`;
  }
  
  // Update currency note on Step 1
  const currencyNote = document.getElementById('currencyNote');
  if (currencyNote && step === 1) {
    const countrySelect = document.getElementById('country');
    if (countrySelect && countrySelect.value) {
      const currency = getCurrencyForCountry(countrySelect.value);
      currencyNote.textContent = `Prices will be displayed in ${currency.code} (${currency.name})`;
    } else {
      currencyNote.textContent = 'Please select your country to see prices in your local currency';
    }
  }
  
  // Update review section if on step 4
  if (step === 4) {
    updateReviewSection();
  }
  
  // Update selected products review if on step 3
  if (step === 3) {
    updateSelectedProductsReview();
  }
  
  // Re-render products with current currency if on step 2
  if (step === 2) {
    // Ensure currency is set from Step 1
    const countrySelect = document.getElementById('country');
    if (countrySelect && countrySelect.value) {
      const countryCode = countrySelect.value;
      const currency = getCurrencyForCountry(countryCode);
      currentCurrency = currency;
      updateCurrency(countryCode);
    } else if (formData.country) {
      updateCurrency(formData.country);
    }
    renderProducts();
    // Restore selected state
    selectedProducts.forEach(product => {
      const card = document.querySelector(`[data-product-id="${product.id}"]`);
      if (card) {
        card.classList.add('selected');
      }
    });
    
    // Restore skip checkbox state if no products selected
    const skipProducts = document.getElementById('skipProducts');
    if (skipProducts && selectedProducts.length === 0) {
      // Check if skip was previously selected (we'll track this in formData if needed)
      // For now, just ensure the UI is consistent
      toggleProductSelection();
    }
  }
}

// Next step
function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < totalSteps) {
      saveCurrentStepData();
      showStep(currentStep + 1);
    }
  }
}

// Previous step
function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

// Validate current step
function validateCurrentStep() {
  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(err => {
    err.textContent = '';
  });
  
  // Validate step 1
  if (currentStep === 1) {
    const country = document.getElementById('country').value;
    if (!country) {
      alert('Please select your country first');
      isValid = false;
    }
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordError = document.getElementById('passwordError');
    
    if (password !== confirmPassword) {
      passwordError.textContent = 'Passwords do not match';
      isValid = false;
    }
    
    if (password.length < 8) {
      passwordError.textContent = 'Password must be at least 8 characters';
      isValid = false;
    }
  }
  
  // Validate step 2 (Products are optional if skip is checked)
  if (currentStep === 2) {
    const skipProducts = document.getElementById('skipProducts');
    const isSkipped = skipProducts && skipProducts.checked;
    
    if (!isSkipped && selectedProducts.length === 0) {
      alert('Please select at least one product or check "Skip for now" to proceed');
      isValid = false;
    }
  }
  
  // Validate step 3 (Payment is optional based on dropdown selection)
  if (currentStep === 3) {
    const paymentOption = document.getElementById('paymentOption');
    if (paymentOption && paymentOption.value === 'now') {
      // If user selected "Add Payment Now", validate payment fields
      const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
      const expiry = document.getElementById('expiry').value;
      const cvc = document.getElementById('cvc').value;
      const cardholderName = document.getElementById('cardholderName').value;
      
      if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
        alert('Please enter a valid card number');
        isValid = false;
      }
      
      if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        alert('Please enter a valid expiry date (MM/YY)');
        isValid = false;
      }
      
      if (!cvc || cvc.length < 3) {
        alert('Please enter a valid CVC');
        isValid = false;
      }
      
      if (!cardholderName || cardholderName.trim() === '') {
        alert('Please enter cardholder name');
        isValid = false;
      }
    }
    // If "Provide Later" is selected, no validation needed
  }
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = '#ef4444';
      isValid = false;
    } else {
      field.style.borderColor = '#e5e7eb';
    }
  });
  
  return isValid;
}

// Save current step data
function saveCurrentStepData() {
  if (currentStep === 1) {
    const country = document.getElementById('country').value;
    formData.country = country;
    formData.email = document.getElementById('email').value;
    formData.name = document.getElementById('name').value;
    formData.companyName = document.getElementById('companyName').value;
    formData.phone = document.getElementById('phone').value;
    
    // Update currency when country is selected
    if (country) {
      updateCurrency(country);
    }
  } else if (currentStep === 3) {
    const paymentOption = document.getElementById('paymentOption');
    formData.paymentOption = paymentOption ? paymentOption.value : 'later';
    
    if (formData.paymentOption === 'now') {
      formData.cardNumber = document.getElementById('cardNumber').value;
      formData.expiry = document.getElementById('expiry').value;
      formData.cvc = document.getElementById('cvc').value;
      formData.cardholderName = document.getElementById('cardholderName').value;
      formData.street = document.getElementById('street').value;
      formData.city = document.getElementById('city').value;
      formData.state = document.getElementById('state').value;
      formData.zip = document.getElementById('zip').value;
    } else {
      // Clear payment data if "Provide Later" is selected
      formData.cardNumber = '';
      formData.expiry = '';
      formData.cvc = '';
      formData.cardholderName = '';
      formData.street = '';
      formData.city = '';
      formData.state = '';
      formData.zip = '';
    }
  }
}

// Render products
function renderProducts() {
  const productsGrid = document.getElementById('productsGrid');
  productsGrid.innerHTML = products.map(product => {
    const priceString = getProductPriceString(product);
    const isSelected = selectedProducts.some(p => p.id === product.id);
    
    return `
    <div class="product-card ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
      <div class="product-header">
        <div style="display: flex; align-items: center; flex: 1;">
          <div class="product-checkbox"></div>
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-pricing">${priceString}</div>
          </div>
        </div>
      </div>
      <div class="product-plan-select">
        <select onchange="updateProductPlan('${product.id}', this.value)">
          ${product.plans.map(plan => {
            const planPrice = plan.monthly_fee > 0 ? ` (${formatPrice(plan.monthly_fee)}/month)` : '';
            return `<option value="${plan.id}" ${plan.id === product.defaultPlan ? 'selected' : ''}>${plan.name}${planPrice}</option>`;
          }).join('')}
        </select>
      </div>
    </div>
  `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName !== 'SELECT') {
        toggleProduct(card.dataset.productId);
      }
    });
  });
}

// Toggle product selection
function toggleProduct(productId) {
  const skipProducts = document.getElementById('skipProducts');
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  
  // If skip is checked, don't allow selection
  if (skipProducts && skipProducts.checked) {
    return;
  }
  
  const index = selectedProducts.findIndex(p => p.id === productId);
  
  if (index > -1) {
    // Deselect
    selectedProducts.splice(index, 1);
    card.classList.remove('selected');
  } else {
    // Select
    const product = products.find(p => p.id === productId);
    const planSelect = card.querySelector('select');
    const planId = planSelect.value;
    const plan = product.plans.find(p => p.id === planId);
    
    selectedProducts.push({
      id: productId,
      name: product.name,
      plan: planId,
      planName: plan.name,
      price: getProductPriceString(product),
      monthlyFee: plan.monthly_fee,
      baseMonthlyFee: plan.monthly_fee // Store base USD price
    });
    card.classList.add('selected');
    
    // Uncheck skip if product is selected
    if (skipProducts) {
      skipProducts.checked = false;
      toggleProductSelection();
    }
  }
  
  updateSelectedCount();
}

// Update product plan
function updateProductPlan(productId, planId) {
  const index = selectedProducts.findIndex(p => p.id === productId);
  if (index > -1) {
    const product = products.find(p => p.id === productId);
    const plan = product.plans.find(p => p.id === planId);
    selectedProducts[index].plan = planId;
    selectedProducts[index].planName = plan.name;
    selectedProducts[index].monthlyFee = plan.monthly_fee;
    selectedProducts[index].baseMonthlyFee = plan.monthly_fee;
    selectedProducts[index].price = getProductPriceString(product);
  }
}

// Update selected count
function updateSelectedCount() {
  const countElement = document.getElementById('selectedCount');
  if (countElement) {
    countElement.textContent = selectedProducts.length;
  }
  
  // Uncheck skip if products are selected
  const skipProducts = document.getElementById('skipProducts');
  if (skipProducts && selectedProducts.length > 0 && skipProducts.checked) {
    skipProducts.checked = false;
    toggleProductSelection();
  }
}

// Update selected products review (for step 3)
function updateSelectedProductsReview() {
  const reviewContainer = document.getElementById('selectedProductsReview');
  const skipProducts = document.getElementById('skipProducts');
  const isSkipped = skipProducts && skipProducts.checked;
  
  if (isSkipped || selectedProducts.length === 0) {
    reviewContainer.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;"><i class="fas fa-info-circle"></i> No products selected - You can add them later from your dashboard</p>';
    return;
  }
  
  reviewContainer.innerHTML = selectedProducts.map(product => {
    const monthlyFeeDisplay = product.baseMonthlyFee > 0 
      ? `<br><small>Monthly: ${formatPrice(product.baseMonthlyFee)}</small>` 
      : '';
    return `
    <div class="selected-product-item">
      <strong>${product.name}</strong> (${product.planName})
      ${monthlyFeeDisplay}
      <br><small>${product.price}</small>
    </div>
  `;
  }).join('');
}

// Update review section (for step 4)
function updateReviewSection() {
  // Account info
  document.getElementById('reviewEmail').textContent = formData.email || '';
  document.getElementById('reviewName').textContent = formData.name || '';
  document.getElementById('reviewCompany').textContent = formData.companyName || '';
  
  // Get country name
  const countrySelect = document.getElementById('country');
  let countryName = '';
  if (countrySelect && formData.country) {
    const selectedOption = countrySelect.querySelector(`option[value="${formData.country}"]`);
    countryName = selectedOption ? selectedOption.textContent : formData.country;
  }
  
  // Products
  const reviewProducts = document.getElementById('reviewProducts');
  const skipProducts = document.getElementById('skipProducts');
  const isSkipped = skipProducts && skipProducts.checked;
  
  if (isSkipped || selectedProducts.length === 0) {
    reviewProducts.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;"><i class="fas fa-info-circle"></i> No products selected - You can add them later from your dashboard</p>';
  } else {
    reviewProducts.innerHTML = selectedProducts.map(product => {
      const monthlyFeeDisplay = product.baseMonthlyFee > 0 
        ? `Monthly: ${formatPrice(product.baseMonthlyFee)} + ` 
        : '';
      return `
      <div class="review-product-item">
        <div class="review-product-name">${product.name} (${product.planName})</div>
        <div class="review-product-price">
          ${monthlyFeeDisplay}${product.price}
        </div>
      </div>
    `;
    }).join('');
  }
  
  // Payment method
  const paymentOption = formData.paymentOption || 'later';
  const reviewCard = document.getElementById('reviewCard');
  if (reviewCard) {
    if (paymentOption === 'now' && formData.cardNumber) {
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      const last4 = cardNumber.slice(-4);
      reviewCard.textContent = `Card ending in ${last4}`;
    } else {
      reviewCard.textContent = 'Will provide later';
    }
  }
  
  // Currency info
  const currencyInfo = document.getElementById('reviewCurrency');
  if (currencyInfo) {
    currencyInfo.textContent = `All prices in ${currentCurrency.code} (${currentCurrency.name}) - ${countryName}`;
  }
}

// Setup form validation
function setupFormValidation() {
  // Password confirmation validation
  const confirmPassword = document.getElementById('confirmPassword');
  if (confirmPassword) {
    confirmPassword.addEventListener('input', () => {
      const password = document.getElementById('password').value;
      const passwordError = document.getElementById('passwordError');
      
      if (confirmPassword.value && password !== confirmPassword.value) {
        passwordError.textContent = 'Passwords do not match';
      } else {
        passwordError.textContent = '';
      }
    });
  }
}

// Setup input formatters
function setupInputFormatters() {
  // Card number formatting
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }
  
  // Expiry date formatting
  const expiry = document.getElementById('expiry');
  if (expiry) {
    expiry.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }
  
  // CVC formatting
  const cvc = document.getElementById('cvc');
  if (cvc) {
    cvc.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
}

// Setup country change handler
function setupCountryChangeHandler() {
  const countrySelect = document.getElementById('country');
  if (countrySelect) {
    // Ensure currency is set for the current selection
    if (countrySelect.value) {
      const currency = getCurrencyForCountry(countrySelect.value);
      currentCurrency = currency;
      
      // Update currency note
      const currencyNote = document.getElementById('currencyNote');
      if (currencyNote) {
        currencyNote.textContent = `Prices will be displayed in ${currency.code} (${currency.name})`;
      }
    }
    
    countrySelect.addEventListener('change', (e) => {
      const countryCode = e.target.value;
      if (countryCode) {
        const currency = getCurrencyForCountry(countryCode);
        currentCurrency = currency; // Set immediately
        updateCurrency(countryCode);
        
        // Update currency note in Step 1
        const currencyNote = document.getElementById('currencyNote');
        if (currencyNote) {
          currencyNote.textContent = `Prices will be displayed in ${currency.code} (${currency.name})`;
        }
      } else {
        // Reset to default if no country selected
        currentCurrency = currencyConfig.US;
        const currencyNote = document.getElementById('currencyNote');
        if (currencyNote) {
          currencyNote.textContent = 'Please select your country to see prices in your local currency';
        }
      }
    });
  }
}

// Handle form submission
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!validateCurrentStep()) {
    return;
  }
  
  // Save final step data
  saveCurrentStepData();
  
  // Prepare submission data (payment is optional)
  const paymentOption = formData.paymentOption || 'later';
  const hasPaymentInfo = paymentOption === 'now' && formData.cardNumber && formData.cardNumber.trim() !== '';
  
  const submissionData = {
    email: formData.email,
    password: document.getElementById('password').value,
    profile: {
      name: formData.name,
      company_name: formData.companyName,
      phone: formData.phone,
      address: {
        street: formData.street || 'Not provided',
        city: formData.city || 'Not provided',
        state: formData.state || 'Not provided',
        zip: formData.zip || 'Not provided',
        country: formData.country
      }
    },
    selected_products: selectedProducts.length > 0 ? selectedProducts.map(p => ({
      product_id: p.id,
      plan: p.plan,
      name: p.name,
      planName: p.planName
    })) : [],
    products_skipped: selectedProducts.length === 0,
    payment_option: paymentOption,
    payment_method: hasPaymentInfo ? {
      type: 'card',
      card_number: formData.cardNumber,
      expiry: formData.expiry,
      cvc: formData.cvc,
      cardholder_name: formData.cardholderName,
      billing_address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country
      }
    } : null
  };
  
  // Disable submit button
  const submitButton = e.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';
  
  // Send email notification
  try {
    // Send email to survetechnologies@gmail.com with registration details
    await sendRegistrationEmail(submissionData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success message
    const form = document.getElementById('registrationForm');
    form.innerHTML = `
      <div class="success-message">
        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 20px;"></i>
        <h2 style="margin-bottom: 10px;">Registration Successful!</h2>
        <p>Thank you for registering with RentAIAgent.ai</p>
        <p style="margin-top: 10px; font-size: 0.9rem;">A confirmation email has been sent to ${formData.email}</p>
        <p style="margin-top: 5px; font-size: 0.85rem; opacity: 0.9;">Registration details have been sent to our team.</p>
        <button class="btn-primary" style="margin-top: 20px; width: auto; padding: 12px 30px;" onclick="window.location.href='index.html'">
          Go to Dashboard
        </button>
      </div>
    `;
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration completed, but there was an issue sending the email. Please contact support.');
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

// sendRegistrationEmail function is now in email-service.js

// Toggle payment fields based on payment option
function togglePaymentFields() {
  const paymentOption = document.getElementById('paymentOption');
  const paymentFields = document.getElementById('paymentFields');
  
  if (paymentOption && paymentFields) {
    if (paymentOption.value === 'now') {
      paymentFields.style.display = 'block';
      // Make payment fields required if user chooses to add payment now
      const paymentInputs = paymentFields.querySelectorAll('input');
      paymentInputs.forEach(input => {
        input.required = true;
      });
    } else {
      paymentFields.style.display = 'none';
      // Remove required attribute if user chooses to provide later
      const paymentInputs = paymentFields.querySelectorAll('input');
      paymentInputs.forEach(input => {
        input.required = false;
        input.value = ''; // Clear fields
      });
    }
  }
}

// Toggle product selection based on skip checkbox
function toggleProductSelection() {
  const skipProducts = document.getElementById('skipProducts');
  const productsGrid = document.getElementById('productsGrid');
  const productCards = document.querySelectorAll('.product-card');
  
  if (skipProducts && skipProducts.checked) {
    // Disable all product cards
    productCards.forEach(card => {
      card.style.opacity = '0.5';
      card.style.pointerEvents = 'none';
      card.classList.remove('selected');
    });
    
    // Clear selected products
    selectedProducts = [];
    updateSelectedCount();
    
    // Update summary
    const summary = document.querySelector('.selected-products-summary');
    if (summary) {
      summary.innerHTML = '<span style="color: var(--text-secondary);"><i class="fas fa-info-circle"></i> Products skipped - You can add them later</span>';
    }
  } else {
    // Enable all product cards
    productCards.forEach(card => {
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
    });
    
    // Update summary
    const summary = document.querySelector('.selected-products-summary');
    if (summary) {
      summary.innerHTML = '<span>Selected: <strong id="selectedCount">0</strong> product(s)</span>';
      // Re-attach the count element
      const countElement = document.getElementById('selectedCount');
      if (countElement) {
        updateSelectedCount();
      }
    }
  }
}

// Make functions available globally
window.nextStep = nextStep;
window.prevStep = prevStep;
window.updateProductPlan = updateProductPlan;
window.togglePaymentFields = togglePaymentFields;
window.toggleProductSelection = toggleProductSelection;

