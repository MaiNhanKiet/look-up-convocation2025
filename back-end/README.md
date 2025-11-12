# 🧩 **Backend — Node.js + TypeScript**

> Hệ thống API được xây dựng với **Express v5**, **Prisma**, và **PostgreSQL**, đảm bảo hiệu năng, bảo mật và khả năng mở rộng.
> Mục tiêu: Mô tả công nghệ, kiến trúc middleware, và hướng dẫn chạy / migrate nhanh.

---

## ⚙️ **Công nghệ chính**

| Công nghệ                                                | Mô tả                                            |
| -------------------------------------------------------- | ------------------------------------------------ |
| 🟢 **Node.js (>=18)**                                    | Nền tảng chính chạy backend                      |
| 💎 **TypeScript**                                        | Kiểm soát type và tăng tính ổn định              |
| 🚏 **Express v5**                                        | Web framework linh hoạt, hỗ trợ middleware chain |
| 🧱 **Prisma ORM + PostgreSQL**                           | ORM mạnh mẽ, dễ migrate, dễ maintain             |
| 🧠 **ioredis**                                           | Kết nối Redis (cache/session)                    |
| 🧰 **Winston + Daily Rotate File**                       | Ghi log và audit nâng cao                        |
| 🧍‍♂️ **jsonwebtoken + Google Auth**                        | Xác thực JWT và Google OAuth                     |
| 🧩 **express-rate-limit**, **helmet**, **hpp**, **cors** | Bảo mật & hạn chế abuse                          |
| 🧾 **express-validator**, **express-paginate**           | Validation và phân trang                         |

🧪 Dev Tools: `nodemon`, `ts-node`, `eslint`, `prettier`, `tsc-alias`, `prisma`.

---

## 🧭 **Luồng xử lý Request (Middleware Chain)**

Thứ tự xử lý trong `src/server.ts`:

1. 🛡 **Global Security** → `helmet()`, `hpp()`, `cors()`
2. 🚦 **Rate Limiter** → `express-rate-limit`
3. 📦 **Body Parser** → `express.json()`
4. 📄 **Pagination** → `express-paginate`
5. 🔁 **Response Sync** → `syncResponseMiddleware`
6. 🧭 **Router chính** → `/api/v1`
7. ❌ **404 Handler** → `notFoundMiddleware`
8. 💥 **Error Handler** → `defaultErrorHandler`

> 🔸 Một số route có middleware riêng như `auth.middleware`, `trackAction` để kiểm tra token hoặc log hành động.

---

## 🧱 **Middleware quan trọng**

| Middleware                    | Chức năng chính                                    |
| ----------------------------- | -------------------------------------------------- |
| 🧠 **Helmet**                 | Bổ sung header bảo mật (CSP, HSTS, XSS Protection) |
| 🧩 **HPP**                    | Ngăn chặn HTTP Parameter Pollution                 |
| 🌐 **CORS**                   | Cho phép truy cập từ domain hợp lệ                 |
| 🚧 **Rate Limiter**           | Giới hạn request/IP (VD: 100 req/15 phút)          |
| 📊 **Pagination**             | Đọc `page`, `limit` và trả metadata                |
| 🔁 **syncResponseMiddleware** | Chuẩn hoá `res.sendResponse({...})`                |
| 🚫 **notFoundMiddleware**     | Trả lỗi 404 khi không có endpoint                  |
| ⚠️ **defaultErrorHandler**    | Xử lý tất cả lỗi, ghi audit log                    |
| 🕵️ **trackAction**            | Gắn `req.auditContext` để logger biết ngữ cảnh     |
| 🧾 **Winston Logger**         | Ghi log ra console & rotate file hằng ngày         |

