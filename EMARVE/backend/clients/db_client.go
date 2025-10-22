package clients

import (
	"fmt"
	"os"

	"backend/dao"

	log "github.com/sirupsen/logrus"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const (
	connectionString = "%s:%s@tcp(%s:%d)/%s?charset=utf8&parseTime=True"
)

var (
	DBClient *gorm.DB
)

func init() {
	// DB Connections Parameters
	dbName := getEnv("DB_NAME", "final")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := 3306

	connection := fmt.Sprintf(connectionString, dbUser, dbPassword, dbHost, dbPort, dbName)

	db, err := gorm.Open(mysql.Open(connection), &gorm.Config{})
	if err != nil {
		panic(fmt.Errorf("error connecting to DB: %v", err))
	}
	DBClient = db
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func StartDB() {
	var user dao.User
	var course dao.Course
	var subscription dao.Subscription
	var comment dao.Comment
	var file dao.File
	if err := DBClient.AutoMigrate(&user, &course, &subscription, &comment, &file); err != nil {
		panic(fmt.Errorf("error creating entities: %v", err))
	}
}

func CreateUser(NewUser dao.User) error {
	var user dao.User

	result := DBClient.Where("Email = ?", NewUser.Email).First(&user)

	if result.Error == nil {
		return fmt.Errorf("user with email %s already exists", NewUser.Email)
	}

	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return fmt.Errorf("error checking for existing user for email %s", NewUser.Email)
	}

	result = DBClient.Where("Nickname = ?", NewUser.Nickname).First(&user)

	if result.Error == nil {
		return fmt.Errorf("user with nickname %s already exists", NewUser.Nickname)
	}

	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return fmt.Errorf("error checking for existing user for nickname %s", NewUser.Nickname)
	}

	result = DBClient.Create(&NewUser)
	if result.Error != nil {
		return fmt.Errorf("error creating user for nickname %s and email %s", NewUser.Nickname, NewUser.Email)
	}

	log.Debug("User created: ", NewUser)
	return nil

}

func GetUserById(ID int64) (dao.User, error) {
	var user dao.User

	result := DBClient.Where("id = ?", ID).First(&user)

	if result.Error != nil {
		return user, fmt.Errorf("not found user with ID: %d", ID)
	}

	log.Debug("User: ", user)
	return user, nil
}

func GetCourses() ([]dao.Course, error) {
	var courses []dao.Course

	result := DBClient.Find(&courses)

	if result.Error != nil {
		return nil, fmt.Errorf("error retrieving courses: %s", result.Error)
	}

	return courses, nil
}

func GetUserByEmail(email string) (dao.User, error) {
	var user dao.User

	result := DBClient.Where("email = ?", email).First(&user)

	if result.Error != nil {
		return user, fmt.Errorf("not found user with email: %s", email)
	}

	log.Debug("User: ", user)
	return user, nil
}

func GetCourseById(ID int64) (dao.Course, error) {
	var course dao.Course

	result := DBClient.Where("id = ?", ID).First(&course)

	if result.Error != nil {
		return course, fmt.Errorf("not found course with ID: %d", ID)
	}

	log.Debug("Course: ", course)
	return course, nil
}

func GetCoursewithQuery(query string) ([]dao.Course, error) {
	var courses []dao.Course

	result := DBClient.Where("title LIKE ? OR description LIKE ? OR category LIKE ? OR requirement LIKE ?", "%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%").Find(&courses)

	if result.Error != nil {
		return nil, fmt.Errorf("not found course with filter: %s", query)
	}

	return courses, nil
}

func GetCourseIdsByUserId(userID int64) ([]int64, error) {
	var subscriptions []dao.Subscription
	var courseIDs []int64

	result := DBClient.Where("user_id = ?", userID).Find(&subscriptions)
	if result.Error != nil {
		return nil, fmt.Errorf("error finding subscriptions for user ID: %d, %v", userID, result.Error)
	}

	for _, subscription := range subscriptions {
		courseIDs = append(courseIDs, subscription.Course_Id)
	}

	return courseIDs, nil
}

func InsertSubscription(userID int64, courseID int64) error {
	var subscription dao.Subscription

	result := DBClient.Where("user_id = ? AND course_id = ?", userID, courseID).First(&subscription)

	if result.Error == nil {
		return fmt.Errorf("subscription already exists for user %d and course %d", userID, courseID)
	}

	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return fmt.Errorf("error checking for existing subscription for user %d and course %d", userID, courseID)
	}

	NewSubscription := dao.Subscription{
		User_Id:   userID,
		Course_Id: courseID,
	}

	result = DBClient.Create(&NewSubscription)
	if result.Error != nil {
		return fmt.Errorf("error inserting subscription for user %d and course %d", userID, courseID)
	}

	log.Debug("Subscription created: ", NewSubscription)
	return nil

}

