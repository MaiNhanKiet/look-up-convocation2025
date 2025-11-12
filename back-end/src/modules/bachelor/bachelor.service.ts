import dotenv from 'dotenv'
import mongo from '~/config/mongo.config'
import { ErrorWithStatus } from '~/models/Errors'
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

    if (bachelor.requests?.some((request) => request.status === 'pending')) {
      throw new ErrorWithStatus({
        statusCode: 409,
        message: 'Sinh viên này đã có một yêu cầu đang chờ xử lý.',
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
            createdAt: new Date()
          }
        },
        $set: { isRequested: true }
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
}

const bachelorServices = new BachelorServices()
export default bachelorServices
