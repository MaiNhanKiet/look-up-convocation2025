import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response, NextFunction } from 'express'
import bachelorServices from './bachelor.service'
import {
  ApproveRequestBody,
  GetBachelorRequestQuery,
  MissingInformationBody,
  RequestBody,
  RequestInfoBody
} from '~/interfaces/request/bachelor.requests'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const getBachelorController = async (
  req: Request<ParamsDictionary, any, any, GetBachelorRequestQuery>,
  res: Response,
  next: NextFunction
) => {
  const { studentId } = req.params

  const data = await bachelorServices.findBachelorById(studentId)
  
  // Lấy email gốc từ dữ liệu
  const originalEmail: string = data?.email || ''; 
  let maskedEmail: string;

  // --- LOGIC CHE GIẤU EMAIL ---
  const atIndex = originalEmail.indexOf('@');

  if (atIndex > 0) {
    // Nếu tìm thấy '@', che giấu phần tên người dùng và giữ lại domain
    // Ví dụ: nguyenvana@fpt.edu.vn sẽ thành ***@fpt.edu.vn
    const domainPart = originalEmail.substring(atIndex); 
    maskedEmail = `***${domainPart}`; 
  } else {
    // Nếu không có email hoặc email không hợp lệ
    maskedEmail = 'KHÔNG CÓ EMAIL';
  }
  // -----------------------------

  // 1. Loại bỏ trường 'requests' khỏi dữ liệu gốc
  const responseData: any = omit(data, ['requests'])

  // 2. Ghi đè giá trị của trường email bằng email đã che giấu
  responseData.email = maskedEmail

  res.sendResponse({
    statusCode: 200,
    message: 'Lấy thông tin tân cử nhân thành công',
    data: responseData
  })
}

export const requestController = async (
  req: Request<ParamsDictionary, any, RequestBody, GetBachelorRequestQuery>,
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

export const missingInformationController = async (
  req: Request<ParamsDictionary, any, MissingInformationBody, GetBachelorRequestQuery>,
  res: Response,
  next: NextFunction
) => {
  const { studentId } = req.params
  const { fullName, email, phoneNumber, note } = req.body

  await bachelorServices.addMissingInformation({ studentId, fullName, email, phoneNumber, note })
  res.sendResponse({
    statusCode: 200,
    message: 'Đã gửi thông tin thành công',
    data: null
  })
}

export const requestInfoController = async (
  req: Request<ParamsDictionary, any, RequestInfoBody, GetBachelorRequestQuery>,
  res: Response,
  next: NextFunction
) => {
  const { studentId } = req.params
  const { fullName, email, note } = req.body

  await bachelorServices.addInfoRequest({ studentId, fullName, email, note })
  res.sendResponse({
    statusCode: 200,
    message: 'Đã gửi yêu cầu thành công',
    data: null
  })
}
