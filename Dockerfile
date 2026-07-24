# ---- Build Client ----
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Production ----
FROM node:20-alpine
WORKDIR /app

# Install server deps
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy server source
COPY server/ ./

# Copy built client into server's view path
COPY --from=client-builder /app/client/dist ./../client/dist

# Create uploads dir
RUN mkdir -p /app/server/uploads

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
