package socket

import (
	"fmt"

	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/gorilla/websocket"
)

func WritePump(client *structs.Client) {
	defer func() {
		client.Conn.Close()
	}()

	for msg := range client.Send {
		err := client.Conn.WriteMessage(
			websocket.TextMessage,
			msg,
		)

		if err != nil {
			fmt.Println("Write error:", err)
			return
		}
	}
}
