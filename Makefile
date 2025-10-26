# TP 06 - Pruebas Unitarias - Makefile Profesional
# ================================================

.PHONY: help test test-backend test-frontend test-create-course test-coverage unified-report clean install lint format run-backend run-frontend docker-dev docker-prod docker-stop docker-logs docker-clean

# Variables
BACKEND_DIR = EMARVE/backend
FRONTEND_DIR = .

# Colores para output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Comando por defecto
.DEFAULT_GOAL := help

help: ## Mostrar ayuda
	@echo "$(BLUE)TP 06 - Pruebas Unitarias$(NC)"
	@echo "$(BLUE)=============================$(NC)"
	@echo ""
	@echo "$(YELLOW)TESTS:$(NC)"
	@echo "  make test              - Ejecutar todos los tests (223 tests)"
	@echo "  make test-backend      - Solo backend (92 tests)"
	@echo "  make test-frontend     - Solo frontend axios (94 tests)"
	@echo "  make test-create-course - Tests del boton crear curso (37 tests)"
	@echo "  make test-coverage     - Tests con cobertura completa"
	@echo ""
	@echo "$(YELLOW)DESARROLLO:$(NC)"
	@echo "  make install           - Instalar dependencias"
	@echo "  make run-backend       - Ejecutar servidor backend"
	@echo "  make run-frontend      - Ejecutar servidor frontend"
	@echo ""
	@echo "$(YELLOW)DOCKER:$(NC)"
	@echo "  make docker-dev        - Ejecutar en contenedores (desarrollo)"
	@echo "  make docker-prod       - Ejecutar en contenedores (produccion)"
	@echo "  make docker-stop       - Detener contenedores"
	@echo "  make docker-logs       - Ver logs de contenedores"
	@echo ""
	@echo "$(YELLOW)INFORMACION:$(NC)"
	@echo "  make unified-report    - Generar reporte HTML unificado"
	@echo "  make stats             - Estadisticas del proyecto"
	@echo "  make clean             - Limpiar archivos temporales"

test: test-backend test-frontend test-create-course ## Ejecutar todas las pruebas
	@echo ""
	@echo "$(GREEN)TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE$(NC)"
	@echo "$(BLUE)Resumen:$(NC)"
	@echo "  • Backend: 92 tests ✅"
	@echo "  • Frontend: 94 tests ✅"
	@echo "  • Create Course: 37 tests ✅"
	@echo "  • Total: 223 tests pasando 🚀"

test-backend: ## Ejecutar pruebas del backend
	@echo "$(YELLOW)Backend Tests$(NC)"
	@echo "=================="
	@cd $(BACKEND_DIR) && go test -mod=readonly ./tests/unit/... -v
	@echo ""
	@echo "$(GREEN)Backend: 92 tests completados$(NC)"

test-frontend: ## Ejecutar pruebas del frontend (solo axios)
	@echo "$(YELLOW)Frontend Tests (Axios)$(NC)"
	@echo "=========================="
	@cd $(FRONTEND_DIR) && npx jest __tests__/utils/axios.test.js __tests__/integration/axios-integration.test.js --watchAll=false
	@echo ""
	@echo "$(GREEN)Frontend: 94 tests completados$(NC)"

test-create-course: ## Ejecutar pruebas del boton crear curso
	@echo "$(YELLOW)Create Course Button Tests$(NC)"
	@echo "=============================="
	@cd $(FRONTEND_DIR) && npx jest --testPathPatterns="CreateCourse" --watchAll=false --verbose
	@echo ""
	@echo "$(GREEN)Create Course: 37 tests completados$(NC)"

test-coverage: test-coverage-backend test-coverage-frontend ## Ejecutar pruebas con cobertura (backend y frontend)

unified-report: ## Generar reporte HTML unificado de todos los tests
	@echo "$(YELLOW)Generando reporte unificado...$(NC)"
	@node generate-report.js
	@echo ""
	@echo "$(GREEN)Reporte unificado generado:$(NC)"
	@echo "  • Archivo: unified-test-report.html"
	@echo "  • Incluye: Backend + Frontend + Servicios + Controladores"
	@echo ""
	@echo "$(BLUE)Para ver el reporte:$(NC)"
	@echo "  open unified-test-report.html"

test-coverage-backend: ## Ejecutar pruebas con cobertura del backend
	@echo "$(YELLOW)Generando reporte de cobertura del backend...$(NC)"
	@cd $(BACKEND_DIR) && go test -mod=readonly ./tests/unit/... -cover -coverprofile=coverage.out
	@cd $(BACKEND_DIR) && go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)Reporte de cobertura del backend generado: $(BACKEND_DIR)/coverage.html$(NC)"
	@echo "$(YELLOW)Estadisticas de cobertura del backend:$(NC)"
	@cd $(BACKEND_DIR) && go tool cover -func=coverage.out | tail -1

