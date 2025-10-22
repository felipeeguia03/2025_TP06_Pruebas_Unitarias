package app

import (
	"backend/controllers/courses"
	"backend/controllers/users"

	"github.com/gin-gonic/gin"
)

func MapRoutes(engine *gin.Engine) {
	//funcion que levanta toda la aplicacion

	// Health check endpoint
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Backend is running",
		})
	})
	engine.POST("/users/login", users.Login) //primer parametro la url y como segundo la funcion del controlador
	engine.POST("/users/register", users.UserRegister)
	engine.GET("/courses/search", courses.SearchCourse)
	engine.GET("/courses", courses.GetAllCourses)
	engine.GET("/courses/:id", courses.GetCourse)
	engine.POST("/subscriptions", courses.Subscription)
	engine.POST("/courses/create", courses.CreateCourse)
	engine.PUT("/courses/update/:id", courses.UpdateCorse)
	engine.DELETE("/courses/delete/:id", courses.DeleteCourse)
	engine.GET("/users/subscriptions/:id", users.SubscriptionList)
	engine.POST("/users/comments", users.AddComment)
	engine.GET("/courses/comments/:id", courses.CommentList)
	engine.POST("/upload", users.UploadFiles)
	engine.GET("/users/authentication", users.UserAuthentication)
	engine.GET("/users/userId", users.GetUserID)
}
