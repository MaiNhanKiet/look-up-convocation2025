'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { userApi } from '@/api'

type GoogleUserInfo = {
  email?: string
  name?: string
  picture?: string
  exp?: number
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user')
    if (storedUser) {
      router.replace('/dashboard')
    }
  }, [router])

  const handleLoginSuccess = async (response: CredentialResponse) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const credential = response.credential
      if (!credential) {
        throw new Error('Không nhận được mã xác thực từ Google')
      }

      const decoded = jwtDecode<GoogleUserInfo>(credential)
      if (!decoded?.email) {
        throw new Error('Không thể đọc thông tin tài khoản Google')
      }

      const apiResponse = await userApi.googleLogin(credential)

      const storedData = {
        profile: {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture
        },
        credential,
        token: apiResponse.data?.token
      }

      sessionStorage.setItem('user', JSON.stringify(storedData))
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Google login error:', error)
      const isUserNotFound = error?.response?.status === 404
      const backendMessage = error?.response?.data?.message
      const message =
        (isUserNotFound && 'Tài khoản Google này chưa được cấp quyền truy cập hệ thống') ||
        backendMessage ||
        error?.message ||
        'Đăng nhập thất bại. Vui lòng thử lại!'
      sessionStorage.removeItem('user')
      setErrorMessage(message)
      toast.error(message)
      router.replace('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginError = () => {
    setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại!')
    sessionStorage.removeItem('user')
    router.replace('/login')
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className='flex h-screen w-screen items-center justify-center p-4 bg-gradient-to-br from-orange-100 to-orange-200'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center'
        >
          <h1 className='text-3xl font-bold mb-4 text-orange-600'>Đăng nhập bằng Google</h1>
          <p className='text-gray-700 dark:text-gray-200 mb-6'>Sử dụng tài khoản Google để tiếp tục</p>

          {errorMessage && (
            <Badge variant='destructive' className='mb-4'>
              {errorMessage}
            </Badge>
          )}

          {isLoading ? (
            <Button disabled className='w-full'>
              Đang đăng nhập...
            </Button>
          ) : (
            <div className='flex justify-center'>
              <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
            </div>
          )}
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  )
}
