package handlers

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/Yashwant937363/QueueCast/backend/database/myredis"
	"github.com/Yashwant937363/QueueCast/backend/database/postgres"
	"github.com/Yashwant937363/QueueCast/backend/middleware"
	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type LoginRequest struct {
	Username    string `json:"username"`
	Email       string `json:"email"`
	Picture     string `json:"picture"`
	PrevGuestId string `json:"prevGuestId,omitempty"`
}

func migrateGuestLikesAcrossRooms(prevGuestId string, auth0Id string) {
	if prevGuestId == "" || !strings.HasPrefix(prevGuestId, "guest_") {
		return
	}

	roomIds, err := myredis.RDB.SMembers(ctx, "rooms").Result()
	if err != nil {
		return
	}

	for _, roomId := range roomIds {
		roomKey := "room:" + roomId
		val, err := myredis.RDB.Get(ctx, roomKey).Bytes()
		if err != nil {
			continue
		}

		var room structs.Room
		err = json.Unmarshal(val, &room)
		if err != nil {
			continue
		}

		roomModified := false
		updatedClients := make([]structs.RoomUser, 0, len(room.Clients))
		for _, client := range room.Clients {
			if client.Auth0Id == prevGuestId {
				roomModified = true
			} else {
				updatedClients = append(updatedClients, client)
			}
		}

		if roomModified {
			room.Clients = updatedClients
			data, _ := json.Marshal(room)
			myredis.RDB.Set(ctx, roomKey, data, 0)
		}

		for _, song := range room.Songs {
			likeKey := "room:" + roomId + ":song:" + song.Id + ":likes"
			guestLiked, _ := myredis.RDB.SIsMember(ctx, likeKey, prevGuestId).Result()
			if guestLiked {
				myredis.RDB.SRem(ctx, likeKey, prevGuestId)
				myredis.RDB.SAdd(ctx, likeKey, auth0Id)
			}
		}
	}
}

func LoginUser(c *gin.Context) {

	type LoginCache struct {
		Auth0Id string `json:"auth0Id"`
		Exists  bool   `json:"exists"`
	}

	val, geterr := myredis.RDB.Get(ctx, "logincache:"+c.GetHeader("Authorization")).Bytes()
	if geterr == redis.Nil {
		fmt.Println("key does not exist")
	} else if geterr != nil {
		fmt.Println(geterr)
	} else {
		var cacheData LoginCache

		err := json.Unmarshal(val, &cacheData)
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

	if body.PrevGuestId != "" {
		migrateGuestLikesAcrossRooms(body.PrevGuestId, auth0ID)
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
}