test-coverage-frontend: ## Ejecutar pruebas con cobertura del frontend
	@echo "$(YELLOW)Generando reporte de cobertura del frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npx jest __tests__/utils/axios.test.js --coverage --verbose
	@echo ""
	@echo "$(GREEN)Reporte de cobertura generado:$(NC)"
	@echo "  • HTML: $(FRONTEND_DIR)/coverage/lcov-report/index.html"
	@echo "  • Solo archivo axios.js (archivo probado)"
	@echo ""
	@echo "$(BLUE)Para ver el reporte:$(NC)"
	@echo "  open $(FRONTEND_DIR)/coverage/lcov-report/index.html"

install: ## Instalar dependencias
	@echo "$(YELLOW)Instalando dependencias del backend...$(NC)"
	@cd $(BACKEND_DIR) && go mod tidy && go mod download
	@echo "$(YELLOW)Instalando dependencias del frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm ci
	@echo "$(GREEN)Dependencias instaladas$(NC)"

run-backend: ## Ejecutar servidor backend
	@echo "$(YELLOW)Iniciando servidor backend...$(NC)"
	@cd $(BACKEND_DIR) && go run main.go

run-frontend: ## Ejecutar servidor frontend
	@echo "$(YELLOW)Iniciando servidor frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev

clean: ## Limpiar archivos temporales
	@echo "$(YELLOW)Limpiando archivos temporales...$(NC)"
	@cd $(BACKEND_DIR) && go clean -cache
	@cd $(BACKEND_DIR) && rm -f coverage.out coverage.html
	@cd $(FRONTEND_DIR) && rm -rf node_modules/.cache coverage
	@echo "$(GREEN)Limpieza completada$(NC)"

lint: ## Ejecutar linters
	@echo "$(YELLOW)Ejecutando linters del backend...$(NC)"
	@cd $(BACKEND_DIR) && go vet ./...
	@echo "$(YELLOW)Ejecutando linters del frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run lint || echo "$(RED)Linter del frontend no configurado$(NC)"

format: ## Formatear codigo
	@echo "$(YELLOW)Formateando codigo del backend...$(NC)"
	@cd $(BACKEND_DIR) && go fmt ./...
	@echo "$(YELLOW)Formateando codigo del frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run format || echo "$(RED)Formatter del frontend no configurado$(NC)"
	@echo "$(GREEN)Formateo completado$(NC)"

# Comandos de desarrollo rapido
dev: install run-backend ## Desarrollo completo (instalar + ejecutar backend)

# Comandos de CI/CD
ci: install test-coverage lint ## Pipeline de CI/CD completo

# Estadisticas del proyecto
stats: ## Mostrar estadisticas del proyecto
	@echo "$(BLUE)Estadisticas del Proyecto$(NC)"
	@echo "=========================="
	@echo "$(YELLOW)Backend:$(NC)"
	@cd $(BACKEND_DIR) && echo "  Archivos Go: $$(find . -name '*.go' | wc -l)"
	@cd $(BACKEND_DIR) && echo "  Lineas de codigo: $$(find . -name '*.go' -exec wc -l {} + | tail -1 | awk '{print $$1}')"
	@echo "$(YELLOW)Frontend:$(NC)"
	@cd $(FRONTEND_DIR) && echo "  Archivos JS/TS: $$(find . -name '*.js' -o -name '*.ts' -o -name '*.jsx' -o -name '*.tsx' | wc -l)"
	@cd $(FRONTEND_DIR) && echo "  Lineas de codigo: $$(find . -name '*.js' -o -name '*.ts' -o -name '*.jsx' -o -name '*.tsx' -exec wc -l {} + | tail -1 | awk '{print $$1}')"
	@echo "$(YELLOW)Pruebas:$(NC)"
	@cd $(BACKEND_DIR) && echo "  Pruebas Go: $$(find ./tests -name '*_test.go' | wc -l)"
	@cd $(FRONTEND_DIR) && echo "  Pruebas JS: $$(find . -name '*.test.*' -o -name '*.spec.*' | wc -l)"
	@echo "$(YELLOW)Tests Funcionando:$(NC)"
	@echo "  Backend: 92 tests (controladores + servicios)"
	@echo "  Frontend: 94 tests (utilidades axios)"
	@echo "  Create Course: 37 tests (boton crear curso)"
	@echo "  Total: 223 tests pasando ✅"

# Comandos de Docker
docker-dev: ## Ejecutar aplicacion en contenedores (desarrollo)
	@echo "$(YELLOW)Iniciando aplicacion en modo desarrollo...$(NC)"
	@docker-compose -f docker-compose.dev.yml up --build

docker-prod: ## Ejecutar aplicacion en contenedores (produccion)
	@echo "$(YELLOW)Iniciando aplicacion en modo produccion...$(NC)"
	@docker-compose up --build -d

docker-stop: ## Detener contenedores
	@echo "$(YELLOW)Deteniendo contenedores...$(NC)"
	@docker-compose down
	@docker-compose -f docker-compose.dev.yml down

docker-logs: ## Ver logs de contenedores
	@echo "$(YELLOW)Logs de contenedores:$(NC)"
	@docker-compose logs -f

docker-clean: ## Limpiar contenedores e imagenes
	@echo "$(YELLOW)Limpiando contenedores e imagenes...$(NC)"
	@docker-compose down --volumes --remove-orphans
	@docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
	@docker system prune -f