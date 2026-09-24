# Stage 1: Build application with Node 22
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV CI=false
ENV NODE_ENV=production

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built Vite assets from dist to Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
