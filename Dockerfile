# Multi-stage Dockerfile for production-grade Next.js 15 app

# 1) Dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app

# Install OS deps
RUN apk add --no-cache libc6-compat

# Copy lockfile and package manifest
COPY package.json package-lock.json ./

# Install dependencies (include devDeps here so builder has what it needs)
RUN npm ci

# 2) Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Copy all source files required for build, including tsconfig for "@/..." paths
COPY tsconfig.json ./
COPY next.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY public ./public
COPY src ./src

# Build Next.js app (CI-grade: types and lint will run per next.config.ts)
RUN npm run build

# 3) Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only the necessary production assets from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts

USER nextjs

EXPOSE 3000

# Healthcheck for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

# Use Next.js built-in server
CMD ["npm", "start"]