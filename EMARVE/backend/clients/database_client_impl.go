package clients

import (
	"backend/domain"
	"backend/interfaces"
	"fmt"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const (
	connectionString = "%s:%s@tcp(%s:%d)/%s?charset=utf8&parseTime=True"
)

// DatabaseClient implementa DatabaseClientInterface
type DatabaseClient struct {
	db *gorm.DB
}

var (
	DBClient *gorm.DB
)

func init() {
	// No inicializar la conexión automáticamente
	// Se inicializará cuando sea necesario
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// NewDatabaseClient crea una nueva instancia del cliente de base de datos
func NewDatabaseClient() interfaces.DatabaseClientInterface {
	return &DatabaseClient{db: getDB()}
}

// getDB obtiene la conexión a la base de datos, inicializándola si es necesario
func getDB() *gorm.DB {
	if DBClient == nil {
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
	return DBClient
}

// AutoMigrate ejecuta las migraciones de la base de datos
func (dc *DatabaseClient) AutoMigrate() error {
	var user domain.User
	var course domain.Course
	var subscription domain.Subscription
	var comment domain.Comment
	var file domain.File

	if err := dc.db.AutoMigrate(&user, &course, &subscription, &comment, &file); err != nil {
		return fmt.Errorf("error creating entities: %v", err)
	}
	return nil
}

// Operaciones de usuarios
func (dc *DatabaseClient) GetUserByEmail(email string) (*domain.User, error) {
	var user domain.User
	result := dc.db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (dc *DatabaseClient) CreateUser(user domain.User) error {
	result := dc.db.Create(&user)
	return result.Error
}

func (dc *DatabaseClient) GetUserById(id int64) (*domain.User, error) {
	var user domain.User
	result := dc.db.First(&user, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// Operaciones de cursos
func (dc *DatabaseClient) GetCoursewithQuery(query string) ([]domain.Course, error) {
	var courses []domain.Course
	result := dc.db.Where("title LIKE ? OR description LIKE ?", "%"+query+"%", "%"+query+"%").Find(&courses)
	return courses, result.Error
}

func (dc *DatabaseClient) GetCourseById(id int64) (*domain.Course, error) {
	var course domain.Course
	result := dc.db.First(&course, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &course, nil
}

func (dc *DatabaseClient) GetCourses() ([]domain.Course, error) {
	var courses []domain.Course
	result := dc.db.Find(&courses)
	return courses, result.Error
}

func (dc *DatabaseClient) CreateCourse(course domain.Course) error {
	result := dc.db.Create(&course)
	return result.Error
}

func (dc *DatabaseClient) UpdateCourse(courseID int64, course domain.Course) error {
	result := dc.db.Model(&domain.Course{}).Where("id = ?", courseID).Updates(course)
	return result.Error
}

func (dc *DatabaseClient) GetCourseImages(courseID int64) ([]domain.File, error) {
	var files []domain.File
	result := dc.db.Where("course_id = ?", courseID).Find(&files)
	if result.Error != nil {
		return nil, result.Error
	}
	return files, nil
}

func (dc *DatabaseClient) GetCoursesByInstructor(instructor string) ([]domain.Course, error) {
	var courses []domain.Course
	result := dc.db.Where("instructor = ?", instructor).Find(&courses)
	if result.Error != nil {
		return nil, result.Error
	}
	return courses, nil
}

func (dc *DatabaseClient) DeleteCourseById(courseID int64) error {
	result := dc.db.Delete(&domain.Course{}, courseID)
	return result.Error
}

// Operaciones de suscripciones
func (dc *DatabaseClient) InsertSubscription(userID, courseID int64) error {
	// Verificar si ya existe la suscripción
	var existingSubscription domain.Subscription
	result := dc.db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&existingSubscription)
	if result.Error == nil {
		// La suscripción ya existe
		return fmt.Errorf("user %d is already subscribed to course %d", userID, courseID)
	}

	subscription := domain.Subscription{
		UserID:   userID,
		CourseID: courseID,
	}
	result = dc.db.Create(&subscription)
	return result.Error
}

func (dc *DatabaseClient) GetCourseIdsByUserId(userID int64) ([]int64, error) {
	var subscriptions []domain.Subscription
	result := dc.db.Where("user_id = ?", userID).Find(&subscriptions)
	if result.Error != nil {
		return nil, result.Error
	}

	var courseIDs []int64
	for _, sub := range subscriptions {
		courseIDs = append(courseIDs, sub.CourseID)
	}
	return courseIDs, nil
}

func (dc *DatabaseClient) DeleteSubscriptionById(courseID int64) error {
	result := dc.db.Where("course_id = ?", courseID).Delete(&domain.Subscription{})
	return result.Error
}

// Operaciones de comentarios
func (dc *DatabaseClient) InsertComment(userID, courseID int64, comment string) error {
	commentRecord := domain.Comment{
		UserID:   userID,
		CourseID: courseID,
		Comment:  comment,
	}
	result := dc.db.Create(&commentRecord)
	return result.Error
}

func (dc *DatabaseClient) GetCommentsByCourseId(courseID int64) ([]int64, error) {
	var comments []domain.Comment
	result := dc.db.Where("course_id = ?", courseID).Find(&comments)
	if result.Error != nil {
		return nil, result.Error
	}

	var commentIDs []int64
	for _, comment := range comments {
		commentIDs = append(commentIDs, comment.Id)
	}
	return commentIDs, nil
}

func (dc *DatabaseClient) GetCommentById(commentID int64) (domain.Comment, error) {
	var comment domain.Comment
	result := dc.db.First(&comment, commentID)
	return comment, result.Error
}

// Operaciones de archivos
func (dc *DatabaseClient) SaveFile(file domain.File) error {
	result := dc.db.Create(&file)
	return result.Error
}

// StartDB función de compatibilidad para mantener la funcionalidad existente
func StartDB() {
	client := NewDatabaseClient()
	if err := client.AutoMigrate(); err != nil {
		panic(fmt.Errorf("error creating entities: %v", err))
	}
}
