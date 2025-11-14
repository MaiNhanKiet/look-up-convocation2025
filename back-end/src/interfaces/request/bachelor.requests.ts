import { ParsedQs } from 'qs'

export interface GetBachelorRequestQuery extends ParsedQs {
  studentId: string
}

export interface requestBody {
  newImageUrl: string
  note: string
}

export interface ApproveRequestBody {
  status: 'approved' | 'rejected'
}

export interface BachelorImportPayload {
  studentId: string
  fullName: string
  email: string
  major: string
  faculty: string
  date: string
  hall: string
  seat: string
  parentSeat: string
  session: {
    number: number
    checkin: string
    presentation: string
  }
  images: {
    led: string
    exhibit: string
  }
}

export interface MissingInformationBody {
  fullName: string
  email: string
  phoneNumber: string
  note: string
}