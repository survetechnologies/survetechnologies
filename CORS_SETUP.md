# CORS Configuration Guide

## Understanding the 403 Error

A **403 Forbidden** error when calling your API typically indicates a **CORS (Cross-Origin Resource Sharing)** issue. This happens when:

1. Your frontend is running on `http://localhost` (or a different port)
2. Your backend is running on `http://localhost:8080`
3. The browser blocks the request because they're considered different origins

## Spring Boot CORS Configuration

### Option 1: Global CORS Configuration (Recommended)

Create a CORS configuration class in your Spring Boot application:

```java
package com.rentaiagent.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Allow specific origins (for production, use your actual domain)
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost",
            "http://localhost:3000",
            "http://127.0.0.1",
            "http://127.0.0.1:3000",
            "https://yourdomain.com",
            "https://www.yourdomain.com"
        ));
        
        // Allow all origins (for development only - NOT recommended for production)
        // config.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Allow all headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow specific headers
        // config.setAllowedHeaders(Arrays.asList(
        //     "Origin", "Content-Type", "Accept", "Authorization",
        //     "Access-Control-Allow-Origin", "Access-Control-Allow-Headers"
        // ));
        
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

### Option 2: Controller-Level CORS

Add `@CrossOrigin` annotation to your controller:

```java
@RestController
@CrossOrigin(origins = {
    "http://localhost",
    "http://localhost:3000",
    "https://yourdomain.com"
})
@RequestMapping("/api/v1")
public class UserRegistrationController implements ApiApi {
    // Your controller code
}
```

### Option 3: Method-Level CORS

Add `@CrossOrigin` to specific methods:

```java
@CrossOrigin(origins = "http://localhost")
@PostMapping("/register")
public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
    // Your code
}
```

### Option 4: WebMvcConfigurer (Alternative)

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost",
                    "http://localhost:3000",
                    "https://yourdomain.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## Testing CORS Configuration

### 1. Check Preflight Request

When making a POST request, the browser first sends an OPTIONS request (preflight). Check your backend logs to see if it's handling OPTIONS requests:

```bash
# You should see an OPTIONS request before the POST
OPTIONS /api/v1/register HTTP/1.1
Origin: http://localhost
Access-Control-Request-Method: POST
```

### 2. Check Response Headers

In browser DevTools → Network tab, check the response headers:

```
Access-Control-Allow-Origin: http://localhost
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### 3. Test with curl

```bash
# Test preflight request
curl -X OPTIONS http://localhost:8080/api/v1/register \
  -H "Origin: http://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Test actual request
curl -X POST http://localhost:8080/api/v1/register \
  -H "Origin: http://localhost" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -v
```

## Common Issues and Solutions

### Issue 1: 403 on OPTIONS Request

**Problem**: Backend doesn't handle OPTIONS requests.

**Solution**: Ensure your CORS configuration handles OPTIONS method, or add a filter:

```java
@Component
public class CorsFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) 
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;
        
        String origin = request.getHeader("Origin");
        if (origin != null && isAllowedOrigin(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Max-Age", "3600");
        }
        
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        chain.doFilter(req, res);
    }
    
    private boolean isAllowedOrigin(String origin) {
        return origin.startsWith("http://localhost") || 
               origin.startsWith("https://yourdomain.com");
    }
}
```

### Issue 2: Credentials Not Working

**Problem**: `credentials: 'include'` in fetch but cookies aren't sent.

**Solution**: 
- Set `Access-Control-Allow-Credentials: true` in backend
- Don't use `Access-Control-Allow-Origin: *` with credentials (use specific origins)

### Issue 3: Different Ports

**Problem**: Frontend on port 3000, backend on 8080.

**Solution**: Include both origins in CORS config:
```java
config.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:8080"
));
```

## Security Best Practices

1. **Never use `*` for allowed origins in production**
   ```java
   // ❌ BAD - Allows any origin
   config.setAllowedOrigins(Arrays.asList("*"));
   
   // ✅ GOOD - Specific origins only
   config.setAllowedOrigins(Arrays.asList("https://yourdomain.com"));
   ```

2. **Use environment-specific CORS configuration**
   ```java
   @Value("${app.cors.allowed-origins}")
   private List<String> allowedOrigins;
   
   config.setAllowedOrigins(allowedOrigins);
   ```

3. **Limit allowed methods and headers**
   ```java
   // Only allow what you need
   config.setAllowedMethods(Arrays.asList("GET", "POST"));
   config.setAllowedHeaders(Arrays.asList("Content-Type", "Authorization"));
   ```

## Application Properties

Add CORS configuration to `application.properties`:

```properties
# CORS Configuration
app.cors.allowed-origins=http://localhost,http://localhost:3000,https://yourdomain.com
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
app.cors.allowed-headers=*
app.cors.allow-credentials=true
app.cors.max-age=3600
```

Then use in your configuration:

```java
@Value("${app.cors.allowed-origins}")
private String allowedOrigins;

config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
```

## Quick Fix for Development

For quick local development, you can temporarily use:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*"); // Development only!
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

**⚠️ Warning**: Never use this in production!

## Verification Checklist

- [ ] Backend handles OPTIONS requests
- [ ] `Access-Control-Allow-Origin` header is present
- [ ] Origin matches exactly (including protocol and port)
- [ ] `Access-Control-Allow-Credentials: true` if using credentials
- [ ] Allowed methods include the HTTP method you're using
- [ ] Allowed headers include `Content-Type` and any custom headers
- [ ] No conflicting CORS configurations
- [ ] Backend is running and accessible

## Testing Your Fix

1. Open browser DevTools → Network tab
2. Make a request from your frontend
3. Check the request headers (should include `Origin`)
4. Check the response headers (should include `Access-Control-Allow-Origin`)
5. If you see CORS errors in console, check the preflight (OPTIONS) request

## Need Help?

If you're still getting 403 errors after configuring CORS:

1. Check browser console for specific CORS error messages
2. Check Network tab for request/response headers
3. Verify backend is running: `curl http://localhost:8080/api/v1/register`
4. Check backend logs for CORS-related errors
5. Ensure no proxy or firewall is interfering


