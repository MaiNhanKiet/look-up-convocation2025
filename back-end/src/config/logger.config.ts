// src/config/logger.ts

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import dotenv from 'dotenv'
dotenv.config()

// 1. Định nghĩa các cấp độ log (Giữ nguyên)
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
}

// 2. Định dạng cho việc hiển thị trên CONSOLE ở môi trường DEV (Giữ nguyên)
// Format này giúp log dễ đọc, có màu sắc.
const consoleDevFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...data }) => {
    // Chuyển đổi object rỗng thành chuỗi rỗng để không in ra `{}` thừa
    const dataString = Object.keys(data).length ? JSON.stringify(data, null, 2) : ''
    return `[ ${timestamp} ] [ ${level} ] [ ${message} ]: \n ${dataString}`
  })
)

// 3. Định dạng cho việc ghi ra FILE và CONSOLE ở môi trường PROD (Giữ nguyên)
// Format này là JSON, để các hệ thống máy tính có thể đọc và phân tích.
const jsonFormat = winston.format.combine(winston.format.timestamp(), winston.format.json())

// 4. Tạo mảng transports (đích đến của log)
const transports: winston.transport[] = []

// 5. Cấu hình transports dựa trên môi trường
if (process.env.NODE_ENV === 'development') {
  // a. Thêm transport cho Console với định dạng dễ đọc
  transports.push(
    new winston.transports.Console({
      format: consoleDevFormat,
      level: 'info'
    })
  )

  // b. Thêm transport cho File xoay vòng để lưu trữ chi tiết
  transports.push(
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: jsonFormat,
      level: 'debug'
    })
  )
} else {
  transports.push(
    new winston.transports.Console({
      format: jsonFormat
    })
  )
}

// 6. Tạo logger cuối cùng với các cấu hình đã định nghĩa
const auditLogger = winston.createLogger({
  levels: logLevels,
  transports: transports,
  exitOnError: false
})

export default auditLogger
