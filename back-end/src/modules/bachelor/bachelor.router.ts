import express from 'express'
import {
  approveValidator,
  bachelorValidator,
  missingInformationValidator,
  requestValidator
} from './bachelor.middlware'
import { wrapAsync } from '~/utils/handler'
import {
  approveController,
  getBachelorController,
  missingInformationController,
  requestController
} from './bachelor.controller'

const bachelorRouter = express.Router()
/**
 * @route GET /bachelor/:studentId
 * @description Lấy thông tin sinh viên làm luận văn
 * @access Public
 */
bachelorRouter.get('/:studentId', bachelorValidator, wrapAsync(getBachelorController))

/**
 * @route POST /bachelor/:studentId/request-image
 * @description Yêu cầu cấp lại ảnh tốt nghiệp
 * @access Public
 */
bachelorRouter.post('/:studentId/request-image', requestValidator, wrapAsync(requestController))

/**
 * @route POST /bachelor/:studentId/missing-information
 * @description Yêu cầu bổ sung thông tin luận văn
 * @access Public
 */
bachelorRouter.post(
  '/:studentId/missing-information',
  missingInformationValidator,
  wrapAsync(missingInformationController)
)

/**
 * @route PUT /bachelor/:studentId/approve
 * @description Duyệt thông tin thiếu của tân cửa nhân
 * @access Admin
 */
// bachelorRouter.put('/approve/:studentId', approveValidator, wrapAsync(approveController))

export default bachelorRouter
