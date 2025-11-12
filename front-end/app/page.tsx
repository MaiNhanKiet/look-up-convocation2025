'use client'

import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { searchApi } from '@/api'

type FormData = {
  mssv: string
}

export default function Home() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const form = useForm<FormData>({
    defaultValues: { mssv: '' },
    mode: 'onChange',
  })

  const mssvValue = form.watch('mssv')
  const mssvError = form.formState.errors.mssv

  const validateMSSV = (value: string) => {
    const pattern = /^[SHCQD][ESA]\d{6}$/
    if (!value || value.trim() === '') return 'Vui lòng nhập MSSV'
    const upperValue = value.toUpperCase()
    if (!pattern.test(upperValue)) return 'MSSV sai định dạng'
    return true
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await searchApi.getStudentById(data.mssv)
      sessionStorage.setItem('studentData', JSON.stringify(response.data))
      router.push('/student-info')
    } catch (error: any) {
      setErrorMessage('Không tìm thấy thông tin sinh viên')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidMSSV = () => {
    if (!mssvValue) return false
    const pattern = /^[SHCQD][ESA]\d{6}$/
    return pattern.test(mssvValue.toUpperCase())
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden p-4">
      {/* Nền sáng */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
            'linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fff7ed 100%)',
            'linear-gradient(135deg, #fed7aa 0%, #fff7ed 50%, #ffedd5 100%)',
            'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Nền dark mode */}
      <motion.div
        className="absolute inset-0 hidden dark:block"
        animate={{
          background: [
            'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
            'linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)',
            'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="rounded-lg border bg-card p-8 shadow-lg backdrop-blur-sm">
            {/* Header */}
            <div className="mb-8 text-center space-y-2">
              <h1 className="text-4xl pb-1 font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2 tracking-tight">
                Tra Cứu Thông Tin
              </h1>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Lễ Tốt Nghiệp 2025
              </h2>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto" />
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="mssv"
                  rules={{
                    required: 'Vui lòng nhập MSSV',
                    validate: validateMSSV,
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="!text-black dark:!text-black font-semibold text-base">
                        Mã Số Sinh Viên:
                      </FormLabel>
                      <FormControl>
                        <motion.div
                          animate={
                            mssvError
                              ? { x: [0, -10, 10, -10, 10, 0] }
                              : {}
                          }
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                          <Input
                            {...field}
                            placeholder="SE123456"
                            className="text-lg uppercase transition-all duration-300"
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase()
                              field.onChange(value)
                            }}
                            maxLength={8}
                          />
                        </motion.div>
                      </FormControl>

                      {/* Thông báo lỗi / trạng thái */}
                      <div className="mt-2 min-h-[24px]">
                        <AnimatePresence mode="wait">
                          {errorMessage ? (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Badge
                                variant="destructive"
                                className="gap-2 rounded-md px-3 py-1.5"
                              >
                                <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-500" />
                                {errorMessage}
                              </Badge>
                            </motion.div>
                          ) : !mssvValue || mssvValue.trim() === '' ? (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Badge
                                variant="secondary"
                                className="gap-2 rounded-md px-3 py-1.5 bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-400"
                              >
                                <div className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400" />
                                Vui lòng nhập MSSV
                              </Badge>
                            </motion.div>
                          ) : mssvError ? (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Badge
                                variant="destructive"
                                className="gap-2 rounded-md px-3 py-1.5"
                              >
                                <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-500" />
                                {mssvError.message}
                              </Badge>
                            </motion.div>
                          ) : isValidMSSV() ? (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Badge
                                variant="success"
                                className="gap-2 rounded-md px-3 py-1.5"
                              >
                                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-500" />
                                MSSV hợp lệ
                              </Badge>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting || !isValidMSSV()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {!isSubmitting && <Search className="h-4 w-4" />}
                  {isSubmitting ? 'Đang tra cứu...' : 'Tra Cứu'}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
