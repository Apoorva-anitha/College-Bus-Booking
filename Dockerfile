# Multi-stage Dockerfile for St. Joseph Bus Booking System
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code and config files
COPY . .

# Build Vite frontend and bundled Node server
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./index.html

# Expose the standard port
EXPOSE 3000

# Start compiled server
CMD ["node", "dist/server.cjs"]
