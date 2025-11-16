'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user')
    if (storedUser) {
      // router.push('/')
    }
  }, [router])

  const handleLoginSuccess = (response: any) => {
    const credential = response.credential
    console.log('Google credential:', credential)

    setIsLoading(true)

    try {
      const decoded: any = jwtDecode(credential)
      console.log('Decoded token:', decoded)

      sessionStorage.setItem('user', JSON.stringify(decoded))

      setTimeout(() => {
        setIsLoading(false)
        // router.push('/')
      }, 500)
    } catch (error) {
      console.error(error)
      setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại!')
      setIsLoading(false)
    }
  }

  const handleLoginError = () => {
    setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại!')
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
