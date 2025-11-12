import { Router } from 'express'
import bachelorRouter from '~/modules/bachelor/bachelor.router'

const router = Router()

router.use('/bachelor', bachelorRouter)

export default router
