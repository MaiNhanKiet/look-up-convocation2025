import { Router } from 'express'
import bachelorRouter from '~/modules/bachelor/bachelor.router'
import userRouter from '~/modules/user/user.router'

const router = Router()

router.use('/bachelor', bachelorRouter)
router.use('/user', userRouter)

export default router