📘 **Response chuẩn hóa:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "metadata": {}
}
```

---

## 🧩 **Cấu hình chính & Biến môi trường**

| File                             | Mô tả                           |
| -------------------------------- | ------------------------------- |
| 📜 `prisma/schema.prisma`        | Model & datasource (PostgreSQL) |
| ⚙️ `src/config/prisma.config.ts` | Singleton PrismaClient          |
| 🔌 `src/config/redis.config.ts`  | Cấu hình kết nối Redis          |
| 🪵 `src/config/logger.config.ts` | Cấu hình Winston Logger         |

## 📁 **Cấu trúc thư mục (Directory structure)**

Dưới đây là cấu trúc thư mục chính của `back-end/` với mô tả chức năng từng thư mục/file quan trọng.

```
back-end/
├─ docker-compose.yml?            # (nếu có ở root workspace)
├─ package.json                   # scripts, dependencies
├─ tsconfig.json                  # TypeScript config (paths/alias)
├─ nodemon.json                   # cấu hình nodemon (dev)
├─ prisma/
│  ├─ schema.prisma               # Prisma schema (models + datasource)
│  ├─ seed.ts                     # seed dữ liệu (ts)
│  └─ migrations/                 # migration files (generated)
├─ src/
│  ├─ server.ts                   # entrypoint Express
│  ├─ @types/                      # các type declaration mở rộng
│  │  └─ express.d.ts
│  ├─ config/                     # cấu hình kết nối, logger, prisma, redis
│  │  ├─ prisma.config.ts
│  │  ├─ redis.config.ts
│  │  └─ logger.config.ts
│  ├─ constants/                  # enums, http status, messages
│  ├─ interfaces/                 # các interface dùng chung
│  ├─ middlewares/                # tất cả middleware (error, auth, limiter...)
│  │  ├─ api-response.middleware.ts
│  │  ├─ error.middlewares.ts
│  │  ├─ logger.middleware.ts
│  │  ├─ not-found.middleware.ts
│  │  └─ rare-limiter.middleware.ts
│  ├─ models/                     # các class/struct cho lỗi, token payload...
│  ├─ modules/                    # feature modules (vd: auth)
│  │  └─ auth/
│  │     ├─ auth.controller.ts
│  │     ├─ auth.service.ts
│  │     ├─ auth.respository.ts
│  │     ├─ auth.router.ts
│  │     └─ auth.middleware.ts
│  ├─ routers/                    # các router tổng hợp (v1, ...)
│  │  └─ v1/
│  │     └─ index.ts
│  └─ utils/                      # helper, wrapAsync, logger util, jwt util
│     ├─ connecttion.ts
│     ├─ handler.ts
│     ├─ jwt.ts
│     └─ logger.ts
├─ logs/                           # thư mục logs (winston rotate)
└─ README.md                       # file README (this file)
```

Ghi chú:

- Các file và thư mục có thể thay đổi nhẹ tuỳ theo feature mới được thêm vào.
- `modules/` theo mô hình feature-based: mỗi module (ví dụ `auth`) đóng gói router/controller/service/repository liên quan.

### 🌍 **Biến môi trường cần có**

```bash
DATABASE_URL=
PORT=3000
NODE_ENV=development
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
GOOGLE_CLIENT_ID=
```

---

## 🧰 **Scripts (npm)**

```bash
npm run dev              # Chạy server ở chế độ dev (nodemon)
npm run build            # Build TypeScript -> dist
npm run start            # Start server (dist/server.js)
npm run lint             # Kiểm tra eslint
npm run lint:fix         # Tự động fix lỗi lint
npm run prettier:fix     # Format toàn bộ mã nguồn
```

> 💡 Có thể dùng `bun install` hoặc `pnpm install` thay cho npm nếu thích.

---

## 🧬 **Prisma — Migration & Seed**

### 🧱 Migration

```bash
npx prisma migrate dev --name init
```

### ⚙️ Generate Prisma Client

```bash
npx prisma generate
```

### 🌱 Seed Data

```bash
npx prisma db seed
# hoặc
npm run prisma:seed
```

Kiểm tra file `prisma/seed.ts` để xem dữ liệu mẫu.

---

## 🚀 **Chạy nhanh dự án (Dev mode)**

1. Cài dependencies

   ```bash
   npm install
   ```

2. Tạo file `.env` (theo mẫu ở trên)
3. Generate Prisma Client

   ```bash
   npx prisma generate
   ```

4. Khởi động server

   ```bash
   npm run dev
   ```

> 🟢 Server mặc định chạy trên `http://localhost:3000`

---

## 🔐 **Ghi chú vận hành & bảo mật**

- ⚠️ Không commit `.env` hoặc thông tin nhạy cảm (DB, Redis, JWT Secret)
- 🧱 Tắt `log: ['query']` của Prisma khi lên production
- 🔒 Giới hạn domain CORS cho frontend chính thức
- 💾 Luôn chạy migration & backup trước deploy

---

## 🧾 **Tổng kết**

✅ Tổng quan công nghệ chính
✅ Mô tả luồng middleware chi tiết
✅ Hướng dẫn migrate, seed và run dev
✅ Lưu ý vận hành & bảo mật
