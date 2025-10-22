# ==========================
# Etapa de construcción
# ==========================
FROM golang:1.24-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache git

# Crear directorio de trabajo
WORKDIR /app

# Copiar go.mod y go.sum para cache de dependencias
COPY go.mod go.sum ./

# Descargar dependencias
RUN go mod download

# Copiar el resto del código (incluyendo wait-for-db.sh)
COPY . .

# Compilar la aplicación
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# ==========================
# Etapa de ejecución
# ==========================
FROM alpine:latest

# Instalar dependencias necesarias para runtime
RUN apk --no-cache add ca-certificates mysql-client bash

# Crear directorio de trabajo
WORKDIR /app

# Copiar el binario desde la etapa de construcción
COPY --from=builder /app/main /app/main

# Copiar el script wait-for-db desde la etapa de construcción
COPY --from=builder /app/wait-for-db.sh /app/wait-for-db.sh

# Dar permisos de ejecución al script
RUN chmod +x /app/wait-for-db.sh

# Crear directorio de uploads
RUN mkdir -p /app/uploads

# Exponer el puerto
EXPOSE 8080

# Comando por defecto
CMD ["/app/main"]
