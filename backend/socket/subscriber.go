package socket

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/Yashwant937363/QueueCast/backend/database/myredis"
	"github.com/Yashwant937363/QueueCast/backend/structs"
)

func StartRedisSubscriber() {
	pubsub := myredis.RDB.PSubscribe(
		context.Background(),
		"client-joined",
		"client-left",
	)

	ch := pubsub.Channel()

	go func() {
		for msg := range ch {
			fmt.Println("Received:", msg.Payload)

			switch msg.Channel {
			case "client-joined":
				var req structs.ClientJoinReq
				err := json.Unmarshal([]byte(msg.Payload), &req)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				for _, client := range Clients {
					if client.Info.RoomId == req.RoomId {
						SendEvent(client, msg.Channel, structs.ClientJoinRes{
							Client: req.Client,
						})
					}
				}
			case "client-left":
				var req structs.ClientLeftReq
				err := json.Unmarshal([]byte(msg.Payload), &req)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				for _, client := range Clients {
					if client.Info.RoomId == req.RoomId {
						SendEvent(client, msg.Channel, structs.ClientLeftRes{
							Auth0Id: req.Auth0Id,
						})
					}
				}
			}

		}
	}()
}

func SendEvent(client *structs.Client, event string, payload any) {
	data, err := json.Marshal(payload)
	if err != nil {
		return
	}

	client.Mu.Lock()
	defer client.Mu.Unlock()

	client.Conn.WriteJSON(structs.WSMessage{
		Event:   event,
		Message: data,
	})
}
