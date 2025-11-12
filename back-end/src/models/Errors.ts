import { ErrorName } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { SERVER_MESSAGES } from '~/constants/messages'

export type ErrorDetail = {
  field: string
  message: string
  [key: string]: any
}

export class ErrorWithStatus extends Error {
  statusCode: number
  name: string

  constructor({ statusCode, message, name }: { statusCode: number; message: string; name: string }) {
    super(message)
    this.statusCode = statusCode
    this.name = name
  }
}

export class EntityError extends ErrorWithStatus {
  details: ErrorDetail[]

  constructor({ message = SERVER_MESSAGES.VALIDATION_ERROR, details }: { message?: string; details: ErrorDetail[] }) {
    super({
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message,
      name: ErrorName.ValidationError
    })
    this.details = details
  }
}
