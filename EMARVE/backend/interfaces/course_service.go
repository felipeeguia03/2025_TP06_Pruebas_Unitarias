package interfaces

import (
	"backend/dao"
	"backend/domain"
)

// CourseServiceInterface define las operaciones del servicio de cursos
type CourseServiceInterface interface {
	SearchCourse(query string) ([]domain.Course, error)
	GetCourse(id int64) (domain.Course, error)
	GetAllCourses() ([]domain.Course, error)
	Subscription(userID, courseID int64) error
	CreateCourse(title, description, category, instructor string, duration int64, requirement string) error
	UpdateCourse(courseID int64, title, description, category, instructor string, duration int64, requirement string) error
	DeleteCourse(courseID int64) error
	CommentList(courseID int64) ([]domain.CommentResponse, error)
}

// CourseRepositoryInterface define las operaciones de acceso a datos de cursos
type CourseRepositoryInterface interface {
	GetCoursewithQuery(query string) ([]dao.Course, error)
	GetCourseById(id int64) (*dao.Course, error)
	GetCourses() ([]dao.Course, error)
	GetUserById(userID int64) (*dao.User, error)
	InsertSubscription(userID, courseID int64) error
	CreateCourse(course dao.Course) error
	UpdateCourse(courseID int64, course dao.Course) error
	DeleteCourseById(courseID int64) error
	DeleteSubscriptionById(courseID int64) error
	GetCommentsByCourseId(courseID int64) ([]int64, error)
	GetCommentById(commentID int64) (dao.Comment, error)
}
