package users

import (
	userDomain "backend/domain"
	"backend/interfaces"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userService interfaces.UserServiceInterface
}

func NewUserController(userService interfaces.UserServiceInterface) *UserController {
	return &UserController{userService: userService}
}

// controllers es el unico que usa gin
func (uc *UserController) Login(c *gin.Context) {
	var loginRequest userDomain.LoginRequest

	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, userDomain.Result{
			Message: fmt.Sprintf(("Invalid request: %s"), err.Error()),
		})
		return
	}

	token, err := uc.userService.Login(loginRequest.Email, loginRequest.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, userDomain.Result{
			Message: fmt.Sprintf("Unauthorized login: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, userDomain.LoginResponse{
		Token: token,
	})
}

func (uc *UserController) UserRegister(c *gin.Context) {
	var registrationRequest userDomain.RegistrationRequest

	if err := c.ShouldBindJSON(&registrationRequest); err != nil {
		c.JSON(http.StatusBadRequest, userDomain.Result{
			Message: fmt.Sprintf(("Invalid request: %s"), err.Error()),
		})
		return
	}

	_, err := uc.userService.UserRegister(registrationRequest.Nickname, registrationRequest.Email, registrationRequest.Password, registrationRequest.Type)
	if err != nil {
		c.JSON(http.StatusConflict, userDomain.Result{
			Message: fmt.Sprintf("Error in registration: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, userDomain.Result{
		Message: fmt.Sprintf("Successful creation of user %s ", registrationRequest.Nickname),
	})
}

func (uc *UserController) SubscriptionList(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, userDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})

		return
	}

	results, err := uc.userService.SubscriptionList(id)
	if err != nil {
		c.JSON(http.StatusNotFound, userDomain.Result{
			Message: fmt.Sprintf("error in getting courses: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, userDomain.ListResponse{
		Result: results,
	})

}

func (uc *UserController) AddComment(c *gin.Context) {
	var commentRequest userDomain.CommentRequest
	if err := c.ShouldBindJSON(&commentRequest); err != nil {
		c.JSON(http.StatusBadRequest, userDomain.Result{
			Message: fmt.Sprintf("invalid request: %s", err.Error()),
		})
		return
	}

	if err := uc.userService.AddComment(commentRequest.UserID, commentRequest.CourseID, commentRequest.Comment); err != nil {
		c.JSON(http.StatusConflict, userDomain.Result{
			Message: fmt.Sprintf("error in course comment: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusCreated, userDomain.Result{
		Message: fmt.Sprintf("successful comment of user %d to course %d", commentRequest.UserID, commentRequest.CourseID),
	})
}

func (uc *UserController) UploadFiles(c *gin.Context) {

	c.Request.ParseMultipartForm(10 << 20)

	file, handler, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, userDomain.Result{
			Message: fmt.Sprintf("Error al obtener el archivo: %s", err.Error()),
		})
		return
	}
	defer file.Close()

	userIDStr := c.PostForm("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, userDomain.Result{
			Message: fmt.Sprintf("Invalid user ID: %s", err.Error()),
		})
		return
	}

	courseIDStr := c.PostForm("course_id")
	courseID, err := strconv.ParseInt(courseIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, userDomain.Result{
			Message: fmt.Sprintf("Invalid course ID: %s", err.Error()),
		})
		return
	}

	err = uc.userService.UploadFiles(file, handler.Filename, userID, courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, userDomain.Result{
			Message: fmt.Sprintf("Error al guardar el archivo: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, userDomain.Result{
		Message: fmt.Sprintf("Archivo subido exitosamente: %s", handler.Filename),
	})
}

func (uc *UserController) UserAuthentication(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, userDomain.Result{
			Message: "Authorization header is required",
		})
		return
	}

	userType, err := uc.userService.UserAuthentication(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, userDomain.Result{
			Message: fmt.Sprintf("Unauthorized: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, userDomain.Result{
		Message: userType,
	})
}

func (uc *UserController) GetUserById(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, userDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})
		return
	}

	user, err := uc.userService.GetUserById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, userDomain.Result{
			Message: fmt.Sprintf("user not found: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, userDomain.UserResponse{
		Id:       user.Id,
		Nickname: user.Nickname,
		Email:    user.Email,
		Type:     user.Type,
	})
}

func (uc *UserController) GetUserID(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, userDomain.Result{
			Message: "Authorization header is required",
		})
		return
	}

	userID, err := uc.userService.GetUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, userDomain.Result{
			Message: fmt.Sprintf("Unauthorized: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, userDomain.ResultInt{
		Message: userID,
	})
}
