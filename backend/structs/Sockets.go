package structs

import (
	"encoding/json"

	"github.com/gorilla/websocket"
)

type BroadcastMessage struct {
	roomId  string
	Message []byte
}

type JoinRoomMessage struct {
	Auth0Id  string `json:"auth0Id"`
	RoomId   string `json:"roomId"`
	Username string `json:"username"`
	Picture  string `json:"picture"`
}

type WSMessage struct {
	Event   string          `json:"event"`
	Message json.RawMessage `json:"message"`
}

type Client struct {
	Conn *websocket.Conn
	Send chan []byte
	Info ClientInfo
}

type ClientInfo struct {
	Auth0Id string `json:"auth0Id"`
	RoomId  string `json:"roomId"`
}

type LikeSongMessage struct {
	SongId  string `json:"songId"`
	IsLiked bool   `json:"isLiked"`
}

type CurrentSongMessage struct {
	RoomId string `json:"roomId"`
}

type NextSongMessage struct {
	RoomId string `json:"roomId"`
}

type UpdateMasterTime struct {
	MasterTime MasterTime `json:"masterTime"`
	RoomId     string     `json:"roomId"`
}

type UpdatePlayingState struct {
	Playing bool `json:"playing"`
}
