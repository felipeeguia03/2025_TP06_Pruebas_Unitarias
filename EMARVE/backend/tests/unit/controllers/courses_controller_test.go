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

// MockCourseService simula el servicio de cursos
type MockCourseService struct {
	mock.Mock
}

func (m *MockCourseService) SearchCourse(query string) ([]domain.Course, error) {
	args := m.Called(query)
	return args.Get(0).([]domain.Course), args.Error(1)
}

func (m *MockCourseService) GetCourse(id int64) (domain.Course, error) {
	args := m.Called(id)
	return args.Get(0).(domain.Course), args.Error(1)
}

func (m *MockCourseService) GetAllCourses() ([]domain.Course, error) {
	args := m.Called()
	return args.Get(0).([]domain.Course), args.Error(1)
}

func (m *MockCourseService) Subscription(userID, courseID int64) error {
	args := m.Called(userID, courseID)
	return args.Error(0)
}

func (m *MockCourseService) CreateCourse(title, description, category, instructor string, duration int64, requirement string) error {
	args := m.Called(title, description, category, instructor, duration, requirement)
	return args.Error(0)
}

func (m *MockCourseService) UpdateCourse(courseID int64, title, description, category, instructor string, duration int64, requirement string) error {
	args := m.Called(courseID, title, description, category, instructor, duration, requirement)
	return args.Error(0)
}

func (m *MockCourseService) DeleteCourse(courseID int64) error {
	args := m.Called(courseID)
	return args.Error(0)
}

func (m *MockCourseService) CommentList(courseID int64) ([]domain.CommentResponse, error) {
	args := m.Called(courseID)
	return args.Get(0).([]domain.CommentResponse), args.Error(1)
}

func TestSearchCourse_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	expectedCourses := []domain.Course{
		{Id: 1, Title: "Go Programming", Description: "Learn Go"},
		{Id: 2, Title: "Advanced Go", Description: "Advanced Go concepts"},
	}

	mockService.On("SearchCourse", "go").Return(expectedCourses, nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/search?query=go", nil)

	controller.SearchCourse(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.SearchResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response.Result, 2)
	assert.Equal(t, "Go Programming", response.Result[0].Title)

	mockService.AssertExpectations(t)
}

func TestSearchCourse_Error(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	mockService.On("SearchCourse", "invalid").Return([]domain.Course{}, assert.AnError)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/search?query=invalid", nil)

	controller.SearchCourse(c)

	// Assert
	assert.Equal(t, http.StatusInternalServerError, w.Code)
	mockService.AssertExpectations(t)
}

func TestGetCourse_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	expectedCourse := domain.Course{
		Id:          1,
		Title:       "Go Programming",
		Description: "Learn Go programming",
		Category:    "Programming",
		Instructor:  "John Doe",
		Duration:    60,
		Requirement: "Basic programming knowledge",
	}

	mockService.On("GetCourse", int64(1)).Return(expectedCourse, nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = []gin.Param{{Key: "id", Value: "1"}}

	controller.GetCourse(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.Course
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, expectedCourse.Title, response.Title)
	assert.Equal(t, expectedCourse.Description, response.Description)

	mockService.AssertExpectations(t)
}

func TestGetCourse_NotFound(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	mockService.On("GetCourse", int64(999)).Return(domain.Course{}, assert.AnError)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = []gin.Param{{Key: "id", Value: "999"}}

	controller.GetCourse(c)

	// Assert
	assert.Equal(t, http.StatusNotFound, w.Code)
	mockService.AssertExpectations(t)
}

func TestGetCourse_InvalidID(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = []gin.Param{{Key: "id", Value: "invalid"}}

	controller.GetCourse(c)

	// Assert
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetAllCourses_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	expectedCourses := []domain.Course{
		{Id: 1, Title: "Course 1", Description: "Description 1"},
		{Id: 2, Title: "Course 2", Description: "Description 2"},
	}

	mockService.On("GetAllCourses").Return(expectedCourses, nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/courses", nil)

	controller.GetAllCourses(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.SearchResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response.Result, 2)

	mockService.AssertExpectations(t)
}

func TestSubscription_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	subscribeRequest := domain.SubscribeRequest{
		UserId:   1,
		CourseId: 1,
	}

	mockService.On("Subscription", int64(1), int64(1)).Return(nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	jsonBody, _ := json.Marshal(subscribeRequest)
	c.Request = httptest.NewRequest("POST", "/subscriptions", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.Subscription(c)

	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)

	var response domain.Result
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "successful subscription")

	mockService.AssertExpectations(t)
}

