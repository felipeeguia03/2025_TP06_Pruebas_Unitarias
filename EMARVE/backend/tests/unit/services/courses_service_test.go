package services

import (
	"backend/domain"
	"backend/services/courses"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockCourseRepository simula el repositorio de cursos
type MockCourseRepository struct {
	mock.Mock
}

func (m *MockCourseRepository) GetCoursewithQuery(query string) ([]domain.Course, error) {
	args := m.Called(query)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.Course), args.Error(1)
}

func (m *MockCourseRepository) GetCourseById(id int64) (*domain.Course, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Course), args.Error(1)
}

func (m *MockCourseRepository) GetCourses() ([]domain.Course, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.Course), args.Error(1)
}

func (m *MockCourseRepository) GetUserById(userID int64) (*domain.User, error) {
	args := m.Called(userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockCourseRepository) InsertSubscription(userID, courseID int64) error {
	args := m.Called(userID, courseID)
	return args.Error(0)
}

func (m *MockCourseRepository) CreateCourse(course domain.Course) error {
	args := m.Called(course)
	return args.Error(0)
}

func (m *MockCourseRepository) UpdateCourse(courseID int64, course domain.Course) error {
	args := m.Called(courseID, course)
	return args.Error(0)
}

func (m *MockCourseRepository) DeleteCourseById(courseID int64) error {
	args := m.Called(courseID)
	return args.Error(0)
}

func (m *MockCourseRepository) DeleteSubscriptionById(courseID int64) error {
	args := m.Called(courseID)
	return args.Error(0)
}

func (m *MockCourseRepository) GetCommentsByCourseId(courseID int64) ([]int64, error) {
	args := m.Called(courseID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]int64), args.Error(1)
}

func (m *MockCourseRepository) GetCommentById(commentID int64) (domain.Comment, error) {
	args := m.Called(commentID)
	return args.Get(0).(domain.Comment), args.Error(1)
}

func (m *MockCourseRepository) GetCoursesByInstructor(instructor string) ([]domain.Course, error) {
	args := m.Called(instructor)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.Course), args.Error(1)
}

func (m *MockCourseRepository) GetCourseImages(courseID int64) ([]domain.File, error) {
	args := m.Called(courseID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.File), args.Error(1)
}

// Tests para SearchCourse
func TestSearchCourse_Success(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	expectedCourses := []domain.Course{
		{Id: 1, Title: "Go Programming", Description: "Learn Go"},
		{Id: 2, Title: "Advanced Go", Description: "Advanced Go concepts"},
	}

	mockRepo.On("GetCoursewithQuery", "go").Return(expectedCourses, nil)

	// Act
	result, err := service.SearchCourse("go")

	// Assert
	assert.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, "Go Programming", result[0].Title)
	assert.Equal(t, "Advanced Go", result[1].Title)
	mockRepo.AssertExpectations(t)
}

func TestSearchCourse_EmptyQuery(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	expectedCourses := []domain.Course{
		{Id: 1, Title: "Course 1"},
		{Id: 2, Title: "Course 2"},
	}

	mockRepo.On("GetCoursewithQuery", "").Return(expectedCourses, nil)

	// Act
	result, err := service.SearchCourse("   ")

	// Assert
	assert.NoError(t, err)
	assert.Len(t, result, 2)
	mockRepo.AssertExpectations(t)
}

func TestSearchCourse_Error(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("GetCoursewithQuery", "invalid").Return(nil, errors.New("database error"))

	// Act
	result, err := service.SearchCourse("invalid")

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "error getting courses from DB")
	mockRepo.AssertExpectations(t)
}

// Tests para GetCourse
func TestGetCourse_Success(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	expectedCourse := &domain.Course{
		Id:          1,
		Title:       "Go Programming",
		Description: "Learn Go programming",
		Category:    "Programming",
		Instructor:  "John Doe",
		Duration:    60,
		Requirement: "Basic programming knowledge",
	}

	mockRepo.On("GetCourseById", int64(1)).Return(expectedCourse, nil)

	// Act
	result, err := service.GetCourse(1)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, expectedCourse.Title, result.Title)
	assert.Equal(t, expectedCourse.Description, result.Description)
	assert.Equal(t, expectedCourse.Category, result.Category)
	mockRepo.AssertExpectations(t)
}

