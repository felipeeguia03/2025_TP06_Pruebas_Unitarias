package app

import (
	"backend/controllers/courses"
	"backend/controllers/users"
	"backend/dao"
	coursesService "backend/services/courses"
	usersService "backend/services/users"

	"github.com/gin-gonic/gin"
)

func MapRoutes(engine *gin.Engine) {
	//funcion que levanta toda la aplicacion

	// Servir archivos estáticos desde la carpeta uploads
	engine.Static("/uploads", "./uploads")

	// Crear repositorios
	userRepo := dao.NewUserRepository()
	courseRepo := dao.NewCourseRepository()

	// Crear servicios con inyección de dependencias
	userService := usersService.NewUserService(userRepo)
	courseService := coursesService.NewCourseService(courseRepo)

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
	engine.GET("/users/:id", userController.GetUserById)

	// Rutas de cursos
	engine.GET("/courses/search", courseController.SearchCourse)
	engine.GET("/courses", courseController.GetAllCourses)
	engine.GET("/courses/instructor/:instructor", courseController.GetCoursesByInstructor)
	engine.GET("/courses/comments/:id", courseController.CommentList)
	engine.GET("/courses/images/:id", courseController.GetCourseImages)
	engine.GET("/courses/:id", courseController.GetCourse)
	engine.POST("/subscriptions", courseController.Subscription)
	engine.POST("/courses/create", courseController.CreateCourse)
	engine.PUT("/courses/update/:id", courseController.UpdateCourse)
	engine.DELETE("/courses/delete/:id", courseController.DeleteCourse)
}
