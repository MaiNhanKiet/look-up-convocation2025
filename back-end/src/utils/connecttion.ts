import mongo from '~/config/mongo.config'

export const checkDbConnection = async () => {
  try {
    await mongo.connect()
    console.log('✅ You successfully connected to \x1b[36mMongoDB!\x1b[0m')
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB')
    throw error
  }
}
