import express, { type Express, type Request, type Response, type NextFunction } from 'express'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.routes.js'
import { generalRateLimiter, createCustomRateLimiter } from './middleware/rate-limit.middleware.js'
import { csrfProtection, csrfTokenEndpoint } from './middleware/csrf.middleware.js'
import { devLogger, prodLogger, logError } from './middleware/logger.middleware.js'
import { createDatabasePool } from './config/database.config.js'
import { setupDbMetrics, checkDatabaseHealth, getPoolHealth } from './middleware/db-metrics.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PgSession = connectPgSimple(session)

export function createApp(): Express {
  const app = express()

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Required for GoA web components
            'https://cdn.jsdelivr.net', // GoA components CDN
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // Required for GoA web components
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false, // Required for GoA web components
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  )

  // CORS - must be before session to allow credentials
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  )

  // Rate limiting - apply based on environment
  const rateLimit = process.env.RATE_LIMIT_MAX
    ? createCustomRateLimiter(parseInt(process.env.RATE_LIMIT_MAX, 10))
    : generalRateLimiter
  app.use(rateLimit)

  // Request logging - sanitized to prevent PII exposure
  if (process.env.NODE_ENV === 'development') {
    app.use(devLogger)
  } else {
    app.use(prodLogger)
  }

  // Body parsers
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Database pool configuration (Azure PostgreSQL standard compliant)
  // Create pool only if using PostgreSQL session store
  let dbPool = null
  const sessionStore = process.env.SESSION_STORE === 'postgres'
    ? (() => {
        dbPool = createDatabasePool()

        // Setup metrics collection (every 30 seconds)
        if (process.env.NODE_ENV === 'production' || process.env.DB_ENABLE_METRICS === 'true') {
          setupDbMetrics(dbPool)
        }

        return new PgSession({
          pool: dbPool,
          tableName: 'session',
          schemaName: 'app', // Azure standard: use 'app' schema, not 'public'
          createTableIfMissing: false, // We create it via migration
        })
      })()
    : undefined // Use default memory store

  // Store pool reference for health checks and graceful shutdown
  if (dbPool) {
    app.set('dbPool', dbPool)
  }

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
      },
      name: 'connect.sid',
    })
  )

  // Log session store type
  console.log(`📦 Session store: ${process.env.SESSION_STORE || 'memory'}`)

  // CSRF protection - must be after session
  app.use(csrfProtection)

  // CSRF token endpoint
  app.get('/api/v1/csrf-token', csrfTokenEndpoint)

  // Health check endpoint with database connectivity check
  // Azure standard: Applications MUST expose a lightweight DB health check with short timeout
  app.get('/api/v1/health', async (_req: Request, res: Response) => {
    const pool = app.get('dbPool')
    let dbHealthy = true
    let dbStatus = 'not_configured'
    let poolHealth = null

    // Check database health if pool is configured
    if (pool && process.env.SESSION_STORE === 'postgres') {
      try {
        dbHealthy = await checkDatabaseHealth(pool, 2000) // 2 second timeout
        dbStatus = dbHealthy ? 'connected' : 'disconnected'

        // Get detailed pool statistics
        poolHealth = getPoolHealth(pool)
      } catch (error) {
        dbHealthy = false
        dbStatus = 'error'
        console.error('Health check database query failed:', error)
      }
    }

    // Overall status: degraded if database is unhealthy
    const overallStatus = dbHealthy ? 'healthy' : 'degraded'
    const statusCode = dbHealthy ? 200 : 503

    res.status(statusCode).json({
      success: dbHealthy,
      data: {
        status: overallStatus,
        database: dbStatus,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        pool: poolHealth
          ? {
              utilization: `${poolHealth.utilization}%`,
              connections: {
                total: poolHealth.stats.total,
                idle: poolHealth.stats.idle,
                active: poolHealth.stats.total - poolHealth.stats.idle,
                waiting: poolHealth.stats.waiting,
              },
              warnings: poolHealth.warnings,
            }
          : undefined,
      },
    })
  })

  // API info endpoint
  app.get('/api/v1/info', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        name: process.env.APP_NAME || 'Alberta Government Enterprise Template',
        version: 'v1',
        description: 'Enterprise-grade template with GoA Design System and dual authentication',
        features: {
          authentication: ['Mock', 'SAML 2.0', 'MS Entra ID'],
          security: ['Helmet CSP', 'CSRF Protection', 'Rate Limiting', 'Input Validation', 'Secure Logging'],
          design: 'Alberta Government Design System (GoA)',
        },
        endpoints: {
          health: '/api/v1/health',
          info: '/api/v1/info',
          csrfToken: '/api/v1/csrf-token',
          auth: '/api/v1/auth',
        },
      },
    })
  })

  // Auth routes
  app.use('/api/v1/auth', authRoutes)

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        message: 'Endpoint not found',
        code: 'NOT_FOUND',
      },
    })
  })

  // Global error handler
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    // Log error securely without PII
    logError(err, req)

    res.status(500).json({
      success: false,
      error: {
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    })
  })

  return app
}
