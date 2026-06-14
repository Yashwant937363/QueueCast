package structs

import (
	"encoding/json"
	"sync"

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
	Mu   sync.Mutex
	Info ClientInfo
}

type ClientInfo struct {
	Auth0Id string
	RoomId  string
}
