# TP 06 - Pruebas Unitarias - Versión 2

## 1. Configuración de Testing

### Backend (Go)

Para el backend elegimos **Testify** como framework principal porque es el estándar de la industria en Go, ampliamente adoptado y con excelente soporte para assertions y mocks.

```bash
go get github.com/stretchr/testify
```

Para testing HTTP usamos la librería nativa `net/http/httptest` de Go, que es perfecta para probar endpoints sin necesidad de dependencias externas.

### Frontend (React/Next.js)

Para el frontend utilizamos **Jest** (que ya viene incluido con Next.js) junto con **@testing-library/react** porque se enfoca en la experiencia del usuario y simula interacciones reales.

```bash
npm install --save-dev @testing-library/user-event
```

Para mocking de APIs elegimos **MSW (Mock Service Worker)** porque intercepta requests HTTP reales y simula respuestas del backend de manera muy realista.

### CI/CD Pipeline

Configuramos **Azure DevOps Pipeline** con:

- Trigger automático en push a main
- Ejecución de tests backend y frontend en paralelo
- Generación de reportes de cobertura
- Deploy automático solo si todos los tests pasan

## 2. Implementación de Pruebas Unitarias

### Refactorización para Inyección de Dependencias

Para hacer nuestro código testeable, tuvimos que refactorizar y desacoplar los componentes usando **inyección de dependencias**. Este patrón permite que un service no dependa directamente de implementaciones concretas (como la base de datos), sino de interfaces.

#### Ejemplo de implementación:

**interfaces/user_service.go**

```go
type UserRepositoryInterface interface {
    GetUserByEmail(email string) (*dao.User, error)
    CreateUser(user dao.User) error
    GetUserById(id int64) (*dao.User, error)
    GetCourseIdsByUserId(userID int64) ([]int64, error)
    GetCourseById(courseID int64) (*dao.Course, error)
    InsertComment(userID, courseID int64, comment string) error
    SaveFile(file dao.File) error
}
```

**services/users_service.go**

```go
type UserService struct {
    repo interfaces.UserRepositoryInterface
}

func NewUserService(repo interfaces.UserRepositoryInterface) *UserService {
    return &UserService{repo: repo}
}
```

De esta manera, en producción inyectamos la implementación real (que conecta con la DB), y en los tests inyectamos un mock que simula el comportamiento.

### Estrategia de Testing con Mocks

Creamos mocks usando `testify/mock` para simular el comportamiento del repositorio:

```go
type MockUserRepository struct {
    mock.Mock
}

func (m *MockUserRepository) GetUserByEmail(email string) (*dao.User, error) {
    args := m.Called(email)
    return args.Get(0).(*dao.User), args.Error(1)
}
```

El método `Called()` registra que el mock fue invocado con ese argumento y devuelve valores pre-configurados.

### Ejemplo de Test Unitario

```go
func TestLogin_ValidCredentials(t *testing.T) {
    // Arrange
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    expectedUser := &dao.User{
        Id:           1,
        Email:        "test@example.com",
        PasswordHash: fmt.Sprintf("%x", md5.Sum([]byte("password123"))),
        Type:         true,
    }

    mockRepo.On("GetUserByEmail", "test@example.com").Return(expectedUser, nil)

    // Act
    token, err := service.Login("test@example.com", "password123")

    // Assert
    assert.NoError(t, err)
    assert.NotEmpty(t, token)
    mockRepo.AssertExpectations(t)
}

Firma de las funciones test:
func TestLogin_ValidCredentials( t *testing.T)
-TestLogin_ValidCredentials: nombre del test, empieza con Test para que go test lo detecte automaticamente
-t *testing.T: parámetro obligatorio para cualquier test en Go, es un puntero a un struct que Go proporciona para controlar el test, es decir, marcar errores, hacer logs, etc

assert.NoError(t, err) -> Verifica que la variable err sea nil
en nuestro código: log no es error porque las credenciales son correctas

assert.NotEmpty(t, token)-> verifica que la variable token no esté vacía
en nuestro código: la función login retorno un JWT válido

mockRepo.AssertExpectations(t)-> verifica que todas las llamadas al mock se hicieron
en nuestro código: GetUserByEmail("test@example.com") sera llamado exactamente una vez, sino dara error
```

### Estrategia AAA (Arrange-Act-Assert)

Siempre estructuramos nuestros tests siguiendo el patrón AAA para mejorar legibilidad:

#### **Arrange (Preparar)**

- Configuramos el estado inicial
- Creamos mocks y configuramos expectativas
- Preparamos datos de prueba

#### **Act (Actuar)**

- Ejecutamos la función/método que queremos probar
- Una sola acción por test

#### **Assert (Verificar)**

- Verificamos que el resultado sea el esperado
- Comprobamos valores de retorno y efectos secundarios

## 3. Testing Avanzado

### Manejo de Errores y Casos Excepcionales

Implementamos tests específicos para verificar que nuestro código maneja correctamente los errores:

