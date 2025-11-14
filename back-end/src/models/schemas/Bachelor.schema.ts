import { ObjectId } from 'mongodb'

// Interface cho session
interface SessionType {
  number: number
  checkin: string
  presentation: string
}

// Interface cho images
interface ImagesType {
  led: string
  exhibit: string
}

interface RequestEdit {
  fullName?: string
  email?: string
  major?: string
  faculty?: string
  note?: string
  newImageUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'image' | 'information'
  createdAt: Date
}

// Interface dùng để định nghĩa Bachelor cần những gì khi tạo ra
interface BachelorType {
  _id?: ObjectId
  studentId: string
  fullName: string
  email: string
  major: string
  faculty: string
  date: string
  hall: string
  session: SessionType
  seat: string
  parentSeat: string
  images: ImagesType
  requests?: RequestEdit
}

// Class sẽ sử dụng các định nghĩa của interface để tạo Bachelor đầy đủ
// thông tin thì mới gửi lên database
export default class Bachelor {
  _id?: ObjectId
  studentId: string
  fullName: string
  email: string
  major: string
  faculty: string
  date: string
  hall: string
  session: SessionType
  seat: string
  parentSeat: string
  images: ImagesType
  requests?: RequestEdit[]

  constructor(bachelor: BachelorType) {
    this._id = bachelor._id || new ObjectId()
    this.studentId = bachelor.studentId
    this.fullName = bachelor.fullName
    this.email = bachelor.email
    this.major = bachelor.major
    this.faculty = bachelor.faculty
    this.date = bachelor.date
    this.hall = bachelor.hall
    this.session = bachelor.session
    this.seat = bachelor.seat
    this.parentSeat = bachelor.parentSeat
    this.images = bachelor.images
  }
}
