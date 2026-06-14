package socket

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/Yashwant937363/QueueCast/backend/database/myredis"
	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/gorilla/websocket"
)

var ctx = context.Background()
var rooms = make(map[string]*structs.Room)

var Clients = make(map[*websocket.Conn]*structs.Client)
var broadcast = make(chan structs.BroadcastMessage)
var rw sync.RWMutex

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading:", err)
		return
	}
	Clients[conn] = &structs.Client{
		Conn: conn,
		Info: structs.ClientInfo{},
	}

	defer disconnect(conn)
	// Listen for incoming messages
	for {
		// Read message from the client
		_, message, err := conn.ReadMessage()

		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
		var msg structs.WSMessage
		err = json.Unmarshal(message, &msg)
		if err != nil {
			fmt.Println("Error converting json message:", err)
			break
		}
		switch msg.Event {

		case "join-room":
			joinRoom(conn, msg)
		case "add-song":

		}

		fmt.Printf("Received: %s\\n", message)
		// Echo the message back to the client
		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			fmt.Println("Error writing message:")
			break
		}
	}
}

func disconnect(conn *websocket.Conn) {
	info := Clients[conn].Info

	if info.Auth0Id != "" && info.RoomId != "" {

		val, err := myredis.RDB.Get(ctx, "room:"+info.RoomId).Result()
		if err == nil {
			var room structs.Room
			if err := json.Unmarshal([]byte(val), &room); err == nil {
				for i, client := range room.Clients {
					if client.Auth0Id == info.Auth0Id {
						room.Clients = append(room.Clients[:i], room.Clients[i+1:]...)
						break
					}
				}
				data, _ := json.Marshal(room)
				myredis.RDB.Set(ctx, "room:"+info.RoomId, data, 0)
			}
		}
	}

	myredis.PublishJSON(ctx, "client-left", structs.ClientLeftReq{
		RoomId:  info.RoomId,
		Auth0Id: info.Auth0Id,
	})

	delete(Clients, conn)
	conn.Close()
}
