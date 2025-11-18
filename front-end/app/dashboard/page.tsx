'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi, BachelorRequestItem, BachelorRequestStatus, BachelorRequestType, GetRequestsParams } from '@/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, LogOut, RefreshCcw, Search, ShieldCheck, XCircle } from 'lucide-react'

const STATUS_LABELS: Record<BachelorRequestStatus, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối'
}

const TYPE_LABELS: Record<Exclude<BachelorRequestType, null>, string> = {
    image: 'Ảnh',
    information: 'Thông tin',
    other: 'Khác'
}

const STATUS_STYLES: Record<BachelorRequestStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-100',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-100'
}

const TYPE_STYLES: Record<Exclude<BachelorRequestType, null>, string> = {
    image: 'bg-sky-50 text-sky-700 ring-sky-100',
    information: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    other: 'bg-slate-50 text-slate-600 ring-slate-100'
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]
const DOTS = 'DOTS' as const

const formatDate = (value?: string | null) => {
    if (!value) {
        return '—'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return '—'
    }

    return date.toLocaleDateString('vi-VN')
}

const useDebounce = <T,>(value: T, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])

    return debouncedValue
}

export default function DashboardPage() {
    const router = useRouter()
    const [requests, setRequests] = useState<BachelorRequestItem[]>([])
    const [metadata, setMetadata] = useState({
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        limit: PAGE_SIZE_OPTIONS[0]
    })
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState<{ sort: string; order: 'asc' | 'desc' }>({
        sort: '',
        order: 'desc'
    })
    const [processingAction, setProcessingAction] = useState<{ id: string; status: BachelorRequestStatus } | null>(null)
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user')
        if (!storedUser) {
            toast.error('Vui lòng đăng nhập để truy cập Dashboard')
            router.replace('/login')
            return
        }
        setIsAuthorized(true)
    }, [router])

    const debouncedSearchTerm = useDebounce(searchTerm, 400)

    const fetchRequests = async (params?: Partial<GetRequestsParams>) => {
        setLoading(true)
        setErrorMessage('')
        try {
            // Validate and prepare request parameters
            const requestedPage = Math.max(1, params?.page ?? metadata.currentPage)
            const requestedLimit = Math.max(1, Math.min(100, params?.limit ?? metadata.limit))

            const requestParams: GetRequestsParams = {
                page: requestedPage,
                limit: requestedLimit
            }

            if (sortConfig.sort) {
                requestParams.sort = sortConfig.sort
                requestParams.order = sortConfig.order || 'desc'
            }

            // Only add search if it's not empty and valid
            if (debouncedSearchTerm && debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 1) {
                requestParams.search = debouncedSearchTerm.trim()
            }

            // Add filters if they're not 'all' and are valid values
            const response = await adminApi.getBachelorRequests(requestParams)

            // Validate response data
            if (response && Array.isArray(response.data)) {
                setRequests(response.data)
            } else {
                setRequests([])
                console.warn('Invalid response format:', response)
            }

            // Handle metadata properly - use the validated parameters we actually sent
            if (response.metadata && typeof response.metadata === 'object') {
                setMetadata({
                    totalItems: response.metadata.totalItems || 0,
                    currentPage: requestedPage,
                    totalPages: response.metadata.totalPages || 0,
                    limit: requestedLimit
                })
            } else {
                // Fallback metadata when server doesn't provide it
                const dataLength = response.data?.length || 0
                setMetadata({
                    totalItems: dataLength,
                    currentPage: requestedPage,
                    totalPages: dataLength > 0 ? Math.ceil(dataLength / requestedLimit) : 0,
                    limit: requestedLimit
                })
            }
        } catch (error: any) {
            console.error('API Error:', error)

            // Handle different types of errors
            let errorMsg = 'Không thể tải dữ liệu. Vui lòng thử lại sau.'

            if (error?.response?.status === 400) {
                errorMsg = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các bộ lọc.'
            } else if (error?.response?.status === 401) {
                errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            } else if (error?.response?.status === 403) {
                errorMsg = 'Bạn không có quyền truy cập tính năng này.'
            } else if (error?.response?.status === 500) {
                errorMsg = 'Lỗi máy chủ. Vui lòng thử lại sau.'
            } else if (error?.response?.data?.message) {
                errorMsg = error.response.data.message
            } else if (error?.message) {
                errorMsg = error.message
            }

            setErrorMessage(errorMsg)
            setRequests([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthorized) return
        fetchRequests({ page: 1 })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, sortConfig.sort, sortConfig.order, isAuthorized])

    const handlePageChange = (direction: 'prev' | 'next') => {
        const currentPage = metadata.currentPage || 1
        const maxPages = totalPages || 1

        let targetPage: number
        if (direction === 'prev') {
            targetPage = Math.max(1, currentPage - 1)
        } else {
            // For next, allow going beyond current totalPages if totalPages is 0 (unknown)
            targetPage = totalPages === 0 ? currentPage + 1 : Math.min(maxPages, currentPage + 1)
        }

        if (targetPage === currentPage) return
        fetchRequests({ page: targetPage })
    }

    const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = Number(event.target.value)

        // Validate the new limit
        if (!newLimit || newLimit < 1 || newLimit > 100) {
            console.warn('Invalid limit value:', newLimit)
            return
        }

        // Update metadata first, then fetch with new parameters
        setMetadata((prev) => ({ ...prev, limit: newLimit, currentPage: 1 }))
        fetchRequests({ page: 1, limit: newLimit })
    }

    const handleSortToggle = (field: string) => {
        setSortConfig((prev) => {
            if (prev.sort === field) {
                return { sort: field, order: prev.order === 'asc' ? 'desc' : 'asc' }
            }
            return { sort: field, order: 'desc' }
        })
    }

    // Remove client-side filtering since we're doing server-side filtering
    const filteredRequests = requests

    const handleStatusUpdate = async (studentId: string, status: BachelorRequestStatus) => {
        if (!studentId || typeof studentId !== 'string') {
            toast.error('ID sinh viên không hợp lệ')
            return
        }

        if (status !== 'approved' && status !== 'rejected') {
            toast.error('Trạng thái gửi lên không hợp lệ')
            return
        }

        setProcessingAction({ id: studentId, status })
        try {
            await adminApi.approveBachelorRequest(studentId, status)
            const successMessage =
                status === 'approved' ? 'Duyệt yêu cầu thành công' : 'Đã từ chối yêu cầu'
            toast.success(successMessage)
            fetchRequests({ page: metadata.currentPage })
        } catch (error: any) {
            console.error('Approve error:', error)
            const errorMsg = error?.response?.data?.message || 'Không thể cập nhật yêu cầu. Vui lòng thử lại.'
            toast.error(errorMsg)
        } finally {
            setProcessingAction(null)
        }
    }

    const renderStatusBadge = (status: BachelorRequestStatus | null) => {
        if (!status) {
            return <Badge variant='outline' className='border-transparent bg-gray-50 text-gray-500'>Không rõ</Badge>
        }
        const classes = STATUS_STYLES[status] || STATUS_STYLES.pending
        return (
            <Badge variant='outline' className={`border-transparent px-2.5 py-0.5 text-xs font-semibold ring-1 ${classes}`}>
                {STATUS_LABELS[status]}
            </Badge>
        )
    }

    const renderTypeBadge = (type: BachelorRequestType) => {
        if (!type) {
            return (
                <Badge variant='outline' className='border-transparent bg-slate-50 text-slate-600'>
                    Khác
                </Badge>
            )
        }
        const classes = TYPE_STYLES[type] || TYPE_STYLES.other
        return (
            <Badge variant='outline' className={`border-transparent px-2.5 py-0.5 text-xs font-semibold ring-1 ${classes}`}>
                {TYPE_LABELS[type]}
            </Badge>
        )
    }

    const totalPages = useMemo(() => {
        if (metadata.totalPages && metadata.totalPages > 0) return metadata.totalPages
        if (!metadata.totalItems || metadata.totalItems === 0) return 0
        return Math.ceil(metadata.totalItems / metadata.limit)
    }, [metadata])

    const createRange = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index)

    const paginationRange = useMemo(() => {
        if (totalPages === 0) return [] as Array<number | typeof DOTS>

        const totalPageNumbers = 5

        if (totalPages <= totalPageNumbers) {
            return createRange(1, totalPages)
        }

        const leftSiblingIndex = Math.max(metadata.currentPage - 1, 1)
        const rightSiblingIndex = Math.min(metadata.currentPage + 1, totalPages)

        const shouldShowLeftDots = leftSiblingIndex > 2
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1
        const firstPageIndex = 1
        const lastPageIndex = totalPages

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftRange = createRange(1, 4)
            return [...leftRange, DOTS, lastPageIndex]
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightRange = createRange(totalPages - 3, totalPages)
            return [firstPageIndex, DOTS, ...rightRange]
        }

        const middleRange = createRange(leftSiblingIndex, rightSiblingIndex)
        return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
    }, [metadata.currentPage, totalPages])

    const { startItem, endItem } = useMemo(() => {
        if (metadata.totalItems === 0) {
            return { startItem: 0, endItem: 0 }
        }
        const start = (metadata.currentPage - 1) * metadata.limit + 1
        const end = Math.min(metadata.currentPage * metadata.limit, metadata.totalItems)
        return { startItem: start, endItem: end }
    }, [metadata.currentPage, metadata.limit, metadata.totalItems])

    const goToPage = (page: number) => {
        // Validate page number
        if (!page || page < 1 || page === metadata.currentPage) return

        // If we know totalPages, validate against it
        if (totalPages > 0 && page > totalPages) return

        fetchRequests({ page })
    }

    const handleLogout = () => {
        sessionStorage.removeItem('user')
        toast.success('Đã đăng xuất khỏi hệ thống')
        router.replace('/login')
    }

    if (!isAuthorized) {
        return null
    }

    return (
        <div className='min-h-screen w-full bg-linear-to-b from-orange-50 to-white px-6 py-10'>
            <div className='mx-auto max-w-6xl space-y-6'>
                <header className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    <div>
                        <p className='text-sm uppercase tracking-wide text-orange-500'>Dashboard</p>
                        <h1 className='text-3xl font-bold text-gray-900'>Quản lý tân cử nhân</h1>
                        <p className='text-sm text-muted-foreground'>
                            Giám sát các yêu cầu cập nhật thông tin, duyệt nhanh chóng và chính xác.
                        </p>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline' onClick={() => fetchRequests()} disabled={loading}>
                            {loading ? <Loader2 className='animate-spin' /> : <RefreshCcw className='size-4' />}
                            Làm mới
                        </Button>
                        <Button variant='destructive' onClick={handleLogout}>
                            <LogOut className='size-4' />
                            Đăng xuất
                        </Button>
                    </div>
                </header>

                <section className='relative rounded-xl border bg-white p-4 shadow-sm'>
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                        <div className='flex flex-1 items-center gap-3'>
                            <div className='relative flex-1'>
                                <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                                <Input
                                    placeholder='Tìm theo MSSV hoặc họ tên...'
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className='pl-9'
                                />
                            </div>
                        </div>

                        <div className='flex items-center gap-3'>
                            <div className='grid gap-2 text-sm'>
                                {/* <label className='text-gray-500'>Số dòng / trang</label> */}
                                <select
                                    value={metadata.limit}
                                    onChange={handleLimitChange}
                                    className='rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400'
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <section className='rounded-xl border bg-white p-4 shadow-sm'>
                    <div className='overflow-x-auto overflow-y-visible'>
                        <table className='min-w-full divide-y divide-gray-200 text-sm'>
                            <thead>
                                <tr className='text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                                    <th className='px-4 py-3'>MSSV</th>
                                    <th className='px-4 py-3'>Họ tên</th>
                                    <th className='px-4 py-3'>Loại</th>
                                    <th className='px-4 py-3'>Trạng thái</th>
                                    <th className='px-4 py-3'>Ghi chú</th>
                                    <th className='px-4 py-3'>Ảnh mới</th>
                                    <th className='px-4 py-3 cursor-pointer' onClick={() => handleSortToggle('createdAt')}>
                                        <div className='flex items-center gap-1'>
                                            Ngày
                                            <span className='text-xs text-muted-foreground'>
                                                {sortConfig.sort === 'createdAt'
                                                    ? sortConfig.order === 'asc'
                                                        ? '↑'
                                                        : '↓'
                                                    : '↕'}
                                            </span>
                                        </div>
                                    </th>
                                    <th className='px-4 py-3 text-right'>Hành động</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm text-gray-700'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className='py-12 text-center text-muted-foreground'>
                                            <div className='flex flex-col items-center gap-3'>
                                                <Loader2 className='size-6 animate-spin text-orange-500' />
                                                <p>Đang tải dữ liệu...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : errorMessage ? (
                                    <tr>
                                        <td colSpan={8} className='py-10'>
                                            <div className='flex flex-col items-center gap-3 text-center text-muted-foreground'>
                                                <p>{errorMessage}</p>
                                                <Button variant='outline' onClick={() => fetchRequests()}>
                                                    Thử lại
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className='py-10'>
                                            <div className='flex flex-col items-center gap-2 text-center text-muted-foreground'>
                                                <ShieldCheck className='size-10 text-orange-400' />
                                                <p>Không có yêu cầu nào phù hợp với bộ lọc.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((item, index) => {
                                        const threshold = Math.min(5, Math.ceil(filteredRequests.length / 2))
                                        const tooltipPositionClass = index < threshold ? 'top-full mt-2' : 'bottom-full mb-2'

                                        return (
                                            <tr key={`${item.studentId}-${item.createdAt}`} className='hover:bg-orange-50/40'>
                                                <td className='px-4 py-3 font-semibold text-gray-900'>{item.studentId}</td>
                                                <td className='px-4 py-3'>{item.fullName}</td>
                                                <td className='px-4 py-3'>{renderTypeBadge(item.type)}</td>
                                                <td className='px-4 py-3'>{renderStatusBadge(item.status)}</td>
                                                <td className='px-4 py-3'>
                                                    <div className='group relative max-w-xs text-sm text-gray-600'>
                                                        <p className='line-clamp-2'>{item.note || '—'}</p>
                                                        {item.note && (
                                                            <span
                                                                className={`pointer-events-none absolute left-1/2 z-20 hidden w-72 -translate-x-1/2 rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-700 shadow-2xl ring-1 ring-slate-200 group-hover:flex ${tooltipPositionClass}`}
                                                            >
                                                                {item.note}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className='px-4 py-3 text-center'>
                                                    {item.newImage ? (
                                                        <Button asChild variant='link' size='sm' className='text-center'>
                                                            <a href={item.newImage} target='_blank' rel='noreferrer'>
                                                                Xem ảnh
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className='inline-block text-xs text-muted-foreground'>Không có</span>
                                                    )}
                                                </td>
                                                <td className='px-4 py-3 text-sm text-gray-500'>{formatDate(item.createdAt)}</td>
                                                <td className='px-4 py-3 text-right'>
                                                    <div className='flex justify-end gap-2'>
                                                        <Button
                                                            size='sm'
                                                            className='bg-orange-500 text-white hover:bg-orange-600'
                                                            disabled={
                                                                item.status === 'approved' ||
                                                                item.status === 'rejected' ||
                                                                processingAction?.id === item.studentId
                                                            }
                                                            onClick={() => handleStatusUpdate(item.studentId, 'approved')}
                                                        >
                                                            {processingAction?.id === item.studentId &&
                                                                processingAction?.status === 'approved' ? (
                                                                <>
                                                                    <Loader2 className='size-4 animate-spin' />
                                                                    Đang duyệt
                                                                </>
                                                            ) : item.status === 'approved' ? (
                                                                <>
                                                                    <CheckCircle2 className='size-4' />
                                                                    Đã duyệt
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className='size-4' />
                                                                    Duyệt
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            className='border-rose-200 text-rose-600 hover:bg-rose-50'
                                                            disabled={
                                                                item.status === 'approved' ||
                                                                item.status === 'rejected' ||
                                                                processingAction?.id === item.studentId
                                                            }
                                                            onClick={() => handleStatusUpdate(item.studentId, 'rejected')}
                                                        >
                                                            {processingAction?.id === item.studentId &&
                                                                processingAction?.status === 'rejected' ? (
                                                                <>
                                                                    <Loader2 className='size-4 animate-spin' />
                                                                    Đang từ chối
                                                                </>
                                                            ) : item.status === 'rejected' ? (
                                                                <>
                                                                    <XCircle className='size-4' />
                                                                    Đã từ chối
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className='size-4' />
                                                                    Từ chối
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && !errorMessage && filteredRequests.length > 0 && (
                        <div className='mt-6 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-600 md:flex-row md:items-center md:justify-between'>
                            <p>
                                Hiển thị{' '}
                                <span className='font-semibold text-slate-900'>
                                    {startItem}-{endItem}
                                </span>{' '}
                                trong tổng số{' '}
                                <span className='font-semibold text-slate-900'>{metadata.totalItems}</span> yêu cầu
                            </p>

                            <div className='inline-flex flex-wrap items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-7 rounded-full px-3 text-xs text-slate-500 hover:text-slate-900'
                                    disabled={metadata.currentPage === 1}
                                    onClick={() => goToPage(1)}
                                >
                                    Đầu
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-7 w-7 rounded-full text-slate-500 hover:text-slate-900'
                                    disabled={metadata.currentPage === 1}
                                    onClick={() => handlePageChange('prev')}
                                >
                                    &lt;
                                </Button>

                                {paginationRange.map((page, index) =>
                                    page === DOTS ? (
                                        <span key={`dots-${index}`} className='px-1 text-slate-400'>
                                            ...
                                        </span>
                                    ) : (
                                        <Button
                                            key={page}
                                            variant='ghost'
                                            size='icon'
                                            className={`h-7 w-7 rounded-md text-xs font-semibold ${page === metadata.currentPage
                                                ? 'bg-orange-500 text-white'
                                                : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                            onClick={() => goToPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    )
                                )}

                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-7 w-7 rounded-full text-slate-500 hover:text-slate-900'
                                    disabled={totalPages !== 0 && metadata.currentPage >= totalPages}
                                    onClick={() => handlePageChange('next')}
                                >
                                    &gt;
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-7 rounded-full px-3 text-xs text-slate-500 hover:text-slate-900'
                                    disabled={totalPages === 0 || metadata.currentPage === totalPages}
                                    onClick={() => goToPage(totalPages)}
                                >
                                    Cuối
                                </Button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

