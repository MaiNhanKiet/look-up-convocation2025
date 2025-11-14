import express from 'express'
import { approveValidator, bachelorValidator, missingInformationValidator, requestValidator } from './bachelor.middlware'
import { wrapAsync } from '~/utils/handler'
import { approveController, getBachelorController, missingInformationController, requestController } from './bachelor.controller'

const bachelorRouter = express.Router()
bachelorRouter.get('/:studentId', bachelorValidator, wrapAsync(getBachelorController))
bachelorRouter.post('/:studentId/request-image', requestValidator, wrapAsync(requestController))
bachelorRouter.post('/:studentId/missing-information', missingInformationValidator, wrapAsync(missingInformationController))
// bachelorRouter.put('/approve/:studentId', approveValidator, wrapAsync(approveController))

export default bachelorRouter