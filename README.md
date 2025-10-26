# 🚀 TP 06 - Pruebas Unitarias | EMARVE

## 📋 Descripción del Proyecto

Este proyecto implementa un sistema completo de gestión de cursos con **168 tests unitarios** que cubren:

- **Backend**: 74 tests (Controllers + Services)
- **Frontend**: 94 tests (Axios Utils + Integration)

## 🏗️ Arquitectura

```
EMARVE/
├── backend/          # API REST en Go
│   ├── controllers/  # Manejo de requests HTTP
│   ├── services/     # Lógica de negocio
│   ├── dao/          # Acceso a datos
│   ├── domain/       # Modelos de dominio
│   └── tests/        # Tests unitarios
└── frontend/         # Aplicación Next.js
    └── front/
        ├── src/      # Código fuente
        └── __tests__/ # Tests unitarios
```

## 🚀 Formas de Ejecutar la Aplicación

### 1. 🐳 **Con Docker (Recomendado)**

#### Desarrollo (con hot reload):

```bash
make docker-dev
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- Base de datos: `localhost:3307`

#### Producción:

```bash
make docker-prod
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- Base de datos: `localhost:3306`

### 2. 🔧 **Desarrollo Local**

#### Instalar dependencias:

```bash
make install
```

#### Ejecutar backend:

```bash
make run-backend
```

#### Ejecutar frontend (en otra terminal):

```bash
make run-frontend
```

### 3. 🐳 **Comandos Docker Disponibles**

```bash
make docker-dev        # Desarrollo con hot reload
make docker-prod       # Producción
make docker-stop       # Detener contenedores
make docker-logs       # Ver logs
make docker-clean      # Limpiar todo
```

## 🧪 Testing

### Ejecutar todos los tests:

```bash
make test
```

### Tests específicos:

```bash
make test-backend      # Solo backend (74 tests)
make test-frontend     # Solo frontend (94 tests)
make test-coverage     # Con reportes de cobertura
```

### Generar reporte unificado:

```bash
make unified-report
```

## 📊 CI/CD Pipeline

El proyecto incluye un pipeline de Azure DevOps (`azure-pipelines.yml`) que:

### 🔄 **Stages del Pipeline:**

1. **Build Stage**

   - Compila backend (Go)
   - Compila frontend (Next.js)

2. **Test Stage**

   - Ejecuta tests del backend
   - Ejecuta tests del frontend
   - Genera reportes de cobertura

3. **Coverage Stage**

   - Analiza cobertura de código
   - Valida umbral mínimo (80%)

4. **Quality Gate**

   - Verifica que todos los tests pasen
   - Valida cobertura mínima

5. **Publish Artifacts**
   - Publica reportes de cobertura
   - Genera artefactos para despliegue

### 🎯 **Triggers:**

- `main` branch
- `develop` branch

### 📈 **Métricas:**

- **168 tests** ejecutándose automáticamente
- **Cobertura mínima**: 80%
- **Timeout**: 300 segundos

## 🐳 Configuración de Contenedores

### **Servicios incluidos:**

1. **MySQL Database**

   - Puerto: 3306 (prod) / 3307 (dev)
   - Base de datos: `emarve_db`
   - Usuario: `emarve_user`

2. **Backend (Go)**

   - Puerto: 8080
   - Hot reload en desarrollo
   - Health checks incluidos

3. **Frontend (Next.js)**
   - Puerto: 3000
   - Hot reload en desarrollo
   - Variables de entorno configuradas

### **Volúmenes persistentes:**

- Datos de MySQL
- Archivos de uploads
- Cache de dependencias

## 🔧 Variables de Entorno

### Backend:

```env
DB_HOST=mysql
DB_USER=emarve_user
DB_PASSWORD=emarve_password
DB_NAME=emarve_db
DB_PORT=3306
PORT=8080
```

### Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=production
```

## 📁 Estructura de Tests

### Backend (74 tests):

- **Controllers**: 24 tests
  - Course Controller: 15 tests
  - User Controller: 9 tests
- **Services**: 50 tests
  - User Service: 20 tests
  - Course Service: 30 tests

### Frontend (94 tests):

- **Axios Utils**: 80 tests
- **Integration Tests**: 14 tests

## 🎯 Comandos Útiles

```bash
# Ver ayuda completa
make help

# Estadísticas del proyecto
make stats

# Limpiar archivos temporales
make clean

# Generar reporte unificado
make unified-report
```

## 🚀 Despliegue

### **Desarrollo:**

1. `make docker-dev` - Inicia todo en modo desarrollo
2. Accede a `http://localhost:3000`

### **Producción:**

1. `make docker-prod` - Inicia todo en modo producción
2. Los contenedores se ejecutan en background
3. Accede a `http://localhost:3000`

### **CI/CD:**

- El pipeline se ejecuta automáticamente en cada push
- Todos los tests deben pasar para continuar
- Reportes de cobertura se generan automáticamente

## 📊 Reportes

- **Reporte HTML unificado**: `unified-test-report.html`
- **Cobertura backend**: `EMARVE/backend/coverage.html`
- **Cobertura frontend**: `EMARVE/frontend/front/coverage/`

## 🎉 Resultado Final

✅ **168 tests pasando**  
✅ **Cobertura completa**  
✅ **Pipeline CI/CD funcional**  
✅ **Contenedores Docker configurados**  
✅ **Hot reload en desarrollo**  
✅ **Reportes automáticos**

---

**¡El proyecto está listo para desarrollo y producción!** 🚀
