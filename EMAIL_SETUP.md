# Email Setup Instructions

## Current Status
The registration form is currently using a **mailto fallback** which opens the user's email client. For automatic email sending, you need to configure one of the following services:

## Option 1: EmailJS (Recommended - Free Tier Available)

### Setup Steps:
1. Go to https://www.emailjs.com/ and create a free account
2. Create an Email Service:
   - Go to "Email Services" → "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions
   - Copy your **Service ID**

3. Create an Email Template:
   - Go to "Email Templates" → "Create New Template"
   - Use this template structure:
     ```
     To: {{to_email}}
     Subject: {{subject}}
     
     {{html_message}}
     ```
   - Save and copy your **Template ID**

4. Get your Public Key:
   - Go to "Account" → "General"
   - Copy your **Public Key**

5. Update the code:
   - Open `email-service.js`
   - Replace `YOUR_SERVICE_ID` with your EmailJS Service ID
   - Replace `YOUR_TEMPLATE_ID` with your EmailJS Template ID
   - Add EmailJS script to `registration.html`:
     ```html
     <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
     <script>
       emailjs.init("YOUR_PUBLIC_KEY");
     </script>
     ```

## Option 2: Web3Forms (Easiest - Free, No Signup Required)

### Setup Steps:
1. Go to https://web3forms.com/
2. Enter your email: `survetechnologies@gmail.com`
3. Click "Get Your Access Key"
4. Copy the access key
5. Update `email-service.js`:
   - Find the line: `const web3formsAccessKey = 'YOUR_WEB3FORMS_ACCESS_KEY';`
   - Replace `YOUR_WEB3FORMS_ACCESS_KEY` with your actual key
   - That's it! Emails will now be sent automatically

**Note:** Web3Forms is the easiest option - no account creation needed, just get the key and paste it!

## Option 3: Formspree (Free Alternative)

### Setup Steps:
1. Go to https://formspree.io/ and create a free account
2. Create a new form
3. Copy your Form ID
4. Update `email-service.js`:
   - Replace `YOUR_FORM_ID` with your Formspree Form ID
   - The code will automatically use Formspree if EmailJS is not configured

## Option 3: Backend API

If you have a backend server, create an endpoint at `/api/send-email` that accepts:
```json
{
  "to": "email@example.com",
  "subject": "Email Subject",
  "text": "Plain text body",
  "html": "HTML body"
}
```

The code will automatically use this endpoint if available.

## Current Fallback Behavior

If no email service is configured:
- Email data is logged to browser console
- Email data is saved to localStorage (last 10 registrations)
- A mailto link opens the user's email client for manual sending

## Testing

After setup, test the registration form:
1. Fill out the registration form
2. Submit it
3. Check the browser console for email sending status
4. Verify the email is received at `survetechnologies@gmail.com`

## Email Content

The email includes:
- User information (name, email, company, phone, country)
- Address details
- Selected products
- Payment information (if provided)
- Registration timestamp

