import express from 'express'
import { googleLoginValidator } from './user.middleware'
import { wrapAsync } from '~/utils/handler'
import { googleLoginController } from './user.controller'

const userRouter = express.Router()

userRouter.post('/google-login', googleLoginValidator, wrapAsync(googleLoginController))
export default userRouter
