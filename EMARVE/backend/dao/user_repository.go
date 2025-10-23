package dao

import (
	"backend/clients"
	"backend/interfaces"
)

// UserRepository implementa UserRepositoryInterface
type UserRepository struct{}

func NewUserRepository() interfaces.UserRepositoryInterface {
	return &UserRepository{}
}

func (r *UserRepository) GetUserByEmail(email string) (*User, error) {
	return clients.GetUserByEmail(email)
}

func (r *UserRepository) CreateUser(user User) error {
	return clients.CreateUser(user)
}

func (r *UserRepository) GetUserById(id int64) (*User, error) {
	return clients.GetUserById(id)
}

func (r *UserRepository) GetCourseIdsByUserId(userID int64) ([]int64, error) {
	return clients.GetCourseIdsByUserId(userID)
}

func (r *UserRepository) GetCourseById(courseID int64) (*Course, error) {
	return clients.GetCourseById(courseID)
}

func (r *UserRepository) InsertComment(userID, courseID int64, comment string) error {
	return clients.InsertComment(userID, courseID, comment)
}

func (r *UserRepository) SaveFile(file File) error {
	return clients.SaveFile(file)
}
