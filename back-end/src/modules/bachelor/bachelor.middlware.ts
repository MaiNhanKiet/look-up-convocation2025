import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { AUTH_MESSAGES } from '~/constants/messages'
import { verifyGoogleToken } from '~/utils/handler'
import { validate } from '~/utils/validation'

export const bachelorValidator = validate(
  checkSchema(
    {
      studentId: {
        notEmpty: {
          errorMessage: 'Student ID is required'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const regex = /^[HCSQD][ESA]\d{6}$/
            if (!regex.test(value)) {
              throw new Error('Student ID is invalid')
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
        errorMessage: 'Student ID is required'
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const regex = /^[HCSQD][ESA]\d{6}$/
          if (!regex.test(value)) {
            throw new Error('Student ID is invalid')
          }
        }
      }
    },
    newImageUrl: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'New image URL is required'
      },
      isURL: {
        errorMessage: 'New image URL must be a valid URL'
      },
      trim: true
    },
    note: {
      in: ['body'],
      optional: true,
      trim: true,
      isString: {
        errorMessage: 'Note must be a string'
      },
      isLength: {
        options: { max: 500 },
        errorMessage: 'Note must be at most 500 characters long'
      }
    }
  })
)

export const approveValidator = validate(
  checkSchema({
    studentId: {
      in: ['params'],
      notEmpty: {
        errorMessage: 'Student ID is required'
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const regex = /^[HCSQD][ESA]\d{6}$/
          if (!regex.test(value)) {
            throw new Error('Student ID is invalid')
          }
        }
      }
    },
    status: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: 'Status is required'
      },
      isString: {
        errorMessage: 'Status must be a string'
      },
      custom: {
        options: async (value, { req }) => {
          const validStatuses = ['approved', 'rejected']
          if (!validStatuses.includes(value)) {
            throw new Error('Status must be either approved or rejected')
          }
        }
      }
    }
  })
)
