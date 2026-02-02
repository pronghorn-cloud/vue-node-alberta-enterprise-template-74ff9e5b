/**
 * Authentication Middleware
 *
 * Provides middleware functions for protecting routes and checking user roles
 */

import type { Request, Response, NextFunction } from 'express'
import type { AuthUser } from '@template/auth'

/**
 * Require authentication - user must be logged in
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as any)?.user as AuthUser | undefined

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        details: 'You must be logged in to access this resource'
      }
    })
  }

  // Attach user to request for easy access
  ;(req as any).user = user
  next()
}

/**
 * Require specific role(s)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req.session as any)?.user as AuthUser | undefined

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const userRoles = user.roles || []
    const hasRequiredRole = roles.some((role) => userRoles.includes(role))

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          details: `Required role(s): ${roles.join(', ')}`
        }
      })
    }

    ;(req as any).user = user
    next()
  }
}

/**
 * Optional authentication - doesn't fail if not authenticated
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as any)?.user as AuthUser | undefined

  if (user) {
    ;(req as any).user = user
  }

  next()
}
