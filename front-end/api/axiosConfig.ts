import axios from 'axios'
// 'https://api.srofptuhcm.com/'
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response
//   },
//   (error) => {
//     // Xử lý lỗi chung
//     if (error.response) {
//       // Server trả về lỗi
//       console.error('API Error:', error.response.data)
//     } else if (error.request) {
//       // Request được gửi nhưng không nhận được response
//       console.error('Network Error:', error.request)
//     } else {
//       // Lỗi khác
//       console.error('Error:', error.message)
//     }
//     return Promise.reject(error)
//   }
// )

export default axiosInstance
