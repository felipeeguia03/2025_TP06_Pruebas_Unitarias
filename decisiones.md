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
	GetCourseById(courseID int64) (*dao.Course, error)
	InsertComment(userID, courseID int64, comment string) error
	SaveFile(file dao.File) error
}

services/users_service.go

type UserService struct {
    repo interfaces.UserRepositoryInterface
}

func NewUserService(repo interfaces.UserRepositoryInterface) *UserService {
    return &UserService{repo: repo}
}

"repo" entonces es una interfaz que define todos los métodos necesarios (GetUserByEmail, CreateUser,etc)

Entonces en produccion se inyectara la implementación real "Clients" y en los test se inyecta un "Mock"

Permitiendo asi que el servcio sea independiente de la base de datos

Ejemplo real de nuestro código:
LOGIN:
func (s *UserService) Login(email, password string) (string, error)
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
    return args.Get(0).(*dao.User), args.Error(1)
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

func TestLogin_ValidCredentials(t *testing.T) {
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
*AssertExpectations → asegura que se cumplieron todas las expectativas del mock.



