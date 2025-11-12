import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus, ErrorDetail } from '~/models/Errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    // Nếu có lỗi, xử lý và định dạng lại chúng
    const errorObject = errors.mapped()
    const details: ErrorDetail[] = [] // Khởi tạo một mảng rỗng để chứa các lỗi chi tiết

    for (const key in errorObject) {
      const { msg } = errorObject[key]

      // Trường hợp đặc biệt: Nếu lỗi là một ErrorWithStatus khác (ví dụ: 404 Not Found),
      // thì ưu tiên gửi lỗi đó thay vì lỗi validation 422.
      if (msg instanceof ErrorWithStatus && msg.statusCode !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }

      // Thêm lỗi vào mảng details theo đúng format { field, message }
      details.push({
        field: key,
        message: msg
      })
    }

    const entityError = new EntityError({ details })
    next(entityError)
  }
}
