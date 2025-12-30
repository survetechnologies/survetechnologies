# Backend Contact Form API Setup

## API Endpoint Required

Your backend needs to implement a contact form endpoint that sends emails to `survetechnologies@gmail.com`. The frontend will call:

**Endpoint:** `POST /api/v1/contact`

## Request Format

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "company": "Example Corp",
  "subject": "general",
  "message": "Hello, I have a question...",
  "newsletter": true,
  "to": "survetechnologies@gmail.com",
  "recipient_email": "survetechnologies@gmail.com"
}
```

**Subject Values:**
- `general` - General Inquiry
- `sales` - Sales & Pricing
- `support` - Technical Support
- `partnership` - Partnership Opportunity
- `feedback` - Feedback & Suggestions
- `other` - Other

## Response Format

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Email Format

When a contact form is submitted, send an email to `survetechnologies@gmail.com` with:

**Subject:** `Contact Form: [Subject Type] - [Name]`

**Email Body (HTML):**
```html
<h2>New Contact Form Submission</h2>

<h3>Contact Information:</h3>
<ul>
  <li><strong>Name:</strong> [name]</li>
  <li><strong>Email:</strong> [email]</li>
  <li><strong>Company:</strong> [company]</li>
  <li><strong>Subject:</strong> [subject]</li>
</ul>

<h3>Message:</h3>
<p>[message]</p>

<h3>Preferences:</h3>
<p>Newsletter Subscription: [newsletter ? 'Yes' : 'No']</p>

<hr>
<p style="color: #666; font-size: 0.9rem;">Submitted: [timestamp]</p>
<p style="color: #666; font-size: 0.9rem;">Reply to: [email]</p>
```

## Backend Implementation Examples

### Node.js/Express Example

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure your SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.yourdomain.com',
  port: 587,
  secure: false,
  auth: {
    user: 'noreply@rentaiagent.ai',
    pass: 'your-email-password'
  }
});

router.post('/api/v1/contact', async (req, res) => {
  try {
    const { name, email, company, subject, message, newsletter } = req.body;
    const recipientEmail = 'survetechnologies@gmail.com';
    
    // Subject mapping
    const subjectMap = {
      'general': 'General Inquiry',
      'sales': 'Sales & Pricing',
      'support': 'Technical Support',
      'partnership': 'Partnership Opportunity',
      'feedback': 'Feedback & Suggestions',
      'other': 'Other'
    };
    
    const emailSubject = `Contact Form: ${subjectMap[subject] || subject} - ${name}`;
    
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
          .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; font-size: 0.9em; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>RentAIAgent.ai</p>
          </div>
          <div class="content">
            <div class="section">
              <h3>Contact Information</h3>
              <div class="info-row"><strong>Name:</strong> ${name}</div>
              <div class="info-row"><strong>Email:</strong> ${email}</div>
              <div class="info-row"><strong>Company:</strong> ${company || 'Not provided'}</div>
              <div class="info-row"><strong>Subject:</strong> ${subjectMap[subject] || subject}</div>
            </div>
            
            <div class="section">
              <h3>Message</h3>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="section">
              <h3>Preferences</h3>
              <p>Newsletter Subscription: ${newsletter ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <div class="footer">
            <p>Submitted: ${new Date().toLocaleString()}</p>
            <p>Reply to: <a href="mailto:${email}">${email}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `RentAIAgent.ai <noreply@rentaiagent.ai>`,
      to: recipientEmail,
      subject: emailSubject,
      html: emailHTML,
      replyTo: email
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Contact form submitted successfully'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

### Python/Flask Example

```python
from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

# SMTP Configuration
SMTP_HOST = 'smtp.yourdomain.com'
SMTP_PORT = 587
SMTP_USER = 'noreply@rentaiagent.ai'
SMTP_PASSWORD = 'your-email-password'
RECIPIENT_EMAIL = 'survetechnologies@gmail.com'

SUBJECT_MAP = {
    'general': 'General Inquiry',
    'sales': 'Sales & Pricing',
    'support': 'Technical Support',
    'partnership': 'Partnership Opportunity',
    'feedback': 'Feedback & Suggestions',
    'other': 'Other'
}

@app.route('/api/v1/contact', methods=['POST'])
def contact():
    try:
        data = request.json
        name = data['name']
        email = data['email']
        company = data.get('company', 'Not provided')
        subject = data['subject']
        message = data['message']
        newsletter = data.get('newsletter', False)
        
        email_subject = f"Contact Form: {SUBJECT_MAP.get(subject, subject)} - {name}"
        
        # Create HTML email
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #fafafa; padding: 20px; border: 1px solid #e8e8e8; }}
                .section {{ margin-bottom: 20px; }}
                .section h3 {{ color: #14b8a6; border-bottom: 2px solid #e8e8e8; padding-bottom: 10px; }}
                .footer {{ background: #f5f5f5; padding: 15px; text-align: center; color: #666; font-size: 0.9em; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Contact Form Submission</h2>
                    <p>RentAIAgent.ai</p>
                </div>
                <div class="content">
                    <div class="section">
                        <h3>Contact Information</h3>
                        <p><strong>Name:</strong> {name}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Company:</strong> {company}</p>
                        <p><strong>Subject:</strong> {SUBJECT_MAP.get(subject, subject)}</p>
                    </div>
                    <div class="section">
                        <h3>Message</h3>
                        <p>{message.replace(chr(10), '<br>')}</p>
                    </div>
                    <div class="section">
                        <h3>Preferences</h3>
                        <p>Newsletter Subscription: {'Yes' if newsletter else 'No'}</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Submitted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    <p>Reply to: <a href="mailto:{email}">{email}</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = email_subject
        msg['From'] = f"RentAIAgent.ai <{SMTP_USER}>"
        msg['To'] = RECIPIENT_EMAIL
        msg['Reply-To'] = email
        
        part = MIMEText(html_body, 'html')
        msg.attach(part)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        return jsonify({
            'success': True,
            'message': 'Contact form submitted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

## Testing

1. Fill out the contact form on the website
2. Submit the form
3. Check that an email is received at `survetechnologies@gmail.com`
4. Verify the email contains all form fields correctly

## Important Notes

- All contact form submissions should be sent to: **survetechnologies@gmail.com**
- The reply-to address should be set to the user's email so you can reply directly
- Include all form fields in the email for context
- Format the email nicely with HTML for better readability



