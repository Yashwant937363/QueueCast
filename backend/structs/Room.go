package structs

// type Room struct {
// 	Owner   string
// 	Clients map[*websocket.Conn]bool
// 	songs   []Song
// }

// func (r *Room) AddSong(s Song) {
// 	r.songs = append(r.songs, s)
// }

// func (r *Room) LikeSong(id string) {
// 	for i := range r.songs {
// 		if r.songs[i].Id == id {
// 			r.songs[i].likes++
// 		}
// 	}
// }

type RoomUser struct {
	Auth0Id  string  `json:"auth0Id" db:"auth0Id"`
	Username string  `json:"username" db:"username"`
	Picture  *string `json:"picture,omitempty" db:"picture"`
}

type Room struct {
	Name         string     `json:"name"`
	Owner        RoomUser   `json:"owner"`
	RoomId       string     `json:"roomId"`
	Limit        int        `json:"limit"`
	IsPrivate    bool       `json:"isPrivate"`
	IsMasterOnly bool       `json:"isMasterOnly"`
	Songs        []Song     `json:"songs"`
	Clients      []RoomUser `json:"clients"`
}
