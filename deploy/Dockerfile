FROM node:20-bullseye-slim AS builder

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
# Copy frontend (if it has a package.json, though we mostly just need the static files)
# COPY frontend/package*.json ./frontend/ 

# Install dependencies
WORKDIR /app/backend
RUN npm ci

# Copy the rest of the application code
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Generate Prisma Client
WORKDIR /app/backend
RUN npx prisma generate

FROM node:20-bullseye-slim AS runner

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts from builder
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend ./frontend

# Expose API port
EXPOSE 4545

# Start command
WORKDIR /app/backend
CMD ["npm", "start"]
