package main

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"

	"time"

	"github.com/Yashwant937363/QueueCast/backend/database/myredis"
	"github.com/Yashwant937363/QueueCast/backend/database/postgres"
	"github.com/Yashwant937363/QueueCast/backend/middleware"
	"github.com/Yashwant937363/QueueCast/backend/socket"
	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateSecureID(length int) string {
	b := make([]byte, length)
	for i := range b {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		b[i] = charset[num.Int64()]
	}
	return string(b)
}

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

	type LoginRequest struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Picture  string `json:"picture"`
	}

	r.POST("/api/auth/login", func(c *gin.Context) {

		type LoginCache struct {
			Auth0Id string `json:"auth0Id"`
			Exists  bool   `json:"exists"`
		}

		val, geterr := myredis.RDB.Get(ctx, "logincache:"+c.GetHeader("Authorization")).Bytes()
		if geterr == redis.Nil {
			fmt.Println("key does not exist")
		} else if err != nil {
			fmt.Println(geterr)
		} else {
			var cacheData LoginCache

			err = json.Unmarshal(val, &cacheData)
			if err == nil {
				c.JSON(200, gin.H{
					"message": "success",
					"auth0Id": cacheData.Auth0Id,
				})
				return
			}
		}

		auth0ID, autherr := middleware.GetAuth0ID(c.GetHeader("Authorization"))

		if autherr != nil {
			c.JSON(400, gin.H{
				"error": autherr.Error(),
			})
			return
		}
		var body LoginRequest
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}

		fmt.Println(
			"Auth0 ID: ", auth0ID,
		)

		exists, err := postgres.CheckForUser(body.Email)
		if err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		}

		if !exists && body.Email != "" {

			_, createErr := postgres.CreateUser(structs.User{
				Email: body.Email, Username: body.Username, Picture: &body.Picture, Auth0Id: auth0ID,
			})
			if createErr != nil {
				c.JSON(500, gin.H{
					"error": createErr.Error(),
				})
			}
		}

		cache := LoginCache{
			Auth0Id: auth0ID,
			Exists:  exists,
		}

		data, _ := json.Marshal(cache)

		myredis.RDB.Set(ctx, "logincache:"+c.GetHeader("Authorization"), data, 30*time.Second)

		c.JSON(200, gin.H{
			"message": "success",
			"auth0Id": auth0ID,
		})
	})

	type CreateRoomRequestUser struct {
		Name    string `json:"username"`
		Picture string `json:"picture"`
	}

	type CreateRoomDetails struct {
		Name         string `json:"name"`
		Limit        int    `json:"limit"`
		IsPrivate    bool   `json:"isPrivate"`
		IsMasterOnly bool   `json:"isMasterOnly"`
	}

	type CreateRoomRequest struct {
		User        CreateRoomRequestUser `json:"user"`
		RoomDetails CreateRoomDetails     `json:"room"`
	}

	r.POST("/api/room", func(c *gin.Context) {
		auth0Id, autherr := middleware.GetAuth0ID(c.GetHeader("Authorization"))
		if autherr != nil {
			c.JSON(400, gin.H{
				"error": autherr.Error(),
			})
			return
		}

		var body CreateRoomRequest
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}

		roomId := generateSecureID(5)

		newRoom := structs.Room{
			Name:         body.RoomDetails.Name,
			Owner:        structs.RoomUser{Auth0Id: auth0Id, Username: body.RoomDetails.Name, Picture: &body.User.Picture},
			RoomId:       roomId,
			Limit:        body.RoomDetails.Limit,
			IsPrivate:    body.RoomDetails.IsPrivate,
			IsMasterOnly: body.RoomDetails.IsMasterOnly,
			Songs:        []structs.Song{},
			Clients:      []structs.RoomUser{},
		}
		data, _ := json.Marshal(newRoom)
		myredis.RDB.Set(ctx, "room:"+roomId, data, 0)
		myredis.RDB.SAdd(ctx, "rooms", newRoom.RoomId)
		c.JSON(201, gin.H{
			"message": "room created",
			"roomId":  roomId,
			"auth0Id": auth0Id,
		})
	})

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
