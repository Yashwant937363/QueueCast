package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"sync"

	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/gorilla/websocket"
)

var rooms = make(map[string]*structs.Room)

type BroadcastMessage struct {
	RoomID  string
	Message []byte
}

type CreateRoomMessage struct {
	Email string `json:"email"`
}

type WSMessage struct {
	Event   string          `json:"event"`
	Message json.RawMessage `json:"message"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]bool) // Connected clients
var broadcast = make(chan BroadcastMessage)
var rw sync.RWMutex

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateSecureID(length int) string {
	b := make([]byte, length)
	for i := range b {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		b[i] = charset[num.Int64()]
	}
	return string(b)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading:", err)
		return
	}
	defer conn.Close()
	// Listen for incoming messages
	for {
		// Read message from the client
		_, message, err := conn.ReadMessage()

		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
		var msg WSMessage
		err = json.Unmarshal(message, &msg)
		if err != nil {
			fmt.Println("Error converting json message:", err)
			break
		}
		switch msg.Event {
		case "create-room":
			roomId := generateSecureID(8)
			var data CreateRoomMessage
			err = json.Unmarshal(msg.Message, &data)

			if err != nil {
				fmt.Println("Error converting json message:", err)
				break
			}
			rooms[roomId] = &structs.Room{Owner: data.Email}

			conn.WriteJSON(map[string]interface{}{
				"event":  "room-joined",
				"roomId": roomId,
			})
		case "join-room":
		case "add-song":

		}

		fmt.Printf("Received: %s\\n", message)
		// Echo the message back to the client
		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			fmt.Println("Error writing message:", err)
			break
		}
	}
}

func main() {

	// server.OnConnect("/", func(s socketio.Conn) error {
	// 	s.SetContext("")
	// 	fmt.Println("connected:", s.ID())
	// 	return nil
	// })

	// server.OnEvent("/", "create-room", func(s socketio.Conn, email string) {

	// })

	// server.OnEvent("/", "join-room", func(s socketio.Conn, roomId string) {
	// 	for _, room := range rooms {
	// 		if room.Id == roomId {
	// 			s.Join(roomId)
	// 			s.Emit("room-joined", roomId)
	// 			return
	// 		}
	// 	}

	// 	s.Emit("error", roomId)
	// })

	// server.OnEvent("/", "add-song", func(s socketio.Conn, roomId string, id string, url string) {
	// 	for i := range rooms {
	// 		if rooms[i].Id == roomId {
	// 			rooms[i].AddSong(structs.Song{Id: id, Url: url})
	// 			s.Emit("done", "song added")
	// 			return
	// 		}
	// 	}

	// 	s.Emit("error", roomId)
	// })

	http.HandleFunc("/ws", wsHandler)
	fmt.Println("WebSocket server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
