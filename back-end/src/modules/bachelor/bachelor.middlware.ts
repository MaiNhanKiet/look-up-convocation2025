import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const bachelorValidator = validate(
  checkSchema(
    {
      studentId: {
        notEmpty: {
          errorMessage: 'Mã số tân cử nhân bị bỏ trống'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const regex = /^[HCSQD][ESA]\d{6}$/
            if (!regex.test(value)) {
              throw new Error('Mã số tân cử nhân không hợp lệ')
            }
          }
        }
      }
    },
    ['params']
  )
)

export const requestValidator = validate(
  checkSchema({
    studentId: {
      in: ['params'],
      notEmpty: {
        errorMessage: 'Mã số tân cử nhân bị bỏ trống'
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const regex = /^[HCSQD][ESA]\d{6}$/
          if (!regex.test(value)) {
            throw new Error('Mã số tân cử nhân không hợp lệ')
          }
        }
      }
    },
    newImageUrl: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Link ảnh mới bị bỏ trống'
      },
      isURL: {
        errorMessage: 'Link ảnh mới không hợp lệ'
      },
      trim: true
    },
    note: {
      in: ['body'],
      optional: true,
      trim: true,
      isString: {
        errorMessage: 'Ghi chú phải là chuỗi ký tự'
      },
      isLength: {
        options: { max: 500 },
        errorMessage: 'Ghi chú quá dài'
      }
    }
  })
)

export const approveValidator = validate(
  checkSchema({
    studentId: {
      in: ['params'],
      notEmpty: {
        errorMessage: 'Mã số tân cử nhân bị bỏ trống'
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const regex = /^[HCSQD][ESA]\d{6}$/
          if (!regex.test(value)) {
            throw new Error('Mã số tân cử nhân không hợp lệ')
          }
        }
      }
    },
    status: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: 'Trạng thái bị bỏ trống'
      },
      isString: {
        errorMessage: 'Trạng thái phải là chuỗi'
      },
      custom: {
        options: async (value, { req }) => {
          const validStatuses = ['approved', 'rejected']
          if (!validStatuses.includes(value)) {
            throw new Error('Trạng thái sai định dạng')
          }
        }
      }
    }
  })
)
