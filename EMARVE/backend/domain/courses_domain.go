package domain

import "time"

type Course struct {
	Id           int       `json:"id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Category     string    `json:"category"`
	Instructor   string    `json:"instructor"`
	Duration     int64     `json:"duration"`
	Requirement  string    `json:"requirement"`
	CreationDate time.Time `json:"creation_date"`
	LastUpdate   time.Time `json:"last_update"`
}

type SearchRequest struct {
	Query string `json:"query"`
}

type SearchResponse struct {
	Result []Course `json:"results"`
}

type SubscribeRequest struct {
	UserId   int64 `json:"user_id"`
	CourseId int64 `json:"course_id"`
}

type CourseRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Instructor  string `json:"instructor"`
	Duration    int64  `json:"duration"`
	Requirement string `json:"requirement"`
}
