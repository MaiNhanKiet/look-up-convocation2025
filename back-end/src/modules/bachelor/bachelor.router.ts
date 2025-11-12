import express from 'express'
import { approveValidator, bachelorValidator, requestValidator } from './bachelor.middlware'
import { wrapAsync } from '~/utils/handler'
import { approveController, getBachelorController, requestController } from './bachelor.controller'

const bachelorRouter = express.Router()

bachelorRouter.get('/:studentId', bachelorValidator, wrapAsync(getBachelorController))
bachelorRouter.post('/:studentId/request-image', requestValidator, wrapAsync(requestController))
bachelorRouter.put('/approve/:studentId', approveValidator, wrapAsync(approveController))

export default bachelorRouter
