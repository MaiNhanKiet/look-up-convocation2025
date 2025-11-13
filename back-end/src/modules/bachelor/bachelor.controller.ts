import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response, NextFunction } from 'express'
import bachelorServices from './bachelor.service'
import { ApproveRequestBody, GetBachelorRequestQuery, requestBody } from '~/interfaces/request/bachelor.requests'
import { omit } from 'lodash'

export const getBachelorController = async (
  req: Request<ParamsDictionary, any, any, GetBachelorRequestQuery>,
  res: Response,
  next: NextFunction
) => {
  const { studentId } = req.params

  const data = await bachelorServices.findBachelorById(studentId)
  res.sendResponse({
    statusCode: 200,
    message: 'Lấy thông tin tân cử nhân thành công',
    data: omit(data, ['requests'])
  })
}

export const requestController = async (
  req: Request<ParamsDictionary, any, requestBody, GetBachelorRequestQuery>,
  res: Response,
  next: NextFunction
) => {
  const { studentId } = req.params
  const { newImageUrl, note } = req.body

  await bachelorServices.addImageRequest({ studentId, newImageUrl, note })
  res.sendResponse({
    statusCode: 200,
    message: 'Đã gửi yêu cầu thành công',
    data: null
  })
}

export const approveController = async (
  req: Request<ParamsDictionary, any, ApproveRequestBody, GetBachelorRequestQuery>,
  res: Response,
  next: NextFunction
) => {
  const { studentId } = req.params
  const { status } = req.body

  await bachelorServices.approveRequest({ studentId, status })
  res.sendResponse({
    statusCode: 200,
    message: 'Cập nhật trạng thái yêu cầu thành công',
    data: null
  })
}
