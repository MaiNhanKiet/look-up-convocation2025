interface UserType {
  _id?: string
  fullName: string
  email: string
  token?: string
  createdAt: Date
}

export default class User {
  _id?: string
  fullName: string
  email: string
  token?: string
  createdAt: Date

  constructor(user: UserType) {
    this._id = user._id
    this.fullName = user.fullName
    this.email = user.email
    this.createdAt = user.createdAt
  }
}
