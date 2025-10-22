#!/bin/bash

echo "🧪 Ejecutando tests unitarios del backend..."

# Ejecutar tests con cobertura
echo "📊 Ejecutando tests con cobertura..."
go test -v -coverprofile=coverage.out ./tests/...

# Generar reporte de cobertura en HTML
echo "📈 Generando reporte de cobertura..."
go tool cover -html=coverage.out -o coverage.html

# Mostrar cobertura por función
echo "📋 Cobertura por función:"
go tool cover -func=coverage.out

# Verificar que la cobertura sea al menos 80%
COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | sed 's/%//')
echo "📊 Cobertura total: ${COVERAGE}%"

if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
    echo "✅ Cobertura aceptable (>= 80%)"
    exit 0
else
    echo "❌ Cobertura insuficiente (< 80%)"
    exit 1
fi
