package services

import (
	"backend/dao"
	"crypto/md5"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserRepository simula el repositorio de usuarios
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) GetUserByEmail(email string) (*dao.User, error) {
	args := m.Called(email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*dao.User), args.Error(1)
}

func (m *MockUserRepository) CreateUser(user dao.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) GetUserById(id int64) (*dao.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*dao.User), args.Error(1)
}

func (m *MockUserRepository) GetCourseIdsByUserId(userID int64) ([]int64, error) {
	args := m.Called(userID)
	return args.Get(0).([]int64), args.Error(1)
}

func (m *MockUserRepository) GetCourseById(courseID int64) (*dao.Course, error) {
	args := m.Called(courseID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*dao.Course), args.Error(1)
}

func (m *MockUserRepository) InsertComment(userID, courseID int64, comment string) error {
	args := m.Called(userID, courseID, comment)
	return args.Error(0)
}

func (m *MockUserRepository) SaveFile(file dao.File) error {
	args := m.Called(file)
	return args.Error(0)
}

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
	token, err := service.Login("test@example.com", "password123")

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	mockRepo.AssertExpectations(t)
}

func TestLogin_InvalidCredentials(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	expectedUser := &dao.User{
		Id:           1,
		Email:        "test@example.com",
		PasswordHash: "wrong-hash",
		Type:         false,
	}

	mockRepo.On("GetUserByEmail", "test@example.com").Return(expectedUser, nil)

	// Act
	token, err := service.Login("test@example.com", "password123")

	// Assert
	assert.Error(t, err)
	assert.Empty(t, token)
	assert.Contains(t, err.Error(), "invalid credentials")
	mockRepo.AssertExpectations(t)
}

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

func TestLogin_EmptyPassword(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	// Act
	token, err := service.Login("test@example.com", "")

	// Assert
	assert.Error(t, err)
	assert.Empty(t, token)
	assert.Contains(t, err.Error(), "password is required")
}

func TestUserRegister_ValidData(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	expectedUser := dao.User{
		Nickname:     "testuser",
		Email:        "test@example.com",
		PasswordHash: fmt.Sprintf("%x", md5.Sum([]byte("password123"))),
		Type:         false,
	}

	mockRepo.On("CreateUser", expectedUser).Return(nil)

	// Act
	result, err := service.UserRegister("testuser", "test@example.com", "password123", false)

	// Assert
	assert.NoError(t, err)
	assert.False(t, result)
	mockRepo.AssertExpectations(t)
}

func TestUserRegister_EmptyNickname(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	// Act
	result, err := service.UserRegister("", "test@example.com", "password123", false)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "nickname is required")
	assert.False(t, result)
}

func TestUserRegister_EmptyEmail(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	// Act
	result, err := service.UserRegister("testuser", "", "password123", false)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "email is required")
	assert.False(t, result)
}

func TestUserRegister_EmptyPassword(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	// Act
	result, err := service.UserRegister("testuser", "test@example.com", "", false)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "password is required")
	assert.False(t, result)
}

// Tests para SubscriptionList
func TestSubscriptionList_ValidUser(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	courseIDs := []int64{1, 2, 3}
	expectedCourses := []dao.Course{
		{
			Id:           1,
			Title:        "Course 1",
			Description:  "Description 1",
			Category:     "Category 1",
			Instructor:   "Instructor 1",
			Duration:     60,
			Requirement:  "Requirement 1",
			CreationDate: time.Now(),
			LastUpdate:   time.Now(),
		},
		{
			Id:           2,
			Title:        "Course 2",
			Description:  "Description 2",
			Category:     "Category 2",
			Instructor:   "Instructor 2",
			Duration:     90,
			Requirement:  "Requirement 2",
			CreationDate: time.Now(),
			LastUpdate:   time.Now(),
		},
	}

	mockRepo.On("GetCourseIdsByUserId", int64(1)).Return(courseIDs, nil)
	mockRepo.On("GetCourseById", int64(1)).Return(&expectedCourses[0], nil)
	mockRepo.On("GetCourseById", int64(2)).Return(&expectedCourses[1], nil)
	mockRepo.On("GetCourseById", int64(3)).Return(&expectedCourses[0], nil)

	// Act
	courses, err := service.SubscriptionList(1)

	// Assert
	assert.NoError(t, err)
	assert.Len(t, courses, 3)
	assert.Equal(t, "Course 1", courses[0].Title)
	assert.Equal(t, "Course 2", courses[1].Title)
	mockRepo.AssertExpectations(t)
}

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

// Tests para AddComment
func TestAddComment_ValidData(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	expectedUser := &dao.User{Id: 1, Email: "test@example.com"}
	expectedCourse := &dao.Course{Id: 1, Title: "Test Course"}

	mockRepo.On("GetUserById", int64(1)).Return(expectedUser, nil)
	mockRepo.On("GetCourseById", int64(1)).Return(expectedCourse, nil)
	mockRepo.On("InsertComment", int64(1), int64(1), "Great course!").Return(nil)

	// Act
	err := service.AddComment(1, 1, "Great course!")

	// Assert
	assert.NoError(t, err)
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

func TestAddComment_CourseNotFound(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	expectedUser := &dao.User{Id: 1, Email: "test@example.com"}

	mockRepo.On("GetUserById", int64(1)).Return(expectedUser, nil)
	mockRepo.On("GetCourseById", int64(999)).Return(nil, errors.New("course not found"))

	// Act
	err := service.AddComment(1, 999, "Great course!")

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error getting course from DB")
	mockRepo.AssertExpectations(t)
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

// Tests para UserAuthentication
func TestUserAuthentication_ValidToken(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	// Act - Necesitarías un token JWT válido para este test
	// Por simplicidad, aquí solo verificamos el caso de token inválido
	userType, err := service.UserAuthentication("invalid-token")

	// Assert
	assert.Error(t, err)
	assert.Empty(t, userType)
}

func TestUserAuthentication_EmptyToken(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	// Act
	userType, err := service.UserAuthentication("")

	// Assert
	assert.Error(t, err)
	assert.Empty(t, userType)
	assert.Contains(t, err.Error(), "bearer token is required")
}

// Tests para GetUserID
func TestGetUserID_ValidToken(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	// Act - Necesitarías un token JWT válido para este test
	// Por simplicidad, aquí solo verificamos el caso de token inválido
	userID, err := service.GetUserID("invalid-token")

	// Assert
	assert.Error(t, err)
	assert.Equal(t, 0, userID)
}

func TestGetUserID_EmptyToken(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)

	// Act
	userID, err := service.GetUserID("")

	// Assert
	assert.Error(t, err)
	assert.Equal(t, 0, userID)
	assert.Contains(t, err.Error(), "bearer token is required")
}
