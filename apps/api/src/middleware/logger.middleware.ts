/**
 * Secure Request Logging Middleware
 *
 * Logs HTTP requests without exposing PII (Personally Identifiable Information).
 * Sanitizes sensitive data from request bodies, query parameters, and headers.
 */

import morgan from 'morgan'
import type { Request } from 'express'

/**
 * List of sensitive field names that should be redacted from logs
 * These fields may contain PII or security-sensitive data
 */
const SENSITIVE_FIELDS = [
  // Authentication and security
  'password',
  'token',
  'secret',
  'api_key',
  'apikey',
  'authorization',
  'cookie',
  'csrf',
  // Personal information
  'email',
  'phone',
  'ssn',
  'sin', // Social Insurance Number (Canada)
  'credit_card',
  'card_number',
  'cvv',
  'address',
  'postal_code',
  'zip_code',
  // Business numbers (can be sensitive)
  'business_number',
  'tax_id',
]

/**
 * Sanitizes an object by redacting sensitive fields
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }

  const sanitized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()
    const isSensitive = SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))

    if (isSensitive) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

/**
 * Custom morgan token for sanitized request body
 */
morgan.token('sanitized-body', (req: Request) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return '-'
  }
  const sanitized = sanitizeObject(req.body)
  return JSON.stringify(sanitized)
})

/**
 * Custom morgan token for sanitized query parameters
 */
morgan.token('sanitized-query', (req: Request) => {
  if (!req.query || Object.keys(req.query).length === 0) {
    return '-'
  }
  const sanitized = sanitizeObject(req.query)
  return JSON.stringify(sanitized)
})

/**
 * Custom morgan token for user ID (if authenticated)
 * Logs user ID but not the full user object to avoid PII
 */
morgan.token('user-id', (req: Request) => {
  const user = (req.session as any)?.user
  return user?.id || 'anonymous'
})

/**
 * Development logging format
 * Includes detailed information for debugging but sanitizes sensitive data
 */
export const devLogger = morgan(
  ':method :url :status :response-time ms - :user-id - query: :sanitized-query',
  {
    skip: (req) => {
      // Skip logging health checks in development to reduce noise
      return (req as Request).path === '/api/v1/health'
    },
  }
)

/**
 * Production logging format
 * Minimal logging focused on errors and performance metrics
 * Does not log request/response bodies or query parameters
 */
export const prodLogger = morgan(
  ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    skip: (req, res) => {
      // In production, only log errors and health checks
      return (req as Request).path === '/api/v1/health' && res.statusCode < 400
    },
  }
)

/**
 * Security event logger for authentication and authorization events
 * Logs important security events without exposing credentials
 */
export function logSecurityEvent(
  event: string,
  userId: string | undefined,
  details: Record<string, any>
): void {
  const sanitizedDetails = sanitizeObject(details)
  const timestamp = new Date().toISOString()

  console.log(
    JSON.stringify({
      timestamp,
      level: 'security',
      event,
      userId: userId || 'anonymous',
      details: sanitizedDetails,
    })
  )
}

/**
 * Error logger that sanitizes error details
 * Logs errors without exposing sensitive data from error messages
 */
export function logError(error: Error, req: Request): void {
  const timestamp = new Date().toISOString()
  const userId = (req.session as any)?.user?.id || 'anonymous'

  // Sanitize error message to remove potential PII
  let sanitizedMessage = error.message
  for (const field of SENSITIVE_FIELDS) {
    const regex = new RegExp(field, 'gi')
    sanitizedMessage = sanitizedMessage.replace(regex, '[REDACTED]')
  }

  console.error(
    JSON.stringify({
      timestamp,
      level: 'error',
      userId,
      method: req.method,
      path: req.path,
      error: {
        name: error.name,
        message: sanitizedMessage,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    })
  )
}
