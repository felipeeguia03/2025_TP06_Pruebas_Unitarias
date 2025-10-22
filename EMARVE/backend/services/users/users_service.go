package users

import (
	"backend/dao"
	"backend/domain"
	"backend/interfaces"
	"crypto/md5"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	jwt "github.com/golang-jwt/jwt"
)

type userService struct {

	repo interfaces.UserRepositoryInterface
}

var jwtKey = []byte("secret_key")

func NewUserService(repo interfaces.UserRepositoryInterface) *userService {
	return &userService{repo: repo}
}

func (s *userService) Login(email string, password string) (string, error) {

	if strings.TrimSpace(email) == "" {
		return "", errors.New("email is required")
	}

	if strings.TrimSpace(password) == "" {
		return "", errors.New("password is required")
	}

	hash := fmt.Sprintf("%x", md5.Sum([]byte(password)))

	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return "", fmt.Errorf("error getting user from DB: %v", err)
	}

	if hash != user.PasswordHash {
		return "", errors.New("invalid credentials")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": user.Id,
		"type":   user.Type,
	})

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", fmt.Errorf("error signing JWT: %v", err)
	}

	return tokenString, nil
}

func (s *userService) UserRegister(nickname string, email string, password string, typeUser bool) (bool, error) {

	if strings.TrimSpace(nickname) == "" {
		return typeUser, errors.New("nickname is required")
	}

	if strings.TrimSpace(email) == "" {
		return typeUser, errors.New("email is required")
	}

	if strings.TrimSpace(password) == "" {
		return typeUser, errors.New("password is required")
	}

	hash := fmt.Sprintf("%x", md5.Sum([]byte(password)))

	NewUser := dao.User{
		Nickname:     nickname,
		Email:        email,
		PasswordHash: hash,
		Type:         typeUser,
	}

	err := s.repo.CreateUser(NewUser)
	if err != nil {
		return typeUser, fmt.Errorf("error creating user from DB: %v", err)
	}

	return typeUser, err
}

func (s *userService) SubscriptionList(UserID int64) ([]domain.Course, error) {
	courseIDs, err := s.repo.GetCourseIdsByUserId(UserID)
	if err != nil {
		return nil, fmt.Errorf("error getting course IDs for user ID %d: %v", UserID, err)
	}

	var courses []dao.Course

	for _, courseID := range courseIDs {
		course, err := s.repo.GetCourseById(courseID)
		if err != nil {
			return nil, fmt.Errorf("error getting course with ID %d: %v", courseID, err)
		}
		courses = append(courses, *course)
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

func (s *userService) AddComment(userID int64, courseID int64, comment string) error {

	if _, err := s.repo.GetUserById(userID); err != nil {
		return fmt.Errorf("error getting user from DB: %v", err)
	}

	if _, err := s.repo.GetCourseById(courseID); err != nil {
		return fmt.Errorf("error getting course from DB: %v", err)
	}

	if strings.TrimSpace(comment) == "" {
		return errors.New("comment is required")
	}

	if err := s.repo.InsertComment(userID, courseID, comment); err != nil {
		return fmt.Errorf("error inserting comment into DB: %v", err)
	}

	return nil
}

func (s *userService) UploadFiles(file io.Reader, filename string, userID int64, courseID int64) error {
	filePath := fmt.Sprintf("uploads/%s", filename)

	fileRecord := dao.File{
		User_Id:    userID,
		Course_Id:  courseID,
		Name:       filename,
		Url:        filePath,
		UploadDate: time.Now(),
	}

	if err := s.repo.SaveFile(fileRecord); err != nil {
		return fmt.Errorf("error uploading file in DB: %v", err)
	}

	destFile, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, file)
	if err != nil {
		return err
	}

	return nil
}

func (s *userService) UserAuthentication(tokenString string) (string, error) {
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")
	if tokenString == "" {
		return "", fmt.Errorf("bearer token is required")
	}

	claims := &jwt.MapClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtKey, nil
	})
	if err != nil {
		return "", fmt.Errorf("error parsing token: %v", err)
	}
	if !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	userType, ok := (*claims)["type"].(bool)
	if !ok {
		return "", fmt.Errorf("invalid token payload")
	}

	if !userType {
		return "student", nil
	} else {
		return "admin", nil
	}
}

func (s *userService) GetUserID(tokenString string) (int, error) {
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")
	if tokenString == "" {
		return 0, fmt.Errorf("bearer token is required")
	}

	claims := &jwt.MapClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtKey, nil
	})
	if err != nil {
		return 0, fmt.Errorf("error parsing token: %v", err)
	}
	if !token.Valid {
		return 0, fmt.Errorf("invalid token")
	}

	userID, ok := (*claims)["userID"].(float64)
	if !ok {
		return 0, fmt.Errorf("invalid token payload")
	}

	return int(userID), nil
}
