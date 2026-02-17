# Multi-stage build para PWA Task Manager
# Etapa 1: Build del proyecto con Node.js Alpine
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY index.html ./
COPY public ./public
COPY src ./src

# Build del proyecto
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Establecer variables de entorno
ENV TZ=America/Mexico_City

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos generados del build anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear directorio para certificados SSL (se montarán en runtime)
RUN mkdir -p /etc/nginx/ssl

# Crear archivo de health check
RUN echo "OK" > /usr/share/nginx/html/health.txt

# Exponer puertos
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health.txt || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
