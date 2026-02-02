import { config } from 'dotenv'
import { findUpSync } from 'find-up'
import { createApp } from './app.js'
import { closeDatabasePool } from './config/database.config.js'
import os from 'os'

// Load .env from monorepo root (automatically searches up directory tree)
// Production-safe: Only loads if .env file exists (Azure/OpenShift use platform env vars)
const envPath = findUpSync('.env')
if (envPath) {
  config({ path: envPath })
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const HOST = process.env.HOST || 'localhost'
const app = createApp()

// Get server URL based on environment
function getServerUrl(): string {
  // In production, use configured HOST or try to detect
  if (process.env.NODE_ENV === 'production') {
    // If HOST is set, use it
    if (process.env.HOST) {
      return `http://${process.env.HOST}:${PORT}`
    }
    // Otherwise, try to get hostname
    const hostname = os.hostname()
    return `http://${hostname}:${PORT}`
  }
  // In development, use localhost
  return `http://${HOST}:${PORT}`
}

const server = app.listen(PORT, () => {
  const serverUrl = getServerUrl()

  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🏥 Health check: ${serverUrl}/api/v1/health`)
  console.log(`📋 API info: ${serverUrl}/api/v1/info`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)

  // Show binding information
  const address = server.address()
  if (address && typeof address !== 'string') {
    console.log(`📡 Listening on: ${address.address}:${address.port}`)
  }
})

/**
 * Graceful shutdown handler
 *
 * Azure PostgreSQL Standard requirement:
 * - Applications MUST drain in-flight requests and close the pool on SIGTERM/SIGINT
 * - Kubernetes deployments MUST configure terminationGracePeriodSeconds appropriately
 */
let isShuttingDown = false

async function shutdown(signal: string) {
  // Prevent multiple shutdown attempts
  if (isShuttingDown) {
    console.log('⚠️  Shutdown already in progress...')
    return
  }
  isShuttingDown = true

  console.log(`\n📡 ${signal} received, starting graceful shutdown...`)

  // Force close after 10 seconds
  const forceShutdownTimer = setTimeout(() => {
    console.error('\n⚠️  Forced shutdown after 10 second timeout')
    process.exit(1)
  }, 10000)

  try {
    // Stop accepting new connections
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
    console.log('✅ HTTP server closed (no longer accepting connections)')

    // Drain database pool
    const pool = app.get('dbPool')
    if (pool) {
      console.log('🔌 Closing database pool...')
      await closeDatabasePool(pool)
      console.log('✅ Database pool closed')
      console.log('✅ Graceful shutdown complete')
    } else {
      console.log('✅ Graceful shutdown complete (no database pool)')
    }

    // Clear the force shutdown timer
    clearTimeout(forceShutdownTimer)

    // Exit cleanly
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error)
    clearTimeout(forceShutdownTimer)
    process.exit(1)
  }
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM').catch((error) => {
    console.error('Fatal error during SIGTERM handler:', error)
    process.exit(1)
  })
})

process.on('SIGINT', () => {
  shutdown('SIGINT').catch((error) => {
    console.error('Fatal error during SIGINT handler:', error)
    process.exit(1)
  })
})
