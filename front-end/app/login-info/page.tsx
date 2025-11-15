'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { motion, AnimatePresence } from 'framer-motion' // Thêm AnimatePresence
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // ----- PHẦN LOGIC 100% GIỮ NGUYÊN -----
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user')
    console.log('storedUser in sessionStorage:', storedUser)
  }, [])

  const handleLoginSuccess = async (response: any) => {
    const credential = response.credential
    setIsLoading(true)
    setErrorMessage('')
    try {
      const decoded: any = jwtDecode(credential)
      const res = await fetch(`/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Login API failed')
      }
      const data = await res.json()
      if (data.user) {
        sessionStorage.setItem('user', JSON.stringify(data.user))
      }
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      setIsLoading(false)
      router.push('/')
    } catch (err) {
      console.error(err)
      setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại!')
      setIsLoading(false)
    }
  }

  const handleLoginError = () => {
    setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại!')
  }
  // ----- KẾT THÚC PHẦN LOGIC -----

  return (
    <GoogleOAuthProvider
      clientId={
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        '1052891552814-iv7vp6gfuas961t7dr15rtid354uqa14.apps.googleusercontent.com'
      }
    >
      {/*
       * NỀN GRADIENT
       */}
      <div className='relative flex h-screen w-screen items-center justify-center overflow-hidden p-4'>
        {/* Nền sáng */}
        <motion.div
          className='absolute inset-0'
          animate={{
            background: [
              'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
              'linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fff7ed 100%)',
              'linear-gradient(135deg, #fed7aa 0%, #fff7ed 50%, #ffedd5 100%)',
              'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        {/* Nền dark mode */}
        <motion.div
          className='absolute inset-0 hidden dark:block'
          animate={{
            background: [
              'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
              'linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)',
              'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        {/*
         * THẺ CARD
         */}
        <div className='relative z-10 flex h-full w-full items-center justify-center'>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='w-full max-w-md'
          >
            <div className='rounded-lg border bg-card p-8 shadow-lg backdrop-blur-sm'>
              {/*
               * ⭐ UPDATE 1: GIẢM KHOẢNG CÁCH HEADER (mb-8 -> mb-4)
               * Sửa lỗi 'bg-gradient-to-r' -> 'bg-linear-to-r'
               */}
              <div className='mb-4 text-center space-y-2'>
                <h1 className='text-4xl pb-1 font-bold bg-linear-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2 tracking-tight'>
                  Đăng Nhập
                </h1>
                <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3'>
                  Lễ Tốt Nghiệp 2025
                </h2>
                <div className='h-px w-24 bg-linear-to-r from-transparent via-orange-400 to-transparent mx-auto' />
              </div>

              {/*
               * ⭐ UPDATE 2: GIẢM KHOẢNG CÁCH (space-y-6 -> space-y-4)
               */}
              <div className='space-y-4'>
                
                {/* Sửa lỗi cú pháp 'min-h-24px' -> 'min-h-[24px]' */}
                <div className='mt-2 min-h-24px flex justify-center'>
                  <AnimatePresence mode='wait'>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          x: [0, -2, 2, -2, 2, 0]
                        }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Badge variant='destructive' className='gap-2 rounded-md px-3 py-1.5'>
                          <motion.div
                            className='h-2 w-2 rounded-full bg-red-600 dark:bg-red-500'
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                          {errorMessage}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/*
                 * ⭐ UPDATE 3: BỎ PADDING 'pt-2' VÀ THÊM 'size="large"'
                 */}
                <div className=""> {/* Xóa 'pt-2' ở đây */}
                  {isLoading ? (
                    <Button
                      disabled
                      className='w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                      size='lg'
                    >
                      Đang đăng nhập...
                    </Button>
                  ) : (
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleLoginSuccess}
                        onError={handleLoginError}
                        size="large" // Thêm 'size="large"' để nút to hơn
                      />
                    </div>
                  )}
                </div>
              </div>

              {/*
               * FOOTER
               */}
              <div className='mt-8 text-center text-xs text-gray-500'>
                © 2025 Convocation Day
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}