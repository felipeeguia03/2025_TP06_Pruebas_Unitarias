package dao

import (
	"backend/clients"
	"backend/interfaces"
)

// CourseRepository implementa CourseRepositoryInterface
type CourseRepository struct{}

func NewCourseRepository() interfaces.CourseRepositoryInterface {
	return &CourseRepository{}
}

func (r *CourseRepository) GetCoursewithQuery(query string) ([]Course, error) {
	return clients.GetCoursewithQuery(query)
}

func (r *CourseRepository) GetCourseById(id int64) (*Course, error) {
	return clients.GetCourseById(id)
}

func (r *CourseRepository) GetCourses() ([]Course, error) {
	return clients.GetCourses()
}

func (r *CourseRepository) GetUserById(userID int64) (*User, error) {
	return clients.GetUserById(userID)
}

func (r *CourseRepository) InsertSubscription(userID, courseID int64) error {
	return clients.InsertSubscription(userID, courseID)
}

func (r *CourseRepository) CreateCourse(course Course) error {
	return clients.CreateCourse(course)
}

func (r *CourseRepository) UpdateCourse(courseID int64, course Course) error {
	return clients.UpdateCourse(courseID, course)
}

func (r *CourseRepository) DeleteCourseById(courseID int64) error {
	return clients.DeleteCourseById(courseID)
}

func (r *CourseRepository) DeleteSubscriptionById(courseID int64) error {
	return clients.DeleteSubscriptionById(courseID)
}

func (r *CourseRepository) GetCommentsByCourseId(courseID int64) ([]int64, error) {
	return clients.GetCommentsByCourseId(courseID)
}

func (r *CourseRepository) GetCommentById(commentID int64) (Comment, error) {
	return clients.GetCommentById(commentID)
}
