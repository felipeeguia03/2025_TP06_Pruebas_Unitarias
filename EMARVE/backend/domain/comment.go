package domain

type CommentRequest struct {
	UserID   int64  `json:"userID"`
	CourseID int64  `json:"courseID"`
	Comment  string `json:"comment"`
}

type CommentResponse struct {
	UserID  int64  `json:"userID"`
	Comment string `json:"comment"`
}

type CommentList struct {
	Result []CommentResponse `json:"results"`
}

type Comment struct {
	Id       int64  `json:"id"`
	UserID   int64  `json:"user_id"`
	CourseID int64  `json:"course_id"`
	Comment  string `json:"comment"`
}
