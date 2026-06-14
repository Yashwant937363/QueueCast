package socket

import (
	"encoding/json"
	"fmt"

	"github.com/Yashwant937363/QueueCast/backend/database/myredis"
	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/gorilla/websocket"
)

func joinRoom(conn *websocket.Conn, msg structs.WSMessage) {
	var req structs.JoinRoomMessage
	err := json.Unmarshal(msg.Message, &req)
	if err != nil {
		fmt.Println("Error converting json message:", err)
		return
	}

	val, err := myredis.RDB.Get(ctx, "room:"+req.RoomId).Result()
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

	if !exists && req.Auth0Id != "" {
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

	err = myredis.RDB.Set(ctx, "room:"+req.RoomId, data, 0).Err()
	if err != nil {
		fmt.Println("Error while while saving data:", err)
	}

	if req.Auth0Id != "" {
		Clients[conn] = &structs.Client{
			Conn: conn,
			Info: structs.ClientInfo{
				Auth0Id: req.Auth0Id,
				RoomId:  req.RoomId,
			},
		}

	}

	myredis.PublishJSON(ctx, "client-joined", structs.ClientJoinReq{
		RoomId: req.RoomId,
		Client: structs.RoomUser{
			Auth0Id:  req.Auth0Id,
			Username: req.Username,
			Picture:  &req.Picture,
		},
	})

	err = conn.WriteJSON(map[string]any{
		"event": "room-joined",
		"data": map[string]any{
			"room":    room,
			"message": "room-joined",
		},
	})
}
