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
