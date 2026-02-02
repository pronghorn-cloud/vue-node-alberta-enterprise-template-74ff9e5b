# Architecture Documentation

## Overview

This enterprise template implements a **Backend-for-Frontend (BFF)** architecture pattern with a Vue.js 3 frontend and Express.js 5 backend, organized as an npm workspaces monorepo. The architecture is designed for Alberta Government applications requiring enterprise-grade security, dual authentication modes, and compliance with government standards.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Vue 3 + GoA Design System                    │  │
│  │  (Single Page Application - Port 5173)                │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/Fetch
                       │ (Session Cookies)
┌──────────────────────▼──────────────────────────────────────┐
│                   Express 5 API                              │
│               (Backend - Port 3000)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Security Layer (Helmet, CORS, Rate Limit, CSRF)       │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Session Management (PostgreSQL Store)                  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Authentication Layer (Driver Pattern)                  │ │
│  │   ├─ MockAuthDriver (local dev)                        │ │
│  │   ├─ SamlAuthDriver (external users)                   │ │
│  │   └─ EntraIdAuthDriver (internal users)                │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Business Logic (Controllers + Services)                │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              PostgreSQL Database                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ app.session         - User sessions                    │ │
│  │ app.users           - User profiles (optional)         │ │
│  │ app.audit_logs      - Audit trail (optional)           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. Backend-for-Frontend (BFF) Pattern

**Why**: All authentication flows are handled server-side to protect credentials and tokens.

**Benefits**:
- Secrets never exposed to browser
- Session management server-side
- IdP tokens never reach frontend
- Simplified frontend code
- CSRF protection easier to implement

**Implementation**:
- Browser redirects to `/api/v1/auth/login`
- Backend initiates OAuth/SAML flow with IdP
- IdP redirects back to backend `/api/v1/auth/callback`
- Backend validates response, creates session
- Backend redirects browser to frontend with session cookie
- Frontend calls `/api/v1/auth/me` to get user profile

### 2. Driver Pattern for Authentication

**Why**: Support multiple authentication providers without code duplication.

**Structure**:
```typescript
// packages/auth/src/drivers/base.driver.ts
export abstract class BaseAuthDriver {
  abstract login(req: Request, res: Response): Promise<void>
  abstract callback(req: Request, res: Response): Promise<UserProfile>
  abstract logout(req: Request, res: Response): Promise<void>
}

// Concrete implementations
- MockAuthDriver    // Simulates auth for local dev
- SamlAuthDriver    // SAML 2.0 for external users
- EntraIdAuthDriver // OpenID Connect for MS Entra ID
```

**Configuration**: Environment variable `AUTH_DRIVER` switches drivers at runtime.

### 3. Monorepo with Shared Packages

**Why**: Code reuse, type sharing, and workspace benefits.

**Structure**:
```
/
├── apps/
│   ├── web/           # Vue 3 frontend
│   └── api/           # Express backend
├── packages/
│   ├── shared/        # Types, interfaces, schemas
│   ├── config/        # Configuration validation
│   └── auth/          # Auth drivers and contracts
```

**Benefits**:
- Shared TypeScript types (no drift between frontend/backend)
- Single `npm install` for entire project
- Consistent tooling (ESLint, Prettier, TypeScript)
- Atomic commits across frontend + backend

### 4. Type-Safe Configuration

**Why**: Catch configuration errors at startup, not runtime.

**Implementation**:
```typescript
// packages/config/src/schemas/api.config.schema.ts
import { z } from 'zod'

export const ApiConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DB_CONNECTION_STRING: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  AUTH_DRIVER: z.enum(['mock', 'saml', 'entra-id']),
  // ... 50+ validated fields
})
```

**Usage**:
```typescript
// Fails fast if config invalid
const config = ApiConfigSchema.parse(process.env)
```

## Frontend Architecture (Vue 3)

### Component Hierarchy

```
App.vue
├── AppLayout.vue (layout wrapper)
│   ├── AppHeader.vue (GoA header with nav)
│   ├── <router-view> (page content)
│   └── AppFooter.vue (GoA footer)
│
└── Views (pages)
    ├── HomeView.vue
    ├── LoginView.vue
    ├── ProfileView.vue
    └── AboutView.vue
```

### GoA Design System Integration

