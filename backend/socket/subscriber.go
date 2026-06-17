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
			fmt.Println("Received in Sub:", msg.Payload)

			switch msg.Channel {
			case "client-joined":
				var req structs.ClientJoinReq
				err := json.Unmarshal([]byte(msg.Payload), &req)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				fmt.Println("Step 3: Got Data in Publisher")
				fmt.Println("Data", req)
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
					if client.Info.Auth0Id == req.Auth0Id {
						Clients[client.Conn] = &structs.Client{
							Conn: client.Conn,
							Send: make(chan []byte, 256),
							Info: structs.ClientInfo{},
						}
					}

				}

			}

		}
	}()
}
