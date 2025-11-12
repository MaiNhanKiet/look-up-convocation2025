import { Request, Response, NextFunction, RequestHandler } from 'express'
import googleClient from '~/config/google.config'
import dotenv from 'dotenv'
import { TokenGoogleVerifyPayload } from '~/models/TokenPayoad'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { AUTH_MESSAGES } from '~/constants/messages'
import { ErrorName } from '~/constants/enum'
dotenv.config()

export const wrapAsync = <P, T>(func: RequestHandler<P, any, any, T>) => {
  return async (req: Request<P, any, any, T>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export const verifyGoogleToken = async (token: string): Promise<TokenGoogleVerifyPayload> => {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  if (!ticket) {
    throw new ErrorWithStatus({
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: AUTH_MESSAGES.ID_TOKEN_IS_INVALID,
      name: ErrorName.Unauthenticated
    })
  }
  const { sub, name, email, picture, iat, exp } = ticket.getPayload() as any
  return { sub, name, email, picture, iat, exp } as TokenGoogleVerifyPayload
}
