FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (including dev deps for build)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || true

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --production --legacy-peer-deps || true

# Copy built output and prisma (if present)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
ENV PORT=4000

CMD ["node", "dist/server.js"]
