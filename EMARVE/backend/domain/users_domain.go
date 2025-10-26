package domain

import "time"

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

type RegistrationRequest struct {
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Type     bool   `json:"type"`
}

type UpdateUserRequest struct {
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ListResponse struct {
	Result []Course `json:"results"`
}

type User struct {
	Id           int64  `json:"id"`
	Nickname     string `json:"nickname"`
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
	Type         bool   `json:"type"`
}

type UserResponse struct {
	Id       int64  `json:"id"`
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Type     bool   `json:"type"`
}

type File struct {
	Id         int64     `json:"id"`
	User_Id    int64     `json:"user_id"`
	Course_Id  int64     `json:"course_id"`
	Name       string    `json:"name"`
	Url        string    `json:"url"`
	UploadDate time.Time `json:"upload_date"`
}

type Subscription struct {
	Id       int64 `json:"id"`
	UserID   int64 `json:"user_id"`
	CourseID int64 `json:"course_id"`
}
