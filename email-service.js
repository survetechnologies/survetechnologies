// Email Service Integration
// This file handles sending registration emails to survetechnologies@gmail.com

/**
 * Send registration email notification
 * @param {Object} registrationData - The registration form data
 */
async function sendRegistrationEmail(registrationData) {
  console.log('📧 Starting email send process...', registrationData);
  const recipientEmail = 'survetechnologies@gmail.com';
  
  // Format product list
  const productList = registrationData.selected_products.map(p => 
    `• ${p.name || p.product_id} - ${p.planName || p.plan} Plan`
  ).join('\n') || 'No products selected';
  
  // Format email content
  const emailSubject = `New User Registration - ${registrationData.email}`;
  
  const emailBody = `
═══════════════════════════════════════════════════════
NEW USER REGISTRATION - RentAIAgent.ai
═══════════════════════════════════════════════════════

USER INFORMATION
───────────────────────────────────────────────────────
Email:        ${registrationData.email}
Name:         ${registrationData.profile.name}
Company:      ${registrationData.profile.company_name}
Phone:        ${registrationData.profile.phone}
Country:      ${registrationData.profile.address.country}

ADDRESS
───────────────────────────────────────────────────────
Street:       ${registrationData.profile.address.street}
City:         ${registrationData.profile.address.city}
State:        ${registrationData.profile.address.state}
ZIP:          ${registrationData.profile.address.zip}
Country:      ${registrationData.profile.address.country}

SELECTED PRODUCTS
───────────────────────────────────────────────────────
${productList}

PAYMENT INFORMATION
───────────────────────────────────────────────────────
${registrationData.payment_method && registrationData.payment_method.card_number ? 
  `Card Number:   Ending in ${registrationData.payment_method.card_number.replace(/\s/g, '').slice(-4)}
Cardholder:    ${registrationData.payment_method.cardholder_name}
Expiry:        ${registrationData.payment_method.expiry}
Billing Address: ${registrationData.payment_method.billing_address.street}, ${registrationData.payment_method.billing_address.city}` : 
  'Status: Payment information not provided (Optional)'}

═══════════════════════════════════════════════════════
Registration Date: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════
  `.trim();
  
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #fafafa; padding: 20px; border: 1px solid #e8e8e8; }
        .section { margin-bottom: 20px; }
        .section h3 { color: #14b8a6; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px; }
        .info-row { margin: 8px 0; }
        .info-label { font-weight: 600; color: #666; display: inline-block; width: 140px; }
        .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; font-size: 0.9em; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New User Registration</h2>
          <p>RentAIAgent.ai</p>
        </div>
        <div class="content">
          <div class="section">
            <h3>User Information</h3>
            <div class="info-row"><span class="info-label">Email:</span> ${registrationData.email}</div>
            <div class="info-row"><span class="info-label">Name:</span> ${registrationData.profile.name}</div>
            <div class="info-row"><span class="info-label">Company:</span> ${registrationData.profile.company_name}</div>
            <div class="info-row"><span class="info-label">Phone:</span> ${registrationData.profile.phone}</div>
            <div class="info-row"><span class="info-label">Country:</span> ${registrationData.profile.address.country}</div>
          </div>
          
          <div class="section">
            <h3>Address</h3>
            <div class="info-row">${registrationData.profile.address.street}</div>
            <div class="info-row">${registrationData.profile.address.city}, ${registrationData.profile.address.state} ${registrationData.profile.address.zip}</div>
            <div class="info-row">${registrationData.profile.address.country}</div>
          </div>
          
          <div class="section">
            <h3>Selected Products</h3>
            <ul>${registrationData.selected_products.map(p => `<li>${p.name || p.product_id} - ${p.planName || p.plan} Plan</li>`).join('')}</ul>
          </div>
          
          <div class="section">
            <h3>Payment Information</h3>
            ${registrationData.payment_method && registrationData.payment_method.card_number ? 
              `<div class="info-row"><span class="info-label">Card:</span> Ending in ${registrationData.payment_method.card_number.replace(/\s/g, '').slice(-4)}</div>
              <div class="info-row"><span class="info-label">Cardholder:</span> ${registrationData.payment_method.cardholder_name}</div>
              <div class="info-row"><span class="info-label">Expiry:</span> ${registrationData.payment_method.expiry}</div>` : 
              '<p><em>No payment information provided (Payment is optional)</em></p>'}
          </div>
        </div>
        <div class="footer">
          Registration Date: ${new Date().toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Send email via your domain's backend API
  try {
    console.log('📧 Sending registration email via backend API...');
    console.log('Recipient:', recipientEmail);
    console.log('Subject:', emailSubject);
    
    const response = await fetch('/api/v1/email/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject: emailSubject,
        text: emailBody,
        html: emailHTML,
        from: 'noreply@rentaiagent.ai', // Your domain email
        from_name: 'RentAIAgent.ai',
        reply_to: registrationData.email
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Registration email sent successfully via backend API');
      console.log('Response:', result);
      return { success: true, method: 'Backend API', response: result };
    } else {
      const errorText = await response.text();
      console.error('❌ API returned error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
  } catch (apiError) {
    console.error('❌ Backend API email service failed:', apiError.message);
    console.error('Full error:', apiError);
    
    // Try alternative endpoint format
    try {
      console.log('📧 Trying alternative API endpoint format...');
      const altResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: emailSubject,
          text: emailBody,
          html: emailHTML,
          registration_data: registrationData
        })
      });
      
      if (altResponse.ok) {
        console.log('✅ Registration email sent successfully via alternative endpoint');
        return { success: true, method: 'Alternative API' };
      } else {
        throw new Error(`Alternative endpoint failed: ${altResponse.status}`);
      }
    } catch (altError) {
      console.error('❌ Alternative endpoint also failed:', altError.message);
      throw apiError; // Re-throw original error
    }
  
  // If backend API fails, log error and provide fallback
  console.error('📧 Backend email service is not available or failed.');
  console.log('Please ensure your backend API endpoint is configured at: /api/v1/email/send');
  
  // Store email data in localStorage for manual sending
  try {
    const emailLog = JSON.parse(localStorage.getItem('registrationEmails') || '[]');
    emailLog.push({
      timestamp: new Date().toISOString(),
      to: recipientEmail,
      subject: emailSubject,
      body: emailBody,
      html: emailHTML,
      data: registrationData
    });
    localStorage.setItem('registrationEmails', JSON.stringify(emailLog.slice(-10))); // Keep last 10
    console.log('✅ Email data saved to localStorage');
  } catch (storageError) {
    console.warn('Could not store email in localStorage:', storageError);
  }
  
  // Create and trigger mailto link
  try {
    const mailtoSubject = encodeURIComponent(emailSubject);
    const mailtoBody = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:${recipientEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
    
    // Open mailto link in new window (user can send manually)
    window.open(mailtoLink, '_blank');
    console.log('📧 Mailto link opened. Email data is also logged in console and localStorage.');
    
    // Log full email details to console
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 REGISTRATION EMAIL DETAILS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('To:', recipientEmail);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);
    console.log('═══════════════════════════════════════════════════════');
    console.log('Full Registration Data:', registrationData);
    console.log('═══════════════════════════════════════════════════════');
    
    return { 
      success: true, 
      method: 'Mailto', 
      note: 'Email client opened. Please send manually or configure EmailJS/Formspree for automatic sending.',
      mailtoLink: mailtoLink
    };
  } catch (mailtoError) {
    console.error('Error creating mailto link:', mailtoError);
    return { 
      success: false, 
      method: 'Failed', 
      note: 'Email sending failed. Please configure EmailJS or Formspree. Email data is logged in console and localStorage.',
      error: mailtoError.message
    };
  }
}

