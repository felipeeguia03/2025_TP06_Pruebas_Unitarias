package interfaces

import (
	"backend/domain"
)

// DatabaseClientInterface define las operaciones del cliente de base de datos
type DatabaseClientInterface interface {
	// Operaciones de usuarios
	GetUserByEmail(email string) (*domain.User, error)
	CreateUser(user domain.User) error
	GetUserById(id int64) (*domain.User, error)

	// Operaciones de cursos
	GetCoursewithQuery(query string) ([]domain.Course, error)
	GetCourseById(id int64) (*domain.Course, error)
	GetCourses() ([]domain.Course, error)
	GetCoursesByInstructor(instructor string) ([]domain.Course, error)
	CreateCourse(course domain.Course) error
	UpdateCourse(courseID int64, course domain.Course) error
	DeleteCourseById(courseID int64) error

	// Operaciones de suscripciones
	InsertSubscription(userID, courseID int64) error
	GetCourseIdsByUserId(userID int64) ([]int64, error)
	DeleteSubscriptionById(courseID int64) error

	// Operaciones de comentarios
	InsertComment(userID, courseID int64, comment string) error
	GetCommentsByCourseId(courseID int64) ([]int64, error)
	GetCommentById(commentID int64) (domain.Comment, error)

	// Operaciones de archivos
	SaveFile(file domain.File) error
	GetCourseImages(courseID int64) ([]domain.File, error)

	// Operaciones de migración
	AutoMigrate() error
}
