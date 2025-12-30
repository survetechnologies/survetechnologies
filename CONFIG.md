# Environment Configuration Guide

This project uses an environment-based configuration system to manage API endpoints and settings across different deployment environments.

## Overview

The `config.js` file automatically detects the current environment based on the hostname and loads the appropriate configuration. This ensures that API endpoints are correctly set for local development, development, test/staging, and production environments.

## Environments

### Local (`local`)
- **Detection**: `localhost`, `127.0.0.1`, or empty hostname
- **API Base URL**: `http://localhost:8080`
- **Use Case**: Local development with Spring Boot backend running on default port
- **Debug**: Enabled
- **Log Level**: `debug`

### Development (`dev`)
- **Detection**: Hostname contains `dev.` or `development`
- **API Base URL**: `https://dev-api.rentaiagent.ai`
- **Use Case**: Development server
- **Debug**: Enabled
- **Log Level**: `info`

### Test/Staging (`test`)
- **Detection**: Hostname contains `test.`, `staging.`, or `qa.`
- **API Base URL**: `https://test-api.rentaiagent.ai`
- **Use Case**: Testing and staging environment
- **Debug**: Enabled
- **Log Level**: `warn`

### Production (`prod`)
- **Detection**: Default (any other hostname)
- **API Base URL**: `https://api.rentaiagent.ai`
- **Use Case**: Production environment
- **Debug**: Disabled
- **Log Level**: `error`

## Configuration Structure

Each environment configuration includes:

```javascript
{
  name: 'Environment Name',
  apiBaseUrl: 'https://api.example.com',
  endpoints: {
    register: '/api/v1/register',
    login: '/api/v1/auth/login',
    contact: '/api/v1/contact',
    email: '/api/v1/email/send',
    emailAlt: '/api/send-email',
    products: '/api/v1/products/catalog',
    users: '/api/v1/users'
  },
  debug: true/false,
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}
```

## Usage

### In HTML Files

Include `config.js` **before** any other scripts that use API calls:

```html
<head>
  <!-- Other head content -->
  <script src="config.js"></script>
</head>
<body>
  <!-- Your content -->
  <script src="your-script.js"></script>
</body>
```

### In JavaScript Files

Access the configuration through the global `AppConfig` object:

```javascript
// Get full API URL for an endpoint
const registerUrl = window.AppConfig.getRegisterUrl();
// Returns: http://localhost:8080/api/v1/register (in local env)

// Or use convenience methods
const loginUrl = window.AppConfig.getLoginUrl();
const contactUrl = window.AppConfig.getContactUrl();
const emailUrl = window.AppConfig.getEmailUrl();

// Make API call
const response = await fetch(registerUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// Check environment
if (window.AppConfig.isLocal()) {
  console.log('Running in local development');
}

// Logging (respects log level)
window.AppConfig.log('info', 'User registered successfully');
window.AppConfig.log('debug', 'Debug information');
window.AppConfig.log('error', 'An error occurred');
```

## Available Methods

### URL Getters
- `getRegisterUrl()` - Get registration endpoint URL
- `getLoginUrl()` - Get login endpoint URL
- `getContactUrl()` - Get contact form endpoint URL
- `getEmailUrl()` - Get email sending endpoint URL
- `getEmailAltUrl()` - Get alternative email endpoint URL
- `getProductsUrl()` - Get products catalog endpoint URL
- `getUsersUrl()` - Get users endpoint URL
- `getApiUrl(endpointKey)` - Get URL for any endpoint by key

### Environment Checks
- `isLocal()` - Returns `true` if in local environment
- `isDev()` - Returns `true` if in development environment
- `isTest()` - Returns `true` if in test/staging environment
- `isProd()` - Returns `true` if in production environment

### Utilities
- `log(level, ...args)` - Log messages respecting log level
- `getEnvironmentInfo()` - Get detailed environment information

## Customizing Configuration

### Changing API Base URLs

Edit `config.js` and update the `apiBaseUrl` for each environment:

```javascript
local: {
  apiBaseUrl: 'http://localhost:8080', // Change port if needed
  // ...
},
dev: {
  apiBaseUrl: 'https://your-dev-api.com',
  // ...
}
```

### Adding New Endpoints

Add new endpoints to the `endpoints` object in each environment:

```javascript
endpoints: {
  // ... existing endpoints
  newEndpoint: '/api/v1/new-endpoint'
}
```

Then use it:

```javascript
const url = window.AppConfig.getApiUrl('newEndpoint');
```

### Custom Environment Detection

Modify the `detectEnvironment()` function in `config.js` to add custom detection logic:

```javascript
function detectEnvironment() {
  const hostname = window.location.hostname;
  
  // Add custom detection
  if (hostname.includes('custom-env')) {
    return 'custom';
  }
  
  // ... existing detection logic
}
```

## Testing Configuration

### Local Development

1. Open the site at `http://localhost` or `http://127.0.0.1`
2. Open browser console
3. Check the configuration:
   ```javascript
   console.log(window.AppConfig.getEnvironmentInfo());
   console.log(window.AppConfig.getRegisterUrl());
   ```

### Environment Switching

To test different environments locally, you can:

1. **Modify hosts file** (for local testing):
   ```
   127.0.0.1 dev-api.rentaiagent.ai
   127.0.0.1 test-api.rentaiagent.ai
   ```

2. **Use browser extensions** to modify hostname

3. **Temporarily modify `detectEnvironment()`** function for testing

## Troubleshooting

### Configuration Not Loading

- Ensure `config.js` is loaded **before** any scripts that use it
- Check browser console for errors
- Verify file path is correct

### Wrong Environment Detected

- Check `window.AppConfig.getEnvironmentInfo()` in console
- Verify hostname detection logic matches your setup
- Manually override by modifying `detectEnvironment()` function

### API Calls Failing

- Check the API URL: `window.AppConfig.getRegisterUrl()`
- Verify backend server is running (for local)
- Check CORS settings if calling cross-origin
- Review browser network tab for actual request URLs

## Best Practices

1. **Always use `AppConfig` methods** instead of hardcoding URLs
2. **Load `config.js` first** in HTML files
3. **Use logging** for debugging: `window.AppConfig.log('debug', ...)`
4. **Check environment** before making development-only calls
5. **Update all environments** when adding new endpoints

## Example: Complete API Call

```javascript
async function registerUser(userData) {
  try {
    const apiUrl = window.AppConfig.getRegisterUrl();
    
    window.AppConfig.log('info', 'Registering user:', userData.email);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status}`);
    }
    
    const result = await response.json();
    window.AppConfig.log('info', 'Registration successful');
    return result;
    
  } catch (error) {
    window.AppConfig.log('error', 'Registration error:', error);
    throw error;
  }
}
```