```go
func TestLogin_UserNotFound(t *testing.T) {
    // Arrange
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    mockRepo.On("GetUserByEmail", "nonexistent@example.com").Return(nil, errors.New("user not found"))

    // Act
    token, err := service.Login("nonexistent@example.com", "password123")

    // Assert
    assert.Error(t, err)
    assert.Empty(t, token)
    assert.Contains(t, err.Error(), "error getting user from DB")
    mockRepo.AssertExpectations(t)
}
```

**Casos de error que cubrimos:**

- Usuario no encontrado
- Curso no encontrado
- Errores de base de datos
- Tokens JWT inválidos
- Validaciones de entrada

### Casos Edge y Validaciones

También probamos casos límite para asegurar que nuestro código es robusto:

```go
func TestLogin_EmptyEmail(t *testing.T) {
    // Arrange
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    // Act
    token, err := service.Login("", "password123")

    // Assert
    assert.Error(t, err)
    assert.Empty(t, token)
    assert.Contains(t, err.Error(), "email is required")
}
```

**Casos edge que cubrimos:**

- Strings vacíos y nulos
- IDs inválidos (negativos, cero)
- Tokens malformados
- Datos de entrada extremos
- Estados de error de dependencias

## 4. Refactorización de Controllers para Testing

### El Problema que Encontramos

Cuando empezamos a escribir las pruebas para los controllers, nos dimos cuenta de que **no podíamos testearlos** porque estaban acoplados directamente a los services. Los controllers llamaban directamente a funciones globales como `userService.Login()` sin poder inyectar mocks.

### Refactorización de User Controller

**ANTES (no testeable):**

```go
func Login(c *gin.Context) {
    var loginRequest userDomain.LoginRequest

    if err := c.ShouldBindJSON(&loginRequest); err != nil {
        // manejo de error
        return
    }

    // ❌ Llamada directa al service - no podemos mockearlo
    token, err := userService.Login(loginRequest.Email, loginRequest.Password)
    // resto del código...
}
```

**DESPUÉS (testeable):**

````go
type UserController struct {
    userService interfaces.UserServiceInterface
}

func NewUserController(userService interfaces.UserServiceInterface) *UserController {
    return &UserController{userService: userService}
}

func (uc *UserController) Login(c *gin.Context) {
    var loginRequest userDomain.LoginRequest

    if err := c.ShouldBindJSON(&loginRequest); err != nil {
        // manejo de error
        return
    }

    // ✅ Ahora podemos inyectar un mock
    token, err := uc.userService.Login(loginRequest.Email, loginRequest.Password)
    // resto del código...
}


Hicimos **exactamente lo mismo** con el Course Controller. El problema era idéntico - estaba acoplado directamente a las funciones del service.



### Actualización del Router

Una vez que refactorizamos todos los controllers, tuvimos que actualizar el router para inyectar las dependencias:

