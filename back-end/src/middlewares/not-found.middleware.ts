import { Request, Response } from 'express'
import { ErrorName } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const notFoundMiddleware = (req: Request, res: Response) => {
  throw new ErrorWithStatus({
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Endpoint '${req.originalUrl}' not found.`,
    name: ErrorName.NotFoundError
  })
}