**Package**: [@abgov/web-components](https://www.npmjs.com/package/@abgov/web-components)

**Configuration** (vite.config.ts):
```typescript
vue({
  template: {
    compilerOptions: {
      // Treat GoA tags as custom elements (don't compile as Vue components)
      isCustomElement: (tag) => tag.startsWith('goa-') || tag.startsWith('goab-')
    }
  }
})
```

**Wrapper Components** ([components/goa/](apps/web/src/components/goa/)):
```vue
<!-- GoabInput.vue - Adds v-model support to goa-input -->
<template>
  <goa-input
    :value="modelValue"
    @_change="handleChange"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const handleChange = (e: CustomEvent) => {
  emit('update:modelValue', e.detail.value)
}
</script>
```

**Type Definitions** ([types/goa-components.d.ts](apps/web/src/types/goa-components.d.ts)):
```typescript
declare module 'vue' {
  export interface GlobalComponents {
    'goa-button': DefineComponent<{ type?: 'primary' | 'secondary' }>
    'goa-input': DefineComponent<{ value?: string }>
    // ... all GoA components
  }
}
```

### State Management (Pinia)

**Auth Store** ([stores/auth.store.ts](apps/web/src/stores/auth.store.ts)):
```typescript
export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const loading = ref(false)

  // Fetch current user from API
  const fetchUser = async () => {
    const response = await fetch('/api/v1/auth/me')
    if (response.ok) {
      user.value = await response.json()
    }
  }

  // Logout and clear session
  const logout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, loading, fetchUser, logout }
})
```

### Routing and Guards

**Router Configuration** ([router/index.ts](apps/web/src/router/index.ts)):
```typescript
const router = createRouter({
  routes: [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    {
      path: '/profile',
      component: ProfileView,
      meta: { requiresAuth: true } // Protected route
    }
  ]
})

// Navigation guard
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.user) await auth.fetchUser()

  if (to.meta.requiresAuth && !auth.user) {
    return '/login' // Redirect to login
  }
})
```

## Backend Architecture (Express 5)

### Layered Architecture

```
Routes → Controllers → Services → Database
  ↓         ↓           ↓
Middleware  DTO         Schema
```

**Separation of Concerns**:
- **Routes** ([routes/](apps/api/src/routes/)): Define endpoints, apply middleware
- **Controllers** ([controllers/](apps/api/src/controllers/)): Handle HTTP (req/res), validation
- **Services** ([services/](apps/api/src/services/)): Business logic, database queries
- **Middleware** ([middleware/](apps/api/src/middleware/)): Cross-cutting concerns (auth, logging)

### Request Flow Example

```typescript
// 1. Route definition
app.get('/api/v1/auth/me', requireAuth, authController.getCurrentUser)

// 2. Middleware validates session
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// 3. Controller extracts data, calls service
async getCurrentUser(req, res) {
  try {
    const user = await authService.getUserById(req.session.user.id)
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// 4. Service queries database
async getUserById(id: string) {
  const result = await pool.query(
    'SELECT * FROM app.users WHERE id = $1',
    [id]
  )
  return result.rows[0]
}
```

### Security Middleware Stack

**Order matters!** Middleware executes sequentially:

```typescript
// 1. Helmet - Security headers (CSP, HSTS, etc.)
app.use(helmet({ /* GoA-specific CSP */ }))

// 2. CORS - Allow frontend origin only
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true // Allow cookies
}))

// 3. Rate Limiting - Prevent abuse
app.use(rateLimit({ max: 100, windowMs: 15 * 60 * 1000 }))

// 4. Request Logging - Audit trail (no PII)
app.use(morgan('combined'))

// 5. Body Parsers - JSON and URL-encoded
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 6. Session Management - PostgreSQL-backed
app.use(session({
  store: new PgSession({ pool: dbPool }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,  // HTTPS only in production
    httpOnly: true, // No JavaScript access
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// 7. CSRF Protection - Token-based
app.use(csrfProtection)
```

### Session Management

**Storage**: PostgreSQL (not in-memory, not Redis)

**Why PostgreSQL**:
- Already required for application data
- ACID guarantees
- No additional infrastructure
- Automatic session expiry via TTL
- Persistent across API restarts

**Schema** (managed by migration):
```sql
CREATE TABLE app.session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX idx_session_expire ON app.session (expire);
```

**Configuration**:
```typescript
const sessionStore = new PgSession({
  pool: dbPool,
  tableName: 'session',
  schemaName: 'app', // Not 'public' per Azure standards
  createTableIfMissing: false // Use migration instead
})
```

### Authentication Flow Implementation

**Login Endpoint** ([routes/auth.routes.ts:15](apps/api/src/routes/auth.routes.ts#L15)):
```typescript
router.get('/login', async (req, res) => {
  // AUTH_DRIVER env var determines which driver to use
  const driver = getAuthDriver() // mock | saml | entra-id
  await driver.login(req, res)
})
```

**Mock Driver** (local development):
```typescript
async login(req: Request, res: Response) {
  // Simulate user selection
  const userId = req.query.user || 'mock-user-1'
  const mockUser = { id: userId, name: 'Test User', email: 'test@alberta.ca' }

  // Create session
  req.session.user = mockUser

  // Redirect to frontend
  res.redirect(process.env.CORS_ORIGIN + '/')
}
```

**SAML Driver** (external users):
```typescript
async login(req: Request, res: Response) {
  // Passport-SAML generates redirect URL
  const samlRequest = samlStrategy.generateServiceProviderMetadata()
  res.redirect(`${config.SAML_ENTRY_POINT}?SAMLRequest=${samlRequest}`)
}

async callback(req: Request, res: Response) {
  // IdP POSTs SAML response to this endpoint
  const profile = await samlStrategy.validatePostResponse(req.body)

  // Extract user info from SAML attributes
  req.session.user = {
    id: profile.nameID,
    name: profile.displayName,
    email: profile.email,
    roles: profile.roles
  }

  res.redirect(process.env.CORS_ORIGIN + '/')
}
```

**Entra ID Driver** (internal users):
```typescript
async login(req: Request, res: Response) {
  // OpenID Connect discovery
  const authUrl = `${config.ENTRA_AUTHORITY}/oauth2/v2.0/authorize?` +
    `client_id=${config.ENTRA_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${config.AUTH_CALLBACK_URL}&` +
    `scope=openid%20profile%20email`

  res.redirect(authUrl)
}

async callback(req: Request, res: Response) {
  const code = req.query.code

  // Exchange code for tokens
  const tokenResponse = await fetch(`${config.ENTRA_AUTHORITY}/oauth2/v2.0/token`, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: config.ENTRA_CLIENT_ID,
      client_secret: config.ENTRA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.AUTH_CALLBACK_URL
    })
  })

  const tokens = await tokenResponse.json()

  // Decode JWT to get user claims
  const claims = decodeJWT(tokens.id_token)

  req.session.user = {
    id: claims.oid, // Azure AD object ID
    name: claims.name,
    email: claims.email,
    roles: claims.roles
  }

  res.redirect(process.env.CORS_ORIGIN + '/')
}
```

## Database Architecture

### Schema Organization

**Convention**: Use `app` schema (not `public`) per Azure PostgreSQL standards.

```sql
-- Session storage (managed by connect-pg-simple)
app.session

-- Application tables (examples)
app.users           -- User profiles
app.audit_logs      -- Audit trail
app.roles           -- Role definitions
app.permissions     -- RBAC permissions
```

### Connection Pooling

**Implementation** ([config/database.config.ts](apps/api/src/config/database.config.ts)):
```typescript
import { Pool } from 'pg'

export function createDatabasePool() {
  return new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
    max: 10,                     // Maximum connections
    min: 2,                      // Minimum idle connections
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: true }
      : false
  })
}
```

**Health Monitoring** ([middleware/db-metrics.middleware.ts](apps/api/src/middleware/db-metrics.middleware.ts)):
```typescript
export function getPoolHealth(pool: Pool) {
  const { totalCount, idleCount, waitingCount } = pool
  const utilization = Math.round((totalCount - idleCount) / pool.options.max * 100)

  return {
    total: totalCount,
    idle: idleCount,
    active: totalCount - idleCount,
    waiting: waitingCount,
    utilization: `${utilization}%`,
    warnings: utilization > 80 ? ['High utilization'] : []
  }
}
```

**Graceful Shutdown**:
```typescript
async function closeDatabasePool(pool: Pool) {
  await pool.end() // Wait for active queries to complete
}

process.on('SIGTERM', async () => {
  await closeDatabasePool(dbPool)
  process.exit(0)
})
```

## Configuration Management

### Environment Variables

**Loading Strategy** ([apps/api/src/server.ts:1-11](apps/api/src/server.ts#L1-L11)):
```typescript
import { findUpSync } from 'find-up'
import { config } from 'dotenv'

// Development: Load from .env file (monorepo root)
const envPath = findUpSync('.env')
if (envPath) {
  config({ path: envPath })
}

// Production: Use platform environment variables (Azure App Service, OpenShift)
// No .env file needed - platform injects variables directly
```

**Validation** ([packages/config/](packages/config/)):
```typescript
// Validate at startup
const config = ApiConfigSchema.parse(process.env)

// Type-safe access throughout codebase
const port = config.PORT // number, guaranteed valid
const dbUrl = config.DB_CONNECTION_STRING // string, guaranteed URL format
```

### Configuration Presets

**Local Development** (.env):
```bash
AUTH_DRIVER=mock
SESSION_STORE=postgres
LOG_LEVEL=debug
NODE_ENV=development
```

**Internal Deployment** (.env.internal.example):
```bash
AUTH_DRIVER=entra-id
ENTRA_TENANT_ID=...
ENTRA_CLIENT_ID=...
SESSION_STORE=postgres
NODE_ENV=production
```

**External Deployment** (.env.external.example):
```bash
AUTH_DRIVER=saml
SAML_ENTRY_POINT=...
SAML_ISSUER=...
SESSION_STORE=postgres
NODE_ENV=production
```

## Security Architecture

### Defense in Depth

**Layer 1: Network** (handled by platform)
- TLS/HTTPS termination
- Firewall rules
- DDoS protection

**Layer 2: Application Security**
- Helmet.js security headers
- CORS restrictions
- Rate limiting
- CSRF protection
- Input validation (Zod schemas)

**Layer 3: Authentication & Authorization**
- Session-based auth (not JWT in cookies)
- Role-based access control (RBAC)
- Secure session storage (PostgreSQL)
- Session fixation prevention

**Layer 4: Data Protection**
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding, CSP)
- Secrets in environment variables (not code)
- No PII in logs

### Content Security Policy (CSP)

**Challenge**: GoA web components require `unsafe-inline` for scripts/styles.

**Solution** ([apps/api/src/app.ts:19-45](apps/api/src/app.ts#L19-L45)):
```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for GoA components
        'https://cdn.jsdelivr.net' // GoA CDN
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for GoA components
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"], // API calls only to same origin
      frameSrc: ["'none'"], // No iframes
      objectSrc: ["'none'"] // No plugins
    }
  }
})
```

### CSRF Protection

**Implementation** ([middleware/csrf.middleware.ts](apps/api/src/middleware/csrf.middleware.ts)):
```typescript
import csrf from 'csrf'

const tokens = new csrf()

// Middleware to verify CSRF token
export function csrfProtection(req, res, next) {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // Verify token
  const token = req.headers['x-csrf-token']
  if (!tokens.verify(req.session.csrfSecret, token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }

  next()
}

// Endpoint to get CSRF token
export function csrfTokenEndpoint(req, res) {
  const secret = tokens.secretSync()
  const token = tokens.create(secret)
  req.session.csrfSecret = secret
  res.json({ token })
}
```

**Frontend Usage**:
```typescript
// Fetch CSRF token before mutations
const { token } = await fetch('/api/v1/csrf-token').then(r => r.json())

// Include in POST/PUT/DELETE requests
await fetch('/api/v1/resource', {
  method: 'POST',
  headers: { 'X-CSRF-Token': token },
  body: JSON.stringify(data)
})
```

## Error Handling

### Centralized Error Handler

```typescript
// Global error handler (must be last middleware)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error securely (no PII)
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  })

  // Sanitized response
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      code: 'INTERNAL_ERROR'
    }
  })
})
```

### Standardized Response Format

**Success**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [...]
  }
}
```

## Deployment Architecture

### Docker Multi-Stage Builds

**API Dockerfile** ([docker/api.Dockerfile](docker/api.Dockerfile)):
```dockerfile
# Stage 1: Dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --workspace=apps/api --workspace=packages/*

# Stage 2: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:api

# Stage 3: Production
FROM node:24-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 nodejs && adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health')"
CMD ["node", "dist/server.js"]
```

**Benefits**:
- Small final image (only production dependencies)
- Security (non-root user)
- Health checks (orchestrator integration)
- Layer caching (faster rebuilds)

### Platform-Agnostic Deployment

**Azure App Service**:
- Environment variables via Application Settings
- Managed PostgreSQL via Azure Database
- SSL certificates via App Service Certificates

**OpenShift**:
- Environment variables via ConfigMap/Secrets
- Managed PostgreSQL or CrunchyData operator
- Routes for ingress

**Docker Compose** (local/staging):
- Environment variables via .env file
- PostgreSQL container
- Nginx reverse proxy

## Performance Considerations

### Frontend Optimization

- **Code Splitting**: Dynamic imports for routes
- **Lazy Loading**: Components loaded on demand
- **Tree Shaking**: Unused code removed by Vite
- **CDN**: GoA components served from jsdelivr CDN

### Backend Optimization

- **Connection Pooling**: Reuse database connections
- **Query Optimization**: Indexes on frequently queried columns
- **Compression**: gzip/brotli for responses
- **Caching**: Session data in PostgreSQL (indexed)

### Database Optimization

- **Indexes**: Session expiry, user lookups
- **Query Timeouts**: Prevent long-running queries (5s limit)
- **Slow Query Logging**: Identify bottlenecks in development
- **Connection Limits**: Max 10 connections per API instance

## Monitoring and Observability

### Health Checks

**API Health Endpoint** ([apps/api/src/app.ts:126-173](apps/api/src/app.ts#L126-L173)):
```typescript
app.get('/api/v1/health', async (req, res) => {
  // Check database connectivity
  const dbHealthy = await checkDatabaseHealth(pool, 2000)

  // Get pool statistics
  const poolHealth = getPoolHealth(pool)

  res.status(dbHealthy ? 200 : 503).json({
    success: dbHealthy,
    data: {
      status: dbHealthy ? 'healthy' : 'degraded',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      pool: {
        utilization: poolHealth.utilization,
        connections: {
          total: poolHealth.stats.total,
          idle: poolHealth.stats.idle,
          active: poolHealth.stats.total - poolHealth.stats.idle
        },
        warnings: poolHealth.warnings
      }
    }
  })
})
```

### Request Logging

**Morgan Configuration** ([middleware/logger.middleware.ts](apps/api/src/middleware/logger.middleware.ts)):
```typescript
// Development: Verbose logging
export const devLogger = morgan('dev')

// Production: Structured JSON logs (no PII)
export const prodLogger = morgan((tokens, req, res) => {
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res), // Sanitized (no query params with PII)
    status: tokens.status(req, res),
    responseTime: tokens['response-time'](req, res),
    userAgent: tokens['user-agent'](req, res),
    timestamp: new Date().toISOString()
  })
})
```

## Testing Strategy

See [TESTING.md](TESTING.md) for comprehensive testing documentation.

**Summary**:
- **Unit Tests**: Vitest for services and utilities
- **Integration Tests**: Supertest for API endpoints
- **E2E Tests**: Playwright for full user flows
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint + Prettier

## Future Enhancements

### Potential Additions

1. **Audit Logging**: Track all user actions for compliance
2. **RBAC**: Role-based access control with database-backed permissions
3. **Multi-Factor Authentication**: TOTP or SMS-based 2FA
4. **API Versioning**: `/api/v2` for breaking changes
5. **Rate Limiting per User**: Track by user ID instead of IP
6. **Job Queue**: Background processing with Bull or Agenda
7. **Caching Layer**: Redis for frequently accessed data
8. **Metrics**: Prometheus + Grafana dashboards
9. **Distributed Tracing**: OpenTelemetry integration

### Scalability Considerations

**Current Template**: Suitable for low-to-medium traffic (< 10k daily active users)

**Scaling Up**:
- Horizontal scaling: Multiple API instances behind load balancer
- Database read replicas: Separate read/write workloads
- Session store migration: Redis if PostgreSQL sessions become bottleneck
- CDN: Static assets served from edge locations

## References

- [GoA Design System](https://design.alberta.ca/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Express 5 Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Last Updated**: 2026-01-30