func TestSubscription_Conflict(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	subscribeRequest := domain.SubscribeRequest{
		UserId:   1,
		CourseId: 1,
	}

	mockService.On("Subscription", int64(1), int64(1)).Return(assert.AnError)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	jsonBody, _ := json.Marshal(subscribeRequest)
	c.Request = httptest.NewRequest("POST", "/subscriptions", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.Subscription(c)

	// Assert
	assert.Equal(t, http.StatusConflict, w.Code)
	mockService.AssertExpectations(t)
}

func TestCreateCourse_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	courseRequest := domain.CourseRequest{
		Title:       "New Course",
		Description: "Course Description",
		Category:    "Programming",
		Instructor:  "John Doe",
		Duration:    60,
		Requirement: "Basic knowledge",
	}

	mockService.On("CreateCourse", "New Course", "Course Description", "Programming", "John Doe", int64(60), "Basic knowledge").Return(nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	jsonBody, _ := json.Marshal(courseRequest)
	c.Request = httptest.NewRequest("POST", "/courses/create", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.CreateCourse(c)

	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)

	var response domain.Result
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "successful creation")

	mockService.AssertExpectations(t)
}

func TestCreateCourse_Conflict(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	courseRequest := domain.CourseRequest{
		Title:       "New Course",
		Description: "Course Description",
		Category:    "Programming",
		Instructor:  "John Doe",
		Duration:    60,
		Requirement: "Basic knowledge",
	}

	mockService.On("CreateCourse", "New Course", "Course Description", "Programming", "John Doe", int64(60), "Basic knowledge").Return(assert.AnError)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	jsonBody, _ := json.Marshal(courseRequest)
	c.Request = httptest.NewRequest("POST", "/courses/create", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.CreateCourse(c)

	// Assert
	assert.Equal(t, http.StatusConflict, w.Code)
	mockService.AssertExpectations(t)
}

func TestUpdateCourse_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	courseRequest := domain.CourseRequest{
		Title:       "Updated Course",
		Description: "Updated Description",
		Category:    "Programming",
		Instructor:  "Jane Doe",
		Duration:    90,
		Requirement: "Advanced knowledge",
	}

	mockService.On("UpdateCourse", int64(1), "Updated Course", "Updated Description", "Programming", "Jane Doe", int64(90), "Advanced knowledge").Return(nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = []gin.Param{{Key: "id", Value: "1"}}

	jsonBody, _ := json.Marshal(courseRequest)
	c.Request = httptest.NewRequest("PUT", "/courses/update/1", bytes.NewBuffer(jsonBody))
	c.Request.Header.Set("Content-Type", "application/json")

	controller.UpdateCourse(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.Result
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "successful update")

	mockService.AssertExpectations(t)
}

func TestDeleteCourse_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	mockService.On("DeleteCourse", int64(1)).Return(nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = []gin.Param{{Key: "id", Value: "1"}}

	controller.DeleteCourse(c)

	// Assert
	assert.Equal(t, http.StatusNoContent, w.Code)
	mockService.AssertExpectations(t)
}

func TestDeleteCourse_NotFound(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	mockService.On("DeleteCourse", int64(999)).Return(assert.AnError)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = []gin.Param{{Key: "id", Value: "999"}}

	controller.DeleteCourse(c)

	// Assert
	assert.Equal(t, http.StatusNotFound, w.Code)
	mockService.AssertExpectations(t)
}

func TestCommentList_Success(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	expectedComments := []domain.CommentResponse{
		{UserID: 1, Comment: "Great course!"},
		{UserID: 2, Comment: "Very helpful"},
	}

	mockService.On("CommentList", int64(1)).Return(expectedComments, nil)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = []gin.Param{{Key: "id", Value: "1"}}

	controller.CommentList(c)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.CommentList
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response.Result, 2)
	assert.Equal(t, "Great course!", response.Result[0].Comment)

	mockService.AssertExpectations(t)
}

func TestCommentList_NotFound(t *testing.T) {
	// Arrange
	gin.SetMode(gin.TestMode)
	mockService := new(MockCourseService)
	controller := NewCourseController(mockService)

	mockService.On("CommentList", int64(999)).Return([]domain.CommentResponse{}, assert.AnError)

	// Act
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = []gin.Param{{Key: "id", Value: "999"}}

	controller.CommentList(c)

	// Assert
	assert.Equal(t, http.StatusNotFound, w.Code)
	mockService.AssertExpectations(t)
}
