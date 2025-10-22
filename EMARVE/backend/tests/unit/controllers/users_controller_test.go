package controllers

import (
	"backend/domain"
	"bytes"
	"encoding/json"
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

func (m *MockUserService) UploadFiles(file interface{}, filename string, userID, courseID int64) error {
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

func TestLogin_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)

	mockService := new(MockUserService)
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

	// Llamar a la función Login (necesitarás inyectar el mock)
	// Login(c) // Esto necesitará ser modificado para aceptar el servicio

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

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Request con JSON inválido
	c.Request = httptest.NewRequest("POST", "/login", bytes.NewBufferString("invalid json"))
	c.Request.Header.Set("Content-Type", "application/json")

	// Login(c)

	// Assert
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUserRegister_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)

	mockService := new(MockUserService)

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

	// UserRegister(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.Result
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "testuser")

	mockService.AssertExpectations(t)
}