```go
func MapRoutes(engine *gin.Engine) {
    // Crear repositorios
    userRepo := dao.NewUserRepository()
    courseRepo := dao.NewCourseRepository()

    // Crear servicios con inyección de dependencias
    userService := users.NewUserService(userRepo)
    courseService := courses.NewCourseService(courseRepo)

    // Crear controladores con inyección de dependencias
    userController := users.NewUserController(userService)
    courseController := courses.NewCourseController(courseService)

    // Ahora usamos los métodos de los controllers
    engine.POST("/users/login", userController.Login)
    engine.POST("/users/register", userController.UserRegister)
    engine.GET("/courses/search", courseController.SearchCourse)
    // resto de rutas...
}
````

## 5. Pruebas de Frontend

Para el Mocking de APIs decidimos usar MSW (Mock Service Worker)debido a que intercepta requests HTTP y simula respuestas de backend. Jest po su parte lo usamos para ejecutar los test

Lo que queremos hacer es probar el componente Login de React de forma aislada para verificar:
-Renderización correcta
-Inputs funcionan y actualizan el estado
-Comportamiento esperado ante login exitoso o fallido
-Muestra de mensaje de error
-Redireccion al home cuando el login es unitario

Para eso nos apoyamos de MSW:
handlers.ts

import { http, HttpResponse } from 'msw'

export const handlers = [
http.post('http://localhost:8081/login', async ({ request }) => {
const { email, password } = await request.json()
if (email === 'test@example.com' && password === 'password123') {
return HttpResponse.json({ token: 'mock-jwt-token-123' }, { status: 200 })
}
return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
}),
http.get('http://localhost:8081/courses', () => {
return HttpResponse.json({ result: [{ id: 1, title: 'Curso de React' }] }, { status: 200 })
})
]

Este fragmento de código simula endpoints del backend (/login, /courses) con respuestas totalmente controladas, permitiendo probar todos los casos (exito, error, error de network) simualando un backend que devuelve datos fijos

server.ts:

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

aca lo que hacemos es levantar un mini servidor MSW en Node.js para que Jest lo use en los tests, lo usamos de la siguiente manera:

beforeAll(() => server.listen()) -> antes de todos los tests, leevanta nuestro mock server

afterEach(() => server.resetHandlers()) --> despues de cada test, resetea los handlers y cualquier request pendiente

afterAll(() => server.close()) -->al final de todos los tests, cierra el mock server

### Ejemplo de Test del Login Component

**Firma de la función test:**

```typescript
it("handles successful login", async () => {
```

- `it()` - Función de Jest para definir un test individual
- `"handles successful login"` - Descripción del test, explica qué comportamiento estamos probando
- `async` - Necesario porque usamos `await` para operaciones asíncronas
- `() => {}` - Arrow function que contiene la lógica del test

**ARRANGE - Preparar el estado inicial:**

```typescript
// ARRANGE - Preparar todo lo necesario
const user = userEvent.setup();
render(<Login />);

const emailInput = screen.getByLabelText(/email/i);
const passwordInput = screen.getByLabelText(/contraseña/i);
const submitButton = screen.getByRole("button", { name: /ingresa/i });
```

- `userEvent.setup()` - Configura el simulador de interacciones del usuario
- `render(<Login />)` - Renderiza el componente Login en el DOM virtual
- `screen.getByLabelText()` - Busca elementos por su label (más accesible que por ID)
- `screen.getByRole()` - Busca elementos por su rol semántico (button, input, etc.)

**ACT - Ejecutar la acción a probar:**

```typescript
// ACT - Simular lo que haría un usuario real
await user.type(emailInput, "test@example.com");
await user.type(passwordInput, "password123");
await user.click(submitButton);
```

- `user.type()` - Simula escribir texto en un input (dispara onChange, onFocus, etc.)
- `await` - Espera a que la interacción termine antes de continuar
- `user.click()` - Simula hacer click en un elemento

**ASSERT - Verificar los resultados:**

```typescript
// ASSERT - Verificar que todo funcionó
await waitFor(() => {
  expect(screen.getByText("Login exitoso")).toBeInTheDocument();
});
```

- `waitFor()` - Espera a que aparezca el elemento (para operaciones asíncronas)
- `expect().toBeInTheDocument()` - Verifica que el elemento esté presente en el DOM
- `screen.getByText()` - Busca elementos por su texto visible

### Por qué Usamos userEvent

En lugar de usar `fireEvent`, usamos **userEvent** porque simula **interacciones reales del usuario**. Por ejemplo, `userEvent.type()` no solo dispara el evento `onChange`, sino que también simula el comportamiento del navegador como el cursor, selección de texto, etc.

### Mocks de Dependencias

También tuvimos que mockear algunas dependencias de Next.js y del navegador:

```typescript
// Mock de Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock de window.location
const mockLocation = {
  href: "",
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});
```

### Configuración de Jest

Configuramos Jest para que funcione bien con Next.js y TypeScript:

```javascript
// jest.config.js
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Scripts de Testing

Configuramos varios scripts para diferentes escenarios:

```json
{
  "test": "jest", // Tests normales
  "test:watch": "jest --watch", // Modo watch para desarrollo
  "test:coverage": "jest --coverage", // Con reporte de cobertura
  "test:ci": "jest --coverage --watchAll=false" // Para CI/CD
}
```

## 5. Beneficios de la Implementación

### Backend

1. **Aislamiento completo** - Tests independientes de la base de datos real
2. **Simulación realista** - Mocks que simulan comportamiento real
3. **Cobertura completa** - Casos de éxito y error cubiertos
4. **Mantenibilidad** - Tests claros y bien estructurados
5. **CI/CD ready** - Configuración para pipelines automatizados

### Frontend

1. **Aislamiento completo** - Tests independientes del backend real
2. **Simulación realista** - MSW intercepta requests HTTP reales
3. **Cobertura completa** - Casos de éxito y error cubiertos
4. **Mantenibilidad** - Tests claros y bien estructurados
5. **CI/CD ready** - Configuración para pipelines automatizados

## 6. Resumen de Pruebas Implementadas

### Backend

- **User Service:** 15+ pruebas unitarias
- **Course Service:** 12+ pruebas unitarias
- **User Controller:** 8 pruebas de endpoints
- **Course Controller:** 12 pruebas de endpoints
- **Total Backend:** 47+ pruebas unitarias

### Frontend

- **Login Component:** 8 pruebas
- **Register Component:** 9 pruebas
- **Total Frontend:** 17 pruebas unitarias de componentes React

### Total del Proyecto

- **47+ pruebas backend** (Go + Testify)
- **17 pruebas frontend** (React + Jest + Testing Library)
- **64+ pruebas unitarias** en total

## 7. CI/CD Pipeline

### Configuración Azure DevOps

- **Trigger:** Push a main branch
- **Paralelización:** Tests backend y frontend ejecutan simultáneamente
- **Cobertura:** Reportes de cobertura generados automáticamente
- **Deploy:** Solo si todos los tests pasan
- **Notificaciones:** Alertas en caso de fallos

### Beneficios del Pipeline

1. **Detección temprana** de bugs
2. **Calidad asegurada** antes del deploy
3. **Feedback rápido** a los desarrolladores
4. **Confianza** en el código desplegado
5. **Automatización** del proceso de testing
