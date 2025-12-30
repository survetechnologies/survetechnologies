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
  
  // Clear email error when user starts typing
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const errorDiv = document.getElementById('emailError');
      if (errorDiv) {
        errorDiv.remove();
      }
      // Reset border style
      emailInput.style.borderColor = '';
      emailInput.style.borderWidth = '';
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
  
  // Prepare API request data (matching Java RegisterRequest model format)
  const apiRequestData = {
    email: formData.email,
    password: document.getElementById('password').value,
    profile: {
      name: formData.name,
      companyName: formData.companyName,
      phone: formData.phone,
      address: {
        street: formData.street || 'Not provided',
        city: formData.city || 'Not provided',
        state: formData.state || 'Not provided',
        zip: formData.zip || 'Not provided',
        country: formData.country
      }
    },
    selectedProducts: selectedProducts.length > 0 ? selectedProducts.map(p => ({
      productId: p.id,
      plan: p.plan
    })) : [],
    paymentMethod: hasPaymentInfo ? {
      type: 'card',
      stripeToken: null, // TODO: Tokenize card with Stripe before sending
      billingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country
      }
    } : null
  };
  
  try {
    // Use AppConfig helper for better error handling
    let apiResponse;
    let apiResult;
    
    if (window.AppConfig && window.AppConfig.apiFetch) {
      // Use the helper function with better error handling
      window.AppConfig.log('info', 'Calling registration API');
      try {
        apiResponse = await window.AppConfig.apiFetch('register', {
          method: 'POST',
          body: JSON.stringify(apiRequestData)
        });
        apiResult = await apiResponse.json();
      } catch (fetchError) {
        // Extract error data from apiFetch helper (it attaches errorData to the error object)
        const errorData = fetchError.errorData || null;
        const statusCode = fetchError.statusCode || null;
        
        // Check for 409 status and EMAIL_ALREADY_EXISTS code
        const isDuplicateEmail = (statusCode === 409 && errorData && errorData.code === 'EMAIL_ALREADY_EXISTS') ||
                                 (statusCode === 409 && errorData && errorData.message && errorData.message.toLowerCase().includes('already registered')) ||
                                 (errorData && errorData.code === 'EMAIL_ALREADY_EXISTS') ||
                                 (statusCode === 409);
        
        if (isDuplicateEmail) {
          const duplicateError = new Error(errorData?.message || fetchError.message || 'Email already registered');
          duplicateError.isDuplicateEmail = true;
          duplicateError.statusCode = statusCode || 409;
          duplicateError.errorCode = errorData?.code || 'EMAIL_ALREADY_EXISTS';
          // Use the email from details field if available, otherwise use formData.email
          duplicateError.duplicateEmail = errorData?.details || formData.email;
          throw duplicateError;
        }
        
        // Check error message for duplicate email keywords (fallback)
        const errorText = fetchError.message || '';
        const isDuplicateByMessage = errorText.toLowerCase().includes('already registered') ||
                                     errorText.toLowerCase().includes('email already exists') ||
                                     errorText.toLowerCase().includes('email is already') ||
                                     errorText.toLowerCase().includes('duplicate email') ||
                                     errorText.toLowerCase().includes('email address already');
        
        if (isDuplicateByMessage) {
          const duplicateError = new Error(errorText);
          duplicateError.isDuplicateEmail = true;
          duplicateError.statusCode = statusCode || 409;
          duplicateError.duplicateEmail = errorData?.details || formData.email;
          throw duplicateError;
        }
        throw fetchError;
      }
    } else {
      // Fallback to direct fetch
      const apiUrl = window.AppConfig ? window.AppConfig.getRegisterUrl() : '/api/v1/register';
      window.AppConfig?.log('info', 'Calling registration API:', apiUrl);
      
      apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'same-origin',
        body: JSON.stringify(apiRequestData)
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ message: 'Registration failed' }));
        const errorMessage = errorData.message || errorData.error || `Registration failed with status ${apiResponse.status}`;
        
        // Check if it's a duplicate email error - specifically check for 409 and EMAIL_ALREADY_EXISTS
        const isDuplicateEmail = apiResponse.status === 409 && (
          errorData.code === 'EMAIL_ALREADY_EXISTS' ||
          errorMessage.toLowerCase().includes('already registered') ||
          errorMessage.toLowerCase().includes('email already exists')
        ) || (
          apiResponse.status === 400 &&
          (errorMessage.toLowerCase().includes('already registered') ||
           errorMessage.toLowerCase().includes('email already exists') ||
           errorMessage.toLowerCase().includes('email is already') ||
           errorMessage.toLowerCase().includes('duplicate email') ||
           errorMessage.toLowerCase().includes('email address already'))
        );
        
        if (isDuplicateEmail) {
          // Create a custom error object to identify duplicate email
          const duplicateError = new Error(errorMessage);
          duplicateError.isDuplicateEmail = true;
          duplicateError.statusCode = apiResponse.status;
          duplicateError.errorCode = errorData.code;
          // Use the email from details field if available, otherwise use formData.email
          duplicateError.duplicateEmail = errorData.details || formData.email;
          throw duplicateError;
        }
        
        throw new Error(errorMessage);
      }
      
      apiResult = await apiResponse.json();
    }
    console.log('Registration API response:', apiResult);
    
    // Send email notification (using original submissionData format for email)
    try {
      // Ensure sendRegistrationEmail is available (from email-service.js)
      if (typeof sendRegistrationEmail === 'function') {
        await sendRegistrationEmail(submissionData);
      } else if (typeof window.sendRegistrationEmail === 'function') {
        await window.sendRegistrationEmail(submissionData);
      } else {
        console.warn('sendRegistrationEmail function not found. Email service may not be loaded.');
      }
    } catch (emailError) {
      console.warn('Email sending failed, but registration was successful:', emailError);
      // Don't fail registration if email fails
    }
    
    // Show success message
    const form = document.getElementById('registrationForm');
    form.innerHTML = `
      <div class="success-message">
        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 20px; color: var(--success);"></i>
        <h2 style="margin-bottom: 10px;">Registration Successful!</h2>
        <p>Thank you for registering with RentAIAgent.ai</p>
        ${apiResult.data && apiResult.data.userId ? 
          `<p style="margin-top: 10px; font-size: 0.9rem;">Your account has been created successfully.</p>
           <p style="margin-top: 5px; font-size: 0.85rem; opacity: 0.9;">User ID: ${apiResult.data.userId}</p>` :
          `<p style="margin-top: 10px; font-size: 0.9rem;">A confirmation email has been sent to ${formData.email}</p>`
        }
        <p style="margin-top: 5px; font-size: 0.85rem; opacity: 0.9;">Registration details have been sent to our team.</p>
        <button class="btn-primary" style="margin-top: 20px; width: auto; padding: 12px 30px;" onclick="window.location.href='index.html'">
          Go to Dashboard
        </button>
      </div>
    `;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check if it's a duplicate email error (409 with EMAIL_ALREADY_EXISTS)
    if (error.isDuplicateEmail) {
      // Prevent form submission - show warning and ask user to change email
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      
      // Get the duplicate email from error details or formData
      const duplicateEmail = error.duplicateEmail || formData.email;
      
      // Go back to step 1 to update email
      showStep(1);
      
      // Highlight email field
      const emailInput = document.getElementById('email');
      if (emailInput) {
        // Clear the email field so user can enter a new one
        emailInput.value = '';
        formData.email = '';
        
        // Focus and highlight the field
        emailInput.focus();
        emailInput.style.borderColor = '#ef4444';
        emailInput.style.borderWidth = '2px';
        emailInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        // Show error message below email field
        let errorDiv = document.getElementById('emailError');
        if (!errorDiv) {
          errorDiv = document.createElement('div');
          errorDiv.id = 'emailError';
          errorDiv.className = 'error-message';
          errorDiv.style.color = '#ef4444';
          errorDiv.style.marginTop = '8px';
          errorDiv.style.fontSize = '0.875rem';
          errorDiv.style.padding = '10px';
          errorDiv.style.backgroundColor = '#fef2f2';
          errorDiv.style.border = '1px solid #fecaca';
          errorDiv.style.borderRadius = '6px';
          emailInput.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.innerHTML = `
          <div style="display: flex; align-items: start; gap: 8px;">
            <i class="fas fa-exclamation-triangle" style="color: #ef4444; margin-top: 2px;"></i>
            <div style="flex: 1;">
              <strong style="display: block; margin-bottom: 5px;">Email Already Registered</strong>
              <div style="margin-bottom: 8px; color: #7f1d1d;">
                The email address <strong>${duplicateEmail}</strong> is already registered in our system.
              </div>
              <div style="color: #991b1b; font-size: 0.8125rem;">
                Please use a different email address to continue with registration, or 
                <a href="login.html" style="color: var(--accent-primary); text-decoration: underline; font-weight: 600;">log in</a> if you already have an account.
              </div>
            </div>
          </div>
        `;
        
        // Scroll to email field to ensure it's visible
        emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Show alert as well for visibility
        setTimeout(() => {
          alert(`⚠️ Email Already Registered\n\nThe email address "${duplicateEmail}" is already registered in our system.\n\nPlease:\n1. Use a different email address, or\n2. Log in if you already have an account\n\nYou can update your email in the form above.`);
        }, 300);
        
        return; // Exit early - prevent form submission
      }
    }
    
    // Backend API failed - send emails as fallback (TODO: will implement different solution later)
    console.log('⚠️ Backend registration failed. Sending emails as fallback...');
    
    let emailsSent = false;
    try {
      // Send email to admin (survetechnologies@gmail.com)
      if (typeof sendRegistrationEmail === 'function') {
        await sendRegistrationEmail(submissionData);
        emailsSent = true;
      } else if (typeof window.sendRegistrationEmail === 'function') {
        await window.sendRegistrationEmail(submissionData);
        emailsSent = true;
      }
      
      // Send confirmation email to user
      if (typeof sendUserConfirmationEmail === 'function') {
        await sendUserConfirmationEmail(submissionData);
      } else if (typeof window.sendUserConfirmationEmail === 'function') {
        await window.sendUserConfirmationEmail(submissionData);
      }
      
      emailsSent = true;
    } catch (emailError) {
      console.error('Email fallback also failed:', emailError);
    }
    
    // Show success message even if backend failed (emails were sent)
    if (emailsSent) {
      const form = document.getElementById('registrationForm');
      form.innerHTML = `
        <div class="success-message">
          <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 20px; color: var(--success);"></i>
          <h2 style="margin-bottom: 10px;">Registration Received!</h2>
          <p>Thank you for registering with RentAIAgent.ai</p>
          <p style="margin-top: 10px; font-size: 0.9rem;">A confirmation email has been sent to ${formData.email}</p>
          <p style="margin-top: 5px; font-size: 0.85rem; opacity: 0.9; color: #f59e0b;">
            <i class="fas fa-info-circle"></i> Note: Backend service is temporarily unavailable. 
            Your registration has been saved and our team will process it shortly.
          </p>
          <p style="margin-top: 5px; font-size: 0.85rem; opacity: 0.9;">Registration details have been sent to our team.</p>
          <button class="btn-primary" style="margin-top: 20px; width: auto; padding: 12px 30px;" onclick="window.location.href='index.html'">
            Go to Home
          </button>
        </div>
      `;
      return; // Exit early since we showed success
    }
    
    // If emails also failed, show error
    let errorMessage = error.message || 'Registration failed. Please try again.';
    
    // Add helpful hints for common errors
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      errorMessage += '\n\nThis is likely a CORS (Cross-Origin) issue. Please ensure:\n' +
                      '1. Your backend server is running\n' +
                      '2. CORS is properly configured on the backend\n' +
                      '3. The API endpoint allows requests from your frontend origin';
    } else if (error.message.includes('Network error')) {
      errorMessage += '\n\nPlease check:\n' +
                      '1. Backend server is running at ' + (window.AppConfig?.getRegisterUrl() || 'http://34.228.44.250/api/v1/register') + '\n' +
                      '2. No firewall is blocking the connection\n' +
                      '3. The API URL is correct in config.js';
    }
    
    alert(`Registration Error: ${errorMessage}`);
    
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

