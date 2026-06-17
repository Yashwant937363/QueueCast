package socket

import (
	"context"
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
	fmt.Println("Step 1: Got Data from Client")
	fmt.Println("Data", req)

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
		Clients[conn].Info = structs.ClientInfo{
			Auth0Id: req.Auth0Id,
			RoomId:  req.RoomId,
		}

	}
	fmt.Println("Step 2: Publishing Client joined")
	PublishJSON(ctx, "client-joined", structs.ClientJoinReq{
		RoomId: req.RoomId,
		Client: structs.RoomUser{
			Auth0Id:  req.Auth0Id,
			Username: req.Username,
			Picture:  &req.Picture,
		},
	})

	SendEvent(
		Clients[conn],
		"room-joined",
		map[string]any{
			"room":    room,
			"message": "room-joined",
		},
	)
}

func PublishJSON(ctx context.Context, channel string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	count, err := myredis.RDB.Publish(ctx, channel, data).Result()
	if err != nil {
		return err
	}

	fmt.Printf("Published to %s, subscribers: %d\n", channel, count)

	return nil
}

func SendEvent(client *structs.Client, event string, payload any) {
	msgData, err := json.Marshal(payload)
	if err != nil {
		return
	}

	wsData, err := json.Marshal(structs.WSMessage{
		Event:   event,
		Message: msgData,
	})

	if err != nil {
		return
	}

	fmt.Println("Step 4: Got data for Sending")
	fmt.Println("Data: ", wsData)

	client.Send <- wsData
}
