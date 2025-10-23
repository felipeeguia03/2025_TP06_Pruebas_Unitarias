TP 06 - Pruebas unitarias

1. --- Set up de Testing ----
   Para el backend (GO) elegimos utilizar el framework: Testify. Es el estándar y ampliamente adaptado y con soporte para assertions y mocks.
   "go get github.com/stretchr/testify"
   Para el Testing HTTP usamos: http test (built-in) debido a que es la libería nativa de Go para testing de endpoints HTTP

- Base de Datos
  Con gomock tenemos las respuestas de la DB y el aislamiento que buscamos

Para el Frontend (React/Next.js) elegimos usar Jest que ya viene incluido en Next.js, por otro lado para el testing de componentes decidimos usar @testing-library/react debido a que se enfoca en la experiencia del usuario y lo que el ve
"npm install --save-dev @testing-library/user-event"

Para el Mocking de APIs decidimos usar MSW (Mock Service Worker) debido a que intercepta requests HTTP y simula respuestas de backend

Para CI/CD Pipeline decidimos usar Azzure DevOps Pipeline. Para configuración:
-Trigger en push a main
-Ejecutar test backend y frontend en paralelo
-Generar reportes de cobertura
-Deploy automático solo si todos los tests pasan

2. --- IMPLEMENTACIÓN DE PRUEBAS UNITARIAS ---

Para las pruebas unitarias tuvimos que remodelar el código y desacoplarlo para permitir la inyección de dependencias

La inyección de dependencias es un patrón estandar de Go para desacoplar componentes y facilitar el testing. Permite que un service no dependa directamente de implementaciónes concretas como clients o la DB, sino de interfaces

En nuestro código lo aplicamos asi:

interfaces/ users_service.go

type UserRepositoryInterface interface {
GetUserByEmail(email string) (*dao.User, error)
CreateUser(user dao.User) error
GetUserById(id int64) (*dao.User, error)
GetCourseIdsByUserId(userID int64) ([]int64, error)
GetCourseById(courseID int64) (\*dao.Course, error)
InsertComment(userID, courseID int64, comment string) error
SaveFile(file dao.File) error
}

services/users_service.go

type UserService struct {
repo interfaces.UserRepositoryInterface
}

func NewUserService(repo interfaces.UserRepositoryInterface) \*UserService {
return &UserService{repo: repo}
}

"repo" entonces es una interfaz que define todos los métodos necesarios (GetUserByEmail, CreateUser,etc)

Entonces en produccion se inyectara la implementación real "Clients" y en los test se inyecta un "Mock"

Permitiendo asi que el servcio sea independiente de la base de datos

Ejemplo real de nuestro código:
LOGIN:
func (s \*UserService) Login(email, password string) (string, error)
esta funcion valida que no este vacio ni el mail ni la contraseña, una vez hasheada la contraseña llama a GetUserByEmail, pero no la hace con clients, sino a la interfaz inyectada, que en caso de ser Mock, estaremos hablando de un test

Estrategia de Testing
Mock con testify/mock

Creamos un struct que simula la interfaz del repositorio:

type MockUserRepository struct {
mock.Mock
}
aca el struct obtiene los metodos de la libreria On(), Called(), Return(), AssertExpectations()

en nuestro codigo asi quedaria el metodo mockeado:

func (m *MockUserRepository) GetUserByEmail(email string) (*dao.User, error) {
args := m.Called(email)
return args.Get(0).(\*dao.User), args.Error(1)
}

lo que estamos haciendo es simular el comportamiento del método real GetUserByEmail donde realmente se consultaría a una base de datos

"args := m.Called(email)" llama a un método del struct mock.Mock de testify/mock que registra que este mock fue invocado con ese argumento "email" y devuelve un objeto mock.Arguments
Ahora, ese objeto mock.Arguments contiene valores de retornos configurados para esa llamada simulada

