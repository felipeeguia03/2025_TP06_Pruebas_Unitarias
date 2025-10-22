#!/bin/sh
# wait-for-db.sh: espera hasta que la base de datos esté lista

set -e

host="$1"
shift

echo "=== Iniciando wait-for-db.sh ==="
echo "Host de la base de datos: $host"
echo "Variables de entorno:"
echo "  DB_HOST: $DB_HOST"
echo "  DB_USER: $DB_USER"
echo "  DB_PASSWORD: [HIDDEN]"
echo "  DB_NAME: $DB_NAME"
echo "  DB_PORT: $DB_PORT"

echo "Esperando a que la base de datos en $host esté lista..."

# Contador para evitar espera infinita
counter=0
max_attempts=30

until nc -z "$host" "$DB_PORT" >/dev/null 2>&1; do
  counter=$((counter + 1))
  if [ $counter -ge $max_attempts ]; then
    echo "ERROR: Timeout esperando la base de datos después de $max_attempts intentos"
    echo "Probando conexión manual para debug..."
    nc -z "$host" "$DB_PORT" && echo "Puerto abierto" || echo "Puerto cerrado"
    exit 1
  fi
  echo "Intento $counter/$max_attempts - Esperando 2 segundos..."
  sleep 2
done

echo "✅ Base de datos lista. Arrancando backend..."
exec "$@"