import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { filter, validate } from '~/utils/validation'

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
            const regex = /^[HCSQD][ESA]\d{4,6}$/
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
          const regex = /^[HCSQD][ESA]\d{4,6}$/
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
          const regex = /^[HCSQD][ESA]\d{4,6}$/
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

export const missingInformationValidator = validate(
  checkSchema({
    studentId: {
      in: ['params'],
      notEmpty: {
        errorMessage: 'Mã số tân cử nhân bị bỏ trống'
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const regex = /^[HCSQD][ESA]\d{4,6}$/
          if (!regex.test(value)) {
            throw new Error('Mã số tân cử nhân không hợp lệ')
          }
        }
      }
    },
    fullName: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Tên tân cử nhân bị bỏ trống'
      },
      trim: true,
      isString: {
        errorMessage: 'Tên tân cử nhân phải là chuỗi'
      }
    },
    email: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Email bị bỏ trống'
      },
      trim: true,
      isEmail: {
        errorMessage: 'Email không hợp lệ'
      }
    },
    phoneNumber: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Số điện thoại bị bỏ trống'
      },
      trim: true,
      isString: {
        errorMessage: 'Số điện thoại phải là chuỗi'
      },
      custom: {
        options: (value) => {
          const phoneRegex = /^(0[35789]\d{8}|(\+?84)[35789]\d{8})$/

          if (!value || !phoneRegex.test(value)) {
            throw new Error('Số điện thoại không hợp lệ')
          }
          return true
        }
      }
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

export const requestInfoValidator = validate(
  checkSchema({
    studentId: {
      in: ['params'],
      notEmpty: {
        errorMessage: 'Mã số tân cử nhân bị bỏ trống'
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const regex = /^[HCSQD][ESA]\d{4,6}$/
          if (!regex.test(value)) {
            throw new Error('Mã số tân cử nhân không hợp lệ')
          }
        }
      }
    },
    fullName: {
      in: ['body'],
      optional: true,
      notEmpty: {
        errorMessage: 'Tên tân cử nhân bị bỏ trống'
      },
      trim: true,
      isString: {
        errorMessage: 'Tên tân cử nhân phải là chuỗi'
      }
    },
    email: {
      in: ['body'],
      optional: true,
      trim: true,
      isEmail: {
        errorMessage: 'Email không hợp lệ'
      }
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

export const getBachelorValidator = validate(
  checkSchema(
    {
      page: {
        notEmpty: {
          errorMessage: 'Trang là bắt buộc'
        },
        isInt: {
          options: { min: 1 },
          errorMessage: 'Trang phải là số nguyên dương'
        }
      },
      limit: {
        notEmpty: {
          errorMessage: 'Giới hạn là bắt buộc'
        },
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: 'Giới hạn phải là số nguyên dương và nhỏ hơn 100'
        }
      },
      sort: {
        optional: true,
        custom: {
          options: (value) => {
            const validOrders = ['']
            if (!validOrders.includes(value)) {
              //
            }
            return true
          }
        }
      },
      order: {
        optional: true,
        custom: {
          options: (value) => {
            const validOrders = ['asc', 'desc']
            if (!validOrders.includes(value)) {
              throw new Error('Thứ tự sắp xếp không hợp lệ')
            }
            return true
          }
        }
      },
      search: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: 'Từ khóa tìm kiếm phải là chuỗi ký tự'
        },
        isLength: {
          options: { max: 100 },
          errorMessage: 'Từ khóa tìm kiếm quá dài'
        }
      },
      major: {
        optional: true,
        ...filter(['CNTT', 'HTTT', 'KHMT', 'MTA', 'ANHT'], 'Chuyên ngành không hợp lệ')
      },
      faculty: {
        optional: true,
        ...filter(['CNPM', 'ATTT', 'KSTN', 'VT', 'DL'], 'Khối ngành không hợp lệ')
      },
      hall: {
        optional: true,
        ...filter(['A', 'B'], 'Hội trường không hợp lệ')
      },
      session: {
        optional: true,
        ...filter(['1', '2'], 'Phiên không hợp lệ')
      }
    },
    ['query']
  )
)

export const requestsValidator = validate(
  checkSchema(
    {
      page: {
        notEmpty: {
          errorMessage: 'Trang là bắt buộc'
        },
        isInt: {
          options: { min: 1 },
          errorMessage: 'Trang phải là số nguyên dương'
        }
      },
      limit: {
        notEmpty: {
          errorMessage: 'Giới hạn là bắt buộc'
        },
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: 'Giới hạn phải là số nguyên dương và nhỏ hơn 100'
        }
      },
      sort: {
        optional: true,
        custom: {
          options: (value) => {
            const validOrders = ['']
            if (!validOrders.includes(value)) {
              //
            }
            return true
          }
        }
      },
      order: {
        optional: true,
        custom: {
          options: (value) => {
            const validOrders = ['asc', 'desc']
            if (!validOrders.includes(value)) {
              throw new Error('Thứ tự sắp xếp không hợp lệ')
            }
            return true
          }
        }
      },
      search: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: 'Từ khóa tìm kiếm phải là chuỗi ký tự'
        },
        isLength: {
          options: { max: 100 },
          errorMessage: 'Từ khóa tìm kiếm quá dài'
        }
      }
    },
    ['query']
  )
)
