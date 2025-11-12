import { Request } from 'express'
import { Role } from '~/constants/database.enum'

export type ActionType = 'SERVER' | 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'UNKNOWN'

export type ResourceType = 'USER' | 'EMPLOYEE' | 'VOTE' | 'RATING' | 'AUTHENTICATION' | 'SYSTEM'

export type AuditStatusType = 'SUCCESS' | 'FAILURE'

export interface AuditLogPayload {
  actor: {
    userId?: string
    userRole?: Role
    ipAddress?: string
    userAgent?: string
  }
  action: ActionType
  resource: ResourceType
  resourceId?: string
  status: AuditStatusType
  details?: Record<string, any>
}

export interface LogData {
  actor: {
    userId?: string
    userRole?: Role
  }
  action: ActionType
  resource: ResourceType
  resourceId?: string
  status: AuditStatusType
  details?: Record<string, any>
  req?: Request
  error?: Error
}
