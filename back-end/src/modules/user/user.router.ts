import express from 'express'
import { googleLoginValidator } from './user.middleware'
import { wrapAsync } from '~/utils/handler'
import { googleLoginController } from './user.controller'

const userRouter = express.Router()

/**
 * @route POST /user/google-login
 * @description Đăng nhập bằng Google
 * @access Public
 */
userRouter.post('/google-login', googleLoginValidator, wrapAsync(googleLoginController))
export default userRouter
