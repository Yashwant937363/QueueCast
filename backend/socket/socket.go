package socket

import "github.com/gorilla/websocket"

var rooms = map[string]map[*websocket.Conn]bool{}
