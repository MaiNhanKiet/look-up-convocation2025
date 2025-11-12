import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { ActionLog, AuditStatusLog, ErrorName, ResourceLog } from '~/constants/enum'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
import { logEvent } from '~/utils/logger'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // ================= AUDIT LOGGING =================
  try {
    const { auditContext } = req

    // Nếu request đã được đánh dấu context, sử dụng nó
    if (auditContext) {
      // logEvent({
      //   actor: { userId: req.decoded_authorization?.userId },
      //   action: auditContext.action,
      //   resource: auditContext.resource,
      //   resourceId: auditContext.resourceId,
      //   status: AuditStatusLog.Failure,
      //   req,
      //   error: err
      // })
    } else {
      // Fallback: Nếu không có context (ví dụ: lỗi ở middleware không được đánh dấu)
      // logEvent({
      //   actor: { userId: req.decoded_authorization?.userId },
      //   action: ActionLog.Unknown,
      //   resource: ResourceLog.System,
      //   status: AuditStatusLog.Failure,
      //   req,
      //   error: err
      // })
    }
  } catch (logError) {
    console.error('CRITICAL: Failed to write to audit log.', logError)
  }
  // ===============================================

  // 1. Nếu lỗi là EntityError (lỗi validation)
  if (err instanceof EntityError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      error: {
        name: err.name,
        details: err.details // details đã là một mảng từ class
      }
    })
  }

  // 2. Nếu là các lỗi có chủ đích khác (kế thừa từ ErrorWithStatus)
  if (err instanceof ErrorWithStatus) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      error: {
        name: err.name,
        // Các lỗi này thường không có details, trả về mảng rỗng cho nhất quán
        details: []
      }
    })
  }

  // 3. Nếu là các lỗi hệ thống không lường trước (lỗi 500)
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: 'An error occurred on the server side. Please try again later.',
    error: {
      name: ErrorName.InternalServerError,
      details: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
    }
  })
}
