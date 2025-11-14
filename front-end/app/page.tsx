'use client'

import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { searchApi } from '@/api'
import { toast } from 'sonner'

type FormData = {
  mssv: string
}

type MissingInformationFormData = {
  fullName: string
  email: string
  phoneNumber: string
  note: string
}

export default function Home() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isNotFoundError, setIsNotFoundError] = useState(false)
  const [showMissingInfoDialog, setShowMissingInfoDialog] = useState(false)
  const [isSubmittingMissingInfo, setIsSubmittingMissingInfo] = useState(false)

  const form = useForm<FormData>({
    defaultValues: { mssv: '' },
    mode: 'onChange'
  })

  const missingInfoForm = useForm<MissingInformationFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      note: ''
    },
    mode: 'onChange'
  })

  const mssvValue = form.watch('mssv')
  const mssvError = form.formState.errors.mssv

  const validateMSSV = (value: string) => {
    // Pattern cho MSSV: bắt đầu bằng 4-6 thì 4 số, còn lại 6 số
    const pattern = /^[SHCQD][ESA]([4-6]\d{4}|\d{6})$/
    if (!value || value.trim() === '') return 'Vui lòng nhập MSSV'
    const upperValue = value.toUpperCase()
    if (!pattern.test(upperValue)) return 'MSSV sai định dạng'
    return true
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setErrorMessage('')
    setIsNotFoundError(false)
    setShowMissingInfoDialog(false)
    missingInfoForm.reset()

    try {
      const response = await searchApi.getStudentById(data.mssv)
      sessionStorage.setItem('studentData', JSON.stringify(response.data))
      router.push('/student-info')
    } catch (error: any) {
      const errorResponse = error?.response?.data
      if (errorResponse?.statusCode === 404 && errorResponse?.message === 'Không tìm thấy sinh viên với Student ID') {
        setIsNotFoundError(true)
        setErrorMessage('Không tìm thấy thông tin sinh viên')
      } else {
        setErrorMessage('Không tìm thấy thông tin sinh viên')
        setIsNotFoundError(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const validatePhoneNumber = (value: string) => {
    const phoneRegex = /^(0[35789]\d{8}|(\+?84)[35789]\d{8})$/
    if (!value || value.trim() === '') {
      return 'Số điện thoại bị bỏ trống'
    }
    if (!phoneRegex.test(value)) {
      return 'Số điện thoại không hợp lệ'
    }
    return true
  }

  const onSubmitMissingInfo = async (data: MissingInformationFormData) => {
    if (!mssvValue) {
      toast.error('Vui lòng nhập MSSV')
      return
    }

    setIsSubmittingMissingInfo(true)

    try {
      const response = await searchApi.submitMissingInformation(mssvValue, {
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        note: data.note || undefined
      })

      if (response.success) {
        toast.success('Thông tin đã được gửi thành công!')
        setShowMissingInfoDialog(false)
        missingInfoForm.reset()
        setErrorMessage('')
        setIsNotFoundError(false)
      }
    } catch (error: any) {
      const errorResponse = error?.response?.data
      const errorMessage = errorResponse?.message || 'Đã xảy ra lỗi, vui lòng thử lại sau!'
      toast.error(errorMessage)
    } finally {
      setIsSubmittingMissingInfo(false)
    }
  }

  const isValidMSSV = () => {
    if (!mssvValue) return false
    const pattern = /^[SHCQD][ESA]([4-6]\d{4}|\d{6})$/
    return pattern.test(mssvValue.toUpperCase())
  }

  return (
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

      <div className='relative z-10 flex h-full w-full items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className='w-full max-w-md'
        >
          <div className='rounded-lg border bg-card p-8 shadow-lg backdrop-blur-sm'>
            {/* Header */}
            <div className='mb-8 text-center space-y-2'>
              <h1 className='text-4xl pb-1 font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2 tracking-tight'>
                Tra Cứu Thông Tin
              </h1>
              <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3'>Lễ Tốt Nghiệp 2025</h2>
              <div className='h-px w-24 bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto' />
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                  control={form.control}
                  name='mssv'
                  rules={{
                    required: 'Vui lòng nhập MSSV',
                    validate: validateMSSV
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='!text-black dark:!text-black font-semibold text-base'>
                        Mã Số Sinh Viên:
                      </FormLabel>
                      <FormControl>
                        <motion.div
                          animate={mssvError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                          <Input
                            {...field}
                            placeholder='SE123456'
                            className='text-sm uppercase transition-all duration-300'
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase()
                              field.onChange(value)
                              // Reset error states when user types
                              if (errorMessage) {
                                setErrorMessage('')
                                setIsNotFoundError(false)
                              }
                            }}
                            maxLength={8}
                          />
                        </motion.div>
                      </FormControl>

                      {/* Thông báo lỗi / trạng thái */}
                      <div className='mt-2 min-h-[24px]'>
                        <AnimatePresence mode='wait'>
                          {errorMessage ? (
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
                          ) : !mssvValue || mssvValue.trim() === '' ? (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Badge
                                variant='secondary'
                                className='gap-2 rounded-md px-3 py-1.5 bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-400'
                              >
                                <div className='h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400' />
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
                              <Badge variant='destructive' className='gap-2 rounded-md px-3 py-1.5'>
                                <div className='h-2 w-2 rounded-full bg-red-600 dark:bg-red-500' />
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
                              <Badge variant='success' className='gap-2 rounded-md px-3 py-1.5'>
                                {/* <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-500" /> */}
                                <motion.div
                                  className='h-2 w-2 rounded-full bg-green-600 dark:bg-green-500'
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                  }}
                                />
                                MSSV hợp lệ
                              </Badge>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </FormItem>
                  )}
                />

                {isNotFoundError && (
                  <Button
                    type='button'
                    onClick={() => setShowMissingInfoDialog(true)}
                    className='w-full bg-gray-200 text-gray-700 hover:bg-orange-100 hover:text-orange-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all'
                    variant='outline'
                  >
                    Báo cáo thiếu thông tin
                  </Button>
                )}

                <Button
                  type='submit'
                  disabled={isSubmitting || !isValidMSSV()}
                  className='w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  size='lg'
                >
                  {!isSubmitting && <Search className='h-4 w-4' />}
                  {isSubmitting ? 'Đang tra cứu...' : 'Tra Cứu'}
                </Button>
              </form>
            </Form>
            <div className='mt-6 text-center text-xs text-gray-500'>© 2025 Convocation Day</div>
          </div>
        </motion.div>
      </div>

      {/* Dialog cho form bổ sung thông tin */}
      <Dialog open={showMissingInfoDialog} onOpenChange={setShowMissingInfoDialog}>
        <DialogContent
          onClose={() => setShowMissingInfoDialog(false)}
          className='max-w-2xl px-2 bg-orange-100/60 dark:bg-orange-950/20 dark:border-orange-900'
        >
          <div className='p-4 space-y-4'>
            <DialogHeader className='p-0 pb-0'>
              <DialogTitle className='text-2xl text-center font-bold text-gray-800 dark:text-gray-100'>
                Thông Tin Tân Cử Nhân
              </DialogTitle>
              <div className='mt-2 text-sm italic text-gray-800 dark:text-gray-300'>
                Sau khi nhận thông tin, <strong>Ban Tổ Chức</strong> sẽ tiến hành kiểm tra lại và liên hệ với bạn trong
                thời gian sớm nhất.
              </div>
            </DialogHeader>

            <Form {...missingInfoForm}>
              <form onSubmit={missingInfoForm.handleSubmit(onSubmitMissingInfo)} className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-800-600 dark:text-gray-300'>Mã số sinh viên</label>
                    <Input value={mssvValue || ''} disabled className='bg-gray-100 dark:bg-gray-800' />
                  </div>
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-800-600 dark:text-gray-300'>Họ và tên *</label>
                  <FormField
                    control={missingInfoForm.control}
                    name='fullName'
                    rules={{
                      required: 'Tên tân cử nhân bị bỏ trống'
                    }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder='Nhập họ và tên' className='text-sm' />
                        </FormControl>
                        {/* ĐÃ CẬP NHẬT: Bỏ div min-h và font-medium */}
                        <AnimatePresence>
                          {fieldState.error && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className='text-sm text-destructive' // Bỏ font-medium
                            >
                              {fieldState.error.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-800 dark:text-gray-300'>Email *</label>
                  <FormField
                    control={missingInfoForm.control}
                    name='email'
                    rules={{
                      required: 'Email bị bỏ trống',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Email không hợp lệ'
                      }
                    }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type='email' placeholder='example@email.com' className='text-sm' />
                        </FormControl>
                        {/* ĐÃ CẬP NHẬT: Bỏ div min-h và font-medium */}
                        <AnimatePresence>
                          {fieldState.error && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.3 }}
                              className='text-sm text-destructive' // Bỏ font-medium
                            >
                              {fieldState.error.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-800 dark:text-gray-300'>Số điện thoại *</label>
                  <FormField
                    control={missingInfoForm.control}
                    name='phoneNumber'
                    rules={{
                      required: 'Số điện thoại bị bỏ trống',
                      validate: validatePhoneNumber
                    }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder='...' className='text-sm' />
                        </FormControl>
                        {/* ĐÃ CẬP NHẬT: Bỏ div min-h và font-medium */}
                        <AnimatePresence>
                          {fieldState.error && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.3 }}
                              className='text-sm text-destructive' // Bỏ font-medium
                            >
                              {fieldState.error.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </FormItem>
                    )}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-800 dark:text-gray-300'>Ghi chú</label>
                  <FormField
                    control={missingInfoForm.control}
                    name='note'
                    rules={{
                      maxLength: {
                        value: 500,
                        message: 'Ghi chú quá dài'
                      }
                    }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <textarea
                            {...field}
                            placeholder='Mô tả chi tiết vấn đề ...'
                            className='min-h-[110px] resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-500 dark:focus:ring-orange-900/50'
                            maxLength={500}
                          />
                        </FormControl>
                        {/* ĐÃ CẬP NHẬT: Bỏ div min-h và font-medium */}
                        <AnimatePresence>
                          {fieldState.error && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.3 }}
                              className='text-sm text-destructive' // Bỏ font-medium
                            >
                              {fieldState.error.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                        <p className='ml-2 text-xs text-gray-500 dark:text-gray-400'>{field.value?.length || 0}/500</p>
                      </FormItem>
                    )}
                  />
                </div>

                <div className='flex gap-2 justify-end pt-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowMissingInfoDialog(false)}
                    disabled={isSubmittingMissingInfo}
                    className='bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                  >
                    Hủy
                  </Button>
                  <Button
                    type='submit'
                    disabled={isSubmittingMissingInfo}
                    className='bg-orange-500 text-white hover:bg-orange-600'
                  >
                    {isSubmittingMissingInfo ? 'Đang gửi...' : 'Gửi thông tin'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
