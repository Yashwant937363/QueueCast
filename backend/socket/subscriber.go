package socket

import (
	"context"
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
		"next-song",
	)

	ch := pubsub.Channel()

	go func() {
		for msg := range ch {
			fmt.Println("Step 3: Got Data in Publisher")
			switch msg.Channel {
			case "client-joined":
				req, err := ParsePayload[structs.ClientJoinReq](msg.Payload)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				BroadcastToRoom(req.RoomId, msg.Channel, structs.ClientJoinRes{
					Client: req.Client,
				})
			case "client-left":
				req, err := ParsePayload[structs.ClientLeftReq](msg.Payload)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				BroadcastToRoom(req.RoomId, msg.Channel, structs.ClientLeftRes{
					Auth0Id: req.Auth0Id,
				})

				RemoveClientInfo(req.Auth0Id)
			case "song-added":
				req, err := ParsePayload[structs.SongAddedReq](msg.Payload)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				BroadcastToRoom(req.RoomId, msg.Channel, req.Song)
			case "like-song":
				req, err := ParsePayload[structs.LikeSongReq](msg.Payload)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				BroadcastToRoom(req.RoomId, msg.Channel, structs.LikeSongRes{
					Likes:  req.Likes,
					SongId: req.SongId,
				})
			case "new-room":
				req, err := ParsePayload[structs.NewRoomReq](msg.Payload)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}

				Broadcast(msg.Channel, structs.NewRoomRes{Room: req.Room})
			case "update-master-time":
				req, err := ParsePayload[structs.UpdateMasterTime](msg.Payload)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}
				BroadcastToRoom(req.RoomId, msg.Channel, req.MasterTime)
			case "update-player-state":
				req, err := ParsePayload[structs.UpdatePlayingStateReq](msg.Payload)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}
				BroadcastToRoom(req.RoomId, msg.Channel, req.Playing)
			case "next-song":
				req, err := ParsePayload[structs.NextSongReq](msg.Payload)
				if err != nil {
					fmt.Println("Error converting json message:", err)
					break
				}
				BroadcastToRoom(req.RoomId, msg.Channel, req.Song)
			}
		}
	}()
}
