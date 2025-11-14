import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response, NextFunction } from 'express'
import userServices from './user.service'
import { TokenGoogleVerifyPayload } from '~/models/TokenPayoad'

export const googleLoginController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.decoded_google_verify_token as TokenGoogleVerifyPayload

  const data = await userServices.findUserByEmail(email)

  res.sendResponse({
    statusCode: 200,
    message: 'Đăng nhập thành công',
    data
  })
}
