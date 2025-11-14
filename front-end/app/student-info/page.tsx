'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Mail,
  GraduationCap,
  Building2,
  User,
  Armchair, // Thêm icon ghế
  Image as ImageIcon,
  Loader, // Thêm icon ảnh
  AlertTriangle, // Thêm icon cảnh báo
  OctagonX,
  Pen
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import searchApi, { StudentData } from '@/api/searchApi'
import { toast } from 'sonner'

export default function StudentInfoPage() {
  const router = useRouter()

  const [showWrongImageForm, setShowWrongImageForm] = useState(false)
  const [showWrongInfoForm, setShowWrongInfoForm] = useState(false)

  const [studentData, setStudentData] = useState<StudentData | null>(() => {
    // Khởi tạo state từ sessionStorage
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('studentData')
      if (storedData) {
        try {
          return JSON.parse(storedData) as StudentData
        } catch (error) {
          console.error('Error parsing student data:', error)
          return null
        }
      }
    }
    return null
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty: imageIsDirty },
    reset: resetImage
  } = useForm({
    defaultValues: {
      requestedName: '',
      requestedImageUrl: '',
      requestedNote: ''
    }
  })

  const infoForm = useForm({
    defaultValues: {
      studentId: studentData?.studentId ?? '',
      fullName: studentData?.fullName ?? '',
      email: studentData?.email ?? '',
      major: studentData?.major ?? '',
      faculty: studentData?.faculty ?? '',
      note: ''
    }
  })

  const {
    control: infoControl,
    handleSubmit: handleSubmitInfo,
    formState: { errors: infoErrors, isDirty: infoIsDirty },
    reset: resetInfo,
    getValues: getInfoValues
  } = infoForm

  // Keep info form in sync if studentData changes
  useEffect(() => {
    if (studentData) {
      resetInfo({
        studentId: studentData.studentId,
        fullName: studentData.fullName,
        email: studentData.email,
        major: studentData.major,
        faculty: studentData.faculty,
        note: ''
      })
    }
  }, [studentData, resetInfo])

  useEffect(() => {
    // Chỉ redirect nếu không có data *sau khi* đã load từ useEffect
    // (Lưu ý: studentData ban đầu là null, nên lần render đầu tiên
    // hàm if (!studentData) bên dưới sẽ chạy, hiển thị loading)
    if (!studentData && !sessionStorage.getItem('studentData')) {
      // Nếu sau khi check mà vẫn không có data (user vào thẳng URL)
      // thì mới đẩy về trang chủ
      router.push('/')
    }
  }, [studentData, router])

  const handleBackToSearch = () => {
    sessionStorage.removeItem('studentData')
    router.push('/')
  }

  const onSubmit = async (data: any) => {
    if (!data.requestedImageUrl || !data.requestedNote) {
      toast.error('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    const requestData = {
      studentId: studentData?.studentId,
      requestedName: data.requestedName,
      requestedImageUrl: data.requestedImageUrl,
      requestedNote: data.requestedNote
    }

    try {
      const response = await searchApi.sendRequestImage({
        studentId: requestData.studentId!,
        imageUrl: requestData.requestedImageUrl,
        note: requestData.requestedNote
      })
      if (response.success) {
        toast.success('Yêu cầu của bạn đã được gửi thành công!')
        // reset image form fields back to defaults and close form
        resetImage({ requestedName: '', requestedImageUrl: '', requestedNote: '' })
        setShowWrongImageForm(false)
      }
    } catch (error: any) {
      toast.error(error.response.data.error.details[0].message || 'Đã xảy ra lỗi, vui lòng thử lại sau!')
    }
  }

  const onSubmitInfo = async (data: any) => {
    // allow sending even if note empty; validate basic required fields
    if (!data.fullName || !data.email) {
      toast.error('Vui lòng nhập tên và email')
      return
    }

    try {
      const response = await searchApi.sendRequestInformation(studentData!.studentId, {
        fullName: data.fullName,
        email: data.email,
        major: data.major,
        faculty: data.faculty,
        note: data.note || undefined
      })
      if (response.success) {
        toast.success('Yêu cầu thông tin đã được gửi thành công!')
        // reset info form back to studentData values and close form
        resetInfo({
          studentId: studentData?.studentId ?? '',
          fullName: studentData?.fullName ?? '',
          email: studentData?.email ?? '',
          major: studentData?.major ?? '',
          faculty: studentData?.faculty ?? '',
          note: ''
        })
        setShowWrongInfoForm(false)
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại sau!'
      toast.error(errorMessage)
    }
  }

  // Lần render đầu tiên (cả server và client) sẽ là null,
  // nên sẽ return div loading này.
  // Điều này khớp với nhau và hết lỗi hydration.
  if (!studentData) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  // Sau khi useEffect chạy và setStudentData, component
  // sẽ re-render và hiển thị phần code bên dưới.
  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden p-4 bg-gray-50 dark:bg-gray-900'>
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
      <motion.div
        className='relative z-10 w-full max-w-3xl'
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card showAccent={false} className='shadow-2xl backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50'>
          <div className='absolute top-0 left-0 w-full h-3 bg-orange-500 rounded-t-lg'></div>
          <CardHeader className='text-center pt-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-t-lg'>
            <CardTitle className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
              {studentData.fullName}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Thông tin cá nhân */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='space-y-3'
            >
              <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3'>Thông Tin Tân Cử Nhân</h3>
              <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 flex flex-col gap-4 justify-center'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='flex items-center gap-3'>
                    <User className='h-5 w-5 text-gray-500' />
                    <div>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Mã số sinh viên</p>
                      <p className='font-semibold text-gray-800 dark:text-gray-200'>{studentData.studentId}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Mail className='h-5 w-5 text-gray-500' />
                    <div>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Email</p>
                      <p className='font-semibold text-gray-800 dark:text-gray-200'>{studentData.email}</p>
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='flex items-center gap-3'>
                    <GraduationCap className='h-5 w-5 text-gray-500' />
                    <div>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Chuyên ngành</p>
                      <p className='font-semibold text-gray-800 dark:text-gray-200'>{studentData.major}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Building2 className='h-5 w-5 text-gray-500' />
                    <div>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Khối ngành</p>
                      <p className='font-semibold text-gray-800 dark:text-gray-200'>{studentData.faculty}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Thông tin lễ tốt nghiệp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='space-y-3'
            >
              <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3'>Thông Tin Lễ Tốt Nghiệp</h3>
              <div className='flex flex-wrap gap-2 mb-4'>
                <Badge className='px-4 py-2 text-sm border border-orange-500 text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30'>
                  <Calendar className='h-4 w-4 mr-2' />
                  {studentData.date.split('T')[0].split('-').reverse().join('/')}
                </Badge>
                <Badge className='px-4 py-2 text-sm border border-green-500 text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30'>
                  <MapPin className='h-4 w-4 mr-2' />
                  Hội trường {studentData.hall}
                </Badge>
                <Badge className='px-4 py-2 text-sm border border-blue-500 text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30'>
                  <Loader className='h-4 w-4 mr-2' />
                  Phiên trao {studentData.session.number}
                </Badge>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2'>
                <div className='p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50'>
                  <div className='flex items-center gap-3'>
                    <Clock className='h-6 w-6 text-purple-500' />
                    <div>
                      <p className='text-sm text-purple-800 dark:text-purple-300'>Thời gian check-in</p>
                      <p className='text-lg font-bold text-purple-900 dark:text-purple-200'>
                        {studentData.session.checkin}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50'>
                  <div className='flex items-center gap-3'>
                    <Clock className='h-6 w-6 text-indigo-500' />
                    <div>
                      <p className='text-sm text-indigo-800 dark:text-indigo-300'>Thời gian trao bằng</p>
                      <p className='text-lg font-bold text-indigo-900 dark:text-indigo-200'>
                        {studentData.session.presentation}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50'>
                  <div className='flex items-center gap-3'>
                    <Armchair className='h-6 w-6 text-cyan-600 dark:text-cyan-400' />
                    <div>
                      <p className='text-sm text-cyan-800 dark:text-indigo-300'>Số ghế sinh viên</p>
                      <p className='text-lg font-bold text-cyan-900 dark:text-indigo-200'>{studentData.seat}</p>
                    </div>
                  </div>
                </div>
                <div className='p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50'>
                  <div className='flex items-center gap-3'>
                    <Armchair className='h-6 w-6 text-teal-600 dark:text-teal-400' />
                    <div>
                      <p className='text-sm text-teal-800 dark:text-indigo-300'>Số ghế phụ huynh</p>
                      <p className='text-lg font-bold text-teal-900 dark:text-indigo-200'>{studentData.parentSeat}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image and Wrong Image Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='space-y-3'
            >
              <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3'>Link Ảnh</h3>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-center'>
                  <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3'>Ảnh trao bằng</p>
                  <Button asChild className='bg-orange-500 hover:bg-orange-600 text-white gap-2'>
                    <a
                      href={studentData.images?.led ?? '#'}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => {
                        const url = studentData.images?.led?.toString() ?? ''
                        if (!url || !url.trim()) {
                          e.preventDefault()
                          toast.error('Không có ảnh')
                        }
                      }}
                    >
                      <ImageIcon className='h-4 w-4' />
                      Xem ảnh
                    </a>
                  </Button>
                </div>

                <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-center'>
                  <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3'>Ảnh</p>
                  <Button asChild className='bg-orange-500 hover:bg-orange-600 text-white gap-2'>
                    <a
                      href={studentData.images?.exhibit ?? '#'}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => {
                        const url = studentData.images?.exhibit?.toString() ?? ''
                        if (!url || !url.trim()) {
                          e.preventDefault()
                          toast.error('Không có ảnh')
                        }
                      }}
                    >
                      <ImageIcon className='h-4 w-4' />
                      Xem ảnh
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Image URL and Notes Form */}
            {showWrongImageForm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='p-4 rounded-lg border border-dashed border-orange-400 bg-orange-50/60 dark:bg-orange-950/20 dark:border-orange-900 space-y-4'
              >
                <h4 className='text-md font-semibold text-gray-800 dark:text-gray-100'>Báo cáo ảnh không chính xác</h4>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>Mã số sinh viên</label>
                    <Input value={studentData.studentId} disabled className='text-sm bg-gray-100 dark:bg-gray-800' />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>Họ và tên</label>
                    <Input value={studentData.fullName} disabled className='text-sm bg-gray-100 dark:bg-gray-800' />
                  </div>
                </div>

                {/* Image URL */}
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Link drive ảnh chân dung
                  </label>
                  <Controller
                    name='requestedImageUrl'
                    control={control}
                    rules={{ required: 'Vui lòng nhập Link ảnh' }}
                    render={({ field }) => <Input {...field} placeholder='...' className='text-sm' />}
                  />
                  {errors.requestedImageUrl && (
                    <AnimatePresence>
                      {errors.requestedImageUrl && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className='text-sm text-red-500'
                        >
                          {errors.requestedImageUrl?.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  )}
                </div>

                {/* Notes */}
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>Ghi chú</label>
                  <Controller
                    name='requestedNote'
                    control={control}
                    rules={{ required: 'Vui lòng nhập ghi chú' }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder='Mô tả chi tiết vấn đề ...'
                        className='min-h-[110px] resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-500 dark:focus:ring-orange-900/50'
                      />
                    )}
                  />
                  <AnimatePresence>
                    {errors.requestedNote && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className='text-sm text-red-500'
                      >
                        {errors.requestedNote?.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type='button'
                  onClick={handleSubmit(onSubmit)}
                  disabled={!imageIsDirty}
                  className={`w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600 ${!imageIsDirty ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Gửi yêu cầu
                </Button>
              </motion.div>
            )}

            {/* Buttons moved below both forms to keep 'Đóng Biểu Mẫu' under whichever form is open */}

            {/* Information correction form */}
            {showWrongInfoForm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='mt-4 p-4 rounded-lg border border-dashed border-orange-400 bg-orange-50/60 dark:bg-orange-950/20 dark:border-orange-900 space-y-4'
              >
                <h4 className='text-md font-semibold text-gray-800 dark:text-gray-100'>
                  Báo cáo thông tin không chính xác
                </h4>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>Mã số sinh viên</label>
                    <Input value={studentData.studentId} disabled className='text-sm bg-gray-100 dark:bg-gray-800' />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>Họ và tên</label>
                    <Controller
                      name='fullName'
                      control={infoControl}
                      rules={{ required: 'Vui lòng nhập họ và tên' }}
                      render={({ field }) => <Input {...field} placeholder='Nhập họ và tên' className='text-sm' />}
                    />
                    {infoErrors.fullName && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className='text-sm text-red-500'
                      >
                        {infoErrors.fullName?.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>Email</label>
                    <Controller
                      name='email'
                      control={infoControl}
                      rules={{
                        required: 'Vui lòng nhập email',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' }
                      }}
                      render={({ field }) => (
                        <Input {...field} type='email' placeholder='example@email.com' className='text-sm' />
                      )}
                    />
                    {infoErrors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className='text-sm text-red-500'
                      >
                        {infoErrors.email?.message}
                      </motion.p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>Chuyên ngành</label>
                    <Controller
                      name='major'
                      control={infoControl}
                      render={({ field }) => <Input {...field} placeholder='Chuyên ngành' className='text-sm' />}
                    />
                  </div>
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>Khối ngành</label>
                  <Controller
                    name='faculty'
                    control={infoControl}
                    render={({ field }) => <Input {...field} placeholder='Khối ngành' className='text-sm' />}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-600 dark:text-gray-300'>Ghi chú</label>
                  <Controller
                    name='note'
                    control={infoControl}
                    rules={{ maxLength: { value: 500, message: 'Ghi chú quá dài' } }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder='Mô tả chi tiết vấn đề ...'
                        className='min-h-[110px] resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-500 dark:focus:ring-orange-900/50'
                        maxLength={500}
                      />
                    )}
                  />
                  <p className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                    {getInfoValues('note')?.length || 0}/500
                  </p>
                </div>

                <Button
                  type='button'
                  onClick={handleSubmitInfo(onSubmitInfo)}
                  disabled={!infoIsDirty}
                  className={`w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600 ${!infoIsDirty ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Gửi yêu cầu
                </Button>
              </motion.div>
            )}
            {/* Buttons: when one of the forms is open show a single 'Đóng Biểu Mẫu' button; otherwise show two toggles side-by-side */}
            {showWrongImageForm || showWrongInfoForm ? (
              <Button
                onClick={() => {
                  setShowWrongImageForm(false)
                  setShowWrongInfoForm(false)
                }}
                className='w-full mt-4 bg-gray-200 text-gray-700 hover:bg-orange-100 hover:text-orange-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all'
                variant='outline'
              >
                Đóng Biểu Mẫu
              </Button>
            ) : (
              <div>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3'>Gửi Yêu Cầu</h3>
                <div className='flex gap-2 mt-4'>
                  <Button
                    onClick={() => {
                      // open image form and ensure info form closed
                      setShowWrongImageForm((prev) => {
                        const next = !prev
                        if (next) setShowWrongInfoForm(false)
                        return next
                      })
                    }}
                    className='flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500 bg-red-100 text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-200 transition'
                  >
                    <Pen />
                    Sai Ảnh
                  </Button>

                  <Button
                    onClick={() => {
                      // open info form and ensure image form closed
                      setShowWrongInfoForm((prev) => {
                        const next = !prev
                        if (next) setShowWrongImageForm(false)
                        return next
                      })
                    }}
                    className='flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500 bg-red-100 text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-200 transition'
                  >
                    <Pen />
                    Sai Thông Tin
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className='p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-lg'>
            <Button
              onClick={handleBackToSearch}
              className='w-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 gap-2'
              size='lg'
            >
              <ArrowLeft className='h-5 w-5' />
              Tiếp tục tìm kiếm
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
