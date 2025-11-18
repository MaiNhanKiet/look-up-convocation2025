import axiosInstance from './axiosConfig'

export type BachelorRequestStatus = 'pending' | 'approved' | 'rejected'
export type BachelorRequestType = 'image' | 'information' | 'other' | null

export interface BachelorRequestItem {
  _id: string
  studentId: string
  fullName: string
  newImage?: string | null
  note?: string | null
  status: BachelorRequestStatus | null
  type: BachelorRequestType
  createdAt: string | null
}

export interface PaginationMetadata {
  totalItems: number
  currentPage: number
  totalPages: number
  limit: number
}

export interface BachelorRequestResponse {
  success: boolean
  statusCode: number
  message: string
  data: BachelorRequestItem[]
  metadata?: PaginationMetadata
}

export interface GetRequestsParams {
  page: number
  limit: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  type?: 'image' | 'information' | 'other'
  status?: 'pending' | 'approved' | 'rejected'
}

export const adminApi = {
  getBachelorRequests: async (params: GetRequestsParams): Promise<BachelorRequestResponse> => {
    const { page, limit, ...rest } = params
    const queryParams: Record<string, any> = {
      page,
      limit
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value
      }
    })

    const response = await axiosInstance.post<BachelorRequestResponse>('/api/bachelor/requests', queryParams, {
      params: queryParams
    })
    return response.data
  },
  approveBachelorRequest: async (studentId: string, status: BachelorRequestStatus = 'approved') => {
    const response = await axiosInstance.put(`/api/bachelor/approve/${studentId}`, { status })
    return response.data
  }
}

export default adminApi

