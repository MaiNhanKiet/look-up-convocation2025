import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import cors from 'cors'
import { limiter } from './middlewares/rare-limiter.middleware'
import paginate from 'express-paginate'
import { syncResponseMiddleware } from './middlewares/api-response.middleware'
import router from './routers'
import { notFoundMiddleware } from './middlewares/not-found.middleware'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { logEvent } from './utils/logger'
import { ActionLog, AuditStatusLog, ResourceLog } from './constants/enum'
import { checkDbConnection } from './utils/connecttion'

const app = express()

/* ===== MIDDLEWARES ===== */
app.use(helmet())
app.use(hpp())
app.use(
  cors({
    origin: '*'
  })
)
app.use(limiter)
app.use(express.json())
app.use(paginate.middleware(10, 30))

/* ===== ROUTES ===== */
app.use(syncResponseMiddleware)
app.use('/api/', router)

/* ===== 404 NOT FOUND ===== */
app.use(notFoundMiddleware)

/* ===== ERROR HANDLER ===== */
app.use(defaultErrorHandler)

/* ===== START SERVER ===== */
const PORT = Number(process.env.PORT) || 3000
const startServer = async () => {
  try {
    /* ===== CHECK DATABASE AND REDIS CONNECTIONS ===== */
    // await Promise.all([checkDbConnection(), checkRedisConnection()])
    checkDbConnection()

    app.listen(PORT, () => {
      // logEvent({
      //   actor: {},
      //   action: ActionLog.Server,
      //   resource: ResourceLog.System,
      //   status: AuditStatusLog.Success,
      //   details: { message: `Server started on port ${PORT}` }
      // })
      console.log(`\x1b[34mPROJECT OPEN ON PORT: \x1b[31m${PORT}\x1b[0m`)
    })
  } catch (error) {
    // logEvent({
    //   actor: {},
    //   action: ActionLog.Server,
    //   resource: ResourceLog.System,
    //   status: AuditStatusLog.Failure,
    //   details: { message: `Server failed to start on port ${PORT}` },
    //   error: error as Error
    // })
    process.exit(1)
  }
}
startServer()
