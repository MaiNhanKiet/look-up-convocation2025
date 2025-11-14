import axiosInstance from './axiosConfig'

// Interface cho thông tin sinh viên
export interface StudentSession {
  number: number
  checkin: string
  presentation: string
}

export interface StudentImages {
  led: string
  exhibit: string
}

export interface StudentData {
  studentId: string
  email: string
  fullName: string
  major: string
  faculty: string
  date: string
  hall: string
  session: StudentSession
  seat: string
  parentSeat: string
  images: StudentImages
}

export interface StudentResponse {
  success: boolean
  statusCode: number
  message: string
  data: StudentData
}

// Interface cho request tìm kiếm
export interface SearchRequest {
  query: string
  filters?: {
    category?: string
    dateRange?: {
      from?: string
      to?: string
    }
    [key: string]: any
  }
}

// Interface cho response tìm kiếm
export interface SearchResponse {
  success: boolean
  data: any[]
  total?: number
  message?: string
}

export interface MissingInformationRequest {
  email: string
  fullName: string
  phoneNumber: string
  note?: string
}

export interface MissingInformationResponse {
  success: boolean
  statusCode: number
  message: string
  data?: any
}

export const searchApi = {
  getStudentById: async (id: string): Promise<StudentResponse> => {
    const response = await axiosInstance.get<StudentResponse>(`/api/bachelor/${id}`)
    return response.data
  },
  sendRequestImage: async (data: { studentId: string; imageUrl: string; note: string }): Promise<StudentResponse> => {
    const response = await axiosInstance.post<StudentResponse>(`/api/bachelor/${data.studentId}/request-image`, {
      newImageUrl: data.imageUrl,
      note: data.note
    })
    return response.data
  },
  sendRequestInformation: async (
    studentId: string,
    data: { fullName: string; email: string; major: string; faculty: string; note?: string }
  ): Promise<MissingInformationResponse> => {
    const response = await axiosInstance.post<MissingInformationResponse>(
      `/api/bachelor/${studentId}/request-information`,
      data
    )
    return response.data
  },
  submitMissingInformation: async (
    studentId: string,
    data: MissingInformationRequest
  ): Promise<MissingInformationResponse> => {
    const response = await axiosInstance.post<MissingInformationResponse>(
      `/api/bachelor/${studentId}/missing-information`,
      data
    )
    return response.data
  }
}

export default searchApi
