import axiosInstance from './axiosConfig'

export interface GoogleLoginResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    email: string
    token: string
  }
}

export const userApi = {
  googleLogin: async (googleToken: string): Promise<GoogleLoginResponse> => {
    const response = await axiosInstance.post<GoogleLoginResponse>('/api/user/google-login', {
      googleToken
    })
    return response.data
  }
}

export default userApi

