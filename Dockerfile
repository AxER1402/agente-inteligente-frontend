# ---- Build stage ----
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (use npm ci si existe package-lock, sino npm install)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the app (usa .env.production automáticamente)
RUN npm run build

# ---- Serve stage ----
FROM node:20-slim AS runner

WORKDIR /app

# Instalar 'serve' para servir archivos estáticos
RUN npm install -g serve

# Copiar solo los archivos del build
COPY --from=builder /app/dist ./dist

# Exponer puerto (Railway lo inyecta via $PORT)
EXPOSE 3000

# Servir la carpeta dist con soporte de SPA (--single para react-router)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
