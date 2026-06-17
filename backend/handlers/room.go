package handlers

import (
	"context"
	"encoding/json"

	"github.com/Yashwant937363/QueueCast/backend/database/myredis"
	"github.com/Yashwant937363/QueueCast/backend/middleware"
	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/Yashwant937363/QueueCast/backend/utils"
	"github.com/gin-gonic/gin"
)

var ctx = context.Background()

func GetRooms(c *gin.Context) {
	roomIds, err := myredis.RDB.SMembers(ctx, "rooms").Result()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	keys := make([]string, 0, len(roomIds))

	for _, roomId := range roomIds {
		keys = append(keys, "room:"+roomId)
	}

	values, err := myredis.RDB.MGet(ctx, keys...).Result()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var rooms []structs.Room

	for _, value := range values {
		if value == nil {
			continue
		}

		var room structs.Room

		err := json.Unmarshal([]byte(value.(string)), &room)
		if err == nil {
			rooms = append(rooms, room)
		}
	}

	c.JSON(200, gin.H{
		"rooms": rooms,
	})
}

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

func CreateRoom(c *gin.Context) {
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

	roomId := utils.GenerateSecureID(5)

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
}
