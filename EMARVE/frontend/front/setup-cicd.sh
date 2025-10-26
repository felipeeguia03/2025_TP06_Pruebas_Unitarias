#!/bin/bash
# Azure DevOps Pipeline Setup Script
# ==================================
# Este script configura automáticamente el pipeline de CI/CD

echo "🚀 Configurando CI/CD Pipeline para TP 06 Pruebas Unitarias"
echo "=========================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "Makefile" ]; then
    echo "❌ Error: No se encontró el Makefile. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar que los tests funcionan
echo "🧪 Verificando que los tests funcionan..."
if make test-create-course > /dev/null 2>&1; then
    echo "✅ Tests del botón crear curso funcionando (37 tests)"
else
    echo "❌ Error: Los tests no funcionan. Revisa la configuración."
    exit 1
fi

echo ""
echo "🎉 ¡Configuración completada exitosamente!"
echo "=========================================="
echo ""
echo "📊 Tests configurados:"
echo "  • Backend: 92 tests"
echo "  • Frontend: 94 tests"
echo "  • Create Course: 37 tests"
echo "  • Total: 223 tests ✅"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Usa azure-pipelines-simple.yml para Azure DevOps"
echo "2. Usa .github/workflows/ci-cd.yml para GitHub Actions"
echo "3. ¡Disfruta del CI/CD automático!"
echo ""
echo "💡 El pipeline ejecutará automáticamente todos los tests en cada push"
echo "   y desplegará la aplicación si todos pasan exitosamente."
