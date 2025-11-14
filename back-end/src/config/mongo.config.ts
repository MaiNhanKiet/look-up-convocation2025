import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import Bachelor from '~/models/schemas/Bachelor.schema'
import MissingInformation from '~/models/schemas/MissingInformation.schema'
dotenv.config()

const uri = process.env.DATABASE_URL || 'mongodb://kietmn:kietdeptrai123@localhost:27017/fpt_vote?authSource=admin'
class MongoConfig {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    return this.db.command({ ping: 1 })
  }

  // lấy collection user về
  // accessor property
  get bachelors(): Collection<Bachelor> {
    return this.db.collection(process.env.DB_BACHELOR_COLLECTION as string)
  }
  get missingInformation(): Collection<MissingInformation> {
    return this.db.collection(process.env.DB_MISSING_INFORMATION_COLLECTION as string)
  }
}

// tạo instance
export const mongo = new MongoConfig()
export default mongo
