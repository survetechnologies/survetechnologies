/**
 * Environment Configuration
 * Manages API endpoints and settings for different environments
 */

(function() {
  'use strict';

  // Detect environment based on hostname
  function detectEnvironment() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      return 'local';
    }
    
    // Development environment (e.g., dev.yourdomain.com)
    if (hostname.includes('dev.') || hostname.includes('development')) {
      return 'dev';
    }
    
    // Test/Staging environment (e.g., test.yourdomain.com, staging.yourdomain.com)
    if (hostname.includes('test.') || hostname.includes('staging.') || hostname.includes('qa.')) {
      return 'test';
    }
    
    // Default to dev environment (changed from prod)
    return 'dev';
  }

  // Environment-specific configurations
  const environments = {
    local: {
      name: 'Local Development',
      apiBaseUrl: 'http://34.228.44.250',
      endpoints: {
        register: '/api/v1/register',
        login: '/api/v1/auth/login',
        contact: '/api/v1/contact',
        email: '/api/v1/email/send',
        emailAlt: '/api/send-email',
        products: '/api/v1/products/catalog',
        users: '/api/v1/users'
      },
      debug: true,
      logLevel: 'debug'
    },
    dev: {
      name: 'Development',
      apiBaseUrl: 'http://34.228.44.250',
      endpoints: {
        register: '/api/v1/register',
        login: '/api/v1/auth/login',
        contact: '/api/v1/contact',
        email: '/api/v1/email/send',
        emailAlt: '/api/send-email',
        products: '/api/v1/products/catalog',
        users: '/api/v1/users'
      },
      debug: true,
      logLevel: 'info'
    },
    test: {
      name: 'Test/Staging',
      apiBaseUrl: 'http://34.228.44.250',
      endpoints: {
        register: '/api/v1/register',
        login: '/api/v1/auth/login',
        contact: '/api/v1/contact',
        email: '/api/v1/email/send',
        emailAlt: '/api/send-email',
        products: '/api/v1/products/catalog',
        users: '/api/v1/users'
      },
      debug: true,
      logLevel: 'warn'
    },
    prod: {
      name: 'Production',
      apiBaseUrl: 'http://34.228.44.250',
      endpoints: {
        register: '/api/v1/register',
        login: '/api/v1/auth/login',
        contact: '/api/v1/contact',
        email: '/api/v1/email/send',
        emailAlt: '/api/send-email',
        products: '/api/v1/products/catalog',
        users: '/api/v1/users'
      },
      debug: false,
      logLevel: 'error'
    }
  };

  // Get current environment
  const currentEnv = detectEnvironment();
  const config = environments[currentEnv];

  // Helper function to get full API URL
  function getApiUrl(endpointKey) {
    const endpoint = config.endpoints[endpointKey];
    if (!endpoint) {
      console.error(`Endpoint key "${endpointKey}" not found in configuration`);
      return null;
    }
    
    // If endpoint already includes protocol, return as-is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Otherwise, combine base URL with endpoint
    return `${config.apiBaseUrl}${endpoint}`;
  }

  // Helper function to log based on environment
  function log(level, ...args) {
    if (!config.debug && level === 'debug') {
      return;
    }
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex >= currentLevelIndex) {
      const prefix = `[${config.name}]`;
      const logMethod = level === 'error' ? console.error : 
                       level === 'warn' ? console.warn : 
                       level === 'info' ? console.info : 
                       console.log;
      logMethod(prefix, ...args);
    }
  }

  // Helper function to test backend connection
  async function testBackendConnection() {
    const baseUrl = config.apiBaseUrl;
    const testUrl = `${baseUrl}/actuator/health`; // Spring Boot health endpoint
    
    log('info', 'Testing backend connection...', baseUrl);
    
    try {
      // Try health endpoint first
      const healthResponse = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (healthResponse.ok) {
        log('info', '✅ Backend is running and accessible');
        return { connected: true, message: 'Backend is running' };
      }
    } catch (e) {
      log('warn', 'Health endpoint not available, trying base URL...');
    }
    
    // Try base URL
    try {
      const baseResponse = await fetch(baseUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (baseResponse.status !== 404) {
        log('info', '✅ Backend is running (base URL responded)');
        return { connected: true, message: 'Backend is running' };
      }
    } catch (e) {
      // Connection failed
    }
    
    log('error', '❌ Backend connection failed');
    return { 
      connected: false, 
      message: `Cannot connect to ${baseUrl}. Please ensure:\n1. Backend server is running\n2. Backend is accessible at ${baseUrl}\n3. No firewall is blocking the connection` 
    };
  }

  // Helper function to create fetch request with proper headers and error handling
  async function apiFetch(endpointKey, options = {}) {
    const url = getApiUrl(endpointKey);
    if (!url) {
      throw new Error(`Invalid endpoint key: ${endpointKey}`);
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const fetchOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      // Add credentials for cookies/auth if needed
      credentials: options.credentials || 'same-origin',
      mode: options.mode || 'cors'
    };

    log('debug', `API Request: ${fetchOptions.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, fetchOptions);
      
      // Log response details
      log('debug', `API Response: ${response.status} ${response.statusText}`);
      
      // Handle CORS errors (status 0 or network errors)
      if (response.status === 0 || response.type === 'opaque') {
        const corsError = `CORS Error: The backend at ${url} is not allowing requests from ${window.location.origin}.\n\n` +
          `To fix this, add CORS configuration to your Spring Boot backend:\n\n` +
          `@Configuration\n` +
          `public class CorsConfig {\n` +
          `  @Bean\n` +
          `  public CorsFilter corsFilter() {\n` +
          `    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();\n` +
          `    CorsConfiguration config = new CorsConfiguration();\n` +
          `    config.setAllowCredentials(true);\n` +
          `    config.addAllowedOrigin("${window.location.origin}");\n` +
          `    config.addAllowedHeader("*");\n` +
          `    config.addAllowedMethod("*");\n` +
          `    source.registerCorsConfiguration("/**", config);\n` +
          `    return new CorsFilter(source);\n` +
          `  }\n` +
          `}\n\n` +
          `See CORS_SETUP.md for detailed instructions.`;
        throw new Error(corsError);
      }
      
      // Handle 403 specifically
      if (response.status === 403) {
        const errorText = await response.text().catch(() => 'Forbidden');
        log('error', '403 Forbidden Error:', errorText);
        const corsHint = `\n\nThis is a CORS (Cross-Origin Resource Sharing) issue.\n` +
          `Your backend needs to allow requests from: ${window.location.origin}\n` +
          `See CORS_SETUP.md for configuration instructions.`;
        throw new Error(`403 Forbidden: ${errorText || 'Access denied'}${corsHint}`);
      }
      
      // Handle other errors
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData = null;
        
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text().catch(() => '');
          if (errorText) errorMessage = errorText;
        }
        
        // Create error with full details for proper error handling (e.g., duplicate email detection)
        const error = new Error(errorMessage);
        error.statusCode = response.status;
        error.response = response;
        if (errorData) {
          error.errorCode = errorData.code;
          error.details = errorData.details;
          error.errorData = errorData;
        }
        throw error;
      }
      
      return response;
    } catch (error) {
      // Network errors or CORS issues
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        log('error', 'Network/CORS error detected');
        
        // Try to test backend connection
        const connectionTest = await testBackendConnection().catch(() => ({ connected: false }));
        
        let errorMessage = 'Network/CORS Error: Unable to connect to API.\n\n';
        
        if (!connectionTest.connected) {
          errorMessage += connectionTest.message + '\n\n';
        } else {
          errorMessage += 'Backend is running, but CORS is not configured.\n\n';
        }
        
        errorMessage += `Request URL: ${url}\n` +
          `Frontend Origin: ${window.location.origin}\n\n` +
          `To fix CORS, add this to your Spring Boot backend:\n\n` +
          `@Configuration\n` +
          `public class CorsConfig {\n` +
          `  @Bean\n` +
          `  public CorsFilter corsFilter() {\n` +
          `    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();\n` +
          `    CorsConfiguration config = new CorsConfiguration();\n` +
          `    config.setAllowCredentials(true);\n` +
          `    config.addAllowedOrigin("${window.location.origin}");\n` +
          `    config.addAllowedHeader("*");\n` +
          `    config.addAllowedMethod("*");\n` +
          `    source.registerCorsConfiguration("/**", config);\n` +
          `    return new CorsFilter(source);\n` +
          `  }\n` +
          `}\n\n` +
          `See CORS_SETUP.md for complete instructions.`;
        
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Expose configuration globally
  window.AppConfig = {
    environment: currentEnv,
    config: config,
    getApiUrl: getApiUrl,
    log: log,
    apiFetch: apiFetch,
    testBackendConnection: testBackendConnection,
    
    // Convenience methods for common endpoints
    getRegisterUrl: () => getApiUrl('register'),
    getLoginUrl: () => getApiUrl('login'),
    getContactUrl: () => getApiUrl('contact'),
    getEmailUrl: () => getApiUrl('email'),
    getEmailAltUrl: () => getApiUrl('emailAlt'),
    getProductsUrl: () => getApiUrl('products'),
    getUsersUrl: () => getApiUrl('users'),
    
    // Check if in specific environment
    isLocal: () => currentEnv === 'local',
    isDev: () => currentEnv === 'dev',
    isTest: () => currentEnv === 'test',
    isProd: () => currentEnv === 'prod',
    
    // Get environment info
    getEnvironmentInfo: () => ({
      name: config.name,
      apiBaseUrl: config.apiBaseUrl,
      debug: config.debug,
      hostname: window.location.hostname,
      port: window.location.port
    })
  };

  // Log configuration on load
  if (config.debug) {
    console.log('🔧 Application Configuration Loaded');
    console.log('Environment:', currentEnv);
    console.log('Config:', config);
    console.log('API Base URL:', config.apiBaseUrl);
    console.log('Hostname:', window.location.hostname);
  }

  // Call API when config is loaded (test connection)
  async function initializeConfig() {
    if (config.debug) {
      log('info', 'Initializing configuration and testing API connection...');
    }
    
    try {
      // Test backend connection
      const connectionTest = await testBackendConnection();
      if (connectionTest.connected) {
        log('info', '✅ API connection successful');
      } else {
        log('warn', '⚠️ API connection test failed:', connectionTest.message);
      }
    } catch (error) {
      log('warn', '⚠️ API initialization check failed:', error.message);
    }
  }

  // Initialize when DOM is ready or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConfig);
  } else {
    // DOM already loaded, initialize immediately
    initializeConfig();
  }
})();

