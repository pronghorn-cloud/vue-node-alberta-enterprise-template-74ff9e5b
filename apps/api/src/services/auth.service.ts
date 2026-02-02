/**
 * Authentication Service
 *
 * Business logic for authentication operations
 */

import {
  BaseAuthDriver,
  MockAuthDriver,
  SamlAuthDriver,
  EntraIdAuthDriver,
  type AuthUser
} from '@template/auth'
import type { Request, Response } from 'express'

export class AuthService {
  private driver: BaseAuthDriver

  constructor() {
    // Initialize the appropriate driver based on environment
    const authDriver = process.env.AUTH_DRIVER || 'mock'

    switch (authDriver) {
      case 'mock':
        this.driver = new MockAuthDriver({
          callbackUrl: process.env.AUTH_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/callback'
        })
        break

      case 'saml':
        this.driver = new SamlAuthDriver({
          callbackUrl: process.env.AUTH_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/callback'
        })
        break

      case 'entra-id':
        this.driver = new EntraIdAuthDriver({
          callbackUrl: process.env.AUTH_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/callback'
        })
        break

      default:
        throw new Error(`Unsupported auth driver: ${authDriver}. Valid options: mock, saml, entra-id`)
    }
  }

  /**
   * Get the current driver
   */
  getDriver(): BaseAuthDriver {
    return this.driver
  }

  /**
   * Initiate login
   */
  async login(req: Request, res: Response): Promise<void> {
    return this.driver.login(req, res)
  }

  /**
   * Handle auth callback
   */
  async callback(req: Request, res: Response): Promise<AuthUser> {
    return this.driver.callback(req, res)
  }

  /**
   * Perform logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    return this.driver.logout(req, res)
  }

  /**
   * Get current user
   */
  getCurrentUser(req: Request): AuthUser | null {
    return this.driver.getUser(req)
  }

  /**
   * Check if user has role
   */
  hasRole(req: Request, role: string | string[]): boolean {
    const user = this.getCurrentUser(req)
    return this.driver.hasRole(user, role)
  }
}

// Singleton instance
export const authService = new AuthService()
