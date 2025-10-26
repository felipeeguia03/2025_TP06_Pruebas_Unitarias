package interfaces

import (
	"backend/domain"
)

// CourseServiceInterface define las operaciones del servicio de cursos
type CourseServiceInterface interface {
	SearchCourse(query string) ([]domain.Course, error)
	GetCourse(id int64) (domain.Course, error)
	GetAllCourses() ([]domain.Course, error)
	GetCoursesByInstructor(instructor string) ([]domain.Course, error)
	GetCourseImages(courseID int64) ([]domain.File, error)
	Subscription(userID, courseID int64) error
	CreateCourse(title, description, category, instructor string, duration int64, requirement string) error
	UpdateCourse(courseID int64, title, description, category, instructor string, duration int64, requirement string) error
	DeleteCourse(courseID int64) error
	CommentList(courseID int64) ([]domain.CommentResponse, error)
}

// CourseRepositoryInterface define las operaciones de acceso a datos de cursos
type CourseRepositoryInterface interface {
	GetCoursewithQuery(query string) ([]domain.Course, error)
	GetCourseById(id int64) (*domain.Course, error)
	GetCourses() ([]domain.Course, error)
	GetCoursesByInstructor(instructor string) ([]domain.Course, error)
	GetCourseImages(courseID int64) ([]domain.File, error)
	GetUserById(userID int64) (*domain.User, error)
	InsertSubscription(userID, courseID int64) error
	CreateCourse(course domain.Course) error
	UpdateCourse(courseID int64, course domain.Course) error
	DeleteCourseById(courseID int64) error
	DeleteSubscriptionById(courseID int64) error
	GetCommentsByCourseId(courseID int64) ([]int64, error)
	GetCommentById(commentID int64) (domain.Comment, error)
}
