package structs

import "github.com/gorilla/websocket"

type Room struct {
	Owner   string
	Clients map[*websocket.Conn]bool
	songs   []Song
}

func (r *Room) AddSong(s Song) {
	r.songs = append(r.songs, s)
}

func (r *Room) LikeSong(id string) {
	for i := range r.songs {
		if r.songs[i].Id == id {
			r.songs[i].likes++
		}
	}
}
