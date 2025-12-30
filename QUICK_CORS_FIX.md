# Quick CORS Fix Guide

## The Problem

You're getting this error:
```
CORS Missing Allow Origin
Response body is not available to scripts
```

This means your Spring Boot backend is not allowing requests from your frontend origin.

## Quick Fix (5 minutes)

### Step 1: Create CORS Configuration Class

Create a new file in your Spring Boot project:

**File:** `src/main/java/com/rentaiagent/config/CorsConfig.java`

```java
package com.rentaiagent.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Allow localhost origins (for development)
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost",
            "http://localhost:3000",
            "http://127.0.0.1",
            "http://127.0.0.1:3000"
        ));
        
        // Allow all headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow all HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Expose headers to frontend
        config.setExposedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Total-Count"
        ));
        
        // Cache preflight requests for 1 hour
        config.setMaxAge(3600L);
        
        // Apply CORS configuration to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

### Step 2: Restart Your Backend

1. Stop your Spring Boot application
2. Start it again
3. The CORS configuration will be active

### Step 3: Test

1. Open `test-backend.html` in your browser
2. Click "Test CORS Configuration"
3. You should see ✅ CORS is configured correctly

## Alternative: Using @CrossOrigin Annotation

If you prefer, you can add this to your controller instead:

```java
@RestController
@CrossOrigin(origins = {
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1"
})
@RequestMapping("/api/v1")
public class UserRegistrationController implements ApiApi {
    // Your existing code
}
```

## Verify It's Working

### Option 1: Use the Test Page

Open `test-backend.html` in your browser and run all tests.

### Option 2: Check Browser Console

After adding CORS config, try registering again. You should see:
- No CORS errors in console
- Successful API response

### Option 3: Use curl

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS http://localhost:8080/api/v1/register \
  -H "Origin: http://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -v

# You should see:
# < Access-Control-Allow-Origin: http://localhost
# < Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## Common Issues

### Issue: Still getting CORS errors after adding config

**Solution:**
1. Make sure you restarted the backend
2. Check that the package name matches (`com.rentaiagent.config`)
3. Verify the class is in the right location
4. Check backend logs for errors

### Issue: Works in browser but not in production

**Solution:**
Add your production domain to `allowedOrigins`:
```java
config.setAllowedOrigins(Arrays.asList(
    "http://localhost",
    "https://yourdomain.com",
    "https://www.yourdomain.com"
));
```

### Issue: OPTIONS request returns 403

**Solution:**
Make sure your security configuration allows OPTIONS requests:
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and() // Enable CORS
            .csrf().disable() // Or configure CSRF properly
            // ... rest of config
        return http.build();
    }
}
```

## Need More Help?

1. Check `CORS_SETUP.md` for detailed configuration options
2. Open `test-backend.html` to diagnose the issue
3. Check browser DevTools → Network tab for request/response headers
4. Check backend logs for CORS-related errors

## Quick Checklist

- [ ] Created `CorsConfig.java` file
- [ ] Added `@Configuration` annotation
- [ ] Added `@Bean` method returning `CorsFilter`
- [ ] Included `http://localhost` in allowed origins
- [ ] Restarted backend server
- [ ] Tested with `test-backend.html`
- [ ] No CORS errors in browser console


