# Etapa de construcción
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación (las variables de entorno se inyectan en runtime)
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cambiar propietario de los archivos
RUN chown -R nextjs:nodejs /app

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variable de entorno para el puerto
ENV PORT 3000

# Comando de ejecución
CMD ["node", "server.js"] 