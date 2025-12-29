# Backend Email API Setup

## API Endpoint Required

Your backend needs to implement an email sending endpoint. The frontend will call:

**Endpoint:** `POST /api/v1/email/send`

## Request Format

```json
{
  "to": "survetechnologies@gmail.com",
  "subject": "New User Registration - user@example.com",
  "text": "Plain text email body",
  "html": "<html>HTML email body</html>",
  "from": "noreply@rentaiagent.ai",
  "from_name": "RentAIAgent.ai",
  "reply_to": "user@example.com"
}
```

## Response Format

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "message_id": "optional-message-id"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Alternative Endpoint

If your endpoint is different, you can also use:

**Endpoint:** `POST /api/send-email`

**Request Format:**
```json
{
  "to": "survetechnologies@gmail.com",
  "subject": "New User Registration - user@example.com",
  "text": "Plain text email body",
  "html": "<html>HTML email body</html>",
  "registration_data": {
    // Full registration data object
  }
}
```

## Backend Implementation Examples

### Node.js/Express Example

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure your SMTP transporter (using your domain)
const transporter = nodemailer.createTransport({
  host: 'smtp.yourdomain.com', // Your domain's SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'noreply@rentaiagent.ai', // Your domain email
    pass: 'your-email-password' // Your email password
  }
});

router.post('/api/v1/email/send', async (req, res) => {
  try {
    const { to, subject, text, html, from, from_name, reply_to } = req.body;
    
    const mailOptions = {
      from: `${from_name} <${from}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
      replyTo: reply_to
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      message_id: info.messageId
    });
  } catch (error) {
    console.error('Email sending error:', error);
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

@app.route('/api/v1/email/send', methods=['POST'])
def send_email():
    try:
        data = request.json
        to = data['to']
        subject = data['subject']
        text = data['text']
        html = data['html']
        from_email = data.get('from', SMTP_USER)
        from_name = data.get('from_name', 'RentAIAgent.ai')
        reply_to = data.get('reply_to', from_email)
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{from_name} <{from_email}>"
        msg['To'] = to
        msg['Reply-To'] = reply_to
        
        # Add text and HTML parts
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        return jsonify({
            'success': True,
            'message': 'Email sent successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

## Testing

1. Start your backend server
2. Test the endpoint using curl:
```bash
curl -X POST http://localhost:3000/api/v1/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "survetechnologies@gmail.com",
    "subject": "Test Email",
    "text": "Test email body",
    "html": "<p>Test email body</p>",
    "from": "noreply@rentaiagent.ai",
    "from_name": "RentAIAgent.ai"
  }'
```

3. Check the browser console when submitting the registration form to see if the API call is successful.

## Troubleshooting

- **CORS Error**: Make sure your backend allows CORS requests from your frontend domain
- **404 Error**: Check that the endpoint path matches `/api/v1/email/send` or `/api/send-email`
- **500 Error**: Check your SMTP configuration and email credentials
- **Network Error**: Ensure your backend server is running and accessible

## Frontend Configuration

The frontend is already configured to call your backend API. No changes needed in the frontend code - just make sure your backend endpoint is set up correctly.