func DeleteCourseById(courseID int64) error {
	var course dao.Course

	result := DBClient.Where("id = ?", courseID).First(&course)

	if result.Error != nil {
		return fmt.Errorf("not found course with ID: %d", courseID)
	}

	result = DBClient.Delete(&course)
	if result.Error != nil {
		return fmt.Errorf("error deleting course for ID: %d", courseID)
	}

	log.Debug("Course Deleted: ", course)
	return nil
}

func DeleteSubscriptionById(courseID int64) error {
	var subscription dao.Subscription

	result := DBClient.Where("course_id = ?", courseID).Delete(&subscription)

	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return fmt.Errorf("error deleting course with id %d in subscription table", courseID)
	}

	return nil
}

func CreateCourse(NewCourse dao.Course) error {
	var course dao.Course

	result := DBClient.Where("Title = ?", NewCourse.Title).First(&course)

	if result.Error == nil {
		return fmt.Errorf("course with title %s already exists", NewCourse.Title)
	}

	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return fmt.Errorf("error checking for existing course for title %s", NewCourse.Title)
	}

	result = DBClient.Create(&NewCourse)
	if result.Error != nil {
		return fmt.Errorf("error creating course for title: %s", NewCourse.Title)
	}

	log.Debug("Course created: ", NewCourse)
	return nil
}

func UpdateCourse(courseID int64, courseUpdate dao.Course) error {
	var course dao.Course

	result := DBClient.Where("id = ?", courseID).First(&course)
	if result.Error != nil {
		return fmt.Errorf("not found course with ID: %d", courseID)
	}

	course.Title = courseUpdate.Title
	course.Description = courseUpdate.Description
	course.Category = courseUpdate.Category
	course.Duration = courseUpdate.Duration
	course.Instructor = courseUpdate.Instructor
	course.Requirement = courseUpdate.Requirement

	result = DBClient.Save(&course)
	if result.Error != nil {
		return fmt.Errorf("error updating course with ID:  %d", course.Id)
	}

	log.Debug("Course updated: ", course)
	return nil
}

func InsertComment(userID int64, courseID int64, text string) error {
	var comment dao.Comment
	result := DBClient.Where("user_id = ? AND course_id = ? AND text = ?", userID, courseID, text).First(&comment)

	if result.Error == nil {
		return fmt.Errorf("comment already exists for user %d and course %d", userID, courseID)
	}

	NewComment := dao.Comment{
		User_Id:   userID,
		Course_Id: courseID,
		Text:      text,
	}

	result = DBClient.Create(&NewComment)
	if result.Error != nil {
		return fmt.Errorf("error inserting comment for user %d and course %d", userID, courseID)
	}

	log.Debug("Comment created: ", NewComment)
	return nil
}

func GetCommentById(commentID int64) (dao.Comment, error) {
	var comment dao.Comment

	result := DBClient.Where("id = ?", commentID).First(&comment)

	if result.Error != nil {
		return comment, fmt.Errorf("not found comment with ID: %d", commentID)
	}

	log.Debug("Comment: ", comment)
	return comment, nil
}

func GetCommentsByCourseId(courseID int64) ([]int64, error) {
	var comments []dao.Comment
	var commentIDs []int64

	result := DBClient.Where("course_Id = ?", courseID).Find(&comments)
	if result.Error != nil {
		return nil, fmt.Errorf("error finding comments for course ID: %d, %v", courseID, result.Error)
	}

	for _, comment := range comments {
		commentIDs = append(commentIDs, comment.Id)
	}

	return commentIDs, nil
}

func SaveFile(NewFile dao.File) error {
	var course dao.Course
	var user dao.User

	result := DBClient.Where("id = ?", NewFile.Course_Id).First(&course)
	if result.Error != nil {
		return fmt.Errorf("not found course with ID: %d", NewFile.Course_Id)
	}

	result = DBClient.Where("id = ?", NewFile.User_Id).First(&user)
	if result.Error != nil {
		return fmt.Errorf("not found user with ID: %d", NewFile.User_Id)
	}

	result = DBClient.Create(&NewFile)
	if result.Error != nil {
		return fmt.Errorf("error creating file record: %v", result.Error)
	}
	log.Debug("File record created: ", NewFile)
	return nil
}
