/**
 * BaseAuthDriver - Abstract base class for authentication drivers
 *
 * All authentication drivers (SAML, Entra ID, Mock) must extend this class
 * and implement the required methods for login, callback, and logout flows.
 */

import type { Request, Response } from 'express'

export interface AuthUser {
  id: string
  email: string
  name: string
  roles?: string[]
  attributes?: Record<string, any>
}

export interface AuthConfig {
  callbackUrl: string
  [key: string]: any
}

export abstract class BaseAuthDriver {
  protected config: AuthConfig

  constructor(config: AuthConfig) {
    this.config = config
  }

  /**
   * Get the driver name (e.g., 'saml', 'entra-id', 'mock')
   */
  abstract getDriverName(): string

  /**
   * Initiate the login flow
   * - For SAML: redirect to IdP
   * - For Entra ID: redirect to Microsoft login
   * - For Mock: directly create session
   */
  abstract login(req: Request, res: Response): Promise<void>

  /**
   * Handle the callback from the identity provider
   * - Parse and validate the response
   * - Extract user information
   * - Create session
   */
  abstract callback(req: Request, res: Response): Promise<AuthUser>

  /**
   * Perform logout
   * - Destroy local session
   * - Optionally redirect to IdP logout
   */
  abstract logout(req: Request, res: Response): Promise<void>

  /**
   * Get the current authenticated user from the session
   */
  getUser(req: Request): AuthUser | null {
    return (req.session as any)?.user || null
  }

  /**
   * Save user to session
   */
  protected saveUserToSession(req: Request, user: AuthUser): void {
    ;(req.session as any).user = user
  }

  /**
   * Clear user from session
   */
  protected clearUserFromSession(req: Request): void {
    delete (req.session as any).user
  }

  /**
   * Validate that user has required role(s)
   */
  hasRole(user: AuthUser | null, role: string | string[]): boolean {
    if (!user || !user.roles) return false

    const requiredRoles = Array.isArray(role) ? role : [role]
    return requiredRoles.some((r) => user.roles?.includes(r))
  }
}
