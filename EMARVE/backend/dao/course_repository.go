package dao

import (
	"backend/clients"
	"backend/domain"
	"backend/interfaces"
)

// CourseRepository implementa CourseRepositoryInterface
type CourseRepository struct {
	dbClient interfaces.DatabaseClientInterface
}

func NewCourseRepository() interfaces.CourseRepositoryInterface {
	return &CourseRepository{
		dbClient: clients.NewDatabaseClient(),
	}
}

func (r *CourseRepository) GetCoursewithQuery(query string) ([]domain.Course, error) {
	return r.dbClient.GetCoursewithQuery(query)
}

func (r *CourseRepository) GetCourseById(id int64) (*domain.Course, error) {
	return r.dbClient.GetCourseById(id)
}

func (r *CourseRepository) GetCourses() ([]domain.Course, error) {
	return r.dbClient.GetCourses()
}

func (r *CourseRepository) GetUserById(userID int64) (*domain.User, error) {
	return r.dbClient.GetUserById(userID)
}

func (r *CourseRepository) GetCourseImages(courseID int64) ([]domain.File, error) {
	return r.dbClient.GetCourseImages(courseID)
}

func (r *CourseRepository) GetCoursesByInstructor(instructor string) ([]domain.Course, error) {
	return r.dbClient.GetCoursesByInstructor(instructor)
}

func (r *CourseRepository) InsertSubscription(userID, courseID int64) error {
	return r.dbClient.InsertSubscription(userID, courseID)
}

func (r *CourseRepository) CreateCourse(course domain.Course) error {
	return r.dbClient.CreateCourse(course)
}

func (r *CourseRepository) UpdateCourse(courseID int64, course domain.Course) error {
	return r.dbClient.UpdateCourse(courseID, course)
}

func (r *CourseRepository) DeleteCourseById(courseID int64) error {
	return r.dbClient.DeleteCourseById(courseID)
}

func (r *CourseRepository) DeleteSubscriptionById(courseID int64) error {
	return r.dbClient.DeleteSubscriptionById(courseID)
}

func (r *CourseRepository) GetCommentsByCourseId(courseID int64) ([]int64, error) {
	return r.dbClient.GetCommentsByCourseId(courseID)
}

func (r *CourseRepository) GetCommentById(commentID int64) (domain.Comment, error) {
	return r.dbClient.GetCommentById(commentID)
}
