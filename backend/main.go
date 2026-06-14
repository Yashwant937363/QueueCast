package main

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/Yashwant937363/QueueCast/backend/database"
	"github.com/Yashwant937363/QueueCast/backend/middleware"
	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()
var rooms = make(map[string]*structs.Room)

var clients = make(map[*websocket.Conn]bool) // Connected clients
var broadcast = make(chan BroadcastMessage)
var rw sync.RWMutex

type BroadcastMessage struct {
	roomId  string
	Message []byte
}

type JoinRoomMessage struct {
	Auth0Id  string `json:"auth0Id"`
	RoomId   string `json:"roomId"`
	Username string `json:"username"`
	Picture  string `json:"picture"`
}

type WSMessage struct {
	Event   string          `json:"event"`
	Message json.RawMessage `json:"message"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateSecureID(length int) string {
	b := make([]byte, length)
	for i := range b {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		b[i] = charset[num.Int64()]
	}
	return string(b)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading:", err)
		return
	}
	fmt.Println("Client connected")
	defer conn.Close()
	// Listen for incoming messages
	for {
		// Read message from the client
		_, message, err := conn.ReadMessage()

		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
		var msg WSMessage
		err = json.Unmarshal(message, &msg)
		if err != nil {
			fmt.Println("Error converting json message:", err)
			break
		}
		switch msg.Event {

		case "join-room":
			var req JoinRoomMessage
			err = json.Unmarshal(msg.Message, &req)
			if err != nil {
				fmt.Println("Error converting json message:", err)
				break
			}

			val, err := database.RDB.Get(ctx, "room:"+req.RoomId).Result()
			if err != nil {
				fmt.Println("Redis Reading Error", err)
			}

			var room structs.Room

			err = json.Unmarshal([]byte(val), &room)
			if err != nil {
				fmt.Println("Error converting json message:", err)
			}

			exists := false

			for _, client := range room.Clients {
				if client.Auth0Id == req.Auth0Id {
					exists = true
					break
				}
			}

			if !exists {
				room.Clients = append(room.Clients, structs.RoomUser{
					Auth0Id:  req.Auth0Id,
					Username: req.Username,
					Picture:  &req.Picture,
				})
			}

			data, err := json.Marshal(room)
			if err != nil {
				fmt.Println("Converting Object to JSON:", err)
			}

			err = database.RDB.Set(ctx, "room:"+req.RoomId, data, 0).Err()
			if err != nil {
				fmt.Println("Error while while saving data:", err)
			}

			err = conn.WriteJSON(map[string]any{
				"event": "room-joined",
				"data": map[string]any{
					"room":    room,
					"message": "room-joined",
				},
			})
		case "add-song":

		}

		fmt.Printf("Received: %s\\n", message)
		// Echo the message back to the client
		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			fmt.Println("Error writing message:")
			break
		}
	}
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

		val, geterr := database.RDB.Get(ctx, "logincache:"+c.GetHeader("Authorization")).Bytes()
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

		exists, err := database.CheckForUser(body.Email)
		if err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		}

		if !exists && body.Email != "" {
			_, createErr := database.CreateUser(structs.User{
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

		database.RDB.Set(ctx, "logincache:"+c.GetHeader("Authorization"), data, 30*time.Second)

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
		}
		data, _ := json.Marshal(newRoom)
		database.RDB.Set(ctx, "room:"+roomId, data, 0)
		database.RDB.SAdd(ctx, "rooms", newRoom.RoomId)
		c.JSON(201, gin.H{
			"message": "room created",
			"roomId":  roomId,
			"auth0Id": auth0Id,
		})
	})

	r.GET("/ws", func(c *gin.Context) {
		wsHandler(c.Writer, c.Request)
	})

	fmt.Println("Websocket server started")

	if err := database.ConnectDB(); err != nil {
		panic(err)
	}

	rediserr := database.ConnectRedis()
	if rediserr != nil {
		panic(rediserr)
	}

	r.Run(":8080")
}
