# Use Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose backend application port
EXPOSE 9007

# Start backend application
CMD ["npm", "start"]
