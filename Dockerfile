# Production-ready setup
FROM node:20-alpine
WORKDIR /app

# Install dependencies
RUN apk add --no-cache unixodbc python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Environment variables for production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Expose port
EXPOSE 3000

# Start the app in production mode
CMD ["npm", "run", "start"]