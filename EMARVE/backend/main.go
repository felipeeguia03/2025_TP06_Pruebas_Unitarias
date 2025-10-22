package main

import (
	"backend/app"
	"time"

	"backend/clients"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	clients.StartDB()
	engine := gin.New()

	// Configuración CORS para permitir solicitudes desde el frontend
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:3001", "http://localhost:3002"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Auth-Token"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	engine.Use(cors.New(config))
	app.MapRoutes(engine)
	engine.Run(":8080")
}