func TestGetCourse_NotFound(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("GetCourseById", int64(999)).Return(nil, errors.New("course not found"))

	// Act
	result, err := service.GetCourse(999)

	// Assert
	assert.Error(t, err)
	assert.Equal(t, domain.Course{}, result)
	assert.Contains(t, err.Error(), "error getting course from DB")
	mockRepo.AssertExpectations(t)
}

// Tests para GetAllCourses
func TestGetAllCourses_Success(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	expectedCourses := []domain.Course{
		{Id: 1, Title: "Course 1", Description: "Description 1"},
		{Id: 2, Title: "Course 2", Description: "Description 2"},
	}

	mockRepo.On("GetCourses").Return(expectedCourses, nil)

	// Act
	result, err := service.GetAllCourses()

	// Assert
	assert.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, "Course 1", result[0].Title)
	assert.Equal(t, "Course 2", result[1].Title)
	mockRepo.AssertExpectations(t)
}

func TestGetAllCourses_Error(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("GetCourses").Return(nil, errors.New("database error"))

	// Act
	result, err := service.GetAllCourses()

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "error getting courses from DB")
	mockRepo.AssertExpectations(t)
}

// Tests para Subscription
func TestSubscription_Success(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	expectedUser := &domain.User{Id: 1, Nickname: "testuser"}
	expectedCourse := &domain.Course{Id: 1, Title: "Test Course"}

	mockRepo.On("GetUserById", int64(1)).Return(expectedUser, nil)
	mockRepo.On("GetCourseById", int64(1)).Return(expectedCourse, nil)
	mockRepo.On("InsertSubscription", int64(1), int64(1)).Return(nil)

	// Act
	err := service.Subscription(1, 1)

	// Assert
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSubscription_UserNotFound(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("GetUserById", int64(999)).Return(nil, errors.New("user not found"))

	// Act
	err := service.Subscription(999, 1)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error getting user from DB")
	mockRepo.AssertExpectations(t)
}

func TestSubscription_CourseNotFound(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	expectedUser := &domain.User{Id: 1, Nickname: "testuser"}

	mockRepo.On("GetUserById", int64(1)).Return(expectedUser, nil)
	mockRepo.On("GetCourseById", int64(999)).Return(nil, errors.New("course not found"))

	// Act
	err := service.Subscription(1, 999)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error getting course from DB")
	mockRepo.AssertExpectations(t)
}

func TestSubscription_InsertError(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	expectedUser := &domain.User{Id: 1, Nickname: "testuser"}
	expectedCourse := &domain.Course{Id: 1, Title: "Test Course"}

	mockRepo.On("GetUserById", int64(1)).Return(expectedUser, nil)
	mockRepo.On("GetCourseById", int64(1)).Return(expectedCourse, nil)
	mockRepo.On("InsertSubscription", int64(1), int64(1)).Return(errors.New("subscription exists"))

	// Act
	err := service.Subscription(1, 1)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error inserting subscription into DB")
	mockRepo.AssertExpectations(t)
}

// Tests para CreateCourse
func TestCreateCourse_Success(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("CreateCourse", mock.MatchedBy(func(course domain.Course) bool {
		return course.Title == "New Course" && course.Description == "Course Description"
	})).Return(nil)

	// Act
	err := service.CreateCourse("New Course", "Course Description", "Programming", "John Doe", 60, "Basic knowledge")

	// Assert
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestCreateCourse_MissingTitle(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Act
	err := service.CreateCourse("", "Description", "Category", "Instructor", 60, "Requirement")

	// Assert
	assert.Error(t, err)
	assert.Equal(t, "title is required", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestCreateCourse_MissingDescription(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Act
	err := service.CreateCourse("Title", "", "Category", "Instructor", 60, "Requirement")

	// Assert
	assert.Error(t, err)
	assert.Equal(t, "description is required", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestCreateCourse_MissingCategory(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Act
	err := service.CreateCourse("Title", "Description", "", "Instructor", 60, "Requirement")

	// Assert
	assert.Error(t, err)
	assert.Equal(t, "category is required", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestCreateCourse_MissingInstructor(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Act
	err := service.CreateCourse("Title", "Description", "Category", "", 60, "Requirement")

	// Assert
	assert.Error(t, err)
	assert.Equal(t, "instructor is required", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestCreateCourse_ZeroDuration(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Act
	err := service.CreateCourse("Title", "Description", "Category", "Instructor", 0, "Requirement")

	// Assert
	assert.Error(t, err)
	assert.Equal(t, "duration is required", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestCreateCourse_MissingRequirement(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Act
	err := service.CreateCourse("Title", "Description", "Category", "Instructor", 60, "")

	// Assert
	assert.Error(t, err)
	assert.Equal(t, "requirement is required", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestCreateCourse_DatabaseError(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("CreateCourse", mock.AnythingOfType("domain.Course")).Return(errors.New("database error"))

	// Act
	err := service.CreateCourse("Title", "Description", "Category", "Instructor", 60, "Requirement")

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error creating course from DB")
	mockRepo.AssertExpectations(t)
}

// Tests para UpdateCourse
func TestUpdateCourse_Success(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("UpdateCourse", int64(1), mock.MatchedBy(func(course domain.Course) bool {
		return course.Title == "Updated Course" && course.Description == "Updated Description"
	})).Return(nil)

	// Act
	err := service.UpdateCourse(1, "Updated Course", "Updated Description", "Programming", "Jane Doe", 90, "Advanced knowledge")

	// Assert
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestUpdateCourse_MissingTitle(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Act
	err := service.UpdateCourse(1, "", "Description", "Category", "Instructor", 60, "Requirement")

	// Assert
	assert.Error(t, err)
	assert.Equal(t, "title is required", err.Error())
	mockRepo.AssertExpectations(t)
}

func TestUpdateCourse_DatabaseError(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("UpdateCourse", int64(1), mock.AnythingOfType("domain.Course")).Return(errors.New("database error"))

	// Act
	err := service.UpdateCourse(1, "Title", "Description", "Category", "Instructor", 60, "Requirement")

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error updating course from DB")
	mockRepo.AssertExpectations(t)
}

// Tests para DeleteCourse
func TestDeleteCourse_Success(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("DeleteCourseById", int64(1)).Return(nil)
	mockRepo.On("DeleteSubscriptionById", int64(1)).Return(nil)

	// Act
	err := service.DeleteCourse(1)

	// Assert
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestDeleteCourse_CourseDeleteError(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("DeleteCourseById", int64(1)).Return(errors.New("course not found"))

	// Act
	err := service.DeleteCourse(1)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error deleting course in DB")
	mockRepo.AssertExpectations(t)
}

func TestDeleteCourse_SubscriptionDeleteError(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("DeleteCourseById", int64(1)).Return(nil)
	mockRepo.On("DeleteSubscriptionById", int64(1)).Return(errors.New("subscription delete error"))

	// Act
	err := service.DeleteCourse(1)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error deleting subscriptcion in DB")
	mockRepo.AssertExpectations(t)
}

// Tests para CommentList
func TestCommentList_Success(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	commentIDs := []int64{1, 2}
	comment1 := domain.Comment{Id: 1, UserID: 1, Comment: "Great course!"}
	comment2 := domain.Comment{Id: 2, UserID: 2, Comment: "Very helpful"}

	mockRepo.On("GetCommentsByCourseId", int64(1)).Return(commentIDs, nil)
	mockRepo.On("GetCommentById", int64(1)).Return(comment1, nil)
	mockRepo.On("GetCommentById", int64(2)).Return(comment2, nil)

	// Act
	result, err := service.CommentList(1)

	// Assert
	assert.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, int64(1), result[0].UserID)
	assert.Equal(t, "Great course!", result[0].Comment)
	assert.Equal(t, int64(2), result[1].UserID)
	assert.Equal(t, "Very helpful", result[1].Comment)
	mockRepo.AssertExpectations(t)
}

func TestCommentList_NoComments(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("GetCommentsByCourseId", int64(1)).Return([]int64{}, nil)

	// Act
	result, err := service.CommentList(1)

	// Assert
	assert.NoError(t, err)
	assert.Len(t, result, 0)
	mockRepo.AssertExpectations(t)
}

func TestCommentList_GetCommentsError(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	mockRepo.On("GetCommentsByCourseId", int64(1)).Return(nil, errors.New("database error"))

	// Act
	result, err := service.CommentList(1)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "error getting comments IDs for course ID 1")
	mockRepo.AssertExpectations(t)
}

func TestCommentList_GetCommentError(t *testing.T) {
	// Arrange
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	commentIDs := []int64{1}
	mockRepo.On("GetCommentsByCourseId", int64(1)).Return(commentIDs, nil)
	mockRepo.On("GetCommentById", int64(1)).Return(domain.Comment{}, errors.New("comment not found"))

	// Act
	result, err := service.CommentList(1)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "error getting comment with ID 1")
	mockRepo.AssertExpectations(t)
}

// Tests para nuevos métodos

func TestGetCoursesByInstructor_Success(t *testing.T) {
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Configurar mock
	expectedCourses := []domain.Course{
		{Id: 1, Title: "Curso 1", Instructor: "profesor1"},
		{Id: 2, Title: "Curso 2", Instructor: "profesor1"},
	}
	mockRepo.On("GetCoursesByInstructor", "profesor1").Return(expectedCourses, nil)

	// Ejecutar
	result, err := service.GetCoursesByInstructor("profesor1")

	// Verificar
	assert.NoError(t, err)
	assert.Equal(t, expectedCourses, result)
	mockRepo.AssertExpectations(t)
}

func TestGetCoursesByInstructor_EmptyInstructor(t *testing.T) {
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Ejecutar con instructor vacío
	result, err := service.GetCoursesByInstructor("")

	// Verificar
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "instructor is required")
	assert.Nil(t, result)
}

func TestGetCoursesByInstructor_RepositoryError(t *testing.T) {
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Configurar mock para error
	mockRepo.On("GetCoursesByInstructor", "profesor1").Return(nil, errors.New("database error"))

	// Ejecutar
	result, err := service.GetCoursesByInstructor("profesor1")

	// Verificar
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error getting courses for instructor")
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}

func TestGetCourseImages_Success(t *testing.T) {
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Configurar mock
	expectedFiles := []domain.File{
		{Id: 1, Name: "imagen1.jpg", Course_Id: 1},
		{Id: 2, Name: "documento.pdf", Course_Id: 1},
	}
	mockRepo.On("GetCourseImages", int64(1)).Return(expectedFiles, nil)

	// Ejecutar
	result, err := service.GetCourseImages(1)

	// Verificar
	assert.NoError(t, err)
	assert.Equal(t, expectedFiles, result)
	mockRepo.AssertExpectations(t)
}

func TestGetCourseImages_InvalidCourseID(t *testing.T) {
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Ejecutar con ID inválido
	result, err := service.GetCourseImages(0)

	// Verificar
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid course ID")
	assert.Nil(t, result)
}

func TestGetCourseImages_RepositoryError(t *testing.T) {
	mockRepo := new(MockCourseRepository)
	service := courses.NewCourseService(mockRepo)

	// Configurar mock para error
	mockRepo.On("GetCourseImages", int64(1)).Return(nil, errors.New("database error"))

	// Ejecutar
	result, err := service.GetCourseImages(1)

	// Verificar
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error getting images for course")
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}
