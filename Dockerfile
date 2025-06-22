# Multi-stage build for RenX Neural Trading Platform
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies for both client and server
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

RUN cd client && npm ci --only=production
RUN cd server && npm ci --only=production
RUN cd shared && npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependency files
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY client ./client
COPY server ./server
COPY shared ./shared

# Build the client
WORKDIR /app/client
RUN npm run build

# Build the server
WORKDIR /app/server
RUN npm run build

# AI Backend Stage
FROM python:3.11-slim AS ai-backend

WORKDIR /app/ai-backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy AI backend files
COPY ai-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ai-backend .

# Download NLTK data
RUN python download_nltk_data.py

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/shared ./shared

# Copy node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy AI backend
COPY --from=ai-backend /app/ai-backend ./ai-backend
COPY --from=ai-backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=ai-backend /usr/local/bin /usr/local/bin

# Install Python in production image
RUN apk add --no-cache python3 py3-pip

USER nextjs

EXPOSE 3344 8181

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3344/health || exit 1

# Start script
COPY start-production.sh .
RUN chmod +x start-production.sh

CMD ["./start-production.sh"] 