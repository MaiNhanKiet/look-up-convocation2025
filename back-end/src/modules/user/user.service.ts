import dotenv from 'dotenv'
import mongo from '~/config/mongo.config'
import { ErrorWithStatus } from '~/models/Errors'
import { signToken } from '~/utils/jwt'
dotenv.config()

class UserServices {
  private signToken(email: string, fullName: string) {
    return signToken({
      payload: { email, fullName },
      privateKey: process.env.JWT_SECRET_TOKEN as string,
      options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_IN) }
    })
  }

  async findUserByEmail(email: string) {
    const user = await mongo.users.findOne({ email })
    if (!user) {
      throw new ErrorWithStatus({
        statusCode: 404,
        message: 'Không tìm thấy người dùng',
        name: 'UserNotFoundError'
      })
    }
    const token = await this.signToken(user.email, user.fullName)
    return {
      email: user.email,
      token
    }
  }
}

const userServices = new UserServices()
export default userServices
