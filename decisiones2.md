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

## 4. Pruebas de Frontend

### Tecnologías Elegidas

**Framework de Testing:**

- **Jest** - Framework principal para JavaScript/TypeScript
- **@testing-library/react** - Especializada en testing de componentes React
- **@testing-library/user-event** - Simulación de interacciones del usuario
- **@testing-library/jest-dom** - Matchers adicionales para DOM

**Mocking y Simulación:**

- **MSW (Mock Service Worker)** - Intercepta requests HTTP y simula respuestas del backend
- **Jest Mocks** - Para mockear funciones, módulos y dependencias

**Configuración:**

- **Next.js Jest Config** - Configuración optimizada para Next.js
- **jsdom** - Entorno que simula el DOM del navegador
- **TypeScript** - Soporte completo para TypeScript en tests

### Componentes Testeados

#### Login Component

**Funcionalidades probadas:**

- ✅ Renderización correcta del formulario
- ✅ Manejo de inputs y actualización de estado
- ✅ Validación de campos requeridos
- ✅ Login exitoso con credenciales válidas
- ✅ Manejo de errores con credenciales inválidas
- ✅ Manejo de errores de red
- ✅ Redirección a home después del login exitoso
- ✅ Limpieza de mensajes de error

**Cobertura:** 8 casos de prueba

#### Register Component

**Funcionalidades probadas:**

- ✅ Renderización correcta del formulario de registro
- ✅ Manejo de inputs (username, email, password)
- ✅ Selección de tipo de usuario (Estudiante/Profesor)
- ✅ Validación de campos requeridos
- ✅ Registro exitoso
- ✅ Manejo de errores con campos faltantes
- ✅ Manejo de errores de red
- ✅ Redirección a home después del registro exitoso
- ✅ Mantenimiento del estado del formulario durante cambios

**Cobertura:** 9 casos de prueba

### Ejemplo de Prueba Frontend con Estrategia AAA

```typescript
it("handles successful login", async () => {
  // ARRANGE - Preparar el estado inicial
  const mockLogin = login as jest.MockedFunction<typeof login>;
  mockLogin.mockResolvedValue("mock-jwt-token-12345");

  const user = userEvent.setup();
  render(<Login />);

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/contraseña/i);
  const submitButton = screen.getByRole("button", { name: /ingresa/i });

  // ACT - Ejecutar la acción a probar
  await user.type(emailInput, "test@example.com");
  await user.type(passwordInput, "password123");
  await user.click(submitButton);

  // ASSERT - Verificar los resultados esperados
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  expect(localStorage.setItem).toHaveBeenCalledWith(
    "tokenType",
    "mock-jwt-token-12345"
  );
});
```

### Mocks Implementados

#### MSW Handlers

```typescript
export const handlers = [
  http.post("http://localhost:8081/login", async ({ request }) => {
    const { email, password } = await request.json();
    if (email === "test@example.com" && password === "password123") {
      return HttpResponse.json(
        { token: "mock-jwt-token-123" },
        { status: 200 }
      );
    }
    return HttpResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }),
];
```

#### Jest Mocks

- **Axios functions** - Mock de funciones de API
- **Next.js router** - Mock de navegación
- **Window.location** - Mock de redirecciones
- **localStorage** - Mock de almacenamiento local

#### MSW Server Setup

```typescript
beforeAll(() => server.listen()); // Levantar servidor mock
afterEach(() => server.resetHandlers()); // Reset entre tests
afterAll(() => server.close()); // Cerrar servidor mock
```

### Configuración de Jest

**Cobertura de código:**

- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%
- **Statements:** 80%

**Entorno de testing:**

- **jsdom** - Simulación del DOM del navegador
- **TypeScript** - Soporte completo
- **Next.js** - Configuración optimizada

**Scripts de testing:**

```json
{
  "test": "jest", // Ejecutar tests
  "test:watch": "jest --watch", // Modo watch
  "test:coverage": "jest --coverage", // Con cobertura
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

**¡Sistema de testing completo y funcional para backend y frontend!** 🚀

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