En nuestro código configuramos como debe responder el mock

mockRepo.On("GetUserByEmail", "test@test.com").Return{expectedUser ,nil}
entonces cuando se ejecute m.Called(email) con "test@test.com", "args" va a contener esos valores pre-configurados siendo:
args.Get(0) -> primer valor del return (expectedUser)
args.Get(1) -> nil

Test unitario del login

func TestLogin_ValidCredentials(t \*testing.T) {

mockRepo := new(MockUserRepository)
service := NewUserService(mockRepo)

    expectedUser := &dao.User{
        Id:           1,
        Email:        "test@example.com",
        PasswordHash: fmt.Sprintf("%x", md5.Sum([]byte("password123"))),
        Type:         true,
    }

    mockRepo.On("GetUserByEmail", "test@example.com").Return(expectedUser, nil)

    token, err := service.Login("test@example.com", "password123")

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

Estrategia usada:

*Service desacoplado mediante interfaz → permite inyectar dependencias.
*Mock de repositorio usando testify/mock → simula comportamiento de la base de datos.
*Test unitario → verifica la lógica del service sin tocar la base de datos real.
*Assert de testify (NoError, NotEmpty) → comprueba valores de retorno y comportamiento esperado.
\*AssertExpectations → asegura que se cumplieron todas las expectativas del mock.

Siempre usamos la Estrategia AAA (Arrange-Act-Assert)

La estrategia AAA es un patrón estándar para estructurar tests unitarios que mejora la legibilidad y mantenibilidad:

### **Arrange (Preparar)**

- Configuramos el estado inicial
- Creamos mocks y configuramos expectativas
- Preparamos datos de prueba

```go
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
```

### **Act (Actuar)**

- Ejecutamos la función/método que queremos probar
- Una sola acción por test

```go
// Act
token, err := service.Login("test@example.com", "password123")
```

### **Assert (Verificar)**

- Verificamos que el resultado sea el esperado
- Comprobamos valores de retorno y efectos secundarios

```go
// Assert
assert.NoError(t, err)
assert.NotEmpty(t, token)
mockRepo.AssertExpectations(t)
```

3. ---- Testing Avanzado ------

### **3.1 Crear mocks para dependencias externas**

Ya en el punto anterior implementamos mocks completos para simular todas las dependencias externas: como la DB

### **3.2 Implementar tests para manejo de excepciones**

Creamos tests específicos para verificar el manejo correcto de errores:

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

func TestAddComment_UserNotFound(t *testing.T) {
    // Arrange
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    mockRepo.On("GetUserById", int64(999)).Return(nil, errors.New("user not found"))

    // Act
    err := service.AddComment(999, 1, "Great course!")

    // Assert
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "error getting user from DB")
    mockRepo.AssertExpectations(t)
}
```

**Casos de excepción cubiertos:**

- Usuario no encontrado
- Curso no encontrado
- Errores de base de datos
- Tokens JWT inválidos
- Validaciones de entrada

### **3.3 Desarrollar tests para casos edge y validaciones**

Implementamos tests para casos límite y validaciones de entrada, aunque esto ya lo hac

```go
// Casos edge para validaciones
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

func TestAddComment_EmptyComment(t *testing.T) {
    // Arrange
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    // Act
    err := service.AddComment(1, 1, "")

    // Assert
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "comment is required")
}

