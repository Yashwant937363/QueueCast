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
		"song-added",
		"like-song",
		"new-room",
		"update-master-time",
		"update-player-state",
	)

	ch := pubsub.Channel()

	go func() {
		for msg := range ch {
			fmt.Println("Step 3: Got Data in Publisher")
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
					if client.Info.Auth0Id == req.Auth0Id {
						Clients[client.Conn] = &structs.Client{
							Conn: client.Conn,
							Send: make(chan []byte, 256),
							Info: structs.ClientInfo{},
						}
					}

				}

			case "song-added":
				var req structs.SongAddedReq
				fmt.Println("Step 3: Got Song from Publisher")
				err := json.Unmarshal([]byte(msg.Payload), &req)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				for _, client := range Clients {
					if client.Info.RoomId == req.RoomId {
						SendEvent(client, msg.Channel, req.Song)
					}
				}
			case "like-song":
				var req structs.LikeSongReq
				fmt.Println("Step 3: Got Like from Publisher")
				err := json.Unmarshal([]byte(msg.Payload), &req)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				for _, client := range Clients {
					if client.Info.RoomId == req.RoomId {
						SendEvent(client, msg.Channel, structs.LikeSongRes{
							Likes:  req.Likes,
							SongId: req.SongId,
						})
					}
				}
			case "new-room":
				var req structs.NewRoomReq
				fmt.Println("Step 3: Got Like from Publisher")
				err := json.Unmarshal([]byte(msg.Payload), &req)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				for _, client := range Clients {
					SendEvent(client, msg.Channel, structs.NewRoomRes{
						Room: req.Room,
					})
				}
			case "update-master-time":
				var req structs.UpdateMasterTime
				fmt.Println("Step 3: Got Master Time from Publisher")
				err := json.Unmarshal([]byte(msg.Payload), &req)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				for _, client := range Clients {
					if client.Info.RoomId == req.RoomId {
						SendEvent(client, msg.Channel, req.MasterTime)
					}
				}

			case "update-player-state":
				var req structs.UpdatePlayingStateReq
				fmt.Println("Step 3: Got Playing State from Publisher")
				err := json.Unmarshal([]byte(msg.Payload), &req)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				for _, client := range Clients {
					if client.Info.RoomId == req.RoomId {
						SendEvent(client, msg.Channel, req.Playing)
					}
				}
			}

		}
	}()
}
