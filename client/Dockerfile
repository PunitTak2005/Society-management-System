# Stage 1: Build application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Clean install including devDependencies needed for building
RUN npm ci || npm install

COPY . .

# Pass CI flag and disable strict CI build failures
ENV CI=false
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Run build command
RUN npm run build

# Stage 2: Serve application with Nginx
FROM nginx:alpine

# Copy built assets to Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy default nginx config if needed, fallback to port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
