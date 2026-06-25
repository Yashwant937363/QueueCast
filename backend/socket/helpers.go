package socket

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/Yashwant937363/QueueCast/backend/database/myredis"
	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/redis/go-redis/v9"
)

func GetRoom(roomId string) (*structs.Room, error) {
	val, err := myredis.RDB.Get(ctx, "room:"+roomId).Result()
	if err != nil {
		return nil, err
	}

	var room structs.Room
	if err := json.Unmarshal([]byte(val), &room); err != nil {
		return nil, err
	}

	return &room, nil
}

func SaveRoom(room *structs.Room) error {
	data, err := json.Marshal(room)
	if err != nil {
		return err
	}

	return myredis.RDB.Set(
		ctx,
		"room:"+room.RoomId,
		data,
		0,
	).Err()
}

func FindSong(room *structs.Room, songId string) (*structs.Song, bool) {
	for i := range room.Songs {
		if room.Songs[i].Id == songId {
			return &room.Songs[i], true
		}
	}
	return nil, false
}

func SendError(
	client *structs.Client,
	title string,
	message string,
	event string,
	id string,
) {
	SendEvent(client, "error", map[string]any{
		"title":   title,
		"message": message,
		"event":   event,
		"data": map[string]any{
			"id": id,
		},
	})
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

	fmt.Println("Step 4: Got data for Sending, Event: ", event)

	client.Send <- wsData
}

func GetNextSong(room *structs.Room) (*structs.NowPlaying, error) {

	if len(room.Songs) <= 0 {
		return nil, errors.New("Queue is Empty")
	}

	nsong := room.Songs[0]
	for _, song := range room.Songs {
		if song.Likes > nsong.Likes {
			nsong = song
		}
	}
	for i, song := range room.Songs {
		if song.Id == nsong.Id {
			room.Songs = append(room.Songs[:i], room.Songs[i+1:]...)
			break
		}
	}

	likeKey := "room:" + room.RoomId + ":song:" + nsong.Id + ":likes"
	err := myredis.RDB.Del(ctx, likeKey).Err()
	if err != nil {
		fmt.Println(err)
	}

	nowPlayingKey := "room:" + room.RoomId + ":now-playing"

	nowPlaying := structs.NowPlaying{
		Song: nsong,
		MasterTime: structs.MasterTime{
			CurrentTime: 0,
			Date:        int(time.Now().UnixMilli()),
			Duration:    0,
		},
		Playing: false,
	}

	data, _ := json.Marshal(nowPlaying)

	myredis.RDB.Set(ctx, nowPlayingKey, data, 0)
	SaveRoom(room)
	PublishJSON(ctx, "next-song", structs.NextSongReq{
		Song: nowPlaying.Song, RoomId: room.RoomId,
	})
	return &nowPlaying, nil
}

var ErrEmptyRedis = errors.New("Nothing Playing Please Wait")

func GetNowPlaying(roomId string) (*structs.NowPlaying, error) {
	nowPlayingKey := "room:" + roomId + ":now-playing"
	val, err := myredis.RDB.Get(ctx, nowPlayingKey).Result()
	var nowPlaying *structs.NowPlaying

	if err != nil {
		if err == redis.Nil {
			return nil, ErrEmptyRedis
		} else {
			return nil, errors.New("Something Went Wrong, Please Refresh")
		}
	} else {
		if err := json.Unmarshal([]byte(val), &nowPlaying); err != nil {
			fmt.Println("Current Song Socket:", "Something Went Wrong While Converting Now Playing Song From Redis")
			return nil, errors.New("Something Went Wrong, Please Refresh")
		}
	}
	return nowPlaying, nil
}

//Subcriber Helpers

func ParsePayload[T any](payload string) (*T, error) {
	var req T
	err := json.Unmarshal([]byte(payload), &req)
	if err != nil {
		return nil, err
	}
	return &req, nil
}

func BroadcastToRoom(roomId string, event string, data any) {
	for _, client := range Clients {
		if client.Info.RoomId == roomId {
			SendEvent(client, event, data)
		}
	}
}

func Broadcast(event string, data any) {
	for _, client := range Clients {
		SendEvent(client, event, data)
	}
}

func RemoveClientInfo(auth0Id string) {
	for _, client := range Clients {
		if client.Info.Auth0Id == auth0Id {
			Clients[client.Conn].Info = structs.ClientInfo{}
			return
		}
	}
}
