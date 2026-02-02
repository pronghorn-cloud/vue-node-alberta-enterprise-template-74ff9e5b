/**
 * API Configuration Schema
 *
 * Validates all environment variables required for the API application
 * Uses Zod for runtime validation and TypeScript type inference
 */

import { z } from 'zod'

/**
 * Node environment
 */
const nodeEnvSchema = z.enum(['development', 'production', 'test']).default('development')

/**
 * Authentication driver
 */
const authDriverSchema = z.enum(['mock', 'saml', 'entra-id']).default('mock')

/**
 * Session store type
 */
const sessionStoreSchema = z.enum(['memory', 'postgres']).default('postgres')

/**
 * Log level
 */
const logLevelSchema = z.enum(['error', 'warn', 'info', 'debug']).default('info')

/**
 * Log format
 */
const logFormatSchema = z.enum(['combined', 'common', 'dev', 'short', 'tiny']).default('dev')

/**
 * Complete API Configuration Schema
 *
 * Covers 50+ environment variables for:
 * - Application settings
 * - Database connection
 * - Session management
 * - Authentication (Mock, SAML, Entra ID)
 * - Security settings
 * - Logging
 */
export const apiConfigSchema = z.object({
  // Application
  NODE_ENV: nodeEnvSchema,
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_NAME: z.string().default('Alberta Government Enterprise Template'),

  // Database
  DB_CONNECTION_STRING: z.string().url().describe('PostgreSQL connection string'),
  DB_POOL_MIN: z.coerce.number().int().min(0).default(2),
  DB_POOL_MAX: z.coerce.number().int().min(1).default(10),
  DB_IDLE_TIMEOUT: z.coerce.number().int().min(0).default(30000),
  DB_CONNECTION_TIMEOUT: z.coerce.number().int().min(0).default(5000),
  DB_SSL: z.enum(['true', 'false']).transform((val) => val === 'true').default('false'),

  // Session Management
  SESSION_SECRET: z.string().min(32).describe('Secret key for session encryption (min 32 characters)'),
  SESSION_STORE: sessionStoreSchema,
  SESSION_MAX_AGE: z.coerce.number().int().min(60000).default(86400000), // 24 hours default
  SESSION_COOKIE_SECURE: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  SESSION_COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  SESSION_COOKIE_NAME: z.string().default('connect.sid'),

  // Authentication - General
  AUTH_DRIVER: authDriverSchema,
  AUTH_CALLBACK_URL: z.string().url().describe('Authentication callback URL'),

  // Authentication - SAML
  SAML_ENTRY_POINT: z.string().url().optional().describe('SAML IdP SSO URL'),
  SAML_ISSUER: z.string().optional().describe('SAML Service Provider Entity ID'),
  SAML_CERT: z.string().optional().describe('SAML IdP X.509 Certificate (PEM format)'),
  SAML_PRIVATE_KEY: z.string().optional().describe('SAML SP Private Key (PEM format)'),
  SAML_CERT_SP: z.string().optional().describe('SAML SP Certificate (PEM format)'),
  SAML_PROTOCOL: z.string().default('saml2'),
  SAML_SIGN_REQUESTS: z.enum(['true', 'false']).transform((val) => val === 'true').default('false'),
  SAML_WANT_ASSERTIONS_SIGNED: z.enum(['true', 'false']).transform((val) => val === 'true').default('true'),
  SAML_FORCE_AUTHN: z.enum(['true', 'false']).transform((val) => val === 'true').default('false'),
  SAML_NAME_ID_FORMAT: z.string().default('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'),
  SAML_ATTRIBUTE_ID: z.string().default('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'),
  SAML_ATTRIBUTE_EMAIL: z.string().default('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'),
  SAML_ATTRIBUTE_NAME: z.string().default('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'),
  SAML_ATTRIBUTE_FIRST_NAME: z.string().default('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'),
  SAML_ATTRIBUTE_LAST_NAME: z.string().default('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'),
  SAML_ATTRIBUTE_ROLES: z.string().default('http://schemas.microsoft.com/ws/2008/06/identity/claims/role'),
  SAML_DEFAULT_ROLE: z.string().optional().describe('Default role if no roles in SAML assertion'),
  SAML_LOGOUT_URL: z.string().url().optional().describe('SAML Single Logout URL'),
  SAML_LOGOUT_CALLBACK_URL: z.string().url().optional().describe('SAML Logout Callback URL'),

  // Authentication - Microsoft Entra ID
  ENTRA_TENANT_ID: z.string().uuid().optional().describe('Azure AD Tenant ID'),
  ENTRA_CLIENT_ID: z.string().uuid().optional().describe('Azure AD Application (client) ID'),
  ENTRA_CLIENT_SECRET: z.string().optional().describe('Azure AD Client Secret'),
  ENTRA_AUTHORITY: z.string().url().optional().describe('Azure AD Authority URL'),
  ENTRA_SCOPE: z.string().default('openid profile email'),
  ENTRA_RESPONSE_TYPE: z.string().default('code'),
  ENTRA_RESPONSE_MODE: z.string().default('query'),
  ENTRA_DEFAULT_ROLE: z.string().optional().describe('Default role for Entra ID users'),
  ENTRA_LOGOUT_URL: z.string().url().optional().describe('Entra ID Logout URL'),
  ENTRA_POST_LOGOUT_REDIRECT_URI: z.string().url().optional().describe('Post-logout redirect URI'),

  // Frontend
  WEB_URL: z.string().url().describe('Frontend application URL'),

  // CORS
  CORS_ORIGIN: z.string().describe('CORS allowed origin (should match WEB_URL)'),
  CORS_CREDENTIALS: z.enum(['true', 'false']).transform((val) => val === 'true').default('true'),

  // Security
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(1000).describe('Max requests per 15 minutes per IP'),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(10).describe('Max auth requests per 15 minutes'),
  HELMET_CSP: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),

  // Logging
  LOG_LEVEL: logLevelSchema,
  LOG_FORMAT: logFormatSchema,
  LOG_PII: z.enum(['true', 'false']).transform((val) => val === 'true').default('false').describe('Log personally identifiable information (not recommended for production)'),

  // Feature Flags (optional)
  FEATURE_ANALYTICS: z.enum(['true', 'false']).transform((val) => val === 'true').default('true'),
  FEATURE_HEALTH_CHECK: z.enum(['true', 'false']).transform((val) => val === 'true').default('true'),
})

/**
 * Inferred TypeScript type from schema
 */
export type ApiConfig = z.infer<typeof apiConfigSchema>

/**
 * Parse and validate API configuration
 *
 * @param env - Environment variables (defaults to process.env)
 * @returns Validated and type-safe configuration
 * @throws ZodError if validation fails
 */
export function parseApiConfig(env: Record<string, string | undefined> = process.env): ApiConfig {
  return apiConfigSchema.parse(env)
}

/**
 * Safe parse API configuration (returns result object instead of throwing)
 *
 * @param env - Environment variables (defaults to process.env)
 * @returns Success result with data or error result with issues
 */
export function safeParseApiConfig(env: Record<string, string | undefined> = process.env) {
  return apiConfigSchema.safeParse(env)
}
