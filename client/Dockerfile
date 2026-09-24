# Stage 1: Build stage (Upgraded to Node 22 for Vite 8 compatibility)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Set environment variables for production build
ENV CI=false
ENV NODE_ENV=production

# Run the Vite build
RUN npm run build

# Stage 2: Serve stage with Nginx
FROM nginx:alpine

# Copy built assets to Nginx default directory
COPY --from=builder /app/dist /usr/share/nginx/html 2>/dev/null || COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
