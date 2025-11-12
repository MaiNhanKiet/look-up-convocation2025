import { Role } from '~/constants/database.enum'
import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enum'

export interface TokenPayLoad extends JwtPayload {
  user_id: string
  role: Role[]
  token_type: TokenType
}

export interface TokenGoogleVerifyPayload {
  sub: string
  name: string
  email: string
  picture: string
  iat: number
  exp: number
}
