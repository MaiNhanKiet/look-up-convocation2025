import dotenv from 'dotenv'
import mongo from '~/config/mongo.config'
import HTTP_STATUS from '~/constants/httpStatus'
import { BachelorImportPayload } from '~/interfaces/request/bachelor.requests'
import { ErrorWithStatus } from '~/models/Errors'
import MissingInformation from '~/models/schemas/MissingInformation.schema'
dotenv.config()

class BachelorServices {
  async findBachelorById(studentId: string) {
    const bachelor = await mongo.bachelors.findOne({ studentId: studentId })
    if (!bachelor) {
      throw new ErrorWithStatus({
        statusCode: 404,
        message: 'Không tìm thấy sinh viên với Student ID',
        name: 'BachelorNotFoundError'
      })
    } else {
      return bachelor
    }
  }

  async addImageRequest({ studentId, newImageUrl, note }: { studentId: string; newImageUrl: string; note: string }) {
    const bachelor = await bachelorServices.findBachelorById(studentId)
    if (!bachelor) {
      throw new ErrorWithStatus({
        statusCode: 404,
        message: 'Không tìm thấy sinh viên với Student ID',
        name: 'BachelorNotFoundError'
      })
    }

    if (bachelor.requests?.some((request) => request.status === 'pending' && request.type === 'image')) {
      throw new ErrorWithStatus({
        statusCode: 409,
        message: 'Bạn đang có một yêu cầu Sai Ảnh đang chờ xử lý.',
        name: 'RequestAlreadyExistsError'
      })
    }

    // 2. Thực hiện cập nhật nguyên tử (atomic update)
    await mongo.bachelors.updateOne(
      { studentId },
      {
        $push: {
          requests: {
            newImageUrl,
            note,
            status: 'pending',
            type: 'image',
            createdAt: new Date()
          }
        }
      }
    )
  }

  async approveRequest({ studentId, status: newStatus }: { studentId: string; status: 'approved' | 'rejected' }) {
    const result = await mongo.bachelors.updateOne(
      {
        studentId: studentId,
        'requests.status': 'pending'
      },
      {
        $set: {
          'requests.$.status': newStatus
        }
      }
    )

    if (result.matchedCount === 0) {
      throw new ErrorWithStatus({
        statusCode: 404,
        message: 'Không tìm thấy sinh viên hoặc không có yêu cầu nào đang chờ xử lý.',
        name: 'NoPendingRequestError'
      })
    }

    return result
  }

  async addMissingInformation({
    studentId,
    fullName,
    email,
    phoneNumber,
    note
  }: {
    studentId: string
    fullName: string
    email: string
    phoneNumber: string
    note: string
  }) {
    const missingInformation = await mongo.missingInformation.findOne({ studentId: studentId, status: 'pending' })
    if (missingInformation) {
      throw new ErrorWithStatus({
        statusCode: 409,
        message: 'Bạn đang có một yêu cầu Sai Thông Tin đang chờ xử lý.',
        name: 'MissingInformationAlreadyExistsError'
      })
    }
    await mongo.missingInformation.insertOne(
      new MissingInformation({
        studentId,
        fullName,
        email,
        phoneNumber,
        note,
        status: 'pending',
        createdAt: new Date()
      })
    )
  }

  async addInfoRequest({
    studentId,
    fullName,
    email,
    note
  }: {
    studentId: string
    fullName: string
    email: string
    note: string
  }) {
    const bachelor = await bachelorServices.findBachelorById(studentId)
    if (!bachelor) {
      throw new ErrorWithStatus({
        statusCode: 404,
        message: 'Không tìm thấy sinh viên với Student ID',
        name: 'BachelorNotFoundError'
      })
    }

    if (bachelor.requests?.some((request) => request.status === 'pending' && request.type === 'information')) {
      throw new ErrorWithStatus({
        statusCode: 409,
        message: 'Bạn đang có một yêu cầu đang chờ xử lý.',
        name: 'RequestAlreadyExistsError'
      })
    }

    // 2. Thực hiện cập nhật nguyên tử (atomic update)
    await mongo.bachelors.updateOne(
      { studentId },
      {
        $push: {
          requests: {
            fullName,
            email,
            note,
            status: 'pending',
            type: 'information',
            createdAt: new Date()
          }
        }
      }
    )
  }

  async getRequests(options: any, baseFilter: any = {}) {
    const { page, limit, search, sort, order } = options

    // 1. Chuẩn bị giá trị Phân trang (Vì luôn có, không cần fallback)
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skipNum = (pageNum - 1) * limitNum

    // 2. Xây dựng $match stage
    const matchStage: any = { ...baseFilter }

    // Chỉ search theo studentId và fullName
    if (search) {
      matchStage.$or = [
        { studentId: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ]
    }

    // 3. Xây dựng $sort stage
    const sortStage: any = {}
    if (sort && order) {
      const sortOrder = order === 'desc' ? -1 : 1
      const rootFields = ['studentId', 'fullName']
      const sortField = rootFields.includes(sort) ? sort : `requests.${sort}`

      sortStage[sortField] = sortOrder
    } else {
      // Sắp xếp mặc định
      sortStage['requests.createdAt'] = -1
    }

    // 4. Xây dựng pipeline lấy Dữ liệu
    const dataPipeline: any[] = [
      { $unwind: '$requests' },
      { $match: matchStage },
      { $sort: sortStage },
      { $skip: skipNum },
      { $limit: limitNum },
      {
        $project: {
          studentId: 1,
          fullName: 1,
          requests: 1
        }
      }
    ]

    // 5. Xây dựng pipeline Đếm
    const countPipeline: any[] = [{ $unwind: '$requests' }, { $match: matchStage }, { $count: 'total' }]

    // 6. Thực thi song song
    const [requests, totalResult] = await Promise.all([
      mongo.bachelors.aggregate(dataPipeline).toArray(),
      mongo.bachelors.aggregate(countPipeline).toArray()
    ])

    const total = totalResult[0]?.total || 0

    // 7. Trả về kết quả
    // 7. Map kết quả thành shape phẳng và trả về kèm metadata
    const mapped = requests.map((doc: any) => {
      // doc structure: { _id: <bachelorId>, studentId, fullName, requests: { ... } }
      const req = doc.requests || {}
      return {
        _id: doc._id,
        studentId: doc.studentId,
        fullName: doc.fullName,
        newImage: req.newImageUrl ?? req.newImage ?? null,
        note: req.note ?? null,
        status: req.status ?? null,
        type: req.type ?? null,
        createdAt: req.createdAt ?? null
      }
    })

    const totalPages = limitNum > 0 ? Math.ceil(total / limitNum) : 0

    return {
      data: mapped,
      metadata: {
        totalItems: total,
        currentPage: pageNum,
        totalPages,
        limit: limitNum
      }
    }
  }
}

const bachelorServices = new BachelorServices()
export default bachelorServices
