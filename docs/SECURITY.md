# Security Features and Best Practices

This document outlines the security features implemented in the Alberta Government Enterprise Template and provides guidance on maintaining security in production.

## Table of Contents

- [Security Features](#security-features)
- [Database Security (Azure PostgreSQL Compliance)](#database-security-azure-postgresql-compliance)
- [Security Configuration](#security-configuration)
- [Security Checklist](#security-checklist)
- [Known Issues](#known-issues)
- [Security Updates](#security-updates)
- [Reporting Security Issues](#reporting-security-issues)

## Security Features

### 1. Helmet.js Security Headers

**Purpose:** Protects against common web vulnerabilities by setting appropriate HTTP headers.

**Configuration:** [apps/api/src/app.ts](../apps/api/src/app.ts)

**Headers Set:**
- **Content Security Policy (CSP):** Restricts resource loading to prevent XSS attacks
  - `defaultSrc: ["'self']` - Only allow resources from same origin
  - `scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"]` - Required for GoA web components
  - `styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"]`
  - `fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"]`
  - `imgSrc: ["'self'", "data:", "https:"]`
  - `connectSrc: ["'self']` - Restrict AJAX/WebSocket connections
  - `frameSrc: ["'none']` - Block all framing (clickjacking protection)
  - `objectSrc: ["'none']` - Block plugins
- **Cross-Origin Embedder Policy:** Disabled for GoA component compatibility
- **Cross-Origin Resource Policy:** Set to `cross-origin` for web components

**Note:** `'unsafe-inline'` is required for GoA web components. This is an acceptable trade-off for official government design system components.

### 2. CSRF Protection

**Purpose:** Prevents Cross-Site Request Forgery attacks.

**Implementation:** [apps/api/src/middleware/csrf.middleware.ts](../apps/api/src/middleware/csrf.middleware.ts)

**How it works:**
1. Server generates a CSRF secret per session
2. Client retrieves token via `GET /api/v1/csrf-token`
3. Client includes token in `X-CSRF-Token` header for state-changing requests (POST, PUT, PATCH, DELETE)
4. Server validates token before processing request

**Excluded endpoints:**
- `/api/v1/health` - Health check
- `/api/v1/info` - API information
- `/api/v1/auth/callback` - Authentication callback (handled by auth providers)

**Frontend integration:**
```typescript
// Get CSRF token
const response = await fetch('/api/v1/csrf-token')
const { csrfToken } = await response.json()

// Include in requests
await fetch('/api/v1/some-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
})
```

### 3. Rate Limiting

**Purpose:** Prevents brute force attacks and API abuse.

**Implementation:** [apps/api/src/middleware/rate-limit.middleware.ts](../apps/api/src/middleware/rate-limit.middleware.ts)

**Limits:**
- **General API:** 100 requests per 15 minutes per IP address
- **Authentication endpoints:** 5 attempts per 15 minutes per IP address
  - `/api/v1/auth/login`
  - `/api/v1/auth/callback`

**Configuration:**
```bash
# .env
RATE_LIMIT_MAX=1000  # Override default (100) for production
```

**Response headers:**
- `RateLimit-Limit` - Maximum requests allowed
- `RateLimit-Remaining` - Requests remaining in window
- `RateLimit-Reset` - Time when limit resets (Unix timestamp)

**Error response:**
```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 900
  }
}
```

### 4. Input Validation

**Purpose:** Validates and sanitizes user input to prevent injection attacks.

**Implementation:** [apps/api/src/middleware/validation.middleware.ts](../apps/api/src/middleware/validation.middleware.ts)

**Usage:**
```typescript
import { validate } from '../middleware/validation.middleware.js'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

router.post('/login', validate(loginSchema, 'body'), loginController)
```

**Benefits:**
- Type-safe validation with Zod
- Automatic error formatting
- Validates body, query parameters, and URL params
- Prevents SQL injection, XSS, and other injection attacks

### 5. Secure Logging

**Purpose:** Logs requests and errors without exposing PII (Personally Identifiable Information).

**Implementation:** [apps/api/src/middleware/logger.middleware.ts](../apps/api/src/middleware/logger.middleware.ts)

**Redacted fields:**
- Authentication: `password`, `token`, `secret`, `api_key`, `authorization`, `cookie`, `csrf`
- Personal info: `email`, `phone`, `ssn`, `sin`, `credit_card`, `address`, `postal_code`
- Business info: `business_number`, `tax_id`

**Development logging:**
```
GET /api/v1/users?email=test@example.com 200 45ms - user-123 - query: {"email":"[REDACTED]"}
```

**Production logging:**
```
127.0.0.1 - user-123 [30/Jan/2026:12:00:00 +0000] "GET /api/v1/users HTTP/1.1" 200 1234 "-" "Mozilla/5.0" 45ms
```

**Security event logging:**
```typescript
import { logSecurityEvent } from '../middleware/logger.middleware.js'

logSecurityEvent('login_attempt', userId, {
  method: 'saml',
  success: true,
  ip: req.ip
})
```

### 6. Session Security

**Purpose:** Securely manages user sessions.

**Configuration:** [apps/api/src/app.ts](../apps/api/src/app.ts)

**Security measures:**
- **httpOnly cookies:** Prevents JavaScript access (XSS protection)
- **secure flag:** HTTPS-only in production
- **sameSite: 'lax':** CSRF protection
- **24-hour expiry:** Automatic session timeout
- **Session secret:** 32+ character random secret (configured via `SESSION_SECRET` env var)
- **Storage options:**
  - PostgreSQL: Persistent sessions (production)
  - Memory: Development/testing

**Production requirements:**
```bash
# .env
NODE_ENV=production
SESSION_SECRET=<32-character-random-string>
SESSION_STORE=postgres
DB_CONNECTION_STRING=postgresql://user:pass@host:5432/db
```

## Database Security (Azure PostgreSQL Compliance)

This application is fully compliant with the **Azure PostgreSQL - JavaScript (Node.js) Application Standard**. All database operations follow enterprise security and reliability requirements.

### Compliant Features

#### 1. **Connection Pool Management**

**Implementation:** [apps/api/src/config/database.config.ts](../apps/api/src/config/database.config.ts)

**Standard Compliance:**
- ✅ Single connection pool per process (Section 5.1)
- ✅ Configurable pool size via `DB_POOL_MAX` environment variable (Section 5.2)
- ✅ Connection timeout: 5000ms (configurable) (Section 6)
- ✅ Idle timeout: 30000ms (configurable) (Section 5.3)
- ✅ Statement timeout: 30000ms (configurable) (Section 6)
- ✅ Graceful shutdown with connection draining (Section 5.5)

**Configuration:**
```bash
DB_POOL_MAX=10                    # Maximum connections per process
DB_POOL_MIN=2                     # Minimum connections maintained
DB_CONNECTION_TIMEOUT=5000        # Connection acquisition timeout (ms)
DB_IDLE_TIMEOUT=30000             # Idle connection timeout (ms)
DB_STATEMENT_TIMEOUT=30000        # Query execution timeout (ms)
```

**Connection Budget:** See [CONNECTION_BUDGET.md](./CONNECTION_BUDGET.md) for detailed capacity planning.

#### 2. **TLS/SSL Security**

**Standard Compliance:**
- ✅ TLS 1.2+ required for all connections (Section 4)
- ✅ Certificate validation enabled in production (Section 4)
- ✅ SSL mode: `require` or `verify-full` (Section 4)

**Configuration:**
```bash
# Production: Certificate validation enabled
DB_SSL_REJECT_UNAUTHORIZED=true

# Development: SSL disabled for local PostgreSQL
DB_SSL_REJECT_UNAUTHORIZED=false
```

**Important:** Never disable certificate validation in production without architectural approval.

#### 3. **Schema Isolation**

**Standard Compliance:**
- ✅ Dedicated `app` schema (not `public`) (Section 10.1)
- ✅ Explicit `search_path` set on every connection (Section 10.1)

**Implementation:**
```typescript
// Automatically set on pool connection
pool.on('connect', async (client) => {
  await client.query('SET search_path TO app, public')
})
```

**Migration:** Run [scripts/migrations/001_create_app_schema.sql](../scripts/migrations/001_create_app_schema.sql)

#### 4. **Retry Logic for Transient Errors**

**Implementation:** [apps/api/src/utils/db-retry.ts](../apps/api/src/utils/db-retry.ts)

**Standard Compliance:**
- ✅ Only retry allowlisted SQLSTATE codes (Section 7.1)
- ✅ Never retry data/integrity/syntax errors (Section 7.2)
- ✅ Exponential backoff with jitter (Section 7.3)
- ✅ Maximum 3 retries (Section 7.3)

**Retryable Errors:**
- `57P01`, `57P02`, `57P03` - Admin shutdown/crash
- `40001`, `40P01` - Serialization failure/deadlock
- `08006`, `08001`, `08004` - Connection errors
- `53300` - Too many connections

**Usage:**
```typescript
import { queryWithRetry, transactionWithRetry } from './utils/db-retry.js'

// Retry simple queries
const result = await queryWithRetry(pool, 'SELECT * FROM users WHERE id = $1', [userId])

// Retry transactions
await transactionWithRetry(pool, async (client) => {
  await client.query('UPDATE orders SET status = $1', ['PAID'])
  await client.query('INSERT INTO audit_log VALUES ($1)', [orderId])
})
```

#### 5. **Observability and Monitoring**

**Implementation:** [apps/api/src/middleware/db-metrics.middleware.ts](../apps/api/src/middleware/db-metrics.middleware.ts)

**Standard Compliance:**
- ✅ Pool usage metrics (total, idle, waiting) (Section 14)
- ✅ Connection exhaustion alerts (Section 14)
- ✅ Slow query logging (>1 second) (Section 14)
- ✅ Health check with database connectivity (Section 14)

**Metrics Collected:**
- Total connections in pool
- Idle connections available
- Active connections in use
- Clients waiting for connection
- Pool utilization percentage

**Health Check Endpoint:**
```bash
curl http://localhost:3000/api/v1/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "pool": {
      "utilization": "65.0%",
      "connections": {
        "total": 10,
        "idle": 4,
        "active": 6,
        "waiting": 0
      },
      "warnings": []
    }
  }
}
```

#### 6. **Graceful Shutdown**

**Implementation:** [apps/api/src/server.ts](../apps/api/src/server.ts)

**Standard Compliance:**
- ✅ SIGTERM/SIGINT handlers (Section 16)
- ✅ Stop accepting new requests (Section 16)
- ✅ Drain existing connections (Section 5.5)
- ✅ Close pool before exit (Section 5.5)
- ✅ Force shutdown after 10 seconds (Section 16)

**Kubernetes Compatibility:**
```yaml
# Ensure terminationGracePeriodSeconds allows time for shutdown
spec:
  terminationGracePeriodSeconds: 30
```

#### 7. **SQL Safety**

**Standard Compliance:**
- ✅ All queries use parameterized statements (Section 8)
- ✅ No string concatenation in SQL (Section 8)

**Correct Usage:**
```typescript
// ✅ CORRECT: Parameterized query
await pool.query('SELECT * FROM users WHERE email = $1', [email])

// ❌ WRONG: SQL injection vulnerability
await pool.query(`SELECT * FROM users WHERE email = '${email}'`)
```

### Database Security Checklist

Use this checklist for production deployments:

#### Connection Management
- [ ] `DB_POOL_MAX` is configured appropriately for load
- [ ] `DB_CONNECTION_TIMEOUT` is set (5000ms recommended)
- [ ] `DB_STATEMENT_TIMEOUT` is set (30000ms recommended)
- [ ] Connection budget documented (see [CONNECTION_BUDGET.md](./CONNECTION_BUDGET.md))
- [ ] Pool metrics monitoring enabled

#### SSL/TLS
- [ ] `DB_SSL_REJECT_UNAUTHORIZED=true` in production
- [ ] Connection string uses `sslmode=require`
- [ ] Azure PostgreSQL configured with TLS 1.2+

#### Schema and Migrations
- [ ] `app` schema created (run `001_create_app_schema.sql`)
- [ ] Session table moved to `app` schema
- [ ] All application tables use `app` schema
- [ ] `search_path` set to `app, public`

#### Observability
- [ ] Health check endpoint accessible
- [ ] Pool metrics logged/exported
- [ ] Slow query alerts configured (>1s)
- [ ] Connection exhaustion alerts configured

#### High Availability
- [ ] Graceful shutdown tested
- [ ] Application tolerates database failover
- [ ] Retry logic tested with transient errors
- [ ] Connection draining verified

### 7. CORS Configuration

**Purpose:** Controls which origins can access the API.

**Configuration:** [apps/api/src/app.ts](../apps/api/src/app.ts)

**Settings:**
```typescript
cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true  // Allow cookies
})
```

**Production:**
```bash
# .env
CORS_ORIGIN=https://your-app.alberta.ca
```

**Important:** Only set `CORS_ORIGIN` to trusted domains. Never use `*` with `credentials: true`.

### 8. Authentication Security

**Purpose:** Secure authentication with multiple providers.

**Drivers implemented:**
- **Mock:** Development only (3 test users)
- **SAML 2.0:** External users (citizens, businesses)
- **MS Entra ID:** Internal users (government employees)

**Security features:**
- Pluggable driver architecture
- Session-based authentication
- Rate limiting on auth endpoints (5 attempts per 15 minutes)
- Secure session storage
- Role-based access control

**Configuration:**
```bash
# .env
AUTH_DRIVER=mock  # or saml, entra-id
AUTH_CALLBACK_URL=http://localhost:3000/api/v1/auth/callback

# SAML configuration
SAML_ENTRY_POINT=https://idp.example.com/saml/sso
SAML_ISSUER=urn:alberta:app:production
SAML_CERT={{YOUR_IDP_CERTIFICATE_BASE64}}

# Entra ID configuration
ENTRA_TENANT_ID=<tenant-id>
ENTRA_CLIENT_ID=<client-id>
ENTRA_CLIENT_SECRET=<client-secret>
```

## Security Configuration

### Environment Variables

Critical security environment variables:

```bash
# Core security
NODE_ENV=production
SESSION_SECRET=<32-character-minimum>
SESSION_STORE=postgres

# HTTPS enforcement
FORCE_HTTPS=true

# CORS
CORS_ORIGIN=https://your-app.alberta.ca

# Rate limiting
RATE_LIMIT_MAX=1000

# Authentication
AUTH_DRIVER=saml  # or entra-id
AUTH_CALLBACK_URL=https://your-app.alberta.ca/api/v1/auth/callback
```

### PostgreSQL Security

When using PostgreSQL session storage:

```bash
# Use SSL in production
DB_CONNECTION_STRING=postgresql://user:pass@host:5432/db?sslmode=require

# Or configure SSL options
DB_SSL_REJECT_UNAUTHORIZED=false  # Only for self-signed certs
```

### Secrets Management

**Never commit secrets to version control.**

**Recommended approaches:**
1. **Azure Key Vault** (for Azure deployments)
2. **Environment variables** (for container deployments)
3. **Secret management systems** (HashiCorp Vault, AWS Secrets Manager)

**Generate secure session secret:**
```bash
# Linux/macOS
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Security Checklist

Use this checklist before deploying to production:

### Application Security

- [ ] `NODE_ENV=production` is set
- [ ] `SESSION_SECRET` is 32+ characters and randomly generated
- [ ] `SESSION_STORE=postgres` is configured
- [ ] PostgreSQL connection uses SSL (`sslmode=require`)
- [ ] `DB_SSL_REJECT_UNAUTHORIZED=true` in production (certificate validation)
- [ ] Database connection pool properly configured (`DB_POOL_MAX`, `DB_CONNECTION_TIMEOUT`)
- [ ] Connection budget documented and verified (see [CONNECTION_BUDGET.md](./CONNECTION_BUDGET.md))
- [ ] `app` schema created and `search_path` configured
- [ ] Database health check endpoint accessible (`/api/v1/health`)
- [ ] `CORS_ORIGIN` is set to your production domain (not `*`)
- [ ] Rate limiting is enabled and configured appropriately
- [ ] CSRF protection is enabled
- [ ] All secrets are in environment variables (not in code)
- [ ] Error messages don't expose sensitive information
- [ ] Logging doesn't include PII

### Authentication & Authorization

- [ ] Production authentication driver is configured (`saml` or `entra-id`)
- [ ] Authentication callback URL uses HTTPS
- [ ] SAML/Entra ID credentials are securely stored
- [ ] Session cookies use `secure` flag (HTTPS only)
- [ ] Session cookies use `httpOnly` flag (no JavaScript access)
- [ ] Session timeout is appropriate (default: 24 hours)
- [ ] Role-based access control is implemented for protected endpoints

### Infrastructure

- [ ] HTTPS is enforced (no HTTP access)
- [ ] TLS 1.2+ is required
- [ ] Firewall rules restrict database access
- [ ] Database uses strong passwords
- [ ] Regular security updates are scheduled
- [ ] Monitoring and alerting is configured

### Code Security

- [ ] Dependencies are up to date (`npm audit`)
- [ ] No high/critical vulnerabilities in production dependencies
- [ ] Input validation is implemented on all endpoints
- [ ] SQL queries use parameterized queries (no string concatenation)
- [ ] File uploads (if any) are validated and sanitized
- [ ] API endpoints require authentication where appropriate

### Monitoring & Response

- [ ] Security event logging is enabled
- [ ] Failed authentication attempts are logged
- [ ] Rate limit violations are monitored
- [ ] Error tracking is configured (e.g., Sentry)
- [ ] Incident response plan is documented
- [ ] Security contact information is available

## Known Issues

### Development Dependencies

**Status:** 7 vulnerabilities (6 moderate, 1 critical) - **Development only**

```
esbuild <=0.24.2 (moderate)
- Issue: Development server can accept cross-origin requests
- Impact: Development environment only
- Mitigation: Don't expose development server to untrusted networks
- Resolution: Will be fixed in Vite 7.x (breaking change)

happy-dom <=19.0.2 (critical)
- Issue: RCE vulnerability in test environment
- Impact: Testing environment only
- Mitigation: Only run tests in secure CI/CD environment
- Resolution: Upgrade to happy-dom@20.4.0+ when testing Vitest compatibility
```

**Action required:**
```bash
# Upgrade when ready (may require code changes)
npm audit fix --force
```

**Important:** These vulnerabilities affect development and testing environments only. Production builds do not include these dependencies.

### Production Dependencies

**Status:** No vulnerabilities ✅

All production dependencies are secure and up to date.

## Security Updates

### Update Schedule

- **Critical vulnerabilities:** Patch immediately
- **High vulnerabilities:** Patch within 7 days
- **Moderate vulnerabilities:** Patch within 30 days
- **Low vulnerabilities:** Patch in next release cycle

### Update Process

1. **Check for updates:**
   ```bash
   npm audit
   npm outdated
   ```

2. **Review changes:**
   ```bash
   # Check what will be updated
   npm audit fix --dry-run
   ```

3. **Update dependencies:**
   ```bash
   # Auto-fix without breaking changes
   npm audit fix

   # Force update (may include breaking changes)
   npm audit fix --force
   ```

4. **Test thoroughly:**
   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

5. **Deploy and monitor**

### Monitoring for Vulnerabilities

**GitHub Dependabot:** Enable Dependabot security alerts in your repository settings.

**npm audit:** Run regularly in CI/CD pipeline.

**Snyk:** Consider integrating Snyk for continuous monitoring.

## Reporting Security Issues

If you discover a security vulnerability in this template:

1. **Do not create a public GitHub issue**
2. Email security details to your organization's security team
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

For issues with dependencies:
- Report to the dependency maintainers via their security policy
- Update to patched versions when available

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Vue.js Security](https://vuejs.org/guide/best-practices/security.html)
- [Alberta Government Security Standards](https://www.alberta.ca/information-security-classification)

---

**Last Updated:** January 30, 2026
**Template Version:** 1.0.0
**Security Audit:** Phase 6 Complete
