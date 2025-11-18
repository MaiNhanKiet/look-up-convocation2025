// Export tất cả các API
export { default as axiosInstance } from './axiosConfig'
export { default as searchApi } from './searchApi'
export { default as adminApi } from './adminApi'
export { default as userApi } from './userApi'
export type {
  SearchRequest,
  SearchResponse,
  StudentSession,
  StudentImages,
  StudentData,
  StudentResponse
} from './searchApi'
export type {
  BachelorRequestItem,
  BachelorRequestResponse,
  GetRequestsParams,
  PaginationMetadata,
  BachelorRequestStatus,
  BachelorRequestType
} from './adminApi'
export type { GoogleLoginResponse } from './userApi'
