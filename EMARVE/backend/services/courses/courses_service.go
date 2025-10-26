package courses

import (
	"backend/domain"
	"backend/interfaces"
	"time"

	"errors"
	"fmt"
	"strings"
)

type courseService struct {
	repo interfaces.CourseRepositoryInterface
}

func NewCourseService(repo interfaces.CourseRepositoryInterface) *courseService {
	return &courseService{repo: repo}
}

func (s *courseService) SearchCourse(query string) ([]domain.Course, error) {

	trimmed := strings.TrimSpace(query)

	courses, err := s.repo.GetCoursewithQuery(trimmed)

	if err != nil {
		return nil, fmt.Errorf("error getting courses from DB: %s", err)
	}

	results := make([]domain.Course, 0)

	for _, course := range courses {
		results = append(results, domain.Course{
			Id:           course.Id,
			Title:        course.Title,
			Description:  course.Description,
			Category:     course.Category,
			Instructor:   course.Instructor,
			Duration:     course.Duration,
			Requirement:  course.Requirement,
			CreationDate: course.CreationDate,
			LastUpdate:   course.LastUpdate,
		})
	}

	return results, nil
}

func (s *courseService) GetCourse(ID int64) (domain.Course, error) {
	course, err := s.repo.GetCourseById(ID)

	if err != nil {
		return domain.Course{}, fmt.Errorf("error getting course from DB: %v", err)
	}

	return domain.Course{
		Id:           course.Id,
		Title:        course.Title,
		Description:  course.Description,
		Category:     course.Category,
		Instructor:   course.Instructor,
		Duration:     course.Duration,
		Requirement:  course.Requirement,
		CreationDate: course.CreationDate,
		LastUpdate:   course.LastUpdate,
	}, nil
}

func (s *courseService) GetAllCourses() ([]domain.Course, error) {
	courses, err := s.repo.GetCourses()

	if err != nil {
		return nil, fmt.Errorf("error getting courses from DB: %s", err)
	}

	results := make([]domain.Course, 0)

	for _, course := range courses {
		results = append(results, domain.Course{
			Id:           course.Id,
			Title:        course.Title,
			Description:  course.Description,
			Category:     course.Category,
			Instructor:   course.Instructor,
			Duration:     course.Duration,
			Requirement:  course.Requirement,
			CreationDate: course.CreationDate,
			LastUpdate:   course.LastUpdate,
		})
	}

	return results, nil
}

func (s *courseService) GetCourseImages(courseID int64) ([]domain.File, error) {
	if courseID <= 0 {
		return nil, errors.New("invalid course ID")
	}

	images, err := s.repo.GetCourseImages(courseID)
	if err != nil {
		return nil, fmt.Errorf("error getting images for course %d from DB: %v", courseID, err)
	}

	return images, nil
}

func (s *courseService) GetCoursesByInstructor(instructor string) ([]domain.Course, error) {
	if strings.TrimSpace(instructor) == "" {
		return nil, errors.New("instructor is required")
	}

	results, err := s.repo.GetCoursesByInstructor(instructor)
	if err != nil {
		return nil, fmt.Errorf("error getting courses for instructor %s from DB: %v", instructor, err)
	}

	return results, nil
}

func (s *courseService) Subscription(userID int64, courseID int64) error {

	if _, err := s.repo.GetUserById(userID); err != nil {
		return fmt.Errorf("error getting user from DB: %v", err)
	}

	if _, err := s.repo.GetCourseById(courseID); err != nil {
		return fmt.Errorf("error getting course from DB: %v", err)
	}

	if err := s.repo.InsertSubscription(userID, courseID); err != nil {
		return fmt.Errorf("error inserting subscription into DB: %v", err)
	}

	return nil
}

func (s *courseService) CreateCourse(title string, description string, category string, instructor string, duration int64, requirement string) error {

	if strings.TrimSpace(title) == "" {
		return errors.New("title is required")
	}

	if strings.TrimSpace(description) == "" {
		return errors.New("description is required")
	}

	if strings.TrimSpace(category) == "" {
		return errors.New("category is required")
	}

	if strings.TrimSpace(instructor) == "" {
		return errors.New("instructor is required")
	}

	if duration == 0 {
		return errors.New("duration is required")
	}

	if strings.TrimSpace(requirement) == "" {
		return errors.New("requirement is required")
	}

	NewCourse := domain.Course{
		Title:        title,
		Description:  description,
		Category:     category,
		Instructor:   instructor,
		Duration:     duration,
		Requirement:  requirement,
		CreationDate: time.Now(),
		LastUpdate:   time.Now(),
	}

	err := s.repo.CreateCourse(NewCourse)
	if err != nil {
		return fmt.Errorf("error creating course from DB: %v", err)
	}

	return nil
}

func (s *courseService) UpdateCourse(courseID int64, title string, description string, category string, instructor string, duration int64, requirement string) error {

	if strings.TrimSpace(title) == "" {
		return errors.New("title is required")
	}

	if strings.TrimSpace(description) == "" {
		return errors.New("description is required")
	}

	if strings.TrimSpace(category) == "" {
		return errors.New("category is required")
	}

	if strings.TrimSpace(instructor) == "" {
		return errors.New("instructor is required")
	}

	if duration == 0 {
		return errors.New("duration is required")
	}

	if strings.TrimSpace(requirement) == "" {
		return errors.New("requirement is required")
	}

	courseUpdate := domain.Course{
		Title:       title,
		Description: description,
		Category:    category,
		Instructor:  instructor,
		Duration:    duration,
		Requirement: requirement,
	}

	err := s.repo.UpdateCourse(courseID, courseUpdate)
	if err != nil {
		return fmt.Errorf("error updating course from DB: %v", err)
	}
	return nil
}

func (s *courseService) DeleteCourse(courseID int64) error {

	if err := s.repo.DeleteCourseById(courseID); err != nil {
		return fmt.Errorf("error deleting course in DB: %v", err)
	}

	if err := s.repo.DeleteSubscriptionById(courseID); err != nil {
		return fmt.Errorf("error deleting subscriptcion in DB: %v", err)
	}

	return nil
}

func (s *courseService) CommentList(CourseID int64) ([]domain.CommentResponse, error) {
	commentIDs, err := s.repo.GetCommentsByCourseId(CourseID)
	if err != nil {
		return nil, fmt.Errorf("error getting comments IDs for course ID %d: %v", CourseID, err)
	}

	var comments []domain.Comment

	for _, commentID := range commentIDs {
		comment, err := s.repo.GetCommentById(commentID)
		if err != nil {
			return nil, fmt.Errorf("error getting comment with ID %d: ", commentID)
		}
		comments = append(comments, comment)
	}

	results := make([]domain.CommentResponse, 0)

	for _, comment := range comments {
		results = append(results, domain.CommentResponse{
			UserID:  comment.UserID,
			Comment: comment.Comment,
		})
	}

	return results, nil
}
