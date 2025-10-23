package app

import (
	"backend/controllers/courses"
	"backend/controllers/users"
	"backend/dao"
	"backend/services/courses"
	"backend/services/users"

	"github.com/gin-gonic/gin"
)

func MapRoutes(engine *gin.Engine) {
	//funcion que levanta toda la aplicacion

	// Crear repositorios
	userRepo := dao.NewUserRepository()
	courseRepo := dao.NewCourseRepository()

	// Crear servicios con inyección de dependencias
	userService := users.NewUserService(userRepo)
	courseService := courses.NewCourseService(courseRepo)

	// Crear controladores con inyección de dependencias
	userController := users.NewUserController(userService)
	courseController := courses.NewCourseController(courseService)

	// Health check endpoint
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Backend is running",
		})
	})

	// Rutas de usuarios
	engine.POST("/users/login", userController.Login)
	engine.POST("/users/register", userController.UserRegister)
	engine.GET("/users/subscriptions/:id", userController.SubscriptionList)
	engine.POST("/users/comments", userController.AddComment)
	engine.POST("/upload", userController.UploadFiles)
	engine.GET("/users/authentication", userController.UserAuthentication)
	engine.GET("/users/userId", userController.GetUserID)

	// Rutas de cursos
	engine.GET("/courses/search", courseController.SearchCourse)
	engine.GET("/courses", courseController.GetAllCourses)
	engine.GET("/courses/:id", courseController.GetCourse)
	engine.POST("/subscriptions", courseController.Subscription)
	engine.POST("/courses/create", courseController.CreateCourse)
	engine.PUT("/courses/update/:id", courseController.UpdateCourse)
	engine.DELETE("/courses/delete/:id", courseController.DeleteCourse)
	engine.GET("/courses/comments/:id", courseController.CommentList)
}
