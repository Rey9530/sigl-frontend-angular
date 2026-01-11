# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL
ARG API_URL=http://localhost:3000/api

# Install dependencies
COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application with production configuration
RUN yarn build --configuration=production

# Production image with nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist/*/browser /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
