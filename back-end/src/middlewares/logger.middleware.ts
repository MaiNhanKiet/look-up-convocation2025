// src/middlewares/audit.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { ActionType, ResourceType } from '~/interfaces/logger.interface'

export const trackAction =
  ({ action, resource }: { action: ActionType; resource: ResourceType }) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.auditContext = {
      action,
      resource,
      resourceId: req.params.id || req.params.userId || req.decoded_authorization?.userId
    }
    next()
  }
