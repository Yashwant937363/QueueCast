package socket

import (
	"encoding/json"
	"errors"
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

	room, err := GetRoom(req.RoomId)
	if err != nil {
		SendError(Clients[conn], "Join Room", "Room Doesn't Exist", "", "")
		return
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

	err = SaveRoom(room)
	if err != nil {
		fmt.Println("Error while while saving data:", err)
		SendError(Clients[conn], "Join Room", "Something Went Wrong While Creating Room", "", "")
		return
	}

	if req.Auth0Id != "" {
		Clients[conn].Info = structs.ClientInfo{
			Auth0Id: req.Auth0Id,
			RoomId:  req.RoomId,
		}

	}
	fmt.Println("Step 2: Publishing Client joined")
	for i := range room.Songs {
		liked, _ := myredis.RDB.SIsMember(
			ctx,
			"room:"+req.RoomId+":song:"+room.Songs[i].Id+":likes",
			req.Auth0Id,
		).Result()

		room.Songs[i].IsLiked = liked
	}

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

func addSong(conn *websocket.Conn, msg structs.WSMessage) {
	var newSong structs.Song
	err := json.Unmarshal(msg.Message, &newSong)
	if err != nil {
		fmt.Println("Something went wrong while ummarshaling json for song")
	}

	client := Clients[conn]

	room, err := GetRoom(client.Info.RoomId)
	if err != nil {
		SendError(Clients[conn], "Join Room", "Room Doesn't Exist", "", "")
		return
	}

	_, exists := FindSong(room, newSong.Id)

	if exists == false {
		nowPlaying, err := GetNowPlaying(client.Info.RoomId)
		exists = err == nil && nowPlaying.Song.Id == newSong.Id
	}

	if !exists && newSong.Id != "" {
		room.Songs = append(room.Songs, newSong)
	} else {
		SendError(client, "Adding Song", "song already exists", "add-song", newSong.Id)
		return
	}

	err = SaveRoom(room)
	if err != nil {
		fmt.Println("Error while while saving data:", err)
		SendError(Clients[conn], "Add Song", "Something Went Wrong Adding Song", "", "")
		return
	}

	fmt.Println("Step 2: Publishing Song Added")
	PublishJSON(ctx, "song-added", structs.SongAddedReq{
		RoomId: client.Info.RoomId,
		Song:   newSong,
	})

}

func currentSong(conn *websocket.Conn, msg structs.WSMessage) {
	var req structs.CurrentSongMessage
	err := json.Unmarshal(msg.Message, &req)
	if err != nil {
		fmt.Println("Error converting json message:", err)
		return
	}
	client := Clients[conn]
	room, err := GetRoom(client.Info.RoomId)
	if err != nil {
		SendError(Clients[conn], "Join Room", "Room Doesn't Exist", "", "")
		return
	}

	val, err := GetNowPlaying(client.Info.RoomId)
	var nowPlaying *structs.NowPlaying

	if err != nil {
		if errors.Is(err, ErrEmptyRedis) {
			if room.Owner.Auth0Id == client.Info.Auth0Id {
				nowPlaying, err = GetNextSong(room)
			} else {
				SendError(client, "Current Song", err.Error(), "", "")

			}
		} else {
			SendError(client, "Current Song", err.Error(), "", "")
		}
	} else {
		nowPlaying = val
	}

	SendEvent(client, "current-song", nowPlaying)
}

func updatePlayingState(conn *websocket.Conn, msg structs.WSMessage) {
	var req structs.UpdatePlayingState
	err := json.Unmarshal(msg.Message, &req)
	if err != nil {
		fmt.Println("Error converting json message:", err)
		return
	}
	client := Clients[conn]
	nowPlaying, err := GetNowPlaying(client.Info.RoomId)
	if err != nil {
		fmt.Println(client.Info.RoomId + "Error Update Playing State: " + err.Error())
		return
	}

	nowPlaying.Playing = req.Playing

	nowPlayingKey := "room:" + client.Info.RoomId + ":now-playing"
	data, _ := json.Marshal(nowPlaying)

	myredis.RDB.Set(ctx, nowPlayingKey, data, 0)

	PublishJSON(ctx, "update-player-state", structs.UpdatePlayingStateReq{
		RoomId:  client.Info.RoomId,
		Playing: req.Playing,
	})
}

func updateMasterTime(msg structs.WSMessage) {
	var req structs.UpdateMasterTime
	err := json.Unmarshal(msg.Message, &req)
	if err != nil {
		fmt.Println("Error converting json message:", err)
		return
	}

	nowPlaying, err := GetNowPlaying(req.RoomId)

	if err != nil {
		fmt.Println(req.RoomId + "Error Update Master Time: " + err.Error())
		return
	}

	nowPlaying.MasterTime = req.MasterTime

	nowPlayingKey := "room:" + req.RoomId + ":now-playing"
	data, _ := json.Marshal(nowPlaying)

	myredis.RDB.Set(ctx, nowPlayingKey, data, 0)
	PublishJSON(ctx, "update-master-time", req)
}

func nextSong(conn *websocket.Conn, msg structs.WSMessage) {
	var req structs.NextSongMessage
	err := json.Unmarshal(msg.Message, &req)
	if err != nil {
		fmt.Println("Error converting json message:", err)
		return
	}
	client := Clients[conn]

	room, err := GetRoom(client.Info.RoomId)
	if err != nil {
		SendError(Clients[conn], "Join Room", "Room Doesn't Exist", "", "")
		return
	}
	nowPlaying, err := GetNextSong(room)
	if err != nil {
		SendError(client, "Next Song", err.Error(), "next-song", "")
		return
	}

	SendEvent(client, "next-song", nowPlaying.Song)
	PublishJSON(ctx, "next-song", structs.NextSongReq{
		Song: nowPlaying.Song, RoomId: client.Info.RoomId,
	})
}

func setSongLiked(conn *websocket.Conn, msg structs.WSMessage) {
	var likeSongMessage structs.LikeSongMessage
	err := json.Unmarshal(msg.Message, &likeSongMessage)
	if err != nil {
		fmt.Println("Something went wrong while ummarshaling json for like")
	}
	client := Clients[conn]
	room, err := GetRoom(client.Info.RoomId)
	if err != nil {
		SendError(Clients[conn], "Song Like", "Room Doesn't Exist", "", "")
		return
	}

	song, exists := FindSong(room, likeSongMessage.SongId)

	if !exists {
		SendError(client, "Like Song", "song doesn't exists", "like-song", "")
		return
	}

	likeKey := "room:" + client.Info.RoomId + ":song:" + likeSongMessage.SongId + ":likes"

	if likeSongMessage.IsLiked {
		myredis.RDB.SAdd(ctx, likeKey, client.Info.Auth0Id)
	} else {
		myredis.RDB.SRem(ctx, likeKey, client.Info.Auth0Id)
	}

	count, err := myredis.RDB.SCard(ctx, likeKey).Result()

	song.Likes = int32(count)

	err = SaveRoom(room)
	if err != nil {
		fmt.Println("Error while while saving data:", err)
		SendError(Clients[conn], "Like Song", "Something Went Wrong While Like Song", "", "")
		return
	}

	PublishJSON(ctx, "like-song", structs.LikeSongReq{
		Likes:  count,
		RoomId: room.RoomId,
		SongId: likeSongMessage.SongId,
	})
}