// Casos edge para datos límite
func TestSubscriptionList_UserNotFound(t *testing.T) {
    // Arrange
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    mockRepo.On("GetCourseIdsByUserId", int64(999)).Return(nil, errors.New("user not found"))

    // Act
    courses, err := service.SubscriptionList(999)

    // Assert
    assert.Error(t, err)
    assert.Nil(t, courses)
    assert.Contains(t, err.Error(), "error getting course IDs for user ID 999")
    mockRepo.AssertExpectations(t)
}
```

**Casos edge cubiertos:**

- Strings vacíos y nulos
- IDs inválidos (negativos, cero)
- Tokens malformados
- Datos de entrada extremos
- Estados de error de dependencias

------- Pruebas Frontend -----------

Dependencias principales:

Para el Mocking de APIs decidimos usar MSW (Mock Service Worker)debido a que intercepta requests HTTP y simula respuestas de backend. Jest po su parte lo usamos para

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

esto asegura que cada test tiene un estado limpio del servidor

Tambien tenemos mocks de utilidades y dependencias

## **Tecnologías elegidas para Frontend Testing:**

### **Framework de Testing:**

- **Jest** - Framework principal de testing para JavaScript/TypeScript
- **@testing-library/react** - Librería especializada en testing de componentes React
- **@testing-library/user-event** - Simulación de interacciones del usuario
- **@testing-library/jest-dom** - Matchers adicionales para DOM

### **Mocking y Simulación:**

- **MSW (Mock Service Worker)** - Para interceptar requests HTTP y simular respuestas del backend
- **Jest Mocks** - Para mockear funciones, módulos y dependencias

### **Configuración:**

- **Next.js Jest Config** - Configuración optimizada para Next.js
- **jsdom** - Entorno de testing que simula el DOM del navegador
- **TypeScript** - Soporte completo para TypeScript en tests

## **Componentes testeados:**

### **1. Login Component (`Login.test.tsx`)**

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

### **2. Register Component (`Register.test.tsx`)**

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

## **Ejemplo detallado de prueba con estrategia AAA:**

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

## **Estrategia AAA aplicada:**

### **ARRANGE (Arreglar):**

- Configurar mocks y dependencias
- Preparar datos de prueba
- Renderizar componentes
- Configurar el estado inicial

### **ACT (Actuar):**

- Simular interacciones del usuario
- Ejecutar la funcionalidad a probar
- Disparar eventos (clicks, typing, etc.)

### **ASSERT (Afirmar):**

- Verificar que las funciones se llamaron correctamente
- Comprobar cambios en el estado
- Validar respuestas y comportamientos esperados
- Verificar efectos secundarios (localStorage, redirecciones)

## **Mocks implementados:**

### **1. MSW Handlers (`handlers.ts`):**

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

### **2. Jest Mocks:**

- **Axios functions** - Mock de funciones de API
- **Next.js router** - Mock de navegación
- **Window.location** - Mock de redirecciones
- **localStorage** - Mock de almacenamiento local

### **3. MSW Server Setup:**

```typescript
beforeAll(() => server.listen()); // Levantar servidor mock
afterEach(() => server.resetHandlers()); // Reset entre tests
afterAll(() => server.close()); // Cerrar servidor mock
```

## **Configuración de Jest:**

### **Cobertura de código:**

- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%
- **Statements:** 80%

### **Entorno de testing:**

- **jsdom** - Simulación del DOM del navegador
- **TypeScript** - Soporte completo
- **Next.js** - Configuración optimizada

## **Scripts de testing:**

```json
{
  "test": "jest", // Ejecutar tests
  "test:watch": "jest --watch", // Modo watch
  "test:coverage": "jest --coverage", // Con cobertura
  "test:ci": "jest --coverage --watchAll=false" // Para CI/CD
}
```

## **Beneficios de la implementación:**

1. **Aislamiento completo** - Tests independientes del backend real
2. **Simulación realista** - MSW intercepta requests HTTP reales
3. **Cobertura completa** - Casos de éxito y error cubiertos
4. **Mantenibilidad** - Tests claros y bien estructurados
5. **CI/CD ready** - Configuración para pipelines automatizados

## **Total de pruebas implementadas:**

- **Login Component:** 8 pruebas
- **Register Component:** 9 pruebas
- **Total:** 17 pruebas unitarias de componentes React

**¡Sistema de testing frontend completamente funcional con MSW, Jest y Testing Library!** 🚀
