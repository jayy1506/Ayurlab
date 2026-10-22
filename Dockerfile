# ==============================================================================
# Ayurlab Multi-Stage Production Dockerfile
# Builds the Vite React 18 Frontend & serves via Node.js Express 5 API
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the Frontend Assets
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests for efficient Docker caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies (including devDependencies required for Vite build)
RUN npm ci

# Copy entire source repository
COPY . .

# Compile Vite React application into frontend/dist
RUN npm run build --workspace=frontend

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000

# Install dumb-init or curl for container process management & healthchecks
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install only production dependencies for backend
RUN npm ci --omit=dev --workspace=backend

# Copy backend source code
COPY backend/ ./backend/

# Copy compiled frontend distribution from builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist

# Create uploads directory for proctored exam recordings
RUN mkdir -p backend/uploads/exam_recordings && \
    chmod -R 755 backend/uploads

# Expose server port
EXPOSE 5000

# Container Healthcheck against /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start Ayurlab Backend Production Server
CMD ["node", "backend/server.js"]
