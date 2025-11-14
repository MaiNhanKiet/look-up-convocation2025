import { ObjectId } from "mongodb"

interface MissingInformationType {
    _id?: ObjectId
    studentId: string
    fullName: string
    email: string
    phoneNumber: string
    note: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: Date
}

export default class MissingInformation {
    _id?: ObjectId
    studentId: string
    fullName: string
    email: string
    phoneNumber: string
    note: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: Date

    constructor(missingInformation: MissingInformationType) {
        this._id = missingInformation._id || new ObjectId()
        this.studentId = missingInformation.studentId
        this.fullName = missingInformation.fullName
        this.email = missingInformation.email
        this.phoneNumber = missingInformation.phoneNumber
        this.note = missingInformation.note
        this.status = 'pending'
        this.createdAt = missingInformation.createdAt
    }
}