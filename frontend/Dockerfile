# ============================================
# BaleTani Frontend - Dockerfile
# React + Vite with Nginx for Production
# ============================================

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_ML_API_URL=http://localhost:8000

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ML_API_URL=$VITE_ML_API_URL

# Build the application
RUN npm run build

# Stage 2: Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
