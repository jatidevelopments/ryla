# Colorful Logging

The backend now uses colorful logging for better readability and debugging.

## Features

### 🎨 Color-Coded Log Levels
- **LOG** (Blue): General information
- **ERROR** (Red): Error messages
- **WARN** (Yellow): Warning messages
- **DEBUG** (Magenta): Debug information
- **VERBOSE** (Gray): Verbose logging

### 🌈 HTTP Request Logging

Request/Response logging is color-coded by:
- **HTTP Method**: 
  - `GET` - Green
  - `POST` - Blue
  - `PUT` - Yellow
  - `PATCH` - Magenta
  - `DELETE` - Red
  - `OPTIONS` - Gray

- **Status Codes**:
  - `2xx` - Green (success)
  - `3xx` - Yellow (redirect)
  - `4xx` - Red (client error)
  - `5xx` - Red Bold (server error)

- **Response Time**:
  - `< 100ms` - Green (fast)
  - `< 500ms` - Yellow (moderate)
  - `>= 500ms` - Red (slow)

### 📝 Example Output

```
[2025-12-10T17:05:23.123Z] LOG [LoggingInterceptor] GET /health
[2025-12-10T17:05:23.145Z] LOG [LoggingInterceptor] GET /health 200 22ms
[2025-12-10T17:05:23.200Z] ERROR [GlobalExceptionFilter] ✗ [404] Not Found
```

### 🚀 Startup Messages

Colorful startup banner with:
- 🚀 Server URL (green)
- 📚 Swagger docs URL (blue)
- 🔐 Swagger credentials (yellow)

## Implementation

- **Logger Helper**: `apps/api/src/common/logger/logger.helper.ts`
  - Color formatting utilities for HTTP methods, status codes, URLs, and timing

- **Logging Interceptor**: `apps/api/src/common/interceptors/logger.interceptor.ts`
  - Enhanced with colorful request/response logging

- **Global Exception Filter**: `apps/api/src/common/http/global-exception.filter.ts`
  - Colorful error logging with status codes

- **Main Bootstrap**: `apps/api/src/main.ts`
  - Colorful startup messages

## Usage

All logging is automatic. The colorful logger is used throughout the application via:
- NestJS Logger (default)
- LoggingInterceptor (HTTP requests)
- GlobalExceptionFilter (errors)

No code changes needed - just enjoy the colors! 🎨

