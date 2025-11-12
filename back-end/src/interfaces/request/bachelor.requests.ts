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
