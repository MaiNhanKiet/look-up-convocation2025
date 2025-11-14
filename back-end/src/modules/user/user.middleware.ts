import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { Request } from 'express'
import { capitalize } from 'lodash'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
import { verifyGoogleToken } from '~/utils/handler'

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: 'Token không được để trống'
        },
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]

            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                statusCode: 401,
                message: capitalize((error as JsonWebTokenError).message),
                name: 'UnauthorizedError'
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const googleLoginValidator = validate(
  checkSchema(
    {
      googleToken: {
        notEmpty: {
          errorMessage: 'Google ID Token không được để trống'
        },
        isString: {
          errorMessage: 'Google ID Token phải là một chuỗi'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const payload = await verifyGoogleToken(value)
            ;(req as Request).decoded_google_verify_token = payload
            return true
          }
        }
      }
    },
    ['body']
  )
)
