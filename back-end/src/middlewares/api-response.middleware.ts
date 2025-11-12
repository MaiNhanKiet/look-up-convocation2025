import { Request, Response, NextFunction } from 'express'

interface PaginationMetadata {
  totalItems: number
  currentPage: number
  totalPages: number
  limit: number
}

interface APIResponse {
  success: boolean
  statusCode: number
  message: string
  data: any
  metadata?: PaginationMetadata
}

export const syncResponseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.sendResponse = ({
    statusCode,
    message,
    data,
    metadata
  }: {
    statusCode: number
    message: string
    data: any
    metadata?: PaginationMetadata
  }) => {
    const responsePayload: APIResponse = {
      success: statusCode < 400,
      statusCode: statusCode,
      message,
      data: data || null
    }

    metadata && (responsePayload.metadata = metadata)

    res.status(statusCode).json(responsePayload)
  }

  next()
}
