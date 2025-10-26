package dao

import (
	"backend/clients"
	"backend/domain"
	"backend/interfaces"
)

// UserRepository implementa UserRepositoryInterface
type UserRepository struct {
	dbClient interfaces.DatabaseClientInterface
}

func NewUserRepository() interfaces.UserRepositoryInterface {
	return &UserRepository{
		dbClient: clients.NewDatabaseClient(),
	}
}

func (r *UserRepository) GetUserByEmail(email string) (*domain.User, error) {
	return r.dbClient.GetUserByEmail(email)
}

func (r *UserRepository) CreateUser(user domain.User) error {
	return r.dbClient.CreateUser(user)
}

func (r *UserRepository) GetUserById(id int64) (*domain.User, error) {
	return r.dbClient.GetUserById(id)
}

func (r *UserRepository) GetCourseIdsByUserId(userID int64) ([]int64, error) {
	return r.dbClient.GetCourseIdsByUserId(userID)
}

func (r *UserRepository) GetCourseById(courseID int64) (*domain.Course, error) {
	return r.dbClient.GetCourseById(courseID)
}

func (r *UserRepository) InsertComment(userID, courseID int64, comment string) error {
	return r.dbClient.InsertComment(userID, courseID, comment)
}

func (r *UserRepository) SaveFile(file domain.File) error {
	return r.dbClient.SaveFile(file)
}
