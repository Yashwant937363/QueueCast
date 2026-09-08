package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Yashwant937363/QueueCast/backend/database/myredis"
	"github.com/Yashwant937363/QueueCast/backend/database/postgres"
	"github.com/Yashwant937363/QueueCast/backend/handlers"
	"github.com/Yashwant937363/QueueCast/backend/middleware"
	"github.com/Yashwant937363/QueueCast/backend/socket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var ctx = context.Background()

func main() {
	fmt.Println("Server Startup")
	_, err := middleware.NewValidator()
	if err != nil {
		log.Fatalf("failed to create jwt validator: %v", err)
	}

	enverr := godotenv.Load()
	if enverr != nil {
		log.Fatalf("error while loading env file")
	}
	r := gin.Default()

	fmt.Println(os.Getenv("FRONTEND_URL"))

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			os.Getenv("FRONTEND_URL"),
		},
		AllowMethods: []string{
			"GET", "POST", "PUT", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
	}))

	r.POST("/api/auth/login", handlers.LoginUser)

	r.POST("/api/room", handlers.CreateRoom)
	r.GET("/api/rooms", handlers.GetRooms)

	r.Any("/api/saavn/*path", handlers.ProxySaavn)
	r.Any("/api/saavn", handlers.ProxySaavn)

	r.GET("/ws", func(c *gin.Context) {
		socket.WsHandler(c.Writer, c.Request)
	})

	fmt.Println("Websocket server started")

	if err := postgres.ConnectDB(); err != nil {
		panic(err)
	}

	rediserr := myredis.ConnectRedis()
	if rediserr != nil {
		panic(rediserr)
	}

	socket.StartRedisSubscriber()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}
