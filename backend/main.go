package main

import (
	"context"
	"fmt"
	"log"

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

	_, err := middleware.NewValidator()
	if err != nil {
		log.Fatalf("failed to create jwt validator: %v", err)
	}

	enverr := godotenv.Load()
	if enverr != nil {
		fmt.Println("error while loading env file")
	}
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
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

	r.Run(":8080")
}
