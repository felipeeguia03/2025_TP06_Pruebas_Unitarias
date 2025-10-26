package controllers

import (
	"backend/controllers/users"
	"backend/domain"
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserService simula el servicio de usuarios
type MockUserService struct {
	mock.Mock
}

func (m *MockUserService) Login(email, password string) (string, error) {
	args := m.Called(email, password)
	return args.String(0), args.Error(1)
}

func (m *MockUserService) UserRegister(nickname, email, password string, typeUser bool) (bool, error) {
	args := m.Called(nickname, email, password, typeUser)
	return args.Bool(0), args.Error(1)
}

func (m *MockUserService) SubscriptionList(userID int64) ([]domain.Course, error) {
	args := m.Called(userID)
	return args.Get(0).([]domain.Course), args.Error(1)
}

func (m *MockUserService) AddComment(userID, courseID int64, comment string) error {
	args := m.Called(userID, courseID, comment)
	return args.Error(0)
}

func (m *MockUserService) UploadFiles(file io.Reader, filename string, userID, courseID int64) error {
	args := m.Called(file, filename, userID, courseID)
	return args.Error(0)
}

func (m *MockUserService) UserAuthentication(tokenString string) (string, error) {
	args := m.Called(tokenString)
	return args.String(0), args.Error(1)
}

func (m *MockUserService) GetUserID(tokenString string) (int, error) {
	args := m.Called(tokenString)
	return args.Int(0), args.Error(1)
}

func (m *MockUserService) GetUserById(userID int64) (*domain.User, error) {
	args := m.Called(userID)
	return args.Get(0).(*domain.User), args.Error(1)
}

func TestLogin_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)

	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)
	expectedToken := "test-token-123"

	loginRequest := domain.LoginRequest{
		Email:    "test@example.com",
		Password: "password123",
	}

	mockService.On("Login", "test@example.com", "password123").Return(expectedToken, nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Simular request body
	jsonBody, _ := json.Marshal(loginRequest)
	c.Request = httptest.NewRequest("POST", "/login", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	// Llamar al método Login del controller
	controller.Login(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.LoginResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, expectedToken, response.Token)

	mockService.AssertExpectations(t)
}

func TestLogin_InvalidRequest(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Request con JSON inválido
	c.Request = httptest.NewRequest("POST", "/login", bytes.NewBufferString("invalid json"))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.Login(c)

	// Assert
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUserRegister_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	registrationRequest := domain.RegistrationRequest{
		Nickname: "testuser",
		Email:    "test@example.com",
		Password: "password123",
		Type:     false,
	}

	mockService.On("UserRegister", "testuser", "test@example.com", "password123", false).Return(false, nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	jsonBody, _ := json.Marshal(registrationRequest)
	c.Request = httptest.NewRequest("POST", "/register", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.UserRegister(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.Result
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "testuser")

	mockService.AssertExpectations(t)
}

func TestLogin_Unauthorized(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	loginRequest := domain.LoginRequest{
		Email:    "test@example.com",
		Password: "wrongpassword",
	}

	mockService.On("Login", "test@example.com", "wrongpassword").Return("", assert.AnError)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	jsonBody, _ := json.Marshal(loginRequest)
	c.Request = httptest.NewRequest("POST", "/login", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.Login(c)

	// Assert
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	mockService.AssertExpectations(t)
}

func TestUserRegister_Conflict(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	registrationRequest := domain.RegistrationRequest{
		Nickname: "testuser",
		Email:    "test@example.com",
		Password: "password123",
		Type:     false,
	}

	mockService.On("UserRegister", "testuser", "test@example.com", "password123", false).Return(false, assert.AnError)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	jsonBody, _ := json.Marshal(registrationRequest)
	c.Request = httptest.NewRequest("POST", "/register", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.UserRegister(c)

	// Assert
	assert.Equal(t, http.StatusConflict, w.Code)
	mockService.AssertExpectations(t)
}

func TestSubscriptionList_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	expectedCourses := []domain.Course{
		{Id: 1, Title: "Course 1", Description: "Description 1"},
		{Id: 2, Title: "Course 2", Description: "Description 2"},
	}

	mockService.On("SubscriptionList", int64(1)).Return(expectedCourses, nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = []gin.Param{{Key: "id", Value: "1"}}

	controller.SubscriptionList(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.ListResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response.Result, 2)
	assert.Equal(t, "Course 1", response.Result[0].Title)

	mockService.AssertExpectations(t)
}

func TestAddComment_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	commentRequest := domain.CommentRequest{
		UserID:   1,
		CourseID: 1,
		Comment:  "Great course!",
	}

	mockService.On("AddComment", int64(1), int64(1), "Great course!").Return(nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	jsonBody, _ := json.Marshal(commentRequest)
	c.Request = httptest.NewRequest("POST", "/comments", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.AddComment(c)

	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)

	var response domain.Result
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "successful comment")

	mockService.AssertExpectations(t)
}

func TestUserAuthentication_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	authHeader := "Bearer valid-token"
	expectedUserType := "admin"

	mockService.On("UserAuthentication", authHeader).Return(expectedUserType, nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/authentication", nil)
	c.Request.Header.Set("Authorization", authHeader)

	controller.UserAuthentication(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.Result
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, expectedUserType, response.Message)

	mockService.AssertExpectations(t)
}

func TestGetUserID_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	authHeader := "Bearer valid-token"
	expectedUserID := 123

	mockService.On("GetUserID", authHeader).Return(expectedUserID, nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/userId", nil)
	c.Request.Header.Set("Authorization", authHeader)

	controller.GetUserID(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.ResultInt
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, expectedUserID, response.Message)

	mockService.AssertExpectations(t)
}

// Tests para nuevos métodos

func TestGetUserById_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	// Configurar mock
	expectedUser := &domain.User{
		Id:       1,
		Nickname: "usuario1",
		Email:    "usuario1@test.com",
		Type:     false,
	}
	mockService.On("GetUserById", int64(1)).Return(expectedUser, nil)

	// Crear request
	req, _ := http.NewRequest("GET", "/users/1", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: "1"}}

	// Ejecutar
	controller.GetUserById(c)

	// Verificar
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.UserResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, expectedUser.Id, response.Id)
	assert.Equal(t, expectedUser.Nickname, response.Nickname)
	assert.Equal(t, expectedUser.Email, response.Email)
	assert.Equal(t, expectedUser.Type, response.Type)

	mockService.AssertExpectations(t)
}

func TestGetUserById_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	// Crear request con ID inválido
	req, _ := http.NewRequest("GET", "/users/invalid", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: "invalid"}}

	// Ejecutar
	controller.GetUserById(c)

	// Verificar
	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response domain.Result
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "invalid id")
}

func TestGetUserById_ServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockUserService)
	controller := users.NewUserController(mockService)

	// Configurar mock para error
	mockService.On("GetUserById", int64(1)).Return((*domain.User)(nil), assert.AnError)

	// Crear request
	req, _ := http.NewRequest("GET", "/users/1", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: "1"}}

	// Ejecutar
	controller.GetUserById(c)

	// Verificar
	assert.Equal(t, http.StatusNotFound, w.Code)

	var response domain.Result
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "user not found")

	mockService.AssertExpectations(t)
}
