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
import googleLoginRouter from './routers/google-login.router'

const app = express()

/* ===== MIDDLEWARES ===== */
app.use(helmet())
app.use(hpp())
app.use(
  cors({
    // origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'localhost:3002'
    origin: '*'
  })
)

app.use(limiter)
app.use(express.json())
app.use(paginate.middleware(10, 30))

/* ===== ROUTES ===== */
app.use(syncResponseMiddleware)
app.use('/api', router)
app.get('/api/health', async (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is healthy',
    checks: {
      database: 'Connected'
    },
    uptime: process.uptime()
  })
})

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
    await checkDbConnection()

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