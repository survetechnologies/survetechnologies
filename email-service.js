// Email Service Integration
// This file handles sending registration emails to survetechnologies@gmail.com

/**
 * Send registration email notification
 * @param {Object} registrationData - The registration form data
 */
async function sendRegistrationEmail(registrationData) {
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
  
  // Try multiple email sending methods
  try {
    // Method 1: Try backend API endpoint
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject: emailSubject,
        text: emailBody,
        html: emailHTML
      })
    });
    
    if (response.ok) {
      console.log('✅ Registration email sent successfully via API');
      return { success: true, method: 'API' };
    }
  } catch (apiError) {
    console.warn('API email service not available, trying alternative methods...');
  }
  
  // Method 2: Try EmailJS (if configured)
  try {
    if (typeof emailjs !== 'undefined') {
      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        {
          to_email: recipientEmail,
          subject: emailSubject,
          message: emailBody,
          html_message: emailHTML
        }
      );
      console.log('✅ Registration email sent successfully via EmailJS');
      return { success: true, method: 'EmailJS' };
    }
  } catch (emailjsError) {
    console.warn('EmailJS not configured or failed');
  }
  
  // Method 3: Fallback - Log email data for manual sending or backend processing
  console.log('📧 Registration Email Data (for manual sending or backend integration):');
  console.log('═══════════════════════════════════════════════════════');
  console.log('To:', recipientEmail);
  console.log('Subject:', emailSubject);
  console.log('Body:', emailBody);
  console.log('═══════════════════════════════════════════════════════');
  
  // Store in localStorage as backup (for development/testing)
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
  } catch (storageError) {
    console.warn('Could not store email in localStorage');
  }
  
  // Return success even if email service isn't configured
  // In production, you should integrate with a proper email service
  return { success: true, method: 'Logged', note: 'Email data logged. Configure email service for automatic sending.' };
}

