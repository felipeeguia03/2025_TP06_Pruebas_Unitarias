package interfaces

import (
	"backend/domain"
	"io"
)

// UserServiceInterface define las operaciones del servicio de usuarios
type UserServiceInterface interface {
	Login(email, password string) (string, error)
	UserRegister(nickname, email, password string, typeUser bool) (bool, error)
	SubscriptionList(userID int64) ([]domain.Course, error)
	AddComment(userID, courseID int64, comment string) error
	UploadFiles(file io.Reader, filename string, userID, courseID int64) error
	UserAuthentication(tokenString string) (string, error)
	GetUserID(tokenString string) (int, error)
	GetUserById(userID int64) (*domain.User, error)
}

// UserRepositoryInterface define las operaciones de acceso a datos de usuarios
type UserRepositoryInterface interface {
	GetUserByEmail(email string) (*domain.User, error)
	CreateUser(user domain.User) error
	GetUserById(id int64) (*domain.User, error)
	GetCourseIdsByUserId(userID int64) ([]int64, error)
	GetCourseById(courseID int64) (*domain.Course, error)
	InsertComment(userID, courseID int64, comment string) error
	SaveFile(file domain.File) error
}
