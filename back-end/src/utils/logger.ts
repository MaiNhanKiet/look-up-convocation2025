// src/utils/logger.util.ts

import auditLogger from '~/config/logger.config'
import { AuditStatusLog } from '~/constants/enum'
import { AuditLogPayload, LogData } from '~/interfaces/logger.interface'
import { EntityError } from '~/models/Errors' // 1. Import class EntityError

export const logEvent = (data: LogData) => {
  const { actor, action, resource, resourceId, status, details, req, error } = data

  const logPayload: Partial<AuditLogPayload> = {
    actor: {
      userId: actor.userId ?? undefined,
      userRole: actor.userRole ?? undefined,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent')
    },
    action,
    resource,
    resourceId,
    status,
    details: details || {}
  }
  if (error) {
    logPayload.details!.error = {
      name: error.name,
      message: error.message
    }
  }

  const message = `${resource} ${action} ${status}`

  if (status === AuditStatusLog.Failure) {
    if (error instanceof EntityError) {
      auditLogger.warn(message, logPayload)
    } else {
      auditLogger.error(message, logPayload)
    }
  } else {
    auditLogger.info(message, logPayload)
  }
}
