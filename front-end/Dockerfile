FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || true

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 1. Khai báo ARG để nhận giá trị từ docker-compose build
ARG NEXT_PUBLIC_API_URL
# 2. Đặt nó làm biến môi trường ENV để lệnh build có thể sử dụng
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 3. Bây giờ lệnh build sẽ thấy biến môi trường
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .

EXPOSE 3002
ENV PORT=3002
CMD ["npm", "start"]